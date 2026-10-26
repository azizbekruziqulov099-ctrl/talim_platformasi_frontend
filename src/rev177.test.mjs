// REV177: darsdan oldin Kabu bilan spiral takror, Kabu — mashq/test/repetitor, maktab kun rejasi, sinfxona soati
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spiralTuz, erkinTuz, erkinTekshir, darsYozuvi, darsniSaqla, oldingiDarslar, takrorQilindi, takrorBelgila, takrorSoni, fanKaliti, atamalar, SPIRAL_ORALIQ } from './lesson/spiralTakror.js';
import { kunRejasi, kunTuri, sinfDarslari, kunBelgila, kunBajardi, birlashtir, vaqtMatni, sinfRaqami } from './maktab/kunReja.js';

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };
const dars = (i, til = 'de') => ({ kod: `D${i}`, mavzu: `Mavzu ${i}`, til, kun: 100 + i,
  sozlar: [{ soz: `wort${i}a`, mano: `soz${i}a` }, { soz: `wort${i}b`, mano: `soz${i}b` }], savollar: [{ savol: `S${i}?`, variantlar: ['a', 'b', 'c'], togri: 1 }], atamalar: [`Atama ${i}`] });

test('takror: o\'tgan darsning HAMMA so\'zlari, keyin eski darslardan spiral (2, 3, 5, 8, 13 dars oldin)', () => {
  assert.deepEqual(SPIRAL_ORALIQ, [1, 2, 3, 5, 8, 13]);
  const darslar = Array.from({ length: 15 }, (_, i) => dars(15 - i));   // eng yangisi birinchi
  const q = spiralTuz(darslar, { soni: 4, oxirgi: 8, rng: () => 0.3 });
  assert.equal(q.length, 6);   // o'tgan darsning 2 so'zi + 4 spiral
  assert.deepEqual(q.map((x) => x.oldin), [1, 1, 2, 3, 5, 8]);
  assert.deepEqual(q.slice(0, 2).map((x) => x.soz).sort(), ['wort15a', 'wort15b']);
  assert.ok(q.every((x) => x.tur === 'soz' && x.til === 'de' && x.mano));
  assert.equal(new Set(q.map((x) => x.soz)).size, 6);
});

test('takror: eski darslar kam bo\'lsa to\'ldiriladi; boshqa fanda — test savoli', () => {
  const q = spiralTuz([dars(3), dars(2), dars(1)], { soni: 4, oxirgi: 8, rng: () => 0.1 });
  assert.equal(q.filter((x) => x.oldin === 1).length, 2);   // o'tgan darsning 2 ta so'zi (til darsida — faqat so'zlar)
  assert.ok(q.length >= 5);
  const mat = spiralTuz([{ ...dars(1, ''), sozlar: [] }], { soni: 4 });
  assert.equal(mat.length, 1);
  assert.equal(mat[0].tur, 'savol');
  assert.equal(spiralTuz([], {}).length, 0);
});

test('yoshga mos: 1–2 sinf — 6 tagacha so\'z + 3 spiral + 4 erkin; kattalar 8 + 4 + 5', () => {
  assert.deepEqual(takrorSoni(1), { oxirgi: 6, spiral: 3, erkin: 4 });
  assert.deepEqual(takrorSoni(2), { oxirgi: 6, spiral: 3, erkin: 4 });
  assert.deepEqual(takrorSoni(7), { oxirgi: 8, spiral: 4, erkin: 5 });
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
  assert.deepEqual(y.sozlar, [{ soz: 'das Haus', mano: 'дом', manoTil: 'ru', emoji: '🏠' }]);
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
  assert.match(dx, /dx-kabu-fon/); assert.doesNotMatch(dx, /dx-kabu-navbat|dx-sinf-kabu/); assert.match(dx, /DarsOldiTakror/); assert.match(dx, /darsniSaqla/);
  assert.match(css, /\.dx-root\.dx-sinf\.dx-focus \.dx-sinf-fon \.us-stage[^{]*\{width:100%;height:100%;min-width:0/);
});

import { kunFanlari } from './maktab/kunReja.js';
import { sinfJoyi } from './lesson/maktabMashqRules.js';
import { XONALAR } from './kid/ustozlar.js';
test('aqlli fan taqsimoti: ona tili va matematika har kuni, qolganlari navbat bilan — haftada hammasi', () => {
  const f = ['Ona tili', 'Matematika', 'Ingliz tili', 'Tabiiy fan', 'Tarbiya', 'Musiqa', 'Texnologiya'].map((nom, i) => ({ kalit: 'k' + i, nom }));
  const ko = new Set();
  for (let kun = 100; kun < 106; kun++) {
    const b = kunFanlari(f, 4, kun);
    assert.equal(b.length, 4);
    assert.equal(new Set(b.map((x) => x.nom)).size, 4);
    assert.ok(b.some((x) => x.nom === 'Ona tili') && b.some((x) => x.nom === 'Matematika'));
    b.forEach((x) => ko.add(x.nom));
  }
  assert.equal(ko.size, 7);   // 6 o'quv kunida hamma fan kamida bir marta
  assert.equal(kunFanlari(f.slice(0, 2), 4, 1).length, 2);
  assert.deepEqual(kunFanlari([], 4, 1), []);
  assert.deepEqual(kunFanlari([{ kalit: 'a', nom: 'Nemis tili (izoh: rus)' }, { kalit: 'b', nom: 'Nemis tili' }], 3, 1).length, 1);
});
test('reja: o\'tilgan fan o\'z slotini, rejadan tashqari dars — bo\'sh slotni belgilaydi', () => {
  const f = ['Ona tili', 'Matematika', 'Ingliz tili', 'Tarix'].map((nom, i) => ({ kalit: 'k' + i, nom }));
  const r = kunRejasi({ sinf: 2, haftaKuni: 2, fanlar: f, kun: 50, bajardi: { dars: 2 }, bajardiFanlar: ['Matematika', 'Musiqa'] });
  const d = r.slotlar.filter((s) => s.k === 'dars');
  assert.equal(d.find((s) => s.fan?.nom === 'Matematika').bajarildi, true);
  assert.equal(d.filter((s) => s.bajarildi).length, 2);
});
test('test va tekshiruv — sinfxonadan chiqib Kabu muhitida: ustoz yo\'q', () => {
  const dx = fs.readFileSync(new URL('./lesson/DarsXonasi.jsx', import.meta.url), 'utf8');
  assert.match(dx, /const kabuMuhit = sinfXona && \["test", "ovoz", "result"\]\.includes\(mode\)/);
  assert.match(dx, /sinfXona && !kabuMuhit && <div className="dx-sinf-fon"/);
  assert.match(dx, /kabuMuhit && <div className={`dx-kabu-fon/);
  for (const k of Object.keys(XONALAR)) assert.equal(sinfJoyi(k).kabu, undefined);
});

import { yordamMatni, YORDAM_MAX, javobSifati, xatoQaytar, repYangila, REP_ORALIQ } from './maktab/repetitorRules.js';
test('repetitor: ishora zinapoyasi, javob sifati (FSRS kabi), xatolar dars oxirida yana', () => {
  assert.equal(YORDAM_MAX, 3);
  assert.equal(yordamMatni('apple', 1), 'a _ _ _ _');
  assert.equal(yordamMatni('apple', 2), 'a _ p _ e');
  assert.equal(yordamMatni('apple', 3), 'apple');
  assert.equal(yordamMatni('ice cream', 1), 'i _ _   _ _ _ _ _');
  assert.equal(javobSifati({ xato: true }), 'xato');
  assert.equal(javobSifati({ yordam: 1, soniya: 3 }), 'qiyin');
  assert.equal(javobSifati({ soniya: 10, bosqich: 2 }), 'oson');
  assert.equal(javobSifati({ soniya: 40, bosqich: 2 }), 'yaxshi');
  const h = { quti: 2, keyingi: 10, kotarildi: 5 };
  assert.equal(repYangila(h, true, { bugun: 10, sifat: 'oson' }).quti, 4);
  assert.equal(repYangila(h, true, { bugun: 10 }).quti, 3);
  const q = repYangila(h, true, { bugun: 10, sifat: 'qiyin' });
  assert.equal(q.quti, 2); assert.equal(q.keyingi, 11);
  assert.equal(repYangila(null, true, { bugun: 10, sifat: 'oson' }).quti, 1);   // yangi so'z birdaniga sakramaydi
  assert.equal(repYangila(h, true, { bugun: 10, sifat: 'oson' }).keyingi, 10 + REP_ORALIQ[4]);
  const list = [{ soz: { id: 'a' } }, { soz: { id: 'b' } }];
  const x = xatoQaytar(list, ['b', 'b']);
  assert.deepEqual(x.map((i) => [i.soz.id, i.qayta]), [['b', true]]);
  assert.deepEqual(xatoQaytar([...list, ...x], ['b']), []);   // bir so'z bir marta qaytadi
});
test('dars ekrani: savol doska tagida emas, kompyuterda ekran to\'liq, doska cho\'zilmaydi, soat ajralmaydi', () => {
  const dx = fs.readFileSync(new URL('./lesson/DarsXonasi.jsx', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('./lesson/dars-xonasi.css', import.meta.url), 'utf8');
  assert.match(dx, /dx-savol-ochiq/); assert.match(dx, /Savol berish/); assert.match(dx, /MutationObserver/);
  assert.match(css, /\.dx-root\.dx-sinf \.dx-ask\{display:none\}/);
  assert.match(css, /\.dx-root\.dx-sinf\.dx-focus:not\(\.dx-yotiq\)\{display:grid/);
  assert.match(css, /\.dx-sinf-fon \.us-bg\{object-fit:fill\}/);
});
test('dars tugagach hammasi o\'zi: mashqlar → test → Repetitor', () => {
  const dx = fs.readFileSync(new URL('./lesson/DarsXonasi.jsx', import.meta.url), 'utf8');
  const mm = fs.readFileSync(new URL('./lesson/MaktabMashqlar.jsx', import.meta.url), 'utf8');
  assert.match(dx, /if \(mashqBor\) setMashqlar\(true\); else startQuizRef\.current\(\)/);
  assert.match(dx, /avtoRep\.current = true; hush\(\); setRepetitor\(true\)/);
  assert.match(mm, /keyingiIsh\?\.\(\)/); assert.doesNotMatch(mm, /setSanoq\(\(x\) => \{[^}]*keyingiIsh/);
});

test('tekshiruv tuzatishlari: chiqishda oynalar yopiladi, zanjir bir marta, Repetitor o\'zi boshlanadi, yakshanba alohida', () => {
  const dx = fs.readFileSync(new URL('./lesson/DarsXonasi.jsx', import.meta.url), 'utf8');
  const rp = fs.readFileSync(new URL('./maktab/Repetitor.jsx', import.meta.url), 'utf8');
  const ot = fs.readFileSync(new URL('./parent/MaktabOtaOna.jsx', import.meta.url), 'utf8');
  assert.match(dx, /setMashqlar\(false\); setRepetitor\(false\); setOldiTakror\(null\)/);
  assert.match(dx, /zanjir\.current = true/);
  assert.match(dx, /setMode\("end"\); modeRef\.current = "end"/);
  assert.match(dx, /savolOchiq && !kabuMuhit/);
  assert.match(dx, /avtoBosh/);
  assert.match(rp, /if \(avtoBosh && darsSozlari\?\.length\) boshla\(false\)/);
  assert.match(rp, /ayt\(teg\(soz0\.w\[til\], til\), \{\}, navbat\)/);
  assert.match(ot, /\[1, 2, 3, 4, 5, 6\]\.map\(\(k\) => <button/);
  // oynalar xona ichida emas (telefon buralganda butun ekranni egallaydi)
  const room = dx.slice(dx.indexOf('<div className="dx-room">'), dx.indexOf('{oldiTakror && <div className="dx-repetitor-oyna"'));
  assert.ok(room.includes('</aside>}'));
});

import { testOvozi, matnTili, tilLugati } from './lesson/maktabMashqRules.js';
test('test o\'qilishi: har qism o\'z talaffuzida (nemischa — nemischa, A) B) — interfeys tilida)', () => {
  const steps = [{ ovoz: 'Neues Wort: [de]hallo[/de]. [de]Guten Morgen[/de]!' }];
  const lug = tilLugati(steps, 'de', [{ w: { de: 'tschüss', en: 'bye' } }]);
  assert.ok(lug.has('hallo') && lug.has('guten morgen') && lug.has('tschüss'));
  assert.equal(matnTili('hallo', { til: 'de', iz: 'en', lugat: lug }), 'de');
  assert.equal(matnTili('What does it mean?', { til: 'de', iz: 'en', lugat: lug }), 'en');
  assert.equal(matnTili('Was bedeutet Straße?', { til: 'de', iz: 'en', lugat: new Set() }), 'de');
  assert.equal(matnTili('Привет', { til: 'de', iz: 'en', lugat: lug }), 'ru');
  assert.equal(matnTili('salom', { til: 'de', iz: 'uz', lugat: lug }), 'uz');
  const o = testOvozi({ kirish: 'Listen to the question.', savol: 'How do you say hello?', variantlar: ['hallo', 'tschüss'], til: 'de', iz: 'en', ui: 'en', lugat: lug });
  assert.equal(o, '[en]Listen to the question.[/en] [en]How do you say hello?[/en] [en]A)[/en] [de]hallo[/de]. [en]B)[/en] [de]tschüss[/de].');
  const u = testOvozi({ savol: 'Qaysi biri salom?', variantlar: ['hallo'], til: 'de', iz: 'uz', ui: 'uz', lugat: lug });
  assert.equal(u, 'Qaysi biri salom? A) [de]hallo[/de].');
});
test('mikrofon: Androidda yozib olish o\'chiq, eshitilmasa urinish hisoblanmaydi, maktabda 3 yulduz kerak; to\'liq ekran so\'ralmaydi', () => {
  const vc = fs.readFileSync(new URL('./lesson/VoiceCheck.jsx', import.meta.url), 'utf8');
  const dx = fs.readFileSync(new URL('./lesson/DarsXonasi.jsx', import.meta.url), 'utf8');
  assert.match(vc, /noClip \|\| android \? null/);
  assert.match(vc, /setPhase\("tap"\);\n\s*return;/);
  assert.match(vc, /kid \? voicePassed\(g\) : Number\(g\.stars\) >= 3/);
  assert.doesNotMatch(dx, /requestFullscreen\(/);
  assert.match(dx, /dx-burish/);
});
test('takror / mashq / repetitor oynasi menyular ustida va yotiq past ekranga sig\'adi', () => {
  const css = fs.readFileSync(new URL('./lesson/dars-xonasi.css', import.meta.url), 'utf8');
  const rp = fs.readFileSync(new URL('./maktab/repetitor.css', import.meta.url), 'utf8');
  assert.match(css, /\.dx-repetitor-oyna\{position:fixed;inset:0;z-index:2147483100;/);
  assert.match(css, /@media \(orientation:landscape\) and \(max-height:600px\)\{\n  \.dx-repetitor-oyna\{/);
  assert.match(rp, /\.rp-root:has\(>\.rp-card\)>\.rp-card\{grid-column:2/);
});

import { manoTanla, buyruq } from './lesson/takrorMano.js';
test('REV178: ma\'no hozirgi interfeys tilida; Kabu «nemischa yozing» deydi, keyin talaffuz', () => {
  // inglizcha izohli darsda saqlangan so'z — o'zbek interfeysida o'zbekcha ma'no (umumiy lug'atdan)
  assert.deepEqual(manoTanla({ til: 'de', soz: 'Hallo', mano: 'hello', manoTil: 'en' }, 'uz'), { mano: 'Salom', til: 'uz' });
  assert.deepEqual(manoTanla({ til: 'de', soz: 'Hallo', mano: 'hello', manoTil: 'en' }, 'en'), { mano: 'hello', til: 'en' });
  // lug'atda yo'q so'z — saqlangan ma'no o'z tili bilan (ovozda o'sha til talaffuzida)
  assert.deepEqual(manoTanla({ til: 'de', soz: 'Rückblick', mano: 'review', manoTil: 'en' }, 'uz'), { mano: 'review', til: 'en' });
  const y = buyruq('yoz', { L: 'uz', til: 'de', m: 'Salom', mTil: 'uz' });
  assert.equal(y.matn, '«Salom» — shu so‘zni nemischa yozing.');
  assert.equal(y.ovoz, '«Salom» — shu so‘zni nemischa yozing.');
  const e = buyruq('yoz', { L: 'en', til: 'de', m: 'hello', mTil: 'en' });
  assert.equal(e.ovoz, '[en]“[/en][en]hello[/en][en]” — write this word in German.[/en]');
  const a = buyruq('ayt', { L: 'ru', til: 'de', w: 'Hallo' });
  assert.match(a.ovoz, /\[de\]Hallo\[\/de\]$/);
  const dx = fs.readFileSync(new URL('./lesson/DarsOldiTakror.jsx', import.meta.url), 'utf8');
  assert.match(dx, /useState\("yoz"\)/);   // avval yozadi (javob ko'rinmaydi), keyin aytadi
  assert.match(dx, /\[\.\.\.\(erkin \? \["erkin"\] : \[\]\), \.\.\.\(savollar\.length \? \["spiral"\]/);   // avval erkin eslash
});
