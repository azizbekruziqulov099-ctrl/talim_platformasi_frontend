// REV79: institut hayoti — sof yordamchilar (brauzersiz sinaladi).

export const OYLAR = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

export const SANA_TURLARI = [
  ['muhim', 'Muhim sana', '📌'],
  ['tadbir', 'Tadbir', '🎉'],
  ['imtihon', 'Imtihon / sessiya', '📝'],
  ['tatil', 'Ta‘til', '🌴'],
  ['yangilik', 'Yangilik', '📣'],
];
export const TUR_IKONI = Object.fromEntries(SANA_TURLARI.map(([id, , icon]) => [id, icon]));

export function parseSana(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
  return match ? { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) } : null;
}

/** "2026-10-05" → "5-oktabr"; boshqa yil bo'lsa "5-oktabr, 2027". Oraliq: "25-dekabr — 15-yanvar". */
export function formatSana(value, end = null, currentYear = new Date().getFullYear()) {
  const one = (v) => {
    const p = parseSana(v);
    if (!p) return '';
    return `${p.d}-${OYLAR[p.m - 1]}${p.y !== currentYear ? `, ${p.y}` : ''}`;
  };
  const a = one(value);
  const b = end ? one(end) : '';
  return b && b !== a ? `${a} — ${b}` : a;
}

export function kunMatni(qolgan) {
  if (qolgan === null || qolgan === undefined) return 'O‘tdi';
  if (qolgan <= 0) return 'Bugun';
  if (qolgan === 1) return 'Ertaga';
  return `${qolgan} kun qoldi`;
}

export function kursNomi(kurs) {
  return Number(kurs) > 0 ? `${kurs}-kurs` : 'Kurssiz';
}

export function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '?';
}

/** Admin ro'yxati: kurs tanlovi va qidiruv (ism, guruh yoki yo'nalish bo'yicha). */
export function filterCourses(kurslar = [], kurs = 0, query = '') {
  const q = String(query || '').trim().toLowerCase();
  return kurslar
    .filter((c) => !kurs || Number(c.kurs) === Number(kurs))
    .map((c) => {
      const guruhlar = c.guruhlar
        .map((g) => {
          if (!q || String(g.guruh).toLowerCase().includes(q)) return g;
          const talabalar = g.talabalar.filter((t) => `${t.full_name} ${t.yonalish_nomi || ''}`.toLowerCase().includes(q));
          return talabalar.length ? { ...g, talabalar, soni: talabalar.length } : null;
        })
        .filter(Boolean);
      return { ...c, guruhlar, soni: guruhlar.reduce((sum, g) => sum + g.soni, 0) };
    })
    .filter((c) => c.guruhlar.length);
}

export function groupDirections(talabalar = []) {
  const counts = new Map();
  for (const t of talabalar) {
    const name = t.yonalish_nomi || '—';
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
}

/** Talaba sahifasi: eng yaqin kelayotgan sana (bugun ham kiradi). */
export function nextDate(sanalar = []) {
  return sanalar.find((s) => !s.otgan) || null;
}
