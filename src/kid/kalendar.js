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
  return { kun, oy, fasl, soat, daqiqa: sana.getMinutes(), yil: sana.getFullYear() };
}

// REV167: soat aniq aytiladi — «10 dan 5 daqiqa o'tdi», «10 yarim», «11 ga 3 daqiqa qoldi» (10:57 da «soat 10» demaydi).
// Kichiklar (6 yoshgacha) — taxminiy, daqiqasiz: «10 dan o'tdi», «10 yarim», «11 ga yaqin».
const ru_min = (m) => (m % 10 === 1 && m % 100 !== 11 ? "минута" : [2, 3, 4].includes(m % 10) && ![12, 13, 14].includes(m % 100) ? "минуты" : "минут");
const RU_ORD = ["", "первого", "второго", "третьего", "четвёртого", "пятого", "шестого", "седьмого", "восьмого", "девятого", "десятого", "одиннадцатого", "двенадцатого"];
const fr_h = (h) => (h === 1 ? "une heure" : `${h} heures`);
const es_h = (h, t) => (h === 1 ? `Es la una${t}.` : `Son las ${h}${t}.`);
const SOAT = {
  uz: { aniq: (h) => `Hozir soat ${h}.`, otdi: (h, m) => `Hozir soat ${h} dan ${m} daqiqa o‘tdi.`, otdiT: (h) => `Hozir soat ${h} dan o‘tdi.`,
    yarim: (h) => `Hozir soat ${h} yarim.`, qoldi: (h, m) => `Soat ${h} ga ${m} daqiqa qoldi.`, yaqin: (h) => `Hozir soat ${h} ga yaqin.` },
  ru: { aniq: (h) => `Сейчас ровно ${h} ${ru_soat(h)}.`, otdi: (h, m) => `Сейчас ${h} ${ru_soat(h)} ${m} ${ru_min(m)}.`, otdiT: (h) => `Сейчас ${h} ${ru_soat(h)} с небольшим.`,
    yarim: (h, h2) => `Сейчас половина ${RU_ORD[h2]}.`, qoldi: (h, m) => `Скоро ${h} ${ru_soat(h)}: осталось ${m} ${ru_min(m)}.`, yaqin: (h) => `Скоро ${h} ${ru_soat(h)}.` },
  en: { aniq: (h) => `It's ${h} o'clock.`, otdi: (h, m) => `It's ${m} ${m === 1 ? "minute" : "minutes"} past ${h}.`, otdiT: (h) => `It's just after ${h} o'clock.`,
    yarim: (h) => `It's half past ${h}.`, qoldi: (h, m) => `It's ${m} ${m === 1 ? "minute" : "minutes"} to ${h}.`, yaqin: (h) => `It's almost ${h} o'clock.` },
  de: { aniq: (h) => `Es ist ${h} Uhr.`, otdi: (h, m) => `Es ist ${m} nach ${h}.`, otdiT: (h) => `Es ist kurz nach ${h}.`,
    yarim: (h, h2) => `Es ist halb ${h2}.`, qoldi: (h, m) => `Es ist ${m} vor ${h}.`, yaqin: (h) => `Es ist gleich ${h} Uhr.` },
  fr: { aniq: (h) => `Il est ${fr_h(h)}.`, otdi: (h, m) => `Il est ${fr_h(h)} ${m}.`, otdiT: (h) => `Il est un peu plus de ${fr_h(h)}.`,
    yarim: (h) => `Il est ${fr_h(h)} et demie.`, qoldi: (h, m) => `Il est ${fr_h(h)} moins ${m}.`, yaqin: (h) => `Il est presque ${fr_h(h)}.` },
  es: { aniq: (h) => es_h(h, ""), otdi: (h, m) => es_h(h, ` y ${m}`), otdiT: (h) => es_h(h, " y pico"),
    yarim: (h) => es_h(h, " y media"), qoldi: (h, m) => es_h(h, ` menos ${m}`), yaqin: (h) => (h === 1 ? "Es casi la una." : `Son casi las ${h}.`) },
  tr: { aniq: (h) => `Saat ${h}.`, otdi: (h, m) => `Saat ${h}.${String(m).padStart(2, "0")}.`, otdiT: (h, m) => `Saat ${h}.${String(m).padStart(2, "0")}.`,
    yarim: (h) => `Saat ${h} buçuk.`, qoldi: (h, m, h0, m0) => `Saat ${h0}.${String(m0).padStart(2, "0")}. Az sonra saat ${h}.`, yaqin: (h) => `Az sonra saat ${h}.` },
  ar: { aniq: (h) => `السَّاعَةُ الْآنَ ${h}.`, otdi: (h, m) => `السَّاعَةُ ${h} وَ ${m} دَقِيقَة.`, otdiT: (h) => `السَّاعَةُ ${h} وَقَلِيل.`,
    yarim: (h) => `السَّاعَةُ ${h} وَالنِّصْف.`, qoldi: (h, m) => `السَّاعَةُ ${h} إِلَّا ${m} دَقِيقَة.`, yaqin: (h) => `قَرِيبًا السَّاعَةُ ${h}.` },
  zh: { aniq: (h) => `现在是${h}点。`, otdi: (h, m) => `现在是${h}点${m}分。`, otdiT: (h) => `现在${h}点多。`,
    yarim: (h) => `现在是${h}点半。`, qoldi: (h, m) => `现在差${m}分${h}点。`, yaqin: (h) => `快${h}点了。` },
  ja: { aniq: (h) => `いまは ${h}じ です。`, otdi: (h, m) => `いまは ${h}じ ${m}ふん です。`, otdiT: (h) => `いまは ${h}じ すぎ です。`,
    yarim: (h) => `いまは ${h}じはん です。`, qoldi: (h, m) => `${h}じ まで あと ${m}ふん です。`, yaqin: (h) => `もうすぐ ${h}じ です。` },
  ko: { aniq: (h) => `지금은 ${h}시예요.`, otdi: (h, m) => `지금은 ${h}시 ${m}분이에요.`, otdiT: (h) => `지금은 ${h}시가 조금 넘었어요.`,
    yarim: (h) => `지금은 ${h}시 반이에요.`, qoldi: (h, m) => `${h}시까지 ${m}분 남았어요.`, yaqin: (h) => `곧 ${h}시예요.` },
};

/** Soat va daqiqa → qaysi shakl: aniq | otdi | yarim | qoldi (6–7 yosh, daqiqa bilan) yoki taxminiy (kichiklar). */
export function soatShakli(soat, daqiqa, yosh = 6) {
  const h = soat % 12 || 12, m = Math.max(0, Math.min(59, Number(daqiqa) || 0));
  const keyin = (h % 12) + 1;
  if (yosh >= 6) {
    if (m === 0) return { turi: "aniq", h };
    if (m === 30) return { turi: "yarim", h, h2: keyin };
    if (m < 30) return { turi: "otdi", h, m };
    return { turi: "qoldi", h: keyin, m: 60 - m, h0: h, m0: m };
  }
  if (m <= 4) return { turi: "aniq", h };
  if (m <= 24) return { turi: "otdiT", h, m };
  if (m <= 35) return { turi: "yarim", h, h2: keyin };
  return { turi: "yaqin", h: keyin, h0: h, m0: m };
}

/** Soatni aytish (til bo'yicha). */
export function soatGapi(til, soat, daqiqa, yosh = 6) {
  const L = SOAT[til] ? til : "uz";
  const s = soatShakli(soat, daqiqa, yosh);
  const f = SOAT[L][s.turi];
  if (s.turi === "yarim") return f(s.h, s.h2);
  if (s.turi === "qoldi") return f(s.h, s.m, s.h0, s.m0);
  if (s.turi === "otdi" || s.turi === "otdiT") return f(s.h, s.m);
  return f(s.h);
}

/** Doskadagi yozuv: 10:57. */
export const soatYozuvi = (soat, daqiqa) => `${soat % 12 || 12}:${String(Math.max(0, Number(daqiqa) || 0)).padStart(2, "0")}`;

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
  const soatAyt = (L) => soatGapi(L, q.soat, q.daqiqa, yosh);   // REV167
  if (yosh >= 3) narsalar.push(["oy", OY, q.oy, "📅"]);
  narsalar.push(["fasl", FASL, q.fasl, FASL_BELGI[q.fasl]]);
  if (yosh >= 4) narsalar.push(["soat", null, q.soat, "⏰"]);
  if (yosh >= 6) narsalar.push(["yil", null, q.yil, "🎆"]);
  const gapi = (L, k, lug, i) => {
    if (k === "soat") return soatAyt(L);
    const g = GAP[L][k];
    if (typeof g === "function") return g(i);
    return g.replace("{d}", lug ? lug[L][i] : "").replace("{m}", lug ? lug[L][i] : "").replace("{s}", lug ? lug[L][i] : "").replace("{y}", String(i));
  };
  const qismlar = [];
  const doska = [];
  if (!T) {
    // boshqa fan — izoh tilida
    qismlar.push(tg(I, GAP[I].intro));
    for (const [k, lug, i, belgi] of narsalar) { qismlar.push(tg(I, bosh(gapi(I, k, lug, i)))); doska.push(`${belgi} ${lug ? lug[I][i] : k === "soat" ? soatYozuvi(q.soat, q.daqiqa) : i}`); }
  } else if (yosh < 4) {
    // 2–4 yosh til darsi: izoh tilida, keyin o'rganilayotgan tilda, bola so'zni takrorlaydi
    qismlar.push(tg(I, GAP[I].intro));
    for (const [k, lug, i, belgi] of narsalar) {
      qismlar.push(tg(I, bosh(gapi(I, k, lug, i))), tg(T, bosh(gapi(T, k, lug, i))));
      if (lug) qismlar.push(`${tg(I, AYT[I])} ${tg(T, bosh(lug[T][i]))} ⏸`);
      doska.push(`${belgi} ${lug ? lug[T][i] : k === "soat" ? soatYozuvi(q.soat, q.daqiqa) : i}`);
    }
  } else {
    // 4–7 yosh: to'liq o'rganilayotgan tilda; 4–5 yoshda kun va fasl so'zining tarjimasi bir marta
    qismlar.push(tg(T, GAP[T].intro));
    for (const [k, lug, i, belgi] of narsalar) {
      qismlar.push(tg(T, bosh(gapi(T, k, lug, i))));
      if (lug && yosh < 6 && (k === "kun" || k === "fasl")) qismlar.push(`— ${tg(I, lug[I][i])}.`);
      if (lug && k !== "oy") qismlar.push(`${tg(T, AYT[T])} ${tg(T, bosh(lug[T][i]))} ⏸`);
      doska.push(`${belgi} ${lug ? lug[T][i] : k === "soat" ? soatYozuvi(q.soat, q.daqiqa) : i}`);
    }
  }
  const sarlavha = `🗓️ ${bosh(lug1(T || I, q.kun))}`;
  return { turi: "kirish", _ochilish: "vaqt", sarlavha, ovoz: qismlar.join(" "), doska: doska.join("\n") };
}
const lug1 = (L, i) => KUN[L]?.[i] || KUN.uz[i];

export const KALENDAR_LUGAT = { KUN, OY, FASL, GAP };
