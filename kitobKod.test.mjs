import test from "node:test";
import assert from "node:assert/strict";
import { cleanCode, codeUrl, conditionLines, isCodeLike, nextShown, optionState } from "./kitobKodRules.js";

test("kod tozalanadi: kichik harf, bo'sh joy, kirill X/B va tire", () => {
  assert.equal(cleanCode(" xb 03 a01 "), "XB-03-A01");
  assert.equal(cleanCode("ХВ—03—А01"), "XB-03-A01");
  assert.equal(cleanCode("xb03a01"), "XB03A01");
  assert.equal(cleanCode("XB-03-A01; drop table"), "XB-03-A01-DROP-TABLE");
  assert.equal(isCodeLike("x-1"), false);
  assert.equal(isCodeLike("XB3"), true);
});

test("kod manzili token bilan, kod URL ichida xavfsiz", () => {
  assert.equal(codeUrl("https://api.x/", "t 1", "xb-03-a01"), "https://api.x/api/kitob_kod/XB-03-A01?token=t+1");
});

test("shart qatorlari va yechim qadamlari", () => {
  assert.deepEqual(conditionLines("a\n\n b \n"), ["a", "b"]);
  assert.equal(nextShown(0, 3), 1);
  assert.equal(nextShown(3, 3), 3);
});

test("variant holati: to'g'ri javob yashil, tanlangan xato qizil", () => {
  assert.equal(optionState(1, null, 1), "");
  assert.equal(optionState(1, 0, 1), "ok");
  assert.equal(optionState(0, 0, 1), "no");
  assert.equal(optionState(2, 0, 1), "");
  assert.equal(optionState(0, 0, null), "picked");
});
