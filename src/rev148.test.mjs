import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { qismlar, qismIndeks, joylash } from './kid/xonalar/xonaRules.js';
import { XONALAR } from './kid/xonalar/xonaLugat.js';
import { JAMI, TURLAR, daraja, jonliOchiq, jonliYulduz, jonliNavbat, jonliYoz, jonliNatija } from './kid/jonli/jonliRules.js';
import { GAPIR_JAMI, GAPIR_RAUND, gapirDaraja, gapirBaho, iboraMatn, iboralarSoni, gapirOchiq, gapirYoz, gapirNatija, gapirNavbat, narsalarRoyxati } from './kid/jonli/gapirRules.js';
import { HARAKATLAR } from './kid/harakat/harakatLugat.js';

const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }; };

test('REV148: xona qismlarga bo‘linadi — har narsa bitta qismda, qismlar sahna ichida', () => {
  for (const x of XONALAR) {
    const qs = qismlar(x.id);
    assert.ok(qs.length >= 2, `${x.id}: kamida 2 qism`);
    const ids = joylash(x.id).filter((p) => !p.hs).map((p) => p.id);
    for (const id of ids) assert.ok(qismIndeks(qs, id) >= 0, `${x.id}/${id} qismsiz qoldi`);
    for (const q of qs) {
      assert.ok(q.x >= 0 && q.y >= 0 && q.x + q.w <= 100.01 && q.y + q.h <= 100.01, `${x.id}: qism sahnadan chiqdi`);
      assert.ok(q.ids.length >= 1);
    }
  }
});

test('REV148: jonli o‘yinlar — 120 bosqich, 8 tur, qiyinlik oshadi, ketma-ket ochiladi', () => {
  assert.equal(JAMI, 120);
  assert.equal(new Set(Array.from({ length: 8 }, (_, i) => daraja(i).tur)).size, TURLAR.length);
  for (let n = 0; n < JAMI; n += 1) assert.ok(daraja(n).sozlar.length >= 4, `bosqich ${n}: narsa kam`);
  assert.ok(daraja(119).tushish < daraja(0).tushish && daraja(119).ushlaSoni > daraja(0).ushlaSoni);
  assert.deepEqual(daraja(5).sozlar, daraja(5).sozlar, 'bir bosqich — har safar bir xil');
  assert.equal(jonliYulduz(0), 3); assert.equal(jonliYulduz(2), 2); assert.equal(jonliYulduz(5), 1);
  const st = mem();
  assert.equal(jonliOchiq(1, jonliNatija('en', st)), false);
  jonliYoz('en', 0, 2, st);
  assert.equal(jonliOchiq(1, jonliNatija('en', st)), true);
  assert.equal(jonliNavbat(jonliNatija('en', st)), 1);
  assert.equal(jonliOchiq(50, {}, true), true, 'admin — hammasi ochiq');
});

test('REV148: «Ayt — bo‘ladi!» — 160 bosqich, 180+ xil ibora, hammasi 11 tilda bor', () => {
  assert.equal(GAPIR_JAMI, 160);
  assert.ok(iboralarSoni() >= 180, `iboralar: ${iboralarSoni()}`);
  const korilgan = new Set();
  for (let n = 0; n < GAPIR_JAMI; n += 1) {
    const d = gapirDaraja(n);
    assert.equal(d.iboralar.length, GAPIR_RAUND);
    for (const ib of d.iboralar) {
      for (const til of ['uz', 'ru', 'en', 'de', 'fr', 'es', 'ar', 'tr', 'zh', 'ja', 'ko']) assert.ok(iboraMatn(ib, til), `${n} ${ib.id} ${til}`);
      korilgan.add(`${ib.tur}:${ib.id}`);
    }
  }
  for (const h of HARAKATLAR) assert.ok(korilgan.has(`harakat:${h.id}`), `${h.id} o‘yinda chiqmadi`);
  for (const id of narsalarRoyxati()) assert.ok(korilgan.has(`narsa:${id}`), `${id} o‘yinda chiqmadi`);
  assert.equal(gapirDaraja(0).iboralar[0].id, 'open', 'birinchi — «Och!» (eshik ochiladi)');
});

test('REV148: aytilgani baholanadi — to‘g‘ri, artiklsiz, 2-urinishda yumshoqroq, noto‘g‘ri emas', () => {
  const yop = { tur: 'harakat', id: 'close', toliq: true };
  assert.equal(gapirBaho(['close the door'], yop, 'en').ok, true);
  assert.equal(gapirBaho(['Close the door.'], yop, 'en').ok, true);
  assert.equal(gapirBaho(['open the window'], yop, 'en').ok, false);
  assert.equal(gapirBaho(['Apfel'], { tur: 'narsa', id: 'apple' }, 'de').ok, true);
  assert.equal(gapirBaho([], yop, 'en').ok, false);
  assert.equal(gapirBaho(['закрой дверь'], yop, 'ru').ok, true);
  const yaqin = gapirBaho(['clothe the do'], yop, 'en', 1);
  assert.ok(yaqin.stars >= 1 && yaqin.ok, '2-urinishda yaqin ham qabul');
});

test('REV148: «Ayt — bo‘ladi!» natijasi saqlanadi va keyingisi ochiladi', () => {
  const st = mem();
  assert.equal(gapirOchiq(0, {}), true);
  assert.equal(gapirOchiq(1, gapirNatija('ko', st)), false);
  gapirYoz('ko', 0, 3, st); gapirYoz('ko', 0, 1, st);
  assert.equal(gapirNatija('ko', st)[0], 3, 'eng yaxshi natija saqlanadi');
  assert.equal(gapirOchiq(1, gapirNatija('ko', st)), true);
  assert.equal(gapirNavbat(gapirNatija('ko', st)), 1);
  assert.deepEqual(gapirNatija('en', st), {}, 'tillar alohida');
});

test('REV148: sahnalar ekranga to‘liq sig‘adi (harakat 4:3, xona va dars doskasi katta)', () => {
  const h = fs.readFileSync(new URL('./kid/harakat/harakat.css', import.meta.url), 'utf8');
  assert.match(h, /\.hy-ish \.hs-sahna\{--hh:/);
  const x = fs.readFileSync(new URL('./kid/xonalar/xonalar.css', import.meta.url), 'utf8');
  assert.match(x, /--xo-chrome/);
  const d = fs.readFileSync(new URL('./lesson/dars-xonasi.css', import.meta.url), 'utf8');
  assert.match(d, /\.dx-root\.dx-focus \.us-stage\{width:min\(100%,calc\(\(100dvh/);
  const s = fs.readFileSync(new URL('./kid/harakat/HarakatSahna.jsx', import.meta.url), 'utf8');
  assert.match(s, /qolsiz/);
});
