// REV338: matematika o'yinlari — 49 do'kon, 57 o'nlik bog'lami, 43 tenglashtir, 59 masala ertagi.
import React from "react";
import { Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";
const SonTugmalar = (p) => { const { raund, joriy, javob, ishora, qulf } = p;
  return <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v) => <Tugma key={v.k} label={String(v.son)} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
    olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}><span className="oy-mat-son">{v.son}</span></Tugma>)}</Variantlar>; };
const Qator = ({ e, n }) => <span className="oy-mat-qator" aria-hidden="true">{Array.from({ length: n }, (_, i) => <i key={i}>{e}</i>)}</span>;

export function Dokon(p) {
  const { raund, joriy, javob, ishora, qulf } = p;
  return <div className="oy-sahna">
    <div className="oy-namuna oy-hamyon" aria-hidden="true"><span>👛</span><Qator e="🪙" n={raund.savol.pul} /></div>
    <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v) => <Tugma key={v.k} label={`${v.narx}`} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
      olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}>
      <span className="oy-dokon-narsa">{v.el.emoji}</span><small className="oy-dokon-narx">🪙 {v.narx}</small></Tugma>)}</Variantlar>
  </div>;
}
export function Onlik(p) {
  const { onlar, birlar } = p.raund.savol;
  return <div className="oy-sahna">
    <div className="oy-namuna oy-onlik" aria-hidden="true">
      {Array.from({ length: onlar }, (_, i) => <span key={`o${i}`} className="oy-boglam">{Array.from({ length: 10 }, (_, j) => <i key={j} />)}<b /></span>)}
      {Array.from({ length: birlar }, (_, i) => <span key={`b${i}`} className="oy-tayoq" />)}
    </div>
    <SonTugmalar {...p} />
  </div>;
}
export function Tenglash(p) {
  const { chap, ong, e } = p.raund.savol;
  const toldi = p.kadr || (p.fb?.togri && p.fb?.j === p.raund.togri);
  return <div className="oy-sahna">
    <div className="oy-namuna oy-tenglash" aria-hidden="true">
      <span className="oy-likop"><Qator e={e} n={toldi ? ong : chap} /></span><b>{toldi ? "=" : "<"}</b><span className="oy-likop"><Qator e={e} n={ong} /></span>
    </div>
    <SonTugmalar {...p} />
  </div>;
}
export function Masala(p) {
  const { e, a, b, amal } = p.raund.savol;
  return <div className="oy-sahna">
    <div className="oy-namuna oy-masala" aria-hidden="true">
      <Qator e={e} n={a} /><b>{amal === "+" ? "+" : "−"}</b><Qator e={e} n={b} /><b>=</b><span className="oy-rang-dog is-sor">?</span>
    </div>
    <SonTugmalar {...p} />
  </div>;
}
