import test from "node:test";
import assert from "node:assert/strict";
import { lastMoveAnimation, slideFrom, viewPos } from "./games/moveAnim.js";

test("REV93: yurish animatsiyasi yo'nalishi (oq va qora tomondan)", () => {
  assert.deepEqual(viewPos("a1", false), { col: 0, row: 7 });
  assert.deepEqual(viewPos("a1", true), { col: 7, row: 0 });
  assert.deepEqual(slideFrom("e2", "e4", false), { dx: 0, dy: 2 });    // pastdan yuqoriga keladi
  assert.deepEqual(slideFrom("e2", "e4", true), { dx: 0, dy: -2 });
  assert.deepEqual(slideFrom("g1", "f3", false), { dx: 1, dy: 2 });
  const a = lastMoveAnimation({ kod: "X", yurishlar_soni: 3, oxirgi: { p: ["c3", "e5", "g7"] } }, false);
  assert.deepEqual(a, { key: "X:3", to: "g7", dx: -4, dy: 4 });
  assert.equal(lastMoveAnimation({ oxirgi: null }, false), null);
});
