// REV479: kurs nazorati — mini-test, oraliq nazorat, oylik minimum, maksimum imtihon. Savollar qamrab olingan darslarning
// test bazalaridan; har savolga vaqt (yoshga qarab), rangli chiziq; natijada — o'tdi/o'tmadi va qaysi darslarni takrorlash kerak.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { BoardText } from "../lesson/AmaliyDoska.jsx";

const vaqtSinf = (g) => { const m = /(\d+)/.exec(String(g || "")); const n = m ? Number(m[1]) : 0; return !n ? 45 : n <= 2 ? 30 : n <= 4 ? 40 : n <= 6 ? 50 : 60; };

export default function NazoratTest({ base, token, kurs, item, onYop }) {
  const [d, setD] = useState(null), [xato, setXato] = useState("");
  const [i, setI] = useState(0), [tanlov, setTanlov] = useState(null), [jav, setJav] = useState([]);
  const [qoldi, setQoldi] = useState(0), [yakun, setYakun] = useState(null);
  const vaqt = vaqtSinf(item.sinf || (kurs?.sinflar || [])[0]);
  useEffect(() => {
    fetch(`${base}/api/kurslar/nazorat?${new URLSearchParams({ token, fan: kurs.fan, grade: (kurs.sinflar || [])[0] || "", kod: item.topic_code })}`)
      .then(async (r) => { const x = await r.json().catch(() => ({})); if (!r.ok) throw new Error(x.detail || `Xato ${r.status}`); setD(x); })
      .catch((e) => setXato(String(e.message || e)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const S = d?.savollar || [], q = S[i];
  useEffect(() => { setQoldi(vaqt); }, [i, d]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!q || tanlov !== null || yakun) return undefined;
    const t = setInterval(() => setQoldi((x) => { if (document.visibilityState !== "visible") return x; if (x <= 0.25) { clearInterval(t); javob(-1); return 0; } return x - 0.25; }), 250);
    return () => clearInterval(t);
  }, [q, tanlov, yakun]); // eslint-disable-line react-hooks/exhaustive-deps
  const javob = (k) => { if (tanlov !== null || !q) return; setTanlov(k); setJav((o) => [...o, { ok: k === q.togri, dars: q.dars, dars_nomi: q.dars_nomi, soniya: vaqt - qoldi }]); };
  const keyingi = async () => {
    if (i + 1 < S.length) { setI(i + 1); setTanlov(null); return; }
    const togri = jav.filter((x) => x.ok).length;
    const xatoD = [...new Set(jav.filter((x) => !x.ok).map((x) => x.dars))];
    const r = await fetch(`${base}/api/kurslar/nazorat_natija`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, fan: kurs.fan, grade: (kurs.sinflar || [])[0] || "", kod: item.topic_code, tur: d.tur, togri, jami: S.length, xato_darslar: xatoD }) })
      .then((x) => x.json()).catch(() => ({}));
    setYakun({ togri, jami: S.length, ...r, xatoD: xatoD.map((tc) => jav.find((x) => x.dars === tc)?.dars_nomi || tc) });
  };
  if (xato) return <div className="nz"><p className="kk-xato">{xato}</p><button type="button" className="kk-ortga" onClick={onYop}>← {__kbUi("Ortga")}</button></div>;
  if (!d) return <div className="nz"><p className="kk-p">⏳</p></div>;
  if (!S.length) return <div className="nz"><h2>{d.nomi}</h2><p>{__kbUi("Bu darslarda hali test savollari yo‘q.")}</p><button type="button" className="kk-ortga" onClick={onYop}>← {__kbUi("Ortga")}</button></div>;
  if (yakun) return <div className="nz nz-yakun">
    <div className="nz-belgi">{yakun.otdi ? "🏆" : "📚"}</div>
    <h2>{yakun.otdi ? __kbUi("Nazoratdan o‘tdingiz!") : __kbUi("Bu safar o‘tmadi")}</h2>
    <p className="nz-foiz"><b>{yakun.togri}</b> / {yakun.jami} · {yakun.foiz ?? Math.round((100 * yakun.togri) / yakun.jami)}% <small>({__kbUi("kerak")}: {yakun.kerak ?? d.otish_foiz}%)</small></p>
    {yakun.xatoD.length > 0 && <div className="nz-takror"><b>{__kbUi("Shu darslarni qayta ko‘rib chiqing:")}</b><ul>{yakun.xatoD.map((n) => <li key={n}>{n}</li>)}</ul></div>}
    {!yakun.otdi && <p className="nz-izoh">🌙 {__kbUi("Qayta topshirish — ertaga. Bugun xato qilgan darslaringizni takrorlang.")}</p>}
    <button type="button" className="kk-ortga" onClick={onYop}>← {__kbUi("Kursga qaytish")}</button></div>;
  const u = qoldi / vaqt;
  return <div className="nz">
    <div className="nz-tepa"><button type="button" className="kk-ortga" onClick={onYop}>←</button><b>{d.nomi}</b><span>{i + 1} / {S.length}</span></div>
    {d.kamera && <p className="nz-izoh">📷 {__kbUi("Rasmiy imtihon: keyinchalik kamera bilan kuzatiladi.")}</p>}
    <div className="nz-vaqt"><i style={{ width: `${Math.max(0, u * 100)}%`, background: u > 0.5 ? "#2e9e5b" : u > 0.25 ? "#f2b72e" : "#d9534f" }} /><b>{Math.ceil(qoldi)} s</b></div>
    <div className="nz-savol"><BoardText text={String(q.savol || "").replace(/\[\/?[a-z]{2,3}\]/g, "")} /></div>
    <div className="nz-var">{(q.variantlar || []).map((o, k) => <button key={k} type="button" disabled={tanlov !== null} onClick={() => javob(k)}
      className={tanlov === null ? "" : k === q.togri ? "is-ok" : k === tanlov ? "is-no" : ""}>{"ABCDEF"[k]}) <BoardText text={String(o)} /></button>)}</div>
    {tanlov !== null && <div className="nz-fikr">{tanlov === -1 ? __kbUi("⏰ Vaqt tugadi.") : tanlov === q.togri ? __kbUi("✅ To‘g‘ri!") : __kbUi("❌ Noto‘g‘ri.")}
      {q.izoh && tanlov !== q.togri && <div className="nz-izoh"><BoardText text={String(q.izoh)} /></div>}
      <button type="button" className="nz-btn" onClick={keyingi}>{i + 1 < S.length ? __kbUi("Keyingi") : __kbUi("Natija")} →</button></div>}
  </div>;
}
