import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// REV324: bog'cha o'yinlari uchun SVG rasmlar — tuzilma, hajm, yozuvsizlik va index.js tekshiruvi.
const DIR = dirname(fileURLToPath(import.meta.url));
const NOMLAR = [
  'sandiq_yopiq', 'sandiq_ochiq', 'quti_sehrli', 'kalit_oltin', 'qulf', 'savat_bosh', 'savat_tola', 'likopcha', 'karta_orqa', 'karta_old', 'eshik_yopiq', 'eshik_ochiq', 'yulduz_tugma', 'pufak_gap', 'mikrofon_katta', 'qolcha_belgi', 'belgi_tanlov_ha', 'belgi_tanlov_yoq', 'shar', 'kubik_tosh',
  'poyezd_lokomotiv', 'poyezd_vagon', 'taqvim_varaq', 'oy_kartasi_qish', 'oy_kartasi_bahor', 'oy_kartasi_yoz', 'oy_kartasi_kuz', 'daraxt_qish', 'daraxt_bahor', 'daraxt_yoz', 'daraxt_kuz', 'fasl_gildirak', 'termometr', 'soat_bosh', 'kun_quyosh', 'tun_oy', 'kamalak', 'bulut_hayvon', 'tort_sham', 'sham_ochgan',
  'tarozi_teng', 'tarozi_chap', 'zina', 'qurbaqa', 'kuchuk_qidir', 'suyak', 'svetofor_qizil', 'svetofor_yashil', 'domino', 'tanga', 'dokon_peshtaxta', 'raketa', 'raketa_uchgan', 'robot_yol', 'bayroqcha_marra', 'tayoqcha_10', 'tayoqcha', 'chiqindi_qutilar', 'gul_urug', 'gul_osib', 'gul_ochilgan', 'orkestr_set',
  'stiker_quyon', 'stiker_fil', 'stiker_dinozavr', 'stiker_kaptar', 'stiker_raketa', 'stiker_gul', 'medal_oltin', 'kubok', 'diplom', 'albom', 'toj', 'konfetti_parcha',
];
const LIMIT = 6 * 1024;
const svg = (n) => readFileSync(join(DIR, `${n}.svg`), 'utf8');

test('REV324: ro‘yxatdagi har bir rasm bor, ortiqcha SVG yo‘q', () => {
  assert.equal(new Set(NOMLAR).size, NOMLAR.length, 'nomlar takrorlanmasin');
  const bor = readdirSync(DIR).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)).sort();
  assert.deepEqual(bor, [...NOMLAR].sort());
});

test('REV324: har SVG — viewBox 0 0 256 256, matn yo‘q, 6 KB dan kichik', () => {
  for (const n of NOMLAR) {
    const s = svg(n);
    const kb = statSync(join(DIR, `${n}.svg`)).size;
    assert.ok(kb < LIMIT, `${n}.svg hajmi ${kb} bayt (6 KB dan katta)`);
    assert.match(s, /^<svg [^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, `${n}: <svg> bilan boshlanadi`);
    const ochilish = s.match(/^<svg [^>]*>/)[0];
    assert.match(ochilish, /viewBox="0 0 256 256"/, `${n}: viewBox`);
    assert.equal((s.match(/viewBox=/g) || []).length, 1, `${n}: bitta viewBox`);
    assert.doesNotMatch(s, /<text|<tspan|<textPath/i, `${n}: yozuv bo‘lmasin`);
    assert.doesNotMatch(s, /<image|<script|<foreignObject|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i, `${n}: tashqi narsa yo‘q`);
    assert.doesNotMatch(s, /<rect x="0" y="0" width="256" height="256"/, `${n}: fon shaffof bo‘lsin`);
    assert.match(s.trim(), /<\/svg>$/, `${n}: yopilgan`);
  }
});

test('REV324: kamalak — 7 ta alohida yoy r1..r7, vagon tanasi oq', () => {
  const k = svg('kamalak');
  for (let i = 1; i <= 7; i++) assert.equal((k.match(new RegExp(`<path id="r${i}"`, 'g')) || []).length, 1, `r${i}`);
  assert.match(svg('poyezd_vagon'), /<rect [^>]*fill="#F4F7FC"[^>]*id="tana"/);
});

test('REV324: index.js — har rasm import qilingan va OYIN_RASM ichida', () => {
  const js = readFileSync(join(DIR, 'index.js'), 'utf8');
  const blok = js.match(/export const OYIN_RASM = \{([\s\S]*?)\};/);
  assert.ok(blok, 'export const OYIN_RASM topilmadi');
  const kalitlar = blok[1].split('\n').map((l) => l.replace(/\/\/.*$/, '').trim()).filter(Boolean).map((l) => l.replace(/,$/, '').split(':')[0].trim());
  assert.deepEqual([...kalitlar].sort(), [...NOMLAR].sort());
  for (const n of NOMLAR) assert.ok(js.includes(`import ${n} from "./${n}.svg";`), `${n} import`);
});

test('REV324: korinish.html hamma rasmni ko‘rsatadi', () => {
  const h = readFileSync(join(DIR, 'korinish.html'), 'utf8');
  for (const n of NOMLAR) assert.ok(h.includes(`"${n}"`), `${n} korinish.html da yo‘q`);
});
