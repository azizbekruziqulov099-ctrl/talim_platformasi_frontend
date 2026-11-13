import test from "node:test"; import assert from "node:assert/strict";
import * as R from "./loyihaRules2.js";

test("suv filtri: yirikdan maydaga — eng toza; teskari tartib tiqiladi", () => {
  assert.equal(R.filtrTozalik(["shagal", "qum", "komir"]), 85); assert.ok(R.filtrTozalik(["komir", "qum", "shagal"]) < 50); assert.ok(R.filtrTozalik(["shagal", "shagal", "shagal"]) < R.FILTR_MAQSAD);
  const k = Object.keys(R.FILTR); let yech = 0; for (const a of k) for (const b of k) for (const c of k) if (R.filtrTozalik([a, b, c]) >= R.FILTR_MAQSAD) yech += 1;
  assert.ok(yech >= 1 && yech <= 3, `yechimlar ${yech}`);
});
test("richag: moment qoidasi", () => { assert.equal(R.richagHolat(3, 4), 0); assert.equal(R.richagHolat(4, 3), 0); assert.equal(R.richagHolat(2, 6), 0); assert.equal(R.richagHolat(2, 3), -1); assert.equal(R.richagHolat(4, 5), 1); });
test("parashyut: katta gumbaz sekin tushadi; maqsadga bitta o'lcham mos", () => {
  for (let y = 1; y < 6; y += 1) assert.ok(R.parashyutTezlik(y) > R.parashyutTezlik(y + 1));
  assert.deepEqual([1, 2, 3, 4, 5, 6].filter(R.parashyutOtdi), [4]);
});
test("qayiq: plastilin chegarasi va sig'im", () => {
  assert.ok(!R.qayiqYaroqli(6, 2)); assert.equal(R.qayiqSigim(6, 2), 0); assert.equal(R.qayiqSigim(4, 2), 12);
  const yech = []; for (let e = 1; e <= 6; e += 1) for (let d = 1; d <= 3; d += 1) if (R.qayiqSigim(e, d) >= R.QAYIQ.maqsad) yech.push(`${e}${d}`);
  assert.deepEqual(yech, ["42"]);
});
test("soya: tushda eng qisqa, ertalab va kechqurun uzun; soya = tayoq bo'yi bo'ladigan vaqt bor", () => {
  assert.ok(R.soyaUzunlik(12) < R.soyaUzunlik(10) && R.soyaUzunlik(10) < R.soyaUzunlik(8)); assert.equal(R.soyaUzunlik(9), R.soyaUzunlik(15));
  const vaqt = []; for (let s = 7; s <= 17; s += 0.5) if (R.soyaTeng(s)) vaqt.push(s); assert.deepEqual(vaqt, [9.5, 14.5]); assert.ok(R.soyaUzunlik(12) > 0.2 && R.soyaUzunlik(12) < 0.4, "tushda ham qisqa soya bor");
});
test("qiya tekislik: muzda deyarli doim sirpanadi, gilamda tik bo'lsagina", () => {
  assert.ok(R.sirpanadi(10, "muz") && !R.sirpanadi(10, "yogoch") && !R.sirpanadi(25, "gilam") && R.sirpanadi(40, "gilam"));
  const b = []; for (let x = 5; x <= 50; x += 5) if (R.qiyaOtdi(x)) b.push(x); assert.deepEqual(b, [20, 25, 30]);
});
test("masshtab: 4 m × 3 m, 1:50 → 8 sm × 6 sm", () => { assert.ok(R.masshtabTogri(R.MASSHTAB[0], 8, 6)); assert.ok(!R.masshtabTogri(R.MASSHTAB[0], 4, 3)); assert.ok(R.masshtabTogri(R.MASSHTAB[1], 8, 6)); assert.ok(R.masshtabTogri(R.MASSHTAB[2], 5, 2.5)); });
test("so'rovnoma: sanoq to'g'ri va jami javoblar soniga teng", () => { for (const s of R.SOROV) { const c = R.sorovSana(s); assert.equal(c.reduce((a, b) => a + b, 0), s.javob.split(",").length); assert.ok(R.sorovTogri(s, c)); assert.ok(Math.max(...c) <= 8); assert.ok(!R.sorovTogri(s, c.map((v) => v + 1))); } assert.deepEqual(R.sorovSana(R.SOROV[0]), [6, 3, 4, 2]); });
test("rang aralashtirish: asosiy qoidalar; har maqsad rangga erishsa bo'ladi", () => {
  assert.equal(R.rangAralash(1, 1, 0), "toq_sariq"); assert.equal(R.rangAralash(0, 2, 2), "yashil"); assert.equal(R.rangAralash(1, 0, 1), "binafsha"); assert.equal(R.rangAralash(1, 1, 1), "jigarrang"); assert.equal(R.rangAralash(0, 0, 0), "oq");
  for (const m of R.RANG_MAQSAD) { let bor = false; for (let q = 0; q <= 3; q += 1) for (let s = 0; s <= 3; s += 1) for (let k = 0; k <= 3; k += 1) if (R.rangAralash(q, s, k) === m) bor = true; assert.ok(bor, m); assert.ok(R.RANG_HEX[m]); }
});
test("Kabu-kod 2: takrorlash bilan har xaritada 2–6 buyruq yetadi", () => {
  for (const x of R.KOD2_XARITALAR) { const e = R.kod2EngKam(x); assert.ok(e >= 2 && e <= 6, `eng kam ${e}`); assert.equal(new Set(x.map((q) => q.length)).size, 1); }
  assert.deepEqual(R.kod2Yoy([["R", 3], ["D", 2]]), ["R", "R", "R", "D", "D"]);
  assert.equal(R.kod2Yurit(R.KOD2_XARITALAR[0], [["R", 6], ["D", 4]]).natija, "yetdi");
});
