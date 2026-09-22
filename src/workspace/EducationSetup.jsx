import React, { useState } from 'react';
import { workspaceRequest } from './kabutarWorkspaceClient.js';
import { educationRole } from './educationRules.js';
import JoinInstitution from './JoinInstitution.jsx';
import TalabaQoshilish from '../student/TalabaQoshilish.jsx';
import { useInterface } from '../interface/InterfacePreferences.jsx';
import './workspace.css';

const roles = [['oquvchi', 'O‘quvchi', '1–11-sinf', '📚'], ['talaba', 'Talaba', 'Institut va universitet', '🎓'], ['oqituvchi', 'O‘qituvchi', 'Darslar va ish maydoni', '✏️'], ['ota-ona', 'Ota-ona', 'Farzandingiz ta’limi', '🌱']];
export default function EducationSetup({ apiBase, token, user = null, initialRole = '', onComplete, onBack, target = 'test' }) {
  const { t } = useInterface();
  const [joining, setJoining] = useState('');
  const [role, setRole] = useState(initialRole || educationRole(user));
  const [grade, setGrade] = useState(/^\d+$/.test(String(user?.class || '')) ? String(user.class) : '');
  const p = user?.learning_profile || {};
  const [course, setCourse] = useState(String(p.kurs || ''));
  const [degree, setDegree] = useState(p.talim_bosqichi || 'bakalavr');
  const [form, setForm] = useState(p.talim_shakli || 'kunduzgi');
  const [language, setLanguage] = useState(user?.asosiy_til || p.talim_tili || 'uz');
  const [subject, setSubject] = useState(user?.oqituvchi_fani || '');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function save(event) {
    event.preventDefault(); if (busy) return;
    if (!role) { setError('Kim sifatida foydalanishingizni tanlang.'); return; }
    if (role === 'oquvchi' && !grade) { setError('Sinfingizni tanlang.'); return; }
    if (role === 'talaba' && !course) { setError('Kursingizni tanlang.'); return; }
    setBusy(true); setError('');
    try {
      const data = await workspaceRequest(apiBase, '/auth/profile/education', token, { method: 'POST', body: {
        role, class: role === 'oquvchi' ? Number(grade) : null, language,
        course: role === 'talaba' ? Number(course) : null, study_form: form, degree,
        subject: role === 'oqituvchi' ? subject.trim() || null : null,
      }});
      onComplete?.(data);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  if (joining === 'code') return <section className="kb-education-setup"><JoinInstitution apiBase={apiBase} token={token} onComplete={onComplete} onBack={() => setJoining('')}/></section>;
  if (joining === 'institute') return <section className="kb-education-setup"><TalabaQoshilish apiBase={apiBase} token={token} onSaqlandi={onComplete} onBekor={() => setJoining('')} onStandalone={() => setJoining('')}/></section>;
  return <section className="kb-education-setup" aria-label={t('Ta’lim ma’lumotlari')}>
    {onBack && <button type="button" className="kb-work-back" onClick={onBack}>← {t('Ortga')}</button>}
    <small>{t('KABUTAR TA’LIM')}</small>
    <h1>{t(target === 'test' ? 'Testlarni sizga moslaymiz' : 'Ta’lim ma’lumotlaringiz')}</h1>
    <p>{t('O‘quvchi bo‘lsangiz sinfingizni, talaba bo‘lsangiz kursingiz, ta’lim shakli va tilini tanlang.')}</p>
    <form onSubmit={save}>
      <div className="kb-education-roles">{roles.map(([id, title, description, icon]) => <button type="button" key={id} disabled={busy} aria-pressed={role === id} onClick={() => { setRole(id); setError(''); }} className={role === id ? 'selected' : ''}><span>{icon}</span><b>{t(title)}</b><small>{t(description)}</small></button>)}</div>
      {['oquvchi', 'talaba'].includes(role) && <div className="kb-education-institutions">
        <button type="button" onClick={() => setJoining(role === 'talaba' ? 'institute' : 'code')}>{t(role === 'talaba' ? 'Institutimni tanlash' : 'Maktabimga kod bilan ulanish')} →</button>
        <button type="button" className="kb-education-independent" onClick={() => document.getElementById('education-details')?.scrollIntoView({behavior:'smooth', block:'center'})}>{t(role === 'talaba' ? 'Institutim ro‘yxatda yo‘q — davom etish' : 'Maktabim ro‘yxatda yo‘q — davom etish')}</button>
        <small>{t('Quyidagi ma’lumotlarni tanlab davom etishingiz mumkin.')}</small>
      </div>}
      {role && <div className="kb-education-fields" id="education-details">
        {role === 'oquvchi' && <label>{t('Sinfingiz')}<select value={grade} onChange={e => setGrade(e.target.value)} required><option value="">{t('Sinfni tanlang')}</option>{Array.from({ length: 11 }, (_, i) => <option key={i+1} value={i+1}>{i+1}{t('-sinf')}</option>)}</select></label>}
        {role === 'talaba' && <>
          <label>{t('Bosqich')}<select value={degree} onChange={e => { setDegree(e.target.value); setCourse(''); }}><option value="bakalavr">{t('Bakalavr')}</option><option value="magistr">{t('Magistr')}</option></select></label>
          <label>{t('Kursingiz')}<select value={course} onChange={e => setCourse(e.target.value)} required><option value="">{t('Kursni tanlang')}</option>{Array.from({ length: degree === 'magistr' ? 2 : 6 }, (_, i) => <option key={i+1} value={i+1}>{i+1}{t('-kurs')}</option>)}</select></label>
          <label>{t('Ta’lim shakli')}<select value={form} onChange={e => setForm(e.target.value)}>{[['kunduzgi','Kunduzgi'],['kechki','Kechki'],['sirtqi','Sirtqi'],['masofaviy','Masofaviy']].map(([k,n]) => <option key={k} value={k}>{t(n)}</option>)}</select></label>
        </>}
        <label>{t('Ta’lim tili')}<select value={language} onChange={e => setLanguage(e.target.value)}>{[['uz','O‘zbekcha'],['ru','Ruscha'],['tj','Tojikcha'],['en','Inglizcha'],['kk','Qoraqalpoqcha'],['kz','Qozoqcha']].map(([k,n]) => <option key={k} value={k}>{t(n)}</option>)}</select></label>
        {role === 'oqituvchi' && <label>{t('Asosiy faningiz (ixtiyoriy)')}<input value={subject} onChange={e => setSubject(e.target.value)} maxLength={100}/></label>}
      </div>}
      {role === 'talaba' && <p className="kb-work-note">{t('Kursingizning ikkala semestridagi umumiy mavzu va testlar birga ochiladi.')}</p>}
      {error && <p className="kb-work-error" role="alert">{t(error)}</p>}
      <button className="kb-work-primary" disabled={busy || !role}>{t(busy ? 'Saqlanmoqda…' : ['oqituvchi','ota-ona'].includes(role) ? 'Davom etish →' : target === 'test' ? 'Saqlash va testlarni ochish →' : 'Saqlash va davom etish →')}</button>
    </form>
    <button type="button" className="kb-work-back" disabled={busy} onClick={() => setJoining('code')}>{t('Muassasa bergan ulanish kodim bor')}</button>
  </section>;
}

export function EducationHome({ onOpen }) {
  const { t } = useInterface();
  return <section className="kb-education-home"><small>{t('KABUTAR TA’LIM')}</small><h2>{t('Nimani o‘rganamiz?')}</h2><p>{t('Kerakli bo‘limni tanlang. Sinf yoki kursingizni bir marta saqlaysiz.')}</p>
    <div className="kb-education-home-grid">{[['test','🎯','Test yechish','Sinf yoki kursingizga mos savollar'],['mavzular','📚','Mavzular','Fanlar va dars materiallari'],['ai_ustoz','✨','AI Ustoz','Mavzuni tushunib o‘rganish'],['profil','👤','Profil','Rol va muassasaga ulanish']].map(([key,icon,title,note]) => <button key={key} type="button" onClick={() => onOpen(key)}><span>{icon}</span><b>{t(title)}</b><small>{t(note)}</small><span aria-hidden="true">→</span></button>)}</div>
  </section>;
}
