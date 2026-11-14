// REV488: «👥 Guruhlarim» — o'qituvchining barcha kurs guruhlari bitta joyda: havola, a'zolar, kamera, nazoratlar, baholar.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { kgFetch, Nazoratlar, Baholar } from "./KursGuruh.jsx";
import "./kabutarKurslar.css";
import "../workspace/bugunEkran.css";

export default function Guruhlarim({ apiBase, token, onTab }) {
  const [d, setD] = useState(null), [xato, setXato] = useState(""), [ochiq, setOchiq] = useState({}), [nusxa, setNusxa] = useState(null);
  const yukla = () => kgFetch(apiBase, "/api/kurs_guruh", token).then(setD).catch((e) => setXato(e.message));
  useEffect(() => { yukla(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const havola = (g) => `${window.location.origin}/?kurs_guruh=${encodeURIComponent(g.kod)}`;
  const och = (id, k) => setOchiq((o) => ({ ...o, [id]: o[id] === k ? null : k }));
  if (xato) return <section className="bg-root"><p className="kk-xato">{xato}</p></section>;
  if (!d) return <section className="bg-root"><div className="bg-karta bg-skelet" /></section>;
  return <section className="bg-root">
    <header className="bg-bosh"><h1>👥 {__kbUi("Guruhlarim")}</h1></header>
    {!d.meniki.length && <div className="bg-karta bg-asosiy"><b>{__kbUi("Hali guruh yo‘q")}</b><p>{__kbUi("Kursni oching va «Guruh ochish»ni bosing — o‘quvchilarga havola yuborasiz.")}</p>
      <button type="button" onClick={() => onTab("kurslar")}>{__kbUi("Kurslarga")} →</button></div>}
    {d.meniki.map((g) => <div key={g.id} className="bg-karta">
      <div className="bg-q"><b>👥 {g.nom}</b><span>{g.kurs_nomi || g.fan} · {g.grade}</span></div>
      <div className="bg-sonlar"><span><b>{g.azolar}</b> {__kbUi("o‘quvchi")}</span>{g.bugungi_nom && <span>📌 {g.bugungi_nom}</span>}</div>
      <div className="bg-tugmalar">
        <button type="button" onClick={() => { navigator.clipboard?.writeText(havola(g)).catch(() => {}); setNusxa(g.id); setTimeout(() => setNusxa(null), 1600); }}>{nusxa === g.id ? "✅ " : "🔗 "}{__kbUi("Havola")}</button>
        <button type="button" className={ochiq[g.id] === "nz" ? "is-on" : ""} onClick={() => och(g.id, "nz")}>📋 {__kbUi("Nazoratlar")}</button>
        <button type="button" className={ochiq[g.id] === "baho" ? "is-on" : ""} onClick={() => och(g.id, "baho")}>🎓 {__kbUi("Baholar")}</button>
        <label className="kg-kamera"><input type="checkbox" checked={Boolean(g.kamera)} onChange={(e) => kgFetch(apiBase, `/api/kurs_guruh/${g.id}/kamera`, token, { method: "POST", body: { kamera: e.target.checked } }).then(yukla).catch((x) => setXato(x.message))} /> 📷 {__kbUi("Kamera")}</label>
        <button type="button" onClick={() => onTab("kurslar")}>📚 {__kbUi("Kursda ochish")}</button>
        <button type="button" onClick={() => onTab("kabu_loyiha")}>🔬 {__kbUi("Kabu loyiha")}</button>   {/* REV544: guruhga STEAM loyiha berish */}
      </div>
      {ochiq[g.id] === "nz" && <Nazoratlar apiBase={apiBase} token={token} g={g} />}
      {ochiq[g.id] === "baho" && <Baholar apiBase={apiBase} token={token} g={g} />}
    </div>)}
    {d.azolik?.length > 0 && <div className="bg-karta"><b>🎒 {__kbUi("A’zo bo‘lgan guruhlarim")}</b>{d.azolik.map((g) => <p key={g.id} className="bg-izoh">{g.nom} · {g.kurs_nomi || g.fan}</p>)}</div>}
  </section>;
}
