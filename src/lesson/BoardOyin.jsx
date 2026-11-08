// REV429: doskadagi o'yinlar — talaba o'zi bajarib, qonuniyatni o'zi ko'radi (ma'ruza va amaliyotda).
//   OYIN: joylashtir 3   — harflarni bosib tartib tuzadi; hamma tartibni topgach: «3 ta narsa 6 xil = 3!»
//   OYIN: tanga | OYIN: kub 6 — ko'p marta tashlaydi; nisbiy chastota ehtimolga yaqinlashadi
//   OYIN: galton 8       — sharlar mixlar orasidan tushadi; normal taqsimot «qo'ng'iroq»i hosil bo'ladi
import React, { useMemo, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

const RANG = { A: "#F4A6A6", B: "#A8E6A1", C: "#9CC9FF", D: "#FFD37A" };
const HARF = "ABCD";
const fakt = (n) => (n <= 1 ? 1 : n * fakt(n - 1));
const tugma = { padding: "8px 14px", borderRadius: 12, border: "0", background: "#FFD54A", color: "#13202e", font: "800 15px system-ui,sans-serif", cursor: "pointer" };
const tugma2 = { ...tugma, background: "rgba(255,255,255,.14)", color: "#F4F1E8", border: "1px solid rgba(255,255,255,.3)" };

function Joylashtir({ n }) {
  n = Math.max(2, Math.min(4, n || 3));
  const [joriy, setJoriy] = useState([]);
  const [topildi, setTopildi] = useState([]);
  const jami = fakt(n);
  const bos = (h) => {
    if (joriy.includes(h)) return;
    const y = [...joriy, h];
    if (y.length < n) { setJoriy(y); return; }
    const s = y.join("");
    setTopildi((t) => (t.includes(s) ? t : [...t, s]));
    setTimeout(() => setJoriy([]), 450);
    setJoriy(y);
  };
  const tayyor = topildi.length >= jami;
  return <div className="bo-oyin">
    <div className="bo-sarl">🎯 {__kbUi(`${n} ta narsani har xil tartibda qo‘ying. Nechta tartib topa olasiz?`)}</div>
    <div className="bo-qator">
      {HARF.slice(0, n).split("").map((h) => <button key={h} type="button" className="bo-shar" disabled={joriy.includes(h) || tayyor} style={{ background: RANG[h], opacity: joriy.includes(h) ? 0.3 : 1 }} onClick={() => bos(h)}>{h}</button>)}
      <span className="bo-strelka">→</span>
      {Array.from({ length: n }, (_, i) => <span key={i} className="bo-katak">{joriy[i] ? <b style={{ background: RANG[joriy[i]] }}>{joriy[i]}</b> : null}</span>)}
    </div>
    <div className="bo-topildi">{topildi.map((t) => <span key={t} className="bo-chip">{t.split("").map((h, i) => <i key={i} style={{ background: RANG[h] }}>{h}</i>)}</span>)}</div>
    <div className="bo-hisob">{__kbUi("Topildi")}: <b>{topildi.length}</b>{tayyor ? <> — {__kbUi(`hammasi! ${n} ta narsa ${jami} xil tartiblanadi: ${n}! = ${jami}`)} 🎉</> : null}</div>
    {topildi.length > 0 && !tayyor && <button type="button" style={tugma2} onClick={() => { setTopildi([]); setJoriy([]); }}>↺ {__kbUi("Qaytadan")}</button>}
  </div>;
}

function Tajriba({ kub, tomon }) {
  const k = kub ? Math.max(2, Math.min(12, tomon || 6)) : 2;
  const [natija, setNatija] = useState({ n: 0, m: 0, iz: [] });
  const tashla = (soni) => setNatija((s) => {
    let { n, m } = s; const iz = [...s.iz];
    for (let i = 0; i < soni; i += 1) { n += 1; if (Math.floor(Math.random() * k) === 0) m += 1; if (n <= 50 || n % Math.ceil(n / 50) === 0) iz.push([n, m / n]); }
    return { n, m, iz: iz.slice(-120) };
  });
  const p = 1 / k, w = natija.n ? natija.m / natija.n : 0;
  const W = 520, H = 150, maxN = Math.max(10, natija.n);
  const yol = natija.iz.map(([x, y], i) => `${i ? "L" : "M"}${20 + (x / maxN) * (W - 30)} ${H - 18 - y * (H - 36) * (kub ? 2.5 : 1)}`).join(" ");
  const hodisa = kub ? __kbUi(`«${k} ochko»`) : __kbUi("«gerb»");
  return <div className="bo-oyin">
    <div className="bo-sarl">🎲 {kub ? __kbUi(`Kubni tashlang. ${hodisa} necha marta tushadi?`) : __kbUi("Tangani tashlang. «Gerb» necha marta tushadi?")}</div>
    <div className="bo-qator">
      <button type="button" style={tugma} onClick={() => tashla(1)}>{kub ? "🎲" : "🪙"} {__kbUi("Tashla")}</button>
      <button type="button" style={tugma} onClick={() => tashla(10)}>×10</button>
      <button type="button" style={tugma} onClick={() => tashla(100)}>×100</button>
      <button type="button" style={tugma} onClick={() => tashla(1000)}>×1000</button>
      <button type="button" style={tugma2} onClick={() => setNatija({ n: 0, m: 0, iz: [] })}>↺</button>
    </div>
    <div className="bo-hisob">{__kbUi("Tajribalar")}: <b>{natija.n}</b> · {hodisa}: <b>{natija.m}</b> · {__kbUi("nisbiy chastota")} W = <b>{natija.n ? w.toFixed(3).replace(".", ",") : "—"}</b></div>
    <svg viewBox={`0 0 ${W} ${H}`} className="bo-grafik" role="img" aria-label="W">
      <line x1="20" y1={H - 18} x2={W - 10} y2={H - 18} stroke="rgba(255,255,255,.4)" />
      <line x1="20" y1={H - 18 - p * (H - 36) * (kub ? 2.5 : 1)} x2={W - 10} y2={H - 18 - p * (H - 36) * (kub ? 2.5 : 1)} stroke="#FFD54A" strokeDasharray="6 5" />
      <text x={W - 12} y={H - 24 - p * (H - 36) * (kub ? 2.5 : 1)} textAnchor="end" fill="#FFD54A" fontSize="14">{`P = 1/${k}${kub ? "" : " = 0,5"}`}</text>
      {yol && <path d={yol} fill="none" stroke="#9CC9FF" strokeWidth="2.5" />}
    </svg>
    {natija.n >= 500 && <div className="bo-xulosa">{__kbUi(`Tajriba ko‘paygan sari nisbiy chastota ehtimolga — 1/${k} ga yaqinlashyapti. Bu — ehtimolning statistik ta’rifi.`)}</div>}
  </div>;
}

function Galton({ qator }) {
  const r = Math.max(4, Math.min(12, qator || 8));
  const [savat, setSavat] = useState(() => Array(r + 1).fill(0));
  const [oxirgi, setOxirgi] = useState(null);
  const tashla = (soni) => {
    const y = [...savat]; let yol = null;
    for (let i = 0; i < soni; i += 1) { let k = 0; const p = []; for (let j = 0; j < r; j += 1) { const o = Math.random() < 0.5 ? 1 : 0; k += o; p.push(k); } y[k] += 1; yol = p; }
    setSavat(y); setOxirgi(yol);
  };
  const jami = savat.reduce((a, b) => a + b, 0), max = Math.max(1, ...savat);
  const W = 520, H = 260, dx = (W - 60) / (r + 1);
  const mix = useMemo(() => { const out = []; for (let i = 0; i < r; i += 1) for (let j = 0; j <= i; j += 1) out.push([W / 2 + (j - i / 2) * dx, 18 + i * 12]); return out; }, [r, dx]);
  const binom = (k) => { let c = 1; for (let i = 0; i < k; i += 1) c = (c * (r - i)) / (i + 1); return c / 2 ** r; };
  return <div className="bo-oyin">
    <div className="bo-sarl">⚪ {__kbUi(`Sharlarni tashlang: har mixda o‘ngga yoki chapga ½ ehtimol bilan og‘adi. Pastda qanday shakl hosil bo‘ladi?`)}</div>
    <div className="bo-qator">
      <button type="button" style={tugma} onClick={() => tashla(1)}>⚪ {__kbUi("Tashla")}</button>
      <button type="button" style={tugma} onClick={() => tashla(20)}>×20</button>
      <button type="button" style={tugma} onClick={() => tashla(200)}>×200</button>
      <button type="button" style={tugma2} onClick={() => { setSavat(Array(r + 1).fill(0)); setOxirgi(null); }}>↺</button>
      <span className="bo-hisob" style={{ margin: 0 }}>{__kbUi("Sharlar")}: <b>{jami}</b></span>
    </div>
    <svg viewBox={`0 0 ${W} ${H}`} className="bo-grafik" role="img" aria-label="Galton">
      {mix.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(255,255,255,.6)" />)}
      {oxirgi && oxirgi.map((k, i) => <circle key={`o${i}`} cx={W / 2 + (k - (i + 1) / 2) * dx} cy={24 + i * 12} r="4" fill="#FFD54A" />)}
      {savat.map((v, k) => { const x = 30 + k * dx, h = (v / max) * 110;
        return <g key={k}><rect x={x + 3} y={H - 20 - h} width={dx - 6} height={h} rx="3" fill="#9CC9FF" />
          <text x={x + dx / 2} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,.75)" fontSize="11">{k}</text></g>; })}
      {jami >= 100 && <path d={savat.map((_, k) => `${k ? "L" : "M"}${30 + k * dx + dx / 2} ${H - 20 - (binom(k) * jami / max) * 110}`).join(" ")} fill="none" stroke="#FFD54A" strokeWidth="2.5" />}
    </svg>
    {jami >= 100 && <div className="bo-xulosa">{__kbUi("Ko‘p tasodifiy og‘ishlar yig‘indisi «qo‘ng‘iroq» shaklini beradi — bu normal taqsimot (markaziy limit teorema). Sariq chiziq — binomial ehtimollar.")}</div>}
  </div>;
}

export default function BoardOyin({ arg }) {
  const [tur, ...qolgan] = String(arg || "").trim().split(/\s+/);
  const n = parseInt(qolgan[0], 10);
  const t = (tur || "").toLowerCase();
  if (t === "joylashtir") return <Joylashtir n={n} />;
  if (t === "tanga") return <Tajriba />;
  if (t === "kub") return <Tajriba kub tomon={n} />;
  if (t === "galton") return <Galton qator={n} />;
  return null;
}
