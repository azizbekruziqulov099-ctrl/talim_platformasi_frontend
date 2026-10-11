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
import { accountRole } from '../auth/loginMemory.js';
import { capitalizeTopic, isReviewTopic, kidSubjectEmoji, kidTopicColor, kidTopicEmoji } from './kidTopics.js';
import { lessonDone, lessonStars } from './kidProgress.js';
import { useKeepLight } from '../kid/useKeepLight.js';
import { fetchDayPlan, todayProgress, unlockLessons } from '../kid/kidActivity.js';
import './kidTopics.css';
import BogchaOlami from '../kid/BogchaOlami.jsx';
import FanBelgi from '../kid/FanBelgi.jsx';
import { useHavo } from '../kid/useHavo.js';
import { guruhMos } from '../admin/previewRules.js';
import { fanIzohi, fanNomiTil, izohTanla } from './izohTanlov.js';

const DarsXonasi = React.lazy(() => import('../lesson/DarsXonasi.jsx'));
const SUBJECT_KEY = 'kabutar:learn:subject';
const readSaved = () => { try { return window.localStorage.getItem(SUBJECT_KEY) || ''; } catch { return ''; } };
const save = value => { try { window.localStorage.setItem(SUBJECT_KEY, value); } catch { /* storage optional */ } };

// O'quvchi / talaba / bog'cha / markaz: bitta sahifada Fan → Mavzu → Dars yoki Test.
// REV122: preview={type,sinf} — admin «O'quvchi ko'zi bilan»: tanlangan muassasa turi/sinf, kunlik cheklov va kuzatuvsiz.
export default function LearnerTopics({apiBase,token,user,onOpenLesson,onOpenTest,onEducationSetup,jins='qiz',preview=null}) {
  const {locale}=useKbInterfaceLocale();
 const [type,setType]=useState(()=>preview?.type||profileInstitutionType(user));
 const [lesson,setLesson]=useState('all');
 const [catalog,setCatalog]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState('all');
 const [subjectKey,setSubjectKey]=useState(readSaved);
 const [classroom,setClassroom]=useState(null);
 const chosen=useRef(Boolean(preview?.type));
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
 const matched=matchingSubjects(izohTanla(catalog?.fanlar||[],locale),type,lesson).filter(sub=>!preview?.sinf||(sub.sinflar||[]).some(g=>guruhMos(g.sinf,preview.sinf)));
 // REV77: talaba barcha institut mavzularini ko'radi; filtr bilan o'z yo'nalishini tanlaydi.
 const subjects=universityBrowse?filterUniversitySubjects(matched,uniFilterValue):matched;
 const current=subjects.find(subject=>subject.kalit===subjectKey)||subjects[0];
 const groups=useMemo(()=>current?filterTopics(current,query,filter).filter(g=>guruhMos(g.sinf,preview?.sinf)):[],[current,query,filter,preview?.sinf]);
 const teacher=Boolean(catalog?.viewer?.teacher);
 const kid=!teacher&&accountRole(user)==='bogcha';
 useKeepLight(kid);   // REV121: bolalar ro'yxati tungi rejimda ham yorqin
 // REV91: bog'cha — kunlik reja (har fandan kuniga 2 ta yangi dars, dam olish kunlari 3 ta). Server tekshiradi.
 const [plan,setPlan]=useState(null);
 const planFan=current?.nom||'';
 const loadPlan=React.useCallback(()=>{if(!kid||preview)return;fetchDayPlan(apiBase,token).then(setPlan).catch(()=>setPlan(null));},[kid,apiBase,token,preview]);
 useEffect(()=>{if(kid&&!classroom)loadPlan();},[kid,classroom,loadPlan]);
 const unlockOf=group=>unlockLessons(group.mavzular.map(t=>t.dars_bor?topicTarget(current,group,t,type).lesson_code:''),plan,planFan);
 // REV81: uzluksiz o'rganish — dars tugagach keyingi darsga o'tish (guruh ichidagi tartib bo'yicha).
 const openLesson=(group,topic)=>{
  const list=group.mavzular.filter(t=>t.dars_bor);const i=list.indexOf(topic);let next=i>=0?list[i+1]:null;
  if(kid&&plan?.bogcha&&next){
   const u=unlockOf(group);const self=u[group.mavzular.indexOf(topic)]||{};const nu=u[group.mavzular.indexOf(next)]||{};
   const left=(plan.fanlar?.[planFan]?.qoldi??plan.limit)-(self.isNew?1:0);
   if(!nu.known&&left<=0)next=null;   // keyingi yangi dars ertaga ochiladi
  }
  setClassroom({...topicTarget(current,group,topic,type),_topic:topic.nomi,_next:next?{title:next.nomi,open:()=>openLesson(group,next)}:null});
 };
 const chooseSubject=key=>{setSubjectKey(key);save(key);setQuery('');};
 // REV90: o'qiy olmaydigan bola uchun — kartadagi nomni ovoz bilan aytadi.
 const voice=useRef(null);
 const sayName=(text,inglizcha=false)=>{try{voice.current?.pause();const m=String(text||'').slice(0,200);/* REV122: ruscha (kirill) yoki inglizcha nom — o'z tilidagi ovozda */const tm=/[А-Яа-яЁё]/.test(m)?`[ru]${m}[/ru]`:inglizcha?`[en]${m}[/en]`:m;const a=new Audio(`${String(apiBase).replace(/\/+$/,'')}/api/ovoz?${new URLSearchParams({matn:tm,jins})}`);voice.current=a;a.play().catch(()=>{});}catch{/* ovoz ixtiyoriy */}};
 const nextRef=useRef(null);
 // REV112: bog'cha bolasi uchun bosh ekran — bog'cha olami (bino, yo'lak, sinfxonalar, zal, hovli…)
 const [olam,setOlam]=useState(true);
 const ob=useHavo(apiBase,!kid);
 useEffect(()=>{if(kid&&!classroom&&nextRef.current)try{nextRef.current.scrollIntoView({block:'center',behavior:'smooth'});}catch{/* eski brauzer */}},[kid,classroom,current?.kalit,loading]);

 if(classroom) return <div className="space-y-3 lt-root">
  <button type="button" onClick={()=>setClassroom(null)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">{__kbUi("← Mavzularga qaytish")}</button>
  <React.Suspense fallback={<p className="p-6 text-center text-slate-500">{__kbUi("Dars yuklanmoqda…")}</p>}>
   <DarsXonasi apiBase={apiBase} token={token} topicCode={classroom.lesson_code} fan={classroom.fan} grade={classroom.grade} jins={jins} learnerGender={user?.jins||''} learnerRole={accountRole(user)}
    onOpenTest={onOpenTest&&classroom.savol_soni>0?()=>onOpenTest({...classroom,topic_code:classroom.topic_codes?.[0]||classroom.topic_code}):undefined}
    nextLesson={classroom._next?{title:capitalizeTopic(classroom._next.title),open:classroom._next.open}:null}
    onChat={onOpenLesson?()=>onOpenLesson(classroom):undefined}
    kidPlan={kid&&!preview?{fan:planFan,mavzu:capitalizeTopic(classroom._topic||'')}:null}
    onKidFinished={(_,reja)=>{if(reja)setPlan(p=>p?{...p,...reja}:p);}}
    cheklovsiz={Boolean(preview||user?.is_admin)}
    onClose={()=>setClassroom(null)}/>
  </React.Suspense>
 </div>;

 if(kid&&olam&&!loading&&!catalog?.profil_sozlanmagan&&subjects.length) return <div className="lt-root">
  <BogchaOlami fanlar={subjects.map(sub=>({kalit:sub.kalit,nom:fanNomiTil(sub.nom,locale),emoji:kidSubjectEmoji(sub.nom)}))}
   onFan={key=>{chooseSubject(key);setOlam(false);}} say={(t,o)=>sayName(t,Boolean(o?.en))} havo={ob.havo} vaqt={ob.vaqt}/>
 </div>;

 return <div className="space-y-4 lt-root">
  {kid&&<button type="button" className="kt-olam-back" onClick={()=>setOlam(true)} aria-label={__kbUi("Bog‘chaga qaytish")}>🏫</button>}
  {!kid&&<div><h2 className="text-xl font-bold text-slate-800">{teacher?__kbUi("Mavzular"):__kbUi("O‘rganish")}</h2>
   <p className="mt-1 text-sm text-slate-600">{__kbUi(viewerHeadline(catalog?.viewer,type,institutionLabel(type)))}</p></div>}
  {!kid&&<LearnerCurriculumHeader viewer={catalog?.viewer} type={type} lesson={lesson} fallbackType={profileInstitutionType(user)}
   onType={value=>{chosen.current=true;setType(value);setLesson('all');}}
   onLesson={setLesson} disabled={loading}/>}
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{__kbUi(error)}</p>}
  {loading?<p role="status" className="p-6 text-center text-slate-500">{__kbUi("Mavzular yuklanmoqda…")}</p>
   : catalog?.profil_sozlanmagan ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{teacher?__kbUi('Profilingizda faol ish joyini tanlang.'):__kbUi('Ta’lim profilingizni to‘ldiring: muassasa, yo‘nalish, ta’lim shakli, til, kurs, semestr va guruh mos bo‘lishi kerak.')}</p>
   : error&&!subjects.length ? null
   : !subjects.length && !(universityBrowse&&matched.length) ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">{__kbUi("Bu bo‘limga mos mavzular hali kiritilmagan.")}</p>
   : <>
    {universityBrowse&&<UniversityFilters subjects={matched} viewer={catalog?.viewer} value={uniFilterValue} onChange={value=>{setUniFilter(value);setSubjectKey('');}} onEducationSetup={onEducationSetup}/>}
    {kid&&<section aria-label={__kbUi("Fanlar")} className="kt-subjects">
     {subjects.map(subject=>{const active=subject.kalit===current?.kalit;
      return <button key={subject.kalit} type="button" aria-pressed={active} className={`kt-subject ${active?'is-on':''}`}
       onClick={()=>{chooseSubject(subject.kalit);sayName(fanNomiTil(subject.nom,locale),fanNomiTil(subject.nom,locale)!==fanNomiTil(subject.nom,'uz')&&String(locale).startsWith('en'));}}>
       <span className="kt-subject-emoji" aria-hidden="true"><FanBelgi emoji={kidSubjectEmoji(subject.nom)}/></span>
       <span className="kt-subject-name"><TranslatedContent text={fanNomiTil(subject.nom,locale)} showStatus={false}/></span>
      </button>;})}
    </section>}
    {!kid&&<section aria-label={__kbUi("Fanlar")}>
     <p className="mb-2 text-xs font-semibold text-slate-600">{__kbUi("1. Fanni tanlang")}</p>
     <div className="flex gap-2 overflow-x-auto pb-1">
      {subjects.map(subject=>{const stats=subjectStats(subject);const active=subject.kalit===current?.kalit;
       return <button key={subject.kalit} type="button" aria-pressed={active} onClick={()=>chooseSubject(subject.kalit)}
        className="shrink-0 rounded-xl border px-3 py-2 text-left"
        style={active?{background:'#1B4B7A',borderColor:'#1B4B7A',color:'#fff'}:{background:'#fff',borderColor:'#D5DCE3',color:'#1E293B'}}>
        <span className="block text-sm font-semibold"><TranslatedContent text={fanNomiTil(subject.nom,locale)} showStatus={false}/>{subject.dars_turi_nomi?` · ${__kbUi(subject.dars_turi_nomi)}`:''}</span>
        {universityBrowse&&<span className="block max-w-[260px] truncate text-[10.5px] opacity-80">{subject.mine?'🎯 ':''}{catalogSubjectDetails(subject)}</span>}
        <span className="block text-[11px] opacity-80">{__kbUi(`${stats.topics} mavzu · ${stats.lessons} dars · ${stats.tested} testli`)}</span>
       </button>;})}
     </div>
    </section>}
    <section aria-label={__kbUi("Mavzular")} className="space-y-3">
     {!kid&&<><p className="text-xs font-semibold text-slate-600">{__kbUi("2. Mavzuni toping")}</p>
     <div className="flex flex-wrap gap-2 lt-search-row">
      <input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={__kbUi("Mavzu nomini yozing…")}
       aria-label={__kbUi("Mavzu qidirish")} className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"/>
      <div className="flex gap-1" role="group" aria-label={__kbUi("Saralash")}>
       {[['all','Hammasi'],['dars','Darsi bor'],['test','Testi bor']].map(([key,label])=><button key={key} type="button" aria-pressed={filter===key} onClick={()=>setFilter(key)}
        className="rounded-lg border px-3 py-2 text-xs font-semibold"
        style={filter===key?{background:'#1E3A32',borderColor:'#1E3A32',color:'#F2F0E6'}:{background:'#fff',borderColor:'#D5DCE3',color:'#334155'}}>{__kbUi(label)}</button>)}
      </div>
     </div></>}
     {!groups.length&&<p className="rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">{__kbUi("Shartga mos mavzu topilmadi.")}</p>}
     {kid&&(()=>{const day=todayProgress(plan,planFan);if(!day)return null;const over=day.tugadi>=day.limit;
      return <div className={`kt-day ${over?'is-over':''}`} role="status">
       <span className="kt-day-dots" aria-hidden="true">{Array.from({length:day.limit},(_,i)=><i key={i} className={i<day.tugadi?'is-done':i<day.ochildi?'is-open':''}/>)}</span>
       <span className="kt-day-text"><b>{over?__kbUi("🎉 Bugungi darslar tugadi!"):__kbUi(`Bugun: ${day.limit} ta yangi dars`)}</b>
        <small>{over?__kbUi("Yangi dars ertaga ochiladi. O‘tilgan darslar va o‘yinlar ochiq."):day.damOlish?__kbUi("Dam olish kuni — bugun bitta dars ko‘proq!"):__kbUi(`${day.tugadi} / ${day.limit} bajarildi`)}</small></span>
      </div>;})()}
     {kid&&groups.map(group=>{const unlock=unlockOf(group);
      // REV121: yulduz 0 bo'lishi mumkin (hech biri to'g'ri emas) — «o'tildi» belgisi yulduzdan alohida
      const starsOf=(topic,target,i)=>topic.dars_bor?Math.max(lessonStars(target.lesson_code),unlock[i]?.tugadi?Number(unlock[i].yulduz??0):0):0;
      const doneOf=(topic,target,i)=>Boolean(topic.dars_bor&&(lessonDone(target.lesson_code)||unlock[i]?.tugadi));
      const next=group.mavzular.findIndex((t,i)=>t.dars_bor&&unlock[i]?.open&&!doneOf(t,topicTarget(current,group,t,type),i));
      return <div key={`kid-${group.sinf}`}>
      <p className="kt-age">🧸 {__kbUi(gradeLabel(type,group.sinf))}</p>
      <ul className="kt-grid">{group.mavzular.map((topic,i)=>{const target=topicTarget(current,group,topic,type);
       const stars=starsOf(topic,target,i);const done=doneOf(topic,target,i);const isNext=i===next;/* REV122: admin uchun hamma mavzu ochiq */const locked=!preview&&!user?.is_admin&&topic.dars_bor&&!unlock[i]?.open;const review=isReviewTopic(topic.nomi);
       const open=()=>{if(locked){sayName(__kbUi("Bu dars ertaga ochiladi"));return;}if(topic.dars_bor)openLesson(group,topic);};
       return <li key={catalogTopicKey(topic)} ref={isNext?nextRef:undefined} className={`kt-card ${done?'is-done':''} ${isNext?'is-next':''} ${locked?'is-locked':''} ${review?'is-review':''}`} style={{'--kt-bg':review?'#EDE3FF':kidTopicColor(i)}}
        onClick={e=>{if(e.target.closest('button'))return;open();}}>
        <span className="kt-no">{done?'✓':locked?'🔒':i+1}</span>
        {isNext&&<span className="kt-today">{__kbUi("Bugun shu!")}</span>}
        <button type="button" className="kt-emoji" aria-label={__kbUi(locked?"Ertaga ochiladi":"O‘rganamiz")} disabled={!topic.dars_bor} onClick={open}>{kidTopicEmoji(topic.nomi,i)}{!locked&&topic.dars_bor&&<span className="kt-play-badge" aria-hidden="true">▶</span>}</button>
        <p className="kt-title"><TranslatedContent text={capitalizeTopic(topic.nomi)} showStatus={false}/>
         <button type="button" className="kt-say" aria-label={__kbUi("Nomini eshitish")} onClick={()=>sayName(capitalizeTopic(topic.nomi),fanIzohi(current?.nom)==='en')}>🔊</button></p>
        <span className={`kt-kind ${review?'is-review':'is-new'}`}>{review?__kbUi("🔁 Takrorlash"):__kbUi("✨ Yangi mavzu")}</span>
        {done&&<span className="kt-stars" aria-label={`${stars} ⭐`}>{'⭐'.repeat(stars)}{'☆'.repeat(3-stars)}</span>}
        {locked&&<span className="kt-lock-note">🌙 {__kbUi("Ertaga")}</span>}
        {!locked&&topic.savol_soni>0&&onOpenTest&&(done||!topic.dars_bor||preview)&&<div className="kt-actions">
         <button type="button" className="kt-play" onClick={()=>onOpenTest({...target,topic_code:topic.topic_codes[0]})}>{__kbUi("🎮 O‘ynaymiz")}</button>
        </div>}
       </li>;})}
       {onOpenTest&&group.mavzular.some(t=>t.savol_soni>0)&&<li className="kt-card kt-review" style={{'--kt-bg':'#FFF1C9'}}>
        <span className="kt-emoji" aria-hidden="true">🎲</span>
        <p className="kt-title">{__kbUi("Aralash takror")}</p>
        <p className="kt-note">{__kbUi("Hamma o‘rganganlarimizdan savollar — har kuni o‘ynasa bo‘ladi!")}</p>
        <div className="kt-actions"><button type="button" className="kt-play" onClick={()=>{const tested=group.mavzular.filter(t=>t.savol_soni>0);const first=tested[0];
         onOpenTest({...topicTarget(current,group,first,type),topic_code:first.topic_codes[0],topic_codes:tested.flatMap(t=>t.topic_codes),track:'review'});}}>{__kbUi("🎮 Boshladik")}</button></div>
       </li>}
      </ul>
     </div>;})}
     {!kid&&groups.map(group=><div key={group.sinf}>
      <p className="mb-2 text-xs font-semibold text-slate-500">{__kbUi(gradeLabel(type,group.sinf))}</p>
      <ul className="space-y-2">{group.mavzular.map(topic=>{const target=topicTarget(current,group,topic,type);
       return <li key={catalogTopicKey(topic)} className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-sm font-medium text-slate-800"><TranslatedContent text={capitalizeTopic(topic.nomi)} showStatus={false}/>{topic.semestr > 0 && <small className="block text-xs text-slate-500">{topic.semestr}{__kbUi("-semestr")}</small>}</p>
        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
         {topic.dars_bor&&<span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">{__kbUi("📘 Kitob darsi")}</span>}
         <span className={`rounded-full px-2 py-0.5 ${topic.savol_soni?'bg-sky-50 text-sky-800':'bg-slate-100 text-slate-500'}`}>{topic.savol_soni?__kbUi(`📝 ${topic.savol_soni} ta test savoli`):__kbUi('Test hali yo‘q')}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
         {!teacher&&topic.dars_bor&&<button type="button" onClick={()=>openLesson(group,topic)} className="rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{background:'#1E3A32'}}>{__kbUi("▶ Darsni boshlash")}</button>}
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
