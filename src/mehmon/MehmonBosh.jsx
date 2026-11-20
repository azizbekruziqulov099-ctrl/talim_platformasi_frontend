import React from "react";
import kabuSalom from "../kid/jonli/rasm/kabu_salom.webp";
import bKitoblar from "../kid/belgi/belgi_kitoblar.webp";
import doska from "../kid/xonalar/rasm/board.webp";
import turUshla from "../kid/belgi/tur_ushla.webp";
import bTogri from "../kid/belgi/belgi_togri.webp";
import bMedal from "../kid/belgi/belgi_medal.webp";
import "./mehmon.css";

// Rol tanlanmaguncha hamma ko'radigan bosh sahifa: sayt nimalarga qodirligi va bir bosishda o'tish.
const TUGMALAR = [
  { tab: "kurslar", rasm: bKitoblar, nom: "Kurslar", izoh: "Repetitor darslari, Xalqaro baholash (PISA, TIMSS, PIRLS) va matematika. Har mavzuda dars, 30 mashq va 30 test.", rang: "teal" },
  { tab: "taqdimotlar", rasm: doska, nom: "Taqdimot tayyorlash", izoh: "Mavzuni yozasiz, slaydlar tayyor bo‘ladi. Sinfda ko‘rsatasiz yoki yuklab olasiz.", rang: "amber" },
  { tab: "oyinlar", rasm: turUshla, nom: "Bolalar uchun", izoh: "Jonli ustozli darslar va o‘yinlar: 2–7 yosh. Bola o‘zi o‘rganadi.", rang: "rose" },
  { tab: "test", rasm: bTogri, nom: "Testlar", izoh: "Mavzu bo‘yicha testlar, natija va xatolar tahlili darhol.", rang: "blue" },
];

export default function MehmonBosh({ ism = "", onTab }) {
  const qisqa = String(ism || "").trim();
  return <section className="mb-bosh" aria-labelledby="mb-sarlavha">
    <header className="mb-hero">
      <img src={kabuSalom} alt="" width="96" height="96" />
      <div>
        <p className="mb-eyebrow">Kabutar · suhbat va ta’lim</p>
        <h1 id="mb-sarlavha">Xush kelibsiz{qisqa && !/^mehmon\s*\d*$/i.test(qisqa) ? `, ${qisqa.split(" ")[0]}` : ""}!</h1>
        <p>Bu yerda o‘rganish oson: bo‘limni tanlang va boshlang. Natijalaringiz shu qurilmada saqlanadi.</p>
      </div>
    </header>
    <ul className="mb-kartalar">
      {TUGMALAR.map((t) => <li key={t.tab}>
        <button type="button" className={`mb-karta mb-${t.rang}`} onClick={() => onTab?.(t.tab)}>
          <span className="mb-rasm"><img src={t.rasm} alt="" loading="lazy" draggable="false" /></span>
          <b>{t.nom}</b>
          <small>{t.izoh}</small>
          <span className="mb-go" aria-hidden="true">Ochish →</span>
        </button>
      </li>)}
    </ul>
    <button type="button" className="mb-rol" onClick={() => onTab?.("profil")}>
      <img src={bMedal} alt="" width="44" height="44" />
      <span><b>Rolingizni tanlang</b><small>O‘quvchi, ota-ona, o‘qituvchi, talaba yoki bog‘cha — sizga moslab beramiz</small></span>
      <span aria-hidden="true">→</span>
    </button>
  </section>;
}
