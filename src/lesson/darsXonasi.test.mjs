import test from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer, sceneRange, speakableText } from './darsXonasiRules.js';

test('student answers accept spacing, LaTeX and several correct forms', () => {
  assert.equal(checkAnswer(' 2 / 6 ', '2/6|1/3'), true);
  assert.equal(checkAnswer('1/3', '2/6|1/3'), true);
  assert.equal(checkAnswer('$\\frac{2}{6}$', '2/6'), true);
  assert.equal(checkAnswer('0,5', '0.5'), true);
  assert.equal(checkAnswer('6/2', '2/6'), false);
  assert.equal(checkAnswer('', '2/6'), false);
});

test('steps with the same scene stay on one board', () => {
  const steps = [{ sahna: 'A' }, { sahna: 'C' }, { sahna: 'C' }, { sahna: 'C' }, { sahna: 'D' }];
  assert.deepEqual(sceneRange(steps, 3), [1, 2, 3]);
  assert.deepEqual(sceneRange(steps, 4), [4]);
  assert.deepEqual(sceneRange(steps, 9), []);
});

test('formulas are shown on the board but not read aloud', () => {
  assert.equal(speakableText('Javob: $\\frac{3}{8}$ bo‘ladi'), 'Javob: bo‘ladi');
});

test('open lesson download link carries token, topic and format', async () => {
  const { lessonDownloadUrl } = await import('./darsXonasiRules.js');
  const url = lessonDownloadUrl('https://api.example/', 'tok', '5-01 x', 'docx');
  assert.equal(url, 'https://api.example/api/dars_xonasi/5-01%20x/yuklab?token=tok&format=docx');
  assert.ok(lessonDownloadUrl('', 't', 'a', 'exe').endsWith('format=pdf'));
});

test('board lines appear when the teacher reaches [1], [2] markers', async () => {
  const { boardCues, visibleLines } = await import('./darsXonasiRules.js');
  const c = boardCues('Maxraj — jami\nSurat — olingan', 'Butunni bo‘lamiz. [1] Pastdagi son maxraj. [2] Tepadagi son surat.');
  assert.equal(c.spoken, 'Butunni bo‘lamiz. Pastdagi son maxraj. Tepadagi son surat.');
  assert.deepEqual(c.cues, [2, 5]);
  assert.equal(visibleLines(c.cues, 0, false), 0);
  assert.equal(visibleLines(c.cues, 3, false), 1);
  assert.equal(visibleLines(c.cues, 6, false), 2);
  assert.equal(visibleLines(c.cues, -1, true), 2);
});

test('without markers board lines are spread evenly over the speech', async () => {
  const { boardCues, visibleLines } = await import('./darsXonasiRules.js');
  const c = boardCues('a\nb\nc', 'bir ikki uch tort besh olti');
  assert.deepEqual(c.cues, [0, 2, 4]);
  assert.equal(visibleLines(c.cues, 0, false), 1);
  assert.equal(visibleLines(c.cues, 4, false), 3);
});
