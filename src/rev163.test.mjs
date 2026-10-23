// REV163: bola telefoni kodi, kursga bog'langan tarif, server xato kodlari, bola ekranidagi bugungi reja.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { XATO_MATN, fanHolati, qoshsaBoladimi, tanlovChegarasi, tanlovXatosi, xatoMatni } from "./parent/bogchaReja.js";
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");
const Q = { yosh: 4, kun: 3, shanba: 3, jami: 8, til: 5 };

test("course-bound tariff only allows its courses", () => {
  const t = { kurs_soni: 3, kurslar: ["zh", "ja"], toliq: false };
  assert.equal(tanlovChegarasi(t, Q), 2);
  assert.equal(qoshsaBoladimi([], "en", t, Q).sabab, "kurs");
  assert.equal(qoshsaBoladimi([], "zh", t, Q).ok, true);
  assert.match(tanlovXatosi(["en"], t, Q), /faqat unda/);
});

test("server error codes become fixed translatable phrases", () => {
  assert.equal(xatoMatni({ code: "tanlov_yosh", message: "x" }), XATO_MATN.tanlov_yosh);
  assert.equal(xatoMatni({ code: "", message: "boshqa" }), "boshqa");
  assert.ok(XATO_MATN.kod_yoq && XATO_MATN.telegram);
});

test("rejadan tashqari fan (musiqa) eski tartibda qoladi", () => {
  const plan = { reja: { manba: "obuna", bugun: { en: 1 }, faol: ["en"], navbat: [] } };
  assert.equal(fanHolati(plan, "Musiqa"), null);
  assert.equal(fanHolati(plan, "Ingliz tili").turi, "bor");
});

test("child device code: parent card, login panel, link param, kid badges", () => {
  const fam = src("./auth/FamilyProfiles.jsx");
  assert.match(fam, /\/device-code`/);
  assert.match(fam, /bola_kodi=\$\{q\.code\}/);
  const login = src("./auth/KabutarLogin.jsx");
  assert.match(login, /\/auth\/profiles\/device-login/);
  assert.match(login, /BOLA_QURILMA_KEY/);
  assert.match(src("./App.jsx"), /!bolaQurilmasi\(\)/);
  assert.match(src("./kid/BogchaOlami.jsx"), /ol-fan-badge is-bor/);
  assert.match(src("./curriculum/LearnerTopics.jsx"), /holat:fanHolati\(plan,sub\.nom\)/);
});
