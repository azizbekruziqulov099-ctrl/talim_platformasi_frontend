// REV148: «Ayt — bo'ladi!» — bola o'rganilayotgan tilda GAPIRADI, to'g'ri aytsa — sahnada o'sha narsa bo'ladi:
// «Close the door!» desa eshik yopiladi, «Turn on the light!» — chiroq yonadi, «apple» — olma jonlanib javonga chiqadi.
// 160 bosqich (20 pog'ona × 8), har bosqichda 3 ta ibora. Iboralar hayotdan: 20 harakat (qisqa va to'liq buyruq),
// xonalardagi ~150 narsa, sinf va tana buyruqlari (jami 200 dan ortiq ibora). Sof qoidalar (brauzersiz sinaladi).
import { HARAKATLAR as IMOLI } from "../harakat/harakatLugat.js";
import { aralashHarakatlar } from "./sahnaHarakatLugat.js";
// REV154: imo-ishorali 20 harakat + rassom chizgan 15 ta «oldin/keyin» sahna, navbatma-navbat
const HARAKATLAR = aralashHarakatlar(IMOLI);
export const GAPIR_HARAKATLAR = HARAKATLAR;
import { XONALAR, SOZLAR, BUYRUQLAR, BUYRUQ_MEN } from "../xonalar/xonaLugat.js";
import { gradeSpeech } from "../../speech/speakRules.js";
import { aytishShakllari } from "../xonalar/xonaRules.js";
import { urugli } from "./jonliRules.js";

export const GAPIR_TUR = 8;          // bir pog'onada 8 bosqich
export const GAPIR_POGONA = 20;
export const GAPIR_JAMI = GAPIR_TUR * GAPIR_POGONA;   // 160
export const GAPIR_RAUND = 3;        // har bosqichda 3 ta ibora
// pog'ona ichidagi tartib: yangi harakat → narsalar → yangi harakat → narsalar → to'liq gaplar → sinf buyruqlari → narsalar → aralash
export const GAPIR_TARTIB = ["harakat", "narsa", "harakat", "narsa", "gap", "buyruq", "narsa", "aralash"];
export const GAPIR_BELGI = { harakat: "🚪", narsa: "🍎", gap: "💬", buyruq: "🙋", aralash: "🎲" };

const BUYRUQ_HAMMA = [...BUYRUQLAR.map((b) => ({ ...b, emoji: b.emoji })), ...BUYRUQ_MEN.map((b) => ({ ...b, id: `men_${b.id}`, emoji: MEN_EMOJI(b.id) }))];
function MEN_EMOJI(id) {
  return { head: "🙆", eyes: "👀", ears: "👂", nose: "👃", mouth: "😮", hands: "🙌", knees: "🦵", shoulders: "🤷", feet: "🦶" }[id] || "🙂";
}
export const buyruqlarRoyxati = () => BUYRUQ_HAMMA;

/** Xonalardagi barcha narsalar (takrorsiz, xonalar tartibida). rasmBor — rasmi borlarigina (UI beradi). */
export function narsalarRoyxati(rasmBor = () => true) {
  const out = [];
  for (const x of XONALAR) for (const id of x.narsalar || []) if (SOZLAR[id] && !out.includes(id) && rasmBor(id)) out.push(id);
  return out;
}

/** Bosqich turi va pog'onasi. */
export function gapirTuri(n) {
  const k = Math.max(0, Math.min(GAPIR_JAMI - 1, Math.floor(Number(n) || 0)));
  return { k, p: Math.floor(k / GAPIR_TUR), j: k % GAPIR_TUR, tur: GAPIR_TARTIB[k % GAPIR_TUR] };
}

/**
 * Bosqich (0..159) iboralari: [{ tur: "harakat"|"narsa"|"buyruq", id, toliq }] — 3 ta.
 *  harakat — 20 harakatdan (pog'onada 2 ta yangisi; 1–10 pog'ona qisqa, 11–20 — to'liq gap), oldingilar takrorlanadi;
 *  narsa — xonalar narsalari navbat bilan (hammasi kamida bir marta chiqadi);
 *  buyruq — sinf va tana buyruqlari; aralash — hammasidan bittadan.
 */
export function gapirDaraja(n, rasmBor = () => true) {
  const { k, p, j, tur } = gapirTuri(n);
  const rnd = urugli(k * 7 + 11);
  const H = HARAKATLAR.length;
  const narsa = narsalarRoyxati(rasmBor);
  const B = BUYRUQ_HAMMA;
  const ikkinchiDavr = p >= H / 2;                       // 11-pog'onadan — to'liq gaplar
  const yangiA = (2 * p) % H, yangiB = (2 * p + 1) % H;
  const korilgan = Math.min(H, ikkinchiDavr ? H : 2 * p + 2);   // shu pog'onagacha o'rganilgan harakatlar soni
  const eskisi = (bundan) => {                          // takror uchun oldingi harakat (bundan boshqa)
    const ichida = Array.from({ length: korilgan }, (_, i) => i).filter((i) => i !== bundan && i !== yangiA && i !== yangiB);
    return ichida.length ? ichida[Math.floor(rnd() * ichida.length)] : bundan;
  };
  const h = (i, toliq) => ({ tur: "harakat", id: HARAKATLAR[i].id, toliq });
  const narsaN = (q) => (narsa.length ? { tur: "narsa", id: narsa[q % narsa.length] } : h(yangiA, false));
  const narsaQism = j === 1 ? 0 : j === 3 ? 1 : 2;
  const bq = (q) => ({ tur: "buyruq", id: B[q % B.length].id });
  let iboralar;
  if (tur === "harakat") {
    const yangi = j === 0 ? yangiA : yangiB;
    const e = eskisi(yangi);
    iboralar = [h(yangi, ikkinchiDavr), h(e, ikkinchiDavr), h(yangi, ikkinchiDavr)];
    if (e === yangi) iboralar[1] = h(yangi, true);        // birinchi bosqich: bitta harakat — qisqa, to'liq, qisqa
  } else if (tur === "narsa") {
    const q = (p * 3 + narsaQism) * GAPIR_RAUND;
    iboralar = [narsaN(q), narsaN(q + 1), narsaN(q + 2)];
  } else if (tur === "gap") {
    iboralar = [h(yangiA, true), h(yangiB, true), h(eskisi(yangiA), true)];
  } else if (tur === "buyruq") {
    iboralar = [bq(p * 3), bq(p * 3 + 1), bq(p * 3 + 2)];
  } else {
    const q = Math.floor(rnd() * Math.max(1, Math.min(narsa.length, (p + 1) * 9)));
    iboralar = [h(eskisi(yangiA), true), narsaN(q), bq(p * 3 + 1 + Math.floor(rnd() * B.length))];
  }
  return { n: k, pogona: p + 1, tur, emoji: GAPIR_BELGI[tur], iboralar, qattiq: p >= 10 };
}

/** Ibora o'rganilayotgan tilda (bola aytadigan) va izoh tilidagi ma'nosi. */
export function iboraMatn(ib, til) {
  if (!ib) return "";
  if (ib.tur === "harakat") { const x = HARAKATLAR.find((y) => y.id === ib.id); return (ib.toliq ? x?.g : x?.s)?.[til] || (ib.toliq ? x?.g : x?.s)?.en || ""; }
  if (ib.tur === "narsa") { const w = SOZLAR[ib.id]?.w || {}; return w[til] || w.en || ib.id; }
  const b = BUYRUQ_HAMMA.find((y) => y.id === ib.id);
  return b?.w?.[til] || b?.w?.en || "";
}
export const iboraManosi = (ib, izoh) => iboraMatn(ib, ["uz", "ru", "en"].includes(izoh) ? izoh : "uz");
export const iboraEmoji = (ib) => (ib?.tur === "buyruq" ? BUYRUQ_HAMMA.find((y) => y.id === ib.id)?.emoji
  : ib?.tur === "narsa" ? SOZLAR[ib.id]?.emoji : "") || "⭐";

/** Aytish uchun toza shakl: tinish belgilarisiz («¡Abre la puerta!» → «Abre la puerta»). */
export const aytishShakli = (s) => String(s || "").replace(/[!?.,;:¡¿！？。、«»"“”]/gu, " ").replace(/\s{2,}/g, " ").trim();

/**
 * Bola aytgani to'g'rimi (yumshoq, bog'cha bolasi uchun): 1-urinish — 2 yulduz, 2-urinish — 1 yulduz ham qabul.
 * Narsa nomida artiklsiz shakl ham to'g'ri («Apfel» = «der Apfel»). Uzun gapda asosiy so'z(lar) aytilsa ham — yaqin.
 */
export function gapirBaho(alternatives, ib, til, urinish = 0) {
  const matn = aytishShakli(iboraMatn(ib, til));
  const shakllar = ib?.tur === "narsa" ? aytishShakllari(matn, til) : [matn];
  let best = { score: 0, stars: 0 };
  for (const s of shakllar) {
    const g = gradeSpeech(alternatives || [], s, til);
    if (g.score > best.score) best = g;
  }
  return { ...best, ok: best.stars >= (urinish > 0 ? 1 : 2) };
}

/** Ustozning izoh tilidagi gaplari. {t} — o'rganilayotgan tildagi ibora, {i} — ma'nosi. */
export const GAPIR_IZOH = {
  intro: { uz: "Sehrli so‘zlar o‘yini! Men aytaman, sen takrorla — to‘g‘ri aytsang, hammasi o‘zi bo‘ladi!", ru: "Игра волшебных слов! Я говорю, ты повторяешь — скажешь правильно, и всё случится само!", en: "Magic words game! I say it, you repeat it — say it right and it will happen!" },
  harakat: { uz: "«{i}» — {t}. Sen ayt — men bajaraman!", ru: "«{i}» — {t}. Скажи — и я сделаю!", en: "{t} Say it — and I’ll do it!" },
  narsa: { uz: "{i} — {t}. Sen ayt — u jonlanadi!", ru: "{i} — {t}. Скажи — и он оживёт!", en: "This is {t}. Say it — and it comes alive!" },
  buyruq: { uz: "«{i}» — {t}. Sen ayt!", ru: "«{i}» — {t}. Скажи!", en: "{t} Now you say it!" },
  yana: { uz: "Yana bir bor, aniqroq: {t}", ru: "Ещё раз, чуть чётче: {t}", en: "Once more, a bit clearer: {t}" },
  mana: { uz: "Mana shunday aytiladi: {t}. Keyingi safar albatta chiqadi!", ru: "Говорят вот так: {t}. В следующий раз получится!", en: "We say it like this: {t}. You’ll get it next time!" },
  mikYoq: { uz: "Mikrofon ishlamayapti — aytib bo‘lgach «Aytdim» tugmasini bos.", ru: "Микрофон не работает — скажи и нажми «Я сказал».", en: "The microphone isn’t working — say it, then tap “I said it”." },
};
export const gapirIzohMatn = (key, izoh, { t = "", i = "" } = {}) =>
  ((GAPIR_IZOH[key] || {})[["uz", "ru", "en"].includes(izoh) ? izoh : "uz"] || "").replace("{i}", i).replace("{t}", t);

/** Yulduzlar: xatosiz — 3, 1–2 xato — 2, ko'p — 1. */
export const gapirYulduz = (xato) => (xato <= 0 ? 3 : xato <= 2 ? 2 : 1);

const KEY = "kabutar:gapir:v1";
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
export function gapirNatija(til, st = store()) {
  try { return (JSON.parse(st?.getItem(KEY) || "{}") || {})[til] || {}; } catch { return {}; }
}
export function gapirYoz(til, n, yulduz, st = store()) {
  let all = {};
  try { all = JSON.parse(st?.getItem(KEY) || "{}") || {}; } catch { all = {}; }
  const t = (all[til] = all[til] || {});
  t[n] = Math.max(Number(t[n]) || 0, yulduz);
  try { st?.setItem(KEY, JSON.stringify(all)); } catch { /* joy yo'q */ }
  return { ...t };
}
export const gapirOchiq = (n, natija, cheklovsiz = false) => cheklovsiz || n === 0 || (Number(natija?.[n - 1]) || 0) > 0;
export const gapirNavbat = (natija) => { for (let i = 0; i < GAPIR_JAMI; i += 1) if (!(Number(natija?.[i]) > 0)) return i; return GAPIR_JAMI - 1; };

/** O'yindagi barcha turli iboralar soni (rasmi bor narsalar bilan) — «200 dan ortiq» tekshiruvi uchun. */
export function iboralarSoni(rasmBor = () => true) {
  return HARAKATLAR.length * 2 + narsalarRoyxati(rasmBor).length + BUYRUQ_HAMMA.length;
}
