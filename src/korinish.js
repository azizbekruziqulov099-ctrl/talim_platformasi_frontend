// REV549: «Yangi ko'rinish» (sokin, och uslub) — ixtiyoriy. Yoqilmaguncha hech kimda hech narsa o'zgarmaydi: hamma yangi uslublar
// faqat <html data-kb-korinish="yangi"> bo'lganda ishlaydi (src/korinishYangi.css). Tanlov shu qurilmada saqlanadi.
// Havola orqali ham yoqiladi: ?korinish=yangi  /  ?korinish=eski  (index.html dagi ilk skript sahifa chizilmasdan oldin qo'llaydi).
export const KORINISH_KALIT = "kb_korinish";

/** Saqlangan tanlov: "yangi" | "eski". ombor — localStorage'ga o'xshash obyekt (testda soxtasi beriladi). */
export function korinishOl(ombor) {
  try { return (ombor ?? window.localStorage).getItem(KORINISH_KALIT) === "yangi" ? "yangi" : "eski"; } catch { return "eski"; }
}

/** Tanlovni saqlaydi va sahifaga qo'llaydi. Qaytaradi: qo'llangan qiymat. */
export function korinishQoy(qiymat, { ombor, ildiz } = {}) {
  const v = qiymat === "yangi" ? "yangi" : "eski";
  try { (ombor ?? window.localStorage).setItem(KORINISH_KALIT, v); } catch { /* maxfiy rejim — faqat shu sahifada amal qiladi */ }
  try { const el = ildiz ?? document.documentElement; if (v === "yangi") el.setAttribute("data-kb-korinish", "yangi"); else el.removeAttribute("data-kb-korinish"); } catch { /* */ }
  return v;
}

export const korinishAlmash = (opts) => korinishQoy(korinishOl(opts?.ombor) === "yangi" ? "eski" : "yangi", opts);
