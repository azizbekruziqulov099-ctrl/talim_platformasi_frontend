import test from "node:test";
import assert from "node:assert/strict";
import { kidRepeatSpeech, kidTakrorStep } from "./lesson/kidLessonRules.js";
import { contentLanguage, dropLeadingPraise, kidCorrectSpeech, kidPraise, kidPraiseLabel } from "./test/kidQuizRules.js";

test("REV102: «Qani, birga aytamiz!» dan keyin so'zlar pauza bilan qayta aytiladi", () => {
  const step = "🟢 [en]Green.[/en] — yashil. 👏 [en]Clap.[/en] — qarsak. Qani, birga aytamiz!";
  assert.equal(kidRepeatSpeech(step), `${step} [en]Green.[/en] ⏸ [en]Clap.[/en] ⏸`);
  // so'z buyruqdan keyin allaqachon aytilgan — o'zgarmaydi
  const taught = "Qara, bu — [en]Green.[/en] Men bilan ayt: [en]Green.[/en]";
  assert.equal(kidRepeatSpeech(taught), taught);
  // butun gap bitta inglizcha bo'lakda (6–7 yosh) — server o'zi pauza qo'yadi, matn o'zgarmaydi
  assert.equal(kidRepeatSpeech("[en]Apple. Banana. Say it together![/en]"), "[en]Apple. Banana. Say it together![/en]");
  assert.equal(kidRepeatSpeech("[en]Apple.[/en] [en]Banana.[/en] [en]Say it together![/en]"),
    "[en]Apple.[/en] [en]Banana.[/en] [en]Say it together![/en] [en]Apple.[/en] ⏸ [en]Banana.[/en] ⏸");
  assert.equal(kidRepeatSpeech("Bugun sanashni o'rgandik. Qani, birga aytamiz!"), "Bugun sanashni o'rgandik. Qani, birga aytamiz!");
  assert.equal(kidTakrorStep({ turi: "qoida" }), true);
  assert.equal(kidTakrorStep({ turi: "xulosa" }), false);
});

test("REV102: to'g'ri javob maqtovi savol tilida, o'zbekcha maqtov takrorlanmaydi", () => {
  assert.equal(contentLanguage("Qani, toping: [en]Mother[/en] qayerda?", ["👨 [en]father[/en]", "👩 [en]mother[/en]"]), "en");
  assert.equal(contentLanguage("Nechta olma bor?", ["2", "3"]), "");
  assert.equal(kidPraise(0, "en"), "[en]Well done![/en]");
  assert.equal(kidPraiseLabel(1, "ru"), "Правильно!");
  assert.equal(kidPraise(0, ""), "Barakalla!");
  assert.equal(dropLeadingPraise("Ofarin! 👩 [en]Mother[/en] — ona."), "👩 [en]Mother[/en] — ona.");
  assert.equal(kidCorrectSpeech(0, "en", "Barakalla! 👩 [en]Mother[/en] — ona."), "[en]Well done![/en] 👩 [en]Mother[/en] — ona.");
  assert.equal(kidCorrectSpeech(0, "", "Barakalla! Bu — olma."), "Barakalla! Bu — olma.");
  assert.equal(kidCorrectSpeech(1, "", "Bu — olma."), "Zo‘r! Juda to‘g‘ri! Bu — olma.");
});

test("REV102: rasm so'z bo'yicha — bir emoji ikki so'zda bo'lsa begona rasm chiqmaydi", async () => {
  const { emojiPictures, pictureFor, stepKind, kindCue, isReviewTopic, isReviewQuestion } = await import("./kid/kidStageRules.js");
  const map = { "👋": "/hello.png", "🐱": "/cat.png" };
  const words = { "👋|hello": "/hello.png", "👋|bye": "/bye.png", "🐱|cat": "/cat.png" };
  assert.equal(pictureFor("👋", "Bye!", map, words), "/bye.png");
  assert.equal(pictureFor("👋", "Good night", map, words), null);           // 👋 boshqa so'zlarniki — rasm yo'q
  assert.equal(pictureFor("🐱", "", map, words), "/cat.png");               // so'zsiz (o'yin doskasi), emoji bitta so'zniki — xavfsiz
  assert.equal(pictureFor("👋", "", map, words), null);                      // so'zsiz, emoji ikki so'zniki — qaysi biri noma'lum
  assert.equal(pictureFor("🐶", "dog", { "🐶": "/dog.png" }, words), "/dog.png");
  assert.deepEqual(emojiPictures("🟢 green\nyashil\n👋 Hello!\nsalom", { "🟢": "/green.png" }, words), ["/green.png", "/hello.png"]);
  // takror va yangi qadamlar
  assert.equal(stepKind({ turi: "qoida", sarlavha: "🔁 Eslaymiz: 👂 ears" }, "Salom va rahmat"), "review");
  assert.equal(stepKind({ turi: "qoida", sarlavha: "👋 Hello! — salom" }, "Salom va rahmat"), "new");
  assert.equal(stepKind({ turi: "qoida", sarlavha: "Eslaymiz: 🍎 🍌" }, "7-bo'lim takrori: Meva"), "review");
  assert.equal(stepKind({ turi: "amaliy", sarlavha: "🎲 Top-chi" }, "Salom"), "game");
  assert.equal(kindCue("new", "review", "Yangi so'z: [en]Hello![/en]", "Salom"), "Endi — yangi so‘z!");
  assert.equal(kindCue("review", "intro", "Esingdami? Bu — [en]ears[/en]", "Salom"), "Avval o‘tganlarni eslaymiz!");
  assert.equal(kindCue("new", "review", "[en]Look! Apple.[/en]", "Fruits"), "[en]Now, a new word![/en]");
  assert.equal(kindCue("review", "intro", "x", "3-bo'lim takrori: Kasblar"), "");
  assert.equal(isReviewTopic("O'tgan yilni eslaymiz") && isReviewTopic("Katta bayram: hammasini takrorlaymiz"), true);
  assert.equal(isReviewTopic("Salom va rahmat"), false);
  assert.equal(isReviewQuestion({ sarlavha: "🔁 Eski savol" }), true);
});

test("REV102: savol so'zni aytsa, rasmli variantlar ovoz bilan o'qilmaydi (javob aytib qo'yilmaydi)", async () => {
  const { kidOptions } = await import("./test/kidQuizRules.js");
  const q = { option_a: "🙏 [en]Thank you![/en]", option_b: "👋 [en]Hello![/en]" };
  assert.deepEqual(kidOptions(q, "Qani, toping: [en]Thank you![/en] qayerda?").map((o) => o.listen), ["picture", "picture"]);
  assert.deepEqual(kidOptions(q, "Ayiqcha sovg'a berdi. Nima deysiz?").map((o) => o.listen), ["audio", "audio"]);
});
