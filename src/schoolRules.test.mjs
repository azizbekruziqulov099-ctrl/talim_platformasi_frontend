import test from "node:test";
import assert from "node:assert/strict";
import { exerciseStars, lessonStars, starText } from "./games/schoolRules.js";

test("exercise stars follow par and mistakes", () => {
  assert.equal(exerciseStars({ tur: "yulduz", par: 2 }, 0, 2), 3);
  assert.equal(exerciseStars({ tur: "yulduz", par: 2 }, 0, 4), 2);
  assert.equal(exerciseStars({ tur: "yulduz", par: 2 }, 2, 3), 1);
  assert.equal(exerciseStars({ tur: "mat" }, 0), 3);
  assert.equal(exerciseStars({ tur: "mat" }, 2), 2);
  assert.equal(exerciseStars({ tur: "katak" }, 5), 1);
});

test("lesson stars and star text", () => {
  assert.equal(lessonStars([3, 3, 3]), 3);
  assert.equal(lessonStars([3, 3, 2]), 3);
  assert.equal(lessonStars([3, 2, 2]), 2);
  assert.equal(lessonStars([1, 1, 2]), 1);
  assert.equal(lessonStars([]), 1);
  assert.equal(starText(2), "⭐⭐☆");
});
