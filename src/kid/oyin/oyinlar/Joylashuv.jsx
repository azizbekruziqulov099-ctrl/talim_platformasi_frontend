// REV370: 76 «Qayerda?» — ustoz «mushuk qutining ustida» deydi; bola 2–4 ta rasmdan (quti va narsa turli joyda) mosini topadi.
// Narsa katta, har variant — kichik sahna (namuna): qutining ustida / ostida / ichida / o'ngida / chapida.
import React from "react";
import { Rasm, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";
import { oyinRasmTop } from "../oyinRasmTop.js";
const QUTI = () => oyinRasmTop({ emoji: "📦", uz: "karton quti" });
export default function Joylashuv(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, matn } = p;
  const { el } = raund.savol;
  const qutiSrc = QUTI();
  return <div className="oy-sahna">
    <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v) => <Tugma key={v.k} label={matn(v.k)} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
      olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)} className="oy-jl-tugma">
      <span className={`oy-jl2 is-${v.k}`} aria-hidden="true">
        {qutiSrc ? <img className="oy-jl2-quti" src={qutiSrc} alt="" draggable="false" /> : <span className="oy-jl2-quti oy-jl2-yasama" />}
        <span className="oy-jl2-narsa"><Rasm el={el} rasm={rasm} /></span>
      </span></Tugma>)}</Variantlar>
  </div>;
}
