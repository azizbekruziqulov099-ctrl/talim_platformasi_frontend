// REV371: «O‘yinlar xonasi» qoidalari. Har o‘yin — mavzu to‘plamlari bo‘yicha bosqichlar (10 tadan narsa, 10 raund).
// Ochilish: 1-bosqich doim ochiq (obunasiz ham — sinab ko‘rish uchun); keyingisi faqat oldingisi O‘TILGAN va
// o‘tilgan kundan keyin yangi kun kelganda ochiladi (har kuni bittadan), hamda faqat obunachilarga.
import { XONA_TOPLAM } from "./xonaData.js";
import { oyinOl } from "../oyin/oyinRules.js";

export const XONA_OYINLAR = [116, 83, 68, 89, 88, 117, 119, 76, 86, 32];
export const BOSQICH_RAUND = 10;
const MAX_BOSQICH = 20, MIN_QOLDIQ = 6;

const yoshNorm = (y) => (["2-3", "4-5", "6-7"].includes(String(y)) ? String(y) : "4-5");

/** O‘yin uchun bosqichlar ro‘yxati: [{ i, toplam, belgi, nom, items }] — to‘plamlar har o‘yinda boshqa tartibda. */
export function bosqichlar(oyinId) {
  const k = Math.max(0, XONA_OYINLAR.indexOf(Number(oyinId)));
  const t = XONA_TOPLAM.map((_, j) => XONA_TOPLAM[(j + k) % XONA_TOPLAM.length]);
  const out = [];
  for (const p of t) {
    const bo = [];
    for (let i = 0; i < p.items.length; i += 10) bo.push(p.items.slice(i, i + 10));
    if (bo.length > 1 && bo[bo.length - 1].length < MIN_QOLDIQ) bo[bo.length - 2] = bo[bo.length - 2].concat(bo.pop());
    for (const items of bo) if (items.length >= MIN_QOLDIQ) out.push({ toplam: p.kalit, belgi: p.belgi, nom: p.nom, items });
  }
  return out.slice(0, MAX_BOSQICH).map((b, i) => ({ ...b, i: i + 1 }));
}

/** Bosqich qiyinligi: yoshga qarab boshlanadi, bosqich sayin variantlar ko‘payadi (ko‘pi bilan 4). */
export function bosqichSozlama(yosh, i) {
  const y = yoshNorm(yosh);
  const baza = { "2-3": 2, "4-5": 3, "6-7": 3 }[y];
  const qadam = { "2-3": 6, "4-5": 5, "6-7": 3 }[y];
  return { raundSoni: BOSQICH_RAUND, variantSoniMajbur: Math.min(4, baza + Math.floor((i - 1) / qadam)) };
}

/** Bola yoshiga mos o‘yinlar (katalogda bor, shu yoshga ruxsat, o‘chirilmagan). */
export function xonaOyinlari(yosh, yopiqmi = () => false) {
  const y = yoshNorm(yosh);
  return XONA_OYINLAR.map((id) => oyinOl(id)).filter((o) => o && o.yosh.includes(y) && !yopiqmi(o.id));
}

/** Bosqich holati: otdi | ochiq | ertaga | qulf | obuna. prog = { [bosqich]: { sana, yulduz } }. */
export function bosqichHolati(prog = {}, i, { obuna = false, bugun = "" } = {}) {
  if (prog[i]) return "otdi";
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
export const xonaElementlar = (b, izoh = "uz") => (b?.items || []).map((x, i) => ({ k: `${b.toplam}-${b.i}-${i}`, image: x.r, rasmId: x.r, emoji: "", uz: x.s[izoh] || x.s.uz, soz: x.s }));
