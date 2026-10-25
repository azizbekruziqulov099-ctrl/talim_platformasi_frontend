import React from "react";
import RobotKabu from "./RobotKabu.jsx";
import "./kabuXonacha.css";

/**
 * REV177: maktabda mashq, test, repetitor va darsdan oldingi takrorni robot Kabu o'tkazadi (bolalar darsidagidek):
 * jonli ustoz yangi mavzuni tushuntiradi, Kabu esa so'raydi, aytdiradi, yozdiradi, yodlatadi.
 * doska — Kabu yonidagi kichik doskada yoziladigan matn; gapir — Kabu hozir gapiryaptimi; mood — happy | enc | think | wave.
 */
export default function KabuXonacha({ doska = "", gapir = false, mood = "", celebrate = 0, onTap, className = "" }) {
  const m = gapir ? `talk ${mood === "wave" ? "wave" : ""}` : mood;
  return <div className={`kx-root ${gapir ? "is-gapir" : ""} ${className}`}>
    <button type="button" className="kx-robot" onClick={onTap} aria-label="Kabu">
      <div className="kabu-float"><div className="kabu-hop"><RobotKabu mood={m} celebrate={celebrate} /></div></div>
      <span className="kabu-shadow" aria-hidden="true" />
    </button>
    {doska ? <div className="kx-doska" dir="auto">{doska}</div> : null}
  </div>;
}
