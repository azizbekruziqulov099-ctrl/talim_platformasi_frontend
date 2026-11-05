// REV359: 119 «Sirli quti» — qutidan narsaning faqat bir qismi chiqib turadi (ataylab juda bilinmaydi), ovozi eshitiladi;
// bola 2–4 rasmdan topadi; topgach quti ochilib, narsa butun ko'rinadi.
import React from "react";
import OYIN_RASM from "../rasm/index.js";
import { Rasm, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";
export default function SirliQutiOch(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, kadr, fb } = p;
  const el = raund.savol.el;
  const ochiq = Boolean(kadr && fb?.togri);
  return <div className="oy-sahna">
    <div className={`oy-sq ${ochiq ? "is-ochiq" : ""}`} aria-hidden="true">
      <span className="oy-sq-narsa"><Rasm el={el} rasm={rasm} /></span>
      <img className="oy-sq-quti" src={OYIN_RASM.quti_sehrli} alt="" draggable="false" />
      {raund.savol.ovoz && !ochiq && <span className="oy-sq-ovoz">🔊</span>}
    </div>
    <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v) => <Tugma key={v.k} label={v.el.say || v.el.uz} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
      olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}><Rasm el={v.el} rasm={rasm} /></Tugma>)}</Variantlar>
  </div>;
}
