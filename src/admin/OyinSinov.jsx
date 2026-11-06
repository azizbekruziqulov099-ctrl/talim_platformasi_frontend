// REV358: «Bog'cha o'yinlari — sinov xonasi» (admin). Hamma o'yin yosh bo'yicha ajratilgan; tanlangan til va so'zlar
// to'plami bilan o'ynab ko'riladi; har o'yinga «yoqdi / tuzatish kerak» belgisi va izoh (shu qurilmada saqlanadi, hisobot nusxasi olinadi).
import React, { useEffect, useMemo, useState } from "react";
import Oyin, { OYINLAR } from "../kid/oyin/index.js";
import { RASM_HAMMA } from "../kid/darsRasm.js";
import { emojiRasm, matnId, sozId } from "../kid/rasmHarakat.js";
import { HARAKAT_OYINLARI } from "../lesson/HarakatQadam.jsx";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { kabuAyt, kabuJimm } from "../kid/kabuOvoz.js";
import { oyinSozlamaYukla, oyinSozlamaYoz } from "../kid/oyin/oyinSozlama.js";   // REV364: belgilar serverda — hamma qurilmada, «⛔» o'yin bolalarga chiqmaydi   // REV362: darsdagi Kabu ovozi (server), brauzer ovozi emas
import { oyinRasmTop } from "../kid/oyin/oyinRasmTop.js";
import "./oyinSinov.css";
const KabuImtihoni = React.lazy(() => import("../kid/imtihon/KabuImtihoni.jsx"));   // REV361

// Sinov uchun so'zlar to'plamlari (darsdagidek: rasm + nom; tillar darsida — o'rganiladigan so'z ham)
export const TOPLAMLAR = {
  hayvonlar: { nom: "🐾 Hayvonlar", el: [["🐈", "mushuk", "cat"], ["🐕", "it", "dog"], ["🐄", "sigir", "cow"], ["🐑", "qo‘y", "sheep"], ["🐔", "tovuq", "hen"], ["🐴", "ot", "horse"]] },
  mevalar: { nom: "🍎 Mevalar", el: [["🍎", "olma", "apple"], ["🍌", "banan", "banana"], ["🍐", "nok", "pear"], ["🍇", "uzum", "grapes"], ["🍉", "tarvuz", "watermelon"], ["🍒", "gilos", "cherry"]] },
  uy: { nom: "🏠 Uy buyumlari", el: [["🪑", "stul", "chair"], ["🛏️", "karavot", "bed"], ["🚪", "eshik", "door"], ["🪟", "deraza", "window"], ["🥄", "qoshiq", "spoon"], ["🍵", "piyola", "cup"]] },
};
const BELGI_KALIT = "kabutar:oyin-sinov";
const ol = () => { try { return JSON.parse(localStorage.getItem(BELGI_KALIT) || "{}"); } catch { return {}; } };
const yoz = (d) => { try { localStorage.setItem(BELGI_KALIT, JSON.stringify(d)); } catch { /* joy yo'q */ } };
const rasm = oyinRasmTop;   // REV368

export default function OyinSinov({ apiBase = "", token = "" }) {
  const [yosh, setYosh] = useState("4-5");
  const [izoh, setIzoh] = useState("uz");
  const [toplam, setToplam] = useState("hayvonlar");
  const [tilDarsi, setTilDarsi] = useState(false);   // tillar darsi: so'zlar o'rganiladigan tilda (inglizcha) aytiladi
  const [ochiq, setOchiq] = useState(null);
  const [urug, setUrug] = useState(1);
  const [gap, setGap] = useState("");
  const [belgilar, setBelgilar] = useState(ol);
  const [imtihon, setImtihon] = useState(false);
  // REV361: imtihon namunasi — uch to'plam uch xil «dars» (fanlar aralash) sifatida
  const namunaDarslar = useMemo(() => Object.entries(TOPLAMLAR).map(([k, v], j) => ({ kod: k, mavzu: v.nom.replace(/^\S+\s/, ""), fan: ["Atrof-muhit", "Mantiq", "Matematika"][j],
    steps: [{ turi: "qoida", doska: v.el.map(([e, uz]) => `${e} ${uz}`).join("\n") }, ...[116, 83, 88, 86, 89, 31].map((id) => ({ turi: "amaliy", oyin: id, doska: v.el.slice(0, 3).map(([e, uz]) => `${e} ${uz}`).join("\n") }))] })), []);
  const ruyxat = useMemo(() => OYINLAR.filter((o) => !HARAKAT_OYINLARI.has(o.id) && o.yosh.includes(yosh)), [yosh]);
  const elementlar = useMemo(() => TOPLAMLAR[toplam].el.map(([e, uz, en], i) => ({ k: `e${i}`, emoji: e, uz, ...(tilDarsi ? { say: en } : {}) })), [toplam, tilDarsi]);
  const [xato, setXato] = useState("");
  useEffect(() => { oyinSozlamaYukla(apiBase).then((srv) => { const d = { ...ol() }; for (const [k, v] of Object.entries(srv || {})) d[k] = { ...(d[k] || {}), ...v }; setBelgilar(d); }); }, [apiBase]);
  const belgila = (id, qiymat) => {
    const d = { ...belgilar, [id]: { ...(belgilar[id] || {}), ...qiymat, vaqt: new Date().toISOString().slice(0, 16) } }; setBelgilar(d); yoz(d);
    if (token) oyinSozlamaYoz(apiBase, token, id, d[id].holat || "ok", d[id].izoh || "").then(() => setXato("")).catch((e) => setXato(e.message));
  };
  const ayt = (t, tugadi) => {
    setGap(String(t || "").replace(/\[\/?\w\w\]/g, ""));
    kabuAyt(apiBase, t, { izoh, til: tilDarsi ? "en" : "", tugadi });
  };
  const hisobot = () => OYINLAR.filter((o) => belgilar[o.id]).map((o) => `${o.id} ${o.nom}: ${belgilar[o.id].holat === "ok" ? "✅ yoqdi" : belgilar[o.id].holat === "tuzat" ? "🛠 tuzatish kerak" : belgilar[o.id].holat === "yopiq" ? "⛔ o‘chirilgan" : "—"}${belgilar[o.id].izoh ? ` — ${belgilar[o.id].izoh}` : ""}`).join("\n");
  const soni = { ok: Object.values(belgilar).filter((b) => b.holat === "ok").length, tuzat: Object.values(belgilar).filter((b) => b.holat === "tuzat").length };

  return <section className="os-root">
    <header className="os-bosh">
      <h1>🎮 {__kbUi("Bog‘cha o‘yinlari — sinov xonasi")}</h1>
      <p>{__kbUi("Har o‘yinni bola ko‘rgandek o‘ynab ko‘ring va belgilang: ✅ yaxshi · 🛠 tuzatish kerak (bolalarga chiqib turadi) · ⛔ o‘chirilgan (bolalarga chiqmaydi). Belgi va izohlar serverda saqlanadi — hamma qurilmada ko‘rinadi.")}</p>
      {xato && <p className="dm-xabar">⚠️ {xato}</p>}
      <div className="os-tanlov">
        <label>{__kbUi("Yosh")}: {["2-3", "4-5", "6-7"].map((y) => <button key={y} type="button" className={y === yosh ? "is-on" : ""} onClick={() => setYosh(y)}>{y}</button>)}</label>
        <label>{__kbUi("Izoh tili")}: {["uz", "ru", "en", "de", "es"].map((t) => <button key={t} type="button" className={t === izoh ? "is-on" : ""} onClick={() => setIzoh(t)}>{t}</button>)}</label>
        <label>{__kbUi("So‘zlar")}: {Object.entries(TOPLAMLAR).map(([k, v]) => <button key={k} type="button" className={k === toplam ? "is-on" : ""} onClick={() => setToplam(k)}>{__kbUi(v.nom)}</button>)}</label>
        <label><input type="checkbox" checked={tilDarsi} onChange={(e) => setTilDarsi(e.target.checked)} /> {__kbUi("Tillar darsi (so‘zlar inglizcha aytiladi)")}</label>
      </div>
      <div className="os-hisob">✅ {soni.ok} · 🛠 {soni.tuzat} · {__kbUi("jami")} {ruyxat.length}
        <button type="button" onClick={() => setImtihon(true)}>🏆 {__kbUi("Kabu imtihoni (namuna)")}</button>
        <button type="button" onClick={() => {   // REV370: hisobotni fayl qilib yuklab olish (Excel ochadi)
          const q = (x) => `"${String(x ?? "").replace(/"/g, '""')}"`;
          const satr = [["№", "O‘yin", "Yosh", "Holat", "Izoh", "Vaqt"].map(q).join(";"), ...OYINLAR.filter((o) => belgilar[o.id]).map((o) => { const b = belgilar[o.id];
            return [o.id, o.nom, o.yosh.join(", "), b.holat === "ok" ? "✅ yaxshi" : b.holat === "tuzat" ? "🛠 tuzatish kerak" : b.holat === "yopiq" ? "⛔ o‘chirilgan" : "", b.izoh || "", b.vaqt || ""].map(q).join(";"); })];
          const blob = new Blob(["\ufeff" + satr.join("\r\n")], { type: "text/csv;charset=utf-8" });
          const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `oyinlar_hisobot_${new Date().toISOString().slice(0, 10)}.csv`;
          document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
        }}>📥 {__kbUi("Hisobotni yuklab olish")}</button>
        <button type="button" onClick={() => { const t = hisobot(); try { navigator.clipboard.writeText(t); } catch { /* */ } alert(t || __kbUi("Hali belgi yo‘q")); }}>📋 {__kbUi("Hisobotni nusxalash")}</button></div>
    </header>
    <ul className="os-ruyxat">{ruyxat.map((o) => { const b = belgilar[o.id] || {};
      return <li key={o.id} className={`os-karta is-${b.holat || "yangi"}`}>
        <button type="button" className="os-och" onClick={() => { setUrug((u) => u + 1); setGap(""); setOchiq(o.id); }}>
          <span className="os-belgi" aria-hidden="true">{o.belgi}</span><b>{o.nom}</b><small>№{o.id} · {o.yosh.join(", ")}</small></button>
        <div className="os-baho">
          <button type="button" className={b.holat === "ok" ? "is-on" : ""} onClick={() => belgila(o.id, { holat: "ok" })}>✅</button>
          <button type="button" className={b.holat === "tuzat" ? "is-on" : ""} onClick={() => belgila(o.id, { holat: "tuzat" })}>🛠</button>
          <button type="button" className={b.holat === "yopiq" ? "is-on is-yopiq" : ""} title={__kbUi("O‘chirish — bolalarga chiqmaydi")} onClick={() => belgila(o.id, { holat: "yopiq" })}>⛔</button>
          <input type="text" placeholder={__kbUi("Izoh…")} defaultValue={b.izoh || ""} onBlur={(e) => belgila(o.id, { izoh: e.target.value })} />
        </div>
      </li>; })}</ul>
    {imtihon && <div className="os-oyna" role="dialog" aria-modal="true" onClick={() => setImtihon(false)}>
      <div className="os-sahna" onClick={(e) => e.stopPropagation()}>
        <div className="os-sahna-bosh"><b>🏆 {__kbUi("Kabu imtihoni (namuna)")}</b> · {yosh} · {izoh}<button type="button" onClick={() => setImtihon(false)}>✕</button></div>
        <React.Suspense fallback={<p role="status">…</p>}>
          <KabuImtihoni sinov darslar={namunaDarslar} yosh={yosh} izoh={izoh} onSay={(t, d) => ayt(t, d)} onClose={() => setImtihon(false)} />
        </React.Suspense>
        <p className="os-gap" aria-live="polite">🗣️ {gap || "…"}</p>
      </div>
    </div>}
    {ochiq && <div className="os-oyna" role="dialog" aria-modal="true" onClick={() => { kabuJimm(); setOchiq(null); }}>
      <div className="os-sahna" onClick={(e) => e.stopPropagation()}>
        <div className="os-sahna-bosh"><b>{OYINLAR.find((o) => o.id === ochiq)?.nom}</b> · {yosh} · {izoh}
          <button type="button" onClick={() => { setUrug((u) => u + 1); setGap(""); }}>🔄 {__kbUi("Qaytadan")}</button>
          <button type="button" onClick={() => { kabuJimm(); setOchiq(null); }}>✕</button></div>
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
