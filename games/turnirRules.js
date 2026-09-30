// REV90: turnir — sof yordamchilar (brauzersiz sinaladi).
export const TOURNAMENT_STATES = {
  royxat: { emoji: '📝', nomi: 'Ro‘yxatdan o‘tish' },
  davom: { emoji: '⚔️', nomi: 'Davom etmoqda' },
  tugadi: { emoji: '🏁', nomi: 'Tugadi' },
  bekor: { emoji: '⏸', nomi: 'Bekor qilindi' },
};

export function isTournamentCode(code) {
  return /^T[A-Z0-9]{5}$/.test(String(code || ''));
}

/** Boshlanishgacha qolgan vaqt: «2 kun 3 soat», «14:05», «0:42». */
export function countdownText(targetMs, nowMs) {
  const left = Math.max(0, Math.floor((Number(targetMs) - Number(nowMs)) / 1000));
  const d = Math.floor(left / 86400), h = Math.floor((left % 86400) / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
  if (d) return `${d} kun ${h} soat`;
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Jadvaldagi tur natijalari tartib bilan: ["1", "½", "dam", "…", ""]. */
export function roundMarks(results, rounds) {
  const map = results || {};
  return Array.from({ length: Math.max(0, Number(rounds) || 0) }, (_, i) => map[String(i + 1)] ?? map[i + 1] ?? '');
}

export function formatPoints(value) {
  const n = Number(value) || 0;
  const whole = Math.floor(n);
  return n - whole >= 0.5 ? `${whole || ''}½` : String(whole);
}

export const MEDALS = ['🥇', '🥈', '🥉'];
