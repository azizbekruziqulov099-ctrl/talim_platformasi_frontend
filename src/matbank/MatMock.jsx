// MOCK imtihon: 45 topshiriq (32 yopiq, 3 moslashtirish-uslubidagi yopiq, 10 ochiq a/b), 150 daqiqa. Har urinish — noyob savollar (seed).
// Server: modules/mat_mock.py. Natijadan keyin ball (taxminiy, Rasch) va har bir topshiriq yechimi ko‘rinadi.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { RasmKonteksti, SavolMatn, VariantMatn } from "./MatMatn.jsx";
import { HARFLAR } from "./matMatn.js";
import { matFetch } from "./matBankApi.js";
import { BALL_RANGI, qolganSekund, vaqtMatni } from "./sertRules.js";
import "./matbank.css";

const Xato = ({ x, qayta }) => <div className="mb-xato" role="alert"><p>⚠️ {__kbUi(x)}</p>{qayta && <button type="button" className="mb-btn" onClick={qayta}>↻ {__kbUi("Qayta urinish")}</button>}</div>;
const kalit = (s, h) => (h ? `${s.slot}${h}` : String(s.slot));

function Boshlash({ apiBase, token, onBosh, onClose }) {
  const [d, setD] = useState(null); const [xato, setXato] = useState("");
  useEffect(() => { matFetch(apiBase, token, "/api/matmock/turlar").then(setD).catch((e) => setXato(e.message)); }, [apiBase, token]);
  return <section className="mb-root">
    <header className="mb-bosh-qator">{onClose && <button type="button" className="mb-btn mb-yengil" onClick={onClose}>← {__kbUi("Orqaga")}</button>}
      <div><h2>🧪 {__kbUi("MOCK imtihon: matematika")}</h2><small>{__kbUi("Har safar yangi savollar — hech kimda bir xil emas")}</small></div></header>
    {xato ? <Xato x={xato} /> : !d ? <p className="mb-bosh" role="status">⏳</p> : <>
      <button type="button" className="mb-karta mb-sert-tur" onClick={() => onBosh()}><b>▶️ {__kbUi("Yangi imtihonni boshlash")}</b>
        <span>{d.topshiriq} {__kbUi("topshiriq")} · {d.daqiqa} {__kbUi("daqiqa")}</span><small>{__kbUi("32 yopiq, 3 moslashtirish, 10 ochiq (a, b qismli). Oxirida ball va yechimlar.")}</small></button>
      <p className="mb-muted">ℹ️ {__kbUi(d.izoh)}</p>
      {d.tarix.length > 0 && <div className="mb-karta"><h3>{__kbUi("Oldingi urinishlar")}</h3>
        <ul className="mb-sert-tarix">{d.tarix.map((t) => <li key={t.id}><span>{new Date(t.sana).toLocaleDateString()}</span>
          <b style={{ color: BALL_RANGI[t.daraja] || "#6b7280" }}>{t.ball} {__kbUi("ball")}{t.daraja ? ` · ${t.daraja}` : ""}</b><small>{t.togri}/45</small></li>)}</ul></div>}</>}
  </section>;
}

function Yechish({ apiBase, token, onTugadi, onChiq }) {
  const [t, setT] = useState(null); const [xato, setXato] = useState(""); const [i, setI] = useState(0); const [jav, setJav] = useState({}); const [yub, setYub] = useState(false);
  const [otgan, setOtgan] = useState(0); const boshi = useRef(Date.now()); const tugadi = useRef(false);
  const yukla = useCallback(() => { setT(null); setXato(""); setI(0); setJav({}); setOtgan(0); boshi.current = Date.now();
    matFetch(apiBase, token, "/api/matmock/test").then(setT).catch((e) => setXato(e.message)); }, [apiBase, token]);
  useEffect(() => { yukla(); }, [yukla]);
  useEffect(() => { if (!t) return undefined; const id = setInterval(() => setOtgan(Math.floor((Date.now() - boshi.current) / 1000)), 1000); return () => clearInterval(id); }, [t]);
  const qolgan = t ? qolganSekund(t.daqiqa, otgan) : 0;
  const javobli = (s) => (s.tur === "ochiq" ? s.qismlar.some((q) => (jav[kalit(s, q.h)] || "").trim()) : !!jav[kalit(s)]);
  const tugat = useCallback(async (majbur = false) => {
    if (!t || tugadi.current) return;
    const bosh = t.savollar.filter((s) => !javobli(s)).length; // eslint-disable-line no-use-before-define
    if (!majbur && bosh && !window.confirm(`${bosh} ${__kbUi("ta topshiriqqa javob berilmadi. Baribir tugatilsinmi?")}`)) return;
    tugadi.current = true; setYub(true); setXato("");
    try { const r = await matFetch(apiBase, token, "/api/matmock/topshir", { method: "POST", body: { seed: t.seed, javoblar: jav, sekund: Math.floor((Date.now() - boshi.current) / 1000) } }); onTugadi(r); }
    catch (e) { tugadi.current = false; setXato(e.message); setYub(false); }
  }, [t, jav, apiBase, token, onTugadi]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (t && qolgan === 0 && otgan > 0) tugat(true); }, [qolgan]); // eslint-disable-line react-hooks/exhaustive-deps
  if (xato && !t) return <section className="mb-root"><button type="button" className="mb-btn mb-yengil" onClick={onChiq}>← {__kbUi("Orqaga")}</button><Xato x={xato} qayta={yukla} /></section>;
  if (!t) return <section className="mb-root"><p className="mb-bosh" role="status">⏳ {__kbUi("Savollar tayyorlanmoqda…")}</p></section>;
  const s = t.savollar[i]; const n = t.savollar.filter(javobli).length; const jami = t.savollar.length;
  return <section className="mb-root mb-test">
    <header className="mb-test-bosh"><button type="button" className="mb-btn mb-yengil" onClick={() => { if (!n || window.confirm(__kbUi("Imtihondan chiqilsinmi? Javoblaringiz saqlanmaydi."))) onChiq(); }}>✕ {__kbUi("Chiqish")}</button>
      <b>{i + 1} / {jami}</b><span className={`mb-vaqt ${qolgan < 300 ? "is-oz" : ""}`} aria-label={__kbUi("Qolgan vaqt")}>⏱ {vaqtMatni(qolgan)}</span></header>
    <i className="mb-yolak mb-yolak-katta" aria-hidden="true"><b style={{ width: `${(100 * n) / jami}%` }} /></i>
    <nav className="mb-nuqtalar" aria-label={__kbUi("Topshiriqlar")}>{t.savollar.map((x, k) => <button key={x.slot} type="button" className={`${k === i ? "is-hozir" : ""} ${javobli(x) ? "is-javob" : ""}`} onClick={() => setI(k)} aria-current={k === i}>{k + 1}</button>)}</nav>
    <article className="mb-karta mb-savol-karta" key={s.slot}><SavolMatn matn={s.savol} />
      {s.tur === "ochiq" ? <div className="mb-ochiq">{s.qismlar.map((q) => <label key={q.h} className="mb-ochiq-qism"><SavolMatn matn={q.savol} />
        <input className="mb-input" inputMode="decimal" autoComplete="off" placeholder={__kbUi("Javob (son yoki a/b)")} value={jav[kalit(s, q.h)] || ""} maxLength={20}
          onChange={(e) => setJav((j) => ({ ...j, [kalit(s, q.h)]: e.target.value }))} /></label>)}</div>
        : <div className="mb-variantlar" role="radiogroup">{s.variantlar.map((v, k) => <button key={k} type="button" role="radio" aria-checked={jav[kalit(s)] === HARFLAR[k]}
          className={`mb-variant ${jav[kalit(s)] === HARFLAR[k] ? "is-on" : ""}`} onClick={() => setJav((j) => ({ ...j, [kalit(s)]: j[kalit(s)] === HARFLAR[k] ? "" : HARFLAR[k] }))}><span className="mb-harf">{HARFLAR[k]}</span><VariantMatn matn={v} /></button>)}</div>}</article>
    {xato && <p className="mb-xato-q" role="alert">⚠️ {__kbUi(xato)}</p>}
    <footer className="mb-test-past"><button type="button" className="mb-btn" disabled={i === 0} onClick={() => setI(i - 1)}>← {__kbUi("Oldingi")}</button>
      {i < jami - 1 ? <button type="button" className="mb-btn mb-asosiy" onClick={() => setI(i + 1)}>{__kbUi("Keyingi")} →</button>
        : <button type="button" className="mb-btn mb-asosiy" disabled={yub} onClick={() => tugat(false)}>{yub ? "…" : `✓ ${__kbUi("Tugatish")}`}</button>}</footer>
    {i < jami - 1 && n > 0 && <p className="mb-tugat-havola"><button type="button" className="mb-link" disabled={yub} onClick={() => tugat(false)}>{__kbUi("Hozir tugatish va natijani ko‘rish")}</button></p>}
  </section>;
}

function Yechim({ t }) {
  const [och, setOch] = useState(false);
  return <li className={`mb-mock-q ${t.togri ? "is-togri" : "is-xato"}`}>
    <div className="mb-mock-bosh"><b>{t.slot}. {t.togri ? "✅" : "❌"}</b><small>{t.mavzu}</small></div>
    <SavolMatn matn={t.savol} />
    {t.tur === "yopiq" ? <p className="mb-muted">{__kbUi("Sizning javob")}: <b>{t.tanlandi || "—"}</b> · {__kbUi("To‘g‘ri")}: <b>{t.javob}</b>{" "}<VariantMatn matn={t.variantlar[HARFLAR.indexOf(t.javob)] || ""} /></p>
      : t.qismlar.map((q) => <p key={q.h} className="mb-muted"><SavolMatn matn={q.savol} />{q.togri ? "✅" : "❌"} {__kbUi("Sizning javob")}: <b>{q.kiritildi || "—"}</b> · {__kbUi("To‘g‘ri")}: <b><VariantMatn matn={q.javob} /></b></p>)}
    <button type="button" className="mb-link" onClick={() => setOch(!och)}>{och ? __kbUi("Yechimni yopish") : `💡 ${__kbUi("Yechimni ko‘rish")}`}</button>
    {och && <div className="mb-yechim">{t.yechim.split("\n").map((q, k) => <SavolMatn key={k} matn={q} />)}</div>}
  </li>;
}

function Natija({ r, onYana, onBosh }) {
  const rang = BALL_RANGI[r.daraja] || "#6b7280"; const [faqat, setFaqat] = useState(false);
  const royxat = faqat ? r.natija.filter((x) => !x.togri) : r.natija;
  return <section className="mb-root">
    <div className="mb-karta mb-sert-ball" style={{ borderColor: rang }}>
      <small>{__kbUi("MOCK imtihon natijasi")}</small>
      <b className="mb-sert-raqam" style={{ color: rang }}>{r.ball}<i> / 75</i></b>
      <span className="mb-sert-daraja" style={{ background: rang }}>{r.daraja || __kbUi("sertifikat yo‘q")}</span>
      <p>{r.sertifikat ? __kbUi("Sertifikat chegarasidan (46) o‘tdingiz!") : __kbUi("Sertifikat uchun kamida 46 ball kerak. Zaif mavzularni takrorlang.")}</p>
      <small>{r.togri_topshiriq} / 45 {__kbUi("topshiriq to‘g‘ri")} · {r.xom} / 55 {__kbUi("band")}</small></div>
    {r.zaif.length > 0 && <div className="mb-karta"><h3>🎯 {__kbUi("Takrorlash kerak")}</h3><p>{r.zaif.join(" · ")}</p></div>}
    <div className="mb-karta"><h3>{__kbUi("Javoblar va yechimlar")}</h3>
      <label className="mb-muted"><input type="checkbox" checked={faqat} onChange={(e) => setFaqat(e.target.checked)} /> {__kbUi("Faqat xatolarim")}</label>
      <ul className="mb-sert-tarix mb-mock-royxat">{royxat.map((t) => <Yechim key={t.slot} t={t} />)}</ul></div>
    <p className="mb-muted">ℹ️ {__kbUi(r.izoh)}</p>
    <div className="mb-test-past"><button type="button" className="mb-btn" onClick={onBosh}>← {__kbUi("Orqaga")}</button><button type="button" className="mb-btn mb-asosiy" onClick={onYana}>↻ {__kbUi("Yangi imtihon")}</button></div>
  </section>;
}

export default function MatMock({ apiBase = "", token, onClose }) {
  const [e, setE] = useState({ t: "bosh" });
  return <RasmKonteksti.Provider value={{ apiBase, token }}>{
    e.t === "yech" ? <Yechish key={e.n} apiBase={apiBase} token={token} onChiq={() => setE({ t: "bosh" })} onTugadi={(r) => setE({ t: "natija", r })} />
      : e.t === "natija" ? <Natija r={e.r} onBosh={() => setE({ t: "bosh" })} onYana={() => setE({ t: "yech", n: Date.now() })} />
        : <Boshlash apiBase={apiBase} token={token} onClose={onClose} onBosh={() => setE({ t: "yech", n: Date.now() })} />}</RasmKonteksti.Provider>;
}
