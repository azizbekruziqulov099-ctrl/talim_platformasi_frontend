// REV335: 76 «Qayerda?» — quti va narsa: ustida, ostida, ichida, o'ngda, chapda.
import React from "react";
import { Rasm, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";
const BELGI = { ustida: "⬆️", ostida: "⬇️", ichida: "📥", ongda: "➡️", chapda: "⬅️" };
export default function Joylashuv(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, matn } = p;
  const { el, joy } = raund.savol;
  return <div className="oy-sahna">
    <div className={`oy-joy is-${joy}`} aria-hidden="true">
      <span className="oy-joy-quti">📦</span>
      <span className="oy-joy-narsa"><Rasm el={el} rasm={rasm} kichik /></span>
    </div>
    <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v) => <Tugma key={v.k} label={matn(v.k)} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
      olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}>
      <span className="oy-joy-belgi" aria-hidden="true">{BELGI[v.k]}</span><small className="oy-joy-soz">{matn(v.k)}</small></Tugma>)}</Variantlar>
  </div>;
}
