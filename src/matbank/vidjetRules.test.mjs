import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
import { vidjetQatori, vidjetTahlil } from "./vidjetRules.js";

test("REV565: [[…]] qatorini tanish, pandoc yozuvi bilan ham", () => {
  assert.deepEqual(vidjetQatori("[[GRAFIK: x^2 | -3..3]]"), { tur: "GRAFIK", arg: "x^2 | -3..3" }); assert.deepEqual(vidjetQatori("[[DOSKA]]"), { tur: "DOSKA", arg: "" });
  assert.deepEqual(vidjetQatori("\\[\\[BIRLIK\\_AYLANA: 45\\]\\]"), { tur: "BIRLIK_AYLANA", arg: "45" }); assert.deepEqual(vidjetQatori("\\[\\[GRAFIK: a\\*x\\^2\\]\\]"), { tur: "GRAFIK", arg: "a*x^2" });
  for (const y of ["GRAFIK: x^2", "[GRAFIK: x]", "matn [[DOSKA]] matn", "", null, "[[grafik: x]]"]) assert.equal(vidjetQatori(y), null, String(y));
});

test("GRAFIK va INTEGRAL: ifoda, parametr, oraliqlar; xatolar aniq", () => {
  const g = vidjetTahlil("GRAFIK", "a*x^2+b*x+c | a=1, b=-2, c=-3 | -4..6 | -5..8"); assert.deepEqual([g.ifoda, g.parametrlar, g.xr, g.yr, g.integral], ["a*x^2+b*x+c", { a: 1, b: -2, c: -3 }, [-4, 6], [-5, 8], null]);
  assert.deepEqual(vidjetTahlil("GRAFIK", "sin(x)").parametrlar, {}); assert.equal(vidjetTahlil("GRAFIK", "sin(x) | -7..7").yr, null); assert.deepEqual(vidjetTahlil("GRAFIK", "k*x | k=0.5").parametrlar, { k: 0.5 }); assert.ok(vidjetTahlil("GRAFIK", "k*x | k=0,5").xato.includes("nuqta"));
  const i = vidjetTahlil("INTEGRAL", "x^2 | 0..2 | -1..3 | -1..5"); assert.deepEqual([i.integral, i.xr, i.yr], [{ a: 0, b: 2 }, [-1, 3], [-1, 5]]); assert.deepEqual(vidjetTahlil("INTEGRAL", "sin(x) | 0..3,14").integral, { a: 0, b: 3.14 });
  for (const [t, a, ch] of [["GRAFIK", "x^ | -3..3", "ifoda"], ["GRAFIK", "x^2=4", "ifoda"], ["GRAFIK", "x^2 | 6..-4", "oraliq"], ["GRAFIK", "x^2 | a=1", "ifodada yo'q"], ["GRAFIK", "a*x | a=bir", "parametr"], ["INTEGRAL", "x^2", "chegara"], ["INTEGRAL", "x^2 | 2..0", "oraliq"], ["GRAFIK", "", "ifoda"], ["RASM", "x", "noma'lum"], ["GRAFIK", "x^2 | -3..3 | x=1", "ifodada yo'q"]]) {
    const r = vidjetTahlil(t, a); assert.ok(r.xato && r.xato.includes(ch), `${t} ${a}: ${JSON.stringify(r)}`);
  }
});

test("birlik aylana va doska", () => {
  assert.equal(vidjetTahlil("BIRLIK_AYLANA", "45").burchak, 45); assert.equal(vidjetTahlil("BIRLIK_AYLANA", "").burchak, 30); assert.ok(vidjetTahlil("BIRLIK_AYLANA", "400").xato); assert.ok(vidjetTahlil("BIRLIK_AYLANA", "abc").xato);
  assert.deepEqual(vidjetTahlil("DOSKA"), { tur: "DOSKA" });
  assert.deepEqual(vidjetTahlil("CHIZMA", "romb   a=5  d1=6 d2=8"), { tur: "CHIZMA", arg: "romb a=5 d1=6 d2=8" }); assert.ok(vidjetTahlil("CHIZMA", "").xato);
});

// Haqiqiy darslardagi hamma [[…]] qatori tahlildan o'tishi kerak (dars fayli backend repozitoriysida; DARS_FAYL bilan yo'l berish mumkin).
const DARS_YOLI = process.env.DARS_FAYL || new URL("../../../talim_platformasi/modules/mat_bank_data/dars.json", import.meta.url);
test("REV565: HAQIQIY darslardagi barcha vidjet qatorlari to'g'ri", { skip: fs.existsSync(DARS_YOLI) ? false : "dars fayli topilmadi" }, () => {
  const D = JSON.parse(fs.readFileSync(DARS_YOLI, "utf8")).darslar; let n = 0;
  for (const [raqam, d] of Object.entries(D)) {
    const matnlar = [d.maqsad, d.oldin_bil, d.xatolar, d.esda_tut, d.tarix || "", ...d.tushuncha.map((t) => t.matn), ...d.misollar.map((m) => m.matn)];
    for (const mt of matnlar) for (const q of String(mt).split("\n")) { const v = vidjetQatori(q); if (!v) continue; n += 1; const r = vidjetTahlil(v.tur, v.arg); assert.ok(!r.xato, `${raqam}-mavzu «${q}»: ${r.xato}`);
      if (r.tur === "CHIZMA") assert.ok(d.geo && d.geo[r.arg], `${raqam}-mavzu: «${r.arg}» uchun hisoblangan shakl yo'q`); }
  }
  assert.ok(n >= 0);
});
