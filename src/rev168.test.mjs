// REV168: bolalar kundaligi (Kunlik/Jadval/Fanlar/Rivojlanish), bugungi darslar xonachada, fan guruhlari va emblemalar,
// sinov (reklama) darslari va bosqichlari, darsni telefon yotqizilganda kattaroq ko'rsatish
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BAJARISH, bajarishDarajasi, rivojlanish, tavsiya, uydaBirga } from './kid/kundalikRules.js';
import { bobBoyicha, fanEmblema, fanGuruhi, guruhla } from './curriculum/fanGuruhlari.js';
import { fanHolati, rejaKvotasi } from './parent/bogchaReja.js';
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');

test('bajarish darajasi: baho/yulduzdan — Mustaqil / Eslatma bilan / Birga', () => {
  assert.equal(bajarishDarajasi({ tugadi: true, baho: 5 }), 'mustaqil');
  assert.equal(bajarishDarajasi({ tugadi: true, baho: 4 }), 'eslatma');
  assert.equal(bajarishDarajasi({ tugadi: true, baho: 2 }), 'birga');
  assert.equal(bajarishDarajasi({ tugadi: true, yulduz: 3 }), 'mustaqil');
  assert.equal(bajarishDarajasi({ tugadi: false, baho: 5 }), 'yoq');
  for (const k of ['mustaqil', 'eslatma', 'birga', 'yoq']) assert.ok(BAJARISH[k][1]);
});

test('rivojlanish: o‘tgan hafta → shu hafta (avval/hozir), tavsiya eng qiyin fanga', () => {
  const d = (kalit, baho, mavzu) => ({ kalit, fan: kalit, mavzu, tugadi: true, baho, yulduz: 0 });
  const h = [{ hafta: 'shu', kunlar: [{ darslar: [d('en', 3, 'Ranglar'), d('mat', 5, 'Sanoq')] }] },
    { hafta: 'otgan', kunlar: [{ darslar: [d('en', 5, 'Salom')] }] }];
  const r = rivojlanish(h);
  assert.deepEqual(r.map((x) => [x.kalit, x.avval, x.hozir]), [['en', 'mustaqil', 'eslatma'], ['mat', 'yoq', 'mustaqil']]);
  assert.match(tavsiya(r, (k) => k), /^en: «Ranglar» — uyda shu mavzuni/);
  assert.match(tavsiya([]), /Bir necha dars/);
  assert.match(tavsiya([{ kalit: 'mat', avval: 'yoq', hozir: 'mustaqil' }]), /Zo‘r/);
});

test('uyda birga: tilda — o‘sha so‘zlar; matematikada — sanash', () => {
  const sozlar = [{ soz: 'cat' }, { soz: 'dog' }];
  assert.match(uydaBirga([{ kalit: 'en', holat: 'tugadi', sozlar }], (k) => k === 'en'), /«cat», «dog»/);
  assert.match(uydaBirga([{ kalit: 'mat', holat: 'tugadi', mavzu: 'Sanoq' }], () => ''), /^«Sanoq» — uydagi qoshiq/);
  assert.match(uydaBirga([]), /so‘rang/);
});

test('fan guruhlari: maktab fanlari / tillar / ijod va sport; emblemalar', () => {
  assert.equal(fanGuruhi('Ona tili'), 'maktab');
  assert.equal(fanGuruhi('Ingliz tili'), 'til');
  assert.equal(fanGuruhi('Rus tili'), 'til');
  assert.equal(fanGuruhi('Musiqa'), 'ijod');
  assert.equal(fanGuruhi('Fizika'), 'maktab');
  assert.equal(fanEmblema('Fizika'), '⚛️');
  assert.equal(fanEmblema('Jismoniy tarbiya'), '⚽');
  assert.equal(fanEmblema('Algebra'), '➗');
  assert.equal(fanEmblema('Nomaʼlum'), '📘');
  assert.deepEqual(guruhla([{ nom: 'Musiqa' }, { nom: 'Fizika' }]).map((g) => g.id), ['maktab', 'ijod']);
  const b = bobBoyicha([{ nomi: 'a', bob: '1-bob' }, { nomi: 'b', bob: '1-bob' }, { nomi: 'c', bob: '2-bob' }]);
  assert.deepEqual(b.map((x) => [x.bob, x.mavzular.map((m) => m.raqam)]), [['1-bob', [1, 2]], ['2-bob', [3]]]);
});

test('sinov darslari: olinmagan kurs — bir necha dars bepul; yakshanba (takror) — yo‘q', () => {
  const plan = { reja: { manba: 'ota', faol: ['en'], bugun: { en: 1 }, sinov: { ru: 4 }, navbat: [] } };
  assert.equal(rejaKvotasi(plan, 'Rus tili'), 4);
  assert.equal(rejaKvotasi(plan, 'Ingliz tili'), 1);
  assert.deepEqual(fanHolati(plan, 'Rus tili'), { turi: 'sinov', kvota: 4, asl: 'yoq' });
  assert.equal(fanHolati({ reja: { ...plan.reja, sinov: { ru: 0 } } }, 'Rus tili').turi, 'yoq');
  assert.equal(rejaKvotasi({ reja: { ...plan.reja, takror_kuni: true } }, 'Rus tili'), 0);
  assert.equal(fanHolati({ reja: { obuna_kerak: true, sinov: { en: 2 } } }, 'Ingliz tili').turi, 'sinov');
});

test('o‘yin bosqichlari: sinovda keyingi bosqichlar «kurs» bilan yopiq', () => {
  const s = src('./kid/harakat/harakatRules.js');
  assert.match(s, /sinov = 0/);
  assert.match(s, /"kurs"/);
  assert.match(src('./kid/BogchaOlami.jsx'), /SINOV_BOSQICH/);
  assert.match(src('./til/TilTanlov.jsx'), /Mening tilim/);
});

test('bosh sahifa: kundalik va bugungi darslar xonachada (ustoz bilan), boshqalar kichik', () => {
  const o = src('./kid/BogchaOlami.jsx');
  assert.match(o, /UstozXonacha/);
  assert.match(o, /Bugungi darslar/);
  assert.match(o, /Boshqa fanlar/);
  assert.match(src('./kid/KidKundalik.jsx'), /BolalarKundaligi/);
  assert.match(src('./parent/FarzandFaollik.jsx'), /BolalarKundaligi/);
  const x = src('./kid/ustozXonacha.css');
  assert.match(x, /\.ux-room:not\(\.is-bg\)/);   // rasm yuklanguncha oddiy xona
});

test('dars: telefon yotqizilganda kattaroq (landscape), CSS grid tashlanmaydi', () => {
  const c = src('./lesson/dars-xonasi.css');
  assert.match(c, /orientation:\s*landscape\)\s*and\s*\(max-height:\s*600px\)/);
  assert.match(src('./lesson/DarsXonasi.jsx'), /orientation\?\.lock/);
  const k = src('./kid/bolalarKundaligi.css');
  assert.doesNotMatch(k, /font:\d{3} [\d.]+px\/[\d.]+ inherit/);   // noto'g'ri shorthand (butun qoida tashlanardi)
  assert.match(k, /min-width:0/);
});
