// REV324: 83 «O'xshashini top» — tepadagi namunaning xuddi o'zini bosish (6-7 yoshda: namuna emoji, variantlar — rasm).
import React from "react";
import { Rasm, Soz, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";

export default function OxshashiniTop(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, katta, kadr } = p;
  return (
    <div className="oy-sahna">
      <div className="oy-namuna"><Rasm el={raund.savol.el} rasm={rasm} korinish={raund.savol.korinish} /></div>
      <Variantlar n={raund.variantlar.length}>
        {raund.variantlar.map((v) => (
          <Tugma key={v.k} label={v.el.say || v.el.uz} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
            olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}>
            <Rasm el={v.el} rasm={rasm} korinish={raund.variantKorinish} />
            {katta && kadr && v.k === raund.togri ? <Soz el={v.el} /> : null}
          </Tugma>
        ))}
      </Variantlar>
    </div>
  );
}
