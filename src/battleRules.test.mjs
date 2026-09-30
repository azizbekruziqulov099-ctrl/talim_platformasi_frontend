import test from "node:test";
import assert from "node:assert/strict";
import { BATTLE_CODE_KEY, OPTION_STYLES, battleLink, medal, myPlaceText, normalizeCode, secondsLeft, timeFraction } from "./battle/battleRules.js";

test("battle code is normalized to 6 upper-case letters/digits", () => {
  assert.equal(normalizeCode(" ab-c1 23x9 "), "ABC123");
  assert.equal(normalizeCode(null), "");
  assert.equal(BATTLE_CODE_KEY, "kabutar:bellashuv-kod");
});

test("share link puts the code into the hash (survives login redirects)", () => {
  assert.equal(battleLink("https://kabutar.uz/", "abc123"), "https://kabutar.uz/#bellashuv=ABC123");
});

test("timer uses the server clock offset", () => {
  const state = { phase: "question", savol_vaqti: 20, phase_ends_at: 50_000 };
  // mijoz soati 5 s orqada: offset +5000
  assert.equal(secondsLeft(state, 35_000, 5_000), 10);
  assert.equal(timeFraction(state, 35_000, 5_000), 0.5);
  assert.equal(secondsLeft(state, 60_000, 0), 0);
  assert.equal(timeFraction({ ...state, phase: "reveal" }, 35_000, 0), 0);
  assert.equal(secondsLeft(null, 1, 0), 0);
});

test("medals, place text and 4 distinct option colours", () => {
  assert.deepEqual([1, 2, 3, 4].map(medal), ["🥇", "🥈", "🥉", "4."]);
  assert.equal(myPlaceText({ men: { orin: 2, ochko: 1450 } }), "2-o‘rin · 1450 ochko");
  assert.equal(myPlaceText({}), "");
  assert.equal(new Set(OPTION_STYLES.map((o) => o.color)).size, 4);
});
