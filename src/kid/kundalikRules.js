// REV166: bola va ota-ona kundaligi — sof funksiyalar (DOM'siz sinaladi). Ma'lumot: /api/bola/kundalik, bola_faollik.kundalik.

/** Darajalar zinapoyasi (backend bogcha_reja.DARAJALAR bilan bir xil tartib) — bola keyingi belgini ko'rib turadi. */
export const DARAJA_ZINA = ['🥚', '🐣', '🐥', '🐤', '🐦', '🦜', '🦉', '🕊', '🦅', '🌟', '🚀', '🌈', '👑'];

/** «Kuchlarim»: backend kaliti → bolaga tushunarli nom va belgi (tartib ham shu). */
export const KUCHLAR = [
  ['xotira', '🧠', 'Aqlli', 'Savollarga to‘g‘ri javob beradi'],
  ['tezlik', '⚡', 'Chaqqon', 'Tez javob beradi'],
  ['diqqat', '🎯', 'Diqqatli', 'Darsni chalg‘imay o‘tadi'],
  ['gapirish', '🎤', 'Gapiradi', 'So‘zlarni to‘g‘ri aytadi'],
  ['muntazam', '📅', 'Har kuni', 'Har kuni o‘qiydi'],
  ['natija', '⭐', 'Yulduzchi', 'Ko‘p yulduz oladi'],
];

export function kuchlarRoyxati(kuch = []) {
  const by = new Map((kuch || []).map((k) => [k.kalit, Number(k.daraja) || 0]));
  return KUCHLAR.filter(([k]) => by.has(k)).map(([kalit, emoji, nom, izoh]) => ({ kalit, emoji, nom, izoh, daraja: Math.max(1, Math.min(5, by.get(kalit))) }));
}

/** Bir kunning kataklari: rejadagi har fan (o'tildimi, yulduzi, bahosi) + rejadan tashqari o'tilgan darslar.
 *  holat: tugadi | chala | bugun (hali boshlanmagan) | otkazildi (kun o'tib ketdi — keyin o'zi ochiladi) | keladi | takror | bosh */
export function kunKataklari(kun) {
  if (!kun) return [];
  const darslar = Array.isArray(kun.darslar) ? kun.darslar : [];
  const used = new Set();
  const out = [];
  for (const k of kun.rejada || []) {
    const idx = darslar.findIndex((d, i) => !used.has(i) && d.kalit === k && d.tugadi);
    const any = idx >= 0 ? idx : darslar.findIndex((d, i) => !used.has(i) && d.kalit === k);
    if (any >= 0) {
      used.add(any);
      const d = darslar[any];
      out.push({ kalit: k, fan: d.fan, mavzu: d.mavzu, holat: d.tugadi ? 'tugadi' : 'chala', yulduz: d.yulduz || 0, baho: d.baho || null });
    } else {
      out.push({ kalit: k, fan: '', mavzu: '', holat: kun.holat === 'bugun' ? 'bugun' : kun.holat === 'otdi' ? 'otkazildi' : 'keladi', yulduz: 0, baho: null });
    }
  }
  darslar.forEach((d, i) => {
    if (used.has(i)) return;
    out.push({ kalit: d.kalit, fan: d.fan, mavzu: d.mavzu, holat: d.tugadi ? 'tugadi' : 'chala', yulduz: d.yulduz || 0, baho: d.baho || null, qoshimcha: true });
  });
  if (!out.length) out.push({ holat: kun.kun === 6 ? 'takror' : 'bosh' });
  return out;
}

/** Yulduz satri: 2 → «⭐⭐☆». */
export function yulduzSatr(n, max = 3) {
  const k = Math.max(0, Math.min(max, Number(n) || 0));
  return '⭐'.repeat(k) + '☆'.repeat(max - k);
}

/** «19.10» ko'rinishidagi qisqa sana. */
export function qisqaSana(iso) {
  const m = /^\d{4}-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return m ? `${m[2]}.${m[1]}` : '';
}

/** Haftaning qisqa xulosasi (tugatilgan dars, yulduz, rejadagi dars soni). */
export function haftaHisobi(hafta) {
  const kunlar = hafta?.kunlar || [];
  const reja = kunlar.reduce((n, k) => n + (k.rejada || []).length, 0);
  const tugadi = kunlar.reduce((n, k) => n + (k.darslar || []).filter((d) => d.tugadi).length, 0);
  const yulduz = kunlar.reduce((n, k) => n + (Number(k.yulduz) || 0), 0);
  return { reja, tugadi, yulduz, foiz: reja ? Math.min(100, Math.round((tugadi / reja) * 100)) : null };
}

/** Ota-onaga bugungi xulosa (backend kun_xulosasi bilan bir xil qoida): o'rgandi, takrorlash kerak, chala qolgan. */
export function bugungiXulosa(darslar = []) {
  const list = Array.isArray(darslar) ? darslar : [];
  const uniq = (items) => { const seen = new Set(); const out = [];
    for (const x of items) { const k = String(x || '').trim(); if (k && !seen.has(k.toLowerCase())) { seen.add(k.toLowerCase()); out.push(k); } }
    return out; };
  const said = new Set(list.flatMap((d) => (d.sozlar || []).filter((w) => w.aytdi === true).map((w) => String(w.soz || '').toLowerCase())));
  const done = list.filter((d) => d.tugadi);
  const sozlar = [];
  const seenW = new Set();
  for (const d of list) for (const w of d.sozlar || []) {
    const k = String(w.soz || '').toLowerCase();
    if (k && !seenW.has(k)) { seenW.add(k); sozlar.push(w); }
  }
  return {
    organdi: uniq(done.map((d) => d.mavzu)),
    sozlar,
    takrorSoz: sozlar.filter((w) => w.aytdi === false && !said.has(String(w.soz || '').toLowerCase())),
    takrorDars: uniq(done.filter((d) => Number(d.yulduz || 0) <= 1 || Number(d.ai_baho?.baho || 5) <= 2).map((d) => d.mavzu)),
    chala: uniq(list.filter((d) => !d.tugadi).map((d) => d.mavzu)),
  };
}

/** Ertangi rejadagi fanlar (yakshanba — takror: bo'sh ro'yxat; reja yo'q — null). */
export function ertangiFanlar(hafta, bugun) {
  if (!Array.isArray(hafta) || bugun < 0) return null;
  const n = (bugun + 1) % 7;
  return n === 6 ? [] : [...(hafta[n] || [])];
}
