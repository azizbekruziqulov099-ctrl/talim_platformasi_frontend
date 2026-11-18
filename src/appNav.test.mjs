import test from "node:test";
import assert from "node:assert/strict";
import { navTabUlash, navKurslarUlash, navYoz, navOrtga, navOldinga } from "./nav/appNav.js";

test("REV605: ortga/oldinga tarixi — bo'lim va Kurslar ichidagi holat tiklanadi", async () => {
  let tab = "bosh"; let kurs = null; const holat = [];
  navTabUlash(() => ({ key: `t:${tab}`, snap: { tab } }), (x) => { tab = x.tab; });
  navKurslarUlash(() => (tab === "kurslar" ? { key: `k:${kurs || ""}`, snap: { kurs } } : null), (x) => { kurs = x?.kurs || null; });
  const kut = () => new Promise((r) => setTimeout(r, 80));
  navYoz();
  tab = "kurslar"; navYoz();
  kurs = "repetitor"; navYoz();
  kurs = "dars31"; navYoz();
  assert.equal(navOrtga(), true); await kut();
  assert.equal(kurs, "repetitor");
  assert.equal(navOrtga(), true); await kut();
  assert.equal(kurs, null); assert.equal(tab, "kurslar");
  assert.equal(navOrtga(), true); await kut();
  assert.equal(tab, "bosh");
  assert.equal(navOrtga(), false);
  assert.equal(navOldinga(), true); await kut();
  assert.equal(tab, "kurslar");
  // yangi yo'l oldinga tarixini o'chiradi
  kurs = "boshqa"; navYoz(); await kut();
  assert.equal(navOldinga(), false);
  holat.length = 0;
});
