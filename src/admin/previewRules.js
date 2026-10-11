// REV122: admin «O'quvchi ko'zi bilan» — platformani tanlangan muassasa o'quvchisi/bolasi qanday ko'rsa, xuddi shunday ko'rish.
// Ko'rinish faqat brauzerda soxta (simulyatsiya) profil bilan quriladi: admin hisobi va bazadagi profil o'zgarmaydi.

export const KORINISH_TURLARI = [
  { kalit: 'bogcha', type: 'bogcha', nom: 'Bog‘cha', ikon: '🧸', rang: '#E8743B', fon: '#FFF1E6',
    izoh: 'Bog‘cha olami, rasmli darslar, o‘yinlar va ovozli ustozlar',
    // bog'cha bolasi doim bitta yosh guruhida — «hammasi» yo'q (aks holda yo'lakda bir fan 3 marta chiqadi)
    guruhlar: [['2-3', '2–3 yosh'], ['4-5', '4–5 yosh'], ['6-7', '6–7 yosh']] },
  { kalit: 'maktab', type: 'maktab', nom: 'Maktab', ikon: '🏫', rang: '#1B4B7A', fon: '#EAF1F7',
    izoh: '1–11-sinf o‘quvchisi: fanlar, darslar va testlar',
    guruhlar: [['', 'Hammasi'], ...Array.from({ length: 11 }, (_, i) => [String(i + 1), `${i + 1}-sinf`])] },
  { kalit: 'markaz', type: 'markaz', nom: 'O‘quv markaz', ikon: '📚', rang: '#2D8B8B', fon: '#E7F4F2',
    izoh: 'Markaz kurslari va abituriyent tayyorlovi', guruhlar: [] },
  { kalit: 'universitet', type: 'universitet', nom: 'Institut', ikon: '🎓', rang: '#6E45A1', fon: '#F1ECF8',
    izoh: 'Talaba: ma’ruza, amaliy va seminar mashg‘ulotlari', guruhlar: [] },
];

export const korinishTuri = (kalit) => KORINISH_TURLARI.find((t) => t.kalit === kalit) || null;

/** Sinf/yosh yorlig'idan solishtirish kaliti: «2–3 yosh» → «2-3», «5-sinf» → «5», «11» → «11». */
export function guruhKaliti(sinf) {
  const m = String(sinf ?? '').replace(/[–—]/g, '-').match(/\d+(?:\s*-\s*\d+)?/);
  return m ? m[0].replace(/\s+/g, '') : '';
}

/** Guruh tanlanmagan bo'lsa — hammasi; aks holda faqat shu sinf/yosh. */
export const guruhMos = (sinf, guruh) => !guruh || guruhKaliti(sinf) === guruh;

/**
 * Ko'rish uchun soxta o'quvchi profili. Bu obyekt faqat ekranni qurish uchun
 * (accountRole, isPreschoolLearner, lessonAudience) — serverga yuborilmaydi.
 */
export function previewUser(admin, kalit, guruh = '') {
  const base = { user_id: admin?.user_id, full_name: admin?.full_name || '', jins: admin?.jins || 'qiz',
    ovoz_jinsi: admin?.ovoz_jinsi || admin?.jins || 'qiz', role: 'oquvchi', is_admin: false, korinish_rejimi: true };
  if (kalit === 'bogcha') return { ...base, bogcha_mi: true, education_role: 'bogcha', learning_profile: { role: 'bogcha' },
    class: guruh ? `${guruh} yosh` : '' };
  if (kalit === 'universitet') return { ...base, talaba_mi: true, education_role: 'talaba', learning_profile: { role: 'talaba' }, class: '' };
  return { ...base, education_role: 'oquvchi', learning_profile: { role: 'oquvchi' }, class: kalit === 'maktab' ? guruh : '' };
}
