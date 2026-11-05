// REV337: rang-tasvir o'yinlari — 61 rangni top, 62 rang uyi, 63 bo'yab chiq, 64 rang aralashtir.
import React from "react";
import { Rasm, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";
import { RANGLAR } from "../oyinRules.js";
const nomi = (r, izoh) => RANGLAR[r]?.s[izoh] || RANGLAR[r]?.s.uz || "";
function Bo({ r, uy = false }) {
  return uy ? <svg viewBox="0 0 64 64" className="oy-rang-uy" aria-hidden="true"><path d="M8 30 L32 8 L56 30 V56 H8 Z" fill={RANGLAR[r].hex} stroke="#2b3452" strokeWidth="3" strokeLinejoin="round" />
    <rect x="26" y="38" width="12" height="18" rx="2" fill="#fff" opacity=".8" /></svg>
    : <span className="oy-rang-dog" style={{ background: RANGLAR[r].hex }} aria-hidden="true" />;
}
function RangTugmalar(p, { uy = false } = {}) {
  const { raund, joriy, javob, ishora, qulf, izoh } = p;
  return <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v) => <Tugma key={v.k} label={nomi(v.rang, izoh)} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
    olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}><Bo r={v.rang} uy={uy} /></Tugma>)}</Variantlar>;
}
export function RangniTop(p) { return <div className="oy-sahna"><div className="oy-namuna"><span className="oy-rang-sor" aria-hidden="true">🎨</span></div>{RangTugmalar(p)}</div>; }
export function RangUyi(p) { return <div className="oy-sahna"><div className="oy-namuna"><span className="oy-rang-narsa"><Rasm el={p.raund.savol.el} rasm={p.rasm} /></span></div>{RangTugmalar(p, { uy: true })}</div>; }
export function BoyabChiq(p) {
  const boyaldi = p.kadr || (p.fb?.togri && p.fb?.j === p.raund.togri);
  return <div className="oy-sahna"><div className="oy-namuna"><span className={`oy-rang-narsa ${boyaldi ? "is-boyaldi" : "is-rangsiz"}`}><Rasm el={p.raund.savol.el} rasm={p.rasm} /></span></div>{RangTugmalar(p)}</div>;
}
export function RangAralashtir(p) {
  const { a, b } = p.raund.savol;
  return <div className="oy-sahna"><div className="oy-namuna oy-aralash"><Bo r={a} /><b>+</b><Bo r={b} /><b>=</b><span className="oy-rang-dog is-sor">?</span></div>{RangTugmalar(p)}</div>;
}
