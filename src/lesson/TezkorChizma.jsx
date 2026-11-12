// REV517: «⚡ Kabu tezkor» chizmalari — server faqat ma'lumot beradi ({tur, ...}), bu yerda SVG qilib chiziladi.
import React from "react";
import { BoardText } from "./AmaliyDoska.jsx";

const R = 70, CX = 90, CY = 90;
const nuqta = (g, r = R) => [CX + r * Math.cos((g - 90) * Math.PI / 180), CY + r * Math.sin((g - 90) * Math.PI / 180)];
function sektor(a0, a1, fill) {
  const [x0, y0] = nuqta(a0), [x1, y1] = nuqta(a1);
  return <path d={`M${CX},${CY} L${x0},${y0} A${R},${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1} Z`} fill={fill} stroke="#fff" strokeWidth="2" />;
}

export default function TezkorChizma({ c, savol }) {
  if (!c) return null;
  const s = { width: "100%", maxWidth: 260, height: "auto", display: "block", margin: "0 auto" };
  if (c.tur === "kasr") return <svg viewBox="0 0 180 180" style={s}>{Array.from({ length: c.n }, (_, i) => <g key={i}>{sektor(i * 360 / c.n, (i + 1) * 360 / c.n, i < c.k ? "#f2b72e" : "#e3eaf2")}</g>)}
    <circle cx={CX} cy={CY} r={R} fill="none" stroke="#13314f" strokeWidth="3" /></svg>;
  if (c.tur === "foiz") return <svg viewBox="0 0 180 180" style={s}>{sektor(0, Math.max(1, c.p * 3.6 - 0.01), "#2e9e5b")}{sektor(c.p * 3.6, 359.99, "#e3eaf2")}
    <circle cx={CX} cy={CY} r={R} fill="none" stroke="#13314f" strokeWidth="3" /></svg>;
  if (c.tur === "nur") {
    const x = (i) => 20 + i * 26;
    return <svg viewBox="0 0 300 80" style={{ ...s, maxWidth: 420 }}><line x1="10" y1="40" x2="292" y2="40" stroke="#13314f" strokeWidth="3" markerEnd="url(#uq)" />
      <defs><marker id="uq" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#13314f" /></marker></defs>
      {Array.from({ length: 11 }, (_, i) => <g key={i}><line x1={x(i)} y1="32" x2={x(i)} y2="48" stroke="#13314f" strokeWidth={i % 5 === 0 ? 3 : 1.5} />
        {(i === 0 || i === 1) && <text x={x(i)} y="70" fontSize="14" textAnchor="middle" fill="#13314f">{c.bosh + i * c.qadam}</text>}</g>)}
      <circle cx={x(c.nuqta)} cy="40" r="8" fill="#d9534f" /><text x={x(c.nuqta)} y="22" fontSize="16" textAnchor="middle" fill="#d9534f" fontWeight="800">?</text></svg>;
  }
  if (c.tur === "burchak") {
    const O = 110, g = c.g * Math.PI / 180, [x2, y2] = [O + 100 * Math.cos(g), 140 - 100 * Math.sin(g)];
    return <svg viewBox="0 0 240 160" style={s}><line x1={O} y1="140" x2={O + 110} y2="140" stroke="#13314f" strokeWidth="4" strokeLinecap="round" />
      <line x1={O} y1="140" x2={x2} y2={y2} stroke="#13314f" strokeWidth="4" strokeLinecap="round" />
      {c.g === 90 ? <rect x={O} y="118" width="22" height="22" fill="none" stroke="#f2b72e" strokeWidth="3" />
        : <path d={`M${O + 30},140 A30,30 0 0 0 ${O + 30 * Math.cos(g)},${140 - 30 * Math.sin(g)}`} fill="none" stroke="#f2b72e" strokeWidth="3" />}</svg>;
  }
  if (c.tur === "uchburchak") return <svg viewBox="0 0 220 150" style={s}><polygon points="20,130 200,130 90,20" fill="#eef6ff" stroke="#13314f" strokeWidth="3" />
    <text x="40" y="122" fontSize="16" fill="#13314f" fontWeight="700">{c.a}°</text><text x="146" y="122" fontSize="16" fill="#13314f" fontWeight="700">{c.b}°</text>
    <text x="84" y="52" fontSize="20" fill="#d9534f" fontWeight="800">?</text></svg>;
  if (c.tur === "massiv") return <svg viewBox={`0 0 ${c.u * 28 + 10} ${c.q * 28 + 10}`} style={{ ...s, maxWidth: Math.min(320, c.u * 40) }}>
    {Array.from({ length: c.q * c.u }, (_, i) => <circle key={i} cx={19 + (i % c.u) * 28} cy={19 + Math.floor(i / c.u) * 28} r="10" fill={["#f2b72e", "#4b8ad6", "#2e9e5b", "#d9534f"][Math.floor(i / c.u) % 4]} />)}</svg>;
  if (c.tur === "tortburchak") { const w = 40 + c.a * 18, h = 30 + c.b * 12;
    return <svg viewBox={`0 0 ${w + 95} ${h + 50}`} style={s}><rect x="30" y="15" width={w} height={h} fill="#eef6ff" stroke="#13314f" strokeWidth="3" />
      <text x={30 + w / 2} y={h + 40} fontSize="16" textAnchor="middle" fill="#13314f" fontWeight="700">{c.a} sm</text>
      <text x={w + 36} y={15 + h / 2} fontSize="16" fill="#13314f" fontWeight="700">{c.b} sm</text></svg>; }
  if (c.tur === "soat") { const m = c.m, sg = ((c.s % 12) + m / 60) * 30, mg = m * 6;
    const [hx, hy] = nuqta(sg, 38), [mx, my] = nuqta(mg, 58);
    return <svg viewBox="0 0 180 180" style={s}><circle cx={CX} cy={CY} r={R + 6} fill="#fff" stroke="#13314f" strokeWidth="4" />
      {Array.from({ length: 12 }, (_, i) => { const [x, y] = nuqta((i + 1) * 30, 60); return <text key={i} x={x} y={y + 5} fontSize="14" textAnchor="middle" fill="#13314f" fontWeight="700">{i + 1}</text>; })}
      <line x1={CX} y1={CY} x2={hx} y2={hy} stroke="#13314f" strokeWidth="6" strokeLinecap="round" />
      <line x1={CX} y1={CY} x2={mx} y2={my} stroke="#d9534f" strokeWidth="3.5" strokeLinecap="round" /><circle cx={CX} cy={CY} r="5" fill="#13314f" /></svg>; }
  if (c.tur === "togrimi") return <div className="bzt-togrimi"><BoardText text={savol} /><span>=</span><b><BoardText text={/^-?[\d,./]+$/.test(c.javob) ? `$${c.javob}$` : c.javob} /></b></div>;
  return null;
}
