// REV564: Repetitor darsi — maqsad, tushuncha, misol tahlili, xatolar, esda tut, o'zini tekshir. Server: GET /api/matbank/dars/{raqam}.
// Misol savoli va variantlari bankdan keladi (dars faylida emas), shuning uchun savol va javob kaliti buzilmaydi.
import React from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import MatMatn, { SavolMatn, VariantMatn } from "./MatMatn.jsx";
import { HARFLAR, QIYINLIK_NOMI } from "./matMatn.js";

const Bolim = ({ belgi, nom, sinf = "", children }) => <article className={`mb-karta ds-bolim ${sinf}`}><h5 className="mb-sar">{belgi} {__kbUi(nom)}</h5>{children}</article>;

export default function Dars({ d, onTekshir, onTest }) {
  return <div className="ds-root">
    {d.bob && <p className="ds-bob">{d.bob}</p>}
    <Bolim belgi="🎯" nom="Maqsad" sinf="ds-maqsad"><MatMatn matn={d.maqsad} /></Bolim>
    <Bolim belgi="🔙" nom="Oldin bilish kerak"><MatMatn matn={d.oldin_bil} /></Bolim>
    {d.tushuncha.map((t, i) => <article key={i} className="mb-karta ds-bolim"><h5 className="mb-sar">{t.sarlavha}</h5><MatMatn matn={t.matn} /></article>)}
    <h4 className="ds-bosh">✏️ {__kbUi("Misol tahlili")}</h4>
    {d.misollar.map((x, i) => <article key={i} className="mb-karta ds-misol">
      <h5 className="mb-sar">{x.nom}<small className="mb-tur"> · ({x.manba}){x.qiyinlik ? ` · ${__kbUi(QIYINLIK_NOMI[x.qiyinlik])}` : ""}</small></h5>
      <SavolMatn matn={x.savol} />
      <div className="mb-variantlar">{x.variantlar.map((v, k) => <div key={k} className="mb-variant mb-ko-variant"><span className="mb-harf">{HARFLAR[k]}</span><VariantMatn matn={v} /></div>)}</div>
      <MatMatn matn={x.matn} />
    </article>)}
    <Bolim belgi="⚠️" nom="Ko‘p uchraydigan xatolar" sinf="ds-xato"><MatMatn matn={d.xatolar} /></Bolim>
    <Bolim belgi="📌" nom="Esda tuting" sinf="ds-esda"><MatMatn matn={d.esda_tut} /></Bolim>
    <article className="mb-karta ds-tekshir"><h5 className="mb-sar">🧪 {__kbUi("O‘zingizni tekshiring")}</h5>
      <p className="mb-izoh">{__kbUi("Shu mavzudan bir nechta savol: darsni o‘qigach yeching. To‘g‘ri javoblar oxirida ko‘rsatiladi.")}</p>
      <button type="button" className="mb-btn mb-asosiy" onClick={() => onTekshir(d.tekshir_ids)}>▶ {__kbUi("O‘zini tekshirish")} ({d.tekshir_ids.length})</button>
      {onTest && <button type="button" className="mb-btn" onClick={onTest}>📝 {__kbUi("Mavzu bo‘yicha test")}</button>}</article>
  </div>;
}
