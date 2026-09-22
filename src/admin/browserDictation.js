import {SPEECH_LOCALES} from '../speech/language.js';
import {recognitionError} from './speechText.js';

// Do not let a failed or cancelled browser recognizer keep the editor locked.
export class BrowserDictation {
 constructor({Recognition=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition,
  onState=()=>{},onText=()=>{},onInterim=()=>{},onError=()=>{},setTimer=setTimeout,clearTimer=clearTimeout}={}) {
  Object.assign(this,{Recognition,onState,onText,onInterim,onError,setTimer,clearTimer});
  this.session=null;this.timer=null;
 }
 start(language='uz') {
  if(this.session)return;
  if(!SPEECH_LOCALES[language]){this.onError('Gapiradigan tilingizni tanlang.');return;}
  if(!this.Recognition){this.onError('Bu brauzer gapirib yozishni qo‘llamaydi. Ovoz yozib yuborish rejimini tanlang.');return;}
  const session={language,completed:new Set(),recognizer:null};this.session=session;
  this.onInterim('');this.onState('starting');
  try {
   const rec=new this.Recognition();session.recognizer=rec;
   rec.lang=SPEECH_LOCALES[language];rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;
   rec.onstart=()=>{if(this.session===session){this.clearTimer(this.timer);this.timer=null;this.onState('listening');}};
   rec.onresult=event=>{
    if(this.session!==session)return;
    let pending='';
    for(let i=event.resultIndex;i<event.results.length;i++) {
     const result=event.results[i];
     if(result.isFinal&&!session.completed.has(i)) {
      session.completed.add(i);this.onText({text:result[0].transcript,language});
     } else if(!result.isFinal)pending+=`${result[0].transcript} `;
    }
    this.onInterim(pending.trim());
   };
   rec.onerror=event=>{if(this.session===session)this.finish(event.error==='aborted'?'':recognitionError(event.error));};
   rec.onend=()=>{if(this.session===session)this.finish();};
   this.timer=this.setTimer(()=>{
    if(this.session===session)this.finish('Mikrofon ishga tushmadi. Brauzerda mikrofon ruxsatini tekshirib, qayta bosing.');
   },15000);
   rec.start();
  } catch(error) {this.finish(error?.name==='NotAllowedError'?recognitionError('not-allowed'):'Mikrofonni ochib bo‘lmadi. Qayta urinib ko‘ring.');}
 }
 stop() {
  const session=this.session;if(!session)return;
  this.clearTimer(this.timer);
  this.timer=this.setTimer(()=>{if(this.session===session)this.finish();},2000);
  try{session.recognizer?.stop();}catch{this.finish();}
 }
 finish(message='') {
  const session=this.session;this.session=null;
  this.clearTimer(this.timer);this.timer=null;
  const rec=session?.recognizer;
  if(rec){rec.onstart=rec.onresult=rec.onerror=rec.onend=null;try{rec.abort();}catch{}}
  this.onInterim('');this.onState('idle');if(message)this.onError(message);
 }
 cancel(){this.finish();}
}

export function dictationSupport(access,environment=globalThis) {
 const secure=environment.isSecureContext!==false;
 const browser=secure&&Boolean(environment.SpeechRecognition||environment.webkitSpeechRecognition);
 const microphone=secure&&Boolean(environment.MediaRecorder&&environment.navigator?.mediaDevices?.getUserMedia);
 const recording=microphone&&Boolean(access?.dictation_available);
 let reason='';
 if(!secure)reason='Mikrofon ishlashi uchun saytni HTTPS manzilida oching.';
 else if(!recording&&!browser)reason=access?.dictation_available
  ? 'Bu brauzerda mikrofon yozuvi ochilmayapti. Saytni mikrofonni qo‘llaydigan brauzerda oching.'
  : 'Ovozni matnga aylantirish xizmati ulanmagan, bu brauzerda ham gapirib yozish mavjud emas.';
 return {recording,browser,reason};
}
