// REV177: darsdan OLDIN spiral takror (1–11 sinf, hamma fan va tillarda) — bolalar darsidagidek, lekin yoshga mos:
//  1) 🌀 spiral — oldingi 5–6 darsdan bittadan savol, oraliq kengayib boradi (1, 2, 3, 5, 8, 13 dars oldin):
//     til darsida Kabu so'zning ma'nosini aytadi → o'quvchi so'zni AYTADI (mikrofon) va YOZADI; boshqa fanlarda — o'sha darsning test savoli;
//  2) ✍️ erkin eslash — o'tgan darsdan esida qolgan 4–5 ta so'z / tushunchani o'zi yozadi (hech qanday yordamsiz), Kabu qolganlarini aytib beradi.
// Hamma miyaga (o'zbek, rus, ingliz izohli; har qanday til) avtomatik moslashadi — miya fayllarini qayta yozish shart emas:
// dars tugaganda uning so'zlari, test savollari va asosiy tushunchalari shu qurilmada saqlanadi.
// Sof funksiyalar (brauzersiz sinaladi).
import { kunRaqami } from "../kid/xonalar/xonaRules.js";

export const SPIRAL_ORALIQ = [1, 2, 3, 5, 8, 13];   // necha dars oldin (Fibonachchi kabi kengayadi)
const KEY = "kabutar:maktab:darslar:v1";
const KEY_BUGUN = "kabutar:maktab:takror-bugun:v1";
const MAX_DARS = 40;
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
const oqi = (st, k) => { try { return JSON.parse(st?.getItem(k) || "{}") || {}; } catch { return {}; } };
const yoz = (st, k, v) => { try { st?.setItem(k, JSON.stringify(v)); } catch { /* joy yo'q */ } };

/** Fan kaliti: «Nemis tili (izoh: rus)» va «Nemis tili» — bitta fan (izoh tili farq qilmaydi). */
export const fanKaliti = (fan = "") => String(fan).replace(/\s*\(izoh:[^)]*\)\s*/i, "").trim().toLowerCase();

/**
 * Yoshga mos miqdor (REV178): o'tgan darsning HAMMA yangi so'zlari (1–2 sinf — 6 tagacha, kattalar — 8 tagacha),
 * qo'shimcha spiral — eski darslardan (2, 3, 5, 8, 13 dars oldin) 3–4 ta; erkin eslash maqsadi 4–5.
 */
export function takrorSoni(sinf = 5) {
  const s = Number(sinf) || 5;
  return s <= 2 ? { oxirgi: 6, spiral: 3, erkin: 4 } : { oxirgi: 8, spiral: 4, erkin: 5 };
}

const TEG = /\[\/?[a-z]{2}\]/g;
const EMOJI = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[⃣️‍])+/gu;
const toza = (s) => String(s || "").replace(TEG, "").replace(EMOJI, "").replace(/\s+/g, " ").trim();
const tegli = (s) => String(s || "").replace(EMOJI, "").replace(/\s+/g, " ").trim();

/** Darsning asosiy tushunchalari — qadam sarlavhalaridan (kirish, sana, test qadamlari tashlanadi). */
export function atamalar(steps = []) {
  const out = [];
  for (const s of steps) {
    if (!s || s._maktabSana || s.turi === "kirish" || s.turi === "test" || s.turi === "xulosa") continue;
    const t = toza(String(s.sarlavha || "").split(/\s[—–-]\s/)[0]).replace(/[.:!?]+$/, "");
    if (t.length < 3 || t.length > 48 || !/\p{L}/u.test(t)) continue;
    if (!out.some((x) => x.toLowerCase() === t.toLowerCase())) out.push(t);
  }
  return out.slice(0, 12);
}

/** Dars yozuvi (saqlash uchun). sozlar — maktabDarsSozlari() natijasi; savollar — darsning test savollari. */
export function darsYozuvi({ kod, mavzu = "", fan = "", til = "", iz = "uz", steps = [], sozlar = [], savollar = [], kun = kunRaqami() }) {
  return {
    kod: String(kod || ""), mavzu: toza(mavzu), fan, til, kun,
    // REV178: ma'no qaysi tilda yozilgani ham saqlanadi (keyin interfeys tili o'zgarsa — to'g'ri tilda ko'rsatish uchun)
    sozlar: sozlar.map((w) => ({ soz: toza(w.w?.[til] || Object.values(w.w || {})[0]), mano: toza(w.w?.[iz] || w.w?.uz || ""), manoTil: w.w?.[iz] ? iz : "uz", emoji: w.emoji || "" }))
      .filter((w) => w.soz && w.mano).slice(0, 16),
    savollar: savollar.filter((q) => q && Array.isArray(q.variantlar) && q.variantlar.length >= 2 && Number.isInteger(q.togri))
      // REV180: ovoz uchun asl teglar ham saqlanadi ([de]Das ist …[/de] [en]Which one is «yes»?[/en]) — har qism o'z talaffuzida o'qilsin
      .map((q) => ({ savol: toza(q.savol), savolTeg: tegli(q.savol), variantlar: q.variantlar.map(toza), variantlarTeg: q.variantlar.map(tegli), togri: q.togri }))
      .filter((q) => q.savol).slice(0, 8),
    atamalar: atamalar(steps),
  };
}

/** Dars tugaganda saqlanadi (bir dars — bitta yozuv, eng oxirgisi yangilanadi). */
export function darsniSaqla(fan, yozuv, st = store()) {
  if (!yozuv?.kod) return;
  const d = oqi(st, KEY);
  const k = fanKaliti(fan);
  // dars qayta o'tilsa — o'z o'rnida yangilanadi (eng yangi bo'lib qolmaydi: 1, 2, 3, 5, 8, 13 dars oralig'i buzilmasin)
  const ro = d[k] || [];
  const i = ro.findIndex((x) => x.kod === yozuv.kod);
  d[k] = i >= 0 ? ro.map((x, j) => (j === i ? { ...yozuv, kun: x.kun } : x)) : [...ro, yozuv].slice(-MAX_DARS);
  yoz(st, KEY, d);
}

/** Oldingi darslar (eng yangisi birinchi), joriy dars hisobga olinmaydi. */
export function oldingiDarslar(fan, joriyKod = "", st = store()) {
  return [...(oqi(st, KEY)[fanKaliti(fan)] || [])].filter((x) => x.kod !== joriyKod).reverse();
}

const aralash = (a, rng) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** Bitta darsdan bitta savol: til darsida — so'z (ayt + yoz), boshqa fanda — test savoli (yoki tushuncha). */
function darsdanSavol(d, rng, olingan) {
  const sozlar = aralash(d.sozlar || [], rng).filter((w) => !olingan.has(`s:${w.soz.toLowerCase()}`));
  if (d.til && sozlar.length) { const w = sozlar[0]; olingan.add(`s:${w.soz.toLowerCase()}`); return { tur: "soz", til: d.til, soz: w.soz, mano: w.mano, manoTil: w.manoTil || "", emoji: w.emoji, kod: d.kod, mavzu: d.mavzu }; }
  const sv = aralash(d.savollar || [], rng).filter((q) => !olingan.has(`q:${q.savol}`));
  if (sv.length) { const q = sv[0]; olingan.add(`q:${q.savol}`); return { tur: "savol", ...q, kod: d.kod, mavzu: d.mavzu }; }
  return null;
}

/**
 * Takror savollari (REV178): avval o'tgan darsning HAMMA yangi so'zlari (`oxirgi` tagacha; boshqa fanda — test savollari, 4 tagacha),
 * keyin eski darslardan SPIRAL_ORALIQ bo'yicha (2, 3, 5, 8, 13 dars oldin) bittadan — `soni` tagacha; kam bo'lsa — eski darslardan to'ldiriladi.
 */
export function spiralTuz(darslar = [], { soni = 4, oxirgi = 8, rng = Math.random } = {}) {
  const birinchi = [];
  const olingan = new Set();
  const d0 = darslar[0];
  if (d0) {
    const n0 = d0.til && d0.sozlar?.length ? oxirgi : Math.min(4, oxirgi);
    const tilDarsi = Boolean(d0.til && d0.sozlar?.length);
    for (let k = 0; k < n0; k++) { const q = darsdanSavol(d0, rng, olingan); if (!q || (tilDarsi && q.tur !== "soz")) break; birinchi.push({ ...q, oldin: 1 }); }
  }
  const out = [];
  for (const n of SPIRAL_ORALIQ.slice(1)) {
    if (out.length >= soni) break;
    const d = darslar[n - 1];
    if (!d) continue;
    const q = darsdanSavol(d, rng, olingan);
    if (q) out.push({ ...q, oldin: n });
  }
  for (let aylana = 0; out.length < soni && aylana < 4; aylana++) {
    let qoshildi = false;
    for (const [i, d] of darslar.slice(1, 13).entries()) {
      if (out.length >= soni) break;
      const q = darsdanSavol(d, rng, olingan);
      if (q) { out.push({ ...q, oldin: i + 2 }); qoshildi = true; }
    }
    if (!qoshildi) break;
  }
  return [...birinchi, ...out];
}

/** Erkin eslash: o'tgan darsning so'zlari (til darsi) yoki asosiy tushunchalari. maqsad — yoshga mos (4–5), lekin bor narsadan oshmaydi. */
export function erkinTuz(oxirgi, maqsad = 5) {
  if (!oxirgi) return null;
  const kutilgan = oxirgi.til && oxirgi.sozlar?.length ? oxirgi.sozlar.map((w) => ({ matn: w.soz, izoh: w.mano }))
    : (oxirgi.atamalar || []).map((a) => ({ matn: a, izoh: "" }));
  if (kutilgan.length < 2) return null;
  return { mavzu: oxirgi.mavzu, til: oxirgi.til || "", kutilgan, maqsad: Math.min(maqsad, kutilgan.length) };
}

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/ß/g, "ss").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
const ARTIKL = /^(der|die|das|the|a|an|le|la|les|l|el|los|las|un|une|una|ein|eine)\s+/;
/** Ikki so'z deyarli bir xilmi (bitta harf xatosi kechiriladi, 5+ harfli so'zda). */
function yaqin(a, b) {
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 5 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  const [x, y] = [a.slice(i), b.slice(i)];
  return x.slice(1) === y.slice(1) || x.slice(1) === y || x === y.slice(1);
}

/**
 * O'quvchi yozgan matndan qaysi so'z / tushunchalar topildi. Til darsida artikl (der/die/das, the…) talab qilinmaydi,
 * bitta harf xatosi kechiriladi; tushunchalarda — asosiy so'zi (4+ harf) yozilgan bo'lsa yetadi.
 */
export function erkinTekshir(yozilgan = "", kutilgan = []) {
  const qismlar = String(yozilgan).split(/[\n,;]+/).map(norm).filter(Boolean);
  const sozlari = new Set(qismlar.flatMap((q) => q.split(" ")));
  const topildi = [];
  const qolgan = [];
  for (const k of kutilgan) {
    const t = norm(k.matn).replace(ARTIKL, "");
    const asosiy = t.split(" ").filter((x) => x.length >= 4);
    const bor = qismlar.some((q) => yaqin(q.replace(ARTIKL, ""), t))
      || (asosiy.length ? asosiy.some((a) => [...sozlari].some((s) => yaqin(s, a))) : sozlari.has(t));
    (bor ? topildi : qolgan).push(k);
  }
  return { topildi, qolgan };
}

/** Bugun shu dars oldidan takror qilinganmi (qayta ochilsa yana so'ralmaydi). */
export function takrorQilindi(kod, st = store(), bugun = kunRaqami()) { return oqi(st, KEY_BUGUN)[kod] === bugun; }
export function takrorBelgila(kod, st = store(), bugun = kunRaqami()) {
  const d = Object.fromEntries(Object.entries(oqi(st, KEY_BUGUN)).filter(([, v]) => v >= bugun - 7));
  d[kod] = bugun;
  yoz(st, KEY_BUGUN, d);
}
