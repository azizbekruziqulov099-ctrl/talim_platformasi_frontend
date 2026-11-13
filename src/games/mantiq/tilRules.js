// REV529: til o'yinlari — sof qoidalar: anagramma, so'z zanjiri, imlo ovchisi, gap tuzish (o'zbek, rus, ingliz).
import { tasodif } from "./mantiqRules.js";
import { SOZLAR, IMLO, GAPLAR } from "./tilData.js";
const but = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const aralash = (a, r) => { const x = [...a]; for (let i = x.length - 1; i > 0; i -= 1) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const dar = (d) => Math.max(0, Math.min(2, d));

/** So'zni harf-plitkalarga bo'lish: o'zbekcha «sh», «ch», «ng», «o‘», «g‘» — bitta plitka; tutuq belgisi oldingi harfga qo'shiladi. */
export function plitkalar(soz, til = "uz") {
  const s = String(soz); if (til !== "uz") return [...s];
  const out = []; let i = 0;
  while (i < s.length) {
    const ikki = s.slice(i, i + 2).toLowerCase();
    if (["sh", "ch", "ng", "o‘", "g‘"].includes(ikki)) { out.push(s.slice(i, i + 2)); i += 2; }
    else if (s[i] === "’" && out.length) { out[out.length - 1] += "’"; i += 1; }
    else { out.push(s[i]); i += 1; }
  }
  return out;
}

export function anagramYasa(til = "uz", urug = 1, d = 0) {
  const r = tasodif(urug * 59 + dar(d) * 1201 + til.charCodeAt(0)); const hovuz = SOZLAR[til][dar(d)].filter((s) => !s.includes(" ") && plitkalar(s, til).length >= 3);
  const soz = hovuz[but(r, 0, hovuz.length - 1)], p = plitkalar(soz, til);
  let ar = p; for (let k = 0; k < 20 && ar.join("") === p.join(""); k += 1) ar = aralash(p, r);
  return { soz, harflar: ar, uzun: p.length };
}
/** Plitkalardan tuzilgan so'z to'g'rimi — aynan o'sha so'z yoki lug'atdagi boshqa haqiqiy so'z (o'sha harflardan). */
export function anagramTogri(til, tuzilgan, soz) {
  const t = tuzilgan.join(""); if (t === soz) return true;
  const imzo = (x) => [...plitkalar(x, til)].sort().join("|");
  return SOZLAR[til].flat().some((s) => s === t && imzo(s) === imzo(soz));
}

/** So'z zanjiri: har qadamda oldingi so'zning oxirgi harfidan boshlanadigan YAGONA variantni tanlash. */
export function zanjirYasa(til = "uz", urug = 1, d = 0, uzunlik = 6) {
  const r = tasodif(urug * 61 + dar(d) * 1301 + til.charCodeAt(0));
  const hovuz = SOZLAR[til].slice(0, Math.min(3, dar(d) + 2)).flat().filter((s) => !s.includes(" "));   // zanjir uzilmasligi uchun keyingi daraja so'zlari ham
  const toza = (x) => x.replace("’", "").toLowerCase();
  const bosh = (s) => toza(plitkalar(s, til)[0]);
  const oxirH = (s) => plitkalar(s, til).map(toza).filter((x) => !/^[ьъый]$/.test(x)).at(-1);   // ruscha: ь, ъ, ы, й bilan so'z boshlanmaydi — oldingi harf olinadi
  let eng = [];
  for (let urin = 0; urin < 300 && eng.length < uzunlik; urin += 1) {
    const ishlatilgan = new Set(); let joriy = hovuz[but(r, 0, hovuz.length - 1)]; ishlatilgan.add(joriy); const qadamlar = [];
    for (let k = 0; k < uzunlik; k += 1) {
      const h = oxirH(joriy); const mos = hovuz.filter((s) => !ishlatilgan.has(s) && bosh(s) === h);
      const boshqa = aralash(hovuz.filter((s) => !ishlatilgan.has(s) && bosh(s) !== h), r).slice(0, 3);
      if (!mos.length || boshqa.length < 2) break;
      // keyingi qadam ham davom eta oladigan so'z afzal
      const davomli = mos.filter((s) => hovuz.some((x) => x !== s && !ishlatilgan.has(x) && bosh(x) === oxirH(s)));
      const togri = (davomli.length ? davomli : mos)[but(r, 0, (davomli.length ? davomli : mos).length - 1)];
      const variantlar = aralash([togri, ...boshqa], r);
      qadamlar.push({ oldingi: joriy, harf: h, variantlar, togri: variantlar.indexOf(togri) }); ishlatilgan.add(togri); joriy = togri;
    }
    if (qadamlar.length > eng.length) eng = qadamlar;
  }
  return { qadamlar: eng };
}

export function imloYasa(til = "uz", urug = 1, d = 0, soni = 8) {
  const r = tasodif(urug * 67 + dar(d) * 1409 + til.charCodeAt(0));
  return aralash(IMLO[til][dar(d)], r).slice(0, soni).map(([togri, xato, qoida]) => { const v = aralash([togri, xato], r); return { variantlar: v, togri: v.indexOf(togri), qoida }; });
}

export function gapYasa(til = "uz", urug = 1, d = 0) {
  const r = tasodif(urug * 71 + dar(d) * 1511 + til.charCodeAt(0)); const hovuz = GAPLAR[til][dar(d)];
  const qabul = hovuz[but(r, 0, hovuz.length - 1)]; const sozlar = qabul[0].split(" ");
  let ar = sozlar; for (let k = 0; k < 20 && ar.join(" ") === qabul[0]; k += 1) ar = aralash(sozlar, r);
  return { sozlar: ar, gap: qabul[0], qabul };
}
export const gapTogri = (tuzilgan, qabul) => qabul.includes(tuzilgan.join(" "));
