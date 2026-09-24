import test from 'node:test';
import assert from 'node:assert/strict';
import { preferredDictationMethod, dictationSupport } from './admin/browserDictation.js';
import { LiveDictation } from './admin/liveDictation.js';

test('browser remains default before and after admin Groq status arrives', () => {
  for (const support of [{ browser: true }, { browser: true, recording: true, live: true }])
    assert.equal(preferredDictationMethod('auto', support), 'browser');
  assert.equal(preferredDictationMethod('live', { browser: true, live: true }), 'live');
  assert.equal(preferredDictationMethod('live', { browser: true, live: false }), 'browser');
});

test('without browser recognition a configured admin gets live capture before stop-only recording', () => {
  assert.equal(preferredDictationMethod('auto', { recording: true, live: true }), 'live');
  assert.equal(preferredDictationMethod('auto', { live: true }), 'live');
  const env = { navigator: { mediaDevices: { getUserMedia() {} } }, MediaRecorder: class {}, AudioContext: class { createScriptProcessor() {} } };
  assert.equal(dictationSupport({ dictation_available: false }, env).recording, false);
  assert.equal(dictationSupport({ dictation_available: true }, env).recording, true);
});

const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
function fixture({ permission, state = 'running', failResume = 0 } = {}) {
  const states = [], errors = [], saved = [], contexts = [], timers = new Map(); let stopped = 0;
  const node = () => ({ connect() {}, disconnect() {} });
  const stream = { getTracks: () => [{ stop() { stopped++; }, addEventListener() {} }] };
  class Context {
    constructor() { this.sampleRate = 48000; this.destination = {}; this.state = state; this.resumes = 0; contexts.push(this); }
    resume() { this.resumes++; if(this.resumes === failResume) throw new Error('Audio context unavailable'); return Promise.resolve(); }
    close() { this.closed = true; return Promise.resolve(); }
    createMediaStreamSource() { return node(); }
    createScriptProcessor() { return this.processor = node(); }
    createGain() { return { ...node(), gain: { value: 1 } }; }
  }
  const live = new LiveDictation({ AudioContext: Context,
    mediaDevices: { getUserMedia: () => permission?.promise || Promise.resolve(stream) },
    transcribe: async () => ({ text: 'Gap.' }), onState: value => states.push(value),
    onError: error => errors.push(error), onRecording: audio => saved.push(audio),
    setTimer: (fn, ms) => { timers.set(fn, ms); return fn; }, clearTimer: fn => timers.delete(fn),
  });
  const run = ms => { const fn = [...timers].find(([, delay]) => delay === ms)?.[0]; assert.ok(fn, `Missing timer ${ms}`); timers.delete(fn); fn(); };
  return { live, states, errors, saved, contexts, timers, stream, run, stopped: () => stopped };
}

test('AudioContext suspended during permission is resumed again after microphone grant', async () => {
  const f = fixture({ state: 'suspended' });
  await f.live.start();
  assert.equal(f.contexts[0].resumes, 2);
  f.contexts[0].processor.onaudioprocess({ inputBuffer: { getChannelData: () => new Float32Array(480).fill(.2) } });
  assert.equal(f.states.at(-1), 'recording');
  f.live.cancel(); assert.equal(f.stopped(), 1); assert.equal(f.timers.size, 0);
});

test('granted microphone with no frames cannot stay at zero seconds indefinitely', async () => {
  const f = fixture(); await f.live.start(); f.run(12000);
  assert.equal(f.states.at(-1), 'idle'); assert.match(f.errors[0], /^STT_CAPTURE_STALLED:/);
  assert.equal(f.stopped(), 1); assert.equal(f.contexts[0].closed, true);
  assert.equal(f.live.session, null); assert.equal(f.timers.size, 0);
});

test('synchronous Web Audio failures release capture without leaving a waiting timer', async () => {
  for (const failResume of [1, 2]) {
    const f = fixture({ state: 'suspended', failResume }); await f.live.start();
    assert.equal(f.states.at(-1), 'idle'); assert.match(f.errors[0], /^STT_CAPTURE_STALLED:/);
    assert.equal(f.live.session, null); assert.equal(f.timers.size, 0);
    assert.equal(f.contexts[0].closed, true);
  }
});

test('a graph that stops delivering frames releases its microphone and preserves captured audio', async () => {
  const f = fixture(); await f.live.start();
  f.contexts[0].processor.onaudioprocess({ inputBuffer: { getChannelData: () => new Float32Array(48000).fill(.2) } });
  f.run(12000);
  assert.equal(f.states.at(-1), 'idle'); assert.match(f.errors[0], /^STT_CAPTURE_STALLED:/);
  assert.equal(f.saved.length, 1); assert.equal(f.saved[0].blob.size, 32044);
  assert.equal(f.stopped(), 1); assert.equal(f.timers.size, 0);
});

test('unanswered microphone permission is bounded and a late grant is released', async () => {
  const permission = deferred(), f = fixture({ permission });
  const start = f.live.start(); f.run(20000);
  assert.equal(f.states.at(-1), 'idle'); assert.equal(f.live.session, null);
  permission.resolve(f.stream); await start;
  assert.equal(f.stopped(), 1); assert.equal(f.timers.size, 0);
});

test('cancel and repeated stop while waiting release everything and permit another start', async () => {
  const f = fixture(); await f.live.start();
  const oldCallbacks = [...f.timers.keys()]; f.live.stop(); f.live.stop();
  assert.equal(f.states.at(-1), 'idle');
  await f.live.start(); for (const callback of oldCallbacks) callback();
  assert.ok(f.live.session); assert.ok(!f.contexts[1].closed);
  f.live.cancel(); assert.equal(f.stopped(), 2); assert.equal(f.timers.size, 0);
});
