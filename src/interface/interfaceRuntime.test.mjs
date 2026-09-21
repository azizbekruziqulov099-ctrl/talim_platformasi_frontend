import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{normalizeInterface,DEFAULT_INTERFACE,registeredInterfaceLabels,hasInterfaceTranslation}from'./interfaceRules.js';
import{translateUi,resolveInterfaceMessage,installInterfaceTranslations,resetTranslationRuntime,flushInterfaceTranslations,checkTranslationService,translationStatus,setInterfaceRuntimeLocale,interfaceLocaleTag,setTranslationSession,translationSession,subscribeTranslation,translationSnapshot}from'./interfaceRuntime.js';
import{translateContentText,clearContentTranslations,splitTranslationContent}from'./contentTranslation.js';
const response=translations=>({ok:true,json:async()=>({translations})});
test.beforeEach(()=>{resetTranslationRuntime();clearContentTranslations();setTranslationSession('');});
test.afterEach(()=>{resetTranslationRuntime();clearContentTranslations();setTranslationSession('');});
test('old settings migrate with content translation disabled',()=>{assert.equal(normalizeInterface({locale:'ru'}).translateContent,false);assert.equal(DEFAULT_INTERFACE.translateContent,false);assert.equal(normalizeInterface({translateContent:'true'}).translateContent,false);assert.equal(normalizeInterface({translateContent:true}).translateContent,true);});
test('all supported locales provide offline core labels',()=>{for(const locale of['uz-Cyrl','ru','en','tr','kk'])assert.notEqual(translateUi('Saqlash',locale),'Saqlash');});
test('unknown database text is preserved and never queued as interface',async()=>{const source='Private educational source 918273';assert.equal(resolveInterfaceMessage(source),null);assert.equal(translateUi(source,'en'),source);const old=globalThis.fetch;globalThis.fetch=()=>{throw Error('Unexpected fetch');};try{await flushInterfaceTranslations();}finally{globalThis.fetch=old;}});
test('registered dynamic values remain original and only the template is sent',async()=>{
 const full='7 ta savol',message=resolveInterfaceMessage(full);assert.ok(message);assert.equal(message.values['{v0}'],'7');
 installInterfaceTranslations('en',{[message.source]:'{v0} questions'});assert.equal(translateUi(full,'en'),'7 questions');
});
test('a private name in a dynamic message never enters the public request',async()=>{
 const full='🔑 Kirish kodi: ';assert.ok(resolveInterfaceMessage(full));
 const sources=JSON.parse(readFileSync(new URL('./interfaceSources.json',import.meta.url)));const source=sources.find(s=>s.includes('{v0}')&&s.includes('mavzu')&&!hasInterfaceTranslation(s)&&!s.includes('{v1}'));assert.ok(source);
 const input=source.replace('{v0}','PRIVATE_VALUE_93485'),message=resolveInterfaceMessage(input);assert.ok(message);const calls=[],old=globalThis.fetch;
 globalThis.fetch=async(_url,options)=>{const body=JSON.parse(options.body);calls.push(body);return response(body.texts);};
 try{translateUi(input,'en');await flushInterfaceTranslations();assert.ok(calls.length);assert.ok(calls.every(body=>!JSON.stringify(body).includes('PRIVATE_VALUE_93485')));}finally{globalThis.fetch=old;}
});
test('placeholder changes cannot corrupt displayed messages',()=>{const message=resolveInterfaceMessage('7 ta savol');installInterfaceTranslations('en',{[message.source]:'Missing number'});assert.notEqual(translateUi('7 ta savol','en'),'Missing number');});
test('interface batches contain at most 50 registered sources',async()=>{
 const sources=JSON.parse(readFileSync(new URL('./interfaceSources.json',import.meta.url))).filter(s=>!hasInterfaceTranslation(s)&&!s.includes('{')&&s.length<100).slice(0,65),calls=[],old=globalThis.fetch;
 globalThis.fetch=async(_url,options)=>{const b=JSON.parse(options.body);calls.push(b);return response(b.texts.map(x=>'EN '+x));};
 try{sources.forEach(x=>translateUi(x,'en'));await flushInterfaceTranslations();await flushInterfaceTranslations();assert.equal(calls.flatMap(x=>x.texts).length,65);assert.ok(calls.every(x=>x.texts.length<=50));assert.ok(translateUi(sources[0],'en').startsWith('EN '));}finally{globalThis.fetch=old;}
});
test('unconfigured service leaves original labels and provides status',async()=>{assert.equal(await checkTranslationService(async()=>({ok:true,json:async()=>({configured:false})})),'unconfigured');assert.equal(translationStatus(),'unconfigured');});
test('locale changes affect date formatting without changing study settings',()=>{const profile={talim_tili:'uz',semestr:1};setInterfaceRuntimeLocale('ru');assert.equal(interfaceLocaleTag(),'ru-RU');assert.deepEqual(profile,{talim_tili:'uz',semestr:1});});
test('session changes notify subscribed mounted components',()=>{let calls=0;const stop=subscribeTranslation(()=>calls++),before=translationSnapshot();setTranslationSession('a');assert.equal(calls,1);assert.ok(translationSnapshot()>before);setTranslationSession('a');assert.equal(calls,1);setTranslationSession('b');assert.equal(translationSession().token,'b');stop();});
test('content translation requires authentication before sending',async()=>{await assert.rejects(()=>translateContentText('Source','en','',()=>{throw Error('unexpected');}),/sign_in/);});
test('content request sends explicit consent and keeps original paragraphs',async()=>{let request;const result=await translateContentText('  Source\n\n','en','a',async(_url,options)=>{request=options;return response(['Translated']);});assert.equal(result,'  Translated\n\n');assert.equal(request.headers.Authorization,'Bearer a');assert.equal(JSON.parse(request.body).consent,true);assert.equal(request.cache,'no-store');});
test('content cache is reused only for the same logged-in session',async()=>{let calls=0;const fetcher=async()=>{calls++;return response(['Translated']);};await translateContentText('Source','en','a',fetcher);await translateContentText('Source','en','a',fetcher);assert.equal(calls,1);setTranslationSession('b');await translateContentText('Source','en','b',fetcher);assert.equal(calls,2);});
test('logout aborts requests and prevents old-session cache reuse',async()=>{setTranslationSession('a');let release,signal;const pending=translateContentText('Private','en','a',async(_url,options)=>{signal=options.signal;return await new Promise(resolve=>{release=resolve;});});setTranslationSession('');assert.equal(signal.aborted,true);release(response(['Old']));await pending;const value=await translateContentText('Private','en','a',async()=>response(['Fresh']));assert.equal(value,'Fresh');});
test('concurrent identical content reuses one request',async()=>{let calls=0;const fetcher=async()=>{calls++;await Promise.resolve();return response(['T']);};const values=await Promise.all([translateContentText('S','en','a',fetcher),translateContentText('S','en','a',fetcher)]);assert.deepEqual(values,['T','T']);assert.equal(calls,1);});
test('content chunking preserves formulas and exact concatenation',()=>{const text='Words '.repeat(590)+'$$x^2+'+'y'.repeat(500)+'$$'+' More'.repeat(700),chunks=splitTranslationContent(text);assert.equal(chunks.join(''),text);assert.equal(chunks.filter(c=>c.includes('$$')).length,1);assert.ok(chunks.every(c=>c.length<=12000));});
test('oversized protected block cannot be split into corrupt formulas',()=>{assert.throws(()=>splitTranslationContent('$$'+'x'.repeat(13000)+'$$'),/content_too_long/);});
test('content failure is explicit so UI can preserve source',async()=>{await assert.rejects(()=>translateContentText('Source','en','a',async()=>({ok:false,status:503})),/translation_unavailable/);await assert.rejects(()=>translateContentText('Source','en','a',async()=>response([])),/translation_unavailable/);});
test('public dictionaries never contain runtime private data',()=>{assert.ok(!registeredInterfaceLabels().some(s=>s.includes('PRIVATE_VALUE_93485')));});
