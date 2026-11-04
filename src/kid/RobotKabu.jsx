import React, { useEffect, useRef } from "react";
import { kabuMarkup, kabuTuri } from "./kabuMillat.js";   // KABU_MARKUP — har til uchun rangi almashtirilgan nusxa
import "./robotKabu.css";
import { kabuAylan } from "./kabuAylan.js";   // REV331: aylanish

const MOODS = ["is-talk", "is-wave", "is-think", "is-happy", "is-enc"];

/** REV156: jonli (SVG, harakatlanadigan) Kabu qaytarildi — rasm pozalari qotib turardi. clap/point/listen — talk ga yaqin.
 *  REV98: Robot ustoz Kabu. mood: "talk", "wave talk", "think", "happy", "enc" …; celebrate — har oshganda sakraydi va yulduzlar sochiladi. */
// REV245: til berilmasa — interfeys tili (ruscha — Голу, inglizcha — Pidgi). Test, takrorlash, vaqt nazorati — hammasida.
const interfeysTili = () => { try { return String(document.documentElement.lang || "uz").slice(0, 2); } catch { return "uz"; } };
export default function RobotKabu({ mood = "", celebrate = 0, className = "", tur, aylan = 0, aylanGradus = 360 }) {
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
  // REV331: aylan o'zgarsa — aylanadi (360° / 180° / 90°); har 3-g'alabada ham to'liq aylanadi
  useEffect(() => {
    if (!aylan || !box.current) return undefined;
    return kabuAylan(box.current.querySelector(".kbot"), { gradus: aylanGradus, ms: aylanGradus >= 360 ? 1500 : 1100 });
  }, [aylan]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!celebrate || celebrate % 3 !== 0 || !box.current) return undefined;
    return kabuAylan(box.current.querySelector(".kbot"), { gradus: 360, ms: 1500 });
  }, [celebrate]);
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
