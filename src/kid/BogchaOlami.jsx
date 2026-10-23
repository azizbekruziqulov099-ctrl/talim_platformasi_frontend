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

  // REV163: haftalik reja — bugungi fanlar birinchi, har kartada «Bugun» yoki keyingi kun belgisi
  const tartib = fanlar.some((f) => f.holat) ? [...fanlar].sort((a, b) => (a.holat?.turi === "bor" ? 0 : 1) - (b.holat?.turi === "bor" ? 0 : 1)) : fanlar;
  const bugungi = fanlar.filter((f) => f.holat?.turi === "bor");
  const takror = fanlar.some((f) => f.holat?.turi === "takror");
  return <div className="ol-root">
    <h2 className="ol-head">🏫 {T("Qaysi fanni o‘rganamiz?")}</h2>
    {(bugungi.length > 0 || takror) && <p className="ol-today" role="status">{takror ? <>🔁 {T("Bugun yakshanba — takrorlash kuni")}</>
      : <>⭐ {T("Bugungi darslar")}: {bugungi.map((f) => <span key={f.kalit} className="ol-today-chip"><FanBelgi emoji={f.emoji} /> {f.nom}</span>)}</>}</p>}
    <div className="ol-grid">
      {tartib.map((f, i) => {
        const til = fanTili(f.asl || f.nom);
        const h = f.holat;
        return <div key={f.kalit} className={`ol-fan ${h ? `is-${h.turi}` : ""}`} style={{ "--fan": RANGLAR[i % RANGLAR.length] }}>
          {h?.turi === "bor" && <span className="ol-fan-badge is-bor">⭐ {T("Bugun")}</span>}
          {h?.turi === "keyin" && h.keyingi && <span className="ol-fan-badge">📅 {T(h.keyingi)}</span>}
          {h?.turi === "navbat" && <span className="ol-fan-badge">⏳ {T("Navbatda")}</span>}
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
