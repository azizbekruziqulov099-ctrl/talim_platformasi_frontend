import test from "node:test"; import assert from "node:assert/strict";
import * as R from "./loyihaRules3.js";

test("energiya: qazilma yoqilg'i ko'p bo'lsa isish katta; maqsadga yagona aralashma mos", () => {
  assert.ok(R.energiyaHisob({ qazilma: 100, qayta: 0, atom: 0 }).isish > 3); assert.ok(R.energiyaHisob({ qazilma: 0, qayta: 60, atom: 40 }).isish < 1.8);
  const yech = []; for (let q = 0; q <= 100; q += 10) for (let r = 0; r + q <= 100; r += 10) { const h = R.energiyaHisob({ qazilma: q, qayta: r, atom: 100 - q - r }); if (h.otdi) yech.push([q, r, 100 - q - r]); }
  assert.deepEqual(yech, [[10, 60, 30]]);
  assert.equal(R.energiyaHisob({ qazilma: 10, qayta: 60, atom: 20 }).otdi, false);   // yig'indi 100 emas
  assert.equal(R.energiyaHisob({ qazilma: 0, qayta: 100, atom: 0 }).ishonchli, false);
});
test("ma'lumot tahlili: eng kichik kvadratlar chizig'i eng kam xatolik beradi; yomon chiziq o'tmaydi", () => {
  for (const t of R.TAHLIL) { const e = R.eknk(t.nuqtalar); const x0 = R.xatolik(t.nuqtalar, e.k, e.b);
    assert.ok(e.k > 0); assert.ok(R.tahlilOtdi(t.nuqtalar, e.k, e.b));
    for (const [dk, db] of [[0.5, 0], [-0.5, 0], [0, 6], [0, -6]]) assert.ok(R.xatolik(t.nuqtalar, e.k + dk, e.b + db) > x0);
    assert.equal(R.tahlilOtdi(t.nuqtalar, 0, e.b), false); assert.equal(t.nuqtalar.length, 8); }
  const e = R.eknk([[0, 1], [1, 3], [2, 5]]); assert.ok(Math.abs(e.k - 2) < 1e-9 && Math.abs(e.b - 1) < 1e-9);
  // maqsadga surgichlar qadami bilan (k — 0,1; b — butun son) erishsa bo'ladi, lekin tasodifan emas: 15–120 ta holat (1,5% dan kam)
  for (const t of R.TAHLIL) { const e = R.eknk(t.nuqtalar); const ys = t.nuqtalar.map((p) => p[1]); const oraliq = Math.max(...ys) - Math.min(...ys); let otdi = 0, jami = 0;
    for (let k10 = 0; k10 <= Math.round(Math.ceil(e.k * 20)); k10 += 1) for (let b = Math.floor(e.b - oraliq); b <= Math.ceil(e.b + oraliq); b += 1) { jami += 1; if (R.tahlilOtdi(t.nuqtalar, k10 / 10, b)) otdi += 1; }
    assert.ok(otdi >= 15 && otdi <= 120 && otdi / jami < 0.015, `${t.nom}: ${otdi}/${jami}`); assert.ok(R.tahlilChegara(t.nuqtalar) > R.xatolik(t.nuqtalar, e.k, e.b)); }
});
test("shamol tegirmoni: Cp Bets chegarasidan past; eng yaxshi burchak 15°; maqsadga yagona yechim", () => {
  let engCp = 0; for (let b = 0; b <= 45; b += 5) for (const n of [2, 3, 4, 5]) engCp = Math.max(engCp, R.shamolHisob(b, n, 3).cp);
  assert.ok(engCp <= 0.593 && engCp === 0.45);
  assert.ok(R.shamolHisob(15, 3, 3).kVt > R.shamolHisob(30, 3, 3).kVt && R.shamolHisob(15, 3, 3).kVt > R.shamolHisob(15, 3, 2).kVt * 2);   // quvvat uzunlik kvadratiga bog'liq
  const yech = []; for (let b = 0; b <= 45; b += 5) for (const n of [2, 3, 4, 5]) for (const u of [1, 2, 3]) if (R.shamolHisob(b, n, u).otdi) yech.push([b, n, u]);
  assert.deepEqual(yech, [[15, 3, 3]]);
});
test("fraktal daraxt: kesmalar soni 2^(n+1)−1, uzunlik — geometrik progressiya; nishonga moslik", () => {
  for (const n of R.FRAKTAL_NISHON) { const k = R.fraktalChiz(n); assert.equal(k.length, R.fraktalShoxlar(n.chuqurlik));
    const jami = k.reduce((a, [x1, y1, x2, y2]) => a + Math.hypot(x2 - x1, y2 - y1), 0); assert.ok(Math.abs(jami - R.fraktalUzunlik(n.nisbat, n.chuqurlik)) < 0.02, `${jami}`);
    assert.ok(R.fraktalMos(n, n)); assert.ok(!R.fraktalMos({ ...n, burchak: n.burchak + 5 }, n)); assert.ok(!R.fraktalMos({ ...n, chuqurlik: n.chuqurlik - 1 }, n)); }
  assert.equal(R.fraktalShoxlar(6), 127);
});
test("kredit: annuitet formulasi; muddat uzaysa oylik to'lov kamayadi, ortiqcha to'lov oshadi; yagona yechim", () => {
  const a = R.kreditHisob(3, 12); assert.ok(Math.abs(a.oylik - 0.851) < 0.002, String(a.oylik)); assert.ok(Math.abs(a.ortiqcha - 1.21) < 0.02, String(a.ortiqcha));
  assert.ok(R.kreditHisob(3, 24).oylik < a.oylik && R.kreditHisob(3, 24).ortiqcha > a.ortiqcha);
  const yech = []; for (let b = 0; b <= 6; b += 1) for (const oy of [6, 12, 18, 24, 36]) if (R.kreditHisob(b, oy).otdi) yech.push([b, oy]);
  assert.deepEqual(yech, [[3, 12]]);
  assert.equal(R.kreditHisob(5, 12).otdi, false);   // jamg'armadan ko'p
});
