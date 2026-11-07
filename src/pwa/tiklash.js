// REV413: yangi versiya chiqqanda eski sahifa o'chirilgan bo'lak (chunk) faylini so'rasa — ilova o'zi tiklanadi:
// eski keshlarni tozalaydi, service worker'ni yangilaydi va sahifani yangi manzil bilan qayta ochadi
// (oddiy «reload» ba'zan keshdagi eski sahifani qaytarardi). Cheksiz aylanib qolmasligi uchun 30 soniyada bir martadan ko'p emas.
export const CHUNK_XATO = /dynamically imported module|Importing a module script failed|Loading chunk|Failed to fetch|error loading dynamically|Sahifa bo‘lagi yuklanmadi/i;

export async function yangiVersiyagaOt({ majburiy = false } = {}) {
  if (typeof window === "undefined" || !window.location) return false;   // test muhiti
  let oxirgi = 0;
  try { oxirgi = Number(sessionStorage.getItem("kb_tiklash_vaqt") || 0); } catch { /* */ }
  if (!majburiy && Date.now() - oxirgi < 30000) return false;   // yaqinda urinildi — xato oynasi ko'rinsin
  try { sessionStorage.setItem("kb_tiklash_vaqt", String(Date.now())); } catch { /* */ }
  try { if (window.caches) { const k = await caches.keys(); await Promise.all(k.filter((x) => x.startsWith("samtm-")).map((x) => caches.delete(x))); } } catch { /* */ }
  try { const r = await navigator.serviceWorker?.getRegistration?.(); await r?.update?.(); } catch { /* */ }
  try {
    const u = new URL(window.location.href); u.searchParams.set("_kb", String(Date.now()).slice(-6));
    window.location.replace(u.toString());
  } catch { window.location.reload(); }
  return true;
}

export function chunkXatosimi(err) {
  return CHUNK_XATO.test(String(err?.message || err || ""));
}
