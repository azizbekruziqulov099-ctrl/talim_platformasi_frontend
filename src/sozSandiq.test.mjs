import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { TILLAR, soz, chalgituvchilar, oyinYasa, tangaHisobi, xotiraOl, xotiraYoz, saralash, ovozMatni } from "./games/sozSandiq/sozRules.js";

const yukla = (n) => JSON.parse(fs.readFileSync(new URL(`./games/sozSandiq/data/${n}.json`, import.meta.url), "utf8"));
const bolalar = yukla("bolalar"), maktab = yukla("maktab");
const rng = (s) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

test("REV695 so'z bazasi: har so'z 11 tilda to'liq, kalitlar takrorlanmaydi", () => {
  const hammasi = [...bolalar, ...maktab];
  assert.ok(bolalar.length >= 200 && maktab.length >= 700);
  assert.equal(new Set(hammasi.map((x) => x.k)).size, hammasi.length);
  for (const x of hammasi) { assert.equal(x.w.length, TILLAR.length, x.k); for (const w of x.w) assert.ok(String(w).trim(), x.k); assert.ok(x.f.endsWith(".webp"), x.k); }
});

test("REV695 so'z sandig'i: variantlarda bir xil yoziladigan so'z va bir xil rasm yo'q (10 til, 300 o'yin)", () => {
  for (const til of ["en", "ru", "de", "fr", "es", "ar", "tr", "zh", "ja", "ko"]) for (const pool of [bolalar, maktab]) for (let s = 1; s <= 15; s += 1) {
    const raundlar = oyinYasa(pool, { til, izoh: "uz", rng: rng(s * 7 + til.charCodeAt(0)) });
    assert.ok(raundlar.length >= 8, `${til}: raund kam`);
    assert.equal(new Set(raundlar.map((r) => r.nishon.k)).size, raundlar.length, "bitta o'yinda so'z takrorlanmaydi");
    for (const r of raundlar) {
      const v = r.variantlar || r.juftlar;
      assert.ok(v.includes(r.nishon));
      assert.equal(new Set(v.map((x) => soz(x, til).toLowerCase())).size, v.length, `${til}/${r.nishon.k}: bir xil yozuv`);
      assert.equal(new Set(v.map((x) => soz(x, "uz").toLowerCase())).size, v.length, `${til}/${r.nishon.k}: izohda bir xil`);
      assert.equal(new Set(v.map((x) => x.f)).size, v.length);
    }
  }
});

test("REV695 so'z sandig'i: bugun ko'rilgan so'z qayta chiqmaydi, xatolar qaytadi", () => {
  const birinchi = oyinYasa(bolalar, { til: "en", rng: rng(3) }).map((r) => r.nishon.k);
  const ikkinchi = oyinYasa(bolalar, { til: "en", korilgan: birinchi, rng: rng(4) }).map((r) => r.nishon.k);
  assert.equal(ikkinchi.filter((k) => birinchi.includes(k)).length, 0);
  const xato = birinchi.slice(0, 2);
  const uchinchi = oyinYasa(bolalar, { til: "en", korilgan: birinchi, xatolar: xato, rng: rng(5) }).map((r) => r.nishon.k);
  assert.ok(xato.every((k) => uchinchi.includes(k)));
  const hammasi = bolalar.map((x) => x.k);
  assert.ok(oyinYasa(bolalar, { til: "en", korilgan: hammasi, rng: rng(6) }).length >= 8, "hammasi ko'rilgan bo'lsa ham o'yin chiqadi");
});

test("REV695 so'z sandig'i: tanga, daraja, ovoz matni va xotira", () => {
  assert.equal(tangaHisobi([true, true, false, true]), 5 + 6 + 5);
  assert.ok(saralash(maktab, { daraja: 1 }).every((x) => x.d === 1));
  assert.equal(ovozMatni("apple", "en"), "[en]apple[/en]"); assert.equal(ovozMatni("olma", "uz"), "olma");
  const m = new Map(); const x = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) };
  xotiraYoz("en", { korildi: ["a", "b"], xato: ["b"], togri: ["a"] }, x);
  let h = xotiraOl("en", x); assert.deepEqual(h.korilgan, ["a", "b"]); assert.deepEqual(h.xatolar, ["b"]); assert.equal(h.jami, 1);
  xotiraYoz("en", { korildi: ["b"], togri: ["b"] }, x); h = xotiraOl("en", x); assert.deepEqual(h.xatolar, []); assert.equal(xotiraOl("de", x).jami, 0);
});

import { gapOyinYasa, gapTokenlar, gapMatn, gapTogri, gapAralash } from "./games/sozSandiq/sozRules.js";
const gaplar = yukla("gaplar");

test("REV696 gap bazasi: har gap 11 tilda, rasmli so'zga bog'langan, token takrorlanmaydi", () => {
  const kalit = new Set([...bolalar, ...maktab].map((x) => x.k));
  assert.equal(new Set(gaplar.map((g) => g.k)).size, gaplar.length);
  for (const g of gaplar) {
    assert.ok(kalit.has(g.k), g.k); assert.equal(g.g.length, TILLAR.length, g.k);
    for (const tok of g.g) { assert.ok(tok.length >= 2 && tok.length <= 7, g.k); assert.equal(new Set(tok).size, tok.length, g.k); }
  }
});

test("REV696 gap o'yini: aralash tartib asl emas, tekshiruv matn bo'yicha, zh/ja bo'shliqsiz, mavhum so'z — faqat tarjima", () => {
  const g = { k: "x", g: TILLAR.map((t) => (t === "zh" ? ["我", "吃", "苹果"] : ["I", "eat", "apples"])) };
  assert.equal(gapMatn(gapTokenlar(g, "zh"), "zh"), "我吃苹果"); assert.equal(gapMatn(gapTokenlar(g, "en"), "en"), "I eat apples");
  for (let s = 1; s < 30; s += 1) assert.notDeepEqual(gapAralash(["I", "eat", "apples"], rng(s)), ["I", "eat", "apples"]);
  assert.ok(gapTogri(["I", "eat", "apples"], g, "en")); assert.ok(!gapTogri(["eat", "I", "apples"], g, "en"));
  if (gaplar.length >= 20) for (const til of ["en", "ar", "ja"]) {
    const r = gapOyinYasa(gaplar, bolalar, { til, rng: rng(9) });
    assert.ok(r.length >= 8); assert.ok(r.some((x) => x.tur === "tuz") && r.some((x) => x.tur === "gaprasm"));
    assert.equal(new Set(r.map((x) => x.nishon.k)).size, r.length);
  }
  const pool = bolalar.slice(0, 40).map((x, i) => (i < 12 ? { ...x, m: 1 } : x));
  for (let s = 1; s < 20; s += 1) for (const r of oyinYasa(pool, { til: "de", rng: rng(s) })) {
    if (r.nishon.m) assert.equal(r.tur, "tarjima");
    else for (const v of r.variantlar || r.juftlar) assert.ok(!v.m, "rasmli variantda mavhum so'z yo'q");
  }
});

import { darsYasa, darsYakun, darsStat, DARS_YANGI, QUTI_KUN } from "./games/sozSandiq/sozRules.js";
test("REV699 dars: yangi so'zlar oson darajadan, takror vaqti kelganda qaytadi, xato 1-qutiga tushadi", () => {
  let h = { s: {} };
  const d1 = darsYasa(maktab, h, { til: "en", bugun: 100, gaplar, rng: rng(2) });
  assert.equal(d1.yangi.length, DARS_YANGI); assert.ok(d1.yangi.every((x) => x.d === 1)); assert.equal(d1.takror.length, 0);
  assert.equal(d1.raundlar.filter((r) => r.tur === "tanish").length, DARS_YANGI);
  const mashq = d1.raundlar.filter((r) => r.tur !== "tanish");
  assert.ok(mashq.length >= DARS_YANGI * 2 - 2); assert.ok(!mashq.some((r, i) => i && r.nishon.k === mashq[i - 1].nishon.k));
  const xatoK = d1.yangi[0].k;
  h = darsYakun(h, d1.raundlar, d1.raundlar.map((r) => r.nishon.k !== xatoK), 100);
  assert.deepEqual(h.s[xatoK], [1, 100]); assert.deepEqual(h.s[d1.yangi[1].k], [2, 100 + QUTI_KUN[2]]);
  const d2 = darsYasa(maktab, h, { til: "en", bugun: 100, gaplar, rng: rng(3) });
  assert.ok(d2.yangi.every((x) => !d1.yangi.includes(x)), "yangi so'zlar takrorlanmaydi"); assert.deepEqual(d2.takror.map((x) => x.k), [xatoK]);
  const d3 = darsYasa(maktab, h, { til: "en", bugun: 102, gaplar, rng: rng(4) });
  assert.equal(d3.takror.length, DARS_YANGI);
  const st = darsStat(maktab, h, 102); assert.equal(st.boshlangan, DARS_YANGI); assert.equal(st.takror, DARS_YANGI); assert.equal(st.organilgan, 0); assert.equal(st.dars, 2);
  let hh = h; for (let kun = 102, i = 0; i < 3; i += 1, kun += 20) { const d = darsYasa(maktab, hh, { til: "en", bugun: kun, yangiSoni: 0, rng: rng(5 + i) }); hh = darsYakun(hh, d.raundlar, d.raundlar.map(() => true), kun); }
  assert.ok(darsStat(maktab, hh, 200).organilgan >= DARS_YANGI - 1);
});

import { darsBirlashtir } from "./games/sozSandiq/sozRules.js";
test("REV702 dars holati: qurilma va server birlashadi — keyinroq o'ynalgani qoladi", () => {
  const a = { s: { apple: [3, 110], cat: [1, 100] } }, b = { s: { apple: [2, 104], cat: [2, 102], dog: [2, 103], bad: "x" } };
  assert.deepEqual(darsBirlashtir(a, b).s, { apple: [3, 110], cat: [2, 102], dog: [2, 103] });
  assert.deepEqual(darsBirlashtir(b, a).s, darsBirlashtir(a, b).s); assert.deepEqual(darsBirlashtir(null, null), { s: {} });
});

test("REV702 sinflar: har maktab so'zida sinf (1..11) bor; dars yangi so'zni faqat tanlangan sinfdan oladi", () => {
  assert.ok(maktab.every((x) => Number.isInteger(x.n) && x.n >= 1 && x.n <= 11));
  for (let n = 1; n <= 11; n += 1) assert.ok(saralash(maktab, { sinf: n, aniq: true }).length >= 60, `${n}-sinf so'zlari kam`);
  assert.ok(saralash(maktab, { sinf: 3 }).every((x) => x.n <= 3));
  const d = darsYasa(maktab, { s: {} }, { til: "de", bugun: 5, sinf: 7, rng: rng(11) });
  assert.equal(d.yangi.length, DARS_YANGI); assert.ok(d.yangi.every((x) => x.n === 7));
});
