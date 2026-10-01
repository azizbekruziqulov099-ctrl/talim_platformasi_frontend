import React, { useCallback, useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { groupRows, rowKey, selectionSummary } from "./miyaRules.js";

/** REV97: admin — AI miyada nima borligini guruh/fan bo'yicha ko'rish va tanlab o'chirish. */
export default function MiyaTarkibi({ apiBase, token }) {
  const base = `${String(apiBase).replace(/\/+$/, "")}/api/admin/miya_tarkibi`;
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState({});
  const [what, setWhat] = useState({ miya: true, mavzular: false, testlar: false });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${base}?${new URLSearchParams({ token })}`, { cache: "no-store" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : "Yuklanmadi");
      setData(d); setError("");
    } catch (e) { setError(e.message); }
  }, [base, token]);
  useEffect(() => { if (open && !data) load(); }, [open, data, load]);

  const groups = useMemo(() => groupRows(data?.qatorlar || []), [data]);
  const chosen = (data?.qatorlar || []).filter((r) => picked[rowKey(r)]);
  const sum = selectionSummary(chosen, what);

  const toggle = (r) => setPicked((p) => ({ ...p, [rowKey(r)]: !p[rowKey(r)] }));
  const toggleGroup = (rows) => {
    const all = rows.every((r) => picked[rowKey(r)]);
    setPicked((p) => ({ ...p, ...Object.fromEntries(rows.map((r) => [rowKey(r), !all])) }));
  };
  const pickOld = () => setPicked(Object.fromEntries((data?.qatorlar || []).filter((r) => r.eski_yosh).map((r) => [rowKey(r), true])));

  const remove = async () => {
    if (!chosen.length) return;
    const list = chosen.slice(0, 8).map((r) => `• ${r.sinf} — ${r.fan}`).join("\n") + (chosen.length > 8 ? `\n… va yana ${chosen.length - 8} ta` : "");
    const word = window.prompt(__kbUi(`Quyidagilar o‘chiriladi:\n${list}\n\n${sum.text}\n\nQaytarib bo‘lmaydi. Tasdiqlash uchun O'CHIRISH deb yozing:`));
    if (!word) return;
    setBusy(true); setMsg("");
    try {
      const res = await fetch(`${base}/ochir?${new URLSearchParams({ token })}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tanlanganlar: chosen.map((r) => ({ sinf: r.sinf, fan: r.fan })), ...what, tasdiq: word }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : "O‘chirilmadi");
      const o = d.ochirildi || {};
      setMsg(`✅ O‘chirildi: ${o.darslar || 0} ta miya darsi, ${o.kitoblar || 0} ta kitob, ${o.mavzular || 0} ta mavzu, ${o.testlar || 0} ta test`);
      setPicked({});
      await load();
    } catch (e) { setMsg(`⚠️ ${e.message}`); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
      <button type="button" className="w-full flex items-center justify-between text-left" onClick={() => setOpen((v) => !v)}>
        <span><b className="text-sm">🧠 {__kbUi("Miya tarkibi — ko‘rish va tanlab o‘chirish")}</b>
          <small className="block text-xs text-slate-500">{__kbUi("Guruh (sinf/yosh) va fan bo‘yicha: kitob, miya darslari, mavzular, testlar")}</small></span>
        <span className="text-slate-500">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="mt-3 space-y-3">
        {error && <p className="text-sm text-red-700">{error}</p>}
        {data?.bir_martalik && <p className="text-xs rounded-xl p-2" style={{ background: "#EEF7F5", color: "#246D6D" }}>
          {__kbUi(`Bog‘cha guruhlari endi: ${data.yosh_guruhlari.join(", ")}. Bir martalik tozalashda eski «3-4»/«5-6 yosh» miya ma’lumotlari o‘chirildi: ${data.bir_martalik.natija?.miya?.darslar || 0} ta dars, ${data.bir_martalik.natija?.miya?.kitoblar || 0} ta kitob; ${data.bir_martalik.natija?.bolalar_kochirildi || 0} ta bola yangi guruhga o‘tkazildi.`)}
        </p>}
        {!data ? <p className="text-sm text-slate-500">{__kbUi("Yuklanmoqda…")}</p> : <>
          <div className="flex flex-wrap gap-3 items-center text-sm">
            <span className="font-semibold">{__kbUi("Nimani o‘chirish:")}</span>
            {[["miya", "Miya darslari va kitob"], ["mavzular", "Mavzular"], ["testlar", "Testlar"]].map(([k, t]) => (
              <label key={k} className="flex items-center gap-1.5"><input type="checkbox" checked={what[k]} onChange={(e) => setWhat((w) => ({ ...w, [k]: e.target.checked }))} />{__kbUi(t)}</label>
            ))}
            {data.qatorlar.some((r) => r.eski_yosh) && <button type="button" className="rounded-xl border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: "#E7BD73", background: "#FDF3E0", color: "#8A5A1C" }} onClick={pickOld}>{__kbUi("Eski yosh guruhlarini (3-4, 5-6) belgilash")}</button>}
          </div>
          {groups.map(([grade, rows]) => {
            const all = rows.every((r) => picked[rowKey(r)]);
            return <div key={grade} className="rounded-xl border" style={{ borderColor: rows[0].eski_yosh ? "#E7BD73" : "#E5E1D8" }}>
              <label className="flex items-center gap-2 px-3 py-2 text-sm font-bold" style={{ background: rows[0].eski_yosh ? "#FDF3E0" : "#F7F5F0" }}>
                <input type="checkbox" checked={all} onChange={() => toggleGroup(rows)} />
                {grade}{rows[0].eski_yosh ? ` — ${__kbUi("eski guruh, endi ishlatilmaydi")}` : ""}
              </label>
              <ul className="divide-y">
                {rows.map((r) => <li key={rowKey(r)}>
                  <label className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={!!picked[rowKey(r)]} onChange={() => toggle(r)} />
                    <span className="flex-1 min-w-0"><b>{r.fan}</b>
                      <small className="block text-xs text-slate-500 truncate">{r.kitoblar.length ? r.kitoblar.map((k) => k.nomi).join(" · ") : __kbUi("kitob yo‘q")}</small></span>
                    <span className="text-xs text-slate-600 whitespace-nowrap">🧠 {r.miya_darslar} · 📚 {r.mavzular} · ✍️ {r.testlar}</span>
                  </label>
                </li>)}
              </ul>
            </div>;
          })}
          <div className="sticky bottom-20 flex flex-wrap items-center justify-between gap-2 rounded-xl p-3" style={{ background: "#fff", boxShadow: "0 -4px 14px rgba(0,0,0,.06)" }}>
            <small className="text-xs text-slate-600">{chosen.length ? `${chosen.length} ${__kbUi("ta tanlandi")} · ${sum.text}` : __kbUi("Belgilang — keyin o‘chirasiz")}</small>
            <button type="button" disabled={busy || !chosen.length || !sum.any} onClick={remove} className="rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-40" style={{ background: "#B0553A" }}>
              {busy ? "…" : `🗑️ ${__kbUi("Tanlanganlarni o‘chirish")}`}</button>
          </div>
          {msg && <p className="text-sm font-semibold" role="status">{msg}</p>}
        </>}
      </div>}
    </div>
  );
}
