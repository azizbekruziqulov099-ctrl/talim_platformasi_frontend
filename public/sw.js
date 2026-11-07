const CACHE = "samtm-shell-v20-rev398";   // REV398
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

function matchesAssetType(url, response) {
  const contentType = String(response.headers.get("Content-Type") || "").toLowerCase();
  if (/\.(?:m?js)$/i.test(url.pathname)) {
    return contentType.includes("javascript") || contentType.includes("ecmascript");
  }
  if (/\.css$/i.test(url.pathname)) return contentType.includes("text/css");
  // Rasm, shrift, manifest va boshqa statik fayllarda HTML fallbackni
  // keshlamaslikning o'zi yetarli.
  return !contentType.includes("text/html");
}

// REV398: o'rnatishda har fayl alohida keshlanadi — bittasi (masalan, ikonka) yuklanmasa ham ilova qobig'i saqlanadi.
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => Promise.all(SHELL.map(u => cache.add(u).catch(() => {})))));
  self.skipWaiting();
});

// REV398: yangi versiya faollashganda eski versiyada qotib qolgan oynalar o'zi qayta yuklanadi
// (telefondagi ilova eski fayllarni so'rab «Bo'lim yuklanmadi» deb turib qolmasin).
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(async keys => {
      const eski = keys.filter(key => key.startsWith("samtm-") && key !== CACHE);
      await Promise.all(eski.map(key => caches.delete(key)));
      await self.clients.claim();
      if (eski.length) {
        const oynalar = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        await Promise.all(oynalar.map(c => (c.navigate ? c.navigate(c.url).catch(() => {}) : null)));
      }
    })
  );
});

// REV398: internet juda sekin yoki uzilganda — oddiy yozuv emas, o'zi qayta urinadigan tushunarli sahifa
const OFLAYN_HTML = `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kabutar</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f7f5f0;font-family:system-ui,sans-serif;color:#1d2b3a}
.k{max-width:340px;padding:28px;text-align:center}h1{font-size:20px;margin:12px 0 6px}p{color:#5b6573;line-height:1.5;margin:0 0 18px}
button{border:none;border-radius:14px;background:#1B4B7A;color:#fff;font:700 16px system-ui;padding:14px 22px}small{display:block;margin-top:14px;color:#8a93a0}</style></head>
<body><div class="k"><div style="font-size:44px">🕊️</div><h1>Internet sekin yoki uzildi</h1><p>Ilova internet qaytishi bilan o'zi ochiladi.</p>
<button onclick="location.reload()">🔄 Qayta urinish</button><small id="s">Har 5 soniyada qayta urinyapti…</small></div>
<script>setInterval(function(){fetch("/version.json?t="+Date.now(),{cache:"no-store"}).then(function(r){if(r.ok)location.reload()}).catch(function(){})},5000);window.addEventListener("online",function(){location.reload()});</script></body></html>`;

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Faqat ochiq ilova qobig'i va buildning statik fayllari keshlanadi.
  // Login, token, API, XLSX va boshqa shaxsiy javoblar bu yerga kirmaydi.
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    // REV398: tarmoq birinchi; javob kelishi bilan nusxasi keshga yoziladi (keyingi safar oflayn ochilishi uchun).
    // Juda sekin internetda 10 soniyada javob kelmasa — keshdagi qobiq ochiladi; kesh ham bo'lmasa — o'zi qayta urinadigan sahifa.
    const tarmoq = fetch(request).then(response => {
      const contentType = response.headers.get("Content-Type") || "";
      if (mayStore(response) && contentType.includes("text/html") && (url.pathname === "/" || url.pathname === "/index.html")) {
        const nusxa = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put("/", nusxa)).catch(() => {}));
      }
      return response;
    });
    const keshdan = () => caches.match("/", { ignoreSearch: true });
    const kutish = new Promise(resolve => setTimeout(() => keshdan().then(resolve), 10000));
    event.respondWith(
      Promise.race([tarmoq, kutish.then(c => c || tarmoq)])
        .catch(async () => (await keshdan()) || new Response(OFLAYN_HTML, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }))
    );
    return;
  }
  if (!isStaticAsset(url) || request.headers.has("Authorization")) return;
  // REV154: rasm, ovoz va shriftlar service worker orqali o'tmaydi — brauzerning o'z keshi (1 yillik, o'zgarmas
  // nomli fayllar) ishlaydi. Oldin rasm ham shu yerda keshlanardi: telefon xotirasi to'lsa yoki eski kesh buzilsa,
  // rasmlar «singan» chiqardi va sahifa qotardi.
  if (request.destination === "image" || request.destination === "audio" || request.destination === "font"
    || /\.(?:webp|png|jpe?g|gif|svg|avif|ico|mp3|woff2?|ttf)$/i.test(url.pathname)) return;
  // REV130: build fayllari nomida xesh bor (o'zgarmaydi) — avval keshdan, tarmoqqa chiqmasdan (sekin internetda qotmaydi).
  if (url.pathname.startsWith("/assets/") && /-[A-Za-z0-9_-]{6,}\.[a-z0-9]+$/.test(url.pathname)) {
    event.respondWith(caches.match(request).then(hit => hit || fetch(request).then(response => {
      // REV154: javob darhol beriladi, keshga yozish orqada (sahifa kutib qolmaydi)
      if (mayStore(response) && matchesAssetType(url, response)) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {}));
      }
      return response;
    })));
    return;
  }
  event.respondWith(
    fetch(request).then(async response => {
      if (!matchesAssetType(url, response)) {
        const cached = await caches.match(request);
        return cached || new Response("Statik fayl o‘rniga HTML javobi keldi; qayta yuklang.", {
          status: 502,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
      if (mayStore(response)) {
        // Kesh kvotasi yoki eski WebView cache xatosi haqiqiy network
        // javobini yo'qotmasligi kerak.
        await caches.open(CACHE).then(cache => cache.put(request, response.clone())).catch(() => {});
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      return cached || new Response("Statik faylni yuklab bo‘lmadi.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    })
  );
});
