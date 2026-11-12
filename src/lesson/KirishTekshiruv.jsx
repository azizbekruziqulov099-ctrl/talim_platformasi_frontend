// REV512: bilim zanjiri — dars boshida oldingi mavzulardan 3 savollik kirish tekshiruvi; xato bo'lsa «Avval buni eslab olaylik»:
// namunaviy yechim va 6 ta mashq, keyin darsga. Bizni boshqa saytlardan ajratadigan narsa: o'quvchi bilmagan joyi to'ldiriladi.
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { BoardText } from "./AmaliyDoska.jsx";
import "./kirishTekshiruv.css";

const yol = (b) => String(b || "").replace(/\/+$/, "");

function Savollar({ savollar, onTugadi, sarlavha }) {
  const [i, setI] = useState(0), [tanlov, setTanlov] = useState(null), [natija, setNatija] = useState([]);
  const q = savollar[i];
  if (!q) return null;
  const javob = (k) => { if (tanlov !== null) return; setTanlov(k); setNatija((n) => [...n, k === q.togri]); };
  const keyingi = () => { if (i + 1 < savollar.length) { setI(i + 1); setTanlov(null); } else onTugadi(natija); };
  return <div className="bzt-savol">
    <div className="bzt-yuqori"><b>{sarlavha}</b><span>{i + 1} / {savollar.length}</span></div>
    {q.nom && <small className="bzt-oila">📘 {__kbUi(q.nom)}</small>}
    <div className="bzt-matn"><BoardText text={q.savol} /></div>
    <div className="bzt-var">{q.variantlar.map((v, k) => <button key={k} type="button" disabled={tanlov !== null} onClick={() => javob(k)}
      className={tanlov === null ? "" : k === q.togri ? "is-ok" : k === tanlov ? "is-no" : ""}><BoardText text={/^-?[\d,./]+$/.test(v) ? `$${v}$` : v} /></button>)}</div>
    {tanlov !== null && <>{tanlov !== q.togri && q.yechim && <p className="bzt-yechim">💡 <BoardText text={q.yechim} /></p>}
      <button type="button" className="bzt-btn" onClick={keyingi}>{i + 1 < savollar.length ? __kbUi("Keyingi") : __kbUi("Tayyor")} ▶</button></>}
  </div>;
}

export default function KirishTekshiruv({ apiBase, token, topicCode, onYop }) {
  const [d, setD] = useState(null), [bosqich, setBosqich] = useState("kirish"), [xatoOila, setXatoOila] = useState([]), [takror, setTakror] = useState(null), [ti, setTi] = useState(0);
  useEffect(() => {
    fetch(`${yol(apiBase)}/api/bilim_zanjiri/kirish?${new URLSearchParams({ topic_code: topicCode, token })}`).then((r) => (r.ok ? r.json() : null))
      .then((x) => { if (!x?.savollar?.length) onYop(); else setD(x); }).catch(() => onYop());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const takrorOch = (oila) => fetch(`${yol(apiBase)}/api/bilim_zanjiri/takror?${new URLSearchParams({ oila, token })}`).then((r) => (r.ok ? r.json() : null)).then((x) => { setTakror(x); setBosqich("takror"); }).catch(() => onYop());
  if (!d) return null;
  return createPortal(<div className="bzt-fon" role="dialog" aria-modal="true"><div className="bzt-oyna">
    {bosqich === "kirish" && <>
      <p className="bzt-izoh">🧩 {__kbUi("Darsdan oldin: bu mavzu uchun kerak bo‘ladigan bilimlarni tekshiramiz")} ({d.savollar.length} {__kbUi("ta savol")})</p>
      <Savollar sarlavha={__kbUi("Kirish tekshiruvi")} savollar={d.savollar} onTugadi={(n) => {
        const xato = d.savollar.filter((_, k) => !n[k]).map((q) => ({ oila: q.oila, nom: q.nom }));
        setXatoOila(xato); setBosqich(xato.length ? "natija" : "tayyor"); }} />
      <button type="button" className="bzt-otkaz" onClick={onYop}>{__kbUi("O‘tkazib yuborish")}</button></>}
    {bosqich === "tayyor" && <div className="bzt-natija"><div className="bzt-belgi">🎉</div><h2>{__kbUi("Zo‘r! Darsga tayyorsiz")}</h2>
      <button type="button" className="bzt-btn" onClick={onYop}>{__kbUi("Darsni boshlash")} ▶</button></div>}
    {bosqich === "natija" && <div className="bzt-natija"><div className="bzt-belgi">🧭</div><h2>{__kbUi("Avval buni eslab olaylik")}</h2>
      <p>{__kbUi("Bu mavzuni yaxshi tushunish uchun quyidagilarni qisqa takrorlaymiz:")}</p>
      <ul>{xatoOila.map((x) => <li key={x.oila}>📘 {__kbUi(x.nom)}</li>)}</ul>
      <button type="button" className="bzt-btn" onClick={() => takrorOch(xatoOila[0].oila)}>{__kbUi("Takrorlashni boshlash")} ▶</button>
      <button type="button" className="bzt-otkaz" onClick={onYop}>{__kbUi("Keyinroq — darsga o‘tish")}</button></div>}
    {bosqich === "takror" && takror && <>
      <div className="bzt-nazariya"><b>📘 {__kbUi(takror.nom)}</b>
        {takror.namuna && <><p className="bzt-izoh">{__kbUi("Namunaviy misol")}:</p><div className="bzt-matn"><BoardText text={takror.namuna.savol} /></div>
          <p className="bzt-yechim">✍️ <BoardText text={takror.namuna.yechim} /> → <b>{takror.namuna.javob}</b></p></>}</div>
      <Savollar key={takror.oila} sarlavha={__kbUi("Mashq")} savollar={takror.mashqlar} onTugadi={() => {
        if (ti + 1 < xatoOila.length) { setTi(ti + 1); takrorOch(xatoOila[ti + 1].oila); } else setBosqich("tayyor"); }} /></>}
  </div></div>, document.body);   // REV512: dars sarlavhasi va tugmalari ustida, ekran markazida
}
