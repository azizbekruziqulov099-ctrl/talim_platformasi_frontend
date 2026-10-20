import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { doskaBandlari, faolRasm, sanoqKarta } from './kid/kidStageRules.js';
import { OGIZ, ogizShakli, ritmShakli, unlilar } from './kid/lipSync.js';

const src = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');

test('REV153: doskadagi har narsa alohida band — hammasi chiqadi (6 tagacha)', () => {
  assert.deepEqual(doskaBandlari('👋 Hello!\nпривет\n🙋 Hi!\nпривет').map((b) => [b.emoji, b.soz]), [['👋', 'Hello'], ['🙋', 'Hi']]);
  assert.deepEqual(doskaBandlari('🟢 Green, 👏 Clap').map((b) => b.soz), ['Green', 'Clap']);
  assert.deepEqual(doskaBandlari('🚪 Bye!  🙏 Thank you!').map((b) => b.soz), ['Bye', 'Thank you']);
  assert.deepEqual(doskaBandlari('🍎 Apple — olma\n🍌 Banana — banan\n🍇 Grapes\n🍊 Orange').map((b) => b.soz), ['Apple', 'Banana', 'Grapes', 'Orange']);
  assert.equal(doskaBandlari('🔴 Red\n🔵 Blue\n🟢 Green\n🟡 Yellow\n⚪ White\n⚫ Black\n🟣 Purple').length, 6);
  assert.equal(doskaBandlari('🕊️ Bye и Thank you').length, 0, 'sarlavha belgisi (🕊) band emas');
  assert.deepEqual(doskaBandlari('🧸🍎 Thank you!\n🧸🚪 Bye!').map((b) => [b.emoji, b.soz]), [['🧸🍎', 'Thank you'], ['🧸🚪', 'Bye']]);
});

test('REV153: sanoq va naqsh — karta (rasm emas)', () => {
  assert.equal(sanoqKarta('🍎🍎🍎'), true);
  assert.equal(sanoqKarta('🔴🔵🔴🔵❓'), true);
  assert.equal(sanoqKarta('3️⃣'), true);
  assert.equal(sanoqKarta('🍎'), false);
  assert.equal(sanoqKarta('🧸🍎'), false);
});

test('REV153: ustoz qaysini aytayotgan bo\'lsa — o\'sha rasm faol', () => {
  const pics = [{ soz: 'Hello', emoji: '👋' }, { soz: 'Hi', emoji: '🙋' }];
  const gap = '[ru]Помнишь? 👋 Это —[/ru] [en]Hello![/en][ru], то есть привет. Скажи со мной:[/ru] [en]Hello![/en] [ru]🙋 Это —[/ru] [en]Hi![/en][ru], то есть привет.[/ru]'.split(/\s+/);
  assert.equal(faolRasm(pics, gap, -1), -1, 'gapirmayapti — hammasi teng');
  assert.equal(faolRasm(pics, gap, 0), -1, 'hali hech biri aytilmadi');
  assert.equal(faolRasm(pics, gap, 2), 0, '👋 — Hello');
  assert.equal(faolRasm(pics, gap, 9), 0);
  assert.equal(faolRasm(pics, gap, 11), 0, 'yana Hello');
  assert.equal(faolRasm(pics, gap, 12), 1, '🙋 — Hi');
  assert.equal(faolRasm(pics, gap, gap.length - 1), 1);
  assert.equal(faolRasm(pics, [], -1, 'Hello'), 0, 'bola «Hello» ni aytishi kerak — Hello kattalashadi');
  assert.equal(faolRasm(pics, [], -1, 'Hi'), 1);
  const ty = [{ soz: 'Bye' }, { soz: 'Thank you' }];
  assert.equal(faolRasm(ty, 'Мы выучили [en]Bye![/en], [en]Thank you![/en]'.split(' '), 4), 1, 'ikki so\'zli ibora');
  assert.equal(faolRasm([{ soz: 'Hello' }], ['Hello'], 0), -1, 'bitta rasm — kattalashtirish shart emas');
});

test('REV153: og\'iz — 10 shakl, unliga qarab', () => {
  assert.equal(OGIZ.length, 10);
  assert.deepEqual(unlilar('Hello!'), ['e', 'o']);
  assert.deepEqual(unlilar('[ru]Привет[/ru]'), ['i', 'e']);
  assert.deepEqual(unlilar("O'zbekiston"), ['o', 'e', 'i', 'o']);
  const h = { soz: 'Bye', bogin: 0, past: true };
  assert.equal(ogizShakli(null, 0, h), 0);
  assert.equal(ogizShakli(0.05, 0.5, h), 1, 'ovoz to\'xtadi — lablar yopiladi');
  const k = ogizShakli(0.8, 0, { soz: 'ma', bogin: 0, past: true });
  assert.equal(k, 3, 'baland «a» — keng ochiq');
  assert.equal(ogizShakli(0.8, 0, { soz: 'do', bogin: 0, past: true }), 6, 'baland «o» — katta o');
  assert.equal(ogizShakli(0.3, 0, { soz: 'see', bogin: 0, past: true }), 7);
  for (let i = 0; i < 12; i++) { const f = ritmShakli(i, 'Salom'); assert.ok(f >= 0 && f < 10); }
  for (const t of ['ayol', 'erkak']) for (let i = 0; i < 10; i++) assert.ok(fs.statSync(new URL(`./kid/ustoz/og/og_${t}_${i}.webp`, import.meta.url)).size < 20000);
});

test('REV153: SVG stiker darsda ishlatilmaydi (REV156: jonli SVG Kabu foydalanuvchi so\'rovi bilan qaytdi)', () => {
  assert.doesNotMatch(src('./lesson/DarsXonasi.jsx'), /stickerUrl|stickers\.js/);
  assert.doesNotMatch(src('./kid/optionPic.js'), /stickerUrl|stickers\.js/);
  assert.match(src('./kid/RobotKabu.jsx'), /KABU_MARKUP/);
  assert.doesNotMatch(src('./kid/KidStage.jsx'), /<svg/);
  const u = src('./kid/ustozlar.js');
  assert.match(u, /og: \{ x: /);
  assert.match(src('./kid/UstozSahna.jsx'), /us-og/);
});

test('REV153: so\'z istalgan tilda yoki tarjimasi bo\'yicha chizilgan rasm topiladi', async () => {
  const { matnId, emojiRasm } = await import('./kid/rasmHarakat.js');
  assert.equal(matnId('qizil'), 'd_red');
  assert.equal(matnId('أَحْمَر'), 'red');
  assert.equal(matnId('der Apfel'), 'apple');
  assert.equal(matnId('кошка'), 'cat');
  assert.equal(matnId('salom! isming nima?'), 'd_hello');
  assert.equal(matnId('to\'xtaymiz'), null);
  assert.deepEqual(doskaBandlari('🔴 أَحْمَر\nahmar\nqizil')[0].mano, ['ahmar', 'qizil']);
  assert.equal(emojiRasm('🔴', { d_red: 'r.webp' })?.id, 'd_red', 'xona rasmi yo\'q — dars rasmi');
  assert.equal(emojiRasm('⭐', { j_yulduz: 'y.webp' })?.id, 'j_yulduz');
  assert.equal(sanoqKarta('🎂❓'), false, 'ibora — sanoq emas');
});

test('REV154: yuklanmagan rasm qayta so\'raladi, service worker rasmni ushlamaydi', async () => {
  const { qaytaManzil } = await import('./pwa/rasmTiklash.js');
  assert.equal(qaytaManzil('https://a.uz/assets/x-AB12CD.webp', 'k1'), 'https://a.uz/assets/x-AB12CD.webp?r=k1');
  assert.equal(qaytaManzil('data:image/webp;base64,AAA'), null);
  assert.equal(qaytaManzil(''), null);
  const sw = fs.readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(sw, /request\.destination === "image"/);
  assert.match(sw, /event\.waitUntil\(caches\.open/);
  assert.match(src('./main.jsx'), /rasmTiklashniYoq\(\)/);
});
