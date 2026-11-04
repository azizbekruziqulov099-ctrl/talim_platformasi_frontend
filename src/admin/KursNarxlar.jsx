import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { kursNomi, sinfYozuv } from "../courses/KabutarKurslar.jsx";
import { somFmt } from "../courses/KursTolov.jsx";

/** REV301: umumiy narxlar — yo'nalish (kategoriya) bo'yicha odatiy narx va bepul darslar soni; kurs bo'yicha alohida narx;
 *  naqd to'laganga kursni qo'lda ochib berish. Narx 0 — kurs bepul (hech narsa yopilmaydi). */
export default function KursNarxlar({ apiBase, token }) {
  const base = String(apiBase || "").replace(/\/+$/, "");
  const [n, setN] = useState(null);
  const [kat, setKat] = useState(null);
  const [xabar, setXabar] = useState("");
  const [qidir, setQidir] = useState("");
  const [ochish, setOchish] = useState({ foydalanuvchi: "", kalit: "", kun: 30, summa: "" });
  const yukla = async () => {
    try {
      const [a, b] = await Promise.all([fetch(`${base}/api/admin/kurslar/narxlar?${new URLSearchParams({ token })}`), fetch(`${base}/api/kurslar/katalog?${new URLSearchParams({ token, til: "uz" })}`)]);
      const da = await a.json(); const db = await b.json();
      if (!a.ok) throw new Error(da.detail || `Xato ${a.status}`); if (!b.ok) throw new Error(db.detail || `Xato ${b.status}`);
      setN(da); setKat(db);
    } catch (e) { setXabar(`⚠️ ${e.message}`); }
  };
  useEffect(() => { yukla(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const saqla = async (body) => {
    setXabar("");
    const r = await fetch(`${base}/api/admin/kurslar/narx`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, ...body }) });
    const d = await r.json().catch(() => ({}));
    setXabar(r.ok ? "✅ Saqlandi" : `⚠️ ${d.detail || r.status}`); if (r.ok) yukla();
  };
  const och = async () => {
    setXabar("");
    const r = await fetch(`${base}/api/admin/kurslar/ochib_ber`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, ...ochish, kun: Number(ochish.kun) || 30, summa: Number(ochish.summa) || 0 }) });
    const d = await r.json().catch(() => ({}));
    setXabar(r.ok ? `✅ Kurs ochildi (foydalanuvchi #${d.user_id}, ${ochish.kun} kun)` : `⚠️ ${typeof d.detail === "string" ? d.detail : r.status}`); if (r.ok) yukla();
  };
  const kurslar = useMemo(() => (kat?.kurslar || []).filter((k) => !qidir.trim() || kursNomi(k).toLowerCase().includes(qidir.trim().toLowerCase())), [kat, qidir]);
  if (!n || !kat) return <div className="p-4 text-sm text-slate-500">{xabar || __kbUi("Yuklanmoqda…")}</div>;
  const inp = "rounded-lg border px-2 py-1.5 text-sm w-28";
  return <div className="space-y-4 p-1 mb-6">
    <div className="rounded-2xl text-white p-5" style={{ background: "linear-gradient(135deg,#153A55,#1B4B7A 60%,#2D8B8B)" }}>
      <h2 className="text-xl font-bold">💰 {__kbUi("Narxlar")}</h2>
      <p className="text-sm opacity-90 mt-1">{__kbUi("Har kursning birinchi darslari bepul; qolgani obuna bilan ochiladi. Narx 0 bo‘lsa — kurs to‘liq bepul. Kurs narxi yozilmasa — yo‘nalish narxi olinadi.")}</p>
    </div>
    <section className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
      <h3 className="font-bold text-sm mb-2">{__kbUi("1. Yo‘nalishlar bo‘yicha odatiy narx")}</h3>
      <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="p-2">{__kbUi("Yo‘nalish")}</th><th className="p-2">{__kbUi("Narx (so‘m / 30 kun)")}</th><th className="p-2">{__kbUi("Bepul darslar")}</th><th></th></tr></thead>
        <tbody>{n.kategoriyalar.filter((c) => c.kalit !== "sertifikat" && c.kalit !== "xalqaro").map((c) => <KatQator key={c.kalit} c={c} inp={inp} onSaqla={saqla} />)}</tbody></table></div>
    </section>
    <section className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2"><h3 className="font-bold text-sm">{__kbUi("2. Kurs bo‘yicha alohida narx")}</h3>
        <input type="search" value={qidir} onChange={(e) => setQidir(e.target.value)} placeholder={__kbUi("Kurs qidirish…")} className="rounded-lg border px-3 py-1.5 text-sm" /></div>
      <div className="overflow-auto" style={{ maxHeight: "50vh" }}><table className="w-full text-sm"><thead className="sticky top-0 bg-white"><tr className="text-left text-xs text-slate-500">
        <th className="p-2">{__kbUi("Kurs")}</th><th className="p-2">{__kbUi("Darslar")}</th><th className="p-2">{__kbUi("Hozirgi")}</th><th className="p-2">{__kbUi("Alohida narx")}</th><th className="p-2">{__kbUi("Bepul")}</th><th className="p-2">{__kbUi("Faol obuna")}</th><th></th></tr></thead>
        <tbody>{kurslar.map((k) => <KursQator key={k.kalit} k={k} ozi={n.kurs_narx[k.kalit]} faol={n.faol_obunalar[k.kalit] || 0} inp={inp} onSaqla={saqla} />)}</tbody></table></div>
    </section>
    <section className="rounded-2xl bg-white border p-4 space-y-2" style={{ borderColor: "#E5E1D8" }}>
      <h3 className="font-bold text-sm">{__kbUi("3. Kursni qo‘lda ochib berish (naqd yoki kartaga to‘laganga)")}</h3>
      <div className="flex flex-wrap gap-2 items-end">
        <label className="text-xs">{__kbUi("Foydalanuvchi ID yoki to‘liq ismi")}<input className="block rounded-lg border px-2 py-1.5 text-sm w-56" value={ochish.foydalanuvchi} onChange={(e) => setOchish({ ...ochish, foydalanuvchi: e.target.value })} /></label>
        <label className="text-xs">{__kbUi("Kurs")}<select className="block rounded-lg border px-2 py-1.5 text-sm w-64" value={ochish.kalit} onChange={(e) => setOchish({ ...ochish, kalit: e.target.value })}>
          <option value="">—</option>{kat.kurslar.map((k) => <option key={k.kalit} value={k.kalit}>{kursNomi(k)}</option>)}</select></label>
        <label className="text-xs">{__kbUi("Kun")}<input type="number" min="1" max="400" className="block rounded-lg border px-2 py-1.5 text-sm w-20" value={ochish.kun} onChange={(e) => setOchish({ ...ochish, kun: e.target.value })} /></label>
        <label className="text-xs">{__kbUi("To‘langan summa")}<input type="number" min="0" className="block rounded-lg border px-2 py-1.5 text-sm w-28" value={ochish.summa} onChange={(e) => setOchish({ ...ochish, summa: e.target.value })} /></label>
        <button type="button" disabled={!ochish.foydalanuvchi.trim() || !ochish.kalit} className="rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-40" style={{ background: "#25683B" }} onClick={och}>{__kbUi("🔓 Ochib berish")}</button>
      </div>
    </section>
    {xabar && <p className="text-sm font-semibold" role="status">{__kbUi(xabar)}</p>}
  </div>;
}

function KatQator({ c, inp, onSaqla }) {
  const [narx, setNarx] = useState(c.narx); const [bep, setBep] = useState(c.bepul_dars);
  return <tr className="border-t"><td className="p-2 font-semibold">{c.belgi} {__kbUi(c.nomi)}</td>
    <td className="p-2"><input type="number" min="0" step="1000" className={inp} value={narx} onChange={(e) => setNarx(e.target.value)} aria-label={__kbUi("Narx")} /></td>
    <td className="p-2"><input type="number" min="0" max="50" className={inp} value={bep} onChange={(e) => setBep(e.target.value)} aria-label={__kbUi("Bepul darslar")} /></td>
    <td className="p-2"><button type="button" className="rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: "#1B4B7A" }} onClick={() => onSaqla({ kategoriya: c.kalit, narx: Number(narx) || 0, bepul_dars: Number(bep) })}>{__kbUi("Saqlash")}</button></td></tr>;
}

function KursQator({ k, ozi, faol, inp, onSaqla }) {
  const [narx, setNarx] = useState(ozi?.narx || ""); const [bep, setBep] = useState(ozi?.bepul_dars ?? "");
  return <tr className="border-t"><td className="p-2">{kursNomi(k)}<small className="block text-[11px] text-slate-500">{k.sinflar.map(sinfYozuv).join(", ")} · {k.tillar.map((t) => t.toUpperCase()).join("/")}</small></td>
    <td className="p-2 tabular-nums">{k.darslar}</td>
    <td className="p-2 text-xs">{Number(k.narx) > 0 ? `${somFmt(k.narx)} · ${k.bepul} ${__kbUi("bepul")}` : __kbUi("bepul")}</td>
    <td className="p-2"><input type="number" min="0" step="1000" className={inp} placeholder={__kbUi("yo‘nalishdan")} value={narx} onChange={(e) => setNarx(e.target.value)} aria-label={__kbUi("Alohida narx")} /></td>
    <td className="p-2"><input type="number" min="0" max="50" className={`${inp} w-16`} placeholder="—" value={bep} onChange={(e) => setBep(e.target.value)} aria-label={__kbUi("Bepul darslar")} /></td>
    <td className="p-2 tabular-nums">{faol}</td>
    <td className="p-2"><button type="button" className="rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: "#1B4B7A" }} onClick={() => onSaqla({ kalit: k.kalit, narx: Number(narx) || 0, bepul_dars: bep === "" ? null : Number(bep) })}>{__kbUi("Saqlash")}</button></td></tr>;
}
