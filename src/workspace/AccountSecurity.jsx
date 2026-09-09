import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AtSign, CheckCircle2, ChevronRight, Eye, EyeOff, KeyRound, LoaderCircle, LogOut, Send, ShieldCheck, X } from "lucide-react";
import { TelegramSignIn } from "../auth/KabutarLogin.jsx";
import { authEndpoint } from "../auth/authClient.js";
import { workspaceRequest } from "./kabutarWorkspaceClient.js";
import "./workspace.css";

export default function AccountSecurity({ apiBase, token, onToken, onClose, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [discoveryError, setDiscoveryError] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneDiscoverable, setPhoneDiscoverable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [busy, setBusy] = useState("");
  const panel = useRef(null);
  const closeButton = useRef(null);
  const mounted = useRef(false);
  const request = useRef(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);

  useEffect(() => {
    mounted.current = true;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const keydown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close.current?.(); return; }
      if (event.key !== "Tab") return;
      const elements = [...(panel.current?.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]') || [])].filter((element) => element.getClientRects().length);
      const first = elements[0], last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); panel.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !panel.current?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown, true);
    return () => {
      mounted.current = false;
      request.current?.abort();
      document.removeEventListener("keydown", keydown, true);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus?.();
    };
  }, []);

  useEffect(() => {
    request.current?.abort();
    setBusy("");
    setCurrentPassword("");
    setPassword("");
    setConfirmation("");
    setResetPassword(false);
    setTelegramOpen(false);
    setProfile(null);
    setDiscovery(null);
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setDiscoveryError("");
    Promise.allSettled([
      workspaceRequest(apiBase, "/auth/profile/status", token, { signal: controller.signal }),
      workspaceRequest(apiBase, "/auth/profile/discovery", token, { signal: controller.signal }),
    ])
      .then(([accountResult, discoveryResult]) => {
        if (controller.signal.aborted) return;
        if (accountResult.status === "fulfilled") setProfile(accountResult.value);
        else setError(accountResult.reason.message);
        if (discoveryResult.status === "fulfilled") {
          const data = discoveryResult.value;
          setDiscovery(data);
          setNickname(data.nickname || "");
          setPhoneDiscoverable(data.phone_discoverable === true);
        } else setDiscoveryError(discoveryResult.reason.message);
      })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [apiBase, token, retry]);

  async function changePassword(event) {
    event.preventDefault();
    if (busy) return;
    setNotice("");
    setError("");
    if (!profile) { setError("Avval hisob ma’lumotlari yuklanishini kuting."); return; }
    if (password.length < 10 || password.length > 128) { setError("Yangi parol 10–128 belgidan iborat bo‘lsin."); return; }
    if (password !== confirmation) { setError("Yangi parol va tasdiqlash bir xil emas."); return; }
    if (profile.has_password && !resetPassword && !currentPassword) { setError("Amaldagi parolingizni kiriting."); return; }
    const controller = new AbortController();
    request.current?.abort();
    request.current = controller;
    setBusy("password");
    try {
      const data = await workspaceRequest(apiBase, "/auth/password/set", token, {
        method: "POST", signal: controller.signal,
        body: { password, reset: resetPassword, ...(profile.has_password && !resetPassword ? { current_password: currentPassword } : {}) },
      });
      if (!mounted.current || controller.signal.aborted) return;
      if (!data.ok) throw new Error("Parol saqlangani tasdiqlanmadi. Qayta urinib ko‘ring.");
      setCurrentPassword(""); setPassword(""); setConfirmation(""); setShowPassword(false);
      setResetPassword(false);
      setNotice("Parol saqlandi. Boshqa qurilmalardagi kirish seanslari tugatildi.");
      setProfile((old) => ({ ...old, has_password: true }));
      if (data.token) onToken?.(data.token);
    } catch (err) {
      if (mounted.current && !controller.signal.aborted) setError(err.message);
    } finally {
      if (mounted.current && !controller.signal.aborted) setBusy("");
    }
  }

  async function saveDiscovery(event) {
    event.preventDefault();
    if (busy || !discovery) return;
    const clean = nickname.trim().replace(/^@/, "");
    setNotice(""); setError(""); setDiscoveryError("");
    if (clean && !/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(clean)) {
      setDiscoveryError("Nik 5–32 belgidan iborat bo‘lsin: avval lotin harfi, keyin harf, raqam yoki pastki chiziq (_).");
      return;
    }
    if (phoneDiscoverable && !discovery.phone_verified) {
      setDiscoveryError("Telefon bo‘yicha topilish uchun avval o‘z raqamingizni Telegram orqali tasdiqlang.");
      return;
    }
    const controller = new AbortController();
    request.current?.abort(); request.current = controller;
    setBusy("discovery");
    try {
      const data = await workspaceRequest(apiBase, "/auth/profile/discovery", token, {
        method: "POST", signal: controller.signal,
        body: { nickname: clean || null, phone_discoverable: phoneDiscoverable },
      });
      if (!mounted.current || controller.signal.aborted) return;
      setDiscovery(data); setNickname(data.nickname || ""); setPhoneDiscoverable(data.phone_discoverable === true);
      setNotice("Qidiruv sozlamalari saqlandi. KB raqamingiz o‘zgarmadi.");
    } catch (err) {
      if (mounted.current && !controller.signal.aborted) setDiscoveryError(err.message);
    } finally {
      if (mounted.current && !controller.signal.aborted) setBusy("");
    }
  }

  function linkGoogle() {
    setError("");
    try { window.sessionStorage.setItem("kabutar_google_link_intent", JSON.stringify({ session: token, createdAt: Date.now() })); }
    catch { setError("Brauzer ulash so‘rovini saqlay olmadi. Brauzerda sayt ma’lumotlarini saqlashga ruxsat bering va qayta urinib ko‘ring."); return; }
    window.location.assign(authEndpoint(apiBase, "/auth/google/login?intent=link"));
  }

  async function logout(allDevices) {
    if (busy) return;
    setBusy(allDevices ? "logout-all" : "logout"); setError(""); setNotice("");
    try { await onLogout?.(allDevices); }
    catch (err) { if (mounted.current) setError(err?.message || "Chiqish tasdiqlanmadi. Qayta urinib ko‘ring."); }
    finally { if (mounted.current) setBusy(""); }
  }

  const telegramLinked = profile?.identities?.telegram === true;
  const googleLinked = profile?.identities?.google === true;

  return createPortal(<div className="kb-security-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
    <div className="kb-security-panel" role="dialog" aria-modal="true" aria-labelledby="kb-security-title" aria-describedby="kb-security-description" tabIndex={-1} ref={panel}>
      <header><div><span className="kb-security-eyebrow"><ShieldCheck size={15}/> SIZNING HISOBINGIZ</span><h2 id="kb-security-title">Kirish va xavfsizlik</h2></div><button className="kb-security-close" type="button" onClick={onClose} aria-label="Xavfsizlik oynasini yopish" ref={closeButton}><X size={20}/></button></header>
      <p id="kb-security-description" className="kb-work-note">Kirish usullarini bitta hisobingizga ulang. KB raqamingiz va suhbatlaringiz shu hisobda qoladi.</p>
      {error && <div className="kb-work-error" role="alert">{error}</div>}
      {notice && <div className="kb-security-notice" role="status"><CheckCircle2 size={17}/>{notice}</div>}
      {loading ? <p className="kb-security-loading" role="status"><LoaderCircle size={18} className="kb-login-spin"/> Hisob ma’lumotlari yuklanmoqda…</p> : !profile ? <button type="button" onClick={() => setRetry((value) => value + 1)}>Qayta yuklash</button> : <>
        <section aria-label="Ulangan kirish usullari">
          <h3>Ulangan hisoblar</h3>
          <div className="kb-security-identities">
            <div><span className="kb-security-provider-icon"><Send size={19}/></span><div><strong>Telegram</strong><small>{telegramLinked ? profile.phone_masked || "Telefon tasdiqlangan" : "Telefon raqamingiz bilan tasdiqlash"}</small></div>{telegramLinked ? <span className="kb-security-linked"><CheckCircle2 size={14}/> Ulangan</span> : <button type="button" onClick={() => setTelegramOpen(true)} disabled={Boolean(busy)}>Ulash <ChevronRight size={14}/></button>}</div>
            <div><span className="kb-security-provider-icon kb-security-google-mark">G</span><div><strong>Google</strong><small>{googleLinked ? "Google hisobingiz ulangan" : "Google hisobingiz orqali qayta kirish"}</small></div>{googleLinked ? <span className="kb-security-linked"><CheckCircle2 size={14}/> Ulangan</span> : <button type="button" onClick={linkGoogle} disabled={Boolean(busy)}>Ulash <ChevronRight size={14}/></button>}</div>
          </div>
          {telegramOpen && <TelegramSignIn apiBase={apiBase} token={token} mode="link" onCancel={() => setTelegramOpen(false)} onAuthenticated={(data) => {
            setTelegramOpen(false);
            setNotice("Telegram shu hisobingizga ulandi.");
            if (data?.token) onToken?.(data.token);
            setRetry((value) => value + 1);
          }}/>} 
          <p className="kb-work-note">Google yoki Telegram boshqa Kabutar hisobiga ulangan bo‘lsa, hisoblar avtomatik birlashtirilmaydi.</p>
        </section>
        <section aria-labelledby="kb-discovery-heading">
          <h3 id="kb-discovery-heading"><AtSign size={18}/> Sizni qanday topishsin?</h3>
          <p className="kb-work-note">KB raqamingiz doimiy qoladi. Nik qo‘shsangiz, odamlar sizni @nik orqali ham topadi.</p>
          {discoveryError && <div className="kb-work-error" role="alert">{discoveryError}</div>}
          {discovery ? <form onSubmit={saveDiscovery}>
            <label htmlFor="kb-public-nickname">Kabutar niki <span className="kb-security-optional">ixtiyoriy</span><div className="kb-security-nickname-field"><span aria-hidden="true">@</span><input id="kb-public-nickname" type="text" value={nickname} onChange={(event) => setNickname(event.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={33} placeholder="azizustoz" disabled={Boolean(busy)} aria-describedby="kb-nickname-help"/></div></label>
            <p id="kb-nickname-help" className="kb-work-note">5–32 belgi: lotin harflari, raqamlar va _. Nik harf bilan boshlanadi. Profilingizdagi haqiqiy ism saqlanadi.</p>
            <label className="kb-security-phone-toggle" htmlFor="kb-phone-discovery"><input id="kb-phone-discovery" type="checkbox" checked={phoneDiscoverable} onChange={(event) => setPhoneDiscoverable(event.target.checked)} disabled={Boolean(busy) || !discovery.phone_verified}/><span><strong>Telefon raqamim orqali topish mumkin</strong><small>{discovery.phone_verified ? `${discovery.phone_masked || "Tasdiqlangan raqam"} ni biladigan odamlar meni Kabutarda topishi mumkin.` : "Buning uchun telefoningizni yuqoridagi Telegram orqali tasdiqlang."}</small></span></label>
            <button type="submit" className="kb-work-primary" disabled={Boolean(busy)}>{busy === "discovery" ? "Saqlanmoqda…" : "Qidiruv sozlamalarini saqlash"}</button>
          </form> : <button type="button" onClick={() => setRetry((value) => value + 1)}>Qidiruv sozlamalarini qayta yuklash</button>}
        </section>
        <section aria-labelledby="kb-password-heading">
          <h3 id="kb-password-heading"><KeyRound size={17}/> {resetPassword ? "Unutilgan parolni tiklash" : profile.has_password ? "Parolni o‘zgartirish" : "Kirish uchun parol qo‘yish"}</h3>
          {profile.has_password && <button type="button" className="kb-security-reset-choice" onClick={() => { setResetPassword((value) => !value); setCurrentPassword(""); setError(""); setNotice(""); }} disabled={Boolean(busy)}>{resetPassword ? "Amaldagi parolimni bilaman" : "Parolimni unutdim"}</button>}
          {resetPassword && <p className="kb-security-recovery-info">Tiklash uchun oxirgi 10 daqiqa ichida shu hisobga ulangan Telegram yoki Google orqali qayta kirgan bo‘lishingiz kerak. Server tasdiqlasa, eski parolsiz yangisini qo‘yasiz. Faqat parol bilan kirilgan seansda bu amal bajarilmaydi.</p>}
          <form onSubmit={changePassword}>
            {profile.has_password && !resetPassword && <label htmlFor="kb-current-password">Amaldagi parol<input id="kb-current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} maxLength={128} required disabled={Boolean(busy)}/></label>}
            <label htmlFor="kb-new-password">Yangi parol<div className="kb-security-password-field"><input id="kb-new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} maxLength={128} required aria-describedby="kb-password-help" disabled={Boolean(busy)}/><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Yangi parolni yashirish" : "Yangi parolni ko‘rsatish"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
            <label htmlFor="kb-confirm-password">Yangi parolni takrorlang<input id="kb-confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={10} maxLength={128} required disabled={Boolean(busy)}/></label>
            <p id="kb-password-help" className="kb-work-note">Kamida 10 belgi. Boshqa saytlarda ishlatmaydigan parol tanlang. Parol saqlanganda boshqa qurilmalardagi seanslar tugaydi.</p>
            <button className="kb-work-primary" type="submit" disabled={Boolean(busy) || !password || !confirmation}>{busy === "password" ? "Saqlanmoqda…" : resetPassword ? "Parolni tiklash" : profile.has_password ? "Parolni yangilash" : "Parolni saqlash"}</button>
          </form>
          {!profile.has_password && <p className="kb-work-note">Parolni ilk marta qo‘yish uchun oxirgi 10 daqiqa ichida Telegram yoki Google orqali kirgan bo‘lishingiz kerak.</p>}
        </section>
      </>}
      <section aria-labelledby="kb-sessions-heading"><h3 id="kb-sessions-heading">Qurilmalardagi kirish</h3><p>“Chiqish” bosilganda qayta kirish uchun tasdiqlash yoki parol kerak bo‘ladi.</p><div className="kb-security-logout-actions"><button type="button" onClick={() => logout(false)} disabled={Boolean(busy)}><LogOut size={16}/>{busy === "logout" ? "Chiqilmoqda…" : "Shu qurilmadan chiqish"}</button><button type="button" className="kb-danger" onClick={() => logout(true)} disabled={Boolean(busy)}>{busy === "logout-all" ? "Seanslar tugatilmoqda…" : "Barcha qurilmalardan chiqish"}</button></div></section>
    </div>
  </div>, document.body);
}
