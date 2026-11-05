// REV336: 114 «Teskarisini top» — issiq/sovuq, katta/kichik, kun/tun…
import React from "react";
import { Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";
export default function Teskari(p) {
  const { raund, joriy, javob, ishora, qulf, izoh } = p;
  const s = (el) => el.soz?.[izoh] || el.soz?.uz || "";
  return <div className="oy-sahna">
    <div className="oy-namuna oy-teskari-namuna"><span aria-hidden="true">{raund.savol.el.emoji}</span><b>{s(raund.savol.el)}</b></div>
    <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v) => <Tugma key={v.k} label={s(v.el)} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
      olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}>
      <span className="oy-teskari-belgi" aria-hidden="true">{v.el.emoji}</span><small className="oy-joy-soz">{s(v.el)}</small></Tugma>)}</Variantlar>
  </div>;
}
