import test from 'node:test';
import assert from 'node:assert/strict';
import {readingChunks,formatDictation,appendDictation} from './admin/speechText.js';
import {SpeechReader} from './admin/speechReader.js';

test('long reading includes every word, punctuation and the final paragraph',()=>{
 const text=('Birinchi gap, ikkinchi qism. Keyingi gap! '.repeat(150))+'\n\nOxirgi abzas tugadi.';
 const chunks=readingChunks(text);
 assert.ok(chunks.length>2);assert.ok(chunks.every(chunk=>chunk.text.length<=1200));
 assert.equal(chunks.map(chunk=>chunk.text).join(' ').replace(/\s+/g,' '),text.replace(/\s+/g,' '));
 assert.equal(chunks.at(-1).text,'Oxirgi abzas tugadi.');assert.equal(chunks.at(-2).pauseMs,450);
});
test('a long word is split without losing characters',()=>{
 const word='a'.repeat(4000);assert.equal(readingChunks(word).map(chunk=>chunk.text).join(''),word);
});
test('spoken punctuation and paragraph commands produce editable Uzbek text',()=>{
 assert.equal(appendDictation('',"salom vergul dunyo nuqta yangi abzas bugun dars bor undov belgisi"),'Salom, dunyo.\n\nBugun dars bor!');
 assert.equal(formatDictation('bir nuqta vergul ikki ikki nuqta uch'),'bir; ikki: uch');
});
test('dictation appends without losing earlier content or paragraph commands',()=>{
 let value=appendDictation('Oldingi matn.','yangi abzas');
 value=appendDictation(value,'yangi gap so‘roq belgisi');
 assert.equal(value,'Oldingi matn.\n\nYangi gap?');
});
test('literal mode retains punctuation words and Uzbek apostrophes normalize',()=>{
 assert.equal(formatDictation('nuqta vergul',false),'nuqta vergul');
 assert.equal(appendDictation('',"o'zbekcha g'oya"),'O‘zbekcha g‘oya');
});

const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(fetchAudio=async()=>new Blob(['mp3'])) {
 const states=[],errors=[],created=[],revoked=[],queue=[];
 const reader=new SpeechReader({fetchAudio,onState:s=>states.push(s),onError:e=>errors.push(e),
  createURL:()=>`blob:${created.length}`,revokeURL:url=>revoked.push(url),
  setTimer:fn=>{queue.push(fn);return fn;},clearTimer:fn=>{const i=queue.indexOf(fn);if(i>=0)queue.splice(i,1);},
  createAudio:()=>{const audio={paused:true,playbackRate:1,play:async()=>{audio.paused=false;},pause:()=>{audio.paused=true;},removeAttribute:()=>{}};created.push(audio);return audio;}});
 return {reader,states,errors,created,revoked,queue};
}
test('reader plays chunks in order and releases every audio URL',async()=>{
 const sent=[];const s=setup(async text=>{sent.push(text);return new Blob(['audio']);});
 s.reader.start([{text:'First.',pauseMs:450},{text:'Second.',pauseMs:450}]);await tick();
 s.created[0].onended();s.queue.shift()();await tick();s.created[1].onended();
 assert.deepEqual(sent,['First.','Second.']);assert.equal(s.states.at(-1),'idle');assert.equal(s.revoked.length,2);
});
test('stop cancels a pending response so it cannot play later',async()=>{
 let resolve;const s=setup(()=>new Promise(r=>{resolve=r;}));
 s.reader.start([{text:'First.',pauseMs:0}]);s.reader.stop();resolve(new Blob(['audio']));await tick();
 assert.equal(s.created.length,0);assert.equal(s.states.at(-1),'idle');
});
test('pause during loading stays paused until resume, speed updates playback',async()=>{
 let resolve;const s=setup(()=>new Promise(r=>{resolve=r;}));
 s.reader.start([{text:'First.',pauseMs:0}]);s.reader.pause();resolve(new Blob(['audio']));await tick();
 assert.equal(s.created[0].paused,true);assert.equal(s.states.at(-1),'paused');
 s.reader.setRate(1.75);s.reader.resume();await tick();assert.equal(s.created[0].playbackRate,1.75);assert.equal(s.created[0].paused,false);
 s.reader.dispose();assert.equal(s.created[0].paused,true);assert.equal(s.revoked.length,1);
});
test('pause between paragraphs does not replay or skip a chunk',async()=>{
 const sent=[];const s=setup(async text=>{sent.push(text);return new Blob(['audio']);});
 s.reader.start([{text:'First.',pauseMs:450},{text:'Second.',pauseMs:450}]);await tick();s.created[0].onended();
 s.reader.pause();assert.equal(s.queue.length,0);s.reader.resume();await tick();assert.deepEqual(sent,['First.','Second.']);s.reader.dispose();
});
test('network errors are visible and never reported as successful playback',async()=>{
 const s=setup(async()=>{throw new Error('Xizmat mavjud emas');});s.reader.start([{text:'First.',pauseMs:0}]);await tick();
 assert.deepEqual(s.errors,['Xizmat mavjud emas']);assert.equal(s.states.at(-1),'idle');assert.equal(s.created.length,0);
});
