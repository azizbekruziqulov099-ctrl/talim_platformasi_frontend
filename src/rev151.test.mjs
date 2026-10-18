import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DARS_RASM_META } from './kid/darsRasmMeta.js';
import { emojiRasm, sozId, harakatTuri } from './kid/rasmHarakat.js';

const R = Object.fromEntries(DARS_RASM_META.map((m) => [`d_${m.id}`, `u/${m.id}`]));

test('REV151: har dars rasmining fayli bor va 300 KB dan kichik', () => {
  assert.ok(DARS_RASM_META.length >= 120);
  for (const m of DARS_RASM_META) {
    const st = fs.statSync(new URL(`./kid/dars/rasm/${m.id}.webp`, import.meta.url));
    assert.ok(st.size > 2000 && st.size < 300_000, `${m.id}: ${st.size}`);
  }
});

test('REV151: so‘z va emoji bo‘yicha rassom rasmi topiladi; umumiy emoji yonidagi so‘z bilan aniqlanadi', () => {
  assert.equal(sozId({ soz: 'Thank you!' }), 'd_thank-you');
  assert.equal(emojiRasm('🦁', R)?.id, 'd_lion');
  assert.equal(emojiRasm('👋', R, 'Hello')?.id, 'd_hello');
  assert.equal(emojiRasm('👋', R, 'Goodbye, see you')?.id, 'd_goodbye-see-you');
  assert.equal(emojiRasm('🙋', R, 'Hi'), null, 'mos rasm yo‘q — noto‘g‘ri rasm chiqmaydi');
  assert.equal(harakatTuri('d_hello'), 'salom');
});
