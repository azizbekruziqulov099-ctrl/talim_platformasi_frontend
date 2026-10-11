import test from 'node:test';
import assert from 'node:assert/strict';
import { izohTanla, fanIzohi, fanNomi, fanNomiTil } from './curriculum/izohTanlov.js';
import { KORINISH_TURLARI, guruhKaliti, guruhMos, previewUser } from './admin/previewRules.js';
import { envelope, mouthFrame } from './kid/lipSync.js';
import { ustozNutqi } from './kid/ustozNutqi.js';
import { kabuSpeech } from './kid/kidStageRules.js';
import { roleDetail, schoolGrade, educationRole } from './workspace/educationRules.js';
import { flagCode, flagSrc } from './kid/flags.js';
import { accountRole } from './auth/loginMemory.js';
import { isPreschoolLearner } from './test/kidQuizRules.js';
import { lessonAudience } from './lesson/lessonAudience.js';
import { ustozFor } from './kid/ustozRules.js';

const F = (nom, grade = '2-3 yosh') => ({ nom, kalit: `${nom}|${grade}`, dars_turi: '', institution_type: 'bogcha', sinflar: [{ sinf: grade, mavzular: [] }] });

test('izoh: every locale gets only its own variant, others never mix', () => {
  const all = ['Arab tili', 'Arab tili (izoh: rus)', 'Arab tili (izoh: ingliz)', 'Matematika', 'Matematika (izoh: rus)'].map((n) => F(n));
  assert.deepEqual(izohTanla(all, 'uz').map((f) => f.nom), ['Arab tili', 'Matematika']);
  assert.deepEqual(izohTanla(all, 'ru').map((f) => f.nom), ['Arab tili (izoh: rus)', 'Matematika (izoh: rus)']);
  // inglizcha matematika yo'q → o'zbekchasi (fan yo'qolmaydi)
  assert.deepEqual(izohTanla(all, 'en').map((f) => f.nom), ['Arab tili (izoh: ingliz)', 'Matematika']);
  // har yosh guruhi saqlanadi
  const ages = [F('Arab tili'), F('Arab tili', '4-5 yosh'), F('Arab tili (izoh: rus)'), F('Arab tili (izoh: rus)', '4-5 yosh')];
  assert.equal(izohTanla(ages, 'ru').length, 2);
  // faqat boshqa tildagi variant bo'lsa — bittasi (ikkalasi emas)
  assert.deepEqual(izohTanla([F('Nemis tili (izoh: rus)'), F('Nemis tili (izoh: ingliz)')], 'uz').map((f) => f.nom), ['Nemis tili (izoh: rus)']);
  assert.equal(fanIzohi('Arab tili (izoh: ingliz)'), 'en');
  assert.equal(fanNomi('Arab tili (izoh: rus)'), 'Arab tili');
  assert.equal(fanNomiTil('Arab tili (izoh: rus)', 'ru'), 'Арабский язык');
  assert.equal(fanNomiTil('Atrof-muhit (izoh: ingliz)', 'en'), 'The world around us');
  assert.equal(fanNomiTil('Fizika', 'ru'), 'Fizika');
});

test('preview: bog\'cha user is a kid everywhere, school/university are not', () => {
  const admin = { user_id: 7, full_name: 'A', is_admin: true };
  const kid = previewUser(admin, 'bogcha', '4-5');
  assert.equal(accountRole(kid), 'bogcha');
  assert.equal(educationRole(kid), 'bogcha');
  assert.equal(isPreschoolLearner(kid), true);
  assert.equal(lessonAudience(accountRole(kid), ''), 'bogcha');
  assert.equal(kid.is_admin, false);
  const pupil = previewUser(admin, 'maktab', '5');
  assert.equal(accountRole(pupil), 'oquvchi');
  assert.equal(isPreschoolLearner(pupil, '5'), false);
  assert.equal(accountRole(previewUser(admin, 'universitet')), 'talaba');
  assert.ok(guruhMos('2–3 yosh', '2-3') && guruhMos('5-sinf', '5') && !guruhMos('11', '1') && guruhMos('7', ''));
  assert.equal(guruhKaliti('4 – 5 yosh'), '4-5');
  assert.ok(KORINISH_TURLARI.find((t) => t.kalit === 'bogcha').guruhlar.every(([k]) => k), 'bog\'chada «hammasi» yo\'q');
});

test('lip sync: silence closes the mouth, loud speech opens it', () => {
  const rate = 1000, n = rate;   // 1 s: 0.5 s jim, 0.5 s baland
  const pcm = new Float32Array(n);
  for (let i = n / 2; i < n; i++) pcm[i] = Math.sin(i / 3) * 0.6;
  const env = envelope(pcm, rate, 0.04);
  assert.equal(mouthFrame(env[2]), 1);
  assert.equal(mouthFrame(env[env.length - 3]), 3);
  assert.equal(mouthFrame(null), 1);
  assert.equal(mouthFrame(0.2), 2);
});

test('human teachers speak like people, robot Kabu stays in third person', () => {
  const t = (s, u = 'nilufar') => ustozNutqi(kabuSpeech(s), u);
  assert.equal(t('Salom, bolajonlar! Men — robot Kabu. Bip-bip! Bugun o\'ynaymiz.'), 'Salom, bolajonlar! Men — Nilufar opa. Bugun o\'ynaymiz.');
  assert.equal(t('Salom, do\'stim! Men robot Kabuman.', 'sardor'), 'Salom, do\'stim! Men Sardor akaman.');
  assert.equal(t('[ru]Привет! Я — робот Кабу. Бип-бип! Начнём.[/ru]', 'malika'), '[ru]Привет! Я — Малика опа. Начнём.[/ru]');
  assert.equal(t('[en]Beep-beep! I\'m Kabu the robot.[/en]'), '[en]I\'m Miss Nilufar.[/en]');
  assert.equal(t('Mening temir qo\'llarim bor.'), 'Mening qo\'llarim bor.');
  assert.equal(t('Kabu «bip-bip» deydi.'), 'Kabu «bip-bip» deydi.');
  assert.equal(ustozFor('The world around us'), 'malika');
});

test('profile shows the exact role and age/grade', () => {
  assert.equal(schoolGrade('5-sinf'), '5');
  assert.equal(schoolGrade('11'), '11');
  assert.equal(schoolGrade('12'), '');
  assert.equal(roleDetail({ education_role: 'bogcha', class: '4-5 yosh' }), '🧸 Bog‘cha bolasi · 4–5 yosh');
  assert.equal(roleDetail({ role: 'oquvchi', class: '7' }), '📚 O‘quvchi · 7-sinf');
  assert.equal(roleDetail({ talaba_mi: true, learning_profile: { kurs: 2 } }), '🎓 Talaba · 2-kurs');
});

test('flags render as pictures (Windows shows «SA» letters for flag emoji)', () => {
  assert.equal(flagCode('🇸🇦'), 'SA');
  assert.equal(flagCode('🔢'), '');
  for (const c of ['GB', 'RU', 'DE', 'FR', 'ES', 'TR', 'JP', 'CN', 'KR', 'SA']) assert.match(flagSrc(c), /^data:image\/svg\+xml/);
});
