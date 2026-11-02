// REV260: «Xalqaro baholash» — sof qoidalar (brauzersiz sinaladi).

export const FIKRLASH = { bilish: "Bilish", qollash: "Qo‘llash", mulohaza: "Mulohaza" };
export const IMTIHON_BELGI = { haftalik: "📅", oylik: "🗓️", choraklik: "📘", yillik: "🏆" };
export const DARAJA_RANG = { ilgor: "#7b3fe4", yuqori: "#1f8a4c", orta: "#1b6fd8", past: "#c77d00", boshlangich: "#b33a3a" };
export const DARAJALAR = [[625, "Ilg‘or"], [550, "Yuqori"], [475, "O‘rta"], [400, "Past"]];

/** Sinf → tavsiya etilgan TIMSS bosqichi. */
export const bosqichOf = (sinf) => (Number(sinf) >= 6 ? 8 : 4);

export function sinfRaqami(value) {
  const m = /(\d{1,2})/.exec(String(value ?? ""));
  const n = m ? Number(m[1]) : 0;
  return /yosh|kurs/i.test(String(value ?? "")) ? 0 : n >= 1 && n <= 11 ? n : 0;
}

/** Qolgan vaqt (ms) → «12:05». */
export function vaqtMatn(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${p(m)}:${p(x)}` : `${p(m)}:${p(x)}`;
}

/** Server vaqti bilan farqni hisobga olib, imtihon tugashigacha qolgan ms. */
export function qolganVaqt(tugash, serverVaqt, clientBosh, hozir = Date.now()) {
  const farq = serverVaqt ? Date.parse(serverVaqt) - clientBosh : 0;
  return Date.parse(tugash) - (hozir + farq);
}

const norm = (v) => String(v ?? "").toLowerCase()
  .replace(/[‘’ʻʼ`´]/g, "'").replace(/ё/g, "е").replace(/[.,!?;:«»"()]/g, " ").replace(/\s+/g, " ").trim();

/** Ovozli javob → variant indeksi. «be», «B javob», «ikkinchi», «бэ» … */
export function ovozdanVariant(text) {
  const t = norm(text);
  if (!t) return null;
  const sozlar = t.split(" ");
  const harf = { a: 0, "а": 0, "ә": 0, b: 1, be: 1, bi: 1, "б": 1, "бэ": 1, "бе": 1, c: 2, ce: 2, se: 2, si: 2, ts: 2, "с": 2, "си": 2, "це": 2, "сэ": 2,
    d: 3, de: 3, di: 3, "д": 3, "дэ": 3, "де": 3, "ди": 3 };
  const tartib = [[/^(birinchi|bir|первый|первая|first|one)$/, 0], [/^(ikkinchi|ikki|второй|вторая|second|two)$/, 1],
    [/^(uchinchi|uch|третий|третья|third|three)$/, 2], [/^(to'rtinchi|to'rt|четвертый|четвёртый|четвертая|fourth|four)$/, 3]];
  for (const s of sozlar) if (s in harf) return harf[s];
  for (const s of sozlar) for (const [re, i] of tartib) if (re.test(s)) return i;
  return null;
}

const BIRLAR = { nol: 0, bir: 1, ikki: 2, uch: 3, "to'rt": 4, besh: 5, olti: 6, yetti: 7, sakkiz: 8, "to'qqiz": 9 };
const ONLAR = { "o'n": 10, yigirma: 20, "o'ttiz": 30, qirq: 40, ellik: 50, oltmish: 60, yetmish: 70, sakson: 80, "to'qson": 90 };

/** O'zbekcha son so'zlari → son: «yuz yigirma besh» → 125, «ming ikki yuz» → 1200. Topilmasa null. */
export function uzSon(sozlar) {
  let jami = 0, joriy = 0, bor = false;
  for (const w of sozlar) {
    if (/^-?\d+([.,]\d+)?$/.test(w)) { joriy += Number(w.replace(",", ".")); bor = true; }
    else if (w in BIRLAR) { joriy += BIRLAR[w]; bor = true; }
    else if (w in ONLAR) { joriy += ONLAR[w]; bor = true; }
    else if (w === "yuz") { joriy = (joriy || 1) * 100; bor = true; }
    else if (w === "ming") { jami += (joriy || 1) * 1000; joriy = 0; bor = true; }
    else if (w === "million") { jami += (joriy || 1) * 1e6; joriy = 0; bor = true; }
    else return null;
  }
  return bor ? jami + joriy : null;
}

/** Ovozli javob → yoziladigan qisqa javob: «o‘n ikki» → «12», «uch butun besh» → «3,5», «to‘rtdan uch» → «3/4», «minus besh» → «-5». */
export function ovozdanJavob(text) {
  const t = norm(text).replace(/\b(ta|dona|javob|javobim|menimcha|bu|teng|ga|so'm|metr|santimetr)\b/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const s = t.split(" ");
  const manfiy = s[0] === "minus" ? (s.shift(), "-") : "";
  const iBut = s.indexOf("butun");
  if (iBut > 0) {
    const a = uzSon(s.slice(0, iBut)), b = uzSon(s.slice(iBut + 1).filter((w) => !/^(o'ndan|yuzdan|mingdan)$/.test(w)));
    if (a !== null && b !== null) return `${manfiy}${a},${b}`;
  }
  const iDan = s.findIndex((w) => /dan$/.test(w) && w !== "dan");
  if (iDan >= 0) {
    const maxraj = uzSon([...s.slice(0, iDan), s[iDan].replace(/dan$/, "")]);
    const surat = uzSon(s.slice(iDan + 1));
    if (maxraj && surat !== null) return `${manfiy}${surat}/${maxraj}`;
  }
  const n = uzSon(s);
  if (n !== null) return `${manfiy}${String(n).replace(".", ",")}`;
  return text.trim();
}

/** Ustoz gapining turi → rang va belgi. */
export const GAP_TUR = { maqtov: ["#1f8a4c", "🌟"], eslatma: ["#c77d00", "⏰"], tanbeh: ["#b33a3a", "⚠️"], salom: ["#1b6fd8", "👋"] };

/** Mavzu holati → yo'l belgisi. */
export function mavzuBelgi(holat) {
  if (!holat || !holat.urinilgan) return { belgi: "○", nom: "Boshlanmagan", kalit: "yangi" };
  if (holat.foiz >= 80) return { belgi: "★", nom: "O‘zlashtirildi", kalit: "tayyor" };
  if (holat.foiz >= 40) return { belgi: "◐", nom: "Davom etmoqda", kalit: "yarim" };
  return { belgi: "◔", nom: "Boshlangan", kalit: "boshlangan" };
}

/** Ball → TIMSS darajasi (rasmiy chegaralar). */
export function darajaNomi(ball) {
  if (ball === null || ball === undefined) return "";
  for (const [c, n] of DARAJALAR) if (ball >= c) return n;
  return "Past darajadan quyi";
}

/** Javoblar xaritasi → nechta javob berilgan. */
export const javoblarSoni = (javoblar) => Object.values(javoblar || {}).filter((v) => String(v ?? "").trim() !== "").length;

/** SVG matni → xavfsiz <img> manzili (skriptlar img ichida ishlamaydi). */
export function svgUrl(svg) {
  if (!svg) return "";
  try { return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(String(svg))}`; } catch { return ""; }
}

/** Davlatlar jadvalidan diagramma uchun qatorlar: eng yuqori 5, O'zbekiston, qo'shnilar va o'quvchi. */
export function solishtirishQatorlari(jadval, ball, n = 5) {
  const rows = [...(jadval || [])].sort((a, b) => b[1] - a[1]);
  const tanla = new Set(rows.slice(0, n).map((r) => r[0]));
  for (const nom of ["O‘zbekiston", "Qozog‘iston", "Rossiya", "Turkiya"]) if (rows.some((r) => r[0] === nom)) tanla.add(nom);
  const out = rows.filter((r) => tanla.has(r[0])).map(([nom, b]) => ({ nom, ball: b, uz: nom === "O‘zbekiston" }));
  if (ball) out.push({ nom: "Siz", ball, siz: true });
  out.push({ nom: "Xalqaro markaz", ball: 500, markaz: true });
  return out.sort((a, b) => b.ball - a.ball);
}
