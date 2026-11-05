// REV335: 103 «Kubiklar minorasi» — namunadagi minoraning xuddi o'zini topish (ranglar va tartib).
import React from "react";
import { Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";
const Minora = ({ r, katta = false }) => <span className={`oy-minora ${katta ? "is-katta" : ""}`} aria-hidden="true">
  {[...r].reverse().map((c, i) => <i key={i} style={{ background: c }} />)}</span>;
export default function KubiklarMinorasi(p) {
  const { raund, joriy, javob, ishora, qulf } = p;
  return <div className="oy-sahna">
    <div className="oy-namuna"><Minora r={raund.savol.minora} katta /></div>
    <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v, i) => <Tugma key={v.k} label={`${i + 1}`} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
      olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}><Minora r={v.minora} /></Tugma>)}</Variantlar>
  </div>;
}
