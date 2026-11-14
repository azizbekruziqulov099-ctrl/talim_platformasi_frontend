// REV378: yangi versiya chiqqanini bilish va hech kimni «eski fayllar»da qoldirmaslik.
// • Har 10 daqiqada va ilovaga qaytilganda /version.json tekshiriladi.
// • Yangi versiya bo'lsa — pastda kichik «🔄 Yangilash» lavhasi (dars yoki o'yin to'xtatilmaydi).
// • Ilova 10 daqiqadan ko'p fonda turib qaytilsa — o'zi jimgina yangilanadi (bola dars o'rtasida bo'lmaydi).
import { APP_VERSION } from "../appVersion.js";
import { bandmi } from "./band.js";   // REV466

const TEKSHIR_MS = 10 * 60 * 1000, FON_MS = 10 * 60 * 1000;
let yangi = "", fondaKetdi = 0, lavha = null, ishga = false;

async function yangiVersiya() {
  try {
    const r = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return "";
    const j = await r.json();
    return j?.v && j.v !== APP_VERSION ? j.v : "";
  } catch { return ""; }
}

// REV547: matnlar interfeys tiliga qarab (bu fayl React'dan tashqarida ishlaydi — shuning uchun o'z kichik lug'ati bor)
const MATN = {
  uz: { tayyor: "Yangi versiya tayyor", yangila: "Yangilash", yop: "Yopish", sarlavha: "Yangilanmoqda", izoh: "Ilova o‘zi qayta ochiladi.", holat: "Tayyorlanmoqda…" },
  ru: { tayyor: "Доступна новая версия", yangila: "Обновить", yop: "Закрыть", sarlavha: "Обновление", izoh: "Приложение перезапустится само.", holat: "Подготовка…" },
  en: { tayyor: "A new version is ready", yangila: "Update", yop: "Close", sarlavha: "Installing update", izoh: "The app will restart by itself.", holat: "Preparing…" },
};
export const matn = (til) => MATN[String(til || "uz").slice(0, 2).toLowerCase()] || MATN.uz;
const T = () => matn(typeof document !== "undefined" ? document.documentElement.lang : "uz");
const SHRIFT = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
const QORONGI = () => { try { return window.matchMedia("(prefers-color-scheme: dark)").matches && document.documentElement.dataset.theme !== "light"; } catch { return false; } };

/** REV547: yangilanish oynasi — ekran o'rtasida ixcham karta va yuklanish chizig'i. Avval «Yangilash» bosilganda hech narsa
 *  ko'rsatilmay sahifa qayta yuklanardi (bola «qotib qoldi» deb o'ylardi). Qaytaradi: oynani yopuvchi funksiya. */
export function yangilanishOynasi() {
  if (typeof document === "undefined" || !document.body) return () => {};
  const t = T(), q = QORONGI();
  const fon = document.createElement("div");
  fon.setAttribute("role", "alertdialog"); fon.setAttribute("aria-live", "assertive"); fon.setAttribute("aria-label", t.sarlavha); fon.id = "kb-yangilanish";
  fon.style.cssText = `position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;padding:20px;background:${q ? "rgba(0,0,0,.55)" : "rgba(15,23,32,.28)"};backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)`;
  const karta = document.createElement("div");
  karta.style.cssText = `width:min(420px,100%);box-sizing:border-box;padding:22px 22px 20px;border-radius:18px;background:${q ? "#18222d" : "#fff"};color:${q ? "#e8eef5" : "#13314f"};box-shadow:0 18px 50px rgba(0,0,0,.25);font:400 14px/1.4 ${SHRIFT}`;
  const h = document.createElement("div"); h.textContent = t.sarlavha; h.style.cssText = `font:700 19px/1.25 ${SHRIFT};margin-bottom:6px`;
  const i = document.createElement("div"); i.textContent = t.izoh; i.style.cssText = `color:${q ? "#9fb0c2" : "#5b6573"};margin-bottom:16px`;
  const qator = document.createElement("div"); qator.style.cssText = "display:flex;align-items:center;gap:12px";
  const yol = document.createElement("div"); yol.style.cssText = `flex:1;height:6px;border-radius:6px;background:${q ? "#22303f" : "#e3e8ef"};overflow:hidden`;
  const chiziq = document.createElement("div"); chiziq.style.cssText = `width:8%;height:100%;border-radius:6px;background:${q ? "#6fb0ee" : "#1B4B7A"};transition:width .5s ease`;
  const hol = document.createElement("div"); hol.textContent = t.holat; hol.style.cssText = `font:600 13px ${SHRIFT};color:${q ? "#9fb0c2" : "#5b6573"};white-space:nowrap`;
  yol.appendChild(chiziq); qator.append(yol, hol); karta.append(h, i, qator); fon.appendChild(karta); document.body.appendChild(fon);
  // chiziq asta to'ladi (sahifa qayta ochilguncha); aniq foiz emas — «ish ketyapti» belgisi
  const vaqtlar = [setTimeout(() => { chiziq.style.width = "38%"; }, 30), setTimeout(() => { chiziq.style.width = "72%"; }, 520), setTimeout(() => { chiziq.style.width = "92%"; }, 1100)];
  return () => { vaqtlar.forEach(clearTimeout); fon.remove(); };
}

async function yangila({ oyna = true } = {}) {
  const boshi = Date.now();
  if (oyna) { lavha?.remove(); lavha = null; yangilanishOynasi(); }
  try { const ks = await caches.keys(); await Promise.all(ks.filter((k) => k.startsWith("samtm-")).map((k) => caches.delete(k))); } catch { /* */ }
  try { const r = await navigator.serviceWorker?.getRegistration?.(); await r?.update?.(); } catch { /* */ }
  try { sessionStorage.removeItem("samtm_chunk_reload"); } catch { /* */ }
  // oyna kamida 0,7 soniya ko'rinsin — «lip» etib yo'qolib, bola nima bo'lganini tushunmay qolmasin
  if (oyna) await new Promise((ok) => setTimeout(ok, Math.max(0, 700 - (Date.now() - boshi))));
  window.location.reload();
}

/** «Yangi versiya tayyor» lavhasi: ixcham, och rangli. Telefonda YUQORIDA (pastdagi tugma va menyularni to'smaydi), keng ekranda pastda. */
export function lavhaKorsat(bosilganda = () => yangila()) {
  if (lavha || typeof document === "undefined" || !document.body) return lavha;
  const t = T(), q = QORONGI(); const tor = (() => { try { return window.innerWidth <= 640 || window.innerHeight <= 500; } catch { return false; } })();   // telefon: tik yoki yotiq
  lavha = document.createElement("div");
  lavha.setAttribute("role", "status"); lavha.id = "kb-yangi-versiya";
  lavha.style.cssText = `position:fixed;left:50%;transform:translateX(-50%);${tor ? "top:calc(8px + env(safe-area-inset-top,0px))" : "bottom:calc(16px + env(safe-area-inset-bottom,0px))"};z-index:2147483000;display:flex;gap:8px;align-items:center;`
    + `padding:${tor ? "5px" : "6px 6px 6px 14px"};border-radius:999px;background:${q ? "#18222d" : "#fff"};color:${q ? "#e8eef5" : "#13314f"};border:1px solid ${q ? "#2a3a4b" : "#e3e8ef"};font:600 13px/1.2 ${SHRIFT};box-shadow:0 6px 22px rgba(15,23,32,.16);max-width:calc(100% - 20px);white-space:nowrap`;
  // telefonda yozuv ko'rsatilmaydi (joy egallamasin — faqat «Yangilash» va ✕); to'liq matn ekran o'quvchilar uchun qoladi
  lavha.setAttribute("aria-label", t.tayyor); lavha.title = t.tayyor;
  const m = document.createElement("span"); m.textContent = t.tayyor; m.style.cssText = tor ? "display:none" : "overflow:hidden;text-overflow:ellipsis";
  const b = document.createElement("button"); b.type = "button"; b.textContent = t.yangila;
  b.style.cssText = `border:none;border-radius:999px;padding:8px 14px;min-height:36px;background:${q ? "#6fb0ee" : "#1B4B7A"};color:${q ? "#0f1720" : "#fff"};font:700 13px ${SHRIFT};cursor:pointer`;
  b.onclick = () => bosilganda();
  const x = document.createElement("button"); x.type = "button"; x.textContent = "✕"; x.setAttribute("aria-label", t.yop);
  x.style.cssText = `border:none;background:transparent;color:${q ? "#9fb0c2" : "#8a94a3"};font-size:15px;cursor:pointer;min-width:36px;min-height:36px;border-radius:999px`;
  x.onclick = () => { lavha?.remove(); lavha = null; };
  lavha.append(m, b, x); document.body.appendChild(lavha);
  return lavha;
}

async function tekshir() {
  const v = await yangiVersiya();
  if (v) { yangi = v; lavhaKorsat(); }
}

export function versiyaTekshirishniBoshla() {
  if (ishga || typeof window === "undefined" || import.meta.env?.DEV) return;
  ishga = true;
  // REV466: service worker yangi versiyani xabar qiladi — dars/o'yin bo'lmasa, sahifa ko'rinmay turgan paytda jimgina yangilanadi,
  // aks holda faqat lavha (bola uloqtirilmaydi); dars tugagach (band tugadi) va sahifa fonda bo'lsa — yangilanadi
  try { navigator.serviceWorker?.addEventListener?.("message", (e) => { if (e?.data?.tur === "yangi_versiya") { yangi = yangi || "sw"; lavhaKorsat(); } }); } catch { /* */ }
  window.addEventListener("kb-band-tugadi", () => { if (yangi && !bandmi() && document.visibilityState === "hidden") yangila({ oyna: false }); });
  setTimeout(tekshir, 30 * 1000);
  setInterval(() => { if (document.visibilityState === "visible") tekshir(); }, TEKSHIR_MS);
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "hidden") { fondaKetdi = Date.now(); return; }
    const uzoq = fondaKetdi && Date.now() - fondaKetdi > FON_MS;
    fondaKetdi = 0;
    const v = yangi || await yangiVersiya();
    if (!v) return;
    yangi = v;
    if (uzoq && !bandmi()) yangila(); else lavhaKorsat();   // REV466: dars/o'yin o'rtasida — faqat lavha
  });
}
