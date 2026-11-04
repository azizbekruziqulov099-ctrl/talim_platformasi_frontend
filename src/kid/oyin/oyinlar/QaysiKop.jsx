// REV324: 35 «Qaysi ko'p» — bir nechta guruh, rasmlari soni har xil: ko'proq guruhni bosish.
import React from "react";
import { Rasm, Son, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";

export default function QaysiKop(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, yosh, kadr } = p;
  return (
    <div className="oy-sahna">
      <Variantlar n={raund.variantlar.length}>
        {raund.variantlar.map((g) => (
          <Tugma key={g.k} label={String(g.son)} holat={tugmaHolati(p, g.k)} ishora={ishora === g.k}
            olingan={joriy.olingan.includes(g.k)} disabled={qulf} onClick={() => javob(g.k)}>
            <span className="oy-guruh">
              {Array.from({ length: g.son }, (_, i) => <Rasm key={i} el={g.el} rasm={rasm} kichik />)}
            </span>
            {kadr && yosh !== "2-3" ? <Son son={g.son} yosh={yosh} kichik /> : null}
          </Tugma>
        ))}
      </Variantlar>
    </div>
  );
}
