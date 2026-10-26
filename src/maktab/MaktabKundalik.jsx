import React, { useEffect, useMemo, useState } from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { kundalikOlServer } from "./maktabServer.js";
import { kundalikOl, birlashtir, baho, jamla, kunlarBoyicha } from "./kundalikRules.js";
import "./kundalik.css";

const TUR = {
  dars: ["📘", "Dars"], takror: ["🌀", "Darsdan oldin takror"], repetitor: ["🤖", "Repetitor"], imtihon: ["📝", "Imtihon"],
  topshiriq: ["📬", "Ota-ona topshirig‘i"], til: ["🏋️", "Mashq"],
};
const turNomi = (x) => (x.turi === "til" && /:mashq$/.test(x.kod) ? ["🏋️", "Dars mashqlari"] : TUR[x.turi] || ["📘", x.turi]);

/** REV180: fan ichida — kundalik: har kuni nima qilingan (dars, test, takror, mashq, repetitor), bahosi, yozgani, vaqti; mavzu bo'yicha qidirish. */
export default function MaktabKundalik({ apiBase = "", token = "", fan = "" }) {
  const [server, setServer] = useState([]);
  const [qidir, setQidir] = useState("");
  const [hammasi, setHammasi] = useState(false);
  useEffect(() => {
    let tirik = true;
    kundalikOlServer(apiBase, token, fan).then((r) => { if (tirik) setServer(r); });
    return () => { tirik = false; };
  }, [apiBase, token, fan]);
  const royxat = useMemo(() => birlashtir(server, kundalikOl(), fan), [server, fan]);
  const q = qidir.trim().toLowerCase();
  const korin = q ? royxat.filter((x) => `${x.mavzu} ${x.kod}`.toLowerCase().includes(q)) : royxat;
  const j = jamla(korin);
  const kunlar = kunlarBoyicha(korin);
  if (!royxat.length) return <section className="kd-root is-bosh" aria-label={T("Kundalik")}>
    <b>📒 {T("Kundalik")}</b><small>{T("Bu fandan hali ish qilinmagan. Dars o‘tganingizdan keyin bahosi va natijalari shu yerda chiqadi.")}</small>
  </section>;
  return <section className="kd-root" aria-label={T("Kundalik")}>
    <div className="kd-bosh">
      <b>📒 {T("Kundalik")}</b>
      <div className="kd-chips">
        {j.orta !== null && <span className={`kd-baho b${Math.round(j.orta)}`}>{T("O‘rtacha baho")}: <b>{j.orta}</b></span>}
        <span>📘 {j.darslar} {T("ta dars")}</span>
        {j.yozdi > 0 && <span>✍ {j.yozdi} {T("marta yozdi")}</span>}
        {j.daqiqa > 0 && <span>⏱ {j.daqiqa} {T("daq.")}</span>}
      </div>
    </div>
    <input className="kd-qidir" type="search" value={qidir} onChange={(e) => setQidir(e.target.value)} placeholder={`🔎 ${T("Mavzu bo‘yicha qidirish")}`} />
    {(hammasi ? kunlar : kunlar.slice(0, 5)).map((g) => <div key={g.sana} className="kd-kun">
      <h4>{g.sana.split("-").reverse().join(".")}</h4>
      <ul>{g.ishlar.map((x, k) => { const [e, n] = turNomi(x); const b = baho(x.togri, x.jami);
        return <li key={`${x.turi}-${x.kod}-${k}`}>
          <span className="kd-ic" aria-hidden="true">{e}</span>
          <span className="kd-matn"><b>{x.mavzu || T(n)}</b><small>{T(n)}{x.vaqt ? ` · ${x.vaqt}` : ""}</small></span>
          <span className="kd-natija">
            {x.jami > 0 && <small>{x.togri}/{x.jami}</small>}
            {x.yozdi > 0 && <small>✍ {x.yozdi}</small>}
            {x.soniya >= 60 && <small>⏱ {Math.round(x.soniya / 60)}′</small>}
            {b !== null && <b className={`kd-baho b${b}`} aria-label={`${T("Baho")}: ${b}`}>{b}</b>}
          </span>
        </li>; })}</ul>
    </div>)}
    {!hammasi && kunlar.length > 5 && <button type="button" className="kd-yana" onClick={() => setHammasi(true)}>{T("Hammasini ko‘rsatish")} ({kunlar.length})</button>}
    {q && !korin.length && <small className="kd-yoq">{T("Bu mavzu bo‘yicha natija topilmadi.")}</small>}
  </section>;
}
