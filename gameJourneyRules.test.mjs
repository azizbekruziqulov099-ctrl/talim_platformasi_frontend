import test from "node:test";
import assert from "node:assert/strict";
import { gameSizeTier, recommendedGameMode, journeyState, journeyThemeId, journeyColumns } from "./gameJourneyRules.js";

test("size tiers and recommended modes differ by count and level", () => {
  assert.equal(gameSizeTier(10), "qisqa");
  assert.equal(gameSizeTier(30), "orta");
  assert.equal(gameSizeTier(60), "katta");
  assert.equal(gameSizeTier(100), "marafon");
  assert.equal(recommendedGameMode(10, { band: "grade_5_9" }), "bridge");
  assert.equal(recommendedGameMode(10, { grade: "2-kurs" }), "detective");
  assert.equal(recommendedGameMode(100, { level: "universitet" }), "city");
});

test("journey builds with correct answers and opens stages every 20%", () => {
  const log = Array.from({ length: 4 }, (_, i) => ({ position: i + 1, correct: i !== 2 }));
  const s = journeyState(10, log, 5);
  assert.equal(s.done, 3);
  assert.equal(s.cells[2], "wrong");
  assert.equal(s.cells[4], "current");
  assert.equal(s.stage, 1);
  assert.equal(s.streak, 1);
  assert.equal(s.bestStreak, 2);
  assert.equal(s.links, 1);
  assert.equal(journeyThemeId({ grade: "3-kurs" }), "tarmoq");
  assert.equal(journeyThemeId({ band: "grade_1_4" }), "bog");
  assert.equal(journeyColumns(100), 20);
});
