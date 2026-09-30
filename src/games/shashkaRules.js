// REV83: shashka — taxtani chizish va yurish tanlash uchun sof yordamchilar.
// Qoidalarni server hisoblaydi va «mumkin» ro'yxatini yuboradi; mijoz faqat shu ro'yxatdan tanlaydi.
export const SHASHKA_CODE_KEY = 'kabutar:shashka-kod';
import { gameLink } from './gameRules.js';

const FILES = 'abcdefgh';

export function sqName(index) {
  return `${FILES[index % 8]}${Math.floor(index / 8) + 1}`;
}

export { normalizeGameCode, resultText, REASONS } from './gameRules.js';

export function shashkaLink(origin, code) {
  return gameLink(origin, 'shashka', code);
}

/** Ekrandagi 64 katak: o'yinchining donalari doim pastda (qora o'ynasa taxta aylantiriladi). */
export function boardCells(taxta, mySide = 'w') {
  const board = String(taxta || '').padEnd(64, '.');
  const flip = mySide === 'b';
  const cells = [];
  for (let vr = 0; vr < 8; vr += 1) {
    for (let vc = 0; vc < 8; vc += 1) {
      const r = flip ? vr : 7 - vr;
      const c = flip ? 7 - vc : vc;
      const index = r * 8 + c;
      const ch = board[index];
      cells.push({
        index, name: sqName(index), dark: (r + c) % 2 === 0,
        piece: ch === '.' ? null : { side: ch.toLowerCase(), king: ch === ch.toUpperCase() },
        fileLabel: vr === 7 ? FILES[c] : '', rankLabel: vc === 0 ? String(r + 1) : '',
      });
    }
  }
  return cells;
}

/** Yurishni boshlash mumkin bo'lgan donalar (majburiy urish bo'lsa — faqat uradiganlar). */
export function movablePieces(moves) {
  return new Set((moves || []).map((m) => m[0]));
}

function startsWith(path, prefix) {
  return prefix.every((sq, i) => path[i] === sq);
}

/** Tanlangan yo'ldan keyingi bosiladigan kataklar. */
export function nextSteps(moves, prefix) {
  if (!prefix?.length) return new Set();
  return new Set((moves || []).filter((m) => m.length > prefix.length && startsWith(m, prefix)).map((m) => m[prefix.length]));
}

/** Yo'l to'liq yurishga aylandimi — ha bo'lsa o'sha yurish, aks holda null. */
export function completedMove(moves, prefix) {
  const exact = (moves || []).find((m) => m.length === prefix.length && startsWith(m, prefix));
  return exact || null;
}

/**
 * Katak bosilganda yangi tanlov: { prefix, submit }.
 * Boshqa o'z donasini bossa — tanlov o'sha donaga o'tadi; noto'g'ri katak — tanlov bekor bo'ladi.
 */
export function clickSquare(moves, prefix, square) {
  const current = prefix || [];
  if (current.length && nextSteps(moves, current).has(square)) {
    const next = [...current, square];
    const done = completedMove(moves, next);
    const longer = nextSteps(moves, next).size > 0;
    if (done && !longer) return { prefix: [], submit: done };
    return { prefix: next, submit: null };
  }
  if (movablePieces(moves).has(square)) {
    const only = (moves || []).filter((m) => m[0] === square);
    // Bitta dona bitta yo'l bilangina yura olsa ham, bola qaerga borishini o'zi bossin — faqat tanlaymiz.
    return { prefix: [square], submit: null, options: only.length };
  }
  return { prefix: [], submit: null };
}
