// REV82: onlayn bellashuv — sof yordamchilar (brauzersiz sinaladi).
export const BATTLE_CODE_KEY = 'kabutar:bellashuv-kod';
export const OPTION_STYLES = [
  { color: '#E0413A', shape: '▲' },
  { color: '#1F6FD1', shape: '◆' },
  { color: '#E0A10B', shape: '●' },
  { color: '#2F9E54', shape: '■' },
];

export function normalizeCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export function battleLink(origin, code) {
  return `${String(origin || '').replace(/\/+$/, '')}/#bellashuv=${normalizeCode(code)}`;
}

/** Server va brauzer soati farqi hisobga olingan qolgan soniya. */
export function secondsLeft(state, clientNow, offsetMs) {
  if (!state?.phase_ends_at) return 0;
  return Math.max(0, Math.ceil((state.phase_ends_at - (clientNow + offsetMs)) / 1000));
}

export function timeFraction(state, clientNow, offsetMs) {
  if (!state?.phase_ends_at || state.phase !== 'question') return 0;
  const total = (state.savol_vaqti || 20) * 1000;
  return Math.max(0, Math.min(1, (state.phase_ends_at - (clientNow + offsetMs)) / total));
}

export function medal(place) {
  return { 1: '🥇', 2: '🥈', 3: '🥉' }[place] || `${place}.`;
}

export function myPlaceText(state) {
  const me = state?.men;
  if (!me) return '';
  return `${me.orin}-o‘rin · ${me.ochko} ochko`;
}
