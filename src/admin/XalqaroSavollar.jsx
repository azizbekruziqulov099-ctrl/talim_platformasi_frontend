import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

const BAYROQ = { uz: "🇺🇿", ru: "🇷🇺", en: "🇬🇧", de: "🇩🇪", es: "🇪🇸" };

/** REV319: Xalqaro baholash savollar banki — 5 til, Excel: yuklab olish → to'ldirish → tekshirish → nashr. */
export default function XalqaroSavollar({ apiBase, token }) {
  const base = String(apiBase || "").replace(/\/+$/, "");
  const [h, setH] = useState(null);
  const [xabar, setXabar] = useState("");
  const [tek, setTek] = useState({});   // til → { fayl, natija, busy }
  const yukla = async () => {
    try { const r = await fetch(`${base}/api/admin/xalqaro/kontent?${new URLSearchParams({ token })}`); const d = await r.json(); if (!r.ok) throw new Error(d.detail || r.status); setH(d); }
    catch (e) { setXabar(`⚠️ ${e.message}`); }
  };
  useEffect(() => { yukla(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const tekshir = async (til, fayl) => {
    setTek((x) => ({ ...x, [til]: { fayl, busy: true } })); setXabar("");
    const fd = new FormData(); fd.append("token", token); fd.append("fayl", fayl);
    try {
      const r = await fetch(`${base}/api/admin/xalqaro/tekshir`, { method: "POST", body: fd }); const d = await r.json();
      if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : r.status);
      if (d.til && d.til !== til) d.xatolar = [`Fayldagi til «${d.til}», bu qator «${til}» uchun`, ...(d.xatolar || [])], d.tayyor = false;
      setTek((x) => ({ ...x, [til]: { fayl, natija: d } }));
    } catch (e) { setTek((x) => ({ ...x, [til]: { fayl, natija: { xatolar: [e.message], tayyor: false } } })); }
  };
  const nashr = async (til) => {
    const t = tek[til]; if (!t?.fayl) return;
    if (!window.confirm(__kbUi("Saytdagi shu tildagi xalqaro savollar yangisiga almashtiriladi. Davom etasizmi?"))) return;
    setTek((x) => ({ ...x, [til]: { ...t, busy: true } }));
    const fd = new FormData(); fd.append("token", token); fd.append("fayl", t.fayl);
    const r = await fetch(`${base}/api/admin/xalqaro/nashr`, { method: "POST", body: fd }); const d = await r.json().catch(() => ({}));
    setXabar(r.ok ? `✅ ${BAYROQ[til]} ${d.savollar} ${__kbUi("ta savol nashr qilindi — saytda darhol ishlaydi")}` : `⚠️ ${__kbUi("Nashr qilinmadi")}: ${(d.detail?.xatolar || [d.detail]).slice(0, 3).join("; ")}`);
    setTek((x) => ({ ...x, [til]: { ...t, busy: false } })); yukla();
  };
  const qaytar = async (til) => {
    if (!window.confirm(__kbUi("Bazadagi savollar o‘chiriladi va saytning asl savollariga qaytiladi. Davom etasizmi?"))) return;
    await fetch(`${base}/api/admin/xalqaro/qaytar?${new URLSearchParams({ token, til })}`, { method: "POST" }); yukla();
  };
  const shablon = (til) => { window.open(`${base}/api/admin/xalqaro/shablon?${new URLSearchParams({ token, til })}`, "_blank"); };
  return <div className="space-y-3">
    <div className="rounded-2xl bg-white border p-4 text-sm" style={{ borderColor: "#E5E1D8" }}>
      <b>{__kbUi("Tartib")}:</b> {__kbUi("1) Excel'ni yuklab oling → 2) to‘ldiring yoki tuzating → 3) «Tekshirish» → 4) xato bo‘lmasa «Nashr». Savol ID lari, to‘g‘ri javoblar va statistika barcha tillarda bir xil bo‘lishi shart — tizim o‘zbekchasi bilan solishtiradi. Reyting tillar bo‘yicha umumiy.")}
    </div>
    {xabar && <p className="text-sm font-semibold" role="status">{xabar}</p>}
    {!h ? <p className="text-sm text-slate-500">{__kbUi("Yuklanmoqda…")}</p> : <div className="overflow-auto rounded-2xl bg-white border" style={{ borderColor: "#E5E1D8" }}>
      <table className="w-full text-sm"><thead style={{ background: "#F3F0E8" }}><tr className="text-left text-xs text-slate-600">
        <th className="p-2">{__kbUi("Til")}</th><th className="p-2">{__kbUi("Manba")}</th><th className="p-2">{__kbUi("Savollar")}</th><th className="p-2">{__kbUi("Excel")}</th><th className="p-2">{__kbUi("Yangi fayl")}</th></tr></thead>
        <tbody>{h.tillar.map((t) => { const s = tek[t.til]; const n = s?.natija; return <tr key={t.til} className="border-t align-top">
          <td className="p-2 font-semibold whitespace-nowrap">{BAYROQ[t.til]} {t.nom}</td>
          <td className="p-2 text-xs">{t.manba === "baza" ? <span className="rounded px-1.5 py-0.5" style={{ background: "#E7F4EC", color: "#25683B" }}>{__kbUi("Excel (baza)")}</span> : t.manba === "fayl" ? __kbUi("asl (kod ichida)") : <span className="text-amber-700">{__kbUi("hali yo‘q")}</span>}
            {t.yangilandi && <small className="block text-slate-500">{String(t.yangilandi).slice(0, 16).replace("T", " ")}</small>}</td>
          <td className="p-2 tabular-nums">{t.soni || "—"}</td>
          <td className="p-2"><button type="button" className="rounded-lg border px-2 py-1 text-xs" onClick={() => shablon(t.til)}>⬇ {t.manba === "yo'q" ? __kbUi("Shablon") : __kbUi("Joriy")}</button>
            {t.manba === "baza" && <button type="button" className="ml-1 rounded-lg border px-2 py-1 text-xs" onClick={() => qaytar(t.til)}>↩ {__kbUi("Asliga")}</button>}</td>
          <td className="p-2 min-w-[260px]">
            <label className="inline-block rounded-lg border px-2 py-1 text-xs cursor-pointer">⬆ {__kbUi("Tanlash va tekshirish")}
              <input type="file" accept=".xlsx" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) tekshir(t.til, f); e.target.value = ""; }} /></label>
            {s?.busy && <span className="ml-2 text-xs">⏳</span>}
            {n && <div className="mt-1 text-xs">
              {n.tayyor ? <span style={{ color: "#25683B" }}>✅ {n.savollar} {__kbUi("savol")}, {n.variantlar} {__kbUi("variant — xato yo‘q")}</span>
                : <span className="text-red-700">❌ {n.xato_soni || n.xatolar?.length} {__kbUi("ta xato")}</span>}
              {!n.tayyor && <ul className="list-disc pl-4 text-red-700 max-h-32 overflow-auto">{(n.xatolar || []).slice(0, 30).map((x, i) => <li key={i}>{x}</li>)}</ul>}
              {n.ogohlantirishlar?.length > 0 && <details><summary className="text-amber-700">⚠ {n.ogohlantirishlar.length} {__kbUi("ta ogohlantirish")}</summary>
                <ul className="list-disc pl-4">{n.ogohlantirishlar.slice(0, 30).map((x, i) => <li key={i}>{x}</li>)}</ul></details>}
              {n.tayyor && <button type="button" disabled={s?.busy} className="mt-1 rounded-lg px-3 py-1 text-xs font-bold text-white" style={{ background: "#1B4B7A" }} onClick={() => nashr(t.til)}>📢 {__kbUi("Nashr")}</button>}
            </div>}
          </td></tr>; })}</tbody></table></div>}
  </div>;
}
