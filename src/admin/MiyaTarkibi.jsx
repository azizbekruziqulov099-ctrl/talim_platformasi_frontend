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
  const [prog, setProg] = useState(null);   // REV190: {i, n, nom} — o'chirish jarayoni
  const stopRef = React.useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${base}?${new URLSearchParams({ token })}`, { cache: "no-store" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail
        : [502, 503, 504].includes(res.status) ? "Server band yoki qayta ishga tushmoqda — 1 daqiqadan keyin «Qayta» bosing" : `Yuklanmadi (${res.status})`);
      setData(d); setError("");
    } catch (e) { setError(e instanceof TypeError ? "Serverga ulanib bo‘lmadi — internet yoki server qayta ishga tushmoqda. «Qayta» bosing." : e.message); }
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
    // REV190: bittalab o'chiriladi — har biri qisqa so'rov, jarayon ko'rinib turadi, server qotmaydi, to'xtatish mumkin
    setBusy(true); setMsg(""); stopRef.current = false;
    const jami = { darslar: 0, kitoblar: 0, mavzular: 0, testlar: 0 };
    const xatolar = [];
    for (let i = 0; i < chosen.length; i += 1) {
      if (stopRef.current) break;
      const r = chosen[i];
      setProg({ i, n: chosen.length, nom: `${r.sinf} — ${r.fan}` });
      let ok = false;
      for (let urinish = 1; urinish <= 3 && !ok; urinish += 1) {
        try {
          const res = await fetch(`${base}/ochir?${new URLSearchParams({ token })}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tanlanganlar: [{ sinf: r.sinf, fan: r.fan }], ...what, tasdiq: word }),
          });
          const d = await res.json().catch(() => ({}));
          if (res.status === 400) { setMsg(`⚠️ ${d.detail || "Tasdiq noto‘g‘ri"}`); stopRef.current = true; break; }
          if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : String(res.status));
          for (const k of Object.keys(jami)) jami[k] += (d.ochirildi || {})[k] || 0;
          ok = true;
        } catch (e) {
          if (urinish === 3) xatolar.push(`${r.sinf} — ${r.fan}: ${e.message}`);
          else await new Promise((res) => setTimeout(res, 5000 * urinish));
        }
      }
    }
    setProg(null);
    setMsg(`${stopRef.current ? "⏹ To‘xtatildi. " : "✅ Tugadi. "}O‘chirildi: ${jami.darslar} ta miya darsi, ${jami.kitoblar} ta kitob, ${jami.mavzular} ta mavzu, ${jami.testlar} ta test`
      + (xatolar.length ? ` · ⚠️ ${xatolar.length} tasida xato (qayta bosing): ${xatolar.slice(0, 3).join("; ")}` : ""));
    setPicked({}); setBusy(false);
    await load();
  };

  return (
    <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
      <button type="button" className="w-full flex items-center justify-between text-left" onClick={() => setOpen((v) => !v)}>
        <span><b className="text-sm">🧠 {__kbUi("Miya tarkibi — ko‘rish va tanlab o‘chirish")}</b>
          <small className="block text-xs text-slate-500">{__kbUi("Guruh (sinf/yosh) va fan bo‘yicha: kitob, miya darslari, mavzular, testlar")}</small></span>
        <span className="text-slate-500">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="mt-3 space-y-3">
        {/* REV207: nashr qilingan, lekin «Katalogga biriktirilmagan» darslarni bir bosishda o'quvchilarga ko'rinadigan qilish */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl p-3" style={{ background: "#EEF6FF", border: "1px solid #CFE3F7" }}>
          <button type="button" disabled={busy} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white" style={{ background: "#1D6FD8" }}
            onClick={async () => {
              setBusy(true); setMsg("");
              try {
                const res = await fetch(`${base.replace(/miya_tarkibi$/, "miya_katalog_tuzat")}?${new URLSearchParams({ token })}`, { method: "POST" });
                const d = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : `Xato ${res.status}`);
                setMsg(`✅ ${d.jami} ta mavzu tekshirildi: ${d.ulandi} tasi katalogga ulandi, ${d.tiklandi} tasi tiklandi, ${d.yaratildi} tasi yaratildi${d.xato ? `, ${d.xato} tasida xato` : ""}. Endi o‘quvchilarga ko‘rinadi.`);
                await load();
              } catch (e) { setMsg(`⚠️ ${e.message}`); } finally { setBusy(false); }
            }}>🔧 {__kbUi("Ko‘rinmayotgan darslarni katalogga ulash")}</button>
          <small className="text-xs text-slate-600">{__kbUi("Miya yuklangan, lekin o‘quvchiga chiqmayotgan bo‘lsa — shuni bosing")}</small>
        </div>
        {error && <p className="text-sm text-red-700">{error} <button type="button" className="underline font-semibold" onClick={() => { setError(""); load(); }}>{__kbUi("Qayta")}</button></p>}
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
                    <span className="text-xs text-slate-600 whitespace-nowrap">🧠 {r.miya_darslar} · 📚 {r.mavzular} · ✍️ {r.testlar ?? "—"}</span>
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
          {prog && <div className="rounded-xl border p-3" role="status" style={{ borderColor: "#E5E1D8", background: "#FFF8F2" }}>
            <div className="flex items-center justify-between gap-2 text-sm"><b>🗑️ {__kbUi("O‘chirilmoqda")}: {prog.i + 1} / {prog.n}</b>
              <button type="button" className="rounded-lg border px-3 py-1 text-xs font-semibold" onClick={() => { stopRef.current = true; }}>⏹ {__kbUi("To‘xtatish")}</button></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full" style={{ width: `${Math.round(((prog.i) / prog.n) * 100)}%`, background: "#B0553A", transition: "width .3s" }} /></div>
            <small className="mt-1 block text-xs text-slate-600">{prog.nom} · {__kbUi("sahifani yopmang")}</small>
          </div>}
          {msg && <p className="text-sm font-semibold" role="status">{msg}</p>}
        </>}
      </div>}
    </div>
  );
}
