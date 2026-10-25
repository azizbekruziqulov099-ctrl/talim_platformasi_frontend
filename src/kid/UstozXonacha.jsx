import React, { useEffect, useRef, useState } from "react";
import { USTOZLAR, XONALAR } from "./ustozlar.js";
import { GAPIR, PIRPIRAT, XONA, blinkDelay } from "./ustozRules.js";
import "./ustozXonacha.css";

/** REV168: kichik sinfxona — fanning o'z xonasi va o'z ustozi (jonli: nafas oladi, ko'zini pirpiratadi, gapirganda labi qimirlaydi).
 *  Bosh sahifadagi «Bugungi darslar» kartasida va kundalikda ishlatiladi. Og'ir sahna (deraza, ob-havo, soat) yo'q — telefonni qiynamaydi.
 *  ustoz — sardor | nilufar | malika; doska — doskaga yoziladigan qisqa matn (mavzu); gapir — ustoz hozir gapiryaptimi. */
export function xonachaPozasi(ustoz) {
  const t = USTOZLAR[ustoz] || USTOZLAR.nilufar;
  // salom beruvchi poza (2) — yuz kadrlari bo'lsa; aks holda tik turgan (1)
  return t[2]?.yuz ? 2 : 1;
}

export default function UstozXonacha({ ustoz = "nilufar", doska = "", belgi = "", gapir = false, onTap, className = "" }) {
  const t = USTOZLAR[ustoz] || USTOZLAR.nilufar;
  const poza = xonachaPozasi(ustoz);
  const p = t[poza];
  const xona = XONALAR[XONA[ustoz]] || XONALAR.onatili;
  const [kadr, setKadr] = useState(1);
  // REV168: rasm yuklanguncha — tez chiqadigan oddiy xona (devor, pol) va ustoz belgisi; yuklangach chiroyli rasm
  const [bgOk, setBgOk] = useState(false);
  const [bodyOk, setBodyOk] = useState(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  // ko'z pirpiratish
  useEffect(() => {
    if (!p.yuz || gapir) return undefined;
    let t1, t2;
    const loop = () => {
      t1 = setTimeout(() => {
        if (!alive.current) return;
        setKadr(PIRPIRAT);
        t2 = setTimeout(() => { if (alive.current) { setKadr(1); loop(); } }, 150);
      }, blinkDelay());
    };
    loop();
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [p, gapir]);
  // gapirganda lab qimirlaydi (ovoz balandligini bilmaymiz — tekis ritm)
  useEffect(() => {
    if (!p.yuz || !gapir) { setKadr(1); return undefined; }
    let i = 0;
    const id = setInterval(() => { i = (i + 1) % GAPIR.length; setKadr(GAPIR[i]); }, 150);
    return () => { clearInterval(id); setKadr(1); };
  }, [p, gapir]);

  const d = xona.doska;
  return <div className={`ux-room ${gapir ? "is-speaking" : ""} ${bgOk ? "is-bg" : ""} ${className}`} aria-hidden="true">
    <img className="ux-bg" src={xona.src} alt="" decoding="async" loading="lazy" draggable="false" onLoad={() => setBgOk(true)} />
    {(doska || belgi) && <div className={`ux-board ${d.panel ? "is-panel" : ""}`} style={{ left: `${d.l}%`, top: `${d.t}%`, width: `${d.w}%`, height: `${d.h}%` }}>
      {belgi ? <span className="ux-board-ico">{belgi}</span> : null}
      {doska ? <span className="ux-board-txt">{doska}</span> : null}
    </div>}
    {!bodyOk && <span className="ux-ph-teacher">{t.lab === "erkak" ? "👨‍🏫" : "👩‍🏫"}</span>}
    <button type="button" tabIndex={-1} className={`ux-teacher poza-${poza} ${bodyOk ? "is-ok" : ""}`} style={{ aspectRatio: `${p.w} / ${p.h}` }} onClick={onTap}>
      <img className="ux-body" src={p.src} alt="" draggable="false" decoding="async" onLoad={() => setBodyOk(true)} />
      {p.yuz && kadr !== 1 && <img className="ux-face" src={p.yuz.kadr[kadr - 1]} alt="" draggable="false"
        style={{ left: `${p.yuz.x}%`, top: `${p.yuz.y}%`, width: `${p.yuz.w}%`, height: `${p.yuz.h}%` }} />}
    </button>
  </div>;
}
