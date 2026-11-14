// REV546: Kabu loyiha F5 — 9–11-sinf loyihalari (sof modellar, testlanadi). Modellar soddalashtirilgan, lekin qonuniyati to'g'ri.

// ───── S: Energiya va iqlim ─────  ulushlar foizda (10 qadam bilan), yig'indisi 100
export const ENERGIYA = { chegaraT: 2.0, byudjet: 235, qayta_max: 60, narx: { qazilma: 1, qayta: 2.2, atom: 3 } };
/** 2100-yilgacha: qazilma yoqilg'i ulushi → yillik chiqindi → CO₂ (ppm) → isish (°C, sanoatgacha davrga nisbatan). */
export function energiyaHisob({ qazilma, qayta, atom }) {
  const chiqindi = 40 * (qazilma / 100);                       // Gt CO₂ / yil (hozir ≈ 40)
  const ppm = 420 + chiqindi * 0.0577 * 74;                    // 2026 → 2100; havoda qoladigan ulush hisobga olingan
  const isish = Math.round(3 * Math.log2(ppm / 280) * 100) / 100;   // CO₂ ikki baravar oshsa ≈ +3 °C
  const narx = Math.round(qazilma * ENERGIYA.narx.qazilma + qayta * ENERGIYA.narx.qayta + atom * ENERGIYA.narx.atom);
  const yigindi = qazilma + qayta + atom;
  return { chiqindi, ppm: Math.round(ppm), isish, narx, yigindi, ishonchli: qayta <= ENERGIYA.qayta_max,
    otdi: yigindi === 100 && isish <= ENERGIYA.chegaraT && narx <= ENERGIYA.byudjet && qayta <= ENERGIYA.qayta_max };
}

// ───── T: Ma'lumot tahlili (chiziqli bog'lanish) ─────  x — tayyorgarlik soati, y — ball
export const TAHLIL = [
  { nom: "Tayyorgarlik va natija", x: "soat", y: "ball", nuqtalar: [[1, 42], [2, 50], [3, 55], [4, 63], [5, 68], [6, 77], [7, 80], [8, 90]] },
  { nom: "Harorat va muzqaymoq savdosi", x: "°C", y: "dona", nuqtalar: [[14, 20], [18, 34], [22, 41], [25, 56], [28, 60], [31, 75], [34, 82], [37, 96]] },
  { nom: "Yosh va bo‘y (o‘g‘il bolalar)", x: "yosh", y: "sm", nuqtalar: [[6, 116], [7, 121], [8, 128], [9, 132], [10, 139], [11, 143], [12, 150], [13, 156]] },
];
export function eknk(nuqtalar) {   // eng kichik kvadratlar: y = k·x + b
  const n = nuqtalar.length, sx = nuqtalar.reduce((a, p) => a + p[0], 0), sy = nuqtalar.reduce((a, p) => a + p[1], 0);
  const sxx = nuqtalar.reduce((a, p) => a + p[0] * p[0], 0), sxy = nuqtalar.reduce((a, p) => a + p[0] * p[1], 0);
  const k = (n * sxy - sx * sy) / (n * sxx - sx * sx); return { k, b: (sy - k * sx) / n };
}
export const xatolik = (nuqtalar, k, b) => Math.round(Math.sqrt(nuqtalar.reduce((a, [x, y]) => a + (y - (k * x + b)) ** 2, 0) / nuqtalar.length) * 100) / 100;
/** Maqsad xatolik: eng yaxshi chiziqnikidan 2 baravargacha (kamida +0,6). Surgichlar qadami (k — 0,1; b — butun son) bilan erishsa bo'ladi
 *  (test tekshiradi); ×1,3 da 9–13 ming holatdan atigi 4–18 tasi o'tardi — qo'lda topib bo'lmasdi. */
export function tahlilChegara(nuqtalar) { const e = eknk(nuqtalar); const eng = xatolik(nuqtalar, e.k, e.b); return Math.round(Math.max(eng * 2, eng + 0.6) * 100) / 100; }
export const tahlilOtdi = (nuqtalar, k, b) => xatolik(nuqtalar, k, b) <= tahlilChegara(nuqtalar) + 1e-9;

// ───── E: Shamol tegirmoni ─────  P = ½·ρ·A·v³·Cp
export const SHAMOL = { v: 8, maqsad: 3.6, byudjet: 90 };
const PARRAK_K = { 2: 0.9, 3: 1.0, 4: 0.97, 5: 0.93 };
export function shamolHisob(burchak, soni, uzunlik) {
  const cp = 0.45 * Math.exp(-(((burchak - 15) / 12) ** 2)) * (PARRAK_K[soni] || 0);   // Bets chegarasi 0,593 dan past
  const A = Math.PI * uzunlik * uzunlik;
  const kVt = Math.round((0.5 * 1.2 * A * SHAMOL.v ** 3 * cp) / 10) / 100;
  const narx = soni * uzunlik * 10;
  return { cp: Math.round(cp * 1000) / 1000, kVt, narx, otdi: kVt >= SHAMOL.maqsad && narx <= SHAMOL.byudjet };
}

// ───── A: Fraktal daraxt ─────  har shox ikkiga bo'linadi: burchak, qisqarish nisbati, chuqurlik
export const FRAKTAL_NISHON = [{ burchak: 25, nisbat: 0.7, chuqurlik: 6 }, { burchak: 40, nisbat: 0.6, chuqurlik: 5 }, { burchak: 15, nisbat: 0.75, chuqurlik: 7 }];
/** Daraxt kesmalari: [[x1,y1,x2,y2,daraja]…] — tanasi (0,0) dan yuqoriga 1 birlik. */
export function fraktalChiz({ burchak, nisbat, chuqurlik }) {
  const out = []; const g = (burchak * Math.PI) / 180;
  const yur = (x, y, a, uz, d) => { const x2 = x + uz * Math.sin(a), y2 = y + uz * Math.cos(a); out.push([x, y, x2, y2, d]); if (d < chuqurlik) { yur(x2, y2, a - g, uz * nisbat, d + 1); yur(x2, y2, a + g, uz * nisbat, d + 1); } };
  yur(0, 0, 0, 1, 0); return out;
}
export const fraktalShoxlar = (chuqurlik) => 2 ** (chuqurlik + 1) - 1;                                  // jami kesmalar
export const fraktalUzunlik = (nisbat, chuqurlik) => Math.round(((1 - (2 * nisbat) ** (chuqurlik + 1)) / (1 - 2 * nisbat)) * 100) / 100;   // geometrik progressiya (2r ≠ 1)
export const fraktalMos = (a, b) => Math.abs(a.burchak - b.burchak) <= 2 && Math.abs(a.nisbat - b.nisbat) <= 0.021 && a.chuqurlik === b.chuqurlik;

// ───── M: Kredit va foiz ─────  annuitet to'lov: A = P·r / (1 − (1+r)^−n)
export const KREDIT = { narx: 12, daromad: 4, jamgarma: 3, yillik: 24, tolovUlushi: 0.3, ortiqcha: 1.3 };   // mln so'm
export function kreditHisob(boshlangich, oy) {
  const P = KREDIT.narx - boshlangich, r = KREDIT.yillik / 12 / 100;
  const oylik = P <= 0 ? 0 : Math.round(((P * r) / (1 - (1 + r) ** -oy)) * 1000) / 1000;
  const jami = Math.round(oylik * oy * 100) / 100, ortiqcha = Math.round((jami - P) * 100) / 100;
  return { qarz: P, oylik, jami, ortiqcha, yuk: Math.round((oylik / KREDIT.daromad) * 100),
    otdi: boshlangich <= KREDIT.jamgarma && oylik <= KREDIT.daromad * KREDIT.tolovUlushi + 1e-9 && ortiqcha <= KREDIT.ortiqcha + 1e-9 && P > 0 };
}
