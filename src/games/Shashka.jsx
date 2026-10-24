import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import BoardGame from "./BoardGame.jsx";
import { boardCells, clickSquare, movablePieces, nextSteps } from "./shashkaRules.js";
import { lastMoveAnimation } from "./moveAnim.js";
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
// REV166: damka toji — emoji o'rniga SVG: har qurilmada bir xil, katakdan chiqib ketmaydi
function Toj() {
  return <svg className="sh-crown" viewBox="0 0 24 18" aria-hidden="true" focusable="false">
    <path d="M2 15 L1 4 L7 9 L12 1 L17 9 L23 4 L22 15 Z" fill="#f6c343" stroke="#a8740c" strokeWidth="1.2" strokeLinejoin="round" />
    <rect x="2" y="14.2" width="20" height="3" rx="1" fill="#e0a92a" stroke="#a8740c" strokeWidth="1" />
    <circle cx="12" cy="9.5" r="1.7" fill="#3f7be0" /><circle cx="6.5" cy="11.5" r="1.1" fill="#e2483d" /><circle cx="17.5" cy="11.5" r="1.1" fill="#e2483d" />
  </svg>;
}

export function ShashkaBoard({ state, me, myTurn, busy, onMove, hint }) {
  const [prefix, setPrefix] = useState([]);
  useEffect(() => { setPrefix([]); }, [state.versiya, state.kod]);
  const moves = myTurn ? state.mumkin || [] : [];
  const movable = movablePieces(moves);
  const targets = nextSteps(moves, prefix);
  const last = state.oxirgi;
  const lastSquares = new Set(last?.p || []);
  const lastCaps = new Set(last?.c || []);
  const anim = lastMoveAnimation(state, me === "b");   // REV93: dona sirpanib boradi
  const capturedSide = last?.s === "w" ? "b" : "w";

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
          {lastCaps.has(cell.name) && !cell.piece && <><span key={`g-${anim?.key}`} className={`sh-piece sh-taken is-${capturedSide}`} aria-hidden="true" /><span className="sh-ghost" aria-hidden="true" /></>}
          {cell.piece && <span key={anim && anim.to === cell.name ? `m-${anim.key}` : "p"} className={`sh-piece is-${cell.piece.side} ${cell.piece.king ? "is-king" : ""} ${anim && anim.to === cell.name ? "is-arriving" : ""}`}
            style={anim && anim.to === cell.name ? { "--dx": anim.dx, "--dy": anim.dy } : undefined}>{cell.piece.king ? <Toj /> : null}</span>}
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
