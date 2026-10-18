import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TURLAR } from './kid/jonli/jonliRules.js';

const src = fs.readFileSync(new URL('./kid/jonli/jonliRasm.js', import.meta.url), 'utf8');

test('REV149: chizilgan rasmlar — har import qilingan fayl bor va 400 KB dan kichik', () => {
  const fayllar = [...src.matchAll(/from "\.\/(rasm\/[^"]+\.webp)"/g)].map((m) => m[1]);
  assert.ok(fayllar.length >= 25, `rasmlar: ${fayllar.length}`);
  for (const f of fayllar) {
    const st = fs.statSync(new URL(`./kid/jonli/${f}`, import.meta.url));
    assert.ok(st.size > 1000 && st.size < 400_000, `${f}: ${st.size}`);
  }
});

test('REV149: har o‘yin turining o‘z sahnasi (fon) bor, Kabu 6 pozada', () => {
  const fon = /JONLI_FON = \{([^}]+)\}/.exec(src)[1];
  for (const t of TURLAR) assert.match(fon, new RegExp(`\\b${t.id}: JR\\.fon_`), `${t.id} fonsiz`);
  for (const p of ['salom', 'tingla', 'qarsak', 'korsat', 'hurra', 'zor']) assert.match(src, new RegExp(`kabu_${p}: r_kabu_${p}`));
});

test('REV149: emoji o‘rniga rasm — qo‘l, o‘q, savat, quti, buta, yulduzlar', () => {
  const j = fs.readFileSync(new URL('./kid/jonli/JonliOyin.jsx', import.meta.url), 'utf8');
  for (const k of ['JR.savat', 'JR.quti', 'JR.buta', 'JR.loy', 'JR.kopik', 'JR.yulduz', 'JR.konfetti', 'JR.qol']) assert.ok(j.includes(k), k);
  assert.ok(!j.includes('<span>📦</span>') && !j.includes('<span>🧺</span>'));
  assert.ok(fs.readFileSync(new URL('./kid/harakat/HarakatSahna.jsx', import.meta.url), 'utf8').includes('JR.qol'));
  assert.ok(fs.readFileSync(new URL('./kid/xonalar/TilXonalari.jsx', import.meta.url), 'utf8').includes('JR.strelka'));
});
