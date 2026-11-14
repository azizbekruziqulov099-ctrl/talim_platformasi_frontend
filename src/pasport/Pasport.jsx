// REV560: O'quvchi pasporti — qayerda turibdi, nimani biladi, nimani unutyapti, nozik joylari. Hammasi serverdagi HAQIQIY ma'lumotdan (AI emas).
// userId berilmasa — o'quvchining o'zi; berilsa — ota-ona / o'qituvchi / admin ko'rinishi. Server: modules/pasport.py.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { matFetch } from "../matbank/matBankApi.js";
import { DARAJA_RANGI, HOLAT_NOMI, HOLAT_RANG, foizRangi, holatBolaklari, sanaQisqa, xalqaroDaraja } from "./pasportRules.js";
import "./pasport.css";

const Yolak = ({ nom, foiz, yon }) => <div className={`ps-yolak ${nom ? "" : "is-bosh"}`}>{nom ? <span>{nom}</span> : null}<i aria-hidden="true"><b style={{ width: `${Math.max(3, foiz)}%`, background: foizRangi(foiz) }} /></i><em>{yon ?? `${foiz}%`}</em></div>;
const Karta = ({ nom, qiymat, izoh, rang }) => <div className="ps-stat"><small>{nom}</small><b style={rang ? { color: rang } : undefined}>{qiymat}</b>{izoh && <small>{izoh}</small>}</div>;
const Daraja = ({ d }) => (d ? <span className="ps-daraja" style={{ "--r": DARAJA_RANGI[d] || "#475569" }}>{__kbUi(d.charAt(0).toUpperCase() + d.slice(1))}</span> : <span className="ps-daraja is-yoq">{__kbUi("aniqlanmagan")}</span>);

export default function Pasport({ apiBase = "", token, userId = null, onTest = null, onYop = null }) {
  const [p, setP] = useState(null); const [xato, setXato] = useState("");
  useEffect(() => { setP(null); setXato(""); matFetch(apiBase, token, userId ? `/api/pasport/${userId}` : "/api/pasport/mening").then(setP).catch((e) => setXato(e.message)); }, [apiBase, token, userId]);
  if (xato) return <section className="ps-root"><p className="ps-xato" role="alert">⚠️ {__kbUi(xato)}</p>{onYop && <button type="button" className="ps-btn" onClick={onYop}>← {__kbUi("Orqaga")}</button>}</section>;
  if (!p) return <section className="ps-root"><p className="ps-muted" role="status">⏳ {__kbUi("Yuklanmoqda…")}</p></section>;
  const m = p.matematika; const x = p.xalqaro; const bol = holatBolaklari(m.holatlar); const f = p.faollik;
  const faol = f.oxirgi == null ? __kbUi("Hali hech qanday mashq bajarilmagan.") : f.kun_7 === 0 ? __kbUi("Oxirgi 7 kunda faol bo‘lmagan.") : `${__kbUi("Oxirgi 7 kunda faol")}: ${f.kun_7} ${__kbUi("kun")}`;
  return <section className="ps-root">
    <header className="ps-bosh">{onYop && <button type="button" className="ps-btn" onClick={onYop}>← {__kbUi("Orqaga")}</button>}
      <div><h2>📊 {userId ? p.kim.ism || `#${userId}` : __kbUi("Mening pasportim")}</h2>
        <small>{[p.kim.sinf && `${p.kim.sinf}-${__kbUi("sinf")}`, faol, f.oxirgi && `${__kbUi("oxirgi")}: ${sanaQisqa(f.oxirgi)}`].filter(Boolean).join(" · ")}</small></div></header>

    {p.xulosa.length > 0 && <article className="ps-karta ps-xulosa"><h3>📝 {__kbUi("Qisqacha")}</h3><ul>{p.xulosa.map((g, i) => <li key={i}>{g}</li>)}</ul></article>}

    <article className="ps-karta"><h3>📘 {__kbUi("Matematika")}</h3>
      {!m.ko_rilgan ? <p className="ps-muted">{__kbUi("Matematika bankida hali savol yechilmagan.")}</p> : <>
        <div className="ps-statlar">
          <Karta nom={__kbUi("Ko‘rilgan savol")} qiymat={m.ko_rilgan} izoh={`${__kbUi("bankning")} ${m.qamrov}%`} />
          <Karta nom={__kbUi("Hozir to‘g‘ri")} qiymat={`${m.hozirgi}%`} izoh={__kbUi("oxirgi urinish bo‘yicha")} rang={foizRangi(m.hozirgi)} />
          <Karta nom={__kbUi("Umumiy daraja")} qiymat={<Daraja d={m.daraja} />} izoh={m.daraja ? null : `${__kbUi("kamida")} 15 ${__kbUi("savol kerak")}`} />
        </div>
        <div className="ps-elementar"><b>🔢 {__kbUi("Elementar matematika")}</b><small>{__kbUi("Natural sonlar va kasrlar (1–10-mavzular)")}</small>
          {m.elementar.ko_rilgan ? <><Daraja d={m.elementar.daraja} /><span>{m.elementar.hozirgi}% · {m.elementar.ko_rilgan} {__kbUi("savol")}</span></> : <span className="ps-muted">{__kbUi("hali yechilmagan")}</span>}
          {m.elementar.ko_rilgan > 0 && !m.elementar.ishonchli && <small className="ps-ogoh">{__kbUi("Daraja aytish uchun savol yetarli emas.")}</small>}</div>

        <h4>🧠 {__kbUi("Esdan chiqarish")} <em className="ps-taxmin">{__kbUi("taxminiy")}</em></h4>
        <div className="ps-yig" role="img" aria-label={__kbUi("Savollar holati")}>{bol.map((b) => <span key={b.k} style={{ width: `${b.foiz}%`, background: HOLAT_RANG[b.k] }} title={`${__kbUi(HOLAT_NOMI[b.k])}: ${b.soni}`} />)}</div>
        <ul className="ps-legenda">{bol.map((b) => <li key={b.k}><i style={{ background: HOLAT_RANG[b.k] }} aria-hidden="true" />{__kbUi(HOLAT_NOMI[b.k])}: <b>{b.soni}</b></li>)}</ul>
        <p className="ps-izoh">{__kbUi(p.eslatma)}</p>

        {m.nozik.length > 0 && <><h4>⚠️ {__kbUi("Nozik mavzular")}</h4><ul className="ps-royxat">{m.nozik.map((t) => <li key={t.raqam}>
          <div><b>{t.raqam}. {t.nom}</b><small>{t.ko_rilgan} {__kbUi("savol ko‘rilgan")}</small></div><Yolak nom="" foiz={t.hozirgi} />
          {onTest && <button type="button" className="ps-btn ps-kichik" onClick={() => onTest(t.raqam)}>▶ {__kbUi("Test")}</button>}</li>)}</ul></>}
        {m.takrorlash.length > 0 && <><h4>🔁 {__kbUi("Takrorlash vaqti")}</h4><ul className="ps-royxat">{m.takrorlash.map((t) => <li key={t.raqam}>
          <div><b>{t.raqam}. {t.nom}</b><small>{t.holatlar.takror + t.holatlar.unutilgan} {__kbUi("ta savol")}</small></div>
          {onTest && <button type="button" className="ps-btn ps-kichik" onClick={() => onTest(t.raqam)}>▶ {__kbUi("Test")}</button>}</li>)}</ul></>}
        <details className="ps-ochiq"><summary>{__kbUi("Hamma mavzular")} ({m.mavzular.length})</summary><div className="ps-jadval"><table><thead><tr><th>№</th><th>{__kbUi("Mavzu")}</th><th>{__kbUi("Ko‘rilgan")}</th><th>{__kbUi("Hozir to‘g‘ri")}</th></tr></thead>
          <tbody>{m.mavzular.map((t) => <tr key={t.raqam}><td>{t.raqam}</td><td>{t.nom}</td><td>{t.ko_rilgan}/{t.jami}</td><td style={{ color: foizRangi(t.hozirgi), fontWeight: 700 }}>{t.hozirgi}%</td></tr>)}</tbody></table></div></details></>}
    </article>

    <article className="ps-karta"><h3>🌍 {__kbUi("Xalqaro baholash (PISA · TIMSS)")}</h3>
      {!x.sinflar.length && !x.imtihonlar.length ? <p className="ps-muted">{__kbUi("Xalqaro sinfga qo‘shilmagan va rasmiy imtihon topshirmagan.")}</p> : <>
        {x.sinflar.map((s, i) => <div key={i} className="ps-sinf"><b>🏫 {s.nom}</b><small>👩‍🏫 {s.oqituvchi || "—"}</small>
          {s.guruh ? <div className="ps-statlar"><Karta nom={__kbUi("Guruh")} qiymat={`${s.guruh} / ${s.guruhlar_soni}`} /><Karta nom={__kbUi("Reyting")} qiymat={s.reyting} izoh={__kbUi(xalqaroDaraja(s.reyting))} /></div>
            : <p className="ps-ogoh">{__kbUi("Hali guruhga tushmagan: kirish testi kerak.")}</p>}</div>)}
        {x.imtihonlar.length > 0 && <><h4>📝 {__kbUi("So‘nggi imtihonlar")}</h4><ul className="ps-royxat ps-imt">{x.imtihonlar.map((e, i) => <li key={i}><div><b>{e.ball}</b> <small>{__kbUi(xalqaroDaraja(e.ball))} · {e.foiz}%</small></div><small>{__kbUi(e.tur === "kirish" ? "Kirish testi" : e.tur)} · {sanaQisqa(e.sana)}</small></li>)}</ul></>}
        {x.sohalar.length > 0 && <div className="ps-ikki"><div><h4>📚 {__kbUi("Mavzu sohalari")}</h4>{x.sohalar.map((a, i) => <Yolak key={i} nom={a.nom} foiz={a.foiz} yon={`${a.togri}/${a.jami}`} />)}</div>
          <div><h4>🧠 {__kbUi("Fikrlash ko‘nikmalari")}</h4>{x.fikrlash.map((a, i) => <Yolak key={i} nom={a.nom} foiz={a.foiz} yon={`${a.togri}/${a.jami}`} />)}</div></div>}
        {x.zaif_mavzular.length > 0 && <><h4>⚠️ {__kbUi("Zaif mavzular")}</h4><ul className="ps-royxat">{x.zaif_mavzular.map((t, i) => <li key={i}><div><b>{t.nom}</b><small>{t.urinish} {__kbUi("urinish")}</small></div><Yolak nom="" foiz={t.foiz} /></li>)}</ul></>}</>}
    </article>
  </section>;
}
