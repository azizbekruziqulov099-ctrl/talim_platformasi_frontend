import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";


// REV210: shablon/import bo'limi AdminTestTools.jsx'ga ko'chirilgan — birga tekshiriladi
const app = ["./App.jsx", "./AdminTestTools.jsx"].map((f) => readFileSync(new URL(f, import.meta.url), "utf8")).join("\n");


test("admin test tools stay closed until the parent and a child choice are clicked", () => {
  assert.match(app, /const \[bolim, setBolim\] = useState\(null\)/);
  assert.match(app, /Test shablon va import/);
  assert.match(app, /"aria-expanded": bolim === "test"/);
  assert.match(app, /setTestRejimi\("shablon"\)/);
  assert.match(app, /setTestRejimi\("import"\)/);
  assert.doesNotMatch(app, /useState\(oldindanTanlangan[^\n]+\? "test"/);
});


test("template and import are keyed, mode-specific views", () => {
  assert.match(app, /key="shablon"[^>]+mode="shablon"/);
  assert.match(app, /key="import"[^>]+mode="import"/);
  assert.match(app, /function TestShablonBolimi\(\{ token, oldindanTanlangan, mode \}\)/);
  assert.match(app, /mode === "shablon"/);
  assert.match(app, /mode === "import"/);
  assert.match(app, /To'ldirilgan Excel faylni tanlash/);
  assert.doesNotMatch(app, /yuklashBolimiOchiq|setYuklashBolimiOchiq/);
});


test("deferred template selection keeps preselected topic codes", () => {
  assert.match(app, /mode === "shablon" && String\(oldindanTanlangan\?\.scopeId\)===String\(scope\.id\) && oldindanTanlangan\?\.codes\?\.length/);
  assert.match(app, /new Set\(\[\.\.\.prev, \.\.\.oldindanTanlangan\.codes\]\)/);
});


test("single-subject template selection prefers canonical topic_codes with legacy fallback", () => {
  // REV210: bir fan tanlanganda barcha kodlar, bo'lmasa — eski yagona kod (zaxira)
  assert.match(app, /mavzu\.barcha_kodlar && mavzu\.barcha_kodlar\.length > 0 \? mavzu\.barcha_kodlar : \[mavzu\.topic_code\]/);
  assert.doesNotMatch(app, /ichkiMavzular\.flatMap\(\(m\) => m\.barcha_kodlar \|\| \[m\.topic_code\]\)/);
});


test("multi-sheet import result exposes canonical counts, names and per-sheet diagnostics", () => {
  assert.match(app, /natija\?\.import_qilingan_varaq_soni/);
  assert.match(app, /natija\?\.import_qilingan_varaqlar/);
  assert.match(app, /natija\?\.korilgan_savollar_soni/);
  assert.match(app, /natija\.fayldagi_topic_code_soni/);
  assert.match(app, /natija\?\.varaq_diagnostika/);
  assert.match(app, /Har bir varaq natijasi/);
  assert.match(app, /varaq\.holat === "import_qilindi"/);
  assert.match(app, /Avto fan:/);
  assert.match(app, /varaq\.aniqlangan_fan_kodi/);
  assert.match(app, /varaq\.aniqlangan_fan/);
  assert.match(app, /varaq\.yetishmagan_ustunlar/);
});


test("import reports backend 500 details instead of a bare Failed to fetch", () => {
  assert.match(app, /const rawJavob = await res\.text\(\)/);
  assert.match(app, /Server import xatosi \(\$\{res\.status\}\)/);
  assert.match(app, /Backend import vaqtida javob uzildi/);
});


test("import UI clearly reports atomic replacement from zero", () => {
  // REV210: endi faqat Excelda savoli to'ldirilgan mavzular almashtiriladi (boshqalari saqlanadi)
  assert.match(app, /Excelda savoli to‘ldirilgan mavzularning testlari almashtiriladi/);
  assert.match(app, /natija\.almashtirishda_ochirilgan_eski_test_soni/);
  assert.match(app, /Eski test tozalandi/);
});
