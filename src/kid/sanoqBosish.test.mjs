import test from 'node:test';
import assert from 'node:assert/strict';
import { sanoqBosish } from './kidStageRules.js';
test('REV291: «Bitta bananni bos!» — o\'yin', () => {
  const r = sanoqBosish({ ovoz: 'Ayiqchaga bitta banan kerak. Bitta bananni bos!', doska: '🍌🍌🍌🍌' });
  assert.equal(r.kerak, 1); assert.equal(r.belgilar.length, 4);
  assert.equal(sanoqBosish({ ovoz: 'Ikkita olmani bos', doska: '🍎🍎🍎' }).kerak, 2);
  assert.equal(sanoqBosish({ ovoz: 'Qo‘lingga ol', doska: '✋🍐' }), null);   // bosish yo'q — o'yin emas
  assert.equal(sanoqBosish({ ovoz: 'Bos!', doska: '🍐' }), null);           // bitta narsa — o'yin emas
});
