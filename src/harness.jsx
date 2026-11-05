import React from "react"; import ReactDOM from "react-dom/client"; import "./index.css";
import Oyin from "./kid/oyin/index.js";
const id = Number(new URLSearchParams(location.search).get("id") || 68);
const el = [{ emoji: "🐶", uz: "kuchuk" }, { emoji: "🐱", uz: "mushuk" }, { emoji: "🐟", uz: "baliq" }, { emoji: "🍎", uz: "olma" }];
ReactDOM.createRoot(document.getElementById("root")).render(<div style={{ width: 820, height: 520, margin: "20px auto", position: "relative", background: "#fff", borderRadius: 22 }}>
  <Oyin id={id} elementlar={el} yosh="6-7" til="uz" izoh="uz" onSay={() => {}} onNatija={() => {}} /></div>);
