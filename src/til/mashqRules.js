// REV128: Kattalar til mashqi — sof qoidalar (brauzersiz sinaladi): yozilganni tekshirish, so'z bo'laklari,
// gapirilganni baholash va gaplar holati (takrorlash tizimi).
import { VAZIYATLAR } from "./mashqLugat.js";
import { gradeSpeech } from "../speech/speakRules.js";
import { srsYangila, kunRaqami, PUXTA } from "../kid/xonalar/xonaRules.js";

/** Yozuvsiz bo'shliq tillari (xitoy, yapon): so'zlar bo'shliq bilan ajratilmaydi. */
export const BOSHLIQSIZ = new Set(["zh", "ja"]);
/** Klaviaturada yozish qiyin tillar — standart holatda so'z bo'laklarini terish. */
export const BOLAKLI = new Set(["zh", "ja", "ko", "ar"]);

const TINISH = /[.,!?;:¿¡。、，！？：；「」『』（）()"“”«»„‚…—–\-،؛؟]/g;
const TUTUQ = /['’‘`ʼ]/g;   // «m’appelle» = «mappelle» — tutuq belgisi yozilmasa ham to'g'ri
/** Taqqoslash uchun: kichik harf, tinish belgilarsiz, bo'shliqlar yig'ilgan, Unicode NFKC. */
export function tozala(text) {
  return String(text || "").normalize("NFKC").toLowerCase().replace(TUTUQ, "").replace(TINISH, " ").replace(/\s+/g, " ").trim();
}
/** Diakritik belgilarsiz (é → e, ü → u) — «deyarli to'g'ri» uchun. Arab harakatlari ham olib tashlanadi. */
export function harakatsiz(text) {
  return tozala(text).replace(/ß/g, "ss").replace(/œ/g, "oe").normalize("NFD").replace(/[̀-ًͯ-ٰٟ]/g, "").normalize("NFC");
}
function masofa(a, b) {
  const A = [...a], B = [...b];
  let prev = Array.from({ length: B.length + 1 }, (_, i) => i);
  for (let i = 1; i <= A.length; i++) {
    const cur = [i];
    for (let j = 1; j <= B.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[B.length];
}
/** Yozilganni tekshirish: "togri" | "deyarli" (faqat urg'u/diakritika yoki 1–2 harf) | "xato"; o'xshashlik 0..1. */
export function yozuvniTekshir(yozilgan, togri, til = "") {
  const a = tozala(yozilgan), b = tozala(togri);
  if (!a) return { holat: "xato", oxshash: 0 };
  if (a === b) return { holat: "togri", oxshash: 1 };
  const bosh = BOSHLIQSIZ.has(til) ? (s) => s.replace(/\s+/g, "") : (s) => s;
  if (bosh(a) === bosh(b)) return { holat: "togri", oxshash: 1 };
  if (bosh(harakatsiz(a)) === bosh(harakatsiz(b))) return { holat: "deyarli", oxshash: 0.97 };
  const d = masofa(bosh(a), bosh(b));
  const oxshash = Math.max(0, 1 - d / Math.max([...bosh(a)].length, [...bosh(b)].length));
  return { holat: oxshash >= 0.9 ? "deyarli" : "xato", oxshash: Math.round(oxshash * 100) / 100 };
}

/** So'z bo'laklari (terish mashqi uchun). Xitoy/yaponcha — Intl.Segmenter bilan, bo'lmasa — 1–2 belgidan. */
export function bolaklar(gap, til = "") {
  const t = String(gap || "").replace(TINISH, " ").replace(/\s+/g, " ").trim();   // tutuq belgisi so'z ichida qoladi (l’eau)
  if (!BOSHLIQSIZ.has(til)) return t.split(" ").filter(Boolean);
  const Seg = globalThis.Intl?.Segmenter;
  if (Seg) {
    try {
      const s = new Seg(til, { granularity: "word" });
      const out = [...s.segment(t.replace(/\s+/g, ""))].map((x) => x.segment).filter((x) => x.trim());
      if (out.length > 1) return out;
    } catch { /* eski brauzer */ }
  }
  const belgilar = [...t.replace(/\s+/g, "")];
  const out = [];
  for (let i = 0; i < belgilar.length; i += 2) out.push(belgilar.slice(i, i + 2).join(""));
  return out;
}
/** Terilgan bo'laklar to'g'rimi (tinish belgilarsiz taqqoslanadi). */
export function bolakTogri(terilgan, gap, til = "") {
  const j = BOSHLIQSIZ.has(til) ? "" : " ";
  return tozala(terilgan.join(j)).replace(/\s+/g, BOSHLIQSIZ.has(til) ? "" : " ") === tozala(gap).replace(/\s+/g, BOSHLIQSIZ.has(til) ? "" : " ");
}

/** Gapirilganni baholash: 0–3 yulduz; 2+ — qabul. */
export function gapBaho(alternativlar, gap, til) {
  const g = gradeSpeech(alternativlar, tozala(gap), til);
  return { ...g, togri: g.stars >= 2 };
}

export const vaziyat = (id) => VAZIYATLAR.find((v) => v.id === id) || null;

// — gaplar holati (shu qurilmada) —
const KEY = "kabutar:tilmashq:v1";
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
export function holatlar(til, st = store()) {
  try { return (JSON.parse(st?.getItem(KEY) || "{}") || {})[til] || {}; } catch { return {}; }
}
export function belgila(til, gapId, togri, st = store(), bugun = kunRaqami()) {
  let data = {};
  try { data = JSON.parse(st?.getItem(KEY) || "{}") || {}; } catch { data = {}; }
  data[til] = data[til] || {};
  data[til][gapId] = srsYangila(data[til][gapId], togri, bugun);
  try { st?.setItem(KEY, JSON.stringify(data)); } catch { /* joy yo'q */ }
  return data[til];
}
/** Vaziyat bo'yicha o'zlashtirish (0..1) va bugun takrorlanadigan gaplar soni. */
export function vaziyatHolati(v, h, bugun = kunRaqami()) {
  const g = v?.gaplar || [];
  if (!g.length) return { puxta: 0, takror: 0 };
  return {
    puxta: g.filter((x) => (h[x.id]?.quti || 0) >= PUXTA).length / g.length,
    takror: g.filter((x) => h[x.id] && h[x.id].keyin <= bugun).length,
  };
}
