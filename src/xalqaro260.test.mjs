import test from "node:test";
import assert from "node:assert/strict";
import { ovozdanVariant, ovozdanJavob, uzSon, vaqtMatn, qolganVaqt, mavzuBelgi, darajaNomi, solishtirishQatorlari, javoblarSoni, sinfRaqami, chetSon } from "./xalqaro/xbRules.js";
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
  const pq = solishtirishQatorlari([["Singapur", 575], ["OECD o‘rtachasi", 472], ["O‘zbekiston", 364]], 430, 1);
  assert.deepEqual(pq.map((r) => r.nom), ["Singapur", "OECD o‘rtachasi", "Siz", "O‘zbekiston"]);   // PISA: markaz o'rniga OECD
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

import { readFileSync } from "node:fs";
test("REV261: menyuda alohida «Xalqaro baholash» — o'quvchi, o'qituvchi, admin; admin ko'rish rejimida ham", () => {
  const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  const bandlar = app.match(/kalit: "xalqaro", nom: "Xalqaro baholash"/g) || [];
  assert.equal(bandlar.length, 3);
  assert.match(app, /korinishRoli !== "ota-ona" && tab === "xalqaro"/);
  const ok = readFileSync(new URL("./admin/OquvchiKorinishi.jsx", import.meta.url), "utf8");
  assert.match(ok, /rejim="oquvchi"/);
  const hub = readFileSync(new URL("./xalqaro/XalqaroBaholash.jsx", import.meta.url), "utf8");
  assert.match(hub, /❌ Xatolarim/);
  assert.match(hub, /XbOqituvchi/);
});

test("REV270: ruscha va inglizcha ovozli javob", () => {
  assert.equal(chetSon(["двести", "тридцать", "пять"], "ru"), 235);
  assert.equal(chetSon(["one", "hundred", "and", "twelve"], "en"), 112);
  assert.equal(ovozdanJavob("двенадцать", "ru"), "12");
  assert.equal(ovozdanJavob("три целых пять", "ru"), "3,5");
  assert.equal(ovozdanJavob("три дробь четыре", "ru"), "3/4");
  assert.equal(ovozdanJavob("минус пять", "ru"), "-5");
  assert.equal(ovozdanJavob("ответ 48", "ru"), "48");
  assert.equal(ovozdanJavob("twenty-five", "en"), "25");
  assert.equal(ovozdanJavob("three point five", "en"), "3.5");
  assert.equal(ovozdanJavob("point two five", "en"), "0.25");
  assert.equal(ovozdanJavob("three over four", "en"), "3/4");
  assert.equal(ovozdanJavob("photosynthesis", "en"), "photosynthesis");
  assert.equal(ovozdanVariant("bee"), 1);
  assert.equal(ovozdanVariant("see"), 2);
  assert.equal(ovozdanVariant("вариант бэ"), 1);
  assert.equal(ovozdanVariant("the fourth"), 3);
});

test("REV270: diagramma nomlari shu tilda", () => {
  const ru = solishtirishQatorlari([["Сингапур", 605], ["Узбекистан", 421], ["США", 488]], 470, 1, "ru");
  assert.deepEqual(ru.map((r) => r.nom), ["Сингапур", "Международный центр", "Вы", "Узбекистан"]);
  assert.ok(ru.find((r) => r.nom === "Узбекистан").uz);
  const en = solishtirishQatorlari([["Singapore", 575], ["OECD average", 472], ["Uzbekistan", 364]], 430, 1, "en");
  assert.deepEqual(en.map((r) => r.nom), ["Singapore", "OECD average", "You", "Uzbekistan"]);
});

test("REV270: til bo'yicha so'rov va ovoz (manba kodi)", () => {
  const ovozJs = readFileSync(new URL("./xalqaro/xbOvoz.js", import.meta.url), "utf8");
  assert.match(ovozJs, /til = \(params && params\.til\) \|\| xbTil\(\)/);
  assert.match(ovozJs, /ovozMatni\(/);
  const tilJs = readFileSync(new URL("./xalqaro/xbTil.js", import.meta.url), "utf8");
  assert.match(tilJs, /startsWith\("ru"\) \? "ru" : s\.startsWith\("en"\) \? "en" : "uz"/);
  const hub = readFileSync(new URL("./xalqaro/XalqaroBaholash.jsx", import.meta.url), "utf8");
  assert.match(hub, /key=\{til\}/);   // til almashsa — bo'lim qaytadan (aralashmaydi)
  const panel = readFileSync(new URL("./xalqaro/XbOqituvchi.jsx", import.meta.url), "utf8");
  assert.match(panel, /Ta’lim tili/);
});
