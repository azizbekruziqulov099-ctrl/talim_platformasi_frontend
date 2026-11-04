// REV324: 33 «Sehrli quti» — narsalar qutiga tushadi (va 6-7 yoshda ba'zilari sakrab chiqadi): qutida nechta?
// 2-3 yosh: tushganlar ko'rinib turadi (sanaydi); 4-5: qo'shish; 6-7: qo'shish va ayirish. «Harakatni kamaytirish»
// yoqilgan bo'lsa — animatsiya o'rniga guruhlar yonma-yon (+ / −) ko'rsatiladi.
import React, { useEffect, useState } from "react";
import { JR } from "../../jonli/jonliRasm.js";
import { Rasm, Son, Tugma, Variantlar, harakatKam, tugmaHolati, useTaymer } from "./umumiy.jsx";

const QADAM = 520;   // har bir narsa orasidagi vaqt (ms)

export default function SehrliQuti(p) {
  const { raund, raundIdx, joriy, javob, ishora, qulf, rasm, yosh, qayta } = p;
  const { el, rejim, a, b } = raund.savol;
  const [savol, setSavol] = useState(false);
  const [aylanish, setAylanish] = useState(0);
  const taymer = useTaymer();
  const kam = harakatKam();
  const jami = rejim === "tushdi" ? a : a + b;
  const davom = kam ? 300 : 700 + jami * QADAM + (rejim === "tushdi" ? 0 : 600) + 500;
  useEffect(() => {
    setSavol(false);
    setAylanish((x) => x + 1);
    taymer(() => setSavol(true), davom);
  }, [raundIdx, qayta]); // eslint-disable-line react-hooks/exhaustive-deps

  const x = (i, n) => (i - (n - 1) / 2) * 26;
  const narsalar = [];
  if (!kam) {
    for (let i = 0; i < a; i += 1) narsalar.push({ k: `a${i}`, kech: 400 + i * QADAM, cls: rejim === "tushdi" ? "is-qoladi" : "", x: x(i, a) });
    if (rejim === "qosh") for (let i = 0; i < b; i += 1) narsalar.push({ k: `b${i}`, kech: 400 + a * QADAM + 600 + i * QADAM, cls: "", x: x(i, b) });
    if (rejim === "ayir") for (let i = 0; i < b; i += 1) narsalar.push({ k: `c${i}`, kech: 400 + a * QADAM + 600 + i * QADAM, cls: "is-chiqadi", x: (i % 2 ? 1 : -1) * (30 + i * 8) });
  }
  return (
    <div className="oy-sahna">
      {kam ? (
        <div className="oy-statik" aria-hidden="true">
          <span className="oy-guruh">{Array.from({ length: a }, (_, i) => <Rasm key={i} el={el} rasm={rasm} kichik />)}</span>
          {rejim !== "tushdi" ? <span className="oy-belgi-katta">{rejim === "qosh" ? "+" : "−"}</span> : null}
          {rejim !== "tushdi" ? <span className="oy-guruh">{Array.from({ length: b }, (_, i) => <Rasm key={i} el={el} rasm={rasm} kichik />)}</span> : null}
        </div>
      ) : null}
      <div key={aylanish} className={`oy-quti-sahna ${rejim === "tushdi" ? "is-ochiq" : ""}`} aria-hidden="true">
        {narsalar.map((n) => (
          <span key={n.k} className={`oy-tushuvchi ${n.cls}`} style={{ "--kech": `${n.kech}ms`, "--x": `${n.x}px` }}>
            <Rasm el={el} rasm={rasm} kichik />
          </span>
        ))}
        <img className="oy-quti" src={JR.quti} alt="" draggable="false" />
      </div>
      {savol ? (
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
