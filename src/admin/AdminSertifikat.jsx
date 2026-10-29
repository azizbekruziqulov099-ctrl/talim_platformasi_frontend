// REV209: Admin → «🎓 Sertifikat guruhlari»: arizalar, daraja balli, 30 tadan guruhlash, qayta guruhlash, natija va reyting.
import React, { useCallback, useEffect, useState } from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";

const API_BASE = import.meta.env.VITE_API_BASE || "https://talimplatformasi-production.up.railway.app";

export default function AdminSertifikat({ token }) {
  const [kat, setKat] = useState([]);
  const [iid, setIid] = useState("");
  const [ar, setAr] = useState([]);
  const [stat, setStat] = useState({});
  const [gr, setGr] = useState([]);
  const [xabar, setXabar] = useState("");
  const url = (p, q = {}) => `${API_BASE}/api/admin/sertifikat${p}?${new URLSearchParams({ token, ...q })}`;
  const sorov = async (p, q, opt) => { const r = await fetch(url(p, q), opt); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.detail || r.status); return j; };
  const yukla = useCallback(async () => {
    try {
      if (!kat.length) setKat((await (await fetch(`${API_BASE}/api/sertifikat/katalog`)).json()).imtihonlar || []);
      const a = await sorov("/arizalar", iid ? { imtihon_id: iid } : {});
      setAr(a.arizalar || []); setStat(a.statistika || {});
      setGr((await sorov("/guruhlar", iid ? { imtihon_id: iid } : {})).guruhlar || []);
    } catch (e) { setXabar(`⚠️ ${e.message}`); }
  }, [iid]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { yukla(); }, [yukla]);
  const guruhla = async (qayta) => {
    if (!iid) { setXabar(T("Avval imtihonni tanlang")); return; }
    if (qayta && !window.confirm(T("Barcha o‘quvchilar oxirgi natijalariga qarab qayta guruhlanadi. Davom etasizmi?"))) return;
    try { const r = await sorov("/guruhla", { imtihon_id: iid, qayta }, { method: "POST" });
      setXabar(`✅ ${r.oquvchilar} ${T("o‘quvchi")} → ${r.guruhlar} ${T("guruh")}`); yukla(); } catch (e) { setXabar(`⚠️ ${e.message}`); }
  };
  const ball = async (a) => {
    const v = window.prompt(T("Daraja testi balli (0–100):"), a.daraja_ball ?? "");
    if (v === null || v === "") return;
    try { await sorov(`/ariza/${a.id}`, {}, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ daraja_ball: Number(v) }) }); yukla(); }
    catch (e) { setXabar(`⚠️ ${e.message}`); }
  };
  const natija = async (a) => {
    const v = window.prompt(T("Imtihon/test natijasi (ball):"));
    if (!v) return;
    try { await sorov("/natija", {}, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ariza_id: a.id, ball: Number(v), turi: "imtihon" }) }); yukla(); }
    catch (e) { setXabar(`⚠️ ${e.message}`); }
  };
  const nomi = (id) => kat.find((e) => e.id === id)?.shortTitle || id;
  return <div className="space-y-4 p-4">
    <div className="rounded-2xl border bg-white p-4">
      <h3 className="text-lg font-bold">🎓 {T("Sertifikatga tayyorlov guruhlari")}</h3>
      <p className="text-sm text-slate-600">{T("O‘quvchilar saytda yoki botda ariza beradi. Daraja ballini kiriting, so‘ng «30 tadan guruhlash» — kuchlilar va boshlovchilar alohida guruhga tushadi. Imtihon natijalaridan keyin «Qayta guruhlash».")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setIid("")} className={`rounded-full border px-3 py-1 text-sm ${!iid ? "bg-sky-800 text-white" : ""}`}>{T("Hammasi")}</button>
        {kat.map((e) => { const s = stat[e.id] || {}; const n = Object.values(s).reduce((x, y) => x + y, 0);
          return <button key={e.id} type="button" onClick={() => setIid(e.id)} className={`rounded-full border px-3 py-1 text-sm ${iid === e.id ? "bg-sky-800 text-white" : ""}`}>{e.shortTitle}{n ? ` · ${n}` : ""}{s.yangi ? ` (${s.yangi} ${T("yangi")})` : ""}</button>; })}
      </div>
      {iid && <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white" onClick={() => guruhla(false)}>👥 {T("Kutayotganlarni 30 tadan guruhlash")}</button>
        <button type="button" className="rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white" onClick={() => guruhla(true)}>🔁 {T("Daraja bo‘yicha qayta guruhlash")}</button>
      </div>}
      {xabar && <p className="mt-2 text-sm font-semibold" role="status">{xabar}</p>}
    </div>
    {gr.length > 0 && <div className="grid gap-3 md:grid-cols-2">{gr.map((g) => <div key={g.id} className="rounded-2xl border bg-white p-3">
      <b>{g.nomi}</b> <small className="text-slate-500">· {g.soni}/{g.sigim} · {g.sinf_dan ? `${g.sinf_dan}–${g.sinf_gacha}-sinf` : ""}</small>
      <ol className="mt-1 text-sm">{(g.reyting || []).map((r) => <li key={r.orin}>{r.orin}. {r.ism} — {r.ball} {T("ball")}</li>)}</ol>
    </div>)}</div>}
    <div className="overflow-auto rounded-2xl border bg-white">
      <table className="w-full text-sm"><thead><tr className="bg-slate-50 text-left"><th className="p-2">#</th><th className="p-2">{T("Ism")}</th><th className="p-2">{T("Imtihon")}</th><th className="p-2">{T("Sinf")}</th><th className="p-2">{T("Manba")}</th><th className="p-2">{T("Holat")}</th><th className="p-2">{T("Daraja balli")}</th><th className="p-2">{T("Guruh")}</th><th className="p-2"></th></tr></thead>
        <tbody>{ar.map((a) => <tr key={a.id} className="border-t">
          <td className="p-2">{a.id}</td><td className="p-2">{a.ism || a.user_id}{a.telefon ? <small className="block text-slate-500">{a.telefon}</small> : null}</td>
          <td className="p-2">{nomi(a.imtihon_id)}</td><td className="p-2">{a.sinf || "—"}</td><td className="p-2">{a.manba === "bot" ? "🤖 bot" : "🌐 sayt"}</td>
          <td className="p-2">{T(a.holat)}</td><td className="p-2"><button type="button" className="underline" onClick={() => ball(a)}>{a.daraja_ball ?? T("kiritish")}</button></td>
          <td className="p-2">{a.guruh || "—"}</td><td className="p-2"><button type="button" className="text-xs underline" onClick={() => natija(a)}>{T("natija +")}</button></td>
        </tr>)}</tbody></table>
    </div>
  </div>;
}
