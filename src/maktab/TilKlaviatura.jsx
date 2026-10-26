import React, { useEffect, useMemo, useState } from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";
import "./tilKlaviatura.css";

// REV180: ekrandagi o'z klaviaturamiz — o'rganilayotgan tilning harflari bilan (telefon klaviaturasi chaqirilmaydi:
// u ko'pincha boshqa tilda turadi, ü / ß / ñ / ç yo'q, ekranni yarmini yopadi). Pastda chiqadi, ▾ bilan yopiladi.
// Murakkab yozuvli tillarda (xitoy, yapon, koreys) — so'zning belgilari plitka bo'lib chiqadi: bosib teriladi.
import { QATORLAR, PLITKALI, klaviaturaBor, sensorli, plitkalar } from "./tilKlaviaturaRules.js";
export { QATORLAR, PLITKALI, klaviaturaBor, sensorli, plitkalar };

/**
 * til — o'rganilayotgan til; qiymat / onChange — maydon qiymati; onEnter — tekshirish; javob — plitkali tillarda to'g'ri so'z (belgilari chiqadi);
 * ochiq / onOchiq — ko'rinishi; matnli — ko'p qatorli (yangi qator tugmasi).
 */
export default function TilKlaviatura({ til = "en", qiymat = "", onChange, onEnter, javob = "", boshqa = "", ochiq = true, onOchiq, matnli = false }) {
  const [katta, setKatta] = useState(false);
  const qatorlar = QATORLAR[til];
  const plitka = useMemo(() => (PLITKALI.has(til) && javob ? plitkalar(javob, boshqa) : []), [til, javob, boshqa]);
  const [ishlatilgan, setIshlatilgan] = useState([]);
  // klaviatura ochilganda — yozilayotgan maydon ko'rinib tursin (klaviatura ostida qolmasin)
  useEffect(() => {
    if (!ochiq) return undefined;
    const t = setTimeout(() => { try { document.querySelector(".mm-input:not([disabled]), .rp-input:not([disabled])")?.scrollIntoView({ block: "center", behavior: "smooth" }); } catch { /* */ } }, 60);
    return () => clearTimeout(t);
  }, [ochiq]);
  if (!ochiq) return <button type="button" className="tk-och" onClick={() => onOchiq?.(true)}>⌨️ {T("Klaviatura")}</button>;
  const yoz = (c) => { onChange?.(qiymat + (katta ? c.toLocaleUpperCase(til) : c)); if (katta) setKatta(false); };
  const ochir = () => { const a = [...qiymat]; a.pop(); onChange?.(a.join("")); setIshlatilgan((x) => x.slice(0, -1)); };
  return <div className="tk-root" role="group" aria-label={T("Klaviatura")} onMouseDown={(e) => e.preventDefault()}>
    <div className="tk-bosh"><span className="tk-til">{til.toUpperCase()}</span>
      <button type="button" className="tk-yop" onClick={() => onOchiq?.(false)} aria-label={T("Yopish")}>▾</button></div>
    {plitka.length ? <div className="tk-qator is-plitka">{plitka.map((p) => <button key={p.k} type="button" className="tk-tugma"
      disabled={ishlatilgan.includes(p.k)} onClick={() => { onChange?.(qiymat + p.c); setIshlatilgan((x) => [...x, p.k]); }}>{p.c}</button>)}</div>
      : (qatorlar || []).map((q, i) => <div key={i} className="tk-qator" dir={til === "ar" ? "rtl" : undefined}>
        {(Array.isArray(q) ? q : [...q]).map((c) => <button key={c} type="button" className="tk-tugma" onClick={() => yoz(c)}>{katta ? c.toLocaleUpperCase(til) : c}</button>)}
      </div>)}
    <div className="tk-qator tk-past">
      {!plitka.length && til !== "ar" && <button type="button" className={`tk-tugma is-keng ${katta ? "is-on" : ""}`} onClick={() => setKatta((x) => !x)} aria-label="Shift">⇧</button>}
      {!plitka.length && <button type="button" className="tk-tugma is-bosh" onClick={() => yoz(" ")} aria-label={T("Bo‘sh joy")}>␣</button>}
      {matnli && <button type="button" className="tk-tugma is-keng" onClick={() => onChange?.(`${qiymat}\n`)} aria-label="Enter">↵</button>}
      <button type="button" className="tk-tugma is-keng" onClick={ochir} aria-label={T("O‘chirish")}>⌫</button>
      {onEnter && <button type="button" className="tk-tugma is-ok" onClick={onEnter} disabled={!String(qiymat).trim()}>✔</button>}
    </div>
  </div>;
}
