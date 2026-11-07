import { test } from "node:test";
import assert from "node:assert/strict";
import { ruTuzat } from "./xbTil.js";
test("REV423: ruscha ko'plik shakllari", () => {
  assert.equal(ruTuzat("3 заданий"), "3 задания");
  assert.equal(ruTuzat("1 заданий"), "1 задание");
  assert.equal(ruTuzat("11 задания"), "11 заданий");
  assert.equal(ruTuzat("41 стран"), "41 страна");
  assert.equal(ruTuzat("22 вопросов"), "22 вопроса");
  assert.equal(ruTuzat("25 вопросов"), "25 вопросов");
  assert.equal(ruTuzat("2,5 баллов"), "2,5 балла");
  assert.equal(ruTuzat("Привет 5 мир"), "Привет 5 мир");
});
