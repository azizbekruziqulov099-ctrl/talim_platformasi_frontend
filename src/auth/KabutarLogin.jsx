import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Bird, BookOpen, Check, CheckCircle2, ChevronRight, Eye, EyeOff, GraduationCap, LoaderCircle, LockKeyhole, MessageCircle, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { authEndpoint, authRequest, challengeStorageKey, formatAuthCountdown, restoreTelegramChallenge, telegramChallenge } from "./authClient.js";
import "./kabutar-login.css";
import { InterfaceText, InterfaceSettingsButton, useInterface } from "../interface/InterfacePreferences.jsx";

function GoogleMark() {
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.97-3.38.97-2.6 0-4.8-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.93a6 6 0 0 1 0-3.86V7.48H3.06a10 10 0 0 0 0 9.04l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.48l3.34 2.59c.8-2.36 3-4.12 5.6-4.12Z"/></svg>;
}

function safeStorage() {
  try { return window.sessionStorage; } catch { return null; }
}

function savePending(key, value) {
  try {
    const storage = safeStorage();
    if (value) storage?.setItem(key, JSON.stringify(value));
    else storage?.removeItem(key);
  } catch { /* Private browsing can restrict storage; this tab can still finish sign-in. */ }
}

// Reused in profile security. Linking never creates a second Kabutar account.
export function TelegramSignIn({ apiBase = "", onAuthenticated, token = "", mode = "login", onCancel }) {
  useKbInterfaceLocale();
  const { t: uiT } = useInterface();
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const current = useRef(null);
  const polling = useRef(null);
  const generation = useRef(0);
  const callback = useRef(onAuthenticated);
  const isLink = mode === "link";
  useEffect(() => { callback.current = onAuthenticated; }, [onAuthenticated]);
  useEffect(() => {
    setPending(null);
    setBusy(false);
    setDone(false);
    setError("");
    return () => { generation.current += 1; current.current?.abort(); polling.current?.abort(); };
  }, [apiBase, token, mode]);

  useEffect(() => {
    if (!pending) return undefined;
    const controller = new AbortController();
    polling.current = controller;
    let timeout;
    let failures = 0;
    const tick = () => {
      const left = Math.max(0, Math.ceil((pending.expires_at - Date.now()) / 1000));
      setSeconds(left);
      if (!left) { controller.abort(); setPending(null); setError("Tasdiqlash vaqti tugadi. Qaytadan boshlang."); }
    };
    tick();
    const interval = setInterval(tick, 1000);
    const poll = async () => {
      if (controller.signal.aborted || Date.now() >= pending.expires_at) return;
      try {
        const data = await authRequest(apiBase, "/auth/telegram/poll", { body: { challenge: pending.challenge, browser_secret: pending.browser_secret }, signal: controller.signal });
        if (controller.signal.aborted) return;
        failures = 0;
        setError("");
        if (data.status === "complete" || (isLink && data.status === "linked")) {
          if (!isLink && !data.token) throw new Error("Kirish tasdiqlanmadi. Qayta urinib ko‘ring.");
          setPending(null);
          setDone(true);
          callback.current?.(isLink ? data : data.token);
          return;
        }
        if (["expired", "cancelled", "rejected", "denied"].includes(data.status)) {
          setPending(null);
          setError("So‘rov tugadi yoki bekor qilindi. Qaytadan boshlashingiz mumkin.");
          return;
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if ([400, 401, 403, 404, 410].includes(err.status)) { setPending(null); setError(err.message); return; }
        failures += 1;
        setError(`${err.message} Tasdiqlash yana tekshiriladi.`);
      }
      if (!controller.signal.aborted) timeout = setTimeout(poll, Math.min(8000, 2500 + failures * 1500));
    };
    poll();
    return () => { controller.abort(); if (polling.current === controller) polling.current = null; clearTimeout(timeout); clearInterval(interval); };
  }, [apiBase, pending, isLink]);

  async function start() {
    if (busy) return;
    if (isLink && !token) { setError("Hisobingizga qayta kirib, Telegramni ulang."); return; }
    const id = ++generation.current;
    const controller = new AbortController();
    current.current?.abort();
    current.current = controller;
    setBusy(true);
    setError("");
    try {
      const data = await authRequest(apiBase, "/auth/telegram/start", { body: { mode: isLink ? "link" : "login", ...(isLink ? { token } : {}) }, signal: controller.signal });
      if (controller.signal.aborted || id !== generation.current) return;
      const next = telegramChallenge(data);
      if (!next) throw new Error("Telegram kirish havolasi olinmadi. Qayta urinib ko‘ring.");
      setPending(next);
    } catch (err) {
      if (!controller.signal.aborted && id === generation.current) setError(err.message);
    } finally {
      if (id === generation.current) setBusy(false);
    }
  }

  function cancel() {
    generation.current += 1;
    current.current?.abort();
    polling.current?.abort();
    setBusy(false);
    setPending(null);
    setError("");
    if (pending) authRequest(apiBase, "/auth/telegram/cancel", { body: { challenge: pending.challenge, browser_secret: pending.browser_secret } }).catch(() => {});
    onCancel?.();
  }

  return <section className="kb-login-page kb-login-compact" aria-label={isLink ? __kbUi("Telegramni ulash") : uiT("Telegram orqali kirish")}>
    {done ? <div className="kb-login-success" role="status"><CheckCircle2 size={32}/><h3>{isLink ? __kbUi("Telegram hisobingizga ulandi") : uiT("Kirish tasdiqlandi")}</h3></div> : <>
      {error && <div className="kb-login-error" role="alert">{__kbUi(error)}</div>}
      {pending ? <div className="kb-login-telegram-pending">
        <div className="kb-login-pending-heading"><span><LoaderCircle size={16} className="kb-login-spin"/><InterfaceText text={__kbUi(" Tasdiqlashingiz kutilmoqda")}/></span><time>{__kbUi(formatAuthCountdown(seconds))}</time></div>
        <p className="kb-login-method-copy">{__kbUi("Botni oching, Start tugmasini bosing, o‘z telefon raqamingizni ulashib tasdiqlang. So‘ng shu oynaga qayting.")}</p>
        {pending.verification_code && <div className="kb-login-verification"><span><InterfaceText text={__kbUi("Botdagi so‘rov raqami shu bilan bir xil bo‘lsin:")}/></span><strong>{pending.verification_code}</strong></div>}
        <a className="kb-login-primary" href={pending.bot_url} target="_blank" rel="noopener noreferrer"><Send size={18}/><InterfaceText text={__kbUi(" Telegram botini ochish ")}/><ArrowRight size={18}/></a>
        <p className="kb-login-pending-note">{__kbUi("Faqat o‘zingiz boshlagan so‘rovni tasdiqlang.")}</p>
      </div> : <>
        <p className="kb-login-method-copy">{isLink ? __kbUi("Telegram va telefon raqamingiz shu Kabutar hisobingizga ulanadi. Suhbatlaringiz va KB raqamingiz saqlanadi.") : __kbUi("Telegram botida o‘z telefon raqamingizni tasdiqlab kiring.")}</p>
        <button type="button" className="kb-login-primary" onClick={start} disabled={busy}>{busy ? <LoaderCircle size={18} className="kb-login-spin"/> : <Send size={18}/>} {busy ? uiT("So‘rov tayyorlanmoqda…") : isLink ? __kbUi("Telegramni ulash") : uiT("Telegram orqali kirish")}</button>
      </>}
      {(pending || busy || onCancel) && <button type="button" className="kb-login-text-button" onClick={cancel}><InterfaceText text={__kbUi("Bekor qilish")}/></button>}
    </>}
  </section>;
}

export default function KabutarLogin({ apiBase = "", onAuthenticated, initialError = "" }) {
  useKbInterfaceLocale();
  const { t: uiT } = useInterface();
  const storageKey = challengeStorageKey(apiBase);
  const [pending, setPending] = useState(() => restoreTelegramChallenge(safeStorage(), storageKey));
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState("");
  const [configAttempt, setConfigAttempt] = useState(0);
  const [method, setMethod] = useState("telegram");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [pollNotice, setPollNotice] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const mounted = useRef(false);
  const command = useRef(null);
  const pollController = useRef(null);
  const commandId = useRef(0);
  const pendingRef = useRef(pending);
  const authenticatedRef = useRef(onAuthenticated);
  const completed = useRef(false);
  const commandBusy = useRef(false);
  const pollNow = useRef(null);

  useEffect(() => { authenticatedRef.current = onAuthenticated; }, [onAuthenticated]);
  useEffect(() => { pendingRef.current = pending; }, [pending]);
  useEffect(() => { if (initialError) setError(initialError); }, [initialError]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      commandId.current += 1;
      command.current?.abort();
      pollController.current?.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setConfigLoading(true);
    setConfigError("");
    authRequest(apiBase, "/auth/config", { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setConfig(data); })
      .catch((err) => { if (!controller.signal.aborted) setConfigError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setConfigLoading(false); });
    return () => controller.abort();
  }, [apiBase, configAttempt]);

  const finish = useCallback((data) => {
    if (!mounted.current || completed.current) return;
    if (typeof data?.token !== "string" || !data.token) throw new Error("Kirish tasdiqlanmadi. Qayta urinib ko‘ring.");
    completed.current = true;
    savePending(storageKey, null);
    setPending(null);
    setBusy(false);
    setPassword("");
    setSuccess(true);
    commandBusy.current = false;
    authenticatedRef.current?.(data.token);
  }, [storageKey]);

  useEffect(() => {
    if (!pending) return undefined;
    const controller = new AbortController();
    pollController.current = controller;
    let retry;
    let networkFailures = 0;
    let checking = false;
    let lastCheck = 0;
    const expire = (message) => {
      if (controller.signal.aborted) return;
      controller.abort();
      savePending(storageKey, null);
      setPending(null);
      setPollNotice("");
      setError(message);
    };
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((pending.expires_at - Date.now()) / 1000));
      setSeconds(remaining);
      if (!remaining) expire("Tasdiqlash vaqti tugadi. Telegram orqali yangi kirish so‘rovini boshlang.");
    };
    tick();
    const clock = setInterval(tick, 1000);
    const poll = async () => {
      if (controller.signal.aborted || Date.now() >= pending.expires_at || checking || Date.now() - lastCheck < 1000) return;
      clearTimeout(retry);
      checking = true;
      lastCheck = Date.now();
      try {
        const data = await authRequest(apiBase, "/auth/telegram/poll", {
          body: { challenge: pending.challenge, browser_secret: pending.browser_secret },
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        networkFailures = 0;
        setPollNotice("");
        if (data.status === "complete") { finish(data); return; }
        if (["expired", "cancelled", "rejected", "denied"].includes(data.status)) {
          expire(data.status === "expired" ? "Tasdiqlash vaqti tugadi. Yangi kirish so‘rovini boshlang." : "Kirish tasdiqlanmadi. Yangi so‘rov bilan qayta urinishingiz mumkin.");
          return;
        }
        if (!["pending", "waiting", "approved"].includes(data.status)) throw new Error("Tasdiqlash javobi tushunarsiz. Qayta tekshirilmoqda.");
      } catch (err) {
        if (controller.signal.aborted) return;
        if ([400, 401, 403, 404, 410].includes(err.status)) { expire(err.message); return; }
        networkFailures += 1;
        setPollNotice(`${err.message} Tasdiqlash yana tekshiriladi.`);
      } finally {
        checking = false;
      }
      if (!controller.signal.aborted) retry = setTimeout(poll, Math.min(8000, 2500 + networkFailures * 1500));
    };
    pollNow.current = poll;
    poll();
    const resume = () => { if (document.visibilityState === "visible") { tick(); poll(); } };
    document.addEventListener("visibilitychange", resume);
    return () => {
      controller.abort();
      if (pollController.current === controller) pollController.current = null;
      if (pollNow.current === poll) pollNow.current = null;
      clearTimeout(retry);
      clearInterval(clock);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [apiBase, pending, storageKey, finish]);

  const cancelPending = useCallback(() => {
    const old = pendingRef.current;
    commandId.current += 1;
    commandBusy.current = false;
    command.current?.abort();
    pollController.current?.abort();
    setBusy(false);
    setPending(null);
    pendingRef.current = null;
    setPollNotice("");
    savePending(storageKey, null);
    if (old) {
      authRequest(apiBase, "/auth/telegram/cancel", { body: { challenge: old.challenge, browser_secret: old.browser_secret } }).catch(() => {});
    }
  }, [apiBase, storageKey]);

  const chooseMethod = (next) => {
    if (busy || pending) cancelPending();
    setMethod(next);
    setError("");
    setPassword("");
  };

  const startTelegram = async () => {
    if (commandBusy.current) return;
    commandBusy.current = true;
    const id = ++commandId.current;
    command.current?.abort();
    const controller = new AbortController();
    command.current = controller;
    setBusy(true);
    setError("");
    try {
      const data = await authRequest(apiBase, "/auth/telegram/start", { body: { mode: "login" }, signal: controller.signal });
      if (!mounted.current || id !== commandId.current) return;
      const next = telegramChallenge(data);
      if (!next) throw new Error("Telegram kirish havolasi olinmadi. Qayta urinib ko‘ring.");
      savePending(storageKey, next);
      pendingRef.current = next;
      setPending(next);
    } catch (err) {
      if (mounted.current && id === commandId.current && !controller.signal.aborted) setError(err.message);
    } finally {
      if (mounted.current && id === commandId.current) { commandBusy.current = false; setBusy(false); }
    }
  };

  const loginWithPassword = async (event) => {
    event.preventDefault();
    if (commandBusy.current || !identifier.trim() || !password) return;
    commandBusy.current = true;
    const id = ++commandId.current;
    command.current?.abort();
    const controller = new AbortController();
    command.current = controller;
    setBusy(true);
    setError("");
    try {
      const data = await authRequest(apiBase, "/auth/password/login", { body: { identifier: identifier.trim(), password }, signal: controller.signal });
      if (mounted.current && id === commandId.current) finish(data);
    } catch (err) {
      if (mounted.current && id === commandId.current && !controller.signal.aborted) setError(err.message);
    } finally {
      if (mounted.current && id === commandId.current) { commandBusy.current = false; setBusy(false); }
    }
  };

  const telegramEnabled = config?.telegram?.enabled === true;
  const passwordEnabled = config?.password?.enabled === true;
  const googleEnabled = config?.google?.enabled === true;

  return <main className="kb-login-page">
    <div className="kb-login-shell">
      <header className="kb-login-header">
        <a className="kb-login-brand" href="#kabutar-home" aria-label={uiT("Kabutar bosh sahifasi")}>
          <span className="kb-login-brand-mark"><Bird size={29} strokeWidth={1.8}/></span>
          <span>{__kbUi("Kabutar")}<span className="kb-login-brand-caption"><InterfaceText text={__kbUi("YAQINROQ BO‘LING. O‘SIB BORING.")}/></span></span>
        </a>
        <nav aria-label={uiT("Bosh sahifa")}><InterfaceSettingsButton/><a href="#kabutar-possibilities"><InterfaceText text={__kbUi("Imkoniyatlar ")}/><ArrowDown size={14}/></a><a className="kb-login-header-enter" href="#kabutar-signin"><InterfaceText text={__kbUi("Kirish ")}/><ArrowRight size={17}/></a></nav>
      </header>

      <div className="kb-login-main" id="kabutar-home">
        <section className="kb-login-intro" aria-labelledby="kabutar-title">
          <span className="kb-login-eyebrow"><span/><InterfaceText text={__kbUi(" SUHBATLARDAN YANGI IMKONIYATLARGA")}/></span>
          <h1 id="kabutar-title"><InterfaceText text={__kbUi("Yaqinlar bilan ")}/><br/><InterfaceText text={__kbUi("suhbat.")}/><br/><em><InterfaceText text={__kbUi("O‘zingiz uchun ")}/><br/><InterfaceText text={__kbUi("rivojlanish.")}/></em></h1>
          <p className="kb-login-lead"><InterfaceText text={__kbUi("Yozing, fikr almashing va o‘rganing. Kabutarda suhbatlar va ta’lim uchun bitta hisob yetarli.")}/></p>

          <div className="kb-login-paths" id="kabutar-possibilities">
            <article><span className="kb-login-path-icon"><MessageCircle size={23}/></span><div><h2>{__kbUi("Kabutar")}</h2><p><InterfaceText text={__kbUi("Suhbatlar, ovozli xabarlar va yaqinlaringiz.")}/></p></div><ArrowRight size={19}/></article>
            <article><span className="kb-login-path-icon kb-login-path-education"><GraduationCap size={24}/></span><div><h2>{__kbUi("Kabutar Ta’lim")}</h2><p><InterfaceText text={__kbUi("Fanlar, shaxsiy jadval va bilim yo‘lingiz.")}/></p></div><ArrowRight size={19}/></article>
          </div>
          <p className="kb-login-intro-note"><Sparkles size={16}/><InterfaceText text={__kbUi(" Avval Kabutarga kiring. Ta’limni o‘zingizga moslab yoqing.")}/></p>
        </section>

        <section className="kb-login-access" id="kabutar-signin" aria-labelledby="kabutar-signin-title">
          <div className="kb-login-card">
            <div className="kb-login-card-top"><span className="kb-login-card-symbol"><Bird size={28}/></span><span><InterfaceText text={__kbUi("BIR HISOB. IKKI IMKONIYAT.")}/></span></div>
            <h2 id="kabutar-signin-title"><InterfaceText text={__kbUi("Xush kelibsiz.")}/></h2>
            <p className="kb-login-card-description"><InterfaceText text={__kbUi("Suhbatingizni davom ettiring")}/><br/><InterfaceText text={__kbUi("yoki Kabutarda ilk qadamingizni qo‘ying.")}/></p>

            {success ? <div className="kb-login-success" role="status"><CheckCircle2 size={36}/><h3><InterfaceText text={__kbUi("Kirish tasdiqlandi")}/></h3><p><InterfaceText text={__kbUi("Kabutaringiz ochilmoqda…")}/></p></div> : <>
              <div className="kb-login-methods" role="group" aria-label={uiT("Kirish usuli")}>
                <button type="button" className={method === "telegram" ? "is-selected" : ""} onClick={() => chooseMethod("telegram")} aria-pressed={method === "telegram"}><Send size={16}/>{__kbUi(" Telegram")}</button>
                <button type="button" className={method === "password" ? "is-selected" : ""} onClick={() => chooseMethod("password")} aria-pressed={method === "password"}><LockKeyhole size={16}/><InterfaceText text={__kbUi(" Parol")}/></button>
              </div>

              {error && <div className="kb-login-error" role="alert">{__kbUi(error)}<button type="button" onClick={() => setError("")} aria-label={uiT("Xato xabarini yopish")}><X size={16}/></button></div>}
              {configError && <div className="kb-login-service-error" role="status"><p>{__kbUi(configError)}</p><button type="button" onClick={() => setConfigAttempt((attempt) => attempt + 1)}><InterfaceText text={__kbUi("Qayta tekshirish")}/></button></div>}

              {method === "telegram" && (pending ? <div className="kb-login-telegram-pending">
                <div className="kb-login-pending-heading"><span><LoaderCircle className="kb-login-spin" size={16}/><InterfaceText text={__kbUi(" Tasdiqlashingiz kutilmoqda")}/></span><time aria-label={uiT("Qolgan vaqt")}>{__kbUi(formatAuthCountdown(seconds))}</time></div>
                <ol><li><InterfaceText text={__kbUi("Botni oching va ")}/><strong>{__kbUi("Start")}</strong><InterfaceText text={__kbUi(" tugmasini bosing.")}/></li><li><InterfaceText text={__kbUi("O‘z telefon raqamingizni ulashing va kirishni tasdiqlang.")}/></li><li><InterfaceText text={__kbUi("Shu oynaga qayting — hisobingiz ochiladi.")}/></li></ol>
                {pending.verification_code && <div className="kb-login-verification"><span><InterfaceText text={__kbUi("Botdagi so‘rov raqami shu bilan bir xil bo‘lsin:")}/></span><strong>{pending.verification_code}</strong></div>}
                <a className="kb-login-primary" href={pending.bot_url} target="_blank" rel="noopener noreferrer"><Send size={19}/><InterfaceText text={__kbUi(" Telegram botini ochish ")}/><ArrowRight size={18}/></a>
                <p className="kb-login-pending-note">{uiT("Tasdiqlagach, aynan shu brauzer oynasiga qayting. Telegram ichida ochilgan boshqa oynada so‘rov davom etmaydi.")}</p>
                <button type="button" className="kb-login-text-button" onClick={() => pollNow.current?.()}>{uiT("Botda tasdiqladim — tekshirish")}</button>
                {pollNotice && <p className="kb-login-poll-notice" role="status">{__kbUi(pollNotice)}</p>}
                <button type="button" className="kb-login-text-button" onClick={cancelPending}><InterfaceText text={__kbUi("Bekor qilish")}/></button>
              </div> : <div className="kb-login-telegram-start">
                <p className="kb-login-method-copy"><InterfaceText text={__kbUi("Telegram orqali telefoningizni tasdiqlab kiring. Hisobingiz bo‘lmasa, avtomatik yaratiladi.")}/></p>
                <button type="button" className="kb-login-primary" onClick={startTelegram} disabled={busy || configLoading || (!telegramEnabled && !configError)}>{busy || configLoading ? <LoaderCircle size={19} className="kb-login-spin"/> : <Send size={19}/>} {busy ? uiT("So‘rov tayyorlanmoqda…") : configLoading ? uiT("Kirish usullari tekshirilmoqda…") : uiT("Telegram orqali kirish")}{!busy && !configLoading && <ArrowRight size={18}/>}</button>
                {!configLoading && config && !telegramEnabled && <p className="kb-login-poll-notice">{config?.telegram?.reason ? __kbUi(`Telegram orqali kirish hali sozlanmagan: ${config.telegram.reason}. `) : __kbUi("")}<InterfaceText text={config?.telegram?.reason ? __kbUi("Sayt administratoriga ayting yoki Google orqali kiring.") : __kbUi("Telegram orqali kirish hali sozlanmagan. Sayt administratoriga ayting yoki Google orqali kiring.")}/></p>}
                <p className="kb-login-under-button"><ShieldCheck size={15}/><InterfaceText text={__kbUi(" SMS yuborilmaydi. Tasdiqlash Telegram botida.")}/></p>
              </div>)}

              {method === "password" && <form className="kb-login-password-form" onSubmit={loginWithPassword}>
                <p className="kb-login-method-copy">{uiT("O‘zingiz belgilagan shaxsiy parol bilan hisobingizga kiring.")}</p>
                <p className="kb-login-recovery-note">{uiT("Admin bergan muassasa kodi bormi? Avval Telegram yoki Google orqali kiring. Keyin “Ta’lim maydoni → Admin bergan ulanish kodim bor”ni bosing. Ta’lim maydoni ochilgan bo‘lsa, kod Profil → Muassasaga ulanish bo‘limida kiritiladi.")}</p>
                <label htmlFor="kabutar-login-identifier"><InterfaceText text={__kbUi("Telefon, KB raqami, nik yoki email")}/></label>
                <input id="kabutar-login-identifier" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={uiT("+998… yoki KB-123456")} maxLength={254} required disabled={busy}/>
                <label htmlFor="kabutar-login-password"><InterfaceText text={__kbUi("Parol")}/></label>
                <div className="kb-login-password-input"><input id="kabutar-login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={uiT("Parolingizni kiriting")} maxLength={128} required disabled={busy}/><button type="button" aria-label={showPassword ? uiT("Parolni yashirish") : uiT("Parolni ko‘rsatish")} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div>
                <button className="kb-login-primary" type="submit" disabled={busy || configLoading || (!passwordEnabled && !configError) || !identifier.trim() || !password}>{busy ? <LoaderCircle size={19} className="kb-login-spin"/> : <LockKeyhole size={19}/>} {busy ? uiT("Tekshirilmoqda…") : uiT("Parol orqali kirish")}{!busy && <ArrowRight size={18}/>}</button>
                {!configLoading && config && !passwordEnabled && <p className="kb-login-poll-notice"><InterfaceText text={__kbUi("Parol orqali kirish hozir mavjud emas.")}/></p>}
                <button type="button" className="kb-login-text-button" onClick={() => chooseMethod("telegram")}><InterfaceText text={__kbUi("Parol esingizdan chiqdimi? Telegram orqali kiring")}/></button>
                <p className="kb-login-recovery-note"><InterfaceText text={__kbUi("Tiklash uchun avval shu hisobga ulangan Telegram yoki Google hisobidan foydalaning.")}/></p>
              </form>}

              {!pending && <>
                <div className="kb-login-divider"><span/><InterfaceText text={__kbUi("yoki")}/><span/></div>
                <button type="button" className="kb-login-google" disabled={busy || configLoading || (!googleEnabled && !configError)} onClick={() => { window.location.assign(authEndpoint(apiBase, "/auth/google/login")); }}><GoogleMark/><span><InterfaceText text={__kbUi("Google orqali kirish")}/></span><ChevronRight size={17}/></button>
                {!configLoading && config && !googleEnabled && <p className="kb-login-poll-notice"><InterfaceText text={__kbUi("Google orqali kirish hozir sozlanmagan.")}/></p>}
                <p className="kb-login-account-note"><InterfaceText text={__kbUi("Oldin Google orqali kirganmisiz? O‘sha hisob bilan kiring, keyin Telegramni profilingizdan ulang.")}/></p>
              </>}
            </>}
          </div>
          <div className="kb-login-card-foot"><Check size={15}/><span><InterfaceText text={__kbUi("Bir marta kirish. Suhbatlar va ta’lim uchun bitta profil.")}/></span></div>
        </section>
      </div>
      <footer className="kb-login-footer"><span>{__kbUi("Kabutar ")}<span className="kb-login-footer-dot">·</span><InterfaceText text={__kbUi(" Suhbat va ta’lim maydoni")}/></span><span><BookOpen size={15}/><InterfaceText text={__kbUi(" O‘rganish — har kim uchun.")}/></span></footer>
    </div>
  </main>;
}
