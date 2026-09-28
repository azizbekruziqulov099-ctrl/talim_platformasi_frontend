import TranslatedContent from '../interface/TranslatedContent.jsx';
import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, {useEffect,useMemo,useRef,useState} from 'react';
import {LearnerCurriculumHeader} from './CurriculumTabs.jsx';
import {catalogTopicKey,gradeLabel,institutionLabel,matchingSubjects,profileInstitutionType} from './catalog.js';
import {filterTopics,subjectStats,topicTarget,viewerHeadline} from './learnerTopicsRules.js';
import {lessonDownloadUrl} from '../lesson/darsXonasiRules.js';
import UniversityFilters from './UniversityFilters.jsx';
import {catalogSubjectDetails} from './adminTestCatalog.js';
import {filterUniversitySubjects, initialUniversityFilter, universityBrowseActive} from './universityFilters.js';

const DarsXonasi = React.lazy(() => import('../lesson/DarsXonasi.jsx'));
const SUBJECT_KEY = 'kabutar:learn:subject';
const readSaved = () => { try { return window.localStorage.getItem(SUBJECT_KEY) || ''; } catch { return ''; } };
const save = value => { try { window.localStorage.setItem(SUBJECT_KEY, value); } catch { /* storage optional */ } };

// O'quvchi / talaba / bog'cha / markaz: bitta sahifada Fan → Mavzu → Dars yoki Test.
export default function LearnerTopics({apiBase,token,user,onOpenLesson,onOpenTest,onEducationSetup,jins='qiz'}) {
  useKbInterfaceLocale();
 const [type,setType]=useState(()=>profileInstitutionType(user));
 const [lesson,setLesson]=useState('all');
 const [catalog,setCatalog]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState('all');
 const [subjectKey,setSubjectKey]=useState(readSaved);
 const [classroom,setClassroom]=useState(null);
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

 const [uniFilter,setUniFilter]=useState(null);
 const universityBrowse=universityBrowseActive(catalog?.viewer,type);
 const uniFilterValue=uniFilter||initialUniversityFilter(catalog?.viewer);
 const matched=matchingSubjects(catalog?.fanlar||[],type,lesson);
 // REV77: talaba barcha institut mavzularini ko'radi; filtr bilan o'z yo'nalishini tanlaydi.
 const subjects=universityBrowse?filterUniversitySubjects(matched,uniFilterValue):matched;
 const current=subjects.find(subject=>subject.kalit===subjectKey)||subjects[0];
 const groups=useMemo(()=>current?filterTopics(current,query,filter):[],[current,query,filter]);
 const teacher=Boolean(catalog?.viewer?.teacher);
 const chooseSubject=key=>{setSubjectKey(key);save(key);setQuery('');};

 if(classroom) return <div className="space-y-3">
  <button type="button" onClick={()=>setClassroom(null)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">{__kbUi("← Mavzularga qaytish")}</button>
  <React.Suspense fallback={<p className="p-6 text-center text-slate-500">{__kbUi("Dars yuklanmoqda…")}</p>}>
   <DarsXonasi apiBase={apiBase} token={token} topicCode={classroom.lesson_code} fan={classroom.fan} grade={classroom.grade} jins={jins}
    onOpenTest={onOpenTest&&classroom.savol_soni>0?()=>onOpenTest({...classroom,topic_code:classroom.topic_codes?.[0]||classroom.topic_code}):undefined}
    onChat={onOpenLesson?()=>onOpenLesson(classroom):undefined}/>
  </React.Suspense>
 </div>;

 return <div className="space-y-4">
  <div><h2 className="text-xl font-bold text-slate-800">{teacher?__kbUi("Mavzular"):__kbUi("O‘rganish")}</h2>
   <p className="mt-1 text-sm text-slate-600">{__kbUi(viewerHeadline(catalog?.viewer,type,institutionLabel(type)))}</p></div>
  <LearnerCurriculumHeader viewer={catalog?.viewer} type={type} lesson={lesson} fallbackType={profileInstitutionType(user)}
   onType={value=>{chosen.current=true;setType(value);setLesson('all');}}
   onLesson={setLesson} disabled={loading}/>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{__kbUi(error)}</p>}
  {loading?<p role="status" className="p-6 text-center text-slate-500">{__kbUi("Mavzular yuklanmoqda…")}</p>
   : catalog?.profil_sozlanmagan ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{teacher?__kbUi('Profilingizda faol ish joyini tanlang.'):__kbUi('Ta’lim profilingizni to‘ldiring: muassasa, yo‘nalish, ta’lim shakli, til, kurs, semestr va guruh mos bo‘lishi kerak.')}</p>
   : error&&!subjects.length ? null
   : !subjects.length && !(universityBrowse&&matched.length) ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">{__kbUi("Bu bo‘limga mos mavzular hali kiritilmagan.")}</p>
   : <>
    {universityBrowse&&<UniversityFilters subjects={matched} viewer={catalog?.viewer} value={uniFilterValue} onChange={value=>{setUniFilter(value);setSubjectKey('');}} onEducationSetup={onEducationSetup}/>}
    <section aria-label={__kbUi("Fanlar")}>
     <p className="mb-2 text-xs font-semibold text-slate-600">{__kbUi("1. Fanni tanlang")}</p>
     <div className="flex gap-2 overflow-x-auto pb-1">
      {subjects.map(subject=>{const stats=subjectStats(subject);const active=subject.kalit===current?.kalit;
       return <button key={subject.kalit} type="button" aria-pressed={active} onClick={()=>chooseSubject(subject.kalit)}
        className="shrink-0 rounded-xl border px-3 py-2 text-left"
        style={active?{background:'#1B4B7A',borderColor:'#1B4B7A',color:'#fff'}:{background:'#fff',borderColor:'#D5DCE3',color:'#1E293B'}}>
        <span className="block text-sm font-semibold"><TranslatedContent text={subject.nom} showStatus={false}/>{subject.dars_turi_nomi?` · ${__kbUi(subject.dars_turi_nomi)}`:''}</span>
        {universityBrowse&&<span className="block max-w-[260px] truncate text-[10.5px] opacity-80">{subject.mine?'🎯 ':''}{catalogSubjectDetails(subject)}</span>}
        <span className="block text-[11px] opacity-80">{__kbUi(`${stats.topics} mavzu · ${stats.lessons} dars · ${stats.tested} testli`)}</span>
       </button>;})}
     </div>
    </section>
    <section aria-label={__kbUi("Mavzular")} className="space-y-3">
     <p className="text-xs font-semibold text-slate-600">{__kbUi("2. Mavzuni toping")}</p>
     <div className="flex flex-wrap gap-2">
      <input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={__kbUi("Mavzu nomini yozing…")}
       aria-label={__kbUi("Mavzu qidirish")} className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"/>
      <div className="flex gap-1" role="group" aria-label={__kbUi("Saralash")}>
       {[['all','Hammasi'],['dars','Darsi bor'],['test','Testi bor']].map(([key,label])=><button key={key} type="button" aria-pressed={filter===key} onClick={()=>setFilter(key)}
        className="rounded-lg border px-3 py-2 text-xs font-semibold"
        style={filter===key?{background:'#1E3A32',borderColor:'#1E3A32',color:'#F2F0E6'}:{background:'#fff',borderColor:'#D5DCE3',color:'#334155'}}>{__kbUi(label)}</button>)}
      </div>
     </div>
     {!groups.length&&<p className="rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">{__kbUi("Shartga mos mavzu topilmadi.")}</p>}
     {groups.map(group=><div key={group.sinf}>
      <p className="mb-2 text-xs font-semibold text-slate-500">{__kbUi(gradeLabel(type,group.sinf))}</p>
      <ul className="space-y-2">{group.mavzular.map(topic=>{const target=topicTarget(current,group,topic,type);
       return <li key={catalogTopicKey(topic)} className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-sm font-medium text-slate-800"><TranslatedContent text={topic.nomi} showStatus={false}/>{topic.semestr > 0 && <small className="block text-xs text-slate-500">{topic.semestr}{__kbUi("-semestr")}</small>}</p>
        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
         {topic.dars_bor&&<span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">{__kbUi("📘 Kitob darsi")}</span>}
         <span className={`rounded-full px-2 py-0.5 ${topic.savol_soni?'bg-sky-50 text-sky-800':'bg-slate-100 text-slate-500'}`}>{topic.savol_soni?__kbUi(`📝 ${topic.savol_soni} ta test savoli`):__kbUi('Test hali yo‘q')}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
         {!teacher&&topic.dars_bor&&<button type="button" onClick={()=>setClassroom(target)} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{background:'#1E3A32'}}>{__kbUi("▶ Darsni boshlash")}</button>}
         {!teacher&&!topic.dars_bor&&onOpenLesson&&<button type="button" onClick={()=>onOpenLesson(target)} className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-900">{__kbUi("💬 AI ustoz bilan o‘rganish")}</button>}
         {topic.savol_soni>0&&onOpenTest&&<button type="button" onClick={()=>onOpenTest({...target,topic_code:topic.topic_codes[0]})} className="rounded-lg bg-sky-900 px-3 py-2 text-xs font-semibold text-white">{__kbUi("Test ishlash")}</button>}
         {teacher&&topic.dars_bor&&[['pdf','⬇ Dars PDF'],['docx','⬇ Dars Word']].map(([format,label])=><a key={format} href={lessonDownloadUrl(apiBase,token,target.lesson_code,format)} download
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">{__kbUi(label)}</a>)}
        </div>
       </li>;})}</ul>
     </div>)}
    </section>
   </>}
 </div>;
}
