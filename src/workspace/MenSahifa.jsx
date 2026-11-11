// REV488: «📊 Men» — o'quvchi va talabaning hamma natijasi bir joyda: avatar, yakuniy baholar, ko'nikmalar, nishonlar.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { KonikmaBarlar } from "../courses/KonikmaXarita.jsx";
import "./bugunEkran.css";

const RASM = import.meta.glob("../games/ekspeditsiya_rasm/avatar_*.webp", { eager: true, import: "default" });
const kursNomi = (k) => { const p = String(k || "").split("|"); return p.length > 2 ? `${p[1]} · ${/^\d{1,2}$/.test(p[2]) ? `${p[2]}-sinf` : p[2]}` : p[1] || k; };
const rang = (f) => (f == null ? "#cfd8e3" : f >= 86 ? "#2e9e5b" : f >= 71 ? "#4b8ad6" : f >= 56 ? "#f2b72e" : "#d9534f");

export default function MenSahifa({ apiBase, token, ism = "", onTab }) {
  const base = String(apiBase).replace(/\/+$/, "");
  const ol = (yol) => fetch(`${base}${yol}${yol.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const [y, setY] = useState(null), [kn, setKn] = useState(null), [av, setAv] = useState(""), [nish, setNish] = useState([]);
  useEffect(() => {
    ol("/api/yakuniy/hammasi").then((r) => setY(r?.kurslar || []));
    ol("/api/konikma").then((r) => setKn(r?.konikmalar || []));
    ol("/api/ekspeditsiya/profil").then((r) => setAv(r?.avatar || ""));
    ol("/api/bugun").then((b) => { const k = b?.ekspeditsiya?.kurs; if (k) ol(`/api/ekspeditsiya/${k}`).then((e) => setNish((e?.nishonlar || []).filter((n) => n.olindi))); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const rasm = av ? RASM[`../games/ekspeditsiya_rasm/${av}.webp`] : "";
  return <section className="bg-root">
    <header className="bg-men-bosh">{rasm ? <img src={rasm} alt="" /> : <span>{(ism || "?").trim()[0] || "?"}</span>}
      <div><h1>{ism || __kbUi("Men")}</h1><button type="button" onClick={() => onTab("ekspeditsiya")}>{__kbUi("Avatarni almashtirish")}</button></div></header>
    <div className="bg-karta"><b>🎓 {__kbUi("Yakuniy baholarim")}</b>
      {y == null ? <p className="bg-izoh">⏳</p> : !y.length ? <p className="bg-izoh">{__kbUi("Darslar va nazoratlardan keyin bu yerda baholaringiz chiqadi.")}</p>
        : y.map((k) => <div key={k.kalit} className="bg-baho">
          <div className="bg-q"><span>📘 {kursNomi(k.kalit)}</span><b style={{ color: rang(k.foiz) }}>{k.foiz == null ? "—" : `${k.foiz}% · ${k.ball}`}</b></div>
          <div className="bg-qismlar">{k.qismlar.map((q) => <small key={q.kalit} className={q.foiz == null ? "is-yoq" : ""}>{__kbUi(q.nom)}: {q.foiz == null ? "—" : `${q.foiz}%`}</small>)}</div>
          {!k.tasdiqlangan && <small className="bg-izoh">{__kbUi("O‘qituvchi bahosi hali yo‘q")}</small>}</div>)}</div>
    <div className="bg-karta"><b>📊 {__kbUi("Ko‘nikmalarim")}</b>
      {kn == null ? <p className="bg-izoh">⏳</p> : kn.some((k) => k.jami) ? <KonikmaBarlar konikmalar={kn} /> : <p className="bg-izoh">{__kbUi("Hali ma’lumot yo‘q.")}</p>}</div>
    <div className="bg-karta"><b>🏅 {__kbUi("Nishonlarim")}</b>
      {nish.length ? <div className="bg-nishon">{nish.map((n) => <span key={n.kalit} title={__kbUi(n.izoh || "")}>{__kbUi(n.nom)}</span>)}</div>
        : <p className="bg-izoh">{__kbUi("Ekspeditsiyada bosqichlarni o‘tib, nishonlar to‘plang!")}</p>}
      <button type="button" onClick={() => onTab("ekspeditsiya")}>🧭 {__kbUi("Ekspeditsiyaga")} →</button></div>
  </section>;
}
