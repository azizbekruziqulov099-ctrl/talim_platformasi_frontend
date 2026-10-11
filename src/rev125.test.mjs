import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioDictation } from './admin/audioDictation.js';
import { kitobKodimi } from './lesson/kitobKodRules.js';
import { gap } from './kid/izohTil.js';

test('REV125: dictation default timers are callable unbound (no Illegal invocation)', async () => {
  let asked = 0;
  const d = new AudioDictation({ transcribe: async () => ({ text: 'x' }), onText() {}, onState() {}, onError(e) { throw new Error(e); },
    mediaDevices: { getUserMedia: async () => { asked++; throw Object.assign(new Error('no'), { name: 'NotFoundError' }); } }, Recorder: function () {} });
  const { setTimer, clearTimer } = d;
  const id = setTimer(() => {}, 10); clearTimer(id);
  d.onError = () => {};
  await d.start();
  assert.equal(asked, 1);
  assert.equal(d.phase, 'idle');
});

test('REV125: one field — book codes vs questions', () => {
  for (const c of ['XB-03-A01', 'xb03a01', 'MT 5 12']) assert.equal(kitobKodimi(c), true, c);
  for (const q of ['Kasr nima?', 'salom', '2+2 nechchi bo\'ladi', 'what is 5 times 3 please', '']) assert.equal(kitobKodimi(q), false, q);
});

test('REV125: gap() translates even when apostrophes differ', () => {
  for (const q of ["Endi yangi darsga o‘tamiz!", "Endi yangi darsga o`tamiz!", "Endi yangi darsga oʻtamiz!"])
    assert.equal(gap('en', q), "[en]Now let's start a new lesson![/en]", q);
  assert.equal(gap('uz', "Endi yangi darsga o'tamiz!"), "Endi yangi darsga o'tamiz!");
});
