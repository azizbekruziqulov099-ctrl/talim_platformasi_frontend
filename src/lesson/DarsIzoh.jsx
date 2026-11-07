// REV412: admin darsni ko'rib, aniq joyiga (qadam, soniya) izoh qoldiradi yoki umumiy izoh yozadi.
// Izohlar bazada yig'iladi; «Dars izohlari» sahifasidan bitta faylga yuklab olinib Claude'ga beriladi.
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

export function izohFetch(apiBase, yol, token, { method = "GET", body, params } = {}) {
  const base = String(apiBase || "").replace(/\/+$/, "");
  const q = new URLSearchParams({ ...(params || {}), ...(method === "GET" || method === "DELETE" ? { token } : {}) });
  return fetch(`${base}${yol}${q.toString() ? `?${q}` : ""}`, { method, headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify({ ...body, token }) : undefined }).then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : `Xato ${r.status}`); return d; });
}
export const vaqtMatn = (s) => (s == null ? "" : `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`);

export default function DarsIzoh({ apiBase, token, topicCode, darsNomi = "", fan = "", qadam = -1, qadamTuri = "", qadamMatn = "", soniya = null, onQadam }) {
  const [ochiq, setOchiq] = useState(false);
  const [matn, setMatn] = useState("");
  const [umumiy, setUmumiy] = useState(false);
  const [royxat, setRoyxat] = useState([]);
  const [xabar, setXabar] = useState("");
  const yukla = () => izohFetch(apiBase, "/api/dars_izoh", token, { params: { topic_code: topicCode } }).then((r) => setRoyxat(r.izohlar || [])).catch(() => {});
  useEffect(() => { if (ochiq) yukla(); }, [ochiq, topicCode]); // eslint-disable-line react-hooks/exhaustive-deps
  const saqla = () => {
    if (!matn.trim()) return;
    izohFetch(apiBase, "/api/dars_izoh", token, { method: "POST", body: umumiy ? { matn } : {
      topic_code: topicCode, dars_nomi: darsNomi, fan, qadam: qadam >= 0 ? qadam + 1 : null, qadam_turi: qadamTuri, qadam_matn: String(qadamMatn || "").slice(0, 590), soniya, matn } })
      .then(() => { setMatn(""); setXabar(__kbUi("✅ Saqlandi")); setTimeout(() => setXabar(""), 1600); yukla(); }).catch((e) => setXabar(e.message));
  };
  const joy = <div className="di-root">
    <button type="button" className={`di-fab ${ochiq ? "is-on" : ""}`} onClick={() => setOchiq((x) => !x)} title={__kbUi("Shu joyga izoh qoldirish")}>
      💬<span>{royxat.length || ""}</span></button>
    {ochiq && <div className="di-panel" role="dialog" aria-label={__kbUi("Dars izohi")}>
      <div className="di-bosh"><b>💬 {__kbUi("Izoh")}</b><code title={__kbUi("Dars kodi")}>{topicCode}</code><button type="button" onClick={() => setOchiq(false)} aria-label={__kbUi("Yopish")}>✕</button></div>
      <p className="di-joy">{umumiy ? __kbUi("🌐 Umumiy izoh — dars jarayoni haqida (hamma darslarga tegishli)")
        : <>📍 {qadam >= 0 ? __kbUi(`${qadam + 1}-qadam`) : __kbUi("Dars boshi")}{qadamTuri ? ` · ${qadamTuri}` : ""}{soniya != null ? ` · ⏱ ${vaqtMatn(soniya)}` : ""}</>}</p>
      {!umumiy && qadamMatn && <p className="di-doska">«{String(qadamMatn).slice(0, 160)}»</p>}
      <textarea value={matn} onChange={(e) => setMatn(e.target.value)} rows={4} maxLength={4000} autoFocus
        placeholder={__kbUi("Nima noto‘g‘ri yoki qanday bo‘lishi kerak? Masalan: «formula xato», «bu yerda rasm kerak», «ustoz tez gapiryapti»")} />
      <label className="di-umumiy"><input type="checkbox" checked={umumiy} onChange={(e) => setUmumiy(e.target.checked)} /> {__kbUi("Umumiy izoh (faqat shu dars emas, dars jarayoni haqida)")}</label>
      <div className="di-tug"><button type="button" className="di-saqla" disabled={!matn.trim()} onClick={saqla}>💾 {__kbUi("Saqlash")}</button>{xabar && <span>{xabar}</span>}</div>
      {royxat.length > 0 && <div className="di-royxat"><small>{__kbUi("Shu darsdagi izohlar")} ({royxat.length})</small>
        {royxat.map((x) => <div key={x.id} className={`di-qator ${x.holat === "bajarildi" ? "is-bajarildi" : ""}`}>
          <button type="button" className="di-joyga" disabled={x.qadam == null || !onQadam} onClick={() => onQadam?.(x.qadam - 1)} title={__kbUi("Shu qadamga o‘tish")}>
            {x.qadam != null ? `#${x.qadam}` : "•"}{x.soniya != null ? ` ${vaqtMatn(x.soniya)}` : ""}</button>
          <span>{x.matn}</span>
          <button type="button" className="di-och" onClick={() => izohFetch(apiBase, `/api/dars_izoh/${x.id}`, token, { method: "DELETE" }).then(yukla)} aria-label={__kbUi("O‘chirish")}>🗑</button>
        </div>)}</div>}
    </div>}
  </div>;
  return typeof document !== "undefined" ? createPortal(joy, document.body) : joy;
}
