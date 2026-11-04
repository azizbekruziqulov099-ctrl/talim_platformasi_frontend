import React, { useMemo } from "react";
import "./bayram.css";

/** REV323: sinfxona bayram bezagi — bosilmaydigan (pointer-events: none) jonli qatlam: tepada gulchambar, chetlarda
 *  bayram narsalari, havoda qor / qaldirg'ochlar / sharlar / salyut. Doskaning o'rtasi ochiq qoladi. */
const UZ_BAYROQ = ["#1EB5E8", "#FFFFFF", "#1EB53A"];
const RANG = {
  yangi_yil: ["#E63946", "#FFD166", "#2EC4B6", "#4A8BF5", "#FF7AA2"],
  navroz: ["#FF7AA2", "#FFD166", "#7BD389", "#9B7BFF", "#FF9F45"],
  mustaqillik: UZ_BAYROQ,
  bilim: ["#4A8BF5", "#FFD166", "#FF7AA2", "#2EC4B6", "#9B7BFF"],
  ustozlar: ["#9B7BFF", "#FFD166", "#FF7AA2", "#2EC4B6", "#4A8BF5"],
  mart8: ["#FF7AA2", "#FFD1E0", "#FFD166", "#E63946", "#FFFFFF"],
  bolalar: ["#FF7AA2", "#FFD166", "#2EC4B6", "#4A8BF5", "#9B7BFF"],
  tugilgan: ["#FF7AA2", "#FFD166", "#2EC4B6", "#4A8BF5", "#9B7BFF"],
};

function Gulchambar({ ranglar, chiroq = false, bayroq = false }) {
  // ikki egilgan ip va ustida bayroqchalar yoki chiroqlar
  const items = [];
  const nuqta = (t, x0, x1) => { const x = x0 + (x1 - x0) * t; const y = 12 + Math.sin(Math.PI * t) * 46; return [x, y]; };
  [[0, 500], [500, 1000]].forEach(([a, b], s) => {
    for (let i = 1; i < 10; i++) {
      const [x, y] = nuqta(i / 10, a, b); const r = ranglar[(i + s * 3) % ranglar.length];
      if (chiroq) items.push(<g key={`${s}-${i}`} className="bz-chiroq" style={{ "--d": `${(i * 0.37 + s * 0.2) % 1.6}s` }}>
        <rect x={x - 5} y={y - 3} width="10" height="10" rx="2" fill="#5B6470" /><ellipse cx={x} cy={y + 20} rx="12" ry="16" fill={r} /><ellipse cx={x - 4} cy={y + 14} rx="3" ry="5" fill="#fff" opacity=".55" /></g>);
      else if (bayroq) items.push(<g key={`${s}-${i}`} className="bz-bayroqcha" style={{ "--d": `${(i * 0.21) % 1.2}s`, transformOrigin: `${x}px ${y}px` }}>
        <rect x={x - 20} y={y} width="40" height="10" fill={UZ_BAYROQ[0]} /><rect x={x - 20} y={y + 10} width="40" height="2" fill="#E63946" />
        <rect x={x - 20} y={y + 12} width="40" height="10" fill="#fff" /><rect x={x - 20} y={y + 22} width="40" height="2" fill="#E63946" />
        <rect x={x - 20} y={y + 24} width="40" height="10" fill={UZ_BAYROQ[2]} /></g>);
      else items.push(<path key={`${s}-${i}`} className="bz-bayroqcha" style={{ "--d": `${(i * 0.21) % 1.2}s`, transformOrigin: `${x}px ${y}px` }}
        d={`M${x - 20},${y} L${x + 20},${y} L${x},${y + 44} Z`} fill={r} stroke="rgba(0,0,0,.1)" />);
    }
  });
  return <svg className="bz-gulchambar" viewBox="0 0 1000 130" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0,12 Q250,104 500,12 Q750,104 1000,12" fill="none" stroke="#7A6A55" strokeWidth="3.5" />{items}</svg>;
}

function Qor({ n = 22 }) {
  const f = useMemo(() => Array.from({ length: n }, (_, i) => ({ x: (i * 47) % 100, s: 6 + (i * 7) % 10, d: (i * 0.61) % 7, t: 7 + (i * 1.3) % 6 })), [n]);
  return <div className="bz-qor" aria-hidden="true">{f.map((q, i) => <i key={i} style={{ left: `${q.x}%`, width: q.s, height: q.s, animationDelay: `-${q.d}s`, animationDuration: `${q.t}s` }} />)}</div>;
}

function Archa() {
  const shar = [[52, 70, "#E63946"], [78, 92, "#FFD166"], [40, 112, "#4A8BF5"], [92, 128, "#FF7AA2"], [60, 140, "#2EC4B6"], [30, 150, "#FFD166"], [100, 156, "#E63946"]];
  return <svg className="bz-burchak bz-chap" viewBox="0 0 140 200" aria-hidden="true">
    <rect x="60" y="168" width="20" height="22" rx="3" fill="#8B5A2B" />
    <path d="M70,20 L112,86 L94,86 L124,132 L102,132 L134,172 L6,172 L38,132 L16,132 L46,86 L28,86 Z" fill="#2E9E5B" stroke="#1F7A44" strokeWidth="3" strokeLinejoin="round" />
    <path d="M40,96 Q70,110 100,96 M30,142 Q70,158 112,142" fill="none" stroke="#FFD166" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
    {shar.map(([x, y, c], i) => <circle key={i} className="bz-shar" style={{ "--d": `${i * 0.33}s` }} cx={x} cy={y} r="6.5" fill={c} stroke="#fff" strokeWidth="1.5" />)}
    <path className="bz-yulduz" d="M70,4 L75,15 L87,15 L77,22 L81,34 L70,27 L59,34 L63,22 L53,15 L65,15 Z" fill="#FFD166" stroke="#E39A00" strokeWidth="1.5" />
    <rect x="8" y="176" width="30" height="20" rx="3" fill="#E63946" /><rect x="20" y="176" width="6" height="20" fill="#FFD166" />
    <rect x="102" y="180" width="28" height="16" rx="3" fill="#4A8BF5" /><rect x="112" y="180" width="6" height="16" fill="#fff" />
  </svg>;
}

function Lolalar({ ranglar }) {
  return <svg className="bz-pastki" viewBox="0 0 1000 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    {Array.from({ length: 14 }, (_, i) => { const x = 20 + i * 70 + (i % 2) * 12; const c = ranglar[i % ranglar.length]; const h = 62 + (i % 3) * 14;
      return <g key={i} className="bz-lola" style={{ "--d": `${(i * 0.4) % 2.4}s`, transformOrigin: `${x}px 120px` }}>
        <path d={`M${x},120 Q${x - 3},${120 - h / 2} ${x},${120 - h}`} stroke="#3E9B4F" strokeWidth="5" fill="none" />
        <path d={`M${x},${120 - h / 2.4} Q${x - 24},${120 - h / 1.6} ${x - 8},${120 - h / 1.15}`} fill="#57B867" />
        <path d={`M${x - 16},${120 - h} Q${x - 17},${120 - h - 28} ${x - 6},${120 - h - 31} L${x},${120 - h - 20} L${x + 6},${120 - h - 31} Q${x + 17},${120 - h - 28} ${x + 16},${120 - h} Q${x},${120 - h + 11} ${x - 16},${120 - h} Z`} fill={c} />
      </g>; })}
  </svg>;
}

function Sumalak() {
  return <svg className="bz-burchak bz-ong" viewBox="0 0 160 140" aria-hidden="true">
    {[0, 1, 2].map((i) => <path key={i} className="bz-bug" style={{ "--d": `${i * 0.9}s` }} d={`M${62 + i * 16},48 Q${54 + i * 16},34 ${64 + i * 16},22 Q${74 + i * 16},10 ${66 + i * 16},0`} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".75" />)}
    <ellipse cx="80" cy="58" rx="62" ry="12" fill="#6B3E1F" />
    <path d="M20,58 Q22,118 80,122 Q138,118 140,58 Z" fill="#3A3A3A" stroke="#222" strokeWidth="3" />
    <ellipse cx="80" cy="58" rx="56" ry="9" fill="#7A3E12" />
    <path d="M14,60 Q6,70 18,74 M146,60 Q154,70 142,74" stroke="#222" strokeWidth="5" fill="none" strokeLinecap="round" />
    <rect x="24" y="122" width="112" height="12" rx="4" fill="#C0392B" />
    {[34, 56, 78, 100, 122].map((x, i) => <path key={i} d={`M${x},122 L${x + 6},134 L${x + 12},122`} fill="#FF9F45" />)}
  </svg>;
}

function Qaldirgoch({ n = 3 }) {
  return <div className="bz-qushlar" aria-hidden="true">{Array.from({ length: n }, (_, i) => <svg key={i} className="bz-qush" style={{ "--d": `${i * 3.3}s`, "--y": `${8 + i * 9}%` }} viewBox="0 0 60 30">
    <path d="M2,14 Q16,2 30,14 Q44,2 58,14 Q44,10 34,18 L30,28 L26,18 Q16,10 2,14 Z" fill="#23305A" /><circle cx="30" cy="16" r="3" fill="#E63946" /></svg>)}</div>;
}

function Salyut() {
  return <div className="bz-salyut" aria-hidden="true">{[["12%", "14%", "#FFD166", 0], ["84%", "10%", "#1EB5E8", 1.1], ["50%", "6%", "#1EB53A", 2.2], ["28%", "20%", "#FF7AA2", 3.1]].map(([x, y, c, d], i) =>
    <div key={i} className="bz-portlash" style={{ left: x, top: y, "--c": c, "--d": `${d}s` }}>{Array.from({ length: 12 }, (_, k) => <i key={k} style={{ transform: `rotate(${k * 30}deg)` }} />)}</div>)}</div>;
}

function Sharlar({ ranglar, n = 7 }) {
  return <div className="bz-sharlar" aria-hidden="true">{Array.from({ length: n }, (_, i) => <svg key={i} className="bz-havoshar" viewBox="0 0 40 90"
    style={{ left: `${4 + i * 13.5}%`, "--d": `${i * 1.7}s`, "--t": `${11 + (i % 3) * 3}s` }}>
    <path d="M20,52 Q16,70 22,88" stroke="#888" strokeWidth="1.2" fill="none" />
    <ellipse cx="20" cy="26" rx="17" ry="22" fill={ranglar[i % ranglar.length]} /><ellipse cx="13" cy="17" rx="4" ry="6" fill="#fff" opacity=".45" />
    <path d="M17,48 L23,48 L20,53 Z" fill={ranglar[i % ranglar.length]} /></svg>)}</div>;
}

function Qongiroq() {
  return <svg className="bz-burchak bz-ong" viewBox="0 0 150 150" aria-hidden="true">
    <rect x="10" y="118" width="90" height="12" rx="3" fill="#4A8BF5" /><rect x="16" y="104" width="80" height="14" rx="3" fill="#E63946" /><rect x="6" y="130" width="98" height="12" rx="3" fill="#2EC4B6" />
    <g className="bz-qongiroq"><path d="M112,30 Q112,20 120,20 Q128,20 128,30" fill="none" stroke="#B8860B" strokeWidth="4" />
      <path d="M100,78 Q102,38 120,32 Q138,38 140,78 Q146,84 140,86 L100,86 Q94,84 100,78 Z" fill="#FFD166" stroke="#E39A00" strokeWidth="3" />
      <circle cx="120" cy="92" r="6" fill="#E39A00" /><path d="M118,64 Q112,70 116,78" stroke="#fff" strokeWidth="3" fill="none" opacity=".6" strokeLinecap="round" /></g>
  </svg>;
}

function Yuraklar() {
  return <div className="bz-yuraklar" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <svg key={i} className="bz-yurak" viewBox="0 0 40 36" style={{ left: `${6 + i * 16}%`, "--d": `${i * 1.4}s` }}>
    <path d="M20,34 C8,25 2,18 2,11 C2,5 7,2 11,2 C15,2 18,5 20,8 C22,5 25,2 29,2 C33,2 38,5 38,11 C38,18 32,25 20,34 Z" fill="#FF7AA2" /></svg>)}</div>;
}

export default function BayramBezak({ bayram }) {
  if (!bayram) return null;
  const r = RANG[bayram] || RANG.bolalar;
  return <div className={`bz-qatlam bz-${bayram}`} aria-hidden="true">
    <Gulchambar ranglar={r} chiroq={bayram === "yangi_yil"} bayroq={bayram === "mustaqillik"} />
    {bayram === "yangi_yil" && <><Qor /><Archa /></>}
    {bayram === "navroz" && <><Lolalar ranglar={r} /><Sumalak /><Qaldirgoch /></>}
    {bayram === "mustaqillik" && <><Salyut /><Sharlar ranglar={["#1EB5E8", "#FFFFFF", "#1EB53A"]} n={5} /></>}
    {(bayram === "bilim" || bayram === "ustozlar") && <><Qongiroq /><Lolalar ranglar={r} /></>}
    {bayram === "mart8" && <><Lolalar ranglar={r} /><Yuraklar /></>}
    {(bayram === "bolalar" || bayram === "tugilgan") && <Sharlar ranglar={r} />}
  </div>;
}
