// REV77: institut talabasi hamma institut testlari va mavzularini ko'radi. Bu filtrlar bilan
// o'z yo'nalishini («Mening yo'nalishim») yoki istalgan institut/yo'nalish/shakl/tilni tanlaydi.
import { FORM_LABELS } from './catalog.js';
import { LANGUAGE_LABELS } from './adminTestCatalog.js';

export const EMPTY_UNIVERSITY_FILTER = { mine: false, institution: '', program: '', form: '', language: '' };

export function initialUniversityFilter(viewer) {
  return { ...EMPTY_UNIVERSITY_FILTER, mine: Boolean(viewer?.profil_toliq) };
}

export function universityBrowseActive(viewer, type) {
  return Boolean(viewer?.barcha_institutlar) && type === 'universitet';
}

const unique = (items) => [...new Map(items.filter(([key]) => key !== '' && key !== null && key !== undefined).map((item) => [String(item[0]), item])).values()];

export function universityOptions(subjects = []) {
  const byName = (a, b) => String(a[1]).localeCompare(String(b[1]), 'uz');
  return {
    institutions: unique(subjects.map((s) => [String(s.institution_id ?? ''), Number(s.institution_id) === 0 ? 'Umumiy katalog' : (s.institution_name || 'Institut')])).sort(byName),
    programs: unique(subjects.map((s) => [s.yonalish_nomi || '', s.yonalish_nomi || ''])).sort(byName),
    forms: unique(subjects.map((s) => [s.talim_shakli || '', FORM_LABELS[s.talim_shakli] || s.talim_shakli || ''])).filter(([key]) => key !== 'umumiy'),
    languages: unique(subjects.map((s) => [s.talim_tili || '', LANGUAGE_LABELS[s.talim_tili] || s.talim_tili || ''])),
  };
}

export function filterUniversitySubjects(subjects = [], filter = EMPTY_UNIVERSITY_FILTER) {
  return subjects.filter((s) =>
    (!filter.mine || s.mine) &&
    (!filter.institution || String(s.institution_id ?? '') === String(filter.institution)) &&
    (!filter.program || (s.yonalish_nomi || '') === filter.program) &&
    (!filter.form || s.talim_shakli === filter.form || s.talim_shakli === 'umumiy') &&
    (!filter.language || s.talim_tili === filter.language));
}
