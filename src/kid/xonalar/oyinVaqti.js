// REV128: O'yin xonalari vaqti (shu qurilmada). Bola faol o'ynagan vaqt hisoblanadi:
// — 1 soat (SEANS) uzluksiz o'ynasa — 15 daqiqa (TANAFFUS) majburiy dam;
// — kuniga ko'pi bilan 2 soat (KUNLIK) — keyin ertagacha yopiladi.
// Hisob faqat sahifa ko'rinib turganda va bola oxirgi 3 daqiqada nimadir bosgan bo'lsa yuradi (ochiq qoldirilgan ekran hisoblanmaydi).

export const SEANS = 60 * 60;          // soniya
export const TANAFFUS = 15 * 60;
export const KUNLIK = 2 * 60 * 60;
export const OGOH = 5 * 60;             // ogohlantirish — tanaffus yoki kun tugashiga 5 daqiqa qolganda
export const FAOL = 3 * 60;             // shuncha vaqt hech narsa bosilmasa — vaqt hisoblanmaydi
const KEY = "kabutar:xonalar:vaqt:v1";

export function kun(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
export function oqi(st = store(), now = Date.now()) {
  let h = null;
  try { h = JSON.parse(st?.getItem(KEY) || "null"); } catch { h = null; }
  const bugun = kun(new Date(now));
  if (!h || h.kun !== bugun) h = { kun: bugun, jami: 0, seans: 0, tanaffusGacha: 0 };
  return h;
}
function yoz(h, st) { try { st?.setItem(KEY, JSON.stringify(h)); } catch { /* joy yo'q */ } }

/** Holat: "ok" | "tanaffus" | "tugadi", qolgan daqiqalar va ogohlantirish kerakmi. */
export function holat(h, now = Date.now()) {
  if (h.jami >= KUNLIK) return { holat: "tugadi", qoldi: 0 };
  if (h.tanaffusGacha && now < h.tanaffusGacha) return { holat: "tanaffus", qoldi: Math.ceil((h.tanaffusGacha - now) / 60000) };
  const seansQoldi = SEANS - h.seans, kunQoldi = KUNLIK - h.jami;
  const qoldi = Math.min(seansQoldi, kunQoldi);
  return { holat: "ok", qoldi: Math.ceil(qoldi / 60), ogoh: qoldi <= OGOH };
}

/** dt soniya faol o'yin qo'shiladi. Tanaffus tugagan bo'lsa — seans qaytadan boshlanadi. */
export function qosh(h, dt, now = Date.now()) {
  const n = { ...h };
  if (n.tanaffusGacha && now >= n.tanaffusGacha) { n.tanaffusGacha = 0; n.seans = 0; }
  if (holat(n, now).holat !== "ok") return n;
  n.jami += dt; n.seans += dt;
  if (n.seans >= SEANS && n.jami < KUNLIK) n.tanaffusGacha = now + TANAFFUS * 1000;
  return n;
}

/** Bir qadam: o'qiydi, qo'shadi, yozadi va holatni qaytaradi. */
export function tik(dt, st = store(), now = Date.now()) {
  const h = qosh(oqi(st, now), dt, now);
  yoz(h, st);
  return holat(h, now);
}
