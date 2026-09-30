import React from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { splitSpeechText, stripSpeechTags } from "./language.js";

/**
 * REV89: bolalar tinglab o'rganadi — matndagi chet til bo'laklari ekranda yozilmaydi, o'rniga 🔊 tugmasi.
 * Chet til bo'lagi bo'lmasa (matematika, atrof-muhit) — oddiy matn.
 */
export default function ListenText({ text, speak }) {
  const parts = splitSpeechText(String(text || ""));
  if (!parts.some((p) => p.til !== "uz")) return <>{stripSpeechTags(text)}</>;
  // Savol butunlay chet tilida (6–7 yosh) — ekranda faqat «tingla» belgisi; yonidagi 🔊 tugmasi savolni qayta o'qiydi.
  if (parts.every((p) => p.til !== "uz" || !p.matn.trim())) return <span className="lt-only" aria-label={__kbUi("Tingla")}>🎧</span>;
  return <>{parts.map((p, i) => (p.til === "uz"
    ? <span key={i}>{p.matn} </span>
    : <button key={i} type="button" className="lt-hear" onClick={(e) => { e.stopPropagation(); speak?.(`[${p.til}]${p.matn}[/${p.til}]`); }}
      aria-label={__kbUi("Eshitish")}>🔊</button>))}</>;
}
