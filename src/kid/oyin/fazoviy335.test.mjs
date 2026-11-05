import test from 'node:test';
import assert from 'node:assert/strict';
import { oyinYasa, tekshir, raundGapi, OYINLAR } from './oyinRules.js';
import { oyinMatn } from './oyinMatn.js';
const el = [{ emoji: '🐶', uz: 'kuchuk' }, { emoji: '🐱', uz: 'mushuk' }, { emoji: '🐟', uz: 'baliq' }];
test('REV335: fazoviy o‘yinlar — hamma yoshda, to‘g‘ri javob bor, 5 tilda matn', () => {
  for (const id of [68, 76, 103]) {
    assert.ok(OYINLAR.some((o) => o.id === id));
    for (const y of ['2-3', '4-5', '6-7']) {
      const h = oyinYasa(id, { elementlar: el, yosh: y, urug: 7 });
      for (const r of h.raundlar) { assert.ok(r.variantlar.some((v) => v.k === r.togri)); assert.equal(new Set(r.variantlar.map((v) => v.k)).size, r.variantlar.length); }
      const n = tekshir(h, h.raundlar[0].togri); assert.equal(n.togri, true);
      for (const iz of ['uz', 'ru', 'en', 'de', 'es']) assert.ok(raundGapi(h, { izoh: iz, til: 'uz', birinchi: true }).length > 5);
    }
  }
  for (const k of ['ustida', 'ostida', 'ichida', 'ongda', 'chapda']) for (const iz of ['uz', 'ru', 'en', 'de', 'es']) assert.ok(oyinMatn('joylashuv', k, iz));
  const m = oyinYasa(103, { elementlar: [], yosh: '6-7', urug: 3 }).raundlar[0];
  const nam = m.savol.minora.join(); assert.equal(m.variantlar.filter((v) => v.minora.join() === nam).length, 1);   // faqat bittasi namunaga teng
});
test('REV336: chalkash yo‘llar, tarozi, teskari', () => {
  for (const [id, ys] of [[93, ['2-3', '4-5', '6-7']], [106, ['2-3', '4-5', '6-7']], [114, ['4-5', '6-7']]]) for (const y of ys) {
    const h = oyinYasa(id, { elementlar: el, yosh: y, urug: 11 });
    assert.ok(h, `${id} ${y}`);
    for (const r of h.raundlar) assert.ok(r.variantlar.some((v) => v.k === r.togri));
    for (const iz of ['uz', 'ru', 'en', 'de', 'es']) assert.ok(raundGapi(h, { izoh: iz, til: 'uz', birinchi: true }).length > 5);
  }
  const y = oyinYasa(93, { elementlar: el, yosh: '6-7', urug: 5 }).raundlar[0];
  const iv = y.variantlar.findIndex((v) => v.k === y.togri); assert.equal(y.savol.oxir[iv], y.savol.maqsad);   // to'g'ri narsaning yo'li suyakka boradi
  const t = oyinYasa(106, { elementlar: el, yosh: '4-5', urug: 2 }).raundlar[0];
  assert.equal(t.togri, t.savol.ogir === 'chap' ? t.savol.chap.k : t.savol.ong.k);
  const s = oyinYasa(114, { elementlar: [], yosh: '6-7', urug: 4 }); assert.match(raundGapi(s, { izoh: 'ru', til: 'uz' }), /противоположное/);
});
test('REV337: rang o‘yinlari', () => {
  for (const [id, ys] of [[61, ['2-3', '4-5', '6-7']], [62, ['2-3', '4-5', '6-7']], [63, ['2-3', '4-5', '6-7']], [64, ['6-7']]]) for (const y of ys) {
    const h = oyinYasa(id, { elementlar: [], yosh: y, urug: 9 }); assert.ok(h, `${id} ${y}`);
    for (const r of h.raundlar) { assert.ok(r.variantlar.some((v) => v.k === r.togri)); assert.equal(new Set(r.variantlar.map((v) => v.k)).size, r.variantlar.length); }
    for (const iz of ['uz', 'ru', 'en', 'de', 'es']) assert.ok(raundGapi(h, { izoh: iz, til: 'uz', birinchi: true }).length > 5);
  }
  assert.equal(oyinYasa(64, { elementlar: [], yosh: '4-5' }), null);   // aralashtirish — faqat 6–7 yosh
  const h = oyinYasa(61, { elementlar: [], yosh: '2-3', urug: 1 });
  assert.ok(h.raundlar.every((r) => ['qizil', 'sariq', 'kok', 'yashil'].includes(r.togri)));   // kichiklarga — asosiy 4 rang
});
test('REV338: matematika o‘yinlari', () => {
  for (const [id, ys] of [[49, ['4-5', '6-7']], [57, ['6-7']], [43, ['4-5', '6-7']], [59, ['4-5', '6-7']]]) for (const y of ys) {
    const h = oyinYasa(id, { elementlar: [], yosh: y, urug: 13 }); assert.ok(h, `${id} ${y}`);
    for (const r of h.raundlar) assert.ok(r.variantlar.some((v) => v.k === r.togri));
    for (const iz of ['uz', 'ru', 'en', 'de', 'es']) assert.ok(raundGapi(h, { izoh: iz, til: 'uz', birinchi: true }).length > 10, `${id} ${iz}`);
  }
  const d = oyinYasa(49, { elementlar: [], yosh: '6-7', urug: 3 });
  for (const r of d.raundlar) for (const v of r.variantlar) assert.equal(v.narx <= r.savol.pul, v.k === r.togri);   // faqat to'g'risiga pul yetadi
  const o = oyinYasa(57, { elementlar: [], yosh: '6-7', urug: 2 }).raundlar[0];
  assert.equal(o.togri, `n:${o.savol.onlar * 10 + o.savol.birlar}`);
  const m = oyinYasa(59, { elementlar: [], yosh: '4-5', urug: 5 });
  assert.ok(m.raundlar.every((r) => r.savol.amal === '+'));   // 4–5 yoshda faqat qo'shish
  for (const r of oyinYasa(59, { elementlar: [], yosh: '6-7', urug: 8 }).raundlar) { const j = r.savol.amal === '+' ? r.savol.a + r.savol.b : r.savol.a - r.savol.b; assert.equal(r.togri, `n:${j}`); assert.ok(j >= 1 && j <= 9); }
});
import { toza } from './oyinMatn.js';
test('REV347: gaplar takrorlanmaydi, tarozi to‘g‘ri', () => {
  const el3 = [{ emoji: '🐈', uz: 'mushuk' }, { emoji: '🐕', uz: 'it' }, { emoji: '🥛', uz: 'sut' }];
  const boshlar = new Set();
  for (let u = 1; u <= 12; u++) { const h = oyinYasa(116, { elementlar: el3, yosh: '2-3', urug: u, mavzu: 'Mushuk va it' }); boshlar.add(raundGapi(h, { izoh: 'uz', til: 'uz', birinchi: true }).split('!')[0]); }
  assert.ok(boshlar.size >= 4, `ochilishlar xilma-xil: ${boshlar.size}`);
  const t = oyinYasa(116, { elementlar: el3, yosh: '2-3', urug: 2, tanish: true }); assert.ok(!raundGapi(t, { izoh: 'uz', til: 'uz', birinchi: true }).includes('Men aytaman'));
  for (const iz of ['uz', 'ru', 'en', 'de', 'es']) assert.ok(oyinMatn('eshitBos', 'raund', iz, { t: 'x' }, 2).length > 3);
  const h = oyinYasa(106, { elementlar: [], yosh: '6-7', urug: 5 });
  for (const r of h.raundlar) { const og = r.savol.ogir === 'chap' ? r.savol.chap : r.savol.ong; assert.ok(og.k.startsWith('o')); }   // pastga tushgani — haqiqatan og'ir
  assert.equal(toza('sut! qani'), 'Sut! Qani');
});
test('REV348: saralash va ulash — 5 tilda, yoshga mos, joriy fasl', () => {
  const ids = [149, 154, 161, 162, 168, 150, 96, 14, 18, 148, 94, 158, 147, 95, 165];
  for (const id of ids) for (const y of ['2-3', '4-5', '6-7']) for (const iz of ['uz', 'ru', 'en', 'de', 'es']) {
    const h = oyinYasa(id, { elementlar: [], yosh: y, urug: 3, izoh: iz, fasl: 'kuz' });
    if (!h) continue;   // 4-7 yoshgagina mo'ljallangan o'yin
    for (const r of h.raundlar) {
      assert.ok(r.variantlar.some((v) => v.k === r.togri), `${id} ${y}`);
      assert.ok(r.savol.el.uz && r.variantlar.every((v) => v.el.uz), `${id} ${iz} nomlar`);
      if (y === '2-3' && id !== 18) assert.ok(r.variantlar.length <= 2, `${id} 2-3 yoshda 2 tadan ko'p emas`);
    }
    const g = raundGapi(h, { izoh: iz, til: 'uz', birinchi: true }); assert.ok(g.length > 20 && !g.includes('{'), `${id} ${iz}: ${g}`);
  }
  const f = oyinYasa(18, { elementlar: [], yosh: '4-5', urug: 1, izoh: 'uz', fasl: 'qish' });
  assert.ok(f.raundlar.every((r) => r.variantlar.some((v) => v.k === 'f_qish')));   // joriy fasl doim bor
  assert.equal(oyinYasa(158, { elementlar: [], yosh: '2-3', izoh: 'uz' }), null);
  const u = oyinYasa(148, { elementlar: [], yosh: '6-7', urug: 2, izoh: 'de' }); assert.match(u.raundlar[0].savol.el.uz, /[A-ZÄÖÜa-zäöüß]/);
});
test('REV349: tartibga qo‘yish — to‘g‘ri ketma-ketlik, aralashgan, 5 tilda', () => {
  for (const id of [152, 146, 29, 157, 153, 15, 156, 166]) for (const y of ['2-3', '4-5', '6-7']) for (const iz of ['uz', 'ru', 'en', 'de', 'es']) {
    const h = oyinYasa(id, { elementlar: [], yosh: y, urug: 4, izoh: iz });
    if (!h) continue;
    for (const r of h.raundlar) {
      assert.equal(r.tur, 'tartib'); assert.ok(!r.variantlar.every((v, i) => v.k === r.togri[i]), 'aralashtirilgan');
      if (y === '2-3') assert.equal(r.togri.length, 3);
    }
    const n = tekshir(h, h.raundlar[0].togri); assert.equal(n.togri, true);
    const g = raundGapi(h, { izoh: iz, til: 'uz', birinchi: true }); assert.ok(g.length > 20 && !g.includes('{'));
  }
});
import { birinchiHarf, boginSoni } from './oyinRules.js';
test('REV351: eshitish o‘yinlari', () => {
  assert.equal(birinchiHarf('shaftoli', 'uz'), 'Sh'); assert.equal(birinchiHarf('o‘rdak', 'uz'), 'O‘'); assert.equal(birinchiHarf('Katze', 'de'), 'K');
  assert.equal(boginSoni('mushuk', 'uz'), 2); assert.equal(boginSoni('o‘rdak', 'uz'), 2); assert.equal(boginSoni('кошка', 'ru'), 2); assert.equal(boginSoni('kamalak', 'uz'), 3);
  for (const id of [121, 123, 142, 118, 120]) for (const y of ['2-3', '4-5', '6-7']) for (const iz of ['uz', 'ru', 'en', 'de', 'es']) {
    const h = oyinYasa(id, { elementlar: [], yosh: y, urug: 5, izoh: iz });
    if (!h) continue;
    for (const r of h.raundlar) {
      assert.ok(r.variantlar.some((v) => v.k === r.togri), `${id} ${y} ${iz}`);
      if (id === 118) { const t = r.variantlar.find((v) => v.k === r.togri).el; assert.equal(birinchiHarf(t.uz, iz), r.savol.harf);
        assert.ok(r.variantlar.filter((v) => birinchiHarf(v.el.uz, iz) === r.savol.harf).length === 1, 'faqat bittasi shu harfdan'); }
      if (id === 120) assert.equal(r.togri, `n:${boginSoni(r.savol.el.uz, iz)}`);
    }
    assert.ok(!raundGapi(h, { izoh: iz, til: 'uz', birinchi: true }).includes('{'));
  }
  assert.equal(oyinYasa(120, { elementlar: [], yosh: '6-7', izoh: 'en' }), null);   // bo'g'in — faqat o'zbek va rus tilida
});
import { kirishDarajasi, oynadi, necha } from './tanishlik.js';
test('REV360: yangi o‘yin — Kabu ko‘rsatadi, keyin qisqa eslatma, keyin tushuntirishsiz', () => {
  assert.equal(kirishDarajasi(0), 'korsat'); assert.equal(kirishDarajasi(2), 'eslat'); assert.equal(kirishDarajasi(4), 'yoq');
  const m = new Map(); const s = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
  oynadi(116, s); oynadi(116, s); assert.equal(necha(116, s), 2);
  const el3 = [{ emoji: '🐈', uz: 'mushuk' }, { emoji: '🐕', uz: 'it' }, { emoji: '🥛', uz: 'sut' }];
  const k = oyinYasa(116, { elementlar: el3, yosh: '4-5', urug: 1, kirishDaraja: 'korsat' }); assert.match(raundGapi(k, { izoh: 'uz', til: 'uz', birinchi: true }), /ko‘rsataman|men topaman/);
  const y = oyinYasa(116, { elementlar: el3, yosh: '4-5', urug: 1, kirishDaraja: 'yoq' }); assert.ok(!raundGapi(y, { izoh: 'uz', til: 'uz', birinchi: true }).includes('Men aytaman'));
});
