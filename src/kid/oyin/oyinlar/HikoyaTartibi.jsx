// REV324: 91 «Hikoya tartibi» — ustoz rasmlarni tartib bilan aytadi, bola ularni raqamli joylarga suradi (yoki bosadi —
// bosilgan rasm navbatdagi bo'sh joyga o'zi boradi). 4-5 yoshda bosqichma-bosqich: har joy uchun alohida aytiladi.
import React from "react";
import { Rasm, Son, Soz, Surilma, javobKaliti } from "./umumiy.jsx";

export default function HikoyaTartibi(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, katta, kadr, fb, yosh } = p;
  const joylar = kadr ? raund.togri : joriy.joylar;
  const faolJoy = joylar.indexOf(null);
  const qoydi = new Set(joylar.filter(Boolean));
  const el = (k) => raund.variantlar.find((v) => v.k === k)?.el;
  const qoy = (k, joy) => { if (!qulf && joy >= 0) javob({ joy, k }); };
  const xatoK = fb && fb.togri === false ? javobKaliti(fb.j) : null;

  return (
    <div className="oy-sahna">
      <div className="oy-joylar">
        {joylar.map((k, i) => (
          <div key={i} className={`oy-joy ${k ? "is-toldi" : ""} ${!k && i === faolJoy ? "is-faol" : ""}`} data-tushadi={`joy:${i}`}>
            {k ? <span style={{ display: "grid", placeItems: "center" }}><Rasm el={el(k)} rasm={rasm} />{katta && kadr ? <Soz el={el(k)} /> : null}</span>
              : <Son son={i + 1} yosh={yosh} kichik />}
          </div>
        ))}
      </div>
      <div className="oy-tokcha">
        {raund.variantlar.filter((v) => !qoydi.has(v.k)).map((v) => (
          <Surilma key={`${v.k}-${xatoK === v.k ? fb.n : 0}`} data={v.k} label={v.el.say || v.el.uz} disabled={qulf}
            holat={xatoK === v.k ? "xato" : null} ishora={ishora && ishora.k === v.k}
            onBos={(k) => qoy(k, faolJoy)}
            onTashla={(k, joy) => { const m = /^joy:(\d+)$/.exec(joy || ""); if (m) qoy(k, raund.savol.bosqichma ? faolJoy === Number(m[1]) ? faolJoy : -1 : Number(m[1])); }}>
            <Rasm el={v.el} rasm={rasm} />
          </Surilma>
        ))}
      </div>
    </div>
  );
}
