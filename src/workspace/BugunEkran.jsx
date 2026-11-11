// REV487: «🏠 Bugun» — har rol uchun bosh ekran: bugun nima qilaman? (o'quvchi, talaba, o'qituvchi, ota-ona)
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import "./bugunEkran.css";

const kursNomi = (k) => { const p = String(k || "").split("|"); return p.length > 2 ? `${p[1]} · ${/^\d{1,2}$/.test(p[2]) ? `${p[2]}-sinf` : p[2]}` : p[1] || k; };
const salom = () => { const s = new Date().getHours(); return s < 11 ? "Xayrli tong" : s < 17 ? "Xayrli kun" : "Xayrli kech"; };

export default function BugunEkran({ apiBase, token, rol, ism = "", onTab }) {
  const [d, setD] = useState(null), [xato, setXato] = useState("");
  useEffect(() => {
    fetch(`${String(apiBase).replace(/\/+$/, "")}/api/bugun?${new URLSearchParams({ token, rol })}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setD).catch((e) => setXato(String(e.message || e)));
  }, [rol]); // eslint-disable-line react-hooks/exhaustive-deps
  const bosh = <header className="bg-bosh"><small>{__kbUi(salom())}{ism ? `, ${ism.split(" ")[0]}` : ""} 👋</small>
    <h1>{__kbUi("Bugun")}</h1></header>;
  if (xato) return <section className="bg-root">{bosh}<p className="bg-izoh">{__kbUi("Ma’lumot yuklanmadi — internetni tekshiring.")}</p></section>;
  if (!d) return <section className="bg-root">{bosh}<div className="bg-karta bg-skelet" /><div className="bg-karta bg-skelet" /></section>;

  if (d.rol === "oqituvchi") return <section className="bg-root">{bosh}
    {!d.guruhlar.length ? <div className="bg-karta bg-asosiy"><b>👥 {__kbUi("Hali guruh yo‘q")}</b><p>{__kbUi("Kurs sahifasida guruh oching — o‘quvchilarga havola yuborasiz.")}</p>
      <button type="button" onClick={() => onTab("kurslar")}>{__kbUi("Kurslarga o‘tish")} →</button></div>
      : d.guruhlar.map((g) => <div key={g.id} className="bg-karta">
        <div className="bg-q"><b>👥 {g.nom}</b><span>{g.fan} · {g.sinf}</span></div>
        <div className="bg-sonlar"><span><b>{g.azolar}</b> {__kbUi("o‘quvchi")}</span><span><b>{g.bugun_otgan}</b> {__kbUi("bugun dars o‘tdi")}</span>
          {g.diqqat > 0 && <span className="is-diqqat">⚠️ <b>{g.diqqat}</b> {__kbUi("nazoratda diqqat")}</span>}</div>
        <p className="bg-izoh">{g.bugungi ? `📌 ${__kbUi("Bugungi dars")}: ${g.bugungi}` : __kbUi("Bugungi dars hali tanlanmagan")}</p>
        <button type="button" onClick={() => onTab("kurslar")}>{__kbUi("Guruhni ochish")} →</button></div>)}
    <div className="bg-tez"><button type="button" onClick={() => onTab("oqituvchi")}>🧑‍🏫 {__kbUi("To‘garak va repetitorlik")}</button>
      <button type="button" onClick={() => onTab("oqituvchi_analitika")}>📊 {__kbUi("Statistikalar")}</button></div>
  </section>;

  if (d.rol === "ota-ona") return <section className="bg-root">{bosh}
    {!d.bolalar.length ? <div className="bg-karta bg-asosiy"><b>👧 {__kbUi("Farzand qo‘shilmagan")}</b><p>{__kbUi("Profil → «Farzandlarim» bo‘limida farzandingizni qo‘shing.")}</p>
      <button type="button" onClick={() => onTab("profil")}>{__kbUi("Profilga o‘tish")} →</button></div>
      : d.bolalar.map((b) => <div key={b.id} className={`bg-karta ${b.bugun ? "is-yashil" : ""}`}>
        <div className="bg-q"><b>👧 {b.ism}</b><span>{b.bugun ? `✅ ${__kbUi("bugun dars qildi")}` : `⏳ ${__kbUi("bugun hali dars qilmadi")}`}</span></div>
        <div className="bg-sonlar"><span><b>{b.bugun}</b> {__kbUi("bugun")}</span><span><b>{b.hafta}</b> {__kbUi("shu hafta")}</span>
          {b.qulf && <span className="is-diqqat">🕵️ {__kbUi("o‘yinlar to‘xtatilgan")}</span>}</div>
        <button type="button" onClick={() => onTab("farzand")}>{__kbUi("Batafsil va haftalik hisobot")} →</button></div>)}
  </section>;

  const asosiy = d.kurslar[0];
  return <section className="bg-root">{bosh}
    {asosiy ? <div className={`bg-karta bg-asosiy ${asosiy.bugun ? "is-yashil" : ""}`}>
      <b>📚 {kursNomi(asosiy.kalit)}</b>
      <p>{asosiy.bugun ? `✅ ${__kbUi("Bugungi dars o‘tildi — barakalla! Keyingisi ertaga ochiladi.")}` : `▶ ${__kbUi("Bugungi darsingiz sizni kutyapti.")}`} · {asosiy.otilgan} {__kbUi("ta dars o‘tilgan")}</p>
      <button type="button" onClick={() => onTab("kurslar")}>{asosiy.bugun ? __kbUi("Kursni ochish") : __kbUi("Darsni boshlash")} →</button></div>
      : <div className="bg-karta bg-asosiy"><b>📚 {__kbUi("Birinchi kursingizni tanlang")}</b><p>{__kbUi("Matematika, tillar, fanlar — darslar Kabu va ustoz bilan.")}</p>
        <button type="button" onClick={() => onTab("kurslar")}>{__kbUi("Kurslar")} →</button></div>}
    {d.kurslar.slice(1).map((k) => <button key={k.kalit} type="button" className="bg-qator" onClick={() => onTab("kurslar")}>
      <span>📘 {kursNomi(k.kalit)}</span><small>{k.bugun ? "✅" : "▶"} {k.otilgan} {__kbUi("dars")}</small></button>)}
    <div className="bg-tez">
      <button type="button" onClick={() => onTab("ekspeditsiya")}>🧭 {__kbUi("Ekspeditsiya")}{d.ekspeditsiya?.seriya ? ` · 🔥 ${d.ekspeditsiya.seriya}` : ""}</button>
      <button type="button" onClick={() => onTab("oyinlar")}>🎮 {__kbUi("O‘yinlar")}</button>
      <button type="button" onClick={() => onTab("test")}>📝 {__kbUi("Testlar")}</button>
    </div>
    {d.nazoratlar.length > 0 && <div className="bg-karta"><b>📝 {__kbUi("Oxirgi nazoratlar")}</b>
      {d.nazoratlar.map((n, i) => <p key={i} className="bg-izoh">{kursNomi(n.kalit)} · {n.togri}/{n.jami} {n.otdi ? "✅" : "❌"}</p>)}</div>}
    {(d.kuchli || d.zaif) && <div className="bg-karta"><b>📊 {__kbUi("Ko‘nikmalarim")}</b>
      {d.kuchli && <p className="bg-izoh">💪 {__kbUi(d.kuchli.nom)} — {d.kuchli.foiz}%</p>}
      {d.zaif && <p className="bg-izoh">🎯 {__kbUi("Mashq kerak")}: {__kbUi(d.zaif.nom)} — {d.zaif.foiz}%</p>}</div>}
  </section>;
}
