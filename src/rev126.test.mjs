import test from 'node:test';
import assert from 'node:assert/strict';
import { darsIzohi } from './kid/izohTil.js';
import { ochilish } from './kid/darsOchilishi.js';

// Haqiqiy miyadan: 6–7 yosh koreys darsi ingliz izohida — birinchi qadam to'liq koreyscha.
const KO_EN = [
  { ovoz: '[ko]안녕, 친구들! 다시 만나서 반가워요! 작년에 배운 단어를 떠올려 봐요.[/ko]' },
  { ovoz: '[ko]들어 봐요: 열하나. 따라 해요: 열하나.[/ko] [en]In English — eleven.[/en]' },
  { ovoz: '[ko]봐! 열둘.[/ko] [en]In English — twelve. Say it slowly and clap your hands![/en]' },
];
const EN_UZ = [
  { ovoz: "[en]Hello, friends! Welcome back![/en]" },
  { ovoz: "Qara, bu — [en]grandpa[/en]. Bu bobo degani. Birga aytamiz: [en]grandpa[/en]!" },
];

test('REV126: lesson that opens in the target language keeps its English/Russian izoh', () => {
  assert.equal(darsIzohi(KO_EN), 'en');
  assert.equal(darsIzohi(KO_EN, 'Koreys tili (izoh: ingliz)'), 'en');
  assert.equal(darsIzohi(KO_EN, 'Koreys tili (izoh: rus)'), 'ru');
  assert.equal(darsIzohi(EN_UZ, 'Ingliz tili'), 'uz');
  assert.equal(darsIzohi([{ ovoz: '[en]Hello![/en]' }], 'Ingliz tili (izoh: ingliz)'), 'en');
  assert.equal(darsIzohi([{ ovoz: '[en]Hello![/en]' }, { ovoz: '[ru]Это привет.[/ru] [en]Hi![/en]' }], 'Ingliz tili (izoh: rus)'), 'ru');
});

test('REV126: Korean lesson in English izoh — the opening has no Uzbek at all', () => {
  const steps = ochilish({ ustoz: 'nilufar', til: 'ko', izoh: darsIzohi(KO_EN), grade: '6-7 yosh', havo: 'bulut',
    oldingi: { mavzu: 'Sleep', sozlar: [{ say: '코', emoji: '👃' }, { say: '주스', emoji: '🧃' }] } });
  for (const st of steps) {
    const rest = st.ovoz.replace(/\[(\w\w)\][\s\S]*?\[\/\1\]/g, ' ');
    assert.ok(!/\p{L}/u.test(rest), `tegsiz matn qoldi: ${rest}`);
    assert.ok(!/\[uz\]/.test(st.ovoz));
    assert.ok(!/opang|yaxshi|Bugun|Birga|Esingdami/.test(st.ovoz), st.ovoz);
  }
});
