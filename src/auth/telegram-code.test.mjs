import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { captureTelegramArrival, clearTelegramLinkIntent, createRedemptionSecret, normalizeTelegramPhone, prepareTelegramGoogleLink, readTelegramLinkIntent, redemptionSecret, telegramBotUrl, telegramDraft } from './telegramCodeClient.js';

function storage() {
  const map = new Map();
  globalThis.window = { sessionStorage: { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) } };
  return map;
}

test('local and international phone numbers address the same Telegram contact', () => {
  assert.equal(normalizeTelegramPhone('90 123 45 67'), '+998901234567');
  assert.equal(normalizeTelegramPhone('+998 (90) 123-45-67'), '+998901234567');
  assert.equal(normalizeTelegramPhone('+7 999 123 45 67'), '+79991234567');
  assert.equal(normalizeTelegramPhone('12345'), '');
});
test('bot entry has a fixed payload and refuses stale backend protocol', () => {
  assert.equal(telegramBotUrl({ enabled: true, protocol_version: 3, bot_username: 'Kabutar_bot' }), 'https://t.me/Kabutar_bot?start=kb_login');
  assert.equal(telegramBotUrl({ enabled: true, protocol_version: 2, bot_username: 'Kabutar_bot' }), '');
  assert.equal(telegramBotUrl({ enabled: true, protocol_version: 3, bot_username: 'evil/path?x' }), '');
});
test('bot return prefills phone without exposing code in URL', () => {
  storage(); captureTelegramArrival('#telegram_phone=%2B998901234567');
  assert.deepEqual(telegramDraft(), { phone: '+998901234567', code: '' });
  assert.equal(readTelegramLinkIntent(), null);
});
test('Gmail branch survives OAuth redirect and opens the account linking continuation', () => {
  storage(); captureTelegramArrival('#telegram_phone=%2B998901234567&telegram_link=1');
  assert.equal(readTelegramLinkIntent().phone, '+998901234567');
  prepareTelegramGoogleLink('+998901234567', '004281');
  assert.deepEqual(telegramDraft(), { phone: '+998901234567', code: '004281' });
  clearTelegramLinkIntent(); assert.equal(readTelegramLinkIntent(), null);
});
test('expired or future-dated Google intent is not resumed', () => {
  storage(); let intent = prepareTelegramGoogleLink();
  assert.equal(readTelegramLinkIntent(intent.at + 600001), null);
  intent = prepareTelegramGoogleLink();
  assert.equal(readTelegramLinkIntent(intent.at - 1), null);
});
test('blocked draft storage does not prevent the server-carried Google continuation', () => {
  globalThis.window = { sessionStorage: { setItem() { throw new Error('blocked'); }, getItem() { throw new Error('blocked'); }, removeItem() {} } };
  assert.equal(prepareTelegramGoogleLink('+998901234567', '004281').phone, '+998901234567');
  assert.deepEqual(telegramDraft(), { phone: '', code: '' });
});
test('redemption secret uses secure randomness and survives a lost HTTP response or refresh', () => {
  storage(); const first = redemptionSecret('https://api.test/', webcrypto, 1000);
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(redemptionSecret('https://api.test', webcrypto, 1001), first);
  assert.notEqual(redemptionSecret('https://other.test', webcrypto, 1001), first);
  assert.notEqual(redemptionSecret('https://api.test', webcrypto, 601001), first);
  assert.notEqual(createRedemptionSecret(webcrypto), createRedemptionSecret(webcrypto));
});
