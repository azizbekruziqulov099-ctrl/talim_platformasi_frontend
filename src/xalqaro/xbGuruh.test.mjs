import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
import { azoBelgilari, foizRangi, oquvchiHolati, sana, sinfJamlamasi, xabarShabloni } from "./xbGuruhRules.js";

test("REV556: o'quvchi holati — kirish testi / tekshiruv / guruhda", () => {
  assert.equal(oquvchiHolati({ guruh: null, kirish: { kerak: true, tekshiruvda: false } }), "kirish");
  assert.equal(oquvchiHolati({ guruh: null, kirish: { kerak: true, tekshiruvda: true } }), "tekshiruv");
  assert.equal(oquvchiHolati({ guruh: { raqam: 2 }, kirish: { kerak: false } }), "guruhda");
  assert.equal(oquvchiHolati(null), "kirish");
});

test("REV556: guruh o'zgarishi xabari — yuqoriga tabrik, pastga dalda, yangi kelganga salom", () => {
  assert.match(xabarShabloni({ tur: "yuqoriga", eski: 2, yangi: 1 }).matn, /Tabriklaymiz.*\{y\}-guruhga.*\{e\}-guruhda/);
  const p = xabarShabloni({ tur: "pastga", eski: 1, yangi: 2 }); assert.equal(p.turi, "ogoh"); assert.match(p.matn, /mustahkamlab, yana ko‘tarilasiz/); assert.ok(!/yomon|past daraja/i.test(p.matn));
  assert.match(xabarShabloni({ tur: "yangi", eski: null, yangi: 3 }).matn, /qo‘shildingiz/);
  assert.equal(xabarShabloni(null), null); assert.equal(xabarShabloni({}), null);
});

test("REV556: o'qituvchi jadvali belgilari va sinf jamlamasi", () => {
  assert.deepEqual(azoBelgilari({ tekshiruvda: [], eslatma: [] }), []);
  const b = azoBelgilari({ tekshiruvda: [{ ball: 690, sabab: ["A", "B"] }], eslatma: ["C"] });
  assert.equal(b.length, 2); assert.deepEqual(b[0].sabablar, ["A", "B"]); assert.equal(b[0].ball, 690); assert.equal(b[1].tur, "eslatma");
  const j = sinfJamlamasi({ jami: 75, guruhlar: [{ soni: 30 }, { soni: 39 }], kutayotgan: [{ holat: "tekshiruvda" }, { holat: "kirish_testi_yoq" }, { holat: "kirish_testi_yoq" }] });
  assert.deepEqual(j, { jami: 75, guruhda: 69, guruhlar: 2, testsiz: 2, tekshiruvda: 1 });
  assert.deepEqual(sinfJamlamasi(null), { jami: 0, guruhda: 0, guruhlar: 0, testsiz: 0, tekshiruvda: 0 });
  assert.equal(foizRangi(80), "#1f8a4c"); assert.equal(foizRangi(60), "#1b6fd8"); assert.equal(foizRangi(30), "#c77d00");
  assert.equal(sana("2026-11-14T18:26:15+05:00").length, 10); assert.equal(sana(""), ""); assert.equal(sana("xato"), "");
});

test("REV556: yangi matnlarning hammasi rus va ingliz tiliga tarjima qilingan", async () => {
  const MATNLAR = (await import("./xbMatnlar.js")).default;
  const manba = fs.readFileSync(new URL("./XbGuruhlar.jsx", import.meta.url), "utf8") + fs.readFileSync(new URL("./xbGuruhRules.js", import.meta.url), "utf8");
  const matnlar = new Set([...manba.matchAll(/\b(?:T|tf)\("((?:[^"\\]|\\.)+)"/g)].map((m) => m[1]));
  for (const m of manba.matchAll(/matn: "((?:[^"\\]|\\.)+)"/g)) matnlar.add(m[1]);
  assert.ok(matnlar.size >= 40, `matnlar: ${matnlar.size}`);
  const yoq = [...matnlar].filter((s) => !(MATNLAR[s]?.ru && MATNLAR[s]?.en));
  assert.deepEqual(yoq, [], "tarjimasiz matnlar");
});
