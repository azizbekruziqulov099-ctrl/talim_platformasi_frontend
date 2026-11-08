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


// ───────────── REV430: yana o'yinlar ─────────────
/** OYIN: venn 30 20 8 — sportga 30, musiqaga 20, ikkalasiga 8 kishi. Talaba qadamma-qadam sanaydi: kesishma ikki marta sanalmasin. */
function VennOyin({ a = 30, b = 20, ab = 8 }) {
  const [q, setQ] = useState(0);
  const jami = a + b - ab;
  const W = 520, H = 220;
  const qadamlar = [__kbUi("Sport to‘garagini bo‘yang"), __kbUi("Musiqa to‘garagini bo‘yang"), __kbUi("Ikki marta sanalganlarni ayiring")];
  return <div className="bo-oyin">
    <div className="bo-sarl">⭕ {__kbUi(`Sportga ${a} kishi, musiqaga ${b} kishi, ikkalasiga ${ab} kishi qatnashadi. Kamida bittasiga necha kishi qatnashadi?`)}</div>
    <svg viewBox={`0 0 ${W} ${H}`} className="bo-grafik" role="img" aria-label="Venn">
      <circle cx="200" cy="110" r="88" fill={q >= 1 ? "rgba(244,166,166,.45)" : "none"} stroke="#F4A6A6" strokeWidth="3" />
      <circle cx="320" cy="110" r="88" fill={q >= 2 ? "rgba(156,201,255,.45)" : "none"} stroke="#9CC9FF" strokeWidth="3" />
      {q === 2 && <path d="M260 46 A88 88 0 0 1 260 174 A88 88 0 0 1 260 46 Z" fill="rgba(255,213,74,.75)" />}
      <text x="150" y="115" fill="#F4F1E8" fontSize="22" fontWeight="800">{a - ab}</text>
      <text x="350" y="115" fill="#F4F1E8" fontSize="22" fontWeight="800">{b - ab}</text>
      <text x="260" y="117" textAnchor="middle" fill={q === 2 ? "#13202e" : "#F4F1E8"} fontSize="22" fontWeight="800">{ab}</text>
      <text x="150" y="30" fill="#F4A6A6" fontSize="17" fontWeight="700">{__kbUi("Sport")} {a}</text>
      <text x="330" y="30" fill="#9CC9FF" fontSize="17" fontWeight="700">{__kbUi("Musiqa")} {b}</text>
    </svg>
    <div className="bo-qator">{q < 3 ? <button type="button" style={tugma} onClick={() => setQ(q + 1)}>{qadamlar[q]} →</button> : <button type="button" style={tugma2} onClick={() => setQ(0)}>↺ {__kbUi("Qaytadan")}</button>}</div>
    <div className="bo-hisob">{q === 0 ? __kbUi("Boshlash uchun tugmani bosing") : q === 1 ? `${a}` : q === 2 ? `${a} + ${b} = ${a + b} — ${__kbUi("sariq qism ikki marta sanaldi!")}` : <>{a} + {b} − {ab} = <b>{jami}</b></>}</div>
    {q === 3 && <div className="bo-xulosa">{__kbUi("Kesishma ikki marta sanalgani uchun bir marta ayiramiz: P(A+B) = P(A) + P(B) − P(AB).")}</div>}
  </div>;
}

/** OYIN: daraxt — ikki zavod (60% / 40%), braki 5% va 10%. Tasodifiy mahsulot olinadi: avval zavod, keyin brakmi. */
function DaraxtOyin({ p1 = 0.6, q1 = 0.05, q2 = 0.1 }) {
  const [s, setS] = useState({ n: 0, brak: 0, b1: 0, oxirgi: null });
  const ol = (k) => setS((o) => { let { n, brak, b1 } = o; let oxirgi = null;
    for (let i = 0; i < k; i += 1) { const z = Math.random() < p1 ? 1 : 2; const b = Math.random() < (z === 1 ? q1 : q2); n += 1; if (b) { brak += 1; if (z === 1) b1 += 1; } oxirgi = [z, b]; }
    return { n, brak, b1, oxirgi }; });
  const P = p1 * q1 + (1 - p1) * q2, W = 520, H = 200;
  const yon = (z, b) => s.oxirgi && s.oxirgi[0] === z && (b === undefined || s.oxirgi[1] === b);
  const f = (v) => String(v).replace(".", ",");
  return <div className="bo-oyin">
    <div className="bo-sarl">🌳 {__kbUi(`Mahsulotni 1-zavod ${Math.round(p1 * 100)}%, 2-zavod ${Math.round((1 - p1) * 100)}% beradi. Braki: ${Math.round(q1 * 100)}% va ${Math.round(q2 * 100)}%. Tasodifiy mahsulot brak bo‘lish ehtimoli qancha?`)}</div>
    <svg viewBox={`0 0 ${W} ${H}`} className="bo-grafik" role="img" aria-label="daraxt">
      {[[1, 60], [2, 140]].map(([z, y]) => <g key={z}>
        <line x1="40" y1="100" x2="200" y2={y} stroke={yon(z) ? "#FFD54A" : "rgba(255,255,255,.5)"} strokeWidth={yon(z) ? 4 : 2} />
        <text x="110" y={y < 100 ? 70 : 140} fill="#F4F1E8" fontSize="15">{f(z === 1 ? p1 : +(1 - p1).toFixed(2))}</text>
        <circle cx="210" cy={y} r="16" fill="#9CC9FF" /><text x="210" y={y + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#13202e">{z}</text>
        {[[true, y - 25], [false, y + 25]].map(([b, yy]) => <g key={String(b)}>
          <line x1="226" y1={y} x2="380" y2={yy} stroke={yon(z, b) ? "#FFD54A" : "rgba(255,255,255,.4)"} strokeWidth={yon(z, b) ? 4 : 1.5} />
          <text x="390" y={yy + 5} fill={b ? "#F4A6A6" : "#A8E6A1"} fontSize="14" fontWeight="700">{b ? __kbUi("brak") : __kbUi("yaroqli")} {f(b ? (z === 1 ? q1 : q2) : +(1 - (z === 1 ? q1 : q2)).toFixed(2))}</text></g>)}
      </g>)}
    </svg>
    <div className="bo-qator">
      <button type="button" style={tugma} onClick={() => ol(1)}>📦 {__kbUi("Mahsulot ol")}</button>
      <button type="button" style={tugma} onClick={() => ol(100)}>×100</button>
      <button type="button" style={tugma} onClick={() => ol(1000)}>×1000</button>
      <button type="button" style={tugma2} onClick={() => setS({ n: 0, brak: 0, b1: 0, oxirgi: null })}>↺</button>
    </div>
    <div className="bo-hisob">{__kbUi("Olindi")}: <b>{s.n}</b> · {__kbUi("brak")}: <b>{s.brak}</b> · {__kbUi("ulush")}: <b>{s.n ? (s.brak / s.n).toFixed(3).replace(".", ",") : "—"}</b></div>
    {s.n >= 1000 && <div className="bo-xulosa">{__kbUi(`Har shox bo‘yicha ko‘paytirib qo‘shamiz: ${f(p1)}·${f(q1)} + ${f(+(1 - p1).toFixed(2))}·${f(q2)} = ${f(+P.toFixed(3))} — tajriba ham shunga yaqin. Bu — to‘la ehtimol formulasi. Brak chiqqanlarning ${s.brak ? Math.round((100 * s.b1) / s.brak) : 0}% i 1-zavodniki — bu Bayes formulasi.`)}</div>}
  </div>;
}

/** OYIN: ikkikub — ikki kub yig'indisi taqsimoti; o'rtacha 7 ga yaqinlashadi. */
function IkkiKub() {
  const [sv, setSv] = useState(() => Array(13).fill(0));
  const tashla = (k) => setSv((o) => { const y = [...o]; for (let i = 0; i < k; i += 1) y[1 + Math.ceil(Math.random() * 6) + Math.floor(Math.random() * 6)] += 1; return y; });
  const n = sv.reduce((a, b) => a + b, 0), max = Math.max(1, ...sv), M = n ? sv.reduce((a, v, i) => a + v * i, 0) / n : 0;
  const W = 520, H = 200, dx = (W - 40) / 11;
  return <div className="bo-oyin">
    <div className="bo-sarl">🎲🎲 {__kbUi("Ikki kubni tashlang. Qaysi yig‘indi ko‘p tushadi va o‘rtachasi qancha?")}</div>
    <div className="bo-qator">
      <button type="button" style={tugma} onClick={() => tashla(1)}>🎲 {__kbUi("Tashla")}</button>
      <button type="button" style={tugma} onClick={() => tashla(100)}>×100</button>
      <button type="button" style={tugma} onClick={() => tashla(1000)}>×1000</button>
      <button type="button" style={tugma2} onClick={() => setSv(Array(13).fill(0))}>↺</button>
    </div>
    <svg viewBox={`0 0 ${W} ${H}`} className="bo-grafik" role="img" aria-label="yig'indi">
      {sv.slice(2).map((v, i) => { const h = (v / max) * 140, x = 20 + i * dx;
        return <g key={i}><rect x={x + 3} y={H - 26 - h} width={dx - 6} height={h} rx="3" fill={i + 2 === 7 ? "#FFD54A" : "#9CC9FF"} />
          <text x={x + dx / 2} y={H - 8} textAnchor="middle" fill="rgba(255,255,255,.8)" fontSize="13">{i + 2}</text></g>; })}
    </svg>
    <div className="bo-hisob">{__kbUi("Tashlashlar")}: <b>{n}</b> · {__kbUi("o‘rtacha yig‘indi")}: <b>{n ? M.toFixed(2).replace(".", ",") : "—"}</b></div>
    {n >= 1000 && <div className="bo-xulosa">{__kbUi("7 eng ko‘p tushadi — uni 6 xil usulda olish mumkin. O‘rtacha qiymat 7 ga yaqin: bu — matematik kutilma M(X) = Σ xᵢpᵢ = 7.")}</div>}
  </div>;
}

/** OYIN: nuqta — kvadratga tasodifiy nuqtalar; doira ichiga tushganlar ulushi → π/4 (geometrik ehtimol). */
function NuqtaOyin() {
  const [nq, setNq] = useState([]);
  const tashla = (k) => setNq((o) => [...o, ...Array.from({ length: k }, () => [Math.random(), Math.random()])].slice(-4000));
  const ichida = nq.filter(([x, y]) => (x - 0.5) ** 2 + (y - 0.5) ** 2 <= 0.25).length, n = nq.length;
  const S = 200;
  return <div className="bo-oyin">
    <div className="bo-sarl">🎯 {__kbUi("Kvadratga tavakkaliga nuqta tashlang. Nuqta doira ichiga tushish ehtimoli qancha?")}</div>
    <div className="bo-qator">
      <button type="button" style={tugma} onClick={() => tashla(1)}>• {__kbUi("Tashla")}</button>
      <button type="button" style={tugma} onClick={() => tashla(100)}>×100</button>
      <button type="button" style={tugma} onClick={() => tashla(1000)}>×1000</button>
      <button type="button" style={tugma2} onClick={() => setNq([])}>↺</button>
    </div>
    <svg viewBox={`0 0 ${S + 20} ${S + 20}`} className="bo-grafik" style={{ maxWidth: 260 }} role="img" aria-label="nuqtalar">
      <rect x="10" y="10" width={S} height={S} fill="none" stroke="rgba(255,255,255,.6)" />
      <circle cx={10 + S / 2} cy={10 + S / 2} r={S / 2} fill="none" stroke="#FFD54A" strokeWidth="2" />
      {nq.slice(-1500).map(([x, y], i) => <circle key={i} cx={10 + x * S} cy={10 + y * S} r="1.6" fill={(x - 0.5) ** 2 + (y - 0.5) ** 2 <= 0.25 ? "#A8E6A1" : "#F4A6A6"} />)}
    </svg>
    <div className="bo-hisob">{__kbUi("Nuqtalar")}: <b>{n}</b> · {__kbUi("doira ichida")}: <b>{ichida}</b> · {__kbUi("ulush")}: <b>{n ? (ichida / n).toFixed(3).replace(".", ",") : "—"}</b></div>
    {n >= 1000 && <div className="bo-xulosa">{__kbUi("Ulush doira yuzining kvadrat yuziga nisbatiga yaqin: π/4 ≈ 0,785. Bu — geometrik ehtimol.")}</div>}
  </div>;
}

/** OYIN: tanlanma 50 — bosh to'plamdan (o'rta qiymati noma'lum) tanlanma olinadi; o'rta qiymatlar va 95% oraliqlar. */
function TanlanmaOyin({ n = 25 }) {
  const a = 165, sigma = 8;
  const [olindi, setOlindi] = useState([]);
  const normal = () => { let u = 0, v = 0; while (!u) u = Math.random(); v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const ol = (k) => setOlindi((o) => [...o, ...Array.from({ length: k }, () => { const x = Array.from({ length: n }, () => a + sigma * normal()); const m = x.reduce((p, q) => p + q, 0) / n; const d = (1.96 * sigma) / Math.sqrt(n); return [m, m - d, m + d]; })].slice(-40));
  const qoplagan = olindi.filter(([, l, u]) => l <= a && a <= u).length;
  const W = 520, H = 230, sx = (v) => 30 + ((v - (a - 12)) / 24) * (W - 60);
  return <div className="bo-oyin">
    <div className="bo-sarl">📏 {__kbUi(`Talabalar bo‘yi (bosh to‘plam). Har safar ${n} kishilik tanlanma olamiz va 95% ishonch oralig‘ini quramiz. Oraliqlarning nechtasi haqiqiy o‘rta qiymatni qoplaydi?`)}</div>
    <div className="bo-qator">
      <button type="button" style={tugma} onClick={() => ol(1)}>👥 {__kbUi("Tanlanma ol")}</button>
      <button type="button" style={tugma} onClick={() => ol(20)}>×20</button>
      <button type="button" style={tugma2} onClick={() => setOlindi([])}>↺</button>
    </div>
    <svg viewBox={`0 0 ${W} ${H}`} className="bo-grafik" role="img" aria-label="oraliqlar">
      <line x1={sx(a)} y1="6" x2={sx(a)} y2={H - 6} stroke="#FFD54A" strokeDasharray="6 5" />
      {olindi.map(([m, l, u], i) => { const y = 12 + i * 5.3, ok = l <= a && a <= u;
        return <g key={i}><line x1={sx(l)} y1={y} x2={sx(u)} y2={y} stroke={ok ? "#A8E6A1" : "#F4A6A6"} strokeWidth="2.5" /><circle cx={sx(m)} cy={y} r="2.2" fill="#fff" /></g>; })}
    </svg>
    <div className="bo-hisob">{__kbUi("Oraliqlar")}: <b>{olindi.length}</b> · {__kbUi("haqiqiy o‘rta qiymatni qoplaganlar")}: <b>{qoplagan}</b>{olindi.length ? ` (${Math.round((100 * qoplagan) / olindi.length)}%)` : ""}</div>
    {olindi.length >= 20 && <div className="bo-xulosa">{__kbUi("Har tanlanmaning o‘rta qiymati har xil, lekin 95% ishonch oraliqlarining taxminan 95 foizi haqiqiy o‘rta qiymatni (sariq chiziq) qoplaydi. «95% ishonch» — shu degani.")}</div>}
  </div>;
}

/** OYIN: chiziq — nuqtalar orasidan to'g'ri chiziq o'tkazish: talaba qiyalik va siljishni suradi, kvadratlar yig'indisi kamayadi. */
function ChiziqOyin() {
  const nuqta = useMemo(() => [[1, 3], [2, 4.5], [3, 5.2], [4, 7.1], [5, 7.9], [6, 9.6], [7, 10.4], [8, 12.3]], []);
  const n = nuqta.length, mx = nuqta.reduce((a, [x]) => a + x, 0) / n, my = nuqta.reduce((a, [, y]) => a + y, 0) / n;
  const kE = nuqta.reduce((a, [x, y]) => a + (x - mx) * (y - my), 0) / nuqta.reduce((a, [x]) => a + (x - mx) ** 2, 0), bE = my - kE * mx;
  const [k, setK] = useState(0.5); const [b, setB] = useState(5);
  const Q = nuqta.reduce((a, [x, y]) => a + (y - (k * x + b)) ** 2, 0), QE = nuqta.reduce((a, [x, y]) => a + (y - (kE * x + bE)) ** 2, 0);
  const W = 520, H = 230, sx = (x) => 30 + (x / 9) * (W - 50), sy = (y) => H - 20 - (y / 14) * (H - 40);
  const f = (v, d = 2) => v.toFixed(d).replace(".", ",");
  return <div className="bo-oyin">
    <div className="bo-sarl">📈 {__kbUi("Chiziqni nuqtalarga eng yaqin qilib qo‘ying. Xatolar kvadratlari yig‘indisi qanchalik kichik bo‘lishi mumkin?")}</div>
    <svg viewBox={`0 0 ${W} ${H}`} className="bo-grafik" role="img" aria-label="regressiya">
      {nuqta.map(([x, y], i) => <g key={i}><line x1={sx(x)} y1={sy(y)} x2={sx(x)} y2={sy(k * x + b)} stroke="#F4A6A6" strokeDasharray="3 3" /><circle cx={sx(x)} cy={sy(y)} r="5" fill="#9CC9FF" /></g>)}
      <line x1={sx(0)} y1={sy(b)} x2={sx(9)} y2={sy(k * 9 + b)} stroke="#FFD54A" strokeWidth="3" />
    </svg>
    <label className="bo-qator">{__kbUi("Qiyalik")} k = <b>{f(k)}</b><input type="range" min="0" max="2.5" step="0.05" value={k} onChange={(e) => setK(+e.target.value)} style={{ flex: 1 }} /></label>
    <label className="bo-qator">{__kbUi("Siljish")} b = <b>{f(b)}</b><input type="range" min="-3" max="8" step="0.1" value={b} onChange={(e) => setB(+e.target.value)} style={{ flex: 1 }} /></label>
    <div className="bo-hisob">{__kbUi("Xatolar kvadratlari yig‘indisi")} Q = <b>{f(Q)}</b> <button type="button" style={tugma2} onClick={() => { setK(+kE.toFixed(2)); setB(+bE.toFixed(2)); }}>✨ {__kbUi("Eng yaxshi chiziq")}</button></div>
    {Math.abs(Q - QE) < 0.2 && <div className="bo-xulosa">{__kbUi(`Eng kichik Q = ${f(QE)}: k = ${f(kE)}, b = ${f(bE)}. Bu — eng kichik kvadratlar usuli bilan topilgan regressiya chizig‘i.`)}</div>}
  </div>;
}

// ───────────── REV432: haqiqiyga o'xshash o'yinlar — tanga havoga otiladi, zar dumalaydi, karta olinadi, qopdan shar chiqadi ─────────────
const PIPS = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[25, 25], [50, 50], [75, 75]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]], 6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]] };
const ZAR_BURCHAK = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };
function ZarYuzi({ n, cls }) {
  return <div className={`bo-zar-yuz ${cls}`}>{PIPS[n].map(([x, y], i) => <i key={i} style={{ left: `${x}%`, top: `${y}%` }} />)}</div>;
}

/** OYIN: tanga — tanga havoga otilib, aylanib tushadi; ko'p tashlashda nisbiy chastota grafigi. */
function TangaJonli() {
  const [s, setS] = useState({ n: 0, m: 0, iz: [], oxirgi: null, aylan: 0 });
  const [uchmoqda, setUch] = useState(false);
  const tashla = (soni) => {
    if (soni === 1) {
      const gerb = Math.random() < 0.5;
      setUch(true);
      setS((o) => ({ ...o, aylan: o.aylan + 1, oxirgi: gerb }));
      setTimeout(() => { setUch(false); setS((o) => { const n = o.n + 1, m = o.m + (gerb ? 1 : 0); return { ...o, n, m, iz: [...o.iz, [n, m / n]].slice(-200) }; }); }, 1150);
      return;
    }
    setS((o) => { let { n, m } = o; const iz = [...o.iz]; let ox = o.oxirgi;
      for (let i = 0; i < soni; i += 1) { n += 1; ox = Math.random() < 0.5; if (ox) m += 1; if (n <= 60 || n % Math.ceil(n / 60) === 0) iz.push([n, m / n]); }
      return { ...o, n, m, iz: iz.slice(-200), oxirgi: ox }; });
  };
  const W = 520, H = 130, maxN = Math.max(10, s.n);
  const yol = s.iz.map(([x, y], i) => `${i ? "L" : "M"}${20 + (x / maxN) * (W - 30)} ${H - 14 - y * (H - 28)}`).join(" ");
  const burchak = s.aylan * 1800 + (s.oxirgi === false ? 180 : 0);
  return <div className="bo-oyin">
    <div className="bo-sarl">🪙 {__kbUi("Tangani havoga oting. Gerb tushadimi yoki son?")}</div>
    <div className="bo-tanga-sahna">
      <div className={`bo-tanga ${uchmoqda ? "is-uch" : ""}`} style={{ transform: `rotateX(${burchak}deg)` }}>
        <div className="bo-tanga-yuz is-gerb"><span>🦅</span><small>{__kbUi("GERB")}</small></div>
        <div className="bo-tanga-yuz is-son"><b>1</b><small>{__kbUi("SO‘M")}</small></div>
      </div>
      <div className="bo-tanga-soya" />
    </div>
    <div className="bo-qator">
      <button type="button" style={tugma} disabled={uchmoqda} onClick={() => tashla(1)}>🪙 {__kbUi("Ot")}</button>
      <button type="button" style={tugma} disabled={uchmoqda} onClick={() => tashla(10)}>×10</button>
      <button type="button" style={tugma} disabled={uchmoqda} onClick={() => tashla(100)}>×100</button>
      <button type="button" style={tugma} disabled={uchmoqda} onClick={() => tashla(1000)}>×1000</button>
      <button type="button" style={tugma2} onClick={() => setS({ n: 0, m: 0, iz: [], oxirgi: null, aylan: 0 })}>↺</button>
    </div>
    <div className="bo-hisob">{!uchmoqda && s.oxirgi !== null && <><b>{s.oxirgi ? __kbUi("Gerb!") : __kbUi("Son!")}</b> · </>}{__kbUi("Tashlashlar")}: <b>{s.n}</b> · {__kbUi("gerb")}: <b>{s.m}</b> · W = <b>{s.n ? (s.m / s.n).toFixed(3).replace(".", ",") : "—"}</b></div>
    {s.n > 1 && <svg viewBox={`0 0 ${W} ${H}`} className="bo-grafik" role="img" aria-label="W">
      <line x1="20" y1={H - 14 - 0.5 * (H - 28)} x2={W - 10} y2={H - 14 - 0.5 * (H - 28)} stroke="#FFD54A" strokeDasharray="6 5" />
      <text x={W - 12} y={H - 20 - 0.5 * (H - 28)} textAnchor="end" fill="#FFD54A" fontSize="14">P = 0,5</text>
      <path d={yol} fill="none" stroke="#9CC9FF" strokeWidth="2.5" /></svg>}
    {s.n >= 500 && <div className="bo-xulosa">{__kbUi("Tashlashlar ko‘paygan sari gerb ulushi 0,5 ga yaqinlashyapti — bu ehtimolning statistik ta’rifi.")}</div>}
  </div>;
}

/** OYIN: kub 6 — zar dumalab tushadi; har yuz necha marta tushgani ustunlarda. */
function ZarJonli({ izlangan = 6 }) {
  const [s, setS] = useState({ sanoq: [0, 0, 0, 0, 0, 0, 0], oxirgi: 1, aylan: 0 });
  const [dumalaydi, setD] = useState(false);
  const tashla = (soni) => {
    if (soni === 1) {
      const n = 1 + Math.floor(Math.random() * 6);
      setD(true); setS((o) => ({ ...o, aylan: o.aylan + 1, oxirgi: n }));
      setTimeout(() => { setD(false); setS((o) => { const y = [...o.sanoq]; y[n] += 1; return { ...o, sanoq: y }; }); }, 1250);
      return;
    }
    setS((o) => { const y = [...o.sanoq]; let ox = o.oxirgi; for (let i = 0; i < soni; i += 1) { ox = 1 + Math.floor(Math.random() * 6); y[ox] += 1; } return { ...o, sanoq: y, oxirgi: ox }; });
  };
  const n = s.sanoq.reduce((a, b) => a + b, 0), max = Math.max(1, ...s.sanoq);
  const [bx, by] = ZAR_BURCHAK[s.oxirgi];
  return <div className="bo-oyin">
    <div className="bo-sarl">🎲 {__kbUi(`Zarni tashlang. «${izlangan}» necha marta tushadi?`)}</div>
    <div className="bo-zar-sahna">
      <div className={`bo-zar ${dumalaydi ? "is-dumala" : ""}`} style={{ transform: `rotateX(${bx + s.aylan * 720}deg) rotateY(${by + s.aylan * 720}deg)` }}>
        <ZarYuzi n={1} cls="f1" /><ZarYuzi n={2} cls="f2" /><ZarYuzi n={3} cls="f3" /><ZarYuzi n={4} cls="f4" /><ZarYuzi n={5} cls="f5" /><ZarYuzi n={6} cls="f6" />
      </div>
    </div>
    <div className="bo-qator">
      <button type="button" style={tugma} disabled={dumalaydi} onClick={() => tashla(1)}>🎲 {__kbUi("Tashla")}</button>
      <button type="button" style={tugma} disabled={dumalaydi} onClick={() => tashla(60)}>×60</button>
      <button type="button" style={tugma} disabled={dumalaydi} onClick={() => tashla(600)}>×600</button>
      <button type="button" style={tugma2} onClick={() => setS({ sanoq: [0, 0, 0, 0, 0, 0, 0], oxirgi: 1, aylan: 0 })}>↺</button>
    </div>
    {n > 0 && <div className="bo-ustunlar">{[1, 2, 3, 4, 5, 6].map((k) => <div key={k} className={k === izlangan ? "is-on" : ""}>
      <span style={{ height: `${(s.sanoq[k] / max) * 70}px` }} /><b>{k}</b><small>{s.sanoq[k]}</small></div>)}</div>}
    <div className="bo-hisob">{__kbUi("Tashlashlar")}: <b>{n}</b> · «{izlangan}»: <b>{s.sanoq[izlangan]}</b> · W = <b>{n ? (s.sanoq[izlangan] / n).toFixed(3).replace(".", ",") : "—"}</b> ({__kbUi("ehtimol")} 1/6 ≈ 0,167)</div>
    {n >= 300 && <div className="bo-xulosa">{__kbUi("Har yuz taxminan teng tushyapti — har birining ehtimoli 1/6. Klassik ta’rif (sanash) va tajriba bir xil javob beradi.")}</div>}
  </div>;
}

/** OYIN: karta 36 — 36 talik dastadan karta olinadi; «tuz» (yoki «chillak») chiqish ulushi. */
function KartaOyin({ soni = 36 }) {
  const RANG = ["♠", "♥", "♦", "♣"], QIYMAT = soni === 52 ? ["2", "3", "4", "5", "6", "7", "8", "9", "10", "V", "D", "K", "T"] : ["6", "7", "8", "9", "10", "V", "D", "K", "T"];
  const [s, setS] = useState({ n: 0, tuz: 0, chillak: 0, oxirgi: null, k: 0 });
  const [ochilmoqda, setO] = useState(false);
  const ol = (k) => {
    const birta = () => ({ q: QIYMAT[Math.floor(Math.random() * QIYMAT.length)], r: RANG[Math.floor(Math.random() * 4)] });
    if (k === 1) {
      const c = birta(); setO(true); setS((o) => ({ ...o, oxirgi: c, k: o.k + 1 }));
      setTimeout(() => { setO(false); setS((o) => ({ ...o, n: o.n + 1, tuz: o.tuz + (c.q === "T" ? 1 : 0), chillak: o.chillak + (c.r === "♥" ? 1 : 0) })); }, 800);
      return;
    }
    setS((o) => { let { n, tuz, chillak } = o; let c = o.oxirgi; for (let i = 0; i < k; i += 1) { c = birta(); n += 1; if (c.q === "T") tuz += 1; if (c.r === "♥") chillak += 1; } return { ...o, n, tuz, chillak, oxirgi: c }; });
  };
  const qizil = s.oxirgi && (s.oxirgi.r === "♥" || s.oxirgi.r === "♦");
  const f = (a, b) => (b ? (a / b).toFixed(3).replace(".", ",") : "—");
  return <div className="bo-oyin">
    <div className="bo-sarl">🃏 {__kbUi(`${soni} talik dastadan tavakkaliga karta oling (har safar dastaga qaytariladi). «Tuz» chiqish ehtimoli qancha?`)}</div>
    <div className="bo-karta-sahna">
      <div className="bo-dasta">{[0, 1, 2, 3].map((i) => <i key={i} style={{ transform: `translate(${i * 2}px, ${-i * 2}px)` }} />)}</div>
      {s.oxirgi && <div key={s.k} className={`bo-karta ${ochilmoqda ? "is-uch" : ""}`}>
        <div className="bo-karta-orqa" />
        <div className={`bo-karta-old ${qizil ? "is-qizil" : ""}`}><b>{s.oxirgi.q}</b><span>{s.oxirgi.r}</span><b className="past">{s.oxirgi.q}</b></div>
      </div>}
    </div>
    <div className="bo-qator">
      <button type="button" style={tugma} disabled={ochilmoqda} onClick={() => ol(1)}>🃏 {__kbUi("Karta ol")}</button>
      <button type="button" style={tugma} disabled={ochilmoqda} onClick={() => ol(36)}>×36</button>
      <button type="button" style={tugma} disabled={ochilmoqda} onClick={() => ol(360)}>×360</button>
      <button type="button" style={tugma2} onClick={() => setS({ n: 0, tuz: 0, chillak: 0, oxirgi: null, k: 0 })}>↺</button>
    </div>
    <div className="bo-hisob">{__kbUi("Olindi")}: <b>{s.n}</b> · {__kbUi("tuz")}: <b>{s.tuz}</b> ({f(s.tuz, s.n)}) · {__kbUi("chillak")} ♥: <b>{s.chillak}</b> ({f(s.chillak, s.n)})</div>
    {s.n >= 300 && <div className="bo-xulosa">{__kbUi(`Dastada ${soni} karta, ulardan 4 tasi tuz: P = 4/${soni} ≈ ${(4 / soni).toFixed(3).replace(".", ",")}. Chillak ${soni / 4} ta: P = 1/4. Tajriba shunga yaqin.`)}</div>}
  </div>;
}

/** OYIN: qop 5 3 — qopda 5 oq va 3 qora shar; qo'l bilan shar olinadi; qaytarib solish yoki solmaslik (shartli ehtimol). */
function QopOyin({ oq = 5, qora = 3 }) {
  const [qop, setQop] = useState({ oq, qora });
  const [olingan, setOlingan] = useState([]);
  const [qaytar, setQaytar] = useState(false);
  const [chiqmoqda, setChiq] = useState(null);
  const jami = qop.oq + qop.qora;
  const ol = () => {
    if (!jami || chiqmoqda) return;
    const rang = Math.random() < qop.oq / jami ? "oq" : "qora";
    setChiq(rang);
    setTimeout(() => {
      setChiq(null); setOlingan((o) => [...o, rang].slice(-12));
      if (!qaytar) setQop((q) => ({ ...q, [rang]: q[rang] - 1 }));
    }, 900);
  };
  const qaytadan = () => { setQop({ oq, qora }); setOlingan([]); };
  const ehtimol = jami ? `${qop.oq}/${jami}` : "—";
  const sharlar = [...Array(qop.oq).fill("oq"), ...Array(qop.qora).fill("qora")];
  return <div className="bo-oyin">
    <div className="bo-sarl">👜 {__kbUi(`Qopda ${oq} ta oq va ${qora} ta qora shar. Ko‘rmasdan shar oling. Keyingi shar oq bo‘lish ehtimoli qanday o‘zgaradi?`)}</div>
    <div className="bo-qop-sahna">
      <svg viewBox="0 0 200 170" className="bo-qop" role="img" aria-label="qop">
        <path d="M40 60 Q30 160 100 162 Q170 160 160 60 Z" fill="#a8743f" stroke="#7a5228" strokeWidth="3" />
        <path d="M52 60 Q100 44 148 60" fill="none" stroke="#7a5228" strokeWidth="6" />
        <path d="M60 52 Q100 30 140 52" fill="none" stroke="#e6c48a" strokeWidth="3" strokeDasharray="5 4" />
        {sharlar.map((r, i) => { const x = 62 + (i % 6) * 15 + (Math.floor(i / 6) % 2) * 7, y = 140 - Math.floor(i / 6) * 15;
          return <circle key={i} cx={x} cy={y} r="7" fill={r === "oq" ? "#f6f6f6" : "#2a2f38"} stroke="#555" strokeWidth="1" />; })}
        {chiqmoqda && <g className="bo-qop-chiq"><circle cx="100" cy="40" r="11" fill={chiqmoqda === "oq" ? "#fff" : "#2a2f38"} stroke="#555" strokeWidth="1.5" /><text x="100" y="20" textAnchor="middle" fontSize="22">✋</text></g>}
      </svg>
      <div className="bo-olinganlar"><small>{__kbUi("Olingan sharlar")}:</small><div>{olingan.map((r, i) => <i key={i} className={r === "oq" ? "is-oq" : "is-qora"} />)}</div></div>
    </div>
    <div className="bo-qator">
      <button type="button" style={tugma} disabled={!jami || !!chiqmoqda} onClick={ol}>✋ {__kbUi("Shar ol")}</button>
      <label style={{ display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={qaytar} onChange={(e) => setQaytar(e.target.checked)} /> {__kbUi("Olingan sharni qopga qaytarish")}</label>
      <button type="button" style={tugma2} onClick={qaytadan}>↺</button>
    </div>
    <div className="bo-hisob">{__kbUi("Qopda qoldi")}: <b>{qop.oq}</b> {__kbUi("oq")}, <b>{qop.qora}</b> {__kbUi("qora")} · {__kbUi("keyingisi oq bo‘lish ehtimoli")}: <b>{ehtimol}</b></div>
    {olingan.length >= 2 && !qaytar && <div className="bo-xulosa">{__kbUi("Shar qaytarilmasa, qopdagi sharlar o‘zgaradi — keyingi ehtimol oldingi natijaga bog‘liq. Bu — shartli ehtimol: P(B|A) = P(AB) / P(A).")}</div>}
    {olingan.length >= 2 && qaytar && <div className="bo-xulosa">{__kbUi("Shar qaytarilsa, qop o‘zgarmaydi — har safar ehtimol bir xil. Bunday hodisalar bog‘liqsiz.")}</div>}
  </div>;
}

// ───────────── REV437: maktab matematikasi o'yinlari ─────────────
/** OYIN: pitsa — pitsani teng bo'laklarga bo'lib, bo'laklarni yeysiz: kasr qanday hosil bo'ladi, qaysi kasr katta. */
function PitsaOyin() {
  const [n, setN] = useState(4);
  const [olindi, setOlindi] = useState([]);
  const k = olindi.length;
  const R = 90, C = 110;
  const bolak = (i) => { const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    return `M${C} ${C} L${C + R * Math.cos(a0)} ${C + R * Math.sin(a0)} A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${C + R * Math.cos(a1)} ${C + R * Math.sin(a1)} Z`; };
  return <div className="bo-oyin">
    <div className="bo-sarl">🍕 {__kbUi("Pitsani teng bo‘laklarga bo‘ling va bo‘laklarni bosib oling. Qancha qismini oldingiz?")}</div>
    <div className="bo-qator">{[2, 3, 4, 6, 8].map((v) => <button key={v} type="button" style={v === n ? tugma : tugma2} onClick={() => { setN(v); setOlindi([]); }}>{v} {__kbUi("bo‘lak")}</button>)}</div>
    <div className="bo-qator" style={{ alignItems: "center", gap: 24 }}>
      <svg viewBox="0 0 220 220" style={{ width: 220, height: 220 }} role="img" aria-label="pitsa">
        <circle cx={C} cy={C} r={R + 8} fill="#d49a4c" />
        {Array.from({ length: n }, (_, i) => <path key={i} d={bolak(i)} fill={olindi.includes(i) ? "rgba(255,255,255,.08)" : "#f2c14e"} stroke="#b5762a" strokeWidth="3"
          style={{ cursor: "pointer", transition: "fill .25s" }} onClick={() => setOlindi((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]))} />)}
        {Array.from({ length: n }, (_, i) => { if (olindi.includes(i)) return null; const a = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
          return <circle key={`p${i}`} cx={C + R * 0.55 * Math.cos(a)} cy={C + R * 0.55 * Math.sin(a)} r="7" fill="#c0392b" pointerEvents="none" />; })}
      </svg>
      <div className="bo-kasr"><b>{k}</b><i /><b>{n}</b></div>
    </div>
    <div className="bo-hisob">{__kbUi("Oldingiz")}: <b>{k}</b> {__kbUi("ta bo‘lak")} {__kbUi("— pitsaning")} <b>{k}/{n}</b> {__kbUi("qismi")}{k && n % k === 0 && k !== n ? <> = <b>1/{n / k}</b></> : null}{k === n ? <> = <b>1</b> ({__kbUi("butun pitsa")})</> : null}</div>
    {k > 0 && <div className="bo-xulosa">{__kbUi(`Maxraj (${n}) — pitsa nechta teng bo‘lakka bo‘lingani, surat (${k}) — nechta bo‘lak olingani. Bo‘laklar ko‘paysa, har bo‘lak kichrayadi: 1/8 < 1/4.`)}</div>}
  </div>;
}

/** OYIN: tarozi 3 2 11 — tarozida 3x + 2 = 11: ikki pallaga bir xil amal qilib x ni topish. */
function TaroziOyin({ a = 3, b = 2, c = 11 }) {
  const [h, setH] = useState({ a, b, c, qadam: [] });
  const x = (c - b) / a;
  const ayir = () => { if (h.b > 0) setH((o) => ({ ...o, b: o.b - 1, c: o.c - 1, qadam: [...o.qadam, __kbUi("Ikkala pallasidan 1 ta toshni oldik")] })); };
  const bol = () => { if (h.b === 0 && h.a > 1 && h.c % h.a === 0) setH((o) => ({ a: 1, b: 0, c: o.c / o.a, qadam: [...o.qadam, __kbUi(`Ikkala pallani ${o.a} ga bo‘ldik`)] })); };
  const Quti = () => <span className="bo-quti">x</span>;
  const Tosh = () => <span className="bo-tosh">1</span>;
  return <div className="bo-oyin">
    <div className="bo-sarl">⚖️ {__kbUi(`Tarozi muvozanatda: ${a}x + ${b} = ${c}. Har ikki pallaga bir xil amal qilib, bitta qutida (x) nechta tosh borligini toping.`)}</div>
    <div className="bo-tarozi">
      <div className="bo-palla">{Array.from({ length: h.a }, (_, i) => <Quti key={`q${i}`} />)}{Array.from({ length: h.b }, (_, i) => <Tosh key={`t${i}`} />)}</div>
      <div className="bo-tarozi-ust">⚖️</div>
      <div className="bo-palla">{Array.from({ length: Math.min(h.c, 24) }, (_, i) => <Tosh key={i} />)}</div>
    </div>
    <div className="bo-hisob">{__kbUi("Tenglama")}: <b>{h.a > 1 ? h.a : ""}x{h.b ? ` + ${h.b}` : ""} = {h.c}</b></div>
    <div className="bo-qator">
      <button type="button" style={tugma} disabled={h.b === 0} onClick={ayir}>➖ {__kbUi("Ikkala pallasidan 1 tosh ol")}</button>
      <button type="button" style={tugma} disabled={!(h.b === 0 && h.a > 1)} onClick={bol}>➗ {__kbUi(`Ikkala pallani ${h.a} ga bo‘l`)}</button>
      <button type="button" style={tugma2} onClick={() => setH({ a, b, c, qadam: [] })}>↺</button>
    </div>
    {h.qadam.length > 0 && <div className="bo-hisob" style={{ fontSize: 14, opacity: 0.85 }}>{h.qadam.slice(-3).join(" → ")}</div>}
    {h.a === 1 && h.b === 0 && <div className="bo-xulosa">{__kbUi(`x = ${x}. Tarozi muvozanatini buzmaslik uchun ikkala pallaga doim bir xil amal qilinadi — tenglama ham shunday yechiladi.`)}</div>}
  </div>;
}

// ───────────── REV438: 1–4-sinf o'yinlari (narsalar bilan) ─────────────
const NARSA = { olma: "🍎", qalam: "✏️", shar: "🎈", konfet: "🍬", kitob: "📘", yulduz: "⭐", baliq: "🐟", gul: "🌷" };
/** OYIN: sana 5 olma — narsalarni bittadan bosib sanash; oxirgi son — jami. */
function SanaOyin({ n = 5, narsa = "olma" }) {
  const belgi = NARSA[narsa] || "🍎";
  const joy = useMemo(() => {   // panjara + biroz tartibsizlik: narsalar ustma-ust tushmaydi
    const kol = Math.ceil(Math.sqrt(n * 1.8)), qat = Math.ceil(n / kol);
    return Array.from({ length: n }, (_, i) => { const c = i % kol, r = Math.floor(i / kol), j = ((i * 7919) % 13) / 13 - 0.5;
      return [((c + 0.5) / kol) * 100 + j * (40 / kol), ((r + 0.5) / qat) * 100 + j * (30 / qat)]; });
  }, [n]);
  const [sanoq, setSanoq] = useState([]);
  const tayyor = sanoq.length === n;
  return <div className="bo-oyin">
    <div className="bo-sarl">👆 {__kbUi("Har bir narsani bittadan bosib sanang. Nechta ekan?")}</div>
    <div className="bo-maydon">{joy.map(([x, y], i) => { const k = sanoq.indexOf(i);
      return <button key={i} type="button" className={`bo-narsa ${k >= 0 ? "is-on" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => k < 0 && setSanoq((o) => [...o, i])}>
        <span>{belgi}</span>{k >= 0 && <b>{k + 1}</b>}</button>; })}</div>
    <div className="bo-hisob">{tayyor ? <>{__kbUi("Jami")}: <b style={{ fontSize: 26 }}>{n}</b> 🎉</> : <>{__kbUi("Sanadingiz")}: <b>{sanoq.length}</b></>}</div>
    {tayyor && <div className="bo-xulosa">{__kbUi(`Oxirgi aytilgan son — jami: ${n}. Narsalarni qayerga qo‘ysak ham, soni o‘zgarmaydi.`)}</div>}
    {sanoq.length > 0 && <button type="button" style={tugma2} onClick={() => setSanoq([])}>↺ {__kbUi("Qaytadan")}</button>}
  </div>;
}

/** OYIN: ramka 8 5 — o'nlik ramka: 8 ga 5 ni qo'shish — avval 10 gacha to'ldiramiz. */
function RamkaOyin({ a = 8, b = 5 }) {
  const [q, setQ] = useState(0);   // 0 — boshlang'ich, 1 — 10 gacha to'ldirildi, 2 — natija
  const tolDir = Math.min(10 - a, b), qoldi = b - tolDir;
  return <div className="bo-oyin">
    <div className="bo-sarl">🔟 {__kbUi(`${a} + ${b} = ? Avval o‘nlik ramkani to‘ldiramiz.`)}</div>
    <div className="bo-qator" style={{ alignItems: "flex-start", gap: 18 }}>
      <div className="bo-ramka">{Array.from({ length: 10 }, (_, i) => <span key={i}>{i < a ? <i className="is-a" /> : q >= 1 && i < a + tolDir ? <i className="is-b" /> : null}</span>)}</div>
      <div className="bo-ortiq">{Array.from({ length: q >= 1 ? qoldi : b }, (_, i) => <i key={i} className="is-b" />)}</div>
    </div>
    <div className="bo-hisob">{q === 0 ? `${a} + ${b}` : q === 1 ? `${a} + ${tolDir} = 10, ${__kbUi("yana")} ${qoldi}` : <>10 + {qoldi} = <b style={{ fontSize: 24 }}>{a + b}</b></>}</div>
    <div className="bo-qator">{q < 2 ? <button type="button" style={tugma} onClick={() => setQ(q + 1)}>{q === 0 ? __kbUi(`${tolDir} tasini ramkaga o‘tkaz`) : __kbUi("Natijani ko‘rsat")} →</button>
      : <button type="button" style={tugma2} onClick={() => setQ(0)}>↺</button>}</div>
    {q === 2 && <div className="bo-xulosa">{__kbUi(`${a} + ${b} = ${a} + ${tolDir} + ${qoldi} = 10 + ${qoldi} = ${a + b}. Avval 10 gacha to‘ldirish hisoblashni osonlashtiradi.`)}</div>}
  </div>;
}

/** OYIN: nur 6 2 — son nurida qurbaqa a dan b qadam sakraydi (manfiy b — orqaga). */
function NurOyin({ a = 6, b = 2, max = 10 }) {
  const [poz, setPoz] = useState(a);
  const maqsad = a + b, yon = b >= 0 ? 1 : -1, tugadi = poz === maqsad;
  const lo = Math.min(0, a, maqsad), hi = Math.max(max, a, maqsad), W = 520, sx = (v) => 20 + ((v - lo) / (hi - lo)) * (W - 40);
  return <div className="bo-oyin">
    <div className="bo-sarl">🐸 {__kbUi(`Qurbaqa ${a} da turibdi. ${b >= 0 ? `${b} qadam oldinga` : `${-b} qadam orqaga`} sakraydi. Qayerga tushadi?`)}</div>
    <svg viewBox={`0 0 ${W} 110`} className="bo-grafik" role="img" aria-label="son nuri">
      <line x1="10" y1="70" x2={W - 10} y2="70" stroke="#F4F1E8" strokeWidth="2" />
      {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((v) => <g key={v}><line x1={sx(v)} y1="62" x2={sx(v)} y2="78" stroke="#F4F1E8" /><text x={sx(v)} y="98" textAnchor="middle" fill={v === maqsad && tugadi ? "#FFD54A" : "#F4F1E8"} fontSize="15" fontWeight={v === poz ? 800 : 400}>{v}</text></g>)}
      {Array.from({ length: Math.abs(poz - a) }, (_, i) => { const x0 = sx(a + yon * i), x1 = sx(a + yon * (i + 1)); return <path key={i} d={`M${x0} 62 Q${(x0 + x1) / 2} 28 ${x1} 62`} fill="none" stroke="#FFD54A" strokeWidth="2.5" />; })}
      <text x={sx(poz)} y="56" textAnchor="middle" fontSize="28" style={{ transition: "all .35s" }}>🐸</text>
    </svg>
    <div className="bo-qator">{!tugadi ? <button type="button" style={tugma} onClick={() => setPoz((p) => p + yon)}>🐸 {__kbUi("Sakra")} ({Math.abs(poz - a) + 1})</button>
      : <button type="button" style={tugma2} onClick={() => setPoz(a)}>↺</button>}</div>
    <div className="bo-hisob">{tugadi ? <>{a} {b >= 0 ? "+" : "−"} {Math.abs(b)} = <b style={{ fontSize: 24 }}>{maqsad}</b></> : <>{__kbUi("Hozir")}: <b>{poz}</b></>}</div>
    {tugadi && <div className="bo-xulosa">{b >= 0 ? __kbUi("Qo‘shganda son nurida o‘ngga, katta sonlar tomonga yuramiz.") : __kbUi("Ayirganda son nurida chapga, kichik sonlar tomonga yuramiz.")}</div>}
  </div>;
}

/** OYIN: massiv 4 3 — 4 qator, har qatorda 3 tadan: qatorlarni bittadan chiqarib ko'paytirishni ko'rish; burish — o'rin almashtirish. */
function MassivOyin({ q = 4, u = 3 }) {
  const [k, setK] = useState(0);
  const [burildi, setBur] = useState(false);
  const qator = burildi ? u : q, ustun = burildi ? q : u;
  return <div className="bo-oyin">
    <div className="bo-sarl">🍎 {__kbUi(`${q} ta savatda ${u} tadan olma. Jami nechta?`)}</div>
    <div className="bo-massiv" style={{ gridTemplateColumns: `repeat(${ustun}, 34px)` }}>{Array.from({ length: qator * ustun }, (_, i) => <span key={i} style={{ opacity: burildi || Math.floor(i / ustun) < k ? 1 : 0.12 }}>🍎</span>)}</div>
    <div className="bo-hisob">{burildi ? <>{u} × {q} = <b>{q * u}</b> — {__kbUi("javob o‘zgarmadi!")}</> : k ? <>{Array(k).fill(u).join(" + ")} = <b>{k * u}</b>{k === q ? <> → {q} × {u} = <b>{q * u}</b></> : null}</> : __kbUi("Qatorlarni bittadan chiqaring")}</div>
    <div className="bo-qator">
      {!burildi && k < q && <button type="button" style={tugma} onClick={() => setK(k + 1)}>➕ {__kbUi(`yana ${u} ta`)}</button>}
      {k === q && !burildi && <button type="button" style={tugma} onClick={() => setBur(true)}>🔄 {__kbUi("90° bur")}</button>}
      <button type="button" style={tugma2} onClick={() => { setK(0); setBur(false); }}>↺</button>
    </div>
    {k === q && <div className="bo-xulosa">{__kbUi(`Bir xil qo‘shiluvchilar yig‘indisi ko‘paytma bo‘ladi: ${Array(q).fill(u).join(" + ")} = ${q} × ${u}.`)}{burildi ? " " + __kbUi(`Burilganda ham olmalar soni o‘zgarmaydi: ${q} × ${u} = ${u} × ${q}.`) : ""}</div>}
  </div>;
}

/** OYIN: juftla 4 3 — piyola va qoshiqlarni juftlab, qaysi biri ko'p/kam ekanini topish. */
function JuftlaOyin({ a = 4, b = 3 }) {
  const [j, setJ] = useState(false);
  const min = Math.min(a, b);
  return <div className="bo-oyin">
    <div className="bo-sarl">🍵 {__kbUi(`${a} ta piyola va ${b} ta qoshiq. Qaysi biri ko‘p? Juftlab tekshiring.`)}</div>
    <div className="bo-juft">{Array.from({ length: Math.max(a, b) }, (_, i) => <React.Fragment key={i}>
      <span className={j && i >= min ? "is-ortiq" : ""}>{i < a ? "🍵" : ""}</span>
      <i style={{ opacity: j && i < min ? 1 : 0 }} />
      <span className={j && i >= min ? "is-ortiq" : ""}>{i < b ? "🥄" : ""}</span></React.Fragment>)}</div>
    <div className="bo-qator"><button type="button" style={j ? tugma2 : tugma} onClick={() => setJ(!j)}>{j ? "↺" : `🔗 ${__kbUi("Juftla")}`}</button></div>
    {j && <div className="bo-xulosa">{a === b ? __kbUi("Hammasining jufti bor — teng.") : a > b ? __kbUi(`Jufti yo‘q piyola qoldi — piyola ko‘p, qoshiq ${a - b} ta kam: ${a} > ${b}.`) : __kbUi(`Jufti yo‘q qoshiq qoldi — qoshiq ko‘p: ${b} > ${a}.`)}</div>}
  </div>;
}

/** REV437: «Fan o'yinlari» bo'limi uchun ro'yxat — fan va daraja bo'yicha */
export const FAN_OYINLARI = [
  { fan: "Matematika · 1–4-sinf", oyinlar: [["sana 7 olma", "👆", "Sanab chiq", "Har narsani bittadan bosib sanash"], ["juftla 5 3", "🍵", "Ko‘p, kam, teng", "Juftlab taqqoslash"], ["nur 6 3 12", "🐸", "Son nurida sakrash", "Qo‘shish — o‘ngga, ayirish — chapga"], ["ramka 8 5", "🔟", "O‘nlik ramka", "8 + 5 — avval 10 gacha to‘ldiramiz"], ["massiv 4 3", "🍎", "Ko‘paytirish massivi", "4 × 3 — qatorlar va o‘rin almashtirish"]] },
  { fan: "Matematika · boshlang‘ich va 5–6-sinf", oyinlar: [["pitsa", "🍕", "Pitsa va kasrlar", "Pitsani bo‘lib, kasr nima ekanini ko‘ring"], ["tarozi 3 2 11", "⚖️", "Tarozida tenglama", "Ikkala pallaga bir xil amal — x ni toping"], ["ikkikub", "🎲🎲", "Ikki zar yig‘indisi", "Qaysi yig‘indi ko‘p tushadi?"]] },
  { fan: "Matematika · kombinatorika", oyinlar: [["joylashtir 3", "🎯", "Tartib tuz", "3 ta narsa necha xil tartiblanadi?"], ["joylashtir 4", "🎯", "Tartib tuz (4 ta)", "4 ta narsa — 24 tartibni toping"]] },
  { fan: "Ehtimollar nazariyasi", oyinlar: [["tanga", "🪙", "Tanga otish", "Nisbiy chastota 0,5 ga yaqinlashadimi?"], ["kub 6", "🎲", "Zar tashlash", "Har yuz ehtimoli 1/6"], ["karta 36", "🃏", "Dastadan karta", "Tuz chiqish ehtimoli"], ["qop 5 3", "👜", "Qopdan shar", "Shartli ehtimol"], ["venn 30 20 8", "⭕", "Venn diagrammasi", "Kesishma ikki marta sanalmasin"], ["daraxt 0,6 0,05 0,1", "🌳", "Ehtimollar daraxti", "To‘la ehtimol va Bayes"], ["nuqta", "🎯", "Kvadratga nuqtalar", "Geometrik ehtimol, π/4"], ["galton 10", "⚪", "Galton taxtasi", "Normal taqsimot qo‘ng‘irog‘i"]] },
  { fan: "Matematik statistika", oyinlar: [["tanlanma 25", "📏", "20 ta tanlanma", "95% ishonch oralig‘i nima degani"], ["chiziq", "📈", "Eng yaxshi chiziq", "Regressiya — eng kichik kvadratlar"]] },
];

export default function BoardOyin({ arg }) {
  const [tur, ...qolgan] = String(arg || "").trim().split(/\s+/);
  const n = parseInt(qolgan[0], 10);
  const t = (tur || "").toLowerCase();
  if (t === "joylashtir") return <Joylashtir n={n} />;
  if (t === "tanga") return <TangaJonli />;   // REV432: tanga havoga otiladi
  if (t === "kub") return <ZarJonli izlangan={n || 6} />;   // REV432: zar dumalaydi
  if (t === "galton") return <Galton qator={n} />;
  const nums = qolgan.map((x) => parseFloat(String(x).replace(",", ".")));
  if (t === "venn") return <VennOyin a={nums[0] || 30} b={nums[1] || 20} ab={nums[2] || 8} />;
  if (t === "daraxt") return <DaraxtOyin p1={nums[0] || 0.6} q1={nums[1] || 0.05} q2={nums[2] || 0.1} />;
  if (t === "ikkikub") return <IkkiKub />;
  if (t === "karta") return <KartaOyin soni={n === 52 ? 52 : 36} />;
  if (t === "pitsa") return <PitsaOyin />;
  if (t === "sana") return <SanaOyin n={nums[0] || 5} narsa={qolgan[1] || "olma"} />;
  if (t === "ramka") return <RamkaOyin a={nums[0] || 8} b={nums[1] || 5} />;
  if (t === "nur") return <NurOyin a={nums[0] || 0} b={Number.isFinite(nums[1]) ? nums[1] : 2} max={nums[2] || 10} />;
  if (t === "massiv") return <MassivOyin q={nums[0] || 4} u={nums[1] || 3} />;
  if (t === "juftla") return <JuftlaOyin a={nums[0] || 4} b={nums[1] || 3} />;
  if (t === "tarozi") return <TaroziOyin a={nums[0] || 3} b={nums[1] || 2} c={nums[2] || 11} />;
  if (t === "qop") return <QopOyin oq={nums[0] || 5} qora={nums[1] || 3} />;
  if (t === "nuqta") return <NuqtaOyin />;
  if (t === "tanlanma") return <TanlanmaOyin n={nums[0] || 25} />;
  if (t === "chiziq") return <ChiziqOyin />;
  return null;
}
