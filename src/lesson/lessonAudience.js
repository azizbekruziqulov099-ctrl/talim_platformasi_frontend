// REV80: dars maydoni kimga — bog'cha bolasi, o'quvchi yoki talaba. Sof funksiyalar.
export function lessonAudience(role = '', grade = '') {
  if (role === 'bogcha' || /yosh/i.test(String(grade || ''))) return 'bogcha';
  if (role === 'talaba' || /kurs/i.test(String(grade || ''))) return 'talaba';
  return 'oquvchi';
}
const LABELS = {
  bogcha: { teacher: 'Kabutar qushcha', start: '▶ Boshladik!' },
  oquvchi: { teacher: 'AI o‘qituvchi', start: '▶ Darsni boshlash' },
  talaba: { teacher: 'AI domla', start: '▶ Ma’ruzani boshlash' },
};
export function audienceLabels(audience) {
  return LABELS[audience] || LABELS.oquvchi;
}
