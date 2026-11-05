// REV333: bolaning stiker albomi (oyna) va dars oxiridagi «yangi stiker» kartasi.
import React from "react";
import OYIN_RASM from "./oyin/rasm/index.js";
import { ALBOM_TURLARI, albomOl, keyingiMukofot, orolHolati } from "./stikerAlbom.js";
import { SARGUZASHT_FON } from "./sarguzasht/fonlar.js";   // REV334: haftalik orol
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import "./stikerAlbom.css";

// REV334: haftalik orol — har tugagan dars orolga bitta qism qo'shadi
const QISM_JOY = { orol_qism_daraxt: [22, 24, 20], orol_qism_uy: [42, 30, 17], orol_qism_mayoq: [62, 18, 12], orol_qism_kema: [70, 58, 16] };
export function HaftalikOrol({ albom, sana = new Date() }) {
  const h = orolHolati(albom, sana);
  const fon = SARGUZASHT_FON.fon_orol_bosh;
  return <div className={`sa-orol ${h.soni ? "" : "is-bosh"}`} aria-label={`${__kbUi("Haftalik orol")}: ${h.soni}/${h.jami}`}>
    <img className="sa-orol-fon" src={fon.kichik || fon.src} alt="" />
    {h.qismlar.filter((q) => QISM_JOY[q]).map((q, i) => { const [x, y, w] = QISM_JOY[q];
      return <img key={q} className="sa-orol-qism" src={SARGUZASHT_FON[q]?.src} alt="" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, "--i": i }} />; })}
    <span className="sa-orol-yorliq">🏝️ {__kbUi("Haftalik orol")}: <b>{h.soni}/{h.jami}</b>{h.tugadi ? " 🎉" : ""}{h.orollar > 0 ? ` · 🏝️×${h.orollar}` : ""}</span>
  </div>;
}

export function YangiStiker({ natija }) {
  if (!natija) return null;
  return <div className="sa-yangi" role="status">
    <small>🎁 {__kbUi("Yangi stiker!")}</small>
    <div>{[natija.stiker, natija.mukofot].filter(Boolean).map((id, i) => <img key={id} src={OYIN_RASM[id]} alt="" style={{ "--i": i }} />)}</div>
  </div>;
}

export default function StikerAlbom({ egasi = "bola", onClose }) {
  const a = albomOl(egasi);
  const km = keyingiMukofot(a.jami);
  return <div className="sa-fon" role="dialog" aria-modal="true" aria-label={__kbUi("Stiker albomim")} onClick={onClose}>
    <div className="sa-oyna" onClick={(e) => e.stopPropagation()}>
      <header><img src={OYIN_RASM.albom} alt="" /><b>{__kbUi("Stiker albomim")}</b><button type="button" onClick={onClose} aria-label={__kbUi("Yopish")}>✕</button></header>
      <HaftalikOrol albom={a} />
      <ul>{ALBOM_TURLARI.map((id) => { const n = a.sanoq[id] || 0;
        return <li key={id} className={n ? "" : "is-yoq"}><img src={OYIN_RASM[id]} alt="" />{n > 0 && <span>×{n}</span>}</li>; })}</ul>
      <p>⭐ {a.jami} · {a.jami ? <>{km.qoldi} → <img className="sa-kichik" src={OYIN_RASM[km.id]} alt="" /></> : __kbUi("Birinchi darsni tugat — birinchi stiker seniki!")}</p>
    </div>
  </div>;
}
