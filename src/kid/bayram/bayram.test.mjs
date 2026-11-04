import test from 'node:test';
import assert from 'node:assert/strict';
import { joriyBayram, bayramGapi } from './bayramRules.js';
test('REV323: bayram sana bo‘yicha', () => {
  assert.equal(joriyBayram('2026-12-31'), 'yangi_yil'); assert.equal(joriyBayram('2027-01-05'), 'yangi_yil');
  assert.equal(joriyBayram('2027-03-21'), 'navroz'); assert.equal(joriyBayram('2027-03-08'), 'mart8');
  assert.equal(joriyBayram('2026-09-01'), 'mustaqillik'); assert.equal(joriyBayram('2026-09-03'), 'bilim');
  assert.equal(joriyBayram('2026-10-01'), 'ustozlar'); assert.equal(joriyBayram('2026-06-01'), 'bolalar');
  assert.equal(joriyBayram('2026-11-04'), null);
  assert.equal(joriyBayram('2026-11-04', { tugilgan: '2021-11-04' }), 'tugilgan');
  assert.match(bayramGapi('navroz', 'de'), /Nouruz/); assert.equal(bayramGapi('navroz', 'fr'), null);
});
