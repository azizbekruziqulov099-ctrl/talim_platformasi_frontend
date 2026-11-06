// REV371: «O‘yinlar xonasi» — bolaning o‘yinlari o‘z nomi bilan; har o‘yin bosqichlarga bo‘lingan (10 raund),
// bosqichlar qulflangan: kuniga bittadan ochiladi (oldingisi o‘tilgan bo‘lsa), 2-bosqichdan boshlab — obuna bilan.
import React, { useEffect, useMemo, useRef, useState } from "react";
import Oyin from "../oyin/index.js";
import { oyinRasmTop } from "../oyin/oyinRasmTop.js";
import { OYIN_MATN } from "../oyin/oyinMatn.js";
import { bosqichlar, bosqichHolati, bosqichSozlama, xonaElementlar, xonaOyinlari, yulduzHisob } from "./xonaRules.js";
import { oyinSozlamaYukla, oyinYopiqmi } from "../oyin/oyinSozlama.js";
import "./oyinXona.css";

const MATN = {
  sarlavha: { uz: "O‘yinlar xonasi", ru: "Игровая комната", en: "Game room", de: "Spielzimmer", es: "Sala de juegos" },
  bosqich: { uz: "bosqich", ru: "уровень", en: "level", de: "Stufe", es: "nivel" },
  ertaga: { uz: "Ertaga ochiladi", ru: "Откроется завтра", en: "Opens tomorrow", de: "Öffnet morgen", es: "Se abre mañana" },
  qulf: { uz: "Avval oldingi bosqichni o‘ta", ru: "Сначала пройди предыдущий уровень", en: "Finish the previous level first", de: "Schaffe zuerst die vorige Stufe", es: "Primero supera el nivel anterior" },
  obuna: { uz: "Bu bosqich obunada ochiladi", ru: "Этот уровень открывается по подписке", en: "This level opens with a subscription", de: "Diese Stufe gibt es mit Abo", es: "Este nivel se abre con suscripción" },
  otdi: { uz: "Barakalla! Bosqich o‘tildi. Keyingisi ertaga ochiladi.", ru: "Молодец! Уровень пройден. Следующий откроется завтра.", en: "Well done! Level complete. The next one opens tomorrow.", de: "Super! Stufe geschafft. Die nächste öffnet morgen.", es: "¡Muy bien! Nivel superado. El siguiente se abre mañana." },
  yana: { uz: "Yana bir urinib ko‘ramiz!", ru: "Попробуем ещё раз!", en: "Let's try once more!", de: "Wir versuchen es noch einmal!", es: "¡Probemos otra vez!" },
};
const t = (k, iz) => MATN[k][iz] || MATN[k].uz;
const nomi = (o, iz) => OYIN_MATN[o.kalit]?.nom?.[iz] || OYIN_MATN[o.kalit]?.nom?.uz || o.nom;

export default function OyinXona({ apiBase = "", token = "", yosh = "4-5", izoh = "uz", onSay, onClose }) {
  const base = String(apiBase || "").replace(/\/+$/, "");
  const [h, setH] = useState(null);           // { holat, obuna, bugun }
  const [tanlangan, setTanlangan] = useState(null);   // o'yin
  const [oynaydi, setOynaydi] = useState(null);       // bosqich
  const [xabar, setXabar] = useState("");
  const [, setSoz] = useState(0);
  const urug = useRef(Math.floor(Math.random() * 1e6));
  const say = (s, d) => { try { onSay?.(s, d); } catch { d?.(); } };
  const yukla = () => fetch(`${base}/api/bola/oyin_xona?${new URLSearchParams({ token })}`).then((r) => (r.ok ? r.json() : null)).catch(() => null)
    .then((j) => setH(j || { holat: {}, obuna: false, bugun: new Date().toISOString().slice(0, 10) }));
  useEffect(() => { yukla(); oyinSozlamaYukla(base).then(() => setSoz((x) => x + 1)).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { say(t("sarlavha", izoh)); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const oyinlar = useMemo(() => xonaOyinlari(yosh, oyinYopiqmi), [yosh, h]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!h) return <div className="ox-root"><p role="status">…</p></div>;
  const prog = (id) => h.holat?.[String(id)] || {};

  if (oynaydi && tanlangan) {
    const b = oynaydi;
    return <div className="ox-root ox-oyin">
      <button type="button" className="ox-orqa" onClick={() => setOynaydi(null)} aria-label="←">✕</button>
      <Oyin key={`${tanlangan.id}-${b.i}`} id={tanlangan.id} elementlar={xonaElementlar(b, izoh)} yosh={yosh} til={izoh} izoh={izoh} rasm={oyinRasmTop}
        urug={urug.current + b.i} kirishDaraja="yoq" {...bosqichSozlama(yosh, b.i)} onSay={(s, d) => say(s, d)}
        onNatija={(togri, xatolar) => {
          const xato = Array.isArray(xatolar) ? xatolar.length : Number(xatolar) || 0;
          const yulduz = yulduzHisob(togri, xato);
          if (!yulduz) { setXabar(t("yana", izoh)); say(t("yana", izoh)); setTimeout(() => setOynaydi(null), 1400); return; }
          fetch(`${base}/api/bola/oyin_xona/otdi`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, oyin: tanlangan.id, bosqich: b.i, yulduz }) })
            .then((r) => (r.ok ? r.json() : null)).catch(() => null)
            .then((j) => { if (j?.holat) setH(j); else setH((x) => ({ ...x, holat: { ...x.holat, [tanlangan.id]: { ...prog(tanlangan.id), [b.i]: { sana: x.bugun, yulduz } } } }));
              setXabar(t("otdi", izoh)); say(t("otdi", izoh)); setTimeout(() => setOynaydi(null), 1600); });
        }} />
    </div>;
  }

  if (tanlangan) {
    const bs = bosqichlar(tanlangan.id); const p = prog(tanlangan.id);
    return <div className="ox-root">
      <div className="ox-bosh"><button type="button" className="ox-orqa" onClick={() => { setTanlangan(null); setXabar(""); }} aria-label="←">←</button>
        <h2><span aria-hidden="true">{tanlangan.belgi}</span> {nomi(tanlangan, izoh)}</h2></div>
      {xabar && <p className="ox-xabar" role="status">{xabar}</p>}
      <div className="ox-yol">{bs.map((b) => {
        const hol = bosqichHolati(p, b.i, h); const ochiq = hol === "ochiq" || hol === "otdi";
        return <button key={b.i} type="button" className={`ox-bosqich is-${hol}`} disabled={!ochiq && hol !== "ertaga" && hol !== "obuna" && hol !== "qulf"}
          onClick={() => { if (ochiq) { setXabar(""); setOynaydi(b); } else { const m = t(hol === "ertaga" ? "ertaga" : hol === "obuna" ? "obuna" : "qulf", izoh); setXabar(m); say(m); } }}
          aria-label={`${b.i} ${t("bosqich", izoh)} — ${b.nom[izoh] || b.nom.uz}`}>
          <span className="ox-bosqich-son">{ochiq ? b.i : "🔒"}</span>
          <span className="ox-bosqich-rasm" aria-hidden="true"><img src={oyinRasmTop({ rasmId: b.items[0].r })} alt="" /></span>
          <span className="ox-yulduz" aria-hidden="true">{hol === "otdi" ? "⭐".repeat(p[b.i]?.yulduz || 1) : hol === "ertaga" ? "🌙" : hol === "obuna" ? "💎" : ""}</span>
        </button>;
      })}</div>
    </div>;
  }

  return <div className="ox-root">
    <div className="ox-bosh">{onClose && <button type="button" className="ox-orqa" onClick={onClose} aria-label="✕">✕</button>}
      <h2>🎮 {t("sarlavha", izoh)}</h2></div>
    <div className="ox-oyinlar">{oyinlar.map((o) => {
      const bs = bosqichlar(o.id); const otdi = Object.keys(prog(o.id)).length;
      return <button key={o.id} type="button" className="ox-oyin-karta" onClick={() => { setTanlangan(o); say(nomi(o, izoh)); }}>
        <span className="ox-belgi" aria-hidden="true">{o.belgi}</span>
        <b>{nomi(o, izoh)}</b>
        <span className="ox-progress"><span style={{ width: `${Math.round((otdi / bs.length) * 100)}%` }} /></span>
        <small>{otdi}/{bs.length}</small>
      </button>;
    })}</div>
  </div>;
}
