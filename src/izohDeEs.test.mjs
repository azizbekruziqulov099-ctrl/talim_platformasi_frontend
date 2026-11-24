import test from "node:test";
import assert from "node:assert/strict";
import { darsIzohi, darsTiliIzoh } from "./kid/izohTil.js";

test("nemis va ispan izohli darslar o'zbekchaga tushmaydi", () => {
  const st = [{ ovoz: "Hallo! Heute lernen wir [en]cat[/en]." }];
  assert.equal(darsIzohi(st, "Ingliz tili (izoh: nemis)"), "de");
  assert.equal(darsIzohi(st, "Matematika (izoh: ispan)"), "es");
  assert.equal(darsTiliIzoh(st, "de", "Arab tili (izoh: nemis)"), "ar");
  assert.equal(darsIzohi([{ ovoz: "[es]¡Hola! Hoy aprendemos.[/es] [en]cat[/en]" }], ""), "es");
});
