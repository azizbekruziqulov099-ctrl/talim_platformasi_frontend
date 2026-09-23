import test from 'node:test';
import assert from 'node:assert/strict';
import {BrowserDictation,browserDictationSupport} from './admin/browserDictation.js';
import {transcribeRecording,dictationFallbackMessage} from './admin/transcriptionClient.js';
import {readingChunks} from './admin/speechText.js';
import {splitSpeechText} from './speech/language.js';

function fixture(){
 const natives=[],states=[],texts=[],errors=[],interims=[],timers=new Map();
 class Recognition{constructor(){natives.push(this);}start(){}stop(){this.stopped=true;}abort(){this.aborted=true;}}
 const browser=new BrowserDictation({Recognition,onState:s=>states.push(s),onText:t=>texts.push(t),onError:e=>errors.push(e),onInterim:t=>interims.push(t),
  setTimer:(f,ms)=>{timers.set(f,ms);return f;},clearTimer:f=>timers.delete(f)});
 const emit=(text,final=true)=>natives.at(-1).onresult({results:[{0:{transcript:text},isFinal:final}]});
 const run=ms=>{const fn=[...timers].find(([,delay])=>delay===ms)?.[0];assert.ok(fn,`Missing ${ms}ms timer`);timers.delete(fn);fn();};
 return {browser,natives,states,texts,errors,interims,timers,emit,run};
}
test('phone results without onstart unlock the controls and keep draft text on stop',()=>{
 const f=fixture();f.browser.start('uz');f.emit('salom dunyo',false);
 assert.equal(f.states.at(-1),'listening');assert.equal(f.interims.at(-1),'salom dunyo');
 f.browser.stop();f.run(2000);assert.equal(f.texts[0].text,'salom dunyo');assert.equal(f.states.at(-1),'idle');
});
test('successful mobile recognition restarts after a phrase without losing or duplicating words',()=>{
 const f=fixture();f.browser.start('ru');f.emit('Первое предложение.');
 const late=f.natives[0].onresult;f.natives[0].onend();f.run(250);
 assert.equal(f.natives.length,2);assert.equal(f.natives[1].lang,'ru-RU');
 late({results:[{0:{transcript:'stale'},isFinal:true}]});f.emit('Второе предложение.');
 f.browser.stop();f.natives[1].onend();
 assert.deepEqual(f.texts.map(t=>t.text),['Первое предложение.','Второе предложение.']);assert.equal(f.timers.size,0);
});
test('stop during permission or between phrases cannot restart a cancelled microphone',()=>{
 for(const between of [false,true]){
  const f=fixture();f.browser.start('en');
  if(between){f.emit('Hello.');f.natives[0].onend();}
  const stale=[...f.timers.keys()];f.browser.stop();for(const callback of stale)callback();
  assert.equal(f.states.at(-1),'idle');assert.equal(f.natives.length,1);assert.equal(f.timers.size,0);
 }
});
test('silence and permission errors cannot cause an automatic restart loop',()=>{
 for(const code of ['no-speech','network','not-allowed']){
  const f=fixture();f.browser.start('uz');f.emit('Dastlabki matn',false);f.natives[0].onerror({error:code});
  assert.equal(f.natives.length,1);assert.equal(f.timers.size,0);assert.equal(f.states.at(-1),'idle');
  assert.equal(f.texts[0].text,'Dastlabki matn');assert.equal(f.errors.length,1);
 }
});
test('browser availability never needs MediaRecorder, Web Audio, a key or a backend response',()=>{
 assert.deepEqual(browserDictationSupport({webkitSpeechRecognition:class{}}),{browser:true,reason:''});
 assert.equal(browserDictationSupport({isSecureContext:false,SpeechRecognition:class{}}).browser,false);
 assert.match(browserDictationSupport({}).reason,/Chrome/);
});
test('all HTTP 429 shapes select browser fallback but authentication and bad audio do not',async()=>{
 for(const payload of [null,{detail:'Provider rate exceeded'},{detail:'STT_LIMIT: Daily quota'}]){
  let caught;try{await transcribeRecording({apiBase:'https://fixture',token:'admin',blob:new Blob(['audio']),
   fetchImpl:async()=>({status:429,ok:false,json:async()=>{if(payload===null)throw Error('HTML');return payload;}})});}catch(error){caught=error;}
  assert.match(dictationFallbackMessage(caught),/limiti tugadi/);
 }
 for(const message of ['STT_AUDIO_REJECTED: bad','STT_NO_SPEECH: silence','Kirish muddati tugagan.','Ovozni matnga aylantirishga ruxsat yo‘q.'])
  assert.equal(dictationFallbackMessage(message),'');
});
test('multiline formulas inherit explicit language and remain whole at reading request boundaries',()=>{
 const formula=String.raw`[lat]\frac{x^{2}+1}{\sqrt{a+\frac{1}{2}}}
+ \sin(x)[/lat]`;
 for(const language of ['uz','ru','en']){
  const chunks=readingChunks(`[${language}]${'Matn. '.repeat(12)}${formula}${' Matn.'.repeat(12)}[/${language}]`,100);
  assert.ok(chunks.every(c=>c.language===language&&c.text.length<=100));
  assert.equal(chunks.filter(c=>c.text.includes('[lat]')).length,1);
  assert.ok(chunks.find(c=>c.text.includes('[lat]')).text.includes(formula));
  assert.ok(!chunks.some(c=>c.text.includes('undefined')));
 }
});
test('automatic sentence detection does not split a multiline formula or switch its language',()=>{
 const formula=String.raw`[lat]\frac{1}{2}
+ x^2[/lat]`;
 const result=splitSpeechText(`Найдите значение. ${formula}`);
 assert.equal(result.at(-1).til,'ru');assert.equal(result.at(-1).matn,formula);
});
test('one oversized formula reports a readable error instead of sending broken LaTeX',()=>{
 assert.throws(()=>readingChunks(`[ru][lat]${'x+'.repeat(70)}1[/lat][/ru]`,100),/formula juda uzun/);
});
