import test from "node:test";
import assert from "node:assert/strict";
import { countdownText, formatPoints, isTournamentCode, roundMarks } from "./games/turnirRules.js";

test("REV90: turnir yordamchilari", () => {
  assert.equal(isTournamentCode("T3HZS3"), true);
  assert.equal(isTournamentCode("ABC123"), false);
  assert.equal(countdownText(1000 + 42_000, 1000), "0:42");
  assert.equal(countdownText(3_725_000, 0), "1:02:05");
  assert.equal(countdownText(2 * 86400_000 + 3 * 3600_000, 0), "2 kun 3 soat");
  assert.deepEqual(roundMarks({ 1: "1", 3: "dam" }, 4), ["1", "", "dam", ""]);
  assert.equal(formatPoints(2.5), "2½");
  assert.equal(formatPoints(0.5), "½");
  assert.equal(formatPoints(3), "3");
});
