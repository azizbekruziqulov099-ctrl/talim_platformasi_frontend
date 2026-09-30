// REV84: taxta o'yinlari (shashka, shaxmat...) uchun umumiy sof yordamchilar.
export const TIME_CONTROLS = [
  { kod: '3+2', nomi: '⚡ 3+2', izoh: 'Tezkor' },
  { kod: '5+0', nomi: '⚡ 5 daq', izoh: 'Tezkor' },
  { kod: '10+0', nomi: '⏱ 10 daq', izoh: 'Oddiy' },
  { kod: '15+10', nomi: '🐢 15+10', izoh: 'Sokin' },
];
export const FRIEND_CONTROLS = [{ kod: 'cheksiz', nomi: '♾ Vaqtsiz', izoh: 'Shoshilmasdan' }, ...TIME_CONTROLS];

export function normalizeGameCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export function gameLink(origin, game, code) {
  return `${String(origin || '').replace(/\/+$/, '')}/#${game}=${normalizeGameCode(code)}`;
}

/** Hozirgi soat: server qiymatidan yurish navbatidagi tomonning vaqti oqib turadi. */
export function clockNow(state, clientNow, offsetMs) {
  if (!state?.soat) return null;
  const clock = { ...state.soat };
  if (state.soat_yurmoqda && state.holat === 'davom') {
    const passed = Math.max(0, clientNow + offsetMs - state.server_now);
    clock[state.navbat] = Math.max(0, clock[state.navbat] - passed);
  }
  return clock;
}

export function formatClock(msLeft) {
  if (msLeft === null || msLeft === undefined) return '';
  const total = Math.max(0, msLeft);
  if (total < 10000) return `0:0${Math.floor(total / 1000)}.${Math.floor((total % 1000) / 100)}`;
  const s = Math.ceil(total / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function secondsUntil(targetMs, clientNow, offsetMs) {
  if (!targetMs) return null;
  return Math.max(0, Math.ceil((targetMs - (clientNow + offsetMs)) / 1000));
}

export const REASONS = {
  taslim: 'taslim bo‘ldi',
  vaqt: 'vaqti tugadi',
  yurish_yoq: 'yurishga joy qolmadi',
  donalar_tugadi: 'hamma donalar urildi',
  damkalar_durang: 'faqat damkalar qoldi — durang',
  uzun_oyin: 'o‘yin juda uzoq davom etdi — durang',
  kelishuv: 'kelishuv bo‘yicha durang',
  bekor: 'o‘yin boshlanmadi — bekor qilindi (reytingga ta’sir qilmaydi)',
  kelmadi: 'birinchi yurishni vaqtida qilmadi — texnik mag‘lubiyat (reytingga ta’sir qilmaydi)',
  mat: 'MAT — shoh qochib qutula olmadi',
  pat: 'pat — yurishga joy yo‘q, durang',
  takror: 'bir xil holat 3 marta takrorlandi — durang',
  kuch_yetmaydi: 'mat qilishga kuch yetmaydi — durang',
  ellik_yurish: '50 yurish davomida urish ham, piyoda yurishi ham bo‘lmadi — durang',
};

export function resultText(state) {
  if (!state || state.holat !== 'tugadi') return null;
  const loser = state.golib === 'w' ? 'b' : state.golib === 'b' ? 'w' : null;
  const personal = loser && ['taslim', 'vaqt', 'kelmadi'].includes(state.sabab);
  const who = personal ? (loser === state.men ? 'Siz' : 'Raqib') : '';
  const reason = REASONS[state.sabab] || '';
  const text = who ? `${who}: ${reason}` : reason;
  if (state.sabab === 'bekor') return { emoji: '⏸', title: 'O‘yin bekor qilindi', text };
  if (state.natija === 'galaba') return { emoji: '🏆', title: 'G‘alaba!', text };
  if (state.natija === 'maglubiyat') return { emoji: '😔', title: 'Bu safar yutqazdingiz', text };
  return { emoji: '🤝', title: 'Durang', text };
}

export function ratingDeltaText(delta) {
  if (delta === null || delta === undefined) return '';
  return delta > 0 ? `+${delta}` : String(delta);
}
