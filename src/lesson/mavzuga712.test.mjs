import test from "node:test"; import assert from "node:assert/strict";
import { qadamOyini, mavzuga } from "./oyinQadam.js";
const E = (emoji, uz, en) => ({ emoji, uz, say: en, soz: { uz, en, ru: uz, de: en, es: en } });
const top = [E("⚽", "to‘p", "ball"), E("🏀", "basketbol to‘pi", "basketball"), E("🎾", "tennis to‘pi", "tennis ball")];
test("dars to‘p haqida — «Teskarisini top» (fil/sichqon) o‘rniga darsdagi narsalar bilan o‘yin", () => {
  assert.equal(mavzuga(114, top, "6-7"), false);
  const r = qadamOyini({ oyin: 114, doska: "⚽ 🏀 🎾" }, { yosh: "6-7", darsElementlari: top });
  assert.ok(r === null || r.id === 116, "begona o‘yin qolmasin");
});
test("darsdagi narsalar bilan o‘ynaladigan o‘yin o‘zgarmaydi", () => {
  const r = qadamOyini({ oyin: 116, doska: "⚽ 🏀 🎾" }, { yosh: "6-7", darsElementlari: top });
  assert.equal(r?.id, 116);
});
