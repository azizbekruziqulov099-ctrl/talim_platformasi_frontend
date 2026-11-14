// REV565: «Virtual doska» — birlik aylana. Burchakni sirpanuvchi bilan o'zgartiring: nuqta aylanadi, sin, cos va tg ko'rinadi,
// pastda sin va cos grafigida belgi yuradi. 30°, 45°, 60° ning ko'paytmalarida ANIQ qiymat (√3/2 kabi) ham yoziladi.
import React, { useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { aniqQiymat, birlikAylana, radianMatni, sonMatni } from "./grafikRules.js";

const TEZ = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
export default function BirlikAylana({ burchak = 30 }) {
  const [g, setG] = useState(burchak); const q = birlikAylana(g); const a = aniqQiymat(g);
  const cx = 110, cy = 105, R = 80; const px = cx + R * q.cos, py = cy - R * q.sin;
  const yoy = []; const n = Math.max(2, Math.round(g / 4)); for (let i = 0; i <= n; i += 1) { const r = ((g * i) / n * Math.PI) / 180; yoy.push(`${(cx + 22 * Math.cos(r)).toFixed(1)},${(cy - 22 * Math.sin(r)).toFixed(1)}`); }
  const gx = (d) => 12 + (d / 360) * 316; const gy = (v) => 392 - 14 - v * 38;       // grafik: y=0 → 378; ±1 → ±38
  const yol = (fn) => Array.from({ length: 91 }, (_, i) => `${gx(i * 4).toFixed(1)},${gy(fn((i * 4 * Math.PI) / 180)).toFixed(1)}`).join(" L");
  return <div className="fd-root">
    <svg viewBox="0 0 340 322" className="fd-svg fd-aylana" role="img" aria-label={__kbUi("Birlik aylana")}>
      <circle cx={cx} cy={cy} r={R} className="fd-halqa" /><line x1={cx - R - 12} x2={cx + R + 12} y1={cy} y2={cy} className="fd-o" /><line x1={cx} x2={cx} y1={cy - R - 12} y2={cy + R + 12} className="fd-o" />
      <text x={cx + R + 6} y={cy - 4} className="fd-t">1</text><text x={cx - R - 14} y={cy - 4} className="fd-t">−1</text><text x={cx + 4} y={cy - R - 3} className="fd-t">1</text><text x={cx + 4} y={cy + R + 11} className="fd-t">−1</text>
      <polyline points={yoy.join(" ")} className="fd-yoy" /><line x1={cx} y1={cy} x2={px} y2={py} className="fd-radius" />
      <line x1={px} y1={py} x2={px} y2={cy} className="fd-sin-chiziq" /><line x1={px} y1={cy} x2={cx} y2={cy} className="fd-cos-chiziq" /><circle cx={px} cy={py} r="5" className="fd-nuqta" />
      <text x="212" y="40" className="fd-yozuv">{g}° = {radianMatni(g)} rad</text>
      <text x="212" y="64" className="fd-sin-m">sin = {sonMatni(q.sin)}</text><text x="212" y="86" className="fd-cos-m">cos = {sonMatni(q.cos)}</text><text x="212" y="108" className="fd-tg-m">tg = {q.tg === null ? "—" : sonMatni(q.tg)}</text>
      {a && <><text x="212" y="136" className="fd-t">{__kbUi("aniq")}:</text><text x="212" y="152" className="fd-sin-m">sin = {a.sin}</text><text x="212" y="168" className="fd-cos-m">cos = {a.cos}</text><text x="212" y="184" className="fd-tg-m">tg = {a.tg ?? "—"}</text></>}
      <g transform="translate(0,-110)"><line x1="12" x2="328" y1={gy(0)} y2={gy(0)} className="fd-o" />
        {[0, 90, 180, 270, 360].map((d) => <g key={d}><line x1={gx(d)} x2={gx(d)} y1={gy(1)} y2={gy(-1)} className="fd-g" /><text x={gx(d)} y={gy(-1) + 12} className="fd-t" textAnchor="middle">{d}°</text></g>)}
        <path d={`M${yol(Math.sin)}`} className="fd-sin-egri" /><path d={`M${yol(Math.cos)}`} className="fd-cos-egri" />
        <line x1={gx(g)} x2={gx(g)} y1={gy(1) - 4} y2={gy(-1) + 4} className="fd-radius" /><circle cx={gx(g)} cy={gy(q.sin)} r="4" className="fd-sin-nuqta" /><circle cx={gx(g)} cy={gy(q.cos)} r="4" className="fd-cos-nuqta" /></g>
    </svg>
    <input type="range" min="0" max="360" step="1" value={g} onChange={(e) => setG(Number(e.target.value))} aria-label={__kbUi("Burchak (gradus)")} className="fd-surgich" />
    <div className="fd-presetlar" role="group" aria-label={__kbUi("Tez burchaklar")}>{TEZ.map((v) => <button key={v} type="button" onClick={() => setG(v)} className={g === v ? "is-on" : ""}>{v}°</button>)}</div>
  </div>;
}
