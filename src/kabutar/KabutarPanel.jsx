// REV35: new components included so existing-file uploads keep every dependency.
import * as __kbRev35_external0 from "react";
import * as __kbRev35_external1 from "react-dom";
import * as __kbRev35_external2 from "lucide-react";
import * as __kbRev35_external3 from "../pwa/samtmPwa.js";
// Included from kabutar/kabutarAccountRules.js; implementation preserved.
const __kbRev35_module1 = (() => {
// REV28: ID search accepts 6–10 digits; account-local presentation settings; server permissions still govern contacts.
const DEFAULT_KABUTAR_SETTINGS = Object.freeze({ textSize: 15, enterToSend: false, showPreviews: true });

function normalizeKabutarId(value) {
  const compact = String(value || "").trim().replace(/^KB[\s-]*/i, "");
  return /^\d{6,10}$/.test(compact) ? `KB-${compact}` : "";
}

function normalizeSettings(value) {
  return {
    textSize: [15, 17, 19].includes(Number(value?.textSize)) ? Number(value.textSize) : 15,
    enterToSend: value?.enterToSend === true,
    showPreviews: value?.showPreviews !== false,
  };
}

function contactRecord(value) {
  const id = Number(value?.user_id);
  if (!Number.isSafeInteger(id) || id === 0 || value?.guruh_id) return null;
  return {
    user_id: id,
    full_name: String(value.full_name || "Foydalanuvchi").slice(0, 160),
    kabutar_id: normalizeKabutarId(value.kabutar_id),
    izoh: String(value.qisqa || value.izoh || "").slice(0, 600),
    rasm_bormi: value.rasm_bormi === true,
    rollar: (Array.isArray(value.rollar) ? value.rollar : []).slice(0, 30).map(role => ({
      rol: String(role?.rol || "").slice(0, 160), muassasa: String(role?.muassasa || "").slice(0, 160),
    })),
  };
}

function collectContacts(directory, saved = []) {
  const contacts = new Map();
  const self = Number(directory?.men?.user_id);
  const add = value => {
    const next = contactRecord(value);
    if (!next || next.user_id === self) return;
    const old = contacts.get(next.user_id);
    if (old) {
      next.kabutar_id ||= old.kabutar_id;
      next.izoh ||= old.izoh;
      next.rasm_bormi ||= old.rasm_bormi;
      const roles = new Map([...old.rollar, ...next.rollar].map(role => [`${role.rol}|${role.muassasa}`, role]));
      next.rollar = [...roles.values()];
    }
    contacts.set(next.user_id, next);
  };
  saved.forEach(add);
  (directory?.suhbatlar || []).forEach(add);
  (directory?.muassasalar || []).forEach(institution => (institution.azolar || []).forEach(person => add({
    ...person,
    rollar: [...(Array.isArray(person.rollar) ? person.rollar : []), { rol: person.izoh || "A’zo", muassasa: institution.muassasa || "" }],
  })));
  return [...contacts.values()].sort((a, b) => a.full_name.localeCompare(b.full_name, "uz"));
}

function filterContacts(contacts, query, savedOnly = false, saved = []) {
  const normalize = text => String(text || "").toLocaleLowerCase("uz").replace(/[‘’ʻʼ`']/g, "");
  const q = normalize(query).trim();
  const ids = new Set(saved.map(person => Number(person.user_id)));
  return contacts.filter(person => (!savedOnly || ids.has(person.user_id)) && (!q || normalize(
    [person.full_name, person.kabutar_id, person.izoh, ...person.rollar.map(role => `${role.rol} ${role.muassasa}`)].join(" ")
  ).includes(q)));
}

function kabutarStorageKey(apiBase, ownerId) {
  return ownerId ? `samtm:kabutar:v27:${String(apiBase || "").replace(/\/$/, "")}:${ownerId}` : null;
}

function readKabutarLocal(storage, key) {
  const empty = { settings: { ...DEFAULT_KABUTAR_SETTINGS }, saved: [] };
  if (!key) return empty;
  try {
    const raw = storage.getItem(key);
    if (!raw || raw.length > 1000000) return empty;
    const data = JSON.parse(raw);
    const saved = new Map((Array.isArray(data.saved) ? data.saved : []).slice(0, 500).map(contactRecord).filter(Boolean).map(person => [person.user_id, person]));
    return { settings: normalizeSettings(data.settings), saved: [...saved.values()] };
  } catch { return empty; }
}

async function kabutarRequest(apiBase, path, token, options = {}) {
  const { signal, authInHeader = false, ...init } = options;
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  else signal?.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(() => { timedOut = true; cancel(); }, 12000);
  try {
    const target = `${String(apiBase || "").replace(/\/$/, "")}${path}${authInHeader ? "" : `${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`}`;
    const response = await fetch(target, { ...init, headers: authInHeader ? { ...init.headers, Authorization: `Bearer ${token}` } : init.headers, signal: controller.signal });
    let data;
    try { data = await response.json(); } catch { throw new Error("Server javobi o‘qilmadi. Qayta urinib ko‘ring."); }
    if (!response.ok || data?.detail) {
      throw new Error(typeof data?.detail === "string" ? data.detail : "Ma’lumot olinmadi. Qayta urinib ko‘ring.");
    }
    return data;
  } catch (error) {
    if (timedOut) throw new Error("Ulanish cho‘zildi. Qayta urinib ko‘ring.");
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}

async function copyKabutarText(value) {
  if (!value) return false;
  try { await navigator.clipboard.writeText(String(value)); return true; } catch { /* Older mobile browsers. */ }
  const field = document.createElement("textarea");
  field.value = String(value);
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
  const focused = document.activeElement;
  document.body.appendChild(field);
  field.focus(); field.select(); field.setSelectionRange(0, field.value.length);
  try { return document.execCommand("copy"); } catch { return false; }
  finally { field.remove(); focused?.focus?.({ preventScroll: true }); }
}

return { "DEFAULT_KABUTAR_SETTINGS": DEFAULT_KABUTAR_SETTINGS, "normalizeKabutarId": normalizeKabutarId, "normalizeSettings": normalizeSettings, "contactRecord": contactRecord, "collectContacts": collectContacts, "filterContacts": filterContacts, "kabutarStorageKey": kabutarStorageKey, "readKabutarLocal": readKabutarLocal, "kabutarRequest": kabutarRequest, "copyKabutarText": copyKabutarText };
})();

// Included from kabutar/KabutarAccount.jsx; implementation preserved.
const __kbRev35_module0 = (() => {
const React = __kbRev35_external0["default"];
const useEffect = __kbRev35_external0["useEffect"];
const useMemo = __kbRev35_external0["useMemo"];
const useRef = __kbRev35_external0["useRef"];
const useState = __kbRev35_external0["useState"];
const createPortal = __kbRev35_external1["createPortal"];
const ArrowLeft = __kbRev35_external2["ArrowLeft"];
const Check = __kbRev35_external2["Check"];
const Copy = __kbRev35_external2["Copy"];
const MessageCircle = __kbRev35_external2["MessageCircle"];
const Search = __kbRev35_external2["Search"];
const Settings = __kbRev35_external2["Settings"];
const Share2 = __kbRev35_external2["Share2"];
const Star = __kbRev35_external2["Star"];
const User = __kbRev35_external2["User"];
const Users = __kbRev35_external2["Users"];
const X = __kbRev35_external2["X"];
const registerPhoneBackHandler = __kbRev35_external3["registerPhoneBackHandler"];
const collectContacts = __kbRev35_module1["collectContacts"];
const contactRecord = __kbRev35_module1["contactRecord"];
const copyKabutarText = __kbRev35_module1["copyKabutarText"];
const DEFAULT_KABUTAR_SETTINGS = __kbRev35_module1["DEFAULT_KABUTAR_SETTINGS"];
const filterContacts = __kbRev35_module1["filterContacts"];
const kabutarRequest = __kbRev35_module1["kabutarRequest"];
const kabutarStorageKey = __kbRev35_module1["kabutarStorageKey"];
const normalizeKabutarId = __kbRev35_module1["normalizeKabutarId"];
const normalizeSettings = __kbRev35_module1["normalizeSettings"];
const readKabutarLocal = __kbRev35_module1["readKabutarLocal"];


const initials = value => String(value || "").trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "K";
const roleName = value => ({ oqituvchi: "O‘qituvchi", oquvchi: "O‘quvchi", "ota-ona": "Ota-ona", ota_ona: "Ota-ona", admin: "Administrator" }[value] || value || "Foydalanuvchi");
const localStore = () => { try { return window.localStorage; } catch { return null; } };
let drawerSequence = 0;

function useKabutarPreferences(ownerId, apiBase) {
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

function KabutarAccountButton({ me, apiBase, onProfile, onSettings }) {
  return <div className="kb-account-actions">
    <button type="button" className="kb-account-trigger" onClick={onProfile} aria-label="Mening Kabutar profilim va ID raqamim">
      <Avatar person={me} apiBase={apiBase}/><span><strong>{me?.full_name || "Mening profilim"}</strong><small>{me?.kabutar_id || "Profil va Kabutar ID"}</small></span>
    </button>
    <button type="button" className="kb-icon-button" onClick={onSettings} aria-label="Kabutar sozlamalari va kontaktlar" title="Kabutar sozlamalari"><Settings size={21}/></button>
  </div>;
}

function KabutarAccount({ token, apiBase, directory, initialPage = "profile", person = null, preferences, onClose, onOpenContact, onMeUpdated }) {
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

return { "useKabutarPreferences": useKabutarPreferences, "KabutarAccountButton": KabutarAccountButton, "default": KabutarAccount };
})();

// Included from kabutar/kabutarPolling.js; implementation preserved.
const __kbRev35_module2 = (() => {
// Serialized foreground polling: next request starts only after the prior one
// settled. React owns foreground/active gating and calls stop() on hide/logout.
function startKabutarPoll(task, {
  interval, maxDelay = 60000, setTimer = setTimeout, clearTimer = clearTimeout,
} = {}) {
  if (!(interval > 0) || maxDelay < interval) throw new Error("Polling interval noto‘g‘ri");
  const controller = new AbortController();
  let timer = null;
  let failures = 0;
  let stopped = false;
  const run = async () => {
    if (stopped) return;
    let succeeded = false;
    try { succeeded = (await task(controller.signal)) !== false; }
    catch { /* The request owner exposes the useful error to the UI. */ }
    if (stopped) return;
    failures = succeeded ? 0 : Math.min(failures + 1, 8);
    const delay = Math.min(maxDelay, interval * (2 ** failures));
    timer = setTimer(run, delay);
  };
  run();
  return () => {
    stopped = true;
    if (timer !== null) clearTimer(timer);
    controller.abort();
  };
}

// Merge server refreshes and optimistic sends without duplicate bubbles.
function mergeKabutarMessages(current, incoming) {
  const rows = new Map(current.map(message => [String(message.id), message]));
  incoming.forEach(message => rows.set(String(message.id), { ...rows.get(String(message.id)), ...message }));
  return [...rows.values()].sort((a, b) => Number(a.id) - Number(b.id));
}

return { "startKabutarPoll": startKabutarPoll, "mergeKabutarMessages": mergeKabutarMessages };
})();

// Install included styles once; refresh their text on a development reload.
if (typeof document !== "undefined" && document.head) {
  {
    const id = "kabutar-rev35-style-kabutar-kabutar-account-css";
    let sheet = document.getElementById(id);
    if (!sheet) { sheet = document.createElement("style"); sheet.id = id; document.head.appendChild(sheet); }
    sheet.textContent = "/* REV27 — scoped Kabutar styles; desktop and mobile share the same profile controls. */\n.kb-account-actions,.kb-account-overlay,.kb-account-overlay *{box-sizing:border-box}\n.kb-account-actions{display:flex;align-items:center;gap:8px;min-width:0}\n.kb-account-trigger{display:flex;align-items:center;gap:9px;min-height:44px;max-width:300px;padding:6px 10px;border:1px solid #dbe6ef;border-radius:13px;background:#edf4fa;color:#173a58;text-align:left;cursor:pointer;font:inherit}\n.kb-account-trigger>span:last-child{display:grid;gap:2px;min-width:0}\n.kb-account-trigger strong{font-size:13px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.kb-account-trigger small{font-size:12px;font-weight:800;letter-spacing:.025em;line-height:1.4}\n.kb-avatar{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:40px;height:40px;border-radius:13px;background:#1b4b7a;color:#fff;overflow:hidden;font-size:14px;font-weight:800}\n.kb-avatar img{width:100%;height:100%;object-fit:cover}\n.kb-avatar--large{width:76px;height:76px;border-radius:24px;font-size:26px;background:#1b4b7a}\n.kb-icon-button{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;min-width:44px;min-height:44px;padding:10px;border:1px solid #dbe6ef;border-radius:13px;background:#fff;color:#1b4b7a;cursor:pointer}\n.kb-account-overlay{position:fixed;inset:0;z-index:15000;display:flex;justify-content:flex-end;background:rgba(12,31,48,.42);color:#21384c;font-family:inherit;font-size:15px;line-height:1.5;font-weight:400}\n.kb-account-sheet{display:flex;flex-direction:column;width:min(460px,100%);height:100vh;height:100dvh;max-width:100%;background:#f5f7fa;box-shadow:-12px 0 50px #10203024;outline:none}\n.kb-sheet-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px 14px;padding-top:max(18px,env(safe-area-inset-top));border-bottom:1px solid #e0e7ee;background:#fff}\n.kb-sheet-header small{color:#0d7a77;font-size:10px;letter-spacing:.17em;font-weight:800}\n.kb-sheet-header h2{margin:3px 0 0;font-size:23px;line-height:1.3;font-weight:750;color:#21384c}\n.kb-account-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;padding:10px 14px;background:#fff;border-bottom:1px solid #e0e7ee}\n.kb-account-tabs button{display:flex;align-items:center;justify-content:center;gap:6px;min-height:44px;padding:7px 4px;border:0;border-radius:11px;background:transparent;color:#52687a;font-family:inherit;font-size:13px;line-height:1.4;font-weight:700;cursor:pointer}\n.kb-account-tabs button[aria-current=page]{background:#eaf2f9;color:#1b4b7a}\n.kb-sheet-body{min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:16px 18px max(24px,env(safe-area-inset-bottom));overflow-wrap:anywhere}\n.kb-profile-hero{text-align:center;padding:12px 6px 20px}\n.kb-profile-hero h3{margin:12px 0 5px;font-size:22px;line-height:1.3;font-weight:750;color:#21384c}\n.kb-profile-hero p{margin:0;color:#667b8e;font-size:13px;line-height:1.6}\n.kb-id-card{padding:17px;border:1px solid #cfe0ed;border-radius:18px;background:#eaf3fa;margin-bottom:16px}\n.kb-id-card label{display:block;color:#456780;font-size:12px;font-weight:700}\n.kb-id-card input{display:block;width:100%;padding:8px 0;border:0;background:transparent;color:#1b4b7a;font:800 26px/1.3 ui-monospace,monospace;letter-spacing:.02em;outline-offset:2px;cursor:text}\n.kb-id-card p{font-size:12px;color:#526e83;margin:10px 0 0}\n.kb-button-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}\n.kb-button-row button,.kb-secondary{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:10px 13px;border:1px solid #d6e2ec;border-radius:11px;background:#fff;color:#1b4b7a;font-family:inherit;font-size:13px;line-height:1.4;font-weight:700;cursor:pointer}\n.kb-primary,.kb-button-row .kb-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:10px 15px;border:1px solid #1b4b7a;border-radius:11px;background:#1b4b7a;color:#fff;font-family:inherit;font-size:14px;line-height:1.4;font-weight:700;cursor:pointer}\n.kb-profile-actions{display:grid;gap:9px;margin-bottom:16px}\n.kb-secondary[aria-pressed=true]{color:#8a6217;background:#fff8e5;border-color:#e6d6a8}\n.kb-settings-card{padding:16px;margin:0 0 14px;border:1px solid #e0e7ed;border-radius:17px;background:#fff}\n.kb-settings-card h3{margin:0 0 12px;font-size:14px;font-weight:800;color:#294960}\n.kb-role{display:flex;align-items:flex-start;gap:9px;padding:10px 0;border-top:1px solid #edf0f4}\n.kb-role-mark{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:27px;height:27px;border-radius:9px;background:#e7f5ef;color:#1f7c60}\n.kb-role strong{display:block;font-size:13px;font-weight:700;line-height:1.5}\n.kb-role small{display:block;color:#657b8d;font-size:12px;line-height:1.5;margin-top:1px}\n.kb-details{margin:0}\n.kb-details>div{display:grid;grid-template-columns:90px minmax(0,1fr);gap:10px;padding:9px 0;border-top:1px solid #edf0f4;font-size:13px}\n.kb-details dt{color:#738494}\n.kb-details dd{margin:0;font-weight:600;color:#21384c}\n.kb-field{display:block;margin:10px 0 6px;font-size:12px;font-weight:700;color:#597084}\n.kb-input,.kb-setting-row select{width:100%;min-width:0;min-height:44px;padding:10px 11px;border:1px solid #cedce7;border-radius:10px;background:#fff;color:#21384c;font:inherit;font-size:16px}\n.kb-search-id{display:flex;gap:7px;align-items:stretch}\n.kb-search-id .kb-input{flex:1;min-width:0;width:0}\n.kb-search-id .kb-primary{flex-shrink:0}\n.kb-contact-search{display:flex;align-items:center;gap:9px;min-height:46px;padding:0 12px;background:#fff;border:1px solid #dce6ed;border-radius:12px;color:#6b8093}\n.kb-contact-search input{min-width:0;width:100%;padding:11px 0;border:0;background:transparent;color:#21384c;font:inherit;font-size:16px;outline:none}\n.kb-filter-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:12px 0 8px}\n.kb-filter-row button{min-height:40px;border:1px solid #d8e2eb;border-radius:11px;padding:8px 11px;background:#fff;color:#45627a;font-family:inherit;font-size:12px;line-height:1.4;font-weight:700;cursor:pointer}\n.kb-filter-row button[aria-pressed=true]{background:#1b4b7a;color:#fff;border-color:#1b4b7a}\n.kb-filter-row>span{margin-left:auto;color:#667b8e;font-size:11px}\n.kb-help{margin:0 0 14px;color:#61788b;font-size:12px;line-height:1.6}\n.kb-contact-list{overflow:hidden;border-radius:15px;background:#fff}\n.kb-contact{display:flex;align-items:center;gap:10px;width:100%;padding:12px;border:0;border-bottom:1px solid #e8edf2;background:#fff;text-align:left;color:#21384c;cursor:pointer;font:inherit}\n.kb-contact>span:nth-child(2){display:grid;gap:3px;flex:1;min-width:0}\n.kb-contact strong{font-size:14px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.kb-contact small{font-size:12px;line-height:1.4;color:#667c8e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.kb-chevron{color:#8aa0b1;font-size:24px}\n.kb-contact:hover,.kb-menu-row:hover{background:#f4f8fb}\n.kb-empty{display:grid;justify-items:center;gap:10px;text-align:center;padding:30px 18px;color:#6b8093}\n.kb-empty p{margin:0;font-size:13px}\n.kb-more{width:100%;margin-top:13px}\n.kb-setting-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 0;border-top:1px solid #edf0f4}\n.kb-setting-row>span{flex:1;min-width:0}\n.kb-setting-row strong{display:block;font-size:14px;font-weight:700;color:#294960}\n.kb-setting-row small{display:block;font-size:12px;line-height:1.5;color:#6a7d8e;margin-top:3px}\n.kb-setting-row select{width:auto;max-width:135px;flex-shrink:0;font-size:14px}\n.kb-setting-row input[type=checkbox]{width:25px;height:25px;min-width:25px;margin:0;accent-color:#1b4b7a;cursor:pointer}\n.kb-message-preview{padding:12px 14px;margin:8px 0;border-radius:14px 14px 4px 14px;background:#1b4b7a;color:white;line-height:1.55}\n.kb-menu-row{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:12px 0;border:0;border-top:1px solid #edf0f4;background:#fff;color:#1b4b7a;font-family:inherit;font-size:14px;line-height:1.4;font-weight:700;text-align:left;cursor:pointer}\n.kb-menu-row>span:first-of-type{flex:1}\n.kb-menu-row small{display:block;font-size:12px;color:#6a7d8e;font-weight:400;margin-top:4px}\n.kb-text-button{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:6px 0;border:0;background:none;color:#1b4b7a;font-family:inherit;font-size:13px;line-height:1.4;font-weight:700;cursor:pointer}\n.kb-state{padding:11px 13px;margin:12px 0;border:1px solid #cee0ec;border-radius:12px;background:#edf5fb;color:#345e7c;font-size:13px;line-height:1.5}\n.kb-state--error{background:#fff2ed;border-color:#eacabe;color:#974b34}\n.kb-state button{display:flex}\n.kb-account-overlay button:disabled{opacity:.55;cursor:wait}\n.kb-account-overlay button:focus-visible,.kb-account-actions button:focus-visible,.kb-account-overlay input:focus-visible,.kb-account-overlay select:focus-visible,.kb-peer-profile:focus-visible{outline:3px solid #dfa939;outline-offset:2px}\n.kb-peer-profile{display:flex;align-items:center;gap:10px;flex:1;min-width:0;padding:0;border:0;background:none;text-align:left;cursor:pointer;font:inherit}\n.kb-peer-profile>span:last-child{min-width:0}\n.kb-peer-profile strong{display:block;color:#21384c;font-size:15px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.kb-peer-profile small{display:block;color:#637d91;font-size:11px;line-height:1.5;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n.kb-panel .kb-composer textarea{min-width:0;font-size:16px}\n@media(max-width:639px){\n  .kb-panel-header{flex-wrap:wrap;gap:10px!important;padding:10px 12px!important}\n  .kb-header-account{width:100%;justify-content:space-between!important;min-width:0}\n  .kb-account-actions{flex:1}\n  .kb-account-trigger{flex:1;max-width:none;min-width:0}\n  .kb-account-trigger strong{font-size:14px}\n  .kb-account-trigger small{font-size:13px}\n  .kb-sheet-header{padding-right:15px;padding-left:15px}\n  .kb-sheet-body{padding-right:13px;padding-left:13px}\n  .kb-account-tabs{padding-right:10px;padding-left:10px}\n  .kb-account-tabs button{font-size:12px}\n  .kb-panel .kb-composer{display:grid;grid-template-columns:42px 42px 42px minmax(0,1fr);gap:7px}\n  .kb-panel .kb-composer textarea{grid-row:1;grid-column:1 / -1;width:100%}\n  .kb-panel .kb-composer .kb-send-button{justify-self:end;min-height:44px}\n}\n@media(prefers-reduced-motion:reduce){.kb-account-overlay *{scroll-behavior:auto}}\n";
  } // kabutar/kabutar-account.css
}

// Existing application implementation.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Download, Forward, Loader2, MessageCircle, Pencil, Reply, Search, Trash2 } from "lucide-react";
const KabutarAccount = __kbRev35_module0["default"];
const KabutarAccountButton = __kbRev35_module0["KabutarAccountButton"];
const useKabutarPreferences = __kbRev35_module0["useKabutarPreferences"];
const kabutarRequest = __kbRev35_module1["kabutarRequest"];
const normalizeKabutarId = __kbRev35_module1["normalizeKabutarId"];
const startKabutarPoll = __kbRev35_module2["startKabutarPoll"];
const mergeKabutarMessages = __kbRev35_module2["mergeKabutarMessages"];
import KabutarMediaComposer from "./KabutarMediaComposer.jsx";
import { isPhotoMessage } from "./kabutarMediaRules.js";

// Ranglar — maktab ish maydoni palitrasi bilan bir xil
const palette = {
  ink: "#21384C", muted: "#7A8794", line: "#E5E1D8", cream: "#F7F5F0", sky: "#EAF1F7", blue: "#1B4B7A",
  teal: "#0D7A77", green: "#2E6C55", mint: "#EEF6F1", greenBg: "#EEF6F1", red: "#B0553A", redBg: "#FFF0EC",
};
// =============================================================================
// KABUTAR — maktab ichidagi rasmiy aloqa (V2257). Rollar bo'yicha kim kimga yoza
// olishi serverda tekshiriladi; bu yerda faqat tez va qulay interfeys.
// =============================================================================
const KABUTAR_GROUPS = [
  ["rahbariyat", "Rahbariyat", "#1B4B7A"],
  ["sinf_rahbarlari", "Sinf rahbarlari", "#2E6C55"],
  ["oqituvchilar", "O‘qituvchilar", "#5B4B8A"],
  ["oquvchilar", "O‘quvchilar", "#8A5A1C"],
  ["ota_onalar", "Ota-onalar", "#B0553A"],
];
const kabutarInitials = name => String(name || "").trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "•";
const kabutarTime = iso => { if (!iso) return ""; const d = new Date(iso); const today = new Date(); const same = d.toDateString() === today.toDateString(); return same ? d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }); };

export const KABUTAR_TURI = {
  maktab: { ikon: "🏫", nom: "Maktab", rang: "#1B4B7A", yengil: "#EAF1F7" },
  universitet: { ikon: "🎓", nom: "Institut", rang: "#5B4B8A", yengil: "#F1EEF8" },
  institut: { ikon: "🎓", nom: "Institut", rang: "#5B4B8A", yengil: "#F1EEF8" },
  bogcha: { ikon: "🧸", nom: "Bog‘cha", rang: "#B0553A", yengil: "#FFF0EC" },
  markaz: { ikon: "📚", nom: "Ta’lim markazi", rang: "#0D7A77", yengil: "#E8F5F4" },
};
export default function KabutarPanel({ token, apiBase, maktabId = null, title = "Kabutar", onClose, docked = false, onUnread = null, scope = null, showScopeStrip = true, active = true }) {
  const [pageVisible, setPageVisible] = useState(() => typeof document === "undefined" || document.visibilityState !== "hidden");
  const foreground = active && pageVisible && Boolean(token);
  const foregroundRef = useRef(foreground);
  foregroundRef.current = foreground;
  const onUnreadRef = useRef(onUnread);
  onUnreadRef.current = onUnread;
  const requestsRef = useRef({ directory: null, messages: null });
  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!foreground) Object.values(requestsRef.current).forEach(entry => entry?.controller.abort());
  }, [foreground]);
  useEffect(() => () => {
    Object.values(requestsRef.current).forEach(entry => entry?.controller.abort());
  }, [token, apiBase]);
  // scope: { turi, muassasa_id } — faqat shu muassasa Kabutari; null — hammasi
  const [scopeKey, setScopeKey] = useState(scope ? `${scope.turi}:${scope.muassasa_id}` : "all");
  useEffect(() => { if (scope) setScopeKey(`${scope.turi}:${scope.muassasa_id}`); }, [scope?.turi, scope?.muassasa_id]);
  const [directory, setDirectory] = useState(null);
  const [accountView, setAccountView] = useState(null);
  const preferences = useKabutarPreferences(directory?.men?.user_id, apiBase);
  const [chatDirectory, setChatDirectory] = useState({ guruhlar: [], shaxsiylar: [] });
  const [listTab, setListTab] = useState("all");
  const [dirError, setDirError] = useState("");
  const [query, setQuery] = useState("");
  const [idQuery, setIdQuery] = useState("");
  const [idResult, setIdResult] = useState(null); const [idBusy, setIdBusy] = useState(false); const [idError, setIdError] = useState("");
  const searchById = async () => {
    if (idBusy) return;
    const raw = idQuery.trim();
    const key = normalizeKabutarId(raw) || (/^[@+]/.test(raw) && raw.length <= 80 ? raw : "");
    if (!key) { setIdError("KB raqami, @nik yoki +998 bilan telefon raqamini kiriting"); return; }
    if (key === directory?.men?.kabutar_id) { setAccountView({ page: "profile" }); return; }
    setIdBusy(true); setIdError(""); setIdResult(null);
    try {
      const d = await kabutarRequest(apiBase, `/api/kabutar/find?query=${encodeURIComponent(key)}`, token, { authInHeader: true });
      if (String(d.user_id) === String(directory?.men?.user_id)) setAccountView({ page: "profile" });
      else setIdResult(d);
    } catch (e) { setIdError(e.message); } finally { setIdBusy(false); }
  };
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [peerSeenId, setPeerSeenId] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [menuMessage, setMenuMessage] = useState(null);
  const [forwarding, setForwarding] = useState(null);
  const [mediaBusy, setMediaBusy] = useState(false);
  const outgoingRef = useRef(null);
  const bodyRef = useRef(null);
  const lastIdRef = useRef(0); const peerRef = useRef(null);
  const peerKey = value => value ? (value.guruh_id ? `g:${value.guruh_id}` : `u:${value.user_id}`) : "";
  const conversationKey = peerKey(peer);
  useEffect(() => {
    const entry = outgoingRef.current;
    if (entry && entry.key !== conversationKey) entry.controller.abort();
  }, [conversationKey]);
  useEffect(() => () => { outgoingRef.current?.controller.abort(); }, [token, apiBase]);

  useEffect(() => { setAccountView(null); setDirectory(null); setChatDirectory({ guruhlar: [], shaxsiylar: [] }); setPeer(null); peerRef.current = null; setMessages([]); }, [apiBase, token]);

  const loadDirectory = useCallback(({ signal } = {}) => {
    if (!foregroundRef.current || signal?.aborted) return Promise.resolve(false);
    const existing = requestsRef.current.directory;
    if (existing && !existing.controller.signal.aborted) return existing.promise;
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    const entry = { controller, promise: null };
    entry.promise = (async () => {
      try {
        const [people, chats] = await Promise.allSettled([
          kabutarRequest(apiBase, "/api/kabutar/aloqalar_umumiy", token, { signal: controller.signal }),
          kabutarRequest(apiBase, "/api/chat/guruhlarim", token, { signal: controller.signal }),
        ]);
        if (controller.signal.aborted || !foregroundRef.current) return false;
        if (people.status === "rejected") throw people.reason;
        const d = people.value;
        if (chats.status === "fulfilled") setChatDirectory(chats.value);
        if (maktabId && Array.isArray(d.muassasalar)) d.muassasalar.sort((a, b) => Number(b.turi === "maktab" && String(b.muassasa_id) === String(maktabId)) - Number(a.turi === "maktab" && String(a.muassasa_id) === String(maktabId)));
        setDirectory(d);
        setDirError(chats.status === "rejected" ? "Guruhlar vaqtincha yuklanmadi. Qayta ulanmoqda…" : "");
        onUnreadRef.current?.(Number(d.jami_oqilmagan || 0));
        return chats.status === "fulfilled";
      } catch (e) {
        if (!controller.signal.aborted && foregroundRef.current) setDirError(e.message);
        return false;
      } finally {
        signal?.removeEventListener("abort", abort);
        if (requestsRef.current.directory === entry) requestsRef.current.directory = null;
      }
    })();
    requestsRef.current.directory = entry;
    return entry.promise;
  }, [apiBase, token, maktabId]);
  useEffect(() => {
    if (!foreground) return undefined;
    return startKabutarPoll(signal => loadDirectory({ signal }), { interval: 20000 });
  }, [foreground, loadDirectory]);

  const markSeen = useCallback(async (peerId, lastId, groupId = null, signal) => {
    if (!lastId || !foregroundRef.current) return;
    const target = groupId ? `guruh_id=${groupId}` : `boshqa_user_id=${peerId}`;
    try {
      await kabutarRequest(apiBase, `/api/chat/korildi_belgila?${target}&oxirgi_xabar_id=${lastId}`, token, { method: "POST", signal });
    } catch { /* Reading still works if the receipt is temporarily unavailable. */ }
  }, [apiBase, token]);

  const loadMessages = useCallback(async (peerId, { incremental = false, signal } = {}) => {
    const current = peerRef.current;
    if (!current || !foregroundRef.current || signal?.aborted) return false;
    const groupId = current.guruh_id;
    const key = groupId ? `g:${groupId}` : `u:${peerId}`;
    const isCurrent = () => {
      const next = peerRef.current;
      return next && (next.guruh_id ? `g:${next.guruh_id}` : `u:${next.user_id}`) === key;
    };
    const existing = requestsRef.current.messages;
    if (existing && !existing.controller.signal.aborted) {
      if (existing.key === key) {
        // A reaction/edit refresh requires the complete list after an in-flight
        // incremental read; otherwise callers share the existing request.
        if (!incremental && existing.incremental) {
          await existing.promise;
          if (!isCurrent() || signal?.aborted) return false;
          return loadMessages(peerId, { incremental: false, signal });
        }
        return existing.promise;
      }
      existing.controller.abort();
    }
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    const entry = { controller, key, incremental, promise: null };
    entry.promise = (async () => {
      try {
        const collected = [];
        let newest = lastIdRef.current;
        let seenId = null;
        // Catch up at most three bounded pages per cycle; never skip unread
        // rows by moving the cursor to an optimistic outgoing message ID.
        for (let page = 0; page < 3; page += 1) {
          const qs = new URLSearchParams();
          if (groupId) qs.set("guruh_id", String(groupId));
          else qs.set("boshqa_user_id", String(peerId));
          if (maktabId) qs.set("maktab_id", String(maktabId));
          if ((incremental || page > 0) && newest) qs.set("keyingidan", String(newest));
          const d = await kabutarRequest(apiBase, `${groupId ? "/api/chat/xabarlar" : "/api/kabutar/xabarlar"}?${qs}`, token, { signal: controller.signal });
          if (controller.signal.aborted || !foregroundRef.current || !isCurrent()) return false;
          const rows = Array.isArray(d.xabarlar) ? d.xabarlar : [];
          seenId = d.boshqa_tomon_korgan_id || d.qarshi_tomon_korgan_id || seenId;
          collected.push(...rows);
          const previous = newest;
          newest = Math.max(newest, ...rows.map(x => Number(x.id) || 0));
          if (!d.yana_bormi || !rows.length || newest <= previous) break;
        }
        setMessageError("");
        setPeerSeenId(seenId);
        if (collected.length) {
          setMessages(old => mergeKabutarMessages(incremental ? old : [], collected));
          lastIdRef.current = newest;
          if (collected.some(x => !x.meniki)) {
            await markSeen(peerId, newest, groupId, controller.signal);
            if (!controller.signal.aborted && isCurrent()) loadDirectory();
          }
          requestAnimationFrame(() => { if (foregroundRef.current && isCurrent() && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; });
        } else if (!incremental) setMessages([]);
        return true;
      } catch (e) {
        if (!controller.signal.aborted && foregroundRef.current && isCurrent()) setMessageError(e.message);
        return false;
      } finally {
        signal?.removeEventListener("abort", abort);
        if (requestsRef.current.messages === entry) requestsRef.current.messages = null;
      }
    })();
    requestsRef.current.messages = entry;
    return entry.promise;
  }, [apiBase, token, maktabId, markSeen, loadDirectory]);

  const forwardTo = async item => {
    const params = new URLSearchParams({ token, xabar_id: String(forwarding.id) });
    if (item.guruh_id) params.set("guruh_id", String(item.guruh_id));
    else params.set("qabul_qiluvchi_user_id", String(item.user_id));
    const r = await fetch(`${apiBase}/api/chat/xabar_forward?${params}`, { method: "POST" });
    const d = await r.json();
    if (!r.ok || d.detail) throw new Error(d.detail || "Xabar uzatilmadi");
    setForwarding(null); setMenuMessage(null); await loadDirectory();
  };
  const openPeer = item => {
    if (forwarding) { forwardTo(item).catch(error => setSendError(error.message)); return; }
    if (peerKey(peerRef.current) !== peerKey(item)) outgoingRef.current?.controller.abort();
    peerRef.current = item; lastIdRef.current = 0; setPeer(item); setMessages([]); setPeerSeenId(null); setMessageError(""); setText(""); setReplyTo(null); setEditing(null); setSendError(""); loadMessages(item.user_id || 0);
  };
  useEffect(() => {
    if (!foreground || !peer) return undefined;
    return startKabutarPoll(signal => loadMessages(peer.user_id || 0, { incremental: lastIdRef.current > 0, signal }), { interval: 6000 });
  }, [foreground, peer, loadMessages]);

  const send = async ({ file = null, fileKind = null, caption = "", conversationKey: mediaKey = null, signal } = {}) => {
    const target = peerRef.current;
    const targetKey = peerKey(target);
    if (!target || outgoingRef.current || signal?.aborted || (mediaKey && mediaKey !== targetKey)) return false;
    const body = file ? String(caption || "").trim() : text.trim();
    if (!body && !file) return false;
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    const entry = { key: targetKey, controller };
    outgoingRef.current = entry;
    const timer = setTimeout(abort, file ? 90000 : 20000);
    const stillHere = () => peerKey(peerRef.current) === targetKey && outgoingRef.current === entry;
    setSending(true); setSendError("");
    try {
      if (editing && !file) {
        const r = await fetch(`${apiBase}/api/chat/xabar_tahrirla`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, signal: controller.signal,
          body: JSON.stringify({ token, xabar_id: editing.id, yangi_matn: body }),
        });
        const d = await r.json();
        if (!r.ok || d.detail) throw new Error(d.detail || "Xabar o‘zgartirilmadi");
        if (stillHere()) {
          setMessages(old => old.map(item => item.id === editing.id ? { ...item, matn: body, tahrirlangan: true } : item));
          setText(""); setEditing(null);
        }
        return true;
      }
      const form = new FormData();
      form.append("token", token);
      if (target.guruh_id) form.append("guruh_id", String(target.guruh_id));
      else form.append("qabul_qiluvchi_user_id", String(target.user_id));
      if (!target.guruh_id && maktabId) form.append("maktab_id", String(maktabId));
      if (!target.guruh_id && target.kabutar_id) form.append("kabutar_id", target.kabutar_id);
      if (body) form.append("matn", body);
      if (replyTo) form.append("javob_xabar_id", String(replyTo.id));
      if (file) { form.append("fayl_turi", fileKind); form.append("fayl", file, file.name || `${fileKind}.webm`); }
      const endpoint = target.guruh_id ? "/api/chat/xabar_yubor" : "/api/kabutar/yubor";
      const r = await fetch(`${apiBase}${endpoint}`, { method: "POST", body: form, signal: controller.signal });
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Yuborilmadi");
      if (stillHere()) {
        if (!file) setText("");
        setReplyTo(null);
        setMessages(old => mergeKabutarMessages(old, [{ id: d.id, meniki: true, matn: d.matn ?? (body || null), fayl_turi: d.fayl_turi ?? fileKind, fayl_nomi: d.fayl_nomi ?? file?.name, fayl_hajmi_kb: d.fayl_hajmi_kb, yaratilgan_at: d.yaratilgan_at || new Date().toISOString(), yuboruvchi_user_id: directory?.men?.user_id, javob_xabar_id: replyTo?.id, javob_yuboruvchi_ismi: replyTo?.yuboruvchi_ismi, javob_matn_qisqa: replyTo?.matn }]));
        // Only fetched pages advance lastIdRef; own outgoing IDs may be ahead
        // of incoming messages that have not been fetched yet.
        requestAnimationFrame(() => { if (stillHere() && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; });
      }
      loadDirectory();
      return true;
    } catch (e) {
      if (stillHere()) setSendError(controller.signal.aborted ? "Yuborish to‘xtadi. Qayta yuborishdan oldin suhbatni tekshiring." : e.message);
      return false;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      if (outgoingRef.current === entry) { outgoingRef.current = null; setSending(false); }
    }
  };

  const removeMessage = async message => {
    if (!message?.meniki) return;
    try {
      const r = await fetch(`${apiBase}/api/chat/xabar_ochir?token=${encodeURIComponent(token)}&xabar_id=${message.id}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Xabar o‘chirilmadi");
      setMessages(old => old.filter(item => item.id !== message.id));
      setMenuMessage(null);
    } catch (e) { setSendError(e.message); }
  };

  const reactTo = async (message, emoji) => {
    try {
      const params = new URLSearchParams({ token, xabar_id: String(message.id), emoji });
      const r = await fetch(`${apiBase}/api/chat/reaksiya_qoy?${params}`, { method: "PUT" });
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Reaksiya qo‘yilmadi");
      await loadMessages(peer.user_id || 0);
      setMenuMessage(null);
    } catch (e) { setSendError(e.message); }
  };

  const q = query.trim().toLocaleLowerCase("uz");
  const allMuassasalar = directory?.muassasalar || [];
  const scopeList = allMuassasalar.map(m => ({ key: `${m.turi}:${m.muassasa_id}`, ...m }));
  const activeScope = scopeKey === "all" ? null : scopeList.find(m => m.key === scopeKey) || null;
  const scopedMuassasalar = activeScope ? [activeScope] : allMuassasalar;
  const scopedIds = activeScope ? new Set((activeScope.azolar || []).map(a => String(a.user_id))) : null;
  const scopedSuhbatlar = (directory?.suhbatlar || []).filter(x => !scopedIds || scopedIds.has(String(x.user_id)) || x.tashqi);
  const scopeMeta = activeScope ? (KABUTAR_TURI[activeScope.turi] || KABUTAR_TURI.maktab) : null;
  const accent = scopeMeta ? scopeMeta.rang : palette.blue;
  const visibleGroups = (chatDirectory.guruhlar || []).filter(group => {
    if (activeScope && group.manba_turi !== "global") {
      const sameInstitution = String(group.scope_turi || group.manba_turi) === String(activeScope.turi) && String(group.scope_id ?? group.manba_id) === String(activeScope.muassasa_id);
      if (!sameInstitution) return false;
    }
    if (listTab === "personal") return false;
    return !q || String(group.nomi || "").toLocaleLowerCase("uz").includes(q);
  });

  const totalUnread = directory?.jami_oqilmagan || 0;

  return <div className={`kb-panel ${docked ? "h-full flex flex-col" : "min-h-screen"}`} style={{ background: palette.cream }}>
    <div className={`kb-panel-header ${docked ? "px-3 py-2.5" : "px-4 md:px-7 py-4"} flex items-center justify-between gap-3 border-b bg-white shrink-0`} style={{ borderColor: palette.line }}>
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onClose} title={docked ? "Yig‘ish" : "Yopish"} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: palette.sky, color: palette.blue }}>{docked ? "▾" : <ArrowLeft size={18}/>}</button>
        <div className="min-w-0"><div className="text-[10px] font-black uppercase tracking-[.14em]" style={{ color: accent }}>🕊 {activeScope ? `${scopeMeta.ikon} ${activeScope.muassasa} Kabutari` : "Kabutar · barcha muassasalar"}</div>{!docked && <div className="text-lg font-black truncate" style={{ color: palette.ink }}>{activeScope ? `${scopeMeta.nom} — rasmiy aloqa` : title}</div>}</div>
      </div>
      <div className="kb-header-account flex items-center gap-2"><KabutarAccountButton me={directory?.men} apiBase={apiBase} onProfile={() => setAccountView({ page: "profile" })} onSettings={() => setAccountView({ page: "settings" })}/>{totalUnread > 0 && <span className="px-2.5 py-1 rounded-full text-xs font-black text-white shrink-0" style={{ background: palette.red }}>{totalUnread} yangi</span>}</div>
    </div>
    {forwarding && <div className="px-4 py-2 flex items-center justify-between gap-3 text-xs font-bold text-white" style={{ background: palette.teal }}><span><Forward size={14} className="inline mr-1"/>Xabarni uzatish uchun guruh yoki odamni tanlang</span><button onClick={() => setForwarding(null)} className="px-2 py-1 rounded-lg bg-white/20">Bekor qilish</button></div>}
    <div className={docked ? "flex-1 min-h-0 flex flex-col" : "grid md:grid-cols-[340px_1fr] gap-0 md:h-[calc(100vh-73px)]"}>
      <aside className={`bg-white overflow-y-auto ${docked ? (peer ? "hidden" : "flex-1 min-h-0") : `border-r ${peer ? "hidden md:block" : ""}`}`} style={{ borderColor: palette.line }}>
        <div className="p-3 sticky top-0 bg-white z-10 border-b" style={{ borderColor: palette.line }}><div className="relative"><Search size={15} className="absolute left-3 top-2.5" style={{ color: palette.muted }}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Chat, guruh, ism yoki lavozim..." className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: palette.line }}/></div><div className="flex gap-1 mt-2 overflow-x-auto">{[["all","Barchasi"],["groups","Guruhlar"],["personal","Shaxsiy"]].map(([key,label]) => <button key={key} onClick={() => setListTab(key)} className="px-3 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap" style={listTab === key ? { background: accent, color: "#fff" } : { background: palette.sky, color: palette.blue }}>{label}</button>)}</div></div>
        {dirError && <div className="m-3 p-3 rounded-xl text-xs" style={{ background: palette.redBg, color: palette.red }}>{dirError}</div>}
        {!directory && !dirError && <div className="p-6 text-center"><Loader2 className="mx-auto animate-spin" style={{ color: palette.blue }}/></div>}
        {directory && showScopeStrip && scopeList.length > 0 && <div className="p-3 border-b" style={{ borderColor: palette.line, background: "#fff" }}>
          <div className="text-[10px] font-black uppercase tracking-[.12em] mb-1.5" style={{ color: palette.muted }}>Qaysi muassasa Kabutari</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[{ key: "all", turi: null, muassasa: "Hammasi" }, ...scopeList].map(m => { const meta = m.turi ? (KABUTAR_TURI[m.turi] || KABUTAR_TURI.maktab) : { ikon: "🕊", rang: palette.ink, yengil: palette.cream }; const on = scopeKey === m.key; const unread = m.turi ? (m.azolar || []).reduce((sum, a) => sum + Number(a.oqilmagan || 0), 0) : (directory.jami_oqilmagan || 0); return <button key={m.key} type="button" onClick={() => { setScopeKey(m.key); setPeer(null); peerRef.current = null; }} className="shrink-0 rounded-xl border px-2.5 py-1.5 text-left transition" style={on ? { background: meta.rang, borderColor: meta.rang, color: "#fff", transform: "scale(1.04)" } : { background: meta.yengil, borderColor: palette.line, color: palette.ink }} title={m.muassasa}><div className="text-[11px] font-black whitespace-nowrap max-w-[150px] truncate">{meta.ikon} {m.muassasa}{unread > 0 && <span className="ml-1 inline-flex min-w-[16px] h-4 px-1 rounded-full text-[9px] items-center justify-center" style={{ background: on ? "rgba(255,255,255,.25)" : palette.red, color: "#fff" }}>{unread}</span>}</div></button>; })}
          </div>
        </div>}
        {directory && <div className="p-3 border-b" style={{ borderColor: palette.line, background: "#FBFAF7" }}>
          <div className="text-[10px] font-black uppercase tracking-[.12em] mb-1.5" style={{ color: palette.muted }}>KB raqami, nik yoki telefon</div>
          <div className="flex gap-1.5"><input value={idQuery} onChange={e => setIdQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchById()} placeholder="KB-123456 · @nik · +998…" className="min-w-0 flex-1 px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: palette.line }}/><button onClick={searchById} disabled={idBusy} className="px-3 rounded-xl text-sm font-black text-white" style={{ background: palette.blue }}>{idBusy ? "..." : "Top"}</button></div>
          {idError && <div className="mt-1.5 text-[11px] font-bold" style={{ color: palette.red }}>{idError}</div>}
          {idResult && <button onClick={() => { setAccountView({ page: "profile", person: { ...idResult, izoh: idResult.qisqa, rol: "tashqi" } }); setIdResult(null); setIdQuery(""); }} className="mt-2 w-full text-left rounded-xl border p-2.5" style={{ borderColor: palette.green, background: palette.mint }}><div className="text-sm font-black" style={{ color: palette.ink }}>{idResult.full_name} <span className="text-[10px]" style={{ color: palette.green }}>✓ {idResult.kabutar_id}</span></div>{(idResult.rollar || []).map((r, i) => <div key={i} className="text-[11px]" style={{ color: palette.muted }}>{r.rol}{r.muassasa ? ` — ${r.muassasa}` : ""}</div>)}<div className="text-[10px] mt-1 font-black" style={{ color: palette.blue }}>Profilini ko‘rish ›</div></button>}
        </div>}
        {directory && visibleGroups.length > 0 && <div className="border-b" style={{ borderColor: palette.line }}>
          <div className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[.12em]" style={{ color: accent }}>Avtomatik guruhlar</div>
          {visibleGroups.map(group => <button key={`g-${group.id}`} onClick={() => openPeer({ guruh_id: group.id, full_name: group.nomi, izoh: `${group.turi} · rasmiy guruh`, rol: "guruh" })} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50" style={{ background: peer?.guruh_id === group.id ? palette.sky : undefined }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg text-white shrink-0" style={{ background: accent }}>👥</div>
            <div className="min-w-0 flex-1"><div className="text-sm font-black truncate" style={{ color: palette.ink }}>{group.nomi}</div><div className="text-[11px] truncate" style={{ color: palette.muted }}>{preferences.settings.showPreviews ? (group.oxirgi_matn || (group.oxirgi_fayl_turi ? "Media xabar" : "Hali xabar yo‘q")) : "Guruh xabarlari"}</div></div>
            {Number(group.okilmagan_soni || 0) > 0 && <span className="min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black text-white flex items-center justify-center" style={{ background: palette.red }}>{group.okilmagan_soni}</span>}
          </button>)}
        </div>}
        {directory && listTab !== "groups" && (() => { const list = scopedSuhbatlar.filter(x => !q || String(x.full_name).toLocaleLowerCase("uz").includes(q) || String(x.izoh || "").toLocaleLowerCase("uz").includes(q)); if (!list.length) return null; return <div>
          <div className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[.12em]" style={{ color: palette.ink }}>Suhbatlarim</div>
          {list.map(item => <button key={`s-${item.user_id}`} onClick={() => openPeer({ ...item, rol: item.tashqi ? "tashqi" : "suhbat" })} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50" style={{ background: peer?.user_id === item.user_id ? palette.sky : undefined }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: item.tashqi ? "#5A5648" : palette.blue }}>{kabutarInitials(item.full_name)}</div>
            <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><div className="text-sm font-black truncate" style={{ color: palette.ink }}>{item.full_name}</div>{item.oxirgi_xabar_at && <span className="text-[10px] shrink-0" style={{ color: palette.muted }}>{kabutarTime(item.oxirgi_xabar_at)}</span>}</div><div className="text-[11px] truncate" style={{ color: palette.muted }}>{preferences.settings.showPreviews ? `${item.izoh ? item.izoh + " · " : ""}${item.oxirgi_meniki ? "Siz: " : ""}${item.oxirgi_matn || ""}` : "Shaxsiy suhbat"}</div></div>
            {item.oqilmagan > 0 && <span className="min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black text-white flex items-center justify-center" style={{ background: palette.red }}>{item.oqilmagan}</span>}
          </button>)}
        </div>; })()}
        {directory && scopedMuassasalar.map(m => { const groupsHere = KABUTAR_GROUPS.map(([key, label, color]) => [key, label, color, (m.azolar || []).filter(a => a.guruh === key && (!q || String(a.full_name).toLocaleLowerCase("uz").includes(q) || String(a.izoh || "").toLocaleLowerCase("uz").includes(q)))]).filter(g => g[3].length); if (!groupsHere.length) return null; return <div key={`${m.turi}-${m.muassasa_id}`}>
          <div className="px-4 pt-4 pb-1 text-[11px] font-black flex items-center gap-2" style={{ color: (KABUTAR_TURI[m.turi] || KABUTAR_TURI.maktab).rang }}><span>{(KABUTAR_TURI[m.turi] || KABUTAR_TURI.maktab).ikon}</span><span className="truncate">{m.muassasa}</span><span className="text-[10px] font-semibold" style={{ color: palette.muted }}>· {(KABUTAR_TURI[m.turi] || KABUTAR_TURI.maktab).nom} Kabutari</span></div>
          {groupsHere.map(([key, label, color, items]) => <div key={key}>
            <div className="px-4 pt-2 pb-1 text-[10px] font-black uppercase tracking-[.12em] flex items-center justify-between" style={{ color }}>{label}<span style={{ color: palette.muted }}>{items.length}</span></div>
            {items.map(item => <button key={item.user_id} onClick={() => openPeer({ ...item, rol: key })} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50" style={{ background: peer?.user_id === item.user_id ? palette.sky : undefined }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: color }}>{kabutarInitials(item.full_name)}</div>
              <div className="min-w-0 flex-1"><div className="text-sm font-black truncate" style={{ color: palette.ink }}>{item.full_name} <span className="text-[10px] font-semibold" style={{ color: palette.green }}>✓</span></div><div className="text-[11px] truncate" style={{ color: palette.muted }}>{item.izoh}</div></div>
              {item.oqilmagan > 0 && <span className="min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black text-white flex items-center justify-center" style={{ background: palette.red }}>{item.oqilmagan}</span>}
            </button>)}
          </div>)}
        </div>; })}
        {directory && !scopedSuhbatlar.length && !scopedMuassasalar.some(m => (m.azolar || []).length) && <div className="p-6 text-center text-xs" style={{ color: palette.muted }}>Bu muassasada hozircha aloqalar yo‘q — yuqorida ID bo‘yicha toping.</div>}
      </aside>
      <section className={`flex flex-col ${docked ? (peer ? "flex-1 min-h-0" : "hidden") : (peer ? "" : "hidden md:flex")}`} style={{ minHeight: docked ? 0 : 420 }}>
        {!peer && <div className="flex-1 flex items-center justify-center p-8 text-center"><div><div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: palette.sky }}><MessageCircle size={28} style={{ color: palette.blue }}/></div><div className="font-black" style={{ color: palette.ink }}>Suhbatdoshni tanlang</div><p className="text-xs mt-1 max-w-xs" style={{ color: palette.muted }}>Ro‘yxatda muassasalaringiz bo‘yicha rasmiy suhbatdoshlar. Boshqa odamni KB raqami yoki @niki bilan toping. Telefon orqali faqat egasi ruxsat bergan profil topiladi. Xabar yuboruvchining kimligi (ism, lavozim, muassasa) har doim ko‘rinadi.</p></div></div>}
        {peer && <>
          <div className="px-4 py-3 bg-white border-b flex items-center gap-3" style={{ borderColor: palette.line, borderTop: `3px solid ${accent}` }}>
            <button onClick={() => { setPeer(null); peerRef.current = null; }} className={`${docked ? "" : "md:hidden"} w-9 h-9 rounded-xl flex items-center justify-center`} style={{ background: palette.sky, color: palette.blue }}><ArrowLeft size={16}/></button>
            <button type="button" className="kb-peer-profile" onClick={() => setAccountView({ page: "profile", person: peer })} aria-label={`${peer.full_name} profilini ko‘rish`}><span className="kb-avatar" style={{ background: peer.rol === "tashqi" ? "#5A5648" : (KABUTAR_GROUPS.find(g => g[0] === peer.rol) || [])[2] || palette.blue }}>{kabutarInitials(peer.full_name)}</span><span><strong>{peer.full_name}</strong><small>{peer.guruh_id ? "Guruh ma’lumotini ko‘rish" : "Profilini ko‘rish"}{peer.izoh ? ` · ${peer.izoh}` : ""}</small></span></button>
          </div>
          <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ background: "linear-gradient(180deg,#F7F5F0,#FBFAF7)" }}>
            {!messages.length && <div className="text-center text-xs py-10" style={{ color: palette.muted }}>Hali xabar yo‘q — birinchisini yozing.</div>}
            {messages.map(m => <div key={m.id} className={`relative flex ${m.meniki ? "justify-end" : "justify-start"}`}>
              <div onDoubleClick={() => setReplyTo(m)} onContextMenu={event => { event.preventDefault(); setMenuMessage(menuMessage?.id === m.id ? null : m); }} className="max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm cursor-context-menu" style={m.meniki ? { background: palette.blue, color: "#fff", borderBottomRightRadius: 6 } : { background: "#fff", color: palette.ink, borderBottomLeftRadius: 6, border: `1px solid ${palette.line}` }}>
                {m.javob_xabar_id && <div className="mb-1.5 pl-2 border-l-2 text-[11px] opacity-75"><b>{m.javob_yuboruvchi_ismi || "Xabar"}</b><div className="truncate">{m.javob_matn_qisqa || "Media"}</div></div>}
                {m.matn && !isPhotoMessage(m) && <div className="whitespace-pre-wrap break-words" style={{ fontSize: preferences.settings.textSize, lineHeight: 1.55 }}>{m.matn}</div>}
                {m.fayl_turi === "audio" && <audio controls preload="none" className="mt-1 w-56 max-w-full" src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/>} 
                {m.fayl_turi === "video" && <video controls preload="metadata" className="mt-1 w-64 max-w-full rounded-lg" src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/>} 
                {m.fayl_turi === "video_doira" && <video controls playsInline preload="metadata" className="mt-1 w-48 h-48 max-w-full rounded-full object-cover border-4 border-white/40" src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/>} 
                {isPhotoMessage(m) && <div className="mt-1"><a href={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`} target="_blank" rel="noreferrer"><img loading="lazy" decoding="async" alt={m.fayl_nomi || "Yuborilgan rasm"} className="max-w-full max-h-80 rounded-xl object-contain" src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/></a>{m.matn && <div className="mt-2 whitespace-pre-wrap break-words" style={{ fontSize: preferences.settings.textSize, lineHeight: 1.55 }}>{m.matn}</div>}</div>}
                {m.fayl_turi === "hujjat" && !isPhotoMessage(m) && <a href={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-2 text-xs font-black underline"><Download size={14}/> {m.fayl_nomi || "Hujjat"}{m.fayl_hajmi_kb ? ` · ${m.fayl_hajmi_kb} KB` : ""}</a>}
                {(m.reaksiyalar || []).length > 0 && <div className="flex flex-wrap gap-1 mt-1">{m.reaksiyalar.map(item => <span key={item.emoji} className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: m.meniki ? "rgba(255,255,255,.18)" : palette.sky }}>{item.emoji} {item.soni}</span>)}</div>}
                <div className="mt-1 text-[10px] text-right" style={{ opacity: .75 }}>{m.tahrirlangan ? "tahrirlangan · " : ""}{kabutarTime(m.yaratilgan_at)}{m.meniki ? (peerSeenId && m.id <= peerSeenId ? " · ✓✓ ko‘rildi" : " · ✓") : ""}</div>
              </div>
              {menuMessage?.id === m.id && <div className={`absolute z-20 ${m.meniki ? "right-2" : "left-2"} top-full mt-1 p-2 rounded-2xl border bg-white shadow-xl min-w-[210px]`} style={{ borderColor: palette.line, color: palette.ink }}>
                <div className="flex gap-1 pb-2 mb-1 border-b" style={{ borderColor: palette.line }}>{["❤️","👍","🔥","👏","😁","🤔"].map(emoji => <button key={emoji} onClick={() => reactTo(m, emoji)} className="w-7 h-7 rounded-lg hover:bg-slate-100">{emoji}</button>)}</div>
                <button onClick={() => { setReplyTo(m); setMenuMessage(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"><Reply size={14}/>Javob berish</button>
                <button onClick={() => { navigator.clipboard?.writeText(m.matn || ""); setMenuMessage(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"><Copy size={14}/>Nusxalash</button>
                <button onClick={() => { setForwarding(m); setMenuMessage(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"><Forward size={14}/>Boshqaga uzatish</button>
                {m.meniki && m.matn && !m.fayl_turi && <button onClick={() => { setEditing(m); setText(m.matn); setMenuMessage(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"><Pencil size={14}/>O‘zgartirish</button>}
                {m.meniki && <button onClick={() => removeMessage(m)} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold" style={{ color: palette.red }}><Trash2 size={14}/>O‘chirish</button>}
              </div>}
            </div>)}
          </div>
          {(sendError || messageError) && <div className="mx-4 mb-2 p-2 rounded-xl text-xs" style={{ background: palette.redBg, color: palette.red }}>{sendError || messageError}</div>}
          {(replyTo || editing) && <div className="px-4 py-2 bg-white border-t flex items-center justify-between gap-2 text-xs" style={{ borderColor: palette.line }}><div className="truncate" style={{ color: palette.blue }}><b>{editing ? "O‘zgartirilmoqda" : "Javob"}:</b> {(editing || replyTo)?.matn || "Media xabar"}</div><button onClick={() => { setReplyTo(null); setEditing(null); if (editing) setText(""); }} className="font-black">✕</button></div>}
          <div className="kb-composer p-3 bg-white border-t flex items-end gap-2" style={{ borderColor: palette.line }}>
            {active && <KabutarMediaComposer key={`${apiBase}:${token}:${conversationKey}`} conversationKey={conversationKey} conversationLabel={peer.full_name} disabled={sending || Boolean(editing)} onSend={send} onBusyChange={setMediaBusy}/>}
            <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (!mediaBusy && !sending && e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing && preferences.settings.enterToSend) { e.preventDefault(); send(); } }} rows={1} placeholder={preferences.settings.enterToSend ? "Xabar yozing… Enter — yuborish" : "Xabar yozing…"} aria-label="Xabar matni" className="flex-1 resize-none px-3 py-2.5 rounded-xl border text-sm outline-none max-h-32" style={{ borderColor: palette.line }}/>
            <button onClick={() => send()} disabled={sending || mediaBusy || !text.trim()} className="kb-send-button h-10 px-4 rounded-xl text-sm font-black text-white shrink-0 disabled:opacity-50" style={{ background: palette.blue }}>{sending ? "..." : "Yuborish"}</button>
          </div>
        </>}
      </section>
    </div>
    {accountView && <KabutarAccount token={token} apiBase={apiBase} directory={directory} initialPage={accountView.page} person={accountView.person || null} preferences={preferences} onClose={() => setAccountView(null)} onOpenContact={item => { setAccountView(null); openPeer(item); }} onMeUpdated={card => setDirectory(current => current ? { ...current, men: { ...current.men, ...card } } : { men: card, muassasalar: [], suhbatlar: [] })}/>}
  </div>;
}
