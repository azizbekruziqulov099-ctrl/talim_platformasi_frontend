// REV670: pedagogika jonli doskasi qoidalari
import test from "node:test";
import assert from "node:assert/strict";
import { jadvalTahlil, kodTahlil, pedRejim, rangBolaklar, rangsiz, sxemaTahlil, zanjirTahlil } from "./pedDoska.js";
import { buyruq, jonliRejim, ovozMatni, yozishSozlari } from "./matDoska.js";

test("faqat 13.00.02 kursi pedagogika doskasida", () => {
  assert.ok(pedRejim("13.00.02 – TA’LIM VA TARBIYA NAZARIYASI VA METODIKASI"));
  assert.ok(jonliRejim("13.00.02 – Ta’lim va tarbiya nazariyasi va metodikasi"));
  assert.ok(jonliRejim("Matematika"));
  for (const f of ["Ingliz tili", "Pedagogika", "", null]) assert.ok(!pedRejim(f), String(f));
});

test("KOD", () => {
  assert.deepEqual(kodTahlil("Q=Qonuniyatlarni ochish | M=Mazmun, metod"), [{ h: "Q", soz: "Qonuniyatlarni ochish" }, { h: "M", soz: "Mazmun, metod" }]);
  assert.equal(kodTahlil("Q=Qonuniyat"), null);                 // bitta harf — kod emas
  assert.equal(kodTahlil("QMIBB"), null);
  assert.equal(kodTahlil("O'=O'qish | M=Mehnat")[0].h, "O'");
});

test("SXEMA, ZANJIR, JADVAL", () => {
  assert.deepEqual(sxemaTahlil("Vazifalar > A | B | C"), { markaz: "Vazifalar", shox: ["A", "B", "C"] });
  assert.equal(sxemaTahlil("Vazifalar > A"), null);
  assert.deepEqual(zanjirTahlil("1992 :: 2-iyul :: + Gerb | 1997 :: 29-avgust"), [{ bosh: "1992", izoh: ["2-iyul", "+ Gerb"] }, { bosh: "1997", izoh: ["29-avgust"] }]);
  assert.deepEqual(jadvalTahlil("Ta'lim | Tarbiya ;; BKM | Dunyoqarash"), { bosh: ["Ta'lim", "Tarbiya"], qatorlar: [["BKM", "Dunyoqarash"]] });
  assert.equal(jadvalTahlil("A | B ;; faqat bitta"), null);   // ustunlar soni teng emas
});

test("buyruq faqat katta harf bilan; rang teglari ovozga tushmaydi", () => {
  assert.equal(buyruq("KOD: Q=Qonuniyat | M=Mazmun").tur, "kod");
  assert.equal(buyruq("Kod: QMIBB").tur, "yoz");                // oddiy yozuv bo'lib qoladi
  assert.equal(buyruq("SXEMA: A > b | c").tur, "sxema");
  assert.equal(buyruq("ZANJIR: a | b").tur, "zanjir");
  assert.equal(buyruq("JADVAL: a | b ;; c | d").tur, "jadval");
  assert.equal(ovozMatni("[s]Qonuniyat[/s] — barqaror bog'liqlik"), "Qonuniyat — barqaror bog'liqlik");
  assert.equal(ovozMatni("SXEMA: A > b | c"), "");
  assert.ok(yozishSozlari({ tur: "kod", arg: "Q=a | M=b | I=c" }) > 20);
});

test("rangli bo'laklar", () => {
  assert.deepEqual(rangBolaklar("Bu [s]muhim[/s] va [k]1992[/k]"), [
    { t: "Bu ", rang: null }, { t: "muhim", rang: "s" }, { t: " va ", rang: null }, { t: "1992", rang: "k" }]);
  assert.equal(rangsiz("[y]atama[/y] va [p]e'tibor[/p]"), "atama va e'tibor");
  assert.deepEqual(rangBolaklar("oddiy"), [{ t: "oddiy", rang: null }]);
});

test("REV674: xalqaro baholash fanlari jonli doskada, boshqa fanlar o'zgarmaydi", () => {
  for (const f of ["Tabiiy fan", "Fan (fizika, kimyo, biologiya, geografiya)", "O‘qish savodxonligi", "Moliyaviy savodxonlik"]) assert.ok(jonliRejim(f), f);
  for (const f of ["Ingliz tili", "Tarix", "Biologiya", "Fizika", "Ona tili", "", null]) assert.ok(!jonliRejim(f), String(f));
});
