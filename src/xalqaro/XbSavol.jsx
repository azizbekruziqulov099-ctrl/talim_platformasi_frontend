import React from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";
import CourseText from "../courses/CourseText.jsx";
import { BoardText } from "../lesson/AmaliyDoska.jsx";
import { FIKRLASH, ovozdanJavob, ovozdanVariant, svgUrl } from "./xbRules.js";
import { useMikrofon } from "./xbOvoz.js";

/**
 * Bitta savol: shart (formula KaTeX), rasm (SVG — xavfsiz <img>), 4 variant yoki qisqa javob.
 * 🔊 — ustoz savolni o'qib beradi; 🎤 — o'quvchi javobni aytadi (variant harfi yoki son), u yozilib, tasdiqlanadi.
 */
export default function XbSavol({ savol, javob, onJavob, holat = null, ovoz, raqam = null, imtihon = false, korsatkich = true }) {
  const mik = useMikrofon("uz-UZ");
  if (!savol) return null;
  const tanlov = savol.turi === "tanlov";
  const oqib = () => {
    const variantlar = tanlov ? savol.javoblar.map((v, i) => `${"ABCD"[i]}: ${v}`).join(". ") : "";
    ovoz?.say(`${savol.savol} ${variantlar}`);
  };
  const ayt = () => mik.tingla((alts) => {
    for (const a of alts) {
      if (tanlov) {
        const i = ovozdanVariant(a);
        if (i !== null && i < savol.javoblar.length) { onJavob?.("ABCD"[i], "aytib"); return; }
      } else {
        const j = ovozdanJavob(a);
        if (j) { onJavob?.(j, "aytib"); return; }
      }
    }
  });
  const berilgan = String(javob ?? "");
  return <div className={`xb-savol ${imtihon ? "is-imtihon" : ""}`}>
    <div className="xb-savol-bosh">
      {raqam !== null && <span className="xb-savol-raqam">{raqam}</span>}
      {korsatkich && !imtihon && <span className="xb-chip">{T(FIKRLASH[savol.fikrlash] || "")}</span>}
      {korsatkich && !imtihon && savol.xalqaro_foiz !== null && savol.xalqaro_foiz !== undefined &&
        <span className="xb-chip xb-chip-dunyo" title={T("Shunga o‘xshash TIMSS savolini dunyo bo‘yicha to‘g‘ri yechganlar ulushi")}>🌍 {savol.xalqaro_foiz}%</span>}
      <span className="xb-savol-tug">
        {ovoz && <button type="button" className="xb-ikon" onClick={oqib} aria-label={T("Savolni o‘qib ber")} title={T("Savolni o‘qib ber")}>🔊</button>}
        {mik.mavjud && onJavob && holat === null && <button type="button" className={`xb-ikon ${mik.tinglash ? "is-on" : ""}`} onClick={mik.tinglash ? mik.toxta : ayt}
          aria-label={T("Javobni ayting")} title={T("Javobni ovoz bilan ayting")}>🎤</button>}
      </span>
    </div>
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
        <input type="text" inputMode={savol.javob_turi === "soz" ? "text" : "decimal"} value={berilgan} disabled={holat !== null || !onJavob}
          maxLength={60} onChange={(e) => onJavob?.(e.target.value, "yozib")} placeholder={savol.javob_turi === "kasr" ? "3/4" : savol.javob_turi === "son" ? "0" : ""}
          className={holat === null ? "" : holat.ok ? "is-togri" : "is-xato"} />
      </label>
      {savol.javob_turi === "kasr" && <small className="xb-muted">{T("Kasrni 3/4 ko‘rinishida yoki o‘nli kasr bilan yozing.")}</small>}
    </div>}
  </div>;
}
