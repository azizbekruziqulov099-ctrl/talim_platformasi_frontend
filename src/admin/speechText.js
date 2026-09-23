import {detectSpeechLanguage,splitSpeechText,protectSpeechMath} from '../speech/language.js';

// Resolve language tags BEFORE splitting paragraphs and request-size boundaries.
// Each request carries its language, including number-only chunks inside a tag.
export function readingChunks(value,max=1200,language='auto') {
 if(!Number.isInteger(max)||max<20)throw new Error('Invalid chunk size');
 if(!['auto','uz','ru','en'].includes(language))throw new Error('O‘qish tilini tanlang');
 const result=[];
 const original=String(value||'').replace(/\r\n?/g,'\n');
 const protectedMath=protectSpeechMath(original);
 const source=protectedMath.text;
 const fallback=detectSpeechLanguage(original.replace(/\[\/?(?:uz|ru|en)\]/gi,''));
 const append=(value,explicit)=>{
 for(const paragraph of value.split(/\n+/)) {
  const first=result.length;
  const detected=explicit||language!=='auto'
   ? [{matn:paragraph,til:explicit||language}]
   : splitSpeechText(paragraph,fallback);
  const parts=[];
  for(const part of detected) {
   if(parts.length&&parts.at(-1).til===part.til)parts.at(-1).matn+=' '+part.matn;
   else parts.push({...part});
  }
  for(const part of parts) {
  const paragraph=protectedMath.restore(part.matn);
  let rest=paragraph.trim();
  while(rest.length>max) {
   const window=rest.slice(0,max+1);
   const ends=[...window.matchAll(/[.!?;:](?:[”"’']?)(?=\s)/g)];
   let end=ends.length?ends.at(-1).index+ends.at(-1)[0].length:window.lastIndexOf(' ');
   if(end<max/3)end=max;
   // A formula is one reading unit: never split a fraction, root or its tags.
   const formulas=[...rest.matchAll(/\[lat\][\s\S]*?\[\/lat\]|\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/gi)];
   const crossing=formulas.find(formula=>formula.index<end&&formula.index+formula[0].length>end);
   if(crossing){
    if(crossing.index>0)end=crossing.index;
    else if(crossing[0].length<=max)end=crossing[0].length;
    else throw new Error('Bitta formula juda uzun. Uni alohida qisqaroq formulalarga ajrating.');
   }
   if(/[\uD800-\uDBFF]/.test(rest[end-1]))end--;
   result.push({text:rest.slice(0,end).trim(),language:part.til,pauseMs:0});rest=rest.slice(end).trim();
  }
  if(rest)result.push({text:rest,language:part.til,pauseMs:0});
  }
  if(result.length>first)result.at(-1).pauseMs=450;
 }
 };
 const tags=/\[(uz|en|ru)\]([\s\S]*?)\[\/\1\]/gi;
 let previous=0,match;
 while((match=tags.exec(source))) {
  append(source.slice(previous,match.index));
  append(match[2],match[1].toLowerCase());previous=tags.lastIndex;
 }
 append(source.slice(previous));
 return result;
}

export function formatDictation(value,commands=true) {
 let text=String(value||'').replace(/\r\n?/g,'\n');
 // Longer spoken commands come first. Disable commands when dictating the words literally.
 if(commands) {
  const replacements=[['yangi abzas','\n\n'],['yangi xatboshi','\n\n'],['yangi qator','\n'],
   ['nuqta vergul',';'],['ikki nuqta',':'],['so‘roq belgisi','?'],["so'roq belgisi",'?'],['soʻroq belgisi','?'],
   ['undov belgisi','!'],['nuqta','.'],['vergul',',']];
  for(const [word,mark] of replacements)text=text.replace(new RegExp(`(^|\\s)${word}(?=\\s|[.,!?;:]|$)`,'gi'),(_,before)=>`${before}${mark}`);
 }
 return text.replace(/\b([og])[‘’ʻʼ`']/gi,'$1‘')
  .replace(/[ \t]+/g,' ').replace(/[ \t]*\n[ \t]*/g,'\n')
  .replace(/ +([,.;:!?])/g,'$1').replace(/([,;:!?])(?=[\p{L}])/gu,'$1 ')
  .replace(/([.!?])(?:[.!?])+/g,'$1').replace(/\n{3,}/g,'\n\n');
}
export function appendDictation(previous,segment,commands=true) {
 const part=formatDictation(segment,commands);
 const separator=!previous || /\s$/.test(previous) || /^[\s,.;:!?]/.test(part)?'':' ';
 const text=formatDictation(`${previous}${separator}${part}`,false).replace(/^\s+/,'');
 return text.replace(/(^|[.!?]\s+|\n+)([\p{L}])/gu,(_,prefix,letter)=>prefix+letter.toLocaleUpperCase('uz'));
}

export const recognitionError = code => ({
 'not-allowed':'Mikrofonga ruxsat berilmadi. Brauzer sozlamasidan mikrofonni yoqing.',
 'service-not-allowed':'Brauzer ovozni tanish xizmatiga ruxsat bermadi.',
 'audio-capture':'Mikrofon topilmadi yoki boshqa dastur band qilgan.',
 'network':'Ovozni tanish xizmati bilan aloqa uzildi. Internetni tekshirib, davom ettiring.',
 'language-not-supported':'Brauzer tanlangan tilda gapirib yozishni qo‘llamayapti. Tilni tekshiring yoki qurilmangiz klaviaturasidagi mikrofonni sinang.',
 'no-speech':'Ovoz eshitilmadi. Mikrofonga yaqinroq gapirib, qayta boshlang.',
}[code] || 'Ovozni tanib bo‘lmadi. Qayta urinib ko‘ring.');
