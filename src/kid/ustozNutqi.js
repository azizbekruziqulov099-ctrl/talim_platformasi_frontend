// REV122: sinfxonada gapiruvchi — jonli ustoz (Nilufar opa, Malika opa, Sardor aka). U robotdek emas, odamdek gapiradi:
// «Bip-bip!», «Men — robot Kabu», «temir qo'llarim» kabi robot iboralari ustoz og'zidan chiqmaydi, o'rniga o'z ismi.
// Robot Kabu haqida uchinchi shaxsda gap («Kabu «bip-bip» deydi», «robot Kabu: …» dialogi) o'zgarmaydi.
// Test/o'yin ekranidagi robot Kabu esa o'z uslubida qoladi (bu funksiya faqat ustoz gapirganda ishlatiladi).

export const USTOZ_ISMI = {
  nilufar: { uz: "Nilufar opa", ru: "Нилуфар опа", en: "Miss Nilufar" },
  malika: { uz: "Malika opa", ru: "Малика опа", en: "Miss Malika" },
  sardor: { uz: "Sardor aka", ru: "Сардор ака", en: "Mr Sardor" },
  // REV169: til ustozlari
  emily: { uz: "Emili opa", ru: "Эмили опа", en: "Miss Emily" },
  anna: { uz: "Anna opa", ru: "Анна опа", en: "Miss Anna" },
  elif: { uz: "Elif opa", ru: "Элиф опа", en: "Miss Elif" },
  yusuf: { uz: "Yusuf aka", ru: "Юсуф ака", en: "Mr Yusuf" },
  lukas: { uz: "Lukas aka", ru: "Лукас ака", en: "Mr Lukas" },
  carlos: { uz: "Karlos aka", ru: "Карлос ака", en: "Mr Carlos" },
  jiwoo: { uz: "Jiu opa", ru: "Джиу опа", en: "Miss Ji-woo" },
  camille: { uz: "Kamil opa", ru: "Камиль опа", en: "Miss Camille" },
  mei: { uz: "Mey opa", ru: "Мэй опа", en: "Miss Mei" },
  kenji: { uz: "Kenji aka", ru: "Кэндзи ака", en: "Mr Kenji" },
};

// REV140: ortiqcha tinish belgisi faqat gap boshida yoki OCHILUVCHI teg ([en]) dan keyin olinadi. Oldin yopiluvchi teg
// ([/en]) dan keyingi nuqta ham o'chirilardi — «[en]apple[/en]. Endi sen ayt» → «…[/en]Endi», gaplar orasida pauza
// yo'qolib, ustoz nutqi shoshqaloq va g'ayritabiiy chiqardi.
const tozala = (s) => s.replace(/[ \t]{2,}/g, " ").replace(/\s+([,.!?])/g, "$1").replace(/^\s+/, "").replace(/(^|[.!?]\s+|\[[a-z]{2}\]\s*)([,.!])\s*/g, "$1");

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
