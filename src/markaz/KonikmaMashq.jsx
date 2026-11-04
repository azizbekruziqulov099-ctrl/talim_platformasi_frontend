// REV275: 4 ko'nikma mashqlari — 🎧 tinglab tushunish (sekin/odatiy tezlik), ✍️ diktant (eshitganini yozish, so'zma-so'z tahlil),
// 🗣 gapirish (mikrofon — nutqni aniqlash, har so'zga baho). Natija markaz faolligiga yoziladi (tinglash/diktant/gapirish).
import React, { useEffect, useMemo, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { gapSolishtir, sozlarNorm } from "./konikmaRules.js";
import { RASM_HAMMA } from "../kid/darsRasm.js";
import { emojiRasm, matnId } from "../kid/rasmHarakat.js";
import { KURS_DARAJALAR, boshDaraja } from "./MarkazPanel.jsx";

// REV283: so'z rasmi — sayt kutubxonasidan (avval so'z, keyin belgi bo'yicha); topilmasa belgi o'zi
function sozRasm(soz, emoji) {
  const mt = matnId(soz); if (mt && RASM_HAMMA[mt]) return RASM_HAMMA[mt];
  return emojiRasm(emoji, RASM_HAMMA, soz)?.src || "";
}

const TURLAR = [["tinglash", "🎧", "Tinglab tushunish"], ["diktant", "✍️", "Diktant"], ["gapirish", "🗣", "Gapirish"], ["suhbat", "💬", "Jonli suhbat"], ["yozish", "📝", "Yozish"]];

export default function KonikmaMashq({ k, base, token, onYop }) {
  const [dars, setDars] = useState(1);
  const [daraja, setDaraja] = useState(boshDaraja(k.daraja));
  const [m, setM] = useState(null);
  const [tur, setTur] = useState("tinglash");
  const [xato, setXato] = useState("");
  const iz = (() => { const t = String(document.documentElement.lang || "uz").slice(0, 2); return ["ru", "en", "de", "es"].includes(t) ? t : "uz"; })();
  useEffect(() => {
    setM(null);
    fetch(`${base}/api/markaz/mashq?${new URLSearchParams({ til: k.til, daraja, dars: String(dars), iz })}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status))).then(setM).catch(() => setXato(__kbUi("Mashqlar yuklanmadi")));
  }, [dars, daraja]); // eslint-disable-line react-hooks/exhaustive-deps
  const yoz = (turi, foiz) => fetch(`${base}/api/markaz/faollik`, { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, yozilish_id: k.id, turi, dars_kodi: `${daraja}-${dars}`, daqiqa: 3, foiz }) }).catch(() => {});
  return <KursTil.Provider value={k.til || "en"}><div className="mk-test" role="dialog" aria-modal="true" aria-label={__kbUi("Ko‘nikma mashqlari")}>
    <div className="mk-test-ich mk-konikma">
      <button type="button" className="mk-yop" onClick={onYop} aria-label={__kbUi("Yopish")}>✕</button>
      <h3>{__kbUi("Ko‘nikma mashqlari")}{m ? ` — ${dars}. ${m.nom}` : ""}</h3>
      {xato && <p className="mk-xato" role="alert">{xato}</p>}
      {m && <>
        <div className="mk-chiplar">{KURS_DARAJALAR.map((x) => <button key={x} type="button" className={`mk-chip ${daraja === x ? "is-on" : ""}`} onClick={() => { setDaraja(x); setDars(1); }}>{x}</button>)}</div>
        <div className="mk-chiplar">{Array.from({ length: m.darslar_soni }, (_, i) => <button key={i} type="button" className={`mk-chip ${dars === i + 1 ? "is-on" : ""}`} onClick={() => setDars(i + 1)}>{i + 1}</button>)}</div>
        <div className="mk-chiplar mk-turlar">{TURLAR.map(([t, e, n]) => <button key={t} type="button" className={`mk-chip ${tur === t ? "is-on" : ""}`} aria-pressed={tur === t} onClick={() => setTur(t)}>{e} {__kbUi(n)}</button>)}</div>
        {tur === "tinglash" && <Tinglash key={`t${daraja}${dars}`} m={m} base={base} onNatija={(f) => yoz("tinglash", f)} />}
        {tur === "diktant" && <Diktant key={`d${daraja}${dars}`} m={m} base={base} onNatija={(f) => yoz("diktant", f)} />}
        {tur === "gapirish" && <Gapirish key={`g${daraja}${dars}`} m={m} base={base} onNatija={(f) => yoz("gapirish", f)} />}
        {tur === "suhbat" && <Suhbat key={`s${daraja}${dars}`} m={m} k={k} dars={dars} daraja={daraja} iz={iz} base={base} token={token} onNatija={(f) => yoz("suhbat", f)} />}
        {tur === "yozish" && <Yozish key={`y${daraja}${dars}`} m={m} k={k} dars={dars} daraja={daraja} iz={iz} base={base} token={token} />}
      </>}
    </div>
  </div></KursTil.Provider>;
}

// REV289: kurs tili — ovoz tegi va nutqni aniqlash tili shu bo'yicha (ingliz, rus…)
export const SR_TIL = { en: "en-US", ru: "ru-RU", de: "de-DE", fr: "fr-FR", es: "es-ES", tr: "tr-TR", ko: "ko-KR", ja: "ja-JP", zh: "zh-CN", ar: "ar-SA" };
const KursTil = React.createContext("en");
function useOvoz(base) {
  const til = React.useContext(KursTil);
  const a = useRef(null);
  useEffect(() => () => a.current?.pause(), []);
  return (gap, sekin = false) => {
    a.current?.pause();
    const p = new URLSearchParams({ matn: `[${til}]${gap}[/${til}]`, jins: "qiz", ...(sekin ? { tezlik: "-30%" } : {}) });
    a.current = new Audio(`${base}/api/ovoz?k=133&${p}`);
    a.current.play().catch(() => {});
  };
}

function Natija({ ball, jami, onQayta }) {
  const foiz = jami ? Math.round((100 * ball) / jami) : 0;
  return <div className="mk-natija"><h3>{foiz >= 80 ? "🌟" : foiz >= 50 ? "👍" : "🔁"} {ball} / {jami} ({foiz}%)</h3>
    <p>{foiz >= 80 ? __kbUi("Zo‘r! Bu ko‘nikma yaxshi.") : __kbUi("Yana bir marta mashq qiling — har takrorda eshitish va talaffuz yaxshilanadi.")}</p>
    <button type="button" className="mk-btn" onClick={onQayta}>{__kbUi("Qaytadan")}</button></div>;
}

function Tinglash({ m, base, onNatija }) {
  const ovoz = useOvoz(base);
  const [i, setI] = useState(0); const [ball, setBall] = useState(0); const [tanlov, setTanlov] = useState(null); const [tugadi, setTugadi] = useState(false);
  const q = m.tinglash[i];
  useEffect(() => { if (q && !tugadi) ovoz(q.gap); }, [i, tugadi]); // eslint-disable-line react-hooks/exhaustive-deps
  if (tugadi) return <Natija ball={ball} jami={m.tinglash.length} onQayta={() => { setI(0); setBall(0); setTanlov(null); setTugadi(false); }} />;
  const tanla = (n) => { if (tanlov != null) return; setTanlov(n); if (n === q.javob) setBall((b) => b + 1); };
  const keyingi = () => { setTanlov(null); if (i + 1 < m.tinglash.length) setI(i + 1); else { setTugadi(true); onNatija(Math.round((100 * ball) / m.tinglash.length)); } };
  return <div className="mk-mashq">
    <p className="mk-izoh">{__kbUi("Tinglang va qaysi gap aytilganini tanlang. Avval faqat quloq bilan — keyin matn ko‘rsatiladi.")} ({i + 1}/{m.tinglash.length})</p>
    <div className="mk-amal"><button type="button" className="mk-btn" onClick={() => ovoz(q.gap)}>🔊 {__kbUi("Tinglash")}</button>
      <button type="button" className="mk-btn is-ikkinchi" onClick={() => ovoz(q.gap, true)}>🐢 {__kbUi("Sekin")}</button></div>
    <div className="mk-test-var">{q.variantlar.map((v, n) => <button key={n} type="button" lang="en" className={`mk-chip ${tanlov == null ? "" : n === q.javob ? "is-togri" : n === tanlov ? "is-xato" : ""}`} onClick={() => tanla(n)}>{v}</button>)}</div>
    {tanlov != null && <><p className="mk-javob" lang="en"><b>{q.kim}:</b> {q.gap}</p><button type="button" className="mk-btn" onClick={keyingi}>{__kbUi("Keyingi")} →</button></>}
  </div>;
}

function Diktant({ m, base, onNatija }) {
  const ovoz = useOvoz(base);
  const [i, setI] = useState(0); const [matn, setMatn] = useState(""); const [tahlil, setTahlil] = useState(null); const [ball, setBall] = useState(0); const [tugadi, setTugadi] = useState(false);
  const q = m.diktant[i];
  useEffect(() => { if (q && !tugadi) ovoz(q.gap); }, [i, tugadi]); // eslint-disable-line react-hooks/exhaustive-deps
  if (tugadi) return <Natija ball={ball} jami={m.diktant.length} onQayta={() => { setI(0); setBall(0); setTugadi(false); }} />;
  const tekshir = () => { const t = gapSolishtir(q.gap, matn, true); /* diktantda imlo aniq */ setTahlil(t); if (t.foiz >= 80) setBall((b) => b + 1); };
  const keyingi = () => { setTahlil(null); setMatn(""); if (i + 1 < m.diktant.length) setI(i + 1); else { setTugadi(true); onNatija(Math.round((100 * ball) / m.diktant.length)); } };
  return <div className="mk-mashq">
    <div className="mk-diktant-bosh">{sozRasm(q.soz, q.emoji) ? <img className="mk-rasm" src={sozRasm(q.soz, q.emoji)} alt="" /> : <span className="mk-rasm-e" aria-hidden="true">{q.emoji}</span>}
      <p className="mk-izoh">{__kbUi("Eshitgan gapingizni yozing.")} ({i + 1}/{m.diktant.length})</p></div>
    <div className="mk-amal"><button type="button" className="mk-btn" onClick={() => ovoz(q.gap)}>🔊 {__kbUi("Tinglash")}</button>
      <button type="button" className="mk-btn is-ikkinchi" onClick={() => ovoz(q.gap, true)}>🐢 {__kbUi("Sekin")}</button></div>
    <input className="mk-input" lang="en" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={matn} onChange={(e) => setMatn(e.target.value)} disabled={Boolean(tahlil)}
      onKeyDown={(e) => { if (e.key === "Enter" && !tahlil && matn.trim()) tekshir(); }} placeholder={__kbUi("Shu yerga yozing…")} />
    {!tahlil ? <button type="button" className="mk-btn" disabled={!matn.trim()} onClick={tekshir}>{__kbUi("Tekshirish")}</button>
      : <><p className="mk-tahlil" lang="en">{tahlil.sozlar.map((s, n) => <span key={n} className={s.ok ? "is-togri" : "is-xato"} title={s.ok ? "" : `${__kbUi("To‘g‘risi")}: ${s.kerak}`}>{s.kerak} </span>)}</p>
        <p className="mk-izoh">{tahlil.foiz}% · {q.soz} — {q.mano}</p>
        <button type="button" className="mk-btn" onClick={keyingi}>{__kbUi("Keyingi")} →</button></>}
  </div>;
}

function Gapirish({ m, base, onNatija }) {
  const ovoz = useOvoz(base); const til = React.useContext(KursTil);
  const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const [i, setI] = useState(0); const [eshit, setEshit] = useState(false); const [tahlil, setTahlil] = useState(null); const [ball, setBall] = useState(0); const [tugadi, setTugadi] = useState(false);
  const q = m.gapirish[i];
  const rec = useRef(null);
  useEffect(() => () => { try { rec.current?.abort(); } catch { /* */ } }, []);
  if (!SR) return <p className="mk-xato">{__kbUi("Bu brauzer nutqni aniqlay olmaydi. Chrome yoki Edge'da oching.")}</p>;
  if (tugadi) return <Natija ball={ball} jami={m.gapirish.length} onQayta={() => { setI(0); setBall(0); setTugadi(false); }} />;
  const boshla = () => {
    setTahlil(null);
    const r = new SR(); rec.current = r; r.lang = SR_TIL[til] || "en-US"; r.interimResults = false; r.maxAlternatives = 3;
    r.onresult = (e) => {
      const alt = Array.from(e.results[0] || []).map((x) => x.transcript);
      const eng = alt.map((x) => gapSolishtir(q.gap, x)).sort((a, b) => b.foiz - a.foiz)[0];
      setTahlil({ ...eng, eshitildi: alt[0] || "" }); if (eng.foiz >= 80) setBall((b) => b + 1);
    };
    r.onerror = () => setEshit(false); r.onend = () => setEshit(false);
    setEshit(true); r.start();
  };
  const keyingi = () => { setTahlil(null); if (i + 1 < m.gapirish.length) setI(i + 1); else { setTugadi(true); onNatija(Math.round((100 * ball) / m.gapirish.length)); } };
  return <div className="mk-mashq">
    <p className="mk-izoh">{__kbUi("Avval tinglang, keyin mikrofonni bosib ayting.")} ({i + 1}/{m.gapirish.length})</p>
    <p className="mk-test-savol" lang="en">{q.gap}</p>
    <div className="mk-amal"><button type="button" className="mk-btn is-ikkinchi" onClick={() => ovoz(q.gap)}>🔊 {__kbUi("Namuna")}</button>
      <button type="button" className={`mk-btn ${eshit ? "is-eshit" : ""}`} onClick={boshla} disabled={eshit}>🎤 {eshit ? __kbUi("Eshityapman…") : __kbUi("Ayting")}</button></div>
    {tahlil && <><p className="mk-tahlil" lang="en">{tahlil.sozlar.map((s, n) => <span key={n} className={s.ok ? "is-togri" : "is-xato"}>{s.kerak} </span>)}</p>
      <p className="mk-izoh">{tahlil.foiz}% · {__kbUi("Eshitildi")}: «{tahlil.eshitildi}» {tahlil.foiz < 80 && "— " + __kbUi("qizil so‘zlarni namunaga quloq solib, qaytadan ayting.")}</p>
      <div className="mk-amal"><button type="button" className="mk-btn is-ikkinchi" onClick={boshla}>🔁 {__kbUi("Qaytadan")}</button><button type="button" className="mk-btn" onClick={keyingi}>{__kbUi("Keyingi")} →</button></div></>}
  </div>;
}

// REV276: jonli suhbat — AI vaziyatdagi odam (ofitsiant, sotuvchi…) rolida; o'quvchi yozadi yoki 🎤 aytadi;
// har xabariga tuzatish (izoh tilida), AI javobi ovozda o'qiladi
function Suhbat({ m, k, dars, daraja = "A1", iz, base, token, onNatija }) {
  const ovoz = useOvoz(base);
  const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const [xab, setXab] = useState([]); const [matn, setMatn] = useState(""); const [band, setBand] = useState(false); const [xato, setXato] = useState(""); const [tugadi, setTugadi] = useState(false); const [eshit, setEshit] = useState(false);
  const pastga = useRef(null);
  const yubor = async (royxat) => {
    setBand(true); setXato("");
    try {
      const r = await fetch(`${base}/api/markaz/suhbat`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, yozilish_id: k.id, dars, daraja, iz, til: k.til, xabarlar: royxat.map((x) => ({ rol: x.rol, matn: x.matn })) }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.detail || r.status);
      const yangi = royxat.map((x, n) => (n === royxat.length - 1 && x.rol === "user" ? { ...x, tuzatish: d.tuzatish, izoh: d.izoh } : x));
      setXab([...yangi, { rol: "ai", kim: d.rol, matn: d.javob }]); ovoz(d.javob);
      if (d.tugadi) { setTugadi(true); const u = yangi.filter((x) => x.rol === "user"); onNatija(u.length ? Math.round((100 * u.filter((x) => !x.tuzatish).length) / u.length) : 0); }
    } catch (e) { setXato(__kbUi(String(e.message || e))); } finally { setBand(false); setTimeout(() => pastga.current?.scrollIntoView({ block: "end" }), 50); }
  };
  useEffect(() => { yubor([]); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const jonat = () => { const t = matn.trim(); if (!t || band) return; setMatn(""); yubor([...xab, { rol: "user", matn: t }]); };
  const ayt = () => { if (!SR) return; const r = new SR(); r.lang = SR_TIL[k.til] || "en-US"; r.onresult = (e) => setMatn(e.results[0][0].transcript); r.onend = () => setEshit(false); setEshit(true); r.start(); };
  return <div className="mk-mashq">
    <p className="mk-izoh">{m.rol.izoh}</p>
    <div className="mk-chat" aria-live="polite">
      {xab.map((x, n) => <div key={n} className={`mk-xab is-${x.rol}`}>
        <p lang="en"><b>{x.rol === "ai" ? x.kim : __kbUi("Siz")}:</b> {x.matn} {x.rol === "ai" && <button type="button" className="mk-mini" onClick={() => ovoz(x.matn)} aria-label={__kbUi("Tinglash")}>🔊</button>}</p>
        {x.tuzatish && <p className="mk-tuzat">✏️ <span lang="en">{x.tuzatish}</span>{x.izoh ? ` — ${x.izoh}` : ""}</p>}
      </div>)}
      {band && <p className="mk-izoh">…</p>}
      <div ref={pastga} />
    </div>
    {xato && <p className="mk-xato" role="alert">{xato}</p>}
    {!tugadi ? <div className="mk-amal">
      <input className="mk-input" lang="en" value={matn} onChange={(e) => setMatn(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") jonat(); }} placeholder={__kbUi("Inglizcha yozing yoki 🎤 bosib ayting…")} disabled={band} />
      {SR && <button type="button" className={`mk-btn is-ikkinchi ${eshit ? "is-eshit" : ""}`} onClick={ayt} disabled={band || eshit}>🎤</button>}
      <button type="button" className="mk-btn" onClick={jonat} disabled={band || !matn.trim()}>{__kbUi("Yuborish")}</button>
    </div> : <div className="mk-natija"><p>🌟 {__kbUi("Suhbat tugadi! Tuzatishlarni yana bir o‘qib chiqing.")}</p><button type="button" className="mk-btn" onClick={() => { setXab([]); setTugadi(false); yubor([]); }}>{__kbUi("Qaytadan")}</button></div>}
  </div>;
}

// REV276: yozish — topshiriq bo'yicha 3–5 gap; AI imtihonchi kabi baholaydi: ball, daraja, har xato (asl → to'g'ri, izoh), namuna
function Yozish({ m, k, dars, daraja = "A1", iz, base, token }) {
  const [matn, setMatn] = useState(""); const [natija, setNatija] = useState(null); const [band, setBand] = useState(false); const [xato, setXato] = useState("");
  const tekshir = async () => {
    setBand(true); setXato("");
    try {
      const r = await fetch(`${base}/api/markaz/yozish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, yozilish_id: k.id, dars, daraja, iz, til: k.til, matn }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.detail || r.status); setNatija(d);
    } catch (e) { setXato(__kbUi(String(e.message || e))); } finally { setBand(false); }
  };
  return <div className="mk-mashq">
    <p className="mk-izoh"><b lang="en">{m.rol.topshiriq}</b><br />{m.rol.izoh} {__kbUi("3–5 ta gap yozing.")}</p>
    <textarea className="mk-input mk-matn" lang="en" rows={5} value={matn} onChange={(e) => setMatn(e.target.value)} disabled={band} placeholder={m.rol.namuna} spellCheck={false} />
    <button type="button" className="mk-btn" onClick={tekshir} disabled={band || matn.trim().split(/\s+/).length < 3}>{band ? __kbUi("Tekshirilmoqda…") : __kbUi("Tekshirish")}</button>
    {xato && <p className="mk-xato" role="alert">{xato}</p>}
    {natija && <div className="mk-natija">
      <h3>{natija.ball}/100 · {natija.daraja}</h3>
      {natija.yaxshi && <p>👍 {natija.yaxshi}</p>}
      {natija.xatolar.length > 0 ? <ul className="mk-xatolar">{natija.xatolar.map((x, n) => <li key={n}><s lang="en">{x.asl}</s> → <b lang="en">{x.togri}</b>{x.izoh ? ` — ${x.izoh}` : ""}</li>)}</ul> : <p>✅ {__kbUi("Xato topilmadi!")}</p>}
      {natija.maslahat && <p>💡 {natija.maslahat}</p>}
      {natija.namuna && <details><summary>{__kbUi("Namunaviy to‘g‘ri variant")}</summary><p lang="en">{natija.namuna}</p></details>}
    </div>}
  </div>;
}
