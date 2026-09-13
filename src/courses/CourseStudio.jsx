import React, { useEffect, useRef, useState } from "react";
import { courseRequest, uploadCourseFile } from "./courseApi.js";
import CourseText from "./CourseText.jsx";
import "./courseStudio.css";

const EMPTY_COURSE = { title: "", subject: "", level: "", description: "", price_uzs: 0 };
const EMPTY_CONTENT = { theory: "", examples: [], exercises: [], questions: [], video_id: null, attachments: [] };
const MAX_FILE = 10 * 1024 * 1024;
const money = value => new Intl.NumberFormat("uz-UZ").format(Number(value) || 0);
const copy = value => JSON.parse(JSON.stringify(value));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let localId = 0;
export function courseItemId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  localId += 1;
  return `item-${Date.now().toString(36)}-${localId}`;
}
export function courseForm(course) {
  return Object.fromEntries(Object.keys(EMPTY_COURSE).map(key => [key, course?.[key] ?? EMPTY_COURSE[key]]));
}
export function lessonForm(lesson) {
  return {
    title: lesson?.title || "", is_preview: Boolean(lesson?.is_preview), status: lesson?.status || "draft",
    content: { ...copy(EMPTY_CONTENT), ...copy(lesson?.content || {}) },
  };
}
export function validateCourseDraft(form) {
  if (!form.title.trim()) return "Kurs nomini kiriting.";
  if (!form.subject.trim()) return "Fanni kiriting.";
  if (!form.level?.trim()) return "Sinf yoki darajani kiriting.";
  if (!Number.isSafeInteger(Number(form.price_uzs)) || Number(form.price_uzs) < 0 || Number(form.price_uzs) > 100000000) return "Narxni 0–100 000 000 oralig‘ida, butun so‘mda kiriting.";
  return "";
}
export function validateLessonDraft(draft) {
  if (!draft?.title?.trim()) return "Dars nomini kiriting.";
  const content = draft.content || {};
  if (["examples", "exercises", "questions"].some(key => (content[key] || []).length > 100)) return "Bitta darsda har bir turdan ko‘pi bilan 100 ta misol, mashq yoki test bo‘lsin.";
  if ((content.attachments || []).length > 20) return "Bitta darsga ko‘pi bilan 20 ta fayl biriktirish mumkin.";
  if (new TextEncoder().encode(JSON.stringify(content)).byteLength > 262144) return "Dars mazmuni juda katta. Uni bir nechta qisqa darsga ajrating.";
  if (draft.status === "published" && !content.theory?.trim() && !(content.examples || []).length && !(content.exercises || []).length && !(content.questions || []).length && !content.video_id && !(content.attachments || []).length) return "Darsni ochishdan oldin nazariya, video, misol, mashq, test yoki fayldan kamida bittasini kiriting.";
  for (const [index, example] of (content.examples || []).entries()) {
    if (!example.prompt.trim() || !example.solution.trim()) return `${index + 1}-misolning sharti va yechimini kiriting.`;
  }
  for (const [index, exercise] of (content.exercises || []).entries()) {
    if (!exercise.prompt.trim() || !exercise.answer.trim()) return `${index + 1}-mashqning sharti va tekshirish javobini kiriting.`;
  }
  for (const [index, question] of (content.questions || []).entries()) {
    if (!question.prompt.trim() || question.options?.length !== 4 || question.options.some(option => !option.trim())) return `${index + 1}-test savoli va uning to‘rtta javob variantini to‘ldiring.`;
    if (!Number.isInteger(question.correct_index) || question.correct_index < 0 || question.correct_index > 3) return `${index + 1}-testning to‘g‘ri javobini belgilang.`;
    if (new Set(question.options.map(option => option.trim())).size !== 4) return `${index + 1}-testning javob variantlari bir xil bo‘lmasin.`;
  }
  return "";
}
export function publishProblems(course, lessons) {
  const published = lessons.filter(lesson => lesson.status === "published");
  if (!published.length) return ["Kamida bitta darsni tayyorlab, dars holatini «O‘quvchiga ochiq» qilib saqlang."];
  if (Number(course?.price_uzs) > 0) {
    const previews = published.filter(lesson => lesson.is_preview).length;
    const errors = [];
    if (previews < 2 || previews > 3) errors.push("Pulli kursda 2 yoki 3 ta ochiq bepul dars bo‘lishi kerak.");
    if (!published.some(lesson => !lesson.is_preview)) errors.push("Bepul darslardan tashqari kamida bitta tayyor pulli dars ham kerak.");
    return errors;
  }
  return [];
}
export function bulkLessonTitles(text) {
  return text.split(/\r?\n/).map(title => title.trim()).filter(Boolean);
}
function TextField({ label, value, onChange, multiline = false, hint, ...rest }) {
  return <label className="cs-field"><span>{label}</span>{multiline ? <textarea value={value ?? ""} onChange={event => onChange(event.target.value)} {...rest} /> : <input value={value ?? ""} onChange={event => onChange(event.target.value)} {...rest} />}{hint && <small>{hint}</small>}</label>;
}
function Help({ children }) { return <p className="cs-help">{children}</p>; }

function TeacherPayments({ apiBase, token, courseId }) {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decision, setDecision] = useState(null);
  const [checked, setChecked] = useState(false);
  const [reason, setReason] = useState("");
  const controllers = useRef(new Set());
  const epoch = useRef(0);
  const lock = useRef(false);
  const focus = useRef(null);
  async function call(path, options = {}) {
    const controller = new AbortController(); controllers.current.add(controller);
    try { return await courseRequest(apiBase, token, path, { ...options, signal: controller.signal }); }
    finally { controllers.current.delete(controller); }
  }
  async function refresh(after = null, expectedEpoch = epoch.current) {
    const data = await call(`/api/kurslar/courses/${courseId}/payment-requests?status=pending&limit=30${after ? `&after_id=${encodeURIComponent(after)}` : ""}`);
    if (epoch.current !== expectedEpoch) return;
    setItems(previous => after ? [...previous, ...(data.items || []).filter(item => !previous.some(old => old.id === item.id))] : (data.items || []));
    setCursor(data.next_cursor ?? null);
  }
  async function load(after = null) {
    if (lock.current) return;
    lock.current = true; setLoading(true); setError("");
    const current = epoch.current;
    try { await refresh(after, current); }
    catch (failure) { if (current === epoch.current && failure.name !== "AbortError") setError(failure.message || "To‘lov so‘rovlari yuklanmadi."); }
    finally { if (current === epoch.current) { lock.current = false; setLoading(false); } }
  }
  useEffect(() => {
    epoch.current += 1; lock.current = false; setItems([]); setCursor(null); setDecision(null); setNotice(""); setError(""); load();
    return () => { epoch.current += 1; controllers.current.forEach(controller => controller.abort()); controllers.current.clear(); };
  }, [apiBase, token, courseId]);
  useEffect(() => {
    if (!decision) return;
    const previous = document.activeElement; focus.current?.focus();
    return () => { if (previous?.isConnected) previous.focus(); };
  }, [decision]);
  async function decide() {
    if (lock.current || !decision) return;
    if (decision.kind === "confirm" && !checked) return;
    if (decision.kind === "reject" && !reason.trim()) { setError("Rad etish sababini yozing."); return; }
    const current = epoch.current; lock.current = true; setLoading(true); setError("");
    try {
      const response = await call(`/api/kurslar/payment-requests/${decision.item.id}/${decision.kind}`, { method: "POST", body: decision.kind === "confirm" ? { confirmation: true } : { reason: reason.trim() } });
      if (current !== epoch.current) return;
      setNotice(decision.kind === "confirm" ? `To‘lov tasdiqlandi. Obuna ${response.access_until ? new Date(response.access_until).toLocaleDateString("uz-UZ") + " gacha" : "30 kunga"} ochildi.` : "So‘rov rad etildi. Sababi o‘quvchiga ko‘rinadi.");
      setItems(previous => previous.filter(item => item.id !== decision.item.id)); setDecision(null); setChecked(false); setReason("");
    } catch (failure) { if (current === epoch.current && failure.name !== "AbortError") setError(failure.message || "To‘lov holatini o‘zgartirib bo‘lmadi."); }
    finally { if (current === epoch.current) { lock.current = false; setLoading(false); } }
  }
  function openDecision(item, kind) { setDecision({ item, kind }); setChecked(false); setReason(""); setError(""); }
  return <section className="cs-card" aria-label="Kurs uchun to‘lov so‘rovlari">
    <div className="cs-section-heading"><div><h2>To‘lov so‘rovlari</h2><Help>Pul tushganini o‘zingiz tekshiring. O‘quvchining xabar yuborishi obunani ochmaydi.</Help></div><button type="button" className="cs-secondary" disabled={loading} onClick={() => load()}>Yangilash</button></div>
    {loading && <p className="cs-help" role="status">To‘lovlar tekshirilmoqda…</p>}{error && <p className="cs-error" role="alert">{error}</p>}{notice && <p className="cs-advice" role="status">{notice}</p>}
    <div className="cs-payments-list">{items.map(item => <article className="cs-payment" key={item.id}><div><strong>{item.user_name || `O‘quvchi ${item.user_id}`}</strong><p>{money(item.amount_uzs)} so‘m · {item.period_days || 30} kun</p><p className="cs-payment-meta">{item.created_at ? new Date(item.created_at).toLocaleString("uz-UZ") : ""}</p><p>To‘lov izohi: {item.reference || "—"}</p>{item.note && <p>{item.note}</p>}</div><div className="cs-actions"><button type="button" className="cs-primary" disabled={loading} onClick={() => openDecision(item, "confirm")}>Tekshirish va tasdiqlash</button><button type="button" className="cs-secondary" disabled={loading} onClick={() => openDecision(item, "reject")}>Rad etish</button></div></article>)}{!items.length && !loading && !error && <p className="cs-empty">Hozir kutilayotgan to‘lov so‘rovi yo‘q.</p>}</div>
    {cursor != null && <button type="button" className="cs-secondary" disabled={loading} onClick={() => load(cursor)}>Keyingi so‘rovlar</button>}
    {decision && <div className="cs-confirm-backdrop"><div className="cs-confirm" role="alertdialog" aria-modal="true" aria-labelledby="cs-payment-title" onKeyDown={event => {
      if (event.key === "Escape" && !loading) setDecision(null);
      if (event.key === "Tab") { const controls = Array.from(event.currentTarget.querySelectorAll("button:not(:disabled), input:not(:disabled), textarea:not(:disabled)")); const first = controls[0]; const last = controls[controls.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
    }}><h2 id="cs-payment-title">{decision.kind === "confirm" ? "To‘lovni tasdiqlash" : "So‘rovni rad etish"}</h2><p><strong>{decision.item.user_name || `O‘quvchi ${decision.item.user_id}`}</strong><br />{money(decision.item.amount_uzs)} so‘m · {decision.item.period_days || 30} kun<br />Izoh: {decision.item.reference || "—"}</p>
      {decision.kind === "confirm" ? <label className="cs-check"><input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} disabled={loading} /><span>Ushbu summa aynan shu o‘quvchi uchun kelib tushganini tekshirdim.</span></label> : <TextField label="Rad etish sababi" multiline value={reason} onChange={setReason} rows={3} maxLength={500} disabled={loading} />}
      {error && <p className="cs-error" role="alert">{error}</p>}<div className="cs-actions" style={{ marginTop: 20 }}><button ref={focus} type="button" className="cs-secondary" disabled={loading} onClick={() => setDecision(null)}>Qaytish</button><button type="button" className="cs-primary" disabled={loading || (decision.kind === "confirm" ? !checked : !reason.trim())} onClick={decide}>{loading ? "Saqlanmoqda…" : decision.kind === "confirm" ? "Tasdiqlash va obunani ochish" : "Rad etishni saqlash"}</button></div>
    </div></div>}
  </section>;
}

export default function CourseStudio({ apiBase, token, courseId = null, onBack, onSaved }) {
  const identity = `${apiBase || ""}\u0000${token || ""}\u0000${courseId || ""}`;
  const [boundIdentity, setBoundIdentity] = useState(null);
  const [course, setCourse] = useState(null);
  const [form, setForm] = useState(copy(EMPTY_COURSE));
  const [lessons, setLessons] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [draft, setDraft] = useState(null);
  const [bulk, setBulk] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [conflict, setConflict] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [preview, setPreview] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [names, setNames] = useState({});
  const [capabilities, setCapabilities] = useState(null);
  const requests = useRef(new Set());
  const generation = useRef(0);
  const operationLock = useRef(false);
  const confirmedRef = useRef(null);
  const lessonDirty = Boolean(draft && lesson && !same(draft, lessonForm(lesson)));
  const courseDirty = Boolean(course && !same({ ...form, price_uzs: Number(form.price_uzs) }, courseForm(course)));
  const newDirty = !course && !same(form, EMPTY_COURSE);
  const dirty = lessonDirty || courseDirty || newDirty || Boolean(bulk.trim()) || Boolean(videoUrl.trim());

  async function request(path, options = {}) {
    const controller = new AbortController(); requests.current.add(controller);
    try { return await courseRequest(apiBase, token, path, { ...options, signal: controller.signal }); }
    finally { requests.current.delete(controller); }
  }
  function clearFeedback() { setError(""); setNotice(""); setConflict(false); }
  function report(error) {
    if (error?.name === "AbortError") return;
    setConflict(error?.status === 409);
    setError(error?.status === 409 ? "Bu ma’lumot boshqa oynada yangilangan. Yozganlaringiz shu yerda saqlanib turibdi. Ularni nusxalab oling, keyin yangi nusxani yuklang." : (error?.message || "Amal bajarilmadi. Internetni tekshirib, qayta urinib ko‘ring."));
  }
  async function run(label, action) {
    if (operationLock.current) return;
    operationLock.current = true;
    const current = generation.current; setBusy(label); clearFeedback();
    try { await action(current); }
    catch (failure) { if (current === generation.current) report(failure); }
    finally { if (current === generation.current) { operationLock.current = false; setBusy(""); } }
  }
  async function loadDetail(id, { replaceForm = false } = {}) {
    const current = generation.current;
    const data = await request(`/api/kurslar/courses/${id}`);
    if (generation.current !== current) return null;
    if (!data.access?.owner) throw new Error("Bu kursni faqat uni yaratgan o‘qituvchi tahrirlay oladi.");
    setCourse(data.course); setLessons(data.lessons || []);
    if (replaceForm) setForm(courseForm(data.course));
    return data;
  }
  async function openLesson(id) {
    const current = generation.current;
    const data = await request(`/api/kurslar/lessons/${id}`);
    if (generation.current !== current) return;
    setLesson(data.lesson); setDraft(lessonForm(data.lesson)); setPreview(false); setVideoUrl("");
  }
  useEffect(() => {
    const current = ++generation.current;
    operationLock.current = true;
    setBoundIdentity(identity);
    requests.current.forEach(controller => controller.abort()); requests.current.clear();
    setCourse(null); setForm(copy(EMPTY_COURSE)); setLessons([]); setLesson(null); setDraft(null);
    setBulk(""); setVideoUrl(""); setNames({}); setConfirm(null); setPreview(false); setCapabilities(null); clearFeedback();
    setBusy("Kurs yuklanmoqda…");
    (async () => {
      try {
        if (!token) throw new Error("Kurs yaratish uchun hisobingizga kiring.");
        const settings = await request("/api/kurslar/capabilities");
        if (current !== generation.current) return;
        setCapabilities(settings);
        if (!settings.can_teach) throw new Error("Kurs yaratish o‘qituvchi hisobida mavjud.");
        if (courseId) await loadDetail(courseId, { replaceForm: true });
      } catch (failure) { if (current === generation.current) report(failure); }
      finally { if (current === generation.current) { operationLock.current = false; setBusy(""); } }
    })();
    return () => { generation.current += 1; requests.current.forEach(controller => controller.abort()); requests.current.clear(); };
  }, [apiBase, token, courseId]);
  useEffect(() => {
    if (!dirty && !busy) return;
    const handler = event => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, busy]);
  useEffect(() => {
    if (!confirm) return;
    const previous = document.activeElement;
    confirmedRef.current?.focus();
    return () => { if (previous?.isConnected) previous.focus(); };
  }, [confirm]);

  function updateForm(key, value) { setForm(previous => ({ ...previous, [key]: value })); }
  function updateDraft(key, value) { setDraft(previous => ({ ...previous, [key]: value })); }
  function content(key, value) { setDraft(previous => ({ ...previous, content: { ...previous.content, [key]: value } })); }
  function changeItem(kind, index, key, value) {
    setDraft(previous => ({ ...previous, content: { ...previous.content, [kind]: previous.content[kind].map((item, i) => i === index ? { ...item, [key]: value } : item) } }));
  }
  function addItem(kind, item) { content(kind, [...draft.content[kind], item]); }
  function removeItem(kind, index) { content(kind, draft.content[kind].filter((_, i) => index !== i)); }
  function chooseLesson(id) {
    if (busy || id === lesson?.id) return;
    if (lessonDirty || videoUrl.trim()) { setConfirm({ kind: "switch", id }); return; }
    run("Dars yuklanmoqda…", () => openLesson(id));
  }
  function back() {
    if (busy) return;
    if (dirty) { setConfirm({ kind: "back" }); return; }
    onBack?.();
  }
  async function saveCourse() {
    const validation = validateCourseDraft(form);
    if (validation) { setError(validation); return; }
    await run("Kurs saqlanmoqda…", async current => {
      const payload = { ...form, price_uzs: Number(form.price_uzs) };
      const data = await request(course ? `/api/kurslar/courses/${course.id}` : "/api/kurslar/courses", { method: course ? "PUT" : "POST", body: course ? { ...payload, version: course.version } : payload });
      if (generation.current !== current) return;
      setCourse(data.course); setForm(courseForm(data.course)); setNotice("Kurs ma’lumotlari saqlandi. Endi darslarni tayyorlashingiz mumkin.");
      onSaved?.(data.course);
    });
  }
  async function addLessons() {
    const titles = bulkLessonTitles(bulk);
    if (titles.length + lessons.length > 500) { setError("Kursda ko‘pi bilan 500 ta dars bo‘lishi mumkin."); return; }
    if (!titles.length || titles.length > 100) { setError("Har qatorga bitta dars nomini yozing. Bir safar 1–100 ta dars qo‘shish mumkin."); return; }
    await run("Darslar qo‘shilmoqda…", async current => {
      await request(`/api/kurslar/courses/${course.id}/lessons`, { method: "POST", body: { titles } });
      if (generation.current !== current) return;
      setBulk(""); await loadDetail(course.id); setNotice(`${titles.length} ta dars qoralamasi qo‘shildi. Darsni tanlab, ichini to‘ldiring.`);
    });
  }
  async function moveLesson(index, direction) {
    if (lessonDirty || videoUrl.trim()) { setError("Dars tartibini almashtirishdan oldin ochiq darsni saqlang."); return; }
    const ordered = [...lessons]; const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    await run("Darslar tartibi saqlanmoqda…", async current => {
      const data = await request(`/api/kurslar/courses/${course.id}/reorder`, { method: "POST", body: { lesson_ids: ordered.map(item => item.id), version: course.version } });
      if (generation.current !== current) return;
      setCourse(data.course);
      await loadDetail(course.id);
      if (generation.current !== current) return;
      if (lesson) await openLesson(lesson.id);
      if (generation.current === current) setNotice("Darslar tartibi saqlandi.");
    });
  }
  async function persistLesson() {
    const current = generation.current;
    if (videoUrl.trim()) throw new Error("Video havolasi hali biriktirilmagan. «Videoni biriktirish»ni bosing yoki havola maydonini tozalang.");
    const validation = validateLessonDraft(draft); if (validation) throw new Error(validation);
    const data = await request(`/api/kurslar/lessons/${lesson.id}`, { method: "PUT", body: { ...draft, version: lesson.version } });
    if (current !== generation.current) throw new DOMException("Aborted", "AbortError");
    setLesson(data.lesson); setDraft(lessonForm(data.lesson));
    await loadDetail(course.id);
    if (current !== generation.current) throw new DOMException("Aborted", "AbortError");
    return data.lesson;
  }
  async function saveLesson() {
    await run("Dars saqlanmoqda…", async current => {
      await persistLesson();
      if (generation.current !== current) return;
      setNotice(draft.status === "published" ? "Dars saqlandi. Kurs nashr qilingan bo‘lsa, ruxsatli o‘quvchilarga ko‘rinadi." : "Dars qoralamasi saqlandi. O‘quvchilarga hali ko‘rinmaydi.");
    });
  }
  function askPublish() {
    clearFeedback();
    if (courseDirty || lessonDirty || bulk.trim() || videoUrl.trim()) { setError("Nashr qilishdan oldin kurs va darsdagi o‘zgarishlarni saqlang, yozilgan yangi darslarni qo‘shing."); return; }
    const errors = publishProblems(course, lessons);
    if (errors.length) { setError(errors.join(" ")); return; }
    setConfirm({ kind: "publish" });
  }
  async function confirmAction(save = false) {
    const action = confirm; setConfirm(null);
    await run("Bajarilmoqda…", async current => {
      if (action.kind === "switch") {
        if (save) await persistLesson();
        if (current !== generation.current) return;
        await openLesson(action.id); return;
      }
      if (action.kind === "back") { onBack?.(); return; }
      if (action.kind === "reload") {
        await loadDetail(course.id, { replaceForm: true });
        if (current !== generation.current) return;
        if (lesson) await openLesson(lesson.id); return;
      }
      if (action.kind === "publish" || action.kind === "archive") {
        const data = await request(`/api/kurslar/courses/${course.id}/${action.kind}`, { method: "POST", body: { version: course.version } });
        if (generation.current !== current) return;
        setCourse(data.course); setForm(courseForm(data.course));
        setNotice(action.kind === "publish" ? "Kurs nashr qilindi. Endi o‘quvchilar uni topib, bepul darslarni o‘qiy oladi." : "Kurs arxivlandi. Ma’lumotlar saqlandi; kursga kirish va yangi to‘lovlar yopildi.");
        onSaved?.(data.course);
      }
    });
  }
  async function linkVideo() {
    if (!videoUrl.trim()) { setError("YouTube havolasini kiriting."); return; }
    await run("Video biriktirilmoqda…", async current => {
      const data = await request(`/api/kurslar/courses/${course.id}/videos/link`, { method: "POST", body: { url: videoUrl.trim() } });
      if (generation.current !== current) return;
      if (!data.asset?.id || data.asset.status !== "ready") throw new Error("Video havolasi biriktirilmadi. Havolani tekshirib qayta urinib ko‘ring.");
      content("video_id", data.asset.id); setVideoUrl("");
      setNotice("Video biriktirildi. Uni darsga saqlash uchun «Darsni saqlash»ni bosing.");
    });
  }
  async function uploadAttachment(file) {
    if (!file) return;
    if (draft.content.attachments.length >= 20) { setError("Bitta darsga ko‘pi bilan 20 ta fayl biriktirish mumkin."); return; }
    if (file.size <= 0 || file.size > MAX_FILE || !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("10 MB gacha PDF, JPG, PNG yoki WebP fayl tanlang."); return; }
    await run("Fayl yuklanmoqda…", async current => {
      const controller = new AbortController(); requests.current.add(controller);
      try {
        const data = await uploadCourseFile(apiBase, token, course.id, file, { signal: controller.signal });
        if (generation.current !== current) return;
        if (!data.asset?.id || data.asset.status !== "ready") throw new Error("Fayl hali tayyor emas. Qayta urinib ko‘ring.");
        content("attachments", [...new Set([...draft.content.attachments, data.asset.id])]);
        setNames(previous => ({ ...previous, [data.asset.id]: file.name }));
        setNotice("Fayl yuklandi. Uni darsga biriktirish uchun darsni saqlang.");
      } finally { requests.current.delete(controller); }
    });
  }
  const readyLessons = lessons.filter(item => item.status === "published");
  const previewCount = readyLessons.filter(item => item.is_preview).length;
  const contentCounts = draft && `${draft.content.examples.length} misol · ${draft.content.exercises.length} mashq · ${draft.content.questions.length} test`;
  const noAccess = !token || capabilities?.can_teach === false || Boolean(courseId && !course);

  if (boundIdentity !== identity) return <section className="course-studio" aria-busy="true"><p role="status">Kurs ustaxonasi yuklanmoqda…</p></section>;
  return <section className="course-studio" aria-label="O‘qituvchining kurs ustaxonasi" aria-busy={Boolean(busy)}>
    <header className="cs-heading"><div><p className="cs-eyebrow">KURSLAR VA TO‘GARAKLAR</p><h1>{course ? "Kurs ustaxonasi" : "Yangi kurs"}</h1><Help>Kursni tayyorlang, darslarni tartiblang va o‘quvchilarga oching.</Help></div><button type="button" className="cs-secondary" onClick={back} disabled={Boolean(busy)}>← Kurslarga qaytish</button></header>
    <div className="cs-feedback" aria-live="polite">{busy && <p role="status">{busy}</p>}{notice && <p className="cs-success" role="status">{notice}</p>}{error && <div className="cs-error" role="alert">{error}{conflict && course && <button type="button" onClick={() => setConfirm({ kind: "reload" })} disabled={Boolean(busy)}>Yangi nusxani yuklash</button>}</div>}</div>
    {!noAccess && <>
      <section className="cs-card">
        <div className="cs-section-heading"><div><h2>1. Kurs haqida</h2><Help>O‘quvchi kursni shu ma’lumotlar orqali topadi.</Help></div>{course && <span className={`cs-badge cs-badge-${course.status}`}>{course.status === "published" ? "Nashr qilingan" : course.status === "archived" ? "Arxivda" : "Qoralama"}</span>}</div>
        <fieldset disabled={Boolean(busy)} className="cs-fields">
          <TextField label="Kurs nomi" value={form.title} onChange={value => updateForm("title", value)} maxLength={180} placeholder="Masalan, 7-sinf algebra: tushunib yechamiz" />
          <div className="cs-grid-three"><TextField label="Fan" value={form.subject} onChange={value => updateForm("subject", value)} maxLength={100} placeholder="Matematika" /><TextField label="Sinf yoki daraja" value={form.level} onChange={value => updateForm("level", value)} maxLength={100} placeholder="7-sinf / boshlang‘ich" /><TextField label="30 kunlik narx, so‘m" value={form.price_uzs} onChange={value => updateForm("price_uzs", value)} type="number" min="0" max="100000000" step="1" inputMode="numeric" hint="0 yozilsa, kurs bepul bo‘ladi." /></div>
          <TextField label="Kursda nimalar o‘rganiladi?" value={form.description} onChange={value => updateForm("description", value)} multiline rows={4} maxLength={6000} placeholder="Kimlar uchun, nimalarni o‘rganadi va darslar qanday o‘tilishini yozing." />
          <div className="cs-actions"><button type="button" className="cs-primary" onClick={saveCourse} disabled={!capabilities?.can_teach}>{course ? "Kurs ma’lumotlarini saqlash" : "Kursni yaratish"}</button>{courseDirty && <span className="cs-unsaved">Saqlanmagan o‘zgarish bor</span>}</div>
        </fieldset>
        {course && Number(course.price_uzs) > 0 && <p className="cs-advice">To‘lov kursdan tashqarida amalga oshiriladi. O‘quvchi to‘lov haqida xabar yuboradi; pul tushganini tekshirib tasdiqlaganingizdan keyin 30 kunlik obuna ochiladi.</p>}
      </section>
      {course && <div className="cs-workspace">
        <aside className="cs-card cs-outline" aria-label="Kurs dasturi">
          <h2>2. Kurs dasturi</h2><Help>{lessons.length} ta dars · {readyLessons.length} tasi tayyor · {previewCount} tasi bepul sinov</Help>
          <div className="cs-outline-list">{lessons.map((item, index) => <div key={item.id} className={`cs-outline-row ${item.id === lesson?.id ? "is-selected" : ""}`}><button type="button" className="cs-lesson-choice" onClick={() => chooseLesson(item.id)} disabled={Boolean(busy)} aria-current={item.id === lesson?.id ? "step" : undefined}><span className="cs-number">{index + 1}</span><span><strong>{item.title}</strong><small>{item.status === "draft" ? "Qoralama" : item.is_preview ? "Bepul sinov" : Number(course.price_uzs) === 0 ? "Bepul dars" : "Obuna bilan"}</small></span></button><div className="cs-move"><button type="button" disabled={Boolean(busy) || lessonDirty || Boolean(videoUrl.trim()) || index === 0} onClick={() => moveLesson(index, -1)} aria-label={`${item.title}: yuqoriga`}>↑</button><button type="button" disabled={Boolean(busy) || lessonDirty || Boolean(videoUrl.trim()) || index === lessons.length - 1} onClick={() => moveLesson(index, 1)} aria-label={`${item.title}: pastga`}>↓</button></div></div>)}{!lessons.length && <p className="cs-empty">Avval dars nomlarini kiriting. Keyin har birini tanlab, mazmunini to‘ldiring.</p>}</div>
          <fieldset disabled={Boolean(busy)} className="cs-fields"><TextField label="Darslarni birdan qo‘shish" multiline rows={5} value={bulk} onChange={setBulk} placeholder={"Sonlar va amallar\nOddiy kasrlar\nKasrlarni qo‘shish"} hint="Har qator — bitta mavzu. Bo‘lim nomini dars nomiga qo‘shishingiz mumkin: «1-bo‘lim · Kasrlar»." /><button type="button" className="cs-secondary" onClick={addLessons} disabled={!bulk.trim()}>+ {bulkLessonTitles(bulk).length || ""} ta dars qo‘shish</button></fieldset>
        </aside>
        <main className="cs-card cs-editor">
          {!draft ? <div className="cs-start"><span aria-hidden="true">✎</span><h2>3. Darsni tayyorlang</h2><p>Ro‘yxatdan darsni tanlang. Video, nazariya, misol va mashqlarni shu yerda joylaysiz.</p></div> : <>
            <div className="cs-section-heading"><div><h2>3. Dars mazmuni</h2><Help>{contentCounts}</Help></div><button type="button" className="cs-secondary" onClick={() => setPreview(!preview)} disabled={Boolean(busy)}>{preview ? "Tahrirga qaytish" : "Dars ko‘rinishi"}</button></div>
            {preview ? <div className="cs-preview"><p className="cs-advice">Saqlashdan oldingi ko‘rinish. O‘quvchiga test kaliti va mashq javobi oldindan ko‘rinmaydi.</p><h3>{draft.title}</h3>{draft.content.video_id && <p className="cs-video-ready">▶ Video biriktirilgan. Saqlangan darsni kurs sahifasida ochib ko‘rishingiz mumkin.</p>}{draft.content.theory && <CourseText className="cs-plain-text" text={draft.content.theory} />}{draft.content.examples.map((example, index) => <article key={index} className="cs-item"><h4>{index + 1}-misol</h4><CourseText className="cs-plain-text" text={example.prompt} /><details><summary>Yechimini ko‘rish</summary><CourseText className="cs-plain-text" text={example.solution} /></details></article>)}{draft.content.exercises.map((exercise, index) => <article key={exercise.id} className="cs-item"><h4>{index + 1}-mashq</h4><CourseText className="cs-plain-text" text={exercise.prompt} /><p className="cs-help">O‘quvchi bu yerga javob yozib tekshiradi.</p></article>)}<p>{draft.content.questions.length} ta test savoli · {draft.content.attachments.length} ta fayl</p></div> : <fieldset disabled={Boolean(busy)} className="cs-fields">
              <TextField label="Dars nomi" value={draft.title} onChange={value => updateDraft("title", value)} maxLength={200} />
              <div className="cs-grid-two"><label className="cs-field"><span>Dars holati</span><select value={draft.status} onChange={event => updateDraft("status", event.target.value)}><option value="draft">Qoralama — hali tayyor emas</option><option value="published">O‘quvchiga ochiq — tayyor</option></select></label><label className="cs-check"><input type="checkbox" checked={draft.is_preview} onChange={event => updateDraft("is_preview", event.target.checked)} /><span>Bepul sinov darsi<small>Pulli kursda 2 yoki 3 ta tayyor darsni belgilang.</small></span></label></div>
              <section className="cs-editor-section"><h3>Video</h3><Help>YouTube havolasini joylang. Video o‘quvchiga shu sayt ichida ochiladi.</Help>
                <p className="cs-advice">YouTube uchun alohida pulli video xizmati ulanmaydi. Havolasi bor odam videoni boshqalarga yuborishi mumkin; ekran yoki ovoz yozuvini to‘liq bloklash kafolatlanmaydi.</p>
                {draft.content.video_id && <div className="cs-asset"><span>▶ Video biriktirilgan</span><button type="button" onClick={() => content("video_id", null)}>Darsdan ajratish</button></div>}
                <TextField label="YouTube video havolasi" value={videoUrl} onChange={setVideoUrl} type="url" placeholder="https://www.youtube.com/watch?v=..." hint="Videoni YouTube’da havola orqali ko‘riladigan qilib joylashingiz mumkin. Videoni o‘rnatishga ruxsat yoqilgan bo‘lsin." />
                <button type="button" className="cs-secondary" onClick={linkVideo} disabled={!videoUrl.trim()}>{draft.content.video_id ? "Videoni almashtirish" : "Videoni biriktirish"}</button>
              </section>
              <section className="cs-editor-section"><h3>Nazariya</h3><TextField label="Mavzuni tushuntiring" multiline rows={9} value={draft.content.theory} onChange={value => content("theory", value)} maxLength={100000} placeholder="Asosiy qoida, izoh va o‘quvchi eslab qolishi kerak bo‘lgan narsalarni yozing." hint="Matnni xatboshilar bilan yozing. Formulani $x^2 + y^2$ shaklida kiritishingiz mumkin." /></section>
              <section className="cs-editor-section"><div className="cs-section-heading"><h3>Yechilgan misollar</h3><button type="button" className="cs-secondary" disabled={draft.content.examples.length >= 100} onClick={() => addItem("examples", { prompt: "", solution: "" })}>+ Misol</button></div><Help>Avval shart, keyin tushunarli qadamlar bilan yechim.</Help>{draft.content.examples.map((example, index) => <article className="cs-item" key={index}><div className="cs-section-heading"><h4>{index + 1}-misol</h4><button type="button" className="cs-remove" onClick={() => removeItem("examples", index)} aria-label={`${index + 1}-misolni olib tashlash`}>Olib tashlash</button></div><TextField label="Misol sharti" multiline rows={3} value={example.prompt} onChange={value => changeItem("examples", index, "prompt", value)} maxLength={6000} /><TextField label="Bosqichma-bosqich yechim" multiline rows={5} value={example.solution} onChange={value => changeItem("examples", index, "solution", value)} maxLength={12000} /></article>)}</section>
              <section className="cs-editor-section"><div className="cs-section-heading"><h3>Mustaqil mashqlar</h3><button type="button" className="cs-secondary" disabled={draft.content.exercises.length >= 100} onClick={() => addItem("exercises", { id: courseItemId(), prompt: "", answer: "", explanation: "" })}>+ Mashq</button></div><Help>Bu bo‘lim aniq qisqa javobni tekshiradi. Batafsil yozma ishni avtomatik baholaydi deb hisoblamang.</Help>{draft.content.exercises.map((exercise, index) => <article key={exercise.id} className="cs-item"><div className="cs-section-heading"><h4>{index + 1}-mashq</h4><button type="button" className="cs-remove" onClick={() => removeItem("exercises", index)}>Olib tashlash</button></div><TextField label="Mashq sharti" multiline rows={3} value={exercise.prompt} onChange={value => changeItem("exercises", index, "prompt", value)} maxLength={6000} /><TextField label="Tekshirish uchun to‘g‘ri javob" value={exercise.answer} onChange={value => changeItem("exercises", index, "answer", value)} maxLength={2000} hint="Masalan: 42. Javob o‘quvchiga tekshirishdan oldin yuborilmaydi." /><TextField label="Tekshirgandan keyingi tushuntirish" multiline rows={3} value={exercise.explanation} onChange={value => changeItem("exercises", index, "explanation", value)} maxLength={10000} /></article>)}</section>
              <section className="cs-editor-section"><div className="cs-section-heading"><h3>Test savollari</h3><button type="button" className="cs-secondary" disabled={draft.content.questions.length >= 100} onClick={() => addItem("questions", { id: courseItemId(), prompt: "", options: ["", "", "", ""], correct_index: null, explanation: "", difficulty: "medium" })}>+ Test savoli</button></div><Help>Har savolda 4 variant va bitta to‘g‘ri javob. O‘quvchi bu mavzudan yoki o‘qigan mavzularidan aralash test ishlaydi.</Help>{draft.content.questions.map((question, index) => <article key={question.id} className="cs-item"><div className="cs-section-heading"><h4>{index + 1}-savol</h4><button type="button" className="cs-remove" onClick={() => removeItem("questions", index)}>Olib tashlash</button></div><TextField label="Savol matni" multiline rows={3} value={question.prompt} onChange={value => changeItem("questions", index, "prompt", value)} maxLength={6000} /><fieldset className="cs-options"><legend>Javob variantlari — to‘g‘risini belgilang</legend>{question.options.map((option, optionIndex) => <div className="cs-option" key={optionIndex}><label><input type="radio" name={`correct-${question.id}`} checked={question.correct_index === optionIndex} onChange={() => changeItem("questions", index, "correct_index", optionIndex)} /><span>{"ABCD"[optionIndex]}</span><span className="cs-sr-only">to‘g‘ri javob</span></label><input aria-label={`${index + 1}-savol, ${"ABCD"[optionIndex]} varianti`} value={option} maxLength={2000} onChange={event => changeItem("questions", index, "options", question.options.map((old, i) => i === optionIndex ? event.target.value : old))} /></div>)}</fieldset><label className="cs-field"><span>Qiyinlik</span><select value={question.difficulty} onChange={event => changeItem("questions", index, "difficulty", event.target.value)}><option value="easy">Oson</option><option value="medium">O‘rtacha</option><option value="hard">Qiyin</option></select></label><TextField label="Javob izohi" multiline rows={3} value={question.explanation} onChange={value => changeItem("questions", index, "explanation", value)} maxLength={10000} /></article>)}</section>
              <section className="cs-editor-section"><h3>Qo‘shimcha fayllar</h3><Help>PDF, JPG, PNG yoki WebP. Har biri 10 MB gacha. Faylni faqat shu darsga kirish huquqi bor o‘quvchi ochadi.</Help>{draft.content.attachments.map(assetId => <div className="cs-asset" key={assetId}><span>{names[assetId] || `Biriktirilgan fayl · ${String(assetId).slice(0, 8)}`}</span><button type="button" onClick={() => content("attachments", draft.content.attachments.filter(id => id !== assetId))}>Darsdan ajratish</button></div>)}<label className="cs-upload"><span>+ PDF yoki rasm yuklash</span><input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; uploadAttachment(file); }} /></label></section>
            </fieldset>}
            <div className="cs-save-bar"><div><strong>{lessonDirty ? "Saqlanmagan o‘zgarishlar" : "Dars saqlangan"}</strong><small>{draft.status === "draft" ? "Qoralama o‘quvchiga ko‘rinmaydi." : "Tayyor dars; kurs nashr qilingach ko‘rinadi."}</small></div><button type="button" className="cs-primary" disabled={Boolean(busy)} onClick={saveLesson}>Darsni saqlash</button></div>
          </>}
        </main>
      </div>}
      {course && Number(course.price_uzs) > 0 && <TeacherPayments key={course.id} apiBase={apiBase} token={token} courseId={course.id} />}
      {course && <section className="cs-card cs-publish"><div><h2>4. Kursni o‘quvchilarga ochish</h2><Help>{Number(course.price_uzs) > 0 ? `${money(course.price_uzs)} so‘m / 30 kun. 2–3 ta bepul dars, qolganlari obuna bilan ochiladi.` : "Bepul kurs: o‘quvchi hisobiga kirib qo‘shiladi."} Bepul sinov darslari uchun kurs paroli kerak emas. To‘lov tasdiqlanganidan keyin pulli darslar ochiladi.</Help></div><div className="cs-actions"><button type="button" className="cs-primary" disabled={Boolean(busy)} onClick={askPublish}>{course.status === "published" ? "Nashr holatini tekshirish" : "Kursni nashr qilish"}</button>{course.status === "published" && <button type="button" className="cs-secondary" disabled={Boolean(busy) || dirty} onClick={() => setConfirm({ kind: "archive" })}>Kursni arxivlash</button>}</div></section>}
    </>}
    {confirm && <div className="cs-confirm-backdrop"><div className="cs-confirm" role="alertdialog" aria-modal="true" aria-labelledby="cs-confirm-title" onKeyDown={event => { if (event.key === "Escape") setConfirm(null); if (event.key === "Tab") { const buttons = Array.from(event.currentTarget.querySelectorAll("button:not(:disabled)")); const first = buttons[0]; const last = buttons[buttons.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } } }}>
      <h2 id="cs-confirm-title">{confirm.kind === "publish" ? "Kursni nashr qilamizmi?" : confirm.kind === "archive" ? "Kursni arxivlaysizmi?" : "Saqlanmagan yozuvlar bor"}</h2>
      <p>{confirm.kind === "publish" ? "Tayyor darslar o‘quvchilarga chiqadi. Bepul sinov darslarini hamma ko‘ra oladi; pulli darslar obunaga bog‘lanadi." : confirm.kind === "archive" ? "Arxivlangan kursga o‘quvchilar, jumladan obunasi faol bo‘lganlar ham kira olmaydi. Darslar va natijalar saqlanadi." : confirm.kind === "reload" ? "Yangi nusxani yuklash bu oynadagi saqlanmagan o‘zgarishlarni almashtiradi. Kerakli matnlarni avval nusxalab oling." : "Saqlamasdan davom etsangiz, bu oynadagi tegishli o‘zgarishlar yo‘qoladi."}</p>
      <div className="cs-actions"><button ref={confirmedRef} type="button" className="cs-secondary" onClick={() => setConfirm(null)}>Qaytish</button>{confirm.kind === "switch" && <button type="button" className="cs-primary" onClick={() => confirmAction(true)}>Saqlash va o‘tish</button>}<button type="button" className={confirm.kind === "publish" ? "cs-primary" : "cs-secondary"} onClick={() => confirmAction(false)}>{confirm.kind === "publish" ? "Ha, nashr qilish" : confirm.kind === "archive" ? "Ha, arxivlash" : confirm.kind === "reload" ? "O‘zgarishlarni tashlab, yuklash" : "Saqlamasdan davom etish"}</button></div>
    </div></div>}
  </section>;
}
