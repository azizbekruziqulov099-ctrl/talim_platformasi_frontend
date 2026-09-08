import React, { useEffect, useMemo, useState } from "react";
import "./student-schedule.css";

const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const SUBJECTS = {
  1: ["Ona tili", "O‘qish savodxonligi", "Chet tili", "Matematika", "Tarbiya", "Tabiiy fan", "Informatika va axborot texnologiyalari", "Jismoniy tarbiya", "Tasviriy san’at", "Musiqa", "Texnologiya", "Kelajak soati"],
  5: ["Ona tili", "Adabiyot", "Matematika", "Ingliz tili", "Rus tili", "Tarix", "Geografiya", "Biologiya", "Informatika", "Texnologiya", "Jismoniy tarbiya"],
  10: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Ingliz tili", "Rus tili", "O‘zbekiston tarixi", "Jahon tarixi", "Fizika", "Kimyo", "Biologiya", "Informatika", "Tarbiya", "Jismoniy tarbiya"],
};

function gradeOf(value) {
  const match = String(value || "").match(/(?:^|\D)(1[01]|[1-9])(?:\D|$)/);
  return match ? Number(match[1]) : 5;
}
function defaultShift(grade) { return [1, 3, 5, 6, 7].includes(grade) ? 2 : 1; }
function subjectList(grade) { return grade <= 4 ? SUBJECTS[1] : grade <= 9 ? SUBJECTS[5] : SUBJECTS[10]; }
function lessonTimes(shift) {
  const start = shift === 2 ? 13 * 60 + 30 : 8 * 60;
  return Array.from({ length: 7 }, (_, i) => {
    const from = start + i * 50;
    const to = from + 45;
    const fmt = (n) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
    return `${fmt(from)}–${fmt(to)}`;
  });
}
function generatedSchedule(grade, shift) {
  const subjects = subjectList(grade);
  const gradeOneHours = { "Ona tili": 4, "O‘qish savodxonligi": 4, "Chet tili": 1, "Tarbiya": 1, "Matematika": 5, "Informatika va axborot texnologiyalari": 1, "Tabiiy fan": 1, "Musiqa": 1, "Tasviriy san’at": 1, "Texnologiya": 1, "Jismoniy tarbiya": 1, "Kelajak soati": 1 };
  const pool = grade === 1
    ? Object.entries(gradeOneHours).flatMap(([name, hours]) => Array(hours).fill(name))
    : [...subjects, "Kelajak soati"];
  const times = lessonTimes(shift);
  const dayCount = grade <= 4 ? 5 : 6;
  const placed = Array.from({ length: dayCount }, () => []);
  pool.forEach((subject) => {
    const candidates = placed.map((items, index) => ({ items, index })).filter(({ items }) => !items.includes(subject));
    const target = (candidates.length ? candidates : placed.map((items, index) => ({ items, index }))).sort((a, b) => a.items.length - b.items.length || a.index - b.index)[0];
    target.items.push(subject);
  });
  return DAYS.slice(0, dayCount).map((day, dayIndex) => ({
    day,
    lessons: placed[dayIndex].map((subject, lessonIndex) => ({
      id: `${dayIndex}-${lessonIndex}`,
      order: lessonIndex + 1,
      time: times[lessonIndex],
      subject,
      topic: "",
      split_group: null,
    })),
  }));
}

export default function StudentScheduleWorkspace({ token, student, apiBase, onOpenTest }) {
  const grade = gradeOf(student?.class);
  const storageKey = `samtm-weekly-schedule:${student?.user_id || "guest"}`;
  const base = apiBase || import.meta.env.VITE_API_BASE || "https://talimplatformasi-production.up.railway.app";
  const [shift, setShift] = useState(defaultShift(grade));
  const [schedule, setSchedule] = useState(() => generatedSchedule(grade, defaultShift(grade)));
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("Jadval tayyorlanmoqda…");
  const subjects = useMemo(() => subjectList(grade), [grade]);
  const today = Math.max(0, Math.min(5, new Date().getDay() - 1));

  useEffect(() => {
    let live = true;
    const local = (() => { try { return JSON.parse(localStorage.getItem(storageKey)); } catch { return null; } })();
    if (local?.schedule) { setSchedule(local.schedule); setShift(local.shift || defaultShift(grade)); setStatus("Shaxsiy jadval"); }
    if (!token) return () => { live = false; };
    fetch(`${base}/api/oquvchi/haftalik-jadval?token=${encodeURIComponent(token)}&bola_id=${encodeURIComponent(student?.user_id || "")}`, { cache: "no-store" })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d?.detail || "Jadval olinmadi"); return d; })
      .then((d) => { if (!live) return; setSchedule(d.schedule); setShift(d.shift); setStatus(d.source === "saved" ? "Saqlangan shaxsiy jadval" : "Taxminiy jadval — o‘zingizga moslang"); })
      .catch(() => { if (live) setStatus(local ? "Qurilmadagi saqlangan jadval" : "Taxminiy jadval — o‘zingizga moslang"); });
    return () => { live = false; };
  }, [base, grade, storageKey, student?.user_id, token]);

  function changeShift(value) {
    const next = Number(value);
    setShift(next);
    setSchedule((old) => old.map((day) => ({ ...day, lessons: day.lessons.map((lesson, i) => ({ ...lesson, time: lessonTimes(next)[i] })) })));
  }
  function updateLesson(dayIndex, lessonIndex, field, value) {
    setSchedule((old) => old.map((day, di) => di !== dayIndex ? day : ({ ...day, lessons: day.lessons.map((lesson, li) => li !== lessonIndex ? lesson : ({ ...lesson, [field]: value })) })));
  }
  async function save() {
    const payload = { bola_id: student?.user_id, shift, schedule };
    localStorage.setItem(storageKey, JSON.stringify(payload));
    setStatus("Saqlanmoqda…");
    try {
      const r = await fetch(`${base}/api/oquvchi/haftalik-jadval?token=${encodeURIComponent(token)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.detail || "Serverga saqlanmadi");
      setStatus("Jadval saqlandi"); setEditing(false);
    } catch { setStatus("Qurilmaga saqlandi; server bilan keyin sinxronlanadi"); setEditing(false); }
  }

  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const current = schedule[today]?.lessons?.find((lesson) => {
    const [a, b] = lesson.time.split("–").map((x) => { const [h, m] = x.split(":").map(Number); return h * 60 + m; });
    return currentMinutes >= a && currentMinutes <= b;
  }) || schedule[today]?.lessons?.find((lesson) => Number(lesson.time.slice(0, 2)) * 60 + Number(lesson.time.slice(3, 5)) > currentMinutes);

  return <section className="student-schedule" aria-label="O‘quvchining haftalik jadvali">
    <div className="student-schedule__hero">
      <div><span className="student-schedule__eyebrow">BUGUNGI TA’LIM MAYDONI</span><h2>Salom, {student?.full_name || "o‘quvchi"}!</h2><p>{status}</p></div>
      <div className="student-schedule__actions"><label>Smena <select value={shift} onChange={(e) => changeShift(e.target.value)}><option value={1}>1-smena</option><option value={2}>2-smena</option></select></label><button type="button" onClick={() => editing ? save() : setEditing(true)}>{editing ? "Saqlash" : "Jadvalni moslash"}</button></div>
    </div>
    {current && <div className="student-schedule__now"><div><small>{current.time.includes("–") && currentMinutes >= Number(current.time.slice(0,2))*60+Number(current.time.slice(3,5)) ? "HOZIR / KEYINGI DARS" : "KEYINGI DARS"}</small><strong>{current.subject}</strong><span>{current.time}{current.topic ? ` · ${current.topic}` : ""}</span></div><button type="button" onClick={() => onOpenTest?.({ fan: current.subject, nomi: current.topic || current.subject })}>Bilimni mustahkamlash →</button></div>}
    <div className="student-schedule__grid">
      {schedule.map((day, di) => <article key={day.day} className={di === today ? "is-today" : ""}><h3>{day.day}{di === today && <em>Bugun</em>}</h3>{day.lessons.map((lesson, li) => <div className="student-schedule__lesson" key={lesson.id}><b>{lesson.order}</b><div><span>{lesson.time}</span>{editing ? <><select value={lesson.subject} onChange={(e) => updateLesson(di, li, "subject", e.target.value)}>{subjects.map((s) => <option key={s}>{s}</option>)}</select><input value={lesson.topic || ""} placeholder="Mavzu (ixtiyoriy)" onChange={(e) => updateLesson(di, li, "topic", e.target.value)} /></> : <><strong>{lesson.subject}</strong>{lesson.topic && <small>{lesson.topic}</small>}</>}</div>{!editing && <button type="button" title="Shu fandan test" onClick={() => onOpenTest?.({ fan: lesson.subject, nomi: lesson.topic || lesson.subject })}>✓</button>}</div>)}</article>)}
    </div>
    <p className="student-schedule__note">Taxminiy jadval sizga boshlang‘ich nusxa beradi. Maktab tasdiqlagan jadval kelganda u asosiy manba bo‘ladi; sizning shaxsiy moslamalaringiz saqlanadi.</p>
  </section>;
}
