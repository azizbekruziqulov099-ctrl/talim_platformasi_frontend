// REV324: 97 «Ha yoki yo'q» — rasm ko'rsatiladi, ustoz so'z aytadi: to'g'rimi? Yashil (ha) doim chapda, qizil (yo'q) — o'ngda.
import React from "react";
import { belgiSrc } from "../../Belgi.jsx";
import { Rasm, Soz, Tugma, tugmaHolati } from "./umumiy.jsx";

export default function HaYokiYoq(p) {
  const { raund, javob, ishora, qulf, rasm, katta, kadr, say, nom } = p;
  const ha = belgiSrc("✅") || belgiSrc("belgi_togri");
  const yoq = belgiSrc("❌") || belgiSrc("belgi_xato");
  return (
    <div className="oy-sahna">
      <button type="button" className="oy-katta-rasm" style={{ border: 0, cursor: "pointer" }} onClick={() => say(nom(raund.savol.aytilgan))}
        aria-label={raund.savol.aytilgan?.say || raund.savol.aytilgan?.uz}>
        <Rasm el={raund.savol.el} rasm={rasm} />
      </button>
      {katta ? <Soz el={kadr ? raund.savol.el : raund.savol.aytilgan} /> : null}
      <div className="oy-haYoq">
        <Tugma className="is-yashil" label="✓" holat={tugmaHolati(p, "ha")} ishora={ishora === "ha"} disabled={qulf} onClick={() => javob("ha")}>
          {ha ? <img src={ha} alt="" draggable="false" style={{ width: 76 }} /> : <span className="oy-emoji">👍</span>}
        </Tugma>
        <Tugma className="is-qizil" label="✗" holat={tugmaHolati(p, "yoq")} ishora={ishora === "yoq"} disabled={qulf} onClick={() => javob("yoq")}>
          {yoq ? <img src={yoq} alt="" draggable="false" style={{ width: 76 }} /> : <span className="oy-emoji">👎</span>}
        </Tugma>
      </div>
    </div>
  );
}
