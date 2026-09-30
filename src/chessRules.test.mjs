import test from "node:test";
import assert from "node:assert/strict";
import { capturedPieces, chessCells, chessClick, figurine, parseFen, shaxmatLink, targetsFrom } from "./games/chessRules.js";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

test("FEN is parsed and drawn from the player's side", () => {
  const b = parseFen(START);
  assert.deepEqual(b[4], { side: "w", type: "k" });
  assert.deepEqual(b[59], { side: "b", type: "q" });
  const white = chessCells(START, "w");
  assert.equal(white[0].name, "a8");
  assert.equal(white[56].name, "a1");
  assert.equal(white[56].dark, true);
  assert.equal(white[60].piece.type, "k");
  const black = chessCells(START, "b");
  assert.equal(black[0].name, "h1");
  assert.equal(black[63].name, "a8");
  assert.equal(black[59].name, "e8");
  assert.equal(black[59].piece.type, "k");
});

test("selecting, moving and promotion choice", () => {
  const moves = [["e2", "e4"], ["e2", "e3"], ["g1", "f3"], ["e7", "e8", "q"], ["e7", "e8", "n"]];
  assert.deepEqual([...targetsFrom(moves, "e2").keys()], ["e4", "e3"]);
  let r = chessClick(moves, null, "e2");
  assert.equal(r.selected, "e2");
  r = chessClick(moves, "e2", "e4");
  assert.deepEqual(r.submit, ["e2", "e4"]);
  assert.equal(chessClick(moves, "e2", "g1").selected, "g1");     // boshqa figuraga o'tish
  assert.equal(chessClick(moves, "e2", "h5").selected, null);     // bo'sh joy — bekor
  r = chessClick(moves, "e7", "e8");
  assert.deepEqual(r.promotion, ["e7", "e8"]);
  assert.equal(r.submit, null);
});

test("figurine notation, captured pieces and links", () => {
  assert.equal(figurine("Nf3"), "♘f3");
  assert.equal(figurine("exd8=Q+"), "exd8=♕+");
  assert.equal(figurine("O-O"), "O-O");
  const lost = capturedPieces("rnb1kbnr/pppppppp/8/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1");
  assert.deepEqual(lost, { w: ["p"], b: ["q"] });
  assert.equal(shaxmatLink("https://x.uz", "ab12cd"), "https://x.uz/#shaxmat=AB12CD");
});
