// REV336: 93 «Chalkash yo'llar» — chapdagi narsalardan chiziqlar chalkashib o'ngga ketadi; suyakka boradiganini topish.
import React from "react";
import { Rasm, Tugma, tugmaHolati } from "./umumiy.jsx";
const RANG = ["#E63946", "#2EC4B6", "#9B7BFF", "#FFB703"];
export default function ChalkashYollar(p) {
  const { raund, joriy, javob, ishora, qulf, rasm } = p;
  const { oxir, maqsad, k } = raund.savol;
  const H = 70, W = 260, y = (i) => 35 + i * H;
  return <div className="oy-sahna oy-yollar">
    <div className="oy-yol-chap">{raund.variantlar.map((v) => <Tugma key={v.k} label={v.el.say || v.el.uz} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
      olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}><Rasm el={v.el} rasm={rasm} kichik /></Tugma>)}</div>
    <svg viewBox={`0 0 ${W} ${k * H}`} className="oy-yol-svg" aria-hidden="true">
      {oxir.map((o, i) => { const a = y(i), b = y(o), m = W / 2;
        return <path key={i} d={`M0,${a} C${m * 0.6},${a} ${m * 0.4},${b} ${m},${(a + b) / 2} S${W * 0.85},${b} ${W},${b}`} fill="none" stroke={RANG[i % RANG.length]} strokeWidth="6" strokeLinecap="round" />; })}
    </svg>
    <div className="oy-yol-ong">{Array.from({ length: k }, (_, i) => <span key={i}>{i === maqsad ? "🦴" : "⚪"}</span>)}</div>
  </div>;
}
