import test from "node:test";
import assert from "node:assert/strict";
import { kidRate, kidTaskModel } from "./lesson/kidLessonRules.js";

test("REV95: yoshga qarab ovoz tezligi va topshiriqdan keyin namuna (maqtovsiz)", () => {
  assert.equal(kidRate("3-4 yosh"), "-15%");
  assert.equal(kidRate("6–7 yosh"), "-5%");
  assert.equal(kidRate(""), "-8%");
  assert.equal(kidTaskModel("Nima deysiz? [en]Thank you![/en] Qo'l silkiting: [en]Bye![/en]"),
    "Keling, birga aytamiz: [en]Thank you![/en] ⏸ [en]Bye![/en] ⏸ Endi davom etamiz!");
  assert.equal(kidTaskModel("Qarsak chaling!"), "Qani, davom etamiz!");
});
