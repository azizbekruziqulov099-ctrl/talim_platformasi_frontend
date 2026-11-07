// REV412: «💬 Dars izohlari» — hamma darslarga qoldirilgan izohlar, umumiy izohlar, holat va bitta faylga yuklab olish.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { izohFetch, vaqtMatn } from "../lesson/DarsIzoh.jsx";
import "../lesson/darsIzoh.css";

export default function DarsIzohlari({ apiBase, token }) {
  const [d, setD] = useState(null);
  const [holat, setHolat] = useState("yangi");
  const [umumiy, setUmumiy] = useState("");
  const [xato, setXato] = useState("");
  const yukla = () => izohFetch(apiBase, "/api/dars_izoh", token, { params: holat ? { holat } : {} }).then(setD).catch((e) => setXato(e.message));
  useEffect(() => { yukla(); }, [holat]); // eslint-disable-line react-hooks/exhaustive-deps
  const base = String(apiBase || "").replace(/\/+$/, "");
  const guruhlar = {};
  for (const x of d?.izohlar || []) (guruhlar[x.topic_code || ""] ||= []).push(x);
  const belgila = (x) => izohFetch(apiBase, `/api/dars_izoh/${x.id}/holat`, token, { method: "POST", body: { holat: x.holat === "yangi" ? "bajarildi" : "yangi" } }).then(yukla);
  return <section className="di-sahifa">
    <h2>💬 {__kbUi("Dars izohlari")}</h2>
    <p className="di-izoh">{__kbUi("Darsni ko‘rayotganda o‘ng pastdagi 💬 tugmasi bilan aniq qadamga izoh qoldirasiz. Hammasi shu yerda yig‘iladi. «Bitta faylga yuklab olish» — faylni Claude'ga berasiz, u izohlar bo‘yicha darslarni tuzatadi.")}</p>
    {xato && <p className="di-xato">{xato}</p>}
    <div className="di-tepa">
      <div className="di-filtr" role="tablist">{[["yangi", "🆕 Yangi"], ["bajarildi", "✅ Bajarilgan"], ["", "Hammasi"]].map(([k, n]) =>
        <button key={k || "h"} type="button" role="tab" aria-selected={holat === k} className={holat === k ? "is-on" : ""} onClick={() => setHolat(k)}>{__kbUi(n)}</button>)}</div>
      <a className="di-saqla" href={`${base}/api/dars_izoh/eksport?${new URLSearchParams({ token, faqat_yangi: holat === "yangi" ? "true" : "false" })}`} download>📥 {__kbUi("Bitta faylga yuklab olish")}</a>
    </div>
    <div className="di-umumiy-forma"><textarea rows={2} value={umumiy} onChange={(e) => setUmumiy(e.target.value)} maxLength={4000}
      placeholder={__kbUi("Umumiy izoh — dars jarayoni haqida (masalan: «har darsda ustoz kamroq gapirsin, savol ko‘proq bo‘lsin»)")} />
      <button type="button" className="di-saqla" disabled={!umumiy.trim()} onClick={() => izohFetch(apiBase, "/api/dars_izoh", token, { method: "POST", body: { matn: umumiy } }).then(() => { setUmumiy(""); yukla(); })}>💾 {__kbUi("Saqlash")}</button></div>
    {!d ? <p>⏳</p> : !d.izohlar.length ? <p className="di-izoh">{__kbUi("Izoh yo‘q.")}</p>
      : Object.entries(guruhlar).map(([kod, xs]) => <div key={kod || "umumiy"} className="di-guruh">
        <h3>{kod ? <>{xs[0].dars_nomi || kod} <code>{kod}</code></> : `🌐 ${__kbUi("Umumiy izohlar")}`} <small>({xs.length})</small></h3>
        {xs.map((x) => <div key={x.id} className={`di-qator ${x.holat === "bajarildi" ? "is-bajarildi" : ""}`}>
          <span className="di-joyga">{x.qadam != null ? `#${x.qadam}${x.qadam_turi ? ` ${x.qadam_turi}` : ""}` : "•"}{x.soniya != null ? ` · ${vaqtMatn(x.soniya)}` : ""}</span>
          <span>{x.matn}{x.qadam_matn && <small className="di-doska"> «{x.qadam_matn.slice(0, 120)}»</small>}</span>
          <button type="button" onClick={() => belgila(x)} title={__kbUi("Holatni almashtirish")}>{x.holat === "yangi" ? "✅" : "↩"}</button>
          <button type="button" onClick={() => izohFetch(apiBase, `/api/dars_izoh/${x.id}`, token, { method: "DELETE" }).then(yukla)} aria-label={__kbUi("O‘chirish")}>🗑</button>
        </div>)}
      </div>)}
  </section>;
}
