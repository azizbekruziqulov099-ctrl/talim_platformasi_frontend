// REV180: o'z ekran klaviaturamiz — tillar harflari va plitkalar (sof funksiyalar).
export const QATORLAR = {
  en: ["qwertyuiop", "asdfghjkl", "zxcvbnm"],
  de: ["qwertzuiopü", "asdfghjklöä", "yxcvbnmß"],
  fr: ["azertyuiop", "qsdfghjklm", "wxcvbn", "éèêàçùâîôë"],
  es: ["qwertyuiop", "asdfghjklñ", "zxcvbnm", "áéíóúü¿¡"],
  tr: ["qwertyuıopğü", "asdfghjklşi", "zxcvbnmöç"],
  ru: ["йцукенгшщзхъ", "фывапролджэ", "ячсмитьбюё"],
  uz: ["qwertyuiop", "asdfghjkl", "zxcvbnm", ["oʻ", "gʻ", "ʼ", "sh", "ch", "ng"]],
  ar: ["ضصثقفغعهخحجد", "شسيبلاتنمكط", "ئءؤرىةوزظذ"],
};
export const PLITKALI = new Set(["zh", "ja", "ko"]);
export const klaviaturaBor = (til) => Boolean(QATORLAR[til]) || PLITKALI.has(til);
/** Telefonmi (sensorli ekran) — o'z klaviaturamiz shunda avtomatik ochiladi. */
export const sensorli = () => { try { return Boolean(globalThis.matchMedia?.("(pointer: coarse)").matches); } catch { return false; } };

/** Plitkalar: javob belgilari + bir nechta chalg'ituvchi, aralash (har belgi bir marta). */
export function plitkalar(javob = "", boshqa = "", rng = Math.random) {
  const harf = [...String(javob)].filter((c) => !/\s/.test(c));
  const qosh = [...String(boshqa)].filter((c) => !/\s/.test(c) && !harf.includes(c)).slice(0, 4);
  const hammasi = [...harf, ...qosh].map((c, k) => ({ c, k }));
  for (let i = hammasi.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [hammasi[i], hammasi[j]] = [hammasi[j], hammasi[i]]; }
  return hammasi;
}

