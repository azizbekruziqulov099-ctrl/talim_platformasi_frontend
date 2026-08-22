// SAMTM V18.66 — metod kunini tozalash + sinf soatini qat’iy joylash.
// SAMTM V18.65 — psixolog sinflari va aniq haftalik yuklama.
// SAMTM V18.61 — Xodim Excel shabloni gorizontal yurishi va tezligi tuzatildi.
// SAMTM V18.60 — Har bir sinf bo‘yicha aniq soat importi aqlli jadvalga uzatiladi.
// SAMTM V18.59 — Shablondagi fanlarni birlashtirib ko‘rsatish va metod kuni hisoboti.
// SAMTM V18.58 — Bitta kunlik sinf qoidasi va sinf-kun hisoboti.
// SAMTM V18.57 — Maktab bosh sahifasi xavfsiz va qisman yuklanadi.
// SAMTM V18.56 — xohlagan parallel/aniq sinf uchun xohlagan kunni bir tugma bilan bloklash.
// SAMTM V18.54 — Kalendar autosave, ommaviy o‘qituvchi vaqti va aqlli shablon.
// SAMTM V18.49 — blank sahifa tuzatildi: React importi tiklandi.
// SAMTM V18.48 — manager loading/fallback tuzatildi.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, BarChart3, BellRing, BookOpen, CalendarDays, CheckCircle2,
  ChevronRight, ClipboardCheck, Clock3, GraduationCap, LayoutDashboard,
  Loader2, MessageCircle, RefreshCw, School, Sparkles, Users, UserRoundCheck,
  WandSparkles, AlertTriangle, CalendarCheck2, ToggleLeft, ToggleRight,
  Eye, ShieldCheck, UserCog, Stethoscope, Brain, LockKeyhole, X, Search
} from "lucide-react";

const palette = {
  ink: "#18324B",
  blue: "#155A7A",
  teal: "#0F7C82",
  mint: "#EAF7F4",
  sky: "#EDF5FB",
  cream: "#FAF7F0",
  amber: "#A96A14",
  amberBg: "#FFF4DE",
  red: "#A54242",
  redBg: "#FCECEC",
  green: "#33755A",
  greenBg: "#EAF6EF",
  line: "#DDE6EC",
  muted: "#6D7B87",
};

function Card({ children, style, className = "" }) {
  return (
    <div className={`rounded-3xl border bg-white ${className}`} style={{ borderColor: palette.line, boxShadow: "0 10px 35px rgba(23,50,75,.06)", ...style }}>
      {children}
    </div>
  );
}

function Stat({ icon, value, label, tone = "blue" }) {
  const map = {
    blue: [palette.sky, palette.blue], teal: [palette.mint, palette.teal],
    green: [palette.greenBg, palette.green], amber: [palette.amberBg, palette.amber], red: [palette.redBg, palette.red]
  };
  const [bg, fg] = map[tone] || map.blue;
  return (
    <Card className="p-4">
      <div className="w-9 h-9 rounded-2xl flex items-center justify-center mb-3" style={{ background: bg, color: fg }}>{icon}</div>
      <div className="text-2xl font-black" style={{ color: palette.ink }}>{value ?? "—"}</div>
      <div className="text-xs mt-1" style={{ color: palette.muted }}>{label}</div>
    </Card>
  );
}

function QuickAction({ icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border p-4 bg-white transition-transform active:scale-[.99]" style={{ borderColor: palette.line }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: palette.sky, color: palette.blue }}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold" style={{ color: palette.ink }}>{title}</div>
          <div className="text-xs mt-0.5 leading-relaxed" style={{ color: palette.muted }}>{desc}</div>
        </div>
        <ChevronRight size={17} style={{ color: "#A0ADB8" }} />
      </div>
    </button>
  );
}

function TeacherToday({ token, apiBase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingReminder, setSavingReminder] = useState(false);

  const load = () => {
    setLoading(true); setError("");
    fetch(`${apiBase}/api/oqituvchi/bugun?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => { if (d.detail) setError(d.detail); else setData(d); })
      .catch(() => setError("Bugungi darslarni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  };
  useEffect(load, [token, apiBase]);

  const toggleKundalikReminder = async () => {
    const next = !Boolean(data?.kundalik_baho_eslatmasi_yoqilgan);
    setSavingReminder(true);
    try {
      const r = await fetch(`${apiBase}/api/oqituvchi/kundalik-baho-eslatmasi?token=${encodeURIComponent(token)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yoqilgan: next }),
      });
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Sozlamani saqlab bo'lmadi");
      setData(prev => ({ ...prev, kundalik_baho_eslatmasi_yoqilgan: next, kundalik_baho_eslatma: false }));
    } catch (e) {
      setError(e.message || "Sozlamani saqlab bo'lmadi");
    } finally {
      setSavingReminder(false);
    }
  };

  if (loading) return <Card className="p-6"><Loader2 className="animate-spin" size={22} style={{ color: palette.blue }} /></Card>;
  if (error) return <Card className="p-5"><p className="text-sm" style={{ color: palette.red }}>{error}</p></Card>;

  return (
    <div className="space-y-4">
      {data?.kundalik_baho_eslatma && (
        <Card className="p-4" style={{ background: "linear-gradient(135deg,#FFF8E8,#FFFDF8)", borderColor: "#F1D39A" }}>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: palette.amberBg, color: palette.amber }}><BellRing size={20} /></div>
            <div>
              <div className="text-sm font-bold" style={{ color: palette.ink }}>Kundalik eslatmasi</div>
              <div className="text-xs mt-1 leading-relaxed" style={{ color: palette.muted }}>{data.kundalik_baho_eslatma_matni}</div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <button onClick={toggleKundalikReminder} disabled={savingReminder} className="w-full flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: data?.kundalik_baho_eslatmasi_yoqilgan ? palette.greenBg : palette.cream, color: data?.kundalik_baho_eslatmasi_yoqilgan ? palette.green : palette.muted }}>
            {data?.kundalik_baho_eslatmasi_yoqilgan ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold" style={{ color: palette.ink }}>Kundalik baho eslatmasi</div>
            <div className="text-xs mt-0.5" style={{ color: palette.muted }}>
              {data?.kundalik_baho_eslatmasi_yoqilgan
                ? "Yoqilgan — darslaringiz bo'lgan kun oxirida Kundalik baholari haqida eslatadi."
                : "O'chiq — Kundalik baholari haqida hech qanday eslatma chiqmaydi."}
            </div>
          </div>
          <div className="text-xs font-black px-3 py-1.5 rounded-full" style={{ background: data?.kundalik_baho_eslatmasi_yoqilgan ? palette.greenBg : palette.cream, color: data?.kundalik_baho_eslatmasi_yoqilgan ? palette.green : palette.muted }}>
            {savingReminder ? "..." : data?.kundalik_baho_eslatmasi_yoqilgan ? "YOQ" : "O'CHIQ"}
          </div>
        </button>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-bold tracking-[.12em] uppercase" style={{ color: palette.teal }}>Bugungi ish rejam</div>
            <h2 className="text-xl font-black mt-1" style={{ color: palette.ink }}>{data?.oqituvchi}</h2>
          </div>
          <button onClick={load} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: palette.sky, color: palette.blue }}><RefreshCw size={16}/></button>
        </div>
        <div className="space-y-2">
          {(data?.darslar || []).map((d) => (
            <div key={`${d.id}-${d.sinf_id}`} className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: palette.cream }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black" style={{ background: "#fff", color: palette.blue }}>{d.dars_raqami}</div>
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: palette.ink }}>{d.fan}</div>
                <div className="text-xs mt-0.5" style={{ color: palette.muted }}>{d.sinf}-{d.harf}{d.xona ? ` · ${d.xona}` : ""}{d.boshlanish_vaqti ? ` · ${d.boshlanish_vaqti}` : ""}</div>
              </div>
              <ClipboardCheck size={18} style={{ color: palette.teal }} />
            </div>
          ))}
          {(data?.darslar || []).length === 0 && <div className="rounded-2xl p-5 text-center" style={{ background: palette.cream, color: palette.muted }}>Bugun sizga biriktirilgan dars topilmadi.</div>}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Clock3 size={18}/>} value={data?.jadvaldagi_haftalik_soat ?? 0} label="jadvaldagi haftalik soat" tone="teal" />
        <Stat icon={<CalendarCheck2 size={18}/>} value={data?.haftalik_reja_soati ?? "—"} label="belgilangan haftalik yuklama" tone="blue" />
      </div>
    </div>
  );
}


const previewRoleMeta = {
  maktab_admin: { nom: "Maktab admini", izoh: "To'liq maktab boshqaruv ko'rinishi", icon: <ShieldCheck size={17}/> },
  direktor: { nom: "Direktor", izoh: "Rahbariyatning kundalik boshqaruv ko'rinishi", icon: <School size={17}/> },
  zavuch: { nom: "Zavuch", izoh: "Jadval, fan va o'qituvchi yuklamasi", icon: <CalendarDays size={17}/> },
  manaviyatchi: { nom: "Ma'naviyatchi", izoh: "Davomat va tarbiyaviy kuzatuv", icon: <BellRing size={17}/> },
  fan_oqituvchisi: { nom: "Fan o'qituvchisi", izoh: "Aniq o'qituvchini tanlab ko'rish", icon: <BookOpen size={17}/> },
  sinf_rahbari: { nom: "Sinf rahbari", izoh: "Aniq sinfni rahbar sifatida ko'rish", icon: <Users size={17}/> },
  oquvchi: { nom: "O'quvchi", izoh: "Sinf va o'quvchini tanlab ko'rish", icon: <GraduationCap size={17}/> },
  ota_ona: { nom: "Ota-ona", izoh: "Farzand natijalarini ota-ona ko'zi bilan", icon: <UserRoundCheck size={17}/> },
  psixolog: { nom: "Psixolog", izoh: "Faqat tegishli kuzatuv va yordam holatlari", icon: <Brain size={17}/> },
  hamshira: { nom: "Hamshira", izoh: "Maxfiy sog'liq moduli interfeysi", icon: <Stethoscope size={17}/> },
};

function PreviewStat({ item }) {
  const tones = {
    blue: [palette.sky, palette.blue], teal: [palette.mint, palette.teal],
    green: [palette.greenBg, palette.green], amber: [palette.amberBg, palette.amber],
    red: [palette.redBg, palette.red],
  };
  const [bg, fg] = tones[item?.tone] || tones.blue;
  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: palette.line }}>
      <div className="text-2xl font-black" style={{ color: fg }}>{item?.value ?? "—"}</div>
      <div className="text-xs mt-1" style={{ color: palette.muted }}>{item?.label}</div>
      <div className="h-1 rounded-full mt-3" style={{ background: bg }} />
    </div>
  );
}

function AdminRolePreview({ token, apiBase, maktabId, schoolName, onClose }) {
  const [catalog, setCatalog] = useState(null);
  const [role, setRole] = useState("maktab_admin");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [preview, setPreview] = useState(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState("");
  const [roleSearch, setRoleSearch] = useState("");

  useEffect(() => {
    setLoadingCatalog(true);
    fetch(`${apiBase}/api/admin/maktab_korish_katalogi?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`)
      .then(r => r.json().then(d => ({ ok:r.ok, d })))
      .then(({ok,d}) => {
        if (!ok || d.detail) throw new Error(d.detail || "Ko'rish katalogi yuklanmadi");
        setCatalog(d);
      })
      .catch(e => setError(e.message || "Ko'rish katalogi yuklanmadi"))
      .finally(() => setLoadingCatalog(false));
  }, [token, apiBase, maktabId]);

  const teachers = useMemo(() => (catalog?.xodimlar || []).filter(x => x.fanlari || x.lavozim === "fan_oqituvchisi"), [catalog]);
  const students = useMemo(() => (catalog?.oquvchilar || []).filter(x => !selectedClass || String(x.sinf_id) === String(selectedClass)), [catalog, selectedClass]);

  useEffect(() => {
    setSelectedUser("");
    setSelectedClass("");
    setSelectedStudent("");
    setPreview(null);
    setError("");
  }, [role]);

  useEffect(() => {
    if (selectedStudent && !students.some(x => String(x.user_id) === String(selectedStudent))) setSelectedStudent("");
  }, [selectedClass, students, selectedStudent]);

  const needsTeacher = role === "fan_oqituvchisi";
  const needsClass = ["sinf_rahbari","oquvchi","ota_ona"].includes(role);
  const needsStudent = ["oquvchi","ota_ona"].includes(role);

  const canOpen = !needsTeacher || selectedUser
    ? (!needsClass || selectedClass
      ? (!needsStudent || selectedStudent || students.length > 0)
      : false)
    : false;

  const openPreview = async () => {
    if (!canOpen) return;
    setLoadingPreview(true); setError("");
    const q = new URLSearchParams({
      token, maktab_id: String(maktabId), rol: role,
    });
    if (selectedUser) q.set("user_id", selectedUser);
    if (selectedClass) q.set("sinf_id", selectedClass);
    if (selectedStudent) q.set("oquvchi_id", selectedStudent);
    try {
      const r = await fetch(`${apiBase}/api/admin/maktab_rol_korish?${q.toString()}`);
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Ko'rinishni ochib bo'lmadi");
      setPreview(d);
    } catch (e) {
      setError(e.message || "Ko'rinishni ochib bo'lmadi");
    } finally {
      setLoadingPreview(false);
    }
  };

  const filteredRoles = Object.entries(previewRoleMeta).filter(([,m]) =>
    !roleSearch.trim() || `${m.nom} ${m.izoh}`.toLowerCase().includes(roleSearch.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#F3F8FB,#F7F4ED)" }}>
      <div className="sticky top-0 z-30 border-b backdrop-blur-xl" style={{ background: "rgba(255,255,255,.94)", borderColor: palette.line }}>
        <div className="max-w-7xl mx-auto px-4 md:px-7 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: palette.redBg, color: palette.red }}><Eye size={20}/></div>
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.red }}>Admin ko'rish rejimi</div>
              <div className="text-sm font-bold truncate" style={{ color: palette.ink }}>{schoolName || "Maktab"} · hech narsa o'zgarmaydi</div>
            </div>
          </div>
          <button onClick={onClose} className="px-3 py-2 rounded-xl text-xs font-black flex items-center gap-2" style={{ background: palette.cream, color: palette.ink }}><X size={15}/> Yopish</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-7 py-5 grid xl:grid-cols-[340px_1fr] gap-5">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3"><UserCog size={18} style={{ color: palette.blue }}/><div className="font-black" style={{ color: palette.ink }}>Kim bo'lib ko'ramiz?</div></div>
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-3" style={{ color: palette.muted }}/>
              <input value={roleSearch} onChange={e=>setRoleSearch(e.target.value)} placeholder="Rolni qidiring..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: palette.line }}/>
            </div>
            <div className="space-y-2 max-h-[52vh] overflow-auto pr-1">
              {filteredRoles.map(([key,m]) => (
                <button key={key} onClick={()=>setRole(key)} className="w-full rounded-2xl border p-3 text-left flex gap-3" style={{ borderColor: role===key ? palette.blue : palette.line, background: role===key ? palette.sky : "#fff" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: role===key ? "#fff" : palette.cream, color: role===key ? palette.blue : palette.muted }}>{m.icon}</div>
                  <div>
                    <div className="text-sm font-black" style={{ color: palette.ink }}>{m.nom}</div>
                    <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: palette.muted }}>{m.izoh}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs font-black uppercase tracking-[.1em] mb-3" style={{ color: palette.teal }}>Tanlash</div>
            {loadingCatalog ? <div className="py-5 flex justify-center"><Loader2 className="animate-spin" size={22} style={{ color: palette.blue }}/></div> : <>
              {needsTeacher && (
                <label className="block mb-3">
                  <span className="text-xs font-bold" style={{ color: palette.ink }}>O'qituvchi</span>
                  <select value={selectedUser} onChange={e=>setSelectedUser(e.target.value)} className="w-full mt-1.5 p-2.5 rounded-xl border text-sm bg-white" style={{ borderColor: palette.line }}>
                    <option value="">O'qituvchini tanlang</option>
                    {teachers.map(x=><option key={x.user_id} value={x.user_id}>{x.full_name}{x.fanlari ? ` — ${String(x.fanlari).replaceAll("\\n",", ")}` : ""}</option>)}
                  </select>
                </label>
              )}
              {needsClass && (
                <label className="block mb-3">
                  <span className="text-xs font-bold" style={{ color: palette.ink }}>Sinf</span>
                  <select value={selectedClass} onChange={e=>setSelectedClass(e.target.value)} className="w-full mt-1.5 p-2.5 rounded-xl border text-sm bg-white" style={{ borderColor: palette.line }}>
                    <option value="">Sinfni tanlang</option>
                    {(catalog?.sinflar || []).map(x=><option key={x.id} value={x.id}>{x.sinf}-{x.harf} · {x.oquvchi_soni} o'quvchi</option>)}
                  </select>
                </label>
              )}
              {needsStudent && selectedClass && (
                <label className="block mb-3">
                  <span className="text-xs font-bold" style={{ color: palette.ink }}>O'quvchi</span>
                  <select value={selectedStudent} onChange={e=>setSelectedStudent(e.target.value)} className="w-full mt-1.5 p-2.5 rounded-xl border text-sm bg-white" style={{ borderColor: palette.line }}>
                    <option value="">{students.length ? "Birinchi o'quvchini avtomatik ko'rish" : "O'quvchi yo'q"}</option>
                    {students.map(x=><option key={x.user_id} value={x.user_id}>{x.full_name}</option>)}
                  </select>
                </label>
              )}
              {!needsTeacher && !needsClass && <div className="rounded-xl p-3 text-xs" style={{ background: palette.cream, color: palette.muted }}>Bu rol uchun qo'shimcha odam yoki sinf tanlash shart emas.</div>}
              <button onClick={openPreview} disabled={!canOpen || loadingPreview} className="w-full mt-3 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2" style={{ background: canOpen ? palette.blue : "#AAB6C0", opacity: loadingPreview ? .7 : 1 }}>
                {loadingPreview ? <Loader2 className="animate-spin" size={17}/> : <Eye size={17}/>} Ko'rinishni ochish
              </button>
            </>}
          </Card>
        </div>

        <div>
          {error && <Card className="p-4 mb-4" style={{ borderColor: "#EECACA", background: palette.redBg }}><div className="text-sm font-bold" style={{ color: palette.red }}>{error}</div></Card>}

          {!preview ? (
            <Card className="min-h-[65vh] p-8 md:p-12 flex items-center justify-center text-center">
              <div className="max-w-xl">
                <div className="w-20 h-20 rounded-[28px] mx-auto flex items-center justify-center mb-5" style={{ background: palette.sky, color: palette.blue }}><Eye size={36}/></div>
                <div className="text-2xl font-black" style={{ color: palette.ink }}>{previewRoleMeta[role]?.nom}</div>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: palette.muted }}>{previewRoleMeta[role]?.izoh}. Chapdan kerakli odam yoki sinfni tanlab, ko'rinishni oching.</p>
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black" style={{ background: palette.greenBg, color: palette.green }}><LockKeyhole size={14}/> Faqat ko'rish · o'zgartirish yo'q</div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="p-5 md:p-7" style={{ background: "linear-gradient(135deg,#163E5B,#0E747B)", borderColor:"transparent", color:"#fff" }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[.14em] opacity-75">Siz hozir shunday ko'ryapsiz</div>
                    <h2 className="text-2xl md:text-3xl font-black mt-2">{preview.rol_nomi}</h2>
                    <div className="text-sm mt-1 opacity-80">{preview?.tanlangan?.full_name || preview?.tanlangan?.rahbar_ismi || (preview?.tanlangan?.sinf ? `${preview.tanlangan.sinf}-${preview.tanlangan.harf}` : schoolName)}</div>
                  </div>
                  <div className="px-3 py-2 rounded-xl text-xs font-black flex items-center gap-2" style={{ background:"rgba(255,255,255,.14)" }}><LockKeyhole size={14}/> READ ONLY</div>
                </div>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {(preview.kartalar || []).map((x,i)=><PreviewStat key={`${x.label}-${i}`} item={x}/>)}
              </div>

              {(preview.bolimlar || []).map((b,bi)=>(
                <Card key={`${b.title}-${bi}`} className="p-5">
                  <div className="mb-4">
                    <div className="text-lg font-black" style={{ color: palette.ink }}>{b.title}</div>
                    {b.subtitle && <div className="text-xs mt-1" style={{ color: palette.muted }}>{b.subtitle}</div>}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2.5">
                    {(b.items || []).map((it,ii)=>(
                      <div key={`${it.title}-${ii}`} className="rounded-2xl border p-3.5" style={{ borderColor: palette.line, background:"#FCFDFE" }}>
                        <div className="text-sm font-black" style={{ color: palette.ink }}>{it.title}</div>
                        <div className="text-xs mt-1 leading-relaxed" style={{ color: palette.muted }}>{it.detail}</div>
                      </div>
                    ))}
                  </div>
                  {!(b.items || []).length && <div className="rounded-2xl p-5 text-sm text-center" style={{ background: palette.cream, color: palette.muted }}>{b.empty_text || "Ma'lumot yo'q"}</div>}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function WorkspacePortal({ children }) {
  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = oldOverflow; };
  }, []);
  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 2147483000, overflow: "auto",
        background: "linear-gradient(180deg,#F5FAFC 0%,#F7F4ED 100%)",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

async function smartFetch(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.detail) {
    const detail = typeof data?.detail === "string" ? data.detail : data?.detail?.message || "Amal bajarilmadi";
    throw new Error(detail);
  }
  return data;
}

const smartDays = [
  [1, "Dushanba"], [2, "Seshanba"], [3, "Chorshanba"],
  [4, "Payshanba"], [5, "Juma"], [6, "Shanba"], [7, "Yakshanba"],
];

const emptyQuarter = (number) => ({ chorak: number, boshlanish: "", tugash: "", holat: "taxminiy" });
const defaultShift = (smena) => ({
  smena, dars_soni: 7, boshlanish_vaqti: smena === 1 ? "08:00" : "13:30",
  dars_daqiqa: 45, tanaffus_daqiqa: 5, katta_tanaffus_darsdan_keyin: 3,
  katta_tanaffus_daqiqa: 15,
});

function SmartHeader({ title, subtitle, onClose, badge = "AQILLI JADVAL 2.0" }) {
  return (
    <div className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ background: "rgba(255,255,255,.96)", borderColor: palette.line }}>
      <div className="max-w-[1500px] mx-auto px-4 md:px-7 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] md:text-xs font-black tracking-[.14em] uppercase" style={{ color: palette.teal }}>{badge}</div>
          <h1 className="text-lg md:text-2xl font-black truncate" style={{ color: palette.ink }}>{title}</h1>
          {subtitle && <p className="text-xs mt-0.5 truncate" style={{ color: palette.muted }}>{subtitle}</p>}
        </div>
        <button onClick={onClose} className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2" style={{ background: palette.cream, color: palette.ink }}>
          <ArrowLeft size={16}/> Asosiy sahifaga qaytish
        </button>
      </div>
    </div>
  );
}

function SmartNotice({ tone = "info", children }) {
  const styles = {
    info: [palette.sky, palette.blue], success: [palette.greenBg, palette.green],
    warning: [palette.amberBg, palette.amber], error: [palette.redBg, palette.red],
  };
  const [background, color] = styles[tone] || styles.info;
  return <div className="rounded-2xl p-3.5 text-sm leading-relaxed" style={{ background, color }}>{children}</div>;
}

function SmartStepNav({ step, setStep, teacherOnly }) {
  const steps = teacherOnly
    ? [[2, "1. Bo‘sh vaqt"], [5, "2. Mavzu rejasi"]]
    : [[1, "1. Kalendar"], [2, "2. O‘qituvchi vaqti"], [3, "3. Fan soatlari"], [4, "4. Jadval yaratish"], [5, "5. Mavzu rejasi"]];
  return (
    <div className="sticky top-[77px] z-30 border-b" style={{ background: "rgba(247,250,252,.96)", borderColor: palette.line }}>
      <div className="max-w-[1500px] mx-auto px-4 md:px-7 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {steps.map(([number, label]) => (
            <button key={number} onClick={() => setStep(number)} className="px-4 py-2.5 rounded-xl border text-sm font-black"
              style={step === number
                ? { background: palette.blue, color: "#fff", borderColor: palette.blue }
                : { background: "#fff", color: palette.ink, borderColor: palette.line }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClassDayBlockPanel({ token, apiBase, maktabId, setup, reload, setStep }) {
  const weekdays = Number(setup?.oquv_yili?.hafta_kunlari || 6);
  const classes = setup?.sinflar || [];
  const rules = setup?.sinf_kun_bloklari || setup?.avtomatik_qoidalar?.sinf_kun_bloklari || [];
  const dayOptions = useMemo(() => smartDays.slice(0, weekdays), [weekdays]);
  const dayName = useMemo(() => Object.fromEntries(dayOptions.map(([day, name]) => [Number(day), name])), [dayOptions]);
  const gradeOf = value => Number(String(value || "").match(/\d+/)?.[0] || 0);
  const availableGrades = useMemo(
    () => [...new Set(classes.map(c => gradeOf(c.sinf)).filter(Boolean))].sort((a, b) => a - b),
    [classes],
  );
  const sortedClasses = useMemo(
    () => [...classes].sort((a, b) => gradeOf(a.sinf) - gradeOf(b.sinf) || String(a.harf || "").localeCompare(String(b.harf || ""), "uz")),
    [classes],
  );

  const [scope, setScope] = useState("parallel");
  const [selectedGrades, setSelectedGrades] = useState([1, 2, 3, 4].filter(x => availableGrades.includes(x)));
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedDay, setSelectedDay] = useState(weekdays >= 6 ? 6 : Math.max(1, weekdays));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setSelectedGrades(prev => prev.filter(x => availableGrades.includes(Number(x))));
    setSelectedClasses(prev => prev.filter(id => classes.some(c => String(c.id) === String(id))));
    setSelectedDay(prev => Number(prev) <= weekdays ? Number(prev) : Math.max(1, weekdays));
  }, [setup, weekdays, availableGrades, classes]);

  const toggle = (value, list, setter) => setter(list.includes(value) ? list.filter(x => x !== value) : [...list, value]);
  const ruleLabel = rule => {
    if (rule.yorliq) return rule.yorliq;
    const target = rule.sinf_id ? `${rule.sinf || ""}-${rule.harf || ""}` : `Barcha ${rule.sinf_daraja}-sinflar`;
    return `${target} · ${dayName[Number(rule.hafta_kuni)] || rule.hafta_kuni}`;
  };

  const reportRows = useMemo(() => sortedClasses.map(classRow => {
    const classId = Number(classRow.id);
    const grade = gradeOf(classRow.sinf);
    const blocked = dayOptions.map(([day, name]) => {
      const exact = rules.find(rule => Number(rule.sinf_id) === classId && Number(rule.hafta_kuni) === Number(day));
      const parallel = rules.find(rule => rule.sinf_id == null && Number(rule.sinf_daraja) === grade && Number(rule.hafta_kuni) === Number(day));
      const source = exact || parallel;
      return source ? {
        day: Number(day), name, source: exact ? "Aniq sinf" : `${grade}-sinf parallel`,
        rule: source,
      } : null;
    }).filter(Boolean);
    return {
      id: classId,
      label: `${classRow.sinf}-${classRow.harf}`,
      grade,
      blocked,
    };
  }), [sortedClasses, rules, dayOptions]);

  const affectedClasses = reportRows.filter(row => row.blocked.length > 0);
  const blockedDayCount = new Set(affectedClasses.flatMap(row => row.blocked.map(item => item.day))).size;
  const dayReport = dayOptions.map(([day, name]) => ({
    day: Number(day),
    name,
    classes: affectedClasses.filter(row => row.blocked.some(item => item.day === Number(day))).map(row => row.label),
  }));

  const saveRule = async ({ regenerate = false, preset = false } = {}) => {
    const grades = preset ? [1, 2, 3, 4].filter(x => availableGrades.includes(x)) : selectedGrades.map(Number);
    const day = preset ? 6 : Number(selectedDay);
    const classIds = selectedClasses.map(Number);
    if ((preset || scope === "parallel") && !grades.length) return setMessage({ tone: "error", text: "Kamida bitta parallel sinfni tanlang." });
    if (!preset && scope === "sinf" && !classIds.length) return setMessage({ tone: "error", text: "Kamida bitta aniq sinfni tanlang." });
    if (!day || day > weekdays) return setMessage({ tone: "error", text: "Bitta hafta kunini tanlang." });
    setBusy(true); setMessage(null);
    try {
      const saved = await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/sinf_kun_bloklari?token=${encodeURIComponent(token)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maktab_id: maktabId,
          qamrov: preset ? "parallel" : scope,
          sinf_darajalari: preset ? grades : (scope === "parallel" ? grades : []),
          sinf_idlar: scope === "sinf" && !preset ? classIds : [],
          hafta_kunlari: [day],
          izoh: preset ? "1–4-sinflar uchun Shanba kuni dars yo‘q" : "Rahbariyat belgilagan sinf-kun qoidasi",
        }),
      });
      await reload();
      const conflict = Number(saved.zid_dars_soni || 0);
      if (!regenerate) {
        setMessage({
          tone: conflict ? "warning" : "success",
          text: conflict
            ? `Qoida saqlandi. Faol jadvalda ${conflict} ta zid dars bor; “Qoida + yangi draft”ni bosing.`
            : `${dayName[day]} uchun qoida saqlandi. Yana boshqa kun kerak bo‘lsa, uni alohida tanlab saqlang.`,
        });
        return;
      }
      try {
        const draft = await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/yaratish?token=${encodeURIComponent(token)}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maktab_id: maktabId, urinishlar_soni: 10 }),
        });
        setMessage({
          tone: draft.joylashtirilmadi ? "warning" : "success",
          text: `Qoida qo‘llandi va yangi draft yaratildi: ${draft.joylashtirildi} ta joylashdi, ${draft.joylashtirilmadi} ta joylashmadi. 4-bosqichda tekshiring.`,
        });
        await reload(); setStep?.(4);
      } catch (error) {
        setMessage({ tone: "warning", text: `Qoida saqlandi, lekin draft hali yaratilmagan: ${error.message}` });
      }
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const removeRule = async rule => {
    if (!window.confirm(`${ruleLabel(rule)} qoidasini olib tashlaysizmi?`)) return;
    setBusy(true);
    try {
      await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/sinf_kun_bloki?token=${encodeURIComponent(token)}&maktab_id=${maktabId}&blok_id=${rule.id}`, { method: "DELETE" });
      setMessage({ tone: "success", text: "Qoida olib tashlandi. Hisobot yangilandi; kerak bo‘lsa yangi draft yarating." });
      await reload();
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  return <Card className="p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-black" style={{ color: palette.ink }}>Sinfga dars qo‘yilmaydigan kun</h2>
        <p className="text-xs mt-1" style={{ color: palette.muted }}>Bir marta saqlashda faqat bitta kun tanlanadi. Yana boshqa kun kerak bo‘lsa, uni alohida qoida qilib saqlang.</p>
      </div>
      <button onClick={() => saveRule({ regenerate: true, preset: true })} disabled={busy || weekdays < 6}
        className="px-4 py-2.5 rounded-xl text-xs font-black"
        style={{ background: palette.redBg, color: palette.red, opacity: weekdays < 6 ? .55 : 1 }}>
        1–4-sinf → Shanba (1 bosish)
      </button>
    </div>

    {message && <div className="mt-4"><SmartNotice tone={message.tone}>{message.text}</SmartNotice></div>}

    <div className="grid xl:grid-cols-[.9fr_1.1fr] gap-4 mt-4">
      <div className="rounded-2xl p-4" style={{ background: palette.cream }}>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setScope("parallel")} className="px-3 py-2 rounded-xl text-xs font-black"
            style={scope === "parallel" ? { background: palette.blue, color: "#fff" } : { background: "#fff", color: palette.ink }}>Parallel sinflar</button>
          <button onClick={() => setScope("sinf")} className="px-3 py-2 rounded-xl text-xs font-black"
            style={scope === "sinf" ? { background: palette.blue, color: "#fff" } : { background: "#fff", color: palette.ink }}>Aniq sinflar</button>
        </div>

        {scope === "parallel" ? <>
          <div className="text-xs font-black mb-2">Qaysi parallel?</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {availableGrades.map(grade => <button key={grade} onClick={() => toggle(grade, selectedGrades, setSelectedGrades)}
              className="h-10 rounded-xl border text-xs font-black"
              style={selectedGrades.includes(grade)
                ? { background: palette.sky, color: palette.blue, borderColor: palette.blue }
                : { background: "#fff", color: palette.muted, borderColor: palette.line }}>{grade}-sinf</button>)}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={() => setSelectedGrades(availableGrades.filter(x => x <= 4))} className="px-3 py-2 rounded-xl text-xs font-black" style={{ background: "#fff", color: palette.blue }}>1–4 ni tanlash</button>
            <button onClick={() => setSelectedGrades(availableGrades)} className="px-3 py-2 rounded-xl text-xs font-black" style={{ background: "#fff", color: palette.blue }}>Barchasi</button>
            <button onClick={() => setSelectedGrades([])} className="px-3 py-2 rounded-xl text-xs font-black" style={{ background: "#fff", color: palette.muted }}>Tozalash</button>
          </div>
        </> : <>
          <div className="text-xs font-black mb-2">Qaysi aniq sinflar?</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-auto pr-1">
            {sortedClasses.map(c => {
              const id = String(c.id); const active = selectedClasses.includes(id);
              return <button key={c.id} onClick={() => toggle(id, selectedClasses, setSelectedClasses)}
                className="h-10 rounded-xl border text-xs font-black"
                style={active
                  ? { background: palette.sky, color: palette.blue, borderColor: palette.blue }
                  : { background: "#fff", color: palette.muted, borderColor: palette.line }}>{c.sinf}-{c.harf}</button>;
            })}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setSelectedClasses(sortedClasses.map(c => String(c.id)))} className="px-3 py-2 rounded-xl text-xs font-black" style={{ background: "#fff", color: palette.blue }}>Barchasi</button>
            <button onClick={() => setSelectedClasses([])} className="px-3 py-2 rounded-xl text-xs font-black" style={{ background: "#fff", color: palette.muted }}>Tozalash</button>
          </div>
        </>}

        <div className="mt-4 mb-2">
          <div className="text-xs font-black">Qaysi bitta kunda dars bo‘lmasin?</div>
          <div className="text-[11px] mt-1" style={{ color: palette.muted }}>Bu radio-tanlov: bir vaqtning o‘zida faqat bitta kun belgilanadi.</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {dayOptions.map(([day, name]) => <button key={day} onClick={() => setSelectedDay(Number(day))}
            className="h-10 rounded-xl border text-xs font-black flex items-center justify-center gap-2"
            style={Number(selectedDay) === Number(day)
              ? { background: palette.redBg, color: palette.red, borderColor: "#E9BABA" }
              : { background: "#fff", color: palette.muted, borderColor: palette.line }}>
            <span className="w-3.5 h-3.5 rounded-full border flex items-center justify-center" style={{ borderColor: Number(selectedDay) === Number(day) ? palette.red : palette.line }}>
              {Number(selectedDay) === Number(day) && <span className="w-2 h-2 rounded-full" style={{ background: palette.red }}/>} 
            </span>
            {name}
          </button>)}
        </div>

        <div className="grid sm:grid-cols-2 gap-2 mt-4">
          <button onClick={() => saveRule({ regenerate: false })} disabled={busy} className="py-3 rounded-xl text-sm font-black" style={{ background: palette.sky, color: palette.blue }}>{busy ? "Saqlanmoqda..." : "Faqat qoida saqlash"}</button>
          <button onClick={() => saveRule({ regenerate: true })} disabled={busy} className="py-3 rounded-xl text-sm font-black text-white" style={{ background: palette.teal }}>{busy ? "Hisoblanmoqda..." : "Qoida + yangi draft"}</button>
        </div>
      </div>

      <div className="space-y-4 min-w-0">
        <div className="rounded-2xl border p-4" style={{ borderColor: palette.line, background: "#fff" }}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-sm font-black" style={{ color: palette.ink }}>Qaysi sinf qaysi kuni dars olmaydi?</div>
              <div className="text-xs mt-1" style={{ color: palette.muted }}>Bu — qoida hisoboti. Haqiqiy haftalik darslar 4-bosqichdagi jadvalda ko‘rinadi.</div>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 rounded-full text-xs font-black" style={{ background: palette.sky, color: palette.blue }}>{affectedClasses.length} sinf</div>
              <div className="px-3 py-1.5 rounded-full text-xs font-black" style={{ background: palette.redBg, color: palette.red }}>{blockedDayCount} kun</div>
            </div>
          </div>

          <div className="overflow-auto max-h-[330px] rounded-xl border" style={{ borderColor: palette.line }}>
            <table className="min-w-[650px] w-full border-collapse bg-white">
              <thead className="sticky top-0 z-10" style={{ background: "#F5F8FA" }}>
                <tr>
                  <th className="text-left text-xs font-black p-2.5 border-b" style={{ borderColor: palette.line }}>Sinf</th>
                  {dayOptions.map(([day, name]) => <th key={day} className="text-center text-[11px] font-black p-2.5 border-b" style={{ borderColor: palette.line }}>{name}</th>)}
                </tr>
              </thead>
              <tbody>
                {reportRows.map(row => <tr key={row.id}>
                  <td className="text-xs font-black p-2.5 border-b" style={{ borderColor: palette.line, color: palette.ink }}>{row.label}</td>
                  {dayOptions.map(([day]) => {
                    const item = row.blocked.find(x => x.day === Number(day));
                    return <td key={day} className="text-center p-1.5 border-b" style={{ borderColor: palette.line }}>
                      {item
                        ? <span title={item.source} className="inline-flex px-2 py-1 rounded-lg text-[10px] font-black" style={{ background: palette.redBg, color: palette.red }}>DARS YO‘Q</span>
                        : <span className="text-xs" style={{ color: "#C0C8CE" }}>—</span>}
                    </td>;
                  })}
                </tr>)}
              </tbody>
            </table>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 mt-3">
            {dayReport.filter(item => item.classes.length).map(item => <div key={item.day} className="rounded-xl p-3" style={{ background: palette.cream }}>
              <div className="text-xs font-black" style={{ color: palette.ink }}>{item.name}</div>
              <div className="text-[11px] mt-1 leading-relaxed" style={{ color: palette.muted }}>{item.classes.join(", ")}</div>
            </div>)}
            {!affectedClasses.length && <div className="sm:col-span-2"><SmartNotice tone="info">Hali hech bir sinfga dars bo‘lmaydigan kun belgilanmagan.</SmartNotice></div>}
          </div>
        </div>

        <div className="rounded-2xl border p-4" style={{ borderColor: palette.line, background: "#fff" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-black" style={{ color: palette.ink }}>Faol qoidalarni boshqarish</div>
              <div className="text-xs mt-0.5" style={{ color: palette.muted }}>Har bir qator — bitta sinf/parallel va bitta kun. × orqali olib tashlang.</div>
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-black" style={{ background: palette.sky, color: palette.blue }}>{rules.length} ta</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 max-h-[260px] overflow-auto pr-1">
            {rules.map(rule => <div key={rule.id} className="rounded-2xl border p-3 flex items-center gap-2" style={{ borderColor: palette.line, background: palette.redBg }}>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black truncate" style={{ color: palette.ink }}>{ruleLabel(rule)}</div>
                <div className="text-[11px] mt-1" style={{ color: palette.muted }}>{rule.qamrov === "parallel" ? "Butun parallel" : "Aniq sinf"}</div>
              </div>
              <button onClick={() => removeRule(rule)} disabled={busy} className="w-8 h-8 rounded-xl font-black shrink-0" style={{ background: "#fff", color: palette.red }}>×</button>
            </div>)}
            {!rules.length && <div className="sm:col-span-2"><SmartNotice tone="info">Hali sinf-kun qoidasi yo‘q.</SmartNotice></div>}
          </div>
        </div>
      </div>
    </div>
  </Card>;
}
function CalendarStep({ token, apiBase, maktabId, setup, reload, setStep }) {
  const now = new Date();
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const draftKey = `samtm:aqlli-kalendar:${maktabId}`;
  const setupForm = () => ({
    nomi: setup?.oquv_yili?.nomi || `${startYear}/${startYear + 1}`,
    boshlanish: setup?.oquv_yili?.boshlanish || `${startYear}-09-02`,
    tugash: setup?.oquv_yili?.tugash || `${startYear + 1}-05-25`,
    hafta_kunlari: Number(setup?.oquv_yili?.hafta_kunlari || 6),
    choraklar: (setup?.choraklar?.length ? setup.choraklar : [1,2,3,4].map(emptyQuarter)).map(q => ({ ...q })),
    smenalar: (setup?.smenalar?.length ? setup.smenalar : [defaultShift(1), defaultShift(2)]).map(s => ({ ...s, boshlanish_vaqti: String(s.boshlanish_vaqti || "").slice(0,5) })),
  });
  const readDraft = () => {
    if (typeof window === "undefined") return null;
    try { const d = JSON.parse(window.localStorage.getItem(draftKey) || "null"); return d?.form ? d : null; } catch { return null; }
  };
  const initialDraft = readDraft();
  const [form, setForm] = useState(() => initialDraft?.dirty ? initialDraft.form : setupForm());
  const [dirty, setDirty] = useState(Boolean(initialDraft?.dirty));
  const [autoStatus, setAutoStatus] = useState(initialDraft?.dirty ? "Saqlanmagan o‘zgarish brauzerda saqlangan" : "");
  const [special, setSpecial] = useState({ sana: "", turi: "bayram", nomi: "", holat: "tasdiqlangan", izoh: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const editVersion = useRef(0);

  const changeForm = updater => {
    editVersion.current += 1;
    setForm(prev => typeof updater === "function" ? updater(prev) : updater);
    setDirty(true);
    setAutoStatus("Saqlanmagan o‘zgarish — avtomatik saqlanadi");
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (dirty) window.localStorage.setItem(draftKey, JSON.stringify({ form, dirty: true, updatedAt: Date.now() }));
    else window.localStorage.removeItem(draftKey);
  }, [form, dirty, draftKey]);

  useEffect(() => {
    if (!setup) return;
    const local = readDraft();
    if (local?.dirty) return;
    setForm(setupForm());
  }, [setup, maktabId]);

  const updateQuarter = (index, field, value) => changeForm(prev => ({ ...prev, choraklar: prev.choraklar.map((q,i) => i === index ? { ...q, [field]: value } : q) }));
  const updateShift = (index, field, value) => changeForm(prev => ({ ...prev, smenalar: prev.smenalar.map((s,i) => i === index ? { ...s, [field]: value } : s) }));
  const complete = value => Boolean(value.nomi && value.boshlanish && value.tugash && value.choraklar?.length === 4 && value.choraklar.every(q => q.boshlanish && q.tugash));
  const payload = value => ({
    maktab_id: maktabId, nomi: value.nomi, boshlanish: value.boshlanish,
    tugash: value.tugash, hafta_kunlari: Number(value.hafta_kunlari),
    choraklar: value.choraklar, smenalar: value.smenalar.map(s => ({
      ...s, smena: Number(s.smena), dars_soni: Number(s.dars_soni),
      dars_daqiqa: Number(s.dars_daqiqa), tanaffus_daqiqa: Number(s.tanaffus_daqiqa),
      katta_tanaffus_darsdan_keyin: Number(s.katta_tanaffus_darsdan_keyin),
      katta_tanaffus_daqiqa: Number(s.katta_tanaffus_daqiqa),
    })),
  });
  const persistCalendar = async value => smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/kalendar?token=${encodeURIComponent(token)}`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(value)),
  });
  const markSaved = () => {
    setDirty(false); setAutoStatus("Avtomatik saqlandi ✓");
    if (typeof window !== "undefined") window.localStorage.removeItem(draftKey);
  };

  useEffect(() => {
    if (!dirty) return;
    if (!complete(form)) { setAutoStatus("Sanalarni tugating — hozircha brauzerda saqlandi"); return; }
    const version = editVersion.current;
    const timer = window.setTimeout(async () => {
      setAutoStatus("Avtomatik saqlanmoqda...");
      try {
        await persistCalendar(form);
        if (version === editVersion.current) { markSaved(); await reload(); }
      } catch (error) {
        setAutoStatus("Serverga hali saqlanmadi; o‘zgarish brauzerda saqlanib turibdi");
      }
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [form, dirty, token, apiBase, maktabId]);

  const suggest = async () => {
    setSaving(true); setMessage(null);
    try {
      const data = await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/kalendar_tavsiya?token=${encodeURIComponent(token)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boshlanish: form.boshlanish, tugash: form.tugash, hafta_kunlari: Number(form.hafta_kunlari) }),
      });
      const nextForm = { ...form, choraklar: data.choraklar };
      editVersion.current += 1; setForm(nextForm); setDirty(true);
      await persistCalendar(nextForm); // avval choraklar bazaga saqlanadi, keyin reload qilinadi
      for (const day of data.maxsus_kunlar || []) {
        await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/maxsus_kun?token=${encodeURIComponent(token)}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ maktab_id: maktabId, ...day }),
        });
      }
      markSaved(); setMessage({ tone: "warning", text: `${data.ogohlantirish} Taxminiy sanalar bazaga ham saqlandi; xohlaganingizcha tahrirlashingiz mumkin.` });
      await reload();
    } catch (error) { setMessage({ tone: "error", text: error.message }); }
    finally { setSaving(false); }
  };

  const save = async () => {
    if (!complete(form)) return setMessage({ tone: "error", text: "O‘quv yili va barcha 4 chorak sanalarini kiriting." });
    setSaving(true); setMessage(null);
    try { await persistCalendar(form); markSaved(); setMessage({ tone: "success", text: "O‘quv kalendari va smena vaqtlari saqlandi." }); await reload(); }
    catch (error) { setMessage({ tone: "error", text: error.message }); }
    finally { setSaving(false); }
  };

  const saveSpecial = async () => {
    if (!special.sana) return setMessage({ tone: "error", text: "Maxsus kun sanasini tanlang." });
    setSaving(true); setMessage(null);
    try {
      const data = await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/maxsus_kun?token=${encodeURIComponent(token)}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ maktab_id: maktabId, ...special }),
      });
      const suffix = data.qayta_taqsimlandi ? ` ${data.qayta_taqsimlandi} ta mavzu taqvimi avtomatik qayta taqsimlandi.` : "";
      setMessage({ tone: "success", text: `Kun saqlandi.${suffix}` });
      setSpecial({ sana: "", turi: "bayram", nomi: "", holat: "tasdiqlangan", izoh: "" }); await reload();
    } catch (error) { setMessage({ tone: "error", text: error.message }); }
    finally { setSaving(false); }
  };
  const removeSpecial = async day => { if (!window.confirm(`${day.sana} kungi belgini olib tashlaysizmi?`)) return; try { await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/maxsus_kun?token=${encodeURIComponent(token)}&maktab_id=${maktabId}&sana=${day.sana}`, { method: "DELETE" }); await reload(); } catch (error) { setMessage({ tone: "error", text: error.message }); } };
  const dayStyle = day => ["dam","bayram","tatil","qoshimcha_dam"].includes(day.turi) ? { background: palette.redBg, color: palette.red } : day.holat === "taxminiy" ? { background: palette.amberBg, color: palette.amber } : { background: palette.greenBg, color: palette.green };

  return <div className="space-y-4">
    {message && <SmartNotice tone={message.tone}>{message.text}</SmartNotice>}
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{background:dirty?palette.amberBg:palette.greenBg,color:dirty?palette.amber:palette.green}}><div className="text-sm font-bold">{autoStatus || "Barcha o‘zgarishlar saqlangan"}</div><button onClick={save} disabled={saving} className="px-4 py-2 rounded-xl text-xs font-black text-white" style={{background:palette.blue}}>{saving?"Saqlanmoqda...":"Hozir saqlash"}</button></div>
    <div className="grid xl:grid-cols-[1.2fr_.8fr] gap-4">
      <Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3 mb-5"><div><h2 className="text-xl font-black" style={{color:palette.ink}}>O‘quv yili va 4 chorak</h2><p className="text-xs mt-1" style={{color:palette.muted}}>Taxminiy sanalar sariq, administrator tasdiqlagan sanalar yashil. Tahrirlar avtomatik saqlanadi.</p></div><button onClick={suggest} disabled={saving} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:palette.amberBg,color:palette.amber}}>Taxminiy sanalarni yaratish va saqlash</button></div>
        <div className="grid sm:grid-cols-4 gap-3 mb-4"><label className="text-xs font-bold" style={{color:palette.ink}}>O‘quv yili<input value={form.nomi} onChange={e=>changeForm({...form,nomi:e.target.value})} className="w-full mt-1.5 p-2.5 rounded-xl border" style={{borderColor:palette.line}}/></label><label className="text-xs font-bold" style={{color:palette.ink}}>Boshlanish<input type="date" value={form.boshlanish} onChange={e=>changeForm({...form,boshlanish:e.target.value})} className="w-full mt-1.5 p-2.5 rounded-xl border" style={{borderColor:palette.line}}/></label><label className="text-xs font-bold" style={{color:palette.ink}}>Tugash<input type="date" value={form.tugash} onChange={e=>changeForm({...form,tugash:e.target.value})} className="w-full mt-1.5 p-2.5 rounded-xl border" style={{borderColor:palette.line}}/></label><label className="text-xs font-bold" style={{color:palette.ink}}>O‘qish haftasi<select value={form.hafta_kunlari} onChange={e=>changeForm({...form,hafta_kunlari:Number(e.target.value)})} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white" style={{borderColor:palette.line}}><option value={5}>5 kun</option><option value={6}>6 kun</option></select></label></div>
        <div className="space-y-2">{form.choraklar.map((q,index)=><div key={q.chorak} className="grid grid-cols-[70px_1fr_1fr_130px] gap-2 items-end rounded-2xl p-3" style={{background:palette.cream}}><div className="text-sm font-black pb-2" style={{color:palette.ink}}>{q.chorak}-chorak</div><label className="text-[11px]" style={{color:palette.muted}}>Boshlanish<input type="date" value={q.boshlanish||""} onChange={e=>updateQuarter(index,"boshlanish",e.target.value)} className="w-full mt-1 p-2 rounded-xl border bg-white" style={{borderColor:palette.line}}/></label><label className="text-[11px]" style={{color:palette.muted}}>Tugash<input type="date" value={q.tugash||""} onChange={e=>updateQuarter(index,"tugash",e.target.value)} className="w-full mt-1 p-2 rounded-xl border bg-white" style={{borderColor:palette.line}}/></label><label className="text-[11px]" style={{color:palette.muted}}>Holat<select value={q.holat||"taxminiy"} onChange={e=>updateQuarter(index,"holat",e.target.value)} className="w-full mt-1 p-2 rounded-xl border bg-white" style={{borderColor:palette.line}}><option value="taxminiy">Taxminiy</option><option value="tasdiqlangan">Tasdiqlangan</option></select></label></div>)}</div>
      </Card>
      <Card className="p-5"><h2 className="text-xl font-black mb-1" style={{color:palette.ink}}>Smena va dars vaqtlari</h2><p className="text-xs mb-4" style={{color:palette.muted}}>Har smenaning vaqti generator va o‘qituvchi bandligini aniq hisoblaydi.</p><div className="space-y-3">{form.smenalar.map((s,index)=><div key={s.smena} className="rounded-2xl p-3" style={{background:palette.cream}}><div className="font-black text-sm mb-2" style={{color:palette.ink}}>{s.smena}-smena</div><div className="grid grid-cols-2 gap-2">{[["boshlanish_vaqti","Boshlanish","time"],["dars_soni","Dars soni","number"],["dars_daqiqa","Dars daqiqasi","number"],["tanaffus_daqiqa","Tanaffus","number"],["katta_tanaffus_darsdan_keyin","Katta tanaffusdan oldin","number"],["katta_tanaffus_daqiqa","Katta tanaffus","number"]].map(([key,label,type])=><label key={key} className="text-[11px]" style={{color:palette.muted}}>{label}<input type={type} value={s[key]||""} onChange={e=>updateShift(index,key,e.target.value)} className="w-full mt-1 p-2 rounded-xl border bg-white" style={{borderColor:palette.line}}/></label>)}</div></div>)}</div></Card>
    </div>
    <div className="grid xl:grid-cols-[.75fr_1.25fr] gap-4"><Card className="p-5"><h2 className="text-xl font-black mb-4" style={{color:palette.ink}}>Maxsus kun qo‘shish</h2><div className="space-y-2.5"><input type="date" value={special.sana} onChange={e=>setSpecial({...special,sana:e.target.value})} className="w-full p-2.5 rounded-xl border" style={{borderColor:palette.line}}/><select value={special.turi} onChange={e=>setSpecial({...special,turi:e.target.value})} className="w-full p-2.5 rounded-xl border bg-white" style={{borderColor:palette.line}}><option value="bayram">Bayram / dam</option><option value="tatil">Ta’til</option><option value="qoshimcha_dam">Qo‘shimcha dam</option><option value="qoshimcha_oqish">Qo‘shimcha o‘qish kuni</option><option value="oqish">O‘qish kuni</option></select><input value={special.nomi} onChange={e=>setSpecial({...special,nomi:e.target.value})} placeholder="Masalan: Bayram yoki ko‘chirilgan o‘qish kuni" className="w-full p-2.5 rounded-xl border" style={{borderColor:palette.line}}/><select value={special.holat} onChange={e=>setSpecial({...special,holat:e.target.value})} className="w-full p-2.5 rounded-xl border bg-white" style={{borderColor:palette.line}}><option value="taxminiy">Taxminiy</option><option value="tasdiqlangan">Tasdiqlangan</option></select><button onClick={saveSpecial} disabled={saving} className="w-full py-3 rounded-xl text-sm font-black text-white" style={{background:palette.teal}}>{saving?"Saqlanmoqda...":"Kunni belgilash"}</button></div></Card>
      <Card className="p-5"><div className="flex items-center justify-between gap-3 mb-4"><div><h2 className="text-xl font-black" style={{color:palette.ink}}>Belgilangan kunlar</h2><p className="text-xs mt-1" style={{color:palette.muted}}>Qizil — o‘qish yo‘q. Sariq — taxminiy. Yashil — tasdiqlangan.</p></div><button onClick={save} disabled={saving} className="px-5 py-3 rounded-xl text-sm font-black text-white" style={{background:palette.blue}}>Hammasini saqlash</button></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[360px] overflow-auto pr-1">{(setup?.maxsus_kunlar||[]).map(day=><div key={day.id||day.sana} className="rounded-2xl p-3 flex gap-2 items-start" style={dayStyle(day)}><div className="flex-1"><div className="text-sm font-black">{day.sana}</div><div className="text-xs mt-1">{day.nomi||day.turi} · {day.holat}</div></div><button onClick={()=>removeSpecial(day)} className="text-xs font-black">×</button></div>)}{!(setup?.maxsus_kunlar||[]).length&&<div className="text-sm" style={{color:palette.muted}}>Hali maxsus kun qo‘shilmagan.</div>}</div></Card></div>
    <ClassDayBlockPanel token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} reload={reload} setStep={setStep}/>
  </div>;
}

function TeacherTimeGrid({ setup, selectedTeacher, setSelectedTeacher, teacherOnly, token, apiBase, maktabId, reload }) {
  const weekdays = Number(setup?.oquv_yili?.hafta_kunlari || 6);
  const [shift, setShift] = useState(1); const [grid, setGrid] = useState({}); const [methodDays, setMethodDays] = useState({});
  const [rules, setRules] = useState({ kunlik_max:6,ketma_ket_max:4,okno_max:1,afzal_smena:0,eng_erta_dars:1,eng_kech_dars:12 });
  const [message,setMessage]=useState(null); const [saving,setSaving]=useState(false);
  const [bulkSubject,setBulkSubject]=useState(""); const [bulkSelected,setBulkSelected]=useState([]); const [bulkPreset,setBulkPreset]=useState("metod");
  const [bulkMethodDay,setBulkMethodDay]=useState(1); const [bulkHard,setBulkHard]=useState(false); const [bulkMode,setBulkMode]=useState("ustiga_qoshish");
  const [methodSuggestions,setMethodSuggestions]=useState([]);
  const shiftRow=(setup?.smenalar||[]).find(s=>Number(s.smena)===Number(shift)); const periodCount=Number(shiftRow?.dars_soni||7);
  const allTeachers=setup?.oqituvchilar||[];
  const splitSubjects=t=>Array.isArray(t?.fanlar_royxati)?t.fanlar_royxati:String(t?.fanlari||"").replaceAll("\\n","\n").split(/[;\n,]+/).map(x=>x.trim()).filter(Boolean);
  const normalizeSubject=value=>String(value||"").trim().toLocaleLowerCase("uz");
  const teachers=useMemo(()=>allTeachers.filter(t=>teacherOnly||t.dars_beruvchi||String(t.lavozim||"")==="fan_oqituvchisi"),[allTeachers,teacherOnly]);
  const subjectOptions=useMemo(()=>[...new Set(teachers.flatMap(splitSubjects))].sort((a,b)=>a.localeCompare(b,"uz")),[teachers]);
  const visibleTeachers=useMemo(()=>teachers.filter(t=>!bulkSubject||splitSubjects(t).some(f=>normalizeSubject(f)===normalizeSubject(bulkSubject))),[teachers,bulkSubject]);
  const selectedTeacherRow=useMemo(()=>teachers.find(t=>String(t.user_id)===String(selectedTeacher)),[teachers,selectedTeacher]);
  const teacherMethodDays=t=>(setup?.oqituvchi_vaqtlari||[]).filter(x=>String(x.user_id)===String(t?.user_id)&&x.turi==="metod_kuni").map(x=>({day:Number(x.hafta_kuni),name:smartDays.find(([d])=>Number(d)===Number(x.hafta_kuni))?.[1]||String(x.hafta_kuni),hard:Boolean(x.qattiq)}));
  const teacherSubjects=t=>splitSubjects(t).join(", ")||"Shablonda fan topilmadi";
  const teacherClasses=t=>(Array.isArray(t?.sinflar_royxati)?t.sinflar_royxati:[]).join(", ")||"Sinf birikmasi yo‘q";

  useEffect(()=>{ if(!selectedTeacher)return; const newGrid={},methods={}; (setup?.oqituvchi_vaqtlari||[]).filter(x=>String(x.user_id)===String(selectedTeacher)).forEach(item=>{if(item.turi==="metod_kuni")methods[item.hafta_kuni]=item.qattiq?"hard":"soft";else newGrid[`${item.hafta_kuni}-${item.smena}-${item.dars_raqami}`]=item.turi==="band"?(item.qattiq?"band":"softBand"):"preferred";}); const found=(setup?.oqituvchi_qoidalari||[]).find(x=>String(x.user_id)===String(selectedTeacher)); setGrid(newGrid);setMethodDays(methods);setRules(found?{kunlik_max:Number(found.kunlik_max),ketma_ket_max:Number(found.ketma_ket_max),okno_max:Number(found.okno_max),afzal_smena:Number(found.afzal_smena),eng_erta_dars:Number(found.eng_erta_dars),eng_kech_dars:Number(found.eng_kech_dars)}:{kunlik_max:6,ketma_ket_max:4,okno_max:1,afzal_smena:0,eng_erta_dars:1,eng_kech_dars:12});},[selectedTeacher,setup]);
  const cycle=(day,period)=>{const key=`${day}-${shift}-${period}`,current=grid[key],next=!current?"band":current==="band"?"preferred":undefined;setGrid(prev=>{const c={...prev};if(next)c[key]=next;else delete c[key];return c;});};
  const methodCycle=day=>setMethodDays(prev=>{const current=prev[day],next=!current?"hard":current==="hard"?"soft":undefined,c={...prev};if(next)c[day]=next;else delete c[day];return c;});
  const cellStyle=value=>value==="band"?{background:palette.redBg,color:palette.red,borderColor:"#F2CACA"}:value==="preferred"?{background:palette.amberBg,color:palette.amber,borderColor:"#F0D7A7"}:{background:"#fff",color:palette.green,borderColor:palette.line};
  const currentTimes=()=>{const times=[];Object.entries(grid).forEach(([key,value])=>{const[day,sm,period]=key.split("-").map(Number);times.push({hafta_kuni:day,smena:sm,dars_raqami:period,turi:value==="preferred"?"afzal_bosh":"band",qattiq:value!=="preferred"});});Object.entries(methodDays).forEach(([day,value])=>times.push({hafta_kuni:Number(day),smena:0,dars_raqami:0,turi:"metod_kuni",qattiq:value==="hard"}));return times;};
  const save=async()=>{if(!selectedTeacher)return setMessage({tone:"error",text:"O‘qituvchini tanlang."});setSaving(true);setMessage(null);try{await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/oqituvchi_vaqti?token=${encodeURIComponent(token)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,user_id:Number(selectedTeacher),qoidalar:rules,vaqtlar:currentTimes()})});setMessage({tone:"success",text:"O‘qituvchi vaqti va yuklama qoidalari saqlandi."});await reload();}catch(error){setMessage({tone:"error",text:error.message});}finally{setSaving(false);}};

  const toggleBulk=id=>setBulkSelected(prev=>prev.includes(String(id))?prev.filter(x=>x!==String(id)):[...prev,String(id)]);
  const selectVisible=()=>setBulkSelected(prev=>[...new Set([...prev,...visibleTeachers.map(t=>String(t.user_id))])]);
  const bulkTimes=()=>{if(bulkPreset==="copy")return currentTimes();if(bulkPreset==="metod")return[{hafta_kuni:Number(bulkMethodDay),smena:0,dars_raqami:0,turi:"metod_kuni",qattiq:bulkHard,izoh:"Rahbariyat ommaviy qo‘lladi"}];const times=[];if(bulkPreset==="first_shift"){const count=Number((setup?.smenalar||[]).find(s=>Number(s.smena)===2)?.dars_soni||7);for(let d=1;d<=weekdays;d++)for(let p=1;p<=count;p++)times.push({hafta_kuni:d,smena:2,dars_raqami:p,turi:"band",qattiq:true});}if(bulkPreset==="second_shift"){const count=Number((setup?.smenalar||[]).find(s=>Number(s.smena)===1)?.dars_soni||7);for(let d=1;d<=weekdays;d++)for(let p=1;p<=count;p++)times.push({hafta_kuni:d,smena:1,dars_raqami:p,turi:"band",qattiq:true});}return times;};
  const applyBulk=async()=>{if(!bulkSelected.length)return setMessage({tone:"error",text:"Kamida bitta o‘qituvchini tanlang."});setSaving(true);try{const bulkRules={...rules,afzal_smena:bulkPreset==="first_shift"?1:bulkPreset==="second_shift"?2:rules.afzal_smena};const effectiveMode=bulkPreset==="free"?"almashtirish":bulkMode;await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/oqituvchi_vaqti_bulk?token=${encodeURIComponent(token)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,user_ids:bulkSelected.map(Number),qoidalar:bulkPreset==="metod"?null:bulkRules,vaqtlar:bulkTimes(),rejim:effectiveMode})});setMessage({tone:"success",text:`${bulkSelected.length} ta o‘qituvchiga sozlama birga qo‘llandi.`});await reload();}catch(e){setMessage({tone:"error",text:e.message});}finally{setSaving(false);}};
  const suggestMethods=async saveIt=>{const targetIds=bulkSelected.length?bulkSelected:visibleTeachers.map(t=>String(t.user_id));if(!targetIds.length)return setMessage({tone:"error",text:"Tavsiya uchun o‘qituvchi topilmadi."});if(saveIt&&!bulkSelected.length&&!window.confirm(`Ko‘rinayotgan ${targetIds.length} ta o‘qituvchiga taxminiy kasbiy rivojlanish kunlari saqlansinmi?`))return;setSaving(true);try{const d=await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/metod_kun_tavsiya?token=${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,user_ids:targetIds.map(Number),saqlash:saveIt,qattiq:false,almashtirish:false})});setMethodSuggestions(d.tavsiyalar||[]);setMessage({tone:saveIt?"success":"warning",text:saveIt?`${d.saqlandi||0} ta taxminiy kasbiy rivojlanish kuni saqlandi. ${d.ogohlantirish}`:d.ogohlantirish});if(saveIt)await reload();}catch(e){setMessage({tone:"error",text:e.message});}finally{setSaving(false);}};
  const clearMethodDays=async onlySelectedDay=>{const targetIds=bulkSelected.length?bulkSelected:visibleTeachers.map(t=>String(t.user_id));if(!targetIds.length)return setMessage({tone:"error",text:"Metod kunini o‘chirish uchun o‘qituvchi topilmadi."});const dayName=smartDays.find(([d])=>Number(d)===Number(bulkMethodDay))?.[1]||"tanlangan kun";const scope=bulkSelected.length?`tanlangan ${targetIds.length} ta`:`ko‘rinayotgan ${targetIds.length} ta`;const text=onlySelectedDay?`${scope} o‘qituvchidan faqat ${dayName} metod kuni olib tashlansinmi? Boshqa band/bo‘sh vaqtlar saqlanadi.`:`${scope} o‘qituvchidan BARCHA metod/kasbiy kunlar olib tashlansinmi? Boshqa band/bo‘sh vaqtlar saqlanadi.`;if(!window.confirm(text))return;setSaving(true);try{const d=await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/metod_kunlarini_tozalash?token=${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,user_ids:targetIds.map(Number),hafta_kuni:onlySelectedDay?Number(bulkMethodDay):null})});setMessage({tone:"success",text:`${d["o'chirilgan_metod_kuni"]||0} ta metod kuni olib tashlandi. O‘qituvchilarning boshqa vaqt sozlamalari o‘zgarmadi.`});await reload();}catch(e){setMessage({tone:"error",text:e.message});}finally{setSaving(false);}};

  return <div className="space-y-4">{message&&<SmartNotice tone={message.tone}>{message.text}</SmartNotice>}
    {!teacherOnly&&<Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black" style={{color:palette.ink}}>Ko‘p o‘qituvchiga birga qo‘llash</h2><p className="text-xs mt-1" style={{color:palette.muted}}>Fan bo‘yicha tanlang, umumiy smena/bo‘sh vaqt yoki metod kunini bir marta qo‘llang.</p></div><div className="px-3 py-2 rounded-xl text-xs font-bold" style={{background:palette.amberBg,color:palette.amber}}>Kasbiy rivojlanish kuni mavjud; aniq hafta kuni hudud/tayanch maktab jadvali bilan tasdiqlanadi.</div></div><div className="grid lg:grid-cols-[1fr_1fr_1fr_1fr] gap-2 mt-4"><select value={bulkSubject} onChange={e=>setBulkSubject(e.target.value)} className="p-2.5 rounded-xl border bg-white"><option value="">Barcha fanlar</option>{subjectOptions.map(f=><option key={f}>{f}</option>)}</select><select value={bulkPreset} onChange={e=>setBulkPreset(e.target.value)} className="p-2.5 rounded-xl border bg-white"><option value="metod">Faqat metod/kasbiy kun</option><option value="first_shift">Faqat 1-smena</option><option value="second_shift">Faqat 2-smena</option><option value="copy">Pastdagi joriy jadvalni nusxalash</option><option value="free">Barcha vaqt bo‘sh</option></select><select value={bulkMethodDay} onChange={e=>setBulkMethodDay(Number(e.target.value))} className="p-2.5 rounded-xl border bg-white">{smartDays.slice(0,weekdays).map(([d,n])=><option key={d} value={d}>{n}</option>)}</select><select value={bulkMode} onChange={e=>setBulkMode(e.target.value)} className="p-2.5 rounded-xl border bg-white"><option value="ustiga_qoshish">Mavjudiga qo‘shish</option><option value="almashtirish">To‘liq almashtirish</option></select></div><label className="mt-3 flex items-center gap-2 text-xs"><input type="checkbox" checked={bulkHard} onChange={e=>setBulkHard(e.target.checked)}/> Metod kunini qattiq cheklov qilish</label><div className="flex flex-wrap gap-2 mt-3"><button onClick={selectVisible} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:palette.sky,color:palette.blue}}>Ko‘rinayotganlarni tanlash</button><button onClick={()=>setBulkSelected([])} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:palette.cream,color:palette.ink}}>Faqat tanlash belgilarini tozalash</button><button onClick={()=>clearMethodDays(true)} disabled={saving} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:palette.redBg,color:palette.red}}>Faqat {smartDays.find(([d])=>Number(d)===Number(bulkMethodDay))?.[1]} metodini o‘chirish</button><button onClick={()=>clearMethodDays(false)} disabled={saving} className="px-3 py-2 rounded-xl text-xs font-black text-white" style={{background:palette.red}}>Barcha metod kunini olib tashlash</button><button onClick={()=>suggestMethods(false)} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:palette.amberBg,color:palette.amber}}>Taxminiy kasbiy kunlarni ko‘rish</button><button onClick={()=>suggestMethods(true)} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:palette.greenBg,color:palette.green}}>Taxminiy tavsiyalarni saqlash</button><button onClick={applyBulk} disabled={saving} className="px-4 py-2 rounded-xl text-xs font-black text-white" style={{background:palette.teal}}>Tanlanganlarga qo‘llash ({bulkSelected.length})</button></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mt-4 max-h-52 overflow-auto">{visibleTeachers.map(t=>{const methods=teacherMethodDays(t);return <label key={t.user_id} className="rounded-xl border p-3 flex gap-2 items-start text-xs" style={{borderColor:bulkSelected.includes(String(t.user_id))?palette.blue:palette.line,background:bulkSelected.includes(String(t.user_id))?palette.sky:"#fff"}}><input type="checkbox" checked={bulkSelected.includes(String(t.user_id))} onChange={()=>toggleBulk(t.user_id)}/><span className="min-w-0"><b className="text-sm">{t.full_name}</b><br/><span className="font-bold" style={{color:splitSubjects(t).length?palette.teal:palette.red}}>{teacherSubjects(t)}</span><br/><span style={{color:palette.muted}}>{teacherClasses(t)}</span><br/><span style={{color:methods.length?palette.amber:palette.muted}}>Metod: {methods.length?methods.map(m=>`${m.name}${m.hard?" (qattiq)":" (yumshoq)"}`).join(", "):"belgilanmagan"}</span></span></label>})}</div>{methodSuggestions.length>0&&<div className="mt-4 rounded-2xl p-3" style={{background:palette.cream}}><div className="text-xs font-black mb-2">Taxminiy tavsiyalar</div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-40 overflow-auto">{methodSuggestions.map(x=><div key={x.user_id} className="text-xs rounded-xl p-2" style={{background:"#fff"}}><b>{x.full_name}</b> — <b style={{color:palette.amber}}>{x.kun_nomi}</b><br/><span style={{color:palette.teal}}>{(x.fanlari||[]).join(", ")||x.fan_guruhi}</span><br/><span style={{color:palette.muted}}>{(x.sinflari||[]).join(", ")||"Sinf birikmasi yo‘q"}</span></div>)}</div></div>}</Card>}
    {!teacherOnly&&<Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-2 mb-3"><div><h3 className="text-lg font-black" style={{color:palette.ink}}>Shablondagi fan va metod kuni hisoboti</h3><p className="text-xs mt-1" style={{color:palette.muted}}>Fanlar XODIMLAR va DARS_BIRIKMALARI varag‘idan birlashtirildi. Qaysi o‘qituvchi qaysi fanga va qaysi kunga tegishli ekani shu yerda ko‘rinadi.</p></div><div className="text-xs font-black px-3 py-2 rounded-xl" style={{background:palette.sky,color:palette.blue}}>{teachers.length} ta dars beruvchi</div></div><div className="overflow-auto max-h-[420px]"><table className="min-w-[900px] w-full text-xs"><thead><tr className="text-left" style={{color:palette.muted}}><th className="p-2">O‘qituvchi</th><th>Shablondagi fanlari</th><th>Biriktirilgan sinflar</th><th>Haftalik</th><th>Metod/kasbiy kun</th><th>Manba</th></tr></thead><tbody>{teachers.map(t=>{const methods=teacherMethodDays(t);return <tr key={t.user_id} className="border-t" style={{borderColor:palette.line}}><td className="p-2 font-black" style={{color:palette.ink}}>{t.full_name}</td><td style={{color:splitSubjects(t).length?palette.teal:palette.red}}>{teacherSubjects(t)}</td><td>{teacherClasses(t)}</td><td>{t.haftalik_dars_soati??"—"} soat</td><td style={{color:methods.length?palette.amber:palette.muted}}>{methods.length?methods.map(m=>`${m.name}${m.hard?" · qattiq":" · yumshoq"}`).join(", "):"Belgilanmagan"}</td><td>{(t.fan_manbalari||[]).join(", ")||"—"}</td></tr>})}</tbody></table></div>{teachers.some(t=>!splitSubjects(t).length)&&<SmartNotice tone="warning">Qizil ko‘ringan xodimlarda importdan fan topilmadi. Ularning XODIMLAR yoki DARS_BIRIKMALARI qatorini tekshiring.</SmartNotice>}</Card>}
    <div className="grid xl:grid-cols-[330px_1fr] gap-4"><Card className="p-5"><h2 className="text-xl font-black" style={{color:palette.ink}}>O‘qituvchi qoidalari</h2>{!teacherOnly&&<label className="block text-xs font-bold mt-4" style={{color:palette.ink}}>O‘qituvchi<select value={selectedTeacher||""} onChange={e=>setSelectedTeacher(e.target.value)} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white"><option value="">Tanlang</option>{teachers.map(t=><option key={t.user_id} value={t.user_id}>{t.full_name} — {teacherSubjects(t)}</option>)}</select></label>}{selectedTeacherRow&&<div className="mt-3 rounded-2xl p-3 text-xs" style={{background:palette.cream}}><div className="font-black text-sm" style={{color:palette.ink}}>{selectedTeacherRow.full_name}</div><div className="mt-1"><b>Fan:</b> <span style={{color:splitSubjects(selectedTeacherRow).length?palette.teal:palette.red}}>{teacherSubjects(selectedTeacherRow)}</span></div><div className="mt-1"><b>Sinflar:</b> {teacherClasses(selectedTeacherRow)}</div><div className="mt-1"><b>Haftalik yuklama:</b> {selectedTeacherRow.haftalik_reja_jami??selectedTeacherRow.haftalik_dars_soati??"—"} soat{selectedTeacherRow.sinf_soati_soni?` (${selectedTeacherRow.haftalik_dars_soati??0} fan darsi + ${selectedTeacherRow.sinf_soati_soni} sinf soati)`:""}</div><div className="mt-1"><b>Metod kuni:</b> {teacherMethodDays(selectedTeacherRow).length?teacherMethodDays(selectedTeacherRow).map(m=>`${m.name}${m.hard?" (qattiq)":" (yumshoq)"}`).join(", "):"belgilanmagan"}</div></div>}<label className="block text-xs font-bold mt-3">Ko‘rilayotgan smena<select value={shift} onChange={e=>setShift(Number(e.target.value))} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white"><option value={1}>1-smena</option><option value={2}>2-smena</option></select></label><div className="grid grid-cols-2 gap-2 mt-3">{[["kunlik_max","Kunlik max"],["ketma_ket_max","Ketma-ket max"],["okno_max","Okno max"],["eng_erta_dars","Eng erta"],["eng_kech_dars","Eng kech"]].map(([key,label])=><label key={key} className="text-[11px]" style={{color:palette.muted}}>{label}<input type="number" min="0" max="12" value={rules[key]} onChange={e=>setRules({...rules,[key]:Number(e.target.value)})} className="w-full mt-1 p-2 rounded-xl border"/></label>)}<label className="text-[11px]">Afzal smena<select value={rules.afzal_smena} onChange={e=>setRules({...rules,afzal_smena:Number(e.target.value)})} className="w-full mt-1 p-2 rounded-xl border bg-white"><option value={0}>Farqi yo‘q</option><option value={1}>1-smena</option><option value={2}>2-smena</option></select></label></div><div className="mt-4 space-y-2 text-xs" style={{color:palette.muted}}><div>🟥 Qattiq band</div><div>🟨 Iloj bo‘lsa bo‘sh</div><div>🟩 Bo‘sh</div><div>Metod: bir marta qattiq, ikki marta yumshoq.</div></div><button onClick={save} disabled={saving||!selectedTeacher} className="w-full mt-5 py-3 rounded-xl text-sm font-black text-white" style={{background:palette.blue}}>{saving?"Saqlanmoqda...":"Vaqtlarni saqlash"}</button></Card><Card className="p-4 md:p-5 overflow-hidden"><div className="overflow-auto"><table className="min-w-[780px] w-full border-separate border-spacing-1.5"><thead><tr><th className="text-left text-xs p-2">Kun</th><th className="text-xs p-2">Metod</th>{Array.from({length:periodCount},(_,i)=><th key={i} className="text-xs p-2">{i+1}-dars</th>)}</tr></thead><tbody>{smartDays.slice(0,weekdays).map(([day,name])=><tr key={day}><td className="text-xs font-black p-2">{name}</td><td><button onClick={()=>methodCycle(day)} className="w-full h-10 rounded-xl border text-[11px] font-black" style={methodDays[day]==="hard"?{background:palette.redBg,color:palette.red}:methodDays[day]==="soft"?{background:palette.amberBg,color:palette.amber}:{background:"#fff",color:palette.muted}}>{methodDays[day]==="hard"?"QATTIQ":methodDays[day]==="soft"?"YUMSHOQ":"—"}</button></td>{Array.from({length:periodCount},(_,i)=>{const key=`${day}-${shift}-${i+1}`,value=grid[key];return <td key={i}><button onClick={()=>cycle(day,i+1)} className="w-full h-10 rounded-xl border font-black" style={cellStyle(value)}>{value==="band"?"×":value==="preferred"?"!":"✓"}</button></td>})}</tr>)}</tbody></table></div></Card></div>
  </div>;
}


function ClassHourPanel({ token, apiBase, maktabId, setup, reload, setStep }) {
  const classes=setup?.sinflar||[];const rules=setup?.sinf_soatlari||[];const weekdays=Number(setup?.oquv_yili?.hafta_kunlari||6);const maxPeriod=Math.max(1,...(setup?.smenalar||[]).map(s=>Number(s.dars_soni||0)));
  const [mode,setMode]=useState("parallel");const [grades,setGrades]=useState([]);const [classIds,setClassIds]=useState([]);const [day,setDay]=useState(5);const [period,setPeriod]=useState(Math.min(6,maxPeriod));const [message,setMessage]=useState(null);const [saving,setSaving]=useState(false);
  const availableGrades=useMemo(()=>[...new Set(classes.map(c=>Number(String(c.sinf||"").replace(/\D/g,""))).filter(Boolean))].sort((a,b)=>a-b),[classes]);
  useEffect(()=>{if(day>weekdays)setDay(weekdays);if(period>maxPeriod)setPeriod(maxPeriod);},[weekdays,maxPeriod]);
  const toggle=(list,setter,value)=>setter(list.includes(String(value))?list.filter(x=>x!==String(value)):[...list,String(value)]);
  const selectedCount=mode==="parallel"?classes.filter(c=>grades.includes(String(Number(String(c.sinf||"").replace(/\D/g,""))))).length:classIds.length;
  const saveRule=async createDraft=>{if(!selectedCount)return setMessage({tone:"error",text:"Kamida bitta parallel yoki aniq sinfni tanlang."});setSaving(true);setMessage(null);try{const d=await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/sinf_soati_bulk?token=${encodeURIComponent(token)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,qamrov:mode,sinf_darajalari:grades.map(Number),sinf_idlar:classIds.map(Number),hafta_kuni:Number(day),dars_raqami:Number(period)})});const skipped=d.otkazib_yuborildi||[];let text=`${d.saqlandi||0} ta sinfga sinf soati saqlandi. U sinfning o‘z smenasida ${smartDays.find(([x])=>Number(x)===Number(day))?.[1]}, ${period}-darsga va sinf rahbariga biriktiriladi.`;if(skipped.length)text+=` ${skipped.length} ta sinf o‘tkazib yuborildi: ${skipped.slice(0,4).map(x=>`${x.sinf} — ${x.sabab}`).join("; ")}`;setMessage({tone:skipped.length?"warning":"success",text});await reload();if(createDraft){try{const draft=await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/yaratish?token=${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,urinishlar_soni:10})});setMessage({tone:draft.joylashtirilmadi?"warning":"success",text:`Sinf soati qoidasi saqlandi va yangi draft yaratildi: ${draft.joylashtirildi}/${draft.jami_soat} soat joylashdi.`});setStep?.(4);}catch(e){setMessage({tone:"warning",text:`Sinf soati qoidasi saqlandi, lekin yangi draft yaratilmadi: ${e.message}`});}}}catch(e){setMessage({tone:"error",text:e.message});}finally{setSaving(false);}};
  const remove=async row=>{if(!window.confirm(`${row.sinf}-${row.harf} sinf soati qoidasi olib tashlansinmi?`))return;try{await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/sinf_soati?token=${encodeURIComponent(token)}&maktab_id=${maktabId}&sinf_id=${row.sinf_id}`,{method:"DELETE"});setMessage({tone:"success",text:`${row.sinf}-${row.harf} sinf soati qoidasi olib tashlandi. Faol jadval o‘zgarmaydi; keyingi draftda qo‘llanmaydi.`});await reload();}catch(e){setMessage({tone:"error",text:e.message});}};
  return <Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black" style={{color:palette.ink}}>Sinf soatini avtomatik joylash</h2><p className="text-xs mt-1" style={{color:palette.muted}}>Kun va dars raqamini bir marta belgilang. Har sinf o‘z smenasida, aynan shu vaqtda <b>SINF SOATI</b> bo‘lib chiqadi va sinf rahbariga biriktiriladi.</p></div><div className="px-3 py-2 rounded-xl text-xs font-black" style={{background:palette.greenBg,color:palette.green}}>{rules.length} ta faol qoida</div></div>{message&&<div className="mt-3"><SmartNotice tone={message.tone}>{message.text}</SmartNotice></div>}<div className="grid xl:grid-cols-[1.1fr_.9fr] gap-4 mt-4"><div className="rounded-2xl p-4" style={{background:palette.cream}}><div className="flex gap-2 mb-3"><button onClick={()=>setMode("parallel")} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:mode==="parallel"?palette.blue:"#fff",color:mode==="parallel"?"#fff":palette.ink}}>Parallel sinflar</button><button onClick={()=>setMode("aniq")} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:mode==="aniq"?palette.blue:"#fff",color:mode==="aniq"?"#fff":palette.ink}}>Aniq sinflar</button></div>{mode==="parallel"?<><div className="text-xs font-black mb-2">Qaysi parallel?</div><div className="grid grid-cols-4 sm:grid-cols-6 gap-2">{availableGrades.map(g=><button key={g} onClick={()=>toggle(grades,setGrades,g)} className="py-2 rounded-xl border text-xs font-black" style={{background:grades.includes(String(g))?palette.sky:"#fff",borderColor:grades.includes(String(g))?palette.blue:palette.line,color:grades.includes(String(g))?palette.blue:palette.muted}}>{g}-sinf</button>)}</div><div className="flex gap-2 mt-2"><button onClick={()=>setGrades(availableGrades.map(String))} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:"#fff",color:palette.blue}}>Barchasi</button><button onClick={()=>setGrades([])} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:"#fff",color:palette.muted}}>Tozalash</button></div></>:<><div className="text-xs font-black mb-2">Qaysi sinflar?</div><div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-40 overflow-auto">{classes.map(c=><button key={c.id} onClick={()=>toggle(classIds,setClassIds,c.id)} className="py-2 rounded-xl border text-xs font-black" style={{background:classIds.includes(String(c.id))?palette.sky:"#fff",borderColor:classIds.includes(String(c.id))?palette.blue:palette.line,color:classIds.includes(String(c.id))?palette.blue:palette.muted}}>{c.sinf}-{c.harf}</button>)}</div><div className="flex gap-2 mt-2"><button onClick={()=>setClassIds(classes.map(c=>String(c.id)))} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:"#fff",color:palette.blue}}>Barchasi</button><button onClick={()=>setClassIds([])} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:"#fff",color:palette.muted}}>Tozalash</button></div></>}<div className="text-xs font-black mt-4 mb-2">Qaysi kuni?</div><div className="grid grid-cols-3 gap-2">{smartDays.slice(0,weekdays).map(([d,n])=><button key={d} onClick={()=>setDay(Number(d))} className="py-2 rounded-xl border text-xs font-black" style={{background:Number(day)===Number(d)?palette.sky:"#fff",borderColor:Number(day)===Number(d)?palette.blue:palette.line,color:Number(day)===Number(d)?palette.blue:palette.muted}}>{n}</button>)}</div><label className="block text-xs font-black mt-4">Qaysi dars?<select value={period} onChange={e=>setPeriod(Number(e.target.value))} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white">{Array.from({length:maxPeriod},(_,i)=><option key={i+1} value={i+1}>{i+1}-dars</option>)}</select></label><div className="text-[11px] mt-2" style={{color:palette.muted}}>Smena alohida tanlanmaydi: har bir sinfning o‘z smenasi avtomatik olinadi.</div><div className="grid sm:grid-cols-2 gap-2 mt-4"><button onClick={()=>saveRule(false)} disabled={saving} className="py-3 rounded-xl text-sm font-black" style={{background:palette.sky,color:palette.blue}}>Faqat qoidani saqlash ({selectedCount})</button><button onClick={()=>saveRule(true)} disabled={saving} className="py-3 rounded-xl text-sm font-black text-white" style={{background:palette.teal}}>Qoida + yangi draft</button></div></div><div><div className="text-sm font-black mb-2" style={{color:palette.ink}}>Faol sinf soati qoidalari</div><div className="space-y-2 max-h-[470px] overflow-auto">{rules.map(r=><div key={r.id} className="rounded-2xl border p-3 flex items-center gap-3" style={{borderColor:palette.line,background:"#fff"}}><div className="flex-1 min-w-0"><div className="text-sm font-black" style={{color:palette.ink}}>{r.sinf}-{r.harf} · {smartDays.find(([d])=>Number(d)===Number(r.hafta_kuni))?.[1]} · {r.dars_raqami}-dars</div><div className="text-xs mt-1" style={{color:r.rahbar_ismi?palette.teal:palette.red}}>{r.smena}-smena · Sinf rahbari: {r.rahbar_ismi||"belgilanmagan"}</div></div><button onClick={()=>remove(r)} className="w-8 h-8 rounded-xl font-black" style={{background:palette.redBg,color:palette.red}}>×</button></div>)}{!rules.length&&<SmartNotice tone="info">Sinf soati qoidasi hali yo‘q. Sinflar, kun va darsni tanlab saqlang.</SmartNotice>}</div></div></div></Card>;
}

function LoadsStep({ token, apiBase, maktabId, setup, reload, setStep }) {
  const [classId,setClassId]=useState(String(setup?.sinflar?.[0]?.id||""));
  const [rows,setRows]=useState([]); const [groupRows,setGroupRows]=useState([]); const [newSubject,setNewSubject]=useState(""); const [roomName,setRoomName]=useState(""); const [message,setMessage]=useState(null); const [saving,setSaving]=useState(false);
  const assignments=useMemo(()=> (setup?.birikmalar||[]).filter(x=>String(x.sinf_id)===String(classId)),[setup,classId]);
  useEffect(()=>{
    if(!classId){setRows([]);setGroupRows([]);return;}
    const existing=(setup?.fan_soatlari||[]).filter(x=>String(x.sinf_id)===String(classId));
    const subjects=[...new Set([...existing.map(x=>x.fan_nomi),...assignments.map(x=>x.fan_nomi)])];
    setRows(subjects.map(subject=>{const old=existing.find(x=>String(x.fan_nomi).toLowerCase()===String(subject).toLowerCase());return old?{...old}:{fan_nomi:subject,haftalik_soat:0,kunlik_max:1,ketma_ket_mumkin:false,afzal_oxirgi_dars:5,asosiy_oqituvchi_user_id:null,xona_id:null,nazorat_soni:0,nazoratdan_keyin_tahlil:true,mustahkamlash_soni:0,ogirlik:2}}));
    const settings=(setup?.guruh_sozlamalari||[]).filter(x=>String(x.sinf_id)===String(classId));
    const nonWhole=assignments.filter(x=>String(x.guruh_kaliti||"whole")!=="whole");
    const unique=[]; const seen=new Set();
    nonWhole.forEach(a=>{const key=`${String(a.fan_nomi).toLowerCase()}|${a.guruh_kaliti}`;if(seen.has(key))return;seen.add(key);const old=settings.find(x=>String(x.fan_nomi).toLowerCase()===String(a.fan_nomi).toLowerCase()&&String(x.guruh_kaliti)===String(a.guruh_kaliti));unique.push({fan_nomi:a.fan_nomi,guruh_kaliti:a.guruh_kaliti,oqituvchi_user_id:old?.oqituvchi_user_id||a.user_id||null,xona_id:old?.xona_id||null});});
    setGroupRows(unique);
  },[classId,setup,assignments]);
  const update=(index,field,value)=>setRows(prev=>prev.map((r,i)=>i===index?{...r,[field]:value}:r));
  const addSubject=()=>{if(!newSubject||rows.some(r=>r.fan_nomi===newSubject))return;setRows([...rows,{fan_nomi:newSubject,haftalik_soat:0,kunlik_max:1,ketma_ket_mumkin:false,afzal_oxirgi_dars:5,asosiy_oqituvchi_user_id:null,xona_id:null,nazorat_soni:0,nazoratdan_keyin_tahlil:true,mustahkamlash_soni:0,ogirlik:2}]);setNewSubject("");};
  const save=async()=>{if(!classId)return;setSaving(true);setMessage(null);try{await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/fan_soatlari?token=${encodeURIComponent(token)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,sinf_id:Number(classId),fanlar:rows.map(r=>({...r,haftalik_soat:Number(r.haftalik_soat),kunlik_max:Number(r.kunlik_max),afzal_oxirgi_dars:Number(r.afzal_oxirgi_dars),asosiy_oqituvchi_user_id:r.asosiy_oqituvchi_user_id?Number(r.asosiy_oqituvchi_user_id):null,xona_id:r.xona_id?Number(r.xona_id):null,nazorat_soni:Number(r.nazorat_soni),mustahkamlash_soni:Number(r.mustahkamlash_soni),ogirlik:Number(r.ogirlik)}))})});await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/guruh_sozlamalari?token=${encodeURIComponent(token)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,sinf_id:Number(classId),guruhlar:groupRows.map(g=>({...g,oqituvchi_user_id:g.oqituvchi_user_id?Number(g.oqituvchi_user_id):null,xona_id:g.xona_id?Number(g.xona_id):null}))})});setMessage({tone:"success",text:"Haftalik fan soatlari va parallel guruh xonalari saqlandi."});await reload();}catch(e){setMessage({tone:"error",text:e.message});}finally{setSaving(false);}};
  const teacherOptions=subject=>{const ids=assignments.filter(x=>String(x.fan_nomi).toLowerCase()===String(subject).toLowerCase()).map(x=>String(x.user_id));return (setup?.oqituvchilar||[]).filter(t=>ids.includes(String(t.user_id)));};
  const addRoom=async()=>{if(!roomName.trim())return;try{await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/xona?token=${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,nomi:roomName.trim(),turi:"maxsus"})});setRoomName("");setMessage({tone:"success",text:"Xona qo‘shildi."});await reload();}catch(e){setMessage({tone:"error",text:e.message});}};
  return <div className="space-y-4">{message&&<SmartNotice tone={message.tone}>{message.text}</SmartNotice>}<ClassHourPanel token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} reload={reload} setStep={setStep}/><Card className="p-5"><div className="flex flex-wrap items-end gap-3 mb-3"><label className="text-xs font-bold min-w-[220px]" style={{color:palette.ink}}>Sinf<select value={classId} onChange={e=>setClassId(e.target.value)} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white" style={{borderColor:palette.line}}>{(setup?.sinflar||[]).map(c=><option key={c.id} value={c.id}>{c.sinf}-{c.harf} · {c.smena}-smena</option>)}</select></label><label className="text-xs font-bold min-w-[250px] flex-1" style={{color:palette.ink}}>Fan qo‘shish<select value={newSubject} onChange={e=>setNewSubject(e.target.value)} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white" style={{borderColor:palette.line}}><option value="">Fan tanlang</option>{(setup?.fanlar||[]).filter(f=>!rows.some(r=>r.fan_nomi===f)).map(f=><option key={f}>{f}</option>)}</select></label><button onClick={addSubject} className="px-4 py-2.5 rounded-xl text-sm font-black" style={{background:palette.sky,color:palette.blue}}>+ Fan</button><button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-black text-white" style={{background:palette.blue}}>{saving?"...":"Saqlash"}</button></div><div className="flex flex-wrap gap-2 items-end mb-5"><label className="text-xs font-bold flex-1 min-w-[230px]" style={{color:palette.ink}}>Maxsus xona qo‘shish<input value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="Masalan: Informatika xonasi" className="w-full mt-1.5 p-2.5 rounded-xl border" style={{borderColor:palette.line}}/></label><button onClick={addRoom} className="px-4 py-2.5 rounded-xl text-sm font-black" style={{background:palette.cream,color:palette.ink}}>+ Xona</button></div>
  <div className="overflow-auto"><table className="min-w-[1250px] w-full text-xs"><thead><tr className="text-left" style={{color:palette.muted}}><th className="p-2">Fan</th><th>Haftalik</th><th>Kunlik max</th><th>Ketma-ket</th><th>Oxirgi afzal</th><th>Asosiy o‘qituvchi</th><th>Xona</th><th>Nazorat</th><th>Tahlil</th><th>Mustahkamlash</th><th>Og‘irlik</th><th></th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.fan_nomi} className="border-t" style={{borderColor:palette.line}}><td className="p-2 font-black" style={{color:palette.ink}}>{r.fan_nomi}</td><td><input type="number" min="0" max="20" value={r.haftalik_soat} onChange={e=>update(i,"haftalik_soat",e.target.value)} className="w-20 p-2 rounded-lg border"/></td><td><input type="number" min="1" max="4" value={r.kunlik_max} onChange={e=>update(i,"kunlik_max",e.target.value)} className="w-20 p-2 rounded-lg border"/></td><td><input type="checkbox" checked={Boolean(r.ketma_ket_mumkin)} onChange={e=>update(i,"ketma_ket_mumkin",e.target.checked)}/></td><td><input type="number" min="1" max="12" value={r.afzal_oxirgi_dars} onChange={e=>update(i,"afzal_oxirgi_dars",e.target.value)} className="w-20 p-2 rounded-lg border"/></td><td><select value={r.asosiy_oqituvchi_user_id||""} onChange={e=>update(i,"asosiy_oqituvchi_user_id",e.target.value)} className="w-52 p-2 rounded-lg border bg-white"><option value="">Avto / guruhlar</option>{teacherOptions(r.fan_nomi).map(t=><option key={t.user_id} value={t.user_id}>{t.full_name}</option>)}</select></td><td><select value={r.xona_id||""} onChange={e=>update(i,"xona_id",e.target.value)} className="w-40 p-2 rounded-lg border bg-white"><option value="">Sinf xonasi</option>{(setup?.xonalar||[]).map(x=><option key={x.id} value={x.id}>{x.nomi}</option>)}</select></td><td><input type="number" min="0" max="10" value={r.nazorat_soni} onChange={e=>update(i,"nazorat_soni",e.target.value)} className="w-20 p-2 rounded-lg border"/></td><td><input type="checkbox" checked={Boolean(r.nazoratdan_keyin_tahlil)} onChange={e=>update(i,"nazoratdan_keyin_tahlil",e.target.checked)}/></td><td><input type="number" min="0" max="20" value={r.mustahkamlash_soni} onChange={e=>update(i,"mustahkamlash_soni",e.target.value)} className="w-20 p-2 rounded-lg border"/></td><td><select value={r.ogirlik} onChange={e=>update(i,"ogirlik",e.target.value)} className="w-24 p-2 rounded-lg border bg-white"><option value={1}>Yengil</option><option value={2}>O‘rta</option><option value={3}>Og‘ir</option></select></td><td><button onClick={()=>setRows(rows.filter((_,x)=>x!==i))} className="text-red-700 font-black">O‘chir</button></td></tr>)}</tbody></table></div>{!rows.length&&<SmartNotice tone="warning">Bu sinfga fan–o‘qituvchi birikmasi topilmadi. Fan qo‘shib, haftalik soatini kiriting.</SmartNotice>}
  {groupRows.length>0&&<div className="mt-6"><h3 className="text-lg font-black" style={{color:palette.ink}}>Parallel guruhlar</h3><p className="text-xs mt-1 mb-3" style={{color:palette.muted}}>Ingliz tili 1/2-guruh yoki texnologiya o‘g‘il/qiz guruhlari bir vaqtda turishi uchun har guruh o‘qituvchisi va xonasini ko‘rsating.</p><div className="grid md:grid-cols-2 gap-2">{groupRows.map((g,i)=><div key={`${g.fan_nomi}-${g.guruh_kaliti}`} className="rounded-2xl p-3 grid grid-cols-[1fr_1fr] gap-2" style={{background:palette.cream}}><div className="col-span-2 text-sm font-black" style={{color:palette.ink}}>{g.fan_nomi} · {g.guruh_kaliti}</div><select value={g.oqituvchi_user_id||""} onChange={e=>setGroupRows(prev=>prev.map((x,n)=>n===i?{...x,oqituvchi_user_id:e.target.value}:x))} className="p-2 rounded-xl border bg-white"><option value="">O‘qituvchi</option>{(setup?.oqituvchilar||[]).map(t=><option key={t.user_id} value={t.user_id}>{t.full_name}</option>)}</select><select value={g.xona_id||""} onChange={e=>setGroupRows(prev=>prev.map((x,n)=>n===i?{...x,xona_id:e.target.value}:x))} className="p-2 rounded-xl border bg-white"><option value="">Xona ko‘rsatilmagan</option>{(setup?.xonalar||[]).map(x=><option key={x.id} value={x.id}>{x.nomi}</option>)}</select></div>)}</div></div>}
  </Card></div>;
}

function ScheduleGrid({ detail, setup, selectedClass, setSelectedClass }) {
  const classRow = (setup?.sinflar || []).find(c => String(c.id) === String(selectedClass));
  const slots = (detail?.slotlar || []).filter(s => String(s.sinf_id) === String(selectedClass));
  const gradeNumber = Number(String(classRow?.sinf || '').match(/\d+/)?.[0] || 0);
  const rules = setup?.sinf_kun_bloklari || setup?.avtomatik_qoidalar?.sinf_kun_bloklari || [];
  const blockedDays = new Set(rules.filter(rule =>
    (rule.sinf_id != null && String(rule.sinf_id) === String(classRow?.id)) ||
    (rule.sinf_id == null && Number(rule.sinf_daraja) === gradeNumber)
  ).map(rule => Number(rule.hafta_kuni)));
  const shift = Number(classRow?.smena || 1);
  const shiftRow = (setup?.smenalar || []).find(s => Number(s.smena) === shift);
  const periods = Number(shiftRow?.dars_soni || 7);
  const weekdays = Number(setup?.oquv_yili?.hafta_kunlari || 6);

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-black" style={{ color: palette.ink }}>Jadval ko‘rinishi</h3>
          <p className="text-xs" style={{ color: palette.muted }}>Parallel guruhlar bitta katak ichida alohida ko‘rinadi. Qizil “blok” kunlari 1-bosqichdagi sinf-kun qoidalaridan olinadi.</p>
        </div>
        <select value={selectedClass || ''} onChange={e => setSelectedClass(e.target.value)} className="p-2.5 rounded-xl border bg-white" style={{ borderColor: palette.line }}>
          {(setup?.sinflar || []).map(c => <option key={c.id} value={c.id}>{c.sinf}-{c.harf}</option>)}
        </select>
      </div>
      <div className="overflow-auto">
        <table className="min-w-[900px] w-full border-separate border-spacing-1.5">
          <thead><tr><th className="text-xs p-2">Dars</th>{smartDays.slice(0, weekdays).map(([day, name]) => {
            const blocked = blockedDays.has(day);
            return <th key={day} className="text-xs p-2" style={blocked ? { color: palette.red, background: palette.redBg } : {}}>{name}{blocked ? ' · blok' : ''}</th>;
          })}</tr></thead>
          <tbody>{Array.from({ length: periods }, (_, periodIndex) => (
            <tr key={periodIndex}>
              <td className="text-xs font-black text-center p-2">{periodIndex + 1}</td>
              {smartDays.slice(0, weekdays).map(([day]) => {
                const blocked = blockedDays.has(day);
                const cell = blocked ? [] : slots.filter(slot => Number(slot.hafta_kuni) === day && Number(slot.dars_raqami) === periodIndex + 1);
                return <td key={day} className="align-top"><div className="min-h-[76px] rounded-xl border p-2" style={{ borderColor: blocked ? '#F0CACA' : palette.line, background: blocked ? palette.redBg : cell.length ? palette.sky : '#fff' }}>
                  {blocked ? <div className="min-h-[58px] flex items-center justify-center text-center text-[10px] font-black" style={{ color: palette.red }}>Bu sinf uchun dars yo‘q</div> : cell.map(slot => <div key={slot.id} className="mb-1 last:mb-0"><div className="text-xs font-black" style={{ color: palette.ink }}>{slot.fan_nomi}</div><div className="text-[10px]" style={{ color: palette.muted }}>{slot.oqituvchi_ismi || 'O‘qituvchi yo‘q'}{slot.guruh_kaliti !== 'whole' ? ` · ${slot.guruh_kaliti}` : ''}</div></div>)}
                </div></td>;
              })}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
  );
}

function GenerateStep({ token, apiBase, maktabId, setup, reload }) {
  const [generating,setGenerating]=useState(false);const [message,setMessage]=useState(null);const [detail,setDetail]=useState(null);const [selectedClass,setSelectedClass]=useState(String(setup?.sinflar?.[0]?.id||""));const [force,setForce]=useState(false);
  const latestDraft=(setup?.urinishlar||[]).find(r=>r.holat==="draft");const active=(setup?.urinishlar||[]).find(r=>r.holat==="tasdiqlangan");
  const loadRun=async id=>{if(!id)return;try{setDetail(await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/urinish?token=${encodeURIComponent(token)}&urinish_id=${id}`));}catch(e){setMessage({tone:"error",text:e.message});}};
  useEffect(()=>{if(latestDraft)loadRun(latestDraft.id);else if(active)loadRun(active.id);},[latestDraft?.id,active?.id]);
  const generate=async()=>{setGenerating(true);setMessage(null);try{const data=await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/yaratish?token=${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,urinishlar_soni:10})});setMessage({tone:data.joylashtirilmadi?"warning":"success",text:`Draft yaratildi: ${data.joylashtirildi}/${data.jami_soat} soat, sifat ${data.sifat}/100.`});await reload();await loadRun(data.urinish_id);}catch(e){setMessage({tone:"error",text:e.message});}finally{setGenerating(false);}};
  const approve=async()=>{const id=detail?.urinish?.id;if(!id)return;try{const data=await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/tasdiqlash?token=${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({urinish_id:id,majburan:force})});setMessage({tone:"success",text:`Jadval tasdiqlandi. ${data.qayta_taqsimlandi||0} ta mavzu taqvimi yangilandi.`});await reload();await loadRun(id);}catch(e){setMessage({tone:"error",text:e.message});}};
  const d=detail?.urinish?.diagnostika||detail?.urinish?.diagnostika_json||{};const problems=d.muammolar||[];const warnings=d.ogohlantirishlar||[];
  return <div className="space-y-4">{message&&<SmartNotice tone={message.tone}>{message.text}</SmartNotice>}<SmartNotice tone="info">Qattiq sinf-kun qoidalari 1-bosqichdan boshqariladi. Tanlangan parallel yoki aniq sinfga bloklangan kunlarda generator dars qo‘ymaydi; draft tasdig‘i, dars ko‘chirish va mavzu sanasi ham shu qoidani buzmaydi.</SmartNotice><div className="grid lg:grid-cols-[.8fr_1.2fr] gap-4"><Card className="p-5"><h2 className="text-xl font-black" style={{color:palette.ink}}>Draft → tekshirish → tasdiqlash</h2><p className="text-xs mt-1" style={{color:palette.muted}}>Yangi jadval eski faol jadvalni darhol o‘chirmaydi. Avval draft yaratiladi.</p><div className="grid grid-cols-3 gap-2 mt-4"><Stat value={detail?.urinish?.sifat??"—"} label="sifat /100" tone="blue"/><Stat value={detail?.urinish?.joylashtirildi??0} label="joylashtirildi" tone="green"/><Stat value={detail?.urinish?.joylashtirilmadi??0} label="joylashmadi" tone={detail?.urinish?.joylashtirilmadi?"red":"green"}/></div><button onClick={generate} disabled={generating} className="w-full mt-4 py-3 rounded-xl text-sm font-black text-white" style={{background:palette.blue}}>{generating?"Hisoblanmoqda...":"Yangi draft yaratish"}</button>{detail?.urinish?.holat==="draft"&&<><label className="flex gap-2 items-start text-xs mt-4" style={{color:palette.muted}}><input type="checkbox" checked={force} onChange={e=>setForce(e.target.checked)}/>Joylashtirilmagan darslar bo‘lsa ham majburan tasdiqlash (tavsiya etilmaydi)</label><button onClick={approve} className="w-full mt-3 py-3 rounded-xl text-sm font-black text-white" style={{background:palette.green}}>Draftni tasdiqlash</button></>}</Card><Card className="p-5"><h3 className="font-black mb-3" style={{color:palette.ink}}>Aniq diagnostika</h3><div className="space-y-2 max-h-[370px] overflow-auto">{problems.map((p,i)=><div key={i} className="rounded-xl p-3" style={{background:palette.redBg}}><div className="text-sm font-black" style={{color:palette.ink}}>{p.sinf} · {p.fan}</div><div className="text-xs mt-1" style={{color:palette.red}}>{p.sabab}</div></div>)}{warnings.map((w,i)=><div key={`w-${i}`} className="rounded-xl p-3 text-xs" style={{background:palette.amberBg,color:palette.amber}}>{w}</div>)}{!problems.length&&!warnings.length&&<SmartNotice tone="success">Qattiq konflikt topilmadi.</SmartNotice>}</div></Card></div>{detail&&<ScheduleGrid detail={detail} setup={setup} selectedClass={selectedClass} setSelectedClass={setSelectedClass}/>}</div>;
}

function TopicCalendarRow({ row, token, apiBase, maktabId, onSaved }) {
  const [title,setTitle]=useState(row.mavzu);const [dateValue,setDateValue]=useState(row.sana);const [saving,setSaving]=useState(false);const [error,setError]=useState("");
  const save=async()=>{setSaving(true);setError("");try{await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/mavzu_taqvimi?token=${encodeURIComponent(token)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,taqvim_id:row.id,mavzu:title,sana:dateValue})});await onSaved();}catch(e){setError(e.message);}finally{setSaving(false);}};
  const unlock=async()=>{try{await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/mavzu_taqvimi/qulfni_och?token=${encodeURIComponent(token)}&maktab_id=${maktabId}&taqvim_id=${row.id}`,{method:"POST"});await onSaved();}catch(e){setError(e.message);}};
  return <div className="rounded-2xl border p-3" style={{borderColor:row.qulflangan?"#E8C779":palette.line,background:row.qulflangan?"#FFF9E8":"#fff"}}><div className="grid md:grid-cols-[145px_1fr_auto] gap-2 items-center"><input type="date" value={dateValue||""} onChange={e=>setDateValue(e.target.value)} className="p-2 rounded-xl border"/><input value={title} onChange={e=>setTitle(e.target.value)} className="p-2 rounded-xl border"/><div className="flex gap-1"><button onClick={save} disabled={saving} className="px-3 py-2 rounded-xl text-xs font-black text-white" style={{background:palette.blue}}>{saving?"...":"Saqlash"}</button>{row.qulflangan&&<button onClick={unlock} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:palette.cream,color:palette.amber}}>Avtoga qaytarish</button>}</div></div><div className="text-[11px] mt-1" style={{color:palette.muted}}>{row.turi} · {row.dars_raqami}-dars {row.qulflangan?"· o‘qituvchi qulflagan":"· avtomatik"}</div>{error&&<div className="text-xs mt-1" style={{color:palette.red}}>{error}</div>}</div>;
}

function TopicsStep({ token, apiBase, maktabId, setup, teacherOnly }) {
  const currentUser=String(setup?.joriy_user_id||"");const allowedAssignments=teacherOnly?(setup?.birikmalar||[]).filter(x=>String(x.user_id)===currentUser):(setup?.birikmalar||[]);
  const allowedClasses=teacherOnly?(setup?.sinflar||[]).filter(c=>allowedAssignments.some(a=>String(a.sinf_id)===String(c.id))):(setup?.sinflar||[]);
  const [classId,setClassId]=useState(String(allowedClasses?.[0]?.id||""));const subjects=useMemo(()=>[...new Set([...(setup?.fan_soatlari||[]).filter(x=>String(x.sinf_id)===String(classId)).map(x=>x.fan_nomi),...allowedAssignments.filter(x=>String(x.sinf_id)===String(classId)).map(x=>x.fan_nomi)])],[setup,classId,allowedAssignments]);
  const [fan,setFan]=useState(subjects[0]||"");const [quarter,setQuarter]=useState(1);const [plan,setPlan]=useState([]);const [calendar,setCalendar]=useState([]);const [message,setMessage]=useState(null);const [loading,setLoading]=useState(false);
  useEffect(()=>{if(subjects.length&&!subjects.includes(fan))setFan(subjects[0]);},[subjects]);
  const load=async()=>{if(!classId||!fan)return;setLoading(true);try{const d=await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/mavzu_reja?token=${encodeURIComponent(token)}&maktab_id=${maktabId}&sinf_id=${classId}&fan=${encodeURIComponent(fan)}&chorak=${quarter}`);setPlan((d.mavzular||[]).map(x=>({...x})));setCalendar(d.taqvim||[]);}catch(e){setMessage({tone:"error",text:e.message});}finally{setLoading(false);}};
  useEffect(()=>{load();},[classId,fan,quarter]);
  const importDts=async()=>{try{const d=await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/mavzu_reja/dts_import?token=${encodeURIComponent(token)}&maktab_id=${maktabId}&sinf_id=${classId}&fan=${encodeURIComponent(fan)}&chorak=${quarter}`,{method:"POST"});setPlan(d.mavzular||[]);setMessage({tone:"success",text:`DTSdan ${d.mavzular?.length||0} ta mavzu olindi. Tekshirib saqlang.`});}catch(e){setMessage({tone:"error",text:e.message});}};
  const update=(i,f,v)=>setPlan(prev=>prev.map((x,n)=>n===i?{...x,[f]:v}:x));const move=(i,delta)=>{const target=i+delta;if(target<0||target>=plan.length)return;const copy=[...plan];[copy[i],copy[target]]=[copy[target],copy[i]];setPlan(copy);};
  const save=async()=>{try{await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/mavzu_reja?token=${encodeURIComponent(token)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,sinf_id:Number(classId),fan_nomi:fan,chorak:Number(quarter),mavzular:plan.map(x=>({mavzu:x.mavzu,soat:Number(x.soat||1),turi:x.turi||"mavzu",topic_code:x.topic_code||null,manba:x.manba||"qolda"}))})});setMessage({tone:"success",text:"Mavzu rejasi saqlandi."});await load();}catch(e){setMessage({tone:"error",text:e.message});}};
  const distribute=async()=>{try{const d=await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/mavzularni_taqsimlash?token=${encodeURIComponent(token)}&maktab_id=${maktabId}&sinf_id=${classId}&fan=${encodeURIComponent(fan)}&chorak=${quarter}`,{method:"POST"});const warning=(d.ogohlantirishlar||[]).join(" ");setMessage({tone:warning?"warning":"success",text:`${d.taqsimlandi||0} ta dars sanaga joylashtirildi. ${warning}`});await load();}catch(e){setMessage({tone:"error",text:e.message});}};
  return <div className="space-y-4">{message&&<SmartNotice tone={message.tone}>{message.text}</SmartNotice>}<Card className="p-5"><div className="grid md:grid-cols-[1fr_1.4fr_120px_auto_auto] gap-2 items-end"><label className="text-xs font-bold" style={{color:palette.ink}}>Sinf<select value={classId} onChange={e=>setClassId(e.target.value)} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white" style={{borderColor:palette.line}}>{allowedClasses.map(c=><option key={c.id} value={c.id}>{c.sinf}-{c.harf}</option>)}</select></label><label className="text-xs font-bold" style={{color:palette.ink}}>Fan<select value={fan} onChange={e=>setFan(e.target.value)} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white" style={{borderColor:palette.line}}>{subjects.map(f=><option key={f}>{f}</option>)}</select></label><label className="text-xs font-bold" style={{color:palette.ink}}>Chorak<select value={quarter} onChange={e=>setQuarter(Number(e.target.value))} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white" style={{borderColor:palette.line}}>{[1,2,3,4].map(q=><option key={q} value={q}>{q}</option>)}</select></label><button onClick={importDts} className="px-4 py-2.5 rounded-xl text-sm font-black" style={{background:palette.sky,color:palette.blue}}>DTSdan olish</button><button onClick={distribute} className="px-4 py-2.5 rounded-xl text-sm font-black text-white" style={{background:palette.teal}}>Sanalarga joylash</button></div></Card><div className="grid xl:grid-cols-[1fr_1fr] gap-4"><Card className="p-5"><div className="flex items-center justify-between mb-3"><div><h3 className="text-lg font-black" style={{color:palette.ink}}>Chorak mavzulari</h3><p className="text-xs" style={{color:palette.muted}}>O‘qituvchi nom, soat va tartibni o‘zgartira oladi.</p></div><div className="flex gap-2"><button onClick={()=>setPlan([...plan,{mavzu:"Yangi mavzu",soat:1,turi:"mavzu",manba:"qolda"}])} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:palette.cream,color:palette.ink}}>+ Mavzu</button><button onClick={save} className="px-3 py-2 rounded-xl text-xs font-black text-white" style={{background:palette.blue}}>Rejani saqlash</button></div></div><div className="space-y-2 max-h-[600px] overflow-auto pr-1">{plan.map((x,i)=><div key={i} className="rounded-2xl border p-3" style={{borderColor:palette.line}}><div className="grid grid-cols-[auto_1fr_70px_135px_auto] gap-2 items-center"><div className="text-xs font-black">{i+1}</div><input value={x.mavzu||""} onChange={e=>update(i,"mavzu",e.target.value)} className="p-2 rounded-xl border"/><input type="number" min="1" max="10" value={x.soat||1} onChange={e=>update(i,"soat",e.target.value)} className="p-2 rounded-xl border"/><select value={x.turi||"mavzu"} onChange={e=>update(i,"turi",e.target.value)} className="p-2 rounded-xl border bg-white"><option value="mavzu">Mavzu</option><option value="nazorat">Nazorat</option><option value="xato_tahlil">Xatolar tahlili</option><option value="mustahkamlash">Mustahkamlash</option><option value="masala">Masala</option></select><div className="flex gap-1"><button onClick={()=>move(i,-1)}>↑</button><button onClick={()=>move(i,1)}>↓</button><button onClick={()=>setPlan(plan.filter((_,n)=>n!==i))} style={{color:palette.red}}>×</button></div></div></div>)}{!plan.length&&!loading&&<SmartNotice tone="warning">Mavzu rejasi bo‘sh. DTSdan oling yoki qo‘lda kiriting.</SmartNotice>}</div></Card><Card className="p-5"><h3 className="text-lg font-black mb-1" style={{color:palette.ink}}>Real dars sanalari</h3><p className="text-xs mb-3" style={{color:palette.muted}}>Dam olish kuni qo‘shilsa avtomatik yozuvlar siljiydi; o‘qituvchi qulflagan yozuv saqlanadi.</p><div className="space-y-2 max-h-[650px] overflow-auto pr-1">{calendar.map(row=><TopicCalendarRow key={row.id} row={row} token={token} apiBase={apiBase} maktabId={maktabId} onSaved={load}/>)}{!calendar.length&&<SmartNotice tone="info">Avval tasdiqlangan jadval va mavzu rejasi bo‘lishi kerak.</SmartNotice>}</div></Card></div></div>;
}

function SmartTimetablePanel({ token, apiBase, maktabId, onClose, teacherOnly = false, initialStep = 1 }) {
  const [step,setStep]=useState(teacherOnly?(initialStep===5?5:2):initialStep);const [setup,setSetup]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [selectedTeacher,setSelectedTeacher]=useState("");
  const load=async()=>{if(!maktabId){setError("Maktab ID topilmadi");setLoading(false);return;}setLoading(true);setError("");try{const d=await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/sozlamalar?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`);d.maktab_id=maktabId;setSetup(d);setSelectedTeacher(prev=>prev||String(teacherOnly?d.joriy_user_id:d.oqituvchilar?.[0]?.user_id||""));}catch(e){setError(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load();},[maktabId,token,apiBase]);
  return <div className="min-h-screen"><SmartHeader title={teacherOnly?"Mening jadval sozlamalarim":"Aqlli dars jadvali va yillik reja"} subtitle={teacherOnly?"Bo‘sh vaqt, metod kuni va o‘zingiz dars beradigan sinflarning mavzu rejasi":"Draft yaratish, konfliktlarni ko‘rish va faqat tekshirgandan keyin tasdiqlash"} onClose={onClose}/><SmartStepNav step={step} setStep={setStep} teacherOnly={teacherOnly}/><main className="max-w-[1500px] mx-auto px-4 md:px-7 py-5">{loading?<div className="py-24 flex justify-center"><Loader2 className="animate-spin" size={30} style={{color:palette.blue}}/></div>:error?<SmartNotice tone="error">{error}</SmartNotice>:<>{step===1&&!teacherOnly&&<CalendarStep token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} reload={load} setStep={setStep}/>} {step===2&&<TeacherTimeGrid setup={setup} selectedTeacher={selectedTeacher} setSelectedTeacher={setSelectedTeacher} teacherOnly={teacherOnly} token={token} apiBase={apiBase} maktabId={maktabId} reload={load}/>} {step===3&&!teacherOnly&&<LoadsStep token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} reload={load} setStep={setStep}/>} {step===4&&!teacherOnly&&<GenerateStep token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} reload={load}/>} {step===5&&<TopicsStep token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} teacherOnly={teacherOnly}/>}</>}</main></div>;
}


export default function SchoolWorkspace({ token, apiBase, initialWorkspace, onBack, onLegacy, adminPreview = false }) {
  const maktabId = initialWorkspace?.muassasa_id || initialWorkspace?.id;
  const lavozim = String(initialWorkspace?.lavozim || "").toLowerCase();
  const teacherMode = Boolean(lavozim) && !["direktor", "zam_direktor_uquv", "zam_direktor_tarbiya", "owner", "admin"].includes(lavozim);
  const [dashboard, setDashboard] = useState(null);
  const [yuklama, setYuklama] = useState([]);
  const [holatlar, setHolatlar] = useState([]);
  const [loading, setLoading] = useState(!teacherMode);
  const [error, setError] = useState("");
  const [loadWarnings, setLoadWarnings] = useState([]);
  const [adminPreviewOpen, setAdminPreviewOpen] = useState(false);
  const [smartOpen, setSmartOpen] = useState(null);

  const loadManager = () => {
    if (teacherMode) return;
    if (!maktabId) {
      setDashboard(null); setYuklama([]); setHolatlar([]);
      setError("Maktab ID topilmadi. Muassasani qayta tanlang."); setLoading(false); return;
    }
    setLoading(true); setError(""); setLoadWarnings([]);
    Promise.allSettled([
      smartFetch(`${apiBase}/api/maktab/dashboard_xavfsiz?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`),
      smartFetch(`${apiBase}/api/maktab/yuklama_xulosasi_xavfsiz?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`),
      smartFetch(`${apiBase}/api/maktab/aqlli_holatlar_xavfsiz?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`),
    ]).then(([dashboardResult, workloadResult, casesResult]) => {
      const warnings = [];
      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value);
        warnings.push(...(dashboardResult.value.diagnostika_ogohlantirishlari || []));
      } else {
        setDashboard(null);
        setError(`Maktabning asosiy ma’lumotlari yuklanmadi: ${dashboardResult.reason?.message || "server xatosi"}`);
      }
      if (workloadResult.status === "fulfilled") {
        setYuklama(workloadResult.value.xodimlar || []);
        warnings.push(...(workloadResult.value.diagnostika_ogohlantirishlari || []));
      } else {
        setYuklama([]);
        warnings.push(`O‘qituvchi yuklamasi vaqtincha yuklanmadi: ${workloadResult.reason?.message || "server xatosi"}`);
      }
      if (casesResult.status === "fulfilled") {
        setHolatlar(casesResult.value.holatlar || []);
        warnings.push(...(casesResult.value.diagnostika_ogohlantirishlari || []));
      } else {
        setHolatlar([]);
        warnings.push(`Aqlli holatlar vaqtincha yuklanmadi: ${casesResult.reason?.message || "server xatosi"}`);
      }
      setLoadWarnings([...new Set(warnings.filter(Boolean))]);
    }).finally(() => setLoading(false));
  };
  useEffect(loadManager, [token, apiBase, maktabId, teacherMode]);

  const jamiOquvchi = dashboard?.bugungi_davomat?.jami_oquvchi
    ?? dashboard?.sinflar?.reduce((a,s)=>a+(Number(s.oquvchi_soni)||0),0) ?? 0;
  const yuklamaMuammo = useMemo(() => yuklama.filter(x => x.holat === "ortiqcha" || x.holat === "yetishmaydi"), [yuklama]);
  const schoolName = dashboard?.maktab_nomi || initialWorkspace?.muassasa_nomi || initialWorkspace?.nomi || (maktabId ? `Maktab #${maktabId}` : "Maktab");

  if (smartOpen) {
    return <WorkspacePortal><SmartTimetablePanel token={token} apiBase={apiBase} maktabId={maktabId} onClose={() => setSmartOpen(null)} teacherOnly={teacherMode} initialStep={smartOpen}/></WorkspacePortal>;
  }

  if (adminPreview && adminPreviewOpen) {
    return <WorkspacePortal><AdminRolePreview token={token} apiBase={apiBase} maktabId={maktabId} schoolName={schoolName} onClose={() => setAdminPreviewOpen(false)}/></WorkspacePortal>;
  }

  if (teacherMode) {
    return (
      <WorkspacePortal>
        <div className="min-h-screen">
          <SmartHeader title={schoolName} subtitle="O‘qituvchi ish maydoni" onClose={onBack}/>
          <main className="max-w-6xl mx-auto px-4 md:px-7 py-5 md:py-8">
            <Card className="p-5 mb-5" style={{ background: "linear-gradient(135deg,#153D5A,#0D7378)", borderColor: "transparent", color: "#fff" }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div><div className="text-xs font-black uppercase tracking-[.14em] opacity-75">Mening maktabim</div><h2 className="text-2xl md:text-3xl font-black mt-1">{schoolName}</h2><p className="text-sm mt-1 opacity-80">Bugungi darslar, bo‘sh vaqt va mavzu rejasi bir joyda.</p></div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSmartOpen(2)} className="px-4 py-2.5 rounded-xl text-sm font-black" style={{ background: "rgba(255,255,255,.16)" }}>Bo‘sh vaqt / metod kuni</button>
                  <button onClick={() => setSmartOpen(5)} className="px-4 py-2.5 rounded-xl text-sm font-black" style={{ background: "#fff", color: palette.blue }}>Mavzu rejasi</button>
                </div>
              </div>
            </Card>
            <TeacherToday token={token} apiBase={apiBase}/>
          </main>
        </div>
      </WorkspacePortal>
    );
  }

  return (
    <WorkspacePortal>
      <div className="min-h-screen" style={{ background: "radial-gradient(circle at top right,#E9F7F5 0,transparent 33%),linear-gradient(180deg,#F8FBFD 0%,#F7F4ED 100%)" }}>
        <SmartHeader title={schoolName} subtitle="Maktab boshqaruv markazi" onClose={onBack} badge="MAKTAB WORKSPACE"/>
        <main className="max-w-7xl mx-auto px-4 md:px-7 py-5 md:py-8">
          <div className="flex flex-wrap justify-end gap-2 mb-5">
            <button onClick={() => setSmartOpen(1)} className="px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2" style={{ background: palette.blue, color: "#fff" }}><CalendarDays size={16}/> Aqlli dars jadvali</button>
            {adminPreview && <button onClick={() => setAdminPreviewOpen(true)} className="px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2" style={{ background: palette.greenBg, color: palette.green }}><Eye size={16}/> Rol sifatida ko‘rish</button>}
            <button onClick={loadManager} className="px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2" style={{ background: "#fff", border: `1px solid ${palette.line}`, color: palette.blue }}><RefreshCw size={15}/> Yangilash</button>
            {onLegacy && <button onClick={onLegacy} className="px-4 py-2.5 rounded-xl text-sm font-black" style={{ background: palette.cream, color: palette.ink }}>Boshlang‘ich sozlamalar</button>}
          </div>

          <Card className="p-5 md:p-7 mb-5" style={{ background: "linear-gradient(135deg,#153D5A,#0D7378)", borderColor: "transparent", color: "#fff" }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div><div className="text-xs font-bold tracking-[.14em] uppercase opacity-75">Maktab boshqaruv markazi</div><h1 className="text-2xl md:text-4xl font-black mt-2">{schoolName}</h1><p className="text-sm mt-2 opacity-80 max-w-2xl">Bugungi holat, sinflar, o‘qituvchi yuklamasi va e’tibor talab qiladigan vaziyatlar — bir qarashda.</p></div>
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,.14)" }}><School size={31}/></div>
            </div>
          </Card>

          {loadWarnings.length > 0 && !loading && <div className="mb-4 space-y-2">{loadWarnings.slice(0,5).map((warning, index)=><SmartNotice key={`${warning}-${index}`} tone="warning">{warning}</SmartNotice>)}</div>}
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" size={30} style={{ color: palette.blue }}/></div> : error ? <SmartNotice tone="error">{error}</SmartNotice> : <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
              <Stat icon={<GraduationCap size={18}/>} value={jamiOquvchi} label="o‘quvchi" tone="blue"/>
              <Stat icon={<School size={18}/>} value={dashboard?.sinflar?.length ?? 0} label="sinf" tone="teal"/>
              <Stat icon={<UserRoundCheck size={18}/>} value={dashboard?.bugungi_davomat?.kelgan ?? 0} label="bugun kelgan" tone="green"/>
              <Stat icon={<ClipboardCheck size={18}/>} value={dashboard?.bugungi_davomat?.sinflar_belgilamagan ?? 0} label="davomat kiritmagan sinf" tone={dashboard?.bugungi_davomat?.sinflar_belgilamagan ? "amber" : "green"}/>
              <Stat icon={<BellRing size={18}/>} value={holatlar.length} label="ochiq aqlli holat" tone={holatlar.length ? "red" : "green"}/>
            </div>

            <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-4 mb-5">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4"><div><div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>Bugun maktabda</div><div className="text-lg font-black mt-1" style={{ color: palette.ink }}>Tezkor nazorat</div></div><LayoutDashboard size={22} style={{ color: palette.blue }}/></div>
                <div className="space-y-2.5">
                  {(dashboard?.bugungi_davomat?.sinflar_belgilamagan || 0) > 0 && <div className="rounded-2xl p-3.5 flex gap-3" style={{ background: palette.amberBg }}><AlertTriangle size={19} style={{ color: palette.amber }}/><div><div className="text-sm font-bold" style={{ color: palette.ink }}>{dashboard.bugungi_davomat.sinflar_belgilamagan} ta sinf davomat kiritmagan</div><div className="text-xs mt-0.5" style={{ color: palette.muted }}>Faqat kelmagan yoki kechikkan o‘quvchini belgilash kifoya.</div></div></div>}
                  {holatlar.slice(0,4).map(h=><div key={h.id} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: h.daraja>=3?palette.redBg:palette.cream }}><div className="w-8 h-8 rounded-xl flex items-center justify-center font-black" style={{ background: "#fff", color:h.daraja>=3?palette.red:palette.amber }}>{h.daraja}</div><div className="flex-1"><div className="text-sm font-bold" style={{ color: palette.ink }}>{h.full_name}</div><div className="text-xs mt-0.5" style={{ color: palette.muted }}>{h.sarlavha}</div></div></div>)}
                  {!holatlar.length && !(dashboard?.bugungi_davomat?.sinflar_belgilamagan || 0) && <SmartNotice tone="success">Hozircha shoshilinch signal yo‘q.</SmartNotice>}
                </div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-4"><WandSparkles size={20} style={{ color: palette.teal }}/><div className="text-lg font-black" style={{ color: palette.ink }}>Aqlli yordamchi</div></div>
                <div className="space-y-2">
                  <QuickAction icon={<CalendarDays size={18}/>} title="Aqlli dars jadvali" desc="Kalendar → bo‘sh vaqt → fan soati → draft → tasdiq → mavzu rejasi." onClick={() => setSmartOpen(1)}/>
                  <QuickAction icon={<BarChart3 size={18}/>} title="Yuklama balansi" desc={`${yuklamaMuammo.length} ta xodimda yuklama farqi bor.`} onClick={() => setSmartOpen(4)}/>
                  <QuickAction icon={<MessageCircle size={18}/>} title="Xabarlar" desc="Maktab, sinf va ishchi guruhlar bo‘yicha muloqot." onClick={onBack}/>
                </div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="p-5"><div className="flex items-center justify-between mb-4"><div><div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>O‘qituvchilar</div><div className="text-lg font-black mt-1" style={{ color: palette.ink }}>Haftalik yuklama</div></div><Users size={21} style={{ color: palette.blue }}/></div><div className="space-y-2 max-h-[390px] overflow-auto pr-1">{yuklama.slice(0,30).map(x=>{const reja=x.haftalik_reja_jami??x.haftalik_dars_soati;const amaldagi=Number(x.jadvaldagi_soat||0);const bad=x.holat==="ortiqcha";const ok=x.holat==="toliq";return <div key={x.user_id} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background:ok?palette.greenBg:bad?palette.redBg:palette.cream }}><div className="flex-1 min-w-0"><div className="text-sm font-bold truncate" style={{ color:palette.ink }}>{x.full_name}</div><div className="text-xs mt-0.5 truncate" style={{ color:palette.muted }}>{x.lavozim==="psixolog"?`Psixolog · ${x.psixolog_sinf_soni||0} sinf`:`${x.fanlari||"Fan belgilanmagan"}${x.sinf_soati_soni?` · +${x.sinf_soati_soni} sinf soati`:""}`}</div></div><div className="text-right"><div className="text-sm font-black" style={{ color:bad?palette.red:ok?palette.green:palette.amber }}>{amaldagi}/{reja??"—"}</div><div className="text-[11px]" style={{ color:palette.muted }}>soat</div></div></div>})}{!yuklama.length&&<div className="text-sm" style={{ color:palette.muted }}>Xodim yuklamasi hali kiritilmagan.</div>}</div></Card>
              <Card className="p-5"><div className="flex items-center justify-between mb-4"><div><div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>Sinflar</div><div className="text-lg font-black mt-1" style={{ color: palette.ink }}>Maktab xaritasi</div></div><BookOpen size={21} style={{ color: palette.blue }}/></div><div className="grid grid-cols-2 gap-2.5 max-h-[390px] overflow-auto pr-1">{(dashboard?.sinflar||[]).map(s=><div key={s.id} className="rounded-2xl p-3.5" style={{ background:palette.cream }}><div className="text-base font-black" style={{ color:palette.ink }}>{s.sinf}-{s.harf}</div><div className="text-xs mt-1" style={{ color:palette.muted }}>{s.oquvchi_soni} o‘quvchi</div><div className="text-xs mt-1 truncate" style={{ color:s.rahbar_ismi?palette.teal:palette.amber }}>Rahbar: {s.rahbar_ismi||"belgilanmagan"}</div><div className="text-xs mt-1 truncate" style={{ color:s.psixolog_ismi?"#6B4E9B":palette.muted }}>Psixolog: {s.psixolog_ismi||"belgilanmagan"}</div></div>)}</div></Card>
            </div>
          </>}
        </main>
      </div>
    </WorkspacePortal>
  );
}

