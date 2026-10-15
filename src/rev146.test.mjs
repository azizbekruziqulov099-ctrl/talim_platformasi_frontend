import test from 'node:test';
import assert from 'node:assert/strict';
import { authRequest } from './auth/authClient.js';
import fs from 'node:fs';

test('REV146: 502/503/504 — server qayta ishga tushmoqda: tarmoq xatosi (kirish o‘zi qayta urinadi)', async () => {
  const old = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 503, json: async () => null });
    await assert.rejects(authRequest('https://x', '/auth/config'), (e) => e.network === true && /javob bermadi/.test(e.message));
    globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({ detail: 'Ichki xato' }) });
    await assert.rejects(authRequest('https://x', '/auth/config'), (e) => !e.network && e.message === 'Ichki xato');
  } finally { globalThis.fetch = old; }
});

test('REV146: saqlangan akkaunt tokeni faqat 401/403 da o‘chadi, so‘rov osilib qolmaydi', () => {
  const src = fs.readFileSync(new URL('./auth/KabutarLogin.jsx', import.meta.url), 'utf8');
  assert.match(src, /response\.status === 401 \|\| response\.status === 403\) \{ natija = "tugagan"/);
  assert.match(src, /setTimeout\(\(\) => controller\.abort\(\), 12000\)/);
  assert.match(src, /retry = setTimeout\(\(\) => setConfigAttempt/);
});
