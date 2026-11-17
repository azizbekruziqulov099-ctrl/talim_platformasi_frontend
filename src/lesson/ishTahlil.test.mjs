import test from "node:test";
import assert from "node:assert/strict";
import { ishTahlil, elakTahlil, ketmaTahlil } from "./matDoska.js";

test("ISH: amallar tartibi va raqamlash", () => {
  const t = ishTahlil("72:(2+4)*3-5");
  assert.equal(t.javob, "31");
  assert.deepEqual(t.qadamlar.map((q) => q.qism), ["2 + 4", "72 : 6", "12 · 3", "36 − 5"]);
  assert.deepEqual(t.qadamlar.map((q) => q.ifoda), ["72 : 6 · 3 − 5", "12 · 3 − 5", "36 − 5", "31"]);
  assert.deepEqual(t.tokenlar.filter((x) => x.t === "o").map((x) => x.k), [2, 1, 3, 4]);
});
test("ISH: ichma-ich qavs, qavssiz teng darajali amallar", () => {
  assert.equal(ishTahlil("580+[240-135+(320-75)]").javob, "930");
  assert.equal(ishTahlil("36-12:4+2*5").javob, "43");
  assert.equal(ishTahlil("100-4*(7+8)").javob, "40");
});
test("ISH: bo'linmaydigan yoki noto'g'ri ifoda — null", () => {
  assert.equal(ishTahlil("12:5"), null);
  assert.equal(ishTahlil("2+"), null);
  assert.equal(ishTahlil("abc"), null);
});
test("ELAK: 50 gacha 15 ta tub son; KETMA: zanjir", () => {
  assert.equal(elakTahlil("50").tub.length, 15);
  assert.equal(elakTahlil("5"), null);
  assert.deepEqual(ketmaTahlil("a | b | c"), ["a", "b", "c"]);
  assert.equal(ketmaTahlil("a"), null);
});
