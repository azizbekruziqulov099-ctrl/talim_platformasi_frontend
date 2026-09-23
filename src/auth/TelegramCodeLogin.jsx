import React, { useEffect, useRef, useState } from 'react';
import { Send, LoaderCircle } from 'lucide-react';
import { authEndpoint, authRequest } from './authClient.js';
import { useInterface } from '../interface/InterfacePreferences.jsx';
import { captureTelegramArrival, clearTelegramLinkIntent, normalizeTelegramPhone, prepareTelegramGoogleLink, readTelegramLinkIntent, redemptionSecret, saveTelegramPhone, telegramBotUrl, telegramDraft } from './telegramCodeClient.js';

export default function TelegramCodeLogin({ apiBase = '', token = '', mode = 'login', config, onAuthenticated, onCancel }) {
  const { t } = useInterface();
  const [draft] = useState(telegramDraft);
  const [phone, setPhone] = useState(draft.phone);
  const [code, setCode] = useState(draft.code);
  const [ownConfig, setOwnConfig] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [linkRequired, setLinkRequired] = useState(() => Boolean(readTelegramLinkIntent()));
  const request = useRef(null);
  const active = useRef(true);
  const submitting = useRef(false);
  const secret = useRef(null);
  const link = mode === 'link';
  const settings = config === undefined ? ownConfig : config;
  const botUrl = telegramBotUrl(settings?.telegram);

  useEffect(() => {
    active.current = true;
    const arrived = () => {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      if (!params.has('telegram_phone') && !params.has('telegram_link')) return;
      captureTelegramArrival(window.location.hash);
      const next = telegramDraft(); setPhone(next.phone); setCode(next.code);
      setLinkRequired(Boolean(readTelegramLinkIntent())); setError('');
    };
    window.addEventListener('hashchange', arrived);
    return () => { active.current = false; request.current?.abort(); window.removeEventListener('hashchange', arrived); };
  }, []);
  useEffect(() => {
    if (config !== undefined) return;
    const controller = new AbortController();
    authRequest(apiBase, '/auth/config', { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) { setOwnConfig(data); setError(''); }
    }).catch(err => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [apiBase, config, attempt]);

  function googleLink() {
    if (!settings?.google?.enabled) {
      setError('Mavjud hisobni ulash uchun Gmail orqali kirish xizmati yoqilgan bo‘lishi kerak.');
      return;
    }
    try {
      prepareTelegramGoogleLink(phone, code);
      window.location.assign(authEndpoint(apiBase, '/auth/google/login?intent=telegram'));
    } catch (err) { setError(err.message); }
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const normalized = normalizeTelegramPhone(phone);
    if (!normalized || !/^\d{6}$/.test(code)) { setError('Telefon raqamingiz va bot bergan 6 xonali kodni kiriting.'); return; }
    if (link && !token) { setError('Avval mavjud hisobingizga Gmail orqali kiring.'); return; }
    submitting.current = true; setBusy(true); setError('');
    const controller = new AbortController(); request.current = controller;
    try {
      secret.current ||= redemptionSecret(apiBase);
      const result = await authRequest(apiBase, '/auth/telegram/code/redeem', {
        body: { phone: normalized, code, browser_secret: secret.current, mode: link ? 'link' : 'login', ...(link ? { token } : {}) },
        signal: controller.signal,
      });
      if (!active.current || controller.signal.aborted) return;
      if (result.status === 'link_required' && !link) {
        setLinkRequired(true);
        prepareTelegramGoogleLink(normalized, code);
        googleLink();
        return;
      }
      if (result.status !== 'complete' || !result.token) throw new Error(result.detail || 'Kod qabul qilinmadi. Botda /sayt orqali yangi kod oling.');
      saveTelegramPhone(normalized); clearTelegramLinkIntent(); setCode('');
      onAuthenticated?.(result);
    } catch (err) {
      if (active.current && !controller.signal.aborted && err.status === 409 && !link) {
        setLinkRequired(true); prepareTelegramGoogleLink(normalized, code);
      }
      if (active.current && !controller.signal.aborted) setError(err.status === 409 && !link
        ? 'Bu telefon mavjud hisobga tegishli. Quyidagi «Gmail hisobimga Telegramni ulash»ni bosing va o‘sha Gmail bilan kiring.' : err.message);
    } finally {
      submitting.current = false;
      if (active.current) setBusy(false);
    }
  }

  return <div className="kb-login-telegram-start">
    <p className="kb-login-method-copy">{t(link
      ? 'Telegramni hozirgi hisobingizga ulang. Profilingiz va rolingiz saqlanadi.'
      : '1. Botni oching va Start tugmasini bosing. Telefoningizni ulashing, rolingizni tanlang — bot 6 xonali kod beradi.')}</p>
    {botUrl ? <a className="kb-login-primary" href={botUrl} target="_blank" rel="noopener noreferrer" onClick={() => {saveTelegramPhone(phone);if(!link){clearTelegramLinkIntent();setLinkRequired(false);}}}><Send size={18}/>{t('Telegram botdan kod olish')}</a>
      : <p className="kb-login-poll-notice" role="status">{t(settings ? settings.telegram?.reason || 'Telegram kirishi uchun backendning REV59 versiyasini joylash kerak.' : 'Kirish xizmati tekshirilmoqda…')}</p>}
    <p className="kb-login-pending-note">{t('2. Bot bergan kodni pastga kiriting. Telegramda Start chiqmasa, /sayt buyrug‘ini yuboring. Kod 5 daqiqa amal qiladi.')}</p>
    {!link && linkRequired && <div className="kb-login-poll-notice" role="status">
      <p>{t('Sizda Gmail hisobi bor. Uni tasdiqlang, keyin Telegram shu hisobga ulanadi.')}</p>
      <button type="button" className="kb-login-primary" onClick={googleLink} disabled={busy || !settings?.google?.enabled}>{t('Gmail hisobimni tasdiqlash')}</button>
    </div>}
    {error && <div className="kb-login-error" role="alert">{t(error)}</div>}
    {!settings && error && config === undefined && <button type="button" className="kb-login-text-button" onClick={() => setAttempt(x => x + 1)}>{t('Qayta tekshirish')}</button>}
    <form className="kb-login-password-form kb-login-code-form" onSubmit={submit}>
      <label htmlFor={`telegram-phone-${mode}`}>{t('Telegramdagi telefon raqamingiz')}</label>
      <input id={`telegram-phone-${mode}`} type="tel" inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67" value={phone} maxLength={24} required disabled={busy} onChange={event => setPhone(event.target.value)}/>
      <label htmlFor={`telegram-code-${mode}`}>{t('Botdan olingan 6 xonali kod')}</label>
      <input id={`telegram-code-${mode}`} type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" pattern="[0-9]{6}" maxLength={6} value={code} required disabled={busy} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}/>
      <button type="submit" className="kb-login-primary" disabled={busy || !normalizeTelegramPhone(phone) || code.length !== 6 || !botUrl}>
        {busy && <LoaderCircle size={18} className="kb-login-spin"/>}{t(busy ? 'Tekshirilmoqda…' : link ? 'Shu hisobga Telegramni ulash' : 'Kod bilan saytga kirish')}
      </button>
    </form>
    {!link && <button type="button" className="kb-login-text-button" onClick={googleLink} disabled={busy || !settings?.google?.enabled}>{t('Oldin Gmail bilan kirganman — Telegramni o‘sha hisobga ulash')}</button>}
    {onCancel && <button type="button" className="kb-login-text-button" onClick={onCancel} disabled={busy}>{t('Keyinroq')}</button>}
  </div>;
}
