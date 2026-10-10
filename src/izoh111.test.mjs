import test from 'node:test';
import assert from 'node:assert/strict';
import { darsIzohi, darsTiliIzoh, gap, izohTeg } from './kid/izohTil.js';
import { ochilish } from './kid/darsOchilishi.js';
import { voiceCoach, voicePrompt } from './lesson/voiceCheckRules.js';
import { kindCue } from './kid/kidStageRules.js';

test('izoh tili va o‘rganiladigan til aniqlanadi', () => {
  const ru = [{ ovoz: '[ru]Смотри, это —[/ru] [en]Hello![/en] [ru]По-русски — привет.[/ru]' }];
  assert.equal(darsIzohi(ru), 'ru');
  assert.equal(darsTiliIzoh(ru, 'ru'), 'en');
  const uz = [{ ovoz: 'Qara, bu — [en]Hello![/en]' }];
  assert.equal(darsIzohi(uz), 'uz');
  assert.equal(darsTiliIzoh(uz, 'uz'), 'en');
  const ruru = [{ ovoz: '[ru]Смотри, это — Привет! По-русски.[/ru] [ru]Привет![/ru]' }];
  assert.equal(darsTiliIzoh(ruru, 'ru'), 'ru');
});

test('ustoz gapi izoh tilida va teg bilan', () => {
  assert.equal(gap('ru', 'Endi sen ayt: {p}', { p: '[en]Hi![/en]' }), '[ru]Теперь ты скажи:[/ru] [en]Hi![/en]');
  assert.equal(gap('uz', 'Endi sen ayt: {p}', { p: '[en]Hi![/en]' }), 'Endi sen ayt: [en]Hi![/en]');
  assert.equal(izohTeg('Hello [ru]Привет[/ru] there', 'en'), '[en]Hello[/en] [ru]Привет[/ru] [en]there[/en]');
  assert.equal(voicePrompt({ lang: 'en', phrase: 'Cat' }, true, 1, 'en'), '[en]Say it one more time: Cat[/en]');
  const c = voiceCoach({ lang: 'de', phrase: 'Katze' }, true, { heard: 'kase', stars: 1, hasClip: true, izoh: 'ru' });
  assert.match(c.before, /^\[ru\]Почти получилось! Ты сказал так:\[\/ru\]$/);
  assert.equal(kindCue('review', 'new', '', '', 'en'), '[en]Let’s remember![/en]');
});

test('dars boshi — rus izohida o‘zbekcha so‘z qolmaydi', () => {
  const st = ochilish({ ustoz: 'malika', til: 'en', izoh: 'ru', havo: 'yomgir', grade: '5-6 yosh',
    oldingi: { mavzu: 'Животные', til: 'en', sozlar: [{ say: 'cat', emoji: '🐱' }] } });
  for (const s of st) {
    const rest = s.ovoz.replace(/\[(\w\w)\][\s\S]*?\[\/\1\]/g, ' ');
    assert.doesNotMatch(rest, /\p{L}/u, s.ovoz);
    assert.doesNotMatch(s.ovoz, /\b(Bugun|qara|Esingdami|nima)\b/);
  }
});
