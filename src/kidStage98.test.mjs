import test from "node:test";
import assert from "node:assert/strict";
import { emojiPictures, kabuMood, kabuSpeech, stepActions, stickerKeys } from "./kid/kidStageRules.js";
import { KID_PITCH } from "./lesson/kidLessonRules.js";

test("REV98: so‘zdan jonli rasm — inglizcha bo‘lak birinchi", () => {
  assert.deepEqual(stickerKeys("Qarang, bu [en]Hello![/en] o‘zbekcha salom degani"), ["hello"]);
  assert.deepEqual(stickerKeys("[en]big[/en] va [en]small[/en]"), ["big", "small"]);
  assert.deepEqual(stickerKeys("Bu olma, bu mushuk, bu qizil"), ["red", "cat"]);
  assert.deepEqual(stickerKeys("Bugun yangi o‘yin"), []);
});

test("REV98: topshiriq harakatlari va robot holati", () => {
  assert.deepEqual(stepActions("Qani, qo'shiq aytamiz! Qo'l silkitamiz."), ["song", "say", "wave"]);
  assert.ok(stepActions("rasmni barmog‘ingiz bilan ko‘rsatasiz. Tayyor bo‘lsangiz — qarsak chaling!").includes("point"));
  assert.ok(stepActions("Tayyor bo‘lsangiz — qarsak chaling!").includes("clap"));
  assert.equal(kabuMood({ turi: "kirish" }, "speaking"), "wave talk");
  assert.equal(kabuMood({ turi: "amaliy" }, "waiting"), "think");
  assert.equal(kabuMood({ turi: "xulosa" }, "speaking"), "happy talk");
  assert.equal(kabuMood({ turi: "tushuncha" }, "waiting"), "");
  assert.equal(kabuMood(null, "happy"), "happy");
});

test("REV98: matndagi qahramon robot Kabu, ovoz iliqroq", () => {
  assert.equal(kabuSpeech("Salom, bolajonlar! Men — Kabutar qushcha. Gu-gu!"), "Salom, bolajonlar! Men — robot Kabu. Bip-bip!");
  assert.equal(kabuSpeech("Men Kabutar qushchaman."), "Men robot Kabuman.");
  assert.equal(kabuSpeech("[en]I am Kabutar the bird. Kabutar loves sports.[/en]"), "[en]I am Kabu the robot. Kabu loves sports.[/en]");
  assert.match(KID_PITCH, /^\+\d+Hz$/);
});

test("REV99: doskadagi emoji → kitob rasmi", () => {
  const map = { "👋": "/a", "🙋": "/b", "2⃣": "/c" };
  assert.deepEqual(emojiPictures("👋  🙋  👋\nHello", map), ["/a", "/b"]);
  assert.deepEqual(emojiPictures("2️⃣ two", map), ["/c"]);
  assert.deepEqual(emojiPictures("🐱 cat", null), []);
});
