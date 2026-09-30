// REV91: bog'cha — kunlik dars rejasi va ota-onaga hisobot uchun bola faolligi.
// Bitta kuzatuvchi (singleton): boshlangan, lekin tugamagan dars bo'lsa, ilova ochiq turgan har 30 soniyada
// va ilova yashirilganda/qaytganda serverga qisqa signal yuboradi. Tarmoq xatosi darsni hech qachon to'xtatmaydi.

const SIGNAL_MS = 30000;
const IDLE_MS = 60000;   // shuncha vaqt dars ham ketmasa, bola ham hech narsaga tegmasa — «to'xtab turibdi»

const base = (apiBase) => String(apiBase || '').replace(/\/+$/, '');

async function post(apiBase, token, path, body) {
  const res = await fetch(`${base(apiBase)}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ token, ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data?.detail;
    const err = new Error(typeof detail === 'string' ? detail : detail?.xabar || `Server xatosi (${res.status})`);
    err.status = res.status; err.code = detail?.kod || ''; err.data = detail;
    throw err;
  }
  return data;
}

export async function fetchDayPlan(apiBase, token) {
  const res = await fetch(`${base(apiBase)}/api/bola/kun_rejasi?${new URLSearchParams({ token })}`, { cache: 'no-store', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Reja yuklanmadi (${res.status})`);
  return res.json();
}

/** Darsni boshlash. Kunlik reja tugagan bo'lsa — {limit: true, xabar}; tarmoq xatosida dars baribir ochiladi. */
export async function startLesson(apiBase, token, { darsKod, fan, mavzu, jamiQadam }) {
  try {
    const d = await post(apiBase, token, '/api/bola/dars/boshla', { dars_kod: darsKod, fan: fan || '', mavzu: String(mavzu || '').slice(0, 200), jami_qadam: jamiQadam || 0 });
    return { ok: true, tracked: !d.kuzatilmaydi, reja: d.reja || null };
  } catch (e) {
    if (e.status === 409 && e.code === 'limit') return { ok: false, limit: true, xabar: e.message, reja: null };
    return { ok: true, tracked: false, offline: true };
  }
}

export async function finishLesson(apiBase, token, { darsKod, togri = 0, jami = 0 }) {
  try { return await post(apiBase, token, '/api/bola/dars/tugat', { dars_kod: darsKod, togri, jami }); } catch { return null; }
}

/** Kartalar tartibida qaysi darslar ochiq: o'tilgan/bugun ochilgan — ochiq; qolganidan kunlik qoldiq qadar yangi. */
export function unlockLessons(codes, plan, fan) {
  if (!plan || !plan.bogcha) return codes.map(() => ({ open: true, known: false, isNew: false }));
  const lessons = plan.darslar || {};
  let quota = plan.fanlar?.[fan]?.qoldi ?? plan.limit ?? 2;
  return codes.map((code) => {
    if (!code) return { open: false, known: false, isNew: false };
    if (lessons[code]) return { open: true, known: true, isNew: false, ...lessons[code] };
    if (quota > 0) { quota -= 1; return { open: true, known: false, isNew: true }; }
    return { open: false, known: false, isNew: false };
  });
}

/** Bugungi reja: shu fanda nechta yangi dars ochildi/tugadi va jami nechta. */
export function todayProgress(plan, fan) {
  if (!plan || !plan.bogcha) return null;
  const f = plan.fanlar?.[fan] || { ochildi: 0, tugadi: 0 };
  return { limit: plan.limit, ochildi: f.ochildi, tugadi: f.tugadi, qoldi: Math.max(0, plan.limit - f.ochildi), damOlish: plan.dam_olish, kun: plan.kun };
}

// ── Kuzatuvchi ──
const state = { apiBase: '', token: '', code: '', step: 0, lastTouch: 0, isPlaying: () => false, timer: null, installed: false };

function visible() {
  try { return document.visibilityState !== 'hidden'; } catch { return true; }
}

function send(extra = {}) {
  if (!state.code || !state.token) return;
  const body = JSON.stringify({
    token: state.token, dars_kod: state.code, qadam: state.step,
    korinadi: visible(), faol: Boolean(state.isPlaying()) || Date.now() - state.lastTouch < IDLE_MS, ...extra,
  });
  try {
    // text/plain — CORS oldindan so'rovisiz; keepalive — sahifa yopilayotganda ham yetib boradi.
    fetch(`${base(state.apiBase)}/api/bola/dars/signal`, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }).catch(() => {});
  } catch { /* signal ixtiyoriy */ }
}

function install() {
  if (state.installed || typeof document === 'undefined') return;
  state.installed = true;
  const touch = () => { state.lastTouch = Date.now(); };
  document.addEventListener('visibilitychange', () => send(), { passive: true });
  window.addEventListener('pagehide', () => send({ korinadi: false }), { passive: true });
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, touch, { passive: true, capture: true }));
}

export const kidTracker = {
  start({ apiBase, token, darsKod, isPlaying }) {
    install();
    Object.assign(state, { apiBase, token, code: darsKod, step: 0, lastTouch: Date.now(), isPlaying: isPlaying || (() => false) });
    clearInterval(state.timer);
    state.timer = setInterval(() => send(), SIGNAL_MS);
  },
  /** Dars ekrani yopildi, lekin dars tugamadi — kuzatuv davom etadi (bola qaytib kelishi kutiladi). */
  detach() { state.isPlaying = () => false; send(); },
  step(n) { state.step = Math.max(state.step, Number(n) || 0); },
  touch() { state.lastTouch = Date.now(); },
  finish() { send(); clearInterval(state.timer); state.timer = null; state.code = ''; },
  active() { return state.code; },
};
