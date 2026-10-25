// REV176: imtihonlar (4 ko'nikma: haftalik, oylik, joylashtirish), sinfxonada doskaga sig'dirish, ustoz savolni o'qiydi
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SINFLAR } from './maktab/index.js';
import { hovuz, imtihonTuz, joylashtirishTuz, natijaHisob, joyDarajasi, imtihonYoz, imtihonlar, buHaftaTopshirildi, joyBilanDaraja, JOY_SONI } from './maktab/imtihonRules.js';
import { darajaHisob } from './maktab/darajaRules.js';
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const xotira = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };
let seed = 7; const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

test('hovuz: shu hafta ko‘rilgan so‘zlar; kam bo‘lsa — o‘z sinfidan', () => {
  const b = SINFLAR[6].bolimlar[0];
  const srs = Object.fromEntries(b.sozlar.map((w) => [w.id, { quti: 1, oxirgi: 100 }]));
  const h = hovuz({ srs, kun: 7, sinf: 7, bugun: 103 });
  assert.equal(h.yangi, 10);
  assert.ok(b.sozlar.every((w) => h.sozlar.includes(w)));
  assert.ok(h.gaplar.length >= 3);
  assert.equal(hovuz({ srs, kun: 7, sinf: 3, bugun: 200 }).yangi, 0);   // eski — sinf so'zlari
  assert.ok(hovuz({ srs: {}, sinf: 3, bugun: 200 }).sozlar.every((w) => w.id.startsWith('s3_')));
});

test('haftalik imtihon 4 ko‘nikma; mikrofon yo‘q — gapirishsiz; variantlarda bir xil ma’no yo‘q', () => {
  const b = SINFLAR[4].bolimlar;
  const sozlar = b.flatMap((x) => x.sozlar), gaplar = b.flatMap((x) => x.gaplar);
  const q = imtihonTuz({ sozlar, gaplar, turi: 'haftalik', rng });
  const k = (n) => q.filter((x) => x.konikma === n).length;
  assert.deepEqual([k('tinglash'), k('oqish'), k('yozish'), k('gapirish')], [4, 4, 3, 3]);
  assert.equal(imtihonTuz({ sozlar, gaplar, mikBor: false, rng }).filter((x) => x.konikma === 'gapirish').length, 0);
  for (const x of q.filter((y) => y.variantlar)) {
    const m = x.variantlar.map((v) => v.w.uz.toLowerCase());
    assert.equal(new Set(m).size, m.length);
    assert.ok(x.variantlar.some((v) => v.id === (x.soz || x.gap).id));
  }
  const ids = q.filter((x) => x.soz).map((x) => x.soz.id);
  assert.equal(new Set(ids).size, ids.length);   // bir so'z ikki marta so'ralmaydi
  assert.equal(imtihonTuz({ sozlar, gaplar, turi: 'oylik', rng }).length, 21);
});

test('natija: ko‘nikma foizlari, baho; joylashtirish — ketma-ket daraja va tavsiya sinf', () => {
  const r = natijaHisob([{ konikma: 'tinglash', ball: 1 }, { konikma: 'tinglash', ball: 0 }, { konikma: 'yozish', ball: 0.5 }, { konikma: 'yozish', ball: 1 }]);
  assert.deepEqual(r.foiz, { tinglash: 50, yozish: 75 });
  assert.equal(r.umumiy, 63);
  assert.equal(r.baho, 3);
  const joy = joylashtirishTuz({ rng });
  assert.equal(joy.length, JOY_SONI * 4);
  assert.deepEqual([...new Set(joy.map((x) => x.daraja))], [0, 1, 2, 3]);
  const j = (d, b) => Array.from({ length: 4 }, () => ({ konikma: 'tinglash', ball: b, daraja: d }));
  assert.deepEqual(joyDarajasi([...j(0, 1), ...j(1, 1), ...j(2, 0.25)]), { daraja: 'A1', indeks: 1, tavsiyaSinf: 5 });
  assert.deepEqual(joyDarajasi(j(0, 0)), { daraja: null, indeks: -1, tavsiyaSinf: 1 });
  assert.equal(joyDarajasi([...j(0, 1), ...j(1, 1), ...j(2, 1), ...j(3, 1)]).tavsiyaSinf, 10);
  const d = joyBilanDaraja(darajaHisob({}, {}), 'A2');
  assert.equal(d.daraja, 'A2'); assert.equal(d.keyingi, 'B1'); assert.equal(d.joy, true);
  assert.equal(joyBilanDaraja(darajaHisob({}, {}), null).daraja, null);
});

test('imtihon natijalari saqlanadi; haftalik — shu hafta topshirilganmi', () => {
  const st = xotira();
  imtihonYoz('en', 'haftalik', { umumiy: 80, baho: 4 }, st, 500);
  assert.equal(imtihonlar('en', st).haftalik.umumiy, 80);
  assert.equal(imtihonlar('ru', st).haftalik, undefined);
  assert.equal(buHaftaTopshirildi({ kun: 500 }, 502, 3), true);    // chorshanba, dushanbada topshirgan
  assert.equal(buHaftaTopshirildi({ kun: 495 }, 502, 3), false);   // o'tgan hafta
});

test('integratsiya: imtihon kartalari, sinfxonada doskaga sig‘dirish, ustoz test savolini o‘qiydi, miya nomi bo‘yicha qidiruv', () => {
  const m = src('./maktab/MaktabTil.jsx');
  assert.match(m, /<Imtihon /);
  assert.match(m, /setImtihon\("joylashtirish"\)/);
  const d = src('./lesson/DarsXonasi.jsx');
  assert.match(d, /--dx-sig/);
  assert.match(d, /Savolni tinglang va javobni tanlang\./);
  assert.match(src('./lesson/dars-xonasi.css'), /\.us-teacher\{left:auto;right:\.5%\}/);
  assert.match(src('./maktab/Imtihon.jsx'), /KORSATMA\[q\.tur\]/);
});

import { sinfJoyi } from "./lesson/maktabMashqRules.js";
import { XONALAR } from "./kid/ustozlar.js";
test("REV176: doska deraza va devor soatini to'smaydi, ustoz derazaga qarama-qarshi", () => {
  for (const [k, x] of Object.entries(XONALAR)) {
    const j = sinfJoyi(k); const d = j.doska;
    const oyna = x.deraza;
    if (oyna) assert.ok(d.l >= oyna.l + oyna.w - 0.5 || d.l + d.w <= oyna.l + 0.5, `${k}: doska derazani to'smaydi`);
    if (x.soat) { const rx = x.soat.w / 2, ry = rx * 1586 / 992, sx = x.soat.x, sy = x.soat.y; assert.ok(sx + rx <= d.l || sx - rx >= d.l + d.w || sy + ry <= d.t || sy - ry >= d.t + d.h, `${k}: soat to'liq ochiq (REV177: chetlari ham)`); }
    assert.equal(j.ustoz, (oyna?.l ?? 0) + (oyna?.w ?? 0) / 2 > 50 || k === "matematika" ? "chap" : "ong", k);
    assert.ok(j.gap.t + j.gap.h <= 100.5);
  }
});
