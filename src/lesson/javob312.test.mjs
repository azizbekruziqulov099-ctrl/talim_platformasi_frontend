import test from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer, javobYechimdan, sonQiymat } from './darsXonasiRules.js';
test('REV312: javob — kasr, bo‘lish, o‘nli kasr, aralash son teng qiymat; yechimdagi «Javob:» qatori', () => {
  assert.ok(checkAnswer('5/8', '$\\frac{5}{8}$')); assert.ok(checkAnswer('5:8', '5/8')); assert.ok(checkAnswer('0,625', '5/8'));
  assert.ok(checkAnswer('10/16', '5/8')); assert.ok(checkAnswer('1 1/2', '3/2')); assert.ok(checkAnswer('12', '12 ta olma'));
  assert.ok(!checkAnswer('5/9', '5/8')); assert.ok(!checkAnswer('', '5')); assert.equal(sonQiymat('3/0'), null);
  assert.equal(javobYechimdan([{ doska: '5 : 8' }, { doska: 'Javob: $\\frac{5}{8}$ || [ru]Ответ: 5/8[/ru]' }]), '\\frac{5}{8}');
  assert.equal(javobYechimdan([{ doska: 'Answer: 12 apples.' }]), '12 apples');
  assert.equal(javobYechimdan([{ doska: 'yechim yo‘q' }]), '');
});
