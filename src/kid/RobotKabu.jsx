import React, { useEffect, useRef } from "react";
import { JR, kabuRasm } from "./jonli/jonliRasm.js";
import "./robotKabu.css";

/** REV153: holat → rassom chizgan Kabu pozasi (kod bilan chizilgan SVG robot o'rniga). */
export function kabuPoza(mood = "") {
  const m = new Set(String(mood).split(/\s+/).filter(Boolean));
  if (m.has("happy")) return "hurra";
  if (m.has("enc")) return "zor";
  if (m.has("clap")) return "qarsak";
  if (m.has("think")) return "oylaydi";
  if (m.has("listen")) return "tingla";
  if (m.has("point")) return "korsat";
  if (m.has("wave")) return "salom";
  if (m.has("talk")) return "gapiradi";
  return "salom";
}

/** Kabu (bolalar darsi, test va vaqt ekranlari). mood: "talk", "wave talk", "think", "happy", "enc" …;
 *  celebrate — har oshganda sakraydi va yulduzlar sochiladi. */
export default function RobotKabu({ mood = "", celebrate = 0, className = "" }) {
  const box = useRef(null);
  useEffect(() => {
    if (!celebrate || !box.current) return;
    for (const [sel, cls] of [[".kabu-hop", "hop"], [".kabu-yulduz", "go"]]) {
      const el = box.current.querySelector(sel);
      if (!el) continue;
      el.classList.remove(cls);
      void el.offsetWidth;   // animatsiya boshidan
      el.classList.add(cls);
    }
  }, [celebrate]);
  const talk = String(mood).split(/\s+/).includes("talk");
  return <div ref={box} className={`kabu-box kabu-rasm ${talk ? "is-talk" : ""} ${className}`} aria-hidden="true">
    <div className="kabu-hop"><img key={kabuPoza(mood)} className="kabu-img" src={kabuRasm(kabuPoza(mood))} alt="" draggable="false" /></div>
    <span className="kabu-yulduz">{[0, 1, 2, 3, 4].map((i) => <img key={i} src={JR.yulduz} alt="" style={{ "--i": i }} />)}</span>
  </div>;
}
