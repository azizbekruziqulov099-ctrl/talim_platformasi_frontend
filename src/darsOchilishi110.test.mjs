import test from 'node:test';
import assert from 'node:assert/strict';
import { darsSozlari, darsTili, FEL, ochilish } from './kid/darsOchilishi.js';
import { bilganSozlar, eslab, oxirgiDars } from './kid/sozBoyligi.js';
import { havoTuri } from './kid/ustozRules.js';

const mem = () => { const m = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };

test('salom, ob-havo va o‘tgan dars — o‘rganilayotgan tilda, ustozning o‘z gapi bilan', () => {
  const st = ochilish({ ustoz: 'sardor', til: 'ru', havo: 'qor', harorat: -3, grade: '5-6 yosh', kun: 0,
    oldingi: { mavzu: 'Uy hayvonlari', til: 'ru', sozlar: [{ say: 'кошка', emoji: '🐱' }, { say: 'собака', emoji: '🐶' }] } });
  assert.equal(st.length, 3);
  assert.ok(st[0].ovoz.startsWith(FEL.sardor.salom[0]));
  assert.match(st[0].ovoz, /\[ru\]Привет!\[\/ru\]/);
  assert.match(st[1].ovoz, /\[ru\]Идёт снег\.\[\/ru\]/);
  assert.match(st[1].ovoz, /sovuq/);
  assert.match(st[2].ovoz, /🐱 Bu nima\? ⏸ \[ru\]кошка\[\/ru\]/);
  assert.ok(st.every((s) => s.turi === 'kirish' && s.doska));
});

test('2–3 yosh: qisqa; til darsi bo‘lmasa — faqat o‘zbekcha', () => {
  const kichik = ochilish({ ustoz: 'nilufar', til: 'en', havo: 'quyosh', grade: '2-3 yosh', oldingi: { mavzu: 'X', sozlar: [{ say: 'cat' }, { say: 'dog' }] } });
  assert.doesNotMatch(kichik[0].ovoz, /How are you/);
  assert.equal(kichik[2].doska.split('\n').length, 1);
  const uz = ochilish({ ustoz: 'sardor', til: null, havo: 'yomgir' });
  assert.equal(uz.length, 2);
  assert.doesNotMatch(uz.map((s) => s.ovoz).join(' '), /\[/);
});

test('ob-havo kodi → deraza', () => {
  assert.equal(havoTuri(0), 'quyosh');
  assert.equal(havoTuri(3), 'bulut');
  assert.equal(havoTuri(63), 'yomgir');
  assert.equal(havoTuri(73), 'qor');
});

test('dars so‘zlari va so‘z boyligi', () => {
  const steps = [
    { turi: 'qoida', ovoz: 'Bu — [en]cat[/en]. [en]Repeat after me[/en]', doska: '🐱 cat — mushuk' },
    { turi: 'qoida', ovoz: '[en]dog[/en]!', doska: '🐶 dog' },
  ];
  assert.equal(darsTili(steps), 'en');
  const w = darsSozlari(steps, ['new', 'new']);
  assert.deepEqual(w, [{ say: 'cat', emoji: '🐱', til: 'en' }, { say: 'dog', emoji: '🐶', til: 'en' }]);
  const st = mem();
  eslab({ code: 'A', mavzu: 'Hayvonlar', sozlar: w }, st, 1);
  eslab({ code: 'A', mavzu: 'Hayvonlar', sozlar: [w[0]] }, st, 2);
  assert.equal(oxirgiDars('A', st), null);
  assert.equal(oxirgiDars('B', st).mavzu, 'Hayvonlar');
  const b = bilganSozlar('en', st);
  assert.equal(b[0].say, 'cat'); assert.equal(b[0].n, 2);
});
