import {InterfaceContext} from './interface/InterfacePreferences.jsx';
import {uiText as __kbUi} from './interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from './interface/InterfacePreferences.jsx';
import React from "react";
import ReactDOM from "react-dom/client";
import "katex/dist/katex.min.css";
import "./index.css";
import { rasmTiklashniYoq } from "./pwa/rasmTiklash.js";
import { bittaOvozniYoq } from "./speech/bittaOvoz.js";   // REV492
bittaOvozniYoq();
import { versiyaTekshirishniBoshla } from "./pwa/versiyaTekshir.js";   // REV378
import { soroqVaqtiniYoq } from "./pwa/soroqVaqti.js";   // REV467: API so'rovlari abadiy osilmaydi
soroqVaqtiniYoq();
import { yangiVersiyagaOt } from "./pwa/tiklash.js";   // REV413
import { startYangiAlifbo } from "./interface/yangiAlifbo.js";
import { startIzohBayroq } from "./interface/izohBayroq.js";
import App from "./App.jsx";
import { InterfaceProvider } from "./interface/InterfacePreferences.jsx";

rasmTiklashniYoq();
versiyaTekshirishniBoshla();   // REV378: yangi versiya — «🔄 Yangilash» lavhasi   // REV154: yuklanmagan rasm o'zi qayta yuklanadi
// REV221: yangi o'zbek alifbosi (Ö, Ğ, Ş, Ç) — o'zbekcha interfeysdagi barcha matn
try { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startYangiAlifbo); else startYangiAlifbo(); } catch { /* eski brauzer */ }
// REV315: fan nomidagi «(izoh: rus)» — hamma joyda til bayrog'i (dars qaysi tilda o'tilgani ko'rinadi)
try { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startIzohBayroq); else startIzohBayroq(); } catch { /* eski brauzer */ }

// REV133: yangi deploydan keyin ochiq turgan sahifa eski (o'chirilgan) bo'lak faylini so'rasa — sahifa bir marta
// o'zi yangilanadi (aks holda darsni bosganda hech narsa bo'lmay qolardi). Qayta xato bo'lsa — odatdagi xato ekrani.
try {
  window.addEventListener("vite:preloadError", (event) => {
    // REV307: faqat CSS yuklanmasa jim davom etamiz (JS ishlayveradi). JS bo'lagi yuklanmasa — xato yashirilmaydi
    // (aks holda Vite bo'sh modul qaytarib, «reading 'default'» xatosi chiqardi): qayta urinish va kerak bo'lsa
    // sahifani bir marta yangilashni lazy yuklovchilar (_samtmLazyRetry, lazyQayta) va bo'lim xato oynasi qiladi.
    if (/preload CSS/i.test(String(event?.payload?.message || ""))) { event.preventDefault?.(); return; }
    // REV413: JS bo'lagi topilmadi — eski versiya: keshni tozalab yangi versiyaga o'tamiz
    event.preventDefault?.(); yangiVersiyagaOt();
  });
  // sahifa yaxshi ochilgach belgi tozalanadi — keyingi deployda ham bir marta yangilansin
  window.setTimeout(() => { try { window.sessionStorage.removeItem("samtm_chunk_reload"); } catch { /* jim */ } }, 20000);
} catch { /* eski brauzer */ }

// REV415: zaxira himoya — dars ko'rinmay qolganda «butun ekran» belgilari tozalanadi (sayt menyusi yo'qolib, chiqib bo'lmay qolmasin)
try {
  window.setInterval(() => {
    const b = document.body; if (!b) return;
    if (!b.classList.contains("kb-focus-dars") && !b.classList.contains("kb-dars-yotiq")) return;
    const korinadi = [...document.querySelectorAll(".dx-root")].some((el) => el.getClientRects().length > 0);
    if (!korinadi) { b.classList.remove("kb-focus-dars"); b.classList.remove("kb-dars-yotiq"); }
  }, 1500);
} catch { /* eski brauzer */ }

// Keep the root error screen in the entry module (REV34).
class AppErrorBoundary extends React.Component {
  static contextType=InterfaceContext;
  state = { failed: false };

  static getDerivedStateFromError(error) {
    return { failed: true, xato: String(error?.message || error || "").slice(0, 200) };
  }

  // REV504: butun sahifa qulasa — sababi serverga yoziladi (avval bu yerda hech narsa yozilmasdi)
  componentDidCatch(error, info) {
    try {
      const joy = String(info?.componentStack || "").split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 6).join(" ‹ ").slice(0, 400);
      let token = ""; try { token = localStorage.getItem("samtm_login_token_v1") || ""; } catch { /* */ }
      const base = import.meta.env.VITE_API_BASE || "https://talimplatformasi-production.up.railway.app";
      fetch(`${base}/api/frontend_xato`, { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ xato: ("[ILDIZ] " + String(error?.message || error || "") + " " + String(error?.stack || "").split("\n").slice(1, 4).join(" ")).slice(0, 500),
          joy, url: location.pathname, versiya: String(window.__KB_APP_VERSIYA || ""), token }) }).catch(() => {});
    } catch { /* */ }
    // REV504: o'zini o'zi tiklash — foydalanuvchi /tozala'ni bilmasa ham sayt (va ilova) qotib qolmasin:
    //  1-qadam: eski fayllar va keshni tozalab qayta ochish;  2-qadam (yana qulasa): bola/boshqa profil sessiyasidan
    //  asosiy akkauntga qaytish;  3-qadam: kirish ekraniga qaytish (akkaunt va natijalar serverda saqlanadi, hech narsa yo'qolmaydi).
    try {
      const t = Date.now(), K = "kb_tiklash_v1";
      const h = JSON.parse(sessionStorage.getItem(K) || "{}");
      const qadam = h.t && t - h.t < 3 * 60 * 1000 ? (h.q || 0) + 1 : 1;
      sessionStorage.setItem(K, JSON.stringify({ t, q: qadam }));
      if (qadam === 2) {
        try { const fam = JSON.parse(localStorage.getItem("kabutar:family:v1") || "null");
          if (fam?.ownerToken) localStorage.setItem("samtm_login_token_v1", fam.ownerToken);
          localStorage.removeItem("kabutar:family:v1"); } catch { /* */ }
      } else if (qadam >= 3) {
        try { localStorage.removeItem("samtm_login_token_v1"); localStorage.removeItem("kabutar:family:v1"); } catch { /* */ }
        sessionStorage.setItem(K, JSON.stringify({ t: 0, q: 0 }));
      }
      this.setState({ tiklanmoqda: true });
      setTimeout(() => { try { window.location.replace("/tozala.html?auto=1"); } catch { window.location.reload(); } }, 900);
    } catch { /* */ }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f3f7f6", color: "#16353e", fontFamily: "system-ui, sans-serif" }}>
        <section role="alert" style={{ maxWidth: 440, background: "white", padding: 32, borderRadius: 24, boxShadow: "0 16px 60px #183d3a12" }}>
          <small style={{ color: "#087f79", fontWeight: 800, letterSpacing: 2 }}>{__kbUi("KABUTAR")}</small>
          <h1 style={{ fontSize: 26 }}>{this.state.tiklanmoqda ? __kbUi("Sayt o‘zini tiklayapti…") : __kbUi("Bu bo‘limni ochib bo‘lmadi")}</h1>
          <p style={{ lineHeight: 1.6 }}>{this.state.tiklanmoqda ? __kbUi("Bir necha soniya kuting — eski fayllar tozalanib, sayt qayta ochiladi.") : __kbUi("Sahifani yangilab, qayta urinib ko‘ring. Saqlanmagan matn qayta kiritilishi mumkin.")}</p>
          {this.state.xato && <p style={{ fontSize: 12, color: "#7a8a8e", wordBreak: "break-word" }}>{this.state.xato}</p>}
          <button type="button" onClick={() => { try { window.location.href = "/tozala.html"; } catch { yangiVersiyagaOt({ majburiy: true }); } }} style={{ border: 0, borderRadius: 12, background: "#087f79", color: "white", padding: "14px 20px", fontWeight: 700, cursor: "pointer" }}>{__kbUi("Sahifani yangilash")}</button>
        </section>
      </main>
    );
  }
}

function LoadingScreen(){const {t}=useKbInterfaceLocale();return <div style={{padding:32,textAlign:'center'}}>{t('Yuklanmoqda…')}</div>;}

function BootOk() { React.useEffect(() => { try { window.__kbBootOk?.(); } catch { /* */ } }, []); return null; }   // REV441: ilova ochildi — qotish himoyasi o'chadi

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <InterfaceProvider>
    <BootOk />
    <AppErrorBoundary>
      <React.Suspense
        fallback={
          <LoadingScreen/>
        }
      >
        <App />
      </React.Suspense>
    </AppErrorBoundary>
    </InterfaceProvider>
  </React.StrictMode>,
);
