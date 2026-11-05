// REV335: 68 «Soyasini top» — tepada rangli narsa, pastda soyalar.
import React from "react";
import { Rasm, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";
export default function SoyasiniTop(p) {
  const { raund, joriy, javob, ishora, qulf, rasm } = p;
  return <div className="oy-sahna">
    <div className="oy-namuna"><Rasm el={raund.savol.el} rasm={rasm} /></div>
    <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v) => <Tugma key={v.k} label="?" holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
      olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}><Rasm el={v.el} rasm={rasm} className="oy-soya" /></Tugma>)}</Variantlar>
  </div>;
}
