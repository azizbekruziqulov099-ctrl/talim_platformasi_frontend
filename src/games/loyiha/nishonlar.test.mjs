import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
import { YON_OF, nishonlarHisobla, NISHONLAR, RUBRIKA, rubrikaOrtacha, ROLLAR } from "./nishonlar.js";

test("yo'nalish ro'yxati loyiha fayllari bilan bir xil (15 ta, S4 E4 T2 A2 M3)", () => {
  const f = (n) => [...fs.readFileSync(new URL(n, import.meta.url), "utf8").matchAll(/\{ k: "(\w+)", yon: "([STEAM])"/g)].map((m) => [m[1], m[2]]);
  const fayl = Object.fromEntries([...f("./KabuLoyiha.jsx"), ...f("./Loyiha2.jsx")]);
  assert.deepEqual(fayl, YON_OF);
  const soni = (y) => Object.values(YON_OF).filter((x) => x === y).length; assert.deepEqual(["S", "E", "T", "A", "M"].map(soni), [4, 4, 2, 2, 3]);
});
test("nishonlar: bo'sh portfelda hech biri yo'q; shartlar to'g'ri hisoblanadi", () => {
  assert.equal(nishonlarHisobla({}).filter((n) => n.olingan).length, 0); assert.equal(nishonlarHisobla({}).length, NISHONLAR.length);
  const p = { koprik: { yulduz: 3, faraz: true, xulosa: true }, richag: { yulduz: 2, faraz: true, xulosa: true }, parashyut: { yulduz: 2 }, qiya: { yulduz: 1 }, kod: { yulduz: 2 }, naqsh: { yulduz: 3, faraz: true, xulosa: true } };
  const n = Object.fromEntries(nishonlarHisobla(p, { qolda: [{ holat: "tasdiqlandi" }, { holat: "kutadi" }], jamoa: 1 }).map((x) => [x.k, x]));
  assert.ok(n.birinchi.olingan && n.muhandis.olingan && n.jamoa.olingan); assert.ok(!n.dasturchi.olingan && n.dasturchi.bor === 1 && n.dasturchi.kerak === 2);
  assert.ok(!n.rassom.olingan && n.rassom.bor === 1); assert.ok(!n.oltin.olingan && n.oltin.bor === 1); assert.equal(n.sinovchi.bor, 3); assert.ok(!n.steam.olingan && n.steam.bor === 3);   // S: yo'q → 3 ta (E, T, A)
  const hammasi = Object.fromEntries(Object.keys(YON_OF).map((k) => [k, { yulduz: 3, faraz: true, xulosa: true }]));
  assert.ok(nishonlarHisobla(hammasi, { qolda: [1, 2, 3].map(() => ({ holat: "tasdiqlandi" })), jamoa: 1 }).every((x) => x.olingan));
  assert.equal(nishonlarHisobla({ notanish: { yulduz: 3 } }).filter((x) => x.olingan).length, 0);
});
test("4K rubrikasi: 4 ko'nikma × 4 daraja; o'rtacha ball; rollar", () => {
  assert.equal(RUBRIKA.length, 4); for (const r of RUBRIKA) assert.equal(r.d.length, 4);
  assert.equal(rubrikaOrtacha({}), null); assert.deepEqual(rubrikaOrtacha({ a: { tanqidiy: 4, ijodkor: 2, hamkor: 3, muloqot: 1 }, b: { tanqidiy: 3, ijodkor: 3, hamkor: 3, muloqot: 3 } }), { tanqidiy: 3.5, ijodkor: 2.5, hamkor: 3, muloqot: 2 });
  assert.deepEqual(Object.keys(ROLLAR), ["tadqiqotchi", "muhandis", "dizayner", "maruzachi"]);   // serverdagi ROLLAR bilan bir xil
});
