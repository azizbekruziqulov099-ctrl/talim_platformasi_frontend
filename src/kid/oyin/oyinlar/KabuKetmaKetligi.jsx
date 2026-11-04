// REV324: 90 «Kabu ketma-ketligi» — Kabu rasmlardan naqsh (AB, AAB, ABC…) tuzdi: keyin qaysi rasm keladi?
import React from "react";
import { kabuRasm } from "../../jonli/jonliRasm.js";
import { Rasm, Soz, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";

export default function KabuKetmaKetligi(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, katta, kadr } = p;
  const javobEl = raund.variantlar.find((v) => v.k === raund.togri)?.el;
  return (
    <div className="oy-sahna">
      <div className="oy-ramka">
        <img className="oy-kabu" src={kabuRasm(kadr ? "hurra" : "korsat")} alt="" draggable="false" />
        <div className="oy-qator">
          {raund.savol.qator.map((el, i) => (
            <span key={i} className="oy-qator-el" style={{ "--i": i }}><Rasm el={el} rasm={rasm} /></span>
          ))}
          {kadr
            ? <span className="oy-qator-el is-toldi" style={{ "--i": raund.savol.qator.length }}><Rasm el={javobEl} rasm={rasm} /></span>
            : <span className="oy-qator-el is-sora" style={{ "--i": raund.savol.qator.length }}>?</span>}
        </div>
      </div>
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
