// REV385 → REV400: «Qoralama daftar» — darsda misol yechish uchun: tepada savol doim ko'rinadi,
// pastda to'liq «Chizma daftari» (qalam, marker, o'chirg'ich, uzuq chiziq, 2D va 3D shakllar, yozuv, surish, bekor qilish).
import React from "react";
import { createPortal } from "react-dom";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import ChizmaDaftar from "../daftar/ChizmaDaftar.jsx";

export default function QoralamaDaftar({ savol = null, chizma = null, onJavob, onYop, kalit = "dars" }) {
  const joy = typeof document !== "undefined" ? (document.querySelector(".dx-root") || document.body) : null;
  const oyna = <div className="qd-root" role="dialog" aria-modal="true" aria-label={__kbUi("Qoralama daftar")}>
    <div className="qd-savol">
      <div className="qd-savol-matn">{savol}</div>
      {chizma}
      <button type="button" className="qd-yop" onClick={onYop} aria-label={__kbUi("Yopish")}>✕</button>
    </div>
    <div className="qd-varaq"><ChizmaDaftar kalit={kalit} balandlik={9999} sarlavha={savol} savolQatori={false} /></div>
    {onJavob && <div className="qd-asboblar"><button type="button" className="qd-javob" onClick={onJavob}>✏️ {__kbUi("Javobni yozish")}</button></div>}
  </div>;
  return joy ? createPortal(oyna, joy) : oyna;
}
