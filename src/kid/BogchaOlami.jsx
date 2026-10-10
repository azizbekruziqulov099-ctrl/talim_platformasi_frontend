import React, { useEffect, useRef, useState } from "react";
import { SAHNALAR, ZINA, fanEshiklari, qavatSoni, qoshnilar, sahnaSrc } from "./olamRules.js";
import { ustozFor } from "./ustozRules.js";
import UstozSahna from "./UstozSahna.jsx";
import "./olam.css";
import bino_960 from "./olam/bino_960.webp";
import bino_1600 from "./olam/bino_1600.webp";
import koridor_960 from "./olam/koridor_960.webp";
import koridor_1600 from "./olam/koridor_1600.webp";
import zal_960 from "./olam/zal_960.webp";
import zal_1600 from "./olam/zal_1600.webp";
import sport_960 from "./olam/sport_960.webp";
import sport_1600 from "./olam/sport_1600.webp";
import hayvonot_960 from "./olam/hayvonot_960.webp";
import hayvonot_1600 from "./olam/hayvonot_1600.webp";
import hovli_960 from "./olam/hovli_960.webp";

// REV120: sahna rasmlari statik import — Vite ularni build'ga aniq qo'shadi
// (oldingi new URL(p, import.meta.url) yordamchi funksiya ichida bo'lgani uchun production'da fon rasm chiqmasdi).
const RASMLAR = {
  bino: { k960: bino_960, k1600: bino_1600 },
  koridor: { k960: koridor_960, k1600: koridor_1600 },
  zal: { k960: zal_960, k1600: zal_1600 },
  sport: { k960: sport_960, k1600: sport_1600 },
  hayvonot: { k960: hayvonot_960, k1600: hayvonot_1600 },
  hovli: { k960: hovli_960 },
};

// Nuqta rasm chetidan chiqib ketmasin (telefonda ham to'liq ko'rinsin)
const cx = (x) => `${Math.min(93, Math.max(7, x))}%`;
const cy = (y) => `${Math.min(90, Math.max(10, y))}%`;
const keng = () => { try { return (globalThis.innerWidth || 0) * (globalThis.devicePixelRatio || 1) > 1300; } catch { return false; } };

/**
 * REV112: Bog'cha olami — bolaning bosh ekrani. Bino oldidan boshlanadi; yo'lakdagi har eshik — bitta fan sinfxonasi,
 * u yerda o'sha fan ustozi kutib oladi. Zal, sport maydoni, hayvonot bog'i va hovlida kichik o'yinlar bor.
 * Ob-havo va kun vaqti haqiqiy (tashqarida yomg'ir yog'sa — hovlida ham yog'adi, kechasi qorong'i).
 * fanlar: [{ kalit, nom, emoji }] · onFan(kalit) — sinfda «Darsni boshlash» bosilganda.
 */
export default function BogchaOlami({ fanlar = [], onFan, say, havo = "quyosh", vaqt = "kun", boshlash = "bino", nextLabel = "" }) {
  const [joy, setJoy] = useState(boshlash);
  const [ketish, setKetish] = useState(null);     // {x,y} — o'sha nuqtaga yaqinlashib o'tadi
  const [effekt, setEffekt] = useState(null);     // {x,y,emoji,turi,n}
  const [qavat, setQavat] = useState(0);          // REV121: yo'lak qavati (fan ko'p bo'lsa — 2-, 3-qavat)
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const eshiklar = fanEshiklari(fanlar);
  const qavatlar = qavatSoni(fanlar);
  const qavatNom = (q) => `${q + 1}-qavat`;
  const zinaga = (q) => {
    setKetish({ ...(q > qavat ? ZINA.yuqori : ZINA.past) });
    say?.(qavatNom(q));
    setTimeout(() => { if (alive.current) { setQavat(q); setKetish(null); setEffekt(null); } }, 420);
  };
  const sinf = typeof joy === "object" ? eshiklar.find((f) => f.kalit === joy.sinf) : null;
  const s = sinf ? null : SAHNALAR[joy] || SAHNALAR.bino;

  // Qo'shni sahnalarni oldindan yuklab qo'yamiz — o'tish bir zumda bo'lsin
  useEffect(() => {
    if (!s || typeof Image === "undefined") return;
    qoshnilar(joy).forEach((id) => { const im = new Image(); im.src = sahnaSrc(RASMLAR, id, keng()); });
  }, [joy]); // eslint-disable-line react-hooks/exhaustive-deps

  const bor = (keyingi, x = 50, y = 50, nom = "") => {
    setKetish({ x, y });
    if (nom) say?.(nom);
    setTimeout(() => { if (alive.current) { setJoy(keyingi); setKetish(null); setEffekt(null); } }, 420);
  };
  const amal = (n) => {
    setEffekt({ x: n.x, y: n.y, emoji: n.emoji, turi: n.amal, n: Date.now() });
    if (n.nom) say?.(n.nom);
  };

  if (sinf) {
    return <div className="ol-root">
      <div className="ol-bar">
        <button type="button" className="ol-back" onClick={() => { setQavat(sinf.qavat || 0); setJoy("koridor"); }} aria-label="Yo'lakka qaytish">⬅️ 🚪</button>
        <span className="ol-title" aria-hidden="true">{sinf.emoji} {sinf.nom}</span>
      </div>
      <div className="ol-class">
        <UstozSahna ustoz={ustozFor(sinf.nom)} mood="wave" havo={havo} vaqt={vaqt} pictures={[]} />
        <button type="button" className="ol-start" onClick={() => onFan?.(sinf.kalit)}>
          <span aria-hidden="true">▶</span><b>{nextLabel || "Darsni boshlaymiz!"}</b>
        </button>
      </div>
    </div>;
  }

  const tashqi = s.tashqi;
  const src = sahnaSrc(RASMLAR, joy, false);
  const src2 = RASMLAR[joy]?.k1600;
  return <div className="ol-root">
    <div className="ol-bar">
      {s.orqaga ? <button type="button" className="ol-back" onClick={() => bor(s.orqaga, 50, 95)} aria-label="Orqaga">⬅️ {SAHNALAR[s.orqaga].emoji}</button> : <span />}
      <span className="ol-title" aria-hidden="true">{s.emoji} {s.nom}{joy === "koridor" && qavatlar > 1 ? ` · ${qavatNom(qavat)}` : ""}</span>
    </div>
    <div key={joy === "koridor" ? `koridor-${qavat}` : joy} className={`ol-scene vaqt-${vaqt} ${ketish ? "is-leaving" : ""} ${joy === "koridor" ? `qavat-${qavat % 4}` : ""}`}
      style={ketish ? { transformOrigin: `${ketish.x}% ${ketish.y}%` } : undefined}>
      <img className="ol-bg" src={src} srcSet={src2 ? `${src} 960w, ${src2} 1600w` : undefined} sizes="(max-width: 1000px) 100vw, 1000px" alt="" decoding="async" />
      {tashqi && <div className={`ol-havo havo-${havo}`} aria-hidden="true"><i /><i /></div>}
      <div className="us-light" aria-hidden="true" />
      {s.vaqtinchalik && <span className="ol-soon" aria-hidden="true">🖼️</span>}
      {s.nuqtalar.filter((n) => joy !== "koridor" || qavat === 0 || !n.ga).map((n) => <button key={n.id} type="button" className={`ol-spot ${n.ga ? "is-go" : "is-play"}`}
        style={{ left: cx(n.x), top: cy(n.y) }} aria-label={n.nom}
        onClick={() => (n.ga ? bor(n.ga, n.x, n.y, n.nom) : amal(n))}>
        <span>{n.emoji}</span>
      </button>)}
      {joy === "koridor" && qavat < qavatlar - 1 && <button type="button" className="ol-spot is-stairs" style={{ left: cx(ZINA.yuqori.x), top: cy(ZINA.yuqori.y) }}
        aria-label={`${qavatNom(qavat + 1)} ⬆️`} onClick={() => zinaga(qavat + 1)}><span>🪜</span><small>⬆️ {qavat + 2}</small></button>}
      {joy === "koridor" && qavat > 0 && <button type="button" className="ol-spot is-stairs" style={{ left: cx(ZINA.past.x), top: cy(ZINA.past.y) }}
        aria-label={`${qavatNom(qavat - 1)} ⬇️`} onClick={() => zinaga(qavat - 1)}><span>🪜</span><small>⬇️ {qavat}</small></button>}
      {joy === "koridor" && eshiklar.filter((f) => f.qavat === qavat).map((f) => <button key={f.kalit} type="button" className="ol-spot is-door"
        style={{ left: cx(f.joy.x), top: cy(f.joy.y) }} aria-label={f.nom}
        onClick={() => { say?.(f.nom); bor({ sinf: f.kalit }, f.joy.x, f.joy.y); }}>
        <span>{f.emoji}</span>
      </button>)}
      {effekt && <span key={effekt.n} className={`ol-fx fx-${effekt.turi}`} style={{ left: cx(effekt.x), top: cy(effekt.y) }} aria-hidden="true">
        {effekt.turi === "konsert" ? "🎵🎶✨" : effekt.turi === "gol" ? "⚽" : effekt.turi === "sakra" ? "⭐✨⭐" : effekt.emoji}
      </span>}
    </div>
  </div>;
}
