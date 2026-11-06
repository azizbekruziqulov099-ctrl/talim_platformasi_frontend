// REV324: 117 «Ayt va och» — eshikda rasm; bola uning nomini aytadi (mikrofon) — eshik ochiladi. Mikrofon bo'lmasa yoki
// ruxsat berilmasa — bola aytilgan so'zning eshigini bosib ochadi.
import React, { useEffect, useRef, useState } from "react";
import { tingla as brauzerTingla } from "../../../lesson/sozAytish.js";
import { JR } from "../../jonli/jonliRasm.js";
import { belgiSrc } from "../../Belgi.jsx";
import { mikYoqDeb } from "../mik.js";
import { Rasm, Soz, Tugma, Variantlar, gapVaqti, tugmaHolati, useTaymer } from "./umumiy.jsx";
import { oyinRasmTop } from "../oyinRasmTop.js";
const ESHIK = () => oyinRasmTop({ rasmId: "d_en56-u5-door" });   // REV370: haqiqiy eshik rasmi (kutubxonadan)

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
  const { holat, raund, raundIdx, joriy, javob, ishora, qulf, rasm, katta, kadr, say, matn, nom, onTingla, setKabu, fb, gapirmoqda } = p;
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
    const tinglashTili = raund.savol.el?.say ? holat.til : (holat.izoh || holat.til);   // REV370
    try { m = fn(tinglashTili, { kutish: 6500 }); } catch { m = null; }
    const promise = m?.promise || (m && typeof m.then === "function" ? m : null);
    if (!promise) { mikYoqDeb(); javob({ mikYoq: true }); return; }
    joriyMik.current = m;
    setTinglayapti(true); setKabu?.("tingla");
    promise.then((res = {}) => {
      if (joriyMik.current === m) joriyMik.current = null;
      if (!tirik.current || res.toxtatildi) { if (tirik.current && !joriyMik.current) setTinglayapti(false); return; }
      setTinglayapti(false); setKabu?.(null);
      if (res.xato === "ruxsat" || res.xato === "yoq") { mikYoqDeb(); javob({ mikYoq: true }); return; }
      const n = javob({ alts: res.alts || [], til: raund.savol.el?.say ? holat.til : (holat.izoh || holat.til) });
      if (n?.voqea?.tur === "yana") setQayta((x) => x + 1);   // REV359: ustoz «yana bir marta» deydi — gap tugagach mikrofon qayta ochiladi
    });
  };
  const [qayta, setQayta] = useState(0);

  // REV359: mikrofon faqat ustoz gapirib BO'LGACH ochiladi (ustoz gapirayotganda yoniq turmaydi)
  useEffect(() => {
    if (!mik || kadr || qulf || gapirmoqda || joriy.bosib) return undefined;
    const id = taymer(tingla, 350);
    return () => { clearTimeout(id); };
  }, [raundIdx, mik, gapirmoqda, qayta, kadr, qulf, joriy.bosib]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { joriyMik.current?.stop?.(); joriyMik.current = null; }, [raundIdx]);

  const ochiq = kadr && (fb?.togri || !mik);
  // REV359: ayta olmagan bola — to'g'ri eshik va yana bittasidan tanlaydi
  const variantlar = joriy.bosib ? [raund.variantlar.find((v) => v.k === raund.togri), raund.variantlar.find((v) => v.k !== raund.togri)].filter(Boolean) : raund.variantlar;
  if (mik && !joriy.bosib) {
    const mikSrc = belgiSrc("🎤");
    const eshikSrc = ESHIK();
    // REV370: eshik ortida narsa yashiringan (eshikka chizilmagan); nomi bilan chaqirilsa — eshik ochilib, u chiqib keladi
    return (
      <div className="oy-sahna">
        <div className={`oy-eshik2 ${ochiq ? "is-ochiq" : ""} ${kadr && fb?.togri === false ? "is-xato" : ""}`} aria-hidden="true">
          <span className="oy-eshik2-ichi"><Rasm el={raund.savol.el} rasm={rasm} /></span>
          {eshikSrc ? <img className="oy-eshik2-qanot" src={eshikSrc} alt="" draggable="false" /> : <span className="oy-eshik2-qanot oy-eshik2-yasama" />}
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
      <Variantlar n={variantlar.length}>
        {variantlar.map((v) => {
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
