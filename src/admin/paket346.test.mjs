import test from 'node:test';
import assert from 'node:assert/strict';
import { paketTuri, paketNavbati } from './paketRules.js';
test('REV346: xalqaro fayllar — o‘z turi, o‘zbekchasi birinchi', () => {
  assert.equal(paketTuri('xalqaro_de.xlsx'), 'xalqaro');
  const n = paketNavbati(['xalqaro_de.xlsx', 'xalqaro_es.xlsx', 'xalqaro_uz.xlsx', 'matematika_4_5_yosh_uz_1_mavzular.xlsx'].map((nomi) => ({ nomi })));
  assert.deepEqual(n.map((x) => x.nomi), ['matematika_4_5_yosh_uz_1_mavzular.xlsx', 'xalqaro_uz.xlsx', 'xalqaro_de.xlsx', 'xalqaro_es.xlsx']);
});
