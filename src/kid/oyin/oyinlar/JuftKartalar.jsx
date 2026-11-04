// REV324: 89 «Juft kartalar» — kartalar yopiq; bola ikkitasini ochadi, bir xil rasmlarni topadi. Har ochilgan kartaning
// nomi o'rganilayotgan tilda aytiladi. Xato faqat bola sherigini avval ko'rgan bo'lsa hisoblanadi (rules: tekshir).
import React, { useEffect, useState } from "react";
import { belgiSrc } from "../../Belgi.jsx";
import { Rasm, useTaymer } from "./umumiy.jsx";

export default function JuftKartalar(p) {
  const { raund, raundIdx, joriy, javob, ishora, qulf, rasm, kadr, say, nom } = p;
  const [ochiq, setOchiq] = useState([]);       // hozir ochiq turgan (hali juftlanmagan) kartalar
  const [xatoJuft, setXatoJuft] = useState([]);
  const taymer = useTaymer();
  useEffect(() => { setOchiq([]); setXatoJuft([]); }, [raundIdx]);
  const orqa = belgiSrc("🕊️") || belgiSrc("⭐");

  const bos = (c) => {
    if (qulf || kadr || joriy.ochilgan.includes(c.juft) || ochiq.includes(c.k) || ochiq.length >= 2) return;
    say(nom(c.el));
    if (!ochiq.length) { setOchiq([c.k]); return; }
    const juft = [ochiq[0], c.k];
    setOchiq(juft);
    taymer(() => {                                   // ikkala karta ko'rinib tursin, keyin tekshiramiz
      const n = javob(juft);
      if (n?.togri) { setOchiq([]); return; }
      setXatoJuft(juft);
      taymer(() => { setOchiq([]); setXatoJuft([]); }, 900);
    }, 650);
  };

  const soni = raund.variantlar.length;
  const ust = soni <= 4 ? 2 : 3;                     // telefonda 8 karta — 3 ustun; keng ekranda 4 ustun (CSS)
  return (
    <div className="oy-sahna">
      <div className={`oy-variantlar oy-juft-tor is-${soni}`} style={{ "--ust": ust }}>
        {raund.variantlar.map((c) => {
          const topildi = joriy.ochilgan.includes(c.juft) || kadr;
          const ochilgan = topildi || ochiq.includes(c.k);
          const ishorada = Array.isArray(ishora) && ishora.includes(c.k) && !ochilgan;
          return (
            <button key={c.k} type="button" aria-label={ochilgan ? (c.el.say || c.el.uz) : "?"}
              className={`oy-tugma oy-karta ${ochilgan ? "is-ochiq" : ""} ${topildi ? "is-topildi" : ""} ${xatoJuft.includes(c.k) ? "is-xato" : ""} ${ishorada ? "is-ishora" : ""}`}
              style={{ aspectRatio: "1" }} onClick={() => bos(c)} disabled={qulf}>
              <span className="oy-karta-ich">
                <span className="oy-karta-yuz oy-karta-orqa">{orqa ? <img src={orqa} alt="" draggable="false" /> : null}</span>
                <span className="oy-karta-yuz oy-karta-old"><Rasm el={c.el} rasm={rasm} /></span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
