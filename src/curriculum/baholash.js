// REV186: yoshga mos baholash va xalqaro darajaga taxminiy moslik (o'quvchini qiziqtirish uchun).
//   1–4-sinf  → yulduzlar ⭐⭐⭐ va maqtov so'zi
//   5–6-sinf  → 100 ballik + medal 🥇🥈🥉
//   7–9-sinf  → 5 baholik baho + ball
//   10–11-sinf → baho + ball + daraja (CEFR / IELTS / TOEFL / SAT)
// Daraja — sinf dasturi va natija foizidan TAXMINIY hisob, rasmiy sertifikat emas.

export function sinfRaqami(sinf) {
  const m = /(\d{1,2})/.exec(String(sinf || ""));
  const n = m ? Number(m[1]) : 0;
  return /yosh/i.test(String(sinf || "")) ? 0 : n >= 1 && n <= 11 ? n : 0;
}

export function band(sinf) {
  const n = sinfRaqami(sinf);
  if (!n) return "bogcha";
  return n <= 4 ? "1-4" : n <= 6 ? "5-6" : n <= 9 ? "7-9" : "10-11";
}

/** Eski natijalar faqat yulduz bilan saqlangan — foizga taxminan o'giramiz. */
export const yulduzdanFoiz = (y) => [20, 50, 75, 95][Math.max(0, Math.min(3, Number(y) || 0))];

export function yulduz(foiz) { return foiz >= 90 ? 3 : foiz >= 60 ? 2 : foiz >= 30 ? 1 : 0; }
export function besBaho(foiz) { return foiz >= 86 ? 5 : foiz >= 71 ? 4 : foiz >= 56 ? 3 : 2; }
export function medal(foiz) { return foiz >= 90 ? "🥇" : foiz >= 75 ? "🥈" : foiz >= 60 ? "🥉" : "🎯"; }

/** Bitta natija → ko'rinish: { asosiy, izoh, rang } (yoshga mos). */
export function baho(sinf, foiz) {
  const f = Math.max(0, Math.min(100, Math.round(Number(foiz) || 0)));
  const b = band(sinf);
  const rang = f >= 86 ? "#1f8a4c" : f >= 60 ? "#1b6fd8" : f >= 40 ? "#c77d00" : "#b33a3a";
  if (b === "bogcha" || b === "1-4") {
    const y = yulduz(f);
    return { asosiy: "⭐".repeat(y) + "☆".repeat(3 - y), izoh: y === 3 ? "Zo‘r!" : y === 2 ? "Yaxshi!" : y === 1 ? "Yana bir oz!" : "Qayta urinib ko‘r", rang };
  }
  if (b === "5-6") return { asosiy: `${medal(f)} ${f} ball`, izoh: f >= 90 ? "Oltin" : f >= 75 ? "Kumush" : f >= 60 ? "Bronza" : "Mashq qil", rang };
  if (b === "7-9") return { asosiy: `«${besBaho(f)}» · ${f} ball`, izoh: ["", "", "Qoniqarsiz", "Qoniqarli", "Yaxshi", "A’lo"][besBaho(f)], rang };
  return { asosiy: `«${besBaho(f)}» · ${f}/100`, izoh: ["", "", "Qoniqarsiz", "Qoniqarli", "Yaxshi", "A’lo"][besBaho(f)], rang };
}

// ── xalqaro daraja ──
const CEFR = ["Pre-A1", "A1", "A2", "B1", "B2", "C1"];
const IELTS = { "Pre-A1": "—", A1: "2.0–2.5", A2: "3.0–3.5", B1: "4.0–5.0", B2: "5.5–6.5", C1: "7.0–8.0" };
const TOEFL = { "Pre-A1": "—", A1: "~10", A2: "~30", B1: "42–71", B2: "72–94", C1: "95–114" };
const IMTIHON = {
  en: { "Pre-A1": "Cambridge Starters", A1: "Cambridge Movers", A2: "Cambridge Flyers / KET", B1: "Cambridge PET", B2: "Cambridge FCE", C1: "Cambridge CAE" },
  de: { "Pre-A1": "Goethe Fit in Deutsch 1", A1: "Goethe A1", A2: "Goethe A2", B1: "Goethe B1", B2: "Goethe B2", C1: "Goethe C1" },
  fr: { "Pre-A1": "DELF Prim A1.1", A1: "DELF A1", A2: "DELF A2", B1: "DELF B1", B2: "DELF B2", C1: "DALF C1" },
  es: { "Pre-A1": "DELE escolar", A1: "DELE A1", A2: "DELE A2", B1: "DELE B1", B2: "DELE B2", C1: "DELE C1" },
  ru: { "Pre-A1": "ТРКИ (детский)", A1: "ТРКИ — элементарный", A2: "ТРКИ — базовый", B1: "ТРКИ-1", B2: "ТРКИ-2", C1: "ТРКИ-3" },
  ar: { "Pre-A1": "—", A1: "A1", A2: "A2", B1: "B1", B2: "B2", C1: "C1" },
  tr: { "Pre-A1": "—", A1: "TYS A1", A2: "TYS A2", B1: "TYS B1", B2: "TYS B2", C1: "TYS C1" },
  ko: { "Pre-A1": "—", A1: "TOPIK I-1", A2: "TOPIK I-2", B1: "TOPIK II-3", B2: "TOPIK II-4", C1: "TOPIK II-5" },
  ja: { "Pre-A1": "—", A1: "JLPT N5", A2: "JLPT N4", B1: "JLPT N3", B2: "JLPT N2", C1: "JLPT N1" },
  zh: { "Pre-A1": "YCT 1", A1: "HSK 1–2", A2: "HSK 3", B1: "HSK 4", B2: "HSK 5", C1: "HSK 6" },
};
const TIL_FAN = [[/ingliz|english|англ/i, "en"], [/nemis|german|deutsch|немец/i, "de"], [/fransuz|french|франц/i, "fr"], [/ispan|spanish|испан/i, "es"],
  [/rus tili|russian|русск/i, "ru"], [/arab/i, "ar"], [/turk/i, "tr"], [/koreys|korean/i, "ko"], [/yapon|japan/i, "ja"], [/xitoy|chinese|китай/i, "zh"]];
export function fanTili(fan) { const s = String(fan || ""); for (const [re, k] of TIL_FAN) if (re.test(s)) return k; return ""; }

/** Sinf va o'rtacha foizdan taxminiy daraja. Til fanlari — CEFR va imtihonlar, boshqa fanlar — PISA va SAT Math. */
export function daraja(sinf, foiz, fan) {
  const n = sinfRaqami(sinf);
  const f = Math.max(0, Math.min(100, Number(foiz) || 0));
  const til = fanTili(fan);
  if (til) {
    let i = n <= 2 ? 0 : n <= 5 ? 1 : n <= 8 ? 2 : 3;
    if (!n) i = 0;
    if (f < 50) i = Math.max(0, i - 1);
    if (n >= 10 && f >= 90) i = Math.min(5, i + 1);
    const c = CEFR[i];
    const qator = [`CEFR ${c}`];
    if (til === "en" && IELTS[c] !== "—") qator.push(`IELTS ${IELTS[c]}`);
    if (til === "en" && TOEFL[c] !== "—" && n >= 7) qator.push(`TOEFL iBT ${TOEFL[c]}`);
    if (IMTIHON[til]?.[c] && IMTIHON[til][c] !== "—") qator.push(IMTIHON[til][c]);
    if (til === "en" && n >= 9) qator.push(`SAT EBRW ~${satBall(n, f)}`);
    return { nom: c, qator, foiz: f };
  }
  const pisa = Math.max(1, Math.min(6, 1 + Math.floor(f / 20) + (n >= 9 ? 1 : 0) - (n && n <= 4 ? 1 : 0)));
  const qator = [`PISA ${pisa}-daraja`];
  if (n >= 7) qator.push(`SAT Math ~${satBall(n, f)}`);
  return { nom: `PISA ${pisa}`, qator, foiz: f };
}

function satBall(n, f) {
  const max = 500 + Math.max(0, n - 7) * 75;   // 7-sinf — 500 gacha, 11-sinf — 800 gacha
  return Math.round((200 + (f / 100) * (max - 200)) / 10) * 10;
}
