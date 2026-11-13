import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
import { QOLDA } from "./qoldaData.js";
const kalitlar = (f) => [...fs.readFileSync(new URL(f, import.meta.url), "utf8").matchAll(/\{ k: "(\w+)", yon: "[STEAM]"/g)].map((m) => m[1]);
test("qo'lda yasash: har loyihada materiallar, qadamlar va xavfsizlik bor (15 ta)", () => {
  const hamma = [...kalitlar("./KabuLoyiha.jsx"), ...kalitlar("./Loyiha2.jsx")];
  assert.equal(new Set(hamma).size, 15, hamma.join(","));
  for (const k of hamma) { const d = QOLDA[k]; assert.ok(d, `${k}: ma'lumot yo'q`); assert.ok(d.mat.length >= 2 && d.qad.length >= 3 && d.xav.length > 8, k); }
  assert.deepEqual(Object.keys(QOLDA).filter((k) => !hamma.includes(k)), []);
});
