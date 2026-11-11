// REV400: «Chizma daftari» — imtihon va mashqda yechish uchun erkin yozuv joyi (telefon, planshet, kompyuter).
// Qalam (6 rang, 3 qalinlik, uzuq chiziq), marker, o'chirg'ich (chiziqni butunicha o'chiradi), matn,
// 2D shakllar (chiziq, strelka, to'rtburchak, uchburchaklar, aylana, koordinata o'qlari) va 3D shakllar
// (kub, parallelepiped, silindr, konus, piramida, prizma, shar — orqa qirralari uzuq chiziqda).
// Shakl va yozuvni tanlab surish, burchagidan tortib kattalashtirish; bekor qilish / qaytarish; fon: oq, katak, chiziqli.
// Panelning balandligi tepadagi tutqichdan tortib o'zgartiriladi; ⛶ — butun ekran.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { SHAKLLAR_2D, SHAKLLAR_3D, chegara, olcham, shaklQismlari, sur, tegadimi } from "./chizmaRules.js";
import "./chizmaDaftar.css";

const RANGLAR = ["#1d2b3a", "#1f4fd1", "#c62828", "#1f7a45", "#e67e00", "#7b3fb8"];
const QALIN = [2, 4, 8];
const XOTIRA = new Map();   // savol bo'yicha chizmalar (sahifa yangilanmaguncha saqlanadi)

function Menyu({ nom, ochiq, setOchiq, belgi, sarlavha, children, keng = false, ong = false }) {
  const on = ochiq === nom;
  return <div className={`cd-menyu ${on ? "is-on" : ""}`}>
    <button type="button" className={`cd-t cd-menyu-t ${on ? "is-on" : ""}`} onClick={() => setOchiq(on ? null : nom)} aria-expanded={on} title={sarlavha}>{belgi}<small>▾</small></button>
    {on && <div className={`cd-menyu-ich ${keng ? "is-keng" : ""} ${ong ? "is-ong" : ""}`} role="menu"><b>{sarlavha}</b>{children}</div>}
  </div>;
}

export default function ChizmaDaftar({ kalit = "umumiy", balandlik = 320, onYop, sarlavha = "", savolQatori = true }) {
  const canvasRef = useRef(null), quti = useRef(null);
  const [items, setItems] = useState(() => XOTIRA.get(kalit)?.items || []);
  const [qaytar, setQaytar] = useState([]);
  const [asbob, setAsbob] = useState("qalam");
  const [rang, setRang] = useState(RANGLAR[0]);
  const [qalin, setQalin] = useState(QALIN[0]);
  const [uzuq, setUzuq] = useState(false);
  const [fon, setFon] = useState(() => XOTIRA.get(kalit)?.fon || "katak");
  const [shakllar, setShakllar] = useState(false);
  const [tanlangan, setTanlangan] = useState(-1);
  const [baland, setBaland] = useState(balandlik);
  const [toliq, setToliq] = useState(() => typeof window !== "undefined" && window.matchMedia?.("(max-width: 720px), (pointer: coarse) and (max-height: 820px)").matches);   // REV402: telefonda — butun ekran
  const [pan, setPan] = useState(false);   // REV402: ✋ — yozish to'xtaydi, sahifa suriladi
  const [menyu, setMenyu] = useState(null);       // REV413: ochiq menyu (asbob / rang / shakl / yana)
  const [oyna, setOyna] = useState(false);        // REV413: oyna rejimi — masala varaq ostida xira
  const [savolYigiq, setSavolYigiq] = useState(false);
  // REV492: bir nechta varaq (yangi doska) — hozirgi varaq saqlanib, toza varaq ochiladi; ◀ ▶ bilan almashtiriladi
  const [varaqlar, setVaraqlar] = useState(() => XOTIRA.get(kalit)?.varaqlar || []);
  const [varaqI, setVaraqI] = useState(() => XOTIRA.get(kalit)?.varaqI ?? 0);
  const panRef = useRef(false); panRef.current = pan;
  const joriy = useRef(null);
  const itemsRef = useRef(items); itemsRef.current = items;

  useEffect(() => { XOTIRA.set(kalit, { items, fon, varaqlar, varaqI }); }, [kalit, items, fon, varaqlar, varaqI]);
  const yangila = (fn) => { setItems((old) => { const n = fn(old); if (n !== old) setQaytar([]); return n; }); };

  const chiz = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"), dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, c.width, c.height);
    const hammasi = joriy.current?.item ? [...itemsRef.current, joriy.current.item] : itemsRef.current;
    const rm = joriy.current?.ramka;   // REV492: belgilab o'chirish ramkasi
    if (rm) { ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = "#d9534f"; ctx.lineWidth = 2; ctx.fillStyle = "rgba(217,83,79,.08)";
      ctx.fillRect(Math.min(rm.x0, rm.x1), Math.min(rm.y0, rm.y1), Math.abs(rm.x1 - rm.x0), Math.abs(rm.y1 - rm.y0));
      ctx.strokeRect(Math.min(rm.x0, rm.x1), Math.min(rm.y0, rm.y1), Math.abs(rm.x1 - rm.x0), Math.abs(rm.y1 - rm.y0)); ctx.restore(); }
    for (const it of hammasi) {
      ctx.save(); ctx.strokeStyle = it.r; ctx.fillStyle = it.r; ctx.lineWidth = it.q; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.globalAlpha = it.marker ? 0.35 : 1;
      if (it.t === "yoz") {
        ctx.setLineDash(it.u ? [it.q * 3, it.q * 2.5] : []);
        ctx.beginPath(); ctx.moveTo(it.n[0][0], it.n[0][1]);
        for (let i = 1; i < it.n.length - 1; i += 1) ctx.quadraticCurveTo(it.n[i][0], it.n[i][1], (it.n[i][0] + it.n[i + 1][0]) / 2, (it.n[i][1] + it.n[i + 1][1]) / 2);
        const o = it.n[it.n.length - 1]; ctx.lineTo(o[0], o[1]); ctx.stroke();
      } else if (it.t === "matn") {
        ctx.font = `600 ${it.o}px system-ui, sans-serif`; ctx.textBaseline = "alphabetic"; ctx.fillText(it.m, it.x, it.y);
      } else {
        for (const q of shaklQismlari(it)) {
          ctx.setLineDash(q.yash || it.u ? [6, 5] : []);
          ctx.beginPath();
          if (q.t === "l") { ctx.moveTo(q.a[0], q.a[1]); ctx.lineTo(q.b[0], q.b[1]); } else ctx.ellipse(q.cx, q.cy, Math.max(0.5, q.rx), Math.max(0.5, q.ry), 0, q.a0, q.a1);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    const t = itemsRef.current[tanlangan];
    if (t) { const b = chegara(t); ctx.save(); ctx.strokeStyle = "#3390ec"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.strokeRect(b.x - 6, b.y - 6, b.w + 12, b.h + 12);
      ctx.setLineDash([]); ctx.fillStyle = "#fff"; ctx.fillRect(b.x + b.w - 2, b.y + b.h - 2, 14, 14); ctx.strokeRect(b.x + b.w - 2, b.y + b.h - 2, 14, 14); ctx.restore(); }
  }, [tanlangan]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return undefined;
    // REV402: o'lcham transformsiz (clientWidth) — aylantirilgan (yotiq) darsda ham varaq va barmoq bir joyda
    const o = () => { const dpr = window.devicePixelRatio || 1; c.width = Math.round(c.clientWidth * dpr); c.height = Math.round(c.clientHeight * dpr); chiz(); };
    o(); const ro = new ResizeObserver(o); ro.observe(c);
    // telefon: barmoq varaqda yurganda sahifa qimirlamasin (passiv bo'lmagan tinglovchi)
    const toxta = (e) => { if (!panRef.current) e.preventDefault(); };
    c.addEventListener("touchmove", toxta, { passive: false }); c.addEventListener("touchstart", toxta, { passive: false });
    return () => { ro.disconnect(); c.removeEventListener("touchmove", toxta); c.removeEventListener("touchstart", toxta); };
  }, [chiz]);
  useEffect(() => { chiz(); }, [items, chiz]);

  // REV402: element ichidagi koordinata (offsetX) — sahifa aylantirilgan yoki surilgan bo'lsa ham to'g'ri
  const nuqta = (e) => (Number.isFinite(e.nativeEvent?.offsetX) ? [e.nativeEvent.offsetX, e.nativeEvent.offsetY]
    : (() => { const r = canvasRef.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; })());
  const bos = (e) => {
    if (pan) return;
    e.preventDefault(); canvasRef.current.setPointerCapture?.(e.pointerId);
    const p = nuqta(e);
    if (asbob === "ramka") { joriy.current = { ramka: { x0: p[0], y0: p[1], x1: p[0], y1: p[1] } }; chiz(); return; }   // REV492
    if (asbob === "ochir") { joriy.current = { ochir: true }; yangila((old) => { const n = old.filter((it) => !tegadimi(it, p, 10)); return n.length === old.length ? old : n; }); return; }
    if (asbob === "tanla") {
      const t = itemsRef.current[tanlangan];
      if (t) { const b = chegara(t); if (p[0] >= b.x + b.w - 6 && p[0] <= b.x + b.w + 16 && p[1] >= b.y + b.h - 6 && p[1] <= b.y + b.h + 16) { joriy.current = { olcham: true, b, asl: t, p0: p }; return; } }
      const i = [...itemsRef.current].map((it, k) => [it, k]).reverse().find(([it]) => tegadimi(it, p, 12))?.[1] ?? -1;
      setTanlangan(i); if (i >= 0) joriy.current = { sur: true, p0: p, asl: itemsRef.current[i] }; return;
    }
    if (asbob === "matn") {
      const m = window.prompt(__kbUi("Yozuv (masalan: a = 5 sm)"));
      if (m && m.trim()) { const o = 12 + qalin * 3; yangila((old) => [...old, { t: "matn", m: m.trim().slice(0, 80), x: p[0], y: p[1], o, w: m.trim().length * o * 0.6, h: o, r: rang, q: 1 }]); }
      return;
    }
    if (asbob === "qalam" || asbob === "marker") { joriy.current = { item: { t: "yoz", n: [p], r: rang, q: asbob === "marker" ? 16 : qalin, u: uzuq && asbob === "qalam", marker: asbob === "marker" } }; chiz(); return; }
    joriy.current = { item: { t: "shakl", kind: asbob, x: p[0], y: p[1], w: 0, h: 0, r: rang, q: qalin, u: uzuq } };
  };
  const harakat = (e) => {
    const j = joriy.current; if (!j) return; e.preventDefault(); const p = nuqta(e);
    if (j.ramka) { j.ramka.x1 = p[0]; j.ramka.y1 = p[1]; chiz(); return; }
    if (j.ochir) { yangila((old) => { const n = old.filter((it) => !tegadimi(it, p, 10)); return n.length === old.length ? old : n; }); return; }
    if (j.sur) { const dx = p[0] - j.p0[0], dy = p[1] - j.p0[1]; setItems((old) => old.map((it, k) => (k === tanlangan ? sur(j.asl, dx, dy) : it))); return; }
    if (j.olcham) { setItems((old) => old.map((it, k) => (k === tanlangan ? olcham(j.asl, j.b, p[0] - j.b.x, p[1] - j.b.y) : it))); return; }
    if (j.item?.t === "yoz") j.item.n.push(p); else if (j.item) { j.item.w = p[0] - j.item.x; j.item.h = p[1] - j.item.y; }
    chiz();
  };
  const qoy = () => {
    const j = joriy.current; joriy.current = null;
    if (j?.ramka) {   // REV492: ramka ichiga tushgan hamma narsa o'chadi (↷ bilan qaytariladi)
      const r = j.ramka, x0 = Math.min(r.x0, r.x1), x1 = Math.max(r.x0, r.x1), y0 = Math.min(r.y0, r.y1), y1 = Math.max(r.y0, r.y1);
      if (x1 - x0 > 6 && y1 - y0 > 6) {
        const ichida = (it) => { const b = chegara(it); return b.x < x1 && b.x + b.w > x0 && b.y < y1 && b.y + b.h > y0; };
        const ketdi = itemsRef.current.filter(ichida);
        if (ketdi.length) { setItems((old) => old.filter((it) => !ichida(it))); setQaytar((q) => [...q, ...ketdi]); setTanlangan(-1); }
      }
      chiz(); return;
    }
    if (!j?.item) return;
    const it = j.item;
    if (it.t === "shakl" && Math.abs(it.w) < 8 && Math.abs(it.h) < 8) { it.w = 120; it.h = it.kind === "chiziq" || it.kind === "strelka" ? 0 : 100; }
    yangila((old) => [...old, it]);
  };
  const bekor = () => setItems((old) => { if (!old.length) return old; setQaytar((q) => [...q, old[old.length - 1]]); setTanlangan(-1); return old.slice(0, -1); });
  const qayta = () => setQaytar((q) => { if (!q.length) return q; setItems((old) => [...old, q[q.length - 1]]); return q.slice(0, -1); });
  const tozala = () => { if (!itemsRef.current.length) return; if (window.confirm(__kbUi("Doska tozalansinmi?"))) { setQaytar([]); setItems([]); setTanlangan(-1); } };
  const yangiVaraq = () => {   // hozirgisi saqlanadi, oxiriga toza varaq qo'shiladi
    const v = [...varaqlar]; v[varaqI] = itemsRef.current; v.push([]);
    setVaraqlar(v); setVaraqI(v.length - 1); setItems([]); setQaytar([]); setTanlangan(-1);
  };
  const varaqgaOt = (k) => {
    const v = [...varaqlar]; v[varaqI] = itemsRef.current;
    if (k < 0 || k >= Math.max(v.length, 1)) return;
    setVaraqlar(v); setVaraqI(k); setItems(v[k] || []); setQaytar([]); setTanlangan(-1);
  };
  const saqla = () => {   // rasm (PNG) — oq fon bilan, telefon galereyasiga yoki kompyuterga yuklab olinadi
    const c = canvasRef.current; if (!c) return;
    const t = document.createElement("canvas"); t.width = c.width; t.height = c.height;
    const ctx = t.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, t.width, t.height); ctx.drawImage(c, 0, 0);
    const a = document.createElement("a"); a.download = `qoralama-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.png`; a.href = t.toDataURL("image/png"); a.click();
  };
  const tanlanganniOchir = () => { if (tanlangan < 0) return; yangila((old) => old.filter((_, k) => k !== tanlangan)); setTanlangan(-1); };

  // panel balandligi — tepadagi tutqich
  const tutqich = (e) => {
    e.preventDefault(); const y0 = e.clientY, b0 = baland;
    const m = (ev) => setBaland(Math.max(180, Math.min(window.innerHeight - 80, b0 + (y0 - ev.clientY))));
    const u = () => { window.removeEventListener("pointermove", m); window.removeEventListener("pointerup", u); };
    window.addEventListener("pointermove", m); window.addEventListener("pointerup", u);
  };
  useEffect(() => {
    const k = (e) => { if (!quti.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) qayta(); else bekor(); }
      if ((e.key === "Delete" || e.key === "Backspace") && tanlangan >= 0 && asbob === "tanla") { e.preventDefault(); tanlanganniOchir(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });

  const AsbobT = ({ k, belgi, nom }) => <button type="button" className={`cd-t ${asbob === k ? "is-on" : ""}`} onClick={() => { setAsbob(k); setShakllar(false); if (k !== "tanla") setTanlangan(-1); }} title={__kbUi(nom)} aria-label={__kbUi(nom)} aria-pressed={asbob === k}>{belgi}</button>;
  const shaklTanlangan = [...SHAKLLAR_2D, ...SHAKLLAR_3D].find(([k]) => k === asbob);
  return <div ref={quti} className={`cd-root ${toliq ? "is-toliq" : ""}`} style={toliq ? undefined : { height: baland }} tabIndex={-1}>
    {!toliq && <div className="cd-tutqich" onPointerDown={tutqich} title={__kbUi("Tortib kattalashtiring")} aria-label={__kbUi("Daftar balandligi")} role="separator"><i /></div>}
    {/* REV413: ixcham asboblar — har guruh o'z menyusida; doim ko'rinadiganlar: asbob, rang, shakl, bekor, qaytar, ⋯ */}
    <div className="cd-asboblar cd-ixcham" role="toolbar" aria-label={__kbUi("Chizma asboblari")}>
      <Menyu nom="asbob" ochiq={menyu} setOchiq={setMenyu} belgi={{ qalam: "✏️", marker: "🖍️", ochir: "🧽", ramka: "✂️", tanla: "👆", matn: "T" }[asbob] || "✏️"} sarlavha={__kbUi("Asbob")}>
        {[["qalam", "✏️", "Qalam"], ["marker", "🖍️", "Marker"], ["ochir", "🧽", "O‘chirg‘ich"], ["ramka", "✂️", "Belgilab o‘chirish"], ["tanla", "👆", "Tanlash va surish"], ["matn", "T", "Yozuv qo‘yish"]].map(([k, b2, n]) =>
          <button key={k} type="button" className={asbob === k ? "is-on" : ""} onClick={() => { setAsbob(k); setMenyu(null); if (k !== "tanla") setTanlangan(-1); }}><span>{b2}</span>{__kbUi(n)}</button>)}
      </Menyu>
      <Menyu nom="rang" ochiq={menyu} setOchiq={setMenyu} belgi={<i className="cd-rang-belgi" style={{ background: rang }} />} sarlavha={__kbUi("Rang va qalinlik")}>
        <div className="cd-qator">{RANGLAR.map((r) => <button key={r} type="button" className={`cd-rang ${rang === r ? "is-on" : ""}`} style={{ "--r": r }} onClick={() => setRang(r)} aria-label={r} />)}</div>
        <div className="cd-qator">{QALIN.map((q) => <button key={q} type="button" className={`cd-t cd-qalin ${qalin === q ? "is-on" : ""}`} onClick={() => setQalin(q)} aria-label={`${q}px`}><i style={{ height: q, background: rang }} /></button>)}
          <button type="button" className={`cd-t ${uzuq ? "is-on" : ""}`} onClick={() => setUzuq((x) => !x)} title={__kbUi("Uzuq chiziq")}>┄</button></div>
      </Menyu>
      <Menyu nom="shakl" ochiq={menyu} setOchiq={setMenyu} belgi={shaklTanlangan ? shaklTanlangan[1] : "△"} sarlavha={__kbUi("Shakllar")} keng>
        <small>{__kbUi("Tekis shakllar")}</small>
        <div className="cd-panjara">{SHAKLLAR_2D.map(([k, b2, n]) => <button key={k} type="button" className={asbob === k ? "is-on" : ""} onClick={() => { setAsbob(k); setMenyu(null); setTanlangan(-1); }}><span>{b2}</span>{__kbUi(n)}</button>)}</div>
        <small>{__kbUi("Fazoviy (3D) shakllar")}</small>
        <div className="cd-panjara">{SHAKLLAR_3D.map(([k, b2, n]) => <button key={k} type="button" className={asbob === k ? "is-on" : ""} onClick={() => { setAsbob(k); setMenyu(null); setTanlangan(-1); }}><span>{b2}</span>{__kbUi(n)}</button>)}</div>
      </Menyu>
      {/* REV492: eng kerakli amallar doim ko'rinadi (menyuga yashirinmaydi) */}
      <button type="button" className={`cd-t ${asbob === "ochir" ? "is-on" : ""}`} onClick={() => { setAsbob(asbob === "ochir" ? "qalam" : "ochir"); setMenyu(null); }} title={__kbUi("O‘chirg‘ich")}>🧽</button>
      <button type="button" className={`cd-t ${asbob === "ramka" ? "is-on" : ""}`} onClick={() => { setAsbob(asbob === "ramka" ? "qalam" : "ramka"); setMenyu(null); setTanlangan(-1); }} title={__kbUi("Belgilab o‘chirish — ramka chizing")}>✂️</button>
      <button type="button" className="cd-t" onClick={tozala} disabled={!items.length} title={__kbUi("Hammasini o‘chirish")}>🗑</button>
      <button type="button" className="cd-t" onClick={bekor} disabled={!items.length} title={__kbUi("Bekor qilish (Ctrl+Z)")}>↶</button>
      <button type="button" className="cd-t" onClick={qayta} disabled={!qaytar.length} title={__kbUi("Qaytarish")}>↷</button>
      {asbob === "tanla" && tanlangan >= 0 && <button type="button" className="cd-t" onClick={tanlanganniOchir} title={__kbUi("Tanlanganni o‘chirish")}>🗑</button>}
      <span className="cd-bosh-joy" />
      {varaqlar.length > 1 && <span className="cd-varaqlar"><button type="button" className="cd-t" disabled={varaqI <= 0} onClick={() => varaqgaOt(varaqI - 1)} title={__kbUi("Oldingi varaq")}>◀</button>
        <small>{varaqI + 1}/{varaqlar.length}</small><button type="button" className="cd-t" disabled={varaqI >= varaqlar.length - 1} onClick={() => varaqgaOt(varaqI + 1)} title={__kbUi("Keyingi varaq")}>▶</button></span>}
      <button type="button" className="cd-t" onClick={yangiVaraq} title={__kbUi("Yangi doska (hozirgisi saqlanadi)")}>📄</button>
      <button type="button" className="cd-t" onClick={saqla} disabled={!items.length} title={__kbUi("Rasm qilib saqlash")}>💾</button>
      {sarlavha && <button type="button" className={`cd-t ${oyna ? "is-on" : ""}`} onClick={() => setOyna((x) => !x)} title={__kbUi("Oyna rejimi — masala varaq ostida xira ko‘rinadi, ustidan yozasiz")}>🪟</button>}
      <Menyu nom="yana" ochiq={menyu} setOchiq={setMenyu} belgi="⋯" sarlavha={__kbUi("Yana")} ong>
        <label className="cd-qator">{__kbUi("Varaq")}: <select className="cd-fon" value={fon} onChange={(e) => setFon(e.target.value)}>
          <option value="katak">{__kbUi("Katak")}</option><option value="chiziq">{__kbUi("Chiziqli")}</option><option value="oq">{__kbUi("Oq")}</option></select></label>
        {!toliq && <button type="button" className={pan ? "is-on" : ""} onClick={() => { setPan((x) => !x); setMenyu(null); }}><span>✋</span>{__kbUi("Sahifani surish (yozish to‘xtaydi)")}</button>}
        <button type="button" onClick={() => { setToliq((x) => !x); setMenyu(null); }}><span>{toliq ? "🗗" : "⛶"}</span>{toliq ? __kbUi("Kichraytirish") : __kbUi("Butun ekran")}</button>
        <button type="button" disabled={!items.length} onClick={() => { if (window.confirm(__kbUi("Daftar tozalansinmi?"))) { setQaytar([]); setItems([]); setTanlangan(-1); } setMenyu(null); }}><span>⌫</span>{__kbUi("Hammasini tozalash")}</button>
      </Menyu>
      {onYop && <button type="button" className="cd-t" onClick={onYop} title={__kbUi("Yopish")}>✕</button>}
    </div>
    {sarlavha && !oyna && savolQatori && <div className={`cd-sarlavha ${savolYigiq ? "is-yigiq" : ""}`} onClick={() => setSavolYigiq((x) => !x)} title={__kbUi("Bosib yig‘ish / ochish")}>{sarlavha}</div>}
    <div className={`cd-holat ${pan ? "is-pan" : ""}`} aria-live="polite">{pan ? __kbUi("✋ Surish rejimi — sahifani barmoq bilan suring. Yozish uchun ⋯ → ✋ ni qayta bosing.")
      : asbob === "ramka" ? __kbUi("✂️ Belgilab o‘chirish — o‘chiriladigan joyni ramkaga oling (↷ bilan qaytariladi)")
      : asbob === "ochir" ? __kbUi("🧽 O‘chirg‘ich — o‘chirmoqchi bo‘lgan chiziq ustidan yuring") : asbob === "tanla" ? __kbUi("👆 Tanlash — shaklni bosib suring, burchagidagi ◻ dan tortib kattalashtiring")
      : shaklTanlangan ? __kbUi(`${shaklTanlangan[1]} Varaqda tortib chizing`) : oyna ? __kbUi("🪟 Oyna rejimi — masala varaq ostida, ustidan yozing") : __kbUi("✏️ Yozish rejimi — sahifa qimirlamaydi")}</div>
    <div className="cd-varaq-quti">
      {oyna && sarlavha && <div className="cd-oyna-matn" aria-hidden="true">{sarlavha}</div>}
    <canvas ref={canvasRef} className={`cd-varaq is-${fon} is-asbob-${asbob} ${pan ? "is-pan" : ""} ${oyna ? "is-oyna" : ""}`} onPointerDown={bos} onPointerMove={harakat} onPointerUp={qoy} onPointerCancel={qoy} />
    </div>
  </div>;
}
