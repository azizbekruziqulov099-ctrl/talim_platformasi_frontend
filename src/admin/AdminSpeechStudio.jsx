import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React,{useEffect,useRef,useState} from 'react';
import {appendDictation,readingChunks} from './speechText.js';
import {SpeechReader} from './speechReader.js';
import {AudioDictation} from './audioDictation.js';
import {LiveDictation} from './liveDictation.js';
import {detectSpeechLanguage} from '../speech/language.js';
import {BrowserDictation,dictationSupport} from './browserDictation.js';
import {transcribeRecording} from './transcriptionClient.js';

export default function AdminSpeechStudio({apiBase,token}) {
  useKbInterfaceLocale();
 const [access,setAccess]=useState(null);
 const [accessError,setAccessError]=useState('');
 const [statusAttempt,setStatusAttempt]=useState(0);
 const [mode,setMode]=useState('dictate');
 const [text,setText]=useState('');
 const [voice,setVoice]=useState('qiz');
 const [readLanguage,setReadLanguage]=useState('auto');
 const [dictationLanguage,setDictationLanguage]=useState('uz');
 const [method,setMethod]=useState('auto');
 const [activity,setActivity]=useState({seconds:0,level:0,pending:false});
 const [rate,setRate]=useState(1);
 const [reading,setReading]=useState('idle');
 const [progress,setProgress]=useState([0,0]);
 const [dictation,setDictation]=useState('');
 const [interim,setInterim]=useState('');
 const [recording,setRecording]=useState('idle');
 const [savedAudio,setSavedAudio]=useState(null);
 const [audioUrl,setAudioUrl]=useState('');
 const [recognizedLanguage,setRecognizedLanguage]=useState('');
 const [commands,setCommands]=useState(true);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const readerRef=useRef(null);
 const recognitionRef=useRef(null);
 const audioDictationRef=useRef(null);
 const liveDictationRef=useRef(null);
 const dictationBaseRef=useRef('');
 const generatedRef=useRef(null);
 const commandsRef=useRef(commands);commandsRef.current=commands;
 const support=dictationSupport(access);
 const selectedMethod=support[method]?method:support.live?'live':support.recording?'recording':'browser';
 const autoDictation=selectedMethod!=='browser';
 const dictationBusy=recording!=='idle';
 const languageNames={uz:'O‘zbekcha',uzbek:'O‘zbekcha',ru:'Ruscha',russian:'Ruscha',en:'Inglizcha',english:'Inglizcha'};
 useEffect(()=>{
  if(!savedAudio?.blob){setAudioUrl('');return;}
  let url;
  try{url=URL.createObjectURL(savedAudio.blob);setAudioUrl(url);}catch{setAudioUrl('');}
  return()=>{if(url)try{URL.revokeObjectURL(url);}catch{/* already released */}};
 },[savedAudio?.blob]);
 useEffect(()=>{
  const controller=new AbortController();
  setAccess(null);setAccessError('');setError('');
  const timeout=setTimeout(()=>{controller.abort();setAccessError('Ovoz xizmatini tekshirish cho‘zildi. Qayta tekshirishni bosing.');},15000);
  fetch(`${apiBase}/api/admin/speech/status?${new URLSearchParams({token})}`,{signal:controller.signal})
   .then(async response=>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.detail||(response.status===404?'Ovoz xizmati manzili topilmadi. Backend yangilanishini tekshiring.':'Admin ruxsati tasdiqlanmadi'));if(!data.admin)throw new Error('Ovoz xizmatidan noto‘g‘ri javob keldi. Backend manzilini tekshiring.');return data;})
   .then(data=>{if(!controller.signal.aborted)setAccess(data);})
   .catch(err=>{if(!controller.signal.aborted)setAccessError(err.message||'Ovoz xizmati bilan aloqa yo‘q. Qayta tekshiring.');})
   .finally(()=>clearTimeout(timeout));
  return()=>{clearTimeout(timeout);controller.abort();};
 },[apiBase,token,statusAttempt]);
 useEffect(()=>{
  let active=true;
  const alive=callback=>(...args)=>{if(active)callback(...args);};
  const reader=new SpeechReader({onState:alive(setReading),onProgress:alive((done,total)=>setProgress([done,total])),onError:alive(setError),
   fetchAudio:async(value,speaker,signal,language)=>{
    const response=await fetch(`${apiBase}/api/admin/speech/read?${new URLSearchParams({token})}`,{
     method:'POST',headers:{'Content-Type':'application/json'},signal,body:JSON.stringify({text:value,voice:speaker,language})});
    if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.detail||'Ovoz xizmati javob bermadi');}
    return response.blob();
   }});
  readerRef.current=reader;
  const receiveText=(replace=false)=>alive(result=>{
   const format=commandsRef.current&&(['uz','uzbek'].includes(result.language)||(!result.language&&detectSpeechLanguage(result.text)==='uz'));
   if(replace){const next=appendDictation(dictationBaseRef.current,result.text,format);generatedRef.current=next;setDictation(next);}
   else setDictation(old=>appendDictation(old,result.text,format));
   setRecognizedLanguage(result.language);
   setNotice(result.draft?'Brauzerning dastlabki matni saqlandi. Matnni tekshirib tahrirlang.':'Ovoz matnga aylantirildi. Matnni tekshirib tahrirlashingiz mumkin.');
  });
  const recorder=new AudioDictation({onState:alive(setRecording),onError:alive(setError),onRecording:alive(setSavedAudio),
   onText:receiveText(true),
   transcribe:(blob,signal,language)=>transcribeRecording({apiBase,token,blob,signal,language})});
  audioDictationRef.current=recorder;
  const live=new LiveDictation({onState:alive(setRecording),onError:alive(setError),onActivity:alive(setActivity),onText:receiveText(true),
   onRecording:alive(({blob,language})=>recorder.selectFile(blob,{language})),
   transcribe:(blob,signal,language)=>transcribeRecording({apiBase,token,blob,signal,language})});
  liveDictationRef.current=live;
  const browser=new BrowserDictation({onState:alive(setRecording),onText:receiveText(),onInterim:alive(setInterim),onError:alive(setError)});
  recognitionRef.current=browser;
  return()=>{
   active=false;
   // Dispose independently. One disconnected player must not leave another
   // microphone open or throw into the application's root error boundary.
   for(const [resource,ref] of [[reader,readerRef],[live,liveDictationRef],[recorder,audioDictationRef],[browser,recognitionRef]]){
    if(ref.current===resource)ref.current=null;
    try{if(typeof resource.dispose==='function')resource.dispose();else resource.cancel?.();}catch{/* detached media */}
   }
  };
 },[apiBase,token]);
 const cancelDictation=()=>{
  for(const resource of [liveDictationRef.current,audioDictationRef.current,recognitionRef.current]){
   try{resource?.cancel();}catch{/* still cancel every other engine */}
  }
  setRecording('idle');setInterim('');setActivity({seconds:0,level:0,pending:false});
 };
 const stopDictation=()=>{
  try{
   if(liveDictationRef.current?.session)liveDictationRef.current.stop();
   else if(recognitionRef.current?.session)recognitionRef.current.stop();
   else if(audioDictationRef.current?.busy)audioDictationRef.current.stop();
   else setRecording('idle');
  }catch{cancelDictation();setError('Yozuv to‘xtatildi. Mikrofonni qayta yoqib urinib ko‘ring.');}
 };
 const switchMode=value=>{
  if(value===mode)return;
  // Opening a text panel is a UI action, not an audio-service operation.
  // In particular, an idle/unavailable player must not block this button.
  setMode(value);setError('');setNotice('');setInterim('');
  const active=[];
  if(reading!=='idle')active.push([readerRef.current,'stop']);
  if(recording!=='idle')active.push([liveDictationRef.current,'cancel'],[audioDictationRef.current,'cancel'],[recognitionRef.current,'cancel']);
  let failed=false;
  for(const [resource,method] of active){
   try{if(typeof resource?.[method]==='function')resource[method]();}
   catch{failed=true;}
  }
  setReading('idle');setRecording('idle');
  if(failed)setError('Oldingi ovoz jarayonini yopib bo‘lmadi. Bo‘lim ochildi; mikrofonni qayta ishlatishdan oldin sahifani yangilang.');
 };
 const startReading=()=>{
  if(!access?.admin||!text.trim())return;
  setError('');setNotice('');readerRef.current.start(readingChunks(text,1200,readLanguage),{voice,rate});
 };
 const startDictation=()=>{
  if(dictationBusy)return;
  if(!access?.admin){setError(accessError||'Ovoz xizmati tekshirilmoqda. Bir oz kuting.');return;}
  if(support.reason){setError(support.reason);return;}
  setError('');setNotice('');setInterim('');
  try{readerRef.current?.stop();}catch{/* the dictation panel stays usable */}
  setRecognizedLanguage('');
  dictationBaseRef.current=dictation;generatedRef.current=null;
  if(selectedMethod==='live')liveDictationRef.current?.start({language:dictationLanguage});
  else if(selectedMethod==='recording')audioDictationRef.current?.start({language:dictationLanguage});
  else recognitionRef.current?.start(dictationLanguage==='auto'?'uz':dictationLanguage);
 };
 const convertSaved=()=>{
  if(dictationBusy||!savedAudio)return;
  setError('');setNotice('');try{readerRef.current?.stop();}catch{}
  if(generatedRef.current!==null&&dictation!==generatedRef.current)dictationBaseRef.current=dictation;
  audioDictationRef.current.retry({language:dictationLanguage});
 };
 const selectAudio=event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  setError('');setNotice('');dictationBaseRef.current=dictation;generatedRef.current=null;
  audioDictationRef.current?.selectFile(file,{language:dictationLanguage});
 };
 const clearDictation=()=>{
  cancelDictation();setDictation('');setRecognizedLanguage('');setNotice('');setError('');
  dictationBaseRef.current='';generatedRef.current=null;audioDictationRef.current?.discard();
 };
 const copy=async value=>{
  try{await navigator.clipboard.writeText(value);setNotice('Matn nusxalandi.');}catch{setError('Nusxalash amalga oshmadi. Matnni belgilab nusxalang.');}
 };
 const saveText=value=>{
  const url=URL.createObjectURL(new Blob([value],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='matn.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const button='rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-40';
 return <div className="mx-auto min-w-0 max-w-4xl space-y-5 pb-24" data-speech-revision="61">
  <div><h2 className="text-xl font-bold text-slate-800">{__kbUi("Ovozli matn")}</h2><p className="mt-1 text-sm text-slate-600">{__kbUi("Matnni o‘z tilida o‘qish va gapirib yozish.")}</p></div>
  <div className="grid grid-cols-2 gap-2" role="group" aria-label={__kbUi("Ovozli matn rejimi")}>
   {[['read','Matnni o‘qish'],['dictate','Gapirib yozish']].map(([key,label])=><button key={key} type="button" onClick={()=>switchMode(key)} aria-pressed={mode===key}
    className={`${button} ${mode===key?'!border-sky-800 !bg-sky-900 !text-white':''}`}>{__kbUi(label)}</button>)}
  </div>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{__kbUi(error)}</p>}
  {notice&&<p role="status" className="text-sm text-green-800">{__kbUi(notice)}</p>}
  {accessError&&<div role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><p>{__kbUi(accessError)}</p><button type="button" className={`${button} mt-2`} onClick={()=>setStatusAttempt(value=>value+1)}>{__kbUi('Qayta tekshirish')}</button></div>}
  {!access&&!accessError&&<p role="status" className="text-sm text-slate-500">{__kbUi("Ovoz xizmati tekshirilmoqda…")}</p>}
  <section hidden={mode!=='read'} aria-label={__kbUi('Matnni o‘qish')} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
   <label className="block text-sm font-semibold text-slate-700">{__kbUi("O‘qiladigan matn")}<textarea value={text} onChange={event=>setText(event.target.value)} disabled={reading!=='idle'} maxLength={50000} rows={11}
     placeholder={__kbUi("Matnni shu yerga yozing yoki joylang. Nuqta, vergul va abzaslarni saqlang.")}
     className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base font-normal leading-relaxed disabled:bg-slate-50"/>
   </label>
   <p className="text-xs text-slate-500">{__kbUi(text.length.toLocaleString())}{__kbUi(" / 50 000 belgi. Abzaslar orasida alohida pauza qilinadi.")}</p>
   <div className="grid gap-4 sm:grid-cols-3">
    <label className="text-sm font-semibold text-slate-700">{__kbUi('O‘qish tili')}<select value={readLanguage} onChange={event=>setReadLanguage(event.target.value)} disabled={reading!=='idle'} className="mt-2 block w-full rounded-xl border p-2.5"><option value="auto">{__kbUi('Avtomatik')}</option>{['uz','ru','en'].map(code=><option key={code} value={code}>{__kbUi(languageNames[code])}</option>)}</select></label>
    <label className="text-sm font-semibold text-slate-700">{__kbUi("Ovoz")}<select value={voice} onChange={event=>setVoice(event.target.value)} disabled={reading!=='idle'} className="mt-2 block w-full rounded-xl border p-2.5"><option value="qiz">{__kbUi("Qiz ovozi")}</option><option value="ogil">{__kbUi("O‘g‘il ovozi")}</option></select></label>
    <label className="text-sm font-semibold text-slate-700">{__kbUi("Tezlik: ")}{rate.toFixed(2)}×<input type="range" min="0.5" max="2" step="0.05" value={rate} onChange={event=>{const value=Number(event.target.value);setRate(value);readerRef.current?.setRate(value);}} className="mt-4 block w-full"/><span className="mt-1 flex justify-between text-xs font-normal text-slate-500"><span>{__kbUi("Sekin")}</span><span>{__kbUi("Tez")}</span></span></label>
   </div>
   <p className="text-xs text-slate-500">{__kbUi('Til noto‘g‘ri aniqlansa, o‘qish tilini tanlang. Matndagi [uz], [ru], [en] teglari o‘z tilida o‘qiladi.')}</p>
   <div className="flex flex-wrap gap-2">
    {reading==='idle'?<button type="button" className={`${button} !bg-sky-900 !text-white`} disabled={!access?.reading_available||!text.trim()} onClick={startReading}>{__kbUi("Ovoz chiqarib o‘qish")}</button>
     : reading==='paused'?<button type="button" className={button} onClick={()=>{setError('');readerRef.current.resume();}}>{__kbUi("Davom ettirish")}</button>
      : <button type="button" className={button} onClick={()=>readerRef.current.pause()}>{__kbUi("Pauza")}</button>}
    <button type="button" className={button} disabled={reading==='idle'} onClick={()=>readerRef.current.stop()}>{__kbUi("To‘xtatish")}</button>
   </div>
   <p role="status" className="text-xs text-slate-500">{reading==='loading'?__kbUi('Ovoz tayyorlanmoqda…'):reading==='playing'?__kbUi('O‘qilmoqda'):reading==='paused'?__kbUi('Pauza'):__kbUi('')}{progress[1]>0?__kbUi(` · ${progress[0]} / ${progress[1]} bo‘lak o‘qildi`):__kbUi('')}</p>
   {access&&!access.reading_available&&<p className="text-sm text-amber-800">{__kbUi("Serverda ovoz xizmati mavjud emas. Yangilanishdagi backend paketlarini o‘rnating.")}</p>}
  </section><section hidden={mode!=='dictate'} aria-label={__kbUi('Gapirib yozish')} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
   <p className="text-sm text-slate-600">{__kbUi(selectedMethod==='live'?'Mikrofonni yoqing va gapiring. Matn gaplar orasidagi pauzada yoki 12 soniyalik bo‘laklarda chiqadi.':'Mikrofonni yoqing va gapiring. Yozishni tugatgach, matnni tahrirlashingiz mumkin.')}</p>
   {access&&!access.dictation_available&&<p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{__kbUi('Server orqali ovozni matnga aylantirish ulanmagan: backenddagi GROQ_API_KEY sozlamasini tekshiring.')}</p>}
   {access&&support.reason&&<p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{__kbUi(support.reason)}</p>}
   <div className="flex flex-wrap items-center gap-3">
    {!dictationBusy?<button type="button" className={`${button} !bg-sky-900 !text-white`} disabled={!access?.admin||Boolean(support.reason)} onClick={startDictation}>{__kbUi('Mikrofonni yoqish')}</button>
     :<><button type="button" className={`${button} !bg-sky-900 !text-white`} disabled={['starting','stopping','transcribing'].includes(recording)} onClick={stopDictation}>{__kbUi(selectedMethod==='recording'?'To‘xtatish va matnga aylantirish':'Yozishni tugatish')}</button>
      <button type="button" className={`${button} !border-red-300 !text-red-700`} onClick={cancelDictation}>{__kbUi('Bekor qilish')}</button></>}
    <span role="status" className="text-sm text-slate-500">{recording==='stopping'?__kbUi('Mikrofon o‘chirildi. Yozuv yakunlanmoqda…'):recording==='transcribing'?__kbUi('Mikrofon o‘chirildi. Matn tayyorlanmoqda…'):recording==='starting'?__kbUi('Mikrofon ruxsati va ovoz kutilmoqda…'):dictationBusy?__kbUi(selectedMethod==='recording'?'Ovoz yozilmoqda. Tugatish tugmasini bosing.':activity.pending?'Gapirishingiz mumkin. Matn olinmoqda…':'Tinglanmoqda…'):recognizedLanguage?`${__kbUi('Yozuv tili')}: ${__kbUi(languageNames[recognizedLanguage]||recognizedLanguage)}`:access?.admin&&!support.reason?__kbUi('Gapirib yozishga tayyor'):__kbUi('')}</span>
   </div>
   {selectedMethod==='live'&&dictationBusy&&<div className="flex items-center gap-3 text-xs text-slate-600"><meter aria-label={__kbUi('Mikrofon ovozi')} min="0" max="1" value={activity.level} className="h-3 w-28"/><span>{activity.seconds} {__kbUi('soniya')}</span></div>}
   <label className="block text-sm font-semibold text-slate-700">{__kbUi('Gapiradigan tilingiz')}<select value={dictationLanguage==='auto'&&!autoDictation?'uz':dictationLanguage} disabled={dictationBusy} onChange={event=>setDictationLanguage(event.target.value)} className="mt-2 block w-full rounded-xl border p-2.5">{['uz','ru','en'].map(code=><option key={code} value={code}>{__kbUi(languageNames[code])}</option>)}{autoDictation&&<option value="auto">{__kbUi('Avtomatik aniqlash')}</option>}</select></label>
   <details><summary className="cursor-pointer text-sm text-slate-600">{__kbUi('Boshqa yozish usulini tanlash')}</summary><div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={__kbUi('Gapirib yozish usuli')}>{[['live','Gapirib yozish'],['recording','Ovoz yozib yuborish'],['browser','Brauzer orqali yozish']].filter(([key])=>support[key]).map(([key,label])=><button key={key} type="button" disabled={dictationBusy} aria-pressed={selectedMethod===key} className={`${button} ${selectedMethod===key?'!border-sky-800 !bg-sky-50':''}`} onClick={()=>{setMethod(key);if(key==='browser'&&dictationLanguage==='auto')setDictationLanguage('uz');setError('');}}>{__kbUi(label)}</button>)}</div></details>
   <label className="flex gap-2 text-sm text-slate-700"><input type="checkbox" checked={commands} disabled={dictationBusy} onChange={event=>setCommands(event.target.checked)}/>{__kbUi("“Nuqta”, “vergul”, “so‘roq belgisi”, “yangi abzas” buyruqlarini tinish belgilariga aylantirish")}</label>
   <p className="text-xs text-slate-500">{autoDictation?__kbUi('Har yozuv 2 daqiqagacha. Ovozingiz Groq xizmatida matnga aylantiriladi.'):__kbUi('Brauzer ovozni o‘z tanish xizmatiga yuborishi mumkin.')}</p>
   {interim&&<p aria-live="polite" className="rounded-xl bg-sky-50 p-3 text-sm italic text-slate-500">{interim}</p>}
   <label className="block text-sm font-semibold text-slate-700">{__kbUi("Yozilgan matn")}<textarea value={dictation} readOnly={dictationBusy} onChange={event=>setDictation(event.target.value)} rows={10} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base font-normal leading-relaxed" placeholder={__kbUi("Gapirganlaringiz shu yerda yoziladi…")}/></label>
   <div className="flex flex-wrap gap-2">
    <button type="button" className={button} disabled={!dictation||dictationBusy} onClick={()=>copy(dictation)}>{__kbUi("Nusxalash")}</button>
    <button type="button" className={button} disabled={!dictation||dictationBusy} onClick={()=>saveText(dictation)}>{__kbUi("TXT yuklash")}</button>
    <button type="button" className={button} disabled={!dictation||dictationBusy||dictation.length>50000} onClick={()=>{setText(dictation);switchMode('read');}}>{__kbUi("Matnni o‘qishga yuborish")}</button>
    <button type="button" className={button} disabled={!dictation&&!interim&&!savedAudio&&!dictationBusy} onClick={clearDictation}>{__kbUi("Tozalash")}</button>
   </div>
   <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <label className="block text-sm font-semibold text-slate-700">{__kbUi('Tayyor ovoz yozuvini matnga aylantirish')}<input type="file" accept="audio/*,.mp3,.mpga,.mpeg,.m4a,.mp4,.wav,.webm,.ogg,.flac" disabled={!access?.admin||!access?.dictation_available||dictationBusy} className="mt-2 block w-full text-sm" onChange={selectAudio}/></label>
    <label className="block text-sm font-semibold text-slate-700">{__kbUi('Telefon diktofonidan yozish')}<input type="file" accept="audio/*" capture="user" disabled={!access?.admin||!access?.dictation_available||dictationBusy} className="mt-2 block w-full text-sm" onChange={selectAudio}/></label>
    <p className="text-xs text-slate-500">{__kbUi('MP3, WAV, M4A, MP4, WEBM, OGG yoki FLAC · 8 MB gacha. Faylni tanlang, tilni belgilang va “Matnga aylantirish”ni bosing.')}</p>
    {access&&!access.dictation_available&&<p role="alert" className="text-sm text-amber-800">{__kbUi('Ovoz faylini matnga aylantirish xizmati ulanmagan. Backendda GROQ_API_KEY sozlanishi kerak.')}</p>}
    {savedAudio&&<div className="space-y-2">
     <p className="text-sm text-slate-700">{__kbUi('Yozuv shu oynada saqlangan. Xato chiqsa, qaytadan gapirmasdan yana yuborishingiz mumkin.')}</p>
     {audioUrl&&!dictationBusy&&<audio aria-label={__kbUi('Saqlangan ovoz yozuvi')} controls preload="metadata" src={audioUrl} className="w-full"/>}
     <div className="flex flex-wrap gap-2"><button type="button" className={`${button} !bg-sky-900 !text-white`} disabled={dictationBusy||!access?.dictation_available} onClick={convertSaved}>{__kbUi('Matnga aylantirish')}</button>
      {audioUrl&&<a className={button} href={audioUrl} download={`ovoz.${savedAudio.blob.type.includes('mp4')?'mp4':savedAudio.blob.type.includes('m4a')?'m4a':savedAudio.blob.type.includes('ogg')?'ogg':savedAudio.blob.type.includes('wav')?'wav':savedAudio.blob.type.includes('mpeg')||savedAudio.blob.type.includes('mp3')?'mp3':savedAudio.blob.type.includes('flac')?'flac':'webm'}`}>{__kbUi('Yozuvni yuklab olish')}</a>}
      <button type="button" className={button} disabled={dictationBusy} onClick={()=>audioDictationRef.current.discard()}>{__kbUi('Yozuvni olib tashlash')}</button></div>
    </div>}
   </div>
   <p className="text-xs text-slate-500">{__kbUi("Yakuniy matnni tekshirib tahrirlashingiz mumkin. Tinish belgisi buyruqlari o‘zbekcha matnga qo‘llanadi.")}</p>
  </section>
 </div>;
}
