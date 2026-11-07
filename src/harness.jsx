import React from "react"; import ReactDOM from "react-dom/client"; import "./index.css"; import "./lesson/dars-xonasi.css"; import "katex/dist/katex.min.css";
import { BoardText } from "./lesson/AmaliyDoska.jsx";
const t = "Burchaklari $100^\\circ$, $90^\\circ$ va $70^\\circ$ bo‘lgan to‘rtburchakning to‘rtinchi burchagi nechaga teng?";
ReactDOM.createRoot(document.getElementById("root")).render(<div className="dx-root dx-sinf" style={{ width: 780, padding: 20, background: "#0e2a44", color: "#fff" }}>
  <div className="dx-board" style={{ minHeight: 200, padding: 20 }}><button className="dx-burchak-daftar">📝</button><div className="dx-q" style={{ fontSize: 26 }}><BoardText text={t} /></div></div></div>);
