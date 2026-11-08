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

export default function BoardOyin({ arg }) {
  const [tur, ...qolgan] = String(arg || "").trim().split(/\s+/);
  const n = parseInt(qolgan[0], 10);
  const t = (tur || "").toLowerCase();
  if (t === "joylashtir") return <Joylashtir n={n} />;
  if (t === "tanga") return <Tajriba />;
  if (t === "kub") return <Tajriba kub tomon={n} />;
  if (t === "galton") return <Galton qator={n} />;
  const nums = qolgan.map((x) => parseFloat(String(x).replace(",", ".")));
  if (t === "venn") return <VennOyin a={nums[0] || 30} b={nums[1] || 20} ab={nums[2] || 8} />;
  if (t === "daraxt") return <DaraxtOyin p1={nums[0] || 0.6} q1={nums[1] || 0.05} q2={nums[2] || 0.1} />;
  if (t === "ikkikub") return <IkkiKub />;
  if (t === "nuqta") return <NuqtaOyin />;
  if (t === "tanlanma") return <TanlanmaOyin n={nums[0] || 25} />;
  if (t === "chiziq") return <ChiziqOyin />;
  return null;
}
