// SamTM V19.2 — o‘qituvchi + fan + sinf + guruh + soat bitta aniq qatorda.
// SAMTM V19.0 — teacher matrix is paginated to prevent DOM freezes.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, BarChart3, BellRing, BookOpen, CalendarDays, CheckCircle2,
  ChevronRight, ClipboardCheck, Clock3, GraduationCap, LayoutDashboard,
  Loader2, MessageCircle, RefreshCw, School, Sparkles, Users, UserRoundCheck,
  WandSparkles, AlertTriangle, CalendarCheck2, ToggleLeft, ToggleRight,
  Eye, ShieldCheck, UserCog, Stethoscope, Brain, LockKeyhole, X, Search
} from "lucide-react";

const SAMTM_TEACHER_FIRST_RELEASE = "V19.3 · tasdiqlangan o‘quv reja";
const teacherCategoriesV192 = [
  "O'ta maxsus mutaxassis (oliy ma'lumotli)",
  "2-toifali", "1-toifali", "Oliy toifali",
];

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
    : [[1, "1. Kalendar"], [2, "2. O‘qituvchi vaqti"], [3, "3. O‘qituvchi + fan-soat"], [4, "4. Jadval yaratish"], [5, "5. Mavzu rejasi"]];
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
          <div className="text-[8px] mt-0.5 truncate" style={{ color: palette.muted }}>Bu radio-tanlov: bir vaqtning o‘zida faqat bitta kun belgilanadi.</div>
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
      <Card className="p-5"><div className="flex items-center justify-between gap-3 mb-4"><div><h2 className="text-xl font-black" style={{color:palette.ink}}>Belgilangan kunlar</h2><p className="text-xs mt-1" style={{color:palette.muted}}>Qizil — o‘qish yo‘q. Sariq — taxminiy. Yashil — tasdiqlangan.</p></div><button onClick={save} disabled={saving} className="px-3 py-2 rounded-xl text-xs font-black text-white" style={{background:palette.blue}}>Hammasini saqlash</button></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[360px] overflow-auto pr-1">{(setup?.maxsus_kunlar||[]).map(day=><div key={day.id||day.sana} className="rounded-2xl p-3 flex gap-2 items-start" style={dayStyle(day)}><div className="flex-1"><div className="text-sm font-black">{day.sana}</div><div className="text-xs mt-1">{day.nomi||day.turi} · {day.holat}</div></div><button onClick={()=>removeSpecial(day)} className="text-xs font-black">×</button></div>)}{!(setup?.maxsus_kunlar||[]).length&&<div className="text-sm" style={{color:palette.muted}}>Hali maxsus kun qo‘shilmagan.</div>}</div></Card></div>
    <ClassDayBlockPanel token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} reload={reload} setStep={setStep}/>
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


function AutoMethodDayPanelV1871({
  token, apiBase, maktabId, subjects, selectedSubjects, weekdays, reload
}) {
  const [enabled, setEnabled] = useState(false);
  const [rules, setRules] = useState([]);
  const [report, setReport] = useState([]);
  const [subject, setSubject] = useState("");
  const [day, setDay] = useState(1);
  const [hard, setHard] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const normalize = value =>
    String(value || "").trim().toLocaleLowerCase("uz");

  const load = async () => {
    setLoading(true);
    try {
      const data = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v2/metod_avto_sozlama?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`
      );
      setEnabled(Boolean(data.yoqilgan));
      setRules((data.qoidalar || []).map(row => ({
        fan_nomi: row.fan_nomi,
        hafta_kuni: Number(row.hafta_kuni),
        qattiq: Boolean(row.qattiq),
      })));
      setReport(data.hisobot || []);
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, apiBase, maktabId]);

  useEffect(() => {
    if (!subject && subjects.length) setSubject(subjects[0]);
  }, [subjects, subject]);

  const addSubjects = () => {
    const targets = selectedSubjects.length
      ? selectedSubjects
      : subject
        ? [subject]
        : [];

    if (!targets.length) {
      return setMessage({
        tone: "error",
        text: "Avval fan tanlang.",
      });
    }

    setRules(previous => {
      const map = new Map(
        previous.map(rule => [normalize(rule.fan_nomi), rule])
      );
      targets.forEach(fan => {
        map.set(normalize(fan), {
          fan_nomi: fan,
          hafta_kuni: Number(day),
          qattiq: Boolean(hard),
        });
      });
      return [...map.values()];
    });

    const dayName =
      smartDays.find(([value]) => Number(value) === Number(day))?.[1] ||
      String(day);

    setMessage({
      tone: "warning",
      text: (
        `${targets.length} ta fan uchun ${dayName} qoidasi tayyorlandi. ` +
        "Hali bazaga saqlanmadi."
      ),
    });
  };

  const updateRule = (index, field, value) =>
    setRules(previous =>
      previous.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule
      )
    );

  const removeRule = index =>
    setRules(previous => previous.filter((_, i) => i !== index));

  const save = async nextEnabled => {
    const state =
      typeof nextEnabled === "boolean" ? nextEnabled : enabled;

    if (state && !rules.length) {
      return setMessage({
        tone: "error",
        text: (
          "Avto metod kunini yoqish uchun kamida bitta " +
          "fan → kun qoidasi qo‘shing."
        ),
      });
    }

    setSaving(true);
    setMessage(null);

    try {
      const data = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v2/metod_avto_sozlama?token=${encodeURIComponent(token)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maktab_id: maktabId,
            yoqilgan: state,
            qoidalar: rules,
          }),
        }
      );

      setEnabled(Boolean(data.yoqilgan));
      setReport(data.hisobot || []);

      const conflicts =
        (data.bir_necha_fan_kuni_ziddiyati || []).length;
      const manual =
        (data.qolda_metod_borligi_uchun_otkazildi || []).length;

      setMessage({
        tone: conflicts || manual ? "warning" : "success",
        text: state
          ? (
              `Avto metod kuni YOQILDI. ` +
              `${data.avto_belgilangan || 0} ta o‘qituvchiga qo‘llandi.` +
              (
                manual
                  ? ` ${manual} ta o‘qituvchida qo‘lda metod kuni borligi uchun tegilmadi.`
                  : ""
              ) +
              (
                conflicts
                  ? ` ${conflicts} ta ko‘p fanli o‘qituvchida ro‘yxatdagi birinchi qoida tanlandi.`
                  : ""
              )
            )
          : (
              "Avto metod kuni O‘CHIRILDI. Avtomatik belgilar " +
              "olib tashlandi; qo‘lda belgilangan kunlar saqlandi."
            ),
      });

      await reload();
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const openAutoSetup = () => {
    setEnabled(true);
    setMessage({
      tone: "info",
      text: (
        "Avto sozlash oynasi ochildi. Fan → kun qoidalarini " +
        "qo‘shib, “Qoidalarni saqlash va avto qo‘llash”ni bosing."
      ),
    });
  };

  return (
    <Card className="p-5">
      {message && (
        <div className="mb-3">
          <SmartNotice tone={message.tone}>{message.text}</SmartNotice>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            className="text-xl font-black"
            style={{ color: palette.ink }}
          >
            Avto metod kuni
          </h2>
          <p
            className="text-xs mt-1"
            style={{ color: palette.muted }}
          >
            Standart holat O‘CHIQ. Tizim o‘zi fanlarga kun o‘ylab
            topmaydi. YOQILSA faqat siz saqlagan aniq fan → kun
            qoidasi ishlaydi.
          </p>
        </div>

        <button
          onClick={() => enabled ? save(false) : openAutoSetup()}
          disabled={saving || loading}
          className="px-4 py-2.5 rounded-xl text-sm font-black"
          style={{
            background: enabled ? palette.greenBg : palette.cream,
            color: enabled ? palette.green : palette.muted,
          }}
        >
          {saving
            ? "Saqlanmoqda..."
            : enabled
              ? "AVTO: YOQ — O‘CHIRISH"
              : "AVTO: O‘CHIQ — SOZLASH/YOQISH"}
        </button>
      </div>

      {enabled && (
        <>
          <div className="grid lg:grid-cols-[1.5fr_1fr_1fr_auto] gap-2 mt-4">
            {selectedSubjects.length ? (
              <div
                className="p-2.5 rounded-xl border text-xs font-bold"
                style={{ borderColor: palette.line, background: palette.sky, color: palette.blue }}
              >
                Asosiy filtr: {selectedSubjects.join(", ")}
              </div>
            ) : (
              <select
                value={subject}
                onChange={event => setSubject(event.target.value)}
                className="p-2.5 rounded-xl border bg-white"
              >
                <option value="">Fanni tanlang</option>
                {subjects.map(fan => (
                  <option key={fan} value={fan}>{fan}</option>
                ))}
              </select>
            )}

            <select
              value={day}
              onChange={event => setDay(Number(event.target.value))}
              className="p-2.5 rounded-xl border bg-white"
            >
              {smartDays.slice(0, weekdays).map(([value, name]) => (
                <option key={value} value={value}>{name}</option>
              ))}
            </select>

            <select
              value={hard ? "hard" : "soft"}
              onChange={event => setHard(event.target.value === "hard")}
              className="p-2.5 rounded-xl border bg-white"
            >
              <option value="hard">
                Qattiq — dars qo‘yilmasin
              </option>
              <option value="soft">
                Yumshoq — iloji bo‘lsa bo‘sh
              </option>
            </select>

            <button
              onClick={addSubjects}
              className="px-4 py-2.5 rounded-xl text-sm font-black text-white"
              style={{ background: palette.teal }}
            >
              {selectedSubjects.length
                ? `Qoida qo‘shish (${selectedSubjects.length})`
                : "Qoida qo‘shish"}
            </button>
          </div>

          <div
            className="mt-3 rounded-xl p-3 text-xs"
            style={{ background: palette.sky, color: palette.blue }}
          >
            Masalan: O‘ZBEKISTON TARIXI → Dushanba → Qattiq.
            Saqlanganda faqat aynan shu fan o‘qituvchilari Dushanba
            metod kuni bo‘ladi; TARBIYA yoki boshqa fan aralashmaydi.
          </div>

          <div className="space-y-2 mt-4 max-h-72 overflow-auto pr-1">
            {rules.map((rule, index) => (
              <div
                key={`${rule.fan_nomi}-${index}`}
                className="grid md:grid-cols-[1.5fr_1fr_1fr_auto] gap-2 items-center rounded-2xl border p-3"
                style={{ borderColor: palette.line }}
              >
                <div
                  className="text-sm font-black"
                  style={{ color: palette.ink }}
                >
                  {rule.fan_nomi}
                </div>

                <select
                  value={rule.hafta_kuni}
                  onChange={event =>
                    updateRule(
                      index,
                      "hafta_kuni",
                      Number(event.target.value)
                    )
                  }
                  className="p-2 rounded-xl border bg-white"
                >
                  {smartDays.slice(0, weekdays).map(([value, name]) => (
                    <option key={value} value={value}>{name}</option>
                  ))}
                </select>

                <select
                  value={rule.qattiq ? "hard" : "soft"}
                  onChange={event =>
                    updateRule(
                      index,
                      "qattiq",
                      event.target.value === "hard"
                    )
                  }
                  className="p-2 rounded-xl border bg-white"
                >
                  <option value="hard">Qattiq</option>
                  <option value="soft">Yumshoq</option>
                </select>

                <button
                  onClick={() => removeRule(index)}
                  className="px-3 py-2 rounded-xl text-xs font-black"
                  style={{
                    background: palette.redBg,
                    color: palette.red,
                  }}
                >
                  Olib tashlash
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="px-5 py-3 rounded-xl text-sm font-black text-white"
              style={{ background: palette.blue }}
            >
              Qoidalarni saqlash va avto qo‘llash
            </button>
          </div>
        </>
      )}

      <div className="mt-4">
        <div
          className="text-sm font-black"
          style={{ color: palette.ink }}
        >
          Fan → metod kuni hisoboti
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
          {report.map(row => (
            <div
              key={row.fan_nomi}
              className="rounded-xl p-3"
              style={{
                background: row.qattiq
                  ? palette.redBg
                  : palette.amberBg,
              }}
            >
              <div
                className="text-sm font-black"
                style={{ color: palette.ink }}
              >
                {row.fan_nomi}
              </div>
              <div
                className="text-xs mt-1"
                style={{
                  color: row.qattiq
                    ? palette.red
                    : palette.amber,
                }}
              >
                {row.kun_nomi} · {row.qattiq ? "Qattiq" : "Yumshoq"}
                {" · "}
                {row.oqituvchi_soni} o‘qituvchi
              </div>
            </div>
          ))}

          {!report.length && (
            <div
              className="text-xs"
              style={{ color: palette.muted }}
            >
              Avto fan → kun qoidasi yo‘q.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}



function OfficialMethodPresetPanelV1873({ token, apiBase, maktabId, reload }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v3/metod_rasmiy_sozlama?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`
      );
      setData(result);
      if (result.birinchi_marta_qollandi) {
        setMessage({ tone: "success", text: `Rasmiy metod kunlari ${result.jami_oqituvchi || 0} ta o‘qituvchiga qattiq cheklov sifatida qo‘llandi.` });
        await reload();
      }
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token, apiBase, maktabId]);

  const save = async (enabled, reapply=false) => {
    if (reapply && !window.confirm("Rasmiy fan-kun taqsimoti barcha mos o‘qituvchilarga qayta qo‘llansinmi? Hozirgi metod kunlari rasmiy preset bilan almashtiriladi.")) return;
    setSaving(true);
    try {
      const result = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v3/metod_rasmiy_sozlama?token=${encodeURIComponent(token)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maktab_id: maktabId, yoqilgan: enabled, qayta_qollash: reapply }),
        }
      );
      setData(result);
      setMessage({
        tone: result.ziddiyat_soni ? "warning" : "success",
        text: enabled
          ? `Rasmiy metod kunlari YOQ. ${result.jami_oqituvchi || 0} ta o‘qituvchi moslandi.${result.ziddiyat_soni ? ` ${result.ziddiyat_soni} ta ko‘p fanli o‘qituvchini pastdagi matritsada tekshiring.` : ""}`
          : "Rasmiy avto metod kuni O‘CHIRILDI. Qo‘lda tuzatilgan vaqtlar saqlandi.",
      });
      await reload();
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return <Card className="p-3">
    {message && <div className="mb-2"><SmartNotice tone={message.tone}>{message.text}</SmartNotice></div>}
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <div className="text-base font-black" style={{color:palette.ink}}>Rasmiy metod kunlari</div>
        <div className="text-[11px] mt-0.5" style={{color:palette.muted}}>O‘zA 12.12.2024 tartibi · Psixologga avtomatik belgilanmaydi · keyin matritsada bittalab tuzatish mumkin.</div>
      </div>
      <div className="flex gap-2">
        <button onClick={()=>save(!data?.yoqilgan,false)} disabled={saving||loading} className="px-3 py-2 rounded-xl text-xs font-black" style={{background:data?.yoqilgan?palette.greenBg:palette.cream,color:data?.yoqilgan?palette.green:palette.muted}}>{saving?"Saqlanmoqda...":data?.yoqilgan?"AVTO: YOQ — O‘CHIRISH":"AVTO: O‘CHIQ — YOQISH"}</button>
        <button onClick={()=>save(true,true)} disabled={saving||loading} className="px-3 py-2 rounded-xl text-xs font-black text-white" style={{background:palette.blue}}>Rasmiy taqsimotni qayta qo‘llash</button>
      </div>
    </div>
    {loading ? <div className="py-4 flex justify-center"><Loader2 size={18} className="animate-spin" style={{color:palette.blue}}/></div> : <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-1.5 mt-3">
      {(data?.kunlar||[]).map(day=><div key={day.hafta_kuni} className="rounded-xl border p-2" style={{borderColor:palette.line,background:day.hafta_kuni===6?"#F7F1FC":"#FAFCFD"}}>
        <div className="text-[11px] font-black" style={{color:palette.blue}}>{day.kun_nomi} · {day.oqituvchi_soni} o‘qituvchi</div>
        <div className="text-[9px] leading-4 mt-1" style={{color:palette.muted}}>{(day.fanlar||[]).join(" · ")}</div>
      </div>)}
    </div>}
    {!!data?.ziddiyat_soni && <div className="text-[10px] mt-2 px-2 py-1.5 rounded-lg" style={{background:palette.amberBg,color:palette.amber}}>{data.ziddiyat_soni} ta o‘qituvchi turli kun guruhidagi bir nechta fan o‘tadi. Tizim eng ko‘p fan tushgan kunni tanladi; pastda qo‘lda tuzating.</div>}
  </Card>;
}


function TeacherTimeGridV1869({ setup, selectedTeacher, setSelectedTeacher, teacherOnly, token, apiBase, maktabId, reload }) {
  const weekdays = Number(setup?.oquv_yili?.hafta_kunlari || 6);
  const shifts = useMemo(() => {
    const source = (setup?.smenalar || []).map(row => ({
      ...row,
      smena: Number(row.smena),
      dars_soni: Number(row.dars_soni || 7),
    })).sort((a, b) => a.smena - b.smena);
    return source.length ? source : [
      { smena: 1, dars_soni: 7 },
      { smena: 2, dars_soni: 7 },
    ];
  }, [setup]);

  const [subjectSearch, setSubjectSearch] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [states, setStates] = useState({});
  const [rulesMap, setRulesMap] = useState({});
  const [dirtyIds, setDirtyIds] = useState([]);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const [bulkDay, setBulkDay] = useState(1);
  const [bulkTarget, setBulkTarget] = useState("method");
  const [bulkLevel, setBulkLevel] = useState("hard");
  const [teacherPage, setTeacherPage] = useState(1);
  const TEACHERS_PER_PAGE = 12;

  const normalizeSubject = value => String(value || "").trim().toLocaleLowerCase("uz");
  const splitSubjects = teacher => {
    const source = Array.isArray(teacher?.fanlar_royxati)
      ? teacher.fanlar_royxati
      : String(teacher?.fanlari || "").replaceAll("\\n", "\n").split(/[;\n,]+/);
    const unique = new Map();
    source.map(value => String(value || "").trim()).filter(Boolean).forEach(subject => {
      unique.set(normalizeSubject(subject), subject);
    });
    return [...unique.values()];
  };
  const teacherClasses = teacher => (
    Array.isArray(teacher?.sinflar_royxati) ? teacher.sinflar_royxati : []
  ).join(", ") || "Sinf birikmasi yo‘q";

  const teachers = useMemo(() => (setup?.oqituvchilar || []).filter(teacher => {
    if (teacherOnly) return true;
    const role = String(teacher?.lavozim || "");
    const classCount = Array.isArray(teacher?.sinflar_royxati) ? teacher.sinflar_royxati.length : 0;
    return role === "fan_oqituvchisi" || Number(teacher?.dars_birikma_soni || 0) > 0 || classCount > 0;
  }), [setup, teacherOnly]);

  const subjectOptions = useMemo(() => {
    const exact = new Map();
    teachers.flatMap(splitSubjects).forEach(subject => exact.set(normalizeSubject(subject), subject));
    return [...exact.values()].sort((a, b) => a.localeCompare(b, "uz"));
  }, [teachers]);

  const filteredSubjectOptions = useMemo(() => {
    const query = normalizeSubject(subjectSearch);
    return subjectOptions.filter(subject => !query || normalizeSubject(subject).includes(query));
  }, [subjectOptions, subjectSearch]);

  const selectedSubjectKeys = useMemo(
    () => new Set(selectedSubjects.map(normalizeSubject)),
    [selectedSubjects]
  );

  const visibleTeachers = useMemo(() => {
    if (!selectedSubjectKeys.size) return teachers;
    return teachers.filter(teacher =>
      splitSubjects(teacher).some(subject => selectedSubjectKeys.has(normalizeSubject(subject)))
    );
  }, [teachers, selectedSubjectKeys]);

  const visibleIdSet = useMemo(
    () => new Set(visibleTeachers.map(teacher => String(teacher.user_id))),
    [visibleTeachers]
  );
  const selectedVisibleIds = useMemo(
    () => selectedIds.filter(id => visibleIdSet.has(String(id))),
    [selectedIds, visibleIdSet]
  );

  const teacherPageCount = Math.max(1, Math.ceil(visibleTeachers.length / TEACHERS_PER_PAGE));
  const pagedTeachers = useMemo(() => {
    const safePage = Math.min(Math.max(1, teacherPage), teacherPageCount);
    const start = (safePage - 1) * TEACHERS_PER_PAGE;
    return visibleTeachers.slice(start, start + TEACHERS_PER_PAGE);
  }, [visibleTeachers, teacherPage, teacherPageCount]);

  useEffect(() => {
    setTeacherPage(1);
  }, [selectedSubjects, subjectSearch]);

  useEffect(() => {
    if (teacherPage > teacherPageCount) setTeacherPage(teacherPageCount);
  }, [teacherPage, teacherPageCount]);

  const emptyState = () => ({ methods: {}, slots: {} });
  const defaultRules = () => ({
    kunlik_max: 6,
    ketma_ket_max: 4,
    okno_max: 1,
    afzal_smena: 0,
    eng_erta_dars: 1,
    eng_kech_dars: 12,
  });

  const shiftByNumber = useMemo(
    () => new Map(shifts.map(row => [Number(row.smena), row])),
    [shifts]
  );

  useEffect(() => {
    const nextStates = {};
    const nextRules = {};

    teachers.forEach(teacher => {
      nextStates[String(teacher.user_id)] = emptyState();
      nextRules[String(teacher.user_id)] = defaultRules();
    });

    (setup?.oqituvchi_qoidalari || []).forEach(row => {
      const uid = String(row.user_id);
      if (!nextRules[uid]) return;
      nextRules[uid] = {
        kunlik_max: Number(row.kunlik_max || 6),
        ketma_ket_max: Number(row.ketma_ket_max || 4),
        okno_max: Number(row.okno_max ?? 1),
        afzal_smena: Number(row.afzal_smena || 0),
        eng_erta_dars: Number(row.eng_erta_dars || 1),
        eng_kech_dars: Number(row.eng_kech_dars || 12),
      };
    });

    (setup?.oqituvchi_vaqtlari || []).forEach(row => {
      const uid = String(row.user_id);
      const teacherState = nextStates[uid];
      if (!teacherState) return;

      const day = Number(row.hafta_kuni);
      const rowShift = Number(row.smena || 0);
      const period = Number(row.dars_raqami || 0);
      const level = row.qattiq ? "hard" : "soft";

      if (row.turi === "metod_kuni") {
        teacherState.methods[day] = level;
        return;
      }

      if (!["band", "afzal_bosh"].includes(String(row.turi))) return;

      if (rowShift === 0 && period === 0) {
        shifts.forEach(shift => {
          for (let p = 1; p <= Number(shift.dars_soni || 7); p += 1) {
            teacherState.slots[`${day}-${shift.smena}-${p}`] = level;
          }
        });
      } else if (rowShift > 0 && period === 0) {
        const count = Number(shiftByNumber.get(rowShift)?.dars_soni || 7);
        for (let p = 1; p <= count; p += 1) {
          teacherState.slots[`${day}-${rowShift}-${p}`] = level;
        }
      } else if (rowShift === 0 && period > 0) {
        shifts.forEach(shift => {
          if (period <= Number(shift.dars_soni || 7)) {
            teacherState.slots[`${day}-${shift.smena}-${period}`] = level;
          }
        });
      } else {
        teacherState.slots[`${day}-${rowShift}-${period}`] = level;
      }
    });

    setStates(nextStates);
    setRulesMap(nextRules);
    setDirtyIds([]);
    setSelectedIds([]);
  }, [setup, teachers, shifts, shiftByNumber]);

  useEffect(() => {
    if (!selectedTeacher && visibleTeachers.length) {
      setSelectedTeacher(String(visibleTeachers[0].user_id));
      return;
    }
    if (
      selectedTeacher &&
      !teachers.some(teacher => String(teacher.user_id) === String(selectedTeacher)) &&
      visibleTeachers.length
    ) {
      setSelectedTeacher(String(visibleTeachers[0].user_id));
    }
  }, [selectedTeacher, teachers, visibleTeachers, setSelectedTeacher]);

  const cloneTeacherState = value => ({
    methods: { ...(value?.methods || {}) },
    slots: { ...(value?.slots || {}) },
  });

  const markDirty = ids => {
    const values = (Array.isArray(ids) ? ids : [ids]).map(String);
    setDirtyIds(previous => [...new Set([...previous, ...values])]);
  };

  const setLevel = (map, key, level) => {
    if (level) map[key] = level;
    else delete map[key];
  };

  const clearDaySlots = (teacherState, day) => {
    Object.keys(teacherState.slots)
      .filter(key => key.startsWith(`${day}-`))
      .forEach(key => delete teacherState.slots[key]);
  };

  const materializeMethodDay = (teacherState, day) => {
    const level = teacherState.methods[day];
    if (!level) return null;
    shifts.forEach(shift => {
      for (let period = 1; period <= Number(shift.dars_soni || 7); period += 1) {
        teacherState.slots[`${day}-${shift.smena}-${period}`] = level;
      }
    });
    delete teacherState.methods[day];
    return level;
  };

  const effectiveSlotLevel = (teacherState, day, shift, period) =>
    teacherState.methods[day] || teacherState.slots[`${day}-${shift}-${period}`];

  const cycleLevel = current =>
    !current ? "hard" : current === "hard" ? "soft" : undefined;

  const updateTeacherState = (uid, updater) => {
    const key = String(uid);
    setStates(previous => {
      const next = { ...previous };
      const teacherState = cloneTeacherState(previous[key] || emptyState());
      updater(teacherState);
      next[key] = teacherState;
      return next;
    });
    markDirty(key);
  };

  const cycleMethod = (uid, day) => updateTeacherState(uid, teacherState => {
    const current = teacherState.methods[day];
    const next = cycleLevel(current);
    if (next) {
      teacherState.methods[day] = next;
      clearDaySlots(teacherState, day);
    } else {
      delete teacherState.methods[day];
    }
  });

  const cycleShift = (uid, day, shift) => updateTeacherState(uid, teacherState => {
    const methodLevel = materializeMethodDay(teacherState, day);
    const shiftRow = shiftByNumber.get(Number(shift)) || { dars_soni: 7 };
    const periods = Array.from({ length: Number(shiftRow.dars_soni || 7) }, (_, index) => index + 1);

    if (methodLevel) {
      periods.forEach(period => delete teacherState.slots[`${day}-${shift}-${period}`]);
      return;
    }

    const levels = periods.map(period => teacherState.slots[`${day}-${shift}-${period}`]);
    const allHard = levels.length > 0 && levels.every(level => level === "hard");
    const allSoft = levels.length > 0 && levels.every(level => level === "soft");
    const next = allHard ? "soft" : allSoft ? undefined : "hard";
    periods.forEach(period => setLevel(teacherState.slots, `${day}-${shift}-${period}`, next));
  });

  const cycleSlot = (uid, day, shift, period) => updateTeacherState(uid, teacherState => {
    const methodLevel = materializeMethodDay(teacherState, day);
    const key = `${day}-${shift}-${period}`;

    if (methodLevel) {
      delete teacherState.slots[key];
      return;
    }

    setLevel(teacherState.slots, key, cycleLevel(teacherState.slots[key]));
  });

  const clearTeacherTimes = uid => updateTeacherState(uid, teacherState => {
    teacherState.methods = {};
    teacherState.slots = {};
  });

  const shiftAggregate = (teacherState, day, shift) => {
    const shiftRow = shiftByNumber.get(Number(shift)) || { dars_soni: 7 };
    const levels = Array.from(
      { length: Number(shiftRow.dars_soni || 7) },
      (_, index) => effectiveSlotLevel(teacherState, day, shift, index + 1)
    );
    if (levels.every(level => !level)) return undefined;
    if (levels.every(level => level === "hard")) return "hard";
    if (levels.every(level => level === "soft")) return "soft";
    return "mixed";
  };

  const levelStyle = level => {
    if (level === "hard") {
      return { background: "#FDE2E2", color: "#B42318", borderColor: "#E7AFAF" };
    }
    if (level === "soft") {
      return { background: "#FFF2CC", color: "#9C5700", borderColor: "#E5C786" };
    }
    if (level === "mixed") {
      return { background: "#EAF2F7", color: palette.blue, borderColor: "#BDD4E3" };
    }
    return { background: "#E8F7EC", color: "#28765B", borderColor: "#A7D7B5" };
  };

  const levelText = level =>
    level === "hard" ? "QATTIQ" :
    level === "soft" ? "YUMSHOQ" :
    level === "mixed" ? "ARALASH" : "BO‘SH";

  const stateToTimes = uid => {
    const teacherState = states[String(uid)] || emptyState();
    const rows = [];

    Object.entries(teacherState.methods).forEach(([day, level]) => {
      rows.push({
        hafta_kuni: Number(day),
        smena: 0,
        dars_raqami: 0,
        turi: "metod_kuni",
        qattiq: level === "hard",
        izoh: "V18.69 metod kuni",
      });
    });

    Object.entries(teacherState.slots).forEach(([key, level]) => {
      const [day, shift, period] = key.split("-").map(Number);
      rows.push({
        hafta_kuni: day,
        smena: shift,
        dars_raqami: period,
        turi: "band",
        qattiq: level === "hard",
        izoh: "V18.69 dars soati cheklovi",
      });
    });

    return rows.sort(
      (a, b) =>
        a.hafta_kuni - b.hafta_kuni ||
        a.smena - b.smena ||
        a.dars_raqami - b.dars_raqami ||
        a.turi.localeCompare(b.turi)
    );
  };

  const saveTeachers = async ids => {
    const uniqueIds = [...new Set(ids.map(String))].filter(uid => states[uid]);
    if (!uniqueIds.length) {
      return setMessage({ tone: "error", text: "Saqlash uchun o‘qituvchi tanlanmagan." });
    }

    setSaving(true);
    setMessage(null);
    try {
      const result = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v2/oqituvchi_vaqt_matritsasi?token=${encodeURIComponent(token)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maktab_id: maktabId,
            oqituvchilar: uniqueIds.map(uid => ({
              user_id: Number(uid),
              qoidalar: rulesMap[uid] || defaultRules(),
              vaqtlar: stateToTimes(uid),
            })),
          }),
        }
      );

      setDirtyIds(previous => previous.filter(uid => !uniqueIds.includes(String(uid))));
      setMessage({
        tone: "success",
        text: `${result.oqituvchi_soni || uniqueIds.length} ta o‘qituvchining metod kuni va dars soatlari saqlandi.`,
      });
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const matchingTeacherIdsForSubjects = subjects => {
    if (!subjects.length) return [];
    const exactKeys = new Set(subjects.map(normalizeSubject));
    return teachers
      .filter(teacher =>
        splitSubjects(teacher).some(subject => exactKeys.has(normalizeSubject(subject)))
      )
      .map(teacher => String(teacher.user_id));
  };

  const toggleSubject = subject => {
    const nextSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(value => value !== subject)
      : [...selectedSubjects, subject];
    setSelectedSubjects(nextSubjects);
    // Fan ptichkasi o‘zgarganda aynan shu fanlarga mos o‘qituvchilar darhol belgilanadi.
    setSelectedIds(matchingTeacherIdsForSubjects(nextSubjects));
  };

  const clearSubjectFilter = () => {
    setSubjectSearch("");
    setSelectedSubjects([]);
    setSelectedIds([]);
  };

  const toggleTeacher = uid =>
    setSelectedIds(previous =>
      previous.includes(String(uid))
        ? previous.filter(value => value !== String(uid))
        : [...previous, String(uid)]
    );

  const applyBulk = () => {
    const targets = selectedVisibleIds;
    if (!targets.length) {
      return setMessage({
        tone: "error",
        text: selectedSubjects.length
          ? "Tanlangan fanlarga mos o‘qituvchi topilmadi."
          : "Avval fanlarni yoki kerakli o‘qituvchilarni belgilang.",
      });
    }

    setStates(previous => {
      const next = { ...previous };

      targets.forEach(uid => {
        const teacherState = cloneTeacherState(previous[uid] || emptyState());
        const level = bulkLevel === "clear" ? undefined : bulkLevel;

        if (bulkTarget === "method") {
          if (level) {
            teacherState.methods[bulkDay] = level;
            clearDaySlots(teacherState, bulkDay);
          } else {
            delete teacherState.methods[bulkDay];
          }
        } else {
          materializeMethodDay(teacherState, bulkDay);
          const targetShifts = bulkTarget === "both"
            ? shifts
            : shifts.filter(shift => Number(shift.smena) === Number(bulkTarget));

          targetShifts.forEach(shift => {
            for (let period = 1; period <= Number(shift.dars_soni || 7); period += 1) {
              setLevel(
                teacherState.slots,
                `${bulkDay}-${shift.smena}-${period}`,
                level
              );
            }
          });
        }

        next[uid] = teacherState;
      });

      return next;
    });

    markDirty(targets);
    const dayName =
      smartDays.find(([day]) => Number(day) === Number(bulkDay))?.[1] ||
      String(bulkDay);
    const targetName =
      bulkTarget === "method" ? "metod kuni" :
      bulkTarget === "both" ? "ikkala smena" :
      `${bulkTarget}-smena`;
    const levelName =
      bulkLevel === "hard" ? "qattiq" :
      bulkLevel === "soft" ? "yumshoq" : "bo‘sh";

    setMessage({
      tone: "warning",
      text: `${targets.length} ta o‘qituvchi: ${dayName} — ${targetName} ${levelName} qilindi. Endi “Saqlash”ni bosing.`,
    });
  };

  const currentRuleTeacher = String(
    selectedTeacher || visibleTeachers[0]?.user_id || ""
  );
  const currentRules = rulesMap[currentRuleTeacher] || defaultRules();

  const updateRule = (field, value) => {
    if (!currentRuleTeacher) return;
    setRulesMap(previous => ({
      ...previous,
      [currentRuleTeacher]: {
        ...(previous[currentRuleTeacher] || defaultRules()),
        [field]: Number(value),
      },
    }));
    markDirty(currentRuleTeacher);
  };

  return <div className="space-y-4">
    {message && <SmartNotice tone={message.tone}>{message.text}</SmartNotice>}

    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black" style={{ color: palette.ink }}>
            Fanlarni aniq tanlash
          </h2>
          <p className="text-xs mt-1" style={{ color: palette.muted }}>
            Fanlarni ptichka bilan belgilang. Mos o‘qituvchilar avtomatik tanlanadi;
            qatoridagi ptichkani olib, ayrim o‘qituvchini istisno qilishingiz mumkin.
          </p>
        </div>
        <div className="px-3 py-2 rounded-xl text-xs font-black"
             style={{ background: palette.sky, color: palette.blue }}>
          {selectedSubjects.length
            ? `${selectedSubjects.length} fan · ${selectedVisibleIds.length} o‘qituvchi`
            : "Fan tanlanmagan"}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <input
          value={subjectSearch}
          onChange={event => setSubjectSearch(event.target.value)}
          placeholder="Fanni qidiring..."
          className="min-w-[230px] flex-1 p-2.5 rounded-xl border"
          style={{ borderColor: palette.line }}
        />
        {(subjectSearch || selectedSubjects.length > 0) && <button
          onClick={clearSubjectFilter}
          className="px-3 py-2 rounded-xl text-xs font-black"
          style={{ background: palette.cream, color: palette.ink }}
        >
          Tozalash
        </button>}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2 mt-3 max-h-48 overflow-auto pr-1">
        {filteredSubjectOptions.map(subject => <label
          key={subject}
          className="rounded-xl border px-3 py-2 flex items-start gap-2 text-xs cursor-pointer"
          style={{
            borderColor: selectedSubjects.includes(subject) ? palette.blue : palette.line,
            background: selectedSubjects.includes(subject) ? palette.sky : "#fff",
          }}
        >
          <input
            type="checkbox"
            checked={selectedSubjects.includes(subject)}
            onChange={() => toggleSubject(subject)}
          />
          <span className="font-bold"
                style={{ color: selectedSubjects.includes(subject) ? palette.blue : palette.ink }}>
            {subject}
          </span>
        </label>)}
      </div>
    </Card>

    {!teacherOnly && <OfficialMethodPresetPanelV1873 token={token} apiBase={apiBase} maktabId={maktabId} reload={reload}/>}

    {!teacherOnly && <Card className="p-5">
      <h2 className="text-xl font-black" style={{ color: palette.ink }}>
        Tanlangan o‘qituvchilarga birga qo‘llash
      </h2>
      <p className="text-xs mt-1" style={{ color: palette.muted }}>
        Kun, metod/smena va qattiq/yumshoq/bo‘sh holatini tanlang. “Qo‘llash”dan keyin pastdagi vaqtlar ranglanadi; so‘ng “Saqlash”ni bosing.
      </p>

      <div className="grid md:grid-cols-[1fr_1fr_1.3fr_auto] gap-2 mt-4">
        <select
          value={bulkDay}
          onChange={event => setBulkDay(Number(event.target.value))}
          className="p-2.5 rounded-xl border bg-white"
        >
          {smartDays.slice(0, weekdays).map(([day, name]) =>
            <option key={day} value={day}>{name}</option>
          )}
        </select>

        <select
          value={bulkTarget}
          onChange={event => setBulkTarget(event.target.value)}
          className="p-2.5 rounded-xl border bg-white"
        >
          <option value="method">Metod/kasbiy kun</option>
          {shifts.map(shift =>
            <option key={shift.smena} value={String(shift.smena)}>
              {shift.smena}-smena to‘liq
            </option>
          )}
          <option value="both">Ikkala smena to‘liq</option>
        </select>

        <select
          value={bulkLevel}
          onChange={event => setBulkLevel(event.target.value)}
          className="p-2.5 rounded-xl border bg-white"
        >
          <option value="hard">Qattiq — dars qo‘yilmasin</option>
          <option value="soft">Yumshoq — iloji bo‘lsa bo‘sh</option>
          <option value="clear">Bo‘sh — cheklovni olib tashlash</option>
        </select>

        <button
          onClick={applyBulk}
          disabled={saving || !selectedSubjects.length || !selectedVisibleIds.length}
          className="px-4 py-2.5 rounded-xl text-sm font-black text-white"
          style={{ background: selectedSubjects.length && selectedVisibleIds.length ? palette.teal : "#AAB5BD" }}
        >
          {selectedSubjects.length
            ? `Qo‘llash (${selectedVisibleIds.length})`
            : "Avval fan tanlang"}
        </button>
      </div>
    </Card>}

    <Card className="p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-black" style={{ color: palette.ink }}>
            O‘qituvchilar vaqt jadvali
          </h2>
          <p className="text-xs mt-1" style={{ color: palette.muted }}>
            Har kuni METOD, uning ostida 1-smena va 2-smena alohida.
            Smenada 6 dars bo‘lsa 6 ta, 7 dars bo‘lsa 7 ta tugma chiqadi.
          </p>
        </div>
        <button
          onClick={() => saveTeachers(dirtyIds)}
          disabled={saving || !dirtyIds.length}
          className="px-3 py-2 rounded-lg text-[10px] font-black text-white"
          style={{ background: dirtyIds.length ? palette.blue : "#9BA8B2" }}
        >
          {saving ? "Saqlanmoqda..." : `Saqlash (${dirtyIds.length})`}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-bold">
        <span style={{ color: "#28765B" }}>🟩 BO‘SH — dars qo‘yish mumkin</span>
        <span style={{ color: "#B42318" }}>🟥 QATTIQ — dars qo‘yilmaydi</span>
        <span style={{ color: "#9C5700" }}>🟨 YUMSHOQ — iloji bo‘lsa bo‘sh</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 rounded-lg border p-2" style={{ borderColor: palette.line }}>
        <div className="text-[10px] font-bold" style={{ color: palette.muted }}>
          {visibleTeachers.length} o‘qituvchi · sahifada {pagedTeachers.length} ta · {teacherPage}/{teacherPageCount}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setTeacherPage(1)} disabled={teacherPage <= 1} className="px-2 py-1 rounded text-[10px] font-black" style={{ background: palette.cream }}>Boshi</button>
          <button onClick={() => setTeacherPage(page => Math.max(1, page - 1))} disabled={teacherPage <= 1} className="px-2 py-1 rounded text-[10px] font-black" style={{ background: palette.cream }}>Oldingi</button>
          <button onClick={() => setTeacherPage(page => Math.min(teacherPageCount, page + 1))} disabled={teacherPage >= teacherPageCount} className="px-2 py-1 rounded text-[10px] font-black" style={{ background: palette.sky, color: palette.blue }}>Keyingi</button>
          <button onClick={() => setTeacherPage(teacherPageCount)} disabled={teacherPage >= teacherPageCount} className="px-2 py-1 rounded text-[10px] font-black" style={{ background: palette.cream }}>Oxiri</button>
        </div>
      </div>

      <div className="mt-2 rounded-lg p-2 text-[10px]"
           style={{ background: palette.sky, color: palette.blue }}>
        Metod kuni qizil yoki sariq qilinsa ikkala smenadagi barcha soatlar avtomatik shu rangga kiradi.
        Bitta soatga dars qo‘ymoqchi bo‘lsangiz, aynan o‘sha raqamni bosing — u yashil ochiladi,
        qolgan soatlar bloklanganicha qoladi. Smena nomini bossangiz shu smena to‘liq ochiladi yoki holati almashadi.
      </div>

      <div className="overflow-auto max-h-[76vh] mt-2 rounded-xl border"
           style={{ borderColor: palette.line }}>
        <table
          className="border-separate border-spacing-0"
          style={{ minWidth: `${185 + weekdays * 168}px`, width: "100%" }}
        >
          <thead>
            <tr>
              <th
                className="p-1.5 text-left text-[10px] sticky top-0 left-0 z-30"
                style={{
                  background: "#F8FAFC",
                  minWidth: 185, width: 185,
                  borderBottom: `1px solid ${palette.line}`,
                }}
              >
                O‘qituvchi
              </th>
              {smartDays.slice(0, weekdays).map(([day, name]) => <th
                key={day}
                className="p-1 text-center text-[9px] sticky top-0 z-20"
                style={{
                  background: "#F8FAFC",
                  minWidth: 168, width: 168,
                  borderBottom: `1px solid ${palette.line}`,
                }}
              >
                {name}
              </th>)}
            </tr>
          </thead>

          <tbody>
            {pagedTeachers.map((teacher, rowIndex) => {
              const uid = String(teacher.user_id);
              const teacherState = states[uid] || emptyState();
              const isDirty = dirtyIds.includes(uid);

              return <tr key={uid}>
                <td
                  className="p-1.5 align-top sticky left-0 z-10"
                  style={{
                    background: rowIndex % 2 ? "#FBFCFD" : "#FFFFFF",
                    borderBottom: `1px solid ${palette.line}`,
                  }}
                >
                  <div className="flex items-start gap-1.5">
                    {!teacherOnly && <input
                      type="checkbox"
                      checked={selectedIds.includes(uid)}
                      onChange={() => toggleTeacher(uid)}
                    />}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setSelectedTeacher(uid)}
                          className="text-[11px] font-black text-left leading-tight"
                          style={{ color: palette.ink }}
                        >
                          {teacher.full_name}
                        </button>
                        {isDirty && <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-black"
                          style={{ background: palette.amberBg, color: palette.amber }}
                        >
                          SAQLANMAGAN
                        </span>}
                      </div>
                      <div className="text-[8px] mt-0.5 leading-3"
                           style={{ color: splitSubjects(teacher).length ? palette.teal : palette.red, maxHeight: 24, overflow: "hidden" }}>
                        {splitSubjects(teacher).join(", ") || "Fan belgilanmagan"}
                      </div>
                      <div className="text-[8px] mt-0.5 truncate" style={{ color: palette.muted }} title={teacherClasses(teacher)}>
                        {teacherClasses(teacher)}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <button
                          onClick={() => setSelectedTeacher(uid)}
                          className="px-1.5 py-0.5 rounded-md text-[8px] font-black"
                          style={{ background: palette.sky, color: palette.blue }}
                        >
                          Qoidalari
                        </button>
                        <button
                          onClick={() => clearTeacherTimes(uid)}
                          className="px-1.5 py-0.5 rounded-md text-[8px] font-black"
                          style={{ background: palette.redBg, color: palette.red }}
                        >
                          Vaqtlarini tozalash
                        </button>
                      </div>
                    </div>
                  </div>
                </td>

                {smartDays.slice(0, weekdays).map(([day]) => {
                  const methodLevel = teacherState.methods[day];

                  return <td
                    key={day}
                    className="p-1 align-top"
                    style={{
                      background: rowIndex % 2 ? "#FBFCFD" : "#FFFFFF",
                      borderBottom: `1px solid ${palette.line}`,
                      borderLeft: `1px solid ${palette.line}`,
                    }}
                  >
                    <button
                      onClick={() => cycleMethod(uid, day)}
                      className="w-full h-6 rounded-md border text-[8px] font-black"
                      style={levelStyle(methodLevel)}
                      title="Metod kuni: BO‘SH → QATTIQ → YUMSHOQ → BO‘SH"
                    >
                      M · {levelText(methodLevel)}
                    </button>

                    <div className="space-y-1 mt-1">
                      {shifts.map(shift => {
                        const aggregate = shiftAggregate(
                          teacherState,
                          day,
                          Number(shift.smena)
                        );

                        return <div
                          key={shift.smena}
                          className="rounded-md border p-1"
                          style={{ borderColor: palette.line, background: "#FFFFFF" }}
                        >
                          <button
                            onClick={() => cycleShift(uid, day, Number(shift.smena))}
                            className="w-full h-5 rounded border text-[7px] font-black"
                            style={levelStyle(aggregate)}
                            title={`${shift.smena}-smena to‘liq: bosganda holati almashadi`}
                          >
                            {shift.smena}S · {levelText(aggregate)}
                          </button>

                          <div
                            className="grid gap-[2px] mt-1"
                            style={{
                              gridTemplateColumns: `repeat(${Number(shift.dars_soni || 7)}, minmax(16px, 1fr))`,
                            }}
                          >
                            {Array.from(
                              { length: Number(shift.dars_soni || 7) },
                              (_, index) => index + 1
                            ).map(period => {
                              const level = effectiveSlotLevel(
                                teacherState,
                                day,
                                Number(shift.smena),
                                period
                              );

                              return <button
                                key={period}
                                onClick={() =>
                                  cycleSlot(
                                    uid,
                                    day,
                                    Number(shift.smena),
                                    period
                                  )
                                }
                                className="h-5 rounded border text-[8px] font-black p-0"
                                style={levelStyle(level)}
                                title={`${shift.smena}-smena ${period}-dars`}
                              >
                                {period}
                              </button>;
                            })}
                          </div>
                        </div>;
                      })}
                    </div>
                  </td>;
                })}
              </tr>;
            })}
          </tbody>
        </table>

        {!visibleTeachers.length && <div
          className="p-8 text-center text-sm"
          style={{ color: palette.muted }}
        >
          Tanlangan aniq fanlar bo‘yicha o‘qituvchi topilmadi.
        </div>}
      </div>
    </Card>

    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black" style={{ color: palette.ink }}>
            O‘qituvchi yuklama qoidalari
          </h2>
          <p className="text-xs mt-1" style={{ color: palette.muted }}>
            Qatordagi “Qoidalari”ni bossangiz shu o‘qituvchi tanlanadi.
          </p>
        </div>

        {!teacherOnly && <select
          value={currentRuleTeacher}
          onChange={event => setSelectedTeacher(event.target.value)}
          className="min-w-[280px] p-2.5 rounded-xl border bg-white"
        >
          <option value="">O‘qituvchini tanlang</option>
          {visibleTeachers.map(teacher => <option
            key={teacher.user_id}
            value={teacher.user_id}
          >
            {teacher.full_name} — {splitSubjects(teacher).join(", ")}
          </option>)}
        </select>}
      </div>

      {currentRuleTeacher ? <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-2 mt-4">
        {[
          ["kunlik_max", "Kunlik max", 1, 12],
          ["ketma_ket_max", "Ketma-ket max", 1, 12],
          ["okno_max", "Okno max", 0, 6],
          ["eng_erta_dars", "Eng erta dars", 1, 12],
          ["eng_kech_dars", "Eng kech dars", 1, 12],
        ].map(([field, label, min, max]) => <label
          key={field}
          className="text-xs font-bold"
          style={{ color: palette.ink }}
        >
          {label}
          <input
            type="number"
            min={min}
            max={max}
            value={currentRules[field]}
            onChange={event => updateRule(field, event.target.value)}
            className="w-full mt-1.5 p-2.5 rounded-xl border"
          />
        </label>)}

        <label className="text-xs font-bold" style={{ color: palette.ink }}>
          Afzal smena
          <select
            value={currentRules.afzal_smena}
            onChange={event => updateRule("afzal_smena", event.target.value)}
            className="w-full mt-1.5 p-2.5 rounded-xl border bg-white"
          >
            <option value={0}>Farqi yo‘q</option>
            {shifts.map(shift => <option
              key={shift.smena}
              value={shift.smena}
            >
              {shift.smena}-smena
            </option>)}
          </select>
        </label>
      </div> : <SmartNotice tone="info">O‘qituvchini tanlang.</SmartNotice>}
    </Card>
  </div>;
}


function LegacyLoadsStepV191({ token, apiBase, maktabId, setup, reload, setStep }) {
  const [classId,setClassId]=useState(String(setup?.sinflar?.[0]?.id||""));
  const [rows,setRows]=useState([]); const [newSubject,setNewSubject]=useState(""); const [roomName,setRoomName]=useState(""); const [roomType,setRoomType]=useState("reserve"); const [message,setMessage]=useState(null); const [saving,setSaving]=useState(false);
  const assignments=useMemo(()=> (setup?.birikmalar||[]).filter(x=>String(x.sinf_id)===String(classId)),[setup,classId]);
  useEffect(()=>{
    if(!classId){setRows([]);return;}
    const existing=(setup?.fan_soatlari||[]).filter(x=>String(x.sinf_id)===String(classId));
    const subjects=[...new Set([...existing.map(x=>x.fan_nomi),...assignments.map(x=>x.fan_nomi)])];
    setRows(subjects.map(subject=>{const old=existing.find(x=>String(x.fan_nomi).toLowerCase()===String(subject).toLowerCase());return old?{...old}:{fan_nomi:subject,haftalik_soat:0,kunlik_max:1,ketma_ket_mumkin:false,afzal_oxirgi_dars:5,asosiy_oqituvchi_user_id:null,xona_id:null,nazorat_soni:0,nazoratdan_keyin_tahlil:true,mustahkamlash_soni:0,ogirlik:2}}));
  },[classId,setup,assignments]);
  const update=(index,field,value)=>setRows(prev=>prev.map((r,i)=>i===index?{...r,[field]:value}:r));
  const addSubject=()=>{if(!newSubject||rows.some(r=>r.fan_nomi===newSubject))return;setRows([...rows,{fan_nomi:newSubject,haftalik_soat:0,kunlik_max:1,ketma_ket_mumkin:false,afzal_oxirgi_dars:5,asosiy_oqituvchi_user_id:null,xona_id:null,nazorat_soni:0,nazoratdan_keyin_tahlil:true,mustahkamlash_soni:0,ogirlik:2}]);setNewSubject("");};
  const save=async()=>{if(!classId)return;setSaving(true);setMessage(null);try{await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/fan_soatlari?token=${encodeURIComponent(token)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,sinf_id:Number(classId),fanlar:rows.map(r=>({...r,haftalik_soat:Number(r.haftalik_soat),kunlik_max:Number(r.kunlik_max),afzal_oxirgi_dars:Number(r.afzal_oxirgi_dars),asosiy_oqituvchi_user_id:r.asosiy_oqituvchi_user_id?Number(r.asosiy_oqituvchi_user_id):null,xona_id:r.xona_id?Number(r.xona_id):null,nazorat_soni:Number(r.nazorat_soni),mustahkamlash_soni:Number(r.mustahkamlash_soni),ogirlik:Number(r.ogirlik)}))})});setMessage({tone:"success",text:"Haftalik fan soatlari saqlandi. Guruh o‘qituvchilari 4-bosqichdagi bitta tasdiqlash oynasida boshqariladi."});await reload();}catch(e){setMessage({tone:"error",text:e.message});}finally{setSaving(false);}};
  const teacherOptions=subject=>{const ids=assignments.filter(x=>String(x.fan_nomi).toLowerCase()===String(subject).toLowerCase()).map(x=>String(x.user_id));return (setup?.oqituvchilar||[]).filter(t=>ids.includes(String(t.user_id)));};
  const addRoom=async()=>{if(!roomName.trim())return;try{await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/xona?token=${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:maktabId,nomi:roomName.trim(),turi:roomType})});setRoomName("");setMessage({tone:"success",text:"Xona qo‘shildi."});await reload();}catch(e){setMessage({tone:"error",text:e.message});}};
  return <div className="space-y-4">{message&&<SmartNotice tone={message.tone}>{message.text}</SmartNotice>}<ClassHourPanel token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} reload={reload} setStep={setStep}/><Card className="p-5"><div className="flex flex-wrap items-end gap-3 mb-3"><label className="text-xs font-bold min-w-[220px]" style={{color:palette.ink}}>Sinf<select value={classId} onChange={e=>setClassId(e.target.value)} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white" style={{borderColor:palette.line}}>{(setup?.sinflar||[]).map(c=><option key={c.id} value={c.id}>{c.sinf}-{c.harf} · {c.smena}-smena</option>)}</select></label><label className="text-xs font-bold min-w-[250px] flex-1" style={{color:palette.ink}}>Fan qo‘shish<select value={newSubject} onChange={e=>setNewSubject(e.target.value)} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white" style={{borderColor:palette.line}}><option value="">Fan tanlang</option>{(setup?.fanlar||[]).filter(f=>!rows.some(r=>r.fan_nomi===f)).map(f=><option key={f}>{f}</option>)}</select></label><button onClick={addSubject} className="px-4 py-2.5 rounded-xl text-sm font-black" style={{background:palette.sky,color:palette.blue}}>+ Fan</button><button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-black text-white" style={{background:palette.blue}}>{saving?"...":"Saqlash"}</button></div><div className="flex flex-wrap gap-2 items-end mb-5"><label className="text-xs font-bold flex-1 min-w-[230px]" style={{color:palette.ink}}>Maxsus xona qo‘shish<input value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="Masalan: Ingliz tili zaxira xonasi" className="w-full mt-1.5 p-2.5 rounded-xl border" style={{borderColor:palette.line}}/></label><label className="text-xs font-bold min-w-[210px]" style={{color:palette.ink}}>Xona turi<select value={roomType} onChange={e=>setRoomType(e.target.value)} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white" style={{borderColor:palette.line}}><option value="reserve">Zaxira / guruh xonasi</option><option value="sport">Sport zal</option><option value="classroom">Oddiy dars xonasi</option><option value="non_teaching">Dars o‘tilmaydigan xona</option></select></label><button onClick={addRoom} className="px-4 py-2.5 rounded-xl text-sm font-black" style={{background:palette.cream,color:palette.ink}}>+ Xona</button></div>
  <div className="overflow-auto"><table className="min-w-[1250px] w-full text-xs"><thead><tr className="text-left" style={{color:palette.muted}}><th className="p-2">Fan</th><th>Haftalik</th><th>Kunlik max</th><th>Ketma-ket</th><th>Oxirgi afzal</th><th>Asosiy o‘qituvchi</th><th>Xona</th><th>Nazorat</th><th>Tahlil</th><th>Mustahkamlash</th><th>Og‘irlik</th><th></th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.fan_nomi} className="border-t" style={{borderColor:palette.line}}><td className="p-2 font-black" style={{color:palette.ink}}>{r.fan_nomi}</td><td><input type="number" min="0" max="20" value={r.haftalik_soat} onChange={e=>update(i,"haftalik_soat",e.target.value)} className="w-20 p-2 rounded-lg border"/></td><td><input type="number" min="1" max="4" value={r.kunlik_max} onChange={e=>update(i,"kunlik_max",e.target.value)} className="w-20 p-2 rounded-lg border"/></td><td><input type="checkbox" checked={Boolean(r.ketma_ket_mumkin)} onChange={e=>update(i,"ketma_ket_mumkin",e.target.checked)}/></td><td><input type="number" min="1" max="12" value={r.afzal_oxirgi_dars} onChange={e=>update(i,"afzal_oxirgi_dars",e.target.value)} className="w-20 p-2 rounded-lg border"/></td><td><select value={r.asosiy_oqituvchi_user_id||""} onChange={e=>update(i,"asosiy_oqituvchi_user_id",e.target.value)} className="w-52 p-2 rounded-lg border bg-white"><option value="">Avto / guruhlar</option>{teacherOptions(r.fan_nomi).map(t=><option key={t.user_id} value={t.user_id}>{t.full_name}</option>)}</select></td><td><select value={r.xona_id||""} onChange={e=>update(i,"xona_id",e.target.value)} className="w-40 p-2 rounded-lg border bg-white"><option value="">Sinf xonasi</option>{(setup?.xonalar||[]).map(x=><option key={x.id} value={x.id}>{x.nomi}</option>)}</select></td><td><input type="number" min="0" max="10" value={r.nazorat_soni} onChange={e=>update(i,"nazorat_soni",e.target.value)} className="w-20 p-2 rounded-lg border"/></td><td><input type="checkbox" checked={Boolean(r.nazoratdan_keyin_tahlil)} onChange={e=>update(i,"nazoratdan_keyin_tahlil",e.target.checked)}/></td><td><input type="number" min="0" max="20" value={r.mustahkamlash_soni} onChange={e=>update(i,"mustahkamlash_soni",e.target.value)} className="w-20 p-2 rounded-lg border"/></td><td><select value={r.ogirlik} onChange={e=>update(i,"ogirlik",e.target.value)} className="w-24 p-2 rounded-lg border bg-white"><option value={1}>Yengil</option><option value={2}>O‘rta</option><option value={3}>Og‘ir</option></select></td><td><button onClick={()=>setRows(rows.filter((_,x)=>x!==i))} className="text-red-700 font-black">O‘chir</button></td></tr>)}</tbody></table></div>{!rows.length&&<SmartNotice tone="warning">Bu sinfga fan–o‘qituvchi birikmasi topilmadi. Fan qo‘shib, haftalik soatini kiriting.</SmartNotice>}
  <div className="mt-5 rounded-2xl p-4" style={{background:palette.sky,color:palette.blue}}><div className="text-sm font-black">Guruh o‘qituvchilari alohida tasdiqlanadi</div><div className="text-xs mt-1 leading-relaxed">Ingliz tili 1/2-guruh, Texnologiya yoki Jismoniy tarbiya o‘g‘il/qiz guruhlari uchun qaysi guruhga qaysi o‘qituvchi kirishini 4-bosqichdagi “Guruh va o‘qituvchilarni tasdiqlash” oynasida barcha sinflar bo‘yicha birga ko‘rasiz va almashtira olasiz.</div></div>
  </Card></div>;
}


function emptyTeacherLoadRowV192(matrix) {
  const firstClass = matrix?.sinflar?.[0];
  const approved = matrix?.oquv_reja?.holat === "tasdiqlangan";
  const firstPlan = approved && (matrix?.oquv_reja?.qatorlar || []).find(
    item => String(item.sinf_id) === String(firstClass?.id)
  );
  const configured = (matrix?.fan_sinflari || []).find(
    item => String(item.sinf_id) === String(firstClass?.id)
  )?.fanlar?.[0];
  return {
    sinf_id: String(firstClass?.id || ""),
    fan_nomi: String(firstPlan?.fan_nomi || configured || matrix?.fanlar?.[0] || ""),
    guruh_kaliti: "whole",
    haftalik_soat: approved ? Number(firstPlan?.haftalik_soat || "") : "",
    kunlik_max: Number(firstPlan?.kunlik_max || 1),
    xona_id: "",
    is_placeholder: true,
  };
}

function subjectKeyV193(value) {
  return String(value || "")
    .toLocaleLowerCase("uz")
    .replace(/[‘’ʻʼ`']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function groupedSubjectFamilyV195(value) {
  const key = subjectKeyV193(value);
  if (/chet tili|ingliz tili|english|nemis tili|fransuz tili/.test(key)) return "chet_tili";
  if (/rus tili|russki/.test(key)) return "rus_tili";
  if (/informatika|axborot texnolog/.test(key)) return "informatika";
  if (/jismoniy tarbiya|fizkultura|sport/.test(key)) return "jismoniy";
  if (/texnologiya|mehnat/.test(key)) return "texnologiya";
  return key;
}

function groupedSubjectMatchesV195(left, right) {
  const leftKey = subjectKeyV193(left);
  const rightKey = subjectKeyV193(right);
  if (!leftKey || !rightKey) return false;
  return leftKey === rightKey || groupedSubjectFamilyV195(leftKey) === groupedSubjectFamilyV195(rightKey);
}

function primaryTeacherCanTeachV193(subject) {
  const key = subjectKeyV193(subject);
  if (/informatika|axborot texnolog|jismoniy tarbiya|fizkultura|sport/.test(key)) return true;
  return ![
    "musiqa", "tarbiya", "chet tili", "ingliz tili", "rus tili",
    "tasviriy san'at", "rasm",
  ].some(blocked => key.includes(blocked));
}

const teacherSpecialtiesV194 = [
  { value: "boshlangich", label: "Boshlang‘ich ta’lim", subjects: [] },
  { value: "matematika", label: "Matematika", subjects: ["matematika", "algebra", "geometriya"] },
  { value: "informatika", label: "Informatika va axborot texnologiyalari", subjects: ["informatika", "axborot texnologiyalari", "informatika va axborot texnologiyalari"] },
  { value: "fizika", label: "Fizika va astronomiya", subjects: ["fizika", "astronomiya"] },
  { value: "kimyo", label: "Kimyo", subjects: ["kimyo"] },
  { value: "biologiya", label: "Biologiya va tabiiy fanlar", subjects: ["biologiya", "tabiiy fan", "tabiiy fanlar"] },
  { value: "geografiya", label: "Geografiya", subjects: ["geografiya"] },
  { value: "iqtisod", label: "Iqtisodiy bilim asoslari", subjects: ["iqtisod", "iqtisodiy bilim asoslari", "tadbirkorlik asoslari"] },
  { value: "tarix", label: "Tarix", subjects: ["tarixdan hikoyalar", "qadimgi dunyo tarixi", "o'zbekiston tarixi", "jahon tarixi", "tarix"] },
  { value: "ozbek_tili", label: "O‘zbek tili va adabiyoti", subjects: ["o'zbek tili", "ona tili", "adabiyot", "o'qish savodxonligi"] },
  { value: "rus_tili", label: "Rus tili va adabiyoti", subjects: ["rus tili", "rus adabiyoti"] },
  { value: "ingliz_tili", label: "Xorijiy til va adabiyoti: ingliz tili", subjects: ["chet tili", "ingliz tili", "english"] },
  { value: "nemis_tili", label: "Xorijiy til va adabiyoti: nemis tili", subjects: ["nemis tili", "german"] },
  { value: "fransuz_tili", label: "Xorijiy til va adabiyoti: fransuz tili", subjects: ["fransuz tili", "french"] },
  { value: "chet_tili", label: "Xorijiy til va adabiyoti (tili ko‘rsatilmagan)", subjects: ["chet tili", "ingliz tili", "nemis tili", "fransuz tili", "english", "german", "french"] },
  { value: "tasviriy_grafika", label: "Tasviriy san’at va muhandislik grafikasi", subjects: ["tasviriy san'at", "rasm", "chizmachilik", "muhandislik grafikasi"] },
  { value: "musiqa", label: "Musiqa ta’limi", subjects: ["musiqa madaniyati", "musiqa"] },
  { value: "texnologiya", label: "Texnologik ta’lim", subjects: ["texnologiya", "mehnat"] },
  { value: "milliy_goya_huquq", label: "Milliy g‘oya, ma’naviyat asoslari va huquq ta’limi", subjects: ["tarbiya", "davlat va huquq asoslari", "huquq", "ma'naviyat asoslari", "milliy g'oya"] },
  { value: "jismoniy", label: "Jismoniy madaniyat", subjects: ["jismoniy tarbiya", "sport"] },
  { value: "chqbt", label: "Chaqiriqqacha harbiy ta’lim", subjects: ["chaqiruvga qadar boshlang'ich tayyorgarlik", "chaqiriqqacha harbiy ta'lim", "chqbt"] },
  { value: "pedagogika", label: "Pedagogika va psixologiya", subjects: ["pedagogika", "psixologiya"] },
];

const legacySpecialtyAliasesV195 = {
  ona_tili: "ozbek_tili",
  tarbiya_huquq: "milliy_goya_huquq",
  tasviriy: "tasviriy_grafika",
};

const specialtyColorsV195 = [
  { strong: "#155A7A", soft: "#EDF5FB", line: "#8BB9D2" },
  { strong: "#0F7C82", soft: "#EAF7F4", line: "#83C7C5" },
  { strong: "#A96A14", soft: "#FFF4DE", line: "#E5BC76" },
];

const specialtyClassQuickRangesV195 = [
  { key: "all", label: "Barcha sinflar", all: true },
  { key: "1_4", label: "1–4-sinflar", min: 1, max: 4 },
  { key: "5_7", label: "5–7-sinflar", min: 5, max: 7 },
  { key: "8_9", label: "8–9-sinflar", min: 8, max: 9 },
  { key: "10_11", label: "10–11-sinflar", min: 10, max: 11 },
];

function normalizedSpecialtyValueV195(value) {
  const key = String(value || "").trim();
  return legacySpecialtyAliasesV195[key] || key;
}

function specialtyOptionV194(value, options = teacherSpecialtiesV194) {
  const firstValue = specialtyValuesV195(value)[0] || "";
  return options.find(item => item.value === firstValue);
}

function specialtyValuesV195(value) {
  return [...new Set(String(value || "").split(";").map(normalizedSpecialtyValueV195).filter(Boolean))].slice(0, 3);
}

function specialtyLabelV195(value, options = teacherSpecialtiesV194) {
  const labels = specialtyValuesV195(value).map(item =>
    options.find(option => option.value === item)?.label || item
  );
  return labels.join(" + ");
}

function specialtyMatchesSubjectV194(specialtyValue, subject, options = teacherSpecialtiesV194) {
  return specialtyValuesV195(specialtyValue).some(specialtyKey => {
    const option = options.find(item => item.value === specialtyKey);
    if (!option) return false;
    if (option.value === "boshlangich") return primaryTeacherCanTeachV193(subject);
    const key = subjectKeyV193(subject);
    return option.subjects.some(item => {
      const needle = subjectKeyV193(item);
      return key === needle || key.includes(needle) || needle.includes(key);
    });
  });
}

function TeacherFirstLoadEditorV192({
  token, apiBase, maktabId, onChanged, startWithNew = false,
  planOnly = false, showPlan = true,
}) {
  const [data, setData] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [query, setQuery] = useState("");
  const [creatingNew, setCreatingNew] = useState(Boolean(startWithNew));
  const [newTeacher, setNewTeacher] = useState({
    full_name: "", mutaxassisligi: "", haftalik_maqsad_soat: "",
    tugilgan_yili: "", ish_staji: "", toifasi: "", rahbar_sinf_id: "",
  });
  const [existingProfile, setExistingProfile] = useState({
    mutaxassisligi: "", haftalik_maqsad_soat: "",
  });
  const [autoSpecialty, setAutoSpecialty] = useState(true);
  const [specialtyClassIdsByValue, setSpecialtyClassIdsByValue] = useState({});
  const [activeAutoSpecialty, setActiveAutoSpecialty] = useState("");
  const [entryCode, setEntryCode] = useState("");
  const [recentlyCreatedTeacherId, setRecentlyCreatedTeacherId] = useState("");
  const [planSubjects, setPlanSubjects] = useState([]);
  const [planCells, setPlanCells] = useState({});
  const [planSaving, setPlanSaving] = useState(false);
  const [planMessage, setPlanMessage] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deletingTeacher, setDeletingTeacher] = useState(false);
  const [planReferenceOpen, setPlanReferenceOpen] = useState(false);
  const [planReferenceClassId, setPlanReferenceClassId] = useState("");
  const [allocationInspectorClassId, setAllocationInspectorClassId] = useState("");
  const [allocationInspectorSubjectKey, setAllocationInspectorSubjectKey] = useState("");
  const [allocationOverviewOpen, setAllocationOverviewOpen] = useState(false);
  const [customSpecialties, setCustomSpecialties] = useState([]);
  const [specialtyCreatorOpen, setSpecialtyCreatorOpen] = useState(false);
  const [specialtyDraft, setSpecialtyDraft] = useState({ label: "", subjects: [] });
  const [specialtyDraftError, setSpecialtyDraftError] = useState("");
  const specialtyOptions = useMemo(
    () => [...teacherSpecialtiesV194, ...customSpecialties],
    [customSpecialties]
  );
  const specialtySubjectChoices = useMemo(() => {
    const unique = new Map();
    [...(data?.fanlar || []), ...planSubjects].forEach(subject => {
      const key = subjectKeyV193(subject);
      if (key && !unique.has(key)) unique.set(key, subject);
    });
    return [...unique.values()].sort((left, right) => String(left).localeCompare(String(right), "uz"));
  }, [data, planSubjects]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(`samtm_custom_specialties_v195_${maktabId}`) || "[]");
      setCustomSpecialties(Array.isArray(saved) ? saved.filter(item =>
        item && item.value && item.label && Array.isArray(item.subjects)
      ) : []);
    } catch {
      setCustomSpecialties([]);
    }
  }, [maktabId]);

  const load = async () => {
    setLoading(true);
    try {
      const result = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v3/yuklama_matritsasi?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`
      );
      setData(result);
      if (startWithNew) {
        setCreatingNew(true);
        setSelectedTeacher("");
        setRows([emptyTeacherLoadRowV192(result)]);
      } else {
        setSelectedTeacher(current =>
          current || String(result.oqituvchilar?.[0]?.user_id || "")
        );
      }
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [maktabId, token, apiBase]);

  useEffect(() => {
    if (!planReferenceOpen && !allocationInspectorClassId) return undefined;
    const oldOverflow = document.body.style.overflow;
    const closeOnEscape = event => {
      if (event.key !== "Escape") return;
      setPlanReferenceOpen(false);
      setAllocationInspectorClassId("");
      setAllocationInspectorSubjectKey("");
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [planReferenceOpen, allocationInspectorClassId]);

  useEffect(() => {
    if (!data) return;
    const templateRows = data.oquv_reja?.andoza_qatorlar || [];
    const savedRows = data.oquv_reja?.qatorlar || [];
    const subjectMap = new Map();
    [...templateRows, ...savedRows].forEach(item => {
      const key = subjectKeyV193(item.fan_nomi);
      if (key && !subjectMap.has(key)) subjectMap.set(key, item.fan_nomi);
    });
    (data.fanlar || []).forEach(subject => {
      const key = subjectKeyV193(subject);
      if (key && !subjectMap.has(key)) subjectMap.set(key, subject);
    });
    setPlanSubjects([...subjectMap.values()]);
    const sourceRows = savedRows.length ? savedRows : templateRows;
    const nextCells = {};
    sourceRows.forEach(item => {
      nextCells[`${item.sinf_id}|${subjectKeyV193(item.fan_nomi)}`] = Number(item.haftalik_soat || 0);
    });
    setPlanCells(nextCells);
  }, [data]);

  useEffect(() => {
    if (!data || creatingNew) {
      return;
    }
    if (!selectedTeacher) {
      setRows([]);
      return;
    }
    setRows(
      (data.birikmalar || [])
        .filter(row => String(row.user_id) === String(selectedTeacher))
        .map(row => ({
          sinf_id: String(row.sinf_id),
          fan_nomi: row.fan_nomi,
          guruh_kaliti: row.guruh_kaliti || "whole",
          haftalik_soat: Number(row.haftalik_soat || 1),
          kunlik_max: Number(row.kunlik_max || 1),
          xona_id: row.xona_id ? String(row.xona_id) : "",
          auto_specialty: false,
        }))
    );
  }, [data, selectedTeacher, creatingNew]);

  useEffect(() => {
    if (!data || creatingNew || !selectedTeacher) return;
    const current = (data.oqituvchilar || []).find(
      item => String(item.user_id) === String(selectedTeacher)
    );
    setExistingProfile({
      mutaxassisligi: String(current?.mutaxassisligi || ""),
      haftalik_maqsad_soat: current?.haftalik_maqsad_soat == null
        ? "" : String(current.haftalik_maqsad_soat),
    });
    const values = specialtyValuesV195(current?.mutaxassisligi);
    const teacherRows = (data.birikmalar || []).filter(
      row => String(row.user_id) === String(selectedTeacher)
    );
    const inferredClassIds = {};
    values.forEach(value => {
      inferredClassIds[value] = [...new Set(teacherRows
        .filter(row => specialtyMatchesSubjectV194(value, row.fan_nomi, specialtyOptions))
        .map(row => String(row.sinf_id))
      )];
    });
    setSpecialtyClassIdsByValue(inferredClassIds);
    setActiveAutoSpecialty(values[0] || "");
    setAutoSpecialty(true);
  }, [data, selectedTeacher, creatingNew, specialtyOptions]);

  const variantsForClass = classId =>
    (data?.guruh_variantlari || []).filter(
      item => String(item.sinf_id) === String(classId)
    );

  const update = (index, changes) => {
    setRows(current => current.map((row, rowIndex) =>
      rowIndex === index
        ? { ...row, ...changes, is_placeholder: false, auto_specialty: false }
        : row
    ));
  };

  const variantFor = row =>
    variantsForClass(row.sinf_id).find(
      item => String(item.guruh_kaliti) === String(row.guruh_kaliti)
    );

  const planForClass = classId =>
    (data?.oquv_reja?.qatorlar || []).filter(
      item => String(item.sinf_id) === String(classId)
    );

  const planItemFor = (classId, subject) =>
    planForClass(classId).find(
      item => subjectKeyV193(item.fan_nomi) === subjectKeyV193(subject)
    );

  const allocationKey = row => [
    String(row?.sinf_id || ""),
    subjectKeyV193(row?.fan_nomi),
    String(row?.guruh_kaliti || "whole"),
  ].join("|");

  const allocationInfo = (index, candidate, sourceRows = rows) => {
    const planItem = planItemFor(candidate?.sinf_id, candidate?.fan_nomi);
    const approved = data?.oquv_reja?.holat === "tasdiqlangan";
    const planHours = approved ? Number(planItem?.haftalik_soat || 0) : 20;
    const key = allocationKey(candidate);
    const currentTeacherId = creatingNew ? null : String(selectedTeacher || "");
    const outsideRows = (data?.birikmalar || []).filter(item =>
      allocationKey(item) === key &&
      (!currentTeacherId || String(item.user_id) !== currentTeacherId)
    );
    const outsideHours = outsideRows.reduce(
      (sum, item) => sum + Number(item.haftalik_soat || 0), 0
    );
    const draftOtherHours = sourceRows.reduce((sum, item, itemIndex) =>
      itemIndex !== index && allocationKey(item) === key
        ? sum + Number(item.haftalik_soat || 0) : sum, 0
    );
    const maxForRow = approved
      ? Math.max(0, planHours - outsideHours - draftOtherHours)
      : 20;
    const currentHours = Number(candidate?.haftalik_soat || 0);
    return {
      approved, planHours, outsideHours, draftOtherHours, maxForRow,
      currentHours, remainingAfterRow: Math.max(0, maxForRow - currentHours),
      outsideNames: [...new Set(outsideRows.map(item => item.full_name).filter(Boolean))],
    };
  };

  const mergeDuplicateRows = sourceRows => {
    const merged = new Map();
    sourceRows.forEach(row => {
      const key = allocationKey(row);
      const current = merged.get(key);
      if (!current) {
        merged.set(key, { ...row });
        return;
      }
      current.haftalik_soat = Number(current.haftalik_soat || 0) + Number(row.haftalik_soat || 0);
      current.kunlik_max = Math.max(Number(current.kunlik_max || 1), Number(row.kunlik_max || 1));
      if (!current.xona_id && row.xona_id) current.xona_id = row.xona_id;
      current.auto_specialty = Boolean(current.auto_specialty && row.auto_specialty);
      current.is_placeholder = false;
    });
    return [...merged.values()];
  };

  const subjectsFor = row => {
    const variant = variantFor(row);
    const allowed = variant?.fanlar || [];
    const approved = data?.oquv_reja?.holat === "tasdiqlangan";
    const configured = (data?.fan_sinflari || []).find(
      item => String(item.sinf_id) === String(row.sinf_id)
    )?.fanlar || [];
    const planned = approved
      ? planForClass(row.sinf_id).map(item => item.fan_nomi)
      : configured;
    if (allowed.length) {
      const intersection = planned.filter(subject =>
        allowed.some(item => groupedSubjectMatchesV195(item, subject))
      );
      return planned.length ? intersection : allowed;
    }
    return planned.length ? planned : (data?.fanlar || []);
  };

  const applyRowChoice = (index, changes) => {
    const current = rows[index] || {};
    const candidate = { ...current, ...changes };
    const planItem = planItemFor(candidate.sinf_id, candidate.fan_nomi);
    const preferred = data?.oquv_reja?.holat === "tasdiqlangan"
      ? Number(planItem?.haftalik_soat || candidate.haftalik_soat || 1)
      : Number(candidate.haftalik_soat || 1);
    const info = allocationInfo(index, candidate);
    if (info.approved && info.maxForRow <= 0) {
      const cls = (data?.sinflar || []).find(item => String(item.id) === String(candidate.sinf_id));
      setMessage({
        tone: "warning",
        text: `${cls ? `${cls.sinf}-${cls.harf}` : "Bu sinf"} / ${candidate.fan_nomi}: reja ${info.planHours} soat va hammasi oldin tanlangan. Boshqa fan yoki guruhni tanlang.`,
      });
      return;
    }
    update(index, {
      ...changes,
      haftalik_soat: info.approved ? Math.min(preferred, info.maxForRow) : preferred,
      kunlik_max: Number(planItem?.kunlik_max || candidate.kunlik_max || 1),
    });
    if (info.approved && info.maxForRow < info.planHours) {
      setMessage({
        tone: "warning",
        text: `${candidate.fan_nomi}: reja ${info.planHours} soat; oldingi tanlovlardan keyin ${info.maxForRow} soat qoldi.`,
      });
    }
  };

  const planCellKey = (classId, subject) => `${classId}|${subjectKeyV193(subject)}`;

  const updatePlanCell = (classId, subject, value) => {
    const numeric = value === "" ? 0 : Math.round(Math.max(0, Math.min(20, Number(value) || 0)) * 2) / 2;
    setPlanCells(current => ({ ...current, [planCellKey(classId, subject)]: numeric }));
  };

  const renamePlanSubject = (index, nextName) => {
    const oldName = planSubjects[index];
    setPlanSubjects(current => current.map((subject, subjectIndex) =>
      subjectIndex === index ? nextName : subject
    ));
    if (subjectKeyV193(oldName) === subjectKeyV193(nextName)) return;
    setPlanCells(current => {
      const next = { ...current };
      (data?.sinflar || []).forEach(cls => {
        const oldKey = planCellKey(cls.id, oldName);
        const nextKey = planCellKey(cls.id, nextName);
        if (Object.prototype.hasOwnProperty.call(next, oldKey)) {
          next[nextKey] = next[oldKey];
          delete next[oldKey];
        }
      });
      return next;
    });
  };

  const addPlanSubject = () => {
    const used = new Set(planSubjects.map(subjectKeyV193));
    const subject = (data?.fanlar || []).find(item => !used.has(subjectKeyV193(item))) || "Yangi fan";
    setPlanSubjects(current => [...current, subject]);
  };

  const removePlanSubject = subject => {
    setPlanSubjects(current => current.filter(item => item !== subject));
    setPlanCells(current => {
      const next = { ...current };
      (data?.sinflar || []).forEach(cls => delete next[planCellKey(cls.id, subject)]);
      return next;
    });
  };

  const autoFillPlanTemplate = () => {
    const templateRows = data?.oquv_reja?.andoza_qatorlar || [];
    if (!templateRows.length) {
      return setPlanMessage({ tone: "error", text: "Avtomatik andoza backenddan kelmadi. Yangilangan backend kodini ham deploy qiling." });
    }
    const nextCells = {};
    templateRows.forEach(item => {
      nextCells[planCellKey(item.sinf_id, item.fan_nomi)] = Number(item.haftalik_soat || 0);
    });
    const subjectMap = new Map(planSubjects.map(subject => [subjectKeyV193(subject), subject]));
    templateRows.forEach(item => {
      const key = subjectKeyV193(item.fan_nomi);
      if (!subjectMap.has(key)) subjectMap.set(key, item.fan_nomi);
    });
    setPlanSubjects([...subjectMap.values()]);
    setPlanCells(nextCells);
    setPlanMessage({
      tone: "success",
      text: `Rasmiy tayanch reja faqat maktabda tanlangan fan–sinflarga avtomatik qo‘yildi. Istalgan soatni tuzatishingiz mumkin.`,
    });
  };

  const planPayloadRows = () => {
    const seenSubjects = new Set();
    const rows = [];
    planSubjects.forEach(subject => {
      const cleanSubject = String(subject || "").replace(/\s+/g, " ").trim();
      const subjectKey = subjectKeyV193(cleanSubject);
      if (!subjectKey || seenSubjects.has(subjectKey)) return;
      seenSubjects.add(subjectKey);
      (data?.sinflar || []).forEach(cls => {
        const hours = Number(planCells[planCellKey(cls.id, cleanSubject)] || 0);
        if (hours > 0) rows.push({
          sinf_id: Number(cls.id),
          fan_nomi: cleanSubject,
          haftalik_soat: hours,
          kunlik_max: 1,
        });
      });
    });
    return rows;
  };

  const savePlan = async (approve = false) => {
    if (!(data?.sinflar || []).length) {
      return setPlanMessage({ tone: "error", text: "Sinf ro‘yxati kelmadi. Backenddagi samtm_school.py faylini ham yangilang." });
    }
    if (!planSubjects.length || planSubjects.some(subject => !String(subject || "").trim())) {
      return setPlanMessage({ tone: "error", text: "Fan nomlari bo‘sh qolmasligi kerak." });
    }
    const normalized = planSubjects.map(subjectKeyV193).filter(Boolean);
    if (new Set(normalized).size !== normalized.length) {
      return setPlanMessage({ tone: "error", text: "Bir xil fan ikki marta yozilgan. Takror fanlardan birini o‘chiring." });
    }
    const qatorlar = planPayloadRows();
    if (!qatorlar.length) {
      return setPlanMessage({ tone: "error", text: "Hech bir sinf–fan kesishmasiga haftalik soat yozilmagan." });
    }
    const emptyClasses = (data?.sinflar || []).filter(cls =>
      !qatorlar.some(row => String(row.sinf_id) === String(cls.id))
    );
    if (approve && emptyClasses.length) {
      return setPlanMessage({
        tone: "error",
        text: `Soati kiritilmagan sinflar: ${emptyClasses.map(cls => `${cls.sinf}-${cls.harf}`).join(", ")}`,
      });
    }
    setPlanSaving(true);
    setPlanMessage(null);
    try {
      const saved = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v3/oquv_reja/matritsa?token=${encodeURIComponent(token)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maktab_id: maktabId, qatorlar }),
        }
      );
      let nextMatrix = saved.matritsa;
      let approvalWarnings = [];
      if (approve) {
        const approved = await smartFetch(
          `${apiBase}/api/maktab/aqlli_jadval/v3/oquv_reja/tasdiqlash?token=${encodeURIComponent(token)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ maktab_id: maktabId }),
          }
        );
        nextMatrix = approved.matritsa;
        approvalWarnings = approved.ogohlantirishlar || [];
      }
      setData(nextMatrix);
      setPlanMessage({
        tone: "success",
        text: approve
          ? `${data?.sinflar?.length || 0} ta sinfning fan–soat matritsasi saqlandi va tasdiqlandi.${approvalWarnings.length ? ` ${approvalWarnings.join("; ")}` : ""}`
          : `Barcha sinflarning ${qatorlar.length} ta fan–soat kesishmasi vaqtincha saqlandi. Reja hali tasdiqlanmadi va dars jadvaliga kiritilmadi.`,
      });
      await onChanged?.();
    } catch (error) {
      setPlanMessage({ tone: "error", text: error.message });
    } finally {
      setPlanSaving(false);
    }
  };

  const addPrimaryTeacherPlan = () => {
    const classId = newTeacher.rahbar_sinf_id;
    const classRow = (data?.sinflar || []).find(item => String(item.id) === String(classId));
    const grade = Number(String(classRow?.sinf || "").match(/\d+/)?.[0] || 0);
    if (!classId || grade < 1 || grade > 4) {
      return setMessage({ tone: "error", text: "Avval 1–4-sinflardan sinf rahbarligini tanlang." });
    }
    if (data?.oquv_reja?.holat !== "tasdiqlangan") {
      return setMessage({ tone: "warning", text: "Bu avtomatik tugma uchun o‘quv reja tasdiqlanishi kerak. Pastdagi fan–sinf qatorlarini esa hozirning o‘zida qo‘lda kiritishingiz mumkin." });
    }
    const additions = planForClass(classId)
      .filter(item => primaryTeacherCanTeachV193(item.fan_nomi))
      .map(item => ({
        sinf_id: String(classId),
        fan_nomi: item.fan_nomi,
        guruh_kaliti: "whole",
        haftalik_soat: Number(item.haftalik_soat),
        kunlik_max: Number(item.kunlik_max || 1),
        xona_id: "",
        is_placeholder: false,
      }));
    if (!additions.length) {
      return setMessage({ tone: "warning", text: "Bu sinf uchun boshlang‘ich o‘qituvchiga mos reja fani topilmadi." });
    }
    const additionKeys = new Set(additions.map(row => `${row.sinf_id}|${subjectKeyV193(row.fan_nomi)}|whole`));
    setRows(current => [
      ...current.filter(row => {
        if (row.is_placeholder) return false;
        const key = `${row.sinf_id}|${subjectKeyV193(row.fan_nomi)}|${row.guruh_kaliti || "whole"}`;
        return !additionKeys.has(key);
      }),
      ...additions,
    ]);
    setMessage({
      tone: "success",
      text: `${classRow.sinf}-${classRow.harf}: ${additions.length} ta mos fan tasdiqlangan reja soati bilan qo‘shildi. Informatika va Jismoniy tarbiya reja mavjud bo‘lsa qo‘shiladi; Musiqa, Tarbiya, chet/rus tili va Tasviriy san’at qo‘shilmaydi.`,
    });
  };

  const activeSpecialty = () => creatingNew
    ? newTeacher.mutaxassisligi
    : existingProfile.mutaxassisligi;

  const activeSpecialtyValues = specialtyValuesV195(activeSpecialty());
  const resolvedAutoSpecialty = activeSpecialtyValues.includes(activeAutoSpecialty)
    ? activeAutoSpecialty
    : activeSpecialtyValues[0] || "";
  const specialtyClassIds = specialtyClassIdsByValue[resolvedAutoSpecialty] || [];
  const activeSpecialtyIndex = Math.max(0, activeSpecialtyValues.indexOf(resolvedAutoSpecialty));
  const activeSpecialtyTone = specialtyColorsV195[activeSpecialtyIndex % specialtyColorsV195.length];

  const setActiveProfile = changes => {
    if (creatingNew) {
      setNewTeacher(current => ({ ...current, ...changes }));
    } else {
      setExistingProfile(current => ({ ...current, ...changes }));
    }
  };

  const autoRowsForSpecialty = (classIds, specialtyValue, options = specialtyOptions) => {
    const result = [];
    const seen = new Set();
    classIds.forEach(classId => {
      planForClass(classId)
        .filter(item => specialtyMatchesSubjectV194(specialtyValue, item.fan_nomi, options))
        .forEach(item => {
          const grouped = variantsForClass(classId).filter(variant =>
            variant.guruh_kaliti !== "whole" &&
            (variant.fanlar || []).some(subject =>
              groupedSubjectMatchesV195(subject, item.fan_nomi)
            )
          );
          const targets = grouped.length
            ? grouped
            : [{ guruh_kaliti: "whole" }];
          targets.forEach(variant => {
            const key = `${classId}|${subjectKeyV193(item.fan_nomi)}|${variant.guruh_kaliti}`;
            if (seen.has(key)) return;
            seen.add(key);
            const candidate = {
              sinf_id: String(classId),
              fan_nomi: item.fan_nomi,
              guruh_kaliti: variant.guruh_kaliti,
              haftalik_soat: Number(item.haftalik_soat),
              kunlik_max: Number(item.kunlik_max || 1),
              xona_id: "",
              is_placeholder: false,
              auto_specialty: true,
              auto_specialty_value: specialtyValue,
            };
            const info = allocationInfo(result.length, candidate, result);
            if (!info.approved || info.maxForRow > 0) {
              candidate.haftalik_soat = info.approved
                ? Math.min(candidate.haftalik_soat, info.maxForRow)
                : candidate.haftalik_soat;
              result.push(candidate);
            }
          });
        });
    });
    return result;
  };

  const rebuildSpecialtyAuto = (
    nextClassMap,
    nextSpecialty = activeSpecialty(),
    options = specialtyOptions,
    focusSpecialty = resolvedAutoSpecialty,
    enabled = autoSpecialty
  ) => {
    const selectedValues = specialtyValuesV195(nextSpecialty);
    const normalizedMap = {};
    selectedValues.forEach(value => {
      normalizedMap[value] = [...new Set((nextClassMap[value] || []).map(String))];
    });
    setSpecialtyClassIdsByValue(normalizedMap);
    if (!enabled) return;
    if (data?.oquv_reja?.holat !== "tasdiqlangan") {
      setMessage({
        tone: "warning",
        text: "Mutaxassislik bo‘yicha avtomatik fan va soat uchun o‘quv rejani tasdiqlang. Qo‘lda qator kiritish ochiq qoladi.",
      });
      return;
    }
    const generated = [];
    const generatedKeys = new Set();
    selectedValues.forEach(value => {
      autoRowsForSpecialty(normalizedMap[value] || [], value, options).forEach(row => {
        const key = `${row.sinf_id}|${subjectKeyV193(row.fan_nomi)}|${row.guruh_kaliti || "whole"}`;
        if (generatedKeys.has(key)) return;
        generatedKeys.add(key);
        generated.push({ ...row, auto_specialty_value: value });
      });
    });
    setRows(current => {
      const manualRows = current.filter(row => !row.auto_specialty && !row.is_placeholder);
      const manualKeys = new Set(manualRows.map(row =>
        `${row.sinf_id}|${subjectKeyV193(row.fan_nomi)}|${row.guruh_kaliti || "whole"}`
      ));
      const available = generated.filter(row => !manualKeys.has(
          `${row.sinf_id}|${subjectKeyV193(row.fan_nomi)}|${row.guruh_kaliti || "whole"}`
      ));
      return [...manualRows, ...available];
    });
    const focusCount = generated.filter(row => row.auto_specialty_value === focusSpecialty).length;
    setMessage(generated.length ? {
      tone: "success",
      text: `${specialtyLabelV195(focusSpecialty, options) || "Mutaxassislik"}: ${focusCount} ta qator. Barcha mutaxassisliklar bo‘yicha jami ${generated.length} ta fan–sinf qatori saqlandi.`,
    } : {
      tone: "warning",
      text: "Tanlangan mutaxassislik va sinflarning tasdiqlangan rejasida mos fan topilmadi.",
    });
  };

  const applySpecialtyAuto = (
    nextClassIds,
    specialtyValue = resolvedAutoSpecialty,
    nextSpecialty = activeSpecialty(),
    options = specialtyOptions,
    enabled = autoSpecialty
  ) => {
    if (!specialtyValue) {
      setMessage({ tone: "warning", text: "Avval yuqoridan mutaxassislikni tanlang." });
      return;
    }
    const nextMap = {
      ...specialtyClassIdsByValue,
      [specialtyValue]: [...new Set(nextClassIds.map(String))],
    };
    rebuildSpecialtyAuto(nextMap, nextSpecialty, options, specialtyValue, enabled);
  };

  const changeSpecialty = (
    value,
    options = specialtyOptions,
    nextClassMap = specialtyClassIdsByValue,
    focusSpecialty = resolvedAutoSpecialty
  ) => {
    setActiveProfile({ mutaxassisligi: value });
    rebuildSpecialtyAuto(nextClassMap, value, options, focusSpecialty);
  };

  const addSpecialtyValue = value => {
    const specialtyValue = normalizedSpecialtyValueV195(value);
    if (!specialtyValue) return;
    const current = specialtyValuesV195(activeSpecialty());
    if (current.includes(specialtyValue)) return;
    if (current.length >= 3) {
      setMessage({ tone: "warning", text: "Bitta o‘qituvchiga ko‘pi bilan 3 ta mutaxassislik tanlanadi. Avval bittasini olib tashlang." });
      return;
    }
    const nextMap = { ...specialtyClassIdsByValue, [specialtyValue]: specialtyClassIdsByValue[specialtyValue] || [] };
    setActiveAutoSpecialty(specialtyValue);
    changeSpecialty([...current, specialtyValue].join(";"), specialtyOptions, nextMap, specialtyValue);
  };

  const removeSpecialtyValue = value => {
    const next = specialtyValuesV195(activeSpecialty()).filter(item => item !== value);
    const nextMap = {};
    next.forEach(item => { nextMap[item] = specialtyClassIdsByValue[item] || []; });
    const nextActive = activeAutoSpecialty === value ? next[0] || "" : activeAutoSpecialty;
    setActiveAutoSpecialty(nextActive);
    changeSpecialty(next.join(";"), specialtyOptions, nextMap, nextActive);
  };

  const toggleSpecialtyDraftSubject = subject => {
    setSpecialtyDraft(current => ({
      ...current,
      subjects: current.subjects.some(item => groupedSubjectMatchesV195(item, subject))
        ? current.subjects.filter(item => !groupedSubjectMatchesV195(item, subject))
        : [...current.subjects, subject],
    }));
    setSpecialtyDraftError("");
  };

  const saveCustomSpecialty = () => {
    const label = specialtyDraft.label.trim();
    const subjects = [...new Set(specialtyDraft.subjects.map(item => String(item).trim()).filter(Boolean))];
    if (label.length < 2) {
      setSpecialtyDraftError("Mutaxassislik nomini kiriting.");
      return;
    }
    if (!subjects.length) {
      setSpecialtyDraftError("Bu mutaxassislikka kamida bitta fan biriktiring.");
      return;
    }
    if (specialtyOptions.some(item => subjectKeyV193(item.label) === subjectKeyV193(label))) {
      setSpecialtyDraftError("Bu nomdagi mutaxassislik ro‘yxatda bor. Uni yuqoridan tanlang.");
      return;
    }
    const current = specialtyValuesV195(activeSpecialty());
    if (current.length >= 3) {
      setSpecialtyDraftError("Avval tanlangan mutaxassisliklardan bittasini olib tashlang (eng ko‘pi 3 ta).");
      return;
    }
    const slug = subjectKeyV193(label).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 32) || "yangi";
    const option = {
      value: `custom_${slug}_${Date.now().toString(36)}`,
      label,
      subjects,
    };
    const nextCustom = [...customSpecialties, option];
    const nextOptions = [...teacherSpecialtiesV194, ...nextCustom];
    setCustomSpecialties(nextCustom);
    try {
      window.localStorage.setItem(`samtm_custom_specialties_v195_${maktabId}`, JSON.stringify(nextCustom));
    } catch {
      // Brauzer xotirasi yopiq bo‘lsa ham joriy oynada ishlashda davom etadi.
    }
    setSpecialtyDraft({ label: "", subjects: [] });
    setSpecialtyDraftError("");
    setSpecialtyCreatorOpen(false);
    const nextMap = { ...specialtyClassIdsByValue, [option.value]: [] };
    setActiveAutoSpecialty(option.value);
    changeSpecialty([...current, option.value].join(";"), nextOptions, nextMap, option.value);
    setMessage({ tone: "success", text: `${label} yaratildi, ${subjects.length} ta fan biriktirildi va o‘qituvchiga tanlandi.` });
  };

  const specialtyClassIdsForQuickRange = range => (data?.sinflar || [])
    .filter(cls => {
      if (range.all) return true;
      const grade = Number(String(cls.sinf || "").match(/\d+/)?.[0] || 0);
      return grade >= range.min && grade <= range.max;
    })
    .map(cls => String(cls.id));

  const quickSelectSpecialtyClasses = range => {
    if (!resolvedAutoSpecialty) {
      setMessage({ tone: "warning", text: "Avval yuqoridan mutaxassislikni tanlang." });
      return;
    }
    const nextClassIds = specialtyClassIdsForQuickRange(range);
    applySpecialtyAuto(nextClassIds, resolvedAutoSpecialty);
  };

  const toggleSpecialtyClass = classId => {
    if (!resolvedAutoSpecialty) {
      setMessage({ tone: "warning", text: "Avval mutaxassislikni tanlang." });
      return;
    }
    const key = String(classId);
    const next = specialtyClassIds.includes(key)
      ? specialtyClassIds.filter(item => item !== key)
      : [...specialtyClassIds, key];
    applySpecialtyAuto(next, resolvedAutoSpecialty);
  };

  const changeAutoSpecialty = enabled => {
    setAutoSpecialty(enabled);
    if (enabled) {
      const specialtyValue = activeSpecialty();
      if (data?.oquv_reja?.holat === "tasdiqlangan" && specialtyValue) {
        rebuildSpecialtyAuto(
          specialtyClassIdsByValue,
          specialtyValue,
          specialtyOptions,
          resolvedAutoSpecialty,
          true
        );
      }
    }
  };

  const addRow = () => {
    const nextIndex = rows.length;
    if (data?.oquv_reja?.holat !== "tasdiqlangan") {
      setRows(current => [...current, emptyTeacherLoadRowV192(data)]);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() =>
        document.getElementById(`teacher-load-row-${nextIndex}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      ));
      return;
    }
    for (const cls of (data?.sinflar || [])) {
      for (const variant of variantsForClass(cls.id)) {
        const probe = { sinf_id: String(cls.id), guruh_kaliti: variant.guruh_kaliti };
        for (const subject of subjectsFor({ ...probe, fan_nomi: "" })) {
          const planItem = planItemFor(cls.id, subject);
          const candidate = {
            ...probe, fan_nomi: subject,
            haftalik_soat: Number(planItem?.haftalik_soat || 1),
            kunlik_max: Number(planItem?.kunlik_max || 1), xona_id: "",
          };
          const info = allocationInfo(nextIndex, candidate);
          if (info.maxForRow > 0) {
            setRows(current => [...current, {
              ...candidate,
              haftalik_soat: Math.min(candidate.haftalik_soat, info.maxForRow),
              is_placeholder: false,
            }]);
            window.requestAnimationFrame(() => window.requestAnimationFrame(() =>
              document.getElementById(`teacher-load-row-${nextIndex}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
            ));
            return;
          }
        }
      }
    }
    setMessage({ tone: "warning", text: "Barcha tasdiqlangan fan–sinf–guruh soatlari taqsimlangan. Ortiqcha qator qo‘shib bo‘lmaydi." });
  };

  const startNewTeacher = () => {
    setCreatingNew(true);
    setSelectedTeacher("");
    setQuery("");
    setNewTeacher({
      full_name: "", mutaxassisligi: "", haftalik_maqsad_soat: "",
      tugilgan_yili: "", ish_staji: "", toifasi: "", rahbar_sinf_id: "",
    });
    setSpecialtyClassIdsByValue({});
    setActiveAutoSpecialty("");
    setAutoSpecialty(true);
    setEntryCode("");
    setRows([emptyTeacherLoadRowV192(data)]);
    setMessage(null);
  };

  const cancelNewTeacher = () => {
    const firstTeacher = String(data?.oqituvchilar?.[0]?.user_id || "");
    setCreatingNew(false);
    setSelectedTeacher(firstTeacher);
    setEntryCode("");
  };

  const confirmTeacherDelete = async () => {
    if (!deleteCandidate || deletingTeacher) return;
    setDeletingTeacher(true);
    setMessage(null);
    try {
      const result = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v3/oqituvchi_ochirish?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maktab_id: Number(maktabId),
            user_id: Number(deleteCandidate.user_id),
            tasdiq: true,
          }),
        }
      );
      setData(result.matritsa);
      const firstTeacher = String(result.matritsa?.oqituvchilar?.[0]?.user_id || "");
      setSelectedTeacher(firstTeacher);
      setRows([]);
      setDeleteCandidate(null);
      setMessage({
        tone: "success",
        text: `${result.oqituvchi} maktabdan o‘chirildi. ${result.ochirilgan_qator || 0} ta yuklama qatori va ${result.ochirilgan_soat || 0} soat olib tashlandi. Eski jadval bekor qilindi.`,
      });
      await onChanged?.();
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setDeletingTeacher(false);
    }
  };

  const save = async () => {
    const profile = creatingNew ? newTeacher : existingProfile;
    if (!creatingNew && !selectedTeacher) {
      return setMessage({ tone: "error", text: "Avval o‘qituvchini tanlang." });
    }
    if (creatingNew && newTeacher.full_name.trim().length < 3) {
      return setMessage({ tone: "error", text: "Yangi o‘qituvchining F.I.Sh.ni kiriting." });
    }
    if (creatingNew && !newTeacher.mutaxassisligi) {
      return setMessage({ tone: "error", text: "O‘qituvchining mutaxassisligini tanlang." });
    }
    if (creatingNew && !newTeacher.haftalik_maqsad_soat) {
      return setMessage({ tone: "error", text: "Haftalik maqsad soatini kiriting. Masalan: 25." });
    }
    if (profile.haftalik_maqsad_soat !== "" && (
      Number(profile.haftalik_maqsad_soat) < 1 || Number(profile.haftalik_maqsad_soat) > 60
    )) {
      return setMessage({ tone: "error", text: "Haftalik maqsad soati 1–60 oralig‘ida bo‘lishi kerak." });
    }
    const currentYear = new Date().getFullYear();
    if (creatingNew && newTeacher.tugilgan_yili !== "" && (
      Number(newTeacher.tugilgan_yili) < 1900 || Number(newTeacher.tugilgan_yili) > currentYear
    )) {
      return setMessage({ tone: "error", text: `Tug‘ilgan yil 1900–${currentYear} oralig‘ida bo‘lishi kerak.` });
    }
    const mergedRows = mergeDuplicateRows(rows);
    if (!mergedRows.length) {
      return setMessage({ tone: "error", text: "Kamida bitta fan–sinf–guruh qatorini kiriting." });
    }
    if (mergedRows.some(row => !row.sinf_id || !row.fan_nomi || !row.haftalik_soat)) {
      return setMessage({ tone: "error", text: "Har bir qatorda sinf, fan va haftalik soat bo‘lishi kerak." });
    }
    for (let index = 0; index < mergedRows.length; index += 1) {
      const row = mergedRows[index];
      const info = allocationInfo(index, row, mergedRows);
      if (info.approved && Number(row.haftalik_soat || 0) > info.maxForRow) {
        const cls = (data?.sinflar || []).find(item => String(item.id) === String(row.sinf_id));
        return setMessage({
          tone: "error",
          text: `${cls ? `${cls.sinf}-${cls.harf}` : "Sinf"} / ${row.fan_nomi}: faqat ${info.maxForRow} soat qoldi. ${Number(row.haftalik_soat || 0)} soat saqlab bo‘lmaydi.`,
        });
      }
    }
    if (mergedRows.length !== rows.length) {
      setRows(mergedRows);
    }
    setSaving(true);
    setMessage(null);
    try {
      const qatorlar = mergedRows.map(row => ({
        sinf_id: Number(row.sinf_id),
        fan_nomi: row.fan_nomi,
        guruh_kaliti: row.guruh_kaliti || "whole",
        haftalik_soat: Number(row.haftalik_soat),
        kunlik_max: Number(row.kunlik_max || 1),
        xona_id: row.xona_id ? Number(row.xona_id) : null,
      }));
      const result = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v3/${creatingNew ? "oqituvchi_qoshish" : "oqituvchi_yuklamasi"}?token=${encodeURIComponent(token)}`,
        {
          method: creatingNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(creatingNew ? {
            maktab_id: maktabId,
            full_name: newTeacher.full_name.trim(),
            mutaxassisligi: newTeacher.mutaxassisligi,
            haftalik_maqsad_soat: Number(newTeacher.haftalik_maqsad_soat),
            tugilgan_yili: newTeacher.tugilgan_yili === "" ? null : Number(newTeacher.tugilgan_yili),
            ish_staji: newTeacher.ish_staji === "" ? null : Number(newTeacher.ish_staji),
            toifasi: newTeacher.toifasi || null,
            rahbar_sinf_id: newTeacher.rahbar_sinf_id ? Number(newTeacher.rahbar_sinf_id) : null,
            qatorlar,
          } : {
            maktab_id: maktabId,
            user_id: Number(selectedTeacher),
            mutaxassisligi: existingProfile.mutaxassisligi || null,
            haftalik_maqsad_soat: existingProfile.haftalik_maqsad_soat === ""
              ? null : Number(existingProfile.haftalik_maqsad_soat),
            qatorlar,
          }),
        }
      );
      setData(result.matritsa);
      if (creatingNew) {
        setRecentlyCreatedTeacherId(String(result.user_id));
        setSelectedTeacher("");
        setCreatingNew(true);
        setQuery("");
        setEntryCode(result.kirish_kodi || "");
        setNewTeacher({
          full_name: "", mutaxassisligi: "", haftalik_maqsad_soat: "",
          tugilgan_yili: "", ish_staji: "", toifasi: "", rahbar_sinf_id: "",
        });
        setRows([]);
        setSpecialtyClassIdsByValue({});
        setActiveAutoSpecialty("");
        setAutoSpecialty(true);
        setSpecialtyCreatorOpen(false);
        setSpecialtyDraft({ label: "", subjects: [] });
        setSpecialtyDraftError("");
        setAllocationOverviewOpen(false);
        window.requestAnimationFrame(() => window.requestAnimationFrame(() =>
          document.getElementById(result.kirish_kodi ? "teacher-entry-code" : "new-teacher-form")?.scrollIntoView({ behavior: "smooth", block: "start" })
        ));
      }
      const warnings = result.ogohlantirishlar || [];
      setMessage({
        tone: warnings.length ? "warning" : "success",
        text: `${result.oqituvchi}: ${result.qator_soni} ta aniq fan–sinf–guruh qatori, haftasiga ${result.haftalik_jami} soat saqlandi.${result.rahbar_sinf_nomi ? ` Sinf rahbari: ${result.rahbar_sinf_nomi}.` : ""}${result.kirish_kodi ? " Kirish kodi quyida bir marta ko‘rsatildi." : ""}${creatingNew ? " Oyna navbatdagi yangi o‘qituvchi uchun tozalandi." : ""}${warnings.length ? ` ${warnings.join("; ")}` : ""}`,
      });
      await onChanged?.();
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const teachers = (data?.oqituvchilar || []).filter(teacher =>
    !query.trim() || String(teacher.full_name || "")
      .toLocaleLowerCase("uz")
      .includes(query.trim().toLocaleLowerCase("uz"))
  );
  const teacher = (data?.oqituvchilar || []).find(
    item => String(item.user_id) === String(selectedTeacher)
  );
  const teacherTotal = (data?.hisob?.oqituvchilar || []).find(
    item => String(item.user_id) === String(selectedTeacher)
  );
  const activeProfileValues = creatingNew ? newTeacher : existingProfile;
  const targetHours = Number(activeProfileValues.haftalik_maqsad_soat || 0);
  const draftFanTotal = rows.reduce(
    (sum, row) => sum + Number(row.haftalik_soat || 0), 0
  );
  const draftClassTotal = creatingNew ? 0 : Number(teacherTotal?.sinf_soati || 0);
  const draftWeeklyTotal = draftFanTotal + draftClassTotal;
  const targetDifference = targetHours ? targetHours - draftWeeklyTotal : 0;
  const planDraftRows = planPayloadRows();
  const planSchoolTotal = planDraftRows.reduce(
    (sum, row) => sum + Number(row.haftalik_soat || 0), 0
  );
  const openPlanReference = () => {
    const currentClassId = rows.find(row => row.sinf_id)?.sinf_id || "";
    setPlanReferenceClassId(String(currentClassId));
    setPlanReferenceOpen(true);
  };
  const planReferenceClasses = planReferenceClassId
    ? (data?.sinflar || []).filter(cls => String(cls.id) === String(planReferenceClassId))
    : (data?.sinflar || []);
  const planReferenceSubjects = planReferenceClassId
    ? planSubjects.filter(subject => planReferenceClasses.some(cls =>
      Number(planCells[planCellKey(cls.id, subject)] || 0) > 0
    ))
    : planSubjects;
  const teacherDraftPlanKeys = new Set(rows
    .filter(row => row.sinf_id && row.fan_nomi)
    .map(row => `${row.sinf_id}|${subjectKeyV193(row.fan_nomi)}`));
  const currentDraftTeacherName = creatingNew
    ? (newTeacher.full_name.trim() || "Hozir kiritilayotgan o‘qituvchi")
    : (teacher?.full_name || "Tanlangan o‘qituvchi");
  const effectiveAllocationRows = [
    ...(data?.birikmalar || []).filter(item =>
      creatingNew || !selectedTeacher || String(item.user_id) !== String(selectedTeacher)
    ),
    ...rows.filter(row => row.sinf_id && row.fan_nomi && Number(row.haftalik_soat || 0) > 0).map(row => ({
      ...row,
      user_id: creatingNew ? "draft-new-teacher" : selectedTeacher,
      full_name: currentDraftTeacherName,
      guruh_kaliti: row.guruh_kaliti || "whole",
      draft: true,
    })),
  ];
  const displayAllocationHours = value => {
    const numeric = Math.round(Number(value || 0) * 10) / 10;
    return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1);
  };
  const allocationTargetsFor = (classId, subject) => {
    const grouped = variantsForClass(classId).filter(variant =>
      variant.guruh_kaliti !== "whole" &&
      (variant.fanlar || []).some(item => groupedSubjectMatchesV195(item, subject))
    );
    if (grouped.length) return grouped;
    return [{
      sinf_id: Number(classId), guruh_kaliti: "whole",
      guruh_nomi: "Butun sinf", qisqa: "Sinf",
    }];
  };
  const classAllocationDetails = classId => planForClass(classId).map(planItem => {
    const expectedPerTarget = Number(planItem.haftalik_soat || 0);
    const targets = allocationTargetsFor(classId, planItem.fan_nomi).map(target => {
      const matching = effectiveAllocationRows.filter(row =>
        String(row.sinf_id) === String(classId) &&
        groupedSubjectMatchesV195(row.fan_nomi, planItem.fan_nomi) &&
        String(row.guruh_kaliti || "whole") === String(target.guruh_kaliti || "whole")
      );
      const teachersById = new Map();
      matching.forEach(row => {
        const key = String(row.user_id || row.full_name || "noma_lum");
        const current = teachersById.get(key) || {
          user_id: row.user_id, full_name: row.full_name || "O‘qituvchi",
          hours: 0, draft: false,
        };
        current.hours += Number(row.haftalik_soat || 0);
        current.draft = current.draft || Boolean(row.draft);
        teachersById.set(key, current);
      });
      const assigned = matching.reduce((sum, row) => sum + Number(row.haftalik_soat || 0), 0);
      return {
        ...target,
        expected: expectedPerTarget,
        assigned,
        remaining: Math.max(0, expectedPerTarget - assigned),
        extra: Math.max(0, assigned - expectedPerTarget),
        teachers: [...teachersById.values()],
      };
    });
    const required = expectedPerTarget * targets.length;
    const assigned = targets.reduce((sum, target) => sum + target.assigned, 0);
    const remaining = targets.reduce((sum, target) => sum + target.remaining, 0);
    const extra = targets.reduce((sum, target) => sum + target.extra, 0);
    return {
      fan_nomi: planItem.fan_nomi,
      subject_key: subjectKeyV193(planItem.fan_nomi),
      expectedPerTarget, targets, targetCount: targets.length,
      grouped: targets.length > 1 || targets[0]?.guruh_kaliti !== "whole",
      required, assigned, remaining, extra,
      complete: remaining <= 0 && extra <= 0,
    };
  });
  const classAllocationSummary = classId => {
    const details = classAllocationDetails(classId);
    const required = details.reduce((sum, item) => sum + item.required, 0);
    const assigned = details.reduce((sum, item) => sum + item.assigned, 0);
    const remaining = details.reduce((sum, item) => sum + item.remaining, 0);
    const extra = details.reduce((sum, item) => sum + item.extra, 0);
    const nominalRequired = details.reduce((sum, item) => sum + item.expectedPerTarget, 0);
    const groupedSubjects = details.filter(item => item.grouped).length;
    const completeSubjects = details.filter(item => item.complete).length;
    return {
      details, nominalRequired, groupedSubjects,
      required, assigned, remaining, extra, completeSubjects,
      subjectCount: details.length,
      percent: required > 0 ? Math.min(100, Math.round(((required - remaining) / required) * 100)) : 0,
      complete: required > 0 && remaining <= 0 && extra <= 0,
    };
  };
  const openClassAllocationInspector = classId => {
    const details = classAllocationDetails(classId);
    setAllocationInspectorClassId(String(classId));
    setAllocationInspectorSubjectKey(details[0]?.subject_key || "");
  };
  const allocationInspectorClass = (data?.sinflar || []).find(
    cls => String(cls.id) === String(allocationInspectorClassId)
  );
  const allocationInspectorSummary = allocationInspectorClassId
    ? classAllocationSummary(allocationInspectorClassId)
    : null;
  const allocationInspectorSubject = allocationInspectorSummary?.details.find(
    item => item.subject_key === allocationInspectorSubjectKey
  ) || allocationInspectorSummary?.details[0] || null;

  const renderSpecialtyPicker = required => {
    const selected = specialtyValuesV195(activeSpecialty());
    return <div>
      <div className="text-xs font-black" style={{ color: palette.ink }}>
        Mutaxassisligi {required && <span style={{ color: palette.red }}>*</span>}
      </div>
      <select
        value=""
        onChange={event => addSpecialtyValue(event.target.value)}
        disabled={selected.length >= 3}
        className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-white disabled:opacity-55"
        style={{ borderColor: palette.line }}
      >
        <option value="">{selected.length ? "+ Yana mutaxassislik tanlash" : "Mutaxassislikni tanlang"}</option>
        {specialtyOptions.map(option => <option key={option.value} value={option.value} disabled={selected.includes(option.value)}>
          {option.label}{selected.includes(option.value) ? " · tanlangan" : ""}
        </option>)}
      </select>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {selected.map(value => {
          const option = specialtyOptions.find(item => item.value === value);
          return <span key={value} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black" style={{ background: palette.sky, color: palette.blue }}>
            {option?.label || value}
            <button type="button" onClick={() => removeSpecialtyValue(value)} aria-label={`${option?.label || value} mutaxassisligini olib tashlash`} className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "rgba(255,255,255,.8)", color: palette.red }}>×</button>
          </span>;
        })}
        {!selected.length && <span className="text-[10px]" style={{ color: palette.muted }}>Hozircha tanlanmagan</span>}
      </div>
      <div className="flex items-center justify-between gap-2 mt-2">
        <span className="text-[10px] font-bold" style={{ color: selected.length >= 3 ? palette.amber : palette.muted }}>{selected.length}/3 ta tanlandi</span>
        <button type="button" onClick={() => { setSpecialtyCreatorOpen(current => !current); setSpecialtyDraftError(""); }} className="px-2.5 py-1.5 rounded-lg text-[10px] font-black" style={{ background: palette.mint, color: palette.teal }}>
          + Yangi mutaxassislik yaratish
        </button>
      </div>
      {specialtyCreatorOpen && <div className="mt-2 rounded-xl border p-3" style={{ borderColor: palette.line, background: "#fff" }}>
        <div className="text-[11px] font-black" style={{ color: palette.ink }}>Yangi mutaxassislik va uning fanlari</div>
        <input
          value={specialtyDraft.label}
          onChange={event => { setSpecialtyDraft(current => ({ ...current, label: event.target.value })); setSpecialtyDraftError(""); }}
          placeholder="Masalan: Robototexnika"
          className="w-full mt-2 px-3 py-2 rounded-lg border text-xs"
          style={{ borderColor: palette.line }}
        />
        <div className="text-[10px] font-black mt-2" style={{ color: palette.teal }}>Fanlarni biriktiring (kamida 1 ta)</div>
        <div className="mt-1.5 max-h-40 overflow-auto rounded-lg border p-2 grid sm:grid-cols-2 gap-1" style={{ borderColor: palette.line }}>
          {specialtySubjectChoices.map(subject => {
            const checked = specialtyDraft.subjects.some(item => groupedSubjectMatchesV195(item, subject));
            return <label key={subjectKeyV193(subject)} className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-[10px] cursor-pointer" style={{ background: checked ? palette.mint : palette.cream, color: palette.ink }}>
              <input type="checkbox" checked={checked} onChange={() => toggleSpecialtyDraftSubject(subject)} />
              <span>{subject}</span>
            </label>;
          })}
          {!specialtySubjectChoices.length && <div className="text-[10px] p-2" style={{ color: palette.muted }}>Avval o‘quv reja fanlarini kiriting.</div>}
        </div>
        {specialtyDraft.subjects.length > 0 && <div className="text-[10px] mt-1.5" style={{ color: palette.green }}>{specialtyDraft.subjects.length} ta fan tanlandi</div>}
        {specialtyDraftError && <div className="text-[10px] font-bold mt-1.5" style={{ color: palette.red }}>{specialtyDraftError}</div>}
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={saveCustomSpecialty} className="flex-1 px-3 py-2 rounded-lg text-[10px] font-black text-white" style={{ background: palette.teal }}>Yaratish va tanlash</button>
          <button type="button" onClick={() => { setSpecialtyCreatorOpen(false); setSpecialtyDraftError(""); }} className="px-3 py-2 rounded-lg text-[10px] font-black" style={{ background: palette.cream, color: palette.ink }}>Bekor qilish</button>
        </div>
      </div>}
    </div>;
  };

  if (loading) {
    return <Card className="p-8"><div className="flex justify-center"><Loader2 className="animate-spin" style={{ color: palette.blue }}/></div></Card>;
  }

  if (!data) {
    return <Card className="p-6"><SmartNotice tone="error">
      {message?.text || "O‘quv reja ma’lumotlari yuklanmadi. Backenddagi samtm_school.py faylini yangilab, qayta deploy qiling."}
    </SmartNotice></Card>;
  }

  return <div className="space-y-4">
    {allocationInspectorClass && allocationInspectorSummary && <div className="fixed inset-0 z-[9998] overflow-y-auto p-2 md:p-5" style={{ background: "rgba(15,35,50,.68)" }}>
      <div className="mx-auto w-full max-w-[1450px] min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-2.5rem)] rounded-3xl border bg-white overflow-hidden" style={{ borderColor: palette.line, boxShadow: "0 25px 90px rgba(0,0,0,.30)" }}>
        <div className="sticky top-0 z-50 border-b px-4 md:px-6 py-4" style={{ background: "rgba(255,255,255,.98)", borderColor: palette.line }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: palette.sky, color: palette.blue }}><BarChart3 size={22}/></div>
            <div className="flex-1 min-w-[230px]">
              <div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>SINF YUKLAMASI TAQSIMOTI</div>
              <div className="text-xl font-black" style={{ color: palette.ink }}>{allocationInspectorClass.sinf}-{allocationInspectorClass.harf} · fan va guruhlar</div>
              <div className="text-[11px] mt-0.5" style={{ color: palette.muted }}>Guruhlangan fanlarda reja soati har bir guruhga alohida hisoblanadi. Oynani yopsangiz o‘qituvchi formasidagi barcha yozuvlar saqlanib turadi.</div>
              <div className="text-[10px] font-black mt-1" style={{ color: palette.blue }}>Dars reja: {displayAllocationHours(allocationInspectorSummary.nominalRequired)} soat · guruhlar bilan o‘qituvchi yuklamasi: {displayAllocationHours(allocationInspectorSummary.required)} soat</div>
            </div>
            <span className="px-3 py-2 rounded-xl text-[10px] font-black" style={{ background: palette.sky, color: palette.blue }}>FAQAT KO‘RISH</span>
            <button type="button" onClick={() => { setAllocationInspectorClassId(""); setAllocationInspectorSubjectKey(""); }} className="px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2" style={{ background: palette.cream, color: palette.ink }}><ArrowLeft size={16}/> O‘qituvchiga qaytish</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 mt-4">
            <div className="rounded-xl px-3 py-2" style={{ background: palette.sky }}><div className="text-[9px] font-black uppercase" style={{ color: palette.blue }}>O‘quv reja</div><div className="text-lg font-black" style={{ color: palette.ink }}>{displayAllocationHours(allocationInspectorSummary.nominalRequired)} soat</div><div className="text-[8px] font-bold" style={{ color: palette.muted }}>Guruh sabab ko‘paymaydi</div></div>
            <div className="rounded-xl px-3 py-2" style={{ background: "#EEF2FF" }}><div className="text-[9px] font-black uppercase" style={{ color: palette.blue }}>O‘qituvchi yuklama rejasi</div><div className="text-lg font-black" style={{ color: palette.ink }}>{displayAllocationHours(allocationInspectorSummary.required)} soat</div><div className="text-[8px] font-bold" style={{ color: palette.muted }}>Har bir guruh alohida</div></div>
            <div className="rounded-xl px-3 py-2" style={{ background: palette.mint }}><div className="text-[9px] font-black uppercase" style={{ color: palette.teal }}>Berilgan</div><div className="text-lg font-black" style={{ color: palette.ink }}>{displayAllocationHours(allocationInspectorSummary.assigned)} soat</div></div>
            <div className="rounded-xl px-3 py-2" style={{ background: allocationInspectorSummary.remaining ? palette.amberBg : palette.greenBg }}><div className="text-[9px] font-black uppercase" style={{ color: allocationInspectorSummary.remaining ? palette.amber : palette.green }}>Qolgan</div><div className="text-lg font-black" style={{ color: palette.ink }}>{displayAllocationHours(allocationInspectorSummary.remaining)} soat</div></div>
            <div className="rounded-xl px-3 py-2" style={{ background: allocationInspectorSummary.extra ? palette.redBg : palette.cream }}><div className="text-[9px] font-black uppercase" style={{ color: allocationInspectorSummary.extra ? palette.red : palette.muted }}>Ortiqcha</div><div className="text-lg font-black" style={{ color: palette.ink }}>{displayAllocationHours(allocationInspectorSummary.extra)} soat</div></div>
            <div className="rounded-xl px-3 py-2" style={{ background: allocationInspectorSummary.complete ? palette.greenBg : palette.cream }}><div className="text-[9px] font-black uppercase" style={{ color: allocationInspectorSummary.complete ? palette.green : palette.muted }}>To‘lgan fanlar</div><div className="text-lg font-black" style={{ color: palette.ink }}>{allocationInspectorSummary.completeSubjects}/{allocationInspectorSummary.subjectCount}</div></div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,.65fr)] gap-4 p-3 md:p-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <div className="text-sm font-black" style={{ color: palette.ink }}>Fanlar holati</div>
                <div className="text-[10px]" style={{ color: palette.muted }}>Fan ustiga sichqonchani olib boring yoki bosing — o‘ng tomonda o‘qituvchi va guruhlar chiqadi.</div>
              </div>
              <div className="text-[10px] font-black" style={{ color: allocationInspectorSummary.complete ? palette.green : palette.amber }}>{allocationInspectorSummary.percent}% taqsimlangan</div>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: palette.line }}><div className="h-full rounded-full" style={{ width: `${allocationInspectorSummary.percent}%`, background: allocationInspectorSummary.complete ? palette.green : palette.amber }}/></div>
            {!allocationInspectorSummary.details.length ? <SmartNotice tone="warning">Bu sinf uchun o‘quv rejada fan–soat topilmadi.</SmartNotice> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
              {allocationInspectorSummary.details.map(detail => {
                const active = allocationInspectorSubject?.subject_key === detail.subject_key;
                const toneBg = detail.extra ? palette.redBg : detail.complete ? palette.greenBg : detail.assigned > 0 ? palette.amberBg : "#FFF5F5";
                const toneColor = detail.extra ? palette.red : detail.complete ? palette.green : detail.assigned > 0 ? palette.amber : palette.red;
                const tooltip = detail.targets.map(target => {
                  const teachers = target.teachers.length
                    ? target.teachers.map(item => `${item.full_name}: ${displayAllocationHours(item.hours)} soat${item.draft ? " (hozir kiritilmoqda)" : ""}`).join(", ")
                    : "o‘qituvchi berilmagan";
                  return `${target.guruh_nomi}: ${displayAllocationHours(target.assigned)}/${displayAllocationHours(target.expected)} soat — ${teachers}`;
                }).join("\n");
                return <button type="button" key={detail.subject_key} title={tooltip} onMouseEnter={() => setAllocationInspectorSubjectKey(detail.subject_key)} onClick={() => setAllocationInspectorSubjectKey(detail.subject_key)} className="text-left rounded-2xl border p-3 transition-shadow hover:shadow-md" style={{ background: active ? toneBg : "#fff", borderColor: active ? toneColor : palette.line }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-black leading-tight" style={{ color: palette.ink }}>{detail.fan_nomi}</div>
                    <span className="shrink-0 px-2 py-1 rounded-lg text-[9px] font-black" style={{ background: toneBg, color: toneColor }}>{detail.extra ? `+${displayAllocationHours(detail.extra)} ORTIQ` : detail.complete ? "TO‘LDI" : detail.assigned > 0 ? `${displayAllocationHours(detail.remaining)} QOLDI` : "BERILMAGAN"}</span>
                  </div>
                  <div className="text-[10px] mt-2" style={{ color: palette.muted }}>
                    {detail.grouped
                      ? <>Har guruh: <b>{displayAllocationHours(detail.expectedPerTarget)}</b> soat × <b>{detail.targetCount}</b> guruh = jami <b>{displayAllocationHours(detail.required)}</b> soat</>
                      : <>Butun sinf: <b>{displayAllocationHours(detail.required)}</b> soat</>}
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: toneColor }}>Berildi: <b>{displayAllocationHours(detail.assigned)}</b> · qoldi: <b>{displayAllocationHours(detail.remaining)}</b> soat</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {detail.targets.map(target => <span key={target.guruh_kaliti} className="px-2 py-1 rounded-lg text-[9px] font-black" style={{ background: target.extra ? palette.redBg : target.remaining ? palette.amberBg : palette.greenBg, color: target.extra ? palette.red : target.remaining ? palette.amber : palette.green }}>{target.qisqa || target.guruh_nomi}: {displayAllocationHours(target.assigned)}/{displayAllocationHours(target.expected)}</span>)}
                  </div>
                </button>;
              })}
            </div>}
          </div>

          <div className="rounded-2xl border p-4 self-start xl:sticky xl:top-[245px]" style={{ borderColor: palette.line, background: "#F8FBFD" }}>
            {!allocationInspectorSubject ? <div className="text-sm" style={{ color: palette.muted }}>Ko‘rish uchun fan ustiga boring yoki bosing.</div> : <>
              <div className="text-[10px] font-black uppercase tracking-[.1em]" style={{ color: palette.teal }}>FAN TAQSIMOTI</div>
              <div className="text-lg font-black mt-1" style={{ color: palette.ink }}>{allocationInspectorSubject.fan_nomi}</div>
              <div className="text-xs mt-1" style={{ color: palette.muted }}>
                {allocationInspectorSubject.grouped
                  ? <>Har bir guruhga <b>{displayAllocationHours(allocationInspectorSubject.expectedPerTarget)} soat</b> × <b>{allocationInspectorSubject.targetCount} guruh</b> = jami <b>{displayAllocationHours(allocationInspectorSubject.required)} soat</b></>
                  : <>Butun sinf uchun <b>{displayAllocationHours(allocationInspectorSubject.required)} soat</b></>}
              </div>
              <div className="space-y-2 mt-4">
                {allocationInspectorSubject.targets.map(target => <div key={target.guruh_kaliti} className="rounded-xl border p-3" style={{ borderColor: target.extra ? "#E5AAAA" : target.remaining ? "#E7C58A" : "#9BCBAD", background: target.extra ? palette.redBg : target.remaining ? palette.amberBg : palette.greenBg }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-black" style={{ color: palette.ink }}>{target.guruh_nomi}</div>
                    <div className="text-xs font-black" style={{ color: target.extra ? palette.red : target.remaining ? palette.amber : palette.green }}>{displayAllocationHours(target.assigned)} / {displayAllocationHours(target.expected)} soat</div>
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: target.extra ? palette.red : target.remaining ? palette.amber : palette.green }}>{target.extra ? `${displayAllocationHours(target.extra)} soat ortiqcha berilgan` : target.remaining ? `${displayAllocationHours(target.remaining)} soat hali berilmagan` : "To‘liq taqsimlangan"}</div>
                  <div className="mt-2 space-y-1.5">
                    {target.teachers.length ? target.teachers.map(item => <div key={String(item.user_id || item.full_name)} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 text-[11px]">
                      <span className="font-bold" style={{ color: palette.ink }}>{item.full_name}{item.draft ? <span className="ml-1" style={{ color: palette.amber }}>(hozir kiritilmoqda)</span> : null}</span>
                      <span className="font-black shrink-0" style={{ color: palette.blue }}>{displayAllocationHours(item.hours)} soat</span>
                    </div>) : <div className="rounded-lg px-2.5 py-2 text-[11px] font-bold" style={{ background: "rgba(255,255,255,.7)", color: palette.red }}>O‘qituvchi biriktirilmagan</div>}
                  </div>
                </div>)}
              </div>
            </>}
          </div>
        </div>
      </div>
    </div>}
    {planReferenceOpen && <div className="fixed inset-0 z-[9998] overflow-y-auto p-2 md:p-5" style={{ background: "rgba(15,35,50,.68)" }}>
      <div className="mx-auto w-full max-w-[1600px] min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-2.5rem)] rounded-3xl border bg-white overflow-hidden" style={{ borderColor: palette.line, boxShadow: "0 25px 90px rgba(0,0,0,.30)" }}>
        <div className="sticky top-0 z-50 border-b px-4 md:px-6 py-4" style={{ background: "rgba(255,255,255,.98)", borderColor: palette.line }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: palette.sky, color: palette.blue }}><BookOpen size={22}/></div>
            <div className="flex-1 min-w-[220px]">
              <div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>O‘QITUVCHI YUKLAMASI UCHUN MA’LUMOT</div>
              <div className="text-xl font-black" style={{ color: palette.ink }}>O‘quv rejani tez ko‘rish</div>
              <div className="text-[11px] mt-0.5" style={{ color: palette.muted }}>O‘qituvchi formasidagi kiritilgan ma’lumotlar saqlanib turibdi. Yopsangiz aynan shu joyga qaytasiz.</div>
            </div>
            <span className="px-3 py-2 rounded-xl text-xs font-black" style={{
              background: data?.oquv_reja?.holat === "tasdiqlangan" ? palette.greenBg : palette.amberBg,
              color: data?.oquv_reja?.holat === "tasdiqlangan" ? palette.green : palette.amber,
            }}>{data?.oquv_reja?.holat === "tasdiqlangan" ? "✓ REJA TASDIQLANGAN" : "REJA TASDIQLANMAGAN"}</span>
            <span className="px-3 py-2 rounded-xl text-[10px] font-black" style={{ background: palette.sky, color: palette.blue }}>FAQAT KO‘RISH · O‘ZGARTIRIB BO‘LMAYDI</span>
            <button type="button" onClick={() => setPlanReferenceOpen(false)} className="px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2" style={{ background: palette.cream, color: palette.ink }}><ArrowLeft size={16}/> O‘qituvchiga qaytish</button>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <label className="text-xs font-black" style={{ color: palette.ink }}>Ko‘rsatiladigan sinf</label>
            <select value={planReferenceClassId} onChange={event => setPlanReferenceClassId(event.target.value)} className="min-w-[220px] px-3 py-2.5 rounded-xl border text-sm font-bold" style={{ borderColor: palette.line, color: palette.ink }}>
              <option value="">Barcha sinflar</option>
              {(data?.sinflar || []).map(cls => <option key={cls.id} value={cls.id}>{cls.sinf}-{cls.harf} · {cls.smena}-smena</option>)}
            </select>
            <div className="px-3 py-2 rounded-xl text-[11px] font-bold" style={{ background: palette.amberBg, color: palette.amber }}>Sariq katak — shu o‘qituvchiga hozir kiritayotgan faningiz</div>
            {planReferenceClassId && <div className="px-3 py-2 rounded-xl text-[11px] font-bold" style={{ background: palette.sky, color: palette.blue }}>Tanlangan sinfda faqat soati bor fanlar ko‘rsatildi</div>}
          </div>
        </div>

        <div className="p-3 md:p-5">
          {!(data?.sinflar || []).length ? <SmartNotice tone="error">Sinf ro‘yxati yuklanmagan.</SmartNotice> : !planReferenceSubjects.length ? <SmartNotice tone="warning">Tanlangan sinf uchun o‘quv rejada fan–soat topilmadi.</SmartNotice> : <div className="rounded-2xl border overflow-auto" style={{ borderColor: palette.line, maxHeight: "calc(100vh - 225px)" }}>
            <table className="border-collapse text-xs" style={{ minWidth: `${175 + planReferenceSubjects.length * 58 + 95}px`, width: "100%" }}>
              <thead className="sticky top-0 z-20">
                <tr>
                  <th className="sticky left-0 z-30 p-3 text-left min-w-[175px]" style={{ background: palette.ink, color: "#fff" }}>SINF ↓ / FAN →</th>
                  {planReferenceSubjects.map(subject => <th key={subject} className="p-0 text-center min-w-[58px] h-[165px]" title={subject} style={{ background: palette.ink, color: "#fff", borderLeft: "1px solid rgba(255,255,255,.18)" }}>
                    <div className="mx-auto text-[10px] font-black leading-tight" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", maxHeight: 155 }}>{subject}</div>
                  </th>)}
                  <th className="p-2 text-center min-w-[95px]" style={{ background: palette.blue, color: "#fff" }}>HAFTALIK<br/>JAMI</th>
                </tr>
              </thead>
              <tbody>
                {planReferenceClasses.map((cls, classIndex) => {
                  const classTotal = planReferenceSubjects.reduce((sum, subject) => sum + Number(planCells[planCellKey(cls.id, subject)] || 0), 0);
                  return <tr key={cls.id} className="border-t" style={{ borderColor: palette.line }}>
                    <th className="sticky left-0 z-10 p-2.5 text-left" style={{ background: classIndex % 2 ? "#F8FBFD" : "#fff", color: palette.ink, borderRight: `1px solid ${palette.line}` }}>
                      <div className="font-black">{cls.sinf}-{cls.harf}</div>
                      <div className="text-[9px] mt-0.5" style={{ color: palette.muted }}>{cls.smena}-smena</div>
                    </th>
                    {planReferenceSubjects.map(subject => {
                      const value = Number(planCells[planCellKey(cls.id, subject)] || 0);
                      const draftKey = `${cls.id}|${subjectKeyV193(subject)}`;
                      const selectedForTeacher = teacherDraftPlanKeys.has(draftKey);
                      const teacherHours = rows.filter(row => `${row.sinf_id}|${subjectKeyV193(row.fan_nomi)}` === draftKey).reduce((sum, row) => sum + Number(row.haftalik_soat || 0), 0);
                      return <td key={subject} className="p-1 text-center" title={selectedForTeacher ? `O‘qituvchiga kiritilmoqda: ${teacherHours} soat` : `${subject}: ${value || 0} soat`} style={{ background: selectedForTeacher ? palette.amberBg : (value > 0 ? palette.greenBg : (classIndex % 2 ? "#F8FBFD" : "#fff")), borderLeft: `1px solid ${palette.line}` }}>
                        <div className="w-12 mx-auto px-1 py-2 rounded-lg border text-center font-black" style={{ borderColor: selectedForTeacher ? "#D89B3D" : (value > 0 ? "#8FC4A5" : palette.line), color: selectedForTeacher ? palette.amber : (value > 0 ? palette.green : palette.muted) }}>{value || "—"}</div>
                      </td>;
                    })}
                    <th className="p-2 text-center text-sm font-black" style={{ background: palette.blue, color: "#fff" }}>{classTotal}</th>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>}
        </div>
      </div>
    </div>}
    {deleteCandidate && <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: "rgba(15,35,50,.62)" }}>
      <div className="w-full max-w-md rounded-3xl border bg-white p-6" style={{ borderColor: palette.line, boxShadow: "0 25px 80px rgba(0,0,0,.25)" }}>
        <div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.red }}>O‘QITUVCHINI O‘CHIRISH</div>
        <div className="text-xl font-black mt-2" style={{ color: palette.ink }}>{deleteCandidate.full_name}</div>
        <div className="text-sm mt-3 leading-relaxed" style={{ color: palette.muted }}>
          Bu o‘qituvchi, uning barcha fan–sinf–guruh yuklamalari, sinf rahbarligi va faol jadval birikmalari maktabdan olib tashlanadi. Bu amalni bajarilsinmi?
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button type="button" onClick={() => setDeleteCandidate(null)} disabled={deletingTeacher} className="px-4 py-3 rounded-xl text-sm font-black" style={{ background: palette.cream, color: palette.ink }}>Yo‘q, bekor qilish</button>
          <button type="button" onClick={confirmTeacherDelete} disabled={deletingTeacher} className="px-4 py-3 rounded-xl text-sm font-black text-white" style={{ background: palette.red }}>{deletingTeacher ? "O‘chirilmoqda..." : "Ha, o‘chirish"}</button>
        </div>
      </div>
    </div>}
    {message && <SmartNotice tone={message.tone}>{message.text}</SmartNotice>}
    {!planOnly && entryCode && <div id="teacher-entry-code" className="rounded-2xl border p-4 flex flex-wrap items-center gap-3 scroll-mt-4" style={{ borderColor: "#B9DFC5", background: palette.greenBg }}>
      <div className="flex-1 min-w-[240px]">
        <div className="text-xs font-black" style={{ color: palette.green }}>YANGI O‘QITUVCHINING 7 KUNLIK KIRISH KODI</div>
        <div className="text-xl font-black tracking-[.18em] mt-1" style={{ color: palette.ink }}>{entryCode}</div>
        <div className="text-[11px] mt-1" style={{ color: palette.muted }}>Kodni o‘qituvchiga alohida bering. U Google hisobini shu kod bilan bog‘laydi.</div>
      </div>
      <button onClick={() => navigator.clipboard?.writeText(entryCode)} className="px-4 py-2.5 rounded-xl text-xs font-black" style={{ background: palette.green, color: "#fff" }}>Kodni nusxalash</button>
    </div>}

    {showPlan && <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>1-QADAM · O‘QUV REJA</div>
          <h2 className="text-xl font-black mt-1" style={{ color: palette.ink }}>Fan va haftalik soatlarni tekshirish</h2>
          <p className="text-xs mt-1 max-w-3xl" style={{ color: palette.muted }}>
            Tayanch andoza sinflarga tayyor qo‘yildi. Kerakli soatni tuzating, saqlang va tasdiqlang.
            Tasdiqlangandan keyin o‘qituvchi qatorida fan soati avtomatik chiqadi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-2 rounded-xl text-xs font-black" style={{
            background: data?.oquv_reja?.holat === "tasdiqlangan" ? palette.greenBg : palette.amberBg,
            color: data?.oquv_reja?.holat === "tasdiqlangan" ? palette.green : palette.amber,
          }}>
            {data?.oquv_reja?.holat === "tasdiqlangan" ? "✓ TASDIQLANGAN" : "VAQTINCHA · TASDIQLANMAGAN"}
          </span>
          <span className="text-[11px]" style={{ color: palette.muted }}>V{data?.oquv_reja?.versiya || 1}</span>
        </div>
      </div>

      {planMessage && <div className="mt-4"><SmartNotice tone={planMessage.tone}>{planMessage.text}</SmartNotice></div>}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <div className="rounded-xl px-4 py-2.5 min-w-[130px]" style={{ background: palette.sky }}>
          <div className="text-[10px] font-black uppercase" style={{ color: palette.blue }}>Sinflar</div>
          <div className="text-xl font-black" style={{ color: palette.ink }}>{data.sinflar?.length || 0} ta</div>
        </div>
        <div className="rounded-xl px-4 py-2.5 min-w-[130px]" style={{ background: palette.mint }}>
          <div className="text-[10px] font-black uppercase" style={{ color: palette.teal }}>Fanlar</div>
          <div className="text-xl font-black" style={{ color: palette.ink }}>{planSubjects.length} ta</div>
        </div>
        <div className="rounded-xl px-4 py-2.5 min-w-[170px]" style={{ background: palette.cream }}>
          <div className="text-[10px] font-black uppercase" style={{ color: palette.amber }}>Maktab haftalik jami</div>
          <div className="text-xl font-black" style={{ color: palette.ink }}>{planSchoolTotal} soat</div>
        </div>
        <button onClick={autoFillPlanTemplate} className="px-5 py-3 rounded-xl text-xs font-black text-white" style={{ background: palette.teal }}>
          ⚡ Rasmiy o‘quv reja bilan avtomatik to‘ldirish
        </button>
        <div className="flex-1"/>
        <button onClick={() => savePlan(false)} disabled={planSaving} title="Keyin davom ettirish uchun saqlaydi; reja va dars jadvalini faollashtirmaydi" className="px-4 py-3 rounded-xl text-xs font-black" style={{ background: "#fff", color: palette.blue, border: `1px solid ${palette.blue}` }}>{planSaving ? "Saqlanmoqda..." : "Vaqtincha saqlash · tasdiqlamasdan"}</button>
        <button onClick={() => savePlan(true)} disabled={planSaving} title="O‘quv rejani faol qiladi va o‘qituvchi/jadval avtomatik hisobiga uzatadi" className="px-5 py-3 rounded-xl text-xs font-black text-white" style={{ background: palette.green }}>{planSaving ? "..." : "Saqlash va rejani tasdiqlash"}</button>
      </div>
      <div className="mt-2 text-[10px] text-right" style={{ color: palette.muted }}>
        Vaqtincha saqlash — keyin davom ettirish uchun. Tasdiqlash — o‘qituvchi avtomatik soati va dars jadvali uchun faol qiladi.
      </div>

      {!(data.sinflar || []).length ? <div className="mt-4"><SmartNotice tone="error">
        Kiritilgan sinflar yuklanmadi. Yangilangan backenddagi `samtm_school.py` faylini ham deploy qiling.
      </SmartNotice></div> : <>
        <div className="mt-3 text-[11px]" style={{ color: palette.muted }}>
          Sinflar qatorlarda, fanlar ustunlarda. Bo‘sh/0 katak — fan bu sinfda yo‘q. Fanlar va tegishli sinflar “Boshlang‘ich sozlamalar”dagi saqlangan tanlovdan keladi.
        </div>
        <div className="mt-3 rounded-2xl border overflow-auto max-h-[68vh]" style={{ borderColor: palette.line }}>
          <table className="border-collapse text-xs" style={{ minWidth: `${175 + planSubjects.length * 54 + 90}px`, width: "100%" }}>
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30 p-3 text-left min-w-[175px]" style={{ background: palette.ink, color: "#fff" }}>SINF ↓ / FAN →</th>
                {planSubjects.map(subject => <th key={subject} className="p-0 text-center min-w-[54px] h-[165px]" title={subject} style={{ background: palette.ink, color: "#fff", borderLeft: "1px solid rgba(255,255,255,.18)" }}>
                  <div className="mx-auto text-[10px] font-black leading-tight" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", maxHeight: 155 }}>{subject}</div>
                </th>)}
                <th className="p-2 text-center min-w-[90px]" style={{ background: palette.blue, color: "#fff" }}>HAFTALIK<br/>JAMI</th>
              </tr>
            </thead>
            <tbody>
              {(data.sinflar || []).map((cls, classIndex) => {
                const classTotal = planSubjects.reduce((sum, subject) => sum + Number(planCells[planCellKey(cls.id, subject)] || 0), 0);
                return <tr key={cls.id} className="border-t" style={{ borderColor: palette.line }}>
                  <th className="sticky left-0 z-10 p-2.5 text-left" style={{ background: classIndex % 2 ? "#F8FBFD" : "#fff", color: palette.ink, borderRight: `1px solid ${palette.line}` }}>
                    <div className="font-black">{cls.sinf}-{cls.harf}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: palette.muted }}>{cls.smena}-smena</div>
                  </th>
                  {planSubjects.map(subject => {
                  const value = Number(planCells[planCellKey(cls.id, subject)] || 0);
                  return <td key={subject} className="p-1 text-center" style={{ background: value > 0 ? palette.greenBg : (classIndex % 2 ? "#F8FBFD" : "#fff"), borderLeft: `1px solid ${palette.line}` }}>
                    <input aria-label={`${cls.sinf}-${cls.harf} ${subject}`} type="number" min="0" max="20" step="0.5" value={value || ""} placeholder="—" onChange={event => updatePlanCell(cls.id, subject, event.target.value)} className="w-11 px-1 py-2 rounded-lg border text-center font-black" style={{ borderColor: value > 0 ? "#8FC4A5" : palette.line, color: value > 0 ? palette.green : palette.muted }}/>
                  </td>;
                })}
                  <th className="p-2 text-center text-sm font-black" style={{ background: palette.blue, color: "#fff" }}>{classTotal}</th>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </>}
    </Card>}

    {data?.oquv_reja?.holat !== "tasdiqlangan" && <SmartNotice tone="warning">
      {planOnly
        ? "Rejani tekshirib tasdiqlasangiz, o‘qituvchi qatorlaridagi haftalik soat avtomatik chiqadi. O‘qituvchini qo‘lda qo‘shish esa hozir ham ochiq."
        : "O‘quv reja tasdiqlanmagan: fan, sinf/guruh va haftalik soatni qo‘lda kiritib saqlashingiz mumkin. Faqat avtomatik soat va jadval manbasi reja tasdiqlanguncha ishlamaydi."}
    </SmartNotice>}

    {!planOnly && <>
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>{SAMTM_TEACHER_FIRST_RELEASE} · asosiy kiritish usuli</div>
          <h2 className="text-xl font-black mt-1" style={{ color: palette.ink }}>O‘qituvchi bo‘yicha fan–sinf–guruh yuklamasi</h2>
          <p className="text-xs mt-1 max-w-3xl" style={{ color: palette.muted }}>
            Har bir qator bitta aniq dars: o‘qituvchi + fan + sinf + guruh + haftalik soat.
            Fizika, Astronomiya va Iqtisod bir o‘qituvchida bo‘lsa ham aralashmaydi.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={openPlanReference} className="px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2" style={{ background: palette.amberBg, color: palette.amber }}><BookOpen size={16}/> O‘quv rejani ko‘rish</button>
          {!creatingNew && teacher && <button type="button" onClick={() => setDeleteCandidate(teacher)} className="px-4 py-3 rounded-xl text-xs font-black" style={{ background: palette.redBg, color: palette.red }}>O‘qituvchini o‘chirish</button>}
        </div>
      </div>

      <div className="grid xl:grid-cols-[320px_1fr] gap-4 mt-5">
        <div className="rounded-2xl p-4" style={{ background: palette.cream }}>
          {!creatingNew && <button onClick={startNewTeacher} className="w-full px-4 py-3 rounded-xl text-sm font-black text-white" style={{ background: palette.teal }}>
            + Yangi o‘qituvchini qo‘lda kiritish
          </button>}
          {creatingNew ? <div id="new-teacher-form" className="space-y-3 scroll-mt-4">
            <div>
              <div className="text-sm font-black" style={{ color: palette.ink }}>Yangi o‘qituvchi</div>
              <div className="text-[11px] mt-1" style={{ color: palette.muted }}><b>* Majburiy:</b> F.I.Sh., mutaxassislik, haftalik maqsad soati va kamida bitta aniq dars qatori.</div>
            </div>
            {(data?.oqituvchilar || []).length > 0 && <div className="rounded-xl border p-2.5" style={{ borderColor: palette.line, background: "#fff" }}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] font-black uppercase" style={{ color: palette.teal }}>Saqlangan o‘qituvchilar</div>
                <div className="text-[9px]" style={{ color: palette.muted }}>Eng yangi yuqorida</div>
              </div>
              <div className="space-y-1 mt-2 max-h-36 overflow-auto pr-1">
                {[...(data?.oqituvchilar || [])].sort((left, right) =>
                  Number(String(right.user_id) === recentlyCreatedTeacherId) - Number(String(left.user_id) === recentlyCreatedTeacherId)
                ).map(item => {
                  const total = (data?.hisob?.oqituvchilar || []).find(
                    value => String(value.user_id) === String(item.user_id)
                  );
                  const recent = String(item.user_id) === recentlyCreatedTeacherId;
                  return <button type="button" key={item.user_id} onClick={() => {
                    setCreatingNew(false);
                    setSelectedTeacher(String(item.user_id));
                    setEntryCode("");
                    setMessage(null);
                  }} className="w-full rounded-lg px-2.5 py-2 text-left border" style={{ background: recent ? palette.greenBg : palette.sky, borderColor: recent ? "#8FC4A5" : palette.line }}>
                    <div className="text-[11px] font-black truncate" style={{ color: palette.ink }}>{recent ? "YANGI · " : ""}{item.full_name}</div>
                    <div className="text-[9px] mt-0.5 truncate" style={{ color: palette.muted }}>
                      {total?.haftalik_jami || 0} soat · {specialtyLabelV195(item.mutaxassisligi, specialtyOptions) || "mutaxassislik kiritilmagan"}
                    </div>
                  </button>;
                })}
              </div>
              <div className="text-[9px] mt-1.5" style={{ color: palette.muted }}>O‘qituvchini bossangiz uning yuklamasi tahrirlash uchun ochiladi.</div>
            </div>}
            <label className="block text-xs font-black" style={{ color: palette.ink }}>F.I.Sh. <span style={{ color: palette.red }}>*</span>
              <input autoFocus value={newTeacher.full_name} onChange={event => setNewTeacher(current => ({ ...current, full_name: event.target.value }))} placeholder="Masalan: Aliyev Anvar Akmalovich" className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-white" style={{ borderColor: palette.line }}/>
            </label>
            {renderSpecialtyPicker(true)}
            <label className="block text-xs font-black" style={{ color: palette.ink }}>Haftalik maqsad soati <span style={{ color: palette.red }}>*</span>
              <input type="number" min="1" max="60" step="1" value={newTeacher.haftalik_maqsad_soat} onChange={event => setNewTeacher(current => ({ ...current, haftalik_maqsad_soat: event.target.value }))} placeholder="Masalan: 25" className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-white" style={{ borderColor: palette.line }}/>
              <span className="block mt-1 text-[10px] font-normal" style={{ color: palette.muted }}>Bu maqsad. Haqiqiy yuklama pastdagi qatorlardan hisoblanadi.</span>
            </label>
            <div className="pt-1 text-[10px] font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>Ixtiyoriy ma’lumotlar</div>
            <label className="block text-xs font-black" style={{ color: palette.ink }}>Tug‘ilgan yili
              <input type="number" min="1900" max={new Date().getFullYear()} value={newTeacher.tugilgan_yili} onChange={event => setNewTeacher(current => ({ ...current, tugilgan_yili: event.target.value }))} placeholder="Masalan: 1988" className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-white" style={{ borderColor: palette.line }}/>
            </label>
            <label className="block text-xs font-black" style={{ color: palette.ink }}>Ish staji (yil)
              <input type="number" min="0" max="60" value={newTeacher.ish_staji} onChange={event => setNewTeacher(current => ({ ...current, ish_staji: event.target.value }))} placeholder="Masalan: 8" className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-white" style={{ borderColor: palette.line }}/>
            </label>
            <label className="block text-xs font-black" style={{ color: palette.ink }}>Toifasi
              <select value={newTeacher.toifasi} onChange={event => setNewTeacher(current => ({ ...current, toifasi: event.target.value }))} className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-white" style={{ borderColor: palette.line }}>
                <option value="">Belgilanmagan</option>
                {teacherCategoriesV192.map(category => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label className="block text-xs font-black" style={{ color: palette.ink }}>Sinf rahbarligi
              <select value={newTeacher.rahbar_sinf_id} onChange={event => setNewTeacher(current => ({ ...current, rahbar_sinf_id: event.target.value }))} className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-white" style={{ borderColor: palette.line }}>
                <option value="">Sinf rahbari emas</option>
                {(data?.sinflar || []).map(cls => <option key={cls.id} value={cls.id} disabled={Boolean(cls.rahbar_user_id)}>
                  {cls.sinf}-{cls.harf}{cls.rahbar_user_id ? ` · ${cls.rahbar_ismi || "rahbari bor"}` : ""}
                </option>)}
              </select>
              <span className="block mt-1 text-[10px] font-normal" style={{ color: palette.muted }}>Rahbari bor sinflar tanlanmaydi.</span>
            </label>
            {(() => {
              const leaderClass = (data?.sinflar || []).find(cls => String(cls.id) === String(newTeacher.rahbar_sinf_id));
              const grade = Number(String(leaderClass?.sinf || "").match(/\d+/)?.[0] || 0);
              return grade >= 1 && grade <= 4 ? <button onClick={addPrimaryTeacherPlan} disabled={data?.oquv_reja?.holat !== "tasdiqlangan"} className="w-full px-4 py-3 rounded-xl text-xs font-black text-white disabled:opacity-45 disabled:cursor-not-allowed" style={{ background: palette.green }} title={data?.oquv_reja?.holat === "tasdiqlangan" ? "Mos fanlar reja soati bilan qo‘shiladi" : "Avtomatik soat uchun o‘quv reja tasdiqlanishi kerak"}>
                ⚡ {data?.oquv_reja?.holat === "tasdiqlangan" ? "Sinf rahbari fanlarini reja bo‘yicha qo‘shish" : "Avto fan/soat · reja tasdiqlanmagan"}
              </button> : null;
            })()}
            <button onClick={cancelNewTeacher} className="w-full px-4 py-2.5 rounded-xl text-xs font-black" style={{ background: "#fff", color: palette.red, border: `1px solid ${palette.line}` }}>Bekor qilish</button>
          </div> : <>
            <label className="block text-xs font-black mt-3" style={{ color: palette.ink }}>
              O‘qituvchi qidirish
              <div className="relative mt-1.5">
                <Search size={15} className="absolute left-3 top-3" style={{ color: palette.muted }}/>
                <input value={query} onChange={event => setQuery(event.target.value)} placeholder="F.I.Sh." className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white" style={{ borderColor: palette.line }}/>
              </div>
            </label>
            <div className="space-y-1.5 mt-3 max-h-[420px] overflow-auto pr-1">
              {teachers.map(item => {
                const total = (data?.hisob?.oqituvchilar || []).find(
                  value => String(value.user_id) === String(item.user_id)
                );
                const active = String(item.user_id) === String(selectedTeacher);
                return <button key={item.user_id} onClick={() => setSelectedTeacher(String(item.user_id))} className="w-full rounded-xl p-3 text-left border" style={{
                  background: active ? palette.sky : "#fff",
                  borderColor: active ? palette.blue : palette.line,
                }}>
                  <div className="text-sm font-black" style={{ color: palette.ink }}>{item.full_name}</div>
                  <div className="text-[11px] mt-1" style={{ color: palette.muted }}>
                    {total?.haftalik_jami || 0}/{item.haftalik_maqsad_soat || "—"} soat · {specialtyLabelV195(item.mutaxassisligi, specialtyOptions) || "mutaxassislik kiritilmagan"}
                  </div>
                  <div className="text-[10px] mt-0.5 truncate" style={{ color: palette.muted }}>
                    {(item.fanlar_royxati || []).join(", ") || "fan kiritilmagan"}
                  </div>
                </button>;
              })}
              {!teachers.length && <div className="text-xs p-3 text-center" style={{ color: palette.muted }}>O‘qituvchi topilmadi.</div>}
            </div>
          </>}
        </div>

        <div>
          {!creatingNew && <div className="rounded-2xl border p-4 mb-4" style={{ borderColor: palette.line, background: "#fff" }}>
            <div className="grid md:grid-cols-2 gap-3">
              {renderSpecialtyPicker(false)}
              <label className="block text-xs font-black" style={{ color: palette.ink }}>Haftalik maqsad soati
                <input type="number" min="1" max="60" step="1" value={existingProfile.haftalik_maqsad_soat} onChange={event => setExistingProfile(current => ({ ...current, haftalik_maqsad_soat: event.target.value }))} placeholder="Masalan: 25" className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-white" style={{ borderColor: palette.line }}/>
              </label>
            </div>
          </div>}

          <div className="rounded-2xl border p-4 mb-4" style={{ borderColor: palette.line, background: "#F8FBFD" }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-black" style={{ color: palette.ink }}>Mutaxassislik bo‘yicha aqlli yuklama</div>
                <div className="text-[11px] mt-1 max-w-2xl" style={{ color: palette.muted }}>
                  Sinfni tanlang — tizim faqat tasdiqlangan o‘quv rejada shu mutaxassislikka tegishli fanlarni aniq soati bilan qo‘shadi. Mavjud bo‘lmagan fan yaratilmaydi.
                  Sinf yoki fan almashtirilsa soat ham shu juftlik bo‘yicha yangilanadi; qator qo‘shilsa yoki o‘chirilsa jami yuklama darhol qayta hisoblanadi.
                </div>
              </div>
              <button type="button" role="switch" aria-checked={autoSpecialty} onClick={() => changeAutoSpecialty(!autoSpecialty)} className="px-4 py-2.5 rounded-xl text-xs font-black border" style={{
                background: autoSpecialty ? palette.greenBg : "#fff",
                color: autoSpecialty ? palette.green : palette.muted,
                borderColor: autoSpecialty ? "#8FC4A5" : palette.line,
              }}>
                AVTO {autoSpecialty ? "YOQILGAN" : "O‘CHIRILGAN"}
              </button>
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-black uppercase" style={{ color: palette.teal }}>1. Avval mutaxassislikni tanlang</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {activeSpecialtyValues.map((value, index) => {
                  const option = specialtyOptions.find(item => item.value === value);
                  const tone = specialtyColorsV195[index % specialtyColorsV195.length];
                  const active = value === resolvedAutoSpecialty;
                  const classCount = (specialtyClassIdsByValue[value] || []).length;
                  return <button type="button" key={value} onClick={() => setActiveAutoSpecialty(value)} className="px-3 py-2.5 rounded-xl border text-[11px] font-black text-left" style={{
                    background: active ? tone.strong : tone.soft,
                    color: active ? "#fff" : tone.strong,
                    borderColor: tone.line,
                    boxShadow: active ? `0 5px 16px ${tone.strong}33` : "none",
                  }}>
                    {active ? "✓ " : ""}{option?.label || value}
                    <span className="block text-[9px] mt-0.5 opacity-80">{classCount} ta sinf tanlangan</span>
                  </button>;
                })}
                {!activeSpecialtyValues.length && <span className="text-[10px] rounded-lg px-3 py-2" style={{ background: palette.amberBg, color: palette.amber }}>Yuqoridan kamida bitta mutaxassislik tanlang.</span>}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase" style={{ color: activeSpecialtyTone.strong }}>2. Shu mutaxassislik dars o‘tadigan sinflar</span>
              <span className="text-[10px]" style={{ color: data?.oquv_reja?.holat === "tasdiqlangan" ? palette.green : palette.amber }}>
                {data?.oquv_reja?.holat === "tasdiqlangan" ? "Reja tasdiqlangan · avto tayyor" : "Reja tasdiqlanmagan · faqat qo‘lda"}
              </span>
            </div>
            <div className="mt-2 rounded-xl border p-2.5" style={{ borderColor: activeSpecialtyTone.line, background: activeSpecialtyTone.soft }}>
              <div className="text-[9px] font-black uppercase" style={{ color: activeSpecialtyTone.strong }}>Tezkor belgilash</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {specialtyClassQuickRangesV195.map(range => {
                  const rangeIds = specialtyClassIdsForQuickRange(range);
                  const exactSelection = rangeIds.length > 0 &&
                    rangeIds.length === specialtyClassIds.length &&
                    rangeIds.every(id => specialtyClassIds.includes(id));
                  return <button type="button" key={range.key} onClick={() => quickSelectSpecialtyClasses(range)} disabled={!resolvedAutoSpecialty || !rangeIds.length} className="px-3 py-2 rounded-lg border text-[10px] font-black disabled:opacity-40" style={{
                    background: exactSelection ? activeSpecialtyTone.strong : "#fff",
                    color: exactSelection ? "#fff" : activeSpecialtyTone.strong,
                    borderColor: activeSpecialtyTone.line,
                  }}>{exactSelection ? "✓ " : ""}{range.label} · {rangeIds.length}</button>;
                })}
                <button type="button" onClick={() => applySpecialtyAuto([], resolvedAutoSpecialty)} disabled={!resolvedAutoSpecialty || !specialtyClassIds.length} className="px-3 py-2 rounded-lg border text-[10px] font-black disabled:opacity-40" style={{ background: "#fff", color: palette.red, borderColor: "#E8BBBB" }}>Tanlovni tozalash</button>
              </div>
              <div className="text-[9px] mt-1.5" style={{ color: palette.muted }}>Bitta tugma o‘sha bosqichdagi barcha sinflarni tanlaydi va faol mutaxassislikning avto fan-soatlarini darhol yangilaydi.</div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 mt-2">
              {(data?.sinflar || []).map(cls => {
                const active = specialtyClassIds.includes(String(cls.id));
                return <button type="button" key={cls.id} onClick={() => toggleSpecialtyClass(cls.id)} title={active ? "Bu sinfni o‘qituvchi tanlovidan chiqarish" : "Bu sinfni tanlang — avto yuklama tayyorlanadi"} className="px-2 py-2 rounded-lg border text-[11px] font-black" style={{
                  background: active ? activeSpecialtyTone.strong : "#fff",
                  color: active ? "#fff" : palette.ink,
                  borderColor: active ? activeSpecialtyTone.strong : palette.line,
                }}>{active ? "✓ " : ""}{cls.sinf}-{cls.harf}</button>;
              })}
            </div>
            <div className="text-[10px] mt-2" style={{ color: palette.muted }}>
              Rangli sinflar faqat yuqorida faol turgan mutaxassislikka tegishli. Boshqa mutaxassislikka o‘tsangiz oldingi tanlov va qatorlar saqlanib qoladi.
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button type="button" onClick={() => applySpecialtyAuto(specialtyClassIds, resolvedAutoSpecialty)} disabled={!autoSpecialty || !resolvedAutoSpecialty} className="px-4 py-2.5 rounded-xl text-xs font-black text-white disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: activeSpecialtyTone.strong }}>
                Shu mutaxassislik sinflarini qayta to‘ldirish
              </button>
              <button type="button" onClick={() => {
                setAllocationOverviewOpen(true);
                window.requestAnimationFrame(() => document.getElementById("sinf-yuklama-holati")?.scrollIntoView({ behavior: "smooth", block: "start" }));
              }} className="px-4 py-2.5 rounded-xl text-xs font-black border flex items-center gap-2" style={{ background: palette.sky, color: palette.blue, borderColor: palette.line }}>
                <BarChart3 size={15}/> Pastdagi sinf yuklamasi holati ↓
              </button>
              <span className="text-[10px]" style={{ color: palette.muted }}>
                Avtoni o‘chirsangiz, hozirgi qatorlar saqlanadi va faqat qo‘lda o‘zgaradi.
              </span>
            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Stat value={targetHours || "—"} label="haftalik maqsad" tone="blue"/>
            <Stat value={draftWeeklyTotal} label="tanlangan yuklama" tone="teal"/>
            <Stat value={targetHours ? Math.abs(targetDifference) : "—"} label={targetHours ? (targetDifference > 0 ? "soat qoldi" : targetDifference < 0 ? "soat oshdi" : "maqsadga teng") : "farq"} tone={targetDifference < 0 ? "amber" : "green"}/>
            <Stat value={rows.length} label="aniq qator" tone="amber"/>
          </div>
          <div className="mt-2 text-[10px]" style={{ color: palette.muted }}>
            Tanlangan yuklama qatorlarning jonli yig‘indisi: fan/sinf qo‘shilsa ortadi, o‘chirilsa kamayadi. Qo‘lda tuzatilgan soat avto tomonidan qayta bosilmaydi.
          </div>

          <div id="teacher-load-top-actions" className="sticky top-2 z-30 mt-4 p-3 rounded-2xl border grid grid-cols-2 items-center gap-4" style={{ borderColor: palette.line, background: "rgba(255,255,255,.97)", boxShadow: "0 8px 24px rgba(24,50,75,.10)" }}>
            <button onClick={addRow} className="justify-self-start px-4 py-2.5 rounded-xl text-sm font-black" style={{ background: palette.sky, color: palette.blue }}>+ Yana fan / sinf / guruh qatori</button>
            <button onClick={save} disabled={saving} className="justify-self-end px-5 py-3 rounded-xl text-sm font-black text-white disabled:opacity-50" style={{ background: palette.blue }}>
              {saving ? "Saqlanmoqda..." : creatingNew ? "O‘qituvchi va yuklamani saqlash" : "O‘qituvchi yuklamasini saqlash"}
            </button>
          </div>

          <div className="space-y-2 mt-4">
            {rows.map((row, index) => {
              const variants = variantsForClass(row.sinf_id);
              const subjects = subjectsFor(row);
              const allocation = allocationInfo(index, row);
              return <div id={`teacher-load-row-${index}`} key={index} className="rounded-2xl border p-3 grid md:grid-cols-[150px_1fr_155px_90px_90px_150px_38px] gap-2 items-end scroll-mt-24" style={{ borderColor: row.auto_specialty ? "#8FC4A5" : palette.line, background: row.auto_specialty ? palette.greenBg : "#FCFDFE" }}>
                <label className="text-[11px] font-black" style={{ color: palette.muted }}>Sinf <span style={{ color: palette.red }}>*</span>{row.auto_specialty && <span className="ml-1 px-1.5 py-0.5 rounded" style={{ background: palette.green, color: "#fff" }}>AVTO</span>}
                  <select value={row.sinf_id} onChange={event => {
                    const classId = event.target.value;
                    const approved = data?.oquv_reja?.holat === "tasdiqlangan";
                    const firstPlan = approved ? planForClass(classId)[0] : null;
                    const firstConfigured = (data?.fan_sinflari || []).find(item => String(item.sinf_id) === String(classId))?.fanlar?.[0];
                    applyRowChoice(index, {
                      sinf_id: classId,
                      guruh_kaliti: "whole",
                      fan_nomi: firstPlan?.fan_nomi || firstConfigured || "",
                    });
                  }} className="w-full mt-1 p-2 rounded-lg border bg-white">
                    {(data?.sinflar || []).map(cls => <option key={cls.id} value={cls.id}>{cls.sinf}-{cls.harf}</option>)}
                  </select>
                </label>
                <label className="text-[11px] font-black" style={{ color: palette.muted }}>Fan <span style={{ color: palette.red }}>*</span>
                  <select value={row.fan_nomi} onChange={event => {
                    const subject = event.target.value;
                    applyRowChoice(index, {
                      fan_nomi: subject,
                    });
                  }} className="w-full mt-1 p-2 rounded-lg border bg-white">
                    {!subjects.includes(row.fan_nomi) && row.fan_nomi && <option value={row.fan_nomi}>{row.fan_nomi}</option>}
                    {subjects.map(subject => {
                      const candidate = { ...row, fan_nomi: subject };
                      const info = allocationInfo(index, candidate);
                      const same = allocationKey(candidate) === allocationKey(row);
                      return <option key={subject} value={subject} disabled={!same && info.approved && info.maxForRow <= 0}>{subject}{!same && info.approved && info.maxForRow <= 0 ? " · soati to‘liq olingan" : ""}</option>;
                    })}
                  </select>
                </label>
                <label className="text-[11px] font-black" style={{ color: palette.muted }}>Guruh / butun sinf <span style={{ color: palette.red }}>*</span>
                  <select value={row.guruh_kaliti} onChange={event => {
                    const nextKey = event.target.value;
                    const choices = subjectsFor({ ...row, guruh_kaliti: nextKey });
                    const subject = choices.some(item => subjectKeyV193(item) === subjectKeyV193(row.fan_nomi))
                      ? row.fan_nomi : (choices[0] || row.fan_nomi);
                    applyRowChoice(index, {
                      guruh_kaliti: nextKey,
                      fan_nomi: subject,
                    });
                  }} className="w-full mt-1 p-2 rounded-lg border bg-white">
                    {variants.map(variant => {
                      const candidate = { ...row, guruh_kaliti: variant.guruh_kaliti };
                      const info = allocationInfo(index, candidate);
                      const same = allocationKey(candidate) === allocationKey(row);
                      return <option key={variant.guruh_kaliti} value={variant.guruh_kaliti} disabled={!same && info.approved && info.maxForRow <= 0}>{variant.guruh_nomi}{!same && info.approved && info.maxForRow <= 0 ? " · to‘liq" : ""}</option>;
                    })}
                  </select>
                </label>
                <label className="text-[11px] font-black" style={{ color: palette.muted }}>Haftalik soat <span style={{ color: palette.red }}>*</span>
                  <input type="number" min="1" max={allocation.approved ? Math.max(1, allocation.maxForRow) : 20} step="1" value={row.haftalik_soat} placeholder="Qo‘lda yozing" onChange={event => {
                    if (event.target.value === "") return update(index, { haftalik_soat: "" });
                    const requested = Math.max(1, Number(event.target.value || 1));
                    if (allocation.approved && requested > allocation.maxForRow) {
                      update(index, { haftalik_soat: allocation.maxForRow });
                      setMessage({
                        tone: "warning",
                        text: `${row.fan_nomi}: reja ${allocation.planHours} soat. Boshqa o‘qituvchi yoki yuqoridagi qatorlarda ${allocation.outsideHours + allocation.draftOtherHours} soat tanlangan; faqat ${allocation.maxForRow} soat qoldi.`,
                      });
                      return;
                    }
                    update(index, { haftalik_soat: requested });
                  }} className="w-full mt-1 p-2 rounded-lg border" style={{ borderColor: allocation.approved && allocation.remainingAfterRow === 0 ? "#8FC4A5" : palette.line }}/>
                  <span className="block mt-1 text-[9px] font-normal" style={{ color: data?.oquv_reja?.holat === "tasdiqlangan" ? palette.green : palette.amber }}>
                    {data?.oquv_reja?.holat === "tasdiqlangan"
                      ? `Reja ${allocation.planHours} · band ${allocation.outsideHours + allocation.draftOtherHours + allocation.currentHours} · qoldi ${allocation.remainingAfterRow}${row.guruh_kaliti !== "whole" ? " · har guruh alohida" : ""}`
                      : `Avto soat yo‘q · qo‘lda yozing${row.guruh_kaliti !== "whole" ? " · shu guruhning o‘ziga" : ""}`}
                  </span>
                </label>
                <label className="text-[11px] font-black" style={{ color: palette.muted }}>Kunlik max · jadval
                  <input type="number" min="1" max="4" value={row.kunlik_max} onChange={event => update(index, { kunlik_max: event.target.value })} className="w-full mt-1 p-2 rounded-lg border"/>
                </label>
                <label className="text-[11px] font-black" style={{ color: palette.muted }}>Xona · jadval
                  <select value={row.xona_id || ""} onChange={event => update(index, { xona_id: event.target.value })} className="w-full mt-1 p-2 rounded-lg border bg-white">
                    <option value="">Sinf xonasi</option>
                    {(data?.xonalar || []).map(room => <option key={room.id} value={room.id}>{room.nomi}</option>)}
                  </select>
                </label>
                <button onClick={() => setRows(current => current.filter((_, rowIndex) => rowIndex !== index))} className="h-9 rounded-lg font-black" style={{ background: palette.redBg, color: palette.red }}>×</button>
              </div>;
            })}
          </div>

          {!rows.length && <div className="mt-4"><SmartNotice tone="info">{teacher?.full_name || "Bu o‘qituvchi"} uchun hali dars qatori yo‘q. “Yangi fan–sinf qatori”ni bosing.</SmartNotice></div>}
        </div>
      </div>
    </Card>

    <Card className="p-5 scroll-mt-4" id="sinf-yuklama-holati">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black" style={{ color: palette.ink }}>Sinf yuklamasi holati</h3>
          <p className="text-xs mt-1" style={{ color: palette.muted }}>Eski katta sinf/guruh kataklari o‘rniga: reja, berilgan, qolgan va ortiqcha soat. Bu bo‘lim faqat ko‘rish uchun.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2 text-[9px] font-black"><span style={{ color: palette.green }}>● To‘ldi</span><span style={{ color: palette.amber }}>● Qoldi</span><span style={{ color: palette.red }}>● Ortiqcha</span></div>
          <button type="button" onClick={() => setAllocationOverviewOpen(current => !current)} className="px-4 py-2.5 rounded-xl text-xs font-black border" style={{ background: allocationOverviewOpen ? palette.sky : "#fff", color: palette.blue, borderColor: palette.line }}>{allocationOverviewOpen ? "Yig‘ish ▲" : "Ko‘rsatish ▼"}</button>
        </div>
      </div>
      {allocationOverviewOpen && <>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
          <Stat value={(data?.sinflar || []).reduce((sum, cls) => sum + classAllocationSummary(cls.id).nominalRequired, 0)} label="o‘quv reja · ko‘paymaydi" tone="blue"/>
          <Stat value={(data?.sinflar || []).reduce((sum, cls) => sum + classAllocationSummary(cls.id).required, 0)} label="o‘qituvchi yuklama rejasi" tone="blue"/>
          <Stat value={(data?.sinflar || []).reduce((sum, cls) => sum + classAllocationSummary(cls.id).assigned, 0)} label="o‘qituvchilarga berilgan" tone="teal"/>
          <Stat value={(data?.sinflar || []).reduce((sum, cls) => sum + classAllocationSummary(cls.id).remaining, 0)} label="hali taqsimlanmagan" tone="amber"/>
          <Stat value={(data?.sinflar || []).filter(cls => classAllocationSummary(cls.id).complete).length} label="to‘liq sinflar" tone="green"/>
        </div>
        <div className="text-[10px] mt-3" style={{ color: palette.muted }}>Sinfni bosing — fan, 1/2-guruh yoki o‘g‘il/qiz guruhi va qaysi o‘qituvchiga necha soat berilgani ochiladi. Joriy saqlanmagan qator ham hisobga kiradi.</div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mt-3">
          {(data?.sinflar || []).map(cls => {
            const summary = classAllocationSummary(cls.id);
            const statusColor = summary.extra ? palette.red : summary.complete ? palette.green : summary.assigned > 0 ? palette.amber : palette.muted;
            const statusBg = summary.extra ? palette.redBg : summary.complete ? palette.greenBg : summary.assigned > 0 ? palette.amberBg : palette.cream;
            return <button type="button" key={cls.id} onClick={() => openClassAllocationInspector(cls.id)} title={`${cls.sinf}-${cls.harf}: dars reja ${displayAllocationHours(summary.nominalRequired)} soat, guruhlar bilan ${displayAllocationHours(summary.required)} soat; ${displayAllocationHours(summary.assigned)} soat berilgan, ${displayAllocationHours(summary.remaining)} soat qolgan. Batafsil ko‘rish uchun bosing.`} className="rounded-xl border p-2.5 text-left hover:shadow-md" style={{ borderColor: statusColor, background: statusBg }}>
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-black" style={{ color: palette.ink }}>{cls.sinf}-{cls.harf}</span><span className="text-[9px] font-black" style={{ color: statusColor }}>{!summary.required ? "REJA YO‘Q" : summary.extra ? `+${displayAllocationHours(summary.extra)} ORTIQ` : summary.complete ? "TO‘LDI" : `${displayAllocationHours(summary.remaining)} QOLDI`}</span></div>
              <div className="text-[9px] font-bold mt-1" style={{ color: statusColor }}>{summary.required ? `Yuklama: ${displayAllocationHours(summary.assigned)} / ${displayAllocationHours(summary.required)} soat` : "O‘quv reja yo‘q"}</div>
              {summary.required > summary.nominalRequired && <div className="text-[8px] font-black mt-1" style={{ color: palette.blue }}>Dars reja {displayAllocationHours(summary.nominalRequired)} · {summary.groupedSubjects} ta guruhli fan</div>}
              <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: "rgba(255,255,255,.8)" }}><div className="h-full rounded-full" style={{ width: `${summary.percent}%`, background: statusColor }}/></div>
            </button>;
          })}
        </div>
      </>}
    </Card>
    </>}
  </div>;
}


function LoadsStep(props) {
  const [mode, setMode] = useState("teacher");
  const { token, apiBase, maktabId, setup, reload, setStep } = props;
  return <div className="space-y-4">
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black" style={{ color: palette.ink }}>Yuklama kiritish usuli</div>
          <div className="text-xs mt-1" style={{ color: palette.muted }}>O‘qituvchi bo‘yicha kiritish tezroq; eski sinf/Excel usuli ham saqlangan.</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setMode("teacher")} className="px-4 py-2.5 rounded-xl text-xs font-black" style={{
            background: mode === "teacher" ? palette.blue : palette.sky,
            color: mode === "teacher" ? "#fff" : palette.blue,
          }}>O‘qituvchi qo‘shish / yuklama</button>
          <button onClick={() => setMode("legacy")} className="px-4 py-2.5 rounded-xl text-xs font-black" style={{
            background: mode === "legacy" ? palette.blue : palette.cream,
            color: mode === "legacy" ? "#fff" : palette.ink,
          }}>Eski sinf/Excel usuli</button>
        </div>
      </div>
    </Card>
    {mode === "teacher"
      ? <>
          <ClassHourPanel token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} reload={reload} setStep={setStep}/>
          <TeacherFirstLoadEditorV192 token={token} apiBase={apiBase} maktabId={maktabId} onChanged={reload} showPlan={false}/>
        </>
      : <LegacyLoadsStepV191 {...props}/>}
  </div>;
}

function ScheduleGrid({ detail, setup, selectedClass, setSelectedClass, token, apiBase, onRoomChanged }) {
  const classRow = (setup?.sinflar || []).find(c => String(c.id) === String(selectedClass));
  const slots = (detail?.slotlar || []).filter(s => String(s.sinf_id) === String(selectedClass));
  const [roomEditor, setRoomEditor] = useState(null);
  const [roomMessage, setRoomMessage] = useState(null);
  const [savingRoom, setSavingRoom] = useState(false);
  const gradeNumber = Number(String(classRow?.sinf || '').match(/\d+/)?.[0] || 0);
  const rules = setup?.sinf_kun_bloklari || setup?.avtomatik_qoidalar?.sinf_kun_bloklari || [];
  const blockedDays = new Set(rules.filter(rule =>
    (rule.sinf_id != null && String(rule.sinf_id) === String(classRow?.id)) ||
    (rule.sinf_id == null && Number(rule.sinf_daraja) === gradeNumber)
  ).map(rule => Number(rule.hafta_kuni)));
  const shift = Number(classRow?.smena || 1);
  const shiftRow = (setup?.smenalar || []).find(s => Number(s.smena) === shift);
  const sanitaryPeriodLimit = gradeNumber >= 1 && gradeNumber <= 4 ? 5 : 6;
  const periods = Math.min(Number(shiftRow?.dars_soni || 7), sanitaryPeriodLimit);
  const weekdays = Number(setup?.oquv_yili?.hafta_kunlari || 6);

  const openRoomEditor = slot => setRoomEditor({
    slotId: Number(slot.id),
    catalogId: slot.xona_id ? String(slot.xona_id) : "",
    customName: slot.xona_id ? "" : String(slot.xona_nomi || slot.xona_matni || ""),
  });

  const saveRoom = async slot => {
    if (!roomEditor || Number(roomEditor.slotId) !== Number(slot.id)) return;
    setSavingRoom(true);
    setRoomMessage(null);
    try {
      const result = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v3/slot_xonasi?token=${encodeURIComponent(token)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urinish_id: Number(detail?.urinish?.id),
            slot_id: Number(slot.id),
            xona_id: roomEditor.catalogId ? Number(roomEditor.catalogId) : null,
            xona_matni: roomEditor.catalogId ? null : roomEditor.customName.trim() || null,
          }),
        }
      );
      setRoomEditor(null);
      setRoomMessage({ tone: "success", text: `${result.xona || "Sinf xonasi"} saqlandi.${result.yangi_draft ? " Faol jadval saqlanib, yangi draft ochildi." : ""}` });
      await onRoomChanged?.(result);
    } catch (error) {
      setRoomMessage({ tone: "error", text: error.message });
    } finally {
      setSavingRoom(false);
    }
  };

  return (
    <Card className="p-4">
      {roomMessage && <div className="mb-3"><SmartNotice tone={roomMessage.tone}>{roomMessage.text}</SmartNotice></div>}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-black" style={{ color: palette.ink }}>Jadval ko‘rinishi</h3>
          <p className="text-xs" style={{ color: palette.muted }}>1–4-sinflarda jadval 5 qatorgacha, 5–11-sinflarda 6 qatorgacha ko‘rinadi. Parallel guruhlar bitta katak ichida alohida ko‘rinadi.</p>
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
                  {blocked ? <div className="min-h-[58px] flex items-center justify-center text-center text-[10px] font-black" style={{ color: palette.red }}>Bu sinf uchun dars yo‘q</div> : cell.map(slot => <div key={slot.id} className="mb-2 last:mb-0 rounded-lg p-1.5" style={{ background: "rgba(255,255,255,.72)" }}><div className="text-xs font-black" style={{ color: palette.ink }}>{slot.fan_nomi}</div><div className="text-[10px]" style={{ color: palette.muted }}>{slot.oqituvchi_ismi || 'O‘qituvchi yo‘q'}{slot.guruh_kaliti !== 'whole' ? ` · ${slot.guruh_kaliti}` : ''}</div><button type="button" onClick={() => openRoomEditor(slot)} className="mt-1 text-left text-[10px] font-bold" style={{ color: slot.xona_nomi || slot.xona_matni ? palette.blue : palette.red }}>Xona: {slot.xona_nomi || slot.xona_matni || "yozilmagan"} · tahrirlash</button>{Number(roomEditor?.slotId) === Number(slot.id) && <div className="mt-2 rounded-lg border p-2 space-y-1.5" style={{ borderColor: palette.line, background: "#fff" }}><select value={roomEditor.catalogId} onChange={event => setRoomEditor(current => ({ ...current, catalogId: event.target.value }))} className="w-full p-1.5 rounded-lg border bg-white text-[10px]"><option value="">Qo‘lda yozish / sinf xonasi</option>{(setup?.xonalar || []).map(room => <option key={room.id} value={room.id}>{room.nomi}</option>)}</select>{!roomEditor.catalogId && <input value={roomEditor.customName} onChange={event => setRoomEditor(current => ({ ...current, customName: event.target.value }))} placeholder="Masalan: 205 yoki boshqa bino 102" maxLength={80} className="w-full p-1.5 rounded-lg border text-[10px]"/>}<div className="flex gap-1"><button type="button" onClick={() => saveRoom(slot)} disabled={savingRoom} className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-black text-white" style={{ background: palette.blue }}>{savingRoom ? "..." : "Saqlash"}</button><button type="button" onClick={() => setRoomEditor(null)} className="px-2 py-1.5 rounded-lg text-[10px] font-black" style={{ background: palette.cream, color: palette.ink }}>Bekor</button></div></div>}</div>)}
                </div></td>;
              })}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
  );
}


function SanitaryScheduleRulesV1874() {
  return <Card className="p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-black" style={{color:palette.ink}}>Jadval yaratishdan oldingi qattiq qoidalar</h2>
        <p className="text-xs mt-1" style={{color:palette.muted}}>Generator bu qoidalarni avtomatik tekshiradi; majburan tasdiqlash ham ularni buzmaydi.</p>
      </div>
      <span className="px-3 py-2 rounded-xl text-xs font-black" style={{background:palette.greenBg,color:palette.green}}>SanQvaN profili faol</span>
    </div>
    <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3 mt-4">
      <div className="rounded-2xl p-3" style={{background:palette.sky}}><div className="text-sm font-black" style={{color:palette.ink}}>1-sinf</div><div className="text-xs mt-1" style={{color:palette.muted}}>Odatda 4 dars; haftada ko‘pi bilan 2 kun 5 dars. 5-dars faqat yengil fan.</div></div>
      <div className="rounded-2xl p-3" style={{background:palette.sky}}><div className="text-sm font-black" style={{color:palette.ink}}>2–4-sinf</div><div className="text-xs mt-1" style={{color:palette.muted}}>Odatda 4 dars; haftada ko‘pi bilan 4 kun 5 dars. 6-dars qo‘yilmaydi.</div></div>
      <div className="rounded-2xl p-3" style={{background:palette.cream}}><div className="text-sm font-black" style={{color:palette.ink}}>5–11-sinf</div><div className="text-xs mt-1" style={{color:palette.muted}}>Majburiy jadvalda kuniga maksimum 6 dars. 7-darsga majburiy fan qo‘yilmaydi.</div></div>
      <div className="rounded-2xl p-3" style={{background:palette.greenBg}}><div className="text-sm font-black" style={{color:palette.ink}}>Ichki okno yo‘q</div><div className="text-xs mt-1" style={{color:palette.muted}}>1–2–3, bo‘sh 4, keyin 5 ko‘rinishidagi jadval tasdiqlanmaydi.</div></div>
      <div className="rounded-2xl p-3" style={{background:palette.amberBg}}><div className="text-sm font-black" style={{color:palette.ink}}>Fan vaqti</div><div className="text-xs mt-1" style={{color:palette.muted}}>Matematika 1–5; jismoniy tarbiya 3–6 afzal. 1–2 faqat boshqa imkon bo‘lmasa ishlatiladi.</div></div>
    </div>
  </Card>;
}


function SmartSwapPanelV192({ token, apiBase, maktabId, detail, onApplied }) {
  const movableSlots = useMemo(
    () => (detail?.slotlar || []).filter(
      slot => String(slot.fan_nomi || "").trim().toLocaleLowerCase("uz") !== "sinf soati"
    ),
    [detail]
  );
  const [slotId, setSlotId] = useState("");
  const [report, setReport] = useState(null);
  const [autoMode, setAutoMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const first = movableSlots[0];
    if (!movableSlots.some(slot => String(slot.id) === String(slotId))) {
      setSlotId(String(first?.id || ""));
      setReport(null);
    }
  }, [movableSlots, slotId]);

  const loadSuggestions = async () => {
    if (!slotId || !detail?.urinish?.id) return;
    setLoading(true);
    setMessage(null);
    try {
      const result = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v3/almashtirish_tavsiyalari?token=${encodeURIComponent(token)}&urinish_id=${detail.urinish.id}&slot_id=${slotId}`
      );
      setReport(result);
      setAutoMode(Boolean(result.avtomatik_tavsiya));
      if (!result.tavsiyalar?.length) {
        setMessage({ tone: "warning", text: "Bu dars uchun hozir xavfsiz bo‘sh joy yoki almashtirish topilmadi." });
      }
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const changeMode = async next => {
    setAutoMode(next);
    try {
      await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v3/almashtirish_rejimi?token=${encodeURIComponent(token)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maktab_id: maktabId, avtomatik_tavsiya: next }),
        }
      );
    } catch (error) {
      setAutoMode(!next);
      setMessage({ tone: "error", text: error.message });
    }
  };

  const apply = async suggestion => {
    if (!suggestion) return;
    setApplying(true);
    setMessage(null);
    try {
      const result = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v3/almashtirish?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urinish_id: Number(detail.urinish.id),
            slot_id: Number(slotId),
            yangi_hafta_kuni: Number(suggestion.yangi_hafta_kuni),
            yangi_dars_raqami: Number(suggestion.yangi_dars_raqami),
            turi: suggestion.turi,
          }),
        }
      );
      setMessage({
        tone: result.tasdiqlash_mumkin ? "success" : "warning",
        text: `${result.holat}. ${result.yangi_draft ? "Faol jadval saqlanib, alohida yangi draft yaratildi." : "Draft yangilandi."}`,
      });
      setReport(null);
      await onApplied?.(result.urinish_id);
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
      await loadSuggestions();
    } finally {
      setApplying(false);
    }
  };

  const dayName = day => smartDays.find(([value]) => Number(value) === Number(day))?.[1] || day;
  const topSuggestion = report?.tavsiyalar?.[0];

  return <Card className="p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>V19.2 · aqlli o‘zgartirish</div>
        <h2 className="text-xl font-black mt-1" style={{ color: palette.ink }}>Darsni ko‘chirish va xavfsiz almashtirish</h2>
        <p className="text-xs mt-1 max-w-3xl" style={{ color: palette.muted }}>
          Tizim o‘qituvchi, sinf, xona, metod kuni va parallel darsni tekshiradi.
          Avtomatik rejim eng yaxshi variantni beradi; uni o‘chirib variantni qo‘lda tanlash mumkin.
        </p>
      </div>
      <button onClick={() => changeMode(!autoMode)} className="px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2" style={{
        background: autoMode ? palette.greenBg : palette.cream,
        color: autoMode ? palette.green : palette.ink,
      }}>
        {autoMode ? <ToggleRight size={19}/> : <ToggleLeft size={19}/>}
        {autoMode ? "Avtomatik tavsiya yoqilgan" : "Qo‘lda tanlash"}
      </button>
    </div>

    {message && <div className="mt-3"><SmartNotice tone={message.tone}>{message.text}</SmartNotice></div>}

    <div className="grid lg:grid-cols-[1fr_auto] gap-3 mt-4 items-end">
      <label className="text-xs font-black" style={{ color: palette.ink }}>
        Qaysi darsning joyi o‘zgarsin?
        <select value={slotId} onChange={event => { setSlotId(event.target.value); setReport(null); }} className="w-full mt-1.5 p-2.5 rounded-xl border bg-white" style={{ borderColor: palette.line }}>
          {movableSlots.map(slot => <option key={slot.id} value={slot.id}>
            {slot.sinf}-{slot.harf} · {dayName(slot.hafta_kuni)} · {slot.dars_raqami}-dars · {slot.fan_nomi} · {slot.oqituvchi_ismi || "o‘qituvchi yo‘q"}{slot.guruh_kaliti !== "whole" ? ` · ${slot.guruh_kaliti}` : ""}
          </option>)}
        </select>
      </label>
      <button onClick={loadSuggestions} disabled={loading || !slotId} className="px-5 py-2.5 rounded-xl text-sm font-black text-white" style={{ background: palette.blue }}>
        {loading ? "Tekshirilmoqda..." : "Xavfsiz variantlarni ko‘rsatish"}
      </button>
    </div>

    {(report?.parallel_ziddiyatlar || []).length > 0 && <div className="mt-4 space-y-2">
      {report.parallel_ziddiyatlar.map((conflict, index) => <div key={index} className="rounded-xl p-3 text-xs font-bold" style={{ background: palette.redBg, color: palette.red }}>
        {conflict.oqituvchi_ismi}: {dayName(conflict.hafta_kuni)}, {conflict.dars_raqami}-darsda {conflict.sinflar.join(" va ")} parallel tushgan.
      </div>)}
    </div>}

    {report && autoMode && topSuggestion && <div className="mt-4 rounded-2xl border p-4 flex flex-wrap items-center gap-3" style={{ borderColor: "#B9DFC5", background: palette.greenBg }}>
      <div className="flex-1 min-w-[250px]">
        <div className="text-xs font-black uppercase" style={{ color: palette.green }}>Eng yaxshi xavfsiz variant</div>
        <div className="text-sm font-black mt-1" style={{ color: palette.ink }}>
          {dayName(topSuggestion.yangi_hafta_kuni)} · {topSuggestion.yangi_dars_raqami}-dars · {topSuggestion.turi === "almashtirish" ? "almashtirish" : "bo‘sh joyga ko‘chirish"}
        </div>
        <div className="text-xs mt-1" style={{ color: palette.muted }}>{topSuggestion.nishon}</div>
      </div>
      <button onClick={() => apply(topSuggestion)} disabled={applying} className="px-5 py-2.5 rounded-xl text-sm font-black text-white" style={{ background: palette.green }}>
        {applying ? "Bajarilmoqda..." : "Shu variantni qo‘llash"}
      </button>
    </div>}

    {report && !autoMode && <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
      {(report.tavsiyalar || []).map((suggestion, index) => <button key={index} onClick={() => apply(suggestion)} disabled={applying} className="rounded-2xl border p-3 text-left" style={{ borderColor: palette.line, background: "#fff" }}>
        <div className="text-xs font-black" style={{ color: palette.blue }}>
          {dayName(suggestion.yangi_hafta_kuni)} · {suggestion.yangi_dars_raqami}-dars
        </div>
        <div className="text-sm font-black mt-1" style={{ color: palette.ink }}>
          {suggestion.turi === "almashtirish" ? "Almashtirish" : "Bo‘sh joyga ko‘chirish"}
        </div>
        <div className="text-[11px] mt-1" style={{ color: palette.muted }}>{suggestion.nishon}</div>
      </button>)}
    </div>}
  </Card>;
}


function GroupAssignmentReviewV1876({ token, apiBase, maktabId, onReadyChange, onSaved }) {
  const [report, setReport] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [grade, setGrade] = useState("all");
  const [onlyProblems, setOnlyProblems] = useState(false);

  const keyOf = pair => `${pair.sinf_id}|${pair.fan_kaliti}`;
  const makeDraft = pair => ({
    sinf_id: Number(pair.sinf_id),
    fan_nomi: pair.fan_nomi,
    turi: pair.turi || "group",
    tizim_id: pair.tizim_id ? Number(pair.tizim_id) : null,
    asosiy_oqituvchi_user_id: pair.asosiy_oqituvchi_user_id
      ? Number(pair.asosiy_oqituvchi_user_id)
      : null,
    guruhlar: (pair.guruhlar || []).map((group, index) => ({
      guruh_kaliti: group.guruh_kaliti,
      guruh_nomi: group.guruh_nomi,
      oqituvchi_user_id: group.oqituvchi_user_id
        ? Number(group.oqituvchi_user_id)
        : null,
      xona_id: index === 0 ? null : (group.xona_id ? Number(group.xona_id) : null),
    })),
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v2/guruh_tasdiqlash?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`
      );
      setReport(data);
      const next = {};
      (data.fanlar || []).forEach(pair => {
        next[keyOf(pair)] = makeDraft(pair);
      });
      setDrafts(next);
      onReadyChange?.(Boolean(data.tayyor));
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
      onReadyChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, apiBase, maktabId]);

  const updateDraft = (pair, patch) => {
    const key = keyOf(pair);
    setDrafts(previous => ({
      ...previous,
      [key]: { ...(previous[key] || makeDraft(pair)), ...patch },
    }));
  };

  const selectSystem = (pair, systemId) => {
    const system = (pair.tizimlar || []).find(
      row => String(row.id) === String(systemId)
    );
    const current = drafts[keyOf(pair)] || makeDraft(pair);
    const oldByKey = new Map(
      (current.guruhlar || []).map(group => [group.guruh_kaliti, group])
    );
    const imported = pair.import_oqituvchilari || [];

    updateDraft(pair, {
      turi: "group",
      tizim_id: system ? Number(system.id) : null,
      guruhlar: (system?.guruhlar || []).map((group, index) => {
        const old = oldByKey.get(group.guruh_kaliti);
        const suggested = pair.guruhlar?.[index];
        const importedTeacher = imported[index];
        return {
          guruh_kaliti: group.guruh_kaliti,
          guruh_nomi: group.guruh_nomi,
          oqituvchi_user_id:
            old?.oqituvchi_user_id ||
            suggested?.oqituvchi_user_id ||
            importedTeacher?.user_id ||
            null,
          xona_id: index === 0 ? null : (old?.xona_id || suggested?.xona_id || null),
        };
      }),
    });
  };

  const updateGroupTeacher = (pair, groupKey, teacherId) => {
    const key = keyOf(pair);
    const current = drafts[key] || makeDraft(pair);
    updateDraft(pair, {
      guruhlar: (current.guruhlar || []).map(group =>
        group.guruh_kaliti === groupKey
          ? {
              ...group,
              oqituvchi_user_id: teacherId ? Number(teacherId) : null,
            }
          : group
      ),
    });
  };

  const updateGroupRoom = (pair, groupKey, roomId) => {
    const key = keyOf(pair);
    const current = drafts[key] || makeDraft(pair);
    updateDraft(pair, {
      guruhlar: (current.guruhlar || []).map(group =>
        group.guruh_kaliti === groupKey
          ? { ...group, xona_id: roomId ? Number(roomId) : null }
          : group
      ),
    });
  };

  const roomOptionsFor = pair => {
    const subject = String(pair.fan_nomi || "").toLocaleLowerCase("uz");
    const sportSubject = /jismoniy|sport|fizkultura/.test(subject);
    return [...(report?.xonalar || [])].sort((left, right) => {
      const leftPreferred = sportSubject ? left.turi === "sport" : left.turi === "reserve";
      const rightPreferred = sportSubject ? right.turi === "sport" : right.turi === "reserve";
      return Number(rightPreferred) - Number(leftPreferred) || String(left.nomi).localeCompare(String(right.nomi));
    });
  };

  const validateDraft = (pair, draft) => {
    if (!draft) return "Taqsimot topilmadi";
    if (!Number(pair.haftalik_soat || 0)) {
      return "Avval bu sinf–fan uchun haftalik soatni kiriting";
    }
    if (draft.turi === "whole") {
      return draft.asosiy_oqituvchi_user_id
        ? null
        : "Butun sinf uchun o‘qituvchi tanlang";
    }
    if (!draft.tizim_id) return "Guruhlash tizimini tanlang";
    if (!(draft.guruhlar || []).length) return "Guruhlar topilmadi";
    const ids = draft.guruhlar.map(
      group => Number(group.oqituvchi_user_id || 0)
    );
    if (ids.some(id => !id)) return "Har bir guruhga o‘qituvchi tanlang";
    if (new Set(ids).size !== ids.length) {
      return "Parallel guruhlarga turli o‘qituvchi tanlang";
    }
    return null;
  };

  const savePairs = async pairs => {
    const payload = [];
    for (const pair of pairs) {
      const draft = drafts[keyOf(pair)] || makeDraft(pair);
      const error = validateDraft(pair, draft);
      if (error) {
        setMessage({
          tone: "error",
          text: `${pair.sinf} · ${pair.fan_nomi}: ${error}`,
        });
        return;
      }
      payload.push({
        sinf_id: Number(draft.sinf_id),
        fan_nomi: draft.fan_nomi,
        turi: draft.turi,
        tizim_id:
          draft.turi === "group" ? Number(draft.tizim_id) : null,
        asosiy_oqituvchi_user_id:
          draft.turi === "whole"
            ? Number(draft.asosiy_oqituvchi_user_id)
            : null,
        guruhlar:
          draft.turi === "group"
            ? draft.guruhlar.map(group => ({
                guruh_kaliti: group.guruh_kaliti,
                oqituvchi_user_id: Number(group.oqituvchi_user_id),
                xona_id: group.xona_id ? Number(group.xona_id) : null,
              }))
            : [],
      });
    }

    if (!payload.length) return;
    setSaving(true);
    setMessage(null);
    try {
      const data = await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v2/guruh_tasdiqlash?token=${encodeURIComponent(token)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maktab_id: maktabId,
            birikmalar: payload,
          }),
        }
      );
      const pending = data.hisobot?.xulosa?.tasdiqlanmagan || 0;
      setMessage({
        tone: pending ? "warning" : "success",
        text: pending
          ? `${data.tasdiqlangan_soni || payload.length} ta taqsimot saqlandi. Yana ${pending} ta guruhli fan tasdiqlanishi kerak.`
          : "Barcha guruhli fanlar tasdiqlandi va jadval manbasi qayta sinxronlandi.",
      });
      await load();
      await onSaved?.();
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const createSystem = async (pair, type) => {
    setSaving(true);
    setMessage(null);
    try {
      await smartFetch(
        `${apiBase}/api/maktab/aqlli_jadval/v2/guruh_tizimi_tez?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            maktab_id: maktabId,
            sinf_id: Number(pair.sinf_id),
            fan_nomi: pair.fan_nomi,
            turi: type,
          }),
        }
      );
      setMessage({
        tone: "success",
        text:
          type === "alphabet"
            ? `${pair.sinf} uchun 1-guruh / 2-guruh tizimi tayyorlandi.`
            : `${pair.sinf} uchun O‘g‘il / Qiz guruh tizimi tayyorlandi.`,
      });
      await load();
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const visibleClasses = (report?.sinflar || []).filter(cls => {
    if (grade !== "all" && String(cls.sinf_daraja) !== String(grade)) {
      return false;
    }
    if (!onlyProblems) return true;
    return (cls.fanlar || []).some(pair => !pair.tasdiqlangan);
  });
  const visiblePairs = visibleClasses.flatMap(cls => cls.fanlar || []);
  const unresolvedVisible = visiblePairs.filter(pair => !pair.tasdiqlangan);
  const summary = report?.xulosa || {};

  return (
    <Card className="p-5">
      {message && (
        <div className="mb-3">
          <SmartNotice tone={message.tone}>{message.text}</SmartNotice>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black" style={{ color: palette.ink }}>
            1. Sinf guruhlari va o‘qituvchilarini tasdiqlash
          </h2>
          <p className="text-xs mt-1 max-w-3xl" style={{ color: palette.muted }}>
            Sinf yaratishda saqlangan 1/2-guruh, o‘g‘il/qiz yoki mustaqil
            guruhlar Excel importidagi o‘qituvchilar bilan solishtiriladi.
            Masalan 5-A Ingliz tiliga 2 ta o‘qituvchi yozilgan bo‘lsa,
            tizim ularni 1-guruh va 2-guruhga taklif qiladi. Shu oynada
            o‘qituvchilarni almashtirib, jadvaldan oldin tasdiqlaysiz.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2 min-w-[420px]">
          <Stat value={summary.sinf_soni || 0} label="jami sinf" tone="blue" />
          <Stat
            value={summary.guruh_tizimli_sinf_soni || 0}
            label="guruhli sinf"
            tone="teal"
          />
          <Stat
            value={summary.tasdiqlangan || 0}
            label="tasdiqlangan"
            tone="green"
          />
          <Stat
            value={summary.tasdiqlanmagan || 0}
            label="qolgan"
            tone={summary.tasdiqlanmagan ? "red" : "green"}
          />
        </div>
      </div>

      <div
        className="mt-4 rounded-xl p-3 text-xs leading-relaxed"
        style={{ background: palette.sky, color: palette.blue }}
      >
        Guruhli fan sinf rejasida guruhlar soniga ko‘paymaydi. Masalan
        Ingliz tili haftasiga 1 soat va 2 guruh bo‘lsa: sinf rejasida 1 soat,
        1-guruh o‘qituvchisida 1 soat, 2-guruh o‘qituvchisida 1 soat,
        jadvalda esa ikkala guruh bir vaqtda turadigan 1 parallel slot bo‘ladi.
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <select
          value={grade}
          onChange={event => setGrade(event.target.value)}
          className="p-2.5 rounded-xl border bg-white"
        >
          <option value="all">Barcha parallellar</option>
          {Array.from({ length: 11 }, (_, index) => index + 1).map(value => (
            <option key={value} value={value}>
              {value}-sinflar
            </option>
          ))}
        </select>
        <label
          className="px-3 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold"
          style={{ borderColor: palette.line }}
        >
          <input
            type="checkbox"
            checked={onlyProblems}
            onChange={event => setOnlyProblems(event.target.checked)}
          />
          Faqat tasdiqlanmagan/xato fanlar
        </label>
        <button
          onClick={load}
          disabled={loading}
          className="px-3 py-2.5 rounded-xl text-xs font-black"
          style={{ background: palette.sky, color: palette.blue }}
        >
          {loading ? "Yuklanmoqda..." : "Qayta tekshirish"}
        </button>
        <button
          onClick={() => savePairs(unresolvedVisible)}
          disabled={saving || !unresolvedVisible.length}
          className="px-4 py-2.5 rounded-xl text-xs font-black text-white"
          style={{
            background: unresolvedVisible.length ? palette.teal : "#9BA8B2",
          }}
        >
          Ko‘rinayotganlarni saqlash va tasdiqlash
        </button>
      </div>

      {report?.tayyor && (
        <div
          className="mt-4 rounded-xl p-3 text-xs font-bold"
          style={{ background: palette.greenBg, color: palette.green }}
        >
          Barcha guruhli fanlarda guruhlar, o‘qituvchilar va haftalik soatlar
          tasdiqlangan. Endi shablon/reja mosligini tekshirish mumkin.
        </div>
      )}

      <div className="space-y-4 mt-4 max-h-[780px] overflow-auto pr-1">
        {visibleClasses.map(cls => (
          <div
            key={cls.sinf_id}
            className="rounded-2xl border p-4"
            style={{ borderColor: palette.line, background: "#FCFDFE" }}
          >
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <div className="text-lg font-black" style={{ color: palette.ink }}>
                  {cls.sinf} · {cls.smena}-smena
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(cls.tizimlar || []).map(system => (
                    <span
                      key={system.id}
                      className="px-2 py-1 rounded-full text-[10px] font-black"
                      style={{ background: palette.sky, color: palette.blue }}
                    >
                      {system.nomi} · {(system.guruhlar || [])
                        .map(group => `${group.guruh_nomi} (${group.oquvchi_soni ?? group.soni ?? 0})`)
                        .join(" / ")}
                    </span>
                  ))}
                  {!(cls.tizimlar || []).length && (
                    <span className="text-xs" style={{ color: palette.muted }}>
                      Guruhlash tizimi yaratilmagan
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs font-bold" style={{ color: palette.muted }}>
                {(cls.fanlar || []).length} ta guruh tekshiruvi
              </div>
            </div>

            {!(cls.fanlar || []).length ? (
              <div
                className="mt-3 rounded-xl p-3 text-xs"
                style={{ background: palette.cream, color: palette.muted }}
              >
                Bu sinfda hozircha ikki o‘qituvchili yoki guruh tizimiga
                biriktirilgan fan topilmadi.
              </div>
            ) : (
              <div className="space-y-3 mt-3">
                {(cls.fanlar || []).map(pair => {
                  const draft = drafts[keyOf(pair)] || makeDraft(pair);
                  const pairError = validateDraft(pair, draft);
                  const hasAlphabet = (pair.tizimlar || []).some(
                    system => system.turi === "alphabet"
                  );
                  const hasGender = (pair.tizimlar || []).some(
                    system => system.turi === "gender"
                  );

                  return (
                    <div
                      key={keyOf(pair)}
                      className="rounded-2xl border p-3"
                      style={{
                        borderColor: pair.tasdiqlangan
                          ? "#B9DFC5"
                          : pair.xatolar?.length
                            ? "#E9B7B7"
                            : "#E8CF91",
                        background: pair.tasdiqlangan
                          ? palette.greenBg
                          : pair.xatolar?.length
                            ? palette.redBg
                            : palette.amberBg,
                      }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-black" style={{ color: palette.ink }}>
                            {pair.fan_nomi}
                          </div>
                          <div className="text-[11px] mt-1" style={{ color: palette.muted }}>
                            Import:
                            {" "}
                            {(pair.import_oqituvchilari || [])
                              .map(row =>
                                `${row.full_name}${row.guruh_kaliti !== "whole" ? ` (${row.guruh_kaliti})` : ""}`
                              )
                              .join(", ") || "o‘qituvchi yo‘q"}
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 mt-2 max-w-xl">
                            <div className="rounded-lg px-2 py-1.5 text-[10px] font-black" style={{ background: palette.sky, color: palette.blue }}>
                              Sinf rejasi: {pair.sinf_reja_soati ?? pair.haftalik_soat ?? "—"} soat
                            </div>
                            <div className="rounded-lg px-2 py-1.5 text-[10px] font-black" style={{ background: palette.greenBg, color: palette.green }}>
                              Jadval: {pair.jadval_parallel_slot_soni ?? pair.haftalik_soat ?? "—"} parallel slot
                            </div>
                            <div className="rounded-lg px-2 py-1.5 text-[10px] font-black" style={{ background: palette.amberBg, color: palette.amber }}>
                              O‘qituvchi jami: {pair.oqituvchi_soat_jami ?? "—"} soat
                            </div>
                          </div>
                        </div>
                        <span
                          className="px-2 py-1 rounded-full text-[10px] font-black"
                          style={{
                            background: pair.tasdiqlangan
                              ? "#D7F0DF"
                              : pair.xatolar?.length
                                ? "#F7D8D8"
                                : "#FFF0C7",
                            color: pair.tasdiqlangan
                              ? palette.green
                              : pair.xatolar?.length
                                ? palette.red
                                : palette.amber,
                          }}
                        >
                          {pair.tasdiqlangan
                            ? "TASDIQLANGAN"
                            : pair.xatolar?.length
                              ? "TUZATISH KERAK"
                              : "TEKSHIRIB TASDIQLANG"}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-[180px_1fr] gap-2 mt-3">
                        <label className="text-xs font-bold" style={{ color: palette.ink }}>
                          Dars turi
                          <select
                            value={draft.turi}
                            onChange={event =>
                              updateDraft(pair, { turi: event.target.value })
                            }
                            className="w-full mt-1.5 p-2.5 rounded-xl border bg-white"
                          >
                            <option value="group">Guruhlarga bo‘lingan</option>
                            <option value="whole">Butun sinf</option>
                          </select>
                        </label>

                        {draft.turi === "group" ? (
                          <label className="text-xs font-bold" style={{ color: palette.ink }}>
                            Qaysi guruhlash tizimi?
                            <select
                              value={draft.tizim_id || ""}
                              onChange={event => selectSystem(pair, event.target.value)}
                              className="w-full mt-1.5 p-2.5 rounded-xl border bg-white"
                            >
                              <option value="">Tizimni tanlang</option>
                              {(pair.tizimlar || []).map(system => (
                                <option key={system.id} value={system.id}>
                                  {system.nomi}
                                  {system.fan_biriktirilgan
                                    ? " · fan avval biriktirilgan"
                                    : " · tanlansa fanga biriktiriladi"}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <label className="text-xs font-bold" style={{ color: palette.ink }}>
                            Butun sinf o‘qituvchisi
                            <select
                              value={draft.asosiy_oqituvchi_user_id || ""}
                              onChange={event =>
                                updateDraft(pair, {
                                  asosiy_oqituvchi_user_id: event.target.value
                                    ? Number(event.target.value)
                                    : null,
                                })
                              }
                              className="w-full mt-1.5 p-2.5 rounded-xl border bg-white"
                            >
                              <option value="">O‘qituvchini tanlang</option>
                              {(pair.kandidat_oqituvchilar || []).map(teacher => (
                                <option key={teacher.user_id} value={teacher.user_id}>
                                  {teacher.full_name}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                      </div>

                      {draft.turi === "group" && !(pair.tizimlar || []).length && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button
                            onClick={() => createSystem(pair, "alphabet")}
                            disabled={saving}
                            className="px-3 py-2 rounded-xl text-xs font-black"
                            style={{ background: palette.sky, color: palette.blue }}
                          >
                            + 1-guruh / 2-guruh yaratish
                          </button>
                          <button
                            onClick={() => createSystem(pair, "gender")}
                            disabled={saving}
                            className="px-3 py-2 rounded-xl text-xs font-black"
                            style={{ background: palette.cream, color: palette.ink }}
                          >
                            + O‘g‘il / Qiz guruhini yaratish
                          </button>
                        </div>
                      )}

                      {draft.turi === "group" && (pair.tizimlar || []).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {!hasAlphabet && (
                            <button
                              onClick={() => createSystem(pair, "alphabet")}
                              disabled={saving}
                              className="px-3 py-2 rounded-xl text-[11px] font-black"
                              style={{ background: palette.sky, color: palette.blue }}
                            >
                              Boshqa variant: 1/2-guruh
                            </button>
                          )}
                          {!hasGender && (
                            <button
                              onClick={() => createSystem(pair, "gender")}
                              disabled={saving}
                              className="px-3 py-2 rounded-xl text-[11px] font-black"
                              style={{ background: palette.cream, color: palette.ink }}
                            >
                              Boshqa variant: O‘g‘il/Qiz
                            </button>
                          )}
                        </div>
                      )}

                      {draft.turi === "group" && (
                        <div className="grid md:grid-cols-2 gap-2 mt-3">
                          {(draft.guruhlar || []).map((group, groupIndex) => (
                            <label
                              key={group.guruh_kaliti}
                              className="rounded-xl border p-3 text-xs font-bold"
                              style={{
                                borderColor: groupIndex > 0 && !group.xona_id ? "#E4B7AE" : palette.line,
                                background: groupIndex > 0 && !group.xona_id ? "#FFF8F6" : "#fff",
                                color: palette.ink,
                              }}
                            >
                              {group.guruh_nomi}
                              <select
                                value={group.oqituvchi_user_id || ""}
                                onChange={event =>
                                  updateGroupTeacher(
                                    pair,
                                    group.guruh_kaliti,
                                    event.target.value
                                  )
                                }
                                className="w-full mt-1.5 p-2.5 rounded-xl border bg-white"
                              >
                                <option value="">O‘qituvchini tanlang</option>
                                {(pair.kandidat_oqituvchilar || []).map(teacher => (
                                  <option key={teacher.user_id} value={teacher.user_id}>
                                    {teacher.full_name} · reja {teacher.haftalik_dars_soati ?? "—"}
                                  </option>
                                ))}
                              </select>
                              {groupIndex === 0 ? <div className="w-full mt-2 p-2.5 rounded-xl border font-normal" style={{ borderColor: "#B9DFC5", background: palette.greenBg, color: palette.green }}>Xona: sinfning o‘z xonasi</div> : <select
                                value={group.xona_id || ""}
                                onChange={event => updateGroupRoom(pair, group.guruh_kaliti, event.target.value)}
                                className="w-full mt-2 p-2.5 rounded-xl border bg-white"
                                style={{ borderColor: group.xona_id ? palette.line : "#E4B7AE" }}
                              >
                                <option value="">Bo‘linishga xona topilmadi</option>
                                {roomOptionsFor(pair).map(room => <option key={room.id} value={room.id}>{room.nomi} · {room.turi === "sport" ? "sport zal" : room.turi === "reserve" ? "zaxira/guruh" : "dars xonasi"}</option>)}
                              </select>}
                              {groupIndex > 0 && !group.xona_id && <div className="mt-1.5 text-[10px] font-normal" style={{ color: "#B0553A" }}>Bo‘linishga xona topilmadi. Sport zal yoki zaxira xona yarating; zarur bo‘lsa jadvalda xonani qo‘lda yozasiz.</div>}
                              <div className="mt-1 font-normal" style={{ color: palette.muted }}>
                                O‘quvchi: {group.oquvchi_soni ?? 0} · shu guruh
                                o‘qituvchisiga haftasiga {pair.haftalik_soat || "—"} soat
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {(pair.xatolar || []).map((error, index) => (
                        <div key={`e-${index}`} className="text-xs mt-2" style={{ color: palette.red }}>
                          {error}
                        </div>
                      ))}
                      {(pair.ogohlantirishlar || []).map((warning, index) => (
                        <div key={`w-${index}`} className="text-xs mt-2" style={{ color: palette.amber }}>
                          {warning}
                        </div>
                      ))}
                      {pairError && (
                        <div className="text-xs mt-2 font-bold" style={{ color: palette.red }}>
                          {pairError}
                        </div>
                      )}

                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => savePairs([pair])}
                          disabled={saving || Boolean(pairError)}
                          className="px-4 py-2.5 rounded-xl text-xs font-black text-white"
                          style={{ background: pairError ? "#9BA8B2" : palette.blue }}
                        >
                          Saqlash va tasdiqlash
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {!loading && !visibleClasses.length && (
          <div className="p-7 text-center text-sm" style={{ color: palette.muted }}>
            Bu filtr bo‘yicha sinf topilmadi.
          </div>
        )}
      </div>

      <div
        className="mt-4 rounded-xl p-3 text-xs"
        style={{ background: palette.cream, color: palette.muted }}
      >
        Mustaqil guruh a’zolarini o‘zgartirish kerak bo‘lsa, “Asosiy sahifaga
        qaytish”ni bosing va sinf kartasidagi “Ko‘p guruhli boshqaruv”dan
        o‘quvchilar tarkibini tuzating. Bu oynada esa fan va o‘qituvchi
        taqsimoti tasdiqlanadi.
      </div>
    </Card>
  );
}


function GenerateStep({ token, apiBase, maktabId, setup, reload }) {
  const runs = setup?.urinishlar || [];
  const [runId, setRunId] = useState(String(runs[0]?.id || ""));
  const [detail, setDetail] = useState(null);
  const [preflight, setPreflight] = useState(null);
  const [checking, setChecking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [groupReady, setGroupReady] = useState(false);
  const [selectedClass, setSelectedClass] = useState(String(setup?.sinflar?.[0]?.id || ""));

  const loadRun = async id => {
    if (!id) { setDetail(null); return; }
    try {
      const data = await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/urinish?token=${encodeURIComponent(token)}&urinish_id=${id}`);
      setDetail(data);
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    }
  };

  const checkSources = async silent => {
    if (!groupReady) {
      if (!silent) {
        setMessage({ tone: "error", text: "Avval guruhli fanlarda qaysi guruhga qaysi o‘qituvchi kirishini tasdiqlang." });
      }
      return;
    }
    setChecking(true);
    if (!silent) setMessage(null);
    try {
      const report = await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/moslik?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`, { method: "POST" });
      setPreflight(report);
      if (!silent) {
        setMessage({
          tone: report.tayyor ? "success" : "error",
          text: report.tayyor
            ? "Shablon, o‘qituvchi yuklamasi, sinf soatlari va qattiq vaqt cheklovlari bir-biriga mos."
            : `Jadval yaratishdan oldin ${report.xulosa?.xato_soni || report.xatolar?.length || 0} ta xatoni tuzating.`,
        });
      }
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (groupReady) checkSources(true);
    else setPreflight(null);
  }, [maktabId, token, apiBase, groupReady]);
  useEffect(() => { if (runId) loadRun(runId); }, [runId]);
  useEffect(() => {
    if (runs[0]?.id && !runId) setRunId(String(runs[0].id));
  }, [runs, runId]);

  const generate = async () => {
    if (!groupReady) {
      return setMessage({ tone: "error", text: "Avval guruh va o‘qituvchilar taqsimotini tasdiqlang." });
    }
    if (!preflight?.tayyor) {
      return setMessage({ tone: "error", text: "Avval manba mosligi 100% bo‘lishi kerak." });
    }
    setGenerating(true);
    setMessage(null);
    try {
      const data = await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/yaratish?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maktab_id: maktabId, urinishlar_soni: 32 }),
      });
      const match = data.moslik?.xulosa || {};
      setMessage({
        tone: data.tasdiqlash_mumkin ? "success" : "warning",
        text: data.tasdiqlash_mumkin
          ? `Draft 100% mos yaratildi: ${data.joylashtirildi}/${data.jami_soat} soat. Sinf ${match.sinf_mos}/${match.sinf_jami}, o‘qituvchi ${match.oqituvchi_mos}/${match.oqituvchi_jami}, fan ${match.fan_mos}/${match.fan_jami}.`
          : `Draft yaratildi, lekin tasdiqlanmaydi: ${data.joylashtirildi}/${data.jami_soat} soat. Diagnostikadagi farqlarni tuzating.`,
      });
      await reload();
      setRunId(String(data.urinish_id));
      await loadRun(data.urinish_id);
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
      await checkSources(true);
    } finally {
      setGenerating(false);
    }
  };

  const approve = async () => {
    const id = detail?.urinish?.id;
    if (!id) return;
    const diagnostics = detail?.urinish?.diagnostika || {};
    if (!diagnostics.tasdiqlash_mumkin) {
      return setMessage({ tone: "error", text: "Bu draft reja bilan 100% mos emas va tasdiqlanmaydi." });
    }
    try {
      const data = await smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v2/tasdiqlash?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urinish_id: id, majburan: false }),
      });
      setMessage({ tone: "success", text: `Jadval 100% moslik bilan tasdiqlandi. ${data.qayta_taqsimlandi || 0} ta mavzu taqvimi yangilandi.` });
      await reload();
      await loadRun(id);
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
    }
  };

  const diagnostics = detail?.urinish?.diagnostika || {};
  const problems = diagnostics.muammolar || [];
  const warnings = diagnostics.ogohlantirishlar || [];
  const match = diagnostics.jadval_mosligi || {};
  const canApprove = Boolean(diagnostics.tasdiqlash_mumkin && detail?.urinish?.holat === "draft");
  const pre = preflight?.xulosa || {};
  const matchSummary = match.xulosa || {};

  const mismatchRows = [
    ...(match.sinflar || []).filter(row => !row.mos).map(row => ({ type: "Sinf", name: row.sinf, plan: row.reja, actual: row.jadval })),
    ...(match.oqituvchilar || []).filter(row => !row.mos).map(row => ({ type: "O‘qituvchi", name: row.full_name, plan: row.reja, actual: row.jadval })),
    ...(match.fanlar || []).filter(row => !row.mos).map(row => ({ type: "Fan", name: `${row.sinf} · ${row.fan}`, plan: row.reja, actual: row.jadval })),
  ];

  return <div className="space-y-4">
    {message && <SmartNotice tone={message.tone}>{message.text}</SmartNotice>}
    <SanitaryScheduleRulesV1874 />
    <GroupAssignmentReviewV1876
      token={token}
      apiBase={apiBase}
      maktabId={maktabId}
      onReadyChange={setGroupReady}
      onSaved={async () => { await reload(); }}
    />

    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black" style={{ color: palette.ink }}>2. Shablon va reja mosligi</h2>
          <p className="text-xs mt-1" style={{ color: palette.muted }}>Excel DARS_BIRIKMALARI → sinf–fan haftalik soati → o‘qituvchi jami → bo‘sh kun/soatlar birgalikda tekshiriladi.</p>
        </div>
        <button onClick={() => checkSources(false)} disabled={checking || !groupReady} className="px-4 py-2.5 rounded-xl text-sm font-black" style={{ background: groupReady ? palette.sky : "#E6EAED", color: groupReady ? palette.blue : palette.muted }}>{checking ? "Tekshirilmoqda..." : (groupReady ? "Qayta tekshirish" : "Avval guruhlarni tasdiqlang")}</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <Stat value={preflight?.tayyor ? "100%" : "—"} label="manba mosligi" tone={preflight?.tayyor ? "green" : "red"}/>
        <Stat value={`${pre.sinf_soni || 0}`} label="sinf" tone="blue"/>
        <Stat value={`${pre.oqituvchi_soni || 0}`} label="o‘qituvchi" tone="teal"/>
        <Stat value={`${pre.xato_soni || 0}`} label="xato" tone={pre.xato_soni ? "red" : "green"}/>
      </div>

      {(preflight?.xatolar || []).length > 0 && <div className="space-y-2 mt-4 max-h-64 overflow-auto">{preflight.xatolar.map((error, index) => <div key={index} className="rounded-xl p-3 text-xs" style={{ background: palette.redBg, color: palette.red }}>{error}</div>)}</div>}
      {preflight?.tayyor && <div className="mt-4 rounded-xl p-3 text-xs font-bold" style={{ background: palette.greenBg, color: palette.green }}>Har bir sinfning haftalik jami, har bir fanning haftalik soni, har bir o‘qituvchining haftalik yuklamasi va qattiq bo‘sh vaqti bo‘yicha jadval yaratish mumkin.</div>}
    </Card>

    <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-4">
      <Card className="p-5">
        <h2 className="text-xl font-black" style={{ color: palette.ink }}>3. Draft yaratish va tasdiqlash</h2>
        <p className="text-xs mt-1" style={{ color: palette.muted }}>Eski faol jadval yangi draft 100% mos va sinf kunlari oknosiz bo‘lib tasdiqlanmaguncha saqlanadi.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
          <Stat value={detail?.urinish?.sifat ?? "—"} label="sifat /100" tone="blue"/>
          <Stat value={detail?.urinish?.joylashtirildi ?? 0} label="joylashtirildi" tone="green"/>
          <Stat value={detail?.urinish?.joylashtirilmadi ?? 0} label="joylashmadi" tone={detail?.urinish?.joylashtirilmadi ? "red" : "green"}/>
          <Stat value={diagnostics.sinf_oknolari ?? "—"} label="sinf oknosi" tone={diagnostics.sinf_oknolari ? "red" : "green"}/>
        </div>
        <button onClick={generate} disabled={generating || !groupReady || !preflight?.tayyor} className="w-full mt-4 py-3 rounded-xl text-sm font-black text-white" style={{ background: (groupReady && preflight?.tayyor) ? palette.blue : "#9BA8B2" }}>{generating ? "Hisoblanmoqda..." : (!groupReady ? "Avval guruhlarni tasdiqlang" : "Yangi draft yaratish")}</button>
        {detail?.urinish?.holat === "draft" && <button onClick={approve} disabled={!canApprove} className="w-full mt-3 py-3 rounded-xl text-sm font-black text-white" style={{ background: canApprove ? palette.green : "#9BA8B2" }}>{canApprove ? "100% mos draftni tasdiqlash" : "Moslik tugamaguncha tasdiqlanmaydi"}</button>}

        {detail && <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat value={`${matchSummary.sinf_mos || 0}/${matchSummary.sinf_jami || 0}`} label="sinf mos" tone={(matchSummary.sinf_mos === matchSummary.sinf_jami) ? "green" : "red"}/>
          <Stat value={`${matchSummary.oqituvchi_mos || 0}/${matchSummary.oqituvchi_jami || 0}`} label="o‘qituvchi mos" tone={(matchSummary.oqituvchi_mos === matchSummary.oqituvchi_jami) ? "green" : "red"}/>
          <Stat value={`${matchSummary.fan_mos || 0}/${matchSummary.fan_jami || 0}`} label="fan mos" tone={(matchSummary.fan_mos === matchSummary.fan_jami) ? "green" : "red"}/>
        </div>}
      </Card>

      <Card className="p-5">
        <h3 className="font-black mb-3" style={{ color: palette.ink }}>Aniq diagnostika</h3>
        <div className="space-y-2 max-h-[430px] overflow-auto">
          {mismatchRows.map((row, index) => <div key={`m-${index}`} className="rounded-xl p-3" style={{ background: palette.redBg }}><div className="text-sm font-black" style={{ color: palette.ink }}>{row.type} · {row.name}</div><div className="text-xs mt-1" style={{ color: palette.red }}>Reja: {row.plan} · Jadval: {row.actual} · Farq: {row.actual - row.plan}</div></div>)}
          {(match.xatolar || []).map((error, index) => <div key={`x-${index}`} className="rounded-xl p-3 text-xs" style={{ background: palette.redBg, color: palette.red }}>{error}</div>)}
          {problems.map((problem, index) => <div key={`p-${index}`} className="rounded-xl p-3" style={{ background: palette.redBg }}><div className="text-sm font-black" style={{ color: palette.ink }}>{problem.sinf} · {problem.fan}</div><div className="text-xs mt-1" style={{ color: palette.red }}>{problem.sabab}</div></div>)}
          {warnings.map((warning, index) => <div key={`w-${index}`} className="rounded-xl p-3 text-xs" style={{ background: palette.amberBg, color: palette.amber }}>{warning}</div>)}
          {!mismatchRows.length && !(match.xatolar || []).length && !problems.length && !warnings.length && detail && <SmartNotice tone="success">Sinf, fan va o‘qituvchi soatlari 100% mos.</SmartNotice>}
        </div>
      </Card>
    </div>

    {detail && <ScheduleGrid detail={detail} setup={setup} selectedClass={selectedClass} setSelectedClass={setSelectedClass} token={token} apiBase={apiBase} onRoomChanged={async result => { setRunId(String(result.urinish_id)); await reload(); await loadRun(result.urinish_id); }}/>} 
    {detail && <SmartSwapPanelV192
      token={token}
      apiBase={apiBase}
      maktabId={maktabId}
      detail={detail}
      onApplied={async id => {
        await reload();
        setRunId(String(id));
        await loadRun(id);
      }}
    />}
  </div>;
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
  return <div className="min-h-screen"><SmartHeader title={teacherOnly?"Mening jadval sozlamalarim":"Aqlli dars jadvali va yillik reja"} subtitle={teacherOnly?"Bo‘sh vaqt, metod kuni va o‘zingiz dars beradigan sinflarning mavzu rejasi":"Draft yaratish, konfliktlarni ko‘rish va faqat tekshirgandan keyin tasdiqlash"} onClose={onClose}/><SmartStepNav step={step} setStep={setStep} teacherOnly={teacherOnly}/><main className="max-w-[1500px] mx-auto px-4 md:px-7 py-5">{loading?<div className="py-24 flex justify-center"><Loader2 className="animate-spin" size={30} style={{color:palette.blue}}/></div>:error?<SmartNotice tone="error">{error}</SmartNotice>:<>{step===1&&!teacherOnly&&<CalendarStep token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} reload={load} setStep={setStep}/>} {step===2&&<TeacherTimeGridV1869 setup={setup} selectedTeacher={selectedTeacher} setSelectedTeacher={setSelectedTeacher} teacherOnly={teacherOnly} token={token} apiBase={apiBase} maktabId={maktabId} reload={load}/>} {step===3&&!teacherOnly&&<LoadsStep token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} reload={load} setStep={setStep}/>} {step===4&&!teacherOnly&&<GenerateStep token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} reload={load}/>} {step===5&&<TopicsStep token={token} apiBase={apiBase} maktabId={maktabId} setup={setup} teacherOnly={teacherOnly}/>}</>}</main></div>;
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
  const [teacherEditorOpen, setTeacherEditorOpen] = useState(false);
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [curriculumStatus, setCurriculumStatus] = useState(null);

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
      smartFetch(`${apiBase}/api/maktab/aqlli_jadval/v3/yuklama_matritsasi?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`),
    ]).then(([dashboardResult, workloadResult, casesResult, curriculumResult]) => {
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
      if (curriculumResult.status === "fulfilled") {
        setCurriculumStatus(curriculumResult.value.oquv_reja?.holat || "draft");
      } else {
        setCurriculumStatus("draft");
        warnings.push(`O‘quv reja holati yuklanmadi: ${curriculumResult.reason?.message || "server xatosi"}`);
      }
      setLoadWarnings([...new Set(warnings.filter(Boolean))]);
    }).finally(() => setLoading(false));
  };
  useEffect(loadManager, [token, apiBase, maktabId, teacherMode]);

  const jamiOquvchi = dashboard?.bugungi_davomat?.jami_oquvchi
    ?? dashboard?.sinflar?.reduce((a,s)=>a+(Number(s.oquvchi_soni)||0),0) ?? 0;
  const yuklamaMuammo = useMemo(() => yuklama.filter(x => x.holat === "ortiqcha" || x.holat === "yetishmaydi"), [yuklama]);
  const schoolName = dashboard?.maktab_nomi || initialWorkspace?.muassasa_nomi || initialWorkspace?.nomi || (maktabId ? `Maktab #${maktabId}` : "Maktab");
  const curriculumApproved = curriculumStatus === "tasdiqlangan";
  const openTeacherEditor = () => {
    setTeacherEditorOpen(true);
  };

  if (curriculumOpen) {
    return <WorkspacePortal>
      <div className="min-h-screen">
        <SmartHeader title={`${schoolName} · O‘quv reja`} subtitle="Fan → sinf → haftalik soat → tasdiqlash" onClose={() => { setCurriculumOpen(false); loadManager(); }}/>
        <main className="max-w-[1500px] mx-auto px-4 md:px-7 py-5">
          <TeacherFirstLoadEditorV192 token={token} apiBase={apiBase} maktabId={maktabId} planOnly onChanged={loadManager}/>
        </main>
      </div>
    </WorkspacePortal>;
  }

  if (teacherEditorOpen) {
    return <WorkspacePortal>
      <div className="min-h-screen">
        <SmartHeader title={`${schoolName} · O‘qituvchi qo‘shish`} subtitle="F.I.Sh. → fan → sinf yoki guruh → haftalik soat → jadval yuklamasi" onClose={() => setTeacherEditorOpen(false)}/>
        <main className="max-w-[1500px] mx-auto px-4 md:px-7 py-5">
          <TeacherFirstLoadEditorV192
            token={token} apiBase={apiBase} maktabId={maktabId}
            startWithNew showPlan={false} onChanged={loadManager}
          />
        </main>
      </div>
    </WorkspacePortal>;
  }

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
            <button onClick={() => setCurriculumOpen(true)} className="px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2" style={{ background: curriculumApproved ? palette.green : palette.amber, color: "#fff" }}>
              <BookOpen size={16}/> O‘quv reja {curriculumApproved ? "✓" : "· tasdiqlanmagan"}
            </button>
            <button onClick={openTeacherEditor} className="px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2" style={{ background: palette.teal, color: "#fff" }} title={curriculumApproved ? "Reja soati avtomatik chiqadi" : "Qo‘lda fan–sinf–guruh–soat kiritish ochiq; avtomatik soat reja tasdiqlanganda ishlaydi"}><UserCog size={16}/> O‘qituvchi qo‘shish</button>
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
                  <QuickAction icon={<BookOpen size={18}/>} title={`O‘quv reja · ${curriculumApproved ? "tasdiqlangan" : "tasdiqlanmagan"}`} desc="Avval fan–sinf–haftalik soatlarni tekshiring va tasdiqlang." onClick={() => setCurriculumOpen(true)}/>
                  <QuickAction icon={<UserCog size={18}/>} title="O‘qituvchi va yuklama qo‘shish" desc={curriculumApproved ? "F.I.Sh., fanlar, sinf yoki guruhlar va haftalik soatni bitta joyda kiriting." : "Ochiq: soatni qo‘lda yozing. Reja tasdiqlansa soat avtomatik chiqadi."} onClick={openTeacherEditor}/>
                  <QuickAction icon={<CalendarDays size={18}/>} title="Aqlli dars jadvali" desc="Kalendar → bo‘sh vaqt → fan soati → draft → tasdiq → mavzu rejasi." onClick={() => setSmartOpen(1)}/>
                  <QuickAction icon={<BarChart3 size={18}/>} title="Yuklama balansi" desc={`${yuklamaMuammo.length} ta xodimda yuklama farqi bor.`} onClick={() => setSmartOpen(4)}/>
                  <QuickAction icon={<MessageCircle size={18}/>} title="Xabarlar" desc="Maktab, sinf va ishchi guruhlar bo‘yicha muloqot." onClick={onBack}/>
                </div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>O‘qituvchilar</div>
                    <div className="text-lg font-black mt-1" style={{ color: palette.ink }}>Haftalik yuklama</div>
                  </div>
                  <button onClick={openTeacherEditor} className="px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2" style={{ background: palette.teal, color: "#fff" }}>
                    <UserCog size={16}/> + O‘qituvchi
                  </button>
                </div>
                <div className="space-y-2 max-h-[390px] overflow-auto pr-1">
                  {yuklama.slice(0,30).map(x=>{const reja=x.haftalik_reja_jami??x.haftalik_dars_soati;const amaldagi=Number(x.amaldagi_soat??x.biriktirilgan_soat??x.jadvaldagi_soat??0);const bad=x.holat==="ortiqcha";const ok=x.holat==="toliq";return <div key={x.user_id} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background:ok?palette.greenBg:bad?palette.redBg:palette.cream }}><div className="flex-1 min-w-0"><div className="text-sm font-bold truncate" style={{ color:palette.ink }}>{x.full_name}</div><div className="text-xs mt-0.5 truncate" style={{ color:palette.muted }}>{x.lavozim==="psixolog"?`Psixolog · ${x.psixolog_sinf_soni||0} sinf`:`${x.fanlari||"Fan belgilanmagan"}${x.sinf_soati_soni?` · +${x.sinf_soati_soni} sinf soati`:""}`}</div></div><div className="text-right"><div className="text-sm font-black" style={{ color:bad?palette.red:ok?palette.green:palette.amber }}>{amaldagi}/{reja??"—"}</div><div className="text-[10px]" style={{ color:palette.muted }}>{x.hisob_manbasi==="tasdiqlangan_jadval"?"jadval soati":"biriktirilgan soat"}</div></div></div>})}
                  {!yuklama.length&&<div className="rounded-2xl border-2 border-dashed p-5 text-center" style={{ borderColor: palette.line, background: palette.cream }}>
                    <div className="text-sm font-black" style={{ color: palette.ink }}>Hali o‘qituvchi kiritilmagan</div>
                    <div className="text-xs mt-1" style={{ color: palette.muted }}>F.I.Sh., fan, sinf yoki guruh va haftalik soatni qo‘lda kiriting.</div>
                    <button onClick={openTeacherEditor} className="mt-3 px-5 py-3 rounded-xl text-sm font-black text-white" style={{ background: palette.teal }}>
                      + Birinchi o‘qituvchini qo‘shish
                    </button>
                  </div>}
                </div>
              </Card>
              <Card className="p-5"><div className="flex items-center justify-between mb-4"><div><div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>Sinflar</div><div className="text-lg font-black mt-1" style={{ color: palette.ink }}>Maktab xaritasi</div></div><BookOpen size={21} style={{ color: palette.blue }}/></div><div className="grid grid-cols-2 gap-2.5 max-h-[390px] overflow-auto pr-1">{(dashboard?.sinflar||[]).map(s=><div key={s.id} className="rounded-2xl p-3.5" style={{ background:palette.cream }}><div className="text-base font-black" style={{ color:palette.ink }}>{s.sinf}-{s.harf}</div><div className="text-xs mt-1" style={{ color:palette.muted }}>{s.oquvchi_soni} o‘quvchi</div><div className="text-xs mt-1 truncate" style={{ color:s.rahbar_ismi?palette.teal:palette.amber }}>Rahbar: {s.rahbar_ismi||"belgilanmagan"}</div><div className="text-xs mt-1 truncate" style={{ color:s.psixolog_ismi?"#6B4E9B":palette.muted }}>Psixolog: {s.psixolog_ismi||"belgilanmagan"}</div></div>)}</div></Card>
            </div>
          </>}
        </main>
      </div>
    </WorkspacePortal>
  );
}
