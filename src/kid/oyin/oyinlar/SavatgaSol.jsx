// REV324: 32 «Savatga sol» — ustoz aytgan narsadan aytilgan sonicha savatga suriladi (yoki bosiladi). 2-3 yoshda soni
// to'lganda o'zi tugaydi; 4-5 va 6-7 da bola o'zi sanab, «tayyor» tugmasini bosadi (ortiqchasini savatdan qaytarib olsa bo'ladi).
import React, { useState } from "react";
import { JR } from "../../jonli/jonliRasm.js";
import { belgiSrc } from "../../Belgi.jsx";
import { Rasm, Son, Surilma, Tugma, javobKaliti } from "./umumiy.jsx";

export default function SavatgaSol(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, fb, yosh, kadr } = p;
  const [ustida, setUstida] = useState(false);
  const ichida = kadr ? raund.variantlar.filter((v) => v.el.k === raund.savol.el.k).slice(0, raund.savol.soni).map((v) => v.k) : joriy.ichida;
  const xatoK = fb && fb.togri === false ? javobKaliti(fb.j) : null;
  const tayyorSrc = belgiSrc("✅");
  const qoy = (k) => { if (!qulf) javob({ qoy: k }); };

  return (
    <div className="oy-sahna">
      <div className="oy-maqsad">
        <Rasm el={raund.savol.el} rasm={rasm} />
        <Son son={raund.savol.soni} yosh={yosh} />
      </div>
      <div className={`oy-savat ${ustida ? "is-ustida" : ""}`} data-tushadi="savat"
        onPointerEnter={() => setUstida(true)} onPointerLeave={() => setUstida(false)}>
        <img src={JR.savat} alt="" draggable="false" />
        <div className="oy-savat-ichi" style={{ "--n": Math.max(1, ichida.length) }}>
          {ichida.map((k) => {
            const v = raund.variantlar.find((x) => x.k === k);
            return raund.savol.avto
              ? <span key={k} className="oy-tugma" aria-hidden="true"><Rasm el={v.el} rasm={rasm} kichik /></span>
              : <Tugma key={k} className="is-katta-tegish" label={v.el.say || v.el.uz} disabled={qulf} onClick={() => javob({ ol: k })}>
                  <Rasm el={v.el} rasm={rasm} kichik />
                </Tugma>;
          })}
        </div>
      </div>
      <div className="oy-savat-past">   {/* REV372: tokcha va ✓ tugmasi bir qatorda — ekranga sig'adi */}
      <div className="oy-tokcha">
        {raund.variantlar.filter((v) => !ichida.includes(v.k)).map((v) => (
          <Surilma key={`${v.k}-${xatoK === v.k ? fb.n : 0}`} data={v.k} label={v.el.say || v.el.uz} disabled={qulf}
            holat={xatoK === v.k ? "xato" : null} ishora={ishora && ishora.qoy === v.k}
            onBos={qoy} onTashla={(k, joy) => { setUstida(false); if (joy === "savat") qoy(k); }}>
            <Rasm el={v.el} rasm={rasm} />
          </Surilma>
        ))}
      </div>
      {raund.savol.avto ? null : (
        <Tugma className={`is-ikon is-yashil ${fb?.j?.tayyor && fb.togri === false ? "is-xato" : ""}`} label="✓" disabled={qulf}
          ishora={Boolean(ishora && ishora.tayyor)} holat={kadr ? "togri" : null} onClick={() => javob({ tayyor: true })}>
          {tayyorSrc ? <img src={tayyorSrc} alt="" draggable="false" /> : <span className="oy-emoji">✅</span>}
        </Tugma>
      )}
      </div>
    </div>
  );
}
