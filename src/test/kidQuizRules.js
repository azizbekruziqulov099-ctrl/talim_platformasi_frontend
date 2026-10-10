// REV80: bog'cha testi — sof yordamchilar (brauzersiz sinaladi).
import { stripSpeechTags } from '../speech/language.js';

const PICTURE = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[#*0-9]️?⃣|️|‍|\p{Emoji_Modifier}|\s)+)/u;

/** "🐱 cat" → { picture: "🐱", word: "cat" }. Faqat to'ldirilgan variantlar (2–4 ta). */
export function kidOptions(savol, question = savol?.question ?? savol?.savol) {
  if (!savol) return [];
  // REV90: savol o'zi chet so'zni aytmasa («Nima deysiz?») — rasmning o'zi yetmaydi, variantni eshitish kerak.
  const asksForeign = question == null || /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]/i.test(String(question));
  // REV102: savoldagi ibora variantlardan birida bor bo'lsa — variantlarni ovoz bilan o'qimaymiz (javobni aytib qo'yardi)
  const asked = new Set([...String(question ?? '').matchAll(/\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]([\s\S]*?)\[\/\1\]/gi)].map((m) => answerKey(m[2])));
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
      return { ...o, picture, word, lang, speech: lang ? `[${lang}]${word}[/${lang}]` : word, listen: listenMode(lang, picture, word, asksForeign, asked.has(answerKey(word))) };
    });
}

const PRAISE = ['Barakalla!', 'Zo‘r! Juda to‘g‘ri!', 'Ofarin, aqlli bola!', 'Ajoyib! Yana bitta yulduzcha!', 'Qoyil! To‘ppa-to‘g‘ri!'];
// REV102: til darsida maqtov o'sha tilda aytiladi (bola «Well done!» ni ham o'rganadi).
const FOREIGN_PRAISE = {
  en: ['Well done!', 'Great job!', 'Excellent!', 'That’s right!', 'Super!'],
  ru: ['Молодец!', 'Правильно!', 'Отлично!', 'Умница!', 'Супер!'],
  de: ['Super!', 'Richtig!', 'Sehr gut!', 'Toll gemacht!', 'Prima!'],
  fr: ['Bravo !', 'Très bien !', 'C’est juste !', 'Super !', 'Excellent !'],
  es: ['¡Muy bien!', '¡Correcto!', '¡Excelente!', '¡Bravo!', '¡Genial!'],
  ar: ['أحسنت!', 'ممتاز!', 'صحيح!', 'رائع!', 'برافو!'],
  tr: ['Aferin!', 'Doğru!', 'Harika!', 'Çok güzel!', 'Süper!'],
  zh: ['很好！', '对了！', '太棒了！', '真棒！', '正确！'],
  ja: ['よくできました！', 'せいかい！', 'すごい！', 'じょうず！', 'やったね！'],
  ko: ['잘했어요!', '맞아요!', '최고예요!', '훌륭해요!', '멋져요!'],
};
const TAG = /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]/i;

/** Savol/variantlardagi birinchi chet til tegi: «Qani, toping: [en]Mother[/en]» → «en». Yo'q bo'lsa — «». */
export function contentLanguage(...texts) {
  for (const t of texts.flat()) {
    const m = TAG.exec(String(t ?? ''));
    if (m) return m[1].toLowerCase();
  }
  return '';
}

/** Ovoz uchun maqtov: til darsida — o'sha tilda va teg bilan ([en]Well done![/en]), aks holda o'zbekcha. */
export function kidPraise(i = 0, lang = '') {
  const list = FOREIGN_PRAISE[lang];
  const n = Math.abs(Number(i) || 0);
  if (list) return `[${lang}]${list[n % list.length]}[/${lang}]`;
  return PRAISE[n % PRAISE.length];
}

/** Ekrandagi pufak uchun — tegsiz. */
export function kidPraiseLabel(i = 0, lang = '') {
  return stripSpeechTags(kidPraise(i, lang));
}

/** Kitob izohining boshidagi o'zbekcha maqtovni olib tashlaydi (maqtov endi o'z tilida aytiladi). */
export function dropLeadingPraise(text) {
  let out = String(text ?? '').trim();
  const lead = /^(?:barakalla|zo['‘’ʻ]r|ofarin|qoyil|ajoyib|juda yaxshi|to['‘’ʻ]g['‘’ʻ]ri|to['‘’ʻ]ppa-to['‘’ʻ]g['‘’ʻ]ri)[!.,]*\s*/i;
  for (let k = 0; k < 2 && lead.test(out); k += 1) out = out.replace(lead, '').trim();
  return out;
}

const ANY_PRAISE = /^(\s*(?:\[(?:en|ru|uz)\])?\s*)(?:barakalla|zo['‘’ʻ]r|ofarin|qoyil|ajoyib|to['‘’ʻ]g['‘’ʻ]ri|молодец|умница|здорово|супер|верно|правильно|отлично|well done|great job|awesome|super|right|excellent|bravo)[!.,]*\s*/i;

/** REV121: izoh qaysi tilda bo'lsa ham boshidagi maqtovni olib tashlaydi (xato javobdan keyin «Barakalla» demaslik uchun). */
export function dropPraiseAny(text) {
  let out = String(text ?? '');
  for (let k = 0; k < 2 && ANY_PRAISE.test(out); k += 1) out = out.replace(ANY_PRAISE, '$1');
  return out.replace(/\[(en|ru|uz)\]\s*\[\/\1\]/g, '').trim();
}

/** To'g'ri javobdan keyin aytiladigan gap: til darsida maqtov o'sha tilda, keyin izoh (o'zbekcha maqtovsiz). */
export function kidCorrectSpeech(i, lang, izoh = '') {
  const text = String(izoh ?? '').trim();
  if (!lang && text && dropLeadingPraise(text) !== text) return text;   // izoh o'zi maqtov bilan boshlanadi — ikki marta aytmaymiz
  const rest = lang ? dropLeadingPraise(text) : text;
  return `${kidPraise(i, lang)} ${rest}`.trim();
}

export function kidTheme(jins) {
  return jins === 'qiz' ? 'girl' : jins === 'ogil' ? 'boy' : 'neutral';
}

/** Bog'cha bolasimi (profil yoki mavzu yosh guruhi bo'yicha). */
export function isPreschoolLearner(user, grade = '') {
  if (user?.bogcha_mi || user?.education_role === 'bogcha' || user?.learning_profile?.role === 'bogcha') return true;
  return /\byosh\b/i.test(String(grade || ''));
}

const answerKey = (t) => String(t || '').toLowerCase().replace(/[‘’ʻʼ`´']/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

/** Tinglash rejimi: «picture» — faqat rasm; «audio» — rasm + 🔊 (ibora yoki rasmsiz variant); «» — oddiy.
 *  echoed — savolning o'zi shu iborani aytadi: rasmli variant o'qilmaydi (aks holda bola eshitib, javobni topib oladi). */
export function listenMode(lang, picture, word, asksForeign = true, echoed = false) {
  if (!lang) return '';
  const phrase = /\s/.test(String(word || '').trim());
  if (picture && echoed) return 'picture';
  return picture && !phrase && asksForeign ? 'picture' : 'audio';
}
