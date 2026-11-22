import test from "node:test";
import assert from "node:assert/strict";
import { boshHolat, tangaQosh, binoQur, binoNarxi, hamrohOch, sandiqOch, orolFoizi, BINO_NARXI, HAMROH_NARXI, BINOLAR } from "./games/orolHolat.js";

test("REV686 orol: sessiya tangasi faqat bir marta qo'shiladi", () => {
  let h = boshHolat();
  let r = tangaQosh(h, "s1", 70); h = r.holat; assert.equal(r.qoshildi, 70);
  r = tangaQosh(h, "s1", 70); assert.equal(r.qoshildi, 0); assert.equal(r.holat.tanga, 70);
  r = tangaQosh(h, "s2", -5); assert.equal(r.qoshildi, 0);
});
test("REV686 orol: bino qurish — narx, daraja va yetmagan tanga", () => {
  let h = { ...boshHolat(), tanga: BINO_NARXI[0] + BINO_NARXI[1] };
  let r = binoQur(h, "uy"); assert.ok(r.ok); h = r.holat; assert.equal(h.binolar.uy, 1);
  r = binoQur(h, "uy"); assert.ok(r.ok); h = r.holat; assert.equal(h.binolar.uy, 2); assert.equal(h.tanga, 0);
  r = binoQur(h, "uy"); assert.equal(r.ok, false); assert.equal(r.sabab, "tanga"); assert.equal(r.yetmaydi, BINO_NARXI[2]);
  assert.equal(binoQur(h, "yoq_bino").ok, false);
  h = { ...h, binolar: { uy: 3 } }; assert.equal(binoNarxi(h, "uy"), null); assert.equal(binoQur(h, "uy").sabab, "tola");
  assert.equal(orolFoizi(h), Math.round(3 / (BINOLAR.length * 3) * 100));
});
test("REV686 orol: hamroh — sotib olish va qayta tanlash bepul", () => {
  let h = { ...boshHolat(), tanga: HAMROH_NARXI };
  let r = hamrohOch(h, "mushuk"); assert.ok(r.ok); h = r.holat; assert.equal(h.tanga, 0); assert.equal(h.hamroh, "mushuk");
  assert.equal(hamrohOch(h, "toti").sabab, "tanga");
  r = hamrohOch(h, "mushuk"); assert.ok(r.ok); assert.equal(r.holat.tanga, 0);
});
test("REV686 orol: kunlik sandiq kuniga bir marta, ketma-ket kunlar sovg'ani oshiradi", () => {
  let h = boshHolat();
  let r = sandiqOch(h, "2026-11-22"); assert.ok(r.ok); assert.equal(r.sovga, 30); h = r.holat;
  assert.equal(sandiqOch(h, "2026-11-22").ok, false);
  r = sandiqOch(h, "2026-11-23"); assert.equal(r.olov, 2); assert.equal(r.sovga, 35); h = r.holat;
  r = sandiqOch(h, "2026-11-26"); assert.equal(r.olov, 1); assert.equal(r.sovga, 30);
});
