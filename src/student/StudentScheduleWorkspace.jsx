import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./student-schedule.css";

const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const TYPES = [["lesson", "Yangi mavzu"], ["review", "Takrorlash"], ["problem", "Masala yechish"], ["control", "Nazorat ishi"], ["project", "Loyiha ishi"], ["oral", "Og‘zaki mashq"]];
const CLUBS = [["chess", "♟", "Shaxmat"], ["football", "⚽", "Futbol"], ["robotics", "🤖", "Robototexnika"], ["coding", "⌘", "Dasturlash"], ["art", "🎨", "Rasm va dizayn"], ["music", "♫", "Musiqa / vokal"], ["dance", "♪", "Raqs"], ["swimming", "🏊", "Suzish"], ["craft", "✂", "Milliy hunar"], ["reading", "▤", "Kitobxonlik"], ["language", "◎", "Til klubi"], ["other", "+", "Boshqa"]];
const clone = value => JSON.parse(JSON.stringify(value));
const typeLabel = key => TYPES.find(item => item[0] === key)?.[1] || "Yangi mavzu";
const normalized = value => String(value || "").toLocaleLowerCase().replace(/[‘’ʻʼ`]/g, "'").replace(/\s+/g, " ").trim();
export function gradeOf(value) { const match = String(value || "").match(/(?:^|\D)(1[01]|[1-9])(?:\D|$)/); return match ? Number(match[1]) : null; }
export function localDateISO(date) { const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Tashkent", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date); const part = key => parts.find(item => item.type === key).value; return `${part("year")}-${part("month")}-${part("day")}`; }
export function mondayISO(value = new Date()) { const date = new Date(`${value instanceof Date ? localDateISO(value) : value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7)); return date.toISOString().slice(0, 10); }
export function shiftWeek(value, amount) { const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + amount * 7); return date.toISOString().slice(0, 10); }
function dateLabel(value) { if (!value) return ""; const [, month, day] = value.split("-"); return `${day}.${month}`; }
export function subjectCounts(schedule) { const result = {}; for (const day of schedule || []) for (const lesson of day.lessons || []) { const key = normalized(lesson.subject); result[key] = (result[key] || 0) + 1; } return result; }
export function isLockedLesson(lesson, dayIndex, lessonIndex) { return !!lesson?.locked_position || (dayIndex === 0 && lessonIndex === 0 && ["kelajak soati", "sinf soati"].includes(normalized(lesson?.subject))); }
function toMinutes(value) { const match = String(value || "").match(/^(\d{2}):(\d{2})$/); return match ? Number(match[1]) * 60 + Number(match[2]) : null; }
function formattedTime(value) { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }
export function slotTime(schedule, dayIndex, lessonIndex, lessonTimes = []) {
  const own = schedule[dayIndex]?.lessons || [];
  if (own[lessonIndex]?.time) return own[lessonIndex].time;
  if (lessonTimes[lessonIndex]) return lessonTimes[lessonIndex];
  const example = schedule.find(day => day.lessons?.[lessonIndex]?.time)?.lessons[lessonIndex];
  if (example) return example.time;
  const reference = own.length ? own : schedule.find(day => day.lessons?.length)?.lessons || [];
  const last = reference[reference.length - 1]; const previous = reference[reference.length - 2];
  const parts = String(last?.time || "").split(/[–-]/).map(toMinutes);
  const previousEnd = toMinutes(String(previous?.time || "").split(/[–-]/)[1]);
  const gap = previousEnd !== null && parts[0] !== null ? parts[0] - previousEnd : null;
  if (parts.length !== 2 || parts.some(part => part === null) || gap === null || gap < 0 || parts[1] <= parts[0]) return "";
  const start = parts[0] + (parts[1] - parts[0] + gap) * (lessonIndex - reference.length + 1);
  return start + parts[1] - parts[0] < 24 * 60 ? `${formattedTime(start)}–${formattedTime(start + parts[1] - parts[0])}` : "";
}
export function moveLesson(schedule, from, to, lessonTimes = []) {
  const source = schedule[from.day]?.lessons?.[from.index]; const targetDay = schedule[to.day];
  if (!source || !targetDay || !Number.isInteger(to.index) || to.index < 0 || to.index > targetDay.lessons.length) throw new Error("Dars joyi topilmadi.");
  if (from.day === to.day && from.index === to.index) return schedule;
  if (isLockedLesson(source, from.day, from.index) || (targetDay.lessons[to.index] && isLockedLesson(targetDay.lessons[to.index], to.day, to.index))) throw new Error("Kelajak soati dushanba kuni birinchi darsda qoladi.");
  if (!targetDay.lessons[to.index] && from.day !== to.day && targetDay.lessons.length >= 8) throw new Error("Bu kunda dars uchun bo‘sh o‘rin qolmagan.");
  const next = schedule.map(day => ({ ...day, lessons: day.lessons.map(lesson => ({ ...lesson })) }));
  if (next[to.day].lessons[to.index]) {
    [next[from.day].lessons[from.index], next[to.day].lessons[to.index]] = [next[to.day].lessons[to.index], next[from.day].lessons[from.index]];
  } else {
    next[from.day].lessons.splice(from.index, 1); next[to.day].lessons.push({ ...source });
  }
  for (const di of new Set([from.day, to.day])) next[di].lessons = next[di].lessons.map((lesson, index) => {
    const time = slotTime(schedule, di, index, lessonTimes); if (!time) throw new Error("Bu o‘rin uchun dars vaqti topilmadi. Mavjud dars bilan joy almashtiring.");
    return { ...lesson, order: index + 1, time };
  });
  return next;
}
function lessonTarget(lesson, grade) { return { fan: lesson.subject, nomi: lesson.topic, topic_name: lesson.topic, topic_code: lesson.topic_code, topic_codes: lesson.topic_codes || [lesson.topic_code], activity_type: lesson.activity_type, grade, sinf: grade, chorak: lesson.quarter }; }
function serverError(data, fallback) {
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) return data.detail.map(item => item.msg).filter(Boolean).join("; ") || fallback;
  return typeof data?.message === "string" ? data.message : fallback;
}
async function readResponse(response, fallback) { const data = await response.json().catch(() => ({})); if (!response.ok) { const error = new Error(serverError(data, response.status === 409 ? "Jadval boshqa qurilmada o‘zgargan. Yangilab, o‘zgarishingizni qayta kiriting." : fallback)); error.status = response.status; throw error; } return data; }
function validDocument(data) { if (!Array.isArray(data?.schedule) || !data.schedule.every(day => day && Array.isArray(day.lessons))) throw new Error("Server jadvalni to‘liq qaytarmadi. Yana urinib ko‘ring."); return { ...data, extracurriculars: Array.isArray(data.extracurriculars) ? data.extracurriculars : [], ...(Array.isArray(data.warnings) ? { warnings: data.warnings } : {}) }; }

function Dialog({ title, subtitle, onClose, children }) {
  const card = useRef(null);
  useEffect(() => {
    const before = document.activeElement; card.current?.querySelector("button,input,select")?.focus();
    function keys(event) {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key !== "Tab") return;
      const elements = [...(card.current?.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]') || [])].filter(el => el.getClientRects().length);
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", keys); return () => { document.removeEventListener("keydown", keys); if (before?.isConnected) before.focus(); };
  }, []);
  return createPortal(<div className="schedule-modal" onClick={event => { if (event.target === event.currentTarget) onClose(); }}><section className="schedule-modal__card" ref={card} role="dialog" aria-modal="true" aria-label={title}><header><div><small>{subtitle}</small><h3>{title}</h3></div><button type="button" onClick={onClose} aria-label="Yopish">×</button></header>{children}</section></div>, document.body);
}
function TopicModal({ base, queryParams, grade, lesson, dtsSubject, onApply, onClose }) {
  const [topics, setTopics] = useState([]), [query, setQuery] = useState(""), [quarter, setQuarter] = useState(lesson.quarter ? String(lesson.quarter) : "");
  const [status, setStatus] = useState("loading"), [error, setError] = useState(""), [retry, setRetry] = useState(0);
  const [choice, setChoice] = useState({ ...lesson });
  useEffect(() => {
    const controller = new AbortController(); let current = true; setStatus("loading"); setError("");
    const params = new URLSearchParams(queryParams); params.set("fan", lesson.subject); if (quarter) params.set("quarter", quarter); if (dtsSubject) params.set("dts_subject", dtsSubject);
    let timedOut = false; const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    fetch(`${base}/api/shaxsiy-jadval/mavzular?${params}`, { cache: "no-store", signal: controller.signal }).then(response => readResponse(response, "DTS mavzulari olinmadi.")).then(data => { if (current) { setTopics(Array.isArray(data.mavzular) ? data.mavzular : []); setStatus("ready"); } }).catch(err => { if (current && (err.name !== "AbortError" || timedOut)) { setError(timedOut ? "Mavzularni yuklash cho‘zildi. Yana urinib ko‘ring." : err.message); setStatus("error"); } }).finally(() => clearTimeout(timeout));
    return () => { current = false; clearTimeout(timeout); controller.abort(); };
  }, [base, queryParams, lesson.subject, quarter, retry, dtsSubject]);
  const shown = useMemo(() => topics.filter(item => normalized(`${item.nomi} ${item.bob_nomi || ""}`).includes(normalized(query))), [topics, query]);
  return <Dialog title="Darsni moslash" subtitle={`${grade || ""}-sinf · ${lesson.subject}`} onClose={onClose}>
    <p className="schedule-modal__hint">Mavzu shu sinf va fan uchun bazadagi DTS ro‘yxatidan olinadi. O‘zgarish shaxsiy jadvalingizga tegishli.</p>
    <label className="schedule-field">Dars turi<select value={choice.activity_type || "lesson"} onChange={event => setChoice(old => ({ ...old, activity_type: event.target.value }))}>{TYPES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    <div className="schedule-topic-search"><label className="schedule-field">Chorak<select value={quarter} onChange={event => setQuarter(event.target.value)}><option value="">Barcha choraklar</option>{[1, 2, 3, 4].map(item => <option key={item} value={item}>{item}-chorak</option>)}</select></label><label className="schedule-field">DTS mavzusini topish<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Mavzu yoki bob nomi" /></label></div>
    <div className="schedule-topic-selected"><small>Tanlangan mavzu</small><strong>{choice.topic || "Mavzu tanlanmagan"}</strong>{choice.topic_code && <button type="button" onClick={() => setChoice(old => ({ ...old, topic: "", topic_code: "" }))}>Tanlovni tozalash</button>}</div>
    {status === "loading" ? <p className="schedule-topic-state" role="status">DTS mavzulari yuklanmoqda…</p> : status === "error" ? <div className="schedule-topic-state" role="alert"><p>{error}</p><button type="button" onClick={() => setRetry(old => old + 1)}>Qayta urinish</button></div> : !shown.length ? <p className="schedule-topic-state">Bu tanlov bo‘yicha bazada DTS mavzusi topilmadi. Boshqa chorak yoki qidiruvni tanlang.</p> : <div className="schedule-topic-list">{shown.map(item => <button type="button" key={item.topic_code} className={choice.topic_code === item.topic_code ? "active" : ""} aria-pressed={choice.topic_code === item.topic_code} onClick={() => setChoice(old => ({ ...old, topic_code: item.topic_code, topic: item.nomi }))}><b>{item.nomi}</b><small>{[item.chorak ? `${item.chorak}-chorak` : "", item.bob_nomi, Number(item.test_count) > 0 ? `${item.test_count} test` : ""].filter(Boolean).join(" · ")}</small></button>)}</div>}
    <div className="schedule-modal__footer"><button type="button" onClick={onClose}>Bekor qilish</button><button type="button" className="schedule-main-button" onClick={() => { onApply({ activity_type: choice.activity_type, topic: choice.topic, topic_code: choice.topic_code }); onClose(); }}>Tanlovni qo‘llash</button></div>
  </Dialog>;
}
function MoveModal({ schedule, lessonTimes, from, onApply, onClose }) {
  const [day, setDay] = useState(from.day), [slot, setSlot] = useState(""), [error, setError] = useState("");
  const subject = schedule[from.day]?.lessons[from.index]?.subject;
  const lessons = schedule[day]?.lessons || [];
  return <Dialog title="Dars o‘rnini almashtirish" subtitle={subject} onClose={onClose}>
    <p className="schedule-modal__hint">Band o‘rinni tanlasangiz, ikki dars joy almashadi. Kun oxiriga ko‘chirsangiz, haftalik fan soatlari saqlanadi.</p>
    <label className="schedule-field">Qaysi kunga?<select value={day} onChange={event => { setDay(Number(event.target.value)); setSlot(""); }}>{schedule.map((item, index) => <option key={item.day} value={index}>{item.day}{item.is_study_day === false ? " · dam olish kuni" : ""}</option>)}</select></label>
    <div className="schedule-move-options">{lessons.map((lesson, index) => <button type="button" key={lesson.id || index} disabled={isLockedLesson(lesson, day, index) || (day === from.day && index === from.index)} className={slot === String(index) ? "active" : ""} onClick={() => setSlot(String(index))}><b>{index + 1}</b><span>{lesson.subject}<small>{lesson.time}</small></span></button>)}{(lessons.length < 8 || day === from.day) && <button type="button" className={slot === String(lessons.length) ? "active" : ""} onClick={() => setSlot(String(lessons.length))}>+ Kun oxiriga ko‘chirish</button>}</div>
    {error && <p className="schedule-inline-error" role="alert">{error}</p>}
    <div className="schedule-modal__footer"><button type="button" onClick={onClose}>Bekor qilish</button><button type="button" className="schedule-main-button" disabled={slot === ""} onClick={() => { try { onApply(moveLesson(schedule, from, { day, index: Number(slot) }, lessonTimes)); onClose(); } catch (err) { setError(err.message); } }}>Joylashtirish</button></div>
  </Dialog>;
}
function ClubModal({ value, onApply, onClose }) {
  const [form, setForm] = useState(value || { id: `club-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, club_type: "chess", name: "Shaxmat", day: "Dushanba", time: "16:00", note: "" });
  const [error, setError] = useState("");
  return <Dialog title="To‘garak va mashg‘ulot" subtitle="Shaxsiy reja" onClose={onClose}>
    <form onSubmit={event => { event.preventDefault(); if (!form.name.trim() || !/^\d{2}:\d{2}$/.test(form.time)) { setError("To‘garak nomi va vaqtini kiriting."); return; } onApply({ ...form, name: form.name.trim(), note: form.note.trim() }); onClose(); }}>
      <div className="schedule-club-fields"><label className="schedule-field">Yo‘nalish<select value={form.club_type} onChange={event => { const key = event.target.value; setForm(old => ({ ...old, club_type: key, name: key === "other" ? old.name : CLUBS.find(item => item[0] === key)[2] })); }}>{CLUBS.map(([key, icon, name]) => <option key={key} value={key}>{icon} {name}</option>)}</select></label><label className="schedule-field">Nomi<input required maxLength={100} value={form.name} onChange={event => setForm(old => ({ ...old, name: event.target.value }))} /></label><label className="schedule-field">Kun<select value={form.day} onChange={event => setForm(old => ({ ...old, day: event.target.value }))}>{DAYS.map(day => <option key={day}>{day}</option>)}</select></label><label className="schedule-field">Vaqt<input required type="time" value={form.time} onChange={event => setForm(old => ({ ...old, time: event.target.value }))} /></label><label className="schedule-field schedule-field--wide">Izoh<input maxLength={160} value={form.note} onChange={event => setForm(old => ({ ...old, note: event.target.value }))} placeholder="Manzil yoki ustoz" /></label></div>
      {error && <p className="schedule-inline-error" role="alert">{error}</p>}<div className="schedule-modal__footer"><button type="button" onClick={onClose}>Bekor qilish</button><button type="submit" className="schedule-main-button">Jadvalga qo‘shish</button></div>
    </form>
  </Dialog>;
}
function Lesson({ lesson, grade, editing, locked, onTopic, onMove, onTest }) {
  return <div className={`student-schedule__lesson${locked ? " is-locked" : ""}`}><div className="student-schedule__lesson-head"><b>{lesson.order}</b><time>{lesson.time}</time>{locked && <span title="Dushanba kuni birinchi dars">⌑</span>}</div><strong>{lesson.subject}</strong><p>{lesson.topic || (lesson.activity_type === "review" ? "O‘tilganlarni takrorlash" : lesson.activity_type === "control" ? "Nazorat mashg‘uloti" : "DTS mavzusini tanlash mumkin")}</p><small className={`student-schedule__type type-${lesson.activity_type || "lesson"}`}>{typeLabel(lesson.activity_type)}</small>{editing ? <div className="student-schedule__lesson-actions"><button type="button" onClick={onTopic}>Mavzu / tur</button><button type="button" disabled={locked} onClick={onMove}>⇄ Joyi</button></div> : lesson.topic_code && onTest ? <button type="button" className="student-schedule__practice" onClick={() => onTest(lessonTarget(lesson, grade))}>Shu mavzudan test →</button> : null}</div>;
}

export default function StudentScheduleWorkspace({ token, student, apiBase, onOpenTest, readOnly = false, compactTitle = false, mode = "student", initialGrade, language, schoolId }) {
  const teacher = mode === "teacher";
  const studentId = teacher ? null : student?.user_id;
  const base = (apiBase || import.meta.env.VITE_API_BASE || "https://talimplatformasi-production.up.railway.app").replace(/\/$/, "");
  const [selectedGrade, setSelectedGrade] = useState(() => gradeOf(initialGrade) || gradeOf(student?.class) || null);
  const [selectedLanguage, setSelectedLanguage] = useState(language || (teacher ? "uz" : ""));
  const [week, setWeek] = useState(() => mondayISO()), [documentData, setDocumentData] = useState(null), [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [topicModal, setTopicModal] = useState(null), [moveModal, setMoveModal] = useState(null), [clubModal, setClubModal] = useState(null);
  const sequence = useRef(0), controller = useRef(null), mounted = useRef(true), weekStrip = useRef(null);
  const editing = !!draft, data = draft || documentData;
  const grade = data?.grade || selectedGrade || gradeOf(student?.class);
  const editable = !readOnly && data?.can_edit !== false;
  const schedule = data?.schedule || [], clubs = data?.extracurriculars || [];
  const todayISO = localDateISO(new Date());
  const queryParams = useMemo(() => { const params = new URLSearchParams({ token: token || "", mode }); if (studentId) params.set("bola_id", String(studentId)); if (schoolId) params.set("school_id", String(schoolId)); if (teacher && selectedGrade) params.set("grade", String(selectedGrade)); if (selectedLanguage) params.set("language", selectedLanguage); return params.toString(); }, [token, mode, studentId, teacher, selectedGrade, selectedLanguage, schoolId]);

  useEffect(() => {
    const nextGrade = gradeOf(initialGrade);
    if (!teacher || !nextGrade) return;
    if (draft || saving) { setNotice("Boshqa sinfga o‘tishdan oldin joriy o‘zgarishlarni saqlang yoki bekor qiling."); return; }
    setSelectedGrade(nextGrade);
  }, [initialGrade, teacher]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; sequence.current += 1; controller.current?.abort(); }; }, []);
  useEffect(() => {
    loadSchedule(); return () => { sequence.current += 1; controller.current?.abort(); };
  }, [base, queryParams, week, student?.class]);
  useEffect(() => {
    if (!draft) return;
    const stop = event => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", stop); return () => window.removeEventListener("beforeunload", stop);
  }, [!!draft]);

  async function loadSchedule(options = {}) {
    const preview = options.preview === true;
    const request = ++sequence.current; controller.current?.abort(); const abort = new AbortController(); controller.current = abort;
    setLoading(true); setError(""); setNotice(""); setTopicModal(null); setMoveModal(null); setClubModal(null);
    if (!preview) { setDocumentData(null); setDraft(null); setSaving(false); }
    if (!token) { setLoading(false); setError("Jadvalni ko‘rish uchun hisobga qayta kiring."); return; }
    if (teacher && !selectedGrade) { setLoading(false); setError("Shaxsiy dars rejangiz uchun sinfni tanlang."); return; }
    const params = new URLSearchParams(queryParams); params.set("week", week);
    if (preview) { params.set("regenerate", "true"); params.set("shift", String(options.shift || data?.shift || 1)); if (options.studyDays || data?.study_days) params.set("study_days", String(options.studyDays || data.study_days)); params.set("subject_mappings", JSON.stringify(options.subjectMappings || data?.subject_mappings || {})); }
    let timedOut = false; const timeout = setTimeout(() => { timedOut = true; abort.abort(); }, 20000);
    try {
      const result = validDocument(await readResponse(await fetch(`${base}/api/shaxsiy-jadval?${params}`, { cache: "no-store", signal: abort.signal }), "Jadval olinmadi. Yana urinib ko‘ring."));
      if (!mounted.current || request !== sequence.current) return;
      if (preview) { setDraft({ ...result, extracurriculars: clone(data?.extracurriculars || result.extracurriculars), version: documentData?.version ?? result.version }); setNotice("Yangi taqsimot tayyor. Ko‘rib chiqing va Saqlash tugmasini bosing."); }
      else setDocumentData(result);
    } catch (err) { if (mounted.current && request === sequence.current && (err.name !== "AbortError" || timedOut)) setError(timedOut ? "Jadvalni yuklash cho‘zildi. Yana urinib ko‘ring." : err.message); }
    finally { clearTimeout(timeout); if (mounted.current && request === sequence.current) setLoading(false); }
  }
  function beginEditing() { if (!editable || !documentData || loading || saving) return; setDraft(clone(documentData)); setError(""); setNotice(""); }
  function cancelEditing() { if (saving || loading) return; setDraft(null); setTopicModal(null); setMoveModal(null); setClubModal(null); setError(""); setNotice("O‘zgarishlar bekor qilindi."); }
  function updateLesson(dayIndex, lessonIndex, patch) { if (!editable) return; setDraft(old => old ? { ...old, schedule: old.schedule.map((day, di) => di === dayIndex ? { ...day, lessons: day.lessons.map((lesson, li) => li === lessonIndex ? { ...lesson, ...patch } : lesson) } : day) } : old); }
  async function save() {
    if (!draft || !editable || loading || saving) return;
    const request = ++sequence.current; const abort = new AbortController(); controller.current = abort; setSaving(true); setError(""); setNotice("");
    const payload = { week_start: draft.week_start || week, shift: draft.shift, schedule: draft.schedule, extracurriculars: draft.extracurriculars, version: documentData?.version ?? draft.version, curriculum_signature: draft.curriculum_signature, subject_mappings: draft.subject_mappings || {}, mode };
    if (studentId) payload.bola_id = studentId; if (schoolId) payload.school_id = schoolId; if (teacher) payload.grade = grade; if (draft.language || selectedLanguage) payload.language = draft.language || selectedLanguage; if (draft.study_days) payload.study_days = draft.study_days;
    let timedOut = false; const timeout = setTimeout(() => { timedOut = true; abort.abort(); }, 20000);
    try {
      const result = validDocument(await readResponse(await fetch(`${base}/api/shaxsiy-jadval?${queryParams}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: abort.signal }), "Jadval serverga saqlanmadi. O‘zgarishlaringiz shu oynada turibdi."));
      if (!mounted.current || request !== sequence.current) return;
      setDocumentData({ ...draft, ...result, source: "saved" }); setDraft(null); setNotice("Shaxsiy jadvalingiz serverga saqlandi.");
    } catch (err) { if (mounted.current && request === sequence.current && (err.name !== "AbortError" || timedOut)) setError(timedOut ? "Saqlash javobi kelmadi. O‘zgarishlaringiz shu oynada turibdi; qayta urinishdan oldin ulanishni tekshiring." : err.message); }
    finally { clearTimeout(timeout); if (mounted.current && request === sequence.current) setSaving(false); }
  }
  function openClub(value = {}) { if (!editable || !data || loading || saving) return; setNotice(""); setError(""); if (!draft) setDraft(clone(data)); setClubModal(value); }
  function scrollDay(index) { const strip = weekStrip.current, item = strip?.children[index]; if (strip && item) strip.scrollTo({ left: item.offsetLeft - strip.offsetLeft, behavior: "auto" }); }
  const counts = useMemo(() => subjectCounts(schedule), [schedule]);
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const curriculum = data?.curriculum || [];
  const actualHours = schedule.filter(day => day.is_study_day !== false).reduce((sum, day) => sum + day.lessons.length, 0);
  const quarters = [...new Set(schedule.flatMap(day => day.lessons.map(lesson => lesson.quarter)).filter(Boolean))];
  const canChooseDays = data && data.calendar?.source !== "admin" && data.calendar?.source !== "school" && data.calendar?.confirmed !== true;
  const sourceText = documentData?.source === "saved" ? "Saqlangan shaxsiy jadval" : "Admin o‘quv rejasi asosida avtomatik taqsimot";

  return <section className={`student-schedule${readOnly ? " is-readonly" : ""}`} aria-label={teacher ? "O‘qituvchining shaxsiy dars rejasi" : "Haftalik dars jadvali"}>
    <div className="student-schedule__hero"><div><span className="student-schedule__eyebrow">{readOnly ? "FARZANDINGIZNING HAFTASI" : teacher ? "SHAXSIY DARSGA TAYYORGARLIK" : "BUGUNGI TA’LIM MAYDONI"}</span><h2>{teacher ? "Haftalik dars rejam" : compactTitle ? "Haftalik dars jadvali" : `Salom, ${student?.full_name || "o‘quvchi"}!`}</h2><p>{grade ? `${grade}-sinf · ` : ""}{data ? sourceText : "Sinfga mos fanlar va DTS mavzulari"}</p></div>{!readOnly && documentData && <div className="student-schedule__actions">{editing ? <><span className="student-schedule__unsaved">Saqlanmagan o‘zgarishlar</span><button type="button" className="schedule-secondary" onClick={cancelEditing} disabled={loading || saving}>Bekor qilish</button><button type="button" onClick={save} disabled={loading || saving}>{saving ? "Saqlanmoqda…" : "Saqlash"}</button></> : <button type="button" onClick={beginEditing} disabled={!editable || loading}>Jadvalni moslash</button>}</div>}</div>
    <div className="student-schedule__week-nav"><div className="student-schedule__week-buttons"><button type="button" aria-label="Oldingi hafta" disabled={editing || loading || saving} onClick={() => setWeek(old => shiftWeek(old, -1))}>←</button><strong>{dateLabel(data?.week_start || week)} — {dateLabel(data?.week_end || shiftWeek(week, 1))}</strong><button type="button" aria-label="Keyingi hafta" disabled={editing || loading || saving} onClick={() => setWeek(old => shiftWeek(old, 1))}>→</button><button type="button" disabled={editing || loading || saving || week === mondayISO()} onClick={() => setWeek(mondayISO())}>Joriy hafta</button></div>{teacher && <div className="student-schedule__teacher-select"><label>Sinf<select aria-label="Reja uchun sinf" value={selectedGrade || ""} disabled={editing || loading || saving} onChange={event => setSelectedGrade(Number(event.target.value))}><option value="" disabled>Sinfni tanlang</option>{(data?.available_grades || Array.from({ length: 11 }, (_, index) => index + 1)).map(item => <option key={item} value={item}>{item}-sinf</option>)}</select></label><label>Ta’lim tili<select value={selectedLanguage || "uz"} disabled={editing || loading || saving} onChange={event => setSelectedLanguage(event.target.value)}><option value="uz">O‘zbek</option><option value="ru">Rus</option><option value="en">Ingliz</option></select></label></div>}</div>
    {loading && <p className="student-schedule__notice" role="status">{editing ? "Fanlar va mavzular qayta taqsimlanmoqda…" : "Sinf o‘quv rejasi va hafta taqvimi yuklanmoqda…"}</p>}
    {error && <div className="student-schedule__error" role="alert"><span>{error}</span>{!editing && <button type="button" onClick={() => loadSchedule()} disabled={loading}>Qayta urinish</button>}{editing && <small>Saqlash tasdiqlanmadi. Kerak bo‘lsa «Bekor qilish»dan keyin haftani qayta yuklang.</small>}</div>}
    {notice && <p className="student-schedule__notice" role="status">{notice}</p>}
    {data && <>
      <div className="student-schedule__summary"><span><b>{total}</b> haftalik reja soati</span><span><b>{Object.keys(counts).length}</b> fan</span><span><b>{actualHours}</b> shu hafta dars</span><span>{quarters.length ? `${quarters.map(item => `${item}-chorak`).join(" / ")}` : "Chorak taqvimi belgilanmagan"}</span></div>
      {!!data.warnings?.length && <details className="student-schedule__warnings"><summary>Jadval uchun {data.warnings.length} ta izoh</summary><ul>{data.warnings.map((warning, index) => <li key={index}>{typeof warning === "string" ? warning : warning.message || warning.detail || "Admin taqvim sozlamalarini tekshiring."}</li>)}</ul></details>}
      {editing && <div className="student-schedule__edit-help"><p><b>Bu sizning shaxsiy rejangiz.</b> «Joyi» bilan darslarni almashtiring, «Mavzu / tur» orqali DTS mavzusini yoki takrorlash va nazoratni tanlang. Fanlarning haftalik soati saqlanadi.</p><div className="student-schedule__regenerate"><span>Qayta tuzish shaxsiy joylashuv va mavzularni admin rejasidan yangilaydi.</span><button type="button" disabled={loading || saving} onClick={() => loadSchedule({ preview: true })}>↻ Avto qayta tuzish</button><label>Smena<select value={data.shift || 1} disabled={loading || saving} onChange={event => loadSchedule({ preview: true, shift: Number(event.target.value) })}><option value={1}>1-smena</option><option value={2}>2-smena</option></select></label>{canChooseDays && <label>O‘qish haftasi<select value={data.study_days || schedule.length} disabled={loading || saving} onChange={event => loadSchedule({ preview: true, studyDays: Number(event.target.value) })}><option value={5}>5 kun</option><option value={6}>6 kun</option></select></label>}</div></div>}
      {editing && Object.entries(data.subject_options || {}).some(([, options]) => options?.length) && <div className="student-schedule__subject-mappings"><p>Chet tili mavzularini qaysi fandan olish kerak? Tanlov o‘zgarsa, shaxsiy hafta qayta tuziladi.</p>{Object.entries(data.subject_options).filter(([, options]) => options?.length).map(([subject, options]) => <label key={subject}>{subject}<select value={data.subject_mappings?.[subject] || ""} disabled={loading || saving} onChange={event => loadSchedule({ preview: true, subjectMappings: { ...(data.subject_mappings || {}), [subject]: event.target.value } })}><option value="" disabled>DTS fanini tanlang</option>{options.map(option => <option key={option} value={option}>{option}</option>)}</select></label>)}</div>}
      <div className="student-schedule__strip-heading"><p>Barcha kunlar bir qatorda. Yon tomonga suring.</p><nav aria-label="Hafta kuniga o‘tish">{schedule.map((day, index) => <button type="button" key={day.date || day.day} className={day.date === todayISO ? "is-today" : ""} onClick={() => scrollDay(index)}>{day.day.slice(0, 3)}</button>)}</nav></div>
      <div className="student-schedule__grid" ref={weekStrip} style={{ "--schedule-days": Math.max(1, schedule.length) }} role="region" aria-label="Butun hafta jadvali; yon tomonga aylantirish mumkin" tabIndex={0}>{schedule.map((day, dayIndex) => <article key={day.date || day.day} className={`${day.date === todayISO ? "is-today " : ""}${day.is_study_day === false ? "is-rest-day" : ""}`}><header><div><h3>{day.day}</h3><span>{dateLabel(day.date)}{day.date === todayISO ? " · Bugun" : ""}</span></div><b>{day.lessons.length} dars</b></header>{day.is_study_day === false && <p className="student-schedule__rest-label">{day.reason || "Dam olish kuni"}<small>Quyida haftalik andozadagi fanlar.</small></p>}{day.lessons.length ? day.lessons.map((lesson, lessonIndex) => <Lesson key={lesson.id || `${dayIndex}-${lessonIndex}`} lesson={lesson} grade={grade} locked={isLockedLesson(lesson, dayIndex, lessonIndex)} editing={editing && !loading && !saving} onTopic={() => { if (editable) setTopicModal({ dayIndex, lessonIndex, lesson }); }} onMove={() => { if (editable) setMoveModal({ day: dayIndex, index: lessonIndex }); }} onTest={!editing && day.is_study_day !== false ? onOpenTest : null} />) : <p className="student-schedule__empty-day">Bu kunga dars belgilanmagan.</p>}</article>)}</div>
      {!!curriculum.length && <details className="student-schedule__curriculum"><summary>Fanlar va haftalik soatlarni tekshirish</summary><div className="student-schedule__table-wrap"><table><thead><tr><th>Fan</th><th>Admin reja soati</th><th>Shu hafta andozasi</th><th>Joylashtirildi</th></tr></thead><tbody>{curriculum.map((item, index) => <tr key={`${item.subject}-${index}`}><td>{item.subject}</td><td>{item.weekly_hours}</td><td>{item.week_hours ?? "—"}</td><td>{counts[normalized(item.subject)] || 0}</td></tr>)}</tbody></table></div><p>Kasrli soatlar haftalar bo‘yicha navbatlanishi mumkin. Bayram va ta’til kunlari admin taqvimiga ko‘ra alohida belgilanadi.</p></details>}
      <div className="student-schedule__clubs"><div className="student-schedule__clubs-head"><div><span>QO‘SHIMCHA RIVOJLANISH</span><h3>To‘garak va mashg‘ulotlar</h3><p>Asosiy o‘quv reja soatlaridan alohida.</p></div>{editable && <button type="button" disabled={loading || saving || clubs.length >= 20} onClick={() => openClub()}>+ Qo‘shish</button>}</div>{!clubs.length ? <p className="student-schedule__clubs-empty">To‘garaklaringizni shu yerga qo‘shishingiz mumkin.</p> : <div className="student-schedule__club-list">{clubs.map(item => <div key={item.id}><b aria-hidden="true">{CLUBS.find(club => club[0] === item.club_type)?.[1] || "✦"}</b><span><strong>{item.name}</strong><small>{item.day} · {item.time}{item.note ? ` · ${item.note}` : ""}</small></span>{editable && <><button type="button" aria-label={`${item.name}: tahrirlash`} disabled={loading || saving} onClick={() => openClub(item)}>✎</button><button type="button" aria-label={`${item.name}: o‘chirish`} disabled={loading || saving} onClick={() => { setNotice(""); setError(""); setDraft(old => { const next = old || clone(data); return { ...next, extracurriculars: next.extracurriculars.filter(club => club.id !== item.id) }; }); }}>×</button></>}</div>)}</div>}</div>
    </>}
    {topicModal && editing && editable && <TopicModal base={base} queryParams={queryParams} grade={grade} lesson={topicModal.lesson} dtsSubject={data.subject_mappings?.[topicModal.lesson.subject]} onApply={patch => updateLesson(topicModal.dayIndex, topicModal.lessonIndex, patch)} onClose={() => setTopicModal(null)} />}
    {moveModal && editing && editable && <MoveModal schedule={schedule} lessonTimes={data.lesson_times || []} from={moveModal} onApply={next => setDraft(old => ({ ...old, schedule: next }))} onClose={() => setMoveModal(null)} />}
    {clubModal && editing && editable && <ClubModal value={clubModal.id ? clubModal : null} onApply={item => setDraft(old => ({ ...old, extracurriculars: [...old.extracurriculars.filter(club => club.id !== item.id), item] }))} onClose={() => setClubModal(null)} />}
  </section>;
}
