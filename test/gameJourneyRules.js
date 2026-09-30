// REV78: o'yinli test «yo'li» — test hajmi va darajasiga qarab o'yin turi va butun test
// davomida qurilib boradigan manzara. Sof qoidalar (brauzersiz sinash mumkin).

export const GAME_COUNTS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100];

// Hajm bosqichi: qisqa (≤10) — tezkor; o'rta (≤30) — sarguzasht; katta (≤60) — qurilish; marafon (>60).
export function gameSizeTier(count) {
  const n = Number(count) || 0;
  if (n <= 10) return 'qisqa';
  if (n <= 30) return 'orta';
  if (n <= 60) return 'katta';
  return 'marafon';
}

export const TIER_INFO = {
  qisqa: { title: 'Tezkor sinov', hint: '10 tagacha savol — tez va aniq javob.' },
  orta: { title: 'Sarguzasht', hint: '15–30 savol — bosqichma-bosqich yo‘l.' },
  katta: { title: 'Katta qurilish', hint: '40–60 savol — har to‘g‘ri javob inshootga yangi qism qo‘shadi.' },
  marafon: { title: 'Bilim marafoni', hint: '80–100 savol — 5 bosqich, har 20% da yangi hudud ochiladi.' },
};

export function isUniversityLevel({ level, grade, band } = {}) {
  return level === 'universitet' || /kurs/i.test(String(grade || '')) || band === 'university';
}

// Hajm va darajaga mos o'yin turi (foydalanuvchi baribir o'zi almashtira oladi).
export function recommendedGameMode(count, options = {}) {
  const tier = gameSizeTier(count);
  if (isUniversityLevel(options)) {
    return { qisqa: 'detective', orta: 'millionaire', katta: 'city', marafon: 'city' }[tier];
  }
  return { qisqa: 'bridge', orta: 'space', katta: 'city', marafon: 'city' }[tier];
}

export const JOURNEY_THEMES = {
  bog: { title: 'Bilim bog‘i', icon: '🌱', done: '🌸', wrong: '🍂', current: '🌱', empty: '·', finish: 'Bog‘ gullab-yashnadi!',
    stages: ['Urug‘ ekildi', 'Nihollar chiqdi', 'Gullar ochildi', 'Mevalar pishdi', 'Bog‘ tayyor'] },
  shahar: { title: 'Bilim shahri', icon: '🏗', done: '🏠', wrong: '🧱', current: '🏗', empty: '·', finish: 'Shahar qurib bitkazildi!',
    stages: ['Poydevor', 'Birinchi ko‘cha', 'Maktab va kutubxona', 'Bog‘ va ko‘prik', 'Shahar markazi'] },
  stansiya: { title: 'Kosmik stansiya', icon: '🚀', done: '🛰', wrong: '⚠️', current: '🚀', empty: '·', finish: 'Stansiya orbitada ishlamoqda!',
    stages: ['Start maydoni', 'Birinchi modul', 'Quyosh panellari', 'Laboratoriya', 'To‘liq stansiya'] },
  tarmoq: { title: 'Ilmiy bilim tarmog‘i', icon: '🧠', done: '●', wrong: '○', current: '◎', empty: '·', finish: 'Bilim tarmog‘i yaxlit tizimga aylandi!',
    stages: ['Tushunchalar', 'Bog‘lanishlar', 'Qonuniyatlar', 'Tahlil', 'Sintez'] },
};

export function journeyThemeId(options = {}) {
  if (isUniversityLevel(options)) return 'tarmoq';
  if (options.band === 'grade_1_4') return 'bog';
  if (options.band === 'grade_5_9') return 'shahar';
  return 'stansiya';
}

/** log: [{position, correct}] (server tasdiqlagan javoblar). */
export function journeyState(total, log = [], currentPosition = 0) {
  const n = Math.max(1, Number(total) || 1);
  const cells = Array.from({ length: n }, (_, i) => {
    const item = log.find((entry) => Number(entry.position) === i + 1);
    if (item) return item.correct ? 'done' : 'wrong';
    return i + 1 === Number(currentPosition) ? 'current' : 'empty';
  });
  const done = cells.filter((c) => c === 'done').length;
  const answered = cells.filter((c) => c === 'done' || c === 'wrong').length;
  let streak = 0, best = 0;
  for (const cell of cells) {
    if (cell === 'done') { streak += 1; best = Math.max(best, streak); }
    else if (cell === 'wrong') streak = 0;
  }
  // Oxirgi javobdan orqaga qarab joriy seriya.
  let current = 0;
  for (let i = cells.length - 1; i >= 0; i -= 1) {
    if (cells[i] === 'empty' || cells[i] === 'current') continue;
    if (cells[i] === 'done') current += 1; else break;
  }
  const stage = Math.min(5, Math.floor((done / n) * 5));
  return {
    cells, done, answered, total: n,
    accuracy: answered ? Math.round((done * 100) / answered) : 0,
    percentBuilt: Math.round((done * 100) / n),
    streak: current, bestStreak: best,
    stage, // 0..5 — ochilgan hududlar (har 20% to'g'ri javob)
    // Kurs darajasi: ketma-ket to'g'ri javoblar zanjiri chuqurlikni oshiradi.
    depth: 1 + Math.floor(best / 5),
    // Tarmoq bog'lanishlari: ketma-ket ikki to'g'ri javob — bitta bog'lanish.
    links: cells.reduce((sum, cell, i) => sum + (cell === 'done' && cells[i - 1] === 'done' ? 1 : 0), 0),
  };
}

// Katta testlarda katakchalar kichikroq va qatorga ko'proq sig'adi.
export function journeyColumns(total) {
  const n = Number(total) || 0;
  if (n <= 10) return n || 5;
  if (n <= 30) return 10;
  if (n <= 60) return 12;
  return 20;
}
