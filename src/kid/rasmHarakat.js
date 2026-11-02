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
  for (const [e, ids] of Object.entries(dars)) {
    if (ids.length === 1) { EMOJI_ID[e] = ids[0]; continue; }
    const asos = ids.filter((id) => !id.slice(2).includes("-"));   // REV153: 🐍 snake / snake-cant-walk → snake
    if (asos.length === 1) EMOJI_ID[e] = asos[0];
  }
  // REV153: o'yinlardagi chizilgan rasmlar (yulduz, quti, pufak) — darsda ham
  for (const [e, id] of Object.entries({ "⭐": "j_yulduz", "🌟": "j_yulduz", "📦": "j_quti", "🫧": "j_pufak" })) if (!EMOJI_ID[e]) EMOJI_ID[e] = id;
  return EMOJI_ID;
}

/** Rasm qaysi so'zniki: inglizcha so'z (kitobdagi «🍎|apple») yoki emoji orqali. */

// REV243: 662 ta belgining rasmini ko'z bilan tekshirib chiqildi (2–7 yoshdagi barcha kitoblar). Noto'g'ri bog'langanlari:
// qiymat — to'g'ri rasm; null — mos rasm yo'q (belgining o'zi ko'rinadi; rassom chizguncha).
export const BELGI_TUZATISH = {
  // REV243: noto'g'ri bog'langan rasmlar
  "🤔": "d_y-thinking-face", "🐘": "d_elephant", "👏": "d_y-clapping-hands-sign", "👍": "d_y-thumbs-up-sign", "🤝": "d_y-handshake", "🏀": "d_y-basketball-and-hoop",   // so'zsiz belgi — oddiy rasm
  "🧊": "d_ice-cube", "🐈": "cat", "🐱": "cat", "💧": "d_water-splash-puddle", "🍽": "d_fork-and-knife", "😀": "d_xursand", "🔢": "d_y-input-symbol-for-numbers",
  // REV244: rassomning yangi rasmlari — sanash uchun BITTALIK narsalar, savol/javob belgilari, raqam kartochkalari
  "🧱": "d_y-single-block",
  "🧦": "d_y-single-sock",
  "👟": "d_y-single-sneaker",
  "🧤": "d_y-single-glove",
  "🪙": "d_y-single-coin",
  "🍒": "d_y-single-cherry",
  "🍇": "d_y-single-grape",
  "🖍": "d_y-single-colored-pencil",
  "🪵": "d_y-single-stick",
  "🦵": "d_y-whole-leg",
  "🪑": "d_y-single-chair",
  "❓": "d_y-question-mark",
  "✅": "d_y-check-mark",
  "❌": "d_y-cross-mark",
  "👦": "d_y-single-boy",
  "🦢": "d_y-number-2-swan",
  "〰": "d_y-number-3-bird",
};

export function sozId({ soz = "", emoji = "" } = {}) {
  const tz = tozala(emoji);
  if (tz && Object.prototype.hasOwnProperty.call(BELGI_TUZATISH, tz) && !soz) return BELGI_TUZATISH[tz];
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
      // REV259: javob varianti uchun ATAYLAB chizilgan rasm (d_v-…) — shu so'zga ustun (ikkilanish yo'q)
      if (old && old.startsWith("d_v-")) continue;
      if (id.startsWith("d_v-")) { m.set(k, id); continue; }
      if (old === undefined) m.set(k, id); else if (old !== id && !(old && old.startsWith("d_") && !id.startsWith("d_"))) m.set(k, null);
    }
  };
  // REV259: «past» — bog'cha darslari uchun chizilgan rasm: so'zi bo'sh bo'lsa oladi, bor so'zni noaniq qilmaydi
  const pastQosh = (t, id) => { const a = matnNorm(t); if (a && !m.has(a)) m.set(a, id); };
  for (const d of DARS_RASM_META) { if (d.past) continue; for (const w of d.soz || []) qosh(w, `d_${d.id}`); for (const w of d.uz || []) qosh(w, `d_${d.id}`); }
  for (const [id, s] of Object.entries(SOZLAR)) for (const w of Object.values(s.w || {})) qosh(w, id);
  // bog'cha rasmlari eng oxirida — faqat hech kim egallamagan so'zlarga
  for (const d of DARS_RASM_META) { if (!d.past) continue; for (const w of [...(d.soz || []), ...(d.uz || [])]) pastQosh(w, `d_${d.id}`); }
  MATN_ID = m;
  return m;
}

// REV241: salom — RASMIY (kattaga, ustozga) va DO'STONA (tengdoshga) har xil rasm. Oldin Hello ham, Hi ham bir xil
// qo'l silkitayotgan qiz edi — bola farqini ko'rmasdi.
const RASMIY_SALOM = /^(hello|good (morning|afternoon|evening)|здравствуй(те)?|здравствуи(те)?|добр(ое утро|ый день|ый вечер|ыи день|ыи вечер)|bonjour|bonsoir|guten (tag|morgen|abend)|buen(os d[ií]as|as tardes|as noches)|assalomu alaykum|السلام عليكم|안녕하세요|こんにちは|您好|merhaba|iyi g[üu]nler|g[üu]nayd[ıi]n)$/i;   // NFKD: й → и, í → i
const DOSTONA_SALOM = /^(hi|hey|привет|салют|salut|hallo|hola|ciao|selam|안녕|やあ|嗨|مرحبا|salom)$/i;
export function salomRasm(matn) {
  const a = matnNorm(matn).replace(/[!?.,]+$/g, "").trim();
  if (!a || a.split(/\s+/).length > 4) return null;
  if (RASMIY_SALOM.test(a)) return "d_m-assalomu-alaykum";
  if (DOSTONA_SALOM.test(a)) return "d_m-qol-silkit-salomlash";
  return null;
}

/** Matn (so'z, ibora yoki tarjima) → rasm id; topilmasa yoki noaniq bo'lsa — null. */
export function matnId(...matnlar) {
  const m = matnXarita();
  for (const t of matnlar.flat()) {
    const salom = salomRasm(t); if (salom) return salom;
    const a = matnNorm(t);
    if (!a) continue;
    const bosh = a.split(/\s+[—–-]\s+|[,!?.;:]\s*/)[0].trim();   // gapning birinchi bo'lagi («salom! isming nima?» → «salom»)
    for (const k of [a, a.replace(ARTIKL, "").replace(/^ال/, ""), bosh, bosh.replace(ARTIKL, "")]) { const id = k && m.get(k); if (id) return id; }
  }
  return null;
}

const OXSHASH = { "🐇": "🐰", "🐈": "🐱", "🐕": "🐶", "🐩": "🐶", "🐎": "🐴", "🐄": "🐮", "🚆": "🚂", "🚃": "🚂", "🌞": "☀", "🌤": "☀",
  "💚": "🟢", "💜": "🟣", "🩵": "🔵", "💙": "🔵", "🐒": "🐵", "🐠": "🐟", "🍰": "🎂", "🐈⬛": "🐱" };

/** Bitta emoji uchun chizilgan rasm (xonalar rasmi). rasmlar — {id: url}. Bir nechta emoji (sanoq) — null. */
export function emojiRasm(emoji, rasmlar, soz = "") {
  const salom = soz && salomRasm(String(soz).replace(/\[\/?[a-z]{2}\]/g, ""));
  if (salom && rasmlar?.[salom]) return { id: salom, src: rasmlar[salom] };
  const e0 = tozala(emoji);
  if (!e0 || /\s/.test(e0)) return null;
  if (Object.prototype.hasOwnProperty.call(BELGI_TUZATISH, e0)) { const t = BELGI_TUZATISH[e0]; return t && rasmlar?.[t] ? { id: t, src: rasmlar[t] } : null; }
  const e = OXSHASH[e0] || e0;   // REV153: o'xshash belgi — bir xil rasm (🐇 → 🐰, 💚 → 🟢)
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

/** REV238: so'z bo'yicha TAXMINIY rasm — butun rasm kutubxonasidan (dars rasmlari va xona rasmlari, hamma tilda).
 *  Javob varianti aniq so'z bo'lmasa ham («wash our hands», «qo‘l yuvamiz», «на кухне») — undagi asosiy so'zning
 *  rasmini topadi: avval butun ibora, keyin har so'z (eng uzun so'zdan boshlab), so'z o'zagi (qo'shimchasiz) bo'yicha. */
const KICHIK_SOZ = new Set(["the","a","an","and","or","to","in","on","at","of","for","is","it","we","our","with","va","yoki","bilan","uchun","ham","bu","и","в","на","с","для","это","не","no","yes","ha","yo'q","нет","да",
  "bir","emas","bor","xil","marta","faqat","qarab","qarashda","kabi","yoqqa","birma-bir","tomon","sha","only","not","all"]);
const OZAK = (w) => w.replace(/(lardan|larni|larga|larda|ning|dagi|ga|da|dan|ni|lar|ing|ed|es|s|ами|ах|ой|ой|ей|ом|ам|ы|и|а|у|е|ю|я)$/u, "");
export function matnIdTaxmin(matn) {
  // bitta so'zli aniq moslik yoki butun ibora — ishonchli; ko'p so'zli iborada faqat ma'noli so'zlar qidiriladi
  const aniq = matnId(matn);
  if (aniq && !/\s/.test(matnNorm(matn))) return aniq;
  const m = matnXarita();
  const sozlar = matnNorm(matn).split(/[\s,.;:!?«»"()/—–-]+/).filter((w) => w.length >= 3 && !KICHIK_SOZ.has(w)).sort((a, b) => b.length - a.length);
  for (const w of sozlar) {
    const id = m.get(w); if (id) return id;
  }
  for (const w of sozlar) {
    const oz = OZAK(w);
    if (oz.length < 3) continue;
    let eng = null, engUz = 1e9;
    for (const [k, id] of m) {
      if (!id || k.includes(" ") || /siz$|sizlik$/.test(k) !== /siz$|sizlik$/.test(w)) continue;   // «tartib» ≠ «tartibsiz»
      const kOz = OZAK(k);
      if (kOz === oz || (oz.length >= 5 && kOz.startsWith(oz)) || (kOz.length >= 5 && oz.startsWith(kOz))) {
        if (k.length < engUz) { eng = id; engUz = k.length; }
      }
    }
    if (eng) return eng;
  }
  return null;
}
