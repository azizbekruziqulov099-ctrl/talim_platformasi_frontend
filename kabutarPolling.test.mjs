import test from 'node:test';
import assert from 'node:assert/strict';
import {startKabutarPoll, mergeKabutarMessages} from './kabutar/kabutarPolling.js';
const flush = () => new Promise(setImmediate);

test('No second request while slow request is in flight; stopping aborts it', async () => {
  let resolve, calls = 0, signal;
  const timers = [];
  const stop = startKabutarPoll(s => {calls++; signal=s; return new Promise(r => {resolve=r;});}, {
    interval:6000, setTimer:(fn,ms)=>{timers.push({fn,ms}); return 1;}, clearTimer(){}
  });
  assert.equal(calls,1); assert.equal(timers.length,0);
  await flush(); assert.equal(calls,1);
  stop(); assert.equal(signal.aborted,true);
  resolve(true); await flush(); assert.equal(timers.length,0);
});

test('Failure backoff is bounded and success restores normal frequency', async () => {
  let succeeds = false;
  const timers = [];
  const stop = startKabutarPoll(async()=>succeeds, {
    interval:6000, setTimer:(fn,ms)=>{timers.push({fn,ms}); return timers.length;},clearTimer(){}
  });
  for (const expected of [12000,24000,48000,60000,60000]) {
    await flush(); const entry=timers.shift(); assert.equal(entry.ms,expected); entry.fn();
  }
  await flush(); succeeds=true; timers.shift().fn(); await flush();
  assert.equal(timers.shift().ms,6000); stop();
});

test('Outgoing and server pages merge without duplicate bubbles or lost incoming messages', () => {
  const messages = mergeKabutarMessages([{id:1,matn:'old'},{id:5,matn:'own'}], [
    {id:2,matn:'incoming A'}, {id:3,matn:'incoming B'}, {id:5,matn:'own',tahrirlangan:true}
  ]);
  assert.deepEqual(messages.map(x=>x.id), [1,2,3,5]);
  assert.equal(messages.at(-1).tahrirlangan,true);
});

import {contactRecord, kabutarRequest} from './kabutar/kabutarAccountRules.js';
test('Google negative account IDs remain valid contacts; zero is not an account', () => {
  assert.equal(contactRecord({user_id:-123456,full_name:'Google user'}).user_id,-123456);
  assert.equal(contactRecord({user_id:0}),null);
  assert.equal(contactRecord({user_id:'invalid'}),null);
});

test('Discovery sends session in Authorization rather than query URL', async () => {
  const original = globalThis.fetch;
  let sent;
  globalThis.fetch = async (url, options) => {sent={url,options};return {ok:true,json:async()=>({user_id:1})};};
  try {
    await kabutarRequest('https://api.example/','/api/kabutar/find?query=%40aziz','private-token',{authInHeader:true});
    assert.equal(new URL(sent.url).searchParams.has('token'),false);
    assert.equal(sent.options.headers.Authorization,'Bearer private-token');
  } finally {globalThis.fetch=original;}
});
