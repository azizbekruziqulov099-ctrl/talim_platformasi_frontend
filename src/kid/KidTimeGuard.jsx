import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import RobotKabu from "./RobotKabu.jsx";
import { KID_PITCH, kidRate } from "../lesson/kidLessonRules.js";
import { chime, soft } from "./kidSounds.js";
import { guardView, hoursText, screenCategory, screenName, screenTime, tashkentDay, timeText, warnText } from "./screenTime.js";
import "./kidTimeGuard.css";

const TITLES = { jami: "Bugun vaqting tugadi", dars: "Dars vaqti tugadi", oyin: "O‘yin vaqti tugadi" };

function seenWarning(key) {
  try { return window.localStorage.getItem(key) === "1"; } catch { return false; }
}
function rememberWarning(key) {
  try { window.localStorage.setItem(key, "1"); } catch { /* shu oynada eslab qolinadi */ }
}

/** REV103: bog'cha bolasining kunlik vaqti. Kichiklar (2–5 yosh): 1 soat dars + 1 soat erkin o'yin;
 *  6–7 yosh: 2 soat dars + 1 soat o'yin. Vaqt tugasa — robot aytadi va ekran yopiladi; hammasi tugasa — «Ertaga uchrashamiz». */
export default function KidTimeGuard({ apiBase, token, userId = "", tab, overlay = "", busy = false, jins = "qiz", grade = "", onGo, onLogout }) {
  useKbInterfaceLocale();
  const [status, setStatus] = useState(() => screenTime.current());
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState("");
  const [gate, setGate] = useState(null);
  const grace = useRef(0);
  const spoken = useRef("");
  const audio = useRef(null);
  const warned = useRef(new Set());
  // Dars qayerdan ochilmasin (masalan kitob kodi qidiruvidan) — dars ketayotgan vaqt dars hisobiga yoziladi.
  const lessonBusy = screenTime.isBusy();
  const cat = lessonBusy ? "dars" : screenCategory(tab, overlay);
  const nom = screenName(tab, overlay);

  // Ekran nomi signal boshlanishidan OLDIN yoziladi — birinchi signal to'g'ri ekran hisobiga ketadi.
  useEffect(() => { screenTime.where(cat, nom); }, [cat, nom]);
  useEffect(() => {
    if (!token) return undefined;
    const off = screenTime.subscribe(setStatus);
    screenTime.start({ apiBase, token });
    return () => { off(); screenTime.stop(); };
  }, [apiBase, token]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const say = useCallback((text) => {
    if (!text) return;
    try {
      if (audio.current) audio.current.pause();
      const params = new URLSearchParams({ matn: text, jins: jins || "qiz", tezlik: kidRate(grade), ohang: KID_PITCH });
      const player = new Audio(`${String(apiBase || "").replace(/\/+$/, "")}/api/ovoz?${params}`);
      audio.current = player;
      player.play().catch(() => { /* brauzer ovozga ruxsat bermadi — yozuv va rasm baribir ko'rinadi */ });
    } catch { /* eski brauzer */ }
  }, [apiBase, jins, grade]);
  useEffect(() => () => { try { audio.current?.pause(); } catch { /* yopilgan */ } }, []);

  const result = guardView(status, cat, busy || lessonBusy, grace.current, now);
  grace.current = result.graceSince;
  const view = result.view;
  const text = timeText(view, status);

  useEffect(() => {
    if (!view) { spoken.current = ""; return; }
    if (spoken.current === view) return;
    spoken.current = view;
    screenTime.block(view);   // dars/test ovozi to'xtaydi
    setGate(null);
    if (view === "jami") chime(); else soft();
    const t = setTimeout(() => say(timeText(view, screenTime.current())), 500);
    return () => clearTimeout(t);
  }, [view, say]);

  // 5 daqiqa qolganda — bir marta (kuniga, har bo'lim uchun) yumshoq eslatma.
  useEffect(() => {
    const warning = view ? null : warnText(status, cat);
    if (!warning) return;
    const key = `kb-kid-time-warn:${userId}:${tashkentDay()}:${cat}`;   // aka-uka bitta planshetda — har biriga alohida
    if (warned.current.has(key) || seenWarning(key)) return;
    warned.current.add(key); rememberWarning(key);
    setToast(warning);
    soft();
    say(warning);
  }, [status, cat, view, say, userId]);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 9000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!view) {
    return toast ? <div className="ktg-toast" role="status" onClick={() => setToast("")}><span aria-hidden="true">⏳</span>{__kbUi(toast)}</div> : null;
  }

  const openGate = () => {
    const a = 11 + Math.floor(Math.random() * 19), b = 3 + Math.floor(Math.random() * 7);
    setGate({ a, b, value: "", wrong: false });
  };
  const checkGate = (event) => {
    event.preventDefault();
    if (Number(gate?.value) === gate.a + gate.b) { setGate(null); onLogout?.(); return; }
    setGate((g) => ({ ...g, value: "", wrong: true }));
  };

  return <div className={`ktg-veil is-${view}`} role="dialog" aria-modal="true" aria-label={__kbUi(TITLES[view])}>
    <div className="ktg-card">
      <div className="ktg-sky" aria-hidden="true">{view === "jami" ? "🌙 ✨ ⭐" : view === "dars" ? "🎮 ⭐" : "📚 ⭐"}</div>
      <div className="ktg-robot"><RobotKabu mood={view === "jami" ? "wave" : "happy"} /></div>
      <h2>{__kbUi(TITLES[view])}</h2>
      <p className="ktg-text">{__kbUi(text)}</p>
      <button type="button" className="ktg-listen" onClick={() => say(text)} aria-label={__kbUi("Qayta eshitish")}>🔊</button>
      {view === "dars" && <button type="button" className="ktg-go" onClick={() => onGo?.("oyinlar")}>🎮 {__kbUi("O‘yinlar")}</button>}
      {view === "oyin" && <button type="button" className="ktg-go" onClick={() => onGo?.("mavzular")}>📚 {__kbUi("Darslar")}</button>}
      {view !== "jami" && status?.[view === "dars" ? "oyin" : "dars"] && <p className="ktg-left">
        {__kbUi(view === "dars" ? "O‘yin vaqtidan qoldi:" : "Dars vaqtidan qoldi:")} <b>{__kbUi(hoursText(status[view === "dars" ? "oyin" : "dars"].qoldi))}</b></p>}
      {view === "jami" && <>
        <p className="ktg-sum">📚 {__kbUi("Dars")} <b>{__kbUi(hoursText(status?.dars?.daqiqa))}</b> · 🎮 {__kbUi("O‘yin")} <b>{__kbUi(hoursText(status?.oyin?.daqiqa))}</b></p>
        <p className="ktg-note">{__kbUi("Platforma ertaga yana ochiladi.")}</p>
        {onLogout && !gate && <button type="button" className="ktg-parent" onClick={openGate}>{__kbUi("Ota-ona uchun: hisobdan chiqish")}</button>}
        {gate && <form className="ktg-gate" onSubmit={checkGate}>
          <label htmlFor="ktg-gate-input">{__kbUi("Hisobdan chiqish uchun hisoblang:")} <b>{gate.a} + {gate.b} = ?</b></label>
          <div><input id="ktg-gate-input" inputMode="numeric" autoComplete="off" value={gate.value} autoFocus
            onChange={(e) => setGate((g) => ({ ...g, value: e.target.value.replace(/\D/g, "").slice(0, 3), wrong: false }))} />
            <button type="submit">{__kbUi("Chiqish")}</button>
            <button type="button" onClick={() => setGate(null)}>{__kbUi("Bekor")}</button></div>
          {gate.wrong && <small>{__kbUi("Javob noto‘g‘ri.")}</small>}
        </form>}
      </>}
    </div>
  </div>;
}
