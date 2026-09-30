import test from "node:test";
import assert from "node:assert/strict";
import { boardCells, clickSquare, completedMove, movablePieces, nextSteps, normalizeGameCode, resultText, shashkaLink, sqName } from "./games/shashkaRules.js";

const START = (() => {
  let s = "";
  for (let r = 0; r < 8; r += 1) for (let c = 0; c < 8; c += 1) s += (r + c) % 2 === 0 ? (r < 3 ? "w" : r > 4 ? "b" : ".") : ".";
  return s;
})();

test("board is drawn from the player's side", () => {
  const white = boardCells(START, "w");
  assert.equal(white.length, 64);
  assert.equal(white[0].name, "a8");
  assert.equal(white[63].name, "h1");
  assert.equal(white[56].name, "a1");
  assert.deepEqual(white[56].piece, { side: "w", king: false });
  assert.equal(white[56].dark, true);
  const black = boardCells(START, "b");
  assert.equal(black[0].name, "h1");
  assert.equal(black[63].name, "a8");
  assert.equal(black[62].name, "b8");
  assert.equal(black[62].piece.side, "b");
  assert.equal(black[63].piece, null);
  assert.equal(sqName(0), "a1");
  assert.equal(boardCells("W" + ".".repeat(63))[56].piece.king, true);
});

test("move selection walks a multi-jump path step by step", () => {
  const moves = [["c1", "e3", "g5"], ["c1", "e3", "c5"], ["a3", "b4"]];
  assert.deepEqual([...movablePieces(moves)].sort(), ["a3", "c1"]);
  let r = clickSquare(moves, [], "c1");
  assert.deepEqual(r.prefix, ["c1"]);
  assert.deepEqual([...nextSteps(moves, r.prefix)], ["e3"]);
  r = clickSquare(moves, r.prefix, "e3");
  assert.deepEqual(r.prefix, ["c1", "e3"]);
  assert.equal(r.submit, null);
  r = clickSquare(moves, r.prefix, "g5");
  assert.deepEqual(r.submit, ["c1", "e3", "g5"]);
  assert.deepEqual(r.prefix, []);
  // boshqa donani bosish tanlovni almashtiradi, noto'g'ri katak bekor qiladi
  assert.deepEqual(clickSquare(moves, ["c1"], "a3").prefix, ["a3"]);
  assert.deepEqual(clickSquare(moves, ["c1"], "h8").prefix, []);
  assert.deepEqual(clickSquare(moves, ["a3"], "b4").submit, ["a3", "b4"]);
  assert.equal(completedMove(moves, ["c1", "e3"]), null);
});

test("codes, links and result texts", () => {
  assert.equal(normalizeGameCode("ab-12cdx"), "AB12CD");
  assert.equal(shashkaLink("https://kabutar.uz/", "ab12cd"), "https://kabutar.uz/#shashka=AB12CD");
  assert.equal(resultText({ holat: "davom" }), null);
  assert.equal(resultText({ holat: "tugadi", natija: "galaba", golib: "w", men: "w", sabab: "taslim" }).text, "Raqib: taslim bo‘ldi");
  assert.equal(resultText({ holat: "tugadi", natija: "maglubiyat", golib: "b", men: "w", sabab: "vaqt" }).title, "Bu safar yutqazdingiz");
  assert.equal(resultText({ holat: "tugadi", natija: "durang", golib: "durang", sabab: "damkalar_durang" }).emoji, "🤝");
});
