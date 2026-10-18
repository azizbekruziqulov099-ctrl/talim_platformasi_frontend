// REV123: test variantining rasmi — bog'cha darsi va «O'ynaymiz» testida bir xil qoida.
import { pictureFor, stickerKeys } from "./kidStageRules.js";
import { stickerUrl } from "./stickers.js";
import { emojiRasm, sozId } from "./rasmHarakat.js";
import { RASM_HAMMA } from "./darsRasm.js";
import { RASMLAR } from "./xonalar/rasmlar.js";

/** Variant so'zi/emojisiga mos kitob rasmi (emoji+so'z → emoji), bo'lmasa so'zga mos ichki rasm, bo'lmasa null. */
export function kidOptionPic(o, rasmlar, mediaUrl, rasmSozlar = null) {
  const own = pictureFor(o?.picture, o?.word, rasmlar, rasmSozlar);
  if (own) return mediaUrl ? mediaUrl(own) : own;
  const chizilgan = emojiRasm(o?.picture, RASM_HAMMA) || (() => { const id = sozId({ soz: o?.word, emoji: o?.picture }); return id && RASM_HAMMA[id] ? { id, src: RASM_HAMMA[id] } : null; })();   // REV144: emoji o'rniga rassom chizgan rasm
  if (chizilgan) return chizilgan.src;
  const key = stickerKeys(o?.word || "", 1)[0];
  return key ? stickerUrl(key) : null;
}

export { keycapNumber } from "./sanKarta.js";
