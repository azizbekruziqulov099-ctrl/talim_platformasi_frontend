import test from "node:test";
import assert from "node:assert/strict";
import { clockNow, formatClock, gameLink, ratingDeltaText, resultText, secondsUntil, TIME_CONTROLS, FRIEND_CONTROLS } from "./games/gameRules.js";

test("clock ticks only for the side to move once the clock runs", () => {
  const state = { holat: "davom", navbat: "b", soat: { w: 60000, b: 30000 }, soat_yurmoqda: true, server_now: 1_000_000 };
  assert.deepEqual(clockNow(state, 1_004_000, 1_000), { w: 60000, b: 25000 });
  assert.deepEqual(clockNow({ ...state, soat_yurmoqda: false }, 1_004_000, 0), { w: 60000, b: 30000 });
  assert.equal(clockNow({ ...state, soat: null }, 0, 0), null);
  assert.equal(clockNow(state, 2_000_000, 0).b, 0);
});

test("clock formatting and countdowns", () => {
  assert.equal(formatClock(600000), "10:00");
  assert.equal(formatClock(61000), "1:01");
  assert.equal(formatClock(9450), "0:09.4");
  assert.equal(formatClock(null), "");
  assert.equal(secondsUntil(10_000, 4_000, 1_000), 5);
  assert.equal(secondsUntil(null, 0, 0), null);
});

test("results, rating deltas, links and controls", () => {
  assert.equal(resultText({ holat: "tugadi", sabab: "bekor", golib: "durang" }).title, "O‘yin bekor qilindi");
  assert.equal(resultText({ holat: "tugadi", natija: "galaba", golib: "w", men: "w", sabab: "vaqt" }).text, "Raqib: vaqti tugadi");
  assert.equal(resultText({ holat: "tugadi", natija: "galaba", golib: "w", men: "w", sabab: "mat" }).text, "MAT — shoh qochib qutula olmadi");
  assert.equal(ratingDeltaText(12), "+12");
  assert.equal(ratingDeltaText(-8), "-8");
  assert.equal(ratingDeltaText(null), "");
  assert.equal(gameLink("https://x.uz/", "shaxmat", "ab12cd"), "https://x.uz/#shaxmat=AB12CD");
  assert.ok(TIME_CONTROLS.every((t) => /\d+\+\d+/.test(t.kod)));
  assert.equal(FRIEND_CONTROLS[0].kod, "cheksiz");
});
