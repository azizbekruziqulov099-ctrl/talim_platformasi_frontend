import React, { useEffect, useMemo } from "react";
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

export default function MatKlaviatura({ qiymat, onChange, onTekshir, onYop }) {
  // kompyuter klaviaturasidan ham yozish
  useEffect(() => {
    const h = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (/^[0-9x(),.+\-*/:]$/.test(k)) { e.preventDefault(); onChange(qiymat + (k === "." ? "," : k)); }
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
    <div className="mk-tugmalar">
      {TUGMALAR.flat().map((t) => <button key={t} type="button" className={`mk-t ${/\d/.test(t) ? "is-son" : t === "⌫" ? "is-och" : "is-amal"}`}
        onPointerDown={(e) => e.preventDefault()} onClick={() => bos(t)} aria-label={t === "/" ? __kbUi("kasr chizig‘i") : t}>{t === "/" ? "a/b" : t}</button>)}
    </div>
    <div className="mk-pastki">
      <button type="button" className="mk-t is-och" onClick={() => onChange("")}>{__kbUi("Tozalash")}</button>
      <button type="button" className="mk-tekshir" disabled={!qiymat} onClick={onTekshir}>✓ {__kbUi("Tekshirish")}</button>
    </div>
  </div>;
  return joy ? createPortal(panel, joy) : panel;
}
