import TranslatedContent from '../interface/TranslatedContent.jsx';
import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock, FileText, GraduationCap, LockKeyhole, Play, Plus, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import SafeCourseText from "./CourseText.jsx";
import CourseStudio from "./CourseStudio.jsx";
import { courseRequest, fetchCourseBlob } from "./courseApi.js";
import "./courses.css";

const ROOT = "/api/kurslar";
const money = (value) => new Intl.NumberFormat("uz-UZ").format(Number(value) || 0);
const dateLabel = (value) => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat("uz-UZ", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value)) : "";
const message = (err) => err?.message || "So‘rov bajarilmadi. Qayta urinib ko‘ring.";
const requestKey = () => globalThis.crypto?.randomUUID?.() || `course-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function courseId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function courseLessonList(lessons) {
  return (Array.isArray(lessons) ? lessons : []).filter((item) => courseId(item?.id)).slice().sort((a, b) => Number(a.position) - Number(b.position) || Number(a.id) - Number(b.id));
}

export function courseResumeLesson(lessons, progress) {
  const available = courseLessonList(lessons).filter((lesson) => !lesson.locked);
  const records = Array.isArray(progress) ? progress : [];
  const started = records.filter((record) => record.status !== "completed" && available.some((lesson) => Number(lesson.id) === Number(record.lesson_id))).sort((a, b) => (Date.parse(b.updated_at) || 0) - (Date.parse(a.updated_at) || 0));
  if (started.length) return available.find((lesson) => Number(lesson.id) === Number(started[0].lesson_id));
  const finished = new Set(records.filter((record) => record.status === "completed").map((record) => Number(record.lesson_id)));
  return available.find((lesson) => !finished.has(Number(lesson.id))) || available[0] || null;
}

export function courseAttemptAnswers(questions, supplied) {
  const clean = {};
  for (const question of Array.isArray(questions) ? questions : []) {
    const value = supplied?.[question.id];
    if (Number.isInteger(value) && value >= 0 && value < (question.options?.length || 0)) clean[String(question.id)] = value;
  }
  return clean;
}

export function courseAttemptStorageKey(apiBase, user, course) {
  const candidate = Number(user?.user_id ?? user?.id);
  const uid = Number.isSafeInteger(candidate) && candidate !== 0 ? candidate : null;
  return uid && courseId(course) ? `kabutar:course-attempt:v1:${encodeURIComponent(String(apiBase || "").replace(/\/+$/, ""))}:${uid}:${courseId(course)}` : null;
}

export function courseSafeHttps(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function courseYoutubePlayerUrl(value, origin) {
  const safe = courseSafeHttps(value);
  if (!safe) return null;
  const url = new URL(safe);
  if (url.origin !== "https://www.youtube-nocookie.com" || !/^\/embed\/[A-Za-z0-9_-]{11}$/.test(url.pathname)) return null;
  url.searchParams.set("enablejsapi", "1");
  url.searchParams.set("autoplay", "0");
  url.searchParams.set("playsinline", "1");
  if (/^https?:\/\//.test(origin || "")) url.searchParams.set("origin", new URL(origin).origin);
  return url.href;
}

function storedAttempt(key, next) {
  if (!key) return null;
  try {
    if (next === null) sessionStorage.removeItem(key);
    else if (next !== undefined && /^[A-Za-z0-9_-]{1,100}$/.test(String(next))) sessionStorage.setItem(key, String(next));
    const value = sessionStorage.getItem(key);
    return value && /^[A-Za-z0-9_-]{1,100}$/.test(value) ? value : null;
  } catch { return null; }
}

function useCourseQuery(apiBase, token, path, revision = 0) {
  const [state, setState] = useState({ loading: Boolean(path), data: null, error: null });
  useEffect(() => {
    if (!path) { setState({ loading: false, data: null, error: null }); return undefined; }
    const controller = new AbortController();
    setState({ loading: true, data: null, error: null });
    courseRequest(apiBase, token, path, { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setState({ loading: false, data, error: null });
    }).catch((error) => {
      if (!controller.signal.aborted) setState({ loading: false, data: null, error });
    });
    return () => controller.abort();
  }, [apiBase, token, path, revision]);
  return state;
}

function CourseText({ children, className = "" }) {
  useKbInterfaceLocale();
  return <SafeCourseText text={__kbUi(String(children || ""))} className={`course-text ${className}`} />;
}

function Notice({ children, error = false }) {
  return <div className={`course-notice ${error ? "is-error" : ""}`} role={error ? "alert" : "status"}>{children}</div>;
}

function Loading() {
  useKbInterfaceLocale(); return <div className="course-loading" role="status">{__kbUi("Yuklanmoqda…")}</div>; }
function Empty({ children }) { return <div className="course-empty"><BookOpen size={28} aria-hidden="true" /><p>{children}</p></div>; }

export default function CourseWorkspace(props) {
  const identity = `${props.apiBase || ""}\n${props.token || ""}\n${props.user?.user_id ?? props.user?.id ?? "guest"}\n${Boolean(props.readOnly)}`;
  const previous = useRef(identity);
  const previousPrefix = useRef({ apiBase: props.apiBase, user: props.user });
  useEffect(() => {
    if (previous.current !== identity) {
      const prefix = courseAttemptStorageKey(previousPrefix.current.apiBase, previousPrefix.current.user, 1)?.replace(/:1$/, ":");
      if (prefix) {
        try { Object.keys(sessionStorage).filter((key) => key.startsWith(prefix)).forEach((key) => sessionStorage.removeItem(key)); } catch { /* Storage may be disabled. */ }
      }
      previous.current = identity;
      previousPrefix.current = { apiBase: props.apiBase, user: props.user };
    }
  }, [identity, props.apiBase, props.user]);
  return <CourseWorkspaceSession key={identity} {...props} />;
}

function CourseWorkspaceSession({ apiBase, token, user, readOnly = false, initialCourseId, initialMode, onLogin, onClose, active = true }) {
  useKbInterfaceLocale();
  const authToken = readOnly ? "" : token;
  const [view, setView] = useState(initialMode === "teaching" || initialMode === "newcourse" ? "teaching" : courseId(initialCourseId) ? "detail" : "catalog");
  const [selectedCourse, setSelectedCourse] = useState(courseId(initialCourseId));
  const [studioId, setStudioId] = useState(null);
  const [revision, setRevision] = useState(0);
  const [retryCapability, setRetryCapability] = useState(0);
  const capabilities = useCourseQuery(apiBase, authToken, authToken ? `${ROOT}/capabilities` : null, retryCapability);
  const canTeach = Boolean(authToken && !readOnly && capabilities.data?.can_teach);
  useEffect(() => {
    if (initialMode === "newcourse" && canTeach) setView("studio");
  }, [initialMode, canTeach]);
  useEffect(() => {
    if (courseId(initialCourseId)) { setSelectedCourse(courseId(initialCourseId)); setView("detail"); }
  }, [initialCourseId]);
  const openCourse = (id) => { setSelectedCourse(courseId(id)); setView("detail"); };
  const openStudio = (id = null) => { setStudioId(courseId(id)); setView("studio"); };
  return <section className="courses-workspace" aria-label={__kbUi("Kurslar va to‘garaklar")}>
    <header className="courses-topbar">
      <div className="courses-brand"><span><GraduationCap size={24} aria-hidden="true" /></span><div><small>{__kbUi("O‘Z SUR’ATINGIZDA O‘RGANING")}</small><h1>{__kbUi("Kurslar va to‘garaklar")}</h1></div></div>
      {onClose && view !== "studio" && view !== "detail" && <button className="course-icon-button" onClick={onClose} aria-label={__kbUi("Kurslardan chiqish")}><X size={20} /></button>}
    </header>
    {readOnly && <Notice>{__kbUi("Ko‘rib chiqish rejimi. Kursga yozilish va natijalarni saqlash uchun o‘z hisobingizga kiring.")}</Notice>}
    {view !== "studio" && view !== "detail" && <nav className="course-tabs" aria-label={__kbUi("Kurs bo‘limlari")}>
      <button className={view === "catalog" ? "is-active" : ""} onClick={() => setView("catalog")}><Search size={17} />{__kbUi("Kurs topish")}</button>
      {authToken && <button className={view === "learning" ? "is-active" : ""} onClick={() => setView("learning")}><BookOpen size={17} />{__kbUi("Mening kurslarim")}</button>}
      {canTeach && <button className={view === "teaching" ? "is-active" : ""} onClick={() => setView("teaching")}><GraduationCap size={17} />{__kbUi("O‘qituvchi xonasi")}</button>}
      {!authToken && onLogin && <button className="course-login-link" onClick={() => onLogin?.(selectedCourse)}>{__kbUi("Hisobga kirish")}<ArrowRight size={16} /></button>}
    </nav>}
    {capabilities.error && <Notice error>{__kbUi("Hisob imkoniyatlari olinmadi. ")}<button onClick={() => setRetryCapability((n) => n + 1)}>{__kbUi("Qayta tekshirish")}</button></Notice>}
    {view === "catalog" && <Catalog apiBase={apiBase} token={authToken} onOpen={openCourse} />}
    {(view === "learning" || view === "teaching") && <MyCourses key={`${view}:${revision}`} apiBase={apiBase} token={authToken} teaching={view === "teaching"} canTeach={canTeach} capabilityLoading={capabilities.loading} onCreate={() => openStudio()} onOpen={openCourse} onEdit={openStudio} onCatalog={() => setView("catalog")} onLogin={onLogin} />}
    {view === "detail" && selectedCourse && <CourseDetail key={`${selectedCourse}:${revision}`} active={active} apiBase={apiBase} token={authToken} user={user} id={selectedCourse} readOnly={readOnly} onBack={() => setView("catalog")} onLogin={() => onLogin?.(selectedCourse)} onEdit={() => openStudio(selectedCourse)} />}
    {view === "studio" && (canTeach ? <CourseStudio apiBase={apiBase} token={authToken} courseId={studioId} onBack={() => setView("teaching")} onSaved={() => setRevision((n) => n + 1)} /> : capabilities.loading ? <Loading /> : <Empty>{__kbUi("Kurs yaratish uchun o‘qituvchi hisobiga kirish kerak.")}</Empty>)}
  </section>;
}

function CourseCard({ course, onOpen, onEdit }) {
  useKbInterfaceLocale();
  return <article className="course-card">
    <div className="course-card-cover" aria-hidden="true"><BookOpen size={34} /><span>{course.subject || __kbUi("Bilim")}</span></div>
    <div className="course-card-body"><div className="course-badges"><span>{course.level || __kbUi("Barcha darajalar")}</span>{course.status !== "published" && <span>{course.status === "archived" ? __kbUi("Arxiv") : __kbUi("Qoralama")}</span>}</div>
      <h3><TranslatedContent text={course.title} showStatus={false}/></h3><p className="course-card-teacher">{course.teacher_name || __kbUi("Kurs muallifi")}</p>
      <p className="course-card-description">{course.description || __kbUi("Kurs dasturi va darslar bilan tanishing.")}</p>
      <div className="course-card-meta"><span>{Number(course.lesson_count) || 0}{__kbUi(" ta dars")}</span>{Number(course.preview_count) > 0 && <span>{course.preview_count}{__kbUi(" ta bepul dars")}</span>}</div>
      <div className="course-card-footer"><strong>{Number(course.price_uzs) > 0 ? <>{__kbUi(money(course.price_uzs))}{__kbUi(" so‘m")}<small>{__kbUi(" / 30 kun")}</small></> : __kbUi("Bepul")}</strong><button className="course-button" onClick={() => onOpen(course.id)}>{__kbUi("Ko‘rish")}<ArrowRight size={16} /></button></div>
      {onEdit && <button className="course-button is-secondary course-full" onClick={() => onEdit(course.id)}>{__kbUi("Kursni boshqarish")}</button>}
    </div>
  </article>;
}

function Catalog({ apiBase, token, onOpen }) {
  useKbInterfaceLocale();
  const [search, setSearch] = useState(""); const [query, setQuery] = useState("");
  const [subject, setSubject] = useState(""); const [level, setLevel] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false); const [filters, setFilters] = useState({ subject: "", level: "" });
  const [items, setItems] = useState([]); const [cursor, setCursor] = useState(null); const [nextCursor, setNextCursor] = useState(null);
  const [state, setState] = useState({ loading: true, error: null }); const [retry, setRetry] = useState(0);
  useEffect(() => { const timer = setTimeout(() => setQuery(search.trim()), 350); return () => clearTimeout(timer); }, [search]);
  const queryKey = `${query}\n${filters.subject}\n${filters.level}`;
  const previousKey = useRef(queryKey);
  useEffect(() => {
    const controller = new AbortController();
    const changed = previousKey.current !== queryKey;
    previousKey.current = queryKey;
    const pageCursor = changed ? null : cursor;
    if (changed) { setItems([]); setCursor(null); setNextCursor(null); }
    setState({ loading: true, error: null });
    const params = new URLSearchParams({ q: query, subject: filters.subject, level: filters.level, limit: "20" });
    if (pageCursor) params.set("after_id", pageCursor);
    courseRequest(apiBase, token, `${ROOT}/catalog?${params}`, { signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      setItems((old) => Array.from(new Map([...(pageCursor ? old : []), ...(data.items || [])].map((item) => [String(item.id), item])).values()));
      setNextCursor(data.next_cursor || null); setState({ loading: false, error: null });
    }).catch((error) => { if (!controller.signal.aborted) setState({ loading: false, error }); });
    return () => controller.abort();
  }, [apiBase, token, queryKey, cursor, retry]);
  return <div className="course-catalog">
    <div className="course-hero"><div><span className="course-eyebrow"><Sparkles size={16} />{__kbUi("Bir darsdan boshlang")}</span><h2>{__kbUi("Ko‘ring. Mashq qiling.")}<br />{__kbUi("Bilimingizni sinang.")}</h2><p>{__kbUi("Ustoz tayyorlagan darslarni qulay vaqtingizda o‘qing. Avval bepul darslar bilan tanishing.")}</p></div><div className="course-hero-symbol" aria-hidden="true"><GraduationCap size={82} /><span>{__kbUi("Video · Misol · Test")}</span></div></div>
    <form className="course-searchbar" onSubmit={(event) => { event.preventDefault(); setQuery(search.trim()); }}><label><Search size={20} aria-hidden="true" /><span className="course-sr-only">{__kbUi("Kurs, fan yoki ustozni izlash")}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={__kbUi("Kurs, fan yoki ustozni izlang")} maxLength={120} /></label><button type="button" className="course-button is-secondary" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17} /><span>{__kbUi("Saralash")}</span></button></form>
    {filtersOpen && <form className="course-filter-form" onSubmit={(event) => { event.preventDefault(); setFilters({ subject: subject.trim(), level: level.trim() }); }}><label>{__kbUi("Fan")}<input value={subject} maxLength={80} placeholder={__kbUi("Masalan: Matematika")} onChange={(event) => setSubject(event.target.value)} /></label><label>{__kbUi("Sinf yoki daraja")}<input value={level} maxLength={80} placeholder={__kbUi("Masalan: 10-sinf yoki B2")} onChange={(event) => setLevel(event.target.value)} /></label><button className="course-button">{__kbUi("Qo‘llash")}</button><button type="button" className="course-button is-secondary" onClick={() => { setSubject(""); setLevel(""); setFilters({ subject: "", level: "" }); }}>{__kbUi("Tozalash")}</button></form>}
    {state.error && <Notice error>{__kbUi(message(state.error))} <button onClick={() => setRetry((n) => n + 1)}>{__kbUi("Qayta urinish")}</button></Notice>}
    <div className="course-card-grid">{items.map((course) => <CourseCard key={course.id} course={course} onOpen={onOpen} />)}</div>
    {state.loading && <Loading />}{!state.loading && !state.error && !items.length && <Empty>{__kbUi("Hozircha mos kurs topilmadi. Qidiruv yoki saralash shartini o‘zgartiring.")}</Empty>}
    {nextCursor && !state.loading && <button className="course-button is-secondary course-load-more" onClick={() => setCursor(nextCursor)}>{__kbUi("Yana kurslar")}</button>}
  </div>;
}

function MyCourses({ apiBase, token, teaching, canTeach, capabilityLoading, onCreate, onOpen, onEdit, onCatalog, onLogin }) {
  useKbInterfaceLocale();
  const [retry, setRetry] = useState(0);
  const state = useCourseQuery(apiBase, token, token ? `${ROOT}/mine` : null, retry);
  if (!token) return <Empty>{__kbUi("Shaxsiy kurslaringizni ko‘rish uchun ")}<button onClick={onLogin}>{__kbUi("hisobga kiring")}</button>.</Empty>;
  const items = state.data?.[teaching ? "teaching" : "learning"] || [];
  return <div><div className="course-section-heading"><div><h2>{teaching ? __kbUi("O‘qituvchi xonasi") : __kbUi("Mening kurslarim")}</h2><p>{teaching ? __kbUi("Dastur, darslar va mashqlarni bitta joyda tayyorlang.") : __kbUi("Boshlagan darslaringizni davom ettiring.")}</p></div>{teaching && canTeach && <button className="course-button" onClick={onCreate}><Plus size={18} />{__kbUi("Kurs yaratish")}</button>}</div>
    {teaching && !canTeach && !capabilityLoading && <Notice>{__kbUi("Kurs yaratish o‘qituvchi hisobida ochiladi.")}</Notice>}
    {state.loading && <Loading />}{state.error && <Notice error>{__kbUi(message(state.error))} <button onClick={() => setRetry((n) => n + 1)}>{__kbUi("Qayta urinish")}</button></Notice>}
    <div className="course-card-grid">{items.map((course) => <CourseCard key={course.id} course={course} onOpen={onOpen} onEdit={teaching && canTeach ? onEdit : undefined} />)}</div>
    {!state.loading && !state.error && !items.length && <Empty>{teaching ? __kbUi("Birinchi kursingiz uchun dastur yarating, darslarni qoralama saqlang va tayyor bo‘lgach chiqaring.") : <>{__kbUi("Hali kurs boshlamadingiz. ")}<button onClick={onCatalog}>{__kbUi("Kurs topish")}</button></>}</Empty>}
  </div>;
}

function CourseDetail({ apiBase, token, user, id, readOnly, onBack, onLogin, onEdit, active: isActive = true }) {
  useKbInterfaceLocale();
  const [revision, setRevision] = useState(0); const state = useCourseQuery(apiBase, token, `${ROOT}/courses/${id}`, revision);
  const [reader, setReader] = useState(null); const [testing, setTesting] = useState(false);
  const [freshProgress, setFreshProgress] = useState({});
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [info, setInfo] = useState("");
  const [reference, setReference] = useState(""); const [note, setNote] = useState(""); const [paymentForm, setPaymentForm] = useState(false);
  const paymentKey = useRef(requestKey()); const actionLock = useRef(false); const active = useRef(true);
  const paymentHistory = useCourseQuery(apiBase, token, token && !readOnly ? `${ROOT}/courses/${id}/my-payment-requests` : null, revision);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const course = state.data?.course; const access = state.data?.access || {};
  const lessons = courseLessonList(state.data?.lessons); const progress = Array.from(new Map([...(state.data?.progress || []), ...Object.values(freshProgress)].map((record) => [Number(record.lesson_id), record])).values());
  const completed = new Set(progress.filter((record) => record.status === "completed").map((record) => Number(record.lesson_id)));
  const resume = courseResumeLesson(lessons, progress);
  const join = async () => {
    if (!token || readOnly) { onLogin?.(); return; }
    if (actionLock.current) return;
    actionLock.current = true; setBusy(true); setError("");
    try {
      await courseRequest(apiBase, token, `${ROOT}/courses/${id}/join`, { method: "POST", body: {} });
      if (active.current) { setInfo("Kursga qo‘shildingiz. O‘qishni boshlashingiz mumkin."); setRevision((n) => n + 1); }
    } catch (err) { if (active.current) setError(message(err)); }
    finally { actionLock.current = false; if (active.current) setBusy(false); }
  };
  const sendPaymentRequest = async (event) => {
    event.preventDefault();
    if (!token || readOnly) { onLogin?.(); return; }
    if (actionLock.current) return;
    actionLock.current = true; setBusy(true); setError("");
    try {
      await courseRequest(apiBase, token, `${ROOT}/courses/${id}/payment-request`, { method: "POST", body: { reference: reference.trim(), note: note.trim(), request_key: paymentKey.current } });
      if (!active.current) return;
      setInfo("So‘rovingiz yuborildi. O‘qituvchi haqiqiy to‘lovni tekshirib tasdiqlagach, kurs ochiladi.");
      setPaymentForm(false); setReference(""); setNote(""); paymentKey.current = requestKey(); setRevision((n) => n + 1);
    } catch (err) { if (active.current) setError(message(err)); }
    finally { actionLock.current = false; if (active.current) setBusy(false); }
  };
  if (state.loading) return <Loading />;
  if (state.error) return <><button className="course-back" onClick={onBack}><ArrowLeft size={18} />{__kbUi("Kurslarga qaytish")}</button><Notice error>{__kbUi(message(state.error))} <button onClick={() => setRevision((n) => n + 1)}>{__kbUi("Qayta urinish")}</button></Notice></>;
  if (!course) return <Empty>{__kbUi("Kurs topilmadi.")}</Empty>;
  if (testing) return <CourseTest apiBase={apiBase} token={token} user={user} course={course} lessons={lessons} progress={progress} initialLessonId={reader} onBack={() => setTesting(false)} onLogin={onLogin} />;
  if (reader) return <CourseReader key={reader} active={isActive} apiBase={apiBase} token={token} course={course} lessons={lessons} lessonId={reader} completed={completed} onSelect={setReader} onBack={() => { setReader(null); setRevision((n) => n + 1); }} onTest={() => setTesting(true)} onProgress={(value) => value?.lesson_id && setFreshProgress((old) => ({ ...old, [value.lesson_id]: value }))} onLogin={onLogin} />;
  return <div className="course-detail"><button className="course-back" onClick={onBack}><ArrowLeft size={18} />{__kbUi("Barcha kurslar")}</button>
    <div className="course-detail-hero"><div><div className="course-badges"><span>{course.subject}</span><span>{course.level}</span>{access.owner && <span>{__kbUi("Sizning kursingiz")}</span>}</div><h2><TranslatedContent text={course.title} showStatus={false}/></h2><p className="course-detail-teacher">{course.teacher_name}</p><CourseText>{course.description}</CourseText><div className="course-card-meta"><span><BookOpen size={16} />{lessons.length}{__kbUi(" ta dars")}</span><span><Play size={16} />{lessons.filter((lesson) => lesson.is_preview).length}{__kbUi(" ta bepul dars")}</span>{token && <span><CheckCircle2 size={16} />{completed.size}{__kbUi(" ta dars tugallangan")}</span>}</div></div>
      <aside className="course-enrollment"><span className="course-price">{Number(course.price_uzs) > 0 ? __kbUi(`${money(course.price_uzs)} so‘m`) : __kbUi("Bepul")}</span>{Number(course.price_uzs) > 0 && <small>{__kbUi("30 kunlik kirish huquqi")}</small>}
        {access.active && !access.owner && <p className="course-access"><CheckCircle2 size={18} />{access.access_until ? __kbUi(`${dateLabel(access.access_until)} gacha faol`) : __kbUi("Kursga kirish ochiq")}</p>}
        {!access.active && access.access_until && <p>{__kbUi("Obuna muddati tugagan. O‘qigan joyingiz saqlangan.")}</p>}
        {resume && <button className="course-button" onClick={() => setReader(resume.id)}><Play size={17} />{progress.length ? __kbUi("Davom ettirish") : access.active || access.owner ? __kbUi("O‘qishni boshlash") : __kbUi("Bepul sinab ko‘rish")}</button>}
        {!access.owner && Number(course.price_uzs) === 0 && !access.active && <button className="course-button is-secondary" disabled={busy} onClick={join}>{busy ? __kbUi("Kutilmoqda…") : token ? __kbUi("Kursga qo‘shilish") : __kbUi("Kirish va kursga qo‘shilish")}</button>}
        {!access.owner && Number(course.price_uzs) > 0 && <button className="course-button is-secondary" disabled={busy} onClick={() => token ? setPaymentForm(!paymentForm) : onLogin?.()}>{busy ? __kbUi("Kutilmoqda…") : access.active ? __kbUi("Obunani uzaytirish") : __kbUi("To‘lov bo‘yicha so‘rov")}</button>}
        {access.owner && <button className="course-button is-secondary" onClick={onEdit}>{__kbUi("Kursni tahrirlash")}</button>}
        {lessons.some((lesson) => !lesson.locked && Number(lesson.question_count) > 0) && <button className="course-button is-secondary" onClick={() => setTesting(true)}>{__kbUi("Bilimni sinash")}</button>}
        <small>{__kbUi("O‘qish natijalari shaxsiy hisobingizda saqlanadi.")}</small>
      </aside>
    </div>
    {error && <Notice error>{__kbUi(error)}</Notice>}{info && <Notice>{info}</Notice>}
    {paymentForm && <form className="course-payment-form" onSubmit={sendPaymentRequest}><h3>{__kbUi("To‘lovni tekshirishga yuborish")}</h3><p>{__kbUi("O‘qituvchi bilan to‘lov usulini kelishing. Quyidagi so‘rovning o‘zi pul o‘tkazmaydi va kursni ochmaydi. Haqiqiy to‘lov tasdiqlangach 30 kunlik kirish huquqi beriladi.")}</p><label>{__kbUi("To‘lov ma’lumotnomasi")}<input value={reference} onChange={(event) => setReference(event.target.value)} maxLength={120} required placeholder={__kbUi("Masalan: chek yoki o‘tkazma raqami")} /></label><label>{__kbUi("O‘qituvchiga izoh")}<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} rows={3} placeholder={__kbUi("To‘lov sanasi yoki qo‘shimcha izoh. Karta raqami va maxfiy kodlarni yozmang.")} /></label><div className="course-inline-actions"><button className="course-button" disabled={busy || !reference.trim()}>{busy ? __kbUi("Yuborilmoqda…") : __kbUi("Tekshirishga yuborish")}</button><button type="button" className="course-button is-secondary" onClick={() => setPaymentForm(false)}>{__kbUi("Yopish")}</button></div></form>}
    {token && Number(course.price_uzs) > 0 && !access.owner && <section className="course-payment-history"><div className="course-section-heading"><h3>{__kbUi("To‘lov so‘rovlarim")}</h3><button className="course-button is-secondary" onClick={() => setRevision((n) => n + 1)} disabled={paymentHistory.loading}>{__kbUi("Holatini yangilash")}</button></div>{paymentHistory.error && <Notice error>{__kbUi(message(paymentHistory.error))}</Notice>}{(paymentHistory.data?.items || []).map((request) => <div className="course-order" key={request.id}><strong>{__kbUi(money(request.amount_uzs))}{__kbUi(" so‘m · ")}{request.period_days || 30}{__kbUi(" kun")}</strong><span>{request.status === "approved" || request.status === "confirmed" ? __kbUi("To‘lov tasdiqlangan") : request.status === "rejected" ? __kbUi("Rad etilgan") : request.status === "cancelled" ? __kbUi("Bekor qilingan") : request.status === "expired" ? __kbUi("So‘rov muddati tugagan") : __kbUi("O‘qituvchi tekshirishi kutilmoqda")}</span><small>{__kbUi(dateLabel(request.created_at))}{request.reference ? __kbUi(` · ${request.reference}`) : __kbUi("")}</small>{request.decision_note && <p>{request.decision_note}</p>}</div>)}{!paymentHistory.loading && !paymentHistory.error && !paymentHistory.data?.items?.length && <p className="course-muted">{__kbUi("Hali so‘rov yuborilmagan.")}</p>}</section>}

    <div className="course-section-heading"><div><h3>{__kbUi("Kurs dasturi")}</h3><p>{__kbUi("Darsni ochib nazariya, video va mashqlar bilan tanishing.")}</p></div></div>
    <div className="course-curriculum">{lessons.map((lesson, index) => <button key={lesson.id} className={`course-lesson-row ${lesson.locked ? "is-locked" : ""}`} onClick={() => lesson.locked ? setInfo("Bu dars obuna bilan ochiladi. Avval bepul darslarni sinab ko‘rishingiz mumkin.") : setReader(lesson.id)} aria-label={__kbUi(`${index + 1}. ${lesson.title}${lesson.locked ? ", obuna kerak" : ""}`)}><span className="course-lesson-number">{completed.has(Number(lesson.id)) ? <Check size={18} /> : index + 1}</span><span className="course-lesson-title"><strong><TranslatedContent text={lesson.title} showStatus={false}/></strong><small>{[lesson.has_video ? "Video" : null, Number(lesson.exercise_count) ? `${lesson.exercise_count} ta mashq` : null, Number(lesson.question_count) ? `${lesson.question_count} ta savol` : null].filter(Boolean).join(" · ") || __kbUi("Nazariya va materiallar")}</small></span>{lesson.is_preview && <span className="course-trial-badge">{__kbUi("Bepul")}</span>}{lesson.status === "draft" && <span className="course-trial-badge">{__kbUi("Qoralama")}</span>}{lesson.locked ? <LockKeyhole size={18} /> : <ArrowRight size={18} />}</button>)}</div>
    {!lessons.length && <Empty>{__kbUi("Kurs darslari hali chiqarilmagan.")}</Empty>}
  </div>;
}

function CourseReader({ apiBase, token, course, lessons, lessonId, completed, onSelect, onBack, onTest, onProgress, onLogin, active = true }) {
  useKbInterfaceLocale();
  const [revision, setRevision] = useState(0);
  const state = useCourseQuery(apiBase, token, `${ROOT}/lessons/${lessonId}`, revision);
  const [progress, setProgress] = useState(null); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const [fileBusy, setFileBusy] = useState(null); const [filePreview, setFilePreview] = useState(null);
  const [contentTab, setContentTab] = useState("lesson"); const fileController = useRef(null); const live = useRef(true);
  const lesson = state.data?.lesson; const content = lesson?.content || {};
  const available = lessons.filter((item) => !item.locked);
  const currentIndex = available.findIndex((item) => Number(item.id) === Number(lessonId));
  const done = progress?.status === "completed" || state.data?.progress?.status === "completed" || completed.has(Number(lessonId));
  useEffect(() => { live.current = true; return () => { live.current = false; fileController.current?.abort(); }; }, []);
  useEffect(() => { if (!filePreview) return undefined; return () => URL.revokeObjectURL(filePreview.url); }, [filePreview]);
  useEffect(() => {
    if (!token || !lesson) return undefined;
    const controller = new AbortController();
    // Opening a lesson records studying only. It never asserts that a video was watched.
    courseRequest(apiBase, token, `${ROOT}/lessons/${lessonId}/progress`, { method: "POST", body: { position_seconds: Number(state.data?.progress?.position_seconds) || 0, duration_seconds: Number(state.data?.progress?.duration_seconds) || 0, status: "studying" }, signal: controller.signal }).catch(() => { /* Manual save remains available with an explicit error. */ });
    return () => controller.abort();
  }, [apiBase, token, lessonId, Boolean(lesson)]);
  const finish = async () => {
    if (!token) { onLogin?.(); return; }
    if (saving) return;
    setSaving(true); setError("");
    try {
      const result = await courseRequest(apiBase, token, `${ROOT}/lessons/${lessonId}/progress`, { method: "POST", body: { position_seconds: Number(state.data?.progress?.position_seconds) || 0, duration_seconds: Number(state.data?.progress?.duration_seconds) || 0, status: "completed" } });
      if (live.current) { setProgress(result.progress); onProgress?.(result.progress); }
    } catch (err) { if (live.current) setError(message(err)); }
    finally { if (live.current) setSaving(false); }
  };
  const openFile = async (assetId, index) => {
    fileController.current?.abort(); const controller = new AbortController(); fileController.current = controller;
    setFileBusy(assetId); setError(""); setFilePreview(null);
    try {
      const blob = await fetchCourseBlob(apiBase, token, lessonId, assetId, { signal: controller.signal });
      if (controller.signal.aborted || !live.current) return;
      if (!blob?.type || !(blob.type === "application/pdf" || /^image\/(png|jpeg|webp|gif)$/.test(blob.type))) throw new Error("Ushbu materialni brauzerda ochib bo‘lmadi.");
      setFilePreview({ url: URL.createObjectURL(blob), type: blob.type, title: `Material ${index + 1}` });
    } catch (err) { if (!controller.signal.aborted && live.current) setError(message(err)); }
    finally { if (!controller.signal.aborted && live.current) setFileBusy(null); }
  };
  if (state.loading) return <Loading />;
  if (state.error) return <><button className="course-back" onClick={onBack}><ArrowLeft size={18} />{__kbUi("Kurs dasturiga qaytish")}</button><Notice error>{__kbUi(message(state.error))} <button onClick={() => setRevision((n) => n + 1)}>{__kbUi("Qayta urinish")}</button></Notice></>;
  if (!lesson) return <Empty>{__kbUi("Dars topilmadi.")}</Empty>;
  return <div className="course-reader"><button className="course-back" onClick={onBack}><ArrowLeft size={18} /><TranslatedContent text={course.title} showStatus={false}/></button>
    <div className="course-reader-heading"><div><p className="course-eyebrow">{Math.max(1, lessons.findIndex((item) => Number(item.id) === Number(lessonId)) + 1)}{__kbUi("-DARS")}{lesson.is_preview ? __kbUi(" · BEPUL") : __kbUi("")}</p><h2><TranslatedContent text={lesson.title} showStatus={false}/></h2></div><label className="course-lesson-picker">{__kbUi("Darsni tanlash")}<select value={lessonId} onChange={(event) => onSelect(Number(event.target.value))}>{lessons.map((item) => <option key={item.id} value={item.id} disabled={item.locked}>{item.locked ? __kbUi("🔒 ") : __kbUi("")}{item.title}</option>)}</select></label></div>
    {!token && <Notice>{__kbUi("Bu darsni bepul o‘qishingiz mumkin. Mashqlarni tekshirish va natijalarni saqlash uchun ")}<button onClick={onLogin}>{__kbUi("hisobga kiring")}</button>.</Notice>}
    {content.video_id && <CourseVideo active={active} apiBase={apiBase} token={token} lessonId={lessonId} title={lesson.title} />}
    <div className="course-reader-tabs" role="tablist" aria-label={__kbUi("Dars mazmuni")}><button id="course-tab-lesson" role="tab" aria-selected={contentTab === "lesson"} aria-controls="course-content-lesson" onClick={() => setContentTab("lesson")}>{__kbUi("Nazariya va misollar")}</button><button id="course-tab-exercise" role="tab" aria-selected={contentTab === "exercise"} aria-controls="course-content-exercise" onClick={() => setContentTab("exercise")}>{__kbUi("Qisqa javobli mashqlar ")}<span>{content.exercises?.length || 0}</span></button></div>
    {contentTab === "lesson" && <section className="course-reader-content" id="course-content-lesson" role="tabpanel" aria-labelledby="course-tab-lesson">
      {content.theory && <article className="course-theory"><h3>{__kbUi("Mavzu tushuntirishi")}</h3><CourseText>{content.theory}</CourseText></article>}
      {(content.examples || []).map((example, index) => <article className="course-example" key={index}><span className="course-eyebrow">{index + 1}{__kbUi("-MISOL")}</span><CourseText>{example.prompt}</CourseText><details><summary>{__kbUi("Yechimini o‘rganish")}</summary><div className="course-solution"><CourseText>{example.solution}</CourseText></div></details></article>)}
      {!content.theory && !content.examples?.length && <p className="course-muted">{__kbUi("Ushbu darsning video, material yoki mashq bo‘limidan foydalaning.")}</p>}
      {content.attachments?.length > 0 && <section className="course-attachments"><h3>{__kbUi("Dars materiallari")}</h3><div className="course-inline-actions">{content.attachments.map((assetId, index) => <button className="course-button is-secondary" key={assetId} onClick={() => openFile(assetId, index)} disabled={fileBusy === assetId}><FileText size={18} />{fileBusy === assetId ? __kbUi("Ochilmoqda…") : __kbUi(`Material ${index + 1}`)}</button>)}</div></section>}
      {filePreview && <section className="course-file-preview"><div className="course-section-heading"><h3>{filePreview.title}</h3><button className="course-icon-button" aria-label={__kbUi("Materialni yopish")} onClick={() => setFilePreview(null)}><X size={18} /></button></div>{filePreview.type === "application/pdf" ? <iframe src={filePreview.url} title={filePreview.title} /> : <img src={filePreview.url} alt={filePreview.title} />}<a href={filePreview.url} download={filePreview.type === "application/pdf" ? "dars-materiali.pdf" : "dars-materiali"} className="course-button is-secondary">{__kbUi("Materialni saqlash")}</a></section>}
    </section>}
    {contentTab === "exercise" && <section className="course-reader-content" id="course-content-exercise" role="tabpanel" aria-labelledby="course-tab-exercise"><p className="course-muted">{__kbUi("Qisqa javob yoki son kiriting. Batafsil yozma yechim bu yerda avtomatik baholanmaydi.")}</p>{(content.exercises || []).map((exercise, index) => <CourseExercise key={exercise.id} apiBase={apiBase} token={token} lessonId={lessonId} exercise={exercise} index={index} onLogin={onLogin} />)}{!content.exercises?.length && <Empty>{__kbUi("Bu darsga mustaqil mashq qo‘shilmagan.")}</Empty>}<button className="course-button is-secondary" onClick={onTest}>{__kbUi("Shu mavzudan test ishlash")}<ArrowRight size={16} /></button></section>}
    {error && <Notice error>{__kbUi(error)}</Notice>}
    <footer className="course-reader-footer"><div><button className="course-button" disabled={saving || done} onClick={finish}><CheckCircle2 size={18} />{done ? __kbUi("Dars tugallangan") : saving ? __kbUi("Saqlanmoqda…") : __kbUi("Darsni o‘qib bo‘ldim")}</button><small>{__kbUi("O‘qib tugatish belgisi. Bilim darajasi mashq va testda alohida aniqlanadi.")}</small></div>{available[currentIndex + 1] && <button className="course-button is-secondary" onClick={() => onSelect(available[currentIndex + 1].id)}>{__kbUi("Keyingi ochiq dars")}<ArrowRight size={18} /></button>}</footer>
  </div>;
}

function CourseVideo({ apiBase, token, lessonId, title, active = true }) {
  useKbInterfaceLocale();
  const [enabled, setEnabled] = useState(false); const [visible, setVisible] = useState(typeof document === "undefined" || document.visibilityState !== "hidden");
  const [revision, setRevision] = useState(0); const iframe = useRef(null);
  const state = useCourseQuery(apiBase, token, enabled ? `${ROOT}/lessons/${lessonId}/playback` : null, revision);
  const pause = () => iframe.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "https://www.youtube-nocookie.com");
  useEffect(() => { const change = () => { const shown = document.visibilityState !== "hidden"; setVisible(shown); if (!shown) pause(); }; document.addEventListener("visibilitychange", change); return () => document.removeEventListener("visibilitychange", change); }, []);
  useEffect(() => { if (!active) pause(); }, [active]);
  const url = courseYoutubePlayerUrl(state.data?.url, typeof window === "undefined" ? "" : window.location.origin);
  return <section className="course-video-section" aria-label={__kbUi("Dars videosi")}><div className="course-video-frame">
    {!enabled && <button className="course-video-start" onClick={() => setEnabled(true)}><span><Play size={30} fill="currentColor" /></span>{__kbUi("Videoni ochish")}<small>{__kbUi("Darsni shu yerda tomosha qiling")}</small></button>}
    
    {enabled && state.loading && <Loading />}
    {enabled && state.error && <Notice error>{__kbUi(message(state.error))} <button onClick={() => setRevision((n) => n + 1)}>{__kbUi("Qayta urinish")}</button></Notice>}
    {enabled && url && <iframe ref={iframe} key={url} src={url} onLoad={() => { if (!active || document.visibilityState === "hidden") pause(); }} title={__kbUi(`${title} — video`)} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
    {enabled && state.data && !url && <Notice error>{__kbUi("Video manzili yaroqsiz.")}</Notice>}
  </div>{enabled && !visible && <p className="course-video-notice">{__kbUi("Video to‘xtatildi. Qaytgach pleyerdagi davom ettirish tugmasini bosing.")}</p>}{enabled && url && <p className="course-video-notice">{__kbUi("Video ochilmasa, uni YouTube’da joylagan ustozdan video ko‘rishga va saytga joylashga ruxsat berilganini tekshirishni so‘rang.")}</p>}{state.data?.notice && <p className="course-video-notice">{__kbUi(state.data.notice)}</p>}{enabled && <button className="course-video-close" onClick={() => setEnabled(false)}>{__kbUi("Videoni yopish")}</button>}</section>;
}

function CourseExercise({ apiBase, token, lessonId, exercise, index, onLogin }) {
  useKbInterfaceLocale();
  const [answer, setAnswer] = useState(""); const [result, setResult] = useState(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const live = useRef(true); const controller = useRef(null);
  useEffect(() => { live.current = true; return () => { live.current = false; controller.current?.abort(); }; }, []);
  const check = async (event) => {
    event.preventDefault(); if (!token) { onLogin?.(); return; } if (busy) return;
    setBusy(true); setError(""); controller.current = new AbortController();
    try {
      const data = await courseRequest(apiBase, token, `${ROOT}/lessons/${lessonId}/exercises/${encodeURIComponent(exercise.id)}/answer`, { method: "POST", body: { answer }, signal: controller.current.signal });
      if (live.current) setResult(data);
    } catch (err) { if (live.current) setError(message(err)); }
    finally { if (live.current) setBusy(false); }
  };
  return <article className="course-exercise"><span className="course-eyebrow">{index + 1}{__kbUi("-MASHQ")}</span><CourseText>{exercise.prompt}</CourseText><form onSubmit={check}><label>{__kbUi("Javobingiz")}<textarea rows={2} maxLength={4000} value={answer} onChange={(event) => { setAnswer(event.target.value); setResult(null); }} placeholder={__kbUi("Javobni yozing")} disabled={busy} /></label><button className="course-button" disabled={busy || !answer.trim()}>{busy ? __kbUi("Tekshirilmoqda…") : __kbUi("Javobni tekshirish")}</button></form>{error && <Notice error>{__kbUi(error)}</Notice>}{result && <div className={`course-exercise-result ${result.correct ? "is-correct" : "is-incorrect"}`} role="status"><strong>{result.correct ? __kbUi("To‘g‘ri javob!") : __kbUi("Javobni qayta ko‘rib chiqing.")}</strong>{!result.correct && result.expected_answer && <><span>{__kbUi("Kutilgan javob:")}</span><CourseText>{result.expected_answer}</CourseText></>}{result.explanation && <CourseText>{result.explanation}</CourseText>}{result.notice && <p className="course-muted">{__kbUi(result.notice)}</p>}</div>}</article>;
}

function CourseTest({ apiBase, token, user, course, lessons, progress, initialLessonId, onBack, onLogin }) {
  useKbInterfaceLocale();
  const eligible = lessons.filter((lesson) => !lesson.locked && Number(lesson.question_count) > 0);
  const [scope, setScope] = useState("selected"); const [selected, setSelected] = useState(() => initialLessonId ? [Number(initialLessonId)] : eligible.map((lesson) => Number(lesson.id)));
  const [count, setCount] = useState(20); const [difficulty, setDifficulty] = useState("mixed"); const [minutes, setMinutes] = useState(30);
  const [attempt, setAttempt] = useState(null); const [answers, setAnswers] = useState({}); const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [saveState, setSaveState] = useState("");
  const [remaining, setRemaining] = useState(null); const [submitConfirm, setSubmitConfirm] = useState(false);
  const storageKey = courseAttemptStorageKey(apiBase, user, course.id);
  const [restoreId, setRestoreId] = useState(() => storedAttempt(storageKey));
  const active = useRef(true); const requestController = useRef(null); const creating = useRef(false); const submissionLock = useRef(false);
  const dirtyVersion = useRef(0); const savedVersion = useRef(0); const savedAnswers = useRef({}); const savingPromise = useRef(null); const saveAgain = useRef(false);
  const currentAnswers = useRef(answers); currentAnswers.current = answers;
  const currentAttempt = useRef(attempt); currentAttempt.current = attempt;
  const testKey = useRef(requestKey());
  useEffect(() => { active.current = true; return () => { active.current = false; requestController.current?.abort(); }; }, []);
  const clearStored = () => { storedAttempt(storageKey, null); setRestoreId(null); };
  const acceptAttempt = (data) => {
    const next = data.attempt;
    if (!next?.id || !Array.isArray(next.questions)) throw new Error("Test savollari olinmadi. Qayta urinib ko‘ring.");
    const loaded = courseAttemptAnswers(next.questions, next.answers);
    setAttempt(next); setAnswers(loaded); currentAnswers.current = loaded; savedAnswers.current = loaded;
    dirtyVersion.current = 0; savedVersion.current = 0;
    storedAttempt(storageKey, next.id); setRestoreId(String(next.id));
    if (data.result || next.result) { setResult(data.result || next.result); clearStored(); }
    if (data.available_count != null && next.questions.length < count) setNotice(`Tanlangan shartga ${next.questions.length} ta savol bor. Test mavjud savollar bilan tuzildi.`);
  };
  const restore = async () => {
    if (!restoreId || !token || creating.current) return;
    creating.current = true; setBusy(true); setError(""); requestController.current = new AbortController();
    try {
      const data = await courseRequest(apiBase, token, `${ROOT}/attempts/${encodeURIComponent(restoreId)}`, { signal: requestController.current.signal });
      if (!active.current) return; acceptAttempt(data);
      if (["submitted", "expired", "completed"].includes(data.attempt?.status) && !(data.result || data.attempt.result)) {
        const final = await courseRequest(apiBase, token, `${ROOT}/attempts/${encodeURIComponent(restoreId)}/submit`, { method: "POST", body: { answers: data.attempt.answers || {} }, signal: requestController.current.signal });
        if (active.current) { setResult(final.result); clearStored(); }
      }
    } catch (err) { if (active.current) { setError(message(err)); if ([401, 403, 404, 410].includes(err.status)) clearStored(); } }
    finally { creating.current = false; if (active.current) setBusy(false); }
  };
  const start = async (event) => {
    event.preventDefault(); if (!token) { onLogin?.(); return; } if (creating.current) return;
    creating.current = true; setBusy(true); setError(""); setNotice(""); requestController.current = new AbortController();
    try {
      const data = await courseRequest(apiBase, token, `${ROOT}/courses/${course.id}/attempts`, { method: "POST", body: { lesson_ids: scope === "selected" ? selected : [], scope, count: Number(count), difficulty, minutes: Number(minutes), request_key: testKey.current }, signal: requestController.current.signal });
      if (active.current) acceptAttempt(data);
    } catch (err) { if (active.current) setError(message(err)); }
    finally { creating.current = false; if (active.current) setBusy(false); }
  };
  const persist = useCallback(async () => {
    if (!active.current || !currentAttempt.current || submissionLock.current || dirtyVersion.current === savedVersion.current) return;
    if (savingPromise.current) { saveAgain.current = true; return savingPromise.current; }
    const snapshot = { ...currentAnswers.current }; const version = dirtyVersion.current;
    setSaveState("Saqlanmoqda…");
    savingPromise.current = courseRequest(apiBase, token, `${ROOT}/attempts/${encodeURIComponent(currentAttempt.current.id)}/answers`, { method: "POST", body: { answers: snapshot } }).then(() => {
      savedVersion.current = version; savedAnswers.current = snapshot;
      if (active.current) setSaveState("Javoblar saqlandi");
    }).catch((err) => { if (active.current) { setSaveState("Saqlanmadi — qayta urinishingiz mumkin"); setError(message(err)); } }).finally(() => { savingPromise.current = null; });
    await savingPromise.current;
    if (saveAgain.current && active.current) { saveAgain.current = false; return persist(); }
  }, [apiBase, token]);
  useEffect(() => {
    if (!attempt || result || dirtyVersion.current === savedVersion.current) return undefined;
    const timer = setTimeout(() => { persist(); }, 700);
    return () => clearTimeout(timer);
  }, [answers, attempt?.id, result, persist]);
  useEffect(() => {
    if (!attempt || result) return undefined;
    const tick = () => setRemaining(Math.max(0, Math.ceil((Date.parse(attempt.expires_at) - Date.now()) / 1000)));
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [attempt?.id, attempt?.expires_at, result]);
  useEffect(() => {
    if (!attempt || result) return undefined;
    const onUnload = (event) => { if (dirtyVersion.current !== savedVersion.current) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", onUnload); return () => window.removeEventListener("beforeunload", onUnload);
  }, [attempt?.id, result]);
  const submit = async () => {
    if (!attempt || submissionLock.current) return;
    submissionLock.current = true; setBusy(true); setError(""); setSubmitConfirm(false);
    try {
      // Wait for an in-flight autosave so it cannot arrive after final submission.
      if (savingPromise.current) await savingPromise.current;
      const data = await courseRequest(apiBase, token, `${ROOT}/attempts/${encodeURIComponent(attempt.id)}/submit`, { method: "POST", body: { answers: courseAttemptAnswers(attempt.questions, currentAnswers.current) } });
      if (active.current) { setResult(data.result); clearStored(); setSaveState(""); }
    } catch (err) { if (active.current) setError(message(err)); }
    finally { submissionLock.current = false; if (active.current) setBusy(false); }
  };
  const leave = async () => {
    if (busy || submissionLock.current) return;
    await persist();
    if (dirtyVersion.current !== savedVersion.current) { setError("Oxirgi javoblar saqlanmadi. Qayta saqlab, keyin darsga qayting."); return; }
    onBack();
  };
  const finished = new Set(progress.filter((record) => record.status === "completed").map((record) => Number(record.lesson_id)));
  if (result) return <section className="course-test-results"><button className="course-back" onClick={onBack}><ArrowLeft size={18} />{__kbUi("Darsga qaytish")}</button><div className="course-result-summary"><CheckCircle2 size={40} /><h2>{__kbUi("Natijangiz: ")}{result.correct} / {result.total}</h2><p>{Number(result.percent).toFixed(0)}{__kbUi("% to‘g‘ri javob")}</p><button className="course-button is-secondary" onClick={() => { setAttempt(null); setResult(null); setAnswers({}); setError(""); setNotice(""); testKey.current = requestKey(); }}>{__kbUi("Yangi test tanlash")}</button></div>{(result.items || []).map((item, index) => <article className={`course-result-item ${item.selected === item.correct_index ? "is-correct" : "is-incorrect"}`} key={item.id}><span className="course-eyebrow">{index + 1}{__kbUi("-SAVOL")}</span><CourseText>{item.prompt}</CourseText><p>{__kbUi("Sizning javobingiz: ")}{Number.isInteger(item.selected) ? __kbUi(`${String.fromCharCode(65 + item.selected)}. ${item.options?.[item.selected] || ""}`) : __kbUi("Javob belgilanmagan")}</p><p>{__kbUi("To‘g‘ri javob: ")}{__kbUi(String.fromCharCode(65 + Number(item.correct_index)))}. {item.options?.[item.correct_index]}</p>{item.explanation && <CourseText>{item.explanation}</CourseText>}</article>)}</section>;
  return <section className="course-test"><button className="course-back" onClick={leave} disabled={busy}><ArrowLeft size={18} />{__kbUi("Darsga qaytish")}</button><div className="course-section-heading"><div><p className="course-eyebrow"><TranslatedContent text={course.title} showStatus={false}/></p><h2>{attempt ? __kbUi("Bilimingizni sinang") : __kbUi("Qaysi mavzularni takrorlaymiz?")}</h2></div>{attempt && <div className="course-test-clock" role="timer" aria-label={__kbUi("Qolgan vaqt")}><Clock size={19} />{Number.isFinite(remaining) ? __kbUi(`${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`) : __kbUi("—")}</div>}</div>
    {error && <Notice error>{__kbUi(error)}</Notice>}{notice && <Notice>{__kbUi(notice)}</Notice>}
    {!attempt && restoreId && <Notice>{__kbUi("Oldin boshlangan testingiz bor. ")}<button onClick={restore} disabled={busy}>{busy ? __kbUi("Ochilmoqda…") : __kbUi("Testni davom ettirish")}</button><button onClick={() => { clearStored(); testKey.current = requestKey(); }} disabled={busy}>{__kbUi("Yangi testni tanlash")}</button></Notice>}
    {!attempt && <form className="course-test-setup" onSubmit={start}><fieldset><legend>{__kbUi("Mavzular")}</legend><label className="course-choice"><input type="radio" checked={scope === "selected"} onChange={() => setScope("selected")} name="course-test-scope" />{__kbUi("O‘zim tanlayman")}</label><label className="course-choice"><input type="radio" checked={scope === "completed"} onChange={() => setScope("completed")} name="course-test-scope" />{__kbUi("O‘qib tugatgan mavzularim (")}{eligible.filter((lesson) => finished.has(Number(lesson.id))).length})</label></fieldset>
      {scope === "selected" && <fieldset className="course-test-lessons"><legend>{__kbUi("Test uchun darslarni belgilang")}</legend>{eligible.map((lesson) => <label className="course-choice" key={lesson.id}><input type="checkbox" checked={selected.includes(Number(lesson.id))} onChange={(event) => setSelected((old) => event.target.checked ? [...old, Number(lesson.id)] : old.filter((id) => id !== Number(lesson.id)))} /><span><TranslatedContent text={lesson.title} showStatus={false}/><small>{lesson.question_count}{__kbUi(" ta savol")}</small></span></label>)}</fieldset>}
      <div className="course-test-controls"><label>{__kbUi("Savollar soni")}<select value={count} onChange={(event) => setCount(Number(event.target.value))}>{[5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => <option key={n} value={n}>{__kbUi(n)}{__kbUi(" ta")}</option>)}</select></label><label>{__kbUi("Qiyinlik")}<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="mixed">{__kbUi("Aralash")}</option><option value="easy">{__kbUi("Oson")}</option><option value="medium">{__kbUi("O‘rtacha")}</option><option value="hard">{__kbUi("Qiyin")}</option></select></label><label>{__kbUi("Umumiy vaqt (daqiqa)")}<input type="number" min={1} max={180} value={minutes} onChange={(event) => setMinutes(event.target.value)} required /></label></div>
      <p className="course-muted">{__kbUi("Savollar tanlangan darslardan olinadi. Yetarli savol bo‘lmasa, mavjud soni bilan boshlanadi. Vaqt testdan chiqib ketsangiz ham davom etadi.")}</p>
      {!eligible.length && <Notice>{__kbUi("Hozir ochiq darslaringizda test savollari yo‘q.")}</Notice>}<button className="course-button" disabled={busy || !eligible.length || (scope === "selected" ? !selected.length : !eligible.some((lesson) => finished.has(Number(lesson.id))))}>{busy ? __kbUi("Test tayyorlanmoqda…") : token ? __kbUi("Testni boshlash") : __kbUi("Kirish va testni boshlash")}<ArrowRight size={18} /></button></form>}
    {attempt && <><div className="course-test-status"><span>{Object.keys(answers).length} / {attempt.questions.length}{__kbUi(" ta javob belgilangan")}</span><span role="status">{saveState}</span><button onClick={persist} disabled={busy}>{__kbUi("Saqlash")}</button></div>{remaining === 0 && <Notice>{__kbUi("Vaqt tugadi. Serverda vaqtida saqlangan javoblar hisoblanadi. Natijani oching.")}</Notice>}
      {attempt.questions.map((question, index) => <fieldset className="course-question" key={question.id} disabled={busy || remaining === 0}><legend>{index + 1}{__kbUi("-savol")}</legend><CourseText>{question.prompt}</CourseText><div className="course-options">{(question.options || []).map((option, optionIndex) => <label className={`course-option ${answers[question.id] === optionIndex ? "is-selected" : ""}`} key={optionIndex}><input type="radio" name={`course-question-${question.id}`} checked={answers[question.id] === optionIndex} onChange={() => { dirtyVersion.current += 1; setAnswers((old) => ({ ...old, [question.id]: optionIndex })); setSaveState("Saqlash kutilmoqda…"); }} /><span className="course-option-letter">{__kbUi(String.fromCharCode(65 + optionIndex))}</span><CourseText>{option}</CourseText></label>)}</div></fieldset>)}
      {submitConfirm ? <div className="course-submit-confirm" role="alert"><p>{attempt.questions.length - Object.keys(answers).length > 0 ? __kbUi(`${attempt.questions.length - Object.keys(answers).length} ta savol javobsiz. `) : __kbUi("")}{__kbUi("Testni yakunlaysizmi? Yakunlangach javoblar o‘zgarmaydi.")}</p><div className="course-inline-actions"><button className="course-button" onClick={submit} disabled={busy}>{__kbUi("Ha, natijani ko‘rish")}</button><button className="course-button is-secondary" onClick={() => setSubmitConfirm(false)}>{__kbUi("Davom etish")}</button></div></div> : <button className="course-button" disabled={busy} onClick={() => setSubmitConfirm(true)}>{busy ? __kbUi("Natija olinmoqda…") : remaining === 0 ? __kbUi("Natijani ochish") : __kbUi("Testni yakunlash")}<CheckCircle2 size={18} /></button>}
    </>}
  </section>;
}
