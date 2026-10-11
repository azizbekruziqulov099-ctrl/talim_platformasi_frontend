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
