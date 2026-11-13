import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
import { HAYOT_TOPLAM, hayotRasmKaliti } from "./hayotData.js";
test("hayotiy ketma-ketliklar: har qadamning rasm fayli bor (253 ta), ortiqcha fayl yo'q", () => {
  const fayllar = new Set(fs.readdirSync(new URL("./rasm_hayot/", import.meta.url)).map((f) => f.replace(/\.webp$/, "")));
  const kalitlar = []; for (const r of Object.values(HAYOT_TOPLAM)) for (const t of r) t.q.forEach((w, i) => { assert.equal(w.s.r, hayotRasmKaliti(t.nom, i + 1)); kalitlar.push(w.s.r); });
  assert.deepEqual(kalitlar.filter((k) => !fayllar.has(k)), [], "rasmi yo'q qadamlar"); assert.deepEqual([...fayllar].filter((f) => !kalitlar.includes(f)), [], "ishlatilmagan rasmlar");
  assert.equal(new Set(kalitlar).size, 253);
});
