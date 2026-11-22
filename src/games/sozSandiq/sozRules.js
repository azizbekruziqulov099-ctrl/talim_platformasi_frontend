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

export function saralash(pool, { daraja = 0 } = {}) {
  return (pool || []).filter((x) => x && x.f && (!daraja || x.d <= daraja));
}

/** Chalg'ituvchilar: avval o'sha turkum va so'z turidan; nishon bilan (va o'zaro) bir xil YOZILADIGAN yoki bir xil rasmli so'z olinmaydi. */
export function chalgituvchilar(pool, nishon, til, izoh, soni = 3, rng = Math.random) {
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
    const t = tur || TURLAR[i % TURLAR.length];
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
