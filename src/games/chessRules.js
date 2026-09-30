// REV85: shaxmat — FEN'dan taxta chizish va yurish tanlash (qoidalarni server hisoblaydi).
import { gameLink } from './gameRules.js';

export const SHAXMAT_CODE_KEY = 'kabutar:shaxmat-kod';
const FILES = 'abcdefgh';
// Ikkala rang uchun ham to'la (qora) belgilar — rangini CSS beradi, shunda oq figuralar ham aniq ko'rinadi.
export const GLYPHS = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
export const PIECE_NAMES = { k: 'shoh', q: 'farzin', r: 'ruh', b: 'fil', n: 'ot', p: 'piyoda' };
const FIGURINES = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘' };

export function shaxmatLink(origin, code) {
  return gameLink(origin, 'shaxmat', code);
}

export function parseFen(fen) {
  const board = Array(64).fill(null);
  const rows = String(fen || '').split(' ')[0].split('/');
  rows.forEach((row, r) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) f += Number(ch);
      else {
        board[(7 - r) * 8 + f] = { side: ch === ch.toUpperCase() ? 'w' : 'b', type: ch.toLowerCase() };
        f += 1;
      }
    }
  });
  return board;
}

export function squareName(index) {
  return `${FILES[index % 8]}${Math.floor(index / 8) + 1}`;
}

/** Ekrandagi 64 katak: o'yinchining figuralari doim pastda. */
export function chessCells(fen, mySide = 'w') {
  const board = parseFen(fen);
  const flip = mySide === 'b';
  const cells = [];
  for (let vr = 0; vr < 8; vr += 1) {
    for (let vc = 0; vc < 8; vc += 1) {
      const r = flip ? vr : 7 - vr;
      const c = flip ? 7 - vc : vc;
      const index = r * 8 + c;
      cells.push({
        index, name: squareName(index), dark: (r + c) % 2 === 0, piece: board[index],
        fileLabel: vr === 7 ? FILES[c] : '', rankLabel: vc === 0 ? String(r + 1) : '',
      });
    }
  }
  return cells;
}

/** Tanlangan figuradan boradigan kataklar: { to: [promo...] }. */
export function targetsFrom(moves, from) {
  const out = new Map();
  for (const m of moves || []) {
    if (m[0] !== from) continue;
    if (!out.has(m[1])) out.set(m[1], []);
    if (m[2]) out.get(m[1]).push(m[2]);
  }
  return out;
}

/**
 * Katak bosilganda: { selected, submit, promotion }.
 * promotion — piyoda oxirgi qatorga yetganda figura tanlash oynasi uchun [from, to].
 */
export function chessClick(moves, selected, square) {
  const movable = new Set((moves || []).map((m) => m[0]));
  if (selected) {
    const targets = targetsFrom(moves, selected);
    if (targets.has(square)) {
      const promos = targets.get(square);
      if (promos.length) return { selected, submit: null, promotion: [selected, square] };
      return { selected: null, submit: [selected, square], promotion: null };
    }
  }
  if (movable.has(square) && square !== selected) return { selected: square, submit: null, promotion: null };
  return { selected: null, submit: null, promotion: null };
}

/** SAN'ni figura belgilari bilan: Nf3 → ♘f3. */
export function figurine(san) {
  return String(san || '').replace(/[KQRBN]/g, (ch, i, s) => (s[i - 1] === '=' ? FIGURINES[ch] : FIGURINES[ch]));
}

/** Urilgan figuralar (boshlang'ich to'plamdan kamaygani): { w: [...], b: [...] } — kim urgani emas, kim yo'qotgani. */
export function capturedPieces(fen) {
  const start = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const have = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };
  for (const p of parseFen(fen)) if (p && p.type !== 'k') have[p.side][p.type] += 1;
  const lost = { w: [], b: [] };
  for (const side of ['w', 'b']) {
    for (const t of ['q', 'r', 'b', 'n', 'p']) {
      const n = Math.max(0, start[t] - have[side][t]);
      for (let i = 0; i < n; i += 1) lost[side].push(t);
    }
  }
  return lost;
}
