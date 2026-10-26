// REV181: ikki ustoz (izoh tili va o'rganilayotgan til), doskada kim gapirgani, bayroq ko'krakda, ikki ovozli o'qish
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ikkinchiUstoz, IZOH_USTOZ, kokrak, XONA } from './kid/ustozRules.js';
import { sinfJoyi } from './lesson/maktabMashqRules.js';
import { ikkiOvozOqi, navbat } from './speech/ikkiOvoz.js';

test('ikkinchi ustoz: izoh tiliga qarab (uz — Nilufar, ru — Anna, en — Emily); til izoh bilan bir xil bo\'lsa — yo\'q', () => {
  assert.equal(ikkinchiUstoz({ til: 'de', iz: 'uz', ustoz: 'lukas' }), 'nilufar');
  assert.equal(ikkinchiUstoz({ til: 'ar', iz: 'ru', ustoz: 'yusuf' }), 'anna');
  assert.equal(ikkinchiUstoz({ til: 'ko', iz: 'en', ustoz: 'jiwoo' }), 'emily');
  assert.equal(ikkinchiUstoz({ til: 'en', iz: 'en', ustoz: 'emily' }), '');
  assert.equal(ikkinchiUstoz({ til: 'ru', iz: 'ru', ustoz: 'anna' }), '');
  assert.equal(ikkinchiUstoz({ til: '', iz: 'uz', ustoz: 'sardor' }), '');
  assert.equal(ikkinchiUstoz({ til: 'en', iz: 'xx', ustoz: 'emily' }), 'nilufar');   // noma'lum izoh — o'zbek
  assert.deepEqual(Object.keys(IZOH_USTOZ).sort(), ['en', 'ru', 'uz']);
  assert.equal(XONA.lukas, 'til_lukas');
});

test('ikki ustozda doska ular orasidagi butun joyni egallaydi, pastda alohida yozuv oynasi yo\'q', () => {
  for (const x of ['til_lukas', 'onatili', 'atrofolam', 'matematika']) {
    const j = sinfJoyi(x, { juft: true });
    assert.equal(j.doska.l, 19); assert.equal(j.doska.w, 62);
    assert.ok(j.doska.t + j.doska.h <= 95.01, x);
    assert.ok(j.doska.h >= 60, x);
    assert.ok(j.gap.h <= 1);
  }
  const bitta = sinfJoyi('til_lukas');
  assert.ok(bitta.gap.h >= 14);   // bitta ustozda avvalgidek
});

test('bayroq nishoni ko\'krakda: og\'iz/yuz joyidan pastda, rasm ichida', () => {
  const a = kokrak({ og: { x: 53, y: 15 } });
  assert.equal(a.top, '28%'); assert.equal(a.left, '58%');
  const b = kokrak({ yuz: { x: 20, y: 0, w: 60, h: 25 } });
  assert.equal(b.top, '33%'); assert.equal(b.left, '55%');
  const c = kokrak(null);
  assert.ok(parseFloat(c.top) <= 45 && parseFloat(c.left) >= 15);
});

test('ikki ovoz: har bo\'lak o\'z so\'zlovchisida, navbat bilan; onAudio har bo\'lakka (tartibi bilan) beriladi', async () => {
  const urls = [];
  globalThis.Audio = class { set src(u) { this._s = u; } get src() { return this._s; } constructor(u) { if (u) this.src = u; }
    play() { setTimeout(() => this.onended?.(), 5); return Promise.resolve(); } pause() {} };
  const kimlar = [], audio = [];
  await new Promise((res) => {
    ikkiOvozOqi('Bugun yangi so\'z. [de]Guten Morgen![/de] Bu salom degani.', {
      til: 'de', nomzodlar: ['uz', 'de'], url: (m, kim) => { urls.push([kim, m]); return `u:${kim}`; },
      onKim: (k) => kimlar.push(k), onAudio: (a, i, q) => audio.push([i, q.kim]), onEnd: res });
  });
  assert.deepEqual(kimlar, ['iz', 'til', 'iz', null]);
  assert.deepEqual(audio, [[0, 'iz'], [1, 'til'], [2, 'iz']]);
  assert.deepEqual(urls.map((x) => x[0]), ['iz', 'til', 'iz']);
  assert.match(urls[1][1], /\[de\]Guten Morgen!\[\/de\]/);
  delete globalThis.Audio;
});

test('doskadagi qator kimniki: nemischa qator — til ustozi, o\'zbekcha — izoh ustozi', () => {
  const kim = (line) => { let eng = '', uz = -1; for (const x of navbat(line, 'de', ['uz', 'de'])) { const n = x.matn.length; if (n > uz) { uz = n; eng = x.kim; } } return eng; };
  assert.equal(kim('Heute ist Montag, 26. Oktober 2026.'), 'til');
  assert.equal(kim('Bugun 2026-yil 26-oktabr, dushanba.'), 'iz');
});

test('ekranda: ikki ustoz, gapirayotganining og\'zi qimirlaydi, pastdagi yozuv yo\'q, bog\'cha yotiq ekranga sig\'adi', () => {
  const sahna = fs.readFileSync(new URL('./kid/UstozSahna.jsx', import.meta.url), 'utf8');
  assert.match(sahna, /rol="iz"/);
  assert.match(sahna, /us-bayroq/);
  const dx = fs.readFileSync(new URL('./lesson/DarsXonasi.jsx', import.meta.url), 'utf8');
  assert.match(dx, /juftGapiradi\(\)/);
  assert.match(dx, /kabuJuftGapiradi\(\)/);
  assert.match(dx, /is-kim-\$\{/);
  const css = fs.readFileSync(new URL('./lesson/dars-xonasi.css', import.meta.url), 'utf8');
  assert.match(css, /dx-ikki-ustoz:not\(\.dx-kabu-muhit\) \.dx-teacher \.dx-bubble\{display:none\}/);
  assert.match(css, /\.dx-root\.dx-yotiq\.dx-aud-bogcha \.dx-voice\.is-kid\{display:grid/);
  assert.match(css, /\.dx-voice-rasm\{display:grid;place-items:center;width:min\(220px,46vw,24vh\);height:min\(220px,46vw,24vh\)/);
  const vc = fs.readFileSync(new URL('./lesson/VoiceCheck.jsx', import.meta.url), 'utf8');
  assert.match(vc, /KabuJuft/);
});
