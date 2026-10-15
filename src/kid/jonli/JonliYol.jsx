import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import JonliOyin from "./JonliOyin.jsx";
import { JAMI, POGONA, TURLAR, jonliMatn, jonliNatija, jonliNavbat, jonliOchiq, jonliYoz } from "./jonliRules.js";
import { uiText as T } from "../../interface/interfaceRuntime.js";
import "./jonli.css";

const ekranda = (el) => (globalThis.document?.body ? createPortal(el, globalThis.document.body) : el);
const POGONA_NOM = { uz: "{n}-pog‘ona", ru: "Уровень {n}", en: "Level {n}" };

/** REV148: «Jonli o'yinlar» xaritasi — 15 pog'ona × 8 o'yin = 120 bosqich, ketma-ket ochiladi. */
export default function JonliYol({ til = "en", izoh = "uz", ayt, jim, cheklovsiz = false }) {
  const [natija, setNatija] = useState(() => jonliNatija(til));
  const [ochiq, setOchiq] = useState(null);       // o'ynalayotgan bosqich
  const [tugadi, setTugadi] = useState(null);     // {n, yulduz}
  const [korsat, setKorsat] = useState(2);        // nechta pog'ona ko'rinadi (qolgani «Yana» bilan)
  const [oyinK, setOyinK] = useState(0);          // har boshlanishda o'yin yangidan
  useEffect(() => { setNatija(jonliNatija(til)); }, [til]);
  const navbat = useMemo(() => jonliNavbat(natija), [natija]);
  useEffect(() => { setKorsat((k) => Math.max(k, Math.floor(navbat / TURLAR.length) + 2)); }, [navbat]);
  useEffect(() => {
    if (ochiq == null || !globalThis.document?.body) return undefined;
    const b = globalThis.document.body, eski = b.style.overflow;
    b.style.overflow = "hidden";
    return () => { b.style.overflow = eski; };
  }, [ochiq]);
  const lang = ["uz", "ru", "en"].includes(izoh) ? izoh : "uz";
  const yulduzJami = Object.values(natija).reduce((s, v) => s + (Number(v) || 0), 0);

  const boshla = (n) => { if (!jonliOchiq(n, natija, cheklovsiz)) return; jim?.(); setTugadi(null); setOchiq(n); setOyinK((k) => k + 1); };
  const yakun = (y) => { setNatija(jonliYoz(til, ochiq, y)); setTugadi({ n: ochiq, yulduz: y }); };
  const chiq = () => { jim?.(); setOchiq(null); setTugadi(null); };

  return <section className="hy-bolim jo-yol" aria-label={T("Jonli o‘yinlar")}>
    <h3><span aria-hidden="true">🎈</span> {T("Jonli o‘yinlar")} <small>⭐ {yulduzJami} · {Object.keys(natija).length}/{JAMI}</small></h3>
    {Array.from({ length: Math.min(POGONA, korsat) }, (_, p) => {
      const boshi = p * TURLAR.length;
      const yopiq = !cheklovsiz && boshi > navbat;
      return <div key={p} className={`jo-pogona ${yopiq ? "is-yopiq" : ""}`}>
        <h4>{POGONA_NOM[lang].replace("{n}", p + 1)}</h4>
        <div className="jo-bosqichlar">
          {TURLAR.map((t, i) => {
            const n = boshi + i;
            const ok = jonliOchiq(n, natija, cheklovsiz);
            const y = Number(natija[n]) || 0;
            return <button key={n} type="button" className={`jo-bosqich ${ok ? "" : "is-qulf"} ${n === navbat ? "is-navbat" : ""}`}
              onClick={() => boshla(n)} aria-label={`${n + 1}. ${jonliMatn(t.id, "nom", izoh)}${ok ? "" : ` — ${T("yopiq")}`}`}>
              <span aria-hidden="true">{ok ? t.emoji : "🔒"}</span><b>{n + 1}</b>
              <small aria-hidden="true">{y ? "⭐".repeat(y) : ""}</small>
            </button>;
          })}
        </div>
      </div>;
    })}
    {korsat < POGONA && <button type="button" className="hy-bugun" onClick={() => setKorsat((k) => Math.min(POGONA, k + 3))}>⬇️ {T("Yana pog‘onalar")}</button>}
    {ochiq != null && ekranda(<div className="jo-ekran" role="dialog" aria-modal="true">
      <JonliOyin key={`${ochiq}-${oyinK}`} n={ochiq} til={til} izoh={izoh} ayt={ayt} onChiq={chiq} onYakun={yakun} />
      {tugadi && <div className="hy-natija-btn jo-keyingi">
        <button type="button" onClick={() => boshla(tugadi.n)}>🔁 {T("Yana o‘ynash")}</button>
        {tugadi.n + 1 < JAMI && <button type="button" className="is-asosiy" onClick={() => boshla(tugadi.n + 1)}>▶ {T("Keyingisi")}</button>}
        <button type="button" onClick={chiq}>🗺️ {T("Yo‘lga qaytish")}</button>
      </div>}
    </div>)}
  </section>;
}
