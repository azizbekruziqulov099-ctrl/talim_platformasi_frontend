// REV171: til xonalarida ob-havo va madaniy detallar, xonalar almashadi; «Shu yerdamisan?»; diqqat hisoboti
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { xonaKaliti, XONA } from './kid/ustozRules.js';
import { detallar, MADANIYAT } from './kid/madaniyat.js';
import { DIQQAT_TARJIMA, K, kutishVaqtlari } from './kid/diqqatGaplari.js';
import { gap } from './kid/izohTil.js';
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');

test('til ustozi ko‘p kun o‘z xonasida, ba’zan eski xonalarda; boshqalar — o‘z xonasida', () => {
  const kunlar = [0, 1, 2, 3, 4].map((k) => xonaKaliti('emily', k));
  assert.deepEqual(kunlar, ['til_emily', 'til_emily', 'onatili', 'til_emily', 'atrofolam']);
  assert.equal(xonaKaliti('sardor', 2), 'matematika');
  assert.equal(XONA.emily, 'til_emily');
});

test('har til xonasida 3 ta madaniy detal, 3 tilda', () => {
  assert.equal(Object.keys(MADANIYAT).length, 10);
  for (const k of Object.keys(MADANIYAT)) {
    const d = detallar(k);
    assert.equal(d.length, 3, k);
    for (const x of d) for (const l of ['uz', 'ru', 'en']) assert.ok(x.matn[l], `${k} ${x.k} ${l}`);
  }
  assert.deepEqual(detallar('sardor'), []);
});

test('derazada manzara va detal ochilishi sahnada bor', () => {
  const s = src('./kid/UstozSahna.jsx');
  assert.match(s, /us-sun/); assert.match(s, /us-detal-pop/); assert.match(s, /xonaKaliti\(ustoz\)/);
  assert.match(src('./kid/ustozlar.js'), /bosh: true/);
});

test('«Shu yerdamisan?» — hamma tilda, vaqtlar yoshga mos', () => {
  for (const l of ['ru', 'en', 'de', 'fr', 'es', 'tr', 'ar', 'zh', 'ja', 'ko']) assert.ok(DIQQAT_TARJIMA[l][K.bormi], l);
  assert.equal(gap('en', K.qaytdi), "[en]You're back! Let's carry on.[/en]");
  assert.deepEqual(kutishVaqtlari(true, 3), [12000, 24000, 36000]);
  assert.deepEqual(kutishVaqtlari(false), [90000, 0, 0]);   // maktab: faqat eslatadi, o'tib ketmaydi
  const d = src('./lesson/DarsXonasi.jsx');
  assert.match(d, /DIQQAT\.tasalli/); assert.match(d, /visibilitychange/); assert.match(d, /g\.again >= 3/);
  assert.match(src('./kid/kidActivity.js'), /yoq_soniya/);
});
