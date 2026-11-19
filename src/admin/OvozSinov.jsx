// Admin: ovoz sinovi — matn yozib, turli diktorlarni (o'zbek, rus, qozoq, turk, ingliz…) tezlik va ohang bilan eshitib ko'rish.
import React, { useEffect, useRef, useState } from "react";

const MATN0 = "Assalomu alaykum, aziz o‘quvchi! Bugun biz kasrlarni o‘rganamiz. Diqqat bilan eshiting va doskaga qarang.";
const TEZ = [["Juda sekin", -30], ["Sekin", -15], ["Oddiy", 0], ["Tez", 15], ["Juda tez", 30]];
const OHANG = [["Past (yo‘g‘on)", -20], ["Biroz past", -10], ["Oddiy", 0], ["Biroz baland", 10], ["Baland (ingichka)", 20]];

export default function OvozSinov({ apiBase }) {
  const [royxat, setRoyxat] = useState([]);
  const [matn, setMatn] = useState(MATN0);
  const [diktor, setDiktor] = useState("uz-UZ-SardorNeural");
  const [tezlik, setTezlik] = useState(0);
  const [ohang, setOhang] = useState(0);
  const [holat, setHolat] = useState("");
  const [tanlanganlar, setTanlanganlar] = useState(["uz-UZ-MadinaNeural", "uz-UZ-SardorNeural", "ru-RU-SvetlanaNeural", "ru-RU-DmitryNeural"]);
  const audioRef = useRef(null);
  const navbat = useRef(0);
  const base = String(apiBase || "").replace(/\/+$/, "");

  useEffect(() => { fetch(`${base}/api/ovoz/diktorlar`).then((r) => r.json()).then((d) => setRoyxat(d.diktorlar || [])).catch(() => {}); }, [base]);
  useEffect(() => () => toxta(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const toxta = () => { navbat.current += 1; const a = audioRef.current; audioRef.current = null; if (a) { try { a.pause(); a.src = ""; } catch { /* */ } } setHolat(""); };
  const sign = (v) => `${v >= 0 ? "+" : "-"}${Math.abs(v)}`;
  const url = (d) => `${base}/api/ovoz?${new URLSearchParams({ matn: matn.slice(0, 1400), diktor: d, tezlik: `${sign(tezlik)}%`, ohang: `${sign(ohang)}Hz` })}`;

  const ayt = (d, nom) => new Promise((ok) => {
    const id = ++navbat.current; const a = new Audio(url(d)); audioRef.current = a;
    setHolat(`🔊 ${nom || d}`);
    const tugadi = () => { if (id === navbat.current) { audioRef.current = null; setHolat(""); } ok(id === navbat.current); };
    a.onended = tugadi; a.onerror = () => { if (id === navbat.current) setHolat(`⚠️ ${nom || d}: ovoz kelmadi`); ok(false); };
    a.play().catch(() => { setHolat("⚠️ Brauzer ovozni to‘sdi — tugmani yana bosing"); ok(false); });
  });
  const nomi = (k) => royxat.find((x) => x.kod === k)?.nom || k;
  const hammasi = async () => { toxta(); for (const d of tanlanganlar) { const davom = await ayt(d, nomi(d)); if (!davom) break; await new Promise((r) => setTimeout(r, 500)); } };

  const guruhlar = royxat.reduce((m, x) => { const t = x.nom.split(" · ")[0]; (m[t] = m[t] || []).push(x); return m; }, {});
  const S = { karta: { border: "1px solid #d8e0ea", borderRadius: 14, padding: 14, background: "#fff", display: "grid", gap: 10 }, tugma: { padding: "8px 12px", borderRadius: 10, border: "1px solid #b9c7d8", background: "#fff", cursor: "pointer", font: "600 14px system-ui" } };
  return <div style={{ display: "grid", gap: 12, maxWidth: 860 }}>
    <div style={S.karta}>
      <b>🎙️ Ovoz sinovi</b>
      <textarea value={matn} onChange={(e) => setMatn(e.target.value)} rows={4} maxLength={1400} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #b9c7d8", font: "16px system-ui" }} />
      <label>Diktor: <select value={diktor} onChange={(e) => setDiktor(e.target.value)} style={{ padding: 8, borderRadius: 8, maxWidth: "100%" }}>
        {Object.entries(guruhlar).map(([t, xs]) => <optgroup key={t} label={t}>{xs.map((x) => <option key={x.kod} value={x.kod}>{x.nom}</option>)}</optgroup>)}
      </select></label>
      <label>⏩ Tezlik: <b>{sign(tezlik)}%</b> <input type="range" min={-30} max={30} step={5} value={tezlik} onChange={(e) => setTezlik(+e.target.value)} style={{ width: "100%" }} /></label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{TEZ.map(([n, v]) => <button key={n} type="button" style={{ ...S.tugma, background: tezlik === v ? "#dbeafe" : "#fff" }} onClick={() => setTezlik(v)}>{n}</button>)}</div>
      <label>🎚️ Ohang (ingichka–yo‘g‘on): <b>{sign(ohang)} Hz</b> <input type="range" min={-30} max={30} step={2} value={ohang} onChange={(e) => setOhang(+e.target.value)} style={{ width: "100%" }} /></label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{OHANG.map(([n, v]) => <button key={n} type="button" style={{ ...S.tugma, background: ohang === v ? "#dbeafe" : "#fff" }} onClick={() => setOhang(v)}>{n}</button>)}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" style={{ ...S.tugma, background: "#1B4B7A", color: "#fff" }} onClick={() => { toxta(); ayt(diktor, nomi(diktor)); }}>▶ Gapirtir</button>
        <button type="button" style={S.tugma} onClick={toxta}>⏹ To‘xtat</button>
        <button type="button" style={S.tugma} onClick={() => { setTezlik(0); setOhang(0); }}>↺ Asl holat</button>
        <span>{holat}</span>
      </div>
    </div>
    <div style={S.karta}>
      <b>👥 Taqqoslash — bir matn, bir necha odam</b>
      <small>Eshitmoqchi bo‘lgan diktorlarni belgilang va «Hammasini ketma-ket» ni bosing (tezlik va ohang yuqoridagidek).</small>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 6 }}>
        {royxat.map((x) => <label key={x.kod} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={tanlanganlar.includes(x.kod)} onChange={(e) => setTanlanganlar((a) => e.target.checked ? [...a, x.kod] : a.filter((k) => k !== x.kod))} />
          <span style={{ flex: 1 }}>{x.nom}</span>
          <button type="button" style={{ ...S.tugma, padding: "3px 8px" }} onClick={() => { toxta(); ayt(x.kod, x.nom); }}>▶</button>
        </label>)}
      </div>
      <div style={{ display: "flex", gap: 8 }}><button type="button" style={{ ...S.tugma, background: "#1B4B7A", color: "#fff" }} onClick={hammasi}>▶▶ Hammasini ketma-ket ({tanlanganlar.length})</button></div>
    </div>
  </div>;
}
