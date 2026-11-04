// REV90: bog'cha — qaysi dars o'tilgani (shu qurilmada). Kartada ✅ va yulduzlar, keyingi dars «Bugun shu!» bilan yonadi.
const KEY = 'kabutar:kid:done:v1';

function read(storage) {
  try { return JSON.parse(storage?.getItem(KEY) || '{}') || {}; } catch { return {}; }
}
const store = () => { try { return globalThis.localStorage; } catch { return null; } };

export function lessonStars(code, storage = store()) {
  return Number(read(storage)[code] || 0);
}

/** REV121: dars o'tilganmi (yulduzi 0 bo'lsa ham — bola darsni oxirigacha o'tdi). */
export function lessonDone(code, storage = store()) {
  return Boolean(code) && Object.prototype.hasOwnProperty.call(read(storage), code);
}

/** Dars tugadi: yulduz 0–3 (hech biri to'g'ri bo'lmasa — 0, lekin dars «o'tildi» deb belgilanadi). */
export function markLessonDone(code, stars = 1, storage = store()) {
  if (!code) return 0;
  const all = read(storage);
  const n = Number.isFinite(Number(stars)) ? Number(stars) : 1;
  const best = Math.max(Number(all[code] || 0), Math.min(3, Math.max(0, n)));
  all[code] = best;
  try { storage?.setItem(KEY, JSON.stringify(all)); } catch { /* optional */ }
  return best;
}

/** Birinchi o'tilmagan darsning tartib raqami (hammasi o'tilgan bo'lsa -1). */
export function nextLessonIndex(codes, storage = store()) {
  const all = read(storage);
  return codes.findIndex((code) => code && !Object.prototype.hasOwnProperty.call(all, code));
}

// REV186: dars natijasi batafsil — foiz, to'g'ri/jami, urinishlar, oxirgi sana (yoshga mos baho va daraja shu bilan chiqadi).
const NKEY = 'kabutar:dars:natija:v1';
function nread(storage) { try { return JSON.parse(storage?.getItem(NKEY) || '{}') || {}; } catch { return {}; } }

export function natijaYoz(code, togri, jami, storage = store()) {
  if (!code || !(jami > 0)) return null;
  const all = nread(storage);
  const foiz = Math.round((Math.max(0, togri) / jami) * 100);
  const old = all[code] || {};
  all[code] = { foiz: Math.max(foiz, old.foiz || 0), oxirgi: foiz, togri, jami, urinish: (old.urinish || 0) + 1, sana: new Date().toISOString().slice(0, 10) };
  try { storage?.setItem(NKEY, JSON.stringify(all)); } catch { /* optional */ }
  return all[code];
}

/** Dars natijasi: {foiz, oxirgi, togri, jami, urinish, sana} yoki (eski — faqat yulduz) {foiz taxminiy}; o'tilmagan bo'lsa null. */
export function natija(code, storage = store()) {
  if (!code) return null;
  const n = nread(storage)[code];
  if (n) return n;
  if (!lessonDone(code, storage)) return null;
  const y = lessonStars(code, storage);
  return { foiz: [20, 50, 75, 95][Math.max(0, Math.min(3, y))], taxminiy: true, urinish: 1 };
}

// REV255: dars qaysi tilda o'rganilgan — bir mavzu o'zbekcha, ruscha, inglizcha kitoblarda alohida mavzu bo'lib turadi.
// Ularni «fan (izohsiz) | yosh | tartib raqami» kaliti birlashtiradi. Katalog kartasi kod → kalitni eslab qoladi,
// dars tugaganda shu kalitga til yoziladi; kartada esa o'rganilgan tillar bayroqchalari ko'rinadi (ota-onaga ham tushunarli).
const LKEY = 'kabutar:dars:tillar:v1';
const MKEY = 'kabutar:dars:tilkalit:v1';
function jread(k, storage) { try { return JSON.parse(storage?.getItem(k) || '{}') || {}; } catch { return {}; } }
function jwrite(k, v, storage) { try { storage?.setItem(k, JSON.stringify(v)); } catch { /* optional */ } }
export function tilKalit(fan, sinf, tartib) {
  const base = String(fan || '').replace(/\s*\(\s*izoh\s*:[^)]*\)/i, '').trim().toLowerCase();
  return base ? `${base}|${String(sinf || '').trim().toLowerCase()}|${tartib}` : '';
}
/** Katalog kartasi chizilganda: shu dars kodi qaysi umumiy mavzuga tegishli. */
export function kalitniEslab(code, kalit, storage = store()) {
  if (!code || !kalit) return;
  const m = jread(MKEY, storage);
  if (m[code] !== kalit) { m[code] = kalit; jwrite(MKEY, m, storage); }
}
/** Dars tugadi: qaysi tilda o'rganilganini yozamiz (uz | ru | en). */
export function tilniBelgila(code, til, storage = store()) {
  const kalit = jread(MKEY, storage)[code];
  const t = String(til || 'uz').slice(0, 2);
  if (!kalit || !TILLAR.includes(t)) return [];
  const all = jread(LKEY, storage);
  const list = new Set(all[kalit] || []); list.add(t);
  all[kalit] = TILLAR.filter((x) => list.has(x));
  jwrite(LKEY, all, storage);
  return all[kalit];
}
/** Shu mavzu qaysi tillarda o'rganilgan: ['uz','ru'] … */
export function organilganTillar(kalit, storage = store()) {
  return kalit ? (jread(LKEY, storage)[kalit] || []) : [];
}
export const TIL_BELGI = { uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧', de: '🇩🇪', es: '🇪🇸' };   // REV328: 5 til
const TILLAR = Object.keys(TIL_BELGI);
