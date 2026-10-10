import test from "node:test";
import assert from "node:assert/strict";
import { filterCourses, formatSana, groupDirections, initials, kunMatni, nextDate } from "./institutHayotiRules.js";

const kurslar = [
  { kurs: 1, soni: 3, guruhlar: [
    { guruh: "101-BT", soni: 2, talabalar: [{ user_id: 1, full_name: "Aliyev Sardor", yonalish_nomi: "Boshlang‘ich ta‘lim" }, { user_id: 2, full_name: "Karimova Dilnoza", yonalish_nomi: "Boshlang‘ich ta‘lim" }] },
    { guruh: "102-M", soni: 1, talabalar: [{ user_id: 3, full_name: "Rahimov Bekzod", yonalish_nomi: "Matematika" }] },
  ] },
  { kurs: 2, soni: 1, guruhlar: [{ guruh: "201-M", soni: 1, talabalar: [{ user_id: 4, full_name: "Tursunova Madina", yonalish_nomi: "Matematika" }] }] },
];

test("admin list filters by course and by name, group or direction", () => {
  assert.deepEqual(filterCourses(kurslar, 1).map((c) => c.kurs), [1]);
  assert.equal(filterCourses(kurslar, 0).length, 2);
  const byName = filterCourses(kurslar, 0, "dilnoza");
  assert.equal(byName.length, 1);
  assert.equal(byName[0].guruhlar[0].talabalar.length, 1);
  assert.equal(byName[0].soni, 1);
  assert.equal(filterCourses(kurslar, 0, "201").length, 1);
  assert.equal(filterCourses(kurslar, 0, "matematika").reduce((n, c) => n + c.soni, 0), 2);
  assert.deepEqual(groupDirections(kurslar[0].guruhlar[0].talabalar), ["Boshlang‘ich ta‘lim"]);
});

test("dates read naturally in Uzbek", () => {
  assert.equal(formatSana("2026-10-05", null, 2026), "5-oktabr");
  assert.equal(formatSana("2026-12-25", "2027-01-15", 2026), "25-dekabr — 15-yanvar, 2027");
  assert.equal(kunMatni(0), "Bugun");
  assert.equal(kunMatni(1), "Ertaga");
  assert.equal(kunMatni(7), "7 kun qoldi");
  assert.equal(kunMatni(null), "O‘tdi");
  assert.equal(initials("Aliyev Sardor"), "AS");
  assert.equal(nextDate([{ id: 1, otgan: true }, { id: 2, otgan: false }]).id, 2);
});
