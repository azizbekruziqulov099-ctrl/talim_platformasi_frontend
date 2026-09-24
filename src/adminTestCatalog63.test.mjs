import test from 'node:test';
import assert from 'node:assert/strict';
import { instituteSelection, selectionFromScope, instituteProgramKey, instituteReadFilters, instituteGrade, searchCatalog, catalogSubjectDetails } from './curriculum/adminTestCatalog.js';

const base = { id: 1, institution_type: 'universitet', institution_id: 11, institution_name: 'Institut A', talim_bosqichi: 'bakalavr', yonalish_id: 7, yonalish_key: 'pedagogika', yonalish_nomi: 'Pedagogika', talim_shakli: 'kunduzgi', talim_tili: 'uz', kurs: 1, semestr: 1, dars_turi: 'maruza', guruh: '' };
const selected = rows => instituteSelection(rows, selectionFromScope(base));

test('two semesters, four lessons and multiple groups require only one course choice', () => {
  const rows = ['maruza', 'amaliy', 'seminar', 'laboratoriya'].flatMap((dars_turi, i) => [1, 2].flatMap(semestr => ['', '101'].map(guruh => ({ ...base, id: `${i}-${semestr}-${guruh}`, dars_turi, semestr, guruh }))));
  const result = selected(rows);
  for (const options of Object.values(result.options)) assert.equal(options.length, 1);
  assert.equal(result.scopes.length, 16);
});

test('form, language and course follow the selected institute and program', () => {
  const tajik = { ...base, id: 2, talim_shakli: 'kechki', talim_tili: 'tj', kurs: 3, semestr: 5 };
  const foreign = { ...base, id: 3, institution_id: 12, institution_name: 'Institut B', yonalish_id: 9, talim_tili: 'ru', kurs: 4, semestr: 7 };
  const rows = [base, tajik, foreign];
  let result = selected(rows);
  assert.deepEqual(result.options.talim_tili.map(o => o.value), ['uz']);
  result = instituteSelection(rows, { ...result.selection, talim_shakli: 'kechki' });
  assert.equal(result.selection.talim_tili, 'tj'); assert.equal(result.selection.kurs, '3');
  assert.equal(result.options.talim_tili[0].label, 'Tojikcha');
  result = instituteSelection(rows, { ...result.selection, institution_id: '12' });
  assert.equal(result.selection.program, instituteProgramKey(foreign));
  assert.equal(result.selection.talim_shakli, 'kunduzgi'); assert.equal(result.selection.talim_tili, 'ru');
  assert.equal(result.selection.kurs, '4'); assert.deepEqual(result.scopes, [foreign]);
});

test('only existing courses are shown in numeric order', () => {
  const rows = [6, 2, 4].map(kurs => ({ ...base, kurs, semestr: 2 * kurs - 1 }));
  const result = selected(rows);
  assert.deepEqual(result.options.kurs.map(o => o.value), ['2', '4', '6']);
  assert.equal(result.selection.kurs, '2');
  assert.equal(instituteSelection(rows, { ...result.selection, kurs: '4' }).scopes[0].kurs, 4);
});

test('official program renames keep one option; manual programs and degrees stay distinct', () => {
  assert.equal(instituteProgramKey(base), instituteProgramKey({ ...base, yonalish_key: 'new-name' }));
  const manual = { ...base, yonalish_id: 0 };
  const rows = [base, { ...base, talim_bosqichi: 'magistr' }, manual, { ...manual, yonalish_key: 'biologiya' }];
  assert.equal(selected(rows).options.program.length, 4);
  assert.equal(instituteGrade(rows[1]), '1 kurs magistr');
});

test('read filters preserve institute zero and never impose lesson/group/semester', () => {
  const common = { ...base, institution_id: 0, yonalish_id: 0 };
  const filters = instituteReadFilters(common);
  assert.equal(filters.institution_id, 0); assert.equal(filters.yonalish_id, 0); assert.equal(filters.yonalish_key, 'pedagogika');
  for (const key of ['scope_id', 'dars_turi', 'semestr', 'guruh']) assert.ok(!(key in filters));
  assert.ok(!('yonalish_key' in instituteReadFilters(base)));
  assert.equal(new URLSearchParams(filters).get('institution_id'), '0');
});

test('empty institutes do not fabricate choices from school rows', () => {
  const result = instituteSelection([{ ...base, institution_type: 'maktab' }]);
  assert.deepEqual(result.scopes, []);
  assert.ok(Object.values(result.options).every(options => options.length === 0));
  assert.equal(instituteReadFilters(result.scopes[0]), null);
});

const subject = (code, changes = {}) => ({ ...base, ...changes, nom: 'Matematika', kalit: code, dars_turi_nomi: 'Ma’ruza', sinflar: [{ sinf: '1 kurs', mavzular: [{ nomi: 'To‘plamlar', topic_codes: [code], scope_id: changes.id || 1, savol_soni: 5 }] }] });
test('general search preserves distinct institutes and exact topic codes', () => {
  const rows = [subject('own'), subject('foreign', { id: 2, institution_id: 12, institution_name: 'Institut B' })];
  const found = searchCatalog(rows, "Institut B to'plamlar");
  assert.deepEqual(found.map(row => row.kalit), ['foreign']);
  assert.deepEqual(found[0].sinflar[0].mavzular[0].topic_codes, ['foreign']);
  assert.equal(searchCatalog(rows, 'MATEMATIKA').length, 2);
  assert.strictEqual(searchCatalog(rows, '  '), rows);
  assert.equal(rows[0].sinflar[0].mavzular.length, 1);
});

test('search filters topics and courses, and reports no matches without losing data', () => {
  const rows = [subject('math-code')];
  rows[0].sinflar.push({ sinf: '2 kurs', mavzular: [{ nomi: 'Hosila', topic_codes: ['derivative'] }] });
  const result = searchCatalog(rows, 'Hosila');
  assert.deepEqual(result[0].sinflar.map(group => group.sinf), ['2 kurs']);
  assert.equal(searchCatalog(rows, 'math-code')[0].sinflar[0].sinf, '1 kurs');
  assert.deepEqual(searchCatalog(rows, 'topilmaydi'), []);
  assert.equal(searchCatalog(rows, '')[0].sinflar.length, 2);
});

test('repeated subject names display institute, major, language, form and group', () => {
  const details = catalogSubjectDetails(subject('a', { talim_tili: 'tj', talim_shakli: 'kechki', guruh: '202' }));
  for (const word of ['Institut A', 'Pedagogika', 'Tojikcha', 'Kechki', '202-guruh']) assert.ok(details.includes(word));
});
