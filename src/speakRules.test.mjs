import test from "node:test";
import assert from "node:assert/strict";
import { foreignLanguage, gradeSpeech, normalizeSpoken, practiceTarget, similarity } from "./speech/speakRules.js";
import { kidOptions, listenMode } from "./test/kidQuizRules.js";

test("practice target comes from the board's first line and the voice language", () => {
  assert.deepEqual(practiceTarget({ ovoz: "Qarang: [en]cat[/en]", doska: "🐱 cat\nmushuk" }), { lang: "en", phrase: "cat" });
  assert.deepEqual(practiceTarget({ ovoz: "[ja]ねこ[/ja]", doska: "🐱 ねこ\nneko\nmushuk" }), { lang: "ja", phrase: "ねこ" });
  assert.deepEqual(practiceTarget({ ovoz: "[de]Eins. Zwei.[/de]", doska: "1️⃣ eins — bir\n2️⃣ zwei" }), { lang: "de", phrase: "eins" });
  assert.equal(practiceTarget({ ovoz: "Bu — uchburchak", doska: "🔺 uchburchak" }), null);   // til darsi emas
  assert.equal(foreignLanguage("Salom [ko]안녕[/ko]"), "ko");
});

test("speech grading is forgiving for small children", () => {
  assert.equal(normalizeSpoken("Hello, friend!"), "hello friend");
  assert.equal(normalizeSpoken("你 好！", "zh"), "你好");
  assert.equal(similarity("hello", "Hello!"), 1);
  assert.equal(gradeSpeech(["Thank you"], "Thank you!", "en").stars, 3);
  assert.equal(gradeSpeech(["thank"], "Thank you!", "en").stars, 2);
  assert.equal(gradeSpeech(["banana"], "Thank you!", "en").stars, 0);
  assert.equal(gradeSpeech(["مَرْحَبًا"], "مرحبا", "ar").stars, 3);   // harakatlar hisobga olinmaydi
  assert.equal(gradeSpeech([], "cat").stars, 0);
});

test("language options are listened to, not read", () => {
  const opts = kidOptions({ option_a: "🐱 [en]cat[/en]", option_b: "🙏 [en]Thank you![/en]", option_c: "👋 salom", option_d: "[en]dog[/en]" });
  assert.deepEqual(opts.map((o) => o.listen), ["picture", "audio", "", "audio"]);
  assert.equal(opts[0].word, "cat");
  assert.equal(opts[1].speech, "[en]Thank you![/en]");
  assert.equal(listenMode("", "🐱", "cat"), "");
});

test("REV90: savol chet so'zni aytmasa variant eshitiladi; o'tilgan darslar eslab qolinadi", async () => {
  const q = { option_a: "🚪 [en]Bye![/en]", option_b: "🙏 [en]Thanks[/en]" };
  assert.equal(kidOptions(q, "Sovg'a berishdi. Nima deysiz?")[0].listen, "audio");
  assert.equal(kidOptions(q, "Qaysi rasm [en]Bye![/en]?")[0].listen, "picture");
  const { lessonStars, markLessonDone, nextLessonIndex } = await import("./curriculum/kidProgress.js");
  const mem = new Map(); const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  assert.equal(nextLessonIndex(["a", "b"], storage), 0);
  markLessonDone("a", 3, storage); markLessonDone("a", 1, storage);
  assert.equal(lessonStars("a", storage), 3);
  assert.equal(nextLessonIndex(["a", "", "b"], storage), 2);
});
