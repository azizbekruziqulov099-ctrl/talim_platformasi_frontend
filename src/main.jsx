import React from "react";
import ReactDOM from "react-dom/client";
import "katex/dist/katex.min.css";
import "./index.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <React.Suspense
      fallback={
        <div style={{ padding: 32, textAlign: "center", color: "#1B4B7A" }}>
          Yuklanmoqda…
        </div>
      }
    >
      <App />
    </React.Suspense>
  </React.StrictMode>,
);
