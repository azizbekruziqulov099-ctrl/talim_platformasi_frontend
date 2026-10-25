// REV173: darajalar (CEFR), ball/baho/tezlik/o'rin, bo'lim yo'li (dars → mashq → takror → imtihon), bog'chada o'yin yo'li
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SINFLAR } from './maktab/index.js';
import {
  CEFR, darajaHisob, sinfMaqsadi, bahoOf, bolimBahosi, javobBali, bolimQadamlari, rejimOchiq, yilYoli, keyingiQadam, javobYoz, natijaOl, tezlikOf,
} from './maktab/darajaRules.js';
import { darsYoli, BOSQICH_DARS } from './curriculum/darsYoli.js';
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const xotira = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };
const puxta = (sinflar, quti = 4) => Object.fromEntries(sinflar.flatMap((n) => SINFLAR[n - 1].bolimlar.flatMap((b) => b.sozlar.map((w) => [w.id, { quti }]))));

test('CEFR darajasi DTS bo‘yicha: 1–2 Pre-A1, 3–4 A1, 5–9 A2, 10–11 B1', () => {
  assert.deepEqual(CEFR.map((c) => c.kod), ['Pre-A1', 'A1', 'A2', 'B1']);
  assert.equal(sinfMaqsadi(1), 'Pre-A1');
  assert.equal(sinfMaqsadi(4), 'A1');
  assert.equal(sinfMaqsadi(9), 'A2');
  assert.equal(sinfMaqsadi(11), 'B1');
});

test('daraja so‘zlarni o‘zlashtirishdan hisoblanadi va «… ga yaqinlashdi» chiqadi', () => {
  const bosh = darajaHisob({}, {});
  assert.equal(bosh.daraja, null);
  assert.equal(bosh.keyingi, 'Pre-A1');
  const a1 = darajaHisob(puxta([1, 2, 3, 4]), {});
  assert.equal(a1.daraja, 'A1');
  assert.equal(a1.keyingi, 'A2');
  assert.equal(a1.yaqin, false);
  // A2 so'zlarining yarmidan ko'pi o'zlashtirilsa — A2 ga yaqin (70% chegaraning 60%+ i)
  const yarim = puxta([5, 6, 7]);
  const r = darajaHisob({ ...puxta([1, 2, 3, 4]), ...yarim }, {});
  assert.ok(r.foiz >= 60, String(r.foiz));
  assert.equal(r.yaqin, true);
  // repetitor lug'ati ham hisoblanadi; ketma-ketlik: A1 siz A2 berilmaydi
  assert.equal(darajaHisob({}, puxta([1, 2])).daraja, 'Pre-A1');
  assert.equal(darajaHisob(puxta([5, 6, 7, 8, 9]), {}).daraja, null);
});

test('baho, ball va tezlik', () => {
  assert.equal(bahoOf(10, 10), null);          // kam javobda baho yo'q
  assert.equal(bahoOf(19, 20), 5);
  assert.equal(bahoOf(15, 20), 4);
  assert.equal(bahoOf(11, 20), 3);
  assert.equal(bahoOf(5, 20), 2);
  assert.equal(bolimBahosi(3), 5);
  assert.equal(bolimBahosi(0), null);
  assert.equal(javobBali(true), 10);
  assert.equal(javobBali(true, { bellashuv: true, qoldi: 9.6 }), 20);
  assert.equal(javobBali(false, { bellashuv: true, qoldi: 9 }), 0);
  const st = xotira();
  javobYoz('en', { togri: true, bal: 20, ms: 4000 }, st);
  javobYoz('en', { togri: false, bal: 0, ms: 2000 }, st);
  javobYoz('en', { togri: true, bal: 10 }, st);
  const n = natijaOl('en', st);
  assert.deepEqual([n.bal, n.togri, n.jami, n.n], [30, 2, 3, 2]);
  assert.equal(tezlikOf(n), 3);
  assert.equal(natijaOl('ru', st).bal, 0);
});

test('bo‘lim yo‘li: dars → mashq → imtihon qulflari; bo‘limlar ketma-ket ochiladi', () => {
  const s = SINFLAR[6];
  const [b1, b2] = s.bolimlar;
  let q = bolimQadamlari(b1, {}, {}, {});
  assert.deepEqual([q.dars, q.mashq, q.takror, q.imtihon], [false, false, false, false]);
  assert.equal(rejimOchiq('kartalar', q), true);
  assert.equal(rejimOchiq('repetitor', q), true);
  assert.equal(rejimOchiq('rasm', q), false);
  assert.equal(rejimOchiq('bellashuv', q), false);
  assert.equal(rejimOchiq('bellashuv', q, true), true);   // admin
  assert.equal(keyingiQadam(q), 'dars');
  q = bolimQadamlari(b1, { [b1.id]: { kartalar: 1, rasm: 2 } }, {}, {});
  assert.equal(rejimOchiq('bellashuv', q), true);
  assert.equal(keyingiQadam(q), 'imtihon');
  let yol = yilYoli(s, { yul: {}, ozSinf: 7 });
  assert.deepEqual(yol.slice(0, 2).map((x) => x.ochiq), [true, false]);
  assert.equal(yol[0].keyingi, true);
  yol = yilYoli(s, { yul: { [b1.id]: { bellashuv: 1 } }, ozSinf: 7 });
  assert.deepEqual(yol.slice(0, 3).map((x) => x.ochiq), [true, true, false]);
  assert.equal(yol[1].keyingi, true);
  assert.equal(yol[1].bolim.id, b2.id);
  // o'z sinfidan pastki sinf — takrorlash uchun hammasi ochiq
  assert.ok(yilYoli(SINFLAR[2], { ozSinf: 7 }).every((x) => x.ochiq));
  // takror — so'zlarning 60% i kamida 2 marta takrorlangan
  const srs = Object.fromEntries(b1.sozlar.slice(0, 6).map((w) => [w.id, { quti: 2 }]));
  assert.equal(bolimQadamlari(b1, {}, srs, {}).takror, true);
});

test('bog‘cha o‘yin yo‘li: har 3 ta yangi darsdan keyin mashq, oxirida katta imtihon', () => {
  assert.equal(BOSQICH_DARS, 3);
  const t = (nomi, savol = 2) => ({ nomi, dars_bor: true, savol_soni: savol, topic_codes: [nomi] });
  const mavzular = [t('a'), t('b'), t('c'), t('d'), t('Takrorlash'), t('e'), t('f'), t('g'), t('h', 0)];
  const done = new Set([0, 1, 2]);
  const y = darsYoli(mavzular, (i) => ({ done: done.has(i) }), (x) => /takror/i.test(x.nomi));
  assert.deepEqual(y.tugunlar.map((n) => (n.tur === 'dars' ? n.topic.nomi : n.tur)), ['a', 'b', 'c', 'mashq', 'd', 'Takrorlash', 'e', 'f', 'mashq', 'g', 'h', 'imtihon']);
  const [m1, m2] = y.tugunlar.filter((n) => n.tur === 'mashq');
  assert.equal(m1.ochiq, true);
  assert.equal(m2.ochiq, false);
  assert.equal(y.tugunlar.at(-1).ochiq, false);
  assert.equal(y.bosqich, 2);
  assert.equal(y.bosqichlar, 3);
  assert.deepEqual([y.otildi, y.jami], [3, 9]);
  assert.equal(y.tugunlar.at(-1).mavzular.length, 8);   // testi bor mavzular
});

test('integratsiya: daraja kartasi, yil yo‘li, qulflar, server natijasi; bog‘chada yo‘l va daraja chizig‘i', () => {
  const m = src('./maktab/MaktabTil.jsx');
  assert.match(m, /<DarajaKarta /);
  assert.match(m, /className="mk-yol"/);
  assert.match(m, /rejimOchiq\(r, q, erkin\)/);
  assert.match(m, /natijaYubor\(apiBase, authToken/);
  assert.match(src('./til/TilTanlov.jsx'), /<MaktabTil apiBase=\{apiBase\} token=\{token\}/);
  const l = src('./curriculum/LearnerTopics.jsx');
  assert.match(l, /darsYoli\(group\.mavzular/);
  assert.match(l, /kt-grid kt-yol/);
  assert.match(src('./kid/BogchaOlami.jsx'), /ol-diary-yol/);
});
