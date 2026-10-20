// REV154: rasm yuklanmay qolsa (sekin internet, eski kesh, server qayta ishga tushgan payt) — o'zi qayta yuklanadi.
// 1–2 marta yangi manzil bilan (kesh chetlab o'tiladi) qayta so'raladi; baribir bo'lmasa — «singan rasm» belgisi
// ko'rsatilmaydi (rasm joyi bo'sh qoladi). Sof DOM: hamma bo'limdagi <img> uchun bir joyda ishlaydi.
export const RASM_QAYTA_MAX = 2;

/** Qayta so'rash uchun manzil: ?r=… qo'shiladi (data:/blob: — o'zgarmaydi). */
export function qaytaManzil(src, belgi = Date.now().toString(36)) {
  const s = String(src || "");
  if (!s || /^(data|blob):/i.test(s)) return null;
  try {
    const u = new URL(s, globalThis.location?.href || "http://localhost/");
    u.searchParams.set("r", belgi);
    return u.href;
  } catch { return null; }
}

export function rasmTiklashniYoq(doc = globalThis.document) {
  if (!doc || doc.__kbRasmTiklash) return;
  doc.__kbRasmTiklash = true;
  doc.addEventListener("error", (e) => {
    const img = e.target;
    if (!img || img.tagName !== "IMG") return;
    const n = Number(img.dataset.qayta || 0);
    const yangi = n < RASM_QAYTA_MAX ? qaytaManzil(img.currentSrc || img.src) : null;
    if (!yangi) { img.classList.add("kb-rasm-xato"); return; }
    img.dataset.qayta = String(n + 1);
    setTimeout(() => {
      if (!img.isConnected) return;
      if (img.getAttribute("srcset")) img.removeAttribute("srcset");
      img.src = yangi;
    }, 500 * (n + 1));
  }, true);
  doc.addEventListener("load", (e) => { const img = e.target; if (img?.tagName === "IMG" && img.classList.contains("kb-rasm-xato")) img.classList.remove("kb-rasm-xato"); }, true);
}
