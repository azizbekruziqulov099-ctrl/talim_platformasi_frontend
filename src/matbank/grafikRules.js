// REV565: virtual doska — funksiya grafigi, nollar, ekstremum, aniq integral, birlik aylana. Sof hisoblash (brauzersiz sinaladi).
// Ifoda matni formula yozish bilan bir xil tahlilchidan o'tadi (2x, ax^2, sin(x), sqrt, abs, exp, pi, e); x dan boshqa harflar PARAMETR (sirpanuvchi).
import { hisobla, tahlil } from "../formula/formulaRules.js";

const KONSTANTA = { e: Math.E };
const MAX_UZUNLIK = 120;

/** Ifoda matni → { daraxt, parametrlar:[…] } yoki { xato }. «y=» boshi ixtiyoriy. */
export function ifodaTayyorla(matn) {
  let s = String(matn ?? "").trim().replace(/^\s*[yf](\(x\))?\s*=\s*/i, "");
  if (!s) return { xato: "bosh" }; if (s.length > MAX_UZUNLIK) return { xato: "uzun" };
  if (s.includes("=")) return { xato: "tenglik" };
  const t = tahlil(s); if (t.xato) return { xato: t.xato };
  const harf = new Set(); const yig = (d) => { if (!d) return; if (d.n === "x") harf.add(d.v); if (d.a) yig(d.a); if (d.b) yig(d.b); }; yig(t.chap);
  const parametrlar = [...harf].filter((h) => h !== "x" && !(h in KONSTANTA)).sort();
  if (parametrlar.length > 4) return { xato: "kop_parametr" };
  return { daraxt: t.chap, parametrlar };
}

/** Daraxt va parametr qiymatlari → f(x). Hisoblab bo'lmasa NaN. */
export function funksiya(daraxt, qiymatlar = {}) {
  const ozg = { ...KONSTANTA, ...qiymatlar };
  return (x) => { try { ozg.x = x; const y = hisobla(daraxt, { ozg }); return typeof y === "number" ? y : NaN; } catch { return NaN; } };
}

/** Tugunlar bo'yicha chiziq bo'laklari: uzilish (NaN, cheksiz, asimptota sakrashi) joyida chiziq UZILADI. → [[ [x,y], … ], …] */
export function yollar(f, xmin, xmax, ymin, ymax, N = 700) {
  const out = []; let cur = []; const bal = ymax - ymin; let oldin = null;
  for (let i = 0; i <= N; i += 1) {
    const x = xmin + ((xmax - xmin) * i) / N; const y = f(x);
    if (!Number.isFinite(y) || Math.abs(y) > 1e6) { if (cur.length > 1) out.push(cur); cur = []; oldin = null; continue; }
    if (oldin !== null && Math.abs(y - oldin) > 3 * bal && Math.sign(y) !== Math.sign(oldin)) { if (cur.length > 1) out.push(cur); cur = []; }   // tg, 1/x kabi asimptota
    cur.push([x, y]); oldin = y;
  }
  if (cur.length > 1) out.push(cur);
  return out;
}

/** f(x)=0 ildizlari: ishora o'zgarishi + bissektsiya; uzilish (asimptota) ildiz hisoblanmaydi. Juft karrali ildiz (urinish) ham topiladi (|f| kichik minimum). */
export function nollar(f, xmin, xmax, N = 4000) {
  const out = []; const h = (xmax - xmin) / N; const eps = 1e-7;
  let xa = xmin, ya = f(xa);
  for (let i = 1; i <= N; i += 1) {
    const xb = xmin + h * i, yb = f(xb);
    if (Number.isFinite(ya) && Number.isFinite(yb)) {
      if (ya === 0) { out.push(xa); } else if (ya * yb < 0) {
        let a = xa, b = xb, fa = ya;
        for (let k = 0; k < 60; k += 1) { const m = (a + b) / 2, fm = f(m); if (fa * fm <= 0) b = m; else { a = m; fa = fm; } }
        const r = (a + b) / 2; if (Math.abs(f(r)) < 1e-5 * Math.max(1, Math.abs(ya), Math.abs(yb))) out.push(r);
      }
    }
    xa = xb; ya = yb;
  }
  if (Number.isFinite(ya) && ya === 0) out.push(xa);
  const noyob = []; for (const r of out) if (!noyob.some((q) => Math.abs(q - r) < 1e-4)) noyob.push(Math.abs(r) < 1e-9 ? 0 : r);
  return noyob.sort((p, q) => p - q);
}

/** Mahalliy maksimum va minimumlar: namuna nuqtalarida o'sish/kamayish almashishi, so'ng oltin kesim bilan aniqlashtiriladi. */
export function ekstremumlar(f, xmin, xmax, N = 1200) {
  const out = []; const h = (xmax - xmin) / N; const ys = []; for (let i = 0; i <= N; i += 1) ys.push(f(xmin + h * i));
  for (let i = 1; i < N; i += 1) {
    const a = ys[i - 1], b = ys[i], c = ys[i + 1]; if (![a, b, c].every(Number.isFinite)) continue;
    const kat = (b > a && b >= c && b > c) ? "max" : (b < a && b <= c && b < c) ? "min" : null; if (!kat) continue;
    let lo = xmin + h * (i - 1), hi = xmin + h * (i + 1); const g = (x) => (kat === "max" ? -f(x) : f(x)); const fi = (Math.sqrt(5) - 1) / 2;
    for (let k = 0; k < 70; k += 1) { const x1 = hi - fi * (hi - lo), x2 = lo + fi * (hi - lo); if (g(x1) < g(x2)) hi = x2; else lo = x1; }
    const x = (lo + hi) / 2, y = f(x); if (Number.isFinite(y) && !out.some((q) => Math.abs(q.x - x) < 1e-3)) out.push({ x, y, tur: kat });
  }
  return out;
}

/** Aniq integral (Simpson, n juft). Uzilish bo'lsa NaN. */
export function integral(f, a, b, n = 2000) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN; if (a === b) return 0;
  const m = n % 2 ? n + 1 : n, h = (b - a) / m; let s = f(a) + f(b);
  for (let i = 1; i < m; i += 1) s += f(a + h * i) * (i % 2 ? 4 : 2);
  const r = (s * h) / 3; return Number.isFinite(r) ? r : NaN;
}

/** Yaxshi ko'rinadigan katak qadamlari (1, 2, 5 × 10^k). */
export function tiklar(min, max, taxminan = 8) {
  const oraliq = max - min; if (!(oraliq > 0)) return [];
  const xom = oraliq / taxminan; const p = 10 ** Math.floor(Math.log10(xom)); const f = xom / p;
  const q = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p; const out = [];
  for (let v = Math.ceil(min / q - 1e-9) * q; v <= max + 1e-9; v += q) out.push(Math.abs(v) < q * 1e-9 ? 0 : Number(v.toPrecision(12)));
  return out;
}

/** Son → qisqa matn (uzun kasrlar qisqartiriladi, -0 yo'q, vergul bilan). */
export function sonMatni(v, raqam = 4) {
  if (!Number.isFinite(v)) return "—"; if (Math.abs(v) < 1e-9) return "0";
  const t = Number(v.toPrecision(raqam)); return String(t).replace(".", ",");
}

/** Birlik aylana: burchak (gradus) → sin, cos, tg (cos≈0 da null) va radian. */
export function birlikAylana(gradus) {
  const r = (gradus * Math.PI) / 180; const c = Math.cos(r), s = Math.sin(r);
  return { gradus, radian: r, cos: Math.abs(c) < 1e-12 ? 0 : c, sin: Math.abs(s) < 1e-12 ? 0 : s, tg: Math.abs(c) < 1e-9 ? null : s / c };
}
/** Gradus → «π ulushi» ko'rinishi (30° → 1π/6) — maktab burchaklari uchun; boshqasi — radian son. */
export function radianMatni(gradus) {
  const g = ((Math.round(gradus * 1000) / 1000) % 720 + 720) % 720; const bol = (a, b) => (b === 1 ? (a === 1 ? "π" : `${a}π`) : (a === 1 ? `π/${b}` : `${a}π/${b}`));
  if (Math.abs(g) < 1e-9) return "0";
  for (const b of [1, 2, 3, 4, 6, 12]) { const a = (g * b) / 180; if (Math.abs(a - Math.round(a)) < 1e-9) { const k = Math.round(a); const d = (x, y) => { const q = gcd(x, y); return [x / q, y / q]; }; const [p, q] = d(k, b); return bol(p, q); } }
  return sonMatni((g * Math.PI) / 180, 4);
}
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

/** Maxsus burchaklar uchun ANIQ qiymatlar (30°, 45°, 60°, 90° ning ko'paytmalari): {sin, cos, tg} matnlari yoki null. */
export function aniqQiymat(gradus) {
  const REF = { 0: ["0", "1", "0"], 30: ["1/2", "√3/2", "√3/3"], 45: ["√2/2", "√2/2", "1"], 60: ["√3/2", "1/2", "√3"], 90: ["1", "0", null] };
  const g = ((Math.round(gradus * 1000) / 1000) % 360 + 360) % 360;
  const [r, bs, bc, bt] = g <= 90 ? [g, 1, 1, 1] : g <= 180 ? [180 - g, 1, -1, -1] : g <= 270 ? [g - 180, -1, -1, 1] : [360 - g, -1, 1, -1];
  const x = REF[r]; if (!x) return null;
  const ishora = (v, b) => (v === null ? null : v === "0" ? "0" : (b < 0 ? `−${v}` : v));
  return { sin: ishora(x[0], bs), cos: ishora(x[1], bc), tg: x[2] === null || g === 90 || g === 270 ? null : ishora(x[2], bt) };
}
