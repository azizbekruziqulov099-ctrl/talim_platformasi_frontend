import React from "react";
import RobotKabu from "./RobotKabu.jsx";
import "./kidStage.css";

// REV153: kod bilan chizilgan nota, qarsak va to'lqin SVG belgilari olib tashlandi — Kabu o'zi (chizilgan pozada) ko'rsatadi.

/**
 * REV98: bog'cha darsi sahnasi — yozuvsiz. Robot Kabu gapiradi, rasmlar jonlanadi, harakat belgilari ko'rsatadi.
 * pictures: [{ src, key, svg }] — bosilsa onTap(i) (so'zni aytadi, robot quvonadi).
 */
export default function KidStage({ mood = "", celebrate = 0, pictures = [], actions = [], onTap, speaking = false, compact = false }) {
  const pointing = actions.includes("point") && pictures.length > 0;
  return <div className={`ks-stage ${pictures.length ? "has-pics" : "no-pics"} ${compact ? "is-compact" : ""}`}>
    <div className={`ks-robot ${speaking ? "is-speaking" : ""}`}>
      <RobotKabu mood={actions.includes("clap") && !speaking ? `${mood} clap` : pointing && !speaking ? `${mood} point` : mood} celebrate={celebrate} />
    </div>
    {pictures.length > 0 && <div className={`ks-pics ks-n${Math.min(pictures.length, 3)}`}>
      {pictures.map((p, i) => <button key={`${p.src}-${p.rev || 0}`} type="button" className={`ks-pic ${p.svg ? "is-svg" : "is-photo"} ${pointing ? "is-point" : ""}`}
        style={{ "--i": i }} onClick={() => onTap?.(i)} aria-label={p.label || "rasm"}>
        <img src={p.src} alt="" draggable="false" />
        {pointing && <span className="ks-tap" aria-hidden="true"><i /><i /></span>}
      </button>)}
    </div>}
  </div>;
}
