import test from 'node:test';
import assert from 'node:assert/strict';
import { izohniBayroqqa } from './izohBayroq.js';
test('REV315: fan nomidagi izoh — til bayrog‘i (5 til)', () => {
  assert.equal(izohniBayroqqa('Matematika (izoh: rus)'), 'Matematika 🇷🇺');
  assert.equal(izohniBayroqqa('Algebra (izoh: ingliz) · 8-sinf'), 'Algebra 🇬🇧 · 8-sinf');
  assert.equal(izohniBayroqqa('Geometriya (izoh: nemis)'), 'Geometriya 🇩🇪');
  assert.equal(izohniBayroqqa('Fizika (izoh: ispan)'), 'Fizika 🇪🇸');
  assert.equal(izohniBayroqqa('Kimyo'), 'Kimyo');
  assert.equal(izohniBayroqqa('X (izoh: noma’lum)'), 'X (izoh: noma’lum)');
});
