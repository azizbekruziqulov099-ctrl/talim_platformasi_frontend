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
test('REV336: chalkash yo‘llar, tarozi, teskari', () => {
  for (const [id, ys] of [[93, ['2-3', '4-5', '6-7']], [106, ['2-3', '4-5', '6-7']], [114, ['4-5', '6-7']]]) for (const y of ys) {
    const h = oyinYasa(id, { elementlar: el, yosh: y, urug: 11 });
    assert.ok(h, `${id} ${y}`);
    for (const r of h.raundlar) assert.ok(r.variantlar.some((v) => v.k === r.togri));
    for (const iz of ['uz', 'ru', 'en', 'de', 'es']) assert.ok(raundGapi(h, { izoh: iz, til: 'uz', birinchi: true }).length > 5);
  }
  const y = oyinYasa(93, { elementlar: el, yosh: '6-7', urug: 5 }).raundlar[0];
  const iv = y.variantlar.findIndex((v) => v.k === y.togri); assert.equal(y.savol.oxir[iv], y.savol.maqsad);   // to'g'ri narsaning yo'li suyakka boradi
  const t = oyinYasa(106, { elementlar: el, yosh: '4-5', urug: 2 }).raundlar[0];
  assert.equal(t.togri, t.savol.ogir === 'chap' ? t.savol.chap.k : t.savol.ong.k);
  const s = oyinYasa(114, { elementlar: [], yosh: '6-7', urug: 4 }); assert.match(raundGapi(s, { izoh: 'ru', til: 'uz' }), /противоположное/);
});
test('REV337: rang o‘yinlari', () => {
  for (const [id, ys] of [[61, ['2-3', '4-5', '6-7']], [62, ['2-3', '4-5', '6-7']], [63, ['2-3', '4-5', '6-7']], [64, ['6-7']]]) for (const y of ys) {
    const h = oyinYasa(id, { elementlar: [], yosh: y, urug: 9 }); assert.ok(h, `${id} ${y}`);
    for (const r of h.raundlar) { assert.ok(r.variantlar.some((v) => v.k === r.togri)); assert.equal(new Set(r.variantlar.map((v) => v.k)).size, r.variantlar.length); }
    for (const iz of ['uz', 'ru', 'en', 'de', 'es']) assert.ok(raundGapi(h, { izoh: iz, til: 'uz', birinchi: true }).length > 5);
  }
  assert.equal(oyinYasa(64, { elementlar: [], yosh: '4-5' }), null);   // aralashtirish — faqat 6–7 yosh
  const h = oyinYasa(61, { elementlar: [], yosh: '2-3', urug: 1 });
  assert.ok(h.raundlar.every((r) => ['qizil', 'sariq', 'kok', 'yashil'].includes(r.togri)));   // kichiklarga — asosiy 4 rang
});
test('REV338: matematika o‘yinlari', () => {
  for (const [id, ys] of [[49, ['4-5', '6-7']], [57, ['6-7']], [43, ['4-5', '6-7']], [59, ['4-5', '6-7']]]) for (const y of ys) {
    const h = oyinYasa(id, { elementlar: [], yosh: y, urug: 13 }); assert.ok(h, `${id} ${y}`);
    for (const r of h.raundlar) assert.ok(r.variantlar.some((v) => v.k === r.togri));
    for (const iz of ['uz', 'ru', 'en', 'de', 'es']) assert.ok(raundGapi(h, { izoh: iz, til: 'uz', birinchi: true }).length > 10, `${id} ${iz}`);
  }
  const d = oyinYasa(49, { elementlar: [], yosh: '6-7', urug: 3 });
  for (const r of d.raundlar) for (const v of r.variantlar) assert.equal(v.narx <= r.savol.pul, v.k === r.togri);   // faqat to'g'risiga pul yetadi
  const o = oyinYasa(57, { elementlar: [], yosh: '6-7', urug: 2 }).raundlar[0];
  assert.equal(o.togri, `n:${o.savol.onlar * 10 + o.savol.birlar}`);
  const m = oyinYasa(59, { elementlar: [], yosh: '4-5', urug: 5 });
  assert.ok(m.raundlar.every((r) => r.savol.amal === '+'));   // 4–5 yoshda faqat qo'shish
  for (const r of oyinYasa(59, { elementlar: [], yosh: '6-7', urug: 8 }).raundlar) { const j = r.savol.amal === '+' ? r.savol.a + r.savol.b : r.savol.a - r.savol.b; assert.equal(r.togri, `n:${j}`); assert.ok(j >= 1 && j <= 9); }
});
