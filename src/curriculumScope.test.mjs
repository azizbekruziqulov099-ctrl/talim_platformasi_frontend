import test from 'node:test';
import assert from 'node:assert/strict';
import { scopedRequest } from './curriculum/scopeRequest.js';

test('JSON requests bind the selected audience and lesson without changing caller input', async () => {
 const options={method:'POST',body:JSON.stringify({scope_id:1,dars_turi:'maruza',fan:'Fizika'}),headers:{'Content-Type':'application/json'}};
 let captured;
 await scopedRequest(async (url,init)=>{captured={url,init};return new Response('{}');},'https://example.test/import?token=secret&scope_id=1',options,{id:22,dars_turi:'amaliy'});
 const url=new URL(captured.url);
 assert.equal(url.searchParams.get('scope_id'),'22');
 assert.equal(url.searchParams.get('token'),'secret');
 assert.deepEqual(JSON.parse(captured.init.body),{scope_id:22,dars_turi:'amaliy',fan:'Fizika'});
 assert.equal(JSON.parse(options.body).scope_id,1);
});
test('file uploads preserve multipart data and attach audience to the URL',async()=>{
 const body=new FormData();body.set('fayl',new Blob(['data']),'tests.xlsx');
 await scopedRequest(async(url,init)=>{
  assert.equal(new URL(url).searchParams.get('scope_id'),'5');
  assert.equal(init.body,body);assert.equal(init.headers,undefined);
  return new Response('{}');
 },'https://example.test/import',{method:'POST',body},{id:5});
});
test('failed deletion propagates the server error rather than claiming success',async()=>{
 await assert.rejects(scopedRequest(async()=>new Response(JSON.stringify({detail:'Boshqa dastur'}),{status:403}),'/delete',{method:'DELETE'},{id:9}),/Boshqa dastur/);
});
test('non-JSON server failures remain visible',async()=>{
 await assert.rejects(scopedRequest(async()=>new Response('unavailable',{status:503}),'/list',{}, {id:9}),/503/);
});
test('missing selection makes no request',async()=>{
 let calls=0;
 await assert.rejects(scopedRequest(async()=>{calls++;return new Response('{}');},'/list',{},null),/tanlang/);
 assert.equal(calls,0);
});
test('changing the selected program changes the next request',async()=>{
 const requested=[];const fetcher=async url=>{requested.push(new URL(url).searchParams.get('scope_id'));return new Response('{}');};
 await scopedRequest(fetcher,'/topics',{}, {id:2});
 await scopedRequest(fetcher,'/topics',{}, {id:8});
 assert.deepEqual(requested,['2','8']);
});
