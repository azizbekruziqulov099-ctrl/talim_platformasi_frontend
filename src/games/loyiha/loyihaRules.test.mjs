import test from "node:test"; import assert from "node:assert/strict";
import { osimlikOs, osimlikHolat, OSIMLIK_MAQSAD, KOPRIK_TUR, koprikHisob, koprikOtdi, KOD_XARITALAR, kodYurit, kodEngQisqa, NAQSH_NAMUNALAR, naqshOng, naqshXato, BYUDJET, byudjetHisob, yulduzHisob } from "./loyihaRules.js";

test("o'simlik: eng yaxshi sharoit — o'rtacha suv va yorug' joy; ortiqcha suv va qorong'ilik zarar", () => {
  let eng = [0, 0, 0];
  for (let s = 0; s <= 4; s += 1) for (let n = 0; n <= 3; n += 1) { const b = osimlikOs(s, n).at(-1); if (b > eng[2]) eng = [s, n, b]; assert.ok(osimlikOs(s, n).every((v, i, a) => i === 0 || v >= a[i - 1])); }
  assert.deepEqual(eng.slice(0, 2), [2, 2]); assert.ok(eng[2] >= OSIMLIK_MAQSAD); assert.ok(osimlikOs(4, 2).at(-1) < osimlikOs(2, 2).at(-1)); assert.ok(osimlikOs(2, 0).at(-1) < 5);
  assert.equal(osimlikHolat(0, 2), "qurigan"); assert.equal(osimlikHolat(4, 2), "chirigan"); assert.equal(osimlikHolat(2, 2), "soglom");
  const yetdi = []; for (let s = 0; s <= 4; s += 1) for (let n = 0; n <= 3; n += 1) if (osimlikOs(s, n).at(-1) >= OSIMLIK_MAQSAD) yetdi.push(`${s}${n}`);
  assert.ok(yetdi.length >= 1 && yetdi.length <= 3, `maqsadga yetadigan sharoitlar kam bo'lsin: ${yetdi}`);
});
test("ko'prik: uchburchak ferma eng mustahkam; maqsadga byudjet ichida yetsa bo'ladi, oddiy to'sin bilan — yo'q", () => {
  assert.ok(koprikHisob("ferma", 2).yuk > koprikHisob("ark", 2).yuk && koprikHisob("ark", 2).yuk > koprikHisob("tosin", 2).yuk);
  const yech = []; for (const t of Object.keys(KOPRIK_TUR)) for (const q of [1, 2, 3]) if (koprikOtdi(t, q)) yech.push(`${t}${q}`);
  assert.ok(yech.length >= 1 && yech.length <= 3, String(yech)); assert.ok(!yech.some((x) => x.startsWith("tosin"))); assert.ok(yech.includes("ferma2"));
});
test("Kabu-kod: har xaritaning yechimi bor; devor va chegara to'xtatadi", () => {
  for (const x of KOD_XARITALAR) { const q = kodEngQisqa(x); assert.ok(q >= 4 && q <= 14, `eng qisqa ${q}`); assert.equal(new Set(x.map((r) => r.length)).size, 1); }
  const x = KOD_XARITALAR[0];
  assert.equal(kodYurit(x, ["D", "D", "D", "D", "R", "R", "R", "R"]).natija, "yetdi"); assert.equal(kodYurit(x, ["U"]).natija, "chiqdi"); assert.equal(kodYurit(x, ["R", "D"]).natija, "devor"); assert.equal(kodYurit(x, ["R"]).natija, "yetmadi");
});
test("simmetriya: ko'zgu aksi to'g'ri, xato kataklar topiladi", () => {
  for (const ch of NAQSH_NAMUNALAR) { assert.equal(ch.length, 6); const o = naqshOng(ch); assert.deepEqual(naqshXato(ch, o), []); assert.deepEqual(naqshOng(o), ch); }
  const ch = NAQSH_NAMUNALAR[0]; const buz = naqshOng(ch).map((q) => [...q]); buz[0][0] = buz[0][0] === "1" ? "0" : "1"; assert.deepEqual(naqshXato(ch, buz.map((q) => q.join(""))), [[0, 0]]);
});
test("byudjet: shartlar va pul chegarasi; yechim bor, hammasini olib bo'lmaydi", () => {
  assert.equal(byudjetHisob({}).otdi, false); assert.deepEqual(byudjetHisob({}).kam, ["ichimlik", "shirinlik", "meva"]);
  const y = byudjetHisob({ suv: 1, pechenye: 1, meva: 1 }); assert.ok(y.otdi && y.qoldi === BYUDJET.pul - 28000);
  assert.equal(byudjetHisob({ sharbat: 1, tort: 1, banan: 1 }).otdi, false);   // 68 000 — pul yetmaydi
  assert.ok(byudjetHisob({ sharbat: 1, tort: 1 }).kam.includes("meva"));
  assert.equal(yulduzHisob({ maqsad: false }), 1); assert.equal(yulduzHisob({ maqsad: true, xulosa: true, urinish: 3 }), 3); assert.equal(yulduzHisob({ maqsad: true, xulosa: false, urinish: 3 }), 2);
});
