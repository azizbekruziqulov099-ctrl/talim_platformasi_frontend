import {SPEECH_LOCALES} from '../speech/language.js';
import {recognitionError} from './speechText.js';

// Do not let a failed or cancelled browser recognizer keep the editor locked.
export class BrowserDictation {
 constructor({Recognition=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition,
  mediaDevices=globalThis.navigator?.mediaDevices,onStatus=()=>{},
  onState=()=>{},onText=()=>{},onInterim=()=>{},onError=()=>{},setTimer=setTimeout,clearTimer=clearTimeout}={}) {
  Object.assign(this,{Recognition,mediaDevices,onStatus,onState,onText,onInterim,onError,setTimer,clearTimer});
  this.session=null;this.timer=null;
 }
 start(language='uz') {
  if(this.session)return;
  if(!SPEECH_LOCALES[language]){this.onError('Gapiradigan tilingizni tanlang.');return;}
  if(!this.Recognition){this.onError(browserDictationSupport({}).reason);return;}
  const session={language,completed:new Set(),recognizer:null,pending:'',stopping:false,started:false,
   microphoneVerified:false,retried:false,hasText:false,audio:false,speech:false};this.session=session;
  this.onInterim('');this.onState('starting');
  // Request permission from the click itself. SpeechRecognition alone can wait
  // without a permission prompt or an error, even when its constructor exists.
  if(this.mediaDevices?.getUserMedia)return this.prepareMicrophone(session);
  this.open(session); // Older recognizers may work without MediaDevices.
 }
 async prepareMicrophone(session) {
  this.status(session,'permission');
  this.arm(session,()=>this.finish('Mikrofon ruxsatiga javob kelmadi. Sayt ruxsatlarida mikrofonni yoqing va qayta bosing.',false,'permission-timeout'),20000);
  try {
   const stream=await this.mediaDevices.getUserMedia({audio:true});
   let tracks=[];
   try{tracks=stream.getAudioTracks?.()||stream.getTracks();}catch{}
   const available=tracks.some(track=>track.readyState!=='ended'&&track.enabled!==false);
   // Release before recognition opens its own microphone. Two simultaneous
   // capture engines can block one another on phones. Also release late grants.
   try{for(const track of stream.getTracks())try{track.stop();}catch{}}catch{}
   if(this.session!==session)return;
   if(!available){this.finish('Mikrofon ochildi, lekin faol ovoz kanali yo‘q. Mikrofonni ulab, qayta bosing.',false,'audio-capture');return;}
   session.microphoneVerified=true;
   this.open(session);
  }catch(error){
   if(this.session!==session)return;
   const messages={
    NotAllowedError:'Mikrofonga ruxsat berilmadi. Sayt ruxsatlarida va qurilma sozlamalarida mikrofonni yoqing.',
    SecurityError:'Bu oynada mikrofonga ruxsat yo‘q. Saytni brauzerda alohida ochib, mikrofonga ruxsat bering.',
    NotFoundError:'Mikrofon topilmadi. Mikrofonni ulang yoki qurilmada boshqa mikrofonni tanlang.',
    NotReadableError:'Mikrofonni qurilma ocholmadi. Mikrofon ishlatayotgan boshqa dasturni yopib, qayta bosing.',
    AbortError:'Mikrofon ochilishi uzildi. Qayta bosing.',
   };
   this.finish(messages[error?.name]||'Mikrofonni tekshirib bo‘lmadi. Qurilma va saytning mikrofon ruxsatlarini tekshiring.',false,error?.name||'microphone-error');
  }
 }
 status(session,phase) {
  if(this.session===session){session.phase=phase;this.onStatus({phase,microphoneVerified:session.microphoneVerified,retried:session.retried});}
 }
 arm(session,callback,ms) {
  this.clearTimer(this.timer);
  const timer=this.setTimer(()=>{if(this.session===session&&this.timer===timer){this.clearTimer(timer);this.timer=null;callback();}},ms);
  this.timer=timer;
 }
 retryStartup(session) {
  // One compatibility retry, only after a successful microphone check and
  // before any text. Permission denial, silence and language errors never loop.
  if(this.session!==session||session.stopping||!session.microphoneVerified||session.retried||session.hasText)return false;
  session.retried=true;session.started=false;
  const rec=session.recognizer;session.recognizer=null;this.detach(rec);
  try{rec?.abort();}catch{}
  this.onState('starting');this.status(session,'retrying');
  this.arm(session,()=>this.open(session),250);
  return true;
 }
 open(session) {
  if(this.session!==session||session.stopping)return;
  session.completed.clear();session.pending='';session.started=false;session.audio=false;session.speech=false;
  this.status(session,'service');
  try {
   const rec=new this.Recognition();session.recognizer=rec;
   const current=()=>this.session===session&&session.recognizer===rec;
   rec.lang=SPEECH_LOCALES[session.language];rec.continuous=!session.retried;rec.interimResults=true;rec.maxAlternatives=1;
   const waitForWords=()=>{
    this.arm(session,()=>{
     if(current())this.finish(session.speech
      ?'Brauzer ovozni eshitdi, lekin matn qaytarmadi. Nutqni tanish xizmati bilan ulanishni tekshiring yoki boshqa yozish usulini tanlang.'
      :'Brauzer matn qaytarmadi. Mikrofonni tekshiring yoki boshqa yozish usulini tanlang.',true,'no-result');
    },20000);
   };
   const listening=(phase='listening')=>{
    if(!current()||session.stopping)return;
    session.audio=true;session.started=true;
    this.onState('listening');this.status(session,phase);waitForWords();
   };
   // Service start is not proof that audio is being captured. Keep the startup
   // deadline until audiostart or results; some phone engines emit results first.
   rec.onstart=()=>{if(current()&&!session.stopping){session.started=true;if(!session.audio)this.status(session,'service');this.onState('listening');}};
   rec.onaudiostart=()=>{if(!session.audio)listening();};
   rec.onspeechstart=()=>{if(current()){session.speech=true;listening('speech');}};
   rec.onresult=event=>{
    if(!current())return;
    let pending='',changed=false;
    for(let i=0;i<(event.results?.length||0);i++) {
     const result=event.results[i];
     const transcript=result[0]?.transcript?.trim()||'';
     if(transcript)session.hasText=true;
     if(result.isFinal&&!session.completed.has(i)&&transcript) {
      changed=true;session.completed.add(i);this.onText({text:transcript,language:session.language});
     } else if(!result.isFinal&&transcript)pending+=`${transcript} `;
    }
    changed=changed||Boolean(pending.trim()&&pending.trim()!==session.pending);
    session.pending=pending.trim();this.onInterim(session.pending);
    if(!session.stopping&&changed)listening('text');
   };
   rec.onerror=event=>{
    if(!current())return;
    if(session.stopping){this.finish('',true);return;}
    if(['network','audio-capture'].includes(event.error)&&this.retryStartup(session))return;
    this.finish(event.error==='aborted'?'Yozuv brauzer tomonidan to‘xtatildi. Qayta boshlashingiz mumkin.':recognitionError(event.error),true,event.error);
   };
   rec.onend=()=>{
    if(!current())return;
    if(session.stopping){this.finish('',true);return;}
    if(!session.completed.size&&!session.pending){
     if(!session.audio&&this.retryStartup(session))return;
     this.finish(session.speech?'Ovoz eshitildi, lekin brauzer matn qaytarmadi. Boshqa yozish usulini tanlang.':'Nutq aniqlanmadi. Mikrofonni tekshirib, qayta boshlang.',false,'no-result');return;
    }
    // Mobile browsers may end recognition after a phrase despite continuous.
    // Resume only a successful session; errors/silence never create a loop.
    this.keepPending(session);this.detach(rec);session.recognizer=null;
    this.onState('starting');this.status(session,'resuming');
    this.arm(session,()=>this.open(session),250);
   };
   this.arm(session,()=>{
    if(!current()||this.retryStartup(session))return;
    this.finish(session.microphoneVerified
     ?'Mikrofonga ruxsat bor. Ammo brauzerning nutqni tanish xizmati ishga tushmadi. Qayta bosing yoki boshqa yozish usulini tanlang.'
     :'Brauzer yozishni boshlamadi. Sayt ruxsatlarida mikrofonni tekshirib, qayta bosing.',false,'service-timeout');
   },8000);
   rec.start();
  } catch(error) {this.finish(error?.name==='NotAllowedError'?recognitionError('not-allowed'):'Brauzer gapirib yozishni boshlay olmadi. Qayta urinib ko‘ring.',false,error?.name||'start-error');}
 }
 stop() {
  const session=this.session;if(!session||session.stopping)return;
  if(!session.started||!session.recognizer){this.finish('',true);return;}
  session.stopping=true;this.onState('stopping');
  this.arm(session,()=>this.finish('',true),2000);
  try{session.recognizer?.stop();}catch{this.finish('',true);}
 }
 keepPending(session) {
  if(session?.pending){const text=session.pending;session.pending='';this.onText({text,language:session.language,draft:true});}
  this.onInterim('');
 }
 detach(rec) {
  if(rec)rec.onstart=rec.onaudiostart=rec.onspeechstart=rec.onresult=rec.onerror=rec.onend=null;
 }
 finish(message='',keepPending=false,code='') {
  const session=this.session;this.session=null;
  this.clearTimer(this.timer);this.timer=null;
  const rec=session?.recognizer;
  if(rec){this.detach(rec);try{rec.abort();}catch{}}
  if(keepPending)this.keepPending(session);
  this.onInterim('');this.onState('idle');
  this.onStatus({phase:message?'error':'idle',code,microphoneVerified:Boolean(session?.microphoneVerified),retried:Boolean(session?.retried)});
  if(message)this.onError(message);
 }
 cancel(){this.finish();}
 dispose(){this.onState=this.onText=this.onInterim=this.onError=this.onStatus=()=>{};this.finish();}
}

export function browserDictationStatus(status={}) {
 return ({
  permission:'Mikrofon ochilmoqda. Brauzer so‘rasa, “Ruxsat berish”ni bosing.',
  service:status.microphoneVerified?'Mikrofon tekshirildi. Brauzerning nutqni tanish xizmati boshlanmoqda…':'Brauzerning nutqni tanish xizmati boshlanmoqda…',
  retrying:'Nutqni tanish xizmati boshlanmadi. Bir marta qayta ulanmoqda…',
  resuming:'Keyingi gap uchun tinglash davom ettirilmoqda…',
  listening:'Mikrofon ochiq. Gapirishingiz mumkin.',
  speech:'Ovoz eshitildi. Brauzerdan matn kutilmoqda…',
  text:'Gaplaringiz matnga tushmoqda…',
 })[status.phase]||'';
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
 const live=microphone&&Boolean(environment.MediaRecorder||Context?.prototype?.createScriptProcessor)&&Boolean(access?.dictation_available);
 const recording=microphone&&Boolean(environment.MediaRecorder)&&Boolean(access?.dictation_available);
 let reason='';
 if(!secure)reason='Mikrofon ishlashi uchun saytni HTTPS manzilida oching.';
 else if(!live&&!recording&&!browser)reason=access?.dictation_available
  ? 'Bu brauzerda mikrofon yozuvi ochilmayapti. Saytni mikrofonni qo‘llaydigan brauzerda oching.'
  : 'Ovozni matnga aylantirish xizmati ulanmagan, bu brauzerda ham gapirib yozish mavjud emas.';
 return {live,recording,browser,reason};
}

// Opening admin/server status must not silently switch a working browser
// microphone to a different capture engine or start using provider quota.
export function preferredDictationMethod(method, support) {
 if (['browser','recording','live'].includes(method) && support[method]) return method;
 return ['browser','live','recording'].find(key => support[key]) || 'browser';
}
