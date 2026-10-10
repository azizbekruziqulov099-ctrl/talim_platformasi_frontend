import test from 'node:test';
import assert from 'node:assert/strict';
import { SAHNALAR, fanEshiklari, qoshnilar } from './kid/olamRules.js';

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

test('fanlar eshiklarga taqsimlanadi, ortiqchasi pastki qatorda', () => {
  const f = fanEshiklari([1, 2, 3, 4, 5].map((n) => ({ kalit: `f${n}`, nom: `Fan ${n}` })));
  assert.equal(f.filter((x) => x.joy).length, 4);
  assert.equal(f[4].joy, null);
});
