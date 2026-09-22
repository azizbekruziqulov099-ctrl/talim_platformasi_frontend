import test from 'node:test';
import assert from 'node:assert/strict';
import {educationRole,initialEducationTab,learningReady,needsEducation} from './educationRules.js';
import {telegramChallenge,restoreTelegramChallenge} from '../auth/authClient.js';

test('new Google account opens education home then asks for profile only on study actions',()=>{
 const user={role:'kabutar',education_ready:false};
 assert.equal(initialEducationTab(user),'home');
 assert.equal(needsEducation(user,'home'),false);
 for(const tab of ['test','mavzular','ai_ustoz'])assert.equal(needsEducation(user,tab),true);
 assert.equal(needsEducation(user,'kurslar'),false);
});
test('a school grade opens tests directly and never becomes a college course',()=>{
 for(const grade of ['1','11','7-sinf']) {
  const user={role:'oquvchi',class:grade};
  assert.equal(initialEducationTab(user),'test');assert.equal(educationRole(user),'oquvchi');
 }
 assert.equal(learningReady({role:'oquvchi',class:'12'}),false);
});
test('student chosen in bot is retained until course form and language are saved',()=>{
 const user={role:'oquvchi',education_role:'talaba',education_ready:false};
 assert.equal(educationRole(user),'talaba');assert.equal(needsEducation(user,'test'),true);
 user.class='2 kurs'; user.learning_profile={kurs:2,talim_bosqichi:'bakalavr',talim_shakli:'kechki',talim_tili:'ru'};
 assert.equal(initialEducationTab(user),'test');assert.equal(needsEducation(user,'test'),false);
 assert.equal(user.universitet_id,undefined);
});
test('teacher and parent open their correct workspaces',()=>{
 assert.equal(initialEducationTab({role:'oqituvchi'}),'oqituvchi');
 assert.equal(initialEducationTab({role:'ota-ona'}),'farzand');
 assert.equal(initialEducationTab({role:'oqituvchi',is_admin:true}),'admin');
});
test('Telegram code mode survives browser reload but expires',()=>{
 const next=telegramChallenge({challenge:'c'.repeat(32),browser_secret:'s'.repeat(43),bot_url:'https://t.me/kabutar_bot?start=kb_abc',delivery:'code',expires_in:300},1000);
 const storage={getItem:()=>JSON.stringify(next)};
 assert.equal(restoreTelegramChallenge(storage,'key',2000).delivery,'code');
 assert.equal(restoreTelegramChallenge(storage,'key',302000),null);
 assert.equal(next.code,undefined);
});
