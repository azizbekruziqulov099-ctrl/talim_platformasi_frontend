import React from "react";
import RobotKabu from "./RobotKabu.jsx";
import { flagSrc } from "./flags.js";
import { TIL_BAYROQ } from "./KabuXonacha.jsx";
import "./kidStage.css";

// REV153: kod bilan chizilgan nota, qarsak va to'lqin SVG belgilari olib tashlandi — Kabu o'zi (chizilgan pozada) ko'rsatadi.

/**
 * REV98: bog'cha darsi sahnasi — yozuvsiz. Robot Kabu gapiradi, rasmlar jonlanadi, harakat belgilari ko'rsatadi.
 * pictures: [{ src, key, svg }] — bosilsa onTap(i) (so'zni aytadi, robot quvonadi).
 */
export default function KidStage({ mood = "", celebrate = 0, pictures = [], actions = [], onTap, speaking = false, compact = false, bayroq = "" }) {
  const pointing = actions.includes("point") && pictures.length > 0;
  return <div className={`ks-stage ${pictures.length ? "has-pics" : "no-pics"} ${compact ? "is-compact" : ""}`}>
    <div className={`ks-robot ${speaking ? "is-speaking" : ""}`}>
      <RobotKabu mood={actions.includes("clap") && !speaking ? `${mood} clap` : pointing && !speaking ? `${mood} point` : mood} celebrate={celebrate} />
      {/* REV181: ikki Kabu — til bayrog'i ko'krakdagi nishon */}
      {bayroq && <img className="ks-bayroq" src={bayroq} alt="" draggable="false" />}
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

/**
 * REV181: ikki Kabu (bog'cha: «Kabu aytdirish» va test) — chapda izoh tili Kabusi, o'ngda o'rganilayotgan til Kabusi.
 * juft = { iz, til, kim }: kim gapirsa o'sha kattalashadi va gapiradi, ikkinchisi xira va jim; ikkalasi bir-biriga qaraydi,
 * harakatlari bir vaqtda emas; bayroq — ko'krakdagi nishon.
 */
export function KabuJuft({ juft, mood = "", celebrate = 0 }) {
  const kim = juft?.kim || null;
  const bir = (rol) => {
    const faol = kim === rol, jim = Boolean(kim) && !faol;
    return <div className={`kj-robot dx-juft-kabu is-${rol} til-${juft[rol]} ${faol ? "is-faol" : ""} ${jim ? "is-jim" : ""}`}>
      <KidStage compact mood={faol ? "talk" : jim ? "" : mood} celebrate={celebrate} speaking={faol} bayroq={flagSrc(TIL_BAYROQ[juft[rol]] || "")} />
    </div>;
  };
  return <div className="kj-root">{bir("iz")}{bir("til")}</div>;
}
