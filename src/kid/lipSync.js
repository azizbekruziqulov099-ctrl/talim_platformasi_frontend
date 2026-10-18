// REV122: ustoz og'zi OVOZGA mos qimirlaydi. Ovoz fayli bir marta tahlil qilinadi (har 40 ms dagi balandlik),
// so'ng audio.currentTime ga qarab og'iz kadri tanlanadi: jimlikda yopiq, past ovozda yarim ochiq, baland ovozda keng.
// Ovoz hali yuklanayotgan / to'xtagan paytda og'iz qimirlamaydi.

export const LIP_STEP = 0.04;   // soniya

/** PCM namunalaridan (Float32Array, kanal 0) 0..1 balandlik konverti. */
export function envelope(samples, sampleRate, step = LIP_STEP) {
  const n = Math.max(1, Math.round(sampleRate * step));
  const count = Math.ceil(samples.length / n);
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    let sum = 0;
    const end = Math.min(samples.length, (i + 1) * n);
    for (let j = i * n; j < end; j++) sum += samples[j] * samples[j];
    out[i] = Math.sqrt(sum / Math.max(1, end - i * n));
  }
  // Normallash: 95-persentil = 1 (bitta baland «chiq» hammasini kichraytirib qo'ymasin)
  const sorted = Array.from(out).filter((v) => v > 0.002).sort((a, b) => a - b);
  const top = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1] : 1;
  for (let i = 0; i < count; i++) out[i] = Math.min(1, out[i] / (top || 1));
  // Juda qisqa «tishlash»larni silliqlaymiz (og'iz miltillamasin): 3 nuqtali o'rtacha
  const sm = new Float32Array(count);
  for (let i = 0; i < count; i++) sm[i] = ((out[i - 1] ?? out[i]) + out[i] * 2 + (out[i + 1] ?? out[i])) / 4;
  return sm;
}

/** Balandlik → og'iz kadri: 1 yopiq, 2 yarim ochiq, 3 keng ochiq, 4 «o» (pasayayotgan unli). */
export function mouthFrame(level, prevLevel = 0) {
  if (!(level > 0.14)) return 1;
  if (level < 0.38) return 2;
  if (level < 0.62) return prevLevel > level + 0.08 ? 4 : 2;
  return 3;
}

let ctx = null;
const cache = new Map();   // url → Promise<Float32Array|null>

/** Ovoz faylini yuklab, konvertini qaytaradi (xato bo'lsa — null; og'iz unda oddiy ritmda qimirlaydi). */
export function loadEnvelope(url, fetcher = typeof fetch === "function" ? fetch : null) {
  if (!url || !fetcher) return Promise.resolve(null);
  if (cache.has(url)) return cache.get(url);
  const p = (async () => {
    try {
      const AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
      if (!AC) return null;
      const res = await fetcher(url);
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      ctx = ctx || new AC();
      const audio = await new Promise((resolve, reject) => {
        const r = ctx.decodeAudioData(buf, resolve, reject);
        if (r && typeof r.then === "function") r.then(resolve, reject);
      });
      return envelope(audio.getChannelData(0), audio.sampleRate);
    } catch {
      return null;
    }
  })();
  cache.set(url, p);
  p.then((v) => { if (!v) cache.delete(url); });   // vaqtinchalik xato — keyingi safar qayta urinadi
  if (cache.size > 40) cache.delete(cache.keys().next().value);
  return p;
}

// REV153: og'iz — rassom chizgan lab varag'idagi 10 shakl (oldingi 3 ta xira kadr o'rniga). Har shakl: [eni, bo'yi,
// pastga siljishi] — yopiq og'iz eniga nisbatan. 0 yopiq · 1 lablar jips · 2 sal ochiq · 3 keng «a» · 4 tabassum «e»
// 5 kichik «u» · 6 katta «o» · 7 tishlar «s/i» · 8 til «l» · 9 o'rtacha «a/e».
export const OGIZ = [[1.042, 0.284, 0], [0.993, 0.298, 0.004], [0.938, 0.453, 0.051], [0.945, 0.765, 0.144], [1.031, 0.429, 0.044],
  [0.609, 0.481, 0.059], [0.561, 0.713, 0.129], [0.962, 0.343, 0.018], [0.851, 0.599, 0.095], [0.99, 0.484, 0.06]];
// unli turi → [past ovozda, baland ovozda]
const UNLI_SHAKL = { a: [9, 3], o: [5, 6], u: [5, 5], e: [7, 4], i: [7, 4], x: [2, 8] };
const UNLI_HARF = [
  [/[aаяáàâäāا]/, "a"], [/[oоёóöōو]/, "o"], [/[uуюúüūўۇ]/, "u"], [/[eэеéèêëə]/, "e"], [/[iиыyíïīيى]/, "i"],
];

/** So'zdagi unlilar ketma-ketligi (o'zbek, rus, ingliz, arab va boshqa yozuvlar): «Hello» → ["e","o"]. */
export function unlilar(soz) {
  const t = String(soz || "").replace(/\[\/?[a-z]{2}\]/gi, "").toLowerCase().replace(/o['‘’ʻ]/g, "o").replace(/g['‘’ʻ]/g, "g");
  const out = [];
  for (const ch of t) {
    const hit = UNLI_HARF.find(([re]) => re.test(ch));
    if (hit && out[out.length - 1] !== hit[1]) out.push(hit[1]);
  }
  return out;
}

/** Ovoz balandligi + aytilayotgan so'z → og'iz shakli (0..9). holat — chaqiruvchida saqlanadigan obyekt {soz, bogin, past}. */
export function ogizShakli(level, prevLevel = 0, holat = {}) {
  if (!(level > 0.12)) { holat.past = true; return prevLevel > 0.3 ? 1 : 0; }
  if (holat.past !== false && level > 0.2) { holat.bogin = (holat.bogin || 0) + 1; holat.past = false; }   // yangi bo'g'in
  const u = unlilar(holat.soz);
  const tur = u.length ? u[((holat.bogin || 1) - 1) % u.length] : "x";
  return UNLI_SHAKL[tur][level >= 0.45 ? 1 : 0];
}

/** Ovoz tahlili bo'lmaganda (qurilma ovozi) — so'z unlilariga qarab sokin ritm: ochiq → yarim → yopiq. */
export function ritmShakli(qadam, soz) {
  const u = unlilar(soz);
  const tur = u.length ? u[Math.floor(qadam / 3) % u.length] : "x";
  return [UNLI_SHAKL[tur][1], UNLI_SHAKL[tur][0], 0][qadam % 3];
}
