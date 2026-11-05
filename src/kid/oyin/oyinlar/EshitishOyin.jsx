// REV351: eshitish o'yinlari — 121 hayvon ovozi, 123 transport ovozi, 142 fasl ovozlari, 118 birinchi harf, 120 bo'g'in qarsagi.
// Tepada javob ko'rinmaydi: ovoz/tasvir yoki harf; pastda rasmlar (birinchi harfda nomlarisiz — bola o'zi aytadi).
import React from "react";
import { Rasm, Tugma, Variantlar, tugmaHolati } from "./umumiy.jsx";
export default function EshitishOyin(p) {
  const { raund, joriy, javob, ishora, qulf } = p;
  const s = raund.savol;
  const tepa = s.harf ? <span className="oy-esh-harf">{s.harf}</span>
    : s.el && !s.ovoz ? <><span className="oy-esh-rasm" aria-hidden="true"><Rasm el={s.el} rasm={p.rasm} /></span><b>{s.el.uz}</b><span className="oy-esh-qarsak" aria-hidden="true">👏</span></>
    : <><span className="oy-esh-quloq" aria-hidden="true">👂</span><b className="oy-esh-matn">{s.ovoz || s.tasvir}</b></>;
  return <div className="oy-sahna">
    <div className="oy-namuna oy-esh-tepa">{tepa}</div>
    <Variantlar n={raund.variantlar.length}>{raund.variantlar.map((v) => <Tugma key={v.k} label={v.el ? v.el.uz : String(v.son)} holat={tugmaHolati(p, v.k)} ishora={ishora === v.k}
      olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}>
      {v.el ? <><span className="oy-sar-belgi" aria-hidden="true"><Rasm el={v.el} rasm={p.rasm} /></span>{!v.yashirin && <small className="oy-joy-soz">{v.el.uz}</small>}</>
        : <span className="oy-mat-son">{v.son}</span>}</Tugma>)}</Variantlar>
  </div>;
}
