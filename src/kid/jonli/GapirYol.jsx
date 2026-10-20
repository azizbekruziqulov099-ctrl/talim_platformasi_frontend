import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import GapirOyin from "./GapirOyin.jsx";
import { GAPIR_JAMI, GAPIR_POGONA, GAPIR_TUR, GAPIR_BELGI, gapirTuri, gapirNatija, gapirNavbat, gapirOchiq, gapirYoz } from "./gapirRules.js";
import { uiText as T } from "../../interface/interfaceRuntime.js";
import "./jonli.css";
import { B } from "../Belgi.jsx";
const TUR_BELGI = { "🚪": "tur_harakat", "🍎": "tur_narsa", "💬": "tur_gap", "🙋": "tur_buyruq", "🎲": "tur_aralash" };

const ekranda = (el) => (globalThis.document?.body ? createPortal(el, globalThis.document.body) : el);
const POGONA_NOM = { uz: "{n}-pog‘ona", ru: "Уровень {n}", en: "Level {n}" };

/** REV148: «Ayt — bo'ladi!» xaritasi — 20 pog'ona × 8 = 160 bosqich (har birida 3 ibora), ketma-ket ochiladi. */
export default function GapirYol({ til = "en", izoh = "uz", ayt, jim, cheklovsiz = false }) {
  const [natija, setNatija] = useState(() => gapirNatija(til));
  const [ochiq, setOchiq] = useState(null);
  const [tugadi, setTugadi] = useState(null);
  const [korsat, setKorsat] = useState(2);
  const [oyinK, setOyinK] = useState(0);
  useEffect(() => { setNatija(gapirNatija(til)); }, [til]);
  const navbat = useMemo(() => gapirNavbat(natija), [natija]);
  useEffect(() => { setKorsat((k) => Math.max(k, Math.floor(navbat / GAPIR_TUR) + 2)); }, [navbat]);
  useEffect(() => {
    if (ochiq == null || !globalThis.document?.body) return undefined;
    const b = globalThis.document.body, eski = b.style.overflow;
    b.style.overflow = "hidden";
    return () => { b.style.overflow = eski; };
  }, [ochiq]);
  const lang = ["uz", "ru", "en"].includes(izoh) ? izoh : "uz";
  const yulduzJami = Object.values(natija).reduce((s, v) => s + (Number(v) || 0), 0);

  const boshla = (n) => { if (!gapirOchiq(n, natija, cheklovsiz)) return; jim?.(); setTugadi(null); setOchiq(n); setOyinK((k) => k + 1); };
  const yakun = (y) => { setNatija(gapirYoz(til, ochiq, y)); setTugadi({ n: ochiq, yulduz: y }); };
  const chiq = () => { jim?.(); setOchiq(null); setTugadi(null); };

  return <section className="hy-bolim jo-yol ga-yol" aria-label={T("Ayt — bo‘ladi!")}>
    <h3><span aria-hidden="true"><B e="🎤" /></span> {T("Ayt — bo‘ladi!")} <small><B e="⭐" /> {yulduzJami} · {Object.keys(natija).length}/{GAPIR_JAMI}</small></h3>
    {Array.from({ length: Math.min(GAPIR_POGONA, korsat) }, (_, p) => {
      const boshi = p * GAPIR_TUR;
      const yopiq = !cheklovsiz && boshi > navbat;
      return <div key={p} className={`jo-pogona ${yopiq ? "is-yopiq" : ""}`}>
        <h4>{POGONA_NOM[lang].replace("{n}", p + 1)}</h4>
        <div className="jo-bosqichlar">
          {Array.from({ length: GAPIR_TUR }, (__, i) => {
            const n = boshi + i;
            const emoji = GAPIR_BELGI[gapirTuri(n).tur];
            const ok = gapirOchiq(n, natija, cheklovsiz);
            const y = Number(natija[n]) || 0;
            return <button key={n} type="button" className={`jo-bosqich ${ok ? "" : "is-qulf"} ${n === navbat ? "is-navbat" : ""}`}
              onClick={() => boshla(n)} aria-label={`${n + 1}. ${T("Ayt — bo‘ladi!")}${ok ? "" : ` — ${T("yopiq")}`}`}>
              <span aria-hidden="true">{ok ? <B n={TUR_BELGI[emoji]} e={emoji} /> : <B e="🔒" />}</span><b>{n + 1}</b>
              <small aria-hidden="true">{Array.from({ length: y }, (_, k) => <B key={k} e="⭐" />)}</small>
            </button>;
          })}
        </div>
      </div>;
    })}
    {korsat < GAPIR_POGONA && <button type="button" className="hy-bugun" onClick={() => setKorsat((k) => Math.min(GAPIR_POGONA, k + 3))}>⬇️ {T("Yana pog‘onalar")}</button>}
    {ochiq != null && ekranda(<div className="jo-ekran" role="dialog" aria-modal="true">
      <GapirOyin key={`${ochiq}-${oyinK}`} n={ochiq} til={til} izoh={izoh} ayt={ayt} onChiq={chiq} onYakun={yakun} />
      {tugadi && <div className="hy-natija-btn jo-keyingi">
        <button type="button" onClick={() => boshla(tugadi.n)}><B e="🔁" /> {T("Yana o‘ynash")}</button>
        {tugadi.n + 1 < GAPIR_JAMI && <button type="button" className="is-asosiy" onClick={() => boshla(tugadi.n + 1)}><B e="▶" /> {T("Keyingisi")}</button>}
        <button type="button" onClick={chiq}><B e="🗺️" /> {T("Yo‘lga qaytish")}</button>
      </div>}
    </div>)}
  </section>;
}
