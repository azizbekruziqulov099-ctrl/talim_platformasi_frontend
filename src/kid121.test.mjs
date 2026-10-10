import test from 'node:test';
import assert from 'node:assert/strict';
import { boardCards, gameTargets, kidStars, lessonWords, questionCard } from './kid/kidStageRules.js';
import { darsTiliIzoh, fanTili } from './kid/izohTil.js';
import { ochilish } from './kid/darsOchilishi.js';
import { ustozFor } from './kid/ustozRules.js';
import { kidSubjectEmoji } from './curriculum/kidTopics.js';
import { dropPraiseAny } from './test/kidQuizRules.js';
import { kidTaskModel } from './lesson/kidLessonRules.js';
import { lessonDone, lessonStars, markLessonDone, nextLessonIndex } from './curriculum/kidProgress.js';

test('REV121: doska kartalari sanoqni saqlaydi, so\'zlar tashlanadi', () => {
  assert.deepEqual(boardCards('🍬🍬🍬➡️🍬  🧒🍬 👧🍬  🍎🍎🍎🍎🍎'), ['🍬🍬🍬➡️🍬', '🧒🍬 👧🍬', '🍎🍎🍎🍎🍎']);
  assert.deepEqual(boardCards('🐱🐱 Bir xil\n🐶 Har xil'), ['🐱🐱', '🐶']);
  assert.deepEqual(boardCards('🕊️ Bir xil hayvonchalar'), []);
  assert.equal(questionCard('[ru]2, 4, 6, ❓ Какое число дальше?[/ru]'), '2, 4, 6, ❓');
  assert.equal(questionCard('Qaysi rasm [en]Cat[/en]?'), '');
});

test('REV121: «Top-chi» o\'yini nishonlari darsdagi so\'zlardan; 2 tadan kam bo\'lsa — o\'yin yo\'q', () => {
  const steps = [{ sarlavha: '🐱🐱 Bir xil' }, { sarlavha: '🍎 [en]Apple[/en] — olma' }, { doska: '🐱🐱  🍎  🐸' }];
  const kinds = ['new', 'new', 'game'];
  assert.equal(lessonWords(steps, kinds).get('🍎'), 'Apple');
  assert.deepEqual(gameTargets(steps[2], steps, kinds).map((t) => t.word), ['Bir xil', 'Apple']);
  assert.deepEqual(gameTargets({ doska: '🐸  🦆' }, steps, kinds), []);
});

test('REV121: yulduz — to\'g\'ri javob bo\'lmasa 0, test yo\'q bo\'lsa 1', () => {
  assert.deepEqual([kidStars(0, 6), kidStars(1, 6), kidStars(3, 6), kidStars(5, 6), kidStars(0, 0)], [0, 1, 2, 3, 1]);
  const mem = new Map();
  const st = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  markLessonDone('a', 0, st);
  assert.equal(lessonStars('a', st), 0);
  assert.ok(lessonDone('a', st));
  assert.equal(nextLessonIndex(['a', 'b'], st), 1);
});

test('REV121: til darsi bo\'lmagan fanlar rus/ingliz izohida ham til o\'rgatmaydi', () => {
  const steps = [{ ovoz: '[ru]Бип-бип! Ну-ка, скажем вместе![/ru]' }];
  assert.equal(darsTiliIzoh(steps, 'ru', 'Matematika (izoh: rus)'), null);
  assert.equal(darsTiliIzoh(steps, 'ru', 'Rus tili (izoh: rus)'), 'ru');
  assert.equal(fanTili('Arab tili (izoh: ingliz)'), 'ar');
  assert.equal(fanTili('Mantiq'), null);
  assert.equal(ustozFor('Mantiq (izoh: rus)'), 'sardor');
  assert.equal(kidSubjectEmoji('Arab tili (izoh: rus)'), '🇸🇦');
  assert.equal(kidSubjectEmoji('Mantiq (izoh: ingliz)'), '🧩');
  assert.match(kidTaskModel('[ru]Игра! Найди две ложки.[/ru]', 'ru'), /продолжаем/);
  assert.equal(dropPraiseAny('[ru]Молодец! Слон больше.[/ru]'), '[ru]Слон больше.[/ru]');
});

test('REV121: kechasi ustoz «quyosh charaqlayapti» demaydi, chiroq yoqiladi', () => {
  const tun = ochilish({ ustoz: 'sardor', til: 'en', izoh: 'uz', havo: 'quyosh', vaqt: 'tun' });
  const havo = tun.find((s) => s._ochilish === 'havo');
  assert.doesNotMatch(havo.ovoz, /quyosh charaqlab|sunny/i);
  assert.match(havo.ovoz, /stars are shining/);
  assert.match(havo.ovoz, /chiroq/i);
  assert.match(tun[0].ovoz, /Good evening/);
  const kun = ochilish({ ustoz: 'sardor', til: 'en', izoh: 'uz', havo: 'quyosh', vaqt: 'kun' });
  assert.match(kun.find((s) => s._ochilish === 'havo').ovoz, /sunny/);
  const ru = ochilish({ ustoz: 'malika', izoh: 'ru', havo: 'quyosh', vaqt: 'kech' });
  assert.match(ru.find((s) => s._ochilish === 'havo').ovoz, /Солнце садится/);
});
