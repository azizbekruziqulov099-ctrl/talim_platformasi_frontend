// REV693: ota-ona uchun «O'sish» — til o'zlashtirish foizi (o'rgangan / mustahkam so'zlar, bosqich) va fanlar natijasi.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

const BASE = (apiBase) => String(apiBase || "").replace(/\/+$/, "");

function Chiziq({ foiz, rang }) {
  return <div className="os-chiziq" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={foiz}><i style={{ width: `${Math.max(3, Math.min(100, foiz))}%`, background: rang }} /></div>;
}

export default function OsishBolim({ apiBase, token, childId }) {
  const [d, setD] = useState(null), [xato, setXato] = useState("");
  useEffect(() => {
    let bekor = false; setD(null); setXato("");
    fetch(`${BASE(apiBase)}/api/ota/bola_til?${new URLSearchParams({ bola_id: childId })}`, { cache: "no-store", headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))).then((x) => { if (!bekor) setD(x); }).catch((e) => { if (!bekor) setXato(String(e.message || e)); });
    return () => { bekor = true; };
  }, [apiBase, token, childId]);
  if (xato) return <div className="bm-card"><p>{__kbUi("Ma’lumot yuklanmadi — internetni tekshiring.")}</p></div>;
  if (!d) return <div className="bm-card os-skelet" />;
  const bosh = !d.tillar.length && !d.fanlar.length;
  return <div className="os-root">
    {bosh && <div className="bm-card"><h4>📈 {__kbUi("O‘sish")}</h4><p>{__kbUi("Hali ma’lumot yo‘q. Farzandingiz birinchi darslarni tugatgach, shu yerda o‘sishi ko‘rinadi.")}</p></div>}
    {d.tillar.length > 0 && <div className="bm-card">
      <div className="bm-card-head"><h4>🗣️ {__kbUi("Tillar")}</h4><small>{__kbUi("oxirgi 6 oy")}</small></div>
      {d.tillar.map((t) => <div key={t.kalit} className="os-qator">
        <div className="os-bosh"><b>{t.emoji} {__kbUi(t.nom)}</b><strong>{t.foiz}%</strong></div>
        <Chiziq foiz={t.foiz} rang="linear-gradient(90deg,#1fbf8f,#12a5d8)" />
        <p>{t.sozlar} {__kbUi("so‘z o‘rgandi")} · {t.mustahkam} {__kbUi("tasi mustahkam")} · {t.aytdi} {__kbUi("tasini ovoz chiqarib aytdi")}</p>
        <div className="os-bosqich">{[1, 2, 3].map((n) => <span key={n} className={n <= t.bosqich ? "is-on" : ""}>{n === 1 ? __kbUi("Tinglab tushunadi") : n === 2 ? __kbUi("So‘zlarni aytadi") : __kbUi("Gap tuzadi")}</span>)}</div>
        <small>{t.darslar} {__kbUi("dars")} · {t.kunlar} {__kbUi("kun shug‘ullandi")}</small>
      </div>)}
      <p className="os-izoh">{__kbUi("«Mustahkam» — so‘z kamida 3 marta, kamida 2 xil kunda uchragan. Foiz — o‘rgangan so‘zlarning qanchasi mustahkamlangani.")}</p>
    </div>}
    {d.fanlar.length > 0 && <div className="bm-card">
      <div className="bm-card-head"><h4>📚 {__kbUi("Fanlar")}</h4><small>{__kbUi("Kabu testlaridagi to‘g‘ri javoblar")}</small></div>
      {d.fanlar.map((f) => <div key={f.kalit} className="os-qator">
        <div className="os-bosh"><b>{f.emoji} {__kbUi(f.nom)}</b><strong>{f.jami ? `${f.foiz}%` : "—"}</strong></div>
        <Chiziq foiz={f.jami ? f.foiz : 0} rang="linear-gradient(90deg,#ffb300,#ff7a3d)" />
        <small>{f.darslar} {__kbUi("dars")} · {f.kunlar} {__kbUi("kun shug‘ullandi")}{f.jami ? ` · ${f.togri}/${f.jami} ${__kbUi("to‘g‘ri javob")}` : ""}</small>
      </div>)}
    </div>}
  </div>;
}
