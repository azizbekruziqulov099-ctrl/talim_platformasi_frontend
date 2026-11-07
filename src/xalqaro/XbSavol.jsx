import React from "react";
import { T, tf, xbTil } from "./xbTil.js";   // REV270: uch til
import CourseText from "../courses/CourseText.jsx";
import { BoardText } from "../lesson/AmaliyDoska.jsx";
import { FIKRLASH, ovozdanJavob, ovozdanVariant, svgUrl } from "./xbRules.js";
import { useMikrofon } from "./xbOvoz.js";
import { MIK_TIL } from "./xbTil.js";
const ChizmaDaftar = React.lazy(() => import("../daftar/ChizmaDaftar.jsx"));   // REV400: yechish uchun daftar
const SHRIFT = [1, 1.15, 1.3, 1.5, 1.75];
const shriftOl = () => { try { const n = Number(localStorage.getItem("kabutar:xb:shrift")); return SHRIFT.includes(n) ? n : 1; } catch { return 1; } };

/** PISA birligining umumiy matni / jadvali / grafigi: savol yonida doim ochiq, uzun bo'lsa o'ralib turadi. */
function Stimul({ stimul, imtihon }) {
  const [ochiq, setOchiq] = React.useState(true);
  return <div className={`xb-stimul ${imtihon ? "is-imtihon" : ""}`}>
    <button type="button" className="xb-stimul-bosh" onClick={() => setOchiq(!ochiq)} aria-expanded={ochiq}>
      📄 <b>{stimul.nom}</b> <small>{ochiq ? T("(yashirish)") : T("(matnni ochish)")}</small></button>
    {ochiq && <div className="xb-stimul-ich">
      {stimul.matn && <CourseText text={stimul.matn} className="xb-stimul-matn" />}
      {stimul.rasm_svg && <img className="xb-savol-rasm" src={svgUrl(stimul.rasm_svg)} alt={T("Ma’lumot rasmi")} />}
    </div>}
  </div>;
}

/**
 * Bitta savol: shart (formula KaTeX), rasm (SVG — xavfsiz <img>), 4 variant yoki qisqa javob.
 * 🔊 — ustoz savolni o'qib beradi; 🎤 — o'quvchi javobni aytadi (variant harfi yoki son), u yozilib, tasdiqlanadi.
 */
export default function XbSavol({ savol, javob, onJavob, holat = null, ovoz, raqam = null, imtihon = false, korsatkich = true }) {
  const til = xbTil();
  const mik = useMikrofon(MIK_TIL[til]);   // REV270: mikrofon o'quvchi tilida tinglaydi
  const [shrift, setShrift] = React.useState(shriftOl);   // REV400: matnni kattalashtirish
  const [toliq, setToliq] = React.useState(false);        // REV400: savolni butun ekranga
  const [daftar, setDaftar] = React.useState(false);      // REV400: yozuv daftari
  const shriftQoy = (d) => { const i = Math.max(0, Math.min(SHRIFT.length - 1, SHRIFT.indexOf(shrift) + d)); setShrift(SHRIFT[i]); try { localStorage.setItem("kabutar:xb:shrift", String(SHRIFT[i])); } catch { /* */ } };
  React.useEffect(() => { if (!toliq) return undefined; const k = (e) => { if (e.key === "Escape") setToliq(false); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [toliq]);
  if (!savol) return null;
  const tanlov = savol.turi === "tanlov";
  const oqib = () => {
    const variantlar = tanlov ? savol.javoblar.map((v, i) => `${"ABCD"[i]}: ${v}`).join(". ") : "";
    ovoz?.say(`${savol.stimul && !imtihon ? "" : ""}${savol.savol} ${variantlar}`);
  };
  const ayt = () => mik.tingla((alts) => {
    for (const a of alts) {
      if (tanlov) {
        const i = ovozdanVariant(a);
        if (i !== null && i < savol.javoblar.length) { onJavob?.("ABCD"[i], "aytib"); return; }
      } else {
        const j = ovozdanJavob(a, til);
        if (j) { onJavob?.(j, "aytib"); return; }
      }
    }
  });
  const berilgan = String(javob ?? "");
  return <div className={`xb-savol ${imtihon ? "is-imtihon" : ""} ${toliq ? "is-toliq" : ""}`} style={{ "--xb-shrift": shrift }}>
    <div className="xb-savol-bosh">
      {raqam !== null && <span className="xb-savol-raqam">{raqam}</span>}
      {korsatkich && !imtihon && <span className="xb-chip">{T(FIKRLASH[savol.fikrlash] || "")}</span>}
      {korsatkich && !imtihon && savol.qiyinlik_ball && <span className="xb-chip xb-chip-pisa" title={T(savol.qiyinlik_taxminiy ? "PISA shkalasida taxminiy qiyinlik" : "Asl PISA savolining qiyinligi (OECD)")}>📏 {savol.qiyinlik_ball}{savol.qiyinlik_taxminiy ? "≈" : ""}</span>}
      {korsatkich && !imtihon && savol.xalqaro_foiz !== null && savol.xalqaro_foiz !== undefined &&
        <span className="xb-chip xb-chip-dunyo" title={T("Shunga o‘xshash TIMSS savolini dunyo bo‘yicha to‘g‘ri yechganlar ulushi")}>🌍 {savol.xalqaro_foiz}%</span>}
      <span className="xb-savol-tug">
        <button type="button" className="xb-ikon" onClick={() => shriftQoy(-1)} disabled={shrift === SHRIFT[0]} aria-label={T("Matnni kichraytirish")} title={T("Matnni kichraytirish")}>A−</button>
        <button type="button" className="xb-ikon" onClick={() => shriftQoy(1)} disabled={shrift === SHRIFT[SHRIFT.length - 1]} aria-label={T("Matnni kattalashtirish")} title={T("Matnni kattalashtirish")}>A+</button>
        <button type="button" className={`xb-ikon ${toliq ? "is-on" : ""}`} onClick={() => setToliq((x) => !x)} aria-label={toliq ? T("Kichraytirish") : T("Butun ekranga")} title={toliq ? T("Kichraytirish (Esc)") : T("Butun ekranga")}>{toliq ? "🗗" : "⛶"}</button>
        <button type="button" className={`xb-ikon ${daftar ? "is-on" : ""}`} onClick={() => setDaftar((x) => !x)} aria-label={T("Yozuv daftari")} title={T("Yozuv daftari — yechimni chizib, yozib ishlang")}>✏️</button>
        {ovoz && <button type="button" className="xb-ikon" onClick={oqib} aria-label={T("Savolni o‘qib ber")} title={T("Savolni o‘qib ber")}>🔊</button>}
        {mik.mavjud && onJavob && holat === null && <button type="button" className={`xb-ikon ${mik.tinglash ? "is-on" : ""}`} onClick={mik.tinglash ? mik.toxta : ayt}
          aria-label={T("Javobni ayting")} title={T("Javobni ovoz bilan ayting")}>🎤</button>}
      </span>
    </div>
    {savol.stimul && <Stimul stimul={savol.stimul} imtihon={imtihon} />}
    <CourseText text={savol.savol} className="xb-savol-matn" />
    {savol.rasm_svg && <img className="xb-savol-rasm" src={svgUrl(savol.rasm_svg)} alt={T("Savol rasmi")} />}
    {mik.tinglash && <p className="xb-mik">🎙️ {T("Tinglayapman… javobni ayting (masalan: «be» yoki «o‘n ikki»)")}</p>}
    {mik.xato && <p className="xb-mik is-xato">{T(mik.xato)}</p>}
    {tanlov ? <div className="xb-variantlar" role="radiogroup">
      {savol.javoblar.map((v, i) => {
        const h = "ABCD"[i];
        const tanlandi = berilgan.toUpperCase() === h;
        const cls = holat === null ? (tanlandi ? "is-tanlandi" : "") : i === holat.togri ? "is-togri" : tanlandi ? "is-xato" : "is-sust";
        return <button key={i} type="button" role="radio" aria-checked={tanlandi} disabled={holat !== null || !onJavob}
          className={`xb-variant ${cls}`} onClick={() => onJavob?.(h, "yozib")}>
          <b>{h}</b><span><BoardText text={v} /></span>
        </button>;
      })}
    </div> : <div className="xb-ochiq">
      <label>{T("Javobingiz")}:
        <input type="text" inputMode={savol.javob_turi === "soz" || savol.javob_turi === "kasr" ? "text" : "decimal"} value={berilgan} disabled={holat !== null || !onJavob}
          maxLength={60} onChange={(e) => onJavob?.(e.target.value, "yozib")} placeholder={savol.javob_turi === "kasr" ? "3/4" : savol.javob_turi === "son" ? "0" : ""}
          className={holat === null ? "" : holat.ok ? "is-togri" : "is-xato"} />
      </label>
      {/* REV401: telefon raqam klaviaturasida «/» va «−» yo'q — shu tugmalar bilan yoziladi */}
      {savol.javob_turi !== "soz" && holat === null && onJavob && <div className="xb-belgi-tugmalar" aria-label={T("Belgilar")}>
        {["/", ",", "−", "(", ")", "%", "°"].map((b) => <button key={b} type="button" onPointerDown={(e) => e.preventDefault()}
          onClick={() => onJavob?.(berilgan + (b === "−" ? "-" : b), "yozib")}>{b === "/" ? "a/b" : b}</button>)}
        <button type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => onJavob?.(berilgan.slice(0, -1), "yozib")} aria-label={T("O‘chirish")}>⌫</button>
      </div>}
      {savol.javob_turi === "kasr" && <small className="xb-muted">{T("Kasrni 3/4 ko‘rinishida yoki o‘nli kasr bilan yozing.")}</small>}
    </div>}
    {daftar && <React.Suspense fallback={<p className="xb-muted">…</p>}><ChizmaDaftar kalit={`${savol.savol_id || savol.n || "s"}:${savol.v ?? 0}`} balandlik={toliq ? 420 : 340}
      sarlavha={<CourseText text={savol.savol} />} onYop={() => setDaftar(false)} /></React.Suspense>}
  </div>;
}
