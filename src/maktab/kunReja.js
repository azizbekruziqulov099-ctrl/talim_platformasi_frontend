// REV177: 1–11 sinf o'quvchisining kun rejasi (bog'chadagi kunlik reja kabi) — yoshga mos dars soni, dam olish kunlari, yakshanba.
//  • 1–2 sinf: kuniga 3–4 dars (35 daqiqa), 3–4 sinf: 4–5 dars (40 daqiqa), 5–9 sinf: 5–6 dars (45 daqiqa), 10–11 sinf: 6 dars;
//  • har darsdan oldin Kabu bilan 5–10 daqiqalik spiral takror, oxirida Repetitor (so'z yodlash, yozish);
//  • dam olish kunlari (ota-ona tanlaydi, standart — yakshanba): yangi dars yo'q;
//  • yakshanba «takror» rejimida: yangi dars o'rniga haftalik takror (Repetitor, haftalik imtihon).
// Sof funksiyalar (brauzersiz sinaladi).

export const HAFTA_KUNLARI = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
export const HAFTA_QISQA = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
export const REJA_STANDART = { dars_soni: 0, dam_kunlari: [0], yakshanba: "takror" };
export const TANAFFUS = 10;

/** Sinfga mos dars soni va bitta dars davomiyligi. */
export function sinfDarslari(sinf = 5) {
  const s = Math.min(11, Math.max(1, Number(sinf) || 5));
  if (s <= 2) return { min: 3, max: 4, daqiqa: 35, takror: 5, repetitor: 10 };
  if (s <= 4) return { min: 4, max: 5, daqiqa: 40, takror: 7, repetitor: 15 };
  if (s <= 9) return { min: 5, max: 6, daqiqa: 45, takror: 8, repetitor: 15 };
  return { min: 6, max: 6, daqiqa: 45, takror: 10, repetitor: 20 };
}

/** «7-A», «1 sinf», 9 → 7, 1, 9. */
export const sinfRaqami = (v) => Number(/(\d{1,2})/.exec(String(v ?? ""))?.[1]) || 0;

/** Kun turi: dars | takror (yakshanba — haftalik takror) | dam. */
export function kunTuri(reja = REJA_STANDART, haftaKuni = new Date().getDay()) {
  const r = { ...REJA_STANDART, ...(reja || {}) };
  if (haftaKuni === 0 && r.yakshanba === "takror") return "takror";
  if (haftaKuni === 0 && r.yakshanba === "dam") return "dam";
  if ((r.dam_kunlari || []).includes(haftaKuni) && !(haftaKuni === 0 && r.yakshanba === "dars")) return "dam";
  return "dars";
}

/** Daqiqani «2 soat 35 daqiqa» ko'rinishiga. t — tarjima funksiyasi (interfeys tili uchun). */
export function vaqtMatni(daqiqa = 0, t = (x) => x) {
  const s = Math.floor(daqiqa / 60);
  const d = Math.round(daqiqa % 60);
  return [s ? `${s} ${t("soat")}` : "", d ? `${d} ${t("daqiqa")}` : ""].filter(Boolean).join(" ") || `0 ${t("daqiqa")}`;
}

/**
 * Bugungi reja. bajardi — serverdan (yoki shu qurilmadan) bugun bajarilganlar: {dars, takror, repetitor, imtihon} (har biri — nechta).
 * → {tur, kun, darsSoni, oraliq: "3–4", slotlar: [{k, n?, daqiqa, bajarildi}], jamiDaqiqa, bajarildi, jami, tugadi}
 */
export function kunRejasi({ sinf = 5, reja = REJA_STANDART, haftaKuni = new Date().getDay(), bajardi = {} } = {}) {
  const sd = sinfDarslari(sinf);
  const tur = kunTuri(reja, haftaKuni);
  const nDars = Number(bajardi.dars) || 0;
  const avto = !(Number(reja?.dars_soni) > 0);
  const darsSoni = avto ? sd.max : Math.min(8, Number(reja.dars_soni));
  const oraliq = avto ? (sd.min === sd.max ? `${sd.min}` : `${sd.min}–${sd.max}`) : `${darsSoni}`;
  let slotlar = [];
  if (tur === "dars") {
    slotlar = [
      ...Array.from({ length: darsSoni }, (_, i) => ({ k: "dars", n: i + 1, daqiqa: sd.takror + sd.daqiqa, takror: sd.takror, dars: sd.daqiqa, bajarildi: i < nDars, ixtiyoriy: avto && i >= sd.min })),
      { k: "repetitor", daqiqa: sd.repetitor, bajarildi: (Number(bajardi.repetitor) || 0) > 0 },
    ];
  } else if (tur === "takror") {
    slotlar = [
      { k: "repetitor", daqiqa: sd.repetitor, bajarildi: (Number(bajardi.repetitor) || 0) > 0 },
      { k: "imtihon", daqiqa: 15, bajarildi: (Number(bajardi.imtihon) || 0) > 0 },
      { k: "takror", daqiqa: sd.takror, bajarildi: (Number(bajardi.takror) || 0) > 0, ixtiyoriy: true },
    ];
  }
  const majburiy = slotlar.filter((s) => !s.ixtiyoriy);
  const jamiDaqiqa = slotlar.filter((s) => !s.ixtiyoriy).reduce((s, x) => s + x.daqiqa, 0) + Math.max(0, majburiy.filter((s) => s.k === "dars").length - 1) * TANAFFUS;
  const bajarildi = majburiy.filter((s) => s.bajarildi).length;
  return { tur, kun: HAFTA_KUNLARI[haftaKuni], darsSoni, oraliq, avto, slotlar, jamiDaqiqa, bajarildi, jami: majburiy.length,
    tugadi: tur === "dam" || (majburiy.length > 0 && bajarildi >= majburiy.length), darsTugadi: tur !== "dars" || nDars >= (avto ? sd.min : darsSoni) };
}

// — shu qurilmada bugun bajarilganlar (server javob bermasa ham reja ishlaydi) —
const KEY = "kabutar:maktab:kun:v1";
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
const bugunISO = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function kunBajardi(st = store(), bugun = bugunISO()) {
  try { const d = JSON.parse(st?.getItem(KEY) || "{}") || {}; return d.sana === bugun ? Object.fromEntries(Object.entries(d.turlar || {}).map(([k, v]) => [k, v.length])) : {}; } catch { return {}; }
}
export function kunBelgila(turi, kod, st = store(), bugun = bugunISO()) {
  if (!turi || !kod) return;
  let d = {};
  try { d = JSON.parse(st?.getItem(KEY) || "{}") || {}; } catch { d = {}; }
  if (d.sana !== bugun) d = { sana: bugun, turlar: {} };
  const ro = d.turlar[turi] || [];
  if (!ro.includes(kod)) d.turlar[turi] = [...ro, kod].slice(-30);
  try { st?.setItem(KEY, JSON.stringify(d)); } catch { /* joy yo'q */ }
}
/** Server va qurilma hisobidan kattasi (boshqa qurilmada qilingani ham, internet uzilganda qilingani ham hisoblanadi). */
export const birlashtir = (server = {}, mahalliy = {}) => Object.fromEntries([...new Set([...Object.keys(server), ...Object.keys(mahalliy)])]
  .map((k) => [k, Math.max(Number(server[k]) || 0, Number(mahalliy[k]) || 0)]));
