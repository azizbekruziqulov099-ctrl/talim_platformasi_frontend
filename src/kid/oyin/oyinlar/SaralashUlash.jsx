// REV348: saralash (narsa → guruh) va ulash (narsa → jufti) o'yinlari — bitta umumiy ko'rinish.
import React from "react";
import { Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";
export default function SaralashUlash(p) {
  const { raund, joriy, javob, ishora, qulf } = p;
  const el = raund.savol.el;
  return <div className="oy-sahna">
    <div className="oy-namuna oy-sar-narsa"><span aria-hidden="true">{el.emoji}</span><b>{el.uz}</b></div>
    <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v) => <Tugma key={v.k} label={v.el.uz} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
      olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}>
      <span className="oy-sar-belgi" aria-hidden="true">{v.el.emoji}</span><small className="oy-joy-soz">{v.el.uz}</small></Tugma>)}</Variantlar>
  </div>;
}
