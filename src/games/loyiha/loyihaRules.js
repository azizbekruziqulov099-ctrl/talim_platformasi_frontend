// REV541: «🔬 Kabu loyiha» (STEM/STEAM) — sof modellar (testlanadi). Har loyiha: muammo → faraz → yasash → sinash → xulosa.

// ───── S: O'simlik kundaligi ─────  suv 0..4 (stakan/kun), yorug'lik 0..3 (qorong'i … quyoshli deraza)
const SUV_K = [0.1, 0.6, 1.0, 0.65, 0.25], NUR_K = [0.15, 0.55, 1.0, 0.9];
/** 7 kunlik bo'y (sm), kunma-kun. Ortiqcha suv — ildiz chiriydi; nur yetmasa — o'smaydi. */
export function osimlikOs(suv, nur, kunlar = 7) {
  const tezlik = 2.2 * SUV_K[suv] * NUR_K[nur]; const out = []; let b = 1;
  for (let k = 1; k <= kunlar; k += 1) { b += tezlik * (k <= 2 ? 0.6 : 1); out.push(Math.round(b * 10) / 10); }
  return out;
}
export const osimlikHolat = (suv, nur) => (suv === 0 ? "qurigan" : suv >= 4 ? "chirigan" : nur === 0 ? "sargaygan" : SUV_K[suv] * NUR_K[nur] >= 0.9 ? "soglom" : "ortacha");
export const OSIMLIK_MAQSAD = 14;   // sm

// ───── E: Ko'prik ─────
export const KOPRIK_TUR = { tosin: { k: 1.0, narx: 0 }, ferma: { k: 2.5, narx: 15 }, ark: { k: 2.0, narx: 10 } };
/** → { yuk (kg ko'taradi), narx } ; qalinlik 1..3 */
export function koprikHisob(tur, qalinlik) { const t = KOPRIK_TUR[tur]; return { yuk: Math.round(2 * t.k * qalinlik), narx: qalinlik * 10 + t.narx }; }
export const KOPRIK_MAQSAD = { yuk: 10, narx: 40 };
export const koprikOtdi = (tur, q) => { const h = koprikHisob(tur, q); return h.yuk >= KOPRIK_MAQSAD.yuk && h.narx <= KOPRIK_MAQSAD.narx; };

// ───── T: Kabu-kod ─────  xarita: "." bo'sh, "#" devor, "K" Kabu, "Y" yulduz
export const KOD_XARITALAR = [
  ["K....", ".##..", "...#.", ".#...", "....Y"],
  ["K.#..", ".##.Y", "...#.", ".#...", "....."],
  ["..#.Y", "K.#..", ".##.#", "....#", "..#.."],
  ["K#...", ".#.#.", ".#.#.", "...#Y", ".#..."],
];
const YON = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
export function kodOqi(xarita) { const n = xarita.length; let bosh, nishon; xarita.forEach((q, i) => [...q].forEach((c, j) => { if (c === "K") bosh = [i, j]; if (c === "Y") nishon = [i, j]; })); return { n, bosh, nishon }; }
/** Buyruqlarni bajarish: → { yol: [[i,j]…], natija: "yetdi" | "devor" | "chiqdi" | "yetmadi", qadam (to'xtagan buyruq) } */
export function kodYurit(xarita, buyruqlar) {
  const { n, bosh, nishon } = kodOqi(xarita); let [i, j] = bosh; const yol = [[i, j]];
  for (let q = 0; q < buyruqlar.length; q += 1) { const [di, dj] = YON[buyruqlar[q]] || [0, 0]; const a = i + di, b = j + dj;
    if (a < 0 || b < 0 || a >= n || b >= xarita[0].length) return { yol, natija: "chiqdi", qadam: q };
    if (xarita[a][b] === "#") return { yol, natija: "devor", qadam: q };
    i = a; j = b; yol.push([i, j]); if (i === nishon[0] && j === nishon[1]) return { yol, natija: "yetdi", qadam: q }; }
  return { yol, natija: "yetmadi", qadam: buyruqlar.length };
}
/** Eng qisqa yo'l uzunligi (BFS) — yechim borligini va «eng kam buyruq»ni bilish uchun. */
export function kodEngQisqa(xarita) {
  const { n, bosh, nishon } = kodOqi(xarita); const m = xarita[0].length; const d = Array.from({ length: n }, () => Array(m).fill(-1)); d[bosh[0]][bosh[1]] = 0; const q = [bosh];
  while (q.length) { const [i, j] = q.shift(); if (i === nishon[0] && j === nishon[1]) return d[i][j];
    for (const [di, dj] of Object.values(YON)) { const a = i + di, b = j + dj; if (a >= 0 && b >= 0 && a < n && b < m && xarita[a][b] !== "#" && d[a][b] < 0) { d[a][b] = d[i][j] + 1; q.push([a, b]); } } }
  return -1;
}

// ───── A: Simmetrik naqsh ─────  6×6, vertikal o'q; chap yarmi beriladi
export const NAQSH_NAMUNALAR = [["100", "110", "011", "011", "110", "100"], ["010", "111", "101", "101", "111", "010"], ["001", "011", "111", "110", "100", "111"], ["110", "001", "011", "011", "001", "110"]];
export const naqshOng = (chap) => chap.map((q) => [...q].reverse().join(""));
/** O'ng yarim (bola bo'yagan) chapning ko'zgu aksimi → xato kataklar [i, j] (o'ng yarim koordinatasida) */
export function naqshXato(chap, ong) { const kerak = naqshOng(chap); const x = []; kerak.forEach((q, i) => [...q].forEach((c, j) => { if ((ong[i]?.[j] || "0") !== c) x.push([i, j]); })); return x; }

// ───── M: Bayram byudjeti ─────
const __kbM = (x) => x;   // tarjima ro'yxati uchun belgi
export const BYUDJET = { pul: 60000, mehmon: 4, mahsulotlar: [
  { k: "sharbat", nom: __kbM("Sharbat (1 l)"), belgi: "🧃", narx: 12000, tur: "ichimlik", porsiya: 4 }, { k: "suv", nom: __kbM("Suv (1,5 l)"), belgi: "💧", narx: 4000, tur: "ichimlik", porsiya: 5 },
  { k: "tort", nom: __kbM("Tort"), belgi: "🎂", narx: 38000, tur: "shirinlik", porsiya: 8 }, { k: "pechenye", nom: __kbM("Pechenye (quti)"), belgi: "🍪", narx: 9000, tur: "shirinlik", porsiya: 4 },
  { k: "meva", nom: __kbM("Meva (1 kg)"), belgi: "🍎", narx: 15000, tur: "meva", porsiya: 5 }, { k: "banan", nom: __kbM("Banan (1 kg)"), belgi: "🍌", narx: 18000, tur: "meva", porsiya: 6 },
  { k: "shar", nom: __kbM("Sharlar (10 ta)"), belgi: "🎈", narx: 8000, tur: "bezak", porsiya: 10 }, { k: "likop", nom: __kbM("Bir martalik idish"), belgi: "🍽️", narx: 6000, tur: "idish", porsiya: 10 }] };
/** savat: { kalit: soni } → { jami, qoldi, porsiya: {tur: n}, kam: [turlar], otdi } — har mehmonga ichimlik, shirinlik va meva yetishi shart */
export function byudjetHisob(savat) {
  const p = {}; let jami = 0;
  for (const m of BYUDJET.mahsulotlar) { const n = savat[m.k] || 0; jami += n * m.narx; p[m.tur] = (p[m.tur] || 0) + n * m.porsiya; }
  const kerak = ["ichimlik", "shirinlik", "meva"]; const kam = kerak.filter((t) => (p[t] || 0) < BYUDJET.mehmon);
  return { jami, qoldi: BYUDJET.pul - jami, porsiya: p, kam, otdi: kam.length === 0 && jami <= BYUDJET.pul };
}

// ───── Portfel (qurilmada saqlanadi; F3 da serverga ko'chadi) ─────
export const PORTFEL_KALIT = "kabutar:loyiha:portfel:v1";
/** yulduz: 1 — bajardi, 2 — maqsadga yetdi, 3 — maqsad + faraz/xulosa to'g'ri */
export const yulduzHisob = ({ maqsad, xulosa, urinish }) => (!maqsad ? 1 : xulosa && urinish <= 6 ? 3 : 2);
