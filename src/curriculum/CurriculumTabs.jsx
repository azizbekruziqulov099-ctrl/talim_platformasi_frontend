import React from 'react';
import {INSTITUTION_TYPES,LESSON_TYPES,FORM_LABELS} from './catalog.js';

function Tabs({items,value,onChange,label,disabled=false}) {
 return <nav aria-label={label} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
  {items.map(item=><button key={item.key} type="button" aria-pressed={value===item.key}
   disabled={disabled} onClick={()=>onChange(item.key)}
   className="min-h-11 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors disabled:opacity-50"
   style={value===item.key ? {background:'#1B4B7A',borderColor:'#1B4B7A',color:'#fff'} : {background:'#fff',borderColor:'#D5DCE3',color:'#334155'}}>
   {item.icon&&<span className="mr-1.5" aria-hidden="true">{item.icon}</span>}{item.label}
  </button>)}
 </nav>;
}
export function InstitutionTabs({types=INSTITUTION_TYPES.map(item=>item.key),...props}) {
 return <Tabs {...props} items={INSTITUTION_TYPES.filter(item=>types.includes(item.key))} label="Muassasa bo‘limlari"/>;
}
export function LessonTabs(props) {
 return <div className="mt-4"><p className="mb-2 text-xs font-semibold text-slate-600">Mashg‘ulot turi</p>
  <Tabs {...props} items={LESSON_TYPES} label="Mashg‘ulot turlari"/>
 </div>;
}
export function LearnerCurriculumHeader({viewer,type,lesson,onType,onLesson,fallbackType='maktab',disabled=false}) {
 const types=viewer?.admin ? INSTITUTION_TYPES.map(item=>item.key) : (viewer?.types || [fallbackType]);
 const profile=viewer?.profile;
 return <section className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-3" aria-label="Mavzu va test bo‘limlari">
  <InstitutionTabs types={types} value={type} onChange={onType} disabled={disabled}/>
  {type==='universitet'&&<>
   {profile&&<p className="mt-3 text-xs leading-relaxed text-slate-600">{profile.yonalish_nomi} · {FORM_LABELS[profile.talim_shakli]} · {profile.talim_tili?.toUpperCase()} · {profile.kurs}-kurs · {profile.semestr ? `${profile.semestr}-semestr` : 'Semestrni profilda tanlang'}</p>}
   <LessonTabs value={lesson} onChange={onLesson} disabled={disabled}/>
  </>}
 </section>;
}
