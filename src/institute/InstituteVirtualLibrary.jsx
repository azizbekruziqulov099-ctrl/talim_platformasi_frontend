import {uiText as __kbUi, interfaceLocaleTag as __kbLocaleTag} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen, Download, Eye, File, FileArchive, FileImage, FileText, Folder,
  FolderPlus, Library, Loader2, LockKeyhole, Plus, Search, Send, Settings2,
  ShieldCheck, Trash2, Upload, X,
} from "lucide-react";
import "./institute-library.css";

const TONES = ["#175A7A", "#0D7A77", "#694EA0", "#A86714", "#9A4C5E", "#39705B"];
const endpoint = (apiBase, path) => `${apiBase}/api/institut/v23/kutubxona${path}`;

function niceSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function iconFor(document) {
  const name = String(document?.fayl_nomi || "").toLowerCase();
  if (/\.(png|jpe?g|webp)$/.test(name)) return FileImage;
  if (/\.zip$/.test(name)) return FileArchive;
  if (/\.(pdf|docx?|txt|rtf)$/.test(name)) return FileText;
  return File;
}

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, options);
  let data = {};
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : data.detail?.message || `Server xatosi (${response.status})`);
  return data;
}

function Modal({ title, children, onClose }) {
  useKbInterfaceLocale();
  return <div className="ivl-modal" role="dialog" aria-modal="true" aria-label={title}>
    <div className="ivl-modal-card">
      <div className="ivl-modal-title"><div><b>{title}</b></div><button type="button" onClick={onClose} aria-label={__kbUi("Yopish")}><X size={19} /></button></div>
      {children}
    </div>
  </div>;
}

function DocumentCard({ item, apiBase, token, rights, onChanged }) {
  useKbInterfaceLocale();
  const Icon = iconFor(item); const [busy, setBusy] = useState(false);
  const url = action => endpoint(apiBase, `/hujjat/${item.id}/${action}?token=${encodeURIComponent(token)}`);
  const previewable = /pdf|image|text/i.test(item.mime_type || "") || /\.(pdf|png|jpe?g|webp|txt)$/i.test(item.fayl_nomi || "");
  const share = async () => {
    setBusy(true);
    try {
      const response = await fetch(url("yuklash"));
      if (!response.ok) throw new Error("Fayl olinmadi");
      const blob = await response.blob(); const file = new window.File([blob], item.fayl_nomi, { type: item.mime_type || blob.type });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ title: item.nomi, files: [file] });
      else {
        const objectUrl = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = objectUrl; a.download = item.fayl_nomi; a.click();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
        window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(`${item.nomi} fayli yuklandi. Telegramga shu faylni biriktiring.`)}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) { alert(error.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!confirm(__kbUi(`“${item.nomi}” hujjatini arxivlaysizmi?`))) return;
    setBusy(true);
    try { await jsonRequest(endpoint(apiBase, `/hujjat/${item.id}?token=${encodeURIComponent(token)}`), { method: "DELETE" }); onChanged(); }
    catch (error) { alert(error.message); } finally { setBusy(false); }
  };
  return <article className="ivl-document">
    <div className="ivl-document-icon"><Icon size={22} /></div>
    <div className="ivl-document-body"><b title={item.nomi}>{item.nomi}</b><small>{item.fayl_nomi} · {__kbUi(niceSize(item.hajm))}</small><small>{item.yuklovchi || __kbUi("Xodim")}{item.yaratilgan_at ? __kbUi(` · ${new Date(item.yaratilgan_at).toLocaleDateString(__kbLocaleTag())}`) : __kbUi("")}</small></div>
    <div className="ivl-document-actions">
      {previewable && <a href={url("korish")} target="_blank" rel="noreferrer" title={__kbUi("Ko‘rish")}><Eye size={16} /></a>}
      <a href={url("yuklash")} title={__kbUi("Yuklab olish")}><Download size={16} /></a>
      <button type="button" onClick={share} disabled={busy} title={__kbUi("Yuborish")}><Send size={16} /></button>
      {(rights.boshqarish || rights.joylash) && <button type="button" onClick={remove} disabled={busy} title={__kbUi("Arxivlash")}><Trash2 size={16} /></button>}
    </div>
  </article>;
}

function UploadModal({ folder, apiBase, token, onClose, onDone }) {
  useKbInterfaceLocale();
  const inputRef = useRef(null); const [form, setForm] = useState({ nomi: "", izoh: "", teglar: "" }); const [file, setFile] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const upload = async () => {
    if (!file) return setError("Faylni tanlang"); setBusy(true); setError("");
    try {
      const body = new FormData(); body.append("token", token); body.append("papka_id", folder.id); body.append("nomi", form.nomi); body.append("izoh", form.izoh); body.append("teglar", form.teglar); body.append("fayl", file);
      await jsonRequest(endpoint(apiBase, "/hujjat"), { method: "POST", body }); onDone(); onClose();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <Modal title={__kbUi(`“${folder.nomi}” papkasiga hujjat`)} onClose={onClose}>
    <button type="button" className="ivl-drop" onClick={() => inputRef.current?.click()}><Upload size={27} /><b>{file ? file.name : __kbUi("PDF, Word, Excel, PPT yoki rasm tanlang")}</b><small>{__kbUi("Eng ko‘pi 30 MB")}</small></button>
    <input ref={inputRef} hidden type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv,.jpg,.jpeg,.png,.webp,.zip" onChange={e => setFile(e.target.files?.[0] || null)} />
    <label>{__kbUi("Ko‘rinadigan nom")}<input value={form.nomi} onChange={e => setForm({ ...form, nomi: e.target.value })} placeholder={file?.name || __kbUi("Hujjat nomi")} /></label>
    <label>{__kbUi("Izoh")}<textarea value={form.izoh} onChange={e => setForm({ ...form, izoh: e.target.value })} placeholder={__kbUi("Hujjat haqida qisqa ma’lumot")} /></label>
    <label>{__kbUi("Teglar")}<input value={form.teglar} onChange={e => setForm({ ...form, teglar: e.target.value })} placeholder={__kbUi("bitiruv ishi, 2026, pedagogika")} /></label>
    {error && <div className="ivl-error">{__kbUi(error)}</div>}
    <button type="button" className="ivl-primary" onClick={upload} disabled={busy}>{busy ? <Loader2 className="animate-spin" size={17} /> : <Upload size={17} />}{__kbUi(" Yuklash")}</button>
  </Modal>;
}

function CreateModal({ type, parent, apiBase, token, universityId, structure, onClose, onDone }) {
  useKbInterfaceLocale();
  const [form, setForm] = useState({ nomi: "", izoh: "", rang: TONES[0], fakultet_id: "", kafedra_id: "", yil: new Date().getFullYear() }); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const faculties = structure?.fakultetlar || []; const departments = faculties.flatMap(f => (f.kafedralar || []).map(d => ({ ...d, fakultet_id: f.id })));
  const save = async () => {
    if (!form.nomi.trim()) return setError("Nomini kiriting"); setBusy(true); setError("");
    const payload = type === "javon" ? { token, universitet_id: universityId, nomi: form.nomi, izoh: form.izoh, rang: form.rang, fakultet_id: form.fakultet_id ? Number(form.fakultet_id) : null, kafedra_id: form.kafedra_id ? Number(form.kafedra_id) : null }
      : type === "polka" ? { token, javon_id: parent.id, nomi: form.nomi, izoh: form.izoh }
        : { token, polka_id: parent.id, nomi: form.nomi, izoh: form.izoh, yil: form.yil ? Number(form.yil) : null };
    try { await jsonRequest(endpoint(apiBase, `/${type}`), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); onDone(); onClose(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const titles = { javon: "Yangi javon", polka: `“${parent?.nomi}” uchun polka`, papka: `“${parent?.nomi}” uchun papka` };
  return <Modal title={titles[type]} onClose={onClose}>
    <label>{__kbUi("Nomi")}<input autoFocus value={form.nomi} onChange={e => setForm({ ...form, nomi: e.target.value })} placeholder={type === "javon" ? __kbUi("Masalan: Bitiruv ishlari") : type === "polka" ? __kbUi("Masalan: 2025–2026 o‘quv yili") : __kbUi("Masalan: Boshlang‘ich ta’lim")} /></label>
    <label>{__kbUi("Izoh")}<textarea value={form.izoh} onChange={e => setForm({ ...form, izoh: e.target.value })} placeholder={__kbUi("Bu yerda nimalar saqlanishini yozing")} /></label>
    {type === "javon" && <><div className="ivl-grid"><label>{__kbUi("Fakultet")}<select value={form.fakultet_id} onChange={e => setForm({ ...form, fakultet_id: e.target.value, kafedra_id: "" })}><option value="">{__kbUi("Butun institut")}</option>{faculties.map(f => <option key={f.id} value={f.id}>{f.nomi}</option>)}</select></label><label>{__kbUi("Kafedra")}<select value={form.kafedra_id} onChange={e => setForm({ ...form, kafedra_id: e.target.value })}><option value="">{__kbUi("Barcha kafedra")}</option>{departments.filter(d => !form.fakultet_id || String(d.fakultet_id) === form.fakultet_id).map(d => <option key={d.id} value={d.id}>{d.nomi}</option>)}</select></label></div><div className="ivl-colors">{TONES.map(t => <button key={t} type="button" onClick={() => setForm({ ...form, rang: t })} className={form.rang === t ? "active" : ""} style={{ background: t }} aria-label={__kbUi(`Rang ${t}`)} />)}</div></>}
    {type === "papka" && <label>{__kbUi("Yil")}<input type="number" min="1900" max="2200" value={form.yil} onChange={e => setForm({ ...form, yil: e.target.value })} /></label>}
    {error && <div className="ivl-error">{__kbUi(error)}</div>}<button type="button" className="ivl-primary" onClick={save} disabled={busy}>{busy ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}{__kbUi(" Saqlash")}</button>
  </Modal>;
}

function PermissionModal({ apiBase, token, universityId, structure, staff, onClose }) {
  useKbInterfaceLocale();
  const faculties = structure?.fakultetlar || []; const departments = faculties.flatMap(f => (f.kafedralar || []).map(d => ({ ...d, fakultet_id: f.id })));
  const [form, setForm] = useState({ user_id: "", fakultet_id: "", kafedra_id: "", korish: true, yuklash: true, joylash: false, boshqarish: false }); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const save = async () => { setBusy(true); setMessage(""); try { await jsonRequest(endpoint(apiBase, "/ruxsat"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, universitet_id: universityId, user_id: Number(form.user_id), fakultet_id: form.fakultet_id ? Number(form.fakultet_id) : null, kafedra_id: form.kafedra_id ? Number(form.kafedra_id) : null, korish: form.korish, yuklash: form.yuklash, joylash: form.joylash, boshqarish: form.boshqarish }) }); setMessage("Ruxsat saqlandi"); } catch (e) { setMessage(e.message); } finally { setBusy(false); } };
  return <Modal title={__kbUi("Kutubxona ruxsatlari")} onClose={onClose}>
    <p className="ivl-note"><ShieldCheck size={17} />{__kbUi(" Admin institut bo‘yicha, kafedra mudiri esa o‘z kafedrasi bo‘yicha vakolat beradi.")}</p>
    <label>{__kbUi("O‘qituvchi")}<select value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })}><option value="">{__kbUi("Tanlang")}</option>{staff.filter(x => x.rol === "professor_oqituvchi" || x.rol === "tyutor").map(x => <option key={x.user_id} value={x.user_id}>{x.full_name} · {x.kafedra_nomi || x.fakultet_nomi || __kbUi("Institut")}</option>)}</select></label>
    <div className="ivl-grid"><label>{__kbUi("Fakultet")}<select value={form.fakultet_id} onChange={e => setForm({ ...form, fakultet_id: e.target.value, kafedra_id: "" })}><option value="">{__kbUi("Butun institut")}</option>{faculties.map(f => <option key={f.id} value={f.id}>{f.nomi}</option>)}</select></label><label>{__kbUi("Kafedra")}<select value={form.kafedra_id} onChange={e => setForm({ ...form, kafedra_id: e.target.value })}><option value="">{__kbUi("Barcha kafedra")}</option>{departments.filter(d => !form.fakultet_id || String(d.fakultet_id) === form.fakultet_id).map(d => <option key={d.id} value={d.id}>{d.nomi}</option>)}</select></label></div>
    <div className="ivl-checks">{[["korish", "Ko‘rish"], ["yuklash", "Yuklab olish"], ["joylash", "Hujjat joylash"], ["boshqarish", "Javon boshqarish"]].map(([key, label]) => <label key={key}><input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />{__kbUi(label)}</label>)}</div>
    {message && <div className="ivl-note">{message}</div>}<button className="ivl-primary" type="button" disabled={busy || !form.user_id} onClick={save}>{busy ? <Loader2 className="animate-spin" size={17} /> : <ShieldCheck size={17} />}{__kbUi(" Ruxsatni saqlash")}</button>
  </Modal>;
}

export default function InstituteVirtualLibrary({ apiBase, token, universityId, structure, staff = [], permissions = {} }) {
  useKbInterfaceLocale();
  const [data, setData] = useState({ javonlar: [], jami: 0 }); const [query, setQuery] = useState(""); const [appliedQuery, setAppliedQuery] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [modal, setModal] = useState(null);
  const load = useCallback(async () => { setLoading(true); setError(""); try { setData(await jsonRequest(endpoint(apiBase, `/xona?token=${encodeURIComponent(token)}&universitet_id=${universityId}&q=${encodeURIComponent(appliedQuery)}`))); } catch (e) { setError(e.message); } finally { setLoading(false); } }, [apiBase, token, universityId, appliedQuery]);
  useEffect(() => { load(); }, [load]);
  const manager = Boolean(permissions.super_admin || permissions.admin_boshqarish || permissions.xodim_boshqarish || data.javonlar.some(x => x.ruxsatlar?.boshqarish));
  const documents = useMemo(() => data.javonlar.flatMap(c => c.polkalar.flatMap(s => s.papkalar.flatMap(f => f.hujjatlar))), [data]);
  const openDocument = documents.length ? documents[0] : null;
  return <section className="ivl-room">
    <div className="ivl-hero"><div><span><Library size={17} />{__kbUi(" RAQAMLI FOND")}</span><h2>{__kbUi("Virtual hujjatlar kutubxonasi")}</h2><p>{__kbUi("Bitiruv ishlari, metodik qo‘llanmalar, kafedra hujjatlari va kitoblar — o‘z javoni, polkasi va papkasida.")}</p></div><div className="ivl-stats"><b>{data.javonlar.length}<small>{__kbUi("javon")}</small></b><b>{documents.length}<small>{__kbUi("hujjat")}</small></b></div></div>
    <div className="ivl-toolbar"><form onSubmit={e => { e.preventDefault(); setAppliedQuery(query); }}><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={__kbUi("Hujjat, kitob yoki bitiruv ishini izlash")} /><button>{__kbUi("Izlash")}</button></form><div>{manager && <button type="button" onClick={() => setModal({ type: "ruxsat" })}><Settings2 size={17} />{__kbUi(" Ruxsatlar")}</button>}{manager && <button type="button" className="primary" onClick={() => setModal({ type: "javon" })}><Plus size={17} />{__kbUi(" Yangi javon")}</button>}</div></div>
    {error && <div className="ivl-error">{__kbUi(error)}</div>}
    {loading ? <div className="ivl-loading"><Loader2 className="animate-spin" />{__kbUi(" Kutubxona ochilmoqda…")}</div> : !data.javonlar.length ? <div className="ivl-empty"><BookOpen size={42} /><h3>{__kbUi("Hali javon yo‘q")}</h3><p>{__kbUi("Administrator yoki kafedra mudiri birinchi javonni yaratadi.")}</p>{manager && <button className="ivl-primary" onClick={() => setModal({ type: "javon" })}><Plus size={17} />{__kbUi(" Birinchi javonni yaratish")}</button>}</div> : <div className="ivl-cabinets">{data.javonlar.map(cabinet => <article className="ivl-cabinet" key={cabinet.id} style={{ "--cabinet": cabinet.rang || TONES[0] }}><header><div className="ivl-spine"><span>{cabinet.nomi}</span></div><div><h3>{cabinet.nomi}</h3><p>{cabinet.izoh || __kbUi("Raqamli hujjatlar javoni")}</p></div>{cabinet.ruxsatlar?.boshqarish && <button type="button" onClick={() => setModal({ type: "polka", parent: cabinet })}><Plus size={16} />{__kbUi(" Polka")}</button>}</header><div className="ivl-shelves">{cabinet.polkalar.map(shelf => <section className="ivl-shelf" key={shelf.id}><div className="ivl-shelf-label"><span>{shelf.nomi}</span><small>{shelf.izoh || __kbUi("Hujjatlar polkasi")}</small></div><div className="ivl-folders">{shelf.papkalar.map(folder => <details className="ivl-folder" key={folder.id}><summary><Folder size={20} fill="currentColor" /><span><b>{folder.nomi}</b><small>{folder.yil || __kbUi("")} · {folder.hujjatlar.length}{__kbUi(" hujjat")}</small></span><i>{folder.hujjatlar.length}</i></summary><div className="ivl-folder-content">{!folder.hujjatlar.length && <p className="ivl-folder-empty">{__kbUi("Bu papka bo‘sh. Ruxsatingiz bo‘lsa hujjat joylang.")}</p>}{folder.hujjatlar.map(item => <DocumentCard key={item.id} item={item} apiBase={apiBase} token={token} rights={cabinet.ruxsatlar} onChanged={load} />)}{cabinet.ruxsatlar?.joylash && <button type="button" className="ivl-add-document" onClick={() => setModal({ type: "upload", parent: folder })}><Upload size={16} />{__kbUi(" Hujjat joylash")}</button>}</div></details>)}{cabinet.ruxsatlar?.boshqarish && <button type="button" className="ivl-new-folder" onClick={() => setModal({ type: "papka", parent: shelf })}><FolderPlus size={19} /><span>{__kbUi("Yangi papka")}</span></button>}</div></section>)}{!cabinet.polkalar.length && <div className="ivl-no-shelf"><LockKeyhole size={24} /><span>{__kbUi("Javon tayyor. Birinchi polkani qo‘shing.")}</span></div>}</div></article>)}</div>}
    {modal?.type === "upload" && <UploadModal folder={modal.parent} apiBase={apiBase} token={token} onClose={() => setModal(null)} onDone={load} />}
    {["javon", "polka", "papka"].includes(modal?.type) && <CreateModal type={modal.type} parent={modal.parent} apiBase={apiBase} token={token} universityId={universityId} structure={structure} onClose={() => setModal(null)} onDone={load} />}
    {modal?.type === "ruxsat" && <PermissionModal apiBase={apiBase} token={token} universityId={universityId} structure={structure} staff={staff} onClose={() => setModal(null)} />}
  </section>;
}
