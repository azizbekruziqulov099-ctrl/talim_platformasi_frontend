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

async function yangila() {
  try { const ks = await caches.keys(); await Promise.all(ks.filter((k) => k.startsWith("samtm-")).map((k) => caches.delete(k))); } catch { /* */ }
  try { const r = await navigator.serviceWorker?.getRegistration?.(); await r?.update?.(); } catch { /* */ }
  try { sessionStorage.removeItem("samtm_chunk_reload"); } catch { /* */ }
  window.location.reload();
}

function lavhaKorsat() {
  if (lavha || !document.body) return;
  lavha = document.createElement("div");
  lavha.setAttribute("role", "status");
  lavha.style.cssText = "position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:2147483000;display:flex;gap:10px;align-items:center;padding:10px 12px 10px 16px;border-radius:999px;background:#1B4B7A;color:#fff;font:600 14px/1.2 system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25);max-width:calc(100% - 24px)";
  const t = document.createElement("span"); t.textContent = "Yangi versiya tayyor";
  const b = document.createElement("button"); b.type = "button"; b.textContent = "🔄 Yangilash";
  b.style.cssText = "border:none;border-radius:999px;padding:8px 14px;background:#fff;color:#1B4B7A;font:700 14px system-ui,sans-serif;cursor:pointer";
  b.onclick = yangila;
  const x = document.createElement("button"); x.type = "button"; x.textContent = "✕"; x.setAttribute("aria-label", "Yopish");
  x.style.cssText = "border:none;background:transparent;color:#fff;font-size:16px;cursor:pointer;padding:4px 6px";
  x.onclick = () => { lavha?.remove(); lavha = null; };
  lavha.append(t, b, x); document.body.appendChild(lavha);
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
  window.addEventListener("kb-band-tugadi", () => { if (yangi && !bandmi() && document.visibilityState === "hidden") yangila(); });
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
