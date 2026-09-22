export function educationRole(user) {
  if (user?.talaba_mi || user?.talaba_profili || /kurs/i.test(String(user?.class || '')) || user?.education_role === 'talaba') return 'talaba';
  const role = user?.education_role || user?.role;
  return ['oquvchi', 'oqituvchi', 'ota-ona', 'mustaqil'].includes(role) ? role : '';
}
export function learningReady(user) {
  const role = educationRole(user);
  if (user?.is_admin || ['oqituvchi', 'ota-ona'].includes(role)) return true;
  if (role === 'oquvchi') return /^(?:[1-9]|1[01])(?:-sinf)?$/.test(String(user?.class || '').trim());
  if (role === 'talaba') {
    const p = user?.talaba_profili || user?.learning_profile;
    return !!(p?.kurs >= 1 && p.kurs <= (p.talim_bosqichi === 'magistr' ? 2 : 6) && p.talim_shakli && p.talim_tili);
  }
  return false;
}
export function initialEducationTab(user) {
  return user?.is_admin ? 'admin' : user?.role === 'oqituvchi' ? 'oqituvchi' : user?.role === 'ota-ona' ? 'farzand' : learningReady(user) ? 'test' : 'home';
}
export function needsEducation(user, tab) {
  return ['test', 'mavzular', 'ai_ustoz', 'bilim'].includes(tab) && !learningReady(user);
}
