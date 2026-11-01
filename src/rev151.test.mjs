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
    assert.ok(st.size > 1000 && st.size < 300_000, `${m.id}: ${st.size}`);   // REV244: oddiy shakllar (kvadrat, minus) juda yengil siqiladi
  }
});

test('REV151: so‘z va emoji bo‘yicha rassom rasmi topiladi; umumiy emoji yonidagi so‘z bilan aniqlanadi', () => {
  assert.equal(sozId({ soz: 'Thank you!' }), 'd_thank-you');
  assert.equal(emojiRasm('🦁', R)?.id, 'd_lion');
  assert.equal(emojiRasm('👋', R, 'Hello')?.id, 'd_m-assalomu-alaykum', 'REV241: rasmiy salom — kattaga salom berayotgan bola');
  assert.equal(emojiRasm('👋', R, 'Goodbye, see you')?.id, 'd_goodbye-see-you');
  assert.equal(emojiRasm('🙋', R, 'Hi')?.id, 'd_m-qol-silkit-salomlash', 'REV241: do‘stona salom — tengdoshlar qo‘l silkitadi');
  assert.equal(harakatTuri('d_hello'), 'salom');
});
