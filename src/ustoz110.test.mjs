import test from 'node:test';
import assert from 'node:assert/strict';
import { blinkDelay, pozaFor, ustozFor, XONA } from './kid/ustozRules.js';
import { USTOZLAR, XONALAR } from './kid/ustozlar.js';

test('fanga qarab ustoz va xona', () => {
  assert.equal(ustozFor('Matematika'), 'sardor');
  assert.equal(ustozFor('Atrof-olam'), 'malika');
  assert.equal(ustozFor('Ingliz tili'), 'nilufar');
  for (const u of ['sardor', 'nilufar', 'malika']) assert.ok(XONALAR[XONA[u]].doska.w > 0);
});

test('vaziyatga qarab poza', () => {
  assert.equal(pozaFor('wave talk'), 2);
  assert.equal(pozaFor('talk', { hasPics: true }), 3);
  assert.equal(pozaFor('think'), 4);
  assert.equal(pozaFor('happy talk'), 5);
  assert.equal(pozaFor('talk', { listening: true }), 6);
});

test('har ustozda 6 poza, neytral pozada gapirish kadrlari bor', () => {
  for (const u of ['sardor', 'nilufar', 'malika']) {
    for (let p = 1; p <= 6; p += 1) assert.ok(USTOZLAR[u][p].src);
    assert.equal(USTOZLAR[u][1].yuz.kadr.length, 6);
  }
  const d = blinkDelay(() => 0.5);
  assert.ok(d >= 2500 && d <= 5000);
});

test('kun vaqti va momaqaldiroq', async () => {
  const { kunVaqti, havoTuri } = await import('./kid/ustozRules.js');
  assert.equal(kunVaqti(6), 'tong');
  assert.equal(kunVaqti(12), 'kun');
  assert.equal(kunVaqti(18), 'kech');
  assert.equal(kunVaqti(22), 'tun');
  assert.equal(kunVaqti(18, 0), 'tun');      // qishda soat 18 da qorong'i
  assert.equal(kunVaqti(20, 1), 'kech');     // yozda soat 20 da hali yorug'
  assert.equal(havoTuri(95), 'momaqaldiroq');
  assert.equal(havoTuri(null, 7), 'quyosh');
});
