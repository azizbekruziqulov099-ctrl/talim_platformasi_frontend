// REV122: bir fan uch izoh tilida o'rnatiladi: «Arab tili» (o'zbekcha izoh), «Arab tili (izoh: rus)», «Arab tili (izoh: ingliz)».
// O'quvchiga faqat interfeys tiliga mosi ko'rsatiladi: uz → o'zbekcha, ru → ruscha, en → inglizcha izohli.
// Mos variant o'rnatilmagan bo'lsa — o'zbekchasi, u ham bo'lmasa — bori (fan yo'qolib qolmasin).

const IZOH_RE = /\s*\(\s*izoh\s*:\s*([^)]+?)\s*\)\s*/i;
const NOMDAN = { rus: 'ru', ruscha: 'ru', ru: 'ru', 'русский': 'ru', ingliz: 'en', inglizcha: 'en', en: 'en', english: 'en', uz: 'uz', "o'zbek": 'uz', 'o‘zbek': 'uz' };

/** «Arab tili (izoh: rus)» → "ru"; izohsiz → "uz". */
export function fanIzohi(nom) {
  const m = String(nom || '').match(IZOH_RE);
  if (!m) return 'uz';
  return NOMDAN[m[1].trim().toLowerCase()] || m[1].trim().toLowerCase();
}

/** Ko'rsatish uchun nom: «Arab tili (izoh: rus)» → «Arab tili». */
export const fanNomi = (nom) => String(nom || '').replace(IZOH_RE, ' ').replace(/\s{2,}/g, ' ').trim();

const tilKodi = (locale) => String(locale || 'uz').toLowerCase().split(/[-_]/)[0];

/** Fanlar ro'yxatidan interfeys tiliga mos izohli variantlarni tanlaydi (tartib saqlanadi). */
export function izohTanla(fanlar = [], locale = 'uz') {
  const til = tilKodi(locale);
  const guruh = new Map();
  for (const f of fanlar) {
    const key = `${fanNomi(f?.nom).toLowerCase()}|${f?.dars_turi || ''}|${f?.institution_type || ''}`;
    if (!guruh.has(key)) guruh.set(key, []);
    guruh.get(key).push(f);
  }
  const keep = new Set();
  for (const list of guruh.values()) {
    const by = (t) => list.filter((f) => fanIzohi(f?.nom) === t);
    const tanlov = by(til).length ? by(til) : by('uz').length ? by('uz') : by(fanIzohi(list[0]?.nom));
    tanlov.forEach((f) => keep.add(f));
  }
  return fanlar.filter((f) => keep.has(f));
}

// Bog'cha fanlari nomi interfeys tilida (kartochka, eshik, ovoz). Boshqa fanlar — o'zgarishsiz.
const FAN_NOMLARI = {
  'arab tili': ['Арабский язык', 'Arabic'], 'ingliz tili': ['Английский язык', 'English'], 'rus tili': ['Русский язык', 'Russian'],
  'turk tili': ['Турецкий язык', 'Turkish'], 'nemis tili': ['Немецкий язык', 'German'], 'fransuz tili': ['Французский язык', 'French'],
  'ispan tili': ['Испанский язык', 'Spanish'], 'koreys tili': ['Корейский язык', 'Korean'], 'yapon tili': ['Японский язык', 'Japanese'],
  'xitoy tili': ['Китайский язык', 'Chinese'], matematika: ['Математика', 'Maths'], 'atrof-muhit': ['Окружающий мир', 'The world around us'],
  mantiq: ['Логика', 'Logic'],
};
/** «Arab tili (izoh: rus)» + ru → «Арабский язык»; uz → «Arab tili». */
export function fanNomiTil(nom, locale = 'uz') {
  const base = fanNomi(nom);
  const til = tilKodi(locale);
  const row = FAN_NOMLARI[base.toLowerCase()];
  if (!row || til === 'uz') return base;
  return til === 'ru' ? row[0] : til === 'en' ? row[1] : base;
}
