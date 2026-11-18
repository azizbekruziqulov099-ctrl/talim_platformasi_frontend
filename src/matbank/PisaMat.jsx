// PISA matematika: mavzular (o‘zlashtirish %) → dars (Kabu, qadamma-qadam) → 30 mashq (darhol tekshiruv) → 30 test (ball) → xato va yechimlar.
// Server: modules/pisa_mat.py. Hamma matn uiText (5 til) va CourseText/KaTeX orqali o‘tadi.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { RasmKonteksti, SavolMatn, VariantMatn } from "./MatMatn.jsx";
import { HARFLAR } from "./matMatn.js";
import { matFetch } from "./matBankApi.js";
import { qolganSekund, vaqtMatni } from "./sertRules.js";
import XbDoska from "../xalqaro/XbDoska.jsx";
import { XbUstoz } from "../xalqaro/XbDoska.jsx";
import { useUstozOvoz } from "../xalqaro/xbOvoz.js";
import "./matbank.css";

const Xato = ({ x, qayta }) => <div className="mb-xato" role="alert"><p>⚠️ {__kbUi(x)}</p>{qayta && <button type="button" className="mb-btn" onClick={qayta}>↻ {__kbUi("Qayta urinish")}</button>}</div>;
const Rasm = ({ r }) => (r ? <div className="mb-mock-rasm" dangerouslySetInnerHTML={{ __html: r }} /> : null);   // serverning o‘zi yasagan SVG
const Yuk = () => <p className="mb-bosh" role="status">⏳ {__kbUi("Yuklanmoqda…")}</p>;
const rangOf = (f) => (f >= 85 ? "#15803d" : f >= 70 ? "#2563eb" : f >= 50 ? "#d97706" : "#dc2626");
const kalit = (s, h) => (h ? `${s.n}${h}` : String(s.n));

/* ── mavzular ── */
function Royxat({ apiBase, token, onMavzu, onClose, bolim = "" }) {
  const [d, setD] = useState(null); const [xato, setXato] = useState("");
  const yukla = useCallback(() => { setXato(""); matFetch(apiBase, token, "/api/pisamat/mavzular", { params: bolim ? { bolim } : {} }).then(setD).catch((e) => setXato(e.message)); }, [apiBase, token, bolim]);
  useEffect(() => { yukla(); }, [yukla]);
  const soha = d ? [...new Set(d.mavzular.map((m) => m.soha))] : [];
  return <section className="mb-root">
    <header className="mb-bosh-qator">{onClose && <button type="button" className="mb-btn mb-yengil" onClick={onClose}>← {__kbUi("Orqaga")}</button>}
      <div><h2>🌍 {__kbUi("PISA matematika")}</h2><small>{__kbUi("Har mavzuda: dars, 30 mashq, 30 test")}</small></div></header>
    {xato ? <Xato x={xato} qayta={yukla} /> : !d ? <Yuk /> : <>
      <div className="mb-karta"><b>{__kbUi("Umumiy o‘zlashtirish")}: <span style={{ color: rangOf(d.ozlashtirish) }}>{d.ozlashtirish}%</span></b>
        <i className="mb-yolak mb-yolak-katta" aria-hidden="true"><b style={{ width: `${d.ozlashtirish}%`, background: rangOf(d.ozlashtirish) }} /></i></div>
      {soha.map((h) => <div key={h}><h3 className="pm-soha">{__kbUi(h)}</h3>
        <ul className="mb-royxat">{d.mavzular.filter((m) => m.soha === h).map((m) => <li key={m.kod}><button type="button" className="mb-mavzu" onClick={() => onMavzu(m)}>
          <span className="mb-raqam">{m.belgi}</span><span className="mb-nom"><b>{__kbUi(m.nom)}</b><small>{__kbUi(m.maqsad)}</small>
            <i className="mb-yolak" aria-hidden="true"><b style={{ width: `${m.ozlashtirish}%`, background: rangOf(m.ozlashtirish) }} /></i>
            <small>{m.test_soni ? `${__kbUi("Test")}: ${__kbUi("eng yaxshi")} ${m.test_eng}% · ${m.test_soni} ${__kbUi("urinish")}` : __kbUi("Test hali topshirilmagan")}</small></span>
          <span className="mb-ulush" style={{ color: rangOf(m.ozlashtirish) }}>{m.ozlashtirish}%</span></button></li>)}</ul></div>)}</>}
  </section>;
}

/* ── dars ── */
function Dars({ apiBase, token, m, onOrqaga }) {
  const [d, setD] = useState(null); const [xato, setXato] = useState("");
  const ovoz = useUstozOvoz(apiBase, "qiz", "");
  useEffect(() => { matFetch(apiBase, token, `/api/pisamat/dars/${m.kod}`).then(setD).catch((e) => setXato(e.message)); return () => ovoz.hush(); }, [apiBase, token, m.kod]); // eslint-disable-line react-hooks/exhaustive-deps
  if (xato) return <section className="mb-root"><button type="button" className="mb-btn mb-yengil" onClick={onOrqaga}>← {__kbUi("Orqaga")}</button><Xato x={xato} /></section>;
  if (!d) return <section className="mb-root"><Yuk /></section>;
  const asosiy = d.qadamlar.filter((q) => q.turi !== "misol"); const misollar = d.qadamlar.filter((q) => q.turi === "misol");
  const tr = (q) => ({ doska: __kbUi(q.doska), ovoz: __kbUi(q.ovoz) });
  return <section className="mb-root">
    <header className="mb-bosh-qator"><button type="button" className="mb-btn mb-yengil" onClick={() => { ovoz.hush(); onOrqaga(); }}>← {__kbUi("Orqaga")}</button><div><h2>🎓 {__kbUi(d.nom)}</h2><small>{__kbUi(d.maqsad)}</small></div></header>
    <div className="mb-karta"><XbDoska qadamlar={asosiy.map(tr)} ovoz={ovoz} ustoz="" sarlavha={__kbUi(d.nom)} /></div>
    {misollar.map((q, k) => <div key={k} className="mb-karta"><h3>🧩 {__kbUi(q.sarlavha)}</h3><SavolMatn matn={q.savol} /><Rasm r={q.rasm} />
      <XbDoska qadamlar={q.doska.split("\n").filter(Boolean).map((l) => ({ doska: l, ovoz: l.replace(/\$/g, "") }))} ovoz={ovoz} ustoz="" sarlavha={__kbUi("Yechim")} /></div>)}
  </section>;
}

/* ── savol ko‘rinishi ── */
function SavolKarta({ s, jav, setJav, ochiq: yopiqHolat, natija }) {
  return <article className="mb-karta mb-savol-karta"><div className="mb-mock-bosh"><b>{s.n}</b><small>{s.ball} {__kbUi("ball")}</small></div><SavolMatn matn={s.savol} /><Rasm r={s.rasm} />
    {s.tur === "ochiq" ? <div className="mb-ochiq">{s.qismlar.map((q) => <label key={q.h} className="mb-ochiq-qism"><SavolMatn matn={q.savol} />
      <input className="mb-input" inputMode="decimal" autoComplete="off" disabled={yopiqHolat} placeholder={__kbUi("Javob (son yoki a/b)")} value={jav[kalit(s, q.h)] || ""} maxLength={20}
        onChange={(e) => setJav((j) => ({ ...j, [kalit(s, q.h)]: e.target.value }))} />
      {natija && <span>{natija.qismlar.find((z) => z.h === q.h)?.togri ? "✅" : `❌ ${__kbUi("To‘g‘ri")}: `}{!natija.qismlar.find((z) => z.h === q.h)?.togri && <b><VariantMatn matn={natija.qismlar.find((z) => z.h === q.h)?.javob || ""} /></b>}</span>}</label>)}</div>
      : <div className="mb-variantlar" role="radiogroup">{s.variantlar.map((v, k) => <button key={k} type="button" role="radio" disabled={yopiqHolat} aria-checked={jav[kalit(s)] === HARFLAR[k]}
        className={`mb-variant ${jav[kalit(s)] === HARFLAR[k] ? "is-on" : ""} ${natija && natija.javob === HARFLAR[k] ? "is-togri" : ""}`}
        onClick={() => setJav((j) => ({ ...j, [kalit(s)]: HARFLAR[k] }))}><span className="mb-harf">{HARFLAR[k]}</span><VariantMatn matn={v} /></button>)}</div>}
    {natija && <div className={`mb-yechim ${natija.togri ? "is-togri" : ""}`}><p><b>{natija.togri ? `✅ ${__kbUi("To‘g‘ri!")}` : `❌ ${__kbUi("Xato")}`}</b> · {natija.olindi}/{natija.ball} {__kbUi("ball")}</p>
      {natija.yechim.split("\n").map((q, k) => <SavolMatn key={k} matn={q} />)}</div>}</article>;
}

const javobli = (s, jav) => (s.tur === "ochiq" ? s.qismlar.some((q) => (jav[kalit(s, q.h)] || "").trim()) : !!jav[kalit(s)]);

/* ── mashq / test ── */
function Yechish({ apiBase, token, m, tur, onTugadi, onChiq }) {
  const [t, setT] = useState(null); const [xato, setXato] = useState(""); const [i, setI] = useState(0); const [jav, setJav] = useState({}); const [tek, setTek] = useState({});
  const [yub, setYub] = useState(false); const [otgan, setOtgan] = useState(0); const boshi = useRef(Date.now()); const tugadi = useRef(false);
  useEffect(() => { matFetch(apiBase, token, "/api/pisamat/set", { params: { mavzu: m.kod, tur } }).then(setT).catch((e) => setXato(e.message)); }, [apiBase, token, m.kod, tur]);
  useEffect(() => { if (!t || tur !== "test") return undefined; const id = setInterval(() => setOtgan(Math.floor((Date.now() - boshi.current) / 1000)), 1000); return () => clearInterval(id); }, [t, tur]);
  const qolgan = t && tur === "test" ? qolganSekund(t.daqiqa, otgan) : 1;
  const tugat = useCallback(async (majbur = false) => {
    if (!t || tugadi.current) return;
    const bosh = t.savollar.filter((s) => !javobli(s, jav)).length;
    if (!majbur && bosh && !window.confirm(`${bosh} ${__kbUi("ta savolga javob berilmadi. Baribir tugatilsinmi?")}`)) return;
    tugadi.current = true; setYub(true);
    try { onTugadi(await matFetch(apiBase, token, "/api/pisamat/topshir", { method: "POST", body: { mavzu: m.kod, tur, seed: t.seed, javoblar: jav, sekund: Math.floor((Date.now() - boshi.current) / 1000) } })); }
    catch (e) { tugadi.current = false; setXato(e.message); setYub(false); }
  }, [t, jav, apiBase, token, m.kod, tur, onTugadi]);
  useEffect(() => { if (t && tur === "test" && qolgan === 0 && otgan > 0) tugat(true); }, [qolgan]); // eslint-disable-line react-hooks/exhaustive-deps
  if (xato && !t) return <section className="mb-root"><button type="button" className="mb-btn mb-yengil" onClick={onChiq}>← {__kbUi("Orqaga")}</button><Xato x={xato} /></section>;
  if (!t) return <section className="mb-root"><Yuk /></section>;
  const s = t.savollar[i]; const jami = t.savollar.length; const n = t.savollar.filter((x) => javobli(x, jav)).length;
  const tekshir = async () => { try { const r = await matFetch(apiBase, token, "/api/pisamat/bitta", { method: "POST", body: { mavzu: m.kod, seed: t.seed, n: s.n, javoblar: jav } }); setTek((x) => ({ ...x, [s.n]: r })); } catch (e) { setXato(e.message); } };
  return <section className="mb-root mb-test">
    <header className="mb-test-bosh"><button type="button" className="mb-btn mb-yengil" onClick={() => { if (!n || window.confirm(__kbUi("Chiqilsinmi? Javoblaringiz saqlanmaydi."))) onChiq(); }}>✕ {__kbUi("Chiqish")}</button>
      <b>{tur === "mashq" ? "✍️" : "📝"} {i + 1} / {jami}</b>{tur === "test" && <span className={`mb-vaqt ${qolgan < 300 ? "is-oz" : ""}`}>⏱ {vaqtMatni(qolgan)}</span>}</header>
    <i className="mb-yolak mb-yolak-katta" aria-hidden="true"><b style={{ width: `${(100 * n) / jami}%` }} /></i>
    <nav className="mb-nuqtalar">{t.savollar.map((x, k) => <button key={x.n} type="button" className={`${k === i ? "is-hozir" : ""} ${tek[x.n] ? (tek[x.n].togri ? "is-javob" : "is-xato") : javobli(x, jav) ? "is-javob" : ""}`} onClick={() => setI(k)}>{k + 1}</button>)}</nav>
    <SavolKarta key={s.n} s={s} jav={jav} setJav={setJav} ochiq={Boolean(tek[s.n])} natija={tek[s.n]} />
    {xato && <p className="mb-xato-q" role="alert">⚠️ {__kbUi(xato)}</p>}
    <footer className="mb-test-past"><button type="button" className="mb-btn" disabled={i === 0} onClick={() => setI(i - 1)}>← {__kbUi("Oldingi")}</button>
      {tur === "mashq" && !tek[s.n] && <button type="button" className="mb-btn mb-asosiy" disabled={!javobli(s, jav)} onClick={tekshir}>✓ {__kbUi("Tekshirish")}</button>}
      {i < jami - 1 && (tur === "test" || tek[s.n]) && <button type="button" className="mb-btn mb-asosiy" onClick={() => setI(i + 1)}>{__kbUi("Keyingi")} →</button>}
      {(i === jami - 1 || (tur === "mashq" && n >= 5)) && <button type="button" className="mb-btn" disabled={yub} onClick={() => tugat(false)}>{yub ? "…" : `🏁 ${__kbUi("Tugatish")}`}</button>}</footer>
  </section>;
}

/* ── natija ── */
function Natija({ r, m, onOrqaga, onYana }) {
  const [faqat, setFaqat] = useState(false); const f = r.foiz;
  const royxat = faqat ? r.tafsilot.filter((x) => !x.togri) : r.tafsilot;
  const [jav] = useState({});
  return <section className="mb-root">
    <div className="mb-karta mb-sert-ball" style={{ borderColor: rangOf(f) }}><small>{r.tur === "test" ? __kbUi("Test natijasi") : __kbUi("Mashq natijasi")} · {__kbUi(m.nom)}</small>
      <b className="mb-sert-raqam" style={{ color: rangOf(f) }}>{r.ball}<i> / {r.maks}</i></b><span className="mb-sert-daraja" style={{ background: rangOf(f) }}>{f}% · {__kbUi(r.daraja)}</span>
      <small>{r.togri}/{r.jami} {__kbUi("savol to‘liq to‘g‘ri")}</small>
      {f < 70 && <p>🎓 {__kbUi("Natija 70% dan past. Darsni qayta ko‘ring va mashq qiling.")}</p>}</div>
    <div className="mb-karta"><h3>{__kbUi("Javoblar va yechimlar")}</h3>
      <label className="mb-muted"><input type="checkbox" checked={faqat} onChange={(e) => setFaqat(e.target.checked)} /> {__kbUi("Faqat xatolarim")}</label>
      {royxat.map((t) => <SavolKarta key={t.n} s={{ ...t, ball: t.ball }} jav={Object.fromEntries(t.tur === "yopiq" ? [[String(t.n), t.tanlandi]] : t.qismlar.map((q) => [`${t.n}${q.h}`, q.kiritildi]))} setJav={() => {}} ochiq natija={t} />)}</div>
    <div className="mb-test-past"><button type="button" className="mb-btn" onClick={onOrqaga}>← {__kbUi("Mavzuga qaytish")}</button><button type="button" className="mb-btn mb-asosiy" onClick={onYana}>↻ {__kbUi("Yangi to‘plam")}</button></div>
  </section>;
}

/* ── mavzu sahifasi ── */
function Mavzu({ apiBase, token, m, onOrqaga, onBosh }) {
  const [t, setT] = useState(null);
  useEffect(() => { matFetch(apiBase, token, "/api/pisamat/tarix", { params: { mavzu: m.kod } }).then((r) => setT(r.tarix)).catch(() => setT([])); }, [apiBase, token, m.kod]);
  return <section className="mb-root">
    <header className="mb-bosh-qator"><button type="button" className="mb-btn mb-yengil" onClick={onOrqaga}>← {__kbUi("Mavzular")}</button><div><h2>{m.belgi} {__kbUi(m.nom)}</h2><small>{__kbUi(m.soha)}</small></div></header>
    <div className="pm-bosqich">
      <button type="button" className="mb-karta mb-sert-tur" onClick={() => onBosh("dars")}><b>1️⃣ 🎓 {__kbUi("Dars")}</b><small>{__kbUi("Kabu qadamma-qadam tushuntiradi, ishlangan misollar chizma bilan")}</small></button>
      <button type="button" className="mb-karta mb-sert-tur" onClick={() => onBosh("mashq")}><b>2️⃣ ✍️ {__kbUi("30 ta mashq")}</b><small>{__kbUi("Har savoldan keyin darhol tekshiruv va yechim")}</small></button>
      <button type="button" className="mb-karta mb-sert-tur" onClick={() => onBosh("test")}><b>3️⃣ 📝 {__kbUi("30 ta test")}</b><small>{__kbUi("1, 2 va 4 ballik savollar, 45 daqiqa. Oxirida ball va yechimlar")}</small></button></div>
    {t && t.length > 0 && <div className="mb-karta"><h3>{__kbUi("Yechilganlar")}</h3><ul className="mb-sert-tarix">{t.map((x) => <li key={x.id}><button type="button" className="mb-tarix-qator" onClick={() => onBosh("natija", x.id)}>
      <span>{new Date(x.sana).toLocaleDateString()} · {x.tur === "test" ? __kbUi("Test") : __kbUi("Mashq")}</span><b style={{ color: rangOf(x.foiz) }}>{x.ball}/{x.maks} · {x.foiz}%</b><small>{__kbUi("xato va yechimlarni ko‘rish")} →</small></button></li>)}</ul></div>}
  </section>;
}

export default function PisaMat({ apiBase = "", token, onClose, bolim = "" }) {
  useKbInterfaceLocale();
  const [e, setE] = useState({ t: "royxat" });
  const royxat = () => setE({ t: "royxat", n: Date.now() });
  const mavzu = (m) => setE({ t: "mavzu", m });
  const bosh = (m) => async (k, id) => {
    if (k === "natija") { try { const r = await matFetch(apiBase, token, "/api/pisamat/natija", { params: { id } }); setE({ t: "natija", m, r }); } catch { /* */ } return; }
    setE({ t: k, m, n: Date.now() });
  };
  return <RasmKonteksti.Provider value={{ apiBase, token }}>{
    e.t === "royxat" ? <Royxat key={e.n} apiBase={apiBase} token={token} onClose={onClose} onMavzu={mavzu} bolim={bolim} />
      : e.t === "mavzu" ? <Mavzu apiBase={apiBase} token={token} m={e.m} onOrqaga={royxat} onBosh={bosh(e.m)} />
        : e.t === "dars" ? <Dars apiBase={apiBase} token={token} m={e.m} onOrqaga={() => mavzu(e.m)} />
          : e.t === "natija" ? <Natija r={e.r} m={e.m} onOrqaga={() => mavzu(e.m)} onYana={() => setE({ t: e.r.tur, m: e.m, n: Date.now() })} />
            : <Yechish key={e.n} apiBase={apiBase} token={token} m={e.m} tur={e.t} onChiq={() => mavzu(e.m)} onTugadi={(r) => setE({ t: "natija", m: e.m, r })} />
  }</RasmKonteksti.Provider>;
}
