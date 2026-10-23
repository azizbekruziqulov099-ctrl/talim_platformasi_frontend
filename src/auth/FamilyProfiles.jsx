import React, { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { workspaceRequest } from "../workspace/kabutarWorkspaceClient.js";
import {
  AGE_GROUPS, FAMILY_MAX, GRADES, KID_AGES, PROFILE_TYPES, RELATIONS,
  ageGroupFor, profileBody, profileFormError, profileSummary, relationLabel,
} from "./familyProfiles.js";
// REV162: ota-ona markazi (kundalik, haftalik reja, kurslar) — profil oynasidan ham ochiladi
const BolaMarkazi = React.lazy(() => import("../parent/BolaMarkazi.jsx"));
import "./family-profiles.css";

const EMPTY_FORM = { name: "", role: "bogcha", age: 3, ageGroup: "", grade: "", relation: "farzandim" };
const TYPE = Object.fromEntries(PROFILE_TYPES.map((t) => [t.id, t]));

function formFromProfile(p) {
  return {
    name: p.name || "",
    role: p.role,
    age: p.age || "",
    ageGroup: p.role === "bogcha" && p.age_group && p.age_group !== ageGroupFor(p.age) ? p.age_group : "",
    grade: p.grade || "",
    relation: p.relation || (p.role === "bogcha" ? "farzandim" : ""),
  };
}

/** REV163: bola telefonida faqat bola profilini ochish — bir martalik 8 xonali kod (15 daqiqa) va havola. */
function QurilmaKodi({ q, onClose, onNew }) {
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const left = q.expires ? Math.max(0, Math.round((q.expires - now) / 1000)) : 0;
  const link = q.code ? `${window.location.origin}/?bola_kodi=${q.code}` : "";
  const share = async () => {
    try {
      if (navigator.share) { await navigator.share({ title: "Kabutar", text: __kbUi("Farzandim profili"), url: link }); return; }
      await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch { /* bekor qilindi */ }
  };
  return <div className="kb-family-markaz" role="dialog" aria-modal="true" aria-label={__kbUi("Bola telefonida ochish")}>
    <div className="kb-family-markaz-sheet kb-family-code-sheet">
      <header className="kb-family-head">
        <div><h2>📱 {q.profile.name}</h2><p>{__kbUi("Farzandingiz telefonida (yoki kompyuterida) faqat uning profili ochiladi — sizning akkauntingiz u yerda ochilmaydi.")}</p></div>
        <button type="button" className="kb-family-icon" onClick={onClose} aria-label={__kbUi("Yopish")}><X size={18} /></button>
      </header>
      {q.loading ? <p className="kb-family-loading" role="status"><LoaderCircle size={18} className="animate-spin" /> {__kbUi("Yuklanmoqda…")}</p> : <>
        <ol className="kb-family-code-steps">
          <li>{__kbUi("Bola telefonida saytni oching: talimkabutar.uz")}</li>
          <li>{__kbUi("Kirish sahifasida «👧 Bola kodi» tugmasini bosing")}</li>
          <li>{__kbUi("Shu kodni kiriting:")}</li>
        </ol>
        <p className={`kb-family-code ${left ? "" : "is-old"}`} aria-live="polite">{q.code.slice(0, 4)} {q.code.slice(4)}</p>
        <p className="kb-family-code-time">{left ? <>⏱ {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")} · {__kbUi("Kod bir marta ishlaydi")}</>
          : __kbUi("Kod muddati tugadi")}</p>
        <div className="kb-family-actions">
          {left > 0 && <button type="button" className="kb-family-text" onClick={share}>{copied ? "✅ " + __kbUi("Nusxa olindi") : "🔗 " + __kbUi("Havolani yuborish")}</button>}
          <button type="button" className="kb-family-primary" onClick={onNew}>🔄 {__kbUi("Yangi kod")}</button>
        </div>
        <p className="kb-family-note">{__kbUi("Havolani farzandingiz telefoniga Telegram orqali yuborsangiz ham bo‘ladi — u bosilsa profil o‘zi ochiladi. Kod va havola 15 daqiqada eskiradi.")}</p>
      </>}
    </div>
  </div>;
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
  const [markaz, setMarkaz] = useState(null);   // REV162: ochilgan bola markazi (profil)
  const markazRef = useRef(null);
  markazRef.current = markaz;
  const [qurilma, setQurilma] = useState(null);
  const qurilmaRef = useRef(null);
  qurilmaRef.current = qurilma;   // REV163: bola telefoni uchun kod {profile, code, expires_at} | {profile, loading}
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
    const key = (e) => { if (e.key === "Escape") { if (markazRef.current) setMarkaz(null); else if (qurilmaRef.current) setQurilma(null); else onClose?.(); } };
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

  async function bolaKodi(profile) {
    setQurilma({ profile, loading: true }); setError("");
    try {
      const d = await workspaceRequest(apiBase, `/auth/profiles/${profile.user_id}/device-code`, ownerToken, { method: "POST", body: {} });
      setQurilma({ profile, code: d.code, expires: Date.now() + (Number(d.minutes) || 15) * 60000 });
    } catch (err) { setQurilma(null); setError(err.status === 404 ? "Server hali yangilanmagan." : err.message); }
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
                      <small>{p.relation ? <>{__kbUi(relationLabel(p.relation))} · </> : null}{__kbUi(t.label)} · {__kbUi(profileSummary(p))}</small>
                      {manage && <span className="kb-family-edit-mark"><Pencil size={13} /></span>}
                    </button>
                    {!manage && p.role === "bogcha" && (
                      <button type="button" className="kb-family-diary" onClick={() => setMarkaz(p)} disabled={Boolean(busy)}
                        aria-label={__kbUi(`${p.name}: kundalik, reja va kurslar`)}>📒 {__kbUi("Kundalik va reja")}</button>
                    )}
                    {!manage && (
                      <button type="button" className="kb-family-diary is-device" onClick={() => bolaKodi(p)} disabled={Boolean(busy)}
                        aria-label={__kbUi(`${p.name}: bola telefonida ochish`)}>📱 {__kbUi("Bola telefonida ochish")}</button>
                    )}
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

            <details className="kb-family-device">
              <summary>📱 {__kbUi("Farzandingiz profilini boshqa telefon yoki kompyuterda ochish")}</summary>
              <ol>
                <li>{__kbUi("O‘sha qurilmada saytni oching: talimkabutar.uz")}</li>
                <li>{__kbUi("O‘zingizning akkauntingiz bilan kiring — Gmail (Google) yoki Telegram orqali (shu akkauntga ulangan bo‘lishi kerak).")}</li>
                <li>{__kbUi("«Kim o‘rganadi?» oynasida farzandingizni tanlang — u o‘z darslari bilan ochiladi.")}</li>
                <li>{__kbUi("Farzandingiz profilidan chiqsa ham, sizning akkauntingiz shu qurilmada qoladi — keyingi safar faqat bolani tanlaysiz.")}</li>
              </ol>
              <p>{__kbUi("Gmail yoki Telegram hali ulanmagan bo‘lsa: yuqoridagi 👤 «Akkaunt va kirish» tugmasi orqali ulang.")}</p>
            </details>

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

            <fieldset>
              <legend>{__kbUi("Bu kim?")}</legend>
              <div className="kb-family-rel">
                {RELATIONS.map((r) => (
                  <button key={r.id} type="button" className={form.relation === r.id ? "on" : ""} aria-pressed={form.relation === r.id} onClick={() => set({ relation: r.id })}>
                    <span aria-hidden="true">{r.icon}</span>{__kbUi(r.label)}
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
      {qurilma && <QurilmaKodi q={qurilma} onClose={() => setQurilma(null)} onNew={() => bolaKodi(qurilma.profile)} />}
      {markaz && (
        <div className="kb-family-markaz" role="dialog" aria-modal="true" aria-label={__kbUi("Kundalik va reja")}>
          <div className="kb-family-markaz-sheet">
            <header className="kb-family-head">
              <div><h2>📒 {markaz.name}</h2><p>{__kbUi("Kundalik, haftalik reja va kurslar")}</p></div>
              <button type="button" className="kb-family-icon" onClick={() => setMarkaz(null)} aria-label={__kbUi("Yopish")}><X size={18} /></button>
            </header>
            <React.Suspense fallback={<p className="kb-family-loading" role="status"><LoaderCircle size={18} className="animate-spin" /> {__kbUi("Yuklanmoqda…")}</p>}>
              <BolaMarkazi apiBase={apiBase} token={ownerToken} childId={markaz.user_id} />
            </React.Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
