// REV278: Milliy sertifikat uslubidagi sinov (mini): Listening (har audio 2 marta), Reading, Writing (so'z hisoblagich), Speaking (mikrofon);
// har bo'lim vaqt bilan; natija 0–75 shkalada, daraja (B1/B2/C1), xatolar va keyingi darajaga yo'l.
import React, { useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

const BOLIMLAR_MINI = [["listening", "🎧 Listening", 15], ["reading", "📖 Reading", 20], ["writing", "✍️ Writing", 40], ["speaking", "🗣 Speaking", 10]];
const BOLIMLAR_TOLIQ = [["listening", "🎧 Listening", 45], ["reading", "📖 Reading", 60], ["writing", "✍️ Writing", 60], ["speaking", "🗣 Speaking", 15]];

export default function SinovImtihon({ k, base, token, onYop }) {
  const [turi, setTuri] = useState("");   // "" — tanlash; mini | toliq
  const BOLIMLAR = turi === "toliq" ? BOLIMLAR_TOLIQ : BOLIMLAR_MINI;
  const [s, setS] = useState(null); const [bolim, setBolim] = useState("listening"); const [javob, setJavob] = useState({}); const [matn, setMatn] = useState({});
  const [natija, setNatija] = useState({}); const [band, setBand] = useState(""); const [xato, setXato] = useState("");
  const iz = (() => { const t = String(document.documentElement.lang || "uz").slice(0, 2); return ["ru", "en"].includes(t) ? t : "uz"; })();
  useEffect(() => { if (!turi) return; setS(null); setJavob({}); setNatija({});
    fetch(`${base}/api/markaz/sinov?${new URLSearchParams({ token, turi })}`).then((r) => (r.ok ? r.json() : Promise.reject())).then(setS).catch(() => setXato(__kbUi("Sinov yuklanmadi"))); }, [turi]); // eslint-disable-line
  const post = async (url, body) => { const r = await fetch(`${base}${url}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, yozilish_id: k.id, ...body }) }); const d = await r.json(); if (!r.ok) throw new Error(d.detail || r.status); return d; };
  const obyektiv = async () => { setBand("lr"); setXato(""); try { const d = await post("/api/markaz/sinov/obyektiv", { javoblar: javob, turi }); setNatija((n) => ({ ...n, listening: d.listening, reading: d.reading })); } catch (e) { setXato(e.message); } finally { setBand(""); } };
  const matnli = async (b) => { setBand(b); setXato(""); try { const d = await post("/api/markaz/sinov/matn", { bolim: b, javoblar: matn, iz }); setNatija((n) => ({ ...n, [b]: d })); } catch (e) { setXato(e.message); } finally { setBand(""); } };
  return <div className="mk-test" role="dialog" aria-modal="true" aria-label={__kbUi("Sinov imtihoni")}>
    <div className="mk-test-ich mk-sinov">
      <button type="button" className="mk-yop" onClick={onYop} aria-label={__kbUi("Yopish")}>✕</button>
      <h3>📋 {__kbUi("Sinov imtihoni")} — {turi === "toliq" ? __kbUi("Milliy sertifikat uslubida (to‘liq)") : __kbUi("Milliy sertifikat uslubida (qisqa)")}</h3>
      {!turi && <div className="mk-tanlov">
        <button type="button" className="mk-karta" onClick={() => setTuri("mini")}><span className="mk-e">⚡</span><b>{__kbUi("Qisqa sinov")}</b><small>{__kbUi("10 + 10 savol, yozish va gapirish — taxminan 1,5 soat")}</small></button>
        <button type="button" className="mk-karta" onClick={() => setTuri("toliq")}><span className="mk-e">🏁</span><b>{__kbUi("To‘liq sinov")}</b><small>{__kbUi("Imtihondagi kabi: Listening 35, Reading 35, Writing 2, Speaking 3 — taxminan 3 soat")}</small></button>
      </div>}
      <p className="mk-izoh">{s?.shkala} · {__kbUi("Bu rasmiy imtihon emas — tayyorgarlik darajangizni ko‘rsatadi.")}</p>
      {turi && <div className="mk-chiplar">{BOLIMLAR.map(([b, n, daq]) => <button key={b} type="button" className={`mk-chip ${bolim === b ? "is-on" : ""}`} onClick={() => setBolim(b)}>{n} · {daq} {__kbUi("daq")}{natija[b] ? ` ✓ ${natija[b].ball}/75` : ""}</button>)}</div>}
      {xato && <p className="mk-xato" role="alert">{xato}</p>}
      {turi && !s && !xato && <p role="status">{__kbUi("Yuklanmoqda…")}</p>}
      {turi && s && <>
        <Taymer key={bolim} daqiqa={BOLIMLAR.find((x) => x[0] === bolim)[2]} />
        {bolim === "listening" && <>{s.listening.map((b) => (b.qism ? <QismBlok key={b.id} b={b} base={base} javob={javob} setJavob={setJavob} audio /> : <Audio2 key={b.id} b={b} base={base} javob={javob} setJavob={setJavob} />))}</>}
        {bolim === "reading" && <>{s.reading.map((b) => (b.qism ? <QismBlok key={b.id} b={b} base={base} javob={javob} setJavob={setJavob} /> : <div key={b.id} className="mk-blok"><h4 lang="en">{b.sarlavha}</h4><p className="mk-oqish" lang="en">{b.matn}</p>
          {b.savollar.map((q) => <Savol key={q.id} q={q} javob={javob} setJavob={setJavob} />)}</div>))}</>}
        {(bolim === "listening" || bolim === "reading") && <button type="button" className="mk-btn" disabled={band === "lr"} onClick={obyektiv}>{band === "lr" ? "…" : __kbUi("Listening va Reading’ni tekshirish")}</button>}
        {bolim === "writing" && <>{s.writing.map((t) => { const n = String(matn[t.id] || "").trim().split(/\s+/).filter(Boolean).length; return <div key={t.id} className="mk-blok">
          <h4>{t.nom} · {t.soz} {__kbUi("so‘z")}</h4><p lang="en">{t.topshiriq}</p>
          <textarea className="mk-input mk-matn" lang="en" rows={8} spellCheck={false} value={matn[t.id] || ""} onChange={(e) => setMatn((m) => ({ ...m, [t.id]: e.target.value }))} />
          <small className="mk-izoh">{n} {__kbUi("so‘z")}</small></div>; })}
          <button type="button" className="mk-btn" disabled={band === "writing"} onClick={() => matnli("writing")}>{band === "writing" ? __kbUi("Imtihonchi baholamoqda…") : __kbUi("Writing’ni baholash")}</button></>}
        {bolim === "speaking" && <>{s.speaking.map((t) => <Gapir key={t.id} t={t} matn={matn} setMatn={setMatn} />)}
          <button type="button" className="mk-btn" disabled={band === "speaking"} onClick={() => matnli("speaking")}>{band === "speaking" ? __kbUi("Imtihonchi baholamoqda…") : __kbUi("Speaking’ni baholash")}</button></>}
        {natija[bolim] && <Hisobot n={natija[bolim]} />}
        {Object.keys(natija).length === 4 && <Umumiy natija={natija} />}
      </>}
    </div>
  </div>;
}

function Taymer({ daqiqa }) {
  const [q, setQ] = useState(daqiqa * 60);
  useEffect(() => { const t = setInterval(() => setQ((x) => Math.max(0, x - 1)), 1000); return () => clearInterval(t); }, []);
  return <p className={`mk-taymer ${q < 60 ? "is-oz" : ""}`}>⏱ {Math.floor(q / 60)}:{String(q % 60).padStart(2, "0")}</p>;
}

function Savol({ q, javob, setJavob }) {
  if (q.tur === "yozish") return <div className="mk-savol"><label lang="en"><b>{q.savol}</b>{" "}
    <input className="mk-input mk-qisqa" lang="en" autoCapitalize="off" spellCheck={false} value={javob[q.id] || ""} onChange={(e) => setJavob((j) => ({ ...j, [q.id]: e.target.value }))} /></label></div>;
  return <div className="mk-savol"><p lang="en"><b>{q.savol}</b></p><div className="mk-chiplar">
    {q.variantlar.map((v, n) => <button key={n} type="button" lang="en" className={`mk-chip ${String(javob[q.id]) === String(n) ? "is-on" : ""}`} onClick={() => setJavob((j) => ({ ...j, [q.id]: n }))}>{"ABC"[n]}) {v}</button>)}</div></div>;
}

function Audio2({ b, base, javob, setJavob }) {
  const [qoldi, setQoldi] = useState(2); const a = useRef(null);
  useEffect(() => () => a.current?.pause(), []);
  const ijro = () => { if (qoldi <= 0) return; a.current?.pause(); a.current = new Audio(`${base}/api/ovoz?k=133&${new URLSearchParams({ matn: `[en]${b.matn}[/en]`, jins: "qiz" })}`); a.current.play().catch(() => {}); setQoldi((x) => x - 1); };
  return <div className="mk-blok"><button type="button" className="mk-btn" onClick={ijro} disabled={qoldi <= 0}>🔊 {__kbUi("Tinglash")} ({qoldi} {__kbUi("marta qoldi")})</button>
    {b.savollar.map((q) => <Savol key={q.id} q={q} javob={javob} setJavob={setJavob} />)}</div>;
}

function Gapir({ t, matn, setMatn }) {
  const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const [eshit, setEshit] = useState(false); const r = useRef(null);
  const boshla = () => { if (!SR) return; const x = new SR(); r.current = x; x.lang = "en-US"; x.continuous = true; x.interimResults = false;
    x.onresult = (e) => { const yangi = Array.from(e.results).slice(e.resultIndex).map((y) => y[0].transcript).join(" "); setMatn((m) => ({ ...m, [t.id]: `${m[t.id] || ""} ${yangi}`.trim() })); };
    x.onend = () => setEshit(false); setEshit(true); x.start(); };
  const toxta = () => { try { r.current?.stop(); } catch { /* */ } };
  return <div className="mk-blok"><h4>{t.nom}</h4>{t.savollar.map((q, n) => <p key={n} lang="en">• {q}</p>)}
    {SR ? <div className="mk-amal"><button type="button" className={`mk-btn ${eshit ? "is-eshit" : ""}`} onClick={eshit ? toxta : boshla}>{eshit ? "⏹ " + __kbUi("To‘xtatish") : "🎤 " + __kbUi("Gapirish")}</button></div>
      : <p className="mk-xato">{__kbUi("Mikrofon bilan gapirish uchun Chrome yoki Edge kerak — hozircha javobni yozing.")}</p>}
    <textarea className="mk-input mk-matn" lang="en" rows={3} value={matn[t.id] || ""} onChange={(e) => setMatn((m) => ({ ...m, [t.id]: e.target.value }))} placeholder={__kbUi("Aytganingiz shu yerda yoziladi…")} /></div>;
}

function Hisobot({ n }) {
  return <div className="mk-natija"><h3>{n.ball}/75 · {n.daraja}{n.togri != null ? ` · ${n.togri}/${n.jami}` : ""}</h3>
    {n.mezonlar?.length > 0 && <ul>{n.mezonlar.map((m, i) => <li key={i}><b>{m.nom}:</b> {m.baho}</li>)}</ul>}
    {n.xatolar?.length > 0 && <ul className="mk-xatolar">{n.xatolar.map((x, i) => x.asl ? <li key={i}><s lang="en">{x.asl}</s> → <b lang="en">{x.togri}</b>{x.izoh ? ` — ${x.izoh}` : ""}</li>
      : <li key={i}><span lang="en">{x.savol}</span> → <b lang="en">{x.togri}</b></li>)}</ul>}
    {n.kuchli && <p>👍 {n.kuchli}</p>}{n.oshirish && <p>📈 {n.oshirish}</p>}</div>;
}

function Umumiy({ natija }) {
  const b = ["listening", "reading", "writing", "speaking"].map((x) => natija[x].ball); const ort = Math.round(b.reduce((a, x) => a + x, 0) / 4);
  const zaif = ["Listening", "Reading", "Writing", "Speaking"][b.indexOf(Math.min(...b))];
  return <div className="mk-natija mk-umumiy"><h3>🏁 {__kbUi("Umumiy")}: {ort}/75 · {ort >= 65 ? "C1" : ort >= 51 ? "B2" : ort >= 38 ? "B1" : __kbUi("B1 dan past")}</h3>
    <p>{__kbUi("Eng zaif bo‘lim")}: <b>{zaif}</b> — {__kbUi("keyingi haftalarda shu bo‘limga ko‘proq mashq beriladi.")}</p></div>;
}

// REV280: to'liq sinov qismi — ko'rsatma, (Listening) audio(lar) — har biri 2 marta, (Reading) matn, sarlavhalar ro'yxati, savollar
function Ijro({ matn, base }) {
  const [qoldi, setQoldi] = useState(2); const a = useRef(null);
  useEffect(() => () => a.current?.pause(), []);
  const ijro = () => { if (qoldi <= 0) return; a.current?.pause(); a.current = new Audio(`${base}/api/ovoz?k=133&${new URLSearchParams({ matn: `[en]${matn}[/en]`, jins: "qiz" })}`); a.current.play().catch(() => {}); setQoldi((x) => x - 1); };
  return <button type="button" className="mk-btn" onClick={ijro} disabled={qoldi <= 0}>🔊 {__kbUi("Tinglash")} ({qoldi} {__kbUi("marta qoldi")})</button>;
}
function QismBlok({ b, base, javob, setJavob, audio = false }) {
  return <div className="mk-blok">
    <h4 lang="en">{b.qism}</h4><p className="mk-izoh" lang="en">{b.izoh}</p>
    {audio && b.matn && <Ijro matn={b.matn} base={base} />}
    {!audio && b.matn && <p className="mk-oqish" lang="en">{b.matn}</p>}
    {b.sarlavhalar && <p className="mk-izoh" lang="en">{b.sarlavhalar.map((h, i) => `${i + 1}. ${h}`).join(" · ")}</p>}
    {(b.audio || []).map((x, i) => <div key={x.savol.id} className="mk-savol">{audio && <Ijro matn={x.matn} base={base} />}<Savol q={x.savol} javob={javob} setJavob={setJavob} /></div>)}
    {(b.savollar || []).map((q) => <Savol key={q.id} q={q} javob={javob} setJavob={setJavob} />)}
  </div>;
}
