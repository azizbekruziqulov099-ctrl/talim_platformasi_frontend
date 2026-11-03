// REV282: imtihon strategiyalari — bo'lim bo'yicha: qadamlar, misol, tekshiruv mashqi (izohi bilan)
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
const BOL = [["listening", "🎧 Listening"], ["reading", "📖 Reading"], ["writing", "✍️ Writing"], ["speaking", "🗣 Speaking"]];
export default function Strategiyalar({ base, onYop }) {
  const til = (() => { const t = String(document.documentElement.lang || "uz").slice(0, 2); return ["ru", "en"].includes(t) ? t : "uz"; })();
  const [d, setD] = useState(null); const [bolim, setBolim] = useState("listening"); const [tanlov, setTanlov] = useState({}); const [xato, setXato] = useState("");
  useEffect(() => { fetch(`${base}/api/markaz/strategiya?${new URLSearchParams({ til })}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((x) => setD(x.strategiyalar)).catch(() => setXato(__kbUi("Ma’lumotni yuklab bo‘lmadi. Internetni tekshirib, qayta urinib ko‘ring."))); }, []); // eslint-disable-line
  return <div className="mk-test" role="dialog" aria-modal="true" aria-label={__kbUi("Imtihon strategiyalari")}>
    <div className="mk-test-ich mk-sinov">
      <button type="button" className="mk-yop" onClick={onYop} aria-label={__kbUi("Yopish")}>✕</button>
      <h3>🧭 {__kbUi("Imtihon strategiyalari")}</h3>
      <p className="mk-izoh">{__kbUi("Har bo‘lim uchun: nima qilish kerak, misol va bitta tekshiruv mashqi.")}</p>
      <div className="mk-chiplar">{BOL.map(([b, n]) => <button key={b} type="button" className={`mk-chip ${bolim === b ? "is-on" : ""}`} onClick={() => setBolim(b)}>{n}</button>)}</div>
      {xato && <p className="mk-xato" role="alert">{xato}</p>}
      {!d && !xato && <p role="status">{__kbUi("Yuklanmoqda…")}</p>}
      {d && d.filter((x) => x.bolim === bolim).map((s) => { const t = tanlov[s.id]; return <div key={s.id} className="mk-blok">
        <h4>{s.nom}</h4>
        <ol>{s.qadamlar.map((q, i) => <li key={i}>{q}</li>)}</ol>
        <p className="mk-oqish" lang="en">💡 {s.misol}</p>
        <p lang="en"><b>✅ {s.mashq.savol}</b></p>
        <div className="mk-chiplar">{s.mashq.variantlar.map((v, n) => <button key={n} type="button" lang="en" className={`mk-chip ${t == null ? "" : n === s.mashq.javob ? "is-togri" : n === t ? "is-xato" : ""}`} onClick={() => setTanlov((x) => ({ ...x, [s.id]: n }))}>{v}</button>)}</div>
        {t != null && <p className="mk-izoh">{t === s.mashq.javob ? "🌟 " : "🔁 "}{s.mashq.izoh}</p>}
      </div>; })}
    </div>
  </div>;
}
