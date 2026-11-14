// REV559: «Matematika banki» — mavzu tanlash → qoida va ishlangan misollar → test yechish → natija (to'g'ri javoblar TEST OXIRIDA).
// Server: modules/mat_bank.py. Formulalar KaTeX bilan; telefon uchun mo'ljallangan (katta tugmalar, formula yon tomonga aylanadi).
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import MatMatn, { RasmKonteksti, SavolMatn, VariantMatn } from "./MatMatn.jsx";
import Pasport from "../pasport/Pasport.jsx";   // REV560
import KabuBot from "../kabubot/KabuBot.jsx";   // REV561
import { BAHO_RANGI, HARFLAR, QIYINLIK_NOMI, mavzuQidir, mavzuUlushi, natijaDarajasi } from "./matMatn.js";
import { SONLAR, matFetch } from "./matBankApi.js";
import "./matbank.css";

const Yuklanmoqda = () => <p className="mb-bosh" role="status">⏳ {__kbUi("Yuklanmoqda…")}</p>;
const Xato = ({ x, qayta }) => <div className="mb-xato" role="alert"><p>⚠️ {__kbUi(x)}</p>{qayta && <button type="button" className="mb-btn" onClick={qayta}>↻ {__kbUi("Qayta urinish")}</button>}</div>;

/* ───────────── mavzular ro'yxati ───────────── */
function Royxat({ apiBase, token, onMavzu, onAralash, onClose, onPasport, onBot }) {
  const [d, setD] = useState(null); const [men, setMen] = useState({}); const [xato, setXato] = useState(""); const [q, setQ] = useState(""); const [soni, setSoni] = useState(10);
  const yukla = useCallback(() => { setXato(""); setD(null);
    matFetch(apiBase, token, "/api/matbank/mavzular").then(setD).catch((e) => setXato(e.message));
    matFetch(apiBase, token, "/api/matbank/mening").then((r) => setMen(Object.fromEntries((r.mavzular || []).map((m) => [m.mavzu, m])))).catch(() => {}); }, [apiBase, token]);
  useEffect(() => { yukla(); }, [yukla]);
  const korinadi = useMemo(() => (d ? mavzuQidir(d.mavzular, q) : []), [d, q]);
  const jami = d ? d.mavzular.reduce((n, m) => n + m.testlar, 0) : 0;
  return <section className="mb-root">
    <header className="mb-bosh-qator">{onClose && <button type="button" className="mb-btn mb-yengil" onClick={onClose}>← {__kbUi("O‘yinlar")}</button>}
      <div><h2>📘 {__kbUi("Matematika banki")}</h2>{d && <small>{d.mavzular.length} {__kbUi("mavzu")} · {jami} {__kbUi("test")}</small>}</div>
      <span style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}><button type="button" className="mb-btn" onClick={onBot}>🕊️ {__kbUi("Kabu-bot")}</button>
        <button type="button" className="mb-btn" onClick={onPasport}>📊 {__kbUi("Mening pasportim")}</button></span></header>
    {xato ? <Xato x={xato} qayta={yukla} /> : !d ? <Yuklanmoqda /> : <>
      <div className="mb-aralash"><div><b>🎲 {__kbUi("Aralash test")}</b><small>{__kbUi("Hamma mavzudan: avval ko‘rmaganlaringiz, keyin xatolaringiz")}</small></div>
        <label>{__kbUi("Savollar soni")}: <select value={soni} onChange={(e) => setSoni(Number(e.target.value))}>{SONLAR.map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <button type="button" className="mb-btn mb-asosiy" onClick={() => onAralash(soni)}>▶ {__kbUi("Boshlash")}</button></div>
      <input className="mb-qidir" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={__kbUi("Mavzuni qidiring: nomi yoki raqami")} aria-label={__kbUi("Mavzuni qidirish")} />
      {!korinadi.length && <p className="mb-bosh">{__kbUi("Bunday mavzu topilmadi.")}</p>}
      <ul className="mb-royxat">{korinadi.map((m) => { const u = mavzuUlushi(m, men);
        return <li key={m.raqam}><button type="button" className="mb-mavzu" onClick={() => onMavzu(m.raqam)} disabled={!m.testlar && !m.misol}>
          <span className="mb-raqam">{m.raqam}</span><span className="mb-nom"><b>{m.nom}</b><small>{m.kitob ? `${m.kitob} · ` : ""}{m.testlar ? `${m.testlar} ${__kbUi("test")}` : __kbUi("testlar yo‘q")}</small>
            {m.testlar > 0 && <i className="mb-yolak" aria-hidden="true"><b style={{ width: `${u}%` }} /></i>}</span>
          {men[m.raqam] && <span className="mb-ulush">{u}%</span>}</button></li>; })}</ul></>}
  </section>;
}

/* ───────────── mavzu sahifasi ───────────── */
function Mavzu({ apiBase, token, raqam, onOrqaga, onTest }) {
  const [m, setM] = useState(null); const [xato, setXato] = useState(""); const [tab, setTab] = useState(""); const [soni, setSoni] = useState(10);
  useEffect(() => { setM(null); setXato(""); matFetch(apiBase, token, `/api/matbank/mavzu/${raqam}`).then((r) => { setM(r); setTab(r.qoida?.trim() ? "qoida" : r.namunalar?.length ? "misol" : "test"); }).catch((e) => setXato(e.message)); }, [apiBase, token, raqam]);
  if (xato) return <section className="mb-root"><button type="button" className="mb-btn mb-yengil" onClick={onOrqaga}>← {__kbUi("Mavzular")}</button><Xato x={xato} /></section>;
  if (!m) return <section className="mb-root"><Yuklanmoqda /></section>;
  const tablar = [...(m.qoida?.trim() ? [["qoida", `📖 ${__kbUi("Qoida")}`]] : []), ...(m.namunalar.length ? [["misol", `✏️ ${__kbUi("Misollar")} (${m.namunalar.length})`]] : []), ["test", `📝 ${__kbUi("Test")}`]];
  return <section className="mb-root">
    <header className="mb-bosh-qator"><button type="button" className="mb-btn mb-yengil" onClick={onOrqaga}>← {__kbUi("Mavzular")}</button>
      <div><h2>{m.raqam}. {m.nom}</h2><small>{m.kitob ? `${__kbUi("Kitob")}: ${m.kitob} · ` : ""}{m.testlar} {__kbUi("test")}</small></div></header>
    <nav className="mb-tablar" role="tablist">{tablar.map(([k, n]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "is-on" : ""} onClick={() => setTab(k)}>{n}</button>)}</nav>
    {tab === "qoida" && <article className="mb-karta"><MatMatn matn={m.qoida} /></article>}
    {tab === "misol" && m.namunalar.map((x, i) => <article key={i} className="mb-karta"><h5 className="mb-sar">{__kbUi("Misol")} {i + 1}{m.misollar?.[i] && <small className="mb-tur"> · TUR {m.misollar[i].tur} · {m.misollar[i].tip === "QISQA" ? __kbUi("qisqa") : __kbUi("to‘liq")}</small>}</h5><MatMatn matn={x} /></article>)}
    {tab === "test" && <article className="mb-karta mb-testboshi">
      {m.testlar ? <>
        <p>{m.meniki.ko_rilgan ? <>{__kbUi("Siz")} {m.meniki.ko_rilgan} / {m.testlar} {__kbUi("savolni ko‘rgansiz")}; {__kbUi("oxirgi urinishda to‘g‘ri")}: <b>{m.meniki.oxirgi_togri}</b>.</> : __kbUi("Bu mavzuda hali test yechmagansiz.")}</p>
        <p className="mb-izoh">{__kbUi("Avval ko‘rmagan savollaringiz beriladi, keyin xato qilganlaringiz. To‘g‘ri javoblar test oxirida ko‘rsatiladi.")}</p>
        <label>{__kbUi("Savollar soni")}: <select value={soni} onChange={(e) => setSoni(Number(e.target.value))}>{SONLAR.filter((n) => n <= Math.max(10, m.testlar)).map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <button type="button" className="mb-btn mb-asosiy" onClick={() => onTest([m.raqam], soni)}>▶ {__kbUi("Testni boshlash")}</button></>
        : <p className="mb-bosh">{__kbUi("Bu mavzu uchun test hali qo‘shilmagan.")}</p>}
    </article>}
  </section>;
}

/* ───────────── test yechish ───────────── */
function TestYechish({ apiBase, token, mavzular, soni, onTugadi, onChiq }) {
  const [sav, setSav] = useState(null); const [xato, setXato] = useState(""); const [i, setI] = useState(0); const [jav, setJav] = useState({}); const [yub, setYub] = useState(false);
  const yukla = useCallback(() => { setSav(null); setXato(""); setI(0); setJav({});
    matFetch(apiBase, token, "/api/matbank/test", { params: { soni, ...(mavzular?.length ? { mavzu: mavzular.join(",") } : {}) } }).then((r) => setSav(r.savollar)).catch((e) => setXato(e.message)); }, [apiBase, token, mavzular, soni]);
  useEffect(() => { yukla(); }, [yukla]);
  const tanla = useCallback((h) => { if (sav) setJav((j) => ({ ...j, [sav[i].id]: j[sav[i].id] === h ? "" : h })); }, [sav, i]);
  const tugat = async () => {
    const bosh = sav.filter((s) => !jav[s.id]).length;
    if (bosh && !window.confirm(`${bosh} ${__kbUi("ta savolga javob berilmadi. Baribir tugatilsinmi?")}`)) return;
    setYub(true); setXato("");
    try { const r = await matFetch(apiBase, token, "/api/matbank/tekshir", { method: "POST", body: { javoblar: Object.fromEntries(sav.map((s) => [s.id, jav[s.id] || ""])) } }); onTugadi(sav, jav, r); }
    catch (e) { setXato(e.message); setYub(false); }
  };
  useEffect(() => {   // kompyuter klaviaturasi: A–E / 1–5 — tanlash, ← → — o'tish
    const h = (e) => { if (!sav || e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target?.tagName || "")) return;
      const k = e.key.toUpperCase(); const x = HARFLAR.indexOf(k) >= 0 ? k : /^[1-5]$/.test(k) ? HARFLAR[Number(k) - 1] : "";
      if (x) { e.preventDefault(); tanla(x); } else if (e.key === "ArrowRight") setI((n) => Math.min(sav.length - 1, n + 1)); else if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1)); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [sav, tanla]);
  const topRef = useRef(null); useEffect(() => { topRef.current?.scrollIntoView?.({ block: "start" }); }, [i]);
  if (xato && !sav) return <section className="mb-root"><button type="button" className="mb-btn mb-yengil" onClick={onChiq}>← {__kbUi("Orqaga")}</button><Xato x={xato} qayta={yukla} /></section>;
  if (!sav) return <section className="mb-root"><Yuklanmoqda /></section>;
  const s = sav[i]; const javobBerilgan = sav.filter((x) => jav[x.id]).length;
  return <section className="mb-root mb-test" ref={topRef}>
    <header className="mb-test-bosh"><button type="button" className="mb-btn mb-yengil" onClick={() => { if (!javobBerilgan || window.confirm(__kbUi("Testdan chiqilsinmi? Javoblaringiz saqlanmaydi."))) onChiq(); }}>✕ {__kbUi("Chiqish")}</button>
      <b>{i + 1} / {sav.length}</b><span className="mb-muted">{javobBerilgan} {__kbUi("ta javob")}</span></header>
    <i className="mb-yolak mb-yolak-katta" aria-hidden="true"><b style={{ width: `${(100 * javobBerilgan) / sav.length}%` }} /></i>
    <nav className="mb-nuqtalar" aria-label={__kbUi("Savollar")}>{sav.map((x, k) => <button key={x.id} type="button" className={`${k === i ? "is-hozir" : ""} ${jav[x.id] ? "is-javob" : ""}`} onClick={() => setI(k)} aria-label={`${k + 1}-${__kbUi("savol")}`} aria-current={k === i}>{k + 1}</button>)}</nav>
    <article className="mb-karta mb-savol-karta">
      <p className="mb-manba">{s.manba && `(${s.manba})`}</p>
      <SavolMatn matn={s.savol} />
      <div className="mb-variantlar" role="radiogroup" aria-label={__kbUi("Javob variantlari")}>{s.variantlar.map((v, k) => <button key={k} type="button" role="radio" aria-checked={jav[s.id] === HARFLAR[k]}
        className={`mb-variant ${jav[s.id] === HARFLAR[k] ? "is-on" : ""}`} onClick={() => tanla(HARFLAR[k])}><span className="mb-harf">{HARFLAR[k]}</span><VariantMatn matn={v} /></button>)}</div>
    </article>
    {xato && <p className="mb-xato-q" role="alert">⚠️ {__kbUi(xato)}</p>}
    <footer className="mb-test-past">
      <button type="button" className="mb-btn" disabled={i === 0} onClick={() => setI(i - 1)}>← {__kbUi("Oldingi")}</button>
      {i < sav.length - 1 ? <button type="button" className="mb-btn mb-asosiy" onClick={() => setI(i + 1)}>{__kbUi("Keyingi")} →</button>
        : <button type="button" className="mb-btn mb-asosiy" disabled={yub} onClick={tugat}>{yub ? "…" : `✓ ${__kbUi("Tugatish")}`}</button>}
    </footer>
    {i < sav.length - 1 && javobBerilgan > 0 && <p className="mb-tugat-havola"><button type="button" className="mb-link" disabled={yub} onClick={tugat}>{__kbUi("Hozir tugatish va natijani ko‘rish")}</button></p>}
  </section>;
}

/* ───────────── natija ───────────── */
function Natija({ sav, jav, r, onYana, onMavzu, onRoyxat }) {
  const d = Object.fromEntries(r.natija.map((x) => [x.id, x])); const [ochiq, setOchiq] = useState(() => { const x = sav.findIndex((s) => !d[s.id]?.togri); return x < 0 ? -1 : x; });
  const javobsiz = sav.filter((s) => !jav[s.id]).length;
  return <section className="mb-root">
    <div className={`mb-ball ${r.foiz >= 70 ? "is-yaxshi" : r.foiz >= 50 ? "is-orta" : "is-past"}`}>
      <div className="mb-ball-qator">
        <div className="mb-baho" style={{ "--b": r.baho ? BAHO_RANGI[r.baho] : "#8a94a3" }} role="img" aria-label={`${__kbUi("Baho")}: ${r.baho || __kbUi("yetmadi")}`}><b>{r.baho || "—"}</b><small>{__kbUi("baho")}</small></div>
        <div className="mb-ball-son"><b>{r.togri} / {r.jami}</b><span>{r.foiz}% · {__kbUi(natijaDarajasi(r.foiz))}</span></div>
      </div>
      <small>{r.baho ? __kbUi("Taxminiy baho: test foizi Milliy sertifikat shkalasiga qo‘yildi (rasmiy ball boshqacha hisoblanadi).") : __kbUi("C darajasiga yetmadi (kamida 46% kerak). Yana urinib ko‘ring!")}</small>
      {r.qiyinlik && <small>{__kbUi("Test qiyinligi")}: <b>{__kbUi(QIYINLIK_NOMI[{ oson: "O", "o'rta": "R", qiyin: "Q" }[r.qiyinlik.daraja]] || r.qiyinlik.daraja)}</b> · {__kbUi("oson")} {r.qiyinlik.taqsimot.O} · {__kbUi("o‘rta")} {r.qiyinlik.taqsimot.R} · {__kbUi("qiyin")} {r.qiyinlik.taqsimot.Q}</small>}
      {javobsiz > 0 && <small>{javobsiz} {__kbUi("ta savolga javob berilmadi")}</small>}
      <details className="mb-shkala"><summary>{__kbUi("Baho shkalasi")}</summary><ul>{[["A+", "70"], ["A", "65"], ["B+", "60"], ["B", "55"], ["C+", "50"], ["C", "46"]].map(([h, c]) => <li key={h} className={r.baho === h ? "is-on" : ""}><b style={{ color: BAHO_RANGI[h] }}>{h}</b> — {c}% {__kbUi("va yuqori")}</li>)}</ul></details>
    </div>
    <h4 className="mb-sar">{__kbUi("Savollar va to‘g‘ri javoblar")}</h4>
    <ol className="mb-nat-royxat">{sav.map((s, k) => { const x = d[s.id]; const holat = !jav[s.id] ? "bosh" : x.togri ? "togri" : "xato";
      return <li key={s.id} className={`mb-nat is-${holat}`}>
        <button type="button" className="mb-nat-bosh" aria-expanded={ochiq === k} onClick={() => setOchiq(ochiq === k ? -1 : k)}>
          <span className="mb-nat-n">{k + 1}</span><span className="mb-nat-belgi" aria-hidden="true">{holat === "togri" ? "✓" : holat === "xato" ? "✗" : "–"}</span>
          <span className="mb-nat-matn">{holat === "bosh" ? __kbUi("Javob berilmadi") : `${__kbUi("Siz")}: ${jav[s.id]}`}{holat !== "togri" && <> · {__kbUi("To‘g‘ri")}: <b>{x.javob}</b></>}</span><span aria-hidden="true">{ochiq === k ? "▾" : "▸"}</span></button>
        {ochiq === k && <div className="mb-nat-ich">{(s.manba || x.qiyinlik) && <p className="mb-manba">{s.manba && `(${s.manba})`}{x.qiyinlik && ` · ${__kbUi(QIYINLIK_NOMI[x.qiyinlik])}`}{s.tur ? ` · TUR ${s.tur}` : ""}</p>}<SavolMatn matn={s.savol} />
          <div className="mb-variantlar">{s.variantlar.map((v, q) => <div key={q} className={`mb-variant mb-ko-variant ${HARFLAR[q] === x.javob ? "is-togri" : ""} ${HARFLAR[q] === jav[s.id] && HARFLAR[q] !== x.javob ? "is-xato" : ""}`}>
            <span className="mb-harf">{HARFLAR[q]}</span><VariantMatn matn={v} /></div>)}</div>
          {x.yechim ? <div className="mb-yechim"><h5 className="mb-sar">💡 {__kbUi("Yechim")}</h5><MatMatn matn={x.yechim} /></div> : <p className="mb-muted">{__kbUi("Bu savol uchun yechim yo‘li hali qo‘shilmagan; to‘g‘ri javob yuqorida.")}</p>}</div>}
      </li>; })}</ol>
    <div className="mb-natija-tugmalar">
      <button type="button" className="mb-btn mb-asosiy" onClick={onYana}>🔁 {__kbUi("Yana test (xatolar avval)")}</button>
      {onMavzu && <button type="button" className="mb-btn" onClick={onMavzu}>📖 {__kbUi("Mavzuga qaytish")}</button>}
      <button type="button" className="mb-btn mb-yengil" onClick={onRoyxat}>☰ {__kbUi("Barcha mavzular")}</button></div>
  </section>;
}

/** Bosh komponent: ro'yxat → mavzu → test → natija. onClose — «O'yinlar» sahifasiga qaytish. */
export default function MatBank(props) {
  return <RasmKonteksti.Provider value={{ apiBase: props.apiBase || "", token: props.token }}><MatBankIchki {...props} /></RasmKonteksti.Provider>;
}

function MatBankIchki({ apiBase = "", token, onClose }) {
  useKbInterfaceLocale();
  const [ekran, setEkran] = useState({ t: "royxat" });
  const royxat = () => setEkran({ t: "royxat" });
  if (ekran.t === "bot") return <KabuBot apiBase={apiBase} token={token} rol="oquvchi" onYop={royxat}
    onTest={(mavzular) => setEkran({ t: "test", mavzular, soni: 10, n: Date.now(), kim: mavzular?.[0] || 0 })} onMavzu={(raqam) => setEkran({ t: "mavzu", raqam })} />;
  if (ekran.t === "pasport") return <Pasport apiBase={apiBase} token={token} onYop={royxat} onTest={(raqam) => setEkran({ t: "test", mavzular: [raqam], soni: 10, n: Date.now(), kim: raqam })} />;
  if (ekran.t === "mavzu") return <Mavzu apiBase={apiBase} token={token} raqam={ekran.raqam} onOrqaga={royxat} onTest={(mavzular, soni) => setEkran({ t: "test", mavzular, soni, n: Date.now(), kim: ekran.raqam })} />;
  if (ekran.t === "test") return <TestYechish key={ekran.n} apiBase={apiBase} token={token} mavzular={ekran.mavzular} soni={ekran.soni} onChiq={() => (ekran.kim ? setEkran({ t: "mavzu", raqam: ekran.kim }) : royxat())}
    onTugadi={(sav, jav, r) => setEkran({ t: "natija", sav, jav, r, mavzular: ekran.mavzular, soni: ekran.soni, kim: ekran.kim })} />;
  if (ekran.t === "natija") return <Natija sav={ekran.sav} jav={ekran.jav} r={ekran.r} onYana={() => setEkran({ t: "test", mavzular: ekran.mavzular, soni: ekran.soni, n: Date.now(), kim: ekran.kim })}
    onMavzu={ekran.kim ? () => setEkran({ t: "mavzu", raqam: ekran.kim }) : null} onRoyxat={royxat} />;
  return <Royxat apiBase={apiBase} token={token} onClose={onClose} onPasport={() => setEkran({ t: "pasport" })} onBot={() => setEkran({ t: "bot" })} onMavzu={(raqam) => setEkran({ t: "mavzu", raqam })} onAralash={(soni) => setEkran({ t: "test", mavzular: [], soni, n: Date.now(), kim: 0 })} />;
}
