import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogGrade } from './curriculum/catalog.js';
import { paraVaqti } from './student/scheduleTime.js';
import { detectSpeechLanguage, splitSpeechText, recognitionLocale, selectBrowserVoice } from './speech/language.js';
import { AudioDictation } from './admin/audioDictation.js';

test('school selection does not inherit a university course as a school grade', () => {
  assert.equal(catalogGrade('maktab', '2 kurs'), null);
  assert.equal(catalogGrade('maktab', '7-sinf'), '7');
  assert.equal(catalogGrade('maktab', '7 sinf'), '7');
  assert.equal(catalogGrade('universitet', '2-kurs magistr'), '2 kurs magistr');
  assert.equal(catalogGrade('universitet', '7-sinf'), null);
});
test('all lesson times derive from weekly settings including a zero break', () => {
  const settings = { boshlanish: '08:30', para_daqiqa: 80, tanaffus_daqiqa: 0 };
  assert.equal(paraVaqti({ raqam: 2, boshlanish: '14:00', tugash: '15:00' }, settings), '09:50–11:10');
  assert.equal(paraVaqti({ raqam: 0 }, settings), '07:10–08:30');
  assert.equal(paraVaqti({ raqam: 2 }, { ...settings, boshlanish: '17:00' }), '18:20–19:40');
  assert.equal(paraVaqti({ raqam: 1 }, { ...settings, boshlanish: '23:30' }), '23:30–00:50');
  assert.equal(paraVaqti({ raqam: 1 }, { boshlanish: '99:99' }), '08:30–09:50');
});
test('reading detects untagged Uzbek, Russian and English', () => {
  for (const [text, language] of [['Salom, bugun matematika darsi.', 'uz'], ['Which answer is correct?', 'en'],
    ['Hello world!', 'en'], ['Найдите правильный ответ.', 'ru'], ['Ўқувчилар учун китоб.', 'uz'],
    ['Quyidagi sonlarning yig‘indisini hisoblang.', 'uz']]) assert.equal(detectSpeechLanguage(text), language);
});
test('mixed sentences and explicit content tags preserve their own language', () => {
  assert.deepEqual(splitSpeechText('Salom. Hello world! Привет, мир. [uz]apple[/uz]').map(part => part.til), ['uz', 'en', 'ru', 'uz']);
  assert.deepEqual(splitSpeechText('[en]2 + 3 = 5[/en]'), [{ til: 'en', matn: '2 + 3 = 5' }]);
  assert.equal(detectSpeechLanguage('[lat]x + y[/lat]'), 'uz');
  assert.equal(recognitionLocale('Какой ответ?', ['en-US']), 'ru-RU');
  assert.equal(recognitionLocale('', ['ru-RU']), 'ru-RU');
});
test('male preference cannot accidentally match female or an unknown browser voice', () => {
  const voices = [{ lang: 'en-US', name: 'Female voice' }, { lang: 'en-US', name: 'Guy' }, { lang: 'uz-UZ', name: 'Madina' }];
  assert.equal(selectBrowserVoice(voices, 'en', 'ogil').name, 'Guy');
  assert.equal(selectBrowserVoice(voices, 'uz', 'qiz').name, 'Madina');
  assert.equal(selectBrowserVoice(voices, 'uz', 'ogil'), null);
  assert.equal(selectBrowserVoice([{ lang: 'en-US', name: 'Default voice' }], 'en', 'ogil'), null);
});

const tick = () => new Promise(resolve => setImmediate(resolve));
function dictationFixture(options = {}) {
  const states = [], texts = [], errors = [], sent = [], recorders = [], timers = [];
  const track = { stopped: false, stop() { this.stopped = true; } };
  const stream = { getTracks: () => [track] };
  class Recorder {
    static isTypeSupported(type) { return type.startsWith('audio/webm'); }
    constructor(_stream, { mimeType }) { this.mimeType = mimeType; this.state = 'inactive'; recorders.push(this); }
    start() { this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      this.ondataavailable?.({ data: new Blob(['last']) });
      this.onstop?.();
    }
  }
  const recorder = new AudioDictation({
    onState: value => states.push(value), onText: value => texts.push(value), onError: value => errors.push(value),
    mediaDevices: { getUserMedia: async () => stream }, Recorder,
    transcribe: async blob => { sent.push(blob); return { text: 'Hello.', language: 'english' }; },
    setTimer: callback => { timers.push(callback); return callback; }, clearTimer: () => {}, ...options,
  });
  return { recorder, states, texts, errors, sent, recorders, track, stream, timers };
}
test('recording includes all chunks and stops the microphone before transcription', async () => {
  const f = dictationFixture(); await f.recorder.start();
  f.recorders[0].ondataavailable({ data: new Blob(['first']) });
  f.recorder.stop(); await tick();
  assert.equal(await f.sent[0].text(), 'firstlast'); assert.equal(f.track.stopped, true);
  assert.deepEqual(f.states, ['starting', 'recording', 'transcribing', 'idle']);
  assert.deepEqual(f.texts, [{ text: 'Hello.', language: 'english' }]);
});
test('double clicks cannot start duplicate microphone sessions', async () => {
  const f = dictationFixture(); await Promise.all([f.recorder.start(), f.recorder.start()]);
  assert.equal(f.recorders.length, 1); f.recorder.cancel(); assert.equal(f.sent.length, 0);
});
test('leaving while permission is pending releases the eventual microphone', async () => {
  let resolve; const f = dictationFixture({ mediaDevices: { getUserMedia: () => new Promise(done => { resolve = done; }) } });
  const pending = f.recorder.start(); f.recorder.cancel(); resolve(f.stream); await pending;
  assert.equal(f.track.stopped, true); assert.equal(f.recorders.length, 0);
});
test('cancelled transcription cannot append a delayed result', async () => {
  let resolve, signal;
  const f = dictationFixture({ transcribe: (_blob, current) => { signal = current; return new Promise(done => { resolve = done; }); } });
  await f.recorder.start(); f.recorder.stop(); f.recorder.cancel(); resolve({ text: 'late' }); await tick();
  assert.equal(signal.aborted, true); assert.deepEqual(f.texts, []);
});
test('the two minute limit finishes and submits the current recording', async () => {
  const f = dictationFixture(); await f.recorder.start(); f.timers[0](); await tick();
  assert.equal(f.track.stopped, true); assert.equal(f.sent.length, 1); assert.equal(f.states.at(-1), 'idle');
});
test('oversized recordings stop without uploading partial audio', async () => {
  const f = dictationFixture(); await f.recorder.start();
  f.recorders[0].ondataavailable({ data: { size: 8 * 1024 * 1024 + 1 } });
  assert.equal(f.track.stopped, true); assert.equal(f.sent.length, 0); assert.equal(f.errors.length, 1);
});
test('transcription failures are visible and leave controls usable', async () => {
  const f = dictationFixture({ transcribe: async () => { throw new Error('Unavailable'); } });
  await f.recorder.start(); f.recorder.stop(); await tick();
  assert.deepEqual(f.errors, ['Unavailable']); assert.equal(f.states.at(-1), 'idle'); assert.equal(f.recorder.busy, false);
});
