import { test } from "node:test";
import assert from "node:assert/strict";
import { checkAnswer, sozJavobMos } from "./darsXonasiRules.js";
test("REV384: so'z javob — asosiy so'z yetadi, inkor bo'lsa yo'q", () => {
  assert.ok(checkAnswer("juft", "Juft son"));
  assert.ok(checkAnswer("juft", "6 — juft"));
  assert.ok(checkAnswer("Juft", "juft (6 : 2 = 3)"));
  assert.ok(checkAnswer("juft son", "juft son"));
  assert.ok(checkAnswer("toq", "toq|juft emas"));
  assert.ok(!checkAnswer("juft", "toq son"));
  assert.ok(!checkAnswer("juft", "juft emas"));
  assert.ok(!checkAnswer("emas", "toq emas"));
  assert.ok(!sozJavobMos("j", ["juft"]));
  assert.ok(checkAnswer("ötkir", "oʻtkir burchak"));   // yangi alifbo
  assert.ok(checkAnswer("12", "12 ta olma"));            // sonlar avvalgidek
});
import { tahrirMasofa, variantlarYasa } from "./darsXonasiRules.js";
test("REV385: imlo xatosi o'tadi (qo'shni harf, almashgan harf), lekin boshqa so'z o'tmaydi", () => {
  assert.ok(checkAnswer("jutf", "juft"));          // o'rni almashgan
  assert.ok(checkAnswer("jufd", "juft"));          // d ↔ t
  assert.ok(checkAnswer("kvadrat", "kvadrad"));
  assert.ok(checkAnswer("fotosintes", "fotosintez"));
  assert.ok(checkAnswer("uchburchakk", "uchburchak"));
  assert.ok(!checkAnswer("toq", "juft"));
  assert.ok(!checkAnswer("ot", "it"));             // qisqa so'z — aniq bo'lishi kerak
  assert.ok(!checkAnswer("juft", "toq emas"));
  assert.equal(tahrirMasofa("abc", "acb"), 1);
});
test("REV385: nazariy savolga variantlar — to'g'risi bitta, ha/yo'q — 2 ta, son — 4 ta", () => {
  const a = variantlarYasa({ id: "s1", javob: "juft" }, []);
  assert.ok(a && a.length === 2 && a.filter((x) => x.togri).length === 1 && a.some((x) => x.matn === "Toq"));
  const b = variantlarYasa({ id: "s2", javob: "12" }, []);
  assert.equal(b.length, 4); assert.equal(b.filter((x) => x.togri).length, 1); assert.ok(b.some((x) => x.matn === "12" && x.togri));
  const c = variantlarYasa({ id: "s3", javob: "ha" }, []);
  assert.deepEqual(c.map((x) => x.matn).sort(), ["Ha", "Yo‘q"]);
  const d = variantlarYasa({ id: "s4", javob: "kvadrat" }, [{ javob: "kvadrat" }, { javob: "doira" }, { javob: "uchburchak" }, { javob: "to‘rtburchak" }]);
  assert.equal(d.length, 4);
  assert.equal(variantlarYasa({ id: "s5", javob: "fotosintez" }, []), null);   // variant yo'q — yozib javob beradi
});
test("REV405: ustoz yozgan 2–6 ta variant aynan chiqadi, to'g'risi bitta", () => {
  const v = variantlarYasa({ id: "x1", javob: "5", variantlar: ["5", "4", "6", "3", "7", "8"] }, []);
  assert.equal(v.length, 6); assert.equal(v.filter((o) => o.togri).length, 1); assert.ok(v.find((o) => o.togri).matn === "5");
  assert.equal(variantlarYasa({ id: "x2", javob: "ha", variantlar: ["Ha", "Yo‘q"] }, []).length, 2);
});
