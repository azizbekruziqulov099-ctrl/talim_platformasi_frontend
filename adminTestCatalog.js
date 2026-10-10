import { FORM_LABELS } from './catalog.js';

export const LANGUAGE_LABELS = { uz: 'O‘zbekcha', ru: 'Ruscha', tj: 'Tojikcha', en: 'Inglizcha', kk: 'Qoraqalpoqcha', kz: 'Qozoqcha' };
export const INSTITUTE_FILTERS = [
  ['institution_id', 'Institut'], ['program', 'Yo‘nalish'],
  ['talim_shakli', 'Ta’lim shakli'], ['talim_tili', 'Ta’lim tili'], ['kurs', 'Kurs'],
];

const textKey = value => String(value ?? '').toLocaleLowerCase().replace(/[‘’ʻʼ`]/g, "'").replace(/\s+/g, ' ').trim();
const degreeLabel = scope => scope.talim_bosqichi === 'magistr' ? 'Magistr' : 'Bakalavr';
export const instituteProgramKey = scope => JSON.stringify([
  scope.talim_bosqichi,
  Number(scope.yonalish_id) > 0 ? ['id', Number(scope.yonalish_id)] : ['name', textKey(scope.yonalish_key || scope.yonalish_nomi)],
]);
const valueFor = (scope, field) => field === 'program' ? instituteProgramKey(scope) : String(scope[field] ?? '');
const labelFor = (scope, field) => {
  if (field === 'institution_id') return scope.institution_name || (Number(scope.institution_id) === 0 ? 'Institut — umumiy testlar' : `Institut ${scope.institution_id}`);
  if (field === 'program') return `${scope.yonalish_nomi || 'Umumiy yo‘nalish'} · ${degreeLabel(scope)}`;
  if (field === 'talim_shakli') return FORM_LABELS[scope.talim_shakli] || scope.talim_shakli;
  if (field === 'talim_tili') return LANGUAGE_LABELS[scope.talim_tili] || scope.talim_tili;
  return `${scope.kurs}-kurs`;
};

// Every step is derived from existing rows after applying its predecessors.
// Changing institute/program cannot leave an impossible form, language or course.
export function instituteSelection(scopes, preferred = {}) {
  let rows = scopes.filter(scope => scope.institution_type === 'universitet');
  const selection = {}, options = {};
  for (const [field] of INSTITUTE_FILTERS) {
    options[field] = [...new Map(rows.map(scope => [valueFor(scope, field), {
      value: valueFor(scope, field), label: labelFor(scope, field),
    }])).values()].sort((a, b) => a.label.localeCompare(b.label, 'uz', { numeric: true }));
    const wanted = String(preferred[field] ?? '');
    selection[field] = options[field].some(item => item.value === wanted) ? wanted : options[field][0]?.value ?? '';
    rows = rows.filter(scope => valueFor(scope, field) === selection[field]);
  }
  return { selection, options, scopes: rows };
}

export function selectionFromScope(scope) {
  return scope ? Object.fromEntries(INSTITUTE_FILTERS.map(([field]) => [field, valueFor(scope, field)])) : {};
}

// Read filters do not identify a write destination: both semesters, all lesson
// types and groups remain visible without creating or modifying any scope.
export function instituteReadFilters(scope) {
  if (!scope) return null;
  const filters = Object.fromEntries(['institution_id', 'talim_bosqichi', 'talim_shakli', 'talim_tili', 'kurs']
    .map(field => [field, scope[field]]));
  filters.yonalish_id = Number(scope.yonalish_id) || 0;
  if (!filters.yonalish_id) filters.yonalish_key = scope.yonalish_key || textKey(scope.yonalish_nomi);
  return filters;
}

export const instituteGrade = scope => scope ? `${scope.kurs} kurs${scope.talim_bosqichi === 'magistr' ? ' magistr' : ''}` : null;

export function catalogSubjectDetails(subject) {
  if (subject.institution_type !== 'universitet') return subject.institution_name || '';
  return [subject.institution_name, subject.yonalish_nomi, degreeLabel(subject),
    FORM_LABELS[subject.talim_shakli], LANGUAGE_LABELS[subject.talim_tili] || subject.talim_tili,
    subject.guruh ? `${subject.guruh}-guruh` : 'Barcha guruhlar'].filter(Boolean).join(' · ');
}

export function searchCatalog(subjects, query) {
  const terms = textKey(query).split(' ').filter(Boolean);
  if (!terms.length) return subjects;
  return subjects.flatMap(subject => {
    const context = [subject.nom, subject.dars_turi_nomi, catalogSubjectDetails(subject)].join(' ');
    const sinflar = (subject.sinflar || []).flatMap(group => {
      const mavzular = (group.mavzular || []).filter(topic => {
        const haystack = textKey([context, group.sinf, topic.nomi, ...(topic.topic_codes || [])].join(' '));
        const words = haystack.split(/[^\p{L}\p{N}']+/u);
        return terms.every(term => term.length === 1 ? words.includes(term) : haystack.includes(term));
      });
      return mavzular.length ? [{ ...group, mavzular }] : [];
    });
    return sinflar.length ? [{ ...subject, sinflar }] : [];
  });
}
