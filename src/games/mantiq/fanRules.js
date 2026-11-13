// REV530: tabiiy fan o'yinlari — sof qoidalar va ma'lumot: ozuqa zanjiri, elektr zanjiri, kimyoviy tenglama, davriy jadval.
import { tasodif } from "./mantiqRules.js";
const but = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const aralash = (a, r) => { const x = [...a]; for (let i = x.length - 1; i > 0; i -= 1) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const dar = (d) => Math.max(0, Math.min(2, d));
const ebob = (a, b) => (b ? ebob(b, a % b) : Math.abs(a));

// ───── 🕸️ Ozuqa zanjiri ─────  [muhit, [belgi, nom]…] — ishlab chiqaruvchidan yirtqichgacha
export const ZANJIRLAR = [
  [["o‘tloq", ["🌿", "o‘t"], ["🐇", "quyon"], ["🦊", "tulki"]], ["bog‘", ["🍃", "barg"], ["🐛", "qurt"], ["🐦", "chumchuq"]], ["dala", ["🌾", "bug‘doy"], ["🐭", "sichqon"], ["🦉", "boyqush"]],
    ["ko‘l", ["🌱", "suv o‘ti"], ["🐟", "baliq"], ["🐻", "ayiq"]], ["o‘tloq", ["🌼", "gul"], ["🦋", "kapalak"], ["🐸", "qurbaqa"]], ["o‘rmon", ["🌰", "yong‘oq"], ["🐿️", "olmaxon"], ["🦅", "burgut"]],
    ["dala", ["🥕", "sabzi"], ["🐇", "quyon"], ["🐺", "bo‘ri"]], ["savanna", ["🌿", "o‘t"], ["🦓", "zebra"], ["🦁", "sher"]], ["bog‘", ["🌸", "gul shirasi"], ["🐝", "ari"], ["🐦", "qush"]],
    ["hovuz", ["🌱", "suv o‘ti"], ["🐌", "shilliqqurt"], ["🦆", "o‘rdak"]]],
  [["o‘tloq", ["🌿", "o‘t"], ["🦗", "chigirtka"], ["🐸", "qurbaqa"], ["🐍", "ilon"]], ["dala", ["🌾", "bug‘doy"], ["🐭", "sichqon"], ["🐍", "ilon"], ["🦅", "burgut"]],
    ["dengiz", ["🦠", "plankton"], ["🦐", "qisqichbaqa"], ["🐟", "baliq"], ["🦭", "tyulen"]], ["o‘rmon", ["🍃", "barg"], ["🐛", "qurt"], ["🐦", "chittak"], ["🦅", "qirg‘iy"]],
    ["ko‘l", ["🌱", "suv o‘ti"], ["🐟", "mayda baliq"], ["🐠", "yirtqich baliq"], ["🦅", "baliqchi qush"]], ["savanna", ["🌿", "o‘t"], ["🦗", "chigirtka"], ["🦎", "kaltakesak"], ["🦅", "burgut"]],
    ["bog‘", ["🌹", "atirgul"], ["🐜", "shira biti"], ["🐞", "xonqizi"], ["🐦", "qush"]], ["cho‘l", ["🌵", "cho‘l o‘simligi"], ["🐭", "qo‘shoyoq"], ["🐍", "ilon"], ["🦅", "burgut"]],
    ["tundra", ["🌱", "yo‘sin"], ["🪲", "hasharot"], ["🐦", "qorchumchuq"], ["🦊", "qutb tulkisi"]], ["o‘rmon", ["🌰", "urug‘"], ["🐭", "sichqon"], ["🦊", "tulki"], ["🐺", "bo‘ri"]]],
  [["dengiz", ["🦠", "fitoplankton"], ["🦐", "zooplankton"], ["🐟", "mayda baliq"], ["🐬", "delfin"], ["🦈", "akula"]], ["o‘tloq", ["🌿", "o‘t"], ["🦗", "chigirtka"], ["🐸", "qurbaqa"], ["🐍", "ilon"], ["🦅", "burgut"]],
    ["Arktika", ["🦠", "fitoplankton"], ["🦐", "krill"], ["🐟", "baliq"], ["🦭", "tyulen"], ["🐻‍❄️", "oq ayiq"]], ["o‘rmon", ["🍃", "barg"], ["🐛", "qurt"], ["🕷️", "o‘rgimchak"], ["🐦", "chittak"], ["🦅", "qirg‘iy"]],
    ["ko‘l", ["🦠", "suv o‘tlari"], ["🦟", "chivin lichinkasi"], ["🐟", "mayda baliq"], ["🐠", "cho‘rtan"], ["🦅", "baliqchi burgut"]],
    ["savanna", ["🌿", "o‘t"], ["🐜", "termit"], ["🦎", "kaltakesak"], ["🐍", "ilon"], ["🦅", "burgut"]], ["dala", ["🌾", "don"], ["🐛", "hasharot"], ["🐭", "sichqon"], ["🦊", "tulki"], ["🦅", "burgut"]],
    ["dengiz", ["🌱", "dengiz o‘ti"], ["🦀", "krab"], ["🐙", "sakkizoyoq"], ["🦭", "tyulen"], ["🐋", "kosatka"]]],
];
export function ozuqaYasa(urug = 1, d = 0) {
  const r = tasodif(urug * 73 + dar(d) * 1601); const hovuz = ZANJIRLAR[dar(d)]; const [muhit, ...zanjir] = hovuz[but(r, 0, hovuz.length - 1)];
  let ar = zanjir.map((_, i) => i); for (let k = 0; k < 20 && ar.every((v, i) => v === i); k += 1) ar = aralash(ar, r);
  return { muhit, zanjir, tartib: ar };
}
export const ozuqaTogri = (tanlov, zanjir) => tanlov.length === zanjir.length && tanlov.every((v, i) => v === i);

// ───── 💡 Elektr zanjiri ─────  daraxt: { t: "k", id } kalit | { t: "s", q: [...] } ketma-ket | { t: "p", q: [...] } parallel
export function zanjirTok(d, yopiq) { return d.t === "k" ? yopiq.has(d.id) : d.t === "s" ? d.q.every((x) => zanjirTok(x, yopiq)) : d.q.some((x) => zanjirTok(x, yopiq)); }
export function zanjirEngKam(d) { return d.t === "k" ? 1 : d.t === "s" ? d.q.reduce((a, x) => a + zanjirEngKam(x), 0) : Math.min(...d.q.map(zanjirEngKam)); }
export const zanjirKalitlar = (d) => (d.t === "k" ? [d.id] : d.q.flatMap(zanjirKalitlar));
export function elektrYasa(urug = 1, d = 0) {
  const r = tasodif(urug * 79 + dar(d) * 1709); let n = 0; const k = () => ({ t: "k", id: (n += 1) });
  const SH = [
    [() => ({ t: "s", q: [k(), k()] }), () => ({ t: "p", q: [k(), k()] }), () => ({ t: "s", q: [k(), { t: "p", q: [k(), k()] }] })],
    [() => ({ t: "s", q: [{ t: "p", q: [k(), k()] }, { t: "p", q: [k(), k()] }] }), () => ({ t: "p", q: [{ t: "s", q: [k(), k()] }, k()] }), () => ({ t: "s", q: [k(), { t: "p", q: [{ t: "s", q: [k(), k()] }, k()] }] }),
      () => ({ t: "p", q: [{ t: "s", q: [k(), k()] }, { t: "s", q: [k(), k()] }] })],
    [() => ({ t: "s", q: [{ t: "p", q: [{ t: "s", q: [k(), k()] }, k()] }, { t: "p", q: [k(), { t: "s", q: [k(), k()] }] }] }), () => ({ t: "p", q: [{ t: "s", q: [k(), { t: "p", q: [k(), k()] }] }, { t: "s", q: [k(), k(), k()] }] }),
      () => ({ t: "s", q: [k(), { t: "p", q: [{ t: "s", q: [k(), k()] }, { t: "s", q: [k(), k(), k()] }, k()] }, k()] }), () => ({ t: "s", q: [{ t: "p", q: [k(), k(), k()] }, { t: "p", q: [{ t: "s", q: [k(), k()] }, k()] }, k()] })],
  ][dar(d)];
  const daraxt = SH[but(r, 0, SH.length - 1)]();
  return { daraxt, kalitlar: zanjirKalitlar(daraxt), engKam: zanjirEngKam(daraxt) };
}

// ───── ⚗️ Kimyoviy tenglamani tenglash ─────  [[chap moddalar], [o'ng moddalar], [koeffitsientlar]]
export const TENGLAMALAR = [
  [[["H2", "O2"], ["H2O"], [2, 1, 2]], [["N2", "H2"], ["NH3"], [1, 3, 2]], [["Mg", "O2"], ["MgO"], [2, 1, 2]], [["Na", "Cl2"], ["NaCl"], [2, 1, 2]], [["C", "O2"], ["CO2"], [1, 1, 1]],
    [["H2", "Cl2"], ["HCl"], [1, 1, 2]], [["Ca", "O2"], ["CaO"], [2, 1, 2]], [["S", "O2"], ["SO2"], [1, 1, 1]], [["K", "Cl2"], ["KCl"], [2, 1, 2]], [["Fe", "S"], ["FeS"], [1, 1, 1]]],
  [[["Al", "O2"], ["Al2O3"], [4, 3, 2]], [["Fe", "O2"], ["Fe2O3"], [4, 3, 2]], [["CH4", "O2"], ["CO2", "H2O"], [1, 2, 1, 2]], [["Zn", "HCl"], ["ZnCl2", "H2"], [1, 2, 1, 1]], [["Na", "H2O"], ["NaOH", "H2"], [2, 2, 2, 1]],
    [["H2O2"], ["H2O", "O2"], [2, 2, 1]], [["KClO3"], ["KCl", "O2"], [2, 2, 3]], [["P", "O2"], ["P2O5"], [4, 5, 2]], [["CaCO3"], ["CaO", "CO2"], [1, 1, 1]], [["Mg", "HCl"], ["MgCl2", "H2"], [1, 2, 1, 1]],
    [["SO2", "O2"], ["SO3"], [2, 1, 2]], [["Fe", "Cl2"], ["FeCl3"], [2, 3, 2]]],
  [[["C2H6", "O2"], ["CO2", "H2O"], [2, 7, 4, 6]], [["C3H8", "O2"], ["CO2", "H2O"], [1, 5, 3, 4]], [["Al", "HCl"], ["AlCl3", "H2"], [2, 6, 2, 3]], [["Fe2O3", "CO"], ["Fe", "CO2"], [1, 3, 2, 3]],
    [["NH3", "O2"], ["NO", "H2O"], [4, 5, 4, 6]], [["C2H5OH", "O2"], ["CO2", "H2O"], [1, 3, 2, 3]], [["H2SO4", "NaOH"], ["Na2SO4", "H2O"], [1, 2, 1, 2]], [["Al", "H2SO4"], ["Al2(SO4)3", "H2"], [2, 3, 1, 3]],
    [["Ca(OH)2", "HCl"], ["CaCl2", "H2O"], [1, 2, 1, 2]], [["C6H12O6", "O2"], ["CO2", "H2O"], [1, 6, 6, 6]], [["Fe", "H2O"], ["Fe3O4", "H2"], [3, 4, 1, 4]], [["KMnO4"], ["K2MnO4", "MnO2", "O2"], [2, 1, 1, 1]]],
];
/** Formuladagi atomlar soni: "Al2(SO4)3" → { Al: 2, S: 3, O: 12 } */
export function atomlar(f) {
  const steka = [{}]; let i = 0;
  while (i < f.length) {
    if (f[i] === "(") { steka.push({}); i += 1; }
    else if (f[i] === ")") { i += 1; const m = /^\d+/.exec(f.slice(i)); const k = m ? Number(m[0]) : 1; if (m) i += m[0].length; const g = steka.pop(); for (const [e, n] of Object.entries(g)) steka.at(-1)[e] = (steka.at(-1)[e] || 0) + n * k; }
    else { const m = /^([A-Z][a-z]?)(\d*)/.exec(f.slice(i)); if (!m) throw new Error(`formula: ${f}`); steka.at(-1)[m[1]] = (steka.at(-1)[m[1]] || 0) + (m[2] ? Number(m[2]) : 1); i += m[0].length; }
  }
  return steka[0];
}
export function tomonAtom(moddalar, koef) { const o = {}; moddalar.forEach((m, i) => { for (const [e, n] of Object.entries(atomlar(m))) o[e] = (o[e] || 0) + n * (koef[i] || 0); }); return o; }
/** → "ok" | "qisqartir" (to'g'ri, lekin eng kichik butun sonlar emas) | "xato" */
export function tenglamaTekshir(chap, ong, koef) {
  if (koef.some((k) => !Number.isInteger(k) || k < 1)) return "xato";
  const a = tomonAtom(chap, koef.slice(0, chap.length)), b = tomonAtom(ong, koef.slice(chap.length));
  const el = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const e of el) if ((a[e] || 0) !== (b[e] || 0)) return "xato";
  return koef.reduce(ebob) === 1 ? "ok" : "qisqartir";
}
export function kimyoYasa(urug = 1, d = 0) { const r = tasodif(urug * 83 + dar(d) * 1811); const h = TENGLAMALAR[dar(d)]; const [chap, ong, koef] = h[but(r, 0, h.length - 1)]; return { chap, ong, koef }; }

// ───── 🧪 Davriy jadval ─────  [belgi, nom, davr, guruh]
export const ELEMENTLAR = [["H", "Vodorod", 1, 1], ["He", "Geliy", 1, 18], ["Li", "Litiy", 2, 1], ["Be", "Berilliy", 2, 2], ["B", "Bor", 2, 13], ["C", "Uglerod", 2, 14], ["N", "Azot", 2, 15], ["O", "Kislorod", 2, 16], ["F", "Ftor", 2, 17], ["Ne", "Neon", 2, 18],
  ["Na", "Natriy", 3, 1], ["Mg", "Magniy", 3, 2], ["Al", "Alyuminiy", 3, 13], ["Si", "Kremniy", 3, 14], ["P", "Fosfor", 3, 15], ["S", "Oltingugurt", 3, 16], ["Cl", "Xlor", 3, 17], ["Ar", "Argon", 3, 18], ["K", "Kaliy", 4, 1], ["Ca", "Kalsiy", 4, 2],
  ["Sc", "Skandiy", 4, 3], ["Ti", "Titan", 4, 4], ["V", "Vanadiy", 4, 5], ["Cr", "Xrom", 4, 6], ["Mn", "Marganes", 4, 7], ["Fe", "Temir", 4, 8], ["Co", "Kobalt", 4, 9], ["Ni", "Nikel", 4, 10], ["Cu", "Mis", 4, 11], ["Zn", "Rux", 4, 12],
  ["Ga", "Galliy", 4, 13], ["Ge", "Germaniy", 4, 14], ["As", "Mishyak", 4, 15], ["Se", "Selen", 4, 16], ["Br", "Brom", 4, 17], ["Kr", "Kripton", 4, 18]];
/** 8 ta savol: belgi→nom, nom→belgi, tartib raqami→element; d0: 1–10, d1: 1–20, d2: 1–36. Har savolda jadvaldagi o'rni (z) ham bor. */
export function davriyYasa(urug = 1, d = 0, soni = 8) {
  const r = tasodif(urug * 89 + dar(d) * 1913); const N = [10, 20, 36][dar(d)]; const hovuz = aralash([...Array(N).keys()], r).slice(0, soni);
  return hovuz.map((z) => { const [bel, nom] = ELEMENTLAR[z]; const tur = but(r, 0, 2);
    const boshqa = aralash([...Array(N).keys()].filter((x) => x !== z), r).slice(0, 3);
    const ol = (x) => (tur === 0 ? ELEMENTLAR[x][1] : ELEMENTLAR[x][0]);
    const variantlar = aralash([z, ...boshqa], r); 
    return { z: z + 1, savol: tur === 0 ? { tur: "belgi", matn: bel } : tur === 1 ? { tur: "nom", matn: nom } : { tur: "raqam", matn: String(z + 1) },
      variantlar: variantlar.map(ol), togri: variantlar.indexOf(z), izoh: `${z + 1}. ${bel} — ${nom}` }; });
}
