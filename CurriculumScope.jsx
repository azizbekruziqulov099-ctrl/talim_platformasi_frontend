import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {scopedRequest} from './scopeRequest.js';
import {InstitutionTabs,LessonTabs} from './CurriculumTabs.jsx';
import {semesterPairLabel,FORM_LABELS,groupPrograms,programKey,programLabel,institutionLabel,lessonLabel} from './catalog.js';
const Context=createContext(null);
const API=import.meta.env.VITE_API_BASE || 'https://talimplatformasi-production.up.railway.app';
const blank={institution_type:'universitet',institution_id:0,talim_bosqichi:'bakalavr',yonalish_id:0,yonalish_nomi:'',talim_shakli:'kunduzgi',talim_tili:'uz',kurs:1,semestr:1,guruh:'',dars_turi:'maruza'};
const input='w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm';
const button='rounded-xl bg-sky-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50';
function Field({name,children}) {return <label className="block text-xs font-semibold text-slate-600">{name}<div className="mt-1">{children}</div></label>;}
function Select({value,onChange,children,disabled=false}) {return <select className={input} value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}>{children}</select>;}
async function request(path,token,options={}) {
 const response=await fetch(`${API}/api/admin/curriculum${path}${path.includes('?')?'&':'?'}token=${encodeURIComponent(token)}`,options);
 const data=await response.json();
 if(!response.ok)throw new Error(typeof data.detail==='string'?data.detail:'So‘rov bajarilmadi');
 return data;
}
export function useCurriculum() {const context=useContext(Context);if(!context)throw new Error('CurriculumBoundary kerak');return context;}
export default function CurriculumBoundary({token,children,title='Mavzular va testlar'}) {
  useKbInterfaceLocale();
 const [scopes,setScopes]=useState([]),[selected,setSelected]=useState(''),[type,setType]=useState('maktab'),[lesson,setLesson]=useState('maruza');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const [showCreate,setShowCreate]=useState(false),[draft,setDraft]=useState({...blank}),[options,setOptions]=useState({institutions:[],programs:[]}),[optionsLoading,setOptionsLoading]=useState(false);
 const [unassigned,setUnassigned]=useState(0),[legacy,setLegacy]=useState(null),[legacyCodes,setLegacyCodes]=useState([]);
 const groups=useMemo(()=>groupPrograms(scopes,type),[scopes,type]);
 const selectedBase=scopes.find(s=>String(s.id)===String(selected)&&s.institution_type===type);
 const family=groups.find(g=>selectedBase&&g.key===programKey(selectedBase));
 const scope=family?.lessons[type==='universitet'?lesson:''];
 const institutions=[...new Map(groups.map(g=>[String(g.scope.institution_id),g.scope.institution_name])).entries()];
 const institutionId=String(selectedBase?.institution_id ?? '');
 const set=(key,value)=>setDraft(old=>({...old,[key]:value}));
 const choose=s=>{
  if(!s)return;
  setSelected(String(s.id));setType(s.institution_type);setLesson(s.dars_turi || 'maruza');setError('');setLegacyCodes([]);
  try{sessionStorage.setItem('curriculum-scope',String(s.id));}catch{}
 };
 useEffect(()=>{
  let live=true;setLoading(true);setScopes([]);setLegacy(null);setLegacyCodes([]);
  request('/scopes',token).then(data=>{
   if(!live)return;
   setScopes(data.scopes||[]);setUnassigned(data.unassigned||0);
   let saved='';try{saved=sessionStorage.getItem('curriculum-scope')||'';}catch{}
   choose(data.scopes.find(s=>String(s.id)===saved)||data.scopes.find(s=>s.scope_key==='school-common')||data.scopes[0]);
  }).catch(e=>live&&setError(e.message)).finally(()=>live&&setLoading(false));
  return()=>{live=false;};
 },[token]);
 useEffect(()=>{
  if(!showCreate)return;
  let live=true;setOptionsLoading(true);setOptions({institutions:[],programs:[]});
  request(`/options?institution_type=${draft.institution_type}&institution_id=${draft.institution_id}`,token)
   .then(data=>live&&setOptions(data)).catch(e=>live&&setError(e.message)).finally(()=>live&&setOptionsLoading(false));
  return()=>{live=false;};
 },[token,showCreate,draft.institution_type,draft.institution_id]);
 const addScopes=items=>setScopes(old=>[...old.filter(s=>!items.some(item=>String(item.id)===String(s.id))),...items]);
 const chooseType=next=>{
  setType(next);setError('');setLegacy(null);setLegacyCodes([]);setShowCreate(false);setLesson('maruza');
  const first=groupPrograms(scopes,next)[0];
  if(first)choose(first.lessons.maruza||first.scope);else setSelected('');
 };
 const chooseProgram=key=>{
  const next=groups.find(g=>g.key===key);
  if(next)choose(next.lessons[lesson]||next.lessons.maruza||next.scope);
 };
 const chooseInstitution=id=>{
  const next=groups.find(g=>String(g.scope.institution_id)===id);
  if(next)choose(next.lessons.maruza||next.scope);
 };
 const chooseLesson=async kind=>{
  setLesson(kind);setError('');setLegacyCodes([]);
  if(!family)return;
  const existing=family.lessons[kind];
  if(existing){choose(existing);return;}
  setBusy(true);
  try{
   const data=await request('/scopes',token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...family.scope,dars_turi:kind})});
   addScopes([data.scope]);choose(data.scope);
  }catch(e){setError(e.message);}finally{setBusy(false);}
 };
 const openCreate=()=>{setDraft({...blank,institution_type:type,institution_id:selectedBase?.institution_id||0});setShowCreate(true);setError('');};
 const create=async()=>{
  setBusy(true);setError('');
  try{
   const data=await request('/programs',token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});
   addScopes(data.scopes);choose(data.scopes.find(s=>s.dars_turi===lesson)||data.scope);setShowCreate(false);
  }catch(e){setError(e.message);}finally{setBusy(false);}
 };
 const openLegacy=async()=>{setError('');try{const data=await request('/unassigned',token);setLegacy(data.groups||[]);}catch(e){setError(e.message);}};
 const assign=async()=>{
  setBusy(true);setError('');
  try{
   const data=await request('/assign-legacy',token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scope_id:scope.id,topic_codes:legacyCodes})});
   setUnassigned(n=>Math.max(0,n-data.assigned));setLegacy(null);setLegacyCodes([]);
   // Refresh the content pane after assigning existing rows without changing scope.
   setContentVersion(v=>v+1);
  }catch(e){setError(e.message);}finally{setBusy(false);}
 };
 const [contentVersion,setContentVersion]=useState(0);
 const context=useMemo(()=>({scope,fetch:(url,options)=>scopedRequest(fetch,url,options,scope)}),[scope]);
 const program=options.programs.find(p=>String(p.id)===String(draft.yonalish_id));
 const languageAllowed=(lang,form=draft.talim_shakli)=>program?.variantlar?.length&&form!=='umumiy'?program.variantlar.some(v=>v.shakl===form&&v.til===lang):(!program?.tillar?.length||program.tillar.includes(lang));
 const chooseForm=form=>setDraft(d=>({...d,talim_shakli:form,talim_tili:languageAllowed(d.talim_tili,form)?d.talim_tili:(program?.variantlar?.find(v=>v.shakl===form)?.til||program?.tillar?.[0]||'uz')}));
 return <div className="space-y-4">
  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4" aria-label={__kbUi("Admin: muassasa va mashg‘ulot tanlash")}>
   <h2 className="mb-3 text-lg font-bold text-slate-900">{title}</h2>
   <InstitutionTabs value={type} onChange={chooseType} disabled={busy||loading}/>
   {!loading&&<div className="mt-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
     <h3 className="font-semibold text-slate-800">{__kbUi(institutionLabel(type))}{__kbUi(" bo‘limi")}</h3>
     <button type="button" disabled={busy} className="text-sm font-semibold text-sky-900" onClick={showCreate?()=>setShowCreate(false):openCreate}>{showCreate?__kbUi('Yopish'):type==='universitet'?__kbUi('+ Institut dasturi qo‘shish'):__kbUi('+ Muassasa qo‘shish')}</button>
    </div>
    {groups.length>0?<div className="grid gap-3 sm:grid-cols-2">
     <Field name={__kbUi("Muassasa")}><Select value={institutionId} onChange={chooseInstitution} disabled={busy}>{institutions.map(([id,name])=><option key={id} value={id}>{name}</option>)}</Select></Field>
     {type==='universitet'&&<Field name={__kbUi("Yo‘nalish · ta’lim shakli · kurs · semestr")}><Select value={family?.key||''} onChange={chooseProgram} disabled={busy}>{groups.filter(g=>String(g.scope.institution_id)===institutionId).map(g=><option key={g.key} value={g.key}>{__kbUi(programLabel(g.scope))}</option>)}</Select></Field>}
    </div>:<p className="rounded-xl bg-white p-3 text-sm text-slate-600">{__kbUi("Bu bo‘limga hali ")}{type==='universitet'?__kbUi('institut dasturi'):__kbUi('muassasa')}{__kbUi(" qo‘shilmagan. Yuqoridagi qo‘shish tugmasidan boshlang.")}</p>}
    {type==='universitet'&&family&&<LessonTabs value={lesson} onChange={chooseLesson} disabled={busy}/>}
    {scope&&<p className="mt-3 text-xs text-slate-600">{__kbUi(institutionLabel(type))}{type==='universitet'?__kbUi(` → ${__kbUi(lessonLabel(lesson))}`):__kbUi('')}{__kbUi(": quyidagi mavzu, test va import shu bo‘limga saqlanadi.")}</p>}
   </div>}
   {loading&&<p role="status" className="mt-3 text-sm text-slate-500">{__kbUi("Bo‘limlar yuklanmoqda…")}</p>}
   {showCreate&&<div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
    <h3 className="font-semibold">{__kbUi(institutionLabel(type))}{__kbUi(" — yangi ")}{type==='universitet'?__kbUi('ta’lim dasturi'):__kbUi('bo‘lim')}</h3>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
     <Field name={__kbUi("Muassasa")}><Select value={draft.institution_id} onChange={v=>setDraft(d=>({...d,institution_id:Number(v),yonalish_id:0,yonalish_nomi:''}))}><option value="0">{type==='maktab'?__kbUi('Maktablar uchun umumiy katalog'):type==='universitet'?__kbUi('Institut — umumiy testlar (muassasasiz)'):__kbUi('Muassasani tanlang')}</option>{options.institutions.map(i=><option key={i.id} value={i.id}>{i.nomi}</option>)}</Select></Field>
     {type==='universitet'&&<>
      <Field name={__kbUi("Bosqich")}><Select value={draft.talim_bosqichi} onChange={v=>setDraft(d=>({...d,talim_bosqichi:v,yonalish_id:0,yonalish_nomi:'',kurs:1,semestr:1}))}><option value="bakalavr">{__kbUi("Bakalavr")}</option><option value="magistr">{__kbUi("Magistr")}</option></Select></Field>
      <Field name={__kbUi("Yo‘nalish")}><Select value={draft.yonalish_id} onChange={v=>{const p=options.programs.find(p=>String(p.id)===v);setDraft(d=>({...d,yonalish_id:Number(v),yonalish_nomi:p?.nomi||'',talim_shakli:p?.variantlar?.[0]?.shakl||p?.shakllar?.[0]||'kunduzgi',talim_tili:p?.variantlar?.[0]?.til||p?.tillar?.[0]||'uz'}));}}><option value="0">{__kbUi("Yo‘nalishni tanlang")}</option>{options.programs.filter(p=>p.bosqich===draft.talim_bosqichi).map(p=><option key={p.id} value={p.id}>{p.nomi}</option>)}</Select></Field>
      {!optionsLoading&&!options.programs.length&&<Field name={__kbUi("Yo‘nalish nomi")}><input className={input} value={draft.yonalish_nomi} onChange={e=>set('yonalish_nomi',e.target.value)}/></Field>}
      <Field name={__kbUi("Ta’lim shakli")}><Select value={draft.talim_shakli} onChange={chooseForm}>{Object.entries(FORM_LABELS).filter(([v])=>!program?.shakllar?.length||program.shakllar.includes(v)||v==='umumiy').map(([v,label])=><option key={v} value={v}>{__kbUi(label)}</option>)}</Select></Field>
      <Field name={__kbUi("Ta’lim tili")}><Select value={draft.talim_tili} onChange={v=>set('talim_tili',v)}>{Object.entries({uz:'O‘zbek',ru:'Rus',tj:'Tojik',en:'Ingliz',kk:'Qoraqalpoq',kz:'Qozoq'}).filter(([v])=>languageAllowed(v)).map(([v,label])=><option key={v} value={v}>{__kbUi(label)}</option>)}</Select></Field>
      <Field name={__kbUi("Kurs")}><Select value={draft.kurs} onChange={v=>setDraft(d=>({...d,kurs:Number(v),semestr:2*Number(v)-1}))}>{__kbUi(Array.from({length:draft.talim_bosqichi==='magistr'?2:6},(_,i)=><option key={i} value={i+1}>{i+1}{__kbUi("-kurs")}</option>))}</Select></Field>
      <p className="text-xs text-slate-600">{__kbUi("Kursning ikkala semestri uchun ma’ruza, amaliyot, seminar va laboratoriya bo‘limlari birga ochiladi.")}</p><Field name={__kbUi("Kurs semestrlari")}><div className={input}>{__kbUi(semesterPairLabel(draft.kurs))}</div></Field>
      <Field name={__kbUi("Guruh (bo‘sh — barcha guruhlar)")}><input className={input} maxLength={16} value={draft.guruh} onChange={e=>set('guruh',e.target.value.toUpperCase())}/></Field>
     </>}
    </div>
    {type==='universitet'&&<p className="text-sm text-slate-600">{__kbUi("Saqlanganda Ma’ruza, Amaliyot, Seminar va Laboratoriya alohida bo‘lim sifatida ochiladi. Har biriga o‘z mavzu va testlaringizni qo‘shasiz.")}</p>}
    {optionsLoading&&<p role="status" className="text-sm text-slate-500">{__kbUi("Muassasa ma’lumotlari yuklanmoqda…")}</p>}
    <button type="button" className={button} disabled={busy||optionsLoading} onClick={create}>{busy?__kbUi('Saqlanmoqda…'):__kbUi('Saqlash')}</button>
   </div>}
   {unassigned>0&&scope&&<button type="button" className="mt-4 text-sm font-semibold text-amber-900" onClick={openLegacy}>{__kbUi("Eski mavzularni bo‘limga biriktirish (")}{unassigned})</button>}
   {legacy&&scope&&<div className="mt-3 space-y-2 rounded-xl bg-white p-3">
    <p className="text-sm font-semibold">{__kbUi("Tanlangan mavzular: ")}{__kbUi(institutionLabel(type))}{type==='universitet'?__kbUi(` → ${__kbUi(lessonLabel(lesson))}`):__kbUi('')}</p>
    <p className="text-xs text-slate-600">{__kbUi("Faqat aynan shu muassasa va ta’lim dasturiga tegishli eski mavzularni belgilang.")}</p>
    {legacy.map((g,i)=><label key={i} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={g.topic_codes.every(c=>legacyCodes.includes(c))} onChange={e=>setLegacyCodes(old=>e.target.checked?[...new Set([...old,...g.topic_codes])]:old.filter(c=>!g.topic_codes.includes(c)))}/><span>{g.grade} · {g.subject_name} · {lessonLabel(g.dars_turi)||g.dars_turi||__kbUi('Turi belgilanmagan')} — {g.count}{__kbUi(" mavzu")}</span></label>)}
    <button type="button" className={button} disabled={busy||!legacyCodes.length} onClick={assign}>{legacyCodes.length}{__kbUi(" ta mavzuni biriktirish")}</button>
    <button type="button" className="ml-3 text-sm" onClick={()=>setLegacy(null)}>{__kbUi("Yopish")}</button>
   </div>}
   {error&&<p role="alert" className="mt-3 text-sm text-red-800">{__kbUi(error)}</p>}
  </section>
  {scope&&!busy&&<Context.Provider value={context}><React.Fragment key={`${token}:${scope.id}:${contentVersion}`}>{children}</React.Fragment></Context.Provider>}
 </div>;
}
