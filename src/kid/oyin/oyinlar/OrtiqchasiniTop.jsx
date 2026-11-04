// REV324: 86 «Ortiqchasini top» — bir xil rasmlar orasida bittasi boshqacha (6-7 yoshda rasmlar biroz burilgan/kattaroq).
import React from "react";
import { Rasm, Soz, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";

export default function OrtiqchasiniTop(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, katta, kadr } = p;
  return (
    <div className="oy-sahna">
      <Variantlar n={raund.variantlar.length}>
        {raund.variantlar.map((v) => (
          <Tugma key={v.k} label={v.el.say || v.el.uz} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
            olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}>
            <span className="oy-bezak" style={v.bezak ? { "--ayl": `${v.bezak.aylan}deg`, "--kat": v.bezak.kattalik } : undefined}>
              <Rasm el={v.el} rasm={rasm} />
            </span>
            {katta && kadr && v.k === raund.togri ? <Soz el={v.el} /> : null}
          </Tugma>
        ))}
      </Variantlar>
    </div>
  );
}
