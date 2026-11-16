import React, { useEffect, useMemo, useState } from "react";
import CourseText from "./CourseText.jsx";
import { checkAnswer, qadamBolimlari, hayotMasalalari } from "../lesson/darsXonasiRules.js";
import { qurilmaKaliti } from "../auth/qurilma.js";

// Repetitor darsining Hayotdan · Mashq · Tarix bo'limlari: har biri o'z oynasida, o'z mantig'i bilan
// (Hayotdan — masala va qadam-baqadam yechim; Mashq — o'zi yechib javob yozadi va tekshiradi; Tarix — o'qiladigan kartochka).
const kartaUslub = { background: "var(--card, #fff)", border: "1px solid rgba(0,0,0,.1)", borderRadius: 14, padding: "14px 16px", margin: "0 0 12px" };
const tugma = (asosiy) => ({ border: 0, borderRadius: 10, padding: "9px 16px", fontWeight: 700, cursor: "pointer", background: asosiy ? "#1f4e79" : "#e6ebf2", color: asosiy ? "#fff" : "#1f2d3d" });

export const yechimMatni = (y) => (Array.isArray(y) ? y.map((x) => (typeof x === "string" ? x : x?.doska || x?.ovoz || "")).filter(Boolean).join("\n") : String(y || ""));
function Hayotdan({ steps }) {
  const masalalar = useMemo(() => hayotMasalalari(steps), [steps]);
  const [ochiq, setOchiq] = useState({});
  if (!masalalar.length) return <p>Bu mavzuda hayotiy masala hali yo‘q.</p>;
  return <>{masalalar.map((m, i) => { const k = ochiq[i] || 0; const korinadi = m.qadamlar.slice(0, k);
    return <article key={i} style={kartaUslub}>
      <h3 style={{ margin: "0 0 6px" }}>{i + 1}. {m.nom}</h3>
      {m.rasm && <img src={m.rasm} alt="" loading="lazy" style={{ width: "100%", borderRadius: 12, margin: "4px 0 10px" }} />}
      {m.shart && <CourseText text={m.shart} />}
      {korinadi.map((q, j) => <div key={j} style={{ borderLeft: "3px solid #2f8f6f", paddingLeft: 10, margin: "10px 0" }}>
        {q.say && <CourseText text={q.say} />}{q.line && <CourseText text={q.line} />}</div>)}
      {k < m.qadamlar.length
        ? <button type="button" style={tugma(true)} onClick={() => setOchiq({ ...ochiq, [i]: k + 1 })}>{k ? "Keyingi qadam" : "Yechishni boshlash"} ({k}/{m.qadamlar.length})</button>
        : m.qadamlar.length > 0 && <b style={{ color: "#2f8f6f" }}>✓ Masala yechildi</b>}
    </article>; })}</>;
}

function Mashq({ steps }) {
  const list = useMemo(() => { const b = qadamBolimlari(steps); return steps.filter((s, i) => b[i] === "mashq" && s.amaliy_turi !== "misol"); }, [steps]);
  const [javob, setJavob] = useState({}); const [natija, setNatija] = useState({}); const [yech, setYech] = useState({});
  if (!list.length) return <p>Bu mavzuda mashq hali yo‘q.</p>;
  const togri = Object.values(natija).filter(Boolean).length;
  return <>
    <p style={{ fontWeight: 700 }}>To‘g‘ri: {togri} / {list.length}</p>
    {list.map((s, i) => { const r = natija[i]; const y = yechimMatni(s.yechim) || s.javob_izohi || "";
      return <article key={i} style={{ ...kartaUslub, borderColor: r === true ? "#2f8f6f" : r === false ? "#c0392b" : kartaUslub.border }}>
        <b>{String(s.sarlavha || "").replace(/^topshiriq\s*·\s*/i, "") || `Mashq ${i + 1}`}</b>
        <CourseText text={s.doska || s.ovoz} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <input value={javob[i] || ""} placeholder="Javobingiz" inputMode="text" style={{ flex: "1 1 160px", padding: 9, borderRadius: 9, border: "1px solid #aab" }}
            onChange={(e) => setJavob({ ...javob, [i]: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter" && s.javob) setNatija({ ...natija, [i]: checkAnswer(javob[i], s.javob) }); }} />
          <button type="button" style={tugma(true)} onClick={() => setNatija({ ...natija, [i]: checkAnswer(javob[i], s.javob) })}>Tekshirish</button>
          <button type="button" style={tugma(false)} onClick={() => setYech({ ...yech, [i]: !yech[i] })}>{yech[i] ? "Yopish" : "Yechim"}</button>
        </div>
        {r === true && <p style={{ color: "#2f8f6f", fontWeight: 700 }}>✓ To‘g‘ri!</p>}
        {r === false && <p style={{ color: "#c0392b", fontWeight: 700 }}>✗ Qayta urinib ko‘ring.</p>}
        {yech[i] && <div style={{ marginTop: 8, background: "rgba(47,143,111,.08)", borderRadius: 10, padding: 10 }}>
          <b>Javob: </b><CourseText text={String(s.javob || "")} />{y && <CourseText text={y} />}</div>}
      </article>; })}
  </>;
}

function Tarix({ steps }) {
  const b = qadamBolimlari(steps); const list = steps.filter((s, i) => b[i] === "tarix");
  if (!list.length) return <p>Bu mavzuning tarixi hali qo‘shilmagan.</p>;
  return <>{list.map((s, i) => <article key={i} style={kartaUslub}>
    <h3 style={{ margin: "0 0 6px" }}>🏛 {String(s.sarlavha || "").replace(/^tarixdan:\s*/i, "")}</h3>
    {s.rasm && <img src={s.rasm} alt="Rassom tasavvuri" loading="lazy" style={{ width: "100%", borderRadius: 12, margin: "4px 0 2px" }} />}
    {s.rasm && <small style={{ opacity: .7 }}>Rassom tasavvuri</small>}
    {s.doska && <CourseText text={s.doska} />}{s.ovoz && s.ovoz !== s.doska && <CourseText text={String(s.ovoz).replace(/^esda tut:\s*/i, "")} />}</article>)}</>;
}

export default function RepetitorBolimOyna({ apiBase, token, dars, bolim, bolimNomi = "", belgi = "", onOrtga }) {
  const [lesson, setLesson] = useState(null); const [xato, setXato] = useState(""); const [yuk, setYuk] = useState(true);
  useEffect(() => {
    const c = new AbortController(); setYuk(true); setXato(""); setLesson(null);
    const qs = new URLSearchParams({ token, til: "uz", qurilma: qurilmaKaliti() });
    fetch(`${String(apiBase).replace(/\/+$/, "")}/api/dars_xonasi/${encodeURIComponent(dars.topic_code)}?${qs}`, { signal: c.signal })
      .then(async (r) => { const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : d.detail?.xabar || "Yuklanmadi"); return d; })
      .then((d) => setLesson(d)).catch((e) => { if (e.name !== "AbortError") setXato(e.message); }).finally(() => setYuk(false));
    return () => c.abort();
  }, [apiBase, token, dars.topic_code]);
  const steps = lesson?.steps || [];
  return <section className="kk" aria-label={dars.nomi}>
    <button type="button" className="kk-ortga" onClick={onOrtga}>← Bo‘limlar</button>
    <header className="kk-kurs-bosh"><h2>{belgi} {bolimNomi}</h2><p>{dars.nomi}</p></header>
    {yuk && <p>Yuklanmoqda…</p>}{xato && <p role="alert" style={{ color: "#c0392b" }}>{xato}</p>}
    {lesson && bolim === "hayotdan" && <Hayotdan steps={steps} />}
    {lesson && bolim === "mashq" && <Mashq steps={steps} />}
    {lesson && bolim === "tarix" && <Tarix steps={steps} />}
  </section>;
}
