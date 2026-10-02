import React from "react";
import RobotKabu from "./RobotKabu.jsx";
import "./kidStage.css";

/** Qo'shiq: notalar uchib chiqadi. */
function Notes() {
  return <svg className="ks-fx ks-notes" viewBox="0 0 120 120" aria-hidden="true">
    {[[18, 82, "#FF7AA2", 0], [56, 92, "#4A8BF5", 0.6], [90, 80, "#FFB703", 1.2]].map(([x, y, c, d], i) =>
      <g key={i} style={{ "--d": `${d}s` }} className="ks-note">
        <ellipse cx={x} cy={y} rx="9" ry="7" fill={c} transform={`rotate(-20 ${x} ${y})`} />
        <path d={`M${x + 8} ${y - 2} V${y - 34} q8 4 12 12`} fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" />
      </g>)}
  </svg>;
}

/** Qarsak: ikki kaft bir-biriga uriladi, uchqun chiqadi. */
function Clap() {
  return <svg className="ks-fx ks-clap" viewBox="0 0 140 100" aria-hidden="true">
    <g className="ks-palm ks-palm-l"><rect x="22" y="22" width="34" height="52" rx="16" fill="#F6CFA9" stroke="#D39B73" strokeWidth="3" />
      <rect x="44" y="40" width="20" height="12" rx="6" fill="#F6CFA9" stroke="#D39B73" strokeWidth="3" /></g>
    <g className="ks-palm ks-palm-r"><rect x="84" y="22" width="34" height="52" rx="16" fill="#F6CFA9" stroke="#D39B73" strokeWidth="3" />
      <rect x="76" y="40" width="20" height="12" rx="6" fill="#F6CFA9" stroke="#D39B73" strokeWidth="3" /></g>
    <g className="ks-spark" stroke="#FFB703" strokeWidth="4" strokeLinecap="round"><path d="M70 8v10" /><path d="M52 14l5 8" /><path d="M88 14l-5 8" /></g>
  </svg>;
}

/** Gapir / takrorla: robotdan tovush to'lqinlari. */
function Waves() {
  return <svg className="ks-fx ks-waves" viewBox="0 0 80 80" aria-hidden="true">
    {[0, 1, 2].map((i) => <path key={i} className="ks-wave" style={{ "--d": `${i * 0.35}s` }} d={`M${18 + i * 14} 18 q${16 + i * 6} 22 0 44`} fill="none" stroke="#2EC4B6" strokeWidth="6" strokeLinecap="round" />)}
  </svg>;
}

/**
 * REV98: bog'cha darsi sahnasi — yozuvsiz. Robot Kabu gapiradi, rasmlar jonlanadi, harakat belgilari ko'rsatadi.
 * pictures: [{ src, key, svg }] — bosilsa onTap(i) (so'zni aytadi, robot quvonadi).
 */
export default function KidStage({ mood = "", celebrate = 0, pictures = [], actions = [], onTap, speaking = false, compact = false }) {
  const pointing = actions.includes("point") && pictures.length > 0;
  return <div className={`ks-stage ${pictures.length ? "has-pics" : "no-pics"} ${compact ? "is-compact" : ""}`}>
    <div className={`ks-robot ${speaking ? "is-speaking" : ""}`}>
      <RobotKabu mood={mood} celebrate={celebrate} />
      {(actions.includes("say") && speaking) && <Waves />}
    </div>
    {pictures.length > 0 && <div className={`ks-pics ks-n${Math.min(pictures.length, 3)}`}>
      {pictures.map((p, i) => <button key={`${p.src}-${p.rev || 0}`} type="button" className={`ks-pic ${p.svg ? "is-svg" : "is-photo"} ${pointing ? "is-point" : ""}`}
        style={{ "--i": i }} onClick={() => onTap?.(i)} aria-label={p.label || "rasm"}>
        <img src={p.src} alt="" draggable="false" />
        {pointing && <span className="ks-tap" aria-hidden="true"><i /><i /></span>}
      </button>)}
    </div>}
    {actions.includes("song") && <Notes />}
    {actions.includes("clap") && <Clap />}
  </div>;
}
