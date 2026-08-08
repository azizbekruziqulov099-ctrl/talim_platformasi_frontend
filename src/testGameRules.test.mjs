import assert from "node:assert/strict";
import test from "node:test";
import {
  GAME_FEEDBACK_HOLD_MS,
  GAME_MODE_IDS,
  buildGameStartPayload,
  formatGameTimerSeconds,
  gameFeedbackCountdownSeconds,
  gameLivesRemaining,
  gameQuestionTimerConfig,
  gameQuestionOptions,
  gradeBandForClass,
  isGameTerminalResponse,
  modeNameForBand,
  normalizeGradeBand,
  resolveGameGradeBand,
  shouldAutoReadGameQuestion,
} from "./testGameRules.js";


test("V18 exposes exactly five distinct game modes", () => {
  assert.deepEqual(GAME_MODE_IDS, ["bridge", "millionaire", "space", "detective", "city"]);
});

test("answer feedback is held for exactly 4.5 seconds", () => {
  assert.equal(GAME_FEEDBACK_HOLD_MS, 4500);
  assert.equal(gameFeedbackCountdownSeconds(4500), 5);
  assert.equal(gameFeedbackCountdownSeconds(4499), 5);
  assert.equal(gameFeedbackCountdownSeconds(4000), 4);
  assert.equal(gameFeedbackCountdownSeconds(1), 1);
  assert.equal(gameFeedbackCountdownSeconds(0), 0);
});

test("age bands match 1-4, 5-9, 10-11 and applicants", () => {
  assert.equal(gradeBandForClass("4-sinf"), "grade_1_4");
  assert.equal(gradeBandForClass("5-sinf"), "grade_5_9");
  assert.equal(gradeBandForClass("9"), "grade_5_9");
  assert.equal(gradeBandForClass("10-sinf"), "grade_10_11");
  assert.equal(gradeBandForClass("Abituriyent"), "applicant");
  assert.equal(modeNameForBand("bridge", "grade_1_4"), "Sehrli toshlar");
  assert.equal(modeNameForBand("bridge", "grade_10_11"), "Oyna yo'li");
  assert.equal(normalizeGradeBand("grade_1_5"), "grade_1_4");
  assert.equal(normalizeGradeBand("grade_6_9"), "grade_5_9");
  assert.equal(resolveGameGradeBand({ grade_band: "grade_1_5", grade: 5 }), "grade_5_9");
});

test("junior auto-read is once-ready by default while older groups stay manual", () => {
  assert.equal(shouldAutoReadGameQuestion({ grade_band: "grade_1_4" }, {}), true);
  assert.equal(shouldAutoReadGameQuestion({ grade_band: "grade_5_9" }, {}), false);
  assert.equal(shouldAutoReadGameQuestion({ grade_band: "grade_10_11", auto_read_questions: true }, {}), true);
  assert.equal(shouldAutoReadGameQuestion({ grade_band: "grade_1_4", voice_enabled: false }, {}), false);
});

test("timer metadata prefers server remaining time and tolerates deadline aliases", () => {
  const config = gameQuestionTimerConfig({
    time_limit_seconds: 30,
    remaining_seconds: 27,
    deadline_at: "2026-08-08T10:00:30Z",
    server_now: "2026-08-08T10:00:03Z",
  }, {}, Date.parse("2026-08-08T09:59:00Z"));
  assert.equal(config.enabled, true);
  assert.equal(config.limitSeconds, 30);
  assert.equal(config.remainingSeconds, 27);

  const deadlineOnly = gameQuestionTimerConfig({
    timer: { deadline_at: "2026-08-08T10:00:10Z" },
  }, {}, Date.parse("2026-08-08T10:00:00Z"));
  assert.equal(Math.round(deadlineOnly.remainingSeconds), 10);

  const waiting = gameQuestionTimerConfig({
    timer_status: "waiting",
    time_limit_seconds: 30,
    remaining_seconds: 30,
  });
  assert.equal(waiting.status, "waiting");
  assert.equal(waiting.enabled, false);

  const expired = gameQuestionTimerConfig({
    timer_status: "expired",
    time_limit_seconds: 30,
    remaining_seconds: 4,
  });
  assert.equal(expired.enabled, true);
  assert.equal(expired.remainingSeconds, 0);
  assert.equal(formatGameTimerSeconds(65), "1:05");
});

test("lives and terminal responses remain server-owned", () => {
  assert.equal(gameLivesRemaining({ initial_lives: 3 }), 3);
  assert.equal(gameLivesRemaining({ lives_remaining: 1 }), 1);
  assert.equal(isGameTerminalResponse({ status: "game_over" }), true);
  assert.equal(isGameTerminalResponse({ status: "failed" }), true);
  assert.equal(isGameTerminalResponse({ status: "next", question: {} }), false);
});

test("game counts are always complete 4 plus 1 rounds and capped at 25", () => {
  assert.deepEqual(gameQuestionOptions(4), []);
  assert.deepEqual(gameQuestionOptions(17), [5, 10, 15]);
  assert.deepEqual(gameQuestionOptions(100), [5, 10, 15, 20, 25]);
});

test("start payload deduplicates topic codes and rejects non-round counts", () => {
  assert.deepEqual(
    buildGameStartPayload({
      token: "jwt",
      topicCodes: ["5-MAT-1", "5-MAT-1", "5-MAT-2"],
      questionCount: 10,
      gameMode: "bridge",
    }),
    {
      token: "jwt",
      topic_codes: ["5-MAT-1", "5-MAT-2"],
      question_count: 10,
      game_mode: "bridge",
    },
  );
  assert.throws(
    () => buildGameStartPayload({ token: "jwt", topicCodes: ["x"], questionCount: 12, gameMode: "bridge" }),
    /5 talik/,
  );
});
