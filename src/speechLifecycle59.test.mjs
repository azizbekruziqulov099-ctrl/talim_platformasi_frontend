import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioDictation} from './admin/audioDictation.js';
import {BrowserDictation} from './admin/browserDictation.js';
import {SpeechReader} from './admin/speechReader.js';

const tick=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};
function hardware({permission,brokenStop=false}={}) {
 const events=[],states=[],errors=[],texts=[],saved=[],timers=new Map(),instances=[];
 let released=0;
 const stream={getTracks:()=>[{stop(){released++;throw new Error('Detached track');}},{stop(){released++;}}]};
 class Recorder {
  static isTypeSupported(){return true;}
  constructor(){this.state='inactive';this.mimeType='audio/webm';instances.push(this);}
  start(){this.state='recording';}
  stop(){if(brokenStop)throw new DOMException('Already stopped','InvalidStateError');this.state='inactive';events.push(()=>{this.ondataavailable?.({data:new Blob(['complete voice'])});this.onstop?.();});}
 }
 const result=deferred();
 const recorder=new AudioDictation({Recorder,mediaDevices:{getUserMedia:()=>permission?.promise||Promise.resolve(stream)},
  transcribe:()=>result.promise,onState:value=>states.push(value),onError:value=>errors.push(value),
  onText:value=>texts.push(value),onRecording:value=>saved.push(value),
  setTimer:(fn,ms)=>{timers.set(fn,ms);return fn;},clearTimer:fn=>timers.delete(fn)});
 return {recorder,stream,instances,result,states,errors,texts,saved,timers,events,released:()=>released};
}

test('leaving a recording section survives closed recorder and releases all microphone tracks',async()=>{
 const f=hardware({brokenStop:true});await f.recorder.start();
 const count=f.states.length;
 assert.doesNotThrow(()=>f.recorder.dispose());assert.doesNotThrow(()=>f.recorder.dispose());
 assert.equal(f.released(),2);assert.equal(f.states.length,count);
 assert.equal(f.recorder.busy,false);assert.equal(f.recorder.phase,'idle');assert.equal(f.timers.size,0);
 assert.equal(f.instances[0].onstop,null);
});

test('missing permission times out, unlocks the editor and releases a late microphone grant',async()=>{
 const permission=deferred(),f=hardware({permission});const start=f.recorder.start();
 const timeout=[...f.timers].find(([,ms])=>ms===20000)[0];timeout();
 assert.equal(f.states.at(-1),'idle');assert.match(f.errors[0],/ruxsat/);
 permission.resolve(f.stream);await start;
 assert.equal(f.released(),2);assert.equal(f.instances.length,0);assert.equal(f.timers.size,0);
 f.recorder.dispose();
});

test('unmount during permission does not update a departed editor or open its microphone',async()=>{
 const permission=deferred(),f=hardware({permission});const start=f.recorder.start();
 f.recorder.dispose();const count=f.states.length;
 permission.resolve(f.stream);await start;
 assert.equal(f.released(),2);assert.equal(f.states.length,count);assert.equal(f.instances.length,0);
});

test('late transcription after navigating away cannot update any next section',async()=>{
 const f=hardware();await f.recorder.start();f.recorder.stop();f.events.shift()();
 assert.equal(f.states.at(-1),'transcribing');f.recorder.dispose();const count=f.states.length;
 f.result.resolve({text:'late result',language:'uz'});await tick();
 assert.equal(f.texts.length,0);assert.equal(f.states.length,count);assert.equal(f.recorder.lastRecording,null);
});

test('a successful final recording reaches the editor once and unlocks it',async()=>{
 const f=hardware();await f.recorder.start();f.recorder.stop();f.recorder.stop();
 assert.equal(f.states.at(-1),'stopping');assert.equal(f.events.length,1);f.events.shift()();
 f.result.resolve({text:'Salom, dunyo.',language:'uz'});await tick();
 assert.deepEqual(f.texts,[{text:'Salom, dunyo.',language:'uz'}]);assert.equal(f.states.at(-1),'idle');
 assert.equal(await f.saved[0].blob.text(),'complete voice');f.recorder.dispose();
});

test('reader disposal releases its URL even when the detached player throws',()=>{
 const callbacks=[],revoked=[];const reader=new SpeechReader({fetchAudio:async()=>new Blob(),
  onState:v=>callbacks.push(v),revokeURL:url=>revoked.push(url)});
 reader.audio={pause(){throw new Error('Detached');},removeAttribute(){throw new Error('Detached');}};
 reader.url='blob:example';assert.doesNotThrow(()=>reader.dispose());assert.doesNotThrow(()=>reader.dispose());
 assert.deepEqual(revoked,['blob:example']);assert.deepEqual(callbacks,[]);
});

test('browser recognizer disposal detaches late events without updating the old editor',()=>{
 let native;const callbacks=[],timers=new Map();
 class Recognition{constructor(){native=this;}start(){}abort(){throw new Error('Already closed');}}
 const browser=new BrowserDictation({Recognition,onState:x=>callbacks.push(x),onInterim:x=>callbacks.push(x),
  onText:x=>callbacks.push(x),setTimer:fn=>{timers.set(fn,true);return fn;},clearTimer:fn=>timers.delete(fn)});
 browser.start('ru');const late=native.onresult,count=callbacks.length;browser.dispose();
 assert.equal(callbacks.length,count);assert.equal(native.onresult,null);assert.equal(timers.size,0);
 assert.doesNotThrow(()=>late({resultIndex:0,results:[]}));assert.equal(callbacks.length,count);
});
