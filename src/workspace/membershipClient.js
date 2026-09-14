import { workspaceRequest } from './kabutarWorkspaceClient.js';

// Printed invitations can contain spacing and dash separators. Keep every other
// character so malformed codes are rejected instead of changing their meaning.
export function normalizeInstitutionCode(value) {
  return String(value || '').normalize('NFKC').replace(/[\s\u200B-\u200D\uFEFF\-\u2010-\u2015]/g, '').toUpperCase();
}

export function institutionCodeError(value) {
  const code = normalizeInstitutionCode(value);
  if (!code) return 'Muassasa bergan ulanish kodini kiriting.';
  if (/^\d{4}$/.test(code)) return 'Bu 4 xonali sinf paroliga o‘xshaydi. Sinfga qo‘shilish bo‘limida sinfni tanlab kiriting; bu yerga admin bergan shaxsiy ulanish kodi yoziladi.';
  if (!/^[A-Z0-9]{12}$/.test(code)) return 'Admin bergan 12 belgili ulanish kodini to‘liq kiriting: lotin harflari va raqamlar. Shaxsiy hisob paroli bu yerga kiritilmaydi.';
  return '';
}

export async function claimInstitution(apiBase, token, value, signal) {
  if (!token) throw new Error('Avval Telegram, Google yoki shaxsiy parolingiz bilan hisobingizga kiring.');
  const error = institutionCodeError(value);
  if (error) throw new Error(error);
  const result = await workspaceRequest(apiBase, '/api/oqituvchi/kirish_kodi_orqali_qoshil', token, {
    method: 'POST', body: { kirish_kodi: normalizeInstitutionCode(value) }, signal,
  });
  if (!['qoshildi', 'allaqachon_ulangan'].includes(result?.holat)) {
    throw new Error('Muassasaga ulanish tasdiqlanmadi. Profilingizni tekshirib, qayta urinib ko‘ring.');
  }
  return result;
}

export async function refreshInstitutionProfile(apiBase, token, signal) {
  const profile = await workspaceRequest(apiBase, '/auth/men', token, { signal });
  if (!Number.isSafeInteger(Number(profile?.user_id)) || Number(profile.user_id) === 0 || typeof profile?.role !== 'string') {
    throw new Error('Muassasaga ulandingiz, lekin profilingiz yangilanmadi. “Hisobni yangilash”ni bosing.');
  }
  return profile;
}
