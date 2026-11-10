// REV439: «📂 Hujjat ochish» — telefondan/kompyuterdan, Telegram'dan «Ulashish» orqali yoki Android ilovadan kelgan faylni ochish.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import HujjatKoruvchi, { HUJJAT_TURLARI, hajmMatn } from "./HujjatKoruvchi.jsx";
import "./hujjat.css";

const ICON = { pdf: "📕", docx: "📘", xlsx: "📗", xls: "📗", csv: "📗", pptx: "📙", zip: "🗜" };
const OCHILADI = /\.(pdf|docx|doc|xlsx|xls|csv|pptx|ppt|odt|ods|rtf|txt|md|json|png|jpe?g|gif|webp|svg)$/i;

/** REV471: ZIP ichidagi hujjatlar ro'yxati (qurilmaning o'zida ochiladi — hech qayerga yuborilmaydi). */
async function zipOch(f) {
  const { unzipSync } = await import("fflate");
  const b = new Uint8Array(await f.arrayBuffer());
  const ich = unzipSync(b, { filter: (x) => OCHILADI.test(x.name) && !x.name.startsWith("__MACOSX/") && x.originalSize < 200 * 1024 * 1024 });
  return Object.entries(ich).map(([nom, data]) => ({ nom, data })).sort((a, z) => a.nom.localeCompare(z.nom));
}

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
  const [zip, setZip] = useState(null);   // REV471: {nom, ichida:[{nom,data}]}
  const [ogoh, setOgoh] = useState("");
  const och = async (f) => {
    setOgoh("");
    if (!f) return;
    if (/\.zip$/i.test(f.name) || f.type === "application/zip" || f.type === "application/x-zip-compressed") {
      try {
        const ichida = await zipOch(f);
        if (!ichida.length) { setOgoh(__kbUi("ZIP ichida ochiladigan hujjat topilmadi.")); return; }
        if (ichida.length === 1) { const x = ichida[0]; och(new File([x.data], x.nom.split("/").pop())); return; }
        setZip({ nom: f.name, ichida }); return;
      } catch { setOgoh(__kbUi("ZIP faylni ochib bo‘lmadi (buzilgan yoki parolli bo‘lishi mumkin).")); return; }
    }
    setFayl(f);
    try { localStorage.setItem("kb_hujjat_songgi", JSON.stringify([{ nom: f.name, hajm: f.size, vaqt: Date.now() }, ...songgi.filter((x) => x.nom !== f.name)].slice(0, 8))); } catch { /* */ }
  };
  useEffect(() => {
    tashqiFaylniOl().then((f) => { if (f) och(f); });
    if ("launchQueue" in window) window.launchQueue.setConsumer(async (p) => { const h = p.files?.[0]; if (h) och(await h.getFile()); });   // kompyuter: «Ochish → Ta'lim AI»
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (fayl) return <div className="hs-sahifa" style={{ padding: 0, maxWidth: "none" }}><HujjatKoruvchi fayl={fayl} onYop={() => { setFayl(null);   /* REV471: ZIP'dan ochilgan bo'lsa — ro'yxatga qaytadi */ const u = new URL(window.location.href); u.searchParams.delete("hujjat"); window.history.replaceState(null, "", u); }} /></div>;
  return <div className="hs-sahifa">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <h2 style={{ margin: 0 }}>📂 {__kbUi("Hujjat ochish")}</h2>
      {onYop && <button type="button" className="hs-tugma" style={{ background: "#eef2f6", color: "#1d2b3a" }} onClick={onYop}>←</button>}
    </div>
    <label className={`hs-tashla ${ustida ? "is-ustida" : ""}`} onDragOver={(e) => { e.preventDefault(); setUstida(true); }} onDragLeave={() => setUstida(false)}
      onDrop={(e) => { e.preventDefault(); setUstida(false); const f = e.dataTransfer.files?.[0];
        // REV471: Windows'da ZIP oynasi yoki Telegram'dan sudralganda ba'zan haqiqiy fayl kelmaydi — tushuntiramiz
        if (!f) { setOgoh(__kbUi("Fayl kelmadi. ZIP ichidan sudrasangiz — ZIP faylning o‘zini tashlang (ichini o‘zimiz ochamiz). Telegram’dan — faylni «Saqlash» qilib, keyin tanlang.")); return; }
        och(f); }}>
      <span style={{ fontSize: 46 }}>📄</span>
      <b>{__kbUi("PDF, Word, Excel, PowerPoint, rasm yoki ZIP ni oching")}</b>
      <small>{__kbUi("Fayl qurilmangizning o‘zida ochiladi — hech qayerga yuklanmaydi. Reklama yo‘q.")}</small>
      <span className="hs-tugma">📂 {__kbUi("Faylni tanlash")}</span>
      <input type="file" accept={`${HUJJAT_TURLARI},.zip`} hidden onChange={(e) => och(e.target.files?.[0])} />
    </label>
    {ogoh && <p className="hs-ogoh">{ogoh}</p>}
    {zip && <div className="hs-zip"><b>🗜 {zip.nom}</b> · {zip.ichida.length} {__kbUi("ta hujjat")}
      {zip.ichida.map((x) => <button key={x.nom} type="button" onClick={() => och(new File([x.data], x.nom.split("/").pop()))}>
        <span style={{ fontSize: 22 }}>{ICON[String(x.nom).split(".").pop().toLowerCase()] || "📄"}</span><span><b>{x.nom.split("/").pop()}</b><br /><small>{x.nom.includes("/") ? x.nom.slice(0, x.nom.lastIndexOf("/")) + " · " : ""}{hajmMatn(x.data.length)}</small></span></button>)}
    </div>}
    <div className="hs-songgi"><small>💡 {__kbUi("Telegram’dan: faylni bosib turing → «Ulashish» → «Ta’lim AI». Android ilovamizda esa fayl ustiga bossangiz kifoya.")}</small>
      {songgi.length > 0 && <small style={{ marginTop: 8 }}>{__kbUi("Yaqinda ochilganlar (qayta ochish uchun faylni yana tanlang)")}:</small>}
      {songgi.map((x) => <button key={x.nom + x.vaqt} type="button" disabled><span style={{ fontSize: 22 }}>{ICON[String(x.nom).split(".").pop().toLowerCase()] || "📄"}</span><span><b>{x.nom}</b><br /><small>{hajmMatn(x.hajm)}</small></span></button>)}
    </div>
  </div>;
}
