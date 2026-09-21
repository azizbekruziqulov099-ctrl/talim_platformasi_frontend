import {uiText as __kbUi, interfaceLocaleTag as __kbLocaleTag} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
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
  useKbInterfaceLocale();
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
  return <section className="kb-audience"><header><div><small>{__kbUi("KABUTAR · ADMIN")}</small><h2>{__kbUi("Platforma faolligi")}</h2><p>{__kbUi("Kimlar foydalanyapti va bugun qancha kirish bo‘ldi?")}</p></div><button onClick={() => setReload(n => n + 1)}>{__kbUi("Yangilash ↻")}</button></header>
    {error && <p role="alert" className="kb-work-error">{__kbUi(error)}</p>}
    {!data && !error ? <p>{__kbUi("Statistika olinmoqda…")}</p> : data && <>
      <div className="kb-metric-grid">{[['Ro‘yxatdan o‘tganlar', data.summary.registered_users], ['Hozir faol', data.summary.online_users], ['Bugun faol odamlar', data.summary.active_today], ['Bugungi kirishlar', data.summary.logins_today]].map(([label, value]) => <div key={label}><span>{__kbUi(label)}</span><strong>{__kbUi(format(value))}</strong></div>)}</div>
      <p className="kb-work-note">{__kbUi("“Hozir faol” — oxirgi ")}{Math.round((data.online_window_seconds || 180) / 60)}{__kbUi(" daqiqada ochiq sahifadan signal kelgan akkauntlar. Bir odamning qayta kirishi “kirishlar” soniga qo‘shiladi. Sana: Toshkent vaqti.")}</p>
      <details><summary>{__kbUi("Kunlar bo‘yicha hisob va hozir faol foydalanuvchilar")}</summary><div className="kb-audience-tables"><table><thead><tr><th>{__kbUi("Sana")}</th><th>{__kbUi("Faol odamlar")}</th><th>{__kbUi("Kirishlar")}</th></tr></thead><tbody>{(data.daily || []).map(day => <tr key={day.date}><td>{day.date}</td><td>{__kbUi(format(day.active_users))}</td><td>{__kbUi(format(day.logins))}</td></tr>)}</tbody></table><div><h3>{__kbUi("Hozir faol")}</h3>{!(data.online || []).length ? <p>{__kbUi("Hozircha signal yo‘q.")}</p> : <ul>{data.online.map(person => <li key={person.user_id}><b>{person.full_name || __kbUi('Foydalanuvchi')}</b><small>{__kbUi(new Date(person.last_seen_at).toLocaleTimeString(__kbLocaleTag(), { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit' }))}</small></li>)}</ul>}</div></div></details>
      <small>{__kbUi("Hisob boshlanishi: ")}{data.measurement_started_at ? __kbUi(new Date(data.measurement_started_at).toLocaleDateString(__kbLocaleTag(), { timeZone: 'Asia/Tashkent' })) : __kbUi('yangi o‘rnatishdan boshlab')}{__kbUi(". Oldingi davr uchun sonlar taxmin qilinmaydi.")}</small>
    </>}
  </section>;
}
