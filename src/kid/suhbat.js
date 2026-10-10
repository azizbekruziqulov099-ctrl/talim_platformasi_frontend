// REV110: ustoz bilan suhbat — ustoz savol beradi, bola o'zi javob beradi, ustoz javobni tahlil qiladi.
// Savollar faqat bola BILGAN so'zlardan (so'z boyligi + shu dars) va yoshga qarab murakkablashadi:
//   2–3 yosh: rasmga qarab bitta so'z;  4–5: so'z + «Qalaysan?»;  6–7: o'zi haqida to'liq gap (ism, yosh, yoqtirgani, qila oladigani).
// Sof funksiyalar (brauzersiz sinaladi).
import { OCHILISH_LUGAT } from "./ochilishLugat.js";
import { similarity } from "../speech/speakRules.js";
import { gap } from "./izohTil.js";

const clean = (x) => String(x || "").replace(/[…⋯]+/g, "").replace(/\.{3}/g, "").trim();

function yoshi(grade) {
  const m = /(\d)\s*[-–]\s*(\d)/.exec(String(grade || ""));
  return m ? Number(m[1]) : 4;
}

/** Savol: { lang, ask, qabul:[...], namuna, emoji?, turi:"suhbat" } */
export function suhbatSavollari({ til, grade = "", bilgan = [], dars = [], kun = 0 } = {}) {
  const L = OCHILISH_LUGAT[til];
  if (!L) return [];
  const yosh = yoshi(grade);
  const tag = (x) => `[${til}]${x}[/${til}]`;
  const out = [];
  // Rasmli savol: shu darsdan bitta, oldingi darslardan bitta (bola bilgan so'z) — emojisi bor so'zlar
  const pool = [...dars, ...bilgan].filter((w) => w?.say && w?.emoji && w.say.split(/\s+/).length <= 3);
  const seen = new Set();
  const pics = pool.filter((w) => { const k = w.say.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  const fromDars = pics.find((w) => dars.some((d) => d.say === w.say));
  const fromOld = pics.find((w) => w !== fromDars && !dars.some((d) => d.say === w.say));
  for (const w of [fromDars, fromOld].filter(Boolean).slice(0, yosh <= 2 ? 1 : 2)) {
    out.push({ turi: "suhbat", lang: til, emoji: w.emoji, phrase: w.say,
      ask: `${w.emoji} ${tag(L.what)} ⏸`, qabul: [w.say], namuna: w.say });
  }
  if (yosh >= 4) {
    out.push({ turi: "suhbat", lang: til, phrase: L.fine2, ask: tag(L.how), qabul: [L.fine2, L.fine, L.happy], namuna: L.fine });
  }
  if (yosh >= 5) {
    const pool6 = [
      { phrase: clean(L.myname), ask: tag(L.name), qabul: [clean(L.myname)], namuna: L.myname },
      { phrase: L.six, ask: tag(L.old), qabul: [L.five, L.six, L.seven], namuna: L.six },
      { phrase: L.yesdo, ask: tag(L.likeapples), qabul: [L.yesdo, L.nodont, L.yes], namuna: L.yesdo },
      { phrase: L.yescan, ask: tag(L.canswim), qabul: [L.yescan, L.nocan, L.yes], namuna: L.yescan },
    ];
    const n = yosh >= 6 ? 2 : 1;
    for (let i = 0; i < n; i += 1) out.push({ turi: "suhbat", lang: til, ...pool6[(Math.abs(kun) + i) % pool6.length] });
  }
  return out;
}

/**
 * Javob tahlili: eng yaqin qabul qilinadigan javob → yulduzlar; bunga qo'shimcha — bola savolga emas,
 * lekin o'zi bilgan boshqa so'zni aytgan bo'lsa (masalan rasmda mushuk, u «dog» dedi), uni ham aniqlaymiz.
 */
export function tahlil(alternatives = [], item, bilgan = []) {
  const alts = (alternatives || []).filter(Boolean);
  let best = 0;
  for (const a of alts) for (const q of item.qabul || [item.phrase]) best = Math.max(best, similarity(a, q, item.lang));
  const stars = best >= 0.8 ? 3 : best >= 0.55 ? 2 : best >= 0.3 ? 1 : 0;
  let boshqa = null;
  if (stars < 2) {
    for (const w of bilgan) {
      if (w.say.toLowerCase() === String(item.phrase).toLowerCase()) continue;
      if (alts.some((a) => similarity(a, w.say, item.lang) >= 0.9)) { boshqa = w.say; break; }
    }
  }
  return { stars, score: Math.round(best * 100) / 100, boshqa };
}

/** Ustozning javobi: to'g'ri bo'lsa — maqtab, javobni to'liqroq qilib qaytaradi; boshqa so'z aytsa — farqini tushuntiradi. */
export function suhbatJavob(item, natija, kid = true, izoh = "uz") {
  const tag = (x) => `[${item.lang}]${x}[/${item.lang}]`;
  if (natija.stars >= 2) return gap(izoh, "Barakalla! {p}", { p: tag(item.namuna) });
  if (natija.boshqa) return gap(izoh, "Sen {w} deding — bu ham sen bilgan so'z, zo'r! Lekin bu yerda: {p} Qani, ayt!", { w: tag(natija.boshqa), p: tag(item.namuna) });
  return "";
}
