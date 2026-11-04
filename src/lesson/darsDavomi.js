// REV326: dars yarim qolsa — qayerda to'xtagani eslab qolinadi; qaytib kirganda shu joydan davom etadi.
const KALIT = "kabutar:davom:";
const MUDDAT_MS = 21 * 24 * 3600 * 1000;
const xotira = () => { try { return globalThis.localStorage || null; } catch { return null; } };

export function davomSaqla(kod, idx, jami, boshi = 0) {
  const ls = xotira(); if (!ls || !kod || !(jami > 0)) return;
  try { ls.setItem(KALIT + kod, JSON.stringify({ idx, jami, boshi, at: Date.now() })); } catch { /* joy yo'q */ }
}
export function davomOl(kod, now = Date.now()) {
  const ls = xotira(); if (!ls || !kod) return null;
  try {
    const d = JSON.parse(ls.getItem(KALIT + kod) || "null");
    if (!d || !(d.jami > 0) || now - (d.at || 0) > MUDDAT_MS) return null;
    return d;
  } catch { return null; }
}
export function davomTozala(kod) { const ls = xotira(); try { ls?.removeItem(KALIT + kod); } catch { /* */ } }

/** Necha foiz o'tildi (ochilish qismi hisobga kirmaydi). */
export function davomFoiz(d) {
  if (!d) return 0;
  const jami = Math.max(1, d.jami - (d.boshi || 0)), otdi = Math.max(0, d.idx - (d.boshi || 0));
  return Math.max(0, Math.min(99, Math.round((otdi / jami) * 100)));
}
/** Davom ettirish kerakmi: darsning o'zida (ochilishdan keyin) to'xtagan va oxiriga yetmagan bo'lsa. */
export function davomJoyi(d, jami, boshi) {
  if (!d || d.jami !== jami) return null;   // dars o'zgargan — boshidan
  if (d.idx <= boshi + 1 || d.idx >= jami - 1) return null;
  return d.idx;
}
