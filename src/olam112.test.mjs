import test from 'node:test';
import assert from 'node:assert/strict';
import { SAHNALAR, fanEshiklari, qavatSoni, qoshnilar } from './kid/olamRules.js';

test('har nuqta mavjud sahnaga olib boradi, orqaga yo‘l bor', () => {
  for (const [id, s] of Object.entries(SAHNALAR)) {
    for (const n of s.nuqtalar) {
      assert.ok(n.ga ? SAHNALAR[n.ga] : n.amal, `${id}/${n.id}`);
      assert.ok(n.x >= 0 && n.x <= 100 && n.y >= 0 && n.y <= 100);
    }
    if (id !== 'bino') assert.ok(SAHNALAR[s.orqaga], id);
  }
  assert.deepEqual(qoshnilar('bino').sort(), ['hayvonot', 'hovli', 'koridor', 'sport']);
});

test('REV121: fanlar eshiklarga taqsimlanadi, 4 tadan ortig\'i — 2-qavatda (zinapoya bilan)', () => {
  const f = fanEshiklari([1, 2, 3, 4, 5].map((n) => ({ kalit: `f${n}`, nom: `Fan ${n}` })));
  assert.ok(f.every((x) => x.joy));
  assert.deepEqual(f.map((x) => x.qavat), [0, 0, 0, 0, 1]);
  assert.deepEqual(f[4].joy, f[0].joy);
  assert.equal(qavatSoni([]), 1);
  assert.equal(qavatSoni(f), 2);
  assert.equal(qavatSoni(Array.from({ length: 13 }, (_, i) => ({ kalit: `k${i}` }))), 4);
});
