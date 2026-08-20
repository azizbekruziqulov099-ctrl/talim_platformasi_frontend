import React, { useEffect, useMemo, useState } from "react";
import { HUDUDLAR, VILOYATLAR } from "./hududlar.js";

const panel = { background: "#fff", border: "1px solid #E5E1D8", borderRadius: 18, padding: 20 };
const field = { width: "100%", border: "1px solid #D8D3C8", borderRadius: 12, padding: "10px 12px", fontSize: 14, background: "#fff" };
const primary = { background: "#1B4B7A", color: "#fff", borderRadius: 12, padding: "11px 15px", fontWeight: 700 };
const secondary = { background: "#F7F5F0", color: "#1B4B7A", border: "1px solid #E5E1D8", borderRadius: 12, padding: "10px 14px", fontWeight: 700 };
const danger = { background: "#A32D2D", color: "#fff", borderRadius: 12, padding: "11px 15px", fontWeight: 700 };

async function requestJson(apiBase, path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, options);
  const raw = await response.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { detail: raw }; }
  if (!response.ok) {
    const detail = data?.detail;
    throw new Error(typeof detail === "string" ? detail : detail?.message || `Server xatosi (${response.status})`);
  }
  return data;
}

function Label({ children, required = false }) {
  return <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#5A5648" }}>{children} {required && <span style={{ color: "#B0553A" }}>*</span>}</label>;
}

function Notice({ kind = "error", children }) {
  if (!children) return null;
  return <div className="text-sm rounded-xl px-3.5 py-3" style={{ background: kind === "error" ? "#FFF0ED" : "#EDF8F1", color: kind === "error" ? "#A32D2D" : "#28735A", border: `1px solid ${kind === "error" ? "#F0C1B8" : "#B9DFC8"}` }}>{children}</div>;
}

function PersonPicker({ apiBase, token, scopeId, scopeKind = "school", role = "", value, onChange, placeholder, adminGlobal = false }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) { setItems([]); return undefined; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const path = adminGlobal
          ? `/api/admin/foydalanuvchi_qidir?token=${encodeURIComponent(token)}&ism=${encodeURIComponent(query.trim())}`
          : `/api/maktab-v23/${scopeId}/people?token=${encodeURIComponent(token)}&query=${encodeURIComponent(query.trim())}&role=${encodeURIComponent(role)}&scope_kind=${encodeURIComponent(scopeKind)}`;
        const data = await requestJson(apiBase, path);
        setItems(data.people || data.natijalar || []);
      } catch { setItems([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [apiBase, token, scopeId, scopeKind, role, query, adminGlobal]);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5" style={{ background: "#EAF1F7", color: "#1B4B7A" }}>
        <span className="text-sm font-semibold">{value.full_name}</span>
        <button type="button" onClick={() => onChange(null)} className="text-xs">✕ O‘zgartirish</button>
      </div>
    );
  }
  return (
    <div className="relative">
      <input style={field} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder || "Ism bo‘yicha qidiring..."} />
      {loading && <span className="text-xs" style={{ color: "#8A8578" }}>Qidirilmoqda...</span>}
      {items.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl border bg-white shadow-lg p-1 max-h-52 overflow-auto" style={{ borderColor: "#E5E1D8" }}>
          {items.map((item) => (
            <button type="button" key={item.user_id} className="w-full text-left rounded-lg px-3 py-2 hover:bg-slate-50" onClick={() => { onChange(item); setQuery(""); setItems([]); }}>
              <b className="text-sm block">{item.full_name}</b>
              <small style={{ color: "#8A8578" }}>{item.lavozim || item.role || "Foydalanuvchi"}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const newClassRow = (shift = 1) => ({
  key: `${Date.now()}-${Math.random()}`, code: "", shift_no: shift,
  homeroom: null, psychologist: null, building_name: "", room_number: "",
});

function ClassFields({ row, onChange, onRemove, shiftCount, apiBase, token, scopeId, scopeKind = "school", adminGlobal = false }) {
  const patch = (values) => onChange({ ...row, ...values });
  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: "#E5E1D8", background: "#FCFBF8" }}>
      <div className="flex items-center justify-between gap-3">
        <b className="text-sm">Sinf</b>
        {onRemove && <button type="button" onClick={onRemove} className="text-xs font-semibold" style={{ color: "#A32D2D" }}>Olib tashlash</button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><Label required>Sinf nomi</Label><input style={field} value={row.code} onChange={(e) => patch({ code: e.target.value })} placeholder="Masalan: 5-A, 5a yoki 11-D" /></div>
        <div>
          <Label required>Smena</Label>
          <select style={field} value={row.shift_no} onChange={(e) => patch({ shift_no: Number(e.target.value) })}>
            <option value={1}>1-smena</option>
            {Number(shiftCount) === 2 && <option value={2}>2-smena</option>}
          </select>
        </div>
        <div><Label>Bino — ixtiyoriy</Label><input style={field} value={row.building_name} onChange={(e) => patch({ building_name: e.target.value })} placeholder="Masalan: Asosiy bino" /></div>
        <div><Label>Xona — ixtiyoriy</Label><input style={field} value={row.room_number} onChange={(e) => patch({ room_number: e.target.value })} placeholder="Masalan: 205" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>Sinf rahbari — ixtiyoriy</Label>
          <PersonPicker apiBase={apiBase} token={token} scopeId={scopeId} scopeKind={scopeKind} role="teacher" value={row.homeroom} onChange={(person) => patch({ homeroom: person })} adminGlobal={adminGlobal} />
        </div>
        <div>
          <Label>Psixolog — ixtiyoriy</Label>
          <PersonPicker apiBase={apiBase} token={token} scopeId={scopeId} scopeKind={scopeKind} role="psychologist" value={row.psychologist} onChange={(person) => patch({ psychologist: person })} adminGlobal={adminGlobal} />
        </div>
      </div>
    </div>
  );
}

function payloadClass(row) {
  return {
    code: row.code.trim(), shift_no: Number(row.shift_no) || 1,
    homeroom_teacher_user_id: row.homeroom?.user_id || null,
    psychologist_user_id: row.psychologist?.user_id || null,
    building_name: row.building_name.trim() || null,
    room_number: row.room_number.trim() || null,
  };
}

function SchoolCreateWizard({ apiBase, token, onCancel, onCreated }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [shiftCount, setShiftCount] = useState(1);
  const [director, setDirector] = useState(null);
  const [classes, setClasses] = useState([newClassRow(1)]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const next = () => {
    setError("");
    if (step === 1 && name.trim().length < 2) { setError("Maktab nomini kiriting"); return; }
    if (step === 2) {
      if (!classes.length || classes.some((row) => !row.code.trim())) { setError("Kamida bitta sinfni aniq kiriting"); return; }
      const compact = classes.map((row) => row.code.toUpperCase().replace(/[\s_-]/g, ""));
      if (new Set(compact).size !== compact.length) { setError("Bir sinf ikki marta kiritilgan"); return; }
    }
    setStep((current) => Math.min(3, current + 1));
  };

  const create = async () => {
    setSaving(true); setError("");
    try {
      const data = await requestJson(apiBase, "/api/maktab-v23/admin/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, name: name.trim(), region: region || null, district: district || null,
          shift_count: shiftCount, director_user_id: director?.user_id || null,
          classes: classes.map(payloadClass),
        }),
      });
      onCreated(data);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <section style={panel} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div><span className="text-xs font-bold" style={{ color: "#1B4B7A" }}>MAKTAB YARATISH · {step}/3</span><h2 className="text-lg font-bold">{step === 1 ? "Asosiy ma’lumot" : step === 2 ? "Haqiqiy sinflar" : "Tekshirish va yaratish"}</h2></div>
        <button type="button" onClick={onCancel} className="text-sm">✕</button>
      </div>
      {step === 1 && (
        <div className="space-y-3">
          <div><Label required>Maktab nomi</Label><input style={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: 21-sonli umumiy o‘rta ta’lim maktabi" autoFocus /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Viloyat</Label><select style={field} value={region} onChange={(e) => { setRegion(e.target.value); setDistrict(""); }}><option value="">Tanlanmagan</option>{VILOYATLAR.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div><Label>Tuman</Label><select style={field} value={district} disabled={!region} onChange={(e) => setDistrict(e.target.value)}><option value="">Tanlanmagan</option>{(HUDUDLAR[region] || []).map((item) => <option key={item}>{item}</option>)}</select></div>
          </div>
          <div><Label required>Maktabdagi smena soni</Label><div className="grid grid-cols-2 gap-2">{[1, 2].map((number) => <button type="button" key={number} style={shiftCount === number ? primary : secondary} onClick={() => { setShiftCount(number); setClasses((rows) => rows.map((row) => ({ ...row, shift_no: Math.min(row.shift_no, number) }))); }}>{number} smenali</button>)}</div></div>
          <div><Label>Direktor — ixtiyoriy</Label><PersonPicker apiBase={apiBase} token={token} value={director} onChange={setDirector} adminGlobal placeholder="Direktor ismini qidiring..." /></div>
          <Notice kind="success">Admin yaratgani uchun pul so‘ralmaydi: muassasa darhol faol bo‘ladi, yechiladigan summa 0 so‘m.</Notice>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3">
          <Notice kind="success">Tizim parallel sinflarni o‘zi ko‘paytirmaydi. Maktabda qaysi sinflar bor bo‘lsa, faqat shularni kiriting.</Notice>
          {classes.map((row, index) => <ClassFields key={row.key} row={row} shiftCount={shiftCount} apiBase={apiBase} token={token} adminGlobal onChange={(changed) => setClasses((items) => items.map((item, i) => i === index ? changed : item))} onRemove={classes.length > 1 ? () => setClasses((items) => items.filter((_, i) => i !== index)) : null} />)}
          <button type="button" style={secondary} className="w-full" onClick={() => setClasses((items) => [...items, newClassRow(1)])}>+ Yana bitta sinf qo‘shish</button>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3">
          <div className="rounded-xl p-4" style={{ background: "#F7F5F0" }}><b>{name}</b><p className="text-sm" style={{ color: "#6F6859" }}>{[region, district].filter(Boolean).join(", ") || "Hudud kiritilmagan"} · {shiftCount} smena · {classes.length} ta sinf</p></div>
          <div className="flex flex-wrap gap-2">{classes.map((row) => <span key={row.key} className="text-xs font-bold rounded-full px-3 py-1.5" style={{ background: "#EAF1F7", color: "#1B4B7A" }}>{row.code.toUpperCase()} · {row.shift_no}-smena</span>)}</div>
          <Notice kind="success">Faol holat · admin granti · 0 so‘m. Sinov yoki hamyon tasdig‘i chiqmaydi.</Notice>
        </div>
      )}
      <Notice>{error}</Notice>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" style={secondary} onClick={step === 1 ? onCancel : () => { setStep((current) => current - 1); setError(""); }}>Orqaga</button>
        {step < 3 ? <button type="button" style={primary} onClick={next}>Davom etish</button> : <button type="button" style={primary} disabled={saving} onClick={create}>{saving ? "Yaratilmoqda..." : "Maktabni yaratish"}</button>}
      </div>
    </section>
  );
}

function ClassManager({ apiBase, token, scopeId, scopeKind, classes, shiftCount, onReload }) {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const start = (item = null) => setEditing(item ? {
    key: String(item.id), code: item.normalized_code || `${item.sinf}-${item.harf}`,
    shift_no: item.shift_no || 1,
    homeroom: item.rahbar_user_id ? { user_id: item.rahbar_user_id, full_name: item.rahbar_ismi } : null,
    psychologist: item.psychologist_user_id ? { user_id: item.psychologist_user_id, full_name: item.psixolog_ismi } : null,
    building_name: item.building_name || "", room_number: item.room_number || "",
  } : newClassRow(1));
  const save = async () => {
    if (!editing.code.trim()) { setError("Sinf nomini kiriting"); return; }
    setSaving(true); setError("");
    try {
      await requestJson(apiBase, `/api/maktab-v23/${scopeId}/classes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, scope_kind: scopeKind, classes: [payloadClass(editing)] }) });
      setEditing(null); onReload();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">Sinflar</h3><p className="text-xs" style={{ color: "#8A8578" }}>Har bir sinf alohida yaratiladi; avtomatik parallel qo‘shilmaydi.</p></div><button type="button" style={primary} onClick={() => start()}>+ Sinf</button></div>
      {editing && <div className="space-y-3"><ClassFields row={editing} onChange={setEditing} shiftCount={shiftCount} apiBase={apiBase} token={token} scopeId={scopeId} scopeKind={scopeKind} /><Notice>{error}</Notice><div className="grid grid-cols-2 gap-2"><button style={secondary} onClick={() => setEditing(null)}>Bekor qilish</button><button style={primary} disabled={saving} onClick={save}>{saving ? "Saqlanmoqda..." : "Saqlash"}</button></div></div>}
      {!editing && (classes.length ? <div className="space-y-2">{classes.map((item) => (
        <div key={item.id} className="rounded-xl p-3.5 flex items-start justify-between gap-3" style={{ background: "#F7F5F0" }}>
          <div><b>{item.normalized_code || `${item.sinf}-${item.harf}`}</b><p className="text-xs" style={{ color: "#6F6859" }}>{item.shift_no || 1}-smena · {item.rahbar_ismi || "Rahbar tanlanmagan"} · {item.psixolog_ismi || "Psixolog tanlanmagan"}</p><p className="text-xs" style={{ color: "#8A8578" }}>{[item.building_name, item.room_number && `${item.room_number}-xona`].filter(Boolean).join(" · ") || "Bino/xona kiritilmagan"}</p></div>
          <button type="button" style={secondary} onClick={() => start(item)}>Tahrirlash</button>
        </div>
      ))}</div> : <p className="text-sm" style={{ color: "#8A8578" }}>Hali sinf yaratilmagan.</p>)}
    </div>
  );
}

function downloadAccessCodes(result) {
  if (!result?.access_codes?.length) return;
  const lines = ["XODIMLAR KIRISH KODLARI", "", ...result.access_codes.flatMap((item) => [`${item.name}: ${item.code}`, ""])];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "xodimlar_kirish_kodlari.txt"; a.click();
  URL.revokeObjectURL(url);
}

export function OrganizationDeletePanel({ apiBase, token, organizationType, organizationId, name, ownCreation, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const remove = async () => {
    setBusy(true); setError("");
    try {
      await requestJson(apiBase, `/api/muassasa-v23/${organizationType}/${organizationId}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, confirmation_name: confirmation, pin: ownCreation ? null : pin }),
      });
      onDeleted?.();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  if (!open) return <button type="button" style={{ ...secondary, width: "100%", color: "#A32D2D", marginTop: 16 }} onClick={() => setOpen(true)}>🗑 Muassasani o‘chirish</button>;
  return (
    <section style={{ ...panel, marginTop: 16, borderColor: "#E7A99C" }} className="space-y-3">
      <div className="flex justify-between gap-3"><div><b style={{ color: "#A32D2D" }}>Muassasani o‘chirish</b><p className="text-xs" style={{ color: "#6F6859" }}>Faol ro‘yxatdan olinadi va arxivga tushadi.</p></div><button type="button" onClick={() => setOpen(false)}>✕</button></div>
      <div><Label required>Muassasa nomini aynan kiriting</Label><input style={field} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder={name} /></div>
      {!ownCreation && <div><Label required>4 xonali o‘chirish paroli</Label><input style={field} inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} /></div>}
      <Notice kind="success">{ownCreation ? "Buni siz yaratgansiz — parol kerak emas." : "Buni boshqa admin yaratgan — 4 xonali parol majburiy."}</Notice>
      <Notice>{error}</Notice>
      <button type="button" style={{ ...danger, width: "100%", opacity: confirmation.trim() && (ownCreation || pin.length === 4) ? 1 : 0.5 }} disabled={!confirmation.trim() || (!ownCreation && pin.length !== 4) || busy} onClick={remove}>{busy ? "Arxivlanmoqda..." : "Tasdiqlab o‘chirish"}</button>
    </section>
  );
}

function ImportManager({ apiBase, token, scopeId, scopeKind, kind, classes }) {
  const student = kind === "students";
  const [selected, setSelected] = useState(classes.map((item) => item.id));
  const [preview, setPreview] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => setSelected((current) => current.length ? current : classes.map((item) => item.id)), [classes]);
  const templateUrl = student
    ? `${apiBase}/api/maktab-v23/${scopeId}/students/template?token=${encodeURIComponent(token)}&class_ids=${selected.join(",")}&scope_kind=${encodeURIComponent(scopeKind)}`
    : `${apiBase}/api/maktab-v23/${scopeId}/staff/template?token=${encodeURIComponent(token)}&scope_kind=${encodeURIComponent(scopeKind)}`;
  const upload = async (file) => {
    if (!file) return;
    setBusy(true); setError(""); setPreview(null); setResult(null); setDecisions({});
    try {
      const form = new FormData(); form.append("file", file);
      const data = await requestJson(apiBase, `/api/maktab-v23/${scopeId}/${kind}/preview?token=${encodeURIComponent(token)}&scope_kind=${encodeURIComponent(scopeKind)}`, { method: "POST", body: form });
      setPreview(data);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const commit = async () => {
    setBusy(true); setError("");
    try {
      const data = await requestJson(apiBase, `/api/maktab-v23/imports/${preview.job_id}/${kind}/commit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, decisions }) });
      setResult(data); if (!student) downloadAccessCodes(data);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const readyForCommit = useMemo(() => {
    if (!preview || preview.summary.errors > 0) return false;
    return preview.rows.every((row) => {
      if (row.status !== "decision_required") return true;
      if (student) return Object.prototype.hasOwnProperty.call(decisions[row.row_number] || {}, "same_parent_id");
      const rowDecision = decisions[row.row_number] || {};
      return rowDecision.accept_subjects && (row.assignments || []).every((assignment, index) => !assignment.needs_confirmation || rowDecision.subject_choices?.[index]);
    });
  }, [preview, decisions, student]);
  return (
    <div className="space-y-4">
      <div><h3 className="font-bold">{student ? "O‘quvchilar va ota-onalar" : "Xodimlar, fanlar va sinflar"}</h3><p className="text-xs" style={{ color: "#8A8578" }}>Majburiy va ixtiyoriy ustunlar shablonda rang bilan ajratilgan.</p></div>
      {student && <div><Label required>Shablonga kiritiladigan sinflar</Label><div className="flex flex-wrap gap-2">{classes.map((item) => { const checked = selected.includes(item.id); return <label key={item.id} className="text-xs font-semibold rounded-full px-3 py-2 cursor-pointer" style={{ background: checked ? "#EAF1F7" : "#F7F5F0", color: checked ? "#1B4B7A" : "#6F6859" }}><input className="mr-1.5" type="checkbox" checked={checked} onChange={() => setSelected((current) => checked ? current.filter((id) => id !== item.id) : [...current, item.id])} />{item.normalized_code || `${item.sinf}-${item.harf}`}</label>; })}</div></div>}
      <a href={selected.length || !student ? templateUrl : undefined} aria-disabled={student && !selected.length} style={{ ...secondary, display: "block", textAlign: "center", opacity: student && !selected.length ? 0.5 : 1 }}>📥 {student ? "O‘quvchilar" : "Xodimlar"} shablonini yuklab olish</a>
      <label style={{ ...secondary, display: "block", textAlign: "center", cursor: "pointer", borderStyle: "dashed" }}>{busy ? "Tekshirilmoqda..." : "📤 To‘ldirilgan Excel faylni tekshirish"}<input type="file" accept=".xlsx" hidden disabled={busy} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} /></label>
      <Notice>{error}</Notice>
      {preview && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl p-2" style={{ background: "#EDF8F1" }}><b>{preview.summary.ready}</b><small className="block">tayyor</small></div><div className="rounded-xl p-2" style={{ background: "#FFF8E8" }}><b>{preview.summary.decision_required}</b><small className="block">tanlov kerak</small></div><div className="rounded-xl p-2" style={{ background: "#FFF0ED" }}><b>{preview.summary.errors}</b><small className="block">xato</small></div></div>
          {preview.rows.map((row) => (
            <div key={row.row_number} className="rounded-xl border p-3" style={{ borderColor: row.status === "error" ? "#E7A99C" : row.status === "decision_required" ? "#E7BD73" : "#C9DFCF" }}>
              <div className="flex items-center justify-between gap-2"><b className="text-sm">{row.row_number}-qator · {student ? row.student_name : row.name}</b><span className="text-xs">{row.status === "ready" ? "✅ Tayyor" : row.status === "error" ? "❌ Xato" : "⚠️ Tanlang"}</span></div>
              {student ? <p className="text-xs" style={{ color: "#6F6859" }}>{row.class_code} · {row.parent_type}: {row.parent_name} ({row.parent_birth_year})</p> : <p className="text-xs" style={{ color: "#6F6859" }}>{row.role_label} · {row.specialty}{row.assignments?.length ? ` · ${row.assignments.map((a) => `${a.class_code ? `${a.class_code}: ` : ""}${a.subject || a.input}`).join("; ")}` : ""}</p>}
              {row.errors?.map((message) => <p key={message} className="text-xs mt-1" style={{ color: "#A32D2D" }}>{message}</p>)}
              {row.warnings?.map((message) => <p key={message} className="text-xs mt-1" style={{ color: "#8A5A1C" }}>{message}</p>)}
              {student && row.status === "decision_required" && <div className="mt-2 rounded-lg p-2" style={{ background: "#FFF8E8" }}><b className="text-xs">Bular bir xil ota/onami?</b>{row.parent_candidates.map((candidate) => <label key={candidate.user_id} className="block text-xs mt-1"><input type="radio" name={`parent-${row.row_number}`} className="mr-1.5" checked={String(decisions[row.row_number]?.same_parent_id) === String(candidate.user_id)} onChange={() => setDecisions((current) => ({ ...current, [row.row_number]: { same_parent_id: candidate.user_id, canonical_name: candidate.full_name } }))} />Ha — {candidate.full_name}, {candidate.birth_year} ({candidate.score}% mos)</label>)}<label className="block text-xs mt-1"><input type="radio" name={`parent-${row.row_number}`} className="mr-1.5" checked={decisions[row.row_number]?.same_parent_id === "new"} onChange={() => setDecisions((current) => ({ ...current, [row.row_number]: { same_parent_id: "new" } }))} />Yo‘q, boshqa odam — yangi ota/ona yarating</label>{decisions[row.row_number]?.same_parent_id !== "new" && decisions[row.row_number]?.same_parent_id && <input style={{ ...field, marginTop: 8 }} value={decisions[row.row_number]?.canonical_name || ""} onChange={(e) => setDecisions((current) => ({ ...current, [row.row_number]: { ...current[row.row_number], canonical_name: e.target.value } }))} placeholder="Saqlanadigan to‘g‘ri F.I.Sh." />}</div>}
              {!student && row.status === "decision_required" && <div className="mt-2 space-y-2">{row.assignments.map((assignment, index) => assignment.needs_confirmation && <label key={`${assignment.input}-${index}`} className="block text-xs font-semibold">“{assignment.input}” uchun to‘g‘ri fan<select style={{ ...field, marginTop: 5 }} value={decisions[row.row_number]?.subject_choices?.[index] || ""} onChange={(e) => setDecisions((current) => ({ ...current, [row.row_number]: { ...current[row.row_number], subject_choices: { ...(current[row.row_number]?.subject_choices || {}), [index]: e.target.value } } }))}><option value="">Tanlang</option>{assignment.alternatives.map((option) => <option key={option.subject} value={option.subject}>{option.subject} · {option.score}% mos</option>)}</select></label>)}<label className="block text-xs font-semibold"><input type="checkbox" className="mr-1.5" checked={Boolean(decisions[row.row_number]?.accept_subjects)} onChange={(e) => setDecisions((current) => ({ ...current, [row.row_number]: { ...current[row.row_number], accept_subjects: e.target.checked } }))} />Tanlangan fan tuzatishlarini tasdiqlayman</label></div>}
            </div>
          ))}
          <button type="button" style={{ ...primary, width: "100%", opacity: readyForCommit && !busy ? 1 : 0.5 }} disabled={!readyForCommit || busy} onClick={commit}>{busy ? "Saqlanmoqda..." : "Tekshirilgan ma’lumotlarni saqlash"}</button>
        </div>
      )}
      {result && <Notice kind="success">{student ? `${result.created_students} ta o‘quvchi, ${result.created_parents} ta ota/ona yaratildi; ${result.parent_child_links} ta bog‘lanish saqlandi.` : `${result.created_staff} ta xodim yaratildi, ${result.updated_staff} ta xodim yangilandi. Yangi kirish kodlari fayl bo‘lib yuklandi.`}</Notice>}
    </div>
  );
}

export function SchoolInstitutionManager({ apiBase, token, scopeId, scopeKind = "school", school, adminMode = false, onBack, onDeleted }) {
  const [data, setData] = useState({ classes: [], shift_count: school?.smena_soni || 1 });
  const [tab, setTab] = useState("classes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const [pin, setPin] = useState("");
  const [deleting, setDeleting] = useState(false);
  const load = async () => {
    setLoading(true); setError("");
    try { setData(await requestJson(apiBase, `/api/maktab-v23/${scopeId}/classes?token=${encodeURIComponent(token)}&scope_kind=${encodeURIComponent(scopeKind)}`)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (scopeId) load(); }, [scopeId, token]);
  const remove = async () => {
    setDeleting(true); setError("");
    try {
      await requestJson(apiBase, `/api/maktab-v23/${scopeId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, confirmation_name: confirmName, pin: school?.own_creation ? null : pin }) });
      onDeleted?.();
    } catch (e) { setError(e.message); }
    finally { setDeleting(false); }
  };
  const tabs = [["classes", "Sinflar"], ["staff", "Xodimlar importi"], ["students", "O‘quvchilar importi"], ...(adminMode ? [["delete", "O‘chirish"]] : [])];
  return (
    <div className="space-y-4">
      {onBack && <button type="button" onClick={onBack} className="text-sm font-semibold" style={{ color: "#1B4B7A" }}>← Maktablar</button>}
      {school && <div><h1 className="text-xl font-bold">{school.nomi || school.name}</h1><p className="text-xs" style={{ color: "#8A8578" }}>{[school.viloyat, school.tuman].filter(Boolean).join(", ")}</p></div>}
      <div className="flex flex-wrap gap-2">{tabs.map(([key, label]) => <button type="button" key={key} style={tab === key ? primary : secondary} onClick={() => { setTab(key); setError(""); }}>{label}</button>)}</div>
      <Notice>{error}</Notice>
      <section style={panel}>
        {loading ? <p className="text-sm">Yuklanmoqda...</p> : tab === "classes" ? <ClassManager apiBase={apiBase} token={token} scopeId={scopeId} scopeKind={scopeKind} classes={data.classes || []} shiftCount={data.shift_count || 1} onReload={load} /> : tab === "staff" ? <ImportManager apiBase={apiBase} token={token} scopeId={scopeId} scopeKind={scopeKind} kind="staff" classes={data.classes || []} /> : tab === "students" ? <ImportManager apiBase={apiBase} token={token} scopeId={scopeId} scopeKind={scopeKind} kind="students" classes={data.classes || []} /> : (
          <div className="space-y-3"><h3 className="font-bold" style={{ color: "#A32D2D" }}>Muassasani o‘chirish</h3><p className="text-sm" style={{ color: "#6F6859" }}>Muassasa faol ro‘yxatdan olinadi va arxivlanadi. Tasdiqlash uchun nomini aynan kiriting.</p><div><Label required>Muassasa nomi</Label><input style={field} value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={school?.nomi} /></div>{!school?.own_creation && <div><Label required>4 xonali o‘chirish paroli</Label><input style={field} inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0000" /></div>}<Notice kind="success">{school?.own_creation ? "Bu muassasani siz yaratgansiz — parol so‘ralmaydi." : "Boshqa admin yaratgan — 4 xonali parol majburiy."}</Notice><button type="button" style={{ ...danger, width: "100%", opacity: confirmName.trim() && (school?.own_creation || pin.length === 4) ? 1 : 0.5 }} disabled={!confirmName.trim() || (!school?.own_creation && pin.length !== 4) || deleting} onClick={remove}>{deleting ? "Arxivlanmoqda..." : "Muassasani o‘chirish"}</button></div>
        )}
      </section>
    </div>
  );
}

export default function SchoolAdminV23({ apiBase, token }) {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const load = async () => {
    setLoading(true); setError("");
    try { const data = await requestJson(apiBase, `/api/maktab-v23/admin/schools?token=${encodeURIComponent(token)}`); setSchools(data.schools || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [token]);
  if (selected) return <SchoolInstitutionManager apiBase={apiBase} token={token} scopeId={selected.id} school={selected} adminMode onBack={() => { setSelected(null); load(); }} onDeleted={() => { setSelected(null); load(); }} />;
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3"><div><h1 className="text-xl font-bold">🏫 Maktablar</h1><p className="text-xs" style={{ color: "#8A8578" }}>Yaratish, sinflar, xodimlar va o‘quvchilar bitta ketma-ket boshqaruvda.</p></div><button type="button" style={primary} onClick={() => { setCreating(true); setCreated(null); }}>+ Yangi maktab</button></div>
      <Notice>{error}</Notice>
      {created && <Notice kind="success">Maktab darhol faol yaratildi. To‘lov: 0 so‘m. Boshqa admin o‘chirishi uchun bir martalik 4 xonali parol: <b>{created.deletion_pin}</b>. Uni xavfsiz saqlang.</Notice>}
      {creating && <SchoolCreateWizard apiBase={apiBase} token={token} onCancel={() => setCreating(false)} onCreated={(data) => { setCreating(false); setCreated(data); load(); }} />}
      {!creating && (loading ? <p className="text-sm">Maktablar yuklanmoqda...</p> : schools.length ? <div className="space-y-2">{schools.map((item) => <button type="button" key={item.id} className="w-full text-left" style={panel} onClick={() => setSelected(item)}><div className="flex items-center justify-between gap-3"><div><b>{item.nomi}</b><p className="text-xs" style={{ color: "#8A8578" }}>{[item.viloyat, item.tuman].filter(Boolean).join(", ") || "Hudud kiritilmagan"} · {item.smena_soni} smena · {item.class_count} ta sinf</p><p className="text-xs" style={{ color: item.own_creation ? "#28735A" : "#8A5A1C" }}>{item.own_creation ? "Siz yaratgansiz · o‘chirishda parol kerak emas" : "Boshqa admin yaratgan · o‘chirishda 4 xonali parol kerak"}</p></div><span>›</span></div></button>)}</div> : <div style={panel} className="text-center text-sm" >Hali maktab yaratilmagan.</div>)}
    </div>
  );
}
