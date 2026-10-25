// REV172: Repetitor (1–11 sinf), yakshanba takrori (bog'cha), yoshga mos vaqt ko'rinishi
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  sinfSozlamasi, yozishMaqsadi, harflab, tekshir, repYangila, sessiya, bosqichlar, muddatiKelgan, lugatRoyxati,
  repBelgila, yozildiQosh, lugatOl, repYulduz, REP_ORALIQ, YOZISH_CHEGARA,
} from './maktab/repetitorRules.js';
import { takrorSozlari, topSavollari, takrorYulduz } from './kid/haftalikTakror.js';
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const xotira = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };

test('daftarga yozish soni sinfga mos: 1–2 sinf 10, 3–4 sinf 20, 5–11 sinf 40; xato — +10; jami 100 dan oshmaydi', () => {
  assert.equal(yozishMaqsadi(1), 10);
  assert.equal(yozishMaqsadi(3), 20);
  assert.equal(yozishMaqsadi(7), 40);
  assert.equal(yozishMaqsadi(11), 40);
  assert.equal(yozishMaqsadi(7, { yozildi: 40 }), 20);                 // spiral takror — kamroq
  assert.equal(yozishMaqsadi(7, { yozildi: 40, xatoKetma: 1 }), 30);   // xato bo'lgan so'z — ko'proq
  assert.equal(yozishMaqsadi(7, { yozildi: 95 }), 5);                  // 100 ga yetkazadi, oshirmaydi
  assert.equal(yozishMaqsadi(7, { yozildi: YOZISH_CHEGARA }), 0);
  assert.equal(sinfSozlamasi(1).terish, true);                           // 1–2 sinf — harf plitkalari bilan
  assert.equal(sinfSozlamasi(5).terish, false);
});

test('harflab aytish va harfma-harf tekshiruv', () => {
  assert.equal(harflab('cat'), 'c, a, t');
  assert.equal(harflab('ice cream'), 'i, c, e / c, r, e, a, m');
  const r = tekshir('aple', 'apple', 'en');
  assert.equal(r.holat, 'xato');
  assert.deepEqual(r.farq.map((f) => f.h), ['ok', 'yoq', 'ok', 'ok', 'ok']);
  assert.equal(tekshir('Apple!', 'apple', 'en').holat, 'togri');
  assert.equal(tekshir('cafe', 'café', 'fr').holat, 'deyarli');
  assert.equal(tekshir('кошкa', 'кошка', 'ru').farq.filter((f) => f.h !== 'ok').length, 1);
});

test('oraliqli takrorlash: 0, 1, 2, 4, 7, 15, 30 kun; xato — ertaga qaytadi', () => {
  assert.deepEqual(REP_ORALIQ, [0, 1, 2, 4, 7, 15, 30]);
  let h = null;
  const kunlar = [];
  let bugun = 100;
  for (let i = 0; i < 6; i++) { h = repYangila(h, true, { bugun }); kunlar.push(h.keyingi - bugun); bugun = h.keyingi; }
  assert.deepEqual(kunlar, [1, 2, 4, 7, 15, 30]);
  const x = repYangila(h, false, { bugun });
  assert.equal(x.keyingi, bugun + 1);
  assert.equal(x.xatoKetma, 1);
  assert.ok(x.quti <= 1);
});

test('sessiya: avval o‘tgan darslardan muddati kelganlar, keyin bo‘limning yangi so‘zlari', () => {
  const w = (id) => ({ id, w: { en: id, uz: id } });
  const sozlar = Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'eski1', 'eski2'].map((id) => [id, w(id)]));
  const bolim = { id: 'u1', sozlar: ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => sozlar[id]) };
  const lugat = { eski1: { quti: 2, keyingi: 50 }, eski2: { quti: 3, keyingi: 99 }, a: { quti: 1, keyingi: 200 } };
  const s = sessiya({ bolim, sinf: 7, lugat, sozlar, bugun: 60 });
  assert.deepEqual(s.map((x) => x.soz.id), ['eski1', 'b', 'c', 'd', 'e', 'f']);
  assert.equal(s[0].yangi, false);
  assert.equal(s[1].yangi, true);
  assert.deepEqual(sessiya({ bolim, sinf: 7, lugat, sozlar, bugun: 100, faqatTakror: true }).map((x) => x.soz.id), ['eski1', 'eski2']);
  assert.deepEqual(muddatiKelgan(lugat, 100), ['eski1', 'eski2']);
  assert.deepEqual(bosqichlar(1, true), ['tanish', 'daftar', 'eshit', 'uzdan']);
  assert.deepEqual(bosqichlar(7, false), ['daftar', 'eshit', 'uzdan', 'tildan']);
  assert.equal(lugatRoyxati(lugat, sozlar, 100)[0].muddat, true);
  assert.equal(repYulduz(0, 5), 3);
  assert.equal(repYulduz(5, 5), 1);
});

test('shaxsiy lug‘at qurilmada saqlanadi: yozilganlar soni va natija', () => {
  const st = xotira();
  yozildiQosh('en', 's1_hello', 10, { bugun: 5 }, st);
  repBelgila('en', 's1_hello', true, { bugun: 5 }, st);
  const h = lugatOl('en', st).s1_hello;
  assert.equal(h.yozildi, 10);
  assert.equal(h.quti, 1);
  assert.equal(h.keyingi, 6);
  assert.deepEqual(lugatOl('ru', st), {});
});

test('yakshanba takrori: ikki haftaning so‘zlari, aytolmaganlari birinchi, fanlar aralash', () => {
  const haftalar = [
    { hafta: 'otgan', kunlar: [{ darslar: [{ kalit: 'en', sozlar: [{ soz: 'cat', emoji: '🐱', aytdi: true }, { soz: 'dog', aytdi: false }] }] }] },
    { hafta: 'shu', kunlar: [{ darslar: [{ kalit: 'mat', sozlar: [{ soz: 'uchburchak', aytdi: true }] }, { kalit: 'en', sozlar: [{ soz: 'apple', aytdi: true }, { soz: 'cat', aytdi: true }] }] }] },
  ];
  const s = takrorSozlari(haftalar, { en: { til: 'en' }, mat: { til: '' } });
  assert.equal(s[0].soz, 'dog');
  assert.equal(s.length, 4);
  assert.equal(s.find((x) => x.soz === 'apple').til, 'en');
  assert.deepEqual(s.slice(1, 3).map((x) => x.kalit).sort(), ['en', 'mat']);
  assert.equal(topSavollari(s, 3).length, 3);
  assert.equal(topSavollari(s, 3)[0].variantlar.length, 3);
  assert.equal(takrorYulduz(3, 3), 3);
});

test('integratsiya: maktabda Repetitor rejimi va lug‘at; bog‘chada yakshanba takrori; vaqt halqasi', () => {
  const m = src('./maktab/MaktabTil.jsx');
  assert.match(m, /repetitor: \["👩‍🏫", "Repetitor"\]/);
  assert.match(m, /<Repetitor /);
  assert.match(m, /<VaqtHalqa /);
  const r = src('./maktab/Repetitor.jsx');
  assert.match(r, /Daftaringizni oling/);
  assert.match(r, /Tarjimani eshit/);
  assert.match(r, /TIL_USTOZ\[til\]/);
  const b = src('./kid/BogchaOlami.jsx');
  assert.match(b, /HaftalikTakror/);
  const v = src('./kid/VaqtHalqa.jsx');
  assert.match(v, /daraja === "katta"/);
  assert.match(src('./kid/xonalar/TilXonalari.jsx'), /<VaqtHalqa /);
});
