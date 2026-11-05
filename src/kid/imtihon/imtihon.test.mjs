import test from 'node:test';
import assert from 'node:assert/strict';
import { haftaDarslari, imtihonRejasi, imtihonXulosa } from './imtihonRules.js';
const st = (oyin, doska) => ({ turi: 'amaliy', oyin, doska });
test('REV361: Kabu imtihoni — haftaning darslari, fanlar aralash, ketma-ket bir xil o‘yin yo‘q', () => {
  const albom = { berildi: { 'A1|2026-11-02': 1, 'B1|2026-11-03': 1, 'A2|2026-11-04': 1, 'ESKI|2026-10-20': 1 } };
  assert.deepEqual(haftaDarslari(albom, new Date('2026-11-08T10:00:00Z')), ['A1', 'B1', 'A2']);
  const d = (kod, fan) => ({ kod, fan, mavzu: kod, steps: [{ turi: 'qoida', doska: '🐈 mushuk\n🐕 it\n🐄 sigir' }, st(116, ''), st(83, ''), st(88, ''), st(171, '')] });
  const r = imtihonRejasi([d('A1', 'Atrof'), d('B1', 'Mantiq'), d('A2', 'Atrof')], { yosh: '4-5', urug: 3 });
  assert.equal(r.length, 6);
  assert.ok(r.every((x) => x.id !== 171), 'harakat o‘yini yo‘q');
  for (let i = 1; i < r.length; i++) assert.notEqual(r[i].id, r[i - 1].id);
  assert.ok(new Set(r.map((x) => x.kod)).size >= 2, 'bir nechta darsdan');
  const x = imtihonXulosa([{ mavzu: 'A', togri: 5, xato: 0 }, { mavzu: 'B', togri: 1, xato: 3 }]);
  assert.equal(x.takror[0], 'B'); assert.ok(x.foiz > 0 && x.yulduz >= 1);
});
