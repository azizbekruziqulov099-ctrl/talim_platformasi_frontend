import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Bird, Check, CheckCircle2, ChevronRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Send, X } from "lucide-react";
import { authEndpoint, authRequest, challengeStorageKey } from "./authClient.js";
import "./kabutar-login.css";
import TelegramCodeLogin from "./TelegramCodeLogin.jsx";
import { readTelegramLinkIntent } from "./telegramCodeClient.js";
import { InterfaceText, InterfaceSettingsButton, useInterface } from "../interface/InterfacePreferences.jsx";
import { LOGIN_ROLES, ROLE_NAMES, cachedAuthConfig, dropToken, forgetAccount, loginRole, methodLabel, rememberLoginMethod, saveAuthConfig, saveLoginRole, savedAccounts } from "./loginMemory.js";
import { saveTelegramPhone } from "./telegramCodeClient.js";

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

// Both account linking and login use the code actually issued by the bot.
export function TelegramSignIn(props) {
  return <TelegramCodeLogin {...props}/>;
}

export default function KabutarLogin({ apiBase = "", onAuthenticated, initialError = "", onCourses }) {
  useKbInterfaceLocale();
  const { t: uiT } = useInterface();
  const storageKey = challengeStorageKey(apiBase);
  // Oxirgi /auth/config keshdan darhol olinadi — kirish oynasi server javobini kutmaydi.
  const [config, setConfig] = useState(() => cachedAuthConfig());
  const [configLoading, setConfigLoading] = useState(() => !cachedAuthConfig());
  const [role, setRole] = useState(() => loginRole());
  const [accounts, setAccounts] = useState(() => savedAccounts());
  const [resuming, setResuming] = useState("");
  const [telegramKey, setTelegramKey] = useState(0);
  const [configError, setConfigError] = useState("");
  const [configAttempt, setConfigAttempt] = useState(0);
  const [method, setMethod] = useState("telegram");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const mounted = useRef(false);
  const command = useRef(null);
  const commandId = useRef(0);
  const authenticatedRef = useRef(onAuthenticated);
  const completed = useRef(false);
  const commandBusy = useRef(false);

  useEffect(() => { authenticatedRef.current = onAuthenticated; }, [onAuthenticated]);
  useEffect(() => { if (initialError) setError(initialError); }, [initialError]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      commandId.current += 1;
      command.current?.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setConfigLoading(true);
    setConfigError("");
    authRequest(apiBase, "/auth/config", { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) { setConfig(data); saveAuthConfig(data); } })
      .catch((err) => { if (!controller.signal.aborted) setConfigError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setConfigLoading(false); });
    return () => controller.abort();
  }, [apiBase, configAttempt]);

  const finish = useCallback((data) => {
    if (!mounted.current || completed.current) return;
    if (typeof data?.token !== "string" || !data.token) throw new Error("Kirish tasdiqlanmadi. Qayta urinib ko‘ring.");
    completed.current = true;
    if (data?.method) rememberLoginMethod(data.method, data.identifier || "");
    savePending(storageKey, null);
    setBusy(false);
    setPassword("");
    setSuccess(true);
    commandBusy.current = false;
    authenticatedRef.current?.(data.token);
  }, [storageKey]);

  useEffect(() => { savePending(storageKey, null); }, [storageKey]);

  const chooseMethod = (next) => {
    commandId.current += 1;
    command.current?.abort();
    commandBusy.current = false;
    setBusy(false);
    setMethod(next);
    setError("");
    setPassword("");
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
      if (mounted.current && id === commandId.current) finish({ ...data, method: "password", identifier: identifier.trim() });
    } catch (err) {
      if (mounted.current && id === commandId.current && !controller.signal.aborted) setError(err.message);
    } finally {
      if (mounted.current && id === commandId.current) { commandBusy.current = false; setBusy(false); }
    }
  };

  // Konfiguratsiya hali kelmagan bo'lsa ham tugmalar ochiq: server o'zi tekshiradi.
  const passwordEnabled = config ? config?.password?.enabled === true : true;
  const googleEnabled = config ? config?.google?.enabled === true : true;
  const pickRole = (next) => { setRole(next); saveLoginRole(next); };
  const startGoogle = () => { rememberLoginMethod("google"); window.location.assign(authEndpoint(apiBase, readTelegramLinkIntent() ? "/auth/google/login?intent=telegram" : "/auth/google/login")); };

  // Oldin shu qurilmada kirgan akkaunt: sessiya tirik bo'lsa bir bosishda kiradi,
  // tugagan bo'lsa kirish usuli va login oldindan to'ldiriladi.
  const resume = async (account) => {
    if (resuming) return;
    setError("");
    if (account.role) pickRole(account.role);
    if (account.token) {
      setResuming(String(account.user_id));
      try {
        const response = await fetch(authEndpoint(apiBase, "/auth/men"), { headers: { Authorization: `Bearer ${account.token}`, Accept: "application/json" }, cache: "no-store" });
        if (response.ok) { finish({ token: account.token }); return; }
        setAccounts(dropToken(account.token));
      } catch { /* tarmoq xatosi — pastdagi usul bilan davom etadi */ }
      finally { if (mounted.current) setResuming(""); }
    }
    if (account.method === "google" && googleEnabled) { startGoogle(); return; }
    if (account.method === "password") { chooseMethod("password"); setIdentifier(account.identifier || ""); return; }
    chooseMethod("telegram"); setTelegramKey((value) => value + 1);
    setError("Sessiya tugagan. Telegram botdan yangi kod olib kiring — bir daqiqa.");
  };

  return <main className="kb-login-page kb-login-compact">
    <div className="kb-login-shell">
      <header className="kb-login-header">
        <a className="kb-login-brand" href="#kabutar-signin" aria-label={uiT("Kabutar bosh sahifasi")}>
          <span className="kb-login-brand-mark"><Bird size={29} strokeWidth={1.8}/></span>
          <span>{__kbUi("Kabutar")}<span className="kb-login-brand-caption"><InterfaceText text={__kbUi("SUHBAT VA TA’LIM")}/></span></span>
        </a>
        <nav aria-label={uiT("Bosh sahifa")}>{onCourses && <button type="button" className="kb-login-courses" onClick={onCourses}><InterfaceText text={__kbUi("Kurslar")}/></button>}<InterfaceSettingsButton/></nav>
      </header>

      <div className="kb-login-main kb-login-main-single">
        <section className="kb-login-access" id="kabutar-signin" aria-labelledby="kabutar-signin-title">
          <div className="kb-login-card">
            <h2 id="kabutar-signin-title"><InterfaceText text={__kbUi("Kirish")}/></h2>

            {success ? <div className="kb-login-success" role="status"><CheckCircle2 size={36}/><h3><InterfaceText text={__kbUi("Kirish tasdiqlandi")}/></h3><p><InterfaceText text={__kbUi("Kabutaringiz ochilmoqda…")}/></p></div> : <>
              {accounts.length > 0 && <div className="kb-login-saved" aria-label={uiT("Shu qurilmada kirgan akkauntlar")}>
                <p className="kb-login-step"><InterfaceText text={__kbUi("Oldin kirgansiz — bosing:")}/></p>
                {accounts.map((account) => <div key={account.user_id} className="kb-login-saved-item">
                  <button type="button" onClick={() => resume(account)} disabled={Boolean(resuming) || busy}>
                    <span className="kb-login-avatar" aria-hidden="true">{String(account.name || "?").trim().charAt(0).toUpperCase()}</span>
                    <span className="kb-login-saved-text"><b>{account.name}</b><small>{[ROLE_NAMES[account.role] && uiT(ROLE_NAMES[account.role]), account.token ? uiT("tez kirish") : methodLabel(account.method)].filter(Boolean).join(" · ")}</small></span>
                    {resuming === String(account.user_id) ? <LoaderCircle size={17} className="kb-login-spin"/> : <ChevronRight size={17}/>}
                  </button>
                  <button type="button" className="kb-login-saved-remove" aria-label={uiT("Bu qurilmadan olib tashlash")} title={uiT("Bu qurilmadan olib tashlash")} onClick={() => setAccounts(forgetAccount(account.user_id))}><X size={14}/></button>
                </div>)}
              </div>}

              <p className="kb-login-step"><InterfaceText text={__kbUi("1. Kim sifatida kirasiz?")}/></p>
              <div className="kb-login-roles" role="radiogroup" aria-label={uiT("Rol")}>
                {LOGIN_ROLES.map(([id, name, icon]) => <button key={id} type="button" role="radio" aria-checked={role === id} className={role === id ? "is-selected" : ""} onClick={() => pickRole(id)}><span aria-hidden="true">{icon}</span>{uiT(name)}</button>)}
              </div>
              <p className="kb-login-role-note"><InterfaceText text={__kbUi("Rol yangi akkauntga qo‘yiladi. Keyin uni faqat Sozlamalardan o‘zgartirasiz.")}/></p>

              <p className="kb-login-step"><InterfaceText text={__kbUi("2. Qanday kirasiz?")}/></p>
              <div className="kb-login-methods" role="group" aria-label={uiT("Kirish usuli")}>
                <button type="button" className={method === "telegram" ? "is-selected" : ""} onClick={() => chooseMethod("telegram")} aria-pressed={method === "telegram"}><Send size={16}/>{__kbUi(" Telegram")}</button>
                <button type="button" className={method === "password" ? "is-selected" : ""} onClick={() => chooseMethod("password")} aria-pressed={method === "password"}><LockKeyhole size={16}/><InterfaceText text={__kbUi(" Parol")}/></button>
              </div>

              {error && <div className="kb-login-error" role="alert">{__kbUi(error)}<button type="button" onClick={() => setError("")} aria-label={uiT("Xato xabarini yopish")}><X size={16}/></button></div>}
              {configError && !config && <div className="kb-login-service-error" role="status"><p>{__kbUi(configError)}</p><button type="button" onClick={() => setConfigAttempt((attempt) => attempt + 1)}><InterfaceText text={__kbUi("Qayta tekshirish")}/></button></div>}

              {method === "telegram" && <TelegramCodeLogin key={telegramKey} apiBase={apiBase} config={config} onAuthenticated={(data) => finish({ ...data, method: "telegram" })}/>}

              {method === "password" && <form className="kb-login-password-form" onSubmit={loginWithPassword}>
                <label htmlFor="kabutar-login-identifier"><InterfaceText text={__kbUi("Telefon, KB raqami, nik yoki email")}/></label>
                <input id="kabutar-login-identifier" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={uiT("+998… yoki KB-123456")} maxLength={254} required disabled={busy}/>
                <label htmlFor="kabutar-login-password"><InterfaceText text={__kbUi("Parol")}/></label>
                <div className="kb-login-password-input"><input id="kabutar-login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={uiT("Parolingizni kiriting")} maxLength={128} required disabled={busy}/><button type="button" aria-label={showPassword ? uiT("Parolni yashirish") : uiT("Parolni ko‘rsatish")} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div>
                <button className="kb-login-primary" type="submit" disabled={busy || !passwordEnabled || !identifier.trim() || !password}>{busy ? <LoaderCircle size={19} className="kb-login-spin"/> : <LockKeyhole size={19}/>} {busy ? uiT("Tekshirilmoqda…") : uiT("Kirish")}{!busy && <ArrowRight size={18}/>}</button>
                {config && !passwordEnabled && <p className="kb-login-poll-notice"><InterfaceText text={__kbUi("Parol orqali kirish hozir mavjud emas.")}/></p>}
                <button type="button" className="kb-login-text-button" onClick={() => chooseMethod("telegram")}><InterfaceText text={__kbUi("Parol esingizdan chiqdimi? Telegram orqali kiring")}/></button>
              </form>}

              <div className="kb-login-divider"><span/><InterfaceText text={__kbUi("yoki")}/><span/></div>
              <button type="button" className="kb-login-google" disabled={busy || !googleEnabled} onClick={startGoogle}><GoogleMark/><span><InterfaceText text={__kbUi("Google (Gmail) orqali kirish")}/></span><ChevronRight size={17}/></button>
              {config && !googleEnabled && <p className="kb-login-poll-notice"><InterfaceText text={__kbUi("Google orqali kirish hozir sozlanmagan.")}/></p>}
            </>}
          </div>
          <div className="kb-login-card-foot"><Check size={15}/><span><InterfaceText text={__kbUi("Bir hisob: suhbatlar va ta’lim. Telegram yoki Gmail ulangan hisob yo‘qolmaydi.")}/></span></div>
        </section>
      </div>
    </div>
  </main>;
}
