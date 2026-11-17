import test from "node:test";
import assert from "node:assert/strict";
import { qadamBolimi, qadamBolimlari, bolimQadamlari, REPETITOR_BOLIMLAR } from "./darsXonasiRules.js";

const steps = [
  { sarlavha: "Hayotdan: Do'kondagi qarz", turi: "kirish" },
  { sarlavha: "Natural sonlar", turi: "tushuntirish" },
  { sarlavha: "Misol · Misol 1", turi: "amaliy", amaliy_turi: "misol" },
  { sarlavha: "Hayotdan: Kitob", turi: "tushuntirish" },
  { sarlavha: "Topshiriq · Mashq 3", turi: "amaliy", amaliy_turi: "topshiriq" },
  { sarlavha: "Tarixdan: Xorazmiy", turi: "xulosa" },
];

test("qadamlar bo'limlarga to'g'ri bo'linadi", () => {
  assert.deepEqual(steps.map(qadamBolimi), ["hayotdan", "dars", "dars", "hayotdan", "mashq", "tarix"]);
  assert.equal(bolimQadamlari(steps, "hayotdan").length, 2);
  assert.equal(bolimQadamlari(steps, "mashq").length, 1);
  assert.equal(bolimQadamlari(steps, "").length, 6);
  assert.equal(REPETITOR_BOLIMLAR.length, 6);
});

import { hayotMasalalari, ovozQadamlari } from "./darsXonasiRules.js";
test("tushuncha bir necha qadamga bo'linganda ham Hayotdan masalasi to'liq yig'iladi", () => {
  const st = [
    { sahna: "A", turi: "kirish", sarlavha: "Hayotdan: Qaytim", doska: "Sardor 100 ming so'm bilan bordi" },
    { sahna: "B", turi: "qoida", sarlavha: "Natural sonlar", doska: "Tartib" },
    { sahna: "C", turi: "qoida", sarlavha: "Hayotdan: Qaytim", doska: "$100-3\\cdot8$", ovoz: "Avval narx", rasm: "/x/H1.jpg" },
    { sahna: "C", turi: "qoida", sarlavha: "", doska: "$=76$", ovoz: "Qaytim 76" },
    { sahna: "D", turi: "qoida", sarlavha: "Hayotdan: Kitob", doska: "$x+130=240$", ovoz: "Noma'lum" },
    { sahna: "D", turi: "tushuntirish", sarlavha: "", doska: "$x=110$", ovoz: "Javob" },
  ];
  assert.deepEqual(st.map((s, i) => qadamBolimlari(st)[i]), ["hayotdan", "dars", "hayotdan", "hayotdan", "hayotdan", "hayotdan"]);
  const m = hayotMasalalari(st);
  assert.equal(m.length, 2);
  assert.equal(m[0].nom, "Qaytim"); assert.equal(m[0].shart, "Sardor 100 ming so'm bilan bordi");
  assert.equal(m[0].qadamlar.length, 2); assert.equal(m[0].rasm, "/x/H1.jpg");
  assert.equal(m[1].qadamlar.length, 2);
  assert.deepEqual(ovozQadamlari("Bir [1] ikki [2]"), ["Bir", "ikki"]);
});
