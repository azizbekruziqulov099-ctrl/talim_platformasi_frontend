import test from "node:test"; import assert from "node:assert/strict";
import { ketmaYasa, jadvalYasa, jadvalYechimlar, jadvalTogri, xanoyBosh, xanoyYur, xanoyTugadi, xanoyEngKam, chiroqYasa, chiroqBos, chiroqTugadi } from "./mantiq2Rules.js";

test("ketma-ketlik: javob variantlarda bitta, variantlar har xil", () => {
  for (const d of [0, 1, 2]) for (let u = 1; u <= 60; u += 1) { const t = ketmaYasa(u, d);
    assert.equal(t.variantlar[t.togri], t.javob); assert.equal(new Set(t.variantlar).size, t.variantlar.length, JSON.stringify(t));
    assert.ok(t.variantlar.length >= 3 && t.hadlar.length >= 5 && (typeof t.qoida === "string" ? t.qoida.length > 5 : t.qoida.m.includes("{v0}"))); assert.ok(t.hadlar.every((v) => Number.isFinite(v) && v >= 0)); }
});
test("mantiqiy jadval: yechim yagona, ishoralar yetarli va ortiqchasiz", () => {
  for (const d of [0, 1, 2]) for (let u = 1; u <= 12; u += 1) { const t = jadvalYasa(u, d);
    const y = jadvalYechimlar(t.n, t.toifa.length, t._ish, 3);
    assert.equal(y.soni, 1, `yagona d${d} u${u}`); assert.deepEqual(y.top[0], t.yechim); assert.ok(jadvalTogri(t.yechim, t.yechim));
    for (let i = 0; i < t._ish.length; i += 1) assert.ok(jadvalYechimlar(t.n, t.toifa.length, t._ish.filter((_, k) => k !== i), 2).soni > 1, "har ishora kerak");
    assert.equal(t.ishoralar.length, t._ish.length); assert.ok(t.ishoralar.every((x) => x.m.endsWith(".") && x.m.includes("{v0}") && x.m.includes("{v1}") && x.a.length === 2)); }
});
test("Xanoy: qoida (katta kichigining ustiga qo'yilmaydi) va eng kam yurish", () => {
  let u = xanoyBosh(3); assert.equal(xanoyYur(u, 1, 2), null);
  u = xanoyYur(u, 0, 2); assert.deepEqual(u, [[3, 2], [], [1]]); assert.equal(xanoyYur(u, 0, 2), null);   // 2 ni 1 ustiga qo'yib bo'lmaydi
  const yech = (n, a, b, c, st) => { if (!n) return st; let s = yech(n - 1, a, c, b, st); s = { u: xanoyYur(s.u, a, b), k: s.k + 1 }; return yech(n - 1, c, b, a, s); };
  for (const n of [3, 4, 5]) { const s = yech(n, 0, 2, 1, { u: xanoyBosh(n), k: 0 }); assert.ok(xanoyTugadi(s.u, n)); assert.equal(s.k, xanoyEngKam(n)); }
});
test("chiroqlar: berilgan yechim hamma chiroqni o'chiradi", () => {
  for (const d of [0, 1, 2]) for (let u = 1; u <= 25; u += 1) { const t = chiroqYasa(u, d); let g = t.bosh;
    assert.ok(!chiroqTugadi(g)); for (const [i, j] of t.yechim) g = chiroqBos(g, i, j); assert.ok(chiroqTugadi(g)); }
});
