import React, { useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import "./kursTolov.css";

/** REV301: kurs yopiq darsi — narx va to'lov (Click / Payme). Onlayn to'lov ulanmagan bo'lsa — admin bilan bog'lanish. */
export const somFmt = (n) => `${Number(n || 0).toLocaleString("ru-RU").replace(/,/g, " ")} so‘m`;

export default function KursTolov({ apiBase, token, kurs, onClose }) {
  const [holat, setHolat] = useState({ busy: false, havolalar: null, xabar: "" });
  const base = String(apiBase || "").replace(/\/+$/, "");
  const tolash = async () => {
    setHolat({ busy: true, havolalar: null, xabar: "" });
    try {
      const res = await fetch(`${base}/api/kurslar/buyurtma`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, kalit: kurs.kalit, return_url: typeof location !== "undefined" && location.protocol === "https:" ? location.href : "" }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : d.detail?.xabar || `Xato ${res.status}`);
      setHolat({ busy: false, havolalar: d.havolalar || {}, xabar: "" });
    } catch (e) { setHolat({ busy: false, havolalar: null, xabar: e.message }); }
  };
  return <div className="kt-oyna" role="dialog" aria-modal="true" aria-label={__kbUi("Kursni ochish")}>
    <div className="kt-karta">
      <div className="kt-qulf" aria-hidden="true">🔒</div>
      <h2>{kurs.nomi}</h2>
      <p>{__kbUi(`Bu kursning birinchi ${kurs.bepul ?? 5} ta darsi bepul. Qolgan darslar kurs ochilgach ko‘rinadi.`)}</p>
      {Number(kurs.narx) > 0 && <p className="kt-narx">{somFmt(kurs.narx)} <small>{__kbUi("/ 30 kun")}</small></p>}
      {!holat.havolalar && <button type="button" className="kt-tugma" disabled={holat.busy} onClick={tolash}>{holat.busy ? "…" : __kbUi("💳 Kursni ochish")}</button>}
      {holat.havolalar && <div className="kt-havolalar">
        {holat.havolalar.click && <a className="kt-tugma" href={holat.havolalar.click}>Click</a>}
        {holat.havolalar.payme && <a className="kt-tugma kt-payme" href={holat.havolalar.payme}>Payme</a>}
        <small>{__kbUi("To‘lovdan keyin sahifani yangilang — kurs ochiladi.")}</small></div>}
      {holat.xabar && <p className="kt-xabar" role="alert">{__kbUi(holat.xabar)}</p>}
      {onClose && <button type="button" className="kt-yopish" onClick={onClose}>{__kbUi("Orqaga")}</button>}
    </div>
  </div>;
}
