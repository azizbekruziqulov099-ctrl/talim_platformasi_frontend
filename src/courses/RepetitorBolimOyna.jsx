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

// MASHQ: o'quvchi o'zi, daftarda ishlaydi. Xato javob → 1-yordam → 2-yordam → ustoz yechib ko'rsatadi (yechim ko'rilgan mashq «o'zi yechgan» hisoblanmaydi).
// O'zi yechganlar 70% dan kam bo'lsa — zapas (yangi) mashqlar chiqadi; ularni ham o'tmaguncha keyingi dars ochilmaydi.
const API = (b) => String(b || "").replace(/\/+$/, "");
function MashqToplam({ list, zapas = false, apiBase, token, topicCode, onNatija }) {
  const [javob, setJavob] = useState({}); const [xato, setXato] = useState({}); const [holat, setHolat] = useState({}); const [yech, setYech] = useState({});
  const [yuborildi, setYuborildi] = useState(null);
  const tugadi = list.length > 0 && list.every((_, i) => holat[i]);
  const oziTogri = Object.values(holat).filter((h) => h === "ozi").length;
  const yechimKordi = Object.values(holat).filter((h) => h === "yechim").length;
  const foiz = list.length ? Math.round((100 * oziTogri) / list.length) : 0;
  useEffect(() => {
    if (!tugadi || yuborildi) return;
    const otdi = foiz >= 70; setYuborildi({ otdi });
    fetch(`${API(apiBase)}/api/kurslar/mashq_natija`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, topic_code: topicCode, togri: oziTogri, jami: list.length, yechim_kordi: yechimKordi, zapas }) }).catch(() => {});
    onNatija?.(otdi);
  }, [tugadi]); // eslint-disable-line react-hooks/exhaustive-deps
  const tekshir = (i, s) => {
    if (holat[i]) return;
    if (checkAnswer(javob[i], s.javob)) { setHolat({ ...holat, [i]: yech[i] ? "yechim" : "ozi" }); return; }
    const n = (xato[i] || 0) + 1; setXato({ ...xato, [i]: n });
    if (n >= 3) { setYech({ ...yech, [i]: true }); setHolat({ ...holat, [i]: "yechim" }); }   // 3-xato: ustoz yechib ko'rsatadi
  };
  return <>
    <p style={{ fontWeight: 700 }}>O‘zingiz yechgan: {oziTogri} / {list.length}{tugadi ? ` · ${foiz}%` : ""}</p>
    {list.map((s, i) => { const h = holat[i]; const n = xato[i] || 0; const mas = Array.isArray(s.maslahat) ? s.maslahat : [];
      const y = yechimMatni(s.yechim) || s.javob_izohi || ""; const yechOchiq = yech[i] || h === "yechim";
      return <article key={i} style={{ ...kartaUslub, borderColor: h === "ozi" ? "#2f8f6f" : h === "yechim" ? "#d4a017" : kartaUslub.border }}>
        <b>{String(s.sarlavha || "").replace(/^topshiriq\s*·\s*/i, "") || `Mashq ${i + 1}`}</b>
        <CourseText text={s.doska || s.ovoz} />
        {!h && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <input value={javob[i] || ""} placeholder="Javobingiz" inputMode="text" style={{ flex: "1 1 160px", padding: 9, borderRadius: 9, border: "1px solid #aab" }}
            onChange={(e) => setJavob({ ...javob, [i]: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") tekshir(i, s); }} />
          <button type="button" style={tugma(true)} disabled={!String(javob[i] || "").trim()} onClick={() => tekshir(i, s)}>Tekshirish</button>
          {!yechOchiq && <button type="button" style={tugma(false)} onClick={() => setYech({ ...yech, [i]: true })}>Yechimni ko‘rsat</button>}
        </div>}
        {n >= 1 && !h && <p style={{ color: "#c0392b", fontWeight: 700, margin: "8px 0 2px" }}>✗ Hali emas. {n < 3 ? "Yordamni o‘qib, qayta urinib ko‘ring." : ""}</p>}
        {!h && n >= 1 && <p style={{ margin: "4px 0" }}>💡 1-yordam: <CourseText text={mas[0] || "Shartni qayta o‘qing: nima berilgan, nima so‘ralgan? Qaysi amal birinchi?"} /></p>}
        {!h && n >= 2 && <p style={{ margin: "4px 0" }}>💡 2-yordam: <CourseText text={mas[1] || "Har qatorga bitta amal yozing va natijani joyiga qo‘yib tekshiring."} /></p>}
        {h === "ozi" && <p style={{ color: "#2f8f6f", fontWeight: 700 }}>✓ To‘g‘ri! O‘zingiz yechdingiz.</p>}
        {h === "yechim" && <p style={{ color: "#8a6d00", fontWeight: 700 }}>Yechim ko‘rsatildi: bu mashq «o‘zi yechgan»ga qo‘shilmaydi. Quyidagi yechimni diqqat bilan o‘qing.</p>}
        {yechOchiq && <div style={{ marginTop: 8, background: "rgba(47,143,111,.08)", borderRadius: 10, padding: 10 }}>
          <b>Javob: </b><CourseText text={String(s.javob || "")} />{y && <CourseText text={y} />}
          {!h && <button type="button" style={{ ...tugma(true), marginTop: 8 }} onClick={() => setHolat({ ...holat, [i]: "yechim" })}>Tushundim, keyingisi</button>}</div>}
      </article>; })}
    {tugadi && <div style={{ ...kartaUslub, borderColor: foiz >= 70 ? "#2f8f6f" : "#c0392b" }}>
      {foiz >= 70 ? <b style={{ color: "#2f8f6f" }}>✓ Mashq o‘tdi: {foiz}%. Endi Test bo‘limini ishlang, ikkalasi ham 70% dan o‘tsa keyingi dars ochiladi.</b>
        : <b style={{ color: "#c0392b" }}>O‘zingiz yechgan {foiz}%: 70% kerak. {zapas ? "Darsni qayta ko‘rib chiqing va yana urinib ko‘ring." : "Yangi mashqlar chiqdi: ularni o‘zingiz ishlasangiz keyingi darslar ochiladi. Yechimga qarab o‘qisangiz, foydasi yo‘q."}</b>}
    </div>}
  </>;
}

function Mashq({ steps, apiBase, token, topicCode }) {
  const hammasi = useMemo(() => { const b = qadamBolimlari(steps); return steps.filter((s, i) => b[i] === "mashq" && s.amaliy_turi !== "misol"); }, [steps]);
  const asosiy = useMemo(() => hammasi.filter((s) => !/zapas/i.test(String(s.sarlavha || ""))), [hammasi]);
  const zapas = useMemo(() => hammasi.filter((s) => /zapas/i.test(String(s.sarlavha || ""))), [hammasi]);
  const [zapasKerak, setZapasKerak] = useState(false);
  useEffect(() => {   // oldin asosiy mashq o'tmagan bo'lsa — zapas darhol chiqadi
    if (!token || !topicCode) return;
    fetch(`${API(apiBase)}/api/kurslar/mashq_holat?${new URLSearchParams({ token, topic_code: topicCode })}`).then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.zapas_kerak) setZapasKerak(true); }).catch(() => {});
  }, [apiBase, token, topicCode]);
  if (!hammasi.length) return <p>Bu mavzuda mashq hali yo‘q.</p>;
  return <>
    <MashqToplam key="asosiy" list={asosiy.length ? asosiy : hammasi} apiBase={apiBase} token={token} topicCode={topicCode} onNatija={(ok) => { if (!ok) setZapasKerak(true); }} />
    {zapasKerak && zapas.length > 0 && <><h3 style={{ margin: "18px 0 6px" }}>🔁 Yangi mashqlar</h3>
      <MashqToplam key="zapas" list={zapas} zapas apiBase={apiBase} token={token} topicCode={topicCode} /></>}
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
    {lesson && bolim === "mashq" && <Mashq steps={steps} apiBase={apiBase} token={token} topicCode={dars.topic_code} />}
    {lesson && bolim === "tarix" && <Tarix steps={steps} />}
  </section>;
}
