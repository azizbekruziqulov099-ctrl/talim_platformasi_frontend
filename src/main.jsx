import React from "react";
import ReactDOM from "react-dom/client";
import "katex/dist/katex.min.css";
import "./index.css";
import App from "./App.jsx";
import { InterfaceProvider } from "./interface/InterfacePreferences.jsx";

// Keep the root error screen in the entry module (REV34).
class AppErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f3f7f6", color: "#16353e", fontFamily: "system-ui, sans-serif" }}>
        <section role="alert" style={{ maxWidth: 440, background: "white", padding: 32, borderRadius: 24, boxShadow: "0 16px 60px #183d3a12" }}>
          <small style={{ color: "#087f79", fontWeight: 800, letterSpacing: 2 }}>KABUTAR</small>
          <h1 style={{ fontSize: 26 }}>Bu bo‘limni ochib bo‘lmadi</h1>
          <p style={{ lineHeight: 1.6 }}>Sahifani yangilab, qayta urinib ko‘ring. Saqlanmagan matn qayta kiritilishi mumkin.</p>
          <button type="button" onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 12, background: "#087f79", color: "white", padding: "14px 20px", fontWeight: 700, cursor: "pointer" }}>Sahifani yangilash</button>
        </section>
      </main>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <InterfaceProvider>
    <AppErrorBoundary>
      <React.Suspense
        fallback={
          <div style={{ padding: 32, textAlign: "center", color: "#1B4B7A" }}>
            Yuklanmoqda…
          </div>
        }
      >
        <App />
      </React.Suspense>
    </AppErrorBoundary>
    </InterfaceProvider>
  </React.StrictMode>,
);
