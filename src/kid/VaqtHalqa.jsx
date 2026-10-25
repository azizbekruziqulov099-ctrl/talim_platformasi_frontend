import React from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";
import "./vaqtHalqa.css";

/** REV172: yoshga mos vaqt ko'rinishi.
 *  kichik (bog'cha) — raqamsiz halqa: quyosh to'la → oy (vaqt tugayapti); orta (6–7 yosh, 1–4 sinf) — halqa + «N daq»;
 *  katta (5–11 sinf, kattalar) — soat ko'rinishi «1:15». qoldi — daqiqa, jami — to'liq oraliq (daqiqa). */
export function vaqtDarajasi({ sinf = 0, yosh = "" } = {}) {
  if (sinf) return sinf <= 4 ? "orta" : "katta";
  return yosh === "katta" ? "orta" : "kichik";
}
export const soatMatni = (daq) => { const m = Math.max(0, Math.round(Number(daq) || 0)); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`; };
export const halqaBelgi = (ulush) => (ulush > 0.5 ? "🌞" : ulush > 0.2 ? "⛅" : "🌙");

export default function VaqtHalqa({ qoldi = 0, jami = 60, daraja = "orta", ogoh = false, className = "" }) {
  const ulush = Math.max(0, Math.min(1, (Number(qoldi) || 0) / Math.max(1, jami)));
  const r = 15, C = 2 * Math.PI * r;
  const label = `${T("Bugun qolgan vaqt")}: ${qoldi} ${T("daq.")}`;
  if (daraja === "katta") {
    return <span className={`vq-root is-katta ${ogoh ? "is-ogoh" : ""} ${className}`} title={label} aria-label={label} role="timer">⏳ {soatMatni(qoldi)}</span>;
  }
  return <span className={`vq-root is-${daraja} ${ogoh || ulush <= 0.2 ? "is-ogoh" : ""} ${className}`} title={label} aria-label={label} role="timer">
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r={r} className="vq-fon" />
      <circle cx="18" cy="18" r={r} className="vq-qism" strokeDasharray={`${C * ulush} ${C}`} transform="rotate(-90 18 18)" />
      <text x="18" y="19" textAnchor="middle" dominantBaseline="middle" fontSize="14">{halqaBelgi(ulush)}</text>
    </svg>
    {daraja === "orta" && <b>{qoldi} {T("daq.")}</b>}
  </span>;
}
