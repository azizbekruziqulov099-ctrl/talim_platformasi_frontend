// REV531: tabiat va geografiya o'yinlari — viloyatlar (sxematik xarita), poytaxt va bayroqlar, tabiat zonalari.
import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import { VILOYATLAR, viloyatYasa, davlatYasa, zonaYasa } from "./geoRules.js";

const RANG = ["#f6d7a7", "#bfe0c8", "#c7d9f2", "#f3c6c6", "#e3d0f0", "#fbe9a5", "#c9ece8", "#f7cfa0", "#d5e8b0", "#f2c9e0", "#cfd8f7", "#ffe0b5", "#c8eed0"];

function Viktorina({ savollar, onYutdi, Savol }) {   // 8 savol, yulduz uchun 6 ta to'g'ri — umumiy qobiq
  const [i, setI] = useState(0), [tan, setTan] = useState(null), [togri, setTogri] = useState(0);
  useEffect(() => { setI(0); setTan(null); setTogri(0); }, [savollar]);
  if (i >= savollar.length) return <div className="mq-oyin"><p className={togri >= 6 ? "mq-yutdi" : "mq-xato"}>{togri >= 6 ? "🎉 " : ""}{togri} / {savollar.length} {__kbUi("to‘g‘ri")}</p>
    {togri < 6 && <p className="mq-izoh">{__kbUi("Yulduz uchun kamida 6 ta to‘g‘ri javob kerak. «Boshqa topshiriq»ni bosib qayta urinib ko‘ring.")}</p>}</div>;
  const q = savollar[i]; const javob = (ok) => { if (tan !== null) return; setTan(ok ? 1 : 0); if (ok) setTogri((x) => x + 1); };
  return <div className="mq-oyin"><p className="mq-izoh">{i + 1} / {savollar.length}</p>
    <Savol q={q} tan={tan} javob={javob} />
    {tan !== null && <><p className={tan ? "mq-yutdi" : "mq-xato"} style={{ fontSize: 15 }}>{tan ? "✅ " : "❌ "}{__kbUi(q.izoh)}</p>
      <button type="button" className="mq-asosiy" onClick={() => { if (i + 1 >= savollar.length && togri >= 6) onYutdi(); setI(i + 1); setTan(null); }}>{__kbUi("Keyingi")} ▶</button></>}
  </div>;
}
function Variantlar({ q, tan, javob }) {
  const [bosilgan, setBosilgan] = useState(null); useEffect(() => { setBosilgan(null); }, [q]);
  return <div className="mq-sonlar" style={{ flexWrap: "wrap", justifyContent: "center" }}>{q.variantlar.map((v, k) => <button key={v} type="button" disabled={tan !== null} onClick={() => { setBosilgan(k); javob(k === q.togri); }}
    style={{ minWidth: 130, padding: "0 12px", fontSize: 17, background: tan === null ? "#fff3c4" : k === q.togri ? "#bfe6cd" : k === bosilgan ? "#fdecea" : "#f4f6f9" }}>{__kbUi(v)}</button>)}</div>;
}

function Xarita({ shu, bosilgan, onBos, yozuv }) {
  return <svg viewBox="0 0 312 195" style={{ width: "100%", maxWidth: 560, touchAction: "manipulation" }}>
    {VILOYATLAR.map(([k, nom, , poly, [x, y]], n) => <g key={k} onClick={() => onBos?.(k)} style={{ cursor: onBos ? "pointer" : "default" }}>
      <polygon points={poly} fill={shu === k ? "#2e9e5b" : bosilgan === k ? "#d9534f" : RANG[n]} stroke="#13314f" strokeWidth="1.2" strokeLinejoin="round" />
      {(yozuv || shu === k) && <text x={x} y={y} fontSize={k === "qq" || k === "na" ? 8 : 5.2} textAnchor="middle" fill="#13314f" fontWeight="700" style={{ pointerEvents: "none" }}>{nom.replace(" viloyati", "")}</text>}</g>)}
    {/* REV531: Farg'ona vodiysi kichik — telefonda bosish oson bo'lishi uchun 2 barobar kattalashtirilgan nusxasi */}
    <rect x="220" y="104" width="90" height="86" rx="6" fill="#fff" stroke="#b9c6d6" strokeDasharray="3 2" /><text x="224" y="112" fontSize="5" fill="#5b6573">{__kbUi("Farg‘ona vodiysi (kattalashtirilgan)")}</text>
    <g transform="translate(223 118) scale(1.7) translate(-248 -56)">{VILOYATLAR.map(([k, nom, , poly, [x, y]], n) => (["nm", "an", "fa"].includes(k) ? <g key={k} onClick={() => onBos?.(k)} style={{ cursor: onBos ? "pointer" : "default" }}>
      <polygon points={poly} fill={shu === k ? "#2e9e5b" : bosilgan === k ? "#d9534f" : RANG[n]} stroke="#13314f" strokeWidth="0.7" strokeLinejoin="round" />
      {(yozuv || shu === k) && <text x={x} y={y} fontSize="4" textAnchor="middle" fill="#13314f" fontWeight="700" style={{ pointerEvents: "none" }}>{nom}</text>}</g> : null))}</g>
    <circle cx="236" cy="60" r="3.2" fill="#d9534f" stroke="#fff" strokeWidth="1" style={{ pointerEvents: "none" }} />
    <circle cx="66" cy="186" r="3" fill="#d9534f" /><text x="72" y="188.5" fontSize="6" fill="#13314f">{__kbUi("Toshkent shahri")}</text>
    <text x="6" y="188.5" fontSize="6" fill="#8a94a3">{__kbUi("sxematik xarita")}</text></svg>;
}
export function Viloyatlar({ daraja, urug, onYutdi }) {
  const t = useMemo(() => viloyatYasa(urug, daraja, 8), [urug, daraja]);
  const Savol = ({ q, tan, javob }) => { const [bos, setBos] = useState(null); useEffect(() => { setBos(null); }, [q]);
    if (q.tur === "markaz") return <><div className="mq-nishon" style={{ fontSize: 16, textAlign: "center" }}>{__kbUi("Markazi qaysi shahar?")}<br /><b style={{ fontSize: 24 }}>{q.matn}</b></div>
      <Xarita shu={q.javob} /><Variantlar q={q} tan={tan} javob={javob} /></>;
    return <><div className="mq-nishon" style={{ fontSize: 16, textAlign: "center" }}>{__kbUi("Xaritadan toping")}:<br /><b style={{ fontSize: 22 }}>{__kbUi(q.matn)}</b></div>
      <Xarita shu={tan !== null ? q.javob : null} bosilgan={tan === 0 ? bos : null} yozuv={tan !== null} onBos={tan === null ? (k) => { setBos(k); javob(k === q.javob); } : null} /></>; };
  return <Viktorina savollar={t} onYutdi={onYutdi} Savol={Savol} />;
}

export function Davlatlar({ daraja, urug, onYutdi }) {
  const t = useMemo(() => davlatYasa(urug, daraja, 8), [urug, daraja]);
  const Savol = ({ q, tan, javob }) => <><div className="mq-nishon" style={{ fontSize: 16, textAlign: "center" }}>{q.tur === "bayroq" ? __kbUi("Bu qaysi davlat bayrog‘i?") : q.tur === "poytaxt" ? __kbUi("Poytaxti qaysi shahar?") : __kbUi("Bu shahar qaysi davlat poytaxti?")}<br />
    <b style={{ fontSize: q.tur === "bayroq" ? 72 : 26, lineHeight: 1.1 }}>{q.tur === "bayroq" ? q.matn : __kbUi(q.matn)}</b></div><Variantlar q={q} tan={tan} javob={javob} /></>;
  return <Viktorina savollar={t} onYutdi={onYutdi} Savol={Savol} />;
}

export function Zonalar({ daraja, urug, onYutdi }) {
  const t = useMemo(() => zonaYasa(urug, daraja, 8), [urug, daraja]);
  const Savol = ({ q, tan, javob }) => <><div className="mq-nishon" style={{ fontSize: 16, textAlign: "center" }}>{__kbUi("Bu qaysi tabiat zonasiga xos?")}<br />
    <b style={{ fontSize: 56, lineHeight: 1.1 }}>{q.belgi}</b><br /><b style={{ fontSize: 19 }}>{__kbUi(q.matn)}</b></div><Variantlar q={q} tan={tan} javob={javob} /></>;
  return <Viktorina savollar={t} onYutdi={onYutdi} Savol={Savol} />;
}
