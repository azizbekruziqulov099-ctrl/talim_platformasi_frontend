// REV324: 116 «Eshit va bos» — ustoz so'zni aytadi, bola rasmini topib bosadi.
import React from "react";
import { belgiSrc } from "../../Belgi.jsx";
import { Rasm, Soz, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";

export default function EshitVaBos(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, katta, kadr, say, nom } = p;
  const quloq = belgiSrc("👂");
  return (
    <div className="oy-sahna">
      <button type="button" className="oy-tugma is-ikon" onClick={() => say(nom(raund.savol.el))} aria-label="🔊">
        {quloq ? <img src={quloq} alt="" draggable="false" /> : <span className="oy-emoji">👂</span>}
      </button>
      <Variantlar n={raund.variantlar.length}>
        {raund.variantlar.map((v) => (
          <Tugma key={v.k} label={v.el.say || v.el.uz} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
            olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}>
            <Rasm el={v.el} rasm={rasm} />
            {katta && kadr && v.k === raund.togri ? <Soz el={v.el} /> : null}
          </Tugma>
        ))}
      </Variantlar>
    </div>
  );
}
