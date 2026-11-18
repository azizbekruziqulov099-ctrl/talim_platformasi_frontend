// «Milliy sertifikat» uslubidagi KIRISH testi (20 savol, 40 daq) va TO'LIQ sinov (45 savol, 150 daq). Rasch bo'yicha taxminiy ball (0–75).
// Server: modules/mat_sertifikat.py. Natijadan keyin zaif mavzular — Repetitor mavzulariga yo'naltiriladi (onMavzu).
import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { RasmKonteksti, SavolMatn, VariantMatn } from "./MatMatn.jsx";
import { HARFLAR } from "./matMatn.js";
import { matFetch } from "./matBankApi.js";
import { BALL_RANGI, natijaXabari, qolganSekund, vaqtMatni, zaifBolimlar } from "./sertRules.js";
import MatMock from "./MatMock.jsx";
import "./matbank.css";

const Xato = ({ x, qayta }) => <div className="mb-xato" role="alert"><p>⚠️ {__kbUi(x)}</p>{qayta && <button type="button" className="mb-btn" onClick={qayta}>↻ {__kbUi("Qayta urinish")}</button>}</div>;

function Boshlash({ apiBase, token, onBosh, onClose, onMock }) {
  const [d, setD] = useState(null); const [xato, setXato] = useState("");
  useEffect(() => { matFetch(apiBase, token, "/api/matsert/turlar").then(setD).catch((e) => setXato(e.message)); }, [apiBase, token]);
  return <section className="mb-root">
    <header className="mb-bosh-qator">{onClose && <button type="button" className="mb-btn mb-yengil" onClick={onClose}>← {__kbUi("Orqaga")}</button>}
      <div><h2>🏅 {__kbUi("Milliy sertifikat: matematika")}</h2><small>{__kbUi("O‘zingizni sinab, taxminiy ballingizni ko‘ring")}</small></div></header>
    {xato ? <Xato x={xato} /> : !d ? <p className="mb-bosh" role="status">⏳</p> : <>
      <div className="mb-sert-turlar">{d.turlar.map((t) => <button key={t.tur} type="button" className="mb-karta mb-sert-tur" onClick={() => onBosh(t.tur)}>
        <b>{t.tur === "kirish" ? "🚪" : "📝"} {__kbUi(t.nom)}</b><span>{t.savol} {__kbUi("savol")} · {t.daqiqa} {__kbUi("daqiqa")}</span>
        <small>{t.tur === "kirish" ? __kbUi("Darajangizni va zaif mavzularingizni aniqlaydi") : __kbUi("Rasmiy imtihon tarkibi: hamma bo‘limlardan")}</small></button>)}
        <button type="button" className="mb-karta mb-sert-tur" onClick={onMock}><b>🧪 {__kbUi("MOCK imtihon")}</b><span>45 {__kbUi("topshiriq")} · 150 {__kbUi("daqiqa")}</span><small>{__kbUi("Har safar yangi savollar, ochiq javobli topshiriqlar, yechimlar bilan")}</small></button></div>
      <p className="mb-muted">ℹ️ {__kbUi(d.izoh)}</p>
      {d.tarix.length > 0 && <div className="mb-karta"><h3>{__kbUi("Oldingi urinishlar")}</h3>
        <ul className="mb-sert-tarix">{d.tarix.map((t) => <li key={t.id}><span>{new Date(t.sana).toLocaleDateString()} · {__kbUi(t.tur === "kirish" ? "Kirish testi" : "To‘liq sinov")}</span>
          <b style={{ color: BALL_RANGI[t.daraja] || "#6b7280" }}>{t.ball} {__kbUi("ball")}{t.daraja ? ` · ${t.daraja}` : ""}</b><small>{t.togri}/{t.jami}</small></li>)}</ul></div>}</>}
  </section>;
}

function Yechish({ apiBase, token, tur, onTugadi, onChiq }) {
  const [t, setT] = useState(null); const [xato, setXato] = useState(""); const [i, setI] = useState(0); const [jav, setJav] = useState({}); const [yub, setYub] = useState(false);
  const [otgan, setOtgan] = useState(0); const boshi = useRef(Date.now()); const topRef = useRef(null); const tugadi = useRef(false);
  const yukla = useCallback(() => { setT(null); setXato(""); setI(0); setJav({}); setOtgan(0); boshi.current = Date.now();
    matFetch(apiBase, token, "/api/matsert/test", { params: { tur } }).then(setT).catch((e) => setXato(e.message)); }, [apiBase, token, tur]);
  useEffect(() => { yukla(); }, [yukla]);
  useEffect(() => { if (!t) return undefined; const id = setInterval(() => setOtgan(Math.floor((Date.now() - boshi.current) / 1000)), 1000); return () => clearInterval(id); }, [t]);
  const qolgan = t ? qolganSekund(t.daqiqa, otgan) : 0;
  const tugat = useCallback(async (majbur = false) => {
    if (!t || tugadi.current) return;
    const bosh = t.savollar.filter((s) => !jav[s.id]).length;
    if (!majbur && bosh && !window.confirm(`${bosh} ${__kbUi("ta savolga javob berilmadi. Baribir tugatilsinmi?")}`)) return;
    tugadi.current = true; setYub(true); setXato("");
    try { const r = await matFetch(apiBase, token, "/api/matsert/topshir", { method: "POST", body: { tur, idlar: t.savollar.map((s) => s.id), javoblar: jav, sekund: Math.floor((Date.now() - boshi.current) / 1000) } }); onTugadi(r, t.savollar, jav); }
    catch (e) { tugadi.current = false; setXato(e.message); setYub(false); }
  }, [t, jav, apiBase, token, tur, onTugadi]);
  useEffect(() => { if (t && qolgan === 0 && otgan > 0) tugat(true); }, [qolgan]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { topRef.current?.scrollIntoView?.({ block: "start" }); }, [i]);
  if (xato && !t) return <section className="mb-root"><button type="button" className="mb-btn mb-yengil" onClick={onChiq}>← {__kbUi("Orqaga")}</button><Xato x={xato} qayta={yukla} /></section>;
  if (!t) return <section className="mb-root"><p className="mb-bosh" role="status">⏳ {__kbUi("Savollar tayyorlanmoqda…")}</p></section>;
  const s = t.savollar[i]; const n = t.savollar.filter((x) => jav[x.id]).length;
  return <section className="mb-root mb-test" ref={topRef}>
    <header className="mb-test-bosh"><button type="button" className="mb-btn mb-yengil" onClick={() => { if (!n || window.confirm(__kbUi("Testdan chiqilsinmi? Javoblaringiz saqlanmaydi."))) onChiq(); }}>✕ {__kbUi("Chiqish")}</button>
      <b>{i + 1} / {t.soni}</b><span className={`mb-vaqt ${qolgan < 300 ? "is-oz" : ""}`} aria-label={__kbUi("Qolgan vaqt")}>⏱ {vaqtMatni(qolgan)}</span></header>
    <i className="mb-yolak mb-yolak-katta" aria-hidden="true"><b style={{ width: `${(100 * n) / t.soni}%` }} /></i>
    <nav className="mb-nuqtalar" aria-label={__kbUi("Savollar")}>{t.savollar.map((x, k) => <button key={x.id} type="button" className={`${k === i ? "is-hozir" : ""} ${jav[x.id] ? "is-javob" : ""}`} onClick={() => setI(k)} aria-current={k === i}>{k + 1}</button>)}</nav>
    <article className="mb-karta mb-savol-karta"><SavolMatn matn={s.savol} />
      <div className="mb-variantlar" role="radiogroup">{s.variantlar.map((v, k) => <button key={k} type="button" role="radio" aria-checked={jav[s.id] === HARFLAR[k]}
        className={`mb-variant ${jav[s.id] === HARFLAR[k] ? "is-on" : ""}`} onClick={() => setJav((j) => ({ ...j, [s.id]: j[s.id] === HARFLAR[k] ? "" : HARFLAR[k] }))}><span className="mb-harf">{HARFLAR[k]}</span><VariantMatn matn={v} /></button>)}</div></article>
    {xato && <p className="mb-xato-q" role="alert">⚠️ {__kbUi(xato)}</p>}
    <footer className="mb-test-past"><button type="button" className="mb-btn" disabled={i === 0} onClick={() => setI(i - 1)}>← {__kbUi("Oldingi")}</button>
      {i < t.soni - 1 ? <button type="button" className="mb-btn mb-asosiy" onClick={() => setI(i + 1)}>{__kbUi("Keyingi")} →</button>
        : <button type="button" className="mb-btn mb-asosiy" disabled={yub} onClick={() => tugat(false)}>{yub ? "…" : `✓ ${__kbUi("Tugatish")}`}</button>}</footer>
    {i < t.soni - 1 && n > 0 && <p className="mb-tugat-havola"><button type="button" className="mb-link" disabled={yub} onClick={() => tugat(false)}>{__kbUi("Hozir tugatish va natijani ko‘rish")}</button></p>}
  </section>;
}

function Natija({ r, onYana, onBosh, onMavzu }) {
  const rang = BALL_RANGI[r.daraja] || "#6b7280"; const zaif = zaifBolimlar(r.bolimlar);
  return <section className="mb-root">
    <div className="mb-karta mb-sert-ball" style={{ borderColor: rang }}>
      <small>{__kbUi(r.tur === "kirish" ? "Kirish testi natijasi" : "To‘liq sinov natijasi")}</small>
      <b className="mb-sert-raqam" style={{ color: rang }}>{r.ball}<i> / 75</i></b>
      <span className="mb-sert-daraja" style={{ background: rang }}>{r.daraja || __kbUi("sertifikat yo‘q")}</span>
      <p>{__kbUi(natijaXabari(r))}</p><small>{r.togri} / {r.jami} {__kbUi("to‘g‘ri")} ({r.foiz}%) · {__kbUi("daraja")}: {__kbUi(r.daraja_nomi)}</small></div>
    <div className="mb-karta"><h3>{__kbUi("Bo‘limlar bo‘yicha")}</h3>
      <ul className="mb-sert-bolim">{r.bolimlar.map((b) => <li key={b.kalit}><span>{__kbUi(b.nom)}</span><i className="mb-yolak" aria-hidden="true"><b style={{ width: `${b.foiz}%`, background: b.foiz >= 70 ? "#1f8a4c" : b.foiz >= 40 ? "#1b6fd8" : "#c77d00" }} /></i><b>{b.togri}/{b.jami}</b></li>)}</ul>
      {zaif.length > 0 && zaif[0].foiz < 100 && <p className="mb-muted">🎯 {__kbUi("Eng zaif bo‘limlar")}: {zaif.filter((b) => b.foiz < 100).map((b) => __kbUi(b.nom)).join(", ")}</p>}</div>
    {r.tavsiya?.length > 0 && <div className="mb-karta"><h3>📚 {__kbUi("Nimani o‘rganish kerak")}</h3>
      <ul className="mb-sert-tavsiya">{r.tavsiya.map((m) => <li key={m.mavzu}><span><b>{m.mavzu}-{__kbUi("mavzu")}</b> {m.nom}<small> · {m.xato} {__kbUi("ta xato")}</small></span>
        {onMavzu && <button type="button" className="mb-btn mb-asosiy" onClick={() => onMavzu(m.mavzu)}>{__kbUi("O‘rganish")} →</button>}</li>)}</ul></div>}
    <p className="mb-muted">ℹ️ {__kbUi(r.izoh)}</p>
    <div className="mb-test-past"><button type="button" className="mb-btn" onClick={onBosh}>← {__kbUi("Boshqa test")}</button><button type="button" className="mb-btn mb-asosiy" onClick={onYana}>↻ {__kbUi("Yana urinish")}</button></div>
  </section>;
}

/** onMavzu(n) — Repetitor n-mavzusini ochadi (berilmasa «O‘rganish» tugmasi chiqmaydi). */
export default function MatSertifikat({ apiBase = "", token, onClose, onMavzu = null, boshlash = "" }) {
  const [e, setE] = useState(boshlash ? { t: "yech", tur: boshlash, n: Date.now() } : { t: "bosh" });
  return <RasmKonteksti.Provider value={{ apiBase, token }}>{
    e.t === "mock" ? <MatMock apiBase={apiBase} token={token} onClose={() => setE({ t: "bosh" })} />
    : e.t === "yech" ? <Yechish key={e.n} apiBase={apiBase} token={token} tur={e.tur} onChiq={() => setE({ t: "bosh" })} onTugadi={(r) => setE({ t: "natija", r })} />
      : e.t === "natija" ? <Natija r={e.r} onMavzu={onMavzu} onBosh={() => setE({ t: "bosh" })} onYana={() => setE({ t: "yech", tur: e.r.tur, n: Date.now() })} />
        : <Boshlash apiBase={apiBase} token={token} onClose={onClose} onBosh={(tur) => setE({ t: "yech", tur, n: Date.now() })} onMock={() => setE({ t: "mock" })} />}</RasmKonteksti.Provider>;
}
