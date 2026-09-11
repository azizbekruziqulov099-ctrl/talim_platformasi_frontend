import { useInterface } from "../interface/InterfacePreferences.jsx";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, X } from "lucide-react";
import { registerPhoneBackHandler } from "../pwa/samtmPwa.js";

let safetySequence = 0;

export default function KabutarSafety({ apiBase, token, view, onClose, onBlocked }) {
  const { t } = useInterface();
  const [mode, setMode] = useState(view.mode);
  const [reason, setReason] = useState("abuse");
  const [detail, setDetail] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [shown, setShown] = useState(60);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const request = useRef(null), box = useRef(null), alive = useRef(true);
  const id = useRef(null); if (id.current === null) id.current = ++safetySequence;
  useEffect(() => {
    alive.current = true;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    box.current?.focus();
    const remove = registerPhoneBackHandler(`kabutar-safety-${id.current}`, () => { onClose(); return true; }, 650);
    return () => { alive.current = false; request.current?.abort(); remove(); document.body.style.overflow = overflow; previous?.focus?.(); };
  }, []);
  const api = async (path, body) => {
    if (request.current) return null;
    const controller = new AbortController(); request.current = controller;
    const timer = setTimeout(() => controller.abort(), 12000);
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${String(apiBase || "").replace(/\/$/, "")}/api/kabutar/safety/${path}`, {
        method: body ? "POST" : "GET", signal: controller.signal, cache: "no-store",
        headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Amal bajarilmadi. Qayta urinib ko‘ring.");
      if (body && data.ok !== true) throw new Error("Amal bajarilgani tasdiqlanmadi. Qayta tekshiring.");
      return alive.current && !controller.signal.aborted ? data : null;
    } catch (failure) {
      if (alive.current) setError(controller.signal.aborted ? "Ulanish cho‘zildi. Natijani tekshirib qayta urinib ko‘ring." : failure.message);
      return null;
    } finally { clearTimeout(timer); if (request.current === controller) request.current = null; if (alive.current) setBusy(false); }
  };
  useEffect(() => { if (mode === "blocks") api("blocks").then(data => { if (data) setBlocks(data.blocks || []); }); }, [mode]);
  const submit = async () => {
    if (mode === "block") {
      const data = await api("block", { user_id: Number(view.person.user_id) });
      if (data) { onBlocked?.(view.person.user_id); onClose(); }
    } else {
      const payload = { reason, detail: detail.trim() };
      if (view.message?.id) payload.message_id = Number(view.message.id);
      else if (view.person?.user_id) payload.user_id = Number(view.person.user_id);
      const data = await api("report", payload);
      if (data) setNotice("Shikoyat yuborildi. Mas’ul xodim ko‘rib chiqadi.");
    }
  };
  const unblock = async userId => {
    const data = await api("unblock", { user_id: Number(userId) });
    if (data) { setBlocks(old => old.filter(row => Number(row.user_id) !== Number(userId))); setNotice("Blok olib tashlandi. Muassasa ruxsatlari saqlanadi."); onBlocked?.(null); }
  };
  const keyDown = event => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
    if (event.key !== "Tab") return;
    const nodes = [...(box.current?.querySelectorAll('button:not(:disabled),select:not(:disabled),textarea:not(:disabled)') || [])];
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === box.current)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === box.current)) { event.preventDefault(); first.focus(); }
  };
  return createPortal(<div className="kb-safety-overlay" onKeyDown={keyDown}>
    <section ref={box} tabIndex={-1} className="kb-safety-sheet" role="dialog" aria-modal="true" aria-labelledby={`kb-safety-title-${id.current}`} aria-busy={busy}>
      <header><ShieldCheck size={22}/><h2 id={`kb-safety-title-${id.current}`}>{mode === "blocks" ? t("Bloklangan aloqalar") : mode === "block" ? t("Aloqani bloklash") : t("Shikoyat yuborish")}</h2><button type="button" onClick={onClose} aria-label={t("Yopish")}><X size={21}/></button></header>
      {mode === "blocks" ? <div className="kb-safety-blocks">{busy && <p role="status">{t("Yuklanmoqda…")}</p>}{!busy && !error && !blocks.length && <p>{t("Bloklangan aloqa yo‘q.")}</p>}{blocks.slice(0, shown).map(person => <div key={person.user_id}><strong>{person.full_name || t("Foydalanuvchi")}</strong><button type="button" disabled={busy} onClick={() => unblock(person.user_id)}>{t("Blokdan chiqarish")}</button></div>)}{blocks.length > shown && <button type="button" onClick={() => setShown(count => count + 60)}>{t("Yana ko‘rsatish")}</button>}{error && <button type="button" disabled={busy} onClick={() => api("blocks").then(data => { if (data) setBlocks(data.blocks || []); })}>{t("Qayta yuklash")}</button>}</div>
      : <>
        <p><strong>{view.person?.full_name || t("Tanlangan xabar")}</strong></p>
        {mode === "block" ? <p>{t("Bu odam bilan shaxsiy xabarlar va qo‘ng‘iroqlar to‘xtatiladi. Keyin “Bloklangan aloqalar”dan blokni olib tashlashingiz mumkin.")}</p> : <>
          {view.message?.matn && <blockquote>{String(view.message.matn).slice(0, 220)}</blockquote>}
          <label>{t("Sababi")}<select disabled={busy} value={reason} onChange={event => setReason(event.target.value)}><option value="abuse">{t("Haqorat yoki bezovta qilish")}</option><option value="spam">{t("Keraksiz reklama / spam")}</option><option value="unsafe">{t("Xavfli yoki nomaqbul kontent")}</option><option value="other">{t("Boshqa sabab")}</option></select></label>
          <label>{t("Qo‘shimcha izoh")}<textarea disabled={busy} maxLength={1000} value={detail} onChange={event => setDetail(event.target.value)} placeholder={t("Vaziyatni qisqacha tushuntiring…")}/></label>
        </>}
        {!notice && <footer>{mode === "report" && view.person?.user_id && !view.person?.guruh_id && <button type="button" disabled={busy} onClick={() => setMode("block")}>{t("Aloqani bloklash")}</button>}<button type="button" className="kb-safety-submit" disabled={busy} onClick={submit}>{busy ? t("Bajarilmoqda…") : mode === "block" ? t("Bloklashni tasdiqlash") : t("Shikoyatni yuborish")}</button></footer>}
      </>}
      {error && <p role="alert" className="kb-safety-error">{error}</p>}
      {notice && <p role="status" className="kb-safety-notice">{notice}</p>}
    </section>
  </div>, document.body);
}
