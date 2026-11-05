import React from "react"; import ReactDOM from "react-dom/client"; import "./index.css";
import DarsMuharrir from "./admin/DarsMuharrir.jsx";
const asl = window.fetch.bind(window);
window.fetch = async (u, o) => { const s = String(u);
  if (s.includes("/dars_tahrir/darslar")) return new Response(JSON.stringify({ darslar: [{ topic_code: "T1", mavzu: "1. Mushuk va it", qadamlar: 6, tahrirlar: 1 }, { topic_code: "T2", mavzu: "2. Sigir va qo‘y", qadamlar: 5, tahrirlar: 0 }] }));
  if (s.includes("/dars_tahrir/dars")) return new Response(JSON.stringify({ qadamlar: [
    { id: 1, kod: "T1#S1", tur: "lesson_step", qadam_turi: "kirish", maydonlar: { sarlavha: "Sir", ovoz_matni: "Kabu oltin savatcha topdi. Ichidan «miyov» va «vov» eshitildi!", doska_matni: "🎁 ?", oyin: "" } },
    { id: 2, kod: "T1#S2", tur: "lesson_step", qadam_turi: "tushuncha", maydonlar: { ovoz_matni: "Bu — mushuk. U «miyov-miyov» deydi.", doska_matni: "🐈 mushuk", oyin: "" } },
    { id: 3, kod: "T1#S3", tur: "lesson_step", qadam_turi: "topshiriq", maydonlar: { ovoz_matni: "Eshik yopiq! «Miyov-miyov» de, eshik ochiladi.", doska_matni: "🐈 mushuk\n🐕 it", oyin: "117" } },
    { id: 4, kod: "T1#T1", tur: "task", qadam_turi: "test", maydonlar: { savol: "Kim «miyov» deydi?", variant_a: "🐕 it", variant_b: "🐈 mushuk", togri_javob: "B" } }] }));
  return asl(u, o); };
ReactDOM.createRoot(document.getElementById("root")).render(<DarsMuharrir apiBase="" token="t" />);
