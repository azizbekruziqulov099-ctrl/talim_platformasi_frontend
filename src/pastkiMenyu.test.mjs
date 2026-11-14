import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
const app = fs.readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("./index.css", import.meta.url), "utf8");

test("REV548: telefondagi pastki menyu — har rolning birinchi 4 bo'limi qisqa nom bilan (≤ 10 belgi, bir qatorga sig'adi)", () => {
  const xarita = Object.fromEntries([...app.slice(app.indexOf("const PASTKI_QISQA = {"), app.indexOf("function PastkiMenyu({")).matchAll(/"([^"]+)": __kbM\("([^"]+)"\)/g)].map((m) => [m[1], m[2]]));
  assert.ok(Object.keys(xarita).length >= 8);
  for (const [uzun, qisqa] of Object.entries(xarita)) { assert.ok(qisqa.length <= 10, `${qisqa}`); assert.ok(qisqa.length < uzun.length); }
  // menyudagi har rol: birinchi 4 ta band (profil bundan mustasno) — nomi qisqa yoki xaritada bor
  const blok = app.slice(app.indexOf("function menyuBandlariniOl("), app.indexOf("function PastkiMenyu({"));
  const rollar = blok.split(/return \[/).slice(1).map((r) => [...r.slice(0, r.indexOf("];")).matchAll(/kalit: "(\w+)", nom: "([^"]+)"/g)].filter((m) => m[1] !== "profil").slice(0, 5).map((m) => m[2]));
  assert.ok(rollar.length >= 4, "admin, o'qituvchi, ota-ona, o'quvchi");
  for (const r of rollar) for (const nom of r.slice(0, 4)) assert.ok((xarita[nom] || nom).length <= 11, `pastki menyuda uzun nom: «${nom}»`);
  // maxsus qo'shiladigan bandlar (talaba, bog'cha, taqdimot)
  for (const nom of ["Mening institutim", "O‘yin va testlar", "Taqdimot yaratish", "To‘garak va repetitorlik"]) assert.ok(xarita[nom], nom);
  assert.match(app, /uiT\(desktop \? nom : \(PASTKI_QISQA\[nom\] \|\| nom\)\)/, "yon panelda to'liq nom qoladi");
});

test("REV548: pastki menyu ixcham va iPhone'ning pastki chizig'i uchun joy bor; kontent ostida bo'sh joy mos", () => {
  const b = css.slice(css.indexOf("/* REV548"));
  assert.match(b, /\.premium-mobile-nav\.samtm-pastki-4\{padding-bottom:env\(safe-area-inset-bottom,0px\)\}/);
  assert.match(b, /white-space:nowrap/); assert.match(b, /@media \(max-width:820px\)/);
  assert.match(app, /padding-bottom:calc\(62px \+ env\(safe-area-inset-bottom\)\)/);
});
