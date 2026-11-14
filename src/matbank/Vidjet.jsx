// REV565: dars matnidagi virtual doska qatori → komponent. Qatorlar: vidjetRules.js. Noto'g'ri qator o'quvchiga texnik xato ko'rsatmaydi.
import React, { useMemo, useState } from "react";
import { lazyQayta } from "../workspace/lazyQayta.js";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import BirlikAylana from "./BirlikAylana.jsx";
import FunksiyaDoska from "./FunksiyaDoska.jsx";
import { vidjetTahlil } from "./vidjetRules.js";
import "./virtual.css";

const ChizmaDaftar = lazyQayta(() => import("../daftar/ChizmaDaftar.jsx"));

/** «✏️ Doska» — erkin chizish (qalam, shakllar, koordinata o'qlari, 3D jismlar). Repetitor ham, o'quvchi ham foydalanadi. */
export function DoskaTugma({ kalit = "dars-doska" }) {
  const [och, setOch] = useState(false);
  return <div className="fd-doska">
    <button type="button" className="mb-btn" onClick={() => setOch((x) => !x)} aria-expanded={och}>✏️ {och ? __kbUi("Doskani yopish") : __kbUi("Doska: chizish")}</button>
    {och && <React.Suspense fallback={<p className="mb-bosh">⏳</p>}><ChizmaDaftar kalit={kalit} balandlik={340} savolQatori={false} onYop={() => setOch(false)} sarlavha={__kbUi("Doska")} /></React.Suspense>}</div>;
}

export default function Vidjet({ tur, arg }) {
  const r = useMemo(() => vidjetTahlil(tur, arg), [tur, arg]);
  if (r.xato) return <p className="fd-xato" role="status">🖼️ {__kbUi("Chizmani ko‘rsatib bo‘lmadi.")}</p>;
  if (r.tur === "BIRLIK_AYLANA") return <BirlikAylana burchak={r.burchak} />;
  if (r.tur === "DOSKA") return <DoskaTugma />;
  return <FunksiyaDoska ifoda={r.ifoda} parametrlar={r.parametrlar} xr={r.xr} yr={r.yr} integral={r.integral} />;
}
