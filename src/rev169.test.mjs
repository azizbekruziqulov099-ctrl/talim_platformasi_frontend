// REV169: eski tekis/3D rasmlar o'rniga chizilganlari, xona qismlari aralashmaydi, telefonda bir bosishda tanlanadi,
// bitta chiroq tugmasi, mashina zebra ustiga chiqmaydi, bitta svetofor
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');

test('maktab tillari: avval chizilgan rasm (CHIZILGAN), keyin 3D', () => {
  const m = src('./maktab/MaktabRasm.jsx');   // REV172: Rasm umumiy faylga ko'chdi
  assert.match(m, /RASM_HAMMA\[CHIZILGAN\[w\.id\]\] \|\| \(w\.rasm && MAKTAB_RASM\[w\.rasm\]\)/);
  const c = src('./maktab/chizilgan.js');
  assert.ok((c.match(/": "/g) || []).length > 350);
  assert.doesNotMatch(c, /"(pizza|expensive|score)":/);   // ma'nosi to'g'ri kelmaydigan moslashuvlar yo'q
});

test('xona qismlari: qismdan tashqaridagilar xira va bosilmaydi, o‘qlar sahna ustida emas', () => {
  const t = src('./kid/xonalar/TilXonalari.jsx');
  assert.match(t, /is-qismda/); assert.match(t, /is-tashqi/); assert.match(t, /xo-fokus/);
  const css = src('./kid/xonalar/xonalar.css');
  assert.match(css, /\.xo-item\.is-tashqi, \.xo-hs\.is-tashqi \{ pointer-events: none; \}/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\) \{ \.xo-item:hover/);   // telefonda hover yopishmaydi
  assert.doesNotMatch(css, /\.xo-qism-ot \{[^}]*position: absolute/);
});

test('fokusQuti: qism narsalari atrofida yorug‘ maydon', async () => {
  const s = src('./kid/xonalar/TilXonalari.jsx');
  const body = s.slice(s.indexOf('export function fokusQuti'), s.indexOf('/** REV148: kamera'));
  const fokusQuti = new Function(`${body.replace('export function', 'return function')}`)();
  const q = fokusQuti([{ x: 50, y: 50, s: 10, a: 1 }, { x: 20, y: 30, w: 10, h: 10, hs: true }], 1);
  assert.ok(q.x0 < 15 && q.x1 > 55 && q.y0 < 25 && q.y1 > 55);
  assert.equal(fokusQuti([], 1), null);
});

test('harakat: bitta chiroq tugmasi, bitta svetofor, mashina zebradan oldin to‘xtaydi', () => {
  const s = src('./kid/harakat/sahnalar.jsx');
  assert.doesNotMatch(s, /tugma1/);
  assert.doesNotMatch(s, /svetofor_[qy]/);
  assert.match(s, /lerp\(164, 197, t\)/);
  assert.match(src('./kid/harakat/rasmlar.js'), /piyodalar:/);
});
