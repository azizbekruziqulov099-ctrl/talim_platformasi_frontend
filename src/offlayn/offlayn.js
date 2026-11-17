// OFLAYN REJIM: dars paketi (dars JSON, test, rasmlar, kurs ro'yxati) telefon xotirasiga yuklanadi va internetsiz ochiladi.
// Ruxsat: paketni faqat o'sha vaqtda serverdan ruxsat olgan (admin — hammasi, o'quvchi — o'z kursi) yuklay oladi,
// chunki yuklash odatdagi dars so'rovlari orqali ketadi (server 402/423 bilan yopiq darsni bermaydi).
// Yuklangan paket OFLAYN_KUN kun amal qiladi; muddat tugasa — bir marta internetga ulanib yangilash kerak.
// Oflayn bajarilgan natijalar (mashq/dars tugadi) navbatga yoziladi va internet kelganda serverga yuboriladi.

export const OFLAYN_KESH = "kabutar-offlayn";      // sw.js «samtm-» keshlarini tozalaydi — nom shuning uchun boshqacha
export const OFLAYN_KUN = 30;
const META = "kb_offlayn_meta";
const NAVBAT = "kb_offlayn_navbat";
const KUN = 86400000;

const ls = {
  o(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v ?? d; } catch { return d; } },
  y(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* xotira to'la */ } },
};

/** URL → kesh kaliti: token, qurilma va vaqt belgisi tushiriladi (ular har safar boshqa). */
export function keshKalit(url) {
  try {
    const u = new URL(url, globalThis.location?.origin || "http://x");
    ["token", "qurilma", "t", "q"].forEach((k) => u.searchParams.delete(k));
    u.searchParams.sort();
    return `${u.origin}${u.pathname}${u.searchParams.toString() ? `?${u.searchParams}` : ""}`;
  } catch { return String(url); }
}

export function meta() { return ls.o(META, { kurslar: {} }); }
export function darsKodi(url) { const m = String(url).match(/\/api\/dars_xonasi\/([^/?]+)/); return m ? decodeURIComponent(m[1]) : ""; }

/** Dars shu qurilmada yuklangan va muddati o'tmaganmi. */
export function yuklangan(topicCode, hozir = Date.now()) {
  const m = meta();
  return Object.values(m.kurslar || {}).some((k) => (k.exp || 0) > hozir && (k.darslar || []).includes(topicCode));
}
export function kursYuklangan(kalit, hozir = Date.now()) {
  const k = meta().kurslar?.[kalit]; return Boolean(k && k.exp > hozir);
}
export function internetYoq(e) { return e instanceof TypeError || e?.name === "TypeError" || globalThis.navigator?.onLine === false; }

async function keshOch() { return globalThis.caches ? caches.open(OFLAYN_KESH) : null; }
async function yozKesh(url, javob) { const c = await keshOch(); if (c) await c.put(keshKalit(url), javob); }
async function olKesh(url) { const c = await keshOch(); return c ? c.match(keshKalit(url)) : undefined; }

/** fetch + oflayn zaxira: tarmoq xatosida (internet yo'q) va ruxsati bor paketdan javob beradi. */
export async function offlaynFetch(url, opts, { kod = "", saqla = false } = {}) {
  try {
    const r = await fetch(url, opts);
    if (r.ok && saqla) { try { await yozKesh(url, r.clone()); } catch { /* */ } }
    return r;
  } catch (e) {
    if (!internetYoq(e) || (opts && opts.signal && opts.signal.aborted)) throw e;
    const tc = kod || darsKodi(url);
    if (tc && !yuklangan(tc)) throw e;
    const h = await olKesh(url);
    if (h) return h;
    throw e;
  }
}

const rasmlar = (obj) => [...new Set((JSON.stringify(obj).match(/\/api\/ai_miya_media\/\d+/g)) || [])];

/**
 * Kurs paketini yuklash. codes — kursning ochiq darslari topic_code ro'yxati.
 * Natija: {jami, yuklandi, yopiq, xato}. onProgress(i, jami).
 */
export async function kursniYukla({ apiBase, token, qurilma, til = "uz", kalit, nom, codes, katalog = null, onProgress }) {
  const base = String(apiBase || "").replace(/\/+$/, "");
  const saqlandi = [];
  let yopiq = 0, xato = 0;
  for (let i = 0; i < codes.length; i++) {
    onProgress?.(i, codes.length);
    const code = codes[i];
    const qs = new URLSearchParams({ token, til, qurilma: qurilma || "" });
    try {
      const r = await fetch(`${base}/api/dars_xonasi/${encodeURIComponent(code)}?${qs}`);
      if (r.status === 402 || r.status === 423 || r.status === 403) { yopiq++; continue; }
      if (!r.ok) { xato++; continue; }
      const d = await r.clone().json();
      await yozKesh(`${base}/api/dars_xonasi/${encodeURIComponent(code)}?${qs}`, r);
      for (const m of rasmlar(d)) {
        try { const rr = await fetch(`${base}${m}`); if (rr.ok) await yozKesh(`${base}${m}`, rr); } catch { /* bitta rasm tushmasa ham dars ochiladi */ }
      }
      try {   // dars testi (30 ta) ham — «Test» bo'limi ishlashi uchun
        const tq = new URLSearchParams({ token, til, qurilma: qurilma || "", soni: "30" });
        const tr = await fetch(`${base}/api/dars_xonasi/${encodeURIComponent(code)}/test?${tq}`);
        if (tr.ok) {
          const td = await tr.clone().json();
          await yozKesh(`${base}/api/dars_xonasi/${encodeURIComponent(code)}/test?${tq}`, tr);
          for (const m of rasmlar(td)) { try { const rr = await fetch(`${base}${m}`); if (rr.ok) await yozKesh(`${base}${m}`, rr); } catch { /* */ } }
        }
      } catch { /* test yo'q bo'lishi mumkin */ }
      saqlandi.push(code);
    } catch { xato++; }
  }
  if (katalog) { try { await yozKesh(katalog.url, new Response(JSON.stringify(katalog.data), { headers: { "Content-Type": "application/json" } })); } catch { /* */ } }
  const m = meta();
  m.kurslar = { ...(m.kurslar || {}), [kalit]: { nom, darslar: saqlandi, vaqt: Date.now(), exp: Date.now() + OFLAYN_KUN * KUN, til } };
  ls.y(META, m);
  onProgress?.(codes.length, codes.length);
  return { jami: codes.length, yuklandi: saqlandi.length, yopiq, xato };
}

export async function kursniOchir(kalit) {
  const m = meta(); const k = m.kurslar?.[kalit]; if (!k) return;
  delete m.kurslar[kalit]; ls.y(META, m);
  const c = await keshOch(); if (!c) return;
  const qolgan = new Set(Object.values(m.kurslar).flatMap((x) => x.darslar || []));
  for (const rq of await c.keys()) { const tc = darsKodi(rq.url); if (tc && k.darslar.includes(tc) && !qolgan.has(tc)) await c.delete(rq); }
}

// ── natijalar navbati ───────────────────────────────────────────────────────
export function navbatUzunligi() { return ls.o(NAVBAT, []).length; }

/** POST: internet yo'q bo'lsa navbatga yoziladi (3 kungacha), qaytarma {navbatda:true}. */
export async function postNavbat(url, body) {
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return r;
  } catch (e) {
    if (!internetYoq(e)) throw e;
    const q = ls.o(NAVBAT, []); q.push({ url, body, vaqt: Date.now() });
    ls.y(NAVBAT, q.slice(-200));
    return { ok: true, navbatda: true, status: 202, json: async () => ({ navbatda: true }) };
  }
}

let yuboryapti = false;
export async function navbatniYubor() {
  if (yuboryapti) return 0;
  const q = ls.o(NAVBAT, []); if (!q.length) return 0;
  yuboryapti = true; let ketdi = 0; const qolgan = [];
  try {
    for (const it of q) {
      if (Date.now() - it.vaqt > 3 * KUN) continue;
      try {
        const r = await fetch(it.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(it.body) });
        if (r.ok || (r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429)) ketdi++; else qolgan.push(it);
      } catch { qolgan.push(it); }
    }
  } finally { ls.y(NAVBAT, qolgan); yuboryapti = false; }
  return ketdi;
}

export function navbatniKuzat() {
  if (typeof window === "undefined" || window.__kbNavbat) return;
  window.__kbNavbat = true;
  window.addEventListener("online", () => { navbatniYubor(); });
  setTimeout(() => { if (navigator.onLine !== false) navbatniYubor(); }, 4000);
}
