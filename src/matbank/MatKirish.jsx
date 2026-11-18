// KIRISH imtihoni: 30 ta savol — 10 ta oddiy (1,1 ball) + 20 ta tanlangan daraja (2,1 yoki 3,1 ball). O‘z test bankimizdan. Server: modules/mat_kirish.py
import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { RasmKonteksti, SavolMatn, VariantMatn } from "./MatMatn.jsx";
import { HARFLAR } from "./matMatn.js";
import { matFetch } from "./matBankApi.js";
import { qolganSekund, vaqtMatni } from "./sertRules.js";
import "./matbank.css";

const f1 = (x) => String(Number(x).toFixed(1)).replace(".", ",");
const Xato = ({ x, qayta }) => <div className="mb-xato" role="alert"><p>⚠️ {__kbUi(x)}</p>{qayta && <button type="button" className="mb-btn" onClick={qayta}>↻ {__kbUi("Qayta urinish")}</button>}</div>;

function Boshlash({ apiBase, token, onBosh, onClose }) {
  const [d, setD] = useState(null); const [xato, setXato] = useState("");
  useEffect(() => { matFetch(apiBase, token, "/api/matkirish/info").then(setD).catch((e) => setXato(e.message)); }, [apiBase, token]);
  return <section className="mb-root">
    <header className="mb-bosh-qator">{onClose && <button type="button" className="mb-btn mb-yengil" onClick={onClose}>← {__kbUi("Orqaga")}</button>}
      <div><h2>🎓 {__kbUi("Kirish imtihoni: matematika")}</h2><small>{__kbUi("30 ta savol · 60 daqiqa")}</small></div></header>
    {xato ? <Xato x={xato} /> : !d ? <p className="mb-bosh" role="status">⏳</p> : <>
      <div className="mb-karta"><p>{__kbUi(d.izoh)}</p></div>
      <button type="button" className="mb-karta mb-sert-tur" onClick={() => onBosh()}><b>▶️ {__kbUi("Imtihonni boshlash")}</b><span>10 × 1,1 + 10 × 2,1 + 10 × 3,1 = 63,0 {__kbUi("ball")}</span><small>{__kbUi("30 ta savol · 60 daqiqa")}</small></button>
      {d.tarix.length > 0 && <div className="mb-karta"><h3>{__kbUi("Oldingi urinishlar")}</h3>
        <ul className="mb-sert-tarix">{d.tarix.map((t) => <li key={t.id}><span>{new Date(t.sana).toLocaleDateString()}</span><b>{f1(t.ball)} / {f1(t.maks)}</b><small>{t.togri}/30</small></li>)}</ul></div>}</>}
  </section>;
}

function Yechish({ apiBase, token, onTugadi, onChiq }) {
  const [t, setT] = useState(null); const [xato, setXato] = useState(""); const [i, setI] = useState(0); const [jav, setJav] = useState({}); const [yub, setYub] = useState(false);
  const [otgan, setOtgan] = useState(0); const boshi = useRef(Date.now()); const tugadi = useRef(false);
  const yukla = useCallback(() => { setT(null); setXato(""); setI(0); setJav({}); setOtgan(0); boshi.current = Date.now();
    matFetch(apiBase, token, "/api/matkirish/test").then(setT).catch((e) => setXato(e.message)); }, [apiBase, token]);
  useEffect(() => { yukla(); }, [yukla]);
  useEffect(() => { if (!t) return undefined; const id = setInterval(() => setOtgan(Math.floor((Date.now() - boshi.current) / 1000)), 1000); return () => clearInterval(id); }, [t]);
  const qolgan = t ? qolganSekund(t.daqiqa, otgan) : 0;
  const tugat = useCallback(async (majbur = false) => {
    if (!t || tugadi.current) return;
    const bosh = t.savollar.filter((s) => !jav[s.id]).length;
    if (!majbur && bosh && !window.confirm(`${bosh} ${__kbUi("ta savolga javob berilmadi. Baribir tugatilsinmi?")}`)) return;
    tugadi.current = true; setYub(true); setXato("");
    try { const r = await matFetch(apiBase, token, "/api/matkirish/topshir", { method: "POST", body: { idlar: t.savollar.map((s) => s.id), javoblar: jav, sekund: Math.floor((Date.now() - boshi.current) / 1000) } }); onTugadi(r, t.savollar); }
    catch (e) { tugadi.current = false; setXato(e.message); setYub(false); }
  }, [t, jav, apiBase, token, onTugadi]);
  useEffect(() => { if (t && qolgan === 0 && otgan > 0) tugat(true); }, [qolgan]); // eslint-disable-line react-hooks/exhaustive-deps
  if (xato && !t) return <section className="mb-root"><button type="button" className="mb-btn mb-yengil" onClick={onChiq}>← {__kbUi("Orqaga")}</button><Xato x={xato} qayta={yukla} /></section>;
  if (!t) return <section className="mb-root"><p className="mb-bosh" role="status">⏳ {__kbUi("Savollar tayyorlanmoqda…")}</p></section>;
  const s = t.savollar[i]; const n = t.savollar.filter((x) => jav[x.id]).length;
  return <section className="mb-root mb-test">
    <header className="mb-test-bosh"><button type="button" className="mb-btn mb-yengil" onClick={() => { if (!n || window.confirm(__kbUi("Imtihondan chiqilsinmi? Javoblaringiz saqlanmaydi."))) onChiq(); }}>✕ {__kbUi("Chiqish")}</button>
      <b>{i + 1} / {t.soni}</b><span className={`mb-vaqt ${qolgan < 300 ? "is-oz" : ""}`} aria-label={__kbUi("Qolgan vaqt")}>⏱ {vaqtMatni(qolgan)}</span></header>
    <i className="mb-yolak mb-yolak-katta" aria-hidden="true"><b style={{ width: `${(100 * n) / t.soni}%` }} /></i>
    <nav className="mb-nuqtalar" aria-label={__kbUi("Savollar")}>{t.savollar.map((x, k) => <button key={x.id} type="button" className={`${k === i ? "is-hozir" : ""} ${jav[x.id] ? "is-javob" : ""}`} onClick={() => setI(k)} aria-current={k === i}>{k + 1}</button>)}</nav>
    <article className="mb-karta mb-savol-karta"><small className="mb-muted">{f1(s.ball)} {__kbUi("ball")}</small><SavolMatn matn={s.savol} />
      <div className="mb-variantlar" role="radiogroup">{s.variantlar.map((v, k) => <button key={k} type="button" role="radio" aria-checked={jav[s.id] === HARFLAR[k]}
        className={`mb-variant ${jav[s.id] === HARFLAR[k] ? "is-on" : ""}`} onClick={() => setJav((j) => ({ ...j, [s.id]: j[s.id] === HARFLAR[k] ? "" : HARFLAR[k] }))}><span className="mb-harf">{HARFLAR[k]}</span><VariantMatn matn={v} /></button>)}</div></article>
    {xato && <p className="mb-xato-q" role="alert">⚠️ {__kbUi(xato)}</p>}
    <footer className="mb-test-past"><button type="button" className="mb-btn" disabled={i === 0} onClick={() => setI(i - 1)}>← {__kbUi("Oldingi")}</button>
      {i < t.soni - 1 ? <button type="button" className="mb-btn mb-asosiy" onClick={() => setI(i + 1)}>{__kbUi("Keyingi")} →</button>
        : <button type="button" className="mb-btn mb-asosiy" disabled={yub} onClick={() => tugat(false)}>{yub ? "…" : `✓ ${__kbUi("Tugatish")}`}</button>}</footer>
    {i < t.soni - 1 && n > 0 && <p className="mb-tugat-havola"><button type="button" className="mb-link" disabled={yub} onClick={() => tugat(false)}>{__kbUi("Hozir tugatish va natijani ko‘rish")}</button></p>}
  </section>;
}

function Natija({ r, savollar, onYana, onBosh, onMavzu }) {
  const [faqat, setFaqat] = useState(true); const [och, setOch] = useState({});
  const sv = Object.fromEntries(savollar.map((s) => [s.id, s]));
  const royxat = r.natija.map((x, k) => ({ ...x, k })).filter((x) => !faqat || !x.togri);
  return <section className="mb-root">
    <div className="mb-karta mb-sert-ball"><small>{__kbUi("Kirish imtihoni natijasi")}</small>
      <b className="mb-sert-raqam">{f1(r.ball)}<i> / {f1(r.maks)}</i></b>
      <p>{r.togri} / 30 {__kbUi("to‘g‘ri")} ({r.foiz}%)</p>
      <small>1,1: {r.qismlar[0]}/10 · 2,1: {r.qismlar[1]}/10 · 3,1: {r.qismlar[2]}/10</small></div>
    {r.tavsiya?.length > 0 && <div className="mb-karta"><h3>📚 {__kbUi("Nimani o‘rganish kerak")}</h3>
      <ul className="mb-sert-tavsiya">{r.tavsiya.map((m) => <li key={m.mavzu}><span><b>{m.mavzu}-{__kbUi("mavzu")}</b> {m.nom}<small> · {m.xato} {__kbUi("ta xato")}</small></span>
        {onMavzu && <button type="button" className="mb-btn mb-asosiy" onClick={() => onMavzu(m.mavzu)}>{__kbUi("O‘rganish")} →</button>}</li>)}</ul></div>}
    <div className="mb-karta"><h3>{__kbUi("Savollar va yechimlar")}</h3>
      <label className="mb-muted"><input type="checkbox" checked={faqat} onChange={(e) => setFaqat(e.target.checked)} /> {__kbUi("Faqat xatolarim")}</label>
      <ul className="mb-sert-tarix mb-mock-royxat">{royxat.map((x) => { const s = sv[x.id]; return <li key={x.id} className={`mb-mock-q ${x.togri ? "is-togri" : "is-xato"}`}>
        <div className="mb-mock-bosh"><b>{x.k + 1}. {x.togri ? "✅" : "❌"}</b><small>{f1(x.ball)} {__kbUi("ball")}</small></div>
        {s && <SavolMatn matn={s.savol} />}
        <p className="mb-muted">{__kbUi("Sizning javob")}: <b>{x.tanlandi || "—"}</b> · {__kbUi("To‘g‘ri")}: <b>{x.javob}</b>{s && <> <VariantMatn matn={s.variantlar[HARFLAR.indexOf(x.javob)] || ""} /></>}</p>
        {x.yechim && <><button type="button" className="mb-link" onClick={() => setOch((o) => ({ ...o, [x.id]: !o[x.id] }))}>{och[x.id] ? __kbUi("Yechimni yopish") : `💡 ${__kbUi("Yechimni ko‘rish")}`}</button>
          {och[x.id] && <div className="mb-yechim">{String(x.yechim).split("\n").map((q, k) => <SavolMatn key={k} matn={q} />)}</div>}</>}</li>; })}</ul></div>
    <div className="mb-test-past"><button type="button" className="mb-btn" onClick={onBosh}>← {__kbUi("Orqaga")}</button><button type="button" className="mb-btn mb-asosiy" onClick={onYana}>↻ {__kbUi("Yana urinish")}</button></div>
  </section>;
}

/** onMavzu(n) — Repetitor n-mavzusini ochadi. */
export default function MatKirish({ apiBase = "", token, onClose, onMavzu = null }) {
  const [e, setE] = useState({ t: "bosh" });
  return <RasmKonteksti.Provider value={{ apiBase, token }}>{
    e.t === "yech" ? <Yechish key={e.n} apiBase={apiBase} token={token} onChiq={() => setE({ t: "bosh" })} onTugadi={(r, savollar) => setE({ t: "natija", r, savollar })} />
      : e.t === "natija" ? <Natija r={e.r} savollar={e.savollar} onMavzu={onMavzu} onBosh={() => setE({ t: "bosh" })} onYana={() => setE({ t: "yech", n: Date.now() })} />
        : <Boshlash apiBase={apiBase} token={token} onClose={onClose} onBosh={() => setE({ t: "yech", n: Date.now() })} />}</RasmKonteksti.Provider>;
}
