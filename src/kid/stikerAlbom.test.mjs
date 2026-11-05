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
import { orolHolati } from './stikerAlbom.js';
test('REV334: haftalik orol', () => {
  const m = new Map(); const s = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
  const dush = new Date('2026-11-02T09:00:00Z');   // dushanba
  for (let i = 0; i < 3; i++) stikerBer(`A${i}`, { s, sana: new Date(dush.getTime() + i * 864e5) });
  let h = orolHolati(albomOl('bola', s), new Date('2026-11-05T09:00:00Z'));
  assert.equal(h.soni, 3); assert.deepEqual(h.qismlar, ['orol', 'orol_qism_daraxt', 'orol_qism_uy']); assert.equal(h.tugadi, false);
  stikerBer('A3', { s, sana: new Date('2026-11-06T09:00:00Z') }); stikerBer('A4', { s, sana: new Date('2026-11-07T09:00:00Z') });
  h = orolHolati(albomOl('bola', s), new Date('2026-11-08T09:00:00Z')); assert.ok(h.tugadi); assert.equal(h.orollar, 1);
  h = orolHolati(albomOl('bola', s), new Date('2026-11-10T09:00:00Z')); assert.equal(h.soni, 0);   // yangi hafta — yangi orol
});
