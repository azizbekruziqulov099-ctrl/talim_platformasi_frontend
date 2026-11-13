import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
import { shablonToldir } from "./tarjima.js";
import { ZANJIRLAR, ELEMENTLAR } from "./fanRules.js";
import { VILOYATLAR, DAVLATLAR, ZONALAR, viloyatYasa } from "./geoRules.js";
import { TOIFA, bogShablon, ketmaYasa, jadvalYasa } from "./mantiq2Rules.js";
import { tenglamaYasa } from "./matRules.js";

const manba = JSON.parse(fs.readFileSync(new URL("../../interface/interfaceSources.json", import.meta.url), "utf8"));
const norm = (x) => String(x).trim().replace(/[‘’ʻʼ`]/g, "'").replace(/\s+/g, " ");   // ui-manbalar.mjs dagi bilan bir xil
const bor0 = new Set(Array.isArray(manba) ? manba : Object.keys(manba)); const bor = { has: (x) => bor0.has(norm(x)) };

test("shablon: o'rinbosarlar qo'yiladi, {tr} tarjima qilinadi, buzilgan tarjimada asl shablon", () => {
  const lugat = { "{v0} {v1} boqadi.": "{v0} keeps a {v1}.", mushuk: "cat", "{v0} — markazi {v1}": "buzilgan tarjima" };
  const tr = (x) => lugat[x] ?? x;
  assert.equal(shablonToldir("{v0} {v1} boqadi.", ["Ali", { tr: "mushuk" }], tr), "Ali keeps a cat.");
  assert.equal(shablonToldir("{v0} — markazi {v1}", [{ tr: "Xorazm" }, "Urganch"], tr), "Xorazm — markazi Urganch");   // o'rinbosar yo'qolgan — asl shablon
  assert.equal(shablonToldir("Har safar {v0} qo‘shiladi", [5]), "Har safar 5 qo‘shiladi");
});

test("fan o'yinlari matnlari tarjima ro'yxatida (5 til): ma'lumot va shablonlar", () => {
  const yoq = []; const q = (x) => { if (x && typeof x === "object") { if (x.m && /[a-zA-Z]/.test(x.m.replace(/\{v\d+\}/g, "")) && !bor.has(x.m)) yoq.push(x.m); (x.a || []).forEach((v) => v && typeof v === "object" && !bor.has(v.tr) && yoq.push(v.tr)); } else if (x && !bor.has(x)) yoq.push(x); };
  for (const h of ZANJIRLAR) for (const [muhit, ...z] of h) { q(muhit); z.forEach(([, n]) => q(n)); }
  ELEMENTLAR.forEach((e) => q(e[1])); VILOYATLAR.forEach((v) => { q(v[1]); q(v[2]); q(v[5]); }); DAVLATLAR.forEach((d) => { q(d[1]); q(d[2]); }); ZONALAR.forEach(([z, xs]) => { q(z); xs.forEach((x) => q(x[1])); });
  for (const t of TOIFA) { t[1].forEach(q); q(t[2]); q(t[3]); for (const b of TOIFA) if (b !== t) { q(bogShablon(t, b, true)); q(bogShablon(t, b, false)); } }
  for (const d of [0, 1, 2]) for (let u = 1; u <= 60; u += 1) { q(ketmaYasa(u, d).qoida); tenglamaYasa(u, d).qadamlar.forEach(q); if (u <= 8) { jadvalYasa(u, d).ishoralar.forEach(q); viloyatYasa(u, d).forEach((x) => { q(x.matn); q(x.izoh); }); } }
  assert.deepEqual([...new Set(yoq)], [], "scripts/fan-tarjima-manba.mjs va ui-manbalar.mjs ni qayta ishga tushiring");
});
