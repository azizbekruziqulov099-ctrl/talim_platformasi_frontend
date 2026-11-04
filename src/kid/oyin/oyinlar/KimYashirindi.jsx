// REV324: 88 «Kim yashirindi» — sahnadagi narsalarni eslab qolish; parda yopilib ochiladi, bittasi yo'q. Kim yashirindi?
import React, { useEffect, useState } from "react";
import { Rasm, Soz, Tugma, Variantlar, harakatKam, tugmaHolati, useTaymer } from "./umumiy.jsx";

export default function KimYashirindi(p) {
  const { raund, raundIdx, joriy, javob, ishora, qulf, rasm, katta, kadr, say, matn, kichik } = p;
  const [faza, setFaza] = useState("kor");       // kor → parda (yopilmoqda) → ochilmoqda (biri yo'q) → savol
  const taymer = useTaymer();
  useEffect(() => {
    setFaza("kor");
    const korish = (kichik ? 4200 : 3400) + (raundIdx === 0 ? 4500 : 0);   // 1-raundda kirish gapi ham aytiladi
    const tez = harakatKam();
    taymer(() => {
      setFaza("parda");
      taymer(() => setFaza("ochilmoqda"), tez ? 150 : 450);
      taymer(() => { setFaza("savol"); say(matn("savol")); }, tez ? 300 : 1000);
    }, korish);
  }, [raundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const yashirildi = (faza === "ochilmoqda" || faza === "savol") && !kadr;
  const savol = faza === "savol" || kadr;
  return (
    <div className="oy-sahna">
      <div className="oy-yashirin-sahna">
        {raund.savol.sahna.map((el, i) => {
          const bumi = el.k === raund.savol.yashirin;
          if (bumi && yashirildi && faza === "savol") return <span key={el.k} className="oy-qator-el is-sora" style={{ "--i": i }}>?</span>;
          return <span key={el.k} className="oy-qator-el" style={{ "--i": i, visibility: bumi && yashirildi ? "hidden" : undefined }}><Rasm el={el} rasm={rasm} /></span>;
        })}
        <span className={`oy-parda ${faza === "parda" || faza === "ochilmoqda" ? "is-yopiq" : ""}`} aria-hidden="true" />
      </div>
      {savol ? (
        <Variantlar n={raund.variantlar.length}>
          {raund.variantlar.map((v) => (
            <Tugma key={v.k} label={v.el.say || v.el.uz} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
              olingan={joriy.olingan.includes(v.k)} disabled={qulf || faza !== "savol"} onClick={() => javob(v.k)}>
              <Rasm el={v.el} rasm={rasm} />
              {katta && kadr && v.k === raund.togri ? <Soz el={v.el} /> : null}
            </Tugma>
          ))}
        </Variantlar>
      ) : null}
    </div>
  );
}
