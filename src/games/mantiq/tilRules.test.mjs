import test from "node:test"; import assert from "node:assert/strict";
import { plitkalar, anagramYasa, anagramTogri, zanjirYasa, imloYasa, gapYasa, gapTogri } from "./tilRules.js";
import { SOZLAR, IMLO, GAPLAR } from "./tilData.js";

test("ma'lumot: 3 til × 3 daraja, takror yo'q, imloda to'g'ri ≠ xato", () => {
  for (const til of ["uz", "ru", "en"]) { assert.equal(SOZLAR[til].length, 3); assert.equal(IMLO[til].length, 3); assert.equal(GAPLAR[til].length, 3);
    for (const d of [0, 1, 2]) { assert.ok(SOZLAR[til][d].length >= 40); assert.equal(new Set(SOZLAR[til][d]).size, SOZLAR[til][d].length, `${til} ${d} takror so'z`);
      assert.ok(IMLO[til][d].length >= 12 && GAPLAR[til][d].length >= 12);
      for (const [t, x, q] of IMLO[til][d]) { assert.notEqual(t, x); assert.ok(q.length > 5); assert.ok(!IMLO[til][d].some(([t2]) => t2 === x), `xato variant boshqa joyda to'g'ri: ${x}`); } } }
});
test("o'zbekcha plitkalar: sh, ch, o‘, g‘ — bitta; tutuq belgisi oldingi harfda", () => {
  assert.deepEqual(plitkalar("shahar"), ["sh", "a", "h", "a", "r"]); assert.deepEqual(plitkalar("o‘quvchi"), ["o‘", "q", "u", "v", "ch", "i"]);
  assert.deepEqual(plitkalar("ma’no"), ["m", "a’", "n", "o"]); assert.deepEqual(plitkalar("tog‘"), ["t", "o", "g‘"]); assert.deepEqual(plitkalar("кот", "ru"), ["к", "о", "т"]);
});
test("anagramma: harflar so'zga teng, aralashgan; to'g'ri tuzilgani qabul qilinadi", () => {
  for (const til of ["uz", "ru", "en"]) for (const d of [0, 1, 2]) for (let u = 1; u <= 25; u += 1) { const t = anagramYasa(til, u, d);
    assert.deepEqual([...t.harflar].sort(), [...plitkalar(t.soz, til)].sort()); assert.ok(anagramTogri(til, plitkalar(t.soz, til), t.soz));
    if (t.uzun > 3) assert.notEqual(t.harflar.join(""), t.soz); }
});
test("so'z zanjiri: har qadamda aynan bitta variant kerakli harfdan boshlanadi", () => {
  for (const til of ["uz", "ru", "en"]) for (const d of [0, 1, 2]) for (let u = 1; u <= 10; u += 1) { const t = zanjirYasa(til, u, d);
    assert.ok(t.qadamlar.length >= 4, `${til} ${d} ${u}`);
    for (const q of t.qadamlar) { const mos = q.variantlar.filter((v) => plitkalar(v, til)[0].replace("’", "").toLowerCase() === q.harf); assert.equal(mos.length, 1); assert.equal(q.variantlar[q.togri], mos[0]); } }
});
test("imlo va gap: to'g'ri javob bor; gapda muqobil tartib qabul qilinadi", () => {
  for (const til of ["uz", "ru", "en"]) for (const d of [0, 1, 2]) { const im = imloYasa(til, 3, d); assert.equal(im.length, 8); for (const q of im) assert.equal(q.variantlar.length, 2);
    for (let u = 1; u <= 15; u += 1) { const g = gapYasa(til, u, d); assert.ok(gapTogri(g.gap.split(" "), g.qabul)); assert.deepEqual([...g.sozlar].sort(), g.gap.split(" ").sort()); } }
  assert.ok(gapTogri("Havo bugun juda issiq".split(" "), ["Bugun havo juda issiq", "Havo bugun juda issiq"]));
});
