// REV95: bog'cha darsi — sof yordamchilar.
/** REV95: bog'cha ovozi yoshga qarab sekinroq: 3–4 yoshga eng sekin, 6–7 yoshga deyarli oddiy. */
export function kidRate(grade) {
  const m = /(\d)\s*[-–]\s*(\d)/.exec(String(grade || ""));
  const from = m ? Number(m[1]) : 5;
  return from <= 2 ? "-18%" : from === 3 ? "-15%" : from === 4 ? "-12%" : from === 5 ? "-8%" : "-5%";
}

/** REV95: topshiriq oxirida — maqtov emas, namuna: undagi chet tilidagi iboralarni bola bilan birga aytamiz. */
const TASK = {
  ru: { go: "[ru]Ну что, продолжаем![/ru]", lead: "[ru]Давай скажем вместе:[/ru]", end: "[ru]А теперь продолжаем![/ru]" },
  en: { go: "[en]Let’s go on![/en]", lead: "[en]Let’s say it together:[/en]", end: "[en]Now let’s go on![/en]" },
};

export function kidTaskModel(text, izoh = "uz") {
  const phrases = [];
  String(text || "").replace(/\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]([\s\S]*?)\[\/\1\]/gi, (_, lang, body) => {
    const clean = body.trim();
    if (clean && !phrases.some((p) => p.body === clean)) phrases.push({ lang: lang.toLowerCase(), body: clean });
    return "";
  });
  const T = TASK[izoh];
  if (!phrases.length) return T ? T.go : "Qani, davom etamiz!";
  // REV102: har iboradan keyin «⏸» — server bolaga qaytarish uchun 1.5–3 soniya jimlik qo'yadi.
  const list = phrases.slice(0, 3).map((p) => `[${p.lang}]${p.body}[/${p.lang}] ⏸`).join(" ");
  return T ? `${T.lead} ${list} ${T.end}` : `Keling, birga aytamiz: ${list} Endi davom etamiz!`;
}

const FOREIGN = /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]([\s\S]*?)\[\/\1\]/gi;
const TOGETHER_END = /(?:(?:men\s+bilan\s+)?(?:birga\s+)?(?:ayt|takrorla|qaytar)\w*|say it together|say it with me|repeat after me)\s*[!.:]?\s*$/i;
const NOT_TARGET = /^(?:say it together|say it with me|repeat after me|look|listen|listen and repeat|again|one more time|your turn|now you|good job|well done|great job)$/i;

/** REV102: qadam «Qani, birga aytamiz!» bilan tugasa-yu, undan keyin so'z aytilmasa — bola nimani aytishini bilmaydi.
 *  Shu qadamdagi chet so'zlar (4 tagacha) qayta aytiladi, har biridan keyin «⏸» (bolaga qaytarish vaqti). */
export function kidRepeatSpeech(text) {
  const src = String(text || "");
  const plain = src.replace(FOREIGN, "$2").trim();
  if (!TOGETHER_END.test(plain)) return src;
  const phrases = [];
  for (const m of src.matchAll(FOREIGN)) {
    const lang = m[1].toLowerCase();
    const body = m[2].trim().replace(/[.!?。！？]+$/u, "");
    if (!body || /[:：]$/.test(body) || body.split(/\s+/).length > 4 || NOT_TARGET.test(body)) continue;
    if (!phrases.some((p) => p.lang === lang && p.body.toLowerCase() === body.toLowerCase())) phrases.push({ lang, body });
    if (phrases.length >= 4) break;
  }
  if (!phrases.length) return src;
  return `${src} ${phrases.map((p) => `[${p.lang}]${p.body}.[/${p.lang}] ⏸`).join(" ")}`;
}

/** REV102: so'z o'rgatiladigan qadam — server «Men bilan ayt: Green» dan keyin bolaga vaqt qoldiradi. */
export function kidTakrorStep(step) {
  return ["qoida", "tushuntirish"].includes(step?.turi);
}


// REV98: robot Kabu ovozi — biroz yuqoriroq va iliqroq (edge-tts pitch, Hz).
export const KID_PITCH = "+8Hz";
