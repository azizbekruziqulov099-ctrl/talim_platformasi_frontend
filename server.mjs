// REV130: production uchun yengil statik server (faqat Node.js, qo'shimcha paketsiz).
// `vite preview` — sinov serveri: siqmaydi (gzip/brotli yo'q), keshlash sarlavhalarini to'g'ri qo'ymaydi va ko'p
// foydalanuvchiga mo'ljallanmagan. Bu server:
//   • dist/ ichidagi fayllarni beradi; build fayllari (/assets/*-xesh.*) — 1 yil kesh (immutable);
//   • index.html va sw.js — har doim yangisi tekshiriladi (yangi versiya darhol yetib boradi);
//   • matnli fayllarni brotli yoki gzip bilan siqadi va siqilganini xotirada saqlaydi;
//   • /maktab kabi sahifa yo'llarida index.html qaytaradi (SPA).
// Ishga tushirish: node server.mjs [--host 0.0.0.0] [--port 8080]   (yoki PORT muhit o'zgaruvchisi)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), process.env.STATIC_DIR || "dist");
const args = process.argv.slice(2);
const arg = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const PORT = Number(arg("port") || process.env.PORT || 8080);
const HOST = arg("host") || process.env.HOST || "0.0.0.0";

const TURLAR = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
  ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".mp3": "audio/mpeg", ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm", ".map": "application/json; charset=utf-8",
};
const SIQILADI = new Set([".html", ".js", ".mjs", ".css", ".json", ".webmanifest", ".svg", ".txt", ".map", ".ico", ".ttf"]);
const XESHLI = /-[A-Za-z0-9_-]{6,}\.[a-z0-9]+$/;

// Fayl va uning siqilgan nusxalari xotirada (build o'zgarmaydi — server qayta ishga tushganda yangilanadi).
const KESH = new Map();   // yo'l -> { buf, br, gz, tur, etag }
const KESH_MAX_BAYT = Number(process.env.STATIC_CACHE_MB || 200) * 1024 * 1024;
let keshBayt = 0;

function topish(urlPath) {
  let p;
  try { p = decodeURIComponent(urlPath.split("?")[0]); } catch { return null; }
  if (p.includes("\0")) return null;
  const full = path.normalize(path.join(ROOT, p));
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return null;   // ../ bilan tashqariga chiqib bo'lmaydi
  try {
    const st = fs.statSync(full);
    if (st.isFile()) return full;
    if (st.isDirectory()) { const idx = path.join(full, "index.html"); if (fs.existsSync(idx)) return idx; }
  } catch { /* yo'q */ }
  return null;
}

function yukla(full) {
  const hit = KESH.get(full);
  if (hit) return hit;
  const buf = fs.readFileSync(full);
  const ext = path.extname(full).toLowerCase();
  const st = fs.statSync(full);
  const item = { buf, tur: TURLAR[ext] || "application/octet-stream", etag: `"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`, ext };
  if (SIQILADI.has(ext) && buf.length > 1024) {
    item.br = zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length } });
    item.gz = zlib.gzipSync(buf, { level: 9 });
  }
  const hajm = buf.length + (item.br?.length || 0) + (item.gz?.length || 0);
  if (keshBayt + hajm <= KESH_MAX_BAYT) { KESH.set(full, item); keshBayt += hajm; }
  return item;
}

function keshSarlavha(full, urlPath) {
  const nom = path.basename(full);
  if (nom === "index.html" || nom === "sw.js" || nom === "manifest.webmanifest") return "no-cache";
  if (urlPath.startsWith("/assets/") && XESHLI.test(urlPath.split("?")[0])) return "public, max-age=31536000, immutable";
  return "public, max-age=86400";
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405, { Allow: "GET, HEAD" }); res.end(); return; }
  const urlPath = req.url || "/";
  if (urlPath === "/healthz") { res.writeHead(200, { "Content-Type": "text/plain" }); res.end("ok"); return; }
  let full = topish(urlPath);
  // SPA: kengaytmasiz yo'l (masalan /maktab) — index.html; yo'q fayl (/assets/x.js) — 404 (eski kesh HTML olmasin)
  if (!full) {
    if (path.extname(urlPath.split("?")[0])) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }); res.end("Topilmadi"); return; }
    full = path.join(ROOT, "index.html");
  }
  let item;
  try { item = yukla(full); } catch { res.writeHead(500); res.end(); return; }
  const headers = {
    "Content-Type": item.tur, "Cache-Control": keshSarlavha(full, urlPath), ETag: item.etag,
    "X-Content-Type-Options": "nosniff", Vary: "Accept-Encoding",
    // REV152 (xavfsizlik): faqat HTTPS; sayt begona sahifa ichiga (ramkaga) qo'yilmaydi (Telegram ilovasidan tashqari);
    // plaginlar va <base> almashtirish taqiqlangan; mikrofon/kamera faqat saytning o'zida.
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org; object-src 'none'; base-uri 'self'",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "microphone=(self), camera=(self), geolocation=(self), payment=()",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  };
  if ((req.headers["if-none-match"] || "") === item.etag) { res.writeHead(304, headers); res.end(); return; }
  const qabul = String(req.headers["accept-encoding"] || "");
  let body = item.buf;
  if (item.br && /\bbr\b/.test(qabul)) { body = item.br; headers["Content-Encoding"] = "br"; }
  else if (item.gz && /\bgzip\b/.test(qabul)) { body = item.gz; headers["Content-Encoding"] = "gzip"; }
  headers["Content-Length"] = body.length;
  res.writeHead(200, headers);
  res.end(req.method === "HEAD" ? undefined : body);
});
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

if (!fs.existsSync(path.join(ROOT, "index.html"))) {
  console.error(`[server] ${ROOT}/index.html topilmadi — avval "npm run build" qiling.`);
  process.exit(1);
}
server.listen(PORT, HOST, () => console.log(`[server] ${ROOT} → http://${HOST}:${PORT}`));
for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => server.close(() => process.exit(0)));
