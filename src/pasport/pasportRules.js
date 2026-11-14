// REV560: o'quvchi pasporti — ko'rinish uchun sof yordamchilar.
export const HOLAT_TARTIB = ["mustahkam", "takror", "unutilgan", "xato"];
export const HOLAT_NOMI = { mustahkam: "Mustahkam", takror: "Takrorlash vaqti", unutilgan: "Unutilgan bo‘lishi mumkin", xato: "Oxirgi urinishda xato" };
export const HOLAT_RANG = { mustahkam: "#1f8a4c", takror: "#e0a526", unutilgan: "#e0743b", xato: "#d9534f" };

/** Holatlar soni → ketma-ket yo'lak bo'laklari (foizlar yig'indisi aynan 100; bo'sh bo'lsa — bo'sh ro'yxat). */
export function holatBolaklari(h) {
  const jami = HOLAT_TARTIB.reduce((n, k) => n + (h?.[k] || 0), 0); if (!jami) return [];
  let berildi = 0; const out = HOLAT_TARTIB.map((k) => { const foiz = Math.floor((100 * (h[k] || 0)) / jami); berildi += foiz; return { k, soni: h[k] || 0, foiz }; });
  let qoldiq = 100 - berildi; const kattalar = [...out].sort((a, b) => ((100 * b.soni) / jami) % 1 - ((100 * a.soni) / jami) % 1);   // qoldiqni eng katta kasr qismiga beramiz
  for (const x of kattalar) { if (qoldiq <= 0) break; if (x.soni) { x.foiz += 1; qoldiq -= 1; } }
  return out.filter((x) => x.soni > 0);
}

export const DARAJA_RANGI = { yuqori: "#1f8a4c", yaxshi: "#1b6fd8", "o‘rta": "#b9831a", past: "#d9534f" };
/** Foiz → yo'lak rangi. */
export const foizRangi = (f) => (f >= 75 ? "#1f8a4c" : f >= 50 ? "#1b6fd8" : f >= 30 ? "#e0a526" : "#d9534f");

export const sanaQisqa = (iso) => { if (!iso) return ""; const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`; };
/** Ball → xalqaro daraja nomi (400/475/550/625). */
export const xalqaroDaraja = (ball) => (ball == null ? "" : ball >= 625 ? "Ilg‘or" : ball >= 550 ? "Yuqori" : ball >= 475 ? "O‘rta" : ball >= 400 ? "Past" : "Boshlang‘ich");
