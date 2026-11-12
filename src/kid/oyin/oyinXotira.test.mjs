import test from "node:test"; import assert from "node:assert/strict";
import { raundTanla, raundImzo, mazmunKaliti, xatoniQaytar } from "./oyinXotira.js";
const R = (k, uz, tur = "tanlov") => ({ tur, togri: k, variantlar: [{ k, el: { k, uz } }, { k: "z", el: { k: "z", uz: "boshqa" } }] });
test("o'yin ichida takror yo'q, bugun ko'rilgani keyinga qoladi", () => {
  const hovuz = [R("a", "olma"), R("a", "olma"), R("b", "nok"), R("c", "anor"), R("d", "uzum")];
  const t = raundTanla(hovuz, 3, new Set(["e:nok"]));
  assert.equal(new Set(t.map(raundImzo)).size, 3); assert.deepEqual(t.map(mazmunKaliti), ["e:olma", "e:anor", "e:uzum"]);
});
test("ma'lumot kam bo'lsa ham R ta raund qaytadi", () => { assert.equal(raundTanla([R("a", "olma"), R("a", "olma")], 2).length, 2); });
test("xato raund 3 tadan keyin bir marta qaytadi, ko'pi bilan 2 ta", () => {
  let h = { raundlar: [1, 2, 3, 4, 5, 6].map((i) => R(`k${i}`, `n${i}`)), tugadi: false };
  h = xatoniQaytar(h, 0); assert.equal(h.raundlar.length, 7); assert.equal(h.raundlar[4].takror, true); assert.equal(h.raundlar[4].togri, "k1");
  h = xatoniQaytar(h, 4); assert.equal(h.raundlar.length, 7);   // takror raundning o'zi qayta qaytmaydi
  h = xatoniQaytar(h, 1); h = xatoniQaytar(h, 2); assert.equal(h.raundlar.filter((x) => x.takror).length, 2);
});
