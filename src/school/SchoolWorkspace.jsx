import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Building2, CheckCircle2, ChevronRight, ClipboardCheck, Download,
  Eye, FileSpreadsheet, GraduationCap, KeyRound, Loader2, MessageCircle,
  Phone, Plus, RefreshCcw, Search, Send, ShieldCheck, Upload, UserPlus, Users, X,
} from "lucide-react";

const COLORS = {
  ink: "#173247", blue: "#175A7A", teal: "#0D7A77", sky: "#EAF5F8",
  cream: "#FAF7F0", line: "#DCE6EA", muted: "#6E7F89", green: "#2E7356",
  amber: "#A86714", red: "#A84444", violet: "#694EA0",
};

const ROLE_OPTIONS = [
  ["rektor", "Rektor"], ["prorektor", "Prorektor"],
  ["institut_admin", "Institut administratori"], ["dekan", "Dekan"],
  ["zam_dekan", "Dekan o‘rinbosari"], ["manaviyatchi", "Ma’naviy-ma’rifiy ishlar mas’uli"],
  ["fakultet_admin", "Fakultet administratori"], ["kafedra_mudiri", "Kafedra mudiri"],
  ["professor_oqituvchi", "Professor-o‘qituvchi"], ["tyutor", "Tyutor"],
];

function Card({ children, className = "" }) {
  return <section className={`rounded-3xl border bg-white ${className}`} style={{ borderColor: COLORS.line, boxShadow: "0 12px 36px rgba(23,50,71,.06)" }}>{children}</section>;
}

function Pill({ children, tone = "blue" }) {
  const map = { blue: [COLORS.sky, COLORS.blue], green: ["#EAF6EF", COLORS.green], amber: ["#FFF4DF", COLORS.amber], red: ["#FCECEC", COLORS.red], violet: ["#F2EEFB", COLORS.violet] };
  const [background, color] = map[tone] || map.blue;
  return <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-black" style={{ background, color }}>{children}</span>;
}

function Button({ children, onClick, disabled, kind = "primary", type = "button", className = "" }) {
  const styles = kind === "primary" ? { background: COLORS.blue, color: "#fff", borderColor: COLORS.blue }
    : kind === "danger" ? { background: "#fff", color: COLORS.red, borderColor: "#E8BABA" }
      : { background: "#fff", color: COLORS.ink, borderColor: COLORS.line };
  return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`} style={styles}>{children}</button>;
}

function Field({ label, children, hint }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-black" style={{ color: COLORS.ink }}>{label}</span>{children}{hint && <span className="mt-1 block text-[11px]" style={{ color: COLORS.muted }}>{hint}</span>}</label>;
}

const inputClass = "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2";

function ErrorBox({ text }) {
  if (!text) return null;
  return <div className="rounded-2xl border p-3 text-sm font-bold" style={{ borderColor: "#EDBDBD", background: "#FFF3F3", color: COLORS.red }}>{text}</div>;
}

function Empty({ children }) {
  return <div className="rounded-2xl border border-dashed p-7 text-center text-sm" style={{ borderColor: COLORS.line, color: COLORS.muted }}>{children}</div>;
}

function useApi(apiBase, token) {
  return useCallback(async (path, options = {}) => {
    const res = await fetch(`${apiBase}${path}`, options);
    let data = {};
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) {
      const detail = typeof data.detail === "string" ? data.detail : data.detail?.message;
      throw new Error(detail || `Server xatosi (${res.status})`);
    }
    return data;
  }, [apiBase, token]);
}

function InstituteCreate({ api, token, onCreated, onBack }) {
  const [form, setForm] = useState({ nomi: "", viloyat: "Samarqand viloyati", tuman: "Samarqand shahri" });
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const save = async () => {
    if (!form.nomi.trim()) return setError("Institut nomini kiriting");
    setBusy(true); setError("");
    try {
      const data = await api("/api/institut/v20/institut_yarat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, ...form }) });
      onCreated(data.universitet_id);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <div className="mx-auto max-w-2xl p-4 md:p-8">
    <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-black" style={{ color: COLORS.blue }}><ArrowLeft size={17} /> Ortga</button>
    <Card className="overflow-hidden">
      <div className="p-6 md:p-8" style={{ background: "linear-gradient(135deg,#E9F6F8,#F7F2E8)" }}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white"><Building2 style={{ color: COLORS.blue }} /></div>
        <h1 className="text-2xl font-black" style={{ color: COLORS.ink }}>Yangi institut ochish</h1>
        <p className="mt-2 text-sm" style={{ color: COLORS.muted }}>Avval institut nomi. Keyingi ekranda fakultet, kafedra va yo‘nalishlarni qo‘lda yoki XLSX orqali kiritasiz.</p>
      </div>
      <div className="space-y-4 p-6 md:p-8">
        <Field label="Institut nomi"><input className={inputClass} value={form.nomi} onChange={e => setForm({ ...form, nomi: e.target.value })} placeholder="Samarqand davlat pedagogika instituti" style={{ borderColor: COLORS.line }} /></Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Viloyat"><input className={inputClass} value={form.viloyat} onChange={e => setForm({ ...form, viloyat: e.target.value })} style={{ borderColor: COLORS.line }} /></Field>
          <Field label="Tuman / shahar"><input className={inputClass} value={form.tuman} onChange={e => setForm({ ...form, tuman: e.target.value })} style={{ borderColor: COLORS.line }} /></Field>
        </div>
        <ErrorBox text={error} />
        <Button onClick={save} disabled={busy} className="w-full">{busy ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />} Institutni yaratish</Button>
      </div>
    </Card>
  </div>;
}

function ManualStructure({ api, token, universityId, onSaved }) {
  const [facultyCount, setFacultyCount] = useState(1);
  const [faculties, setFaculties] = useState([{ nomi: "", kafedralar: [{ nomi: "", yonalishlar: [""] }] }]);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const resize = value => {
    const n = Math.max(1, Math.min(20, Number(value) || 1)); setFacultyCount(n);
    setFaculties(old => Array.from({ length: n }, (_, i) => old[i] || { nomi: "", kafedralar: [{ nomi: "", yonalishlar: [""] }] }));
  };
  const updateFaculty = (fi, patch) => setFaculties(old => old.map((f, i) => i === fi ? { ...f, ...patch } : f));
  const addDepartment = fi => updateFaculty(fi, { kafedralar: [...faculties[fi].kafedralar, { nomi: "", yonalishlar: [""] }] });
  const updateDepartment = (fi, di, patch) => updateFaculty(fi, { kafedralar: faculties[fi].kafedralar.map((d, i) => i === di ? { ...d, ...patch } : d) });
  const save = async () => {
    if (faculties.some(f => !f.nomi.trim())) return setError("Har bir fakultet nomini kiriting");
    if (faculties.some(f => !f.kafedralar.length || f.kafedralar.some(d => !d.nomi.trim()))) return setError("Har bir fakultetda kamida 1 ta nomlangan kafedra bo‘lsin");
    setBusy(true); setError("");
    try {
      await api("/api/institut/v20/tuzilma/manual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, universitet_id: universityId, fakultetlar: faculties.map(f => ({ ...f, kafedralar: f.kafedralar.map(d => ({ ...d, yonalishlar: d.yonalishlar.filter(x => x.trim()) })) })) }) });
      onSaved();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <div className="space-y-4">
    <Card className="p-5">
      <div className="flex flex-wrap items-end gap-4">
        <Field label="Nechta fakultet bor?" hint="1–20 oralig‘ida"><input type="number" min="1" max="20" className={`${inputClass} w-36`} value={facultyCount} onChange={e => resize(e.target.value)} style={{ borderColor: COLORS.line }} /></Field>
        <Pill tone="green">Administrator sizga avtomatik biriktiriladi</Pill>
      </div>
    </Card>
    {faculties.map((faculty, fi) => <Card key={fi} className="p-5">
      <div className="mb-4 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl font-black" style={{ background: COLORS.sky, color: COLORS.blue }}>{fi + 1}</span><input className={`${inputClass} text-base font-black`} value={faculty.nomi} onChange={e => updateFaculty(fi, { nomi: e.target.value })} placeholder={`${fi + 1}-fakultet nomi`} style={{ borderColor: COLORS.line }} /></div>
      <div className="space-y-3 pl-0 md:pl-12">
        {faculty.kafedralar.map((department, di) => <div key={di} className="rounded-2xl border p-4" style={{ borderColor: COLORS.line, background: "#FBFDFD" }}>
          <div className="mb-3 flex items-center gap-2"><span className="text-xs font-black" style={{ color: COLORS.teal }}>KAFEDRA {di + 1}</span><input className={inputClass} value={department.nomi} onChange={e => updateDepartment(fi, di, { nomi: e.target.value })} placeholder="Kafedra nomi" style={{ borderColor: COLORS.line }} /></div>
          <div className="space-y-2">
            {department.yonalishlar.map((program, pi) => <div key={pi} className="flex gap-2"><input className={inputClass} value={program} onChange={e => updateDepartment(fi, di, { yonalishlar: department.yonalishlar.map((x, i) => i === pi ? e.target.value : x) })} placeholder="Ta’lim yo‘nalishi" style={{ borderColor: COLORS.line }} />{department.yonalishlar.length > 1 && <button onClick={() => updateDepartment(fi, di, { yonalishlar: department.yonalishlar.filter((_, i) => i !== pi) })} className="rounded-xl border px-3" style={{ borderColor: COLORS.line, color: COLORS.red }}><X size={16} /></button>}</div>)}
          </div>
          <button onClick={() => updateDepartment(fi, di, { yonalishlar: [...department.yonalishlar, ""] })} className="mt-3 text-xs font-black" style={{ color: COLORS.blue }}>+ Yo‘nalish qo‘shish</button>
        </div>)}
        <button onClick={() => addDepartment(fi)} className="text-sm font-black" style={{ color: COLORS.teal }}>+ Kafedra qo‘shish</button>
      </div>
    </Card>)}
    <ErrorBox text={error} /><Button onClick={save} disabled={busy} className="w-full">{busy && <Loader2 size={17} className="animate-spin" />} Tuzilmani saqlash</Button>
  </div>;
}

function FileImport({ apiBase, token, universityId, type, templateHref, onCommitted, departments = [] }) {
  const [file, setFile] = useState(null); const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [departmentId, setDepartmentId] = useState(""); const [autoCreate, setAutoCreate] = useState(true);
  const previewPath = type === "qabul" ? "/api/institut/v20/qabul/import_preview" : "/api/institut/v20/tuzilma/import_preview";
  const commitPath = type === "qabul" ? "/api/institut/v20/qabul/import_commit" : "/api/institut/v20/tuzilma/import_commit";
  const runPreview = async () => {
    if (!file) return setError("Faylni tanlang"); setBusy(true); setError("");
    try {
      const fd = new FormData(); fd.append("fayl", file);
      const res = await fetch(`${apiBase}${previewPath}?universitet_id=${universityId}&token=${encodeURIComponent(token)}`, { method: "POST", body: fd });
      const data = await res.json(); if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : data.detail?.message || "Import xatosi"); setPreview(data);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const commit = async () => {
    const unknown = Object.keys(preview?.xulosa?.noma_lum_yonalishlar || {}).length > 0;
    if (type === "qabul" && unknown && !departmentId) return setError("Noma’lum yo‘nalishlar uchun kafedra tanlang");
    setBusy(true); setError("");
    try {
      const res = await fetch(`${apiBase}${commitPath}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, batch_id: preview.batch_id, default_kafedra_id: departmentId ? Number(departmentId) : undefined, auto_create_yonalishlar: autoCreate }) });
      const data = await res.json(); if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : data.detail?.message || "Saqlash xatosi"); onCommitted(data); setPreview(null); setFile(null);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const s = preview?.xulosa;
  return <Card className="p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black" style={{ color: COLORS.ink }}>{type === "qabul" ? "Qabul ro‘yxatini import qilish" : "Institut tuzilmasini import qilish"}</h3><p className="mt-1 text-xs" style={{ color: COLORS.muted }}>{type === "qabul" ? ".xls yoki .xlsx — Davlat qabul fayli ham taniladi" : "INSTITUT + TUZILMA + XODIMLAR varaqlari"}</p></div><a href={templateHref} download className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black" style={{ borderColor: COLORS.line, color: COLORS.blue }}><Download size={15} /> Shablonni yuklash</a></div>
    <div className="mt-4 flex flex-col gap-3 md:flex-row"><label className="flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 text-sm" style={{ borderColor: COLORS.line, color: COLORS.muted }}><FileSpreadsheet size={18} />{file ? file.name : "Excel faylni tanlang"}<input type="file" accept={type === "qabul" ? ".xls,.xlsx" : ".xlsx"} className="hidden" onChange={e => { setFile(e.target.files?.[0] || null); setPreview(null); }} /></label><Button onClick={runPreview} disabled={busy || !file} kind="secondary">{busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Tekshirish</Button></div>
    {s && <div className="mt-5 space-y-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">{Object.entries(type === "qabul" ? { "Jami": s.jami_qator, "Yaroqli": s.yaroqli, "Xato": s.xato_soni, "Yo‘nalish": Object.keys(s.yonalishlar || {}).length, "Til": Object.keys(s.talim_tillari || {}).length } : { "Fakultet": s.fakultet_soni, "Kafedra": s.kafedra_soni, "Variant": s.yonalish_variant_soni, "Xodim": s.xodim_soni, "Xato": s.xato_soni }).map(([k, v]) => <div key={k} className="rounded-2xl p-3" style={{ background: k === "Xato" && v ? "#FFF0F0" : COLORS.sky }}><div className="text-xl font-black" style={{ color: k === "Xato" && v ? COLORS.red : COLORS.blue }}>{v ?? 0}</div><div className="text-[11px] font-bold" style={{ color: COLORS.muted }}>{k}</div></div>)}</div>
      {!!s.xatolar?.length && <div className="max-h-44 overflow-auto rounded-2xl border p-3 text-xs" style={{ borderColor: "#EDBDBD", background: "#FFF6F6", color: COLORS.red }}>{s.xatolar.map((e, i) => <div key={i} className="mb-1">{e.varaq ? `${e.varaq} · ` : ""}{e.qator ? `${e.qator}-qator: ` : ""}{(e.xatolar || []).join("; ")}</div>)}</div>}
      {type === "qabul" && Object.keys(s.noaniq_yonalishlar || {}).length > 0 && <ErrorBox text={`Bir xil nomli yo‘nalish bir nechta kafedrada bor: ${Object.keys(s.noaniq_yonalishlar).join(", ")}. Tuzilmada nomlarni aniqlashtiring.`} />}
      {type === "qabul" && Object.keys(s.noma_lum_yonalishlar || {}).length > 0 && <div className="rounded-2xl border p-4" style={{ borderColor: "#F0D39A", background: "#FFF8EA" }}><p className="text-sm font-black" style={{ color: COLORS.amber }}>Yangi yo‘nalishlar: {Object.keys(s.noma_lum_yonalishlar).join(", ")}</p><div className="mt-3 grid gap-3 md:grid-cols-2"><Field label="Qaysi kafedraga ochilsin?"><select className={inputClass} value={departmentId} onChange={e => setDepartmentId(e.target.value)} style={{ borderColor: COLORS.line }}><option value="">Kafedrani tanlang</option>{departments.map(d => <option key={d.id} value={d.id}>{d.fakultet_nomi} · {d.nomi}</option>)}</select></Field><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={autoCreate} onChange={e => setAutoCreate(e.target.checked)} /> Noma’lum yo‘nalishlarni avtomatik ochish</label></div></div>}
      <Button onClick={commit} disabled={busy || !preview.commit_mumkin} className="w-full"><CheckCircle2 size={17} /> Xatosiz ma’lumotlarni bazaga kiritish</Button>
    </div>}
    <div className="mt-3"><ErrorBox text={error} /></div>
  </Card>;
}

function StructurePanel({ api, apiBase, token, universityId, canManage, onChanged, onCredentials }) {
  const [data, setData] = useState(null); const [mode, setMode] = useState("view"); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setData(await api(`/api/institut/v20/tuzilma?universitet_id=${universityId}&token=${encodeURIComponent(token)}`)); } catch (e) { setError(e.message); } }, [api, token, universityId]);
  useEffect(() => { load(); }, [load]);
  const committed = result => { onCredentials(result.kirish_kodlari || []); load(); onChanged(); };
  if (!data) return <div className="py-16 text-center"><Loader2 className="mx-auto animate-spin" style={{ color: COLORS.blue }} /></div>;
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2"><Button onClick={() => setMode("view")} kind={mode === "view" ? "primary" : "secondary"}>Tuzilma</Button>{canManage && <><Button onClick={() => setMode("manual")} kind={mode === "manual" ? "primary" : "secondary"}><Plus size={16} /> Qo‘lda</Button><Button onClick={() => setMode("import")} kind={mode === "import" ? "primary" : "secondary"}><FileSpreadsheet size={16} /> XLSX import</Button></>}</div>
    {mode === "manual" && <ManualStructure api={api} token={token} universityId={universityId} onSaved={() => { setMode("view"); load(); onChanged(); }} />}
    {mode === "import" && <FileImport apiBase={apiBase} token={token} universityId={universityId} type="tuzilma" templateHref="/templates/institut_tuzilma_shabloni.xlsx" onCommitted={committed} />}
    {mode === "view" && <>{!data.fakultetlar.length ? <Empty>Hali fakultet qo‘shilmagan. “Qo‘lda” yoki “XLSX import”ni tanlang.</Empty> : data.fakultetlar.map(f => <Card key={f.id} className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 p-5" style={{ background: "linear-gradient(135deg,#EDF7F8,#FBF7EE)" }}><div><h3 className="text-lg font-black" style={{ color: COLORS.ink }}>{f.nomi}</h3><p className="text-xs" style={{ color: COLORS.muted }}>{f.kafedra_soni} kafedra · {f.yonalish_soni} yo‘nalish</p></div><Pill tone={f.toldirilish.tayyor ? "green" : "amber"}>{f.toldirilish.tayyor ? "Rahbariyat to‘liq" : `Dekan ${f.toldirilish.dekan}/1 · Zam ${f.toldirilish.zam_dekan}/2 · Ma’naviy ${f.toldirilish.manaviyatchi}/1 · Admin ${f.toldirilish.admin}/1`}</Pill></div><div className="grid gap-3 p-5 md:grid-cols-2">{f.kafedralar.map(d => <div key={d.id} className="rounded-2xl border p-4" style={{ borderColor: COLORS.line }}><div className="font-black" style={{ color: COLORS.teal }}>{d.nomi}</div><div className="mt-2 space-y-1">{d.yonalishlar.length ? d.yonalishlar.map(y => <div key={y.id} className="rounded-lg px-2 py-1.5 text-xs" style={{ background: COLORS.cream, color: COLORS.ink }}>{y.nomi} · {y.daraja}</div>) : <span className="text-xs" style={{ color: COLORS.muted }}>Yo‘nalish yo‘q</span>}</div></div>)}</div></Card>)}</>}
    <ErrorBox text={error} />
  </div>;
}

function StaffPanel({ api, token, universityId, structure, canManage, onCredentials }) {
  const [staff, setStaff] = useState([]); const [form, setForm] = useState({ fish: "", telefon: "", rol: "dekan", fakultet_id: "", kafedra_id: "", yonalish_id: "" });
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async () => { try { const d = await api(`/api/institut/v20/xodimlar?universitet_id=${universityId}&token=${encodeURIComponent(token)}`); setStaff(d.xodimlar || []); } catch (e) { setError(e.message); } }, [api, token, universityId]);
  useEffect(() => { load(); }, [load]);
  const faculties = structure?.fakultetlar || [];
  const departments = faculties.flatMap(f => (f.kafedralar || []).map(d => ({ ...d, fakultet_id: f.id, fakultet_nomi: f.nomi })));
  const programs = departments.flatMap(d => (d.yonalishlar || []).map(y => ({ ...y, kafedra_id: d.id, fakultet_id: d.fakultet_id })));
  const save = async () => {
    setBusy(true); setError("");
    try {
      const data = await api("/api/institut/v20/xodim/manual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, universitet_id: universityId, fish: form.fish, telefon: form.telefon || undefined, rol: form.rol, fakultet_id: form.fakultet_id ? Number(form.fakultet_id) : undefined, kafedra_id: form.kafedra_id ? Number(form.kafedra_id) : undefined, yonalish_id: form.yonalish_id ? Number(form.yonalish_id) : undefined }) });
      onCredentials([data]); setForm({ fish: "", telefon: "", rol: "dekan", fakultet_id: "", kafedra_id: "", yonalish_id: "" }); load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <div className="space-y-4">
    {canManage && <Card className="p-5"><h3 className="font-black" style={{ color: COLORS.ink }}>Xodimni qo‘lda biriktirish</h3><div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3"><Field label="F.I.Sh."><input className={inputClass} value={form.fish} onChange={e => setForm({ ...form, fish: e.target.value })} style={{ borderColor: COLORS.line }} /></Field><Field label="Telefon"><input className={inputClass} value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })} placeholder="+998901234567" style={{ borderColor: COLORS.line }} /></Field><Field label="Lavozim"><select className={inputClass} value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })} style={{ borderColor: COLORS.line }}>{ROLE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field><Field label="Fakultet"><select className={inputClass} value={form.fakultet_id} onChange={e => setForm({ ...form, fakultet_id: e.target.value, kafedra_id: "", yonalish_id: "" })} style={{ borderColor: COLORS.line }}><option value="">—</option>{faculties.map(f => <option key={f.id} value={f.id}>{f.nomi}</option>)}</select></Field><Field label="Kafedra"><select className={inputClass} value={form.kafedra_id} onChange={e => setForm({ ...form, kafedra_id: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">—</option>{departments.filter(d => !form.fakultet_id || String(d.fakultet_id) === String(form.fakultet_id)).map(d => <option key={d.id} value={d.id}>{d.nomi}</option>)}</select></Field><Field label="Yo‘nalish"><select className={inputClass} value={form.yonalish_id} onChange={e => setForm({ ...form, yonalish_id: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">—</option>{programs.filter(y => !form.kafedra_id || String(y.kafedra_id) === String(form.kafedra_id)).map(y => <option key={y.id} value={y.id}>{y.nomi}</option>)}</select></Field></div><div className="mt-4"><ErrorBox text={error} /></div><Button onClick={save} disabled={busy || !form.fish.trim()} className="mt-4">{busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Biriktirish va parol yaratish</Button></Card>}
    <Card className="overflow-hidden"><div className="border-b p-5" style={{ borderColor: COLORS.line }}><h3 className="font-black" style={{ color: COLORS.ink }}>Institut xodimlari</h3></div>{!staff.length ? <div className="p-5"><Empty>Xodim yo‘q</Empty></div> : <div className="divide-y" style={{ borderColor: COLORS.line }}>{staff.map(x => <div key={x.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><div className="font-black" style={{ color: COLORS.ink }}>{x.full_name}</div><div className="text-xs" style={{ color: COLORS.muted }}>{x.fakultet_nomi || "Institut"}{x.kafedra_nomi ? ` · ${x.kafedra_nomi}` : ""}</div></div><div className="flex gap-2"><Pill tone="violet">{x.lavozim_nomi}</Pill><Pill tone={x.kirish_holati === "ulangan" ? "green" : "amber"}>{x.kirish_holati || "Hisob mavjud"}</Pill></div></div>)}</div>}</Card>
  </div>;
}

function CredentialsModal({ items, onClose }) {
  if (!items.length) return null;
  const copy = () => navigator.clipboard?.writeText(items.map(x => `${x.fish}\t${x.lavozim || x.lavozim_nomi}\t${x.kirish_kodi}`).join("\n"));
  return <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"><Card className="max-h-[86vh] w-full max-w-2xl overflow-auto p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black" style={{ color: COLORS.ink }}>Bir martalik kirish kodlari</h2><p className="mt-1 text-sm" style={{ color: COLORS.red }}>Bu kodlar faqat hozir ko‘rinadi. 2 oy amal qiladi.</p></div><button onClick={onClose}><X /></button></div><div className="mt-4 space-y-2">{items.map((x, i) => <div key={i} className="grid gap-2 rounded-xl border p-3 md:grid-cols-[1fr_1fr_auto]" style={{ borderColor: COLORS.line }}><span className="font-bold">{x.fish}</span><span className="text-sm" style={{ color: COLORS.muted }}>{x.lavozim || x.lavozim_nomi}</span><code className="rounded-lg px-2 py-1 font-black" style={{ background: COLORS.sky, color: COLORS.blue }}>{x.kirish_kodi}</code></div>)}</div><Button onClick={copy} className="mt-4 w-full"><KeyRound size={16} /> Hammasini copy qilish</Button></Card></div>;
}

function StudentDetail({ student, onClose }) {
  if (!student) return null;
  const phone = student.telefon; const digits = (phone || "").replace(/\D/g, "");
  const rows = [
    ["F.I.Sh.", student.fish], ["Ball", student.ball], ["Yo‘nalish", student.yonalish_nomi],
    ["Ta’lim", `${student.talim_shakli} · ${student.talim_tili}`], ["Hudud", `${student.doimiy_region || "—"}, ${student.doimiy_tuman || "—"}`],
    ["Telefon", phone], ["JSHSHIR", student.jshshir], ["Pasport", `${student.pasport_seriya || ""} ${student.pasport_raqam || ""}`.trim()],
    ["Tug‘ilgan sana", student.tugilgan_sana], ["Tavsiya", student.tavsiya_turi], ["Maktab", student.maktab_nomi], ["AbiturID", student.abitur_id],
  ];
  return <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"><Card className="max-h-[88vh] w-full max-w-2xl overflow-auto"><div className="sticky top-0 flex items-start justify-between border-b bg-white p-5" style={{ borderColor: COLORS.line }}><div><Pill tone="violet">Shaxsiy ma’lumot · audit qilinadi</Pill><h2 className="mt-2 text-xl font-black" style={{ color: COLORS.ink }}>{student.fish}</h2></div><button onClick={onClose}><X /></button></div><div className="grid gap-2 p-5 md:grid-cols-2">{rows.map(([k, v]) => <div key={k} className="rounded-xl p-3" style={{ background: COLORS.cream }}><div className="text-[11px] font-black" style={{ color: COLORS.muted }}>{k}</div><div className="mt-1 text-sm font-bold" style={{ color: COLORS.ink }}>{v ?? "—"}</div></div>)}</div>{phone && <div className="flex flex-wrap gap-2 px-5 pb-5"><a href={`tel:${phone}`}><Button kind="secondary"><Phone size={15} /> Telefon</Button></a><a href={`sms:${phone}`}><Button kind="secondary"><Send size={15} /> SMS</Button></a><a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer"><Button kind="secondary"><MessageCircle size={15} /> WhatsApp</Button></a><a href={student.telegram_username ? `https://t.me/${student.telegram_username.replace(/^@/, "")}` : `tg://resolve?phone=${digits}`}><Button kind="secondary">Telegram</Button></a>{student.max_username ? <a href={`https://max.ru/${student.max_username.replace(/^@/, "")}`} target="_blank" rel="noreferrer"><Button kind="secondary">MAX</Button></a> : <Button kind="secondary" disabled>MAX ulanmagan</Button>}</div>}</Card></div>;
}

function AdmissionsPanel({ api, apiBase, token, universityId, structure, permissions, onCredentials }) {
  const [mode, setMode] = useState("list"); const [tab, setTab] = useState(1); const [items, setItems] = useState([]); const [counts, setCounts] = useState({});
  const [filters, setFilters] = useState({ q: "", yonalish_id: "", talim_shakli: "", talim_tili: "", qabul_turi: "", region: "", sort: "ball_desc" });
  const [filterOptions, setFilterOptions] = useState({ shakllar: [], tillar: [], hududlar: [] });
  const [page, setPage] = useState(1); const [pages, setPages] = useState(0); const [detail, setDetail] = useState(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const programs = (structure?.fakultetlar || []).flatMap(f => (f.kafedralar || []).flatMap(d => (d.yonalishlar || []).map(y => ({ ...y, fakultet_nomi: f.nomi, kafedra_nomi: d.nomi }))));
  const departments = (structure?.fakultetlar || []).flatMap(f => (f.kafedralar || []).map(d => ({ ...d, fakultet_nomi: f.nomi })));
  const load = useCallback(async () => {
    if (!permissions.qabul_korish) return;
    setBusy(true); setError("");
    try {
      const qs = new URLSearchParams({ universitet_id: universityId, token, bosqich_min: String(tab), page: String(page), page_size: "50", sort: filters.sort });
      Object.entries(filters).forEach(([k, v]) => { if (v && k !== "sort") qs.set(k, v); });
      const d = await api(`/api/institut/v20/qabul/talabalar?${qs}`); setItems(d.talabalar || []); setCounts(d.hisoblar || {}); setPages(d.sahifa_soni || 0); setFilterOptions(d.filtrlar || { shakllar: [], tillar: [], hududlar: [] });
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }, [api, universityId, token, tab, page, filters, permissions.qabul_korish]);
  useEffect(() => { load(); }, [load]);
  const showDetail = async id => { try { setDetail(await api(`/api/institut/v20/qabul/talaba/${id}?universitet_id=${universityId}&token=${encodeURIComponent(token)}`)); } catch (e) { setError(e.message); } };
  const markDocs = async id => { try { await api(`/api/institut/v20/qabul/talaba/${id}/bosqich`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, bosqich: 2 }) }); load(); } catch (e) { setError(e.message); } };
  const invite = async id => { try { const d = await api(`/api/institut/v20/qabul/talaba/${id}/taklif`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, kanal: "sms" }) }); onCredentials([{ fish: items.find(x => x.id === id)?.fish, lavozim: "Talaba", kirish_kodi: d.kirish_kodi }]); load(); } catch (e) { setError(e.message); } };
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2"><Button onClick={() => setMode("list")} kind={mode === "list" ? "primary" : "secondary"}><Users size={16} /> Talabalar</Button>{permissions.hujjat_belgilash && <Button onClick={() => setMode("import")} kind={mode === "import" ? "primary" : "secondary"}><FileSpreadsheet size={16} /> Qabul import</Button>}</div>
    {mode === "import" && <FileImport apiBase={apiBase} token={token} universityId={universityId} type="qabul" templateHref="/templates/institut_qabul_shabloni.xlsx" departments={departments} onCommitted={() => { setMode("list"); load(); }} />}
    {mode === "list" && <>
      <div className="grid gap-3 md:grid-cols-3">{[[1, "O‘qishga tavsiya etilgan", counts.jami || 0, "blue"], [2, "Hujjat topshirgan", counts.hujjat || 0, "amber"], [3, "Saytga kiritilgan", counts.sayt || 0, "green"]].map(([id, label, count, tone]) => <button key={id} onClick={() => { setTab(id); setPage(1); }} className="rounded-2xl border p-4 text-left" style={{ borderColor: tab === id ? COLORS.blue : COLORS.line, background: tab === id ? COLORS.sky : "#fff" }}><Pill tone={tone}>{id}-BOSQICH</Pill><div className="mt-2 text-2xl font-black" style={{ color: COLORS.ink }}>{count}</div><div className="text-xs font-bold" style={{ color: COLORS.muted }}>{label}</div></button>)}</div>
      <Card className="p-4"><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-7"><div className="relative xl:col-span-2"><Search size={16} className="absolute left-3 top-3" style={{ color: COLORS.muted }} /><input className={`${inputClass} pl-9`} value={filters.q} onChange={e => { setFilters({ ...filters, q: e.target.value }); setPage(1); }} placeholder="F.I.Sh. yoki AbiturID" style={{ borderColor: COLORS.line }} /></div><select className={inputClass} value={filters.yonalish_id} onChange={e => { setFilters({ ...filters, yonalish_id: e.target.value }); setPage(1); }} style={{ borderColor: COLORS.line }}><option value="">Barcha yo‘nalish</option>{programs.map(y => <option key={y.id} value={y.id}>{y.nomi}</option>)}</select><select className={inputClass} value={filters.talim_shakli} onChange={e => setFilters({ ...filters, talim_shakli: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">Barcha shakl</option>{(filterOptions.shakllar || []).map(x => <option key={x}>{x}</option>)}</select><select className={inputClass} value={filters.talim_tili} onChange={e => setFilters({ ...filters, talim_tili: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">Barcha til</option>{(filterOptions.tillar || []).map(x => <option key={x}>{x}</option>)}</select><select className={inputClass} value={filters.qabul_turi} onChange={e => setFilters({ ...filters, qabul_turi: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">Grant + kontrakt</option><option value="grant">Davlat granti</option><option value="kontrakt">To‘lov-kontrakt</option></select><select className={inputClass} value={filters.region} onChange={e => setFilters({ ...filters, region: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">Barcha hudud</option>{(filterOptions.hududlar || []).map(x => <option key={x}>{x}</option>)}</select></div><div className="mt-2 flex items-center justify-between"><select className="rounded-lg border px-2 py-1.5 text-xs" value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })} style={{ borderColor: COLORS.line }}><option value="ball_desc">Ball: yuqoridan</option><option value="ball_asc">Ball: pastdan</option><option value="name">F.I.Sh.</option><option value="newest">Yangi import</option></select><button onClick={load} className="inline-flex items-center gap-1 text-xs font-black" style={{ color: COLORS.blue }}><RefreshCcw size={14} /> Yangilash</button></div></Card>
      <ErrorBox text={error} />
      <Card className="overflow-hidden">{busy ? <div className="p-12 text-center"><Loader2 className="mx-auto animate-spin" style={{ color: COLORS.blue }} /></div> : !items.length ? <div className="p-5"><Empty>Bu filtrda talaba yo‘q</Empty></div> : <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead style={{ background: COLORS.cream, color: COLORS.muted }}><tr>{["F.I.Sh.", "Ball", "Yo‘nalish", "Qabul turi", "Ta’lim", "Qayerdan", "Aloqa", "Holat"].map(h => <th key={h} className="px-4 py-3 text-xs font-black">{h}</th>)}</tr></thead><tbody>{items.map(s => <tr key={s.id} className="border-t" style={{ borderColor: COLORS.line }}><td className="px-4 py-3"><button onClick={() => showDetail(s.id)} className="font-black hover:underline" style={{ color: COLORS.ink }}>{s.fish}</button></td><td className="px-4 py-3 font-black" style={{ color: COLORS.blue }}>{s.ball}</td><td className="px-4 py-3"><div className="font-bold">{s.yonalish_nomi}</div></td><td className="px-4 py-3"><Pill tone={(s.tavsiya_turi || "").toLowerCase().includes("grant") ? "green" : "violet"}>{(s.tavsiya_turi || "").toLowerCase().includes("grant") ? "Grant" : "Kontrakt"}</Pill></td><td className="px-4 py-3 text-xs">{s.talim_shakli}<br />{s.talim_tili}</td><td className="px-4 py-3 text-xs">{s.doimiy_region}<br />{s.doimiy_tuman}</td><td className="px-4 py-3"><button onClick={() => showDetail(s.id)} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.line, color: COLORS.blue }}><Phone size={13} /> {s.telefon_mask || "Raqam"}</button></td><td className="px-4 py-3"><div className="flex flex-wrap gap-1">{s.qabul_bosqichi === 1 && permissions.hujjat_belgilash && <button onClick={() => markDocs(s.id)}><Pill tone="amber">Hujjatni tasdiqlash</Pill></button>}{s.qabul_bosqichi >= 2 && s.qabul_bosqichi < 3 && permissions.saytga_kiritish && <button onClick={() => invite(s.id)}><Pill tone={s.sayt_holati === "taklif_yuborilgan" ? "amber" : "blue"}>{s.sayt_holati === "taklif_yuborilgan" ? "SMSni qayta yuborish" : "SMS taklif"}</Pill></button>}{s.sayt_holati === "taklif_yuborilgan" && <Pill tone="amber">Taklif yuborilgan</Pill>}{s.qabul_bosqichi >= 3 && <Pill tone="green">Saytga kirgan</Pill>}</div></td></tr>)}</tbody></table></div>}</Card>
      {pages > 1 && <div className="flex items-center justify-center gap-3"><Button kind="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Oldingi</Button><span className="text-sm font-black">{page} / {pages}</span><Button kind="secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>Keyingi</Button></div>}
    </>}
    <StudentDetail student={detail} onClose={() => setDetail(null)} />
  </div>;
}

function TutorPanel({ api, token, universityId, structure }) {
  const [rows, setRows] = useState([]); const [staff, setStaff] = useState([]); const [error, setError] = useState("");
  const [form, setForm] = useState({ tyutor_user_id: "", yonalish_id: "", talim_shakli: "", talim_tili: "" });
  const programs = (structure?.fakultetlar || []).flatMap(f => (f.kafedralar || []).flatMap(d => (d.yonalishlar || []).map(y => ({ ...y, label: `${f.nomi} · ${y.nomi}` }))));
  const load = useCallback(() => {
    Promise.all([
      api(`/api/institut/v20/tyutor/yetarlilik?universitet_id=${universityId}&token=${encodeURIComponent(token)}`),
      api(`/api/institut/v20/xodimlar?universitet_id=${universityId}&token=${encodeURIComponent(token)}`),
    ]).then(([capacity, people]) => { setRows(capacity.yonalishlar || []); setStaff((people.xodimlar || []).filter(x => x.rol === "tyutor")); }).catch(e => setError(e.message));
  }, [api, token, universityId]);
  useEffect(() => { load(); }, [load]);
  const assign = async () => {
    setError("");
    try {
      await api("/api/institut/v20/tyutor/biriktir", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, universitet_id: universityId, tyutor_user_id: Number(form.tyutor_user_id), yonalish_id: Number(form.yonalish_id), talim_shakli: form.talim_shakli || undefined, talim_tili: form.talim_tili || undefined }) });
      setForm({ tyutor_user_id: "", yonalish_id: "", talim_shakli: "", talim_tili: "" }); load();
    } catch (e) { setError(e.message); }
  };
  return <div className="space-y-4"><Card className="p-5"><div className="flex items-start gap-3"><ShieldCheck style={{ color: COLORS.teal }} /><div><h3 className="font-black" style={{ color: COLORS.ink }}>Tyutor nazorati</h3><p className="mt-1 text-sm" style={{ color: COLORS.muted }}>Kunduzgi 1–3-kursning har 120–150 talabasi uchun kamida 1 tyutor mezoni.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4"><Field label="Tyutor"><select className={inputClass} value={form.tyutor_user_id} onChange={e => setForm({ ...form, tyutor_user_id: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">Tanlang</option>{staff.map(x => <option key={x.user_id} value={x.user_id}>{x.full_name}</option>)}</select></Field><Field label="Yo‘nalish"><select className={inputClass} value={form.yonalish_id} onChange={e => setForm({ ...form, yonalish_id: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">Tanlang</option>{programs.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></Field><Field label="Ta’lim shakli (ixtiyoriy)"><select className={inputClass} value={form.talim_shakli} onChange={e => setForm({ ...form, talim_shakli: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">Barchasi</option>{["Kunduzgi", "Kechki", "Sirtqi", "Masofaviy", "Dual ta'lim"].map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Ta’lim tili (ixtiyoriy)"><select className={inputClass} value={form.talim_tili} onChange={e => setForm({ ...form, talim_tili: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">Barchasi</option>{["O‘zbekcha", "Ruscha", "Tojikcha"].map(x => <option key={x}>{x}</option>)}</select></Field></div><Button onClick={assign} disabled={!form.tyutor_user_id || !form.yonalish_id} className="mt-4">Tyutorni yo‘nalishga biriktirish</Button></Card><ErrorBox text={error} /><div className="grid gap-3 md:grid-cols-2">{rows.map(r => <Card key={r.id} className="p-4"><div className="flex items-center justify-between gap-3"><div><div className="font-black" style={{ color: COLORS.ink }}>{r.nomi}</div><div className="mt-1 text-xs" style={{ color: COLORS.muted }}>{r.kunduzgi_1kurs} kunduzgi qabul · {r.tyutor_soni} tyutor</div></div><Pill tone={r.yetarli ? "green" : "red"}>{r.yetarli ? "Yetarli" : `${r.tavsiya_etilgan_minimum} ta kerak`}</Pill></div></Card>)}</div></div>;
}

function AccessPanel({ api, token, onRedeemed }) {
  const [code, setCode] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const redeem = async () => { setBusy(true); setError(""); try { await api("/api/institut/v20/kirish_kodi_qabul", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, kirish_kodi: code }) }); onRedeemed(); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  return <Card className="mx-auto max-w-xl p-6"><div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: COLORS.sky, color: COLORS.blue }}><KeyRound /></div><h2 className="mt-4 text-xl font-black" style={{ color: COLORS.ink }}>Sizda institut paroli bormi?</h2><p className="mt-2 text-sm" style={{ color: COLORS.muted }}>Admin bergan 12 xonali bir martalik kodni kiriting. Kod qaysi institut, fakultet, kafedra, yo‘nalish va lavozim uchun yaratilgan bo‘lsa, aynan o‘sha joyga ulaydi.</p><input className={`${inputClass} mt-5 font-mono uppercase tracking-widest`} value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={12} placeholder="A1B2C3D4E5F6" style={{ borderColor: COLORS.line }} /><div className="mt-3"><ErrorBox text={error} /></div><Button onClick={redeem} disabled={busy || code.length < 8} className="mt-4 w-full">{busy ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />} Institutga ulanish</Button></Card>;
}

function StudentHome({ api, token, universityId }) {
  const [data, setData] = useState(null); const [error, setError] = useState("");
  useEffect(() => { api(`/api/institut/v20/talaba/yonalish_katalogi?universitet_id=${universityId}&token=${encodeURIComponent(token)}`).then(setData).catch(e => setError(e.message)); }, [api, token, universityId]);
  if (error) return <ErrorBox text={error} />; if (!data) return <Loader2 className="mx-auto animate-spin" style={{ color: COLORS.blue }} />;
  return <div className="space-y-4"><Card className="overflow-hidden"><div className="p-6" style={{ background: "linear-gradient(135deg,#E9F7F7,#F7F1E8)" }}><Pill tone="violet">MENING YO‘NALISHIM</Pill><h2 className="mt-3 text-2xl font-black" style={{ color: COLORS.ink }}>{data.yonalish.nomi}</h2><p className="mt-1 text-sm" style={{ color: COLORS.muted }}>{data.yonalish.fakultet_nomi} · {data.yonalish.kafedra_nomi}</p></div></Card><div className="grid gap-4 lg:grid-cols-2"><Card className="p-5"><h3 className="font-black" style={{ color: COLORS.ink }}>Dekan, admin va tyutorlar</h3><div className="mt-3 space-y-2">{data.masullar.map((x, i) => <div key={i} className="flex items-center justify-between rounded-xl p-3" style={{ background: COLORS.cream }}><span className="font-bold">{x.fish}</span><Pill tone="violet">{x.lavozim_nomi}</Pill></div>)}</div></Card><Card className="p-5"><h3 className="font-black" style={{ color: COLORS.ink }}>Yo‘nalish talabalari</h3><p className="mt-1 text-xs" style={{ color: COLORS.muted }}>Shaxsiy ma’lumot, ball va telefon ko‘rsatilmaydi.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{data.talabalar.map(x => <div key={x.id} className="rounded-xl p-3 text-sm font-bold" style={{ background: COLORS.sky }}>{x.fish}</div>)}</div></Card></div></div>;
}

export default function InstituteWorkspace({ token, apiBase, initialWorkspace, onBack, canCreateInstitution = false }) {
  const api = useApi(apiBase, token); const [bootstrap, setBootstrap] = useState(null); const [structure, setStructure] = useState(null);
  const [tab, setTab] = useState("dashboard"); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [credentials, setCredentials] = useState([]); const [manualUniversityId, setManualUniversityId] = useState(null);
  const workspaceId = initialWorkspace?.context_id || null;
  const legacyUniversityId = !workspaceId ? initialWorkspace?.muassasa_id : null;
  const load = useCallback(async (explicitId) => {
    setLoading(true); setError("");
    try {
      const qs = new URLSearchParams({ token }); if (explicitId || manualUniversityId || legacyUniversityId) qs.set("universitet_id", explicitId || manualUniversityId || legacyUniversityId); else if (workspaceId) qs.set("workspace_id", workspaceId);
      const b = await api(`/api/institut/v20/bootstrap?${qs}`); setBootstrap(b);
      const s = await api(`/api/institut/v20/tuzilma?universitet_id=${b.universitet.id}&token=${encodeURIComponent(token)}`); setStructure(s);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [api, token, workspaceId, legacyUniversityId, manualUniversityId]);
  useEffect(() => { load(); }, [load]);
  const refreshStructure = async () => { if (!bootstrap) return; try { setStructure(await api(`/api/institut/v20/tuzilma?universitet_id=${bootstrap.universitet.id}&token=${encodeURIComponent(token)}`)); } catch {} };
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 size={30} className="animate-spin" style={{ color: COLORS.blue }} /></div>;
  if (!bootstrap) {
    if (canCreateInstitution) return <InstituteCreate api={api} token={token} onCreated={id => { setManualUniversityId(id); load(id); }} onBack={onBack} />;
    return <div className="mx-auto max-w-xl p-6"><ErrorBox text={error || "Institut topilmadi"} /><div className="mt-4"><AccessPanel api={api} token={token} onRedeemed={() => load()} /></div></div>;
  }
  const id = bootstrap.universitet.id; const permissions = bootstrap.ruxsatlar || {};
  if (bootstrap.asosiy_rol === "talaba") return <main className="mx-auto max-w-6xl p-4 md:p-7"><button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-black" style={{ color: COLORS.blue }}><ArrowLeft size={17} /> Bosh sahifa</button><StudentHome api={api} token={token} universityId={id} /></main>;
  const tabs = [
    ["dashboard", "Asosiy", GraduationCap], ["structure", "Tuzilma", Building2],
    ["staff", "Xodimlar", Users], ["admission", "1-kurs qabuli", ClipboardCheck],
    ["tutors", "Tyutorlar", ShieldCheck], ["access", "Parol bilan kirish", KeyRound],
  ].filter(([key]) => key !== "admission" || permissions.qabul_korish);
  return <main className="min-h-screen" style={{ background: "linear-gradient(180deg,#F4FAFB 0,#FAF8F3 48%,#F7FAFB 100%)" }}>
    <div className="mx-auto max-w-[1500px] p-3 md:p-6">
      <header className="mb-4 overflow-hidden rounded-3xl border" style={{ borderColor: COLORS.line, background: "linear-gradient(135deg,#153E5B,#14797A)" }}><div className="flex flex-col gap-5 p-5 text-white md:flex-row md:items-center md:justify-between md:p-7"><div className="flex items-start gap-4"><button onClick={onBack} className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><ArrowLeft size={19} /></button><div><div className="text-xs font-black tracking-[.18em] text-white/70">INSTITUT ISH MAYDONI</div><h1 className="mt-1 text-2xl font-black md:text-3xl">{bootstrap.universitet.nomi}</h1><div className="mt-2 flex flex-wrap gap-2"><Pill>{bootstrap.rollar.map(r => r.rol).join(" · ")}</Pill><span className="text-xs text-white/70">{bootstrap.universitet.viloyat} {bootstrap.universitet.tuman}</span></div></div></div><div className="grid grid-cols-3 gap-2">{[[bootstrap.sonlar.fakultet, "Fakultet"], [bootstrap.sonlar.yonalish, "Yo‘nalish"], [bootstrap.sonlar.talaba, "Qabul"]].map(([n, l]) => <div key={l} className="rounded-2xl bg-white/12 px-4 py-3 text-center"><div className="text-xl font-black">{n}</div><div className="text-[10px] font-bold text-white/70">{l}</div></div>)}</div></div></header>
      <nav className="mb-4 flex gap-2 overflow-x-auto pb-1">{tabs.map(([key, label, Icon]) => <button key={key} onClick={() => setTab(key)} className="inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black" style={{ background: tab === key ? COLORS.blue : "#fff", color: tab === key ? "#fff" : COLORS.ink, borderColor: tab === key ? COLORS.blue : COLORS.line }}><Icon size={16} />{label}</button>)}</nav>
      {error && <div className="mb-4"><ErrorBox text={error} /></div>}
      {tab === "dashboard" && <div className="grid gap-4 lg:grid-cols-3"><Card className="p-5 lg:col-span-2"><h2 className="text-xl font-black" style={{ color: COLORS.ink }}>Tizim tayyorligi</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{[["Fakultet va kafedralar", bootstrap.sonlar.fakultet > 0], ["Ta’lim yo‘nalishlari", bootstrap.sonlar.yonalish > 0], ["1-kurs qabul bazasi", bootstrap.sonlar.talaba > 0]].map(([l, ok]) => <div key={l} className="rounded-2xl p-4" style={{ background: ok ? "#ECF7F0" : "#FFF6E8" }}><div className="flex items-center gap-2 font-black" style={{ color: ok ? COLORS.green : COLORS.amber }}>{ok ? <CheckCircle2 size={18} /> : <RefreshCcw size={18} />}{l}</div></div>)}</div><div className="mt-5 rounded-2xl border p-4 text-sm" style={{ borderColor: COLORS.line, color: COLORS.muted }}>Ketma-ketlik: <b>1) Tuzilma</b> → <b>2) Xodim va rollar</b> → <b>3) Qabul importi</b> → <b>4) Tyutorlarni yo‘nalishga biriktirish</b>. Guruhlar HEMISga o‘tkazilgandan keyin alohida bosqichda ochiladi.</div></Card><AccessPanel api={api} token={token} onRedeemed={() => load()} /></div>}
      {tab === "structure" && <StructurePanel api={api} apiBase={apiBase} token={token} universityId={id} canManage={permissions.tuzilma_boshqarish} onChanged={() => load()} onCredentials={setCredentials} />}
      {tab === "staff" && <StaffPanel api={api} token={token} universityId={id} structure={structure} canManage={permissions.xodim_boshqarish} onCredentials={setCredentials} />}
      {tab === "admission" && <AdmissionsPanel api={api} apiBase={apiBase} token={token} universityId={id} structure={structure} permissions={permissions} onCredentials={setCredentials} />}
      {tab === "tutors" && <TutorPanel api={api} token={token} universityId={id} structure={structure} />}
      {tab === "access" && <AccessPanel api={api} token={token} onRedeemed={() => load()} />}
    </div>
    <CredentialsModal items={credentials} onClose={() => setCredentials([])} />
  </main>;
}
