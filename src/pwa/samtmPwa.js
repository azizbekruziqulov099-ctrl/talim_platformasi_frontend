const BACK_HANDLERS = new Map();
const GUARD_KEY = "__samtm_phone_back_guard__";
let initialized = false;
let installPrompt = null;
let backHandlerOrder = 0;

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

function showInstallButton() {
  if (!installPrompt || document.getElementById("samtm-install-app")) return;
  const button = document.createElement("button");
  button.id = "samtm-install-app";
  button.type = "button";
  button.textContent = "📲 Ilovani o‘rnatish";
  button.setAttribute("aria-label", "Ta’lim AI ilovasini bosh ekranga o‘rnatish");
  Object.assign(button.style, {
    position: "fixed", right: "14px", bottom: "82px", zIndex: "2147483000",
    border: "0", borderRadius: "16px", padding: "12px 16px",
    background: "linear-gradient(135deg,#0D7A77,#175A7A)", color: "#fff",
    fontWeight: "800", fontSize: "13px", boxShadow: "0 10px 28px rgba(23,50,71,.28)",
  });
  button.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => null);
    installPrompt = null;
    removeInstallButton();
  });
  document.body.appendChild(button);
}

function armPhoneBackGuard() {
  if (window.history.state?.[GUARD_KEY]) return;
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

function handlePhoneBack() {
  const handlers = [...BACK_HANDLERS.values()]
    .sort((a, b) => b.priority - a.priority || b.order - a.order);
  let handled = false;
  for (const { handler } of handlers) {
    try {
      if (handler() !== false) {
        handled = true;
        break;
      }
    } catch {
      // Bitta ekran xatosi qolgan ekranlarning orqaga qaytishini buzmaydi.
    }
  }
  if (handled) {
    // Ichki ekran yopilgan bo'lsa keyingi bosish uchun guardni darhol qaytaramiz.
    armPhoneBackGuard();
    return;
  }
  // Saytning bosh ekranida ichki tarix qolmagan: odatiy brauzer xulqiga
  // qaytamiz. Shu tariqa foydalanuvchi ildiz sahifada qamalib qolmaydi.
  window.removeEventListener("popstate", handlePhoneBack);
  window.history.back();
  window.setTimeout(() => {
    // Ayrim WebViewlarda oldingi tarix bo'lmasa history.back() hech narsa
    // qilmaydi. Sahifa shu yerda qolgan bo'lsa ichki navigatsiyani tiklaymiz.
    if (document.visibilityState !== "hidden") {
      window.addEventListener("popstate", handlePhoneBack);
      armPhoneBackGuard();
    }
  }, 500);
}

export function registerPhoneBackHandler(id, handler, explicitPriority) {
  const entry = {
    handler,
    priority: Number.isFinite(explicitPriority) ? explicitPriority : handlerPriority(id),
    order: ++backHandlerOrder,
  };
  BACK_HANDLERS.delete(id);
  BACK_HANDLERS.set(id, entry);
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
    showInstallButton();
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    removeInstallButton();
  });
  if ("serviceWorker" in navigator) {
    const registerWorker = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => null);
    };
    if (document.readyState === "complete") registerWorker();
    else window.addEventListener("load", registerWorker, { once: true });
  }
}
