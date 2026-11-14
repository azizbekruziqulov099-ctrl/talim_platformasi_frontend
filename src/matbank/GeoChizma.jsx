// REV566: aniq geometrik chizma (masshtabda; koordinatalar serverda hisoblangan). Faqat berilgan sonlar yoziladi.
import React, { useMemo } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { belgilar, moslash } from "./geoRules.js";

export default function GeoChizma({ shakl }) {
  const M = useMemo(() => moslash(shakl), [shakl]); const B = useMemo(() => belgilar(shakl, M), [shakl, M]);
  return <figure className="gc-root"><svg viewBox={`0 0 ${M.W} ${M.H.toFixed(1)}`} className="gc-svg" role="img" aria-label={__kbUi("Geometrik chizma")}>
    {(shakl.dumaloqlar || []).map((d, i) => { const c = M.nuqta(d.c); return <circle key={i} cx={c[0]} cy={c[1]} r={d.r * M.s} className="gc-aylana" />; })}
    {shakl.kesmalar.map((k, i) => <line key={i} x1={B.P[k.a][0]} y1={B.P[k.a][1]} x2={B.P[k.b][0]} y2={B.P[k.b][1]} className={k.uzuq ? "gc-uzuq" : "gc-chiziq"} />)}
    {B.burchaklar.map((b, i) => <g key={i}><path d={b.yol} className={b.tur === "togri" ? "gc-togri" : "gc-yoy"} />{b.matn && <text x={b.y[0]} y={b.y[1]} className="gc-burchak" textAnchor="middle">{b.matn}</text>}</g>)}
    {B.uchlar.map((u) => <g key={u.ism}><circle cx={u.p[0]} cy={u.p[1]} r="2.6" className="gc-nuqta" /><text x={u.y[0]} y={u.y[1]} className="gc-ism" textAnchor="middle">{u.ism}</text></g>)}
    {B.yozuvlar.map((y, i) => <text key={i} x={y.p[0]} y={y.p[1]} className={y.uzuq ? "gc-son gc-son-uzuq" : "gc-son"} textAnchor="middle">{y.matn}</text>)}
  </svg><figcaption>{__kbUi("Chizma masshtabda chizilgan.")}</figcaption></figure>;
}
