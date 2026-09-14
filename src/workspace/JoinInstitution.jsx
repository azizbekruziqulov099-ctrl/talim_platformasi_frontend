import React, { useEffect, useRef, useState } from 'react';
import { Building2, KeyRound, LoaderCircle } from 'lucide-react';
import { useInterface } from '../interface/InterfacePreferences.jsx';
import { claimInstitution, institutionCodeError, refreshInstitutionProfile } from './membershipClient.js';
import './membership.css';

export default function JoinInstitution({ apiBase = '', token, onComplete, onBack }) {
  const { t } = useInterface();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(null);
  const active = useRef(false);
  const request = useRef(null);
  const flight = useRef(false);
  const confirmed = useRef(null);
  const callback = useRef(onComplete);
  callback.current = onComplete;
  useEffect(() => {
    active.current = true;
    confirmed.current = null;
    flight.current = false;
    setCode(''); setJoined(null); setError(''); setBusy(false);
    return () => { active.current = false; request.current?.abort(); };
  }, [apiBase, token]);

  async function submit(event) {
    event?.preventDefault();
    if (flight.current) return;
    const problem = confirmed.current ? '' : institutionCodeError(code);
    if (problem) { setError(problem); return; }
    const controller = new AbortController();
    request.current = controller;
    flight.current = true; setBusy(true); setError('');
    try {
      if (!confirmed.current) {
        const result = await claimInstitution(apiBase, token, code, controller.signal);
        if (!active.current || controller.signal.aborted) return;
        confirmed.current = result; setJoined(result); setCode('');
      }
      const profile = await refreshInstitutionProfile(apiBase, token, controller.signal);
      if (!active.current || controller.signal.aborted) return;
      callback.current?.({ profile, result: confirmed.current });
    } catch (problem) {
      if (active.current && !controller.signal.aborted) setError(confirmed.current
        ? `${t('Muassasaga ulandingiz. Profilni yangilash uchun qayta bosing.')} ${problem.message}`
        : problem.message);
    } finally {
      if (active.current && request.current === controller) { flight.current = false; setBusy(false); }
    }
  }

  return <section className="kb-membership" aria-label={t('Muassasaga ulanish')}>
    {onBack && <button type="button" className="kb-membership-back" onClick={onBack} disabled={busy}>← {t('Ortga')}</button>}
    <span className="kb-membership-icon"><Building2 size={23}/></span>
    <h2>{t('Muassasaga ulanish')}</h2>
    <p>{t('Maktab, institut, universitet, markaz yoki bog‘cha admini bergan shaxsiy ulanish kodini kiriting. Rolingiz va biriktirilgan sinf yoki guruhingiz muassasa ma’lumotlaridan olinadi.')}</p>
    <form onSubmit={submit}>
      {!joined && <><label htmlFor="kb-institution-code">{t('Admin bergan ulanish kodi')}</label>
        <input id="kb-institution-code" value={code} onChange={event => setCode(event.target.value)} type="text" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={256} placeholder="A1B2 C3D4 E5F6" disabled={busy} required/>
        <p className="kb-membership-note">{t('Bu kod muassasaga bir marta ulaydi. Keyingi kirishlarda Telegram, Google yoki o‘zingiz belgilagan shaxsiy paroldan foydalanasiz.')}</p></>}
      {joined && <p className="kb-membership-success" role="status">{joined.joy_nomi || t('Muassasa')} — {t('ulandingiz. Hisob yangilanmoqda.')}</p>}
      {error && <p className="kb-membership-error" role="alert">{error}</p>}
      <button type="submit" className="kb-membership-submit" disabled={busy || (!joined && !code.trim())}>{busy ? <LoaderCircle size={18} className="animate-spin"/> : <KeyRound size={18}/>} {busy ? t('Tekshirilmoqda…') : joined ? t('Hisobni yangilash') : t('Muassasaga qo‘shilish')}</button>
    </form>
  </section>;
}
