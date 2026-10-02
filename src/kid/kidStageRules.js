// REV98: bog'cha darsi sahnasi — yozuvsiz tushuntirish uchun sof qoidalar (testlanadi).

const APOS = /[ʻʼ’‘`´']/g;
const norm = (t) => String(t || "").toLowerCase().replace(APOS, "'");

// Jonli rasm (stiker) kalitlari: inglizcha va o'zbekcha so'zlar → rasm.
const STICKER_WORDS = [
  ["hello", /\b(hello|hi|salom)\b/],
  ["red", /\b(red|qizil)\b/],
  ["three", /\b(three|uchta)\b/],
  ["big", /\b(big|katta)\b/],
  ["small", /\b(small|kichik|kichkina)\b/],
  ["cat", /\b(cat|mushuk|mushukcha)\b/],
  ["apple", /\b(apple|olma)\b/],
  ["jump", /\b(jump|sakra\w*)\b/],
];

/** Matndagi inglizcha [en]…[/en] bo'laklar birinchi o'rinda; bo'lmasa butun matn. Eng ko'pi 2 ta rasm. */
export function stickerKeys(text, limit = 2) {
  const raw = String(text || "");
  const en = [...raw.matchAll(/\[en\]([\s\S]*?)\[\/en\]/gi)].map((m) => m[1]).join(" ");
  const out = [];
  for (const src of [en, raw]) {
    const t = norm(src);
    for (const [key, re] of STICKER_WORDS) {
      if (out.length >= limit) return out;
      if (!out.includes(key) && re.test(t)) out.push(key);
    }
    if (out.length) return out;
  }
  return out;
}

/** Topshiriqdagi harakat: qo'shiq, qarsak, ko'rsatish, takrorlash, sakrash, qo'l silkitish. */
export function stepActions(text) {
  const t = norm(text);
  const acts = [];
  if (/qo'?shiq|ashula|kuyla/.test(t)) acts.push("song");
  if (/qarsak/.test(t)) acts.push("clap");
  if (/ko'?rsat|barmog'?|bosing|bos\b|top(ing|chi)?\b/.test(t)) acts.push("point");
  if (/takrorla|men bilan ayt|birga ayt|qaytar|ayting|aytamiz|ayt\b/.test(t)) acts.push("say");
  if (/qo'?l silkit|silkita/.test(t)) acts.push("wave");
  if (/sakra/.test(t)) acts.push("jump");
  return acts;
}

/** Robot holati: dars turi va hozirgi bosqichga qarab. */
export function kabuMood(step, phase) {
  const turi = step?.turi || "";
  if (phase === "happy") return "happy";
  if (phase === "enc") return "enc";
  if (phase === "speaking") {
    if (turi === "kirish") return "wave talk";
    if (turi === "xulosa") return "happy talk";
    return "talk";
  }
  if (phase === "waiting") return turi === "amaliy" || turi === "birga" ? "think" : "";
  if (phase === "hello") return "wave";
  return "";
}

/** Matndagi qahramon — robot Kabu: «Kabutar qushcha … Gu-gu» → «robot Kabu … Bip-bip». */
export function kabuSpeech(text) {
  return String(text || "")
    .replace(/kabutar\s+qushcha(?:man|dir)?/gi, (m) => (/man$/i.test(m) ? "robot Kabuman" : "robot Kabu"))
    .replace(/\bgu-?gu(-gu)*\b!?/gi, "Bip-bip!")
    .replace(/\bqushcha\b/gi, "robot")
    // REV100: chet tili bo'laklarida ham qahramon — robot Kabu
    .replace(/\bKabutar the bird\b/g, "Kabu the robot")
    .replace(/\bKabutar\b/g, "Kabu");
}

/** REV99: doska matnidagi emojilar → kitob rasmlari (takrorlanmasdan, tartib bilan). */
export function emojiPictures(text, map) {
  if (!map) return [];
  const out = [];
  for (const tok of String(text || "").split(/\s+/)) {
    const key = tok.replace(/\uFE0F/g, "");
    if (!key || (/[\p{L}\p{N}]/u.test(key) && !key.includes("\u20E3"))) continue;
    const url = map[key];
    if (url && !out.includes(url)) out.push(url);
  }
  return out;
}
