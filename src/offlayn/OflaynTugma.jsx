import React, { useEffect, useState } from "react";
import { kursniYukla, kursniOchir, kursYuklangan, meta, navbatUzunligi } from "./offlayn.js";
import { qurilmaKaliti } from "../auth/qurilma.js";

/** Kurs sahifasidagi «Oflayn uchun yuklash» tugmasi: ochiq darslar telefon xotirasiga tushadi. */
export default function OflaynTugma({ apiBase, token, kurs, til = "uz" }) {
  const [holat, setHolat] = useState({ ish: false, i: 0, n: 0, xabar: "" });
  const [bor, setBor] = useState(() => kursYuklangan(kurs.kalit));
  const [onlayn, setOnlayn] = useState(() => navigator.onLine !== false);
  useEffect(() => {
    const a = () => setOnlayn(true), b = () => setOnlayn(false);
    window.addEventListener("online", a); window.addEventListener("offline", b);
    return () => { window.removeEventListener("online", a); window.removeEventListener("offline", b); };
  }, []);
  const codes = (kurs.darslar || []).filter((d) => d.ochiq && !d.nazorat).map((d) => d.topic_code);
  if (!codes.length) return null;
  const yukla = async () => {
    setHolat({ ish: true, i: 0, n: codes.length, xabar: "" });
    try {
      const r = await kursniYukla({ apiBase, token, qurilma: qurilmaKaliti(), til, kalit: kurs.kalit, nom: kurs.nomi || kurs.kalit, codes,
        onProgress: (i, n) => setHolat((h) => ({ ...h, i, n })) });
      setBor(r.yuklandi > 0);
      setHolat({ ish: false, i: 0, n: 0, xabar: `✓ ${r.yuklandi} ta dars yuklandi${r.yopiq ? ` · ${r.yopiq} ta yopiq` : ""}${r.xato ? ` · ${r.xato} ta xato` : ""}` });
    } catch (e) { setHolat({ ish: false, i: 0, n: 0, xabar: "Yuklab bo‘lmadi — internetni tekshiring" }); }
  };
  const ochir = async () => { await kursniOchir(kurs.kalit); setBor(false); setHolat({ ish: false, i: 0, n: 0, xabar: "Oflayn nusxa o‘chirildi" }); };
  const k = meta().kurslar?.[kurs.kalit];
  return <div className="kk-oflayn" style={{ margin: "8px 0", padding: 10, border: "1px solid #cfe3e2", borderRadius: 12, background: "#f1f9f8" }}>
    {!onlayn && <p style={{ margin: "0 0 6px" }}>📴 Internet yo‘q — yuklangan darslar ishlaydi</p>}
    {holat.ish
      ? <p style={{ margin: 0 }}>⏳ Yuklanmoqda… {holat.i} / {holat.n}</p>
      : <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {onlayn && <button type="button" onClick={yukla} style={{ padding: "9px 14px", borderRadius: 10, border: 0, background: "#0D7A77", color: "#fff", fontWeight: 700 }}>
          {bor ? "🔄 Oflayn nusxani yangilash" : "⬇ Oflayn uchun yuklash"}</button>}
        {bor && onlayn && <button type="button" onClick={ochir} style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #aab", background: "#fff" }}>O‘chirish</button>}
        {bor && k && <small>✓ {k.darslar.length} ta dars · {Math.max(0, Math.ceil((k.exp - Date.now()) / 86400000))} kun amal qiladi</small>}
        {navbatUzunligi() > 0 && <small>⏫ {navbatUzunligi()} ta natija internet kelganda yuboriladi</small>}
      </div>}
    {holat.xabar && <p style={{ margin: "6px 0 0" }}>{holat.xabar}</p>}
  </div>;
}
