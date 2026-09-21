import {uiText} from '../interface/interfaceRuntime.js';
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
  'yonalish_key','talim_shakli','talim_tili','kurs','guruh'].map(key=>String(key==='yonalish_key'&&Number(scope.yonalish_id)>0?'':scope[key] ?? '')));
}
export function programLabel(scope) {
 if(scope.institution_type!=='universitet') return scope.institution_name || institutionLabel(scope.institution_type);
 return [scope.yonalish_nomi,uiText(scope.talim_bosqichi==='magistr'?'Magistr':'Bakalavr'),
  uiText(FORM_LABELS[scope.talim_shakli]),scope.talim_tili?.toUpperCase(),uiText(`${scope.kurs}-kurs`),
  uiText(semesterPairLabel(scope.kurs)),uiText(scope.guruh ? `${scope.guruh}-guruh` : 'Barcha guruhlar')].filter(Boolean).join(' · ');
}
export function groupPrograms(scopes,type) {
 const groups=new Map();
 for(const scope of scopes.filter(item=>item.institution_type===type)) {
  const key=programKey(scope);
  if(!groups.has(key)) groups.set(key,{key,scope,lessons:{}});
  const group=groups.get(key),kind=scope.dars_turi || '',previous=group.lessons[kind];
  if(!previous||Number(scope.semestr)<Number(previous.semestr)||(scope.semestr===previous.semestr&&Number(scope.id)<Number(previous.id)))group.lessons[kind]=scope;
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

export const semesterPair = course => [2*Number(course)-1,2*Number(course)];
export const semesterPairLabel = course => `${semesterPair(course).join('–')}-semestr`;
export const templateTopicCodes = topic => [topic.template_code || topic.topic_code || topic.topic_codes?.[0]].filter(Boolean);
