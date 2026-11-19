// Mavzu uchun chuqur dars / 30 mashq / 30 test: bir xil tugmalar (mavzu sahifasi va to'plamlar ekranida)
import React, { useEffect, useState } from "react";
import { T } from "./xbTil.js";
import { xbFetch } from "./xbOvoz.js";
import { lazyQayta } from "../workspace/lazyQayta.js";
const PisaMat = lazyQayta(() => import("../matbank/PisaMat.jsx"));

export default function XbChuqur({ apiBase, token, kalit, hush }) {
  const [soni, setSoni] = useState(0);
  const [och, setOch] = useState("");
  useEffect(() => {
    if (!kalit) return undefined; let tirik = true;
    xbFetch(apiBase, `/api/pisamat/mavzular`, token, { params: { bolim: kalit } }).then((r) => tirik && setSoni(r.mavzular?.length || 0)).catch(() => {});
    return () => { tirik = false; };
  }, [apiBase, token, kalit]);
  if (och) return <div className="xb-root"><React.Suspense fallback={<p className="xb-muted">⏳</p>}><PisaMat apiBase={apiBase} token={token} bolim={kalit} boshlash={och} onClose={() => setOch("")} /></React.Suspense></div>;
  if (!soni) return null;
  const ber = (k) => () => { try { hush?.(); } catch { /* */ } setOch(k); };
  return <div className="xb-uch-tugma">
    <button type="button" className="xb-btn xb-btn-asosiy" onClick={ber("dars")}>🎓 {T("Dars")}</button>
    <button type="button" className="xb-btn" onClick={ber("mashq")}>✍️ {T("30 ta mashq")}</button>
    <button type="button" className="xb-btn" onClick={ber("test")}>📝 {T("30 ta test")}</button></div>;
}
