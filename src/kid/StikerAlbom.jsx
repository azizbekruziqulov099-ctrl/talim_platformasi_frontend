// REV333: bolaning stiker albomi (oyna) va dars oxiridagi «yangi stiker» kartasi.
import React from "react";
import OYIN_RASM from "./oyin/rasm/index.js";
import { ALBOM_TURLARI, albomOl, keyingiMukofot } from "./stikerAlbom.js";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import "./stikerAlbom.css";

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
      <ul>{ALBOM_TURLARI.map((id) => { const n = a.sanoq[id] || 0;
        return <li key={id} className={n ? "" : "is-yoq"}><img src={OYIN_RASM[id]} alt="" />{n > 0 && <span>×{n}</span>}</li>; })}</ul>
      <p>⭐ {a.jami} · {a.jami ? <>{km.qoldi} → <img className="sa-kichik" src={OYIN_RASM[km.id]} alt="" /></> : __kbUi("Birinchi darsni tugat — birinchi stiker seniki!")}</p>
    </div>
  </div>;
}
