const CACHE = "samtm-shell-v2";
const SHELL = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];
const STATIC_PREFIXES = ["/assets/", "/icons/"];

function isStaticAsset(url) {
  return url.pathname === "/manifest.webmanifest"
    || STATIC_PREFIXES.some(prefix => url.pathname.startsWith(prefix));
}

function mayStore(response) {
  const cacheControl = response.headers.get("Cache-Control") || "";
  return response.ok
    && response.type === "basic"
    && !/no-store|private/i.test(cacheControl);
}

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith("samtm-") && key !== CACHE).map(key => caches.delete(key))
    ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Faqat ochiq ilova qobig'i va buildning statik fayllari keshlanadi.
  // Login, token, API, XLSX va boshqa shaxsiy javoblar bu yerga kirmaydi.
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(async response => {
        const contentType = response.headers.get("Content-Type") || "";
        if (mayStore(response) && contentType.includes("text/html")) {
          await caches.open(CACHE).then(cache => cache.put("/", response.clone()));
        }
        return response;
      }).catch(() => caches.match("/"))
    );
    return;
  }
  if (!isStaticAsset(url) || request.headers.has("Authorization")) return;
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(async response => {
      if (mayStore(response)) {
        await caches.open(CACHE).then(cache => cache.put(request, response.clone()));
      }
      return response;
    }))
  );
});
