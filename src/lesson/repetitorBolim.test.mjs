import test from "node:test";
import assert from "node:assert/strict";
import { qadamBolimi, bolimQadamlari, REPETITOR_BOLIMLAR } from "./darsXonasiRules.js";

const steps = [
  { sarlavha: "Hayotdan: Do'kondagi qarz", turi: "kirish" },
  { sarlavha: "Natural sonlar", turi: "tushuntirish" },
  { sarlavha: "Misol 1", turi: "misol" },
  { sarlavha: "Hayotdan: Kitob", turi: "tushuntirish" },
  { sarlavha: "Mashq 3", turi: "amaliy" },
  { sarlavha: "Tarixdan: Xorazmiy", turi: "xulosa" },
];

test("qadamlar bo'limlarga to'g'ri bo'linadi", () => {
  assert.deepEqual(steps.map(qadamBolimi), ["hayotdan", "dars", "dars", "hayotdan", "mashq", "tarix"]);
  assert.equal(bolimQadamlari(steps, "hayotdan").length, 2);
  assert.equal(bolimQadamlari(steps, "mashq").length, 1);
  assert.equal(bolimQadamlari(steps, "").length, 6);
  assert.equal(REPETITOR_BOLIMLAR.length, 5);
});
