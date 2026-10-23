// REV162: bog'cha — haftalik reja, kurs tanlash chegaralari, AI bahosi, «O'zingiz sinab ko'ring», til tugmasi.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fanHolati, fanKaliti, haftalikReja, qoshsaBoladimi, rejaKvotasi, sinovSavollari, tanlovXatosi } from "./parent/bogchaReja.js";
import { unlockLessons, todayProgress } from "./kid/kidActivity.js";
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");
const Q2 = { yosh: 2, kun: 2, shanba: 3, jami: 5, til: 4 };

test("weekly plan follows the parents' examples", () => {
  assert.deepEqual(haftalikReja(["en"], Q2).hafta.map((d) => d.length), [1, 0, 1, 0, 1, 0, 0]);
  assert.ok(haftalikReja(["en", "ru"], Q2).hafta.slice(0, 6).every((d) => d.length === 1));
  assert.ok(haftalikReja(["en", "ru", "de", "fr"], Q2).hafta.slice(0, 6).every((d) => d.length === 2));
  const r = haftalikReja(["en", "ru", "de", "fr", "mat", "man", "olam"], Q2);
  assert.equal(r.faol.length, 5);
  assert.deepEqual(r.navbat, ["man", "olam"]);
  assert.deepEqual(r.hafta[6], []);
});

test("course picker blocks more than the age allows with a clear reason", () => {
  assert.equal(fanKaliti("Arab tili (izoh: rus)"), "ar");
  const t4 = { kurs_soni: 4, toliq: false };
  assert.equal(qoshsaBoladimi(["en", "ru", "de", "fr"], "mat", t4, Q2).sabab, "tarif");
  assert.equal(qoshsaBoladimi(["en", "ru", "de", "fr", "mat"], "man", { toliq: true }, Q2).sabab, "yosh");
  assert.equal(qoshsaBoladimi(["en", "ru", "de", "fr"], "es", { toliq: true }, Q2).sabab, "til");
  assert.match(tanlovXatosi(["en", "ru", "de", "fr", "es"], { toliq: true }, Q2), /bitta tilni tugatsin/);
});

test("lesson unlock uses the weekly plan quota when it exists", () => {
  const plan = { bogcha: true, limit: 2, fanlar: {}, darslar: {}, reja: { manba: "reja", bugun: { en: 1, ru: 0 }, faol: ["en", "ru"], navbat: [], keyingi: { ru: "Seshanba" } } };
  assert.equal(rejaKvotasi(plan, "Ingliz tili"), 1);
  assert.deepEqual(unlockLessons(["a", "b"], plan, "Ingliz tili").map((x) => x.open), [true, false]);
  assert.deepEqual(unlockLessons(["a"], plan, "Rus tili").map((x) => x.open), [false]);
  assert.equal(fanHolati(plan, "Rus tili").keyingi, "Seshanba");
  assert.equal(todayProgress(plan, "Rus tili").limit, 0);
  assert.equal(rejaKvotasi({ bogcha: true, limit: 2, fanlar: {}, reja: null }, "Rus tili"), null);   // reja yo'q — eski tartib
  assert.equal(rejaKvotasi({ bogcha: true, reja: { obuna_kerak: true } }, "Rus tili"), 0);
});

test("parent quiz builds picture questions from learned words", () => {
  const words = [["cat", "🐱"], ["dog", "🐶"], ["sun", "☀️"], ["fish", "🐟"]].map(([soz, emoji]) => ({ soz, emoji, til: "en", kalit: "en" }));
  const q = sinovSavollari(words, { soni: 4, seed: 3 });
  assert.equal(q.length, 4);
  const top = q.find((x) => x.turi === "top");
  assert.equal(top.variantlar.filter((v) => v.togri).length, 1);
  assert.ok(q.some((x) => x.turi === "ayt"));
  assert.deepEqual(sinovSavollari(words.slice(0, 1)), []);
});

test("parent centre, admin prices, language switch and profile relation are wired", () => {
  const app = src("./App.jsx");
  assert.match(app, /<BolaMarkazi key=\{tanlanganBola\}/);
  assert.match(app, /kalit: "admin_bogcha"/);
  assert.match(app, /kb:open-account/);
  const pref = src("./interface/InterfacePreferences.jsx");
  assert.match(pref, /export function LanguageSwitch/);
  assert.match(pref, /<LanguageSwitch onSettings=/);
  const fam = src("./auth/FamilyProfiles.jsx");
  assert.match(fam, /Bu kim\?/);
  assert.match(fam, /kb-family-device/);
  const bm = src("./parent/BolaMarkazi.jsx");
  assert.match(bm, /\/api\/bogcha\/obuna\/buyurtma/);
  assert.match(bm, /PAY_HOSTS\.includes\(host\)/);
  assert.match(src("./index.css"), /button\.kb-family-switch/);
});
