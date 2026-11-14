import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
const o = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");
const css = o("./index.css");

// [ildiz selektori, uslub fayli, komponent fayli, komponentdagi yopish/ortga belgisi]
const OYNALAR = [
  [".cd-root.is-toliq", "./daftar/chizmaDaftar.css", "./daftar/ChizmaDaftar.jsx", /setToliq\(\(x\) => !x\)/],
  [".ox-root", "./kid/oyinXona/oyinXona.css", "./kid/oyinXona/OyinXona.jsx", /className="ox-orqa" onClick=\{onClose\}/],
  [".bzt-fon", "./lesson/kirishTekshiruv.css", "./lesson/KirishTekshiruv.jsx", /onClick=\{onYop\}/],
  [".kb-family-overlay", "./auth/family-profiles.css", "./auth/FamilyProfiles.jsx", /onClick=\{onClose\}/],
  [".kb-family-markaz", "./auth/family-profiles.css", "./auth/FamilyProfiles.jsx", /onClick=\{onClose\}/],
  [".kt-oyna", "./courses/kursTolov.css", "./courses/KursTolov.jsx", /onClick=\{onClose\}/],
];

test("REV554: to'liq ekranli oyna ochilganda ramka tugmalari yashirinadi (xalaqit bermaydi)", () => {
  const m = /body:has\(([^)]+)\) :is\(\.samtm-top-switch, #samtm-install-app, \.premium-mobile-nav\)\{display:none!important\}/.exec(css);
  assert.ok(m, "qoida index.css da (hamma ko'rinishda ishlaydi — faqat «yangi ko'rinish»da emas)");
  const royxat = m[1].split(",").map((x) => x.trim());
  assert.deepEqual(royxat, OYNALAR.map((x) => x[0]), "ro'yxat va tekshirilgan oynalar bir xil");
});

test("REV554: ro'yxatdagi har oyna haqiqatan to'liq ekranli VA o'z yopish tugmasiga ega (foydalanuvchi qamalib qolmaydi)", () => {
  for (const [sel, cssFayl, jsxFayl, yopish] of OYNALAR) {
    const c = o(cssFayl).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, "");
    const i = c.indexOf(`${sel}{`); assert.ok(i >= 0, `${sel}: uslub topilmadi`);
    const blok = c.slice(i, c.indexOf("}", i));
    assert.ok(blok.includes("position:fixed") && (blok.includes("inset:0") || (blok.includes("left:0") && blok.includes("top:0"))), `${sel}: to'liq ekranli emas — ${blok.slice(0, 90)}`);
    // ramka ostidan boshlanadigan oyna bu ro'yxatga kirmaydi (u ramka bilan kelishib ishlaydi)
    assert.ok(!blok.includes("--samtm-portal-top") && !blok.includes("--samtm-top-offset"), `${sel}: ramka ostidan boshlanadi — ro'yxatdan olib tashlang`);
    assert.match(o(jsxFayl), yopish, `${sel}: ${jsxFayl} da yopish/ortga tugmasi topilmadi`);
  }
});

test("REV554: ramka ostidan boshlanadigan ekranlar ro'yxatda yo'q (ularda ramka kerak)", () => {
  const m = /body:has\(([^)]+)\) :is\(\.samtm-top-switch/.exec(css)[1];
  for (const sel of [".xo-ekran", ".jo-ekran"]) assert.ok(!m.includes(sel), sel);
  for (const [sel, f] of [[".xo-ekran", "./kid/xonalar/xonalar.css"], [".jo-ekran", "./kid/jonli/jonli.css"]]) assert.match(o(f).replace(/\s+/g, ""), new RegExp(`\\${sel}\\{[^}]*--samtm-portal-top`), `${sel} ramka ostidan boshlanadi`);
});
