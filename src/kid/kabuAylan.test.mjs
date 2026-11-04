import test from 'node:test';
import assert from 'node:assert/strict';
import { aylanishHolati } from './kabuAylan.js';
test('REV331: aylanish holati', () => {
  assert.deepEqual(aylanishHolati(0), { sx: 1, orqa: false });
  assert.equal(aylanishHolati(90).sx, 0.16);          // yon — ingichka, yo'qolib qolmaydi
  assert.deepEqual(aylanishHolati(180), { sx: -1, orqa: true });
  assert.equal(aylanishHolati(360).orqa, false);
  assert.ok(aylanishHolati(135).orqa && !aylanishHolati(45).orqa);
});
