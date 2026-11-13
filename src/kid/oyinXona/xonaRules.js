// REV371: «O‘yinlar xonasi» qoidalari. Har o‘yin — mavzu to‘plamlari bo‘yicha bosqichlar (10 tadan narsa, 10 raund).
// Ochilish: 1-bosqich doim ochiq (obunasiz ham — sinab ko‘rish uchun); keyingisi faqat oldingisi O‘TILGAN va
// o‘tilgan kundan keyin yangi kun kelganda ochiladi (har kuni bittadan), hamda faqat obunachilarga.
import { XONA_TOPLAM } from "./xonaData.js";
import { oyinOl, RANGLAR } from "../oyin/oyinRules.js";
const RANG_HEX = new Proxy({}, { get: (_, k) => RANGLAR[k]?.hex });
import { ULASH, SARALASH } from "../oyin/saralashData.js";   // REV450/REV455

// REV379: «Rivojlantiruvchi o'yinlar» — hamma 57 xil o'yin, yo'nalishlar bo'yicha
export const XONA_GURUHLAR = [
  { kalit: "xotira", belgi: "🧠", nom: { uz: "Xotira va diqqat", ru: "Память и внимание", en: "Memory and attention", de: "Gedächtnis und Aufmerksamkeit", es: "Memoria y atención" },
    oyinlar: [89, 88, 83, 68, 86, 116, 119, 33, 55] },
  { kalit: "mantiq", belgi: "🧩", nom: { uz: "Mantiq va fikrlash", ru: "Логика и мышление", en: "Logic and thinking", de: "Logik und Denken", es: "Lógica y pensamiento" },
    oyinlar: [90, 91, 114, 93, 106, 76, 97, 103] },
  { kalit: "sanash", belgi: "🔢", nom: { uz: "Sanash va matematika", ru: "Счёт и математика", en: "Counting and maths", de: "Zählen und Mathe", es: "Contar y matemáticas" },
    oyinlar: [31, 32, 35, 38, 57, 43, 59, 49] },
  { kalit: "rang", belgi: "🎨", nom: { uz: "Ranglar va shakllar", ru: "Цвета и формы", en: "Colours and shapes", de: "Farben und Formen", es: "Colores y formas" },
    oyinlar: [61, 62, 63, 64] },
  { kalit: "til", belgi: "🗣️", nom: { uz: "Nutq va eshitish", ru: "Речь и слух", en: "Speech and listening", de: "Sprechen und Hören", es: "Habla y escucha" },
    oyinlar: [117, 121, 123, 142, 118] },
  { kalit: "olam", belgi: "🌍", nom: { uz: "Atrof-olam", ru: "Окружающий мир", en: "The world around us", de: "Die Welt um uns", es: "El mundo que nos rodea" },
    oyinlar: [149, 154, 161, 162, 168, 150, 96, 14, 18, 148, 94, 158, 147, 95, 165] },
  { kalit: "hayot", belgi: "🌱", nom: { uz: "Hayot va tartib", ru: "Жизнь и порядок", en: "Life and routines", de: "Leben und Abläufe", es: "Vida y rutinas" },
    oyinlar: [152, 146, 29, 157, 153, 15, 156, 166, 176] },
];
export const XONA_OYINLAR = XONA_GURUHLAR.flatMap((g) => g.oyinlar);
// O'z ma'lumoti bilan ishlaydigan o'yinlar (saralash, tartib, eshitish) — 10 bosqich, qiyinlik bosqich sayin oshadi
const OZ_MALUMOTLI = new Set([...XONA_GURUHLAR.find((g) => g.kalit === "olam").oyinlar, ...XONA_GURUHLAR.find((g) => g.kalit === "hayot").oyinlar, 121, 123, 142, 118]);
const SANASH = new Set(XONA_GURUHLAR.find((g) => g.kalit === "sanash").oyinlar);
export const oyinGuruhi = (id) => XONA_GURUHLAR.find((g) => g.oyinlar.includes(Number(id)));
export const BOSQICH_RAUND = 10;
const MAX_BOSQICH = 20, MIN_QOLDIQ = 6;

const yoshNorm = (y) => (["2-3", "4-5", "6-7"].includes(String(y)) ? String(y) : "4-5");

/** O‘yin uchun bosqichlar ro‘yxati: [{ i, toplam, belgi, nom, items }] — to‘plamlar har o‘yinda boshqa tartibda. */
/** REV450: juft topish o'yinlarida (Hayvonni boq, Ona va bola…) bosqichlar o'yinning O'Z juftlaridan:
 *  har bosqichda 3 ta yangi narsa + oldingi bosqichdan 1 tasi takrorlash uchun. Rasmi — shu bosqichning birinchi narsasi. */
/** REV522: bosqichni `kerak` ta har xil narsagacha to'ldirish — yangi bo'lakdan keyingi narsalar aylana bo'ylab (takrorsiz). */
function toldir(hamma, bosh, yangiSoni, kerak) {
  const out = [];
  for (let k = yangiSoni; out.length + yangiSoni < kerak && k < hamma.length; k += 1) out.push(hamma[(bosh + k) % hamma.length]);
  return out;
}

function ulashBosqichlari(nom) {
  const tartib = [];
  for (const [a] of ULASH[nom].juft) if (!tartib.some((x) => x.s.uz === a.s.uz)) tartib.push(a);
  const out = [];
  for (let i = 0; i < tartib.length; i += 3) {
    const yangi = tartib.slice(i, i + 3);
    // REV522: bosqichda 10 ta HAR XIL narsa (10 raundda takror bo'lmasin): 3 ta yangi + qolganlari boshqa bosqichlardan navbat bilan
    const takror = toldir(tartib, i, 3, BOSQICH_RAUND);
    const items = [...yangi, ...takror].map((a) => ({ e: a.e, s: a.s, ulashA: a.s.uz }));
    if (yangi.length) out.push({ toplam: nom, belgi: yangi[0].e, nom: yangi.map((a) => a.s.uz).join(", "), items });
  }
  // oxirida — hammasi aralash (umumiy takrorlash) bosqichi
  out.push({ toplam: nom, belgi: "⭐", nom: "hammasi", items: tartib.map((a) => ({ e: a.e, s: a.s, ulashA: a.s.uz })) });
  return out.map((b, i) => ({ ...b, i: i + 1 }));
}

/** REV455: saralash o'yinlarida ham bosqichlar o'z narsalaridan: guruhlardan navbat bilan 4 ta yangi narsa + 1 takror. */
function saralashBosqichlari(nom) {
  const d = SARALASH[nom];
  const navbat = [];
  const maks = Math.max(...d.narsa.map((n) => n.length));
  for (let i = 0; i < maks; i += 1) d.narsa.forEach((n, gi) => { if (n[i]) navbat.push({ w: n[i], gi }); });
  const out = [];
  for (let i = 0; i < navbat.length; i += 4) {
    const yangi = navbat.slice(i, i + 4);
    const takror = toldir(navbat, i, 4, BOSQICH_RAUND);   // REV522: 10 ta har xil narsa
    const items = [...yangi, ...takror].map(({ w }) => ({ e: w.e, s: w.s, r: w.s?.r, sarA: w.s.uz }));
    out.push({ toplam: nom, belgi: yangi[0].w.e, nom: yangi.map(({ w }) => w.s.uz).join(", "), items });
  }
  out.push({ toplam: nom, belgi: "⭐", nom: "hammasi", items: navbat.map(({ w }) => ({ e: w.e, s: w.s, r: w.s?.r, sarA: w.s.uz })) });
  return out.map((b, i) => ({ ...b, i: i + 1 }));
}

export function bosqichlar(oyinId) {
  const kal = oyinOl(Number(oyinId))?.kalit;
  if (kal && ULASH[kal]) return ulashBosqichlari(kal);
  if (kal && SARALASH[kal]) return saralashBosqichlari(kal);
  const k = Math.max(0, XONA_OYINLAR.indexOf(Number(oyinId)));
  const t = XONA_TOPLAM.map((_, j) => XONA_TOPLAM[(j + k) % XONA_TOPLAM.length]);
  const out = [];
  for (const p of t) {
    const bo = [];
    for (let i = 0; i < p.items.length; i += 10) bo.push(p.items.slice(i, i + 10));
    if (bo.length > 1 && bo[bo.length - 1].length < MIN_QOLDIQ) bo[bo.length - 2] = bo[bo.length - 2].concat(bo.pop());
    for (const items of bo) if (items.length >= MIN_QOLDIQ) out.push({ toplam: p.kalit, belgi: p.belgi, nom: p.nom, items });
  }
  const n = OZ_MALUMOTLI.has(Number(oyinId)) ? 10 : MAX_BOSQICH;   // REV379
  return out.slice(0, n).map((b, i) => ({ ...b, i: i + 1 }));
}

/** Bosqich qiyinligi: yoshga qarab boshlanadi, bosqich sayin variantlar ko‘payadi (ko‘pi bilan 4). */
export function bosqichSozlama(yosh, i, oyinId = 0) {
  const y = yoshNorm(yosh);
  const baza = { "2-3": 2, "4-5": 3, "6-7": 3 }[y];
  const qadam = { "2-3": 6, "4-5": 5, "6-7": 3 }[y];
  const out = { raundSoni: BOSQICH_RAUND, variantSoniMajbur: Math.min(4, baza + Math.floor((i - 1) / qadam)) };
  if (SANASH.has(Number(oyinId))) {   // REV379: sonlar bosqich sayin kattalashadi
    const [a, b] = { "2-3": [3, 5], "4-5": [5, 10], "6-7": [10, 20] }[y];
    out.sonlar = { min: 1, max: Math.min(b, a + Math.floor((i - 1) / 2)) };
  }
  return out;
}

/** Bola yoshiga mos o‘yinlar (katalogda bor, shu yoshga ruxsat, o‘chirilmagan). */
export function xonaOyinlari(yosh, yopiqmi = () => false) {
  const y = yoshNorm(yosh);
  return XONA_OYINLAR.map((id) => oyinOl(id)).filter((o) => o && o.yosh.includes(y) && !yopiqmi(o.id));
}

/** Bosqich holati: otdi | ochiq | ertaga | qulf | obuna. prog = { [bosqich]: { sana, yulduz } }. */
export function bosqichHolati(prog = {}, i, { obuna = false, bugun = "", admin = false } = {}) {
  if (prog[i]) return "otdi";
  if (admin) return "ochiq";   // REV450: admin — hamma bosqich darhol ochiq (kutish va obunasiz)
  if (i === 1) return "ochiq";
  const old = prog[i - 1];
  if (!old) return "qulf";
  if (!obuna) return "obuna";
  return String(old.sana || "") < String(bugun || "") ? "ochiq" : "ertaga";
}

/** Natijadan yulduz (0–3): xatosiz 3, 1–2 xato 2, ko‘proq 1; o‘tish uchun kamida 1 yulduz (raundlarning yarmi to‘g‘ri). */
export function yulduzHisob(togri, xato, jami = BOSQICH_RAUND) {
  if (togri < Math.ceil(jami / 2)) return 0;
  return xato === 0 ? 3 : xato <= 2 ? 2 : 1;
}

/** Bosqich narsalari o‘yin elementlariga: rasm — kutubxonadan (rasmId), nom — izoh tilida. */
export const xonaElementlar = (b, izoh = "uz") => (b?.items || []).map((x, i) => ({ k: `${b.toplam}-${b.i}-${i}`, image: x.r, rasmId: x.r, emoji: x.e || "", uz: x.s[izoh] || x.s.uz, soz: x.s, ...(x.ulashA ? { ulashA: x.ulashA } : {}), ...(x.sarA ? { sarA: x.sarA } : {}) }));

// ───── REV535: bosqich muqovasi o'yin MAZMUNIGA mos ─────
// Bu o'yinlar bosqichdagi so'z to'plamidan foydalanmaydi (o'z ma'lumoti: ranglar, sonlar, ketma-ketliklar, ovozlar) — ularning
// bosqichida «non, qulupnay» kabi aloqasiz rasm turardi. Endi muqova — shu o'yinning o'z topshirig'idan namuna.
export const OZ_MUQOVALI = new Set([114, 106, 103, 57, 43, 59, 49, 61, 62, 63, 64, 121, 123, 142, 118, 18, 152, 146, 29, 157, 153, 15, 156, 166, 176]);
/** → { el } (rasm/emoji elementi) | { rang: "#hex" } | { matn: "12" } | { emoji } — o'yinning shu bosqichidagi birinchi topshiriqdan. */
const _muqovaKesh = new Map();
export function bosqichMuqova(oyinId, b, yosh, yasa) {
  if (!OZ_MUQOVALI.has(Number(oyinId)) || typeof yasa !== "function") return null;
  const kk = `${oyinId}|${b.i}|${yosh}`; if (_muqovaKesh.has(kk)) return _muqovaKesh.get(kk);
  const natija = _muqova(oyinId, b, yosh, yasa); _muqovaKesh.set(kk, natija); return natija;
}
function _muqova(oyinId, b, yosh, yasa) {
  const o = oyinOl(Number(oyinId)); const zaxira = { emoji: o?.belgi || "🎮" };
  let h = null; try { h = yasa(Number(oyinId), { elementlar: xonaElementlar(b, "uz"), yosh, urug: 4000 + Number(oyinId) * 31 + b.i * 7, til: "uz", izoh: "uz", kirishDaraja: "yoq", ...bosqichSozlama(yosh, b.i, oyinId) }); } catch { h = null; }
  const r = h?.raundlar?.[(b.i - 1) % Math.max(1, h?.raundlar?.length || 1)]; if (!r) return zaxira;
  const kal = Array.isArray(r.togri) ? r.togri[0] : r.togri; const v = (r.variantlar || []).find((x) => x?.k === kal) || (r.variantlar || [])[0];
  const el = r.nishon || r.savol?.el || v?.el;
  if (el && (el.rasmId || el.soz?.r || el.emoji || el.uz)) return { el };
  const rang = v?.rang || r.savol?.rang; if (rang) return { rang: RANG_HEX[rang] || rang };
  const son = v?.son ?? r.savol?.soni ?? (r.savol?.onlar != null ? r.savol.onlar * 10 + r.savol.birlar : null); if (son != null) return { matn: String(son) };
  return zaxira;
}
