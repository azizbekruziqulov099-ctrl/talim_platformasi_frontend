// REV123: test variantining rasmi — bog'cha darsi va «O'ynaymiz» testida bir xil qoida.
import { belgilar, pictureFor, sanoqKarta, stickerKeys } from "./kidStageRules.js";
import { emojiRasm, matnId, sozId } from "./rasmHarakat.js";
import { RASM_HAMMA } from "./darsRasm.js";
import { RASMLAR } from "./xonalar/rasmlar.js";

/** Variant so'zi/emojisiga mos rassom rasmi, bo'lmasa kitob rasmi (emoji+so'z → emoji), bo'lmasa null. */
export function kidOptionPic(o, rasmlar, mediaUrl, rasmSozlar = null) {
  // REV153: avval rassom chizgan rasm, keyin kitobdagi rasm (kitob paketlaridagi eski rasmlar o'yinchoqqa o'xshaydi)
  const mt = matnId(o?.word);   // REV153: so'z istalgan tilda (arab, nemis, rus…) — chizilgan rasm
  const chizilgan = (mt && RASM_HAMMA[mt] ? { id: mt, src: RASM_HAMMA[mt] } : null) || emojiRasm(o?.picture, RASM_HAMMA) || (() => { const id = sozId({ soz: o?.word, emoji: o?.picture }); return id && RASM_HAMMA[id] ? { id, src: RASM_HAMMA[id] } : null; })();   // REV144: emoji o'rniga rassom chizgan rasm
  if (chizilgan) return chizilgan.src;
  const own = pictureFor(o?.picture, o?.word, rasmlar, rasmSozlar);
  if (own) return mediaUrl ? mediaUrl(own) : own;
  // REV153: kod bilan chizilgan SVG stikerlar ishlatilmaydi — faqat rassom rasmlari (so'z orqali), aks holda belgi/son
  const CHIZILGAN = { hello: RASM_HAMMA.d_hello, red: RASM_HAMMA.d_red, big: RASM_HAMMA.d_big, small: RASM_HAMMA.d_small, cat: RASM_HAMMA.cat, apple: RASM_HAMMA.apple, jump: RASM_HAMMA["d_can-jump"] };
  const key = stickerKeys(o?.word || "", 1)[0];
  return (key && CHIZILGAN[key]) || null;
}

/** REV153: sanoq/naqsh varianti («🍎🍎🍎», «🔴🔵❓») — har belgi o'rniga chizilgan rasm; bo'lmasa null (emoji qoladi). */
export function kidOptionQator(picture) {
  const p = String(picture || "");
  if (!p || !sanoqKarta(p) || /[\p{N}+=]/u.test(p)) return null;
  const g = belgilar(p);
  if (g.length < 2 || g.length > 12) return null;
  const q = g.map((x) => (/^[❓?]$/.test(x) ? { t: "?" } : (emojiRasm(x, RASM_HAMMA) ? { src: emojiRasm(x, RASM_HAMMA).src } : null)));
  return q.every(Boolean) && q.some((x) => x.src) ? q : null;
}

export { keycapNumber } from "./sanKarta.js";
