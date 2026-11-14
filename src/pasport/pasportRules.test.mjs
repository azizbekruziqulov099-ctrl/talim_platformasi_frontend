import { test } from "node:test"; import assert from "node:assert/strict";
import { foizRangi, holatBolaklari, sanaQisqa, xalqaroDaraja } from "./pasportRules.js";

test("REV560: holat bo'laklari — foizlar yig'indisi aynan 100, bo'sh holatlar tashlanadi", () => {
  for (const h of [{ mustahkam: 19, takror: 0, unutilgan: 8, xato: 6 }, { mustahkam: 1, takror: 1, unutilgan: 1, xato: 0 }, { mustahkam: 7, takror: 7, unutilgan: 7, xato: 7 }, { mustahkam: 100 }, { xato: 3, mustahkam: 1 }, { mustahkam: 1, takror: 2, unutilgan: 3, xato: 4 }]) {
    const b = holatBolaklari(h); assert.equal(b.reduce((n, x) => n + x.foiz, 0), 100, JSON.stringify(h)); assert.ok(b.every((x) => x.soni > 0 && x.foiz >= 1));
    assert.deepEqual(b.map((x) => x.soni), ["mustahkam", "takror", "unutilgan", "xato"].map((k) => h[k] || 0).filter(Boolean));
  }
  assert.deepEqual(holatBolaklari({}), []); assert.deepEqual(holatBolaklari(null), []); assert.deepEqual(holatBolaklari({ mustahkam: 0, xato: 0 }), []);
});

test("rang, faollik, sana, daraja", () => {
  assert.deepEqual([80, 60, 40, 10].map(foizRangi), ["#1f8a4c", "#1b6fd8", "#e0a526", "#d9534f"]);
  assert.equal(sanaQisqa("2026-11-14T10:00:00+05:00").length, 10); assert.equal(sanaQisqa(null), ""); assert.equal(sanaQisqa("xato"), "");
  assert.deepEqual([700, 600, 500, 420, 300, null].map(xalqaroDaraja), ["Ilg‘or", "Yuqori", "O‘rta", "Past", "Boshlang‘ich", ""]);
});
