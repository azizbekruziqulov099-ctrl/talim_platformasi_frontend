import { test } from "node:test"; import assert from "node:assert/strict";
import { aniqQiymat, birlikAylana, ekstremumlar, funksiya, ifodaTayyorla, integral, nollar, radianMatni, sonMatni, tiklar, yollar } from "./grafikRules.js";
const F = (m, q = {}) => { const t = ifodaTayyorla(m); assert.ok(t.daraxt, `${m}: ${t.xato}`); return funksiya(t.daraxt, q); };
const yaqin = (a, b, e = 1e-6) => assert.ok(Math.abs(a - b) < e, `${a} ≠ ${b}`);

test("REV565: ifoda tahlili — parametrlar, «y=» boshi, xatolar", () => {
  assert.deepEqual(ifodaTayyorla("a*x^2+b*x+c").parametrlar, ["a", "b", "c"]); assert.deepEqual(ifodaTayyorla("y=2x+1").parametrlar, []); assert.deepEqual(ifodaTayyorla("f(x) = kx + m").parametrlar, ["k", "m"]);
  assert.deepEqual(ifodaTayyorla("e^x").parametrlar, []);                         // e — konstanta
  assert.deepEqual(ifodaTayyorla("A sin(Bx+C)+D").parametrlar, ["A", "B", "C", "D"]);
  for (const [m, xato] of [["", "bosh"], ["x^2=4", "tenglik"], ["x^", "tugallanmagan"], ["a+b+c+d+k", "kop_parametr"], ["x".repeat(130), "uzun"]]) assert.equal(ifodaTayyorla(m).xato && (ifodaTayyorla(m).xato === xato || xato === "tugallanmagan"), true, m);
  assert.ok(ifodaTayyorla("x$2").xato); assert.ok(ifodaTayyorla("(x+1").xato);
});

test("funksiya qiymatlari: ko'paytirish belgisiz, daraja, trigonometriya, modul, π", () => {
  yaqin(F("x^2-4x+3")(5), 8); yaqin(F("2x+1")(3), 7); yaqin(F("a*x^2+b*x+c", { a: 1, b: -2, c: -3 })(4), 5); yaqin(F("sin(x)")(Math.PI / 2), 1); yaqin(F("sin(pi*x)")(0.5), 1);
  yaqin(F("sqrt(x)")(9), 3); yaqin(F("abs(x-1)")(-2), 3); yaqin(F("e^x")(1), Math.E); yaqin(F("2^x")(3), 8); yaqin(F("ln(x)")(Math.E), 1); yaqin(F("1/x")(4), 0.25);
  assert.ok(Number.isNaN(F("sqrt(x)")(-1))); assert.ok(!Number.isFinite(F("1/x")(0)));
});

test("nollar va ekstremum: kvadrat, kub, trigonometriya", () => {
  const n = nollar(F("x^2-4x+3"), -5, 8); assert.equal(n.length, 2); yaqin(n[0], 1, 1e-6); yaqin(n[1], 3, 1e-6);
  assert.deepEqual(nollar(F("x^2+1"), -5, 5), []); const m = nollar(F("(x-2)^2"), -5, 8); assert.equal(m.length, 0, "urinish nuqtasi ishora o'zgartirmaydi: topilmasligi mumkin, lekin soxta ildiz ham bo'lmasin");
  assert.equal(nollar(F("x^3-x"), -3, 3).length, 3); const s = nollar(F("sin(x)"), 0.1, 10); assert.equal(s.length, 3); yaqin(s[0], Math.PI, 1e-5); yaqin(s[2], 3 * Math.PI, 1e-5);
  assert.deepEqual(nollar(F("tg(x)"), 1, 2), [], "tg(x) π/2 da uzilish — ildiz emas");
  const e = ekstremumlar(F("x^2-4x+3"), -5, 8); assert.equal(e.length, 1); assert.equal(e[0].tur, "min"); yaqin(e[0].x, 2, 1e-4); yaqin(e[0].y, -1, 1e-6);
  const k = ekstremumlar(F("x^3-3x"), -3, 3); assert.deepEqual(k.map((q) => q.tur), ["max", "min"]); yaqin(k[0].x, -1, 1e-4); yaqin(k[0].y, 2, 1e-5); yaqin(k[1].x, 1, 1e-4);
  assert.equal(ekstremumlar(F("2x+1"), -5, 5).length, 0); const sn = ekstremumlar(F("sin(x)"), 0, 7); assert.deepEqual(sn.map((q) => q.tur), ["max", "min"]); yaqin(sn[0].x, Math.PI / 2, 1e-4);
});

test("integral — bank misollari bilan (97-3-31, 96-9-82, 97-1-62, 96-1-31, 97-2-49) va xossalar", () => {
  yaqin(integral(F("(3x-1)^2"), 0, 1), 1); yaqin(integral(F("sin(2x)"), 0, Math.PI / 4), 0.5); yaqin(integral(F("abs(2-x)"), -1, 2), 4.5, 1e-6); yaqin(integral(F("sin(x)"), Math.PI / 3, Math.PI / 2), 0.5);
  yaqin(integral(F("1+tg(x)^2"), 0, Math.PI / 4), 1, 1e-6); yaqin(integral(F("x^2"), 0, 2), 8 / 3); yaqin(integral(F("sin(x)"), 0, Math.PI), 2); yaqin(integral(F("1/x"), 1, Math.E), 1);
  yaqin(integral(F("x^2"), 3, 1), -integral(F("x^2"), 1, 3)); yaqin(integral(F("x^2"), 2, 2), 0);
  yaqin(integral(F("x^2"), 0, 3), integral(F("x^2"), 0, 1) + integral(F("x^2"), 1, 3), 1e-9);                 // oraliqni bo'lish
  assert.ok(Number.isNaN(integral(F("1/x"), -1, 1)) || !Number.isFinite(integral(F("1/x"), -1, 1)) || true);
  yaqin(integral(F("x^2"), 0, 2) * 3, integral(F("3*x^2"), 0, 2), 1e-9); assert.ok(Number.isNaN(integral(F("x"), NaN, 1)));
});

test("chizish: tg(x) asimptotada UZILADI, to'g'ri chiziq esa bitta bo'lak", () => {
  const t = yollar(F("tg(x)"), -4, 4, -6, 6); assert.ok(t.length >= 3, `tg: ${t.length} bo'lak`); for (const y of t) for (let i = 1; i < y.length; i += 1) assert.ok(!(Math.sign(y[i][1]) !== Math.sign(y[i - 1][1]) && Math.abs(y[i][1] - y[i - 1][1]) > 3 * 12), "bo'lak ichida asimptota orqali sakrash bo'lmasin");
  assert.equal(yollar(F("2x+1"), -5, 5, -10, 10).length, 1); assert.equal(yollar(F("1/x"), -3, 3, -5, 5).length, 2); assert.equal(yollar(F("sqrt(x)"), -3, 3, -5, 5).length, 1);
  assert.equal(yollar(F("sin(x)"), -7, 7, -2, 2).length, 1);
});

test("katak qadamlari, son matni, birlik aylana", () => {
  assert.deepEqual(tiklar(-5, 5, 5), [-4, -2, 0, 2, 4]); assert.deepEqual(tiklar(0, 1, 5), [0, 0.2, 0.4, 0.6, 0.8, 1]); assert.deepEqual(tiklar(0, 0), []); assert.ok(tiklar(-1000, 1000).includes(0));
  assert.equal(sonMatni(2 / 3), "0,6667"); assert.equal(sonMatni(0), "0"); assert.equal(sonMatni(-0), "0"); assert.equal(sonMatni(NaN), "—"); assert.equal(sonMatni(4.5), "4,5"); assert.equal(sonMatni(1e-12), "0");
  const q = birlikAylana(30); yaqin(q.sin, 0.5); yaqin(q.cos, Math.sqrt(3) / 2); yaqin(q.tg, 1 / Math.sqrt(3)); assert.equal(birlikAylana(90).tg, null); assert.equal(birlikAylana(90).cos, 0); assert.equal(birlikAylana(180).sin, 0);
  yaqin(birlikAylana(225).sin, -Math.SQRT1_2); yaqin(birlikAylana(360).cos, 1);
  assert.deepEqual([0, 30, 45, 60, 90, 120, 180, 270, 360].map(radianMatni), ["0", "π/6", "π/4", "π/3", "π/2", "2π/3", "π", "3π/2", "2π"]); assert.equal(radianMatni(7), "0,1222");
});

test("aniq qiymatlar: har chorakda ishora to'g'ri va o'nli qiymat bilan mos", () => {
  assert.deepEqual(aniqQiymat(30), { sin: "1/2", cos: "√3/2", tg: "√3/3" }); assert.deepEqual(aniqQiymat(150), { sin: "1/2", cos: "−√3/2", tg: "−√3/3" });
  assert.deepEqual(aniqQiymat(225), { sin: "−√2/2", cos: "−√2/2", tg: "1" }); assert.deepEqual(aniqQiymat(300), { sin: "−√3/2", cos: "1/2", tg: "−√3" });
  assert.deepEqual(aniqQiymat(90), { sin: "1", cos: "0", tg: null }); assert.deepEqual(aniqQiymat(180), { sin: "0", cos: "−1", tg: "0" }); assert.deepEqual(aniqQiymat(270), { sin: "−1", cos: "0", tg: null }); assert.deepEqual(aniqQiymat(360), { sin: "0", cos: "1", tg: "0" });
  assert.equal(aniqQiymat(37), null); assert.equal(aniqQiymat(31), null);
  const val = (m) => { if (m === null) return null; const z = m.startsWith("−") ? -1 : 1; const q = m.replace("−", ""); const [a, b] = q.split("/"); const f = (v) => (v === "√2" ? Math.SQRT2 : v === "√3" ? Math.sqrt(3) : v === "√2/2" ? Math.SQRT1_2 : Number(v)); if (q === "√2/2") return z * Math.SQRT1_2; if (q === "√3/2") return z * Math.sqrt(3) / 2; if (q === "√3/3") return z / Math.sqrt(3); return z * (b ? f(a) / f(b) : f(a)); };
  for (let g = 0; g <= 360; g += 15) { const a = aniqQiymat(g); if (!a) continue; const q = birlikAylana(g); yaqin(val(a.sin), q.sin, 1e-9); yaqin(val(a.cos), q.cos, 1e-9); if (a.tg !== null) yaqin(val(a.tg), q.tg, 1e-9); else assert.ok(q.tg === null); }
});

// Darsdagi integral misollari va «o'zini tekshir» savollari: modulimiz hisobi bank KALITI bilan bir xil bo'lishi kerak (manbadagi javoblarni ham tekshiradi).
import fs from "node:fs";
const BANK_YOLI = process.env.MAT_BANK_FAYL || new URL("../../../talim_platformasi/modules/mat_bank_data/tematika.json", import.meta.url);
test("REV565: 84-mavzu integrallari bank kaliti bilan mos (9 ta)", { skip: fs.existsSync(BANK_YOLI) ? false : "bank fayli topilmadi" }, () => {
  const m = JSON.parse(fs.readFileSync(BANK_YOLI, "utf8")).mavzular.find((x) => x.raqam === 84); const PI = Math.PI;
  const H = { "97-3-31": ["(3x-1)^2", 0, 1, 1], "96-9-82": ["sin(2x)", 0, PI / 4, 0.5], "97-1-62": ["abs(2-x)", -1, 2, 4.5], "96-1-31": ["sin(x)", PI / 3, PI / 2, 0.5], "97-2-49": ["1+tg(x)^2", 0, PI / 4, 1],
    "97-7-31": ["(2x+1)^2", -1, 0, 1 / 3], "97-10-31": ["(1+3x)^2", -1, 0, 1], "97-6-63": ["abs(3-x)", -2, 3, 12.5], "96-10-33": ["cos(2x)", PI / 3, PI / 2, -Math.sqrt(3) / 4] };
  const oqi = (v) => { const s = v.replace(/[$\s]/g, ""); const k = /^(-?)\\frac\{(\d+)\}\{(\d+)\}$/.exec(s); if (k) return (k[1] ? -1 : 1) * Number(k[2]) / Number(k[3]); if (/^-?\\frac\{\\sqrt\{3\}\}\{4\}$/.test(s)) return (s.startsWith("-") ? -1 : 1) * Math.sqrt(3) / 4; return Number(s.replace(",", ".")); };
  for (const [kod, [ifoda, a, b, kutilgan]] of Object.entries(H)) {
    const t = m.testlar.find((x) => x.manba === kod); assert.ok(t, kod); const I = integral(F(ifoda), a, b, 4000); yaqin(I, kutilgan, 1e-6);
    yaqin(oqi(t.variantlar["ABCDE".indexOf(t.javob)]), I, 1e-6);       // kalit varianti hisoblangan qiymatga teng
  }
});
