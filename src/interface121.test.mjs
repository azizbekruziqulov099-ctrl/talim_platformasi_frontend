import test from 'node:test';
import assert from 'node:assert/strict';
import { INTERFACE_LOCALES, normalizeInterface } from './interface/interfaceRules.js';
import { ensureLocalePack, localePackReady, translateUi } from './interface/interfaceRuntime.js';

test('REV121: sayt uch tilda; eski tanlov o\'zbekchaga qaytadi', () => {
  assert.deepEqual(INTERFACE_LOCALES.map((l) => l.value), ['uz', 'ru', 'en']);
  assert.equal(normalizeInterface({ locale: 'tr' }).locale, 'uz');
  assert.equal(normalizeInterface({ locale: 'en' }).locale, 'en');
});

test('REV121: rus va ingliz paketlari oflayn — tarmoqsiz ham to\'liq tarjima', async () => {
  assert.equal(localePackReady('uz'), true);
  assert.equal(localePackReady('ru'), false);
  assert.equal(await ensureLocalePack('ru'), true);
  assert.equal(await ensureLocalePack('en'), true);
  assert.equal(translateUi('Kim sifatida kirasiz?', 'ru'), 'Кем вы входите?');
  assert.equal(translateUi('Kim sifatida kirasiz?', 'en'), 'Who are you signing in as?');
  assert.equal(translateUi('Kim sifatida kirasiz?', 'uz'), 'Kim sifatida kirasiz?');
});
