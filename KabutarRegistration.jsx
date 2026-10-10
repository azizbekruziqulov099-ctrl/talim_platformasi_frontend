import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bird, CheckCircle2, LoaderCircle, MessageCircle } from "lucide-react";
import { authRequest } from "./authClient.js";
import { claimInstitution, institutionCodeError, normalizeInstitutionCode } from "../workspace/membershipClient.js";
import "./kabutar-login.css";
import { InterfaceText, InterfaceSettingsButton, useInterface } from "../interface/InterfacePreferences.jsx";

export default function KabutarRegistration({ apiBase = "", email = "", ism = "", oauthGrant = "", onAuthenticated, onCancel }) {
  useKbInterfaceLocale();
  const { t: uiT } = useInterface();
  const [name, setName] = useState(ism || "");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const mounted = useRef(false);
  const request = useRef(null);
  const submitted = useRef(false);
  const authenticated = useRef(null);
  const inFlight = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; request.current?.abort(); };
  }, []);

  async function register(event) {
    event.preventDefault();
    if (inFlight.current || submitted.current) return;
    const clean = name.trim().replace(/\s+/g, " ");
    const invite = normalizeInstitutionCode(inviteCode);
    setError("");
    if (!authenticated.current && (clean.length < 2 || clean.length > 80)) { setError("Ismingizni 2–80 belgi bilan kiriting."); return; }
    if (invite && institutionCodeError(invite)) { setError(institutionCodeError(invite)); return; }
    if (!authenticated.current && (!oauthGrant || !email)) { setError("Google tasdig‘i topilmadi. Kirish sahifasiga qaytib, Google orqali qayta kiring."); return; }
    inFlight.current = true;
    setBusy(true);
    const controller = new AbortController();
    request.current = controller;
    try {
      if (!authenticated.current) {
        const data = await authRequest(apiBase, "/auth/royxat", {
          body: { email, ism: clean, rol: "kabutar", oauth_grant: oauthGrant },
          signal: controller.signal,
        });
        if (!mounted.current || controller.signal.aborted) return;
        if (typeof data?.token !== "string" || !data.token) throw new Error("Hisob yaratilgani tasdiqlanmadi. Qayta urinib ko‘ring.");
        authenticated.current = data.token;
        setAccountCreated(true);
      }
      if (invite) await claimInstitution(apiBase, authenticated.current, invite, controller.signal);
      if (!mounted.current || controller.signal.aborted) return;
      submitted.current = true;
      onAuthenticated?.(authenticated.current);
    } catch (err) {
      if (mounted.current && !controller.signal.aborted) setError(err.message);
    } finally {
      inFlight.current = false;
      if (mounted.current && !controller.signal.aborted) setBusy(false);
    }
  }

  return <main className="kb-login-page kb-registration-page"><div className="kb-registration-shell"><div className="kb-registration-interface"><InterfaceSettingsButton/></div>
    <div className="kb-login-brand"><span className="kb-login-brand-mark"><Bird size={29}/></span><span>{__kbUi("Kabutar")}<span className="kb-login-brand-caption"><InterfaceText text={__kbUi("YAQINROQ BO‘LING. O‘SIB BORING.")}/></span></span></div>
    <section className="kb-login-card kb-registration-card" aria-labelledby="kb-registration-heading">
      <span className="kb-registration-verified"><CheckCircle2 size={16}/><InterfaceText text={__kbUi(" Google hisobingiz tasdiqlandi")}/></span>
      <h1 id="kb-registration-heading">{uiT(accountCreated ? "Hisobingiz yaratildi" : "Sizni qanday chaqiraylik?")}</h1>
      <p className="kb-login-method-copy"><InterfaceText text={__kbUi("Ismingizni saqlang — ta’lim bo‘limi darhol ochiladi. Testlar uchun sinf yoki kursingizni tanlaysiz.")}/></p>
      <div className="kb-registration-email">{email}</div>
      {error && <div className="kb-login-error" role="alert">{__kbUi(error)}</div>}
      {accountCreated && error && <div className="kb-registration-existing"><strong>{uiT('Hisobingiz saqlandi. Muassasa kodi hali tasdiqlanmadi.')}</strong><p>{uiT('Kodni tuzatib qayta yuboring yoki hisobingizga o‘ting. Keyin Profil → Muassasaga ulanish orqali davom etishingiz mumkin.')}</p><button type="button" className="kb-login-text-button" disabled={busy} onClick={() => { submitted.current = true; onAuthenticated?.(authenticated.current); }}>{uiT('Hisobga kirish')}</button></div>}
      <form className="kb-login-password-form" onSubmit={register}>
        <details className="kb-registration-invite" onToggle={(event) => { if (!event.currentTarget.open && !busy) setInviteCode(""); }}>
          <summary><InterfaceText text={__kbUi("Muassasa taklif kodi bormi?")}/></summary>
          <label htmlFor="kb-registration-invite"><InterfaceText text={__kbUi("Taklif kodi")}/><input id="kb-registration-invite" type="text" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={256} disabled={busy} placeholder={uiT("Muassasa bergan kod")}/></label>
          <p><InterfaceText text={__kbUi("Faqat muassasa bergan rasmiy taklif kodi uchun. Taklif tasdiqlansa, muassasa tayyorlagan profilingiz ochiladi.")}/></p>
        </details>
        <label htmlFor="kb-registration-name"><InterfaceText text={__kbUi("Ism va familiyangiz")}/></label>
        <input id="kb-registration-name" name="name" autoComplete="name" type="text" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required={!accountCreated} disabled={busy || accountCreated} placeholder={uiT("Ism va familiyangiz")}/>
        <p className="kb-registration-note"><MessageCircle size={15}/><InterfaceText text={__kbUi(" Bu ism suhbatlarda profilingizda ko‘rinadi.")}/></p>
        <button type="submit" className="kb-login-primary" disabled={busy || (!accountCreated && (!name.trim() || !oauthGrant))}>{busy ? <LoaderCircle size={18} className="kb-login-spin"/> : <Bird size={18}/>} {busy ? uiT("Tekshirilmoqda…") : inviteCode.trim() ? uiT("Kod bilan muassasaga ulanish") : accountCreated ? uiT("Hisobga kirish") : uiT("Ta’limga kirish")}<ArrowRight size={17}/></button>
      </form>
      <div className="kb-registration-existing"><strong><InterfaceText text={__kbUi("Telegram orqali allaqachon kirganmisiz?")}/></strong><p><InterfaceText text={__kbUi("Kirish sahifasiga qayting va o‘sha hisobni oching. Google hisobingizni “Kirish va xavfsizlik” orqali ulang — mavjud suhbatlaringiz bitta hisobda qoladi.")}/></p><button type="button" className="kb-login-text-button" onClick={onCancel} disabled={busy}><ArrowLeft size={14}/><InterfaceText text={__kbUi(" Kirish sahifasiga qaytish")}/></button></div>
    </section>
  </div></main>;
}
