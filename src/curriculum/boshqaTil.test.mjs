import test from 'node:test';
import assert from 'node:assert/strict';
import { tilVariantlari, moslar } from './boshqaTil.js';
const t = (n, dars = true) => ({ nomi: n, dars_bor: dars, topic_codes: [n] });
const sub = (nom, mavzular) => ({ nom, kalit: nom, sinflar: [{ sinf: '4-5 yosh', mavzular }] });
test('REV328: boshqa tildagi variantlar va o‘sha dars', () => {
  const uz = sub('Matematika', [t('Sanash'), t('Takror', false), t('Besh')]);
  const ru = sub('Matematika (izoh: rus)', [t('Счёт'), t('Пять')]);
  const fanlar = [uz, ru, sub('Matematika (izoh: ingliz)', []), sub('Ingliz tili (izoh: ingliz)', []), sub('Mantiq', [])];
  assert.deepEqual(tilVariantlari(fanlar, 'Matematika').map((x) => x.til), ['ru', 'en']);
  assert.deepEqual(tilVariantlari(fanlar, 'Matematika (izoh: rus)').map((x) => x.til), ['uz', 'en']);
  assert.deepEqual(tilVariantlari(fanlar, 'Mantiq'), []);
  const g = uz.sinflar[0];
  assert.equal(moslar(ru, g, g.mavzular[2]).topic.nomi, 'Пять');   // darsli mavzular ichida 2-o'rin
  assert.equal(moslar(fanlar[2], g, g.mavzular[0]), null);
});
