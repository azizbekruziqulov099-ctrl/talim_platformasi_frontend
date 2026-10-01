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

import { groupRows, rowKey, selectionSummary } from "./admin/miyaRules.js";
import { PRESCHOOL_GROUPS, preschoolGroup } from "./workspace/educationRules.js";

test("REV97: bog‘cha guruhlari 2-3 / 4-5 / 6-7 va miya tarkibi", () => {
  assert.deepEqual(PRESCHOOL_GROUPS, ["2-3 yosh", "4-5 yosh", "6-7 yosh"]);
  assert.equal(preschoolGroup("3-4 yosh"), "2-3 yosh");
  assert.equal(preschoolGroup("6–7 yosh"), "6-7 yosh");
  const rows = [{ sinf: "3-4 yosh", fan: "Matematika", miya_darslar: 10, mavzular: 3, testlar: 5 }, { sinf: "3-4 yosh", fan: "Rus tili", miya_darslar: 2, mavzular: 1, testlar: 0 }, { sinf: "5", fan: "Matematika", miya_darslar: 1, mavzular: 1, testlar: 1 }];
  assert.deepEqual(groupRows(rows).map(([g, r]) => [g, r.length]), [["3-4 yosh", 2], ["5", 1]]);
  assert.equal(rowKey(rows[0]), "3-4 yosh::matematika");
  const s = selectionSummary(rows.slice(0, 2), { miya: true, testlar: true });
  assert.equal(s.text, "12 ta miya darsi, 5 ta test");
  assert.equal(selectionSummary(rows, {}).any, false);
});
