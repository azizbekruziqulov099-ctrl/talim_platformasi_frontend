import assert from "node:assert/strict";
import test from "node:test";
import { questKey, questProgress, testResultLevel } from "./learningQuestRules.js";

test("sinf yosh bosqichlari to'g'ri ajraladi", () => {
  assert.equal(questKey("1-sinf"), "junior");
  assert.equal(questKey(4), "junior");
  assert.equal(questKey(5), "middle");
  assert.equal(questKey("9-sinf"), "middle");
  assert.equal(questKey(10), "senior");
  assert.equal(questKey(11), "senior");
});

for (const total of [20, 25, 28]) {
  test(`${total} savol beshta bekatda to'liq yakunlanadi`, () => {
    let previous = 0;
    for (let answered = 0; answered <= total; answered += 1) {
      const state = questProgress({ totalQuestions: total, answeredCount: answered, correctCount: answered });
      assert.ok(state.openedStages >= previous);
      assert.ok(state.openedStages >= 0 && state.openedStages <= 5);
      previous = state.openedStages;
    }
    assert.equal(questProgress({ totalQuestions: total, answeredCount: total, correctCount: total }).openedStages, 5);
  });
}

test("xavfsiz chegaralar va natija darajalari", () => {
  assert.deepEqual(
    questProgress({ totalQuestions: 25, answeredCount: 30, correctCount: 40 }),
    { total: 25, answered: 25, correct: 25, openedStages: 5, activeStage: 4, questionsToNext: 0, percent: 100 },
  );
  assert.equal(testResultLevel(49).key, "repair");
  assert.equal(testResultLevel(70).key, "steady");
  assert.equal(testResultLevel(95).key, "master");
});
