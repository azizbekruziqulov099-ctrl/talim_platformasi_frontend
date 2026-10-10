// REV110: jonli ustoz — qaysi ustoz, qaysi xona, qaysi poza (sof funksiyalar, brauzersiz sinaladi).

/** Fan nomiga qarab ustoz: matematika — Sardor aka, atrof-olam — Malika opa, tillar va ona tili — Nilufar opa. */
export function ustozFor(fan = "") {
  const f = String(fan).toLowerCase();
  if (/matem|sanoq|hisob|math/.test(f)) return "sardor";
  if (/atrof|tabiat|olam|science|nature/.test(f)) return "malika";
  return "nilufar";
}

export const XONA = { sardor: "matematika", nilufar: "onatili", malika: "atrofolam" };

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

/** REV111: kun vaqti — xona yorug'ligi va derazadagi osmon. kunduz: serverdan (Open-Meteo is_day: 1/0), bo'lmasa soatga qarab. */
export function kunVaqti(soat = new Date().getHours(), kunduz = null) {
  const h = Number(soat);
  let v = h >= 5 && h < 8 ? "tong" : h >= 8 && h < 17 ? "kun" : h >= 17 && h < 20 ? "kech" : "tun";
  if (kunduz === 0 && v !== "tun") v = h < 12 ? "tong" : "tun";     // qishda erta qorong'i tushadi
  if (kunduz === 1 && v === "tun") v = h < 12 ? "tong" : "kech";    // yozda kech yorug'
  return v;
}
