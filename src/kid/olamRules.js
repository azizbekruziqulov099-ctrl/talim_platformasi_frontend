// REV112: Bog'cha olami — bola bog'cha binosi bo'ylab yuradi: hovli, bino, yo'lak, sinfxonalar, zal, sport maydoni,
// hayvonot bog'i. Sof ma'lumot va funksiyalar (brauzersiz sinaladi). Koordinatalar — rasmga nisbatan foizda.

/** Sahnalar. «tashqi» — osmon ko'rinadi (ob-havo zarrachalari butun sahnaga yog'adi). */
export const SAHNALAR = {
  bino: { nom: "Bog'cha", emoji: "🏫", tashqi: true, orqaga: null,
    nuqtalar: [
      { id: "kirish", x: 57.5, y: 38, emoji: "🚪", nom: "Ichkariga kiramiz", ga: "koridor" },
      { id: "hovli", x: 6, y: 47, emoji: "🛝", nom: "O'yin maydonchasi", ga: "hovli" },
      { id: "sport", x: 95, y: 52, emoji: "⚽", nom: "Sport maydoni", ga: "sport" },
      { id: "hayvon", x: 89, y: 31, emoji: "🦒", nom: "Hayvonot bog'i", ga: "hayvonot" },
    ] },
  koridor: { nom: "Yo'lak", emoji: "🚪", tashqi: false, orqaga: "bino",
    nuqtalar: [
      { id: "zal", x: 50, y: 44, emoji: "🎭", nom: "Tadbirlar zali", ga: "zal" },
    ],
    // fanlar eshiklari (tartib bilan to'ldiriladi)
    eshiklar: [{ x: 6, y: 52 }, { x: 94, y: 52 }, { x: 31.5, y: 49 }, { x: 68.5, y: 49 }] },
  zal: { nom: "Tadbirlar zali", emoji: "🎭", tashqi: false, orqaga: "koridor",
    nuqtalar: [{ id: "sahna", x: 50, y: 56, emoji: "🎤", nom: "Sahna", amal: "konsert" }] },
  sport: { nom: "Sport maydoni", emoji: "⚽", tashqi: true, orqaga: "bino",
    nuqtalar: [{ id: "darvoza", x: 69, y: 74, emoji: "🥅", nom: "Gol!", amal: "gol" }] },
  hayvonot: { nom: "Hayvonot bog'i", emoji: "🦒", tashqi: true, orqaga: "bino",
    nuqtalar: [
      { id: "jirafa", x: 16, y: 42, emoji: "🦒", nom: "Jirafa", amal: "hayvon" },
      { id: "fil", x: 64, y: 46, emoji: "🐘", nom: "Fil", amal: "hayvon" },
      { id: "maymun", x: 92, y: 31, emoji: "🐒", nom: "Maymun", amal: "hayvon" },
    ] },
  hovli: { nom: "O'yin maydonchasi", emoji: "🛝", tashqi: true, orqaga: "bino", vaqtinchalik: true,
    nuqtalar: [{ id: "tepalik", x: 55, y: 55, emoji: "🛝", nom: "Sirpanchiq", amal: "sakra" }] },
};

/** Fan eshiklari: birinchi 4 fan — yo'lakdagi eshiklarga, qolganlari — pastdagi eshiklar qatoriga. */
export function fanEshiklari(fanlar = []) {
  const joylar = SAHNALAR.koridor.eshiklar;
  return fanlar.map((f, i) => ({ ...f, joy: joylar[i] || null }));
}

/** Sahnadan qo'shni sahnalar (oldindan yuklash uchun). */
export function qoshnilar(id) {
  const s = SAHNALAR[id];
  if (!s) return [];
  const out = new Set(s.nuqtalar.filter((n) => n.ga).map((n) => n.ga));
  if (s.orqaga) out.add(s.orqaga);
  return [...out];
}

/** Sahna rasmi: telefonda 960, katta ekranda 1600 (bo'lsa). */
export function sahnaSrc(rasmlar, id, keng = false) {
  const r = rasmlar[id] || {};
  return (keng && r.k1600) || r.k960 || r.k1600 || "";
}
