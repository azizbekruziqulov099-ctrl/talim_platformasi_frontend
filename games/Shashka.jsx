import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import BoardGame from "./BoardGame.jsx";
import { boardCells, clickSquare, movablePieces, nextSteps } from "./shashkaRules.js";
import "./shashka.css";

const RULES = [
  "Donalar faqat qora kataklarda, diagonal bo‘ylab bir katak oldinga yuradi.",
  "Raqib donasi yonida, orqasida bo‘sh katak bo‘lsa — sakrab urasiz. Urish majburiy!",
  "Oddiy dona oldinga ham, orqaga ham urishi mumkin; ketma-ket bir nechtasini urish ham mumkin.",
  "Oxirgi qatorga yetgan dona 👑 damka bo‘ladi va diagonal bo‘ylab istalgan masofaga yuradi.",
  "Raqibning donalari tugasa yoki yurishga joyi qolmasa — siz yutasiz.",
  "Onlayn o‘yinda soat bor: vaqtingiz tugasa yutqazasiz. Birinchi yurish 30 soniyada qilinmasa, o‘yin bekor bo‘ladi.",
];

/** Shashka taxtasi: donani tanlash → yashil nuqtalar → ko'p urishda qadam-baqadam. */
function ShashkaBoard({ state, me, myTurn, busy, onMove, hint }) {
  const [prefix, setPrefix] = useState([]);
  useEffect(() => { setPrefix([]); }, [state.versiya, state.kod]);
  const moves = myTurn ? state.mumkin || [] : [];
  const movable = movablePieces(moves);
  const targets = nextSteps(moves, prefix);
  const last = state.oxirgi;
  const lastSquares = new Set(last?.p || []);
  const lastCaps = new Set(last?.c || []);

  const onSquare = async (name) => {
    if (busy || !myTurn) return;
    const res = clickSquare(moves, prefix, name);
    setPrefix(res.prefix);
    if (res.submit && !(await onMove(res.submit))) setPrefix([]);
  };

  return <div className="sh-board-wrap">
    <div className={`sh-board ${myTurn ? "is-myturn" : ""}`} role="grid" aria-label={__kbUi("Shashka taxtasi")}>
      {boardCells(state.pozitsiya, me).map((cell) => {
        const cls = ["sh-cell", cell.dark ? "is-dark" : "is-light",
          movable.has(cell.name) && !prefix.length ? "is-movable" : "",
          prefix[0] === cell.name ? "is-selected" : "",
          prefix.includes(cell.name) && prefix[0] !== cell.name ? "is-path" : "",
          targets.has(cell.name) ? "is-target" : "",
          lastSquares.has(cell.name) ? "is-last" : "",
          hint?.includes(cell.name) ? "is-hint" : ""].filter(Boolean).join(" ");
        return <button key={cell.index} type="button" className={cls} disabled={!cell.dark} aria-label={cell.name} onClick={() => onSquare(cell.name)}>
          {cell.rankLabel && <em className="sh-rank">{cell.rankLabel}</em>}
          {cell.fileLabel && <em className="sh-file">{cell.fileLabel}</em>}
          {lastCaps.has(cell.name) && !cell.piece && <span className="sh-ghost" aria-hidden="true" />}
          {cell.piece && <span className={`sh-piece is-${cell.piece.side} ${cell.piece.king ? "is-king" : ""}`}>{cell.piece.king ? "👑" : ""}</span>}
        </button>;
      })}
    </div>
  </div>;
}

export default function Shashka(props) {
  return <BoardGame {...props} game="shashka" title="Shashka" heroIcon="⛀"
    subtitle="Bot bilan mashq qil, onlayn raqib top yoki do‘stingni chaqir!"
    rules={RULES}
    statusText={(s) => (s.urish_majburiy ? `⚠️ ${__kbUi("Urish majburiy! Uradigan donani tanlang.")}` : __kbUi("Sizning navbatingiz — donani tanlang."))}
    renderBoard={(p) => <ShashkaBoard {...p} />} />;
}
