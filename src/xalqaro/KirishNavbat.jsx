// Katta sinf havolasi bilan kirgan o'quvchi: kirish testlari ketma-ket (matematika → tabiiy fan → o'qish → moliya), har biri alohida;
import "./katta-kirish.css";
// oxirida Kabu natijani ko'rsatadi. Navbat qurilmada saqlanadi — sahifa yangilansa ham davom etadi.
import React, { useEffect, useState } from "react";
import { XbUstoz } from "./XbDoska.jsx";
import XbImtihon from "./XbImtihon.jsx";
import { xbFetch } from "./xbOvoz.js";
import { navbatHolati, navbatNatijaQosh } from "./kattaRules.js";

const KALIT = "kabutar:xb:navbat";
const NOM = { T11_G4_M: "Matematika (4-sinf)", T11_G4_S: "Tabiiy fan (4-sinf)", T11_G8_M: "Matematika (8-sinf)", T11_G8_S: "Tabiiy fan (8-sinf)",
  P_M: "Matematik savodxonlik", P_S: "Tabiiy-ilmiy savodxonlik", P_R: "O‘qish savodxonligi", P_F: "Moliyaviy savodxonlik" };
const DAQIQA = { T11_G4_M: 25, T11_G4_S: 25, T11_G8_M: 30, T11_G8_S: 30, P_M: 35, P_S: 35, P_R: 35, P_F: 35 };
const oqi = () => { try { return JSON.parse(localStorage.getItem(KALIT) || "null") || { royxat: [], natijalar: [] }; } catch { return { royxat: [], natijalar: [] }; } };
const yoz = (n) => { try { localStorage.setItem(KALIT, JSON.stringify(n)); } catch { /* */ } };

function Xulosa({ apiBase, token, natijalar, onYop, ustoz }) {
  const [qator, setQator] = useState(null);
  useEffect(() => {
    let tirik = true;
    Promise.all(natijalar.map((n) => xbFetch(apiBase, `/api/xalqaro/imtihon/${n.id}`, token).then((r) => ({ nom: NOM[n.toplam] || n.toplam, r })).catch(() => ({ nom: NOM[n.toplam] || n.toplam, r: null }))))
      .then((x) => tirik && setQator(x));
    return () => { tirik = false; };
  }, [apiBase, token, natijalar]);
  return <div className="xb-panel kk-xulosa">
    <XbUstoz ustoz={ustoz} mood="happy" />
    <h3>Barakalla! Barcha testlar topshirildi</h3>
    <p className="xb-muted">Mana natijalaringiz. Kirish testi bahoga ta’sir qilmaydi — u darajangizni aniqlaydi va sizni mos guruhga qo‘shadi.</p>
    {!qator ? <p className="xb-muted">⏳ Hisoblanmoqda…</p> : <ul className="kk-natija-list">{qator.map(({ nom, r }) => <li key={nom}>
      <b>{nom}</b>
      <span>{r ? `${r.togri ?? "–"}/${r.jami ?? "–"} to‘g‘ri${r.foiz != null ? ` · ${Math.round(r.foiz)}%` : ""}${r.ball ? ` · ${r.ball} ball` : ""}${r.daraja?.nom ? ` · ${r.daraja.nom}` : ""}` : "natija tayyorlanmoqda"}</span>
    </li>)}</ul>}
    <p className="xb-muted">Endi o‘z kursingiz, imtihonlar va reytingingiz ochiladi. O‘qituvchi guruhlarni tuzgach, guruhingizni shu yerda ko‘rasiz.</p>
    <button type="button" className="xb-btn xb-btn-asosiy xb-katta" onClick={onYop}>Davom etish →</button>
  </div>;
}

export default function KirishNavbat({ apiBase, token, jins, ustoz, onTugadi }) {
  const [n, setN] = useState(oqi);
  const [tugadi, setTugadi] = useState(false);   // joriy test topshirildi (natija ko'rsatilmoqda)
  const { joriy, jami, raqam } = navbatHolati(n);

  const yop = () => { try { localStorage.removeItem(KALIT); } catch { /* */ } onTugadi(); };

  if (!joriy) return <Xulosa apiBase={apiBase} token={token} natijalar={n.natijalar} onYop={yop} ustoz={ustoz} />;
  return <>
    <p className="kk-qadam" role="status">Test {raqam}/{jami} · {NOM[joriy] || joriy}</p>
    <XbImtihon key={joriy} apiBase={apiBase} token={token} jins={jins} ustoz={ustoz} tur="kirish" toplam={joriy}
      info={{ tur: "kirish", nom: `Kirish testi — ${NOM[joriy] || joriy}`, savollar: 15, daqiqa: DAQIQA[joriy] || 30 }}
      onNatija={(id) => { const yangi = navbatNatijaQosh(n, joriy, id); yoz(yangi); setTugadi(true); setN((eski) => ({ ...eski, _kutish: yangi })); }}
      onYopish={() => { if (tugadi) { setTugadi(false); setN((eski) => eski._kutish || oqi()); } else onTugadi(); }} />
  </>;
}
