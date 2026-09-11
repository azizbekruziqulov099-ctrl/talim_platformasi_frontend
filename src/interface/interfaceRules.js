import { TRANSLATION_ROWS } from './interfaceTranslations.js';
import { EXTRA_TRANSLATION_ROWS } from './interfaceExtraMessages.js';
import { LOGIN_TRANSLATION_ROWS } from './interfaceLoginMessages.js';
import { ACCOUNT_TRANSLATION_ROWS } from './interfaceAccountMessages.js';
import { CHAT_TRANSLATION_ROWS } from './interfaceChatMessages.js';

export const INTERFACE_KEY = 'kabutar:interface:v1';
export const INTERFACE_LOCALES = Object.freeze([
  { value: 'uz', label: 'O‘zbekcha', lang: 'uz-Latn' },
  { value: 'uz-Cyrl', label: 'Ўзбекча', lang: 'uz-Cyrl' },
  { value: 'ru', label: 'Русский', lang: 'ru' },
  { value: 'en', label: 'English', lang: 'en' },
  { value: 'tr', label: 'Türkçe', lang: 'tr' },
  { value: 'kk', label: 'Қазақша', lang: 'kk' },
]);
export const DEFAULT_INTERFACE = Object.freeze({ locale: 'uz', theme: 'system', motion: 'system' });
export const normalizeInterfaceKey = text => String(text).trim().replace(/[‘’ʻʼ`]/g, "'").replace(/\s+/g, ' ');
export function normalizeInterface(value) {
  const data = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    locale: INTERFACE_LOCALES.some(item => item.value === data.locale) ? data.locale : DEFAULT_INTERFACE.locale,
    theme: ['system', 'light', 'dark'].includes(data.theme) ? data.theme : DEFAULT_INTERFACE.theme,
    motion: ['system', 'reduced', 'full'].includes(data.motion) ? data.motion : DEFAULT_INTERFACE.motion,
  };
}
export function readInterface(storage) {
  try { return normalizeInterface(JSON.parse(storage?.getItem(INTERFACE_KEY) || 'null')); }
  catch { return { ...DEFAULT_INTERFACE }; }
}
// Only called for registered interface labels; messages, names and tests are never transliterated.
export function uzbekInterfaceCyrillic(source) {
  const map = { a:'а', b:'б', d:'д', e:'е', f:'ф', g:'г', h:'ҳ', i:'и', j:'ж', k:'к', l:'л', m:'м', n:'н', o:'о', p:'п', q:'қ', r:'р', s:'с', t:'т', u:'у', v:'в', x:'х', y:'й', z:'з', "o'":'ў', "g'":'ғ', sh:'ш', ch:'ч', "yo'":'йў', ye:'е', yo:'ё', yu:'ю', ya:'я', "'":'ъ' };
  return String(source).replace(/[‘’ʻʼ`]/g, "'").split(/(Google|Telegram|Kabutar|PDF|AI|ID)/g).map(part => {
    if (/^(Google|Telegram|Kabutar|PDF|AI|ID)$/.test(part)) return part;
    return part.replace(/yo'|o'|g'|sh|ch|ye|yo|yu|ya|[a-z']/gi, (token, index) => {
      let translated = map[token.toLowerCase()] || token;
      if (token.toLowerCase() === 'e' && (index === 0 || !/[a-z']/i.test(part[index-1]))) translated = 'э';
      if (!/[A-Z]/.test(token[0])) return translated;
      return token === token.toUpperCase() ? translated.toUpperCase() : translated[0].toUpperCase() + translated.slice(1);
    });
  }).join('');
}
const dictionaries = new Map();
for (const row of [...TRANSLATION_ROWS, ...EXTRA_TRANSLATION_ROWS, ...LOGIN_TRANSLATION_ROWS, ...ACCOUNT_TRANSLATION_ROWS, ...CHAT_TRANSLATION_ROWS]) {
  if (!Array.isArray(row) || row.length !== 5 || row.some(value => typeof value !== 'string')) continue;
  dictionaries.set(normalizeInterfaceKey(row[0]), { uz: row[0], 'uz-Cyrl': uzbekInterfaceCyrillic(row[0]), ru: row[1], en: row[2], tr: row[3], kk: row[4] });
}
export const INTERFACE_LABEL_COUNT = dictionaries.size;
export function hasInterfaceTranslation(text) { return dictionaries.has(normalizeInterfaceKey(text)); }
export function translateInterface(text, locale = 'uz', values) {
  if (typeof text !== 'string') return text;
  const translated = dictionaries.get(normalizeInterfaceKey(text))?.[locale];
  let output = translated == null || locale === 'uz' ? text : `${text.match(/^\s*/)?.[0] || ''}${translated}${text.match(/\s*$/)?.[0] || ''}`;
  if (values && typeof values === 'object') output = output.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (match, key) => Object.hasOwn(values, key) ? String(values[key]) : match);
  return output;
}
