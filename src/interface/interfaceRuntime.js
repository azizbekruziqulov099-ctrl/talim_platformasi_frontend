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
function enqueue(target,source){if(status==='unconfigured'||(blocked.get(target)||0)>Date.now())return;pending.set(cacheKey(target,source),{target,source});schedule();}
export async function checkTranslationService(fetcher=fetch){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
 try{const r=await fetcher(`${TRANSLATION_API}/api/translation/status`,{cache:'no-store',signal:controller.signal});if(!r.ok)throw Error('unavailable');status=(await r.json()).configured?'ready':'unconfigured';if(status==='ready'){blocked.clear();schedule();}}
 catch{status='unavailable';}finally{clearTimeout(timeout);}emit();return status;
}
async function flush(){
 timer=null;if(active||!pending.size)return;
 const target=pending.values().next().value.target,entries=[];let count=0;
 for(const [key,item]of pending){if(item.target!==target)continue;if(entries.length&&(count+item.source.length>18000||entries.length>=50))break;entries.push([key,item]);count+=item.source.length;pending.delete(key);}
 active=true;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const r=await fetch(`${TRANSLATION_API}/api/translation/interface`,{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({target,texts:entries.map(([,x])=>x.source)})});
  if(!r.ok)throw Error('translation');const data=await r.json();
  if(!Array.isArray(data.translations)||data.translations.length!==entries.length)throw Error('translation');
  data.translations.forEach((value,i)=>{if(typeof value!=='string'||!samePlaceholders(entries[i][1].source,value))throw Error('placeholders');});
  data.translations.forEach((value,i)=>translated.set(entries[i][0],value));while(translated.size>24000)translated.delete(translated.keys().next().value);status='ready';emit();
 }catch{blocked.set(target,Date.now()+60000);for(const [k,x]of pending)if(x.target===target)pending.delete(k);status='unavailable';emit();}
 finally{clearTimeout(timeout);active=false;if(pending.size)schedule();}
}
export function translateUi(text,target='uz',values){
 if(typeof text!=='string')return text;text=INTERFACE_ENUMS[text]||text;let output=text;
 if(target!=='uz'){
  if(hasInterfaceTranslation(text))output=translateInterface(text,target);
  else{const message=resolveInterfaceMessage(text);if(message){
   let result;if(hasInterfaceTranslation(message.source))result=translateInterface(message.source,target);else if(target==='uz-Cyrl')result=uzbekInterfaceCyrillic(message.source);else result=translated.get(cacheKey(target,message.source));
   if(result!==undefined)output=(text.match(/^\s*/)?.[0]||'')+fillInterfaceMessage(result,message.values)+(text.match(/\s*$/)?.[0]||'');else enqueue(target,message.source);
  }}
 }
 if(values&&typeof values==='object')output=output.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g,(m,k)=>Object.hasOwn(values,k)?String(values[k]):m);return output;
}
export const uiText=text=>translateUi(text,locale);
export function installInterfaceTranslations(target,entries){for(const[source,value]of Object.entries(entries)){const key=normalizeInterfaceKey(source);if(registered.has(key)&&samePlaceholders(key,value))translated.set(cacheKey(target,key),value);}emit();}
export function resetTranslationRuntime(){clearTimeout(timer);timer=null;pending.clear();translated.clear();blocked.clear();resolved.clear();locale='uz';status='unknown';}
export async function flushInterfaceTranslations(){clearTimeout(timer);timer=null;await flush();}
