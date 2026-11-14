// REV565: dars matnidagi virtual doska qatorlari: [[GRAFIK: ifoda | a=1,b=-2 | -4..6 | -5..8]], [[INTEGRAL: x^2 | 0..2 | -1..3]], [[BIRLIK_AYLANA: 30]], [[DOSKA]].
// Bu qoidalar dars tekshiruvchisi (tools/mat_bank/dars_qosh.py) bilan bir xil: noto'g'ri qator aniq sabab bilan rad etiladi.
import { ifodaTayyorla } from "./grafikRules.js";

export const VIDJET_TURLARI = ["GRAFIK", "INTEGRAL", "BIRLIK_AYLANA", "DOSKA", "CHIZMA"];
const SON = "-?\\d+(?:[.,]\\d+)?";
const oraliq = (s) => { const m = new RegExp(`^(${SON})\\s*\\.\\.\\s*(${SON})$`).exec(s.trim()); if (!m) return null; const a = Number(m[1].replace(",", ".")), b = Number(m[2].replace(",", ".")); return a < b ? [a, b] : null; };
// parametrda o'nli kasr NUQTA bilan (k=0.5): vergul parametrlarni ajratadi
const parametrlar = (s) => { const out = {}; for (const bo of s.split(",")) { const m = /^\s*([A-Za-z])\s*=\s*(-?\d+(?:\.\d+)?)\s*$/.exec(bo); if (!m) return null; out[m[1]] = Number(m[2]); } return Object.keys(out).length ? out : null; };

/** Qator argumenti → { tur, … } yoki { xato }. */
export function vidjetTahlil(tur, arg = "") {
  const T = String(tur || "").toUpperCase(); if (!VIDJET_TURLARI.includes(T)) return { xato: `noma'lum vidjet: ${tur}` };
  const bo = String(arg || "").split("|").map((x) => x.trim()).filter((x, i) => x !== "" || i === 0);
  if (T === "DOSKA") return { tur: T };
  if (T === "CHIZMA") { const a = String(arg || "").split(/\s+/).filter(Boolean).join(" "); return a ? { tur: T, arg: a } : { xato: "CHIZMA: shakl nomi kerak" }; }     // sonlar serverda hisoblangan; qiymat — darsning geo xaritasida
  if (T === "BIRLIK_AYLANA") { const v = bo[0] === "" || bo[0] === undefined ? 30 : Number(String(bo[0]).replace(",", ".")); return Number.isFinite(v) && v >= 0 && v <= 360 ? { tur: T, burchak: v } : { xato: "burchak 0–360 gradus bo'lsin" }; }
  const ifoda = bo[0]; const t = ifodaTayyorla(ifoda); if (!t.daraxt) return { xato: `ifoda noto'g'ri («${ifoda}»): ${t.xato}` };
  const r = { tur: T, ifoda, parametrlar: {}, xr: null, yr: null, integral: null }; const oraliqlar = [];
  for (const q of bo.slice(1)) {
    if (q.includes("=")) { const p = parametrlar(q); if (!p) return { xato: `parametr «${q}» noto'g'ri («a=1, b=-2» ko'rinishida; o'nli kasr — nuqta bilan: k=0.5)` }; r.parametrlar = p; continue; }
    const o = oraliq(q); if (!o) return { xato: `oraliq «${q}» noto'g'ri («-4..6» ko'rinishida, birinchi son kichik)` }; oraliqlar.push(o);
  }
  if (T === "INTEGRAL") { if (!oraliqlar.length) return { xato: "INTEGRAL da integral chegaralari kerak («0..2»)" }; r.integral = { a: oraliqlar[0][0], b: oraliqlar[0][1] }; r.xr = oraliqlar[1] || null; r.yr = oraliqlar[2] || null; }
  else { r.xr = oraliqlar[0] || null; r.yr = oraliqlar[1] || null; }
  for (const h of Object.keys(r.parametrlar)) if (!t.parametrlar.includes(h)) return { xato: `«${h}» parametri ifodada yo'q` };
  return r;
}

/** Matn ichidagi «[[TUR: arg]]» qatori → { tur, arg } yoki null. pandoc yozuvi (\[\[ … \]\], \_) ham tanib olinadi. */
export function vidjetQatori(qator) {
  const t = String(qator ?? "").trim().replace(/\\([\[\]_*^])/g, "$1");
  const m = /^\[\[\s*([A-Z_]+)\s*(?::\s*(.*?))?\s*\]\]$/.exec(t); return m ? { tur: m[1], arg: m[2] || "" } : null;
}
