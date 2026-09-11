import React, { useCallback, useEffect, useRef, useState } from "react";
import { BedDouble, Utensils, ClipboardCheck, ShieldCheck, Phone, Save, Search, RefreshCw } from "lucide-react";
import "./militaryOperations.css";

const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const MEALS = { breakfast: "Nonushta", lunch: "Tushlik", dinner: "Kechki ovqat" };
const MODES = { day: "Uyga qatnovchi", boarding: "Yotoqxonada qoluvchi" };
const STATES = { unknown: "Qayd etilmagan", present: "Maktabda", home: "Uyga ketdi", boarding: "Yotoqxonaga topshirildi", absent: "Yo‘qlamada yo‘q" };
const fee = (value) => value == null ? "Narx belgilanmagan" : `${Number(value).toLocaleString("uz-UZ")} so‘m / oy`;
const stamp = (value) => new Intl.DateTimeFormat("uz-UZ", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value));
export function menuDraft() { return DAYS.map((_, day) => ({ breakfast: "", lunch: day === 0 ? "Sho‘rva" : [3,5].includes(day) ? "Osh" : "", dinner: "" })); }
export function localDutyDefaults(date) {
  const next = new Date(`${date}T12:00:00+05:00`); next.setUTCDate(next.getUTCDate() + 1);
  return { starts_at: `${date}T16:30`, ends_at: `${next.toISOString().slice(0,10)}T08:00`, teacher_id: "", receiver_id: "" };
}

export default function MilitaryOperations({ token, apiBase = "", schoolId, childId, readOnly = false }) {
  const [data,setData] = useState(null), [error,setError] = useState(""), [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false), [settings,setSettings] = useState(null), [duty,setDuty] = useState(null);
  const [staff,setStaff] = useState([]), [query,setQuery] = useState(""), [after,setAfter] = useState(0), [pageHistory,setPageHistory] = useState([]);
  const controllers = useRef(new Set()), generation = useRef(0), locked = useRef(false), editing = useRef(false), loading = useRef(false);
  editing.current = !!settings || !!duty;
  const request = useCallback(async (path, options = {}) => {
    const controller = new AbortController(); controllers.current.add(controller);
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(`${apiBase}${path}`, { ...options, headers: { Authorization: `Bearer ${token}`, ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers }, cache: "no-store", signal: controller.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.detail === "string" ? result.detail : "Ma’lumot olinmadi. Qayta urinib ko‘ring.");
      return result;
    } finally { clearTimeout(timer); controllers.current.delete(controller); }
  }, [apiBase,token]);
  const load = useCallback(async () => {
    if (!token || !schoolId || loading.current || document.hidden) return;
    const run = generation.current; loading.current = true;
    try {
      const params = new URLSearchParams({ school_id:String(schoolId),after:String(after) });
      if (childId) params.set("child_id",String(childId));
      const result = await request(`/api/maktab/harbiy-amaliyot?${params}`);
      if (run === generation.current) { setData(result); setError(""); }
    } catch(err) { if (run === generation.current && err.name !== "AbortError") setError(err.message); }
    finally { if (run === generation.current) loading.current = false; }
  }, [token,schoolId,childId,after,request]);
  useEffect(() => {
    generation.current += 1; setData(null); setSettings(null); setDuty(null); setStaff([]); setError(""); setNotice("");
    loading.current = false; locked.current = false; setBusy(false); load();
    const refresh = () => { if (!document.hidden && !editing.current && !locked.current) load(); };
    const timer = setInterval(refresh,60000); document.addEventListener("visibilitychange",refresh);
    return () => { generation.current += 1; clearInterval(timer); document.removeEventListener("visibilitychange",refresh); for (const c of controllers.current) c.abort(); controllers.current.clear(); loading.current=false; };
  }, [load]);
  useEffect(() => { setAfter(0); setPageHistory([]); }, [schoolId,childId]);
  const action = async (payload, onSuccess) => {
    if (locked.current || readOnly) return;
    locked.current = true; setBusy(true); setError(""); setNotice(""); const run=generation.current;
    try {
      await request("/api/maktab/harbiy-amaliyot",{method:"POST",body:JSON.stringify({school_id:schoolId,...payload})});
      if (run !== generation.current) return;
      onSuccess?.(); setNotice("O‘zgarish saqlandi."); await load();
    } catch(err) { if(run===generation.current) setError(err.name === "AbortError" ? "Javob kechikdi. Qayta yuborishdan oldin yangilab tekshiring." : err.message); }
    finally { if(run===generation.current) {locked.current=false;setBusy(false);} }
  };
  const findStaff = async () => {
    const run=generation.current; setError("");
    try { const result=await request(`/api/maktab/harbiy-amaliyot/people?${new URLSearchParams({school_id:String(schoolId),kind:"staff",query})}`); if(run===generation.current) setStaff(result.people); }
    catch(err) { if(run===generation.current && err.name!=="AbortError") setError(err.message); }
  };
  if(!token || !schoolId) return null;
  if(!data) return error ? <div className="military-ops"><p role="alert">{error}</p><button type="button" onClick={load}>Qayta yuklash</button></div> : null;
  const manager=data.can_edit && !readOnly, record=data.can_record && !readOnly, menuEditor=data.can_edit_menu && !readOnly;
  const day = (new Date(`${data.date}T12:00:00+05:00`).getUTCDay()+6)%7;
  const todayMenu=data.settings.menu?.[day] || {};
  const currentDuty=data.duties.find(row => new Date(row.starts_at)<=new Date(data.time) && new Date(row.ends_at)>new Date(data.time) && !row.handed_over_at);
  const draftSettings = () => { setSettings({...data.settings, menu:data.settings.menu.map(row=>({...row}))}); setDuty(null); };
  const staffInput=(value,changed,label) => <label>{label}<select value={value || ""} onChange={e=>changed(e.target.value)} disabled={busy}><option value="">Tanlang</option>{value && !staff.some(r=>String(r.user_id)===String(value)) && <option value={value}>ID {value}</option>}{staff.map(person=><option key={person.user_id} value={person.user_id}>{person.full_name} · {person.user_id}</option>)}</select></label>;
  return <section className="military-ops" aria-label="Maktab hayoti va navbatchilik">
    <header className="military-ops__head"><div><h3>Maktab hayoti</h3><p>{data.date} · qaydlar va mas’ullar</p></div><button type="button" onClick={load} disabled={busy || !!settings || !!duty} aria-label="Ma’lumotlarni yangilash"><RefreshCw size={17}/></button></header>
    {error && <p role="alert" className="military-ops__error">{error}</p>}{notice && <p role="status" className="military-ops__notice">{notice}</p>}
    {data.self_is_student && <div className="military-ops__personal"><BedDouble size={21}/><div><strong>{MODES[data.mode] || "Yashash tartibi hali belgilanmagan"}</strong><span>{fee(data.monthly_fee)}</span><small>Bugungi yo‘qlama: {STATES[data.departure?.status || "unknown"]}{data.departure?.recorded_at ? ` · ${stamp(data.departure.recorded_at)}` : ""}</small></div></div>}
    <div className="military-ops__cards"><article><h4><Utensils size={18}/> Bugungi taomnoma</h4>{Object.entries(MEALS).filter(([meal])=>!data.self_is_student || data.mode === "boarding" || meal === "lunch").map(([meal,label])=><p key={meal}><span>{label}</span><strong>{todayMenu[meal] || "Hali kiritilmagan"}</strong></p>)}</article>
      <article><h4><ShieldCheck size={18}/> Navbatchi o‘qituvchi</h4>{currentDuty ? <><strong>{currentDuty.teacher_name}</strong><p>{stamp(currentDuty.starts_at)} — {stamp(currentDuty.ends_at)}</p></> : <p>Hozirgi vaqt uchun navbatchi tayinlanmagan.</p>}{data.duty_contact && <button type="button" className="military-ops__primary" onClick={()=>window.dispatchEvent(new CustomEvent("kabutar:open-contact",{detail:{userId:data.duty_contact.user_id,schoolId,fullName:data.duty_contact.name}}))}><Phone size={16}/> Navbatchi bilan bog‘lanish</button>}<small>Bolalar telefon ishlatmaydigan paytda ota-ona tasdiqlangan navbatchi orqali bog‘lanadi.</small>{data.duty_contact && <small>Qo‘ng‘iroqni ko‘rish uchun navbatchining Kabutar oynasi ochiq bo‘lishi kerak.</small>}</article></div>
    {record && <details className="military-ops__section"><summary><ClipboardCheck size={18}/> Yo‘qlama va uyga/yotoqxonaga topshirish</summary><p>16:30 dagi yo‘qlama natijasini har bir o‘quvchi uchun alohida qayd eting. Jadvalga qarab hech kim avtomatik ketgan hisoblanmaydi.</p><div className="military-ops__counts">{Object.entries(STATES).map(([key,label])=><span key={key}>{label}: <b>{data.counts?.[key] || 0}</b></span>)}</div><div className="military-ops__table"><table><thead><tr><th>O‘quvchi</th><th>Yashash tartibi</th><th>Bugungi haqiqiy holat</th></tr></thead><tbody>{data.roster.map(row=><tr key={row.user_id}><td><strong>{row.full_name}</strong><small>ID {row.user_id}</small></td><td>{manager ? <select aria-label={`${row.full_name} yashash tartibi`} disabled={busy} value={row.mode || ""} onChange={e=>action({action:"boarding",user_id:row.user_id,mode:e.target.value,revision:row.mode_revision})}><option value="" disabled>Belgilanmagan</option>{Object.entries(MODES).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select> : MODES[row.mode] || "Belgilanmagan"}</td><td><select aria-label={`${row.full_name} yo‘qlama holati`} disabled={busy} value={row.departure} onChange={e=>action({action:"departure",user_id:row.user_id,status:e.target.value,date:data.date,revision:row.departure_revision})}>{Object.entries(STATES).map(([value,label])=><option key={value} value={value} disabled={value==="boarding" && row.mode!=="boarding"}>{label}</option>)}</select></td></tr>)}</tbody></table></div>{!data.roster.length && <p>Faol sinflarda o‘quvchi topilmadi.</p>}<div className="military-ops__buttons"><button type="button" disabled={!pageHistory.length || busy} onClick={()=>{setAfter(pageHistory[pageHistory.length-1]);setPageHistory(v=>v.slice(0,-1));}}>Oldingi</button><button type="button" disabled={!data.next || busy} onClick={()=>{setPageHistory(v=>[...v,after]);setAfter(data.next);}}>Keyingi 100 ta</button></div></details>}
    {(manager || data.duties.some(row=>row.can_handover)) && <details className="military-ops__section"><summary><ShieldCheck size={18}/> Navbatchilik va qabul-topshirish</summary><p>Navbatchini hamda ertalab qabul qiluvchi o‘qituvchini haqiqiy xodimlar ro‘yxatidan tanlang. Qabul qilinganlik alohida tasdiqlanadi.</p>{data.duties.map(row=><div className="military-ops__duty" key={row.id}><div><strong>{row.teacher_name}</strong><span>{stamp(row.starts_at)} — {stamp(row.ends_at)}</span>{row.receiver_name && <small>Qabul qiluvchi: {row.receiver_name}</small>}<small>{row.handed_over_at ? `Qabul tasdiqlangan: ${stamp(row.handed_over_at)}` : "Qabul hali tasdiqlanmagan"}</small></div><div className="military-ops__buttons">{!readOnly && row.can_handover && <button type="button" disabled={busy} onClick={()=>action({action:"handover",id:row.id,revision:row.revision})}>Qabul qilib oldim</button>}{manager && !row.handed_over_at && <button type="button" disabled={busy} onClick={()=>{if(window.confirm("Ushbu navbatchilikni bekor qilasizmi?")) action({action:"cancel_duty",id:row.id,revision:row.revision});}}>Bekor qilish</button>}</div></div>)}{manager && !duty && <button type="button" disabled={busy} onClick={()=>{setDuty(localDutyDefaults(data.date));setSettings(null);findStaff();}}>Navbatchilik tayinlash</button>}</details>}
    {(manager || menuEditor) && <details className="military-ops__section"><summary><Utensils size={18}/> {manager ? "Taomnoma, oylik narx va mas’ullar" : "Haftalik taomnomani sozlash"}</summary><p>Yotoqxonada qoluvchi va uyga qatnovchi o‘quvchi narxi alohida. Narxni kiritish to‘lov qabul qilish yoki qarzdorlik hisobi emas.</p>{manager && <p>Kunduzgi: {fee(data.settings.day_fee)} · Yotoqxona: {fee(data.settings.boarding_fee)}</p>}{!settings && <button type="button" disabled={busy} onClick={()=>{draftSettings();if(manager)findStaff();}}>Sozlamalarni ochish</button>}</details>}
    {(settings || duty) && <div className="military-ops__editor">{manager && <div className="military-ops__staff-search"><label>Xodimni ism bilan topish<input value={query} maxLength={80} disabled={busy} onChange={e=>setQuery(e.target.value)}/></label><button type="button" disabled={busy} onClick={findStaff}><Search size={16}/> Qidirish</button><small>Birinchi 100 ta natija. Ko‘rinmasa ismini aniqlashtiring.</small></div>}
      {settings && <>{manager && <div className="military-ops__fields"><label>Kunduzgi oylik narx (so‘m)<input type="number" min="0" max="1000000000" step="1" value={settings.day_fee ?? ""} disabled={busy} onChange={e=>setSettings(v=>({...v,day_fee:e.target.value}))}/></label><label>Yotoqxona oylik narxi (so‘m)<input type="number" min="0" max="1000000000" step="1" value={settings.boarding_fee ?? ""} disabled={busy} onChange={e=>setSettings(v=>({...v,boarding_fee:e.target.value}))}/></label>{staffInput(settings.menu_manager_id,value=>setSettings(v=>({...v,menu_manager_id:value})),"Menyu uchun mas’ul (ixtiyoriy)")}</div>}<div className="military-ops__table"><table><thead><tr><th>Kun</th>{Object.values(MEALS).map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{DAYS.map((dayName,index)=><tr key={dayName}><th>{dayName}</th>{Object.entries(MEALS).map(([meal,label])=><td key={meal}><input aria-label={`${dayName} ${label}`} maxLength={200} disabled={busy} value={settings.menu[index]?.[meal] || ""} placeholder="Taom nomi" onChange={e=>setSettings(v=>({...v,menu:v.menu.map((row,i)=>i===index ? {...row,[meal]:e.target.value} : row)}))}/></td>)}</tr>)}</tbody></table></div><button type="button" disabled={busy} onClick={()=>setSettings(v=>({...v,menu:v.menu.map((row,i)=>({...row,lunch:row.lunch || menuDraft()[i].lunch}))}))}>Dushanba sho‘rva, payshanba/shanba osh namunasini qo‘shish</button><p>Bo‘sh qolgan taomlar o‘ylab topilmaydi. Oshpaz yoki mas’ul xodim to‘ldiradi.</p><div className="military-ops__buttons"><button type="button" disabled={busy} onClick={()=>setSettings(null)}>Bekor qilish</button><button type="button" disabled={busy} className="military-ops__primary" onClick={()=>action({action:manager ? "settings" : "menu",revision:data.revision,...settings},()=>setSettings(null))}><Save size={16}/> Saqlash</button></div></>}
      {duty && <><div className="military-ops__fields">{staffInput(duty.teacher_id,value=>setDuty(v=>({...v,teacher_id:value})),"Navbatchi o‘qituvchi")}{staffInput(duty.receiver_id,value=>setDuty(v=>({...v,receiver_id:value})),"Ertalab qabul qiluvchi")}<label>Boshlanish · Toshkent vaqti<input type="datetime-local" disabled={busy} value={duty.starts_at} onChange={e=>setDuty(v=>({...v,starts_at:e.target.value}))}/></label><label>Tugash · Toshkent vaqti<input type="datetime-local" disabled={busy} value={duty.ends_at} onChange={e=>setDuty(v=>({...v,ends_at:e.target.value}))}/></label></div><div className="military-ops__buttons"><button type="button" disabled={busy} onClick={()=>setDuty(null)}>Bekor qilish</button><button type="button" disabled={busy || !duty.teacher_id || !duty.starts_at || !duty.ends_at} className="military-ops__primary" onClick={()=>action({action:"duty",...duty,starts_at:`${duty.starts_at}:00+05:00`,ends_at:`${duty.ends_at}:00+05:00`},()=>setDuty(null))}>Navbatchini tayinlash</button></div></>}
    </div>}
    <p className="military-ops__foot">Ma’lumotlar mas’ullar qaydiga ko‘ra yangilanadi. Ota-ona faqat o‘z farzandining shaxsiy holatini ko‘radi.</p>
  </section>;
}
