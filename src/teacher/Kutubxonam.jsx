import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { transcribeRecording } from "../admin/transcriptionClient.js";
import { ACCEPT, KIND_ICON, KIND_LABEL, docsIn, errorText, fileUrl, formatSize, placeLabel } from "./libraryRules.js";
import "./kutubxonam.css";

const HELLO = {
  kim: "bot",
  javob: "Assalomu alaykum! Men kutubxonangiz yordamchisiman. Qaysi hujjat kerakligini oddiy yozing yoki ayting — xato yozsangiz ham tushunaman. Masalan: «5-sinf matematika nazorat ishi», «oxirgi PDF», «direktor buyrug‘i qani».",
  hujjatlar: [],
};

/** REV96: o'qituvchining shaxsiy kutubxonasi — polka › qator › hujjat, AI yordamchi va imloga chidamli qidiruv. */
export default function Kutubxonam({ apiBase, token, onOrtga }) {
  const base = `${String(apiBase).replace(/\/+$/, "")}/api/kutubxonam`;
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [shelf, setShelf] = useState(null);       // id | "none" | null
  const [row, setRow] = useState(null);
  const [chat, setChat] = useState([HELLO]);
  const [msg, setMsg] = useState("");
  const [asking, setAsking] = useState(false);
  const [uploading, setUploading] = useState("");
  const [target, setTarget] = useState({ polka: "", qator: "" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [moving, setMoving] = useState(null);     // doc id
  const [recording, setRecording] = useState(false);
  const fileRef = useRef(null);
  const recRef = useRef(null);
  const chatEnd = useRef(null);

  const call = useCallback(async (path, opts = {}) => {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(`${base}${path}${sep}${new URLSearchParams({ token })}`, {
      cache: "no-store", ...opts,
      headers: opts.body && !(opts.body instanceof FormData) ? { "Content-Type": "application/json" } : undefined,
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(errorText(d, res.status));
    return d;
  }, [base, token]);

  const load = useCallback(async () => {
    try { setData(await call("")); setError(""); } catch (e) { setError(e.message); }
  }, [call]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { chatEnd.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" }); }, [chat]);
  useEffect(() => () => { try { recRef.current?.stop(); } catch { /* */ } }, []);

  const flash = (t) => { setNotice(t); setTimeout(() => setNotice((n) => (n === t ? "" : n)), 6000); };

  const ask = async (text) => {
    const t = String(text ?? msg).trim();
    if (!t || asking) return;
    setMsg(""); setAsking(true);
    setChat((c) => [...c, { kim: "men", javob: t }]);
    try {
      const r = await call("/yordamchi", { method: "POST", body: JSON.stringify({ xabar: t }) });
      setChat((c) => [...c, { kim: "bot", ...r }]);
    } catch (e) {
      setChat((c) => [...c, { kim: "bot", javob: `⚠️ ${e.message}`, hujjatlar: [] }]);
    } finally { setAsking(false); }
  };

  const upload = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const lines = [];
    for (let i = 0; i < list.length; i += 1) {
      setUploading(`${i + 1}/${list.length}: ${list[i].name}`);
      const fd = new FormData();
      fd.append("token", token);
      fd.append("fayl", list[i]);
      if (target.polka) fd.append("polka_id", target.polka);
      if (target.qator) fd.append("qator_id", target.qator);
      try {
        const res = await fetch(`${base}/hujjat`, { method: "POST", body: fd });
        const d = await res.json().catch(() => ({}));
        lines.push(res.ok ? `«${list[i].name}» — ${d.xabar}` : `❌ «${list[i].name}»: ${errorText(d, res.status)}`);
      } catch {
        lines.push(`❌ «${list[i].name}»: internet aloqasi uzildi`);
      }
    }
    setUploading("");
    if (fileRef.current) fileRef.current.value = "";
    setChat((c) => [...c, { kim: "bot", javob: lines.join("\n"), hujjatlar: [] }]);
    load();
  };

  const act = async (fn, ok) => {
    try { await fn(); if (ok) flash(ok); await load(); } catch (e) { flash(`⚠️ ${e.message}`); }
  };
  const newShelf = () => {
    const nomi = window.prompt(__kbUi("Yangi polka nomi (masalan: Olimpiada, Ota-onalar majlisi):"));
    if (nomi?.trim()) act(() => call("/polka", { method: "POST", body: JSON.stringify({ nomi }) }), __kbUi("Polka qo‘shildi"));
  };
  const newRow = (s) => {
    const nomi = window.prompt(__kbUi(`«${s.nomi}» polkasiga yangi qator (masalan: 7-sinf, 2026 yil, Algebra):`));
    if (nomi?.trim()) act(() => call(`/polka/${s.id}/qator`, { method: "POST", body: JSON.stringify({ nomi }) }), __kbUi("Qator qo‘shildi"));
  };
  const renameShelf = (s) => {
    const nomi = window.prompt(__kbUi("Polkaning yangi nomi:"), s.nomi);
    if (nomi?.trim() && nomi.trim() !== s.nomi) act(() => call(`/polka/${s.id}`, { method: "PATCH", body: JSON.stringify({ nomi }) }), __kbUi("Nomi o‘zgardi"));
  };
  const dropShelf = (s) => {
    if (!window.confirm(__kbUi(`«${s.nomi}» polkasini o‘chiraymi? Undagi ${s.soni} ta hujjat o‘chmaydi — «Saralanmagan»ga o‘tadi.`))) return;
    setShelf(null); setRow(null);
    act(() => call(`/polka/${s.id}`, { method: "DELETE" }), __kbUi("Polka o‘chirildi"));
  };
  const dropRow = (r) => {
    if (!window.confirm(__kbUi(`«${r.nomi}» qatorini o‘chiraymi? Hujjatlar polkada qoladi.`))) return;
    setRow(null);
    act(() => call(`/qator/${r.id}`, { method: "DELETE" }), __kbUi("Qator o‘chirildi"));
  };
  const renameDoc = (d) => {
    const nomi = window.prompt(__kbUi("Hujjatning yangi nomi:"), d.nomi);
    if (nomi?.trim() && nomi.trim() !== d.nomi) act(() => call(`/hujjat/${d.id}`, { method: "PATCH", body: JSON.stringify({ nomi }) }), __kbUi("Nomi o‘zgardi"));
  };
  const dropDoc = (d) => {
    if (window.confirm(__kbUi(`«${d.nomi}» butunlay o‘chirilsinmi? Qaytarib bo‘lmaydi.`))) act(() => call(`/hujjat/${d.id}`, { method: "DELETE" }), __kbUi("Hujjat o‘chirildi"));
  };
  const moveDoc = (d, value) => {
    setMoving(null);
    if (!value) return;
    const [kind, id] = value.split(":");
    const body = kind === "none" ? { tartibsiz: true } : kind === "s" ? { polka_id: Number(id), qator_id: null } : { qator_id: Number(id) };
    act(() => call(`/hujjat/${d.id}`, { method: "PATCH", body: JSON.stringify(body) }), __kbUi("Joyi o‘zgardi"));
  };
  const saveSettings = (patch) => act(async () => {
    const r = await call("/sozlama", { method: "PUT", body: JSON.stringify(patch) });
    if (patch.matn_oqish) flash(__kbUi(`Ruxsat berildi. ${r.oqildi || 0} ta hujjat ichi o‘qildi — endi ichidagi so‘z bo‘yicha ham topaman.`));
  }, patch.matn_oqish === false ? __kbUi("Ruxsat olindi — o‘qilgan matnlar o‘chirildi.") : "");
  const tidy = () => act(async () => { const r = await call("/tartibla", { method: "POST" }); flash(__kbUi(`${r.joylandi} ta hujjat polkalarga joylandi ✅`)); });

  const open = (d, download = false) => window.open(fileUrl(apiBase, token, d.id, download), "_blank", "noopener");
  const show = (d) => { setShelf(d.polka_id || "none"); setRow(d.qator_id || null); setTimeout(() => document.getElementById(`kt-doc-${d.id}`)?.scrollIntoView?.({ block: "center", behavior: "smooth" }), 60); };

  const voice = async () => {
    if (recording) { try { recRef.current?.stop(); } catch { /* */ } return; }
    if (!globalThis.MediaRecorder || !navigator.mediaDevices?.getUserMedia) { flash(__kbUi("Bu brauzerda ovoz yozib bo‘lmaydi — yozib yuboring.")); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream); const parts = [];
      rec.ondataavailable = (e) => { if (e.data?.size) parts.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(parts, { type: rec.mimeType || "audio/webm" });
        if (!blob.size) return;
        try {
          setAsking(true);
          const { text } = await transcribeRecording({ apiBase, token, blob, language: "uz", basePath: "/api/speech" });
          setAsking(false);
          ask(text);
        } catch (e) { setAsking(false); flash(`🎙️ ${String(e.message).replace(/^STT_[A-Z_]+:\s*/, "")}`); }
      };
      recRef.current = rec; rec.start(); setRecording(true);
      setTimeout(() => { if (rec.state === "recording") rec.stop(); }, 15000);
    } catch { flash(__kbUi("Mikrofonga ruxsat berilmadi.")); }
  };

  if (!data) {
    return <div className="kt-root"><Head onOrtga={onOrtga} />
      {error ? <p className="kt-error">{error} <button type="button" onClick={load}>{__kbUi("Qayta urinish")}</button></p> : <p className="kt-muted">{__kbUi("Kutubxona ochilmoqda…")}</p>}</div>;
  }

  const shelves = data.polkalar || [];
  const docs = data.hujjatlar || [];
  const current = shelf === "none" ? { id: "none", nomi: "Saralanmagan", qatorlar: [] } : shelves.find((s) => s.id === shelf);
  const listed = current ? docsIn(docs, current.id, row) : [];
  const used = Math.min(100, Math.round(((data.hajm?.ishlatilgan || 0) / (data.hajm?.limit || 1)) * 100));
  const targetShelf = shelves.find((s) => String(s.id) === String(target.polka));

  const docCard = (d, compact = false) => (
    <li key={d.id} id={compact ? undefined : `kt-doc-${d.id}`} className="kt-doc">
      <span className="kt-doc-ico" aria-hidden="true">{KIND_ICON[d.turi] || KIND_ICON.boshqa}</span>
      <span className="kt-doc-main">
        <b>{d.nomi}</b>
        <small>{KIND_LABEL[d.turi] || KIND_LABEL.boshqa} · {formatSize(d.hajm)} · 📚 {__kbUi(placeLabel(d))}</small>
        {d.parcha ? <em>🔎 {d.parcha}</em> : null}
      </span>
      <span className="kt-doc-act">
        <button type="button" onClick={() => open(d)} title={__kbUi("Ochish")}>👁️</button>
        <button type="button" onClick={() => open(d, true)} title={__kbUi("Yuklab olish")}>⬇️</button>
        {compact ? <button type="button" onClick={() => show(d)} title={__kbUi("Polkasida ko‘rsatish")}>📍</button> : <>
          {moving === d.id ? (
            <select autoFocus defaultValue="" onChange={(e) => moveDoc(d, e.target.value)} onBlur={() => setMoving(null)} aria-label={__kbUi("Qayerga ko‘chirish")}>
              <option value="">{__kbUi("Qayerga?")}</option>
              {shelves.map((s) => <optgroup key={s.id} label={s.nomi}>
                <option value={`s:${s.id}`}>{s.nomi} {__kbUi("(qatorsiz)")}</option>
                {s.qatorlar.map((r) => <option key={r.id} value={`r:${r.id}`}>{s.nomi} › {r.nomi}</option>)}
              </optgroup>)}
              <option value="none:0">{__kbUi("Saralanmagan")}</option>
            </select>
          ) : <button type="button" onClick={() => setMoving(d.id)} title={__kbUi("Boshqa polkaga")}>↪️</button>}
          <button type="button" onClick={() => renameDoc(d)} title={__kbUi("Nomini o‘zgartirish")}>✏️</button>
          <button type="button" onClick={() => dropDoc(d)} title={__kbUi("O‘chirish")}>🗑️</button>
        </>}
      </span>
    </li>
  );

  return (
    <div className="kt-root">
      <Head onOrtga={onOrtga} onSettings={() => setSettingsOpen((v) => !v)} />
      <div className="kt-usage" title={`${formatSize(data.hajm?.ishlatilgan)} / ${formatSize(data.hajm?.limit)}`}>
        <i style={{ width: `${Math.max(2, used)}%` }} />
        <small>{docs.length} {__kbUi("ta hujjat")} · {formatSize(data.hajm?.ishlatilgan)} / {formatSize(data.hajm?.limit)}</small>
      </div>

      {settingsOpen && <section className="kt-settings">
        <label><input type="checkbox" checked={!!data.sozlama?.matn_oqish} onChange={(e) => saveSettings({ matn_oqish: e.target.checked })} />
          <span><b>{__kbUi("Hujjatlar ichini o‘qib qidirishga ruxsat")}</b><small>{__kbUi("Yordamchi hujjat ichidagi so‘z bo‘yicha ham topadi. Matn faqat sizning kutubxonangizda saqlanadi; ruxsatni olsangiz, o‘chiriladi.")}</small></span></label>
        <label><input type="checkbox" checked={!!data.sozlama?.avto_joylash} onChange={(e) => saveSettings({ avto_joylash: e.target.checked })} />
          <span><b>{__kbUi("Yangi hujjatni o‘zi polkaga joylasin")}</b><small>{__kbUi("Turiga (test, ishlanma, reja, hisobot…) va faniga qarab. O‘chirsangiz — «Saralanmagan»ga tushadi.")}</small></span></label>
      </section>}

      {notice && <p className="kt-notice" role="status">{notice}</p>}

      <section className="kt-chat" aria-label={__kbUi("Kutubxona yordamchisi")}>
        <div className="kt-chat-log">
          {chat.map((m, i) => <div key={i} className={`kt-msg kt-${m.kim}`}>
            <p>{m.kim === "bot" ? "🤖 " : ""}{m.javob}{m.ai ? <small className="kt-ai"> · AI</small> : null}</p>
            {m.hujjatlar?.length > 0 && <ul className="kt-docs is-compact">{m.hujjatlar.map((d) => docCard(d, true))}</ul>}
            {m.amal === "tartibla" && <button type="button" className="kt-btn" onClick={tidy}>🧹 {__kbUi("Tartibla")}</button>}
          </div>)}
          {asking && <div className="kt-msg kt-bot"><p>🤖 …</p></div>}
          <span ref={chatEnd} />
        </div>
        <form className="kt-ask" onSubmit={(e) => { e.preventDefault(); ask(); }}>
          <input value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={500}
            placeholder={__kbUi("Qaysi hujjat kerak? Masalan: 7-sinf ona tili ishlanmasi")} aria-label={__kbUi("Yordamchiga yozing")} />
          <button type="button" className={`kt-mic${recording ? " is-on" : ""}`} onClick={voice} title={__kbUi(recording ? "To‘xtatish" : "Ovoz bilan so‘rash")}>{recording ? "⏹" : "🎙️"}</button>
          <button type="submit" className="kt-btn" disabled={asking || !msg.trim()}>{__kbUi("Top")}</button>
        </form>
      </section>

      <section className="kt-upload">
        <div className="kt-upload-row">
          <button type="button" className="kt-btn kt-primary" disabled={!!uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? `⏳ ${uploading}` : `+ ${__kbUi("Hujjat qo‘shish")}`}
          </button>
          <select value={target.polka} onChange={(e) => setTarget({ polka: e.target.value, qator: "" })} aria-label={__kbUi("Qaysi polkaga")}>
            <option value="">🤖 {__kbUi("Joyini o‘zi tanlasin")}</option>
            {shelves.map((s) => <option key={s.id} value={s.id}>{s.belgi || "📁"} {s.nomi}</option>)}
          </select>
          {targetShelf && targetShelf.qatorlar.length > 0 && <select value={target.qator} onChange={(e) => setTarget((t) => ({ ...t, qator: e.target.value }))} aria-label={__kbUi("Qaysi qatorga")}>
            <option value="">{__kbUi("Qatorni o‘zi tanlasin")}</option>
            {targetShelf.qatorlar.map((r) => <option key={r.id} value={r.id}>{r.nomi}</option>)}
          </select>}
        </div>
        <input ref={fileRef} type="file" multiple accept={ACCEPT} hidden onChange={(e) => upload(e.target.files)} />
        <small className="kt-muted">{__kbUi(`Word, PDF, Excel, taqdimot, rasm · bitta fayl ${formatSize(data.hajm?.fayl_limit)} gacha · bir xil fayl ikki marta saqlanmaydi`)}</small>
      </section>

      <section className="kt-shelves" aria-label={__kbUi("Polkalar")}>
        <header><h3>{__kbUi("Polkalar")}</h3><button type="button" className="kt-btn" onClick={newShelf}>+ {__kbUi("Polka")}</button></header>
        {shelves.length === 0 && !data.saralanmagan && <p className="kt-muted">{__kbUi("Hali polka yo‘q. Hujjat qo‘shsangiz, polkalarni o‘zim ochib, tartiblab qo‘yaman.")}</p>}
        <div className="kt-shelf-grid">
          {shelves.map((s) => <button key={s.id} type="button" className={`kt-shelf${shelf === s.id ? " is-on" : ""}`} style={{ "--kt-c": s.rang || "#1B4B7A" }}
            onClick={() => { setShelf(shelf === s.id ? null : s.id); setRow(null); }}>
            <span aria-hidden="true">{s.belgi || "📁"}</span><b>{s.nomi}</b><small>{s.soni} {__kbUi("ta")} · {s.qatorlar.length} {__kbUi("qator")}</small>
          </button>)}
          {data.saralanmagan > 0 && <button type="button" className={`kt-shelf is-loose${shelf === "none" ? " is-on" : ""}`} onClick={() => { setShelf(shelf === "none" ? null : "none"); setRow(null); }}>
            <span aria-hidden="true">📥</span><b>{__kbUi("Saralanmagan")}</b><small>{data.saralanmagan} {__kbUi("ta")}</small>
          </button>}
        </div>
      </section>

      {current && <section className="kt-open" style={{ "--kt-c": current.rang || "#1B4B7A" }}>
        <header>
          <h3>{current.belgi || (current.id === "none" ? "📥" : "📁")} {current.nomi}</h3>
          {current.id === "none" ? <button type="button" className="kt-btn" onClick={tidy}>🧹 {__kbUi("Hammasini tartibla")}</button> : <span className="kt-open-act">
            <button type="button" onClick={() => newRow(current)}>+ {__kbUi("Qator")}</button>
            <button type="button" onClick={() => renameShelf(current)}>✏️</button>
            <button type="button" onClick={() => dropShelf(current)}>🗑️</button>
          </span>}
        </header>
        {current.qatorlar.length > 0 && <div className="kt-rows" role="tablist">
          <button type="button" className={!row ? "is-on" : ""} onClick={() => setRow(null)}>{__kbUi("Hammasi")} ({current.soni})</button>
          {current.qatorlar.map((r) => <span key={r.id} className={`kt-row${row === r.id ? " is-on" : ""}`}>
            <button type="button" onClick={() => setRow(r.id)}>{r.nomi} ({r.soni})</button>
            {row === r.id && <button type="button" className="kt-row-x" title={__kbUi("Qatorni o‘chirish")} onClick={() => dropRow(r)}>×</button>}
          </span>)}
        </div>}
        {listed.length ? <ul className="kt-docs">{listed.map((d) => docCard(d))}</ul> : <p className="kt-muted">{__kbUi("Bu yerda hali hujjat yo‘q.")}</p>}
      </section>}
    </div>
  );
}

function Head({ onOrtga, onSettings }) {
  return <header className="kt-head">
    {onOrtga && <button type="button" className="kt-back" onClick={onOrtga}>‹ {__kbUi("Ortga")}</button>}
    <h2>{onOrtga ? `📚 ${__kbUi("Kutubxonam")}` : <small className="kt-sub">{__kbUi("Hujjat topish uchun yordamchiga yozing yoki ayting")}</small>}</h2>
    {onSettings && <button type="button" className="kt-gear" onClick={onSettings} title={__kbUi("Sozlamalar")}>⚙️</button>}
  </header>;
}
