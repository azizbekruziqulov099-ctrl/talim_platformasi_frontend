import test from 'node:test';
import assert from 'node:assert/strict';
import { filterUniversitySubjects, initialUniversityFilter, universityBrowseActive, universityOptions } from './universityFilters.js';

const S = [
  { nom: 'Matematika', mine: true, institution_id: 11, institution_name: 'SamDPI', yonalish_nomi: 'Boshlang‘ich ta’lim', talim_shakli: 'kunduzgi', talim_tili: 'uz' },
  { nom: 'Fizika', mine: false, institution_id: 12, institution_name: 'TDPU', yonalish_nomi: 'Fizika', talim_shakli: 'sirtqi', talim_tili: 'ru' },
  { nom: 'Pedagogika', mine: false, institution_id: 0, institution_name: '', yonalish_nomi: 'Umumiy fanlar', talim_shakli: 'umumiy', talim_tili: 'uz' },
];

test('sozlangan talaba «Mening yo‘nalishim» bilan boshlaydi, sozlanmagan — hammasi', () => {
  assert.equal(initialUniversityFilter({ profil_toliq: true }).mine, true);
  assert.equal(initialUniversityFilter({ profil_toliq: false }).mine, false);
  assert.deepEqual(filterUniversitySubjects(S, initialUniversityFilter({ profil_toliq: true })).map((s) => s.nom), ['Matematika']);
  assert.equal(filterUniversitySubjects(S, initialUniversityFilter({})).length, 3);
});

test('institut, yo‘nalish, shakl va til filtrlari; umumiy shakl har shaklda chiqadi', () => {
  const base = initialUniversityFilter({});
  assert.deepEqual(filterUniversitySubjects(S, { ...base, institution: '12' }).map((s) => s.nom), ['Fizika']);
  assert.deepEqual(filterUniversitySubjects(S, { ...base, institution: '0' }).map((s) => s.nom), ['Pedagogika']);
  assert.deepEqual(filterUniversitySubjects(S, { ...base, form: 'sirtqi' }).map((s) => s.nom), ['Fizika', 'Pedagogika']);
  assert.deepEqual(filterUniversitySubjects(S, { ...base, language: 'ru' }).map((s) => s.nom), ['Fizika']);
  const options = universityOptions(S);
  assert.deepEqual(options.institutions.map(([id]) => id).sort(), ['0', '11', '12']);
  assert.ok(!options.forms.some(([key]) => key === 'umumiy'));
});

test('faqat talaba va universitet bo‘limida', () => {
  assert.equal(universityBrowseActive({ barcha_institutlar: true }, 'universitet'), true);
  assert.equal(universityBrowseActive({ barcha_institutlar: true }, 'maktab'), false);
  assert.equal(universityBrowseActive({ admin: true }, 'universitet'), false);
});
