// REV127: O'yin xonalari — sof qoidalar (brauzersiz sinaladi): so'z va gaplar, yoshga mos rejimlar,
// raundlar, ovozli javobni baholash, narsalarning xonadagi joyi.
import { SOZLAR, GAPLAR, IZOH, XONALAR, VAZIFALAR, BUYRUQLAR, BUYRUQ_XONA, TURKUM } from "./xonaLugat.js";
import { izohTeg } from "../izohTil.js";
import { gradeSpeech } from "../../speech/speakRules.js";

export const IZOH_TILLARI = ["uz", "ru", "en"];

/** So'z o'rganiladigan tilda (bo'lmasa inglizcha). */
export function soz(id, til) {
  const w = SOZLAR[id]?.w || {};
  return w[til] || w.en || id;
}
/** So'zning izoh tilidagi ma'nosi. */
export function manosi(id, izoh) {
  const w = SOZLAR[id]?.w || {};
  return w[IZOH_TILLARI.includes(izoh) ? izoh : "uz"] || w.uz || id;
}
/** Ovoz uchun teg: o'zbekcha tegsiz, boshqa til — [xx]…[/xx]. */
export const teg = (text, til) => (!text ? "" : til === "uz" ? text : `[${til}]${text}[/${til}]`);

/** Gap o'rganiladigan tilda (x — so'z o'rni). */
export function gap(key, til, x = "") {
  const g = GAPLAR[key] || {};
  return String(g[til] || g.en || "").replace("{x}", x);
}

/** Ustozning izoh tilidagi gapi; {t} — o'rganiladigan tildagi so'z (o'z ovozida), {i} — ma'nosi. Ovozga tayyor (teglangan). */
export function izohGap(key, izoh, { t = "", til = "en", i = "" } = {}) {
  const lang = IZOH_TILLARI.includes(izoh) ? izoh : "uz";
  const tpl = (IZOH[key] || {})[lang] || "";
  const [old, yangi = ""] = tpl.replace("{i}", i).split("{t}");
  const qism = (part) => (part ? izohTeg(part, lang) : "");
  return tpl.includes("{t}") ? `${qism(old)}${teg(t, til)}${qism(yangi)}` : qism(old);
}
/** Izoh gapi — ekranda ko'rsatish uchun (tegsiz). */
export function izohMatn(key, izoh, { t = "", i = "" } = {}) {
  const lang = IZOH_TILLARI.includes(izoh) ? izoh : "uz";
  return ((IZOH[key] || {})[lang] || "").replace("{i}", i).replace("{t}", t);
}

/** Yosh guruhi: «2-3 yosh» → kichik, «4-5» → orta, «6-7» va maktab → katta. */
export function yoshGuruhi(grade = "") {
  const m = /(\d+)/.exec(String(grade || ""));
  const n = m ? Number(m[1]) : 4;
  if (/sinf|class|grade/i.test(String(grade)) || n >= 6) return "katta";
  return n <= 3 ? "kichik" : "orta";
}

/** Yoshga mos rejimlar. REV128: 2–3 yosh — 4 ta oddiy o'yin; 4–5 yosh — 7 ta; 6–7 yosh — 8 ta (ketma-ketlik bilan).
 *  «Yordam ber» — qahramonlar topshirig'i bor xonada; «Ustoz aytdi» — buyruqlar bor xonada (sinf, tanam). */
export function rejimlar(yosh, xonaId) {
  const yordam = BUYRUQ_XONA[xonaId] ? "buyruq" : VAZIFALAR[xonaId] ? "yordam" : null;
  const r = ["kashf", "top", "xotira", yordam];
  if (yosh !== "kichik") r.push("ayt", "yoqoldi", "ortiqcha");
  if (yosh === "katta") r.push("tartib");
  return r.filter(Boolean);
}
/** Bir o'yindagi savollar soni. */
export const raundSoni = (yosh) => (yosh === "kichik" ? 4 : yosh === "orta" ? 6 : 8);

/** Aralashtirish (rng beriladi — sinovda bir xil natija). */
export function aralashtir(list, rng = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export const xona = (id) => XONALAR.find((x) => x.id === id) || null;
export const hammasi = (x) => [...(x?.narsalar || []), ...(x?.odamlar || [])];

/** Rejim savollari. REV128: so'zlar takrorlash tizimi (SRS) bo'yicha tanlanadi — vaqti kelgan so'zlar avval,
 *  keyin 2–3 ta yangi so'z, qolgani — bilganlaridan. Shunda o'yin har kuni boshqacha va so'zlar haftalar davomida mustahkamlanadi. */
export function savollar(rejim, xonaId, yosh, rng = Math.random, srs = null, bugun = kunRaqami()) {
  const x = xona(xonaId);
  if (!x) return [];
  const n = raundSoni(yosh);
  if (rejim === "yordam") return aralashtir(VAZIFALAR[xonaId] || [], rng).slice(0, Math.min(n, 6));
  if (rejim === "buyruq") { const l = BUYRUQ_XONA[xonaId] || BUYRUQLAR; return aralashtir(l, rng).slice(0, Math.min(n, l.length)); }
  const pool = rejim === "ayt" ? x.narsalar : hammasi(x);
  return tanlaSRS(pool, n, srs, rng, bugun, yosh === "kichik" ? 2 : 3).map((id) => ({ id }));
}

/** Buyruq uchun 3 ta rasm: to'g'risi va 2 ta boshqasi (o'sha xonaning buyruqlaridan). */
export function buyruqVariantlari(togri, rng = Math.random, xonaId = "sinf") {
  const l = BUYRUQ_XONA[xonaId] || BUYRUQLAR;
  const boshqa = aralashtir(l.filter((b) => b.id !== togri), rng).slice(0, 2).map((b) => b.id);
  return aralashtir([togri, ...boshqa], rng);
}

// ———— REV128: takrorlash tizimi (Leitner qutilari) ————
/** Kun raqami (mahalliy vaqt bo'yicha). */
export function kunRaqami(d = new Date()) {
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
}
/** Quti → keyingi takrorgacha kunlar. 5-quti — puxta o'rganilgan. */
export const ORALIQ = [0, 1, 2, 4, 7, 14];
export const PUXTA = 4;
/** Bitta javobdan keyin so'z holati: to'g'ri — keyingi quti (bir kunda faqat bir marta ko'tariladi), xato — bir quti pastga. */
export function srsYangila(holat, togri, bugun = kunRaqami()) {
  const h = { quti: 0, keyin: bugun, oxirgi: -1, togri: 0, xato: 0, ...(holat || {}) };
  if (togri) {
    h.togri += 1;
    if (h.oxirgi !== bugun || h.quti === 0) h.quti = Math.min(ORALIQ.length - 1, h.quti + 1);
    h.keyin = bugun + ORALIQ[h.quti];
  } else {
    h.xato += 1;
    h.quti = Math.max(0, h.quti - 1);
    h.keyin = bugun;
  }
  h.oxirgi = bugun;
  return h;
}
/** Hovuzdan n ta so'z: 1) vaqti kelgan (eng past quti avval), 2) ko'pi bilan `yangi` ta yangi so'z, 3) qolgan bilganlari. */
export function tanlaSRS(pool, n, srs, rng = Math.random, bugun = kunRaqami(), yangi = 3) {
  const s = srs || {};
  const korilgan = pool.filter((id) => s[id]);
  const vaqti = aralashtir(korilgan.filter((id) => s[id].keyin <= bugun), rng).sort((a, b) => s[a].quti - s[b].quti);
  const yangilar = aralashtir(pool.filter((id) => !s[id]), rng);
  const out = [...vaqti.slice(0, n)];
  for (const id of yangilar) { if (out.length >= n || out.filter((x) => !s[x]).length >= yangi) break; out.push(id); }
  const qolgan = aralashtir(pool.filter((id) => !out.includes(id)), rng).sort((a, b) => (s[a]?.quti ?? 9) - (s[b]?.quti ?? 9));
  for (const id of qolgan) { if (out.length >= n) break; out.push(id); }
  return aralashtir(out.slice(0, n), rng);
}
/** Xona bo'yicha: necha so'z puxta o'rganilgan (0..1). */
export function xonaPuxta(xonaId, srs) {
  const ids = hammasi(xona(xonaId));
  if (!ids.length) return 0;
  return ids.filter((id) => (srs?.[id]?.quti || 0) >= PUXTA).length / ids.length;
}

// ———— REV128: yangi o'yinlar ————
/** Xotira: juft kartalar (kichik — 3, o'rta — 4, katta — 6 juft). */
export function xotiraKartalar(pool, yosh, rng = Math.random, srs = null) {
  const juft = yosh === "kichik" ? 3 : yosh === "orta" ? 4 : 6;
  const ids = tanlaSRS(pool, juft, srs, rng, kunRaqami(), juft);
  return aralashtir([...ids, ...ids].map((id, i) => ({ k: i, id })), rng);
}
/** «Nima yo'qoldi?»: ko'rsatiladigan narsalar, yo'qolgani va 3 ta javob varianti. */
export function yoqoldiSavol(pool, yosh, rng = Math.random, srs = null) {
  const n = yosh === "katta" ? 5 : 4;
  const korsat = tanlaSRS(pool, n, srs, rng);
  const yoq = korsat[Math.floor(rng() * korsat.length)];
  const qolgan = korsat.filter((id) => id !== yoq);
  const boshqa = aralashtir(pool.filter((id) => !korsat.includes(id)), rng).slice(0, 2);
  return { korsat, yoq, qolgan, variantlar: aralashtir([yoq, ...(boshqa.length === 2 ? boshqa : qolgan.slice(0, 2))], rng) };
}
const turkumi = (id) => Object.keys(TURKUM).find((k) => TURKUM[k].includes(id)) || null;
/** «Qaysi biri ortiqcha?»: 3 ta bir turkumdan (iloji bo'lsa — xonadagi so'zlardan), 1 tasi boshqa turkumdan. */
export function ortiqchaSavol(pool, rng = Math.random) {
  const turkumlar = aralashtir(Object.keys(TURKUM).filter((k) => TURKUM[k].length >= 3), rng)
    .sort((a, b) => TURKUM[b].filter((id) => pool.includes(id)).length - TURKUM[a].filter((id) => pool.includes(id)).length);
  const asosiy = turkumlar[Math.floor(rng() * Math.min(3, turkumlar.length))];
  const ichida = TURKUM[asosiy].filter((id) => pool.includes(id));
  const uchta = aralashtir(ichida.length >= 3 ? ichida : TURKUM[asosiy], rng).slice(0, 3);
  const boshqaTurkum = aralashtir(Object.keys(TURKUM).filter((k) => k !== asosiy && !(asosiy === "meva" && k === "ovqat") && !(asosiy === "ovqat" && k === "meva")), rng)[0];
  const begona = aralashtir(TURKUM[boshqaTurkum].filter((id) => pool.includes(id)).concat(TURKUM[boshqaTurkum]), rng)[0];
  return { turkum: asosiy, begona, variantlar: aralashtir([...uchta, begona], rng) };
}
export { turkumi };
/** Ketma-ketlik: 2–4 ta so'z (har yutuqda bittaga uzayadi). */
export function tartibSavol(pool, uzunlik, rng = Math.random) {
  return aralashtir(pool, rng).slice(0, Math.max(2, Math.min(5, uzunlik)));
}

const ARTIKL = {
  de: /^(der|die|das)\s+/i, fr: /^(le|la|les|l['’]|un|une)\s*/i, es: /^(el|la|los|las|un|una)\s+/i,
};
/** Bola aytishi mumkin bo'lgan shakllar: to'liq va artiklsiz («der Apfel» → «Apfel»; «التفاحة» → «تفاحة»). */
export function aytishShakllari(word, til) {
  const w = String(word || "").trim();
  const out = new Set([w]);
  if (ARTIKL[til]) out.add(w.replace(ARTIKL[til], ""));
  if (til === "ar") out.add(w.split(/\s+/).map((p) => p.replace(/^ال/, "")).join(" "));
  return [...out].filter(Boolean);
}
/** Eshitilgan variantlar → yulduz (0–3). 2 va undan ko'p — to'g'ri. */
export function baho(alternativlar, word, til) {
  let best = { score: 0, stars: 0 };
  for (const shakl of aytishShakllari(word, til)) {
    const g = gradeSpeech(alternativlar, shakl, til);
    if (g.score > best.score) best = g;
  }
  return { ...best, togri: best.stars >= 2 };
}

/** Qahramon ovozi: ayollar va qizlar — ayol ovozi, qolganlari — erkak ovozi. */
const AYOL = new Set(["mother", "sister", "granny", "girl", "teacher", "aunt"]);   // REV128: yangi ustoz rasmi — ayol
export const ovozJinsi = (kim) => (!kim ? "qiz" : AYOL.has(kim) ? "qiz" : "ogil");

/** Xonadagi joylar: narsalar va qahramonlar ({id, x, y, s, a}) hamda fondagi bosiladigan joylar ({id, x, y, w, h, hs: true}). */
export function joylash(xonaId) {
  const x = xona(xonaId);
  if (!x) return [];
  return [
    ...x.hs.map(([id, px, py, w, h]) => ({ id, x: px, y: py, w, h, hs: true })),
    ...x.joylar.map(([id, px, py, s, a = 1]) => ({ id, x: px, y: py, s, a })),
  ];
}

/** Shu qurilmada o'yin natijasi: har til uchun xonalar (topilgan so'zlar, yulduzlar) va so'zlar holati (srs). */
const KEY = "kabutar:xonalar:v1";
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
export function natija(st = store()) {
  try { return JSON.parse(st?.getItem(KEY) || "{}") || {}; } catch { return {}; }
}
function yoz(data, st) { try { st?.setItem(KEY, JSON.stringify(data)); } catch { /* joy yo'q */ } }
export function saqlash(til, xonaId, { kashf = [], yulduz = 0 } = {}, st = store()) {
  const data = natija(st);
  const t = (data[til] = data[til] || {});
  const x = (t[xonaId] = t[xonaId] || { kashf: [], yulduz: 0 });
  x.kashf = [...new Set([...(x.kashf || []), ...kashf])];
  x.yulduz = (x.yulduz || 0) + yulduz;
  yoz(data, st);
  return data;
}
/** So'zlar holati (takrorlash tizimi) — til bo'yicha. */
export function srsOl(til, st = store()) { return natija(st)[`srs:${til}`] || {}; }
export function srsYoz(til, id, togri, st = store(), bugun = kunRaqami()) {
  const data = natija(st);
  const k = `srs:${til}`;
  data[k] = data[k] || {};
  data[k][id] = srsYangila(data[k][id], togri, bugun);
  yoz(data, st);
  return data[k];
}

/**
 * REV148: xona qismlari — narsalar yaqinligiga qarab guruhlarga bo'linadi (har qismda 3–4 ta narsa). Har qism uchun
 * kamera to'rtburchagi (sahna foizida, sahna nisbatida): o'yinda kamera shu qismga yaqinlashadi — narsalar 2–3 barobar
 * katta ko'rinadi (kichik ekranda ham aniq). Qaytaradi: [{ ids, x, y, w, h }] o'qish tartibida (yuqoridan pastga, chapdan o'ngga).
 */
const tomonOl = (g, chet) => Math.max(
  Math.max(...g.map((q) => q.cx + q.w / 2)) - Math.min(...g.map((q) => q.cx - q.w / 2)) + 2 * chet,
  Math.max(...g.map((q) => q.cy + q.h / 2)) - Math.min(...g.map((q) => q.cy - q.h / 2)) + 2 * chet);
export function qismlar(xonaId, { har = 4, minTomon = 34, maxTomon = 56, chet = 5 } = {}) {
  const x = xona(xonaId);
  if (!x) return [];
  const n = Number(x.nisbat) || 4 / 3;
  const quti = joylash(xonaId).map((p) => {
    const w = p.hs ? p.w : p.s;
    const h = p.hs ? p.h : (p.s * n) / (p.a || 1);
    return { id: p.id, cx: p.x, cy: p.y, w, h, X: p.x, Y: p.y / n };
  });
  const qoldi = [...quti].sort((a, b) => (Math.floor(a.cy / 22) - Math.floor(b.cy / 22)) || (a.cx - b.cx));
  const guruhlar = [];
  while (qoldi.length) {
    const bosh = qoldi.shift();
    const g = [bosh];
    const nomzod = qoldi.map((q) => ({ q, d: Math.hypot(q.X - bosh.X, q.Y - bosh.Y) })).filter((v) => v.d < 30).sort((a, b) => a.d - b.d);
    for (const { q } of nomzod) {
      if (g.length >= har) break;
      if (tomonOl([...g, q], chet) > maxTomon) continue;   // qism juda kattalashib ketmasin (kamera yaqinlashishi kamaymasin)
      g.push(q); qoldi.splice(qoldi.indexOf(q), 1);
    }
    guruhlar.push(g);
  }
  // juda kichik (1 ta narsali) guruhni eng yaqin guruhga qo'shamiz — qismlar soni ortiqcha ko'paymasin
  for (let i = guruhlar.length - 1; i >= 0 && guruhlar.length > 2; i -= 1) {
    if (guruhlar[i].length > 1) continue;
    const [p] = guruhlar[i];
    let eng = -1, d = Infinity;
    guruhlar.forEach((g, j) => { if (j === i) return; for (const q of g) { const dd = Math.hypot(q.X - p.X, q.Y - p.Y); if (dd < d) { d = dd; eng = j; } } });
    if (eng >= 0 && d < 34 && guruhlar[eng].length < har + 1 && tomonOl([...guruhlar[eng], p], chet) <= maxTomon) { guruhlar[eng].push(p); guruhlar.splice(i, 1); }
  }
  const out = guruhlar.map((g) => {
    const x0 = Math.min(...g.map((q) => q.cx - q.w / 2)), x1 = Math.max(...g.map((q) => q.cx + q.w / 2));
    const y0 = Math.min(...g.map((q) => q.cy - q.h / 2)), y1 = Math.max(...g.map((q) => q.cy + q.h / 2));
    const tomon = Math.min(100, Math.max(minTomon, x1 - x0 + 2 * chet, y1 - y0 + 2 * chet));
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const px = Math.max(0, Math.min(100 - tomon, cx - tomon / 2));
    const py = Math.max(0, Math.min(100 - tomon, cy - tomon / 2));
    return { ids: g.map((q) => q.id), x: +px.toFixed(2), y: +py.toFixed(2), w: +tomon.toFixed(2), h: +tomon.toFixed(2) };
  });
  return out.sort((a, b) => (Math.floor((a.y + a.h / 2) / 25) - Math.floor((b.y + b.h / 2) / 25)) || (a.x - b.x));
}

/** Narsa qaysi qismda (indeks), topilmasa -1. */
export const qismIndeks = (qs, id) => qs.findIndex((q) => q.ids.includes(id));
