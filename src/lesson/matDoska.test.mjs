// REV269: matematika jonli doskasi qoidalari
import test from "node:test";
import assert from "node:assert/strict";
import {
  bolishTahlil, buyruq, chizTahlil, doiraKasrTahlil, doskaQatorlari, esdaTut, grafikTahlil, ifodaFunksiya, kasrModelTahlil, matRejim,
  ovozMatni, qatorProgress, qisqartTahlil, sonOqiTahlil, ustunTahlil, yozishSozlari,
} from "./matDoska.js";

test("fan bo'yicha matematika rejimi", () => {
  for (const f of ["Matematika", "Algebra", "Geometriya", "Математика", "Mathematics", "Algebra va analiz asoslari"]) assert.ok(matRejim(f), f);
  for (const f of ["Ingliz tili", "Fizika", "", null]) assert.ok(!matRejim(f), String(f));
});

test("buyruqlar va yangi alifbo", () => {
  assert.deepEqual(buyruq("USTUN: 347+258"), { tur: "ustun", arg: "347+258" });
  assert.deepEqual(buyruq("$\\frac{1}{2}$ yarmi"), { tur: "yoz", arg: "$\\frac{1}{2}$ yarmi" });
  assert.equal(buyruq("BOLIŞ: 744:6").tur, "bolish");
  const c = buyruq("ÇIZ: uçburçak A(0;0) B(4;0) C(0;3); balandlik Ç");
  assert.equal(c.tur, "chiz");
  assert.ok(c.arg.startsWith("uchburchak"));
  // matnli buyruqda o'quvchi ko'radigan yozuv saqlanadi
  assert.deepEqual(buyruq("QOIDA: Ko‘paytiriş qoidasi"), { tur: "qoida", arg: "Ko‘paytiriş qoidasi" });
  assert.equal(buyruq("OÇIR").tur, "ochir");
});

test("DAVOM oldingi qatorga qo'shiladi", () => {
  const q = doskaQatorlari(["$\\frac{2}{3}\\cdot\\frac{4}{5}$", "DAVOM: $=\\frac{8}{15}$", "QOIDA: a", "OCHIR"]);
  assert.equal(q.length, 3);
  assert.deepEqual(q[0].qismlar.map((x) => x.n), [0, 1]);
  assert.equal(q[1].tur, "qoida");
  assert.equal(q[2].tur, "ochir");
});

test("yozilish darajasi so'zlarga qarab", () => {
  const cues = [0, 10, 20];
  assert.equal(qatorProgress(cues, 1, 5, 30, false), 0);
  assert.equal(qatorProgress(cues, 1, 14, 30, false), 0.5);
  assert.equal(qatorProgress(cues, 2, 29, 30, false), 1);
  assert.equal(qatorProgress(cues, 0, 0, 30, true), 1);
  // qisqa qator uzun gap davomida sudralmaydi
  assert.equal(qatorProgress([0], 0, 3, 60, false, 4), 1);
  assert.ok(yozishSozlari({ tur: "yoz", arg: "Yarmining yarmi" }) < yozishSozlari({ tur: "yoz", arg: "Kasrni kasrga ko‘paytirish uchun surat suratga ko‘paytiriladi" }));
});

test("ustun bilan hisob", () => {
  const q = ustunTahlil("347+258");
  assert.equal(q.natija, "605");
  assert.deepEqual(q.eslab, { 1: "1", 2: "1" });
  assert.equal(ustunTahlil("502-178").natija, "324");
  const k = ustunTahlil("46×23");
  assert.equal(k.natija, "1058");
  assert.deepEqual(k.qismlar.map((x) => x.trim()), ["138", "92"]);
  assert.equal(ustunTahlil("12000×3").natija, "36000");
  assert.equal(ustunTahlil("5-9"), null);
  assert.equal(ustunTahlil("abc"), null);
});

test("burchakli bo'lish", () => {
  const b = bolishTahlil("744:6");
  assert.equal(b.bolinma, "124");
  assert.equal(b.qoldiq, 0);
  assert.deepEqual(b.qadamlar.map((x) => [x.olingan, x.ayir]), [[7, 6], [14, 12], [24, 24]]);
  assert.equal(bolishTahlil("48000:4").bolinma, "12000");
  assert.equal(bolishTahlil("17:5").qoldiq, 2);
  assert.equal(bolishTahlil("5:0"), null);
});

test("kasrni qisqartirish", () => {
  assert.deepEqual(qisqartTahlil("6/12 -> 1/2 (:6)"), { eski: [6, 12], yangi: [1, 2], bol: 6 });
  assert.deepEqual(qisqartTahlil("15/60"), { eski: [15, 60], yangi: [1, 4], bol: 15 });
  assert.equal(qisqartTahlil("6/12 -> 1/3"), null);   // noto'g'ri qisqartirish chizilmaydi
});

test("son o'qi, grafik, chizma, modellar", () => {
  const s = sonOqiTahlil("-3..5; nuqta 2 A; nuqta 1/2");
  assert.equal(s.min, -3);
  assert.deepEqual(s.nuqtalar, [{ x: 2, yorliq: "A" }, { x: 0.5, yorliq: "1/2" }]);
  const f = ifodaFunksiya("x^2-4x+3");
  assert.equal(f(1), 0); assert.equal(f(3), 0); assert.equal(f(0), 3);
  assert.equal(ifodaFunksiya("2(x+1)")(2), 6);
  assert.equal(ifodaFunksiya("-x^2")(3), -9);
  assert.equal(ifodaFunksiya("sqrt(x)")(9), 3);
  assert.equal(ifodaFunksiya("\\frac{1}{x}")(4), 0.25);
  assert.equal(ifodaFunksiya("alert(1)"), null);
  assert.equal(ifodaFunksiya("x;y"), null);
  const g = grafikTahlil("y=1/x; [-2;2]");
  assert.ok(g.bolaklar.length >= 2);   // uzilish nuqtasida grafik bo'linadi
  const c = chizTahlil("uchburchak A(0;0) B(4;0) C(0;3); kesma CH; H(0;0); aylana O(2;1) r=1");
  assert.equal(c.shakllar[0].tur, "kopburchak");
  assert.ok(c.shakllar.some((x) => x.tur === "aylana"));
  assert.equal(chizTahlil("hech narsa"), null);
  assert.deepEqual(kasrModelTahlil("2/3 · 3/4"), { a: 2, b: 3, c: 3, d: 4, surat: 6, maxraj: 12 });
  assert.equal(kasrModelTahlil("5/3 · 1/2"), null);
  assert.deepEqual(doiraKasrTahlil("3/8"), { a: 3, b: 8 });
});

test("ovoz va «Esda tut»", () => {
  assert.equal(ovozMatni("USTUN: 347+258"), "347+258");
  assert.equal(ovozMatni("QISQART: 6/12 -> 1/2 (:6)"), "6/12 = 1/2");
  assert.equal(ovozMatni("GRAFIK: y=x^2"), "");
  assert.equal(ovozMatni("BELGILA: javob 5 aylana"), "javob 5");
  const steps = [{ doska: "QOIDA: $a\\cdot b$\nmatn" }, { doska: "QOIDA: ikkinchi" }, { doska: "QOIDA: uchinchi" }];
  assert.deepEqual(esdaTut(steps, 1), ["$a\\cdot b$", "ikkinchi"]);
});
