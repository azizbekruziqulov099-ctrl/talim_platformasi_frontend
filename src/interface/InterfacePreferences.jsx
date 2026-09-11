import React, { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Globe2, Laptop, Moon, SlidersHorizontal, Sun, X } from 'lucide-react';
import { DEFAULT_INTERFACE, INTERFACE_KEY, INTERFACE_LOCALES, normalizeInterface, readInterface, translateInterface } from './interfaceRules.js';
import './interface.css';

const InterfaceContext = createContext(null);
const localStore = () => { try { return window.localStorage; } catch { return null; } };
const fallback = { ...DEFAULT_INTERFACE, resolvedTheme: 'light', reduceMotion: false, storageError: '', updateInterface: () => {}, t: translateInterface };
const safeMedia = query => { try { return window.matchMedia(query); } catch { return null; } };
export function InterfaceProvider({ children }) {
  const [preferences, setPreferences] = useState(() => readInterface(localStore()));
  const [storageError, setStorageError] = useState('');
  const [systemDark, setSystemDark] = useState(() => safeMedia('(prefers-color-scheme: dark)')?.matches || false);
  const [systemMotion, setSystemMotion] = useState(() => safeMedia('(prefers-reduced-motion: reduce)')?.matches || false);
  const current = useRef(preferences);
  current.current = preferences;
  useEffect(() => {
    const dark = safeMedia('(prefers-color-scheme: dark)'), motion = safeMedia('(prefers-reduced-motion: reduce)');
    const darkChanged = event => setSystemDark(event.matches), motionChanged = event => setSystemMotion(event.matches);
    const subscribe = (query, listener) => { if (query?.addEventListener) query.addEventListener('change', listener); else query?.addListener?.(listener); };
    const unsubscribe = (query, listener) => { if (query?.removeEventListener) query.removeEventListener('change', listener); else query?.removeListener?.(listener); };
    subscribe(dark, darkChanged); subscribe(motion, motionChanged);
    const stored = event => { if (event.key === INTERFACE_KEY || event.key === null) { const next = readInterface(localStore()); current.current = next; setPreferences(next); setStorageError(''); } };
    window.addEventListener('storage', stored);
    return () => { unsubscribe(dark, darkChanged); unsubscribe(motion, motionChanged); window.removeEventListener('storage', stored); };
  }, []);
  const updateInterface = useCallback(patch => {
    const next = normalizeInterface({ ...current.current, ...(patch && typeof patch === 'object' ? patch : {}) });
    current.current = next; setPreferences(next);
    try { const storage = localStore(); if (!storage) throw new Error('storage'); storage.setItem(INTERFACE_KEY, JSON.stringify(next)); setStorageError(''); }
    catch { setStorageError('Saqlashga ruxsat yo‘q. Sozlamalar shu oynada ishlaydi.'); }
  }, []);
  const resolvedTheme = preferences.theme === 'system' ? (systemDark ? 'dark' : 'light') : preferences.theme;
  const reduceMotion = preferences.motion === 'reduced' || (preferences.motion === 'system' && systemMotion);
  useLayoutEffect(() => {
    document.documentElement.dataset.kbTheme = resolvedTheme;
    document.documentElement.dataset.kbMotion = reduceMotion ? 'reduced' : 'full';
    document.documentElement.lang = INTERFACE_LOCALES.find(item => item.value === preferences.locale)?.lang || 'uz-Latn';
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, reduceMotion, preferences.locale]);
  const t = useCallback((text, values) => translateInterface(text, preferences.locale, values), [preferences.locale]);
  const value = useMemo(() => ({ ...preferences, resolvedTheme, reduceMotion, storageError, updateInterface, t }), [preferences, resolvedTheme, reduceMotion, storageError, updateInterface, t]);
  return <InterfaceContext.Provider value={value}>{children}</InterfaceContext.Provider>;
}
export function useInterface() { return useContext(InterfaceContext) || fallback; }
export function InterfaceText({ text }) { return useInterface().t(text); }

export function InterfaceSettings({ compact = false }) {
  const { t, locale, theme, reduceMotion, updateInterface, storageError } = useInterface();
  const id = useId();
  return <section className={`kb-interface-settings${compact ? ' is-compact' : ''}`} aria-labelledby={`${id}-heading`}>
    <header><span className="kb-interface-symbol"><Globe2 size={21}/></span><div><h3 id={`${id}-heading`}>{t('Til va ko‘rinish')}</h3><p>{t('Sozlamalar shu qurilmada saqlanadi.')}</p></div></header>
    <fieldset><legend>{t('Ilova tili')}</legend><div className="kb-interface-languages">{INTERFACE_LOCALES.map(item => <label key={item.value} className={locale === item.value ? 'is-selected' : ''}>
      <input type="radio" name={`${id}-locale`} value={item.value} checked={locale === item.value} onChange={() => updateInterface({ locale: item.value })}/><span lang={item.lang}>{item.label}</span>{locale === item.value && <Check size={15} aria-hidden="true"/>}
    </label>)}</div></fieldset>
    <fieldset><legend>{t('Ko‘rinish')}</legend><div className="kb-interface-themes">{[{ value: 'system', label: 'Tizimga mos', Icon: Laptop }, { value: 'light', label: 'Yorug‘', Icon: Sun }, { value: 'dark', label: 'Tungi', Icon: Moon }].map(({ value, label, Icon }) => <label key={value} className={theme === value ? 'is-selected' : ''}>
      <input type="radio" name={`${id}-theme`} value={value} checked={theme === value} onChange={() => updateInterface({ theme: value })}/><span className={`kb-theme-preview kb-theme-preview--${value}`} aria-hidden="true"><i/><i/><i/></span><span><Icon size={16}/>{t(label)}</span>
    </label>)}</div></fieldset>
    <label className="kb-interface-motion"><span><strong>{t('Harakatlarni kamaytirish')}</strong><small>{t('Ko‘zga tinchroq, animatsiyalar kamroq.')}</small></span><input type="checkbox" role="switch" checked={reduceMotion} onChange={event => updateInterface({ motion: event.target.checked ? 'reduced' : 'full' })}/></label>
    {storageError && <p className="kb-interface-error" role="status">{t(storageError)}</p>}
  </section>;
}
function InterfaceDialog({ onClose }) {
  const { t } = useInterface();
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current, previous = document.activeElement;
    if (node?.showModal) node.showModal(); else node?.setAttribute('open', '');
    return () => { if (node?.open && node.close) node.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, []);
  return createPortal(<dialog ref={dialog} className="kb-interface-dialog" aria-label={t('Til va ko‘rinish')} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
    <button type="button" className="kb-interface-close" aria-label={t('Yopish')} onClick={onClose}><X size={20}/></button><InterfaceSettings/>
  </dialog>, document.body);
}
export function InterfaceSettingsButton({ className = '', showLabel = false }) {
  const [open, setOpen] = useState(false);
  const { t } = useInterface();
  return <><button type="button" className={`kb-interface-button ${className}`} aria-label={t('Til va ko‘rinish')} title={t('Til va ko‘rinish')} aria-haspopup="dialog" onClick={() => setOpen(true)}><SlidersHorizontal size={19}/>{showLabel && <span>{t('Til va ko‘rinish')}</span>}</button>{open && <InterfaceDialog onClose={() => setOpen(false)}/>}</>;
}
