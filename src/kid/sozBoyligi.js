// REV110: bolaning so'z boyligi (shu qurilmada): qaysi tilda qaysi so'zlarni o'rgangan, oxirgi dars nima edi.
// Ustoz dars boshida o'tgan darsdan so'raydi va suhbatda faqat bola bilgan so'zlardan foydalanadi.
const KEY = "kabutar:kid:soz:v1";
const MAX_WORDS = 600;

function store() { try { return globalThis.localStorage; } catch { return null; } }
function read(st) {
  try { return JSON.parse(st?.getItem(KEY) || "{}") || {}; } catch { return {}; }
}
function write(st, data) { try { st?.setItem(KEY, JSON.stringify(data)); } catch { /* joy yo'q */ } }

/** Dars tugaganda: so'zlarni qo'shadi va «oxirgi dars»ni eslab qoladi. sozlar: [{say, emoji, til}] */
export function eslab({ code = "", mavzu = "", sozlar = [] } = {}, st = store(), now = Date.now()) {
  const data = read(st);
  data.sozlar = data.sozlar || {};
  for (const w of sozlar) {
    if (!w?.say || !w?.til) continue;
    const lang = (data.sozlar[w.til] = data.sozlar[w.til] || {});
    const k = w.say.toLowerCase();
    const old = lang[k] || { say: w.say, emoji: w.emoji || "", n: 0 };
    lang[k] = { say: w.say, emoji: w.emoji || old.emoji || "", n: old.n + 1, t: now };
    const keys = Object.keys(lang);
    if (keys.length > MAX_WORDS) {
      keys.sort((a, b) => (lang[a].t || 0) - (lang[b].t || 0)).slice(0, keys.length - MAX_WORDS).forEach((x) => delete lang[x]);
    }
  }
  if (mavzu && sozlar.length) {
    data.oxirgi = { code, mavzu, til: sozlar[0].til, sozlar: sozlar.slice(0, 4).map(({ say, emoji }) => ({ say, emoji })), t: now };
  }
  write(st, data);
  return data;
}

/** O'tgan dars (shu darsning o'zi bo'lmasa). */
export function oxirgiDars(code = "", st = store()) {
  const o = read(st).oxirgi;
  return o && o.code !== code ? o : null;
}

/** Bola shu tilda bilgan so'zlar — eng yangi va eng ko'p takrorlanganlari oldinda. */
export function bilganSozlar(til, st = store()) {
  const lang = (read(st).sozlar || {})[til] || {};
  return Object.values(lang).sort((a, b) => (b.t || 0) - (a.t || 0) || b.n - a.n);
}
