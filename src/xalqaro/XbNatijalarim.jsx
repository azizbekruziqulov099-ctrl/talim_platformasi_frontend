// REV381: o'quvchining «📊 Natijalarim» sahifasi — hamma narsa bir joyda va foizlarda:
// umumiy ko'rsatkichlar, har mavzu bo'yicha o'zlashtirish (foiz chizig'i, aniqlik), imtihonlar va ularning tarixi.
import React, { useEffect, useState } from "react";
import { xbFetch } from "./xbOvoz.js";
import { T, tf } from "./xbTil.js";

const rang = (f) => (f >= 70 ? "#1f8a4c" : f >= 40 ? "#1b6fd8" : f > 0 ? "#c77d00" : "#9aa3af");

export default function XbNatijalarim({ apiBase, token, kat, toplam, til, onMashq, onDars }) {
  const [imt, setImt] = useState(null);
  useEffect(() => { xbFetch(apiBase, "/api/xalqaro/imtihonlar", token, { params: { toplam, til } }).then(setImt).catch(() => setImt({ imtihonlar: [] })); }, [toplam, til]); // eslint-disable-line react-hooks/exhaustive-deps
  const tp = kat?.toplamlar?.find((t) => t.kalit === toplam);
  if (!tp) return null;
  const m = tp.mavzular || [];
  const jami = m.reduce((a, x) => a + (x.holat?.jami || 0), 0);
  const ozl = m.reduce((a, x) => a + (x.holat?.ozlashtirgan || 0), 0);
  const boshl = m.filter((x) => x.holat?.urinilgan > 0).length;
  const aniq = m.map((x) => x.holat?.aniqlik).filter((x) => x != null);
  const umumiy = Math.round((100 * ozl) / Math.max(1, jami));
  const tartib = [...m].sort((a, b) => (a.holat?.foiz ?? 0) - (b.holat?.foiz ?? 0));
  return <div className="xb-panel xb-natijalarim">
    <h3>📊 {T("Natijalarim")}: {tp.dastur === "PISA" ? `PISA · ${tp.fan_nomi}` : `TIMSS · ${tf("{n}-sinf", { n: tp.sinf })} · ${tp.fan_nomi}`}</h3>
    <div className="xb-kartalar">
      <div className="xb-karta"><small>{T("Umumiy o‘zlashtirish")}</small><b style={{ color: rang(umumiy) }}>{umumiy}%</b><span className="xb-chiziq"><i style={{ width: `${umumiy}%`, background: rang(umumiy) }} /></span></div>
      <div className="xb-karta"><small>{T("O‘zlashtirilgan savollar")}</small><b>{ozl} / {jami}</b></div>
      <div className="xb-karta"><small>{T("Boshlangan mavzular")}</small><b>{boshl} / {m.length}</b></div>
      <div className="xb-karta"><small>{T("Javoblar aniqligi")}</small><b>{aniq.length ? `${Math.round(aniq.reduce((a, b) => a + b, 0) / aniq.length)}%` : "—"}</b></div>
    </div>
    <h4>📚 {T("Mavzular bo‘yicha")} <small className="xb-muted">({T("eng zaifi tepada")})</small></h4>
    <div className="xb-nat-mavzular">{tartib.map((x) => { const h = x.holat || {}; const f = h.foiz || 0;
      return <div key={x.kalit} className="xb-nat-mavzu">
        <div className="xb-nat-nom"><b>{x.nom}</b><small className="xb-muted">{h.urinilgan ? tf("{a}/{b} savol o‘zlashtirildi · aniqlik {c}%", { a: h.ozlashtirgan, b: h.jami, c: h.aniqlik ?? 0 }) : T("Hali boshlanmagan")}</small></div>
        <div className="xb-nat-foiz"><span className="xb-chiziq"><i style={{ width: `${f}%`, background: rang(f) }} /></span><b style={{ color: rang(f) }}>{f}%</b></div>
        <div className="xb-nat-tugma">
          {onDars && <button type="button" className="xb-btn xb-btn-yengil" onClick={() => onDars(x)}>📖 {T("Dars")}</button>}
          <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => onMashq(x)}>✍️ {T("Mashq")}</button>
        </div>
      </div>; })}</div>
    <h4>📝 {T("Imtihonlar")}</h4>
    {!imt ? <p className="xb-muted">⏳</p> : <div className="xb-nat-imt">{(imt.imtihonlar || []).map((e) => <div key={e.tur} className="xb-nat-imt-q">
      <b>{e.nom}</b>
      {e.natija ? <span>✅ {tf("{f}% · {b} ball", { f: e.natija.foiz ?? "—", b: e.natija.ball ?? "—" })}</span> : <span className="xb-muted">{T("Bu davrda hali topshirilmagan")}</span>}
      {e.tarix?.length > 0 && <small className="xb-muted">{T("Oldingilari")}: {e.tarix.map((t) => `${t.foiz ?? "—"}%`).join(" · ")}</small>}
    </div>)}</div>}
  </div>;
}
