import test from 'node:test';
import assert from 'node:assert/strict';
import { ochilish } from './darsOchilishi.js';
import { tanlovYasa } from './kalendar.js';
test.skip('REV331 (REV344 da o‘zgardi): toq kuni fasl, juft kuni havo', () => {
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

test.skip('REV332 (REV344 da o‘zgardi): kun poyezdi navbatda', () => {
  const sana = new Date('2026-11-05T10:00:00');   // payshanba — 4-kun
  const st = ochilish({ ustoz: 'nilufar', izoh: 'uz', grade: '6-7 yosh', havo: 'quyosh', vaqt: 'kun', kun: 5, sana }).find((s) => s._ochilish === 'vaqt');
  assert.ok(st.tanlov); assert.equal(st.tanlov.variantlar[st.tanlov.togri], '4️⃣'); assert.match(st.ovoz, /Kun poyezdi/);
  const h = ochilish({ ustoz: 'nilufar', izoh: 'uz', grade: '6-7 yosh', havo: 'quyosh', vaqt: 'kun', kun: 6, sana });
  assert.ok(h.find((s) => s._ochilish === 'havo').tanlov);
});

test('REV344: har darsda havo va fasl, 6–7 yoshda kun poyezdi ham', () => {
  const sana = new Date('2026-11-05T10:00:00');   // payshanba
  for (const kun of [6, 7]) {
    const o = ochilish({ ustoz: 'nilufar', izoh: 'uz', grade: '4-5 yosh', havo: 'quyosh', vaqt: 'kun', kun, sana });
    assert.ok(o.find((s) => s._ochilish === 'havo').tanlov); assert.ok(o.find((s) => s._ochilish === 'vaqt').tanlov);
    assert.ok(!o.find((s) => s._ochilish === 'kun'));
  }
  const k = ochilish({ ustoz: 'nilufar', izoh: 'uz', grade: '6-7 yosh', havo: 'quyosh', vaqt: 'kun', kun: 6, sana });
  const q = k.find((s) => s._ochilish === 'kun'); assert.ok(q && q.tanlov); assert.equal(q.tanlov.variantlar[q.tanlov.togri], '4️⃣');
  assert.match(q.tanlov.javob, /payshanba/i);
  assert.ok(k.findIndex((s) => s._ochilish === 'kun') < k.findIndex((s) => s._ochilish === 'vaqt'));
  const tun = ochilish({ ustoz: 'nilufar', izoh: 'uz', grade: '4-5 yosh', havo: 'quyosh', vaqt: 'tun', kun: 6, sana });
  assert.ok(!tun.find((s) => s._ochilish === 'havo').tanlov && tun.find((s) => s._ochilish === 'vaqt').tanlov);   // tunda havo emas, fasl so'raladi
});
