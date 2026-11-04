// REV324: 38 «Yo'qolgan son» — poyezd vagonlarida sonlar qatori, bittasi qochib ketgan: qaysi son yo'q?
import React from "react";
import { Rasm, Son, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";

export default function YoqolganSon(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, yosh, kadr } = p;
  const javobSon = raund.variantlar.find((v) => v.k === raund.togri)?.son;
  return (
    <div className="oy-sahna">
      <div className="oy-qator">
        <span className="oy-poyezd" aria-hidden="true">{raund.savol.el ? <Rasm el={raund.savol.el} rasm={rasm} kichik /> : "🚂"}</span>
        {raund.savol.qator.map((x, i) => (x === null
          ? <span key={i} className={`oy-qator-el is-son ${kadr ? "is-toldi" : "is-sora"}`} style={{ "--i": i }}>{kadr ? javobSon : "?"}</span>
          : <span key={i} className="oy-qator-el is-son" style={{ "--i": i }}>{x}</span>))}
      </div>
      <Variantlar n={raund.variantlar.length}>
        {raund.variantlar.map((v) => (
          <Tugma key={v.k} label={String(v.son)} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
            olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}>
            <Son son={v.son} yosh={yosh} />
          </Tugma>
        ))}
      </Variantlar>
    </div>
  );
}
