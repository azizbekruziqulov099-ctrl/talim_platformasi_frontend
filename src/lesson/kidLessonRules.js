// REV95: bog'cha darsi — sof yordamchilar.
/** REV95: bog'cha ovozi yoshga qarab sekinroq: 3–4 yoshga eng sekin, 6–7 yoshga deyarli oddiy. */
export function kidRate(grade) {
  const m = /(\d)\s*[-–]\s*(\d)/.exec(String(grade || ""));
  const from = m ? Number(m[1]) : 5;
  return from <= 2 ? "-18%" : from === 3 ? "-15%" : from === 4 ? "-12%" : from === 5 ? "-8%" : "-5%";
}

/** REV122: jonli ustoz (odam) — kichiklarga sal sekinroq, lekin tabiiy suhbat tezligida (robotdek cho'zilmaydi). */
export function ustozRate(grade) {
  const m = /(\d)\s*[-–]\s*(\d)/.exec(String(grade || ""));
  const from = m ? Number(m[1]) : 5;
  return from <= 3 ? "-10%" : from <= 5 ? "-6%" : "-3%";
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
    // REV121: izoh tilidagi (rus/ingliz) tushuntirish — o'rganiladigan ibora emas, takrorlatilmaydi
    if (lang.toLowerCase() === izoh) return "";
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
export function kidRepeatSpeech(text, { doska = "", izoh = "uz" } = {}) {
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
  // REV140: o'zbekcha dars (chet so'z yo'q) — doskadagi so'zlar («⛄ qorbobo») aytiladi
  if (!phrases.length && (!izoh || izoh === "uz")) {
    for (const line of String(doska || "").replace(/\[\/?[a-z]{2}\]/gi, "").split(/\n+|\s{2,}/)) {
      const body = line.split(/\s+/).filter((t) => /\p{L}/u.test(t)).join(" ").replace(/[.!?:;,—–-]+$/u, "").trim();
      if (!body || body.split(/\s+/).length > 3) continue;
      if (!phrases.some((p) => p.body.toLowerCase() === body.toLowerCase())) phrases.push({ lang: "", body: body.charAt(0).toLocaleUpperCase("uz") + body.slice(1) });
      if (phrases.length >= 3) break;
    }
  }
  if (!phrases.length) return src;
  // REV140: ustoz har so'zni AVVAL o'zi ikki marta aniq aytadi, keyin bolaga qaytarish uchun jimlik
  const ayt = (p, b) => (p.lang ? `[${p.lang}]${b}[/${p.lang}]` : b);
  return `${src} ${phrases.map((p) => `${ayt(p, `${p.body}.`)} ${ayt(p, `${p.body}!`)} ⏸`).join(" ")}`;
}

// REV140: «Endi sen ayt: Hello ⏸» — bola so'zni bir marta eshitib ulgurmaydi. Ustoz avval so'zni (nomini) o'zi aytadi
// va takrorlaydi, keyin «Endi sen ayt!» deydi va bolaga jimlik qoldiradi: «Hello. Hello! Endi sen ayt! ⏸».
// So'z shu buyruqdan oldin aytilgan bo'lsa — yana bir marta (jami ikki marta) aytiladi.
const BUYRUQ = "Endi sen ayt|Endi sen ham ayt|Sen ham ayt|Qani,? sen ham ayt|Birga aytamiz|Keling,? birga aytamiz|Men bilan ayt|Takrorla|Sen ham shunday javob ber|"
  + "Теперь ты скажи|Теперь скажи ты|Скажем вместе|Давай скажем вместе|Повтори|Скажи со мной|"
  + "Now you say it|Now you say|Let[’']s say it together|Say it with me|Repeat after me|You say it";
const TEG_SOZ = "\\[(en|ru|de|fr|es|ar|tr|zh|ja|ko|uz)\\]([^\\[\\]]{1,60}?)\\[\\/\\4\\]";   // \\4 — KOLON ichidagi til guruhi
const KOLON = new RegExp(`(\\[(?:uz|ru|en)\\])?(${BUYRUQ})\\s*[:：]\\s*(\\[\\/(?:uz|ru|en)\\])?\\s*${TEG_SOZ}\\s*[.!]?\\s*(⏸)?`, "giu");
const KOLON_UZ = new RegExp(`(${BUYRUQ})\\s*[:：]\\s*([^\\s⏸.!?\\[\\]:][^⏸.!?\\[\\]:\\n]{0,40}?)\\s*[.!?]?\\s*(⏸|$)`, "giu");
const sozToza = (s) => String(s || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

function oldinAytilganmi(oldin, soz) {
  const t = sozToza(String(oldin).replace(/\[\/?[a-z]{2}\]/gi, " ").replace(/⏸/g, " "));
  const w = sozToza(soz);
  return Boolean(w) && (t === w || t.endsWith(` ${w}`));
}

export function ismOldin(text) {
  let s = String(text || "");
  s = s.replace(KOLON, (m, ochiq, buyruq, yopiq, til, soz, _pauza, offset, butun) => {
    const body = soz.trim().replace(/[.!?。！？]+$/u, "");
    if (!body || body.split(/\s+/).length > 5 || NOT_TARGET.test(body)) return m;
    const w = (b) => `[${til}]${b}[/${til}]`;
    const ikki = oldinAytilganmi(butun.slice(0, offset), body) ? w(`${body}!`) : `${w(`${body}.`)} ${w(`${body}!`)}`;
    // REV156: buyruq teg O'RTASIDA bo'lsa («[ru]Послушай и повтори:[/ru] [ru]Спасибо![/ru]») — tartib o'zgarmaydi,
    // aks holda so'z tegning ichiga tushib, teglar buzilardi («[ru]Послушай и [ru]Спасибо.[/ru]… повтори![/ru]»).
    const oldin = butun.slice(0, offset);
    const ochiqQoldi = !ochiq && /\[(?:uz|ru|en)\](?![\s\S]*\[\/(?:uz|ru|en)\])[^\[]*$/i.test(oldin);
    if (ochiqQoldi) return `${buyruq}:${yopiq || ""} ${ikki} ⏸`;
    return `${ikki} ${ochiq || ""}${buyruq}!${yopiq || ""} ⏸`;
  });
  s = s.replace(KOLON_UZ, (m, buyruq, soz, _p, offset, butun) => {
    const body = soz.trim();
    if (!body || body.split(/\s+/).length > 4 || !/\p{L}/u.test(body)) return m;
    const B = body.charAt(0).toLocaleUpperCase("uz") + body.slice(1);
    const ikki = oldinAytilganmi(butun.slice(0, offset), body) ? `${B}!` : `${B}. ${B}!`;
    return `${ikki} ${buyruq}! ⏸`;
  });
  return s;
}

/** REV102: so'z o'rgatiladigan qadam — server «Men bilan ayt: Green» dan keyin bolaga vaqt qoldiradi. */
export function kidTakrorStep(step) {
  return ["qoida", "tushuntirish"].includes(step?.turi);
}


// REV98: robot Kabu ovozi — biroz yuqoriroq va iliqroq (edge-tts pitch, Hz).
export const KID_PITCH = "+8Hz";
