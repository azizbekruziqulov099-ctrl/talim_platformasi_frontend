import React, { useEffect, useRef } from "react";
import { kabuMarkup, kabuTuri } from "./kabuMillat.js";   // KABU_MARKUP — har til uchun rangi almashtirilgan nusxa
import "./robotKabu.css";

const MOODS = ["is-talk", "is-wave", "is-think", "is-happy", "is-enc"];

/** REV156: jonli (SVG, harakatlanadigan) Kabu qaytarildi — rasm pozalari qotib turardi. clap/point/listen — talk ga yaqin.
 *  REV98: Robot ustoz Kabu. mood: "talk", "wave talk", "think", "happy", "enc" …; celebrate — har oshganda sakraydi va yulduzlar sochiladi. */
// REV245: til berilmasa — interfeys tili (ruscha — Голу, inglizcha — Pidgi). Test, takrorlash, vaqt nazorati — hammasida.
const interfeysTili = () => { try { return String(document.documentElement.lang || "uz").slice(0, 2); } catch { return "uz"; } };
export default function RobotKabu({ mood = "", celebrate = 0, className = "", tur }) {
  tur = tur || interfeysTili();
  const box = useRef(null);
  useEffect(() => {
    const bot = box.current?.querySelector(".kbot");
    if (!bot) return;
    const ALIAS = { clap: "happy", point: "talk", listen: "think", ask: "wave", cheer: "enc" };
    const want = new Set(String(mood).split(/\s+/).filter(Boolean).map((m) => `is-${ALIAS[m] || m}`));
    MOODS.forEach((c) => bot.classList.toggle(c, want.has(c)));
    box.current.querySelector(".kabu-think")?.classList.toggle("on", want.has("is-think"));
  }, [mood]);
  useEffect(() => {
    if (!celebrate || !box.current) return;
    for (const [sel, cls] of [[".kabu-hop", "hop"], [".kabu-burst", "go"]]) {
      const el = box.current.querySelector(sel);
      if (!el) continue;
      el.classList.remove(cls);
      void el.offsetWidth;   // animatsiya boshidan
      el.classList.add(cls);
    }
  }, [celebrate]);
  return <div ref={box} className={`kabu-box kabu-${kabuTuri(tur)} ${className}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: kabuMarkup(tur) }} />;
}
