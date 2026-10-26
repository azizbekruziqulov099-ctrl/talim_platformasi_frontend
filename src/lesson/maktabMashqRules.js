// REV175: maktab darsi — ochilishda sana (kun, oy, yil, hafta kuni) va darsdan keyingi mashqlar materiali
// (o'qish, gapirish, diktant, yozganini o'qib berish). Sof funksiyalar (brauzersiz sinaladi).

const OYLAR_UZ = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const KUNLAR_UZ = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
const LOKAL = { en: "en-GB", de: "de-DE", ru: "ru-RU", fr: "fr-FR", es: "es-ES", tr: "tr-TR", ar: "ar", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR" };
const BUGUN = {
  en: "Today is {d}.", de: "Heute ist {d}.", ru: "Сегодня {d}.", fr: "Aujourd'hui, c'est {d}.", es: "Hoy es {d}.", tr: "Bugün {d}.",
  ar: "اليوم هو {d}.", zh: "今天是{d}。", ja: "今日は{d}です。", ko: "오늘은 {d}입니다.",
};
const BOSHLAYMIZ = { uz: "Darsni boshlaymiz!", ru: "Начинаем урок!", en: "Let's start the lesson!" };

/** O'zbekcha sana: «2026-yil 26-oktabr, dushanba». */
export function sanaUz(d = new Date()) {
  return `${d.getFullYear()}-yil ${d.getDate()}-${OYLAR_UZ[d.getMonth()]}, ${KUNLAR_UZ[d.getDay()]}`;
}
/** O'rganilayotgan tilda sana: «Montag, 26. Oktober 2026». Intl bo'lmasa — null. */
export function sanaTilda(til, d = new Date()) {
  try { return new Intl.DateTimeFormat(LOKAL[til] || til, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d).replace(/[.。]$/, ""); } catch { return null; }
}
/** Interfeys tilida sana (izoh uchun). */
function sanaIzoh(iz, d) {
  if (iz === "uz") return `Bugun ${sanaUz(d)}.`;
  const s = sanaTilda(iz, d);
  return s ? BUGUN[iz].replace("{d}", s) : `Bugun ${sanaUz(d)}.`;
}

/**
 * Dars ochilishidagi sana qadami. Til darsida — o'sha tilda («Heute ist Montag, der 26. Oktober 2026») va izoh tilida;
 * boshqa fanlarda — izoh tilida. Ustoz aytadi, doskada yoziladi.
 */
export function sanaQadami({ til = "", iz = "uz", sana = new Date() } = {}) {
  const izohMatn = sanaIzoh(iz, sana);
  const tilda = til && BUGUN[til] ? sanaTilda(til, sana) : null;
  const tilGap = tilda ? BUGUN[til].replace("{d}", tilda) : "";
  const teg = (t, l) => (l === "uz" ? t : `[${l}]${t}[/${l}]`);
  return {
    id: "maktab-sana", turi: "kirish", sahna: "maktab-sana", sarlavha: `📅 ${tilGap || izohMatn}`,
    doska: tilGap ? `${tilGap}\n${izohMatn}` : izohMatn,
    ovoz: `${tilGap ? `${teg(tilGap, til)} ` : ""}${teg(izohMatn, iz)} ${teg(BOSHLAYMIZ[iz] || BOSHLAYMIZ.uz, iz)}`,
    rasm: null, _maktabSana: true,
  };
}

const TEG = /\[\/?[a-z]{2}\]/g;
const toza = (s) => String(s || "").replace(TEG, "").replace(/\s+/g, " ").trim();
const harfBor = (s) => /\p{L}/u.test(s);
const EMOJI = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[⃣️‍])+/gu;

/**
 * Darsdan keyingi mashqlar materiali. sozlar — maktabDarsSozlari() natijasi (so'zlar va misollar).
 * → { oqish: [gap], gapirish: [savol], diktant: [{matn, tarjima}] }
 */
export function mashqMateriali(steps = [], sozlar = []) {
  const sozMatnlari = new Set(sozlar.map((w) => Object.values(w.w)).flat().map((x) => toza(x).toLowerCase()));
  const qatorlar = [];
  for (const s of steps) {
    if (s?._maktabSana || s?.turi === "test") continue;
    for (const q of String(s?.doska || "").split("\n")) {
      const t = toza(q.replace(EMOJI, "")).replace(/^[-•*]\s*/, "");
      if (t.length < 8 || t.length > 160 || !harfBor(t) || sozMatnlari.has(t.toLowerCase())) continue;
      if (/\s[—–]\s/.test(t) && t.split(/\s[—–]\s/).every((p) => p.length < 30)) continue;   // «so'z — tarjima» qatorlari
      if (!qatorlar.includes(t)) qatorlar.push(t);
    }
  }
  const misollar = sozlar.map((w) => toza(w.misol)).filter((t) => t.length >= 8);
  const gaplar = [...new Set([...misollar, ...qatorlar])];
  const savol = (t) => /[?？؟]$/.test(t);
  // dialog qatori «Aziz: …» — o'qish uchun ism olib tashlanadi
  const ismsiz = (t) => t.replace(/^[\p{Lu}][\p{L}]{1,14}:\s+/u, "");
  const oqish = gaplar.filter((t) => !savol(t) && t.split(/\s+/).length >= 3).map(ismsiz).filter((t) => t.length <= 140).slice(0, 5);
  const gapirish = [...new Set(gaplar.map(ismsiz).flatMap((t) => t.split(/(?<=[.!?？؟。])\s+/)).map((t) => t.replace(/^[^:?]{3,40}:\s+(?=\S.*[?？؟]$)/u, "")).filter((t) => savol(t) && t.split(/\s+/).length >= 2 && t.length <= 120))].slice(0, 3);
  const diktant = [
    ...sozlar.slice(0, 5).map((w) => ({ matn: Object.values(w.w)[0], tarjima: w.w.uz || "" })),
    ...oqish.filter((t) => t.length <= 70).slice(0, 2).map((t) => ({ matn: t, tarjima: "" })),
  ];
  return { oqish, gapirish, diktant };
}

/** Mashq natijasidan yulduz (0–3) — umumiy ulush bo'yicha. */
export const mashqYulduz = (togri, jami) => { const p = jami ? togri / jami : 0; return p >= 0.9 ? 3 : p >= 0.7 ? 2 : p >= 0.4 ? 1 : 0; };

/**
 * REV176: maktab sinfxonasida doska, ustoz va deraza joylashuvi — har xona rasmiga qarab (deraza va devor soati ochiq qolsin):
 * ustoz derazaga qarama-qarshi tomonda, doska ular orasida, ustozning gapi doska ostida. Qiymatlar — xona foizida.
 * REV177: test va tekshiruvda sinfxona (va ustoz) ko'rsatilmaydi — Kabuning o'z muhiti (DarsXonasi: kabuMuhit).
 */
export const SINF_JOY = {
  til: { ustoz: "ong", doska: { l: 33.5, t: 21.5, w: 41.5, h: 53 } },          // deraza chapda, soat tepada o'rtada
  onatili: { ustoz: "chap", doska: { l: 26, t: 3, w: 42.5, h: 70 } },     // deraza o'ngda, soat chapda (ustoz tomonda)
  atrofolam: { ustoz: "chap", doska: { l: 30.5, t: 3, w: 56.5, h: 70 } },   // deraza o'ng chekkada
  matematika: { ustoz: "chap", doska: { l: 27, t: 3, w: 60, h: 70 } },    // soat o'ng tepada, deraza chap chekkada
};
/** REV181: juft — ikki ustoz (doskaning ikki yonida): doska ular orasidagi butun joyni egallaydi (19%–81%). */
export function sinfJoyi(xonaKey = "", { juft = false } = {}) {
  const j0 = SINF_JOY[String(xonaKey).startsWith("til") ? "til" : xonaKey] || SINF_JOY.til;
  let j = j0;
  if (juft) {
    // ikki ustoz chekkalarda (chapda ~0–18%, o'ngda ~82–100%), doska ular orasidagi butun joyni egallaydi;
    // tepasi xonaning devor soatini ochiq qoldiradi, pastida ustoz gapi uchun joy qoladi
    // REV181: ustoz gapi pastda alohida yozilmaydi (hammasi doskada) — doska pastgacha cho'ziladi
    const t = j0.doska.t, h = Math.min(95 - t, 90);
    j = { ...j0, doska: { l: 19, t, w: 62, h } };
  }
  const tepa = j.doska.t + j.doska.h + 2;
  // juftda ustoz gapi oynasi yo'q — joy faqat «Savol berish» oynasi uchun (doska ustida ochiladi)
  if (juft) return { ...j, gap: { l: j.doska.l, t: Math.min(tepa, 97), w: j.doska.w, h: 1 } };
  return { ...j, gap: { l: j.doska.l, t: tepa, w: j.doska.w, h: Math.max(14, Math.min(26, 98 - tepa)) } };
}

/**
 * REV177: test savolini ovozda to'g'ri talaffuz bilan o'qish uchun tillarga bo'lib teglash.
 *  • kirish va «A) B) C)» harflari — interfeys tilida (uz | ru | en);
 *  • savol va variant: darsda o'rganilayotgan tilning so'zi bo'lsa (darsdagi [de]…[/de] teglari yoki lug'at) — o'sha tilda,
 *    kirill harfi bo'lsa — rus, aks holda izoh tilida. O'zbek qismi tegsiz qoladi (server o'zbekcha o'qiydi).
 */
const TEG_RE = /\[([a-z]{2})\]([\s\S]*?)\[\/\1\]/g;
const soz = (s) => String(s || "").toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}\s'’-]/gu, " ").replace(/\s+/g, " ").trim();
/** Darsdagi o'rganilayotgan til so'zlari: qadamlardagi teglar va lug'at. */
export function tilLugati(steps = [], til = "", sozlar = []) {
  const set = new Set();
  if (!til) return set;
  const qosh = (t) => { const s = soz(t); if (!s) return; set.add(s); for (const w of s.split(" ")) if (w.length >= 2) set.add(w); };
  for (const s of steps) for (const k of ["ovoz", "doska", "sarlavha"]) {
    for (const m of String(s?.[k] || "").matchAll(TEG_RE)) if (m[1] === til) qosh(m[2]);
  }
  for (const w of sozlar) qosh(w?.w?.[til]);
  return set;
}
/** Bitta matn qaysi tilda o'qilsin. */
export function matnTili(matn, { til = "", iz = "uz", lugat = new Set() } = {}) {
  const t = String(matn || "");
  const bor = TEG_RE.exec(t); TEG_RE.lastIndex = 0;
  if (bor) return "teg";
  if (/[Ѐ-ӿ]/.test(t)) return "ru";
  const s = soz(t);
  if (til && s) {
    if (lugat.has(s)) return til;
    const w = s.split(" ").filter(Boolean);
    const ichida = w.filter((x) => lugat.has(x)).length;
    if (w.length && ichida / w.length >= 0.6) return til;
    if (til === "de" && /[äöüß]/i.test(t)) return "de";
    if (til === "es" && /[ñ¿¡]/i.test(t)) return "es";
    if (til === "fr" && /[çœàâêîôûëïÿ]/i.test(t)) return "fr";
  }
  return iz;
}
const tegla = (t, l) => (!t || l === "uz" || l === "teg" ? t : `[${l}]${t}[/${l}]`);
export function testOvozi({ kirish = "", savol = "", variantlar = [], til = "", iz = "uz", ui = "uz", lugat = new Set() } = {}) {
  const HARF = ["A", "B", "C", "D", "E"];
  const uiL = ["uz", "ru", "en"].includes(ui) ? ui : "uz";
  const qism = [];
  if (kirish) qism.push(tegla(kirish, uiL));
  qism.push(tegla(savol, matnTili(savol, { til, iz, lugat })));
  variantlar.forEach((o, k) => {
    const v = String(o?.text ?? o ?? "");
    qism.push(`${tegla(`${HARF[k]})`, uiL)} ${tegla(v, matnTili(v, { til, iz, lugat }))}.`);
  });
  return qism.join(" ");
}
