import test from "node:test";
import assert from "node:assert/strict";
import { davomSaqla, davomOl, qachon } from "./workspace/davomEt.js";

const xotira = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) }; };

test("REV692 davom et: faqat o'quv bo'limlari saqlanadi, hisob va rol bo'yicha alohida", () => {
  const x = xotira();
  assert.equal(davomSaqla(7, "oquvchi", "profil", 1000, x), false);
  assert.equal(davomSaqla(7, "oquvchi", "oyinlar", 1000, x), true);
  assert.equal(davomOl(7, "oquvchi", 2000, x).tab, "oyinlar");
  assert.equal(davomOl(7, "ota-ona", 2000, x), null);
  assert.equal(davomOl(8, "oquvchi", 2000, x), null);
});
test("REV692 davom et: 30 kundan eski joy ko'rsatilmaydi", () => {
  const x = xotira();
  davomSaqla(1, "oquvchi", "test", 0, x);
  assert.equal(davomOl(1, "oquvchi", 31 * 24 * 3600 * 1000, x), null);
  assert.equal(qachon(0, 30 * 60000), "bugun");
  assert.equal(qachon(0, 26 * 3600000), "kecha");
  assert.equal(qachon(0, 3 * 24 * 3600000), "3 kun oldin");
});
