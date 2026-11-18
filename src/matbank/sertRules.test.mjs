import test from "node:test";
import assert from "node:assert/strict";
import { natijaXabari, qolganSekund, vaqtMatni, zaifBolimlar } from "./sertRules.js";

test("vaqt matni va qolgan vaqt", () => {
  assert.equal(vaqtMatni(125), "02:05");
  assert.equal(vaqtMatni(-5), "00:00");
  assert.equal(qolganSekund(40, 600), 1800);
  assert.equal(qolganSekund(1, 999), 0);
});
test("natija xabari: 46 dan sertifikat", () => {
  assert.match(natijaXabari({ sertifikat: true, daraja: "B", ball: 56.2 }), /sertifikat darajasiga/);
  assert.match(natijaXabari({ sertifikat: false, ball: 40 }), /46 ball/);
});
test("zaif bo'limlar — eng past foiz tepada", () => {
  const z = zaifBolimlar([{ nom: "a", jami: 3, foiz: 90 }, { nom: "b", jami: 2, foiz: 10 }, { nom: "c", jami: 0, foiz: null }, { nom: "d", jami: 4, foiz: 50 }]);
  assert.deepEqual(z.map((x) => x.nom), ["b", "d", "a"]);
});
