import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { darsBoshi, stepKind } from './kid/kidStageRules.js';

const st = (sarlavha, turi = 'tushuncha', sahna) => ({ sarlavha, turi, ...(sahna ? { sahna } : {}) });

test('REV130: only the previous topic is reviewed — later review blocks are dropped and moved to the start', () => {
  const steps = [
    st('🍂 Qish', 'kirish'),
    st('🔁 Eslaymiz: 🍁 barg 🧺 savat'),            // 1 dars oldingi — qoladi
    st('🔁 Eslaymiz: ⭐ yulduz 😴 uyqu'),            // 3 dars oldingi — olib tashlanadi
    st('❄️ qor'), st('⛄ qorbobo'), st('🎲 Top-chi', 'topshiriq'), st('🌟 Bugun o‘rgandik', 'xulosa'),
  ];
  const { takror, qolgan } = darsBoshi(steps, 'Qish');
  assert.deepEqual(takror.map((s) => s.sarlavha), ['🔁 Eslaymiz: 🍁 barg 🧺 savat']);
  assert.deepEqual(qolgan.map((s) => s.sarlavha), ['🍂 Qish', '❄️ qor', '⛄ qorbobo', '🎲 Top-chi', '🌟 Bugun o‘rgandik']);
  assert.ok(!qolgan.some((s) => stepKind(s) === 'review'));
});

test('REV130: split review chunks (no title, same scene) stay together; English titles too', () => {
  const steps = [st('Intro', 'kirish'), { sarlavha: '🔁 Remember: cat', turi: 'tushuncha', sahna: 'r1' }, { turi: 'tushuncha', sahna: 'r1' },
    { sarlavha: '🔁 Remember: dog', turi: 'tushuncha', sahna: 'r2' }, { turi: 'tushuncha', sahna: 'r2' }, st('🐦 bird')];
  const { takror, qolgan } = darsBoshi(steps, 'Animals');
  assert.equal(takror.length, 2);
  assert.deepEqual(qolgan.map((s) => s.sarlavha), ['Intro', '🐦 bird']);
});

test('REV130: a whole review topic and lessons without review are unchanged', () => {
  const steps = [st('🔁 1-bo‘lim: takrorlaymiz', 'kirish'), st('🔁 Eslaymiz: a'), st('🔁 Eslaymiz: b')];
  assert.deepEqual(darsBoshi(steps, '1-bo‘lim takrori: salom, yana!'), { takror: [], qolgan: steps });
  const oddiy = [st('Salom', 'kirish'), st('🐱 mushuk')];
  assert.deepEqual(darsBoshi(oddiy, 'Hayvonlar'), { takror: [], qolgan: oddiy });
  assert.deepEqual(darsBoshi(undefined, 'x'), { takror: [], qolgan: [] });
});

test('REV130: kindergarten home is a simple subject list — no heavy building/corridor pictures', () => {
  const src = fs.readFileSync(new URL('./kid/BogchaOlami.jsx', import.meta.url), 'utf8');
  assert.ok(!/\.webp/.test(src), 'rasm importi qolmasin');
  assert.ok(!/olamRules/.test(src));
  assert.match(src, /ol-grid/);
});

test('REV130: fast game polling skips hidden pages and overlapping requests', () => {
  for (const f of ['./battle/Bellashuv.jsx', './games/Turnir.jsx', './games/BoardGame.jsx']) {
    const src = fs.readFileSync(new URL(f, import.meta.url), 'utf8');
    assert.match(src, /band\.v \|\| globalThis\.document\?\.hidden/, f);
  }
});

test('REV130: production static server — compression, long cache for hashed assets, SPA fallback, no path escape', async () => {
  const { spawn } = await import('node:child_process');
  const os = await import('node:os');
  const path = await import('node:path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'srv130-'));
  fs.mkdirSync(path.join(dir, 'assets'));
  fs.writeFileSync(path.join(dir, 'index.html'), '<html>' + 'x'.repeat(3000) + '</html>');
  fs.writeFileSync(path.join(dir, 'assets', 'main-AbC12345.js'), 'console.log(1);'.repeat(400));
  const port = 18000 + Math.floor(Math.random() * 1000);
  const srv = spawn(process.execPath, [new URL('../server.mjs', import.meta.url).pathname, '--host', '127.0.0.1', '--port', String(port)], { env: { ...process.env, STATIC_DIR: dir } });
  try {
    for (let i = 0; i < 50; i++) { try { await fetch(`http://127.0.0.1:${port}/healthz`); break; } catch { await new Promise((r) => setTimeout(r, 100)); } }
    const a = await fetch(`http://127.0.0.1:${port}/assets/main-AbC12345.js`, { headers: { 'accept-encoding': 'gzip' } });
    assert.equal(a.status, 200);
    assert.match(a.headers.get('cache-control'), /immutable/);
    assert.equal(a.headers.get('content-encoding'), 'gzip');
    const spa = await fetch(`http://127.0.0.1:${port}/maktab/5`);
    assert.equal(spa.status, 200);
    assert.equal(spa.headers.get('cache-control'), 'no-cache');
    assert.equal((await fetch(`http://127.0.0.1:${port}/assets/yoq-AAAAAAAA.js`)).status, 404);
    const etag = spa.headers.get('etag');
    assert.equal((await fetch(`http://127.0.0.1:${port}/`, { headers: { 'if-none-match': etag } })).status, 304);
  } finally {
    srv.kill();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('REV130: Railway start command keeps working — preview script now runs the static server', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.scripts.preview, 'node server.mjs');
  assert.match(pkg.scripts.start, /^node server\.mjs/);
});
