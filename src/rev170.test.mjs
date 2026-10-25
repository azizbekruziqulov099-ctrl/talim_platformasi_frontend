// REV170: 10 ta til ustozi va sinfxonasi, 700 ta yangi chizilgan rasm, kalendar va bayramlar, formulani TTS o'qishi
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BAYRAMLAR, kalendarQadami, oyVaBayramGapi, yaqinBayram } from './kid/kalendar.js';
import { ISMLAR, klonla } from './kid/tilUstozlari.js';
import { TIL_USTOZ, ustozFor, XONA } from './kid/ustozRules.js';
import { speakableText } from './lesson/darsXonasiRules.js';
import { matnId } from './kid/rasmHarakat.js';
import { DARS_RASM_META } from './kid/darsRasmMeta.js';
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');

test('har tilning o‘z ustozi va xonasi', () => {
  assert.equal(ustozFor('Nemis tili'), 'lukas');
  assert.equal(ustozFor('Xitoy tili (izoh: ingliz)'), 'mei');
  assert.equal(ustozFor('Mantiq (izoh: rus)'), 'sardor');
  for (const k of Object.values(TIL_USTOZ)) { assert.ok(ISMLAR[k], k); assert.equal(XONA[k], `til_${k}`); }
});

test('ustoz gaplari ismi va jinsiga moslanadi', () => {
  const fel = { salom: ['Salom, quyoshim! Men Nilufar opangman.'] };
  assert.equal(klonla(fel, 'yusuf', 'uz').salom[0], 'Salom, quyoshim! Men Yusuf akangman.');
  assert.equal(klonla({ s: 'Нилуфар-опа пришла' }, 'lukas', 'ru').s, 'Лукас-ака пришёл');
  assert.equal(klonla({ s: 'わたしは ニルファルよ。' }, 'kenji', 'ja').s, 'ぼくは ケンジだよ。');
  assert.equal(klonla(fel, 'anna', 'uz').salom[0], 'Salom, quyoshim! Men Anna opangman.');
});

test('kalendar: oy tushuntirishi va bayramlar', () => {
  assert.equal(BAYRAMLAR.length, 10);
  assert.equal(yaqinBayram(new Date(2026, 2, 18)).b.uz, 'Navro‘z bayrami');
  assert.equal(yaqinBayram(new Date(2026, 2, 18)).qoldi, 3);
  assert.match(oyVaBayramGapi('uz', new Date(2026, 9, 25), 6).gap, /^Oktabr — yilning o‘ninchi oyi, kuzning ikkinchi oyi\.$/);
  assert.match(oyVaBayramGapi('uz', new Date(2026, 2, 21), 6).gap, /Bugun — Navro‘z bayrami!/);
  const q = kalendarQadami({ til: null, izoh: 'uz', yosh: 6, sana: new Date(2026, 11, 30, 10) });
  assert.match(q.ovoz, /2 kundan keyin — Yangi yil\./);
  assert.match(q.doska, /🎄 Yangi yil/);
  assert.match(src('./kid/BolalarKundaligi.jsx'), /function Kalendar\(/);
});

test('formula o‘chirilmaydi — server TTS o‘qiydi; qurilma ovozi ishlatilmaydi', () => {
  assert.equal(speakableText('Javob: $x^2$ va [lat]\\frac{1}{2}[/lat]'), 'Javob: [lat]x^2[/lat] va [lat]\\frac{1}{2}[/lat]');
  const d = src('./lesson/DarsXonasi.jsx');
  assert.doesNotMatch(d, /qurilmadaOqi\(/);
});

test('yangi chizilgan rasmlar so‘z bo‘yicha topiladi', () => {
  assert.ok(DARS_RASM_META.filter((m) => m.id.startsWith('m-')).length > 650);
  assert.equal(matnId('ajoyib'), 'd_m-ajoyib-zor');
  assert.equal(matnId('капуста'), 'd_m-karam');
  assert.equal(matnId('cabbage'), 'd_m-karam');
});

test('Sardor xonasida chiroq boshiga tegmaydi', () => {
  assert.match(src('./kid/ustozlar.js'), /chiroq: \{ x: 62 \}, devor: \{ l: 27\.4/);
});
