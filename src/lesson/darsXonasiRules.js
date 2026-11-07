// Dars xonasining sof qoidalari (brauzersiz sinash mumkin).

const norm = (value) => String(value ?? "")
  .toLowerCase()
  .replace(/ö/g, "o'").replace(/ğ/g, "g'").replace(/ş/g, "sh").replace(/ç/g, "ch")   // REV221: yangi alifbo ham qabul
  .replace(/[‘’ʻʼ`]/g, "'")
  .replace(/\$|\\,|\\;|\s+/g, "")
  .replace(/,/g, ".")
  .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1/$2");

// REV384: so'z javob — o'quvchi asosiy so'zni yozsa yetadi: «juft» ↔ «Juft son», «6 — juft», «juft (6 : 2 = 3)».
// Inkor bo'lgan javob («toq emas») bunday qisqa solishtirilmaydi — u faqat to'liq mos kelsa to'g'ri.
const INKOR = new Set(["emas", "yoq", "yo'q", "not", "no", "нет", "не", "nicht", "kein", "keine"]);
const sozlar = (v) => String(v ?? "").toLowerCase()
  .replace(/ö/g, "o'").replace(/ğ/g, "g'").replace(/ş/g, "sh").replace(/ç/g, "ch").replace(/[‘’ʻʼ`]/g, "'")
  .replace(/\([^)]*\)|\$[^$]*\$/g, " ").replace(/[^\p{L}'\s-]/gu, " ").split(/[\s-]+/).map((w) => w.replace(/^'+|'+$/g, "")).filter((w) => w.length > 0);
/** REV385: imlo xatosiga yo'l — harf almashgan, tushib qolgan, ortiqcha yoki ikki harf o'rni almashgan (Damerau). */
export function tahrirMasofa(a, b) {
  a = String(a); b = String(b);
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j += 1) d[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) for (let j = 1; j <= b.length; j += 1) {
    const c = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}
// so'z uzunligiga qarab ruxsat: 1–3 harf — aniq, 4–7 — 1 xato, 8+ — 2 xato («juft» → «jutf», «dt» → «tt», qo'shni tugma)
const ruxsat = (w) => (w.length >= 8 ? 2 : w.length >= 4 ? 1 : 0);
const sozMos = (g, e) => g === e || tahrirMasofa(g, e) <= ruxsat(e);
export function sozJavobMos(given, kutilgan = []) {
  const g = sozlar(given);
  if (!g.length || g.join("").length < 2 || g.some((w) => INKOR.has(w))) return false;
  return kutilgan.some((k) => {
    const e = sozlar(k);
    if (!e.length || g.length > e.length) return false;
    const inkor = e.some((w) => INKOR.has(w));
    if (inkor) return g.length === e.length && g.every((w, j) => sozMos(w, e[j]));   // inkorli javob — to'liq yozilsin
    for (let i = 0; i + g.length <= e.length; i += 1) if (g.every((w, j) => sozMos(w, e[i + j]))) return true;
    return false;
  });
}

// REV385: darsning nazariy qismidagi savol — yozish o'rniga 4 ta (ha/yo'q savolda 2 ta) variant
const JUFTLAR = { juft: "toq", toq: "juft", katta: "kichik", kichik: "katta", "ko'p": "kam", kam: "ko'p", uzun: "qisqa", qisqa: "uzun", "og'ir": "yengil", yengil: "og'ir",
  issiq: "sovuq", sovuq: "issiq", tez: "sekin", sekin: "tez", baland: "past", past: "baland", "to'g'ri": "noto'g'ri", "noto'g'ri": "to'g'ri", ortiq: "kam", teng: "teng emas" };
const HA_YOQ = /^(ha|yo['ʻ’‘]?q|да|нет|yes|no|ja|nein|sí|si)$/i;
const tasodif = (seed) => { let x = 0; for (const c of String(seed)) x = (x * 31 + c.charCodeAt(0)) >>> 0; return () => ((x = (x * 1103515245 + 12345) >>> 0) / 2 ** 32); };
export function variantlarYasa(step, steps = []) {
  const javoblar = String(step?.javob ?? "").split(/[|;]/).map((x) => x.trim()).filter(Boolean);
  const togri = javoblar[0];
  if (!togri || togri.length > 40) return null;
  const rnd = tasodif(step?.id || togri);
  const aralash = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const bosh = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  // REV405: Miya'da ustoz o'zi yozgan variantlar («to'g'ri | xato | xato», 2–6 ta) — shular aynan chiqadi
  if (Array.isArray(step?.variantlar) && step.variantlar.length >= 2) {
    const v = step.variantlar.slice(0, 6).map(String);
    return aralash(v).map((t) => ({ matn: t, togri: t === v[0] }));
  }
  if (HA_YOQ.test(togri)) { const ha = /^(ha|да|yes|ja|sí|si)$/i.test(togri); return aralash([togri, ha ? "Yo‘q" : "Ha"]).map((t) => ({ matn: bosh(t), togri: t === togri })); }
  const n = sonQiymat(togri);
  let boshqa = [];
  if (n !== null && Number.isInteger(n)) {
    boshqa = [n + 1, n - 1, n + 2, n - 2, n * 2, n + 10].filter((x) => x >= 0 && x !== n).map(String);
  } else if (n !== null) {
    const m = String(togri).match(/^(\d+)\s*\/\s*(\d+)$/);
    boshqa = m ? [`${m[2]}/${m[1]}`, `${m[1]}/${Number(m[2]) + 1}`, `${Number(m[1]) + 1}/${m[2]}`, `${m[1]}/${Number(m[2]) * 2}`] : [];
  } else {
    const kalit = sozlar(togri).join(" ");
    if (JUFTLAR[kalit]) boshqa.push(JUFTLAR[kalit]);
    for (const st of steps) {
      const j = String(st?.javob ?? "").split(/[|;]/)[0]?.trim();
      if (j && j.length <= 40 && sonQiymat(j) === null && !HA_YOQ.test(j) && sozlar(j).join(" ") !== kalit) boshqa.push(j);
    }
  }
  boshqa = [...new Set(boshqa.map((x) => String(x)))].filter((x) => !checkAnswer(x, togri));
  if (!boshqa.length) return null;   // variant yasab bo'lmadi — yozib javob beradi
  const tanlov = aralash(boshqa).slice(0, 3);
  return aralash([togri, ...tanlov]).map((t) => ({ matn: n === null ? bosh(t) : t, togri: t === togri }));
}

// «kutilgan_javob»da bir nechta to'g'ri javob | yoki ; bilan ajratiladi: 2/6|1/3
// REV312: son qiymati — «5/8», «5:8», «0,625», «1 1/2» (aralash son), «-3» bir xil qiymat sifatida solishtiriladi
export function sonQiymat(v) {
  let t = String(v ?? "").trim().replace(/\$/g, "").replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1/$2").replace(/[−–]/g, "-").replace(/,/g, ".").replace(/\s+/g, " ");
  let m = t.match(/^(-?\d+) (\d+)\/(\d+)$/);
  if (m) { const b = Number(m[1]); const f = Number(m[2]) / Number(m[3]); return b < 0 ? b - f : b + f; }
  t = t.replace(/\s/g, "");
  m = t.match(/^(-?\d+(?:\.\d+)?)[/:](-?\d+(?:\.\d+)?)$/);
  if (m) return Number(m[2]) === 0 ? null : Number(m[1]) / Number(m[2]);
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : null;
}

export function checkAnswer(given, expected) {
  const answer = norm(given);
  if (!answer) return false;
  const kutilgan = String(expected ?? "").split(/[|;]/).map((x) => x.trim()).filter(Boolean);
  if (kutilgan.map(norm).includes(answer)) return true;
  if (sozJavobMos(given, kutilgan)) return true;   // REV384
  const g = sonQiymat(given);
  // «12 ta olma» kabi javobda boshidagi son ham qabul qilinadi
  const sonli = (k) => { const v = sonQiymat(k); if (v !== null) return v; const m = String(k).replace(/\$/g, "").match(/^\s*(-?\d+(?:[.,]\d+)?(?:\s*[/:]\s*\d+)?)(?=\s|$)/); return m ? sonQiymat(m[1]) : null; };
  return g !== null && kutilgan.some((k) => { const v = sonli(k); return v !== null && Math.abs(v - g) < 1e-9; });
}

/** REV312: misolning kutilgan javobi — yechimning «Javob: …» qatoridan (javob maydoni bo'sh bo'lsa). */
export function javobYechimdan(steps = []) {
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    const t = String(steps[i]?.doska || "").replace(/\[\/?[a-z]{2}\]/g, "");
    const m = t.match(/(?:^|\n|\|\|)\s*(?:javob|ответ|answer)\s*:\s*([^\n|]+)/i);
    if (m) {
      const j = m[1].trim().replace(/^\$|\$$/g, "").replace(/\.\s*$/, "").trim();
      if (j && j.length <= 40) return j;
    }
  }
  return "";
}

// Bir xil «sahna»dagi ketma-ket qadamlar bitta doskada yig'iladi.
export function sceneRange(steps, index) {
  if (!steps?.[index]) return [];
  const scene = steps[index].sahna;
  let start = index;
  while (start > 0 && steps[start - 1].sahna === scene) start -= 1;
  return Array.from({ length: index - start + 1 }, (_, i) => start + i);
}

// Ovoz uchun: formulalar va belgilar o'qilmaydi, faqat so'zlar.
export function speakableText(text) {
  // REV169: formula endi o'chirilmaydi — [lat]…[/lat] (va $…$) server TTS'ga butunligicha boradi va u formulani
  // tabiiy o'qiydi («iksning kvadrati plyus uch…»). Teg tashqarisidagi oddiy ifodalar (x^2 + 3 = 7, 2/3) ham saqlanadi.
  const parts = [];
  const himoya = (f) => { parts.push(f); return ` \u0000${parts.length - 1}\u0000 `; };
  const s = String(text ?? "")
    .replace(/\[lat\]([\s\S]*?)\[\/lat\]/gi, (_, f) => himoya(f))
    .replace(/\$\$([^$]+)\$\$|\$([^$]+)\$/g, (_, a, b) => himoya(a || b))
    .replace(/\[\d{1,2}\]/g, " ")
    .replace(/[*#<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s.replace(/\s?\u0000(\d+)\u0000\s?/g, (_, i) => ` [lat]${parts[Number(i)].trim()}[/lat] `).replace(/\s+/g, " ").trim();
}

// Ochiq dars ishlanmasi (PDF yoki Word) — shu mavzuning nashr qilingan darsi.
export function lessonDownloadUrl(apiBase, token, topicCode, format = "pdf", til = "uz") {
  const base = String(apiBase ?? "").replace(/\/+$/, "");
  const q = { token, format: format === "docx" ? "docx" : "pdf" };
  const t = String(til || "uz").slice(0, 2);
  if (t !== "uz") q.til = t;   // REV217: ruscha/inglizcha interfeysda — o'sha tildagi izohli kitob
  return `${base}/api/dars_xonasi/${encodeURIComponent(topicCode)}/yuklab?${new URLSearchParams(q)}`;
}

// Ovoz va doska mosligi. Doskadagi har satr — alohida qator. Ovoz matnidagi [1], [2]
// belgilari: o'qituvchi shu so'zga yetganda doskaning o'sha qatori yoziladi. Belgi
// bo'lmagan qatorlar gap bo'ylab teng taqsimlanadi (birinchisi darhol).
export function boardCues(board, voice) {
  const lines = String(board ?? "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const words = [];
  const marked = new Map();
  for (const token of String(voice ?? "").split(/\s+/).filter(Boolean)) {
    const parts = token.split(/(\[\d{1,2}\])/).filter(Boolean);
    for (const part of parts) {
      const marker = part.match(/^\[(\d{1,2})\]$/);
      if (marker) { const n = Number(marker[1]) - 1; if (n >= 0 && !marked.has(n)) marked.set(n, words.length); }
      else words.push(part);
    }
  }
  const spoken = words.join(" ");
  const total = Math.max(1, words.length);
  const cues = lines.map((_, i) => marked.has(i) ? marked.get(i) : marked.size ? 0 : Math.floor((i * total) / Math.max(1, lines.length)));
  return { lines, spoken, cues };
}

// Hozir aytilayotgan so'zga qarab doskada nechta qator ko'rinishi kerak.
export function visibleLines(cues, wordIndex, finished) {
  if (finished) return cues.length;
  const at = Math.max(0, wordIndex);
  return cues.filter((cue) => cue <= at).length;
}
