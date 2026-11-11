import { uiText } from "../interface/interfaceRuntime.js";
const BACK_HANDLERS = new Map();
const GUARD_KEY = "__samtm_phone_back_guard__";
export const SAMTM_PWA_RELEASE = "samtm-pwa-route-progress-safe-v2.5.0";
let initialized = false;
let installPrompt = null;
let backHandlerOrder = 0;
let backInProgress = false;
let browserExitInProgress = false;
let manualInstallTimer = null;

function dispatchPwaStatus(status, extra = {}) {
  try {
    window.dispatchEvent(new CustomEvent("samtm:pwa-status", {
      detail: { release: SAMTM_PWA_RELEASE, status, ...extra },
    }));
  } catch {
    // Juda eski WebView CustomEvent'ni qo'llamasa ham asosiy ilova ishlaydi.
  }
}

function publicErrorMessage(error) {
  return String(error?.message || "Noma’lum xato")
    .replace(/([?&#](?:token|access_token|code|secret|ticket)=)[^&#\s]+/gi, "$1<redacted>")
    .slice(0, 240);
}

function nextBrowserFrame(callback) {
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => callback());
  } else {
    window.setTimeout(callback, 0);
  }
}

function standaloneMode() {
  return Boolean(
    window.matchMedia?.("(display-mode: standalone)")?.matches
    || window.navigator?.standalone === true
    || /TalimAI-Android/.test(String(window.navigator?.userAgent || ""))   // REV506: Android ilovamiz ichida — o'rnatish taklifi kerak emas
  );
}

// REV506: telefonda «Ta'lim Kabutar» ilovasi o'rnatilgan bo'lsa (Chrome buni sayt va ilova bog'lanishi orqali biladi) —
// brauzerda «Bosh ekranga qo'shish» ko'rsatilmaydi, o'rniga kichik «📱 Ilovada ochish» tugmasi.
let ilovaBor = null;
async function ilovaOrnatilgan() {
  if (ilovaBor !== null) return ilovaBor;
  try {
    const r = await window.navigator?.getInstalledRelatedApps?.();
    ilovaBor = Array.isArray(r) && r.some((a) => a?.id === "uz.talimkabutar.app" || a?.platform === "play");
  } catch { ilovaBor = false; }
  return ilovaBor;
}
function ilovadaOchishTugmasi() {
  if (document.getElementById("samtm-ilovada-och")) return;
  const a = document.createElement("a");
  a.id = "samtm-ilovada-och";
  a.href = `intent://${location.host}${location.pathname}${location.search}#Intent;scheme=https;package=uz.talimkabutar.app;end`;
  a.textContent = "📱 Ilovada ochish";
  a.style.cssText = "position:fixed;right:12px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:70;background:#0D7A77;color:#fff;border-radius:999px;padding:9px 14px;font:700 14px system-ui;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,.18)";
  const yop = document.createElement("button");
  yop.type = "button"; yop.textContent = "✕"; yop.setAttribute("aria-label", "Yopish");
  yop.style.cssText = "margin-left:8px;border:0;background:transparent;color:#fff;font-size:14px;cursor:pointer";
  yop.onclick = (e) => { e.preventDefault(); a.remove(); try { sessionStorage.setItem("kb_ilovada_och_yop", "1"); } catch { /* */ } };
  a.appendChild(yop);
  try { if (sessionStorage.getItem("kb_ilovada_och_yop")) return; } catch { /* */ }
  document.body.appendChild(a);
}

function iosLikeDevice() {
  const userAgent = String(window.navigator?.userAgent || "");
  const platform = String(window.navigator?.platform || "");
  return /iPad|iPhone|iPod/i.test(userAgent)
    || (platform === "MacIntel" && Number(window.navigator?.maxTouchPoints || 0) > 1);
}

function ensureManifest() {
  if (document.querySelector('link[rel="manifest"]')) return;
  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = "/manifest.webmanifest";
  document.head.appendChild(link);
}

function ensureAppleTouchIcon() {
  if (document.querySelector('link[rel="apple-touch-icon"]')) return;
  const link = document.createElement("link");
  link.rel = "apple-touch-icon";
  link.href = "/icons/icon-192.png";
  document.head.appendChild(link);
}

function ensureMeta(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function removeInstallButton() {
  document.getElementById("samtm-install-app")?.remove();
}

// REV80: o'rnatish tugmasi yopilsa 7 kun chiqmaydi — telefonda kontentni to'sib turmasin.
const INSTALL_HIDE_KEY = "samtm:install-hidden-until";
function installHidden() {
  try { return Number(window.localStorage.getItem(INSTALL_HIDE_KEY) || 0) > Date.now(); } catch { return false; }
}
function hideInstallForAWeek() {
  try { window.localStorage.setItem(INSTALL_HIDE_KEY, String(Date.now() + 7 * 24 * 3600 * 1000)); } catch { /* storage ixtiyoriy */ }
  removeInstallButton();
}

function installButton(text, mode, onClick) {
  removeInstallButton();
  if (installHidden()) return null;
  const button = document.createElement("button");
  button.id = "samtm-install-app";
  button.type = "button";
  button.dataset.installMode = mode;
  button.textContent = uiText(text);   // REV122: interfeys tilida
  button.setAttribute("aria-label", mode === "native"
    ? "Ta’lim AI ilovasini bosh ekranga o‘rnatish"
    : "Ta’lim AI ilovasini bosh ekranga qo‘shish yo‘riqnomasini ochish");
  Object.assign(button.style, {
    position: "fixed", right: "14px", bottom: "82px", zIndex: "2147483000",
    border: "0", borderRadius: "16px", padding: "12px 16px",
    background: "linear-gradient(135deg,#0D7A77,#175A7A)", color: "#fff",
    fontWeight: "800", fontSize: "13px", boxShadow: "0 10px 28px rgba(23,50,71,.28)",
  });
  button.addEventListener("click", onClick);
  const close = document.createElement("span");
  close.textContent = "✕";
  close.setAttribute("role", "button");
  close.setAttribute("aria-label", uiText("Yopish"));
  Object.assign(close.style, { marginLeft: "10px", padding: "2px 6px", borderRadius: "8px", background: "rgba(255,255,255,.18)", fontWeight: "900" });
  close.addEventListener("click", (event) => { event.stopPropagation(); hideInstallForAWeek(); });
  button.appendChild(close);
  document.body.appendChild(button);
  return button;
}

function showInstallButton() {
  if (!installPrompt || standaloneMode()) return;
  const existing = document.getElementById("samtm-install-app");
  if (existing?.dataset?.installMode === "native") return;
  installButton("📲 Ilovani o‘rnatish", "native", async () => {
    if (!installPrompt) return;
    const promptEvent = installPrompt;
    try {
      await promptEvent.prompt();
      const choice = await Promise.resolve(promptEvent.userChoice).catch(() => null);
      dispatchPwaStatus("install-choice", { outcome: choice?.outcome || "unknown" });
      installPrompt = null;
      removeInstallButton();
    } catch (error) {
      const message = publicErrorMessage(error);
      installPrompt = null;
      removeInstallButton();
      showManualInstallButton();
      dispatchPwaStatus("install-prompt-failed", { message });
    }
  });
}

// REV378: iPhone/iPad — o'rnatish faqat «Ulashish → Bosh ekranga qo'shish» orqali (Apple boshqa yo'l bermaydi).
// Brauzerga qarab aniq yo'riqnoma: Safari — pastdagi ⬆; Chrome — manzil satridagi ⬆; boshqasi — Safari'da ochish.
function iosYoriqnoma() {
  if (document.getElementById("samtm-ios-yoriq")) return;
  const ua = String(navigator.userAgent || "");
  const chrome = /CriOS/i.test(ua), boshqa = /FxiOS|EdgiOS|OPiOS|YaBrowser|Telegram|Instagram|FBAN|FBAV|Line\//i.test(ua);
  const qadamlar = boshqa
    ? ["Bu brauzerda o‘rnatib bo‘lmaydi.", "Saytni Safari’da oching: talimkabutar.uz", "Keyin pastdagi Ulashish ⬆ tugmasini bosing.", "«Bosh ekranga qo‘shish» → «Qo‘shish»."]
    : chrome
      ? ["Manzil satri yonidagi Ulashish ⬆ tugmasini bosing.", "Ro‘yxatni pastga suring va «Bosh ekranga qo‘shish»ni tanlang.", "«Qo‘shish»ni bosing — Kabutar bosh ekranda paydo bo‘ladi."]
      : ["Safari pastidagi Ulashish ⬆ tugmasini bosing (kvadrat va yuqoriga strelka).", "Ro‘yxatni pastga suring va «Bosh ekranga qo‘shish»ni tanlang.", "«Qo‘shish»ni bosing — Kabutar bosh ekranda ilova bo‘lib turadi."];
  const o = document.createElement("div");
  o.id = "samtm-ios-yoriq"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true");
  o.style.cssText = "position:fixed;inset:0;z-index:2147483001;background:rgba(10,20,35,.55);display:flex;align-items:flex-end;justify-content:center;padding:12px 12px calc(12px + env(safe-area-inset-bottom,0px))";
  const k = document.createElement("div");
  k.style.cssText = "width:min(440px,100%);background:#fff;color:#1d2b3a;border-radius:20px;padding:18px 18px 14px;font:15px/1.45 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.3)";
  const h = document.createElement("b"); h.textContent = uiText("📲 iPhone’ga o‘rnatish"); h.style.cssText = "display:block;font-size:18px;margin-bottom:10px";
  const ol = document.createElement("ol"); ol.style.cssText = "margin:0 0 12px 20px;padding:0;display:flex;flex-direction:column;gap:8px";
  for (const q of qadamlar) { const li = document.createElement("li"); li.textContent = uiText(q); ol.appendChild(li); }
  const y = document.createElement("button"); y.type = "button"; y.textContent = uiText("Tushundim");
  y.style.cssText = "width:100%;border:none;border-radius:14px;padding:12px;background:#1B4B7A;color:#fff;font:700 16px system-ui,sans-serif";
  y.onclick = () => o.remove(); o.onclick = (e) => { if (e.target === o) o.remove(); };
  k.append(h, ol, y); o.appendChild(k); document.body.appendChild(o);
}

function showManualInstallButton() {
  if (installPrompt || standaloneMode() || document.getElementById("samtm-install-app")) return;
  const ios = iosLikeDevice();
  installButton("📲 Bosh ekranga qo‘shish", "manual", () => {
    if (ios) { iosYoriqnoma(); dispatchPwaStatus("manual-install-help", { platform: "ios" }); return; }
    const message = "Brauzer menyusini oching va “Ilovani o‘rnatish” yoki “Bosh ekranga qo‘shish”ni tanlang.";
    window.alert?.(uiText(message));
    dispatchPwaStatus("manual-install-help", { platform: ios ? "ios" : "other" });
  });
  dispatchPwaStatus("manual-install-available", { platform: ios ? "ios" : "other" });
}

function armPhoneBackGuard() {
  if (browserExitInProgress || window.history.state?.[GUARD_KEY]) return;
  window.history.pushState({ ...(window.history.state || {}), [GUARD_KEY]: true }, "", window.location.href);
}

function handlerPriority(id) {
  const normalizedId = String(id || "").toLowerCase();
  if (normalizedId.includes("smart")) return 300;
  if (normalizedId.includes("admissions") || normalizedId.includes("admission") || normalizedId.includes("qabul")) return 260;
  if (normalizedId.includes("structure")) return 220;
  if (
    normalizedId.includes("institute-workspace") ||
    normalizedId.includes("school-workspace")
  ) return 180;
  if (normalizedId.includes("admin-universitetlar")) return 120;
  if (normalizedId.includes("kabinet")) return 50;
  return 0;
}

function runPhoneBackHandlers() {
  const handlers = [...BACK_HANDLERS.values()]
    .sort((a, b) => b.priority - a.priority || b.order - a.order);
  for (const { handler } of handlers) {
    try {
      if (handler() !== false) {
        return true;
      }
    } catch {
      // Bitta ekran xatosi qolgan ekranlarning orqaga qaytishini buzmaydi.
    }
  }
  return false;
}

function finishHandledPhoneBack() {
  // Handler React state'ini yangilaydi. Commitdan keyin yangi ekran handleri
  // ro'yxatdan o'tib ulgurishi uchun qulfni keyingi framegacha ushlab turamiz.
  nextBrowserFrame(() => {
    armPhoneBackGuard();
    backInProgress = false;
    dispatchPwaStatus("back-handled");
  });
}

function releaseBrowserHistory() {
  // Saytning bosh ekranida ichki tarix qolmagan: odatiy brauzer xulqiga
  // qaytamiz. Popstate boshida tezkor bosishni ushlash uchun guard qayta
  // qo'yilgan, shuning uchun undan va uning tagidagi nusxa-entrydan birdan
  // o'tamiz. Bu avvalgi bir bosishda saytdan chiqish xulqini saqlaydi.
  browserExitInProgress = true;
  backInProgress = false;
  window.removeEventListener("popstate", handlePhoneBack);
  window.history.go(-2);
  window.setTimeout(() => {
    // Ayrim WebViewlarda oldingi tarix bo'lmasa history.back() hech narsa
    // qilmaydi. Sahifa shu yerda qolgan bo'lsa ichki navigatsiyani tiklaymiz.
    if (document.visibilityState !== "hidden") {
      browserExitInProgress = false;
      window.addEventListener("popstate", handlePhoneBack);
      armPhoneBackGuard();
      dispatchPwaStatus("back-exit-unavailable");
    }
  }, 500);
}

function handlePhoneBack() {
  if (browserExitInProgress) return;

  // Birinchi popstate kelishi bilan guardni tiklaymiz. Shunda foydalanuvchi
  // Orqaga tugmasini ketma-ket juda tez bossa ham ikkinchi bosish saytni
  // tasodifan yopib yubormaydi yoki ikki ekranni birdan o'tkazib yubormaydi.
  armPhoneBackGuard();
  if (backInProgress) {
    dispatchPwaStatus("back-duplicate-ignored");
    return;
  }
  backInProgress = true;

  if (runPhoneBackHandlers()) {
    finishHandledPhoneBack();
    return;
  }

  // React bir popstate bilan bir vaqtda komponentni almashtirayotgan bo'lsa,
  // yangi handler hali commit qilinmagan bo'lishi mumkin. Keyingi frame'da
  // faqat bir marta qayta tekshiramiz; shundan keyin ham hech kim olmasa,
  // bu haqiqiy ildiz deb qabul qilamiz va brauzer tarixiga qaytamiz.
  nextBrowserFrame(() => {
    if (runPhoneBackHandlers()) finishHandledPhoneBack();
    else releaseBrowserHistory();
  });
}

export function registerPhoneBackHandler(id, handler, explicitPriority) {
  const entry = {
    handler,
    priority: Number.isFinite(explicitPriority) ? explicitPriority : handlerPriority(id),
    order: ++backHandlerOrder,
  };
  BACK_HANDLERS.delete(id);
  BACK_HANDLERS.set(id, entry);
  // Lazy React ekranlari handlerini keyinroq ro'yxatdan o'tkazishi mumkin.
  // Shu paytda guard yo'qolgan bo'lsa, keyingi Orqaga bosishdan oldin tiklanadi.
  if (initialized && !browserExitInProgress) armPhoneBackGuard();
  return () => {
    if (BACK_HANDLERS.get(id) === entry) BACK_HANDLERS.delete(id);
  };
}

export function initializeSamtmPwa() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  ensureManifest();
  ensureAppleTouchIcon();
  ensureMeta("theme-color", "#0D7A77");
  ensureMeta("mobile-web-app-capable", "yes");
  ensureMeta("apple-mobile-web-app-capable", "yes");
  ensureMeta("apple-mobile-web-app-status-bar-style", "default");
  armPhoneBackGuard();
  window.addEventListener("popstate", handlePhoneBack);
  window.addEventListener("beforeinstallprompt", async event => {
    event.preventDefault();
    installPrompt = event;
    if (manualInstallTimer) {
      window.clearTimeout(manualInstallTimer);
      manualInstallTimer = null;
    }
    if (await ilovaOrnatilgan()) { removeInstallButton(); ilovadaOchishTugmasi(); return; }   // REV506
    showInstallButton();
    dispatchPwaStatus("native-install-available");
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    removeInstallButton();
    dispatchPwaStatus("installed");
  });
  if (!standaloneMode()) {
    // iOS beforeinstallprompt bermaydi, shu sabab yo'riqnoma darhol chiqadi.
    // Boshqa brauzerlarda native promptga imkon berib, keyin manual yo'lni
    // ko'rsatamiz. Native event kelsa bu timer yuqorida bekor qilinadi.
    if (iosLikeDevice()) showManualInstallButton();
    else manualInstallTimer = window.setTimeout(async () => {
      manualInstallTimer = null;
      if (await ilovaOrnatilgan()) { ilovadaOchishTugmasi(); return; }   // REV506: ilova bor — o'rnatish taklifi yo'q
      showManualInstallButton();
    }, 2500);
  }
  if ("serviceWorker" in navigator) {
    const registerWorker = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then(async registration => {
          await registration.update().catch(() => {});
          dispatchPwaStatus("service-worker-ready", { scope: registration.scope || "/" });
        })
        .catch(error => {
          const message = publicErrorMessage(error);
          console.warn(`[SamTM PWA ${SAMTM_PWA_RELEASE}] Service worker ro‘yxatdan o‘tmadi: ${message}`);
          dispatchPwaStatus("service-worker-failed", { message });
        });
    };
    if (document.readyState === "complete") registerWorker();
    else window.addEventListener("load", registerWorker, { once: true });
  } else {
    dispatchPwaStatus("service-worker-unsupported");
  }
  dispatchPwaStatus("initialized");
}
