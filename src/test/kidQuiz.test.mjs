import test from "node:test";
import assert from "node:assert/strict";
import { isPreschoolLearner, kidOptions, kidPraise, kidTheme } from "./kidQuizRules.js";
import { lessonAudience, audienceLabels } from "../lesson/lessonAudience.js";
import { capitalizeTopic, kidTopicEmoji } from "../curriculum/kidTopics.js";
import { preschoolGroup, educationRole, learningReady } from "../workspace/educationRules.js";
import { stripSpeechTags } from "../speech/language.js";

test("kid options keep only filled variants and split picture from word", () => {
  const opts = kidOptions({ option_a: "🐱 cat", option_b: "🐶 dog", option_c: null, option_d: "" });
  assert.equal(opts.length, 2);
  assert.deepEqual(opts.map((o) => [o.letter, o.picture, o.word]), [["A", "🐱", "cat"], ["B", "🐶", "dog"]]);
  assert.equal(kidOptions({ option_a: "1️⃣5️⃣ fifteen", option_b: "x" })[0].picture, "1️⃣5️⃣");
  assert.equal(kidOptions({ option_a: "[en]red[/en]", option_b: "blue" })[0].word, "red");
  assert.ok(kidPraise(3));
  assert.equal(kidTheme("qiz"), "girl");
});

test("preschool learner, age groups and lesson audience", () => {
  assert.equal(preschoolGroup("3–4 yosh"), "3-4 yosh");
  assert.equal(preschoolGroup("4-6"), "");
  const kid = { role: "oquvchi", education_role: "bogcha", learning_profile: { role: "bogcha", age_group: "5-6 yosh" }, class: "5-6 yosh" };
  assert.equal(educationRole(kid), "bogcha");
  assert.equal(learningReady(kid), true);
  assert.equal(learningReady({ ...kid, class: "", learning_profile: { role: "bogcha" } }), false);
  assert.equal(isPreschoolLearner(kid), true);
  assert.equal(isPreschoolLearner({ role: "oquvchi", class: "5" }, "5"), false);
  assert.equal(isPreschoolLearner(null, "3-4 yosh"), true);
  assert.equal(lessonAudience("", "3-4 yosh"), "bogcha");
  assert.equal(lessonAudience("", "2 kurs"), "talaba");
  assert.equal(lessonAudience("", "7"), "oquvchi");
  assert.equal(audienceLabels("bogcha").teacher, "Kabutar qushcha");
});

test("kid topic tiles and display helpers", () => {
  assert.equal(kidTopicEmoji("ranglar"), "🌈");
  assert.equal(kidTopicEmoji("hayvonlar va ovozlari"), "🐾");
  assert.equal(capitalizeTopic("salom va xayr"), "Salom va xayr");
  assert.equal(stripSpeechTags("Qaysi [en]cat[/en]?"), "Qaysi cat?");
});
