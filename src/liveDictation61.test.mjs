import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {LiveDictation,speechWav} from './admin/liveDictation.js';
import {transcribeRecording} from './admin/transcriptionClient.js';
import {dictationSupport} from './admin/browserDictation.js';

const tick=()=>new Promise(resolve=>setImmediate(resolve));
function deferred(){let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};}
function fixture({transcribe,permission,resume}={}) {
 const states=[],errors=[],texts=[],saved=[],activity=[],contexts=[],timers=new Map(),events={};let released=0;
 const node=()=>({connect(){},disconnect(){this.disconnected=true;}});
 const stream={getTracks:()=>[{stop(){released++;},addEventListener:(name,fn)=>{events[name]=fn;}}]};
 class Context {
  constructor(){this.sampleRate=48000;this.destination={};contexts.push(this);this.closed=0;}
  resume(){this.resumed=true;return resume?.promise;}
  close(){this.closed++;return Promise.resolve();}
  createMediaStreamSource(){return node();}
  createScriptProcessor(){return this.processor=node();}
  createGain(){return {...node(),gain:{value:1}};}
 }
 const mediaDevices={getUserMedia:()=>permission?.promise||Promise.resolve(stream)};
 const live=new LiveDictation({AudioContext:Context,mediaDevices,transcribe:transcribe|| (async()=>({text:'Salom.',language:'uz'})),
  onState:s=>states.push(s),onText:t=>texts.push(t),onError:e=>errors.push(e),onRecording:r=>saved.push(r),onActivity:a=>activity.push(a),
  setTimer:(fn,ms)=>{timers.set(fn,ms);return fn;},clearTimer:fn=>timers.delete(fn)});
 const samples=(seconds,value=0.25)=>contexts.at(-1).processor.onaudioprocess?.({inputBuffer:{getChannelData:()=>new Float32Array(Math.round(seconds*48000)).fill(value)}});
 return {live,states,errors,texts,saved,activity,contexts,timers,stream,events,Context,mediaDevices,samples,released:()=>released};
}
test('PCM produces a complete mono WAV with correct length, resampling and clipping',async()=>{
 const blob=speechWav([new Float32Array([2,2,2,-2,-2,-2,0.5,0.5,0.5])],48000);
 const view=new DataView(await blob.arrayBuffer()),bytes=new Uint8Array(view.buffer);
 assert.equal(new TextDecoder().decode(bytes.slice(0,4)),'RIFF');assert.equal(new TextDecoder().decode(bytes.slice(8,12)),'WAVE');
 assert.equal(view.getUint32(24,true),16000);assert.equal(view.getUint16(22,true),1);assert.equal(view.getUint32(40,true),6);
 assert.equal(view.getInt16(44,true),32767);assert.equal(view.getInt16(46,true),-32768);assert.equal(view.getInt16(48,true),16383);
 assert.equal(blob.size,50);assert.equal(blob.type,'audio/wav');
});
test('phone can dictate without SpeechRecognition or MediaRecorder',()=>{
 const f=fixture();const support=dictationSupport({dictation_available:true},{AudioContext:f.Context,navigator:{mediaDevices:f.mediaDevices},isSecureContext:true});
 assert.equal(support.live,true);assert.equal(support.recording,false);assert.equal(support.browser,false);assert.equal(support.reason,'');
});
test('permission cancellation closes the context and releases a late microphone grant',async()=>{
 const permission=deferred(),f=fixture({permission});const start=f.live.start();
 assert.equal(f.contexts[0].resumed,true);f.live.cancel();permission.resolve(f.stream);await start;
 assert.equal(f.released(),1);assert.equal(f.contexts[0].closed,1);assert.equal(f.states.at(-1),'idle');assert.equal(f.timers.size,0);
 assert.equal(f.texts.length,0);
});
test('no audio frames is an error, not a false recording indicator',async()=>{
 const f=fixture();await f.live.start();assert.equal(f.states.at(-1),'starting');
 [...f.timers].find(([,ms])=>ms===12000)[0]();
 assert.equal(f.states.at(-1),'idle');assert.ok(f.errors[0]);assert.equal(f.released(),1);assert.equal(f.contexts[0].closed,1);
});
test('text appears during capture; final stop releases microphone before queued HTTP work',async()=>{
 const pending=[],uploads=[];const f=fixture({transcribe:(blob,signal,language)=>{const task=deferred();pending.push(task);uploads.push({blob,signal,language});return task.promise;}});
 await f.live.start({language:'ru'});f.samples(12);assert.equal(uploads.length,1);assert.equal(f.states.at(-1),'recording');
 pending[0].resolve({text:'Первое предложение.',language:'russian'});await tick();
 assert.equal(f.texts[0].text,'Первое предложение.');assert.equal(f.states.at(-1),'recording');
 f.samples(3);f.live.stop();f.live.stop();assert.equal(f.released(),1);assert.equal(f.contexts[0].closed,1);
 assert.equal(uploads.length,2);assert.equal(f.states.at(-1),'transcribing');
 assert.equal(f.saved.length,1);assert.equal(f.saved[0].blob.size,44+15*16000*2);
 pending[1].resolve({text:'Второе предложение.',language:'russian'});await tick();
 assert.equal(f.texts.at(-1).text,'Первое предложение. Второе предложение.');assert.equal(f.states.at(-1),'idle');
 assert.deepEqual(uploads.map(u=>u.language),['ru','ru']);assert.equal(f.errors.length,0);assert.equal(f.timers.size,0);
});
test('a pause after a sentence delivers text without waiting twelve seconds',async()=>{
 const uploads=[],f=fixture({transcribe:async blob=>{uploads.push(blob);return {text:'Sentence.'};}});
 await f.live.start();f.samples(4);f.samples(0.8,0);await tick();
 assert.equal(uploads.length,1);assert.equal(f.texts[0].text,'Sentence.');f.live.cancel();
});
test('slow server bounds audio backlog and automatically releases microphone',async()=>{
 const request=deferred(),f=fixture({transcribe:()=>request.promise});await f.live.start();
 for(let i=0;i<4;i++)f.samples(12);
 assert.equal(f.released(),1);assert.equal(f.states.at(-1),'transcribing');assert.equal(f.saved.length,1);
 assert.equal(f.live.session.queue.length,3);f.live.cancel();request.resolve({text:'late'});await tick();assert.equal(f.texts.length,0);
});
test('provider error releases capture and keeps the entire WAV for retry',async()=>{
 const f=fixture({transcribe:async()=>{throw new Error('STT_PROVIDER_KEY');}});await f.live.start();f.samples(12);await tick();
 assert.equal(f.states.at(-1),'idle');assert.equal(f.released(),1);assert.equal(f.texts.length,0);
 assert.deepEqual(f.errors,['STT_PROVIDER_KEY']);assert.equal(f.saved[0].blob.size,44+12*16000*2);
});
test('cancel drops late text without cancelling a newer microphone session',async()=>{
 const old=deferred(),f=fixture({transcribe:()=>old.promise});await f.live.start();f.samples(12);f.live.cancel();
 await f.live.start();old.resolve({text:'old transcript'});await tick();assert.equal(f.texts.length,0);assert.equal(f.contexts[1].closed,0);
 f.samples(1);f.live.dispose();assert.equal(f.contexts[1].closed,1);assert.equal(f.released(),2);
});
test('device disconnect finalizes captured voice and silence is never sent as speech',async()=>{
 const f=fixture();await f.live.start();f.samples(2);f.events.ended();await tick();
 assert.equal(f.texts[0].text,'Salom.');assert.equal(f.states.at(-1),'idle');
 const quiet=fixture();await quiet.live.start();quiet.samples(12,0);quiet.live.stop();
 assert.equal(quiet.texts.length,0);assert.equal(quiet.states.at(-1),'idle');assert.match(quiet.errors[0],/eshitilmadi/);
});
test('real HTTP path receives independently decodable WAV requests and selected language',async()=>{
 const received=[];
 const server=http.createServer(async(req,res)=>{
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  const body=Buffer.concat(chunks),url=new URL(req.url,'http://localhost');
  received.push({body,type:req.headers['content-type'],language:url.searchParams.get('language')});
  res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({text:'Salom.',language:'uzbek'}));
 });
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const f=fixture({transcribe:(blob,signal,language)=>transcribeRecording({apiBase:`http://127.0.0.1:${server.address().port}`,token:'admin-fixture',blob,signal,language})});
 try{
  await f.live.start({language:'uz'});f.samples(1);f.live.stop();
  for(let i=0;i<100&&f.live.session;i++)await new Promise(resolve=>setTimeout(resolve,5));
  assert.equal(f.states.at(-1),'idle');assert.equal(f.texts[0].text,'Salom.');assert.equal(received.length,1);
  const r=received[0];assert.equal(r.type,'audio/wav');assert.equal(r.language,'uz');assert.equal(r.body.toString('ascii',0,4),'RIFF');
  assert.equal(r.body.readUInt32LE(40),r.body.length-44);assert.equal(r.body.readUInt32LE(24),16000);
 }finally{f.live.dispose();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
