// REV336: 106 «Tarozi» — og'ir tomoni pastga tushgan; bola og'irini (yoki yengilini) bosadi.
import React from "react";
import { Rasm, Tugma, tugmaHolati } from "./umumiy.jsx";
export default function Tarozi(p) {
  const { raund, joriy, javob, ishora, qulf, rasm } = p;
  const { chap, ong, ogir } = raund.savol;
  const burchak = ogir === "chap" ? -12 : 12;
  const pal = (el, tomon) => <Tugma key={el.k} label={el.say || el.uz} holat={tugmaHolati(p, el.k)} ishora={ishora === el.k} olingan={joriy.olingan.includes(el.k)}
    disabled={qulf} onClick={() => javob(el.k)} className={`oy-tarozi-pal is-${tomon}`}><Rasm el={el} rasm={rasm} kichik /></Tugma>;
  return <div className="oy-sahna">
    <div className="oy-tarozi" style={{ "--b": `${burchak}deg` }}>
      <div className="oy-tarozi-ustun" aria-hidden="true" />
      <div className="oy-tarozi-shayin">{pal(chap, "chap")}{pal(ong, "ong")}</div>
    </div>
  </div>;
}
