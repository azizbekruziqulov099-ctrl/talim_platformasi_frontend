export const PRESCHOOL_GROUPS = ['2-3 yosh', '3-4 yosh', '4-5 yosh', '5-6 yosh', '6-7 yosh'];
// REV80: bog'cha yosh guruhi — "3-4 yosh" (sinf o'rnida saqlanadi).
export function preschoolGroup(value) {
  const text = String(value || '').replace(/[–—]/g, '-').toLowerCase();
  const m = /(?<!\d)([2-6])\s*-\s*([3-7])(?!\d)/.exec(text);
  return m && Number(m[2]) === Number(m[1]) + 1 ? `${m[1]}-${m[2]} yosh` : '';
}
export function educationRole(user) {
  if (user?.bogcha_mi || user?.education_role === 'bogcha' || user?.learning_profile?.role === 'bogcha') return 'bogcha';
  if (user?.talaba_mi || user?.talaba_profili || /kurs/i.test(String(user?.class || '')) || user?.education_role === 'talaba') return 'talaba';
  const role = user?.education_role || user?.role;
  return ['oquvchi', 'oqituvchi', 'ota-ona', 'mustaqil'].includes(role) ? role : '';
}
export function learningReady(user) {
  const role = educationRole(user);
  if (user?.is_admin || ['oqituvchi', 'ota-ona'].includes(role)) return true;
  if (role === 'oquvchi') return /^(?:[1-9]|1[01])(?:-sinf)?$/.test(String(user?.class || '').trim());
  // REV77: talaba bloklanmaydi — barcha institut testlari va mavzulari ochiq. Kurs/yo'nalish
  // sozlansa, katalogda unga mos fanlar birinchi chiqadi (talabaProfileComplete).
  if (role === 'talaba') return true;
  if (role === 'bogcha') return Boolean(preschoolGroup(user?.yosh_guruhi || user?.learning_profile?.age_group || user?.class));
  return false;
}
export function initialEducationTab(user) {
  return user?.is_admin ? 'admin' : user?.role === 'oqituvchi' ? 'oqituvchi' : user?.role === 'ota-ona' ? 'farzand' : learningReady(user) ? 'mavzular' : 'home';
}
export function needsEducation(user, tab) {
  return ['test', 'mavzular', 'ai_ustoz', 'bilim'].includes(tab) && !learningReady(user);
}

export function talabaProfileComplete(user) {
  const p = user?.talaba_profili || user?.learning_profile;
  return !!(p?.kurs >= 1 && p.kurs <= (p.talim_bosqichi === 'magistr' ? 2 : 6) && p.talim_shakli && p.talim_tili);
}
