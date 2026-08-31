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
  );
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

function installButton(text, mode, onClick) {
  removeInstallButton();
  const button = document.createElement("button");
  button.id = "samtm-install-app";
  button.type = "button";
  button.dataset.installMode = mode;
  button.textContent = text;
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

function showManualInstallButton() {
  if (installPrompt || standaloneMode() || document.getElementById("samtm-install-app")) return;
  const ios = iosLikeDevice();
  installButton("📲 Bosh ekranga qo‘shish", "manual", () => {
    const message = ios
      ? "Safari pastidagi Ulashish (□↑) tugmasini bosing, keyin “Bosh ekranga qo‘shish”ni tanlang."
      : "Brauzer menyusini oching va “Ilovani o‘rnatish” yoki “Bosh ekranga qo‘shish”ni tanlang.";
    window.alert?.(message);
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
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    if (manualInstallTimer) {
      window.clearTimeout(manualInstallTimer);
      manualInstallTimer = null;
    }
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
    else manualInstallTimer = window.setTimeout(() => {
      manualInstallTimer = null;
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
