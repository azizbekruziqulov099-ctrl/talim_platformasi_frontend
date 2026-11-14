// REV260: «Xalqaro baholash» — sof qoidalar (brauzersiz sinaladi).

export const FIKRLASH = { bilish: "Bilish", qollash: "Qo‘llash", mulohaza: "Mulohaza" };
export const IMTIHON_BELGI = { kirish: "🎯", haftalik: "📅", oylik: "🗓️", choraklik: "📘", yillik: "🏆" };
export const DARAJA_RANG = { ilgor: "#7b3fe4", yuqori: "#1f8a4c", orta: "#1b6fd8", past: "#c77d00", boshlangich: "#b33a3a" };
export const DARAJALAR = [[625, "Ilg‘or"], [550, "Yuqori"], [475, "O‘rta"], [400, "Past"]];

/** Sinf → tavsiya etilgan TIMSS bosqichi. */
export const bosqichOf = (sinf) => (Number(sinf) >= 6 ? 8 : 4);

export function sinfRaqami(value) {
  const m = /(\d{1,2})/.exec(String(value ?? ""));
  const n = m ? Number(m[1]) : 0;
  return /yosh|kurs/i.test(String(value ?? "")) ? 0 : n >= 1 && n <= 11 ? n : 0;
}

/** Qolgan vaqt (ms) → «12:05». */
export function vaqtMatn(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${p(m)}:${p(x)}` : `${p(m)}:${p(x)}`;
}

/** Server vaqti bilan farqni hisobga olib, imtihon tugashigacha qolgan ms. */
export function qolganVaqt(tugash, serverVaqt, clientBosh, hozir = Date.now()) {
  const farq = serverVaqt ? Date.parse(serverVaqt) - clientBosh : 0;
  return Date.parse(tugash) - (hozir + farq);
}

const norm = (v) => String(v ?? "").toLowerCase()
  .replace(/[‘’ʻʼ`´]/g, "'").replace(/ё/g, "е").replace(/[.,!?;:«»"()]/g, " ").replace(/\s+/g, " ").trim();

/** Ovozli javob → variant indeksi. «be», «B javob», «ikkinchi», «бэ» … */
export function ovozdanVariant(text) {
  const t = norm(text);
  if (!t) return null;
  const sozlar = t.split(" ");
  const harf = { a: 0, "а": 0, "ә": 0, b: 1, be: 1, bi: 1, "б": 1, "бэ": 1, "бе": 1, c: 2, ce: 2, se: 2, si: 2, ts: 2, "с": 2, "си": 2, "це": 2, "сэ": 2,
    d: 3, de: 3, di: 3, "д": 3, "дэ": 3, "де": 3, "ди": 3,
    bee: 1, see: 2, sea: 2, cee: 2, dee: 3, "би": 1, "ди-": 3 };
  const tartib = [[/^(birinchi|bir|первый|первая|first|one)$/, 0], [/^(ikkinchi|ikki|второй|вторая|second|two)$/, 1],
    [/^(uchinchi|uch|третий|третья|third|three)$/, 2], [/^(to'rtinchi|to'rt|четвертый|четвёртый|четвертая|fourth|four)$/, 3]];
  for (const s of sozlar) if (s in harf) return harf[s];
  for (const s of sozlar) for (const [re, i] of tartib) if (re.test(s)) return i;
  return null;
}

const BIRLAR = { nol: 0, bir: 1, ikki: 2, uch: 3, "to'rt": 4, besh: 5, olti: 6, yetti: 7, sakkiz: 8, "to'qqiz": 9 };
const ONLAR = { "o'n": 10, yigirma: 20, "o'ttiz": 30, qirq: 40, ellik: 50, oltmish: 60, yetmish: 70, sakson: 80, "to'qson": 90 };

/** O'zbekcha son so'zlari → son: «yuz yigirma besh» → 125, «ming ikki yuz» → 1200. Topilmasa null. */
export function uzSon(sozlar) {
  let jami = 0, joriy = 0, bor = false;
  for (const w of sozlar) {
    if (/^-?\d+([.,]\d+)?$/.test(w)) { joriy += Number(w.replace(",", ".")); bor = true; }
    else if (w in BIRLAR) { joriy += BIRLAR[w]; bor = true; }
    else if (w in ONLAR) { joriy += ONLAR[w]; bor = true; }
    else if (w === "yuz") { joriy = (joriy || 1) * 100; bor = true; }
    else if (w === "ming") { jami += (joriy || 1) * 1000; joriy = 0; bor = true; }
    else if (w === "million") { jami += (joriy || 1) * 1e6; joriy = 0; bor = true; }
    else return null;
  }
  return bor ? jami + joriy : null;
}

// REV270: ruscha va inglizcha son so'zlari
const RU_SON = { "ноль": 0, "нуль": 0, "один": 1, "одна": 1, "одно": 1, "два": 2, "две": 2, "три": 3, "четыре": 4, "пять": 5, "шесть": 6, "семь": 7, "восемь": 8, "девять": 9,
  "десять": 10, "одиннадцать": 11, "двенадцать": 12, "тринадцать": 13, "четырнадцать": 14, "пятнадцать": 15, "шестнадцать": 16, "семнадцать": 17, "восемнадцать": 18, "девятнадцать": 19,
  "двадцать": 20, "тридцать": 30, "сорок": 40, "пятьдесят": 50, "шестьдесят": 60, "семьдесят": 70, "восемьдесят": 80, "девяносто": 90,
  "сто": 100, "двести": 200, "триста": 300, "четыреста": 400, "пятьсот": 500, "шестьсот": 600, "семьсот": 700, "восемьсот": 800, "девятьсот": 900 };
const EN_SON = { zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };

/** Ruscha/inglizcha son so'zlari → son (raqamlar ham qabul qilinadi). Topilmasa null. */
export function chetSon(sozlar, til = "ru") {
  let jami = 0, joriy = 0, bor = false;
  for (const w of sozlar) {
    if (/^-?\d+([.,]\d+)?$/.test(w)) { joriy += Number(w.replace(",", ".")); bor = true; continue; }
    if (til === "en" && w === "and") continue;
    const v = til === "en" ? EN_SON[w] : RU_SON[w];
    if (v !== undefined) { joriy += v; bor = true; continue; }
    if (til === "en" && w === "hundred") { joriy = (joriy || 1) * 100; bor = true; continue; }
    if (/^(тысяч[аи]?|thousand)$/.test(w)) { jami += (joriy || 1) * 1000; joriy = 0; bor = true; continue; }
    if (/^(миллион(а|ов)?|million)$/.test(w)) { jami += (joriy || 1) * 1e6; joriy = 0; bor = true; continue; }
    return null;
  }
  return bor ? jami + joriy : null;
}

function chetJavob(t, til) {
  const s = t.replace(/-/g, " ").split(" ").filter(Boolean);
  const minus = /^(минус|minus|negative)$/.test(s[0] || "") ? (s.shift(), "-") : "";
  const sep = til === "en" ? "." : ",";
  const iP = s.findIndex((w) => /^(целых|целая|point)$/.test(w));
  if (iP >= 0) {
    const a = iP === 0 ? 0 : chetSon(s.slice(0, iP), til);
    const qolgan = s.slice(iP + 1).filter((w) => !/^(десят(ых|ая)|сот(ых|ая)|тысячн(ых|ая))$/.test(w));
    const b = til === "en" ? (qolgan.every((w) => EN_SON[w] !== undefined && EN_SON[w] < 10 || /^\d$/.test(w)) ? qolgan.map((w) => (/^\d$/.test(w) ? w : EN_SON[w])).join("") : null)
      : chetSon(qolgan, til);
    if (a !== null && b !== null && String(b) !== "") return `${minus}${a}${sep}${b}`;
  }
  const iD = s.findIndex((w) => /^(дробь|over|из)$/.test(w));
  if (iD > 0) {
    const a = chetSon(s.slice(0, iD), til), b = chetSon(s.slice(iD + 1), til);
    if (a !== null && b) return `${minus}${a}/${b}`;
  }
  const n = chetSon(s, til);
  return n !== null ? `${minus}${String(n).replace(".", sep)}` : null;
}

/** Ovozli javob → yoziladigan qisqa javob: «o‘n ikki» → «12», «uch butun besh» → «3,5», «to‘rtdan uch» → «3/4», «minus besh» → «-5».
 * REV270: til = ru («три целых пять» → «3,5»), en («three point five» → «3.5», «three over four» → «3/4»). */
export function ovozdanJavob(text, til = "uz") {
  if (til === "ru" || til === "en") {
    // \b kirill harflarida ishlamaydi — so'zlar bo'yicha filtrlanadi
    const ORTIQCHA = /^(ответ|мой|моё|это|равно|штук[аи]?|сум(ов|а)?|answer|is|it's|its|equals|the|my|soums?|i|think)$/;
    const t2 = norm(text).split(" ").filter((w) => w && !ORTIQCHA.test(w)).join(" ");
    if (!t2) return "";
    return chetJavob(t2, til) ?? text.trim();
  }
  const t = norm(text).replace(/\b(ta|dona|javob|javobim|menimcha|bu|teng|ga|so'm|metr|santimetr)\b/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const s = t.split(" ");
  const manfiy = s[0] === "minus" ? (s.shift(), "-") : "";
  const iBut = s.indexOf("butun");
  if (iBut > 0) {
    const a = uzSon(s.slice(0, iBut)), b = uzSon(s.slice(iBut + 1).filter((w) => !/^(o'ndan|yuzdan|mingdan)$/.test(w)));
    if (a !== null && b !== null) return `${manfiy}${a},${b}`;
  }
  const iDan = s.findIndex((w) => /dan$/.test(w) && w !== "dan");
  if (iDan >= 0) {
    const maxraj = uzSon([...s.slice(0, iDan), s[iDan].replace(/dan$/, "")]);
    const surat = uzSon(s.slice(iDan + 1));
    if (maxraj && surat !== null) return `${manfiy}${surat}/${maxraj}`;
  }
  const n = uzSon(s);
  if (n !== null) return `${manfiy}${String(n).replace(".", ",")}`;
  return text.trim();
}

/** Ustoz gapining turi → rang va belgi. */
export const GAP_TUR = { maqtov: ["#1f8a4c", "🌟"], eslatma: ["#c77d00", "⏰"], tanbeh: ["#b33a3a", "⚠️"], salom: ["#1b6fd8", "👋"] };

/** Mavzu holati → yo'l belgisi. */
export function mavzuBelgi(holat) {
  if (!holat || !holat.urinilgan) return { belgi: "○", nom: "Boshlanmagan", kalit: "yangi" };
  if (holat.foiz >= 80) return { belgi: "★", nom: "O‘zlashtirildi", kalit: "tayyor" };
  if (holat.foiz >= 40) return { belgi: "◐", nom: "Davom etmoqda", kalit: "yarim" };
  return { belgi: "◔", nom: "Boshlangan", kalit: "boshlangan" };
}

/** Ball → TIMSS darajasi (rasmiy chegaralar). */
export function darajaNomi(ball) {
  if (ball === null || ball === undefined) return "";
  for (const [c, n] of DARAJALAR) if (ball >= c) return n;
  return "Past darajadan quyi";
}

/** Javoblar xaritasi → nechta javob berilgan. */
export const javoblarSoni = (javoblar) => Object.values(javoblar || {}).filter((v) => String(v ?? "").trim() !== "").length;

/** SVG matni → xavfsiz <img> manzili (skriptlar img ichida ishlamaydi). */
export function svgUrl(svg) {
  if (!svg) return "";
  try { return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(String(svg))}`; } catch { return ""; }
}

/** REV270: davlat nomlari jadvalda shu tilda keladi — diagramma uchun kerakli nomlar ham shu tilda. */
export const DAVLAT_NOMI = {
  uz: { uz: "O‘zbekiston", kz: "Qozog‘iston", ru: "Rossiya", tr: "Turkiya", oecd: "OECD o‘rtachasi", markaz: "Xalqaro markaz", siz: "Siz" },
  ru: { uz: "Узбекистан", kz: "Казахстан", ru: "Россия", tr: "Турция", oecd: "Среднее по ОЭСР", markaz: "Международный центр", siz: "Вы" },
  en: { uz: "Uzbekistan", kz: "Kazakhstan", ru: "Russian Federation", tr: "Türkiye", oecd: "OECD average", markaz: "International centre", siz: "You" },
};

/** Davlatlar jadvalidan diagramma uchun qatorlar: eng yuqori 5, O'zbekiston, qo'shnilar va o'quvchi. */
export function solishtirishQatorlari(jadval, ball, n = 5, til = "uz") {
  const N = DAVLAT_NOMI[til] || DAVLAT_NOMI.uz;
  const rows = [...(jadval || [])].sort((a, b) => b[1] - a[1]);
  const tanla = new Set(rows.slice(0, n).map((r) => r[0]));
  for (const nom of [N.uz, N.kz, N.ru, N.tr, N.oecd]) if (rows.some((r) => r[0] === nom)) tanla.add(nom);
  const out = rows.filter((r) => tanla.has(r[0])).map(([nom, b]) => ({ nom, ball: b, uz: nom === N.uz, markaz: nom === N.oecd }));
  if (ball) out.push({ nom: N.siz, ball, siz: true });
  // TIMSS — xalqaro markaz 500; PISA jadvalida OECD o'rtachasi bor bo'lsa, o'sha ko'rsatiladi
  if (!rows.some((r) => r[0] === N.oecd)) out.push({ nom: N.markaz, ball: 500, markaz: true });
  return out.sort((a, b) => b.ball - a.ball);
}
