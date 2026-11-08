import { test } from "node:test";
import assert from "node:assert/strict";
import { orinAlmashQurish, orinlashtirTahlil, guruhlashTahlil, vennTahlil, daraxtTahlil, buyruq } from "./matDoska.js";
test("REV425: n! qo'yish yo'li bilan: 3! = 3·2!, 4! = 4·3!", () => {
  const q3 = orinAlmashQurish(3); assert.equal(q3.jami, 6); assert.equal(q3.guruhlar.length, 2); assert.deepEqual(q3.guruhlar[0].tartiblar.map((t) => t.join("")), ["CAB", "ACB", "ABC"]);
  const q4 = orinAlmashQurish(4); assert.equal(q4.jami, 24); assert.equal(q4.guruhlar.length, 6);
  assert.equal(new Set(q4.guruhlar.flatMap((g) => g.tartiblar.map((t) => t.join("")))).size, 24);
  assert.equal(orinAlmashQurish(1).jami, 1);
});
test("REV425: buyruqlar tahlili", () => {
  assert.deepEqual(orinlashtirTahlil("8 4"), { n: 8, k: 4 }); assert.deepEqual(guruhlashTahlil("5; 3"), { n: 5, k: 3 });
  assert.deepEqual(vennTahlil("A=12; B=9; AB=4; jami=30"), { A: "12", B: "9", AB: "4", JAMI: "30" });
  assert.deepEqual(daraxtTahlil("0,6 | 0,4 / 0,7 | 0,3"), [["0,6", "0,4"], ["0,7", "0,3"]]);
  assert.equal(buyruq("ORIN_ALMASH: 3").tur, "orin_almash"); assert.equal(buyruq("VENN: A=1; B=2").tur, "venn");
});
