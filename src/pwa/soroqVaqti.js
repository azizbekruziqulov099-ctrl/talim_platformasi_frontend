// REV467: «mijoz qotib qolmasin» — API'ga GET so'rov server javob bermasa abadiy kutmaydi (25 s chegarasi):
// tugma «⏳» holatida osilib qolmaydi, xato chiqadi va qayta urinish mumkin. Yuklab olish, media, ovoz va
// o'z signaliga ega so'rovlar (masalan, AI suhbat oqimi) bunga tegilmaydi. Tarmoq uzilganda bir marta qayta urinadi.
const CHEGARA_MS = 25000;
const ISTISNO = /\/(yuklab|media|ovoz|ai_miya_media|stream|eksport|export|fayl)(\/|\?|$)/i;

export function soroqVaqtiniYoq() {
  if (typeof window === "undefined" || window.__kbFetchVaqt || typeof window.fetch !== "function") return;
  window.__kbFetchVaqt = true;
  const asl = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";
    const usul = String(init?.method || (typeof input === "object" && input?.method) || "GET").toUpperCase();
    if (usul !== "GET" || !/\/api\//.test(url) || ISTISNO.test(url) || init?.signal || typeof AbortController === "undefined") return asl(input, init);
    const urin = async () => {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), CHEGARA_MS);
      try { return await asl(input, { ...init, signal: ctl.signal }); } finally { clearTimeout(t); }
    };
    try { return await urin(); }
    catch (e) {
      if (e?.name === "AbortError") throw new Error("Server javob bermadi — internetni tekshirib, qayta urinib ko‘ring");
      await new Promise((r) => setTimeout(r, 800));   // tarmoq bir lahza uzilgan bo'lishi mumkin — bir marta qayta
      return urin();
    }
  };
}
