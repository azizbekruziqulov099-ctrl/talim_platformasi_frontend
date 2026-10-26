// REV180: ikki Kabu (ikki ovoz), teglar bo'yicha o'qish, o'z klaviaturamiz, fan kundaligi
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { navbat, tilTaxmin, teglash } from './speech/ikkiOvoz.js';
import { QATORLAR, PLITKALI, klaviaturaBor, plitkalar } from './maktab/tilKlaviaturaRules.js';
import { kundalikYoz, kundalikOl, birlashtir, baho, jamla, kunlarBoyicha } from './maktab/kundalikRules.js';
import { darsYozuvi } from './lesson/spiralTakror.js';

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };

test('ikki so\'zlovchi: o\'rganilayotgan til qismi — ikkinchi Kabuga, izoh — birinchisiga; tinish belgisi alohida ovoz bo\'lmaydi', () => {
  const n = navbat('[de]✅ Das ist …[/de] [en]Which one is «yes»?[/en] [en]A)[/en] [de]nein[/de]. [en]B)[/en] [de]ja[/de].', 'de', ['en', 'de', 'uz']);
  assert.deepEqual(n.map((x) => x.kim), ['til', 'iz', 'til', 'iz', 'til']);
  assert.ok(n.every((x) => /[\p{L}]/u.test(x.matn.replace(/\[\/?[a-z]{2}\]/g, ''))));
});
test('tegsiz qolgan matn — tili taxmin qilinadi (o\'zbek ovozida xato o\'qilmasin)', () => {
  assert.equal(tilTaxmin('Das ist …', ['en', 'de', 'uz']), 'de');
  assert.equal(tilTaxmin('Which one is «yes»?', ['en', 'de', 'uz']), 'en');
  assert.equal(tilTaxmin('Привет', ['uz', 'de']), 'ru');
  assert.equal(tilTaxmin('Salom, bu so‘z nima?', ['uz', 'de']), 'uz');
  assert.equal(tilTaxmin('A)', ['uz', 'de']), 'uz');
  assert.equal(teglash('Das ist … Which one is «yes»?', ['en', 'de', 'uz']), '[de]Das ist …[/de] [en]Which one is «yes»?[/en]');
});
test('takrorda test savolining asl teglari saqlanadi', () => {
  const y = darsYozuvi({ kod: 'D1', savollar: [{ savol: '[de]✅ Das ist …[/de] [en]Which one is «yes»?[/en]', variantlar: ['[de]nein[/de]', '[de]ja[/de]'], togri: 1 }] });
  assert.equal(y.savollar[0].savol, 'Das ist … Which one is «yes»?');
  assert.equal(y.savollar[0].savolTeg, '[de] Das ist …[/de] [en]Which one is «yes»?[/en]');
  assert.deepEqual(y.savollar[0].variantlarTeg, ['[de]nein[/de]', '[de]ja[/de]']);
});
test('o\'z klaviaturamiz: tilning maxsus harflari; murakkab yozuvda — plitkalar', () => {
  assert.ok(QATORLAR.de.join('').includes('ü') && QATORLAR.de.join('').includes('ß'));
  assert.ok(QATORLAR.es.join('').includes('ñ') && QATORLAR.fr.join('').includes('ç') && QATORLAR.tr.join('').includes('ğ'));
  assert.ok(klaviaturaBor('ru') && klaviaturaBor('ja') && !klaviaturaBor('xx'));
  assert.ok(PLITKALI.has('zh') && PLITKALI.has('ko'));
  const p = plitkalar('你好', '我们好', () => 0.5);
  assert.deepEqual(p.map((x) => x.c).sort(), ['你', '们', '好', '我'].sort());
});
test('fan kundaligi: yoziladi, birlashtiriladi, baho 2–5, qidiruv uchun mavzu saqlanadi', () => {
  const st = mem();
  kundalikYoz({ turi: 'dars', kod: 'DE1', fan: 'Nemis tili (izoh: rus)', mavzu: 'Hallo', togri: 4, jami: 5 }, st, '2026-10-26', '10:00');
  kundalikYoz({ turi: 'repetitor', kod: 'de:DE1', fan: 'Nemis tili', mavzu: 'Repetitor: Hallo', yozdi: 40 }, st, '2026-10-26', '10:20');
  kundalikYoz({ turi: 'repetitor', kod: 'de:DE1', fan: 'Nemis tili', yozdi: 20 }, st, '2026-10-26', '11:00');
  const m = kundalikOl(st);
  assert.equal(m.length, 2);
  assert.equal(m.find((x) => x.turi === 'repetitor').yozdi, 60);
  const b = birlashtir([{ sana: '2026-10-25', turi: 'takror', kod: 't', fan: 'Nemis tili (izoh: ingliz)', mavzu: 'x', togri: 1, jami: 4, yozdi: 0, soniya: 0 },
    { sana: '2026-10-25', turi: 'dars', kod: 'M1', fan: 'Matematika', togri: 1, jami: 1, yozdi: 0, soniya: 0 }], m, 'Nemis tili');
  assert.deepEqual(b.map((x) => x.turi), ['repetitor', 'dars', 'takror']);
  assert.equal(baho(4, 5), 4); assert.equal(baho(9, 10), 5); assert.equal(baho(1, 4), 2); assert.equal(baho(0, 0), null);
  assert.equal(jamla(b).darslar, 1);
  assert.equal(kunlarBoyicha(b).length, 2);
});
test('integratsiya: Kabular juft, repetitor uslubi, klaviatura ulangan, kundalik fan ichida', () => {
  const r = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
  assert.match(r('./maktab/Repetitor.jsx'), /import "\.\/maktab\.css"/);
  assert.match(r('./maktab/Repetitor.jsx'), /juft=\{\{ iz, til \}\}/);
  assert.match(r('./lesson/DarsOldiTakror.jsx'), /oqiIkki/);
  assert.match(r('./lesson/MaktabMashqlar.jsx'), /<TilKlaviatura/);
  assert.match(r('./lesson/DarsXonasi.jsx'), /ikkiOvozOqi\(clean/);
  assert.match(r('./curriculum/LearnerTopics.jsx'), /<MaktabKundalik/);
  assert.match(r('./kid/kabuXonacha.css'), /\.kx-robot\.is-jim\{transform:scale\(\.9\);opacity:\.5/);
});
