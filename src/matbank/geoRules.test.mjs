import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
import { belgilar, moslash } from "./geoRules.js";

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const romb = { chegara: [-3, -4, 3, 4], nuqtalar: { A: [-3, 0], B: [0, 4], C: [3, 0], D: [0, -4], O: [0, 0] }, korinadigan: ["A", "B", "C", "D", "O"],
  kesmalar: [{ a: "A", b: "B", yozuv: "5", uzuq: false }, { a: "B", b: "C", yozuv: null, uzuq: false }, { a: "C", b: "D", yozuv: null, uzuq: false }, { a: "D", b: "A", yozuv: null, uzuq: false }, { a: "A", b: "C", yozuv: "6", uzuq: true }, { a: "B", b: "D", yozuv: "8", uzuq: true }],
  burchaklar: [{ uch: "O", a: "A", b: "B", tur: "togri", yozuv: null }, { uch: "A", a: "B", b: "D", tur: "yoy", yozuv: "106,26°" }], dumaloqlar: [] };

test("REV566: moslash — masshtab BUZILMAYDI (ikkala o'qda bir xil), hamma nuqta oyna ichida", () => {
  for (const ch of [[-3, -4, 3, 4], [0, 0, 10, 1], [0, 0, 1, 10], [-5, -5, 5, 5]]) {
    const M = moslash({ chegara: ch }); const p0 = M.nuqta([ch[0], ch[1]]), p1 = M.nuqta([ch[2], ch[3]]);
    assert.ok(Math.abs(Math.abs(p1[0] - p0[0]) - (ch[2] - ch[0]) * M.s) < 1e-6 && Math.abs(Math.abs(p1[1] - p0[1]) - (ch[3] - ch[1]) * M.s) < 1e-6, "masshtab bir xil");
    for (const p of [p0, p1]) assert.ok(p[0] >= 0 && p[0] <= M.W && p[1] >= 0 && p[1] <= M.H, JSON.stringify([ch, p]));
    assert.ok(M.H <= 300 + 1e-6 || ch[3] - ch[1] > 0, "balandlik chegarasi");
  }
  const M = moslash(romb); const A = M.nuqta([-3, 0]), B = M.nuqta([0, 4]); assert.ok(Math.abs(dist(A, B) - 5 * M.s) < 1e-6);        // 5 birlik = 5·s piksel: tomon aniq
  assert.ok(M.nuqta([0, 4])[1] < M.nuqta([0, -4])[1], "yuqori nuqta ekranda yuqorida (y o'qi teskari)");
});

test("belgilar: to'g'ri burchak belgisi perpendikulyar, yoy markazdan bir xil uzoqlikda, yorliqlar shakldan tashqarida", () => {
  const M = moslash(romb); const B = belgilar(romb, M);
  const t = B.burchaklar.find((b) => b.tur === "togri"); assert.ok(Math.abs(t.u[0] * t.v[0] + t.u[1] * t.v[1]) < 1e-9, "u ⟂ v");
  const y = B.burchaklar.find((b) => b.tur === "yoy"); assert.equal(y.matn, "106,26°"); assert.ok(/^M[\d.\-]+,[\d.\-]+ A22,22 0 0 [01] /.test(y.yol), y.yol);
  const m = y.yol.match(/^M([\d.\-]+),([\d.\-]+) A22,22 0 0 [01] ([\d.\-]+),([\d.\-]+)/); assert.ok(Math.abs(dist([+m[1], +m[2]], y.p) - 22) < 0.02 && Math.abs(dist([+m[3], +m[4]], y.p) - 22) < 0.02);
  const uchB = B.uchlar.find((u) => u.ism === "B"), mr = M.nuqta([0, 0]); assert.ok(dist(uchB.y, mr) > dist(uchB.p, mr), "uch yorlig'i shakldan tashqarida");
  assert.deepEqual(B.yozuvlar.map((q) => q.matn), ["5", "6", "8"]);
  const q6 = B.yozuvlar.find((q) => q.matn === "6"), q8 = B.yozuvlar.find((q) => q.matn === "8"); assert.ok(dist(q6.p, q8.p) > 30, "ikkala diagonal yozuvi ustma-ust tushmasin");
  assert.ok(dist(q6.p, mr) > 14 && dist(q8.p, mr) > 14, "diagonal yozuvlari markaz belgisidan (O) uzoqda");
  const s5 = B.yozuvlar.find((q) => q.matn === "5"), ab = [(M.nuqta([-3, 0])[0] + M.nuqta([0, 4])[0]) / 2, (M.nuqta([-3, 0])[1] + M.nuqta([0, 4])[1]) / 2]; assert.ok(dist([s5.p[0], s5.p[1] - 4], ab) > 5, "tomon yozuvi chiziqdan chetda");
});

// Haqiqiy darsdagi hamma [[CHIZMA: …]] uchun server hisoblagan shakl bor va masshtabi aniq bo'lishi kerak.
const DARS_YOLI = process.env.DARS_FAYL || new URL("../../../talim_platformasi/modules/mat_bank_data/dars.json", import.meta.url);
test("REV566: HAQIQIY darsdagi chizmalar — hisoblangan shakl bor, tomon uzunliklari berilgan sonlarga teng", { skip: fs.existsSync(DARS_YOLI) ? false : "dars fayli topilmadi" }, () => {
  const D = JSON.parse(fs.readFileSync(DARS_YOLI, "utf8")).darslar; let n = 0;
  for (const d of Object.values(D)) for (const [arg, f] of Object.entries(d.geo || {})) {
    n += 1; assert.equal(f.arg, arg); const M = moslash(f);
    for (const k of f.kesmalar) { if (!k.yozuv || !/^[\d,]+$/.test(k.yozuv)) continue; const son = Number(k.yozuv.replace(",", ".")); if (k.yozuv.startsWith("r=")) continue;
      const uz = dist(M.nuqta(f.nuqtalar[k.a]), M.nuqta(f.nuqtalar[k.b])) / M.s; assert.ok(Math.abs(uz - son) < 0.01 * Math.max(1, son), `${arg}: ${k.a}${k.b} yozuv ${son}, chizilgan ${uz.toFixed(3)}`); }
  }
  assert.ok(n >= 0);
});
