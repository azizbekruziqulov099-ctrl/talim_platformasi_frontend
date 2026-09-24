import {MAX_AUDIO_BYTES} from './transcriptionClient.js';

// Every upload is a FINISHED recording, including its container headers.
// A timeslice on its own is not necessarily a playable WebM/MP4 file.
export class LiveRecorder {
 constructor({transcribe,onText=()=>{},onState=()=>{},onError=()=>{},onRecording=()=>{},onActivity=()=>{},
  mediaDevices=globalThis.navigator?.mediaDevices,Recorder=globalThis.MediaRecorder,
  setTimer=setTimeout,clearTimer=clearTimeout,now=()=>performance.now()}={}) {
  Object.assign(this,{transcribe,onText,onState,onError,onRecording,onActivity,mediaDevices,Recorder,setTimer,clearTimer,now});
  this.session=null;this.phase='idle';
 }
 state(value){this.phase=value;this.onState(value);}
 timer(s,key,fn,ms){this.clearTimer(s[key]);s[key]=this.setTimer(()=>{s[key]=null;if(this.session===s)fn();},ms);}
 activity(s){this.onActivity({seconds:Math.floor(s.elapsed+(s.startedAt===null?0:(this.now()-s.startedAt)/1000)),
  level:null,pending:s.submitting||s.queue.length>0,quiet:Boolean(s.quiet)});}
 async start({language='uz'}={}) {
  if(this.session)return;
  const s={language,blobs:[],queue:[],texts:[],bytes:0,elapsed:0,startedAt:null,capture:true,submitting:false,
   stream:null,recorder:null,controller:new AbortController(),stopping:false};
  this.session=s;this.state('starting');this.activity(s);
  this.timer(s,'permissionTimer',()=>this.fail(s,'Mikrofon ruxsati kutilmoqda. Brauzerda mikrofonga ruxsat berib, qayta bosing.'),20000);
  try {
   const stream=await this.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true}});
   if(this.session!==s){this.releaseStream(stream);return;}
   s.stream=stream;this.clearTimer(s.permissionTimer);
   for(const track of stream.getTracks())track.addEventListener?.('ended',()=>{if(this.session===s&&s.capture)this.stop();},{once:true});
   this.open(s);
  }catch(error){if(this.session===s)this.fail(s,error?.name==='NotAllowedError'
   ?'Mikrofonga ruxsat berilmadi. Brauzerning sayt ruxsatlaridan mikrofonni yoqing.'
   :error?.name==='NotFoundError'?'Mikrofon topilmadi. Mikrofonni ulang.'
   :error?.name==='NotReadableError'?'Mikrofon boshqa dasturda band yoki qurilmada o‘chirilgan.'
   :'STT_CAPTURE_STALLED: Mikrofon yozuvini ochib bo‘lmadi.');}
 }
 open(s) {
  if(this.session!==s||!s.capture)return;
  try {
   const mimeType=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(type=>this.Recorder.isTypeSupported?.(type));
   const rec=new this.Recorder(s.stream,mimeType?{mimeType}:undefined);s.recorder=rec;s.stopping=false;
   const parts=[];let bytes=0;
   const current=()=>this.session===s&&s.recorder===rec;
   rec.onstart=()=>{
    if(!current()||!s.capture||s.stopping)return;
    this.clearTimer(s.startTimer);s.startedAt=this.now();this.state('recording');
    const beat=()=>{this.activity(s);if(s.capture)this.timer(s,'beatTimer',beat,1000);};beat();
    this.timer(s,'segmentTimer',()=>this.closeSegment(s),Math.min(8000,Math.max(100,120000-s.elapsed*1000)));
   };
   rec.ondataavailable=event=>{
    if(!current()||!event.data?.size)return;
    bytes+=event.data.size;
    if(s.bytes+bytes>MAX_AUDIO_BYTES){this.fail(s,'Yozuv juda katta. Qisqaroq gapirib yozing.');return;}
    parts.push(event.data);
   };
   rec.onstop=()=>{
    if(!current())return;
    this.endClock(s);this.clearTimer(s.stopTimer);this.clearTimer(s.startTimer);this.clearTimer(s.segmentTimer);
    this.detach(rec);s.recorder=null;s.stopping=false;
    const blob=new Blob(parts,{type:rec.mimeType||mimeType||'audio/webm'});
    if(!blob.size){this.fail(s,'STT_CAPTURE_STALLED: Mikrofon ochildi, lekin ovoz yozuvi olinmadi.');return;}
    s.bytes+=blob.size;s.blobs.push(blob);s.queue.push(blob);
    if(s.elapsed>=120||s.queue.length>=3){s.capture=false;this.releaseStream(s.stream);s.stream=null;}
    // Retain the microphone between segments, without waiting for the server.
    if(s.capture)this.open(s);else{this.state('transcribing');this.remember(s);}
    void this.pump(s);
   };
   rec.onerror=()=>{if(current())this.fail(s,'STT_CAPTURE_STALLED: Mikrofon yozuvi uzildi.');};
   this.timer(s,'startTimer',()=>this.fail(s,'STT_CAPTURE_STALLED: Mikrofon yozishni boshlamadi.'),10000);
   rec.start(1000);
  }catch{this.fail(s,'STT_CAPTURE_STALLED: Brauzer ovoz yozuvini boshlay olmadi.');}
 }
 endClock(s){
  if(s.startedAt!==null){s.elapsed+=(this.now()-s.startedAt)/1000;s.startedAt=null;}
  this.clearTimer(s.beatTimer);this.activity(s);
 }
 closeSegment(s){
  if(this.session!==s||s.stopping)return;
  s.stopping=true;this.clearTimer(s.segmentTimer);this.endClock(s);
  this.timer(s,'stopTimer',()=>this.fail(s,'STT_CAPTURE_STALLED: Brauzer ovoz yozuvini yakunlamadi.'),5000);
  try{if(s.recorder?.state!=='inactive')s.recorder.stop();}catch{this.fail(s,'STT_CAPTURE_STALLED: Ovoz yozuvini yakunlab bo‘lmadi.');}
 }
 async pump(s){
  if(this.session!==s||s.submitting)return;
  const blob=s.queue.shift();
  if(!blob){if(!s.capture&&!s.recorder)this.finish(s);return;}
  s.submitting=true;this.activity(s);
  try{
   const result=await this.transcribe(blob,s.controller.signal,s.language);
   if(this.session!==s)return;
   if(typeof result?.text!=='string'||!result.text.trim())throw new Error('STT_NO_SPEECH: Ovoz eshitilmadi.');
   s.quiet=false;s.texts.push(result.text.trim());this.onText({text:s.texts.join(' '),language:result.language||s.language});
  }catch(error){
   if(this.session!==s)return;
   if(String(error?.message).startsWith('STT_NO_SPEECH:'))s.quiet=true;
   else{this.fail(s,error?.message||'Ovozni matnga aylantirib bo‘lmadi.');return;}
  }
  s.submitting=false;this.activity(s);void this.pump(s);
 }
 remember(s){
  if(s.saved===s.blobs.length||!s.blobs.length)return;
  s.saved=s.blobs.length;this.onRecording({blob:s.blobs[0],blobs:[...s.blobs],language:s.language});
 }
 releaseStream(stream){try{for(const track of stream?.getTracks()||[])try{track.stop();}catch{}}catch{}}
 detach(rec){if(rec)rec.onstart=rec.ondataavailable=rec.onstop=rec.onerror=null;}
 release(s){
  s.capture=false;
  for(const key of ['permissionTimer','startTimer','segmentTimer','stopTimer','beatTimer'])this.clearTimer(s[key]);
  this.endClock(s);const rec=s.recorder;s.recorder=null;this.detach(rec);
  try{if(rec&&rec.state!=='inactive')rec.stop();}catch{}
  const stream=s.stream;s.stream=null;this.releaseStream(stream);
 }
 stop(){
  const s=this.session;if(!s||!s.capture)return;
  s.capture=false;this.state('stopping');
  if(s.recorder)this.closeSegment(s);
  const stream=s.stream;s.stream=null;this.releaseStream(stream);
  if(!s.recorder&&!s.submitting&&!s.queue.length)this.finish(s);
 }
 finish(s){
  if(this.session!==s)return;
  this.session=null;this.release(s);this.remember(s);this.state('idle');
  if(!s.texts.length)this.onError('Ovoz eshitilmadi. Mikrofonni tekshiring yoki saqlangan yozuvni tinglang.');
 }
 fail(s,message){
  if(this.session!==s)return;
  this.session=null;s.controller.abort();this.release(s);this.remember(s);this.state('idle');this.onError(message);
 }
 cancel(){
  const s=this.session;this.session=null;
  if(s){s.controller.abort();this.release(s);this.remember(s);}
  this.state('idle');this.onActivity({seconds:0,level:null,pending:false});
 }
 dispose(){this.onState=this.onText=this.onError=this.onRecording=this.onActivity=()=>{};this.cancel();}
}
