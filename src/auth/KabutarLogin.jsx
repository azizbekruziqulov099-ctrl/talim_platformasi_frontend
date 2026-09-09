import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Bird, BookOpen, Check, CheckCircle2, ChevronRight, Eye, EyeOff, GraduationCap, LoaderCircle, LockKeyhole, MessageCircle, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { authEndpoint, authRequest, challengeStorageKey, formatAuthCountdown, restoreTelegramChallenge, telegramChallenge } from "./authClient.js";
import "./kabutar-login.css";

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

  return <section className="kb-login-page kb-login-compact" aria-label={isLink ? "Telegramni ulash" : "Telegram orqali kirish"}>
    {done ? <div className="kb-login-success" role="status"><CheckCircle2 size={32}/><h3>{isLink ? "Telegram hisobingizga ulandi" : "Kirish tasdiqlandi"}</h3></div> : <>
      {error && <div className="kb-login-error" role="alert">{error}</div>}
      {pending ? <div className="kb-login-telegram-pending">
        <div className="kb-login-pending-heading"><span><LoaderCircle size={16} className="kb-login-spin"/> Tasdiqlashingiz kutilmoqda</span><time>{formatAuthCountdown(seconds)}</time></div>
        <p className="kb-login-method-copy">Botni oching, Start tugmasini bosing, o‘z telefon raqamingizni ulashib tasdiqlang. So‘ng shu oynaga qayting.</p>
        {pending.verification_code && <div className="kb-login-verification"><span>Botdagi so‘rov raqami shu bilan bir xil bo‘lsin:</span><strong>{pending.verification_code}</strong></div>}
        <a className="kb-login-primary" href={pending.bot_url} target="_blank" rel="noopener noreferrer"><Send size={18}/> Telegram botini ochish <ArrowRight size={18}/></a>
        <p className="kb-login-pending-note">Faqat o‘zingiz boshlagan so‘rovni tasdiqlang.</p>
      </div> : <>
        <p className="kb-login-method-copy">{isLink ? "Telegram va telefon raqamingiz shu Kabutar hisobingizga ulanadi. Suhbatlaringiz va KB raqamingiz saqlanadi." : "Telegram botida o‘z telefon raqamingizni tasdiqlab kiring."}</p>
        <button type="button" className="kb-login-primary" onClick={start} disabled={busy}>{busy ? <LoaderCircle size={18} className="kb-login-spin"/> : <Send size={18}/>} {busy ? "So‘rov tayyorlanmoqda…" : isLink ? "Telegramni ulash" : "Telegram orqali kirish"}</button>
      </>}
      {(pending || busy || onCancel) && <button type="button" className="kb-login-text-button" onClick={cancel}>Bekor qilish</button>}
    </>}
  </section>;
}

export default function KabutarLogin({ apiBase = "", onAuthenticated, initialError = "" }) {
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
    authenticatedRef.current?.(data.token);
  }, [storageKey]);

  useEffect(() => {
    if (!pending) return undefined;
    const controller = new AbortController();
    pollController.current = controller;
    let retry;
    let networkFailures = 0;
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
      if (controller.signal.aborted || Date.now() >= pending.expires_at) return;
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
      }
      if (!controller.signal.aborted) retry = setTimeout(poll, Math.min(8000, 2500 + networkFailures * 1500));
    };
    poll();
    const resume = () => { if (document.visibilityState === "visible") tick(); };
    document.addEventListener("visibilitychange", resume);
    return () => {
      controller.abort();
      if (pollController.current === controller) pollController.current = null;
      clearTimeout(retry);
      clearInterval(clock);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [apiBase, pending, storageKey, finish]);

  const cancelPending = useCallback(() => {
    const old = pendingRef.current;
    commandId.current += 1;
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
    if (busy) return;
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
      if (mounted.current && id === commandId.current) setBusy(false);
    }
  };

  const loginWithPassword = async (event) => {
    event.preventDefault();
    if (busy || !identifier.trim() || !password) return;
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
      if (mounted.current && id === commandId.current) setBusy(false);
    }
  };

  const telegramEnabled = config?.telegram?.enabled === true;
  const passwordEnabled = config?.password?.enabled === true;
  const googleEnabled = config?.google?.enabled === true;

  return <main className="kb-login-page">
    <div className="kb-login-shell">
      <header className="kb-login-header">
        <a className="kb-login-brand" href="#kabutar-home" aria-label="Kabutar bosh sahifasi">
          <span className="kb-login-brand-mark"><Bird size={29} strokeWidth={1.8}/></span>
          <span>Kabutar<span className="kb-login-brand-caption">YAQINROQ BO‘LING. O‘SIB BORING.</span></span>
        </a>
        <nav aria-label="Bosh sahifa"><a href="#kabutar-possibilities">Imkoniyatlar <ArrowDown size={14}/></a><a className="kb-login-header-enter" href="#kabutar-signin">Kirish <ArrowRight size={17}/></a></nav>
      </header>

      <div className="kb-login-main" id="kabutar-home">
        <section className="kb-login-intro" aria-labelledby="kabutar-title">
          <span className="kb-login-eyebrow"><span/> SUHBATLARDAN YANGI IMKONIYATLARGA</span>
          <h1 id="kabutar-title">Yaqinlar bilan <br/>suhbat.<br/><em>O‘zingiz uchun <br/>rivojlanish.</em></h1>
          <p className="kb-login-lead">Yozing, fikr almashing va o‘rganing. Kabutarda suhbatlar va ta’lim uchun bitta hisob yetarli.</p>

          <div className="kb-login-paths" id="kabutar-possibilities">
            <article><span className="kb-login-path-icon"><MessageCircle size={23}/></span><div><h2>Kabutar</h2><p>Suhbatlar, ovozli xabarlar va yaqinlaringiz.</p></div><ArrowRight size={19}/></article>
            <article><span className="kb-login-path-icon kb-login-path-education"><GraduationCap size={24}/></span><div><h2>Kabutar Ta’lim</h2><p>Fanlar, shaxsiy jadval va bilim yo‘lingiz.</p></div><ArrowRight size={19}/></article>
          </div>
          <p className="kb-login-intro-note"><Sparkles size={16}/> Avval Kabutarga kiring. Ta’limni o‘zingizga moslab yoqing.</p>
        </section>

        <section className="kb-login-access" id="kabutar-signin" aria-labelledby="kabutar-signin-title">
          <div className="kb-login-card">
            <div className="kb-login-card-top"><span className="kb-login-card-symbol"><Bird size={28}/></span><span>BIR HISOB. IKKI IMKONIYAT.</span></div>
            <h2 id="kabutar-signin-title">Xush kelibsiz.</h2>
            <p className="kb-login-card-description">Suhbatingizni davom ettiring<br/>yoki Kabutarda ilk qadamingizni qo‘ying.</p>

            {success ? <div className="kb-login-success" role="status"><CheckCircle2 size={36}/><h3>Kirish tasdiqlandi</h3><p>Kabutaringiz ochilmoqda…</p></div> : <>
              <div className="kb-login-methods" role="group" aria-label="Kirish usuli">
                <button type="button" className={method === "telegram" ? "is-selected" : ""} onClick={() => chooseMethod("telegram")} aria-pressed={method === "telegram"}><Send size={16}/> Telegram</button>
                <button type="button" className={method === "password" ? "is-selected" : ""} onClick={() => chooseMethod("password")} aria-pressed={method === "password"}><LockKeyhole size={16}/> Parol</button>
              </div>

              {error && <div className="kb-login-error" role="alert">{error}<button type="button" onClick={() => setError("")} aria-label="Xato xabarini yopish"><X size={16}/></button></div>}
              {configError && <div className="kb-login-service-error" role="status"><p>{configError}</p><button type="button" onClick={() => setConfigAttempt((attempt) => attempt + 1)}>Qayta tekshirish</button></div>}

              {method === "telegram" && (pending ? <div className="kb-login-telegram-pending">
                <div className="kb-login-pending-heading"><span><LoaderCircle className="kb-login-spin" size={16}/> Tasdiqlashingiz kutilmoqda</span><time aria-label="Qolgan vaqt">{formatAuthCountdown(seconds)}</time></div>
                <ol><li>Botni oching va <strong>Start</strong> tugmasini bosing.</li><li>O‘z telefon raqamingizni ulashing va kirishni tasdiqlang.</li><li>Shu oynaga qayting — hisobingiz ochiladi.</li></ol>
                {pending.verification_code && <div className="kb-login-verification"><span>Botdagi so‘rov raqami shu bilan bir xil bo‘lsin:</span><strong>{pending.verification_code}</strong></div>}
                <a className="kb-login-primary" href={pending.bot_url} target="_blank" rel="noopener noreferrer"><Send size={19}/> Telegram botini ochish <ArrowRight size={18}/></a>
                <p className="kb-login-pending-note">Faqat o‘zingiz boshlagan kirish so‘rovini tasdiqlang.</p>
                {pollNotice && <p className="kb-login-poll-notice" role="status">{pollNotice}</p>}
                <button type="button" className="kb-login-text-button" onClick={cancelPending}>Bekor qilish</button>
              </div> : <div className="kb-login-telegram-start">
                <p className="kb-login-method-copy">Telegram orqali telefoningizni tasdiqlab kiring. Hisobingiz bo‘lmasa, avtomatik yaratiladi.</p>
                <button type="button" className="kb-login-primary" onClick={startTelegram} disabled={busy || configLoading || (!telegramEnabled && !configError)}>{busy || configLoading ? <LoaderCircle size={19} className="kb-login-spin"/> : <Send size={19}/>} {busy ? "So‘rov tayyorlanmoqda…" : configLoading ? "Kirish usullari tekshirilmoqda…" : "Telegram orqali kirish"}{!busy && !configLoading && <ArrowRight size={18}/>}</button>
                {!configLoading && config && !telegramEnabled && <p className="kb-login-poll-notice">Telegram orqali kirish hali sozlanmagan. Boshqa kirish usulidan foydalaning.</p>}
                <p className="kb-login-under-button"><ShieldCheck size={15}/> SMS yuborilmaydi. Tasdiqlash Telegram botida.</p>
              </div>)}

              {method === "password" && <form className="kb-login-password-form" onSubmit={loginWithPassword}>
                <p className="kb-login-method-copy">Oldindan parol qo‘ygan bo‘lsangiz, shu hisobingizga kiring.</p>
                <label htmlFor="kabutar-login-identifier">Telefon, KB raqami yoki email</label>
                <input id="kabutar-login-identifier" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="+998… yoki KB-123456" maxLength={254} required disabled={busy}/>
                <label htmlFor="kabutar-login-password">Parol</label>
                <div className="kb-login-password-input"><input id="kabutar-login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Parolingizni kiriting" maxLength={128} required disabled={busy}/><button type="button" aria-label={showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div>
                <button className="kb-login-primary" type="submit" disabled={busy || configLoading || !passwordEnabled || !identifier.trim() || !password}>{busy ? <LoaderCircle size={19} className="kb-login-spin"/> : <LockKeyhole size={19}/>} {busy ? "Tekshirilmoqda…" : "Parol orqali kirish"}{!busy && <ArrowRight size={18}/>}</button>
                {!configLoading && config && !passwordEnabled && <p className="kb-login-poll-notice">Parol orqali kirish hozir mavjud emas.</p>}
                <button type="button" className="kb-login-text-button" onClick={() => chooseMethod("telegram")}>Parol esingizdan chiqdimi? Telegram orqali kiring</button>
                <p className="kb-login-recovery-note">Tiklash uchun avval shu hisobga ulangan Telegram yoki Google hisobidan foydalaning.</p>
              </form>}

              {!pending && <>
                <div className="kb-login-divider"><span/>yoki<span/></div>
                <button type="button" className="kb-login-google" disabled={busy || configLoading || (!googleEnabled && !configError)} onClick={() => { window.location.assign(authEndpoint(apiBase, "/auth/google/login")); }}><GoogleMark/><span>Google orqali kirish</span><ChevronRight size={17}/></button>
                {!configLoading && config && !googleEnabled && <p className="kb-login-poll-notice">Google orqali kirish hozir sozlanmagan.</p>}
                <p className="kb-login-account-note">Oldin Google orqali kirganmisiz? O‘sha hisob bilan kiring, keyin Telegramni profilingizdan ulang.</p>
              </>}
            </>}
          </div>
          <div className="kb-login-card-foot"><Check size={15}/><span>Bir marta kirish. Suhbatlar va ta’lim uchun bitta profil.</span></div>
        </section>
      </div>
      <footer className="kb-login-footer"><span>Kabutar <span className="kb-login-footer-dot">·</span> Suhbat va ta’lim maydoni</span><span><BookOpen size={15}/> O‘rganish — har kim uchun.</span></footer>
    </div>
  </main>;
}
