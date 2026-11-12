// REV526: 1–11-sinf «🧠 Mantiq o'yinlari» — sof qoidalar (testlanadi): Sudoku (4×4, 6×6, 9×9), Son yasash, Kod ochish, Nonogramma.
// Hamma generator urug' (seed) bilan — bir xil urug' bir xil topshiriq beradi; har topshiriqning yechimi borligi kafolatlanadi.

export function tasodif(urug) {   // mulberry32
  let a = (Number(urug) || 1) >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const aralash = (a, r) => { const x = [...a]; for (let i = x.length - 1; i > 0; i -= 1) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };

// ───────────── SUDOKU ─────────────
export const SUDOKU_QUTI = { 4: [2, 2], 6: [2, 3], 9: [3, 3] };   // [qatorlar, ustunlar] bitta qutida

function sudokuToliq(n, r) {
  const [bq, bu] = SUDOKU_QUTI[n];
  // asos naqsh: (bu*(i % bq) + floor(i / bq) + j) % n — to'g'ri sudoku; keyin qator/ustun/raqamlar aralashtiriladi
  const asos = (i, j) => (bu * (i % bq) + Math.floor(i / bq) + j) % n;
  const tasmalar = aralash([...Array(n / bq).keys()], r), ustTasma = aralash([...Array(n / bu).keys()], r);
  const qator = tasmalar.flatMap((t) => aralash([...Array(bq).keys()], r).map((k) => t * bq + k));
  const ustun = ustTasma.flatMap((t) => aralash([...Array(bu).keys()], r).map((k) => t * bu + k));
  const raqam = aralash([...Array(n).keys()].map((x) => x + 1), r);
  return qator.map((i) => ustun.map((j) => raqam[asos(i, j)]));
}

export function sudokuMumkin(g, n, i, j, v) {
  const [bq, bu] = SUDOKU_QUTI[n];
  for (let k = 0; k < n; k += 1) if ((k !== j && g[i][k] === v) || (k !== i && g[k][j] === v)) return false;
  const i0 = Math.floor(i / bq) * bq, j0 = Math.floor(j / bu) * bu;
  for (let a = i0; a < i0 + bq; a += 1) for (let b = j0; b < j0 + bu; b += 1) if ((a !== i || b !== j) && g[a][b] === v) return false;
  return true;
}

/** Yechimlar soni (chegara bilan) — yagona yechimni tekshirish uchun. */
export function sudokuYechimSoni(g0, n, chegara = 2) {
  const g = g0.map((q) => [...q]); let soni = 0;
  const yech = () => {
    let bi = -1, bj = -1, eng = n + 1, nomzod = null;
    for (let i = 0; i < n; i += 1) for (let j = 0; j < n; j += 1) if (!g[i][j]) {
      const c = []; for (let v = 1; v <= n; v += 1) if (sudokuMumkin(g, n, i, j, v)) c.push(v);
      if (c.length < eng) { eng = c.length; bi = i; bj = j; nomzod = c; if (!eng) return; }
    }
    if (bi < 0) { soni += 1; return; }
    for (const v of nomzod) { g[bi][bj] = v; yech(); g[bi][bj] = 0; if (soni >= chegara) return; }
  };
  yech(); return soni;
}

/** n: 4 | 6 | 9; daraja: 0 (oson) … 2 (qiyin). → { n, bosh (0 = bo'sh), yechim } — yechim YAGONA. */
export function sudokuYasa(n = 9, urug = 1, daraja = 0) {
  const r = tasodif(urug * 7 + n * 131 + daraja); const yechim = sudokuToliq(n, r);
  const bosh = yechim.map((q) => [...q]);
  const qolsin = { 4: [9, 7, 6], 6: [22, 18, 15], 9: [44, 36, 30] }[n][Math.max(0, Math.min(2, daraja))];
  let bor = n * n;
  for (const k of aralash([...Array(n * n).keys()], r)) {
    if (bor <= qolsin) break;
    const i = Math.floor(k / n), j = k % n, v = bosh[i][j];
    bosh[i][j] = 0;
    if (sudokuYechimSoni(bosh, n, 2) !== 1) bosh[i][j] = v; else bor -= 1;
  }
  return { n, bosh, yechim };
}

export function sudokuXatolar(g, n) {   // qoidaga zid kataklar [i, j]
  const x = [];
  for (let i = 0; i < n; i += 1) for (let j = 0; j < n; j += 1) if (g[i][j] && !sudokuMumkin(g, n, i, j, g[i][j])) x.push([i, j]);
  return x;
}
export const sudokuTugadi = (g, n) => g.every((q) => q.every(Boolean)) && sudokuXatolar(g, n).length === 0;

// ───────────── SON YASASH (berilgan sonlardan nishon sonni hosil qilish) ─────────────
const kasr = (a, b = 1) => { const eb = (x, y) => (y ? eb(y, x % y) : Math.abs(x)); const g = eb(a, b) || 1; return b < 0 ? [-a / g, -b / g] : [a / g, b / g]; };
const amal = (x, y, op) => (op === "+" ? kasr(x[0] * y[1] + y[0] * x[1], x[1] * y[1]) : op === "-" ? kasr(x[0] * y[1] - y[0] * x[1], x[1] * y[1])
  : op === "*" ? kasr(x[0] * y[0], x[1] * y[1]) : y[0] === 0 ? null : kasr(x[0] * y[1], x[1] * y[0]));

/** Ifodani xavfsiz hisoblash (faqat raqam, + - × ÷ va qavs). → { qiymat: [surat, maxraj] | null, sonlar: [...] } */
export function ifodaHisobla(matn) {
  const s = String(matn || "").replace(/×|·|x/gi, "*").replace(/÷|:/g, "/").replace(/−|–/g, "-").replace(/\s+/g, "");
  if (!s || !/^[0-9+\-*/()]+$/.test(s)) return { qiymat: null, sonlar: [] };
  let i = 0; const sonlar = [];
  const birlik = () => {
    if (s[i] === "(") { i += 1; const v = yigindi(); if (s[i] !== ")") throw new Error("qavs"); i += 1; return v; }
    const m = /^\d+/.exec(s.slice(i)); if (!m) throw new Error("son"); i += m[0].length; sonlar.push(Number(m[0])); return [Number(m[0]), 1];
  };
  const kopaytma = () => { let v = birlik(); while (s[i] === "*" || s[i] === "/") { const op = s[i]; i += 1; const w = birlik(); v = amal(v, w, op); if (!v) throw new Error("nol"); } return v; };
  function yigindi() { let v = kopaytma(); while (s[i] === "+" || s[i] === "-") { const op = s[i]; i += 1; v = amal(v, kopaytma(), op); } return v; }
  try { const v = yigindi(); if (i !== s.length) return { qiymat: null, sonlar }; return { qiymat: v, sonlar }; } catch { return { qiymat: null, sonlar }; }
}

/** Sonlar to'plamidan nishonni yasash mumkinmi — bitta yechim ifodasini qaytaradi (yoki null). */
export function sonYechim(sonlar, nishon) {
  const qidir = (xs) => {
    if (xs.length === 1) return xs[0].v[1] === 1 && xs[0].v[0] === nishon ? xs[0].t : null;
    for (let a = 0; a < xs.length; a += 1) for (let b = 0; b < xs.length; b += 1) if (a !== b) {
      const qolgan = xs.filter((_, k) => k !== a && k !== b);
      for (const op of ["+", "-", "*", "/"]) {
        if ((op === "+" || op === "*") && a > b) continue;
        const v = amal(xs[a].v, xs[b].v, op); if (!v || v[0] < 0) continue;
        const t = qidir([...qolgan, { v, t: `(${xs[a].t} ${{ "*": "×", "/": "÷" }[op] || op} ${xs[b].t})` }]);
        if (t) return t;
      }
    }
    return null;
  };
  const t = qidir(sonlar.map((n) => ({ v: [n, 1], t: String(n) })));
  return t ? t.replace(/^\((.*)\)$/, "$1") : null;
}

/** daraja 0: 3 ta son (1–9), nishon ≤ 30; 1: 4 ta son, nishon 24; 2: 4–5 ta son (1–12), nishon 30–100. Yechim borligi kafolatlangan. */
export function sonYasa(urug = 1, daraja = 1) {
  const r = tasodif(urug * 13 + daraja * 977);
  for (let urin = 0; urin < 400; urin += 1) {
    const soni = daraja === 0 ? 3 : daraja === 1 ? 4 : 4 + Math.floor(r() * 2);
    const max = daraja === 2 ? 12 : 9;
    const sonlar = Array.from({ length: soni }, () => 1 + Math.floor(r() * max));
    const nishon = daraja === 1 ? 24 : daraja === 0 ? 6 + Math.floor(r() * 25) : 30 + Math.floor(r() * 71);
    const yechim = sonYechim(sonlar, nishon);
    if (yechim && !(daraja === 0 && sonlar.reduce((a, b) => a + b, 0) === nishon && r() < 0.7)) return { sonlar, nishon, yechim };
  }
  return { sonlar: [4, 6, 1, 1], nishon: 24, yechim: "4 × 6 × 1 × 1" };
}

/** Javobni tekshirish: har berilgan son aynan bir marta ishlatilgan va qiymat = nishon. → "ok" | "sonlar" | "qiymat" | "xato" */
export function sonTekshir(matn, sonlar, nishon) {
  const { qiymat, sonlar: ishlatilgan } = ifodaHisobla(matn);
  if (!qiymat) return "xato";
  if ([...ishlatilgan].sort((a, b) => a - b).join(",") !== [...sonlar].sort((a, b) => a - b).join(",")) return "sonlar";
  return qiymat[1] === 1 && qiymat[0] === nishon ? "ok" : "qiymat";
}

// ───────────── KOD OCHISH (Mastermind) ─────────────
/** daraja 0: 3 o'rin, 4 belgi, takrorsiz; 1: 4 o'rin, 6 belgi; 2: 5 o'rin, 8 belgi, takror mumkin. */
export function kodYasa(urug = 1, daraja = 1) {
  const r = tasodif(urug * 31 + daraja * 503); const [uzun, belgi, takror] = [[3, 4, false], [4, 6, false], [5, 8, true]][Math.max(0, Math.min(2, daraja))];
  const sir = takror ? Array.from({ length: uzun }, () => Math.floor(r() * belgi)) : aralash([...Array(belgi).keys()], r).slice(0, uzun);
  return { sir, uzun, belgi, takror, urinish: uzun + 5 };
}
/** → { joyida (to'g'ri belgi, to'g'ri o'rin), bor (to'g'ri belgi, boshqa o'rin) } */
export function kodBaho(taxmin, sir) {
  let joyida = 0; const s = {}, t = {};
  sir.forEach((v, i) => { if (taxmin[i] === v) joyida += 1; else { s[v] = (s[v] || 0) + 1; t[taxmin[i]] = (t[taxmin[i]] || 0) + 1; } });
  let bor = 0; for (const k of Object.keys(t)) bor += Math.min(t[k], s[k] || 0);
  return { joyida, bor };
}

// ───────────── NONOGRAMMA ─────────────
const RASMLAR5 = ["01110|11111|11111|01110|00100", "00100|01110|11111|01110|01110", "10001|01010|00100|01010|10001", "00100|01110|11111|00100|00100", "11011|11111|11111|01110|00100",
  "01110|10001|10101|10001|01110", "11111|10001|10001|10001|11111", "00100|00110|11111|00110|00100", "10101|01110|11111|01110|10101", "01010|11111|01010|11111|01010"];
const ishoralar = (q) => { const o = []; let k = 0; for (const v of q) { if (v) k += 1; else if (k) { o.push(k); k = 0; } } if (k) o.push(k); return o.length ? o : [0]; };

/** daraja 0: 5×5 (tayyor rasm), 1: 8×8, 2: 10×10 (tasodifiy, simmetrik naqsh). → { n, rasm, qator, ustun } */
export function nonogramYasa(urug = 1, daraja = 0) {
  const r = tasodif(urug * 17 + daraja * 211); let rasm;
  if (daraja === 0) rasm = RASMLAR5[Math.floor(r() * RASMLAR5.length)].split("|").map((q) => [...q].map(Number));
  else {
    const n = daraja === 1 ? 8 : 10;
    do { rasm = Array.from({ length: n }, () => { const yarim = Array.from({ length: n / 2 }, () => (r() < 0.55 ? 1 : 0)); return [...yarim, ...[...yarim].reverse()]; }); }
    while (rasm.some((q) => !q.some(Boolean)) || rasm[0].map((_, j) => rasm.some((q) => q[j])).some((x) => !x));
  }
  const n = rasm.length;
  return { n, rasm, qator: rasm.map(ishoralar), ustun: rasm[0].map((_, j) => ishoralar(rasm.map((q) => q[j]))) };
}
/** Bo'yalgan kataklar ishoralarga mosmi (rasm aynan bir xil bo'lishi shart emas — ishoralar bajarilsa yetarli). */
export function nonogramTogri(g, qator, ustun) {
  const teng = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  return g.every((q, i) => teng(ishoralar(q.map((v) => (v === 1 ? 1 : 0))), qator[i])) && ustun.every((u, j) => teng(ishoralar(g.map((q) => (q[j] === 1 ? 1 : 0))), u));
}
export { ishoralar as nonogramIshoralar };
