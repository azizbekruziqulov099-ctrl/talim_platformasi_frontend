import React, { useCallback, useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { KURS, KURSLAR, sum } from "../parent/bogchaReja.js";
import "./bogchaNarxlar.css";

// REV162: admin — bog'cha tariflari (kurs soni, oylik narx, narx qulfi 0–3 yil), umumiy sozlamalar, yosh qoidalari,
// obunalar ro'yxati va qo'lda faollashtirish (naqd to'lov, sovg'a, sinov).
const BASE = (a) => String(a || "").replace(/\/+$/, "");

async function api(apiBase, token, path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE(apiBase)}${path}`, { method, cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const d = data?.detail; throw new Error(typeof d === "string" ? d : d?.xabar || `Server xatosi (${res.status})`); }
  return data;
}

/** REV163: tarifni aniq kurs(lar)ga bog'lash — bo'sh bo'lsa istalgan kurs. */
function KursTanla({ value = [], onChange }) {
  return <details className="bn-kurs">
    <summary>{value.length ? value.map((k) => KURS[k]?.emoji || k).join(" ") : __kbUi("Istalgan kurs")}</summary>
    <div className="bn-chips">{KURSLAR.map((k) => { const on = value.includes(k.kalit);
      return <button key={k.kalit} type="button" className={on ? "is-on" : ""} aria-pressed={on}
        onClick={() => onChange(on ? value.filter((x) => x !== k.kalit) : [...value, k.kalit])}>{k.emoji} {__kbUi(k.nom)}</button>; })}</div>
    <small>{__kbUi("Hech biri tanlanmasa — ota-ona istalgan kursni tanlaydi. Tanlansa — faqat shu kurslar (masalan, «Xitoy tili» alohida narxda).")}</small>
  </details>;
}

function TarifQator({ t, onSave, busy }) {
  const asl = { nom: t.nom, kurs_soni: t.kurs_soni, narx_uzs: t.narx_uzs, qulf_yil: t.qulf_yil, faol: t.faol, tartib: t.tartib, kurslar: t.kurslar || [] };
  const [f, setF] = useState(() => asl);
  const changed = JSON.stringify(f) !== JSON.stringify(asl);
  const priceUp = t.id && Number(f.narx_uzs) !== Number(t.narx_uzs);
  return <tr className={f.faol ? "" : "is-off"}>
    <td><input value={f.nom} maxLength={80} onChange={(e) => setF({ ...f, nom: e.target.value })} aria-label={__kbUi("Tarif nomi")} />
      <KursTanla value={f.kurslar} onChange={(kurslar) => setF({ ...f, kurslar })} /></td>
    <td><select value={f.kurs_soni} onChange={(e) => setF({ ...f, kurs_soni: Number(e.target.value) })} aria-label={__kbUi("Kurs soni")}>
      <option value={0}>{__kbUi("To‘liq")}</option>{Array.from({ length: 14 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</select></td>
    <td><input type="number" min={0} step={1000} value={f.narx_uzs} onChange={(e) => setF({ ...f, narx_uzs: Math.max(0, Number(e.target.value) || 0) })} aria-label={__kbUi("Oylik narx")} />
      <small>{sum(f.narx_uzs)}</small></td>
    <td><select value={f.qulf_yil} onChange={(e) => setF({ ...f, qulf_yil: Number(e.target.value) })} aria-label={__kbUi("Narx qulfi")}>
      {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n ? `${n} ${__kbUi("yil")}` : __kbUi("Yo‘q")}</option>)}</select></td>
    <td><label className="bn-switch"><input type="checkbox" checked={f.faol} onChange={(e) => setF({ ...f, faol: e.target.checked })} /> {__kbUi(f.faol ? "Sotuvda" : "Yopiq")}</label></td>
    <td className="bn-subs">{(t.narxlar || []).map((n) => <span key={n.narx_uzs}>{sum(n.narx_uzs)} — <b>{n.soni}</b></span>)}{!(t.narxlar || []).length && "—"}</td>
    <td><button type="button" className="bn-save" disabled={!changed || busy} onClick={() => {
      if (priceUp && !window.confirm(__kbUi("Narx o‘zgaradi. Hozirgi obunachilar o‘z narx qulfi muddati tugaguncha eski narxda uzaytiradi, yangi ulanuvchilar yangi narxda to‘laydi. Davom etilsinmi?"))) return;
      onSave({ id: t.id, ...f });
    }}>{__kbUi("Saqlash")}</button></td>
  </tr>;
}

export default function BogchaNarxlar({ apiBase, token }) {
  useKbInterfaceLocale();
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [rules, setRules] = useState(null);
  const [yangi, setYangi] = useState({ nom: "", kurs_soni: 1, narx_uzs: 0, qulf_yil: 1, faol: false, tartib: 60, kurslar: [] });
  const [qolda, setQolda] = useState({ bola_id: "", fanlar: [], kun: 30, tarif_id: "" });
  const [filter, setFilter] = useState("");
  const [tun, setTun] = useState(null);       // REV167: kechki yopilish
  const [oila, setOila] = useState(null);     // REV167: oila chegirmasi
  const [cheg, setCheg] = useState({ q: "", natija: [], tanlangan: null, turi: "ota", foiz: 10, gacha: "", izoh: "" });
  const load = useCallback(() => {
    api(apiBase, token, "/api/admin/bogcha").then((x) => {
      const v = { tariflar: [], obunalar: [], tarix: [], oxirgi_30_kun: { summa: 0, soni: 0 }, tolov: {}, yosh_qoida: {}, ...(x || {}),
        sozlama: { obuna_majburiy: false, telegram_majburiy: true, yosh_qoida: {}, ...(x?.sozlama || {}) } };
      setD(v); setRules(v.yosh_qoida); setError("");
      setTun({ yoqilgan: true, kun: 22, shanba: 23, ertalab: 6, ...(v.sozlama.tun || {}) });
      setOila({ 2: 0, 3: 0, ...(v.sozlama.oila_chegirma || {}) });
    }).catch((e) => setError(e.message));
  }, [apiBase, token]);
  useEffect(() => { load(); }, [load]);
  const run = async (fn, ok) => {
    setBusy(true); setError(""); setNotice("");
    try { await fn(); setNotice(ok); load(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  if (!d) return <div className="bn-root">{error ? <p className="bn-error">{__kbUi(error)}</p> : <p role="status">{__kbUi("Yuklanmoqda…")}</p>}</div>;
  const s = d.sozlama;
  const saveSettings = (patch) => run(() => api(apiBase, token, "/api/admin/bogcha/sozlama", { method: "PUT",
    body: { obuna_majburiy: s.obuna_majburiy, telegram_majburiy: s.telegram_majburiy, yosh_qoida: s.yosh_qoida, ...patch } }), "Sozlamalar saqlandi");
  const qidir = async (q) => {
    setCheg((c) => ({ ...c, q }));
    if (q.trim().length < 2) { setCheg((c) => ({ ...c, natija: [] })); return; }
    try { const r = await api(apiBase, token, `/api/admin/bogcha/qidir?${new URLSearchParams({ q: q.trim() })}`); setCheg((c) => (c.q === q ? { ...c, natija: r.natija || [] } : c)); }
    catch (e) { setError(e.message); }
  };
  const tanla = (user_id, ism, turi) => setCheg((c) => ({ ...c, tanlangan: { user_id, ism }, turi, natija: [], q: "" }));
  const subs = d.obunalar.filter((o) => !filter || `${o.bola} ${o.ota} ${o.bola_id}`.toLowerCase().includes(filter.toLowerCase()));
  return <div className="bn-root">
    <header className="bn-head">
      <div><h2>🧸 {__kbUi("Bog‘cha: tariflar va obunalar")}</h2>
        <p>{__kbUi("Oxirgi 30 kun")}: <b>{sum(d.oxirgi_30_kun.summa)}</b> · {d.oxirgi_30_kun.soni} {__kbUi("to‘lov")} ·
          {" "}{__kbUi("Faol obunalar")}: <b>{d.obunalar.filter((o) => o.faol).length}</b></p></div>
      <p className={`bn-pay ${d.tolov.click || d.tolov.payme ? "is-on" : ""}`}>{__kbUi("Onlayn to‘lov")}: Click {d.tolov.click ? "✅" : "—"} · Payme {d.tolov.payme ? "✅" : "—"}</p>
    </header>
    {error && <p className="bn-error" role="alert">{__kbUi(error)}</p>}
    {notice && <p className="bn-ok" role="status">{__kbUi(notice)}</p>}

    <section className="bn-card">
      <h3>💳 {__kbUi("Tariflar")}</h3>
      <p className="bn-muted">{__kbUi("«Narx qulfi» — shu tarifga obuna bo‘lgan ota-ona necha yil eski narxda uzaytiradi. Narxni oshirsangiz, faqat yangi ulanuvchilar va qulfi tugaganlar yangi narxda to‘laydi. «To‘liq» — bola yoshiga ruxsat etilgan barcha kurslar.")}</p>
      <div className="bn-table-wrap"><table className="bn-table">
        <thead><tr><th>{__kbUi("Nomi")}</th><th>{__kbUi("Kurs soni")}</th><th>{__kbUi("Oylik narx")}</th><th>{__kbUi("Narx qulfi")}</th><th>{__kbUi("Holat")}</th><th>{__kbUi("Obunachilar (narx — soni)")}</th><th /></tr></thead>
        <tbody>
          {d.tariflar.map((t) => <TarifQator key={`${t.id}-${t.yangilangan_at}`} t={t} busy={busy} onSave={(body) => run(() => api(apiBase, token, "/api/admin/bogcha/tarif", { method: "POST", body }), "Tarif saqlandi")} />)}
          <tr className="bn-new">
            <td><input placeholder={__kbUi("Yangi tarif nomi")} value={yangi.nom} onChange={(e) => setYangi({ ...yangi, nom: e.target.value })} />
              <KursTanla value={yangi.kurslar} onChange={(kurslar) => setYangi({ ...yangi, kurslar })} /></td>
            <td><select value={yangi.kurs_soni} onChange={(e) => setYangi({ ...yangi, kurs_soni: Number(e.target.value) })}>
              <option value={0}>{__kbUi("To‘liq")}</option>{Array.from({ length: 14 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</select></td>
            <td><input type="number" min={0} step={1000} value={yangi.narx_uzs} onChange={(e) => setYangi({ ...yangi, narx_uzs: Math.max(0, Number(e.target.value) || 0) })} /></td>
            <td><select value={yangi.qulf_yil} onChange={(e) => setYangi({ ...yangi, qulf_yil: Number(e.target.value) })}>{[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n ? `${n} ${__kbUi("yil")}` : __kbUi("Yo‘q")}</option>)}</select></td>
            <td><label className="bn-switch"><input type="checkbox" checked={yangi.faol} onChange={(e) => setYangi({ ...yangi, faol: e.target.checked })} /> {__kbUi("Sotuvda")}</label></td>
            <td />
            <td><button type="button" className="bn-save" disabled={busy || !yangi.nom.trim()} onClick={() => run(() => api(apiBase, token, "/api/admin/bogcha/tarif", { method: "POST", body: yangi }), "Tarif qo‘shildi").then(() => setYangi({ ...yangi, nom: "", kurslar: [] }))}>+ {__kbUi("Qo‘shish")}</button></td>
          </tr>
        </tbody>
      </table></div>
      {d.tarix?.length > 0 && <details className="bn-more"><summary>{__kbUi("Narx o‘zgarishlari tarixi")}</summary>
        <ul>{d.tarix.map((h, i) => <li key={i}>{h.sana.slice(0, 10)} · #{h.tarif_id}: {h.eski == null ? "—" : sum(h.eski)} → <b>{sum(h.yangi)}</b> ({__kbUi("qulf")} {h.qulf_yil} {__kbUi("yil")})</li>)}</ul>
      </details>}
    </section>

    <section className="bn-card">
      <h3>⚙️ {__kbUi("Sozlamalar")}</h3>
      <label className="bn-toggle"><input type="checkbox" checked={s.obuna_majburiy} disabled={busy} onChange={(e) => saveSettings({ obuna_majburiy: e.target.checked })} />
        <span><b>{__kbUi("Yangi darslar faqat obuna bilan")}</b><small>{__kbUi("O‘chiq bo‘lsa — darslar bepul, ota-ona faqat haftalik rejani tuzadi. Yoqilsa — obunasiz bog‘cha bolasiga yangi dars ochilmaydi (takror va o‘yinlar ochiq). Adminlar va sinov profillari cheklanmaydi.")}</small></span></label>
      <label className="bn-toggle"><input type="checkbox" checked={s.telegram_majburiy} disabled={busy} onChange={(e) => saveSettings({ telegram_majburiy: e.target.checked })} />
        <span><b>{__kbUi("To‘lovdan oldin Telegram ulash majburiy")}</b><small>{__kbUi("Gmail (agar serverda Google kirish yoqilgan bo‘lsa) har doim talab qilinadi.")}</small></span></label>
      {tun && <div className="bn-night">
        <label className="bn-toggle"><input type="checkbox" checked={tun.yoqilgan} disabled={busy} onChange={(e) => setTun({ ...tun, yoqilgan: e.target.checked })} />
          <span><b>🌙 {__kbUi("Kechasi platforma yopiladi (uxlash vaqti)")}</b><small>{__kbUi("Bog‘cha bolalari uchun. Belgilangan soatda ekranda «Uxlash vaqti» chiqadi, ertalab o‘zi ochiladi. Dars o‘rtasida bo‘lsa — tugatib olishi uchun 10 daqiqa beriladi.")}</small></span></label>
        <div className="bn-form">
          <label>{__kbUi("Ish kunlari va yakshanba — yopiladi")}<select value={tun.kun} onChange={(e) => setTun({ ...tun, kun: Number(e.target.value) })}>{[19, 20, 21, 22, 23, 24].map((h) => <option key={h} value={h}>{h === 24 ? "24:00" : `${h}:00`}</option>)}</select></label>
          <label>{__kbUi("Shanba — yopiladi")}<select value={tun.shanba} onChange={(e) => setTun({ ...tun, shanba: Number(e.target.value) })}>{[19, 20, 21, 22, 23, 24].map((h) => <option key={h} value={h}>{h === 24 ? "24:00" : `${h}:00`}</option>)}</select></label>
          <label>{__kbUi("Ertalab ochiladi")}<select value={tun.ertalab} onChange={(e) => setTun({ ...tun, ertalab: Number(e.target.value) })}>{[5, 6, 7, 8].map((h) => <option key={h} value={h}>{`0${h}:00`}</option>)}</select></label>
        </div>
        <button type="button" className="bn-save" disabled={busy} onClick={() => saveSettings({ tun })}>{__kbUi("Saqlash")}</button>
      </div>}
      <h4>{__kbUi("Yoshga qarab qoidalar")}</h4>
      <div className="bn-table-wrap"><table className="bn-table bn-rules">
        <thead><tr><th>{__kbUi("Yosh")}</th><th>{__kbUi("Ish kuni darslari")}</th><th>{__kbUi("Shanba darslari")}</th><th>{__kbUi("Bir vaqtda kurs")}</th><th>{__kbUi("Shundan chet tili")}</th></tr></thead>
        <tbody>{Object.entries(rules || {}).map(([age, r]) => <tr key={age}><td><b>{age}</b></td>
          {["kun", "shanba", "jami", "til"].map((k) => <td key={k}><input type="number" min={k === "jami" || k === "til" ? 1 : 0} max={k === "jami" || k === "til" ? 13 : 6} value={r[k]}
            onChange={(e) => setRules({ ...rules, [age]: { ...r, [k]: Number(e.target.value) || 0 } })} /></td>)}</tr>)}</tbody>
      </table></div>
      <button type="button" className="bn-save" disabled={busy} onClick={() => saveSettings({ yosh_qoida: Object.fromEntries(Object.entries(rules).map(([a, r]) => [a, { kun: r.kun, shanba: r.shanba, jami: r.jami, til: r.til }])) })}>{__kbUi("Qoidalarni saqlash")}</button>
    </section>

    <section className="bn-card">
      <h3>🎁 {__kbUi("Chegirmalar")}</h3>
      <p className="bn-muted">{__kbUi("Administrator farzandlari (siz «Kim o‘rganadi?» orqali qo‘shgan profillar) — har doim bepul. Bir nechta chegirma to‘g‘ri kelsa, eng kattasi ishlaydi (qo‘shilmaydi). Narx qulfi asl narxdan hisoblanadi.")}</p>
      {oila && <>
        <h4>👨‍👩‍👧‍👦 {__kbUi("Oila chegirmasi (avtomatik)")}</h4>
        <p className="bn-muted">{__kbUi("Bir ota-onaning nechanchi farzandi obuna bo‘lsa — shuncha foiz chegirma. 0 — chegirma yo‘q.")}</p>
        <div className="bn-form">
          <label>{__kbUi("2-farzand, %")}<input type="number" min={0} max={100} value={oila[2]} onChange={(e) => setOila({ ...oila, 2: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /></label>
          <label>{__kbUi("3-va keyingi farzandlar, %")}<input type="number" min={0} max={100} value={oila[3]} onChange={(e) => setOila({ ...oila, 3: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /></label>
        </div>
        <button type="button" className="bn-save" disabled={busy} onClick={() => saveSettings({ oila_chegirma: oila })}>{__kbUi("Saqlash")}</button>
      </>}
      <h4>🙋 {__kbUi("Shaxsiy chegirma")}</h4>
      <p className="bn-muted">{__kbUi("Ota-onaga bersangiz — uning barcha farzandlariga ishlaydi. Faqat bitta farzandga ham berish mumkin. 100% — bepul.")}</p>
      {cheg.tanlangan ? <p className="bn-picked">{cheg.turi === "ota" ? "👪" : "🧒"} <b>{cheg.tanlangan.ism}</b> <small>#{cheg.tanlangan.user_id} · {__kbUi(cheg.turi === "ota" ? "ota-ona (barcha farzandlari)" : "faqat shu farzand")}</small>
        <button type="button" className="bn-link" onClick={() => setCheg({ ...cheg, tanlangan: null })}>{__kbUi("O‘zgartirish")}</button></p>
        : <div className="bn-search">
          <input className="bn-filter" placeholder={__kbUi("Ota-ona yoki bola ismi yoki ID")} value={cheg.q} onChange={(e) => qidir(e.target.value)} />
          {cheg.natija.length > 0 && <ul className="bn-results">{cheg.natija.map((u) => <li key={u.user_id}>
            <button type="button" onClick={() => tanla(u.user_id, u.ism, u.bola ? "bola" : "ota")}>{u.bola ? "🧒" : "👪"} <b>{u.ism}</b> <small>#{u.user_id}</small></button>
            {u.bolalar.length > 0 && <span className="bn-kids">{u.bolalar.map((k) => <button key={k.user_id} type="button" onClick={() => tanla(k.user_id, k.ism, "bola")}>🧒 {k.ism}</button>)}</span>}
          </li>)}</ul>}
        </div>}
      <div className="bn-form">
        <label>{__kbUi("Chegirma, %")}<input type="number" min={1} max={100} value={cheg.foiz} onChange={(e) => setCheg({ ...cheg, foiz: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })} /></label>
        <label>{__kbUi("Qachongacha (ixtiyoriy)")}<input type="date" value={cheg.gacha} onChange={(e) => setCheg({ ...cheg, gacha: e.target.value })} /></label>
        <label>{__kbUi("Izoh (ota-onaga ko‘rinadi)")}<input value={cheg.izoh} maxLength={200} placeholder={__kbUi("Masalan: Ko‘p bolali oila")} onChange={(e) => setCheg({ ...cheg, izoh: e.target.value })} /></label>
      </div>
      <button type="button" className="bn-save" disabled={busy || !cheg.tanlangan} onClick={() => run(() => api(apiBase, token, "/api/admin/bogcha/chegirma", { method: "POST",
        body: { turi: cheg.turi, user_id: cheg.tanlangan.user_id, foiz: cheg.foiz, gacha: cheg.gacha || null, izoh: cheg.izoh } }), "Chegirma saqlandi").then(() => setCheg({ ...cheg, tanlangan: null, izoh: "" }))}>🎁 {__kbUi("Chegirma berish")}</button>
      {(d.chegirmalar || []).length > 0 && <div className="bn-table-wrap"><table className="bn-table">
        <thead><tr><th>{__kbUi("Kimga")}</th><th>{__kbUi("Chegirma")}</th><th>{__kbUi("Qachongacha")}</th><th>{__kbUi("Izoh")}</th><th /></tr></thead>
        <tbody>{d.chegirmalar.map((c) => <tr key={c.id} className={c.faol ? "" : "is-off"}>
          <td>{c.turi === "ota" ? "👪" : "🧒"} {c.ism} <small>#{c.user_id} · {__kbUi(c.turi === "ota" ? "barcha farzandlari" : "faqat shu farzand")}</small></td>
          <td><b>−{c.foiz}%</b>{c.foiz === 100 ? <small>{__kbUi("bepul")}</small> : null}</td><td>{c.gacha || "—"}</td><td>{c.izoh || "—"}</td>
          <td><button type="button" className="bn-save is-danger" disabled={busy} onClick={() => run(() => api(apiBase, token, `/api/admin/bogcha/chegirma/${c.id}`, { method: "DELETE" }), "Chegirma bekor qilindi")}>{__kbUi("Bekor qilish")}</button></td>
        </tr>)}</tbody>
      </table></div>}
    </section>

    <section className="bn-card">
      <h3>👪 {__kbUi("Obunalar")}</h3>
      <input className="bn-filter" placeholder={__kbUi("Ism yoki ID bo‘yicha qidirish")} value={filter} onChange={(e) => setFilter(e.target.value)} />
      <div className="bn-table-wrap"><table className="bn-table">
        <thead><tr><th>{__kbUi("Bola")}</th><th>{__kbUi("Ota-ona")}</th><th>{__kbUi("Kurslar")}</th><th>{__kbUi("Narx")}</th><th>{__kbUi("Tugaydi")}</th><th>{__kbUi("Narx qulfi")}</th></tr></thead>
        <tbody>{subs.map((o) => <tr key={o.bola_id} className={o.faol ? "" : "is-off"}>
          <td>{o.bola} <small>#{o.bola_id}</small></td><td>{o.ota} <small>#{o.ota_id}</small>
            <button type="button" className="bn-link" title={__kbUi("Shu ota-onaga chegirma berish")} onClick={() => { tanla(o.ota_id, o.ota || `#${o.ota_id}`, "ota"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>🎁</button></td>
          <td>{o.fanlar.map((k) => KURS[k]?.emoji || k).join(" ")}</td><td>{sum(o.narx_uzs)}</td>
          <td>{o.tugaydi} {o.faol ? "✅" : "⌛"}</td><td>{o.narx_qulf_gacha || "—"}</td></tr>)}
          {!subs.length && <tr><td colSpan={6} className="bn-muted">{__kbUi("Hali obuna yo‘q")}</td></tr>}</tbody>
      </table></div>
    </section>

    <section className="bn-card">
      <h3>✋ {__kbUi("Qo‘lda faollashtirish")}</h3>
      <p className="bn-muted">{__kbUi("Naqd to‘lov, sovg‘a yoki sinov uchun. Bola ID — ota-ona panelidagi yoki obunalar ro‘yxatidagi raqam.")}</p>
      <div className="bn-form">
        <label>{__kbUi("Bola ID")}<input value={qolda.bola_id} onChange={(e) => setQolda({ ...qolda, bola_id: e.target.value.replace(/[^\d-]/g, "") })} /></label>
        <label>{__kbUi("Kun")}<input type="number" min={1} max={400} value={qolda.kun} onChange={(e) => setQolda({ ...qolda, kun: Number(e.target.value) || 30 })} /></label>
        <label>{__kbUi("Tarif")}<select value={qolda.tarif_id} onChange={(e) => setQolda({ ...qolda, tarif_id: e.target.value })}>
          <option value="">—</option>{d.tariflar.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}</select></label>
      </div>
      <div className="bn-chips">{KURSLAR.map((k) => { const on = qolda.fanlar.includes(k.kalit);
        return <button key={k.kalit} type="button" className={on ? "is-on" : ""} aria-pressed={on}
          onClick={() => setQolda({ ...qolda, fanlar: on ? qolda.fanlar.filter((x) => x !== k.kalit) : [...qolda.fanlar, k.kalit] })}>{k.emoji} {__kbUi(k.nom)}</button>; })}</div>
      <button type="button" className="bn-save" disabled={busy || !qolda.bola_id || !qolda.fanlar.length} onClick={() => run(() => api(apiBase, token, "/api/admin/bogcha/obuna/faollashtir", { method: "POST",
        body: { bola_id: Number(qolda.bola_id), fanlar: qolda.fanlar, kun: qolda.kun, tarif_id: qolda.tarif_id ? Number(qolda.tarif_id) : null } }), "Obuna faollashtirildi")}>{__kbUi("Faollashtirish")}</button>
    </section>
  </div>;
}
