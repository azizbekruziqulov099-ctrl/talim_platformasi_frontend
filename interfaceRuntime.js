import SOURCES from './interfaceSources.json' with {type:'json'};
import {INTERFACE_ENUMS} from './interfaceEnums.js';
import {normalizeInterfaceKey,hasInterfaceTranslation,translateInterface,uzbekInterfaceCyrillic,registeredInterfaceLabels} from './interfaceRules.js';
export const TRANSLATION_API=(import.meta.env?.VITE_API_BASE||'https://talimplatformasi-production.up.railway.app').replace(/\/+$/,'');
const registered=new Set([...SOURCES,...registeredInterfaceLabels()].map(normalizeInterfaceKey));
const escapeRegex=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const patterns=new Map();
for(const source of registered){
 if(!/\{v\d+\}/.test(source)||!/[\p{L}]{2}/u.test(source.replace(/\{v\d+\}/g,'')))continue;
 const pieces=source.split(/(\{v\d+\})/g),keys=pieces.filter(p=>/^\{v\d+\}$/.test(p)),prefix=pieces[0],bucket=prefix?prefix[0].toLowerCase():'*';
 const row={source,keys,prefix,regex:new RegExp('^'+pieces.map(p=>/^\{v\d+\}$/.test(p)?'([\\s\\S]*?)':escapeRegex(p).replace(/'/g,"['‘’ʻʼ`]").replace(/ /g,'\\s+')).join('')+'$')};
 if(!patterns.has(bucket))patterns.set(bucket,[]);patterns.get(bucket).push(row);
}
for(const rows of patterns.values())rows.sort((a,b)=>b.prefix.length-a.prefix.length||b.source.length-a.source.length);
const resolved=new Map();
export function resolveInterfaceMessage(text){
 if(typeof text!=='string'||text.length>16000)return null;
 if(resolved.has(text))return resolved.get(text);
 const key=normalizeInterfaceKey(text);let result=null;
 if(registered.has(key))result={source:key,values:{}};
 else for(const row of [...(patterns.get(key[0]?.toLowerCase())||[]),...(patterns.get('*')||[])]){
  if(row.prefix&&!key.startsWith(row.prefix))continue;
  const match=text.trim().match(row.regex);if(!match)continue;
  const values={};let valid=true;row.keys.forEach((name,i)=>{if(Object.hasOwn(values,name)&&values[name]!==match[i+1])valid=false;values[name]=match[i+1];});
  if(valid){result={source:row.source,values};break;}
 }
 resolved.set(text,result);if(resolved.size>5000)resolved.delete(resolved.keys().next().value);return result;
}
export const fillInterfaceMessage=(text,values)=>text.replace(/\{v\d+\}/g,k=>Object.hasOwn(values,k)?values[k]:k);
export const samePlaceholders=(a,b)=>(a.match(/\{v\d+\}/g)||[]).sort().join('|')===(b.match(/\{v\d+\}/g)||[]).sort().join('|');
const translated=new Map(),pending=new Map(),blocked=new Map(),listeners=new Set(),sessionListeners=new Set();
let locale='uz',revision=0,status='unknown',token='',sessionRevision=0,timer,active=false;
const emit=()=>{revision++;for(const callback of listeners)callback();};
export const subscribeTranslation=callback=>{listeners.add(callback);return()=>listeners.delete(callback);};
export const translationSnapshot=()=>revision;
export const translationStatus=()=>status;
export const setInterfaceRuntimeLocale=value=>{locale=value;};
export const interfaceLocaleTag=()=>({uz:'uz-UZ','uz-Cyrl':'uz-Cyrl-UZ',ru:'ru-RU',en:'en-US',tr:'tr-TR',kk:'kk-KZ'}[locale]||'uz-UZ');
export const translationSession=()=>({token,revision:sessionRevision});
export const onTranslationSessionChange=cb=>{sessionListeners.add(cb);return()=>sessionListeners.delete(cb);};
export function setTranslationSession(value){if(token===(value||''))return;token=value||'';sessionRevision++;for(const cb of sessionListeners)cb();emit();}
const cacheKey=(target,source)=>`${target}\0${source}`;
function schedule(){if(!timer&&!active)timer=setTimeout(flush,40);}
function enqueue(target,source){if(target==='uz'||target==='uz-Cyrl'||(blocked.get(target)||0)>Date.now())return;loadStored(target);if(translated.has(cacheKey(target,source)))return;pending.set(cacheKey(target,source),{target,source});schedule();}

// ── Bepul brauzer tarjimasi ─────────────────────────────────────────────
// Backendda GOOGLE_TRANSLATE_API_KEY bo'lmasa ham interfeys tanlangan tilga
// o'tadi: faqat ro'yxatdan o'tgan interfeys matnlari (interfaceSources.json)
// brauzerning o'zidan Google Translate'ning bepul manziliga yuboriladi.
// Bazadagi ma'lumotlar, ismlar va {v0} qiymatlari hech qachon yuborilmaydi.
// Natija shu brauzerda saqlanadi — har bir matn bir marta tarjima qilinadi.
const BROWSER_TRANSLATE_URL='https://translate.googleapis.com/translate_a/single';
const STORE_PREFIX='kabutar:ui-translations:v1:';
const stored=new Set();let saveTimer=null;const dirty=new Set();
const PROTECT=/ZXQKB\d+QXZ|\{v\d+\}|\{[A-Za-z][A-Za-z0-9_]*\}|https?:\/\/\S+|\b(?:Kabutar|Telegram|Gmail|Google|Groq|SamTM|Excel|Word|PDF|TXT|MP3|WAV|M4A|WEBM|OGG|FLAC|ID|KB|AI|Railway|GROQ_API_KEY|GOOGLE_TRANSLATE_API_KEY|[A-Z][A-Z0-9_]{2,}_[A-Z0-9_]+)\b/g;
const MARK=/ZXQKB\s*(\d+)\s*QXZ/gi;
function storage(){try{return globalThis.localStorage||null;}catch{return null;}}
function loadStored(target){
 if(stored.has(target))return;stored.add(target);
 try{const data=JSON.parse(storage()?.getItem(STORE_PREFIX+target)||'null');
  if(data&&typeof data==='object')for(const[source,value]of Object.entries(data))if(typeof value==='string'&&registered.has(source)&&samePlaceholders(source,value)&&!translated.has(cacheKey(target,source)))translated.set(cacheKey(target,source),value);
 }catch{/* bo'sh yoki bloklangan xotira */}
}
function persist(target){
 dirty.add(target);if(saveTimer)return;
 saveTimer=setTimeout(()=>{saveTimer=null;for(const t of dirty){try{const out={};const prefix=t+'\0';let n=0;
  for(const[key,value]of translated)if(key.startsWith(prefix)){out[key.slice(prefix.length)]=value;if(++n>=12000)break;}
  storage()?.setItem(STORE_PREFIX+t,JSON.stringify(out));}catch{/* xotira to'la yoki bloklangan */}}dirty.clear();},800);
}
export function maskInterfaceText(text){const saved=[];const masked=String(text).replace(PROTECT,m=>{saved.push(m);return `ZXQKB${saved.length-1}QXZ`;});return{masked,saved};}
export function unmaskInterfaceText(text,saved){
 const seen=[];const out=String(text).replace(MARK,(m,i)=>{seen.push(Number(i));return saved[Number(i)]??m;});
 if(seen.length!==saved.length||new Set(seen).size!==saved.length)throw Error('placeholders');return out;
}
async function browserTranslateOne(target,source,fetcher,signal){
 const{masked,saved}=maskInterfaceText(source);
 if(!/\p{L}{2}/u.test(masked.replace(MARK,'')))return source; // faqat nomlar/qiymatlar — tarjima kerak emas
 const url=`${BROWSER_TRANSLATE_URL}?${new URLSearchParams({client:'gtx',sl:'uz',tl:target,dt:'t',q:masked})}`;
 const r=await fetcher(url,{signal,cache:'force-cache',credentials:'omit'});
 if(r.status===429)throw Object.assign(Error('rate'),{rate:true});
 if(!r.ok)throw Error('translation');
 const data=await r.json();
 const value=Array.isArray(data?.[0])?data[0].map(row=>Array.isArray(row)&&typeof row[0]==='string'?row[0]:'').join(''):'';
 if(!value.trim())throw Error('translation');
 return unmaskInterfaceText(value,saved).replace(/\s+([,.;:!?…])/g,'$1');
}
export async function browserTranslateTexts(target,texts,fetcher=globalThis.fetch,signal){
 const results=new Array(texts.length).fill(null);let next=0;let rate=false;
 const worker=async()=>{while(next<texts.length&&!rate&&!signal?.aborted){const i=next++;
  try{results[i]=await browserTranslateOne(target,texts[i],fetcher,signal);}catch(error){if(error?.rate)rate=true;}}};
 await Promise.all(Array.from({length:Math.min(6,texts.length)},worker));
 if(rate&&results.every(x=>x===null))throw Object.assign(Error('rate'),{rate:true});
 return results;
}
export async function checkTranslationService(fetcher=fetch){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
 try{const r=await fetcher(`${TRANSLATION_API}/api/translation/status`,{cache:'no-store',signal:controller.signal});if(!r.ok)throw Error('unavailable');status=(await r.json()).configured?'ready':'unconfigured';}
 catch{status='unavailable';}finally{clearTimeout(timeout);}
 // Backend kaliti bo'lmasa ham interfeys brauzer orqali tarjima qilinadi.
 blocked.clear();schedule();emit();return status;
}
function accept(entries,values){
 let added=0;values.forEach((value,i)=>{if(typeof value==='string'&&value.trim()&&samePlaceholders(entries[i][1].source,value)){translated.set(entries[i][0],value);added++;}});
 while(translated.size>60000)translated.delete(translated.keys().next().value);return added;
}
async function flush(){
 timer=null;if(active||!pending.size)return;
 const target=pending.values().next().value.target,entries=[];let count=0;
 for(const [key,item]of pending){if(item.target!==target)continue;if(entries.length&&(count+item.source.length>18000||entries.length>=50))break;entries.push([key,item]);count+=item.source.length;pending.delete(key);}
 active=true;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
 const texts=entries.map(([,x])=>x.source);let done=false;
 try{
  // 1) Backendda Google Cloud kaliti bo'lsa — o'sha (tez, bitta so'rov).
  if(status!=='unconfigured'&&status!=='unavailable'&&status!=='browser'){
   try{
    const r=await fetch(`${TRANSLATION_API}/api/translation/interface`,{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({target,texts})});
    if(!r.ok)throw Error('translation');const data=await r.json();
    if(!Array.isArray(data.translations)||data.translations.length!==entries.length)throw Error('translation');
    data.translations.forEach((value,i)=>{if(typeof value!=='string'||!samePlaceholders(entries[i][1].source,value))throw Error('placeholders');});
    accept(entries,data.translations);status='ready';done=true;
   }catch{if(controller.signal.aborted)throw Error('timeout');}
  }
  // 2) Aks holda — bepul, to'g'ridan-to'g'ri brauzerdan.
  if(!done){
   const values=await browserTranslateTexts(target,texts,fetch,controller.signal);
   accept(entries,values);if(status!=='ready')status='browser';
  }
  persist(target);emit();
 }catch(error){blocked.set(target,Date.now()+(error?.rate?120000:30000));for(const [k,x]of pending)if(x.target===target)pending.delete(k);emit();}
 finally{clearTimeout(timeout);active=false;if(pending.size)schedule();}
}
export function translateUi(text,target='uz',values){
 if(typeof text!=='string')return text;text=INTERFACE_ENUMS[text]||text;let output=text;
 if(target!=='uz'){
  if(hasInterfaceTranslation(text))output=translateInterface(text,target);
  else{const message=resolveInterfaceMessage(text);if(message){
   let result;if(hasInterfaceTranslation(message.source))result=translateInterface(message.source,target);else if(target==='uz-Cyrl')result=uzbekInterfaceCyrillic(message.source);else{loadStored(target);result=translated.get(cacheKey(target,message.source));}
   if(result!==undefined)output=(text.match(/^\s*/)?.[0]||'')+fillInterfaceMessage(result,message.values)+(text.match(/\s*$/)?.[0]||'');else enqueue(target,message.source);
  }}
 }
 if(values&&typeof values==='object')output=output.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g,(m,k)=>Object.hasOwn(values,k)?String(values[k]):m);return output;
}
export const uiText=text=>translateUi(text,locale);
export function installInterfaceTranslations(target,entries){for(const[source,value]of Object.entries(entries)){const key=normalizeInterfaceKey(source);if(registered.has(key)&&samePlaceholders(key,value))translated.set(cacheKey(target,key),value);}emit();}
export function resetTranslationRuntime(){clearTimeout(timer);timer=null;clearTimeout(saveTimer);saveTimer=null;dirty.clear();stored.clear();pending.clear();translated.clear();blocked.clear();resolved.clear();locale='uz';status='unknown';}
export async function flushInterfaceTranslations(){clearTimeout(timer);timer=null;await flush();}
