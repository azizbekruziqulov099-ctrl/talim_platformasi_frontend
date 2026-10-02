import React, { useEffect, useRef } from "react";
import { KABU_MARKUP } from "./robotKabuMarkup.js";
import "./robotKabu.css";

const MOODS = ["is-talk", "is-wave", "is-think", "is-happy", "is-enc"];

/** REV98: Robot ustoz Kabu. mood: "talk", "wave talk", "think", "happy", "enc" …; celebrate — har oshganda sakraydi va yulduzlar sochiladi. */
export default function RobotKabu({ mood = "", celebrate = 0, className = "" }) {
  const box = useRef(null);
  useEffect(() => {
    const bot = box.current?.querySelector(".kbot");
    if (!bot) return;
    const want = new Set(String(mood).split(/\s+/).filter(Boolean).map((m) => `is-${m}`));
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
  return <div ref={box} className={`kabu-box ${className}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: KABU_MARKUP }} />;
}
