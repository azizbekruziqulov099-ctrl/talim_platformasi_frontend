import React, { useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { BAHO_MATN, KUNLAR, KURS, bahoRangi } from "./bogchaReja.js";
import { haftaHisobi, kunKataklari, qisqaSana } from "../kid/kundalikRules.js";
import { kidSubjectEmoji } from "../curriculum/kidTopics.js";
import FanBelgi from "../kid/FanBelgi.jsx";

// REV167: ota-ona uchun kundalik — bolaning belgili jadvali emas, oddiy so'z bilan: har kun qaysi fan, qaysi mavzu,
// natijasi (yulduz, baho so'z bilan) yoki nega o'tilmagani va qachon ochilishi.

const fanNomi = (c, nomlar) => c.fan || nomlar?.[c.kalit] || KURS[c.kalit]?.nom || "";
const HOLAT = {
  tugadi: ["is-done", "O‘tildi"],
  chala: ["is-half", "Boshlangan, oxirigacha o‘tilmagan"],
  bugun: ["is-today", "Bugun — hali o‘tilmagan"],
  otkazildi: ["is-miss", "O‘tkazib yuborildi — shu haftaning bo‘sh kunida o‘zi ochiladi"],
  keladi: ["is-next", "Rejada"],
};

/** Yutuqlar — ota-onaga oddiy raqamlar bilan. */
export function YutuqQator({ data }) {
  const d = data?.daraja;
  if (!d) return null;
  return <div className="ok-stats" aria-label={__kbUi("Yutuqlar")}>
    <div><span aria-hidden="true">⭐</span><b>{data.jami_yulduz}</b><small>{__kbUi("jami yulduz")}</small></div>
    <div><span aria-hidden="true">{d.emoji}</span><b>{d.daraja}-{__kbUi("daraja")}</b>
      <small>{__kbUi(d.nom)} · {__kbUi("keyingisigacha")} {d.qoldi} ⭐</small></div>
    <div><span aria-hidden="true">🔥</span><b>{data.ketma_ket || 0}</b><small>{__kbUi("kun ketma-ket o‘qidi")}</small></div>
    {data.reyting && <div><span aria-hidden="true">🏆</span><b>{data.reyting.orin}/{data.reyting.jami}</b><small>{__kbUi("guruhda o‘rni (shu hafta)")}</small></div>}
  </div>;
}

export default function OtaKundalik({ haftalar, nomlar }) {
  const [tanlov, setTanlov] = useState("shu");
  const h = (haftalar || []).find((x) => x.hafta === tanlov) || haftalar?.[0];
  if (!h) return null;
  const hisob = haftaHisobi(h);
  const baholar = h.kunlar.flatMap((k) => (k.darslar || []).filter((x) => x.tugadi && x.baho).map((x) => Number(x.baho)));
  const ortacha = baholar.length ? Math.round((baholar.reduce((a, b) => a + b, 0) / baholar.length) * 10) / 10 : null;
  return <div className="ok-root">
    <div className="ok-head">
      <div className="ok-tabs" role="tablist">
        {(haftalar || []).map((x) => <button key={x.hafta} type="button" role="tab" aria-selected={x.hafta === h.hafta}
          className={x.hafta === h.hafta ? "is-on" : ""} onClick={() => setTanlov(x.hafta)}>{__kbUi(x.hafta === "shu" ? "Shu hafta" : "O‘tgan hafta")}</button>)}
      </div>
      <p className="ok-sum">
        <span>📚 {__kbUi("O‘tildi")}: <b>{hisob.tugadi}</b>{hisob.reja ? <> / {hisob.reja} {__kbUi("rejadagi dars")}</> : null}</span>
        <span>⭐ <b>{hisob.yulduz}</b> {__kbUi("yulduz")}</span>
        {ortacha !== null && <span>🤖 {__kbUi("O‘rtacha baho")}: <b>{ortacha}</b></span>}
      </p>
    </div>
    <ol className="ok-days">
      {h.kunlar.map((kun) => {
        const kataklar = kunKataklari(kun);
        return <li key={kun.sana} className={`ok-day is-${kun.holat}`}>
          <p className="ok-day-title"><b>{__kbUi(KUNLAR[kun.kun])}</b> <small>{qisqaSana(kun.sana)}</small>
            {kun.holat === "bugun" && <em>{__kbUi("Bugun")}</em>}
            {kun.yulduz ? <span className="ok-day-star">⭐ {kun.yulduz}</span> : null}</p>
          <ul>
            {kataklar.map((c, i) => {
              if (c.holat === "takror") return <li key="t" className="ok-line is-review">🔁 {__kbUi("Yakshanba — takrorlash kuni, yangi dars yo‘q.")}</li>;
              if (c.holat === "bosh") return <li key="b" className="ok-line is-free">{__kbUi(kun.holat === "keladi" ? "Bu kunga dars rejalashtirilmagan." : "Dars bo‘lmagan.")}</li>;
              const [cls, matn] = HOLAT[c.holat] || HOLAT.keladi;
              const nom = fanNomi(c, nomlar);
              return <li key={`${c.kalit}-${i}`} className={`ok-line ${cls}`}>
                <span className="ok-fan"><FanBelgi emoji={kidSubjectEmoji(nom) || KURS[c.kalit]?.emoji || "📚"} /> <b>{__kbUi(nom)}</b></span>
                {c.mavzu ? <span className="ok-topic">«{c.mavzu}»</span> : null}
                <span className="ok-result">
                  {c.holat === "tugadi" ? <>
                    <span title={`${c.yulduz} / 3`}>{"⭐".repeat(c.yulduz)}{"☆".repeat(Math.max(0, 3 - c.yulduz))}</span>
                    {c.baho ? <i className={`ok-grade ${bahoRangi(c.baho)}`}>{c.baho} — {__kbUi(BAHO_MATN[c.baho])}</i> : null}
                  </> : <small>{__kbUi(matn)}</small>}
                </span>
              </li>;
            })}
          </ul>
        </li>;
      })}
    </ol>
  </div>;
}
