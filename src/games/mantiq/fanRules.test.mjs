import test from "node:test"; import assert from "node:assert/strict";
import { ZANJIRLAR, ozuqaYasa, ozuqaTogri, elektrYasa, zanjirTok, zanjirEngKam, TENGLAMALAR, atomlar, tenglamaTekshir, kimyoYasa, ELEMENTLAR, davriyYasa } from "./fanRules.js";

test("ozuqa zanjiri: uzunlik darajaga mos, aralashgan", () => {
  ZANJIRLAR.forEach((h, d) => h.forEach(([m, ...z]) => { assert.equal(z.length, 3 + d, m); assert.ok(z.every(([e, n]) => e && n)); }));
  for (const d of [0, 1, 2]) for (let u = 1; u <= 20; u += 1) { const t = ozuqaYasa(u, d); assert.ok(!ozuqaTogri(t.tartib, t.zanjir)); assert.ok(ozuqaTogri(t.zanjir.map((_, i) => i), t.zanjir)); }
});
test("elektr zanjiri: tok va eng kam kalitlar soni", () => {
  const s = { t: "s", q: [{ t: "k", id: 1 }, { t: "p", q: [{ t: "k", id: 2 }, { t: "k", id: 3 }] }] };
  assert.equal(zanjirTok(s, new Set([1])), false); assert.equal(zanjirTok(s, new Set([1, 3])), true); assert.equal(zanjirTok(s, new Set([2, 3])), false); assert.equal(zanjirEngKam(s), 2);
  for (const d of [0, 1, 2]) for (let u = 1; u <= 20; u += 1) { const t = elektrYasa(u, d);
    assert.equal(new Set(t.kalitlar).size, t.kalitlar.length); assert.ok(zanjirTok(t.daraxt, new Set(t.kalitlar))); assert.ok(!zanjirTok(t.daraxt, new Set()));
    // eng kam son haqiqatan yetarli va undan kami yetmaydi (hamma to'plamlarni sinab)
    let eng = 99; const n = t.kalitlar.length; for (let m = 0; m < 2 ** n; m += 1) { const y = new Set(t.kalitlar.filter((_, i) => m & (1 << i))); if (zanjirTok(t.daraxt, y)) eng = Math.min(eng, y.size); }
    assert.equal(eng, t.engKam); }
});
test("kimyo: bazadagi HAR tenglama tenglashgan va eng kichik koeffitsientli", () => {
  assert.deepEqual(atomlar("Al2(SO4)3"), { Al: 2, S: 3, O: 12 }); assert.deepEqual(atomlar("Ca(OH)2"), { Ca: 1, O: 2, H: 2 }); assert.deepEqual(atomlar("C2H5OH"), { C: 2, H: 6, O: 1 });
  for (const h of TENGLAMALAR) for (const [chap, ong, koef] of h) { assert.equal(koef.length, chap.length + ong.length); assert.equal(tenglamaTekshir(chap, ong, koef), "ok", `${chap.join("+")} → ${ong.join("+")}`); }
  assert.equal(tenglamaTekshir(["H2", "O2"], ["H2O"], [4, 2, 4]), "qisqartir"); assert.equal(tenglamaTekshir(["H2", "O2"], ["H2O"], [1, 1, 1]), "xato");
  for (const d of [0, 1, 2]) assert.ok(kimyoYasa(3, d).koef.length >= 3);
});
test("davriy jadval: 36 element tartibda, savollarda to'g'ri javob bitta", () => {
  assert.equal(ELEMENTLAR.length, 36); assert.equal(new Set(ELEMENTLAR.map((e) => e[0])).size, 36); assert.equal(ELEMENTLAR[25][0], "Fe"); assert.equal(ELEMENTLAR[7][1], "Kislorod");
  for (const d of [0, 1, 2]) for (let u = 1; u <= 15; u += 1) for (const q of davriyYasa(u, d)) { assert.equal(q.variantlar.length, 4); assert.equal(new Set(q.variantlar).size, 4);
    const [bel, nom] = ELEMENTLAR[q.z - 1]; assert.equal(q.variantlar[q.togri], q.savol.tur === "belgi" ? nom : bel); assert.ok(q.z <= [10, 20, 36][d]); }
});
