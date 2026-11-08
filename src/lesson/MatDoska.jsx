// REV269: MATEMATIKA JONLI DOSKASI — qator ustoz gapirayotgan payt qo'lda yozilayotgandek ochiladi, bo'r ushlagan qo'l
// yozuv bilan yuradi; buyruqli qatorlar (USTUN, BOLISH, QISQART, SON_OQI, GRAFIK, CHIZ, KASR_MODEL, DOIRA_KASR, BELGILA)
// chizmaga aylanadi va chiziqlari ham ovoz bilan birga chiziladi. progress — 0..1 (qancha yozilgan).
import React, { useMemo } from "react";
import katex from "katex";
import { orinAlmashQurish, orinlashtirTahlil, guruhlashTahlil, vennTahlil, daraxtTahlil, HARFLAR } from "./matDoska.js";   // REV425
import { BoardText } from "./AmaliyDoska.jsx";
import { splitCourseMath } from "../courses/CourseText.jsx";
import { stripSpeechTags } from "../speech/language.js";
import {
  bolishTahlil, buyruq, chizTahlil, doiraKasrTahlil, grafikTahlil, kasrModelTahlil, qisqartTahlil, sonOqiTahlil, ustunTahlil,
} from "./matDoska.js";

const CHALK = "var(--dx-chalk)", SARIQ = "var(--dx-yellow)", KOK = "var(--dx-blue)", PUSHTI = "#F4A6A6", YASHIL = "#A8E6A1";
const kesim = (p) => Math.min(1, Math.max(0, p));
// chiziq p ulushgacha chizilgan (pathLength=1)
// pathLength faqat <path>da ishonchli — aylana va to'rtburchak ham path bilan chiziladi; to'liq chizilgach chiziq yaxlit qoladi
const chiz = (p, from = 0, to = 1) => { const q = kesim((p - from) / Math.max(0.0001, to - from)); return q >= 1 ? {} : { strokeDasharray: 1, strokeDashoffset: 1 - q }; };
const aylanaYol = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
const tortYol = (x, y, w, h) => `M${x} ${y} H${x + w} V${y + h} H${x} Z`;
const DARAJA = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "-": "⁻" };
const chiroyli = (f) => String(f).replace(/\^\(?(-?\d+)\)?/g, (_, d) => [...d].map((c) => DARAJA[c] || c).join("")).replace(/\*/g, "·").replace(/-/g, "−").replace(/\bsqrt/g, "√");
const kor = (p, at) => ({ opacity: p >= at ? 1 : 0, transition: "opacity .25s" });

/** Bo'r ushlagan qo'l — yozuv uchida turadi. */
function Qol({ x = "100%", y = "70%" }) {
  return <span className="mdx-qol" style={{ left: x, top: y }} aria-hidden="true">
    <svg viewBox="0 0 40 40" width="34" height="34"><rect x="3" y="5" width="6" height="16" rx="2" transform="rotate(-35 6 13)" fill="#F7F5EC" stroke="#CFCAB8" />
      <path d="M12 16c4-6 13-8 19-4 4 3 5 9 2 14-3 6-10 9-16 7-4-1-6-4-6-8z" fill="#E9B98F" stroke="#B9875E" strokeWidth="1.2" /></svg>
  </span>;
}

// Matn va formula bo'laklari: matn harfma-harf, formula — chapdan o'ngga ochiladi (bir necha qatorga o'tsa ham to'g'ri)
function bolaklar(text) {
  return splitCourseMath(stripSpeechTags(String(text ?? ""))).map((part) => {
    if (!part.math) { const t = String(part.text ?? part.source ?? ""); return { t, w: t.length }; }
    let html = null;
    try { html = part.math.length > 3000 ? null : katex.renderToString(part.math, { displayMode: false, throwOnError: true, trust: false, strict: "ignore", maxExpand: 200, maxSize: 20, output: "html" }); } catch { html = null; }
    const korinadi = part.math.replace(/\\[a-zA-Z]+/g, " ").replace(/[{}^_\s]/g, "");
    return html ? { html, w: Math.max(2, korinadi.length) } : { t: part.source || part.math, w: String(part.source || part.math).length };
  });
}

/** Qo'lda yozilayotgan matn: progress 0..1. Yozilmagan qismi umuman chiqmaydi — qator xuddi bo'r bilan yozilgandek o'sadi. */
export function JonliMatn({ text, progress = 1, rang }) {
  const parts = useMemo(() => bolaklar(text), [text]);
  const p = kesim(progress);
  const jami = parts.reduce((a, b) => a + b.w, 0) || 1;
  let qoldi = p * jami;
  const out = [];
  for (const [i, b] of parts.entries()) {
    if (qoldi <= 0) break;
    const ulush = Math.min(1, qoldi / b.w);
    qoldi -= b.w;
    if (b.html) out.push(<span key={i} className="dx-math mdx-f" style={ulush < 1 ? { clipPath: `inset(-0.4em ${(1 - ulush) * 100}% -0.4em -0.2em)` } : undefined} dangerouslySetInnerHTML={{ __html: b.html }} />);
    else out.push(<React.Fragment key={i}>{ulush < 1 ? b.t.slice(0, Math.max(1, Math.round(b.t.length * ulush))) : b.t}</React.Fragment>);
    if (ulush < 1 || (qoldi <= 0 && p < 1)) { out.push(<span key="qol" className="mdx-qol-ich"><Qol x="0" y="0" /></span>); break; }
  }
  return <span className="mdx-matn" style={{ color: rang }}>{out}</span>;
}

/** Oddiy qator: chapdan o'ngga qo'lda yozilgandek ochiladi. */
export function JonliYoz({ children, progress = 1, rang }) {
  const p = kesim(progress);
  return <span className={`mdx-yoz ${p < 1 ? "is-yozilmoqda" : ""}`} style={{ color: rang }}>
    <span className="mdx-yoz-ich" style={{ clipPath: `inset(-0.3em ${(1 - p) * 100}% -0.3em -0.2em)` }}>{children}</span>
    {p > 0 && p < 1 && <Qol x={`${p * 100}%`} />}
  </span>;
}

function Ustun({ arg, progress }) {
  const t = ustunTahlil(arg);
  if (!t) return <JonliMatn text={arg} progress={progress} />;
  const w = t.kenglik;
  const pad = (s) => String(s).padStart(w, " ").split("");
  const qatorlar = [{ k: "a", r: pad(t.a) }, { k: "b", r: pad(t.op + t.b.padStart(Math.max(t.a.length, t.b.length), " ")) }];
  const qismlar = t.qismlar.map((q, i) => ({ k: `q${i}`, r: pad(q) }));
  // natija o'ngdan chapga yoziladi (xuddi daftardagidek), eslab qolinganlar tepada chiqadi
  const natija = pad(t.natija);
  const raqamlar = t.natija.length, ochiq = Math.round(kesim((progress - 0.35) / 0.65) * raqamlar);
  return <span className="mdx-ustun" role="img" aria-label={`${t.a} ${t.op} ${t.b} = ${t.natija}`}>
    <span className="mdx-ustun-qator mdx-eslab">{pad("").map((_, j) => { const ustun = w - 1 - j; const e = t.eslab[ustun]; return <i key={j} style={kor(progress, 0.35 + (ustun / (raqamlar + 1)) * 0.65)}>{e || " "}</i>; })}</span>
    {qatorlar.map((q, i) => <span key={q.k} className="mdx-ustun-qator" style={kor(progress, i * 0.15)}>{q.r.map((c, j) => <i key={j}>{c}</i>)}</span>)}
    <span className="mdx-ustun-chiziq" style={{ transform: `scaleX(${kesim((progress - 0.25) / 0.1)})` }} />
    {qismlar.map((q, i) => <React.Fragment key={q.k}><span className="mdx-ustun-qator" style={kor(progress, 0.35 + (i / (qismlar.length + 1)) * 0.4)}>{q.r.map((c, j) => <i key={j}>{c}</i>)}</span>
      {i === qismlar.length - 1 && <span className="mdx-ustun-chiziq" style={{ transform: `scaleX(${kesim((progress - 0.75) / 0.05)})` }} />}</React.Fragment>)}
    <span className="mdx-ustun-qator mdx-natija">{natija.map((c, j) => <i key={j} style={{ opacity: w - j <= ochiq ? 1 : 0, transition: "opacity .25s" }}>{c}</i>)}</span>
  </span>;
}

function Bolish({ arg, progress }) {
  const t = bolishTahlil(arg);
  if (!t) return <JonliMatn text={arg} progress={progress} />;
  const n = t.qadamlar.length;
  const at = (i) => 0.15 + (i / Math.max(1, n)) * 0.8;
  // daftardagidek: olingan son (tushirilgan raqam bilan), ostida ayiriladigan son va chiziq, oxirida qoldiq
  const qatorlar = [];
  t.qadamlar.forEach((q, i) => {
    if (i > 0 && q.olingan === 0) return;   // nolni tushirish bo'linmaga 0 yozish bilan kifoya — «−0» qatorlari yozilmaydi
    if (i > 0) qatorlar.push({ k: `o${i}`, matn: String(q.olingan), ustun: q.ustun, at: at(i) });
    qatorlar.push({ k: `a${i}`, matn: String(q.ayir), ustun: q.ustun, at: at(i) + 0.03, ayir: true });
  });
  const oxirgi = [...t.qadamlar].reverse().find((q, i) => i === n - 1 || q.olingan !== 0) || t.qadamlar[n - 1];
  // nollar tushirilgan bo'lsa qoldiq oxirgi yozilgan ayirmaning tagida turadi
  if (oxirgi) qatorlar.push({ k: "q", matn: String(t.qoldiq), ustun: t.qadamlar.filter((q, i) => i === 0 || q.olingan !== 0).pop().ustun, at: at(n - 1) + 0.08, qoldiq: true });
  return <span className="mdx-bolish" role="img" aria-label={`${t.a} : ${t.d} = ${t.bolinma}${t.qoldiq ? ` (${t.qoldiq})` : ""}`}>
    <span className="mdx-bolinuvchi">{t.a}</span><span className="mdx-bolivchi">{t.d}</span>
    <span className="mdx-bolish-qadamlar">{qatorlar.map((q) => <span key={q.k} className={`mdx-bolish-qadam ${q.ayir ? "is-ayir" : ""} ${q.qoldiq ? "mdx-bolish-qoldiq" : ""}`}
      style={{ ...kor(progress, q.at), paddingLeft: `${Math.max(0, q.ustun + 1 - q.matn.length)}ch` }}><span className="mdx-son">{q.ayir && <i className="mdx-minus">−</i>}{q.matn}</span></span>)}</span>
    <span className="mdx-bolinma">{t.bolinma.split("").map((c, i) => <i key={i} style={kor(progress, at(i))}>{c}</i>)}</span>
  </span>;
}

function Kasr({ s, m, rang }) { return <span className="mdx-kasr" style={{ color: rang }}><span>{s}</span><span>{m}</span></span>; }
function Qisqart({ arg, progress }) {
  const t = qisqartTahlil(arg);
  if (!t) return <JonliMatn text={arg} progress={progress} />;
  const p = kesim(progress);
  return <span className="mdx-qisqart" role="img" aria-label={`${t.eski[0]}/${t.eski[1]} = ${t.yangi[0]}/${t.yangi[1]}`}>
    <span className="mdx-qisqart-eski">
      <span className="mdx-ustiga" style={kor(p, 0.55)}>{t.yangi[0]}</span>
      <Kasr s={t.eski[0]} m={t.eski[1]} />
      <span className="mdx-ostiga" style={kor(p, 0.7)}>{t.yangi[1]}</span>
      <svg className="mdx-chizib" viewBox="0 0 40 60" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength="1" d="M6 24 L34 4" stroke={PUSHTI} strokeWidth="2.6" fill="none" style={chiz(p, 0.25, 0.4)} />
        <path pathLength="1" d="M6 56 L34 36" stroke={PUSHTI} strokeWidth="2.6" fill="none" style={chiz(p, 0.4, 0.55)} />
      </svg>
    </span>
    <span style={kor(p, 0.8)}>&nbsp;=&nbsp;</span>
    <span style={kor(p, 0.85)}><Kasr s={t.yangi[0]} m={t.yangi[1]} rang={YASHIL} /></span>
    <span className="mdx-izoh" style={kor(p, 0.15)}>(:{t.bol})</span>
  </span>;
}

function SonOqi({ arg, progress }) {
  const t = sonOqiTahlil(arg);
  if (!t) return <JonliMatn text={arg} progress={progress} />;
  const W = 520, x0 = 30, x1 = W - 30, X = (v) => x0 + ((v - t.min) / (t.max - t.min)) * (x1 - x0);
  const belgilar = [];
  for (let v = t.min; v <= t.max + 1e-9; v += t.qadam) belgilar.push(Math.round(v * 1000) / 1000);
  return <svg className="mdx-svg" viewBox={`0 0 ${W} 74`} role="img" aria-label={`son o'qi ${t.min}..${t.max}`}>
    <path pathLength="1" d={`M${x0 - 14} 34 H${x1 + 16}`} stroke={CHALK} strokeWidth="2.4" fill="none" style={chiz(progress, 0, 0.35)} />
    <path pathLength="1" d={`M${x1 + 6} 28 L${x1 + 16} 34 L${x1 + 6} 40`} stroke={CHALK} strokeWidth="2.4" fill="none" style={chiz(progress, 0.33, 0.38)} />
    {belgilar.map((v, i) => { const at = 0.35 + (i / belgilar.length) * 0.35; return <g key={v} style={kor(progress, at)}>
      <path d={`M${X(v)} 28 V40`} stroke={CHALK} strokeWidth="2" /><text x={X(v)} y="60" textAnchor="middle" fill={CHALK} fontSize="16">{v}</text></g>; })}
    {t.nuqtalar.map((n, i) => <g key={i} style={kor(progress, 0.75 + (i / Math.max(1, t.nuqtalar.length)) * 0.2)}>
      <circle cx={X(n.x)} cy="34" r="6" fill={SARIQ} /><text x={X(n.x)} y="18" textAnchor="middle" fill={SARIQ} fontSize="17" fontWeight="700">{n.yorliq}</text></g>)}
  </svg>;
}

function Grafik({ arg, progress }) {
  const t = grafikTahlil(arg);
  if (!t) return <JonliMatn text={arg} progress={progress} />;
  const W = 420, H = 300, m = 28;
  const ky = Math.max(t.ymax - t.ymin, 1e-9), kx = t.xmax - t.xmin;
  const X = (x) => m + ((x - t.xmin) / kx) * (W - 2 * m), Y = (y) => H - m - ((y - t.ymin) / ky) * (H - 2 * m);
  const ox = Math.min(Math.max(0, t.xmin), t.xmax), oy = Math.min(Math.max(0, t.ymin), t.ymax);
  const yol = t.bolaklar.map((b) => b.map(([x, y], i) => `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join(" "));
  const qadam = (a, b) => { const d = Math.abs(b - a); const s = d <= 10 ? 1 : d <= 20 ? 2 : d <= 50 ? 5 : 10; const out = []; for (let v = Math.ceil(a / s) * s; v <= b; v += s) if (v !== 0) out.push(v); return out; };
  return <svg className="mdx-svg mdx-grafik" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`y = ${t.ifoda}`}>
    {qadam(t.xmin, t.xmax).map((v) => <path key={`gx${v}`} d={`M${X(v)} ${m} V${H - m}`} stroke="rgba(242,240,230,.12)" style={kor(progress, 0.2)} />)}
    {qadam(t.ymin, t.ymax).map((v) => <path key={`gy${v}`} d={`M${m} ${Y(v)} H${W - m}`} stroke="rgba(242,240,230,.12)" style={kor(progress, 0.2)} />)}
    <path pathLength="1" d={`M${m - 8} ${Y(oy)} H${W - m + 10}`} stroke={CHALK} strokeWidth="2" fill="none" style={chiz(progress, 0, 0.15)} />
    <path pathLength="1" d={`M${X(ox)} ${H - m + 8} V${m - 10}`} stroke={CHALK} strokeWidth="2" fill="none" style={chiz(progress, 0.1, 0.25)} />
    <text x={W - m + 6} y={Y(oy) - 8} fill={CHALK} fontSize="16" style={kor(progress, 0.15)}>x</text>
    <text x={X(ox) + 8} y={m - 4} fill={CHALK} fontSize="16" style={kor(progress, 0.25)}>y</text>
    {qadam(t.xmin, t.xmax).map((v) => <text key={`tx${v}`} x={X(v)} y={Y(oy) + 18} textAnchor="middle" fill={CHALK} fontSize="12" style={kor(progress, 0.25)}>{v}</text>)}
    {qadam(t.ymin, t.ymax).map((v) => <text key={`ty${v}`} x={X(ox) - 6} y={Y(v) + 4} textAnchor="end" fill={CHALK} fontSize="12" style={kor(progress, 0.25)}>{v}</text>)}
    {yol.map((d, i) => <path pathLength="1" key={i} d={d} stroke={SARIQ} strokeWidth="3" fill="none" strokeLinecap="round" style={chiz(progress, 0.3, 0.95)} />)}
    <text x={W - m} y={12} textAnchor="end" fill={SARIQ} fontSize="18" style={kor(progress, 0.95)}>y = {chiroyli(t.ifoda)}</text>
  </svg>;
}

function Chizma({ arg, progress }) {
  const t = chizTahlil(arg);
  if (!t) return <JonliMatn text={arg} progress={progress} />;
  const W = 380, H = 260, m = 34;
  const kx = Math.max(t.xmax - t.xmin, 1e-9), ky = Math.max(t.ymax - t.ymin, 1e-9);
  const k = Math.min((W - 2 * m) / kx, (H - 2 * m) / ky);
  const ox = (W - kx * k) / 2, oy = (H - ky * k) / 2;
  const P = (n) => { const [x, y] = t.nuqtalar[n]; return [ox + (x - t.xmin) * k, H - oy - (y - t.ymin) * k]; };
  const n = t.shakllar.length;
  const oraliq = (i) => [0.05 + (i / n) * 0.8, 0.05 + ((i + 1) / n) * 0.8];
  const ishlatilgan = new Set(t.shakllar.flatMap((s) => (s.markaz ? [s.markaz] : s.uchlar)));
  const markaz = (() => { const v = Object.keys(t.nuqtalar).map(P); return [v.reduce((a, b) => a + b[0], 0) / v.length, v.reduce((a, b) => a + b[1], 0) / v.length]; })();
  return <svg className="mdx-svg mdx-chizma" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={arg}>
    {t.shakllar.map((s, i) => {
      const [a, b] = oraliq(i);
      if (s.tur === "aylana") { const [cx, cy] = P(s.markaz); return <path pathLength="1" key={i} d={aylanaYol(cx, cy, s.r * k)} stroke={KOK} strokeWidth="2.4" fill="none" style={chiz(progress, a, b)} />; }
      if (s.tur === "nuqtalar") return null;
      if (s.tur === "burchak") {
        const [A, B, C] = s.uchlar.map(P); const r = 22;
        const u = (p) => { const dx = p[0] - B[0], dy = p[1] - B[1], l = Math.hypot(dx, dy) || 1; return [B[0] + (dx / l) * r, B[1] + (dy / l) * r]; };
        const [p1, p2] = [u(A), u(C)];
        return <path pathLength="1" key={i} d={`M${p1[0]} ${p1[1]} A${r} ${r} 0 0 ${((A[0] - B[0]) * (C[1] - B[1]) - (A[1] - B[1]) * (C[0] - B[0])) > 0 ? 1 : 0} ${p2[0]} ${p2[1]}`} stroke={SARIQ} strokeWidth="2" fill="none" style={chiz(progress, a, b)} />;
      }
      const uchlar = s.uchlar.map(P);
      const yopiq = s.tur === "kopburchak";
      const d = uchlar.map((p, j) => `${j ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + (yopiq ? " Z" : "");
      const rang = s.tur === "kesma" ? (s.belgi === "tik" ? PUSHTI : KOK) : CHALK;
      return <path key={i} pathLength={s.belgi === "tik" ? undefined : 1} d={d} stroke={rang} strokeWidth={s.tur === "kopburchak" ? 2.8 : 2.2} strokeDasharray={s.belgi === "tik" ? "6 5" : undefined} fill="none" strokeLinejoin="round" style={s.belgi === "tik" ? kor(progress, a) : chiz(progress, a, b)} />;
    })}
    {[...ishlatilgan].filter((nm) => t.nuqtalar[nm]).map((nm) => { const [x, y] = P(nm); const dx = x - markaz[0], dy = y - markaz[1], l = Math.hypot(dx, dy) || 1;
      return <g key={nm} style={kor(progress, 0.85)}><circle cx={x} cy={y} r="3.4" fill={CHALK} /><text x={x + (dx / l) * 16} y={y + (dy / l) * 16 + 6} textAnchor="middle" fill={CHALK} fontSize="18" fontWeight="700">{nm}</text></g>; })}
  </svg>;
}

function KasrModel({ arg, progress }) {
  const t = kasrModelTahlil(arg);
  if (!t) return <JonliMatn text={arg} progress={progress} />;
  const S = 200, x0 = 20, y0 = 14, w = S / t.b, h = S / t.d;
  const kataklar = [];
  for (let i = 0; i < t.b; i++) for (let j = 0; j < t.d; j++) kataklar.push([i, j]);
  return <span className="mdx-model" role="img" aria-label={`${t.a}/${t.b} · ${t.c}/${t.d} = ${t.surat}/${t.maxraj}`}>
    <svg className="mdx-svg" viewBox={`0 0 ${S + 40} ${S + 28}`} style={{ maxWidth: 240 }}>
      {/* 1) a/b — ustunlar ko'k; 2) c/d — qatorlar sariq; 3) kesishma — yashil */}
      {kataklar.map(([i, j]) => { const ust = i < t.a, qat = j >= t.d - t.c;
        return <rect key={`${i}-${j}`} x={x0 + i * w} y={y0 + j * h} width={w} height={h}
          fill={ust && qat && progress >= 0.75 ? YASHIL : ust && progress >= 0.25 ? KOK : qat && progress >= 0.55 ? SARIQ : "transparent"} fillOpacity={ust && qat && progress >= 0.75 ? 0.75 : 0.35} style={{ transition: "fill .3s, fill-opacity .3s" }} />; })}
      <path pathLength="1" d={tortYol(x0, y0, S, S)} stroke={CHALK} strokeWidth="2.6" fill="none" style={chiz(progress, 0, 0.12)} />
      {Array.from({ length: t.b - 1 }, (_, i) => <path pathLength="1" key={`v${i}`} d={`M${x0 + (i + 1) * w} ${y0} V${y0 + S}`} stroke={CHALK} strokeWidth="1.8" style={chiz(progress, 0.12, 0.25)} />)}
      {Array.from({ length: t.d - 1 }, (_, j) => <path pathLength="1" key={`h${j}`} d={`M${x0} ${y0 + (j + 1) * h} H${x0 + S}`} stroke={CHALK} strokeWidth="1.8" style={chiz(progress, 0.4, 0.55)} />)}
    </svg>
    <span className="mdx-model-yozuv">
      <span style={kor(progress, 0.25)}><Kasr s={t.a} m={t.b} rang={KOK} /></span>
      <span style={kor(progress, 0.55)}>&nbsp;·&nbsp;<Kasr s={t.c} m={t.d} rang={SARIQ} /></span>
      <span style={kor(progress, 0.85)}>&nbsp;=&nbsp;<Kasr s={t.surat} m={t.maxraj} rang={YASHIL} /></span>
    </span>
  </span>;
}

function DoiraKasr({ arg, progress }) {
  const t = doiraKasrTahlil(arg);
  if (!t) return <JonliMatn text={arg} progress={progress} />;
  const R = 80, c = 96;
  const nuqta = (k) => [c + R * Math.sin((2 * Math.PI * k) / t.b), c - R * Math.cos((2 * Math.PI * k) / t.b)];
  return <span className="mdx-model" role="img" aria-label={`${t.a}/${t.b}`}>
    <svg className="mdx-svg" viewBox="0 0 192 192" style={{ maxWidth: 190 }}>
      {Array.from({ length: t.a }, (_, k) => { const [x1, y1] = nuqta(k), [x2, y2] = nuqta(k + 1);
        return <path key={`s${k}`} d={`M${c} ${c} L${x1} ${y1} A${R} ${R} 0 ${t.b === 1 ? 1 : 0} 1 ${x2} ${y2} Z`} fill={SARIQ} fillOpacity=".55" style={kor(progress, 0.5 + (k / Math.max(1, t.a)) * 0.4)} />; })}
      <path pathLength="1" d={aylanaYol(c, c, R)} stroke={CHALK} strokeWidth="2.6" fill="none" style={chiz(progress, 0, 0.25)} />
      {t.b > 1 && Array.from({ length: t.b }, (_, k) => { const [x, y] = nuqta(k); return <path pathLength="1" key={`r${k}`} d={`M${c} ${c} L${x} ${y}`} stroke={CHALK} strokeWidth="1.8" style={chiz(progress, 0.25, 0.5)} />; })}
    </svg>
    <span className="mdx-model-yozuv" style={kor(progress, 0.9)}><Kasr s={t.a} m={t.b} rang={SARIQ} /></span>
  </span>;
}

function Belgila({ arg, progress }) {
  const m = String(arg).match(/^([\s\S]*?)\s+(aylana|tag|ramka)\s*$/i);
  const matn = m ? m[1] : arg, tur = m ? m[2].toLowerCase() : "aylana";
  return <span className="mdx-belgila">
    <JonliMatn text={matn} progress={kesim(progress / 0.6)} />
    <svg className={`mdx-belgila-svg is-${tur}`} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      {tur === "tag" ? <path pathLength="1" d="M2 36 Q50 30 98 35" stroke={SARIQ} strokeWidth="2.4" fill="none" vectorEffect="non-scaling-stroke" style={chiz(progress, 0.6, 1)} />
        : tur === "ramka" ? <path pathLength="1" d={tortYol(2, 2, 96, 36)} stroke={SARIQ} strokeWidth="2.4" fill="none" vectorEffect="non-scaling-stroke" style={chiz(progress, 0.6, 1)} />
        : <path pathLength="1" d="M50 3 C88 1 99 14 96 24 C92 36 60 39 38 37 C10 35 1 26 4 15 C7 5 30 2 56 5" stroke={SARIQ} strokeWidth="2.4" fill="none" vectorEffect="non-scaling-stroke" style={chiz(progress, 0.6, 1)} />}
    </svg>
  </span>;
}

// ───────────── REV425: formulaning kelib chiqishi — harakatli chizmalar ─────────────
const RANG = { A: "#F4A6A6", B: "#A8E6A1", C: "#9CC9FF", D: "#FFD37A", E: "#D7B4F3", F: "#FFB38A", G: "#8EE0D6", H: "#E8E8E8" };
function Shar({ x, y, h, r = 13, yangi = false, korinish = 1, xira = false }) {
  return <g style={{ opacity: korinish, transform: korinish < 1 && yangi ? "translateY(-18px)" : "none", transition: "opacity .35s, transform .45s cubic-bezier(.2,1.4,.4,1)", transformBox: "fill-box" }}>
    <circle cx={x} cy={y} r={r} fill={RANG[h] || "#ddd"} stroke={yangi ? "var(--dx-yellow)" : "rgba(0,0,0,.25)"} strokeWidth={yangi ? 3 : 1.2} opacity={xira ? 0.35 : 1} />
    <text x={x} y={y + 5} textAnchor="middle" fontSize={r * 1.05} fontWeight="800" fill="#1d2b3a" opacity={xira ? 0.5 : 1}>{h}</text></g>;
}
const faktorial = (n) => (n <= 1 ? 1 : n * faktorial(n - 1));

/** ORIN_ALMASH: n — (n−1)! ta tartibning har biriga yangi narsa n xil joyga qo'yiladi: n! = n·(n−1)!
 *  n ≤ 3 — hamma guruh to'liq; n = 4 — birinchi guruh to'liq, qolgan asoslar «→ ×4» bilan (doskaga yirik sig'adi). */
function OrinAlmash({ arg, progress }) {
  const q = orinAlmashQurish(arg);
  const n = q.n, r = 16, d = r * 2 + 6;
  const sarlavha = n === 1 ? "1 ta narsa — 1 xil tartib" : `${n - 1}! = ${faktorial(n - 1)} ta tartibning har biriga ${HARFLAR[n - 1]} ni ${n} xil joyga qo‘yamiz`;
  const xulosa = n === 1 ? "1! = 1" : `${n}! = ${n} · ${n - 1}! = ${n} · ${faktorial(n - 1)} = ${q.jami}`;
  if (n <= 3) {
    const qatorEni = n * d + 28, gEni = n * qatorEni + 24, gH = 40 + d + 14, W = Math.max(560, 32 + gEni), H = 54 + q.guruhlar.length * (gH + 12) + 40;
    let raqam = 0;
    return <svg className="mdx-svg mdx-kombin" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={xulosa}>
      <text x="16" y="30" fill={CHALK} fontSize="20" fontWeight="700">{sarlavha}</text>
      {q.guruhlar.map((g, gi) => { const gx = 16, gy = 48 + gi * (gH + 12);
        return <g key={gi}>
          <rect x={gx} y={gy} width={gEni} height={gH} rx="14" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.2)" />
          {g.asos.length > 0 && <text x={gx + 14} y={gy + 24} fill={CHALK} fontSize="15" opacity=".85">{`${g.asos.join("")} dan:`}</text>}
          {g.tartiblar.map((t, ti) => { raqam += 1; const at = 0.08 + (0.75 * (raqam - 1)) / Math.max(1, q.jami); const cx = gx + 14 + ti * qatorEni, cy = gy + 36 + r;
            return <g key={ti}>{t.map((h, hi) => <Shar key={hi} x={cx + hi * d + r} y={cy} h={h} r={r} yangi={h === g.yangi && n > 1} korinish={progress >= at ? 1 : 0} />)}</g>; })}
        </g>; })}
      <text x="16" y={H - 12} fill={SARIQ} fontSize="22" fontWeight="800" style={kor(progress, 0.88)}>{xulosa}</text>
    </svg>;
  }
  // n = 4: chapda 3! = 6 ta asos ustunda; birinchisi o'ngda 4 ta yangi tartibga yoyiladi, qolganlarida «→ ×4»
  const qatorEni = n * d + 26, W = 40 + 3 * d + 70 + n * qatorEni, H = 60 + 6 * (d + 10) + 50;
  const birinchi = q.guruhlar[0];
  return <svg className="mdx-svg mdx-kombin" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={xulosa}>
    <text x="16" y="30" fill={CHALK} fontSize="20" fontWeight="700">{sarlavha}</text>
    {q.guruhlar.map((g, gi) => { const y = 64 + gi * (d + 10) + r, at = 0.06 + gi * 0.05;
      return <g key={gi} style={kor(progress, at)}>
        {g.asos.map((h, hi) => <Shar key={hi} x={24 + hi * d + r} y={y} h={h} r={r} />)}
        <text x={24 + 3 * d + 14} y={y + 6} fill={gi === 0 ? SARIQ : CHALK} fontSize="18" fontWeight="800" style={gi === 0 ? undefined : kor(progress, 0.62 + gi * 0.04)}>{gi === 0 ? "→" : `→ ×${n}`}</text>
      </g>; })}
    {birinchi.tartiblar.map((t, ti) => { const x0 = 40 + 3 * d + 60 + ti * qatorEni, y = 64 + r, at = 0.3 + ti * 0.07;
      return <g key={ti}>{t.map((h, hi) => <Shar key={hi} x={x0 + hi * d + r} y={y} h={h} r={r} yangi={h === birinchi.yangi} korinish={progress >= at ? 1 : 0} />)}</g>; })}
    <text x={40 + 3 * d + 60} y={64 + 2 * r + 30} fill={CHALK} fontSize="15" opacity=".85" style={kor(progress, 0.58)}>{`har bir asosdan ${n} ta yangi tartib: ${HARFLAR[n - 1]} ni ${n} ta joyga qo‘yamiz`}</text>
    <text x="16" y={H - 14} fill={SARIQ} fontSize="22" fontWeight="800" style={kor(progress, 0.88)}>{xulosa}</text>
  </svg>;
}

/** ORINLASHTIR: n k — k ta joy; 1-joyga n xil, 2-joyga (n−1) xil… ⇒ A = n·(n−1)·…·(n−k+1) = n!/(n−k)! */
function Orinlashtir({ arg, progress }) {
  const t = orinlashtirTahlil(arg);
  if (!t) return <JonliMatn text={arg} progress={progress} />;
  const { n, k } = t, r = 15, W = Math.max(560, 40 + Math.max(n * 38, k * 120)), H = 236;
  const tanlov = Array.from({ length: k }, (_, i) => n - i), A = tanlov.reduce((a, b) => a * b, 1);
  const qadam = (i) => 0.15 + (0.6 * i) / k;
  return <svg className="mdx-svg mdx-kombin" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`A ${n} ${k} = ${A}`}>
    <text x="16" y="22" fill={CHALK} fontSize="16" fontWeight="700">{`${n} ta narsa, lekin joy faqat ${k} ta`}</text>
    {HARFLAR.slice(0, n).map((h, i) => { const tushdi = i < k && progress >= qadam(i) + 0.08;
      return <Shar key={h} x={30 + i * 36} y={56} h={h} r={r} xira={tushdi || (progress >= 0.85 && i >= k)} />; })}
    {tanlov.map((v, i) => { const x = 40 + i * 110;
      return <g key={i}>
        <rect x={x} y={92} width={90} height={46} rx="10" fill="none" stroke={CHALK} strokeWidth="2" strokeDasharray="6 4" style={kor(progress, 0.05)} />
        <g style={kor(progress, qadam(i) + 0.08)}><Shar x={x + 45} y={115} h={HARFLAR[i]} r={r} yangi /></g>
        <text x={x + 45} y={160} textAnchor="middle" fill={SARIQ} fontSize="17" fontWeight="800" style={kor(progress, qadam(i))}>{`${v} xil`}</text>
        {i < k - 1 && <text x={x + 100} y={120} textAnchor="middle" fill={CHALK} fontSize="20" style={kor(progress, qadam(i + 1))}>·</text>}
      </g>; })}
    <text x="16" y={196} fill={SARIQ} fontSize="18" fontWeight="800" style={kor(progress, 0.85)}>{`A = ${tanlov.join(" · ")} = ${A} = ${n}! / ${n - k}!`}</text>
    {n > k && <text x="16" y={224} fill={CHALK} fontSize="15" opacity=".9" style={kor(progress, 0.9)}>{`chetda qolgan ${n - k} tasining tartibi muhim emas — shuning uchun ${n}! ni (${n - k})! ga bo‘lamiz`}</text>}
  </svg>;
}

/** GURUHLASH: n k — tanlangan k ta narsaning k! xil tartibi bitta guruh ⇒ C = A / k! */
function Guruhlash({ arg, progress }) {
  const t = guruhlashTahlil(arg);
  if (!t) return <JonliMatn text={arg} progress={progress} />;
  const { n, k } = t, harf = HARFLAR.slice(0, k);
  const tartiblar = []; const yasa = (q, qolgan) => { if (!qolgan.length) { tartiblar.push(q); return; } qolgan.forEach((h, i) => yasa([...q, h], [...qolgan.slice(0, i), ...qolgan.slice(i + 1)])); }; yasa([], harf);
  let A = 1; for (let i = 0; i < k; i += 1) A *= n - i;
  const r = 12, d = 2 * r + 3, W = Math.max(560, 40 + tartiblar.length * (k * d + 16)), H = 200;
  return <svg className="mdx-svg mdx-kombin" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`C ${n} ${k}`}>
    <text x="16" y="22" fill={CHALK} fontSize="16" fontWeight="700">{`Tartib muhim emas: ${harf.join(", ")} ning hamma tartibi — bitta guruh`}</text>
    {tartiblar.map((tt, i) => { const x = 20 + i * (k * d + 16), at = 0.1 + (0.5 * i) / tartiblar.length;
      return <g key={i} style={kor(progress, at)}>{tt.map((h, j) => <Shar key={j} x={x + j * d + r} y={64} h={h} r={r} />)}</g>; })}
    <path d={`M20 92 Q ${W / 2} 140 ${W - 20} 92`} stroke={SARIQ} strokeWidth="2.4" fill="none" pathLength="1" style={chiz(progress, 0.62, 0.75)} />
    <g style={kor(progress, 0.75)}>{harf.map((h, j) => <Shar key={j} x={W / 2 - ((k - 1) * d) / 2 + j * d} y={140} h={h} r={r} yangi />)}
      <text x={W / 2 + (k * d) / 2 + 14} y={146} fill={SARIQ} fontSize="15" fontWeight="700">{`${tartiblar.length} = ${k}! tartib → 1 guruh`}</text></g>
    <text x="16" y={188} fill={SARIQ} fontSize="18" fontWeight="800" style={kor(progress, 0.88)}>{`C = A / ${k}! = ${A} / ${tartiblar.length} = ${A / tartiblar.length}`}</text>
  </svg>;
}

/** VENN: A=…; B=…; AB=…; jami=… — kesishma ikki marta sanalmasin: P(A+B) = P(A) + P(B) − P(AB) */
function Venn({ arg, progress }) {
  const o = vennTahlil(arg);
  if (!o) return <JonliMatn text={arg} progress={progress} />;
  return <svg className="mdx-svg mdx-kombin" viewBox="0 0 520 210" role="img" aria-label="Venn">
    <rect x="10" y="10" width="500" height="170" rx="14" fill="none" stroke={CHALK} strokeWidth="2" pathLength="1" style={chiz(progress, 0, 0.15)} />
    {o.JAMI && <text x="22" y="32" fill={CHALK} fontSize="14" style={kor(progress, 0.1)}>{`Ω: ${o.JAMI}`}</text>}
    <circle cx="210" cy="95" r="70" fill="rgba(244,166,166,.35)" stroke="#F4A6A6" strokeWidth="2.5" style={kor(progress, 0.2)} />
    <circle cx="310" cy="95" r="70" fill="rgba(156,201,255,.35)" stroke="#9CC9FF" strokeWidth="2.5" style={kor(progress, 0.35)} />
    <text x="160" y="100" fill={CHALK} fontSize="20" fontWeight="800" textAnchor="middle" style={kor(progress, 0.25)}>{`A ${o.A || ""}`}</text>
    <text x="360" y="100" fill={CHALK} fontSize="20" fontWeight="800" textAnchor="middle" style={kor(progress, 0.4)}>{`B ${o.B || ""}`}</text>
    {o.AB && <g style={kor(progress, 0.55)}><text x="260" y="100" fill={SARIQ} fontSize="18" fontWeight="800" textAnchor="middle">{o.AB}</text>
      <text x="260" y="122" fill={SARIQ} fontSize="12" textAnchor="middle">AB — ikki marta sanaldi</text></g>}
    <text x="16" y="202" fill={SARIQ} fontSize="17" fontWeight="800" style={kor(progress, 0.8)}>{`A + B = ${o.A || "A"} + ${o.B || "B"} − ${o.AB || "AB"}${o.A && o.B && o.AB && /^\d+$/.test(o.A + o.B + o.AB) ? ` = ${+o.A + +o.B - +o.AB}` : ""}`}</text>
  </svg>;
}

/** DARAXT: p1 | p2 / q1 | q2 — ehtimollar daraxti: shox bo'yicha ko'paytiriladi */
function Daraxt({ arg, progress }) {
  const b = daraxtTahlil(arg);
  if (!b) return <JonliMatn text={arg} progress={progress} />;
  const [b1, b2] = b, W = 560, H = 60 + (b2 ? b1.length * b2.length : b1.length) * 34;
  const y1 = (i) => (H / (b1.length + 1)) * (i + 1);
  const son = (x) => Number(String(x).replace(",", "."));
  return <svg className="mdx-svg mdx-kombin" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="ehtimollar daraxti">
    <circle cx="30" cy={H / 2} r="6" fill={CHALK} />
    {b1.map((p, i) => <g key={i}>
      <path d={`M30 ${H / 2} L190 ${y1(i)}`} stroke={CHALK} strokeWidth="2.2" pathLength="1" style={chiz(progress, 0.05 + i * 0.1, 0.2 + i * 0.1)} />
      <text x={100} y={(H / 2 + y1(i)) / 2 - 6} fill={SARIQ} fontSize="16" fontWeight="800" style={kor(progress, 0.15 + i * 0.1)}>{p}</text>
      <circle cx="190" cy={y1(i)} r="5" fill={CHALK} style={kor(progress, 0.2 + i * 0.1)} />
      {b2 && b2.map((q, j) => { const n = b2.length, y2 = y1(i) + (j - (n - 1) / 2) * 30, at = 0.45 + (i * n + j) * 0.06;
        const v = son(p) * son(q);
        return <g key={j}><path d={`M190 ${y1(i)} L350 ${y2}`} stroke={CHALK} strokeWidth="2" pathLength="1" style={chiz(progress, at, at + 0.08)} />
          <text x={262} y={(y1(i) + y2) / 2 - 4} fill={SARIQ} fontSize="14" fontWeight="700" style={kor(progress, at + 0.04)}>{q}</text>
          <text x={360} y={y2 + 5} fill={CHALK} fontSize="15" style={kor(progress, at + 0.08)}>{`${p} · ${q}${Number.isFinite(v) ? ` = ${String(Math.round(v * 10000) / 10000).replace(".", ",")}` : ""}`}</text></g>; })}
    </g>)}
  </svg>;
}

/** Bitta doska qatori (buyruqli yoki oddiy). */
export function MatQator({ qator, progress = 1, Matn = BoardText }) {
  const b = qator.tur ? qator : { ...buyruq(qator.matn ?? qator), qismlar: null };
  const p = kesim(progress);
  switch (b.tur) {
    case "ustun": return <Ustun arg={b.arg} progress={p} />;
    case "bolish": return <Bolish arg={b.arg} progress={p} />;
    case "qisqart": return <Qisqart arg={b.arg} progress={p} />;
    case "son_oqi": return <SonOqi arg={b.arg} progress={p} />;
    case "grafik": return <Grafik arg={b.arg} progress={p} />;
    case "chiz": return <Chizma arg={b.arg} progress={p} />;
    case "kasr_model": return <KasrModel arg={b.arg} progress={p} />;
    case "doira_kasr": return <DoiraKasr arg={b.arg} progress={p} />;
    case "belgila": return <Belgila arg={b.arg} progress={p} />;
    case "orin_almash": return <OrinAlmash arg={b.arg} progress={p} />;   // REV425
    case "orinlashtir": return <Orinlashtir arg={b.arg} progress={p} />;
    case "guruhlash": return <Guruhlash arg={b.arg} progress={p} />;
    case "venn": return <Venn arg={b.arg} progress={p} />;
    case "daraxt": return <Daraxt arg={b.arg} progress={p} />;
    case "ochir": return null;
    default: {
      const qismlar = qator.qismlar && qator.qismlar.length > 1 ? qator.qismlar : null;
      if (qismlar) {
        // DAVOM bilan qo'shilgan bo'laklar — har biri o'z vaqtida yoziladi
        const ps = qator.qismProgress || qismlar.map(() => p);
        return <span className="mdx-davom">{qismlar.map((q, i) => ps[i] > 0 && <JonliMatn key={i} text={q.matn} progress={ps[i]} rang={b.tur === "qoida" ? SARIQ : undefined} />)}</span>;
      }
      return Matn === BoardText ? <JonliMatn text={b.arg} progress={p} rang={b.tur === "qoida" ? SARIQ : undefined} /> : <JonliYoz progress={p}><Matn text={b.arg} /></JonliYoz>;
    }
  }
}

/** «Esda tut» burchagi — darsdagi QOIDA qatorlari doskada o'chmay turadi. */
export function EsdaTut({ qoidalar, sarlavha = "Esda tut" }) {
  if (!qoidalar?.length) return null;
  return <aside className="mdx-esda" aria-label={sarlavha}><b>{sarlavha}</b>{qoidalar.map((q, i) => <div key={i}><BoardText text={q} /></div>)}</aside>;
}

/** Latta bilan o'chirish — OCHIR qatoriga yetganda doska tozalanadi. */
export function Latta({ progress = 1 }) {
  const p = kesim(progress);
  if (p >= 1 || p <= 0) return null;
  return <span className="mdx-latta" style={{ left: `${p * 100}%` }} aria-hidden="true" />;
}
