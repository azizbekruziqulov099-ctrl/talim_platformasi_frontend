// REV104: bitta akkaunt ichida 10 tagacha profil (bog'cha bolalari, o'quvchi, talaba — aralash).
// Ega (ota-ona / o'qituvchi / admin) tokeni shu qurilmada saqlanadi: profildan chiqilganda
// profil sessiyasi bekor qilinadi va ega tokeni bilan boshqa profilga kiriladi.

export const FAMILY_MAX = 10;
const FAMILY_KEY = 'kabutar:family:v1';

export const PROFILE_TYPES = [
  { id: 'bogcha', label: 'Bog‘cha bolasi', icon: '🧸', hint: '2–7 yosh' },
  { id: 'oquvchi', label: 'O‘quvchi', icon: '📚', hint: '1–11-sinf' },
  { id: 'talaba', label: 'Talaba', icon: '🎓', hint: 'Institut' },
];
export const KID_AGES = [2, 3, 4, 5, 6, 7];
export const AGE_GROUPS = ['2-3 yosh', '4-5 yosh', '6-7 yosh'];
export const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function ageGroupFor(age) {
  const n = Number(age);
  if (!Number.isInteger(n) || n < 2 || n > 7) return '';
  return n <= 3 ? '2-3 yosh' : n <= 5 ? '4-5 yosh' : '6-7 yosh';
}

function storage(store) {
  if (store) return store;
  try { return window.localStorage; } catch { return null; }
}

export function readFamily(store) {
  try {
    const value = JSON.parse(storage(store)?.getItem(FAMILY_KEY) || 'null');
    return value && typeof value === 'object' && typeof value.ownerToken === 'string' && value.ownerToken ? value : null;
  } catch { return null; }
}

export function writeFamily(value, store) {
  try {
    if (!value) storage(store)?.removeItem(FAMILY_KEY);
    else storage(store)?.setItem(FAMILY_KEY, JSON.stringify(value));
  } catch { /* storage optional */ }
}

export function clearFamily(store) { writeFamily(null, store); }

/** Joriy token profil sessiyasimi (ega emas)? */
export function isProfileSession(token, store) {
  const family = readFamily(store);
  return Boolean(token && family && family.profileToken && family.profileToken === token);
}

export function isFamilyProfileUser(user) {
  const owner = user?.learning_profile?.family_owner;
  return owner !== undefined && owner !== null && owner !== '';
}

export function profileSummary(profile) {
  if (!profile) return '';
  if (profile.role === 'bogcha') return profile.age ? `${profile.age} yosh` : (profile.age_group || 'Bog‘cha');
  if (profile.role === 'oquvchi') return profile.grade ? `${profile.grade}-sinf` : 'O‘quvchi';
  return 'Talaba';
}

/** Forma qiymatlari → API body (yaratish ham, tahrirlash ham). */
export function profileBody(form) {
  const body = { name: String(form.name || '').replace(/\s+/g, ' ').trim().slice(0, 80), role: form.role };
  if (form.role === 'bogcha') {
    if (form.age) body.age = Number(form.age);
    if (form.ageGroup && !form.age) body.age_group = form.ageGroup;
    if (form.ageGroup && form.age && form.ageGroup !== ageGroupFor(form.age)) body.age_group = form.ageGroup;
  } else if (form.role === 'oquvchi') {
    body.grade = Number(form.grade);
    if (form.age) body.age = Number(form.age);
  } else if (form.age) body.age = Number(form.age);
  return body;
}

export function profileFormError(form) {
  if (!String(form.name || '').trim()) return 'Profil ismini yozing.';
  if (form.role === 'bogcha' && !form.age && !form.ageGroup) return 'Bolaning yoshini tanlang.';
  if (form.role === 'oquvchi' && !form.grade) return 'Sinfni tanlang.';
  return '';
}
