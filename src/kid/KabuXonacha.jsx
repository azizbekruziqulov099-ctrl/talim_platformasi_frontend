import React from "react";
import RobotKabu from "./RobotKabu.jsx";
import { flagSrc } from "./flags.js";
import "./kabuXonacha.css";

// REV180: til → bayroq kodi va ikkinchi Kabuning rangi (bayroq ranglariga yaqin)
export const TIL_BAYROQ = { uz: "UZ", ru: "RU", en: "GB", de: "DE", fr: "FR", es: "ES", tr: "TR", ar: "SA", zh: "CN", ja: "JP", ko: "KR" };
const TIL_RANG = { de: "hue-rotate(-150deg) saturate(1.35)", en: "hue-rotate(150deg) saturate(1.2)", ru: "hue-rotate(40deg) saturate(1.2)", fr: "hue-rotate(50deg)",
  es: "hue-rotate(-140deg) saturate(1.5)", tr: "hue-rotate(-170deg) saturate(1.6)", ar: "hue-rotate(-40deg)", zh: "hue-rotate(-165deg) saturate(1.7)",
  ja: "hue-rotate(-180deg) saturate(1.3)", ko: "hue-rotate(60deg)" };

function Bayroq({ til }) {
  const src = flagSrc(TIL_BAYROQ[til] || "");
  return src ? <img className="kx-bayroq" src={src} alt="" draggable="false" /> : null;
}
function Robot({ til, faol, gapir, mood, celebrate, onTap, nom }) {
  return <button type="button" className={`kx-robot ${faol ? "is-faol" : ""} ${gapir && !faol ? "is-jim" : ""}`} onClick={onTap} aria-label={nom}
    style={TIL_RANG[til] && nom !== "iz" ? { "--kx-rang": TIL_RANG[til] } : undefined}>
    <span className="kx-nom"><Bayroq til={til} /></span>
    <div className="kabu-float"><div className="kabu-hop"><RobotKabu mood={faol ? `talk ${mood === "wave" ? "wave" : ""}` : mood} celebrate={celebrate} /></div></div>
    <span className="kabu-shadow" aria-hidden="true" />
  </button>;
}

/**
 * REV177: maktabda mashq, test, repetitor va darsdan oldingi takrorni robot Kabu o'tkazadi.
 * REV180: juft — ikki Kabu: chapda tushuntiruvchi (izoh tili bayrog'i), o'ngda o'rganilayotgan til egasi (o'sha til bayrog'i va rangi).
 *   kim — hozir kim gapiryapti ("iz" | "til" | null): gapirayotgani kattalashadi va yorqin, ikkinchisi biroz xiralashadi.
 * doska — kichik doskadagi matn; gapir — ovoz chiqyapti; mood — happy | enc | think | wave.
 */
export default function KabuXonacha({ doska = "", gapir = false, mood = "", celebrate = 0, onTap, className = "", juft = null, kim = null }) {
  if (!juft) {
    const m = gapir ? `talk ${mood === "wave" ? "wave" : ""}` : mood;
    return <div className={`kx-root ${gapir ? "is-gapir" : ""} ${className}`}>
      <button type="button" className="kx-robot" onClick={onTap} aria-label="Kabu">
        <div className="kabu-float"><div className="kabu-hop"><RobotKabu mood={m} celebrate={celebrate} /></div></div>
        <span className="kabu-shadow" aria-hidden="true" />
      </button>
      {doska ? <div className="kx-doska" dir="auto">{doska}</div> : null}
    </div>;
  }
  const faol = gapir ? kim : null;
  return <div className={`kx-root is-juft ${gapir ? "is-gapir" : ""} ${className}`}>
    <Robot nom="iz" til={juft.iz} faol={faol === "iz"} gapir={gapir} mood={mood} celebrate={celebrate} onTap={onTap} />
    {doska ? <div className="kx-doska" dir="auto">{doska}</div> : null}
    <Robot nom="til" til={juft.til} faol={faol === "til"} gapir={gapir} mood={mood} celebrate={celebrate} onTap={onTap} />
  </div>;
}
