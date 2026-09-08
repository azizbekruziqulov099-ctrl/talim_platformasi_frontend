import React, { useEffect, useState } from "react";
import "./student-schedule.css";

const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const TYPES = [["lesson", "📘 Yangi mavzu"], ["review", "🔁 Takrorlash"], ["problem", "🧩 Masala yechish"], ["control", "📝 Nazorat ishi"], ["project", "🛠 Loyiha ishi"], ["oral", "🗣 Og‘zaki mashq"]];
const CLUBS = [["chess", "♟️ Shaxmat"], ["football", "⚽ Futbol"], ["robotics", "🤖 Robototexnika"], ["coding", "💻 Dasturlash"], ["art", "🎨 Rasm va dizayn"], ["music", "🎵 Musiqa / vokal"], ["dance", "💃 Raqs"], ["swimming", "🏊 Suzish"], ["craft", "🧵 Milliy hunar"], ["reading", "📚 Kitobxonlik"], ["language", "🌍 Til klubi"], ["other", "✨ Boshqa"]];

function gradeOf(value) {
  const match = String(value || "").match(/(?:^|\D)(1[01]|[1-9])(?:\D|$)/);
  return match ? Number(match[1]) : 5;
}
function defaultShift(grade) { return [1, 3, 5, 6, 7].includes(grade) ? 2 : 1; }
function lessonTimes(shift) {
  const start = shift === 2 ? 13 * 60 + 30 : 8 * 60;
  return Array.from({ length: 8 }, (_, i) => {
    const from = start + i * 50; const to = from + 45;
    const fmt = n => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
    return `${fmt(from)}–${fmt(to)}`;
  });
}
function emptySchedule(grade) { return DAYS.slice(0, grade <= 4 ? 5 : 6).map(day => ({ day, lessons: [] })); }
function typeLabel(key) { return TYPES.find(item => item[0] === key)?.[1] || TYPES[0][1]; }

function TopicModal({ base, token, studentId, grade, lesson, onChange, onClose }) {
  const [topics, setTopics] = useState([]); const [query, setQuery] = useState(""); const [state, setState] = useState("Mavzular yuklanmoqda…");
  useEffect(() => {
    let live = true;
    fetch(`${base}/api/oquvchi/jadval-mavzular?token=${encodeURIComponent(token)}&bola_id=${encodeURIComponent(studentId)}&fan=${encodeURIComponent(lesson.subject)}`, { cache: "no-store" })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Mavzular olinmadi"); return data; })
      .then(data => { if (live) { setTopics(data.mavzular || []); setState(""); } })
      .catch(error => { if (live) setState(error.message); });
    return () => { live = false; };
  }, [base, lesson.subject, studentId, token]);
  const shown = topics.filter(item => !query || `${item.nomi} ${item.bob_nomi || ""}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="schedule-modal"><div className="schedule-modal__card">
    <header><div><small>{grade}-sinf · {lesson.subject}</small><h3>Dars turi va mavzu</h3></div><button onClick={onClose}>×</button></header>
    <div className="schedule-type-list">{TYPES.map(([key, label]) => <button key={key} className={lesson.activity_type === key ? "active" : ""} onClick={() => onChange({ activity_type: key })}>{label}</button>)}</div>
    <input className="schedule-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="TTS mavzularidan izlash…" />
    {state ? <p className="schedule-topic-state">{state}</p> : !shown.length ? <p className="schedule-topic-state">Bu fan uchun TTS mavzusi topilmadi.</p> : <div className="schedule-topic-list">{shown.map(item => <button key={item.topic_code} className={lesson.topic_code === item.topic_code ? "active" : ""} onClick={() => { onChange({ topic_code: item.topic_code, topic: item.nomi }); onClose(); }}><b>{item.nomi}</b><small>{[item.chorak, item.bob_nomi].filter(Boolean).join(" · ")}</small></button>)}</div>}
  </div></div>;
}

function ClubModal({ value, onSave, onClose }) {
  const [form, setForm] = useState(value || { id: `extra-${Date.now()}`, club_type: "chess", name: "Shaxmat", day: "Dushanba", time: "16:00", note: "" });
  function selectType(key) { const name = CLUBS.find(item => item[0] === key)?.[1].replace(/^\S+\s/, "") || "To‘garak"; setForm(old => ({ ...old, club_type: key, name: key === "other" ? old.name : name })); }
  return <div className="schedule-modal"><div className="schedule-modal__card"><header><div><small>MAKTAB FANIDAN TASHQARI</small><h3>Qo‘shimcha to‘garak</h3></div><button onClick={onClose}>×</button></header>
    <div className="schedule-club-types">{CLUBS.map(([key, label]) => <button key={key} className={form.club_type === key ? "active" : ""} onClick={() => selectType(key)}>{label}</button>)}</div>
    <div className="schedule-club-fields"><label>Nomi<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>Kun<select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>{DAYS.map(day => <option key={day}>{day}</option>)}</select></label><label>Vaqt<input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></label><label>Izoh<input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Manzil yoki ustoz" /></label></div>
    <button className="schedule-main-button" onClick={() => { if (form.name.trim()) { onSave(form); onClose(); } }}>To‘garakni jadvalga qo‘shish</button>
  </div></div>;
}

function Lesson({ lesson, editing, onTopic, onTest }) {
  return <div className="student-schedule__lesson"><b>{lesson.order}</b><div><span>{lesson.time}</span>{editing ? <><strong>{lesson.subject}</strong><button className="student-schedule__topic-button" onClick={onTopic}><small>{typeLabel(lesson.activity_type)}</small><strong>{lesson.topic || "TTS mavzusini tanlang"}</strong></button></> : <><strong>{lesson.subject}</strong><small>{lesson.topic || "Mavzu hali tanlanmagan"}</small>{lesson.topic && <i>{typeLabel(lesson.activity_type)}</i>}</>}</div>{!editing && lesson.topic_code && <button title="Shu mavzudan test" onClick={onTest}>✓</button>}</div>;
}

export default function StudentScheduleWorkspace({ token, student, apiBase, onOpenTest, readOnly = false, compactTitle = false }) {
  const grade = gradeOf(student?.class); const studentId = student?.user_id;
  const base = apiBase || import.meta.env.VITE_API_BASE || "https://talimplatformasi-production.up.railway.app";
  const storageKey = `samtm-weekly-schedule:${studentId || "guest"}`;
  const [shift, setShift] = useState(defaultShift(grade)); const [schedule, setSchedule] = useState(() => emptySchedule(grade)); const [clubs, setClubs] = useState([]);
  const [editing, setEditing] = useState(false); const [status, setStatus] = useState("Tasdiqlangan jadval olinmoqda…"); const [source, setSource] = useState("loading");
  const [selectedDay, setSelectedDay] = useState(Math.max(0, Math.min(5, new Date().getDay() - 1))); const [topicModal, setTopicModal] = useState(null); const [clubModal, setClubModal] = useState(null);
  const today = Math.max(0, Math.min(schedule.length - 1, new Date().getDay() - 1));

  useEffect(() => {
    let live = true; const local = (() => { try { return JSON.parse(localStorage.getItem(storageKey)); } catch { return null; } })();
    if (!token || !studentId) { setStatus("O‘quvchi ma’lumoti topilmadi"); setSource("error"); return () => { live = false; }; }
    fetch(`${base}/api/oquvchi/haftalik-jadval?token=${encodeURIComponent(token)}&bola_id=${encodeURIComponent(studentId)}`, { cache: "no-store" }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Jadval olinmadi"); return data; }).then(data => {
      if (!live) return; setSchedule(data.schedule || emptySchedule(grade)); setClubs(data.extracurriculars || []); setShift(data.shift || defaultShift(grade)); setSource(data.source);
      setStatus(data.source === "saved" ? "Tasdiqlangan reja asosidagi shaxsiy jadval" : data.source === "approved_curriculum" ? `Maktab tasdiqlagan o‘quv reja · ${data.weekly_hours || 0} soat` : data.source === "no_approved_curriculum" ? "Maktab o‘quv rejani hali tasdiqlamagan" : "Tashkilot ulanmagan — taxminiy jadval");
    }).catch(error => { if (!live) return; if (local?.schedule) { setSchedule(local.schedule); setClubs(local.extracurriculars || []); setShift(local.shift || defaultShift(grade)); setStatus("Qurilmadagi oxirgi jadval"); setSource("local"); } else { setStatus(error.message); setSource("error"); } });
    return () => { live = false; };
  }, [base, grade, storageKey, studentId, token]);

  function updateLesson(dayIndex, lessonIndex, patch) { setSchedule(old => old.map((day, di) => di !== dayIndex ? day : { ...day, lessons: day.lessons.map((lesson, li) => li !== lessonIndex ? lesson : { ...lesson, ...patch }) })); }
  function changeShift(value) { const next = Number(value); setShift(next); setSchedule(old => old.map(day => ({ ...day, lessons: day.lessons.map((lesson, index) => ({ ...lesson, time: lessonTimes(next)[index] || lesson.time })) }))); }
  function saveClub(item) { setClubs(old => [...old.filter(club => club.id !== item.id), item]); }
  async function save() {
    const payload = { bola_id: studentId, shift, schedule, extracurriculars: clubs }; localStorage.setItem(storageKey, JSON.stringify(payload)); setStatus("Saqlanmoqda…");
    try { const response = await fetch(`${base}/api/oquvchi/haftalik-jadval?token=${encodeURIComponent(token)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Serverga saqlanmadi"); setSchedule(data.schedule); setClubs(data.extracurriculars || []); setStatus("Jadval saqlandi"); } catch { setStatus("Qurilmaga saqlandi; internet kelganda yana saqlang"); } finally { setEditing(false); }
  }
  const activeDay = schedule[selectedDay] || schedule[0];
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const current = schedule[today]?.lessons?.find(lesson => { const [start, end] = lesson.time.split("–").map(value => { const [hour, minute] = value.split(":").map(Number); return hour * 60 + minute; }); return currentMinutes >= start && currentMinutes <= end; }) || schedule[today]?.lessons?.find(lesson => Number(lesson.time.slice(0, 2)) * 60 + Number(lesson.time.slice(3, 5)) > currentMinutes);

  return <section className={`student-schedule ${readOnly ? "is-readonly" : ""}`}>
    <div className="student-schedule__hero"><div><span className="student-schedule__eyebrow">{readOnly ? "FARZANDINGIZNING HAFTASI" : "BUGUNGI TA’LIM MAYDONI"}</span><h2>{compactTitle ? "Haftalik dars jadvali" : `Salom, ${student?.full_name || "o‘quvchi"}!`}</h2><p>{status}</p></div>{!readOnly && <div className="student-schedule__actions"><label>Smena <select value={shift} onChange={event => changeShift(event.target.value)}><option value={1}>1-smena</option><option value={2}>2-smena</option></select></label><button onClick={() => editing ? save() : setEditing(true)} disabled={source === "no_approved_curriculum"}>{editing ? "Saqlash" : "Jadvalni moslash"}</button></div>}</div>
    {source === "no_approved_curriculum" && <div className="student-schedule__warning">⚠️ Administrator shu sinf o‘quv rejasini tasdiqlagach, fanlar va haftalik soatlar avtomatik joylashadi.</div>}
    {current && <div className="student-schedule__now"><div><small>HOZIR / KEYINGI DARS</small><strong>{current.subject}</strong><span>{current.time}{current.topic ? ` · ${current.topic}` : ""}</span></div>{current.topic_code && onOpenTest && <button onClick={() => onOpenTest({ fan: current.subject, nomi: current.topic, topic_code: current.topic_code, activity_type: current.activity_type })}>Mustahkamlash →</button>}</div>}
    {!!schedule.length && <><div className="student-schedule__day-tabs">{schedule.map((day, index) => <button key={day.day} className={selectedDay === index ? "active" : ""} onClick={() => setSelectedDay(index)}><span>{day.day.slice(0, 3)}</span><small>{day.lessons.length} dars</small>{index === today && <i>Bugun</i>}</button>)}</div><div className="student-schedule__mobile-day"><h3>{activeDay?.day}</h3>{activeDay?.lessons.map((lesson, index) => <Lesson key={lesson.id} lesson={lesson} editing={editing} onTopic={() => setTopicModal({ dayIndex: selectedDay, lessonIndex: index, lesson })} onTest={() => onOpenTest?.({ fan: lesson.subject, nomi: lesson.topic, topic_code: lesson.topic_code, activity_type: lesson.activity_type })} />)}</div><div className="student-schedule__grid">{schedule.map((day, dayIndex) => <article key={day.day} className={dayIndex === today ? "is-today" : ""}><h3>{day.day}{dayIndex === today && <em>Bugun</em>}</h3>{day.lessons.map((lesson, lessonIndex) => <Lesson key={lesson.id} lesson={lesson} editing={editing} onTopic={() => setTopicModal({ dayIndex, lessonIndex, lesson })} onTest={() => onOpenTest?.({ fan: lesson.subject, nomi: lesson.topic, topic_code: lesson.topic_code, activity_type: lesson.activity_type })} />)}</article>)}</div></>}
    <div className="student-schedule__clubs"><div className="student-schedule__clubs-head"><div><span>🌟 QO‘SHIMCHA RIVOJLANISH</span><h3>To‘garak va mashg‘ulotlar</h3><p>Bu bo‘lim 1–11-sinf TTS fanlaridan mustaqil.</p></div>{!readOnly && <button onClick={() => setClubModal({})}>+ To‘garak qo‘shish</button>}</div>{!clubs.length ? <div className="student-schedule__clubs-empty">Hali qo‘shimcha mashg‘ulot qo‘shilmagan.</div> : <div className="student-schedule__club-list">{clubs.map(item => <div key={item.id}><b>{CLUBS.find(club => club[0] === item.club_type)?.[1].split(" ")[0] || "✨"}</b><span><strong>{item.name}</strong><small>{item.day} · {item.time}{item.note ? ` · ${item.note}` : ""}</small></span>{!readOnly && <><button onClick={() => setClubModal(item)}>✎</button><button onClick={() => setClubs(old => old.filter(club => club.id !== item.id))}>×</button></>}</div>)}</div>}</div>
    {topicModal && <TopicModal base={base} token={token} studentId={studentId} grade={grade} lesson={topicModal.lesson} onChange={patch => { updateLesson(topicModal.dayIndex, topicModal.lessonIndex, patch); setTopicModal(old => ({ ...old, lesson: { ...old.lesson, ...patch } })); }} onClose={() => setTopicModal(null)} />}
    {clubModal && <ClubModal value={clubModal.id ? clubModal : null} onSave={saveClub} onClose={() => setClubModal(null)} />}
  </section>;
}
