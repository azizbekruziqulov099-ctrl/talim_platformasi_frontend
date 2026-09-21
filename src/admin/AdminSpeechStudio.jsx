import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React,{useEffect,useRef,useState} from 'react';
import {appendDictation,readingChunks,recognitionError} from './speechText.js';
import {SpeechReader} from './speechReader.js';

export default function AdminSpeechStudio({apiBase,token}) {
  useKbInterfaceLocale();
 const [access,setAccess]=useState(null);
 const [mode,setMode]=useState('read');
 const [text,setText]=useState('');
 const [voice,setVoice]=useState('qiz');
 const [rate,setRate]=useState(1);
 const [reading,setReading]=useState('idle');
 const [progress,setProgress]=useState([0,0]);
 const [dictation,setDictation]=useState('');
 const [interim,setInterim]=useState('');
 const [listening,setListening]=useState(false);
 const [commands,setCommands]=useState(true);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const readerRef=useRef(null);
 const recognitionRef=useRef(null);
 const Recognition=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition;
 useEffect(()=>{
  const controller=new AbortController();
  setAccess(null);setError('');
  fetch(`${apiBase}/api/admin/speech/status?${new URLSearchParams({token})}`,{signal:controller.signal})
   .then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.detail||'Admin ruxsati tasdiqlanmadi');return data;})
   .then(data=>{if(!controller.signal.aborted)setAccess(data);})
   .catch(err=>{if(!controller.signal.aborted)setError(err.message);});
  const reader=new SpeechReader({onState:setReading,onProgress:(done,total)=>setProgress([done,total]),onError:setError,
   fetchAudio:async(value,speaker,signal)=>{
    const response=await fetch(`${apiBase}/api/admin/speech/read?${new URLSearchParams({token})}`,{
     method:'POST',headers:{'Content-Type':'application/json'},signal,body:JSON.stringify({text:value,voice:speaker})});
    if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.detail||'Ovoz xizmati javob bermadi');}
    return response.blob();
   }});
  readerRef.current=reader;
  return()=>{controller.abort();reader.dispose();const rec=recognitionRef.current;if(rec){rec.onresult=rec.onend=rec.onerror=null;rec.abort();recognitionRef.current=null;}};
 },[apiBase,token]);
 const stopDictation=()=>{recognitionRef.current?.stop();};
 const switchMode=value=>{readerRef.current?.stop();stopDictation();setMode(value);setError('');setNotice('');};
 const startReading=()=>{
  if(!access?.admin||!text.trim())return;
  setError('');setNotice('');readerRef.current.start(readingChunks(text),{voice,rate});
 };
 const startDictation=()=>{
  if(!access?.admin||!Recognition||recognitionRef.current)return;
  readerRef.current?.stop();setError('');setNotice('');setInterim('');
  const rec=new Recognition();recognitionRef.current=rec;
  rec.lang='uz-UZ';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;
  if('unspokenPunctuation' in rec)rec.unspokenPunctuation=true;
  const completed=new Set();
  rec.onresult=event=>{
   let pending='';
   for(let i=event.resultIndex;i<event.results.length;i++){
    const result=event.results[i];
    if(result.isFinal&&!completed.has(i)){completed.add(i);setDictation(old=>appendDictation(old,result[0].transcript,commands));}
    else if(!result.isFinal)pending+=`${result[0].transcript} `;
   }
   setInterim(pending.trim());
  };
  rec.onerror=event=>{if(event.error!=='aborted')setError(recognitionError(event.error));};
  rec.onend=()=>{recognitionRef.current=null;setListening(false);setInterim('');};
  try{rec.start();setListening(true);}catch(err){recognitionRef.current=null;setListening(false);setError(err.message||'Mikrofon ochilmadi');}
 };
 const copy=async value=>{
  try{await navigator.clipboard.writeText(value);setNotice('Matn nusxalandi.');}catch{setError('Nusxalash amalga oshmadi. Matnni belgilab nusxalang.');}
 };
 const saveText=value=>{
  const url=URL.createObjectURL(new Blob([value],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='ozbekcha-matn.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const button='rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-40';
 return <div className="mx-auto max-w-4xl space-y-5">
  <div><h2 className="text-xl font-bold text-slate-800">{__kbUi("Ovozli matn")}</h2><p className="mt-1 text-sm text-slate-600">{__kbUi("Admin uchun o‘zbekcha matnni o‘qish va ovozdan matn yozish.")}</p></div>
  <div className="grid grid-cols-2 gap-2" role="group" aria-label={__kbUi("Ovozli matn rejimi")}>
   {[['read','Matnni o‘qish'],['dictate','Gapirib yozish']].map(([key,label])=><button key={key} type="button" onClick={()=>switchMode(key)} aria-pressed={mode===key}
    className={`${button} ${mode===key?'!border-sky-800 !bg-sky-900 !text-white':''}`}>{__kbUi(label)}</button>)}
  </div>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{__kbUi(error)}</p>}
  {notice&&<p role="status" className="text-sm text-green-800">{__kbUi(notice)}</p>}
  {!access&&!error&&<p role="status" className="text-sm text-slate-500">{__kbUi("Admin ruxsati tekshirilmoqda…")}</p>}
  {mode==='read'?<section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
   <label className="block text-sm font-semibold text-slate-700">{__kbUi("O‘qiladigan matn")}<textarea value={text} onChange={event=>setText(event.target.value)} disabled={reading!=='idle'} maxLength={50000} rows={11}
     placeholder={__kbUi("Matnni shu yerga yozing yoki joylang. Nuqta, vergul va abzaslarni saqlang.")}
     className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base font-normal leading-relaxed disabled:bg-slate-50"/>
   </label>
   <p className="text-xs text-slate-500">{__kbUi(text.length.toLocaleString())}{__kbUi(" / 50 000 belgi. Abzaslar orasida alohida pauza qilinadi.")}</p>
   <div className="grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-semibold text-slate-700">{__kbUi("Ovoz")}<select value={voice} onChange={event=>setVoice(event.target.value)} disabled={reading!=='idle'} className="mt-2 block w-full rounded-xl border p-2.5"><option value="qiz">{__kbUi("Madina — ayol ovozi")}</option><option value="ogil">{__kbUi("Sardor — erkak ovozi")}</option></select></label>
    <label className="text-sm font-semibold text-slate-700">{__kbUi("Tezlik: ")}{rate.toFixed(2)}×<input type="range" min="0.5" max="2" step="0.05" value={rate} onChange={event=>{const value=Number(event.target.value);setRate(value);readerRef.current?.setRate(value);}} className="mt-4 block w-full"/><span className="mt-1 flex justify-between text-xs font-normal text-slate-500"><span>{__kbUi("Sekin")}</span><span>{__kbUi("Tez")}</span></span></label>
   </div>
   <div className="flex flex-wrap gap-2">
    {reading==='idle'?<button type="button" className={`${button} !bg-sky-900 !text-white`} disabled={!access?.reading_available||!text.trim()} onClick={startReading}>{__kbUi("Ovoz chiqarib o‘qish")}</button>
     : reading==='paused'?<button type="button" className={button} onClick={()=>{setError('');readerRef.current.resume();}}>{__kbUi("Davom ettirish")}</button>
      : <button type="button" className={button} onClick={()=>readerRef.current.pause()}>{__kbUi("Pauza")}</button>}
    <button type="button" className={button} disabled={reading==='idle'} onClick={()=>readerRef.current.stop()}>{__kbUi("To‘xtatish")}</button>
   </div>
   <p role="status" className="text-xs text-slate-500">{reading==='loading'?__kbUi('Ovoz tayyorlanmoqda…'):reading==='playing'?__kbUi('O‘qilmoqda'):reading==='paused'?__kbUi('Pauza'):__kbUi('')}{progress[1]>0?__kbUi(` · ${progress[0]} / ${progress[1]} bo‘lak o‘qildi`):__kbUi('')}</p>
   {access&&!access.reading_available&&<p className="text-sm text-amber-800">{__kbUi("Serverda ovoz xizmati mavjud emas. Yangilanishdagi backend paketlarini o‘rnating.")}</p>}
  </section>:<section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
   <p className="text-sm text-slate-600">{__kbUi("Mikrofonni yoqing va o‘zbekcha gapiring. Matn paydo bo‘lgach, uni tahrirlashingiz mumkin. Brauzer ovozni tanish uchun o‘z xizmatiga yuborishi mumkin.")}</p>
   {!Recognition&&<p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{__kbUi("Bu brauzer ovozni matnga aylantirishni qo‘llamaydi. Saytni mikrofon va o‘zbekcha ovoz tanishni qo‘llaydigan brauzerda oching.")}</p>}
   <label className="flex gap-2 text-sm text-slate-700"><input type="checkbox" checked={commands} disabled={listening} onChange={event=>setCommands(event.target.checked)}/>{__kbUi("“Nuqta”, “vergul”, “so‘roq belgisi”, “yangi abzas” buyruqlarini tinish belgilariga aylantirish")}</label>
   <div className="flex flex-wrap items-center gap-3"><button type="button" className={`${button} !bg-sky-900 !text-white`} disabled={!access?.admin||!Recognition} onClick={listening?stopDictation:startDictation}>{listening?__kbUi('Yozishni to‘xtatish'):__kbUi('Mikrofonni yoqish')}</button><span role="status" className="text-sm text-slate-500">{listening?__kbUi('Tinglanmoqda…'):__kbUi('Til: o‘zbekcha')}</span></div>
   {interim&&<p aria-live="polite" className="rounded-xl bg-sky-50 p-3 text-sm italic text-slate-500">{interim}</p>}
   <label className="block text-sm font-semibold text-slate-700">{__kbUi("Yozilgan matn")}<textarea value={dictation} readOnly={listening} onChange={event=>setDictation(event.target.value)} rows={10} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base font-normal leading-relaxed" placeholder={__kbUi("Gapirganlaringiz shu yerda yoziladi…")}/></label>
   <div className="flex flex-wrap gap-2">
    <button type="button" className={button} disabled={!dictation||listening} onClick={()=>copy(dictation)}>{__kbUi("Nusxalash")}</button>
    <button type="button" className={button} disabled={!dictation||listening} onClick={()=>saveText(dictation)}>{__kbUi("TXT yuklash")}</button>
    <button type="button" className={button} disabled={!dictation||listening||dictation.length>50000} onClick={()=>{setText(dictation);switchMode('read');}}>{__kbUi("Matnni o‘qishga yuborish")}</button>
    <button type="button" className={button} disabled={!dictation||listening} onClick={()=>setDictation('')}>{__kbUi("Tozalash")}</button>
   </div>
   <p className="text-xs text-slate-500">{__kbUi("Tinish belgilarini avtomatik qo‘yish va o‘zbekcha tanish sifati brauzerga bog‘liq. Yakuniy matnni tekshirib tahrirlashingiz mumkin.")}</p>
  </section>}
 </div>;
}
