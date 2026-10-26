// REV178: darsdan oldingi takrorda so'z ma'nosi va Kabu buyruqlari — HOZIRGI interfeys tilida (uz | ru | en).
// O'tgan dars boshqa izoh tilida o'tilgan bo'lsa ham (masalan, inglizcha izohli), ma'no umumiy lug'atdan joriy tilda topiladi.
import { BARCHA_SOZ } from "../maktab/index.js";

const ARTIKL = /^(der|die|das|the|a|an|le|la|les|l'|el|los|las|un|une|una|ein|eine)\s+/;
const norm = (s) => String(s || "").toLowerCase().normalize("NFC").replace(/[.!?,;:«»"“”]/g, "").replace(/\s+/g, " ").trim().replace(ARTIKL, "");
let INDEKS = null;
function indeks() {
  if (INDEKS) return INDEKS;
  INDEKS = new Map();
  for (const w of Object.values(BARCHA_SOZ)) for (const [l, v] of Object.entries(w.w || {})) { const k = `${l}:${norm(v)}`; if (!INDEKS.has(k)) INDEKS.set(k, w); }
  return INDEKS;
}

/** So'z ma'nosi kerakli tilda: avval o'sha tilda saqlangani, keyin umumiy lug'atdan, bo'lmasa — saqlangan ma'no (o'z tili bilan). */
export function manoTanla(item = {}, L = "uz") {
  if (item.manolar?.[L]) return { mano: item.manolar[L], til: L };
  if (item.manoTil === L && item.mano) return { mano: item.mano, til: L };
  const w = indeks().get(`${item.til}:${norm(item.soz)}`);
  if (w?.w?.[L]) return { mano: w.w[L], til: L };
  if (!item.mano) return { mano: "", til: L };
  return { mano: item.mano, til: item.manoTil || (/[Ѐ-ӿ]/.test(item.mano) ? "ru" : L) };
}

export const TIL_RAVISH = {
  de: { uz: "nemischa", ru: "по-немецки", en: "in German" }, en: { uz: "inglizcha", ru: "по-английски", en: "in English" },
  ru: { uz: "ruscha", ru: "по-русски", en: "in Russian" }, fr: { uz: "fransuzcha", ru: "по-французски", en: "in French" },
  es: { uz: "ispancha", ru: "по-испански", en: "in Spanish" }, ar: { uz: "arabcha", ru: "по-арабски", en: "in Arabic" },
  tr: { uz: "turkcha", ru: "по-турецки", en: "in Turkish" }, zh: { uz: "xitoycha", ru: "по-китайски", en: "in Chinese" },
  ja: { uz: "yaponcha", ru: "по-японски", en: "in Japanese" }, ko: { uz: "koreyscha", ru: "по-корейски", en: "in Korean" },
};
const BUYRUQ = {
  uz: { yoz: "«{m}» — shu so‘zni {t} yozing.", ayt: "To‘g‘ri yozilishini ko‘rdingiz. Endi ovoz chiqarib ayting: {w}", erkin: "O‘tgan darsdagi {t} so‘zlardan eslaganingizni yozing — har birini yangi qatorga.", bosh: "Yangi darsdan oldin o‘tgan so‘zlarni takrorlaymiz!" },
  ru: { yoz: "«{m}» — напишите это слово {t}.", ayt: "Вы увидели правильное написание. Теперь произнесите вслух: {w}", erkin: "Напишите слова прошлого урока {t}, которые помните, — каждое с новой строки.", bosh: "Перед новым уроком повторим пройденные слова!" },
  en: { yoz: "“{m}” — write this word {t}.", ayt: "You have seen the correct spelling. Now say it aloud: {w}", erkin: "Write the words from the last lesson {t} that you remember — one per line.", bosh: "Before the new lesson, let's review the words we learned!" },
};
const teg = (t, l) => (!t || !l || l === "uz" ? t : `[${l}]${t}[/${l}]`);

/**
 * Kabu buyrug'i: ekranda — oddiy matn; ovozda — har qism o'z tilida ({m} — ma'no o'z tilida, {w} — o'rganilayotgan til so'zi).
 * → { matn, ovoz }
 */
export function buyruq(tur, { L = "uz", til = "", m = "", mTil = L, w = "" } = {}) {
  const l = BUYRUQ[L] ? L : "uz";
  const tpl = BUYRUQ[l][tur] || "";
  const t = TIL_RAVISH[til]?.[l] || til;
  const matn = tpl.replace("{m}", m).replace("{t}", t).replace("{w}", w);
  const ovoz = tpl.split(/(\{[mw]\})/).map((p) => (p === "{m}" ? teg(m, mTil) : p === "{w}" ? teg(w, til) : teg(p.replace("{t}", t), l))).join("");
  return { matn, ovoz };
}
