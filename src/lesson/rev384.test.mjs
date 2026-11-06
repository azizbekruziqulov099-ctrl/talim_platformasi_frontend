import { test } from "node:test";
import assert from "node:assert/strict";
import { checkAnswer, sozJavobMos } from "./darsXonasiRules.js";
test("REV384: so'z javob — asosiy so'z yetadi, inkor bo'lsa yo'q", () => {
  assert.ok(checkAnswer("juft", "Juft son"));
  assert.ok(checkAnswer("juft", "6 — juft"));
  assert.ok(checkAnswer("Juft", "juft (6 : 2 = 3)"));
  assert.ok(checkAnswer("juft son", "juft son"));
  assert.ok(checkAnswer("toq", "toq|juft emas"));
  assert.ok(!checkAnswer("juft", "toq son"));
  assert.ok(!checkAnswer("juft", "juft emas"));
  assert.ok(!checkAnswer("emas", "toq emas"));
  assert.ok(!sozJavobMos("j", ["juft"]));
  assert.ok(checkAnswer("ötkir", "oʻtkir burchak"));   // yangi alifbo
  assert.ok(checkAnswer("12", "12 ta olma"));            // sonlar avvalgidek
});
