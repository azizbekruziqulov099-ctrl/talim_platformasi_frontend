import test from 'node:test';
import assert from 'node:assert/strict';
import { accountRisk, accountRole, cachedAuthConfig, dropToken, forgetAccount, loginRole, rememberAccount, rememberLoginMethod, roleMismatch, saveAuthConfig, saveLoginRole, savedAccounts, takeLoginMethod } from './loginMemory.js';

function memory() { const data = new Map(); return { getItem: (k) => data.has(k) ? data.get(k) : null, setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k) }; }

test('rol tanlanadi va noto‘g‘ri qiymat saqlanmaydi', () => {
  const s = memory();
  assert.equal(loginRole(s), '');
  saveLoginRole('talaba', s); assert.equal(loginRole(s), 'talaba');
  saveLoginRole('admin', s); assert.equal(loginRole(s), 'talaba');
});

test('akkaunt eslab qolinadi, sessiya tugasa token o‘chadi, akkaunt qoladi', () => {
  const s = memory();
  rememberLoginMethod('password', 'KB-123', s);
  const login = takeLoginMethod(s);
  rememberAccount({ user_id: 7, full_name: 'Aziz', role: 'oqituvchi', identities: { telegram: false, google: true } }, 'tok1', login, s);
  rememberAccount({ user_id: 8, full_name: 'Bek', role: 'oquvchi', identities: { telegram: true } }, 'tok2', null, s);
  let list = savedAccounts(s);
  assert.deepEqual(list.map((a) => a.user_id), [8, 7]);
  assert.equal(list[1].identifier, 'KB-123');
  assert.equal(list[0].method, 'telegram');
  list = dropToken('tok1', s);
  assert.equal(list.find((a) => a.user_id === 7).token, '');
  assert.equal(list.find((a) => a.user_id === 8).token, 'tok2');
  assert.deepEqual(forgetAccount(8, s).map((a) => a.user_id), [7]);
  assert.equal(takeLoginMethod(s), null);
});

test('ogohlantirish faqat Telegram ham, Gmail ham ulanmaganda', () => {
  assert.equal(accountRisk({ identities: { telegram: false, google: false } }), 'unlinked');
  assert.equal(accountRisk({ identities: { telegram: true, google: false } }), '');
  assert.equal(accountRisk({ identities: { telegram: false, google: true } }), '');
  assert.equal(accountRisk({ is_admin: true, identities: {} }), '');
  assert.equal(accountRisk(null), '');
});

test('talaba roli va rol farqi', () => {
  assert.equal(accountRole({ role: 'oquvchi', learning_profile: { role: 'talaba' } }), 'talaba');
  assert.equal(accountRole({ role: 'kabutar' }), '');
  assert.equal(roleMismatch({ role: 'oqituvchi' }, 'oquvchi'), true);
  assert.equal(roleMismatch({ role: 'oqituvchi' }, 'oqituvchi'), false);
  assert.equal(roleMismatch({ role: 'kabutar' }, 'oquvchi'), false);
});

test('config keshi', () => {
  const s = memory();
  assert.equal(cachedAuthConfig(s), null);
  saveAuthConfig({ google: { enabled: true } }, s);
  assert.deepEqual(cachedAuthConfig(s), { google: { enabled: true } });
});
