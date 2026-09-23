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
  if(!this.Recognition){this.onError(browserDictationSupport({}).reason);return;}
  const session={language,completed:new Set(),recognizer:null,pending:'',stopping:false,started:false};this.session=session;
  this.onInterim('');this.onState('starting');
  this.open(session);
 }
 open(session) {
  if(this.session!==session||session.stopping)return;
  session.completed.clear();session.pending='';session.started=false;
  try {
   const rec=new this.Recognition();session.recognizer=rec;
   const current=()=>this.session===session&&session.recognizer===rec;
   rec.lang=SPEECH_LOCALES[session.language];rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;
   const waitForWords=()=>{
    this.clearTimer(this.timer);
    this.timer=this.setTimer(()=>{
     if(current())this.finish('Brauzer matn qaytarmadi. Internet va mikrofon ruxsatini tekshiring. Telefon klaviaturasidagi mikrofonni ham ishlatishingiz mumkin.',true);
    },20000);
   };
   const listening=()=>{
    if(!current()||session.stopping||session.started)return;
    session.started=true;waitForWords();this.onState('listening');
   };
   // Some phone recognizers provide audio/results before the start event.
   rec.onstart=rec.onaudiostart=listening;
   rec.onresult=event=>{
    if(!current())return;
    listening();
    let pending='',hasWords=false;
    for(let i=0;i<event.results.length;i++) {
     const result=event.results[i];
     const transcript=result[0]?.transcript?.trim()||'';
     if(transcript)hasWords=true;
     if(result.isFinal&&!session.completed.has(i)&&transcript) {
      session.completed.add(i);this.onText({text:transcript,language:session.language});
     } else if(!result.isFinal&&transcript)pending+=`${transcript} `;
    }
    session.pending=pending.trim();this.onInterim(session.pending);
    if(!session.stopping&&hasWords)waitForWords();
   };
   rec.onerror=event=>{if(current())this.finish(event.error==='aborted'?'':recognitionError(event.error),true);};
   rec.onend=()=>{
    if(!current())return;
    if(session.stopping){this.finish('',true);return;}
    if(!session.completed.size&&!session.pending){this.finish('Ovoz eshitilmadi. Mikrofon ruxsatini tekshirib, qayta boshlang.');return;}
    // Mobile browsers may end recognition after a phrase despite continuous.
    // Resume only a successful session; errors/silence never create a loop.
    this.keepPending(session);this.detach(rec);session.recognizer=null;
    this.clearTimer(this.timer);this.onState('starting');
    this.timer=this.setTimer(()=>this.open(session),250);
   };
   this.clearTimer(this.timer);
   this.timer=this.setTimer(()=>{
    if(current())this.finish('Mikrofon ishga tushmadi. Brauzerda mikrofon ruxsatini tekshirib, qayta bosing.');
   },15000);
   rec.start();
  } catch(error) {this.finish(error?.name==='NotAllowedError'?recognitionError('not-allowed'):'Mikrofonni ochib bo‘lmadi. Qayta urinib ko‘ring.');}
 }
 stop() {
  const session=this.session;if(!session||session.stopping)return;
  if(!session.started||!session.recognizer){this.finish('',true);return;}
  session.stopping=true;this.onState('stopping');
  this.clearTimer(this.timer);
  this.timer=this.setTimer(()=>{if(this.session===session)this.finish('',true);},2000);
  try{session.recognizer?.stop();}catch{this.finish('',true);}
 }
 keepPending(session) {
  if(session?.pending){const text=session.pending;session.pending='';this.onText({text,language:session.language,draft:true});}
  this.onInterim('');
 }
 detach(rec) {
  if(rec)rec.onstart=rec.onaudiostart=rec.onresult=rec.onerror=rec.onend=null;
 }
 finish(message='',keepPending=false) {
  const session=this.session;this.session=null;
  this.clearTimer(this.timer);this.timer=null;
  const rec=session?.recognizer;
  if(rec){this.detach(rec);try{rec.abort();}catch{}}
  if(keepPending)this.keepPending(session);
  this.onInterim('');this.onState('idle');if(message)this.onError(message);
 }
 cancel(){this.finish();}
 dispose(){this.onState=this.onText=this.onInterim=this.onError=()=>{};this.finish();}
}

// Browser dictation does not depend on a backend status response or API key.
export function browserDictationSupport(environment=globalThis) {
 const secure=environment.isSecureContext!==false;
 const browser=secure&&Boolean(environment.SpeechRecognition||environment.webkitSpeechRecognition);
 const reason=!secure?'Mikrofon ishlashi uchun saytni HTTPS manzilida oching.':!browser
  ? 'Bu brauzer gapirib yozishni qo‘llamaydi. Android yoki kompyuterda Chrome, iPhone’da Safari orqali ochib ko‘ring. Telefon klaviaturasida mikrofon bo‘lsa, shu matn maydonida undan foydalanishingiz mumkin.'
  : '';
 return {browser,reason};
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
