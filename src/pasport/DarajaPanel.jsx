// REV562: «Mening darajam» — Kurslar sahifasida (O'quv markazi va Repetitor tepasida): daraja, taxminiy baho (C … A+), elementar daraja.
// Faqat pasportdagi HAQIQIY ma'lumotdan; savol kam bo'lsa daraja va baho aytilmaydi.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { matFetch } from "../matbank/matBankApi.js";
import { BAHO_RANGI } from "../matbank/matMatn.js";
import { DARAJA_RANGI, panelHolati } from "./pasportRules.js";
import "./pasport.css";

const Belgi = ({ d, b }) => <span className="ps-belgi">{d ? <span className="ps-daraja" style={{ "--r": DARAJA_RANGI[d] || "#475569" }}>{__kbUi(d.charAt(0).toUpperCase() + d.slice(1))}</span> : <span className="ps-daraja is-yoq">{__kbUi("aniqlanmagan")}</span>}
  {b && <b className="ps-baho" style={{ borderColor: BAHO_RANGI[b], color: BAHO_RANGI[b] }} title={__kbUi("Taxminiy baho")}>{b}</b>}</span>;

export default function DarajaPanel({ apiBase = "", token, onBank = null, onPasport = null }) {
  const [h, setH] = useState(null);
  useEffect(() => { if (!token) return; matFetch(apiBase, token, "/api/pasport/mening").then((p) => setH(panelHolati(p))).catch(() => setH({ bor: false, xato: true })); }, [apiBase, token]);
  if (!token || !h || h.xato) return null;
  return <section className="ps-panel" aria-label={__kbUi("Mening darajam")}>
    <h3>🎯 {__kbUi("Mening darajam")}</h3>
    {!h.bor ? <p className="ps-muted">{__kbUi("Matematika bankida test yeching: darajangiz va taxminiy bahoyingiz shu yerda ko‘rinadi.")}</p> : <>
      <div className="ps-panel-qator">
        <div><small>{__kbUi("Umumiy")}</small><Belgi d={h.daraja} b={h.baho} /><small>{h.hozirgi}% · {h.ko_rilgan} {__kbUi("savol")}</small></div>
        <div><small>{__kbUi("Elementar matematika")}</small><Belgi d={h.elementar.daraja} b={h.elementar.baho} /><small>{h.elementar.ko_rilgan ? `${h.elementar.hozirgi}% · ${h.elementar.ko_rilgan} ${__kbUi("savol")}` : __kbUi("hali yechilmagan")}</small></div>
      </div>
      {h.nozik.length > 0 && <p className="ps-izoh">⚠️ {__kbUi("Nozik mavzular")}: {h.nozik.map((t) => `${t.raqam}. ${t.nom} (${t.hozirgi}%)`).join("; ")}</p>}
      {h.daraja == null && <p className="ps-ogoh">{__kbUi("Daraja va baho kamida 15 ta savol yechilgach aytiladi.")}</p>}</>}
    <p className="ps-izoh">{__kbUi("Baho taxminiy: savollar foizi Milliy sertifikat shkalasiga qo‘yiladi (rasmiy ball boshqacha hisoblanadi).")}</p>
    <div className="ps-panel-tugmalar">{onBank && <button type="button" className="ps-btn" onClick={onBank}>📘 {__kbUi("Matematika banki")}</button>}{onPasport && <button type="button" className="ps-btn" onClick={onPasport}>📊 {__kbUi("Pasport")}</button>}</div>
  </section>;
}
