import React, { useMemo } from 'react';
import { uiText as __kbUi } from '../interface/interfaceRuntime.js';
import { useInterface as useKbInterfaceLocale } from '../interface/InterfacePreferences.jsx';
import { EMPTY_UNIVERSITY_FILTER, universityOptions } from './universityFilters.js';

/** Talaba uchun katalog filtri: «Mening yo'nalishim» yoki barcha institutlar + tanlovlar. */
export default function UniversityFilters({ subjects, viewer, value, onChange, onEducationSetup }) {
  useKbInterfaceLocale();
  const options = useMemo(() => universityOptions(subjects), [subjects]);
  const set = (patch) => onChange({ ...value, ...patch });
  const select = (key, label, list) => list.length > 1 && <label className="flex min-w-0 flex-col gap-1 text-[11px] font-semibold text-slate-600">
    {__kbUi(label)}
    <select value={value[key]} onChange={(e) => set({ [key]: e.target.value })} className="min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-normal text-slate-800">
      <option value="">{__kbUi('Hammasi')}</option>
      {list.map(([key2, name]) => <option key={key2} value={key2}>{__kbUi(name)}</option>)}
    </select>
  </label>;
  return <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3" aria-label={__kbUi('Institut katalogi filtri')}>
    <div className="flex flex-wrap items-center gap-2">
      {viewer?.profil_toliq && <button type="button" aria-pressed={value.mine} onClick={() => set({ mine: true })}
        className="rounded-lg border px-3 py-2 text-xs font-semibold" style={value.mine ? { background: '#1B4B7A', borderColor: '#1B4B7A', color: '#fff' } : { background: '#fff', borderColor: '#D5DCE3', color: '#334155' }}>{__kbUi('🎯 Mening yo‘nalishim')}</button>}
      <button type="button" aria-pressed={!value.mine} onClick={() => set({ mine: false })}
        className="rounded-lg border px-3 py-2 text-xs font-semibold" style={!value.mine ? { background: '#1B4B7A', borderColor: '#1B4B7A', color: '#fff' } : { background: '#fff', borderColor: '#D5DCE3', color: '#334155' }}>{__kbUi('🏛 Barcha institutlar')}</button>
      {!value.mine && (value.institution || value.program || value.form || value.language) && <button type="button" className="text-xs font-semibold text-sky-900" onClick={() => onChange({ ...EMPTY_UNIVERSITY_FILTER })}>{__kbUi('Filtrni tozalash')}</button>}
    </div>
    {!value.mine && <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {select('institution', 'Institut', options.institutions)}
      {select('program', 'Yo‘nalish', options.programs)}
      {select('form', 'Ta’lim shakli', options.forms)}
      {select('language', 'Ta’lim tili', options.languages)}
    </div>}
    {!viewer?.profil_toliq && <p className="mt-2 text-xs text-slate-500">{__kbUi('Barcha institut testlari ochiq. Kursingiz va yo‘nalishingizni sozlasangiz, sizga mos fanlar birinchi chiqadi.')}{onEducationSetup && <> <button type="button" className="font-semibold text-sky-900" onClick={onEducationSetup}>{__kbUi('Sozlash')}</button></>}</p>}
  </section>;
}
