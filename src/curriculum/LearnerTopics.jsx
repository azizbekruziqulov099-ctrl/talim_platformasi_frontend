import React, {useEffect,useRef,useState} from 'react';
import {LearnerCurriculumHeader} from './CurriculumTabs.jsx';
import {catalogTopicKey,gradeLabel,matchingSubjects,profileInstitutionType} from './catalog.js';

export default function LearnerTopics({apiBase,token,user,onOpenLesson,onOpenTest}) {
 const [type,setType]=useState(()=>profileInstitutionType(user));
 const [lesson,setLesson]=useState('maruza');
 const [catalog,setCatalog]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const chosen=useRef(false);
 useEffect(()=>{
  const controller=new AbortController();
  const params=new URLSearchParams({token,institution_type:type,faqat_testli:'false'});
  setLoading(true);setCatalog(null);setError('');
  fetch(`${apiBase}/api/mavzular?${params}`,{signal:controller.signal})
   .then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.detail||'Mavzular yuklanmadi');return data;})
   .then(data=>{
    if(controller.signal.aborted)return;
    const viewer=data.viewer;
    if(viewer?.preferred_type && (!chosen.current || !viewer.types.includes(type)) && type!==viewer.preferred_type){setType(viewer.preferred_type);return;}
    setCatalog(data);
   })
   .catch(err=>{if(!controller.signal.aborted)setError(err.message);})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return()=>controller.abort();
 },[apiBase,token,type,user?.talaba_profili?.yangilangan_at,user?.class]);
 const subjects=matchingSubjects(catalog?.fanlar||[],type,lesson);
 const openTarget=(subject,group,topic)=>({...topic,topic_code:topic.topic_codes[0],
  topic_name:topic.nomi,subject:subject.nom,fan:subject.nom,grade:group.sinf,institution_type:type,dars_turi:lesson});
 return <div className="space-y-4">
  <div><h2 className="text-xl font-bold text-slate-800">Mavzular</h2>
   <p className="mt-1 text-sm text-slate-600">{catalog?.viewer?.teacher ? 'Ish joyingizga tegishli fan, mavzu va testlar.' : 'Ta’lim profilingizga mos fan, mavzu va testlar.'}</p></div>
  <LearnerCurriculumHeader viewer={catalog?.viewer} type={type} lesson={lesson} fallbackType={profileInstitutionType(user)}
   onType={value=>{chosen.current=true;setType(value);setLesson('maruza');}}
   onLesson={setLesson} disabled={loading}/>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
  {loading?<p role="status" className="p-6 text-center text-slate-500">Mavzular yuklanmoqda…</p>
   : catalog?.profil_sozlanmagan ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{catalog.viewer?.teacher?'Profilingizda faol ish joyini tanlang.':'Ta’lim profilingizni to‘ldiring: muassasa, yo‘nalish, ta’lim shakli, til, kurs, semestr va guruh mos bo‘lishi kerak.'}</p>
   : !error&&!subjects.length ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">Bu bo‘limga mos mavzular hali kiritilmagan.</p>
   : subjects.map(subject=><section key={subject.kalit} className="rounded-2xl border border-slate-200 bg-white p-4">
    <h3 className="font-bold text-slate-800">{subject.nom}</h3>
    {subject.institution_name&&<p className="mt-1 text-xs text-slate-500">{subject.institution_name}</p>}
    {subject.sinflar.map(group=><div key={group.sinf} className="mt-3">
     <p className="mb-2 text-xs font-semibold text-slate-500">{gradeLabel(type,group.sinf)}</p>
     <ul className="space-y-2">{group.mavzular.map(topic=><li key={catalogTopicKey(topic)} className="rounded-xl bg-slate-50 p-3">
      <p className="text-sm font-medium text-slate-800">{topic.nomi}</p>
      <p className="mt-1 text-xs text-slate-500">{topic.savol_soni ? `${topic.savol_soni} ta test savoli` : 'Test hali kiritilmagan'}</p>
      <div className="mt-3 flex flex-wrap gap-2">
       {onOpenLesson&&<button type="button" onClick={()=>onOpenLesson(openTarget(subject,group,topic))} className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-900">Mavzuni o‘rganish</button>}
       {topic.savol_soni>0&&<button type="button" onClick={()=>onOpenTest(openTarget(subject,group,topic))} className="rounded-lg bg-sky-900 px-3 py-2 text-xs font-semibold text-white">Testni ochish</button>}
      </div>
     </li>)}</ul>
    </div>)}
   </section>)}
 </div>;
}
