// REV103: bog'cha bolasining kunlik vaqti — butun platformada (dars + erkin o'yin).
// Ilova ko'rinib turgan har 30 soniyada, ekran almashganda va ilova yashirilganda/qaytganda serverga qisqa signal boradi.
// Server oldingi signaldan beri o'tgan vaqtni (ko'pi bilan 45 s) OLDINGI ekran hisobiga yozadi va bugungi holatni qaytaradi.
// Tarmoq xatosi hech narsani to'xtatmaydi: signal yetib bormasa, vaqt shunchaki hisoblanmaydi.

export const SIGNAL_MS = 30000;
export const GRACE_MS = 10 * 60 * 1000;   // dars yoki test o'rtasida vaqt tugasa — tugatib olishi uchun ko'pi bilan 10 daqiqa
export const WARN_LEFT_MINUTES = 5;

// Dars vaqtiga kiradigan bo'limlar; qolgan hamma ekran (o'yinlar, profil, xabarlar…) — erkin vaqt.
const LEARNING_TABS = new Set(["mavzular", "ai_ustoz", "test", "kurslar", "bilim"]);
const TAB_NAMES = {
  mavzular: "Darslar", ai_ustoz: "Dars", test: "O‘yin va testlar", kurslar: "To‘garaklar", bilim: "Bilim markazi",
  oyinlar: "O‘yinlar", shaxmat: "Shaxmat", shashka: "Shashka", bellashuv: "Bellashuv", profil: "Profil",
  home: "Bosh sahifa", xabar: "Xabarlar",
};

/** Ekran qaysi vaqt hisobiga yoziladi: "dars" yoki "oyin" (erkin vaqt). overlay — ustidan ochilgan oyna (masalan Kabutar). */
export function screenCategory(tab, overlay = "") {
  if (overlay) return "oyin";
  return LEARNING_TABS.has(String(tab || "")) ? "dars" : "oyin";
}

/** Ota-onaga ko'rinadigan nom: «Dars: «Ranglar»», «Shaxmat», «Kabutar»… */
export function screenName(tab, overlay = "", detail = "") {
  return String(detail || overlay || TAB_NAMES[tab] || "Platforma").trim().slice(0, 120);
}

export function hoursText(minutes) {
  const total = Math.max(0, Math.floor(Number(minutes) || 0));
  const h = Math.floor(total / 60), m = total % 60;
  if (!h) return `${m} daqiqa`;
  return m ? `${h} soat ${m} daqiqa` : `${h} soat`;
}

/** Qaysi to'siq ko'rsatiladi: "jami" (bugungi hamma vaqt tugadi), "dars" / "oyin" (shu bo'lim vaqti tugadi) yoki null.
 *  Bola dars yoki test o'rtasida bo'lsa (busy) — yarim qoldirmasligi uchun GRACE_MS gacha kutiladi.
 *  graceSince — kutish boshlangan vaqt (keyingi chaqiruvga qaytariladi). */
export function guardView(status, cat, busy, graceSince, now) {
  if (!status || status.kuzatilmaydi || !status.tugadi) return { view: null, graceSince: 0 };
  const done = status.tugadi.jami ? "jami" : status.tugadi[cat] ? cat : null;
  // dars ketayotganda boshqa oynaga (masalan Kabutar) kirib-chiqish kutish vaqtini qaytadan boshlamaydi
  if (!done) return { view: null, graceSince: busy ? graceSince || 0 : 0 };
  if (!busy) return { view: done, graceSince: 0 };
  const since = graceSince || now;
  return { view: now - since >= GRACE_MS ? done : null, graceSince: since };
}

/** Bolaga robot ovozida aytiladigan gap (server matni bilan bir xil). */
export function timeText(view, status) {
  if (view === "jami") {
    return `Bugun vaqting tugadi! Bugun ${hoursText(status?.jami?.limit || 120)} o‘qib-o‘ynading. Ko‘zlaring dam olsin. Ertaga uchrashamiz!`;
  }
  if (view === "dars") return "Bugungi dars vaqti tugadi. Barakalla! Endi biroz o‘ynasang bo‘ladi.";
  if (view === "oyin") return "O‘yin vaqti tugadi. Endi dars qilamiz!";
  return "";
}

/** 5 daqiqa (yoki kamroq) qolganda — bir marta ogohlantirish matni, aks holda null. */
export function warnText(status, cat) {
  if (!status || status.kuzatilmaydi || !status.tugadi || status.tugadi.jami || status.tugadi[cat]) return null;
  const left = Number(status[cat]?.qoldi);
  if (!(left > 0 && left <= WARN_LEFT_MINUTES)) return null;
  return `${cat === "dars" ? "Dars" : "O‘yin"} vaqtidan ${left} daqiqa qoldi.`;
}

/** Bugungi sana (Toshkent vaqti) — ogohlantirish kuniga bir marta aytilishi uchun. */
export function tashkentDay(now = Date.now()) {
  return new Date(now + 5 * 3600 * 1000).toISOString().slice(0, 10);
}

// ── Signal yuboruvchi (bitta, butun ilova uchun) ──
const st = {
  apiBase: "", token: "", on: false, installed: false, timer: 0, pending: 0, gen: 0,
  turi: "oyin", nom: "", detail: "", status: null, subs: new Set(), busy: new Set(), blockSubs: new Set(),
};

const endpoint = (path) => `${String(st.apiBase || "").replace(/\/+$/, "")}${path}`;
const pageVisible = () => { try { return document.visibilityState !== "hidden"; } catch { return true; } };

function emit(status) {
  st.status = status;
  st.subs.forEach((fn) => { try { fn(status); } catch { /* tinglovchi xatosi signalni to'xtatmaydi */ } });
}

function halt() {
  clearInterval(st.timer); clearTimeout(st.pending);
  st.timer = 0; st.pending = 0; st.on = false;
}

async function send(visible = pageVisible(), keepalive = false) {
  if (!st.on || !st.token) return;
  const gen = st.gen;   // javob kelguncha boshqa bola kirgan bo'lsa — eski javob tashlab yuboriladi
  const body = JSON.stringify({ token: st.token, turi: st.turi, nom: screenName("", "", st.detail || st.nom), korinadi: visible });
  try {
    // text/plain — CORS oldindan so'rovisiz; keepalive — sahifa yopilayotganda ham yetib boradi.
    const res = await fetch(endpoint("/api/bola/vaqt/signal"), { method: "POST", body, keepalive, headers: { "Content-Type": "text/plain;charset=UTF-8" } });
    if (keepalive || !res.ok) return;
    const data = await res.json().catch(() => null);
    if (!data || gen !== st.gen) return;
    if (data.kuzatilmaydi) { halt(); emit(data); return; }   // bog'cha bolasi emas — vaqt hisoblanmaydi
    emit(data);
  } catch { /* internet yo'q — keyingi signalda */ }
}

function schedule() {
  clearTimeout(st.pending);
  st.pending = setTimeout(() => { st.pending = 0; if (pageVisible()) send(true); }, 800);
}

function install() {
  if (st.installed || typeof document === "undefined") return;
  st.installed = true;
  document.addEventListener("visibilitychange", () => {
    if (!st.on) return;
    if (pageVisible()) send(true); else send(false, true);
  }, { passive: true });
  window.addEventListener("pagehide", () => { if (st.on) send(false, true); }, { passive: true });
}

export const screenTime = {
  start({ apiBase, token }) {
    install();
    halt();
    st.gen += 1;
    Object.assign(st, { apiBase, token, on: true });
    st.timer = setInterval(() => { if (pageVisible()) send(true); }, SIGNAL_MS);
    this.refresh();
    send(pageVisible());
  },
  stop() {
    if (st.on) send(false, true);
    halt();
    st.gen += 1;
    st.status = null; st.detail = "";   // boshqa bola kirsa — oldingisining holati ko'rinmasin
  },
  /** Bugungi holatni so'raydi (signal yubormasdan). */
  async refresh() {
    if (!st.token) return null;
    const gen = st.gen;
    try {
      const res = await fetch(`${endpoint("/api/bola/vaqt")}?${new URLSearchParams({ token: st.token })}`,
        { cache: "no-store", headers: { Authorization: `Bearer ${st.token}` } });
      if (!res.ok) return null;
      const data = await res.json();
      if (gen !== st.gen) return null;
      if (data?.kuzatilmaydi) halt();
      emit(data);
      return data;
    } catch { return null; }
  },
  /** Bola qaysi ekranda: ekran almashsa, o'tgan vaqt eski ekran hisobiga yozilishi uchun darhol signal. */
  where(turi, nom) {
    const t = turi === "dars" ? "dars" : "oyin";
    if (t === st.turi && nom === st.nom) return;
    st.turi = t; st.nom = String(nom || "");
    if (st.on) schedule();
  },
  /** Aniqroq nom (dars mavzusi, test mavzusi, o'yin) — ota-ona «nima qildi» ro'yxatida ko'radi. */
  setDetail(text) {
    const value = String(text || "").slice(0, 120);
    if (value === st.detail) return;
    st.detail = value;
    if (st.on) schedule();
  },
  /** Dars yoki test ketyapti — vaqt tugasa ham uni tugatib olishiga imkon beriladi. */
  setBusy(key, on) {
    const had = st.busy.has(key);
    if (on) st.busy.add(key); else st.busy.delete(key);
    if (had !== Boolean(on) && st.status) emit({ ...st.status });
  },
  isBusy() { return st.busy.size > 0; },
  subscribe(fn) {
    st.subs.add(fn);
    if (st.status) fn(st.status);
    return () => st.subs.delete(fn);
  },
  /** Vaqt tugadi — ovoz chiqarayotgan ekranlar (dars, test) jim bo'lishi uchun. */
  block(view) { st.blockSubs.forEach((fn) => { try { fn(view); } catch { /* e'tiborsiz */ } }); },
  onBlock(fn) { st.blockSubs.add(fn); return () => st.blockSubs.delete(fn); },
  current() { return st.status; },
};
