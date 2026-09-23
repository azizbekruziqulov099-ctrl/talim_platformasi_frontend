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
  const session={language,completed:new Set(),recognizer:null,pending:'',stopping:false};this.session=session;
  this.onInterim('');this.onState('starting');
  try {
   const rec=new this.Recognition();session.recognizer=rec;
   rec.lang=SPEECH_LOCALES[language];rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;
   const waitForWords=()=>{
    this.clearTimer(this.timer);
    this.timer=this.setTimer(()=>{
     if(this.session===session)this.finish('Brauzer matn qaytarmadi. Ovoz yozib yuborish usulini tanlang yoki mikrofon ruxsatini tekshiring.',true);
    },20000);
   };
   rec.onstart=()=>{if(this.session===session&&!session.stopping){waitForWords();this.onState('listening');}};
   rec.onresult=event=>{
    if(this.session!==session)return;
    let pending='',hasWords=false;
    for(let i=0;i<event.results.length;i++) {
     const result=event.results[i];
     const transcript=result[0]?.transcript?.trim()||'';
     if(transcript)hasWords=true;
     if(result.isFinal&&!session.completed.has(i)&&transcript) {
      session.completed.add(i);this.onText({text:transcript,language});
     } else if(!result.isFinal&&transcript)pending+=`${transcript} `;
    }
    session.pending=pending.trim();this.onInterim(session.pending);
    if(!session.stopping&&hasWords)waitForWords();
   };
   rec.onerror=event=>{if(this.session===session)this.finish(event.error==='aborted'?'':recognitionError(event.error),event.error!=='aborted');};
   rec.onend=()=>{if(this.session===session)this.finish(session.completed.size||session.pending?'':'Brauzer nutqni matnga aylantirmadi. Ovoz yozib yuborish usulini tanlang.',true);};
   this.timer=this.setTimer(()=>{
    if(this.session===session)this.finish('Mikrofon ishga tushmadi. Brauzerda mikrofon ruxsatini tekshirib, qayta bosing.');
   },15000);
   rec.start();
  } catch(error) {this.finish(error?.name==='NotAllowedError'?recognitionError('not-allowed'):'Mikrofonni ochib bo‘lmadi. Qayta urinib ko‘ring.');}
 }
 stop() {
  const session=this.session;if(!session||session.stopping)return;
  session.stopping=true;this.onState('stopping');
  this.clearTimer(this.timer);
  this.timer=this.setTimer(()=>{if(this.session===session)this.finish(session.completed.size||session.pending?'':'Brauzer matn qaytarmadi. Ovoz yozib yuborish usulini tanlang.',true);},2000);
  try{session.recognizer?.stop();}catch{this.finish('',true);}
 }
 finish(message='',keepPending=false) {
  const session=this.session;this.session=null;
  this.clearTimer(this.timer);this.timer=null;
  const rec=session?.recognizer;
  if(rec){rec.onstart=rec.onresult=rec.onerror=rec.onend=null;try{rec.abort();}catch{}}
  if(keepPending&&session?.pending)this.onText({text:session.pending,language:session.language,draft:true});
  this.onInterim('');this.onState('idle');if(message)this.onError(message);
 }
 cancel(){this.finish();}
 dispose(){this.onState=this.onText=this.onInterim=this.onError=()=>{};this.finish();}
}

export function dictationSupport(access,environment=globalThis) {
 const secure=environment.isSecureContext!==false;
 const browser=secure&&Boolean(environment.SpeechRecognition||environment.webkitSpeechRecognition);
 const microphone=secure&&Boolean(environment.navigator?.mediaDevices?.getUserMedia);
 const Context=environment.AudioContext||environment.webkitAudioContext;
 const live=microphone&&Boolean(Context?.prototype?.createScriptProcessor)&&Boolean(access?.dictation_available);
 const recording=microphone&&Boolean(environment.MediaRecorder)&&Boolean(access?.dictation_available);
 let reason='';
 if(!secure)reason='Mikrofon ishlashi uchun saytni HTTPS manzilida oching.';
 else if(!live&&!recording&&!browser)reason=access?.dictation_available
  ? 'Bu brauzerda mikrofon yozuvi ochilmayapti. Saytni mikrofonni qo‘llaydigan brauzerda oching.'
  : 'Ovozni matnga aylantirish xizmati ulanmagan, bu brauzerda ham gapirib yozish mavjud emas.';
 return {live,recording,browser,reason};
}
