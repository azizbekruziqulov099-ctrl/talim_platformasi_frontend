// REV360: bola o'yinni necha marta o'ynagan — shu qurilmada. 0 — Kabu bir raundni o'zi ko'rsatadi; 1–3 — qoida bir gap
// bilan eslatiladi; 4+ — tushuntirishsiz, darhol o'yin.
const KALIT = "kabutar:oyin-tanishlik";
const ls = () => { try { return globalThis.localStorage || null; } catch { return null; } };
export function tanishlikOl(s = ls()) { try { return JSON.parse(s?.getItem(KALIT) || "{}") || {}; } catch { return {}; } }
export function necha(id, s = ls()) { return Number(tanishlikOl(s)[id] || 0); }
export function oynadi(id, s = ls()) { const d = tanishlikOl(s); d[id] = Number(d[id] || 0) + 1; try { s?.setItem(KALIT, JSON.stringify(d)); } catch { /* */ } return d[id]; }
/** Kirish darajasi: "korsat" (Kabu o'ynab ko'rsatadi) | "eslat" (qisqa qoida) | "yoq" (darhol). */
export function kirishDarajasi(n) { return n <= 0 ? "korsat" : n <= 3 ? "eslat" : "yoq"; }
