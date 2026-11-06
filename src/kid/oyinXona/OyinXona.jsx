// REV371: «O‘yinlar xonasi» — bolaning o‘yinlari o‘z nomi bilan; har o‘yin bosqichlarga bo‘lingan (10 raund),
// bosqichlar qulflangan: kuniga bittadan ochiladi (oldingisi o‘tilgan bo‘lsa), 2-bosqichdan boshlab — obuna bilan.
import React, { useEffect, useMemo, useRef, useState } from "react";
import Oyin from "../oyin/index.js";
import { oyinRasmTop } from "../oyin/oyinRasmTop.js";
import { OYIN_MATN } from "../oyin/oyinMatn.js";
import { bosqichlar, bosqichHolati, bosqichSozlama, xonaElementlar, xonaOyinlari, yulduzHisob, XONA_GURUHLAR } from "./xonaRules.js";
import { oyinSozlamaYukla, oyinYopiqmi } from "../oyin/oyinSozlama.js";
import "./oyinXona.css";

const MATN = {
  sarlavha: { uz: "Rivojlantiruvchi o‘yinlar", ru: "Развивающие игры", en: "Learning games", de: "Lernspiele", es: "Juegos educativos" },
  yosh: { uz: "Yosh", ru: "Возраст", en: "Age", de: "Alter", es: "Edad" },
  bosqich: { uz: "bosqich", ru: "уровень", en: "level", de: "Stufe", es: "nivel" },
  ertaga: { uz: "Ertaga ochiladi", ru: "Откроется завтра", en: "Opens tomorrow", de: "Öffnet morgen", es: "Se abre mañana" },
  qulf: { uz: "Avval oldingi bosqichni o‘ta", ru: "Сначала пройди предыдущий уровень", en: "Finish the previous level first", de: "Schaffe zuerst die vorige Stufe", es: "Primero supera el nivel anterior" },
  obuna: { uz: "Bu bosqich obunada ochiladi", ru: "Этот уровень открывается по подписке", en: "This level opens with a subscription", de: "Diese Stufe gibt es mit Abo", es: "Este nivel se abre con suscripción" },
  ortga: { uz: "Ortga", ru: "Назад", en: "Back", de: "Zurück", es: "Atrás" },
  qayta: { uz: "Qayta o‘ynash", ru: "Сыграть ещё", en: "Play again", de: "Nochmal spielen", es: "Jugar otra vez" },
  bosqichlar: { uz: "Bosqichlar", ru: "Уровни", en: "Levels", de: "Stufen", es: "Niveles" },
  togri: { uz: "To‘g‘ri javoblar", ru: "Правильных ответов", en: "Correct answers", de: "Richtige Antworten", es: "Respuestas correctas" },
  otdi: { uz: "Barakalla! Bosqich o‘tildi. Keyingisi ertaga ochiladi.", ru: "Молодец! Уровень пройден. Следующий откроется завтра.", en: "Well done! Level complete. The next one opens tomorrow.", de: "Super! Stufe geschafft. Die nächste öffnet morgen.", es: "¡Muy bien! Nivel superado. El siguiente se abre mañana." },
  yana: { uz: "Yana bir urinib ko‘ramiz!", ru: "Попробуем ещё раз!", en: "Let's try once more!", de: "Wir versuchen es noch einmal!", es: "¡Probemos otra vez!" },
};
const t = (k, iz) => MATN[k][iz] || MATN[k].uz;
const nomi = (o, iz) => OYIN_MATN[o.kalit]?.nom?.[iz] || OYIN_MATN[o.kalit]?.nom?.uz || o.nom;

export default function OyinXona({ apiBase = "", token = "", yosh: yoshBerilgan = "", izoh = "uz", onSay, onClose }) {
  // REV379: yosh berilmasa (kattalar, o'qituvchi) — tanlanadi va eslab qolinadi
  const [yosh, setYosh] = useState(() => yoshBerilgan || (() => { try { return localStorage.getItem("kabutar:xona:yosh") || "4-5"; } catch { return "4-5"; } })());
  const base = String(apiBase || "").replace(/\/+$/, "");
  const [h, setH] = useState(null);           // { holat, obuna, bugun }
  const [tanlangan, setTanlangan] = useState(null);   // o'yin
  const [oynaydi, setOynaydi] = useState(null);       // bosqich
  const [xabar, setXabar] = useState("");
  const [natija, setNatija] = useState(null);
  const [takror, setTakror] = useState(0);   // REV383: bosqich oxirida natija oynasi (o'zi chiqib ketmaydi)
  const [, setSoz] = useState(0);
  const urug = useRef(Math.floor(Math.random() * 1e6));
  const say = (s, d) => { try { onSay?.(s, d); } catch { d?.(); } };
  const yukla = () => fetch(`${base}/api/bola/oyin_xona?${new URLSearchParams({ token })}`).then((r) => (r.ok ? r.json() : null)).catch(() => null)
    .then((j) => setH(j || { holat: {}, obuna: false, bugun: new Date().toISOString().slice(0, 10) }));
  useEffect(() => { yukla(); oyinSozlamaYukla(base).then(() => setSoz((x) => x + 1)).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { say(t("sarlavha", izoh)); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const oyinlar = useMemo(() => xonaOyinlari(yosh, oyinYopiqmi), [yosh, h]); // eslint-disable-line react-hooks/exhaustive-deps
  // REV383: telefonning «orqaga» tugmasi — ilovadan chiqib ketmaydi, bir qadam ortga qaytadi (o'yin → bosqichlar → o'yinlar → chiqish)
  const qadam = oynaydi ? 2 : tanlangan ? 1 : 0;
  const qadamRef = useRef(qadam); qadamRef.current = qadam;
  useEffect(() => { if (qadam > 0) { try { window.history.pushState({ oxQadam: qadam }, ""); } catch { /* */ } } }, [qadam]);
  useEffect(() => {
    const h = () => { const q = qadamRef.current; if (q === 2) { setOynaydi(null); setNatija(null); } else if (q === 1) { setTanlangan(null); setXabar(""); } };
    window.addEventListener("popstate", h); return () => window.removeEventListener("popstate", h);
  }, []);
  if (!h) return <div className="ox-root"><p role="status">…</p></div>;
  const prog = (id) => h.holat?.[String(id)] || {};

  if (oynaydi && tanlangan) {
    const b = oynaydi;
    return <div className="ox-root ox-oyin">
      <button type="button" className="ox-orqa-oyin" onClick={() => { setNatija(null); setOynaydi(null); }}>← {t("ortga", izoh)}</button>
      <Oyin key={`${tanlangan.id}-${b.i}-${takror}`} id={tanlangan.id} elementlar={xonaElementlar(b, izoh)} yosh={yosh} til={izoh} izoh={izoh} rasm={oyinRasmTop}
        urug={urug.current + b.i} kirishDaraja="yoq" {...bosqichSozlama(yosh, b.i, tanlangan.id)} onSay={(s, d) => say(s, d)}
        onNatija={(togri, xatolar) => {
          const xato = Array.isArray(xatolar) ? xatolar.length : Number(xatolar) || 0;
          const yulduz = yulduzHisob(togri, xato);
          if (!yulduz) { setNatija({ yulduz: 0, togri, jami: togri + xato }); say(t("yana", izoh)); return; }
          fetch(`${base}/api/bola/oyin_xona/otdi`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, oyin: tanlangan.id, bosqich: b.i, yulduz }) })
            .then((r) => (r.ok ? r.json() : null)).catch(() => null)
            .then((j) => { if (j?.holat) setH(j); else setH((x) => ({ ...x, holat: { ...x.holat, [tanlangan.id]: { ...prog(tanlangan.id), [b.i]: { sana: x.bugun, yulduz } } } }));
              setNatija({ yulduz, togri, jami: togri + xato }); say(t("otdi", izoh)); });
        }} />
      {natija && <div className="ox-natija" role="dialog" aria-modal="true">
        <div className="ox-natija-karta">
          <div className="ox-natija-yulduz" aria-hidden="true">{natija.yulduz ? "⭐".repeat(natija.yulduz) : "💪"}</div>
          <b>{natija.yulduz ? t("otdi", izoh) : t("yana", izoh)}</b>
          <p>{t("togri", izoh)}: {natija.togri} / {natija.jami}</p>
          <div className="ox-natija-tugmalar">
            <button type="button" className="ox-tugma" onClick={() => { setNatija(null); urug.current += 101; setTakror((x) => x + 1); }}>🔁 {t("qayta", izoh)}</button>
            <button type="button" className="ox-tugma is-asosiy" onClick={() => { setNatija(null); setOynaydi(null); }}>🗺️ {t("bosqichlar", izoh)}</button>
          </div>
        </div>
      </div>}
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
    {!yoshBerilgan && <div className="ox-yosh" role="radiogroup" aria-label={t("yosh", izoh)}>{t("yosh", izoh)}:
      {["2-3", "4-5", "6-7"].map((y) => <button key={y} type="button" role="radio" aria-checked={yosh === y} className={yosh === y ? "is-on" : ""}
        onClick={() => { setYosh(y); try { localStorage.setItem("kabutar:xona:yosh", y); } catch { /* */ } }}>{y}</button>)}</div>}
    {XONA_GURUHLAR.map((g) => { const ro = oyinlar.filter((o) => g.oyinlar.includes(o.id)); if (!ro.length) return null;
      return <section key={g.kalit} className="ox-guruh"><h3><span aria-hidden="true">{g.belgi}</span> {g.nom[izoh] || g.nom.uz} <small>{ro.length}</small></h3>
        <div className="ox-oyinlar">{ro.map((o) => {
          const bs = bosqichlar(o.id); const otdi = Object.keys(prog(o.id)).length;
          return <button key={o.id} type="button" className="ox-oyin-karta" onClick={() => { setTanlangan(o); say(nomi(o, izoh)); }}>
            <span className="ox-belgi" aria-hidden="true">{o.belgi}</span>
            <b>{nomi(o, izoh)}</b>
            <span className="ox-progress"><span style={{ width: `${Math.round((otdi / bs.length) * 100)}%` }} /></span>
            <small>{otdi}/{bs.length}</small>
          </button>;
        })}</div></section>; })}
  </div>;
}
