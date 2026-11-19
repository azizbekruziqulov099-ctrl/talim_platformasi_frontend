// Dastur bo'yicha umumiy 1–100 ball: dars 20 + mashq 30 + test 20 + imtihon 30
import React, { useEffect, useState } from "react";
import { T } from "./xbTil.js";
import { xbFetch } from "./xbOvoz.js";

const NOM = { dars: "Dars", mashq: "Mashq", test: "Test", imtihon: "Imtihon" };

export default function XbBall({ apiBase, token, toplam }) {
  const [d, setD] = useState(null);
  useEffect(() => {
    if (!toplam) return undefined; let t = true;
    xbFetch(apiBase, "/api/xalqaro/umumiy_ball", token, { params: { toplam } }).then((r) => t && setD(r)).catch(() => {});
    return () => { t = false; };
  }, [apiBase, token, toplam]);
  if (!d) return null;
  return <div className="xb-karta xb-ball">
    <small>{T("Umumiy ball")}</small>
    <b className="xb-ball-katta">{d.ball}<span>/100</span></b>
    <span className="xb-progress"><i style={{ width: `${d.ball}%` }} /></span>
    <div className="xb-ball-qism">{Object.entries(d.qismlar).map(([k, v]) => <div key={k}><small>{T(NOM[k])}</small><b>{v.ball}/{v.maks}</b></div>)}</div>
  </div>;
}
