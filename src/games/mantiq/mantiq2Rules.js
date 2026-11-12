// REV528: mantiq o'yinlari (davomi) — sof qoidalar: ketma-ketlik, mantiqiy jadval, Xanoy minorasi, chiroqlar.
import { tasodif } from "./mantiqRules.js";
const but = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const aralash = (a, r) => { const x = [...a]; for (let i = x.length - 1; i > 0; i -= 1) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };

// ───── 🔗 Ketma-ketlik ─────
const TUB = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
/** → { hadlar (ko'rsatiladigan), javob, variantlar, togri, qoida (izoh) } */
export function ketmaYasa(urug = 1, d = 0) {
  const r = tasodif(urug * 43 + d * 911); const a = but(r, 1, 9), k = but(r, 2, d === 0 ? 5 : 7);
  const TUR = [
    [["qosh", (i) => a + i * k, `Har safar ${k} qo‘shiladi`], ["ayir", (i) => a + 60 - i * k, `Har safar ${k} ayriladi`], ["ikki", (i) => a * 2 ** i, "Har safar 2 ga ko‘paytiriladi"],
      ["navbat", (i) => a + Math.floor((i + 1) / 2) * k + Math.floor(i / 2) * 1, `Navbat bilan ${k} va 1 qo‘shiladi`]],
    [["kop", (i) => a * (k > 4 ? 3 : k) ** i, `Har safar ${k > 4 ? 3 : k} ga ko‘paytiriladi`], ["osuvchi", (i) => a + (i * (i + 1)) / 2, "Qo‘shiladigan son har safar 1 ga oshadi (+1, +2, +3 …)"],
      ["kvadrat", (i) => (i + a) ** 2, "Ketma-ket sonlarning kvadratlari"], ["fib", null, "Har had oldingi ikkitasining yig‘indisi"],
      ["ikkiqator", (i) => (i % 2 === 0 ? a + (i / 2) * k : 50 - ((i - 1) / 2) * 3), `Ikki ketma-ketlik aralash: biri ${k} ga oshadi, ikkinchisi 3 ga kamayadi`]],
    [["kv1", (i) => (i + 1) ** 2 + a, `n² + ${a}`], ["kub", (i) => (i + 1) ** 3, "Ketma-ket sonlarning kublari"], ["ikkiBir", null, "Har safar 2 ga ko‘paytirib, 1 qo‘shiladi"],
      ["tub", (i) => TUB[i + (a % 4)], "Tub sonlar"], ["uchburchak", (i) => ((i + a) * (i + a + 1)) / 2, "Uchburchak sonlar: qo‘shiladigan son 1 ga oshib boradi"],
      ["kopAyir", null, "Navbat bilan: 2 ga ko‘paytiriladi, keyin 1 ayriladi"]],
  ][Math.max(0, Math.min(2, d))];
  const [tur, f, qoida] = TUR[but(r, 0, TUR.length - 1)];
  let h;
  if (tur === "fib") { h = [a, a + but(r, 1, 4)]; while (h.length < 7) h.push(h.at(-1) + h.at(-2)); }
  else if (tur === "ikkiBir") { h = [a]; while (h.length < 7) h.push(h.at(-1) * 2 + 1); }
  else if (tur === "kopAyir") { h = [a + 2]; while (h.length < 7) h.push(h.length % 2 ? h.at(-1) * 2 : h.at(-1) - 1); }
  else h = Array.from({ length: 7 }, (_, i) => f(i));
  const soni = tur === "ikkiqator" || tur === "navbat" || tur === "kopAyir" ? 6 : 5;
  const javob = h[soni]; const farq = Math.max(1, Math.abs(h[soni] - h[soni - 1]));
  const yolgon = [...new Set([javob + 1, javob - 1, javob + farq, javob - farq, h[soni - 1] + (h[soni - 1] - h[soni - 2]), javob + 2, javob * 2, javob + 10])].filter((v) => v !== javob && v >= 0);
  const variantlar = aralash([javob, ...aralash(yolgon, r).slice(0, 3)], r);
  return { hadlar: h.slice(0, soni), javob, variantlar, togri: variantlar.indexOf(javob), qoida };
}

// ───── 🧩 Mantiqiy jadval («kim nimani yaxshi ko'radi») ─────
const ISMLAR = ["Ali", "Vali", "Sardor", "Madina", "Zarina", "Jasur", "Dilnoza", "Bekzod"];
const TOIFA = [["hayvon", ["mushuk", "it", "to‘tiqush", "baliq"], (v) => `${v} boqadi`, (v) => `${v} boqmaydi`], ["meva", ["olma", "anor", "uzum", "nok"], (v) => `${v}ni yaxshi ko‘radi`, (v) => `${v}ni yoqtirmaydi`],
  ["sport", ["futbol", "suzish", "shaxmat", "kurash"], (v) => `${v} bilan shug‘ullanadi`, (v) => `${v} bilan shug‘ullanmaydi`]];
const permlar = (n) => { const o = []; const f = (a, q) => (q.length ? q.forEach((x, i) => f([...a, x], [...q.slice(0, i), ...q.slice(i + 1)])) : o.push(a)); f([], [...Array(n).keys()]); return o; };

/** Ishoralarga mos keladigan yechimlar soni (chegara bilan). yechim: [toifa][odam] = qiymat indeksi */
export function jadvalYechimlar(n, toifalar, ishoralar, chegara = 2) {
  const P = permlar(n); let soni = 0; const top = [];
  const mos = (y) => ishoralar.every((c) => (c.t === "ha" ? y[c.k][c.o] === c.v : c.t === "yoq" ? y[c.k][c.o] !== c.v
    : c.t === "bog" ? y[c.k2][y[c.k].indexOf(c.v)] === c.v2 : y[c.k2][y[c.k].indexOf(c.v)] !== c.v2));
  const yur = (k, y) => { if (soni >= chegara) return; if (k === toifalar) { if (mos(y)) { soni += 1; top.push(y.map((q) => [...q])); } return; } for (const p of P) yur(k + 1, [...y, p]); };
  yur(0, []); return { soni, top };
}

/** d0: 3 kishi × 1 toifa; d1: 3 kishi × 2 toifa; d2: 4 kishi × 2 toifa. Yechim YAGONA, ortiqcha ishora yo'q. */
export function jadvalYasa(urug = 1, d = 0) {
  const r = tasodif(urug * 47 + d * 1013); const n = d === 2 ? 4 : 3, T = d === 0 ? 1 : 2;
  const odamlar = aralash(ISMLAR, r).slice(0, n); const toifa = aralash(TOIFA, r).slice(0, T).map(([nom, q, ha, yoq]) => ({ nom, qiymat: aralash(q, r).slice(0, n), ha, yoq }));
  const yechim = toifa.map(() => aralash([...Array(n).keys()], r));
  const nomzod = [];
  for (let k = 0; k < T; k += 1) for (let o = 0; o < n; o += 1) {
    nomzod.push({ t: "ha", k, o, v: yechim[k][o] });
    for (let v = 0; v < n; v += 1) if (v !== yechim[k][o]) nomzod.push({ t: "yoq", k, o, v });
  }
  if (T === 2) for (let o = 0; o < n; o += 1) { nomzod.push({ t: "bog", k: 0, v: yechim[0][o], k2: 1, v2: yechim[1][o] });
    for (let v2 = 0; v2 < n; v2 += 1) if (v2 !== yechim[1][o]) nomzod.push({ t: "bogYoq", k: 0, v: yechim[0][o], k2: 1, v2 }); }
  // «ha» ishoralar kamroq (aks holda juda oson), bog'lovchi va inkor ishoralar ko'proq
  const tartib = aralash(nomzod, r).sort((a, b) => (a.t === "ha") - (b.t === "ha"));
  let ish = [];
  for (const c of tartib) { ish.push(c); if (jadvalYechimlar(n, T, ish, 2).soni === 1) break; }
  for (let i = ish.length - 1; i >= 0; i -= 1) { const sinov = ish.filter((_, k) => k !== i); if (jadvalYechimlar(n, T, sinov, 2).soni === 1) ish = sinov; }
  const matn = (c) => (c.t === "ha" ? `${odamlar[c.o]} ${toifa[c.k].ha(toifa[c.k].qiymat[c.v])}.` : c.t === "yoq" ? `${odamlar[c.o]} ${toifa[c.k].yoq(toifa[c.k].qiymat[c.v])}.`
    : c.t === "bog" ? `Kim ${toifa[c.k].ha(toifa[c.k].qiymat[c.v])} — o‘sha ${toifa[c.k2].ha(toifa[c.k2].qiymat[c.v2])}.` : `Kim ${toifa[c.k].ha(toifa[c.k].qiymat[c.v])} — o‘sha ${toifa[c.k2].yoq(toifa[c.k2].qiymat[c.v2])}.`);
  return { n, odamlar, toifa: toifa.map((t) => ({ nom: t.nom, qiymat: t.qiymat })), yechim, ishoralar: aralash(ish, r).map(matn), _ish: ish };
}
/** belgilar[k][o] = tanlangan qiymat indeksi (yoki null) — yechimga tengmi */
export const jadvalTogri = (belgilar, yechim) => yechim.every((q, k) => q.every((v, o) => belgilar[k]?.[o] === v));

// ───── 🗼 Xanoy minorasi ─────
export const xanoyBosh = (n) => [Array.from({ length: n }, (_, i) => n - i), [], []];
export function xanoyYur(ustunlar, dan, ga) {
  const a = ustunlar[dan], b = ustunlar[ga];
  if (dan === ga || !a.length || (b.length && b.at(-1) < a.at(-1))) return null;   // katta halqa kichigining ustiga qo'yilmaydi
  const y = ustunlar.map((u) => [...u]); y[ga].push(y[dan].pop()); return y;
}
export const xanoyTugadi = (ustunlar, n) => ustunlar[2].length === n;
export const xanoyEngKam = (n) => 2 ** n - 1;

// ───── 💡 Chiroqlar (Lights Out) ─────
export function chiroqBos(g, i, j) {
  const n = g.length, y = g.map((q) => [...q]);
  for (const [a, b] of [[i, j], [i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]]) if (a >= 0 && b >= 0 && a < n && b < n) y[a][b] = y[a][b] ? 0 : 1;
  return y;
}
/** Tasodifiy bosishlar bilan yasaladi — demak yechimi bor. → { n, bosh, yechim: [[i,j]…] } */
export function chiroqYasa(urug = 1, d = 0) {
  const r = tasodif(urug * 53 + d * 1117); const n = [3, 4, 5][Math.max(0, Math.min(2, d))];
  for (;;) {
    const bos = new Set(); const soni = but(r, n, n + 3 + d * 2);
    while (bos.size < soni) bos.add(but(r, 0, n * n - 1));
    let g = Array.from({ length: n }, () => Array(n).fill(0)); const yechim = [...bos].map((p) => [Math.floor(p / n), p % n]);
    for (const [i, j] of yechim) g = chiroqBos(g, i, j);
    if (g.flat().filter(Boolean).length >= n) return { n, bosh: g, yechim };
  }
}
export const chiroqTugadi = (g) => g.every((q) => q.every((v) => !v));
