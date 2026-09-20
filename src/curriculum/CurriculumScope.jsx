import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { scopedRequest } from './scopeRequest.js';
const Context = createContext(null);
const API = import.meta.env.VITE_API_BASE || 'https://talimplatformasi-production.up.railway.app';
const labels = {maktab:'Maktab',universitet:'Institut',bogcha:'Bog‘cha',markaz:'Markaz'};
const forms = {kunduzgi:'Kunduzgi',kechki:'Kechki',sirtqi:'Sirtqi',masofaviy:'Masofaviy',umumiy:'Shakllar uchun umumiy'};
const lessons = {maruza:'Ma’ruza',amaliy:'Amaliy',seminar:'Seminar',laboratoriya:'Laboratoriya'};
const blank = {institution_type:'universitet',institution_id:0,talim_bosqichi:'bakalavr',yonalish_id:0,yonalish_nomi:'',talim_shakli:'kunduzgi',talim_tili:'uz',kurs:1,semestr:1,guruh:'',dars_turi:'maruza'};
const input = 'w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm';
const button = 'rounded-xl bg-sky-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';
function Field({name,children}) { return <label className="block text-xs font-semibold text-stone-600">{name}<div className="mt-1">{children}</div></label>; }
function Select({value,onChange,children}) { return <select className={input} value={value} onChange={e=>onChange(e.target.value)}>{children}</select>; }
async function request(path,token,options={}) {
 const response=await fetch(`${API}/api/admin/curriculum${path}${path.includes('?')?'&':'?'}token=${encodeURIComponent(token)}`,options);
 const data=await response.json();
 if(!response.ok) throw new Error(typeof data.detail==='string'?data.detail:'So‘rov bajarilmadi');
 return data;
}
export function useCurriculum() { const context=useContext(Context); if(!context) throw new Error('CurriculumBoundary kerak'); return context; }
export default function CurriculumBoundary({token,children}) {
 const [scopes,setScopes]=useState([]),[selected,setSelected]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [showCreate,setShowCreate]=useState(false),[draft,setDraft]=useState({...blank}),[options,setOptions]=useState({institutions:[],programs:[]});
 const [unassigned,setUnassigned]=useState(0),[legacy,setLegacy]=useState(null),[legacyCodes,setLegacyCodes]=useState([]);
 const set=(key,value)=>setDraft(old=>({...old,[key]:value}));
 const scope=scopes.find(s=>String(s.id)===String(selected));
 const refresh=async(prefer)=>{
  const d=await request('/scopes',token);setScopes(d.scopes||[]);setUnassigned(d.unassigned||0);
  let saved=prefer;
  if(!saved) {try{saved=sessionStorage.getItem('curriculum-scope');}catch{}}
  const chosen=d.scopes.find(s=>String(s.id)===String(saved))||d.scopes.find(s=>s.scope_key==='school-common');
  setSelected(chosen?String(chosen.id):'');
 };
 useEffect(()=>{let live=true;setBusy(true);request('/scopes',token).then(d=>{
  if(!live)return;setScopes(d.scopes||[]);setUnassigned(d.unassigned||0);
  let saved='';try{saved=sessionStorage.getItem('curriculum-scope')||'';}catch{}
  const chosen=d.scopes.find(s=>String(s.id)===saved)||d.scopes.find(s=>s.scope_key==='school-common');setSelected(chosen?String(chosen.id):'');
 }).catch(e=>live&&setError(e.message)).finally(()=>live&&setBusy(false));return()=>{live=false;};},[token]);
 useEffect(()=>{if(!showCreate)return;let live=true;setOptions({institutions:[],programs:[]});
  request(`/options?institution_type=${draft.institution_type}&institution_id=${draft.institution_id}`,token).then(d=>live&&setOptions(d)).catch(e=>live&&setError(e.message));
  return()=>{live=false;};
 },[token,showCreate,draft.institution_type,draft.institution_id]);
 const choose=id=>{setSelected(String(id));setLegacyCodes([]);setError('');try{sessionStorage.setItem('curriculum-scope',String(id));}catch{}};
 const create=async()=>{setBusy(true);setError('');try{
  const d=await request('/scopes',token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});
  await refresh(d.scope.id);choose(d.scope.id);setShowCreate(false);
 }catch(e){setError(e.message);}finally{setBusy(false);}};
 const openLegacy=async()=>{setError('');try{const d=await request('/unassigned',token);setLegacy(d.groups||[]);}catch(e){setError(e.message);}};
 const assign=async()=>{setBusy(true);setError('');try{
  await request('/assign-legacy',token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scope_id:scope.id,topic_codes:legacyCodes})});
  setLegacy(null);setLegacyCodes([]);await refresh(scope.id);
 }catch(e){setError(e.message);}finally{setBusy(false);}};
 const context=useMemo(()=>({scope,fetch:(url,options)=>scopedRequest(fetch,url,options,scope)}),[scope]);
 const program=options.programs.find(p=>String(p.id)===String(draft.yonalish_id));
 const languageAllowed=(lang,form=draft.talim_shakli)=>program?.variantlar?.length && form!=='umumiy' ? program.variantlar.some(v=>v.shakl===form&&v.til===lang) : (!program?.tillar?.length||program.tillar.includes(lang));
 const chooseForm=form=>setDraft(d=>({...d,talim_shakli:form,talim_tili:languageAllowed(d.talim_tili,form)?d.talim_tili:(program?.variantlar?.find(v=>v.shakl===form)?.til||program?.tillar?.[0]||'uz')}));
 return <div className="space-y-4">
  <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4" aria-label="O‘quv dasturi tanlovi">
   <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold text-sky-950">O‘quv dasturi</h2><button type="button" className="text-sm font-semibold text-sky-900" onClick={()=>setShowCreate(v=>!v)}>{showCreate?'Yopish':'+ Dastur qo‘shish'}</button></div>
   <Select value={selected} onChange={choose}><option value="">{busy?'Yuklanmoqda…':'Dastur tanlang'}</option>{scopes.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</Select>
   {scope&&<p className="mt-2 text-xs text-sky-900">Mavzular, shablonlar va import shu dasturga tegishli. {scope.institution_type==='universitet'?'Talabaga uning institut, yo‘nalish, shakl, til, kurs va semestriga mos material chiqadi.':''}</p>}
   {showCreate&&<div className="mt-4 border-t border-sky-200 pt-4">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
     <Field name="Muassasa turi"><Select value={draft.institution_type} onChange={v=>setDraft({...blank,institution_type:v})}>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</Select></Field>
     <Field name="Muassasa"><Select value={draft.institution_id} onChange={v=>setDraft(d=>({...d,institution_id:Number(v),yonalish_id:0,yonalish_nomi:''}))}><option value="0">{draft.institution_type==='maktab'?'Maktablar uchun umumiy katalog':'Muassasani tanlang'}</option>{options.institutions.map(i=><option key={i.id} value={i.id}>{i.nomi}</option>)}</Select></Field>
     {draft.institution_type==='universitet'&&<>
      <Field name="Ta’lim bosqichi"><Select value={draft.talim_bosqichi} onChange={v=>setDraft(d=>({...d,talim_bosqichi:v,yonalish_id:0,yonalish_nomi:'',kurs:1,semestr:1}))}><option value="bakalavr">Bakalavr</option><option value="magistr">Magistr</option></Select></Field>
      <Field name="Yo‘nalish"><Select value={draft.yonalish_id} onChange={v=>{const p=options.programs.find(p=>String(p.id)===v);setDraft(d=>({...d,yonalish_id:Number(v),yonalish_nomi:p?.nomi||'',talim_shakli:p?.variantlar?.[0]?.shakl||p?.shakllar?.[0]||'kunduzgi',talim_tili:p?.variantlar?.[0]?.til||p?.tillar?.[0]||'uz'}));}}><option value="0">{options.programs.length?'Yo‘nalishni tanlang':'Yo‘nalish nomini quyida yozing'}</option>{options.programs.filter(p=>p.bosqich===draft.talim_bosqichi).map(p=><option key={p.id} value={p.id}>{p.nomi}</option>)}</Select></Field>
      {!options.programs.length&&<Field name="Yo‘nalish nomi"><input className={input} value={draft.yonalish_nomi} onChange={e=>set('yonalish_nomi',e.target.value)}/></Field>}
      <Field name="Ta’lim shakli"><Select value={draft.talim_shakli} onChange={chooseForm}>{Object.entries(forms).filter(([v])=>!program?.shakllar?.length||program.shakllar.includes(v)||v==='umumiy').map(([v,l])=><option key={v} value={v}>{l}</option>)}</Select></Field>
      <Field name="Ta’lim tili"><Select value={draft.talim_tili} onChange={v=>set('talim_tili',v)}>{Object.entries({uz:'O‘zbek',ru:'Rus',tj:'Tojik',en:'Ingliz',kk:'Qoraqalpoq',kz:'Qozoq'}).filter(([v])=>languageAllowed(v)).map(([v,l])=><option key={v} value={v}>{l}</option>)}</Select></Field>
      <Field name="Kurs"><Select value={draft.kurs} onChange={v=>setDraft(d=>({...d,kurs:Number(v),semestr:2*Number(v)-1}))}>{Array.from({length:draft.talim_bosqichi==='magistr'?2:6},(_,i)=><option key={i} value={i+1}>{i+1}-kurs</option>)}</Select></Field>
      <Field name="Semestr"><Select value={draft.semestr} onChange={v=>set('semestr',Number(v))}>{[2*draft.kurs-1,2*draft.kurs].map(v=><option key={v} value={v}>{v}-semestr</option>)}</Select></Field>
      <Field name="Mashg‘ulot turi"><Select value={draft.dars_turi} onChange={v=>set('dars_turi',v)}>{Object.entries(lessons).map(([v,l])=><option key={v} value={v}>{l}</option>)}</Select></Field>
      <Field name="Guruh (bo‘sh — shu dasturdagi barcha guruhlar)"><input className={input} maxLength={32} value={draft.guruh} onChange={e=>set('guruh',e.target.value.toUpperCase())}/></Field>
     </>}
    </div><button type="button" className={`${button} mt-3`} disabled={busy} onClick={create}>Dasturni saqlash</button>
   </div>}
   {unassigned>0&&<div className="mt-3 text-sm"><button type="button" className="font-semibold text-amber-900" onClick={openLegacy}>{unassigned} ta eski mavzuning dasturini belgilash</button></div>}
   {legacy&&scope&&<div className="mt-3 space-y-2 rounded-xl bg-white p-3"><p className="text-sm font-semibold">Tanlangan eski mavzularni yuqoridagi dasturga biriktirish</p><p className="text-xs text-stone-600">Mavzular qaysi muassasa va ta’lim shakliga tegishli ekanligini tekshirib tanlang.</p>
    {legacy.map((g,i)=><label key={i} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={g.topic_codes.every(c=>legacyCodes.includes(c))} onChange={e=>setLegacyCodes(old=>e.target.checked?[...new Set([...old,...g.topic_codes])]:old.filter(c=>!g.topic_codes.includes(c)))}/><span>{g.grade} · {g.subject_name} · {g.dars_turi||'Turi belgilanmagan'} — {g.count} mavzu</span></label>)}
    <button type="button" className={button} disabled={busy||!legacyCodes.length} onClick={assign}>{legacyCodes.length} ta mavzuni shu dasturga biriktirish</button><button type="button" className="ml-3 text-sm" onClick={()=>setLegacy(null)}>Bekor</button>
   </div>}
   {error&&<p role="alert" className="mt-3 text-sm text-red-800">{error}</p>}
  </section>
  {scope&&<Context.Provider value={context}><React.Fragment key={`${token}:${scope.id}`}>{children}</React.Fragment></Context.Provider>}
 </div>;
}
