import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Building2, CheckCircle2, ChevronRight, ClipboardCheck, Download,
  Eye, FileSpreadsheet, GraduationCap, KeyRound, Loader2, MessageCircle,
  Phone, Plus, RefreshCcw, Search, Send, ShieldCheck, Upload, UserPlus, Users, X,
} from "lucide-react";
import { registerPhoneBackHandler } from "../pwa/samtmPwa.js";

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

const FACULTY_WIDE_ROLES = new Set(["dekan", "zam_dekan", "manaviyatchi", "fakultet_admin"]);
const DEPARTMENT_WIDE_ROLES = new Set(["kafedra_mudiri"]);
const structureKey = value => String(value || "").normalize("NFKD").replace(/[’‘`´]/g, "'").replace(/[^\p{L}\p{N}]+/gu, "").toLocaleLowerCase("uz");

function canonicalizeInstituteStructure(payload) {
  const data = { ...(payload || {}), fakultetlar: [] };
  data.fakultetlar = (payload?.fakultetlar || []).map(faculty => {
    const departmentGroups = new Map();
    (faculty.kafedralar || []).forEach(department => {
      const key = structureKey(department.nomi);
      const current = departmentGroups.get(key);
      if (!current) departmentGroups.set(key, { ...department, yonalishlar: [...(department.yonalishlar || [])], alias_ids: [department.id] });
      else {
        current.alias_ids = [...new Set([...(current.alias_ids || []), department.id])];
        current.yonalishlar.push(...(department.yonalishlar || []));
        if (!current.mudir && department.mudir) current.mudir = department.mudir;
      }
    });
    const departments = [...departmentGroups.values()];
    const programGroups = new Map();
    departments.forEach(department => {
      (department.yonalishlar || []).forEach(program => {
        const key = structureKey(program.nomi);
        const entry = { department, program };
        if (!programGroups.has(key)) programGroups.set(key, []);
        programGroups.get(key).push(entry);
      });
      department.yonalishlar = [];
    });
    programGroups.forEach(variants => {
      const chosen = [...variants].sort((a, b) => Number(b.program.talaba_soni || 0) - Number(a.program.talaba_soni || 0) || Number(b.program.id || 0) - Number(a.program.id || 0))[0];
      const merged = { ...chosen.program };
      merged.alias_ids = [...new Set(variants.flatMap(x => x.program.alias_ids || [x.program.id]).map(Number))];
      merged.talaba_soni = variants.reduce((sum, x) => sum + Number(x.program.talaba_soni || 0), 0);
      merged.talim_shakllari = [...new Set(variants.flatMap(x => x.program.talim_shakllari || []).filter(Boolean))];
      merged.talim_tillari = [...new Set(variants.flatMap(x => x.program.talim_tillari || []).filter(Boolean))];
      chosen.department.yonalishlar.push(merged);
    });
    departments.forEach(department => department.yonalishlar.sort((a, b) => String(a.nomi).localeCompare(String(b.nomi), "uz")));
    return { ...faculty, kafedralar: departments, kafedra_soni: departments.length, yonalish_soni: programGroups.size };
  });
  return data;
}

function Card({ children, className = "", style = {}, ...props }) {
  return <section {...props} className={`rounded-3xl border bg-white ${className}`} style={{ borderColor: COLORS.line, boxShadow: "0 12px 36px rgba(23,50,71,.06)", ...style }}>{children}</section>;
}

function Pill({ children, tone = "blue" }) {
  const map = { blue: [COLORS.sky, COLORS.blue], green: ["#EAF6EF", COLORS.green], amber: ["#FFF4DF", COLORS.amber], red: ["#FCECEC", COLORS.red], violet: ["#F2EEFB", COLORS.violet], gray: ["#EEF2F4", COLORS.muted] };
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

function downloadBase64File(file) {
  if (!file?.base64 || !file?.fayl_nomi) return;
  const raw = atob(file.base64); const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const link = document.createElement("a"); link.href = url; link.download = file.fayl_nomi; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
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
        <Pill tone="violet">Administratorni faqat super admin biriktiradi</Pill>
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

function FileImport({ apiBase, token, universityId, facultyId, type, templateHref, onCommitted, departments = [] }) {
  const [file, setFile] = useState(null); const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [matches, setMatches] = useState({}); const [confirmOtm, setConfirmOtm] = useState(false);
  const isAdmission = type === "qabul"; const isStaff = type === "xodim";
  const previewPath = isAdmission ? "/api/institut/v20/qabul/import_preview" : isStaff ? "/api/institut/v20/xodim/import_preview" : "/api/institut/v20/tuzilma/import_preview";
  const commitPath = isAdmission ? "/api/institut/v20/qabul/import_commit" : isStaff ? "/api/institut/v20/xodim/import_commit" : "/api/institut/v20/tuzilma/import_commit";
  const runPreview = async () => {
    if (!file) return setError("Faylni tanlang"); setBusy(true); setError("");
    try {
      const fd = new FormData(); fd.append("fayl", file);
      const facultyQuery = isAdmission && facultyId ? `&fakultet_id=${facultyId}` : "";
      const res = await fetch(`${apiBase}${previewPath}?universitet_id=${universityId}${facultyQuery}&token=${encodeURIComponent(token)}`, { method: "POST", body: fd });
      const data = await res.json(); if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : data.detail?.message || "Import xatosi");
      const initialMatches = {};
      Object.entries(data.xulosa?.yonalish_moslashtirish || {}).forEach(([name, item]) => {
        if (item.tanlangan_yonalish_id) initialMatches[name] = `p:${item.tanlangan_yonalish_id}`;
        else if (item.tanlangan_kafedra_id) initialMatches[name] = `d:${item.tanlangan_kafedra_id}`;
      });
      setMatches(initialMatches); setConfirmOtm(false); setPreview(data);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const commit = async () => {
    const matchItems = Object.entries(preview?.xulosa?.yonalish_moslashtirish || {});
    if (isAdmission && preview?.xulosa?.otm_nomi_farqi?.length && !confirmOtm) return setError("Fayldagi OTM nomi farqini avval tasdiqlang");
    const programMap = {}, departmentMap = {};
    Object.entries(matches).forEach(([name, value]) => {
      if (String(value).startsWith("p:")) programMap[name] = Number(String(value).slice(2));
      if (String(value).startsWith("d:")) departmentMap[name] = Number(String(value).slice(2));
    });
    setBusy(true); setError("");
    try {
      const commitPayload = isStaff
        ? { token, batch_id: preview.batch_id }
        : { token, batch_id: preview.batch_id, auto_create_yonalishlar: true, yonalish_mosliklari: programMap, yangi_yonalish_kafedralari: departmentMap, otm_nomi_farqini_tasdiqlash: confirmOtm };
      const res = await fetch(`${apiBase}${commitPath}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(commitPayload) });
      const data = await res.json(); if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : data.detail?.message || "Saqlash xatosi");
      downloadBase64File(data.kirish_kodlari_fayli); onCommitted(data); setPreview(null); setFile(null); setMatches({});
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const s = preview?.xulosa;
  const matchingItems = Object.entries(s?.yonalish_moslashtirish || {});
  const allMatched = true;
  return <Card className="p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black" style={{ color: COLORS.ink }}>{isAdmission ? "Qabul ro‘yxatini import qilish" : isStaff ? "O‘qituvchi va xodimlarni import qilish" : "Institut tuzilmasini import qilish"}</h3><p className="mt-1 text-xs" style={{ color: COLORS.muted }}>{isAdmission ? ".xls yoki .xlsx — Davlat qabul fayli ham taniladi" : isStaff ? "Faqat XODIMLAR varag‘i tekshiriladi; tuzilma takroran yaratilmaydi" : "INSTITUT + TUZILMA + XODIMLAR varaqlari"}</p></div><a href={templateHref} download className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black" style={{ borderColor: COLORS.line, color: COLORS.blue }}><Download size={15} /> Shablonni yuklash</a></div>
    <div className="mt-4 flex flex-col gap-3 md:flex-row"><label className="flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 text-sm" style={{ borderColor: COLORS.line, color: COLORS.muted }}><FileSpreadsheet size={18} />{file ? file.name : "Excel faylni tanlang"}<input type="file" accept={isAdmission || isStaff ? ".xls,.xlsx" : ".xlsx"} className="hidden" onChange={e => { setFile(e.target.files?.[0] || null); setPreview(null); }} /></label><Button onClick={runPreview} disabled={busy || !file} kind="secondary">{busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Tekshirish</Button></div>
    {s && <div className="mt-5 space-y-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">{Object.entries(isAdmission ? { "Jami": s.jami_qator, "Yaroqli": s.yaroqli, "Xato": s.xato_soni, "Yo‘nalish": Object.keys(s.yonalishlar || {}).length, "Til": Object.keys(s.talim_tillari || {}).length } : isStaff ? { "Xodim": s.xodim_soni, "Yaroqli": Math.max(0, Number(s.xodim_soni || 0) - Number(s.xato_soni || 0)), "Xato": s.xato_soni } : { "Fakultet": s.fakultet_soni, "Kafedra": s.kafedra_soni, "Variant": s.yonalish_variant_soni, "Xodim": s.xodim_soni, "Xato": s.xato_soni }).map(([k, v]) => <div key={k} className="rounded-2xl p-3" style={{ background: k === "Xato" && v ? "#FFF0F0" : COLORS.sky }}><div className="text-xl font-black" style={{ color: k === "Xato" && v ? COLORS.red : COLORS.blue }}>{v ?? 0}</div><div className="text-[11px] font-bold" style={{ color: COLORS.muted }}>{k}</div></div>)}</div>
      {!!s.xatolar?.length && <div className="max-h-44 overflow-auto rounded-2xl border p-3 text-xs" style={{ borderColor: "#EDBDBD", background: "#FFF6F6", color: COLORS.red }}>{s.xatolar.map((e, i) => <div key={i} className="mb-1">{e.varaq ? `${e.varaq} · ` : ""}{e.qator ? `${e.qator}-qator: ` : ""}{(e.xatolar || []).join("; ")}</div>)}</div>}
      {!!s.ogohlantirishlar?.length && <div className="max-h-44 overflow-auto rounded-2xl border p-3 text-xs" style={{ borderColor: "#F0D39A", background: "#FFF8EA", color: COLORS.amber }}><div className="mb-2 font-black">{s.ogohlantirish_soni || s.ogohlantirishlar.length} ta ogohlantirish — ma’lumot o‘zgartirilmaydi, manba faylni tekshiring</div>{s.ogohlantirishlar.map((item, index) => <div key={index} className="mb-1">{item.qator ? `${item.qator}-qator: ` : ""}{item.ogohlantirish}</div>)}</div>}
      {isAdmission && matchingItems.length > 0 && <div className="space-y-3"><div><h4 className="font-black" style={{ color: COLORS.ink }}>Yo‘nalishlarni aniq moslash</h4><p className="text-xs" style={{ color: COLORS.muted }}>Excelning “Yo‘nalish” ustuni avval mavjud ta’lim yo‘nalishidan qidiriladi. Topilsa o‘sha yo‘nalishga ulanadi; kafedra deb qabul qilinmaydi.</p></div>{matchingItems.map(([name, item]) => {
        const options = (item.kafedra_variantlari || []).map(x => ({ value: `d:${x.id}`, label: `${x.nomi} (${x.moslik_foizi}%)` }));
        const willCreate = !matches[name];
        return <div key={name} className="rounded-2xl border p-4" style={{ borderColor: "#B8DCC8", background: "#F2FAF5" }}><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div><div className="font-black" style={{ color: COLORS.ink }}>Excelda: {name}</div><div className="text-xs" style={{ color: COLORS.muted }}>{item.talaba_soni} talaba · {willCreate ? `“${item.yaratiladigan_kafedra_nomi || name}” kafedrasi avtomatik yaratiladi` : "mavjud kafedraga bog‘lanadi"}</div></div><Pill tone={willCreate ? "amber" : "green"}>{willCreate ? "Yangi kafedra" : "Moslandi"}</Pill></div><div className="mb-3 flex flex-wrap gap-1.5">{(item.variantlar || []).map(v => <Pill key={`${v.talim_shakli}-${v.talim_tili}`} tone="blue">{v.talim_shakli} · {v.talim_tili} — {v.talaba_soni}</Pill>)}</div><select className={inputClass} value={matches[name] || ""} onChange={e => setMatches(old => ({ ...old, [name]: e.target.value }))} style={{ borderColor: COLORS.line }}><option value="">Avtomatik yangi kafedra yaratish</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
      })}</div>}
      {isAdmission && !!s.otm_nomi_farqi?.length && <label className="flex items-start gap-2 rounded-2xl border p-4 text-sm font-bold" style={{ borderColor: "#F0D39A", background: "#FFF8EA", color: COLORS.amber }}><input type="checkbox" checked={confirmOtm} onChange={e => setConfirmOtm(e.target.checked)} className="mt-1" /><span>Fayldagi OTM nomi farq qiladi: {s.otm_nomi_farqi.join(", ")}. Shu institutga tegishli ekanini tasdiqlayman.</span></label>}
      <Button onClick={commit} disabled={busy || !preview.commit_mumkin || !allMatched || (isAdmission && !!s.otm_nomi_farqi?.length && !confirmOtm)} className="w-full"><CheckCircle2 size={17} /> {isAdmission ? "Talabalarni va kirish kodlarini import qilish" : isStaff ? "Xodimlarni va kirish kodlarini import qilish" : "Xatosiz ma’lumotlarni bazaga kiritish"}</Button>
    </div>}
    <div className="mt-3"><ErrorBox text={error} /></div>
  </Card>;
}

function StructureEntryChoices({ onManual, onImport }) {
  const choices = [
    {
      key: "manual",
      icon: Plus,
      title: "Qo‘lda kiritish",
      text: "Fakultetlar sonini, fakultet, kafedra va yo‘nalish nomlarini saytda birma-bir kiriting.",
      action: "Qo‘lda boshlash",
      color: COLORS.blue,
      background: "linear-gradient(135deg,#EAF5F8,#F7FBFC)",
      onClick: onManual,
    },
    {
      key: "import",
      icon: FileSpreadsheet,
      title: "Shablon orqali import",
      text: "XLSX shablonni yuklang, Excelda to‘ldiring, tekshirtiring va xatosiz bo‘lsa bir marta import qiling.",
      action: "Shablon va importni ochish",
      color: COLORS.teal,
      background: "linear-gradient(135deg,#EAF7F1,#FBFDF8)",
      onClick: onImport,
    },
  ];
  return <div className="grid gap-3 md:grid-cols-2">
    {choices.map(({ key, icon: Icon, title, text, action, color, background, onClick }) => <button key={key} type="button" onClick={onClick} className="group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: COLORS.line, background }}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white" style={{ color }}><Icon size={21} /></span>
      <span className="mt-4 block text-lg font-black" style={{ color: COLORS.ink }}>{title}</span>
      <span className="mt-1 block text-sm leading-6" style={{ color: COLORS.muted }}>{text}</span>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-black" style={{ color }}>{action}<ChevronRight size={16} /></span>
    </button>)}
  </div>;
}

function StructurePanel({ api, apiBase, token, universityId, canManage, permissions, onChanged, onCredentials, onNextAdmission, onOpenStaff, onBackToWorkspace, onInitialFacultyBack, onProgramDepthChange, onFacultyContextChange, startMode, onStartModeConsumed, focusFacultyId = null, facultyContextLocked = false }) {
  const [data, setData] = useState(null); const [mode, setMode] = useState("view"); const [error, setError] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [archiveItems, setArchiveItems] = useState([]);
  const initialFacultyAppliedRef = useRef(null);
  const load = useCallback(async () => { try { setData(canonicalizeInstituteStructure(await api(`/api/institut/v20/tuzilma?universitet_id=${universityId}&token=${encodeURIComponent(token)}`))); } catch (e) { setError(e.message); } }, [api, token, universityId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!data || !focusFacultyId || String(initialFacultyAppliedRef.current) === String(focusFacultyId)) return;
    const faculty = (data.fakultetlar || []).find(x => String(x.id) === String(focusFacultyId));
    if (faculty) {
      initialFacultyAppliedRef.current = String(focusFacultyId);
      setSelectedFaculty(faculty);
    }
  }, [data, focusFacultyId]);
  useEffect(() => {
    onProgramDepthChange?.(!!selectedProgram);
  }, [onProgramDepthChange, selectedProgram]);
  useEffect(() => () => onProgramDepthChange?.(false), [onProgramDepthChange]);
  useEffect(() => {
    if (!startMode) return;
    setMode(startMode);
    onStartModeConsumed?.();
  }, [startMode, onStartModeConsumed]);
  useEffect(() => registerPhoneBackHandler("institute-structure", () => {
    if (selectedProgram) {
      setSelectedProgram(null);
      return true;
    }
    if (selectedFaculty) {
      if (facultyContextLocked) onInitialFacultyBack?.();
      else {
        setSelectedFaculty(null);
        onFacultyContextChange?.(null);
      }
      return true;
    }
    if (mode !== "view") {
      setMode("view");
      return true;
    }
    onBackToWorkspace?.();
    return true;
  }), [facultyContextLocked, mode, onBackToWorkspace, onFacultyContextChange, onInitialFacultyBack, selectedFaculty, selectedProgram]);
  const committed = result => { onCredentials(result.kirish_kodlari || []); setMode("view"); load(); onChanged(); if (result.keyingi_bosqich === "qabul_importi") onNextAdmission?.(); };
  const archiveStructure = async (kind, item) => {
    try {
      const preview = await api(`/api/institut/v20/tuzilma/arxiv_preview?universitet_id=${universityId}&obyekt_turi=${kind}&obyekt_id=${item.id}&token=${encodeURIComponent(token)}`);
      const h = preview.hisoblar || {};
      if (!window.confirm(`${preview.nomi}\n\n${h.talaba || 0} talaba · ${h.xodim || 0} xodim · ${h.yonalish || 0} yo‘nalish bog‘langan.\n\nHaqiqatan arxivlaysizmi? Ma’lumot 1 yil saqlanadi.`)) return;
      await api("/api/institut/v20/tuzilma/arxivlash", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, universitet_id: universityId, obyekt_turi: kind, obyekt_id: item.id, tasdiq: true }) });
      setSelectedFaculty(null); onFacultyContextChange?.(null); await load(); onChanged?.();
    } catch (e) { setError(e.message); }
  };
  const openArchive = async () => { try { const result = await api(`/api/institut/v20/tuzilma/arxiv?universitet_id=${universityId}&token=${encodeURIComponent(token)}`); setArchiveItems(result.arxiv || []); setMode("archive"); } catch (e) { setError(e.message); } };
  const restoreArchive = async item => { try { await api(`/api/institut/v20/tuzilma/arxiv/${item.id}/tiklash`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, universitet_id: universityId }) }); await openArchive(); await load(); onChanged?.(); } catch (e) { setError(e.message); } };
  if (!data) return <div className="py-16 text-center"><Loader2 className="mx-auto animate-spin" style={{ color: COLORS.blue }} /></div>;
  if (selectedFaculty && selectedProgram) return <div className="space-y-4">
    <button onClick={() => setSelectedProgram(null)} className="inline-flex items-center gap-2 text-sm font-black" style={{ color: COLORS.blue }}><ArrowLeft size={17} /> {selectedFaculty.nomi} yo‘nalishlariga qaytish</button>
    <DirectionWorkspace api={api} apiBase={apiBase} token={token} universityId={universityId} structure={data} permissions={permissions} onCredentials={onCredentials} faculty={selectedFaculty} program={selectedProgram} />
  </div>;
  if (selectedFaculty) return <div className="space-y-4">
    <button onClick={() => { if (facultyContextLocked) onInitialFacultyBack?.(); else { setSelectedFaculty(null); onFacultyContextChange?.(null); } }} className="inline-flex items-center gap-2 text-sm font-black" style={{ color: COLORS.blue }}><ArrowLeft size={17} /> {facultyContextLocked ? "Oldingi bo‘limga qaytish" : "Fakultetlar ro‘yxatiga qaytish"}</button>
    <Card className="p-5" style={{ background: "linear-gradient(135deg,#EAF5F8,#FBF7EE)" }}><div className="flex items-start justify-between gap-3"><div><Pill tone="blue">FAKULTET</Pill><h2 className="mt-2 text-2xl font-black" style={{ color: COLORS.ink }}>{selectedFaculty.nomi}</h2><p className="mt-1 text-sm" style={{ color: COLORS.muted }}>{selectedFaculty.kafedra_soni} kafedra · {selectedFaculty.yonalish_soni} yo‘nalish</p></div>{canManage && <button onClick={() => archiveStructure("fakultet", selectedFaculty)} className="rounded-xl border px-3 py-2 font-black" style={{ borderColor: COLORS.line }} title="Fakultet amallari">…</button>}</div></Card>
    <Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><Pill tone="green">YO‘NALISHLAR</Pill><h3 className="mt-2 font-black" style={{ color: COLORS.ink }}>Yo‘nalishni tanlang — talaba, o‘qituvchi va tyutorlar o‘sha yerda ochiladi</h3></div><Pill tone="blue">{selectedFaculty.yonalish_soni || 0} ta</Pill></div><div className="mt-4 grid gap-3 md:grid-cols-2">{selectedFaculty.kafedralar.flatMap(d => d.yonalishlar.map(y => <button type="button" key={y.id} onClick={() => setSelectedProgram({ ...y, kafedra_nomi: d.nomi, kafedra_id: d.id })} className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: COLORS.line, background: "#fff" }}><div className="flex items-start justify-between gap-3"><div><div className="font-black" style={{ color: COLORS.blue }}>{y.nomi}</div><div className="mt-1 text-xs" style={{ color: COLORS.muted }}>{y.daraja || "Daraja belgilanmagan"} · {d.nomi}</div></div><ChevronRight size={18} style={{ color: COLORS.blue }} /></div><div className="mt-3 flex flex-wrap gap-1"><Pill tone={Number(y.talaba_soni) ? "green" : "gray"}>{y.talaba_soni || 0} talaba</Pill>{(y.talim_shakllari || []).map(x => <Pill key={`${y.id}-s-${x}`} tone="blue">{x}</Pill>)}{(y.talim_tillari || []).map(x => <Pill key={`${y.id}-t-${x}`} tone="violet">{x}</Pill>)}</div></button>))}{!selectedFaculty.yonalish_soni && <Empty>Hali yo‘nalish yo‘q. Avval tuzilma bo‘limida yo‘nalish yarating.</Empty>}</div></Card>
  </div>;
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2"><Button onClick={() => setMode("view")} kind={mode === "view" ? "primary" : "secondary"}>Tuzilma</Button>{canManage && <><Button onClick={() => setMode("manual")} kind={mode === "manual" ? "primary" : "secondary"}><Plus size={16} /> Qo‘lda kiritish</Button><Button onClick={() => setMode("import")} kind={mode === "import" ? "primary" : "secondary"}><FileSpreadsheet size={16} /> Shablon orqali import</Button><Button onClick={openArchive} kind={mode === "archive" ? "primary" : "secondary"}>1 yillik arxiv</Button></>}</div>
    {mode === "archive" && <Card className="p-5"><h3 className="font-black" style={{ color: COLORS.ink }}>Tuzilma arxivi</h3><p className="mt-1 text-xs" style={{ color: COLORS.muted }}>Arxivlangan fakultet, kafedra va yo‘nalishlar 1 yil ichida qaytariladi.</p><div className="mt-4 space-y-2">{archiveItems.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3" style={{ borderColor: COLORS.line }}><div><div className="font-black">{item.nomi}</div><div className="text-xs" style={{ color: COLORS.muted }}>{item.obyekt_turi} · {(item.hisoblar || {}).talaba || 0} talaba · {(item.hisoblar || {}).xodim || 0} xodim</div></div><Button onClick={() => restoreArchive(item)} kind="secondary">Qaytarish</Button></div>)}{!archiveItems.length && <Empty>Arxiv bo‘sh</Empty>}</div></Card>}
    {mode === "manual" && <ManualStructure api={api} token={token} universityId={universityId} onSaved={() => { setMode("view"); load(); onChanged(); }} />}
    {mode === "import" && <FileImport apiBase={apiBase} token={token} universityId={universityId} type="tuzilma" templateHref={`${apiBase}/api/institut/v20/tuzilma/shablon?universitet_id=${universityId}&token=${encodeURIComponent(token)}`} onCommitted={committed} />}
    {mode === "view" && !!data.fakultetlar.length && <Card className="p-4"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-black" style={{ color: COLORS.ink }}>Institut rahbariyati:</span>{(data.institut_rahbariyat || []).filter(x => x.rol !== "owner").map(x => <Pill key={`${x.rol}-${x.user_id}`} tone="violet">{ROLE_OPTIONS.find(r => r[0] === x.rol)?.[1] || x.rol}: {x.full_name}</Pill>)}{!(data.institut_rahbariyat || []).some(x => x.rol === "rektor") && <Pill tone="red">Rektor kiritilmagan</Pill>}{canManage && <button onClick={onOpenStaff} className="ml-auto rounded-lg border px-3 py-1.5 text-xs font-black" style={{ borderColor: COLORS.line }}>… Rahbar qo‘shish</button>}</div></Card>}
    {mode === "view" && <>{!data.fakultetlar.length ? <Card className="p-5 md:p-6"><Pill tone="amber">BIRINCHI QADAM</Pill><h2 className="mt-3 text-xl font-black" style={{ color: COLORS.ink }}>Institut tuzilmasini qanday kiritasiz?</h2><p className="mb-5 mt-1 text-sm" style={{ color: COLORS.muted }}>Ikkala usul ham bir xil natija beradi. Istalganini tanlang.</p>{canManage ? <StructureEntryChoices onManual={() => setMode("manual")} onImport={() => setMode("import")} /> : <Empty>Tuzilmani kiritish uchun administrator ruxsati kerak.</Empty>}</Card> : data.fakultetlar.map(f => <Card key={f.id} onClick={() => { setSelectedFaculty(f); onFacultyContextChange?.(f.id); }} className="cursor-pointer overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex flex-wrap items-center justify-between gap-3 p-5" style={{ background: "linear-gradient(135deg,#EDF7F8,#FBF7EE)" }}><div><h3 className="text-lg font-black" style={{ color: COLORS.ink }}>{f.nomi}</h3><p className="text-xs" style={{ color: COLORS.muted }}>{f.kafedra_soni} kafedra · {f.yonalish_soni} yo‘nalish</p><div className="mt-2 flex flex-wrap gap-1">{(f.rahbariyat || []).filter(x => x.rol !== "fakultet_admin").map(x => <Pill key={x.id} tone="violet">{ROLE_OPTIONS.find(r => r[0] === x.rol)?.[1] || x.rol}: {x.full_name}</Pill>)}</div></div><Pill tone={f.toldirilish.tayyor ? "green" : "amber"}>{f.toldirilish.tayyor ? "Rahbariyat to‘liq" : `Dekan ${f.toldirilish.dekan}/1 · Zam ${f.toldirilish.zam_dekan}/2 · Ma’naviy ${f.toldirilish.manaviyatchi}/1 · Admin ${f.toldirilish.admin}/1`}</Pill></div><div className="grid gap-3 p-5 md:grid-cols-2">{f.kafedralar.map(d => <div key={d.id} className="rounded-2xl border p-4" style={{ borderColor: COLORS.line }}><div className="flex items-center justify-between gap-2"><div className="font-black" style={{ color: COLORS.teal }}>{d.nomi}</div>{canManage && <button onClick={e => { e.stopPropagation(); archiveStructure("kafedra", d); }} className="rounded-lg border px-2 py-1 font-black" style={{ borderColor: COLORS.line }} title="Kafedra amallari">…</button>}</div><div className="mt-1 text-xs font-bold" style={{ color: d.mudir ? COLORS.green : COLORS.red }}>{d.mudir ? `Mudir: ${d.mudir.full_name}` : "Mudir kiritilmagan"}</div><div className="mt-2 space-y-1">{d.yonalishlar.length ? d.yonalishlar.map(y => <div key={y.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs" style={{ background: COLORS.cream, color: COLORS.ink }}><span>{y.nomi} · {y.daraja}</span>{canManage && <button onClick={e => { e.stopPropagation(); archiveStructure("yonalish", y); }} className="font-black" title="Yo‘nalish amallari">…</button>}</div>) : <span className="text-xs" style={{ color: COLORS.muted }}>Yo‘nalish yo‘q</span>}</div></div>)}</div></Card>)}</>}
    <ErrorBox text={error} />
  </div>;
}

function StaffPanel({ api, apiBase = "", token, universityId, structure, canManage, canManageAdmins, isSuperAdmin, onCredentials, facultyId = null }) {
  const scopedFacultyId = facultyId ? String(facultyId) : "";
  const [staff, setStaff] = useState([]); const [form, setForm] = useState({ fish: "", telefon: "", rol: "dekan", fakultet_id: scopedFacultyId, kafedra_id: "", yonalish_id: "", ilmiy_daraja: "", ilmiy_unvon: "", staj_yil: "", mutaxassislik: "", qisqa_izoh: "" });
  const [editingId, setEditingId] = useState(null);
  const [archiveMode, setArchiveMode] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [showStaffImport, setShowStaffImport] = useState(false);
  const load = useCallback(async () => { try { const d = await api(`/api/institut/v20/xodimlar?universitet_id=${universityId}&arxiv=${archiveMode ? "true" : "false"}&token=${encodeURIComponent(token)}`); setStaff((d.xodimlar || []).filter(x => !scopedFacultyId || String(x.fakultet_id || "") === scopedFacultyId)); } catch (e) { setError(e.message); } }, [api, token, universityId, archiveMode, scopedFacultyId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!scopedFacultyId) return;
    setForm(old => ({ ...old, fakultet_id: scopedFacultyId, kafedra_id: "", yonalish_id: "" }));
  }, [scopedFacultyId]);
  const faculties = (structure?.fakultetlar || []).filter(f => !scopedFacultyId || String(f.id) === scopedFacultyId);
  const departments = faculties.flatMap(f => (f.kafedralar || []).map(d => ({ ...d, fakultet_id: f.id, fakultet_nomi: f.nomi })));
  const programs = departments.flatMap(d => (d.yonalishlar || []).map(y => ({ ...y, kafedra_id: d.id, fakultet_id: d.fakultet_id })));
  const roleOptions = ROLE_OPTIONS.filter(([value]) =>
    (canManageAdmins || !["institut_admin", "fakultet_admin"].includes(value))
    && (!scopedFacultyId || !["rektor", "prorektor", "institut_admin"].includes(value))
  );
  const facultyWide = FACULTY_WIDE_ROLES.has(form.rol);
  const departmentWide = DEPARTMENT_WIDE_ROLES.has(form.rol);
  const scopeText = facultyWide
    ? "Bu lavozim tanlangan fakultetdagi barcha kafedra, yo‘nalish va talabalarni vakolati doirasida ko‘radi. Kafedra yoki yo‘nalishni alohida tanlash shart emas."
    : departmentWide
      ? "Bu lavozim tanlangan kafedradagi barcha yo‘nalishlarni ko‘radi."
      : "Kerak bo‘lsa xodim vakolatini aniq kafedra yoki yo‘nalish bilan cheklashingiz mumkin.";
  const save = async () => {
    setBusy(true); setError("");
    try {
      const payload = { token, universitet_id: universityId, fish: form.fish, rol: form.rol, fakultet_id: form.fakultet_id ? Number(form.fakultet_id) : undefined, kafedra_id: !facultyWide && form.kafedra_id ? Number(form.kafedra_id) : undefined, yonalish_id: !facultyWide && !departmentWide && form.yonalish_id ? Number(form.yonalish_id) : undefined, ilmiy_daraja: form.ilmiy_daraja || undefined, ilmiy_unvon: form.ilmiy_unvon || undefined, staj_yil: form.staj_yil === "" ? undefined : Number(form.staj_yil), mutaxassislik: form.mutaxassislik || undefined, qisqa_izoh: form.qisqa_izoh || undefined };
      const data = editingId ? await api(`/api/institut/v20/xodim/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, faol: true }) }) : await api("/api/institut/v20/xodim/manual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, telefon: form.telefon || undefined }) });
      if (!editingId) onCredentials([data]); setEditingId(null); setForm({ fish: "", telefon: "", rol: "dekan", fakultet_id: scopedFacultyId, kafedra_id: "", yonalish_id: "", ilmiy_daraja: "", ilmiy_unvon: "", staj_yil: "", mutaxassislik: "", qisqa_izoh: "" }); load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const setActive = async (x, faol) => {
    if (!faol && !window.confirm(`${x.full_name} xodimlar arxiviga o'tkazilsinmi? Keyin qayta tiklash mumkin.`)) return;
    try {
      await api(`/api/institut/v20/xodim/${x.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, universitet_id: universityId, fish: x.full_name, rol: x.rol, fakultet_id: x.fakultet_id || undefined, kafedra_id: x.kafedra_id || undefined, yonalish_id: x.yonalish_id || undefined, faol }) });
      load();
    } catch (e) { setError(e.message); }
  };
  const revealCode = async x => {
    try { const d = await api(`/api/institut/v20/xodim/${x.id}/kirish_kodi`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }); onCredentials([d]); }
    catch (e) { setError(e.message); }
  };
  return <div className="space-y-4">
    {canManageAdmins && <Card className="p-5" style={{ background: "linear-gradient(135deg,#EEF3FC,#FBF8FF)" }}><div className="flex flex-wrap items-center justify-between gap-3"><div><Pill tone="violet">SUPER ADMIN</Pill><h3 className="mt-2 font-black" style={{ color: COLORS.ink }}>Administrator qo‘shish sizga ochiq</h3><p className="mt-1 text-sm" style={{ color: COLORS.muted }}>Institut administratori butun institutni, fakultet administratori esa tanlangan fakultetni boshqaradi.</p></div><ShieldCheck style={{ color: COLORS.violet }} /></div></Card>}
    {canManage && <Card className="p-5" style={{ background: "linear-gradient(135deg,#EAF7F1,#FBFDF8)" }}><div className="flex flex-wrap items-center justify-between gap-3"><div><Pill tone="green">EXCEL ORQALI</Pill><h3 className="mt-2 font-black" style={{ color: COLORS.ink }}>O‘qituvchi va xodimlar shabloni</h3><p className="mt-1 text-sm" style={{ color: COLORS.muted }}>Maxsus <b>XODIMLAR</b> varag‘ini to‘ldiring. Import faqat xodimlarni tekshiradi va institut tuzilmasini takrorlamaydi.</p></div><div className="flex flex-wrap gap-2"><a href={`${apiBase}/api/institut/v20/xodim/shablon?universitet_id=${universityId}&token=${encodeURIComponent(token)}`} download className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-black" style={{ borderColor: COLORS.line, color: COLORS.blue }}><Download size={16} /> Shablonni yuklash</a><Button kind="secondary" onClick={() => setShowStaffImport(value => !value)}><FileSpreadsheet size={16} /> {showStaffImport ? "Importni yopish" : "XODIMLAR varag‘ini import qilish"}</Button></div></div></Card>}
    {canManage && showStaffImport && <FileImport apiBase={apiBase} token={token} universityId={universityId} type="xodim" templateHref={`${apiBase}/api/institut/v20/xodim/shablon?universitet_id=${universityId}&token=${encodeURIComponent(token)}`} onCommitted={() => { setShowStaffImport(false); load(); }} />}
    {canManage && <Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black" style={{ color: COLORS.ink }}>Xodim va vakolatini biriktirish</h3>{isSuperAdmin && <Pill tone="violet">Super administrator</Pill>}</div><div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3"><Field label="F.I.Sh."><input className={inputClass} value={form.fish} onChange={e => setForm({ ...form, fish: e.target.value })} style={{ borderColor: COLORS.line }} /></Field><Field label="Telefon"><input className={inputClass} value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })} placeholder="+998901234567" style={{ borderColor: COLORS.line }} /></Field><Field label="Lavozim"><select className={inputClass} value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value, fakultet_id: scopedFacultyId, kafedra_id: "", yonalish_id: "" })} style={{ borderColor: COLORS.line }}>{roleOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field><Field label="Fakultet" hint={facultyWide ? "Majburiy: butun fakultet qamrovi" : undefined}><select disabled={!!scopedFacultyId} className={inputClass} value={form.fakultet_id} onChange={e => setForm({ ...form, fakultet_id: e.target.value, kafedra_id: "", yonalish_id: "" })} style={{ borderColor: COLORS.line }}><option value="">—</option>{faculties.map(f => <option key={f.id} value={f.id}>{f.nomi}</option>)}</select></Field><Field label={facultyWide ? "Kafedra — barchasi" : "Kafedra"}><select disabled={facultyWide} className={inputClass} value={facultyWide ? "" : form.kafedra_id} onChange={e => setForm({ ...form, kafedra_id: e.target.value, yonalish_id: "" })} style={{ borderColor: COLORS.line }}><option value="">{facultyWide ? "Barcha kafedralar" : "—"}</option>{departments.filter(d => !form.fakultet_id || String(d.fakultet_id) === String(form.fakultet_id)).map(d => <option key={d.id} value={d.id}>{d.nomi}</option>)}</select></Field><Field label={facultyWide || departmentWide ? "Yo‘nalish — barchasi" : "Yo‘nalish"}><select disabled={facultyWide || departmentWide} className={inputClass} value={facultyWide || departmentWide ? "" : form.yonalish_id} onChange={e => setForm({ ...form, yonalish_id: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">{facultyWide || departmentWide ? "Barcha yo‘nalishlar" : "—"}</option>{programs.filter(y => !form.kafedra_id || String(y.kafedra_id) === String(form.kafedra_id)).map(y => <option key={y.id} value={y.id}>{y.nomi}</option>)}</select></Field></div><div className="mt-4 rounded-2xl border p-4" style={{ borderColor: COLORS.line, background: COLORS.cream }}><div className="mb-3 text-xs font-black" style={{ color: COLORS.muted }}>KASBIY MA’LUMOTLAR (IXTIYORIY)</div><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"><Field label="Ilmiy daraja"><input className={inputClass} value={form.ilmiy_daraja} onChange={e => setForm({ ...form, ilmiy_daraja: e.target.value })} placeholder="PhD, DSc..." style={{ borderColor: COLORS.line }} /></Field><Field label="Ilmiy unvon"><input className={inputClass} value={form.ilmiy_unvon} onChange={e => setForm({ ...form, ilmiy_unvon: e.target.value })} placeholder="Dotsent, professor..." style={{ borderColor: COLORS.line }} /></Field><Field label="Pedagogik staj (yil)"><input type="number" min="0" max="80" step="0.5" className={inputClass} value={form.staj_yil} onChange={e => setForm({ ...form, staj_yil: e.target.value })} style={{ borderColor: COLORS.line }} /></Field><Field label="Mutaxassislik"><input className={inputClass} value={form.mutaxassislik} onChange={e => setForm({ ...form, mutaxassislik: e.target.value })} placeholder="Boshlang‘ich ta’lim metodikasi" style={{ borderColor: COLORS.line }} /></Field><Field label="Qisqa izoh"><input className={inputClass} value={form.qisqa_izoh} onChange={e => setForm({ ...form, qisqa_izoh: e.target.value })} placeholder="Vazifasi yoki yo‘nalishi" style={{ borderColor: COLORS.line }} /></Field></div></div><div className="mt-3 rounded-2xl p-3 text-xs font-bold" style={{ background: COLORS.sky, color: COLORS.blue }}><ShieldCheck className="mr-2 inline" size={15} />{scopeText}</div><div className="mt-4"><ErrorBox text={error} /></div><Button onClick={save} disabled={busy || !form.fish.trim() || (facultyWide && !form.fakultet_id) || (departmentWide && !form.kafedra_id)} className="mt-4">{busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} {editingId ? "O‘zgarishni saqlash" : "Biriktirish va 2 oylik parol yaratish"}</Button></Card>}
    <Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-5" style={{ borderColor: COLORS.line }}><div><h3 className="font-black" style={{ color: COLORS.ink }}>{archiveMode ? "Xodimlar arxivi" : "Institut xodimlari"}</h3><p className="mt-1 text-xs" style={{ color: COLORS.muted }}>Mas’ulni bosing: tahrirlash, kirish kodi, arxivlash va tiklash ishlaydi.</p></div>{canManage && <Button kind="secondary" onClick={() => setArchiveMode(v => !v)}>{archiveMode ? "Faol xodimlar" : "Arxiv"}</Button>}</div>{!staff.length ? <div className="p-5"><Empty>{archiveMode ? "Arxiv bo‘sh" : "Xodim yo‘q"}</Empty></div> : <div className="divide-y" style={{ borderColor: COLORS.line }}>{staff.map(x => <div key={x.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><div className="font-black" style={{ color: COLORS.ink }}>{x.full_name}</div><div className="text-xs" style={{ color: COLORS.muted }}>{x.fakultet_nomi || "Institut"}{x.yonalish_nomi ? ` · ${x.yonalish_nomi}` : x.kafedra_nomi ? ` · ${x.kafedra_nomi}` : ""}</div>{(x.ilmiy_daraja || x.ilmiy_unvon || x.mutaxassislik || x.staj_yil != null) && <div className="mt-1 text-[11px] font-bold" style={{ color: COLORS.blue }}>{[x.ilmiy_daraja, x.ilmiy_unvon, x.mutaxassislik, x.staj_yil != null ? `${x.staj_yil} yil staj` : null].filter(Boolean).join(" · ")}</div>}</div><div className="flex flex-wrap gap-2">{canManage && !archiveMode && <><button onClick={() => { setEditingId(x.id); setForm({ fish: x.full_name, telefon: "", rol: x.rol, fakultet_id: x.fakultet_id ? String(x.fakultet_id) : "", kafedra_id: x.kafedra_id ? String(x.kafedra_id) : "", yonalish_id: x.yonalish_id ? String(x.yonalish_id) : "", ilmiy_daraja: x.ilmiy_daraja || "", ilmiy_unvon: x.ilmiy_unvon || "", staj_yil: x.staj_yil == null ? "" : String(x.staj_yil), mutaxassislik: x.mutaxassislik || "", qisqa_izoh: x.qisqa_izoh || "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-lg border px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.line, color: COLORS.blue }}>Tahrirlash</button>{Number(x.user_id) < 0 && <button onClick={() => revealCode(x)} className="rounded-lg border px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.line, color: COLORS.violet }}>Kirish kodi</button>}<button onClick={() => setActive(x, false)} className="rounded-lg border px-2 py-1 text-xs font-black" style={{ borderColor: "#E8BABA", color: COLORS.red }}>Arxivlash</button></>}{canManage && archiveMode && <button onClick={() => setActive(x, true)} className="rounded-lg border px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.line, color: COLORS.green }}>Qayta tiklash</button>}<Pill tone="violet">{x.lavozim_nomi}</Pill><Pill tone={x.kirish_holati === "ulangan" ? "green" : "amber"}>{x.kirish_holati || "Hisob mavjud"}</Pill></div></div>)}</div>}</Card>
  </div>;
}

function CredentialsModal({ items, onClose }) {
  if (!items.length) return null;
  const copy = () => navigator.clipboard?.writeText(items.map(x => `${x.fish}\t${x.lavozim || x.lavozim_nomi}\t${x.kirish_kodi}`).join("\n"));
  return <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"><Card className="max-h-[86vh] w-full max-w-2xl overflow-auto p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black" style={{ color: COLORS.ink }}>Kirish kodlari</h2><p className="mt-1 text-sm" style={{ color: COLORS.muted }}>Kod 2 oy amal qiladi. Talaba birinchi marta saytga kirguncha vakolatli admin uni qayta ko‘ra oladi.</p></div><button onClick={onClose}><X /></button></div><div className="mt-4 space-y-2">{items.map((x, i) => <div key={i} className="grid gap-2 rounded-xl border p-3 md:grid-cols-[1fr_1fr_auto]" style={{ borderColor: COLORS.line }}><span className="font-bold">{x.fish}</span><span className="text-sm" style={{ color: COLORS.muted }}>{x.lavozim || x.lavozim_nomi}</span><code className="rounded-lg px-2 py-1 font-black" style={{ background: COLORS.sky, color: COLORS.blue }}>{x.kirish_kodi}</code></div>)}</div><Button onClick={copy} className="mt-4 w-full"><KeyRound size={16} /> Hammasini copy qilish</Button></Card></div>;
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

function DailyAdmissionReport({ api, token, universityId, facultyId = null }) {
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dailyReport, setDailyReport] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!reportDate) return;
    const qs = new URLSearchParams({ universitet_id: String(universityId), kun: reportDate, token });
    if (facultyId) qs.set("fakultet_id", String(facultyId));
    setError("");
    api(`/api/institut/v20/qabul/kunlik_hisobot?${qs}`).then(setDailyReport).catch(e => setError(e.message));
  }, [api, facultyId, reportDate, token, universityId]);
  return <>
    <Card className="p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><Pill tone="blue">KUNLIK HISOBOT</Pill><h3 className="mt-2 font-black" style={{ color: COLORS.ink }}>Kalendar bo‘yicha qabul harakati</h3><p className="mt-1 text-xs" style={{ color: COLORS.muted }}>{facultyId ? "Faqat shu fakultet" : "Institut"} bo‘yicha hujjat, baza va saytga kirish tanlangan kun kesimida ko‘rinadi.</p></div><Field label="Hisobot kuni"><input type="date" className={inputClass} value={reportDate} onChange={e => setReportDate(e.target.value)} style={{ borderColor: COLORS.line }} /></Field></div><div className="mt-4 grid gap-3 md:grid-cols-3">{[["Hujjat topshirgan", dailyReport?.hisoblar?.hujjat || 0, "amber"], ["Bazaga kiritilgan", dailyReport?.hisoblar?.baza || 0, "violet"], ["Saytga kirgan", dailyReport?.hisoblar?.sayt || 0, "green"]].map(([label, count, tone]) => <div key={label} className="rounded-2xl p-4" style={{ background: tone === "green" ? "#EAF6EF" : tone === "violet" ? "#F2EEFB" : "#FFF4DF" }}><Pill tone={tone}>{label}</Pill><div className="mt-2 text-2xl font-black" style={{ color: COLORS.ink }}>{count}</div></div>)}</div>{!!dailyReport?.yonalishlar?.length && <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead style={{ color: COLORS.muted }}><tr><th className="px-3 py-2">Fakultet</th><th className="px-3 py-2">Yo‘nalish</th><th className="px-3 py-2">Hujjat</th><th className="px-3 py-2">Baza</th><th className="px-3 py-2">Sayt</th></tr></thead><tbody>{dailyReport.yonalishlar.map(row => <tr key={`${row.fakultet_id}-${row.yonalish_id}`} className="border-t" style={{ borderColor: COLORS.line }}><td className="px-3 py-2">{row.fakultet_nomi}</td><td className="px-3 py-2 font-bold">{row.yonalish_nomi}</td><td className="px-3 py-2">{row.hujjat}</td><td className="px-3 py-2">{row.baza}</td><td className="px-3 py-2">{row.sayt}</td></tr>)}</tbody></table></div>}</Card>
    <ErrorBox text={error} />
  </>;
}

function AdmissionsPanel({ api, apiBase, token, universityId, structure, permissions, onCredentials, startMode, onStartModeConsumed, lockedFacultyId = null, lockedProgramId = null, lockedProgramIds = null, compactProgram = false, showDailyReport = true }) {
  const fullStatuses = !!permissions.qabul_holatlari_toliq;
  const [mode, setMode] = useState("list"); const [tab, setTab] = useState("all"); const [items, setItems] = useState([]); const [counts, setCounts] = useState({});
  const [filters, setFilters] = useState({ q: "", yonalish_id: lockedProgramId ? String(lockedProgramId) : "", talim_shakli: "", talim_tili: "", qabul_turi: "", region: "", sort: "ball_desc" });
  const [filterOptions, setFilterOptions] = useState({ shakllar: [], tillar: [], hududlar: [] });
  const [page, setPage] = useState(1); const [pages, setPages] = useState(0); const [detail, setDetail] = useState(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [selectedFacultyId, setSelectedFacultyId] = useState(lockedFacultyId ? String(lockedFacultyId) : "");
  const faculties = useMemo(() => structure?.fakultetlar || [], [structure]);
  const programs = useMemo(() => faculties.flatMap(f => (f.kafedralar || []).flatMap(d => (d.yonalishlar || []).map(y => ({ ...y, fakultet_id: f.id, fakultet_nomi: f.nomi, kafedra_nomi: d.nomi })))), [faculties]);
  const visiblePrograms = useMemo(() => programs.filter(y => !selectedFacultyId || String(y.fakultet_id) === selectedFacultyId), [programs, selectedFacultyId]);
  const departments = useMemo(() => faculties.flatMap(f => (f.kafedralar || []).map(d => ({ ...d, fakultet_id: f.id, fakultet_nomi: f.nomi }))), [faculties]);
  useEffect(() => { if (!startMode) return; setMode(startMode); onStartModeConsumed?.(); }, [startMode, onStartModeConsumed]);
  useEffect(() => { if (!fullStatuses || compactProgram) setTab("all"); }, [compactProgram, fullStatuses]);
  useEffect(() => { if (lockedFacultyId) setSelectedFacultyId(String(lockedFacultyId)); }, [lockedFacultyId]);
  useEffect(() => { if (lockedProgramId) { setFilters(old => ({ ...old, yonalish_id: String(lockedProgramId) })); setMode("list"); setPage(1); } }, [lockedProgramId]);
  useEffect(() => { if (!selectedFacultyId && faculties.length === 1) setSelectedFacultyId(String(faculties[0].id)); }, [faculties, selectedFacultyId]);
  useEffect(() => registerPhoneBackHandler("institute-admissions", () => {
    if (detail) {
      setDetail(null);
      return true;
    }
    if (!compactProgram && mode !== "list") {
      setMode("list");
      return true;
    }
    return false;
  }, 260), [compactProgram, detail, mode]);
  const load = useCallback(async () => {
    if (!permissions.qabul_korish) return;
    setBusy(true); setError("");
    try {
      const qs = new URLSearchParams({ universitet_id: universityId, token, page: String(page), page_size: "50", sort: filters.sort });
      if (selectedFacultyId) qs.set("fakultet_id", selectedFacultyId);
      if (fullStatuses && !compactProgram && tab !== "all") qs.set("holat", tab);
      Object.entries(filters).forEach(([k, v]) => { if (v && k !== "sort" && k !== "yonalish_id") qs.set(k, v); });
      const selectedProgram = programs.find(program => String(program.id) === String(filters.yonalish_id));
      const requestedProgramIds = lockedProgramIds?.length
        ? lockedProgramIds
        : selectedProgram?.alias_ids?.length
          ? selectedProgram.alias_ids
          : (lockedProgramId || filters.yonalish_id ? [lockedProgramId || filters.yonalish_id] : []);
      if (requestedProgramIds.length > 1) qs.set("yonalish_ids", requestedProgramIds.join(","));
      else if (requestedProgramIds.length === 1) qs.set("yonalish_id", String(requestedProgramIds[0]));
      const d = await api(`/api/institut/v20/qabul/talabalar?${qs}`); setItems(d.talabalar || []); setCounts(d.hisoblar || {}); setPages(d.sahifa_soni || 0); setFilterOptions(d.filtrlar || { shakllar: [], tillar: [], hududlar: [] });
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }, [api, universityId, token, tab, page, filters, selectedFacultyId, lockedProgramId, lockedProgramIds, permissions.qabul_korish, programs, fullStatuses, compactProgram]);
  useEffect(() => { load(); }, [load]);
  const showDetail = async id => { try { setDetail(await api(`/api/institut/v20/qabul/talaba/${id}?universitet_id=${universityId}&token=${encodeURIComponent(token)}`)); } catch (e) { setError(e.message); } };
  const markStage = async (id, bosqich) => { try { const d = await api(`/api/institut/v20/qabul/talaba/${id}/bosqich`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, bosqich }) }); if (d.kirish_kodi) onCredentials([{ fish: items.find(x => x.id === id)?.fish, lavozim: "Talaba", kirish_kodi: d.kirish_kodi }]); load(); } catch (e) { setError(e.message); } };
  const revealPassword = async id => { try { const d = await api(`/api/institut/v20/qabul/talaba/${id}/kirish_kodi?token=${encodeURIComponent(token)}`); onCredentials([{ fish: d.fish, lavozim: "Talaba", kirish_kodi: d.kirish_kodi }]); } catch (e) { setError(e.message); } };
  const invite = async id => { try { const d = await api(`/api/institut/v20/qabul/talaba/${id}/taklif`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, kanal: "sms" }) }); onCredentials([{ fish: items.find(x => x.id === id)?.fish, lavozim: "Talaba", kirish_kodi: d.kirish_kodi }]); load(); } catch (e) { setError(e.message); } };
  const statusCards = [
    ["all", "Barcha talabalar", counts.jami || 0, "blue"],
    ["hujjat", "Hujjat topshirgan", counts.hujjat || 0, "amber"],
    ["baza", "Bazaga kiritilgan", counts.baza || 0, "violet"],
    ["saytga_kirmagan", "Saytga kirmagan", counts.saytga_kirmagan ?? Math.max(0, Number(counts.jami || 0) - Number(counts.sayt || 0)), "red"],
    ["saytga_kirgan", "Saytga kirgan", counts.sayt || 0, "green"],
  ];
  return <div className="space-y-4">
    {!compactProgram && <div className="flex flex-wrap gap-2"><Button onClick={() => setMode("list")} kind={mode === "list" ? "primary" : "secondary"}><Users size={16} /> Talabalar</Button>{permissions.hujjat_belgilash && !lockedProgramId && <Button onClick={() => setMode("import")} kind={mode === "import" ? "primary" : "secondary"}><FileSpreadsheet size={16} /> Talabalarni import qilish</Button>}</div>}
    {!compactProgram && mode === "import" && <div className="space-y-4">{!lockedFacultyId && <Card className="p-5"><Pill tone="blue">1-QADAM</Pill><h3 className="mt-2 font-black" style={{ color: COLORS.ink }}>Talabalar qaysi fakultetga import qilinadi?</h3><p className="mt-1 text-xs" style={{ color: COLORS.muted }}>Fakultetni tanlang. Excel yo‘nalishlari shu fakultetdagi mavjud yo‘nalishlarga avtomatik moslanadi.</p><div className="mt-4 grid gap-2 md:grid-cols-2">{faculties.map(f => <button key={f.id} onClick={() => setSelectedFacultyId(String(f.id))} className="rounded-2xl border p-4 text-left" style={{ borderColor: String(f.id) === selectedFacultyId ? COLORS.blue : COLORS.line, background: String(f.id) === selectedFacultyId ? COLORS.sky : "#fff" }}><div className="font-black" style={{ color: COLORS.ink }}>{f.nomi}</div><div className="mt-1 text-xs" style={{ color: COLORS.muted }}>{f.yonalish_soni || 0} yo‘nalish</div></button>)}</div></Card>}{selectedFacultyId ? <FileImport apiBase={apiBase} token={token} universityId={universityId} facultyId={selectedFacultyId} type="qabul" templateHref="/templates/institut_qabul_shabloni.xlsx" departments={departments.filter(d => String(d.fakultet_id) === selectedFacultyId)} onCommitted={() => { setMode("list"); load(); }} /> : <Empty>Talaba importini ochish uchun fakultetni tanlang.</Empty>}</div>}
    {(compactProgram || mode === "list") && <>
      {!compactProgram && showDailyReport && fullStatuses && <DailyAdmissionReport api={api} token={token} universityId={universityId} facultyId={lockedFacultyId} />}
      {!compactProgram && (fullStatuses ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{statusCards.map(([id, label, count, tone]) => <button key={id} onClick={() => { setTab(id); setPage(1); }} className="rounded-2xl border p-4 text-left" style={{ borderColor: tab === id ? COLORS.blue : COLORS.line, background: tab === id ? COLORS.sky : "#fff" }}><Pill tone={tone}>{id === "all" ? "UMUMIY" : "HOLAT"}</Pill><div className="mt-2 text-2xl font-black" style={{ color: COLORS.ink }}>{count}</div><div className="text-xs font-bold" style={{ color: COLORS.muted }}>{label}</div></button>)}</div> : <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><Pill tone="violet">TYUTOR QAMROVI</Pill><div className="mt-2 font-black" style={{ color: COLORS.ink }}>Siz faqat biriktirilgan yo‘nalish, shakl va til talabalarini ko‘rasiz</div><div className="mt-1 text-xs" style={{ color: COLORS.muted }}>Tyutor o‘z qamrovida “Bazaga kiritildi” va “Saytga kirdi” holatlarini belgilaydi.</div></div><div className="flex gap-5 text-right"><div><div className="text-2xl font-black" style={{ color: COLORS.violet }}>{counts.baza || 0}</div><div className="text-xs font-bold" style={{ color: COLORS.muted }}>bazaga kiritilgan</div></div><div><div className="text-2xl font-black" style={{ color: COLORS.green }}>{counts.sayt || 0}</div><div className="text-xs font-bold" style={{ color: COLORS.muted }}>saytga kirgan</div></div></div></div></Card>)}
      <Card className="p-4"><div className={`grid gap-2 md:grid-cols-2 ${compactProgram ? "xl:grid-cols-6" : "xl:grid-cols-8"}`}><div className="relative xl:col-span-2"><Search size={16} className="absolute left-3 top-3" style={{ color: COLORS.muted }} /><input className={`${inputClass} pl-9`} value={filters.q} onChange={e => { setFilters({ ...filters, q: e.target.value }); setPage(1); }} placeholder="F.I.Sh. yoki AbiturID" style={{ borderColor: COLORS.line }} /></div>{!compactProgram && !lockedFacultyId && <select className={inputClass} value={selectedFacultyId} onChange={e => { setSelectedFacultyId(e.target.value); setFilters(old => ({ ...old, yonalish_id: "" })); setPage(1); }} style={{ borderColor: COLORS.line }}><option value="">Barcha fakultet</option>{faculties.map(f => <option key={f.id} value={f.id}>{f.nomi}</option>)}</select>}{!compactProgram && <select className={inputClass} value={filters.yonalish_id} onChange={e => { setFilters({ ...filters, yonalish_id: e.target.value }); setPage(1); }} style={{ borderColor: COLORS.line }}><option value="">Barcha yo‘nalish</option>{visiblePrograms.map(y => <option key={y.id} value={y.id}>{y.nomi}</option>)}</select>}<select className={inputClass} value={filters.talim_shakli} onChange={e => { setFilters({ ...filters, talim_shakli: e.target.value }); setPage(1); }} style={{ borderColor: COLORS.line }}><option value="">Barcha shakl</option>{(filterOptions.shakllar || []).map(x => <option key={x}>{x}</option>)}</select><select className={inputClass} value={filters.talim_tili} onChange={e => { setFilters({ ...filters, talim_tili: e.target.value }); setPage(1); }} style={{ borderColor: COLORS.line }}><option value="">Barcha til</option>{(filterOptions.tillar || []).map(x => <option key={x}>{x}</option>)}</select><select className={inputClass} value={filters.qabul_turi} onChange={e => { setFilters({ ...filters, qabul_turi: e.target.value }); setPage(1); }} style={{ borderColor: COLORS.line }}><option value="">Grant + kontrakt</option><option value="grant">Davlat granti</option><option value="kontrakt">To‘lov-kontrakt</option></select><select className={inputClass} value={filters.region} onChange={e => { setFilters({ ...filters, region: e.target.value }); setPage(1); }} style={{ borderColor: COLORS.line }}><option value="">Barcha hudud</option>{(filterOptions.hududlar || []).map(x => <option key={x}>{x}</option>)}</select></div><div className="mt-2 flex items-center justify-between"><select className="rounded-lg border px-2 py-1.5 text-xs" value={filters.sort} onChange={e => { setFilters({ ...filters, sort: e.target.value }); setPage(1); }} style={{ borderColor: COLORS.line }}><option value="ball_desc">Ball: yuqoridan</option><option value="ball_asc">Ball: pastdan</option><option value="name">F.I.Sh.</option><option value="newest">Yangi import</option></select><button onClick={load} className="inline-flex items-center gap-1 text-xs font-black" style={{ color: COLORS.blue }}><RefreshCcw size={14} /> Yangilash</button></div></Card>
      <ErrorBox text={error} />
      <Card className="overflow-hidden">{busy ? <div className="p-12 text-center"><Loader2 className="mx-auto animate-spin" style={{ color: COLORS.blue }} /></div> : !items.length ? <div className="p-5"><Empty>Bu filtrda talaba yo‘q</Empty></div> : <div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left text-sm"><thead style={{ background: COLORS.cream, color: COLORS.muted }}><tr>{["F.I.Sh.", "Ball", "Yo‘nalish", "Qabul turi", "Ta’lim", "Qayerdan", "Aloqa", "Holat va amal"].map(h => <th key={h} className="px-4 py-3 text-xs font-black">{h}</th>)}</tr></thead><tbody>{items.map(s => <tr key={s.id} className="border-t" style={{ borderColor: COLORS.line }}><td className="px-4 py-3"><button onClick={() => showDetail(s.id)} className="font-black hover:underline" style={{ color: COLORS.ink }}>{s.fish}</button></td><td className="px-4 py-3 font-black" style={{ color: COLORS.blue }}>{s.ball}</td><td className="px-4 py-3"><div className="font-bold">{s.yonalish_nomi}</div></td><td className="px-4 py-3"><Pill tone={(s.tavsiya_turi || "").toLowerCase().includes("grant") ? "green" : "violet"}>{(s.tavsiya_turi || "").toLowerCase().includes("grant") ? "Budjet / grant" : "Kontrakt"}</Pill></td><td className="px-4 py-3 text-xs">{s.talim_shakli}<br />{s.talim_tili}</td><td className="px-4 py-3 text-xs">{s.doimiy_region}<br />{s.doimiy_tuman}</td><td className="px-4 py-3"><button onClick={() => showDetail(s.id)} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-black" style={{ borderColor: COLORS.line, color: COLORS.blue }}><Phone size={13} /> {s.telefon_mask || "Raqam"}</button></td><td className="px-4 py-3"><div className="flex max-w-[390px] flex-wrap gap-1">{fullStatuses ? <><Pill tone="blue">Talaba</Pill><Pill tone={s.hujjat_topshirgan ? "amber" : "gray"}>{s.hujjat_topshirgan ? "Hujjat topshirgan" : "Hujjat kutilmoqda"}</Pill><Pill tone={s.bazaga_kiritilgan ? "violet" : "gray"}>{s.bazaga_kiritilgan ? "Bazaga kiritilgan" : "Bazaga kiritilmagan"}</Pill><Pill tone={s.saytga_kirgan ? "green" : "gray"}>{s.saytga_kirgan ? "Saytga kirgan" : "Saytga kirmagan"}</Pill>{!s.hujjat_topshirgan && permissions.hujjat_belgilash && <button onClick={() => markStage(s.id, 2)}><Pill tone="amber">✓ Hujjatni belgilash</Pill></button>}{s.hujjat_topshirgan && !s.bazaga_kiritilgan && permissions.bazaga_belgilash && <button onClick={() => markStage(s.id, 3)}><Pill tone="violet">✓ Bazaga kiritish</Pill></button>}{!s.saytga_kirgan && permissions.parol_korish && <button onClick={() => revealPassword(s.id)}><Pill tone="blue"><Eye size={12} className="mr-1" /> Parolni ko‘rish</Pill></button>}{s.bazaga_kiritilgan && !s.saytga_kirgan && permissions.parol_korish && <button onClick={() => invite(s.id)}><Pill tone="amber">SMS yuborish</Pill></button>}{s.bazaga_kiritilgan && !s.saytga_kirgan && permissions.saytga_kiritish && <button onClick={() => markStage(s.id, 4)}><Pill tone="green">✓ Saytga kirdi</Pill></button>}{s.saytga_kirgan && <Pill tone="gray">Parol yopildi</Pill>}</> : <>{s.bazaga_kiritilgan ? <Pill tone="violet">Bazaga kiritilgan</Pill> : s.bazaga_belgilash_mumkin && permissions.bazaga_belgilash ? <button onClick={() => markStage(s.id, 3)}><Pill tone="violet">✓ Bazaga kiritish</Pill></button> : <Pill tone="gray">Admin hujjatni tasdiqlashi kutilmoqda</Pill>}{s.saytga_kirgan ? <Pill tone="green">Saytga kirgan</Pill> : s.bazaga_kiritilgan && permissions.saytga_kiritish ? <button onClick={() => markStage(s.id, 4)}><Pill tone="green">✓ Saytga kirdi</Pill></button> : <Pill tone="gray">Saytga kirmagan</Pill>}</>}</div></td></tr>)}</tbody></table></div>}</Card>
      {pages > 1 && <div className="flex items-center justify-center gap-3"><Button kind="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Oldingi</Button><span className="text-sm font-black">{page} / {pages}</span><Button kind="secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>Keyingi</Button></div>}
    </>}
    <StudentDetail student={detail} onClose={() => setDetail(null)} />
  </div>;
}

const DIRECTION_STAFF_GROUPS = [
  { key: "rahbariyat", title: "Fakultet rahbariyati", roles: new Set(["dekan", "zam_dekan", "manaviyatchi"]) },
  { key: "mudirlar", title: "Kafedra mudiri", roles: new Set(["kafedra_mudiri"]) },
  { key: "teachers", title: "Professor-o‘qituvchilar", roles: new Set(["professor_oqituvchi"]) },
];

function DirectionPeoplePanel({ api, token, universityId, permissions, faculty, program, kind }) {
  const [rows, setRows] = useState([]); const [busy, setBusy] = useState(true); const [error, setError] = useState("");
  const programIds = useMemo(() => new Set((program.alias_ids || [program.id]).map(id => String(id))), [program.alias_ids, program.id]);
  useEffect(() => {
    let active = true;
    setBusy(true); setError("");
    const aliases = [...programIds].join(",");
    const path = `/api/institut/v20/xodimlar/team?universitet_id=${universityId}&yonalish_id=${program.id}&yonalish_ids=${encodeURIComponent(aliases)}&token=${encodeURIComponent(token)}`;
    api(path).then(data => {
      if (!active) return;
      if (kind === "tutors") {
        setRows(data.guruhlar?.tyutorlar || []);
        return;
      }
      setRows([
        ...(data.guruhlar?.fakultet_rahbariyati || []),
        ...(data.guruhlar?.kafedra_rahbariyati || []),
        ...(data.guruhlar?.oqituvchilar || []),
      ]);
    }).catch(e => active && setError(e.message)).finally(() => active && setBusy(false));
    return () => { active = false; };
  }, [api, kind, program.id, programIds, token, universityId]);
  if (busy) return <Card className="p-10 text-center"><Loader2 className="mx-auto animate-spin" style={{ color: COLORS.blue }} /></Card>;
  if (error) return <ErrorBox text={error} />;
  if (kind === "tutors") return <Card className="p-5"><div className="flex items-center justify-between gap-3"><div><Pill tone="violet">TYUTORLAR</Pill><h3 className="mt-2 font-black" style={{ color: COLORS.ink }}>Yo‘nalishga biriktirilgan tyutorlar</h3></div><Pill tone="blue">{rows.length} nafar</Pill></div>{!rows.length ? <div className="mt-4"><Empty>Bu yo‘nalishga tyutor biriktirilmagan.</Empty></div> : <div className="mt-4 grid gap-3 md:grid-cols-2">{rows.map(item => <div key={item.id} className="rounded-2xl border p-4" style={{ borderColor: COLORS.line }}><div className="font-black" style={{ color: COLORS.ink }}>{item.fish}</div><div className="mt-1 text-xs" style={{ color: COLORS.muted }}>{item.yonalish_nomi || item.kafedra_nomi || `${faculty.nomi} bo‘yicha qamrov`}</div><div className="mt-3 flex flex-wrap gap-1"><Pill tone="violet">{item.lavozim_nomi || "Tyutor"}</Pill>{item.mutaxassislik && <Pill tone="blue">{item.mutaxassislik}</Pill>}{item.staj_yil != null && <Pill tone="green">{item.staj_yil} yil staj</Pill>}</div></div>)}</div>}</Card>;
  return <div className="space-y-4">{DIRECTION_STAFF_GROUPS.map(group => {
    const people = rows.filter(item => group.roles.has(item.rol));
    return <Card key={group.key} className="p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-black" style={{ color: COLORS.ink }}>{group.title}</h3><Pill tone={people.length ? "green" : "gray"}>{people.length} nafar</Pill></div>{!people.length ? <div className="mt-3"><Empty>Bu bo‘lim uchun xodim kiritilmagan.</Empty></div> : <div className="mt-4 grid gap-3 md:grid-cols-2">{people.map(item => <article key={item.id} className="rounded-2xl border p-4" style={{ borderColor: COLORS.line, background: "#FBFDFD" }}><div className="flex items-start justify-between gap-3"><div><div className="font-black" style={{ color: COLORS.ink }}>{item.fish}</div><div className="mt-1 text-xs" style={{ color: COLORS.muted }}>{item.yonalish_nomi || item.kafedra_nomi || item.fakultet_nomi || faculty.nomi}</div></div><Pill tone="violet">{item.lavozim_nomi || ROLE_OPTIONS.find(role => role[0] === item.rol)?.[1] || item.rol}</Pill></div><div className="mt-3 grid grid-cols-3 gap-2 text-xs"><div className="rounded-xl p-2" style={{ background: COLORS.cream }}><b className="block" style={{ color: COLORS.muted }}>Daraja</b>{item.ilmiy_daraja || item.daraja || "Kiritilmagan"}</div><div className="rounded-xl p-2" style={{ background: COLORS.cream }}><b className="block" style={{ color: COLORS.muted }}>Unvon</b>{item.ilmiy_unvon || item.unvon || "Kiritilmagan"}</div><div className="rounded-xl p-2" style={{ background: COLORS.cream }}><b className="block" style={{ color: COLORS.muted }}>Staj</b>{item.staj_yil != null ? `${item.staj_yil} yil` : "Kiritilmagan"}</div></div>{item.mutaxassislik && <div className="mt-2 text-xs font-bold" style={{ color: COLORS.blue }}>{item.mutaxassislik}</div>}</article>)}</div>}</Card>;
  })}</div>;
}

function DirectionWorkspace({ api, apiBase, token, universityId, structure, permissions, onCredentials, faculty, program }) {
  const [section, setSection] = useState("students");
  const sections = [
    ["students", "Talabalar", Users, permissions.qabul_korish],
    ["teachers", "O‘qituvchilar", GraduationCap, permissions.xodim_korish],
    ["tutors", "Tyutorlar", ShieldCheck, permissions.tyutor_korish],
    ["groups", "Guruhlar", Building2, true],
  ];
  useEffect(() => {
    if (!sections.find(item => item[0] === section)?.[3]) setSection(sections.find(item => item[3])?.[0] || "groups");
  }, [section, permissions.qabul_korish, permissions.tyutor_korish, permissions.xodim_korish]);
  return <div className="space-y-4">
    <Card className="overflow-hidden"><div className="p-5 md:p-6" style={{ background: "linear-gradient(135deg,#E8F6F7,#FBF7EE)" }}><Pill tone="green">TA’LIM YO‘NALISHI</Pill><div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-black" style={{ color: COLORS.ink }}>{program.nomi}</h2><p className="mt-1 text-sm" style={{ color: COLORS.muted }}>{program.daraja || "Daraja belgilanmagan"} · {program.kafedra_nomi}</p></div><div className="flex flex-wrap gap-2"><Pill tone="green">{program.talaba_soni || 0} talaba</Pill>{(program.talim_shakllari || []).map(value => <Pill key={`form-${value}`} tone="blue">{value}</Pill>)}{(program.talim_tillari || []).map(value => <Pill key={`lang-${value}`} tone="violet">{value}</Pill>)}</div></div></div></Card>
    <div className="flex gap-2 overflow-x-auto pb-1">{sections.map(([key, label, Icon, allowed]) => <button key={key} type="button" disabled={!allowed || key === "groups"} onClick={() => setSection(key)} className="inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black disabled:cursor-not-allowed disabled:opacity-55" style={{ background: section === key ? COLORS.blue : "#fff", color: section === key ? "#fff" : COLORS.ink, borderColor: section === key ? COLORS.blue : COLORS.line }}><Icon size={16} />{label}{key === "groups" && <span className="text-[10px] opacity-70">keyin</span>}</button>)}</div>
    {section === "students" && <AdmissionsPanel compactProgram api={api} apiBase={apiBase} token={token} universityId={universityId} structure={structure} permissions={permissions} onCredentials={onCredentials} startMode="list" lockedFacultyId={faculty.id} lockedProgramId={program.id} lockedProgramIds={program.alias_ids || null} />}
    {section === "teachers" && <DirectionPeoplePanel api={api} token={token} universityId={universityId} permissions={permissions} faculty={faculty} program={program} kind="teachers" />}
    {section === "tutors" && <DirectionPeoplePanel api={api} token={token} universityId={universityId} permissions={permissions} faculty={faculty} program={program} kind="tutors" />}
    {section === "groups" && <Card className="p-5"><Empty>Guruh, davomat va baholash moduli keyingi bosqichda shu yo‘nalishga ulanadi.</Empty></Card>}
  </div>;
}

function GlobalPeopleSearch({ api, token, universityId, permissions, onOpenAdmission, onOpenStaff }) {
  const [q, setQ] = useState(""); const [students, setStudents] = useState([]); const [staff, setStaff] = useState([]);
  const [detail, setDetail] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setStudents([]); setStaff([]); setError(""); return undefined; }
    let active = true;
    const timer = setTimeout(async () => {
      setBusy(true); setError("");
      try {
        const result = await api(`/api/institut/v20/qidiruv/odamlar?universitet_id=${universityId}&q=${encodeURIComponent(term)}&limit=30&token=${encodeURIComponent(token)}`);
        if (!active) return;
        setStudents((result.natijalar || []).filter(item => item.turi === "talaba"));
        setStaff((result.natijalar || []).filter(item => item.turi === "xodim"));
      } catch (e) { if (active) setError(e.message); }
      finally { if (active) setBusy(false); }
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [api, q, token, universityId]);
  const openStudent = async id => { try { setDetail(await api(`/api/institut/v20/qabul/talaba/${id}?universitet_id=${universityId}&token=${encodeURIComponent(token)}`)); } catch (e) { setError(e.message); } };
  const hasQuery = q.trim().length >= 2;
  return <Card className="p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><Pill tone="blue">TEZKOR QIDIRUV</Pill><h2 className="mt-2 text-xl font-black" style={{ color: COLORS.ink }}>Institutdagi odamni toping</h2><p className="mt-1 text-sm" style={{ color: COLORS.muted }}>Talaba, o‘qituvchi, tyutor yoki rahbarni F.I.Sh. bo‘yicha bitta joydan qidiring.</p></div><Search style={{ color: COLORS.teal }} /></div><div className="relative mt-4"><Search size={18} className="absolute left-4 top-3.5" style={{ color: COLORS.muted }} /><input className={`${inputClass} py-3 pl-11 text-base`} value={q} onChange={event => setQ(event.target.value)} placeholder="Masalan: Abdikarimova Gulsevar" style={{ borderColor: COLORS.line }} />{busy && <Loader2 size={17} className="absolute right-4 top-3.5 animate-spin" style={{ color: COLORS.blue }} />}</div><ErrorBox text={error} />{hasQuery && !busy && <div className="mt-4 grid gap-4 lg:grid-cols-2"><div><div className="mb-2 flex items-center justify-between"><h3 className="font-black" style={{ color: COLORS.ink }}>Talabalar</h3><Pill tone="green">{students.length}</Pill></div>{!students.length ? <Empty>Talaba topilmadi</Empty> : <div className="space-y-2">{students.map(item => <button key={item.id} onClick={() => openStudent(item.id)} className="flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left" style={{ borderColor: COLORS.line }}><div><div className="font-black" style={{ color: COLORS.ink }}>{item.fish}</div><div className="text-xs" style={{ color: COLORS.muted }}>{item.yonalish_nomi} · {item.talim_shakli}</div></div><ChevronRight size={17} style={{ color: COLORS.blue }} /></button>)}</div>}{permissions.qabul_korish && <button onClick={onOpenAdmission} className="mt-3 text-xs font-black" style={{ color: COLORS.blue }}>Talaba qabuli bo‘limini ochish →</button>}</div><div><div className="mb-2 flex items-center justify-between"><h3 className="font-black" style={{ color: COLORS.ink }}>Xodimlar</h3><Pill tone="violet">{staff.length}</Pill></div>{!staff.length ? <Empty>Xodim topilmadi</Empty> : <div className="space-y-2">{staff.map(item => <button key={item.id} onClick={onOpenStaff} className="flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left" style={{ borderColor: COLORS.line }}><div><div className="font-black" style={{ color: COLORS.ink }}>{item.fish}</div><div className="text-xs" style={{ color: COLORS.muted }}>{item.lavozim_nomi} · {item.yonalish_nomi || item.kafedra_nomi || item.fakultet_nomi || "Institut"}</div></div><ChevronRight size={17} style={{ color: COLORS.violet }} /></button>)}</div>}</div></div>}<StudentDetail student={detail} onClose={() => setDetail(null)} /></Card>;
}

function AdmissionShortcut({ api, token, universityId, onOpen }) {
  const [counts, setCounts] = useState(null);
  useEffect(() => {
    let active = true;
    api(`/api/institut/v20/qabul/talabalar?universitet_id=${universityId}&page=1&page_size=10&token=${encodeURIComponent(token)}`).then(data => active && setCounts(data.hisoblar || {})).catch(() => active && setCounts({}));
    return () => { active = false; };
  }, [api, token, universityId]);
  return <button type="button" onClick={onOpen} className="w-full overflow-hidden rounded-3xl border text-left transition hover:-translate-y-0.5 hover:shadow-xl" style={{ borderColor: "#B6D9DC", background: "linear-gradient(135deg,#0F5A70,#0C817B)", color: "#fff" }}><div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6"><div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15"><ClipboardCheck /></span><div><div className="text-xs font-black tracking-[.16em] text-white/70">ALOHIDA ISH MAYDONI</div><h2 className="mt-1 text-xl font-black">Talaba qabuli</h2><p className="mt-1 text-sm text-white/75">Barcha abituriyentlar, bosqichlar, aqlli filtrlar va import bir joyda.</p></div></div><div className="grid grid-cols-4 gap-2">{[[counts?.jami || 0, "Jami"], [counts?.hujjat || 0, "Hujjat"], [counts?.baza || 0, "Baza"], [counts?.sayt || 0, "Sayt"]].map(([value, label]) => <span key={label} className="rounded-xl bg-white/12 px-3 py-2 text-center"><b className="block text-lg">{value}</b><span className="text-[10px] text-white/70">{label}</span></span>)}</div></div></button>;
}

function TutorPanel({ api, token, universityId, structure, canManage, facultyId = null }) {
  const scopedFacultyId = facultyId ? String(facultyId) : "";
  const [rows, setRows] = useState([]); const [staff, setStaff] = useState([]); const [assignments, setAssignments] = useState([]); const [error, setError] = useState("");
  const [form, setForm] = useState({ tyutor_user_id: "", fakultet_id: scopedFacultyId, yonalish_id: "", talim_shakli: "", talim_tili: "", qabul_turi: "" });
  const [selectedProgramIds, setSelectedProgramIds] = useState([]);
  const allFaculties = useMemo(() => structure?.fakultetlar || [], [structure]);
  const faculties = useMemo(() => allFaculties.filter(f => !scopedFacultyId || String(f.id) === scopedFacultyId), [allFaculties, scopedFacultyId]);
  const allPrograms = useMemo(() => allFaculties.flatMap(f => (f.kafedralar || []).flatMap(d => (d.yonalishlar || []).map(y => ({ ...y, fakultet_id: f.id, label: `${f.nomi} · ${y.nomi}` })))), [allFaculties]);
  const programs = useMemo(() => allPrograms.filter(p => !scopedFacultyId || String(p.fakultet_id) === scopedFacultyId), [allPrograms, scopedFacultyId]);
  const scopedProgramIds = useMemo(() => new Set(programs.flatMap(p => p.alias_ids || [p.id]).map(id => String(id))), [programs]);
  const programFacultyById = useMemo(() => {
    const result = new Map();
    allPrograms.forEach(program => (program.alias_ids || [program.id]).forEach(id => result.set(String(id), String(program.fakultet_id))));
    return result;
  }, [allPrograms]);
  const load = useCallback(() => {
    const capacityRequest = api(`/api/institut/v20/tyutor/yetarlilik?universitet_id=${universityId}&token=${encodeURIComponent(token)}`);
    const assignmentRequest = api(`/api/institut/v20/tyutor/biriktirishlar?universitet_id=${universityId}&token=${encodeURIComponent(token)}`);
    const inFaculty = item => !scopedFacultyId || String(item.fakultet_id || programFacultyById.get(String(item.yonalish_id)) || "") === scopedFacultyId;
    const capacityRows = capacity => (capacity.yonalishlar || []).filter(item => !scopedFacultyId || scopedProgramIds.has(String(item.id)));
    if (!canManage) return Promise.all([capacityRequest, assignmentRequest]).then(([capacity, scopes]) => { setRows(capacityRows(capacity)); setAssignments((scopes.biriktirishlar || []).filter(inFaculty)); setStaff([]); }).catch(e => setError(e.message));
    return Promise.all([capacityRequest, assignmentRequest, api(`/api/institut/v20/xodimlar?universitet_id=${universityId}&token=${encodeURIComponent(token)}`)])
      .then(([capacity, scopes, people]) => { setRows(capacityRows(capacity)); setAssignments((scopes.biriktirishlar || []).filter(inFaculty)); setStaff((people.xodimlar || []).filter(x => x.rol === "tyutor" && (!scopedFacultyId || String(x.fakultet_id || programFacultyById.get(String(x.yonalish_id)) || "") === scopedFacultyId))); }).catch(e => setError(e.message));
  }, [api, token, universityId, canManage, programFacultyById, scopedFacultyId, scopedProgramIds]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!scopedFacultyId) return;
    setForm(old => ({ ...old, fakultet_id: scopedFacultyId, yonalish_id: "" }));
    setSelectedProgramIds([]);
  }, [scopedFacultyId]);
  const assign = async () => {
    setError("");
    try {
      const scopes = selectedProgramIds.length ? selectedProgramIds.map(id => programs.find(p => String(p.id) === String(id))).filter(Boolean) : [null];
      await Promise.all(scopes.map(selected => api("/api/institut/v20/tyutor/biriktir", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, universitet_id: universityId, tyutor_user_id: Number(form.tyutor_user_id), fakultet_id: selected ? Number(selected.fakultet_id) : (form.fakultet_id ? Number(form.fakultet_id) : undefined), yonalish_id: selected ? Number(selected.id) : (form.yonalish_id ? Number(form.yonalish_id) : undefined), talim_shakli: form.talim_shakli || undefined, talim_tili: form.talim_tili || undefined, qabul_turi: form.qabul_turi || undefined }) })));
      setForm({ tyutor_user_id: "", fakultet_id: scopedFacultyId, yonalish_id: "", talim_shakli: "", talim_tili: "", qabul_turi: "" }); setSelectedProgramIds([]); load();
    } catch (e) { setError(e.message); }
  };
  const remove = async id => { try { await api(`/api/institut/v20/tyutor/biriktirish/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, faol: false }) }); load(); } catch (e) { setError(e.message); } };
  return <div className="space-y-4">{canManage && <Card className="p-5"><div className="flex items-start gap-3"><ShieldCheck style={{ color: COLORS.teal }} /><div><h3 className="font-black" style={{ color: COLORS.ink }}>Tyutor qamrovini biriktirish</h3><p className="mt-1 text-sm" style={{ color: COLORS.muted }}>Masalan: barcha kechki, barcha kunduzgi, faqat O‘zbek/Rus/Tojik yoki bitta yo‘nalishning aniq shakl va tili.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5"><Field label="Tyutor"><select className={inputClass} value={form.tyutor_user_id} onChange={e => setForm({ ...form, tyutor_user_id: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">Tanlang</option>{staff.map(x => <option key={x.user_id} value={x.user_id}>{x.full_name}</option>)}</select></Field><Field label="Fakultet"><select disabled={!!scopedFacultyId} className={inputClass} value={form.fakultet_id} onChange={e => setForm({ ...form, fakultet_id: e.target.value, yonalish_id: "" })} style={{ borderColor: COLORS.line }}><option value="">Barcha fakultetlar</option>{faculties.map(x => <option key={x.id} value={x.id}>{x.nomi}</option>)}</select></Field><Field label="Yo‘nalish"><select className={inputClass} value={form.yonalish_id} onChange={e => { const selected = programs.find(x => String(x.id) === e.target.value); setForm({ ...form, yonalish_id: e.target.value, fakultet_id: selected ? String(selected.fakultet_id) : form.fakultet_id }); }} style={{ borderColor: COLORS.line }}><option value="">Barcha yo‘nalishlar</option>{programs.filter(x => !form.fakultet_id || String(x.fakultet_id) === String(form.fakultet_id)).map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></Field><Field label="Ta’lim shakli"><select className={inputClass} value={form.talim_shakli} onChange={e => setForm({ ...form, talim_shakli: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">Barcha shakllar</option>{["Kunduzgi", "Kechki", "Sirtqi", "Masofaviy", "Dual ta'lim"].map(x => <option key={x}>{x}</option>)}</select></Field><Field label="Ta’lim tili"><select className={inputClass} value={form.talim_tili} onChange={e => setForm({ ...form, talim_tili: e.target.value })} style={{ borderColor: COLORS.line }}><option value="">Barcha tillar</option>{["O‘zbekcha", "Ruscha", "Tojikcha"].map(x => <option key={x}>{x}</option>)}</select></Field></div><div className="mt-4 rounded-2xl border p-4" style={{ borderColor: COLORS.line, background: COLORS.cream }}><div className="text-xs font-black" style={{ color: COLORS.muted }}>YO‘NALISHLARNI PTICHKA BILAN TANLANG (IXTIYORIY)</div><div className="mt-3 grid gap-2 md:grid-cols-2">{programs.filter(x => !form.fakultet_id || String(x.fakultet_id) === String(form.fakultet_id)).map(x => <label key={x.id} className="flex cursor-pointer items-center gap-2 rounded-xl border bg-white p-3 text-sm font-bold" style={{ borderColor: selectedProgramIds.includes(String(x.id)) ? COLORS.blue : COLORS.line }}><input type="checkbox" checked={selectedProgramIds.includes(String(x.id))} onChange={e => setSelectedProgramIds(ids => e.target.checked ? [...ids, String(x.id)] : ids.filter(id => id !== String(x.id)))} />{x.label}</label>)}</div></div><Button onClick={assign} disabled={!form.tyutor_user_id} className="mt-4">{selectedProgramIds.length ? ` ta yo‘nalishga tyutor biriktirish` : "Tanlangan qamrovga tyutor biriktirish"}</Button></Card>}<ErrorBox text={error} /><Card className="p-5"><h3 className="font-black" style={{ color: COLORS.ink }}>{canManage ? "Amaldagi tyutor biriktirishlari" : "Mening tyutor qamrovim"}</h3>{!assignments.length ? <div className="mt-3"><Empty>Biriktirish yo‘q</Empty></div> : <div className="mt-4 grid gap-3 md:grid-cols-2">{assignments.map(a => <div key={a.id} className="rounded-2xl border p-4" style={{ borderColor: COLORS.line }}><div className="flex items-start justify-between gap-3"><div><div className="font-black" style={{ color: COLORS.ink }}>{a.full_name}</div><div className="mt-1 text-xs" style={{ color: COLORS.muted }}>{a.fakultet_nomi || "Barcha fakultetlar"} · {a.yonalish_nomi || "Barcha yo‘nalishlar"}</div><div className="mt-2 flex flex-wrap gap-1"><Pill tone="blue">{a.talim_shakli || "Barcha shakllar"}</Pill><Pill tone="violet">{a.talim_tili || "Barcha tillar"}</Pill></div></div>{canManage && <button onClick={() => remove(a.id)} className="rounded-lg border p-2" style={{ borderColor: "#E8BABA", color: COLORS.red }} title="Biriktirishni o‘chirish"><X size={15} /></button>}</div></div>)}</div>}</Card><div className="grid gap-3 md:grid-cols-2">{rows.map(r => <Card key={r.id} className="p-4"><div className="flex items-center justify-between gap-3"><div><div className="font-black" style={{ color: COLORS.ink }}>{r.nomi}</div><div className="mt-1 text-xs" style={{ color: COLORS.muted }}>{r.kunduzgi_1kurs} kunduzgi qabul · {r.tyutor_soni} tyutor</div></div><Pill tone={r.yetarli ? "green" : "red"}>{r.yetarli ? "Yetarli" : `${r.tavsiya_etilgan_minimum} ta kerak`}</Pill></div></Card>)}</div></div>;
}

function AuditPanel({ api, token, universityId }) {
  const [rows, setRows] = useState([]); const [q, setQ] = useState(""); const [error, setError] = useState("");
  const load = useCallback(async () => { try { const d = await api(`/api/institut/v20/audit?universitet_id=${universityId}&q=${encodeURIComponent(q)}&token=${encodeURIComponent(token)}`); setRows(d.loglar || []); } catch (e) { setError(e.message); } }, [api, token, universityId, q]);
  useEffect(() => { load(); }, [load]);
  return <div className="space-y-4"><Card className="p-5"><h2 className="font-black" style={{ color: COLORS.ink }}>Institut faoliyati jurnali</h2><p className="mt-1 text-xs" style={{ color: COLORS.muted }}>Kim import qildi, xodimni tahrirladi, hujjat yoki bazani belgiladi — hammasi vaqt bilan saqlanadi.</p><div className="relative mt-4"><Search size={16} className="absolute left-3 top-3" style={{ color: COLORS.muted }} /><input className={`${inputClass} pl-9`} value={q} onChange={e => setQ(e.target.value)} placeholder="Mas’ul yoki amalni qidiring" style={{ borderColor: COLORS.line }} /></div></Card><ErrorBox text={error} /><Card className="overflow-hidden">{!rows.length ? <div className="p-5"><Empty>Log topilmadi</Empty></div> : <div className="divide-y" style={{ borderColor: COLORS.line }}>{rows.map(x => <div key={x.id} className="grid gap-2 p-4 md:grid-cols-[1fr_1fr_auto]"><div><div className="font-black">{x.actor_fish || "Tizim"}</div><div className="text-xs" style={{ color: COLORS.muted }}>{x.obyekt_turi || "institut"} #{x.obyekt_id || "—"}</div></div><div className="text-sm font-bold" style={{ color: COLORS.blue }}>{String(x.amal || "").replaceAll("_", " ")}</div><time className="text-xs" style={{ color: COLORS.muted }}>{x.yaratilgan_at ? new Date(x.yaratilgan_at).toLocaleString("uz-UZ") : ""}</time></div>)}</div>}</Card></div>;
}

function StudentHome({ api, token, universityId }) {
  const [data, setData] = useState(null); const [error, setError] = useState("");
  useEffect(() => { api(`/api/institut/v20/talaba/yonalish_katalogi?universitet_id=${universityId}&token=${encodeURIComponent(token)}`).then(setData).catch(e => setError(e.message)); }, [api, token, universityId]);
  if (error) return <ErrorBox text={error} />; if (!data) return <Loader2 className="mx-auto animate-spin" style={{ color: COLORS.blue }} />;
  return <div className="space-y-4"><Card className="overflow-hidden"><div className="p-6" style={{ background: "linear-gradient(135deg,#E9F7F7,#F7F1E8)" }}><Pill tone="violet">MENING YO‘NALISHIM</Pill><h2 className="mt-3 text-2xl font-black" style={{ color: COLORS.ink }}>{data.yonalish.nomi}</h2><p className="mt-1 text-sm" style={{ color: COLORS.muted }}>{data.yonalish.fakultet_nomi} · {data.yonalish.kafedra_nomi}</p></div></Card><div className="grid gap-4 lg:grid-cols-2"><Card className="p-5"><h3 className="font-black" style={{ color: COLORS.ink }}>Dekan, admin va tyutorlar</h3><div className="mt-3 space-y-2">{data.masullar.map((x, i) => <div key={i} className="flex items-center justify-between rounded-xl p-3" style={{ background: COLORS.cream }}><span className="font-bold">{x.fish}</span><Pill tone="violet">{x.lavozim_nomi}</Pill></div>)}</div></Card><Card className="p-5"><h3 className="font-black" style={{ color: COLORS.ink }}>Yo‘nalish talabalari</h3><p className="mt-1 text-xs" style={{ color: COLORS.muted }}>Shaxsiy ma’lumot, ball va telefon ko‘rsatilmaydi.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{data.talabalar.map(x => <div key={x.id} className="rounded-xl p-3 text-sm font-bold" style={{ background: COLORS.sky }}>{x.fish}</div>)}</div></Card></div></div>;
}

export default function InstituteWorkspace({ token, apiBase, initialWorkspace, onBack, canCreateInstitution = false, initialFacultyId = null }) {
  const api = useApi(apiBase, token); const [bootstrap, setBootstrap] = useState(null); const [structure, setStructure] = useState(null);
  const initialTab = initialFacultyId ? "structure" : "dashboard";
  const [tab, setTab] = useState(initialTab); const [structureStartMode, setStructureStartMode] = useState(null); const [admissionStartMode, setAdmissionStartMode] = useState(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [credentials, setCredentials] = useState([]); const [manualUniversityId, setManualUniversityId] = useState(null); const [superAdminInstitutes, setSuperAdminInstitutes] = useState(null); const [showInstituteCreate, setShowInstituteCreate] = useState(false); const [programDepth, setProgramDepth] = useState(false); const [facultyContextId, setFacultyContextId] = useState(initialFacultyId ? String(initialFacultyId) : null); const [staffRows, setStaffRows] = useState([]);
  const tabHistoryRef = useRef([]);
  const currentTabRef = useRef(initialTab);
  const workspaceId = initialWorkspace?.context_id || null;
  const legacyUniversityId = !workspaceId ? initialWorkspace?.muassasa_id : null;
  const load = useCallback(async (explicitId) => {
    setLoading(true); setError("");
    try {
      const qs = new URLSearchParams({ token }); if (explicitId || manualUniversityId || legacyUniversityId) qs.set("universitet_id", explicitId || manualUniversityId || legacyUniversityId); else if (workspaceId) qs.set("workspace_id", workspaceId);
      const b = await api(`/api/institut/v20/bootstrap?${qs}`); setBootstrap(b);
      const s = await api(`/api/institut/v20/tuzilma?universitet_id=${b.universitet.id}&token=${encodeURIComponent(token)}`); setStructure(canonicalizeInstituteStructure(s));
    } catch (e) {
      setError(e.message);
      try {
        const institutes = (await api(`/api/institut/v20/super_admin/institutlar?token=${encodeURIComponent(token)}`)).institutlar || [];
        if (institutes.length === 1 && !manualUniversityId && !workspaceId && !legacyUniversityId) setManualUniversityId(institutes[0].id);
        else setSuperAdminInstitutes(institutes);
      } catch { setSuperAdminInstitutes(null); }
    } finally { setLoading(false); }
  }, [api, token, workspaceId, legacyUniversityId, manualUniversityId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (initialFacultyId) setFacultyContextId(String(initialFacultyId)); }, [initialFacultyId]);
  const connectedUniversityId = bootstrap?.universitet?.id || null;
  useEffect(() => {
    if (!connectedUniversityId) { setStaffRows([]); return; }
    let active = true;
    api(`/api/institut/v20/xodimlar?universitet_id=${connectedUniversityId}&token=${encodeURIComponent(token)}`).then(data => active && setStaffRows(data.xodimlar || [])).catch(() => active && setStaffRows([]));
    return () => { active = false; };
  }, [api, connectedUniversityId, token]);
  const refreshStructure = async () => { if (!bootstrap) return; try { setStructure(canonicalizeInstituteStructure(await api(`/api/institut/v20/tuzilma?universitet_id=${bootstrap.universitet.id}&token=${encodeURIComponent(token)}`))); } catch {} };
  const navigateTab = useCallback(nextTab => {
    const currentTab = currentTabRef.current;
    if (currentTab === nextTab) return;
    tabHistoryRef.current.push(currentTab);
    currentTabRef.current = nextTab;
    setTab(nextTab);
  }, []);
  const goBackTab = useCallback(() => {
    const previousTab = tabHistoryRef.current.pop() || "dashboard";
    currentTabRef.current = previousTab;
    setTab(previousTab);
  }, []);
  const leaveInitialFaculty = useCallback(() => {
    if (tabHistoryRef.current.length) goBackTab();
    else onBack?.();
  }, [goBackTab, onBack]);
  const returnToDashboard = useCallback(() => {
    if (tabHistoryRef.current.length) goBackTab();
    else {
      currentTabRef.current = "dashboard";
      setTab("dashboard");
    }
  }, [goBackTab]);
  const backWithinWorkspace = useCallback(() => {
    // Ko‘k sarlavhadagi tugma ham telefon/brauzer "Orqaga" tugmasi bilan
    // aynan bir xil handler zanjiridan o‘tadi. Shunda Structure ichidagi
    // fakultet bosqichi tashlab ketilmaydi.
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }
    if (tabHistoryRef.current.length) goBackTab(); else onBack?.();
  }, [goBackTab, onBack]);
  useEffect(() => {
    currentTabRef.current = tab;
    if (tab !== "structure") setProgramDepth(false);
  }, [tab]);
  useEffect(() => registerPhoneBackHandler("institute-workspace", () => {
    if (showInstituteCreate) {
      setShowInstituteCreate(false);
      return true;
    }
    // Tuzilma ichidagi fakultet/yo'nalish bosqichlarini StructurePanel LIFO tartibida yopadi.
    if (tab === "structure" || programDepth) return false;
    if (tabHistoryRef.current.length) {
      goBackTab();
      return true;
    }
    if (tab !== "dashboard") {
      currentTabRef.current = "dashboard";
      setTab("dashboard");
      return true;
    }
    onBack?.();
    return true;
  }), [goBackTab, onBack, programDepth, showInstituteCreate, tab]);
  useEffect(() => registerPhoneBackHandler("institute-credentials-modal", () => {
    if (!credentials.length) return false;
    setCredentials([]);
    return true;
  }, 290), [credentials.length]);
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 size={30} className="animate-spin" style={{ color: COLORS.blue }} /></div>;
  if (!bootstrap && initialFacultyId) return <main className="mx-auto max-w-2xl p-6"><button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-black" style={{ color: COLORS.blue }}><ArrowLeft size={17} /> Kafedralarga qaytish</button><ErrorBox text={error || "Tanlangan fakultetning import ma’lumoti yuklanmadi."} /></main>;
  if (!bootstrap) {
    if (showInstituteCreate || (canCreateInstitution && superAdminInstitutes?.length === 0)) return <InstituteCreate api={api} token={token} onCreated={id => { setManualUniversityId(id); load(id); }} onBack={() => setShowInstituteCreate(false)} />;
    if (canCreateInstitution || superAdminInstitutes) return <main className="mx-auto max-w-5xl p-4 md:p-7"><button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-black" style={{ color: COLORS.blue }}><ArrowLeft size={17} /> Bosh sahifa</button><Card className="p-5 md:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><Pill tone="violet">SUPER ADMIN</Pill><h2 className="mt-2 text-2xl font-black" style={{ color: COLORS.ink }}>Institutni tanlang</h2><p className="mt-1 text-sm" style={{ color: COLORS.muted }}>Super-admin uchun institut paroli kerak emas.</p></div><Button onClick={() => setShowInstituteCreate(true)}><Plus size={16} /> Yangi institut</Button></div><div className="mt-5 grid gap-3 md:grid-cols-2">{(superAdminInstitutes || []).map(x => <button key={x.id} onClick={() => { setManualUniversityId(x.id); load(x.id); }} className="rounded-2xl border p-4 text-left" style={{ borderColor: COLORS.line, background: "#fff" }}><div className="font-black" style={{ color: COLORS.ink }}>{x.nomi}</div><div className="mt-1 text-xs" style={{ color: COLORS.muted }}>{x.viloyat || ""} {x.tuman || ""}</div><div className="mt-3 flex gap-2"><Pill tone="blue">{x.fakultet_soni || 0} fakultet</Pill><Pill tone="green">{x.talaba_soni || 0} talaba</Pill></div></button>)}</div>{!(superAdminInstitutes || []).length && <div className="mt-5"><Empty>Hozircha institut yo‘q. “Yangi institut”ni bosing.</Empty></div>}</Card></main>;
    return <div className="mx-auto max-w-xl p-6"><ErrorBox text="Akkauntingiz institutga biriktirilmagan." /><Card className="mt-4 p-5"><h2 className="font-black" style={{ color: COLORS.ink }}>Kirish yoki ro‘yxatdan o‘tish</h2><p className="mt-2 text-sm" style={{ color: COLORS.muted }}>Institutga alohida parol qo‘yilmaydi. Saytdagi umumiy kirish yoki ro‘yxatdan o‘tishdan foydalaning; keyin administrator sizni institutga biriktiradi.</p><Button onClick={onBack} className="mt-4 w-full"><ArrowLeft size={16} /> Kirish sahifasiga qaytish</Button></Card></div>;
  }
  const id = bootstrap.universitet.id; const permissions = bootstrap.ruxsatlar || {};
  const activeFacultyId = initialFacultyId ? String(initialFacultyId) : facultyContextId;
  const activeFaculty = activeFacultyId ? (structure?.fakultetlar || []).find(f => String(f.id) === String(activeFacultyId)) : null;
  const activeFacultyStats = activeFaculty ? {
    kafedra: Number(activeFaculty.kafedra_soni || activeFaculty.kafedralar?.length || 0),
    yonalish: Number(activeFaculty.yonalish_soni || (activeFaculty.kafedralar || []).reduce((sum, d) => sum + (d.yonalishlar || []).length, 0)),
    oqituvchi: staffRows.filter(item => item.rol === "professor_oqituvchi" && String(item.fakultet_id || "") === String(activeFaculty.id)).length,
    talaba: (activeFaculty.kafedralar || []).flatMap(d => d.yonalishlar || []).reduce((sum, y) => sum + Number(y.talaba_soni || 0), 0),
  } : null;
  const openStructure = mode => { setStructureStartMode(mode); navigateTab("structure"); };
  if (bootstrap.asosiy_rol === "talaba") return <main className="mx-auto max-w-6xl p-4 md:p-7"><button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-black" style={{ color: COLORS.blue }}><ArrowLeft size={17} /> Bosh sahifa</button><StudentHome api={api} token={token} universityId={id} /></main>;
  const tabs = [
    ["dashboard", "Asosiy", GraduationCap], ["structure", "Tuzilma", Building2],
    ["staff", "Xodimlar", Users], ["admission", "Talaba qabuli", ClipboardCheck],
    ["tutors", "Tyutorlar", ShieldCheck],
    ["audit", "Faoliyat jurnali", Eye],
  ].filter(([key]) => {
    if (key === "structure") return permissions.tuzilma_korish;
    if (key === "staff") return permissions.xodim_korish;
    if (key === "admission") return permissions.qabul_korish && !activeFacultyId;
    if (key === "tutors") return permissions.tyutor_korish;
    if (key === "audit") return permissions.super_admin || bootstrap.rollar.some(r => ["owner", "rektor", "prorektor", "institut_admin"].includes(r.rol));
    return true;
  });
  const canonicalProgramCount = (structure?.fakultetlar || []).reduce((sum, faculty) => sum + Number(faculty.yonalish_soni || 0), 0);
  const teacherCount = Number(bootstrap.sonlar.oqituvchi || 0);
  const heroStats = activeFacultyStats
    ? [[activeFacultyStats.kafedra, "Kafedra"], [activeFacultyStats.yonalish, "Yo‘nalish"], [activeFacultyStats.oqituvchi, "O‘qituvchi"], [activeFacultyStats.talaba, "Talaba"]]
    : [[bootstrap.sonlar.fakultet, "Fakultet"], [canonicalProgramCount, "Yo‘nalish"], [teacherCount, "O‘qituvchi"], [bootstrap.sonlar.talaba, "Talaba"]];
  return <main className="min-h-screen" style={{ background: "linear-gradient(180deg,#F4FAFB 0,#FAF8F3 48%,#F7FAFB 100%)" }}>
    <div className="mx-auto max-w-[1500px] p-3 md:p-6">
      {!programDepth && <>
        <header className="mb-4 overflow-hidden rounded-3xl border" style={{ borderColor: COLORS.line, background: "linear-gradient(135deg,#153E5B,#14797A)", color: "#fff" }}>
          <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-7">
            <div className="flex items-start gap-4">
              <button onClick={backWithinWorkspace} className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15" style={{ color: "#fff" }}><ArrowLeft size={19} /></button>
              <div>
                <div className="text-xs font-black tracking-[.18em]" style={{ color: "rgba(255,255,255,.78)" }}>{activeFaculty ? "FAKULTET ISH MAYDONI" : "INSTITUT ISH MAYDONI"}</div>
                <h1 className="mt-1 text-2xl font-black md:text-3xl" style={{ color: "#fff" }}>{activeFaculty?.nomi || bootstrap.universitet.nomi}</h1>
                {activeFaculty && <div className="mt-1 text-sm font-bold" style={{ color: "rgba(255,255,255,.82)" }}>{bootstrap.universitet.nomi}</div>}
                <div className="mt-2 flex flex-wrap gap-2" style={{ color: "#fff" }}>{permissions.super_admin && <Pill tone="violet">SUPER ADMIN</Pill>}<Pill>{bootstrap.rollar.map(r => ROLE_OPTIONS.find(option => option[0] === r.rol)?.[1] || r.rol).join(" · ")}</Pill><span className="text-xs" style={{ color: "rgba(255,255,255,.72)" }}>{bootstrap.universitet.viloyat} {bootstrap.universitet.tuman}</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{heroStats.map(([n, l]) => <div key={l} className="rounded-2xl px-4 py-3 text-center" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}><div className="text-xl font-black">{n}</div><div className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,.72)" }}>{l}</div></div>)}</div>
          </div>
        </header>
        <nav className="mb-4 flex gap-2 overflow-x-auto pb-1">{tabs.map(([key, label, Icon]) => <button key={key} onClick={() => navigateTab(key)} className="inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black" style={{ background: tab === key ? COLORS.blue : "#fff", color: tab === key ? "#fff" : COLORS.ink, borderColor: tab === key ? COLORS.blue : COLORS.line }}><Icon size={16} />{label}</button>)}</nav>
      </>}
      {error && <div className="mb-4"><ErrorBox text={error} /></div>}
      {tab === "dashboard" && <div className="space-y-4">{activeFaculty ? <>
        <Card className="p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><Pill tone="blue">FAKULTET</Pill><h2 className="mt-2 text-xl font-black" style={{ color: COLORS.ink }}>{activeFaculty.nomi}</h2><p className="mt-1 text-sm" style={{ color: COLORS.muted }}>Fakultet haqida qisqa ma’lumot. Talaba ro‘yxati faqat yo‘nalish tanlangandan keyin ochiladi.</p></div><Button onClick={() => navigateTab("structure")}><Building2 size={16} /> Yo‘nalishlarni ko‘rish</Button></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[[activeFacultyStats.kafedra, "Kafedra"], [activeFacultyStats.yonalish, "Yo‘nalish"], [activeFacultyStats.oqituvchi, "O‘qituvchi"], [activeFacultyStats.talaba, "Talaba"]].map(([n, label]) => <div key={label} className="rounded-2xl p-4" style={{ background: COLORS.sky }}><div className="text-2xl font-black" style={{ color: COLORS.blue }}>{n}</div><div className="text-xs font-bold" style={{ color: COLORS.muted }}>{label}</div></div>)}</div></Card>
      </> : activeFacultyId ? <ErrorBox text="Tanlangan fakultet tuzilmadan topilmadi." /> : <>
        {permissions.qabul_korish && <AdmissionShortcut api={api} token={token} universityId={id} onOpen={() => navigateTab("admission")} />}
        {(permissions.qabul_korish || permissions.xodim_korish) && <GlobalPeopleSearch api={api} token={token} universityId={id} permissions={permissions} onOpenAdmission={() => navigateTab("admission")} onOpenStaff={() => navigateTab("staff")} />}
        {permissions.tuzilma_boshqarish && <Card className="p-5 md:p-6"><Pill tone="violet">TUZILMANI KIRITISH</Pill><h2 className="mt-3 text-xl font-black" style={{ color: COLORS.ink }}>Fakultet, kafedra va yo‘nalishlar</h2><p className="mb-5 mt-1 text-sm" style={{ color: COLORS.muted }}>Bu institut tuzilmasi. Talabalar alohida “Talaba qabuli” bo‘limidan import qilinadi.</p><StructureEntryChoices onManual={() => openStructure("manual")} onImport={() => openStructure("import")} /></Card>}
        <Card className="p-5"><h2 className="text-xl font-black" style={{ color: COLORS.ink }}>Tizim tayyorligi</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{[["Fakultet va kafedralar", bootstrap.sonlar.fakultet > 0], ["Ta’lim yo‘nalishlari", canonicalProgramCount > 0], ["Import qilingan talabalar", bootstrap.sonlar.talaba > 0]].map(([l, ok]) => <div key={l} className="rounded-2xl p-4" style={{ background: ok ? "#ECF7F0" : "#FFF6E8" }}><div className="flex items-center gap-2 font-black" style={{ color: ok ? COLORS.green : COLORS.amber }}>{ok ? <CheckCircle2 size={18} /> : <RefreshCcw size={18} />}{l}</div></div>)}</div><div className="mt-5 rounded-2xl border p-4 text-sm" style={{ borderColor: COLORS.line, color: COLORS.muted }}>Ketma-ketlik: <b>1) Institut tuzilmasi</b> → <b>2) Xodim va rollar</b> → <b>3) Talabalarni import qilish</b> → <b>4) Tyutorlarni biriktirish</b>.</div></Card>
      </>}</div>}
      {tab === "structure" && <StructurePanel api={api} apiBase={apiBase} token={token} universityId={id} canManage={permissions.tuzilma_boshqarish} permissions={permissions} onChanged={() => load()} onCredentials={setCredentials} onOpenStaff={() => navigateTab("staff")} onBackToWorkspace={returnToDashboard} onInitialFacultyBack={leaveInitialFaculty} onProgramDepthChange={setProgramDepth} onFacultyContextChange={nextId => { if (!initialFacultyId) setFacultyContextId(nextId ? String(nextId) : null); }} onNextAdmission={() => { setAdmissionStartMode("import"); navigateTab("admission"); }} startMode={structureStartMode} onStartModeConsumed={() => setStructureStartMode(null)} focusFacultyId={activeFacultyId} facultyContextLocked={!!initialFacultyId} />}
      {tab === "staff" && <StaffPanel api={api} apiBase={apiBase} token={token} universityId={id} structure={structure} canManage={permissions.xodim_boshqarish} canManageAdmins={permissions.admin_boshqarish} isSuperAdmin={permissions.super_admin} onCredentials={setCredentials} facultyId={activeFacultyId} />}
      {tab === "admission" && !activeFacultyId && <AdmissionsPanel api={api} apiBase={apiBase} token={token} universityId={id} structure={structure} permissions={permissions} onCredentials={setCredentials} startMode={admissionStartMode} onStartModeConsumed={() => setAdmissionStartMode(null)} showDailyReport />}
      {tab === "tutors" && <TutorPanel api={api} token={token} universityId={id} structure={structure} canManage={permissions.tyutor_boshqarish} facultyId={activeFacultyId} />}
      {tab === "audit" && <AuditPanel api={api} token={token} universityId={id} />}
    </div>
    <CredentialsModal items={credentials} onClose={() => setCredentials([])} />
  </main>;
}
