import data from './mathWords.json' with {type:'json'};
import {mathSpans,speakMathTags,speakFormula,integerWords,numberWords} from './mathSpeech.js';
import {protectSpeechMath} from './language.js';
export const SPEECH_REVISION='64';
export const normalizeUzbek=value=>String(value||'').replace(/([oOgG])['‘’ʻʼ`´′ʹ＇]+/g,'$1ʻ');
export const ordinalUzbek=value=>{const word=integerWords(value,'uz');return word+(/[aiou]$/.test(word)?'nchi':'inchi');};
function tagRawMath(value){
 const {text:source,restore}=protectSpeechMath(value),parts=[];let previous=0;
 const args={frac:2,dfrac:2,tfrac:2,cfrac:2,binom:2,sqrt:1,text:1,mathrm:1,mathbf:1,vec:1,overline:1,bar:1,dot:1};
 const group=(pos,opening='{',closing='}')=>{
  while(pos<source.length&&/\s/.test(source[pos]))pos++;
  if(source[pos]!==opening)return pos;let depth=1;pos++;
  while(pos<source.length&&depth){if(source[pos]===opening)depth++;else if(source[pos]===closing)depth--;pos++;}return pos;
 };
 for(const match of source.matchAll(/\\([A-Za-z]+)/g)){
  if(match.index<previous)continue;let start=match.index,end=match.index+match[0].length;
  if(['frac','dfrac','tfrac','cfrac'].includes(match[1])){const whole=source.slice(previous,start).match(/(?<![\p{L}\p{N}_.,])\d+\s*$/u);if(whole)start=previous+whole.index;}
  if(match[1]==='sqrt'&&source[end]==='[')end=group(end,'[',']');
  for(let i=0;i<(args[match[1]]||0);i++)end=group(end);
  while(end<source.length&&['_','^'].includes(source[end])){end++;end=source[end]==='{'?group(end):Math.min(end+1,source.length);}
  parts.push(source.slice(previous,start),'[lat]'+source.slice(start,end)+'[/lat]');previous=end;
 }
 parts.push(source.slice(previous));return restore(parts.join(''));
}
function prose(value,lang){
 let text=value.replace(/<(?:\/?[A-Za-z][^>]*|!--[\s\S]*?--)>/g,' ').replace(/\[\/?(?:uz|ru|en)\]/gi,'').replace(/https?:\/\/\S+|www\.\S+/g,' ');
 text=text.replace(/(?<![\p{L}\p{N}_])(?:[A-Za-z]|\d+)\s*\^\s*(?:\{[A-Za-z0-9+ -]+\}|[A-Za-z]|\d+)/gu,part=>speakFormula(part,lang));
 if(lang==='uz'){
  text=normalizeUzbek(text);
  text=text.replace(/°\s*C\b/g,' daraja Selsiy ');
  text=text.replace(/(?<![\p{L}\p{N}_.,])([0-9]{1,9})\s*[-‑–]\s*(maktab|sinf|kurs|dars|mashq|savol|misol|bob|bet|mavzu|qism|topshiriq|chorak|semestr|o‘rin|oʻrin|qavat|sahifa|yil|kun|son)(?=[\p{L}]*\b)/giu,(_,n,noun)=>ordinalUzbek(n)+' '+noun);
  text=text.replace(/(?<![\p{L}\p{N}_ʻʼ])c(?![\p{L}\p{N}_ʻʼ])/giu,'si');
  const units={'km/soat':'kilometr soatiga','sm²':'kvadrat santimetr','sm2':'kvadrat santimetr','m²':'kvadrat metr','m2':'kvadrat metr',
   'sm³':'kub santimetr','sm3':'kub santimetr','m³':'kub metr','m3':'kub metr','kg':'kilogramm','gr':'gramm','mm':'millimetr','sm':'santimetr','km':'kilometr','ml':'millilitr','l':'litr','m':'metr'};
  for(const [unit,word] of Object.entries(units))text=text.replace(new RegExp(`(?<![\\p{L}])${unit}(?![\\p{L}\\p{N}_])`,'gu'),' '+word+' ');
 }
 for(const [symbol,key] of Object.entries(data.SYMBOLS)){
  if(symbol==='-')text=text.replace(/(?<!\p{L})-|-(?!\p{L})/gu,' '+data.WORDS[lang][key]+' ');
  else text=text.split(symbol).join(' '+data.WORDS[lang][key]+' ');
 }
 text=text.replace(/(?<![\p{L}\p{N}_])(?<!\d[.,])\d+(?:[.,]\d+)?(?!\d|[.,]\d)/gu,n=>numberWords(n,lang));
 return text.replace(/_{2,}/g,{uz:' bo‘sh joy ',ru:' пропуск ',en:' blank '}[lang]);
}
export function prepareSpeech(value,lang='uz'){
 lang=data.WORDS[lang]?lang:'uz';value=tagRawMath(String(value||''));let previous=0;const parts=[];
 for(const match of value.matchAll(mathSpans())){parts.push(prose(value.slice(previous,match.index),lang),speakMathTags(match[0],lang));previous=match.index+match[0].length;}
 parts.push(prose(value.slice(previous),lang));let text=parts.join('');if(lang==='uz')text=normalizeUzbek(text);
 return text.replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim();
}
