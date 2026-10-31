// REV123: test variantining rasmi — bog'cha darsi va «O'ynaymiz» testida bir xil qoida.
import { belgilar, pictureFor, stickerKeys } from "./kidStageRules.js";
import { matnIdTaxmin } from "./rasmHarakat.js";
import { emojiRasm, matnId, sozId } from "./rasmHarakat.js";
import { RASM_HAMMA } from "./darsRasm.js";
import { RASMLAR } from "./xonalar/rasmlar.js";

/** Variant so'zi/emojisiga mos rassom rasmi, bo'lmasa kitob rasmi (emoji+so'z → emoji), bo'lmasa null. */
export function kidOptionPic(o, rasmlar, mediaUrl, rasmSozlar = null) {
  // REV153: avval rassom chizgan rasm, keyin kitobdagi rasm (kitob paketlaridagi eski rasmlar o'yinchoqqa o'xshaydi)
  const mt = matnId(o?.word);   // REV153: so'z istalgan tilda (arab, nemis, rus…) — chizilgan rasm
  const chizilgan = (mt && RASM_HAMMA[mt] ? { id: mt, src: RASM_HAMMA[mt] } : null) || emojiRasm(o?.picture, RASM_HAMMA) || (() => { const id = sozId({ soz: o?.word, emoji: o?.picture }); return id && RASM_HAMMA[id] ? { id, src: RASM_HAMMA[id] } : null; })();   // REV144: emoji o'rniga rassom chizgan rasm
  if (chizilgan) return chizilgan.src;
  // REV158: belgisi bor variantga kitobdagi eski (o'yinchoqsimon) rasm qo'yilmaydi — belgi/rasmlar qatori ko'rsatiladi,
  // shunda darsdagi, o'yindagi va testdagi rasm bir xil bo'ladi
  if (o?.picture && String(o.picture).trim()) return null;
  const own = pictureFor(o?.picture, o?.word, rasmlar, rasmSozlar);
  if (own) return mediaUrl ? mediaUrl(own) : own;
  // REV153: kod bilan chizilgan SVG stikerlar ishlatilmaydi — faqat rassom rasmlari (so'z orqali), aks holda belgi/son
  const CHIZILGAN = { hello: RASM_HAMMA.d_hello, red: RASM_HAMMA.d_red, big: RASM_HAMMA.d_big, small: RASM_HAMMA.d_small, cat: RASM_HAMMA.cat, apple: RASM_HAMMA.apple, jump: RASM_HAMMA["d_can-jump"] };
  const key = stickerKeys(o?.word || "", 1)[0];
  if (key && CHIZILGAN[key]) return CHIZILGAN[key];
  // REV238: rasmsiz variant — butun rasm kutubxonasidan so'z bo'yicha taxminiy rasm (bog'cha bolasi o'qimaydi)
  const tx = matnIdTaxmin(o?.word || "");
  return (tx && RASM_HAMMA[tx]) || null;
}

// REV153: belgilar qatori — har belgi o'rniga chizilgan rasm, strelka va «?» — oddiy belgi sifatida.
const ISHORA = { "❓": "?", "?": "?", "➡": "→", "→": "→", "⬅": "←", "⬆": "↑", "⬇": "↓", "↔": "↔", "↕": "↕", "🔁": "↻", "🔄": "↻", "➕": "+", "➖": "−", "🟰": "=", "✅": "✓", "❌": "✗", "🚫": "✗" };
// REV158: «🐱1️⃣5️⃣» (15 ta mushuk), «⭐2️⃣0️⃣» — rasm + son; oldin rasm chiqmay, faqat belgi qolardi
function rasmVaSon(p) {
  const e = String(p).replace(/\uFE0F/g, "");
  const m = /^((?:(?!\d)\S)+?)((?:\d\u20E3)+)$/u.exec(e);
  if (!m) return null;
  const r = emojiRasm(m[1], RASM_HAMMA);
  if (!r) return null;
  return [{ src: r.src }, { t: m[2].replace(/\u20E3/g, "") }];
}

export function belgiQatori(emoji) {
  const p = String(emoji || "");
  const rs = p ? rasmVaSon(p) : null;
  if (rs) return rs;
  if (!p || /[\p{N}+=]/u.test(p.replace(/[➕➖🟰]/gu, ""))) return null;
  const g = belgilar(p).filter((x) => !/^[\[\]]$/.test(x));
  if (g.length < 2 || g.length > 12) return null;
  const q = g.map((x) => (ISHORA[x] ? { t: ISHORA[x] } : (emojiRasm(x, RASM_HAMMA) ? { src: emojiRasm(x, RASM_HAMMA).src } : null)));
  return q.every(Boolean) && q.some((x) => x.src) ? q : null;
}

/** REV153: sanoq/naqsh varianti («🍎🍎🍎», «🔴🔵❓») yoki juftlik («🐰➡🥕») — chizilgan rasmlar qatori; bo'lmasa null. */
export function kidOptionQator(picture) {
  return belgiQatori(picture);
}

/** REV158: qator naqshmi (har xil belgilar: 🍎🍌🍎🍌) — bitta satrda ko'rsatiladi; bir xil belgilar (sanoq) — qatorlab. */
export function qatorNaqshmi(qator) {
  return Array.isArray(qator) && new Set(qator.map((x) => x.src || x.t)).size > 1;
}

export { keycapNumber } from "./sanKarta.js";
