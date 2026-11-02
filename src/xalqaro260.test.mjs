import test from "node:test";
import assert from "node:assert/strict";
import { ovozdanVariant, ovozdanJavob, uzSon, vaqtMatn, qolganVaqt, mavzuBelgi, darajaNomi, solishtirishQatorlari, javoblarSoni, sinfRaqami } from "./xalqaro/xbRules.js";
import { chalkUnits, chalkSlice, lineProgress } from "./lesson/chalkRules.js";

test("ovozli variant: harf, tartib, kirill", () => {
  assert.equal(ovozdanVariant("Be"), 1);
  assert.equal(ovozdanVariant("javobim C"), 2);
  assert.equal(ovozdanVariant("to‘rtinchi variant"), 3);
  assert.equal(ovozdanVariant("бэ"), 1);
  assert.equal(ovozdanVariant("a"), 0);
  assert.equal(ovozdanVariant("bilmadim"), null);
});

test("ovozli son javobi", () => {
  assert.equal(uzSon(["yuz", "yigirma", "besh"]), 125);
  assert.equal(uzSon(["ming", "ikki", "yuz"]), 1200);
  assert.equal(ovozdanJavob("o‘n ikki"), "12");
  assert.equal(ovozdanJavob("uch butun besh"), "3,5");
  assert.equal(ovozdanJavob("to‘rtdan uch"), "3/4");
  assert.equal(ovozdanJavob("minus besh"), "-5");
  assert.equal(ovozdanJavob("javob 48 ta"), "48");
  assert.equal(ovozdanJavob("fotosintez"), "fotosintez");
});

test("vaqt va server farqi", () => {
  assert.equal(vaqtMatn(65000), "01:05");
  assert.equal(vaqtMatn(3725000), "1:02:05");
  const bosh = Date.parse("2026-11-03T10:00:00Z");
  // server soati 60 s oldinda — qolgan vaqt shunga qisqaradi
  assert.equal(qolganVaqt("2026-11-03T10:10:00Z", "2026-11-03T10:01:00Z", bosh, bosh), 9 * 60000);
});

test("mavzu belgisi, daraja, solishtirish", () => {
  assert.equal(mavzuBelgi(null).kalit, "yangi");
  assert.equal(mavzuBelgi({ urinilgan: 3, foiz: 85 }).kalit, "tayyor");
  assert.equal(darajaNomi(560), "Yuqori");
  assert.equal(darajaNomi(390), "Past darajadan quyi");
  const q = solishtirishQatorlari([["Singapur", 605], ["O‘zbekiston", 421], ["AQSH", 488]], 470, 1);
  assert.deepEqual(q.map((r) => r.nom), ["Singapur", "Xalqaro markaz", "Siz", "O‘zbekiston"]);
  assert.equal(javoblarSoni({ 0: "B", 1: "", 2: "12" }), 2);
  assert.equal(sinfRaqami("8-A"), 8);
  assert.equal(sinfRaqami("4-5 yosh"), 0);
});

test("harfma-harf yozish: birliklar va ulush", () => {
  const parts = [{ text: "Javob: " }, { math: "\\frac{3}{4}", html: "<b>3/4</b>" }];
  const u = chalkUnits(parts);
  assert.equal(u.sizes[0], 7);
  assert.equal(u.total, 7 + Math.max(3, Math.round(11 / 2)));
  assert.deepEqual(chalkSlice(parts, u, 3), [{ text: "Jav" }]);
  const s = chalkSlice(parts, u, 7 + 3);
  assert.equal(s[1].frac, 0.5);
  assert.equal(lineProgress([0, 4], 0, 1, 10), 0.5);
  assert.equal(lineProgress([0, 4], 1, 2, 10), 0);
  assert.equal(lineProgress([0, 4], 1, 9, 10), 1);
});
