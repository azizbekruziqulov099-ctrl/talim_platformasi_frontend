import React, { useEffect, useRef, useState } from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import emblema from "../brand/emblema.webp";
import ustozRasm from "../kid/ustoz/nilufar/poza_2.webp";
import kabuSalom from "../kid/jonli/rasm/kabu_salom.webp";
import kabuGapiradi from "../kid/jonli/rasm/kabu_gapiradi.webp";
import sahnaDeraza from "../kid/jonli/sahna/deraza_keyin.webp";
import xonaBolalar from "../kid/belgi/xona_bolalar.webp";
import xonaSinf from "../kid/belgi/xona_sinf.webp";
import turUshla from "../kid/belgi/tur_ushla.webp";
import darsHello from "../kid/dars/rasm/hello.webp";
import darsSanoq from "../kid/dars/rasm/five-bananas.webp";
import darsOila from "../kid/dars/rasm/family.webp";
import darsTelefon from "../kid/dars/rasm/mobile-phone.webp";
import doska from "../kid/xonalar/rasm/board.webp";
import bKitob from "../kid/belgi/belgi_kitob.webp";
import bKitoblar from "../kid/belgi/belgi_kitoblar.webp";
import bKubok from "../kid/belgi/belgi_kubok.webp";
import bOyin from "../kid/belgi/belgi_oyin.webp";
import bKalendar from "../kid/belgi/belgi_kalendar.webp";
import bTogri from "../kid/belgi/belgi_togri.webp";
import bMedal from "../kid/belgi/belgi_medal.webp";
import bQumSoat from "../kid/belgi/belgi_qum_soat.webp";
import bQulf from "../kid/belgi/belgi_qulf.webp";
import bMikrofon from "../kid/belgi/belgi_mikrofon.webp";
import bNishon from "../kid/belgi/rag_nishon.webp";
import bKaptar from "../kid/belgi/rag_kaptar.webp";
import bYangi from "../kid/belgi/belgi_yangi.webp";
import "./kirish-tanishuv.css";

/**
 * REV155: kirish sahifasidagi tanishtiruv — sayt nimalar qila olishi, kim uchun nima borligi.
 * Rol tanlansa — faqat o'sha bo'lim; tanlanmasa — hammasi ketma-ket (pastga tushib ko'rib chiqiladi).
 * Matnlar uz / ru / en (interfeys tarjimasi orqali).
 */
export const TANISHUV_ROLLAR = [
  { id: "ota-ona", nom: "Ota-ona", rang: "amber", login: "ota-ona",
    sarlavha: "Farzandingiz nima o‘rganayotganini har kuni ko‘rasiz",
    items: [
      [bNishon, "Farzand faolligi", "Qaysi darsni o‘tdi, nechta so‘z o‘rgandi, qayerda qiynaldi — hammasi bitta sahifada."],
      [bKalendar, "Haftalik hisobot", "Har hafta qisqa xulosa: yutuqlar, qiyin mavzular va keyingi hafta uchun tavsiya."],
      [bQumSoat, "Ekran vaqti nazorati", "Kunlik vaqtni o‘zingiz belgilaysiz; vaqt tugasa, ilova bolani muloyimlik bilan to‘xtatadi."],
      [darsOila, "Oila profillari", "Bitta akkauntda bir nechta farzand: har birining o‘z darslari va natijalari."],
      [bQulf, "Xavfsizlik", "Begonalar farzandingiz ma’lumotini ko‘ra olmaydi; kirish Telegram yoki Google orqali."],
    ] },
  { id: "bogcha", nom: "Bog‘cha bolasi", rang: "rose", login: "bogcha",
    sarlavha: "O‘qishni bilmasa ham o‘zi o‘rganadi — ustoz gapirib tushuntiradi",
    items: [
      [ustozRasm, "Jonli ustoz bilan darslar", "Nilufar opa, Sardor aka va Malika opa doskada rasm ko‘rsatib, ovoz bilan dars o‘tadi."],
      [darsHello, "10 ta chet tili", "Ingliz, rus, arab, nemis, fransuz, ispan, turk, xitoy, yapon va koreys tili — izohi o‘zbek, rus yoki ingliz tilida."],
      [sahnaDeraza, "«Ayt — bo‘ladi!»", "Bola so‘zni aytadi — sahna o‘zgaradi: «Open the window!» desa, deraza ochiladi. 160 bosqich."],
      [xonaBolalar, "O‘yin xonalari", "Oshxona, bolalar xonasi, hovli, shahar, sinf: narsani bosib nomini eshitadi, topadi, eslab qoladi."],
      [turUshla, "Jonli va harakat o‘yinlari", "Ushla, qutiga sol, pufaklar, soyasi kimniki; barmoq bilan eshik ochadi, to‘p tepadi."],
      [darsSanoq, "Matematika, atrof-olam, mantiq", "Sanoq, shakllar, fasllar va hayvonlar — 2–7 yoshga moslab, bosqichma-bosqich."],
    ] },
  { id: "oqituvchi", nom: "O‘qituvchi", rang: "teal", login: "oqituvchi",
    sarlavha: "Dars, test va natijalar — bitta joyda, ortiqcha qog‘ozsiz",
    items: [
      [xonaSinf, "Sinflar va guruhlar", "O‘quvchilar kod orqali qo‘shiladi; har birining natijasi va faolligi ko‘rinadi."],
      [bTogri, "Test yaratish", "Savollarni o‘zingiz yozasiz yoki Excel shablondan bir yo‘la yuklaysiz; tekshirish avtomatik."],
      [doska, "Taqdimot studiyasi", "Dars uchun slaydlar tayyorlaysiz va sinfda ko‘rsatasiz."],
      [bKitoblar, "Kutubxona", "Word, PDF, Excel va rasmlarni joylaysiz; har bir fayl xavfsizlik tekshiruvidan o‘tadi."],
      [bMedal, "To‘garak va ochiq darslar", "To‘garak ochib, davomat va o‘quvchilar yutug‘ini yuritasiz."],
    ] },
  { id: "talaba", nom: "Talaba", rang: "violet", login: "talaba",
    sarlavha: "Fanlar, testlar va jadval — telefoningizda",
    items: [
      [bKitob, "Institut fanlari", "Mavzular bo‘yicha qisqa tushuntirish va mustahkamlash testlari."],
      [bKitoblar, "Virtual kutubxona", "O‘qituvchi va institut joylagan kitob va qo‘llanmalar."],
      [bKalendar, "Haftalik jadval", "Darslaringiz kun va soati bilan; guruhga kod orqali qo‘shilasiz."],
      [kabuGapiradi, "Sun’iy intellekt yordamchisi", "Tushunmagan savolingizni yozasiz — tushuntirib beradi."],
    ] },
  { id: "oquvchi", nom: "O‘quvchi", rang: "blue", login: "oquvchi",
    sarlavha: "1–11-sinf: dars, test va o‘yin bilan o‘rganish",
    items: [
      [bKitob, "Fanlar bo‘yicha darslar", "Har mavzu dars xonasida: doska, ovozli tushuntirish va misollar."],
      [bKubok, "Bellashuv, turnir, chempionat", "Testlarni o‘yin qilib yechasiz, sinfdoshlar bilan bellashasiz."],
      [kabuGapiradi, "AI ustoz va kitob kodi", "Savol bering yoki kitobdagi kodni yozing — yechim va tushuntirish ochiladi."],
      [bOyin, "Shaxmat va shashka", "Aql o‘yinlari — kompyuter bilan yoki do‘stlar bilan."],
    ] },
];

export const HAMMAGA = [
  [bKaptar, "Kabutar — suhbatlar", "Xabar, ovozli xabar, qo‘ng‘iroq va uchrashuvlar — ta’lim bilan bitta akkauntda."],
  [bMikrofon, "Ovoz bilan ishlaydi", "Gapirib yozish, so‘zni to‘g‘ri aytishni tekshirish va ovozli darslar."],
  [darsTelefon, "Telefonda ilova kabi", "Bosh ekranga qo‘shib, ilovadek ochasiz; sekin internetda ham ishlaydi."],
  [bYangi, "3 tilda interfeys", "O‘zbek, rus va ingliz tili — istalgan vaqtda almashtirasiz."],
];

const ROL_IDS = TANISHUV_ROLLAR.map((r) => r.id);

/** Yuqori qism: emblema, sayt nima ekani, asosiy raqamlar va «Siz kimsiz?» tanlovi. */
export function KirishHero({ rol, onRol }) {
  useInterface();
  return <section className="kt-hero" aria-labelledby="kt-hero-title">
    <div className="kt-hero-emblem"><img src={emblema} alt="" width="76" height="76" /><span className="kt-hero-kabu"><img src={kabuSalom} alt="" loading="lazy" /></span></div>
    <p className="kt-eyebrow">{T("Kabutar · suhbat va ta’lim")}</p>
    <h1 id="kt-hero-title">{T("Butun oila uchun bitta ta’lim maydoni")}</h1>
    <p className="kt-lead">{T("Bog‘cha bolasidan talabagacha: jonli ustozli darslar, o‘yinlar, testlar, sun’iy intellekt yordamchisi va xavfsiz suhbatlar — bitta akkauntda.")}</p>
    <ul className="kt-stats">
      <li><b>10</b><span>{T("chet tili")}</span></li>
      <li><b>160</b><span>{T("bosqichli gapirish o‘yini")}</span></li>
      <li><b>5</b><span>{T("xil foydalanuvchi")}</span></li>
      <li><b>3</b><span>{T("tilda interfeys")}</span></li>
    </ul>
    <p className="kt-ask">{T("Siz kimsiz? Tanlang — sizga nima borligini ko‘rsatamiz:")}</p>
    <RolTanlov rol={rol} onRol={onRol} />
  </section>;
}

function RolTanlov({ rol, onRol }) {
  return <div className="kt-chips" role="group" aria-label={T("Kim uchun")}>
    <button type="button" className={!rol ? "is-on" : ""} aria-pressed={!rol} onClick={() => onRol("")}>{T("Hammasi")}</button>
    {TANISHUV_ROLLAR.map((r) => <button key={r.id} type="button" className={`kt-chip-${r.rang} ${rol === r.id ? "is-on" : ""}`} aria-pressed={rol === r.id} onClick={() => onRol(r.id)}>{T(r.nom)}</button>)}
  </div>;
}

/** Pastki qism: hamma imkoniyatlar (rol tanlangan bo'lsa — faqat o'shaniki). onBoshla(loginRol) — shu rol bilan kirish. */
export function KirishImkoniyatlar({ rol, onRol, onBoshla }) {
  useInterface();
  const ref = useRef(null);
  const [birinchi, setBirinchi] = useState(true);
  useEffect(() => {
    if (birinchi) { setBirinchi(false); return; }
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [rol]); // eslint-disable-line react-hooks/exhaustive-deps
  const korinadi = rol && ROL_IDS.includes(rol) ? TANISHUV_ROLLAR.filter((r) => r.id === rol) : TANISHUV_ROLLAR;
  return <section className="kt-imk" ref={ref} id="kabutar-imkoniyatlar" aria-labelledby="kt-imk-title">
    <div className="kt-imk-head">
      <h2 id="kt-imk-title">{T("Saytda nimalar bor")}</h2>
      <RolTanlov rol={rol} onRol={onRol} />
    </div>
    {korinadi.map((r) => <article key={r.id} className={`kt-rol kt-rol-${r.rang}`} aria-labelledby={`kt-rol-${r.id}`}>
      <header>
        <span className="kt-rol-nom">{T(r.nom)}</span>
        <h3 id={`kt-rol-${r.id}`}>{T(r.sarlavha)}</h3>
      </header>
      <ul className="kt-cards">
        {r.items.map(([rasm, t, m]) => <li key={t} className="kt-card">
          <span className="kt-card-rasm"><img src={rasm} alt="" loading="lazy" draggable="false" /></span>
          <b>{T(t)}</b>
          <p>{T(m)}</p>
        </li>)}
      </ul>
      <button type="button" className="kt-boshla" onClick={() => onBoshla?.(r.login)}>{T("Shu sifatida boshlash")} →</button>
    </article>)}
    {rol && <button type="button" className="kt-hammasi" onClick={() => onRol("")}>{T("Hamma imkoniyatlarni ko‘rish")}</button>}
    <article className="kt-rol kt-rol-hamma" aria-labelledby="kt-rol-hamma">
      <header><span className="kt-rol-nom">{T("Hammaga")}</span><h3 id="kt-rol-hamma">{T("Har bir foydalanuvchi uchun")}</h3></header>
      <ul className="kt-cards">
        {HAMMAGA.map(([rasm, t, m]) => <li key={t} className="kt-card">
          <span className="kt-card-rasm"><img src={rasm} alt="" loading="lazy" draggable="false" /></span>
          <b>{T(t)}</b><p>{T(m)}</p>
        </li>)}
      </ul>
    </article>
  </section>;
}
