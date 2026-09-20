export const INSTITUTION_TYPES = [
 {key:'maktab',label:'Maktab',icon:'🏫'},
 {key:'bogcha',label:'Bog‘cha',icon:'🧸'},
 {key:'markaz',label:'Markaz',icon:'📚'},
 {key:'universitet',label:'Institut',icon:'🎓'},
];
export const LESSON_TYPES = [
 {key:'maruza',label:'Ma’ruza'}, {key:'amaliy',label:'Amaliyot'},
 {key:'seminar',label:'Seminar'}, {key:'laboratoriya',label:'Laboratoriya'},
];
export const FORM_LABELS = {kunduzgi:'Kunduzgi',kechki:'Kechki',sirtqi:'Sirtqi',masofaviy:'Masofaviy',umumiy:'Shakllar uchun umumiy'};
export const lessonLabel = key => LESSON_TYPES.find(item=>item.key===key)?.label || '';
export const institutionLabel = key => INSTITUTION_TYPES.find(item=>item.key===key)?.label || '';
export const gradeLabel = (type,grade) => type==='maktab' && /^\d+$/.test(String(grade)) ? `${grade}-sinf` : String(grade || '');
export const profileInstitutionType = user => user?.talaba_profili || user?.universitet_id || /kurs/i.test(String(user?.class||'')) ? 'universitet' : user?.maktab_id ? 'maktab' : user?.bogcha_id ? 'bogcha' : user?.markaz_id ? 'markaz' : 'maktab';
export const catalogTopicKey = topic => JSON.stringify([topic.scope_id ?? null,[...new Set(topic.topic_codes || [])].map(String).sort()]);
export function programKey(scope) {
 return JSON.stringify(['institution_type','institution_id','talim_bosqichi','yonalish_id',
  'yonalish_key','talim_shakli','talim_tili','kurs','semestr','guruh'].map(key=>String(scope[key] ?? '')));
}
export function programLabel(scope) {
 if(scope.institution_type!=='universitet') return scope.institution_name || institutionLabel(scope.institution_type);
 return [scope.yonalish_nomi,scope.talim_bosqichi==='magistr'?'Magistr':'Bakalavr',
  FORM_LABELS[scope.talim_shakli],scope.talim_tili?.toUpperCase(),`${scope.kurs}-kurs`,
  `${scope.semestr}-semestr`,scope.guruh ? `${scope.guruh}-guruh` : 'Barcha guruhlar'].filter(Boolean).join(' · ');
}
export function groupPrograms(scopes,type) {
 const groups=new Map();
 for(const scope of scopes.filter(item=>item.institution_type===type)) {
  const key=programKey(scope);
  if(!groups.has(key)) groups.set(key,{key,scope,lessons:{}});
  groups.get(key).lessons[scope.dars_turi || '']=scope;
 }
 return [...groups.values()];
}
export function matchingSubjects(subjects,type,lesson) {
 return subjects.filter(subject=>subject.institution_type===type &&
  (type!=='universitet' || subject.dars_turi===lesson));
}
export function targetLesson(subjects,codes) {
 const wanted=new Set((codes || []).filter(Boolean).map(String));
 if(!wanted.size)return null;
 return subjects.find(subject=>(subject.sinflar || []).some(group=>group.mavzular.some(topic=>
  (topic.topic_codes || []).some(code=>wanted.has(String(code))))))?.dars_turi || null;
}
