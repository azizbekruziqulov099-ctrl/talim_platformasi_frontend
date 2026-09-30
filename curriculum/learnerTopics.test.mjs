import test from 'node:test';
import assert from 'node:assert/strict';
import { filterTopics, subjectStats, topicTarget, viewerHeadline } from './learnerTopicsRules.js';

const subject = { nom: 'Matematika', dars_turi: '', sinflar: [
  { sinf: '5', mavzular: [
    { nomi: 'Oddiy kasr', topic_codes: ['A1', 'A2'], darsli_kodlar: ['A2'], dars_bor: true, savol_soni: 0 },
    { nomi: 'Kasrlarni qo‘shish', topic_codes: ['B1'], darsli_kodlar: [], dars_bor: false, savol_soni: 12 },
  ] },
  { sinf: '6', mavzular: [{ nomi: 'Nisbat', topic_codes: ['C1'], dars_bor: false, savol_soni: 0 }] },
] };

test('search ignores apostrophes and case; empty grades disappear', () => {
  const groups = filterTopics(subject, 'KASRLARNI QOSHISH');
  assert.equal(groups.length, 1);
  assert.equal(groups[0].mavzular[0].nomi, 'Kasrlarni qo‘shish');
});

test('lesson and test filters', () => {
  assert.deepEqual(filterTopics(subject, '', 'dars').flatMap(g => g.mavzular.map(t => t.nomi)), ['Oddiy kasr']);
  assert.deepEqual(filterTopics(subject, '', 'test').flatMap(g => g.mavzular.map(t => t.nomi)), ['Kasrlarni qo‘shish']);
  assert.deepEqual(subjectStats(subject), { topics: 3, lessons: 1, tested: 1 });
});

test('classroom opens the code that actually has a lesson', () => {
  const target = topicTarget(subject, subject.sinflar[0], subject.sinflar[0].mavzular[0], 'maktab');
  assert.equal(target.lesson_code, 'A2');
  assert.equal(target.grade, '5');
  assert.equal(topicTarget(subject, subject.sinflar[0], subject.sinflar[0].mavzular[1], 'maktab').lesson_code, 'B1');
});

test('headline speaks to each learner type', () => {
  assert.match(viewerHeadline({ profile: { yonalish_nomi: 'Boshlang‘ich ta’lim', kurs: 2 } }, 'universitet'), /2-kurs/);
  assert.match(viewerHeadline({}, 'bogcha'), /Bog‘cha/);
  assert.match(viewerHeadline({ teacher: true }, 'maktab'), /Ish joyingiz/);
});
