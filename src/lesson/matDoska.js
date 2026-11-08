// REV269: MATEMATIKA JONLI DOSKASI — sof qoidalar (brauzersiz sinaladi).
// Ustoz gapirayotganda doska qatori qo'lda yozilayotgandek ochiladi; qator boshidagi buyruq (USTUN:, QISQART:, GRAFIK: …)
// maxsus chizma bo'lib chiziladi. Buyruqlar miyaning «Doskaga yoziladi» va «Yechim» kataklarida yoziladi.

import { eskiAlifbo } from "../interface/yangiAlifbo.js";

export const MATEM_RE = /matem|algebr|geometr|математ|алгебр|геометр|\bmath|stereometr|стереометр/i;
export const matRejim = (fan) => MATEM_RE.test(String(fan || ""));

const BUYRUQLAR = ["YOZ", "DAVOM", "QOIDA", "BELGILA", "USTUN", "BOLISH", "QISQART", "SON_OQI", "GRAFIK", "CHIZ", "KASR_MODEL", "DOIRA_KASR", "OCHIR",
  "ORIN_ALMASH", "ORINLASHTIR", "GURUHLASH", "VENN", "DARAXT", "OYIN"];   // REV429: OYIN — doskadagi o'yin   // REV425: formulaning kelib chiqishi — harakatli chizmalar
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
  if (!["yoz", "qoida", "belgila"].includes(tur)) return tur === "ustun" || tur === "bolish" ? 18 : 14;
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
  const out = [];
  for (const s of (steps || []).slice(0, Math.max(0, idx) + 1)) {
    for (const line of String(s?.doska || "").split(/\n+/)) {
      const b = buyruq(line);
      if (b.tur === "qoida" && b.arg && !out.includes(b.arg)) out.push(b.arg);
    }
  }
  return out.slice(-4);
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
