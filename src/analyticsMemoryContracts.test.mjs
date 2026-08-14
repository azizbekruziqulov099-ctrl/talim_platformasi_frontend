import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";


const analytics = readFileSync(new URL("./Analytics.jsx", import.meta.url), "utf8");


test("university context is invisible without active student capability", () => {
  assert.match(analytics, /has_university_student_access/);
  assert.match(analytics, /context\.type !== "university" \|\| hasUniversityStudentAccess/);
  assert.match(analytics, /<ContextTabs contexts=\{visibleContexts\}/);
});


test("memory analytics shows risk and recovery instead of only mastery", () => {
  assert.match(analytics, /Esdan chiqish xavfi/);
  assert.match(analytics, /forgetting_probability/);
  assert.match(analytics, /memory_status_label/);
  assert.match(analytics, /Qayta testda tiklangan/);
  assert.match(analytics, /previous_score/);
  assert.match(analytics, /latest_score/);
});


test("hidden or stale selected contexts are reset", () => {
  assert.match(analytics, /!visibleContexts\.some/);
  assert.match(analytics, /setContextId\(null\)/);
});
