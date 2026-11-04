import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

/** REV308: bo'lim yuklanayotganda — aylanuvchi belgi; 15 soniyadan keyin «internet sekin» izohi va qayta urinish. */
export default function Yuklanmoqda({ matn = "Dars yuklanmoqda…" }) {
  const [sekin, setSekin] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSekin(true), 15000); return () => clearTimeout(t); }, []);
  return <div role="status" style={{ display: "grid", placeItems: "center", gap: 10, padding: "36px 16px", textAlign: "center", color: "#475569" }}>
    <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: "50%", border: "4px solid #dbe4ee", borderTopColor: "#1b4b7a", animation: "kbAylan 0.9s linear infinite" }} />
    <style>{"@keyframes kbAylan{to{transform:rotate(360deg)}}"}</style>
    <b style={{ fontSize: 15 }}>{__kbUi(matn)}</b>
    {sekin && <>
      <small style={{ maxWidth: 320, lineHeight: 1.5 }}>{__kbUi("Internet sekin ishlayapti — dars fayllari yuklanmoqda. Biroz kuting yoki qayta urinib ko‘ring.")}</small>
      <button type="button" onClick={() => location.reload()} style={{ border: 0, borderRadius: 12, background: "#1b4b7a", color: "#fff", padding: "10px 18px", fontWeight: 700 }}>{__kbUi("↻ Qayta urinish")}</button>
    </>}
  </div>;
}
