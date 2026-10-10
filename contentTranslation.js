import {TRANSLATION_API,onTranslationSessionChange} from './interfaceRuntime.js';
let sessionToken='',cache=new Map(),inflight=new Map();const controllers=new Set();
export function clearContentTranslations(){sessionToken='';cache=new Map();inflight=new Map();for(const c of controllers)c.abort();controllers.clear();}
onTranslationSessionChange(clearContentTranslations);
export function splitTranslationContent(value,max=3500){
 const text=String(value??'');if(text.length<=max)return [text];
 const blocks=/```[\s\S]*?```|\[lat\][\s\S]*?\[\/lat\]|\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g;
 const ranges=[...text.matchAll(blocks)].map(m=>[m.index,m.index+m[0].length]),chunks=[];let start=0;
 while(start<text.length){let end=Math.min(start+max,text.length);const inside=ranges.find(([a,b])=>a<end&&b>end);if(inside)end=inside[0]>start?inside[0]:inside[1];
  if(end<text.length&&!inside){const space=text.lastIndexOf(' ',end);if(space>start+max/2)end=space+1;}if(end-start>12000)throw Error('content_too_long');chunks.push(text.slice(start,end));start=end;
 }return chunks;
}
export async function translateContentText(text,target,token,fetcher=fetch){
 if(!token)throw Error('sign_in');if(typeof text!=='string'||!text.trim())return text;if(text.length>100000)throw Error('content_too_long');
 if(sessionToken!==token){clearContentTranslations();sessionToken=token;}
 const ownCache=cache,ownInflight=inflight,key=JSON.stringify([target,text]);if(ownCache.has(key))return ownCache.get(key);if(ownInflight.has(key))return ownInflight.get(key);
 const promise=(async()=>{
  const chunks=splitTranslationContent(text),results=[];
  for(let i=0;i<chunks.length;){
   if(!chunks[i].trim()){results.push(chunks[i++]);continue;}
   const batch=[];let count=0;while(i<chunks.length&&chunks[i].trim()&&batch.length<30&&(!batch.length||count+chunks[i].length<=18000)){count+=chunks[i].length;batch.push(chunks[i++]);}
   const c=new AbortController(),timeout=setTimeout(()=>c.abort(),22000);controllers.add(c);
   try{const r=await fetcher(`${TRANSLATION_API}/api/translation/content`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},signal:c.signal,cache:'no-store',body:JSON.stringify({target,texts:batch,consent:true})});
    if(!r.ok)throw Error(r.status===401?'sign_in':'translation_unavailable');const data=await r.json();if(!Array.isArray(data.translations)||data.translations.length!==batch.length||data.translations.some(x=>typeof x!=='string'))throw Error('translation_unavailable');
    results.push(...data.translations.map((value,j)=>(batch[j].match(/^\s*/)?.[0]||'')+value.trim()+(batch[j].match(/\s*$/)?.[0]||'')));
   }finally{clearTimeout(timeout);controllers.delete(c);}
  }
  const result=results.join('');if(sessionToken===token){ownCache.set(key,result);while(ownCache.size>300)ownCache.delete(ownCache.keys().next().value);}return result;
 })();ownInflight.set(key,promise);try{return await promise;}finally{ownInflight.delete(key);}
}
