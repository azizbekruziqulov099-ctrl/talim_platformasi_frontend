import test from "node:test";
import assert from "node:assert/strict";
import { todayProgress, unlockLessons } from "./kid/kidActivity.js";

test("REV91: kunlik reja — o'tilganlar ochiq, qolganidan faqat kunlik qoldiq qadar yangi dars", () => {
  const plan = { bogcha: true, limit: 2, fanlar: { Ingliz: { ochildi: 1, tugadi: 1, qoldi: 1 } }, darslar: { A: { yulduz: 3, tugadi: true } } };
  const u = unlockLessons(["A", "", "B", "C", "D"], plan, "Ingliz");
  assert.deepEqual(u.map((x) => x.open), [true, false, true, false, false]);
  assert.equal(u[0].known, true);
  assert.equal(u[2].isNew, true);
  // boshqa fan o'z kvotasi bilan (bu fanga ta'sir qilmaydi)
  assert.deepEqual(unlockLessons(["X", "Y", "Z"], plan, "Matematika").map((x) => x.open), [true, true, false]);
  // reja yuklanmasa yoki bola emas — hammasi ochiq (hech narsa qotib qolmaydi)
  assert.deepEqual(unlockLessons(["A", "B"], null, "Ingliz").map((x) => x.open), [true, true]);
  assert.deepEqual(todayProgress(plan, "Ingliz"), { limit: 2, ochildi: 1, tugadi: 1, qoldi: 1, damOlish: undefined, kun: undefined });
  assert.equal(todayProgress({ bogcha: false }, "Ingliz"), null);
});
