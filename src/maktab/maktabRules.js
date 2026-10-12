// REV129: Maktab til o'yinlari — sof qoidalar (brauzersiz sinaladi).
import { SINFLAR } from "./index.js";
import { aralashtir, srsYangila, kunRaqami, PUXTA, tanlaSRS } from "../kid/xonalar/xonaRules.js";
import { bolaklar } from "../til/mashqRules.js";

/** Profildagi sinfdan raqam: «5», «5-sinf», «10 A» → 5 / 10; bog'cha, talaba kursi («2 kurs») yoki noma'lum → null. */
export function sinfRaqami(qiymat) {
  const m = /(\d{1,2})/.exec(String(qiymat ?? ""));
  if (!m || /yosh|kurs|magistr|курс|year|age/i.test(String(qiymat))) return null;   // talaba kursi va yosh guruhi — sinf emas
  const n = Number(m[1]);
  return n >= 1 && n <= 11 ? n : null;
}

/** Sinfga mos o'yinlar: 1-sinf — rasm va ovoz; 2-sinfdan harf terish; 3-sinfdan gap tuzish; 4-sinfdan diktant. */
export function rejimlar(sinf) {
  const r = ["kartalar", "rasm", "mano"];
  if (sinf >= 2) r.push("harf");
  if (sinf >= 3) r.push("gap");
  if (sinf >= 4) r.push("yoz");
  r.push("ayt", "bellashuv");
  return r;
}
export const SAVOL_SONI = (sinf) => (sinf <= 2 ? 6 : sinf <= 6 ? 8 : 10);

const harfMos = /^[\p{L}\p{M}\p{N}]$/u;
/** Harflar (terish uchun): bo'shliq va tinish belgilarsiz. Xitoy/yapon/koreys — belgi (bo'g'in) bo'yicha. */
export function harflar(soz) {
  return [...String(soz || "").normalize("NFC")].filter((c) => harfMos.test(c));
}
/** Terish mumkinmi (juda uzun so'z/iboralar — yo'q). */
export const terishMumkin = (soz) => { const n = harflar(soz).length; return n >= 2 && n <= 14; };

/** Terish plitkalari: so'z harflari + 2 ta chalg'ituvchi (o'sha bo'limdagi boshqa so'zlardan). */
export function harfPlitkalar(soz, boshqalar = [], rng = Math.random) {
  const h = harflar(soz);
  const ortiqcha = aralashtir([...new Set(boshqalar.flatMap(harflar))].filter((c) => !h.includes(c)), rng).slice(0, 2);
  return aralashtir([...h, ...ortiqcha].map((c, i) => ({ k: i, c })), rng);
}
/** Terilgan harflar to'g'rimi (katta-kichik harf farqi yo'q). */
export const harfTogri = (terilgan, soz) => terilgan.join("").toLocaleLowerCase() === harflar(soz).join("").toLocaleLowerCase();

/** 4 ta variant: to'g'risi va o'sha bo'limdagi (yetmasa — o'sha sinfdagi) boshqa so'zlar. */
export function variantlar(togri, bolim, sinf, rng = Math.random, n = 4) {
  const boshqa = bolim.sozlar.filter((w) => w.id !== togri.id);
  const ortiq = (SINFLAR[sinf - 1]?.bolimlar || []).flatMap((b) => b.sozlar).filter((w) => w.id !== togri.id && !boshqa.includes(w));
  const tanlov = [...aralashtir(boshqa, rng), ...aralashtir(ortiq, rng)].slice(0, n - 1);
  return aralashtir([togri, ...tanlov], rng);
}

/**
 * Bitta o'yin savollari. srs — so'z va gaplar holati; bugun takrorlanadiganlari avval.
 * Har savol: { tur, soz?, gap?, variantlar?, plitkalar? }.
 */
export function savollar(rejim, bolim, sinf, { rng = Math.random, srs = null, til = "en" } = {}) {
  const n = SAVOL_SONI(sinf);
  const sozIdlar = bolim.sozlar.map((w) => w.id);
  const tanla = (ids, k) => tanlaSRS(ids, Math.min(k, ids.length), srs, rng, kunRaqami(), k);
  const sozBy = (id) => bolim.sozlar.find((w) => w.id === id);
  const gapBy = (id) => bolim.gaplar.find((g) => g.id === id);
  if (rejim === "kartalar") return bolim.sozlar.map((w) => ({ tur: "karta", soz: w }));
  if (rejim === "rasm" || rejim === "mano") return tanla(sozIdlar, n).map((id) => ({ tur: rejim, soz: sozBy(id), variantlar: variantlar(sozBy(id), bolim, sinf, rng) }));
  if (rejim === "harf") {
    const mos = sozIdlar.filter((id) => terishMumkin(sozBy(id).w[til]));
    return tanla(mos.length ? mos : sozIdlar, n).map((id) => ({ tur: "harf", soz: sozBy(id),
      plitkalar: harfPlitkalar(sozBy(id).w[til], bolim.sozlar.filter((w) => w.id !== id).map((w) => w.w[til]), rng) }));
  }
  if (rejim === "gap") return tanla(bolim.gaplar.map((g) => g.id), n).map((id) => ({ tur: "gap", gap: gapBy(id),
    plitkalar: aralashtir(bolaklar(gapBy(id).w[til], til).map((c, i) => ({ k: i, c })), rng) }));
  if (rejim === "yoz") {
    const sozlar = tanla(sozIdlar, Math.ceil(n / 2)).map((id) => ({ tur: "yoz", soz: sozBy(id) }));
    const gaplar = tanla(bolim.gaplar.map((g) => g.id), Math.floor(n / 2)).map((id) => ({ tur: "yoz", gap: gapBy(id) }));
    return [...sozlar, ...gaplar];
  }
  if (rejim === "ayt") {
    const sozlar = tanla(sozIdlar, Math.ceil(n / 2)).map((id) => ({ tur: "ayt", soz: sozBy(id) }));
    const gaplar = sinf >= 3 ? tanla(bolim.gaplar.map((g) => g.id), Math.floor(n / 2)).map((id) => ({ tur: "ayt", gap: gapBy(id) })) : [];
    return [...sozlar, ...gaplar];
  }
  if (rejim === "bellashuv") {
    // aralash: rasm / ma'no / gap tuzish — vaqt bilan
    const turlar = sinf >= 3 ? ["rasm", "mano", "gap"] : ["rasm", "mano"];
    return tanla(sozIdlar, n).map((id, i) => {
      const tur = turlar[i % turlar.length];
      if (tur === "gap" && bolim.gaplar.length) {
        const g = bolim.gaplar[i % bolim.gaplar.length];
        return { tur: "gap", gap: g, plitkalar: aralashtir(bolaklar(g.w[til], til).map((c, k) => ({ k, c })), rng), vaqt: true };
      }
      return { tur, soz: sozBy(id), variantlar: variantlar(sozBy(id), bolim, sinf, rng), vaqt: true };
    });
  }
  return [];
}

// — natija (shu qurilmada): so'z/gap holati va bo'lim yulduzlari —
const KEY = "kabutar:maktab:v1";
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
export function oqi(st = store()) { try { return JSON.parse(st?.getItem(KEY) || "{}") || {}; } catch { return {}; } }
function yoz(d, st) { try { st?.setItem(KEY, JSON.stringify(d)); } catch { /* joy yo'q */ } }
export const srsOl = (til, st = store()) => oqi(st)[`srs:${til}`] || {};
export function belgila(til, id, togri, st = store(), bugun = kunRaqami()) {
  const d = oqi(st); const k = `srs:${til}`;
  d[k] = d[k] || {}; d[k][id] = srsYangila(d[k][id], togri, bugun); yoz(d, st);
  return d[k];
}
/** Bo'lim natijasi: eng yaxshi yulduz (0–3) har o'yin turi bo'yicha. */
export function yulduzYoz(til, bolimId, rejim, yulduz, st = store()) {
  const d = oqi(st); const k = `y:${til}`;
  d[k] = d[k] || {}; d[k][bolimId] = d[k][bolimId] || {};
  d[k][bolimId][rejim] = Math.max(d[k][bolimId][rejim] || 0, yulduz); yoz(d, st);
  return d[k][bolimId];
}
export const yulduzlar = (til, st = store()) => oqi(st)[`y:${til}`] || {};
/** Natijadan yulduz: 90%+ — 3, 70%+ — 2, 40%+ — 1. */
export const yulduzHisob = (togri, jami) => { const p = jami ? togri / jami : 0; return p >= 0.9 ? 3 : p >= 0.7 ? 2 : p >= 0.4 ? 1 : 0; };
/** Bo'lim o'zlashtirilishi (0..1): puxta so'zlar ulushi. */
export function bolimPuxta(bolim, srs) {
  const ids = bolim.sozlar.map((w) => w.id);
  return ids.length ? ids.filter((id) => (srs?.[id]?.quti || 0) >= PUXTA).length / ids.length : 0;
}
