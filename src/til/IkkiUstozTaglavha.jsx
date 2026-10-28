// REV184: ikki ustoz darsining jonli yozuvi (karaoke): har ustozning gapi o'z rangida, aytilayotgan so'z yonadi.
// Pauza bosilsa (yoki so'z bosilsa) — ovoz to'xtaydi, bola tushunmagan so'zini bosadi, izoh ustozi tushuntiradi,
// «Davom etish» — dars aynan to'xtagan joyidan davom etadi.
import React from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { bosiladigan, TURKUM, TURKUM_QISQA } from "./lugatMiya.js";
import "./ikkiUstoz.css";

const tegsiz = (t) => String(t || "").replace(/\[\/?[a-z]{2}\]/g, "").replace(/⏸/g, " ").replace(/\s+/g, " ").trim();

export function IkkiUstozTaglavha({ qismlar = [], faol = -1, soz = -1, til = "", ismlar = {}, bayroqlar = null, pauza = false, onPauza, onSoz, kid = false }) {
  if (!qismlar.length) return null;
  // faqat hozirgi va oldingi bitta bo'lak — ekran to'lib ketmasin
  const bosh = Math.max(0, (faol < 0 ? qismlar.length - 1 : faol) - 1);
  const korinadi = qismlar.slice(bosh, Math.max(bosh + 2, faol + 1)).map((q, j) => ({ ...q, k: bosh + j }));
  return <div className={`iu-taglavha ${pauza ? "is-pauza" : ""} ${kid ? "is-kid" : ""}`} role="group" aria-label={__kbUi("Ustozlar gapi")}>
    {korinadi.map((q) => {
      const tilQismi = q.kim === "til";
      const sozlar = bosiladigan(tegsiz(q.matn), tilQismi ? til : "");
      return <p key={q.k} className={`iu-qator is-${q.kim} ${q.k === faol ? "is-faol" : q.k < faol ? "is-otdi" : "is-kelyapti"}`}>
        <span className="iu-kim">{bayroqlar?.[q.kim] && <img src={bayroqlar[q.kim]} alt="" aria-hidden="true" />}<b>{ismlar[q.kim] || ""}</b></span>
        <span className="iu-matn" lang={tilQismi ? til : undefined}>
          {sozlar.map((s, i) => {
            const holat = q.k < faol || (q.k === faol && i < soz) ? "is-aytildi" : q.k === faol && i === soz ? "is-hozir" : "";
            return tilQismi && s.bosilsin
              ? <button key={i} type="button" className={`iu-soz ${holat}`} onClick={() => onSoz?.(s.soz, q)} title={__kbUi("Tushunmadim — bosing")}>{s.w}</button>
              : <span key={i} className={`iu-soz ${holat}`}>{s.w}</span>;
          }).reduce((a, x, i) => (i ? [...a, " ", x] : [x]), [])}
        </span>
      </p>;
    })}
    <div className="iu-boshqaruv">
      <button type="button" className={`iu-pauza ${pauza ? "is-on" : ""}`} onClick={onPauza}>{pauza ? __kbUi("▶ Davom etish") : __kbUi("⏸ Pauza")}</button>
      <small>{pauza ? __kbUi("Tushunmagan so‘zingizni bosing") : __kbUi("Tushunmagan so‘zni bosing — ustoz tushuntiradi")}</small>
    </div>
  </div>;
}

export function SozIzohi({ e, yuklanmoqda = false, iz = "uz", til = "", ism = "", gapiryapti = false, onQayta, onDavom }) {
  const tur = e?.turkum ? (TURKUM_QISQA[iz] || TURKUM_QISQA.uz)[e.turkum] : "";
  const turT = e?.turkum ? (TURKUM[iz] || TURKUM.uz)[e.turkum] : "";
  return <div className="iu-izoh" role="dialog" aria-modal="true" aria-label={__kbUi("So‘z izohi")}>
    <div className="iu-izoh-karta">
      <div className="iu-izoh-bosh">
        {e?.emoji && <span className="iu-izoh-emoji" aria-hidden="true">{e.emoji}</span>}
        <div>
          <h3 lang={til}>{e?.soz || "…"}</h3>
          {tur && <span className="iu-turkum" title={turT}>{tur}</span>}
        </div>
        {ism && <span className={`iu-izoh-ustoz ${gapiryapti ? "is-gapir" : ""}`}>🗣 {ism}</span>}
      </div>
      {yuklanmoqda ? <p className="iu-izoh-tarjima">⏳</p>
        : e?.topildi ? <>
          {e.tarjima && <p className="iu-izoh-tarjima">= {e.tarjima}</p>}
          {turT && <p className="iu-izoh-tur">{turT}</p>}
          {e.misollar?.length > 0 && <ol className="iu-misollar">
            {e.misollar.map((m, i) => <li key={i}><span lang={til}>{m.gap}</span>{m.tarjima && <small>{m.tarjima}</small>}</li>)}
          </ol>}
        </>
        : <p className="iu-izoh-tarjima">{__kbUi("Bu so‘z lug‘atda hali yo‘q. Ustozdan «Tushunmadim» orqali so‘rang.")}</p>}
      <div className="iu-izoh-tugma">
        <button type="button" className="dx-btn" onClick={onQayta} disabled={yuklanmoqda || !e?.topildi}>🔁 {__kbUi("Yana tushuntir")}</button>
        <button type="button" className="dx-btn dx-primary" onClick={onDavom}>▶ {__kbUi("Davom etish")}</button>
      </div>
    </div>
  </div>;
}
