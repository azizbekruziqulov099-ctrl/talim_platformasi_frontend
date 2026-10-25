// REV174: maktab ota-onasi (bugun/hafta, «O'zim sinayman», «Mashq ber»), maktab o'quv yo'li, repetitor tuzatishlari
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { bugunJami, haftaUstunlari, ozgarganSozlar, bolaTillari, sinovTuz, topshiriqHolati, topshiriqXatosi, natijaFoiz } from './parent/maktabOtaRules.js';
import { ketmaKet } from './curriculum/darsYoli.js';
import { repYangila, manoVariantlari } from './maktab/repetitorRules.js';
import { harfTogri, harflar } from './maktab/maktabRules.js';
import { BARCHA_SOZ } from './maktab/index.js';
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');

test('ota-ona: bugungi jami va haftalik ustunlar', () => {
  const j = bugunJami([{ togri: 8, jami: 10, daqiqa: 5, yozdi: 40, sozlar: 5 }, { togri: 0, jami: 0, daqiqa: 15 }]);
  assert.deepEqual(j, { soni: 2, daqiqa: 20, yozdi: 40, sozlar: 5, foiz: 80 });
  assert.equal(bugunJami([]).foiz, null);
  const u = haftaUstunlari([{ faoliyat: 0, daqiqa: 0 }, { faoliyat: 2, daqiqa: 30 }, { faoliyat: 1, daqiqa: 0 }]);
  assert.deepEqual(u.map((x) => x.balandlik), [0, 100, 20]);
  assert.equal(natijaFoiz(3, 4), 75);
});

test('ota-ona: o‘rgangan so‘zlar, tillar, sinov savollari (ma’nosi takrorlanmaydi)', () => {
  const data = { tillar: [{ til: 'ru' }], sozlar: [{ id: 's7_sleep', til: 'en', kim: 'bugun' }, { id: 's7_sugar', til: 'en', kim: 'hafta' }, { id: 'yoq_soz', til: 'en', kim: 'bugun' }] };
  assert.deepEqual(bolaTillari(data), ['ru', 'en']);
  assert.deepEqual(ozgarganSozlar(data.sozlar, BARCHA_SOZ, { til: 'en', davr: 'bugun' }).map((w) => w.id), ['s7_sleep']);
  assert.equal(ozgarganSozlar(data.sozlar, BARCHA_SOZ, { til: 'en' }).length, 2);
  const w = (id, uz) => ({ id, w: { uz, en: id } });
  const pool = [w('dress', 'ko‘ylak'), w('shirt', 'ko‘ylak'), w('cat', 'mushuk'), w('dog', 'it'), w('cow', 'sigir')];
  for (let k = 0; k < 20; k++) {
    for (const q of sinovTuz(pool, { n: 5 })) {
      const m = q.variantlar.map((x) => x.w.uz);
      assert.equal(new Set(m).size, m.length, `takror ma'no: ${m}`);
      assert.ok(q.variantlar.includes(q.w));
    }
  }
});

test('ota-ona: topshiriq holati va tekshiruv', () => {
  assert.equal(topshiriqHolati({ holat: 'bajarildi' }).belgi, '✅');
  assert.equal(topshiriqHolati({ holat: 'yangi', muddat: '2026-10-20' }, '2026-10-25').belgi, '⏰');
  assert.equal(topshiriqHolati({ holat: 'yangi', muddat: '2026-10-28' }, '2026-10-25').belgi, '⏳');
  assert.equal(topshiriqXatosi([], 'en'), 'Kamida bitta so‘z tanlang');
  assert.equal(topshiriqXatosi(['a'], ''), 'Tilni tanlang');
  assert.equal(topshiriqXatosi(Array(31).fill('a'), 'en'), 'Ko‘pi bilan 30 ta so‘z');
  assert.equal(topshiriqXatosi(['a'], 'en'), '');
});

test('maktab o‘quv yo‘li: darslar tartib bilan, darsi yo‘q mavzu to‘smaydi', () => {
  const m = [{ dars_bor: true }, { dars_bor: true }, { dars_bor: false }, { dars_bor: true }, { dars_bor: true }];
  const done = new Set([0]);
  const y = ketmaKet(m, (i) => done.has(i));
  assert.deepEqual(y.ochiq, [true, true, true, false, false]);
  assert.equal(y.navbat, 1);
  assert.deepEqual([y.otildi, y.jami], [1, 4]);
  assert.equal(ketmaKet(m, () => true).navbat, -1);
});

test('repetitor: bir kunda so‘z faqat bir marta ko‘tariladi (yodlab puxta qilib bo‘lmaydi)', () => {
  let h = repYangila(null, true, { bugun: 50 });
  assert.equal(h.quti, 1);                       // yangi so'z — birinchi kuni 1-qutiga
  for (let k = 0; k < 10; k++) h = repYangila(h, true, { bugun: 50 });
  assert.equal(h.quti, 1);                       // o'sha kuni qayta-qayta — ko'tarilmaydi
  h = repYangila(h, true, { bugun: 51 });
  assert.equal(h.quti, 2);
  assert.equal(h.keyingi, 53);
});

test('repetitor: ma’no variantlarida bir xil ma’no yo‘q; plitka (harflar) bilan to‘g‘ri terilgan so‘z — to‘g‘ri', () => {
  const w = (id, uz) => ({ id, w: { uz } });
  for (let k = 0; k < 30; k++) {
    const v = manoVariantlari(w('dress', 'ko‘ylak'), [w('shirt', 'ko‘ylak'), w('cat', 'mushuk'), w('dog', 'it')]);
    assert.equal(new Set(v.map((x) => x.w.uz)).size, 3);
  }
  for (const soz of ['die Mama', 'T-shirt', 'Thank you', "l'école"]) assert.ok(harfTogri(harflar(soz), soz), soz);
});

test('integratsiya: ota-ona bo‘limi, topshiriq, xatolar ustida ishlash, maktab yo‘li, takror qotmaydi', () => {
  assert.match(src('./parent/BolaMarkazi.jsx'), /<MaktabOtaOna /);
  const m = src('./maktab/MaktabTil.jsx');
  assert.match(m, /topshiriqlarOl\(apiBase, authToken, til\)/);
  assert.match(m, /faollikYoz\(apiBase, authToken, \{ turi: "til"/);
  assert.match(m, /javobBer\(true, "", \{ oz: true \}\)/);
  const r = src('./maktab/Repetitor.jsx');
  assert.match(r, /tekshirPlitka/);
  assert.match(r, /setMik\("qayta"\)/);
  const d = src('./lesson/DarsXonasi.jsx');
  assert.match(d, /xatoIshlash/);
  assert.match(d, /markLessonDone\(topicCode, 0\)/);
  assert.match(src('./curriculum/LearnerTopics.jsx'), /<MaktabYoli /);
  assert.match(src('./kid/HaftalikTakror.jsx'), /setTimeout\(otish, 4500\)/);
});
