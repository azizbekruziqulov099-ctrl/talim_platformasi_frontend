// REV342: harakat qadami (Miya o'yinlari 171 «Kabu kabi qil», 172 «Sakrab sana», 175 «Muzlab qol») — bola o'rnidan turib
// harakat qiladi; ekranda katta belgi sakrab turadi, bola «Bajardim!» ni bosadi (yoki 12 soniyadan keyin o'zi davom etadi).
import React, { useEffect, useRef } from "react";
const BAJARDIM = { uz: "Bajardim!", ru: "Готово!", en: "Done!", de: "Fertig!", es: "¡Listo!", fr: "Fini !", tr: "Yaptım!", ar: "انتهيت!", zh: "做完了！", ja: "できた！", ko: "다 했어!" };
const BELGI = { 171: "🤸", 172: "🦘", 175: "🧊" };
export default function HarakatQadam({ id, emoji, izoh = "uz", onTugadi }) {
  const bitdi = useRef(false);
  const tugat = () => { if (bitdi.current) return; bitdi.current = true; onTugadi?.(); };
  useEffect(() => { const t = setTimeout(tugat, 12000); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className={`dx-harakat is-${id}`}>
    <span className="dx-harakat-belgi" aria-hidden="true">{emoji || BELGI[id] || "🤸"}</span>
    <button type="button" className="dx-harakat-tugma" onClick={tugat}>✅ {BAJARDIM[izoh] || BAJARDIM.uz}</button>
  </div>;
}
export const HARAKAT_OYINLARI = new Set([171, 172, 175]);
