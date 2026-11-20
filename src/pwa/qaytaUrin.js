// Server band bo'lib qolsa (502/503/504 yoki baza vaqtincha javob bermasa) — o'qish so'rovlari (GET) 3 marta o'zi qayta uriniladi
// (0,8 → 1,6 → 3,2 soniya + tasodifiy kechikish, hamma bir vaqtda urilib serverni bosmasligi uchun). Odam «Xato 500» ko'rmaydi.
// Yozuv (POST/PUT/DELETE) so'rovlariga tegmaydi — ikki marta saqlanib ketmasin.
const BAND = new Set([502, 503, 504]);

export function qaytaUrinniYoq() {
  if (typeof window === "undefined" || window.__kbQaytaUrin || !window.fetch) return;
  window.__kbQaytaUrin = true;
  const asl = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const usul = String((init && init.method) || (input && input.method) || "GET").toUpperCase();
    const url = String(typeof input === "string" ? input : input?.url || "");
    if (usul !== "GET" || !/\/api\//.test(url) || (init && init.signal?.aborted)) return asl(input, init);
    let oxirgi;
    for (let i = 0; i < 4; i += 1) {
      try {
        const r = await asl(input, init);
        let band = BAND.has(r.status);
        if (!band && r.status === 500) {
          try { const j = await r.clone().json(); band = j?.detail?.code === "DATABASE_ERROR"; } catch { /* */ }
        }
        if (!band || i === 3) return r;
        oxirgi = r;
      } catch (e) {
        if (e?.name === "AbortError" || i === 3) throw e;
      }
      await new Promise((ok) => setTimeout(ok, 800 * 2 ** i + Math.random() * 400));
    }
    return oxirgi;
  };
}
