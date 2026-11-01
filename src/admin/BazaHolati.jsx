// REV248: «Baza holati» — admin uchun. Bazaning hajmi, ulanishlar, kesh, eng katta jadvallar, sekin so'rovlar.
// Faqat o'qiydi. Rang: yashil — yaxshi, sariq — kuzatish kerak, qizil — choralar kerak.
import React, { useCallback, useEffect, useState } from "react";
import { uiText as uiT } from "../interface/interfaceRuntime.js";

const holat = (yaxshi, ogohlik) => (yaxshi ? "#1D9E75" : ogohlik ? "#E8A33D" : "#C0392B");
function Jadval({ qatorlar, ustunlar }) {
  if (!Array.isArray(qatorlar)) return <p style={{ color: "#C0392B" }}>{qatorlar?.xato || uiT("Ma’lumot yo‘q")}</p>;
  if (!qatorlar.length) return <p style={{ color: "#5F6B76" }}>{uiT("Muammo topilmadi")} ✓</p>;
  return <div style={{ overflowX: "auto" }}><table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
    <thead><tr>{ustunlar.map(([k, n]) => <th key={k} style={{ textAlign: "left", padding: "6px 8px", borderBottom: "2px solid #E5E1D8" }}>{uiT(n)}</th>)}</tr></thead>
    <tbody>{qatorlar.map((q, i) => <tr key={i}>{ustunlar.map(([k]) => <td key={k} style={{ padding: "6px 8px", borderBottom: "1px solid #EEE", fontFamily: k === "sorov" ? "monospace" : undefined }}>{String(q[k] ?? "")}</td>)}</tr>)}</tbody>
  </table></div>;
}
const mb = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round((b || 0) / 1024)} KB`);
// REV250: bazani yengillatish — avval hisoblaydi, keyin admin tasdiqlasa tozalaydi (faqat ishlatilmaydigan ma'lumot)
function Yengillatish({ apiBase, token }) {
  const [t, setT] = useState(null); const [ish, setIsh] = useState(""); const [tan, setTan] = useState({});
  const url = (bajar, turlar = "") => `${String(apiBase).replace(/\/+$/, "")}/api/admin/baza_tozalash?token=${encodeURIComponent(token)}&bajar=${bajar}${turlar ? `&turlar=${turlar}` : ""}`;
  const hisobla = async () => { setIsh("hisob"); try { const r = await fetch(url(0)); const d = await r.json(); setT(d); setTan(Object.fromEntries(Object.entries(d.turlar || {}).map(([k, v]) => [k, !v.xato && v.soni > 0]))); } finally { setIsh(""); } };
  const tozala = async () => {
    const turlar = Object.keys(tan).filter((k) => tan[k]).join(",");
    if (!turlar || !window.confirm(uiT("Belgilangan ma’lumotlar o‘chiriladi. Darslar, mavzular va foydalanuvchilarga tegilmaydi. Davom etamizmi?"))) return;
    setIsh("toza"); try { const r = await fetch(url(1, turlar)); setT(await r.json()); } finally { setIsh(""); }
  };
  const jami = t ? Object.entries(t.turlar || {}).filter(([k]) => tan[k]).reduce((a, [, v]) => a + (v.bayt || 0), 0) : 0;
  return <div style={{ marginTop: 26, padding: 16, border: "1px solid #E5E1D8", borderRadius: 14, background: "#fff" }}>
    <h2 style={{ fontSize: 18, fontWeight: 800, marginTop: 0 }}>{uiT("Bazani yengillatish")}</h2>
    <p style={{ color: "#5F6B76", fontSize: 13 }}>{uiT("Faqat ishlatilmaydigan ma’lumot: xom fayllar, takror rasmlar, eski ovozlar. Avval «Hisoblash» — hech narsa o‘chmaydi.")}</p>
    <button type="button" onClick={hisobla} disabled={!!ish} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #D2DEEE", background: "#fff", fontWeight: 700 }}>{ish === "hisob" ? uiT("Hisoblanmoqda…") : `🔍 ${uiT("Hisoblash")}`}</button>
    {t && <><table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13, marginTop: 12 }}><tbody>
      {Object.entries(t.turlar || {}).map(([k, v]) => <tr key={k}>
        <td style={{ padding: 6, width: 30 }}><input type="checkbox" checked={!!tan[k]} disabled={!!v.xato || !v.soni} onChange={(e) => setTan({ ...tan, [k]: e.target.checked })} /></td>
        <td style={{ padding: 6 }}>{uiT(v.nomi)}<div style={{ color: "#8A95A0", fontSize: 12 }}>{v.jadval}</div></td>
        <td style={{ padding: 6, textAlign: "right" }}>{v.xato ? <span style={{ color: "#C0392B" }}>{v.xato}</span> : `${v.soni} · ${mb(v.bayt)}`}</td>
        <td style={{ padding: 6, textAlign: "right", color: "#1D9E75" }}>{t.bajarildi ? `✓ ${v.tozalandi}` : ""}</td>
      </tr>)}</tbody></table>
      {!t.bajarildi ? <button type="button" onClick={tozala} disabled={!!ish || !jami} style={{ marginTop: 12, padding: "10px 16px", borderRadius: 10, border: 0, background: "#C0392B", color: "#fff", fontWeight: 800 }}>{ish === "toza" ? uiT("Tozalanmoqda…") : `🧹 ${uiT("Belgilanganlarni tozalash")} (${mb(jami)})`}</button>
        : <p style={{ color: "#1D9E75", fontWeight: 700 }}>{uiT("Tozalandi. Joy fonda bo‘shatilmoqda — 10–20 daqiqadan keyin «Yangilash» bosing.")}</p>}</>}
  </div>;
}
export default function BazaHolati({ apiBase = "", token = "" }) {
  const [d, setD] = useState(null);
  const [xato, setXato] = useState("");
  const [yuk, setYuk] = useState(false);
  const ol = useCallback(async () => {
    setYuk(true); setXato("");
    try {
      const r = await fetch(`${String(apiBase).replace(/\/+$/, "")}/api/admin/baza_holati?token=${encodeURIComponent(token)}`);
      if (!r.ok) throw new Error(`${r.status}`);
      setD(await r.json());
    } catch (e) { setXato(String(e.message || e)); } finally { setYuk(false); }
  }, [apiBase, token]);
  useEffect(() => { ol(); }, [ol]);
  const b = d?.baza || {};
  const foiz = b.max_ulanish ? Math.round((b.ulanish / b.max_ulanish) * 100) : 0;
  const kesh = d?.kesh?.kesh_foiz;
  const karta = (nom, qiymat, rang, izoh) => <div style={{ flex: "1 1 180px", background: "#fff", border: "1px solid #E5E1D8", borderRadius: 14, padding: 14, borderTop: `4px solid ${rang}` }}>
    <div style={{ fontSize: 13, color: "#5F6B76" }}>{uiT(nom)}</div><div style={{ fontSize: 24, fontWeight: 800, color: "#21384C" }}>{qiymat}</div>
    {izoh && <div style={{ fontSize: 12, color: "#5F6B76" }}>{uiT(izoh)}</div>}</div>;
  return <div style={{ padding: 20, maxWidth: 1200 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{uiT("Baza holati")}</h1>
      <button type="button" onClick={ol} disabled={yuk} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #D2DEEE", background: "#fff", fontWeight: 700 }}>{yuk ? uiT("Yuklanmoqda…") : `🔄 ${uiT("Yangilash")}`}</button>
      {d?.vaqt && <span style={{ color: "#5F6B76", fontSize: 13 }}>{d.vaqt}</span>}
    </div>
    {xato && <p style={{ color: "#C0392B" }}>{uiT("Xato")}: {xato}</p>}
    {d && <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        {karta("Baza hajmi", b.hajm || "—", holat((b.bayt || 0) < 5e9, (b.bayt || 0) < 2e10))}
        {karta("Ulanishlar", `${b.ulanish ?? "—"} / ${b.max_ulanish ?? "—"}`, holat(foiz < 60, foiz < 85), `${foiz}% · ${uiT("faol")}: ${b.faol ?? 0}`)}
        {karta("Osilib qolgan tranzaksiyalar", b.osilgan ?? "—", holat(!b.osilgan, (b.osilgan || 0) < 3))}
        {karta("Kesh samarasi", kesh != null ? `${kesh}%` : "—", holat((kesh || 0) >= 99, (kesh || 0) >= 95), "99% dan yuqori — yaxshi")}
        {karta("Ovoz keshi (bazada)", d?.ovoz_kesh?.hajm || "—", "#5B86D6", `${d?.ovoz_kesh?.soni ?? 0} ${uiT("ta gap")}`)}
        {karta("Har havza / worker", `${d?.havza?.har_havza} · ${d?.havza?.worker}`, "#5B86D6", `${uiT("chegara")}: ${d?.havza?.chegara}`)}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 800 }}>{uiT("Eng katta jadvallar")}</h2>
      <Jadval qatorlar={d.jadvallar} ustunlar={[["jadval", "Jadval"], ["qator", "Qator"], ["hajm", "Hajm"], ["toliq_skan", "To‘liq o‘qish"], ["indeks_skan", "Indeks bilan"], ["olik", "O‘lik qator"]]} />
      <h2 style={{ fontSize: 18, fontWeight: 800, marginTop: 18 }}>{uiT("Indekssiz o‘qilayotgan katta jadvallar")}</h2>
      <Jadval qatorlar={d.indekssiz_skan} ustunlar={[["jadval", "Jadval"], ["toliq_skan", "To‘liq o‘qish"], ["oqilgan_qator", "O‘qilgan qator"], ["qator", "Qator"]]} />
      <h2 style={{ fontSize: 18, fontWeight: 800, marginTop: 18 }}>{uiT("Eng ko‘p vaqt olayotgan so‘rovlar")}</h2>
      {Array.isArray(d.sekin_sorovlar) ? <Jadval qatorlar={d.sekin_sorovlar} ustunlar={[["ortacha_ms", "O‘rtacha, ms"], ["marta", "Marta"], ["jami_s", "Jami, s"], ["sorov", "So‘rov"]]} />
        : <p style={{ color: "#5F6B76" }}>{uiT("pg_stat_statements yoqilmagan — sekin so‘rovlarni ko‘rish uchun Railway bazasida «CREATE EXTENSION pg_stat_statements» kerak.")}</p>}
      <h2 style={{ fontSize: 18, fontWeight: 800, marginTop: 18 }}>{uiT("Hozir ishlayotgan uzoq so‘rovlar")}</h2>
      <Jadval qatorlar={d.uzoq_sorovlar} ustunlar={[["soniya", "Soniya"], ["state", "Holat"], ["sorov", "So‘rov"]]} />
      <h2 style={{ fontSize: 18, fontWeight: 800, marginTop: 18 }}>{uiT("Ishlatilmayotgan indekslar")}</h2>
      <Jadval qatorlar={d.ishlatilmagan_indeks} ustunlar={[["jadval", "Jadval"], ["indeks", "Indeks"], ["hajm", "Hajm"]]} />
      <Yengillatish apiBase={apiBase} token={token} />
    </>}
  </div>;
}
