import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";


const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");


test("admin test tools stay closed until the parent and a child choice are clicked", () => {
  assert.match(app, /const \[bolim, setBolim\] = useState\(null\)/);
  assert.match(app, /Test shablon va import/);
  assert.match(app, /aria-expanded=\{bolim === "test"\}/);
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
  assert.match(app, /mode === "shablon" && oldindanTanlangan && oldindanTanlangan\.length > 0/);
  assert.match(app, /new Set\(\[\.\.\.prev, \.\.\.oldindanTanlangan\]\)/);
});


test("single-subject template selection prefers canonical topic_codes with legacy fallback", () => {
  const tolerantTopicCodes = /m\.topic_codes \|\| m\.barcha_kodlar \|\| \[m\.topic_code\]/g;
  assert.equal(app.match(tolerantTopicCodes)?.length, 2);
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
  assert.match(app, /varaq\.yetishmagan_ustunlar/);
});
