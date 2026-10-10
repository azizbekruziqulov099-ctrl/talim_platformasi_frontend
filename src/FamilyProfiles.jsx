import React, { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { workspaceRequest } from "../workspace/kabutarWorkspaceClient.js";
import {
  AGE_GROUPS, FAMILY_MAX, GRADES, KID_AGES, PROFILE_TYPES,
  ageGroupFor, profileBody, profileFormError, profileSummary,
} from "./familyProfiles.js";
import "./family-profiles.css";

const EMPTY_FORM = { name: "", role: "bogcha", age: 3, ageGroup: "", grade: "" };
const TYPE = Object.fromEntries(PROFILE_TYPES.map((t) => [t.id, t]));

function formFromProfile(p) {
  return {
    name: p.name || "",
    role: p.role,
    age: p.age || "",
    ageGroup: p.role === "bogcha" && p.age_group && p.age_group !== ageGroupFor(p.age) ? p.age_group : "",
    grade: p.grade || "",
  };
}

/**
 * «Kim o‘rganadi?» — bitta akkaunt ichidagi 10 tagacha profil.
 * ownerToken bilan ishlaydi: ro'yxat, qo'shish, yosh/sinfni sozlash, o'chirish, profilga kirish.
 */
export default function FamilyProfiles({ apiBase, ownerToken, onEnter, onOwner, onLogout, onClose, closable = true }) {
  useKbInterfaceLocale();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [editing, setEditing] = useState(null);   // null | "new" | profile user_id
  const [manage, setManage] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const nameRef = useRef(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await workspaceRequest(apiBase, "/auth/profiles", ownerToken);
      setData(result);
      if (result && !result.is_profile && result.profiles.length === 0) { setEditing("new"); setForm(EMPTY_FORM); }
    } catch (err) {
      if (err.status === 404) setError("Server hali yangilanmagan: profillar bo‘limi backendda yo‘q.");
      else setError(err.message);
    }
  }, [apiBase, ownerToken]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (editing !== null) setTimeout(() => nameRef.current?.focus(), 30); }, [editing]);
  useEffect(() => {
    if (!closable) return undefined;
    const key = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [closable, onClose]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function save(event) {
    event.preventDefault();
    const problem = profileFormError(form);
    if (problem) { setError(problem); return; }
    setBusy("save"); setError("");
    try {
      const body = profileBody(form);
      const result = editing === "new"
        ? await workspaceRequest(apiBase, "/auth/profiles", ownerToken, { method: "POST", body })
        : await workspaceRequest(apiBase, `/auth/profiles/${editing}`, ownerToken, { method: "PATCH", body });
      setData(result); setEditing(null); setForm(EMPTY_FORM);
    } catch (err) { setError(err.message); } finally { setBusy(""); }
  }

  async function remove(profile) {
    if (!window.confirm(__kbUi(`«${profile.name}» profili ro‘yxatdan olinsinmi? Uning natijalari bazada saqlanib qoladi.`))) return;
    setBusy(`del:${profile.user_id}`); setError("");
    try {
      setData(await workspaceRequest(apiBase, `/auth/profiles/${profile.user_id}`, ownerToken, { method: "DELETE" }));
      if (editing === profile.user_id) setEditing(null);
    } catch (err) { setError(err.message); } finally { setBusy(""); }
  }

  async function enter(profile) {
    if (manage) { setEditing(profile.user_id); setForm(formFromProfile(profile)); return; }
    setBusy(`in:${profile.user_id}`); setError("");
    try {
      const result = await workspaceRequest(apiBase, `/auth/profiles/${profile.user_id}/enter`, ownerToken, { method: "POST", body: {} });
      if (!result?.token) throw new Error("Profilga kirish tokeni olinmadi. Qayta urinib ko‘ring.");
      onEnter?.(result.token, result.profile || profile);
    } catch (err) { setError(err.status === 401 ? "Asosiy akkaunt sessiyasi tugagan. Qaytadan kiring." : err.message); setBusy(""); }
  }

  const profiles = data?.profiles || [];
  const left = data ? (data.left ?? FAMILY_MAX - profiles.length) : 0;
  const owner = data?.owner;
  const editingProfile = typeof editing === "number" ? profiles.find((p) => p.user_id === editing) : null;

  return (
    <div className="kb-family-overlay" role="dialog" aria-modal="true" aria-labelledby="kb-family-title">
      <div className="kb-family-sheet">
        <header className="kb-family-head">
          <div>
            <h2 id="kb-family-title">{__kbUi(editing !== null ? (editing === "new" ? "Yangi profil" : "Profil sozlamalari") : "Kim o‘rganadi?")}</h2>
            {editing === null && owner && <p>{__kbUi(`${owner.name || "Akkaunt"} ichida ${profiles.length} / ${data?.max || FAMILY_MAX} profil`)}</p>}
          </div>
          {closable && <button type="button" className="kb-family-icon" onClick={onClose} aria-label={__kbUi("Yopish")}><X size={18} /></button>}
        </header>

        {error && <p className="kb-family-error" role="alert">{__kbUi(error)}</p>}

        {!data && !error && <p className="kb-family-loading" role="status"><LoaderCircle size={18} className="animate-spin" /> {__kbUi("Profillar yuklanmoqda…")}</p>}

        {data?.is_profile && (
          <p className="kb-family-note">{__kbUi(`Bu — ${owner?.name || "asosiy akkaunt"} ichidagi profil. Profillarni asosiy akkauntdan boshqaring.`)}</p>
        )}

        {data && !data.is_profile && editing === null && (
          <>
            <div className="kb-family-grid">
              {owner && onOwner && (
                <button type="button" className="kb-family-tile owner" onClick={onOwner} disabled={Boolean(busy) || manage}>
                  <span className="kb-family-face">{(owner.name || "?").trim().slice(0, 1).toUpperCase()}</span>
                  <strong>{owner.name || __kbUi("Asosiy akkaunt")}</strong>
                  <small>{__kbUi(owner.is_admin ? "Admin (asosiy)" : "Asosiy akkaunt")}</small>
                </button>
              )}
              {profiles.map((p) => {
                const t = TYPE[p.role] || TYPE.oquvchi;
                const loading = busy === `in:${p.user_id}`;
                return (
                  <div key={p.user_id} className={`kb-family-cell ${manage ? "managing" : ""}`}>
                    <button type="button" className={`kb-family-tile role-${p.role}`} onClick={() => enter(p)} disabled={Boolean(busy)}
                      aria-label={__kbUi(manage ? `${p.name} profilini sozlash` : `${p.name} profiliga kirish`)}>
                      <span className="kb-family-face">
                        {p.has_photo ? <img src={`${apiBase}/api/profil_rasm/${p.user_id}`} alt="" /> : t.icon}
                        {loading && <LoaderCircle size={22} className="animate-spin kb-family-spin" />}
                      </span>
                      <strong>{p.name}</strong>
                      <small>{__kbUi(`${t.label} · ${profileSummary(p)}`)}</small>
                      {manage && <span className="kb-family-edit-mark"><Pencil size={13} /></span>}
                    </button>
                    {manage && (
                      <button type="button" className="kb-family-del" onClick={() => remove(p)} disabled={Boolean(busy)} aria-label={__kbUi(`${p.name} profilini o‘chirish`)}>
                        {busy === `del:${p.user_id}` ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    )}
                  </div>
                );
              })}
              {left > 0 && !manage && (
                <button type="button" className="kb-family-tile add" onClick={() => { setEditing("new"); setForm(EMPTY_FORM); setError(""); }} disabled={Boolean(busy)}>
                  <span className="kb-family-face"><Plus size={28} /></span>
                  <strong>{__kbUi("Profil qo‘shish")}</strong>
                  <small>{__kbUi(`yana ${left} ta`)}</small>
                </button>
              )}
            </div>

            {owner?.is_admin && (
              <p className="kb-family-note">{__kbUi("Sinov uchun: «Bog‘cha bolasi» profilini oching, yoshini tanlang va kiring — bola ko‘radigan AI mavzular, darslar va testlar xuddi bolanikidek ochiladi. Yoshni almashtirib, boshqa guruhni tekshiring.")}</p>
            )}

            <footer className="kb-family-foot">
              {profiles.length > 0 && (
                <button type="button" className="kb-family-text" onClick={() => setManage((m) => !m)}>
                  {__kbUi(manage ? "Tayyor" : "Profillarni sozlash")}
                </button>
              )}
              {onLogout && (
                <button type="button" className="kb-family-text quiet" onClick={onLogout} disabled={Boolean(busy)}>
                  <LogOut size={14} /> {__kbUi("Akkauntdan chiqish")}
                </button>
              )}
            </footer>
          </>
        )}

        {data && !data.is_profile && editing !== null && (
          <form className="kb-family-form" onSubmit={save}>
            <label>
              <span>{__kbUi("Ismi")}</span>
              <input ref={nameRef} value={form.name} maxLength={80} onChange={(e) => set({ name: e.target.value })} placeholder={__kbUi("Masalan: Muhammadali")} />
            </label>

            <fieldset>
              <legend>{__kbUi("Kim uchun")}</legend>
              <div className="kb-family-types">
                {PROFILE_TYPES.map((t) => (
                  <button key={t.id} type="button" className={form.role === t.id ? "on" : ""} aria-pressed={form.role === t.id}
                    onClick={() => set({ role: t.id, age: t.id === "bogcha" ? (form.age && form.age <= 7 ? form.age : 3) : "", ageGroup: "", grade: t.id === "oquvchi" ? (form.grade || 1) : "" })}>
                    <span>{t.icon}</span><b>{__kbUi(t.label)}</b><small>{__kbUi(t.hint)}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            {form.role === "bogcha" && (
              <fieldset>
                <legend>{__kbUi("Yoshi")}</legend>
                <div className="kb-family-ages">
                  {KID_AGES.map((a) => (
                    <button key={a} type="button" className={Number(form.age) === a ? "on" : ""} aria-pressed={Number(form.age) === a} onClick={() => set({ age: a, ageGroup: "" })}>
                      <b>{a}</b><small>{__kbUi("yosh")}</small>
                    </button>
                  ))}
                </div>
                <p className="kb-family-hint">{__kbUi(`Darslar guruhi: ${form.ageGroup || ageGroupFor(form.age) || "—"}`)}</p>
                <details className="kb-family-more">
                  <summary>{__kbUi("Guruhni qo‘lda tanlash")}</summary>
                  <div className="kb-family-groups">
                    {AGE_GROUPS.map((g) => (
                      <button key={g} type="button" className={(form.ageGroup || ageGroupFor(form.age)) === g ? "on" : ""} onClick={() => set({ ageGroup: g === ageGroupFor(form.age) ? "" : g })}>{__kbUi(g)}</button>
                    ))}
                  </div>
                </details>
              </fieldset>
            )}

            {form.role === "oquvchi" && (
              <fieldset>
                <legend>{__kbUi("Sinfi")}</legend>
                <div className="kb-family-ages grades">
                  {GRADES.map((g) => (
                    <button key={g} type="button" className={Number(form.grade) === g ? "on" : ""} aria-pressed={Number(form.grade) === g} onClick={() => set({ grade: g })}><b>{g}</b></button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="kb-family-actions">
              <button type="button" className="kb-family-text" onClick={() => { setEditing(null); setError(""); }} disabled={busy === "save" || (editing === "new" && profiles.length === 0 && !closable)}>
                {__kbUi("Bekor qilish")}
              </button>
              {editingProfile && (
                <button type="button" className="kb-family-text danger" onClick={() => remove(editingProfile)} disabled={Boolean(busy)}>
                  <Trash2 size={14} /> {__kbUi("O‘chirish")}
                </button>
              )}
              <button type="submit" className="kb-family-primary" disabled={busy === "save"}>
                {busy === "save" ? <LoaderCircle size={16} className="animate-spin" /> : null}
                {__kbUi(editing === "new" ? "Profilni yaratish" : "Saqlash")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
