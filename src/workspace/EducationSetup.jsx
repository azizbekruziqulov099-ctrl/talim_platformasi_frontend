import React, { useState } from 'react';
import { workspaceRequest } from './kabutarWorkspaceClient.js';
import './workspace.css';
const roles = [['oquvchi', 'O‘quvchi', 'Sinfiga mos fanlar, jadval va testlar', '📚'], ['oqituvchi', 'O‘qituvchi', 'Darslar, materiallar va shaxsiy ish maydoni', '✏️'], ['ota-ona', 'Ota-ona', 'Farzandingizning ta’lim yo‘lini kuzatish', '🌱'], ['mustaqil', 'Mustaqil o‘rganaman', 'Qiziqishingizga mos bilim va mashqlar', '✦']];
export default function EducationSetup({ apiBase, token, onComplete, onBack }) {
  const [role, setRole] = useState('oquvchi'), [grade, setGrade] = useState('5'), [language, setLanguage] = useState('uz'), [subject, setSubject] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function save(e) { e.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { await workspaceRequest(apiBase, '/auth/profile/education', token, { method: 'POST', body: { role, class: role === 'oquvchi' ? grade : null, language, subject: subject.trim() || null } }); onComplete(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="kb-education-setup"><button className="kb-work-back" onClick={onBack}>← Kabutarga qaytish</button><small>KABUTAR TA’LIM</small><h1>Bilim yo‘lingizni tanlang.</h1><p>Bir akkaunt. Suhbatlaringiz saqlanadi, yoniga ta’lim maydoningiz qo‘shiladi.</p>
    <form onSubmit={save}><div className="kb-education-roles">{roles.map(([id, title, description, icon]) => <button type="button" key={id} aria-pressed={role === id} onClick={() => setRole(id)} className={role === id ? 'selected' : ''}><span>{icon}</span><b>{title}</b><small>{description}</small></button>)}</div>
      <div className="kb-education-fields">{role === 'oquvchi' && <label>Sinfingiz<select value={grade} onChange={e => setGrade(e.target.value)}>{Array.from({ length: 11 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}-sinf</option>)}</select></label>}<label>Ta’lim tili<select value={language} onChange={e => setLanguage(e.target.value)}><option value="uz">O‘zbekcha</option><option value="ru">Ruscha</option><option value="en">Inglizcha</option></select></label>{role === 'oqituvchi' && <label>Asosiy faningiz<input maxLength={100} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Masalan, matematika" /></label>}</div>
      <p className="kb-work-note">Bu shaxsiy ta’lim maydonini ochadi. Muassasa ma’lumotlariga kirish muassasa tomonidan, farzand bilan bog‘lanish esa alohida tasdiqlanadi.</p>
      {error && <p className="kb-work-error" role="alert">{error}</p>}<button className="kb-work-primary" disabled={busy}>{busy ? 'Saqlanmoqda…' : 'Ta’lim maydonini ochish →'}</button>
    </form>
  </main>;
}
