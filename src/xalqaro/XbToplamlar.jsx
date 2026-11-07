// REV399: mavzu testlari to'plamlarga bo'lingan — har birida ~8 savol, osondan imtihon darajasigacha.
// O'quvchi qaysi to'plamni ishlayotganini, har birida nechtasini to'g'ri yechganini aniq ko'radi.
import React, { useEffect, useState } from "react";
import { xbFetch } from "./xbOvoz.js";
import { T, tf } from "./xbTil.js";

export const DARAJA = { oson: ["🟢", "Oson"], orta: ["🔵", "O‘rta"], qiyin: ["🟠", "Qiyin"], imtihon: ["🔴", "Imtihon darajasi"] };

export default function XbToplamlar({ apiBase, token, mavzu, til, onBoshla, onDars, onYopish }) {
  const [d, setD] = useState(null);
  const [xato, setXato] = useState("");
  useEffect(() => { xbFetch(apiBase, "/api/xalqaro/mavzu_toplamlar", token, { params: { mavzu: mavzu.kalit, til } }).then(setD).catch((e) => setXato(e.message)); }, [mavzu.kalit, til]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="xb-panel xb-toplamlar-sah">
    <div className="xb-bolim-bosh"><button type="button" className="xb-btn" onClick={onYopish}>← {T("Mavzular")}</button></div>
    <h3>📚 {mavzu.nom}</h3>
    {xato && <p className="xb-xato" role="alert">{xato}</p>}
    {!d ? <p className="xb-muted">⏳</p> : <>
      <p className="xb-muted">{tf("Bu mavzuda {s} ta savol, {n} ta to‘plamga bo‘lingan. Har to‘plam osondan qiyinga: oxirgisi — xalqaro imtihon darajasi.", { s: d.jami, n: d.toplamlar.length })}</p>
      {onDars && <button type="button" className="xb-btn xb-btn-yengil" onClick={onDars}>🧑‍🏫 {T("Avval darsni ko‘rish")}</button>}
      <div className="xb-tp-royxat">{d.toplamlar.map((t) => { const [b, nom] = DARAJA[t.daraja] || DARAJA.orta; const tugadi = t.ozlashtirgan >= t.soni; const hozir = d.hozirgi === t.i;
        const f = Math.round((100 * t.ozlashtirgan) / Math.max(1, t.soni));
        return <div key={t.i} className={`xb-tp ${hozir ? "is-hozir" : ""} ${tugadi ? "is-tugadi" : ""}`}>
          <div className="xb-tp-raqam">{tugadi ? "✓" : t.i}</div>
          <div className="xb-tp-matn">
            <b>{tf("{i}-to‘plam", { i: t.i })} · {b} {T(nom)}</b>
            <small>{tf("{n} ta savol", { n: t.soni })}{t.rasmli ? ` · 📊 ${tf("{r} tasi chizmali", { r: t.rasmli })}` : ""} · {tf("{o}/{n} to‘g‘ri", { o: t.ozlashtirgan, n: t.soni })}</small>
            <span className="xb-chiziq"><i style={{ width: `${f}%`, background: tugadi ? "#1f8a4c" : "#1b6fd8" }} /></span>
            {hozir && !tugadi && <span className="xb-tp-yorliq">{T("Siz shu yerdasiz")}</span>}
          </div>
          <button type="button" className={`xb-btn ${hozir ? "xb-btn-asosiy" : ""}`} onClick={() => onBoshla(t, d.toplamlar.length)}>
            {tugadi ? `🔁 ${T("Qayta")}` : t.urinilgan ? `▶ ${T("Davom etish")}` : `▶ ${T("Boshlash")}`}</button>
        </div>; })}</div>
    </>}
  </div>;
}
