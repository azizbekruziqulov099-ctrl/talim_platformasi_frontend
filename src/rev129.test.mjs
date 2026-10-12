import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SINFLAR, sinfOl, BARCHA_SOZ } from './maktab/index.js';
import { TILLAR } from './maktab/qurilish.js';
import {
  sinfRaqami, rejimlar, savollar, harflar, harfPlitkalar, harfTogri, terishMumkin, yulduzHisob, bolimPuxta,
  belgila, srsOl, yulduzYoz, yulduzlar, SAVOL_SONI,
} from './maktab/maktabRules.js';
import { bolaklar, bolakTogri } from './til/mashqRules.js';

const rng = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
const ORGANILADIGAN = ['en', 'ru', 'de', 'fr', 'es', 'ar', 'tr', 'zh', 'ja', 'ko'];
const memStore = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }; };

test('REV129: 11 grades × 8 units (2 per quarter), every word and sentence in all 11 languages', () => {
  assert.equal(SINFLAR.length, 11);
  assert.deepEqual(TILLAR, ['uz', 'ru', 'en', ...ORGANILADIGAN.filter((t) => !['ru', 'en'].includes(t))]);
  for (const s of SINFLAR) {
    assert.equal(s.bolimlar.length, 8, `${s.sinf}-sinf`);
    for (const b of s.bolimlar) {
      for (const l of ['uz', 'ru', 'en']) assert.ok(b.nom[l], `${b.id} nomi ${l}`);
      assert.ok(b.sozlar.length >= 10, `${b.id}: ${b.sozlar.length} so'z`);
      assert.ok(b.gaplar.length >= 3, `${b.id}: ${b.gaplar.length} gap`);
      for (const x of [...b.sozlar, ...b.gaplar]) for (const l of TILLAR) assert.ok(String(x.w[l] || '').trim(), `${x.id} ${l}`);
    }
  }
  assert.equal(sinfOl(5).sinf, 5);
  assert.equal(sinfOl(12), null);
});

test('REV129: ids are unique; sentences grow longer with the grade', () => {
  const bolimIds = SINFLAR.flatMap((s) => s.bolimlar.map((b) => b.id));
  assert.equal(new Set(bolimIds).size, bolimIds.length);
  const gapIds = SINFLAR.flatMap((s) => s.bolimlar.flatMap((b) => b.gaplar.map((g) => g.id)));
  assert.equal(new Set(gapIds).size, gapIds.length);
  for (const s of SINFLAR) {
    const ids = s.bolimlar.flatMap((b) => b.sozlar.map((w) => w.id));
    assert.equal(new Set(ids).size, ids.length, `${s.sinf}-sinfda takror so'z`);
  }
  assert.ok(Object.keys(BARCHA_SOZ).length > 700);
  const ortacha = (n) => { const g = sinfOl(n).bolimlar.flatMap((b) => b.gaplar); return g.reduce((a, x) => a + x.w.en.split(' ').length, 0) / g.length; };
  assert.ok(ortacha(11) > ortacha(1), 'yuqori sinf gaplari uzunroq');
});

test('REV129: every picture name exists in the generated Fluent image list, and its file exists', () => {
  const matn = fs.readFileSync(new URL('./maktab/rasmlar.js', import.meta.url), 'utf8');
  const nomlar = new Set([...matn.matchAll(/^\s+"([^"]+)": r_/gm)].map((m) => m[1]));
  for (const [, fayl] of matn.matchAll(/from "\.\/(rasm\/[^"]+\.webp)"/g)) assert.ok(fs.existsSync(new URL(`./maktab/${fayl}`, import.meta.url)), fayl);
  let rasmli = 0;
  for (const s of SINFLAR) for (const b of s.bolimlar) for (const w of b.sozlar) {
    if (w.rasm) { assert.ok(nomlar.has(w.rasm), `${w.id}: «${w.rasm}» rasmi yo'q`); rasmli++; }
    else assert.ok(w.emoji || w.bogcha, `${w.id}: na rasm, na emoji`);
  }
  assert.ok(rasmli > 600, `rasmli so'zlar: ${rasmli}`);
  assert.ok(fs.existsSync(new URL('./maktab/rasm/LICENSE-fluent-emoji.txt', import.meta.url)));
});

test('REV129: grade from the profile; university course and age group are not grades', () => {
  assert.equal(sinfRaqami('5'), 5);
  assert.equal(sinfRaqami('5-sinf'), 5);
  assert.equal(sinfRaqami('10 A'), 10);
  assert.equal(sinfRaqami(11), 11);
  assert.equal(sinfRaqami('2 kurs'), null);
  assert.equal(sinfRaqami('1 kurs magistr'), null);
  assert.equal(sinfRaqami('4-5 yosh'), null);
  assert.equal(sinfRaqami('12'), null);
  assert.equal(sinfRaqami(''), null);
});

test('REV129: games unlock by grade — pictures first, writing and dictation later', () => {
  assert.deepEqual(rejimlar(1), ['kartalar', 'rasm', 'mano', 'ayt', 'bellashuv']);
  assert.ok(rejimlar(2).includes('harf') && !rejimlar(2).includes('gap'));
  assert.ok(rejimlar(3).includes('gap') && !rejimlar(3).includes('yoz'));
  assert.equal(rejimlar(11).length, 8);
  assert.equal(SAVOL_SONI(1), 6);
  assert.equal(SAVOL_SONI(11), 10);
});

test('REV129: every game in every grade and language yields valid questions', () => {
  for (const s of SINFLAR) for (const b of s.bolimlar) for (const til of ORGANILADIGAN) for (const r of rejimlar(s.sinf)) {
    const q = savollar(r, b, s.sinf, { rng, til, srs: {} });
    const joy = `${b.id} ${til} ${r}`;
    assert.ok(q.length > 0, joy);
    if (r === 'kartalar') continue;
    assert.ok(q.length <= SAVOL_SONI(s.sinf), joy);
    for (const x of q) {
      const matn = x.soz ? x.soz.w[til] : x.gap?.w[til];
      assert.ok(matn, joy);
      if (x.variantlar) {
        assert.equal(x.variantlar.length, 4, joy);
        assert.equal(x.variantlar.filter((v) => v.id === x.soz.id).length, 1, joy);
        assert.equal(new Set(x.variantlar.map((v) => v.id)).size, 4, joy);
        // ma'no variantlari bir xil ko'rinmasin (aks holda to'g'risini ajratib bo'lmaydi)
        if (x.tur === 'mano') for (const l of ['uz', 'ru', 'en']) assert.equal(new Set(x.variantlar.map((v) => v.w[l].toLowerCase())).size, 4, `${joy} ${l}: ${x.variantlar.map((v) => v.w[l])}`);
      }
      if (x.tur === 'harf') {
        const togri = harflar(matn);
        const p = x.plitkalar.map((t) => t.c);
        for (const c of togri) assert.ok(p.includes(c), joy);
        assert.ok(harfTogri(togri, matn), joy);
      }
      if (x.tur === 'gap') {
        assert.ok(bolakTogri(bolaklar(matn, til), matn, til), joy);
        assert.equal(x.plitkalar.length, bolaklar(matn, til).length, joy);
      }
    }
    if (r === 'rasm' || r === 'mano' || r === 'harf' || r === 'bellashuv') {
      const ids = q.map((x) => x.soz?.id || x.gap?.id);
      assert.equal(new Set(ids).size, ids.length, `${joy}: takror savol`);
    }
  }
});

test('REV129: spelling tiles — letters plus distractors, case-insensitive check', () => {
  assert.deepEqual(harflar("Don't stop!"), ['D', 'o', 'n', 't', 's', 't', 'o', 'p']);
  assert.deepEqual(harflar('학교'), ['학', '교']);
  assert.equal(terishMumkin('a'), false);
  assert.equal(terishMumkin('apple'), true);
  const p = harfPlitkalar('cat', ['dog', 'bird'], rng).map((t) => t.c);
  assert.equal(p.length, 5);
  assert.ok(harfTogri(['C', 'a', 't'], 'cat'));
  assert.ok(!harfTogri(['t', 'a', 'c'], 'cat'));
});

test('REV129: stars and progress are saved per language', () => {
  const st = memStore();
  assert.equal(yulduzHisob(9, 10), 3);
  assert.equal(yulduzHisob(7, 10), 2);
  assert.equal(yulduzHisob(4, 10), 1);
  assert.equal(yulduzHisob(3, 10), 0);
  assert.equal(yulduzHisob(0, 0), 0);
  const b = sinfOl(1).bolimlar[0];
  assert.equal(bolimPuxta(b, {}), 0);
  for (let kun = 0; kun < 40; kun++) for (const w of b.sozlar) belgila('de', w.id, true, st, 1000 + kun * 30);
  assert.equal(bolimPuxta(b, srsOl('de', st)), 1);
  assert.equal(bolimPuxta(b, srsOl('fr', st)), 0);
  yulduzYoz('de', b.id, 'rasm', 2, st);
  yulduzYoz('de', b.id, 'rasm', 1, st);   // pastroq natija eng yaxshisini o'chirmaydi
  assert.equal(yulduzlar('de', st)[b.id].rasm, 2);
});
