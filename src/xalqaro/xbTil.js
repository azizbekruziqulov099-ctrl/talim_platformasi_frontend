// REV270: «Xalqaro baholash» uch tilda — o'zbek, rus, ingliz. Til = interfeys tili (ru → ruscha, en → inglizcha, qolgani → o'zbekcha).
// Kontent (savollar, darslar, natijalar) serverdan shu tilda keladi va natijalar har til uchun ALOHIDA saqlanadi.
// Bu fayl — bo'limning o'z matnlari (tugmalar, sarlavhalar, ustoz gaplari) uchun tarjima lug'ati.
import { interfaceLocale, uiText } from "../interface/interfaceRuntime.js";
import MATNLAR from "./xbMatnlar.js";

// REV315: 5 til — nemis va ispan kontenti bazaga yuklangach shu ro'yxat bo'yicha ishlaydi
export const XB_TILLAR = ["uz", "ru", "en", "de", "es"];
export const XB_TIL_NOMI = { uz: "O‘zbekcha", ru: "Русский", en: "English", de: "Deutsch", es: "Español" };
export const XB_TIL_BAYROQ = { uz: "🇺🇿", ru: "🇷🇺", en: "🇬🇧", de: "🇩🇪", es: "🇪🇸" };
export const MIK_TIL = { uz: "uz-UZ", ru: "ru-RU", en: "en-US", de: "de-DE", es: "es-ES" };

/** Interfeys tili → bo'lim tili (uz | ru | en). */
export function xbTil(loc) {
  let l = loc;
  if (l === undefined) { try { l = interfaceLocale(); } catch { l = "uz"; } }
  const s = String(l || "uz");
  return s.startsWith("ru") ? "ru" : s.startsWith("en") ? "en" : s.startsWith("de") ? "de" : s.startsWith("es") ? "es" : "uz";
}

/** Bo'lim matni shu tilda. O'zbekchada — platformaning odatiy interfeys qoidasi (yangi alifbo va h.k.). */
export function T(s) {
  if (typeof s !== "string" || !s) return s;
  const til = xbTil();
  if (til === "uz") return uiText(s);
  const t = MATNLAR[s]?.[til];
  return t ?? uiText(s);
}

/** Shablonli gap: tf("{n}-sinf", {n: 8}) → «8-sinf» / «8 класс» / «Grade 8». Ovoz uchun ham (yangi alifbosiz). */
export function tf(uz, vars = {}, til = xbTil()) {
  const shablon = til === "uz" ? uz : (MATNLAR[uz]?.[til] ?? uiText(uz));   // REV317: nemis/ispan — interfeys tarjimasi
  return String(shablon).replace(/\{(\w+)\}/g, (m, k) => (Object.hasOwn(vars, k) ? String(vars[k] ?? "") : m));
}

/** Ovoz uchun: ruscha/inglizcha matn TTS ga til tegi bilan boradi ([ru]…[/ru]) — to'g'ri ovoz va talaffuz tanlanadi. */
export function ovozMatni(text, til = xbTil()) {
  const t = String(text || "").trim();
  if (!t || til === "uz") return t;
  return `[${til}]${t.replace(/\[\/?(?:uz|ru|en|de|es)\]/g, "")}[/${til}]`;
}
