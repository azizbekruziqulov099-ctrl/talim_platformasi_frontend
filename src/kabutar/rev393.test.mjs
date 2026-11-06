import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeSettings, suhbatKaliti } from "./kabutarAccountRules.js";
test("REV393: qadalgan (≤10), arxiv, ovozsiz, qoralama — tozalanadi va saqlanadi", () => {
  const s = normalizeSettings({ pinned: ["u1", "g2", "x9", "u1", ...Array.from({ length: 20 }, (_, i) => `u${i + 10}`)], archived: ["g5"], muted: ["u3"], drafts: { u1: "salom", g2: "  ", bad: "x" } });
  assert.equal(s.pinned.length, 10); assert.ok(s.pinned.includes("g2") && !s.pinned.includes("x9"));
  assert.deepEqual(s.archived, ["g5"]); assert.deepEqual(s.muted, ["u3"]); assert.deepEqual(s.drafts, { u1: "salom" });
  assert.equal(suhbatKaliti({ guruh_id: 7 }), "g7"); assert.equal(suhbatKaliti({ user_id: 3 }), "u3");
  assert.deepEqual(normalizeSettings({}).pinned, []);
});
