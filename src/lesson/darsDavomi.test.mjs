import test from 'node:test';
import assert from 'node:assert/strict';
const mem = new Map(); globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
const { davomSaqla, davomOl, davomTozala, davomFoiz, davomJoyi } = await import('./darsDavomi.js');
test('REV326: dars qayerda qolgani', () => {
  davomSaqla('MT45-03', 8, 23, 3);
  const d = davomOl('MT45-03'); assert.equal(d.idx, 8);
  assert.equal(davomFoiz(d), 25); assert.equal(davomJoyi(d, 23, 3), 8);
  assert.equal(davomJoyi(d, 30, 3), null);   // dars o'zgargan
  assert.equal(davomJoyi({ ...d, idx: 4 }, 23, 3), null);   // endigina boshlangan
  assert.equal(davomOl('MT45-03', Date.now() + 30 * 864e5), null);   // eskirgan
  davomTozala('MT45-03'); assert.equal(davomOl('MT45-03'), null);
});
