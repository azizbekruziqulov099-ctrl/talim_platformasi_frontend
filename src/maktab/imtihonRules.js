// REV176: Maktab tillari — imtihonlar (4 ko'nikma: tinglash, o'qish, yozish, gapirish).
//  • haftalik — shu haftada o'rganilgan so'z va gaplardan (haftada bir marta tavsiya etiladi);
//  • oylik — oxirgi 30 kunning hammasidan (kattaroq takror imtihoni);
//  • joylashtirish — Pre-A1 → A1 → A2 → B1 bosqichma-bosqich: qaysi darajadan boshlash kerakligini aniqlaydi.
// Sof funksiyalar (brauzersiz sinaladi).
import { SINFLAR } from "./index.js";
import { CEFR } from "./darajaRules.js";
import { kunRaqami } from "../kid/xonalar/xonaRules.js";

export const KONIKMALAR = [
  { k: "tinglash", emoji: "🎧", nom: "Tinglash" },
  { k: "oqish", emoji: "📖", nom: "O‘qish" },
  { k: "yozish", emoji: "✍️", nom: "Yozish" },
  { k: "gapirish", emoji: "🗣️", nom: "Gapirish" },
];
export const SONI = { haftalik: { tinglash: 4, oqish: 4, yozish: 3, gapirish: 3 }, oylik: { tinglash: 6, oqish: 6, yozish: 5, gapirish: 4 } };
export const JOY_SONI = 4;          // joylashtirishda har darajadan shuncha savol (tinglash, o'qish, yozish, tinglash)
export const JOY_CHEGARA = 0.7;     // daraja olindi — shu darajadagi savollarning 70% i to'g'ri

const aralash = (a, rng) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const BARCHA = () => SINFLAR.flatMap((s) => s.bolimlar.map((b) => ({ ...b, sinf: s.sinf })));

/** So'z/gap hovuzi: SRS va repetitor lug'atida oxirgi `kun` kunda ko'rilganlar; kam bo'lsa — bolaning sinfidagi birinchi bo'limlar. */
export function hovuz({ srs = {}, lugat = {}, kun = 7, sinf = 1, bugun = kunRaqami() } = {}) {
  const yaqin = (h) => h && bugun - (h.oxirgi ?? -9999) <= kun;
  const ids = new Set([...Object.entries(srs).filter(([, h]) => yaqin(h)).map(([id]) => id), ...Object.entries(lugat).filter(([, h]) => yaqin(h)).map(([id]) => id)]);
  const bolimlar = BARCHA();
  let sozlar = bolimlar.flatMap((b) => b.sozlar).filter((w) => ids.has(w.id));
  let gaplar = bolimlar.filter((b) => b.sozlar.some((w) => ids.has(w.id))).flatMap((b) => b.gaplar);
  if (sozlar.length < 8) {
    const oz = bolimlar.filter((b) => b.sinf === Math.min(11, Math.max(1, Number(sinf) || 1))).slice(0, 2);
    sozlar = [...sozlar, ...oz.flatMap((b) => b.sozlar).filter((w) => !ids.has(w.id))];
    if (gaplar.length < 4) gaplar = [...gaplar, ...oz.flatMap((b) => b.gaplar)];
  }
  return { sozlar, gaplar, yangi: ids.size };
}

/** Variantlar: to'g'ri + n-1 ta boshqa (ma'nosi takrorlanmaydi). */
function variantlar(togri, pool, kalit, rng, n = 4) {
  const bor = new Set([String(kalit(togri)).toLowerCase()]);
  const boshqa = aralash(pool.filter((x) => x.id !== togri.id), rng).filter((x) => { const m = String(kalit(x)).toLowerCase(); if (!m || bor.has(m)) return false; bor.add(m); return true; });
  return aralash([togri, ...boshqa.slice(0, n - 1)], rng);
}

/**
 * Imtihon savollari. turi: haftalik | oylik. Har savol: {konikma, tur, soz|gap, variantlar?}
 *  tinglash — so'z eshitiladi → rasm/ma'no tanlanadi; o'qish — gap o'qiladi → ma'nosi tanlanadi;
 *  yozish — rasm + ma'no ko'rinadi → so'z yoziladi; gapirish — rasm + ma'no → so'zni aytadi (mikrofon).
 */
export function imtihonTuz({ sozlar = [], gaplar = [], turi = "haftalik", iz = "uz", mikBor = true, rng = Math.random } = {}) {
  const n = SONI[turi] || SONI.haftalik;
  const ms = (x) => x.w[iz] || x.w.uz;
  const s = aralash(sozlar, rng);
  const g = aralash(gaplar, rng);
  const olish = (arr, k) => arr.splice(0, k);
  const out = [];
  for (const w of olish(s, n.tinglash)) out.push({ konikma: "tinglash", tur: "rasm", soz: w, variantlar: variantlar(w, sozlar, ms, rng) });
  const oqishGap = olish(g, n.oqish);
  for (const x of oqishGap) out.push({ konikma: "oqish", tur: "gap", gap: x, variantlar: variantlar(x, gaplar, ms, rng, 3) });
  // gap kam bo'lsa — o'qishda so'z (chet tilida yozilgan → ma'nosi)
  for (const w of olish(s, Math.max(0, n.oqish - oqishGap.length))) out.push({ konikma: "oqish", tur: "soz", soz: w, variantlar: variantlar(w, sozlar, ms, rng) });
  for (const w of olish(s, n.yozish)) out.push({ konikma: "yozish", tur: "yoz", soz: w });
  if (mikBor) for (const w of olish(s, n.gapirish)) out.push({ konikma: "gapirish", tur: "ayt", soz: w });
  return out;
}

/** Joylashtirish testi: har CEFR darajasidan JOY_SONI ta savol (so'z: tinglash, o'qish, yozish), osondan qiyinga. */
export function joylashtirishTuz({ iz = "uz", rng = Math.random } = {}) {
  const ms = (x) => x.w[iz] || x.w.uz;
  const out = [];
  CEFR.forEach((c, daraja) => {
    const sozlar = BARCHA().filter((b) => c.sinflar.includes(b.sinf)).flatMap((b) => b.sozlar);
    const tanlov = aralash(sozlar, rng).slice(0, JOY_SONI);
    tanlov.forEach((w, i) => {
      const konikma = ["tinglash", "oqish", "yozish", "tinglash"][i % 4];
      out.push(konikma === "yozish" ? { konikma, tur: "yoz", soz: w, daraja } : { konikma, tur: konikma === "tinglash" ? "rasm" : "soz", soz: w, daraja, variantlar: variantlar(w, sozlar, ms, rng) });
    });
  });
  return out;
}

/** Natija: har ko'nikma bo'yicha foiz, umumiy foiz, baho (2–5). javoblar: [{konikma, ball: 0|0.5|1, daraja?}] */
export function natijaHisob(javoblar = []) {
  const k = {};
  for (const j of javoblar) { const x = (k[j.konikma] ||= { ball: 0, jami: 0 }); x.ball += j.ball; x.jami += 1; }
  const foiz = Object.fromEntries(Object.entries(k).map(([a, x]) => [a, Math.round((x.ball / x.jami) * 100)]));
  const ball = javoblar.reduce((s, j) => s + j.ball, 0);
  const umumiy = javoblar.length ? Math.round((ball / javoblar.length) * 100) : 0;
  const baho = umumiy >= 90 ? 5 : umumiy >= 75 ? 4 : umumiy >= 55 ? 3 : 2;
  return { foiz, umumiy, baho };
}

/** Joylashtirish darajasi: ketma-ket olingan oxirgi daraja (pastki daraja yiqilsa, yuqorisi hisoblanmaydi). */
export function joyDarajasi(javoblar = []) {
  let olingan = -1;
  for (let d = 0; d < CEFR.length; d++) {
    const js = javoblar.filter((j) => j.daraja === d);
    if (!js.length) break;
    const p = js.reduce((s, j) => s + j.ball, 0) / js.length;
    if (p >= JOY_CHEGARA) olingan = d; else break;
  }
  const tavsiya = olingan < 0 ? 1 : Math.min(11, (CEFR[olingan + 1] || CEFR[olingan]).sinflar[0]);
  return { daraja: olingan >= 0 ? CEFR[olingan].kod : null, indeks: olingan, tavsiyaSinf: tavsiya };
}

// — natijalar (shu qurilmada) —
const KEY = "kabutar:maktab:imtihon:v1";
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
export function imtihonlar(til, st = store()) { try { return (JSON.parse(st?.getItem(KEY) || "{}") || {})[til] || {}; } catch { return {}; } }
export function imtihonYoz(til, turi, natija, st = store(), bugun = kunRaqami()) {
  let d = {};
  try { d = JSON.parse(st?.getItem(KEY) || "{}") || {}; } catch { d = {}; }
  d[til] = d[til] || {};
  const tarix = [...(d[til][turi]?.tarix || []), { kun: bugun, umumiy: natija.umumiy, daraja: natija.daraja || null }].slice(-12);
  d[til][turi] = { ...natija, kun: bugun, tarix };
  try { st?.setItem(KEY, JSON.stringify(d)); } catch { /* joy yo'q */ }
  return d[til][turi];
}
/** Haftalik imtihon shu hafta (dushanbadan) topshirilganmi. bugunHafta — Date.getDay() (0 — yakshanba). */
export function buHaftaTopshirildi(h, bugun = kunRaqami(), haftaKuni = new Date().getDay()) {
  if (!h?.kun) return false;
  const dushanbagacha = (haftaKuni + 6) % 7;
  return h.kun >= bugun - dushanbagacha;
}

/** So'zlardan hisoblangan daraja + joylashtirish testi natijasi: test yuqoriroq bo'lsa — test darajasi ko'rsatiladi. */
export function joyBilanDaraja(drSoz, joyKod) {
  const joyI = joyKod ? CEFR.findIndex((c) => c.kod === joyKod) : -1;
  if (joyI <= (drSoz?.indeks ?? -1)) return drSoz;
  const k = CEFR[joyI + 1];
  const foiz = k ? Math.min(100, Math.round((drSoz.ulushlar?.[joyI + 1] || 0) / 0.7)) : 100;
  return { ...drSoz, daraja: CEFR[joyI].kod, indeks: joyI, keyingi: k?.kod || null, foiz, yaqin: Boolean(k) && foiz >= 60, joy: true };
}
