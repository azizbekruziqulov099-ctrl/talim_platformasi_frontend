import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareSpeech,normalizeUzbek} from './speech/pronunciation.js';
import {speakFormula,numberWords} from './speech/mathSpeech.js';
import {splitSpeechText} from './speech/language.js';
import {readingChunks} from './admin/speechText.js';
import {assistantSpeechChunks} from './assistant/assistantRules.js';

test('every supported apostrophe keeps the Uzbek letter; c is si but ch and words are unchanged',()=>{
 for(const mark of ["'",'‘','’','ʻ','ʼ','`','´','′','ʹ','＇'])assert.equal(prepareSpeech(`G${mark}isht o${mark}quvchi`),'Gʻisht oʻquvchi');
 assert.equal(prepareSpeech('c C ch Ch celsius abc'),'si si ch Ch celsius abc');
 assert.equal(normalizeUzbek('g o'),'g o');
});
test('leading/trailing decimal zeroes and negative zero are precise on repeated reading',()=>{
 for(let i=0;i<3;i++)assert.equal(prepareSpeech('0,0001. 0.0001; -0,0001.'),'nol butun oʻn mingdan bir. nol butun oʻn mingdan bir; minus nol butun oʻn mingdan bir.');
 assert.equal(numberWords('1.0010','uz'),'bir butun o‘n mingdan o‘n');
 assert.equal(numberWords('0.0000001','uz'),'nol butun o‘n milliondan bir');
 assert.equal(numberWords('-0.0001','en'),'minus zero point zero zero zero one');
});
test('school, course and grade ordinals are expanded before subtraction',()=>{
 assert.equal(prepareSpeech('1-maktab, 2-sinf, 6-kurs, 21-maktabda.'),'birinchi maktab, ikkinchi sinf, oltinchi kurs, yigirma birinchi maktabda.');
 assert.equal(prepareSpeech('1-2=-1'),'bir minus ikki teng minus bir');
 assert.equal(prepareSpeech('ko‘p-qavatli'),'koʻp-qavatli');
});
test('formula variables, nested fractions, grouped decimals and literal text keep their meaning',()=>{
 assert.equal(prepareSpeech('[lat]x+y+c=0{,}0001[/lat]'),'iks plyus igrik plyus si teng nol butun oʻn mingdan bir');
 assert.match(speakFormula(String.raw`\frac{x+1}{\sqrt{\frac{2}{3}}}`,'ru'),/числителе икс плюс один.*знаменателе квадратный корень/);
 assert.equal(prepareSpeech(String.raw`[lat]\text{g‘isht, o‘quvchi}[/lat]`),'gʻisht, oʻquvchi');
 assert.equal(speakFormula("x'",'uz'),'iks shtrix');
 assert.equal(prepareSpeech(String.raw`2\frac{1}{2}; x^2`),'ikki butun ikkidan bir; iksning kvadrati');
 assert.throws(()=>speakFormula(String.raw`\sqrt{`.repeat(70)+'2'+'}'.repeat(70)),/chuqur/);
});
test('only explicit tags switch reading language, including formulas and chunk boundaries',()=>{
 const source='Hello world. Русский текст. [ru][lat]x+y[/lat][/ru] [en][lat]x+y[/lat][/en] [lat]x+y[/lat]';
 const pieces=splitSpeechText(source);assert.deepEqual(pieces.map(p=>p.til),['uz','uz','ru','en','uz']);
 assert.equal(prepareSpeech(pieces[2].matn,pieces[2].til),'икс плюс игрек');assert.equal(prepareSpeech(pieces[3].matn,pieces[3].til),'x plus why');
 assert.equal(prepareSpeech(pieces[4].matn,pieces[4].til),'iks plyus igrik');
 assert.ok(readingChunks('Hello. '.repeat(300)).every(p=>p.language==='uz'&&p.text.length<=1200));
});
test('assistant reading keeps multiplication, Uzbek backtick letters and complete formula tags',()=>{
 const source="**Misol:** g`isht [lat]x*y+0,0001[/lat] [ru][lat]x+y[/lat][/ru]";
 const chunks=assistantSpeechChunks(source,50);
 assert.ok(chunks.some(c=>c.includes('[lat]x*y+0,0001[/lat]')));
 assert.ok(chunks.some(c=>c.includes('g`isht')));assert.ok(chunks.some(c=>c==='[ru][lat]x+y[/lat][/ru]'));
});
