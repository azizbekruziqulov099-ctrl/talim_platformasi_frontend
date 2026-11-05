// REV358: «Bog'cha o'yinlari — sinov xonasi» (admin). Hamma o'yin yosh bo'yicha ajratilgan; tanlangan til va so'zlar
// to'plami bilan o'ynab ko'riladi; har o'yinga «yoqdi / tuzatish kerak» belgisi va izoh (shu qurilmada saqlanadi, hisobot nusxasi olinadi).
import React, { useMemo, useState } from "react";
import Oyin, { OYINLAR } from "../kid/oyin/index.js";
import { RASM_HAMMA } from "../kid/darsRasm.js";
import { emojiRasm, matnId, sozId } from "../kid/rasmHarakat.js";
import { HARAKAT_OYINLARI } from "../lesson/HarakatQadam.jsx";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import "./oyinSinov.css";

// Sinov uchun so'zlar to'plamlari (darsdagidek: rasm + nom; tillar darsida — o'rganiladigan so'z ham)
export const TOPLAMLAR = {
  hayvonlar: { nom: "🐾 Hayvonlar", el: [["🐈", "mushuk", "cat"], ["🐕", "it", "dog"], ["🐄", "sigir", "cow"], ["🐑", "qo‘y", "sheep"], ["🐔", "tovuq", "hen"], ["🐴", "ot", "horse"]] },
  mevalar: { nom: "🍎 Mevalar", el: [["🍎", "olma", "apple"], ["🍌", "banan", "banana"], ["🍐", "nok", "pear"], ["🍇", "uzum", "grapes"], ["🍉", "tarvuz", "watermelon"], ["🍒", "gilos", "cherry"]] },
  uy: { nom: "🏠 Uy buyumlari", el: [["🪑", "stul", "chair"], ["🛏️", "karavot", "bed"], ["🚪", "eshik", "door"], ["🪟", "deraza", "window"], ["🥄", "qoshiq", "spoon"], ["🍵", "piyola", "cup"]] },
};
const BELGI_KALIT = "kabutar:oyin-sinov";
const ol = () => { try { return JSON.parse(localStorage.getItem(BELGI_KALIT) || "{}"); } catch { return {}; } };
const yoz = (d) => { try { localStorage.setItem(BELGI_KALIT, JSON.stringify(d)); } catch { /* joy yo'q */ } };
const rasm = (el) => { if (!el) return ""; const mt = matnId(el.uz || ""); if (mt && RASM_HAMMA[mt]) return RASM_HAMMA[mt];
  const id = sozId({ soz: el.uz || "", emoji: el.emoji || "" }); if (id && RASM_HAMMA[id]) return RASM_HAMMA[id];
  return emojiRasm(el.emoji || "", RASM_HAMMA, el.uz || el.say || "")?.src || ""; };
const OVOZ_TIL = { uz: "uz-UZ", ru: "ru-RU", en: "en-US", de: "de-DE", es: "es-ES" };

export default function OyinSinov() {
  const [yosh, setYosh] = useState("4-5");
  const [izoh, setIzoh] = useState("uz");
  const [toplam, setToplam] = useState("hayvonlar");
  const [tilDarsi, setTilDarsi] = useState(false);   // tillar darsi: so'zlar o'rganiladigan tilda (inglizcha) aytiladi
  const [ochiq, setOchiq] = useState(null);
  const [urug, setUrug] = useState(1);
  const [gap, setGap] = useState("");
  const [belgilar, setBelgilar] = useState(ol);
  const ruyxat = useMemo(() => OYINLAR.filter((o) => !HARAKAT_OYINLARI.has(o.id) && o.yosh.includes(yosh)), [yosh]);
  const elementlar = useMemo(() => TOPLAMLAR[toplam].el.map(([e, uz, en], i) => ({ k: `e${i}`, emoji: e, uz, ...(tilDarsi ? { say: en } : {}) })), [toplam, tilDarsi]);
  const belgila = (id, qiymat) => { const d = { ...belgilar, [id]: { ...(belgilar[id] || {}), ...qiymat, vaqt: new Date().toISOString().slice(0, 16) } }; setBelgilar(d); yoz(d); };
  const ayt = (t, tugadi) => {
    setGap(String(t || "").replace(/\[\/?\w\w\]/g, ""));
    try { const u = new SpeechSynthesisUtterance(String(t || "").replace(/\[\/?\w\w\]/g, "")); u.lang = OVOZ_TIL[izoh] || "uz-UZ";
      u.onend = () => tugadi?.(); u.onerror = () => tugadi?.(); window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch { tugadi?.(); }
  };
  const hisobot = () => OYINLAR.filter((o) => belgilar[o.id]).map((o) => `${o.id} ${o.nom}: ${belgilar[o.id].holat === "ok" ? "✅ yoqdi" : belgilar[o.id].holat === "tuzat" ? "🛠 tuzatish kerak" : "—"}${belgilar[o.id].izoh ? ` — ${belgilar[o.id].izoh}` : ""}`).join("\n");
  const soni = { ok: Object.values(belgilar).filter((b) => b.holat === "ok").length, tuzat: Object.values(belgilar).filter((b) => b.holat === "tuzat").length };

  return <section className="os-root">
    <header className="os-bosh">
      <h1>🎮 {__kbUi("Bog‘cha o‘yinlari — sinov xonasi")}</h1>
      <p>{__kbUi("Har o‘yinni bola ko‘rgandek o‘ynab ko‘ring va belgilang. Belgilar shu qurilmada saqlanadi; «Hisobotni nusxalash» bilan menga yuboring.")}</p>
      <div className="os-tanlov">
        <label>{__kbUi("Yosh")}: {["2-3", "4-5", "6-7"].map((y) => <button key={y} type="button" className={y === yosh ? "is-on" : ""} onClick={() => setYosh(y)}>{y}</button>)}</label>
        <label>{__kbUi("Izoh tili")}: {["uz", "ru", "en", "de", "es"].map((t) => <button key={t} type="button" className={t === izoh ? "is-on" : ""} onClick={() => setIzoh(t)}>{t}</button>)}</label>
        <label>{__kbUi("So‘zlar")}: {Object.entries(TOPLAMLAR).map(([k, v]) => <button key={k} type="button" className={k === toplam ? "is-on" : ""} onClick={() => setToplam(k)}>{__kbUi(v.nom)}</button>)}</label>
        <label><input type="checkbox" checked={tilDarsi} onChange={(e) => setTilDarsi(e.target.checked)} /> {__kbUi("Tillar darsi (so‘zlar inglizcha aytiladi)")}</label>
      </div>
      <div className="os-hisob">✅ {soni.ok} · 🛠 {soni.tuzat} · {__kbUi("jami")} {ruyxat.length}
        <button type="button" onClick={() => { const t = hisobot(); try { navigator.clipboard.writeText(t); } catch { /* */ } alert(t || __kbUi("Hali belgi yo‘q")); }}>📋 {__kbUi("Hisobotni nusxalash")}</button></div>
    </header>
    <ul className="os-ruyxat">{ruyxat.map((o) => { const b = belgilar[o.id] || {};
      return <li key={o.id} className={`os-karta is-${b.holat || "yangi"}`}>
        <button type="button" className="os-och" onClick={() => { setUrug((u) => u + 1); setGap(""); setOchiq(o.id); }}>
          <span className="os-belgi" aria-hidden="true">{o.belgi}</span><b>{o.nom}</b><small>№{o.id} · {o.yosh.join(", ")}</small></button>
        <div className="os-baho">
          <button type="button" className={b.holat === "ok" ? "is-on" : ""} onClick={() => belgila(o.id, { holat: "ok" })}>✅</button>
          <button type="button" className={b.holat === "tuzat" ? "is-on" : ""} onClick={() => belgila(o.id, { holat: "tuzat" })}>🛠</button>
          <input type="text" placeholder={__kbUi("Izoh…")} defaultValue={b.izoh || ""} onBlur={(e) => belgila(o.id, { izoh: e.target.value })} />
        </div>
      </li>; })}</ul>
    {ochiq && <div className="os-oyna" role="dialog" aria-modal="true" onClick={() => setOchiq(null)}>
      <div className="os-sahna" onClick={(e) => e.stopPropagation()}>
        <div className="os-sahna-bosh"><b>{OYINLAR.find((o) => o.id === ochiq)?.nom}</b> · {yosh} · {izoh}
          <button type="button" onClick={() => { setUrug((u) => u + 1); setGap(""); }}>🔄 {__kbUi("Qaytadan")}</button>
          <button type="button" onClick={() => setOchiq(null)}>✕</button></div>
        <div className="os-oyin">
          <Oyin key={`${ochiq}-${urug}-${yosh}-${izoh}-${toplam}-${tilDarsi}`} id={ochiq} elementlar={elementlar} yosh={yosh} til={tilDarsi ? "en" : "uz"} izoh={izoh}
            fasl={["qish", "qish", "bahor", "bahor", "bahor", "yoz", "yoz", "yoz", "kuz", "kuz", "kuz", "qish"][new Date().getMonth()]}
            mavzu={TOPLAMLAR[toplam].nom.replace(/^\S+\s/, "")} rasm={rasm} urug={urug} onSay={(t, tugadi) => ayt(t, tugadi)} onNatija={() => {}} />
        </div>
        <p className="os-gap" aria-live="polite">🗣️ {gap || "…"}</p>
      </div>
    </div>}
  </section>;
}
