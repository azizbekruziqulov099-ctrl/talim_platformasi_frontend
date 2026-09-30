import test from 'node:test';
import assert from 'node:assert/strict';
import {LiveDictation} from './admin/liveDictation.js';
import {AudioDictation} from './admin/audioDictation.js';
import {dictationSupport} from './admin/browserDictation.js';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};
function fixture({noStart=false,noStop=false,permission,transcribe}={}){
 let now=0,released=0;const timers=new Map(),states=[],errors=[],texts=[],saved=[],activity=[],recorders=[],uploads=[];
 const stream={getTracks:()=>[{stop(){released++;},addEventListener(){}}]};
 class Recorder {
  static isTypeSupported(type){return type.startsWith('audio/webm');}
  constructor(){this.state='inactive';this.mimeType='audio/webm';this.id=recorders.length+1;recorders.push(this);}
  start(){this.state='recording';if(!noStart)this.onstart?.();}
  stop(){this.state='inactive';if(noStop)return;queueMicrotask(()=>{this.ondataavailable?.({data:new Blob([`WEBM-HEADER-${this.id}:voice`])});this.onstop?.();});}
 }
 const options={Recorder,AudioContext:class {constructor(){assert.fail('Native capture must not need Web Audio');}},
  mediaDevices:{getUserMedia:()=>permission?.promise||Promise.resolve(stream)},now:()=>now,
  setTimer:(fn,ms)=>{timers.set(fn,now+ms);return fn;},clearTimer:fn=>timers.delete(fn),
  onState:s=>states.push(s),onText:t=>texts.push(t),onError:e=>errors.push(e),onRecording:r=>saved.push(r),onActivity:a=>activity.push(a),
  transcribe:async(blob,signal,language)=>{uploads.push({blob,signal,language});return transcribe?transcribe(blob,signal,language):{text:`Gap ${uploads.length}.`,language};}};
 const live=new LiveDictation(options);
 const advance=ms=>{const end=now+ms;let count=0;while(true){const item=[...timers].sort((a,b)=>a[1]-b[1])[0];if(!item||item[1]>end)break;assert.ok(count++<1000);now=item[1];timers.delete(item[0]);item[0]();}now=end;};
 return {live,advance,states,errors,texts,saved,activity,recorders,uploads,timers,stream,options,released:()=>released};
}
test('native capture streams text while microphone remains open, with a complete file per request',async()=>{
 const f=fixture();await f.live.start({language:'uz'});assert.equal(f.states.at(-1),'recording');
 f.advance(1000);assert.equal(f.activity.at(-1).seconds,1);assert.equal(f.activity.at(-1).level,null);
 f.advance(7000);await tick();assert.equal(f.texts.at(-1).text,'Gap 1.');assert.equal(f.released(),0);
 f.advance(8000);await tick();assert.equal(f.texts.at(-1).text,'Gap 1. Gap 2.');
 assert.deepEqual(await Promise.all(f.uploads.map(u=>u.blob.text())),['WEBM-HEADER-1:voice','WEBM-HEADER-2:voice']);
 f.live.stop();assert.equal(f.released(),1);await tick();assert.equal(f.states.at(-1),'idle');
 assert.equal(f.saved.at(-1).blobs.length,3);assert.equal(f.timers.size,0);
});
test('native capture is available on phones without Web Audio or SpeechRecognition',()=>{
 const f=fixture();assert.equal(dictationSupport({dictation_available:true},{MediaRecorder:f.options.Recorder,navigator:{mediaDevices:f.options.mediaDevices}}).live,true);
 assert.equal(dictationSupport({dictation_available:false},{MediaRecorder:f.options.Recorder,navigator:{mediaDevices:f.options.mediaDevices}}).live,false);
});
test('missing recorder start/stop events are bounded, release microphone and unlock editor',async()=>{
 for(const flags of [{noStart:true},{noStop:true}]){
  const f=fixture(flags);await f.live.start();f.advance(15000);await tick();
  assert.equal(f.states.at(-1),'idle');assert.equal(f.released(),1);assert.match(f.errors[0],/^STT_CAPTURE_STALLED:/);assert.equal(f.timers.size,0);
 }
});
test('cancelled or timed out permission releases a late microphone grant',async()=>{
 for(const timeout of [false,true]){
  const permission=deferred(),f=fixture({permission});const start=f.live.start();
  if(timeout)f.advance(20000);else f.live.cancel();
  permission.resolve(f.stream);await start;assert.equal(f.released(),1);assert.equal(f.states.at(-1),'idle');assert.equal(f.recorders.length,0);assert.equal(f.timers.size,0);
 }
});
test('stop while server works closes microphone immediately and drains completed files in order',async()=>{
 const pending=deferred(),f=fixture({transcribe:()=>pending.promise});await f.live.start();f.advance(8000);await tick();
 f.live.stop();f.live.stop();assert.equal(f.released(),1);await tick();assert.equal(f.states.at(-1),'transcribing');
 pending.resolve({text:'Gap.'});await tick();assert.equal(f.states.at(-1),'idle');assert.equal(f.texts.at(-1).text,'Gap. Gap.');assert.equal(f.timers.size,0);
});
test('quota errors keep finished audio and cannot restart a cancelled recorder',async()=>{
 const pending=deferred(),f=fixture({transcribe:()=>pending.promise});await f.live.start();f.advance(8000);await tick();
 const stale=f.recorders[0].onstart;f.live.cancel();await f.live.start();pending.resolve({text:'late'});stale?.();await tick();
 assert.equal(f.texts.length,0);assert.equal(f.states.at(-1),'recording');assert.equal(f.saved[0].blobs.length,1);f.live.cancel();
 const limited=fixture({transcribe:async()=>{throw Error('STT_LIMIT: quota');}});await limited.live.start();limited.advance(8000);await tick();
 assert.equal(limited.released(),1);assert.deepEqual(limited.errors,['STT_LIMIT: quota']);assert.equal(limited.saved[0].blobs.length,1);assert.equal(limited.timers.size,0);
});
test('silence between spoken sentences does not end a live dictation session',async()=>{
 let calls=0;const f=fixture({transcribe:async()=>{if(++calls===1)throw Error('STT_NO_SPEECH: silence');return {text:'Salom.'};}});
 await f.live.start();f.advance(8000);await tick();assert.equal(f.states.at(-1),'recording');assert.equal(f.activity.at(-1).quiet,true);
 f.advance(8000);await tick();assert.equal(f.texts.at(-1).text,'Salom.');assert.equal(f.errors.length,0);f.live.cancel();
});
test('slow uploads bound the backlog and preserve all completed segments',async()=>{
 const pending=deferred(),f=fixture({transcribe:()=>pending.promise});await f.live.start();
 for(let i=0;i<4;i++){f.advance(8000);await tick();}
 assert.equal(f.released(),1);assert.equal(f.states.at(-1),'transcribing');assert.equal(f.live.session.queue.length,3);assert.equal(f.saved.at(-1).blobs.length,4);
 f.live.cancel();pending.resolve({text:'late'});await tick();assert.equal(f.texts.length,0);
});
test('retry uploads separate complete files, never an invalid concatenated WebM',async()=>{
 const calls=[],texts=[];const recorder=new AudioDictation({transcribe:async blob=>{calls.push(await blob.text());return {text:`Qism ${calls.length}.`};},
  onText:r=>texts.push(r.text),onState:()=>{},onError:e=>assert.fail(e)});
 recorder.selectSegments([new Blob(['first'],{type:'audio/webm'}),new Blob(['second'],{type:'audio/webm'})],{language:'uz'});
 await recorder.retry();assert.deepEqual(calls,['first','second']);assert.equal(texts.at(-1),'Qism 1. Qism 2.');assert.equal(recorder.lastRecording.blobs.length,2);
});
