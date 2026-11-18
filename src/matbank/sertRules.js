// Milliy sertifikat uslubidagi kirish testi / to'liq sinov: vaqt va natija ko'rsatkichlari (sof funksiyalar).
export const BALL_RANGI = { "A+": "#1f8a4c", A: "#2f9e5b", "B+": "#1b6fd8", B: "#3b82f6", "C+": "#c77d00", C: "#d98c1f" };
export const vaqtMatni = (sek) => { const s = Math.max(0, Math.floor(sek || 0)); const m = Math.floor(s / 60); return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
export const qolganSekund = (daqiqa, otgan) => Math.max(0, daqiqa * 60 - Math.max(0, otgan || 0));
/** Natija sarlavhasi: ball bo'yicha daraja va xabar. */
export function natijaXabari(r) {
  if (!r) return "";
  if (r.sertifikat) return `${r.daraja} · ${r.ball} ball — sertifikat darajasiga yetdingiz (taxminiy)`;
  return `${r.ball} ball — sertifikat uchun 46 ball kerak. Quyidagi mavzularni o‘rganib, qayta urinib ko‘ring`;
}
export const zaifBolimlar = (bolimlar) => [...(bolimlar || [])].filter((b) => b.jami > 0).sort((a, b) => (a.foiz ?? 0) - (b.foiz ?? 0)).slice(0, 3);
