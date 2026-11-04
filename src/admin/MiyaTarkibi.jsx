import React, { useCallback, useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { groupRows, rowKey, selectionSummary } from "./miyaRules.js";

/** REV97: admin — AI miyada nima borligini guruh/fan bo'yicha ko'rish va tanlab o'chirish. */
export default function MiyaTarkibi({ apiBase, token }) {
  const base = `${String(apiBase).replace(/\/+$/, "")}/api/admin/miya_tarkibi`;
  const [diag, setDiag] = React.useState(null);   // REV218
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState({});
  const [what, setWhat] = useState({ miya: true, mavzular: false, testlar: false });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [open] = useState(true);   // REV300: alohida bo'limda — darhol ochiq
  const [qidir, setQidir] = useState("");
  const [bolim, setBolim] = useState("hammasi");
  const [tilF, setTilF] = useState("hammasi");
  const [ochiq, setOchiq] = useState({});   // REV302: ochilgan guruhlar (bo'lim va fan) — boshida hammasi yig'iq
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
  const chosenAll = (data?.qatorlar || []).filter((r) => picked[rowKey(r)]);
  const sum = selectionSummary(chosenAll, what);
  // REV300: jadval — filtrlar (qidiruv, bo'lim, til) va jami
  const tilOf = (fan) => (/\(izoh: rus\)/i.test(fan) ? "ru" : /\(izoh: ingliz\)/i.test(fan) ? "en" : "uz");
  const bolimOf = (sinf) => (/yosh/i.test(sinf) ? "bogcha" : /^\d+$/.test(String(sinf).trim()) ? "maktab" : "boshqa");
  const filtered = (data?.qatorlar || []).filter((r) => (bolim === "hammasi" || bolimOf(r.sinf) === bolim)
    && (tilF === "hammasi" || tilOf(r.fan) === tilF)
    && (!qidir.trim() || `${r.sinf} ${r.fan} ${(r.kitoblar || []).map((k) => k.nomi).join(" ")}`.toLowerCase().includes(qidir.trim().toLowerCase())));
  const jami = (rows) => rows.reduce((a, r) => ({ d: a.d + (Number(r.miya_darslar) || 0), m: a.m + (Number(r.mavzular) || 0), t: a.t + (Number(r.testlar) || 0), k: a.k + (r.kitoblar || []).length }), { d: 0, m: 0, t: 0, k: 0 });
  const jf = jami(filtered); const ja = jami(data?.qatorlar || []);
  const hammasiTanlangan = filtered.length > 0 && filtered.every((r) => picked[rowKey(r)]);
  // REV302: bo'lim → fan → (guruh × til) daraxti; har darajada jami
  const BOLIM_NOM = { bogcha: "🧒 Bog‘cha (bolalar)", maktab: "🏫 Maktab (1–11-sinf)", boshqa: "🎓 Markaz va boshqalar" };
  const asos = (fan) => String(fan || "").replace(/\s*\(izoh: (rus|ingliz)\)/i, "").trim();
  const guruhlar = ["bogcha", "maktab", "boshqa"].map((b) => {
    const rows = filtered.filter((r) => bolimOf(r.sinf) === b);
    const fmap = new Map();
    for (const r of rows) { const n = asos(r.fan); if (!fmap.has(n)) fmap.set(n, []); fmap.get(n).push(r); }
    const sinfTartib = (x) => { const m = String(x.sinf).match(/\d+/); return m ? Number(m[0]) : 999; };
    const fanlar = [...fmap.entries()].sort((x, y) => x[0].localeCompare(y[0])).map(([nom, rs]) => ({ nom, j: jami(rs),
      rows: rs.sort((x, y) => sinfTartib(x) - sinfTartib(y) || "uzruen".indexOf(tilOf(x.fan)) - "uzruen".indexOf(tilOf(y.fan))) }));
    return { bolim: b, nom: BOLIM_NOM[b], rows, fanlar, j: jami(rows) };
  }).filter((g) => g.rows.length);

  const toggle = (r) => setPicked((p) => ({ ...p, [rowKey(r)]: !p[rowKey(r)] }));
  const toggleGroup = (rows) => {
    const all = rows.every((r) => picked[rowKey(r)]);
    setPicked((p) => ({ ...p, ...Object.fromEntries(rows.map((r) => [rowKey(r), !all])) }));
  };
  const pickOld = () => setPicked(Object.fromEntries((data?.qatorlar || []).filter((r) => r.eski_yosh).map((r) => [rowKey(r), true])));

  const removeRows = (rows) => remove(null, rows);
  const remove = async (faqat = null, toplam = null) => {
    const chosen = toplam || (faqat ? [faqat] : chosenAll);
    if (!chosen.length) return;
    const list = chosen.slice(0, 8).map((r) => `• ${r.sinf} — ${r.fan}`).join("\n") + (chosen.length > 8 ? `\n… va yana ${chosen.length - 8} ta` : "");
    const word = window.prompt(__kbUi(`Quyidagilar o‘chiriladi:\n${list}\n\n${selectionSummary(chosen, what).text}\n\nQaytarib bo‘lmaydi. Tasdiqlash uchun O'CHIRISH deb yozing:`));
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
          for (const k of Object.keys(d.ochirildi || {})) jami[k] = (jami[k] || 0) + ((d.ochirildi || {})[k] || 0);
          ok = true;
        } catch (e) {
          if (urinish === 3) xatolar.push(`${r.sinf} — ${r.fan}: ${e.message}`);
          else await new Promise((res) => setTimeout(res, 5000 * urinish));
        }
      }
    }
    setProg(null);
    setMsg(`${stopRef.current ? "⏹ To‘xtatildi. " : "✅ Tugadi. "}O‘chirildi: ${jami.darslar} ta miya darsi, ${jami.kitoblar} ta kitob, ${jami.mavzular} ta mavzu, ${jami.testlar} ta test${jami.saqlandi_darsli_mavzu ? ` · ${jami.saqlandi_darsli_mavzu} ta mavzu darsi borligi uchun saqlab qolindi (avval miyani o‘chiring)` : ""}`
      + (xatolar.length ? ` · ⚠️ ${xatolar.length} tasida xato (qayta bosing): ${xatolar.slice(0, 3).join("; ")}` : ""));
    setPicked({}); setBusy(false);
    await load();
  };

  const th = "px-2 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600 whitespace-nowrap";
  const td = "px-2 py-2 text-xs align-top";
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[["Fan × guruh", (data?.qatorlar || []).length], ["Kitoblar", ja.k], ["🧠 Miya darslari", ja.d], ["📚 Mavzular", ja.m], ["✍️ Testlar", ja.t]].map(([t, n]) => (
          <div key={t} className="rounded-xl bg-white border p-3 text-center" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-lg font-bold" style={{ color: "#1B4B7A" }}>{data ? n : "…"}</p><p className="text-[10px] text-slate-500">{__kbUi(t)}</p></div>))}
      </div>
      <div className="rounded-2xl bg-white border p-3 space-y-3" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex flex-wrap items-center gap-2">
          <input type="search" value={qidir} onChange={(e) => setQidir(e.target.value)} placeholder={__kbUi("Qidirish: fan, guruh, kitob…")}
            className="flex-1 min-w-[180px] rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#D8D3C7" }} />
          <select value={bolim} onChange={(e) => setBolim(e.target.value)} className="rounded-lg border px-2 py-2 text-sm" style={{ borderColor: "#D8D3C7" }} aria-label={__kbUi("Bo‘lim")}>
            <option value="hammasi">{__kbUi("Hammasi")}</option><option value="bogcha">{__kbUi("Bog‘cha")}</option><option value="maktab">{__kbUi("Maktab (1–11)")}</option><option value="boshqa">{__kbUi("Markaz va boshqalar")}</option></select>
          <select value={tilF} onChange={(e) => setTilF(e.target.value)} className="rounded-lg border px-2 py-2 text-sm" style={{ borderColor: "#D8D3C7" }} aria-label={__kbUi("Til")}>
            <option value="hammasi">{__kbUi("Barcha tillar")}</option><option value="uz">O‘zbekcha</option><option value="ru">Русский</option><option value="en">English</option></select>
          <button type="button" className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#D8D3C7" }} onClick={() => { setData(null); load(); }}>🔄 {__kbUi("Yangilash")}</button>
          <button type="button" disabled={busy} className="rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ background: "#1D6FD8" }} title={__kbUi("Miya yuklangan, lekin o‘quvchiga chiqmayotgan bo‘lsa — shuni bosing")}
            onClick={async () => {
              setBusy(true); setMsg("");
              try {
                const yol = base.replace(/miya_tarkibi$/, "miya_katalog_tuzat");
                const res = await fetch(`${yol}?${new URLSearchParams({ token })}`, { method: "POST" });
                let d = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : `Xato ${res.status}`);
                for (let i = 0; i < 200 && d.ishlayapti; i += 1) {
                  setMsg(`⏳ Tekshirilmoqda… ${i * 3} s`);
                  await new Promise((r) => setTimeout(r, 3000));
                  d = await (await fetch(`${yol}/holat?${new URLSearchParams({ token })}`)).json().catch(() => d);
                }
                if (d.xato) throw new Error(d.xato);
                const n = d.natija || {};
                setMsg(`✅ ${n.jami || 0} ta mavzu tekshirildi: ${n.ulandi || 0} tasi katalogga ulandi, ${n.kochirildi || 0} tasi o‘z faniga ko‘chirildi`);
                await load();
              } catch (e) { setMsg(`⚠️ ${e.message}`); } finally { setBusy(false); }
            }}>🔧 {__kbUi("Ko‘rinmayotganlarni ulash")}</button>
        </div>
        <div className="flex flex-wrap gap-3 items-center text-sm rounded-xl p-2" style={{ background: "#FBF7F2" }}>
          <span className="w-full text-xs" style={{ color: "#25683B" }}>📥 {__kbUi("Tozalashdan oldin har qatordagi 📥 tugmasi bilan testlarni Excel'ga saqlab oling (DTS test miyasi). Testi bor mavzu «Testlar» belgilanmaguncha o‘chirilmaydi — testlar yo‘qolmaydi.")}</span>
          <span className="font-semibold">{__kbUi("O‘chirilganda nima ketadi:")}</span>
          {[["miya", "Miya darslari va kitob"], ["mavzular", "Mavzular"], ["testlar", "Testlar"]].map(([k, t]) => (
            <label key={k} className="flex items-center gap-1.5"><input type="checkbox" checked={what[k]} onChange={(e) => setWhat((w) => ({ ...w, [k]: e.target.checked }))} />{__kbUi(t)}</label>))}
          {data?.qatorlar?.some((r) => r.eski_yosh) && <button type="button" className="rounded-lg border px-2 py-1 text-xs font-semibold" style={{ borderColor: "#E7BD73", background: "#FDF3E0", color: "#8A5A1C" }} onClick={pickOld}>{__kbUi("Eski guruhlarni tanlash")}</button>}
        </div>
        {error && <p className="text-sm text-red-700">{error} <button type="button" className="underline font-semibold" onClick={() => { setError(""); load(); }}>{__kbUi("Qayta")}</button></p>}
        {!data ? <p className="text-sm text-slate-500">{__kbUi("Yuklanmoqda…")}</p> : <div className="overflow-auto rounded-xl border" style={{ borderColor: "#E5E1D8", maxHeight: "60vh" }}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10" style={{ background: "#F3F0E8" }}><tr>
              <th className={th}><input type="checkbox" aria-label={__kbUi("Ko‘rinayotganlarning hammasini tanlash")} checked={hammasiTanlangan}
                onChange={() => setPicked((p) => ({ ...p, ...Object.fromEntries(filtered.map((r) => [rowKey(r), !hammasiTanlangan])) }))} /></th>
              <th className={th}>{__kbUi("Guruh")}</th><th className={th}>{__kbUi("Fan")}</th><th className={th}>{__kbUi("Til")}</th><th className={th}>{__kbUi("Kitob")}</th>
              <th className={`${th} text-right`}>🧠</th><th className={`${th} text-right`}>📚</th><th className={`${th} text-right`}>✍️</th><th className={th}></th></tr></thead>
            <tbody>
              {guruhlar.map((g) => { const bk = `b:${g.bolim}`; const bOchiq = !!ochiq[bk] || !!qidir.trim();
                const bTan = g.rows.length > 0 && g.rows.every((r) => picked[rowKey(r)]);
                return <React.Fragment key={bk}>
                <tr className="border-t" style={{ background: "#EEF3F9", borderColor: "#D9E3EE" }}>
                  <td className={td}><input type="checkbox" aria-label={g.nom} checked={bTan} onChange={() => setPicked((p) => ({ ...p, ...Object.fromEntries(g.rows.map((r) => [rowKey(r), !bTan])) }))} /></td>
                  <td className={`${td} font-bold text-sm`} colSpan={4}><button type="button" className="flex items-center gap-2" onClick={() => setOchiq((o) => ({ ...o, [bk]: !o[bk] }))} aria-expanded={bOchiq}>
                    <span aria-hidden="true">{bOchiq ? "▾" : "▸"}</span>{__kbUi(g.nom)} <small className="font-normal text-slate-500">({g.fanlar.length} {__kbUi("fan")}, {g.rows.length} {__kbUi("qator")})</small></button></td>
                  <td className={`${td} text-right font-bold`}>{g.j.d}</td><td className={`${td} text-right font-bold`}>{g.j.m}</td><td className={`${td} text-right font-bold`}>{g.j.t}</td>
                  <td className={td}><button type="button" disabled={busy || !sum.any} title={__kbUi("Butun bo‘limni o‘chirish")} className="rounded border px-1.5 py-0.5" style={{ borderColor: "#E4B9A8", color: "#B0553A" }} onClick={() => removeRows(g.rows)}>🗑</button></td></tr>
                {bOchiq && g.fanlar.map((f) => { const fk = `f:${g.bolim}:${f.nom}`; const fOchiq = !!ochiq[fk] || !!qidir.trim();
                  const fTan = f.rows.every((r) => picked[rowKey(r)]);
                  return <React.Fragment key={fk}>
                  <tr className="border-t" style={{ background: "#FAF8F3", borderColor: "#EEE9DF" }}>
                    <td className={td}><input type="checkbox" aria-label={f.nom} checked={fTan} onChange={() => setPicked((p) => ({ ...p, ...Object.fromEntries(f.rows.map((r) => [rowKey(r), !fTan])) }))} /></td>
                    <td className={`${td} font-semibold`} colSpan={4}><button type="button" className="flex items-center gap-2 pl-4" onClick={() => setOchiq((o) => ({ ...o, [fk]: !o[fk] }))} aria-expanded={fOchiq}>
                      <span aria-hidden="true">{fOchiq ? "▾" : "▸"}</span>{f.nom} <small className="font-normal text-slate-500">· {[...new Set(f.rows.map((r) => r.sinf))].length} {__kbUi("guruh")} · {[...new Set(f.rows.map((r) => tilOf(r.fan)))].map((t) => t.toUpperCase()).join("/")}</small></button></td>
                    <td className={`${td} text-right`}>{f.j.d}</td><td className={`${td} text-right`}>{f.j.m}</td><td className={`${td} text-right`}>{f.j.t}</td>
                    <td className={td}><button type="button" disabled={busy || !sum.any} title={__kbUi("Shu fanni (hamma guruh va tilda) o‘chirish")} className="rounded border px-1.5 py-0.5" style={{ borderColor: "#E4B9A8", color: "#B0553A" }} onClick={() => removeRows(f.rows)}>🗑</button></td></tr>
                  {fOchiq && f.rows.map((r) => { const k = rowKey(r); return <React.Fragment key={k}>
                <tr className="border-t" style={{ borderColor: "#EEE9DF", background: picked[k] ? "#FFF5EC" : r.eski_yosh ? "#FDF8EC" : "#fff" }}>
                  <td className={td}><input type="checkbox" aria-label={`${r.sinf} ${r.fan}`} checked={!!picked[k]} onChange={() => toggle(r)} /></td>
                  <td className={`${td} whitespace-nowrap font-semibold pl-10`}>{/^\d+$/.test(r.sinf) ? `${r.sinf}-sinf` : r.sinf}{r.eski_yosh ? " ⚠" : ""}</td>
                  <td className={td}>{String(r.fan).replace(/\s*\(izoh: (rus|ingliz)\)/i, "")}</td>
                  <td className={td}><span className="rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "#EEF3F9", color: "#1B4B7A" }}>{tilOf(r.fan).toUpperCase()}</span></td>
                  <td className={`${td} text-slate-500`} title={(r.kitoblar || []).map((x) => x.nomi).join("\n")}>{(r.kitoblar || []).length ? `${r.kitoblar.length} · ${String(r.kitoblar[0].nomi || "").slice(0, 28)}${r.kitoblar.length > 1 ? "…" : ""}` : "—"}</td>
                  <td className={`${td} text-right tabular-nums`}>{r.miya_darslar}</td><td className={`${td} text-right tabular-nums`}>{r.mavzular}</td><td className={`${td} text-right tabular-nums`}>{r.testlar ?? "—"}</td>
                  <td className={`${td} whitespace-nowrap`}>
                    <button type="button" title={__kbUi("Nega o‘quvchida ko‘rinmayapti?")} className="rounded border px-1.5 py-0.5 mr-1" style={{ borderColor: "#D8D3C7" }}
                      onClick={async () => { setDiag({ key: k, loading: true });
                        try { const res = await fetch(`${base.replace(/miya_tarkibi$/, "miya_diagnoz")}?${new URLSearchParams({ token, sinf: r.sinf, fan: r.fan })}`);
                          const d = await res.json(); setDiag({ key: k, d: res.ok ? d : { sabablar: [d.detail || `Xato ${res.status}`] } });
                        } catch (er) { setDiag({ key: k, d: { sabablar: [er.message] } }); } }}>🔍</button>
                    {/* REV330: DTS test miyasi — shu qator testlarini Excel'ga saqlash (tozalashdan oldin zaxira) */}
                    {Number(r.testlar) > 0 && <a className="rounded border px-1.5 py-0.5 mr-1 inline-block" style={{ borderColor: "#B9D6C2", color: "#25683B" }}
                      title={__kbUi("Testlarni Excel'ga saqlash (DTS test miyasi)")} href={`${base}/testlar_excel?${new URLSearchParams({ token, sinf: r.sinf, fan: r.fan })}`}>📥</a>}
                    <button type="button" disabled={busy || !sum.any} title={__kbUi("Faqat shu qatorni o‘chirish")} className="rounded border px-1.5 py-0.5" style={{ borderColor: "#E4B9A8", color: "#B0553A" }} onClick={() => remove(r)}>🗑</button>
                  </td></tr>
                {diag?.key === k && <tr><td colSpan={9} className="px-3 pb-2"><div className="rounded-lg p-2 text-xs" style={{ background: "#FFF8E6" }}>
                  {diag.loading ? __kbUi("Tekshirilmoqda…") : <><b>{__kbUi("Darsli mavzular")}: {diag.d.darsli_mavzular ?? 0} · {__kbUi("ko‘rinadigan")}: {diag.d.hisob?.korinadi ?? 0}</b>
                    <ul className="list-disc pl-4 mt-1">{(diag.d.sabablar || []).map((x, i) => <li key={i}>{x}</li>)}</ul></>}
                  <button type="button" className="ml-2 underline" onClick={() => setDiag(null)}>{__kbUi("Yopish")}</button></div></td></tr>}
              </React.Fragment>; })}
                  </React.Fragment>; })}
                </React.Fragment>; })}
              {!filtered.length && <tr><td colSpan={9} className="p-4 text-center text-sm text-slate-500">{__kbUi("Hech narsa topilmadi")}</td></tr>}
            </tbody>
            <tfoot className="sticky bottom-0" style={{ background: "#F3F0E8" }}><tr className="border-t font-bold" style={{ borderColor: "#E5E1D8" }}>
              <td className={td}></td><td className={td} colSpan={3}>{__kbUi("Jami")} ({filtered.length})</td><td className={td}>{jf.k}</td>
              <td className={`${td} text-right`}>{jf.d}</td><td className={`${td} text-right`}>{jf.m}</td><td className={`${td} text-right`}>{jf.t}</td><td className={td}></td></tr></tfoot>
          </table>
        </div>}
        <div className="sticky bottom-20 flex flex-wrap items-center justify-between gap-2 rounded-xl p-3" style={{ background: "#fff", boxShadow: "0 -4px 14px rgba(0,0,0,.06)" }}>
          <small className="text-xs text-slate-600">{chosenAll.length ? `${chosenAll.length} ${__kbUi("ta tanlandi")} · ${sum.text}` : __kbUi("Qatorlarni belgilang yoki sarlavhadagi belgi bilan hammasini tanlang")}</small>
          <div className="flex gap-2">
            {chosenAll.length > 0 && <button type="button" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "#D8D3C7" }} onClick={() => setPicked({})}>{__kbUi("Tanlovni bekor qilish")}</button>}
            <button type="button" disabled={busy || !chosenAll.length || !sum.any} onClick={() => remove()} className="rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-40" style={{ background: "#B0553A" }}>
              {busy ? "…" : `🗑️ ${__kbUi("Tanlanganlarni o‘chirish")}`}</button></div>
        </div>
        {prog && <div className="rounded-xl border p-3" role="status" style={{ borderColor: "#E5E1D8", background: "#FFF8F2" }}>
          <div className="flex items-center justify-between gap-2 text-sm"><b>🗑️ {__kbUi("O‘chirilmoqda")}: {prog.i + 1} / {prog.n}</b>
            <button type="button" className="rounded-lg border px-3 py-1 text-xs font-semibold" onClick={() => { stopRef.current = true; }}>⏹ {__kbUi("To‘xtatish")}</button></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full" style={{ width: `${Math.round((prog.i / prog.n) * 100)}%`, background: "#B0553A", transition: "width .3s" }} /></div>
          <small className="mt-1 block text-xs text-slate-600">{prog.nom} · {__kbUi("sahifani yopmang")}</small>
        </div>}
        {msg && <p className="text-sm font-semibold whitespace-pre-line" role="status">{msg}</p>}
      </div>
    </div>
  );
}
