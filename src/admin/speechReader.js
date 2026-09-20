export class SpeechReader {
 constructor({fetchAudio,onState=()=>{},onProgress=()=>{},onError=()=>{},createAudio=src=>new Audio(src),
  createURL=blob=>URL.createObjectURL(blob),revokeURL=url=>URL.revokeObjectURL(url),
  setTimer=(fn,ms)=>setTimeout(fn,ms),clearTimer=id=>clearTimeout(id)}) {
  Object.assign(this,{fetchAudio,onState,onProgress,onError,createAudio,createURL,revokeURL,setTimer,clearTimer});
  this.session=null;this.audio=null;this.url=null;this.timer=null;this.rate=1;
 }
 releaseAudio() {
  if(this.audio){this.audio.onended=null;this.audio.onerror=null;this.audio.pause();this.audio.removeAttribute('src');this.audio=null;}
  if(this.url){this.revokeURL(this.url);this.url=null;}
 }
 stop(notify=true) {
  this.session?.controller.abort();this.session=null;
  this.clearTimer(this.timer);this.timer=null;this.releaseAudio();
  if(notify)this.onState('idle');
 }
 start(chunks,{voice='qiz',rate=1}={}) {
  this.stop(false);this.rate=rate;
  if(!chunks.length){this.onState('idle');return;}
  this.session={chunks,index:0,voice,paused:false,fetching:false,controller:new AbortController()};
  this.onProgress(0,chunks.length);this.step(this.session);
 }
 setRate(rate) {this.rate=rate;if(this.audio)this.audio.playbackRate=rate;}
 async play(session) {
  try {await this.audio.play();if(this.session===session&&!session.paused)this.onState('playing');}
  catch(error) {
   if(this.session!==session)return;
   if(error.name==='NotAllowedError'){session.paused=true;this.onState('paused');this.onError('Ovoz tayyor. Eshitish uchun “Davom ettirish”ni bosing.');}
   else {this.stop();this.onError('Ovozni ijro etib bo‘lmadi. Qayta urinib ko‘ring.');}
  }
 }
 async step(session) {
  if(this.session!==session||session.paused)return;
  this.releaseAudio();session.fetching=true;this.onState('loading');
  try {
   const chunk=session.chunks[session.index];
   const blob=await this.fetchAudio(chunk.text,session.voice,session.controller.signal);
   if(this.session!==session)return;
   session.fetching=false;this.url=this.createURL(blob);this.audio=this.createAudio(this.url);
   this.audio.playbackRate=this.rate;this.audio.preservesPitch=true;
   this.audio.onended=()=>{
    if(this.session!==session)return;
    session.index++;this.onProgress(session.index,session.chunks.length);
    if(session.index>=session.chunks.length){this.stop();return;}
    this.releaseAudio();
    this.timer=this.setTimer(()=>{this.timer=null;this.step(session);},chunk.pauseMs/this.rate);
   };
   this.audio.onerror=()=>{if(this.session===session){this.stop();this.onError('Audio yuklanmadi. Qayta urinib ko‘ring.');}};
   if(!session.paused)await this.play(session);
  } catch(error) {
   if(this.session!==session||error.name==='AbortError')return;
   this.stop();this.onError(error.message||'Ovoz yaratilmadi');
  }
 }
 pause() {
  if(!this.session)return;
  this.session.paused=true;this.clearTimer(this.timer);this.timer=null;this.audio?.pause();this.onState('paused');
 }
 resume() {
  const session=this.session;if(!session)return;
  session.paused=false;
  if(this.audio)this.play(session);
  else if(session.fetching)this.onState('loading');
  else this.step(session);
 }
 dispose() {this.stop(false);this.onState=this.onProgress=this.onError=()=>{};}
}
