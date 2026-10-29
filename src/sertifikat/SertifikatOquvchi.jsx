// REV209: O'quvchi uchun «🎓 Sertifikatga tayyorlov guruhlari» — imtihonni tanlab ariza beradi (avtomatik a'zo bo'lmaydi).
// Sinfiga mos imtihonlar «tavsiya» belgisi bilan birinchi turadi; boshqasini ham tanlash mumkin (faqat eslatma).
import React, { useEffect, useState } from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";

const API_BASE = import.meta.env.VITE_API_BASE || "https://talimplatformasi-production.up.railway.app";
const HOLAT = { yangi: "⏳ Ariza qabul qilindi — administrator ko‘rib chiqadi", qabul: "✅ Tasdiqlandi — guruh tuzilishini kuting",
  guruhda: "🎓 Guruhdasiz", rad: "✖ Rad etildi" };

export default function SertifikatOquvchi({ token, sinf }) {
  const [kat, setKat] = useState(null);
  const [mening, setMening] = useState([]);
  const [ochiq, setOchiq] = useState(false);
  const [hammasi, setHammasi] = useState(false);
  const [xabar, setXabar] = useState("");
  const raqam = Number(String(sinf || "").match(/\d+/)?.[0] || 0);
  const yukla = async () => {
    try {
      const k = await (await fetch(`${API_BASE}/api/sertifikat/katalog`)).json();
      setKat(k);
      if (token) setMening((await (await fetch(`${API_BASE}/api/sertifikat/mening?token=${encodeURIComponent(token)}`)).json()).arizalar || []);
    } catch { /* jim */ }
  };
  useEffect(() => { if (ochiq && !kat) yukla(); }, [ochiq]); // eslint-disable-line react-hooks/exhaustive-deps
  const tavsiya = (e) => raqam && (e.recommendedGrades || []).includes(raqam);
  const royxat = (kat?.imtihonlar || []).filter((e) => hammasi || !raqam || tavsiya(e));
  const ariza = async (e) => {
    if (raqam && !tavsiya(e) && !window.confirm(T("Bu imtihon sinfingiz uchun tavsiya etilganlardan emas. Baribir ariza berasizmi?"))) return;
    setXabar("");
    const r = await fetch(`${API_BASE}/api/sertifikat/ariza?token=${encodeURIComponent(token)}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imtihon_id: e.id }) });
    const d = await r.json().catch(() => ({}));
    setXabar(r.ok ? `✅ ${T("Ariza yuborildi")}: ${e.title}` : `⚠️ ${d.detail || r.status}`);
    yukla();
  };
  const holati = (id) => mening.find((a) => a.imtihon_id === id);
  return <section className="rounded-2xl border p-4" style={{ borderColor: "#cfe3f7", background: "linear-gradient(135deg,#f3f8ff,#f6fbf7)" }}>
    <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setOchiq((v) => !v)}>
      <span><b>🎓 {T("Sertifikatga tayyorlov guruhlari")}</b>
        <small className="block text-xs text-slate-600">{T("Cambridge, IELTS, TOEFL, SAT, Milliy sertifikat — ariza bering, administrator guruhga qo‘shadi")}</small></span>
      <span>{ochiq ? "▲" : "▼"}</span>
    </button>
    {ochiq && <div className="mt-3 space-y-2">
      {raqam > 0 && <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={hammasi} onChange={(e) => setHammasi(e.target.checked)} />{T("Barcha imtihonlarni ko‘rsatish")}</label>}
      {xabar && <p className="text-sm font-semibold" role="status">{xabar}</p>}
      {royxat.map((e) => {
        const h = holati(e.id);
        return <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3">
          <div><b>{e.title}</b> {tavsiya(e) && <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">{T("sinfingizga mos")}</span>}
            <small className="block text-xs text-slate-600">{e.cefr ? `CEFR ${e.cefr} · ` : ""}{T(e.description || "")}</small>
            {h && <small className="block text-xs font-semibold text-sky-800">{T(HOLAT[h.holat] || h.holat)}{h.guruh ? ` · ${h.guruh}` : ""}</small>}</div>
          {!h && token && <button type="button" className="rounded-lg bg-sky-700 px-3 py-1.5 text-sm font-semibold text-white" onClick={() => ariza(e)}>{T("Ariza berish")}</button>}
        </div>;
      })}
      <p className="text-xs text-slate-500">{T("Bu tayyorlov kursi. Rasmiy sertifikatni faqat imtihon tashkilotchisi beradi.")}</p>
    </div>}
  </section>;
}
