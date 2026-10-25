// REV175: maktab til darsidagi yangi so'zlar (AI miya qadamlari: sarlavha «📏 die Zeitachse — vaqt chizig'i», doska «📏 die Zeitachse\nvaqt chizig'i\nMisol…»).
// Repetitor shu so'zlar bilan ishlaydi: harflab aytadi, daftarga ko'p marta yozdiradi, eshitib yozdiradi, ikki tomonga tarjima qildiradi.

const EMOJI = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[⃣️‍]|\p{Emoji_Modifier})+)\s*/u;
const TOZA = (s) => String(s || "").replace(/\[\/?[a-z]{2}\]/g, "").replace(/\s+/g, " ").trim();

/** So'zdan barqaror id: «d» + til + qisqa xesh (lotin bo'lmagan yozuvlar ham) — server faqat [a-z0-9_-] qabul qiladi. */
export function darsSozId(til, soz) {
  let h = 5381;
  for (const ch of String(soz).normalize("NFC").toLowerCase()) h = ((h * 33) ^ ch.codePointAt(0)) >>> 0;
  return `d${String(til || "x").toLowerCase().replace(/[^a-z]/g, "")}_${h.toString(36)}`;
}

/** Bitta qadamdan yangi so'z: {emoji, soz, tarjima, misol} yoki null. Sarlavha «X — Y», doska 1-qatori X, 2-qatori Y bo'lishi kerak. */
export function qadamSozi(step) {
  const sar = TOZA(step?.sarlavha);
  const m = /^(.*?)\s+[—–-]\s+(.+)$/u.exec(sar);
  if (!m) return null;
  const e = EMOJI.exec(m[1]);
  const emoji = e ? e[1] : "";
  const soz = TOZA(m[1].replace(EMOJI, ""));
  const tarjima = TOZA(m[2]);
  if (!soz || !tarjima || soz.length > 60 || tarjima.length > 80) return null;
  const qatorlar = String(step?.doska || "").split("\n").map(TOZA).filter(Boolean);
  const birinchi = TOZA((qatorlar[0] || "").replace(EMOJI, ""));
  if (birinchi !== soz || (qatorlar[1] && qatorlar[1] !== tarjima)) return null;
  return { emoji, soz, tarjima, misol: qatorlar[2] || "" };
}

/** Darsning yangi so'zlari — Repetitor uchun so'z ko'rinishida: {id, emoji, w: {[til]: soz, [iz]: tarjima, uz}, misol, dars}. */
export function maktabDarsSozlari(steps = [], til = "", iz = "uz", dars = "") {
  if (!til) return [];
  const out = [];
  const bor = new Set();
  for (const s of steps) {
    const x = qadamSozi(s);
    if (!x) continue;
    const id = darsSozId(til, x.soz);
    if (bor.has(id)) continue;
    bor.add(id);
    out.push({ id, emoji: x.emoji, w: { [til]: x.soz, [iz]: x.tarjima, uz: iz === "uz" ? x.tarjima : x.tarjima }, misol: x.misol, dars });
  }
  return out.slice(0, 20);
}
