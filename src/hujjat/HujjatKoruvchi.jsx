// REV439: hujjat ko'ruvchi — PDF, Word, Excel, PowerPoint, rasm va matn sayt (ilova) ichida, reklamasiz.
// Fayl qurilmaning o'zida ochiladi (serverga yuklanmaydi). «Faqat ko'rish» rejimida yuklab olish tugmasi yo'q va suv belgisi bor.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import "./hujjat.css";
import "./shriftlar.css";   // REV443: Office shriftlarining bepul egizaklari

export const HUJJAT_TURLARI = ".pdf,.docx,.xlsx,.xls,.csv,.pptx,.txt,.md,.json,.png,.jpg,.jpeg,.gif,.webp,.svg,.doc,.ppt,.odt,.ods,.rtf";

export function hujjatTuri(nom = "", mime = "") {
  const e = String(nom).toLowerCase().split(".").pop();
  if (e === "pdf" || mime === "application/pdf") return "pdf";
  if (e === "docx" || /wordprocessingml/.test(mime)) return "docx";
  if (["xlsx", "xlsm", "xls", "ods", "csv"].includes(e) || /spreadsheet|ms-excel|text\/csv/.test(mime)) return "jadval";
  if (e === "pptx" || /presentationml/.test(mime)) return "pptx";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(e) || /^image\//.test(mime)) return "rasm";
  if (["txt", "md", "json", "log", "xml", "html", "js", "py"].includes(e) || /^text\//.test(mime)) return "matn";
  if (["doc", "ppt", "rtf", "odt", "odp"].includes(e)) return "eski";
  return "nomalum";
}

export function hajmMatn(b) {
  if (!b && b !== 0) return "";
  return b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;
}

function suvBelgiFon(matn) {
  const t = String(matn || "").replace(/[<&>"]/g, "");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'><text x='20' y='120' transform='rotate(-24 160 100)' font-family='Arial' font-size='18' fill='rgba(27,75,122,0.13)'>${t}</text></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function PdfKoruvchi({ buf, zoom, setSahifalar }) {
  const host = useRef(null);
  const [xato, setXato] = useState("");
  useEffect(() => {
    let bekor = false; let doc = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        doc = await pdfjs.getDocument({ data: new Uint8Array(buf.slice(0)) }).promise;
        if (bekor) return;
        setSahifalar(doc.numPages);
        const el = host.current; el.innerHTML = "";
        const enMax = Math.min(el.clientWidth || 800, 1100) - 16;
        const io = new IntersectionObserver((kirdi) => kirdi.forEach(async (k) => {
          if (!k.isIntersecting || k.target.dataset.chizildi) return;
          k.target.dataset.chizildi = "1";
          const p = await doc.getPage(Number(k.target.dataset.n));
          const v0 = p.getViewport({ scale: 1 });
          const sc = (enMax / v0.width) * zoom, dpr = Math.min(2, window.devicePixelRatio || 1);
          const vp = p.getViewport({ scale: sc * dpr });
          const c = document.createElement("canvas"); c.width = vp.width; c.height = vp.height;
          c.style.width = `${vp.width / dpr}px`; c.style.height = `${vp.height / dpr}px`;
          k.target.innerHTML = ""; k.target.appendChild(c);
          await p.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
        }), { rootMargin: "800px 0px" });
        const v = (await doc.getPage(1)).getViewport({ scale: 1 });   // o'lcham birinchi sahifadan (taxminiy joy)
        for (let i = 1; i <= doc.numPages; i += 1) {
          const w = enMax * zoom;
          const d = document.createElement("div"); d.className = "hk-pdf-sahifa"; d.dataset.n = String(i);
          d.style.width = `${w}px`; d.style.height = `${(w * v.height) / v.width}px`;
          d.innerHTML = `<span>${i}</span>`; el.appendChild(d); io.observe(d);
        }
      } catch (e) { if (!bekor) setXato(String(e?.message || e)); }
    })();
    return () => { bekor = true; try { doc?.destroy(); } catch { /* */ } };
  }, [buf, zoom]); // eslint-disable-line react-hooks/exhaustive-deps
  if (xato) return <p className="hk-xato">{__kbUi("PDF ochilmadi")}: {xato}</p>;
  return <div ref={host} className="hk-pdf" />;
}

function DocxKoruvchi({ buf }) {
  const host = useRef(null); const uslub = useRef(null);
  const [xato, setXato] = useState("");
  useEffect(() => {
    let bekor = false;
    (async () => {
      try {
        const { renderAsync } = await import("docx-preview");
        if (bekor) return;
        host.current.innerHTML = "";
        await renderAsync(buf, host.current, uslub.current, { inWrapper: true, breakPages: true, ignoreLastRenderedPageBreak: true, experimental: true, useBase64URL: true });
      } catch (e) { if (!bekor) setXato(String(e?.message || e)); }
    })();
    return () => { bekor = true; };
  }, [buf]);
  if (xato) return <p className="hk-xato">{__kbUi("Word fayl ochilmadi")}: {xato}</p>;
  return <div className="hk-docx"><div ref={uslub} /><div ref={host} /></div>;
}

function JadvalKoruvchi({ buf, nom }) {
  const [kitob, setKitob] = useState(null);
  const [varaq, setVaraq] = useState(0);
  const [xato, setXato] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const XLSX = await import("xlsx");
        const wb = /\.csv$/i.test(nom) ? XLSX.read(new TextDecoder().decode(buf), { type: "string" }) : XLSX.read(buf, { type: "array" });
        setKitob({ XLSX, wb });
      } catch (e) { setXato(String(e?.message || e)); }
    })();
  }, [buf, nom]);
  const html = useMemo(() => {
    if (!kitob) return "";
    const ws = kitob.wb.Sheets[kitob.wb.SheetNames[varaq]];
    return ws ? kitob.XLSX.utils.sheet_to_html(ws, { header: "", footer: "" }) : "";
  }, [kitob, varaq]);
  if (xato) return <p className="hk-xato">{__kbUi("Jadval ochilmadi")}: {xato}</p>;
  if (!kitob) return <p className="hk-kut">⏳</p>;
  return <div className="hk-jadval">
    <div className="hk-jadval-ich" dangerouslySetInnerHTML={{ __html: html }} />
    {kitob.wb.SheetNames.length > 1 && <div className="hk-varaqlar">{kitob.wb.SheetNames.map((v, i) => <button key={v} type="button" className={i === varaq ? "is-on" : ""} onClick={() => setVaraq(i)}>{v}</button>)}</div>}
  </div>;
}

function PptxKoruvchi({ buf }) {
  const host = useRef(null);
  const [xato, setXato] = useState("");
  useEffect(() => {
    let bekor = false;
    (async () => {
      try {
        const { init } = await import("pptx-preview");
        if (bekor) return;
        host.current.innerHTML = "";
        const w = Math.min(host.current.clientWidth || 960, 1100) - 8;
        const p = init(host.current, { width: w, height: Math.round((w * 9) / 16), mode: "list" });
        await p.preview(buf);
      } catch (e) { if (!bekor) setXato(String(e?.message || e)); }
    })();
    return () => { bekor = true; };
  }, [buf]);
  if (xato) return <p className="hk-xato">{__kbUi("Taqdimot ochilmadi")}: {xato}</p>;
  return <div ref={host} className="hk-pptx" />;
}

const API = (import.meta.env?.VITE_API_BASE || "https://talimplatformasi-production.up.railway.app").replace(/\/+$/, "");

/** REV443: «✨ Asl ko'rinishda» — fayl serverga yuboriladi, LibreOffice uni PDF ga aylantiradi (server saqlamaydi). */
async function aslKorinish(fayl, nom) {
  const fd = new FormData(); fd.append("fayl", fayl, nom);
  const r = await fetch(`${API}/api/hujjat/aylantir`, { method: "POST", body: fd });
  if (!r.ok) { let x = ""; try { x = (await r.json()).detail; } catch { /* */ } throw new Error(x || `Server xatosi (${r.status})`); }
  const b = await r.blob();
  return new File([b], nom.replace(/\.[^.]+$/, "") + ".pdf", { type: "application/pdf" });
}

export default function HujjatKoruvchi({ fayl: asl, nom: nomBer = "", onYop, faqatKorish = false, suvBelgi = "" }) {
  const [aylantirilgan, setAyl] = useState(null);
  const [aylHolat, setAylHolat] = useState("");
  const fayl = aylantirilgan || asl;
  const nom = aylantirilgan?.name || nomBer || asl?.name || "hujjat";
  const tur = hujjatTuri(nom, fayl?.type || "");
  const aslTur = hujjatTuri(nomBer || asl?.name || "", asl?.type || "");
  const aylantirsaBoladi = !aylantirilgan && ["docx", "pptx", "jadval", "eski"].includes(aslTur);
  const aylantir = async () => {
    if (!window.confirm(__kbUi("Asl ko‘rinish uchun fayl serverimizga yuboriladi, PDF ga aylantiriladi va darhol o‘chiriladi. Davom etasizmi?"))) return;
    setAylHolat("⏳");
    try { setAyl(await aslKorinish(asl, nomBer || asl?.name || "hujjat")); setAylHolat(""); }
    catch (e) { setAylHolat(String(e?.message || e)); }
  };
  const [buf, setBuf] = useState(null);
  const [matn, setMatn] = useState("");
  const [zoom, setZoom] = useState(1);
  const [sahifalar, setSahifalar] = useState(0);
  const [toliq, setToliq] = useState(false);
  const url = useMemo(() => (fayl && tur === "rasm" ? URL.createObjectURL(fayl) : ""), [fayl, tur]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => {
    if (!fayl) return;
    setBuf(null); setSahifalar(0);
    fayl.arrayBuffer().then((b) => { setBuf(b); if (tur === "matn") setMatn(new TextDecoder().decode(b).slice(0, 2_000_000)); });
  }, [fayl, tur]);
  const yuklab = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(fayl); a.download = nom; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  return <div className={`hk-root ${toliq ? "is-toliq" : ""}`} onContextMenu={faqatKorish ? (e) => e.preventDefault() : undefined}>
    <div className="hk-tepa">
      {onYop && <button type="button" className="hk-t" onClick={onYop} aria-label={__kbUi("Yopish")}>←</button>}
      <div className="hk-nom"><b title={nom} data-eski-alifbo="1">{nom}</b><small>{hajmMatn(fayl?.size)}{sahifalar ? ` · ${sahifalar} ${__kbUi("sahifa")}` : ""}</small></div>
      {tur === "pdf" && <><button type="button" className="hk-t" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} aria-label="−">−</button>
        <span className="hk-zoom">{Math.round(zoom * 100)}%</span>
        <button type="button" className="hk-t" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} aria-label="+">+</button></>}
      {aylantirsaBoladi && <button type="button" className="hk-t hk-asl" onClick={aylantir} disabled={aylHolat === "⏳"} title={__kbUi("Office’dagidek aniq ko‘rinish")}>{aylHolat === "⏳" ? "⏳" : "✨"} <span>{__kbUi("Asl ko‘rinishda")}</span></button>}
      {aylantirilgan && <button type="button" className="hk-t hk-asl" onClick={() => setAyl(null)}>↩ <span>{__kbUi("Tez ko‘rinish")}</span></button>}
      <button type="button" className="hk-t" onClick={() => setToliq((x) => !x)} aria-label={__kbUi("Butun ekran")}>{toliq ? "🗗" : "⛶"}</button>
      {!faqatKorish && fayl && <button type="button" className="hk-t" onClick={yuklab} aria-label={__kbUi("Yuklab olish")}>⬇</button>}
    </div>
    {aylHolat && aylHolat !== "⏳" && <p className="hk-xato" style={{ padding: "8px 12px", margin: 0 }}>{aylHolat}</p>}
    <div className="hk-ich" data-eski-alifbo="1" translate="no" style={faqatKorish && suvBelgi ? { backgroundImage: suvBelgiFon(suvBelgi) } : undefined}>
      {!buf && tur !== "rasm" ? <p className="hk-kut">⏳ {__kbUi("Ochilmoqda…")}</p>
        : tur === "pdf" ? <PdfKoruvchi buf={buf} zoom={zoom} setSahifalar={setSahifalar} />
        : tur === "docx" ? <DocxKoruvchi buf={buf} />
        : tur === "jadval" ? <JadvalKoruvchi buf={buf} nom={nom} />
        : tur === "pptx" ? <PptxKoruvchi buf={buf} />
        : tur === "rasm" ? <div className="hk-rasm"><img src={url} alt={nom} /></div>
        : tur === "matn" ? <pre className="hk-matn">{matn}</pre>
        : tur === "eski" ? <p className="hk-xato">{__kbUi("Bu eski format (.doc, .ppt, .xls, .rtf). Ochish uchun yuqoridagi «✨ Asl ko‘rinishda» tugmasini bosing.")}</p>
        : <p className="hk-xato">{__kbUi("Bu fayl turini ochib bo‘lmaydi.")}</p>}
      {faqatKorish && suvBelgi && <div className="hk-suv" aria-hidden="true" style={{ backgroundImage: suvBelgiFon(suvBelgi) }} />}
    </div>
  </div>;
}
