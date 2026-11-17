// REV269: MATEMATIKA JONLI DOSKASI — sof qoidalar (brauzersiz sinaladi).
// Ustoz gapirayotganda doska qatori qo'lda yozilayotgandek ochiladi; qator boshidagi buyruq (USTUN:, QISQART:, GRAFIK: …)
// maxsus chizma bo'lib chiziladi. Buyruqlar miyaning «Doskaga yoziladi» va «Yechim» kataklarida yoziladi.

import { eskiAlifbo } from "../interface/yangiAlifbo.js";

export const MATEM_RE = /matem|algebr|geometr|математ|алгебр|геометр|\bmath|stereometr|стереометр/i;
export const matRejim = (fan) => MATEM_RE.test(String(fan || ""));

const BUYRUQLAR = ["YOZ", "DAVOM", "QOIDA", "BELGILA", "USTUN", "BOLISH", "QISQART", "SON_OQI", "GRAFIK", "CHIZ", "KASR_MODEL", "DOIRA_KASR", "OCHIR",
  "TAROZI", "ORIN_ALMASH", "ORINLASHTIR", "GURUHLASH", "VENN", "DARAXT", "OYIN", "ISH", "KETMA", "ELAK", "AMAL"];   // REV429: OYIN — doskadagi o'yin   // REV425: formulaning kelib chiqishi — harakatli chizmalar
const BUYRUQ_RE = new RegExp(`^\\s*(${BUYRUQLAR.join("|")})\\s*(?::|$)\\s*([\\s\\S]*)$`, "i");

const MATN_BUYRUQ = new Set(["yoz", "davom", "qoida", "belgila"]);
/** Qator → {tur, arg}. Buyruqsiz qator — {tur: "yoz", arg: qator}.
 *  Yangi alifboda (REV221) dars matni ekranga Ş/Ç bilan keladi («ÇIZ: uçburçak») — buyruq va chizma argumenti eski yozuvga
 *  qaytarib tahlil qilinadi; matnli buyruqlarda (YOZ, QOIDA, …) argument o'quvchi ko'radigan yozuvda qoladi. */
export function buyruq(line) {
  const asl = String(line ?? "");
  const norm = eskiAlifbo(asl);
  const m = norm.match(BUYRUQ_RE);
  if (!m) return { tur: "yoz", arg: asl };
  const tur = m[1].toLowerCase();
  if (MATN_BUYRUQ.has(tur)) { const bosh = norm.match(/^\s*\w+\s*(?::|$)\s*/)[0].length; return { tur, arg: asl.slice(bosh).trim() }; }
  return { tur, arg: m[2].trim() };
}

/** Doska qatorlari: DAVOM oldingi qatorga qo'shiladi, OCHIR — shu joygacha yozilganlar o'chadi (QOIDA qatorlari «Esda tut»da qoladi). */
export function doskaQatorlari(lines) {
  const out = [];
  for (const [n, line] of (lines || []).entries()) {
    const b = buyruq(line);
    if (b.tur === "davom" && out.length) { const pr = out[out.length - 1]; out[out.length - 1] = { ...pr, qismlar: [...pr.qismlar, { n, matn: b.arg }] }; continue; }
    out.push({ n, tur: b.tur === "davom" ? "yoz" : b.tur, arg: b.arg, qismlar: [{ n, matn: b.arg }] });
  }
  return out;
}

/** Buyruqli doska matnini ovozga moslash (yechimda «ovoz» qismi yo'q bo'lsa): chizma buyruqlari aytilmaydi. */
export function ovozMatni(line) {
  const b = buyruq(line);
  if (["yoz", "davom", "qoida", "belgila"].includes(b.tur)) return b.tur === "belgila" ? b.arg.replace(/\s+(aylana|tag|chiz|ramka)\s*$/i, "") : b.arg;
  if (b.tur === "ustun" || b.tur === "bolish") return b.arg.replace(/:/g, " : ");
  if (b.tur === "qisqart") { const q = qisqartTahlil(b.arg); return q ? `${q.eski[0]}/${q.eski[1]} = ${q.yangi[0]}/${q.yangi[1]}` : ""; }
  return "";
}

const clamp01 = (x) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 1);
/** n-qatorning yozilish darajasi (0..1): u aytilayotgan so'zlar oralig'ida qancha yozilgan. */
export function qatorProgress(cues, n, word, total, finished, uzunlik = Infinity) {
  if (finished) return 1;
  const start = cues?.[n] ?? 0;
  const keyingi = (cues || []).slice(n + 1).find((c) => c > start);
  // qisqa qator uzun gap davomida sudralib yozilmaydi: yozish tezligi — taxminan 2,5 harf bir so'zga
  const end = Math.min(keyingi ?? Math.max(start + 1, total), start + Math.max(2, uzunlik));
  if (word < start) return 0;
  return clamp01((word - start + 1) / Math.max(1, end - start));
}

/** Qatorni yozish uchun ketadigan so'zlar soni (taxminan): oddiy yozuv — ko'rinadigan harflarga qarab, chizma — ko'proq. */
export function yozishSozlari(qator) {
  const tur = qator?.tur || "yoz";
  if (tur === "ish") { const t = ishTahlil(qator.arg); return t ? 18 + t.qadamlar.length * 24 : 14; }
  if (tur === "amal") return 16;   // har qadam (xona) uchun
  if (tur === "ketma") return 10 + String(qator.arg || "").split("|").length * 24;
  if (tur === "elak") return 60;
  if (!["yoz", "qoida", "belgila"].includes(tur)) return tur === "ustun" ? 36 : tur === "bolish" ? 40 : 14;
  const matn = (qator.qismlar || [{ matn: qator.arg }]).map((q) => q.matn).join(" ");
  const korinadi = matn.replace(/\\(frac|cdot|cancel|sqrt|left|right|text|mathrm|quad|,)/g, " ").replace(/[{}$^_\\]/g, "").replace(/\s+/g, " ").trim();
  return Math.max(3, Math.round(korinadi.length / 2.6));
}

// ── ustun bilan hisob ─────────────────────────────────────────────
/** «347+258», «502-178», «46×23» → ustun hisob jadvali. */
export function ustunTahlil(arg) {
  const m = String(arg || "").replace(/\s+/g, "").match(/^(\d{1,9})([+\-−×x*·])(\d{1,9})$/);
  if (!m) return null;
  const a = m[1], b = m[3];
  const op = m[2] === "+" ? "+" : /[-−]/.test(m[2]) ? "−" : "×";
  const A = BigInt(a), B = BigInt(b);
  if (op === "−" && B > A) return null;
  const natija = (op === "+" ? A + B : op === "−" ? A - B : A * B).toString();
  const eslab = {};   // ustun (o'ngdan, 0-dan) → tepaga yoziladigan raqam
  if (op === "+") {
    let c = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const s = Number(a[a.length - 1 - i] || 0) + Number(b[b.length - 1 - i] || 0) + c;
      c = s >= 10 ? 1 : 0;
      if (c) eslab[i + 1] = "1";
    }
  }
  if (op === "−") {
    let q = 0;
    for (let i = 0; i < a.length; i++) {
      const d = Number(a[a.length - 1 - i]) - q - Number(b[b.length - 1 - i] || 0);
      q = d < 0 ? 1 : 0;
      if (q) eslab[i + 1] = "·";
    }
  }
  if (op === "×" && b.length === 1) {   // bir xonali ko'paytuvchi: yodda tutiladigan raqam keyingi xona tepasida
    let c = 0; const d = Number(b);
    for (let i = 0; i < a.length; i++) { const x = Number(a[a.length - 1 - i]) * d + c; c = Math.floor(x / 10); if (c) eslab[i + 1] = String(c); }
  }
  const qismlar = op === "×" && b.length > 1
    ? [...b].reverse().map((d, i) => (BigInt(a) * BigInt(d)).toString() + " ".repeat(i))
    : [];
  const kenglik = Math.max(a.length, b.length + 1, natija.length, ...qismlar.map((x) => x.length)) + 1;
  return { a, b, op, natija, eslab, qismlar, kenglik };
}

// ── burchakli bo'lish ─────────────────────────────────────────────
/** «744:6» → bo'linma va har qadam (olingan son, ayirma, qoldiq). */
export function bolishTahlil(arg) {
  const m = String(arg || "").replace(/\s+/g, "").match(/^(\d{1,9})[:÷/](\d{1,4})$/);
  if (!m || Number(m[2]) === 0) return null;
  const a = m[1], d = Number(m[2]);
  const qadamlar = [];
  let joriy = 0, bolinma = "", boshlandi = false;
  for (let i = 0; i < a.length; i++) {
    joriy = joriy * 10 + Number(a[i]);
    if (!boshlandi && joriy < d && i < a.length - 1) continue;
    boshlandi = true;
    const q = Math.floor(joriy / d);
    bolinma += String(q);
    qadamlar.push({ ustun: i, olingan: joriy, ayir: q * d, qoldiq: joriy - q * d });
    joriy -= q * d;
  }
  return { a, d: String(d), bolinma: bolinma || "0", qoldiq: joriy, qadamlar };
}

// ── kasrni qisqartirish ───────────────────────────────────────────
/** «6/8 -> 3/4 (:2)» yoki «6/8 (:2)» → {eski, yangi, bol}. */
export function qisqartTahlil(arg) {
  const s = String(arg || "").replace(/\s+/g, "");
  const m = s.match(/^(\d+)\/(\d+)(?:(?:->|→|=)(\d+)\/(\d+))?(?:\(:(\d+)\))?$/);
  if (!m) return null;
  const eski = [Number(m[1]), Number(m[2])];
  if (!eski[1]) return null;
  let bol = m[5] ? Number(m[5]) : 0;
  let yangi = m[3] ? [Number(m[3]), Number(m[4])] : null;
  if (!bol && yangi && yangi[0]) bol = eski[0] / yangi[0];
  if (!bol) { const g = (x, y) => (y ? g(y, x % y) : x); bol = g(eski[0], eski[1]); }
  if (!yangi) yangi = [eski[0] / bol, eski[1] / bol];
  if (!Number.isInteger(bol) || bol < 1 || eski[0] / bol !== yangi[0] || eski[1] / bol !== yangi[1]) return null;
  return { eski, yangi, bol };
}

// ── son o'qi ──────────────────────────────────────────────────────
const sonQiymat = (t) => {
  const s = String(t).trim().replace(",", ".").replace("−", "-");
  const k = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  return k ? Number(k[1]) / Number(k[2]) : Number(s);
};
/** «-3..5; nuqta 2; nuqta 1/2 A» → {min, max, qadam, nuqtalar:[{x, yorliq}]}. */
export function sonOqiTahlil(arg) {
  const [oraliq, ...qolgan] = String(arg || "").split(/[;\n]/).map((x) => x.trim()).filter(Boolean);
  const m = String(oraliq || "").replace(/−/g, "-").match(/^(-?\d+)\s*\.\.\s*(-?\d+)(?:\s*(?:qadam|step|шаг)\s*(\d+(?:[.,]\d+)?))?$/i);
  if (!m) return null;
  const min = Number(m[1]), max = Number(m[2]);
  if (!(max > min) || max - min > 40) return null;
  const nuqtalar = [];
  for (const q of qolgan) {
    const p = q.match(/^(?:nuqta|точка|point)\s+(\S+)(?:\s+(.+))?$/i);
    if (!p) continue;
    const x = sonQiymat(p[1]);
    if (Number.isFinite(x) && x >= min && x <= max) nuqtalar.push({ x, yorliq: (p[2] || p[1]).trim() });
  }
  return { min, max, qadam: m[3] ? Number(m[3].replace(",", ".")) : 1, nuqtalar };
}

// ── xavfsiz ifoda hisoblagich (eval yo'q) ─────────────────────────
const FUNKS = { sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, tg: Math.tan, abs: Math.abs, ln: Math.log, log: Math.log10, exp: Math.exp };
/** «x^2-4x+3» → (x) => qiymat. Noto'g'ri ifoda → null. Faqat x, sonlar, + − · / ^, qavslar va FUNKS. */
export function ifodaFunksiya(ifoda) {
  const src = String(ifoda || "").replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/[·×]/g, "*").replace(/\\cdot/g, "*").replace(/,/g, ".")
    .replace(/\\sqrt\{([^{}]+)\}/g, "sqrt($1)").replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "(($1)/($2))").replace(/[{}]/g, (c) => (c === "{" ? "(" : ")"))
    .replace(/\\pi|π/g, "pi").replace(/\\/g, "");
  const tokens = src.match(/\d+(?:\.\d+)?|[a-z]+|[()+\-*/^]/gi);
  if (!tokens || tokens.join("") !== src || src.length > 120) return null;
  let i = 0;
  const peek = () => tokens[i];
  const birlamchi = () => {
    const t = tokens[i++];
    if (t === undefined) throw new Error("oxir");
    if (/^\d/.test(t)) { const v = Number(t); return () => v; }
    if (t === "(") { const e = ifodaP(); if (tokens[i++] !== ")") throw new Error(")"); return e; }
    if (t === "-") { const e = daraja(); return (x) => -e(x); }
    const s = t.toLowerCase();
    if (s === "x") return (x) => x;
    if (s === "pi") return () => Math.PI;
    if (s === "e") return () => Math.E;
    if (FUNKS[s]) { const arg = peek() === "(" ? birlamchi() : daraja(); return (x) => FUNKS[s](arg(x)); }
    // yonma-yon harflar: «xx» kabi — rad etiladi
    throw new Error(`noma'lum: ${t}`);
  };
  const daraja = () => {
    const a = birlamchi();
    if (peek() === "^") { i++; const b = daraja(); return (x) => Math.pow(a(x), b(x)); }
    return a;
  };
  const kopaytma = () => {
    let a = daraja();
    for (;;) {
      const t = peek();
      if (t === "*" || t === "/") { i++; const b = daraja(); const l = a; a = t === "*" ? (x) => l(x) * b(x) : (x) => l(x) / b(x); continue; }
      // yashirin ko'paytirish: 4x, 2(x+1), x(x-1), 3sqrt(x)
      if (t !== undefined && (t === "(" || /^[a-z\d]/i.test(t))) { const b = daraja(); const l = a; a = (x) => l(x) * b(x); continue; }
      return a;
    }
  };
  const ifodaP = () => {
    let a = kopaytma();
    while (peek() === "+" || peek() === "-") { const t = tokens[i++]; const b = kopaytma(); const l = a; a = t === "+" ? (x) => l(x) + b(x) : (x) => l(x) - b(x); }
    return a;
  };
  try {
    const f = ifodaP();
    if (i !== tokens.length) return null;
    return f;
  } catch { return null; }
}

/** «y=x^2-4x+3; [-1;5]» → {ifoda, nuqtalar (bo'laklarga bo'lingan), xmin, xmax, ymin, ymax}. */
export function grafikTahlil(arg) {
  const qism = String(arg || "").split(";").map((x) => x.trim());
  const ifoda = (qism[0] || "").replace(/^y\s*=\s*/i, "").replace(/^f\(x\)\s*=\s*/i, "");
  const f = ifodaFunksiya(ifoda);
  if (!f) return null;
  const or = String(qism.slice(1).join(";")).match(/\[\s*(-?[\d.,]+)\s*[;,]\s*(-?[\d.,]+)\s*\]/) || String(qism[1] || "").match(/(-?[\d.]+)\s*\.\.\s*(-?[\d.]+)/);
  const xmin = or ? Number(String(or[1]).replace(",", ".")) : -5, xmax = or ? Number(String(or[2]).replace(",", ".")) : 5;
  if (!(xmax > xmin)) return null;
  const N = 160, bolaklar = [];
  let cur = [], ymin = Infinity, ymax = -Infinity;
  for (let k = 0; k <= N; k++) {
    const x = xmin + ((xmax - xmin) * k) / N, y = f(x);
    if (!Number.isFinite(y) || Math.abs(y) > 1e6) { if (cur.length > 1) bolaklar.push(cur); cur = []; continue; }
    cur.push([x, y]); ymin = Math.min(ymin, y); ymax = Math.max(ymax, y);
  }
  if (cur.length > 1) bolaklar.push(cur);
  if (!bolaklar.length) return null;
  if (ymax - ymin < 1e-9) { ymin -= 1; ymax += 1; }
  return { ifoda, bolaklar, xmin, xmax, ymin: Math.min(ymin, 0), ymax: Math.max(ymax, 0) };
}

// ── geometrik chizma ──────────────────────────────────────────────
const NUQTA_RE = /([A-Z][₀-₉0-9']*)\s*\(\s*(-?[\d.,]+)\s*[;,]\s*(-?[\d.,]+)\s*\)/g;
/** «uchburchak A(0;0) B(4;0) C(0;3); kesma CH; aylana O(2;1) r=2; balandlik CH» → nuqtalar va shakllar. */
export function chizTahlil(arg) {
  const nuqtalar = {};
  const shakllar = [];
  // «;» koordinatalar ichida ham bor (A(0;0)) — faqat qavsdan tashqaridagisi ajratadi
  for (const bolak of String(arg || "").split(/[;\n](?![^()]*\))/).map((x) => x.trim()).filter(Boolean)) {
    const ichki = [...bolak.matchAll(NUQTA_RE)].map((m) => { nuqtalar[m[1]] = [Number(m[2].replace(",", ".")), Number(m[3].replace(",", "."))]; return m[1]; });
    const soz = bolak.toLowerCase();
    const r = soz.match(/r\s*=\s*([\d.,]+)/);
    if (/^(aylana|окружность|circle)/.test(soz) && ichki.length && r) shakllar.push({ tur: "aylana", markaz: ichki[0], r: Number(r[1].replace(",", ".")) });
    else if (ichki.length >= 3 && /^(uchburchak|to.?rtburchak|ko.?pburchak|kvadrat|to.?g.?ri to.?rtburchak|parallelogramm|romb|trapetsiya|треугольник|четырёхугольник|четырехугольник|многоугольник|квадрат|прямоугольник|triangle|quadrilateral|polygon|square|rectangle)/.test(soz))
      shakllar.push({ tur: "kopburchak", uchlar: ichki });
    else if (/^(kesma|balandlik|mediana|bissektrisa|отрезок|высота|медиана|биссектриса|segment|height|altitude|median|bisector)/.test(soz)) {
      const nom = bolak.replace(NUQTA_RE, "").trim().split(/\s+/).pop() || "";
      const harflar = nom.match(/[A-Z][₀-₉0-9']*/g) || [];
      if (harflar.length === 2) shakllar.push({ tur: "kesma", uchlar: harflar, belgi: /^(balandlik|высота|height|altitude)/.test(soz) ? "tik" : "" });
    } else if (/^(burchak|угол|angle)/.test(soz)) {
      const harflar = (bolak.split(/\s+/)[1] || "").match(/[A-Z]/g) || [];
      if (harflar.length === 3) shakllar.push({ tur: "burchak", uchlar: harflar });
    } else if (ichki.length && /^(nuqta|точка|point)/.test(soz)) shakllar.push({ tur: "nuqtalar", uchlar: ichki });
    else if (ichki.length >= 2) shakllar.push({ tur: "siniq", uchlar: ichki });
  }
  // shakllarda ishlatilgan, lekin koordinatasi yo'q nuqta — chizma bo'lmaydi
  const bor = shakllar.filter((s) => (s.markaz ? nuqtalar[s.markaz] : s.uchlar.every((u) => nuqtalar[u])));
  if (!bor.length) return null;
  const xs = [], ys = [];
  for (const [x, y] of Object.values(nuqtalar)) { xs.push(x); ys.push(y); }
  for (const s of bor) if (s.tur === "aylana") { const [x, y] = nuqtalar[s.markaz]; xs.push(x - s.r, x + s.r); ys.push(y - s.r, y + s.r); }
  return { nuqtalar, shakllar: bor, xmin: Math.min(...xs), xmax: Math.max(...xs), ymin: Math.min(...ys), ymax: Math.max(...ys) };
}

/** «2/3 · 3/4» → yuz modeli: birlik kvadrat ustunlarga va qatorlarga bo'linadi. */
export function kasrModelTahlil(arg) {
  const m = String(arg || "").replace(/\s+/g, "").match(/^(\d{1,2})\/(\d{1,2})[·*×x](\d{1,2})\/(\d{1,2})$/);
  if (!m) return null;
  const [a, b, c, d] = m.slice(1).map(Number);
  if (!b || !d || a > b || c > d || b > 12 || d > 12) return null;
  return { a, b, c, d, surat: a * c, maxraj: b * d };
}

/** «3/8» → doira bo'laklari. */
export function doiraKasrTahlil(arg) {
  const m = String(arg || "").replace(/\s+/g, "").match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!m) return null;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (!b || b > 16 || a > b) return null;
  return { a, b };
}

/** Darsdagi barcha QOIDA qatorlari (shu qadamgacha) — «Esda tut» burchagi uchun. */
export function esdaTut(steps, idx) {
  // REV596: «Esda tut» faqat JORIY bilimning qoidalarini ko'rsatadi; yangi bilim boshlansa oldingilari «eski» ro'yxatga yig'iladi (qayta ochsa bo'ladi)
  let joriy = []; let eski = [];
  for (const s of (steps || []).slice(0, Math.max(0, idx) + 1)) {
    if ((s?.bilim || /^bilim:/i.test(String(s?.sarlavha || ""))) && joriy.length) { eski = [...eski, ...joriy.filter((x) => !eski.includes(x))]; joriy = []; }
    for (const line of String(s?.doska || "").split(/\n+/)) {
      const b = buyruq(line);
      if (b.tur === "qoida" && b.arg && !joriy.includes(b.arg) && !eski.includes(b.arg)) joriy.push(b.arg);
    }
  }
  return { qoidalar: joriy.slice(-4), eski: eski.slice(-12) };
}


// ───────────── REV425: kombinatorika va ehtimol chizmalari (sof qoidalar) ─────────────
export const HARFLAR = ["A", "B", "C", "D", "E", "F", "G", "H"];

/** n! ni qo'yish yo'li bilan qurish: (n−1)! ta tartibning har biriga yangi narsa n xil joyga qo'yiladi.
 *  → [{asos: ["A","B"], yangi: "C", tartiblar: [["C","A","B"], ["A","C","B"], ["A","B","C"]]}] */
export function orinAlmashQurish(n) {
  n = Math.max(1, Math.min(4, Math.trunc(Number(n) || 1)));
  let tartib = [[HARFLAR[0]]];
  if (n === 1) return { n, guruhlar: [{ asos: [], yangi: "A", tartiblar: tartib }], jami: 1 };
  for (let m = 2; m < n; m += 1) {
    const yangi = HARFLAR[m - 1], keyingi = [];
    for (const t of tartib) for (let j = t.length; j >= 0; j -= 1) keyingi.push([...t.slice(0, j), yangi, ...t.slice(j)]);   // AB, BA … tabiiy tartib
    tartib = keyingi;
  }
  const yangi = HARFLAR[n - 1];
  const guruhlar = tartib.map((t) => ({ asos: t, yangi, tartiblar: Array.from({ length: t.length + 1 }, (_, j) => [...t.slice(0, j), yangi, ...t.slice(j)]) }));
  return { n, guruhlar, jami: guruhlar.reduce((a, g) => a + g.tartiblar.length, 0) };
}

const ikkiSon = (arg, maxN, maxK) => {
  const m = String(arg || "").match(/(\d+)\D+(\d+)/);
  if (!m) return null;
  const n = Math.min(maxN, Math.max(1, +m[1])), k = Math.min(maxK, Math.max(1, Math.min(n, +m[2])));
  return { n, k };
};
export const orinlashtirTahlil = (arg) => ikkiSon(arg, 8, 4);
export const guruhlashTahlil = (arg) => ikkiSon(arg, 8, 3);   // k ≤ 3: k! ≤ 6 tartib doskaga sig'adi

/** VENN: «A=12; B=9; AB=4; jami=30» → sonlar (ixtiyoriy yorliqlar) */
export function vennTahlil(arg) {
  const o = {};
  for (const q of String(arg || "").split(/[;,]/)) { const m = q.match(/^\s*([A-Za-z]+)\s*=\s*([\d.,/]+)\s*$/); if (m) o[m[1].toUpperCase()] = m[2]; }
  return o.A || o.B ? o : null;
}

/** DARAXT: «0,6 | 0,4» yoki «0,6 | 0,4 / 0,7 | 0,3» — ikki bosqichli ehtimollar daraxti */
export function daraxtTahlil(arg) {
  const bosqich = String(arg || "").split("/").map((b) => b.split("|").map((x) => x.trim()).filter(Boolean));
  return bosqich[0]?.length >= 2 ? bosqich.slice(0, 2) : null;
}

/** «chap: □ 5 4 | ong: 5 12 | olib: 5 4» → {chap:[..], ong:[..], olib:[..]} (tarozi: teng narsa ikki pallada ham olinadi). */
export function taroziTahlil(arg) {
  const out = { chap: [], ong: [], olib: [] };
  for (const q of String(arg || "").split("|")) {
    const m = q.trim().match(/^(chap|ong|o'ng|olib)\s*:\s*(.+)$/i);
    if (!m) continue;
    const k = /^o/i.test(m[1]) && m[1].toLowerCase() !== "olib" ? "ong" : m[1].toLowerCase();
    out[k] = m[2].trim().split(/\s+/);
  }
  return out.chap.length && out.ong.length ? out : null;
}


// ── ISH: tartibli hisob (REV587) ──────────────────────────────────
// «72 : (2 + 4) · 3 − 5» → amallar bajarilish tartibida raqamlanadi; har «ish»: qismi hisoblanadi va natija o'rniga qo'yilib misol qayta yoziladi.
// Qoida: eng ichki (chapdagi) qavs → ko'paytirish/bo'lish (chapdan o'ngga) → qo'shish/ayirish (chapdan o'ngga). Faqat butun sonlar; bo'linmasa — null.
const OP_BELGI = { "+": "+", "-": "−", "−": "−", "*": "·", "×": "·", "·": "·", "x": "·", ":": ":", "÷": ":", "/": ":" };
const QAVS_OCH = { "(": ")", "[": "]", "{": "}" };
const QAVS_YOP = new Set([")", "]", "}"]);
export function ishTahlil(arg) {
  const src = String(arg || "").replace(/\s+/g, "");
  if (!src || src.length > 80) return null;
  let id = 0; const tok = [];
  for (let i = 0; i < src.length;) {
    const c = src[i];
    if (/\d/.test(c)) { let j = i; while (j < src.length && /\d/.test(src[j])) j++; tok.push({ t: "n", v: BigInt(src.slice(i, j)), id: id++ }); i = j; }
    else if (OP_BELGI[c]) { tok.push({ t: "o", v: OP_BELGI[c], id: id++ }); i++; }
    else if (QAVS_OCH[c]) { tok.push({ t: "(", v: c, id: id++ }); i++; }
    else if (QAVS_YOP.has(c)) { tok.push({ t: ")", v: c, id: id++ }); i++; }
    else return null;
  }
  const yoz = (a) => a.map((x) => (x.t === "n" ? String(x.v) : x.v)).join(" ").replace(/\( /g, "(").replace(/ \)/g, ")").replace(/\[ /g, "[").replace(/ \]/g, "]").replace(/\{ /g, "{").replace(/ \}/g, "}");
  const boshlang = tok.map((x) => ({ ...x }));
  let a = tok.map((x) => ({ ...x }));
  const qadamlar = []; const tartib = {};
  const qavsTozala = () => { let oz = true; while (oz) { oz = false; for (let i = 0; i + 2 < a.length; i++) if (a[i].t === "(" && a[i + 1].t === "n" && a[i + 2].t === ")") { a.splice(i + 2, 1); a.splice(i, 1); oz = true; break; } } };
  for (let guard = 0; guard < 40; guard++) {
    qavsTozala();
    if (a.length === 1 && a[0].t === "n") break;
    // eng ichki chap qavs oralig'i
    let lo = 0, hi = a.length, ichki = false;
    for (let i = 0; i < a.length; i++) if (a[i].t === "(") { lo = i + 1; ichki = true; }
    if (ichki) { hi = a.findIndex((x, i) => i >= lo && x.t === ")"); if (hi < 0) return null; }
    const seg = a.slice(lo, hi);
    if (seg.some((x) => x.t === "(" || x.t === ")")) return null;
    let k = seg.findIndex((x) => x.t === "o" && (x.v === "·" || x.v === ":"));
    if (k < 0) k = seg.findIndex((x) => x.t === "o");
    if (k < 1 || k + 1 >= seg.length || seg[k - 1].t !== "n" || seg[k + 1].t !== "n") return null;
    const x = seg[k - 1].v, y = seg[k + 1].v, o = seg[k].v;
    let r;
    if (o === "+") r = x + y; else if (o === "−") r = x - y; else if (o === "·") r = x * y;
    else { if (y === 0n || x % y !== 0n) return null; r = x / y; }
    if (r < 0n) return null;
    const qism = `${x} ${o} ${y}`;
    tartib[seg[k].id] = qadamlar.length + 1;
    const oldin = a.map((x) => ({ ...x })), ishl = [seg[k - 1].id, seg[k].id, seg[k + 1].id];
    const yangiId = id++;
    a.splice(lo + k - 1, 3, { t: "n", v: r, id: yangiId, yangi: true });
    qavsTozala();
    qadamlar.push({ qism, natija: String(r), ifoda: yoz(a), orin: qadamlar.length + 1, _oldin: oldin, _ishl: ishl, _keyin: a.map((x) => ({ ...x })), _yangi: yangiId });
  }
  if (!(a.length === 1 && a[0].t === "n") || !qadamlar.length) return null;
  const kor = (x) => ({ t: x.t, s: x.t === "n" ? String(x.v) : x.v, k: x.t === "o" ? tartib[x.id] || 0 : 0, id: x.id });
  // holatlar[0] — boshlang'ich misol; holatlar[i] — i-ishdan keyin. Har qadamda: qaysi tokenlar ishlatildi (oldingi holatda), yangi natija qaerga tushdi (keyingi holatda).
  const holatlar = [boshlang.map(kor)];
  qadamlar.forEach((q) => {
    const oldHolat = holatlar[holatlar.length - 1];
    q.ishlatilgan = oldHolat.map((x, i) => (q._ishl.includes(x.id) ? i : -1)).filter((i) => i >= 0);
    const yangi = q._keyin.map(kor);
    q.yangiIndeks = yangi.findIndex((x) => x.id === q._yangi);
    holatlar.push(yangi);
    delete q._oldin; delete q._ishl; delete q._keyin; delete q._yangi;
  });
  return { boshlang: yoz(boshlang), tokenlar: holatlar[0], holatlar, qadamlar, javob: String(a[0].v) };
}

// ── KETMA: tenglik zanjiri — «21·18 − 19·18 | [18]·(21 − 19) | [18]·2 | 36» (qavs [..] ichi rang bilan ajratiladi) ──
export function ketmaTahlil(arg) {
  const q = String(arg || "").split("|").map((x) => x.trim()).filter(Boolean);
  return q.length >= 2 ? q : null;
}

// ── ELAK: Eratosfen g'alviri — «50» → 2..n jadvali, tub sonlar ketma-ket ajratilib, murakkablari o'chiriladi ──
export function elakTahlil(arg) {
  const n = Math.round(Number(String(arg || "").replace(/[^\d]/g, "")));
  if (!(n >= 10 && n <= 100)) return null;
  const tub = []; const ochgan = {};
  const bor = Array(n + 1).fill(true);
  for (let i = 2; i <= n; i++) {
    if (!bor[i]) continue;
    tub.push(i);
    for (let j = i * i; j <= n; j += i) if (bor[j]) { bor[j] = false; ochgan[j] = i; }
  }
  const asosiy = tub.filter((p) => p * p <= n);
  return { n, tub, ochgan, asosiy };
}


// ── AMAL: qo'shish / ayirish — xona-xona (qadam-baqadam, ovozga mos); ayirishda qarz olingan raqam o'chiriladi, yangisi yoziladi ──
/** «25+27» / «6240-3857» → {a, b, op, W, qadamlar:[{col, da, db, res, yodda, mods:[{col, eski, yangi}], qarz}], natija}. Boshqa amal — null. */
export function amalTahlil(arg) {
  const m = String(arg || "").replace(/\s+/g, "").match(/^(\d{1,9})([+\-−])(\d{1,9})$/);
  if (!m) return null;
  const a = m[1], b = m[3], op = m[2] === "+" ? "+" : "−";
  if (op === "−" && BigInt(b) > BigInt(a)) return null;
  const n = Math.max(a.length, b.length);
  const dg = (x, i) => (i < x.length ? Number(x[x.length - 1 - i]) : null);
  const qadamlar = [];
  if (op === "+") {
    let c = 0;
    for (let i = 0; i < n; i++) { const da = dg(a, i), db = dg(b, i); const sum = (da || 0) + (db || 0) + c;
      qadamlar.push({ col: i, da, db, kirdi: c, sum, res: sum % 10, yodda: sum >= 10 ? 1 : 0, mods: [] }); c = sum >= 10 ? 1 : 0; }
    if (c) qadamlar.push({ col: n, da: null, db: null, kirdi: c, sum: c, res: c, yodda: 0, mods: [], oxirgi: true });
  } else {
    const cur = Array.from({ length: a.length }, (_, i) => dg(a, i));
    for (let i = 0; i < a.length; i++) { const db = dg(b, i) || 0; const mods = []; let qarz = false;
      if (cur[i] < db) {
        let k = i + 1; while (k < cur.length && cur[k] === 0) k++;
        for (let j = k; j > i; j--) { const eski = cur[j]; cur[j] = j === k ? eski - 1 : 9; mods.push({ col: j, eski, yangi: cur[j] }); }
        cur[i] += 10; qarz = true;
      }
      qadamlar.push({ col: i, da: dg(a, i), top: cur[i], db: dg(b, i), res: cur[i] - db, mods, qarz }); }
  }
  const natija = (op === "+" ? BigInt(a) + BigInt(b) : BigInt(a) - BigInt(b)).toString();
  if (op === "−") qadamlar.length = Math.min(qadamlar.length, natija.length);   // bosh nollar uchun qadam yo'q
  return { a, b, op, W: Math.max(n, natija.length), qadamlar, natija };
}
