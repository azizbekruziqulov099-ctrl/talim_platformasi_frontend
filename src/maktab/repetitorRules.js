// REV172: Repetitor (1–11 sinf) — sof qoidalar (brauzersiz sinaladi).
// Bog'chadagi kabi: ustoz so'zni aytadi, harflab aytadi, qanday yozilishini ko'rsatadi; bola daftarga ko'p marta yozadi
// (1–2 sinf 10, 3–4 sinf 20, 5–11 sinf 40 marta; xato bo'lsa +10; spiral takrorlarda jami 100 tagacha), eshitib yozadi,
// o'zbekcha↔chet tili ikki tomonga tarjima qiladi. Har so'z shaxsiy lug'atga tushadi va oraliqli takrorlash bilan qaytadi
// (0, 1, 2, 4, 7, 15, 30 kun). Holat shu qurilmada saqlanadi.
import { kunRaqami } from "../kid/xonalar/xonaRules.js";
import { tozala, harakatsiz, yozuvniTekshir, BOSHLIQSIZ } from "../til/mashqRules.js";

export const REP_ORALIQ = [0, 1, 2, 4, 7, 15, 30];
export const REP_PUXTA = 5;            // 5-qutidan boshlab «puxta»
export const YOZISH_CHEGARA = 100;     // bir so'zni jami ko'pi bilan shuncha marta yozdiramiz
const KEY = "kabutar:repetitor:v1";

/** Sinfga mos: bir darsda nechta yangi so'z va bitta so'zni daftarga necha marta yozish. */
export function sinfSozlamasi(sinf = 1) {
  const n = Math.min(11, Math.max(1, Number(sinf) || 1));
  if (n <= 2) return { yangi: 3, takror: 5, yozish: 10, qadam: 1, terish: true };
  if (n <= 4) return { yangi: 4, takror: 6, yozish: 20, qadam: 5, terish: false };
  return { yangi: 5, takror: 8, yozish: 40, qadam: 10, terish: false };
}

/** Bugun shu so'zni necha marta yozish kerak (spiral): yangi so'z — to'liq; takrorda — kamroq; xatolar uchun +10; jami 100 dan oshmaydi. */
export function yozishMaqsadi(sinf, h = null) {
  const s = sinfSozlamasi(sinf);
  const yozildi = h?.yozildi || 0;
  const qolgan = Math.max(0, YOZISH_CHEGARA - yozildi);
  let bugun = !h || !yozildi ? s.yozish : Math.max(s.qadam, Math.round(s.yozish / 2));
  bugun += Math.min(3, h?.xatoKetma || 0) * 10;
  return Math.max(qolgan > 0 ? Math.min(bugun, qolgan) : 0, 0);
}

/** Harflab aytish uchun: «c, a, t». Xitoy/yapon/koreys — belgilab. Bo'shliq — «/». */
export function harflab(soz = "") {
  return [...String(soz).normalize("NFC")].map((c) => (/\s/.test(c) ? "/" : c)).filter((c) => c !== "-").join(", ").replace(/(, \/)+, /g, " / ");
}
/** Ko'rsatish uchun harflar ro'yxati (bo'shliqlarsiz). */
export const harfRoyxati = (soz = "") => [...String(soz).normalize("NFC")].filter((c) => /[\p{L}\p{N}]/u.test(c));

/**
 * Yozilganni tekshirish + harfma-harf farq: [{c, h: "ok" | "xato" | "yoq" | "ortiqcha"}] — to'g'ri so'z harflari bo'yicha
 * (xato harf qizil, tushib qolgan harf — sariq, ortiqcha harf — chizilgan). holat: togri | deyarli | xato.
 */
export function tekshir(kiritilgan, togri, til = "") {
  const baho = yozuvniTekshir(kiritilgan, togri, til);
  const bosh = BOSHLIQSIZ.has(til);
  const norm = (s) => { const t = tozala(s); return bosh ? t.replace(/\s+/g, "") : t; };
  const A = [...norm(kiritilgan)];
  const B = [...norm(togri)];
  const Ah = A.map((c) => harakatsiz(c) || c), Bh = B.map((c) => harakatsiz(c) || c);
  const n = A.length, m = B.length;
  const d = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : Ah[i - 1] === Bh[j - 1] ? 0.5 : 1));
  }
  const farq = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const c = A[i - 1] === B[j - 1] ? 0 : Ah[i - 1] === Bh[j - 1] ? 0.5 : 1;
      if (d[i][j] === d[i - 1][j - 1] + c) { farq.unshift({ c: B[j - 1], h: c === 0 ? "ok" : "xato", yozgan: A[i - 1] }); i--; j--; continue; }
    }
    if (j > 0 && d[i][j] === d[i][j - 1] + 1) { farq.unshift({ c: B[j - 1], h: "yoq" }); j--; continue; }
    farq.unshift({ c: A[i - 1], h: "ortiqcha" }); i--;
  }
  return { holat: baho.holat, oxshash: baho.oxshash, farq, xatolar: farq.filter((f) => f.h !== "ok").length };
}

// — holat (shu qurilmada) —
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
export function oqiHammasi(st = store()) { try { return JSON.parse(st?.getItem(KEY) || "{}") || {}; } catch { return {}; } }
function yozHammasi(d, st) { try { st?.setItem(KEY, JSON.stringify(d)); } catch { /* joy yo'q */ } }
/** Bir tilning lug'ati: { [sozId]: {quti, keyingi, yozildi, togri, xato, xatoKetma, bolim, sinf, qoshildi, oxirgi} } */
export const lugatOl = (til, st = store()) => oqiHammasi(st)[til] || {};

/** Javob natijasi bilan so'z holatini yangilash (oraliqli takrorlash). yozdi — bugun daftarga necha marta yozdi. */
export function repYangila(h, togri, { bugun = kunRaqami(), yozdi = 0, bolim = "", sinf = 0 } = {}) {
  const eski = h || { quti: 0, keyingi: bugun, yozildi: 0, togri: 0, xato: 0, xatoKetma: 0, qoshildi: bugun };
  const quti = togri ? Math.min(REP_ORALIQ.length - 1, (eski.quti || 0) + 1) : Math.max(0, Math.min(1, (eski.quti || 0) - 2));
  return {
    ...eski,
    quti,
    keyingi: bugun + (togri ? REP_ORALIQ[quti] : 1),
    yozildi: Math.min(YOZISH_CHEGARA * 2, (eski.yozildi || 0) + Math.max(0, Number(yozdi) || 0)),
    togri: (eski.togri || 0) + (togri ? 1 : 0),
    xato: (eski.xato || 0) + (togri ? 0 : 1),
    xatoKetma: togri ? 0 : (eski.xatoKetma || 0) + 1,
    bolim: bolim || eski.bolim || "",
    sinf: sinf || eski.sinf || 0,
    oxirgi: bugun,
  };
}
export function repBelgila(til, id, togri, opts = {}, st = store()) {
  const d = oqiHammasi(st);
  d[til] = d[til] || {};
  d[til][id] = repYangila(d[til][id], togri, opts);
  yozHammasi(d, st);
  return d[til][id];
}
/** Faqat daftarga yozilganini qo'shish (javobsiz). */
export function yozildiQosh(til, id, n, opts = {}, st = store()) {
  const d = oqiHammasi(st);
  d[til] = d[til] || {};
  const bugun = opts.bugun ?? kunRaqami();
  const h = d[til][id] || { quti: 0, keyingi: bugun, yozildi: 0, togri: 0, xato: 0, xatoKetma: 0, qoshildi: bugun, bolim: opts.bolim || "", sinf: opts.sinf || 0 };
  d[til][id] = { ...h, yozildi: Math.min(YOZISH_CHEGARA * 2, (h.yozildi || 0) + Math.max(0, Number(n) || 0)), oxirgi: bugun };
  yozHammasi(d, st);
  return d[til][id];
}

/** Bugungi kun takrorlanadigan so'zlar (muddati kelgan), eng eskisi birinchi. */
export function muddatiKelgan(lugat = {}, bugun = kunRaqami()) {
  return Object.entries(lugat).filter(([, h]) => (h?.keyingi ?? 0) <= bugun).sort((a, b) => (a[1].keyingi - b[1].keyingi) || (a[1].quti - b[1].quti)).map(([id]) => id);
}

/**
 * Repetitor sessiyasi: avval o'tgan darslardan muddati kelgan so'zlar (takror), keyin shu bo'limning hali o'rganilmagan so'zlari (yangi).
 * sozlar — barcha mavjud so'zlar xaritasi {id: w}. Faqat takror: bolim = null.
 */
export function sessiya({ bolim = null, sinf = 1, lugat = {}, sozlar = {}, bugun = kunRaqami(), faqatTakror = false } = {}) {
  const s = sinfSozlamasi(sinf);
  const takror = muddatiKelgan(lugat, bugun).filter((id) => sozlar[id]).slice(0, s.takror).map((id) => ({ soz: sozlar[id], yangi: false }));
  if (faqatTakror || !bolim) return takror;
  const bor = new Set(takror.map((x) => x.soz.id));
  const yangi = (bolim.sozlar || []).filter((w) => !lugat[w.id] && !bor.has(w.id)).slice(0, s.yangi).map((w) => ({ soz: w, yangi: true }));
  // bo'limning hamma so'zi lug'atda bo'lsa — eng zaif 3 tasi qayta
  const zaif = !yangi.length ? (bolim.sozlar || []).filter((w) => !bor.has(w.id)).sort((a, b) => (lugat[a.id]?.quti || 0) - (lugat[b.id]?.quti || 0)).slice(0, 3).map((w) => ({ soz: w, yangi: false })) : [];
  return [...takror, ...yangi, ...zaif];
}

/** Bitta so'z ustida mashqlar ketma-ketligi. Yangi so'z — tanishuvdan boshlab; takror — tanishuvsiz. */
export function bosqichlar(sinf = 1, yangi = true) {
  const b = [];
  if (yangi) b.push("tanish");
  b.push("daftar", "eshit", "uzdan");
  if (sinf >= 3) b.push("tildan");
  return b;
}

/** Lug'at ko'rinishi uchun: so'zlar ro'yxati (puxta emaslari va muddati kelganlari birinchi). */
export function lugatRoyxati(lugat = {}, sozlar = {}, bugun = kunRaqami()) {
  return Object.entries(lugat).filter(([id]) => sozlar[id]).map(([id, h]) => ({
    soz: sozlar[id], h, muddat: (h.keyingi ?? 0) <= bugun, puxta: (h.quti || 0) >= REP_PUXTA, qoldi: Math.max(0, (h.keyingi ?? 0) - bugun),
  })).sort((a, b) => (Number(b.muddat) - Number(a.muddat)) || (a.h.quti - b.h.quti) || (a.qoldi - b.qoldi));
}

/** Sessiya natijasidan yulduz: xatosiz — 3, 1–2 xato — 2, ko'proq — 1. */
export const repYulduz = (xato, jami) => (!jami ? 0 : xato === 0 ? 3 : xato <= Math.max(2, Math.round(jami * 0.25)) ? 2 : 1);

/** Uchta tanlov (ma'nosi bo'yicha): to'g'ri + 2 ta boshqa so'z. */
export function manoVariantlari(w, pool = [], rng = Math.random, n = 3) {
  const boshqa = pool.filter((x) => x.id !== w.id);
  for (let i = boshqa.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [boshqa[i], boshqa[j]] = [boshqa[j], boshqa[i]]; }
  const list = [w, ...boshqa.slice(0, n - 1)];
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  return list;
}
