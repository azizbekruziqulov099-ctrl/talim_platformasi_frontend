// REV480: ko'nikmalar xaritasi — o'quvchi o'zini ko'radi; o'qituvchi guruhini (ekspeditsiya hisobotida).
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import "./konikma.css";

const rang = (f) => (f == null ? "#cfd8e3" : f >= 80 ? "#2e9e5b" : f >= 60 ? "#f2b72e" : "#d9534f");

export function KonikmaBarlar({ konikmalar = [], kichik = false }) {
  return <div className={`kn-bars ${kichik ? "is-kichik" : ""}`}>{konikmalar.map((k) => <div key={k.kalit} className="kn-q">
    <span className="kn-nom">{__kbUi(k.nom)}</span>
    <div className="kn-bar"><i style={{ width: `${k.foiz ?? 0}%`, background: rang(k.foiz) }} /></div>
    <b>{k.foiz == null ? "—" : `${k.foiz}%`}</b>{!kichik && <small>{k.jami ? `${k.togri}/${k.jami}` : ""}</small>}</div>)}</div>;
}

export default function KonikmaXarita({ base, token, onYop }) {
  const [d, setD] = useState(null);
  useEffect(() => { fetch(`${base}/api/konikma?token=${encodeURIComponent(token)}`).then((r) => r.json()).then(setD).catch(() => setD({ konikmalar: [] })); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const bor = (d?.konikmalar || []).some((k) => k.jami);
  const kuchli = [...(d?.konikmalar || [])].filter((k) => k.jami >= 5).sort((a, b) => b.foiz - a.foiz);
  return <div className="kn-modal" onClick={onYop}><div className="kn-ich" onClick={(e) => e.stopPropagation()}>
    <div className="kn-tepa"><b>📊 {__kbUi("Ko‘nikmalarim")}</b><button type="button" onClick={onYop} aria-label={__kbUi("Yopish")}>✕</button></div>
    {!d ? <p>⏳</p> : !bor ? <p className="kn-izoh">{__kbUi("Hali ma’lumot yo‘q — darslardagi testlar, nazoratlar va ekspeditsiyadan keyin shu yerda ko‘nikmalaringiz ko‘rinadi.")}</p>
      : <><KonikmaBarlar konikmalar={d.konikmalar} />
        {kuchli.length > 1 && <p className="kn-izoh">💪 {__kbUi("Eng kuchli")}: <b>{__kbUi(kuchli[0].nom)}</b> · 🎯 {__kbUi("Ko‘proq mashq kerak")}: <b>{__kbUi(kuchli[kuchli.length - 1].nom)}</b></p>}</>}
  </div></div>;
}
