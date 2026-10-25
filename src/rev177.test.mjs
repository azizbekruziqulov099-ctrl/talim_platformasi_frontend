// REV177: darsdan oldin Kabu bilan spiral takror, Kabu — mashq/test/repetitor, maktab kun rejasi, sinfxona soati
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spiralTuz, erkinTuz, erkinTekshir, darsYozuvi, darsniSaqla, oldingiDarslar, takrorQilindi, takrorBelgila, takrorSoni, fanKaliti, atamalar, SPIRAL_ORALIQ } from './lesson/spiralTakror.js';
import { kunRejasi, kunTuri, sinfDarslari, kunBelgila, kunBajardi, birlashtir, vaqtMatni, sinfRaqami } from './maktab/kunReja.js';

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };
const dars = (i, til = 'de') => ({ kod: `D${i}`, mavzu: `Mavzu ${i}`, til, kun: 100 + i,
  sozlar: [{ soz: `wort${i}a`, mano: `soz${i}a` }, { soz: `wort${i}b`, mano: `soz${i}b` }], savollar: [{ savol: `S${i}?`, variantlar: ['a', 'b', 'c'], togri: 1 }], atamalar: [`Atama ${i}`] });

test('spiral: oldingi darslardan 1, 2, 3, 5, 8, 13 dars oldin — bittadan, takrorlanmaydi', () => {
  assert.deepEqual(SPIRAL_ORALIQ, [1, 2, 3, 5, 8, 13]);
  const darslar = Array.from({ length: 15 }, (_, i) => dars(15 - i));   // eng yangisi birinchi
  const q = spiralTuz(darslar, { soni: 6, rng: () => 0.3 });
  assert.equal(q.length, 6);
  assert.deepEqual(q.map((x) => x.oldin), [1, 2, 3, 5, 8, 13]);
  assert.ok(q.every((x) => x.tur === 'soz' && x.til === 'de' && x.mano));
  assert.equal(new Set(q.map((x) => x.soz)).size, 6);
});

test('spiral: darslar kam bo\'lsa bor darslardan to\'ldiriladi; boshqa fanda — test savoli', () => {
  const q = spiralTuz([dars(2), dars(1)], { soni: 5, rng: () => 0.1 });
  assert.equal(q.length, 5);   // 2 dars × 2 so'z, keyin test savoli
  assert.equal(q.filter((x) => x.tur === 'soz').length, 4);
  const mat = spiralTuz([{ ...dars(1, ''), sozlar: [] }], { soni: 5 });
  assert.equal(mat.length, 1);
  assert.equal(mat[0].tur, 'savol');
  assert.equal(spiralTuz([], {}).length, 0);
});

test('yoshga mos: 1–2 sinf 5 spiral + 4 erkin, kattalar 6 + 5', () => {
  assert.deepEqual(takrorSoni(1), { spiral: 5, erkin: 4 });
  assert.deepEqual(takrorSoni(2), { spiral: 5, erkin: 4 });
  assert.deepEqual(takrorSoni(7), { spiral: 6, erkin: 5 });
});

test('erkin eslash: artiklsiz, bitta harf xatosi kechiriladi, tushunchada asosiy so\'z yetadi', () => {
  const e = erkinTuz({ mavzu: 'Familie', til: 'de', sozlar: [{ soz: 'die Mutter', mano: 'ona' }, { soz: 'der Vater', mano: 'ota' }, { soz: 'die Schwester', mano: 'opa' }, { soz: 'der Bruder', mano: 'aka' }] }, 5);
  assert.equal(e.maqsad, 4);
  const r = erkinTekshir('Mutter, vater\nSchwster', e.kutilgan);
  assert.deepEqual(r.topildi.map((x) => x.matn), ['die Mutter', 'der Vater', 'die Schwester']);
  assert.deepEqual(r.qolgan.map((x) => x.matn), ['der Bruder']);
  const t = erkinTuz({ mavzu: 'Kasrlar', til: '', sozlar: [], atamalar: ['Oddiy kasrlar', 'Surat va maxraj', 'Kasrlarni qisqartirish'] });
  assert.deepEqual(erkinTekshir('maxraj, qisqartirish', t.kutilgan).topildi.length, 2);
  assert.equal(erkinTuz(null), null);
});

test('dars yozuvi saqlanadi; izoh tili farq qilmaydi; joriy dars chiqmaydi; bugun bir marta so\'raladi', () => {
  const st = mem();
  const y = darsYozuvi({ kod: 'DE11-1', mavzu: '🏠 Wohnen', fan: 'Nemis tili (izoh: rus)', til: 'de', iz: 'ru',
    steps: [{ turi: 'kirish', sarlavha: 'Salom' }, { turi: 'tushuntirish', sarlavha: '🏠 Das Haus — дом' }],
    sozlar: [{ w: { de: 'das Haus', ru: 'дом', uz: 'дом' }, emoji: '🏠' }], savollar: [{ savol: 'Was?', variantlar: ['a', 'b'], togri: 0 }, { savol: 'x' }] });
  assert.equal(y.mavzu, 'Wohnen');
  assert.deepEqual(y.sozlar, [{ soz: 'das Haus', mano: 'дом', emoji: '🏠' }]);
  assert.equal(y.savollar.length, 1);
  assert.deepEqual(y.atamalar, ['Das Haus']);
  darsniSaqla('Nemis tili (izoh: rus)', y, st);
  darsniSaqla('Nemis tili', { ...y, kod: 'DE11-2' }, st);
  assert.equal(fanKaliti('Nemis tili (izoh: ingliz)'), 'nemis tili');
  assert.deepEqual(oldingiDarslar('Nemis tili', 'DE11-3', st).map((x) => x.kod), ['DE11-2', 'DE11-1']);
  assert.deepEqual(oldingiDarslar('Nemis tili', 'DE11-2', st).map((x) => x.kod), ['DE11-1']);
  assert.equal(takrorQilindi('DE11-3', st, 500), false);
  takrorBelgila('DE11-3', st, 500);
  assert.equal(takrorQilindi('DE11-3', st, 500), true);
  assert.equal(takrorQilindi('DE11-3', st, 501), false);
  assert.deepEqual(atamalar([{ _maktabSana: true, sarlavha: 'Sana' }, { turi: 'test', sarlavha: 'Test' }, { turi: 'x', sarlavha: '➗ Kasr — bo\'lak' }]), ['Kasr']);
});

test('kun rejasi: 1–2 sinf 3–4 dars, dam kuni, yakshanba takrori', () => {
  assert.deepEqual([sinfDarslari(1).min, sinfDarslari(1).max], [3, 4]);
  assert.deepEqual([sinfDarslari(7).min, sinfDarslari(7).max], [5, 6]);
  const r = kunRejasi({ sinf: 2, haftaKuni: 1, bajardi: { dars: 3 } });
  assert.equal(r.tur, 'dars');
  assert.equal(r.oraliq, '3–4');
  assert.equal(r.slotlar.filter((s) => s.k === 'dars').length, 4);
  assert.ok(r.slotlar.find((s) => s.n === 4).ixtiyoriy);
  assert.equal(r.jami, 4);   // 3 dars + repetitor
  assert.equal(r.bajarildi, 3);
  assert.equal(r.darsTugadi, true);
  assert.equal(r.tugadi, false);
  assert.equal(kunRejasi({ sinf: 2, haftaKuni: 1, bajardi: { dars: 3, repetitor: 1 } }).tugadi, true);
  assert.equal(kunTuri(undefined, 0), 'takror');
  assert.equal(kunTuri({ dam_kunlari: [6], yakshanba: 'dam' }, 0), 'dam');
  assert.equal(kunTuri({ dam_kunlari: [6], yakshanba: 'dars' }, 0), 'dars');
  assert.equal(kunTuri({ dam_kunlari: [6], yakshanba: 'takror' }, 6), 'dam');
  const t = kunRejasi({ sinf: 5, haftaKuni: 0 });
  assert.deepEqual(t.slotlar.map((s) => s.k), ['repetitor', 'imtihon', 'takror']);
  assert.equal(kunRejasi({ sinf: 5, reja: { dars_soni: 3, dam_kunlari: [0], yakshanba: 'takror' }, haftaKuni: 3 }).oraliq, '3');
  assert.equal(vaqtMatni(155), '2 soat 35 daqiqa');
  assert.equal(sinfRaqami('7-A'), 7);
});

test('kun belgisi: shu qurilmada bugun nima qilindi, server bilan kattasi olinadi', () => {
  const st = mem();
  kunBelgila('dars', 'A', st, '2026-10-26'); kunBelgila('dars', 'A', st, '2026-10-26'); kunBelgila('dars', 'B', st, '2026-10-26');
  assert.deepEqual(kunBajardi(st, '2026-10-26'), { dars: 2 });
  assert.deepEqual(kunBajardi(st, '2026-10-27'), {});
  assert.deepEqual(birlashtir({ dars: 1, takror: 2 }, { dars: 2 }), { dars: 2, takror: 2 });
});

test('Kabu: repetitor, mashqlar, test va takrorni robot Kabu o\'tkazadi; sinfxona soati surilmaydi', () => {
  const rep = fs.readFileSync(new URL('./maktab/Repetitor.jsx', import.meta.url), 'utf8');
  const mm = fs.readFileSync(new URL('./lesson/MaktabMashqlar.jsx', import.meta.url), 'utf8');
  const dx = fs.readFileSync(new URL('./lesson/DarsXonasi.jsx', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('./lesson/dars-xonasi.css', import.meta.url), 'utf8');
  assert.match(rep, /KabuXonacha/); assert.match(rep, /KABU_OVOZ/); assert.doesNotMatch(rep, /UstozXonacha/);
  assert.match(mm, /KabuXonacha/); assert.match(mm, /KABU_OVOZ/);
  assert.match(dx, /dx-kabu-navbat/); assert.match(dx, /DarsOldiTakror/); assert.match(dx, /darsniSaqla/);
  assert.match(css, /\.dx-root\.dx-sinf\.dx-focus \.dx-sinf-fon \.us-stage[^{]*\{width:100%;height:100%;min-width:0/);
});
