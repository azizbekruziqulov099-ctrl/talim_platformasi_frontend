// REV323: sinfxona bayramga qarab bezaladi (Yangi yil, Navro'z, Mustaqillik…). Faqat sana bo'yicha belgilangan bayramlar
// (sanasi har yili o'zgaradigan bayramlar bu ro'yxatda yo'q). Sof funksiyalar — brauzersiz sinaladi.
export const BAYRAMLAR = [
  { kalit: "yangi_yil", dan: [12, 15], gacha: [1, 10] },
  { kalit: "mart8", dan: [3, 6], gacha: [3, 9] },
  { kalit: "navroz", dan: [3, 14], gacha: [3, 28] },
  { kalit: "bolalar", dan: [5, 30], gacha: [6, 2] },
  { kalit: "mustaqillik", dan: [8, 27], gacha: [9, 1] },
  { kalit: "bilim", dan: [9, 2], gacha: [9, 6] },
  { kalit: "ustozlar", dan: [9, 30], gacha: [10, 2] },
];

export const BAYRAM_NOMI = {
  yangi_yil: { uz: "Yangi yil", ru: "Новый год", en: "New Year", de: "Neujahr", es: "Año Nuevo" },
  mart8: { uz: "8-mart", ru: "8 Марта", en: "Women's Day", de: "Frauentag", es: "Día de la Mujer" },
  navroz: { uz: "Navro'z", ru: "Навруз", en: "Navruz", de: "Nouruz", es: "Navruz" },
  bolalar: { uz: "Bolalar kuni", ru: "День защиты детей", en: "Children's Day", de: "Kindertag", es: "Día del Niño" },
  mustaqillik: { uz: "Mustaqillik kuni", ru: "День независимости", en: "Independence Day", de: "Unabhängigkeitstag", es: "Día de la Independencia" },
  bilim: { uz: "Bilimlar kuni", ru: "День знаний", en: "Knowledge Day", de: "Tag des Wissens", es: "Día del Conocimiento" },
  ustozlar: { uz: "Ustoz va murabbiylar kuni", ru: "День учителя", en: "Teachers' Day", de: "Lehrertag", es: "Día del Maestro" },
  tugilgan: { uz: "Tug'ilgan kun", ru: "День рождения", en: "Birthday", de: "Geburtstag", es: "Cumpleaños" },
};

/** Dars boshidagi bayram gapi (izoh tilida). */
export const BAYRAM_GAPI = {
  yangi_yil: { uz: "Qara, sinfimiz bezandi! Yangi yil yaqin — bayraming muborak!", ru: "Смотри, наш класс украшен! Скоро Новый год — с праздником!", en: "Look, our classroom is decorated! New Year is coming — happy holidays!", de: "Schau, unser Klassenzimmer ist geschmückt! Bald ist Neujahr — frohes Fest!", es: "¡Mira, nuestra clase está decorada! Ya llega el Año Nuevo, ¡felices fiestas!" },
  mart8: { uz: "Bugun bayram — 8-mart! Onang va buvingni tabrikladingmi?", ru: "Сегодня праздник — 8 Марта! Ты поздравил маму и бабушку?", en: "It's a holiday — Women's Day! Did you congratulate your mum and grandma?", de: "Heute ist Frauentag! Hast du Mama und Oma gratuliert?", es: "¡Hoy es el Día de la Mujer! ¿Felicitaste a tu mamá y a tu abuela?" },
  navroz: { uz: "Navro'z keldi — bahor bayrami! Qara, sinfimizda gullar ochildi!", ru: "Пришёл Навруз — праздник весны! Смотри, в нашем классе расцвели цветы!", en: "Navruz is here — the spring festival! Look, flowers are blooming in our classroom!", de: "Nouruz ist da — das Frühlingsfest! Schau, in unserem Klassenzimmer blühen Blumen!", es: "¡Llegó Navruz, la fiesta de la primavera! ¡Mira, en nuestra clase han florecido flores!" },
  bolalar: { uz: "Bugun Bolalar kuni — bu sening bayraming! Bayraming muborak!", ru: "Сегодня День защиты детей — это твой праздник! Поздравляю!", en: "Today is Children's Day — it's your holiday! Happy Children's Day!", de: "Heute ist Kindertag — dein Fest! Alles Gute!", es: "¡Hoy es el Día del Niño, es tu fiesta! ¡Felicidades!" },
  mustaqillik: { uz: "Mustaqillik kuni yaqin! Qara, bayroqlarimiz hilpirayapti!", ru: "Скоро День независимости! Смотри, наши флаги развеваются!", en: "Independence Day is near! Look, our flags are waving!", de: "Bald ist Unabhängigkeitstag! Schau, unsere Fahnen wehen!", es: "¡Se acerca el Día de la Independencia! ¡Mira cómo ondean nuestras banderas!" },
  bilim: { uz: "Bilimlar kuni muborak! Yangi o'quv yili boshlandi!", ru: "С Днём знаний! Начался новый учебный год!", en: "Happy Knowledge Day! A new school year has begun!", de: "Alles Gute zum Tag des Wissens! Ein neues Schuljahr hat begonnen!", es: "¡Feliz Día del Conocimiento! ¡Ha empezado un nuevo curso!" },
  ustozlar: { uz: "Bugun Ustoz va murabbiylar kuni! Ustozingga rahmat aytamizmi?", ru: "Сегодня День учителя! Скажем учителю спасибо?", en: "Today is Teachers' Day! Shall we say thank you to our teacher?", de: "Heute ist Lehrertag! Sagen wir unserem Lehrer danke?", es: "¡Hoy es el Día del Maestro! ¿Le damos las gracias a nuestro maestro?" },
  tugilgan: { uz: "Bugun sening tug'ilgan kuning! Tug'ilgan kuning muborak!", ru: "Сегодня твой день рождения! С днём рождения!", en: "Today is your birthday! Happy birthday!", de: "Heute ist dein Geburtstag! Alles Gute zum Geburtstag!", es: "¡Hoy es tu cumpleaños! ¡Feliz cumpleaños!" },
};

const kod = (m, d) => m * 100 + d;
/** Sana (Date yoki "YYYY-MM-DD") bo'yicha bayram kaliti yoki null. tugilgan — bolaning tug'ilgan sanasi ("YYYY-MM-DD"). */
export function joriyBayram(sana = new Date(), { tugilgan = "" } = {}) {
  const d = sana instanceof Date ? sana : new Date(String(sana) + "T12:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const k = kod(d.getMonth() + 1, d.getDate());
  const t = /^\d{4}-(\d{2})-(\d{2})/.exec(String(tugilgan || ""));
  if (t && kod(+t[1], +t[2]) === k) return "tugilgan";
  for (const b of BAYRAMLAR) {
    const a = kod(...b.dan), z = kod(...b.gacha);
    if (a <= z ? (k >= a && k <= z) : (k >= a || k <= z)) return b.kalit;
  }
  return null;
}

export function bayramGapi(kalit, til = "uz") {
  const g = BAYRAM_GAPI[kalit];
  return g ? (g[til] || null) : null;
}

/** Hozirgi bayram. Ko'rib chiqish uchun manzilga ?bayram=navroz (yangi_yil, mustaqillik…) qo'shsa bo'ladi. */
export function bayramHozir(sana = new Date(), opts = {}) {
  try {
    const q = new URLSearchParams(window.location.search).get("bayram");
    if (q && (BAYRAM_NOMI[q])) return q;
    if (q === "yoq") return null;
  } catch { /* brauzer emas */ }
  return joriyBayram(sana, opts);
}
