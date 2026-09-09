import React, { useEffect, useState } from 'react';
import { workspaceRequest } from './kabutarWorkspaceClient.js';
import './workspace.css';
import { startKabutarPoll } from '../kabutar/kabutarPolling.js';

function useVisibleDocument() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return visible;
}

export function useAudiencePresence(apiBase, token, enabled = true) {
  const visible = useVisibleDocument();
  useEffect(() => {
    if (!enabled || !token || !visible) return undefined;
    return startKabutarPoll(async signal => {
      try {
        await workspaceRequest(apiBase, '/api/presence', token, { method: 'POST', body: {}, signal });
        return true;
      } catch { return false; /* Presence never blocks the user's work. */ }
    }, { interval: 60000, maxDelay: 300000 });
  }, [apiBase, token, enabled, visible]);
}
export default function AudiencePanel({ apiBase, token, active = true }) {
  const [data, setData] = useState(null), [error, setError] = useState(''), [reload, setReload] = useState(0);
  const visible = useVisibleDocument();
  useEffect(() => {
    if (!active || !visible || !token) return undefined;
    return startKabutarPoll(async signal => {
      try {
        const result = await workspaceRequest(apiBase, '/api/admin/audience?days=14', token, { signal });
        if (!signal.aborted) { setData(result); setError(''); }
        return true;
      } catch (e) {
        if (!signal.aborted) setError(e.message);
        return false;
      }
    }, { interval: 60000, maxDelay: 300000 });
  }, [apiBase, token, active, visible, reload]);
  const format = value => new Intl.NumberFormat('uz-UZ').format(Number(value || 0));
  return <section className="kb-audience"><header><div><small>KABUTAR · ADMIN</small><h2>Platforma faolligi</h2><p>Kimlar foydalanyapti va bugun qancha kirish bo‘ldi?</p></div><button onClick={() => setReload(n => n + 1)}>Yangilash ↻</button></header>
    {error && <p role="alert" className="kb-work-error">{error}</p>}
    {!data && !error ? <p>Statistika olinmoqda…</p> : data && <>
      <div className="kb-metric-grid">{[['Ro‘yxatdan o‘tganlar', data.summary.registered_users], ['Hozir faol', data.summary.online_users], ['Bugun faol odamlar', data.summary.active_today], ['Bugungi kirishlar', data.summary.logins_today]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{format(value)}</strong></div>)}</div>
      <p className="kb-work-note">“Hozir faol” — oxirgi {Math.round((data.online_window_seconds || 180) / 60)} daqiqada ochiq sahifadan signal kelgan akkauntlar. Bir odamning qayta kirishi “kirishlar” soniga qo‘shiladi. Sana: Toshkent vaqti.</p>
      <details><summary>Kunlar bo‘yicha hisob va hozir faol foydalanuvchilar</summary><div className="kb-audience-tables"><table><thead><tr><th>Sana</th><th>Faol odamlar</th><th>Kirishlar</th></tr></thead><tbody>{(data.daily || []).map(day => <tr key={day.date}><td>{day.date}</td><td>{format(day.active_users)}</td><td>{format(day.logins)}</td></tr>)}</tbody></table><div><h3>Hozir faol</h3>{!(data.online || []).length ? <p>Hozircha signal yo‘q.</p> : <ul>{data.online.map(person => <li key={person.user_id}><b>{person.full_name || 'Foydalanuvchi'}</b><small>{new Date(person.last_seen_at).toLocaleTimeString('uz-UZ', { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit' })}</small></li>)}</ul>}</div></div></details>
      <small>Hisob boshlanishi: {data.measurement_started_at ? new Date(data.measurement_started_at).toLocaleDateString('uz-UZ', { timeZone: 'Asia/Tashkent' }) : 'yangi o‘rnatishdan boshlab'}. Oldingi davr uchun sonlar taxmin qilinmaydi.</small>
    </>}
  </section>;
}
