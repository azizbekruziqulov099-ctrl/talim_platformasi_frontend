import test from 'node:test';
import assert from 'node:assert/strict';
import { accessCodeFile } from './institutionAccessCodes.js';

test('mixed pupil, parent and staff credentials preserve names, exact codes and person roles', () => {
  const result = { access_codes: [
    { name: 'Ro‘ziqulov Azizjon', code: 'ABCD00001234', role: 'oquvchi' },
    { name: 'Raxmonova Mohina', code: 'EFGH00005678', role: 'ota-ona' },
    { name: 'Аҳмадов Азиз', code: 'JKLM00009012', role: 'fan_oqituvchisi' },
  ] };
  const output = accessCodeFile(result);
  assert.equal(output.count, 3);
  assert.equal(output.filename, 'muassasa_shaxsiy_ulanish_kodlari.txt');
  assert.equal(output.text.charCodeAt(0), 0xFEFF);
  for (const item of result.access_codes) assert.ok(output.text.includes(`F.I.Sh.: ${item.name}\r\n`));
  assert.ok(output.text.includes('Kim uchun: O‘quvchi\r\nUlanish kodi: ABCD00001234'));
  assert.ok(output.text.includes('Kim uchun: Ota-ona\r\nUlanish kodi: EFGH00005678'));
  assert.ok(output.text.includes('Kim uchun: Fan o‘qituvchisi\r\nUlanish kodi: JKLM00009012'));
});

test('legacy staff responses without role remain downloadable with generic label', () => {
  const file = accessCodeFile({ access_codes: [{ name: 'O‘qituvchi', code: 'ABCDEFGHIJKL' }] });
  assert.ok(file.text.includes('Kim uchun: Xodim'));
  assert.ok(file.text.includes('Bu shaxsiy hisob paroli emas'));
});

test('empty or malformed code results never produce a misleading credential file', () => {
  assert.equal(accessCodeFile({ access_codes: [] }), null);
  assert.throws(() => accessCodeFile({ access_codes: [{ name: 'Learner', code: 'broken' }] }), /to‘liq qaytmadi/);
});
