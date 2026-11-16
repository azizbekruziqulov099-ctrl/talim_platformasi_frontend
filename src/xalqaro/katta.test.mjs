import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
import { KABU_QADAMLAR, KATTADA_YASHIRIN, ismOk, menyuFiltri, navbatHolati, navbatNatijaQosh, sanaOk } from "./kattaRules.js";

test("katta sinf: tug'ilgan sana tekshiruvi", () => {
  const bugun = "2026-11-17";
  assert.equal(sanaOk("2014-05-20", bugun), true);
  assert.equal(sanaOk("", bugun), false);
  assert.equal(sanaOk("20.05.2014", bugun), false);        // format noto'g'ri
  assert.equal(sanaOk("2026-02-31", bugun), false);        // bunday sana yo'q
  assert.equal(sanaOk("2027-01-01", bugun), false);        // kelajak
  assert.equal(sanaOk("2026-11-17", bugun), false);        // bugun tug'ilgan bola emas
  assert.equal(sanaOk("1949-12-31", bugun), false);
});

test("katta sinf: ism-familiya kamida ikki so'z", () => {
  assert.equal(ismOk("Dilnoza Karimova"), true);
  assert.equal(ismOk("  Aziz   Rahimov "), true);
  assert.equal(ismOk("Dilnoza"), false);
  assert.equal(ismOk(""), false); assert.equal(ismOk(null), false);
  assert.equal(ismOk("A B"), false);
});

test("ketma-ket kirish testlari: navbat holati", () => {
  const n0 = { royxat: ["P_M", "P_S", "P_R", "P_F"], natijalar: [] };
  assert.deepEqual(navbatHolati(n0), { joriy: "P_M", raqam: 1, jami: 4, tugadi: false });
  const n1 = navbatNatijaQosh(n0, "P_M", 11);
  assert.deepEqual(n0.natijalar, []);                       // eskisi o'zgarmaydi
  assert.deepEqual(navbatHolati(n1), { joriy: "P_S", raqam: 2, jami: 4, tugadi: false });
  let n = n1; for (const [t, id] of [["P_S", 12], ["P_R", 13], ["P_F", 14]]) n = navbatNatijaQosh(n, t, id);
  assert.deepEqual(navbatHolati(n), { joriy: null, raqam: 5, jami: 4, tugadi: true });
  assert.deepEqual(navbatHolati(null), { joriy: null, raqam: 1, jami: 0, tugadi: false });   // bo'sh navbat tugagan hisoblanmaydi
});

test("katta sinf o'quvchisi menyusi: dunyo, qo'llanma, metod yashirin; oddiy foydalanuvchida hammasi bor", () => {
  assert.deepEqual(KATTADA_YASHIRIN.sort(), ["dunyo", "metod", "qollanma"]);
  for (const k of ["kurs", "imtihon", "reyting", "sinfim", "natija"]) assert.equal(menyuFiltri(true, k), true);
  for (const k of KATTADA_YASHIRIN) { assert.equal(menyuFiltri(true, k), false); assert.equal(menyuFiltri(false, k), true); }
});

test("Kabu tanishtiruvi: ko'rsatiladigan elementlar menyuda haqiqatan bor", () => {
  const bolim = fs.readFileSync(new URL("./XalqaroBaholash.jsx", import.meta.url), "utf8");
  const sel = KABU_QADAMLAR.map((q) => (q.sel.match(/is-(\w+)$/) || [])[1]).filter(Boolean);
  assert.ok(sel.length >= 4);
  for (const k of sel) assert.ok(bolim.includes(`["${k}",`), `menyuda "${k}" bo'limi yo'q`);
  assert.ok(bolim.includes("`xb-menyu-karta is-${k}`"));
  assert.ok(KABU_QADAMLAR.some((q) => q.sel === ".kb-account-notice"));                              // Telegram/Gmail ulash eslatmasi
  assert.ok(fs.readFileSync(new URL("../auth/AccountNotice.jsx", import.meta.url), "utf8").includes("kb-account-notice"));
  for (const q of KABU_QADAMLAR) assert.ok(q.matn.length > 30 && q.matn.length < 260);
});

test("Kabu tanishtiruvi saytni qotirmaydi: qatlam bosishni to'smaydi, aylantirish faqat bir marta, xato himoyalangan", () => {
  const tur = fs.readFileSync(new URL("./KabuTur.jsx", import.meta.url), "utf8");
  const css = fs.readFileSync(new URL("./katta-kirish.css", import.meta.url), "utf8");
  assert.match(css, /\.kk-tur\{[^}]*pointer-events:none/);          // butun qatlam sahifani to'smaydi
  assert.match(css, /\.kk-tur-chiziq\{[^}]*pointer-events:none/);
  assert.equal((tur.match(/scrollIntoView/g) || []).length, 1);       // skroll hodisasi ichida qayta aylantirish yo'q
  assert.ok(tur.includes("requestAnimationFrame") && tur.includes("passive: true"));
  assert.ok(tur.includes("getDerivedStateFromError"));                // Kabu buzilsa ham sayt ishlaydi
  assert.ok(tur.includes("clearTimeout(taymer.current)") && tur.includes("removeEventListener"));   // tozalash
  assert.ok(css.includes("prefers-reduced-motion"));
});

test("Kabu — testlarda chiqadigan jonli ustoz figurasi ishlatiladi (emoji ham, robot rasmi ham emas)", () => {
  for (const f of ["KabuTur.jsx", "KattaKirish.jsx", "KirishNavbat.jsx"]) {
    const t = fs.readFileSync(new URL(`./${f}`, import.meta.url), "utf8");
    assert.ok(t.includes("UstozFigura") || t.includes("XbUstoz"), `${f}: jonli ustoz yo'q`);
    assert.ok(!t.includes("🕊") && !/kabu_\w+\.webp/.test(t), `${f}: boshqa Kabu rasmi qolgan`);
  }
  const bolim = fs.readFileSync(new URL("./XalqaroBaholash.jsx", import.meta.url), "utf8");
  assert.ok(bolim.includes("<KabuTur ovoz={ovoz} ustoz={ustoz} />"));   // sinov imtihonidagi ustozning o'zi
});

test("katta havola: ?katta=KOD saqlanadi, o'quvchi uchun ro'yxatdan o'tish talab qilinmaydi", () => {
  const app = fs.readFileSync(new URL("../App.jsx", import.meta.url), "utf8");
  assert.ok(app.includes('get("katta")') && app.includes('"kabutar:xb:katta"'));
  assert.ok(app.includes("LazyKattaKirish"));
  const kirish = fs.readFileSync(new URL("./KattaKirish.jsx", import.meta.url), "utf8");
  assert.ok(kirish.includes("/auth/quick/start") && kirish.includes("/api/xalqaro/katta_qoshil"));
});
