// REV556: xalqaro (PISA/TIMSS) sinfi — reyting bo'yicha guruhlar.
// O'qituvchi: kim keldi, kim kirish testini kutyapti, kimning natijasi tekshiruvda, guruhlar va har guruh darajasi.
// O'quvchi: qaysi guruhdaman, o'qituvchim kim, darajam, soha va ko'nikmalarim, nimani o'rganishim kerak.
// Qoidalar serverda: modules/xalqaro_guruh.py (30 tadan guruh, shubhali natija tekshiruvda, faqat barqaror o'quvchi ko'chadi).
import React, { useEffect, useState } from "react";
import { xbFetch } from "./xbOvoz.js";
import { T, tf } from "./xbTil.js";
import { DARAJA_RANG } from "./xbRules.js";
import { azoBelgilari, foizRangi, oquvchiHolati, sana, sinfJamlamasi, xabarShabloni } from "./xbGuruhRules.js";

const Daraja = ({ d }) => (d ? <span className="xg-daraja" style={{ "--r": DARAJA_RANG[d.kalit] || "#475569" }}>{d.nom}</span> : null);
const Yolak = ({ nom, togri, jami, foiz }) => <div className="xg-yolak"><span>{nom}</span>
  <i aria-hidden="true"><b style={{ width: `${Math.max(4, foiz)}%`, background: foizRangi(foiz) }} /></i><em>{togri}/{jami}</em></div>;

/* ───────────── o'qituvchi ───────────── */
export function OqituvchiGuruhlar({ apiBase, token, sinf }) {
  const [d, setD] = useState(null); const [xato, setXato] = useState(""); const [band, setBand] = useState(false); const [ochiq, setOchiq] = useState(1);
  const yukla = () => xbFetch(apiBase, `/api/xalqaro/sinflar/${sinf.id}/guruhlar`, token).then((r) => { setD(r); setXato(""); }).catch((e) => setXato(e.message));
  useEffect(() => { setD(null); yukla(); }, [sinf.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const yangila = () => { if (!window.confirm(T("Guruhlar qayta ko‘rib chiqilsinmi? Barqaror natija ko‘rsatgan o‘quvchilar boshqa guruhga o‘tadi, qolganlar joyida qoladi."))) return;
    setBand(true); xbFetch(apiBase, `/api/xalqaro/sinflar/${sinf.id}/guruhla`, token, { method: "POST" }).then((r) => { setD(r); setXato(""); }).catch((e) => setXato(e.message)).finally(() => setBand(false)); };
  if (xato) return <p className="xb-xato" role="alert">{T(xato)}</p>;
  if (!d) return <p className="xb-muted">⏳</p>;
  const j = sinfJamlamasi(d); const testsiz = d.kutayotgan.filter((k) => k.holat === "kirish_testi_yoq"); const tekshiruv = d.kutayotgan.filter((k) => k.holat === "tekshiruvda");
  return <div className="xg-root">
    <div className="xb-kartalar">
      <div className="xb-karta"><small>{T("Jami qo‘shilgan")}</small><b>{j.jami}</b></div>
      <div className="xb-karta"><small>{T("Guruhlarda")}</small><b>{j.guruhda}</b><small>{tf("{n} ta guruh", { n: j.guruhlar })}</small></div>
      <div className="xb-karta"><small>{T("Kirish testini topshirmagan")}</small><b>{j.testsiz}</b></div>
      <div className="xb-karta"><small>{T("Natijasi tekshiruvda")}</small><b>{j.tekshiruvda}</b></div>
    </div>
    <div className="xg-amal">
      <button type="button" className="xb-btn xb-btn-asosiy" disabled={band} onClick={yangila}>🔄 {T("Guruhlarni yangilash")}</button>
      <button type="button" className="xb-btn" onClick={yukla}>↻ {T("Ro‘yxatni yangilash")}</button>
      <small className="xb-muted">{d.guruhlangan ? tf("Oxirgi guruhlash: {s}. Keyingisi o‘zi: {k}.", { s: sana(d.guruhlangan), k: sana(d.keyingi) }) : T("Guruhlar hali tuzilmagan.")}</small>
    </div>
    <details className="xg-qoida"><summary>ℹ️ {T("Guruhlash qanday ishlaydi")}</summary><ul>
      <li>{tf("Har guruhda {h} tadan o‘quvchi; guruh {k} tadan kam bo‘lib qolsa, qo‘shni guruh bilan birlashadi.", { h: d.qoida.hajm, k: d.qoida.eng_kam })}</li>
      <li>{T("1-guruh — reytingi eng yuqori o‘quvchilar. Reyting kirish testidan olinadi va har imtihondan keyin yangilanadi.")}</li>
      <li>{tf("O‘quvchi boshqa guruhga faqat ketma-ket {n} ta imtihonda barqaror natija ko‘rsatsa o‘tadi. Bitta omadli natija guruhni o‘zgartirmaydi.", { n: d.qoida.kochish_uchun })}</li>
      <li>{T("Juda tez yechilgan, ilovadan chiqib yechilgan yoki keskin sakragan natija tekshiruvda turadi: keyingi imtihon tasdiqlasa hisobga olinadi.")}</li>
    </ul></details>
    {d.ozgarishlar.length > 0 && <div className="xg-xabar is-ok" role="status"><b>🔀 {tf("Guruhi o‘zgargan o‘quvchilar: {n} ta", { n: d.ozgarishlar.length })}</b>
      <ul>{d.ozgarishlar.slice(0, 30).map((x) => <li key={x.user_id}>{x.ism || `#${x.user_id}`}: {x.eski ? tf("{e}-guruh → {y}-guruh", { e: x.eski, y: x.yangi }) : tf("{y}-guruhga qo‘shildi", { y: x.yangi })}</li>)}</ul></div>}
    {tekshiruv.length > 0 && <div className="xg-blok is-ogoh"><h5>⚠️ {T("Natijasi tekshiruvda — guruhga qo‘shilmagan")} ({tekshiruv.length})</h5>
      <ul className="xg-royxat">{tekshiruv.map((k) => <li key={k.user_id}><b>{k.ism || `#${k.user_id}`}</b>
        {k.tekshiruvda.map((t, i) => <small key={i}>{tf("{b} ball", { b: t.ball })}: {t.sabab.map((s) => T(s)).join("; ")}</small>)}</li>)}</ul>
      <p className="xb-muted xb-kichik">{T("Bu o‘quvchilar kirish testini qayta topshirishi kerak (kuniga bir marta). O‘zi, shoshilmay yechsa — guruhga qo‘shiladi.")}</p></div>}
    {testsiz.length > 0 && <div className="xg-blok"><h5>⏳ {T("Kirish testini hali topshirmagan")} ({testsiz.length})</h5>
      <p className="xg-ismlar">{testsiz.map((k) => k.ism || `#${k.user_id}`).join(" · ")}</p></div>}
    {!d.guruhlar.length && <p className="xb-muted">{T("Hali hech kim kirish testini topshirmagan. O‘quvchilar testni topshirgach, guruhlar shu yerda paydo bo‘ladi.")}</p>}
    {d.guruhlar.map((g) => <section key={g.raqam} className={`xg-guruh ${ochiq === g.raqam ? "is-ochiq" : ""}`}>
      <button type="button" className="xg-guruh-bosh" aria-expanded={ochiq === g.raqam} onClick={() => setOchiq(ochiq === g.raqam ? 0 : g.raqam)}>
        <b>{tf("{n}-guruh", { n: g.raqam })}</b><span>👥 {g.soni}</span><span>{tf("o‘rtacha {b} ball", { b: Math.round(g.ortacha) })}</span><Daraja d={g.daraja} />
        <small>{g.eng_past}–{g.eng_yuqori}</small><i aria-hidden="true">{ochiq === g.raqam ? "▾" : "▸"}</i></button>
      {ochiq === g.raqam && <div className="xb-jadval-wrap"><table className="xb-jadval xg-jadval">
        <thead><tr><th>№</th><th>{T("O‘quvchi")}</th><th>{T("Reyting")}</th><th>{T("Daraja")}</th><th title={T("Hisobga olingan imtihonlar soni")}>{T("Imtihonlar")}</th><th>{T("Belgilar")}</th></tr></thead>
        <tbody>{g.azolar.map((a, i) => <tr key={a.user_id}><td>{i + 1}</td><td>{a.ism || `#${a.user_id}`}</td><td><b>{a.reyting}</b></td><td><Daraja d={a.daraja} /></td><td>{a.natijalar}</td>
          <td>{azoBelgilari(a).map((b) => <span key={b.tur} className={`xg-belgi is-${b.tur}`} title={b.sabablar.map((s) => T(s)).join("; ")}>
            {b.belgi} {b.tur === "tekshiruv" ? tf("{b} ball tekshiruvda", { b: b.ball }) : T("javoblar tartibi odatiy emas")}</span>)}</td></tr>)}</tbody>
      </table></div>}
    </section>)}
  </div>;
}

/* ───────────── o'quvchi ───────────── */
export function MeningGuruhim({ apiBase, token, onKirish, onToplam }) {
  const [d, setD] = useState(null);
  const yukla = () => xbFetch(apiBase, "/api/xalqaro/mening_guruhim", token).then(setD).catch(() => setD({ sinflar: [] }));
  useEffect(() => { yukla(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d || !d.sinflar.length) return null;
  const kordi = (sid) => xbFetch(apiBase, "/api/xalqaro/guruh_xabar_kordi", token, { method: "POST", body: { sinf_id: sid } }).then(yukla).catch(() => {});
  return <div className="xg-root">{d.sinflar.map((s) => {
    const holat = oquvchiHolati(s); const x = xabarShabloni(s.xabar);
    return <section key={s.sinf.id} className="xb-panel xg-men">
      <div className="xg-men-bosh"><h4>👥 {T("Mening guruhim")}</h4><small>🏫 {s.sinf.nom} · 👩‍🏫 {s.sinf.oqituvchi}</small></div>
      {x && <div className={`xg-xabar is-${x.turi}`} role="status"><span>{x.belgi} {tf(x.matn, { y: s.xabar.yangi, e: s.xabar.eski })}</span>
        <button type="button" className="xb-btn xb-btn-yengil" onClick={() => kordi(s.sinf.id)}>{T("Tushundim")}</button></div>}
      {holat !== "guruhda" && <div className="xg-kirish">
        {holat === "tekshiruv" ? <>
          <b>⚠️ {T("Kirish testi natijangiz tekshiruvda")}</b>
          <ul>{s.tekshiruvda.flatMap((t) => t.sabab).map((sb, i) => <li key={i}>{T(sb)}</li>)}</ul>
          <p>{T("Testni qayta topshiring: o‘zingiz, shoshilmay, ilovadan chiqmasdan. Kuniga bir marta topshirish mumkin.")}</p></>
          : <><b>🎯 {T("Avval kirish testini topshiring")}</b>
            <p>{tf("{n} ta savol, {d} daqiqa. Test darajangizni aniqlaydi va sizni mos guruhga qo‘shadi. Bahoga ta’sir qilmaydi — bilganingizcha yeching.", { n: s.kirish.savollar, d: s.kirish.daqiqa })}</p></>}
        <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => onKirish?.(s.toplam)}>▶ {holat === "tekshiruv" ? T("Qayta topshirish") : T("Kirish testini boshlash")}</button>
      </div>}
      {holat === "guruhda" && <>
        <div className="xb-kartalar">
          <div className="xb-karta"><small>{T("Guruhim")}</small><b>{tf("{n}-guruh", { n: s.guruh.raqam })}</b><small>{tf("{j} ta guruhdan", { j: s.guruh.jami })} · 👥 {s.guruh.soni}</small></div>
          <div className="xb-karta"><small>{T("Reytingim")}</small><b>{s.reyting}</b><small><Daraja d={s.daraja} /></small></div>
          <div className="xb-karta"><small>{T("Guruhdagi o‘rnim")}</small><b>{s.guruh.orin}</b><small>{tf("guruh o‘rtachasi {b}", { b: Math.round(s.guruh.ortacha) })}</small></div>
        </div>
        {s.tekshiruvda.length > 0 && <p className="xb-ogoh">⚠️ {tf("Oxirgi natijangiz ({b} ball) tekshiruvda: keyingi imtihon tasdiqlasa hisobga olinadi.", { b: s.tekshiruvda[s.tekshiruvda.length - 1].ball })}</p>}
        {s.sohalar.length > 0 && <div className="xg-ikki">
          <div><h5>📚 {T("Mavzu sohalari")}</h5>{s.sohalar.map((y) => <Yolak key={y.kalit} {...y} />)}</div>
          <div><h5>🧠 {T("Fikrlash ko‘nikmalari")}</h5>{s.fikrlash.map((y) => <Yolak key={y.kalit} {...y} />)}</div>
        </div>}
        <div className="xg-blok"><h5>🎯 {T("Nimani o‘rganish kerak")}</h5>
          {s.organish.length ? <p>{T("Hozircha eng ko‘p xato shu sohalarda:")} <b>{s.organish.join(", ")}</b></p> : <p>{T("Hamma sohada natijangiz yaxshi. Mulohaza talab qiladigan qiyinroq masalalarga o‘ting.")}</p>}
          <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => onToplam?.(s.toplam)}>▶ {T("Darslar va mashqlarni ochish")}</button></div>
        <details className="xg-qoida"><summary>ℹ️ {T("Darslar qanday o‘tadi va guruh qanday o‘zgaradi")}</summary><ul>
          <li>{T("Har mavzuda Kabu bilan dars, keyin mashq savollari; xato qilingan savollar takrorlashga tushadi.")}</li>
          <li>{T("Har hafta nazorat imtihoni bo‘ladi — reytingingiz shundan yangilanadi.")}</li>
          <li>{tf("Yuqori guruhga o‘tish uchun ketma-ket {n} ta imtihonda barqaror yuqori natija kerak. Bitta omadli natija yetmaydi.", { n: s.qoida.kochish_uchun })}</li>
          <li>{T("Imtihonni o‘zingiz yeching: juda tez yoki ilovadan chiqib yechilgan natija hisobga olinmaydi.")}</li>
        </ul></details>
      </>}
    </section>; })}</div>;
}
