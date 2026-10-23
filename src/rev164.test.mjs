// REV164: og'iz yuz qiyaligiga mos (qiyshiq emas) va matematika/mantiq darslarida bosib topiladigan o'yin.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { gameTargets, qoshimchaOyin, stepKind } from "./kid/kidStageRules.js";
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");

test("mouth overlay rotates with the head tilt", () => {
  assert.match(src("./kid/ustozSahna.css"), /rotate\(var\(--og-r,0deg\)\)/);
  assert.match(src("./kid/UstozSahna.jsx"), /"--og-r": `\$\{p\.og\.r \|\| 0\}deg`/);
  // og'iz har pozada rasmdagi asl og'iz joyida; bosh egilsa — biroz (±12° gacha) buriladi
  const rs = [...src("./kid/ustozlar.js").matchAll(/og: \{ x: [\d.]+, y: [\d.]+, w: [\d.]+, r: (-?[\d.]+),/g)].map((m) => Number(m[1]));
  assert.equal(rs.length, 18);
  assert.ok(rs.every((r) => Math.abs(r) <= 13));
  // eng katta («baqirgandek») ochilgan shakllar ishlatilmaydi — o'rtacha ochilgan og'iz
  assert.match(src("./kid/UstozSahna.jsx"), /OG_YUMSHOQ = \{ 3: 9, 6: 5, 8: 2 \}/);
});

const UZ = [
  { turi: "kirish", sarlavha: "🍎 Bo'sh va to'la savat", doska: "🕊️ Bo'sh va to'la savat", ovoz: "Salom" },
  { turi: "qoida", sarlavha: "🧺 Bo'sh", doska: "🧺 Bo'sh", ovoz: "Bo'sh" },
  { turi: "qoida", sarlavha: "🧺🍎🍎🍎🍎 To'la", doska: "🧺🍎🍎🍎🍎 To'la", ovoz: "To'la" },
  { turi: "amaliy", sarlavha: "Topshiriq · 🎲 Top-chi o'yini", doska: "O'yin vaqti! Men aytaman, sen rasmni bos: Bo'sh, To'la, Bitta.",
    ovoz: "O'yin vaqti! Men aytaman, sen rasmni barmog'ing bilan bos: Bo'sh, To'la, Bitta. Topsang — qarsak chal!" },
  { turi: "xulosa", sarlavha: "🌟 Bugun o'rgandik", doska: "🧺 Bo'sh  🧺🍎🍎🍎🍎 To'la", ovoz: "Esda tut" },
];

test("Uzbek math 'Top-chi' game (untagged voice) finds the lesson words", () => {
  const kinds = UZ.map((s) => stepKind(s, "Bo'sh va to'la savat"));
  assert.deepEqual(gameTargets(UZ[3], UZ, kinds).map((t) => t.word), ["Bo'sh", "To'la"]);
  assert.equal(qoshimchaOyin(UZ, kinds, ""), null);   // o'yin bor — qo'shilmaydi
});

test("review lesson without a tap game gets one before the summary", () => {
  const R = [
    { turi: "kirish", sarlavha: "🔁 Bitta va ko'p: takrorlaymiz", doska: "🔁 🍎", ovoz: "" },
    { turi: "qoida", sarlavha: "Eslaymiz: 🍎 🍎🍎🍎🍎🍎", doska: "🍎 Bitta\n🍎🍎🍎🍎🍎 Ko'p\n🧒🍬 👧🍬 Bittadan", ovoz: "" },
    { turi: "amaliy", sarlavha: "Topshiriq · 🏃 Harakatli o'yin", doska: "Sakra!", ovoz: "Sakra!" },
    { turi: "xulosa", sarlavha: "🏅 Bo'lim tugadi!", doska: "🏅", ovoz: "" },
  ];
  const kinds = R.map((s) => stepKind(s, "1-bo'lim takrori: Bitta va ko'p"));
  const x = qoshimchaOyin(R, kinds, "Barakalla!");
  assert.ok(x && x.turi === "amaliy");
  const words = gameTargets(x, R, kinds).map((t) => t.word);
  assert.deepEqual(words, ["Bitta", "Ko'p", "Bittadan"]);
  assert.match(src("./lesson/DarsXonasi.jsx"), /qoshimchaOyin\(dars,/);
});
