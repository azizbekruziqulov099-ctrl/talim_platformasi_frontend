import test from 'node:test';
import assert from 'node:assert/strict';
test('REV297: test savollari soni yoshi va sinfiga qarab (20–80)', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../TestTab.jsx', import.meta.url), 'utf8');
  const m = /export function testSoniYosh\([\s\S]*?\n\}/.exec(src);
  const testSoniYosh = new Function(`${m[0].replace('export ', '')}; return testSoniYosh;`)();
  assert.equal(testSoniYosh('2-3 yosh'), 20); assert.equal(testSoniYosh('4-5 yosh'), 30); assert.equal(testSoniYosh('6-7 yosh'), 40);
  assert.equal(testSoniYosh('3'), 40); assert.equal(testSoniYosh('7-sinf'), 60); assert.equal(testSoniYosh('11'), 80); assert.equal(testSoniYosh(''), 40);
});
