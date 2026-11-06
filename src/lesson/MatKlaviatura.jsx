import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import katex from "katex";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

/** REV312: matematik javob klaviaturasi — telefon klaviaturasi chiqmaydi (doskani yopmaydi), pastda ixcham panel.
 *  Kasr (a/b), amallar, qavs, x, vergul; kompyuterda oddiy klaviaturadan ham yoziladi. Javob doskada formula bo'lib ko'rinadi. */
const TUGMALAR = [
  ["7", "8", "9", ":", "⌫"],
  ["4", "5", "6", "×", "("],
  ["1", "2", "3", "−", ")"],
  ["0", ",", "/", "+", "x"],
];
const KALIT = { "×": "*", "−": "-", ":": ":", "/": "/" };
// REV381: harflar ham — javob so'z bo'lsa (ona tili, tarix, biologiya…) telefon klaviaturasi chiqmaydi, shu panelda yoziladi
const HARFLAR = {
  lat: [["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"], ["a", "s", "d", "f", "g", "h", "j", "k", "l", "oʻ"], ["z", "x", "c", "v", "b", "n", "m", "gʻ", "ʼ", "-"]],
  kir: [["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х"], ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"], ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю", "ъ", "ё"]],
};
export const harfliJavob = (t) => /[A-Za-zА-Яа-яЁёʻʼ‘’]/.test(String(t || "").replace(/\b(x|y)\b/g, ""));

/** Javob matnini formula ko'rinishiga: 5/8 → \frac{5}{8}, * → ×, - → −. */
export function javobLatex(t) {
  const s = String(t || "").replace(/\*/g, "\\times ").replace(/:/g, "\\div ").replace(/(\d+|x|\))\s*\/\s*(\d+|x|\()/g, "\\frac{$1}{$2}");
  return s.replace(/-/g, "−");
}

export function JavobKorinishi({ qiymat, bosh = "Javobni yozing" }) {
  const html = useMemo(() => {
    if (!qiymat) return "";
    try { return katex.renderToString(javobLatex(qiymat), { throwOnError: false, output: "html", strict: "ignore" }); } catch { return ""; }
  }, [qiymat]);
  if (!qiymat) return <span className="mk-javob-bosh">{__kbUi(bosh)}</span>;
  return html ? <span className="mk-javob-formula" dangerouslySetInnerHTML={{ __html: html }} /> : <span>{qiymat}</span>;
}

export default function MatKlaviatura({ qiymat, onChange, onTekshir, onYop, kutilgan = "" }) {
  const [rejim, setRejim] = useState(() => (harfliJavob(kutilgan) ? (/[А-Яа-яЁё]/.test(kutilgan) ? "kir" : "lat") : "son"));
  const [katta, setKatta] = useState(false);
  // kompyuter klaviaturasidan ham yozish
  useEffect(() => {
    const h = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (/^[0-9x(),.+\-*/:]$/.test(k)) { e.preventDefault(); onChange(qiymat + (k === "." ? "," : k)); }
      else if (k.length === 1 && /[\p{L} '‘’ʻʼ]/u.test(k)) { e.preventDefault(); onChange(qiymat + k); }   // REV381: harflar
      else if (k === "Backspace") { e.preventDefault(); onChange(qiymat.slice(0, -1)); }
      else if (k === "Enter") { e.preventDefault(); onTekshir(); }
      else if (k === "Escape") onYop?.();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [qiymat, onChange, onTekshir, onYop]);
  const bos = (t) => {
    if (t === "⌫") onChange(qiymat.slice(0, -1));
    else onChange(qiymat + (KALIT[t] || t));
  };
  // dars oynasining o'ziga chiqariladi (doska ichida emas) — telefonda buralgan darsda ham to'g'ri joyda turadi
  const joy = typeof document !== "undefined" ? (document.querySelector(".dx-root") || document.body) : null;
  const panel = <div className="mk-panel" role="group" aria-label={__kbUi("Matematik klaviatura")}>
    <div className="mk-panel-bosh">
      <div className="mk-panel-javob" aria-live="polite"><JavobKorinishi qiymat={qiymat} /></div>
      <button type="button" className="mk-yop" onClick={onYop} aria-label={__kbUi("Klaviaturani yopish")}>⌄</button>
    </div>
    {rejim === "son" ? <div className="mk-tugmalar">
      {TUGMALAR.flat().map((t) => <button key={t} type="button" className={`mk-t ${/\d/.test(t) ? "is-son" : t === "⌫" ? "is-och" : "is-amal"}`}
        onPointerDown={(e) => e.preventDefault()} onClick={() => bos(t)} aria-label={t === "/" ? __kbUi("kasr chizig‘i") : t}>{t === "/" ? "a/b" : t}</button>)}
    </div> : <div className="mk-harflar">
      {HARFLAR[rejim].map((q, i) => <div key={i} className="mk-qator">{q.map((t) => { const h = katta ? t.toUpperCase() : t;
        return <button key={t} type="button" className="mk-t is-harf" onPointerDown={(e) => e.preventDefault()} onClick={() => onChange(qiymat + h)} aria-label={h}>{h}</button>; })}</div>)}
      <div className="mk-qator">
        <button type="button" className={`mk-t is-amal ${katta ? "is-on" : ""}`} onPointerDown={(e) => e.preventDefault()} onClick={() => setKatta((x) => !x)} aria-label={__kbUi("Katta harf")}>⇧</button>
        <button type="button" className="mk-t is-bosh" onPointerDown={(e) => e.preventDefault()} onClick={() => onChange(qiymat + " ")} aria-label={__kbUi("Bo‘sh joy")}>␣</button>
        <button type="button" className="mk-t is-och" onPointerDown={(e) => e.preventDefault()} onClick={() => bos("⌫")} aria-label="⌫">⌫</button>
      </div>
    </div>}
    <div className="mk-pastki">
      {/* REV381: 123 ↔ abc ↔ абв — raqam ham, harf ham */}
      <div className="mk-rejim" role="group" aria-label={__kbUi("Klaviatura turi")}>
        {[["son", "123"], ["lat", "abc"], ["kir", "абв"]].map(([k, n]) => <button key={k} type="button" className={`mk-t ${rejim === k ? "is-on" : ""}`}
          onPointerDown={(e) => e.preventDefault()} onClick={() => setRejim(k)} aria-pressed={rejim === k}>{n}</button>)}
      </div>
      <button type="button" className="mk-t is-och" onClick={() => onChange("")}>{__kbUi("Tozalash")}</button>
      <button type="button" className="mk-tekshir" disabled={!qiymat} onClick={onTekshir}>✓ {__kbUi("Tekshirish")}</button>
    </div>
  </div>;
  return joy ? createPortal(panel, joy) : panel;
}
