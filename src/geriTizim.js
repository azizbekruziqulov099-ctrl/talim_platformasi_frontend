// Butun ilova uchun yagona «orqaga» tizimi (telefon/brauzer orqaga tugmasi):
// 1) ochiq ekranda «← Orqaga» / «‹ …» tugmasi bo'lsa — eng ichkisini bosadi (bir qadam orqaga, ilovadan chiqmaydi);
// 2) bo'lmasa — yon menyuda oxirgi bosilgan bo'limga qaytadi (kirgan joyingga);
// 3) hech narsa qolmasa — odatdagidek ilovadan chiqadi.
const ORQA = /^\s*(?:[←‹«<]|←)\s*\S|^\s*(?:orqaga|назад|back|zurück|atrás)\b/i;
const MENYU = "aside, nav, [role='navigation']";
let menyuTarix = [];
const faol = () => {   // yon menyuda hozir ochiq bo'lim (bosishdan oldin aniqlanadi)
  try {
    const hamma = Array.from(document.querySelectorAll(`${MENYU.split(",").map((s) => `${s.trim()} button, ${s.trim()} a`).join(", ")}`));
    const a = hamma.find((x) => korinadi(x) && (x.getAttribute("aria-current") || x.getAttribute("aria-selected") === "true" || x.getAttribute("aria-pressed") === "true" || /(^|[\s_-])(active|selected|current|is-active|faol)([\s_-]|$)/i.test(x.className || "")));
    return a ? matn(a).slice(0, 60) : "";
  } catch { return ""; }
};

const korinadi = (el) => { try { return !!(el.offsetParent || el.getClientRects().length) && !el.disabled && getComputedStyle(el).visibility !== "hidden"; } catch { return false; } };
const matn = (el) => (el.getAttribute("aria-label") || el.textContent || "").trim();

function ichkiOrqaTugma() {
  const hamma = Array.from(document.querySelectorAll("button, a[role='button'], [role='button']"));
  const nom = hamma.filter((el) => korinadi(el) && !el.closest(MENYU) && matn(el).length <= 40 && (ORQA.test(matn(el)) || /orqaga|назад/i.test(el.getAttribute("aria-label") || "")));
  return nom.length ? nom[nom.length - 1] : null;
}

export function geriTizimniYoq() {
  if (typeof window === "undefined" || window.__kabGeri) return;
  window.__kabGeri = 1;
  const surish = () => { try { window.history.pushState({ kabGeri: 1 }, "", window.location.href); } catch { /* */ } };
  surish();
  // yon menyu bosilishlarini eslab boramiz
  document.addEventListener("click", (e) => {
    try {
      const b = e.target.closest && e.target.closest("button, a");
      if (!b || !b.closest(MENYU)) return;
      const t = matn(b).slice(0, 60);
      if (!t) return;
      if (!menyuTarix.length) { const f = faol(); if (f && f !== t) menyuTarix.push(f); }
      if (menyuTarix[menyuTarix.length - 1] !== t) menyuTarix.push(t);
      if (menyuTarix.length > 30) menyuTarix.shift();
    } catch { /* */ }
  }, true);
  window.addEventListener("popstate", () => {
    const ich = ichkiOrqaTugma();
    if (ich) { surish(); ich.click(); return; }
    if (menyuTarix.length > 1) {
      menyuTarix.pop();
      const oldingi = menyuTarix[menyuTarix.length - 1];
      const el = Array.from(document.querySelectorAll(`${MENYU.split(",").map((s) => `${s.trim()} button, ${s.trim()} a`).join(", ")}`)).find((x) => korinadi(x) && matn(x).slice(0, 60) === oldingi);
      if (el) { surish(); el.click(); return; }
    }
    menyuTarix = [];
    window.history.back();   // hech narsa qolmadi — ilovadan chiqish
  });
}
