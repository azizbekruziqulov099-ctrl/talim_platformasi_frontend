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
