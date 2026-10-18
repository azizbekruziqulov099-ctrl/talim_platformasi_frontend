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
  return id && rasmlar?.[id] ? { id, src: rasmlar[id] } : null;
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
