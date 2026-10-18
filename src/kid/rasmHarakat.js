// REV144: darsdagi rasmlar jonli — har rasm o'z ma'nosiga mos 1–2 soniyalik harakat qiladi (sakraydi, yuradi,
// aylanadi, uchadi…), keyin tinch turadi; bosilsa yana bir marta harakat qiladi. Emoji o'rniga — rassom chizgan rasm.
import { SOZLAR, TURKUM } from "./xonalar/xonaLugat.js";
import { DARS_RASM_META } from "./darsRasmMeta.js";

const tozala = (e) => String(e || "").replace(/[️‍]/g, "").trim();
const sozNorm = (w) => String(w || "").toLowerCase().replace(/[^a-z]/g, "");

let EMOJI_ID = null;
let DARS_SOZ_X = null;
const iboraNorm = (w) => String(w || "").toLowerCase().replace(/[’‘]/g, "'").replace(/[!?.,«»"…]/g, "").replace(/\s+/g, " ").trim();
/** REV151: inglizcha so'z/ibora → chizilgan dars rasmi («thank you», «it's a ball»). */
function DARS_SOZ() {
  if (!DARS_SOZ_X) { DARS_SOZ_X = {}; for (const m of DARS_RASM_META) for (const w of m.soz || []) if (!DARS_SOZ_X[w]) DARS_SOZ_X[w] = `d_${m.id}`; }
  return DARS_SOZ_X;
}
/** Emoji → so'z id (bir emojini ikki so'z ishlatsa — noaniq, olinmaydi). */
function emojiXarita() {
  if (EMOJI_ID) return EMOJI_ID;
  const sanoq = {};
  for (const [id, s] of Object.entries(SOZLAR)) { const e = tozala(s.emoji); if (e) (sanoq[e] = sanoq[e] || []).push(id); }
  EMOJI_ID = Object.fromEntries(Object.entries(sanoq).filter(([, ids]) => ids.length === 1).map(([e, ids]) => [e, ids[0]]));
  // REV151: darslar uchun chizilgan rasmlar (id «d_…») — xonalar so'zlarida yo'q emojilar uchun
  const dars = {};
  for (const m of DARS_RASM_META) { const e = tozala(m.emoji); if (e && !sanoq[e]) (dars[e] = dars[e] || []).push(`d_${m.id}`); }
  for (const [e, ids] of Object.entries(dars)) if (ids.length === 1) EMOJI_ID[e] = ids[0];
  // REV153: o'yinlardagi chizilgan rasmlar (yulduz, quti, pufak) — darsda ham
  for (const [e, id] of Object.entries({ "⭐": "j_yulduz", "🌟": "j_yulduz", "📦": "j_quti", "🫧": "j_pufak" })) if (!EMOJI_ID[e]) EMOJI_ID[e] = id;
  return EMOJI_ID;
}

/** Rasm qaysi so'zniki: inglizcha so'z (kitobdagi «🍎|apple») yoki emoji orqali. */
export function sozId({ soz = "", emoji = "" } = {}) {
  const w = sozNorm(soz);
  if (w && SOZLAR[w]) return w;
  const ibora = iboraNorm(soz);
  if (ibora && DARS_SOZ()[ibora]) return DARS_SOZ()[ibora];
  return emojiXarita()[tozala(emoji)] || null;
}

// REV153: so'z yoki ma'nosi (istalgan tilda: o'zbek, rus, ingliz, nemis, arab, xitoy…) → chizilgan rasm id.
// Oldin faqat inglizcha so'z yoki emoji bo'yicha topilardi — arab/nemis/rus darslarida bir emoji ikki ma'noda
// (🔴 qizil / to'xta) bo'lsa rasm chiqmay, emoji qolardi. Endi doskadagi tarjima («qizil») ham hisobga olinadi.
const ARTIKL = /^(?:the|a|an|der|die|das|le|la|les|l|el|los|las|un|une|al)\s+|^(?:l['’]|al-)/;
export const matnNorm = (t) => String(t || "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
  .replace(/\[\/?[a-z]{2}\]/g, "").replace(/[’‘ʻʼ`´]/g, "'").replace(/^[\s—–\-:,]+|[\s!?.,;:…«»"()]+$/gu, "").replace(/\s+/g, " ").trim();
let MATN_ID = null;
function matnXarita() {
  if (MATN_ID) return MATN_ID;
  const m = new Map();
  const qosh = (t, id) => {
    const a = matnNorm(t);
    if (!a) return;
    for (const k of [a, a.replace(ARTIKL, "").replace(/^ال/, "")]) {
      if (!k || k.length < 2 && !/[\u3040-\u9fff\uac00-\ud7af]/u.test(k)) continue;
      const old = m.get(k);
      // dars rasmi (d_…) va xona rasmi bir xil so'z bo'lsa — dars rasmi; ikki xil narsaga to'g'ri kelsa — noaniq
      if (old === undefined) m.set(k, id); else if (old !== id && !(old && old.startsWith("d_") && !id.startsWith("d_"))) m.set(k, null);
    }
  };
  for (const d of DARS_RASM_META) { for (const w of d.soz || []) qosh(w, `d_${d.id}`); for (const w of d.uz || []) qosh(w, `d_${d.id}`); }
  for (const [id, s] of Object.entries(SOZLAR)) for (const w of Object.values(s.w || {})) qosh(w, id);
  MATN_ID = m;
  return m;
}
/** Matn (so'z, ibora yoki tarjima) → rasm id; topilmasa yoki noaniq bo'lsa — null. */
export function matnId(...matnlar) {
  const m = matnXarita();
  for (const t of matnlar.flat()) {
    const a = matnNorm(t);
    if (!a) continue;
    const bosh = a.split(/\s+[—–-]\s+|[,!?.;:]\s*/)[0].trim();   // gapning birinchi bo'lagi («salom! isming nima?» → «salom»)
    for (const k of [a, a.replace(ARTIKL, "").replace(/^ال/, ""), bosh, bosh.replace(ARTIKL, "")]) { const id = k && m.get(k); if (id) return id; }
  }
  return null;
}

/** Bitta emoji uchun chizilgan rasm (xonalar rasmi). rasmlar — {id: url}. Bir nechta emoji (sanoq) — null. */
export function emojiRasm(emoji, rasmlar, soz = "") {
  const e = tozala(emoji);
  if (!e || /\s/.test(e)) return null;
  // REV151: bir emoji bir nechta dars so'zida (👋 Hello / 👋 Goodbye) — yonidagi so'z bo'yicha aniqlanadi
  const ibora = iboraNorm(soz);
  if (ibora) {
    for (const m of DARS_RASM_META) {
      if (tozala(m.emoji) !== e) continue;
      if ((m.soz || []).some((w) => ibora === w || ibora.startsWith(`${w} `) || w.startsWith(`${ibora} `) || w === ibora.split(" ")[0]) && rasmlar?.[`d_${m.id}`]) return { id: `d_${m.id}`, src: rasmlar[`d_${m.id}`] };
    }
  }
  const id = emojiXarita()[e];
  if (id && rasmlar?.[id]) return { id, src: rasmlar[id] };
  // REV153: xona so'zining rasmi hali chizilmagan, lekin shu belgili dars rasmi bor (🔴 → d_red)
  const dars = DARS_RASM_META.filter((m) => tozala(m.emoji) === e && rasmlar?.[`d_${m.id}`]);
  return dars.length === 1 ? { id: `d_${dars[0].id}`, src: rasmlar[`d_${dars[0].id}`] } : null;
}

const MAXSUS = {
  jump: "sakra", run: "yugur", swim: "suz", sing: "kuyla", dance: "raqs", draw: "chiz",
  bird: "uch", plane: "uch", helicopter: "uch", kite: "uch", balloon: "kotaril", butterfly: "uch",
  frog: "sakra", rabbit: "sakra", duck: "lapang", hen: "lapang", fish: "suz",
  ball: "dumala", sun: "nur", rain: "tomchi", snow: "qor", wind: "shamol", cloud: "suzib", rainbow: "kamalak",
  clock: "aylan", happy: "sakra", sad: "egil", cold: "titra", hot: "terla", hungry: "silkin",
  hello: "salom", mother: "salom", father: "salom", teacher: "salom", granny: "salom", grandpa: "salom",
};
const TURKUM_HARAKAT = {
  hayvon: "lapang", transport: "yur", meva: "dumala", ovqat: "sakrab_chiq", ichimlik: "sakrab_chiq", kiyim: "tebran",
  oyinchoq: "sakra", maktab: "aylan", rang: "puls", tana: "silkin", odam: "salom", havo: "suzib", fasl: "puls", vaqt: "puls",
};

/** So'zga mos harakat turi (CSS: .an-{tur}). Noma'lum bo'lsa — «chiq» (sakrab paydo bo'ladi). */
export function harakatTuri(asl) {
  if (!asl) return "chiq";
  const id = String(asl).replace(/^d_/, "");   // REV151: dars rasmi ham o'z harakatini qiladi (hello → salom)
  if (MAXSUS[id]) return MAXSUS[id];
  for (const [t, ids] of Object.entries(TURKUM)) if (ids.includes(id)) return TURKUM_HARAKAT[t] || "chiq";
  return "chiq";
}

export const HARAKAT_TURLARI = ["chiq", "sakra", "yugur", "suz", "kuyla", "raqs", "chiz", "uch", "kotaril", "lapang", "dumala", "nur",
  "tomchi", "qor", "shamol", "suzib", "kamalak", "aylan", "egil", "titra", "terla", "silkin", "salom", "yur", "sakrab_chiq", "tebran", "puls"];
