// Kirish xotirasi: tanlangan rol, shu qurilmada oldin kirgan akkauntlar va /auth/config keshi.
// Hamma narsa brauzerning localStorage'ida; saqlash yopiq bo'lsa ham kirish ishlayveradi.

export const LOGIN_ROLES = [
  ['oquvchi', 'O‘quvchi', '📚', '1–11-sinf'],
  ['talaba', 'Talaba', '🎓', 'Institut, universitet'],
  ['oqituvchi', 'O‘qituvchi', '✏️', 'Dars va sinflar'],
  ['ota-ona', 'Ota-ona', '🌱', 'Farzand ta’limi'],
  ['bogcha', 'Bog‘cha bolasi', '🧸', '2–7 yosh, ovozli darslar'],
];
export const ROLE_NAMES = Object.fromEntries(LOGIN_ROLES.map(([id, name]) => [id, name]));
const ROLE_KEY = 'kabutar:login-role:v1';
const ACCOUNTS_KEY = 'kabutar:saved-accounts:v1';
const LAST_KEY = 'kabutar:last-login:v1';
const CONFIG_KEY = 'kabutar:auth-config:v1';
// REV94: shu qurilmada eslab qolinadigan akkauntlar: oddiy foydalanuvchiga 5 ta, admin kirgan qurilmada 20 ta.
const MAX_ACCOUNTS = 5;
const MAX_ACCOUNTS_ADMIN = 20;
const ADMIN_DEVICE_KEY = 'kabutar:admin-device:v1';   // bu qurilmada admin kirgan — ro'yxat kengroq
const limitFor = (list, store) => (read(ADMIN_DEVICE_KEY, false, store) || list.some((item) => item && item.admin) ? MAX_ACCOUNTS_ADMIN : MAX_ACCOUNTS);

function storage(store) {
  if (store) return store;
  try { return window.localStorage; } catch { return null; }
}
function read(key, fallback, store) {
  try { const raw = storage(store)?.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function write(key, value, store) {
  try { if (value === null || value === undefined) storage(store)?.removeItem(key); else storage(store)?.setItem(key, JSON.stringify(value)); } catch { /* storage optional */ }
}

export function loginRole(store) {
  const role = read(ROLE_KEY, '', store);
  return ROLE_NAMES[role] ? role : '';
}
export function saveLoginRole(role, store) {
  if (ROLE_NAMES[role]) write(ROLE_KEY, role, store);
}

// Foydalanuvchining haqiqiy ta'lim roli (talaba alohida qiymat sifatida saqlanmaydi).
export function accountRole(user) {
  const learning = user?.learning_profile?.role || user?.education_role;
  if (learning === 'bogcha' || user?.bogcha_mi) return 'bogcha';
  if (learning === 'talaba' || user?.talaba_mi || user?.talaba_profili) return 'talaba';
  if (ROLE_NAMES[learning]) return learning;
  return ROLE_NAMES[user?.role] ? user.role : '';
}

// Kirish usuli: KabutarLogin muvaffaqiyatli kirishda yozadi, Kabinet /auth/men dan keyin akkauntga qo'shadi.
export function rememberLoginMethod(method, identifier = '', store) {
  write(LAST_KEY, { method, identifier: String(identifier || '').slice(0, 120), at: Date.now() }, store);
}
export function takeLoginMethod(store) {
  const value = read(LAST_KEY, null, store);
  write(LAST_KEY, null, store);
  return value && Date.now() - Number(value.at || 0) < 10 * 60 * 1000 ? value : null;
}

export function savedAccounts(store) {
  const list = read(ACCOUNTS_KEY, [], store);
  if (!Array.isArray(list)) return [];
  const clean = list.filter((item) => item && item.user_id != null);
  return clean.slice(0, limitFor(clean, store));
}

export function rememberAccount(user, token, login = null, store) {
  if (!user || user.user_id == null) return savedAccounts(store);
  const list = savedAccounts(store);
  const old = list.find((item) => String(item.user_id) === String(user.user_id)) || {};
  const identities = user.identities || {};
  const entry = {
    user_id: user.user_id,
    name: String(user.full_name || user.ism || old.name || 'Akkaunt').slice(0, 80),
    role: accountRole(user) || old.role || '',
    // Tez kirilgan akkaunt keyin Telegram/Gmail'ga ulansa — usul ham yangilanadi.
    method: login?.method || (old.method && !(old.method === 'quick' && (identities.telegram || identities.google)) ? old.method : '') || (identities.telegram ? 'telegram' : identities.google ? 'google' : 'password'),
    identifier: login?.method === 'password' ? login.identifier : old.identifier || '',
    phone: user.phone_masked || old.phone || '',
    token: typeof token === 'string' ? token : old.token || '',
    admin: Boolean(user.is_admin || old.admin),
    at: Date.now(),
  };
  if (user.is_admin) write(ADMIN_DEVICE_KEY, true, store);
  const all = [entry, ...list.filter((item) => String(item.user_id) !== String(user.user_id))];
  const next = all.slice(0, limitFor(all, store));
  write(ACCOUNTS_KEY, next, store);
  return next;
}

// Sessiya tugadi yoki chiqildi: akkaunt ro'yxatda qoladi, faqat eski token o'chadi.
export function dropToken(token, store) {
  if (!token) return savedAccounts(store);
  const next = savedAccounts(store).map((item) => item.token === token ? { ...item, token: '' } : item);
  write(ACCOUNTS_KEY, next, store);
  return next;
}

/** REV94: «Tez kirish» akkaunti (Telegram/Gmail'siz) — boshqa kirish yo'li yo'q. Shu qurilmadan chiqilganda
 *  uning sessiyasi bekor qilinmaydi (aks holda akkaunt butunlay yo'qoladi) — ro'yxatdan bir bosishda qaytiladi. */
export function keepsSessionOnLogout(token, store) {
  const item = savedAccounts(store).find((entry) => entry.token && entry.token === token);
  return Boolean(item && item.method === 'quick');
}

export function forgetAccount(userId, store) {
  const next = savedAccounts(store).filter((item) => String(item.user_id) !== String(userId));
  write(ACCOUNTS_KEY, next, store);
  return next;
}

export function cachedAuthConfig(store) {
  const value = read(CONFIG_KEY, null, store);
  return value && typeof value === 'object' && value.config ? value.config : null;
}
export function saveAuthConfig(config, store) {
  if (config && typeof config === 'object') write(CONFIG_KEY, { config, at: Date.now() }, store);
}

// Tepadagi ogohlantirish: akkaunt Telegram ham, Google ham ulanmagan bo'lsa — faqat parol/muassasa kodi bilan
// kirilgan hisob parol unutilsa yo'qolishi mumkin. Ulangach ogohlantirish o'z-o'zidan yo'qoladi.
export function accountRisk(user) {
  const identities = user?.identities;
  if (!identities || user?.is_admin) return '';
  if (identities.telegram || identities.google) return '';
  return 'unlinked';
}

export function roleMismatch(user, chosen) {
  const actual = accountRole(user);
  return Boolean(chosen && actual && chosen !== actual && !user?.is_admin);
}

export function methodLabel(method) {
  return { telegram: 'Telegram', google: 'Google', password: 'Parol', quick: 'Tez kirish' }[method] || 'Kirish';
}
