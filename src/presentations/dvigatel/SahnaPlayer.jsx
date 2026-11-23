import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { dvUrl } from './api.js';

/* Sahna → SVG. Server joylashtirgan qatorlar aynan shu yerda chiziladi, shuning uchun sayt va PowerPoint bir xil.
 * Animatsiyalar: qadam (bosish), trigger (karta/variant bosilganda), giperhavola (reja, nuqtalar, oldinga/orqaga). */

const FONTS = {
  sans: "Calibri, Carlito, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  serif: "Cambria, Caladea, Georgia, 'Times New Roman', serif",
  math: "'Cambria Math', Cambria, Caladea, 'STIX Two Math', 'Times New Roman', serif",
};
FONTS.head = FONTS.sans;
// foydalanuvchi tanlagan shriftlar (sahna.shriftlar: {sans|head: {face, css}}) — shu taqdimot uchun
const FontCtx = createContext(FONTS);

function arrowHead(x1, y1, x2, y2, lw) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const L = Math.max(9, lw * 4.2);
  const W = Math.max(5, lw * 2.6);
  const bx = x2 - Math.cos(a) * L;
  const by = y2 - Math.sin(a) * L;
  const px = -Math.sin(a) * W;
  const py = Math.cos(a) * W;
  return `${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`;
}

function animStyle(a, play) {
  if (!a || !play) return undefined;
  const eff = a.e || 'fade';
  const dir = a.d || (eff === 'fly' ? 'u' : 'l');
  const name = eff === 'wipe' || eff === 'fly' ? `dv-${eff}-${dir}` : `dv-${eff}`;
  return { animation: `${name} ${a.ms || 500}ms cubic-bezier(.2,.7,.2,1) ${a.dl || 0}ms both` };
}

function Matn({ el }) {
  const FONTS = useContext(FontCtx);
  return el.ly.map((q, i) => {
    const first = q.rs[0] || {};
    return <g key={i}>
      {q.bul && <text x={q.bx} y={q.y} fontFamily={FONTS[first.f] || FONTS.sans} fontSize={first.sz} fill={first.c}>{q.bul}</text>}
      <text x={q.x} y={q.y} xmlSpace="preserve" {...(q.w > 24 && q.rs.length ? { textLength: q.w, lengthAdjust: 'spacingAndGlyphs' } : {})}>
        {q.rs.map((r, j) => <tspan key={j} fontFamily={FONTS[r.f] || FONTS.sans} fontSize={r.bl ? r.sz * 0.68 : r.sz} fill={r.c}
          fontWeight={r.b ? 700 : 400} fontStyle={r.i ? 'italic' : 'normal'}
          baselineShift={r.bl === 'sup' ? '42%' : r.bl === 'sub' ? '-22%' : undefined}>{r.t}</tspan>)}
      </text>
    </g>;
  });
}

function Element({ el, apiBase }) {
  const op = el.op ?? 1;
  const fill = el.fill || 'none';
  const stroke = el.line || 'none';
  const sw = el.line ? el.lw || 1 : 0;
  const dash = el.dash === 1 ? `${sw * 4} ${sw * 3}` : el.dash === 2 ? `${sw} ${sw * 2}` : undefined;
  switch (el.k) {
    case 'rect':
      return <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={Math.min(el.r || 0, el.w / 2, el.h / 2)} fill={fill} fillOpacity={op}
        stroke={stroke} strokeOpacity={el.lop ?? 1} strokeWidth={sw} strokeDasharray={dash} filter={el.sh ? 'url(#dv-soya)' : undefined} />;
    case 'ell':
      return <ellipse cx={el.x + el.w / 2} cy={el.y + el.h / 2} rx={el.w / 2} ry={el.h / 2} fill={fill} fillOpacity={op}
        stroke={stroke} strokeWidth={sw} filter={el.sh ? 'url(#dv-soya)' : undefined} />;
    case 'path': {
      const pts = el.pts.map(p => p.join(',')).join(' ');
      return el.z ? <polygon points={pts} fill={fill} fillOpacity={op} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeDasharray={dash} />
        : <polyline points={pts} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} opacity={op} />;
    }
    case 'line': {
      const c = el.line || '#000';
      return <g opacity={el.op ?? 1}>
        <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={c} strokeWidth={el.lw || 1.5} strokeLinecap="round" strokeDasharray={el.dash === 1 ? `${(el.lw || 1.5) * 4} ${(el.lw || 1.5) * 3}` : undefined} />
        {(el.arr === 'end' || el.arr === 'both') && <polygon points={arrowHead(el.x1, el.y1, el.x2, el.y2, el.lw || 1.5)} fill={c} />}
        {(el.arr === 'start' || el.arr === 'both') && <polygon points={arrowHead(el.x2, el.y2, el.x1, el.y1, el.lw || 1.5)} fill={c} />}
      </g>;
    }
    case 'text':
      return <Matn el={el} />;
    case 'img': {
      const src = el.src.startsWith('rasm:') ? dvUrl(apiBase, `/rasm/${encodeURIComponent(el.src.slice(5))}`) : el.src;
      const rasm = <image href={src} x={el.x} y={el.y} width={el.w} height={el.h} preserveAspectRatio={el.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'} />;
      if (el.shakl !== 'doira') return rasm;
      const kesim = `dv-doira-${Math.round(el.x)}-${Math.round(el.y)}-${Math.round(el.w)}`;
      return <g><clipPath id={kesim}><ellipse cx={el.x + el.w / 2} cy={el.y + el.h / 2} rx={el.w / 2} ry={el.h / 2} /></clipPath><g clipPath={`url(#${kesim})`}>{rasm}</g></g>;
    }
    default:
      return null;
  }
}

export function SlaydSvg({ slayd, apiBase, step = 99, triggered, playFrom = -1, onLink, onTrigger, statik = false }) {
  const fon = slayd.fon?.src?.startsWith('fon:') ? dvUrl(apiBase, `/fon/${slayd.fon.src.slice(4)}.jpg`) : null;
  const triggers = useMemo(() => new Set(slayd.els.filter(e => e.a?.tr).map(e => e.a.tr)), [slayd]);
  return <svg viewBox="0 0 1280 720" className="dv-svg" role="img" aria-label="Slayd">
    <defs>
      <filter id="dv-soya" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#000" floodOpacity="0.12" /></filter>
    </defs>
    {fon ? <image href={fon} x="0" y="0" width="1280" height="720" preserveAspectRatio="none" /> : <rect width="1280" height="720" fill={slayd.fon?.rang || '#fff'} />}
    {slayd.els.map(el => {
      const a = el.a;
      let visible = true;
      let play = false;
      if (a && !statik) {
        if (a.tr) { visible = !!triggered?.has(a.tr); play = visible; }
        else { visible = (a.s || 0) <= step; play = visible && (a.s || 0) === playFrom; }
      }
      if (!visible) return null;
      const clickable = el.lnk !== undefined && el.lnk !== null && !statik;
      const isTrigger = triggers.has(el.id) && !statik;
      const handler = clickable ? (ev) => { ev.stopPropagation(); onLink?.(el.lnk); } : isTrigger ? (ev) => { ev.stopPropagation(); onTrigger?.(el.id); } : undefined;
      return <g key={el.id} className={`dv-el${handler ? ' dv-click' : ''}`} style={animStyle(a, play)} onClick={handler}>
        <Element el={el} apiBase={apiBase} />
      </g>;
    })}
  </svg>;
}

export default function SahnaPlayer({ sahna, apiBase, startIndex = 0, joyidaQol = false }) {
  const slides = sahna.slaydlar;
  const [idx, setIdx] = useState(startIndex);
  const [step, setStep] = useState(0);
  const [playFrom, setPlayFrom] = useState(0);
  const [triggered, setTriggered] = useState(() => new Set());
  const [full, setFull] = useState(false);
  const box = useRef(null);
  const slayd = slides[Math.min(idx, slides.length - 1)];

  const go = useCallback((i, atEnd = false) => {
    const n = Math.max(0, Math.min(slides.length - 1, i));
    setIdx(n);
    setTriggered(new Set());
    const qs = slides[n].qadam || 0;
    setStep(atEnd ? qs : 0);
    setPlayFrom(atEnd ? -1 : 0);
  }, [slides]);

  // joyidaQol: dizayn sozlanayotganda sahna yangilansa — o'sha slaydda, hamma qismi ko'ringan holda qoladi
  useEffect(() => { if (joyidaQol) go(Math.min(idx, slides.length - 1), true); else go(0); }, [sahna]); // eslint-disable-line react-hooks/exhaustive-deps
  const fonts = useMemo(() => {
    const f = { ...FONTS };
    Object.entries(sahna.shriftlar || {}).forEach(([k, v]) => { if (v?.css) f[k] = v.css; });
    return f;
  }, [sahna]);

  const next = useCallback(() => {
    if (step < (slayd.qadam || 0)) { setStep(s => s + 1); setPlayFrom(step + 1); }
    else if (idx < slides.length - 1) go(idx + 1);
  }, [step, slayd, idx, slides.length, go]);
  const prev = useCallback(() => {
    if (step > 0) { setStep(s => s - 1); setPlayFrom(-1); }
    else if (idx > 0) go(idx - 1, true);
  }, [step, idx, go]);

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;
      // sozlamalar tugmasida bo'sh joy / Enter — o'sha tugma uchun (slayd almashmasin)
      if (e.target?.closest?.('button, a, [role="tab"]') && !box.current?.contains(e.target)) return;
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(slides.length - 1);
      else if (e.key === 'f' || e.key === 'F') toggleFull();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const onFs = () => setFull((document.fullscreenElement || document.webkitFullscreenElement) === box.current);
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    return () => { document.removeEventListener('fullscreenchange', onFs); document.removeEventListener('webkitfullscreenchange', onFs); };
  }, []);

  // brauzer to'liq ekranni bermasa (iframe, eski Safari) — sahifa ichida butun oynani egallaydi
  const [cssFull, setCssFull] = useState(false);
  function toggleFull() {
    if (!box.current) return;
    if (cssFull) { setCssFull(false); setFull(false); return; }
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      return;
    }
    const el = box.current;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    const zaxira = () => { setCssFull(true); setFull(true); };
    if (!req) return zaxira();
    try {
      const p = req.call(el);
      if (p && p.catch) p.catch(zaxira);
    } catch { zaxira(); }
  }
  useEffect(() => {
    if (!cssFull) return undefined;
    const esc = (e) => { if (e.key === 'Escape') { setCssFull(false); setFull(false); } };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [cssFull]);

  const onLink = (lnk) => {
    if (lnk === 'next') go(idx + 1);
    else if (lnk === 'prev') go(idx - 1);
    else if (Number.isInteger(lnk)) go(lnk);
  };
  const onTrigger = (id) => setTriggered(prevSet => { const s = new Set(prevSet); s.has(id) ? s.delete(id) : s.add(id); return s; });

  return <FontCtx.Provider value={fonts}><div className={`dv-player${full ? ' is-full' : ''}${cssFull ? ' is-css-full' : ''}`} ref={box}>
    <div className="dv-stage" onClick={next} onDoubleClick={(e) => { e.preventDefault(); toggleFull(); }} key={idx}>
      <SlaydSvg slayd={slayd} apiBase={apiBase} step={step} triggered={triggered} playFrom={playFrom} onLink={onLink} onTrigger={onTrigger} />
    </div>
    <div className="dv-bar">
      <button type="button" onClick={prev} aria-label="Oldingi"><ChevronLeft size={18} /></button>
      <span>{idx + 1} / {slides.length}{(slayd.qadam || 0) > 0 && <small> · {step}/{slayd.qadam}</small>}</span>
      <button type="button" onClick={next} aria-label="Keyingi"><ChevronRight size={18} /></button>
      <button type="button" className="dv-full-btn" onClick={toggleFull} aria-label="To‘liq ekran">{full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}{full ? 'Kichraytirish' : 'To‘liq ekran'}</button>
    </div>
    {!full && <div className="dv-thumbs">{slides.map((s, i) => <button type="button" key={i} className={i === idx ? 'is-active' : ''} onClick={() => go(i)} aria-label={`${i + 1}-slayd`}>
      <SlaydSvg slayd={s} apiBase={apiBase} statik /><span>{i + 1}</span>
    </button>)}</div>}
  </div></FontCtx.Provider>;
}
