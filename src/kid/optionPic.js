// REV123: test variantining rasmi — bog'cha darsi va «O'ynaymiz» testida bir xil qoida.
import { pictureFor, stickerKeys } from "./kidStageRules.js";
import { emojiRasm, sozId } from "./rasmHarakat.js";
import { RASM_HAMMA } from "./darsRasm.js";
import { RASMLAR } from "./xonalar/rasmlar.js";

/** Variant so'zi/emojisiga mos kitob rasmi (emoji+so'z → emoji), bo'lmasa so'zga mos ichki rasm, bo'lmasa null. */
export function kidOptionPic(o, rasmlar, mediaUrl, rasmSozlar = null) {
  const own = pictureFor(o?.picture, o?.word, rasmlar, rasmSozlar);
  if (own) return mediaUrl ? mediaUrl(own) : own;
  const chizilgan = emojiRasm(o?.picture, RASM_HAMMA) || (() => { const id = sozId({ soz: o?.word, emoji: o?.picture }); return id && RASM_HAMMA[id] ? { id, src: RASM_HAMMA[id] } : null; })();   // REV144: emoji o'rniga rassom chizgan rasm
  if (chizilgan) return chizilgan.src;
  // REV153: kod bilan chizilgan SVG stikerlar ishlatilmaydi — faqat rassom rasmlari (so'z orqali), aks holda belgi/son
  const CHIZILGAN = { hello: RASM_HAMMA.d_hello, red: RASM_HAMMA.d_red, big: RASM_HAMMA.d_big, small: RASM_HAMMA.d_small, cat: RASM_HAMMA.cat, apple: RASM_HAMMA.apple, jump: RASM_HAMMA["d_can-jump"] };
  const key = stickerKeys(o?.word || "", 1)[0];
  return (key && CHIZILGAN[key]) || null;
}

export { keycapNumber } from "./sanKarta.js";
