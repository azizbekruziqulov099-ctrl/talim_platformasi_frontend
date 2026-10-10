import test from 'node:test';
import assert from 'node:assert/strict';
import { suhbatJavob, suhbatSavollari, tahlil } from './kid/suhbat.js';

const dars = [{ say: 'cat', emoji: '🐱' }];
const bilgan = [{ say: 'dog', emoji: '🐶' }, { say: 'cat', emoji: '🐱' }, { say: 'red', emoji: '🔴' }];

test('yoshga qarab savollar ko‘payadi va murakkablashadi', () => {
  const s23 = suhbatSavollari({ til: 'en', grade: '2-3 yosh', bilgan, dars });
  const s45 = suhbatSavollari({ til: 'en', grade: '4-5 yosh', bilgan, dars });
  const s67 = suhbatSavollari({ til: 'en', grade: '6-7 yosh', bilgan, dars });
  assert.equal(s23.length, 1);
  assert.equal(s45.length, 3);
  assert.equal(s67.length, 5);
  assert.match(s23[0].ask, /🐱 \[en\]What is it\?\[\/en\]/);
  assert.ok(s67.some((q) => /What's your name|How old|Do you like|Can you swim/.test(q.ask)));
  assert.deepEqual(suhbatSavollari({ til: null, grade: '6-7 yosh' }), []);
});

test('savollar faqat bola bilgan so‘zlardan', () => {
  const s = suhbatSavollari({ til: 'en', grade: '4-5 yosh', bilgan, dars });
  const pics = s.filter((q) => q.emoji).map((q) => q.phrase);
  assert.deepEqual(pics, ['cat', 'dog']);
});

test('javob tahlili: to‘liq gap ham qabul, boshqa bilgan so‘z aniqlanadi', () => {
  const q = { turi: 'suhbat', lang: 'en', phrase: 'cat', qabul: ['cat'], namuna: 'cat' };
  assert.equal(tahlil(["it's a cat"], q, bilgan).stars, 3);
  const n = tahlil(['dog'], q, bilgan);
  assert.ok(n.stars < 2); assert.equal(n.boshqa, 'dog');
  assert.match(suhbatJavob(q, n), /Sen \[en\]dog\[\/en\] deding/);
  const name = suhbatSavollari({ til: 'ru', grade: '6-7 yosh', kun: 0 }).find((x) => /Как тебя зовут/.test(x.ask));
  assert.equal(tahlil(['меня зовут Али'], name, []).stars, 3);
});
