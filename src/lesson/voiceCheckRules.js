// REV105: dars oxiridagi ovozli tekshiruv — «Takrorla!» — sof yordamchilar (brauzersiz sinaladi).
import { gradeSpeech } from '../speech/speakRules.js';

const FOREIGN = /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]([\s\S]*?)\[\/\1\]/gi;
const NOT_TARGET = /^(?:say it together|say it with me|repeat after me|look|listen|listen and repeat|again|one more time|your turn|now you|good job|well done|great job|let'?s go|hello everyone|bye bye)$/i;
const LEAD = /^[\s\-–—•*·>]+|^\d+[.)]\s*|^[^\p{L}\p{N}]+/u;

/** Har tinglovchiga nechta ibora va qancha uzunlik. */
export const VOICE_LIMITS = {
  bogcha: { count: 3, maxWords: 4, uzMaxWords: 5, tries: 2 },
  oquvchi: { count: 3, maxWords: 6, uzMaxWords: 12, tries: 2 },
  talaba: { count: 3, maxWords: 8, uzMaxWords: 16, tries: 2 },
};

function words(text) { return String(text || '').trim().split(/\s+/).filter(Boolean); }

function cleanLine(line) {
  return String(line || '')
    .replace(/\[\d{1,2}\]/g, ' ')
    .replace(LEAD, '')
    .replace(/[*_#`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[:;,–—-]+$/u, '')
    .trim();
}

/** Ovoz bilan aytib tekshirib bo'lmaydigan qator: formula, LaTeX, ko'p raqam/belgi. */
function speakableLine(line) {
  if (!line || /[$\\{}^=<>|]/.test(line)) return false;
  const letters = (line.match(/\p{L}/gu) || []).length;
  const digits = (line.match(/\p{N}/gu) || []).length;
  return letters >= 4 && digits <= 3;
}

function add(out, item, limit) {
  const key = `${item.lang}:${item.phrase.toLowerCase()}`;
  if (out.length < limit && !out.some((x) => `${x.lang}:${x.phrase.toLowerCase()}` === key)) out.push(item);
}

/**
 * Darsdan takrorlatiladigan iboralar:
 * 1) darsda alohida berilgan bo'lsa (lesson.ovozli_tekshiruv) — o'shalar;
 * 2) til darsi — chet tilidagi qisqa so'z/iboralar ([en]Green[/en]);
 * 3) boshqa fanlar — qoida va xulosa qatorlari (formulasiz, qisqa gaplar).
 */
export function voiceCheckItems(lesson, audience = 'oquvchi') {
  const lim = VOICE_LIMITS[audience] || VOICE_LIMITS.oquvchi;
  const out = [];
  const given = Array.isArray(lesson?.ovozli_tekshiruv) ? lesson.ovozli_tekshiruv : [];
  for (const g of given) {
    const phrase = cleanLine(typeof g === 'string' ? g : g?.matn);
    if (phrase) add(out, { lang: (typeof g === 'object' && g?.til) || 'uz', phrase }, lim.count);
  }
  if (out.length) return out;

  const steps = Array.isArray(lesson?.steps) ? lesson.steps : [];
  for (const s of steps) {
    for (const m of String(s?.ovoz || '').matchAll(FOREIGN)) {
      const phrase = cleanLine(m[2]).replace(/[.!?。！？]+$/u, '');
      const n = words(phrase).length;
      if (!phrase || n > lim.maxWords || NOT_TARGET.test(phrase) || /[:：]$/.test(phrase)) continue;
      add(out, { lang: m[1].toLowerCase(), phrase }, lim.count);
    }
  }
  if (out.length) return out;

  const ranked = [
    ...steps.filter((s) => ['qoida', 'xulosa'].includes(s?.turi)),
    ...steps.filter((s) => !['qoida', 'xulosa', 'amaliy'].includes(s?.turi)),
  ];
  for (const s of ranked) {
    for (const raw of String(s?.doska || '').split(/\n+/)) {
      const line = cleanLine(raw).replace(/[.!?]+$/u, '');
      const n = words(line).length;
      if (n < 2 || n > lim.uzMaxWords || !speakableLine(line)) continue;
      add(out, { lang: 'uz', phrase: line }, lim.count);
    }
  }
  return out;
}

/** Ustoz aytadigan gap (TTS teglari bilan). */
export function voicePrompt(item, kid, attempt = 0) {
  const p = item.lang === 'uz' ? item.phrase : `[${item.lang}]${item.phrase}[/${item.lang}]`;
  if (attempt > 0) return kid ? `Yana bir bor ayt: ${p}` : `Yana bir bor, aniqroq takrorlang: ${p}`;
  return kid ? `Endi sen ayt: ${p}` : `Takrorlang: ${p}`;
}

const APOS = /[‘’ʻʼ`'´]/g;
/** O'zbekchadagi o‘/g‘ tutuq belgilari tanib olishda turlicha keladi — solishtirishdan oldin olib tashlanadi. */
export function gradeVoice(alternatives, item) {
  const fix = (v) => String(v || '').replace(APOS, '');
  return gradeSpeech((alternatives || []).map(fix), fix(item?.phrase), item?.lang || 'uz');
}

/** Ibora o'tdi deb hisoblanadimi (2–3 yulduz). */
export function voicePassed(graded) { return Number(graded?.stars) >= 2; }

export function voiceSummary(results) {
  const list = Array.isArray(results) ? results : [];
  return { togri: list.filter((r) => r?.ok).length, jami: list.length };
}
