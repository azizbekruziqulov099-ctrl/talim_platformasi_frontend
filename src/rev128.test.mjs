import test from 'node:test';
import assert from 'node:assert/strict';
import { qosh, holat, oqi, SEANS, TANAFFUS, KUNLIK } from './kid/xonalar/oyinVaqti.js';
import { srsYangila, tanlaSRS, ORALIQ, PUXTA, xotiraKartalar, yoqoldiSavol, ortiqchaSavol, tartibSavol, hammasi, xona, turkumi, rejimlar } from './kid/xonalar/xonaRules.js';
import { XONALAR, TURKUM, SOZLAR, BUYRUQ_MEN, TILLAR } from './kid/xonalar/xonaLugat.js';
import { VAZIYATLAR } from './til/mashqLugat.js';
import { yozuvniTekshir, bolaklar, bolakTogri, gapBaho, tozala } from './til/mashqRules.js';

const rng = (() => { let s = 11; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

test('REV128: play time — 1 hour then a 15-minute break, at most 2 hours a day', () => {
  const t0 = Date.UTC(2026, 9, 12, 8, 0, 0);
  let h = { kun: 'x', jami: 0, seans: 0, tanaffusGacha: 0 };
  h = qosh(h, SEANS - 60, t0);
  assert.equal(holat(h, t0).holat, 'ok');
  assert.equal(holat(h, t0).ogoh, true);                       // 1 daqiqa qoldi — ogohlantirish
  h = qosh(h, 60, t0);
  assert.equal(holat(h, t0 + 1000).holat, 'tanaffus');
  assert.equal(holat(h, t0 + 1000).qoldi, 15);
  const keyin = t0 + TANAFFUS * 1000 + 1000;
  h = qosh(h, 0, keyin);
  assert.equal(holat(h, keyin).holat, 'ok');                   // dam olgach yana o'ynaydi
  assert.equal(h.seans, 0);
  h = qosh(h, SEANS - 1, keyin);
  h = qosh(h, 10, keyin);                                      // kunlik 2 soat tugadi
  assert.equal(h.jami >= KUNLIK, true);
  assert.equal(holat(h, keyin + TANAFFUS * 2000).holat, 'tugadi');
  // ertasi kun — yangidan
  const mem = new Map([['kabutar:xonalar:vaqt:v1', JSON.stringify({ ...h, kun: '2000-01-01' })]]);
  const st = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  assert.equal(oqi(st, t0).jami, 0);
});

test('REV128: spaced repetition — a word needs several days to be mastered', () => {
  let h; let kun = 100;
  h = srsYangila(h, true, kun); assert.equal(h.quti, 1); assert.equal(h.keyin, kun + ORALIQ[1]);
  h = srsYangila(h, true, kun); assert.equal(h.quti, 1, 'bir kunda ikki marta ko\'tarilmaydi');
  for (const d of [1, 2, 4]) { kun += d; h = srsYangila(h, true, kun); }
  assert.equal(h.quti, PUXTA);
  assert.ok(kun - 100 >= 7, 'puxta bo\'lishi uchun kamida bir hafta');
  h = srsYangila(h, false, kun); assert.equal(h.quti, PUXTA - 1); assert.equal(h.keyin, kun);
  // vaqti kelgan so'z avval, yangilari cheklangan
  const pool = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const srs = { a: { quti: 2, keyin: 5 }, b: { quti: 4, keyin: 50 }, c: { quti: 1, keyin: 9 } };
  const out = tanlaSRS(pool, 5, srs, rng, 10, 2);
  assert.equal(out.length, 5);
  assert.ok(out.includes('a') && out.includes('c'));
  assert.ok(out.filter((x) => !srs[x]).length <= 3);
});

test('REV128: new games give valid questions in every room', () => {
  for (const r of XONALAR) {
    const pool = hammasi(r);
    for (const yosh of ['kichik', 'orta', 'katta']) {
      const k = xotiraKartalar(pool, yosh, rng);
      assert.equal(k.length, { kichik: 6, orta: 8, katta: 12 }[yosh]);
      const ids = k.map((c) => c.id); for (const id of new Set(ids)) assert.equal(ids.filter((x) => x === id).length, 2);
      const y = yoqoldiSavol(pool, yosh, rng);
      assert.ok(y.korsat.includes(y.yoq) && !y.qolgan.includes(y.yoq) && y.variantlar.includes(y.yoq) && new Set(y.variantlar).size === 3);
    }
    for (let i = 0; i < 20; i++) {
      const o = ortiqchaSavol(pool, rng);
      assert.equal(o.variantlar.length, 4);
      assert.equal(o.variantlar.filter((id) => turkumi(id) === o.turkum).length, 3, JSON.stringify(o));
      assert.notEqual(turkumi(o.begona), o.turkum);
    }
    const t = tartibSavol(pool, 3, rng); assert.equal(new Set(t).size, 3);
  }
  for (const b of BUYRUQ_MEN) { assert.ok(SOZLAR[b.id]); for (const t of TILLAR) assert.ok(b.w[t]); }
  for (const [k, l] of Object.entries(TURKUM)) for (const id of l) assert.ok(SOZLAR[id], `${k}/${id}`);
  assert.deepEqual(rejimlar('kichik', 'havo'), ['kashf', 'top', 'xotira', 'yordam']);
});

test('REV128: adult practice — 12 situations × 12 phrases in 11 languages, dialogue roles alternate', () => {
  assert.equal(VAZIYATLAR.length, 12);
  const idlar = new Set();
  for (const v of VAZIYATLAR) {
    assert.equal(v.gaplar.length, 12, v.id);
    v.gaplar.forEach((g, i) => {
      assert.ok(!idlar.has(g.id)); idlar.add(g.id);
      for (const t of TILLAR) assert.ok(g.w[t] && !g.w[t].includes('|'), `${g.id}.${t}`);
      if (i) assert.notEqual(g.rol, v.gaplar[i - 1].rol, `${g.id}: navbat`);
    });
  }
});

test('REV128: writing check is forgiving about case, punctuation and apostrophes, strict about words', () => {
  assert.equal(yozuvniTekshir("je m'appelle aziz", 'Je m’appelle Aziz.', 'fr').holat, 'togri');
  assert.equal(yozuvniTekshir('cest delicieux merci', 'C’est délicieux, merci !', 'fr').holat, 'deyarli');
  assert.equal(yozuvniTekshir('ich heisse aziz', 'Ich heiße Aziz.', 'de').holat, 'deyarli');
  assert.equal(yozuvniTekshir('where is the bus', 'Where is the bus stop?', 'en').holat, 'xato');
  assert.equal(yozuvniTekshir('我叫 阿齐兹', '我叫阿齐兹。', 'zh').holat, 'togri');
  assert.equal(yozuvniTekshir('', 'Hello!', 'en').holat, 'xato');
  for (const v of VAZIYATLAR) for (const g of v.gaplar) for (const t of ['en', 'de', 'zh', 'ja', 'ko', 'ar']) {
    assert.ok(bolakTogri(bolaklar(g.w[t], t), g.w[t], t), `${g.id}.${t}`);
  }
  assert.equal(gapBaho(['nice to meet you'], 'Nice to meet you.', 'en').togri, true);
  assert.equal(gapBaho(['good morning'], 'Nice to meet you.', 'en').togri, false);
  assert.equal(tozala('¿Dónde está?'), 'dónde está');
});
