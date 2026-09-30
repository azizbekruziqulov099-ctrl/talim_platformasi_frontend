import React from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import "./boardGame.css";

const GAMES = [
  { key: "bellashuv", emoji: "⚔️", title: "Bellashuv", text: "Do‘stlar bilan bir vaqtda test — kim birinchi to‘g‘ri topadi?", color: "#6c3ce0" },
  { key: "shashka", emoji: "⛀", title: "Shashka", text: "Bot bilan (4 daraja), onlayn raqib yoki do‘st bilan", color: "#b5541c" },
  { key: "shaxmat", emoji: "♞", title: "Shaxmat", text: "Bot bilan (4 daraja), maslahat, onlayn reyting yoki do‘st bilan", color: "#1d2733" },
  { key: "shaxmat_maktab", emoji: "🎓", title: "Shaxmat maktabi", text: "Noldan o‘rganish: figuralar, shax, mat, taktika — yulduzchalar bilan", color: "#2f7d3b" },
  { key: "mantiq", emoji: "🧩", title: "Rivojlantiruvchi o‘yinlar", text: "Xotira, mantiq, sanash — tez orada", color: "#2f9e54", soon: true },
];

/** REV83: O'yinlar markazi — bellashuv, shashka va keyingi o'yinlar bir joyda. */
export default function OyinlarMarkazi({ onOpen }) {
  useKbInterfaceLocale();
  return <section className="sh-root og-hub">
    <header className="sh-hero"><span className="og-hero-emoji" aria-hidden="true">🎮</span>
      <div><h2>{__kbUi("O‘yinlar")}</h2><p>{__kbUi("O‘ynab o‘rgan: aql, tezlik va mantiq o‘yinlari")}</p></div></header>
    <div className="og-grid">
      {GAMES.map((g) => <button key={g.key} type="button" className={`og-card ${g.soon ? "is-soon" : ""}`} style={{ "--og": g.color }}
        disabled={g.soon} onClick={() => onOpen?.(g.key)}>
        <span className="og-emoji" aria-hidden="true">{g.emoji}</span>
        <b>{__kbUi(g.title)}</b>
        <small>{__kbUi(g.text)}</small>
        {g.soon && <em>{__kbUi("Tez orada")}</em>}
      </button>)}
    </div>
  </section>;
}
