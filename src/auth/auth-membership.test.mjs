import test from 'node:test';
import assert from 'node:assert/strict';
import { challengeStorageKey, restoreTelegramChallenge, telegramChallenge } from './authClient.js';
import { claimInstitution, institutionCodeError, normalizeInstitutionCode, refreshInstitutionProfile } from '../workspace/membershipClient.js';
import { workspaceRequest } from '../workspace/kabutarWorkspaceClient.js';

const originalFetch = globalThis.fetch;
async function withFetch(fn, run) { globalThis.fetch = fn; try { await run(); } finally { globalThis.fetch = originalFetch; } }
const response = (data, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => data });

test('printed institution code separators normalize without discarding wrong characters', () => {
  assert.equal(normalizeInstitutionCode(' abcd efgh–1234 '), 'ABCDEFGH1234');
  assert.equal(institutionCodeError('ABCD EFGH-1234'), '');
  assert.ok(institutionCodeError('ABCD/EFGH1234'));
  assert.ok(institutionCodeError('ABCDEFGH12345'));
  assert.match(institutionCodeError('1234'), /4 xonali sinf/);
});

test('institution claim sends code only in POST body and session only in bearer header', async () => {
  await withFetch(async (url, options) => {
    assert.equal(url, 'https://api.example.test/api/oqituvchi/kirish_kodi_orqali_qoshil');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer user-session');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.credentials, 'omit');
    assert.deepEqual(JSON.parse(options.body), { kirish_kodi: 'ABCDEFGH1234' });
    return response({ holat: 'qoshildi', joy_nomi: 'Maktab' });
  }, async () => assert.equal((await claimInstitution('https://api.example.test/', 'user-session', 'ABCD EFGH-1234')).joy_nomi, 'Maktab'));
});

test('malformed OK responses and rejected invitations cannot report a successful claim', async () => {
  await withFetch(async () => response({ ok: true }), async () => {
    await assert.rejects(claimInstitution('', 'session', 'ABCDEFGH1234'), /tasdiqlanmadi/);
  });
  await withFetch(async () => response({ detail: 'Kod eskirgan' }, 409), async () => {
    await assert.rejects(claimInstitution('', 'session', 'ABCDEFGH1234'), error => error.status === 409 && error.message === 'Kod eskirgan');
  });
});

test('both Telegram positive IDs and Google negative IDs refresh after authenticated claim', async () => {
  for (const id of [7788, -12345]) {
    await withFetch(async () => response({ user_id: id, role: 'oquvchi' }), async () => {
      assert.equal((await refreshInstitutionProfile('', 'session')).user_id, id);
    });
  }
  await withFetch(async () => response({}), async () => {
    await assert.rejects(refreshInstitutionProfile('', 'session'), /profilingiz yangilanmadi/);
  });
});

test('intentional navigation cancellation retains AbortError rather than a false timeout', async () => {
  const controller = new AbortController(); controller.abort();
  await withFetch(async (_url, options) => {
    assert.equal(options.signal.aborted, true);
    throw Object.assign(new Error('Cancelled'), { name: 'AbortError' });
  }, async () => assert.rejects(workspaceRequest('', '/auth/men', 'session', { signal: controller.signal }), error => error.name === 'AbortError'));
});

test('Telegram restoration requires same API scope, live challenge, and safe bot URL', () => {
  const now = 1000000;
  const valid = { challenge: 'test-challenge', browser_secret: 'test-browser-secret', bot_url: 'https://t.me/test_bot?start=kb_test-challenge', expires_in: 60 };
  assert.equal(telegramChallenge(valid, now).expires_at, now + 60000);
  assert.equal(telegramChallenge({ ...valid, bot_url: 'https://evil.example/t.me/test_bot' }, now), null);
  assert.equal(telegramChallenge({ ...valid, browser_secret: 'short' }, now), null);
  const key = challengeStorageKey('https://api.example.test/');
  const saved = new Map([[key, JSON.stringify(telegramChallenge(valid, now))]]);
  const storage = { getItem: key => saved.get(key) };
  assert.equal(restoreTelegramChallenge(storage, key, now + 1000).challenge, valid.challenge);
  assert.equal(restoreTelegramChallenge(storage, key, now + 60001), null);
  assert.equal(restoreTelegramChallenge(storage, challengeStorageKey('https://other.example.test'), now), null);
});
