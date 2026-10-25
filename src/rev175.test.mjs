// REV175: maktab darsi — sinfxona va jonli ustoz, sana bilan ochilish, dars mashqlari (o'qish, gapirish, diktant), dars so'zlari bilan repetitor,
// ustoz bilan yozish sur'ati, telefonda o'zi yotiq buriladi, fan tanlansa ichiga kiriladi
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { maktabDarsSozlari, qadamSozi, darsSozId } from './lesson/maktabDarsSozlari.js';
import { sanaQadami, sanaUz, mashqMateriali, mashqYulduz } from './lesson/maktabMashqRules.js';
import { yozishSoniyasi, qoshimchaSaqla, qoshimchaOl } from './maktab/repetitorRules.js';
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const xotira = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };
const steps = [
  { turi: 'kirish', sarlavha: 'Das Präsens', doska: 'Das Präsens: Gewohnheit, Wahrheit und Zukunft', ovoz: '' },
  { turi: 'tushuntirish', sarlavha: '📏 die Zeitachse — vaqt chizig‘i', doska: '📏 die Zeitachse\nvaqt chizig‘i\nAuf der Zeitachse steht die Gegenwart in der Mitte.' },
  { turi: 'tushuntirish', sarlavha: '⚙️ der Vorgang — jarayon', doska: '⚙️ der Vorgang\njarayon\nEine Sprache zu lernen ist ein langer Vorgang.' },
  { turi: 'tushuntirish', sarlavha: 'Eine andere Woche', doska: 'Aziz: Normalerweise gehst du doch zu Fuß zur Schule, oder?\nNigora: Ja, aber diese Woche fahre ich mit der Metro.' },
  { turi: 'tushuntirish', sarlavha: 'Notice — diqqat', doska: 'Ich trinke jeden Morgen Tee. (Gewohnheit)' },
];

test('dars so‘zlari AI miya qadamlaridan olinadi (sarlavha «so‘z — tarjima», doska 1–2 qatori mos)', () => {
  const s = maktabDarsSozlari(steps, 'de', 'uz', 'X');
  assert.deepEqual(s.map((w) => [w.emoji, w.w.de, w.w.uz]), [['📏', 'die Zeitachse', 'vaqt chizig‘i'], ['⚙️', 'der Vorgang', 'jarayon']]);
  assert.equal(qadamSozi(steps[4]), null);           // doska mos emas — so'z emas
  assert.match(darsSozId('de', 'die Zeitachse'), /^dde_[a-z0-9]+$/);
  assert.equal(darsSozId('ru', 'время'), darsSozId('ru', 'Время'));
  assert.deepEqual(maktabDarsSozlari(steps, '', 'uz'), []);
});

test('dars sana bilan ochiladi: o‘rganilayotgan tilda va izoh tilida', () => {
  const d = new Date(2026, 9, 26);
  assert.equal(sanaUz(d), '2026-yil 26-oktabr, dushanba');
  const q = sanaQadami({ til: 'de', iz: 'uz', sana: d });
  assert.match(q.doska, /Heute ist Montag/);
  assert.match(q.ovoz, /^\[de\]Heute ist .*\[\/de\] Bugun 2026-yil 26-oktabr/);
  const m = sanaQadami({ til: '', iz: 'uz', sana: d });
  assert.equal(m.doska, 'Bugun 2026-yil 26-oktabr, dushanba.');
  assert.match(sanaQadami({ til: 'en', iz: 'ru', sana: d }).ovoz, /\[ru\]Сегодня/);
});

test('mashqlar materiali: o‘qish gaplari, gapirish savollari (dialog ismisiz), diktant', () => {
  const s = maktabDarsSozlari(steps, 'de', 'uz', 'X');
  const m = mashqMateriali(steps, s);
  assert.ok(m.oqish.includes('Auf der Zeitachse steht die Gegenwart in der Mitte.'));
  assert.ok(m.gapirish.includes('Normalerweise gehst du doch zu Fuß zur Schule, oder?'));
  assert.ok(m.oqish.every((t) => !/^Nigora:/.test(t)));
  assert.equal(m.diktant[0].matn, 'die Zeitachse');
  assert.equal(m.diktant[0].tarjima, 'vaqt chizig‘i');
  assert.equal(mashqYulduz(9, 10), 3);
});

test('ustoz bilan yozish sur‘ati so‘z uzunligiga mos; dars so‘zlari lug‘atga saqlanadi', () => {
  assert.equal(yozishSoniyasi('cat'), 1.5);
  assert.equal(yozishSoniyasi('Vorgang'), 2.5);
  assert.equal(yozishSoniyasi('allgemeingültig'), 4.5);
  assert.equal(yozishSoniyasi('Zeitachse'), 3.5);
  assert.equal(yozishSoniyasi('健康的食物'), 6);
  const st = xotira();
  qoshimchaSaqla([{ id: 'dde_x', emoji: '📏', w: { de: 'die Zeitachse', uz: 'vaqt chizig‘i' } }], st);
  assert.equal(qoshimchaOl(st).dde_x.w.de, 'die Zeitachse');
});

test('integratsiya: sinfxona, mashqlar, repetitor, yotiq telefon, fan ichiga kirish', () => {
  const d = src('./lesson/DarsXonasi.jsx');
  assert.match(d, /sinfXona && !kabuMuhit && <div className="dx-sinf-fon"/);
  assert.match(d, /<MaktabMashqlar /);
  assert.match(d, /darsSozlari=\{maktabSozlar\}/);
  assert.match(d, /sanaQadami\(/);
  assert.match(d, /dx-yotiq/);
  assert.match(src('./lesson/dars-xonasi.css'), /\.dx-root\.dx-yotiq\{position:fixed;[^}]*transform:rotate\(90deg\)/);
  assert.match(src('./maktab/Repetitor.jsx'), /Ustoz bilan yozamiz/);
  assert.match(src('./curriculum/LearnerTopics.jsx'), /fanIchida/);
});
