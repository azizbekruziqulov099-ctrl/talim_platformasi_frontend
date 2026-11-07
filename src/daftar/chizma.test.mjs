import { test } from "node:test";
import assert from "node:assert/strict";
import { shaklQismlari, tegadimi, chegara, sur, olcham, SHAKLLAR_2D, SHAKLLAR_3D } from "./chizmaRules.js";
test("REV400: har shakl chiziladi, 3D shakllarda orqa qirralar uzuq", () => {
  for (const [k] of [...SHAKLLAR_2D, ...SHAKLLAR_3D]) assert.ok(shaklQismlari({ t: "shakl", kind: k, x: 10, y: 10, w: 120, h: 100 }).length > 0, k);
  for (const k of ["kub", "silindr", "konus", "piramida", "prizma", "shar"]) assert.ok(shaklQismlari({ kind: k, x: 0, y: 0, w: 100, h: 100 }).some((q) => q.yash), k);
  assert.equal(shaklQismlari({ kind: "tortburchak", x: 100, y: 100, w: -50, h: -40 })[0].a[0], 50);   // teskari tortilganda ham
});
test("REV400: o'chirg'ich va tanlash — tegish, surish, o'lcham", () => {
  const ch = { t: "yoz", q: 3, n: [[0, 0], [100, 0]] };
  assert.ok(tegadimi(ch, [50, 4])); assert.ok(!tegadimi(ch, [50, 40]));
  const kv = { t: "shakl", kind: "tortburchak", x: 10, y: 10, w: 50, h: 50 };
  assert.ok(tegadimi(kv, [10, 35])); assert.ok(!tegadimi(kv, [35, 35]));
  assert.deepEqual(chegara(sur(kv, 5, 5)), { x: 15, y: 15, w: 50, h: 50 });
  assert.equal(chegara(olcham(ch, chegara(ch), 200, 0)).w, 200);
});
