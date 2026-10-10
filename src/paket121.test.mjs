import test from 'node:test';
import assert from 'node:assert/strict';
import { paketBelgi, paketNavbati, paketTuri, paketXulosa } from './admin/paketRules.js';

test('REV121: paket — avval mavzular, keyin miyalar; ro\'yxat o\'tkaziladi; aniq belgi', () => {
  const list = paketNavbati([
    { key: 1, nomi: 'mantiq_2-3_yosh_2_ai_miya.xlsx' },
    { key: 2, nomi: 'mantiq_rasmlar_royxati.xlsx' },
    { key: 3, nomi: 'mantiq_2-3_yosh_1_mavzular.xlsx' },
  ]);
  assert.deepEqual(list.map((x) => x.turi), ['mavzu', 'miya', 'royxat']);
  assert.equal(list[2].holat, 'otkazildi');
  assert.equal(paketBelgi('ingliz_tili_izoh_ru_4-5_yosh_2_ai_miya.xlsx'), 'Ingliz tili · izoh rus · 4-5 yosh · miya');
  assert.equal(paketTuri('kitob.zip'), 'miya');
  const x = paketXulosa([{ holat: 'tayyor' }, { holat: 'xato' }, { holat: 'kutmoqda' }, { holat: 'otkazildi' }]);
  assert.deepEqual([x.tayyor, x.xato, x.qoldi, x.otkazildi, x.foiz], [1, 1, 1, 1, 75]);
});
