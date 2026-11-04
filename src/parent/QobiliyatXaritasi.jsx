// REV329: bola miyasi xaritasi — o'yin natijalaridan qobiliyatlar foizi (oxirgi 30 kun). Ota-ona paneli uchun.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import "./qobiliyat.css";

// server nomlari va maslahatlar — tarjima ro'yxatiga kirishi uchun shu yerda ham yozilgan
// eslint-disable-next-line no-unused-vars
const _NOMLAR = () => [__kbUi("Xotira"), __kbUi("Diqqat"), __kbUi("Mantiqiy fikrlash"), __kbUi("Fazoviy tasavvur"), __kbUi("Son va sanash"),
  __kbUi("Nutq va til"), __kbUi("Eshitib idrok qilish"), __kbUi("Fikrlash tezligi"),
  __kbUi("Kechqurun bugun nima qilganini 3 ta rasm bilan aytib berishini so'rang."), __kbUi("Ikki rasm orasidagi farqni topish o'yinini birga o'ynang."),
  __kbUi("«Nima uchun?» savolini ko'proq bering — sababini o'zi topsin."), __kbUi("Kubiklardan namunaga qarab minora qurdiring."),
  __kbUi("Ovqat paytida qoshiq, non, olmalarni birga sanang."), __kbUi("Kitob o'qib, rasm haqida 2–3 gap aytishini so'rang."),
  __kbUi("Ko'zini yumib, qaysi ovoz eshitilganini toptiring."), __kbUi("Shoshiltirmang — avval to'g'ri, keyin tez. Oddiy o'yinlarni takrorlang.")];

export const QOB_RANG = { xotira: "#9b7bff", diqqat: "#ff8a3d", mantiq: "#4a8bf5", fazoviy: "#2ec4b6", sanash: "#ffb703", nutq: "#ff7aa2", eshitish: "#22b3a5", tezlik: "#e63946" };

/** Foizga qarab qisqa baho (ota-onaga tushunarli). */
export function qobBaho(foiz) {
  if (foiz === null || foiz === undefined) return "Hali ma’lumot kam";
  return foiz >= 85 ? "Juda yaxshi" : foiz >= 65 ? "Yaxshi" : foiz >= 45 ? "Rivojlanmoqda" : "Ko‘proq mashq kerak";
}

export function QobiliyatKorinish({ data }) {
  if (!data) return null;
  const q = data.qobiliyatlar || {};
  const kalitlar = Object.keys(q);
  if (!data.jami_oyin) return <p className="qx-bosh">{__kbUi("Farzandingiz darslardagi o‘yinlarni o‘ynagach, bu yerda xotira, diqqat, mantiq va boshqa qobiliyatlari ko‘rinadi.")}</p>;
  return <div className="qx">
    <ul className="qx-list">{kalitlar.map((k) => { const v = q[k]; const f = v.foiz;
      return <li key={k} className={f === null ? "is-kam" : ""}>
        <span className="qx-nom"><i aria-hidden="true">{v.belgi}</i>{__kbUi(v.nom)}</span>
        <span className="qx-bar" aria-hidden="true"><b style={{ width: `${f ?? 0}%`, background: QOB_RANG[k] }} /></span>
        <span className="qx-foiz">{f === null ? "—" : `${f}%`}</span>
        <small>{__kbUi(qobBaho(f))} · {v.oyin} {__kbUi("o‘yin")}</small>
      </li>; })}</ul>
    {(data.kuchli || data.zaif) && <div className="qx-xulosa">
      {data.kuchli && <p>💪 {__kbUi("Kuchli tomoni")}: <b>{__kbUi(q[data.kuchli]?.nom || "")}</b></p>}
      {data.zaif && <p>🌱 {__kbUi("Ko‘proq e’tibor bering")}: <b>{__kbUi(q[data.zaif]?.nom || "")}</b></p>}
      {data.maslahat && <p className="qx-maslahat">💡 {__kbUi(data.maslahat)}</p>}
    </div>}
    <p className="qx-izoh">{__kbUi("Har bir o‘yin bir nechta qobiliyatni tekshiradi (masalan, «Juft kartalar» — xotira va diqqat). Foiz — oxirgi 30 kundagi o‘yinlardagi to‘g‘ri javoblar ulushi.")}</p>
  </div>;
}

export function useQobiliyat(apiBase, token, childId) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!token || !childId) return undefined;
    let stop = false;
    fetch(`${String(apiBase || "").replace(/\/+$/, "")}/api/ota/bola_qobiliyat?${new URLSearchParams({ token, bola_id: childId })}`,
      { cache: "no-store", headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null)).then((d) => { if (!stop) setData(d); }).catch(() => { if (!stop) setData(null); });
    return () => { stop = true; };
  }, [apiBase, token, childId]);
  return data;
}
