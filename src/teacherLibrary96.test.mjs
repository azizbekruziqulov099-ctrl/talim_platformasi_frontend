import test from "node:test";
import assert from "node:assert/strict";
import { docsIn, errorText, fileUrl, formatSize, placeLabel } from "./teacher/libraryRules.js";

test("kutubxonam: joy nomi, hajm va fayl manzili", () => {
  assert.equal(placeLabel({ polka: "Testlar", qator: "Matematika" }), "Testlar › Matematika");
  assert.equal(placeLabel({}), "Saralanmagan");
  assert.equal(formatSize(512), "512 B");
  assert.equal(formatSize(2048), "2 KB");
  assert.equal(formatSize(3.5 * 1024 * 1024), "3.5 MB");
  assert.equal(fileUrl("http://x/", "t k", 7, true), "http://x/api/kutubxonam/hujjat/7/fayl?token=t+k&yuklab=1");
});

test("kutubxonam: polka/qator filtri va xato matni", () => {
  const docs = [{ id: 1, polka_id: 1, qator_id: 2 }, { id: 2, polka_id: 1, qator_id: 3 }, { id: 3, polka_id: null }];
  assert.deepEqual(docsIn(docs, 1).map((d) => d.id), [1, 2]);
  assert.deepEqual(docsIn(docs, 1, 3).map((d) => d.id), [2]);
  assert.deepEqual(docsIn(docs, "none").map((d) => d.id), [3]);
  assert.equal(errorText({ detail: "Fayl bo‘sh" }, 400), "Fayl bo‘sh");
  assert.equal(errorText({}, 413), "Fayl juda katta");
});

import { csvJournal, monthShift, monthTitle, money, todayIso } from "./teacher/journalRules.js";

test("to‘garak jurnali: oy, summa va CSV", () => {
  assert.equal(monthShift("2026-12", 1), "2027-01");
  assert.equal(monthShift("2026-01", -1), "2025-12");
  assert.equal(monthTitle("2026-10"), "Oktabr 2026");
  assert.equal(money(1500000), "1 500 000 so‘m");
  assert.equal(todayIso(new Date(2026, 0, 5)), "2026-01-05");
  const csv = csvJournal({ guruh: { oylik_summa: 300 }, hisob: { kutilgan: 600, yigilgan: 400, qarz: 200 },
    azolar: [{ ism: "Ali; Vali", oy_keldi: 3, oy_kech: 1, oy_kelmadi: 0, tolov_summa: 300, tolov_sana: "2026-10-02" },
      { ism: "Sardor", oy_keldi: 1, oy_kech: 0, oy_kelmadi: 2, tolov_summa: 100 }] });
  const lines = csv.split("\n");
  assert.equal(lines[1], '"Ali; Vali";3;1;0;300;2026-10-02;To‘lagan');
  assert.match(lines[2], /Qisman$/);
  assert.equal(lines.at(-1), "Qarz;200");
});
