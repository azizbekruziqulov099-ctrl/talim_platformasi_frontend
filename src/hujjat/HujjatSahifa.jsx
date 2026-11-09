// REV439: «📂 Hujjat ochish» — telefondan/kompyuterdan, Telegram'dan «Ulashish» orqali yoki Android ilovadan kelgan faylni ochish.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import HujjatKoruvchi, { HUJJAT_TURLARI, hajmMatn } from "./HujjatKoruvchi.jsx";
import "./hujjat.css";

const ICON = { pdf: "📕", docx: "📘", xlsx: "📗", xls: "📗", csv: "📗", pptx: "📙" };

/** Tashqaridan kelgan fayl: ?hujjat=ulashilgan (Web Share Target → service worker keshi), ?hujjat=ilova (Android ilova), launchQueue (kompyuter). */
export async function tashqiFaylniOl() {
  const q = new URLSearchParams(window.location.search);
  const h = q.get("hujjat");
  try {
    if (h === "ulashilgan" && window.caches) {
      const c = await caches.open("kabutar-ulashish");
      const r = await c.match("/__ulashilgan_fayl");
      if (r) { const nom = decodeURIComponent(r.headers.get("x-fayl-nomi") || "hujjat"); const b = await r.blob(); await c.delete("/__ulashilgan_fayl"); return new File([b], nom, { type: b.type }); }
    }
    if (h === "ilova") {
      const r = await fetch(`/__ilova_fayl?t=${Date.now()}`);
      if (r.ok) { const nom = decodeURIComponent(r.headers.get("x-fayl-nomi") || q.get("nom") || "hujjat"); const b = await r.blob(); return new File([b], nom, { type: b.type }); }
    }
  } catch { /* */ }
  return null;
}

export default function HujjatSahifa({ onYop }) {
  const [fayl, setFayl] = useState(null);
  const [ustida, setUstida] = useState(false);
  const [songgi] = useState(() => { try { return JSON.parse(localStorage.getItem("kb_hujjat_songgi") || "[]"); } catch { return []; } });
  const och = (f) => {
    if (!f) return;
    setFayl(f);
    try { localStorage.setItem("kb_hujjat_songgi", JSON.stringify([{ nom: f.name, hajm: f.size, vaqt: Date.now() }, ...songgi.filter((x) => x.nom !== f.name)].slice(0, 8))); } catch { /* */ }
  };
  useEffect(() => {
    tashqiFaylniOl().then((f) => { if (f) och(f); });
    if ("launchQueue" in window) window.launchQueue.setConsumer(async (p) => { const h = p.files?.[0]; if (h) och(await h.getFile()); });   // kompyuter: «Ochish → Ta'lim AI»
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (fayl) return <div className="hs-sahifa" style={{ padding: 0, maxWidth: "none" }}><HujjatKoruvchi fayl={fayl} onYop={() => { setFayl(null); const u = new URL(window.location.href); u.searchParams.delete("hujjat"); window.history.replaceState(null, "", u); }} /></div>;
  return <div className="hs-sahifa">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <h2 style={{ margin: 0 }}>📂 {__kbUi("Hujjat ochish")}</h2>
      {onYop && <button type="button" className="hs-tugma" style={{ background: "#eef2f6", color: "#1d2b3a" }} onClick={onYop}>←</button>}
    </div>
    <label className={`hs-tashla ${ustida ? "is-ustida" : ""}`} onDragOver={(e) => { e.preventDefault(); setUstida(true); }} onDragLeave={() => setUstida(false)}
      onDrop={(e) => { e.preventDefault(); setUstida(false); och(e.dataTransfer.files?.[0]); }}>
      <span style={{ fontSize: 46 }}>📄</span>
      <b>{__kbUi("PDF, Word, Excel, PowerPoint yoki rasmni oching")}</b>
      <small>{__kbUi("Fayl qurilmangizning o‘zida ochiladi — hech qayerga yuklanmaydi. Reklama yo‘q.")}</small>
      <span className="hs-tugma">📂 {__kbUi("Faylni tanlash")}</span>
      <input type="file" accept={HUJJAT_TURLARI} hidden onChange={(e) => och(e.target.files?.[0])} />
    </label>
    <div className="hs-songgi"><small>💡 {__kbUi("Telegram’dan: faylni bosib turing → «Ulashish» → «Ta’lim AI». Android ilovamizda esa fayl ustiga bossangiz kifoya.")}</small>
      {songgi.length > 0 && <small style={{ marginTop: 8 }}>{__kbUi("Yaqinda ochilganlar (qayta ochish uchun faylni yana tanlang)")}:</small>}
      {songgi.map((x) => <button key={x.nom + x.vaqt} type="button" disabled><span style={{ fontSize: 22 }}>{ICON[String(x.nom).split(".").pop().toLowerCase()] || "📄"}</span><span><b>{x.nom}</b><br /><small>{hajmMatn(x.hajm)}</small></span></button>)}
    </div>
  </div>;
}
