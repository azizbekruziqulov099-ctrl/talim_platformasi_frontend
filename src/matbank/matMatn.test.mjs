import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
import { belgiTozala, bloklarga, formulaSoni, mavzuQidir, mavzuUlushi, natijaDarajasi, satrIchi, savolBloklari } from "./matMatn.js";

test("REV559: satr ichi — formulalar, qalin, kursiv, pandoc belgilari", () => {
  assert.deepEqual(satrIchi("Hisoblang: $a^2$ va $$x$$ **muhim** *eslatma*"),
    [{ t: "txt", s: "Hisoblang: " }, { t: "math", s: "a^2", d: false }, { t: "txt", s: " va " }, { t: "math", s: "x", d: true }, { t: "txt", s: " " }, { t: "b", s: "muhim" }, { t: "txt", s: " " }, { t: "i", s: "eslatma" }]);
  assert.equal(belgiTozala("1\\. A\\) tanlang"), "1. A) tanlang"); assert.equal(belgiTozala("a\\*b"), "a*b");
  // formula ichidagi * va \ tegilmaydi
  const m = satrIchi("$a \\cdot b * c$ va $\\frac{1}{2}$"); assert.equal(m.filter((x) => x.t === "math").length, 2); assert.equal(m[0].s, "a \\cdot b * c");
  assert.deepEqual(satrIchi("matn yo'q formula"), [{ t: "txt", s: "matn yo'q formula" }]); assert.deepEqual(satrIchi(""), []);
});

test("bloklar: sarlavha, ro'yxat, raqamli ro'yxat, abzats, ko'p qatorli formula", () => {
  const b = bloklarga("### Qoida\nBirinchi qator\nikkinchi qator\n\n1\\. Birinchi\n2\\. Ikkinchi\n\n-   $a$ teng\n-   $b$ teng\n\n$$\\begin{matrix}\nx = 1 \\\\\ny = 2\n\\end{matrix}$$\nOxiri");
  assert.deepEqual(b.map((x) => x.t), ["h", "p", "ol", "ul", "math", "p"]);
  assert.equal(b[0].s, "Qoida"); assert.equal(b[1].s, "Birinchi qator ikkinchi qator"); assert.deepEqual(b[2].items, ["Birinchi", "Ikkinchi"]); assert.equal(b[3].items.length, 2);
  assert.match(b[4].s, /^\\begin\{matrix\}[\s\S]+\\end\{matrix\}$/); assert.equal(b[5].s, "Oxiri");
  assert.deepEqual(bloklarga("$$x^2$$").map((x) => [x.t, x.s]), [["math", "x^2"]]); assert.deepEqual(bloklarga(""), []);
});

test("pandoc jadvali: ustunlar chiziqlar bo'yicha bo'linadi", () => {
  const j = "--------------------------------------------------\n$\\alpha$       $0^{\\circ}$    $30^{\\circ}$\n-------------- -------------- ----------------\n$\\sin\\alpha$   $0$            $\\frac{1}{2}$\n$\\cos\\alpha$   $1$            $\\frac{\\sqrt{3}}{2}$\n--------------------------------------------------\nKeyin matn";
  const b = bloklarga(j); assert.equal(b[0].t, "table"); assert.equal(b[0].head.length, 3);
  assert.deepEqual(b[0].rows, [["$\\sin\\alpha$", "$0$", "$\\frac{1}{2}$"], ["$\\cos\\alpha$", "$1$", "$\\frac{\\sqrt{3}}{2}$"]]); assert.equal(b[1].s, "Keyin matn");
  assert.equal(bloklarga("------\n").length, 0);   // jadvalsiz yolg'iz chiziq — tashlanadi
  // «ko'p qatorli jadval»: qatorlar orasida bo'sh qator; yopuvchi chiziqdan keyingi matn jadvalga kirmaydi
  const k = "-----------------------------\n$\\alpha$   $0$   $30$\n----------- ------- --------\n$\\sin$   $0$   $\\frac{1}{2}$\n\n$\\cos$   $1$   $2$\n\n$tg$   $0$   $3$\n-----------------------------\n\nKeyingi abzats";
  const kb = bloklarga(k); assert.equal(kb[0].t, "table"); assert.equal(kb[0].rows.length, 3); assert.equal(kb[1].s, "Keyingi abzats");
});

// Bank fayli backend repozitoriysida (talim_platformasi/modules/mat_bank_data/tematika.json). Papkalar qo'shni bo'lsa — haqiqiy bank sinaladi;
// topilmasa test o'tkazib yuboriladi (frontend repozitoriysi yolg'iz klonlanganda ham yiqilmasin). MAT_BANK_FAYL muhit o'zgaruvchisi bilan yo'l berish mumkin.
const BANK_YOLI = process.env.MAT_BANK_FAYL || new URL("../../../talim_platformasi/modules/mat_bank_data/tematika.json", import.meta.url);
const bankBor = fs.existsSync(BANK_YOLI);
test("REV559: HAQIQIY bank — qoida, misol va savollarning hammasi bloklarga bo'linadi; formulalar yo'qolmaydi", { skip: bankBor ? false : "bank fayli topilmadi (talim_platformasi repozitoriysi qo'shni papkada emas)" }, () => {
  const B = JSON.parse(fs.readFileSync(BANK_YOLI, "utf8"));
  let jami = 0, jadval = 0, formula = 0;
  const sana = (s) => (String(s).match(/\$\$[\s\S]+?\$\$|\$[^$\n][\s\S]*?\$/g) || []).length;
  for (const m of B.mavzular) for (const matn of [m.qoida, ...m.namunalar]) {
    if (!matn.trim()) continue; const bl = bloklarga(matn); assert.ok(bl.length > 0, `${m.raqam}: bo'sh`); jami += 1;
    jadval += bl.filter((x) => x.t === "table").length;
    const n = formulaSoni(bl); formula += n; assert.equal(n, sana(matn), `${m.raqam}: formulalar soni ${n} ≠ ${sana(matn)}`);   // hech biri tashlab yuborilmasin
    for (const x of bl) { assert.ok(!/(^|[^\\])\$\$?[^$]*$/.test(x.t === "p" ? satrIchi(x.s).filter((y) => y.t === "txt").map((y) => y.s).join("") : ""), `${m.raqam}: formula chegarasi matnga chiqib qoldi`); }
  }
  for (const m of B.mavzular) for (const t of m.testlar) for (const s of [t.savol, ...t.variantlar]) assert.equal(formulaSoni(savolBloklari(s)), sana(s), t.id);
  assert.ok(jami >= 220 && jadval >= 5 && formula > 2900, `${jami} matn, ${jadval} jadval, ${formula} formula`);
});

test("qidirish, ulush, daraja", () => {
  const r = [{ raqam: 31, nom: "Oraliqlar usuli", kitob: "1.7.3", testlar: 121 }, { raqam: 32, nom: "Parametrli tengsizliklar", kitob: "1.7.4", testlar: 20 }];
  assert.deepEqual(mavzuQidir(r, "ORALIQ").map((x) => x.raqam), [31]); assert.deepEqual(mavzuQidir(r, "32").map((x) => x.raqam), [32]); assert.deepEqual(mavzuQidir(r, "1.7").map((x) => x.raqam), [31, 32]);
  assert.equal(mavzuQidir(r, "").length, 2); assert.equal(mavzuQidir(r, "yo'q").length, 0);
  assert.equal(mavzuUlushi(r[0], { 31: { oxirgi_togri: 60 } }), 50); assert.equal(mavzuUlushi(r[1], {}), 0);
  assert.deepEqual([95, 75, 55, 20].map(natijaDarajasi), ["a‘lo", "yaxshi", "o‘rtacha", "takrorlash kerak"]);
});
