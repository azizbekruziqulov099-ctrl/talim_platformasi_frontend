import test from 'node:test';
import assert from 'node:assert/strict';
import {groupPrograms,matchingSubjects,programKey,gradeLabel,catalogTopicKey,targetLesson,profileInstitutionType,LESSON_TYPES,INSTITUTION_TYPES,semesterPair,templateTopicCodes} from './curriculum/catalog.js';

const base={id:1,institution_type:'universitet',institution_id:11,talim_bosqichi:'bakalavr',yonalish_id:7,yonalish_key:'pedagogika',talim_shakli:'kechki',talim_tili:'uz',kurs:1,semestr:1,guruh:'101',dars_turi:'maruza'};
test('the four institute lesson sections share one program selector',()=>{
 const rows=LESSON_TYPES.map((lesson,i)=>({...base,id:i+1,dars_turi:lesson.key}));
 const grouped=groupPrograms(rows,'universitet');assert.equal(grouped.length,1);
 assert.deepEqual(Object.keys(grouped[0].lessons),['maruza','amaliy','seminar','laboratoriya']);
});
test('program grouping never combines another audience dimension',()=>{
 for(const [key,value] of Object.entries({institution_id:12,talim_bosqichi:'magistr',yonalish_id:8,talim_shakli:'sirtqi',talim_tili:'ru',kurs:2,guruh:'102'}))
  assert.notEqual(programKey(base),programKey({...base,[key]:value}),key);
});
test('institution and lesson switches cannot carry subjects across sections',()=>{
 const all=INSTITUTION_TYPES.flatMap(type=>LESSON_TYPES.map(lesson=>({institution_type:type.key,dars_turi:type.key==='universitet'?lesson.key:''})));
 for(const type of INSTITUTION_TYPES)for(const lesson of LESSON_TYPES){
  const rows=matchingSubjects(all,type.key,lesson.key);
  assert.ok(rows.every(row=>row.institution_type===type.key));
  if(type.key==='universitet'){assert.equal(rows.length,1);assert.equal(rows[0].dars_turi,lesson.key);}
 }
});
test('same topic name can be independently selected across subjects',()=>{
 const a={nomi:'Kirish',scope_id:1,topic_codes:['a']},b={nomi:'Kirish',scope_id:1,topic_codes:['b']};
 assert.notEqual(catalogTopicKey(a),catalogTopicKey(b));
 assert.equal(catalogTopicKey({topic_codes:['a','b','a']}),catalogTopicKey({topic_codes:['b','a']}));
});
test('deep-linked practical topic opens its own lesson tab',()=>{
 const subjects=[{dars_turi:'maruza',sinflar:[{mavzular:[{topic_codes:['a']}]}]},{dars_turi:'amaliy',sinflar:[{mavzular:[{topic_codes:['b']}]}]}];
 assert.equal(targetLesson(subjects,['b']),'amaliy');assert.equal(targetLesson(subjects,['foreign']),null);
});
test('grade labels and initial section preserve college and kindergarten identities',()=>{
 assert.equal(gradeLabel('universitet','1 kurs'),'1 kurs');assert.equal(gradeLabel('maktab','7'),'7-sinf');
 assert.equal(gradeLabel('bogcha','5-6 yosh'),'5-6 yosh');
 assert.equal(profileInstitutionType({universitet_id:11,role:'oqituvchi'}),'universitet');
 assert.equal(profileInstitutionType({class:'1-kurs'}),'universitet');
 assert.equal(profileInstitutionType({bogcha_id:11}),'bogcha');assert.equal(profileInstitutionType({markaz_id:11}),'markaz');
});

test('course selectors combine semester pairs and official program renames',()=>{
 for(let year=1;year<=4;year++){
  const [first,second]=semesterPair(year);assert.deepEqual([first,second],[year*2-1,year*2]);
  const scopes=LESSON_TYPES.flatMap((lesson,i)=>[first,second].map((semester,j)=>({...base,id:10*i+j+1,kurs:year,semestr:semester,dars_turi:lesson.key,yonalish_key:j?'renamed':'old'})));
  const groups=groupPrograms(scopes.reverse(),'universitet');assert.equal(groups.length,1);assert.equal(Object.keys(groups[0].lessons).length,4);assert.ok(Object.values(groups[0].lessons).every(s=>s.semestr===first));
 }
});
test('one parent sends one template code while test solving retains its leaves',()=>{
 const topic={template_code:'a',topic_codes:['a','b']};assert.deepEqual(templateTopicCodes(topic),['a']);assert.deepEqual(topic.topic_codes,['a','b']);
});
test('manual program names remain distinct',()=>assert.notEqual(programKey({...base,yonalish_id:0}),programKey({...base,yonalish_id:0,yonalish_key:'other'})));
