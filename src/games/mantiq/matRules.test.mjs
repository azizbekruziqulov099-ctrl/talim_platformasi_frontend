import test from "node:test"; import assert from "node:assert/strict";
import { tenglamaYasa, kasrYasa, kasrYigindi, kasrTeng, koordinataYasa, funksiyaYasa, sehrliYasa, sehrliTogri } from "./matRules.js";

test("tenglama: x haqiqatan yechim, qadamlar oxiri x ga olib keladi", () => {
  for (const d of [0, 1, 2]) for (let u = 1; u <= 40; u += 1) { const t = tenglamaYasa(u, d);
    assert.equal(t.chap.k * t.x + t.chap.o, t.ong.k * t.x + t.ong.o, t.matn);
    assert.ok(Number.isInteger(t.x)); assert.ok(t.qadamlar.length >= 1); assert.ok(/=/.test(t.matn));
    if (t.chap.k - t.ong.k !== 1) assert.ok(t.qadamlar.at(-1).endsWith(`x = ${t.x}`), t.qadamlar.at(-1)); }
});
test("kasr yig'ish: yechim nishonga teng, bo'laklar yetarli", () => {
  for (const d of [0, 1, 2]) for (let u = 1; u <= 40; u += 1) { const t = kasrYasa(u, d);
    assert.ok(kasrTeng(kasrYigindi(t.bolaklar, t.yechim), t.nishon), JSON.stringify(t)); assert.ok(t.yechim.length >= 2 && t.nishon[0] > 0); }
  assert.deepEqual(kasrYigindi([[1, 2], [1, 4], [1, 4]], [0, 1, 2]), [1, 1]);
});
test("koordinata: nuqtalar maydon ichida va takrorlanmaydi", () => {
  for (const d of [0, 1, 2]) for (let u = 1; u <= 20; u += 1) { const t = koordinataYasa(u, d, 6);
    assert.equal(t.topshiriqlar.length, 6); assert.equal(new Set(t.topshiriqlar.map((p) => `${p.x}:${p.y}`)).size, 6);
    for (const p of t.topshiriqlar) assert.ok(p.x >= t.min && p.x <= t.max && p.y >= t.min && p.y <= t.max); }
});
test("funksiya mashinasi: javob qoidaga mos, to'g'ri qoida variantlarda bitta", () => {
  for (const d of [0, 1, 2]) for (let u = 1; u <= 40; u += 1) { const t = funksiyaYasa(u, d);
    assert.equal(t.variantlar[t.togri], t.qoida); assert.equal(t.variantlar.filter((v) => v === t.qoida).length, 1);
    assert.equal(new Set(t.variantlar).size, t.variantlar.length); assert.equal(t.misollar.length, 3); assert.ok(Number.isFinite(t.javob)); }
});
test("sehrli kvadrat: to'liq kvadrat sehrli, bo'sh kataklar soni to'g'ri", () => {
  for (const d of [0, 1, 2]) for (let u = 1; u <= 30; u += 1) { const t = sehrliYasa(u, d);
    assert.ok(sehrliTogri(t.kvadrat, t.yigindi)); assert.equal(t.bosh.flat().filter((v) => v == null).length, [3, 5, 6][d]);
    const buz = t.kvadrat.map((q) => [...q]); buz[0][0] += 1; assert.equal(sehrliTogri(buz, t.yigindi), false); }
});
