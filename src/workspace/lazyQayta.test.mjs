import test from 'node:test';
import assert from 'node:assert/strict';
import { yuklaQayta } from './lazyQayta.js';
test('REV307: bo‘lak yuklanmasa qayta uriniladi; bo‘sh modul — xato', async () => {
  let n = 0;
  const mod = await yuklaQayta(() => { n += 1; if (n < 3) return Promise.reject(new Error('net')); return Promise.resolve({ default: 1 }); }, 3);
  assert.equal(mod.default, 1); assert.equal(n, 3);
  await assert.rejects(yuklaQayta(() => Promise.resolve(undefined), 1), /yuklanmadi/);
});
