import test from 'node:test';
import assert from 'node:assert/strict';
import { ozTilidami, izohTanla } from './izohTanlov.js';
import { gap } from '../kid/izohTil.js';
test('REV321: til fani o‘z tilida izohli varianti ko‘rsatilmaydi', () => {
  assert.ok(ozTilidami('Ingliz tili (izoh: ingliz)')); assert.ok(ozTilidami('Rus tili — Erkin til (izoh: rus)'));
  assert.ok(!ozTilidami('Ingliz tili (izoh: rus)')); assert.ok(!ozTilidami('Matematika (izoh: ingliz)'));
  assert.deepEqual(izohTanla([{ nom: 'Ingliz tili' }, { nom: 'Ingliz tili (izoh: ingliz)' }], 'en').map((f) => f.nom), ['Ingliz tili']);
});
test('REV321: gapdagi son gapning o‘z tilida (fransuzcha gap o‘rtasida o‘zbekcha «uch» yo‘q)', () => {
  assert.equal(gap('fr', "Barakalla! O'yinda {n} ta yulduzcha yig'ding!", { n: 3 }), '[fr]Bravo ! Tu as gagné 3 étoiles dans le jeu ![/fr]');
  assert.equal(gap('uz', "Barakalla! O'yinda {n} ta yulduzcha yig'ding!", { n: 3 }), "Barakalla! O'yinda 3 ta yulduzcha yig'ding!");
});
