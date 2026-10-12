// REV129: Maktab (1–11 sinf) til dasturi — ma'lumot yozish yordamchilari.
// Har sinf — bir o'quv yili: 8 ta bo'lim (har chorakda 2 ta). Bo'limda 10 ta so'z va 3–5 ta gap, hammasi 11 tilda:
// izoh (uz, ru, en) va o'rganiladigan 10 til (en, ru, de, fr, es, ar, tr, zh, ja, ko).
import { SOZLAR } from "../kid/xonalar/xonaLugat.js";

export const TILLAR = ["uz", "ru", "en", "de", "fr", "es", "ar", "tr", "zh", "ja", "ko"];
export const qator = (s) => {
  const p = String(s).split("|").map((x) => x.trim());
  if (p.length !== TILLAR.length) throw new Error(`11 til kerak (${p.length}): ${s.slice(0, 60)}`);
  return Object.fromEntries(p.map((x, i) => [TILLAR[i], x]));
};

/** Yangi so'z: id, emoji, rasm (Fluent 3D nomi yoki ""), 11 tildagi yozuv. */
export const soz = (id, emoji, rasm, s) => ({ id, emoji, rasm, w: qator(s) });
/** Bog'cha lug'atidagi tayyor so'z (rasmini maktab uslubidagi Fluent rasmga almashtirish mumkin). */
export const bor = (id, rasm = "") => {
  const s = SOZLAR[id];
  if (!s) throw new Error(`Bog'cha lug'atida yo'q: ${id}`);
  return { id, emoji: s.emoji, rasm, w: s.w, bogcha: true };
};
/** Gap (11 tilda). */
export const gap = (s) => ({ w: qator(s) });
/** Bo'lim: id, nomi (uz | ru | en), emoji, so'zlar, gaplar. */
export const bolim = (id, nom, emoji, sozlar, gaplar) => {
  const [uz, ru, en] = String(nom).split("|").map((x) => x.trim());
  return { id, nom: { uz, ru, en }, emoji, sozlar, gaplar: gaplar.map((g, i) => ({ id: `${id}-g${i + 1}`, ...g })) };
};
