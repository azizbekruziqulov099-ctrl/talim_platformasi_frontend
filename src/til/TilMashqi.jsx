import React, { useEffect, useMemo, useRef, useState } from "react";
import { VAZIYATLAR, MASHQ_IZOH } from "./mashqLugat.js";
import { BOLAKLI, bolaklar, bolakTogri, gapBaho, yozuvniTekshir, holatlar, belgila, vaziyatHolati } from "./mashqRules.js";
import { aralashtir, kunRaqami, PUXTA } from "../kid/xonalar/xonaRules.js";
import { CONTENT_LOCALES } from "../speech/language.js";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import "./tilMashqi.css";

const REJIMLAR = [
  ["tingla", "🎧", "Tinglash"], ["takrorla", "🗣️", "Takrorlab aytish"], ["yoz", "✍️", "Yozish"], ["ayt", "💬", "O‘zingiz ayting"], ["suhbat", "🎭", "Suhbat mashqi"],
];
const IZOHLAR = ["uz", "ru", "en"];
const teg = (t, til) => `[${til}]${t}[/${til}]`;

/**
 * REV128: Kattalar uchun til mashqi — grammatikasiz, qoidasiz. Hayotiy vaziyatlar (tanishuv, do'kon, kafe, yo'l, taksi,
 * mehmonxona, shifokor, ish, telefon, do'st bilan, yordam): eshitadi → takrorlaydi → yozadi → o'zi aytadi → suhbat quradi.
 * Gaplar takrorlash tizimi bilan eslab qolinadi (bilgan gap keyingi kunlarda qayta so'raladi).
 */
export default function TilMashqi({ apiBase = "", til = "en", izoh = "uz", onClose }) {
  useInterface();
  const iz = IZOHLAR.includes(izoh) ? izoh : "uz";
  const [vId, setVId] = useState(null);
  const [rejim, setRejim] = useState("tingla");
  const [i, setI] = useState(0);
  const [natija, setNatija] = useState(null);       // {holat, matn, yulduz}
  const [yozuv, setYozuv] = useState("");
  const [terilgan, setTerilgan] = useState([]);
  const [bolakRejim, setBolakRejim] = useState(BOLAKLI.has(til));
  const [ochiq, setOchiq] = useState(false);        // «javobni ko'rsat»
  const [mik, setMik] = useState("");
  const [gapiryapti, setGapiryapti] = useState(null);
  const [, setYangi] = useState(0);
  const audio = useRef(null);
  const rec = useRef(null);
  const token = useRef(0);
  const alive = useRef(true);
  const mikBor = Boolean(globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition);
  useEffect(() => () => { alive.current = false; token.current++; try { audio.current?.pause(); } catch { /* */ } try { rec.current?.abort(); } catch { /* */ } }, []);

  const v = VAZIYATLAR.find((x) => x.id === vId) || null;
  const h = holatlar(til);
  // Mashq tartibi: avval o'zlashtirilmagan va takrorlash vaqti kelgan gaplar (hammasi puxta bo'lsa — hammasi)
  const navbat = useMemo(() => {
    if (!v) return [];
    const bugun = kunRaqami();
    const kerak = v.gaplar.filter((g) => (h[g.id]?.quti || 0) < PUXTA || h[g.id].keyin <= bugun);
    return (kerak.length ? kerak : v.gaplar);
  }, [vId, rejim]); // eslint-disable-line react-hooks/exhaustive-deps
  const ro = rejim === "suhbat" ? v?.gaplar || [] : navbat;
  const gap = ro[i] || null;

  const jim = () => { token.current++; try { audio.current?.pause(); } catch { /* */ } try { rec.current?.abort(); } catch { /* */ } rec.current = null; setGapiryapti(null); setMik(""); };
  const ayt = (text, { sekin = false, jins = "qiz", kim = null } = {}, done) => {
    try { audio.current?.pause(); } catch { /* */ }
    const my = ++token.current;
    let fin = false;
    const end = () => { if (fin) return; fin = true; if (alive.current && my === token.current) { setGapiryapti(null); done?.(); } };
    setGapiryapti(kim);
    try {
      const params = new URLSearchParams({ matn: String(text).slice(0, 1500), jins, tezlik: sekin ? "-30%" : "-5%" });
      const a = new Audio(`${String(apiBase).replace(/\/+$/, "")}/api/ovoz?${params}`);
      audio.current = a;
      a.onended = end; a.onerror = end;
      a.play().catch(() => setTimeout(end, 1500));
      setTimeout(end, Math.min(25000, 6000 + String(text).length * 160));
    } catch { setTimeout(end, 800); }
  };
  const gapAyt = (g, sekin = false, done) => ayt(teg(g.w[til], til), { sekin, jins: g.rol === "a" ? "qiz" : "ogil", kim: g.id }, done);

  const tingla = (onNatija) => {
    const R = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    if (!R) { setMik("tugma"); return; }
    const my = token.current;
    let done = false;
    const r = new R();
    rec.current = r;
    r.lang = CONTENT_LOCALES[til] || "en-US";
    r.interimResults = false;
    r.maxAlternatives = 5;
    const keldi = (alts) => { if (done) return; done = true; rec.current = null; if (!alive.current || my !== token.current) return; setMik(""); onNatija(alts); };
    r.onresult = (e) => keldi(Array.from(e.results?.[0] || []).map((a) => a.transcript));
    r.onerror = (e) => { if (e?.error === "not-allowed" || e?.error === "service-not-allowed") { done = true; setMik("tugma"); } else if (e?.error !== "aborted") keldi([]); };
    r.onend = () => keldi([]);
    try { r.start(); setMik("tinglayapti"); } catch { setMik("tugma"); }
  };
  const gapirildi = (g) => (alts) => {
    const b = gapBaho(alts, g.w[til], til);
    belgila(til, g.id, b.togri);
    setNatija({ holat: b.togri ? "togri" : "xato", matn: alts[0] || "", yulduz: b.stars });
    setYangi((x) => x + 1);
  };

  const yangiSavol = (n) => { jim(); setI(n); setNatija(null); setYozuv(""); setTerilgan([]); setOchiq(false); };
  const keyingi = () => {
    if (i + 1 < ro.length) { yangiSavol(i + 1); return; }
    yangiSavol(0);
    setNatija({ holat: "tugadi" });
  };
  // Har yangi gapda: takrorlash/yozish — avval eshittiramiz; suhbatda suhbatdosh gapini aytamiz
  useEffect(() => {
    if (!gap || natija?.holat === "tugadi") return;
    if (rejim === "takrorla" || rejim === "yoz") gapAyt(gap);
    if (rejim === "suhbat" && gap.rol === "a") gapAyt(gap, false, () => setTimeout(() => { if (!alive.current) return; if (i + 1 < ro.length) yangiSavol(i + 1); else setNatija({ holat: "tugadi" }); }, 500));
  }, [i, rejim, vId]); // eslint-disable-line react-hooks/exhaustive-deps
  const tartiblangan = useMemo(() => (gap ? aralashtir(bolaklar(gap.w[til], til)) : []), [gap?.id, til]); // eslint-disable-line react-hooks/exhaustive-deps

  // — vaziyatlar ro'yxati —
  if (!v) {
    return <div className="tm-root">
      <div className="tm-bar">
        <button type="button" className="tm-back" onClick={() => { jim(); onClose?.(); }} aria-label={T("Orqaga")}>⬅️</button>
        <div><b className="tm-title">🗣️ {T("Gapirish va yozish mashqi")}</b>
          <small className="tm-sub">{T("Grammatikasiz: tinglang, takrorlang, yozing va gapiring")}</small></div>
      </div>
      <div className="tm-list">
        {VAZIYATLAR.map((x) => {
          const s = vaziyatHolati(x, h);
          return <button key={x.id} type="button" className="tm-card" onClick={() => { setVId(x.id); setRejim("tingla"); yangiSavol(0); }}>
            <span className="tm-card-emoji" aria-hidden="true">{x.emoji}</span>
            <b>{T(x.nom)}</b>
            <small dir="auto">{x.gaplar[0].w[til]}</small>
            <span className="tm-card-meta">🏅 {Math.round(s.puxta * 100)}%{s.takror ? ` · 🔁 ${s.takror}` : ""}</span>
            <i className="tm-progress" style={{ "--p": `${Math.round(s.puxta * 100)}%` }} aria-hidden="true" />
          </button>;
        })}
      </div>
    </div>;
  }

  const ma = (g) => <small className="tm-mano" dir="auto">{g.w[iz]}</small>;
  return <div className="tm-root">
    <div className="tm-bar">
      <button type="button" className="tm-back" onClick={() => { jim(); setVId(null); }} aria-label={T("Orqaga")}>⬅️</button>
      <b className="tm-title">{v.emoji} {T(v.nom)}</b>
    </div>
    <div className="tm-modes" role="tablist">
      {REJIMLAR.map(([k, e, n]) => <button key={k} type="button" role="tab" aria-selected={rejim === k} className={`tm-mode ${rejim === k ? "is-on" : ""}`}
        onClick={() => { setRejim(k); yangiSavol(0); setBolakRejim(BOLAKLI.has(til)); }}><span aria-hidden="true">{e}</span> {T(n)}</button>)}
    </div>
    <p className="tm-hint">{MASHQ_IZOH[rejim][iz]}</p>

    {rejim === "tingla" && <div className="tm-dialog">
      <button type="button" className="tm-btn is-main" onClick={() => {
        const navb = [...v.gaplar];
        const oyna = (k) => { if (k >= navb.length || !alive.current) return; gapAyt(navb[k], false, () => setTimeout(() => oyna(k + 1), 350)); };
        oyna(0);
      }}>▶ {T("Butun suhbatni tinglash")}</button>
      {v.gaplar.map((g) => <div key={g.id} className={`tm-line is-${g.rol} ${gapiryapti === g.id ? "is-on" : ""}`}>
        <span className="tm-who" aria-hidden="true">{g.rol === "a" ? "🧑" : "🙂"}</span>
        <div className="tm-bubble"><b dir="auto">{g.w[til]}</b>{ma(g)}</div>
        <div className="tm-play">
          <button type="button" onClick={() => gapAyt(g)} aria-label={T("Tinglash")}>🔊</button>
          <button type="button" onClick={() => gapAyt(g, true)} aria-label={T("Sekin")}>🐢</button>
        </div>
      </div>)}
    </div>}

    {rejim !== "tingla" && natija?.holat === "tugadi" && <div className="tm-done" role="status">
      <span aria-hidden="true">🎉</span><b>{T("Barakalla! Mashq tugadi.")}</b>
      <small>🏅 {Math.round(vaziyatHolati(v, holatlar(til)).puxta * 100)}% · {T("Ertaga yana takrorlang — so‘zlar mustahkam eslab qolinadi.")}</small>
      <button type="button" className="tm-btn is-main" onClick={() => yangiSavol(0)}>🔁 {T("Yana bir bor")}</button>
    </div>}

    {rejim !== "tingla" && gap && natija?.holat !== "tugadi" && <div className="tm-card-big">
      <div className="tm-step">{i + 1}/{ro.length}</div>

      {rejim === "takrorla" && <>
        <b className="tm-big" dir="auto">{gap.w[til]}</b>{ma(gap)}
        <Tugmalar gap={gap} gapAyt={gapAyt} />
        <Mikrofon mik={mik} mikBor={mikBor} onStart={() => { setNatija(null); tingla(gapirildi(gap)); }}
          onQolda={() => { belgila(til, gap.id, true); setNatija({ holat: "togri", matn: "", yulduz: 2 }); }} />
      </>}

      {rejim === "yoz" && <>
        <Tugmalar gap={gap} gapAyt={gapAyt} />
        {!natija && (bolakRejim ? <div className="tm-tiles">
          <div className="tm-tiles-out" dir="auto">{terilgan.length ? terilgan.map((t, k) => <button key={k} type="button" className="tm-tile is-in"
            onClick={() => setTerilgan(terilgan.filter((_, z) => z !== k))}>{t}</button>) : <span className="tm-ph">{T("Bo‘laklarni tartib bilan bosing")}</span>}</div>
          <div className="tm-tiles-in">{tartiblangan.map((t, k) => <button key={k} type="button" className="tm-tile"
            disabled={terilgan.filter((x) => x === t).length >= tartiblangan.filter((x) => x === t).length}
            onClick={() => setTerilgan([...terilgan, t])}>{t}</button>)}</div>
        </div> : <textarea className="tm-input" dir="auto" rows={2} value={yozuv} onChange={(e) => setYozuv(e.target.value)}
          placeholder={T("Eshitganingizni yozing…")} lang={til} autoCapitalize="off" spellCheck={false} />)}
        {!natija && <div className="tm-row">
          <button type="button" className="tm-btn is-main" onClick={() => {
            const r = bolakRejim ? (bolakTogri(terilgan, gap.w[til], til) ? { holat: "togri" } : { holat: "xato" }) : yozuvniTekshir(yozuv, gap.w[til], til);
            belgila(til, gap.id, r.holat !== "xato");
            setNatija({ ...r, matn: bolakRejim ? terilgan.join(" ") : yozuv });
          }} disabled={bolakRejim ? !terilgan.length : !yozuv.trim()}>✔ {T("Tekshirish")}</button>
          <button type="button" className="tm-btn" onClick={() => setBolakRejim(!bolakRejim)}>{bolakRejim ? `⌨️ ${T("Klaviaturada yozish")}` : `🧩 ${T("Bo‘laklardan terish")}`}</button>
        </div>}
        {natija && <div className="tm-answer"><b dir="auto">{gap.w[til]}</b>{ma(gap)}</div>}
      </>}

      {rejim === "ayt" && <>
        <b className="tm-big is-mano" dir="auto">{gap.w[iz]}</b>
        <Mikrofon mik={mik} mikBor={mikBor} onStart={() => { setNatija(null); tingla(gapirildi(gap)); }}
          onQolda={() => { setOchiq(true); gapAyt(gap); }} qoldaNom={T("Javobni ko‘rsatish")} />
        {(ochiq || natija) && <div className="tm-answer"><b dir="auto">{gap.w[til]}</b><Tugmalar gap={gap} gapAyt={gapAyt} /></div>}
        {ochiq && !natija && <div className="tm-row">
          <button type="button" className="tm-btn" onClick={() => { belgila(til, gap.id, false); setNatija({ holat: "xato", matn: "" }); }}>😕 {T("Bilmadim")}</button>
          <button type="button" className="tm-btn is-main" onClick={() => { belgila(til, gap.id, true); setNatija({ holat: "togri", matn: "" }); }}>🙂 {T("To‘g‘ri aytdim")}</button>
        </div>}
      </>}

      {rejim === "suhbat" && <div className="tm-dialog is-live">
        {v.gaplar.slice(0, i + 1).map((g, k) => <div key={g.id} className={`tm-line is-${g.rol} ${gapiryapti === g.id ? "is-on" : ""}`}>
          <span className="tm-who" aria-hidden="true">{g.rol === "a" ? "🧑" : "🙂"}</span>
          <div className="tm-bubble">{g.rol === "a" || k < i || ochiq || natija ? <><b dir="auto">{g.w[til]}</b>{ma(g)}</>
            : <><b className="is-mano" dir="auto">💭 {g.w[iz]}</b><small className="tm-mano">{T("Shu gapni o‘rganilayotgan tilda ayting")}</small></>}</div>
        </div>)}
        {gap.rol === "b" && <Mikrofon mik={mik} mikBor={mikBor} onStart={() => { setNatija(null); tingla(gapirildi(gap)); }}
          onQolda={() => { setOchiq(true); gapAyt(gap); }} qoldaNom={T("Javobni ko‘rsatish")} />}
        {gap.rol === "b" && ochiq && !natija && <div className="tm-row">
          <button type="button" className="tm-btn is-main" onClick={() => { belgila(til, gap.id, false); setNatija({ holat: "xato", matn: "" }); }}>➡ {T("Davom etish")}</button>
        </div>}
      </div>}

      {natija && natija.holat !== "tugadi" && <div className={`tm-result is-${natija.holat}`} role="status">
        <b>{natija.holat === "togri" ? `✅ ${T("To‘g‘ri!")}` : natija.holat === "deyarli" ? `🟡 ${T("Deyarli to‘g‘ri — belgilarni tekshiring")}` : `❌ ${T("Yana urinib ko‘ring")}`}
          {natija.yulduz ? ` ${"⭐".repeat(natija.yulduz)}` : ""}</b>
        {natija.matn && <small dir="auto">{rejim === "yoz" ? `${T("Siz yozdingiz")}: ` : `🎤 `}{natija.matn}</small>}
        <div className="tm-row">
          {rejim !== "suhbat" && natija.holat === "xato" && <button type="button" className="tm-btn" onClick={() => { setNatija(null); setYozuv(""); setTerilgan([]); if (rejim !== "ayt") gapAyt(gap); }}>🔁 {T("Qayta")}</button>}
          <button type="button" className="tm-btn is-main" onClick={() => {
            if (rejim === "suhbat") { gapAyt(gap, false, () => { if (alive.current) keyingi(); }); return; }
            keyingi();
          }}>➡ {T("Keyingisi")}</button>
        </div>
      </div>}
    </div>}
  </div>;
}

function Tugmalar({ gap, gapAyt }) {
  return <div className="tm-row">
    <button type="button" className="tm-btn" onClick={() => gapAyt(gap)}>🔊 {T("Tinglash")}</button>
    <button type="button" className="tm-btn" onClick={() => gapAyt(gap, true)}>🐢 {T("Sekin")}</button>
  </div>;
}
function Mikrofon({ mik, mikBor, onStart, onQolda, qoldaNom }) {
  return <div className="tm-row">
    {mikBor && mik !== "tugma" && <button type="button" className={`tm-btn is-mic ${mik === "tinglayapti" ? "is-on" : ""}`} onClick={onStart} disabled={mik === "tinglayapti"}>
      🎤 {mik === "tinglayapti" ? T("Gapiring…") : T("Gapirish")}</button>}
    <button type="button" className="tm-btn" onClick={onQolda}>{qoldaNom || `✅ ${T("Ovoz chiqarib aytdim")}`}</button>
  </div>;
}
