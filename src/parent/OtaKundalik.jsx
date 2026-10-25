import React from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

// REV167: ota-onaga yutuqlar — oddiy raqamlar bilan. REV168: kundalikning o'zi — kid/BolalarKundaligi.jsx (ota-ona rejimi).


/** Yutuqlar — ota-onaga oddiy raqamlar bilan. */
export function YutuqQator({ data }) {
  const d = data?.daraja;
  if (!d) return null;
  return <div className="ok-stats" aria-label={__kbUi("Yutuqlar")}>
    <div><span aria-hidden="true">⭐</span><b>{data.jami_yulduz}</b><small>{__kbUi("jami yulduz")}</small></div>
    <div><span aria-hidden="true">{d.emoji}</span><b>{d.daraja}-{__kbUi("daraja")}</b>
      <small>{__kbUi(d.nom)} · {__kbUi("keyingisigacha")} {d.qoldi} ⭐</small></div>
    <div><span aria-hidden="true">🔥</span><b>{data.ketma_ket || 0}</b><small>{__kbUi("kun ketma-ket o‘qidi")}</small></div>
    {data.reyting && <div><span aria-hidden="true">🏆</span><b>{data.reyting.orin}/{data.reyting.jami}</b><small>{__kbUi("guruhda o‘rni (shu hafta)")}</small></div>}
  </div>;
}
