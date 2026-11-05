import test from 'node:test';
import assert from 'node:assert/strict';
import { stikerBer, albomOl, keyingiMukofot } from './stikerAlbom.js';
test('REV333: stiker albomi', () => {
  const m = new Map(); const s = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
  const sana = new Date('2026-11-05T10:00:00Z');
  const a = stikerBer('MT45-01', { s, sana }); assert.equal(a.stiker, 'stiker_quyon'); assert.equal(a.mukofot, null);
  assert.equal(stikerBer('MT45-01', { s, sana }), null);   // shu dars bugun — ikkinchi marta emas
  for (let i = 2; i <= 5; i++) stikerBer(`MT45-0${i}`, { s, sana });
  const al = albomOl('bola', s); assert.equal(al.jami, 5); assert.equal(al.sanoq.medal_oltin, 1);
  assert.deepEqual(keyingiMukofot(5), { qoldi: 5, id: 'kubok' }); assert.deepEqual(keyingiMukofot(17), { qoldi: 3, id: 'toj' });
});
