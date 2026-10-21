// REV157: bog'cha 4–7 yosh — ustoz o'rganilayotgan tilda gapiradi (8 qo'shimcha til), buyruq+so'z bitta tegda ham ikki marta aytiladi.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { gap, GAPLAR, FEL_IZOH } from "./kid/izohTil.js";
import { ismOldin, kidTaskModel } from "./lesson/kidLessonRules.js";
import { kindCue } from "./kid/kidStageRules.js";
import { ochilish, qadamSozi } from "./kid/darsOchilishi.js";

const TILLAR = ["de", "fr", "es", "ar", "tr", "zh", "ja", "ko"];

test("every immersion language has all teacher phrases of English", () => {
  const en = Object.keys(GAPLAR.en);
  for (const t of TILLAR) {
    assert.deepEqual(Object.keys(GAPLAR[t]).sort(), [...en].sort(), t);
    for (const k of en) assert.equal((GAPLAR[t][k].match(/\{\w+\}/g) || []).sort().join(), (GAPLAR.en[k].match(/\{\w+\}/g) || []).sort().join(), `${t} ${k}`);
    assert.ok(FEL_IZOH[t]?.nilufar?.salom?.length === 3, t);
  }
});

test("German teacher speaks German: command and word, task model, cue", () => {
  const g = gap("de", "Endi sen ayt: {p}", { p: "[de]Hallo[/de]" });
  assert.equal(g, "[de]Jetzt sagst du es: Hallo[/de]");
  assert.equal(ismOldin(g), "[de]Hallo. Hallo! Jetzt sagst du es![/de] ⏸");
  assert.equal(kidTaskModel("[de]Klatsch![/de]", "uz", "de"), "[de]Sagen wir es zusammen:[/de] [de]Klatsch![/de] ⏸ [de]Jetzt geht es weiter![/de]");
  assert.equal(kindCue("review", "new", "x", "", "de"), "[de]Erinnern wir uns![/de]");
  // izoh rejimi (2–4 yosh) o'zgarmagan
  assert.equal(ismOldin("Endi sen ayt: [en]Hello[/en] ⏸"), "[en]Hello.[/en] [en]Hello![/en] Endi sen ayt! ⏸");
});

test("immersion opening has no Uzbek and no Uzbek lesson name", () => {
  const o = ochilish({ ustoz: "nilufar", til: "de", izoh: "de", grade: "4-5 yosh", oldingi: { mavzu: "Salom va xayr", sozlar: [{ say: "Hallo", emoji: "👋" }] }, vaqt: "kech" });
  for (const st of o) {
    const tashqi = st.ovoz.replace(/\[(\w\w)\][\s\S]*?\[\/\1\]/g, "").replace(/[^\p{L}]/gu, "");
    assert.equal(tashqi, "", st.ovoz);
    assert.ok(!/Salom va xayr/.test(st.ovoz));
  }
});

test("word step found when the word shares a tag with a class command", () => {
  const s = { sarlavha: "🙋 Ich heiße …", ovoz: "[de]Schau! Ich heiße …[/de] — mening ismim… [de]Du bist dran![/de]" };
  assert.deepEqual(qadamSozi(s), { say: "Ich heiße", emoji: "🙋", til: "de" });
});

test("DarsXonasi switches teacher language from 4 years in language lessons only", () => {
  const src = fs.readFileSync(new URL("./lesson/DarsXonasi.jsx", import.meta.url), "utf8");
  assert.match(src, /const immersiya = Boolean\(kid && darsTil && kidYoshi\(grade \|\| lesson\?\.topic\?\.sinf\) >= 4\);/);
  assert.match(src, /const tIzoh = immersiya \? darsTil : izoh;/);
  assert.ok(!/gap\(izoh, /.test(src), "DarsXonasi ustoz gaplari tIzoh orqali");
});
