import React, { useEffect, useRef, useState } from "react";
import { USTOZLAR, XONALAR } from "./ustozlar.js";
import { GAPIR, KULGI, PIRPIRAT, XONA, bezak, blinkDelay, pozaFor } from "./ustozRules.js";
import { cardSize } from "./kidStageRules.js";
import "./ustozSahna.css";

/**
 * REV110: bog'cha darsi sahnasi — haqiqiy sinfxona, chapda jonli ustoz, doskada mavzu rasmlari.
 * Ustoz gapirganda og'zi ochilib-yopiladi, vaqti-vaqti bilan ko'zini pirpiratadi, vaziyatga qarab pozasi almashadi
 * (salom beradi, doskani ko'rsatadi, o'ylaydi, quvonadi, tinglaydi). Hammasi CSS + rasm almashtirish — telefonni qiynamaydi.
 */
export default function UstozSahna({ ustoz = "nilufar", mood = "", speaking = false, listening = false, pictures = [], mavzuRasmlar = [], havo = "quyosh", vaqt = "kun", shamol = false, onTap, celebrate = 0, children }) {
  const xonaKey = XONALAR[XONA[ustoz]] ? XONA[ustoz] : "onatili";
  const xona = XONALAR[xonaKey];
  const poza = pozaFor(mood, { hasPics: pictures.length > 0, listening });
  const p = (USTOZLAR[ustoz] || USTOZLAR.nilufar)[poza];
  const [kadr, setKadr] = useState(1);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  // Gapirish: og'iz kadrlari almashadi.
  useEffect(() => {
    if (!speaking || !p.yuz) { setKadr(poza === 5 ? KULGI : 1); return undefined; }
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % GAPIR.length; setKadr(GAPIR[i]); }, 130);
    return () => clearInterval(t);
  }, [speaking, p, poza]);

  // Pirpiratish: gapirmayotganda har 2,5–5 soniyada.
  useEffect(() => {
    if (speaking || !p.yuz) return undefined;
    let t1, t2;
    const loop = () => {
      t1 = setTimeout(() => {
        if (!alive.current) return;
        setKadr(PIRPIRAT);
        t2 = setTimeout(() => { if (alive.current) { setKadr(poza === 5 ? KULGI : 1); loop(); } }, 140);
      }, blinkDelay());
    };
    loop();
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [speaking, p, poza]);

  // Kadrlarni oldindan yuklab qo'yamiz (birinchi gapirishda miltillamasin).
  useEffect(() => { if (typeof Image !== "undefined" && p.yuz) p.yuz.kadr.forEach((s) => { const im = new Image(); im.src = s; }); }, [p]);

  const d = xona.doska;
  const bz = bezak(mavzuRasmlar, xona, pictures.map((x) => x.src).filter(Boolean));
  const box = (r) => ({ left: `${r.l}%`, top: `${r.t}%`, width: `${r.w}%`, height: `${r.h}%` });
  // REV121: deraza shishasi (rom, bayroqcha, gul ustiga osmon chizilmaydi) — deraza qutisiga nisbatan 0..1 koordinatalar
  const dz = xona.deraza;
  const oynaId = `us-oyna-${xonaKey}`;
  const oyna = dz && xona.oyna ? xona.oyna.map((poly) => poly.map(([x, y]) => `${((x - dz.l) / dz.w).toFixed(4)},${((y - dz.t) / dz.h).toFixed(4)}`).join(" ")) : null;
  const clip = oyna ? { clipPath: `url(#${oynaId})`, WebkitClipPath: `url(#${oynaId})` } : {};
  const chiroqYoniq = vaqt === "kech" || vaqt === "tun";
  return <div className={`us-stage vaqt-${vaqt} ${speaking ? "is-speaking" : ""} ${chiroqYoniq ? "is-lamp" : ""}`} style={{ "--cel": celebrate, "--lx": `${xona.chiroq?.x ?? 50}%` }}>
    <img className="us-bg" src={xona.src} srcSet={`${xona.src} 960w, ${xona.src2x} 1600w`} sizes="(max-width: 900px) 100vw, 900px" alt="" decoding="async" />
    <div className="us-light" aria-hidden="true" />
    {oyna && <svg className="us-clipdef" width="0" height="0" aria-hidden="true" focusable="false"><defs><clipPath id={oynaId} clipPathUnits="objectBoundingBox">
      {oyna.map((pts) => <polygon key={pts} points={pts} />)}</clipPath></defs></svg>}
    {dz && <div className={`us-window havo-${havo} vaqt-${vaqt} ${shamol ? "is-windy" : ""} ${oyna ? "has-panes" : ""}`} style={{ ...box(dz), ...clip }} aria-hidden="true">
      <span className="us-sky" /><span className="us-stars" /><span className="us-sun" /><span className="us-moon" />
      <span className="us-cloud c1" /><span className="us-cloud c2" /><span className="us-cloud c3" />
      <span className="us-hills" /><span className="us-fall" /><span className="us-fall f2" /><span className="us-flash" />
    </div>}
    {bz.devor && <div className="us-frame" style={box(xona.devor)} aria-hidden="true"><img key={bz.devor} src={bz.devor} alt="" /></div>}
    {bz.javon.length > 0 && <div className="us-shelf" style={box(xona.javon)} aria-hidden="true">{bz.javon.map((s2) => <span key={s2}><img src={s2} alt="" /></span>)}</div>}
    {bz.pol && <div className="us-floor" style={box(xona.pol)} aria-hidden="true"><img key={bz.pol} src={bz.pol} alt="" /></div>}
    {xona.chiroq && <div className="us-lamp" aria-hidden="true"><span className="us-lamp-cord" /><span className="us-lamp-shade" /><span className="us-lamp-bulb" /></div>}
    <div className="us-lamp-glow" aria-hidden="true" />
    {/* REV121: rasm chiqqanda doska «yaqinlashadi» — telefonda ham rasmlar katta va aniq (ustoz chapda qoladi) */}
    <div className={`us-board ${d.panel ? "is-panel" : ""} ${pictures.length ? "is-zoom" : ""} n${Math.min(4, pictures.length)}`} style={pictures.length ? undefined : box(d)}>
      {pictures.map((pic, i) => <button key={`${pic.src || pic.emoji}-${pic.rev || 0}-${i}`} type="button"
        className={`us-pic ${pic.emoji && !pic.src ? `is-emoji sz-${cardSize(pic.emoji)}` : ""} ${pic.holat ? `is-${pic.holat}` : ""}`} style={{ "--i": i }}
        onClick={() => onTap?.(i)} aria-label={pic.label || "rasm"}>
        {pic.src ? <img src={pic.src} alt="" draggable="false" /> : <span className="us-emoji">{pic.emoji}</span>}
      </button>)}
      {children}
    </div>
    <div key={`${ustoz}-${poza}`} className={`us-teacher poza-${poza}`} style={{ aspectRatio: `${p.w} / ${p.h}` }}>
      <img className="us-body" src={p.src} alt="" draggable="false" decoding="async" />
      {p.yuz && kadr !== 1 && <img className="us-face" src={p.yuz.kadr[kadr - 1]} alt="" draggable="false"
        style={{ left: `${p.yuz.x}%`, top: `${p.yuz.y}%`, width: `${p.yuz.w}%`, height: `${p.yuz.h}%` }} />}
    </div>
  </div>;
}
