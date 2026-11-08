// REV437: «🔬 Fan o'yinlari» — darsdagi o'yinlarni alohida o'ynash: fan va mavzu bo'yicha.
import React, { useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import BoardOyin, { FAN_OYINLARI } from "../lesson/BoardOyin.jsx";
import "../lesson/dars-xonasi.css";

export default function FanOyinlari({ onClose }) {
  const [tanlangan, setTanlangan] = useState(null);
  if (tanlangan) return <div className="fo-sahifa">
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}><button type="button" className="fo-karta" style={{ padding: "8px 14px" }} onClick={() => setTanlangan(null)}>← {__kbUi("Fan o‘yinlari")}</button>
      <b style={{ fontSize: 18 }}>{tanlangan[1]} {__kbUi(tanlangan[2])}</b></div>
    <div className="fo-doska"><BoardOyin arg={tanlangan[0]} /></div>
  </div>;
  return <div className="fo-sahifa">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <div><h2 style={{ margin: 0 }}>🔬 {__kbUi("Fan o‘yinlari")}</h2><p style={{ margin: "4px 0 0", color: "#5b6573" }}>{__kbUi("O‘ynab, qoidani o‘z ko‘zingiz bilan ko‘ring: tanga, zar, karta, tarozi, pitsa…")}</p></div>
      {onClose && <button type="button" className="fo-karta" style={{ padding: "8px 14px" }} onClick={onClose}>← {__kbUi("O‘yinlar")}</button>}
    </div>
    {FAN_OYINLARI.map((f) => <div key={f.fan} className="fo-fan"><h3>{__kbUi(f.fan)}</h3>
      <div className="fo-kartalar">{f.oyinlar.map((o) => <button key={o[0]} type="button" className="fo-karta" onClick={() => setTanlangan(o)}>
        <span aria-hidden="true">{o[1]}</span><div><b>{__kbUi(o[2])}</b><small>{__kbUi(o[3])}</small></div></button>)}</div></div>)}
  </div>;
}
