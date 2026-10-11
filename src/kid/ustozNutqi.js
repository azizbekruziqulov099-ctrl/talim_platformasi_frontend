// REV122: sinfxonada gapiruvchi — jonli ustoz (Nilufar opa, Malika opa, Sardor aka). U robotdek emas, odamdek gapiradi:
// «Bip-bip!», «Men — robot Kabu», «temir qo'llarim» kabi robot iboralari ustoz og'zidan chiqmaydi, o'rniga o'z ismi.
// Robot Kabu haqida uchinchi shaxsda gap («Kabu «bip-bip» deydi», «robot Kabu: …» dialogi) o'zgarmaydi.
// Test/o'yin ekranidagi robot Kabu esa o'z uslubida qoladi (bu funksiya faqat ustoz gapirganda ishlatiladi).

export const USTOZ_ISMI = {
  nilufar: { uz: "Nilufar opa", ru: "Нилуфар опа", en: "Miss Nilufar" },
  malika: { uz: "Malika opa", ru: "Малика опа", en: "Miss Malika" },
  sardor: { uz: "Sardor aka", ru: "Сардор ака", en: "Mr Sardor" },
};

const tozala = (s) => s.replace(/[ \t]{2,}/g, " ").replace(/\s+([,.!?])/g, "$1").replace(/^\s+/, "").replace(/(^|[.!?]\s+|\]\s*)([,.!])\s*/g, "$1");

export function ustozNutqi(text, ustoz = "nilufar") {
  const ism = USTOZ_ISMI[ustoz] || USTOZ_ISMI.nilufar;
  let s = String(text || "");
  if (!s) return s;
  s = s
    // robot tovushlari (qo'shtirnoq ichidagisi — «Kabu «bip-bip» deydi» — qoladi)
    .replace(/(?<![«"„])\b(?:bip-bip|beep-beep)(?:-(?:bip|beep))*\b(?![»"“])[!.,]?\s*/gi, "")
    .replace(/(?<![«"„\p{L}])(?:Бип-бип|бип-бип)(?:-бип)*(?![»"“\p{L}])[!.,]?\s*/gu, "")
    .replace(/\bTick-tock, tick-tock!\s*/g, "")
    // o'zini tanishtirish: robot → ustoz
    .replace(/\bMening ismim\s*(—\s*)?(?:robot\s+)?Kabu\b/g, (_, d) => `Mening ismim ${d || ""}${ism.uz}`)
    .replace(/\bMen\s*(—\s*)?(?:robot\s+)?Kabu(man|dirman)?\b/g, (_, d, man) => `Men ${d || ""}${ism.uz}${man ? "man" : ""}`)
    .replace(/(?<!\p{L})Я\s*(—\s*)?(?:робот\s+)?Кабу(?!\p{L})/gu, (_, d) => `Я ${d || "— "}${ism.ru}`)
    .replace(/Меня зовут\s+(?:робот\s+)?Кабу(?!\p{L})/gu, `Меня зовут ${ism.ru}`)
    .replace(/\bI(?:'|’)?m\s+(?:robot\s+Kabu|Kabu\s+the\s+robot|Kabu)\b/g, `I'm ${ism.en}`)
    .replace(/\bI am\s+(?:robot\s+Kabu|Kabu\s+the\s+robot|Kabu)\b/g, `I am ${ism.en}`)
    .replace(/\bMy name is\s+(?:robot\s+Kabu|Kabu\s+the\s+robot|Kabu)\b/g, `My name is ${ism.en}`)
    // robot tanasi
    .replace(/\b(Mening|mening)\s+temir\s+/g, "$1 ")
    .replace(/\b(my)\s+metal\s+/gi, "$1 ")
    .replace(/у меня внутри часы/g, "у меня есть часы")
    .replace(/I have a clock inside me/g, "I have a clock");
  return tozala(s);
}
