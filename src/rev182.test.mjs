// REV182: telefonda hamma narsa ekranga sig'adi va o'qiladigan: tugmalar katta, doska yozuvi 0.7 dan kichraymaydi, mayda yozuvlar yo'q
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const o = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');

test('telefonda dars sahifasi ochilishi bilan to\'liq ekran (surib qidirish kerak emas), ✕ darsdan chiqaradi', () => {
  const dx = o('./lesson/DarsXonasi.jsx');
  assert.match(dx, /\(telefon && mode === "idle" && !error\)/);
  assert.match(dx, /focus && !\(mode === "idle" && onClose\) \? exitLesson/);
});

test('doska yozuvi 0.7 dan kichraymaydi; sig\'masa doska suriladi va hozirgi qator ko\'rinadi', () => {
  const dx = o('./lesson/DarsXonasi.jsx');
  assert.match(dx, /z > 0\.7; k\+\+/);
  assert.match(dx, /is-sigmas/);
});

test('telefonda tugmalar 15px va kamida 40px; sarlavha osti yozuvi yashirin; 9px yozuvlar yo\'q', () => {
  const css = o('./lesson/dars-xonasi.css');
  assert.match(css, /\.dx-root\.dx-root\.dx-root\.dx-yotiq>\.dx-controls \.dx-btn\{font-size:15px;min-height:40px/);
  assert.match(css, /\.dx-root\.dx-root\.dx-root\.dx-focus:not\(\.dx-yotiq\)>\.dx-controls \.dx-btn\{font-size:15px;min-height:40px/);
  const idx = o('./index.css');
  assert.doesNotMatch(idx, /font-size: ?9px/);
  assert.match(idx, /\.text-\\\[9px\\\],\.text-\\\[10px\\\]\{font-size:11\.5px!important/);
});

test('klaviatura ochilganda butun topshiriq kartasi tepaga chiqadi', () => {
  assert.match(o('./maktab/TilKlaviatura.jsx'), /closest\("\.mm-card"\)/);
});
