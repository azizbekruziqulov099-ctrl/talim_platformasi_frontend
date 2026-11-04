import test from 'node:test';
import assert from 'node:assert/strict';
import { ochilish, havoTanlovi } from './darsOchilishi.js';
test('REV324: havo tanlovi — yoshga qarab variantlar soni, to‘g‘risi bor', () => {
  for (const [y, n] of [[2, 2], [4, 3], [6, 4]]) for (let k = 0; k < 7; k++) {
    const t = havoTanlovi({ togri: '🌧️', yosh: y, kun: k });
    assert.equal(t.variantlar.length, n); assert.equal(t.variantlar[t.togri], '🌧️'); assert.equal(new Set(t.variantlar).size, n);
  }
});
test('REV324: ochilishda havo qadami savol bilan, javob tanlovdan keyin', () => {
  const o = ochilish({ ustoz: 'nilufar', izoh: 'uz', grade: '4-5 yosh', havo: 'yomgir', vaqt: 'kun', kun: 2 });
  const h = o.find((s) => s._ochilish === 'havo');
  assert.ok(h.tanlov); assert.match(h.ovoz, /Derazaga qara/); assert.ok(!h.ovoz.includes("yomg'ir yog'yapti"));
  assert.ok(h.tanlov.javob.length > 5); assert.equal(h.tanlov.variantlar[h.tanlov.togri], '🌧️');
  const tun = ochilish({ ustoz: 'nilufar', izoh: 'uz', grade: '4-5 yosh', havo: 'quyosh', vaqt: 'tun' }).find((s) => s._ochilish === 'havo');
  assert.ok(!tun.tanlov);
});
