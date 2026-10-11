import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SOZLAR, XONALAR, VAZIFALAR, BUYRUQLAR, GAPLAR, TILLAR } from './kid/xonalar/xonaLugat.js';
import { joylash, hammasi, izohGap, baho, yoshGuruhi, rejimlar, savollar, aytishShakllari, gap, soz, buyruqVariantlari, saqlash, natija } from './kid/xonalar/xonaRules.js';

const rng = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

test('REV127: every word, sentence and task exists in all 11 languages', () => {
  for (const [id, v] of Object.entries(SOZLAR)) for (const t of TILLAR) assert.ok(v.w[t], `${id}.${t}`);
  for (const [k, g] of Object.entries(GAPLAR)) for (const t of TILLAR) assert.ok(g[t], `${k}.${t}`);
  for (const [x, l] of Object.entries(VAZIFALAR)) for (const v of l) {
    for (const t of TILLAR) assert.ok(v.w[t], `${x}.${v.javob}.${t}`);
    const room = XONALAR.find((r) => r.id === x);
    assert.ok(hammasi(room).includes(v.javob), `${x}: ${v.javob} xonada bor`);
    assert.ok(room.odamlar.includes(v.kim), `${x}: ${v.kim} xonada bor`);
  }
  for (const b of BUYRUQLAR) for (const t of TILLAR) assert.ok(b.w[t], `${b.id}.${t}`);
  // har narsa — rasm yoki emoji bilan
  const rasm = new Set(fs.readdirSync(new URL('./kid/xonalar/rasm/', import.meta.url)).map((f) => f.replace('.webp', '')));
  for (const r of XONALAR) for (const id of hammasi(r)) assert.ok(rasm.has(id) || SOZLAR[id].emoji || r.hs.some((h) => h[0] === id), id);
  for (const r of XONALAR) assert.ok(hammasi(r).length >= 19 && hammasi(r).length <= 30, `${r.id}: 19–30 ta narsa`);
});

test('REV127/128: every item sits inside the room and visible items do not cover each other', () => {
  for (const r of XONALAR) {
    const j = joylash(r.id);
    assert.deepEqual(new Set(j.map((p) => p.id)), new Set(hammasi(r)), r.id);
    const box = (p) => p.hs ? { x0: p.x - p.w / 2, x1: p.x + p.w / 2, y0: p.y - p.h / 2, y1: p.y + p.h / 2 }
      : (() => { const h = (p.s / (p.a || 1)) * r.nisbat; return { x0: p.x - p.s / 2, x1: p.x + p.s / 2, y0: p.y - h / 2, y1: p.y + h / 2 }; })();
    for (const p of j) {
      const b = box(p);
      assert.ok(b.x0 >= -0.5 && b.x1 <= 100.5 && b.y0 >= -0.5 && b.y1 <= 100.5, `${r.id}/${p.id} chegarada: ${JSON.stringify(b)}`);
    }
    const korinadi = j.filter((p) => !p.hs);
    for (let a = 0; a < korinadi.length; a++) for (let c = a + 1; c < korinadi.length; c++) {
      const A = box(korinadi[a]), B = box(korinadi[c]);
      const ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0), oy = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0);
      const kichik = Math.min((A.x1 - A.x0) * (A.y1 - A.y0), (B.x1 - B.x0) * (B.y1 - B.y0));
      assert.ok(ox <= 0 || oy <= 0 || (ox * oy) / kichik < 0.2, `${r.id}: ${korinadi[a].id} ↔ ${korinadi[c].id}`);
    }
  }
});

test('REV127: teacher talks in the izoh language, the word in its own voice', () => {
  assert.equal(izohGap('manosi', 'uz', { t: 'der Apfel', til: 'de', i: 'olma' }), '[de]der Apfel[/de] — bu olma.');
  assert.equal(izohGap('manosi', 'ru', { t: '사과', til: 'ko', i: 'яблоко' }), '[ko]사과[/ko] [ru]— это яблоко.[/ru]');
  assert.equal(izohGap('top', 'en', {}), '[en]I say a word — you find it and tap it![/en]');
  assert.equal(gap('korsat', 'de', soz('apple', 'de')), 'Zeig mal: der Apfel!');
});

test('REV127: spoken answer — article is optional, close is fine, wrong is wrong', () => {
  assert.deepEqual(aytishShakllari('der Apfel', 'de'), ['der Apfel', 'Apfel']);
  assert.deepEqual(aytishShakllari('التفاحة', 'ar'), ['التفاحة', 'تفاحة']);
  assert.equal(baho(['Apfel'], 'der Apfel', 'de').togri, true);
  assert.equal(baho(['la pomme'], 'la pomme', 'fr').togri, true);
  assert.equal(baho(['aple'], 'apple', 'en').togri, true);
  assert.equal(baho(['banana'], 'apple', 'en').togri, false);
  assert.equal(baho([], 'apple', 'en').togri, false);
});

test('REV127: age decides modes and number of questions', () => {
  assert.equal(yoshGuruhi('2-3 yosh'), 'kichik');
  assert.equal(yoshGuruhi('4–5 yosh'), 'orta');
  assert.equal(yoshGuruhi('6-7 yosh'), 'katta');
  assert.equal(yoshGuruhi('3-sinf'), 'katta');
  assert.deepEqual(rejimlar('kichik', 'oshxona'), ['kashf', 'top', 'xotira', 'yordam']);
  assert.deepEqual(rejimlar('katta', 'sinf'), ['kashf', 'top', 'xotira', 'buyruq', 'ayt', 'yoqoldi', 'ortiqcha', 'tartib']);
  assert.deepEqual(rejimlar('orta', 'men'), ['kashf', 'top', 'xotira', 'buyruq', 'ayt', 'yoqoldi', 'ortiqcha']);
  assert.equal(savollar('top', 'oshxona', 'kichik', rng).length, 4);
  assert.equal(savollar('top', 'oshxona', 'katta', rng).length, 8);
  assert.ok(savollar('ayt', 'hovli', 'orta', rng).every((q) => !['boy', 'girl', 'grandpa', 'gardener', 'baby'].includes(q.id)));
  const v = buyruqVariantlari('clap', rng);
  assert.equal(v.length, 3); assert.ok(v.includes('clap')); assert.equal(new Set(v).size, 3);
});

test('REV127: progress is kept per language and room', () => {
  const mem = new Map(); const st = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  saqlash('de', 'oshxona', { kashf: ['apple', 'bread'], yulduz: 3 }, st);
  saqlash('de', 'oshxona', { kashf: ['apple'], yulduz: 2 }, st);
  assert.deepEqual(natija(st).de.oshxona, { kashf: ['apple', 'bread'], yulduz: 5 });
});
