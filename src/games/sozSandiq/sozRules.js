// REV695: «So'z sandig'i» — rasmli so'z bazasidan til o'yinlari. Sof qoidalar (brauzersiz sinaladi).
// So'z: { k: kalit, f: rasm fayli, t: turkum, d: daraja (1–3), s: so'z turi, w: [11 tilda] } — tillar tartibi TILLAR.
export const TILLAR = ["uz", "ru", "en", "de", "fr", "es", "ar", "tr", "zh", "ja", "ko"];
export const ORGANISH_TILLARI = [
  ["en", "🇬🇧", "Ingliz"], ["ru", "🇷🇺", "Rus"], ["de", "🇩🇪", "Nemis"], ["fr", "🇫🇷", "Fransuz"], ["es", "🇪🇸", "Ispan"],
  ["ar", "🇸🇦", "Arab"], ["tr", "🇹🇷", "Turk"], ["zh", "🇨🇳", "Xitoy"], ["ja", "🇯🇵", "Yapon"], ["ko", "🇰🇷", "Koreys"],
];
export const TURLAR = ["rasm", "soz", "eshit", "juft"];      // so'z→rasm, rasm→so'z, ovoz→rasm, juftlash
export const RAUND_SONI = 10;

export const soz = (x, til) => x?.w?.[TILLAR.indexOf(til)] || "";
const norm = (s) => String(s || "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
/** Ovoz uchun matn: o'zbekchadan boshqa til — til tegi bilan (server o'sha til diktorida o'qiydi). */
export const ovozMatni = (matn, til) => (til === "uz" ? matn : `[${til}]${matn}[/${til}]`);

export function aralashtir(list, rng = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** daraja — bolalar to'plami pog'onasi; sinf — maktab so'zlari (n: 1..11): shu sinfgacha (aniq=true bo'lsa faqat shu sinf). */
export function saralash(pool, { daraja = 0, sinf = 0, aniq = false } = {}) {
  return (pool || []).filter((x) => x && x.f && (!daraja || x.d <= daraja) && (!sinf || !x.n || (aniq ? x.n === sinf : x.n <= sinf)));
}

/** Chalg'ituvchilar: avval o'sha turkum va so'z turidan; nishon bilan (va o'zaro) bir xil YOZILADIGAN yoki bir xil rasmli so'z olinmaydi. */
export function chalgituvchilar(pool0, nishon, til, izoh, soni = 3, rng = Math.random, rasmli = true) {
  const pool = rasmli ? pool0.filter((x) => !x.m) : pool0;
  const band = new Set([norm(soz(nishon, til)), norm(soz(nishon, izoh))]);
  const rasm = new Set([nishon.f]);
  const out = [];
  const ol = (nomzodlar) => {
    for (const x of aralashtir(nomzodlar, rng)) {
      if (out.length >= soni) return;
      const a = norm(soz(x, til)), b = norm(soz(x, izoh));
      if (x.k === nishon.k || !a || band.has(a) || band.has(b) || rasm.has(x.f)) continue;
      band.add(a); band.add(b); rasm.add(x.f); out.push(x);
    }
  };
  ol(pool.filter((x) => x.t === nishon.t && x.s === nishon.s));
  ol(pool.filter((x) => x.s === nishon.s));
  ol(pool);
  return out;
}

/** Bitta o'yin (RAUND_SONI topshiriq): bugun ko'rilgan so'zlar chiqmaydi (yetmasa — eng eskilari qaytadi), xatolar birinchi navbatda. */
export function oyinYasa(pool, { til = "en", izoh = "uz", korilgan = [], xatolar = [], soni = RAUND_SONI, tur = "", rng = Math.random } = {}) {
  const bor = new Map(pool.map((x) => [x.k, x]));
  const kor = new Set(korilgan);
  const qayta = aralashtir(xatolar.filter((k) => bor.has(k)), rng).slice(0, Math.ceil(soni / 3)).map((k) => bor.get(k));
  const yangi = aralashtir(pool.filter((x) => !kor.has(x.k) && !qayta.includes(x)), rng);
  const eski = korilgan.filter((k) => bor.has(k)).map((k) => bor.get(k)).filter((x) => !qayta.includes(x));   // eng eski — boshida
  const nishonlar = [...qayta, ...yangi, ...eski].slice(0, soni);
  const raundlar = [];
  for (let i = 0; i < nishonlar.length; i += 1) {
    const n = nishonlar[i];
    // REV696: mavhum rasmli so'z (m) — rasmdan topib bo'lmaydi: faqat «tarjima» turi (o'zbekcha so'z → o'rganilayotgan tildagi so'z)
    const t = n.m ? "tarjima" : tur || TURLAR[i % TURLAR.length];
    if (t === "tarjima") {
      const ch = chalgituvchilar(pool, n, til, izoh, 3, rng, false);
      if (ch.length >= 2) raundlar.push({ tur: t, nishon: n, variantlar: aralashtir([n, ...ch], rng) });
      continue;
    }
    if (t === "juft") {
      const sherik = chalgituvchilar(pool, n, til, izoh, 3, rng);
      if (sherik.length < 3) continue;
      const juftlar = aralashtir([n, ...sherik], rng);
      raundlar.push({ tur: "juft", nishon: n, juftlar, rasmlar: aralashtir(juftlar, rng) });
    } else {
      const ch = chalgituvchilar(pool, n, til, izoh, 3, rng);
      if (ch.length < 2) continue;
      raundlar.push({ tur: t, nishon: n, variantlar: aralashtir([n, ...ch], rng) });
    }
  }
  return raundlar;
}

/** Tanga: har to'g'ri javob 5, ketma-ket to'g'ri javoblar +1 dan (ko'pi bilan +5). */
export function tangaHisobi(natijalar) {
  let tanga = 0, ketma = 0;
  for (const ok of natijalar) { if (ok) { ketma += 1; tanga += 5 + Math.min(5, ketma - 1); } else ketma = 0; }
  return tanga;
}

// ── Xotira (qurilmada): bugun ko'rilgan so'zlar va xato qilinganlar, til bo'yicha ──
const KALIT = "kb_soz_sandiq_v1";
const bugun = () => new Date().toISOString().slice(0, 10);
export function xotiraOl(til, xotira = globalThis.localStorage) {
  try { const d = JSON.parse(xotira.getItem(KALIT) || "{}")[til] || {}; return { korilgan: d.kun === bugun() ? d.korilgan || [] : [], xatolar: d.xatolar || [], jami: d.jami || 0 }; }
  catch { return { korilgan: [], xatolar: [], jami: 0 }; }
}
export function xotiraYoz(til, { korildi = [], xato = [], togri = [] }, xotira = globalThis.localStorage) {
  try {
    const hammasi = JSON.parse(xotira.getItem(KALIT) || "{}");
    const d = hammasi[til] || {};
    const korilgan = [...(d.kun === bugun() ? d.korilgan || [] : []), ...korildi].filter((k, i, a) => a.indexOf(k) === i).slice(-1500);
    const xatolar = [...(d.xatolar || []).filter((k) => !togri.includes(k)), ...xato].filter((k, i, a) => a.indexOf(k) === i).slice(-200);
    hammasi[til] = { kun: bugun(), korilgan, xatolar, jami: (d.jami || 0) + togri.length };
    xotira.setItem(KALIT, JSON.stringify(hammasi));
  } catch { /* xotira yo'q */ }
}

// ── REV696: gaplar. Gap: { k: kalit (rasmli so'z), g: [11 tilda tokenlar ro'yxati] } ──
const BOSHLIQSIZ = new Set(["zh", "ja"]);
export const gapTokenlar = (x, til) => x?.g?.[TILLAR.indexOf(til)] || [];
export const gapMatn = (tok, til) => (tok || []).join(BOSHLIQSIZ.has(til) ? "" : " ");
/** Tartib tekshiruvi matn bo'yicha — bir xil yoziladigan tokenlar o'rni almashsa ham to'g'ri. */
export const gapTogri = (tanlov, x, til) => gapMatn(tanlov, til) === gapMatn(gapTokenlar(x, til), til);
/** Aralashtirish: asl tartib bilan bir xil chiqmasin (2+ token bo'lsa). */
export function gapAralash(tok, rng = Math.random) {
  if (tok.length < 2) return [...tok];
  for (let u = 0; u < 8; u += 1) { const a = aralashtir(tok, rng); if (a.some((t, i) => t !== tok[i])) return a; }
  return [...tok].reverse();
}
/** Gap o'yini: «tuz» (rasm + aralash so'zlar → gap) va «gaprasm» (gapni eshit/o'qi → 4 rasmdan top) navbatlashadi. */
export function gapOyinYasa(gaplar, pool, { til = "en", izoh = "uz", korilgan = [], xatolar = [], soni = RAUND_SONI, rng = Math.random } = {}) {
  const sozMap = new Map(pool.map((x) => [x.k, x]));
  const yaroqli = gaplar.filter((x) => sozMap.has(x.k) && gapTokenlar(x, til).length >= 2);
  const bor = new Map(yaroqli.map((x) => [x.k, x]));
  const kor = new Set(korilgan);
  const qayta = aralashtir(xatolar.filter((k) => bor.has(k)), rng).slice(0, Math.ceil(soni / 3)).map((k) => bor.get(k));
  const yangi = aralashtir(yaroqli.filter((x) => !kor.has(x.k) && !qayta.includes(x)), rng);
  const eski = korilgan.filter((k) => bor.has(k)).map((k) => bor.get(k)).filter((x) => !qayta.includes(x));
  const raundlar = [];
  [...qayta, ...yangi, ...eski].slice(0, soni).forEach((gap, i) => {
    const nishon = sozMap.get(gap.k);
    if (i % 2 === 1) {
      // gapda tilga olingan boshqa narsa (it — «It suyak kemiradi») chalg'ituvchi rasm bo'lmaydi
      const matn = ` ${[til, izoh].map((t) => gapTokenlar(gap, t).join(" ")).join(" ")} `.toLowerCase();
      const toza = pool.filter((x) => x.k === nishon.k || ![til, izoh].some((t) => { const w = norm(soz(x, t)).replace(/^(the|der|die|das|le|la|les|l’|el|los|las|ال)\s*/i, ""); return w.length >= 2 && matn.includes(w); }));
      const ch = chalgituvchilar(toza, nishon, til, izoh, 3, rng);
      if (ch.length >= 2) { raundlar.push({ tur: "gaprasm", nishon, gap, variantlar: aralashtir([nishon, ...ch], rng) }); return; }
    }
    raundlar.push({ tur: "tuz", nishon, gap, aralash: gapAralash(gapTokenlar(gap, til), rng) });
  });
  return raundlar;
}

// ── REV699: «Dars» — kunlik yo'l: har darsda bir nechta YANGI so'z + vaqti kelgan TAKRORLAR (Leitner qutilari) ──
// Holat (til bo'yicha): { s: { kalit: [quti 1..5, qaytish kuni] } }. To'g'ri javob — keyingi quti (oraliq 1,2,4,8,16 kun), xato — 1-quti.
export const DARS_YANGI = 6;
export const DARS_TAKROR = 8;
export const QUTI_KUN = [0, 1, 2, 4, 8, 16];
export const ORGANILDI_QUTI = 3;
export const kunRaqami = (d = new Date()) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);

export function darsStat(pool, holat, bugun = kunRaqami()) {
  const s = holat?.s || {};
  let boshlangan = 0, organilgan = 0, takror = 0;
  for (const x of pool) { const h = s[x.k]; if (!h) continue; boshlangan += 1; if (h[0] >= ORGANILDI_QUTI) organilgan += 1; if (h[1] <= bugun) takror += 1; }
  return { jami: pool.length, boshlangan, organilgan, takror, dars: Math.floor(boshlangan / DARS_YANGI) + 1, darsJami: Math.ceil(pool.length / DARS_YANGI) };
}

/** Dars: yangi so'zlar (hovuz tartibida — oson darajadan), tanishuv kartalari, so'ng yangi + takror so'zlarga aralash mashq. */
export function darsYasa(pool, holat, { til = "en", izoh = "uz", bugun = kunRaqami(), gaplar = [], rng = Math.random, yangiSoni = DARS_YANGI, takrorSoni = DARS_TAKROR, sinf = 0 } = {}) {
  const s = holat?.s || {};
  // daraja → rasmi aniq so'zlar → aniq narsa otlari (hayvon, meva, uy...) → fe'l → sifat → qolganlari; ichida fayldagi tartib
  const TUR = { ot: 0, fel: 1, sifat: 2, son: 2, ravish: 3, ibora: 4 };
  const og = (x) => (x.n || x.d) * 100 + (x.m ? 50 : 0) + (TUR[x.s] ?? 4) * 10 + (x.t === "boshqa" ? 5 : 0);
  const tartib = pool.map((x, i) => [x, i]).sort((a, b) => og(a[0]) - og(b[0]) || a[1] - b[1]).map((p) => p[0]);
  // yangi so'zlar — tanlangan sinfniki (sinf berilgan bo'lsa); takrorlar — boshlangan hamma so'zlardan
  const yangi = tartib.filter((x) => !s[x.k] && (!sinf || !x.n || x.n === sinf)).slice(0, yangiSoni);
  const takror = tartib.filter((x) => s[x.k] && s[x.k][1] <= bugun).sort((a, b) => s[a.k][1] - s[b.k][1] || s[a.k][0] - s[b.k][0]).slice(0, takrorSoni);
  const gapMap = new Map(gaplar.map((g) => [g.k, g]));
  const raundlar = yangi.map((n) => ({ tur: "tanish", nishon: n }));
  const mashq = [];
  const qosh = (n, t) => {
    if (n.m && t !== "tarjima") t = "tarjima";
    const ch = chalgituvchilar(pool, n, til, izoh, 3, rng, t !== "tarjima");
    if (ch.length >= 2) mashq.push({ tur: t, nishon: n, variantlar: aralashtir([n, ...ch], rng) });
  };
  yangi.forEach((n, i) => { qosh(n, i % 2 ? "eshit" : "rasm"); qosh(n, "soz"); });
  takror.forEach((n, i) => {
    const g = gapMap.get(n.k);
    if (g && !n.m && gapTokenlar(g, til).length >= 2 && i % 2 === 0) mashq.push({ tur: "tuz", nishon: n, gap: g, aralash: gapAralash(gapTokenlar(g, til), rng) });
    else qosh(n, ["soz", "eshit", "tarjima", "rasm"][i % 4]);
  });
  // bir so'z ketma-ket ikki marta kelmasin
  let ar = aralashtir(mashq, rng);
  for (let u = 0; u < 20 && ar.some((r, i) => i && r.nishon.k === ar[i - 1].nishon.k); u += 1) ar = aralashtir(mashq, rng);
  return { yangi, takror, raundlar: [...raundlar, ...ar] };
}

/** Dars yakuni: so'z bo'yicha natija (bitta xato ham — xato). Yangi so'z to'g'ri bo'lsa 2-qutidan boshlaydi. */
export function darsYakun(holat, raundlar, natijalar, bugun = kunRaqami()) {
  const s = { ...(holat?.s || {}) };
  const ok = new Map();
  raundlar.forEach((r, i) => { if (r.tur === "tanish") return; ok.set(r.nishon.k, (ok.has(r.nishon.k) ? ok.get(r.nishon.k) : true) && Boolean(natijalar[i])); });
  for (const [k, togri] of ok) {
    const quti = togri ? Math.min(5, (s[k]?.[0] || 1) + 1) : 1;
    s[k] = [quti, bugun + (togri ? QUTI_KUN[quti] : 0)];   // xato — shu kuniyoq keyingi darsda qaytadi
  }
  return { ...holat, s };
}

const DARS_KALIT = "kb_soz_dars_v1";
export function darsOl(til, xotira = globalThis.localStorage) { try { return JSON.parse(xotira.getItem(DARS_KALIT) || "{}")[til] || { s: {} }; } catch { return { s: {} }; } }
export function darsYoz(til, holat, xotira = globalThis.localStorage) {
  try { const h = JSON.parse(xotira.getItem(DARS_KALIT) || "{}"); h[til] = holat; xotira.setItem(DARS_KALIT, JSON.stringify(h)); } catch { /* xotira yo'q */ }
}

/** REV702: ikki manba holatini birlashtirish (qurilma + server): har so'z uchun keyinroq o'ynalgani qoladi. */
export function darsBirlashtir(a, b) {
  const s = {};
  for (const src of [a, b]) for (const [k, v] of Object.entries(src?.s || {})) {
    if (!Array.isArray(v) || v.length !== 2) continue;
    const e = s[k];
    if (!e || v[1] > e[1] || (v[1] === e[1] && v[0] > e[0])) s[k] = v;
  }
  return { s };
}
