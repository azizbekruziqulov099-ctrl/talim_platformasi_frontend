// REV491: hisobni o'chirish (Google Play talabi) — «O‘CHIRISH» deb yozib tasdiqlanadi; 7 kun ichida qayta kirib bekor qilish mumkin.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

const yol = (b) => String(b || "").replace(/\/+$/, "");

export default function HisobOchirish({ apiBase, token }) {
  const [ochiq, setOchiq] = useState(false), [matn, setMatn] = useState(""), [xato, setXato] = useState(""), [band, setBand] = useState(false), [tayyor, setTayyor] = useState(null);
  const yubor = async () => {
    setBand(true); setXato("");
    try {
      const r = await fetch(`${yol(apiBase)}/api/hisob/ochirish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, tasdiq: matn }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setXato(typeof d.detail === "string" ? d.detail : __kbUi("Bajarilmadi")); return; }
      setTayyor(d);
      setTimeout(() => { try { localStorage.removeItem("samtm_token"); } catch { /* */ } window.location.reload(); }, 6000);
    } catch { setXato(__kbUi("Internet bilan bog‘lanib bo‘lmadi")); } finally { setBand(false); }
  };
  return <div style={{ marginTop: 24, padding: 16, borderRadius: 16, border: "1px solid #f3c6c2", background: "#fff7f6" }}>
    <b style={{ color: "#a32a1f" }}>🗑 {__kbUi("Hisobni o‘chirish")}</b>
    <p style={{ fontSize: 14, color: "#5b4b49", margin: "6px 0 10px" }}>{__kbUi("Hisobingiz va shaxsiy ma’lumotlaringiz o‘chiriladi. 7 kun ichida qayta kirsangiz, bekor qilishingiz mumkin.")}</p>
    {!ochiq ? <button type="button" onClick={() => setOchiq(true)} style={{ border: 0, borderRadius: 12, padding: "10px 14px", background: "#fde3e0", color: "#a32a1f", fontWeight: 700, cursor: "pointer" }}>{__kbUi("Hisobni o‘chirish…")}</button>
      : tayyor ? <p role="status" style={{ fontWeight: 700 }}>✅ {__kbUi("So‘rov qabul qilindi. Hisob 7 kundan keyin o‘chiriladi. Hozir barcha qurilmalardan chiqarilasiz.")}</p>
      : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 14 }}>{__kbUi("Tasdiqlash uchun «O‘CHIRISH» deb yozing:")}<input value={matn} onChange={(e) => setMatn(e.target.value)} autoComplete="off"
          style={{ display: "block", width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "1px solid #e3c4c0" }} /></label>
        {xato && <p role="alert" style={{ color: "#a32a1f", margin: 0 }}>{xato}</p>}
        <div style={{ display: "flex", gap: 8 }}><button type="button" disabled={band || !matn.trim()} onClick={yubor} style={{ border: 0, borderRadius: 12, padding: "10px 14px", background: "#c0392b", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{__kbUi("Ha, o‘chirilsin")}</button>
          <button type="button" onClick={() => { setOchiq(false); setMatn(""); }} style={{ border: 0, background: "none", color: "#1B4B7A", fontWeight: 700, cursor: "pointer" }}>{__kbUi("Bekor")}</button></div></div>}
  </div>;
}

/** Kirgandan keyin: o'chirish so'ralgan bo'lsa — ogohlantirish va «Bekor qilish» */
export function OchirishOgohi({ apiBase, token }) {
  const [h, setH] = useState(null);
  useEffect(() => { if (token) fetch(`${yol(apiBase)}/api/hisob/ochirish?token=${encodeURIComponent(token)}`).then((r) => (r.ok ? r.json() : null)).then(setH).catch(() => {}); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!h?.soralgan) return null;
  const bekor = () => fetch(`${yol(apiBase)}/api/hisob/ochirish/bekor?token=${encodeURIComponent(token)}`, { method: "POST" }).then(() => setH(null)).catch(() => {});
  return <div role="alert" style={{ position: "fixed", left: 12, right: 12, top: 12, zIndex: 2147483100, background: "#fff3cd", border: "1px solid #f2d27a", borderRadius: 14, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center", boxShadow: "0 6px 20px rgba(0,0,0,.12)" }}>
    <span style={{ flex: 1 }}>⚠️ {__kbUi("Hisobingiz o‘chirilishi rejalashtirilgan")}: <b>{new Date(h.bajariladi).toLocaleDateString()}</b></span>
    <button type="button" onClick={bekor} style={{ border: 0, borderRadius: 10, padding: "8px 12px", background: "#1B4B7A", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{__kbUi("Bekor qilish")}</button></div>;
}
