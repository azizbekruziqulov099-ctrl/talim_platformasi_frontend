// REV110: jonli ustoz — qaysi ustoz, qaysi xona, qaysi poza (sof funksiyalar, brauzersiz sinaladi).

/** Fan nomiga qarab ustoz: matematika va mantiq — Sardor aka, atrof-olam — Malika opa, ona tili — Nilufar opa.
 *  REV169: har chet tilining o'z ustozi va o'z sinfxonasi (bayrog'i, madaniy bezaklari bilan). */
export const TIL_USTOZ = { en: "emily", ru: "anna", tr: "elif", ar: "yusuf", de: "lukas", es: "carlos", ko: "jiwoo", fr: "camille", zh: "mei", ja: "kenji" };
const TIL_NOMI = [
  ["en", /ingliz|english|англ/], ["ru", /\brus\b|rus tili|русск|russian/], ["tr", /turk|türk|турец/], ["ar", /arab|араб/],
  ["de", /nemis|german|deutsch|немец/], ["es", /ispan|spanish|español|испан/], ["ko", /koreys|korean|корей|한국/],
  ["fr", /fransuz|french|français|француз/], ["zh", /xitoy|chinese|китай|中文/], ["ja", /yapon|japan|япон|日本/],
];
export function ustozFor(fan = "") {
  const f = String(fan).toLowerCase();
  if (/matem|sanoq|hisob|math|mantiq|logic|aql|логик|матем/.test(f)) return "sardor";
  if (/atrof|tabiat|olam|science|nature|world around|окружа|природ/.test(f)) return "malika";
  const asosiy = f.replace(/\(\s*izoh[^)]*\)/g, "");   // «Arab tili (izoh: rus)» — arab tili
  const t = TIL_NOMI.find(([, re]) => re.test(asosiy));
  return t ? TIL_USTOZ[t[0]] : "nilufar";
}

/**
 * REV181: ikki ustozli til darsi — izoh tili ustozi: o'zbekcha — Nilufar opa, ruscha — Anna, inglizcha — Emily.
 * O'rganilayotgan til izoh tili bilan bir xil bo'lsa (yoki ustoz bitta odam bo'lsa) — ikkinchi ustoz yo'q ("").
 */
export const IZOH_USTOZ = { uz: "nilufar", ru: "anna", en: "emily" };
export function ikkinchiUstoz({ til = "", iz = "uz", ustoz = "" } = {}) {
  if (!til) return "";
  const izL = IZOH_USTOZ[iz] ? iz : "uz";
  if (til === izL) return "";
  const k = IZOH_USTOZ[izL];
  return k && k !== ustoz ? k : "";
}

export const XONA = { sardor: "matematika", nilufar: "onatili", malika: "atrofolam",
  ...Object.fromEntries(Object.values(TIL_USTOZ).map((k) => [k, `til_${k}`])) };

/** Poza raqami (rasmdagi tartib): 1 tik turish, 2 salom, 3 ko'rsatish, 4 o'ylash, 5 quvonish, 6 tinglash. */
export function pozaFor(mood = "", { hasPics = false, listening = false } = {}) {
  const m = new Set(String(mood).split(/\s+/).filter(Boolean));
  if (listening) return 6;
  if (m.has("happy")) return 5;
  if (m.has("wave")) return 2;
  if (m.has("think")) return 4;
  if (m.has("enc")) return 1;
  if (m.has("talk")) return hasPics ? 3 : 1;
  return 1;
}

/** Gapirish kadrlari (yuz varag'idagi tartib): 1 jilmayish, 2 ochiq, 3 «A», 4 «O», 5 ko'z yumuq, 6 kulgi ^^. */
export const GAPIR = [1, 2, 3, 2, 4, 1, 3, 2];
export const PIRPIRAT = 5;
export const KULGI = 6;

/** Keyingi pirpiratishgacha kutish (ms): 2,5–5 soniya, tabiiy ko'rinishi uchun tasodifiy. */
export function blinkDelay(rand = Math.random) {
  return 2500 + Math.round(rand() * 2500);
}

/**
 * REV110: xona mavzuga moslashadi — darsning so'z rasmlari xona joylariga tarqatiladi:
 * devordagi ramka (1 ta), javon (2 tagacha, joyi bo'lsa), pol (1 ta). Doskadagi rasmlar takrorlanmaydi.
 * Jami 4 tadan oshmaydi — xona tartibli turadi.
 */
export function bezak(pics = [], xona = {}, doskada = []) {
  const busy = new Set(doskada);
  const list = [...new Set(pics.filter(Boolean))].filter((p) => !busy.has(p));
  const pool = list.length ? list : [...new Set(pics.filter(Boolean))];
  const out = { devor: null, javon: [], pol: null };
  let i = 0;
  if (xona.devor && pool[i]) out.devor = pool[i++];
  if (xona.pol && pool[i]) out.pol = pool[i++];
  if (xona.javon) while (out.javon.length < 2 && pool[i]) out.javon.push(pool[i++]);
  return out;
}

/** Ob-havo kodi (Open-Meteo WMO) → deraza ko'rinishi. Ma'lumot yo'q bo'lsa — fasl bo'yicha. */
export function havoTuri(kod, oy = new Date().getMonth() + 1) {
  const c = kod === null || kod === undefined || kod === "" ? NaN : Number(kod);
  if (Number.isFinite(c)) {
    if (c >= 95) return "momaqaldiroq";
    if ([71, 73, 75, 77, 85, 86].includes(c)) return "qor";
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82) || c >= 95) return "yomgir";
    if (c >= 2 && c <= 48) return "bulut";
    return "quyosh";
  }
  return [12, 1, 2].includes(oy) ? "bulut" : "quyosh";
}

// REV140: kun vaqti endi QUYOSHNING haqiqiy holatidan hisoblanadi (shahar koordinatasi + qurilmaning mutlaq vaqti).
// Oldin soat (getHours) va server «is_day» belgisi aralashardi — qurilma soat mintaqasi boshqacha bo'lsa yoki server
// eski/xato belgi bersa, kunduzi derazada oy va yulduzlar chiqib qolardi. Endi internet va soat mintaqasiga bog'liq emas.
export const SHAHAR_KOORD = {
  toshkent: [41.31, 69.28], samarqand: [39.65, 66.96], buxoro: [39.77, 64.42], andijon: [40.78, 72.34],
  fargona: [40.39, 71.78], namangan: [41.0, 71.67], qarshi: [38.86, 65.79], termiz: [37.22, 67.28],
  navoiy: [40.1, 65.37], jizzax: [40.12, 67.84], guliston: [40.49, 68.78], urganch: [41.55, 60.63],
  nukus: [42.46, 59.6], nurafshon: [41.04, 69.36],
};

/** Saqlangan shahar (yoki Toshkent) koordinatasi: [kenglik, uzunlik]. */
export function shaharKoord(nom = null) {
  let n = nom;
  if (n == null) { try { n = globalThis.localStorage?.getItem("kabutar:shahar"); } catch { n = null; } }
  const key = String(n || "").toLowerCase().replace(/[^a-z]/g, "");
  return SHAHAR_KOORD[key] || SHAHAR_KOORD.toshkent;
}

const RAD = Math.PI / 180;
/** Quyoshning ufqdan balandligi (gradus) va tushgacha/tushdan keyinligi. Aniqligi ~0.5° — kun vaqti uchun yetarli. */
export function quyoshHolati(sana = new Date(), lat = 41.31, lon = 69.28) {
  const d = sana.getTime() / 86400000 - 10957.5;                     // J2000 dan beri kunlar
  const g = (357.529 + 0.98560028 * d) * RAD;
  const q = 280.459 + 0.98564736 * d;
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  const e = (23.439 - 0.00000036 * d) * RAD;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / RAD;
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const gmst = (280.46061837 + 360.98564736629 * d) % 360;
  let h = (gmst + lon - ra) % 360;
  if (h > 180) h -= 360;
  if (h <= -180) h += 360;
  const balandlik = Math.asin(Math.sin(lat * RAD) * Math.sin(dec) + Math.cos(lat * RAD) * Math.cos(dec) * Math.cos(h * RAD)) / RAD;
  return { balandlik, ertalab: h < 0 };
}

/** Kun vaqti quyosh bo'yicha: baland — kun, ufq atrofida — tong/kech, ufqdan 6° pastda — tun. */
export function quyoshVaqti(sana = new Date(), koord = null) {
  const [lat, lon] = koord || shaharKoord();
  const { balandlik, ertalab } = quyoshHolati(sana, lat, lon);
  if (balandlik >= 6) return "kun";
  if (balandlik <= -6) return "tun";
  return ertalab ? "tong" : "kech";
}

/** REV111: kun vaqti — xona yorug'ligi va derazadagi osmon. kunduz: serverdan (Open-Meteo is_day: 1/0), bo'lmasa soatga qarab. */
export function kunVaqti(soat = new Date().getHours(), kunduz = null) {
  const h = Number(soat);
  let v = h >= 5 && h < 8 ? "tong" : h >= 8 && h < 17 ? "kun" : h >= 17 && h < 20 ? "kech" : "tun";
  if (kunduz === 0 && v !== "tun") v = h < 12 ? "tong" : "tun";     // qishda erta qorong'i tushadi
  if (kunduz === 1 && v === "tun") v = h < 12 ? "tong" : "kech";    // yozda kech yorug'
  return v;
}

/** REV171: qaysi xona — til ustozi ko'p kun o'z (bayroqli) xonasida, ba'zi kunlar eski chiroyli xonalarda (har kuni bir xil
 *  bo'lmasin). Boshqa ustozlar — o'z xonasida. kun — kun raqami (sana bo'yicha), test uchun beriladi. */
export function xonaKaliti(ustoz, kun = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000)) {
  const own = XONA[ustoz] || "onatili";
  if (!String(own).startsWith("til_")) return own;
  return [own, own, "onatili", own, "atrofolam"][((kun % 5) + 5) % 5];
}

/** REV181: bayroq nishoni — ustozning ko'kragida (poza rasmiga nisbatan %). */
export function kokrak(p) {
  const x = p?.og ? p.og.x : p?.yuz ? p.yuz.x + p.yuz.w / 2 : 50;
  const y = p?.og ? p.og.y : p?.yuz ? p.yuz.y + p.yuz.h * 0.8 : 18;
  return { left: `${Math.max(15, Math.min(85, x + 5))}%`, top: `${Math.min(45, y + 13)}%` };
}
