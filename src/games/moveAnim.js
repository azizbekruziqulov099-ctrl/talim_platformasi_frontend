// REV93: yurish animatsiyasi — figura/dona eski katakdan yangisiga sirpanib boradi (ikkala o'yinchida ham).
const FILES = 'abcdefgh';

/** Katak nomi → ekrandagi (ustun, qator); pastda — o'yinchining o'z tomoni. */
export function viewPos(name, flip) {
  const file = FILES.indexOf(String(name || '')[0]);
  const rank = Number(String(name || '').slice(1)) - 1;
  if (file < 0 || !(rank >= 0 && rank < 8)) return null;
  return flip ? { col: 7 - file, row: rank } : { col: file, row: 7 - rank };
}

/** Yangi katakdagi figuraning boshlang'ich siljishi (kataklarda): eski joydan yangi joyga keladi. */
export function slideFrom(from, to, flip) {
  const a = viewPos(from, flip);
  const b = viewPos(to, flip);
  if (!a || !b) return null;
  return { dx: a.col - b.col, dy: a.row - b.row };
}

/** Oxirgi yurish uchun animatsiya kaliti va yo'nalishi. path — [from, ..., to]. */
export function lastMoveAnimation(state, flip) {
  const p = state?.oxirgi?.p || [];
  if (p.length < 2) return null;
  const to = p[p.length - 1];
  const v = slideFrom(p[0], to, flip);
  if (!v) return null;
  return { key: `${state.kod}:${state.yurishlar_soni}`, to, ...v };
}
