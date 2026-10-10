// Same vocabulary and deterministic grammar as modules/speech_math.py.
import data from './mathWords.json' with {type:'json'};
const {SMALL,TENS,HUNDREDS_RU,WORDS,SYMBOLS,COMMANDS,GREEK,GREEK_SYMBOLS,LETTERS}=data;
export const mathSpans=()=>/\[lat\][\s\S]*?\[\/lat\]|\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/gi;
const feminine=value=>value.replace(/два$/,'две').replace(/один$/,'одна');
const plural=(n,forms)=>n%100>=11&&n%100<=14?forms[2]:n%10===1?forms[0]:n%10>=2&&n%10<=4?forms[1]:forms[2];
const genitiveForms=Object.fromEntries('ноль один одна два две три четыре пять шесть семь восемь девять десять одиннадцать двенадцать тринадцать четырнадцать пятнадцать шестнадцать семнадцать восемнадцать девятнадцать двадцать тридцать сорок пятьдесят шестьдесят семьдесят восемьдесят девяносто сто двести триста четыреста пятьсот шестьсот семьсот восемьсот девятьсот тысяча тысячи миллион миллиона миллиард миллиарда'.split(' ').map((w,i)=>[w,'нуля одного одной двух двух трёх четырёх пяти шести семи восьми девяти десяти одиннадцати двенадцати тринадцати четырнадцати пятнадцати шестнадцати семнадцати восемнадцати девятнадцати двадцати тридцати сорока пятидесяти шестидесяти семидесяти восьмидесяти девяноста ста двухсот трёхсот четырёхсот пятисот шестисот семисот восьмисот девятисот тысячи тысяч миллиона миллионов миллиарда миллиардов'.split(' ')[i]]));
const genitive=value=>value.split(' ').map(w=>genitiveForms[w]||w).join(' ');
const fill=(template,values)=>template.replace(/\{(\w+)\}/g,(_,key)=>values[key]??'');
export function integerWords(value,lang='uz') {
 let n=BigInt(value);if(n<0n)return WORDS[lang].minus+' '+integerWords(-n,lang);
 if(n<BigInt(SMALL[lang].length))return SMALL[lang][Number(n)];
 if(n>=10n**18n)return String(n).split('').map(c=>SMALL[lang][Number(c)]).join(' ');
 const parts=[];
 for(const [scale,uz,en,ru] of [[10n**15n,'kvadrillion','quadrillion',['квадриллион','квадриллиона','квадриллионов']],
  [10n**12n,'trillion','trillion',['триллион','триллиона','триллионов']],
  [10n**9n,'milliard','billion',['миллиард','миллиарда','миллиардов']],
  [10n**6n,'million','million',['миллион','миллиона','миллионов']],
  [1000n,'ming','thousand',['тысяча','тысячи','тысяч']]]) {
  if(n<scale)continue;const count=n/scale;n%=scale;let words=integerWords(count,lang);
  if(lang==='ru')words=(scale===1000n?feminine(words):words)+' '+plural(Number(count),ru);
  else if(lang==='uz')words=(count===1n&&scale===1000n?'':words+' ')+uz;else words+=' '+en;
  parts.push(words);
 }
 if(n>=100n){const count=Number(n/100n);n%=100n;parts.push(lang==='ru'?HUNDREDS_RU[count]:lang==='uz'?(count===1?'':SMALL.uz[count]+' ')+'yuz':SMALL.en[count]+' hundred');}
 if(n>0n&&n<BigInt(SMALL[lang].length))parts.push(SMALL[lang][Number(n)]);
 else if(n){const count=Number(n/10n);n%=10n;parts.push(TENS[lang][count]);if(n)parts.push(SMALL[lang][Number(n)]);}
 return parts.join(' ');
}
export function numberWords(value,lang='uz') {
 value=String(value);if(value.startsWith('-'))return WORDS[lang].minus+' '+numberWords(value.slice(1),lang);
 const [whole,fraction]=value.split(/[.,]/,2),words=integerWords(whole,lang);
 if(fraction===undefined)return words;
 if(lang==='uz'&&fraction.length<=15)return `${words} butun ${integerWords(10n**BigInt(fraction.length),lang)}dan ${integerWords(fraction,lang)}`;
 return words+({uz:' vergul ',en:' point ',ru:' запятая '}[lang])+fraction.split('').map(c=>SMALL[lang][Number(c)]).join(' ');
}
class MathReader {
 constructor(value,lang){
  if(value.length>6000)throw new Error('Formula juda uzun; uni qismlarga ajrating.');
  value=value.replace(/−/g,'-').replace(/²/g,'^{2}').replace(/³/g,'^{3}').replace(/(?<=\d)\{([.,])\}(?=\d)/g,'$1');
  value=value.replace(/\\(?:left|right|displaystyle|textstyle|scriptstyle|limits)\b/g,'');
  this.source=value;this.matches=[...value.matchAll(/\\[A-Za-z]+|\\.|\d+(?:[.,]\d+)?|[A-Za-z]+|[А-Яа-яЁё]+|[^\s]/g)];
  this.tokens=this.matches.map(m=>m[0]);
  this.pos=0;this.lang=lang;this.w=WORDS[lang];
 }
 peek(){return this.tokens[this.pos]||'';}take(){const t=this.peek();if(t)this.pos++;return t;}
 sequence(close='',depth=0){
  if(depth>40)throw new Error('Formula juda chuqur ichma-ich yozilgan.');
  const parts=[];
  while(this.peek()&&this.peek()!==close){
   if(this.peek()==='/'&&parts.length){this.take();parts.push(['fraction',parts.pop(),this.atom(depth+1)]);continue;}
   const node=this.atom(depth+1);
   if(parts.at(-1)?.[0]==='number'&&node[0]==='fraction'&&this.simple(node[1])!==null&&this.simple(node[2])!==null)parts.push(['mixed',parts.pop(),node]);
   else parts.push(node);
  }
  if(close&&this.peek()===close)this.take();return ['seq',parts];
 }
 argument(depth){if(this.peek()==='{'){this.take();return this.sequence('}',depth+1);}return this.primary(depth+1);}
 primary(depth){
  if(depth>40)throw new Error('Formula juda chuqur ichma-ich yozilgan.');
  const token=this.take();if(!token)return ['text',''];
  if(['{','(','['].includes(token)){const body=this.sequence({'{':'}','(':')','[':']'}[token],depth+1);return token==='{'?body:['group',body];}
  if(token==='|')return ['absolute',this.sequence('|',depth+1)];
  const command=token.startsWith('\\')?token.slice(1):token;
  if(['frac','dfrac','tfrac','cfrac'].includes(command))return ['fraction',this.argument(depth),this.argument(depth)];
  if(command==='binom')return ['binomial',this.argument(depth),this.argument(depth)];
  if(['sqrt','√'].includes(command)){let degree=null;if(this.peek()==='['){this.take();degree=this.sequence(']',depth+1);}return ['root',this.argument(depth),degree];}
  if(['sum','prod','int','lim'].includes(command)){
   let lower=null,upper=null;while(['_','^'].includes(this.peek())){const m=this.take(),n=this.argument(depth);if(m==='_')lower=n;else upper=n;}
   return ['big',({int:'integral',lim:'limit'}[command]||command),lower,upper];
  }
  if(['vec','overline','bar','dot'].includes(command))return [({vec:'vector',bar:'overline'}[command]||command),this.argument(depth)];
  if(['mathrm','mathbf','mathit','mathbb','mathcal','operatorname'].includes(command))return this.argument(depth);
  if(['text','textrm','mbox'].includes(command)&&this.peek()==='{'){
   this.take();const opening=this.matches[this.pos-1],start=opening.index+opening[0].length;let nested=1;
   while(this.peek()&&nested){const part=this.take();if(part==='{')nested++;else if(part==='}')nested--;}
   if(nested)throw new Error('Formuladagi matn qavsi yopilmagan.');
   return ['text',this.source.slice(start,this.matches[this.pos-1].index)];
  }
  if(/^\d+(?:[.,]\d+)?$/.test(token))return ['number',token];return ['symbol',command];
 }
 atom(depth){let node=this.primary(depth);while(['^','_','!'].includes(this.peek())){const marker=this.take();node=marker==='!'?['factorial',node]:[marker==='^'?'power':'index',node,this.argument(depth)];}return node;}
 simple(node){if(node[0]==='seq'&&node[1].length===1)return this.simple(node[1][0]);return node[0]==='number'&&/^\d+$/.test(node[1])&&Number.isSafeInteger(Number(node[1]))?Number(node[1]):null;}
 render(node){
  const [kind,a,b,c]=node,w=this.w,lang=this.lang,r=n=>this.render(n),f=(key,values)=>fill(w[key],values);
  if(kind==='seq')return a.map(r).filter(Boolean).join(' ');
  if(kind==='text')return a;if(kind==='number')return numberWords(a,lang);
  if(kind==='symbol'){
   if(["'",'′','prime'].includes(a))return {uz:'shtrix',ru:'штрих',en:'prime'}[lang];
   if([',',';',':'].includes(a))return ',';if(['!','quad','qquad','enspace','thinspace',' '].includes(a))return '';
   if(a==='\\')return w.row;if(SYMBOLS[a])return w[SYMBOLS[a]];if(COMMANDS[a])return w[COMMANDS[a]];if(w[a])return w[a];
   const greek=GREEK_SYMBOLS[a]||a.toLowerCase().replace(/^var/,'');if(GREEK[greek])return GREEK[greek][{uz:0,en:1,ru:2}[lang]];
   if(/^[A-Za-z]+$/.test(a))return [...a].map(c=>LETTERS[lang][c.toLowerCase().charCodeAt(0)-97]).join(' ');return a;
  }
  if(kind==='fraction'){
   const n=this.simple(a),d=this.simple(b);
   if(n!==null&&d!==null){
    if(lang==='uz')return `${integerWords(d,lang)}dan ${integerWords(n,lang)}`;
    const forms=lang==='en'?{2:['half','halves'],3:['third','thirds'],4:['quarter','quarters'],5:['fifth','fifths'],6:['sixth','sixths'],7:['seventh','sevenths'],8:['eighth','eighths'],9:['ninth','ninths'],10:['tenth','tenths']}:{2:['вторая','вторых'],3:['третья','третьих'],4:['четвёртая','четвёртых'],5:['пятая','пятых'],6:['шестая','шестых'],7:['седьмая','седьмых'],8:['восьмая','восьмых'],9:['девятая','девятых'],10:['десятая','десятых']};
    if(forms[d])return (lang==='ru'?feminine(integerWords(n,lang)):integerWords(n,lang))+' '+forms[d][(lang==='en'?n===1:n%10===1&&n%100!==11)?0:1];
    if(lang==='en')return integerWords(n,lang)+' over '+integerWords(d,lang);
   }
   return f(kind,{a:r(a),b:r(b)});
  }
  if(kind==='mixed')return (lang==='ru'?feminine(r(a)):r(a))+({uz:' butun ',en:' and ',ru:' целых '}[lang])+r(b);
  if(kind==='root'){
   const degree=b?this.simple(b):2,key=degree===2?'root':degree===3?'cube_root':'nth_root';let value=r(a),order=b?r(b):'';
   if(lang==='ru'&&this.simple(a)!==null)value=genitive(value);
   if(key==='nth_root'&&degree!==null){
    if(lang==='uz')order+=/[aiou]$/.test(order)?'nchi':'inchi';
    if(lang==='en'&&degree>=4&&degree<=10)return ({4:'fourth',5:'fifth',6:'sixth',7:'seventh',8:'eighth',9:'ninth',10:'tenth'}[degree])+' root of '+value;
    if(lang==='ru'&&degree>=4&&degree<=10)return 'корень '+({4:'четвёртой',5:'пятой',6:'шестой',7:'седьмой',8:'восьмой',9:'девятой',10:'десятой'}[degree])+' степени из '+value;
   }
   return f(key,{x:value,n:order});
  }
  if(kind==='power'||kind==='index'){
   const value=a[0]==='group'?f('quantity',{x:r(a[1])}):r(a),n=this.simple(b),key=kind==='power'&&n===2?'squared':kind==='power'&&n===3?'cubed':kind;let exponent=r(b);
   if(kind==='power'&&exponent===w.degree)return value+' '+exponent;
   if(lang==='uz'&&kind==='power'&&n!==null&&![2,3].includes(n))exponent+=/[aiou]$/.test(exponent)?'nchi':'inchi';
   return f(key,{x:value,n:exponent});
  }
  if(kind==='big'){
   const parts=[w[a]];if(a==='limit'&&b)return parts[0]+({uz:', ',en:' as ',ru:', при условии '}[lang])+r(b);
   if(b)parts.push(f('lower',{x:r(b)}));if(c)parts.push(f('upper',{x:r(c)}));return parts.join(' ');
  }
  if(kind==='binomial')return f(kind,{n:r(a),k:r(b)});return f(kind,{x:r(a)});
 }
}
export function speakFormula(value,lang='uz'){
 lang=WORDS[lang]?lang:'uz';const reader=new MathReader(String(value),lang);
 return reader.render(reader.sequence()).replace(/\s+/g,' ').replace(/\s+([,.;:])/g,'$1').trim();
}
export function speakMathTags(value,lang='uz'){
 return String(value||'').replace(mathSpans(),raw=>{
  const formula=/^\[lat\]/i.test(raw)?raw.slice(5,-6):/^(?:\$\$|\\[([])/.test(raw)?raw.slice(2,-2):raw.slice(1,-1);
  return ' '+speakFormula(formula,lang)+' ';
 });
}
