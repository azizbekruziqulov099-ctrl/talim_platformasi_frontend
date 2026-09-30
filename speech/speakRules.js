// REV89: gapirish mashqi — bola so'zni aytadi, brauzer tanib oladi, biz yumshoq baholaymiz (sof yordamchilar).
import { splitSpeechText } from './language.js';

const EMOJI_PREFIX = /^[^\p{L}]+/u;

/** Matndagi birinchi chet til bo'lagining tili (uz emas). */
export function foreignLanguage(text) {
  const part = splitSpeechText(String(text || '')).find((p) => p.til !== 'uz');
  return part ? part.til : '';
}

/** Dars qadamidan aytiladigan ibora: doskaning 1-qatori («🐱 cat — mushuk» → «cat»). */
export function practiceTarget(step) {
  if (!step) return null;
  const lang = foreignLanguage(step.ovoz || '');
  if (!lang) return null;
  const first = String(step.doska || '').split('\n')[0].split(' — ')[0];
  const phrase = first.replace(EMOJI_PREFIX, '').trim();
  if (!/\p{L}/u.test(phrase) || phrase.length > 60) return null;
  return { lang, phrase };
}

export function normalizeSpoken(value, lang = '') {
  let text = String(value || '').toLowerCase().normalize('NFKC');
  text = text.replace(/[ً-ْٰ]/g, '');          // arabcha harakatlar
  text = text.replace(/[\p{P}\p{S}]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (['zh', 'ja'].includes(lang)) text = text.replace(/\s+/g, '');
  return text;
}

function distance(a, b) {
  const A = [...a], B = [...b];
  let prev = Array.from({ length: B.length + 1 }, (_, i) => i);
  for (let i = 1; i <= A.length; i += 1) {
    const cur = [i];
    for (let j = 1; j <= B.length; j += 1) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[B.length];
}

export function similarity(heard, target, lang = '') {
  const a = normalizeSpoken(heard, lang), b = normalizeSpoken(target, lang);
  if (!a || !b) return 0;
  if (a === b || a.includes(b)) return 1;
  return Math.max(0, 1 - distance(a, b) / Math.max([...a].length, [...b].length));
}

/** Eshitilgan variantlar ichidan eng yaxshisi → 3 yulduz (aniq), 2 (yaqin), 1 (urindi), 0 (tushunilmadi). */
export function gradeSpeech(alternatives, target, lang = '') {
  const best = Math.max(0, ...(alternatives || []).map((h) => similarity(h, target, lang)));
  const stars = best >= 0.8 ? 3 : best >= 0.55 ? 2 : best >= 0.3 ? 1 : 0;
  return { score: Math.round(best * 100) / 100, stars };
}

export function speechRecognitionAvailable(win = globalThis) {
  return Boolean(win?.SpeechRecognition || win?.webkitSpeechRecognition);
}
