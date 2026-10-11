// REV123: raqam stikerlari («1️⃣3️⃣») — katta son kartasi uchun (sof funksiya).
/** «1️⃣3️⃣» (raqam stikerlari) → «13»; boshqa narsa bo'lsa — "". Raqam stiker emas, katta chiroyli son bo'lib chiqadi. */
export function keycapNumber(picture) {
  const s = String(picture || "").replace(/\s+/g, "");
  if (!s || !/^(?:[0-9]️?⃣|🔟)+$/u.test(s)) return "";
  return s.replace(/🔟/gu, "10").replace(/️|⃣/g, "");
}
