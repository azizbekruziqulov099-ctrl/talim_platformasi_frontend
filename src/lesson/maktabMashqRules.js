// REV175: maktab darsi — ochilishda sana (kun, oy, yil, hafta kuni) va darsdan keyingi mashqlar materiali
// (o'qish, gapirish, diktant, yozganini o'qib berish). Sof funksiyalar (brauzersiz sinaladi).

const OYLAR_UZ = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const KUNLAR_UZ = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
const LOKAL = { en: "en-GB", de: "de-DE", ru: "ru-RU", fr: "fr-FR", es: "es-ES", tr: "tr-TR", ar: "ar", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR" };
const BUGUN = {
  en: "Today is {d}.", de: "Heute ist {d}.", ru: "Сегодня {d}.", fr: "Aujourd'hui, c'est {d}.", es: "Hoy es {d}.", tr: "Bugün {d}.",
  ar: "اليوم هو {d}.", zh: "今天是{d}。", ja: "今日は{d}です。", ko: "오늘은 {d}입니다.",
};
const BOSHLAYMIZ = { uz: "Darsni boshlaymiz!", ru: "Начинаем урок!", en: "Let's start the lesson!" };

/** O'zbekcha sana: «2026-yil 26-oktabr, dushanba». */
export function sanaUz(d = new Date()) {
  return `${d.getFullYear()}-yil ${d.getDate()}-${OYLAR_UZ[d.getMonth()]}, ${KUNLAR_UZ[d.getDay()]}`;
}
/** O'rganilayotgan tilda sana: «Montag, 26. Oktober 2026». Intl bo'lmasa — null. */
export function sanaTilda(til, d = new Date()) {
  try { return new Intl.DateTimeFormat(LOKAL[til] || til, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d).replace(/[.。]$/, ""); } catch { return null; }
}
/** Interfeys tilida sana (izoh uchun). */
function sanaIzoh(iz, d) {
  if (iz === "uz") return `Bugun ${sanaUz(d)}.`;
  const s = sanaTilda(iz, d);
  return s ? BUGUN[iz].replace("{d}", s) : `Bugun ${sanaUz(d)}.`;
}

/**
 * Dars ochilishidagi sana qadami. Til darsida — o'sha tilda («Heute ist Montag, der 26. Oktober 2026») va izoh tilida;
 * boshqa fanlarda — izoh tilida. Ustoz aytadi, doskada yoziladi.
 */
export function sanaQadami({ til = "", iz = "uz", sana = new Date() } = {}) {
  const izohMatn = sanaIzoh(iz, sana);
  const tilda = til && BUGUN[til] ? sanaTilda(til, sana) : null;
  const tilGap = tilda ? BUGUN[til].replace("{d}", tilda) : "";
  const teg = (t, l) => (l === "uz" ? t : `[${l}]${t}[/${l}]`);
  return {
    id: "maktab-sana", turi: "kirish", sahna: "maktab-sana", sarlavha: `📅 ${tilGap || izohMatn}`,
    doska: tilGap ? `${tilGap}\n${izohMatn}` : izohMatn,
    ovoz: `${tilGap ? `${teg(tilGap, til)} ` : ""}${teg(izohMatn, iz)} ${teg(BOSHLAYMIZ[iz] || BOSHLAYMIZ.uz, iz)}`,
    rasm: null, _maktabSana: true,
  };
}

const TEG = /\[\/?[a-z]{2}\]/g;
const toza = (s) => String(s || "").replace(TEG, "").replace(/\s+/g, " ").trim();
const harfBor = (s) => /\p{L}/u.test(s);
const EMOJI = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[⃣️‍])+/gu;

/**
 * Darsdan keyingi mashqlar materiali. sozlar — maktabDarsSozlari() natijasi (so'zlar va misollar).
 * → { oqish: [gap], gapirish: [savol], diktant: [{matn, tarjima}] }
 */
export function mashqMateriali(steps = [], sozlar = []) {
  const sozMatnlari = new Set(sozlar.map((w) => Object.values(w.w)).flat().map((x) => toza(x).toLowerCase()));
  const qatorlar = [];
  for (const s of steps) {
    if (s?._maktabSana || s?.turi === "test") continue;
    for (const q of String(s?.doska || "").split("\n")) {
      const t = toza(q.replace(EMOJI, "")).replace(/^[-•*]\s*/, "");
      if (t.length < 8 || t.length > 160 || !harfBor(t) || sozMatnlari.has(t.toLowerCase())) continue;
      if (/\s[—–]\s/.test(t) && t.split(/\s[—–]\s/).every((p) => p.length < 30)) continue;   // «so'z — tarjima» qatorlari
      if (!qatorlar.includes(t)) qatorlar.push(t);
    }
  }
  const misollar = sozlar.map((w) => toza(w.misol)).filter((t) => t.length >= 8);
  const gaplar = [...new Set([...misollar, ...qatorlar])];
  const savol = (t) => /[?？؟]$/.test(t);
  // dialog qatori «Aziz: …» — o'qish uchun ism olib tashlanadi
  const ismsiz = (t) => t.replace(/^[\p{Lu}][\p{L}]{1,14}:\s+/u, "");
  const oqish = gaplar.filter((t) => !savol(t) && t.split(/\s+/).length >= 3).map(ismsiz).filter((t) => t.length <= 140).slice(0, 5);
  const gapirish = [...new Set(gaplar.map(ismsiz).flatMap((t) => t.split(/(?<=[.!?？؟。])\s+/)).map((t) => t.replace(/^[^:?]{3,40}:\s+(?=\S.*[?？؟]$)/u, "")).filter((t) => savol(t) && t.split(/\s+/).length >= 2 && t.length <= 120))].slice(0, 3);
  const diktant = [
    ...sozlar.slice(0, 5).map((w) => ({ matn: Object.values(w.w)[0], tarjima: w.w.uz || "" })),
    ...oqish.filter((t) => t.length <= 70).slice(0, 2).map((t) => ({ matn: t, tarjima: "" })),
  ];
  return { oqish, gapirish, diktant };
}

/** Mashq natijasidan yulduz (0–3) — umumiy ulush bo'yicha. */
export const mashqYulduz = (togri, jami) => { const p = jami ? togri / jami : 0; return p >= 0.9 ? 3 : p >= 0.7 ? 2 : p >= 0.4 ? 1 : 0; };
