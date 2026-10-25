// REV167: soatni aniq aytish, kechki yopilish, Sardor og'zi (doskaga qaraganda), ota-ona kundaligi
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { kalendarQadami, soatGapi, soatShakli } from './kid/kalendar.js';
import { guardView, timeText, warnText } from './kid/screenTime.js';
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');

test('soat: 10:57 da «10» demaydi — «11 ga 3 daqiqa qoldi»; 10:30 — «10 yarim»', () => {
  assert.equal(soatGapi('uz', 10, 57, 6), 'Soat 11 ga 3 daqiqa qoldi.');
  assert.equal(soatGapi('uz', 10, 57, 4), 'Hozir soat 11 ga yaqin.');
  assert.equal(soatGapi('uz', 10, 30, 4), 'Hozir soat 10 yarim.');
  assert.equal(soatGapi('uz', 10, 12, 6), 'Hozir soat 10 dan 12 daqiqa o‘tdi.');
  assert.equal(soatGapi('uz', 10, 12, 4), 'Hozir soat 10 dan o‘tdi.');
  assert.equal(soatGapi('uz', 10, 0, 6), 'Hozir soat 10.');
  assert.equal(soatGapi('ru', 10, 30, 6), 'Сейчас половина одиннадцатого.');
  assert.equal(soatGapi('en', 12, 45, 6), "It's 15 minutes to 1.");
  assert.equal(soatGapi('de', 10, 30, 6), 'Es ist halb 11.');
  assert.deepEqual(soatShakli(23, 40, 6), { turi: 'qoldi', h: 12, m: 20, h0: 11, m0: 40 });
  const q = kalendarQadami({ til: null, izoh: 'uz', yosh: 6, sana: new Date(2026, 9, 24, 22, 57) });
  assert.match(q.ovoz, /Soat 11 ga 3 daqiqa qoldi\./);
  assert.match(q.doska, /⏰ 10:57/);
});

test('uxlash vaqti hamma narsani yopadi (dars o‘rtasida 10 daqiqa beriladi)', () => {
  const st = { tugadi: { dars: false, oyin: false, jami: false, tun: true }, tun: { ochiladi: '06:00' } };
  assert.equal(guardView(st, 'oyin', false, 0, 0).view, 'tun');
  assert.equal(guardView(st, 'dars', true, 0, 1000).view, null);
  assert.equal(guardView(st, 'dars', true, 1000, 1000 + 11 * 60000).view, 'tun');
  assert.match(timeText('tun', st), /soat 6 dan keyin/);
  assert.equal(warnText({ ...st, dars: { qoldi: 3 } }, 'dars'), null);
});

test('Sardor doskaga qaraganda: og‘iz kichikroq, yonoq chizig‘i o‘chmaydi (tw)', () => {
  const u = src('./kid/ustozlar.js');
  assert.match(u, /poza_3\.webp"\), w: 351, h: 499, og: \{ x: 26\.1, y: 18\.45, w: 7\.8, r: -13, tw: 150,/);
  assert.match(src('./kid/UstozSahna.jsx'), /p\.og\.tw \? \{ width: `\$\{p\.og\.tw\}%` \}/);
});

test('ota-ona kundaligi — so‘z bilan, bo‘sh oyna emas', () => {
  const f = src('./parent/FarzandFaollik.jsx');
  assert.match(f, /<BolalarKundaligi [^>]*rejim="ota"/);
  assert.ok(!/if \(error && !data\) return null/.test(f));
  assert.match(src('./kid/kundalikRules.js'), /O‘tkazib yuborildi — keyingi bo‘sh kunda o‘zi ochiladi/);
});
