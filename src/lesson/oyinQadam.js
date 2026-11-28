// REV325: Miya qadamidagi «O'yin» raqami → o'yin dvigateli uchun ma'lumot (elementlar, sonlar). Sof funksiyalar.
import { oyinMosmi, oyinOl, oyinYasa, DARSDA_YOQ, DARSDA_ALMASH } from "../kid/oyin/oyinRules.js";   // sof qoidalar (JSX emas — node testida ham ishlaydi)

const EMOJI = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu;
const TEG = /\[(\w\w)\](.+?)\[\/\1\]/;

/** «A) 🍐 nok», «🍎 olma», «👋 [en]Hello![/en] / salom» → { emoji, say?, uz? } */
export function qatorElementi(qator) {
  const s = String(qator || "").replace(/^\s*[A-Ea-e]\)\s*/, "").trim();
  const em = s.match(EMOJI);
  if (!em) return null;
  const t = s.match(TEG);
  const qolgan = s.replace(TEG, "").replace(EMOJI, "").replace(/[\/|—–-]+/g, " ").replace(/\s+/g, " ").trim();
  return { emoji: em[0], ...(t ? { say: t[2].trim() } : {}), ...(qolgan ? { uz: qolgan } : {}) };
}

/** Qadamdan elementlar: variantlar, doska qatorlari (va darsning so'zlari — ko'proq xilma-xillik uchun). */
export function qadamElementlari(step, darsSozlari = []) {
  const out = [];
  // REV342: darsdagi variantlar — massiv (serverdan) yoki «A) …» qatorlari (Miya'dan)
  const vq = Array.isArray(step?.variantlar) ? step.variantlar.map((v) => (v && typeof v === "object" ? v.matn || v.text || "" : v)) : String(step?.variantlar || "").split("\n");
  const qator = [...vq, ...String(step?.doska || "").split("\n")];
  for (const q of qator) {
    const e = qatorElementi(q);
    if (e) out.push(e);
    else {   // «🍎🍎🍎» yoki «🍎 🍌 🍇» — har emoji alohida element
      for (const m of String(q || "").matchAll(EMOJI)) out.push({ emoji: m[0] });
    }
  }
  for (const w of darsSozlari || []) if (w?.emoji) out.push({ emoji: w.emoji, say: w.say || "", uz: w.uz || "" });
  const kor = new Set();
  return out.filter((e) => { const k = e.emoji + "|" + (e.say || e.uz || ""); if (kor.has(e.emoji) || kor.has(k)) return false; kor.add(e.emoji); kor.add(k); return true; });
}

/** Qadamdagi sonlar (javob, doska, matn) — sanash o'yinlari uchun. */
export function qadamSonlari(step) {
  const t = `${step?.javob || ""} ${step?.doska || ""} ${step?.ovoz || ""}`;
  const s = [...t.matchAll(/\b(\d{1,2})\b/g)].map((m) => Number(m[1])).filter((n) => n >= 1 && n <= 20);
  const emo = String(step?.doska || "").split("\n").map((l) => (l.match(EMOJI) || []).length).filter((n) => n > 1);
  return [...new Set([...s, ...emo])];
}

/** REV342: butun darsdagi rasmli elementlar (har qadamning doskasi va variantlari) — o'yin qadamida rasm yetmasa shulardan olinadi. */
export function darsElementlari(steps = []) {
  const out = [], kor = new Set();
  for (const st of steps || []) for (const e of qadamElementlari(st)) {
    const k = e.emoji + "|" + (e.say || e.uz || "");
    if (!kor.has(e.emoji) && !kor.has(k)) { kor.add(e.emoji); kor.add(k); out.push(e); }
  }
  return out;
}
const TEGLAR = /\[(\w\w)\](.+?)\[\/\1\]/g;

/** O'ynaladigan o'yin: Miya'dagi raqam mos kelsa — o'sha; aks holda null (qadam avvalgidek o'tadi). */
export function qadamOyini(step, { yosh, darsSozlari = [], darsElementlari: hovuz = [] } = {}) {
  let id = Number(step?.oyin);
  // REV545: darsda ishlatilmaydigan o'yin (117 «Ayt va och») — o'rniga almashtiriladi (116 «Eshit va bos»); o'rinbosari bo'lmasa — o'yinsiz
  if (DARSDA_YOQ.has(id)) id = Number(DARSDA_ALMASH[id]) || 0;
  if (!id || !oyinOl(id)) return null;
  // REV342: qadamning o'z rasmlari → qadam matnida aytilgan so'zlarning rasmlari (dars hovuzidan) → dars hovuzi
  const ozi = qadamElementlari(step, darsSozlari);
  const matn = `${step?.ovoz || ""} ${step?.doska || ""}`;
  const aytilgan = [...matn.matchAll(TEGLAR)].map((m) => m[2].trim().toLowerCase());
  const mos = hovuz.filter((e) => e.say && aytilgan.includes(String(e.say).trim().toLowerCase()));
  const kor = new Set();
  const elementlar = [...ozi, ...mos, ...hovuz].filter((e) => { if (kor.has(e.emoji)) return false; kor.add(e.emoji); return true; });
  const sonlar = qadamSonlari(step);
  const sl = sonlar.length ? sonlar : undefined;
  if (!oyinMosmi(id, { elementlar, yosh, sonlar: sl })) return null;
  // v712: o'yin o'z hovuzidan begona narsa (dars «to'p» haqida — o'yinda fil va sichqon) ko'rsatmasin: asosiy javoblar darsdagi narsalardan bo'lishi shart
  if (!mavzuga(id, elementlar, yosh, sl)) {
    if (id !== 116 && oyinMosmi(116, { elementlar, yosh, sonlar: sl }) && mavzuga(116, elementlar, yosh, sl)) return { id: 116, elementlar, sonlar: sl };
    return null;
  }
  return { id, elementlar, sonlar: sl };
}

const elKalit = (e) => String(e?.rasmId || e?.emoji || e?.say || e?.uz || "");
/** O'yinning asosiy (to'g'ri javob) narsalari darsdagi narsalar bilan kesishadimi (6 xil urug'da kamida bittasi). Narsa ishlatmaydigan o'yinlar (son, shakl) — doim mos. */
export function mavzuga(id, elementlar, yosh, sonlar) {
  const dars = new Set((elementlar || []).flatMap((e) => [elKalit(e), String(e?.emoji || "")]).filter(Boolean));
  let nishonBor = false;
  for (let u = 11; u < 17; u++) {
    let h = null;
    try { h = oyinYasa(id, { elementlar, yosh, sonlar, urug: u, til: "en", izoh: "uz", kirishDaraja: "yoq" }); } catch { return true; }
    for (const r of h?.raundlar || []) {
      const e = r?.savol?.el || (r?.variantlar || []).find((v) => v?.k === r?.togri)?.el;
      if (!e) continue;
      nishonBor = true;
      if (dars.has(elKalit(e)) || (e.emoji && dars.has(String(e.emoji)))) return true;
    }
  }
  return !nishonBor;
}

export const yoshGuruh = (grade) => {
  const m = String(grade || "").match(/(\d)\s*[-–]\s*(\d)/);
  const a = m ? Number(m[1]) : 4;
  return a <= 3 ? "2-3" : a <= 5 ? "4-5" : "6-7";
};
