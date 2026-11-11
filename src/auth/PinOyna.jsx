// REV489: ota-ona PIN-kodi — bola profilidan chiqish/ota-onaga qaytish va o'rnatish (raqamli klaviatura, 4 raqam).
import React, { useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import "./pinOyna.css";

export default function PinOyna({ apiBase, ownerToken, rejim = "tekshir", onOk, onYop }) {
  const [pin, setPin] = useState(""), [eski, setEski] = useState(null), [ikkinchi, setIkkinchi] = useState(null), [xato, setXato] = useState(""), [band, setBand] = useState(false);
  const base = String(apiBase).replace(/\/+$/, "");
  const sarlavha = rejim === "tekshir" ? "Ota-ona PIN-kodi" : rejim === "almashtir" && eski === null ? "Eski PIN-kod" : ikkinchi === null ? "Yangi PIN-kod" : "PIN-kodni takrorlang";
  const yubor = async (p) => {
    setBand(true); setXato("");
    try {
      if (rejim === "tekshir") {
        const r = await fetch(`${base}/api/oila/pin/tekshir`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: ownerToken, pin: p }) });
        const d = await r.json().catch(() => ({}));
        if (r.ok) onOk?.(); else { setXato(d.detail || __kbUi("PIN noto‘g‘ri")); setPin(""); }
        return;
      }
      if (rejim === "almashtir" && eski === null) { setEski(p); setPin(""); return; }
      if (ikkinchi === null) { setIkkinchi(p); setPin(""); return; }
      if (ikkinchi !== p) { setXato(__kbUi("PIN-kodlar mos kelmadi — qaytadan kiriting")); setIkkinchi(null); setPin(""); return; }
      const r = await fetch(`${base}/api/oila/pin`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: ownerToken, pin: p, eski_pin: eski }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) onOk?.(); else { setXato(d.detail || __kbUi("Saqlanmadi")); setEski(null); setIkkinchi(null); setPin(""); }
    } catch { setXato(__kbUi("Internet bilan bog‘lanib bo‘lmadi")); setPin(""); }
    finally { setBand(false); }
  };
  const bos = (r) => { if (band) return; const p = (pin + r).slice(0, 4); setPin(p); if (p.length === 4) setTimeout(() => yubor(p), 120); };
  return <div className="pin-fon" role="dialog" aria-modal="true" aria-label={__kbUi(sarlavha)}>
    <div className="pin-ich">
      <div className="pin-belgi">🔒</div>
      <h2>{__kbUi(sarlavha)}</h2>
      {rejim === "tekshir" && <p>{__kbUi("Bola profilidan chiqish uchun ota-onaning PIN-kodini kiriting.")}</p>}
      <div className="pin-nuqta">{[0, 1, 2, 3].map((i) => <i key={i} className={i < pin.length ? "is-on" : ""} />)}</div>
      {xato && <p className="pin-xato" role="alert">{xato}</p>}
      <div className="pin-klav">{["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((r) => <button key={r} type="button" onClick={() => bos(r)}>{r}</button>)}
        <button type="button" className="is-yon" onClick={onYop}>{__kbUi("Bekor")}</button>
        <button type="button" onClick={() => bos("0")}>0</button>
        <button type="button" className="is-yon" onClick={() => setPin((p) => p.slice(0, -1))} aria-label={__kbUi("O‘chirish")}>⌫</button></div>
    </div></div>;
}
