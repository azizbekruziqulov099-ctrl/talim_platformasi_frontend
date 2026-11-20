// REV670: PEDAGOGIKA JONLI DOSKASI — KOD, SXEMA, ZANJIR, JADVAL buyruqlari (qoidalar: pedDoska.js).
// Har chizma ustoz gapirayotgan payt bosqichma-bosqich ochiladi: progress 0..1 (qancha yozilgan).
import React from "react";
import { kodTahlil, sxemaTahlil, zanjirTahlil, jadvalTahlil, rangBolaklar } from "./pedDoska.js";

export const PED_RANGLAR = ["var(--dx-yellow)", "#A8E6A1", "var(--dx-blue)", "#F4A6A6", "#C9B3F5", "#F6B26B", "#8EE3D8", "#F7E08A"];
export const RANG_KOD = { s: "var(--dx-yellow)", k: "var(--dx-blue)", y: "#A8E6A1", p: "#F4A6A6" };
const kesim = (p) => Math.min(1, Math.max(0, p));
const chiq = (p, at) => ({ opacity: p >= at ? 1 : 0, transform: p >= at ? "none" : "translateY(8px) scale(.97)", transition: "opacity .45s ease, transform .45s ease" });
const chiz = (p, from, to) => { const q = kesim((p - from) / Math.max(0.0001, to - from)); return q >= 1 ? {} : { strokeDasharray: 1, strokeDashoffset: 1 - q }; };

/** Rangli so'zli matn (to'liq yozilgan holda). */
export function RangliMatn({ text }) {
  return <>{rangBolaklar(text).map((b, i) => (b.rang
    ? <span key={i} className={`pdx-rang pdx-rang-${b.rang}`} style={{ color: RANG_KOD[b.rang] }}>{b.t}</span>
    : <React.Fragment key={i}>{b.t}</React.Fragment>))}</>;
}

/** KOD — avval harflar qatori yonadi, keyin har harf o'z so'ziga ochiladi. */
export function Kod({ arg, progress = 1, fallback = null }) {
  const t = kodTahlil(arg);
  if (!t) return fallback;
  const p = kesim(progress), n = t.length;
  return <div className="pdx-kod" role="list" aria-label={`Kod: ${t.map((x) => x.h).join(" ")}`}>
    <div className="pdx-kod-bosh" aria-hidden="true">{t.map((x, i) =>
      <span key={i} className="pdx-harf" style={{ background: PED_RANGLAR[i % PED_RANGLAR.length], ...chiq(p, 0.02 + (i / n) * 0.22) }}>{x.h}</span>)}</div>
    {t.map((x, i) => { const [bosh, ...qol] = x.soz.split(/\s+/); const rang = PED_RANGLAR[i % PED_RANGLAR.length];
      return <div key={i} className="pdx-kod-q" role="listitem" style={chiq(p, 0.3 + (i / n) * 0.66)}>
        <span className="pdx-harf pdx-harf-k" style={{ background: rang }}>{x.h}</span>
        <span className="pdx-kod-soz"><b style={{ color: rang }}>{bosh}</b>{qol.length ? ` ${qol.join(" ")}` : ""}</span>
      </div>; })}
  </div>;
}

/** SXEMA — markazdagi tushunchadan shoxlar chiziladi, uchida tushuncha kartochkasi chiqadi. */
export function Sxema({ arg, progress = 1, fallback = null }) {
  const t = sxemaTahlil(arg);
  if (!t) return fallback;
  const p = kesim(progress), n = t.shox.length, y = (i) => ((i + 0.5) / n) * 100;
  return <div className="pdx-sxema" role="img" aria-label={`${t.markaz}: ${t.shox.join(", ")}`}>
    <div className="pdx-markaz" style={chiq(p, 0.02)}><span>{t.markaz}</span></div>
    <svg className="pdx-shoxlar" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {t.shox.map((_, i) => { const a = 0.12 + (i / n) * 0.8;
        return <path key={i} d={`M0 50 C55 50 45 ${y(i)} 100 ${y(i)}`} pathLength="1" fill="none" stroke={PED_RANGLAR[i % PED_RANGLAR.length]}
          strokeWidth="2.4" vectorEffect="non-scaling-stroke" style={chiz(p, a, a + 0.06)} />; })}
    </svg>
    <div className="pdx-shox-ust">{t.shox.map((s, i) => { const rang = PED_RANGLAR[i % PED_RANGLAR.length];
      return <div key={i} className="pdx-shox" style={{ borderColor: rang, ...chiq(p, 0.16 + (i / n) * 0.8) }}><span style={{ color: rang }}><RangliMatn text={s} /></span></div>; })}</div>
  </div>;
}

/** ZANJIR — vaqt chizig'i yoki ketma-ketlik: tugunlar strelka bilan navbat bilan yonadi (5+ bo'lsa — tik). */
export function Zanjir({ arg, progress = 1, fallback = null }) {
  const t = zanjirTahlil(arg);
  if (!t) return fallback;
  const p = kesim(progress), n = t.length, tik = n > 4;
  return <ol className={`pdx-zanjir ${tik ? "is-tik" : ""}`} aria-label={t.map((x) => x.bosh).join(" → ")}>
    {t.map((x, i) => { const rang = PED_RANGLAR[i % PED_RANGLAR.length], at = 0.04 + (i / n) * 0.9;
      return <li key={i} className="pdx-tugun" style={chiq(p, at)}>
        {i > 0 && <span className="pdx-strelka" aria-hidden="true">{tik ? "↓" : "→"}</span>}
        <span className="pdx-nuqta" style={{ background: rang }} aria-hidden="true" />
        <b style={{ color: rang }}><RangliMatn text={x.bosh} /></b>
        {x.izoh.map((z, k) => <small key={k}><RangliMatn text={z} /></small>)}
      </li>; })}
  </ol>;
}

/** JADVAL — taqqoslash jadvali: sarlavha, keyin qatorlar bittadan. */
export function Jadval({ arg, progress = 1, fallback = null }) {
  const t = jadvalTahlil(arg);
  if (!t) return fallback;
  const p = kesim(progress), n = t.qatorlar.length;
  return <table className="pdx-jadval">
    <thead style={chiq(p, 0.02)}><tr>{t.bosh.map((h, i) => <th key={i} style={{ color: PED_RANGLAR[i % PED_RANGLAR.length] }}><RangliMatn text={h} /></th>)}</tr></thead>
    <tbody>{t.qatorlar.map((r, i) => <tr key={i} style={chiq(p, 0.15 + (i / n) * 0.8)}>{r.map((c, k) => <td key={k}><RangliMatn text={c} /></td>)}</tr>)}</tbody>
  </table>;
}
