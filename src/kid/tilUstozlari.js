// REV169: 10 ta til ustozi — har tilda o'z ismi. Salomlashish, maqtov va ob-havo gaplari Nilufar opaning gaplaridan
// olinadi, ism va jinsga oid so'zlar almashtiriladi (Yusuf aka «Men Yusuf akangman», Anna opa «Men Anna opangman»).
export const ISMLAR = {
  //         uz          lotin       rus        arab       xitoy    yapon      koreys    erkak
  emily:   ["Emili",   "Emily",   "Эмили",   "إميلي",   "艾米莉", "エミリー", "에밀리", false],
  anna:    ["Anna",    "Anna",    "Анна",    "آنا",     "安娜",   "アンナ",   "안나",   false],
  elif:    ["Elif",    "Elif",    "Элиф",    "إليف",    "艾莉芙", "エリフ",   "엘리프", false],
  yusuf:   ["Yusuf",   "Yusuf",   "Юсуф",    "يوسف",    "优素福", "ユスフ",   "유수프", true],
  lukas:   ["Lukas",   "Lukas",   "Лукас",   "لوكاس",   "卢卡斯", "ルーカス", "루카스", true],
  carlos:  ["Karlos",  "Carlos",  "Карлос",  "كارلوس",  "卡洛斯", "カルロス", "카를로스", true],
  jiwoo:   ["Jiu",     "Ji-woo",  "Джиу",    "جي وو",   "智宇",   "ジウ",     "지우",   false],
  camille: ["Kamil",   "Camille", "Камиль",  "كاميل",   "卡米耶", "カミーユ", "카미유", false],
  mei:     ["Mey",     "Mei",     "Мэй",     "مي",      "梅",     "メイ",     "메이",   false],
  kenji:   ["Kenji",   "Kenji",   "Кэндзи",  "كينجي",   "健二",   "ケンジ",   "켄지",   true],
};

/** Nilufar opa gaplarini (har qanday tildagi obyekt) yangi ustozga moslaydi. til — gaplar tili (uz, ru, en, de…). */
export function klonla(fel, ustoz, til = "uz") {
  const i = ISMLAR[ustoz];
  if (!fel || !i) return fel;
  const [uz, lat, ru, ar, zh, ja, ko, erkak] = i;
  const almash = (s) => {
    let t = String(s)
      .replace(/Nilufar/g, til === "uz" ? uz : lat).replace(/Нилуфар/g, ru).replace(/نيلوفر|نيلوفار/g, ar)
      .replace(/尼卢法尔/g, zh).replace(/ニルファル/g, ja).replace(/닐루파르/g, ko);
    if (erkak) {
      if (til === "uz") t = t.replace(/\bopangman\b/g, "akangman").replace(/\bopang\b/g, "akang").replace(/\bopa\b/g, "aka");
      if (til === "ru") t = t.replace(/-опа/g, "-ака").replace(/\bопа\b/g, "ака").replace(/пришла/g, "пришёл").replace(/увидела/g, "увидел")
        .replace(/готова/g, "готов").replace(/рада/g, "рад").replace(/соскучилась/g, "соскучился");
      if (til === "en") t = t.replace(/\bMiss\b/g, "Mr");
      if (til === "ja") t = t.replace(/わたしは (\S+?)よ/g, "ぼくは $1だよ").replace(/わたしの/g, "ぼくの").replace(/わたし/g, "ぼく");
    }
    return t;
  };
  const yur = (v) => (typeof v === "string" ? almash(v) : Array.isArray(v) ? v.map(yur) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, yur(x)])) : v);
  return yur(fel);
}
