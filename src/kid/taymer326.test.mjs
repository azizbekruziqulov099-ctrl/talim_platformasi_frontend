import test from 'node:test';
import assert from 'node:assert/strict';
import { qolganVaqt, qisqaVaqt } from './screenTime.js';
test('REV326: taymer — server holatidan keyin o‘zi kamayadi', () => {
  const st = { dars: { qoldi: 20, limit: 60 }, oyin: { qoldi: 60, limit: 60 }, jami: { qoldi: 80, limit: 120 } };
  const t0 = 1_000_000;
  assert.equal(qolganVaqt(st, 'dars', t0, t0).cat.qoldi, 1200);
  assert.equal(qolganVaqt(st, 'dars', t0, t0 + 10_000).cat.qoldi, 1190);
  assert.equal(qolganVaqt(st, 'dars', t0, t0 + 600_000).cat.qoldi, 1155);   // signal kelmasa — ko'pi bilan 45 s
  assert.equal(qolganVaqt({ kuzatilmaydi: true }, 'dars', t0, t0), null);
  assert.equal(qisqaVaqt(1200), '20 daq'); assert.equal(qisqaVaqt(3900), '1 soat 05 daq'); assert.equal(qisqaVaqt(30), '30 soniya');
});
