import React from "react";
import { MAKTAB_RASM } from "./rasmlar.js";
import { RASM_HAMMA } from "../kid/darsRasm.js";
import { CHIZILGAN } from "./chizilgan.js";

// REV172: maktab so'z rasmi — MaktabTil va Repetitor uchun umumiy.
export const RANGLAR = { red: "#E53935", blue: "#1E63D6", green: "#2EA44F", yellow: "#FFD21F", pink: "#FF7EB6", purple: "#8E44C9", black: "#222", white: "#FFFFFF", orangec: "#FB8C00", brown: "#8D5A33" };

export default function Rasm({ w, className = "" }) {
  if (RANGLAR[w.id]) return <span className={`${className} mk-rang`} style={{ "--rang": RANGLAR[w.id] }} aria-hidden="true" />;
  // REV169: avval rassom chizgan rasm, keyin 3D rasm (eski tekis va xira rasmlar ko'rinmasin)
  const src = RASM_HAMMA[CHIZILGAN[w.id]] || (w.rasm && MAKTAB_RASM[w.rasm]) || (w.bogcha && RASM_HAMMA[w.id]);
  if (src) return <img className={className} src={src} alt="" draggable="false" loading="lazy" />;
  return <span className={`${className} is-emoji`} aria-hidden="true">{w.emoji || "⭐"}</span>;
}
