import test from 'node:test';
import assert from 'node:assert/strict';
import { oyinYasa, tekshir, raundGapi, OYINLAR } from './oyinRules.js';
import { oyinMatn } from './oyinMatn.js';
const el = [{ emoji: '🐶', uz: 'kuchuk' }, { emoji: '🐱', uz: 'mushuk' }, { emoji: '🐟', uz: 'baliq' }];
test('REV335: fazoviy o‘yinlar — hamma yoshda, to‘g‘ri javob bor, 5 tilda matn', () => {
  for (const id of [68, 76, 103]) {
    assert.ok(OYINLAR.some((o) => o.id === id));
    for (const y of ['2-3', '4-5', '6-7']) {
      const h = oyinYasa(id, { elementlar: el, yosh: y, urug: 7 });
      for (const r of h.raundlar) { assert.ok(r.variantlar.some((v) => v.k === r.togri)); assert.equal(new Set(r.variantlar.map((v) => v.k)).size, r.variantlar.length); }
      const n = tekshir(h, h.raundlar[0].togri); assert.equal(n.togri, true);
      for (const iz of ['uz', 'ru', 'en', 'de', 'es']) assert.ok(raundGapi(h, { izoh: iz, til: 'uz', birinchi: true }).length > 5);
    }
  }
  for (const k of ['ustida', 'ostida', 'ichida', 'ongda', 'chapda']) for (const iz of ['uz', 'ru', 'en', 'de', 'es']) assert.ok(oyinMatn('joylashuv', k, iz));
  const m = oyinYasa(103, { elementlar: [], yosh: '6-7', urug: 3 }).raundlar[0];
  const nam = m.savol.minora.join(); assert.equal(m.variantlar.filter((v) => v.minora.join() === nam).length, 1);   // faqat bittasi namunaga teng
});
