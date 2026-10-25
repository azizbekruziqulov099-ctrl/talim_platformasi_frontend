import React, { useCallback, useEffect, useState } from "react";
import FanBelgi from "./FanBelgi.jsx";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import { kidSubjectEmoji } from "../curriculum/kidTopics.js";
import { KUN_QISQA, KUNLAR, KURS } from "../parent/bogchaReja.js";
import { DARAJA_ZINA, haftaHisobi, kuchlarRoyxati, kunKataklari, qisqaSana, yulduzSatr } from "./kundalikRules.js";
import BolalarKundaligi, { KundalikSkelet } from "./BolalarKundaligi.jsx";
import "./kidKundalik.css";

// REV166: «Mening kundaligim» — bola (o'qiy olmasa ham) belgilardan tushunadi: umumiy yulduzlar va daraja, ketma-ket kunlar,
// haftalik kundalik (har kun — fanlar, olgan yulduzlari va bahosi), kuchlari va guruhdagi o'rni. Ota-ona ham xuddi shuni ko'radi.

const fanEmoji = (k, nom, nomlar) => kidSubjectEmoji(nom || nomlar?.[k] || KURS[k]?.nom || "") || KURS[k]?.emoji || "📚";
const fanNomi = (k, nom, nomlar) => nom || nomlar?.[k] || KURS[k]?.nom || "";

const HOLAT_BELGI = { bugun: "⏳", otkazildi: "↪", keladi: "", chala: "⏸" };
const HOLAT_IZOH = {
  tugadi: "O‘tildi", chala: "Boshlangan, tugamagan", bugun: "Bugungi dars — hali o‘tilmagan",
  otkazildi: "O‘tkazib yuborildi — keyingi bo‘sh kunda o‘zi ochiladi", keladi: "Shu kuni bo‘ladi",
};

/** Yuqori qism: daraja belgisi, umumiy yulduz, keyingi darajagacha chiziq, ketma-ket kunlar va o'rin. */
export function YutuqKarta({ data, ism = "", compact = false }) {
  const d = data?.daraja;
  if (!d) return null;
  const zina = Math.min(DARAJA_ZINA.length - 1, Math.max(0, (d.daraja || 1) - 1));
  return <section className={`kk-hero ${compact ? "is-compact" : ""}`} aria-label={T("Yutuqlar")}>
    <div className="kk-hero-main">
      <span className="kk-level-emoji" aria-hidden="true">{d.emoji}</span>
      <div className="kk-hero-text">
        {ism ? <b className="kk-name">{ism}</b> : null}
        <span className="kk-level-name">{T(d.nom)} · {d.daraja}-{T("daraja")}</span>
        <span className="kk-total" aria-label={`${T("Jami yulduz")}: ${data.jami_yulduz}`}>⭐ <b>{data.jami_yulduz}</b></span>
      </div>
    </div>
    <div className="kk-next">
      <span className="kk-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={d.foiz}><i style={{ width: `${Math.max(4, d.foiz)}%` }} /></span>
      <small>{T("Yana")} <b>{d.qoldi}</b> ⭐ → <span aria-hidden="true">{d.keyingi?.emoji}</span> {T(d.keyingi?.nom || "")}</small>
    </div>
    <div className="kk-chips">
      <span className={`kk-chip ${data.ketma_ket ? "is-fire" : ""}`} title={T("Ketma-ket o‘qigan kunlar")}>🔥 {data.ketma_ket || 0} {T("kun ketma-ket")}</span>
      {data.reyting ? <span className="kk-chip is-rank" title={T("Bu hafta yulduzlar bo‘yicha (ismlar ko‘rsatilmaydi)")}>
        🏆 {data.reyting.orin}-{T("o‘rin")} <small>/ {data.reyting.jami}</small></span> : null}
    </div>
    {!compact && <ol className="kk-ladder" aria-label={T("Darajalar")}>
      {DARAJA_ZINA.map((e, i) => <li key={e} className={i < zina ? "is-done" : i === zina ? "is-now" : ""} aria-hidden="true">{e}</li>)}
    </ol>}
  </section>;
}

/** Haftalik kundalik: 7 qator (Du…Ya), har birida fanlar — yulduz va baho bilan. Bola ham, ota-ona ham. */
export function KundalikJadval({ haftalar, nomlar, onDars }) {
  const [tanlov, setTanlov] = useState("shu");
  const h = (haftalar || []).find((x) => x.hafta === tanlov) || haftalar?.[0];
  if (!h) return null;
  const hisob = haftaHisobi(h);
  return <section className="kk-week" aria-label={T("Haftalik kundalik")}>
    <div className="kk-week-head">
      <div className="kk-tabs" role="tablist">
        {(haftalar || []).map((x) => <button key={x.hafta} type="button" role="tab" aria-selected={x.hafta === h.hafta}
          className={x.hafta === h.hafta ? "is-on" : ""} onClick={() => setTanlov(x.hafta)}>{T(x.hafta === "shu" ? "Bu hafta" : "O‘tgan hafta")}</button>)}
      </div>
      <span className="kk-week-sum">⭐ <b>{hisob.yulduz}</b> · 📚 <b>{hisob.tugadi}</b>{hisob.reja ? <>/{hisob.reja}</> : null}</span>
    </div>
    <ol className="kk-days">
      {h.kunlar.map((kun) => {
        const kataklar = kunKataklari(kun);
        return <li key={kun.sana} className={`kk-day is-${kun.holat} ${kun.kun === 6 ? "is-sun" : ""}`}>
          <span className="kk-day-name" title={T(KUNLAR[kun.kun])}><b>{T(KUN_QISQA[kun.kun])}</b><small>{qisqaSana(kun.sana)}</small></span>
          <span className="kk-day-cells">
            {kataklar.map((c, i) => c.holat === "takror" ? <span key="t" className="kk-cell is-review">🔁 <small>{T("Takrorlash")}</small></span>
              : c.holat === "bosh" ? <span key="b" className="kk-cell is-free">🎮 <small>{kun.holat === "keladi" ? "" : T("Dam")}</small></span>
              : <button key={`${c.kalit}-${i}`} type="button" className={`kk-cell is-${c.holat} ${c.qoshimcha ? "is-extra" : ""}`}
                  title={`${T(fanNomi(c.kalit, c.fan, nomlar))}${c.mavzu ? ` — ${c.mavzu}` : ""} · ${T(HOLAT_IZOH[c.holat] || "")}`}
                  onClick={() => onDars?.(c)}>
                <FanBelgi emoji={fanEmoji(c.kalit, c.fan, nomlar)} className="kk-cell-fan" />
                {c.holat === "tugadi" ? <span className="kk-stars" aria-label={`${c.yulduz} ⭐`}>{yulduzSatr(c.yulduz)}</span>
                  : <span className="kk-wait" aria-hidden="true">{HOLAT_BELGI[c.holat]}</span>}
                {c.baho ? <em className={`kk-grade g${c.baho}`} aria-label={`${T("Baho")}: ${c.baho}`}>{c.baho}</em> : null}
              </button>)}
          </span>
          <span className="kk-day-star" aria-label={`${kun.yulduz} ⭐`}>{kun.yulduz ? <>⭐{kun.yulduz}</> : ""}</span>
        </li>;
      })}
    </ol>
    <p className="kk-legend">
      <span>⭐⭐⭐ {T("yulduz")}</span><span><em className="kk-grade g5">5</em> {T("baho")}</span>
      <span>⏳ {T("bugun")}</span><span>↪ {T("keyin ochiladi")}</span><span>🔁 {T("takror")}</span>
    </p>
  </section>;
}

/** «Kuchlarim»: belgi, nom va 5 yulduzcha. */
export function Kuchlar({ kuch }) {
  const list = kuchlarRoyxati(kuch);
  if (!list.length) return null;
  return <section className="kk-power" aria-label={T("Mening kuchim")}>
    <h3>💪 {T("Mening kuchim")}</h3>
    <ul>{list.map((k) => <li key={k.kalit} title={T(k.izoh)}>
      <span className="kk-power-emoji" aria-hidden="true">{k.emoji}</span>
      <b>{T(k.nom)}</b>
      <span className="kk-power-dots" aria-label={`${k.daraja} / 5`}>{"★".repeat(k.daraja)}<i>{"★".repeat(5 - k.daraja)}</i></span>
    </li>)}</ul>
  </section>;
}

export function useKundalik(apiBase, token, enabled = true) {
  const [data, setData] = useState(null);
  const load = useCallback(async () => {
    if (!token || !enabled) return;
    try {
      const res = await fetch(`${String(apiBase || "").replace(/\/+$/, "")}/api/bola/kundalik?${new URLSearchParams({ token })}`,
        { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json().catch(() => null);
      if (res.ok && d) setData(d);
    } catch { /* kundalik ixtiyoriy */ }
  }, [apiBase, token, enabled]);
  useEffect(() => { load(); }, [load]);
  return [data, load];
}

/** Bolaning «Mening kundaligim» ekrani. */
export default function KidKundalik({ data, onClose, say }) {
  useInterface();
  if (!data?.bogcha) return <div className="kk-root"><KundalikSkelet /></div>;   // REV168: tez chiqadigan skelet
  const d = data.daraja;
  const gapir = () => say?.(`${data.bola?.ism ? `${data.bola.ism}! ` : ""}${T("Yulduzlaring")}: ${data.jami_yulduz}. `
    + `${T("Keyingi daraja")} — ${T(d.keyingi?.nom || "")}: ${T("yana")} ${d.qoldi} ${T("ta yulduz kerak")}. `
    + (data.ketma_ket > 1 ? `${T("Ketma-ket")} ${data.ketma_ket} ${T("kun o‘qiding. Barakalla!")}` : T("Har kuni o‘qisang, olovcha kattalashadi!")));
  return <div className="kk-root">
    <header className="kk-top">
      <button type="button" className="kk-back" onClick={onClose} aria-label={T("Orqaga")}>←</button>
      <h2>📒 {T("Mening kundaligim")}</h2>
      {say ? <button type="button" className="kk-say" onClick={gapir} aria-label={T("Ovoz bilan aytib berish")}>🔊</button> : <span />}
    </header>
    <YutuqKarta data={data} ism={data.bola?.ism || ""} compact />
    {/* REV168: «Bolalar kundaligi» — Kunlik (fan ustozi xonachasida), Jadval, Fanlar, Rivojlanish */}
    <BolalarKundaligi haftalar={data.haftalar} nomlar={data.nomlar} rejim="bola" say={say}><Kuchlar kuch={data.kuch} /></BolalarKundaligi>
  </div>;
}
