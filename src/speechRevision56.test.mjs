import test from 'node:test';
import assert from 'node:assert/strict';
import {readingChunks} from './admin/speechText.js';
import {SpeechReader} from './admin/speechReader.js';
import {BrowserDictation,dictationSupport} from './admin/browserDictation.js';
import {AudioDictation} from './admin/audioDictation.js';

test('language tags survive paragraphs and long request boundaries without being spoken',()=>{
 for(const language of ['uz','ru','en']) {
  const content='12 + 8 = 20\n\n'+ '12 34 56 78. '.repeat(220);
  const original=`[${language}]${content}[/${language}]`;
  const chunks=readingChunks(original);
  assert.ok(chunks.length>2);
  assert.ok(chunks.every(chunk=>chunk.language===language&&chunk.text.length<=1200&&!chunk.text.includes('[')));
  assert.equal(chunks.map(chunk=>chunk.text).join(' '),content.trim().replace(/\s+/g,' '));
  assert.equal(chunks[0].pauseMs,450);
 }
});
test('chosen reading language applies to untagged content; explicit tags retain theirs',()=>{
 const chunks=readingChunks('Hello world! 123. [uz]Salom.[/uz] abc xyz.',1200,'ru');
 assert.deepEqual(chunks.map(chunk=>chunk.language),['ru','uz','ru']);
 assert.equal(chunks.map(chunk=>chunk.text).join(' '),'Hello world! 123. Salom. abc xyz.');
 assert.deepEqual(readingChunks(''),[]);
 assert.throws(()=>readingChunks('Matn',1200,'wrong'));
});
test('automatic reading still handles three languages in one untagged paragraph',()=>{
 assert.deepEqual(readingChunks('Salom. Hello world! Привет, мир.').map(chunk=>chunk.language),['uz','en','ru']);
});
test('consecutive sentences in one language are sent in bounded batches',()=>{
 const text='Hello world. '.repeat(200);
 const chunks=readingChunks(text);
 assert.ok(chunks.length>=2&&chunks.length<=4);
 assert.ok(chunks.every(chunk=>chunk.language==='en'&&chunk.text.length<=1200));
 assert.equal(chunks.map(chunk=>chunk.text).join(' '),text.trim());
});
test('reader sends each chunk language alongside its text and chosen gender',async()=>{
 const calls=[];
 const reader=new SpeechReader({fetchAudio:async(...args)=>{calls.push(args);return new Blob(['audio']);},
  createURL:()=> 'blob:test',revokeURL:()=>{},
  createAudio:()=>({play:async()=>{},pause(){},removeAttribute(){}})});
 reader.start(readingChunks('123',1200,'ru'),{voice:'ogil'});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(calls[0][0],'123');assert.equal(calls[0][1],'ogil');assert.equal(calls[0][3],'ru');
 reader.dispose();assert.equal(calls[0][2].aborted,true);
});

function browserFixture() {
 const instances=[],states=[],texts=[],errors=[],interim=[],timers=new Set();
 class Recognition {
  constructor(){instances.push(this);this.aborts=0;}
  start(){}
  stop(){this.stopped=true;}
  abort(){this.aborts++;}
 }
 const browser=new BrowserDictation({Recognition,onState:s=>states.push(s),onText:s=>texts.push(s),onError:s=>errors.push(s),onInterim:s=>interim.push(s),
  setTimer:fn=>{timers.add(fn);return fn;},clearTimer:fn=>timers.delete(fn)});
 return {browser,instances,states,texts,errors,interim,timers};
}
test('browser dictation uses the selected language and ignores the computer language',()=>{
 const f=browserFixture();
 for(const [language,locale] of [['uz','uz-UZ'],['ru','ru-RU'],['en','en-US']]) {
  f.browser.start(language);assert.equal(f.instances.at(-1).lang,locale);f.instances.at(-1).onstart();
  assert.equal(f.states.at(-1),'listening');f.browser.cancel();
 }
 assert.equal(f.timers.size,0);
});
test('recognition error without onend unlocks the editor and permits another start',()=>{
 const f=browserFixture();f.browser.start('ru');const old=f.instances[0];
 const staleEnd=old.onend;old.onerror({error:'network'});
 assert.equal(f.states.at(-1),'idle');assert.equal(f.browser.session,null);assert.equal(f.errors.length,1);
 f.browser.start('uz');staleEnd();
 assert.equal(f.instances.length,2);assert.equal(f.browser.session.recognizer,f.instances[1]);f.browser.cancel();
});
test('cancel during microphone startup removes callbacks and cannot lock the next session',()=>{
 const f=browserFixture();f.browser.start('en');const staleStart=f.instances[0].onstart;
 f.browser.cancel();staleStart();assert.equal(f.states.at(-1),'idle');assert.equal(f.timers.size,0);
 f.browser.start('ru');assert.equal(f.instances.length,2);f.browser.cancel();
});
test('missing microphone startup and missing stop event have bounded recovery',()=>{
 const f=browserFixture();f.browser.start('uz');[...f.timers][0]();
 assert.equal(f.states.at(-1),'idle');assert.equal(f.errors.length,1);
 f.browser.start('uz');f.instances.at(-1).onstart();f.browser.stop();[...f.timers][0]();
 assert.equal(f.states.at(-1),'idle');assert.equal(f.browser.session,null);
});
test('final dictation results append once and late callbacks cannot change another session',()=>{
 const f=browserFixture();f.browser.start('ru');const rec=f.instances[0];
 const result={0:{transcript:'Привет.'},isFinal:true};
 const event={resultIndex:0,results:[result]};rec.onresult(event);rec.onresult(event);
 assert.deepEqual(f.texts,[{text:'Привет.',language:'ru'}]);
 const staleResult=rec.onresult;f.browser.cancel();f.browser.start('en');staleResult(event);
 assert.equal(f.texts.length,1);f.browser.cancel();
});
test('insecure and unsupported microphone modes have actionable reasons',()=>{
 const devices={MediaRecorder:class{},navigator:{mediaDevices:{getUserMedia(){}}},SpeechRecognition:class{}};
 assert.equal(dictationSupport({dictation_available:true},devices).recording,true);
 assert.equal(dictationSupport({},devices).browser,true);
 assert.match(dictationSupport({dictation_available:true},{...devices,isSecureContext:false}).reason,/HTTPS/);
 assert.match(dictationSupport({},{}).reason,/ulanmagan/);
});
test('audio transcription receives selected language and stops microphone before upload',async()=>{
 let recorded,stopped=false;
 class Recorder {
  static isTypeSupported(){return true;}
  constructor(){recorded=this;this.mimeType='audio/webm';this.state='inactive';}
  start(){this.state='recording';}
  stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['audio'])});this.onstop?.();}
 }
 const calls=[];
 const recorder=new AudioDictation({Recorder,mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){stopped=true;}}]})},
  onState:()=>{},onText:()=>{},onError:error=>assert.fail(error),
  transcribe:async(blob,signal,language)=>{assert.equal(stopped,true);calls.push(language);return {text:'Привет.'};}});
 await recorder.start({language:'ru'});recorder.stop();await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(calls,['ru']);assert.equal(recorder.busy,false);assert.equal(recorded.state,'inactive');
});
test('stopping while microphone permission is pending allows retry and releases a late stream',async()=>{
 let resolve,stopped=false;const states=[];
 const recorder=new AudioDictation({mediaDevices:{getUserMedia:()=>new Promise(done=>{resolve=done;})},Recorder:class{},
  onState:s=>states.push(s),onText:()=>{},onError:error=>assert.fail(error)});
 const pending=recorder.start();recorder.stop();assert.equal(recorder.busy,false);assert.equal(states.at(-1),'idle');
 resolve({getTracks:()=>[{stop(){stopped=true;}}]});await pending;
 assert.equal(stopped,true);assert.equal(states.at(-1),'idle');
});
