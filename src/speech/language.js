// Detect the three reading languages supported by the education content.
// Explicit content tags win; ambiguous names/formulas inherit the surrounding text.
export const SPEECH_LOCALES = { uz: 'uz-UZ', en: 'en-US', ru: 'ru-RU' };
export function protectSpeechMath(value) {
  const formulas=[];
  const text=String(value).replace(/\[lat\][\s\S]*?\[\/lat\]|\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/gi,formula=>{
    formulas.push(formula);return `\uE000${formulas.length-1}\uE001`;
  });
  return {text,restore:part=>part.replace(/\uE000(\d+)\uE001/g,(match,index)=>formulas[Number(index)]??match)};
}
const ENGLISH = new Set(('a an the is are am was were be been being this that these those there here it its i you he she we they my your his her our their and or but of to in on at by for from with without as if not no yes have has had do does did can could will would should must what which who where when why how find choose select correct answer question following sentence word read write listen say english hello world goodbye thanks thank please good morning afternoon evening night apple book school teacher student lesson test number numbers two three four five six seven eight nine ten plus minus equals square root over divided times length width calculate solve value equation circle triangle today tomorrow yesterday name between more less than into about also all each every one some any only very so because after before first second third last water red blue green yellow black white orange dog cat house family friend mathematics capital translate complete missing').split(' '));
const UZBEK = new Set(("salom assalomu alaykum xayr rahmat iltimos bugun ertaga kecha yaxshi yomon men sen siz u biz ular bu shu ushbu ana mana va yoki ammo lekin uchun bilan dan ning ga da ham emas bor yoq qanday qaysi qancha necha nima kim qayerda qachon nega chunki agar unda quyidagi berilgan toping tanlang aniqlang hisoblang yeching belgilang yozing oqing javob savol test dars fan mavzu maktab talaba oquvchi oqituvchi kitob son sonlar raqam bir ikki uch tort besh olti yetti sakkiz toqqiz on teng ildiz kvadrat yuzasi hajmi uzunligi togri notogri gap soz ozbek til tili salom dunyo yangi boshlash yakunlash parani matn matni misol ifoda qiymati salom bugungi" ).split(' '));
const clean = value => String(value || '').toLowerCase().replace(/\[lat\][\s\S]*?\[\/lat\]|\$[^$]*\$|<[^>]*>/gi, ' ').replace(/[‘’ʻʼ`']/g, '');
export function detectSpeechLanguage(value, fallback = 'uz') {
  const text = clean(value);
  if (/[ўқғҳ]/i.test(text)) return 'uz';
  if (/[а-яё]/i.test(text)) return (/(?:салом|бугун|мактаб|билан|учун|эмас)/i.test(text) ? 'uz' : 'ru');
  const words = text.match(/[a-z]+/g) || [];
  let en = 0, uz = 0;
  for (const word of words) {
    if (ENGLISH.has(word)) en += 2;
    if (UZBEK.has(word)) uz += 2;
    if (word.length > 5 && /(?:larni|ning|ingiz|uvchi|lardan)$/.test(word)) uz += 2;
  }
  if (uz > en) return 'uz';
  if (en > uz) return 'en';
  return Object.hasOwn(SPEECH_LOCALES, fallback) ? fallback : 'uz';
}
export function splitSpeechText(value, fallback = 'uz') {
  const text = String(value || '');
  const result = [];
  const untagged = part => {
    if (!part.trim()) return;
    let language = detectSpeechLanguage(part, fallback);
    const protectedMath=protectSpeechMath(part);
    for (const sentence of protectedMath.text.split(/(?<=[.!?;\n])\s+/)) {
      if (!sentence.trim()) continue;
      language = detectSpeechLanguage(sentence, language);
      result.push({ til: language, matn: protectedMath.restore(sentence) });
    }
  };
  const tags = /\[(uz|en|ru)\]([\s\S]*?)\[\/\1\]/gi;
  let previous = 0, match;
  while ((match = tags.exec(text))) {
    untagged(text.slice(previous, match.index));
    if (match[2].trim()) result.push({ til: match[1].toLowerCase(), matn: match[2] });
    previous = tags.lastIndex;
  }
  untagged(text.slice(previous));
  return result;
}
export function recognitionLocale(text, languages = []) {
  const fallback = languages.map(language => String(language).split('-')[0]).find(language => Object.hasOwn(SPEECH_LOCALES, language)) || 'uz';
  return SPEECH_LOCALES[detectSpeechLanguage(text, fallback)];
}
export function selectBrowserVoice(voices, language, gender) {
  const male = gender === 'ogil';
  const names = male ? ['david', 'guy', 'dmitry', 'sardor', 'mark'] : ['zira', 'samantha', 'jenny', 'svetlana', 'madina', 'anna'];
  return voices.find(voice => {
    if (String(voice.lang || '').toLowerCase().replace('_', '-').split('-')[0] !== language) return false;
    const name = String(voice.name || '').toLowerCase();
    return names.some(key => name.includes(key)) || (male ? /\bmale\b/.test(name) : /\bfemale\b/.test(name));
  }) || null; // Unknown gender uses the server's explicit female/male voice.
}
