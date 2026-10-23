// REV158: lab hamma pozada; ob-havo rasmi ustoz yuziga tushmaydi; haqiqiy soat va kalendar; yulduzlar dars tilida;
// o'yin va dars rasmi bir xil; naqsh bitta satrda; mikrofon hamma so'zni so'raydi.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { kalendarQadami, sanaQismlari } from "./kid/kalendar.js";
import { soatBurchaklari } from "./kid/devorSoat.js";
import { kidTaskModel } from "./lesson/kidLessonRules.js";
import { sozBolaklari } from "./lesson/sozAytish.js";

const src = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");

test("every teacher pose has a mouth overlay (lips move in every pose)", () => {
  const s = src("./kid/ustozlar.js");
  for (const t of ["sardor", "nilufar", "malika"]) {
    const blok = s.slice(s.indexOf(`  ${t}: {`), s.indexOf("\n  },", s.indexOf(`  ${t}: {`)));
    for (let p = 1; p <= 6; p += 1) {
      const line = blok.split("\n").find((l) => l.trim().startsWith(`${p}: {`));
      assert.ok(line && /og: \{ x: [\d.]+, y: [\d.]+, w: [\d.]+, (?:r: -?[\d.]+, )?skin: "#[0-9a-f]{6}" \}/.test(line), `${t} ${p}`);
    }
  }
  assert.match(src("./kid/UstozSahna.jsx"), /us-og-qatlam/);
});

test("weather picture goes to the board when the window is on the teacher's side", async () => {
  const s = src("./kid/UstozSahna.jsx");
  assert.match(s, /export function havoJoyi/);
  assert.match(s, /style=\{havoJoyi\(dz, xona\.doska\)\}/);
});

test("wall clock shows real time", () => {
  const b = soatBurchaklari(new Date(2026, 9, 21, 9, 30, 0));
  assert.equal(b.soat, 285); assert.equal(b.daqiqa, 180);
  assert.match(src("./kid/ustozlar.js"), /soat: \{ x: [\d.]+, y: [\d.]+, w: [\d.]+/);
});

test("calendar step: day, month, season, hour, year by age and lesson language", () => {
  const d = new Date(2026, 9, 21, 7, 52);
  assert.deepEqual(sanaQismlari(d), { kun: 2, oy: 9, fasl: 3, soat: 7, yil: 2026 });
  const uz23 = kalendarQadami({ til: null, izoh: "uz", yosh: 2, sana: d });
  assert.match(uz23.ovoz, /Bugun — chorshanba\. Hozir — kuz\./);
  const en23 = kalendarQadami({ til: "en", izoh: "uz", yosh: 2, sana: d });
  assert.match(en23.ovoz, /Bugun — chorshanba\. \[en\]Today is Wednesday\.\[\/en\] Endi sen ayt: \[en\]Wednesday\[\/en\] ⏸/);
  const de67 = kalendarQadami({ til: "de", izoh: "uz", yosh: 6, sana: d });
  assert.equal(de67.ovoz.replace(/\[(\w\w)\][\s\S]*?\[\/\1\]/g, "").replace(/[^\p{L}]/gu, ""), "", de67.ovoz);   // 6–7: o'zbekcha yo'q
  assert.match(de67.ovoz, /Wir haben das Jahr 2026/);
  const ru45 = kalendarQadami({ til: "ru", izoh: "uz", yosh: 4, sana: d });
  assert.match(ru45.ovoz, /\[ru\]Сегодня среда\.\[\/ru\] — chorshanba\./);   // 4–5: tarjima bir marta
  assert.match(ru45.ovoz, /Сейчас 7 часов/);
});

test("task model drops speaker names; mic asks every word of a step", () => {
  assert.equal(kidTaskModel("[en]Kabu: How many apples? Child: Twelve![/en]", "uz", "en", ["How many"]),
    "[en]Let’s say it together:[/en] [en]How many apples?[/en] ⏸ [en]Now let’s go on![/en]");
  const sp = "[en]Red.[/en] ⏸ [en]Blue.[/en] ⏸ [en]Green.[/en] ⏸ [en]Pink.[/en] ⏸ [en]Black.[/en] ⏸";
  assert.equal(sozBolaklari(sp, "en").filter((b) => b.soz).length, 5);
});

test("game uses the same drawn picture as the lesson; no toy book pictures for signs; stars in lesson language", () => {
  const s = src("./lesson/DarsXonasi.jsx");
  assert.match(s, /const ch = sozRasmi\(t\.word, t\.emoji\);/);
  assert.match(s, /const yulduzGap = /);
  assert.ok(!/if \(jimSanoq\.current >= 2\) mikYoq\.current = true;/.test(s), "jim bola uchun mikrofon o'chirilmaydi");
  assert.match(src("./kid/optionPic.js"), /if \(o\?\.picture && String\(o\.picture\)\.trim\(\)\) return null;/);
  assert.match(src("./kid/ustozSahna.css"), /\.us-qator\{display:flex;flex-wrap:nowrap/);
});
