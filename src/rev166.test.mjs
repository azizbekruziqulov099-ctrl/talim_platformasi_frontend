// REV166: kundalik qoidalari, fan kartasidagi kunlar, shashka damka toji
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { bugungiXulosa, ertangiFanlar, haftaHisobi, kuchlarRoyxati, kunKataklari, qisqaSana, yulduzSatr, DARAJA_ZINA } from './kid/kundalikRules.js';
import { fanHolati, haftaKuni } from './parent/bogchaReja.js';

test('kun kataklari: rejadagi fan, o‘tkazilgan, bugun, qo‘shimcha va yakshanba', () => {
  const d = (holat, rejada, darslar, kun = 0) => ({ holat, rejada, darslar, kun });
  assert.deepEqual(kunKataklari(d('otdi', ['en', 'mat'], [{ kalit: 'en', tugadi: true, yulduz: 3, baho: 5, fan: 'Ingliz tili', mavzu: 'Salom' }]))
    .map((c) => [c.kalit, c.holat, c.yulduz, c.baho]), [['en', 'tugadi', 3, 5], ['mat', 'otkazildi', 0, null]]);
  assert.equal(kunKataklari(d('bugun', ['ru'], []))[0].holat, 'bugun');
  assert.equal(kunKataklari(d('keladi', ['ru'], []))[0].holat, 'keladi');
  const extra = kunKataklari(d('bugun', ['ru'], [{ kalit: 'ru', tugadi: true, yulduz: 2 }, { kalit: 'ru', tugadi: false }]));
  assert.deepEqual(extra.map((c) => [c.holat, !!c.qoshimcha]), [['tugadi', false], ['chala', true]]);
  assert.equal(kunKataklari(d('otdi', [], [], 6))[0].holat, 'takror');
  assert.equal(kunKataklari(d('otdi', [], [], 4))[0].holat, 'bosh');
});

test('yordamchilar', () => {
  assert.equal(yulduzSatr(2), '⭐⭐☆');
  assert.equal(yulduzSatr(9), '⭐⭐⭐');
  assert.equal(qisqaSana('2026-10-19'), '19.10');
  assert.equal(DARAJA_ZINA.length, 13);
  assert.deepEqual(kuchlarRoyxati([{ kalit: 'tezlik', daraja: 9 }, { kalit: 'xotira', daraja: 2 }, { kalit: 'yoq', daraja: 3 }]).map((k) => [k.nom, k.daraja]),
    [['Aqlli', 2], ['Chaqqon', 5]]);
  assert.deepEqual(haftaHisobi({ kunlar: [{ rejada: ['en', 'ru'], darslar: [{ tugadi: true }], yulduz: 3 }, { rejada: ['en'], darslar: [], yulduz: 0 }] }),
    { reja: 3, tugadi: 1, yulduz: 3, foiz: 33 });
});

test('ota-onaga bugungi xulosa (backend kun_xulosasi bilan bir xil)', () => {
  const x = bugungiXulosa([
    { mavzu: 'Salom', tugadi: '10:00', yulduz: 3, sozlar: [{ soz: 'cat', aytdi: false }, { soz: 'dog', aytdi: true }] },
    { mavzu: 'Ranglar', tugadi: '11:00', yulduz: 1, sozlar: [{ soz: 'Cat', aytdi: true }, { soz: 'red', aytdi: false }] },
    { mavzu: 'Bir', tugadi: null, sozlar: [] },
  ]);
  assert.deepEqual(x.organdi, ['Salom', 'Ranglar']);
  assert.deepEqual(x.takrorSoz.map((w) => w.soz), ['red']);
  assert.deepEqual(x.takrorDars, ['Ranglar']);
  assert.deepEqual(x.chala, ['Bir']);
  assert.deepEqual(ertangiFanlar([['en'], ['ru'], [], [], [], ['mat'], []], 5), []);
  assert.deepEqual(ertangiFanlar([['en'], ['ru'], [], [], [], ['mat'], []], 6), ['en']);
  assert.equal(ertangiFanlar(null, 2), null);
});

test('fan kartasi: haftaning qaysi kunlari', () => {
  assert.equal(haftaKuni('2026-10-23'), 4);
  assert.equal(haftaKuni('2026-10-25'), 6);
  const plan = { sana: '2026-10-23', reja: { manba: 'reja', faol: ['en'], navbat: [], bugun: { en: 0 }, keyingi: { en: 'Shanba' }, hafta: [['en'], [], ['en'], [], [], ['en'], []] } };
  const h = fanHolati(plan, 'Ingliz tili');
  assert.deepEqual([h.turi, h.kunlar, h.bugun, h.keyingi], ['keyin', [0, 2, 5], 4, 'Shanba']);
});

test('shashka: damka toji SVG va taxta konteyner (o‘lcham katakka bog‘liq)', () => {
  const jsx = fs.readFileSync(new URL('./games/Shashka.jsx', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('./games/shashka.css', import.meta.url), 'utf8');
  assert.ok(!jsx.includes('"👑" : ""') && jsx.includes('<Toj />'));
  assert.match(css, /\.sh-board\s*\{\s*container-type:\s*inline-size/);
});
