import test from 'node:test';
import assert from 'node:assert/strict';
import { ochilish } from './darsOchilishi.js';
import { tanlovYasa } from './kalendar.js';
test('REV331: toq kuni bola faslni o‘zi topadi, juft kuni havoni', () => {
  const sana = new Date('2026-11-05T10:00:00');
  const toq = ochilish({ ustoz: 'nilufar', izoh: 'uz', grade: '4-5 yosh', havo: 'quyosh', vaqt: 'kun', kun: 7, sana });
  const v = toq.find((s) => s._ochilish === 'vaqt'), h = toq.find((s) => s._ochilish === 'havo');
  assert.ok(v.tanlov && !h.tanlov); assert.equal(v.tanlov.variantlar[v.tanlov.togri], '🍂'); assert.match(v.ovoz, /qaysi fasli/);
  const juft = ochilish({ ustoz: 'nilufar', izoh: 'uz', grade: '4-5 yosh', havo: 'quyosh', vaqt: 'kun', kun: 8, sana });
  assert.ok(juft.find((s) => s._ochilish === 'havo').tanlov && !juft.find((s) => s._ochilish === 'vaqt').tanlov);
  const de = ochilish({ ustoz: 'lukas', til: 'de', izoh: 'uz', grade: '4-5 yosh', vaqt: 'kun', kun: 7, sana }).find((s) => s._ochilish === 'vaqt');
  assert.match(de.ovoz, /Jahreszeit/);
  const t = tanlovYasa('❄️', ['❄️', '🌸', '☀️', '🍂'], 2, 3); assert.equal(t.variantlar.length, 2); assert.equal(t.variantlar[t.togri], '❄️');
});
