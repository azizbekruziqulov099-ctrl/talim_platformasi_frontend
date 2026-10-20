import {InterfaceContext} from './interface/InterfacePreferences.jsx';
import {uiText as __kbUi} from './interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from './interface/InterfacePreferences.jsx';
import React from "react";
import ReactDOM from "react-dom/client";
import "katex/dist/katex.min.css";
import "./index.css";
import { rasmTiklashniYoq } from "./pwa/rasmTiklash.js";
import App from "./App.jsx";
import { InterfaceProvider } from "./interface/InterfacePreferences.jsx";

rasmTiklashniYoq();   // REV154: yuklanmagan rasm o'zi qayta yuklanadi

// REV133: yangi deploydan keyin ochiq turgan sahifa eski (o'chirilgan) bo'lak faylini so'rasa — sahifa bir marta
// o'zi yangilanadi (aks holda darsni bosganda hech narsa bo'lmay qolardi). Qayta xato bo'lsa — odatdagi xato ekrani.
try {
  window.addEventListener("vite:preloadError", (event) => {
    let avval = false;
    try { avval = window.sessionStorage.getItem("samtm_chunk_reload") === "1"; window.sessionStorage.setItem("samtm_chunk_reload", "1"); } catch { /* jim */ }
    if (!avval) { event.preventDefault?.(); window.location.reload(); }
  });
  // sahifa yaxshi ochilgach belgi tozalanadi — keyingi deployda ham bir marta yangilansin
  window.setTimeout(() => { try { window.sessionStorage.removeItem("samtm_chunk_reload"); } catch { /* jim */ } }, 20000);
} catch { /* eski brauzer */ }

// Keep the root error screen in the entry module (REV34).
class AppErrorBoundary extends React.Component {
  static contextType=InterfaceContext;
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f3f7f6", color: "#16353e", fontFamily: "system-ui, sans-serif" }}>
        <section role="alert" style={{ maxWidth: 440, background: "white", padding: 32, borderRadius: 24, boxShadow: "0 16px 60px #183d3a12" }}>
          <small style={{ color: "#087f79", fontWeight: 800, letterSpacing: 2 }}>{__kbUi("KABUTAR")}</small>
          <h1 style={{ fontSize: 26 }}>{__kbUi("Bu bo‘limni ochib bo‘lmadi")}</h1>
          <p style={{ lineHeight: 1.6 }}>{__kbUi("Sahifani yangilab, qayta urinib ko‘ring. Saqlanmagan matn qayta kiritilishi mumkin.")}</p>
          <button type="button" onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 12, background: "#087f79", color: "white", padding: "14px 20px", fontWeight: 700, cursor: "pointer" }}>{__kbUi("Sahifani yangilash")}</button>
        </section>
      </main>
    );
  }
}

function LoadingScreen(){const {t}=useKbInterfaceLocale();return <div style={{padding:32,textAlign:'center'}}>{t('Yuklanmoqda…')}</div>;}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <InterfaceProvider>
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
