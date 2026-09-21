import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, { useState } from 'react';
import { workspaceRequest } from './kabutarWorkspaceClient.js';
import JoinInstitution from './JoinInstitution.jsx';
import TalabaQoshilish from '../student/TalabaQoshilish.jsx';
import './workspace.css';
import { InterfaceText, InterfaceSettingsButton, useInterface } from "../interface/InterfacePreferences.jsx";

const roles = [['oquvchi', 'O‘quvchi', 'Sinfiga mos fanlar, jadval va testlar', '📚'], ['oqituvchi', 'O‘qituvchi', 'Darslar, materiallar va shaxsiy ish maydoni', '✏️'], ['ota-ona', 'Ota-ona', 'Farzandingizning ta’lim yo‘lini kuzatish', '🌱'], ['mustaqil', 'Mustaqil o‘rganaman', 'Qiziqishingizga mos bilim va mashqlar', '✦']];
export default function EducationSetup({ apiBase, token, onComplete, onBack }) {
  useKbInterfaceLocale();
  const { t: uiT } = useInterface();
  const [joining, setJoining] = useState(false);
  const [talaba, setTalaba] = useState(false); // 1–11 sinfdan tashqari — institut paroli bilan
  const [role, setRole] = useState('oquvchi'), [grade, setGrade] = useState('5'), [language, setLanguage] = useState('uz'), [subject, setSubject] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function save(e) { e.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { await workspaceRequest(apiBase, '/auth/profile/education', token, { method: 'POST', body: { role, class: role === 'oquvchi' ? grade : null, language, subject: subject.trim() || null } }); onComplete(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  if (joining) return <main className="kb-education-setup"><JoinInstitution apiBase={apiBase} token={token} onComplete={onComplete} onBack={() => setJoining(false)}/></main>;
  if (talaba) return <main className="kb-education-setup"><TalabaQoshilish apiBase={apiBase} token={token} onSaqlandi={() => onComplete()} onBekor={() => setTalaba(false)}/></main>;
  return <main className="kb-education-setup"><button className="kb-work-back" onClick={onBack}>← <InterfaceText text={__kbUi("Kabutarga qaytish")}/></button><small>{__kbUi("KABUTAR TA’LIM")}</small><h1><InterfaceText text={__kbUi("Bilim yo‘lingizni tanlang.")}/></h1><p><InterfaceText text={__kbUi("Bir akkaunt. Suhbatlaringiz saqlanadi, yoniga ta’lim maydoningiz qo‘shiladi.")}/></p>
    <button type="button" className="kb-education-invite-entry" onClick={() => setJoining(true)} disabled={busy}><span><strong>{uiT('Admin bergan ulanish kodim bor')}</strong><small>{uiT('O‘qituvchi, o‘quvchi, talaba yoki xodim — muassasadagi tayyor profilingizga ulaning.')}</small></span><span aria-hidden="true">→</span></button>
    <button type="button" className="kb-education-invite-entry" onClick={() => setTalaba(true)} disabled={busy}><span><strong>{uiT('Talabaman — 1–11 sinf emas')}</strong><small>{uiT('Institut paroli bilan kurs, guruh va yo‘nalishingizni kiriting; kursingizga mos mavzu, test va AI ustoz ochiladi.')}</small></span><span aria-hidden="true">🎓</span></button>
    <form onSubmit={save}><div className="kb-education-roles">{roles.map(([id, title, description, icon]) => <button type="button" key={id} aria-pressed={role === id} onClick={() => setRole(id)} className={role === id ? 'selected' : ''}><span>{__kbUi(icon)}</span><b>{uiT(title)}</b><small>{uiT(description)}</small></button>)}</div>
      <div className="kb-education-fields">{role === 'oquvchi' && <label><InterfaceText text={__kbUi("Sinfingiz")}/><select value={grade} onChange={e => setGrade(e.target.value)}>{__kbUi(Array.from({ length: 11 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}{__kbUi("-sinf")}</option>))}</select></label>}<label><InterfaceText text={__kbUi("Ta’lim tili")}/><select value={language} onChange={e => setLanguage(e.target.value)}><option value="uz"><InterfaceText text={__kbUi("O‘zbekcha")}/></option><option value="ru"><InterfaceText text={__kbUi("Ruscha")}/></option><option value="en"><InterfaceText text={__kbUi("Inglizcha")}/></option></select></label>{role === 'oqituvchi' && <label><InterfaceText text={__kbUi("Asosiy faningiz")}/><input maxLength={100} value={subject} onChange={e => setSubject(e.target.value)} placeholder={uiT("Masalan, matematika")} /></label>}</div>
      <p className="kb-work-note"><InterfaceText text={__kbUi("Bu shaxsiy ta’lim maydonini ochadi. Muassasa ma’lumotlariga kirish muassasa tomonidan, farzand bilan bog‘lanish esa alohida tasdiqlanadi.")}/></p>
      {error && <p className="kb-work-error" role="alert">{__kbUi(error)}</p>}<button className="kb-work-primary" disabled={busy}>{busy ? uiT("Saqlanmoqda…") : uiT("Ta’lim maydonini ochish →")}</button>
    </form>
  </main>;
}
