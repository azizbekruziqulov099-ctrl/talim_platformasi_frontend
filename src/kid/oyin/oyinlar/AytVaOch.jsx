// REV324: 117 «Ayt va och» — eshikda rasm; bola uning nomini aytadi (mikrofon) — eshik ochiladi. Mikrofon bo'lmasa yoki
// ruxsat berilmasa — bola aytilgan so'zning eshigini bosib ochadi.
import React, { useEffect, useRef, useState } from "react";
import { tingla as brauzerTingla } from "../../../lesson/sozAytish.js";
import { JR } from "../../jonli/jonliRasm.js";
import { belgiSrc } from "../../Belgi.jsx";
import { mikYoqDeb } from "../mik.js";
import { Rasm, Soz, Tugma, Variantlar, gapVaqti, tugmaHolati, useTaymer } from "./umumiy.jsx";

/** Eshik: qanotida rasm, ochilganda ichidan yulduz chiqadi. */
function Eshik({ el, rasm, ochiq }) {
  return (
    <span className="oy-eshik-ichi">
      <span className="oy-eshik-qanot" aria-hidden="true"><Rasm el={el} rasm={rasm} /></span>
      <img src={JR.yulduz} alt="" draggable="false" style={{ opacity: ochiq ? 1 : 0 }} />
    </span>
  );
}

export default function AytVaOch(p) {
  const { holat, raund, raundIdx, joriy, javob, ishora, qulf, rasm, katta, kadr, say, matn, nom, onTingla, setKabu, raundMatni, fb } = p;
  const mik = holat.mik;
  const [tinglayapti, setTinglayapti] = useState(false);
  const taymer = useTaymer();
  const joriyMik = useRef(null);
  const tirik = useRef(true);
  useEffect(() => () => { tirik.current = false; joriyMik.current?.stop?.(); }, []);

  const tingla = () => {
    if (!tirik.current || joriyMik.current) return;
    const fn = typeof onTingla === "function" ? onTingla : brauzerTingla;
    let m;
    try { m = fn(holat.til, { kutish: 6500 }); } catch { m = null; }
    const promise = m?.promise || (m && typeof m.then === "function" ? m : null);
    if (!promise) { mikYoqDeb(); javob({ mikYoq: true }); return; }
    joriyMik.current = m;
    setTinglayapti(true); setKabu?.("tingla");
    promise.then((res = {}) => {
      if (joriyMik.current === m) joriyMik.current = null;
      if (!tirik.current || res.toxtatildi) { if (tirik.current && !joriyMik.current) setTinglayapti(false); return; }
      setTinglayapti(false); setKabu?.(null);
      if (res.xato === "ruxsat" || res.xato === "yoq") { mikYoqDeb(); javob({ mikYoq: true }); return; }
      const n = javob({ alts: res.alts || [], til: holat.til });
      if (n?.voqea?.tur === "yana") taymer(tingla, gapVaqti(matn("yana", { t: nom(raund.savol.el) })) + 300);
    });
  };

  // har raund boshida: ustoz gapirib bo'lgach mikrofon o'zi ochiladi
  useEffect(() => {
    if (!mik || kadr || qulf) return undefined;
    const id = taymer(tingla, gapVaqti(raundMatni) + 250);
    return () => { clearTimeout(id); joriyMik.current?.stop?.(); joriyMik.current = null; setTinglayapti(false); };
  }, [raundIdx, mik]); // eslint-disable-line react-hooks/exhaustive-deps

  const ochiq = kadr && (fb?.togri || !mik);
  if (mik) {
    const mikSrc = belgiSrc("🎤");
    return (
      <div className="oy-sahna">
        <div className={`oy-tugma oy-eshik is-bitta ${ochiq ? "is-ochiq" : ""} ${kadr && fb?.togri === false ? "is-xato" : ""}`} aria-hidden="true">
          <Eshik el={raund.savol.el} rasm={rasm} ochiq={ochiq} />
        </div>
        {katta && kadr ? <Soz el={raund.savol.el} /> : null}
        <button type="button" className={`oy-tugma is-ikon oy-mik ${tinglayapti ? "is-tinglayapti" : ""}`} disabled={qulf || tinglayapti}
          onClick={() => { say(nom(raund.savol.el)); taymer(tingla, gapVaqti(nom(raund.savol.el))); }} aria-label="🎤">
          {mikSrc ? <img src={mikSrc} alt="" draggable="false" /> : <span className="oy-emoji">🎤</span>}
        </button>
      </div>
    );
  }
  return (
    <div className="oy-sahna">
      <Variantlar n={raund.variantlar.length}>
        {raund.variantlar.map((v) => {
          const h = tugmaHolati(p, v.k);
          return (
            <Tugma key={v.k} label={v.el.say || v.el.uz} holat={h} ishora={ishora === v.k} className={`oy-eshik ${h === "togri" ? "is-ochiq" : ""}`}
              olingan={joriy.olingan.includes(v.k)} disabled={qulf} onClick={() => javob(v.k)}>
              <Eshik el={v.el} rasm={rasm} ochiq={h === "togri"} />
            </Tugma>
          );
        })}
      </Variantlar>
      {katta && kadr ? <Soz el={raund.savol.el} /> : null}
    </div>
  );
}
