import test from 'node:test';
import assert from 'node:assert/strict';
import { gapSolishtir } from './konikmaRules.js';
test('REV275: diktant/gapirish solishtirish', () => {
  assert.equal(gapSolishtir("Can I have the bill, please?", "can i have the bill please").foiz, 100);
  const t = gapSolishtir("I like green tea.", "I like tea");
  assert.equal(t.sozlar.find((s) => s.kerak === 'green').ok, false);
  assert.ok(t.foiz < 100 && t.foiz >= 50);
  assert.equal(gapSolishtir("It's fifteen dollars.", "its fiftee dollars").foiz >= 60, true);
  assert.equal(gapSolishtir("Hello", "").foiz, 0);
  assert.ok(gapSolishtir("A coffee, please.", "A coffee plese", true).foiz < 100);   // diktant — qatiy imlo
});
