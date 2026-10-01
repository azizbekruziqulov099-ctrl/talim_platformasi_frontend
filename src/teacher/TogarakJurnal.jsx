import React, { useCallback, useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { errorText } from "./libraryRules.js";
import { csvJournal, monthShift, monthTitle, money, todayIso } from "./journalRules.js";
import "./togarakJurnal.css";

const HOLAT = [
  { v: "keldi", t: "Keldi", e: "✅" },
  { v: "kech", t: "Kech", e: "🕐" },
  { v: "kelmadi", t: "Kelmadi", e: "❌" },
];

/** REV96: to'garak/repetitor guruhi — yo'qlama va oylik to'lovlar (bot bilan bir xil ma'lumot). */
export default function TogarakJurnal({ apiBase, token, togarakId, onOrtga }) {
  const base = `${String(apiBase).replace(/\/+$/, "")}/api/togarak_jurnal/${togarakId}`;
  const [tab, setTab] = useState("yoqlama");
  const [sana, setSana] = useState(todayIso());
  const [oy, setOy] = useState(todayIso().slice(0, 7));
  const [data, setData] = useState(null);
  const [marks, setMarks] = useState({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [custom, setCustom] = useState({});

  const call = useCallback(async (path, opts = {}) => {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(`${base}${path}${sep}${new URLSearchParams({ token })}`, {
      cache: "no-store", ...opts, headers: opts.body ? { "Content-Type": "application/json" } : undefined,
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(errorText(d, res.status));
    return d;
  }, [base, token]);

  const load = useCallback(async () => {
    try {
      const d = await call(`?${new URLSearchParams({ sana: tab === "yoqlama" ? sana : `${oy}-01`, oy })}`);
      setData(d);
      setMarks(Object.fromEntries(d.azolar.map((a) => [a.user_id, { holat: a.holat, izoh: a.izoh || "" }])));
      setDirty(false);
    } catch (e) { setMsg(`⚠️ ${e.message}`); }
  }, [call, sana, oy, tab]);
  useEffect(() => { load(); }, [load]);

  const setMark = (uid, patch) => { setMarks((m) => ({ ...m, [uid]: { ...(m[uid] || {}), ...patch } })); setDirty(true); };
  const allCame = () => { setMarks((m) => Object.fromEntries(Object.keys(m).map((k) => [k, { ...m[k], holat: m[k]?.holat || "keldi" }]))); setDirty(true); };

  const save = async () => {
    const belgilar = Object.entries(marks).filter(([, v]) => v?.holat).map(([k, v]) => ({ user_id: Number(k), holat: v.holat, izoh: v.izoh || "" }));
    if (!belgilar.length) { setMsg(__kbUi("Avval kim kelganini belgilang")); return; }
    setBusy(true);
    try {
      const r = await call("/yoqlama", { method: "PUT", body: JSON.stringify({ sana, belgilar }) });
      setMsg(__kbUi(`Saqlandi ✅ ${r.saqlandi} ta o‘quvchi · botda ham ko‘rinadi`));
      await load();
    } catch (e) { setMsg(`⚠️ ${e.message}`); } finally { setBusy(false); }
  };

  const pay = async (a, amount) => {
    setBusy(true);
    try {
      const body = { user_id: a.user_id, oy };
      if (amount !== undefined && amount !== "") body.summa = Number(String(amount).replace(/\D/g, "")) || 0;
      await call("/tolov", { method: "POST", body: JSON.stringify(body) });
      setCustom((c) => ({ ...c, [a.user_id]: "" }));
      await load();
    } catch (e) { setMsg(`⚠️ ${e.message}`); } finally { setBusy(false); }
  };
  const unpay = async (a) => {
    if (!window.confirm(__kbUi(`${a.ism} — ${monthTitle(oy)} to‘lovi bekor qilinsinmi?`))) return;
    setBusy(true);
    try { await call(`/tolov?${new URLSearchParams({ user_id: a.user_id, oy })}`, { method: "DELETE" }); await load(); }
    catch (e) { setMsg(`⚠️ ${e.message}`); } finally { setBusy(false); }
  };
  const editPrice = async () => {
    const v = window.prompt(__kbUi("Oylik to‘lov summasi (so‘m):"), String(data?.guruh?.oylik_summa || ""));
    if (v === null) return;
    const n = Number(String(v).replace(/\D/g, ""));
    if (!Number.isFinite(n)) return;
    try { await call("/sozlama", { method: "PUT", body: JSON.stringify({ oylik_summa: n }) }); await load(); }
    catch (e) { setMsg(`⚠️ ${e.message}`); }
  };
  const exportCsv = () => {
    const blob = new Blob(["﻿" + csvJournal(data)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `${data.guruh.nomi}-${oy}.csv`.replace(/[\\/:*?"<>|]+/g, "_");
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const g = data?.guruh;
  const h = data?.hisob;
  const marked = Object.values(marks).filter((m) => m?.holat).length;

  return (
    <div className="tj-root">
      <button type="button" className="tj-back" onClick={onOrtga}>‹ {__kbUi("Guruhga qaytish")}</button>
      <h1>{g?.nomi || "…"}</h1>
      <p className="tj-sub">{data ? __kbUi(`${data.azolar.length}/${g.max_talaba} o‘quvchi · oylik ${money(g.oylik_summa)}`) : ""}</p>
      <div className="tj-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "yoqlama"} className={tab === "yoqlama" ? "is-on" : ""} onClick={() => setTab("yoqlama")}>📋 {__kbUi("Yo‘qlama")}</button>
        <button type="button" role="tab" aria-selected={tab === "tolov"} className={tab === "tolov" ? "is-on" : ""} onClick={() => setTab("tolov")}>💰 {__kbUi("To‘lovlar")}</button>
      </div>
      {msg && <p className="tj-msg" role="status" onClick={() => setMsg("")}>{msg}</p>}
      {!data ? <p className="tj-muted">{__kbUi("Yuklanmoqda…")}</p> : data.azolar.length === 0 ? (
        <p className="tj-empty">{__kbUi("Guruhda hali o‘quvchi yo‘q. «Talabalar» bo‘limidagi parol yoki havola orqali o‘quvchilarni qo‘shing (50 tagacha).")}</p>
      ) : tab === "yoqlama" ? (
        <section className="tj-card">
          <div className="tj-bar">
            <label>{__kbUi("Sana")} <input type="date" value={sana} max={todayIso()} onChange={(e) => setSana(e.target.value || todayIso())} /></label>
            <button type="button" className="tj-btn" onClick={allCame}>✅ {__kbUi("Qolganlar keldi")}</button>
          </div>
          <ul className="tj-list">
            {data.azolar.map((a) => {
              const m = marks[a.user_id] || {};
              return <li key={a.user_id} className={`tj-row is-${m.holat || "none"}`}>
                <div className="tj-name"><b>{a.ism}</b><small>{__kbUi(`Shu oy: ✅${a.oy_keldi} 🕐${a.oy_kech} ❌${a.oy_kelmadi}`)}</small></div>
                <div className="tj-seg" role="radiogroup" aria-label={a.ism}>
                  {HOLAT.map((x) => <button key={x.v} type="button" role="radio" aria-checked={m.holat === x.v} className={m.holat === x.v ? `is-on is-${x.v}` : ""}
                    onClick={() => setMark(a.user_id, { holat: x.v })}>{x.e} <span>{__kbUi(x.t)}</span></button>)}
                </div>
                {(m.holat === "kech" || m.holat === "kelmadi") && <input className="tj-note" value={m.izoh || ""} maxLength={120}
                  placeholder={__kbUi(m.holat === "kech" ? "Necha daqiqa? (masalan: 10 daqiqa)" : "Sababi (masalan: kasal, sababli)")}
                  onChange={(e) => setMark(a.user_id, { izoh: e.target.value })} />}
              </li>;
            })}
          </ul>
          <div className="tj-save">
            <small>{__kbUi(`${marked}/${data.azolar.length} belgilandi`)}</small>
            <button type="button" className="tj-btn tj-primary" disabled={busy || !dirty} onClick={save}>{busy ? "…" : __kbUi("Yo‘qlamani saqlash")}</button>
          </div>
          {data.dars_kunlari.length > 0 && <p className="tj-muted">{__kbUi(`Shu oyda yo‘qlama qilingan kunlar: ${data.dars_kunlari.map((d) => Number(d.slice(8))).join(", ")}`)}</p>}
        </section>
      ) : (
        <section className="tj-card">
          <div className="tj-bar">
            <button type="button" className="tj-btn" onClick={() => setOy(monthShift(oy, -1))}>◀</button>
            <b className="tj-month">{__kbUi(monthTitle(oy))}</b>
            <button type="button" className="tj-btn" onClick={() => setOy(monthShift(oy, 1))}>▶</button>
            <button type="button" className="tj-btn" onClick={editPrice}>✏️ {__kbUi("Oylik summa")}</button>
            <button type="button" className="tj-btn" onClick={exportCsv}>📥 {__kbUi("Excel")}</button>
          </div>
          <div className="tj-sum">
            <span><small>{__kbUi("Kutilgan")}</small><b>{money(h.kutilgan)}</b></span>
            <span className="is-ok"><small>{__kbUi("Yig‘ildi")}</small><b>{money(h.yigilgan)}</b></span>
            <span className="is-bad"><small>{__kbUi("Qarz")}</small><b>{money(h.qarz)}</b></span>
            <span><small>{__kbUi("To‘laganlar")}</small><b>{h.tolaganlar}/{h.azolar}{h.qisman ? ` (+${h.qisman} ${__kbUi("qisman")})` : ""}</b></span>
          </div>
          {!g.oylik_summa && <p className="tj-muted">{__kbUi("Oylik summa kiritilmagan — «✏️ Oylik summa» tugmasi bilan kiriting, qarz shunda hisoblanadi.")}</p>}
          <ul className="tj-list">
            {data.azolar.map((a) => {
              const paid = a.tolov_summa !== null && a.tolov_summa !== undefined;
              const full = paid && a.tolov_summa >= g.oylik_summa;
              return <li key={a.user_id} className={`tj-row ${full ? "is-keldi" : paid ? "is-kech" : "is-kelmadi"}`}>
                <div className="tj-name"><b>{a.ism}</b>
                  <small>{paid ? __kbUi(`${full ? "✅ To‘lagan" : "🟠 Qisman"}: ${money(a.tolov_summa)}${a.tolov_sana ? ` · ${a.tolov_sana}` : ""}`) : __kbUi(`❌ To‘lamagan${g.oylik_summa ? ` · ${money(g.oylik_summa)}` : ""}`)}</small></div>
                <div className="tj-pay">
                  {!full && <button type="button" className="tj-btn tj-primary" disabled={busy} onClick={() => pay(a)}>✅ {__kbUi("To‘ladi")}</button>}
                  <input inputMode="numeric" placeholder={__kbUi("boshqa summa")} value={custom[a.user_id] || ""} onChange={(e) => setCustom((c) => ({ ...c, [a.user_id]: e.target.value }))} />
                  {custom[a.user_id] && <button type="button" className="tj-btn" disabled={busy} onClick={() => pay(a, custom[a.user_id])}>{__kbUi("Saqlash")}</button>}
                  {paid && <button type="button" className="tj-btn" disabled={busy} onClick={() => unpay(a)} title={__kbUi("Bekor qilish")}>↩️</button>}
                </div>
              </li>;
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
