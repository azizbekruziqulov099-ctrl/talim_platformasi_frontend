// REV98: bog'cha darsi sahnasi — yozuvsiz tushuntirish uchun sof qoidalar (testlanadi).

const APOS = /[ʻʼ’‘`´']/g;
const norm = (t) => String(t || "").toLowerCase().replace(APOS, "'");

// Jonli rasm (stiker) kalitlari: inglizcha va o'zbekcha so'zlar → rasm.
const STICKER_WORDS = [
  ["hello", /\b(hello|hi|salom)\b/],
  ["red", /\b(red|qizil)\b/],
  ["three", /\b(three|uchta)\b/],
  // REV102: «katta/kichik» olib tashlandi — «Katta bayram», «katta takrorlash» kabi gaplarda begona rasm chiqardi
  ["big", /\bbig\b/],
  ["small", /\bsmall\b/],
  ["cat", /\b(cat|mushuk|mushukcha)\b/],
  ["apple", /\b(apple|olma)\b/],
  ["jump", /\b(jump|sakra\w*)\b/],
];

/** Matndagi inglizcha [en]…[/en] bo'laklar birinchi o'rinda; bo'lmasa butun matn. Eng ko'pi 2 ta rasm.
 *  REV102: til darsida (teg bor) faqat chet tilidagi so'zlarga qaraladi — o'zbekcha ko'rsatma so'zlari rasm chiqarmaydi. */
export function stickerKeys(text, limit = 2) {
  const raw = String(text || "");
  const en = [...raw.matchAll(/\[en\]([\s\S]*?)\[\/en\]/gi)].map((m) => m[1]).join(" ");
  const tagged = /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]/i.test(raw);
  const out = [];
  for (const src of tagged ? [en] : [en, raw]) {
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

/** REV102: so'z kaliti (server dars_xonasi.soz_kaliti bilan bir xil): «My name is…» → «my name is». */
export function normWord(text) {
  return String(text || "").toLowerCase().replace(/[‘’ʻʼ`´']/g, "").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

const isEmojiToken = (tok) => Boolean(tok) && (!/[\p{L}\p{N}]/u.test(tok) || tok.includes("\u20E3"));

/** REV102: rasm qidiruvi — avval «emoji|so'z», keyin emoji (faqat u boshqa so'zga tegishli bo'lmasa).
 *  Bir emoji ikki so'zda bo'lsa (👋 Hello / 👋 Bye) noto'g'ri rasm chiqmaydi. */
export function pictureFor(emoji, word, map, wordMap) {
  const e = String(emoji || "").replace(/\uFE0F/g, "");
  if (!e) return null;
  const w = normWord(word);
  if (w && wordMap?.[`${e}|${w}`]) return wordMap[`${e}|${w}`];
  const owners = wordMap ? Object.keys(wordMap).filter((k) => k.startsWith(`${e}|`)).length : 0;
  if (owners > 1 || (w && owners === 1)) return null;
  return map?.[e] || null;
}

/** REV99: doska matnidagi emojilar → kitob rasmlari (takrorlanmasdan, tartib bilan).
 *  REV102: har emoji o'z qatoridagi so'z bilan birga qidiriladi («🟢 green» → green rasmi). */
export function emojiPictures(text, map, wordMap = null) {
  if (!map && !wordMap) return [];
  const out = [];
  for (const line of String(text || "").split(/\n+/)) {
    const toks = line.split(/\s+/).filter(Boolean);
    toks.forEach((tok, i) => {
      if (!isEmojiToken(tok)) return;
      const rest = [];
      for (let j = i + 1; j < toks.length && !isEmojiToken(toks[j]); j += 1) rest.push(toks[j]);
      const url = pictureFor(tok, rest.join(" "), map, wordMap);
      if (url && !out.includes(url)) out.push(url);
    });
  }
  return out;
}

// REV102: takror va yangi bilim bola va ota-onaga yaqqol ko'rinsin (har yosh va har fan uchun bir xil belgilar).
const REVIEW_TITLE = /^\s*🔁|^\s*(?:eslaymiz|esingdami|takror\w*|remember|do you remember)\b/i;
const REVIEW_TOPIC = /takror|eslaymiz|o['‘’ʻ]?tgan yil|hammasini|mustahkam/i;

/** Mavzu butunlay takrorlash darsimi: «3-bo'lim takrori: …», «O'tgan yilni eslaymiz», «Katta bayram: hammasini takrorlaymiz». */
export function isReviewTopic(name) {
  return REVIEW_TOPIC.test(String(name || ""));
}

/** Dars qadami turi: intro | review | new | game | summary. Kitob qadamlarining sarlavhasi va turidan aniqlanadi. */
export function stepKind(step, topicName = "") {
  if (!step) return "";
  const turi = step.turi || "";
  if (turi === "kirish") return "intro";
  if (turi === "xulosa") return "summary";
  if (turi === "amaliy" || turi === "birga") return "game";
  if (REVIEW_TITLE.test(String(step.sarlavha || "")) || isReviewTopic(topicName)) return "review";
  return "new";
}

/** Test savoli eski darsdanmi («🔁 Eski savol», «🔁 Old question»). */
export function isReviewQuestion(q) {
  return /^\s*🔁|eski savol|old question/i.test(String(q?.sarlavha || ""));
}

const KIND_BADGE = { review: ["🔁", "Takrorlash"], new: ["✨", "Yangi"], game: ["🎲", "O‘yin"], summary: ["🌟", "Bugun o‘rgandik"] };
export function kindBadge(kind) {
  return KIND_BADGE[kind] || null;
}

/** Takrordan yangiga (va aksincha) o'tganda robot buni aytadi. Matn butunlay inglizcha bo'lsa — inglizcha. */
const CUE = {
  ru: { review: "[ru]Сначала вспомним пройденное![/ru]", word: "[ru]А теперь — новое слово![/ru]", know: "[ru]А теперь — новое знание![/ru]" },
  en: { review: "[en]Let’s remember![/en]", word: "[en]Now, a new word![/en]", know: "[en]Now, something new![/en]" },
};

export function kindCue(kind, prevKind, text = "", topicName = "", izoh = "uz") {
  if (kind === prevKind || isReviewTopic(topicName)) return "";
  // REV111: miya rus yoki ingliz tilida tushuntirilsa — ustoz ham shu tilda gapiradi
  if (CUE[izoh]) {
    if (kind === "review") return CUE[izoh].review;
    if (kind === "new" && prevKind) return /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]/i.test(String(text)) ? CUE[izoh].word : CUE[izoh].know;
    return "";
  }
  const raw = String(text || "");
  const foreign = /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]/i.test(raw);
  const allEnglish = /\[en\]/i.test(raw) && !raw.replace(/\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\][\s\S]*?\[\/\1\]/gi, "").replace(/[^\p{L}]/gu, "");
  if (kind === "review") return allEnglish ? "[en]Let’s remember![/en]" : "Avval o‘tganlarni eslaymiz!";
  if (kind === "new" && prevKind) return allEnglish ? "[en]Now, a new word![/en]" : foreign ? "Endi — yangi so‘z!" : "Endi — yangi bilim!";
  return "";
}

// ── REV121: doska kartalari va «Top-chi» o'yini ──
const TAGS_ALL = /\[\/?(?:uz|en|ru|de|fr|es|ar|tr|zh|ja|ko)\]/gi;
const LEAD_MARK = /^[\s🔁🕊✨️]+/u;
const PIC_PREFIX = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[#*0-9]️?⃣|️|‍|\p{Emoji_Modifier}|[+=?❓])+)\s+(.+)$/u;

/** Doskadagi rasm-belgilar (emoji, son, ishora) — har qator yoki guruh («  » bilan ajratilgan) alohida karta.
 *  Sanoq saqlanadi («🍎🍎🍎» — uchta olma), so'zlar tashlanadi (bola o'qimaydi, ustoz aytadi). */
export function boardCards(text, limit = 4) {
  const out = [];
  for (const raw of String(text || "").replace(TAGS_ALL, "").split(/\n+|\s{2,}/)) {
    const kept = raw.split(/\s+/).filter((tok) => tok && !/\p{L}/u.test(tok)).join(" ")
      .replace(LEAD_MARK, "").replace(/[\s,.;:—–-]+$/u, "").trim();
    if (!kept || !/[\p{Extended_Pictographic}\p{N}❓]/u.test(kept)) continue;
    if (!out.includes(kept)) out.push(kept);
    if (out.length >= limit) break;
  }
  return out;
}

/** Test savolidagi rasmli qism («🔴🔵🔴🔵❓ Keyingisi qaysi?» → «🔴🔵🔴🔵❓»). Bo'lmasa — «». */
export function questionCard(savol) {
  return boardCards(savol, 1)[0] || "";
}

/** Karta uzunligi (grafema soni) — shrift o'lchami shunga qarab tanlanadi. */
export function cardSize(text) {
  const t = String(text || "").replace(/\s+/g, "");
  let n = 0;
  try { n = [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(t)].length; } catch { n = Math.ceil(t.length / 2); }
  return n <= 2 ? "xl" : n <= 4 ? "lg" : n <= 7 ? "md" : "sm";
}

/** «Top-chi» o'yini nishonlari: doskadagi har guruh — bitta nishon; so'zi shu darsning yangi bilim qadamlari
 *  sarlavhasidan («🐱🐱 Bir xil», «🍎 Apple — olma»). Kamida 2 ta topilsa — o'yin, aks holda []. */
export function lessonWords(steps = [], kinds = []) {
  const words = new Map();
  steps.forEach((s, i) => {
    if (kinds[i] !== "new") return;
    const m = PIC_PREFIX.exec(String(s?.sarlavha || "").replace(TAGS_ALL, "").trim());
    if (!m) return;
    const key = m[1].replace(/️/g, "");
    const word = m[2].split(/\s+[—–-]\s+/)[0].trim();
    if (word && !words.has(key)) words.set(key, word);
  });
  return words;
}

export function gameTargets(step, steps = [], kinds = []) {
  const words = lessonWords(steps, kinds);
  const out = [];
  for (const g of String(step?.doska || "").replace(TAGS_ALL, "").split(/\s{2,}|\n+/).map((x) => x.trim()).filter(Boolean)) {
    const key = g.replace(/️/g, "");
    const word = words.get(key);
    if (word && !out.some((x) => x.key === key)) out.push({ key, emoji: g, word });
  }
  return out.length >= 2 ? out.slice(0, 4) : [];
}

/** Bola o'yinda nechta yulduz oldi — darsning umumiy natijasi (test + o'yin). 0 ta to'g'ri — 0 yulduz. */
export function kidStars(togri, jami) {
  const t = Math.max(0, Number(togri) || 0), j = Math.max(0, Number(jami) || 0);
  if (!j) return 1;
  if (!t) return 0;
  const r = t / j;
  return r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1;
}
