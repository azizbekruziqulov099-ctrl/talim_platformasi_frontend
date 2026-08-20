// SAMTM V18.51 — Aqlli jadval, kalendar, metod kuni va mavzu rejasi.
// SAMTM V18.49 — blank sahifa tuzatildi: React importi tiklandi.
// SAMTM V18.48 — manager loading/fallback tuzatildi.
import React, { useEffect, useMemo, useState } from "react";
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



function SmartTimetablePanel({ token, apiBase, maktabId, onClose }) {
  const [tab, setTab] = useState("calendar");
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [calendar, setCalendar] = useState({ nomi:"2026/2027", boshlanish:"", tugash:"", hafta_kunlari:6, choraklar:[1,2,3,4].map(chorak=>({chorak,boshlanish:"",tugash:"",holat:"taxminiy"})) });
  const [day, setDay] = useState({ sana:"", turi:"bayram", nomi:"", holat:"tasdiqlangan" });
  const [teacherId, setTeacherId] = useState("");
  const [time, setTime] = useState({ hafta_kuni:1, dars_raqami:1, turi:"band", qattiq:true, izoh:"" });
  const [classId, setClassId] = useState("");
  const [fan, setFan] = useState("");
  const [hours, setHours] = useState({ haftalik_soat:1, kunlik_max:1, ketma_ket_mumkin:false });
  const [gen, setGen] = useState(null);
  const [topicText, setTopicText] = useState("");
  const [quarter, setQuarter] = useState(1);

  const load = () => {
    if (!maktabId) return;
    setBusy(true); setMsg("");
    fetch(`${apiBase}/api/maktab/aqlli_jadval/sozlamalar?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`)
      .then(r=>r.json().then(d=>({ok:r.ok,d})))
      .then(({ok,d})=>{ if(!ok||d.detail) throw new Error(d.detail||"Yuklanmadi"); setData(d); if(d.oquv_yili){setCalendar({nomi:d.oquv_yili.nomi,boshlanish:String(d.oquv_yili.boshlanish||"").slice(0,10),tugash:String(d.oquv_yili.tugash||"").slice(0,10),hafta_kunlari:d.oquv_yili.hafta_kunlari,choraklar:(d.choraklar||[]).map(q=>({chorak:q.chorak,boshlanish:String(q.boshlanish||"").slice(0,10),tugash:String(q.tugash||"").slice(0,10),holat:q.holat}))});}})
      .catch(e=>setMsg(e.message)).finally(()=>setBusy(false));
  };
  useEffect(load,[token,apiBase,maktabId]);

  const req = async (url, options={}) => {
    setBusy(true); setMsg("");
    try { const r=await fetch(url,options); const d=await r.json(); if(!r.ok||d.detail) throw new Error(d.detail||"Xato"); setMsg("Saqlandi ✓"); return d; }
    catch(e){setMsg(e.message||"Xato"); throw e;} finally{setBusy(false);}
  };

  const saveCalendar = async()=>{ await req(`${apiBase}/api/maktab/aqlli_jadval/kalendar?token=${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:Number(maktabId),...calendar})}); load(); };
  const saveDay = async()=>{ await req(`${apiBase}/api/maktab/aqlli_jadval/kun?token=${encodeURIComponent(token)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:Number(maktabId),...day})}); load(); };
  const saveTime = async()=>{ if(!teacherId)return setMsg("O'qituvchini tanlang"); await req(`${apiBase}/api/maktab/aqlli_jadval/oqituvchi_vaqti?token=${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:Number(maktabId),user_id:Number(teacherId),...time,dars_raqami:time.turi==="metod_kuni"?null:Number(time.dars_raqami)})}); load(); };
  const saveHours = async()=>{ if(!classId||!fan.trim())return setMsg("Sinf va fanni kiriting"); await req(`${apiBase}/api/maktab/aqlli_jadval/fan_soati?token=${encodeURIComponent(token)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:Number(maktabId),sinf_id:Number(classId),fan_nomi:fan,...hours,haftalik_soat:Number(hours.haftalik_soat),kunlik_max:Number(hours.kunlik_max)})}); load(); };
  const generate = async()=>{ const d=await req(`${apiBase}/api/maktab/aqlli_jadval/yarat?token=${encodeURIComponent(token)}&maktab_id=${maktabId}&darslar_kuniga=7`,{method:"POST"}); setGen(d); };
  const saveTopics = async()=>{ if(!classId||!fan.trim())return setMsg("Sinf va fanni tanlang"); const mavzular=topicText.split("\n").map(x=>x.trim()).filter(Boolean).map((mavzu)=>({mavzu,soat:1,turi:"mavzu"})); await req(`${apiBase}/api/maktab/aqlli_jadval/mavzu_reja?token=${encodeURIComponent(token)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({maktab_id:Number(maktabId),sinf_id:Number(classId),fan_nomi:fan,chorak:Number(quarter),mavzular})}); };
  const distribute = async()=>{ const d=await req(`${apiBase}/api/maktab/aqlli_jadval/mavzularni_taqsimlash?token=${encodeURIComponent(token)}&maktab_id=${maktabId}&sinf_id=${classId}&fan=${encodeURIComponent(fan)}&chorak=${quarter}`,{method:"POST"}); setMsg(`Taqsimlandi: ${d.dars_soni} dars. Avto qo'shimcha: ${(d.avto_qoshildi||[]).length}`); };

  const tabs=[['calendar','1. O‘quv kalendari'],['teacher','2. O‘qituvchi vaqti'],['hours','3. Fan soatlari'],['generate','4. Jadval yaratish'],['topics','5. Mavzu rejasi']];
  return <div className="fixed inset-0 z-50 overflow-auto" style={{background:"#F6F8FA"}}>
    <div className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur"><div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[.12em]" style={{color:palette.teal}}>Aqlli yordamchi</div><div className="text-xl font-black" style={{color:palette.ink}}>Dars jadvali va yillik reja</div></div><button onClick={onClose} className="px-4 py-2 rounded-xl font-bold" style={{background:palette.cream}}>Yopish</button></div></div>
    <div className="max-w-7xl mx-auto px-4 py-5">
      <div className="flex gap-2 overflow-auto pb-2 mb-4">{tabs.map(([k,l])=><button key={k} onClick={()=>setTab(k)} className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-black" style={{background:tab===k?palette.blue:'#fff',color:tab===k?'#fff':palette.ink,border:`1px solid ${palette.line}`}}>{l}</button>)}</div>
      {msg&&<div className="mb-4 rounded-xl p-3 text-sm font-bold" style={{background:msg.includes('✓')?palette.greenBg:palette.amberBg,color:msg.includes('✓')?palette.green:palette.amber}}>{msg}</div>}
      {busy&&<div className="mb-4 text-sm" style={{color:palette.muted}}>Ishlanmoqda...</div>}

      {tab==='calendar'&&<div className="grid lg:grid-cols-[1fr_.8fr] gap-4"><Card className="p-5"><h3 className="font-black text-lg">O‘quv yili va 4 chorak</h3><p className="text-xs mt-1 mb-4" style={{color:palette.muted}}>Taxminiy sanalar sariq, tasdiqlangan sanalar yashil. Tizim taxminiy sanani hech qachon rasmiy deb ko‘rsatmaydi.</p><div className="grid md:grid-cols-4 gap-2 mb-4"><input value={calendar.nomi} onChange={e=>setCalendar({...calendar,nomi:e.target.value})} className="border rounded-xl p-2" placeholder="2026/2027"/><input type="date" value={calendar.boshlanish} onChange={e=>setCalendar({...calendar,boshlanish:e.target.value})} className="border rounded-xl p-2"/><input type="date" value={calendar.tugash} onChange={e=>setCalendar({...calendar,tugash:e.target.value})} className="border rounded-xl p-2"/><select value={calendar.hafta_kunlari} onChange={e=>setCalendar({...calendar,hafta_kunlari:Number(e.target.value)})} className="border rounded-xl p-2"><option value={5}>5 kun</option><option value={6}>6 kun</option></select></div><div className="space-y-2">{calendar.choraklar.map((q,i)=><div key={q.chorak} className="grid grid-cols-[70px_1fr_1fr_130px] gap-2 items-center"><b>{q.chorak}-chorak</b><input type="date" value={q.boshlanish} onChange={e=>{const a=[...calendar.choraklar];a[i]={...a[i],boshlanish:e.target.value};setCalendar({...calendar,choraklar:a})}} className="border rounded-xl p-2"/><input type="date" value={q.tugash} onChange={e=>{const a=[...calendar.choraklar];a[i]={...a[i],tugash:e.target.value};setCalendar({...calendar,choraklar:a})}} className="border rounded-xl p-2"/><select value={q.holat} onChange={e=>{const a=[...calendar.choraklar];a[i]={...a[i],holat:e.target.value};setCalendar({...calendar,choraklar:a})}} className="border rounded-xl p-2"><option value="taxminiy">Taxminiy</option><option value="tasdiqlangan">Tasdiqlangan</option></select></div>)}</div><button onClick={saveCalendar} className="mt-4 px-5 py-3 rounded-xl text-white font-black" style={{background:palette.blue}}>Kalendarni saqlash</button></Card>
      <Card className="p-5"><h3 className="font-black text-lg">Maxsus kun qo‘shish</h3><div className="grid gap-2 mt-4"><input type="date" value={day.sana} onChange={e=>setDay({...day,sana:e.target.value})} className="border rounded-xl p-2"/><select value={day.turi} onChange={e=>setDay({...day,turi:e.target.value})} className="border rounded-xl p-2"><option value="bayram">Bayram / dam</option><option value="tatil">Ta’til</option><option value="qoshimcha_dam">Qo‘shimcha dam</option><option value="oqish">O‘qish kuni</option><option value="qoshimcha_oqish">Qo‘shimcha o‘qish kuni</option></select><input value={day.nomi} onChange={e=>setDay({...day,nomi:e.target.value})} className="border rounded-xl p-2" placeholder="Masalan: Bayram"/><select value={day.holat} onChange={e=>setDay({...day,holat:e.target.value})} className="border rounded-xl p-2"><option value="tasdiqlangan">Tasdiqlangan</option><option value="taxminiy">Taxminiy</option></select><button onClick={saveDay} className="px-4 py-2.5 rounded-xl text-white font-black" style={{background:palette.teal}}>Kunni belgilash</button></div><div className="mt-4 space-y-1 max-h-64 overflow-auto">{(data?.maxsus_kunlar||[]).map(x=><div key={x.id} className="rounded-xl p-2 text-xs" style={{background:['dam','bayram','tatil','qoshimcha_dam'].includes(x.turi)?'#FDECEC':x.holat==='taxminiy'?'#FFF4D8':'#E9F7EF'}}><b>{String(x.sana).slice(0,10)}</b> · {x.nomi||x.turi} · {x.holat}</div>)}</div></Card></div>}

      {tab==='teacher'&&<div className="grid lg:grid-cols-[.8fr_1.2fr] gap-4"><Card className="p-5"><h3 className="font-black text-lg">O‘qituvchi bo‘sh vaqti / metod kuni</h3><select value={teacherId} onChange={e=>setTeacherId(e.target.value)} className="w-full border rounded-xl p-2 mt-4"><option value="">O‘qituvchini tanlang</option>{(data?.oqituvchilar||[]).map(x=><option key={x.user_id} value={x.user_id}>{x.full_name} — {x.fanlari||'fan yo‘q'}</option>)}</select><div className="grid grid-cols-2 gap-2 mt-2"><select value={time.hafta_kuni} onChange={e=>setTime({...time,hafta_kuni:Number(e.target.value)})} className="border rounded-xl p-2">{['Dush','Sesh','Chor','Pay','Jum','Shan'].map((x,i)=><option value={i+1} key={x}>{x}</option>)}</select><input type="number" min="1" max="10" value={time.dars_raqami} disabled={time.turi==='metod_kuni'} onChange={e=>setTime({...time,dars_raqami:Number(e.target.value)})} className="border rounded-xl p-2"/></div><select value={time.turi} onChange={e=>setTime({...time,turi:e.target.value})} className="w-full border rounded-xl p-2 mt-2"><option value="band">Bu vaqtda dars qo‘ymang</option><option value="afzal_bosh">Iloji bo‘lsa bo‘sh qoldir</option><option value="metod_kuni">Metod kuni</option></select><label className="flex gap-2 items-center text-sm mt-3"><input type="checkbox" checked={time.qattiq} onChange={e=>setTime({...time,qattiq:e.target.checked})}/> Qattiq cheklov</label><button onClick={saveTime} className="mt-3 px-4 py-2.5 rounded-xl text-white font-black" style={{background:palette.blue}}>Saqlash</button></Card><Card className="p-5"><h3 className="font-black text-lg">Kiritilgan cheklovlar</h3><div className="mt-3 space-y-2 max-h-[420px] overflow-auto">{(data?.vaqtlar||[]).map(x=><div key={x.id} className="rounded-xl p-3" style={{background:palette.cream}}><b>{(data?.oqituvchilar||[]).find(t=>String(t.user_id)===String(x.user_id))?.full_name||x.user_id}</b><div className="text-xs mt-1" style={{color:palette.muted}}>{x.hafta_kuni}-kun · {x.turi} · {x.dars_raqami?`${x.dars_raqami}-dars`:'butun kun'} · {x.qattiq?'qattiq':'yumshoq'}</div></div>)}</div></Card></div>}

      {tab==='hours'&&<Card className="p-5"><h3 className="font-black text-lg">Sinf–fan haftalik soatlari</h3><p className="text-xs mt-1" style={{color:palette.muted}}>Generator aynan shu soatlarni joylashtiradi.</p><div className="grid md:grid-cols-5 gap-2 mt-4"><select value={classId} onChange={e=>setClassId(e.target.value)} className="border rounded-xl p-2"><option value="">Sinf</option>{(data?.sinflar||[]).map(x=><option key={x.id} value={x.id}>{x.sinf}-{x.harf}</option>)}</select><input value={fan} onChange={e=>setFan(e.target.value)} placeholder="Fan nomi" className="border rounded-xl p-2"/><input type="number" min="0" max="20" value={hours.haftalik_soat} onChange={e=>setHours({...hours,haftalik_soat:Number(e.target.value)})} className="border rounded-xl p-2"/><input type="number" min="1" max="4" value={hours.kunlik_max} onChange={e=>setHours({...hours,kunlik_max:Number(e.target.value)})} className="border rounded-xl p-2"/><button onClick={saveHours} className="rounded-xl text-white font-black" style={{background:palette.teal}}>Saqlash</button></div><div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-2">{(data?.fan_soatlari||[]).map((x,i)=><div key={i} className="rounded-xl p-3" style={{background:palette.cream}}><b>{(data?.sinflar||[]).find(s=>String(s.id)===String(x.sinf_id))?.sinf}-{(data?.sinflar||[]).find(s=>String(s.id)===String(x.sinf_id))?.harf} · {x.fan_nomi}</b><div className="text-xs">{x.haftalik_soat} soat/hafta · kuniga max {x.kunlik_max}</div></div>)}</div></Card>}

      {tab==='generate'&&<div className="grid lg:grid-cols-[.8fr_1.2fr] gap-4"><Card className="p-5"><h3 className="font-black text-lg">Aqlli jadval yaratish</h3><p className="text-sm mt-2" style={{color:palette.muted}}>O‘qituvchi konflikti, sinf konflikti, metod kuni, band vaqt va fan kunlik maksimumi hisobga olinadi.</p><button onClick={generate} className="mt-5 px-5 py-3 rounded-xl text-white font-black" style={{background:palette.blue}}>✨ Jadvalni yaratish</button></Card><Card className="p-5">{gen?<><div className="text-4xl font-black" style={{color:gen.sifat>=90?palette.green:palette.amber}}>{gen.sifat}/100</div><div className="text-sm mt-1">Jadval sifati</div><div className="grid grid-cols-3 gap-2 mt-4"><Stat value={gen.jami_soat} label="jami soat" tone="blue"/><Stat value={gen.joylashtirildi} label="joylashdi" tone="green"/><Stat value={gen.joylashtirilmadi} label="joylashmadi" tone={gen.joylashtirilmadi?'red':'green'}/></div>{(gen.muammolar||[]).length>0&&<div className="mt-4 space-y-1">{gen.muammolar.slice(0,10).map((x,i)=><div key={i} className="text-xs rounded-xl p-2" style={{background:palette.redBg}}>{x.fan}: {x.sabab}</div>)}</div>}</>:<div className="text-sm" style={{color:palette.muted}}>Natija shu yerda chiqadi.</div>}</Card></div>}

      {tab==='topics'&&<Card className="p-5"><h3 className="font-black text-lg">Chorak mavzu rejasi → real sanalarga avtomatik</h3><p className="text-xs mt-1" style={{color:palette.muted}}>Har qatorga bitta mavzu yozing. Chorakdagi dars soni mavzu soatidan ko‘p bo‘lsa, tizim zaxirani nazorat ishi → xatolar tahlili → mustahkamlash → masalalar yechish tarzida taklif qilib to‘ldiradi. O‘qituvchi keyin o‘zgartira oladi.</p><div className="grid md:grid-cols-3 gap-2 mt-4"><select value={classId} onChange={e=>setClassId(e.target.value)} className="border rounded-xl p-2"><option value="">Sinf</option>{(data?.sinflar||[]).map(x=><option key={x.id} value={x.id}>{x.sinf}-{x.harf}</option>)}</select><input value={fan} onChange={e=>setFan(e.target.value)} placeholder="Fan" className="border rounded-xl p-2"/><select value={quarter} onChange={e=>setQuarter(Number(e.target.value))} className="border rounded-xl p-2">{[1,2,3,4].map(x=><option key={x} value={x}>{x}-chorak</option>)}</select></div><textarea value={topicText} onChange={e=>setTopicText(e.target.value)} rows={12} className="w-full border rounded-xl p-3 mt-3 font-mono text-sm" placeholder={'1-mavzu\n2-mavzu\n3-mavzu'}></textarea><div className="flex gap-2 mt-3"><button onClick={saveTopics} className="px-4 py-2.5 rounded-xl text-white font-black" style={{background:palette.teal}}>Mavzularni saqlash</button><button onClick={distribute} className="px-4 py-2.5 rounded-xl text-white font-black" style={{background:palette.blue}}>Sanaga avtomatik taqsimlash</button></div></Card>}
    </div>
  </div>;
}

function TeacherAvailabilityPanel({ token, apiBase, onClose }) {
  const [data,setData]=useState(null); const [form,setForm]=useState({hafta_kuni:1,dars_raqami:1,turi:'band',qattiq:true,izoh:''}); const [msg,setMsg]=useState('');
  const load=()=>fetch(`${apiBase}/api/maktab/aqlli_jadval/mening_vaqtim?token=${encodeURIComponent(token)}`).then(r=>r.json()).then(setData).catch(()=>setMsg('Yuklanmadi'));
  useEffect(load,[token,apiBase]);
  const save=async()=>{const r=await fetch(`${apiBase}/api/maktab/aqlli_jadval/mening_vaqtim?token=${encodeURIComponent(token)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,dars_raqami:form.turi==='metod_kuni'?null:Number(form.dars_raqami)})});const d=await r.json();setMsg(d.detail||'Saqlandi ✓');if(!d.detail)load();};
  return <div className="fixed inset-0 z-50 overflow-auto p-4" style={{background:'#F6F8FA'}}><div className="max-w-3xl mx-auto"><div className="flex justify-between items-center mb-4"><div><div className="text-xs font-black uppercase" style={{color:palette.teal}}>Mening jadvalim</div><h2 className="text-2xl font-black">Bo‘sh vaqt va metod kuni</h2></div><button onClick={onClose} className="px-4 py-2 rounded-xl" style={{background:palette.cream}}>Yopish</button></div><Card className="p-5"><p className="text-sm" style={{color:palette.muted}}>O‘zingizga noqulay vaqtni yoki metod kunini belgilang. Qattiq cheklov bo‘lsa generator u yerga dars qo‘ymaydi.</p><div className="grid md:grid-cols-3 gap-2 mt-4"><select value={form.hafta_kuni} onChange={e=>setForm({...form,hafta_kuni:Number(e.target.value)})} className="border rounded-xl p-2">{['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'].map((x,i)=><option key={x} value={i+1}>{x}</option>)}</select><input type="number" min="1" max="10" disabled={form.turi==='metod_kuni'} value={form.dars_raqami} onChange={e=>setForm({...form,dars_raqami:Number(e.target.value)})} className="border rounded-xl p-2"/><select value={form.turi} onChange={e=>setForm({...form,turi:e.target.value})} className="border rounded-xl p-2"><option value="band">Bu vaqtda dars yo‘q</option><option value="afzal_bosh">Iloji bo‘lsa bo‘sh</option><option value="metod_kuni">Metod kuni</option></select></div><label className="flex gap-2 mt-3"><input type="checkbox" checked={form.qattiq} onChange={e=>setForm({...form,qattiq:e.target.checked})}/> Qattiq cheklov</label><button onClick={save} className="mt-4 px-5 py-3 rounded-xl text-white font-black" style={{background:palette.blue}}>Saqlash</button>{msg&&<div className="mt-3 text-sm font-bold">{msg}</div>}</Card><div className="mt-4 space-y-2">{(data?.sozlamalar||[]).map(x=><Card key={x.id} className="p-3"><b>{x.hafta_kuni}-kun · {x.turi}</b><div className="text-xs" style={{color:palette.muted}}>{x.dars_raqami?`${x.dars_raqami}-dars`:'butun kun'} · {x.qattiq?'qattiq':'yumshoq'}</div></Card>)}</div></div></div>;
}


export default function SchoolWorkspace({ token, apiBase, initialWorkspace, onBack, onLegacy, adminPreview = false }) {
  const maktabId = initialWorkspace?.muassasa_id || initialWorkspace?.id;
  const lavozim = String(initialWorkspace?.lavozim || "").toLowerCase();
  const teacherMode = !["direktor", "zam_direktor_uquv", "zam_direktor_tarbiya"].includes(lavozim) && lavozim;
  const [dashboard, setDashboard] = useState(null);
  const [yuklama, setYuklama] = useState([]);
  const [holatlar, setHolatlar] = useState([]);
  const [loading, setLoading] = useState(!teacherMode);
  const [error, setError] = useState("");
  const [adminPreviewOpen, setAdminPreviewOpen] = useState(false);
  const [smartTimetableOpen, setSmartTimetableOpen] = useState(false);
  const [teacherAvailabilityOpen, setTeacherAvailabilityOpen] = useState(false);

  const loadManager = () => {
    if (teacherMode) return;
    if (!maktabId) {
      setDashboard(null);
      setYuklama([]);
      setHolatlar([]);
      setError("Maktab ID topilmadi. Muassasani qayta tanlang yoki sahifani yangilang.");
      setLoading(false);
      return;
    }
    setLoading(true); setError("");
    Promise.all([
      fetch(`${apiBase}/api/maktab/dashboard?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`).then(r => r.json()),
      fetch(`${apiBase}/api/maktab/yuklama_xulosasi?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`).then(r => r.json()),
      fetch(`${apiBase}/api/maktab/aqlli_holatlar?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`).then(r => r.json()),
    ]).then(([d, y, h]) => {
      if (d.detail) setError(d.detail); else setDashboard(d);
      setYuklama(y.xodimlar || []); setHolatlar(h.holatlar || []);
    }).catch(() => setError("Maktab bosh sahifasini yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  };
  useEffect(loadManager, [token, apiBase, maktabId, teacherMode]);

  const jamiOquvchi = dashboard?.bugungi_davomat?.jami_oquvchi ?? dashboard?.sinflar?.reduce((a,s)=>a+(Number(s.oquvchi_soni)||0),0) ?? 0;
  const yuklamaMuammo = useMemo(() => yuklama.filter(x => x.holat === "ortiqcha" || x.holat === "yetishmaydi"), [yuklama]);

  if (smartTimetableOpen) {
    return (
      <SmartTimetablePanel
        token={token}
        apiBase={apiBase}
        maktabId={maktabId}
        onClose={() => setSmartTimetableOpen(false)}
      />
    );
  }

  if (teacherAvailabilityOpen) {
    return (
      <TeacherAvailabilityPanel
        token={token}
        apiBase={apiBase}
        onClose={() => setTeacherAvailabilityOpen(false)}
      />
    );
  }

  if (adminPreview && adminPreviewOpen) {
    return (
      <AdminRolePreview
        token={token}
        apiBase={apiBase}
        maktabId={maktabId}
        schoolName={dashboard?.maktab_nomi || initialWorkspace?.muassasa_nomi || initialWorkspace?.nomi || "Maktab"}
        onClose={() => setAdminPreviewOpen(false)}
      />
    );
  }

  if (teacherMode) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#F8FBFD 0%,#F7F4ED 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-7 py-5 md:py-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm mb-5" style={{ color: palette.muted }}><ArrowLeft size={16}/> Ish maydoniga qaytish</button>
          <div className="mb-5">
            <div className="text-xs font-black tracking-[.14em] uppercase" style={{ color: palette.teal }}>Mening maktabim</div>
            <h1 className="text-2xl md:text-3xl font-black mt-1" style={{ color: palette.ink }}>{initialWorkspace?.muassasa_nomi || initialWorkspace?.nomi || "Maktab"}</h1>
            <p className="text-sm mt-1" style={{ color: palette.muted }}>Bugungi darslar va sizga kerakli ishlar bir joyda.</p>
            <button onClick={() => setTeacherAvailabilityOpen(true)} className="mt-3 px-4 py-2.5 rounded-xl text-sm font-black" style={{ background: palette.sky, color: palette.blue }}>Bo‘sh vaqt / metod kunini sozlash</button>
          </div>
          <TeacherToday token={token} apiBase={apiBase}/>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(circle at top right,#E9F7F5 0,transparent 33%),linear-gradient(180deg,#F8FBFD 0%,#F7F4ED 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-7 py-5 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-sm" style={{ color: palette.muted }}><ArrowLeft size={16}/> Muassasalarga qaytish</button>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSmartTimetableOpen(true)} className="px-3 py-2 rounded-xl text-xs font-black flex items-center gap-2" style={{ background: palette.sky, border: `1px solid #CFE2F3`, color: palette.blue }}><CalendarDays size={14}/> Aqlli dars jadvali</button>
            {adminPreview && <button onClick={() => setAdminPreviewOpen(true)} className="px-3 py-2 rounded-xl text-xs font-black flex items-center gap-2" style={{ background: palette.greenBg, border: `1px solid #CFE8D9`, color: palette.green }}><Eye size={14}/> Rol sifatida ko'rish</button>}
            <button onClick={loadManager} className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2" style={{ background: "#fff", border: `1px solid ${palette.line}`, color: palette.blue }}><RefreshCw size={14}/> Yangilash</button>
            {onLegacy && <button onClick={onLegacy} className="px-3 py-2 rounded-xl text-xs font-bold" style={{ background: palette.sky, color: palette.blue }}>Batafsil boshqaruv</button>}
          </div>
        </div>

        <Card className="p-5 md:p-7 mb-5" style={{ background: "linear-gradient(135deg,#153D5A,#0D7378)", borderColor: "transparent", color: "#fff" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="text-xs font-bold tracking-[.14em] uppercase opacity-75">Maktab boshqaruv markazi</div>
              <h1 className="text-2xl md:text-4xl font-black mt-2">{dashboard?.maktab_nomi || initialWorkspace?.muassasa_nomi || initialWorkspace?.nomi || (maktabId ? `Maktab #${maktabId}` : "Maktab")}</h1>
              <p className="text-sm mt-2 opacity-80 max-w-2xl">Bugungi holat, sinflar, o'qituvchi yuklamasi va e'tibor talab qiladigan vaziyatlar — bir qarashda.</p>
            </div>
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,.14)" }}><School size={31}/></div>
          </div>
        </Card>

        {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" size={30} style={{ color: palette.blue }}/></div> : error ? <Card className="p-6"><p style={{ color: palette.red }}>{error}</p></Card> : <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            <Stat icon={<GraduationCap size={18}/>} value={jamiOquvchi} label="o'quvchi" tone="blue" />
            <Stat icon={<School size={18}/>} value={dashboard?.sinflar?.length ?? 0} label="sinf" tone="teal" />
            <Stat icon={<UserRoundCheck size={18}/>} value={dashboard?.bugungi_davomat?.kelgan ?? 0} label="bugun kelgan" tone="green" />
            <Stat icon={<ClipboardCheck size={18}/>} value={dashboard?.bugungi_davomat?.sinflar_belgilamagan ?? 0} label="davomat kiritmagan sinf" tone={dashboard?.bugungi_davomat?.sinflar_belgilamagan ? "amber" : "green"} />
            <Stat icon={<BellRing size={18}/>} value={holatlar.length} label="ochiq aqlli holat" tone={holatlar.length ? "red" : "green"} />
          </div>

          <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-4 mb-5">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div><div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>Bugun maktabda</div><div className="text-lg font-black mt-1" style={{ color: palette.ink }}>Tezkor nazorat</div></div>
                <LayoutDashboard size={22} style={{ color: palette.blue }}/>
              </div>
              <div className="space-y-2.5">
                {(dashboard?.bugungi_davomat?.sinflar_belgilamagan || 0) > 0 && <div className="rounded-2xl p-3.5 flex gap-3" style={{ background: palette.amberBg }}><AlertTriangle size={19} style={{ color: palette.amber }} /><div><div className="text-sm font-bold" style={{ color: palette.ink }}>{dashboard.bugungi_davomat.sinflar_belgilamagan} ta sinf davomat kiritmagan</div><div className="text-xs mt-0.5" style={{ color: palette.muted }}>Faqat kelmagan/kechikkan o'quvchini belgilash rejimi ham qo'llab-quvvatlanadi.</div></div></div>}
                {holatlar.slice(0,4).map(h => <div key={h.id} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: h.daraja >= 3 ? palette.redBg : palette.cream }}><div className="w-8 h-8 rounded-xl flex items-center justify-center font-black" style={{ background: "#fff", color: h.daraja >= 3 ? palette.red : palette.amber }}>{h.daraja}</div><div className="flex-1"><div className="text-sm font-bold" style={{ color: palette.ink }}>{h.full_name}</div><div className="text-xs mt-0.5" style={{ color: palette.muted }}>{h.sarlavha}</div></div></div>)}
                {!holatlar.length && !(dashboard?.bugungi_davomat?.sinflar_belgilamagan || 0) && <div className="rounded-2xl p-5 flex items-center gap-3" style={{ background: palette.greenBg }}><CheckCircle2 style={{ color: palette.green }}/><div className="text-sm font-bold" style={{ color: palette.green }}>Hozircha shoshilinch signal yo'q.</div></div>}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4"><WandSparkles size={20} style={{ color: palette.teal }}/><div className="text-lg font-black" style={{ color: palette.ink }}>Aqlli yordamchi</div></div>
              <div className="space-y-2">
                <QuickAction icon={<CalendarDays size={18}/>} title="Aqlli dars jadvali" desc="Kalendar → bo‘sh vaqt → fan soati → generator → mavzu rejasi." onClick={() => setSmartTimetableOpen(true)}/>
                <QuickAction icon={<BarChart3 size={18}/>} title="Yuklama balansi" desc={`${yuklamaMuammo.length} ta xodimda yuklama farqi bor.`} onClick={onLegacy}/>
                <QuickAction icon={<MessageCircle size={18}/>} title="Xabarlar" desc="Maktab, sinf va ishchi guruhlar bo'yicha muloqot." onClick={onBack}/>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4"><div><div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>O'qituvchilar</div><div className="text-lg font-black mt-1" style={{ color: palette.ink }}>Haftalik yuklama</div></div><Users size={21} style={{ color: palette.blue }}/></div>
              <div className="space-y-2 max-h-[390px] overflow-auto pr-1">
                {yuklama.slice(0,25).map(x => {
                  const reja=x.haftalik_dars_soati; const amaldagi=Number(x.jadvaldagi_soat||0); const bad=x.holat==="ortiqcha"; const ok=x.holat==="toliq";
                  return <div key={x.user_id} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: ok ? palette.greenBg : bad ? palette.redBg : palette.cream }}><div className="flex-1 min-w-0"><div className="text-sm font-bold truncate" style={{ color: palette.ink }}>{x.full_name}</div><div className="text-xs mt-0.5 truncate" style={{ color: palette.muted }}>{x.fanlari || "Fan belgilanmagan"}</div></div><div className="text-right"><div className="text-sm font-black" style={{ color: bad ? palette.red : ok ? palette.green : palette.amber }}>{amaldagi}/{reja ?? "—"}</div><div className="text-[11px]" style={{ color: palette.muted }}>soat</div></div></div>
                })}
                {!yuklama.length && <div className="text-sm" style={{ color: palette.muted }}>Xodim yuklamasi hali kiritilmagan.</div>}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4"><div><div className="text-xs font-black uppercase tracking-[.12em]" style={{ color: palette.teal }}>Sinflar</div><div className="text-lg font-black mt-1" style={{ color: palette.ink }}>Maktab xaritasi</div></div><BookOpen size={21} style={{ color: palette.blue }}/></div>
              <div className="grid grid-cols-2 gap-2.5 max-h-[390px] overflow-auto pr-1">
                {(dashboard?.sinflar || []).map(s => <div key={s.id} className="rounded-2xl p-3.5" style={{ background: palette.cream }}><div className="text-base font-black" style={{ color: palette.ink }}>{s.sinf}-{s.harf}</div><div className="text-xs mt-1" style={{ color: palette.muted }}>{s.oquvchi_soni} o'quvchi</div><div className="text-xs mt-1 truncate" style={{ color: s.rahbar_ismi ? palette.teal : palette.amber }}>{s.rahbar_ismi || "Rahbar belgilanmagan"}</div></div>)}
              </div>
            </Card>
          </div>
        </>}
      </div>
    </div>
  );
}
