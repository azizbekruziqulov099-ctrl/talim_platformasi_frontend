// REV370: 106 «Tarozi» — avval tarozi teng turadi; bola «qaysi biri og'ir?» deb o'ylab bosadi, shundan keyin tarozi
// haqiqiy og'ir tomonga og'adi — bola o'z javobining to'g'ri-noto'g'riligini tarozining o'zidan ko'radi.
import React from "react";
import { Rasm, Tugma, tugmaHolati } from "./umumiy.jsx";
export default function Tarozi(p) {
  const { raund, joriy, javob, ishora, qulf, rasm, fb, kadr } = p;
  const { chap, ong, ogir } = raund.savol;
  const javobBerdi = Boolean(kadr || (fb && fb.j !== undefined));
  const burchak = javobBerdi ? (ogir === "chap" ? -14 : 14) : 0;   // javobgacha — teng
  const pal = (el, tomon) => <Tugma key={el.k} label={el.say || el.uz} holat={tugmaHolati(p, el.k)} ishora={ishora === el.k} olingan={joriy.olingan.includes(el.k)}
    disabled={qulf} onClick={() => javob(el.k)} className={`oy-tarozi-pal is-${tomon}`}><Rasm el={el} rasm={rasm} /></Tugma>;
  return <div className="oy-sahna">
    <div className={`oy-tarozi ${javobBerdi ? "is-ogdi" : ""}`} style={{ "--b": `${burchak}deg` }}>
      <div className="oy-tarozi-ustun" aria-hidden="true" />
      <div className="oy-tarozi-shayin">{pal(chap, "chap")}{pal(ong, "ong")}</div>
    </div>
  </div>;
}
