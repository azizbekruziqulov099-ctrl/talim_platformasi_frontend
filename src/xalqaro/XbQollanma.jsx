import React, { useState } from "react";
import { T, tf, xbTil } from "./xbTil.js";   // REV270: uch til
import METOD from "./xbMetodlar.js";   // REV270: o'qitish metodlari (ochiq ekspert manbalari asosida, 3 tilda)

/** Qo'llanma bo'limlari: sarlavha, kim uchun, matn qatorlari (ustoz o'qib bera oladi). */
const UMUMIY = [
  {
    k: "nima", s: "🌍 Xalqaro baholash nima?", qator: [
      "Xalqaro baholash — dunyo mamlakatlari o‘quvchilari bir xil savollarga javob beradigan tadqiqotlar. Natija bo‘yicha qaysi mamlakatda ta’lim qanday ekani ko‘rinadi.",
      "TIMSS — 4-sinf va 8-sinf o‘quvchilari uchun. Matematika va tabiiy fanlardan maktabda o‘tilgan bilimni tekshiradi: «Qoidani bilasanmi va qo‘llay olasanmi?». Har 4 yilda o‘tkaziladi.",
      "PISA — 15 yoshli o‘quvchilar (odatda 9–10-sinf) uchun. Bilimni hayotda qo‘llashni tekshiradi: matematik, o‘qish, tabiiy-ilmiy va moliyaviy savodxonlik. «Bilganingni notanish hayotiy vaziyatda ishlata olasanmi?».",
      "PIRLS — 4-sinf o‘quvchilarining o‘qib tushunishini tekshiradi.",
      "O‘zbekiston natijalari: TIMSS 2023 — 4-sinf matematika 443, 8-sinf matematika 421 ball. PISA tabiiy fanlar: 2022 — 355, 2025 — 438 ball (+83 — tadqiqotdagi eng katta o‘sish). Maqsadimiz — har bir o‘quvchini xalqaro o‘rtacha (≈500) va undan yuqoriga olib chiqish.",
    ],
  },
  {
    k: "ball", s: "📏 Ballar va darajalar nima degani?", qator: [
      "Ikkala tadqiqotda ham ball shkalasi taxminan 300–700 oralig‘ida, o‘rtacha nuqta — 500.",
      "TIMSS darajalari: 400 — past (oddiy faktlarni biladi), 475 — o‘rta (bilimni oddiy vaziyatda qo‘llaydi), 550 — yuqori (murakkabroq masalalarni yechadi), 625 — ilg‘or (mulohaza qiladi, xulosa chiqaradi, asoslaydi).",
      "PISA darajalari 1 dan 6 gacha. 2-daraja — «tayanch» daraja: hayot uchun zarur minimal ko‘nikma. 4-daraja va undan yuqorisi — kuchli o‘quvchi, 5–6 — eng yuqori natijalar.",
      "Bu bo‘limdagi ball — «taxminiy». U savollarning haqiqiy xalqaro qiyinligi asosida hisoblanadi, lekin rasmiy natija emas. Ball o‘sib borayotganini kuzatish uchun juda qulay.",
    ],
  },
  {
    k: "til", s: "🌐 Uch tilda o‘qish: natijalar har tilda alohida", qator: [
      "Bo‘lim uch tilda ishlaydi: o‘zbek, rus va ingliz. Til platforma interfeysining tiliga qarab tanlanadi (uni sozlamalarda o‘zgartirasiz).",
      "Savollar, PISA matnlari, Kabu darslari, rasmlardagi yozuvlar, ustozning ovozi va mikrofon — hammasi tanlangan tilda bo‘ladi.",
      "Natijalar har til uchun alohida saqlanadi: mashq, xatolar, takrorlash, imtihonlar va reyting. O‘zbekcha o‘tgan mavzuingiz ruscha bo‘limda «o‘tilgan» bo‘lib ko‘rinmaydi — u tilda qaytadan o‘rganasiz va alohida baholanasiz.",
      "Imtihonlar ham har tilda alohida: har bir tilda davrdagi birinchi urinish rasmiy hisoblanadi va o‘sha tilning reytingiga kiradi.",
      "O‘qituvchi panelda «Ta’lim tili»ni tanlab, o‘quvchilarning shu tildagi natijalarini ko‘radi; «Tillar» ustunida o‘quvchi qaysi tillarda ishlayotgani ko‘rsatiladi.",
    ],
  },
  {
    k: "qonun", s: "⚖️ Savollar qayerdan olingan?", qator: [
      "Asl TIMSS va PISA savollari IEA va OECD tashkilotlariga tegishli, ularni tijoriy platformada ko‘chirib bo‘lmaydi.",
      "Shuning uchun har bir ochiq e’lon qilingan asl savolga o‘zbek tilida yangi «parallel» savol yozilgan: o‘sha ko‘nikma, o‘sha qiyinlik, o‘sha fikrlash turi — lekin o‘zbek hayotidan olingan vaziyat.",
      "Shu sababli bu yerda yodlab olingan javob yordam bermaydi — faqat haqiqiy tushunish yordam beradi. Bu xalqaro imtihonga eng to‘g‘ri tayyorgarlik.",
    ],
  },
];
const OQUVCHI = [
  {
    k: "bolim", s: "🧭 Bo‘limda nima bor?", qator: [
      "📚 Kurs — mavzular ro‘yxati. Har mavzuda: «Dars» (Kabu doskada yozib tushuntiradi — gapi va yozuvi bir xil ketadi) va «Mashq» (javobingiz darhol tekshiriladi, xato bo‘lsa sababi va yechimi ko‘rsatiladi).",
      "📝 Imtihonlar — haftalik, oylik, choraklik va yillik. Haqiqiy imtihon kabi: vaqt, ishora yo‘q. Davrdagi birinchi urinish rasmiy hisoblanadi va reytingga kiradi.",
      "❌ Xatolarim — hozir ham xato bo‘lib turgan savollaringiz: nima deb javob berganingiz, to‘g‘risi, nega xato va qanday yechiladi.",
      "🔁 Takrorlash — xato savollar 1, 2, 4, 8 va 16 kundan keyin boshqa variantda qayta so‘raladi. Shunda bilim uzoq esda qoladi.",
      "🏅 Reyting — sinfingiz, maktabingiz va platformadagi o‘rningiz, shuningdek natijangiz qaysi davlatlar darajasiga to‘g‘ri kelishi.",
      "🌍 Dunyo natijalari — davlatlarning haqiqiy TIMSS, PISA va PIRLS natijalari.",
    ],
  },
  {
    k: "reja", s: "🗓️ Har hafta qanday ishlash kerak?", qator: [
      "Dushanba: bitta yangi mavzu darsini oxirigacha ko‘ring (15–20 daqiqa).",
      "Seshanba — payshanba: har kuni shu mavzudan 8–10 ta mashq savoli. Xato bo‘lsa — «Ustoz doskada yechib bersin» tugmasini bosing.",
      "Juma: «Takrorlash» navbatini tugating.",
      "Shanba yoki yakshanba: haftalik nazoratni topshiring (yakshanba kuni tugaydi).",
      "Oy oxirida — oylik imtihon, chorak oxirida — choraklik, may oyida — yillik imtihon.",
      "Kuniga 20 daqiqa yetadi — muhimi har kuni.",
    ],
  },
  {
    k: "usul", s: "🧠 Xalqaro savolni qanday yechish kerak? (4 qadam)", qator: [
      "1. O‘qing. Shartni, jadval va grafiklarni oxirigacha diqqat bilan o‘qing. PISA savolida avval umumiy matnni (📄) o‘qing.",
      "2. Nimani so‘rayapti? Savolning oxirgi gapini qayta o‘qing: aynan nima topilishi kerak? Qaysi birlikda?",
      "3. Reja tuzing. Qaysi ma’lumot kerak, qaysi biri ortiqcha? Qaysi qoida yoki formula ishlatiladi?",
      "4. Tekshiring. Javob mantiqanmi (masalan, odam bo‘yi 15 metr bo‘lmaydi)? Variantlarni taxminiy hisob bilan solishtiring.",
      "Mulohaza savollarida shoshilmang: bunday savollarni dunyo bo‘yicha o‘quvchilarning atigi 20–40 foizi yechadi. Siz ham yecha olasiz — faqat bosqichma-bosqich.",
    ],
  },
  {
    k: "ovoz", s: "🔊 Ovoz bilan ishlash", qator: [
      "🔊 tugmasi — ustoz savolni ovoz chiqarib o‘qib beradi.",
      "🎤 tugmasi — javobni ovoz bilan ayting: «be», «to‘rtinchi», «o‘n ikki», «uch butun besh», «to‘rtdan uch». Ovoz bilan to‘g‘ri javob bersangiz, ustoz uni yozib qo‘yishingizni so‘raydi.",
    ],
  },
];
const OQITUVCHI = [
  {
    k: "panel", s: "👩‍🏫 «Sinfim» panelini qanday o‘qish kerak?", qator: [
      "🟢 Faol — oxirgi 7 kunda kamida 10 ta savol yechgan. 🟠 Sust — 7 kundan beri ishlamagan yoki haftada 10 tadan kam yechgan. 🔴 Boshlamagan — umuman kirmagan.",
      "«Ochiq xato» — o‘quvchi hozir ham xato qilib turgan savollar soni. Qatorni bossangiz, har bir xato ochiladi: o‘quvchi nima deb javob bergani, to‘g‘risi, xato sababi va yechim.",
      "«Zaif mavzu» — o‘quvchi eng ko‘p xato qilgan mavzu. Shu mavzu darsini unga tavsiya qiling.",
      "«Oxirgi ball» — oxirgi rasmiy imtihon bo‘yicha taxminiy TIMSS yoki PISA bali va darajasi.",
    ],
  },
  {
    k: "sinf", s: "❌ Sinf xatolari bilan dars o‘tish", qator: [
      "«Sinf xatolari» varag‘ida sinfda eng ko‘p xato qilingan savollar va eng ko‘p berilgan noto‘g‘ri javob ko‘rsatiladi. Masalan, ko‘pchilik «B» ni tanlagan bo‘lsa, yonida bu xatoning sababi yoziladi (qaysi noto‘g‘ri tushuncha).",
      "Darsni shu savol bilan boshlang: o‘quvchilardan nega «B» ni tanlaganini so‘rang, keyin «Yechimni doskada ko‘rish» tugmasi bilan to‘g‘ri yechimni birga ko‘ring.",
      "«Mavzular bo‘yicha» varag‘ida sinf natijasi dunyo o‘rtachasi bilan solishtiriladi. To‘q sariq rangdagi mavzular — dunyodan past. Shu mavzular darsini (🧑‍🏫 Dars) sinfda proyektorda ko‘rsatish mumkin.",
    ],
  },
  {
    k: "tashkil", s: "📅 Haftalik nazoratni qanday tashkil etish kerak?", qator: [
      "O‘quvchilarga haftalik nazoratni shanba–yakshanba topshirishni topshiriq qilib bering. Dushanba kuni paneldagi «Bu haftalik nazoratni topshirgan» sonini tekshiring.",
      "Choraklik imtihonni sinfda bir vaqtda o‘tkazish mumkin: hamma bir vaqtda «Boshlash»ni bosadi, vaqt serverda hisoblanadi. Imtihon oynasidan chiqib ketishlar o‘quvchi tafsilotida ko‘rinadi.",
      "Ota-onalar majlisida o‘quvchining darajasini tushuntiring: 475 dan past — asosiy qoidalar ustida ishlash kerak; 550 dan yuqori — kuchli, mulohaza savollari bilan rivojlantirish kerak.",
    ],
  },
  {
    k: "korish", s: "👀 O‘quvchi ko‘zi bilan ko‘rish", qator: [
      "Panel yonidagi «O‘quvchi ko‘rinishi» varaqlari (Kurs, Imtihonlar, Xatolarim…) — o‘quvchi ko‘radigan bo‘limning o‘zi. Darslarni o‘zingiz ko‘rib chiqing va sinfda foydalaning.",
    ],
  },
];
const ADMIN = [
  {
    k: "admin", s: "🛡️ Admin nimani ko‘radi?", qator: [
      "«Admin nazorati» — butun platforma bo‘yicha jamlama: faol o‘quvchilar, javoblar, rasmiy imtihonlar va o‘rtacha ball.",
      "Maktab tanlansa — o‘sha maktab sinflari bo‘yicha o‘qituvchi panelidagi barcha ma’lumot: o‘quvchilar, sinf xatolari, mavzular, har bir o‘quvchining xatolari.",
      "«O‘quvchi ko‘zi bilan» bo‘limida maktab tanlab, «🌍 Xalqaro baholash» almashtirgichini bossangiz, bo‘limni tanlangan sinf o‘quvchisi ko‘rgandek ko‘rasiz.",
    ],
  },
];

/** REV270: o'qitish metodlari — har biri: nima, nega ishlaydi (dalil), sinfda qanday, platformada qanday, manba. */
function Metodlar({ ovoz }) {
  const til = xbTil();
  const L = (o) => (o && (o[til] || o.uz)) || "";
  const [ochiq, setOchiq] = useState("");
  if (!METOD?.metodlar?.length) return null;
  return <div className="xb-metodlar">
    <h3>🎓 {T("O‘qitish metodlari: mutaxassislar tavsiyasi")}</h3>
    <p className="xb-muted">{L(METOD.kirish)}</p>
    {METOD.haftalik?.length > 0 && <section className="xb-blok"><h4>🗓️ {T("O‘qituvchining haftalik tartibi")}</h4><ol>{METOD.haftalik.map((h, k) => <li key={k}>{L(h)}</li>)}</ol></section>}
    {METOD.metodlar.map((m) => <section key={m.kalit} className={`xb-qol ${ochiq === m.kalit ? "is-ochiq" : ""}`}>
      <button type="button" className="xb-qol-bosh" onClick={() => setOchiq(ochiq === m.kalit ? "" : m.kalit)} aria-expanded={ochiq === m.kalit}><b>{L(m.nom)}</b><span aria-hidden="true">{ochiq === m.kalit ? "▾" : "▸"}</span></button>
      {ochiq === m.kalit && <div className="xb-qol-ich">
        <p>{L(m.nima)}</p>
        <p>🔬 <b>{T("Nega ishlaydi")}:</b> {L(m.nega)}</p>
        <p><b>👣 {T("Sinfda qanday qilinadi")}:</b></p>
        <ol>{(m.qadamlar?.[til] || m.qadamlar?.uz || []).map((q, k) => <li key={k}>{q}</li>)}</ol>
        <p>💻 <b>{T("Platformada")}:</b> {L(m.platformada)}</p>
        {m.manbalar?.length > 0 && <p className="xb-muted xb-kichik">📚 {T("Manba")}: {m.manbalar.map((x, k) => <React.Fragment key={x.url || k}>{k ? "; " : ""}<a href={x.url} target="_blank" rel="noopener noreferrer">{x.nom}</a></React.Fragment>)}</p>}
        {ovoz && <button type="button" className="xb-btn xb-btn-kichik" onClick={() => ovoz.say([L(m.nom), L(m.nima), ...(m.qadamlar?.[til] || m.qadamlar?.uz || [])].join(". "))}>🔊 {T("Ustoz o‘qib bersin")}</button>}
      </div>}
    </section>)}
  </div>;
}

function Karta({ b, ovoz, ochiq, onOch }) {
  return <section className={`xb-qol ${ochiq ? "is-ochiq" : ""}`}>
    <button type="button" className="xb-qol-bosh" onClick={onOch} aria-expanded={ochiq}><b>{T(b.s)}</b><span aria-hidden="true">{ochiq ? "▾" : "▸"}</span></button>
    {ochiq && <div className="xb-qol-ich">
      {b.qator.map((q) => <p key={q.slice(0, 40)}>{T(q)}</p>)}
      {ovoz && <button type="button" className="xb-btn xb-btn-kichik" onClick={() => ovoz.say(b.qator.map((q) => tf(q)).join(" "))}>🔊 {T("Ustoz o‘qib bersin")}</button>}
    </div>}
  </section>;
}

/**
 * REV262: «📖 Qo'llanma» — o'quvchi, o'qituvchi va admin uchun sodda tilda: TIMSS va PISA nima, ballar va darajalar nima degani,
 * bo'limdan qanday foydalanish (haftalik reja, savol yechish usuli), o'qituvchi panelini o'qish va sinfda qo'llash.
 */
export default function XbQollanma({ rol = "oquvchi", ovoz, sinf = 0, onTab, faqatMetod = false }) {
  const [ochiq, setOchiq] = useState("nima");
  if (faqatMetod) return <div className="xb-panel xb-qollanma"><Metodlar ovoz={ovoz} /></div>;
  const bloklar = [...UMUMIY, ...(rol === "oquvchi" ? OQUVCHI : [...OQITUVCHI, ...OQUVCHI.slice(0, 1)]), ...(rol === "admin" ? ADMIN : [])];
  const tavsiya = !sinf ? "" : sinf <= 5 ? "Sizga «TIMSS · 4-sinf» to‘plamlari mos." : sinf <= 8 ? "Sizga «TIMSS · 8-sinf» to‘plamlari mos." : "Sizga «PISA» to‘plamlari mos (15 yosh), TIMSS 8-sinfni takrorlash uchun ishlating.";
  return <div className="xb-panel xb-qollanma">
    <h3>📖 {rol === "oquvchi" ? T("Qo‘llanma: xalqaro baholashga qanday tayyorlanamiz") : T("Qo‘llanma: o‘qituvchi va admin uchun")}</h3>
    {tavsiya && rol === "oquvchi" && <p className="xb-pufak">⭐ {T(tavsiya)}</p>}
    {bloklar.map((b) => <Karta key={b.k} b={b} ovoz={ovoz} ochiq={ochiq === b.k} onOch={() => setOchiq(ochiq === b.k ? "" : b.k)} />)}
    {rol !== "oquvchi" && <button type="button" className="xb-btn" onClick={() => onTab?.("metod")}>🎓 {T("O‘qitish metodlari (mutaxassislar tavsiyasi)")}</button>}
    <div className="xb-tug-qator">
      {rol !== "oquvchi" && <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => onTab?.("panel")}>👩‍🏫 {T("Panelga o‘tish")}</button>}
      <button type="button" className={`xb-btn ${rol === "oquvchi" ? "xb-btn-asosiy" : ""}`} onClick={() => onTab?.("kurs")}>📚 {T("Kursni boshlash")}</button>
      <button type="button" className="xb-btn" onClick={() => onTab?.("imtihon")}>📝 {T("Imtihonlar")}</button>
    </div>
  </div>;
}
