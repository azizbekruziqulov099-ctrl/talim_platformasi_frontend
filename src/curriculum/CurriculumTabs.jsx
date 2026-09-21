import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React from 'react';
import {semesterPairLabel,INSTITUTION_TYPES,LESSON_TYPES,FORM_LABELS} from './catalog.js';

function Tabs({items,value,onChange,label,disabled=false}) {
  useKbInterfaceLocale();
 return <nav aria-label={__kbUi(label)} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
  {items.map(item=><button key={item.key} type="button" aria-pressed={value===item.key}
   disabled={disabled} onClick={()=>onChange(item.key)}
   className="min-h-11 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors disabled:opacity-50"
   style={value===item.key ? {background:'#1B4B7A',borderColor:'#1B4B7A',color:'#fff'} : {background:'#fff',borderColor:'#D5DCE3',color:'#334155'}}>
   {item.icon&&<span className="mr-1.5" aria-hidden="true">{item.icon}</span>}{__kbUi(item.label)}
  </button>)}
 </nav>;
}
export function InstitutionTabs({types=INSTITUTION_TYPES.map(item=>item.key),...props}) {
  useKbInterfaceLocale();
 return <Tabs {...props} items={INSTITUTION_TYPES.filter(item=>types.includes(item.key))} label={__kbUi("Muassasa bo‘limlari")}/>;
}
export function LessonTabs(props) {
  useKbInterfaceLocale();
 return <div className="mt-4"><p className="mb-2 text-xs font-semibold text-slate-600">{__kbUi("Mashg‘ulot turi")}</p>
  <Tabs {...props} items={LESSON_TYPES} label={__kbUi("Mashg‘ulot turlari")}/>
 </div>;
}
export function LearnerCurriculumHeader({viewer,type,lesson,onType,onLesson,fallbackType='maktab',disabled=false}) {
  useKbInterfaceLocale();
 const types=viewer?.admin ? INSTITUTION_TYPES.map(item=>item.key) : (viewer?.types || [fallbackType]);
 const profile=viewer?.profile;
 return <section className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-3" aria-label={__kbUi("Mavzu va test bo‘limlari")}>
  <InstitutionTabs types={types} value={type} onChange={onType} disabled={disabled}/>
  {type==='universitet'&&<>
   {profile&&<p className="mt-3 text-xs leading-relaxed text-slate-600">{profile.yonalish_nomi} · {__kbUi(FORM_LABELS[profile.talim_shakli])} · {__kbUi(profile.talim_tili?.toUpperCase())} · {profile.kurs}{__kbUi("-kurs · ")}{profile.semestr ? __kbUi(`${semesterPairLabel(profile.kurs)}`) : __kbUi('Semestrni profilda tanlang')}</p>}
   <LessonTabs value={lesson} onChange={onLesson} disabled={disabled}/>
  </>}
 </section>;
}
