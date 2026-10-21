// REV158: dars boshida ustoz vaqtni tushuntiradi — hafta kuni, oy, fasl, soat, yil (bolaning qurilmasidagi haqiqiy sana).
// 2–3 yosh: kun va fasl; 3–4: + oy; 4–5: + soat; 6–7: + yil.
// Til darsida: 2–4 yosh — avval izoh tilida (o'zbek/rus/ingliz), keyin o'rganilayotgan tilda va bola takrorlaydi;
// 4–5 yosh — to'liq shu tilda, kun va fasl so'zining tarjimasi bir marta; 6–7 yosh — faqat shu tilda.
// Boshqa fanlarda (matematika, mantiq, atrof-muhit) — izoh tilida.

// Hafta kunlari dushanbadan boshlab (Date.getDay() — yakshanba 0).
const KUN = {
  uz: ["dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba", "yakshanba"],
  ru: ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  de: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
  fr: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
  es: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
  tr: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
  ar: ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
  zh: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
  ja: ["げつようび", "かようび", "すいようび", "もくようび", "きんようび", "どようび", "にちようび"],
  ko: ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"],
};
const OY = {
  uz: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"],
  ru: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  tr: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  zh: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
  ja: ["いちがつ", "にがつ", "さんがつ", "しがつ", "ごがつ", "ろくがつ", "しちがつ", "はちがつ", "くがつ", "じゅうがつ", "じゅういちがつ", "じゅうにがつ"],
  ko: ["일월", "이월", "삼월", "사월", "오월", "유월", "칠월", "팔월", "구월", "시월", "십일월", "십이월"],
};
// qish, bahor, yoz, kuz
const FASL = {
  uz: ["qish", "bahor", "yoz", "kuz"],
  ru: ["зима", "весна", "лето", "осень"],
  en: ["winter", "spring", "summer", "autumn"],
  de: ["Winter", "Frühling", "Sommer", "Herbst"],
  fr: ["l'hiver", "le printemps", "l'été", "l'automne"],
  es: ["invierno", "primavera", "verano", "otoño"],
  tr: ["kış", "ilkbahar", "yaz", "sonbahar"],
  ar: ["الشتاء", "الربيع", "الصيف", "الخريف"],
  zh: ["冬天", "春天", "夏天", "秋天"],
  ja: ["ふゆ", "はる", "なつ", "あき"],
  ko: ["겨울", "봄", "여름", "가을"],
};
const FASL_BELGI = ["❄️", "🌸", "☀️", "🍂"];

const ru_soat = (h) => (h === 1 ? "час" : h >= 2 && h <= 4 ? "часа" : "часов");
// Gaplar: kun (d), oy (m), fasl (s), soat (h), yil (y). intro — «Keling, bugungi kunni bilib olamiz!»
const GAP = {
  uz: { intro: "Keling, bugun qanday kun ekanini bilib olamiz!", kun: "Bugun — {d}.", oy: "Hozir — {m} oyi.", fasl: "Hozir — {s}.", soat: (h) => `Hozir soat ${h}.`, yil: "Hozir {y}-yil." },
  ru: { intro: "Давай узнаем, какой сегодня день!", kun: "Сегодня {d}.", oy: "Сейчас {m}.", fasl: "Сейчас {s}.", soat: (h) => `Сейчас ${h} ${ru_soat(h)}.`, yil: "Сейчас {y} год." },
  en: { intro: "Let's find out what day it is today!", kun: "Today is {d}.", oy: "It's {m}.", fasl: "It's {s}.", soat: (h) => `It's ${h} o'clock.`, yil: "It's {y}." },
  de: { intro: "Schauen wir, welcher Tag heute ist!", kun: "Heute ist {d}.", oy: "Wir haben {m}.", fasl: "Es ist {s}.", soat: (h) => `Es ist ${h} Uhr.`, yil: "Wir haben das Jahr {y}." },
  fr: { intro: "Voyons quel jour nous sommes !", kun: "Aujourd'hui, c'est {d}.", oy: "Nous sommes en {m}.", fasl: "C'est {s}.", soat: (h) => (h === 1 ? "Il est une heure." : `Il est ${h} heures.`), yil: "Nous sommes en {y}." },
  es: { intro: "¡Veamos qué día es hoy!", kun: "Hoy es {d}.", oy: "Estamos en {m}.", fasl: "Es {s}.", soat: (h) => (h === 1 ? "Es la una." : `Son las ${h}.`), yil: "Estamos en {y}." },
  tr: { intro: "Bakalım bugün hangi gün!", kun: "Bugün {d}.", oy: "{m} ayındayız.", fasl: "Mevsim {s}.", soat: (h) => `Saat ${h}.`, yil: "Yıl {y}." },
  ar: { intro: "لِنَعْرِفْ أَيُّ يَوْمٍ هُوَ الْيَوْم!", kun: "الْيَوْمُ {d}.", oy: "نَحْنُ فِي شَهْرِ {m}.", fasl: "نَحْنُ فِي فَصْلِ {s}.", soat: (h) => `السَّاعَةُ الْآنَ ${h}.`, yil: "نَحْنُ فِي عَامِ {y}." },
  zh: { intro: "我们来看看今天是星期几！", kun: "今天是{d}。", oy: "现在是{m}。", fasl: "现在是{s}。", soat: (h) => `现在是${h}点。`, yil: "今年是{y}年。" },
  ja: { intro: "きょうは なんようび かな？", kun: "きょうは {d} です。", oy: "いまは {m} です。", fasl: "いまは {s} です。", soat: (h) => `いまは ${h}じ です。`, yil: "ことしは {y}ねん です。" },
  ko: { intro: "오늘은 무슨 요일일까요?", kun: "오늘은 {d}이에요.", oy: "지금은 {m}이에요.", fasl: "지금은 {s}이에요.", soat: (h) => `지금은 ${h}시예요.`, yil: "올해는 {y}년이에요." },
};
// «Endi sen ayt: …» — izoh tilida (o'zbek/rus/ingliz) va o'rganilayotgan tilda
const AYT = { uz: "Endi sen ayt:", ru: "Теперь ты скажи:", en: "Now you say it:", de: "Jetzt sagst du es:", fr: "Maintenant, à toi de le dire :",
  es: "Ahora dilo tú:", tr: "Şimdi sen söyle:", ar: "الآنَ قُلْهَا أَنْتَ:", zh: "现在你来说：", ja: "こんどは きみが いってね：", ko: "이제 네가 말해 봐:" };

export function sanaQismlari(sana = new Date()) {
  const kun = (sana.getDay() + 6) % 7;
  const oy = sana.getMonth();
  const fasl = oy === 11 || oy <= 1 ? 0 : oy <= 4 ? 1 : oy <= 7 ? 2 : 3;
  const soat = sana.getHours() % 12 || 12;
  return { kun, oy, fasl, soat, yil: sana.getFullYear() };
}

const bosh = (t) => String(t).charAt(0).toLocaleUpperCase() + String(t).slice(1);

/**
 * Bitta «vaqt» qadami (dars qadamlari formatida) yoki null.
 * til — o'rganilayotgan til (til darsi bo'lmasa null); izoh — tushuntirish tili (uz/ru/en); yosh — 2…7.
 */
export function kalendarQadami({ til = null, izoh = "uz", yosh = 4, sana = new Date() } = {}) {
  const q = sanaQismlari(sana);
  const T = til && GAP[til] ? til : null;
  const I = GAP[izoh] ? izoh : "uz";
  const tg = (L, t) => (L === "uz" ? t : `[${L}]${t}[/${L}]`);
  const narsalar = [["kun", KUN, q.kun, "🗓️"]];
  if (yosh >= 3) narsalar.push(["oy", OY, q.oy, "📅"]);
  narsalar.push(["fasl", FASL, q.fasl, FASL_BELGI[q.fasl]]);
  if (yosh >= 4) narsalar.push(["soat", null, q.soat, "⏰"]);
  if (yosh >= 6) narsalar.push(["yil", null, q.yil, "🎆"]);
  const gapi = (L, k, lug, i) => {
    const g = GAP[L][k];
    if (typeof g === "function") return g(i);
    return g.replace("{d}", lug ? lug[L][i] : "").replace("{m}", lug ? lug[L][i] : "").replace("{s}", lug ? lug[L][i] : "").replace("{y}", String(i));
  };
  const qismlar = [];
  const doska = [];
  if (!T) {
    // boshqa fan — izoh tilida
    qismlar.push(tg(I, GAP[I].intro));
    for (const [k, lug, i, belgi] of narsalar) { qismlar.push(tg(I, bosh(gapi(I, k, lug, i)))); doska.push(`${belgi} ${lug ? lug[I][i] : k === "soat" ? `${i}:00` : i}`); }
  } else if (yosh < 4) {
    // 2–4 yosh til darsi: izoh tilida, keyin o'rganilayotgan tilda, bola so'zni takrorlaydi
    qismlar.push(tg(I, GAP[I].intro));
    for (const [k, lug, i, belgi] of narsalar) {
      qismlar.push(tg(I, bosh(gapi(I, k, lug, i))), tg(T, bosh(gapi(T, k, lug, i))));
      if (lug) qismlar.push(`${tg(I, AYT[I])} ${tg(T, bosh(lug[T][i]))} ⏸`);
      doska.push(`${belgi} ${lug ? lug[T][i] : k === "soat" ? `${i}:00` : i}`);
    }
  } else {
    // 4–7 yosh: to'liq o'rganilayotgan tilda; 4–5 yoshda kun va fasl so'zining tarjimasi bir marta
    qismlar.push(tg(T, GAP[T].intro));
    for (const [k, lug, i, belgi] of narsalar) {
      qismlar.push(tg(T, bosh(gapi(T, k, lug, i))));
      if (lug && yosh < 6 && (k === "kun" || k === "fasl")) qismlar.push(`— ${tg(I, lug[I][i])}.`);
      if (lug && k !== "oy") qismlar.push(`${tg(T, AYT[T])} ${tg(T, bosh(lug[T][i]))} ⏸`);
      doska.push(`${belgi} ${lug ? lug[T][i] : k === "soat" ? `${i}:00` : i}`);
    }
  }
  const sarlavha = `🗓️ ${bosh(lug1(T || I, q.kun))}`;
  return { turi: "kirish", _ochilish: "vaqt", sarlavha, ovoz: qismlar.join(" "), doska: doska.join("\n") };
}
const lug1 = (L, i) => KUN[L]?.[i] || KUN.uz[i];

export const KALENDAR_LUGAT = { KUN, OY, FASL, GAP };
