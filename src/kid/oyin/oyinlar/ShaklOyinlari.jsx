// REV536: shakl o'yinlari — 201 shaklni top, 202 shakl uyasi, 203 nimaga o'xshaydi, 204 naqsh, 205 katta-kichik. Shakllar SVG.
import React from "react";
import { Rasm, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";
import { RANGLAR, SHAKLLAR } from "../oyinRules.js";

const YOL = {
  doira: <circle cx="50" cy="50" r="40" />, kvadrat: <rect x="14" y="14" width="72" height="72" rx="6" />, uchburchak: <polygon points="50,10 92,86 8,86" />,
  yulduz: <polygon points="50,6 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38" />, tortburchak: <rect x="6" y="26" width="88" height="48" rx="6" />,
  yurak: <path d="M50 88 C10 58 6 30 28 18 C40 12 50 22 50 30 C50 22 60 12 72 18 C94 30 90 58 50 88 Z" />, oval: <ellipse cx="50" cy="50" rx="44" ry="28" />,
  romb: <polygon points="50,6 90,50 50,94 10,50" />, beshburchak: <polygon points="50,6 94,38 77,90 23,90 6,38" />, oltiburchak: <polygon points="28,10 72,10 94,50 72,90 28,90 6,50" />,
};
export function Shakl({ sh, rang, kontur = false, olcham = 64, yarim = "" }) {   // yarim: "chap" | "ong" — shaklning yarmi (REV537)
  const hex = rang ? RANGLAR[rang]?.hex || "#4b8ad6" : "#4b8ad6";
  return <svg viewBox={yarim === "chap" ? "0 0 50 100" : yarim === "ong" ? "50 0 50 100" : "0 0 100 100"} width={yarim ? olcham / 2 : olcham} height={olcham} aria-hidden="true" style={{ display: "block" }}>
    <g fill={kontur ? "#eef2f7" : hex} stroke="#2b3452" strokeWidth={kontur ? 4 : 3.5} strokeLinejoin="round" strokeDasharray={kontur ? "7 6" : undefined}>{YOL[sh]}</g></svg>;
}
const nomi = (sh, izoh) => SHAKLLAR[sh]?.[izoh] || SHAKLLAR[sh]?.uz || "";
function ShaklTugmalar(p, { kontur = false } = {}) {
  const { raund, joriy, javob, ishora, qulf, izoh } = p;
  return <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v) => <Tugma key={v.k} label={nomi(v.shakl, izoh)} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
    olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}><Shakl sh={v.shakl} rang={v.rang} kontur={kontur} olcham={v.olcham || 64} yarim={v.yarim || ""} /></Tugma>)}</Variantlar>;
}
export function ShaklniTop(p) { return <div className="oy-sahna"><div className="oy-namuna"><span className="oy-rang-sor" aria-hidden="true">🔷</span></div>{ShaklTugmalar(p)}</div>; }
export function ShaklUyasi(p) { const { shakl, rang } = p.raund.savol; return <div className="oy-sahna"><div className="oy-namuna"><Shakl sh={shakl} rang={rang} olcham={110} /></div>{ShaklTugmalar(p, { kontur: true })}</div>; }
export function ShaklNarsa(p) { return <div className="oy-sahna"><div className="oy-namuna"><span className="oy-rang-narsa"><Rasm el={p.raund.savol.el} rasm={p.rasm} korinish="emoji" /></span></div>{ShaklTugmalar(p, { kontur: true })}</div>; }
export function Naqsh(p) {
  const q = p.raund.savol.qator, o = q.length > 7 ? 28 : q.length > 5 ? 34 : 42;   // bir qatorga sig'ishi uchun
  return <div className="oy-sahna"><div className="oy-namuna oy-naqsh">{q.map((x, i) => <Shakl key={i} sh={x.shakl} rang={x.rang} olcham={o} />)}
    <span className="oy-rang-dog is-sor" style={{ width: o, height: o, flex: "0 0 auto", fontSize: o * 0.6 }}>?</span></div>{ShaklTugmalar(p)}</div>;
}
export function KattaKichik(p) { return <div className="oy-sahna"><div className="oy-namuna"><span className="oy-rang-sor" aria-hidden="true">{p.raund.savol.soralgan === "katta" ? "🐘" : "🐭"}</span></div>{ShaklTugmalar(p)}</div>; }
// REV537: mantiq va sanash
const SonTugmalar = (p) => { const { raund, joriy, javob, ishora, qulf } = p;
  return <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v) => <Tugma key={v.k} label={String(v.son)} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
    olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}><span className="oy-mat-son">{v.son}</span></Tugma>)}</Variantlar>; };
export function Matritsa(p) {
  return <div className="oy-sahna"><div className="oy-namuna oy-matritsa">{p.raund.savol.katak.map((x, i) => <span key={i} className="oy-matritsa-katak">{x ? <Shakl sh={x.shakl} rang={x.rang} olcham={52} /> : <b>?</b>}</span>)}</div>{ShaklTugmalar(p)}</div>;
}
export function Yarmi(p) { const { shakl, rang } = p.raund.savol; return <div className="oy-sahna"><div className="oy-namuna"><Shakl sh={shakl} rang={rang} olcham={120} yarim="chap" /></div>{ShaklTugmalar(p)}</div>; }
export function SanaShakl(p) {
  const { narsalar, shakl } = p.raund.savol;
  return <div className="oy-sahna"><div className="oy-namuna oy-sana-shakl"><span className="oy-sana-nishon"><Shakl sh={shakl} kontur olcham={34} /></span>
    <div>{narsalar.map((x, i) => <Shakl key={i} sh={x.shakl} rang={x.rang} olcham={40} />)}</div></div><SonTugmalar {...p} /></div>;
}
export function KetmaSon(p) {
  return <div className="oy-sahna"><div className="oy-namuna oy-naqsh">{p.raund.savol.qator.map((x, i) => <span key={i} className="oy-ketma-son">{x}</span>)}<span className="oy-ketma-son is-sor">?</span></div><SonTugmalar {...p} /></div>;
}
