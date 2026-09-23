const LINK_KEY = 'kabutar:telegram:google-link:v3';
const DRAFT_KEY = 'kabutar:telegram:phone:v3';
const MAX_AGE = 10 * 60 * 1000;

function read(key) {
  try { return JSON.parse(window.sessionStorage.getItem(key) || 'null'); } catch { return null; }
}
function write(key, value) {
  try {
    if (value) window.sessionStorage.setItem(key, JSON.stringify(value));
    else window.sessionStorage.removeItem(key);
    return true;
  } catch { return false; }
}

export function normalizeTelegramPhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 9) digits = '998' + digits;
  return /^[1-9]\d{9,14}$/.test(digits) ? '+' + digits : '';
}

export function telegramBotUrl(config) {
  const username = String(config?.bot_username || '');
  return config?.enabled && config?.protocol_version >= 3 && /^[A-Za-z0-9_]{5,32}$/.test(username)
    ? `https://t.me/${username}?start=kb_login` : '';
}

export function readTelegramLinkIntent(now = Date.now()) {
  const intent = read(LINK_KEY);
  if (!intent || !Number.isFinite(intent.at) || now < intent.at || now - intent.at > MAX_AGE) {
    write(LINK_KEY, null); return null;
  }
  return intent;
}

export function prepareTelegramGoogleLink(phone = '', code = '') {
  const intent = { phone: normalizeTelegramPhone(phone), code: /^\d{6}$/.test(code) ? code : '', at: Date.now() };
  // This is only a form draft. OAuth also carries the continuation in signed
  // server state, so blocked storage must not prevent account linking.
  write(LINK_KEY, intent);
  return intent;
}

export function clearTelegramLinkIntent() { write(LINK_KEY, null); }
export function saveTelegramPhone(phone) { write(DRAFT_KEY, { phone: normalizeTelegramPhone(phone) }); }
export function telegramDraft() {
  const intent = readTelegramLinkIntent();
  return { phone: intent?.phone || read(DRAFT_KEY)?.phone || '', code: intent?.code || '' };
}

export function captureTelegramArrival(hash) {
  const params = new URLSearchParams(String(hash || '').replace(/^#/, ''));
  const phone = normalizeTelegramPhone(params.get('telegram_phone'));
  if (phone) saveTelegramPhone(phone);
  if (params.get('telegram_link') === '1') prepareTelegramGoogleLink(phone);
}

export function createRedemptionSecret(cryptoProvider = globalThis.crypto) {
  const bytes = new Uint8Array(32);
  cryptoProvider.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function redemptionSecret(apiBase, cryptoProvider = globalThis.crypto, now = Date.now()) {
  const key = 'kabutar:telegram:redeemer:v3:' + String(apiBase || '').replace(/\/+$/, '');
  const saved = read(key);
  if (saved && /^[a-f0-9]{64}$/.test(saved.secret) && Number.isFinite(saved.at) && now >= saved.at && now - saved.at < MAX_AGE) return saved.secret;
  const secret = createRedemptionSecret(cryptoProvider);
  write(key, { secret, at: now });
  return secret;
}

// Capture before App consumes/clears OAuth and navigation fragments.
if (typeof window !== 'undefined') {
  try { captureTelegramArrival(window.location.hash); } catch { /* The login form still accepts a phone. */ }
}
