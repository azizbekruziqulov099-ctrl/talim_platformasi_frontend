teacherFlowConimport assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const app = fs.readFileSync(path.join(here, "App.jsx"), "utf8");
const analytics = fs.readFileSync(path.join(here, "Analytics.jsx"), "utf8");

test("ordinary teacher menu no longer advertises institution creation", () => {
  assert.equal(app.includes("Maktab ochish / qo'shilish"), false);
  assert.equal(app.includes("Bog'cha ochish / qo'shilish"), false);
  assert.match(app, /nom: "Repetitorlik ochish"/);
  assert.match(app, /guruhMaqsadi: "repetitor"/);
});

test("all institution workspaces receive assigned-only creation capabilities", () => {
  assert.equal((app.match(/assignedOnly=\{!foydalanuvchi\?\.is_admin\}/g) || []).length, 4);
  assert.equal((app.match(/canCreateInstitution=\{Boolean\(foydalanuvchi\?\.is_admin\)\}/g) || []).length, 4);
});

test("teacher plan and inline wizard both expose repetitor group", () => {
  assert.ok((app.match(/setYangiSinfTuri\("repetitor"\)/g) || []).length >= 2);
  assert.match(app, /guruh_turi: yangiMaxsusSinf \? yangiSinfTuri : "sinf"/);
});

test("analytics has four distinct spirits and three working views", () => {
  for (const key of ["kindergarten", "school", "learning_center", "university"]) {
    assert.match(analytics, new RegExp(`${key}: \\{`));
  }
  assert.match(analytics, /\["journey", "Yo‘l xaritasi"\]/);
  assert.match(analytics, /\["evidence", "Bilim dalillari"\]/);
  assert.match(analytics, /\["next", "Keyingi qadam"\]/);
});
tracts.test.mjs
