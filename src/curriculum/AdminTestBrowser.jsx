import React, { useEffect, useMemo, useState } from 'react';
import { uiText as t } from '../interface/interfaceRuntime.js';
import { useInterface } from '../interface/InterfacePreferences.jsx';
import { InstitutionTabs } from './CurriculumTabs.jsx';
import { INSTITUTE_FILTERS, instituteSelection, selectionFromScope, instituteReadFilters, instituteGrade } from './adminTestCatalog.js';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://talimplatformasi-production.up.railway.app';
const selectClass = 'min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm disabled:opacity-60';

export default function AdminTestBrowser({ token, Tests }) {
  useInterface();
  const [scopes, setScopes] = useState([]);
  const [type, setType] = useState('maktab');
  const [preferred, setPreferred] = useState({});
  const [institution, setInstitution] = useState('');
  const [general, setGeneral] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [testActive, setTestActive] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setScopes([]); setGeneral(false);
    fetch(`${API_BASE}/api/admin/curriculum/scopes?${new URLSearchParams({ token })}`, { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Bo‘limlarni yuklab bo‘lmadi.');
        if (!Array.isArray(data.scopes)) throw new Error('Bo‘limlar ro‘yxati kelmadi. Qayta urinib ko‘ring.');
        return data.scopes;
      })
      .then(rows => {
        if (controller.signal.aborted) return;
        let saved = ''; try { saved = sessionStorage.getItem('curriculum-scope') || ''; } catch {}
        const first = rows.find(scope => String(scope.id) === saved) || rows.find(scope => scope.scope_key === 'school-common') || rows[0];
        setScopes(rows); setType(first?.institution_type || 'maktab');
        setInstitution(String(first?.institution_id ?? ''));
        setPreferred(selectionFromScope(first?.institution_type === 'universitet' ? first : null));
      })
      .catch(reason => { if (!controller.signal.aborted) setError(reason.message || 'Bo‘limlarni yuklab bo‘lmadi.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token, reload]);

  const institute = useMemo(() => instituteSelection(scopes, preferred), [scopes, preferred]);
  const otherInstitutions = [...new Map(scopes.filter(scope => scope.institution_type === type)
    .map(scope => [String(scope.institution_id), scope.institution_name])).entries()];
  const institutionId = otherInstitutions.some(([id]) => id === institution) ? institution : otherInstitutions[0]?.[0] ?? '';
  const selectedScope = institute.scopes[0];
  const generalInstitute = type === 'universitet' && general;
  const filters = type === 'universitet'
    ? (generalInstitute ? {} : instituteReadFilters(selectedScope))
    : (institutionId !== '' ? { institution_id: Number(institutionId) } : null);
  const browse = {
    type, filters,
    initialGrade: type === 'universitet' && !generalInstitute ? instituteGrade(selectedScope) : null,
  };
  const browseKey = JSON.stringify([token, type, filters, generalInstitute, reload]);
  const changeType = next => { setType(next); setGeneral(false); };
  const choose = (field, value) => {
    const next = instituteSelection(scopes, { ...institute.selection, [field]: value });
    setPreferred(next.selection);
    try { if (next.scopes[0]) sessionStorage.setItem('curriculum-scope', String(next.scopes[0].id)); } catch {}
  };

  return <div className="space-y-4 pb-4">
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4" aria-label={t('Admin testlarini topish')}>
      <h2 className="mb-3 text-lg font-bold text-slate-900">{t('Testlar')}</h2>
      <InstitutionTabs value={type} onChange={changeType} disabled={loading || testActive}/>
      {loading && <p role="status" className="mt-4 text-sm text-slate-600">{t('Bo‘limlar yuklanmoqda…')}</p>}
      {error && <div role="alert" className="mt-4 text-sm text-red-800">
        <p>{t(error)}</p><button type="button" className="mt-2 rounded-lg border px-3 py-2 font-semibold" onClick={() => setReload(value => value + 1)}>{t('Qayta urinish')}</button>
      </div>}
      {!loading && !error && <>
        {type === 'universitet' && <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={general} disabled={testActive} onChange={event => setGeneral(event.target.checked)}/>
          <span><span className="block font-semibold text-slate-900">{t('Umumiy qidirish')}</span>
            <span className="block text-sm text-slate-600">{t('Barcha institutlar. Kursni oching — fanlar va testlar ko‘rinadi.')}</span></span>
        </label>}
        {!generalInstitute && (filters ? <div className="mt-4 grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-3">
          {type === 'universitet' ? INSTITUTE_FILTERS.map(([field, label]) => <label key={field} className={`min-w-0 space-y-1 text-sm font-semibold text-slate-700 ${['institution_id','program'].includes(field) ? 'col-span-2 lg:col-span-1' : ''}`}>
            <span className="block">{t(label)}</span>
            <select aria-label={t(label)} className={selectClass} value={institute.selection[field]} disabled={testActive} onChange={event => choose(field, event.target.value)}>
              {institute.options[field].map(item => <option key={item.value} value={item.value}>{t(item.label)}</option>)}
            </select>
          </label>) : <label className="col-span-2 min-w-0 space-y-1 text-sm font-semibold text-slate-700">
            <span className="block">{t('Muassasa')}</span>
            <select className={selectClass} value={institutionId} disabled={testActive} onChange={event => setInstitution(event.target.value)}>
              {otherInstitutions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>}
        </div> : <p className="mt-4 text-sm text-slate-600">{t('Bu bo‘limda hali o‘quv dasturi yo‘q.')}</p>)}
        {type === 'universitet' && !general && filters && <p className="mt-3 text-sm text-slate-600">{t('Shu kursning ikkala semestri va barcha mashg‘ulot turlaridagi testlar quyida.')}</p>}
      </>}
    </section>
    {!loading && !error && filters && <Tests key={browseKey} token={token} catalogBrowse={browse} onTestFaollik={setTestActive}/>}
  </div>;
}
