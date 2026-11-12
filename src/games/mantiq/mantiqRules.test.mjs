import test from "node:test"; import assert from "node:assert/strict";
import { sudokuYasa, sudokuYechimSoni, sudokuTugadi, sudokuXatolar, sonYasa, sonTekshir, sonYechim, ifodaHisobla, kodYasa, kodBaho, nonogramYasa, nonogramTogri } from "./mantiqRules.js";

test("sudoku: 4, 6, 9 — yechim to'g'ri va YAGONA, har darajada", () => {
  for (const n of [4, 6, 9]) for (const d of [0, 1, 2]) for (const u of [1, 2, 3]) {
    const s = sudokuYasa(n, u, d);
    assert.ok(sudokuTugadi(s.yechim, n), `yechim ${n}`);
    assert.equal(sudokuYechimSoni(s.bosh, n, 2), 1, `yagona ${n} d${d} u${u}`);
    for (let i = 0; i < n; i += 1) for (let j = 0; j < n; j += 1) if (s.bosh[i][j]) assert.equal(s.bosh[i][j], s.yechim[i][j]);
    assert.ok(s.bosh.flat().filter((x) => !x).length >= n, "bo'sh kataklar bor");
  }
  const g = sudokuYasa(4, 1, 0).yechim.map((q) => [...q]); g[0][0] = g[0][1]; assert.ok(sudokuXatolar(g, 4).length >= 2);
});

test("son yasash: yechim kafolatlangan, tekshiruv qat'iy", () => {
  for (const d of [0, 1, 2]) for (let u = 1; u <= 25; u += 1) {
    const t = sonYasa(u, d);
    assert.equal(sonTekshir(t.yechim, t.sonlar, t.nishon), "ok", `${t.yechim} = ${t.nishon} [${t.sonlar}]`);
  }
  assert.equal(sonTekshir("4*6", [4, 6, 1, 1], 24), "sonlar");          // hamma son ishlatilmagan
  assert.equal(sonTekshir("4+6+1+1", [4, 6, 1, 1], 24), "qiymat");
  assert.equal(sonTekshir("4*6*1*1; alert(1)", [4, 6, 1, 1], 24), "xato");   // faqat raqam va amallar
  assert.equal(sonTekshir("8/(3-8/3)", [8, 3, 8, 3], 24), "ok");            // kasr orqali
  assert.deepEqual(ifodaHisobla("(2+3)×4").qiymat, [20, 1]);
  assert.equal(ifodaHisobla("5/0").qiymat, null);
  assert.equal(sonYechim([1, 1, 1, 1], 24), null);
});

test("kod ochish: baho to'g'ri", () => {
  assert.deepEqual(kodBaho([0, 1, 2, 3], [0, 1, 2, 3]), { joyida: 4, bor: 0 });
  assert.deepEqual(kodBaho([1, 0, 2, 5], [0, 1, 2, 3]), { joyida: 1, bor: 2 });
  assert.deepEqual(kodBaho([1, 1, 1, 1], [1, 2, 2, 2]), { joyida: 1, bor: 0 });   // takror ortiqcha sanalmaydi
  for (const d of [0, 1, 2]) { const k = kodYasa(5, d); assert.equal(k.sir.length, k.uzun); assert.ok(k.sir.every((v) => v >= 0 && v < k.belgi)); if (!k.takror) assert.equal(new Set(k.sir).size, k.uzun); }
});

test("nonogramma: ishoralar rasmga mos, bo'sh qator yo'q", () => {
  for (const d of [0, 1, 2]) for (let u = 1; u <= 8; u += 1) {
    const n = nonogramYasa(u, d);
    assert.ok(nonogramTogri(n.rasm, n.qator, n.ustun));
    assert.equal(n.qator.length, n.n); assert.equal(n.ustun.length, n.n);
    const bosh = n.rasm.map((q) => q.map(() => 0)); assert.equal(nonogramTogri(bosh, n.qator, n.ustun), false);
  }
});
