import React, { useEffect, useRef, useState } from "react";
import { OG_RASM, USTOZLAR, XONALAR } from "./ustozlar.js";
import { BELGI } from "./Belgi.jsx";
import { GAPIR, KULGI, PIRPIRAT, XONA, blinkDelay, pozaFor } from "./ustozRules.js";
import { cardSize } from "./kidStageRules.js";
import { OGIZ, mouthFrame, ogizShakli, ritmShakli } from "./lipSync.js";
import { keycapNumber } from "./sanKarta.js";
import "./ustozSahna.css";

/**
 * REV110: bog'cha darsi sahnasi — haqiqiy sinfxona, chapda jonli ustoz, doskada mavzu rasmlari.
 * Ustoz gapirganda og'zi ochilib-yopiladi, vaqti-vaqti bilan ko'zini pirpiratadi, vaziyatga qarab pozasi almashadi
 * (salom beradi, doskani ko'rsatadi, o'ylaydi, quvonadi, tinglaydi). Hammasi CSS + rasm almashtirish — telefonni qiynamaydi.
 */
export default function UstozSahna({ ustoz = "nilufar", mood = "", speaking = false, mouth = null, soz = "", listening = false, pictures = [], havo = "quyosh", vaqt = "kun", shamol = false, derazaga = false, havo2 = "", doskaYoq = false, onTap, celebrate = 0, children }) {
  const xonaKey = XONALAR[XONA[ustoz]] ? XONA[ustoz] : "onatili";
  const xona = XONALAR[xonaKey];
  const poza = pozaFor(mood, { hasPics: pictures.length > 0, listening });
  const t = USTOZLAR[ustoz] || USTOZLAR.nilufar;
  const p = t[poza];
  const ogRasm = OG_RASM[t.lab] || OG_RASM.ayol;
  const [kadr, setKadr] = useState(1);
  // REV153: gapirganda og'iz — lab varag'idagi 10 shakldan (ovoz balandligi + aytilayotgan so'zning unlilari). -1 — chizilgan og'iz.
  const [og, setOg] = useState(-1);
  const sozRef = useRef(soz);
  sozRef.current = soz;
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  // REV122: og'iz OVOZGA mos qimirlaydi (mouth() — ovoz balandligi). Ovoz hali boshlanmagan yoki jimlikda — og'iz yopiq.
  // Tahlil tayyor bo'lmasa (yoki ovoz yo'q, so'zlar jim yonsa) — sokin ritm. Kadr faqat o'zgarganda yangilanadi.
  const [ochiq, setOchiq] = useState(false);   // ovoz haqiqatan yangrayaptimi (tanani yengil tebratish uchun)
  useEffect(() => {
    const yopiq = poza === 5 ? KULGI : 1;
    if (!speaking || (!p.yuz && !p.og)) { setKadr(yopiq); setOg(-1); setOchiq(false); return undefined; }
    let raf = 0, last = -1, prev = 0, i = 0, tick = 0, since = 0, on = null, oldSoz = null;
    const holat = { soz: "", bogin: 0, past: true };
    if (p.og) setKadr(1);
    const loop = (now) => {
      const lv = typeof mouth === "function" ? mouth() : -1;
      let f;
      if (p.og) {
        if (sozRef.current !== oldSoz) { oldSoz = sozRef.current; holat.soz = oldSoz; holat.bogin = 0; holat.past = true; i = 0; }
        if (lv == null) f = 0;
        else if (lv < 0) { if (now - tick > 120) { tick = now; i += 1; } f = ritmShakli(i, holat.soz); }
        else { f = ogizShakli(lv, prev, holat); prev = lv; }
      } else if (lv == null) f = yopiq;
      else if (lv < 0) { if (now - tick > 150) { tick = now; i = (i + 1) % GAPIR.length; } f = GAPIR[i]; }
      else { f = mouthFrame(lv, prev); prev = lv; if (f === 1) f = yopiq; }
      if (on !== (lv != null)) { on = lv != null; setOchiq(on); }   // ovoz haqiqatan yangrayaptimi
      // juda tez almashmasin (kamida 70 ms) — og'iz «miltillamaydi»
      if (f !== last && now - since > 70) { last = f; since = now; if (p.og) setOg(f); else setKadr(f); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); setOg(-1); };
  }, [speaking, p, poza, mouth]);

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
  useEffect(() => { if (typeof Image !== "undefined" && p.og) ogRasm.forEach((s) => { const im = new Image(); im.src = s; }); }, [p, ogRasm]);

  const d = xona.doska;
  const box = (r) => ({ left: `${r.l}%`, top: `${r.t}%`, width: `${r.w}%`, height: `${r.h}%` });
  // REV140: deraza shishasi — rasmdan aniq olingan niqob (osmon rom, bayroqcha, gul, parda ustiga chiqmaydi).
  // Kunduzi quyoshli havoda rasmning o'z manzarasi qoladi; boshqa holatlarda manzara ustidan rang beriladi
  // (tong — pushti, kech — shafaq, tun — to'q ko'k) va oy, yulduz, bulut, yomg'ir, qor qo'shiladi.
  const dz = xona.deraza;
  const niqob = xona.osmon ? { WebkitMaskImage: `url(${xona.osmon})`, maskImage: `url(${xona.osmon})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" } : {};
  const chiroqYoniq = vaqt === "kech" || vaqt === "tun";
  const holat = `havo-${havo} vaqt-${vaqt} ${shamol ? "is-windy" : ""}`;
  return <div className={`us-stage vaqt-${vaqt} ${speaking && ochiq ? "is-speaking" : ""} ${chiroqYoniq ? "is-lamp" : ""} ${derazaga ? "is-deraza" : ""}`} style={{ "--cel": celebrate, "--lx": `${xona.chiroq?.x ?? 50}%` }}>
    <img className="us-bg" src={xona.src} srcSet={`${xona.src} 960w, ${xona.src2x} 1600w`} sizes="(max-width: 900px) 100vw, 900px" alt="" decoding="async" />
    <div className="us-light" aria-hidden="true" />
    {dz && xona.osmon && <div className={`us-tint ${holat}`} style={{ ...box(dz), ...niqob }} aria-hidden="true" />}
    {dz && xona.osmon && <div className={`us-window ${holat}`} style={{ ...box(dz), ...niqob, "--oy-t": `${xona.oy?.t ?? 18}cqh`, "--oy-r": `${xona.oy?.r ?? 20}cqw` }} aria-hidden="true">
      <span className="us-stars" /><span className="us-moon" />
      <span className="us-cloud c1" /><span className="us-cloud c2" /><span className="us-cloud c3" />
      <span className="us-fall" /><span className="us-fall f2" /><span className="us-flash" />
    </div>}
    {dz && xona.osmon && derazaga && <div className="us-deraza-nur" style={{ ...box(dz), ...niqob }} aria-hidden="true" />}
    {/* REV154: shiftdagi chiroq — rassom rasmi (o'chiq / yoniq) */}
    {xona.chiroq && (BELGI.chiroq_ochiq && BELGI.chiroq_yoniq
      ? <div className="us-lamp has-img" aria-hidden="true"><img className="us-lamp-img" src={chiroqYoniq ? BELGI.chiroq_yoniq : BELGI.chiroq_ochiq} alt="" draggable="false" /></div>
      : <div className="us-lamp" aria-hidden="true"><span className="us-lamp-cord" /><span className="us-lamp-shade" /><span className="us-lamp-bulb" /></div>)}
    {/* REV154: ob-havo qadamida — deraza oldida bugungi ob-havo rasmi */}
    {dz && derazaga && BELGI[`havo_${havo2}`] && <img className="us-havo-rasm" src={BELGI[`havo_${havo2}`]} alt="" draggable="false" style={{ left: `${Math.min(84, Math.max(2, dz.l + dz.w / 2 - 9))}%`, top: `${Math.max(2, dz.t + dz.h / 2 - 12)}%` }} />}
    <div className="us-lamp-glow" aria-hidden="true" />
    {/* REV121: rasm chiqqanda doska «yaqinlashadi» — telefonda ham rasmlar katta va aniq (ustoz chapda qoladi) */}
    <div className={`us-board ${d.panel ? "is-panel" : ""} ${pictures.length ? "is-zoom" : ""} ${doskaYoq && !pictures.length ? "is-yoq" : ""} n${Math.min(6, pictures.length)} ${pictures.some((x) => x.faol) ? "has-faol" : ""}`} style={pictures.length ? undefined : box(d)}>
      {pictures.map((pic, i) => <button key={`${pic.src || pic.emoji}-${pic.rev || 0}-${i}`} type="button"
        className={`us-pic ${pic.emoji && !pic.src ? `is-emoji sz-${cardSize(pic.emoji)}` : ""} ${pic.holat ? `is-${pic.holat}` : ""} ${pic.faol ? "is-faol" : ""}`} style={{ "--i": i }}
        onClick={() => onTap?.(i)} aria-label={pic.label || "rasm"}>
        {pic.qator ? <span className={`us-qator q${Math.min(pic.qator.length, 12)}`}>{pic.qator.map((x, j) => x.src ? <img key={j} src={x.src} alt="" draggable="false" style={{ "--j": j }} /> : <b key={j}>{x.t}</b>)}</span>
          : pic.src ? <img className={pic.anim ? `an-${pic.anim}` : undefined} src={pic.src} alt="" draggable="false" /> : keycapNumber(pic.emoji) ? <span className="us-emoji kb-num">{keycapNumber(pic.emoji)}</span> : <span className={`us-emoji ${pic.anim ? `an-${pic.anim}` : ""}`}>{pic.emoji}</span>}
      </button>)}
      {children}
    </div>
    <div key={`${ustoz}-${poza}`} className={`us-teacher poza-${poza}`} style={{ aspectRatio: `${p.w} / ${p.h}` }}>
      <img className="us-body" src={p.src} alt="" draggable="false" decoding="async" />
      {p.yuz && kadr !== 1 && <img className="us-face" src={p.yuz.kadr[kadr - 1]} alt="" draggable="false"
        style={{ left: `${p.yuz.x}%`, top: `${p.yuz.y}%`, width: `${p.yuz.w}%`, height: `${p.yuz.h}%` }} />}
      {p.og && og >= 0 && <span className="us-og" style={{ left: `${p.og.x}%`, top: `${p.og.y}%`, width: `${p.og.w}%`, "--teri": p.og.skin }} aria-hidden="true">
        <i className="us-og-teri" />
        <img src={ogRasm[og]} alt="" draggable="false" style={{ width: `${OGIZ[og][0] * 95}%`, top: `${50 + OGIZ[og][2] * 100}%` }} />
      </span>}
    </div>
  </div>;
}
