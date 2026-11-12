// REV527: 1–11-sinf matematika o'yinlari — sof qoidalar: tarozi-tenglama, kasr yig'ish, koordinata nishoni, funksiya mashinasi, sehrli kvadrat.
import { tasodif } from "./mantiqRules.js";
const but = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const ebob = (a, b) => (b ? ebob(b, a % b) : Math.abs(a));

// ───── ⚖️ Tarozi-tenglama ─────
/** d0: x + a = b; d1: a·x + b = c; d2: a·x + b = c·x + d (x butun, manfiy ham bo'lishi mumkin). → { chap:{k,o}, ong:{k,o}, x, matn, qadamlar } (k·x + o) */
export function tenglamaYasa(urug = 1, d = 0) {
  const r = tasodif(urug * 19 + d * 401);
  let x, chap, ong;
  if (d === 0) { x = but(r, 1, 12); const a = but(r, 1, 12); chap = { k: 1, o: a }; ong = { k: 0, o: x + a }; }
  else if (d === 1) { x = but(r, 1, 12); const a = but(r, 2, 6), b = but(r, 1, 15); chap = { k: a, o: b }; ong = { k: 0, o: a * x + b }; }
  else { x = but(r, -6, 9) || 4; const c = but(r, 1, 4), a = c + but(r, 1, 4), b = but(r, -9, 12); chap = { k: a, o: b }; ong = { k: c, o: (a - c) * x + b }; }
  const yoz = (t) => { const kx = t.k === 0 ? "" : t.k === 1 ? "x" : `${t.k}x`; return !kx ? String(t.o) : t.o === 0 ? kx : `${kx} ${t.o > 0 ? "+" : "−"} ${Math.abs(t.o)}`; };
  const qadamlar = [];
  let L = { ...chap }, R = { ...ong };
  if (R.k) { qadamlar.push(`Ikkala tomondan ${R.k === 1 ? "x" : `${R.k}x`} ni ayiramiz: ${yoz({ k: L.k - R.k, o: L.o })} = ${R.o}`); L = { k: L.k - R.k, o: L.o }; R = { k: 0, o: R.o }; }
  if (L.o) { qadamlar.push(`Ikkala tomon${L.o > 0 ? "dan" : "ga"} ${Math.abs(L.o)} ni ${L.o > 0 ? "ayiramiz" : "qo‘shamiz"}: ${yoz({ k: L.k, o: 0 })} = ${R.o - L.o}`); R = { k: 0, o: R.o - L.o }; L = { k: L.k, o: 0 }; }
  if (L.k !== 1) qadamlar.push(`Ikkala tomonni ${L.k} ga bo‘lamiz: x = ${R.o / L.k}`);
  return { chap, ong, x, matn: `${yoz(chap)} = ${yoz(ong)}`, qadamlar };
}

// ───── 🥧 Kasr yig'ish ─────
/** Bo'laklardan nishon kasrni yig'ish. → { nishon:[s,m], bolaklar:[[s,m]…] (tanlash mumkin bo'lganlari), yechim:[indekslar] } */
export function kasrYasa(urug = 1, d = 0) {
  const r = tasodif(urug * 23 + d * 307);
  const maxrajlar = d === 0 ? [[2, 4], [4], [3], [5]][but(r, 0, 3)] : d === 1 ? [2, 4, 8] : [[2, 3, 6], [3, 4, 6, 12], [2, 5, 10]][but(r, 0, 2)];
  const um = maxrajlar.reduce((a, b) => (a * b) / ebob(a, b), 1);
  const soni = d === 0 ? 5 : d === 1 ? 6 : 7;
  const bolaklar = Array.from({ length: soni }, () => { const m = maxrajlar[but(r, 0, maxrajlar.length - 1)]; return [1, m]; });
  const nechta = d === 0 ? 2 : but(r, 2, 3) + (d === 2 ? 1 : 0);
  const tartib = [...bolaklar.keys()].sort(() => r() - 0.5).slice(0, nechta).sort((a, b) => a - b);
  const sur = tartib.reduce((a, i) => a + um / bolaklar[i][1], 0); const g = ebob(sur, um);
  return { nishon: [sur / g, um / g], bolaklar, yechim: tartib };
}
export function kasrYigindi(bolaklar, tanlangan) {
  let s = 0, m = 1;
  for (const i of tanlangan) { const [a, b] = bolaklar[i]; s = s * b + a * m; m *= b; const g = ebob(s, m) || 1; s /= g; m /= g; }
  return [s, m];
}
export const kasrTeng = (a, b) => a[0] * b[1] === b[0] * a[1];

// ───── 🎯 Koordinata nishoni ─────
/** d0: I chorak (0..6); d1: to'rt chorak (−5..5); d2: + almashtirishlar (simmetriya, siljitish). → { min, max, topshiriqlar:[{ matn, x, y }] } */
export function koordinataYasa(urug = 1, d = 0, soni = 6) {
  const r = tasodif(urug * 29 + d * 613); const [min, max] = d === 0 ? [0, 6] : [-5, 5];
  const kor = new Set(), out = [];
  while (out.length < soni) {
    const x = but(r, min, max), y = but(r, min, max);
    if (d === 2 && out.length % 2 === 1) {
      const tur = but(r, 0, 3); let nx = x, ny = y, matn;
      if (tur === 0) { ny = -y; matn = `A(${x}; ${y}) nuqtaning Ox o‘qiga nisbatan simmetrigini belgilang`; }
      else if (tur === 1) { nx = -x; matn = `A(${x}; ${y}) nuqtaning Oy o‘qiga nisbatan simmetrigini belgilang`; }
      else if (tur === 2) { nx = -x; ny = -y; matn = `A(${x}; ${y}) nuqtaning koordinata boshiga nisbatan simmetrigini belgilang`; }
      else { const a = but(r, -2, 2) || 1, b = but(r, -2, 2) || -1; nx = x + a; ny = y + b; matn = `A(${x}; ${y}) nuqtani ${Math.abs(a)} birlik ${a > 0 ? "o‘ngga" : "chapga"} va ${Math.abs(b)} birlik ${b > 0 ? "yuqoriga" : "pastga"} suring`; }
      if (nx < min || nx > max || ny < min || ny > max || kor.has(`${nx}:${ny}`)) continue;
      kor.add(`${nx}:${ny}`); out.push({ matn, x: nx, y: ny });
    } else { if (kor.has(`${x}:${y}`)) continue; kor.add(`${x}:${y}`); out.push({ matn: `(${x}; ${y}) nuqtani belgilang`, x, y }); }
  }
  return { min, max, topshiriqlar: out };
}

// ───── ⚙️ Funksiya mashinasi ─────
/** → { misollar:[[kirish, chiqish]…], savol, javob, qoida, variantlar (qoida matnlari), togri } */
export function funksiyaYasa(urug = 1, d = 0) {
  const r = tasodif(urug * 37 + d * 733);
  const turlar = d === 0 ? ["+", "-", "*"] : d === 1 ? ["ax+b", "ax-b", "2x+"] : ["x2+b", "x2-b", "ax+b", "(x+a)*b"];
  const tur = turlar[but(r, 0, turlar.length - 1)]; const a = but(r, 2, d === 0 ? 9 : 5), b = but(r, 1, d === 2 ? 6 : 9);
  const F = { "+": [(x) => x + a, `x + ${a}`], "-": [(x) => x - a, `x − ${a}`], "*": [(x) => x * a, `${a} · x`], "ax+b": [(x) => a * x + b, `${a}x + ${b}`], "ax-b": [(x) => a * x - b, `${a}x − ${b}`],
    "2x+": [(x) => 2 * x + b, `2x + ${b}`], "x2+b": [(x) => x * x + b, `x² + ${b}`], "x2-b": [(x) => x * x - b, `x² − ${b}`], "(x+a)*b": [(x) => (x + a) * b, `(x + ${a}) · ${b}`] }[tur];
  const past = tur === "-" ? a : 1, yuqori = past + (d === 2 ? 6 : 9);   // kamida 7 xil qiymat — tsikl tugashi kafolatlangan
  const kirish = []; while (kirish.length < 4) { const x = but(r, past, yuqori); if (!kirish.includes(x)) kirish.push(x); }
  const [f, qoida] = F; const savol = kirish.pop();
  const yolgon = [`x + ${a + b}`, `${a + 1}x + ${b}`, `${a}x + ${b + 1}`, `x² + ${a}`, `${a} · x`, `x − ${b}`].filter((q) => q !== qoida);
  const variantlar = [qoida, ...yolgon.sort(() => r() - 0.5).slice(0, 3)].sort(() => r() - 0.5);
  return { misollar: kirish.map((x) => [x, f(x)]), savol, javob: f(savol), qoida, variantlar, togri: variantlar.indexOf(qoida) };
}

// ───── 🧮 Sehrli kvadrat (3×3) ─────
const LO_SHU = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
/** → { kvadrat (to'liq), bosh (null = bo'sh), yigindi }. d0: 3 ta bo'sh, d1: 5 ta, d2: 6 ta (sonlar kattaroq). */
export function sehrliYasa(urug = 1, d = 0) {
  const r = tasodif(urug * 41 + d * 811);
  let k = LO_SHU.map((q) => [...q]);
  for (let i = but(r, 0, 3); i > 0; i -= 1) k = k[0].map((_, j) => k.map((q) => q[j]).reverse());   // burish
  if (r() < 0.5) k = k.map((q) => [...q].reverse());                                                  // ko'zgu
  const kop = d === 2 ? but(r, 2, 3) : 1, qosh = d === 0 ? 0 : but(r, 0, 9);
  k = k.map((q) => q.map((v) => v * kop + qosh));
  const bosh = k.map((q) => [...q]); const olinadi = [3, 5, 6][Math.max(0, Math.min(2, d))];
  for (const p of [...Array(9).keys()].sort(() => r() - 0.5).slice(0, olinadi)) bosh[Math.floor(p / 3)][p % 3] = null;
  return { kvadrat: k, bosh, yigindi: k[0].reduce((a, b) => a + b, 0) };
}
/** To'ldirilgan kvadrat sehrlimi: hamma qator, ustun va ikkala diagonal yig'indisi = S. */
export function sehrliTogri(g, S) {
  if (g.some((q) => q.some((v) => v == null || v === ""))) return false;
  const n = g.map((q) => q.map(Number));
  const y = [...n.map((q) => q.reduce((a, b) => a + b, 0)), ...[0, 1, 2].map((j) => n[0][j] + n[1][j] + n[2][j]), n[0][0] + n[1][1] + n[2][2], n[0][2] + n[1][1] + n[2][0]];
  return y.every((v) => v === S);
}
