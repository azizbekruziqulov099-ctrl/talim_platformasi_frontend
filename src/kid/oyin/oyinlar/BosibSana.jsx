// REV324: 31 «Bosib sana» — bola har bir narsani bosadi, ustoz o'rganilayotgan tilda sanaydi (1, 2, 3…); hammasi
// sanalgach «Nechta?» — son tanlanadi (2-3 yoshda son nuqtalar bilan, matnsiz).
import React from "react";
import { Nuqtalar, Rasm, Son, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";

export default function BosibSana(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, yosh, kadr } = p;
  const sanaldi = joriy.sanaldi || kadr;
  const narsalar = raund.savol.narsalar;
  const ust = narsalar.length <= 2 ? narsalar.length : narsalar.length <= 4 ? 2 : 3;
  return (
    <div className="oy-sahna">
      <div className="oy-narsalar" style={{ "--ust": ust }}>
        {narsalar.map((k, i) => {
          const tartib = joriy.sanalgan.indexOf(k);
          const sanalgan = tartib >= 0 || kadr;
          return (
            <Tugma key={k} label={String(i + 1)} className={sanalgan ? "is-sanaldi" : ""} disabled={qulf || sanalgan}
              ishora={Boolean(ishora && ishora.sana === k)} onClick={() => javob({ sana: k })}>
              <Rasm el={raund.savol.el} rasm={rasm} />
              {tartib >= 0 ? <span className="oy-sanoq">{yosh === "2-3" ? <Nuqtalar n={tartib + 1} /> : tartib + 1}</span> : null}
            </Tugma>
          );
        })}
      </div>
      {sanaldi ? (
        <Variantlar n={raund.variantlar.length}>
          {raund.variantlar.map((v) => (
            <Tugma key={v.k} label={String(v.son)} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
              olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}>
              <Son son={v.son} yosh={yosh} />
            </Tugma>
          ))}
        </Variantlar>
      ) : null}
    </div>
  );
}
