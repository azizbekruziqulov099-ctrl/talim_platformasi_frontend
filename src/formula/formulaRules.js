// REV557: formulalar — yozish, ko'rsatish va TEKSHIRISH (sof funksiyalar, brauzersiz sinaladi).
// O'quvchi formulani belgilar klaviaturasidan yozadi (chiziqli matn): S=a^2 · sqrt(a^2+b^2) · (a+b)/2 · sin^2(x)+cos^2(x)=1 · 2πr.
// Tekshiruv MATNNI emas, MA'NONI solishtiradi: formula tahlil qilinadi va tasodifiy qiymatlarda hisoblanadi.
//   «S=a^2» ≡ «S=a·a» ≡ «a^2=S»;  «sin²x+cos²x=1» ≡ «sin²x=1−cos²x»;  lekin «1=1», «S=a^3», «S=2a» — xato.

const FUNKSIYALAR = { sin: Math.sin, cos: Math.cos, tg: Math.tan, tan: Math.tan, ctg: (x) => 1 / Math.tan(x), cot: (x) => 1 / Math.tan(x), ln: Math.log, lg: Math.log10, sqrt: Math.sqrt };
const FUNK_NOMI = Object.keys(FUNKSIYALAR).sort((a, b) => b.length - a.length);
const BELGI = { "·": "*", "×": "*", "∙": "*", "⋅": "*", "−": "-", "–": "-", "—": "-", ":": "/", "÷": "/", "√": "sqrt", "²": "^2", "³": "^3", "⁴": "^4", ",": "." };

/** Matn → belgilar ro'yxati. Xato belgida { xato } qaytaradi. */
export function belgilarga(matn) {
  let s = String(matn ?? "").replace(/[·×∙⋅−–—:÷√²³⁴,]/g, (c) => BELGI[c]).replace(/\s+/g, "");
  s = s.replace(/π/g, "pi");
  const out = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j += 1; const t = s.slice(i, j); if ((t.match(/\./g) || []).length > 1 || t === ".") return { xato: "son" }; out.push({ t: "son", v: Number(t) }); i = j; continue; }
    if (/[A-Za-zα-ωΑ-Ω]/.test(c)) {
      if (s.startsWith("pi", i)) { out.push({ t: "pi" }); i += 2; continue; }
      const f = FUNK_NOMI.find((n) => s.startsWith(n, i));
      if (f) { out.push({ t: "f", v: f === "tan" ? "tg" : f === "cot" ? "ctg" : f }); i += f.length; continue; }
      out.push({ t: "x", v: c }); i += 1; continue;   // har harf — alohida o'zgaruvchi: «ab» = a·b; katta-kichik farq qiladi (S ≠ s)
    }
    if ("+-*/^()=".includes(c)) { out.push({ t: c }); i += 1; continue; }
    return { xato: "belgi", belgi: c };
  }
  return out;
}

/** Belgilar → daraxt. Grammatika: tenglama := ifoda ('=' ifoda)?; yashirin ko'paytirish (2a, ab, 2πr, a(b+c)) qo'llanadi. */
export function tahlil(matn) {
  const b = belgilarga(matn); if (b.xato) return { xato: b.xato, belgi: b.belgi };
  let p = 0; const kor = () => b[p]; const ol = (t) => (b[p] && b[p].t === t ? b[p++] : null);
  const boshlaydi = (x) => x && (x.t === "son" || x.t === "x" || x.t === "pi" || x.t === "f" || x.t === "(");
  function birlamchi() {
    const x = kor(); if (!x) throw new Error("tugallanmagan");
    if (ol("(")) { const e = ifoda(); if (!ol(")")) throw new Error("qavs"); return e; }
    if (x.t === "son") { p += 1; return { n: "son", v: x.v }; }
    if (x.t === "pi") { p += 1; return { n: "pi" }; }
    if (x.t === "x") { p += 1; return { n: "x", v: x.v }; }
    if (x.t === "f") {
      p += 1; let daraja = null;
      if (ol("^")) daraja = unar();                       // sin^2(x) — funksiyaning darajasi
      let arg;
      if (ol("(")) { arg = ifoda(); if (!ol(")")) throw new Error("qavs"); } else arg = darajali();   // «sin x», «sin 2x» emas: «sin x» — bitta ko'paytuvchi
      const f = { n: "f", v: x.v, a: arg };
      return daraja ? { n: "^", a: f, b: daraja } : f;
    }
    throw new Error("kutilmagan");
  }
  function unar() { if (ol("-")) return { n: "neg", a: unar() }; if (ol("+")) return unar(); return birlamchi(); }
  function darajali() { const a = unar(); if (ol("^")) return { n: "^", a, b: darajali() }; return a; }
  function kopaytma() {
    let a = darajali();
    for (;;) {
      if (ol("*")) a = { n: "*", a, b: darajali() };
      else if (ol("/")) a = { n: "/", a, b: darajali() };
      else if (boshlaydi(kor())) a = { n: "*", a, b: darajali(), yashirin: true };
      else return a;
    }
  }
  function ifoda() { let a = kopaytma(); for (;;) { if (ol("+")) a = { n: "+", a, b: kopaytma() }; else if (ol("-")) a = { n: "-", a, b: kopaytma() }; else return a; } }
  try {
    const chap = ifoda(); let ong = null;
    if (ol("=")) ong = ifoda();
    if (p < b.length) return { xato: b[p].t === "=" ? "tenglik" : "kutilmagan" };
    return { chap, ong };
  } catch (e) { return { xato: e.message }; }
}

/** Daraxt → LaTeX (KaTeX uchun). */
export function latex(d) {
  if (!d) return "";
  const q = (x) => (x.n === "+" || x.n === "-" || x.n === "neg" ? `\\left(${latex(x)}\\right)` : latex(x));
  switch (d.n) {
    case "son": return String(d.v).replace(".", "{,}");
    case "pi": return "\\pi ";
    case "x": return d.v;
    case "neg": return `-${q(d.a)}`;
    case "+": return `${latex(d.a)}+${latex(d.b)}`;
    case "-": return `${latex(d.a)}-${d.b.n === "+" || d.b.n === "-" ? `\\left(${latex(d.b)}\\right)` : latex(d.b)}`;
    case "*": { const a = q(d.a), b = q(d.b); return d.yashirin && d.b.n !== "son" ? `${a}${b}` : `${a}\\cdot ${b}`; }
    case "/": return `\\frac{${latex(d.a)}}{${latex(d.b)}}`;
    case "^": if (d.a.n === "f" && d.a.v !== "sqrt") return `\\${FN_LATEX[d.a.v]}^{${latex(d.b)}}${argLatex(d.a.a)}`;
      return `${["son", "x", "pi"].includes(d.a.n) ? latex(d.a) : `\\left(${latex(d.a)}\\right)`}^{${latex(d.b)}}`;
    case "f": return d.v === "sqrt" ? `\\sqrt{${latex(d.a)}}` : `\\${FN_LATEX[d.v]}${argLatex(d.a)}`;
    default: return "";
  }
}
const FN_LATEX = { sin: "sin", cos: "cos", tg: "operatorname{tg}", ctg: "operatorname{ctg}", ln: "ln", lg: "lg" };
const argLatex = (a) => (["x", "son", "pi"].includes(a.n) ? ` ${latex(a)}` : `\\left(${latex(a)}\\right)`);
/** Matn → LaTeX. Tahlil bo'lmasa (hali yozilyapti) — bo'sh satr. */
export function matnLatex(matn) { const t = tahlil(matn); if (t.xato) return ""; return t.ong ? `${latex(t.chap)}=${latex(t.ong)}` : latex(t.chap); }

// ───────── hisoblash ─────────
function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function xesh(s) { let h = 2166136261; for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/** Daraxtni hisoblaydi. muhit: { ozg: {harf: qiymat}, atom: null | urug' }.
 *  atom berilsa — har funksiya qo'llanishi (sin x, cos x …) MUSTAQIL belgi sifatida olinadi: qiymati (funksiya, argument qiymati)dan
 *  tasodifiy. Shunda «sin²x+cos²x=1» ayniyati «1=1» bilan bir xil bo'lib qolmaydi (pastga qarang). √ har doim haqiqiy hisoblanadi. */
export function hisobla(d, muhit) {
  const h = (x) => hisobla(x, muhit);
  switch (d.n) {
    case "son": return d.v;
    case "pi": return Math.PI;
    case "x": return muhit.ozg[d.v];
    case "neg": return -h(d.a);
    case "+": return h(d.a) + h(d.b);
    case "-": return h(d.a) - h(d.b);
    case "*": return h(d.a) * h(d.b);
    case "/": return h(d.a) / h(d.b);
    case "^": return Math.pow(h(d.a), h(d.b));
    case "f": { const a = h(d.a);
      if (muhit.atom != null && d.v !== "sqrt") return 0.4 + 1.7 * mulberry(xesh(`${muhit.atom}|${d.v}|${a.toFixed(9)}`))();
      return FUNKSIYALAR[d.v](a); }
    default: return NaN;
  }
}
export function harflar(d, to = new Set()) { if (!d) return to; if (d.n === "x") to.add(d.v); if (d.a) harflar(d.a, to); if (d.b) harflar(d.b, to); return to; }
function funksiyalar(d, to = new Set()) { if (!d) return to; if (d.n === "f" && d.v !== "sqrt") to.add(d.v); if (d.a) funksiyalar(d.a, to); if (d.b) funksiyalar(d.b, to); return to; }
/** Tomon «yoyilganmi» yoki «ko'paytuvchili»mi: yig'indi ko'paytma/daraja ICHIDA turgan bo'lsa — ko'paytuvchili. */
function shakl(d, ichida = false) {
  if (!d) return "sodda";
  if ((d.n === "+" || d.n === "-") && ichida) return "kopaytuvchili";
  const ich = ichida || d.n === "*" || d.n === "^" || d.n === "/";
  for (const k of ["a", "b"]) if (d[k] && shakl(d[k], d.n === "f" ? false : ich) === "kopaytuvchili") return "kopaytuvchili";
  return d.n === "+" || d.n === "-" ? "yigindi" : "sodda";
}
const yaqin = (a, b) => Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));

/** n ta tasodifiy nuqta: har harfga [0.6; 2.4] oralig'idan musbat qiymat (ildiz va bo'lish xavfsiz bo'lsin). */
function nuqtalar(harfSet, n, urug) { const r = mulberry(urug); return Array.from({ length: n }, () => Object.fromEntries([...harfSet].sort().map((h) => [h, 0.6 + 1.8 * r()]))); }

/**
 * O'quvchi javobi kutilgan formulaga TENGmi. → { togri: bool, sabab: "" | "bosh" | "sintaksis" | "tenglik_yoq" | "boshqa" | "arzimas" | "harf" }
 * 1) Kutilgan tenglama o'zi ayniyat bo'lmasa (S=a², c²=a²+b², sin²x+cos²x=1 — funksiyalar mustaqil belgi deb olinganda):
 *    javobdagi (chap − o'ng) kutilgandagi (chap − o'ng)ga O'ZGARMAS songa ko'paytirilgan holda teng bo'lishi kerak.
 * 2) Kutilgan — sof algebraik ayniyat ((a+b)²=a²+2ab+b²): javobning ikki tomoni kutilganning ikki tomoniga (istalgan tartibda) teng
 *    funksiya bo'lishi va tomonlar shakli (ko'paytuvchili / yoyilgan) mos kelishi kerak — «(a+b)²=(a+b)²» o'tmaydi.
 */
export function formulaTeng(javob, kutilgan, { urug = 20261114 } = {}) {
  if (!String(javob ?? "").trim()) return { togri: false, sabab: "bosh" };
  const j = tahlil(javob), k = tahlil(kutilgan);
  if (k.xato) throw new Error(`kutilgan formula noto'g'ri yozilgan: ${kutilgan}`);
  if (j.xato) return { togri: false, sabab: "sintaksis" };
  if (Boolean(j.ong) !== Boolean(k.ong)) return { togri: false, sabab: "tenglik_yoq" };
  const hk = harflar(k.chap), hj = harflar(j.chap); if (k.ong) { harflar(k.ong, hk); harflar(j.ong, hj); }
  if ([...hj].some((h) => !hk.has(h))) return { togri: false, sabab: "harf" };          // formulada yo'q harf ishlatilgan (masalan s o'rniga S)
  const N = nuqtalar(hk, 14, urug);
  if (!k.ong) {   // tenglamasiz ifoda: qiymatlar hamma nuqtada teng
    const ok = N.every((o) => { const a = hisobla(j.chap, { ozg: o }), b = hisobla(k.chap, { ozg: o }); return Number.isFinite(a) && Number.isFinite(b) && yaqin(a, b); });
    return { togri: ok, sabab: ok ? "" : "boshqa" };
  }
  const farq = (t, o, atom) => hisobla(t.chap, { ozg: o, atom }) - hisobla(t.ong, { ozg: o, atom });
  const dk = N.map((o, i) => farq(k, o, i + 1)), dj = N.map((o, i) => farq(j, o, i + 1));
  if (dj.some((x) => !Number.isFinite(x))) return { togri: false, sabab: "boshqa" };
  const ayniyat = dk.every((x) => Math.abs(x) < 1e-9);
  if (!ayniyat) {
    if (dj.every((x) => Math.abs(x) < 1e-9)) return { togri: false, sabab: "arzimas" };   // «1=1», «a=a» — har doim to'g'ri, lekin formula emas
    const nisbat = dj[0] / dk[0];
    const ok = Number.isFinite(nisbat) && Math.abs(nisbat) > 1e-9 && dj.every((x, i) => yaqin(x, nisbat * dk[i]));
    // haqiqiy (mustaqil belgisiz) qiymatlarda ham tekshiramiz: funksiyali formulada argumentlar mos bo'lsin
    return { togri: ok, sabab: ok ? "" : "boshqa" };
  }
  // sof algebraik ayniyat
  const qiymat = (d) => N.map((o) => hisobla(d, { ozg: o }));
  const teng = (a, b) => a.every((x, i) => Number.isFinite(x) && yaqin(x, b[i]));
  const [jc, jo, kc, ko] = [j.chap, j.ong, k.chap, k.ong].map(qiymat);
  if (!((teng(jc, kc) && teng(jo, ko)) || (teng(jc, ko) && teng(jo, kc)))) return { togri: false, sabab: "boshqa" };
  const sh = (t) => [shakl(t.chap), shakl(t.ong)].sort().join("|");
  if (sh(j) !== sh(k) || JSON.stringify(j.chap) === JSON.stringify(j.ong)) return { togri: false, sabab: "arzimas" };
  if ([...funksiyalar(k.chap), ...funksiyalar(k.ong)].some((f) => !funksiyalar(j.chap).has(f) && !funksiyalar(j.ong).has(f))) return { togri: false, sabab: "boshqa" };
  return { togri: true, sabab: "" };
}

export const SABAB_MATNI = {
  bosh: "Formulani yozing.",
  sintaksis: "Formula oxirigacha yozilmagan yoki qavs yopilmagan.",
  tenglik_yoq: "Formulada «=» belgisi bo‘lishi kerak.",
  harf: "Formulada boshqa harf ishlatilgan. Harflarning katta-kichikligiga e’tibor bering.",
  arzimas: "Bu tenglik har doim to‘g‘ri, lekin so‘ralgan formula emas.",
  boshqa: "Bu formula so‘ralganiga teng emas.",
};

// ───────── klaviatura va jonli ko'rinish ─────────
/** Yozilayotgan (hali tugallanmagan) matnni ko'rsatish: ochiq qavslar yopiladi, oxiridagi amal vaqtincha tashlanadi. Bo'lmasa — "". */
export function jonliLatex(matn) {
  let s = String(matn ?? "");
  for (let urin = 0; urin < 6 && s; urin += 1) {
    const ochiq = (s.match(/\(/g) || []).length - (s.match(/\)/g) || []).length;
    const nomzod = s + ")".repeat(Math.max(0, ochiq));
    const l = matnLatex(nomzod);
    if (l) return l;
    // oxiridagi tugallanmagan bo'lak tashlanadi: «…+cos^2(», «…·sqrt(», «…^(», «…+», «…sin»
    const yangi = s.replace(/((?:sin|cos|ctg|tg)(?:\^\d*)?\(?|sqrt\(?|\^\(|[-+*/^=(.])$/, "");
    if (yangi === s) break;
    s = yangi;
  }
  return "";
}

/** Formulani yozish uchun kerakli harflar (shu formuladagilar + chalg'ituvchi bir necha harf) — tartiblangan. */
export function klaviaturaHarflari(javoblar, qoshimcha = 3) {
  const kerak = new Set();
  for (const j of javoblar) { const t = tahlil(j); if (t.xato) continue; harflar(t.chap, kerak); if (t.ong) harflar(t.ong, kerak); }
  const hovuz = ["a", "b", "c", "h", "r", "x", "n", "m", "S", "P", "V", "d", "t", "y"].filter((h) => !kerak.has(h));
  const urug = xesh(javoblar.join("|")); const r = mulberry(urug); const olingan = [];
  while (olingan.length < qoshimcha && hovuz.length) olingan.push(hovuz.splice(Math.floor(r() * hovuz.length), 1)[0]);
  return [...kerak, ...olingan].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()) || (a < b ? 1 : -1));
}
/** Formulada trigonometriya / π / ildiz bormi — klaviaturada shunga mos tugmalar chiqadi. */
export function formulaBelgilari(javoblar) {
  const s = javoblar.join(" ");
  return { trig: /sin|cos|tg/.test(s), pi: /π|pi/.test(s), ildiz: /sqrt|√/.test(s) };
}
/** Bir necha qabul qilinadigan shakldan birortasiga tengmi. → { togri, sabab } (xato bo'lsa — birinchi shakl bo'yicha sabab). */
export function javobTekshir(javob, javoblar) {
  let birinchi = null;
  for (const k of javoblar) { const r = formulaTeng(javob, k); if (r.togri) return r; birinchi = birinchi || r; }
  return birinchi || { togri: false, sabab: "boshqa" };
}
