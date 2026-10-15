import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RASMLAR } from "../xonalar/rasmlar.js";
import { soz, teg, gap } from "../xonalar/xonaRules.js";
import { daraja, jonliMatn, jonliYulduz, urugli } from "./jonliRules.js";
import { chime, pop, soft } from "../kidSounds.js";
import { uiText as T } from "../../interface/interfaceRuntime.js";
import "./jonli.css";

const Pic = ({ id, className = "", style }) => (RASMLAR[id]
  ? <img className={`jo-pic ${className}`} style={style} src={RASMLAR[id]} alt="" draggable="false" />
  : <span className={`jo-pic ${className}`} style={style} aria-hidden="true">⭐</span>);
const aralash = (arr, rnd = Math.random) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/**
 * REV148: bitta «jonli» bosqich. Sahna doim harakatda (narsalar tushadi, suzadi, pufaklar ko'tariladi, chayqaladi) —
 * bola barmog'i bilan ushlaydi, yoradi, olib boradi, aylantiradi, artadi, bosib turadi. Har topilgan narsaning nomi
 * o'rganilayotgan tilda aytiladi. onYakun(yulduz) — bosqich tugaganda.
 */
export default function JonliOyin({ n, til = "en", izoh = "uz", ayt, onYakun, onChiq }) {
  const d = useMemo(() => daraja(n, (id) => Boolean(RASMLAR[id])), [n]);
  const [raund, setRaund] = useState(0);
  const [xato, setXato] = useState(0);
  const [tamom, setTamom] = useState(null);
  const xatoRef = useRef(0);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  const say = useCallback((text, done) => (ayt ? ayt(text, done) : done?.()), [ayt]);
  const nom = (id) => teg(soz(id, til), til);

  useEffect(() => { say(`${jonliMatn(d.tur, "k", izoh)}`); }, [d.n]); // eslint-disable-line react-hooks/exhaustive-deps

  const xatoQil = () => { xatoRef.current += 1; setXato(xatoRef.current); soft(); };
  // ovoz tugashini kutadi, lekin ovoz kelmasa yoki boshqa gap uni to'xtatsa ham o'yin qotib qolmaydi (zaxira taymer)
  const keyin = (text, fn, ms = 3200) => {
    let bir = false;
    const ishla = () => { if (bir || !alive.current) return; bir = true; fn(); };
    say(text, ishla);
    setTimeout(ishla, ms);
  };
  const raundOk = (id) => {
    chime();
    keyin(`${teg(gap("barakalla", til), til)} ${id ? nom(id) : ""}`, () => {
      if (raund + 1 >= d.raund) { const y = jonliYulduz(xatoRef.current); setTamom(y); onYakun?.(y); }
      else setRaund((r) => r + 1);
    });
  };
  // har raund uchun alohida narsalar (bosqich narsalaridan navbat bilan)
  const raundSozlar = (k) => { const s = d.sozlar; const out = []; for (let i = 0; i < k; i += 1) out.push(s[(raund * k + i) % s.length]); return out; };

  const props = { d, raund, til, izoh, say, keyin, nom, raundOk, xatoQil, raundSozlar, key: `${d.n}-${raund}` };
  const Oyin = { ushla: Ushla, yarim: Tanlov, soya: Tanlov, qutiga: Qutiga, pufak: Pufak, aylantir: Aylantir, tozala: Tozala, kattalashtir: Kattalashtir }[d.tur];
  return <div className={`jo-oyin jo-oyin--${d.tur}`}>
    <div className="jo-bar">
      <button type="button" className="jo-back" onClick={onChiq} aria-label={T("Orqaga")}>⬅️</button>
      <b><span aria-hidden="true">{d.emoji}</span> {jonliMatn(d.tur, "nom", izoh)} · {d.n + 1}</b>
      <span className="jo-hisob">{d.tur !== "ushla" ? `${Math.min(raund + 1, d.raund)}/${d.raund} · ` : ""}{"❌".repeat(Math.min(3, xato))}</span>
    </div>
    {tamom ? <div className="jo-tamom" role="status">
      <span aria-hidden="true">🎉</span>
      <b>{[1, 2, 3].map((k) => (k <= tamom ? "⭐" : "☆")).join("")}</b>
    </div> : <Oyin {...props} />}
    <p className="jo-korsatma">{jonliMatn(d.tur, "k", izoh)}</p>
  </div>;
}

/* ── 1. Ushla: narsalar tepadan chayqalib tushadi, bola bosib ushlaydi ── */
function Ushla({ d, say, nom, raundOk, xatoQil }) {
  const ids = useMemo(() => Array.from({ length: d.ushlaSoni }, (_, i) => d.sozlar[i % d.sozlar.length]), [d]);
  const [tush, setTush] = useState([]);         // {k, id, x, t0, dur}
  const [ushlangan, setUshlangan] = useState([]);
  const navbat = useRef(0);
  const [, setTick] = useState(0);
  const tushRef = useRef(tush);
  tushRef.current = tush;
  const ushRef = useRef(0);
  useEffect(() => {
    let raf = 0;
    const rnd = urugli(d.n + 3);
    const chiqar = () => {
      const i = navbat.current;
      if (i >= ids.length) return;
      navbat.current += 1;
      setTush((t) => [...t, { k: `${i}-${Date.now()}`, id: ids[i], x: 12 + rnd() * 76, t0: performance.now(), dur: d.tushish }]);
    };
    chiqar();
    const iv = setInterval(() => { if (tushRef.current.length < 2) chiqar(); }, Math.max(900, d.tushish * 0.55));
    const loop = (now) => {
      // pastga yetganlar — qaytadan yuqoridan (bola baribir ushlaydi, o'yin to'xtamaydi)
      const yetdi = tushRef.current.filter((f) => now - f.t0 > f.dur);
      if (yetdi.length) { for (const f of yetdi) { f.t0 = now; f.x = 12 + Math.random() * 76; } xatoQil(); setTush((t) => [...t]); }
      setTick((v) => (v + 1) % 1e6);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); clearInterval(iv); };
  }, [ids, d]); // eslint-disable-line react-hooks/exhaustive-deps
  const ush = (f) => {
    pop();
    setTush((t) => t.filter((v) => v.k !== f.k));
    setUshlangan((u) => [...u, f.id]);
    ushRef.current += 1;
    if (ushRef.current >= ids.length) raundOk(null);
    else say(nom(f.id));
  };
  const now = performance.now();
  return <div className="jo-sahna jo-sahna--osmon">
    {tush.map((f) => {
      const p = Math.min(1, (now - f.t0) / f.dur);
      return <button key={f.k} type="button" className="jo-tushuvchi" style={{ left: `${f.x}%`, top: `${-14 + p * 96}%` }}
        onPointerDown={() => ush(f)} aria-label={soz(f.id, "en")}><Pic id={f.id} className="jo-chayqal" /></button>;
    })}
    <div className="jo-savat" aria-hidden="true"><span>🧺</span>{ushlangan.slice(-6).map((id, i) => <Pic key={`${id}-${i}`} id={id} className="jo-savat-pic" />)}</div>
    <div className="jo-sanoq">{ushlangan.length}/{ids.length}</div>
  </div>;
}

/* ── 2–3. Tanlov: yarim yashiringan (yarim) yoki soyasi (soya) — to'g'ri rasmni bos ── */
function Tanlov({ d, til, say, keyin, nom, raundOk, xatoQil, raundSozlar }) {
  const [javob, ...boshqa] = useMemo(() => raundSozlar(d.variant), []); // eslint-disable-line react-hooks/exhaustive-deps
  const variantlar = useMemo(() => aralash([javob, ...boshqa]), [javob]); // eslint-disable-line react-hooks/exhaustive-deps
  const [ochildi, setOchildi] = useState(false);
  const [notogri, setNotogri] = useState(null);
  const urinish = useRef(0);
  useEffect(() => { const t = setTimeout(() => say(teg(gap("bunima", til), til)), 400); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const tanla = (id) => {
    if (ochildi) return;
    if (id === javob) { setOchildi(true); raundOk(javob); return; }
    urinish.current += 1; xatoQil(); setNotogri({ id, k: Date.now() }); say(`${nom(id)}? ${teg(gap("yana", til), til)}`);
    if (urinish.current >= 2) { setOchildi(true); keyin(teg(gap("mana", til, soz(javob, til)), til), () => raundOk(null)); }
  };
  return <div className="jo-sahna jo-sahna--tanlov">
    <div className={`jo-sir jo-sir--${d.tur} ${ochildi ? "is-ochiq" : ""}`}>
      <Pic id={javob} className={d.tur === "soya" && !ochildi ? "is-soya" : ""} />
      {d.tur === "yarim" && <span className="jo-buta" aria-hidden="true" />}
    </div>
    <div className={`jo-variantlar n${variantlar.length}`}>
      {variantlar.map((id) => <button key={`${id}-${notogri?.id === id ? notogri.k : 0}`} type="button"
        className={`jo-variant ${notogri?.id === id ? "is-xato" : ""} ${ochildi && id === javob ? "is-togri" : ""}`}
        onClick={() => tanla(id)} aria-label={soz(id, "en")}><Pic id={id} /></button>)}
    </div>
  </div>;
}

/* ── 4. Qutiga sol: aytilgan narsani ushlab, qutiga olib borish ── */
function Qutiga({ d, til, say, nom, raundOk, xatoQil, raundSozlar }) {
  const [javob, ...boshqa] = useMemo(() => raundSozlar(d.variant), []); // eslint-disable-line react-hooks/exhaustive-deps
  const narsalar = useMemo(() => aralash([javob, ...boshqa]), [javob]); // eslint-disable-line react-hooks/exhaustive-deps
  const [sudra, setSudra] = useState(null);      // {id, dx, dy}
  const [qaytdi, setQaytdi] = useState(null);
  const [tushdi, setTushdi] = useState(false);
  const quti = useRef(null);
  const bosh = useRef(null);
  const sora = () => say(teg(gap("korsat", til, soz(javob, til)), til));
  useEffect(() => { const t = setTimeout(sora, 400); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const down = (e, id) => { if (tushdi) return; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* */ } bosh.current = { x: e.clientX, y: e.clientY }; setSudra({ id, dx: 0, dy: 0 }); };
  const move = (e) => { if (!sudra || !bosh.current) return; setSudra((s) => ({ ...s, dx: e.clientX - bosh.current.x, dy: e.clientY - bosh.current.y })); };
  const up = (e) => {
    if (!sudra) return;
    const r = quti.current?.getBoundingClientRect();
    const ichida = r && e.clientX > r.left - 20 && e.clientX < r.right + 20 && e.clientY > r.top - 30 && e.clientY < r.bottom + 20;
    const id = sudra.id;
    setSudra(null); bosh.current = null;
    if (!ichida) return;
    if (id === javob) { setTushdi(true); pop(); raundOk(javob); }
    else { xatoQil(); setQaytdi({ id, k: Date.now() }); say(`${nom(id)}? ${teg(gap("yana", til), til)}`, sora); }
  };
  return <div className="jo-sahna jo-sahna--qutiga" onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
    <div className="jo-narsalar">
      {narsalar.map((id, i) => (tushdi && id === javob ? null : <button key={`${id}-${qaytdi?.id === id ? qaytdi.k : 0}`} type="button"
        className={`jo-sudra ${sudra?.id === id ? "is-sudra" : "jo-suz"} ${qaytdi?.id === id ? "is-xato" : ""}`} style={{ "--i": i, transform: sudra?.id === id ? `translate(${sudra.dx}px, ${sudra.dy}px) scale(1.08)` : undefined, touchAction: "none" }}
        onPointerDown={(e) => down(e, id)} aria-label={soz(id, "en")}><Pic id={id} /></button>))}
    </div>
    <div ref={quti} className={`jo-quti ${tushdi ? "is-tushdi" : ""} ${sudra ? "is-kut" : ""}`} aria-hidden="true">
      {tushdi && <Pic id={javob} className="jo-quti-pic" />}<span>📦</span>
    </div>
  </div>;
}

/* ── 5. Pufaklar: narsalar pufak ichida ko'tariladi — aytilganini yor ── */
function Pufak({ d, til, say, nom, raundOk, xatoQil, raundSozlar }) {
  const [javob, ...boshqa] = useMemo(() => raundSozlar(d.variant + 1), []); // eslint-disable-line react-hooks/exhaustive-deps
  // manfiy kechikish — pufaklar o'yin boshlanishi bilan ekranning turli balandligida turadi (pastdan kutib o'tirilmaydi)
  const pufaklar = useMemo(() => aralash([javob, ...boshqa]).map((id, i, a) => ({ id, x: 10 + (i * 80) / Math.max(1, a.length - 1), kech: -((d.pufakTezlik / 1000) * (0.25 + (0.5 * i) / a.length)) })), [javob]); // eslint-disable-line react-hooks/exhaustive-deps
  const [yorildi, setYorildi] = useState([]);
  const [silk, setSilk] = useState(null);
  const sora = () => say(teg(gap("korsat", til, soz(javob, til)), til));
  useEffect(() => { const t = setTimeout(sora, 300); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const bos = (id) => {
    if (yorildi.includes(javob)) return;
    if (id === javob) { pop(); setYorildi((y) => [...y, id]); raundOk(javob); }
    else { xatoQil(); setSilk({ id, k: Date.now() }); say(`${nom(id)}? ${teg(gap("yana", til), til)}`, sora); }
  };
  return <div className="jo-sahna jo-sahna--suv">
    {pufaklar.map((p) => <button key={`${p.id}-${silk?.id === p.id ? silk.k : 0}`} type="button"
      className={`jo-pufak ${yorildi.includes(p.id) ? "is-yorildi" : ""} ${silk?.id === p.id ? "is-xato" : ""}`}
      style={{ left: `${p.x}%`, "--dur": `${d.pufakTezlik}ms`, "--kech": `${p.kech}s` }} onPointerDown={() => bos(p.id)} aria-label={soz(p.id, "en")}>
      <Pic id={p.id} />
    </button>)}
  </div>;
}

/* ── 6. Aylantir: rasm teskari — barmoq bilan aylantirib to'g'rilash ── */
function Aylantir({ d, raund, til, say, raundOk, raundSozlar }) {
  const [id] = useMemo(() => raundSozlar(1), []); // eslint-disable-line react-hooks/exhaustive-deps
  const bosh = useMemo(() => (raund % 2 ? -1 : 1) * d.burchak, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [burchak, setBurchak] = useState(bosh);
  const [tayyor, setTayyor] = useState(false);
  const quti = useRef(null);
  const oldingi = useRef(null);
  const bitdi = useRef(false);
  useEffect(() => { const t = setTimeout(() => say(teg(gap("bunima", til), til)), 300); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const markazdan = (e) => { const r = quti.current.getBoundingClientRect(); return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI; };
  const down = (e) => { if (tayyor) return; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* */ } oldingi.current = markazdan(e); };
  const move = (e) => {
    if (oldingi.current == null || tayyor) return;
    const a = markazdan(e);
    let dd = a - oldingi.current;
    if (dd > 180) dd -= 360; if (dd < -180) dd += 360;
    oldingi.current = a;
    setBurchak((b) => {
      const nb = b + dd;
      const qoldiq = ((nb % 360) + 540) % 360 - 180;
      if (Math.abs(qoldiq) < 14 && Math.abs(nb - bosh) > 40 && !bitdi.current) { bitdi.current = true; setTayyor(true); oldingi.current = null; setTimeout(() => raundOk(id), 250); return nb - qoldiq; }
      return nb;
    });
  };
  const up = () => { oldingi.current = null; };
  return <div ref={quti} className="jo-sahna jo-sahna--aylantir" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ touchAction: "none" }}>
    <div className={`jo-gildirak ${tayyor ? "is-tayyor" : ""}`} style={{ transform: `rotate(${burchak}deg)` }}><Pic id={id} /></div>
    {!tayyor && <span className="jo-aylana-qol" aria-hidden="true">🔄</span>}
  </div>;
}

/* ── 7. Tozala: rasm ustidagi loyni barmoq bilan artish ── */
function Tozala({ d, til, say, raundOk, raundSozlar }) {
  const [id] = useMemo(() => raundSozlar(1), []); // eslint-disable-line react-hooks/exhaustive-deps
  const canvas = useRef(null);
  const [tayyor, setTayyor] = useState(false);
  const bosildi = useRef(false);
  const sanoq = useRef(0);
  useEffect(() => {
    const c = canvas.current;
    if (!c?.getContext) return;
    const r = c.getBoundingClientRect();
    c.width = Math.max(1, Math.round(r.width)); c.height = Math.max(1, Math.round(r.height));
    const g = c.getContext("2d");
    if (!g) return;
    const gr = g.createLinearGradient(0, 0, c.width, c.height);
    gr.addColorStop(0, "#8d6e4f"); gr.addColorStop(1, "#6f5238");
    g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "rgba(255,255,255,.12)";
    for (let i = 0; i < 40; i += 1) { g.beginPath(); g.arc(Math.random() * c.width, Math.random() * c.height, 6 + Math.random() * 18, 0, Math.PI * 2); g.fill(); }
  }, []);
  useEffect(() => { const t = setTimeout(() => say(teg(gap("bunima", til), til)), 300); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const art = (e) => {
    if (!bosildi.current || tayyor) return;
    const c = canvas.current; const g = c?.getContext?.("2d");
    if (!g) return;
    const r = c.getBoundingClientRect();
    const x = ((e.clientX - r.left) * c.width) / r.width, y = ((e.clientY - r.top) * c.height) / r.height;
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = "#000";   // to‘liq o‘chirish (oldingi yarim shaffof rang emas)
    g.beginPath(); g.arc(x, y, d.chotka, 0, Math.PI * 2); g.fill();
    sanoq.current += 1;
    if (sanoq.current % 6 === 0) {
      const px = g.getImageData(0, 0, c.width, c.height).data;
      let toza = 0, jami = 0;
      for (let i = 3; i < px.length; i += 64) { jami += 1; if (px[i] < 40) toza += 1; }
      if (toza / jami > 0.62 && !tayyor) { setTayyor(true); raundOk(id); }
    }
  };
  // barmoq sahnaning istalgan joyidan (ramka burchagidan ham) boshlasa bo'ladi
  return <div className="jo-sahna jo-sahna--tozala" style={{ touchAction: "none" }}
    onPointerDown={(e) => { bosildi.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* */ } art(e); }}
    onPointerMove={art} onPointerUp={() => { bosildi.current = false; }} onPointerCancel={() => { bosildi.current = false; }}>
    <div className={`jo-ramka ${tayyor ? "is-tayyor" : ""}`}>
      <Pic id={id} />
      <canvas ref={canvas} className="jo-loy" style={{ opacity: tayyor ? 0 : 1, pointerEvents: "none" }} />
    </div>
  </div>;
}

/* ── 8. Kattalashtir: bosib tursa rasm o'sadi, qo'yib yuborsa kichrayadi ── */
function Kattalashtir({ d, til, say, raundOk, raundSozlar }) {
  const [id] = useMemo(() => raundSozlar(1), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [o, setO] = useState(0.22);
  const [tayyor, setTayyor] = useState(false);
  const bos = useRef(false);
  const bitdi = useRef(false);
  useEffect(() => { const t = setTimeout(() => say(teg(gap("bunima", til), til)), 300); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now) => {
      const dt = now - last; last = now;
      setO((v) => {
        if (tayyor) return v;
        const nv = bos.current ? v + (dt / d.osish) * 0.8 : Math.max(0.22, v - (dt / 2600) * 0.8);
        if (nv >= 1) { if (!bitdi.current) { bitdi.current = true; setTayyor(true); setTimeout(() => raundOk(id), 200); } return 1; }
        return nv;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tayyor]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="jo-sahna jo-sahna--osmon" style={{ touchAction: "none" }}
    onPointerDown={(e) => { bos.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* */ } }}
    onPointerUp={() => { bos.current = false; }} onPointerCancel={() => { bos.current = false; }} onPointerLeave={() => { bos.current = false; }}>
    <div className="jo-osuvchi-joy"><span className="jo-chegara" aria-hidden="true" />
      <div className={`jo-osuvchi ${tayyor ? "is-tayyor" : ""}`} style={{ transform: `scale(${o})` }}><Pic id={id} /></div></div>
    {!tayyor && <div className="jo-osish" aria-hidden="true"><i style={{ width: `${Math.round(o * 100)}%` }} /></div>}
    {tayyor && <span className="jo-portla" aria-hidden="true">✨</span>}
  </div>;
}

