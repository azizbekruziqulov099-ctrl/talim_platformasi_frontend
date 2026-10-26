// REV180: maktab o'quvchisining fan kundaligi — har bir ish (dars, test, takror, mashq, repetitor, imtihon) va bahosi.
// Server (har qurilmada bir xil) + shu qurilmadagi yozuvlar (internet bo'lmaganda ham) birlashtiriladi.
const KEY = "kabutar:maktab:kundalik:v1";
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
const bugunISO = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const fanKaliti = (f = "") => String(f).replace(/\s*\(izoh:[^)]*\)\s*/i, "").trim().toLowerCase();

/** Shu qurilmaga yozish (bir kunda bir xil turi+kod — bitta yozuv, eng yaxshi natija saqlanadi). */
export function kundalikYoz(y, st = store(), sana = bugunISO(), vaqt = new Date().toTimeString().slice(0, 5)) {
  if (!y?.turi || !y?.kod) return;
  let d = [];
  try { d = JSON.parse(st?.getItem(KEY) || "[]") || []; } catch { d = []; }
  const i = d.findIndex((x) => x.sana === sana && x.turi === y.turi && x.kod === y.kod);
  const yangi = { sana, vaqt, turi: y.turi, kod: y.kod, fan: y.fan || "", til: y.til || "", mavzu: y.mavzu || "",
    togri: Number(y.togri) || 0, jami: Number(y.jami) || 0, yozdi: Number(y.yozdi) || 0, soniya: Number(y.soniya) || 0 };
  if (i >= 0) {
    const e = d[i];
    d[i] = { ...e, ...yangi, vaqt: e.vaqt, mavzu: yangi.mavzu || e.mavzu, fan: yangi.fan || e.fan,
      togri: yangi.jami ? yangi.togri : e.togri, jami: yangi.jami || e.jami, yozdi: e.yozdi + yangi.yozdi, soniya: e.soniya + yangi.soniya };
  } else d.push(yangi);
  try { st?.setItem(KEY, JSON.stringify(d.slice(-400))); } catch { /* joy yo'q */ }
}
export function kundalikOl(st = store()) { try { return JSON.parse(st?.getItem(KEY) || "[]") || []; } catch { return []; } }

/** Server va qurilma yozuvlari birlashtiriladi (bir xil kun + turi + kod — bittasi). Eng yangisi birinchi. */
export function birlashtir(server = [], mahalliy = [], fan = "") {
  const fk = fanKaliti(fan);
  const m = new Map();
  for (const x of [...mahalliy, ...server]) {
    if (fk && fanKaliti(x.fan) !== fk) continue;
    const k = `${x.sana}|${x.turi}|${x.kod}`;
    const e = m.get(k);
    m.set(k, e ? { ...e, ...x, togri: Math.max(e.togri, x.togri), jami: Math.max(e.jami, x.jami), yozdi: Math.max(e.yozdi, x.yozdi), soniya: Math.max(e.soniya, x.soniya), vaqt: e.vaqt || x.vaqt } : x);
  }
  return [...m.values()].sort((a, b) => (b.sana + (b.vaqt || "")).localeCompare(a.sana + (a.vaqt || "")));
}

/** Baho (2–5) foizdan; savoli yo'q ish — baholanmaydi (null). */
export const baho = (togri, jami) => { if (!jami) return null; const p = togri / jami; return p >= 0.9 ? 5 : p >= 0.75 ? 4 : p >= 0.55 ? 3 : 2; };

/** Kundalik bo'yicha umumiy: o'rtacha baho, darslar soni, yozganlari, daqiqa. */
export function jamla(royxat = []) {
  const baholar = royxat.map((x) => baho(x.togri, x.jami)).filter((b) => b !== null);
  return {
    orta: baholar.length ? Math.round((baholar.reduce((s, b) => s + b, 0) / baholar.length) * 10) / 10 : null,
    darslar: new Set(royxat.filter((x) => x.turi === "dars").map((x) => x.kod)).size,
    yozdi: royxat.reduce((s, x) => s + (x.yozdi || 0), 0),
    daqiqa: Math.round(royxat.reduce((s, x) => s + (x.soniya || 0), 0) / 60),
  };
}
/** Kunlar bo'yicha guruh. */
export function kunlarBoyicha(royxat = []) {
  const out = [];
  for (const x of royxat) { const g = out[out.length - 1]; if (g && g.sana === x.sana) g.ishlar.push(x); else out.push({ sana: x.sana, ishlar: [x] }); }
  return out;
}
