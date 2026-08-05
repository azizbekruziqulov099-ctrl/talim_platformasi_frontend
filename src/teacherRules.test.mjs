import assert from "node:assert/strict";
import test from "node:test";
import {
  CLUB_STUDENT_LIMIT,
  apiErrorMessage,
  formatTopicTitle,
  freeClubAvailable,
  groupTypeLabel,
  normalizedClubCapacity,
} from "./teacherRules.js";

test("club capacity never exceeds the hard 25 student boundary", () => {
  assert.equal(normalizedClubCapacity("100"), CLUB_STUDENT_LIMIT);
  assert.equal(normalizedClubCapacity("12"), 12);
  assert.equal(normalizedClubCapacity(""), CLUB_STUDENT_LIMIT);
});

test("payment-required API objects show a human message", () => {
  assert.equal(
    apiErrorMessage({ code: "SECOND_CLUB_PAYMENT_REQUIRED", message: "Ikkinchi to'garak 50 000 so'm" }),
    "Ikkinchi to'garak 50 000 so'm",
  );
});

test("topic rows have one ordinal and one real title", () => {
  assert.equal(formatTopicTitle(0, { mavzu_name: "Kasrlar" }), "1-mavzu — Kasrlar");
  assert.equal(formatTopicTitle(1, { mavzu_name: "2-mavzu Tenglamalar" }), "2-mavzu — Tenglamalar");
  assert.equal(formatTopicTitle(2, { tartib_raqami: 7, kichik_name: "Geometriya" }), "7-mavzu — Geometriya");
  assert.equal(
    formatTopicTitle(0, { mavzu_name: "Birinchi mavzu", kichik_name: "So'z turkumlari" }),
    "1-mavzu — So'z turkumlari",
  );
});

test("repetitor is a first-class plan group type", () => {
  assert.equal(groupTypeLabel("repetitor"), "Repetitor guruhi");
  assert.equal(freeClubAvailable({ admin: false, bepul_yarata_oladi: false }), false);
  assert.equal(freeClubAvailable({ admin: true, bepul_yarata_oladi: false }), true);
});
