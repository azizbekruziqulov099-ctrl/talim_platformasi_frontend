// REV162: bog'cha — haftalik reja, kurslar, AI bahosi va «O'zingiz sinab ko'ring» (sof funksiyalar, DOM'siz sinaladi).
// Kurs kalitlari backend (modules/bogcha_reja.py → KURSLAR) bilan bir xil.

export const KURSLAR = [
  ['en', 'Ingliz tili', 'til', '🇬🇧', 'en', /ingliz|english/i],
  ['ru', 'Rus tili', 'til', '🇷🇺', 'ru', /\brus\b|rus tili|russian/i],
  ['ar', 'Arab tili', 'til', '🇸🇦', 'ar', /arab/i],
  ['tr', 'Turk tili', 'til', '🇹🇷', 'tr', /turk/i],
  ['de', 'Nemis tili', 'til', '🇩🇪', 'de', /nemis|german/i],
  ['fr', 'Fransuz tili', 'til', '🇫🇷', 'fr', /fransuz|french/i],
  ['es', 'Ispan tili', 'til', '🇪🇸', 'es', /ispan|spanish/i],
  ['ko', 'Koreys tili', 'til', '🇰🇷', 'ko', /koreys|korean/i],
  ['ja', 'Yapon tili', 'til', '🇯🇵', 'ja', /yapon|japan/i],
  ['zh', 'Xitoy tili', 'til', '🇨🇳', 'zh', /xitoy|chinese/i],
  ['ona', 'Ona tili', 'fan', '📖', '', /ona tili|o.?zbek|savod|nutq/i],
  ['mat', 'Matematika', 'fan', '🔢', '', /matem/i],
  ['man', 'Mantiq', 'fan', '🧩', '', /mantiq|logika/i],
  ['olam', 'Atrof-olam', 'fan', '🌳', '', /atrof|tabiat/i],
].map(([kalit, nom, turi, emoji, til, re]) => ({ kalit, nom, turi, emoji, til, re }));
export const KURS = Object.fromEntries(KURSLAR.map((k) => [k.kalit, k]));
export const KUNLAR = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
export const KUN_QISQA = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'];
export const BAHO_MATN = { 5: 'A’lo', 4: 'Yaxshi', 3: 'O‘rtacha', 2: 'Mashq kerak' };
export const QISMLAR = [
  ['aniqlik', '🎯', 'Aniqlik', 'Savol va o‘yinlarda to‘g‘ri javoblar'],
  ['gapirish', '🎤', 'Gapirish', 'Mikrofonga to‘g‘ri aytgan so‘zlari'],
  ['tezlik', '⚡', 'Tezlik', 'Javob berish tezligi (yoshiga nisbatan)'],
  ['puxtalik', '🧱', 'Puxtalik', 'Darsni oxirigacha, chalg‘imay o‘tdi'],
];

/** Katalogdagi fan nomi → kurs kaliti. «Arab tili (izoh: rus)» — izoh tili hisobga olinmaydi. */
export function fanKaliti(nom) {
  const text = String(nom || '').replace(/\(\s*izoh[^)]*\)/gi, '');
  // avval fanlar («Matematika (rus tilida)» — matematika), keyin tillar — backend bilan bir xil
  return KURSLAR.find((k) => k.turi === 'fan' && k.re.test(text))?.kalit || KURSLAR.find((k) => k.turi === 'til' && k.re.test(text))?.kalit || '';
}

/** Reja bo'yicha shu fandan bugun nechta yangi dars ochish mumkin (reja bo'lmasa — null: eski tartib). */
export function rejaKvotasi(plan, fanNomi) {
  const r = plan?.reja;
  if (!r || (!r.manba && !r.obuna_kerak) || !fanKaliti(fanNomi)) return null;   // rejadan tashqari fan — eski tartib
  const k = fanKaliti(fanNomi);
  const sinov = r.takror_kuni ? 0 : Number(r.sinov?.[k] || 0);   // REV168: olinmagan kurs — sinov (reklama) darslari
  if (r.obuna_kerak) return sinov;
  if (!r.faol?.includes(k) && sinov > 0) return sinov;
  return Number(r.bugun?.[k] || 0);
}

/** Bola fan sahifasida ko'radigan qisqa holat: bugun bormi, bo'lmasa keyingi kuni. */
export function fanHolati(plan, fanNomi) {
  const r = plan?.reja;
  const k = fanKaliti(fanNomi);
  if (!r || (!r.manba && !r.obuna_kerak) || !k) return null;
  if (r.takror_kuni) return { turi: 'takror', kvota: 0 };
  // REV168: olinmagan kurs — birinchi bir nechta dars bepul (sinov)
  const sinov = Number(r.sinov?.[k] || 0);
  if ((r.obuna_kerak || !r.faol?.includes(k)) && sinov > 0) return { turi: 'sinov', kvota: sinov, asl: r.obuna_kerak ? 'obuna' : r.navbat?.includes(k) ? 'navbat' : 'yoq' };
  if (r.obuna_kerak) return { turi: 'obuna', kvota: 0 };
  if (r.navbat?.includes(k)) return { turi: 'navbat', kvota: 0 };
  if (!r.faol?.includes(k)) return { turi: 'yoq', kvota: 0 };
  const kvota = Number(r.bugun?.[k] || 0);
  // REV166: shu fan haftaning qaysi kunlarida (0 — dushanba … 5 — shanba) — kartada «Du · Cho · Sha» bo'lib ko'rinadi
  const kunlar = (r.hafta || []).map((list, i) => (Array.isArray(list) && list.includes(k) ? i : -1)).filter((i) => i >= 0);
  return { turi: kvota > 0 ? 'bor' : 'keyin', kvota, keyingi: r.keyingi?.[k] || '', kunlar, bugun: haftaKuni(plan?.sana) };
}

/** ISO sana («2026-10-23») → hafta kuni: 0 — dushanba … 6 — yakshanba (sana bo'lmasa — -1). */
export function haftaKuni(sana) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(sana || ''));
  if (!m) return -1;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return (d.getUTCDay() + 6) % 7;
}

export function sum(n) {
  return `${Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/,/g, ' ')} so‘m`;
}

/** Tarif: necha kurs tanlash mumkin (to'liq — yoshiga ruxsat etilgan hammasi). */
export function tanlovChegarasi(tarif, qoida) {
  if (!tarif || !qoida) return 0;
  const n = tarif.toliq ? qoida.jami : Math.min(tarif.kurs_soni, qoida.jami);
  return tarif.kurslar?.length ? Math.min(n, tarif.kurslar.length) : n;
}
/** REV163: tarif aniq kurslarga bog'langan bo'lsa — faqat o'shalar. */
export function tarifRuxsati(tarif, kalit) {
  return !tarif?.kurslar?.length || tarif.kurslar.includes(kalit);
}

/** Frontenddagi tanlov tekshiruvi (server ham tekshiradi): '' yoki tushunarli sabab. */
export function tanlovXatosi(fanlar, tarif, qoida) {
  const list = [...new Set(fanlar || [])].filter((k) => KURS[k]);
  if (!tarif) return 'Tarifni tanlang.';
  if (!list.length) return 'Kamida bitta kurs tanlang.';
  if (list.some((k) => !tarifRuxsati(tarif, k))) return 'Bu tarif faqat unda ko‘rsatilgan kurslar uchun.';
  const limit = tarif.toliq ? qoida.jami : tarif.kurs_soni;
  if (list.length > limit) return 'Bu tarifga sig‘adigandan ko‘p kurs tanlandi.';
  const tillar = list.filter((k) => KURS[k].turi === 'til').length;
  if (list.length > qoida.jami || tillar > qoida.til) return 'Farzandingiz yoshida bundan ko‘p kurs bir vaqtda o‘qitilmaydi. Ko‘proq olmoqchi bo‘lsangiz, avval farzandingiz bitta tilni tugatsin.';
  return '';
}

/** Tanlashda: shu kursni qo'shib bo'ladimi (yosh chegarasi va tarif sig'imi). */
export function qoshsaBoladimi(fanlar, kalit, tarif, qoida) {
  if (fanlar.includes(kalit)) return { ok: true };
  if (!tarifRuxsati(tarif, kalit)) return { ok: false, sabab: 'kurs' };
  const limit = tanlovChegarasi(tarif, qoida);
  if (fanlar.length >= limit) return { ok: false, sabab: fanlar.length >= qoida.jami ? 'yosh' : 'tarif' };
  if (KURS[kalit]?.turi === 'til' && fanlar.filter((k) => KURS[k]?.turi === 'til').length >= qoida.til) return { ok: false, sabab: 'til' };
  return { ok: true };
}

export function bahoRangi(baho) {
  return baho >= 5 ? 'is-5' : baho >= 4 ? 'is-4' : baho >= 3 ? 'is-3' : 'is-2';
}

/** Hafta taqqoslash: shu hafta vs o'tgan hafta — o'sish belgisi. */
export function ozgarish(shu, otgan) {
  const a = Number(shu) || 0, b = Number(otgan) || 0;
  if (!b && !a) return { belgi: '', farq: 0 };
  const farq = a - b;
  return { belgi: farq > 0 ? '▲' : farq < 0 ? '▼' : '＝', farq };
}

function aralash(list, seed) {
  const out = [...list];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** «O'zingiz sinab ko'ring»: o'rgangan so'zlardan oddiy savollar — rasmni top (eshitib), ayt (rasmga qarab).
 *  Rasmi (emoji) bor so'zlar ishlatiladi; har savolda 3 ta variant. */
export function sinovSavollari(sozlar, { soni = 6, seed = 7 } = {}) {
  const pics = (sozlar || []).filter((w) => w && w.soz && w.emoji);
  if (pics.length < 2) return [];
  const pool = aralash(pics, seed).slice(0, soni);
  return pool.map((w, i) => {
    if (i % 2 === 1) return { turi: 'ayt', soz: w.soz, emoji: w.emoji, til: w.til || '', fan: w.fan || '', kalit: w.kalit || '' };
    const boshqa = aralash(pics.filter((x) => x.soz !== w.soz && x.emoji !== w.emoji), seed + i).slice(0, 2);
    const variantlar = aralash([w, ...boshqa], seed + 31 * i).map((x) => ({ soz: x.soz, emoji: x.emoji, togri: x.soz === w.soz }));
    return { turi: 'top', soz: w.soz, emoji: w.emoji, til: w.til || '', fan: w.fan || '', kalit: w.kalit || '', variantlar };
  });
}

/** Ovoz uchun matn: chet tili so'zi o'z tilida o'qilsin ([en]cat[/en]). */
export function ovozMatni(soz, til) {
  const t = String(til || '').trim();
  return t ? `[${t}]${soz}[/${t}]` : String(soz || '');
}

/** Yangi dars ochilmagan sabab → bolaga aytiladigan qisqa gap (tarjima qilinadigan doimiy ibora). */
export const SABAB_MATN = {
  obuna: 'Yangi darslar uchun ota-onang kurs tanlasin. O‘tilgan darslar va o‘yinlar ochiq.',
  takror: 'Bugun yakshanba — takrorlash kuni. Yangi dars ertaga.',
  navbat: 'Bu kurs navbatda — boshlangan kurslardan biri tugagach ochiladi.',
  yoq: 'Bu kurs rejangda yo‘q. O‘tilgan darslarni takrorlash mumkin.',
  keyin: 'Bugungi dars o‘tildi yoki bugun rejada yo‘q.',
};

// ── Haftalik jadval (backend haftalik_reja bilan bir xil algoritm — oldindan ko'rish uchun) ──
function combos(n, k, start = 0, acc = [], out = []) {
  if (acc.length === k) { out.push([...acc]); return out; }
  for (let i = start; i < n; i += 1) { acc.push(i); combos(n, k, i + 1, acc, out); acc.pop(); }
  return out;
}
function better(a, b) { for (let i = 0; i < a.length; i += 1) { if (a[i] !== b[i]) return a[i] > b[i]; } return false; }
function joylash(order, sessions, cap, usul) {
  const load = [0, 0, 0, 0, 0, 0];
  const hafta = [[], [], [], [], [], [], []];
  const got = {};
  for (const k of order) {
    let need = sessions[k];
    let placed = null;
    while (need > 0 && !placed) {
      let best = null, bestScore = null;
      for (const c of combos(6, need)) {
        if (c.some((d) => load[d] >= cap[d])) continue;
        let adj = 0;
        for (let i = 1; i < c.length; i += 1) if (c[i] - c[i - 1] === 1) adj += 1;
        const sat = KURS[k].turi !== 'til' && c.includes(5) ? 1 : 0;
        const head = usul === 'teng' ? -c.reduce((n, d) => n + load[d], 0) : c.reduce((n, d) => n + cap[d] - load[d], 0);
        const score = [head, -adj, sat, -Math.max(...c)];
        if (!bestScore || better(score, bestScore)) { best = c; bestScore = score; }
      }
      if (!best) need -= 1; else placed = best;
    }
    for (const d of placed || []) { load[d] += 1; hafta[d].push(k); }
    got[k] = (placed || []).length;
  }
  return { hafta, got };
}
export function ajrat(fanlar, qoida) {
  const faol = [], navbat = [];
  let til = 0;
  for (const k of [...new Set(fanlar || [])].filter((x) => KURS[x])) {
    const isTil = KURS[k].turi === 'til';
    if (faol.length < qoida.jami && (!isTil || til < qoida.til)) { faol.push(k); til += isTil ? 1 : 0; } else navbat.push(k);
  }
  return { faol, navbat };
}
export function haftalikReja(fanlar, qoida) {
  const { faol, navbat } = ajrat(fanlar, qoida);
  const cap = [qoida.kun, qoida.kun, qoida.kun, qoida.kun, qoida.kun, qoida.shanba];
  const total = cap.reduce((a, b) => a + b, 0);
  const sessions = {};
  if (faol.length) {
    const base = Math.max(1, Math.min(3, Math.floor(total / faol.length)));
    let extra = Math.max(0, total - base * faol.length);
    faol.forEach((k) => { sessions[k] = base; });
    const order = [...faol.filter((k) => KURS[k].turi === 'til'), ...faol.filter((k) => KURS[k].turi !== 'til')];
    for (const k of order) { if (extra <= 0 || sessions[k] >= 3) continue; sessions[k] += 1; extra -= 1; }
  }
  const planOrder = [...faol].sort((a, b) => (sessions[b] - sessions[a]) || ((KURS[a].turi === 'til' ? 0 : 1) - (KURS[b].turi === 'til' ? 0 : 1)) || (faol.indexOf(a) - faol.indexOf(b)));
  let { hafta, got } = joylash(planOrder, sessions, cap, 'teng');
  if (faol.some((k) => got[k] < sessions[k])) {
    const alt = joylash(planOrder, sessions, cap, 'sigim');
    const sumv = (o) => Object.values(o).reduce((a, b) => a + b, 0);
    if (sumv(alt.got) > sumv(got)) ({ hafta, got } = alt);
  }
  const sigmadi = faol.filter((k) => !got[k]);   // sig'im juda kichik — navbatga
  const faol2 = faol.filter((k) => got[k]);
  const got2 = Object.fromEntries(Object.entries(got).filter(([k]) => faol2.includes(k)));
  for (let d = 0; d < 6; d += 1) hafta[d].sort((a, b) => faol2.indexOf(a) - faol2.indexOf(b));
  return { faol: faol2, navbat: [...sigmadi, ...navbat], hafta, haftalik: got2, sigim: [...cap, 0] };
}

/** REV163: server xato kodi → foydalanuvchi tilida aytiladigan doimiy ibora (uz/ru/en tarjimasi bor). */
export const XATO_MATN = {
  ulanmagan: 'Bu farzand sizga ulanmagan.',
  obunada_yoq: 'Bu kurs obunada yo‘q. Tarifni o‘zgartiring yoki kursni almashtiring.',
  obuna_kerak: 'Avval tarif tanlab, to‘lov qiling.',
  rozilik: 'Shartlar bilan tanishib, «Roziman» belgisini qo‘ying.',
  tarif_yoq: 'Tarif topilmadi yoki yopilgan.',
  tanlov_bosh: 'Kamida bitta kurs tanlang.',
  tanlov_tarif_kursi: 'Bu tarif faqat unda ko‘rsatilgan kurslar uchun.',
  tanlov_tarif: 'Bu tarifga sig‘adigandan ko‘p kurs tanlandi.',
  tanlov_yosh: 'Farzandingiz yoshida bundan ko‘p kurs bir vaqtda o‘qitilmaydi. Ko‘proq olmoqchi bo‘lsangiz, avval farzandingiz bitta tilni tugatsin.',
  tolov_yoq: 'Onlayn to‘lov tez orada ulanadi. Hozircha administrator bilan bog‘laning.',
  google: 'To‘lovdan oldin Gmail akkauntingizni ulang.',
  telegram: 'To‘lovdan oldin Telegram’ni ulang — farzandingiz haqidagi xabarlar shu yerga keladi.',
  kod_format: 'Kod 8 ta raqamdan iborat.',
  kod_yoq: 'Kod noto‘g‘ri yoki muddati o‘tgan. Ota-onangizdan yangi kod oling.',
};
export function xatoMatni(err) {
  return (err && XATO_MATN[err.code]) || err?.message || '';
}
