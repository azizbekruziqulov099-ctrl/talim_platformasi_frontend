// Katta sinf havolasi (?katta=KOD): ro'yxatdan o'tishsiz — Kabu kutib oladi, ism-familiya va tug'ilgan sana so'raladi,
// yoshiga mos yo'nalishlar o'zi tanlanadi, qurilmada «mehmon» hisob ochiladi (Telegram/Gmail keyin ulanadi).
import React, { useEffect, useState } from "react";
import { authRequest } from "../auth/authClient.js";
import "./katta-kirish.css";

export const KATTA_KALIT = "kabutar:xb:katta";
export const KATTA_KIRDI = "kabutar:xb:katta_kirdi";

const SALOM = "Assalomu alaykum, xush kelibsiz! Men Kabuman. Bilimingizni sinab ko‘ring — avval bir-ikki savolga javob bering.";

function sanaOk(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && s < new Date().toISOString().slice(0, 10) && s > "1950-01-01"; }

export default function KattaKirish({ apiBase, kod, token = "", onAuthenticated, onBekor }) {
  const [info, setInfo] = useState(null);
  const [qadam, setQadam] = useState(0);        // 0 salom, 1 ism, 2 sana, 3 yo'nalishlar
  const [ism, setIsm] = useState("");
  const [sana, setSana] = useState("");
  const [yon, setYon] = useState([]);
  const [yosh, setYosh] = useState(null);
  const [xato, setXato] = useState("");
  const [band, setBand] = useState(false);

  useEffect(() => {
    let tirik = true;
    authRequest(apiBase, `/api/xalqaro/katta/${encodeURIComponent(kod)}`)
      .then((d) => tirik && setInfo(d))
      .catch((e) => { if (tirik) { setXato(e.message || "Havola topilmadi"); } });
    return () => { tirik = false; };
  }, [apiBase, kod]);

  const sanaTekshir = async () => {
    if (!sanaOk(sana)) { setXato("Tug‘ilgan sanani to‘liq kiriting"); return; }
    setXato(""); setBand(true);
    try {
      const d = await authRequest(apiBase, `/api/xalqaro/katta/${encodeURIComponent(kod)}?tugilgan=${sana}`);
      if (!d.yonalishlar?.length) { setXato("Afsuski, bu dastur 7 yoshdan katta o‘quvchilar uchun"); return; }
      setYon(d.yonalishlar); setYosh(d.yosh); setQadam(3);
    } catch (e) { setXato(e.message); } finally { setBand(false); }
  };

  const boshla = async () => {
    setXato(""); setBand(true);
    try {
      let t = token;
      if (!t) {
        const d = await authRequest(apiBase, "/auth/quick/start", { body: { role: "oquvchi", name: ism.trim() } });
        t = d.token;
      }
      await authRequest(apiBase, "/api/xalqaro/katta_qoshil", { body: { token: t, kod, ism: ism.trim(), tugilgan: sana } });
      try { localStorage.removeItem(KATTA_KALIT); localStorage.setItem(KATTA_KIRDI, kod); } catch { /* */ }
      onAuthenticated(t);
    } catch (e) { setXato(e.message || "Xatolik. Qayta urinib ko‘ring"); setBand(false); }
  };

  const nom = info?.nom || "";
  return <main className="kk-sahifa">
    <div className="kk-kabu" aria-hidden="true">🕊️</div>
    <section className="kk-karta">
      {nom && <p className="kk-sinf">{nom}{info?.oqituvchi ? ` · ${info.oqituvchi}` : ""}</p>}
      {xato && !info && <><p className="kk-xato" role="alert">{xato}</p><button type="button" className="kk-tugma" onClick={onBekor}>Kirish sahifasiga o‘tish</button></>}
      {info && qadam === 0 && <>
        <p className="kk-nutq">{SALOM}</p>
        <button type="button" className="kk-tugma" onClick={() => setQadam(1)}>Boshlaymiz</button>
      </>}
      {info && qadam === 1 && <>
        <p className="kk-nutq">Ismingiz va familiyangiz nima?</p>
        <input className="kk-input" value={ism} maxLength={80} autoFocus placeholder="Masalan: Dilnoza Karimova" onChange={(e) => setIsm(e.target.value)} />
        <button type="button" className="kk-tugma" disabled={ism.trim().split(" ").filter(Boolean).length < 2} onClick={() => { setXato(""); setQadam(2); }}>Davom etish</button>
        {ism.trim() && ism.trim().split(" ").filter(Boolean).length < 2 && <small>Ism va familiyani birga yozing</small>}
      </>}
      {info && qadam === 2 && <>
        <p className="kk-nutq">Rahmat, {ism.trim().split(" ")[0]}! Tug‘ilgan sanangiz qachon?</p>
        <input className="kk-input" type="date" value={sana} min="1950-01-01" max={new Date().toISOString().slice(0, 10)} onChange={(e) => setSana(e.target.value)} />
        <button type="button" className="kk-tugma" disabled={band || !sana} onClick={sanaTekshir}>Davom etish</button>
      </>}
      {info && qadam === 3 && <>
        <p className="kk-nutq">Siz uchun mos yo‘nalishlar ({yosh} yosh):</p>
        <ul className="kk-yon">{yon.map((y) => <li key={y.toplam}>{y.nomi}</li>)}</ul>
        <p className="kk-kichik">Testlar ketma-ket: har biri alohida ochiladi, chalg‘imaysiz.</p>
        <button type="button" className="kk-tugma" disabled={band} onClick={boshla}>{band ? "Ochilmoqda…" : "Testni boshlash"}</button>
      </>}
      {xato && info && <p className="kk-xato" role="alert">{xato}</p>}
    </section>
  </main>;
}
