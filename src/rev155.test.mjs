import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const src = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");

test("REV155: kirish tanishuvi — barcha rasmlar mavjud, 5 rol va «Hammaga» bo'limi", () => {
  const s = src("./auth/KirishTanishuv.jsx");
  const imp = [...s.matchAll(/from "(\.\.\/[^"]+\.webp)"/g)].map((m) => m[1]);
  assert.ok(imp.length >= 20);
  for (const p of imp) assert.ok(fs.existsSync(new URL(path.posix.join("./auth/", p), import.meta.url)), p);
  for (const id of ["ota-ona", "bogcha", "oqituvchi", "talaba", "oquvchi"]) assert.match(s, new RegExp(`id: "${id}"`));
  assert.match(s, /HAMMAGA/);
});

test("REV155: tanishuv matnlari ru va en tillarida bor", async () => {
  const s = src("./auth/KirishTanishuv.jsx");
  const { normalizeInterfaceKey } = await import("./interface/interfaceRules.js");
  const ru = (await import("./interface/locales/ru.js")).default;
  const en = (await import("./interface/locales/en.js")).default;
  const matnlar = new Set();
  for (const m of s.matchAll(/T\("([^"]+)"\)/g)) matnlar.add(m[1]);
  for (const m of s.matchAll(/\[[a-zA-Z]+, "([^"]+)", "([^"]+)"\]/g)) { matnlar.add(m[1]); matnlar.add(m[2]); }
  for (const m of s.matchAll(/(?:nom|sarlavha): "([^"]+)"/g)) matnlar.add(m[1]);
  assert.ok(matnlar.size > 60, String(matnlar.size));
  for (const t of matnlar) { const k = normalizeInterfaceKey(t); assert.ok(ru[k], "ru: " + t); assert.ok(en[k], "en: " + t); }
});

test("REV155: emblema — kirish, ro'yxatdan o'tish, yuqori panel va favicon", () => {
  assert.ok(fs.existsSync(new URL("./brand/emblema.webp", import.meta.url)));
  assert.match(src("./auth/KabutarLogin.jsx"), /kb-login-emblem/);
  assert.match(src("./auth/KabutarLogin.jsx"), /<KirishImkoniyatlar/);
  assert.match(src("./auth/KabutarRegistration.jsx"), /kb-login-emblem/);
  assert.match(src("./App.jsx"), /className="samtm-emblema"/);
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /rel="icon"[^>]+favicon\.png/);
  assert.match(html, /apple-touch-icon\.png/);
  for (const f of ["favicon.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png"]) assert.ok(fs.existsSync(new URL("../public/icons/" + f, import.meta.url)), f);
});
