import { useInterface } from "../interface/InterfacePreferences.jsx";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { registerPhoneBackHandler } from "../pwa/samtmPwa.js";
import { Video, X, Users, LogOut, RefreshCw } from "lucide-react";
import "./kabutarMeetings.css";

export function validateMeeting(value, currentOrigin = "", now = Date.now()) {
  let url;
  try { url = new URL(value?.origin); } catch { throw new Error("Yig‘ilish serveri manzili noto‘g‘ri."); }
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash
    || url.origin !== value.origin || url.origin === currentOrigin || ["meet.jit.si", "8x8.vc"].includes(url.hostname)) {
    throw new Error("Yig‘ilish uchun alohida yopiq HTTPS serveri kerak.");
  }
  if (!/^kb-[a-f0-9]{32}$/.test(value.room || "") || typeof value.jwt !== "string" || value.jwt.length > 8192
    || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value.jwt)) {
    throw new Error("Yig‘ilishga kirish ma’lumoti noto‘g‘ri.");
  }
  if (!Number.isFinite(value.expires_at) || value.expires_at * 1000 <= now || value.expires_at * 1000 > now + 600000) {
    throw new Error("Kirish ruxsati eskirgan yoki qurilma vaqti noto‘g‘ri. Qayta urinib ko‘ring.");
  }
  url.pathname = `/${value.room}`;
  // The token stays solely in the private provider iframe URL. It never enters
  // Kabutar's location/history/localStorage, and no referrer is sent.
  url.searchParams.set("jwt", value.jwt);
  url.hash = "config.startWithAudioMuted=true&config.startWithVideoMuted=true&config.prejoinConfig.enabled=true&config.disableDeepLinking=true&config.p2p.enabled=false";
  return { src: url.toString(), name: String(value.name || "Guruh yig‘ilishi").slice(0, 180), moderator: value.moderator === true };
}

export default function KabutarMeetingDialog({ apiBase, token, groupId, onClose }) {
  const { t } = useInterface();
  const [phase, setPhase] = useState("ready");
  const [meeting, setMeeting] = useState(null);
  const [message, setMessage] = useState("");
  const session = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const s = { alive: true, busy: false, controller: null, timer: null, loadTimer: null, failures: 0, moderator: false };
    session.current = s; setMeeting(null); setMessage(""); setPhase("ready");
    const request = async (suffix, method) => {
      const controller = new AbortController(); s.controller = controller;
      const timer = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(`${String(apiBase || "").replace(/\/$/, "")}/api/kabutar/meetings/group/${encodeURIComponent(groupId)}${suffix}`, {
          method, signal: controller.signal, cache: "no-store", headers: { Authorization: `Bearer ${token}` },
        });
        let value; try { value = await response.json(); } catch { value = {}; }
        if (!response.ok) {
          const error = new Error(typeof value.detail === "string" ? value.detail : "Yig‘ilish xizmati javob bermadi.");
          error.status = response.status; throw error;
        }
        return value;
      } finally { clearTimeout(timer); if (s.controller === controller) s.controller = null; }
    };
    const stopFrame = (reason) => {
      clearTimeout(s.timer); clearTimeout(s.loadTimer); s.controller?.abort();
      if (s.alive) { setMeeting(null); setPhase("error"); setMessage(reason); }
    };
    const checkAccess = async () => {
      if (!s.alive) return;
      try {
        const access = await request("/access", "GET");
        if (!s.alive) return;
        if ((access.moderator === true) !== s.moderator) return stopFrame("Guruhdagi vazifangiz o‘zgardi. Yangi ruxsat bilan qayta kiring.");
        s.failures = 0; setMessage("");
      } catch (error) {
        if (!s.alive) return;
        if ([401, 403, 404].includes(error.status) || ++s.failures >= 2) return stopFrame(error.message || "Yig‘ilishga kirish ruxsati tekshirilmadi.");
        setMessage("Aloqa va guruhga kirish ruxsati qayta tekshirilmoqda…");
      }
      if (s.alive) s.timer = setTimeout(checkAccess, 30000);
    };
    s.join = async () => {
      if (s.busy || !s.alive) return;
      if (!Number.isSafeInteger(Number(groupId)) || Number(groupId) <= 0) return stopFrame("Guruh tanlanmagan.");
      s.busy = true; setPhase("loading"); setMessage("");
      try {
        const value = await request("", "POST");
        if (!s.alive) return;
        const data = validateMeeting(value, window.location.origin);
        s.moderator = data.moderator; s.failures = 0;
        setMeeting(data); setPhase("frame");
        s.loadTimer = setTimeout(() => stopFrame("Yig‘ilish oynasi ochilmadi. Server yoki internet aloqasini tekshirib, qayta urinib ko‘ring."), 25000);
        s.timer = setTimeout(checkAccess, 30000);
      } catch (error) {
        if (s.alive) stopFrame(error.name === "AbortError" ? "Server vaqtida javob bermadi. Qayta urinib ko‘ring." : error.message);
      } finally { s.busy = false; }
    };
    s.loaded = () => { clearTimeout(s.loadTimer); };
    s.leave = () => {
      s.alive = false; clearTimeout(s.timer); clearTimeout(s.loadTimer); s.controller?.abort();
      setMeeting(null); closeRef.current?.();
    };
    const onKey = (event) => { if (event.key === "Escape") s.leave(); };
    const onHide = () => s.leave();
    const removeBack = registerPhoneBackHandler("kabutar-meeting-dialog", () => { s.leave(); return true; }, 680);
    window.addEventListener("keydown", onKey); window.addEventListener("pagehide", onHide);
    return () => {
      s.alive = false; clearTimeout(s.timer); clearTimeout(s.loadTimer); s.controller?.abort();
      window.removeEventListener("keydown", onKey); window.removeEventListener("pagehide", onHide); removeBack();
      if (session.current === s) session.current = null;
      // Removing the cross-origin frame destroys its browsing context and media.
    };
  }, [apiBase, token, groupId]);

  return createPortal(<div className="kb-meeting-overlay">
    <section className={`kb-meeting-dialog ${meeting ? "kb-meeting-open" : ""}`} role="dialog" aria-modal="true" aria-label={t("Guruh yig‘ilishi")}>
      <header><div><strong>{meeting?.name || t("Guruh yig‘ilishi")}</strong>{meeting && <span>{meeting.moderator ? t("Siz — yig‘ilish boshqaruvchisi") : t("Siz — ishtirokchi")}</span>}</div><button type="button" autoFocus aria-label={t("Yig‘ilishdan chiqish")} onClick={() => session.current?.leave()}><X size={22} /></button></header>
      {meeting ? <>
        {message && <p className="kb-meeting-notice" role="status">{message}</p>}
        <iframe key={meeting.src} src={meeting.src} title={meeting.name} className="kb-meeting-frame"
          allow="camera; microphone; display-capture; autoplay; fullscreen; speaker-selection"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
          referrerPolicy="no-referrer" allowFullScreen onLoad={() => session.current?.loaded()} />
        <footer><span>{t("Mikrofon va kamerani yig‘ilish ichida yoqing.")}</span><button type="button" onClick={() => session.current?.leave()}><LogOut size={18} />{t("Chiqish")}</button></footer>
      </> : <div className="kb-meeting-intro">
        <div className="kb-meeting-icon"><Users size={32} /></div><h2>{t("Sinf va hamkasblar bilan bir joyda")}</h2>
        <p>{t("Guruhingiz a’zolari bilan video orqali suhbatlashing va ekraningizni ulashing. Kirishda mikrofon va kamera o‘chiq bo‘ladi.")}</p>
        {message && <div className="kb-meeting-error" role="alert">{message}</div>}
        <button type="button" className="kb-meeting-join" disabled={phase === "loading"} onClick={() => session.current?.join()}>{phase === "error" ? <RefreshCw size={20} /> : <Video size={20} />}{phase === "loading" ? t("Tekshirilmoqda…") : phase === "error" ? t("Qayta urinish") : t("Yig‘ilishga kirish")}</button>
      </div>}
    </section>
  </div>, document.body);
}
