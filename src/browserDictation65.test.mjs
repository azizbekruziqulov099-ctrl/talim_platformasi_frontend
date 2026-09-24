import test from 'node:test';
import assert from 'node:assert/strict';
import {BrowserDictation,browserDictationStatus} from './admin/browserDictation.js';

const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
function fixture({permission,startError}={}) {
 const natives=[],states=[],statuses=[],errors=[],texts=[],drafts=[],timers=new Map();
 let permissionCalls=0,released=0;
 const track={kind:'audio',readyState:'live',enabled:true,stop(){released++;}};
 const stream={getTracks:()=>[track]};
 class Recognition {
  constructor(){natives.push(this);}
  start(){assert.ok(released>0,'release preflight before opening recognition');if(startError)throw startError;}
  abort(){this.aborted=true;}
  stop(){this.stopped=true;}
 }
 const browser=new BrowserDictation({Recognition,mediaDevices:{getUserMedia(options){permissionCalls++;assert.deepEqual(options,{audio:true});return permission?.promise||Promise.resolve(stream);}},
  onState:v=>states.push(v),onStatus:v=>statuses.push(v),onText:v=>texts.push(v),onInterim:v=>drafts.push(v),onError:e=>errors.push(e),
  setTimer:(fn,ms)=>{timers.set(fn,ms);return fn;},clearTimer:fn=>timers.delete(fn)});
 const run=ms=>{const fn=[...timers].find(([,delay])=>delay===ms)?.[0];assert.ok(fn,`Missing ${ms}ms timer`);timers.delete(fn);fn();};
 const say=(text,final=true)=>natives.at(-1).onresult({results:[{0:{transcript:text},isFinal:final}]});
 return {browser,natives,states,statuses,errors,texts,drafts,timers,stream,track,run,say,permissionCalls:()=>permissionCalls,released:()=>released};
}

test('permission request happens in the click; recognizer starts only after microphone is released',async()=>{
 const p=deferred(),f=fixture({permission:p});const started=f.browser.start('uz');
 assert.equal(f.permissionCalls(),1);assert.equal(f.natives.length,0);
 assert.equal(f.statuses.at(-1).phase,'permission');assert.match(browserDictationStatus(f.statuses.at(-1)),/Ruxsat/);
 p.resolve(f.stream);await started;
 assert.equal(f.released(),1);assert.equal(f.natives.length,1);assert.equal(f.statuses.at(-1).microphoneVerified,true);
 f.natives[0].onstart();assert.equal(f.statuses.at(-1).phase,'service');
 f.natives[0].onaudiostart();assert.equal(f.statuses.at(-1).phase,'listening');
 f.say('salom',false);assert.equal(f.drafts.at(-1),'salom');assert.equal(f.statuses.at(-1).phase,'text');
 f.say('Salom.');f.browser.stop();f.natives[0].onend();
 assert.deepEqual(f.texts,[{text:'Salom.',language:'uz'}]);assert.equal(f.timers.size,0);
});

test('pictured silent startup gets one released-microphone retry, then unlocks with a service error',async()=>{
 const f=fixture();await f.browser.start('uz');const late=f.natives[0].onstart;
 f.run(8000);assert.equal(f.natives[0].aborted,true);assert.equal(f.statuses.at(-1).phase,'retrying');
 f.run(250);assert.equal(f.natives.length,2);assert.equal(f.natives[1].lang,'uz-UZ');assert.equal(f.natives[1].continuous,false);
 late();assert.equal(f.statuses.at(-1).phase,'service');
 f.run(8000);assert.equal(f.states.at(-1),'idle');assert.equal(f.browser.session,null);
 assert.equal(f.statuses.at(-1).code,'service-timeout');assert.match(f.errors[0],/Mikrofonga ruxsat bor/);
 assert.equal(f.natives.length,2);assert.equal(f.timers.size,0);
 await f.browser.start('uz');assert.equal(f.natives.length,3);f.browser.cancel();
});

test('start event without captured audio cannot bypass the startup deadline',async()=>{
 const f=fixture();await f.browser.start('en');f.natives[0].onstart();f.run(8000);f.run(250);
 f.natives[1].onstart();f.run(8000);
 assert.equal(f.states.at(-1),'idle');assert.equal(f.statuses.at(-1).code,'service-timeout');
});

test('compatibility retry can produce text live and resume the next phrase in the same language',async()=>{
 const f=fixture();await f.browser.start('ru');f.run(8000);f.run(250);
 f.say('Первое предложение',false);assert.equal(f.drafts.at(-1),'Первое предложение');
 f.say('Первое предложение.');f.natives.at(-1).onend();f.run(250);
 assert.equal(f.natives.at(-1).lang,'ru-RU');assert.equal(f.natives.at(-1).continuous,false);
 f.say('Второе предложение.');f.browser.stop();f.natives.at(-1).onend();
 assert.deepEqual(f.texts.map(v=>v.text),['Первое предложение.','Второе предложение.']);assert.equal(f.permissionCalls(),1);
});

for(const name of ['NotAllowedError','NotFoundError','NotReadableError','SecurityError'])test(`${name} identifies hardware/permission failure, without a recognition retry`,async()=>{
 const p=deferred(),f=fixture({permission:p});const start=f.browser.start();p.reject(new DOMException('device problem',name));await start;
 assert.equal(f.statuses.at(-1).code,name);assert.equal(f.natives.length,0);assert.equal(f.timers.size,0);assert.equal(f.states.at(-1),'idle');
 assert.ok(f.errors[0]);
});

for(const action of ['cancel','stop','dispose','timeout'])test(`${action} during unanswered permission releases a late grant without opening the recognizer`,async()=>{
 const p=deferred(),f=fixture({permission:p});const start=f.browser.start();
 if(action==='timeout')f.run(20000);else f.browser[action]();
 const count=f.statuses.length;p.resolve(f.stream);await start;
 assert.equal(f.released(),1);assert.equal(f.natives.length,0);assert.equal(f.browser.session,null);assert.equal(f.timers.size,0);
 assert.equal(f.statuses.length,count);
});

test('disabled or ended microphone tracks cannot be reported as verified',async()=>{
 for(const change of [{enabled:false},{readyState:'ended'}]){
  const f=fixture();Object.assign(f.track,change);await f.browser.start();
  assert.equal(f.statuses.at(-1).microphoneVerified,false);assert.equal(f.statuses.at(-1).code,'audio-capture');
  assert.equal(f.natives.length,0);assert.equal(f.released(),1);assert.equal(f.timers.size,0);
 }
});

test('old permission grant and timers cannot interfere with a new attempt',async()=>{
 const p=deferred(),f=fixture({permission:p});const oldStart=f.browser.start();const stale=[...f.timers.keys()];
 f.browser.stop();f.browser.mediaDevices={getUserMedia:async()=>f.stream};await f.browser.start('ru');
 p.resolve(f.stream);await oldStart;stale.forEach(fn=>fn());
 assert.equal(f.natives.length,1);assert.equal(f.natives[0].lang,'ru-RU');assert.ok(f.browser.session);
 f.browser.cancel();assert.equal(f.released(),2);assert.equal(f.timers.size,0);
});

test('late old recognizer events and deadlines cannot stop a live new attempt',async()=>{
 const f=fixture();await f.browser.start();const old=f.natives[0];const late=[old.onstart,old.onaudiostart,old.onspeechstart,old.onend];
 const stale=[...f.timers.keys()];f.browser.cancel();await f.browser.start('en');f.say('New text.');
 late.forEach(fn=>fn());stale.forEach(fn=>fn());
 assert.equal(f.texts.length,1);assert.ok(f.browser.session);assert.equal(f.statuses.at(-1).phase,'text');f.browser.cancel();
});

test('network error before text retries once, with no unbounded loop or language substitution',async()=>{
 const f=fixture();await f.browser.start('uz');f.natives[0].onerror({error:'network'});f.run(250);
 assert.equal(f.natives[1].lang,'uz-UZ');f.natives[1].onerror({error:'network'});
 assert.equal(f.states.at(-1),'idle');assert.equal(f.natives.length,2);assert.equal(f.errors.length,1);assert.equal(f.timers.size,0);
});

for(const code of ['no-speech','not-allowed','service-not-allowed','language-not-supported'])test(`${code} never silently retries`,async()=>{
 const f=fixture();await f.browser.start('uz');f.natives[0].onerror({error:code});
 assert.equal(f.natives.length,1);assert.equal(f.timers.size,0);assert.equal(f.states.at(-1),'idle');assert.equal(f.errors.length,1);
});

test('words survive an error, and errors after Stop cannot reopen or retry the microphone',async()=>{
 const f=fixture();await f.browser.start();f.say('saqlanadigan so‘z',false);
 f.browser.stop();f.natives[0].onerror({error:'network'});
 assert.equal(f.natives.length,1);assert.equal(f.errors.length,0);assert.equal(f.texts[0].text,'saqlanadigan so‘z');assert.equal(f.timers.size,0);
});

test('speech heard without results times out as a recognition failure, not a permission failure',async()=>{
 const f=fixture();await f.browser.start();f.natives[0].onaudiostart();f.natives[0].onspeechstart();f.run(20000);
 assert.match(f.errors[0],/ovozni eshitdi/);assert.equal(f.statuses.at(-1).code,'no-result');assert.equal(f.states.at(-1),'idle');
});

test('cancel while retry is scheduled never reopens the microphone',async()=>{
 const f=fixture();await f.browser.start();f.run(8000);const stale=[...f.timers.keys()];f.browser.cancel();stale.forEach(fn=>fn());
 assert.equal(f.natives.length,1);assert.equal(f.timers.size,0);assert.equal(f.states.at(-1),'idle');
});

test('start throws without leaving the page busy',async()=>{
 const f=fixture({startError:new DOMException('not allowed','NotAllowedError')});await f.browser.start();
 assert.equal(f.browser.session,null);assert.equal(f.states.at(-1),'idle');assert.equal(f.timers.size,0);assert.equal(f.errors.length,1);
});

test('empty and repeated result events cannot indefinitely extend the startup or silence deadline',async()=>{
 const f=fixture();await f.browser.start();const startup=[...f.timers.keys()][0];
 f.natives[0].onresult({results:[]});assert.equal([...f.timers.keys()][0],startup);
 assert.equal(f.statuses.at(-1).phase,'service');
 f.say('Bir xil matn',false);const words=[...f.timers.keys()][0];f.say('Bir xil matn',false);
 assert.equal([...f.timers.keys()][0],words);
 f.run(20000);assert.equal(f.states.at(-1),'idle');assert.equal(f.texts[0].text,'Bir xil matn');
});
