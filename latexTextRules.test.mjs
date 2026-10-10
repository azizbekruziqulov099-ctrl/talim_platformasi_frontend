import assert from "node:assert/strict";
import test from "node:test";
import { displayTextKeepingLatex, latexSegments } from "./latexTextRules.js";

test("til teglari yashiriladi, lat tegi saqlanadi", () => {
  const source = "[uz]Toping:[/uz] [lat]\\lim_{x\\to2}\\frac{\\frac1x-\\frac12}{x-2}[/lat]";
  assert.equal(
    displayTextKeepingLatex(source),
    "Toping: [lat]\\lim_{x\\to2}\\frac{\\frac1x-\\frac12}{x-2}[/lat]",
  );
});

test("murakkab formula bitta segment bo'lib qoladi", () => {
  const parts = latexSegments("Toping: [lat]\\lim_{x\\to2}\\frac{\\frac1x-\\frac12}{x-2}[/lat]");
  assert.equal(parts.length, 2);
  assert.equal(parts[1], "[lat]\\lim_{x\\to2}\\frac{\\frac1x-\\frac12}{x-2}[/lat]");
});

test("variantdagi qisqa kasr ham butun saqlanadi", () => {
  assert.equal(latexSegments("[lat]-\\frac14[/lat]")[0], "[lat]-\\frac14[/lat]");
});
