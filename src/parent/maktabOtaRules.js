// REV174: Maktab o'quvchisining ota-onasi — sof qoidalar (brauzersiz sinaladi).

export const TUR_BELGI = { dars: "📘", til: "🎮", repetitor: "👩‍🏫", topshiriq: "📬" };
export const TUR_NOMI = { dars: "Dars", til: "Til o‘yini", repetitor: "Repetitor", topshiriq: "Ota-ona topshirig‘i" };
export const YOZISH_TANLOV = [0, 10, 20, 40, 50, 100];
export const MUDDAT_TANLOV = [1, 3, 7];
export const MAX_SOZ = 30;
export const SINOV_SONI = 8;

/** Bugungi umumiy: nechta ish, daqiqa, daftarga yozilgan, to'g'ri javoblar foizi. */
export function bugunJami(bugun = []) {
  const togri = bugun.reduce((s, b) => s + (b.togri || 0), 0);
  const jami = bugun.reduce((s, b) => s + (b.jami || 0), 0);
  return {
    soni: bugun.length,
    daqiqa: bugun.reduce((s, b) => s + (b.daqiqa || 0), 0),
    yozdi: bugun.reduce((s, b) => s + (b.yozdi || 0), 0),
    sozlar: bugun.reduce((s, b) => s + (b.sozlar || 0), 0),
    foiz: jami ? Math.round((togri / jami) * 100) : null,
  };
}

/** Haftalik ustunlar balandligi (0..100): faoliyat soni va daqiqa birga. */
export function haftaUstunlari(hafta = []) {
  const ball = hafta.map((h) => (h.faoliyat || 0) * 10 + (h.daqiqa || 0));
  const max = Math.max(1, ...ball);
  return hafta.map((h, i) => ({ ...h, balandlik: ball[i] ? Math.max(8, Math.round((ball[i] / max) * 100)) : 0 }));
}

/**
 * Sinov / mashq uchun so'zlar: serverdagi o'rgangan so'zlar (id, til, kim) → lug'atdagi so'z ma'lumoti bilan.
 * davr: "bugun" | "hafta" | "hammasi". Lug'atda yo'q so'z tashlab yuboriladi.
 */
export function ozgarganSozlar(sozlar = [], lugat = {}, { til = "", davr = "hammasi" } = {}) {
  const seen = new Set();
  return sozlar.filter((s) => (!til || s.til === til) && (davr !== "bugun" || s.kim === "bugun") && lugat[s.id] && !seen.has(s.id) && seen.add(s.id))
    .map((s) => lugat[s.id]);
}

/** Bolaning tillari: avval faol (darajasi bor) tillar, keyin o'rgangan so'zlari bor tillar. */
export function bolaTillari(data) {
  const out = [];
  for (const t of data?.tillar || []) if (!out.includes(t.til)) out.push(t.til);
  for (const s of data?.sozlar || []) if (!out.includes(s.til)) out.push(s.til);
  return out;
}

/** Sinov savollari: n ta so'z (aralash), har biriga 3 ta variant (ma'nosi takrorlanmaydigan). rng — sinash uchun. */
export function sinovTuz(sozlar = [], { n = SINOV_SONI, rng = Math.random, manoOf = (w) => w.w?.uz } = {}) {
  const ar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  return ar(sozlar).slice(0, n).map((w) => {
    const korilgan = new Set([String(manoOf(w)).toLowerCase()]);
    const boshqa = ar(sozlar.filter((x) => x.id !== w.id)).filter((x) => {
      const m = String(manoOf(x)).toLowerCase();
      if (korilgan.has(m)) return false;
      korilgan.add(m); return true;
    }).slice(0, 2);
    return { w, variantlar: ar([w, ...boshqa]) };
  });
}

/** Sinov natijasi matni: «8 tadan 6 tasini bildi (75%)». */
export const natijaFoiz = (togri, jami) => (jami ? Math.round((togri / jami) * 100) : 0);

/** Topshiriq holati yorlig'i. */
export function topshiriqHolati(t, bugunISO = new Date().toISOString().slice(0, 10)) {
  if (t.holat === "bajarildi") return { belgi: "✅", matn: "Bajarildi" };
  if (t.muddat && t.muddat < bugunISO) return { belgi: "⏰", matn: "Muddati o‘tdi" };
  return { belgi: "⏳", matn: "Kutilmoqda" };
}

/** «Mashq ber» — tanlangan so'zlarni tekshirish: kamida 1, ko'pi bilan 30 ta. */
export function topshiriqXatosi(tanlangan = [], til = "") {
  if (!til) return "Tilni tanlang";
  if (!tanlangan.length) return "Kamida bitta so‘z tanlang";
  if (tanlangan.length > MAX_SOZ) return `Ko‘pi bilan ${MAX_SOZ} ta so‘z`;
  return "";
}
