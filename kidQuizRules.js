// REV80: bog'cha testi — sof yordamchilar (brauzersiz sinaladi).
import { stripSpeechTags } from '../speech/language.js';

const PICTURE = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[#*0-9]️?⃣|️|‍|\p{Emoji_Modifier}|\s)+)/u;

/** "🐱 cat" → { picture: "🐱", word: "cat" }. Faqat to'ldirilgan variantlar (2–4 ta). */
export function kidOptions(savol, question = savol?.question ?? savol?.savol) {
  if (!savol) return [];
  // REV90: savol o'zi chet so'zni aytmasa («Nima deysiz?») — rasmning o'zi yetmaydi, variantni eshitish kerak.
  const asksForeign = question == null || /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]/i.test(String(question));
  return ['A', 'B', 'C', 'D']
    .map((letter) => ({ letter, raw: String(savol[`option_${letter.toLowerCase()}`] ?? '').trim() }))
    .filter((o) => o.raw)
    .map((o) => {
      const text = stripSpeechTags(o.raw);
      const m = PICTURE.exec(text);
      const picture = m ? m[1].replace(/\s+/g, '') : '';
      const word = (m ? text.slice(m[0].length) : text).trim();
      // REV89: til kitobida variant teglanadi ([en]cat[/en]) — bola so'zni o'qimaydi, ESHITADI.
      const tag = /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]/i.exec(o.raw);
      const lang = tag ? tag[1].toLowerCase() : '';
      return { ...o, picture, word, lang, speech: lang ? `[${lang}]${word}[/${lang}]` : word, listen: listenMode(lang, picture, word, asksForeign) };
    });
}

const PRAISE = ['Barakalla!', 'Zo‘r! Juda to‘g‘ri!', 'Ofarin, aqlli bola!', 'Ajoyib! Yana bitta yulduzcha!', 'Qoyil! To‘ppa-to‘g‘ri!'];
export function kidPraise(i = 0) {
  return PRAISE[Math.abs(Number(i) || 0) % PRAISE.length];
}

export function kidTheme(jins) {
  return jins === 'qiz' ? 'girl' : jins === 'ogil' ? 'boy' : 'neutral';
}

/** Bog'cha bolasimi (profil yoki mavzu yosh guruhi bo'yicha). */
export function isPreschoolLearner(user, grade = '') {
  if (user?.bogcha_mi || user?.education_role === 'bogcha' || user?.learning_profile?.role === 'bogcha') return true;
  return /\byosh\b/i.test(String(grade || ''));
}

/** Tinglash rejimi: «picture» — faqat rasm; «audio» — rasm + 🔊 (ibora yoki rasmsiz variant); «» — oddiy. */
export function listenMode(lang, picture, word, asksForeign = true) {
  if (!lang) return '';
  const phrase = /\s/.test(String(word || '').trim());
  return picture && !phrase && asksForeign ? 'picture' : 'audio';
}
