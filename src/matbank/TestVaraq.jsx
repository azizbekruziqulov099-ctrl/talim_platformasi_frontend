// O‘qituvchi uchun: mavzularni tanlab test varag‘i tuzish va PDF qilib saqlash (alohida varaq + kalitlar varag‘i). Server: /api/matbank/oqituvchi/varaq
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { RasmKonteksti, SavolMatn, VariantMatn } from "./MatMatn.jsx";
import { HARFLAR } from "./matMatn.js";
import { matFetch } from "./matBankApi.js";
import "./matbank.css";

function Chop({ v, kalit, onYop }) {
  useEffect(() => { document.body.classList.add("kb-chop-faol"); return () => document.body.classList.remove("kb-chop-faol"); }, []);
  return createPortal(<div className="kb-chop-root">
    <div className="kb-chop-tugmalar"><button type="button" className="mb-btn mb-asosiy" onClick={() => window.print()}>🖨 {__kbUi("PDF sifatida saqlash / chop etish")}</button><button type="button" className="mb-btn" onClick={onYop}>✕ {__kbUi("Yopish")}</button>
      <small>{__kbUi("Chop oynasida «Printer» o‘rniga «PDF sifatida saqlash» ni tanlang.")}</small></div>
    <div className="kb-chop-varaq"><h2>{__kbUi("Matematika testi")}</h2><p className="kb-chop-mavzu">{v.mavzular.join(" · ")}</p>
      <p className="kb-chop-ism">{__kbUi("Ism-familiya")}: ______________________ &nbsp; {__kbUi("Sana")}: ____________</p>
      <ol className="kb-chop-royxat">{v.savollar.map((s) => <li key={s.id}><SavolMatn matn={s.savol} />
        <div className="kb-chop-var">{s.variantlar.map((x, k) => <div key={k}><b>{HARFLAR[k]})</b> <VariantMatn matn={x} /></div>)}</div></li>)}</ol></div>
    {kalit && <div className="kb-chop-varaq kb-chop-kalit"><h2>{__kbUi("Kalitlar (javoblar)")}</h2>
      <div className="kb-chop-javoblar">{v.savollar.map((s, i) => <span key={s.id}><b>{i + 1}</b>-{s.javob}</span>)}</div>
      {v.savollar.some((s) => s.yechim) && <><h3>{__kbUi("Yechimlar")}</h3>{v.savollar.map((s, i) => s.yechim && <div key={s.id} className="kb-chop-yechim"><b>{i + 1}.</b> {String(s.yechim).split("\n").map((q, k) => <SavolMatn key={k} matn={q} />)}</div>)}</>}</div>}
  </div>, document.body);
}

export default function TestVaraq({ apiBase = "", token }) {
  const [ochiq, setOchiq] = useState(false); const [manba, setManba] = useState("tem"); const [ro, setRo] = useState(null); const [tanl, setTanl] = useState({});
  const [qid, setQid] = useState(""); const [soni, setSoni] = useState(20); const [qiy, setQiy] = useState(""); const [xato, setXato] = useState(""); const [yuk, setYuk] = useState(false);
  const [v, setV] = useState(null); const [kalit, setKalit] = useState(true);
  useEffect(() => { if (!ochiq) return; setRo(null); setTanl({}); matFetch(apiBase, token, manba === "rep" ? "/api/matbank/repetitor/mavzular" : "/api/matbank/mavzular").then((d) => setRo(d.mavzular || [])).catch((e) => setXato(e.message)); }, [ochiq, manba, apiBase, token]);
  const korinadi = useMemo(() => (ro || []).filter((m) => !qid || m.nom.toLowerCase().includes(qid.toLowerCase())).slice(0, 80), [ro, qid]);
  const ids = Object.keys(tanl).filter((k) => tanl[k]);
  const tuz = async () => { setYuk(true); setXato(""); try { setV(await matFetch(apiBase, token, "/api/matbank/oqituvchi/varaq", { params: { manba, mavzu: ids.join(","), soni, qiyinlik: qiy } })); } catch (e) { setXato(e.message); } setYuk(false); };
  if (!ochiq) return <button type="button" className="mb-karta mb-sert-tur" style={{ width: "100%", margin: "12px 0", textAlign: "left", cursor: "pointer" }} onClick={() => setOchiq(true)}>
    <b>📄 {__kbUi("Test varag‘i tuzish (PDF, kalitlari bilan)")}</b><small>{__kbUi("Mavzularni tanlang — savollar va kalitlar varag‘ini PDF qilib oling")}</small></button>;
  return <RasmKonteksti.Provider value={{ apiBase, token }}><section className="mb-karta" style={{ margin: "12px 0", display: "grid", gap: 10 }}>
    <div className="mb-bosh-qator"><h3 style={{ margin: 0 }}>📄 {__kbUi("Test varag‘i tuzish")}</h3><button type="button" className="mb-btn mb-yengil" onClick={() => setOchiq(false)}>✕</button></div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button type="button" className={`mb-btn ${manba === "tem" ? "mb-asosiy" : ""}`} onClick={() => setManba("tem")}>{__kbUi("Mavzular banki")}</button>
      <button type="button" className={`mb-btn ${manba === "rep" ? "mb-asosiy" : ""}`} onClick={() => setManba("rep")}>{__kbUi("Repetitor (150 mavzu)")}</button></div>
    <input className="mb-input" style={{ maxWidth: "100%" }} placeholder={__kbUi("Mavzu qidirish…")} value={qid} onChange={(e) => setQid(e.target.value)} />
    <div style={{ maxHeight: 220, overflow: "auto", border: "1px solid #e1e7ef", borderRadius: 12, padding: 8, display: "grid", gap: 4 }}>
      {!ro ? <p className="mb-muted">⏳</p> : korinadi.map((m) => <label key={m.raqam} style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" checked={!!tanl[m.raqam]} onChange={(e) => setTanl((t) => ({ ...t, [m.raqam]: e.target.checked }))} /><span>{m.raqam}. {m.nom} <small className="mb-muted">({m.testlar})</small></span></label>)}</div>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <label>{__kbUi("Savollar soni")}: <select value={soni} onChange={(e) => setSoni(Number(e.target.value))}>{[10, 15, 20, 30, 40].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
      <label>{__kbUi("Qiyinlik")}: <select value={qiy} onChange={(e) => setQiy(e.target.value)}><option value="">{__kbUi("aralash")}</option><option value="O">{__kbUi("oson")}</option><option value="R">{__kbUi("o‘rta")}</option><option value="Q">{__kbUi("qiyin")}</option></select></label>
      <button type="button" className="mb-btn mb-asosiy" disabled={!ids.length || yuk} onClick={tuz}>{yuk ? "…" : `${__kbUi("Varaq tuzish")} (${ids.length} ${__kbUi("mavzu")})`}</button></div>
    {xato && <p className="mb-xato-q" role="alert">⚠️ {__kbUi(xato)}</p>}
    {v && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><b>✅ {v.soni} {__kbUi("ta savol tayyor")}</b>
      <label><input type="checkbox" checked={kalit} onChange={(e) => setKalit(e.target.checked)} /> {__kbUi("kalitlar bilan")}</label>
      <button type="button" className="mb-btn mb-asosiy" onClick={() => setV({ ...v, ko: true })}>👁 {__kbUi("Ko‘rish va PDF")}</button></div>}
    {v?.ko && <Chop v={v} kalit={kalit} onYop={() => setV({ ...v, ko: false })} />}
  </section></RasmKonteksti.Provider>;
}
