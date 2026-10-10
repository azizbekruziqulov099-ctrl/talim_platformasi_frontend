// REV86: Shaxmat maktabi — yulduz hisoblash (serverdagi stars_for bilan bir xil mantiq).
export function exerciseStars(ex, mistakes = 0, moves = 0) {
  if (ex?.tur === 'yulduz' && ex.par) {
    const extra = Math.max(0, moves - ex.par);
    if (extra === 0 && !mistakes) return 3;
    return extra <= 2 && mistakes <= 1 ? 2 : 1;
  }
  if (mistakes === 0) return 3;
  return mistakes <= 2 ? 2 : 1;
}

export function lessonStars(list) {
  if (!list?.length) return 1;
  const avg = list.reduce((a, b) => a + b, 0) / list.length;
  return Math.max(1, Math.min(3, Math.round(avg - 0.01)));
}

export function starText(n) {
  const k = Math.max(0, Math.min(3, Number(n) || 0));
  return '⭐'.repeat(k) + '☆'.repeat(3 - k);
}
