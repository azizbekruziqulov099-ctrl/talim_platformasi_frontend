import test from "node:test";
import assert from "node:assert/strict";
import { hayvonYonidagiOdamSozi, matnId, matnIdEmojiBilan } from "./rasmHarakat.js";

test("hayvon belgisi yonidagi «bola» odam bolasining rasmini olmaydi", () => {
  assert.equal(matnIdEmojiBilan("ona", "🐔"), null);
  assert.equal(hayvonYonidagiOdamSozi("🐥", "bola"), true);
  assert.equal(hayvonYonidagiOdamSozi("🐔", "Ona"), true);
  assert.equal(hayvonYonidagiOdamSozi("👦", "bola"), false);
  assert.equal(hayvonYonidagiOdamSozi("🐥", "jo'ja"), false);
});
test("belgisiz yoki odam belgisi — o'zgarmaydi", () => {
  assert.equal(matnIdEmojiBilan("ona", ""), matnId("ona"));
  assert.equal(matnIdEmojiBilan("ona", "👩"), matnId("ona"));
});
