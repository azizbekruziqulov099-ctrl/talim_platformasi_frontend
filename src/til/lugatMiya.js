// REV184: LUG'AT MIYASI — bola tushunmagan so'zni bosganda izoh ustozi (uz / ru / en) tushuntiradi:
// so'z nimani bildiradi, so'z turkumi (ot, fe'l, sifat…), 3–4 ta misol gap (til ustozi aytadi, izoh ustozi tarjima qiladi).
// Manba: 1) serverdagi lug'at miyasi (/api/lugat/soz), 2) shu darsning o'zidagi so'zlar va gaplar (internet sekin bo'lsa ham ishlaydi).
import { gaplar, sozlarga } from "./immersiya.js";

const TEG = /\[([a-z]{2})\]([\s\S]*?)\[\/\1\]/g;
const EMOJI = /^[\p{Extended_Pictographic}\p{Regional_Indicator}\u{FE0F}\u{200D}\u{20E3}\p{Emoji_Modifier}\s]+/u;
const toza = (s) => String(s || "").replace(/\[\/?[a-z]{2}\]/g, "").replace(/\s+/g, " ").trim();
export const sozNorm = (s) => toza(s).toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

/** Shu darsdan lug'at: sarlavha «🌦 [en]weather[/en] — ob-havo» va gapdagi «[en]X[/en] — Y». Map(norm → {soz, tarjima, emoji}). */
export function darsLugati(steps = [], til = "") {
  const out = new Map();
  if (!til) return out;
  const qosh = (soz, tarjima, emoji = "") => {
    const k = sozNorm(soz);
    const t = toza(tarjima).replace(/^[—–-]\s*/, "").replace(/^(bu|это|it)\s+/i, "").replace(/\s+(degani|означает|means)\.?$/i, "").replace(/[.!]+$/, "").trim();
    if (!k || !t || t.length > 70 || k.length > 60 || out.has(k)) return;
    out.set(k, { soz: toza(soz).replace(/[.!]+$/, ""), tarjima: t, emoji });
  };
  const re = new RegExp(`^\\s*([^\\[]*)\\[${til}\\]([\\s\\S]+?)\\[\\/${til}\\]\\s*[—–-]\\s*(.+)$`);
  const ichki = new RegExp(`\\[${til}\\]([^\\[]+?)\\[\\/${til}\\]\\s*(?:\\[([a-z]{2})\\])?\\s*[—–-]\\s*([^.!?\\[]{1,60})`, "g");
  for (const s of steps) {
    const m = re.exec(String(s?.sarlavha || ""));
    if (m) qosh(m[2], m[3], (EMOJI.exec(m[1]) || [""])[0].trim());
    for (const k of ["ovoz", "doska"]) for (const x of String(s?.[k] || "").matchAll(ichki)) {
      const oxirgi = x[1].split(/[:!?.]\s+/).pop();
      if (oxirgi.split(/\s+/).length <= 4) qosh(oxirgi, x[3]);
    }
  }
  return out;
}

/** Shu darsdagi o'rganilayotgan tildagi gaplar (misol uchun) — keyingi izoh tili gapi bo'lsa, tarjima sifatida. */
export function darsGaplari(steps = [], til = "") {
  const out = [];
  if (!til) return out;
  for (const s of steps) {
    const t = String(s?.ovoz || "");
    const qism = [];
    let last = 0;
    for (const m of t.matchAll(TEG)) {
      if (m.index > last && t.slice(last, m.index).trim()) qism.push({ til: "", matn: t.slice(last, m.index) });
      qism.push({ til: m[1], matn: m[2] });
      last = m.index + m[0].length;
    }
    if (last < t.length && t.slice(last).trim()) qism.push({ til: "", matn: t.slice(last) });
    qism.forEach((q, i) => {
      if (q.til !== til) return;
      const tg = gaplar(toza(q.matn));
      const keyin = qism[i + 1] && qism[i + 1].til !== til ? gaplar(toza(qism[i + 1].matn)) : [];
      tg.forEach((g, j) => { if (g.split(/\s+/).length >= 3 && !/[:=_…]/.test(g)) out.push({ gap: g, tarjima: keyin.length >= tg.length && !/^[—–-]/.test(keyin[0] || "") ? keyin[j] || "" : "" }); });
    });
  }
  return out;
}

const KESH = new Map();
/** So'zni topish: server + dars. Qaytaradi: {soz, tarjima, turkum, misollar:[{gap, tarjima}], emoji, topildi}. */
export async function sozTop(soz, { til = "", iz = "uz", apiBase = "", lokal = new Map(), gaplar: darsG = [] } = {}) {
  const k = sozNorm(soz);
  const lok = lokal.get(k);
  const kalit = `${til}|${iz}|${k}`;
  let server = KESH.get(kalit);
  if (server === undefined && apiBase) {
    try {
      const r = await fetch(`${String(apiBase).replace(/\/+$/, "")}/api/lugat/soz?${new URLSearchParams({ til, iz, soz: toza(soz) })}`);
      server = r.ok ? await r.json() : null;
    } catch { server = null; }
    KESH.set(kalit, server);
  }
  const e = server && server.topildi ? server : null;
  const misollar = [...(server?.misollar || [])];
  // darsdagi gaplardan qo'shimcha misol (3–4 ta bo'lsin)
  const re = new RegExp(`(^|[^\\p{L}])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}]|$)`, "iu");
  for (const g of darsG) {
    if (misollar.length >= 4) break;
    if (re.test(g.gap) && !misollar.some((m) => m.gap.toLowerCase() === g.gap.toLowerCase())) misollar.push({ gap: g.gap, tarjima: g.tarjima || "" });
  }
  const tarjima = e?.tarjima || lok?.tarjima || "";
  return {
    soz: e?.soz || lok?.soz || toza(soz),
    tarjima, turkum: e?.turkum || "", emoji: e?.emoji || lok?.emoji || "",
    misollar: misollar.slice(0, 4), topildi: Boolean(tarjima || misollar.length),
  };
}

export const TURKUM = {
  uz: { ot: "ot — narsa, odam yoki joyning nomi", "fe'l": "fe'l — ish-harakatni bildiradi", sifat: "sifat — belgini bildiradi: qanday?",
    ravish: "ravish — harakat qanday bo'lishini bildiradi", son: "son — sanoq yoki tartibni bildiradi", olmosh: "olmosh — ot o'rnida keladi",
    predlog: "predlog — so'zlarni bir-biriga bog'laydi", "bog'lovchi": "bog'lovchi — so'z va gaplarni bog'laydi", undov: "undov — salom, his-tuyg'u",
    ibora: "ibora — bir necha so'zdan iborat tayyor gap", yuklama: "yuklama — gapga qo'shimcha ma'no beradi" },
  ru: { ot: "существительное — название предмета, человека или места", "fe'l": "глагол — обозначает действие", sifat: "прилагательное — признак: какой?",
    ravish: "наречие — как происходит действие", son: "числительное — счёт или порядок", olmosh: "местоимение — заменяет имя",
    predlog: "предлог — связывает слова", "bog'lovchi": "союз — связывает слова и предложения", undov: "междометие — приветствие, чувство",
    ibora: "выражение — готовая фраза из нескольких слов", yuklama: "частица — добавляет оттенок смысла" },
  en: { ot: "a noun — the name of a thing, person or place", "fe'l": "a verb — it shows an action", sifat: "an adjective — it describes: what kind?",
    ravish: "an adverb — it shows how something happens", son: "a number word", olmosh: "a pronoun — it stands for a noun",
    predlog: "a preposition — it links words", "bog'lovchi": "a conjunction — it joins words and sentences", undov: "an interjection — a greeting or feeling",
    ibora: "a phrase — a ready expression of several words", yuklama: "a particle — it adds meaning" },
};
export const TURKUM_QISQA = {
  uz: { ot: "ot", "fe'l": "fe'l", sifat: "sifat", ravish: "ravish", son: "son", olmosh: "olmosh", predlog: "predlog", "bog'lovchi": "bog'lovchi", undov: "undov", ibora: "ibora", yuklama: "yuklama" },
  ru: { ot: "сущ.", "fe'l": "глагол", sifat: "прил.", ravish: "нареч.", son: "числ.", olmosh: "местоим.", predlog: "предлог", "bog'lovchi": "союз", undov: "междом.", ibora: "выражение", yuklama: "частица" },
  en: { ot: "noun", "fe'l": "verb", sifat: "adjective", ravish: "adverb", son: "number", olmosh: "pronoun", predlog: "preposition", "bog'lovchi": "conjunction", undov: "interjection", ibora: "phrase", yuklama: "particle" },
};

/** Izoh ustozining tushuntirishi (teglangan): til qismlari — til ustozi, qolgani — izoh ustozi. */
export function izohNutqi(e, { til = "", iz = "uz" } = {}) {
  if (!e) return "";
  const T = (s) => `[${til}]${s}[/${til}]`;
  const N = (s) => (iz === "uz" ? s : `[${iz}]${s}[/${iz}]`);
  const soz = T(e.soz);
  const qism = [];
  const tur = TURKUM[iz]?.[e.turkum];
  if (iz === "ru") {
    qism.push(soz, N(e.tarjima ? `Это слово значит «${e.tarjima}».` : "Посмотрим, как это слово используется."));
    if (tur) qism.push(N(`Это ${tur}.`));
    if (e.misollar?.length) qism.push(N("Послушай примеры."));
  } else if (iz === "en") {
    qism.push(soz, N(e.tarjima ? `This word means “${e.tarjima}”.` : "Let's see how this word is used."));
    if (tur) qism.push(N(`It is ${tur}.`));
    if (e.misollar?.length) qism.push(N("Listen to the examples."));
  } else {
    qism.push(soz, N(e.tarjima ? `Bu so'z — «${e.tarjima}» degani.` : "Keling, bu so'z qanday ishlatilishini ko'ramiz."));
    if (tur) qism.push(N(`Bu — ${tur}.`));
    if (e.misollar?.length) qism.push(N("Misollarni eshit."));
  }
  (e.misollar || []).slice(0, 4).forEach((m, i) => {
    qism.push(T(m.gap));
    if (m.tarjima) qism.push(N(m.tarjima));
    else if (e.tarjima) qism.push(N(iz === "ru" ? `Здесь тоже — «${e.tarjima}».` : iz === "en" ? `Here it also means “${e.tarjima}”.` : `Bu gapda ham «${e.tarjima}» ma'nosida.`));
    if (i === 0 && (e.misollar || []).length > 1) qism.push(N(iz === "ru" ? "Ещё пример." : iz === "en" ? "One more." : "Yana bir misol."));
  });
  qism.push(N(iz === "ru" ? "Понятно? Повтори:" : iz === "en" ? "Got it? Say it:" : "Tushundingmi? Takrorla:"), soz);
  return qism.join(" ");
}

/** Matnni bosiladigan so'zlarga bo'lish: [{w, til, soz}] — soz: lug'atda qidiriladigan shakl (tinish belgisiz). */
export function bosiladigan(matn, til) {
  const out = [];
  for (const q of String(matn || "").split(/(\s+)/)) {
    if (!q.trim()) continue;
    const soz = sozNorm(q);
    out.push({ w: q, soz, bosilsin: Boolean(soz) && (["ja", "zh"].includes(til) || sozlarga(til, soz).length > 0) });
  }
  return out;
}
