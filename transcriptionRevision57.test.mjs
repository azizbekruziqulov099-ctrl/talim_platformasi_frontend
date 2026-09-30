import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {AudioDictation} from './admin/audioDictation.js';
import {audioFileBlob,transcribeRecording} from './admin/transcriptionClient.js';

const tick=()=>new Promise(resolve=>setImmediate(resolve));
function microphone(transcribe=async()=>({text:'Salom.',language:'uz'})) {
 const states=[],errors=[],texts=[],saved=[],events=[],instances=[];let stopped=false;
 class Recorder {
  static isTypeSupported(){return true;}
  constructor(){this.state='inactive';this.mimeType='audio/webm';instances.push(this);}
  start(){this.state='recording';}
  stop(){this.state='inactive';events.push(()=>{this.ondataavailable?.({data:new Blob(['last-frame'])});this.onstop?.();});}
 }
 const recorder=new AudioDictation({Recorder,mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){stopped=true;}}]})},
  transcribe,onState:s=>states.push(s),onError:s=>errors.push(s),onText:s=>texts.push(s),onRecording:s=>saved.push(s)});
 return {recorder,states,errors,texts,saved,events,instances,isStopped:()=>stopped};
}
test('double stop waits for the queued final audio event and sends one complete recording',async()=>{
 const uploaded=[];const f=microphone(async blob=>{uploaded.push(await blob.text());assert.equal(f.isStopped(),true);return {text:'Salom.'};});
 await f.recorder.start();f.instances[0].ondataavailable({data:new Blob(['first-frame/'])});
 f.recorder.stop();f.recorder.stop();f.events.shift()();await tick();
 assert.deepEqual(uploaded,['first-frame/last-frame']);assert.equal(f.texts.length,1);
 assert.equal(await f.saved.at(-1).blob.text(),'first-frame/last-frame');f.recorder.dispose();
});
test('failed transcription keeps bytes for replay, download and a retry',async()=>{
 let attempt=0;const uploads=[];
 const f=microphone(async(blob,_signal,language)=>{uploads.push([await blob.text(),language]);if(!attempt++)throw new Error('STT_LIMIT');return {text:'Привет.',language:'ru'};});
 await f.recorder.start({language:'ru'});f.recorder.stop();f.events.shift()();await tick();
 assert.equal(f.states.at(-1),'idle');assert.equal(f.errors[0],'STT_LIMIT');assert.equal(f.texts.length,0);
 await f.recorder.retry();assert.deepEqual(uploads,[['last-frame','ru'],['last-frame','ru']]);assert.equal(f.texts[0].text,'Привет.');
 const savedEvents=f.saved.length;f.recorder.dispose();assert.equal(f.recorder.lastRecording,null);assert.equal(f.saved.length,savedEvents);
});
test('cancelled upload retains recording and cannot append a delayed transcript',async()=>{
 let resolve,signal;const f=microphone((_blob,current)=>{signal=current;return new Promise(done=>{resolve=done;});});
 await f.recorder.start();f.recorder.stop();f.events.shift()();f.recorder.cancel();
 assert.equal(signal.aborted,true);assert.ok(f.recorder.lastRecording);resolve({text:'late'});await tick();
 assert.equal(f.texts.length,0);f.recorder.dispose();
});
test('double retry cannot upload the same recording simultaneously',async()=>{
 let resolve,count=0;const f=microphone(()=>{count++;return new Promise(done=>{resolve=done;});});
 f.recorder.selectFile(new File(['voice'],'audio.m4a',{type:''}),{language:'ru'});
 const pending=f.recorder.retry();await f.recorder.retry();assert.equal(count,1);
 resolve({text:'Привет.'});await pending;assert.equal(f.texts.length,1);f.recorder.dispose();
});
test('empty or malformed success cannot silently leave the output blank',async()=>{
 for(const result of [{},{text:''},{text:'   '},null]) {
  const f=microphone(async()=>result);f.recorder.selectFile(new File(['voice'],'a.wav'));
  await f.recorder.retry();assert.equal(f.errors.length,1);assert.equal(f.texts.length,0);assert.ok(f.recorder.lastRecording);f.recorder.dispose();
 }
});
test('uploaded audio accepts missing browser MIME and bounds size/type',()=>{
 const blob=audioFileBlob(new File(['voice'],'record.M4A',{type:''}));assert.equal(blob.type,'audio/x-m4a');
 assert.throws(()=>audioFileBlob(new File([],'empty.wav')),/bo‘sh/);
 assert.throws(()=>audioFileBlob(new File(['text'],'a.txt',{type:'text/plain'})),/MP3/);
 assert.throws(()=>audioFileBlob({size:8*1024*1024+1,name:'large.mp3'}),/8 MB/);
});
test('real HTTP upload preserves binary data and language, surfaces provider errors and retries',async()=>{
 const calls=[];let fail=true;
 const server=http.createServer(async(req,res)=>{
  const pieces=[];for await(const data of req)pieces.push(data);
  calls.push({url:new URL(req.url,'http://localhost'),type:req.headers['content-type'],body:Buffer.concat(pieces)});
  res.writeHead(fail?503:200,{'Content-Type':'application/json'});
  res.end(JSON.stringify(fail?{detail:'STT_PROVIDER_KEY: Groq kaliti qabul qilinmadi.'}:{text:'Привет, мир.',language:'russian'}));
 });
 server.listen(0,'127.0.0.1');await once(server,'listening');
 try {
  const apiBase=`http://127.0.0.1:${server.address().port}`;
  const f=microphone((blob,signal,language)=>transcribeRecording({apiBase,token:'test-admin',blob,signal,language}));
  f.recorder.selectFile(new File([new Uint8Array([0,1,2,250,255])],'voice.mp3'),{language:'ru'});
  await f.recorder.retry();assert.match(f.errors[0],/STT_PROVIDER_KEY/);assert.ok(f.recorder.lastRecording);
  fail=false;await f.recorder.retry();assert.equal(f.texts[0].text,'Привет, мир.');
  assert.equal(calls.length,2);assert.deepEqual(calls[0].body,calls[1].body);
  assert.equal(calls[1].body.toString('hex'),'000102faff');assert.equal(calls[1].type,'audio/mpeg');
  assert.equal(calls[1].url.searchParams.get('language'),'ru');assert.equal(calls[1].url.searchParams.get('token'),'test-admin');f.recorder.dispose();
 } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
test('HTML 200 response and empty transcript are reported as errors',async()=>{
 for(const response of [
  {ok:true,json:async()=>{throw new SyntaxError('HTML');}},
  {ok:true,json:async()=>({text:''})},
  {ok:false,status:413,json:async()=>{throw new SyntaxError('HTML');}},
 ])await assert.rejects(transcribeRecording({apiBase:'https://test',token:'x',blob:new Blob(['voice']),fetchImpl:async()=>response}));
});
test('a hanging request times out and a parent cancellation remains an AbortError',async()=>{
 let timeout;
 const fetchImpl=async(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true}));
 const promise=transcribeRecording({apiBase:'https://test',token:'x',blob:new Blob(['voice']),fetchImpl,setTimer:fn=>{timeout=fn;return fn;},clearTimer:()=>{}});
 timeout();await assert.rejects(promise,/STT_TIMEOUT/);
 const controller=new AbortController();controller.abort();
 await assert.rejects(transcribeRecording({apiBase:'https://test',token:'x',blob:new Blob(['voice']),signal:controller.signal,fetchImpl}),{name:'AbortError'});
});
