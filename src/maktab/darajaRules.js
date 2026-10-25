// REV173: Maktab tillari — daraja (CEFR), bal, baho, tezlik va bo'lim yo'li (dars → mashq → takror → imtihon). Sof qoidalar.
// Daraja O'zbekiston DTS bo'yicha: 4-sinf oxiri — A1, 9-sinf oxiri — A2, 11-sinf oxiri — B1. 1–2 sinf — Pre-A1.
import { SINFLAR } from "./index.js";
import { PUXTA, kunRaqami } from "../kid/xonalar/xonaRules.js";
import { REP_PUXTA } from "./repetitorRules.js";

export const CEFR = [
  { kod: "Pre-A1", sinflar: [1, 2], emoji: "🌱" },
  { kod: "A1", sinflar: [3, 4], emoji: "🌿" },
  { kod: "A2", sinflar: [5, 6, 7, 8, 9], emoji: "🌳" },
  { kod: "B1", sinflar: [10, 11], emoji: "🏔️" },
];
export const DARAJA_CHEGARA = 0.7;   // daraja olingan hisoblanadi — shu darajadagi so'zlarning 70% i o'zlashtirilgan
export const YAQIN = 60;             // «… ga yaqinlashdingiz» — keyingi darajaning 60% i

/** Bitta so'z qanchalik o'zlashtirilgan (0..1): o'yinlardagi takrorlash (srs, puxta — 4-quti) yoki repetitor lug'ati
 *  (puxta — 5-quti, lug'at ekranidagi bilan bir xil) — qaysi biri yuqori. */
export function sozBilim(id, srs = {}, lugat = {}) {
  const s = srs?.[id]?.quti || 0, l = lugat?.[id]?.quti || 0;
  if (s >= PUXTA || l >= REP_PUXTA) return 1;
  const q = Math.max(s, l);
  return q >= 2 ? 0.5 : q >= 1 ? 0.25 : 0;
}
const sinfSozlari = (sinflar) => sinflar.flatMap((n) => (SINFLAR[n - 1]?.bolimlar || []).flatMap((b) => b.sozlar.map((w) => w.id)));
const ULUSH_KESH = new Map();
function darajaSozlari(i) {
  if (!ULUSH_KESH.has(i)) ULUSH_KESH.set(i, sinfSozlari(CEFR[i].sinflar));
  return ULUSH_KESH.get(i);
}
/** Bir daraja so'zlarining o'zlashtirilgan ulushi (0..1). */
export function darajaUlushi(i, srs = {}, lugat = {}) {
  const ids = darajaSozlari(i);
  return ids.length ? ids.reduce((s, id) => s + sozBilim(id, srs, lugat), 0) / ids.length : 0;
}

/**
 * Hozirgi daraja: so'zlarining 70% i o'zlashtirilgan eng yuqori daraja (yo'q bo'lsa — null), keyingisi va unga necha foiz yaqin.
 * REV174: pastki darajalarni platformada o'tmagan kuchli o'quvchi ham o'z darajasini ko'radi (A2 so'zlarini bilsa — A2).
 * → { daraja: "A1" | null, keyingi: "A2" | null, foiz: 0..100, yaqin: bool, ulushlar: [..] }
 */
export function darajaHisob(srs = {}, lugat = {}) {
  const ulushlar = CEFR.map((_, i) => darajaUlushi(i, srs, lugat));
  let olingan = -1;
  for (let i = 0; i < CEFR.length; i++) if (ulushlar[i] >= DARAJA_CHEGARA) olingan = i;
  const k = olingan + 1 < CEFR.length ? olingan + 1 : null;
  const foiz = k === null ? 100 : Math.min(100, Math.round((ulushlar[k] / DARAJA_CHEGARA) * 100));
  return {
    daraja: olingan >= 0 ? CEFR[olingan].kod : null, indeks: olingan,
    keyingi: k === null ? null : CEFR[k].kod, foiz, yaqin: k !== null && foiz >= YAQIN,
    ulushlar: ulushlar.map((u) => Math.round(u * 100)),
  };
}
/** Sinf uchun mo'ljal daraja (DTS): 1–2 Pre-A1, 3–4 A1, 5–9 A2, 10–11 B1. */
export const sinfMaqsadi = (sinf) => (CEFR.find((c) => c.sinflar.includes(Number(sinf))) || CEFR[0]).kod;

/** Foizdan maktab bahosi (2–5). Kam javobda (20 tadan kam) baho qo‘yilmaydi. */
export function bahoOf(togri, jami) {
  if (!jami || jami < 20) return null;
  const p = togri / jami;
  return p >= 0.9 ? 5 : p >= 0.75 ? 4 : p >= 0.55 ? 3 : 2;
}
/** Imtihon (bellashuv) yulduzidan bo'lim bahosi. */
export const bolimBahosi = (yulduz) => (yulduz >= 3 ? 5 : yulduz === 2 ? 4 : yulduz === 1 ? 3 : null);
/** Ball: har to'g'ri javob — 10; bellashuvda tez javob uchun qolgan soniyalar qo'shiladi. */
export const javobBali = (togri, { bellashuv = false, qoldi = 0 } = {}) => (togri ? 10 + (bellashuv ? Math.max(0, Math.round(qoldi)) : 0) : 0);

const MASHQLAR = ["rasm", "mano", "harf", "gap", "yoz", "ayt"];
export const QADAMLAR = [
  { k: "dars", emoji: "📖", nom: "Dars" },
  { k: "mashq", emoji: "✏️", nom: "Mashq" },
  { k: "takror", emoji: "🔁", nom: "Takror" },
  { k: "imtihon", emoji: "🏆", nom: "Imtihon" },
];
/**
 * Bo'lim yo'li: har qadam bajarildimi. dars — so'z kartalari ko'rildi yoki repetitor o'tildi; mashq — biror o'yinda yulduz;
 * takror — so'zlarning 60% i kamida 2 marta takrorlangan (oraliqli takror kunlar davomida bajariladi); imtihon — bellashuvda yulduz.
 */
export function bolimQadamlari(bolim, yul = {}, srs = {}, lugat = {}, bugun = kunRaqami()) {
  const y = yul?.[bolim.id] || {};
  const dars = (y.kartalar || 0) >= 1 || (y.repetitor || 0) >= 1;
  const mashq = MASHQLAR.some((r) => (y[r] || 0) >= 1);
  const ids = bolim.sozlar.map((w) => w.id);
  const takrorlangan = ids.filter((id) => Math.max(srs?.[id]?.quti || 0, lugat?.[id]?.quti || 0) >= 2).length;
  const takror = ids.length > 0 && takrorlangan / ids.length >= 0.6;
  const imtihon = (y.bellashuv || 0) >= 1;
  // takror bugun mumkinmi: takrorlanadigan vaqti kelgan so'z bormi (yo'q bo'lsa — ertaga; so'z xotirada bir kun «yotishi» kerak)
  const takrorBugun = ids.some((id) => {
    const a = srs?.[id], b = lugat?.[id];
    return (a && (a.quti || 0) >= 1 && (a.keyin ?? 0) <= bugun) || (b && (b.quti || 0) >= 1 && (b.keyingi ?? 0) <= bugun);
  });
  return { dars, mashq, takror, imtihon, takrorBugun, imtihonYulduz: y.bellashuv || 0, baho: bolimBahosi(y.bellashuv || 0) };
}
/** Bo'lim ichida o'yin ochiqmi: mashqlar — darsdan keyin, imtihon — mashq va takrordan keyin. Dars (kartalar, repetitor) doim ochiq. */
export function rejimOchiq(rejim, q, erkin = false) {
  if (erkin || rejim === "kartalar" || rejim === "repetitor") return true;
  if (rejim === "bellashuv") return q.mashq && q.takror;
  return q.dars;
}
/**
 * Yil yo'li: bo'limlar ketma-ket ochiladi — oldingi bo'lim imtihonidan kamida 1 yulduz olingach. Bolaning o'z sinfidan pastki sinflar
 * (takrorlash uchun) va «erkin» (admin) — hammasi ochiq. → [{bolim, ochiq, q, keyingi}]
 */
export function yilYoli(sinfData, { yul = {}, srs = {}, lugat = {}, ozSinf = 1, erkin = false } = {}) {
  const pastki = erkin || sinfData.sinf < ozSinf;
  let oldingiOtdi = true;
  let keyingiTopildi = false;
  return sinfData.bolimlar.map((b) => {
    const q = bolimQadamlari(b, yul, srs, lugat);
    const ochiq = pastki || oldingiOtdi;
    oldingiOtdi = q.imtihon;
    const keyingi = ochiq && !q.imtihon && !keyingiTopildi;
    if (keyingi) keyingiTopildi = true;
    return { bolim: b, ochiq, q, keyingi };
  });
}
/** Bo'lim ichida navbatdagi qadam (tugma uchun). */
export function keyingiQadam(q) {
  if (!q.dars) return "dars";
  if (!q.mashq) return "mashq";
  if (!q.takror) return "takror";
  if (!q.imtihon) return "imtihon";
  return null;
}

// — ball, javoblar, tezlik (shu qurilmada; serverga ham yuboriladi) —
const KEY = "kabutar:maktab:natija:v1";
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
function oqi(st) { try { return JSON.parse(st?.getItem(KEY) || "{}") || {}; } catch { return {}; } }
const BOSH = { bal: 0, togri: 0, jami: 0, ms: 0, n: 0 };
export const natijaOl = (til, st = store()) => ({ ...BOSH, ...(oqi(st)[til] || {}) });
/** Bitta javob natijasini qo'shish. ms — javob vaqti (faqat bellashuvda tezlik uchun). */
export function javobYoz(til, { togri = false, bal = 0, ms = null } = {}, st = store()) {
  const d = oqi(st);
  const h = { ...BOSH, ...(d[til] || {}) };
  h.jami += 1; h.togri += togri ? 1 : 0; h.bal += Math.max(0, Number(bal) || 0);
  if (Number.isFinite(ms) && ms > 0 && ms < 120000) { h.ms += Math.round(ms); h.n += 1; }
  d[til] = h;
  try { st?.setItem(KEY, JSON.stringify(d)); } catch { /* joy yo'q */ }
  return h;
}
/** O'rtacha javob vaqti (soniya, 1 xona aniqlikda) yoki null. */
export const tezlikOf = (h) => (h?.n ? Math.round(h.ms / h.n / 100) / 10 : null);
