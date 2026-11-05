import test from 'node:test';
import assert from 'node:assert/strict';
import { qatorElementi, qadamElementlari, qadamSonlari, qadamOyini, yoshGuruh } from './oyinQadam.js';
test('REV325: Miya qatoridan element', () => {
  assert.deepEqual(qatorElementi('A) 🍐 nok'), { emoji: '🍐', uz: 'nok' });
  assert.deepEqual(qatorElementi('B) 🙋 [en]Hi![/en]'), { emoji: '🙋', say: 'Hi!' });
  assert.equal(qatorElementi('A) 1'), null);
});
test('REV325: qadamdan o‘yin', () => {
  const s = { turi: 'amaliy', oyin: 116, variantlar: 'A) 🐶 kuchuk\nB) 🐱 mushuk\nC) 🐟 baliq', javob: 'B', doska: '' };
  const o = qadamOyini(s, { yosh: '4-5' }); assert.equal(o.id, 116); assert.equal(o.elementlar.length, 3);
  const sana = { turi: 'amaliy', oyin: 31, doska: '🍎🍎🍎', javob: '3' };
  assert.deepEqual(qadamSonlari(sana), [3]); assert.ok(qadamOyini(sana, { yosh: '4-5' }));
  assert.equal(qadamOyini({ turi: 'amaliy', oyin: 999 }, { yosh: '4-5' }), null);
  assert.equal(qadamOyini({ turi: 'amaliy', oyin: 88, doska: '🍎' }, { yosh: '4-5' }), null);   // element yetmaydi — oddiy qadam
  assert.equal(yoshGuruh('2-3 yosh'), '2-3'); assert.equal(yoshGuruh('5-6 yosh'), '4-5'); assert.equal(yoshGuruh('6-7 yosh'), '6-7');
  assert.ok(qadamElementlari({ doska: '👋 [en]Hello![/en] / salom' })[0].say === 'Hello!');
});
import { darsElementlari } from './oyinQadam.js';
test('REV342: dars hovuzi — o‘yinga rasm yetmasa darsdagi rasmli so‘zlar olinadi', () => {
  const dars = [{ doska: '🍎 [en]apple[/en]\n🍌 [en]banana[/en]' }, { variantlar: ['🐶 [en]dog[/en]', '🐱 [en]cat[/en]'] }, { doska: 'matn' }];
  const h = darsElementlari(dars); assert.equal(h.length, 4);
  const s = { turi: 'amaliy', oyin: 117, ovoz: 'Eshik yopiq! Ayt: [en]dog[/en]', doska: 'Eshik yopiq!' };
  const o = qadamOyini(s, { yosh: '4-5', darsElementlari: h }); assert.ok(o); assert.equal(o.elementlar[0].say, 'dog');   // aytilgan so'z birinchi
  assert.equal(qadamOyini(s, { yosh: '4-5' }), null);   // hovuzsiz — rasm yo'q
});
