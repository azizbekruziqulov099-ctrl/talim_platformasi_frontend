// REV95: bog'cha darsi — sof yordamchilar.
/** REV95: bog'cha ovozi yoshga qarab sekinroq: 3–4 yoshga eng sekin, 6–7 yoshga deyarli oddiy. */
export function kidRate(grade) {
  const m = /(\d)\s*[-–]\s*(\d)/.exec(String(grade || ""));
  const from = m ? Number(m[1]) : 5;
  return from <= 2 ? "-18%" : from === 3 ? "-15%" : from === 4 ? "-12%" : from === 5 ? "-8%" : "-5%";
}

/** REV95: topshiriq oxirida — maqtov emas, namuna: undagi chet tilidagi iboralarni bola bilan birga aytamiz. */
export function kidTaskModel(text) {
  const phrases = [];
  String(text || "").replace(/\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]([\s\S]*?)\[\/\1\]/gi, (_, lang, body) => {
    const clean = body.trim();
    if (clean && !phrases.some((p) => p.body === clean)) phrases.push({ lang: lang.toLowerCase(), body: clean });
    return "";
  });
  if (!phrases.length) return "Qani, davom etamiz!";
  return `Keling, birga aytamiz: ${phrases.slice(0, 3).map((p) => `[${p.lang}]${p.body}[/${p.lang}]`).join(" ")} Endi davom etamiz!`;
}


// REV98: robot Kabu ovozi — biroz yuqoriroq va iliqroq (edge-tts pitch, Hz).
export const KID_PITCH = "+8Hz";
