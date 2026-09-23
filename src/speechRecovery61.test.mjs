import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioDictation} from './admin/audioDictation.js';
import {BrowserDictation} from './admin/browserDictation.js';

const tick=()=>new Promise(resolve=>setImmediate(resolve));
function recording() {
 const timers=new Map(),states=[],errors=[],texts=[];let native,released=0;
 class Recorder {
  static isTypeSupported(){return true;}
  constructor(){native=this;this.state='inactive';this.mimeType='audio/webm';}
  start(){this.state='recording';}
  stop(){this.state='inactive';}
 }
 const recorder=new AudioDictation({Recorder,mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){released++;}}]})},
  transcribe:async()=>({text:'Salom.'}),onState:s=>states.push(s),onError:e=>errors.push(e),onText:t=>texts.push(t),
  setTimer:(fn,ms)=>{timers.set(fn,ms);return fn;},clearTimer:fn=>timers.delete(fn)});
 return {recorder,timers,states,errors,texts,native:()=>native,released:()=>released};
}
for(const nativeState of ['inactive','paused'])test(`stop releases microphone even when device state is ${nativeState}`,async()=>{
 const f=recording();await f.recorder.start();f.native().state=nativeState;
 f.recorder.stop();assert.equal(f.released(),1);assert.equal(f.states.at(-1),'stopping');
 assert.ok([...f.timers.values()].includes(5000));
 f.native().ondataavailable({data:new Blob(['final audio'])});f.native().onstop();await tick();
 assert.equal(f.texts[0].text,'Salom.');assert.equal(f.states.at(-1),'idle');
 f.recorder.dispose();assert.equal(f.timers.size,0);
});
test('missing native stop event cannot leave the microphone or editor locked',async()=>{
 const f=recording();await f.recorder.start();f.recorder.stop();
 assert.equal(f.released(),1);
 [...f.timers].find(([,ms])=>ms===5000)[0]();
 assert.equal(f.states.at(-1),'idle');assert.equal(f.errors.length,1);assert.equal(f.recorder.busy,false);
 f.recorder.dispose();
});
function recognition() {
 const timers=new Map(),states=[],errors=[],texts=[];let native;
 class Recognition{constructor(){native=this;}start(){}stop(){}abort(){this.aborted=true;}}
 const browser=new BrowserDictation({Recognition,onState:s=>states.push(s),onError:e=>errors.push(e),onText:t=>texts.push(t),
  setTimer:(fn,ms)=>{timers.set(fn,ms);return fn;},clearTimer:fn=>timers.delete(fn)});
 return {browser,timers,states,errors,texts,native:()=>native};
}
test('recognizer that starts but never produces text has a bounded failure',()=>{
 const f=recognition();f.browser.start('uz');f.native().onstart();
 const watchdog=[...f.timers.keys()][0];assert.equal(typeof watchdog,'function');watchdog();
 assert.equal(f.states.at(-1),'idle');assert.ok(f.errors[0]);assert.equal(f.native().aborted,true);
 f.browser.dispose();
});
test('stop retains provisional recognized words when the browser never emits a final result',()=>{
 const f=recognition();f.browser.start('uz');f.native().onstart();
 f.native().onresult({resultIndex:0,results:[{0:{transcript:'Salom dunyo'},isFinal:false}]});
 f.browser.stop();const finalizer=[...f.timers.keys()][0];
 f.browser.stop();assert.ok(f.timers.has(finalizer),'second click must not postpone stop');
 finalizer();assert.equal(f.states.at(-1),'idle');assert.equal(f.texts[0].text,'Salom dunyo');assert.equal(f.texts[0].draft,true);
 f.browser.dispose();
});
