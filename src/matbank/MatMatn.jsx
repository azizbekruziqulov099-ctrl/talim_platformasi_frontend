// REV559: matematika banki matnini ko'rsatish — markdown bloklari + KaTeX formulalar. Hammasi React orqali (HTML faqat KaTeX chiqishi).
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import katex from "katex";
import { bloklarga, rasmManzili, satrIchi, savolBloklari } from "./matMatn.js";

/** Chizmalar faqat kirgan foydalanuvchiga: so'rov Authorization sarlavhasi bilan, javob blob sifatida ko'rsatiladi. */
export const RasmKonteksti = createContext({ apiBase: "", token: "" });
function Rasm({ src, alt }) {
  const { apiBase, token } = useContext(RasmKonteksti); const [url, setUrl] = useState(""); const [xato, setXato] = useState(false);
  useEffect(() => {
    const yol = rasmManzili(src); if (!yol || !token) { setXato(true); return undefined; }
    let tugadi = false; let obj = "";
    fetch(`${String(apiBase || "").replace(/\/+$/, "")}${yol}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("rasm")))).then((b) => { if (tugadi) return; obj = URL.createObjectURL(b); setUrl(obj); }).catch(() => setXato(true));
    return () => { tugadi = true; if (obj) URL.revokeObjectURL(obj); };
  }, [src, apiBase, token]);
  if (xato) return <p className="mb-rasm-yoq">🖼️ {alt || "chizma"}: yuklanmadi</p>;
  return url ? <figure className="mb-rasm"><img src={url} alt={alt || "chizma"} /></figure> : <p className="mb-rasm-yoq" role="status">⏳</p>;
}

const chiz = (s, d) => { try { return katex.renderToString(s, { throwOnError: false, displayMode: d, output: "html", strict: "ignore", trust: false, maxExpand: 500 }); } catch { return ""; } };

/** Bir qator: oddiy matn, qalin, kursiv va formulalar. inline=true bo'lsa ko'rsatma formula ham qator ichida chiqadi (variantlar uchun). */
export function Ichi({ s, inline = false }) {
  const bo = useMemo(() => satrIchi(s), [s]);
  return <>{bo.map((x, i) => (x.t === "math" ? <span key={i} className={`mb-f ${x.d && !inline ? "is-d" : ""}`} dangerouslySetInnerHTML={{ __html: chiz(x.s, x.d && !inline) }} />
    : x.t === "b" ? <strong key={i}>{x.s}</strong> : x.t === "i" ? <em key={i}>{x.s}</em> : <React.Fragment key={i}>{x.s}</React.Fragment>))}</>;
}

function Blok({ b }) {
  if (b.t === "img") return <Rasm src={b.src} alt={b.alt} />;
  if (b.t === "h") return b.lv <= 2 ? <h4 className="mb-h">{b.s}</h4> : <h5 className="mb-h">{b.s}</h5>;
  if (b.t === "p") return <p><Ichi s={b.s} /></p>;
  if (b.t === "math") return <div className="mb-ko" dangerouslySetInnerHTML={{ __html: chiz(b.s, true) }} />;
  if (b.t === "ul") return <ul>{b.items.map((x, i) => <li key={i}><Ichi s={x} /></li>)}</ul>;
  if (b.t === "ol") return <ol start={b.boshi}>{b.items.map((x, i) => <li key={i}><Ichi s={x} /></li>)}</ol>;
  if (b.t === "table") return <div className="mb-jadval"><table>{b.head.length > 0 && <thead><tr>{b.head.map((c, i) => <th key={i}><Ichi s={c} inline /></th>)}</tr></thead>}
    <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><Ichi s={c} inline /></td>)}</tr>)}</tbody></table></div>;
  return null;
}

/** Qoida / ishlangan misol matni. */
export default function MatMatn({ matn }) {
  const bl = useMemo(() => bloklarga(matn), [matn]);
  return <div className="mb-matn">{bl.map((b, i) => <Blok key={i} b={b} />)}</div>;
}
/** Test savoli (ichida ro'yxat, jadval va ko'rsatma formulalar bo'lishi mumkin). */
export function SavolMatn({ matn }) {
  const bl = useMemo(() => savolBloklari(matn), [matn]);
  return <div className="mb-matn mb-savol">{bl.map((b, i) => <Blok key={i} b={b} />)}</div>;
}
/** Javob varianti — bir qator. */
export const VariantMatn = ({ matn }) => <span className="mb-var"><Ichi s={matn} inline /></span>;
