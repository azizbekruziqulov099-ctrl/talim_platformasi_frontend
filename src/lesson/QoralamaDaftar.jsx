// REV385: «Qoralama daftar» — misol yechish uchun oq varaq (katakli daftar kabi): tepada savol doim ko'rinib turadi,
// pastda barmoq yoki sichqoncha bilan yoziladi. Qalam rangi va qalinligi, o'chirg'ich, bekor qilish, tozalash.
// Yechib bo'lgach — «Javobni yozish» (pastdagi klaviatura) bilan javob beriladi.
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

const RANGLAR = [["#1d2b3a", "Qora"], ["#1f4fd1", "Ko‘k"], ["#c62828", "Qizil"], ["#1f7a45", "Yashil"]];
const QALINLIK = [[2.5, "Ingichka"], [5, "O‘rtacha"], [9, "Qalin"]];

export default function QoralamaDaftar({ savol = null, chizma = null, onJavob, onYop }) {
  const canvasRef = useRef(null), chiziqlar = useRef([]), joriy = useRef(null);
  const [rang, setRang] = useState(RANGLAR[0][0]);
  const [qalin, setQalin] = useState(QALINLIK[0][0]);
  const [ochir, setOchir] = useState(false);
  const [, yangila] = useState(0);
  const chiz = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"), dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, c.width, c.height);
    for (const l of chiziqlar.current) {
      if (l.n.length < 1) continue;
      ctx.globalCompositeOperation = l.ochir ? "destination-out" : "source-over";
      ctx.strokeStyle = l.rang; ctx.lineWidth = l.ochir ? 22 : l.qalin; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(l.n[0][0], l.n[0][1]);
      for (let i = 1; i < l.n.length - 1; i += 1) { const mx = (l.n[i][0] + l.n[i + 1][0]) / 2, my = (l.n[i][1] + l.n[i + 1][1]) / 2; ctx.quadraticCurveTo(l.n[i][0], l.n[i][1], mx, my); }
      const o = l.n[l.n.length - 1]; ctx.lineTo(o[0], o[1]); ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  };
  useEffect(() => {
    const c = canvasRef.current; if (!c) return undefined;
    const olcham = () => { const r = c.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); chiz(); };
    olcham(); const ro = new ResizeObserver(olcham); ro.observe(c);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const nuqta = (e) => { const r = canvasRef.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const bos = (e) => { e.preventDefault(); canvasRef.current.setPointerCapture?.(e.pointerId); joriy.current = { rang, qalin, ochir, n: [nuqta(e)] }; chiziqlar.current.push(joriy.current); chiz(); };
  const sur = (e) => { if (!joriy.current) return; e.preventDefault(); joriy.current.n.push(nuqta(e)); chiz(); };
  const qoy = () => { if (joriy.current) { joriy.current = null; yangila((x) => x + 1); } };
  const joy = typeof document !== "undefined" ? (document.querySelector(".dx-root") || document.body) : null;
  const oyna = <div className="qd-root" role="dialog" aria-modal="true" aria-label={__kbUi("Qoralama daftar")}>
    <div className="qd-savol">
      <div className="qd-savol-matn">{savol}</div>
      {chizma}
      <button type="button" className="qd-yop" onClick={onYop} aria-label={__kbUi("Yopish")}>✕</button>
    </div>
    <div className="qd-varaq">
      <canvas ref={canvasRef} className="qd-canvas" onPointerDown={bos} onPointerMove={sur} onPointerUp={qoy} onPointerCancel={qoy} onPointerLeave={qoy} />
    </div>
    <div className="qd-asboblar" role="toolbar" aria-label={__kbUi("Qalam")}>
      <div className="qd-guruh">{RANGLAR.map(([r, n]) => <button key={r} type="button" className={`qd-rang ${!ochir && rang === r ? "is-on" : ""}`} style={{ "--r": r }}
        onClick={() => { setRang(r); setOchir(false); }} aria-label={__kbUi(n)} aria-pressed={!ochir && rang === r} />)}</div>
      <div className="qd-guruh">{QALINLIK.map(([q, n]) => <button key={q} type="button" className={`qd-qalin ${!ochir && qalin === q ? "is-on" : ""}`}
        onClick={() => { setQalin(q); setOchir(false); }} aria-label={__kbUi(n)} aria-pressed={!ochir && qalin === q}><i style={{ height: q, background: rang }} /></button>)}</div>
      <div className="qd-guruh">
        <button type="button" className={`qd-t ${ochir ? "is-on" : ""}`} onClick={() => setOchir((x) => !x)} aria-pressed={ochir}>🧽 {__kbUi("O‘chirg‘ich")}</button>
        <button type="button" className="qd-t" disabled={!chiziqlar.current.length} onClick={() => { chiziqlar.current.pop(); chiz(); yangila((x) => x + 1); }}>↶ {__kbUi("Bekor")}</button>
        <button type="button" className="qd-t" disabled={!chiziqlar.current.length} onClick={() => { chiziqlar.current = []; chiz(); yangila((x) => x + 1); }}>🗑 {__kbUi("Tozalash")}</button>
      </div>
      {onJavob && <button type="button" className="qd-javob" onClick={onJavob}>✏️ {__kbUi("Javobni yozish")}</button>}
    </div>
  </div>;
  return joy ? createPortal(oyna, joy) : oyna;
}
