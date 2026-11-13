import test from "node:test"; import assert from "node:assert/strict";
import { VILOYATLAR, viloyatYasa, DAVLATLAR, davlatYasa, ZONALAR, zonaYasa } from "./geoRules.js";

test("viloyatlar: 13 hudud, markazlari, ko'pburchaklar yaroqli", () => {
  assert.equal(VILOYATLAR.length, 13); assert.equal(new Set(VILOYATLAR.map((v) => v[0])).size, 13);
  const m = Object.fromEntries(VILOYATLAR.map((v) => [v[1], v[2]]));
  assert.equal(m["Qoraqalpog‘iston"], "Nukus"); assert.equal(m["Xorazm"], "Urganch"); assert.equal(m["Qashqadaryo"], "Qarshi"); assert.equal(m["Surxondaryo"], "Termiz"); assert.equal(m["Sirdaryo"], "Guliston"); assert.equal(m["Toshkent viloyati"], "Nurafshon");
  for (const v of VILOYATLAR) { const p = v[3].split(" ").map((q) => q.split(",").map(Number)); assert.ok(p.length >= 4 && p.flat().every((n) => Number.isFinite(n) && n >= 0 && n <= 300)); assert.ok(v[5].length > 3); }
  for (const d of [0, 1, 2]) for (let u = 1; u <= 15; u += 1) for (const q of viloyatYasa(u, d)) { assert.ok(VILOYATLAR.some((v) => v[0] === q.javob));
    if (q.tur === "markaz") { assert.equal(q.variantlar.length, 4); assert.equal(new Set(q.variantlar).size, 4); assert.equal(q.variantlar[q.togri], VILOYATLAR.find((v) => v[0] === q.javob)[2]); } }
});
test("davlatlar: takrorsiz, savollarda to'g'ri javob bitta", () => {
  assert.ok(DAVLATLAR.length >= 50); assert.equal(new Set(DAVLATLAR.map((x) => x[1])).size, DAVLATLAR.length); assert.equal(new Set(DAVLATLAR.map((x) => x[0])).size, DAVLATLAR.length);
  const p = Object.fromEntries(DAVLATLAR.map((x) => [x[1], x[2]])); assert.equal(p["Qozog‘iston"], "Ostona"); assert.equal(p["Avstraliya"], "Kanberra"); assert.equal(p["Turkiya"], "Anqara"); assert.equal(p["Kanada"], "Ottava"); assert.equal(p["Shveytsariya"], "Bern");
  for (const d of [0, 1, 2]) for (let u = 1; u <= 15; u += 1) { const t = davlatYasa(u, d); assert.equal(t.length, 8); for (const q of t) { assert.equal(q.variantlar.length, 4); assert.equal(new Set(q.variantlar).size, 4, JSON.stringify(q)); assert.ok(q.togri >= 0); } }
});
test("tabiat zonalari: har savolda bitta to'g'ri zona", () => {
  assert.equal(ZONALAR.length, 8);
  for (const d of [0, 1, 2]) for (let u = 1; u <= 15; u += 1) for (const q of zonaYasa(u, d)) { assert.equal(new Set(q.variantlar).size, q.variantlar.length); assert.ok(q.variantlar.length >= 3);
    assert.ok(ZONALAR.find((z) => z[0] === q.variantlar[q.togri])[1].some((x) => x[1] === q.matn)); }
});
