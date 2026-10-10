// REV110: bolaning o'z ovozini qisqa yozib olib, xato bo'lsa o'ziga qayta eshittirish.
// Yozuv FAQAT shu qurilma xotirasida turadi (blob URL), serverga yuborilmaydi va keyingi urinishda o'chiriladi.

const OFF_KEY = 'kb_rec_off';

function storage(win) {
  try { return win?.localStorage || null; } catch { return null; }
}

/** Yozib olish shu qurilmada ishlaydimi (MediaRecorder + mikrofon). */
export function recorderSupported(win = globalThis) {
  if (!win?.MediaRecorder || !win?.navigator?.mediaDevices?.getUserMedia) return false;
  try { return storage(win)?.getItem(OFF_KEY) !== '1'; } catch { return true; }
}

/**
 * Ba'zi Android telefonlarda mikrofonni bir vaqtda ham yozish, ham tanish mumkin emas —
 * shunda tanish muhimroq: yozishni shu qurilmada o'chirib qo'yamiz.
 */
export function disableRecorder(win = globalThis) {
  try { storage(win)?.setItem(OFF_KEY, '1'); } catch { /* saqlab bo'lmadi */ }
}

function pickType(win) {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  const can = win?.MediaRecorder?.isTypeSupported;
  return types.find((t) => { try { return can ? can.call(win.MediaRecorder, t) : false; } catch { return false; } }) || '';
}

/**
 * Yozishni boshlaydi. Qaytaradi: { stop(): Promise<string|null>, cancel() } yoki null.
 * stop() — blob URL (eshittirish uchun); juda qisqa yoki bo'sh bo'lsa — null.
 */
export async function startClip({ win = globalThis, maxMs = 8000 } = {}) {
  if (!recorderSupported(win)) return null;
  let stream;
  try {
    stream = await win.navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  } catch {
    return null;
  }
  const chunks = [];
  let rec;
  try {
    const type = pickType(win);
    rec = new win.MediaRecorder(stream, type ? { mimeType: type } : undefined);
  } catch {
    stream.getTracks().forEach((t) => t.stop());
    return null;
  }
  const started = Date.now();
  rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  const release = () => stream.getTracks().forEach((t) => { try { t.stop(); } catch { /* yopilgan */ } });
  const timer = setTimeout(() => { try { if (rec.state !== 'inactive') rec.stop(); } catch { /* yopilgan */ } }, maxMs);
  try { rec.start(); } catch { clearTimeout(timer); release(); return null; }

  const finished = new Promise((resolve) => {
    rec.onstop = () => {
      clearTimeout(timer);
      release();
      if (Date.now() - started < 400 || !chunks.length) { resolve(null); return; }
      const blob = new win.Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      resolve(blob.size > 800 ? win.URL.createObjectURL(blob) : null);
    };
  });
  return {
    stop() {
      try { if (rec.state !== 'inactive') rec.stop(); } catch { /* yopilgan */ }
      return finished;
    },
    cancel() {
      rec.ondataavailable = null;
      try { if (rec.state !== 'inactive') rec.stop(); } catch { /* yopilgan */ }
      clearTimeout(timer);
      release();
    },
  };
}

/** Yozuvni eshittiradi; tugaganda (yoki xato bo'lsa) resolve. */
export function playClip(url, { win = globalThis, maxMs = 9000 } = {}) {
  return new Promise((resolve) => {
    if (!url || !win?.Audio) { resolve(false); return; }
    let done = false;
    const end = (ok) => { if (!done) { done = true; clearTimeout(t); resolve(ok); } };
    const a = new win.Audio(url);
    const t = setTimeout(() => { try { a.pause(); } catch { /* */ } end(true); }, maxMs);
    a.onended = () => end(true);
    a.onerror = () => end(false);
    a.play().catch(() => end(false));
  });
}

export function dropClip(url, win = globalThis) {
  if (url) { try { win.URL.revokeObjectURL(url); } catch { /* */ } }
}
