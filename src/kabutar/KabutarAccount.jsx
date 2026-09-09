// KABUTAR_ACCOUNT_REV36: profil, sozlamalar va kontaktlar.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check, Copy, MessageCircle, Search, Settings, Share2, Star, User, Users, X } from "lucide-react";
import { registerPhoneBackHandler } from "../pwa/samtmPwa.js";
import { collectContacts, contactRecord, copyKabutarText, DEFAULT_KABUTAR_SETTINGS, filterContacts, kabutarRequest, kabutarStorageKey, normalizeKabutarId, normalizeSettings, readKabutarLocal } from "./kabutarAccountRules.js";
import "./kabutar-account.css";

const initials = value => String(value || "").trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "K";
const roleName = value => ({ oqituvchi: "O‘qituvchi", oquvchi: "O‘quvchi", "ota-ona": "Ota-ona", ota_ona: "Ota-ona", admin: "Administrator" }[value] || value || "Foydalanuvchi");
const localStore = () => { try { return window.localStorage; } catch { return null; } };
let drawerSequence = 0;

export function useKabutarPreferences(ownerId, apiBase) {
  const key = kabutarStorageKey(apiBase, ownerId);
  const [state, setState] = useState(() => ({ key, ...readKabutarLocal(localStore(), key) }));
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    setState({ key, ...readKabutarLocal(localStore(), key) }); setStorageError("");
    const changed = event => { if (event.key === key || event.key === null) setState({ key, ...readKabutarLocal(localStore(), key) }); };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [key]);
  const current = state.key === key ? state : { settings: { ...DEFAULT_KABUTAR_SETTINGS }, saved: [] };
  const save = next => {
    if (!key) { setStorageError("Profil yuklangach qayta urinib ko‘ring."); return; }
    setState({ key, ...next });
    try {
      const storage = localStore();
      if (!storage) throw new Error("storage unavailable");
      storage.setItem(key, JSON.stringify(next)); setStorageError("");
    } catch { setStorageError("Brauzer saqlashga ruxsat bermadi. O‘zgarish hozirgi seansda ishlaydi."); }
  };
  const toggleSaved = person => {
    const record = contactRecord(person);
    if (!record || record.user_id === Number(ownerId)) return;
    const exists = current.saved.some(item => item.user_id === record.user_id);
    if (!exists && current.saved.length >= 500) { setStorageError("500 ta tanlangan kontakt saqlangan. Avval bittasini tanlanganlardan oling."); return; }
    save({ ...current, saved: exists ? current.saved.filter(item => item.user_id !== record.user_id) : [...current.saved, record] });
  };
  return { settings: current.settings, saved: current.saved, storageError, toggleSaved,
    updateSettings: patch => save({ ...current, settings: normalizeSettings({ ...current.settings, ...patch }) }),
  };
}

function Avatar({ person, apiBase, large = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [person?.user_id, person?.rasm_bormi]);
  return <span className={`kb-avatar${large ? " kb-avatar--large" : ""}`} aria-hidden="true">
    {person?.rasm_bormi && person?.user_id && !failed
      ? <img src={`${String(apiBase || "").replace(/\/$/, "")}/api/profil_rasm/${encodeURIComponent(person.user_id)}`} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      : initials(person?.full_name)}
  </span>;
}

export function KabutarAccountButton({ me, apiBase, onProfile, onSettings }) {
  return <div className="kb-account-actions">
    <button type="button" className="kb-account-trigger" onClick={onProfile} aria-label="Mening Kabutar profilim va ID raqamim">
      <Avatar person={me} apiBase={apiBase}/><span><strong>{me?.full_name || "Mening profilim"}</strong><small>{me?.kabutar_id || "Profil va Kabutar ID"}</small></span>
    </button>
    <button type="button" className="kb-icon-button" onClick={onSettings} aria-label="Kabutar sozlamalari va kontaktlar" title="Kabutar sozlamalari"><Settings size={21}/></button>
  </div>;
}

export default function KabutarAccount({ token, apiBase, directory, initialPage = "profile", person = null, preferences, onClose, onOpenContact, onMeUpdated }) {
  const [page, setPage] = useState(initialPage);
  const [selected, setSelected] = useState(person);
  const [card, setCard] = useState(person || directory?.men || null);
  const [ownDetails, setOwnDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [reload, setReload] = useState(0);
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [limit, setLimit] = useState(50);
  const [lookupId, setLookupId] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const lookupController = useRef(null);
  const saveController = useRef(null);
  const dialogRef = useRef(null);
  const callbacks = useRef({ onClose, onMeUpdated });
  callbacks.current = { onClose, onMeUpdated };
  const drawerId = useRef(null);
  if (drawerId.current === null) drawerId.current = `kabutar-account-${++drawerSequence}`;
  const me = directory?.men;
  const isGroup = Boolean(selected?.guruh_id);
  const isSelf = !isGroup && (!selected || String(selected.user_id) === String(me?.user_id));
  const contacts = useMemo(() => collectContacts(directory, preferences.saved), [directory, preferences.saved]);
  const filtered = useMemo(() => filterContacts(contacts, query, savedOnly, preferences.saved), [contacts, query, savedOnly, preferences.saved]);
  useEffect(() => setLimit(50), [query, savedOnly]);

  useEffect(() => {
    const lastFocus = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const unregister = registerPhoneBackHandler(drawerId.current, () => { callbacks.current.onClose(); return true; }, 150);
    return () => {
      lookupController.current?.abort(); saveController.current?.abort(); unregister();
      document.body.style.overflow = oldOverflow;
      if (lastFocus?.isConnected) lastFocus.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (page !== "profile") return undefined;
    const controller = new AbortController();
    let active = true;
    setCard(selected || me || null); setOwnDetails(null); setNotice(""); setProfileError(""); setEditingName(false);
    if (isGroup) { setLoading(false); return undefined; }
    setLoading(true);
    const path = isSelf ? "/api/kabutar/men" : selected?.kabutar_id
      ? `/api/kabutar/izla?kabutar_id=${encodeURIComponent(selected.kabutar_id)}`
      : `/api/kabutar/shaxs?user_id=${encodeURIComponent(selected?.user_id)}`;
    kabutarRequest(apiBase, path, token, { signal: controller.signal }).then(data => {
      if (!active) return;
      setCard(data); if (isSelf) callbacks.current.onMeUpdated?.(data);
    }).catch(error => { if (active && !controller.signal.aborted) setProfileError(error.message); }).finally(() => { if (active) setLoading(false); });
    if (isSelf) kabutarRequest(apiBase, "/auth/men", token, { signal: controller.signal }).then(data => {
      if (active) setOwnDetails(data);
    }).catch(() => { /* Kabutar card is independently usable. */ });
    return () => { active = false; controller.abort(); };
  }, [apiBase, token, page, selected, isSelf, isGroup, reload]); // Directory polling must not restart an open profile.

  const switchPage = next => {
    lookupController.current?.abort(); setLookupBusy(false); setLookupError(""); setNotice("");
    saveController.current?.abort(); setSaving(false);
    if (next === "profile") setCard(me || null);
    setSelected(null); setPage(next);
  };
  const openProfile = next => { setCard(next); setOwnDetails(null); setProfileError(""); setSelected(next); setPage("profile"); setNotice(""); };
  const lookup = async event => {
    event.preventDefault();
    const id = normalizeKabutarId(lookupId);
    if (!id) { setLookupError("Kabutar ID 6–10 xonali: masalan KB-56928957."); return; }
    if (id === me?.kabutar_id) { switchPage("profile"); return; }
    lookupController.current?.abort();
    const controller = new AbortController(); lookupController.current = controller;
    setLookupBusy(true); setLookupError("");
    try {
      const found = await kabutarRequest(apiBase, `/api/kabutar/izla?kabutar_id=${encodeURIComponent(id)}`, token, { signal: controller.signal });
      if (!controller.signal.aborted) openProfile(found);
    } catch (error) { if (!controller.signal.aborted) setLookupError(error.message); }
    finally { if (lookupController.current === controller && !controller.signal.aborted) setLookupBusy(false); }
  };
  const copyId = async () => {
    const copied = await copyKabutarText(card?.kabutar_id);
    setNotice(copied ? "Kabutar ID nusxalandi." : "ID ustiga bosib, raqamni belgilang va Nusxalashni tanlang.");
  };
  const shareId = async () => {
    if (!card?.kabutar_id) return;
    if (navigator.share) {
      try { await navigator.share({ title: "Kabutar kontakti", text: `${card.full_name}\nKabutar ID: ${card.kabutar_id}` }); return; }
      catch (error) { if (error.name === "AbortError") return; }
    }
    await copyId();
  };
  const saveName = async event => {
    event.preventDefault();
    if (saving) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 160) { setNotice("Ism 1–160 ta belgidan iborat bo‘lsin."); return; }
    const controller = new AbortController(); saveController.current = controller;
    setSaving(true); setNotice("");
    try {
      await kabutarRequest(apiBase, "/api/profil", token, { method: "PUT", signal: controller.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, full_name: trimmed }) });
      if (controller.signal.aborted) return;
      const updated = { ...card, full_name: trimmed };
      setCard(updated); setEditingName(false); callbacks.current.onMeUpdated?.(updated); setNotice("Ismingiz saqlandi.");
    } catch (error) { if (!controller.signal.aborted) setNotice(error.message); }
    finally { if (!controller.signal.aborted) setSaving(false); }
  };
  const keyDown = event => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
    if (event.key !== "Tab") return;
    const nodes = [...dialogRef.current.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(node => !node.disabled && node.getClientRects().length);
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (!first) { event.preventDefault(); dialogRef.current.focus(); }
    else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  const saved = preferences.saved.some(item => item.user_id === Number(card?.user_id));
  const roles = Array.isArray(card?.rollar) ? card.rollar : [];
  return createPortal(<div className="kb-account-overlay" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="kb-account-sheet" role="dialog" aria-modal="true" aria-label="Kabutar profil, kontaktlar va sozlamalar" tabIndex={-1} ref={dialogRef} onKeyDown={keyDown}>
      <header className="kb-sheet-header"><div><small>KABUTAR</small><h2>{page === "contacts" ? "Kontaktlar" : page === "settings" ? "Sozlamalar" : isSelf ? "Mening profilim" : isGroup ? "Guruh ma’lumoti" : "Kontakt profili"}</h2></div><button type="button" className="kb-icon-button" onClick={onClose} aria-label="Kabutar oynasiga qaytish"><X size={23}/></button></header>
      <nav className="kb-account-tabs" aria-label="Kabutar menyusi">
        {[["profile", "Profil", User], ["contacts", "Kontaktlar", Users], ["settings", "Sozlamalar", Settings]].map(([key, label, Icon]) => <button key={key} type="button" aria-current={page === key ? "page" : undefined} onClick={() => switchPage(key)}><Icon size={18}/>{label}</button>)}
      </nav>
      <div className="kb-sheet-body">
        {page === "profile" && <>
          {!isSelf && <button type="button" className="kb-text-button" onClick={() => switchPage("contacts")}><ArrowLeft size={16}/>Kontaktlarga qaytish</button>}
          <div className="kb-profile-hero"><Avatar person={card} apiBase={apiBase} large/><h3>{card?.full_name || "Profil yuklanmoqda"}</h3><p>{card?.qisqa || card?.izoh || (ownDetails && roleName(ownDetails.role)) || ""}</p></div>
          {card?.kabutar_id && <div className="kb-id-card"><label htmlFor={`${drawerId.current}-id`}>{isSelf ? "Mening Kabutar ID raqamim" : "Kabutar ID raqami"}</label><input id={`${drawerId.current}-id`} value={card.kabutar_id} readOnly onFocus={event => event.target.select()}/><div className="kb-button-row"><button type="button" onClick={copyId}><Copy size={17}/>Nusxalash</button><button type="button" onClick={shareId}><Share2 size={17}/>Ulashish</button></div><p>{isSelf ? "Odamlar sizni Kabutarda shu ID orqali topadi." : "Bu kontaktni Kabutarda shu ID orqali topish mumkin."}</p></div>}
          {loading && <p className="kb-state" role="status">Profil ma’lumotlari yuklanmoqda…</p>}
          {profileError && <div className="kb-state kb-state--error" role="alert">{profileError}<button type="button" className="kb-text-button" onClick={() => setReload(value => value + 1)}>Qayta urinish</button></div>}
          {!loading && !profileError && !card?.kabutar_id && !isGroup && <p className="kb-state">Kabutar ID hozircha ko‘rsatilmagan.</p>}
          {!isSelf && !isGroup && card?.user_id && <div className="kb-profile-actions"><button type="button" className="kb-primary" onClick={() => onOpenContact({ ...selected, ...card, izoh: card.qisqa || card.izoh || selected?.izoh || "" })}><MessageCircle size={18}/>Xabar yozish</button><button type="button" className="kb-secondary" aria-pressed={saved} onClick={() => preferences.toggleSaved(card)}><Star size={18} fill={saved ? "currentColor" : "none"}/>{saved ? "Tanlanganlardan olish" : "Tanlangan kontakt"}</button></div>}
          {isGroup && <button type="button" className="kb-primary" onClick={onClose}>Guruh xabarlariga qaytish</button>}
          {roles.length > 0 && <section className="kb-settings-card"><h3>Muassasa va rollar</h3>{roles.map((role, index) => <div className="kb-role" key={`${role.rol}-${role.muassasa}-${index}`}><span className="kb-role-mark"><Check size={15}/></span><div><strong>{role.rol}</strong>{role.muassasa && <small>{role.muassasa}</small>}</div></div>)}</section>}
          {isSelf && ownDetails && <section className="kb-settings-card"><h3>Shaxsiy ma’lumotlar</h3><dl className="kb-details">
            {[["Ism", ownDetails.full_name === card?.full_name ? ownDetails.full_name : card?.full_name], ["Rol", roleName(ownDetails.role)], ["Telefon", ownDetails.telefon || ownDetails.phone], ["Viloyat", ownDetails.region], ["Tuman", ownDetails.district], ["Maktab", ownDetails.maktab_nomi], ["Sinf", ownDetails.class ? `${ownDetails.class}${ownDetails.class_letter || ""}` : ""]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl></section>}
          {isSelf && card?.user_id && <section className="kb-settings-card"><h3>Profil sozlamasi</h3>{editingName ? <form onSubmit={saveName}><label className="kb-field" htmlFor={`${drawerId.current}-name`}>Ism va familiya</label><input className="kb-input" id={`${drawerId.current}-name`} value={name} onChange={event => setName(event.target.value)} maxLength={160} required autoComplete="name"/><div className="kb-button-row"><button type="submit" className="kb-primary" disabled={saving}>{saving ? "Saqlanmoqda…" : "Saqlash"}</button><button type="button" disabled={saving} onClick={() => setEditingName(false)}>Bekor qilish</button></div></form> : <button type="button" className="kb-secondary" onClick={() => { setName(card.full_name || ""); setEditingName(true); }}>Ismni o‘zgartirish</button>}</section>}
        </>}
        {page === "contacts" && <>
          <form className="kb-settings-card" onSubmit={lookup}><h3>ID bilan kontakt topish</h3><label className="kb-field" htmlFor={`${drawerId.current}-lookup`}>Kabutar ID</label><div className="kb-search-id"><input className="kb-input" id={`${drawerId.current}-lookup`} value={lookupId} onChange={event => setLookupId(event.target.value)} placeholder="KB-123456" autoComplete="off" maxLength={16}/><button type="submit" className="kb-primary" disabled={lookupBusy}>{lookupBusy ? "Izlanmoqda…" : "Topish"}</button></div>{lookupError && <p className="kb-state kb-state--error" role="alert">{lookupError}</p>}</form>
          <label className="kb-contact-search"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ism, ID yoki muassasa" aria-label="Kontaktlarni qidirish"/></label>
          <div className="kb-filter-row"><button type="button" aria-pressed={!savedOnly} onClick={() => setSavedOnly(false)}>Barchasi</button><button type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly(true)}>Tanlanganlar · {preferences.saved.length}</button><span>{filtered.length} kontakt</span></div>
          <p className="kb-help">Muassasalaringizdagi aloqalar va suhbatlar. Tanlanganlar shu qurilmada saqlanadi.</p>
          <div className="kb-contact-list">{filtered.slice(0, limit).map(contact => <button type="button" key={contact.user_id} className="kb-contact" onClick={() => openProfile(contact)}><Avatar person={contact} apiBase={apiBase}/><span><strong>{contact.full_name}</strong><small>{contact.kabutar_id || contact.izoh || contact.rollar[0]?.muassasa || "Profilni ko‘rish"}</small></span><span className="kb-chevron" aria-hidden="true">›</span></button>)}</div>
          {!filtered.length && <div className="kb-empty"><Users size={30}/><p>{query ? "Bu qidiruvga mos kontakt topilmadi." : savedOnly ? "Kontakt profilidagi yulduzchani bosib, uni tanlanganlarga qo‘shing." : "Kontaktni yuqorida Kabutar ID orqali toping."}</p></div>}
          {filtered.length > limit && <button type="button" className="kb-secondary kb-more" onClick={() => setLimit(value => value + 50)}>Yana {Math.min(50, filtered.length - limit)} ta kontakt</button>}
        </>}
        {page === "settings" && <>
          <p className="kb-help">Bu sozlamalar Kabutarning shu qurilmadagi ko‘rinishi va yozish usulini o‘zgartiradi.</p>
          <section className="kb-settings-card"><h3>Xabarlar ko‘rinishi</h3><label className="kb-setting-row"><span><strong>Yozuv kattaligi</strong><small>Xabar matni uchun</small></span><select aria-label="Xabar yozuvi kattaligi" value={preferences.settings.textSize} onChange={event => preferences.updateSettings({ textSize: Number(event.target.value) })}><option value={15}>Oddiy</option><option value={17}>Kattaroq</option><option value={19}>Katta</option></select></label><div className="kb-message-preview" style={{ fontSize: preferences.settings.textSize }}>Assalomu alaykum! Bugungi dars qaysi vaqtda?</div>
          <label className="kb-setting-row"><span><strong>Xabar oldko‘rinishi</strong><small>Suhbatlar ro‘yxatida oxirgi xabar matni</small></span><input type="checkbox" checked={preferences.settings.showPreviews} onChange={event => preferences.updateSettings({ showPreviews: event.target.checked })}/></label></section>
          <section className="kb-settings-card"><h3>Xabar yozish</h3><label className="kb-setting-row"><span><strong>Enter bilan yuborish</strong><small>O‘chiq bo‘lsa Enter yangi qator ochadi. Yuborish tugmasi har doim ishlaydi.</small></span><input type="checkbox" checked={preferences.settings.enterToSend} onChange={event => preferences.updateSettings({ enterToSend: event.target.checked })}/></label></section>
          <section className="kb-settings-card"><h3>Kontakt va profil</h3><button type="button" className="kb-menu-row" onClick={() => switchPage("contacts")}><Users size={20}/><span>Kontaktlarim<small>Qidirish va tanlanganlar</small></span><span aria-hidden="true">›</span></button><button type="button" className="kb-menu-row" onClick={() => switchPage("profile")}><User size={20}/><span>Mening profilim<small>Kabutar ID va shaxsiy ma’lumotlar</small></span><span aria-hidden="true">›</span></button></section>
        </>}
        {notice && <p className="kb-state" role="status">{notice}</p>}
        {preferences.storageError && <p className="kb-state kb-state--error" role="alert">{preferences.storageError}</p>}
      </div>
    </section>
  </div>, document.body);
}
