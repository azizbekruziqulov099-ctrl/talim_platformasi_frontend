// REV324: 55 «Kabu xato qildi» — Kabu juftlarni qo'ydi (rasm↔rasm, 6-7 yoshda rasm↔so'z, sonlarda raqam↔nuqtalar),
// bittasi noto'g'ri: bola xato juftni topib bosadi.
import React from "react";
import { kabuRasm } from "../../jonli/jonliRasm.js";
import { Nuqtalar, Rasm, Soz, Tugma, tugmaHolati } from "./umumiy.jsx";

function Tomon({ t, rasm }) {
  if (t.son !== undefined) return t.korinish === "nuqta" ? <Nuqtalar n={t.son} /> : <span className="oy-son"><b>{t.son}</b></span>;
  if (t.korinish === "soz") return <Soz el={t.el} />;
  return <Rasm el={t.el} rasm={rasm} korinish={t.korinish} />;
}

export default function KabuXatoQildi(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, kadr, fb } = p;
  return (
    <div className="oy-sahna">
      <img className="oy-kabu is-katta" src={kabuRasm(kadr ? "hurra" : fb?.togri === false ? "oylaydi" : "korsat")} alt="" draggable="false" />
      <div className={`oy-juftlar ${raund.variantlar.length >= 4 ? "is-ikki" : ""}`}>
        {raund.variantlar.map((v) => (
          <Tugma key={v.k} className="oy-juft" label={`${v.chap.el?.say || v.chap.son || ""} — ${v.ong.el?.say || v.ong.son || ""}`}
            holat={tugmaHolati(p, v.k)} ishora={ishora === v.k} olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}>
            <span className="oy-juft-tomon"><Tomon t={v.chap} rasm={rasm} /></span>
            <span className="oy-juft-zanjir" aria-hidden="true">=</span>
            <span className="oy-juft-tomon"><Tomon t={v.ong} rasm={rasm} /></span>
          </Tugma>
        ))}
      </div>
    </div>
  );
}
