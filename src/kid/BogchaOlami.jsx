import React, { useState } from "react";
import FanBelgi from "./FanBelgi.jsx";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import { useKeepLight } from "./useKeepLight.js";
import { fanTili } from "./izohTil.js";
import { fanIzohi } from "../curriculum/izohTanlov.js";
import "./olam.css";

const TilXonalari = React.lazy(() => import("./xonalar/TilXonalari.jsx"));

// Har fan kartasining rangi (navbat bilan) — o'qiy olmaydigan bola fanni rang va belgidan taniydi
const RANGLAR = ["#FFE9A8", "#CDEBFF", "#FFD6E0", "#D7F5D0", "#E8DBFF", "#FFE0C2", "#D2F4F0", "#F6E1C8"];

/**
 * REV130: Bog'cha bosh ekrani — oddiy va tez: katta fan kartalari (rasmli bino, yo'lak va qavatlar olib tashlandi —
 * og'ir rasmlar sekin telefonda qotib qolardi). Kartani bosish — fan darslari ro'yxati.
 * Til fanlarida alohida «🎮 O'yin xonalari» tugmasi bor.
 * fanlar: [{ kalit, nom, asl, emoji }] · onFan(kalit) · say(matn) — nomni ovoz bilan aytish.
 */
export default function BogchaOlami({ fanlar = [], onFan, say, apiBase = "", grade = "" }) {
  const [oyin, setOyin] = useState(null);   // til fani: { til, izoh }
  useKeepLight(true);
  useInterface();   // til almashsa nomlar ham almashadi

  if (oyin) {
    return <div className="ol-root">
      <React.Suspense fallback={<p className="ol-loading">🎮 …</p>}>
        <TilXonalari apiBase={apiBase} til={oyin.til} izoh={oyin.izoh} grade={grade} onClose={() => setOyin(null)} />
      </React.Suspense>
    </div>;
  }

  return <div className="ol-root">
    <h2 className="ol-head">🏫 {T("Qaysi fanni o‘rganamiz?")}</h2>
    <div className="ol-grid">
      {fanlar.map((f, i) => {
        const til = fanTili(f.asl || f.nom);
        return <div key={f.kalit} className="ol-fan" style={{ "--fan": RANGLAR[i % RANGLAR.length] }}>
          <button type="button" className="ol-fan-main" onClick={() => { say?.(f.nom); onFan?.(f.kalit); }}>
            <span className="ol-fan-emoji" aria-hidden="true"><FanBelgi emoji={f.emoji} /></span>
            <b>{f.nom}</b>
          </button>
          {til && <button type="button" className="ol-fan-play" onClick={() => { say?.(T("O‘yin xonalari")); setOyin({ til, izoh: fanIzohi(f.asl || f.nom) }); }}>
            🎮 {T("O‘yin xonalari")}
          </button>}
        </div>;
      })}
    </div>
  </div>;
}
