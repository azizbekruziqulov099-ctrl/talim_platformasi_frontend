import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, { useEffect, useRef, useState } from 'react';
import { workspaceRequest } from '../workspace/kabutarWorkspaceClient.js';
import { accessCodeFile, accessCodeRole } from './institutionAccessCodes.js';

export default function SchoolAccessCodes({ apiBase = '', token, maktabId }) {
  useKbInterfaceLocale();
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [issued, setIssued] = useState(null);
  const [copied, setCopied] = useState(false);
  const request = useRef(null);
  const flight = useRef(false);
  const active = useRef(false);
  useEffect(() => {
    active.current = true;
    flight.current = false;
    setQuery(''); setPeople([]); setSearched(false); setSelected(null);
    setBusy(''); setError(''); setIssued(null); setCopied(false);
    return () => { active.current = false; request.current?.abort(); };
  }, [apiBase, token, maktabId]);

  async function search(event) {
    event.preventDefault();
    if (flight.current) return;
    if (query.trim().length < 2) { setError('Ism yoki familiyadan kamida 2 ta harf yozing.'); return; }
    const controller = new AbortController();
    request.current = controller; flight.current = true;
    setBusy('search'); setError(''); setSelected(null); setIssued(null); setCopied(false);
    try {
      const params = new URLSearchParams({ maktab_id: String(maktabId), ism: query.trim() });
      const result = await workspaceRequest(apiBase, `/api/admin/maktab_shaxs_qidir?${params}`, token, { signal: controller.signal });
      if (!active.current || controller.signal.aborted) return;
      if (!Array.isArray(result.natijalar)) throw new Error('Qidiruv natijasi to‘liq qaytmadi. Qayta qidiring.');
      const valid = result.natijalar.every(person => Number.isSafeInteger(Number(person?.user_id)) && Number(person.user_id) !== 0 && typeof person.full_name === 'string');
      if (!valid) throw new Error('Shaxs ma’lumotlari to‘liq qaytmadi. Qayta qidiring.');
      setPeople(result.natijalar); setSearched(true);
    } catch (problem) {
      if (active.current && !controller.signal.aborted) { setPeople([]); setSearched(false); setError(problem.message); }
    } finally {
      if (active.current && request.current === controller) { flight.current = false; setBusy(''); }
    }
  }

  async function regenerate() {
    if (flight.current || !selected || issued) return;
    const personId = Number(selected.user_id);
    const schoolId = Number(maktabId);
    if (!Number.isSafeInteger(personId) || !personId || !Number.isSafeInteger(schoolId) || schoolId < 1) {
      setError('Maktab va shaxsni qayta tanlang.'); return;
    }
    const controller = new AbortController();
    request.current = controller; flight.current = true; setBusy('issue'); setError('');
    try {
      const result = await workspaceRequest(apiBase, '/api/admin/maktab_shaxs_kirish_kodi', token, {
        method: 'POST', body: { token, maktab_id: schoolId, user_id: personId }, signal: controller.signal,
      });
      if (!active.current || controller.signal.aborted) return;
      if (Number(result.user_id) !== personId || Number(result.maktab_id) !== schoolId) {
        throw new Error('Kod tanlangan shaxs uchun tasdiqlanmadi. Administratorga murojaat qiling.');
      }
      accessCodeFile({ access_codes: [result] });
      setIssued(result); setCopied(false);
    } catch (problem) {
      if (active.current && !controller.signal.aborted) setError(problem.message);
    } finally {
      if (active.current && request.current === controller) { flight.current = false; setBusy(''); }
    }
  }

  function download() {
    try {
      const file = accessCodeFile({ access_codes: issued ? [issued] : [] });
      if (!file) return;
      const url = URL.createObjectURL(new Blob([file.text], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url; link.download = file.filename;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (problem) { setError(problem.message); }
  }

  async function copy() {
    if (!issued) return;
    try { await navigator.clipboard.writeText(issued.code); setCopied(true); }
    catch { setError('Nusxalashga brauzer ruxsat bermadi. Kodni belgilang yoki faylni yuklab oling.'); }
  }

  return <section className="space-y-5" aria-label={__kbUi("Shaxsiy ulanish kodlari")}>
    <div><h2 className="text-xl font-bold text-slate-900">{__kbUi("Muassasaga ulanish kodini yangilash")}</h2>
      <p className="mt-2 text-sm text-slate-600">{__kbUi("Oldin kiritilgan xodim, o‘quvchi yoki ota-onani toping. Uning mavjud sinfi, darslari va yuklamasi saqlanadi.")}</p></div>
    <form onSubmit={search} className="flex flex-wrap items-end gap-3">
      <label className="flex-1 min-w-48 text-sm font-semibold text-slate-700" htmlFor="school-code-person">{__kbUi("Ism yoki familiya")}<input id="school-code-person" className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3" value={query} maxLength={100} autoComplete="off" disabled={Boolean(busy)} placeholder={__kbUi("Masalan: Azizov")}
          onChange={event => { setQuery(event.target.value); setSelected(null); setPeople([]); setSearched(false); setIssued(null); setCopied(false); setError(''); }}/></label>
      <button type="submit" disabled={Boolean(busy) || query.trim().length < 2} className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy === 'search' ? __kbUi('Qidirilmoqda…') : __kbUi('Shaxsni qidirish')}</button>
    </form>
    {searched && !people.length && <p role="status" className="text-sm text-slate-600">{__kbUi("Bu maktabda mos shaxs topilmadi. Familiyasining bir qismini yozib ko‘ring.")}</p>}
    {people.length > 0 && <fieldset className="space-y-2"><legend className="mb-2 text-sm font-semibold text-slate-700">{__kbUi("Kerakli shaxsni tanlang")}</legend>
      {people.map(person => <button key={person.user_id} type="button" disabled={Boolean(busy)} aria-pressed={selected?.user_id === person.user_id}
        onClick={() => { setSelected(person); setIssued(null); setCopied(false); setError(''); }}
        className={`flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border p-4 text-left ${selected?.user_id === person.user_id ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white'}`}>
        <span className="font-semibold text-slate-900">{person.full_name}</span><span className="text-sm text-slate-500">{__kbUi(accessCodeRole(person))}{__kbUi(" · ID ")}{person.user_id}</span>
      </button>)}
    </fieldset>}
    {selected && !issued && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="font-semibold text-slate-900">{selected.full_name}</p>
      <p className="mt-2 text-sm text-slate-700">{__kbUi("Faqat shu kishining shaxsiy ulanish kodi yangilanadi. Uning oldingi ulanish kodi bekor bo‘ladi. Bu hisobning kirish parolini o‘zgartirmaydi.")}</p>
      <button type="button" onClick={regenerate} disabled={Boolean(busy)} className="mt-4 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy === 'issue' ? __kbUi('Kod yaratilmoqda…') : __kbUi('Shu shaxs uchun yangi kod olish')}</button>
    </div>}
    {issued && <div className="space-y-3 rounded-2xl border border-teal-300 bg-teal-50 p-5" role="status">
      <p className="font-semibold text-slate-900">{issued.name}{__kbUi(" — yangi ulanish kodi")}</p>
      <p className="select-all break-all font-mono text-2xl font-bold tracking-widest text-teal-900">{issued.code}</p>
      <p className="text-sm text-slate-700">{__kbUi("Amal qilish muddati: ")}{issued.kod_muddati || __kbUi('2 oy')}{__kbUi(". Kodni faqat shu kishiga bering.")}</p>
      <p className="text-sm text-slate-700">{__kbUi("U avval Telegram yoki Google orqali saytga kiradi, keyin Profil → Muassasaga ulanish bo‘limida shu kodni kiritadi.")}</p>
      <div className="flex flex-wrap gap-3"><button type="button" onClick={copy} className="rounded-xl border border-teal-700 px-4 py-2 font-semibold text-teal-800">{copied ? __kbUi('Nusxalandi') : __kbUi('Kodni nusxalash')}</button><button type="button" onClick={download} className="rounded-xl bg-teal-700 px-4 py-2 font-semibold text-white">{__kbUi("Kod va yo‘riqnomani yuklab olish")}</button></div>
    </div>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{__kbUi(error)}</p>}
  </section>;
}
