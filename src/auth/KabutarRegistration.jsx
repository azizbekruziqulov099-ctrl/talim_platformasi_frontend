import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bird, CheckCircle2, LoaderCircle, MessageCircle } from "lucide-react";
import { authRequest } from "./authClient.js";
import "./kabutar-login.css";

export default function KabutarRegistration({ apiBase = "", email = "", ism = "", oauthGrant = "", onAuthenticated, onCancel }) {
  const [name, setName] = useState(ism || "");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const mounted = useRef(false);
  const request = useRef(null);
  const submitted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; request.current?.abort(); };
  }, []);

  async function register(event) {
    event.preventDefault();
    if (busy || submitted.current) return;
    const clean = name.trim().replace(/\s+/g, " ");
    const invite = inviteCode.trim().toUpperCase();
    setError("");
    if (!invite && (clean.length < 2 || clean.length > 80)) { setError("Ismingizni 2–80 belgi bilan kiriting."); return; }
    if (invite && !/^[A-Z0-9]{12,128}$/.test(invite)) { setError("Muassasa taklif kodini to‘liq kiriting: kamida 12 ta lotin harfi yoki raqam."); return; }
    if (!oauthGrant || !email) { setError("Google tasdig‘i topilmadi. Kirish sahifasiga qaytib, Google orqali qayta kiring."); return; }
    setBusy(true);
    const controller = new AbortController();
    request.current = controller;
    try {
      const data = await authRequest(apiBase, invite ? "/auth/invite/claim" : "/auth/royxat", {
        body: invite ? { email, oauth_grant: oauthGrant, kod: invite } : { email, ism: clean, rol: "kabutar", oauth_grant: oauthGrant },
        signal: controller.signal,
      });
      if (!mounted.current || controller.signal.aborted) return;
      if (typeof data?.token !== "string" || !data.token) throw new Error("Hisob yaratilgani tasdiqlanmadi. Qayta urinib ko‘ring.");
      submitted.current = true;
      onAuthenticated?.(data.token);
    } catch (err) {
      if (mounted.current && !controller.signal.aborted) setError(err.message);
    } finally {
      if (mounted.current && !controller.signal.aborted) setBusy(false);
    }
  }

  return <main className="kb-login-page kb-registration-page"><div className="kb-registration-shell">
    <div className="kb-login-brand"><span className="kb-login-brand-mark"><Bird size={29}/></span><span>Kabutar<span className="kb-login-brand-caption">YAQINROQ BO‘LING. O‘SIB BORING.</span></span></div>
    <section className="kb-login-card kb-registration-card" aria-labelledby="kb-registration-heading">
      <span className="kb-registration-verified"><CheckCircle2 size={16}/> Google hisobingiz tasdiqlandi</span>
      <h1 id="kb-registration-heading">Sizni qanday chaqiraylik?</h1>
      <p className="kb-login-method-copy">Bitta Kabutar profili bilan suhbatlarni boshlang. Ta’lim yo‘nalishi va rolingizni keyin tanlaysiz.</p>
      <div className="kb-registration-email">{email}</div>
      {error && <div className="kb-login-error" role="alert">{error}</div>}
      <form className="kb-login-password-form" onSubmit={register}>
        <details className="kb-registration-invite" onToggle={(event) => { if (!event.currentTarget.open) setInviteCode(""); }}>
          <summary>Muassasa taklif kodi bormi?</summary>
          <label htmlFor="kb-registration-invite">Taklif kodi<input id="kb-registration-invite" type="text" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={128} disabled={busy} placeholder="Muassasa bergan kod"/></label>
          <p>Faqat muassasa bergan rasmiy taklif kodi uchun. Taklif tasdiqlansa, muassasa tayyorlagan profilingiz ochiladi.</p>
        </details>
        <label htmlFor="kb-registration-name">Ism va familiyangiz</label>
        <input id="kb-registration-name" name="name" autoComplete="name" type="text" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required={!inviteCode.trim()} disabled={busy || Boolean(inviteCode.trim())} placeholder="Ism va familiyangiz"/>
        <p className="kb-registration-note"><MessageCircle size={15}/> Bu ism suhbatlarda profilingizda ko‘rinadi.</p>
        <button type="submit" className="kb-login-primary" disabled={busy || (!name.trim() && !inviteCode.trim()) || !oauthGrant}>{busy ? <LoaderCircle size={18} className="kb-login-spin"/> : <Bird size={18}/>} {busy ? "Hisob tayyorlanmoqda…" : inviteCode.trim() ? "Taklif orqali kirish" : "Kabutarni boshlash"}<ArrowRight size={17}/></button>
      </form>
      <div className="kb-registration-existing"><strong>Telegram orqali allaqachon kirganmisiz?</strong><p>Kirish sahifasiga qayting va o‘sha hisobni oching. Google hisobingizni “Kirish va xavfsizlik” orqali ulang — mavjud suhbatlaringiz bitta hisobda qoladi.</p><button type="button" className="kb-login-text-button" onClick={onCancel} disabled={busy}><ArrowLeft size={14}/> Kirish sahifasiga qaytish</button></div>
    </section>
  </div></main>;
}
