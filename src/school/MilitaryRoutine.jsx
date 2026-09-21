import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Clock3, Plus, RefreshCw, Save, ShieldCheck, Trash2, X } from "lucide-react";
import "./militaryRoutine.css";
import MilitaryOperations from "./MilitaryOperations.jsx";

const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const KINDS = { dars: "Dars", saf: "Saf mashg‘uloti", mashq: "Jismoniy mashq", ovqat: "Ovqatlanish", dam: "Dam olish", mustaqil: "Mustaqil tayyorgarlik", togarak: "To‘garak", ketish: "Uyga/yotoqxonaga chiqish", boshqa: "Boshqa" };
const MAX_DAILY_ENTRIES = 32;
const MAX_WEEKLY_ENTRIES = MAX_DAILY_ENTRIES * 7;

export function routineToday(entries, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tashkent", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (kind) => parts.find((part) => part.type === kind)?.value;
  const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday")) + 1;
  const clock = `${get("hour")}:${get("minute")}`;
  const calendarDate = new Date(Date.UTC(Number(get("year")), Number(get("month")) - 1, Number(get("day"))));
  calendarDate.setUTCDate(calendarDate.getUTCDate() + 4 - (calendarDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(calendarDate.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((calendarDate - yearStart) / 86400000) + 1) / 7);
  const week = weekNumber % 2 ? "odd" : "even";
  return { day, clock, week, rows: entries.filter((row) => row.day === day && ["all", week].includes(row.week || "all")).map((row) => ({ ...row, status: (row.end ? row.start <= clock && clock < row.end : row.start === clock) ? "current" : (row.end || row.start) <= clock ? "done" : "next" })) };
}

export function validateRoutineDraft(rows) {
  if (!Array.isArray(rows)) return "Kun tartibi ro‘yxat shaklida bo‘lishi kerak.";
  if (rows.length > MAX_WEEKLY_ENTRIES) return `Haftalik rejada ko‘pi bilan ${MAX_WEEKLY_ENTRIES} ta band bo‘lishi mumkin.`;
  for (const row of rows) {
    if (!row || !Number.isInteger(row.day) || row.day < 1 || row.day > 7 || typeof row.title !== "string" || typeof row.start !== "string" || typeof row.end !== "string" || !Object.hasOwn(KINDS, row.kind) || !["all", "odd", "even"].includes(row.week || "all")) return "Mashg‘ulot kuni, turi va vaqtlarini tekshiring.";
    if (/[\u0000-\u001f]/.test(row.title)) return "Mashg‘ulot nomini bitta qatorda kiriting.";
  }
  for (let day = 1; day <= 7; day += 1) {
    const daily = rows.filter((row) => row.day === day).sort((a, b) => a.start.localeCompare(b.start));
    if (daily.length > MAX_DAILY_ENTRIES) return `${DAYS[day - 1]} uchun ko‘pi bilan ${MAX_DAILY_ENTRIES} ta band kiriting.`;
    for (let index = 0; index < daily.length; index += 1) {
      const row = daily[index];
      if (row.title.trim().length < 2 || row.title.trim().length > 120) return "Har bir mashg‘ulot nomini 2–120 belgi bilan yozing.";
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(row.start) || (row.end && (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(row.end) || row.start >= row.end))) return "Boshlanish va tugash vaqtlarini tekshiring.";
    }
    for (const week of ["odd", "even"]) {
      const weekly = daily.filter((row) => ["all", week].includes(row.week || "all"));
      for (let index = 1; index < weekly.length; index += 1) {
        if (weekly[index].start < (weekly[index - 1].end || weekly[index - 1].start) || weekly[index].start === weekly[index - 1].start) return `${DAYS[day - 1]} kuni vaqtlar ustma-ust tushgan.`;
      }
    }
  }
  return "";
}

export default function MilitaryRoutine({ token, apiBase = "", schoolId, childId, readOnly = false }) {
  useKbInterfaceLocale();
  const [data, setData] = useState(null);
  const [chosenSchool, setChosenSchool] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null);
  const [day, setDay] = useState(1);
  const [tick, setTick] = useState(Date.now());
  const [notice, setNotice] = useState("");
  const [enableConfirm, setEnableConfirm] = useState(false);
  const controller = useRef(null);
  const pending = useRef(false);
  const draftRef = useRef(draft);
  const clockOffset = useRef(0);
  draftRef.current = draft;

  const load = useCallback(async () => {
    if (!token || pending.current || (typeof document !== "undefined" && document.hidden)) return;
    pending.current = true;
    const aborter = new AbortController(); controller.current = aborter;
    const timer = setTimeout(() => aborter.abort(), 15000);
    try {
      const query = new URLSearchParams();
      if (schoolId || chosenSchool) query.set("school_id", String(schoolId || chosenSchool));
      if (childId) query.set("child_id", String(childId));
      const response = await fetch(`${apiBase}/api/maktab/kun-tartibi?${query}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: aborter.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.detail === "string" ? result.detail : "Kun tartibi yuklanmadi.");
      if (aborter.signal.aborted) return;
      if (result.server_now) clockOffset.current = new Date(result.server_now).getTime() - Date.now();
      else if (result.date && result.time) clockOffset.current = new Date(`${result.date}T${result.time}:00+05:00`).getTime() - Date.now();
      setData(result); setError(""); setTick(Date.now());
    } catch (err) {
      if (!aborter.signal.aborted) setError(err.message || "Kun tartibi yuklanmadi.");
    } finally { clearTimeout(timer); if (controller.current === aborter) { pending.current = false; controller.current = null; } }
  }, [apiBase, token, schoolId, chosenSchool, childId]);

  useEffect(() => {
    setData(null); setDraft(null); setError(""); setNotice("");
    pending.current = false; load();
    const refresh = () => { if (!document.hidden && !draftRef.current) load(); };
    const interval = setInterval(refresh, 60000);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", refresh); controller.current?.abort(); controller.current = null; pending.current = false; };
  }, [load]);
  useEffect(() => { const timer = setInterval(() => { if (!document.hidden) setTick(Date.now()); }, 15000); return () => clearInterval(timer); }, []);

  const enableMilitary = async () => {
    if (saving) return;
    setSaving(true); setError("");
    const aborter = new AbortController(); const timer = setTimeout(() => aborter.abort(), 15000);
    try {
      const response = await fetch(`${apiBase}/api/maktab/kun-tartibi/type`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ school_id: data.school_id, maktab_turi: "harbiy" }), signal: aborter.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.detail === "string" ? result.detail : "Maktab turi o‘zgarmadi.");
      setEnableConfirm(false); await load();
    } catch (err) { setError(err.name === "AbortError" ? "Javob kechikdi. Yangilab tekshiring." : err.message); }
    finally { clearTimeout(timer); setSaving(false); }
  };
  if (!token || (!data && !error)) return null;
  if (data?.enabled === false) return !readOnly && data.can_enable ? <section className="military-routine" aria-label={__kbUi("Harbiy maktabga moslash")}>
    <div className="military-routine__header"><div><h3>{__kbUi("Harbiy maktabga moslash")}</h3><p>{data.school_name}</p></div><button type="button" disabled={saving} onClick={() => setEnableConfirm((value) => !value)}>{__kbUi("Harbiy maktab tartibini yoqish")}</button></div>
    {enableConfirm && <div className="military-routine__preset"><p>{__kbUi("Tanlangan maktab harbiy maktab turiga o‘tadi. Darslar va sinflar saqlanadi; kun tartibi, yotoqxona va navbatchilik sozlamalari ochiladi.")}</p><button type="button" disabled={saving} onClick={enableMilitary}>{saving ? __kbUi("Saqlanmoqda…") : __kbUi("Shu maktab uchun yoqish")}</button></div>}
    {error && <p className="military-routine__error" role="alert">{__kbUi(error)}</p>}
  </section> : null;
  if (!data) return <section className="military-routine" aria-label={__kbUi("Kun tartibi")}><p role="status">{__kbUi(error)}</p><button type="button" onClick={load}>{__kbUi("Qayta yuklash")}</button></section>;
  const today = routineToday(data.entries || [], new Date(tick + clockOffset.current));
  const current = today.rows.find((row) => row.status === "current");
  const next = today.rows.find((row) => row.status === "next");
  const change = (index, patch) => setDraft((rows) => rows.map((row, idx) => idx === index ? { ...row, ...patch } : row));
  const save = async () => {
    if (saving) return;
    const invalid = validateRoutineDraft(draft); if (invalid) { setError(invalid); return; }
    setSaving(true); setError(""); setNotice("");
    const aborter = new AbortController(); const timer = setTimeout(() => aborter.abort(), 20000);
    try {
      const response = await fetch(`${apiBase}/api/maktab/kun-tartibi`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ school_id: data.school_id, revision: data.revision, entries: draft }), signal: aborter.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.detail === "string" ? result.detail : "Kun tartibi saqlanmadi.");
      setDraft(null); draftRef.current = null; setNotice("Kun tartibi saqlandi. Maktab a’zolariga ko‘rinadi."); await load();
    } catch (err) { setError(err.name === "AbortError" ? "Javob kechikdi. Qayta saqlashdan oldin sahifani yangilab tekshiring." : err.message); }
    finally { clearTimeout(timer); setSaving(false); }
  };

  return <section className="military-routine" aria-label={__kbUi("Harbiy maktab kun tartibi")}>
    <header className="military-routine__header"><div><span className="military-routine__eyebrow"><ShieldCheck size={15} />{__kbUi(" Harbiy maktab")}</span><h3>{__kbUi("Bugungi kun tartibi")}</h3><p>{data.school_name} · {__kbUi(DAYS[today.day - 1])} · {today.clock}</p></div><div className="military-routine__actions">
      {!draft && <button type="button" aria-label={__kbUi("Kun tartibini yangilash")} onClick={load}><RefreshCw size={16} /></button>}
      {data.can_edit && !readOnly && !draft && <button type="button" onClick={() => { setDraft(data.entries.map((row) => ({ ...row }))); setDay(today.day); setError(""); setNotice(""); }}><CalendarDays size={16} />{__kbUi(" Kun tartibini sozlash")}</button>}
    </div></header>
    {!schoolId && data.schools?.length > 1 && <label className="military-routine__school">{__kbUi("Maktab")}<select disabled={!!draft} value={data.school_id} onChange={(event) => setChosenSchool(Number(event.target.value))}>{data.schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label>}
    {error && <p className="military-routine__error" role="alert">{__kbUi(error)}</p>}
    {notice && <p className="military-routine__notice" role="status">{__kbUi(notice)}</p>}
    {draft ? <div className="military-routine__editor">
      <p>{__kbUi("Vaqt, dars, to‘garak va hafta turini erkin moslang. Aniq tugash vaqti bo‘lmasa, bo‘sh qoldiring. Saqlangan reja direktor, o‘quvchi va bog‘langan ota-onaga ko‘rinadi.")}</p>
      {!draft.length && data.preset?.length > 0 && <div className="military-routine__preset"><strong>{__kbUi("Boshlang‘ich tartibni qo‘llash")}</strong><p>{__kbUi("Dushanba–shanba: 08:00 dan 50 daqiqalik darslar, 13:00–14:00 tushlik va dam, 14:00 oltinchi dars, 15:00–16:30 ikki 45 daqiqalik to‘garak. Namunada tushlik va dam olish 30 daqiqadan ajratilgan — bu boshlang‘ich taxmin. Kunlar, tanaffuslar, to‘garak fanlari va barcha vaqtlarni saqlashdan oldin o‘zingizga moslang.")}</p><button type="button" disabled={saving} onClick={() => setDraft(data.preset.map((row) => ({ ...row })))}>{__kbUi("Namunani tahrirga olish")}</button></div>}
      <p className="military-routine__footnote">{__kbUi("To‘garaklarni kerakli kunlarda nomlab, toq/juft haftalarda almashtirishingiz mumkin. Har bir fan uchun haftadagi ikki mashg‘ulotni belgilang. Toq va juft haftalar yil kalendari bo‘yicha sanaladi.")}</p>
      <div className="military-routine__days" role="group" aria-label={__kbUi("Hafta kuni")}>{DAYS.map((name, idx) => <button type="button" disabled={saving} key={name} aria-pressed={day === idx + 1} onClick={() => setDay(idx + 1)}>{__kbUi(name)}</button>)}</div>
      <div className="military-routine__fields">{draft.map((row, index) => row.day === day && <div className="military-routine__edit-row" key={index}>
        <label>{__kbUi("Boshlanish")}<input type="time" value={row.start} disabled={saving} onChange={(event) => change(index, { start: event.target.value })} /></label>
        <label>{__kbUi("Tugash")}<input type="time" value={row.end} disabled={saving} onChange={(event) => change(index, { end: event.target.value })} /></label>
        <label>{__kbUi("Mashg‘ulot")}<input value={row.title} maxLength={120} placeholder={__kbUi("Mashg‘ulot nomi")} disabled={saving} onChange={(event) => change(index, { title: event.target.value })} /></label>
        <label>{__kbUi("Turi")}<select value={row.kind} disabled={saving} onChange={(event) => change(index, { kind: event.target.value })}>{Object.entries(KINDS).map(([value, name]) => <option key={value} value={value}>{__kbUi(name)}</option>)}</select></label>
        <label>{__kbUi("Hafta turi")}<select value={row.week || "all"} disabled={saving} onChange={(event) => change(index, { week: event.target.value })}><option value="all">{__kbUi("Har hafta")}</option><option value="odd">{__kbUi("Toq haftalar")}</option><option value="even">{__kbUi("Juft haftalar")}</option></select></label>
        <button type="button" disabled={saving} aria-label={__kbUi(`${row.title || "Band"}ni olib tashlash`)} onClick={() => setDraft((rows) => rows.filter((_, idx) => idx !== index))}><Trash2 size={17} /></button>
      </div>)}</div>
      <button type="button" disabled={saving || draft.filter((row) => row.day === day).length >= MAX_DAILY_ENTRIES || draft.length >= MAX_WEEKLY_ENTRIES} onClick={() => setDraft((rows) => [...rows, { day, start: "", end: "", title: "", kind: "boshqa", week: "all" }])}><Plus size={16} />{__kbUi(" Mashg‘ulot qo‘shish")}</button>
      <footer><button type="button" disabled={saving} onClick={() => { setDraft(null); setError(""); load(); }}><X size={16} />{__kbUi(" Bekor qilish")}</button><button type="button" className="military-routine__save" disabled={saving} onClick={save}><Save size={16} /> {saving ? __kbUi("Saqlanmoqda…") : __kbUi("Saqlash va ko‘rsatish")}</button></footer>
    </div> : <>
      <div className="military-routine__now"><Clock3 size={21} /><div><small>{__kbUi("Reja bo‘yicha hozir")}</small><strong>{current ? current.title : next ? __kbUi("Mashg‘ulotlar oralig‘i") : today.rows.length ? __kbUi("Bugungi reja yakunlangan") : __kbUi("Bugun uchun reja kiritilmagan")}</strong>{current ? <span>{current.start}{current.end ? __kbUi(`–${current.end}`) : __kbUi("")}</span> : next ? <span>{__kbUi("Keyingi: ")}{next.start} · {next.title}</span> : null}</div></div>
      {today.rows.length ? <ol className="military-routine__timeline">{today.rows.map((row) => <li key={`${row.start}-${row.end}`} data-status={row.status}><time>{row.start}<span>{row.end}</span></time><div><strong>{row.title}</strong><small>{__kbUi(KINDS[row.kind])} · {row.status === "current" ? __kbUi("Hozirgi vaqt") : row.status === "done" ? __kbUi("Rejadagi vaqt o‘tgan") : __kbUi("Rejada")}</small></div>{row.status === "current" && <span className="military-routine__live">{__kbUi("Hozir")}</span>}</li>)}</ol> : <p className="military-routine__empty">{data.entries.length ? __kbUi("Boshqa kunlarning rejasi saqlangan. Bugungi vaqtlar hali belgilanmagan.") : __kbUi("Direktor kun tartibini kiritgach, bugungi mashg‘ulotlar vaqtiga qarab avtomatik ko‘rinadi.")}</p>}
      <p className="military-routine__footnote">{today.week === "odd" ? __kbUi("Toq hafta") : __kbUi("Juft hafta")}{__kbUi(" · Bu tasdiqlangan kun tartibi. Haqiqiy davomat va bajarilgan ishlar alohida qayd etiladi. Toshkent vaqti.")}</p>
    </>}
    {!draft && <MilitaryOperations schoolId={data.school_id} childId={childId} token={token} apiBase={apiBase} readOnly={readOnly} />}
  </section>;
}
