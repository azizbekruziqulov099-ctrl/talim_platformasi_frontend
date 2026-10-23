import { IMMERSIYA } from "./immersiyaTillari.js";
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
// REV157: 4–7 yosh — dars to'liq o'rganilayotgan tilda; o'tish gaplari ham shu tilda
for (const [til, d] of Object.entries(IMMERSIYA)) {
  if (!CUE[til]) CUE[til] = Object.fromEntries(Object.entries(d.CUE).map(([k, v]) => [k, `[${til}]${v}[/${til}]`]));
}

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

/** REV164: o'yin uchun so'zlar — darsning yangi so'zlari; ular kam bo'lsa (takror darsi, uy topshirig'i darsi)
 *  yangi bilim va takror qadamlari doskasidagi «🍎 Bitta» qatorlaridan ham olinadi. */
export function tapWords(steps = [], kinds = []) {
  const words = lessonWords(steps, kinds);
  if (words.size >= 2) return words;
  steps.forEach((s, i) => {
    if (kinds[i] !== "new" && kinds[i] !== "review") return;
    for (const line of String(s?.doska || "").replace(TAGS_ALL, "").split(/\n+/)) {
      const m = PIC_PREFIX.exec(line.trim());
      if (!m) continue;
      const key = m[1].replace(/️/g, "");
      const word = m[2].split(/\s+[—–-]\s+/)[0].trim();
      if (word && !/^[\p{P}\s]+$/u.test(word) && !words.has(key)) words.set(key, word);
    }
  });
  return words;
}

/** REV164: darsda bosib topiladigan o'yin bo'lmasa (masalan, faqat uy topshirig'i yoki harakatli o'yin) — tushuntirishdan
 *  keyin «🎲 Top-chi» qadami qo'shiladi: shu darsning rasmlari, bola bosadi, topilganida ✓ chiqadi. Qaytaradi qadam yoki null. */
export function qoshimchaOyin(steps = [], kinds = [], ovoz = "") {
  if (steps.some((s, i) => s?.turi === "amaliy" && gameTargets(s, steps, kinds).length)) return null;
  const words = [...tapWords(steps, kinds)].slice(0, 4);
  if (words.length < 2) return null;
  return { turi: "amaliy", sarlavha: "🎲", doska: "", ovoz, _sintetik: true,
    _nishon: words.map(([key, word]) => ({ key, emoji: key, word })) };
}

export function gameTargets(step, steps = [], kinds = []) {
  if (Array.isArray(step?._nishon) && step._nishon.length >= 2) return step._nishon.map(tozaNishon);
  const words = lessonWords(steps, kinds);
  const out = [];
  for (const g of String(step?.doska || "").replace(TAGS_ALL, "").split(/\s{2,}|\n+/).map((x) => x.trim()).filter(Boolean)) {
    const key = g.replace(/️/g, "");
    const word = words.get(key);
    if (word && !out.some((x) => x.key === key)) out.push({ key, emoji: g, word });
  }
  // REV156: «🎲 Top-chi» qadami miyadan doskasi matn bo'lib keladi (emojisiz) — o'yin umuman boshlanmasdi.
  // Shunday bo'lsa, ovozda aytilgan shu darsning so'zlari (aytilish tartibida) nishon bo'ladi.
  if (out.length < 2 && /🎲/u.test(String(step?.sarlavha || "") + String(step?.doska || ""))) {
    const ovoz = String(step?.ovoz || "");
    const norm = (t) => normWord(String(t || "").replace(TAGS_ALL, ""));
    const tegli = [...ovoz.matchAll(/\[(?:en|ru|de|fr|es|ar|tr|zh|ja|ko)\]([\s\S]*?)\[\/(?:en|ru|de|fr|es|ar|tr|zh|ja|ko)\]/gi)].map((m) => norm(m[1]));
    // REV164: o'zbekcha (izohsiz) matematika/mantiq darslarida o'yin gapi tegsiz keladi — butun gap ichidan qidiramiz
    const teglar = tegli.length ? tegli : (ovoz.trim() ? [norm(ovoz)] : []);
    for (const t of teglar) {
      for (const [key, word] of words) {
        if (norm(word) === t && !out.some((x) => x.key === key)) out.push({ key, emoji: key, word });
      }
    }
    // REV157: 4–7 yosh — o'yin gapi butunlay bitta tegda («[de]Spielzeit! … zeigst auf das Bild: Wie heißt du, Ich heiße.[/de]»):
    // shu darsning so'zlari gap ichida qaysi tartibda aytilgan bo'lsa, o'shanday nishon bo'ladi
    if (out.length < 2) {
      const topilgan = [];
      for (const t of teglar) {
        const ichi = ` ${t} `;
        for (const [key, word] of words) {
          const w = norm(word);
          const at = w ? ichi.indexOf(` ${w} `) : -1;
          if (at >= 0 && !topilgan.some((x) => x.key === key)) topilgan.push({ key, word, at });
        }
        if (topilgan.length >= 2) break;
      }
      topilgan.sort((a, b) => a.at - b.at).forEach(({ key, word }) => { if (!out.some((x) => x.key === key)) out.push({ key, emoji: key, word }); });
    }
  }
  return out.length >= 2 ? out.slice(0, 4).map(tozaNishon) : [];
}

// REV164: «🧒🍬 👧🍬 Bittadan» — so'z boshidagi qo'shimcha rasm belgilari ovozda o'qilmasin (rasm kalitda qoladi)
const BOSH_BELGI = /^(?:[\p{Extended_Pictographic}\p{Regional_Indicator}\u{FE0F}\u{200D}\p{Emoji_Modifier}]+\s*)+/u;
function tozaNishon(t) {
  const word = String(t.word || "").replace(BOSH_BELGI, "").trim();
  return word && word !== t.word ? { ...t, word } : t;
}

/** Bola o'yinda nechta yulduz oldi — darsning umumiy natijasi (test + o'yin). 0 ta to'g'ri — 0 yulduz. */
export function kidStars(togri, jami) {
  const t = Math.max(0, Number(togri) || 0), j = Math.max(0, Number(jami) || 0);
  if (!j) return 1;
  if (!t) return 0;
  const r = t / j;
  return r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1;
}

/**
 * REV130: bog'cha darsi boshida faqat O'TGAN mavzu takrorlanadi.
 * Miyadagi «🔁 Eslaymiz» qadamlaridan faqat birinchisi (1 dars oldingi mavzu) qoladi va dars boshiga — salom va
 * ob-havodan keyinga — ko'chiriladi; 3 dars oldingi va boshqa aralash takrorlar olib tashlanadi.
 * Butun mavzu takror bo'lsa («1-bo'lim takrori», «O'tgan yilni eslaymiz») — dars o'zgarmaydi.
 * Natija: { takror: [...], qolgan: [...] }.
 */
export function darsBoshi(steps = [], topicName = "") {
  if (!Array.isArray(steps) || isReviewTopic(topicName)) return { takror: [], qolgan: Array.isArray(steps) ? steps : [] };
  const takror = [], qolgan = [];
  let guruh = 0, oldingiTakror = false, prev = null;
  for (const s of steps) {
    // uzun qadam bo'laklarga bo'linsa, sarlavhasiz davomi oldingisining turini oladi
    const davomi = Boolean(prev && !s?.sarlavha && s?.sahna && s.sahna === prev.sahna);
    const takrorMi = davomi ? oldingiTakror : stepKind(s, topicName) === "review";
    if (takrorMi && !davomi) guruh += 1;
    if (takrorMi) { if (guruh === 1) takror.push(s); }
    else qolgan.push(s);
    oldingiTakror = takrorMi; prev = s;
  }
  return { takror, qolgan };
}

/** REV140: ustoz gapirayotgan so'zlarning rasmlari — qadamda emoji bo'lmasa ham doska bo'sh qolmaydi.
 *  wordMap: kitobdagi rasm_sozlar («🍎|olma» → url). Matnda so'z (yoki ibora) butun so'z sifatida uchrasa — uning rasmi,
 *  matndagi tartib bilan, takrorlanmasdan. */
export function matnRasmlari(text, wordMap, limit = 3) {
  if (!wordMap) return [];
  const matn = ` ${normWord(String(text || "").replace(/\[\/?[a-z]{2}\]/gi, " "))} `;
  if (matn.trim() === "") return [];
  const topildi = [];
  for (const [k, url] of Object.entries(wordMap)) {
    const soz = normWord(k.split("|").slice(1).join("|"));
    if (!soz || soz.length < 2 || !url) continue;
    const i = matn.indexOf(` ${soz} `);
    if (i >= 0) topildi.push({ i, url, n: soz.length });
  }
  // uzunroq ibora avval (bir joyda «qizil olma» va «olma» bo'lsa — iborasi), keyin matndagi tartib
  topildi.sort((a, b) => a.i - b.i || b.n - a.n);
  const out = [];
  for (const x of topildi) {
    if (!out.includes(x.url)) out.push(x.url);
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * REV153: doskadagi har narsa alohida band: «👋 Hello!\nпривет\n🙋 Hi!» → [{emoji:"👋",soz:"Hello"},{emoji:"🙋",soz:"Hi"}].
 * Bir qatorda bir nechta («🟢 Green, 👏 Clap») ham ajratiladi; tarjima qatori (belgisiz) tashlanadi. 6 tagacha — hammasi
 * doskada chiqadi (oldin 2–3 tasi chiqib, qolgani yo'qolardi).
 */
export function doskaBandlari(text, limit = 6) {
  const out = [];
  const qosh = (b) => {
    if (!b || !b.emoji) return;
    const soz = b.soz.split(/\s+[—–-]\s+|[,;:(]/)[0].replace(/[!?.…]+$/u, "").trim();
    const key = `${b.emoji.replace(/️/g, "")}|${normWord(soz)}`;
    if (out.length < limit && !out.some((x) => x.key === key)) out.push({ emoji: b.emoji, soz, key, mano: [] });
  };
  for (const raw of String(text || "").replace(TAGS_ALL, "").split(/\n+|\s{2,}/)) {
    const toks = raw.replace(LEAD_MARK, "").trim().split(/\s+/).filter(Boolean);
    // belgisiz qator — oldingi narsaning tarjimasi/o'qilishi («qizil», «ahmar») — rasmni topish uchun saqlanadi
    if (out.length && toks.length && !toks.some((t) => isEmojiToken(t) && /[\p{Extended_Pictographic}\p{Regional_Indicator}\u20E3❓]/u.test(t))) { out[out.length - 1].mano.push(toks.join(" ")); continue; }
    let cur = null;
    for (const tok of toks) {
      if (isEmojiToken(tok) && /[\p{Extended_Pictographic}\p{Regional_Indicator}\u20E3❓]/u.test(tok)) {
        if (cur && cur.soz) { qosh(cur); cur = null; }
        cur = cur ? { ...cur, emoji: cur.emoji + tok } : { emoji: tok, soz: "" };
        if (/[,;]$/.test(tok)) { qosh(cur); cur = null; }
      } else if (cur) {
        cur.soz = cur.soz ? `${cur.soz} ${tok}` : tok;
        if (/[,;]$/.test(tok)) { qosh(cur); cur = null; }
      }
    }
    qosh(cur);
  }
  return out;
}

/** Sanoq yoki naqsh kartasimi («🍎🍎🍎», «🔴🔵🔴🔵❓», «3️⃣») — bunda rasm emas, belgilar soni ko'rsatiladi. */
export function sanoqKarta(emoji) {
  const e = String(emoji || "").replace(/\uFE0F/g, "");
  if (/[\p{N}+=]/u.test(e)) return true;   // son, sana, misol («2+3»)
  const g = belgilar(e).filter((x) => !/^[❓?]$/.test(x));
  if (!g.length) return true;               // faqat «❓»
  return g.length > 1 && new Set(g).size < g.length;   // «🍎🍎🍎», «🔴🔵🔴🔵❓» — sanoq/naqsh; «🎂❓» — ibora
}

/** Belgilar (grafemalar) ro'yxati: «🍎🍎🍎» → ["🍎","🍎","🍎"]. */
export function belgilar(text) {
  const e = String(text || "").replace(/\uFE0F/g, "");
  try { return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(e)].map((x) => x.segment).filter((x) => x.trim()); } catch { return [...e].filter((x) => x.trim()); }
}

/**
 * REV153: doskada bir nechta rasm bo'lsa — hozir qaysi biri haqida gapirilyapti (o'sha kattalashadi, qolganlari xiralashadi).
 * pics: [{soz, emoji}] · sozlar: ustoz gapining so'zlari · at: hozirgi so'z tartibi (-1 — gapirmayapti) ·
 * mik: bola aytishi kerak bo'lgan so'z («Endi sen ayt: Hello»). Topilmasa -1 (hammasi teng).
 */
export function faolRasm(pics = [], sozlar = [], at = -1, mik = "") {
  if (!Array.isArray(pics) || pics.length < 2) return -1;
  const kalit = pics.map((p) => ({ s: normWord(p?.soz || "").split(" ").filter(Boolean), e: String(p?.emoji || p?.belgi || "").replace(/️/g, "") }));
  if (mik) {
    const m = normWord(mik);
    const i = kalit.findIndex((k) => k.s.length && k.s.join(" ") === m);
    if (i >= 0) return i;
    const j = kalit.findIndex((k) => k.s.length && (m.startsWith(k.s.join(" ")) || k.s.join(" ").startsWith(m)));
    if (j >= 0) return j;
  }
  if (!(at >= 0)) return -1;
  const raw = sozlar.slice(0, at + 1).map((t) => String(t || "").replace(TAGS_ALL, ""));
  const tok = raw.map((t) => normWord(t));
  let best = -1, bestAt = -1;
  kalit.forEach((k, pi) => {
    let last = -1;
    for (let i = tok.length - 1; i >= 0 && last < 0; i -= 1) {
      if (k.e && raw[i].replace(/️/g, "").includes(k.e)) last = i;
      else if (k.s.length && tok[i] === k.s[0] && k.s.every((w, j) => tok[i + j] === w || (i + j >= tok.length && j > 0))) last = i;
    }
    if (last > bestAt) { bestAt = last; best = pi; }
  });
  return best;
}

