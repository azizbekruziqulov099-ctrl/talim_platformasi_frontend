import React, { useEffect, useRef, useState } from "react";
import { OG_RASM, USTOZLAR, XONALAR } from "./ustozlar.js";
import { BELGI } from "./Belgi.jsx";
import { GAPIR, KULGI, PIRPIRAT, XONA, blinkDelay, kokrak, pozaFor, xonaKaliti } from "./ustozRules.js";
import { detallar } from "./madaniyat.js";
import { cardSize } from "./kidStageRules.js";
import { OGIZ, mouthFrame, ogizShakli, ritmShakli } from "./lipSync.js";
import { keycapNumber } from "./sanKarta.js";
import { soatBurchaklari } from "./devorSoat.js";
import "./ustozSahna.css";

/**
 * REV110: bog'cha darsi sahnasi — haqiqiy sinfxona, chapda jonli ustoz, doskada mavzu rasmlari.
 * Ustoz gapirganda og'zi ochilib-yopiladi, vaqti-vaqti bilan ko'zini pirpiratadi, vaziyatga qarab pozasi almashadi
 * (salom beradi, doskani ko'rsatadi, o'ylaydi, quvonadi, tinglaydi). Hammasi CSS + rasm almashtirish — telefonni qiynamaydi.
 */
/** REV158: ob-havo rasmi joyi — deraza o'ng tomonda bo'lsa deraza oldida, ustoz tomonda (chapda) bo'lsa doskada. */
/** REV158: devordagi soat — haqiqiy vaqtni ko'rsatadi (rasmdagi millar ustidan yangi siferblat). */
function DevorSoat({ soat }) {
  const [vaqt, setVaqt] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setVaqt(new Date()), 1000); return () => clearInterval(t); }, []);
  const b = soatBurchaklari(vaqt);
  const mil = (gr, uz, en, rang) => <line x1="50" y1="50" x2={50 + uz * Math.sin(gr * Math.PI / 180)} y2={50 - uz * Math.cos(gr * Math.PI / 180)}
    stroke={rang} strokeWidth={en} strokeLinecap="round" />;
  return <svg className="us-soat" viewBox="0 0 100 100" style={{ left: `${soat.x}%`, top: `${soat.y}%`, width: `${soat.w}%` }} aria-hidden="true">
    <circle cx="50" cy="50" r="49.5" fill={soat.yuz} />
    {Array.from({ length: 12 }, (_, i) => { const a = (i + 1) * 30 * Math.PI / 180;
      return <text key={i} x={50 + 37 * Math.sin(a)} y={50 - 37 * Math.cos(a) + 5.6} textAnchor="middle" fontSize="15" fontWeight="700" fill="#222" fontFamily="Arial, Helvetica, sans-serif">{i + 1}</text>; })}
    {mil(b.soat, 23, 5.2, "#1b1b1b")}
    {mil(b.daqiqa, 33, 3.6, "#1b1b1b")}
    {mil(b.soniya, 36, 1.3, "#d63a2f")}
    <circle cx="50" cy="50" r="4" fill="#1b1b1b" /><circle cx="50" cy="50" r="1.6" fill="#d63a2f" />
  </svg>;
}

// REV164: ustoz og'zi tabiiy bo'lsin — eng katta ochilgan shakllar (baqirgandek «O») o'rniga o'rtacha ochilgan shakl
const OG_YUMSHOQ = { 3: 9, 6: 5, 8: 2 };
export function ogYumshoq(i) { return OG_YUMSHOQ[i] ?? i; }

export function havoJoyi(dz, doska) {
  const markaz = dz.l + dz.w / 2;
  if (markaz < 35 && doska) return { left: `${Math.min(80, doska.l + doska.w / 2 - 9)}%`, top: `${Math.max(2, doska.t + doska.h / 2 - 16)}%` };
  return { left: `${Math.min(84, Math.max(36, markaz - 9))}%`, top: `${Math.max(2, dz.t + dz.h / 2 - 12)}%` };
}

/**
 * REV181: bitta ustoz qiyofasi — og'iz (ovozga mos), pirpiratish, poza. Ikki ustozli darsda har biri alohida:
 * gapirayotganining og'zi ovozga mos qimirlaydi (avvalgidek), ikkinchisi jim turadi — boshqa qo'shimcha harakat yo'q.
 * rol — "til" (o'rganilayotgan til ustozi) | "iz" (izoh tili ustozi); jim — boshqasi gapiryapti.
 */
function UstozFigura({ ustoz, mood = "", speaking = false, mouth = null, soz = "", listening = false, hasPics = false, rol = "", jim = false, bayroq = "", onOchiq }) {
  const poza = pozaFor(mood, { hasPics, listening });
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

  useEffect(() => { onOchiq?.(ochiq); }, [ochiq, onOchiq]);
  // juftda poza almashganda qiyofa qayta «kirib kelmaydi» (har gapda sakramasin) — faqat rasm almashadi
  return <div key={rol ? `rol-${rol}` : `${ustoz}-${poza}`} className={`us-teacher poza-${poza} ${rol ? `is-rol-${rol}` : ""} ${speaking && ochiq ? "is-gapir" : ""} ${jim ? "is-jim" : ""}`} style={{ aspectRatio: `${p.w} / ${p.h}` }}>
    <div className="us-ich">
      {/* REV181: bayroq — ko'krakka taqilgan nishon (boshi ustida emas); joyi pozadagi og'iz/yuz joyidan hisoblanadi */}
      {bayroq && <img className="us-bayroq" src={bayroq} alt="" draggable="false" style={kokrak(p)} />}
      <img className="us-body" src={p.src} alt="" draggable="false" decoding="async" />
      {p.yuz && kadr !== 1 && <img className="us-face" src={p.yuz.kadr[kadr - 1]} alt="" draggable="false"
        style={{ left: `${p.yuz.x}%`, top: `${p.yuz.y}%`, width: `${p.yuz.w}%`, height: `${p.yuz.h}%` }} />}
      {/* REV158: og'iz qatlami ustoz rasmi chegarasida qoladi (teri dog'i fonga chiqmaydi) */}
      {p.og && og >= 0 && <span className="us-og-qatlam" style={{ WebkitMaskImage: `url(${p.src})`, maskImage: `url(${p.src})` }} aria-hidden="true">
        <span className="us-og" style={{ left: `${p.og.x}%`, top: `${p.og.y}%`, width: `${p.og.w}%`, "--teri": p.og.skin, "--og-r": `${p.og.r || 0}deg` }}>
          <i className="us-og-teri" style={p.og.tw ? { width: `${p.og.tw}%` } : undefined} />
          <img src={ogRasm[ogYumshoq(og)]} alt="" draggable="false" style={{ width: `${OGIZ[ogYumshoq(og)][0] * 95}%`, top: `${50 + OGIZ[ogYumshoq(og)][2] * 100}%` }} />
        </span>
      </span>}
    </div>
  </div>;
}

/**
 * REV181: ikkinchi — ikki ustozli til darsi: asosiy ustoz (o'rganilayotgan til egasi, masalan Lukas — nemis) va izoh tili
 * ustozi (o'zbek — Nilufar, rus — Anna, ingliz — Emily). kim — hozir kim gapiryapti ("til" | "iz").
 */
export default function UstozSahna({ ustoz = "nilufar", ikkinchi = "", kim = null, bayroqlar = null, mood = "", speaking = false, mouth = null, soz = "", listening = false, pictures = [], havo = "quyosh", vaqt = "kun", shamol = false, derazaga = false, havo2 = "", doskaYoq = false, onTap, onDetal, celebrate = 0, children }) {
  // REV171: til ustozi ko'p kun o'z xonasida, ba'zi kunlar eski xonalarda (almashib turadi)
  // REV181: ikki ustozli darsda — doim til ustozining o'z xonasi (o'sha tilning madaniyati, doska atrofida keng joy)
  const juft0 = Boolean(ikkinchi && USTOZLAR[ikkinchi] && ikkinchi !== ustoz);
  const xonaKey = juft0 && XONALAR[XONA[ustoz]] ? XONA[ustoz] : XONALAR[xonaKaliti(ustoz)] ? xonaKaliti(ustoz) : "onatili";
  const xona = XONALAR[xonaKey];
  const [detal, setDetal] = useState(null);   // REV171: ochilgan madaniy detal
  const det = xonaKey.startsWith("til_") ? detallar(ustoz) : [];
  useEffect(() => { if (!detal) return undefined; const t = setTimeout(() => setDetal(null), 6000); return () => clearTimeout(t); }, [detal]);
  const juft = juft0;
  // gapirayotgan: juftda — kim; kim noma'lum bo'lsa asosiy ustoz
  const gapAsosiy = speaking && (!juft || kim !== "iz");
  const gapIkkinchi = speaking && juft && kim === "iz";
  const [ochiq1, setOchiq1] = useState(false);
  const [ochiq2, setOchiq2] = useState(false);
  const ochiq = ochiq1 || (juft && ochiq2);
  const hasPics = pictures.length > 0;
  // REV181: ikki ustozda doska o'ngdagi ustozga joy qoldiradi (o'ng cheti 78% dan oshmaydi) — rasm va yozuv to'silmaydi
  const torDoska = (r) => { const o = Math.min(r.l + r.w, 78); return { ...r, w: Math.max(20, o - r.l) }; };
  const d = xona.doska;
  const box = (r) => ({ left: `${r.l}%`, top: `${r.t}%`, width: `${r.w}%`, height: `${r.h}%` });
  // REV140: deraza shishasi — rasmdan aniq olingan niqob (osmon rom, bayroqcha, gul, parda ustiga chiqmaydi).
  // Kunduzi quyoshli havoda rasmning o'z manzarasi qoladi; boshqa holatlarda manzara ustidan rang beriladi
  // (tong — pushti, kech — shafaq, tun — to'q ko'k) va oy, yulduz, bulut, yomg'ir, qor qo'shiladi.
  const dz = xona.deraza;
  const niqob = xona.osmon ? { WebkitMaskImage: `url(${xona.osmon})`, maskImage: `url(${xona.osmon})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" } : {};
  const chiroqYoniq = vaqt === "kech" || vaqt === "tun";
  const holat = `havo-${havo} vaqt-${vaqt} ${shamol ? "is-windy" : ""}`;
  return <div className={`us-stage vaqt-${vaqt} ${speaking && ochiq ? "is-speaking" : ""} ${juft ? "is-juft" : ""} ${chiroqYoniq ? "is-lamp" : ""} ${derazaga ? "is-deraza" : ""}`} style={{ "--cel": celebrate, "--lx": `${xona.chiroq?.x ?? 50}%` }}>
    <img className="us-bg" src={xona.src} srcSet={`${xona.src} 960w, ${xona.src2x} 1600w`} sizes="(max-width: 900px) 100vw, 900px" alt="" decoding="async" />
    {xona.soat && <DevorSoat soat={xona.soat} />}
    <div className="us-light" aria-hidden="true" />
    {dz && xona.osmon && <div className={`us-tint ${holat}`} style={{ ...box(dz), ...niqob }} aria-hidden="true" />}
    {dz && xona.osmon && <div className={`us-window ${holat} ${xona.bosh ? "is-bosh" : ""}`} style={{ ...box(dz), ...niqob, "--oy-t": `${xona.oy?.t ?? 18}cqh`, "--oy-r": `${xona.oy?.r ?? 20}cqw` }} aria-hidden="true">
      {xona.bosh && <><span className="us-sun" /><span className="us-hills" /></>}
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
    {/* REV158: deraza ustoz turgan tomonda bo'lsa (matematika xonasi — chap chekka), rasm ustozning yuziga tushardi —
        u holda ob-havo rasmi bo'sh doskaning o'rtasida ko'rsatiladi */}
    {dz && derazaga && BELGI[`havo_${havo2}`] && <img className="us-havo-rasm" src={BELGI[`havo_${havo2}`]} alt="" draggable="false" style={havoJoyi(dz, xona.doska)} />}
    <div className="us-lamp-glow" aria-hidden="true" />
    {/* REV121: rasm chiqqanda doska «yaqinlashadi» — telefonda ham rasmlar katta va aniq (ustoz chapda qoladi) */}
    <div className={`us-board ${d.panel ? "is-panel" : ""} ${pictures.length ? "is-zoom" : ""} ${doskaYoq && !pictures.length ? "is-yoq" : ""} n${Math.min(6, pictures.length)} ${pictures.some((x) => x.faol) ? "has-faol" : ""}`} style={pictures.length ? undefined : box(juft ? torDoska(d) : d)}>
      {pictures.map((pic, i) => <button key={`${pic.src || pic.emoji}-${pic.rev || 0}-${i}`} type="button"
        className={`us-pic ${pic.emoji && !pic.src ? `is-emoji sz-${cardSize(pic.emoji)}` : ""} ${pic.holat ? `is-${pic.holat}` : ""} ${pic.faol ? "is-faol" : ""}`} style={{ "--i": i }}
        onClick={() => onTap?.(i)} aria-label={pic.label || "rasm"}>
        {pic.qator ? <span className={`us-qator q${Math.min(pic.qator.length, 12)}`}>{pic.qator.map((x, j) => x.src ? <img key={j} src={x.src} alt="" draggable="false" style={{ "--j": j }} /> : <b key={j}>{x.t}</b>)}</span>
          : pic.src ? <img className={pic.anim ? `an-${pic.anim}` : undefined} src={pic.src} alt="" draggable="false" /> : keycapNumber(pic.emoji) ? <span className="us-emoji kb-num">{keycapNumber(pic.emoji)}</span> : <span className={`us-emoji ${pic.anim ? `an-${pic.anim}` : ""}`}>{pic.emoji}</span>}
        {/* REV156: o'yinda topilgan rasm — yashil ✓ (ptichka) */}
        {(pic.holat === "ok" || pic.holat === "done") && <span className="us-tick" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" /></svg></span>}
      </button>)}
      {children}
    </div>
    {/* REV171: madaniy detallar — bayroq, devordagi rasm, javondagi buyum: bosilsa rasm kabi kattalashib ochiladi */}
    {det.map((x) => <button key={x.k} type="button" className={`us-detal is-${x.k}`} style={{ left: `${x.l}%`, top: `${x.t}%`, width: `${x.w}%`, height: `${x.h}%` }}
      onClick={() => { setDetal(x); onDetal?.(x); }} aria-label={x.matn?.uz || x.k} />)}
    {detal && <button type="button" className="us-detal-pop" onClick={() => setDetal(null)} aria-label="yopish"
      style={{ aspectRatio: `${(detal.w * 1.6) / detal.h}`, backgroundImage: `url(${xona.src2x || xona.src})`,
        backgroundSize: `${10000 / detal.w}% ${10000 / detal.h}%`, backgroundPosition: `${(detal.l / (100 - detal.w)) * 100}% ${(detal.t / (100 - detal.h)) * 100}%` }} />}
    {/* juftda: gapirayotganining og'zi qimirlaydi (avvalgidek), ikkinchisi oddiy turadi — boshqa qo'shimcha harakat yo'q */}
    <UstozFigura ustoz={ustoz} mood={gapIkkinchi ? "" : mood} speaking={gapAsosiy} mouth={mouth} soz={soz} listening={listening} hasPics={hasPics}
      rol={juft ? "til" : ""} jim={gapIkkinchi} bayroq={juft ? bayroqlar?.til || "" : ""} onOchiq={setOchiq1} />
    {juft && <UstozFigura key={`iz-${ikkinchi}`} ustoz={ikkinchi} mood={gapIkkinchi ? mood : ""} speaking={gapIkkinchi} mouth={mouth} soz={soz} listening={false} hasPics={false}
      rol="iz" jim={gapAsosiy} bayroq={bayroqlar?.iz || ""} onOchiq={setOchiq2} />}
  </div>;
}
