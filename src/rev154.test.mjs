import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DARS_RASM_META } from './kid/darsRasmMeta.js';
import { emojiRasm, matnId } from './kid/rasmHarakat.js';
import { SAHNA_HARAKAT, aralashHarakatlar } from './kid/jonli/sahnaHarakatLugat.js';
import { GAPIR_HARAKATLAR, gapirDaraja, iboraMatn } from './kid/jonli/gapirRules.js';
import { TILLAR } from './kid/xonalar/xonaLugat.js';

const src = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const R = Object.fromEntries(DARS_RASM_META.map((m) => [`d_${m.id}`, `u/${m.id}`]));

test('REV154: siz chizgan dars rasmlari qo\'shildi, har birining fayli bor', () => {
  assert.ok(DARS_RASM_META.length >= 330, String(DARS_RASM_META.length));
  const ids = DARS_RASM_META.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length, 'id takrorlanmaydi');
  for (const m of DARS_RASM_META) assert.ok(fs.existsSync(new URL(`./kid/dars/rasm/${m.id}.webp`, import.meta.url)), m.id);
  const js = src('./kid/darsRasm.js');
  for (const m of DARS_RASM_META) assert.ok(js.includes(`"d_${m.id}"`), m.id);
});

test('REV154: yangi rasmlar darsda o\'z belgisi va so\'zi bo\'yicha topiladi', () => {
  assert.equal(emojiRasm('🦈', R)?.id, 'd_akula');
  assert.equal(emojiRasm('🦒', R)?.id, 'd_giraffe');
  assert.equal(emojiRasm('🐈😴', R)?.id, 'd_the-cat-is-sleeping');
  assert.equal(matnId('I go to school'), 'd_i-go-to-school');
  assert.equal(matnId('qovun'), 'd_qovun');
  assert.equal(matnId('Hi!'), 'd_hi');
  assert.equal(matnId('yellow'), 'd_yellow');
});

test('REV154: «Ayt — bo\'ladi!» — 15 ta rassom sahnasi, 11 tilda, rasmlari bor', () => {
  assert.equal(SAHNA_HARAKAT.length, 15);
  const rasm = src('./kid/jonli/sahnaHarakatRasm.js');
  for (const h of SAHNA_HARAKAT) {
    for (const t of TILLAR) assert.ok(h.g[t] && h.s[t], `${h.id} ${t}`);
    for (const f of ['oldin', 'keyin']) assert.ok(fs.existsSync(new URL(`./kid/jonli/sahna/${h.rasm}_${f}.webp`, import.meta.url)), `${h.rasm}_${f}`);
    assert.ok(rasm.includes(`${h.rasm}: {`), h.rasm);
  }
  assert.equal(GAPIR_HARAKATLAR.length, 35);
  assert.deepEqual(aralashHarakatlar([{ id: 'a' }, { id: 'b' }]).slice(0, 4).map((x) => x.id), ['a', 'sahna_deraza', 'b', 'sahna_televizor']);
  const seen = new Set();
  for (let n = 0; n < 160; n++) for (const ib of gapirDaraja(n).iboralar) if (ib.tur === 'harakat') seen.add(ib.id);
  for (const h of SAHNA_HARAKAT) assert.ok(seen.has(h.id), `${h.id} o'yinda chiqadi`);
  assert.equal(iboraMatn({ tur: 'harakat', id: 'sahna_gul', toliq: true }, 'en'), 'Water the flower!');
});

test('REV154: tugmalar, o\'yin turlari, xona kartalari, chiroq, ob-havo — chizilgan belgilar', () => {
  const b = src('./kid/Belgi.jsx');
  for (const n of ['belgi_mikrofon', 'belgi_karnay', 'belgi_qulf', 'rejim_kashf', 'xona_oshxona', 'tur_ushla', 'tur_harakat', 'havo_quyosh', 'chiroq_yoniq', 'rag_nishon'])
    assert.ok(b.includes(`${n}: b_${n}`), n);
  assert.ok(!/olam_/.test(b.replace(/^\/\/.*$/m, '')), 'ishlatilmaydigan Bog\'cha olami belgilari kodga kirmaydi');
  assert.match(src('./kid/xonalar/TilXonalari.jsx'), /rejim_\$\{r\}/);
  assert.match(src('./kid/xonalar/TilXonalari.jsx'), /xona_\$\{r\.id\}/);
  assert.match(src('./kid/jonli/JonliYol.jsx'), /tur_\$\{t\.id\}/);
  assert.match(src('./kid/UstozSahna.jsx'), /chiroq_yoniq/);
  assert.match(src('./kid/UstozSahna.jsx'), /us-havo-rasm/);
  assert.match(src('./kid/darsOchilishi.js'), /_havo:/);
});
