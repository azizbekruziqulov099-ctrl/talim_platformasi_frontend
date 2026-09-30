// REV90: bog'cha — qaysi dars o'tilgani (shu qurilmada). Kartada ✅ va yulduzlar, keyingi dars «Bugun shu!» bilan yonadi.
const KEY = 'kabutar:kid:done:v1';

function read(storage) {
  try { return JSON.parse(storage?.getItem(KEY) || '{}') || {}; } catch { return {}; }
}
const store = () => { try { return globalThis.localStorage; } catch { return null; } };

export function lessonStars(code, storage = store()) {
  return Number(read(storage)[code] || 0);
}

export function markLessonDone(code, stars = 1, storage = store()) {
  if (!code) return 0;
  const all = read(storage);
  const best = Math.max(Number(all[code] || 0), Math.min(3, Math.max(1, Number(stars) || 1)));
  all[code] = best;
  try { storage?.setItem(KEY, JSON.stringify(all)); } catch { /* optional */ }
  return best;
}

/** Birinchi o'tilmagan darsning tartib raqami (hammasi o'tilgan bo'lsa -1). */
export function nextLessonIndex(codes, storage = store()) {
  const all = read(storage);
  return codes.findIndex((code) => code && !all[code]);
}
