// REV185: GAP TUZISH — bola butun so'z kartochkalaridan avval 2 so'zli, keyin 3 so'zli gap tuzadi.
// Kartochkalar aralash; bola tartib bilan bosadi. To'g'ri bo'lsa — til Kabusi gapni o'qiydi, xato bo'lsa — o'zbek Kabu
// qayerda adashganini aytadi (yuqori sinflarda — o'rganilayotgan tilda). Gaplar dars matnidan avtomatik olinadi.
import React, { useMemo, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { gaplar as gapla } from "./immersiya.js";
import "./ikkiUstoz.css";

const TEG = /\[([a-z]{2})\]([\s\S]*?)\[\/\1\]/g;
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;
const sozlarOl = (g) => g.replace(EMOJI, "").replace(/[.!?¡¿…,;:«»"“”—–]/g, " ").split(/\s+/).filter(Boolean);

/** Dars qadamlaridan 2 va 3 so'zli gaplar: [{gap, sozlar, tarjima}] (2 so'zlilar oldin). */
export function qisqaGaplar(steps = [], til = "") {
  if (!til) return [];
  const out = [], seen = new Set();
  for (const s of steps) {
    const t = String(s?.ovoz || "");
    const qism = [];
    let last = 0;
    for (const m of t.matchAll(TEG)) {
      if (m.index > last && t.slice(last, m.index).trim()) qism.push({ til: "", matn: t.slice(last, m.index) });
      qism.push({ til: m[1], matn: m[2] });
      last = m.index + m[0].length;
    }
    if (last < t.length && t.slice(last).trim()) qism.push({ til: "", matn: t.slice(last) });
    qism.forEach((q, i) => {
      if (q.til !== til) return;
      const tg = gapla(q.matn);
      const keyin = qism[i + 1] && qism[i + 1].til !== til && !/^\s*[—–-]/.test(qism[i + 1].matn) ? gapla(qism[i + 1].matn) : [];
      tg.forEach((g, j) => {
        if (/[:=_]|\.\.\.|…/.test(g) || (g.match(/,/g) || []).length >= 2) return;
        const sozlar = sozlarOl(g);
        const k = sozlar.join(" ").toLowerCase();
        if (sozlar.length < 2 || sozlar.length > 3 || seen.has(k) || new Set(sozlar.map((x) => x.toLowerCase())).size < sozlar.length) return;
        seen.add(k);
        out.push({ gap: g.replace(EMOJI, "").trim(), sozlar, tarjima: keyin.length >= tg.length ? (keyin[j] || "").trim() : "" });
      });
    });
  }
  return out.sort((a, b) => a.sozlar.length - b.sozlar.length).slice(0, 8);
}

function aralash(arr, urug) {
  const a = arr.map((x, i) => ({ x, i }));
  let s = urug;
  for (let i = a.length - 1; i > 0; i -= 1) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if (a.every((v, k) => v.i === k) && a.length > 1) a.reverse();
  return a;
}

const XABAR = {
  uz: { togri: "Barakalla! To'g'ri!", xato: (s) => `Yana urinib ko'r! Birinchi so'z — ${s}.`, tushuntir: "So'zlarni to'g'ri tartibda bos." },
  ru: { togri: "Молодец! Верно!", xato: (s) => `Попробуй ещё! Первое слово — ${s}.`, tushuntir: "Нажимай на слова по порядку." },
  en: { togri: "Well done! Correct!", xato: (s) => `Try again! The first word is ${s}.`, tushuntir: "Tap the words in the right order." },
};

/** ayt(matn) — teglangan matnni ikki ovozda o'qiydi (til qismi — til Kabusi/ustozi, qolgani — izoh). ulush — immersiya. */
export function GapTuzish({ gaplar = [], til = "", iz = "uz", ulush = 0.5, ayt, onYop }) {
  const [n, setN] = useState(0);
  const [tanlangan, setTanlangan] = useState([]);
  const [holat, setHolat] = useState("");   // "" | "togri" | "xato"
  const [ball, setBall] = useState(0);
  const g = gaplar[n];
  const kartalar = useMemo(() => (g ? aralash(g.sozlar, n * 7 + g.gap.length) : []), [g, n]);
  const X = XABAR[iz] || XABAR.uz;
  const T = (m) => `[${til}]${m}[/${til}]`;
  const N = (m) => (iz === "uz" ? m : `[${iz}]${m}[/${iz}]`);
  if (!g) {
    return <div className="iu-izoh" role="dialog" aria-modal="true"><div className="iu-izoh-karta gt-karta">
      <h3>🧩 {__kbUi("Gap tuzish")}</h3>
      <p className="iu-izoh-tarjima">{gaplar.length ? `⭐ ${ball} / ${gaplar.length}` : __kbUi("Bu darsda qisqa gaplar topilmadi.")}</p>
      <div className="iu-izoh-tugma"><button type="button" className="dx-btn dx-primary" onClick={onYop}>▶ {__kbUi("Darsga qaytish")}</button></div>
    </div></div>;
  }
  const bos = (k) => {
    if (holat === "togri" || tanlangan.includes(k)) return;
    const yangi = [...tanlangan, k];
    setTanlangan(yangi);
    if (yangi.length < g.sozlar.length) return;
    const gap = yangi.map((i) => kartalar[i].x).join(" ");
    if (gap.toLowerCase() === g.sozlar.join(" ").toLowerCase()) {
      setHolat("togri"); setBall((b) => b + 1);
      ayt?.(`${T(g.gap)} ${ulush < 0.999 && g.tarjima ? N(g.tarjima) : ""} ${ulush < 0.8 ? N(X.togri) : T(g.gap)}`);
    } else {
      setHolat("xato");
      ayt?.(ulush < 0.8 ? `${N(X.xato("").replace(/\s*\.\s*$/, ""))} ${T(g.sozlar[0])}` : T(`${g.sozlar[0]}…`));
      setTimeout(() => { setTanlangan([]); setHolat(""); }, 1400);
    }
  };
  const keyingi = () => { setN((x) => x + 1); setTanlangan([]); setHolat(""); };
  return <div className="iu-izoh" role="dialog" aria-modal="true" aria-label={__kbUi("Gap tuzish")}>
    <div className="iu-izoh-karta gt-karta">
      <div className="iu-izoh-bosh"><h3>🧩 {__kbUi("Gap tuz")}</h3><span className="iu-turkum">{n + 1} / {gaplar.length} · {g.sozlar.length} {__kbUi("so‘z")}</span></div>
      {ulush < 0.8 && g.tarjima && <p className="iu-izoh-tur">{g.tarjima}</p>}
      <div className={`gt-javob is-${holat || "bosh"}`} lang={til}>
        {g.sozlar.map((_, i) => <span key={i} className="gt-joy">{tanlangan[i] !== undefined ? kartalar[tanlangan[i]].x : "…"}</span>)}
      </div>
      <div className="gt-kartalar" lang={til}>
        {kartalar.map((k, i) => <button key={i} type="button" className="gt-chip" disabled={tanlangan.includes(i) || holat === "togri"} onClick={() => bos(i)}>{k.x}</button>)}
      </div>
      <p className="iu-izoh-tur">{holat === "togri" ? `✅ ${X.togri}` : holat === "xato" ? `🔁 ${X.xato(g.sozlar[0])}` : X.tushuntir}</p>
      <div className="iu-izoh-tugma">
        <button type="button" className="dx-btn" onClick={() => ayt?.(T(g.gap))}>🔊 {__kbUi("Eshitish")}</button>
        {holat === "togri" ? <button type="button" className="dx-btn dx-primary" onClick={keyingi}>{__kbUi("Keyingi")} ▶</button>
          : <button type="button" className="dx-btn" onClick={onYop}>✕ {__kbUi("Yopish")}</button>}
      </div>
    </div>
  </div>;
}
