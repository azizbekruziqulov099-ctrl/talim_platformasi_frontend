import React, { useState } from "react";
import FanBelgi from "../kid/FanBelgi.jsx";
import { fanNomiTil } from "../curriculum/izohTanlov.js";
import { interfaceLocale, uiText as T } from "../interface/interfaceRuntime.js";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import "./tilMashqi.css";
import { sinfRaqami } from "../maktab/maktabRules.js";

const TilXonalari = React.lazy(() => import("../kid/xonalar/TilXonalari.jsx"));
const TilMashqi = React.lazy(() => import("./TilMashqi.jsx"));
const MaktabTil = React.lazy(() => import("../maktab/MaktabTil.jsx"));   // REV129

/** O'rganiladigan 10 til (bayroq va fan nomi bilan). */
export const OQITILADIGAN = [
  ["en", "🇬🇧", "Ingliz tili"], ["ru", "🇷🇺", "Rus tili"], ["de", "🇩🇪", "Nemis tili"], ["fr", "🇫🇷", "Fransuz tili"], ["es", "🇪🇸", "Ispan tili"],
  ["ar", "🇸🇦", "Arab tili"], ["tr", "🇹🇷", "Turk tili"], ["zh", "🇨🇳", "Xitoy tili"], ["ja", "🇯🇵", "Yapon tili"], ["ko", "🇰🇷", "Koreys tili"],
];
const KEY = "kabutar:til:tanlov";
const eslab = () => { try { return globalThis.localStorage?.getItem(KEY) || ""; } catch { return ""; } };
const saqla = (v) => { try { globalThis.localStorage?.setItem(KEY, v); } catch { /* ixtiyoriy */ } };
/** Izoh tili — interfeys tili (uz, ru, en); boshqa interfeys tillarida — o'zbekcha. */
export const izohTili = (loc = interfaceLocale()) => (String(loc).startsWith("ru") ? "ru" : String(loc).startsWith("en") ? "en" : "uz");

/**
 * REV128: «O'yinlar» bo'limidan til tanlab kirish: bolalar — o'yin xonalari, kattalar — gapirish va yozish mashqi.
 * tur: "xonalar" | "mashq" | "maktab" (REV129: 1–11 sinf).
 */
export default function TilTanlov({ tur = "xonalar", apiBase = "", grade = "", sinf = "", cheklovsiz = false, onClose }) {
  useInterface();
  const loc = interfaceLocale();
  const [til, setTil] = useState(() => eslab());
  const [ochiq, setOchiq] = useState(false);
  const izoh = izohTili(loc);
  const nomi = (n) => fanNomiTil(n, loc);

  if (ochiq && til) {
    const sarlavha = `${OQITILADIGAN.find((t) => t[0] === til)?.[1] || ""} ${nomi(OQITILADIGAN.find((t) => t[0] === til)?.[2] || "")}`;
    return <React.Suspense fallback={<p className="tm-hint">⏳</p>}>
      {tur === "mashq"
        ? <TilMashqi apiBase={apiBase} til={til} izoh={izoh} onClose={() => setOchiq(false)} />
        : tur === "maktab"
        ? <MaktabTil apiBase={apiBase} til={til} izoh={izoh} sinf={sinfRaqami(sinf) || 1} cheklovsiz={cheklovsiz} sarlavha={sarlavha} onClose={() => setOchiq(false)} />
        : <TilXonalari apiBase={apiBase} til={til} izoh={izoh} grade={grade} cheklovsiz={cheklovsiz} sarlavha={sarlavha} onClose={() => setOchiq(false)} />}
    </React.Suspense>;
  }

  return <div className="tm-root">
    <div className="tm-bar">
      <button type="button" className="tm-back" onClick={onClose} aria-label={T("Orqaga")}>⬅️</button>
      <div><b className="tm-title">{tur === "mashq" ? `🗣️ ${T("Gapirish va yozish mashqi")}` : tur === "maktab" ? `📚 ${T("Maktab: til o‘yinlari")}` : `🏠 ${T("Til o‘yin xonalari")}`}</b>
        <small className="tm-sub">{T("Qaysi tilni o‘rganamiz?")}</small></div>
    </div>
    <div className="tt-grid">
      {OQITILADIGAN.map(([k, bayroq, n]) => <button key={k} type="button" className={`tt-til ${til === k ? "is-on" : ""}`}
        onClick={() => { setTil(k); saqla(k); setOchiq(true); }}>
        <span className="tt-flag"><FanBelgi emoji={bayroq} /></span>
        <b>{nomi(n)}</b>
      </button>)}
    </div>
  </div>;
}
