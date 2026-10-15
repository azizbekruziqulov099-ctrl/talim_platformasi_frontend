// REV148: «Jonli o'yinlar» — 120 ta bosqich (8 xil o'yin × 15 pog'ona). Har bosqichda boshqa narsalar (xonalar
// rasmlari), pog'ona oshgani sari o'yin tezlashadi va qiyinlashadi. Bosqichlar ketma-ket ochiladi. Sof qoidalar (brauzersiz sinaladi).
import { XONALAR } from "../xonalar/xonaLugat.js";

export const TURLAR = [
  { id: "ushla", emoji: "🧺" },
  { id: "yarim", emoji: "🙈" },
  { id: "qutiga", emoji: "📦" },
  { id: "pufak", emoji: "🫧" },
  { id: "soya", emoji: "👤" },
  { id: "aylantir", emoji: "🔄" },
  { id: "tozala", emoji: "🧽" },
  { id: "kattalashtir", emoji: "🎈" },
];
export const POGONA = 15;
export const JAMI = TURLAR.length * POGONA;   // 120

/** O'yin turi nomi va ko'rsatmasi — izoh tilida (uz | ru | en). */
export const JONLI_MATN = {
  ushla: { nom: { uz: "Ushla!", ru: "Лови!", en: "Catch!" },
    k: { uz: "Tushayotgan narsalarni barmog‘ing bilan ushla!", ru: "Лови падающие предметы пальчиком!", en: "Catch the falling things with your finger!" } },
  yarim: { nom: { uz: "Yarim ko‘rinadi", ru: "Кто спрятался?", en: "Peekaboo" },
    k: { uz: "Kim yashirindi? To‘g‘ri rasmni bos!", ru: "Кто спрятался? Нажми на правильную картинку!", en: "Who is hiding? Tap the right picture!" } },
  qutiga: { nom: { uz: "Qutiga sol", ru: "Положи в коробку", en: "Into the box" },
    k: { uz: "Aytilgan narsani ushlab, qutiga olib bor!", ru: "Перетащи названный предмет в коробку!", en: "Drag the named thing into the box!" } },
  pufak: { nom: { uz: "Pufaklar", ru: "Пузыри", en: "Bubbles" },
    k: { uz: "Aytilgan narsa turgan pufakni yor!", ru: "Лопни пузырь с названным предметом!", en: "Pop the bubble with the named thing!" } },
  soya: { nom: { uz: "Soyasi kimniki?", ru: "Чья тень?", en: "Whose shadow?" },
    k: { uz: "Bu kimning soyasi? Rasmini bos!", ru: "Чья это тень? Нажми на картинку!", en: "Whose shadow is it? Tap the picture!" } },
  aylantir: { nom: { uz: "To‘g‘rila", ru: "Поверни", en: "Turn it" },
    k: { uz: "Rasm teskari! Barmog‘ing bilan aylantirib to‘g‘rila!", ru: "Картинка перевёрнута! Поверни её пальчиком!", en: "It’s upside down! Turn it with your finger!" } },
  tozala: { nom: { uz: "Tozala", ru: "Протри", en: "Clean it" },
    k: { uz: "Rasm loy bo‘lib qolibdi — barmog‘ing bilan artib tozala!", ru: "Картинка в грязи — протри её пальчиком!", en: "It’s muddy — rub it clean with your finger!" } },
  kattalashtir: { nom: { uz: "Kattalashtir", ru: "Надуй", en: "Make it big" },
    k: { uz: "Barmog‘ingni bosib tur — rasm kattalashadi!", ru: "Держи пальчик — картинка растёт!", en: "Hold your finger — it grows bigger!" } },
};
export const jonliMatn = (tur, kalit, izoh) => {
  const m = JONLI_MATN[tur]?.[kalit] || {};
  return m[["uz", "ru", "en"].includes(izoh) ? izoh : "uz"] || m.uz || "";
};

/** Takrorlanadigan tasodif (bosqich raqamidan) — har safar bir xil bosqich bir xil narsalar bilan. */
export function urugli(seed) {
  let s = (seed * 9301 + 49297) % 233280 || 1;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
const aralash = (arr, rnd) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/**
 * Bosqich (0..119): tur, pog'ona (1..15), qiyinlik (0..1), xona va shu bosqich narsalari (rasmi borlar).
 * rasmBor(id) — rasm bormi (UI dan beriladi; sinovda hamma narsa bor deb olinadi).
 */
export function daraja(n, rasmBor = () => true) {
  const k = Math.max(0, Math.min(JAMI - 1, Math.floor(Number(n) || 0)));
  const tur = TURLAR[k % TURLAR.length];
  const pogona = Math.floor(k / TURLAR.length) + 1;
  const qiyin = (pogona - 1) / (POGONA - 1);
  const xona = XONALAR[(pogona - 1 + (k % TURLAR.length)) % XONALAR.length];
  const rnd = urugli(k + 7);
  const sozlar = aralash(xona.narsalar.filter((id, i, a) => a.indexOf(id) === i && rasmBor(id)), rnd);   // odamlar emas — narsalar (rasm keng va aniq)
  const variant = 2 + (pogona > 3 ? 1 : 0) + (pogona > 9 ? 1 : 0);   // 2..4 ta tanlov
  return {
    n: k, tur: tur.id, emoji: tur.emoji, pogona, qiyin, xona: xona.id, sozlar,
    raund: tur.id === "ushla" ? 1 : ["aylantir", "tozala", "kattalashtir"].includes(tur.id) ? 3 : 4,
    variant,
    ushlaSoni: 3 + Math.round(qiyin * 4),                 // 3..7 ta narsa tushadi
    tushish: Math.round(5200 - qiyin * 2600),             // bitta narsaning tushish vaqti (ms)
    pufakTezlik: Math.round(9000 - qiyin * 4000),          // pufak pastdan tepaga chiqish vaqti (ms)
    burchak: 90 + Math.round(qiyin * 90),                  // teskari burchak (aylantir)
    chotka: Math.round(42 - qiyin * 14),                  // artish cho‘tkasi radiusi (px)
    osish: Math.round(1300 + qiyin * 900),                 // kattalashish vaqti (ms)
  };
}

/** Yulduzlar: xatosiz — 3, 1–2 xato — 2, ko'p — 1. */
export const jonliYulduz = (xato) => (xato <= 0 ? 3 : xato <= 2 ? 2 : 1);

const KEY = "kabutar:jonli:v1";
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
export function jonliNatija(til, st = store()) {
  try { return (JSON.parse(st?.getItem(KEY) || "{}") || {})[til] || {}; } catch { return {}; }
}
export function jonliYoz(til, n, yulduz, st = store()) {
  let all = {};
  try { all = JSON.parse(st?.getItem(KEY) || "{}") || {}; } catch { all = {}; }
  const t = (all[til] = all[til] || {});
  t[n] = Math.max(Number(t[n]) || 0, yulduz);
  try { st?.setItem(KEY, JSON.stringify(all)); } catch { /* joy yo'q */ }
  return t;
}
/** Bosqich ochiqmi: birinchisi doim; keyingisi — oldingisi o'ynalgan bo'lsa (admin — hammasi). */
export const jonliOchiq = (n, natija, cheklovsiz = false) => cheklovsiz || n === 0 || (Number(natija?.[n - 1]) || 0) > 0;
/** Navbatdagi (birinchi o'ynalmagan) bosqich. */
export const jonliNavbat = (natija) => { for (let i = 0; i < JAMI; i += 1) if (!(Number(natija?.[i]) > 0)) return i; return JAMI - 1; };
