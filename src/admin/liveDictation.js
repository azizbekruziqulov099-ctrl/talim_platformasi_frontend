import {LiveRecorder} from './liveRecorder.js';

// Prefer the native recorder: it works without an AudioContext audio callback.
// PCM remains a fallback for browsers without MediaRecorder.
// Capture PCM rather than waiting for a device-specific MediaRecorder stop
// event. Each request is a complete WAV; container fragments are never sent.
export function speechWav(parts,sampleRate) {
 const length=parts.reduce((sum,part)=>sum+part.length,0);
 const source=new Float32Array(length);let offset=0;
 for(const part of parts){source.set(part,offset);offset+=part.length;}
 const rate=Math.min(16000,sampleRate),count=Math.floor(length*rate/sampleRate);
 const buffer=new ArrayBuffer(44+count*2),view=new DataView(buffer);
 const word=(position,value)=>{for(let i=0;i<value.length;i++)view.setUint8(position+i,value.charCodeAt(i));};
 word(0,'RIFF');view.setUint32(4,36+count*2,true);word(8,'WAVE');word(12,'fmt ');
 view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
 view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
 word(36,'data');view.setUint32(40,count*2,true);
 for(let i=0;i<count;i++){
  const start=Math.floor(i*sampleRate/rate),end=Math.min(length,Math.floor((i+1)*sampleRate/rate));
  let total=0;for(let j=start;j<end;j++)total+=source[j];
  const value=Math.max(-1,Math.min(1,total/Math.max(1,end-start)));
  view.setInt16(44+i*2,value<0?value*32768:value*32767,true);
 }
 return new Blob([buffer],{type:'audio/wav'});
}

function stopStream(stream){try{for(const track of stream?.getTracks()||[])try{track.stop();}catch{}}catch{}}

export class LiveDictation {
 constructor({transcribe,onText=()=>{},onState=()=>{},onError=()=>{},onRecording=()=>{},onActivity=()=>{},
  mediaDevices=globalThis.navigator?.mediaDevices,AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext,
  setTimer=setTimeout,clearTimer=clearTimeout,Recorder=globalThis.MediaRecorder,now}={}) {
  if(Recorder)return new LiveRecorder({transcribe,onText,onState,onError,onRecording,onActivity,mediaDevices,Recorder,setTimer,clearTimer,now});
  Object.assign(this,{transcribe,onText,onState,onError,onRecording,onActivity,mediaDevices,AudioContext,setTimer,clearTimer});
  this.session=null;this.phase='idle';
 }
 state(value){this.phase=value;this.onState(value);}
 async start({language='uz'}={}) {
  if(this.session)return;
  const session={language,parts:[],segment:[],frames:0,segmentFrames:0,silence:0,peak:0,queue:[],texts:[],capture:true,
   submitting:false,started:false,saved:false,controller:new AbortController(),stream:null,context:null};
  this.session=session;this.state('starting');this.onActivity({seconds:0,level:0,pending:false});
  session.timer=this.setTimer(()=>{
   if(this.session===session)this.fail(session,'Mikrofondan ovoz kelmadi. Mikrofon ruxsatini tekshiring yoki ovoz yozib yuborish usulini tanlang.');
  },20000);
  try {
   // Must happen in the original button gesture, before awaiting permission
   // (especially Safari). Failures are reported; they cannot lock the editor.
   const context=new this.AudioContext();session.context=context;
   const resumeContext=async()=>{
    try{await context.resume?.();}
    catch{if(this.session===session)this.fail(session,'STT_CAPTURE_STALLED: Mikrofon ovozini ochib bo‘lmadi.');}
   };
   void resumeContext();
   if(this.session!==session)return;
   const stream=await this.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true}});
   if(this.session!==session){stopStream(stream);return;}
   session.stream=stream;
   session.rate=context.sampleRate;
   if(!Number.isFinite(session.rate)||session.rate<8000)throw new Error('sample rate');
   const source=session.source=context.createMediaStreamSource(stream);
   const processor=session.processor=context.createScriptProcessor(4096,1,1);
   const gain=session.gain=context.createGain();gain.gain.value=0;
   processor.onaudioprocess=event=>{
    if(this.session!==session||!session.capture)return;
    try{this.samples(session,new Float32Array(event.inputBuffer.getChannelData(0)));}
    catch{this.fail(session,'Mikrofon ovozini yozib bo‘lmadi. Ovoz yozib yuborish usulini tanlang.');}
   };
   source.connect(processor);processor.connect(gain);gain.connect(context.destination);
   // Some browsers suspend Web Audio while their permission dialog is open.
   // Resume again after permission/graph setup; don't wait forever for the
   // very first ScriptProcessor callback (the previous 0-second screen).
   if(context.state==='suspended'||context.state==='interrupted')void resumeContext();
   if(this.session!==session)return;
   this.clearTimer(session.timer);
   session.timer=this.setTimer(()=>{
    if(this.session===session&&!session.started)this.fail(session,'STT_CAPTURE_STALLED: Mikrofon ochildi, lekin yozuv boshlanmadi.');
   },12000);
   for(const track of stream.getTracks())track.addEventListener?.('ended',()=>{if(this.session===session)this.stop();},{once:true});
  }catch(error){
   if(this.session!==session)return;
   this.fail(session,session.stream?'STT_CAPTURE_STALLED: Mikrofon yozuvini ochib bo‘lmadi.'
    :error?.name==='NotAllowedError'?'Mikrofonga ruxsat berilmadi. Brauzerning sayt ruxsatlaridan mikrofonni yoqing.'
    :error?.name==='NotFoundError'?'Mikrofon topilmadi. Mikrofonni ulang.'
    :error?.name==='NotReadableError'?'Mikrofon boshqa dasturda band yoki qurilmada o‘chirilgan.'
    :'Mikrofonni ochib bo‘lmadi. Ovoz yozib yuborish usulini tanlang.');
  }
 }
 samples(session,part) {
  if(!part.length)return;
  this.clearTimer(session.framesTimer);
  session.framesTimer=this.setTimer(()=>{
   if(this.session===session&&session.capture)this.fail(session,'STT_CAPTURE_STALLED: Mikrofondan ovoz kelishi to‘xtadi.');
  },12000);
  if(!session.started){session.started=true;this.clearTimer(session.timer);this.state('recording');
   session.timer=this.setTimer(()=>{if(this.session===session)this.stop();},120000);}
  session.parts.push(part);session.segment.push(part);session.frames+=part.length;session.segmentFrames+=part.length;
  let peak=0;for(const value of part)peak=Math.max(peak,Math.abs(value));session.peak=Math.max(session.peak,peak);
  session.silence=peak<0.005?session.silence+part.length:0;
  this.onActivity({seconds:Math.floor(session.frames/session.rate),level:Math.min(1,peak*4),pending:session.submitting||session.queue.length>0});
  // Prefer a pause after a sentence; still deliver text during long speech.
  if(session.segmentFrames/session.rate>=12 || (session.segmentFrames/session.rate>=4&&session.silence/session.rate>=0.7))this.enqueue(session);
  if(session.frames/session.rate>=120 || session.queue.length>=3)this.stop();
 }
 enqueue(session) {
  if(!session.segmentFrames)return;
  // Ignore digital silence, not quiet speech. Never invent a transcript.
  if(session.peak>0.00001)session.queue.push(speechWav(session.segment,session.rate));
  session.segment=[];session.segmentFrames=0;session.silence=0;session.peak=0;
  void this.pump(session);
 }
 async pump(session) {
  if(this.session!==session||session.submitting)return;
  const blob=session.queue.shift();
  if(!blob){if(!session.capture)this.finish(session);return;}
  session.submitting=true;
  this.onActivity({seconds:Math.floor(session.frames/session.rate),level:0,pending:true});
  try {
   const result=await this.transcribe(blob,session.controller.signal,session.language);
   if(this.session!==session)return;
   if(typeof result?.text!=='string'||!result.text.trim())throw new Error('Ovoz xizmati matn qaytarmadi. Saqlangan ovozni qayta yuboring.');
   session.texts.push(result.text.trim());
   this.onText({text:session.texts.join(' '),language:result.language||session.language});
  }catch(error){
   if(this.session===session)this.fail(session,error?.message||'Ovoz matnga aylantirilmadi. Saqlangan ovozni qayta yuboring.');
   return;
  }
  session.submitting=false;
  this.onActivity({seconds:Math.floor(session.frames/session.rate),level:0,pending:session.queue.length>0});
  void this.pump(session);
 }
 release(session) {
  session.capture=false;this.clearTimer(session.timer);this.clearTimer(session.framesTimer);
  if(session.processor)session.processor.onaudioprocess=null;
  const stream=session.stream;session.stream=null;stopStream(stream);
  for(const node of [session.source,session.processor,session.gain])try{node?.disconnect();}catch{}
  try{Promise.resolve(session.context?.close()).catch(()=>{});}catch{}
  session.source=session.processor=session.gain=session.context=null;
 }
 remember(session) {
  if(session.saved||!session.frames)return;
  session.saved=true;this.onRecording({blob:speechWav(session.parts,session.rate),language:session.language});
 }
 stop() {
  const session=this.session;if(!session||!session.capture)return;
  this.release(session);this.remember(session);
  this.state('transcribing');this.enqueue(session);
  if(!session.submitting&&!session.queue.length)this.finish(session);
 }
 finish(session) {
  if(this.session!==session)return;
  this.release(session);this.remember(session);this.session=null;this.state('idle');
  this.onActivity({seconds:Math.floor(session.frames/(session.rate||1)),level:0,pending:false});
  if(!session.texts.length)this.onError('Ovoz eshitilmadi. Mikrofonni tekshiring yoki saqlangan yozuvni tinglang.');
 }
 fail(session,message) {
  if(this.session!==session)return;
  this.session=null;session.controller.abort();this.release(session);this.remember(session);
  this.state('idle');this.onActivity({seconds:Math.floor(session.frames/(session.rate||1)),level:0,pending:false});this.onError(message);
 }
 cancel() {
  const session=this.session;if(session){this.session=null;session.controller.abort();this.release(session);this.remember(session);}
  this.state('idle');this.onActivity({seconds:0,level:0,pending:false});
 }
 dispose(){this.onText=this.onState=this.onError=this.onRecording=this.onActivity=()=>{};this.cancel();}
}
