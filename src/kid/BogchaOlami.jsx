import React, { useEffect, useState } from "react";
import { SAHNALAR, ZINA, fanEshiklari, qavatSoni, qoshnilar, sahnaSrc } from "./olamRules.js";
import { ustozFor } from "./ustozRules.js";
import UstozSahna from "./UstozSahna.jsx";
import FanBelgi from "./FanBelgi.jsx";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import { useKeepLight } from "./useKeepLight.js";
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
const yon = (x) => (x < 22 ? "is-l" : x > 78 ? "is-r" : "");   // nom yorlig'i sahna chetidan chiqmasin
const ESLAB = "kabutar:olam:joy:v1";
const eslab = () => { try { return JSON.parse(window.sessionStorage.getItem(ESLAB) || "null"); } catch { return null; } };
const saqla = (v) => { try { window.sessionStorage.setItem(ESLAB, JSON.stringify(v)); } catch { /* ixtiyoriy */ } };
const keng = () => { try { return (globalThis.innerWidth || 0) * (globalThis.devicePixelRatio || 1) > 1300; } catch { return false; } };

/**
 * REV112: Bog'cha olami — bolaning bosh ekrani. Bino oldidan boshlanadi; yo'lakdagi har eshik — bitta fan sinfxonasi,
 * u yerda o'sha fan ustozi kutib oladi. Zal, sport maydoni, hayvonot bog'i va hovlida kichik o'yinlar bor.
 * Ob-havo va kun vaqti haqiqiy (tashqarida yomg'ir yog'sa — hovlida ham yog'adi, kechasi qorong'i).
 * fanlar: [{ kalit, nom, emoji }] · onFan(kalit) — sinfda «Darsni boshlash» bosilganda.
 */
export default function BogchaOlami({ fanlar = [], onFan, say, havo = "quyosh", vaqt = "kun", boshlash = "bino", nextLabel = "" }) {
  // REV123: bola qayerda turgani eslab qolinadi (darsdan qaytganda yoki sahifa qayta chizilganda yana boshidan yurmaydi)
  const [joy, setJoyRaw] = useState(() => eslab()?.joy ?? boshlash);
  const [qavat, setQavatRaw] = useState(() => Number(eslab()?.qavat) || 0);   // REV121: yo'lak qavati
  const [kirish, setKirish] = useState(null);     // {x,y} — yangi sahna shu nuqtadan «ochiladi»
  const [effekt, setEffekt] = useState(null);     // {x,y,emoji,turi,n}
  useKeepLight(true);
  const setJoy = (v) => { setJoyRaw(v); saqla({ joy: v, qavat }); };
  const setQavat = (q) => { setQavatRaw(q); saqla({ joy, qavat: q }); };

  const eshiklar = fanEshiklari(fanlar);
  const qavatlar = qavatSoni(fanlar);
  useInterface();   // REV122: til almashsa nomlar ham almashadi
  const qavatNom = (q) => T(`${q + 1}-qavat`);
  // tarjima bo'lsa (en) — inglizcha ovozda; ruscha kirill ovoz tomonda aniqlanadi
  const ayt = (uz, matn = T(uz)) => say?.(matn, { en: matn !== uz && /^[\x00-\x7F\s\p{P}\p{Emoji}]*$/u.test(matn) });
  // REV123: o'tish DARHOL — taymer yo'q (taymer biror sabab bilan bekor bo'lsa bola joyidan jilmay qolardi).
  // Yangi sahna bosilgan nuqtadan kattalashib ochiladi.
  const zinaga = (q) => {
    ayt(`${q + 1}-qavat`);
    setKirish({ ...(q > qavat ? ZINA.yuqori : ZINA.past) }); setEffekt(null);
    setQavatRaw(q); saqla({ joy, qavat: q });
  };
  // Yo'q bo'lib ketgan fan (masalan, til almashganda) — yo'lakka qaytamiz
  const sinfTop = typeof joy === "object" && joy ? eshiklar.find((f) => f.kalit === joy.sinf) : null;
  const sinf = sinfTop;
  const s = sinf ? null : SAHNALAR[typeof joy === "string" ? joy : ""] || (typeof joy === "object" ? SAHNALAR.koridor : SAHNALAR.bino);
  const joyKey = sinf ? "sinf" : (SAHNALAR[joy] ? joy : (typeof joy === "object" ? "koridor" : "bino"));

  // Qo'shni sahnalarni oldindan yuklab qo'yamiz — o'tish bir zumda bo'lsin
  useEffect(() => {
    if (!s || typeof Image === "undefined") return;
    qoshnilar(joyKey).forEach((id) => { const im = new Image(); im.src = sahnaSrc(RASMLAR, id, keng()); });
  }, [joyKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const bor = (keyingi, x = 50, y = 50, nom = "") => {
    if (nom) ayt(nom);
    setKirish({ x, y }); setEffekt(null);
    setJoy(keyingi);
  };
  // REV123: bola rasmdagi eshikni / maydonni bossa ham — eng yaqin nuqta ishlaydi (kichik doirani topishi shart emas)
  const sahnaBosildi = (e) => {
    if (e.target.closest("button")) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = ((e.clientX - r.left) / r.width) * 100, py = ((e.clientY - r.top) / r.height) * 100;
    const yaqin = [...e.currentTarget.querySelectorAll(".ol-spot")].map((b) => {
      const br = b.getBoundingClientRect();
      const bx = ((br.left + br.width / 2 - r.left) / r.width) * 100, by = ((br.top + br.height / 2 - r.top) / r.height) * 100;
      return { b, d: Math.hypot((px - bx) * (r.width / r.height), py - by) };
    }).sort((a, b) => a.d - b.d)[0];
    if (yaqin && yaqin.d < 24) yaqin.b.click();
  };
  const amal = (n) => {
    setEffekt({ x: n.x, y: n.y, emoji: n.emoji, turi: n.amal, n: Date.now() });
    if (n.nom) ayt(n.nom);
  };

  if (sinf) {
    return <div className="ol-root">
      <div className="ol-bar">
        <button type="button" className="ol-back" onClick={() => { const q = sinf.qavat || 0; setKirish(null); setQavatRaw(q); setJoyRaw("koridor"); saqla({ joy: "koridor", qavat: q }); }} aria-label={T("Yo'lakka qaytish")}>⬅️ 🚪</button>
        <span className="ol-title" aria-hidden="true"><FanBelgi emoji={sinf.emoji} /> {sinf.nom}</span>
      </div>
      <div className="ol-class">
        <UstozSahna ustoz={ustozFor(sinf.nom)} mood="wave" havo={havo} vaqt={vaqt} pictures={[]} />
        <button type="button" className="ol-start" onClick={() => onFan?.(sinf.kalit)}>
          <span aria-hidden="true">▶</span><b>{nextLabel || T("Darsni boshlaymiz!")}</b>
        </button>
      </div>
    </div>;
  }

  const tashqi = s.tashqi;
  const src = sahnaSrc(RASMLAR, joyKey, false);
  const src2 = RASMLAR[joyKey]?.k1600;
  return <div className="ol-root">
    <div className="ol-bar">
      {s.orqaga ? <button type="button" className="ol-back" onClick={() => bor(s.orqaga, 50, 95)} aria-label={T("Orqaga")}>⬅️ {SAHNALAR[s.orqaga].emoji}</button> : <span />}
      <span className="ol-title" aria-hidden="true">{s.emoji} {T(s.nom)}{joyKey === "koridor" && qavatlar > 1 ? ` · ${qavatNom(qavat)}` : ""}</span>
    </div>
    <div key={joyKey === "koridor" ? `koridor-${qavat}` : joyKey} className={`ol-scene vaqt-${vaqt} ${tashqi ? "" : "is-ichki"} ${kirish ? "is-kir" : ""} ${joyKey === "koridor" ? `qavat-${qavat % 4}` : ""}`}
      style={kirish ? { transformOrigin: `${kirish.x}% ${kirish.y}%` } : undefined} onClick={sahnaBosildi}>
      <img className="ol-bg" src={src} srcSet={src2 ? `${src} 960w, ${src2} 1600w` : undefined} sizes="(max-width: 1000px) 100vw, 1000px" alt="" decoding="async" />
      {tashqi && <div className={`ol-havo havo-${havo}`} aria-hidden="true"><i /><i /></div>}
      <div className="us-light" aria-hidden="true" />
      {s.vaqtinchalik && <span className="ol-soon" aria-hidden="true">🖼️</span>}
      {s.nuqtalar.filter((n) => joyKey !== "koridor" || qavat === 0 || !n.ga).map((n) => <button key={n.id} type="button" className={`ol-spot ${n.ga ? "is-go" : "is-play"}`}
        style={{ left: cx(n.x), top: cy(n.y) }} aria-label={T(n.nom)}
        onClick={() => (n.ga ? bor(n.ga, n.x, n.y, n.nom) : amal(n))}>
        <span>{n.emoji}</span>{n.ga && <small className={`ol-spot-label ${yon(n.x)}`}>{T(n.nom)}</small>}
      </button>)}
      {joyKey === "koridor" && qavat < qavatlar - 1 && <button type="button" className="ol-spot is-stairs" style={{ left: cx(ZINA.yuqori.x), top: cy(ZINA.yuqori.y) }}
        aria-label={`${qavatNom(qavat + 1)} ⬆️`} onClick={() => zinaga(qavat + 1)}><span>🪜</span><small>⬆️ {qavat + 2}</small></button>}
      {joyKey === "koridor" && qavat > 0 && <button type="button" className="ol-spot is-stairs" style={{ left: cx(ZINA.past.x), top: cy(ZINA.past.y) }}
        aria-label={`${qavatNom(qavat - 1)} ⬇️`} onClick={() => zinaga(qavat - 1)}><span>🪜</span><small>⬇️ {qavat}</small></button>}
      {joyKey === "koridor" && eshiklar.filter((f) => f.qavat === qavat).map((f) => <button key={f.kalit} type="button" className="ol-spot is-door"
        style={{ left: cx(f.joy.x), top: cy(f.joy.y) }} aria-label={f.nom}
        onClick={() => { say?.(f.nom, { en: /^(English|Arabic|Russian|Turkish|German|French|Spanish|Korean|Japanese|Chinese|Maths|Logic|The world around us)$/.test(f.nom) }); bor({ sinf: f.kalit }, f.joy.x, f.joy.y); }}>
        <span><FanBelgi emoji={f.emoji} /></span><small className={`ol-spot-label ${yon(f.joy.x)}`}>{f.nom}</small>
      </button>)}
      {effekt && <span key={effekt.n} className={`ol-fx fx-${effekt.turi}`} style={{ left: cx(effekt.x), top: cy(effekt.y) }} aria-hidden="true">
        {effekt.turi === "konsert" ? "🎵🎶✨" : effekt.turi === "gol" ? "⚽" : effekt.turi === "sakra" ? "⭐✨⭐" : effekt.emoji}
      </span>}
    </div>
  </div>;
}
