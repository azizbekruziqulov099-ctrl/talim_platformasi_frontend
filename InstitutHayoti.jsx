import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Camera, ChevronDown, GraduationCap, ImagePlus, Loader2, Pencil, Plus, Search, Trash2, Users, X } from "lucide-react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { SANA_TURLARI, TUR_IKONI, filterCourses, formatSana, groupDirections, initials, kunMatni, kursNomi, nextDate } from "./institutHayotiRules.js";
import "./institut-hayoti.css";

async function request(apiBase, path, token, options = {}) {
  const sep = path.includes("?") ? "&" : "?";
  const response = await fetch(`${apiBase}${path}${options.body instanceof FormData ? "" : `${sep}token=${encodeURIComponent(token)}`}`, {
    cache: "no-store",
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : `Server xatosi (${response.status})`);
  return data;
}

const sanaRasmi = (apiBase, s) => `${apiBase}/api/institut_hayoti/rasm/sana/${s.id}?v=${encodeURIComponent(s.yangilangan_at || "")}`;
const muqovaRasmi = (apiBase, u) => `${apiBase}/api/institut_hayoti/rasm/muqova/${u.id}?v=${encodeURIComponent(u.muqova_yangilangan || "")}`;

function Holat({ loading, error, onRetry }) {
  if (loading) return <div className="ih-state" role="status"><Loader2 size={22} className="ih-spin" />{__kbUi("Yuklanmoqda…")}</div>;
  if (error) return <div className="ih-state ih-error" role="alert">{__kbUi(error)}{onRetry && <button type="button" onClick={onRetry}>{__kbUi("Qayta urinish")}</button>}</div>;
  return null;
}

function SanaKarta({ apiBase, sana, onEdit, onDelete, compact = false }) {
  useKbInterfaceLocale();
  return <article className={`ih-date ${sana.otgan ? "is-past" : ""} ih-type-${sana.turi}`}>
    {sana.rasm_bor && <img className="ih-date-img" src={sanaRasmi(apiBase, sana)} alt="" loading="lazy" />}
    <div className="ih-date-body">
      <div className="ih-date-top">
        <span className="ih-date-badge">{TUR_IKONI[sana.turi] || "📌"} {__kbUi(sana.turi_nomi || "Muhim sana")}</span>
        {sana.kurs ? <span className="ih-date-badge is-course">{__kbUi(kursNomi(sana.kurs))}</span> : null}
        <span className={`ih-date-left ${sana.qolgan_kun === 0 ? "is-today" : ""}`}>{__kbUi(kunMatni(sana.qolgan_kun))}</span>
      </div>
      <h4>{sana.sarlavha}</h4>
      <p className="ih-date-when"><CalendarDays size={14} />{__kbUi(formatSana(sana.sana, sana.tugash_sana))}</p>
      {!compact && sana.matn && <p className="ih-date-text">{sana.matn}</p>}
      {(onEdit || onDelete) && <div className="ih-date-actions">
        {onEdit && <button type="button" onClick={() => onEdit(sana)}><Pencil size={14} />{__kbUi("Tahrirlash")}</button>}
        {onDelete && <button type="button" className="is-danger" onClick={() => onDelete(sana)}><Trash2 size={14} />{__kbUi("O‘chirish")}</button>}
      </div>}
    </div>
  </article>;
}

// ═══ ADMIN: talabalar — kurs → guruh → talaba ═══
export function AdminInstitutTalabalari({ token, apiBase, universitet }) {
  useKbInterfaceLocale();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kurs, setKurs] = useState(0);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState({});
  const load = useCallback(() => {
    setLoading(true); setError("");
    request(apiBase, `/api/institut_hayoti/admin/${universitet.id}/talabalar`, token)
      .then((d) => { setData(d); if (d.kurslar?.length && !d.kurslar.some((c) => c.kurs === kurs)) setKurs(0); })
      .catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [apiBase, token, universitet.id]);
  useEffect(() => { load(); }, [load]);
  const kurslar = data?.kurslar || [];
  const shown = useMemo(() => filterCourses(kurslar, kurs, query), [kurslar, kurs, query]);
  if (loading || error) return <Holat loading={loading} error={error} onRetry={load} />;
  if (!kurslar.length) return <div className="ih-empty"><Users size={30} /><h3>{__kbUi("Hali talaba qo‘shilmagan")}</h3><p>{__kbUi("Institutga talaba parolini yarating va talabalarga bering. Talaba: Profil → «Institut va kurs» → institutni tanlaydi, parolni kiritadi, kursi va guruhini yozadi. Shundan so‘ng u shu yerda o‘z kursi va guruhida ko‘rinadi.")}</p></div>;
  return <div className="ih-students">
    <div className="ih-course-tabs" role="tablist" aria-label={__kbUi("Kurslar")}>
      <button type="button" role="tab" aria-selected={!kurs} className={!kurs ? "is-on" : ""} onClick={() => setKurs(0)}>{__kbUi("Hammasi")}<b>{data.jami}</b></button>
      {kurslar.map((c) => <button key={c.kurs} type="button" role="tab" aria-selected={kurs === c.kurs} className={kurs === c.kurs ? "is-on" : ""} onClick={() => setKurs(c.kurs)}>{__kbUi(kursNomi(c.kurs))}<b>{c.soni}</b></button>)}
    </div>
    <label className="ih-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={__kbUi("Ism, guruh yoki yo‘nalish…")} />{query && <button type="button" aria-label={__kbUi("Tozalash")} onClick={() => setQuery("")}><X size={14} /></button>}</label>
    {!shown.length && <p className="ih-muted">{__kbUi("Hech narsa topilmadi.")}</p>}
    {shown.map((c) => <section key={c.kurs} className="ih-course">
      <header className="ih-course-head"><span className="ih-course-num">{c.kurs || "—"}</span><div><h3>{__kbUi(kursNomi(c.kurs))}</h3><small>{__kbUi(`${c.guruhlar.length} ta guruh · ${c.soni} talaba`)}</small></div></header>
      <div className="ih-groups">
        {c.guruhlar.map((g) => {
          const key = `${c.kurs}:${g.guruh}`;
          const isOpen = open[key] ?? (query.length > 0 || c.guruhlar.length <= 2);
          return <div key={key} className={`ih-group ${isOpen ? "is-open" : ""}`}>
            <button type="button" className="ih-group-head" onClick={() => setOpen((o) => ({ ...o, [key]: !isOpen }))} aria-expanded={isOpen}>
              <span className="ih-group-name">{g.guruh}</span>
              <span className="ih-group-meta">{groupDirections(g.talabalar).slice(0, 2).join(" · ")}</span>
              <span className="ih-group-count"><Users size={14} />{g.soni}</span>
              <ChevronDown size={16} className="ih-chevron" />
            </button>
            {isOpen && <ul className="ih-people">
              {g.talabalar.map((t) => <li key={t.user_id}>
                <span className="ih-avatar">{initials(t.full_name)}</span>
                <div><b>{t.full_name}</b><small>{[t.yonalish_nomi, t.talim_shakli, t.semestr ? `${t.semestr}-semestr` : "", t.kabutar_id].filter(Boolean).join(" · ")}</small></div>
                <time>{formatSana(t.qoshilgan_at)}</time>
              </li>)}
            </ul>}
          </div>;
        })}
      </div>
    </section>)}
  </div>;
}

// ═══ ADMIN: institut sahifasi — muqova rasmi, tavsif, muhim sanalar ═══
const bosh = { sarlavha: "", sana: "", tugash_sana: "", turi: "muhim", kurs: "", matn: "", rasm: null, rasm_ochir: false, id: "" };

export function AdminInstitutSahifasi({ token, apiBase, universitet }) {
  useKbInterfaceLocale();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tavsif, setTavsif] = useState("");
  const [cover, setCover] = useState(null);
  const [coverRemove, setCoverRemove] = useState(false);
  const [form, setForm] = useState(bosh);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(() => {
    setLoading(true); setError("");
    request(apiBase, `/api/institut_hayoti/admin/${universitet.id}`, token)
      .then((d) => { setData(d); setTavsif(d.universitet?.tavsif || ""); setCover(null); setCoverRemove(false); })
      .catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [apiBase, token, universitet.id]);
  useEffect(() => { load(); }, [load]);
  const coverPreview = useMemo(() => cover ? URL.createObjectURL(cover) : null, [cover]);
  const datePreview = useMemo(() => form.rasm ? URL.createObjectURL(form.rasm) : null, [form.rasm]);
  useEffect(() => () => { if (coverPreview) URL.revokeObjectURL(coverPreview); }, [coverPreview]);
  useEffect(() => () => { if (datePreview) URL.revokeObjectURL(datePreview); }, [datePreview]);

  const flash = (text) => { setNotice(text); setTimeout(() => setNotice(""), 2600); };
  const savePage = async () => {
    const body = new FormData();
    body.append("token", token); body.append("tavsif", tavsif);
    if (cover) body.append("rasm", cover);
    if (coverRemove) body.append("rasm_ochir", "true");
    setBusy("page"); setError("");
    try { await request(apiBase, `/api/institut_hayoti/admin/${universitet.id}/sahifa`, token, { method: "POST", body }); flash("Institut sahifasi saqlandi"); load(); }
    catch (e) { setError(e.message); } finally { setBusy(""); }
  };
  const saveDate = async (event) => {
    event.preventDefault();
    const body = new FormData();
    body.append("token", token);
    for (const key of ["sarlavha", "sana", "tugash_sana", "turi", "kurs", "matn"]) body.append(key, form[key] || "");
    if (form.id) body.append("sana_id", String(form.id));
    if (form.rasm) body.append("rasm", form.rasm);
    if (form.rasm_ochir) body.append("rasm_ochir", "true");
    setBusy("date"); setError("");
    try { await request(apiBase, `/api/institut_hayoti/admin/${universitet.id}/sana`, token, { method: "POST", body }); flash(form.id ? "Sana yangilandi" : "Muhim sana qo‘shildi — talabalar ko‘radi"); setForm(bosh); setFormOpen(false); load(); }
    catch (e) { setError(e.message); } finally { setBusy(""); }
  };
  const removeDate = async (sana) => {
    if (!window.confirm(__kbUi(`«${sana.sarlavha}» o‘chirilsinmi?`))) return;
    setBusy("date");
    try { await request(apiBase, `/api/institut_hayoti/admin/sana/${sana.id}`, token, { method: "DELETE" }); load(); }
    catch (e) { setError(e.message); } finally { setBusy(""); }
  };
  const edit = (sana) => { setForm({ ...bosh, ...sana, kurs: sana.kurs ? String(sana.kurs) : "", tugash_sana: sana.tugash_sana || "", matn: sana.matn || "", rasm: null }); setFormOpen(true); window.scrollTo?.({ top: 0, behavior: "smooth" }); };

  if (loading && !data) return <Holat loading />;
  const uni = data?.universitet || universitet;
  const showCover = coverPreview || (!coverRemove && uni.muqova_bor ? muqovaRasmi(apiBase, uni) : null);
  return <div className="ih-editor">
    {error && <Holat error={error} />}
    {notice && <p className="ih-toast" role="status">✓ {__kbUi(notice)}</p>}
    <section className="ih-card">
      <h3 className="ih-card-title"><Camera size={17} />{__kbUi("Institut muqovasi va tavsifi")}</h3>
      <div className="ih-cover-edit" style={showCover ? { backgroundImage: `url("${showCover}")` } : undefined}>
        {!showCover && <span>{__kbUi("Muqova rasmi yo‘q — talabalar chiroyli rangli fonni ko‘radi")}</span>}
        <div className="ih-cover-actions">
          <label className="ih-btn is-light"><ImagePlus size={15} />{__kbUi(showCover ? "Rasmni almashtirish" : "Rasm tanlash")}<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCover(f); setCoverRemove(false); } e.target.value = ""; }} /></label>
          {showCover && <button type="button" className="ih-btn is-light" onClick={() => { setCover(null); setCoverRemove(true); }}><X size={15} />{__kbUi("Olib tashlash")}</button>}
        </div>
      </div>
      <label className="ih-field"><span>{__kbUi("Talabalarga qisqa ma’lumot")}</span><textarea rows={3} maxLength={4000} value={tavsif} onChange={(e) => setTavsif(e.target.value)} placeholder={__kbUi("Masalan: dekanat qabul vaqtlari, kutubxona ish tartibi, bog‘lanish uchun telefon…")} /></label>
      <button type="button" className="ih-btn" onClick={savePage} disabled={busy === "page"}>{busy === "page" ? <Loader2 size={15} className="ih-spin" /> : null}{__kbUi("Saqlash")}</button>
    </section>

    <section className="ih-card">
      <div className="ih-card-row"><h3 className="ih-card-title"><CalendarDays size={17} />{__kbUi("Muhim sanalar")}<small>{__kbUi(`${data?.sanalar?.length || 0} ta`)}</small></h3>
        {!formOpen && <button type="button" className="ih-btn" onClick={() => { setForm(bosh); setFormOpen(true); }}><Plus size={15} />{__kbUi("Sana qo‘shish")}</button>}</div>
      {formOpen && <form className="ih-date-form" onSubmit={saveDate}>
        <div className="ih-grid2">
          <label className="ih-field ih-span2"><span>{__kbUi("Sarlavha")}</span><input required maxLength={200} value={form.sarlavha} onChange={(e) => setForm({ ...form, sarlavha: e.target.value })} placeholder={__kbUi("Masalan: Qishki sessiya boshlanadi")} /></label>
          <label className="ih-field"><span>{__kbUi("Sana")}</span><input type="date" required value={form.sana} onChange={(e) => setForm({ ...form, sana: e.target.value })} /></label>
          <label className="ih-field"><span>{__kbUi("Tugash sanasi (ixtiyoriy)")}</span><input type="date" min={form.sana || undefined} value={form.tugash_sana} onChange={(e) => setForm({ ...form, tugash_sana: e.target.value })} /></label>
          <label className="ih-field"><span>{__kbUi("Turi")}</span><select value={form.turi} onChange={(e) => setForm({ ...form, turi: e.target.value })}>{SANA_TURLARI.map(([id, name, icon]) => <option key={id} value={id}>{icon} {__kbUi(name)}</option>)}</select></label>
          <label className="ih-field"><span>{__kbUi("Kimlar uchun")}</span><select value={form.kurs} onChange={(e) => setForm({ ...form, kurs: e.target.value })}><option value="">{__kbUi("Barcha kurslar")}</option>{[1, 2, 3, 4, 5, 6].map((k) => <option key={k} value={k}>{__kbUi(`Faqat ${k}-kurs`)}</option>)}</select></label>
          <label className="ih-field ih-span2"><span>{__kbUi("Matn")}</span><textarea rows={3} maxLength={4000} value={form.matn} onChange={(e) => setForm({ ...form, matn: e.target.value })} placeholder={__kbUi("Nima bo‘ladi, qayerda, nima olib kelish kerak…")} /></label>
        </div>
        <div className="ih-date-image">
          {(datePreview || (form.id && form.rasm_bor && !form.rasm_ochir)) && <img src={datePreview || sanaRasmi(apiBase, form)} alt="" />}
          <label className="ih-btn is-light"><ImagePlus size={15} />{__kbUi(datePreview || form.rasm_bor ? "Rasmni almashtirish" : "Rasm qo‘shish")}<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setForm({ ...form, rasm: f, rasm_ochir: false }); e.target.value = ""; }} /></label>
          {(datePreview || (form.rasm_bor && !form.rasm_ochir)) && <button type="button" className="ih-btn is-light" onClick={() => setForm({ ...form, rasm: null, rasm_ochir: true })}><X size={15} />{__kbUi("Rasmsiz")}</button>}
        </div>
        <div className="ih-form-actions">
          <button type="button" className="ih-btn is-light" onClick={() => { setForm(bosh); setFormOpen(false); }}>{__kbUi("Bekor qilish")}</button>
          <button type="submit" className="ih-btn" disabled={busy === "date"}>{busy === "date" ? <Loader2 size={15} className="ih-spin" /> : null}{__kbUi(form.id ? "Saqlash" : "Qo‘shish")}</button>
        </div>
      </form>}
      {!data?.sanalar?.length && !formOpen && <p className="ih-muted">{__kbUi("Hali sana yo‘q. Sessiya, ta‘til, tadbir yoki muhim yangilikni qo‘shing — shu institut talabalari «Mening institutim» sahifasida ko‘radi.")}</p>}
      <div className="ih-dates">{(data?.sanalar || []).map((s) => <SanaKarta key={s.id} apiBase={apiBase} sana={s} onEdit={edit} onDelete={removeDate} />)}</div>
    </section>
  </div>;
}

/** Admin: bitta institutning talabalari va sahifasi (tablar bilan). */
export function AdminInstitutHayoti({ token, apiBase, universitet, initialTab = "talabalar", onBack }) {
  useKbInterfaceLocale();
  const [tab, setTab] = useState(initialTab);
  return <div className="ih-root">
    <button type="button" className="ih-back" onClick={onBack}><ArrowLeft size={16} />{__kbUi("Orqaga")}</button>
    <header className="ih-admin-hero">
      <span className="ih-hero-icon"><GraduationCap size={24} /></span>
      <div><small>{__kbUi("INSTITUT HAYOTI")}</small><h2>{universitet.nomi}</h2><p>{__kbUi("Talabalar kurs va guruhlar bo‘yicha; institut sahifasi va muhim sanalar")}</p></div>
    </header>
    <div className="ih-tabs" role="tablist">
      <button type="button" role="tab" aria-selected={tab === "talabalar"} className={tab === "talabalar" ? "is-on" : ""} onClick={() => setTab("talabalar")}><Users size={16} />{__kbUi("Talabalar")}</button>
      <button type="button" role="tab" aria-selected={tab === "sahifa"} className={tab === "sahifa" ? "is-on" : ""} onClick={() => setTab("sahifa")}><CalendarDays size={16} />{__kbUi("Sahifa va muhim sanalar")}</button>
    </div>
    {tab === "talabalar" ? <AdminInstitutTalabalari token={token} apiBase={apiBase} universitet={universitet} /> : <AdminInstitutSahifasi token={token} apiBase={apiBase} universitet={universitet} />}
  </div>;
}

/** Muassasa sozlamalari → Institut: institutni tanlab sahifasini tahrirlash. */
export function AdminInstitutTanlash({ token, apiBase, onBack }) {
  useKbInterfaceLocale();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState(null);
  const load = useCallback(() => {
    setLoading(true); setError("");
    request(apiBase, "/api/admin/universitetlar", token).then((d) => setList(Array.isArray(d.universitetlar) ? d.universitetlar : []))
      .catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [apiBase, token]);
  useEffect(() => { load(); }, [load]);
  if (chosen) return <AdminInstitutHayoti token={token} apiBase={apiBase} universitet={chosen} initialTab="sahifa" onBack={() => { setChosen(null); load(); }} />;
  const q = query.trim().toLowerCase();
  const shown = list.filter((u) => !q || String(u.nomi).toLowerCase().includes(q)).sort((a, b) => Number(b.talaba_soni || 0) - Number(a.talaba_soni || 0));
  return <div className="ih-root">
    <button type="button" className="ih-back" onClick={onBack}><ArrowLeft size={16} />{__kbUi("Muassasa sozlamalari")}</button>
    <header className="ih-admin-hero"><span className="ih-hero-icon">🏛️</span><div><small>{__kbUi("INSTITUT SOZLAMASI")}</small><h2>{__kbUi("Institutni tanlang")}</h2><p>{__kbUi("Muqova rasmi, talabalarga ma’lumot va muhim sanalarni shu yerda yozasiz. Talabalar ularni «Mening institutim»da ko‘radi.")}</p></div></header>
    <label className="ih-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={__kbUi("Institut nomi…")} /></label>
    <Holat loading={loading} error={error} onRetry={load} />
    <div className="ih-uni-list">{shown.map((u) => <button key={u.id} type="button" className="ih-uni" onClick={() => setChosen(u)}>
      <span className="ih-uni-icon">🎓</span><div><b>{u.nomi}</b><small>{[u.viloyat, `${Number(u.talaba_soni) || 0} talaba`].filter(Boolean).join(" · ")}</small></div><span className="ih-uni-go">{__kbUi("Ochish")}</span>
    </button>)}</div>
  </div>;
}

// ═══ TALABA: Mening institutim ═══
export default function MeningInstitutim({ token, apiBase, onOpenProfile }) {
  useKbInterfaceLocale();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPast, setShowPast] = useState(false);
  const load = useCallback(() => {
    setLoading(true); setError("");
    request(apiBase, "/api/institut_hayoti/mening", token).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [apiBase, token]);
  useEffect(() => { load(); }, [load]);
  if (loading || error) return <div className="ih-root"><Holat loading={loading} error={error} onRetry={load} /></div>;
  if (!data?.ulangan) return <div className="ih-root"><div className="ih-join">
    <span className="ih-join-icon">🎓</span>
    <h2>{__kbUi("Institutingizga ulaning")}</h2>
    <p>{__kbUi("Institutni tanlab, kursingiz va guruhingizni yozing. Shunda bu yerda guruhdoshlaringiz, kursingiz va institutingizning muhim sanalari chiqadi.")}</p>
    <ol><li>{__kbUi("Profil → «Institut va kurs»")}</li><li>{__kbUi("Institutni tanlang va muassasa bergan 4 belgili parolni kiriting")}</li><li>{__kbUi("Kurs va guruhingizni yozing — tayyor!")}</li></ol>
    {onOpenProfile && <button type="button" className="ih-btn" onClick={onOpenProfile}>{__kbUi("Institutni tanlash")}</button>}
  </div></div>;
  const { universitet: uni, men, guruhdoshlar = [], kurs = {}, sanalar = [] } = data;
  const next = nextDate(sanalar);
  const upcoming = sanalar.filter((s) => !s.otgan && s !== next);
  const past = sanalar.filter((s) => s.otgan);
  return <div className="ih-root ih-student">
    <header className={`ih-hero ${uni.muqova_bor ? "has-cover" : ""}`} style={uni.muqova_bor ? { backgroundImage: `linear-gradient(180deg,#0b1f3300 20%,#0b1f33e6 100%),url("${muqovaRasmi(apiBase, uni)}")` } : undefined}>
      <small>{__kbUi("MENING INSTITUTIM")}</small>
      <h2>{uni.nomi}</h2>
      <div className="ih-chips">
        <span>🎓 {__kbUi(kursNomi(men.kurs))}</span>
        <span>👥 {men.guruh}</span>
        {men.yonalish_nomi && <span>📚 {men.yonalish_nomi}</span>}
        {men.semestr ? <span>🗓 {__kbUi(`${men.semestr}-semestr`)}</span> : null}
      </div>
    </header>

    {next && <section className="ih-next">
      <div className="ih-next-count"><b>{next.qolgan_kun === 0 ? "🔔" : next.qolgan_kun}</b><small>{__kbUi(next.qolgan_kun === 0 ? "bugun" : next.qolgan_kun === 1 ? "ertaga" : "kun qoldi")}</small></div>
      <div className="ih-next-body"><small>{__kbUi("ENG YAQIN SANA")}</small><h3>{next.sarlavha}</h3><p>{TUR_IKONI[next.turi] || "📌"} {__kbUi(formatSana(next.sana, next.tugash_sana))}{next.matn ? ` · ${next.matn.slice(0, 90)}${next.matn.length > 90 ? "…" : ""}` : ""}</p></div>
    </section>}

    <div className="ih-stats">
      <div><b>{guruhdoshlar.length}</b><small>{__kbUi("guruhimda")}</small></div>
      <div><b>{kurs.talaba_soni || 0}</b><small>{__kbUi(`${men.kurs}-kursda`)}</small></div>
      <div><b>{kurs.guruh_soni || 0}</b><small>{__kbUi("kursdagi guruhlar")}</small></div>
      <div><b>{uni.talaba_soni || 0}</b><small>{__kbUi("institutda")}</small></div>
    </div>

    <section className="ih-card">
      <h3 className="ih-card-title"><Users size={17} />{__kbUi("Mening guruhim")}<small>{men.guruh}</small></h3>
      <ul className="ih-mates">{guruhdoshlar.map((g) => <li key={g.user_id} className={g.menman ? "is-me" : ""}><span className="ih-avatar">{initials(g.full_name)}</span><span>{g.full_name}</span>{g.menman && <em>{__kbUi("Siz")}</em>}</li>)}</ul>
      {guruhdoshlar.length <= 1 && <p className="ih-muted">{__kbUi("Guruhdoshlaringiz hali qo‘shilmagan. Ularga ayting: Profil → «Institut va kurs» — guruh nomini xuddi siznikidek yozishsin.")}</p>}
    </section>

    <section className="ih-card">
      <h3 className="ih-card-title"><CalendarDays size={17} />{__kbUi("Muhim sanalar")}</h3>
      {!sanalar.length && <p className="ih-muted">{__kbUi("Institut hali muhim sana qo‘shmagan.")}</p>}
      <div className="ih-dates">{(next ? [next, ...upcoming] : upcoming).map((s) => <SanaKarta key={s.id} apiBase={apiBase} sana={s} />)}</div>
      {past.length > 0 && <>
        <button type="button" className="ih-more" onClick={() => setShowPast((v) => !v)}>{__kbUi(showPast ? "O‘tgan sanalarni yashirish" : `O‘tgan sanalar (${past.length})`)}</button>
        {showPast && <div className="ih-dates">{past.map((s) => <SanaKarta key={s.id} apiBase={apiBase} sana={s} compact />)}</div>}
      </>}
    </section>

    {uni.tavsif && <section className="ih-card"><h3 className="ih-card-title">ℹ️ {__kbUi("Institut haqida")}</h3><p className="ih-about">{uni.tavsif}</p></section>}
  </div>;
}
