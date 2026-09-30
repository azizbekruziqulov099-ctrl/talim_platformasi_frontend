import React, { useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import BoardGame from "./BoardGame.jsx";
import ShaxmatMaktab from "./ShaxmatMaktab.jsx";
import { GLYPHS, PIECE_NAMES, capturedPieces, chessCells, chessClick, figurine, parseFen, targetsFrom } from "./chessRules.js";
import { lastMoveAnimation } from "./moveAnim.js";
import "./shaxmat.css";

const RULES = [
  "♟ Piyoda oldinga 1 katak yuradi (birinchi yurishda 2 katak), qiyshiq uradi. Oxirgi qatorga yetsa — farzin yoki boshqa figuraga aylanadi.",
  "♞ Ot «G» harfi shaklida sakraydi — boshqa figuralar ustidan ham o‘ta oladi.",
  "♝ Fil — diagonal bo‘ylab, ♜ ruh — to‘g‘ri chiziq bo‘ylab, ♛ farzin — ikkalasi bo‘ylab istalgan masofaga yuradi.",
  "♚ Shoh har tomonga 1 katak yuradi. Shoh hujum ostida bo‘lsa — SHAX: uni darhol himoya qilish kerak.",
  "Shohni qutqarishning iloji bo‘lmasa — MAT, o‘yin tugaydi. Yurishga joy yo‘q, lekin shax ham yo‘q bo‘lsa — PAT (durang).",
  "Rokirovka: shoh va ruh hali yurmagan bo‘lsa, shoh ruh tomonga 2 katak o‘tadi, ruh uning yoniga keladi.",
  "O‘tib urish: raqib piyodasi 2 katak yurib yoningizga kelsa, uni darhol qiyshiq yurib urishingiz mumkin.",
  "Onlayn o‘yinda soat bor: vaqtingiz tugasa yutqazasiz. Bot bilan mashqda 💡 Maslahat va ↩️ Qaytarish bor.",
];

const squareIndex = (name) => ("abcdefgh".indexOf(name[0])) + (Number(name.slice(1)) - 1) * 8;

function ChessBoard({ state, me, myTurn, busy, onMove, hint }) {
  const [selected, setSelected] = useState(null);
  const [promotion, setPromotion] = useState(null);
  useEffect(() => { setSelected(null); setPromotion(null); }, [state.versiya, state.kod]);
  const moves = myTurn ? state.mumkin || [] : [];
  const movable = new Set(moves.map((m) => m[0]));
  const targets = selected ? targetsFrom(moves, selected) : new Map();
  const last = new Set((state.oxirgi?.p || []).slice(0, 2));
  const lost = capturedPieces(state.pozitsiya);
  const opp = me === "w" ? "b" : "w";
  // REV93: oxirgi yurish — figura eski katakdan sirpanib keladi, urilgan figura «sochilib» yo'qoladi.
  const anim = lastMoveAnimation(state, me === "b");
  const prevRef = useRef({ key: null, fen: null, before: null });
  if (anim && prevRef.current.key !== anim.key) prevRef.current = { key: anim.key, fen: state.pozitsiya, before: prevRef.current.fen };
  else if (!anim) prevRef.current = { key: null, fen: state.pozitsiya, before: null };
  const ghosts = new Map();
  if (anim && prevRef.current.before) {
    const was = parseFen(prevRef.current.before);
    const now = parseFen(state.pozitsiya);
    const mover = now.find((pc, i) => pc && i === squareIndex(anim.to))?.side;
    was.forEach((pc, i) => { if (pc && mover && pc.side !== mover && (!now[i] || now[i].side === mover)) ghosts.set(i, pc); });
  }

  const submit = async (path) => { setSelected(null); setPromotion(null); await onMove(path); };
  const onSquare = (name) => {
    if (busy || !myTurn) return;
    const res = chessClick(moves, selected, name);
    setSelected(res.selected);
    setPromotion(res.promotion);
    if (res.submit) submit(res.submit);
  };

  // Har bir o'yinchi yonida — u urgan figuralar va material ustunligi (+N).
  const tray = (side) => {
    const won = lost[side === "w" ? "b" : "w"];
    const adv = side === "w" ? state.ustunlik || 0 : -(state.ustunlik || 0);
    return <div className="cx-tray" aria-label={__kbUi("Urilgan figuralar")}>
      {won.map((t, i) => <span key={i} className={`cx-mini is-${side === "w" ? "b" : "w"}`}>{GLYPHS[t]}</span>)}
      {adv > 0 && <b>+{adv}</b>}
    </div>;
  };

  return <div className="cx-wrap">
    {tray(opp)}
    <div className="sh-board-wrap cx-frame">
      <div className={`cx-board ${myTurn ? "is-myturn" : ""}`} role="grid" aria-label={__kbUi("Shaxmat taxtasi")}>
        {chessCells(state.pozitsiya, me).map((cell) => {
          const isTarget = targets.has(cell.name);
          const cls = ["cx-cell", cell.dark ? "is-dark" : "is-light",
            last.has(cell.name) ? "is-last" : "",
            selected === cell.name ? "is-selected" : "",
            isTarget ? (cell.piece ? "is-capture" : "is-target") : "",
            !selected && movable.has(cell.name) ? "is-movable" : "",
            state.shax && state.shax_katak === cell.name ? "is-check" : "",
            hint?.slice(0, 2).includes(cell.name) ? "is-hint" : ""].filter(Boolean).join(" ");
          const label = cell.piece ? `${cell.name} ${cell.piece.side === "w" ? "oq" : "qora"} ${PIECE_NAMES[cell.piece.type]}` : cell.name;
          return <button key={cell.index} type="button" className={cls} aria-label={label} onClick={() => onSquare(cell.name)}>
            {cell.rankLabel && <em className="cx-rank">{cell.rankLabel}</em>}
            {cell.fileLabel && <em className="cx-file">{cell.fileLabel}</em>}
            {ghosts.has(cell.index) && <span key={`g-${anim.key}`} className={`cx-piece cx-ghost is-${ghosts.get(cell.index).side}`} aria-hidden="true">{GLYPHS[ghosts.get(cell.index).type]}</span>}
            {cell.piece && <span key={anim && anim.to === cell.name ? `m-${anim.key}` : "p"} className={`cx-piece is-${cell.piece.side} ${anim && anim.to === cell.name ? "is-arriving" : ""}`}
              style={anim && anim.to === cell.name ? { "--dx": anim.dx, "--dy": anim.dy } : undefined}>{GLYPHS[cell.piece.type]}</span>}
          </button>;
        })}
      </div>
      {promotion && <div className="cx-promo" role="dialog" aria-label={__kbUi("Piyoda qaysi figuraga aylansin?")}>
        <p>{__kbUi("Piyoda qaysi figuraga aylansin?")}</p>
        <div>{["q", "r", "b", "n"].map((t) => <button key={t} type="button" className={`cx-piece is-${me}`} onClick={() => submit([...promotion, t])} aria-label={__kbUi(PIECE_NAMES[t])}>
          {GLYPHS[t]}<small>{__kbUi(PIECE_NAMES[t])}</small></button>)}</div>
        <button type="button" className="sh-secondary" onClick={() => { setPromotion(null); setSelected(null); }}>{__kbUi("Bekor")}</button>
      </div>}
    </div>
    {tray(me)}
  </div>;
}

export default function Shaxmat({ startInSchool = false, ...props }) {
  const [school, setSchool] = useState(startInSchool);
  const [nonce, setNonce] = useState(0);
  if (school) return <ShaxmatMaktab apiBase={props.apiBase} token={props.token}
    onBack={() => setSchool(false)} onPlay={() => { setSchool(false); setNonce((n) => n + 1); }} />;
  return <BoardGame key={nonce} {...props} game="shaxmat" title="Shaxmat" heroIcon="♞" pieceLabel="figura"
    subtitle="Aql o‘yini: bot bilan mashq qil, onlayn raqib top yoki do‘stingni chaqir!"
    rules={RULES} formatMove={figurine}
    menuExtra={<button type="button" className="sm-entry" onClick={() => setSchool(true)}>
      <span aria-hidden="true">🎓</span>
      <span><b>{__kbUi("Shaxmat maktabi")}</b><small>{__kbUi("Endi o‘rganayotgan bo‘lsangiz — shu yerdan boshlang: figuralar, shax, mat, taktika")}</small></span>
      <i aria-hidden="true">›</i>
    </button>}
    statusText={(s) => (s.shax ? `⚠️ ${__kbUi("SHAX! Shohingizni himoya qiling.")}` : __kbUi("Sizning navbatingiz — figurani tanlang."))}
    renderBoard={(p) => <ChessBoard {...p} />} />;
}
