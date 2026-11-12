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
  const mav = MavzuChizma({ c });   // REV518
  if (mav) return mav;
  if (c.tur === "togrimi") return <div className="bzt-togrimi"><BoardText text={savol} /><span>=</span><b><BoardText text={/^-?[\d,./]+$/.test(c.javob) ? `$${c.javob}$` : c.javob} /></b></div>;
  return null;
}

// REV518: mavzuga mos chizmalar — javob chizmadan topiladi
const K = "#13314f", SAR = "#f2b72e", KOK = "#4b8ad6", YASH = "#2e9e5b", QIZ = "#d9534f";
const T = (p) => <text fontSize="14" fill={K} fontWeight="700" textAnchor="middle" {...p} />;
function Panjara({ w = 240, h = 200, n = 5, children }) {   // koordinata tekisligi (−n..n)
  const sx = (x) => w / 2 + (x * (w / 2 - 12)) / n, sy = (y) => h / 2 - (y * (h / 2 - 12)) / n;
  return <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: 300, height: "auto", display: "block", margin: "0 auto" }}>
    {Array.from({ length: 2 * n + 1 }, (_, i) => i - n).map((i) => <g key={i}><line x1={sx(i)} y1={sy(-n)} x2={sx(i)} y2={sy(n)} stroke="#e3eaf2" /><line x1={sx(-n)} y1={sy(i)} x2={sx(n)} y2={sy(i)} stroke="#e3eaf2" /></g>)}
    <line x1={sx(-n)} y1={sy(0)} x2={sx(n)} y2={sy(0)} stroke={K} strokeWidth="2" /><line x1={sx(0)} y1={sy(-n)} x2={sx(0)} y2={sy(n)} stroke={K} strokeWidth="2" />
    <T x={sx(n) - 6} y={sy(0) - 6}>x</T><T x={sx(0) + 10} y={sy(n) + 12}>y</T><T x={sx(1)} y={sy(0) + 16} fontSize="11">1</T><T x={sx(0) - 9} y={sy(1) + 4} fontSize="11">1</T>
    {children(sx, sy)}</svg>;
}
export function MavzuChizma({ c }) {
  const st = { width: "100%", maxWidth: 300, height: "auto", display: "block", margin: "0 auto" };
  switch (c.tur) {
    case "guruh": return <svg viewBox={`0 0 ${c.n * 70 + 60} 90`} style={st}>{Array.from({ length: c.n }, (_, gi) => <g key={gi}><rect x={8 + gi * 70} y="10" width="60" height="70" rx="12" fill="none" stroke={KOK} strokeDasharray="4 3" />
      {Array.from({ length: c.g }, (_, k) => <circle key={k} cx={22 + gi * 70 + (k % 3) * 16} cy={26 + Math.floor(k / 3) * 18} r="6" fill={SAR} />)}</g>)}
      {Array.from({ length: c.q }, (_, k) => <circle key={k} cx={c.n * 70 + 30} cy={26 + k * 16} r="6" fill={QIZ} />)}</svg>;
    case "blok": return <svg viewBox={`0 0 ${c.o * 18 + c.b * 16 + 40} 140`} style={st}>{Array.from({ length: c.o }, (_, i) => <g key={i}>{Array.from({ length: 10 }, (_, k) => <rect key={k} x={10 + i * 18} y={10 + k * 12} width="12" height="11" fill={KOK} stroke="#fff" />)}</g>)}
      {Array.from({ length: c.b }, (_, k) => <rect key={k} x={c.o * 18 + 24 + (k % 3) * 16} y={100 - Math.floor(k / 3) * 16} width="12" height="12" fill={SAR} />)}</svg>;
    case "sakrash": { const x = (i) => 15 + i * 22, b = c.a, e = c.ayir ? c.a - c.d : c.a + c.d;
      return <svg viewBox="0 0 400 90" style={{ ...st, maxWidth: 440 }}><line x1="5" y1="60" x2="395" y2="60" stroke={K} strokeWidth="3" />
        {Array.from({ length: 18 }, (_, i) => <g key={i}><line x1={x(i)} y1="54" x2={x(i)} y2="66" stroke={K} /><T x={x(i)} y="82" fontSize="11">{i}</T></g>)}
        {Array.from({ length: c.d }, (_, k) => { const p0 = c.ayir ? b - k : b + k, p1 = c.ayir ? p0 - 1 : p0 + 1;
          return <path key={k} d={`M${x(p0)},54 Q${(x(p0) + x(p1)) / 2},22 ${x(p1)},54`} fill="none" stroke={SAR} strokeWidth="2.5" />; })}
        <circle cx={x(b)} cy="60" r="6" fill={KOK} /><T x={x(e)} y="44" fill={QIZ}>?</T></svg>; }
    case "panjara": return <svg viewBox="0 0 210 210" style={{ ...st, maxWidth: 220 }}>{Array.from({ length: 100 }, (_, i) => <rect key={i} x={5 + (i % 10) * 20} y={5 + Math.floor(i / 10) * 20} width="20" height="20" fill={i < c.k ? YASH : "#fff"} stroke="#b9c6d6" />)}</svg>;
    case "ustun": { const m = Math.max(...c.v); return <svg viewBox="0 0 240 170" style={st}><line x1="30" y1="140" x2="230" y2="140" stroke={K} strokeWidth="2" /><line x1="30" y1="10" x2="30" y2="140" stroke={K} strokeWidth="2" />
      {Array.from({ length: m + 1 }, (_, i) => <g key={i}><line x1="26" y1={140 - i * (120 / m)} x2="230" y2={140 - i * (120 / m)} stroke="#eef2f7" /><T x="16" y={144 - i * (120 / m)} fontSize="10">{i}</T></g>)}
      {c.v.map((v, i) => <g key={i}><rect x={45 + i * 47} y={140 - v * (120 / m)} width="30" height={v * (120 / m)} fill={[KOK, SAR, YASH, QIZ][i]} /><T x={60 + i * 47} y="158" fontSize="11">{c.nom[i]}</T></g>)}</svg>; }
    case "yaxlit": { const x = (i) => 20 + i * 26; return <svg viewBox="0 0 310 80" style={{ ...st, maxWidth: 380 }}><line x1="10" y1="40" x2="300" y2="40" stroke={K} strokeWidth="3" />
      {Array.from({ length: 11 }, (_, i) => <line key={i} x1={x(i)} y1={i % 5 === 0 ? 28 : 34} x2={x(i)} y2={i % 5 === 0 ? 52 : 46} stroke={K} strokeWidth={i % 10 === 0 ? 3 : 1.5} />)}
      <T x={x(0)} y="70">{c.o}</T><T x={x(10)} y="70">{c.o + 10}</T><circle cx={x(c.b)} cy="40" r="7" fill={QIZ} /><T x={x(c.b)} y="20" fill={QIZ}>{c.o + c.b}</T></svg>; }
    case "tarozi": return <svg viewBox="0 0 260 150" style={st}><polygon points="130,30 120,130 140,130" fill="#b9c6d6" /><line x1="20" y1="40" x2="240" y2="40" stroke={K} strokeWidth="4" />
      <rect x="25" y="44" width="80" height="50" rx="6" fill="#eef6ff" stroke={K} /><rect x="35" y="56" width="28" height="28" fill={SAR} /><T x="49" y="76">x</T>
      {Array.from({ length: Math.min(c.a, 6) }, (_, k) => <circle key={k} cx={74 + (k % 3) * 10} cy={62 + Math.floor(k / 3) * 14} r="5" fill={KOK} />)}<T x="90" y="110" fontSize="12">{c.a > 6 ? `+${c.a}` : ""}</T>
      <rect x="155" y="44" width="80" height="50" rx="6" fill="#eef6ff" stroke={K} /><T x="195" y="76" fontSize="18">{c.s}</T><T x="65" y="140" fontSize="12">x + {c.a}</T></svg>;
    case "kuboid": { const a = c.a * 14, b = c.b * 9, h = c.c * 14; return <svg viewBox={`0 0 ${a + b + 80} ${h + b + 50}`} style={st}>
      <polygon points={`20,${b + 10} ${20 + a},${b + 10} ${20 + a + b},10 ${20 + b},10`} fill="#dce9f7" stroke={K} strokeWidth="2" />
      <rect x="20" y={b + 10} width={a} height={h} fill="#eef6ff" stroke={K} strokeWidth="2" /><polygon points={`${20 + a},${b + 10} ${20 + a + b},10 ${20 + a + b},${10 + h} ${20 + a},${b + 10 + h}`} fill="#c9dcf1" stroke={K} strokeWidth="2" />
      <T x={20 + a / 2} y={b + h + 28}>{c.a} sm</T><T x={a + b + 50} y={b / 2 + h / 2 + 14}>{c.c} sm</T><T x={20 + a + b / 2 + 26} y={b / 2 + 14} fontSize="12">{c.b} sm</T></svg>; }
    case "munchoq": return <svg viewBox={`0 0 ${(c.q + c.k) * 30 + 20} 60`} style={st}><line x1="5" y1="30" x2={(c.q + c.k) * 30 + 15} y2="30" stroke="#b9c6d6" strokeWidth="2" />
      {Array.from({ length: c.q + c.k }, (_, i) => <circle key={i} cx={22 + i * 30} cy="30" r="12" fill={i < c.q ? QIZ : KOK} />)}</svg>;
    case "qoshni": { const g = c.a * Math.PI / 180; return <svg viewBox="0 0 260 130" style={st}><line x1="10" y1="110" x2="250" y2="110" stroke={K} strokeWidth="3" />
      <line x1="130" y1="110" x2={130 + 100 * Math.cos(g)} y2={110 - 100 * Math.sin(g)} stroke={K} strokeWidth="3" />
      <T x={130 + 42 * Math.cos(g / 2)} y={110 - 42 * Math.sin(g / 2) + 5}>{c.a}°</T><T x={130 + 40 * Math.cos((Math.PI + g) / 2)} y={110 - 40 * Math.sin((Math.PI + g) / 2) + 5} fill={QIZ}>x</T></svg>; }
    case "uchyuz": return <svg viewBox="0 0 240 150" style={st}><polygon points="20,120 220,120 80,20" fill="#eef6ff" stroke={K} strokeWidth="3" />
      <line x1="80" y1="20" x2="80" y2="120" stroke={QIZ} strokeDasharray="5 4" strokeWidth="2" /><rect x="80" y="108" width="12" height="12" fill="none" stroke={QIZ} />
      <T x="120" y="140">a = {c.a} sm</T><T x="58" y="75" fill={QIZ}>h = {c.h}</T></svg>;
    case "doira_r": return <svg viewBox="0 0 180 180" style={{ ...st, maxWidth: 220 }}><circle cx="90" cy="90" r="70" fill="#eef6ff" stroke={K} strokeWidth="3" /><circle cx="90" cy="90" r="4" fill={K} />
      <line x1="90" y1="90" x2="160" y2="90" stroke={QIZ} strokeWidth="3" /><T x="125" y="82" fill={QIZ}>r = {c.r} sm</T></svg>;
    case "grafik": return <Panjara>{(sx, sy) => { const x0 = -5, x1 = 5; return <><line x1={sx(x0)} y1={sy(c.k * x0 + c.b)} x2={sx(x1)} y2={sy(c.k * x1 + c.b)} stroke={KOK} strokeWidth="3" />
      <circle cx={sx(0)} cy={sy(c.b)} r="4" fill={QIZ} /><circle cx={sx(1)} cy={sy(c.k + c.b)} r="4" fill={QIZ} /></>; }}</Panjara>;
    case "parabola": return <Panjara>{(sx, sy) => { const f = (x) => (x - c.p) * (x - c.q), m = Math.max(1, Math.abs(f((c.p + c.q) / 2)) / 4.5);
      const pts = Array.from({ length: 161 }, (_, i) => -5 + i / 16).filter((x) => Math.abs(f(x) / m) <= 5).map((x) => `${sx(x)},${sy(f(x) / m)}`).join(" ");
      return <><polyline points={pts} fill="none" stroke={KOK} strokeWidth="3" /><circle cx={sx(c.p)} cy={sy(0)} r="5" fill={QIZ} /><circle cx={sx(c.q)} cy={sy(0)} r="5" fill={QIZ} /></>; }}</Panjara>;
    case "oraliq": { const x = (v) => 150 + v * 25; return <svg viewBox="0 0 300 70" style={{ ...st, maxWidth: 380 }}><line x1="10" y1="35" x2="290" y2="35" stroke={K} strokeWidth="2" />
      {Array.from({ length: 11 }, (_, i) => i - 5).map((v) => <g key={v}><line x1={x(v)} y1="30" x2={x(v)} y2="40" stroke={K} /><T x={x(v)} y="58" fontSize="11">{v}</T></g>)}
      <line x1={x(c.a)} y1="35" x2={c.ong ? 290 : 10} y2="35" stroke={KOK} strokeWidth="6" /><circle cx={x(c.a)} cy="35" r="7" fill={c.yopiq ? KOK : "#fff"} stroke={KOK} strokeWidth="3" /></svg>; }
    case "pifagor": { const s = 160 / Math.max(c.a, c.b); return <svg viewBox="0 0 230 200" style={st}><polygon points={`30,170 ${30 + c.b * s},170 30,${170 - c.a * s}`} fill="#eef6ff" stroke={K} strokeWidth="3" />
      <rect x="30" y="158" width="12" height="12" fill="none" stroke={K} /><T x={30 + c.b * s / 2} y="190">{c.b}</T><T x="18" y={170 - c.a * s / 2}>{c.a}</T><T x={40 + c.b * s / 2} y={162 - c.a * s / 2} fill={QIZ}>x</T></svg>; }
    case "parallel": { return <svg viewBox="0 0 260 170" style={st}><line x1="10" y1="50" x2="250" y2="50" stroke={K} strokeWidth="3" /><line x1="10" y1="120" x2="250" y2="120" stroke={K} strokeWidth="3" />
      <T x="242" y="44">a</T><T x="242" y="114">b</T><line x1="70" y1="160" x2="190" y2="10" stroke={KOK} strokeWidth="3" />
      <T x="174" y="68">{c.a}°</T>{c.q === "moslash" ? <T x="120" y="138" fill={QIZ}>x</T> : c.q === "almashinuvchi" ? <T x="86" y="112" fill={QIZ}>x</T> : <T x="120" y="112" fill={QIZ}>x</T>}
      </svg>; }
    case "aylana_burchak": { const g = c.g * Math.PI / 180, A = [90 + 70 * Math.cos(Math.PI / 2 + g / 2), 90 + 70 * Math.sin(Math.PI / 2 + g / 2)], B = [90 + 70 * Math.cos(Math.PI / 2 - g / 2), 90 + 70 * Math.sin(Math.PI / 2 - g / 2)];
      return <svg viewBox="0 0 180 180" style={{ ...st, maxWidth: 230 }}><circle cx="90" cy="90" r="70" fill="none" stroke={K} strokeWidth="3" />
        <polyline points={`${A[0]},${A[1]} 90,90 ${B[0]},${B[1]}`} fill="none" stroke={KOK} strokeWidth="2.5" /><polyline points={`${A[0]},${A[1]} 90,20 ${B[0]},${B[1]}`} fill="none" stroke={SAR} strokeWidth="2.5" />
        <T x="90" y="112" fontSize="12">{c.g}°</T><T x="90" y="40" fill={QIZ}>x</T></svg>; }
    case "koordinata": return <Panjara>{(sx, sy) => <><circle cx={sx(c.x)} cy={sy(c.y)} r="6" fill={QIZ} /><T x={sx(c.x) + 12} y={sy(c.y) - 8} fill={QIZ}>A</T></>}</Panjara>;
    case "vektor": return <Panjara>{(sx, sy) => <><defs><marker id="vq" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={QIZ} /></marker></defs>
      <line x1={sx(0)} y1={sy(0)} x2={sx(c.x)} y2={sy(c.y)} stroke={QIZ} strokeWidth="3" markerEnd="url(#vq)" /></>}</Panjara>;
    case "trapetsiya": { const s = 18; return <svg viewBox={`0 0 ${c.b * s + 60} ${c.h * s + 60}`} style={st}>
      <polygon points={`30,${c.h * s + 20} ${30 + c.b * s},${c.h * s + 20} ${30 + (c.b + c.a) * s / 2},20 ${30 + (c.b - c.a) * s / 2},20`} fill="#eef6ff" stroke={K} strokeWidth="3" />
      <line x1={30 + (c.b - c.a) * s / 2} y1="20" x2={30 + (c.b - c.a) * s / 2} y2={c.h * s + 20} stroke={QIZ} strokeDasharray="5 4" />
      <T x={30 + c.b * s / 2} y="14">{c.a}</T><T x={30 + c.b * s / 2} y={c.h * s + 40}>{c.b}</T><T x={18 + (c.b - c.a) * s / 2} y={c.h * s / 2 + 24} fill={QIZ}>{c.h}</T></svg>; }
    case "oxshash": { const s = 18, k = c.k; return <svg viewBox="0 0 300 160" style={st}>
      <polygon points={`20,140 ${20 + c.b * s},140 20,${140 - c.a * s}`} fill="#eef6ff" stroke={K} strokeWidth="2" /><T x={20 + c.b * s / 2} y="156">{c.b}</T><T x="10" y={140 - c.a * s / 2}>{c.a}</T>
      <polygon points={`130,140 ${130 + c.b * s * k / 1.6},140 130,${140 - c.a * s * k / 1.6}`} fill="#fdf3dc" stroke={K} strokeWidth="2" /><T x={130 + c.b * s * k / 3.2} y="156" fill={QIZ}>x</T><T x="118" y={140 - c.a * s * k / 3.2}>{c.a * k}</T></svg>; }
    case "birlik": { const g = c.g * Math.PI / 180, X = 90 + 65 * Math.cos(g), Y = 90 - 65 * Math.sin(g);
      return <svg viewBox="0 0 180 180" style={{ ...st, maxWidth: 220 }}><line x1="10" y1="90" x2="170" y2="90" stroke={K} /><line x1="90" y1="10" x2="90" y2="170" stroke={K} />
        <circle cx="90" cy="90" r="65" fill="none" stroke={KOK} strokeWidth="2" /><line x1="90" y1="90" x2={X} y2={Y} stroke={K} strokeWidth="2.5" /><line x1={X} y1={Y} x2={X} y2="90" stroke={QIZ} strokeDasharray="4 3" strokeWidth="2" />
        <circle cx={X} cy={Y} r="5" fill={QIZ} /><T x="112" y="84" fontSize="12">{c.g}°</T></svg>; }
    case "girdirak": return <svg viewBox="0 0 180 180" style={{ ...st, maxWidth: 220 }}>{Array.from({ length: c.n }, (_, i) => <g key={i}>{sektor(i * 360 / c.n, (i + 1) * 360 / c.n, i < c.k ? SAR : ["#e3eaf2", "#cfdbe8"][i % 2])}</g>)}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={K} strokeWidth="3" /><line x1={CX} y1={CY} x2={CX + 10} y2={CY - 55} stroke={QIZ} strokeWidth="4" strokeLinecap="round" /><circle cx={CX} cy={CY} r="6" fill={K} /></svg>;
    case "zinapoya": return <svg viewBox="0 0 260 150" style={st}>{[0, 1, 2].map((u) => <g key={u}>{Array.from({ length: c.a + u * c.d }, (_, k) => <rect key={k} x={20 + u * 60} y={130 - (k + 1) * 14} width="30" height="13" fill={[KOK, SAR, YASH][u]} />)}
      <T x={35 + u * 60} y="146" fontSize="12">{u + 1}</T></g>)}<T x="215" y="100" fontSize="22" fill={QIZ}>?</T><T x="215" y="146" fontSize="12">4</T></svg>;
    default: return null;
  }
}
