// REV481: 🕵️ «Mister Nazoratchi» — o'yin o'rtasida 1–3 dars oldingi darslardan 3 ta savol. Yoshga qarab vaqt (rangli chiziq).
// 3 tadan 2 tasi xato — o'yin 1→2→3→4 kunga to'xtaydi; o'sha darslardan birini qayta o'tsa, darhol ochiladi.
import React, { useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import { BoardText } from "../../lesson/AmaliyDoska.jsx";
import "./nazoratchi.css";

/** REV503: Nazoratchi — Kabu EMAS (Azizjon), alohida qahramon: ko'zoynakli, lupa ushlagan robot-inspektor.
 *  Rassom chizgan rasmlar (zakazdagi «Mister Nazoratchi» 4 holati) kelguncha — vaqtinchalik SVG. */
export function NazoratchiRasm(props) { return <EskiNazoratchiRasm {...props} />; }

function EskiNazoratchiRasm({ holat = "oddiy", size = 150 }) {
  const ogiz = holat === "xursand" ? "M86 112 Q100 126 114 112" : holat === "qayta" ? "M88 118 Q100 110 112 118" : "M90 114 H110";
  return <svg className={`nzc-rasm is-${holat}`} width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
    <ellipse cx="100" cy="190" rx="48" ry="7" fill="rgba(0,0,0,.12)" />
    <rect x="62" y="132" width="76" height="50" rx="18" fill="#3c4f6b" />
    <rect x="80" y="142" width="40" height="22" rx="6" fill="#ffd24a" /><text x="100" y="158" textAnchor="middle" fontSize="13" fontWeight="800" fill="#3c4f6b">N</text>
    <rect x="46" y="44" width="108" height="92" rx="34" fill="#e9eef5" stroke="#9fb0c6" strokeWidth="3" />
    <rect x="58" y="60" width="84" height="64" rx="22" fill="#24324a" />
    <circle cx="82" cy="88" r="13" fill="#fff" /><circle cx="118" cy="88" r="13" fill="#fff" />
    <circle cx={holat === "sorayapti" ? 85 : 82} cy="89" r="6" fill="#24324a" /><circle cx={holat === "sorayapti" ? 121 : 118} cy="89" r="6" fill="#24324a" />
    <circle cx="82" cy="88" r="17" fill="none" stroke="#ffd24a" strokeWidth="4" /><circle cx="118" cy="88" r="17" fill="none" stroke="#ffd24a" strokeWidth="4" />
    <path d="M99 88 H101" stroke="#ffd24a" strokeWidth="4" />
    <path d={ogiz} stroke="#7ee0c8" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M58 44 Q100 6 142 44 Z" fill="#3c4f6b" /><rect x="52" y="40" width="96" height="8" rx="4" fill="#2b3a52" />
    <g className="nzc-lupa"><circle cx="160" cy="118" r="18" fill="rgba(180,220,255,.45)" stroke="#8a6a2a" strokeWidth="5" />
      <path d="M147 132 L132 150" stroke="#8a6a2a" strokeWidth="7" strokeLinecap="round" /></g>
  </svg>;
}

const vaqtYosh = (yosh) => (String(yosh).startsWith("3") || String(yosh).startsWith("4") || String(yosh).startsWith("5") || String(yosh).startsWith("6") ? 10 : 7);

export default function Nazoratchi({ base, token, yosh = "", say, onTugadi }) {
  const [S, setS] = useState(null), [i, setI] = useState(0), [tanlov, setTanlov] = useState(null);
  const [qoldi, setQoldi] = useState(0), [hol, setHol] = useState("sorayapti"), [yakun, setYakun] = useState(null);
  const javoblar = useRef([]);
  const vaqt = vaqtYosh(yosh);
  useEffect(() => {
    fetch(`${base}/api/nazoratchi/savollar?${new URLSearchParams({ token })}`).then((r) => r.json()).then((d) => {
      const s = d.savollar || []; if (!s.length) { onTugadi?.({ qulf: false, bosh: true }); return; }
      setS(s); say?.(__kbUi("To‘xta! Men Nazoratchiman. Avval menga uchta savolga javob ber."));
    }).catch(() => onTugadi?.({ qulf: false, bosh: true }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const q = S?.[i];
  useEffect(() => { if (q) { setQoldi(vaqt); setTanlov(null); setHol("sorayapti"); const tt = setTimeout(() => say?.(String(q.savol || "").replace(/\$/g, "")), 1800); return () => clearTimeout(tt); } return undefined; }, [i, S]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!q || tanlov !== null || yakun) return undefined;
    const id = setInterval(() => setQoldi((x) => { if (document.visibilityState !== "visible") return x; if (x <= 0.25) { clearInterval(id); bos(-1); return 0; } return x - 0.25; }), 250);
    return () => clearInterval(id);
  }, [q, tanlov, yakun]); // eslint-disable-line react-hooks/exhaustive-deps
  const bos = (k) => {
    if (tanlov !== null || !q) return;
    const ok = k === q.togri; setTanlov(k); setHol(ok ? "xursand" : "qayta");
    javoblar.current.push({ ok, kod: q.dars, nomi: q.dars_nomi });
    say?.(ok ? __kbUi("Barakalla!") : k === -1 ? __kbUi("Vaqt tugadi.") : __kbUi("Yo‘q, bunisi emas."));
    setTimeout(async () => {
      if (i + 1 < S.length) { setI(i + 1); return; }
      const togri = javoblar.current.filter((x) => x.ok).length;
      const xatoD = javoblar.current.filter((x) => !x.ok).map((x) => ({ kod: x.kod, nomi: x.nomi }));
      const r = await fetch(`${base}/api/nazoratchi/natija`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, togri, jami: S.length, darslar: xatoD }) }).then((x) => x.json()).catch(() => ({ qulf: false }));
      setYakun({ ...r, togri, jami: S.length }); setHol(r.qulf ? "qayta" : "xursand");
      say?.(r.qulf ? __kbUi(`Bu darslarni unutibsan. O‘yinlar ${r.kun} kunga to‘xtaydi. Darsni qayta o‘tsang — darhol ochiladi!`) : __kbUi("Zo‘r! Bilimingiz joyida — o‘ynashda davom et!"));
    }, 1400);
  };
  if (!S) return <div className="nzc"><NazoratchiRasm holat="oddiy" /><p>⏳</p></div>;
  if (yakun) return <div className="nzc"><NazoratchiRasm holat={hol} />
    <h2>{yakun.qulf ? __kbUi("O‘yinlar to‘xtatildi") : __kbUi("⭐ Barakalla!")}</h2>
    <p className="nzc-hisob">{yakun.togri} / {yakun.jami}</p>
    {yakun.qulf ? <><p>{__kbUi(`O‘yinlar ${yakun.kun} kunga to‘xtadi. Shu darslarni qayta o‘tsang — darhol ochiladi:`)}</p>
      <ul className="nzc-darslar">{(yakun.darslar || []).map((d) => <li key={d.kod}>📘 {d.nomi || d.kod}</li>)}</ul></>
      : <p>{__kbUi("Bilimingiz joyida — o‘ynashda davom et!")}</p>}
    <button type="button" className="nzc-btn" onClick={() => onTugadi?.(yakun)}>{yakun.qulf ? __kbUi("Tushunarli") : __kbUi("O‘ynashga qaytish ▶")}</button></div>;
  const u = qoldi / vaqt;
  return <div className="nzc">
    <div className="nzc-tepa"><NazoratchiRasm holat={hol} size={120} /><div><b>🕵️ {__kbUi("Mister Nazoratchi")}</b><span>{i + 1} / {S.length}</span>
      {q.dars_nomi && <small>📘 {q.dars_nomi}</small>}</div>
      <button type="button" className="nzc-tingla" onClick={() => say?.(String(q.savol || "").replace(/\$/g, ""))} aria-label={__kbUi("Qayta eshitish")}>🔊</button></div>
    <div className="nzc-vaqt"><i style={{ width: `${Math.max(0, u * 100)}%`, background: u > 0.5 ? "#2e9e5b" : u > 0.25 ? "#f2b72e" : "#d9534f" }} /></div>
    <div className="nzc-savol"><BoardText text={String(q.savol || "").replace(/\[\/?[a-z]{2,3}\]/g, "")} /></div>
    <div className="nzc-var">{(q.variantlar || []).map((o, k) => <button key={k} type="button" disabled={tanlov !== null} onClick={() => bos(k)}
      className={tanlov === null ? "" : k === q.togri ? "is-ok" : k === tanlov ? "is-no" : ""}><BoardText text={String(o)} /></button>)}</div>
  </div>;
}

/** O'yin xonasi yopiq: avval bugungi dars, yoki Nazoratchi qulfi. */
export function OyinYopiq({ r, onClose }) {
  return <div className="nzc nzc-yopiq"><NazoratchiRasm holat={r.sabab === "qulf" ? "qayta" : "oddiy"} />
    {r.sabab === "chegara" ? <><h2>🌙 {__kbUi("Bugunga yetarli!")}</h2><p>{__kbUi("Bugun 10 xil o‘yin o‘ynading — barakalla! Endi dam ol, ertaga yangi o‘yinlar kutadi.")}</p></>
      : r.sabab === "dars" ? <><h2>{__kbUi("Avval bugungi dars!")}</h2><p>{__kbUi("Bugungi darsingni tugat — keyin o‘yinlar ochiladi. Kabu seni kutyapti!")}</p></>
      : <><h2>{__kbUi("O‘yinlar vaqtincha to‘xtatilgan")}</h2><p>{__kbUi(`${String(r.gacha || "").split("-").reverse().join(".")} gacha. Shu darslarni qayta o‘tsang — darhol ochiladi:`)}</p>
        <ul className="nzc-darslar">{(r.darslar || []).map((d) => <li key={d.kod}>📘 {d.nomi || d.kod}</li>)}</ul></>}
    {onClose && <button type="button" className="nzc-btn" onClick={onClose}>← {__kbUi("Darslarga")}</button>}</div>;
}
