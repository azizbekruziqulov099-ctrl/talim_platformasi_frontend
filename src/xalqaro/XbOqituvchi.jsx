import React, { useEffect, useState } from "react";
import { T, tf, xbTil } from "./xbTil.js";   // REV270: uch til
import { OqituvchiSinflar, fanMatn } from "./XbSinflar.jsx";   // REV373
import XbTopshiriqlar from "./XbTopshiriqlar.jsx";   // REV401
import XbSavol from "./XbSavol.jsx";
import XbDoska from "./XbDoska.jsx";
import { useUstozOvoz, xbFetch } from "./xbOvoz.js";
import { IMTIHON_BELGI } from "./xbRules.js";
import { XB_TILLAR, XB_TIL_BAYROQ, XB_TIL_NOMI } from "./xbTil.js";

const HOLAT = { faol: ["🟢", "Faol"], sust: ["🟠", "Sust"], boshlamagan: ["🔴", "Boshlamagan"] };
const TOPLAM_UZ = { T11_G4_M: "4-sinf matematika", T11_G4_S: "4-sinf tabiiy fanlar", T11_G8_M: "8-sinf matematika", T11_G8_S: "8-sinf tabiiy fanlar",
  P_M: "PISA matematika", P_R: "PISA o‘qish", P_S: "PISA tabiiy fanlar", P_F: "PISA moliyaviy savodxonlik" };
const TOPLAM_NOMI = new Proxy({}, { get: (_, k) => (TOPLAM_UZ[k] ? T(TOPLAM_UZ[k]) : "") });
/** REV270: o'quvchi qaysi tillarda ishlayotgani (har tilning natijasi alohida). */
const tillarMatn = (t) => XB_TILLAR.filter((k) => t?.[k]).map((k) => `${XB_TIL_BAYROQ[k]} ${t[k]}`).join(" · ");

/** Xato qilingan savol: o'quvchi bergan javob, to'g'ri javob, xato sababi va doskada yechim. */
export function XatoKarta({ s, ovoz, ustoz, raqam }) {
  const [doska, setDoska] = useState(false);
  const tanlov = s.turi === "tanlov";
  const berIdx = tanlov ? "ABCD".indexOf(String(s.berilgan || "").toUpperCase()) : -1;
  const sabab = tanlov ? (berIdx >= 0 ? s.xatolar?.[String(berIdx)] : "") : s.xatolar?.umumiy;
  return <div className="xb-tahlil is-no">
    <p className="xb-muted">{TOPLAM_NOMI[s.toplam] || ""} {s.manba?.startsWith("imtihon") ? ` · 📝 ${T("imtihonda")}` : ""}{s.urinish > 1 ? ` · ${s.urinish} ${T("marta urinilgan")}` : ""}</p>
    <XbSavol savol={s} javob={s.berilgan} holat={{ ok: false, togri: tanlov ? s.togri : null }} raqam={raqam} ovoz={ovoz} />
    <p>{T("Bergan javobi")}: <b className="xb-xato">{s.berilgan || T("javob bermagan")}</b> · {T("To‘g‘ri javob")}: <b className="xb-ok">{tanlov ? `${"ABCD"[s.togri]}) ${s.javoblar?.[s.togri] ?? ""}` : String(s.javob || "").split("|")[0]}</b></p>
    {sabab && <p>🔍 <b>{T("Xato sababi")}:</b> {sabab}</p>}
    {s.usul && <p className="xb-muted">🧭 {T("To‘g‘ri yechish yo‘li")}: {s.usul}</p>}
    {doska ? <XbDoska qadamlar={s.yechim} ovoz={ovoz} ustoz={ustoz} sarlavha={T("Yechim")} />
      : <button type="button" className="xb-btn" onClick={() => { ovoz.hush(); setDoska(true); }}>🧑‍🏫 {T("Yechimni doskada ko‘rish")}</button>}
  </div>;
}

/** O'quvchining o'z xatolari (o'quvchi «Xalqaro baholash → Xatolarim» bo'limidan topadi). */
export function Xatolarim({ apiBase, token, jins, ustoz, toplam, onMashq }) {
  const ovoz = useUstozOvoz(apiBase, jins, typeof ustoz === "string" ? ustoz : "");
  const [d, setD] = useState(null);
  const [hammasi, setHammasi] = useState(false);
  useEffect(() => { let t = true; xbFetch(apiBase, "/api/xalqaro/xatolarim", token, { params: { toplam: hammasi ? "" : toplam } }).then((r) => t && setD(r)).catch(() => t && setD({ xatolar: [] })); return () => { t = false; ovoz.hush(); }; }, [toplam, hammasi]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return <p className="xb-muted">⏳</p>;
  return <div className="xb-panel">
    <h3>❌ {T("Mening xatolarim")}</h3>
    <p className="xb-muted">{T("Bu yerda hozir ham xato bo‘lib turgan savollaringiz: nima deb javob berdingiz, to‘g‘risi qanday, nega xato va qanday yechiladi. Savolni mashqda to‘g‘ri yechsangiz — ro‘yxatdan chiqadi.")}</p>
    <label className="xb-muted"><input type="checkbox" checked={hammasi} onChange={(e) => setHammasi(e.target.checked)} /> {T("Barcha to‘plamlar")}</label>
    {d.zaif_mavzular?.length > 0 && <section className="xb-blok"><h4>📉 {T("Zaif mavzularim")}</h4>
      <div className="xb-ustunlar">{d.zaif_mavzular.map((m) => <div key={m.kalit} className="xb-ustun-q"><span>{m.nom}</span>
        <span className="xb-progress"><i style={{ width: `${m.foiz}%`, background: "#c77d00" }} /></span><b>{m.foiz}%</b></div>)}</div></section>}
    {d.xatolar.length > 0 && <button type="button" className="xb-btn xb-btn-asosiy" onClick={onMashq}>🔁 {T("Xatolar ustida ishlash (takrorlash)")}</button>}
    {d.xatolar.map((s, k) => <XatoKarta key={`${s.savol_id}-${k}`} s={s} ovoz={ovoz} ustoz={ustoz} raqam={k + 1} />)}
    {!d.xatolar.length && <p>🌟 {T("Hozircha xatolaringiz yo‘q. Mashq yoki imtihon topshiring — xato bo‘lsa shu yerda chiqadi.")}</p>}
  </div>;
}

function OquvchiTafsilot({ apiBase, token, id, jins, ustoz, til, onYopish }) {
  const ovoz = useUstozOvoz(apiBase, jins, typeof ustoz === "string" ? ustoz : "");
  const [d, setD] = useState(null);
  const [xato, setXato] = useState("");
  useEffect(() => { let t = true; xbFetch(apiBase, `/api/xalqaro/oquvchi/${id}`, token, { params: { til } }).then((r) => t && setD(r)).catch((e) => t && setXato(e.message)); return () => { t = false; ovoz.hush(); }; }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (xato) return <div className="xb-panel"><p className="xb-xato">{T(xato)}</p><button type="button" className="xb-btn" onClick={onYopish}>← {T("Orqaga")}</button></div>;
  if (!d) return <p className="xb-muted">⏳</p>;
  return <div className="xb-panel">
    <div className="xb-mashq-bosh"><button type="button" className="xb-btn xb-btn-yengil" onClick={() => { ovoz.hush(); onYopish(); }}>← {T("Sinfga qaytish")}</button>
      <b>👤 {d.oquvchi.ism}</b><small>{d.oquvchi.sinf} · {XB_TIL_BAYROQ[d.til]} {XB_TIL_NOMI[d.til]} · 🔁 {T("takrorlash navbatida")} {d.takror_navbat}</small></div>
    {d.tillar && Object.keys(d.tillar).length > 1 && <p className="xb-muted">🌐 {T("Bu o‘quvchi bir nechta tilda ishlaydi — har tilning natijasi alohida")}: {tillarMatn(d.tillar)} {T("javob")}</p>}
    <section className="xb-blok"><h4>📚 {T("Mavzular bo‘yicha o‘zlashtirish (eng zaifi tepada)")}</h4>
      {d.mavzular.length ? <div className="xb-ustunlar">{d.mavzular.map((m) => <div key={m.kalit} className="xb-ustun-q"><span>{m.nom} <small className="xb-muted">({TOPLAM_NOMI[m.toplam]})</small></span>
        <span className="xb-progress"><i style={{ width: `${m.foiz}%`, background: m.foiz >= 70 ? "#1f8a4c" : m.foiz >= 40 ? "#1b6fd8" : "#c77d00" }} /></span><b>{m.ozlashtirgan}/{m.jami}</b></div>)}</div>
        : <p className="xb-muted">{T("Hali mashq qilmagan.")}</p>}</section>
    {/* REV376: o'qigan darslari va eng ko'p ishlagan mavzulari */}
    <section className="xb-blok"><h4>📖 {T("O‘qigan darslari")} ({(d.darslar || []).filter((x) => x.tugadi).length} {T("ta tugatgan")})</h4>
      {(d.darslar || []).length ? <div className="xb-ustunlar">{d.darslar.map((x) => <div key={x.kalit} className="xb-ustun-q">
        <span>{x.tugadi ? "✅" : "▶️"} {x.nom} <small className="xb-muted">({TOPLAM_NOMI[x.toplam] || ""})</small></span>
        <small className="xb-muted">{x.tugadi ? T("tugatgan") : T("ochgan, tugatmagan")} · {x.ochildi} {T("marta ochgan")} · {new Date(x.oxirgi).toLocaleDateString()}</small></div>)}</div>
        : <p className="xb-muted">{T("Hali dars ochmagan.")}</p>}</section>
    <section className="xb-blok"><h4>🏋️ {T("Eng ko‘p ishlagan 10 mavzusi")}</h4>
      {(d.kop_ishlagan || []).length ? <table className="xb-jadval"><thead><tr><th>{T("Mavzu")}</th><th>{T("Urinish")}</th><th>{T("To‘g‘ri")}</th><th>%</th><th>{T("Oxirgi")}</th></tr></thead>
        <tbody>{d.kop_ishlagan.map((m) => <tr key={m.kalit}><td>{m.nom} <small className="xb-muted">({TOPLAM_NOMI[m.toplam] || ""})</small></td><td>{m.urinish}</td><td>{m.togri}/{m.savol}</td>
          <td><b style={{ color: m.foiz >= 70 ? "#1f8a4c" : m.foiz >= 40 ? "#1b6fd8" : "#c77d00" }}>{m.foiz}%</b></td><td>{m.oxirgi ? new Date(m.oxirgi).toLocaleDateString() : "—"}</td></tr>)}</tbody></table>
        : <p className="xb-muted">{T("Hali mashq qilmagan.")}</p>}</section>
    <section className="xb-blok"><h4>📝 {T("Oxirgi 10 ta imtihon")}</h4>
      {d.imtihonlar.length ? <table className="xb-jadval"><thead><tr><th>{T("Imtihon")}</th><th>{T("Davr")}</th><th>{T("Ball")}</th><th>%</th><th>{T("Chiqish")}</th></tr></thead>
        <tbody>{d.imtihonlar.map((e) => <tr key={e.id}><td>{IMTIHON_BELGI[e.tur]} {e.nom}{e.rasmiy ? "" : ` (${T("mashq")})`}</td><td>{e.davr}</td><td>{e.ball ?? "—"} {e.daraja ? `· ${e.daraja}` : ""}</td><td>{e.foiz}%</td>
          <td>{e.chiqishlar ? `⚠️ ${e.chiqishlar}` : "—"}</td></tr>)}</tbody></table> : <p className="xb-muted">{T("Imtihon topshirmagan.")}</p>}</section>
    <section className="xb-blok"><h4>❌ {T("Xatolari")} ({d.xatolar.length})</h4>
      {d.xatolar.map((s, k) => <XatoKarta key={`${s.savol_id}-${k}`} s={s} ovoz={ovoz} ustoz={ustoz} raqam={k + 1} />)}
      {!d.xatolar.length && <p className="xb-muted">{T("Ochiq xato yo‘q.")}</p>}</section>
  </div>;
}

/**
 * REV261: O'qituvchi va admin paneli — sinf o'quvchilari (faollik, ball, zaif mavzu, haftalik nazorat), sinf bo'yicha
 * eng ko'p xato qilingan savollar (eng ko'p tanlangan noto'g'ri javob va uning sababi) va mavzular, har bir o'quvchining xatolari.
 * Admin istalgan maktabni (yoki butun platformani) tanlaydi; o'qituvchi faqat o'z maktabini ko'radi.
 */
export default function XbOqituvchi({ apiBase, token, jins, ustoz, kuzatuv, onDars, kat = null }) {
  const ovoz = useUstozOvoz(apiBase, jins, typeof ustoz === "string" ? ustoz : "");
  const [maktab, setMaktab] = useState(0);
  const [sinf, setSinf] = useState("");
  const [harf, setHarf] = useState("");
  const [oyna, setOyna] = useState("oquvchilar");
  const [d, setD] = useState(null);
  const [x, setX] = useState(null);
  const [xato, setXato] = useState("");
  const [tanlangan, setTanlangan] = useState(null);
  const [ochiq, setOchiq] = useState(null);
  const [til, setTil] = useState(xbTil());   // REV270: qaysi tildagi natijalar ko'rilmoqda (sukut bo'yicha — interfeys tili)
  const [xbSinf, setXbSinf] = useState(0);   // REV373: o'qituvchi ochgan sinf (0 — maktab bo'yicha)
  const [xbFan, setXbFan] = useState("");    // REV374: tanlangan sinf fani — natijalar shu fan bo'yicha
  // REV376: panel bosh sahifasi — sinflar ro'yxati; sinf bosilsa — alohida «sinf sahifasi»; maktab/platforma — alohida sahifa
  const [korinish, setKorinish] = useState(null);   // null | { tur: "sinf", s } | { tur: "maktab" }
  const admin = kuzatuv?.rol === "admin";
  const mustaqil = Boolean(kuzatuv?.mustaqil);
  const params = { sinf, harf, maktab_id: maktab || 0, til, xb_sinf: xbSinf || 0, toplam: xbSinf ? xbFan : "" };
  useEffect(() => {
    let t = true; setD(null); setX(null); setXato("");
    if (!korinish) return () => { t = false; };   // REV376: bosh sahifada natijalar yuklanmaydi
    xbFetch(apiBase, "/api/xalqaro/sinf_natija", token, { params }).then((r) => t && setD(r)).catch((e) => t && setXato(e.message));
    xbFetch(apiBase, "/api/xalqaro/sinf_xatolar", token, { params }).then((r) => t && setX(r)).catch(() => t && setX({ savollar: [], mavzular: [] }));
    return () => { t = false; ovoz.hush(); };
  }, [maktab, sinf, harf, til, xbSinf, xbFan, korinish]); // eslint-disable-line react-hooks/exhaustive-deps
  // REV401: jonli kuzatuv — sahifa ochiq turganda har 20 soniyada jimgina yangilanadi (o'quvchi yechgani, ismi, holati)
  const [yangilandi, setYangilandi] = useState(null);
  useEffect(() => {
    if (!korinish || tanlangan) return undefined;
    const yangila = () => { if (document.visibilityState !== "visible") return;
      xbFetch(apiBase, "/api/xalqaro/sinf_natija", token, { params }).then((r) => { setD(r); setYangilandi(new Date()); }).catch(() => {});
      xbFetch(apiBase, "/api/xalqaro/sinf_xatolar", token, { params }).then(setX).catch(() => {}); };
    setYangilandi(new Date());
    const tm = setInterval(yangila, 20000);
    return () => clearInterval(tm);
  }, [maktab, sinf, harf, til, xbSinf, xbFan, korinish, tanlangan]); // eslint-disable-line react-hooks/exhaustive-deps

  if (tanlangan) return <OquvchiTafsilot apiBase={apiBase} token={token} id={tanlangan} jins={jins} ustoz={ustoz} til={til} onYopish={() => setTanlangan(null)} />;
  const j = d?.jamlama;
  if (!korinish) return <div className="xb-panel">
    <h3>👩‍🏫 {admin ? T("Admin: xalqaro baholash nazorati") : T("O‘qituvchi paneli")}</h3>
    <p className="xb-muted">{T("Sinfni bosing — o‘sha sinfning sahifasi ochiladi: o‘quvchilar, ularning natijalari, o‘qigan darslari, imtihonlari va xatolari.")}</p>
    <OqituvchiSinflar apiBase={apiBase} token={token} tanlangan={0} onTanla={(id, sn) => { if (!id) return; setXbSinf(id); setXbFan(sn?.toplam || ""); setOyna("oquvchilar"); setKorinish({ tur: "sinf", s: sn }); }} />
    {(admin || !mustaqil) && <button type="button" className="xb-menyu-karta xb-maktab-karta" onClick={() => { setXbSinf(0); setXbFan(""); setKorinish({ tur: "maktab" }); }}>
      <span className="xb-menyu-belgi" aria-hidden="true">{admin ? "🌐" : "🏫"}</span><b>{admin ? T("Maktablar va butun platforma") : T("Maktabim o‘quvchilari")}</b>
      <small>{admin ? T("Istalgan maktab yoki butun platforma bo‘yicha natijalar") : T("Maktabingizdagi o‘quvchilar — sinf va harf bo‘yicha")}</small></button>}
  </div>;
  const sn = korinish.tur === "sinf" ? korinish.s : null;
  return <div className="xb-panel">
    <div className="xb-bolim-bosh"><button type="button" className="xb-btn" onClick={() => { ovoz.hush(); setKorinish(null); setXbSinf(0); }}>← {T("Mening sinflarim")}</button></div>
    <p className="xb-jonli" aria-live="polite"><span className="xb-jonli-nuqta" aria-hidden="true" /> {T("Jonli: har 20 soniyada yangilanadi")}{yangilandi ? ` · ${yangilandi.toLocaleTimeString().slice(0, 5)}` : ""}</p>
    {sn ? <div className="xb-sinf-sahifa-bosh">
      <div><h3>🏫 {sn.nom}</h3><span className="xb-fan-yorliq">{fanMatn(sn.toplam)}</span>
        <small className="xb-muted"> · {tf("{n}-sinf", { n: sn.sinf })} · 👥 {d?.jamlama?.jami ?? sn.azolar} {T("o‘quvchi")}</small></div>
      <div className="xb-sinf-kod" title={T("Taklif kodi")}>{sn.kod}</div>
    </div> : <h3>{admin ? `🌐 ${T("Maktablar va butun platforma")}` : `🏫 ${T("Maktabim o‘quvchilari")}`}</h3>}
    {admin && !sn && kuzatuv.platforma && <div className="xb-kartalar">
      <div className="xb-karta"><small>{T("Platformada faol o‘quvchi")}</small><b>{kuzatuv.platforma.oquvchi}</b></div>
      <div className="xb-karta"><small>{T("Jami javoblar")}</small><b>{kuzatuv.platforma.javob}</b></div>
      <div className="xb-karta"><small>{T("Rasmiy imtihonlar")}</small><b>{kuzatuv.platforma.imtihon}</b></div>
      <div className="xb-karta"><small>{T("O‘rtacha ball")}</small><b>{kuzatuv.platforma.ortacha_ball ?? "—"}</b></div>
    </div>}
    <div className="xb-filtr">
      {admin && !sn && <label className="xb-tanla">{T("Maktab")}: <select value={maktab} onChange={(e) => setMaktab(Number(e.target.value))}>
        <option value={0}>{T("Butun platforma")}</option>{(kuzatuv.maktablar || []).map((m) => <option key={m.id} value={m.id}>{m.nomi} ({m.oquvchi})</option>)}</select></label>}
      {!sn && <><label className="xb-tanla">{T("Sinf")}: <select value={sinf} onChange={(e) => setSinf(e.target.value)}><option value="">{T("Hammasi")}</option>
        {Array.from({ length: 11 }, (_, k) => <option key={k} value={String(k + 1)}>{tf("{n}-sinf", { n: k + 1 })}</option>)}</select></label>
      <label className="xb-tanla">{T("Harf")}: <select value={harf} onChange={(e) => setHarf(e.target.value)}><option value="">—</option>
        {["A", "B", "V", "G", "D", "E"].map((h) => <option key={h} value={h}>{h}</option>)}</select></label></>}
      <label className="xb-tanla">🌐 {T("Ta’lim tili")}: <select value={til} onChange={(e) => setTil(e.target.value)}>
        {XB_TILLAR.map((k) => <option key={k} value={k}>{XB_TIL_BAYROQ[k]} {XB_TIL_NOMI[k]}</option>)}</select></label>
    </div>
    <p className="xb-muted xb-kichik">🌐 {T("Natijalar tanlangan tilda ko‘rsatiladi. O‘quvchi boshqa tilda ishlagan bo‘lsa, «Tillar» ustunida ko‘rinadi — u tilning natijasini ko‘rish uchun tilni almashtiring.")}</p>
    {xato && <p className="xb-xato">{T(xato)}</p>}
    {sn && d && !d.oquvchilar.length && <div className="xb-bosh-sinf">
      <h4>📋 {T("Sinf jurnali")}: {T("hali hech kim qo‘shilmagan")}</h4>
      <p>{T("O‘quvchilar bu sinfga qo‘shilganda ro‘yxati shu yerda jurnaldagidek chiqadi: ismi, qo‘shilgan sanasi, faolligi, o‘qigan darslari, natijalari.")}</p>
      <ol>
        <li>{T("O‘quvchilarga shu kodni bering")}: <b className="xb-sinf-kod xb-kod-ichki">{sn.kod}</b></li>
        <li>{T("Yoki havolani Telegram guruhiga yuboring")}: <code>{`${window.location.origin}/?xb_sinf=${sn.kod}`}</code>
          <button type="button" className="xb-btn" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/?xb_sinf=${sn.kod}`)}>📋 {T("Nusxalash")}</button></li>
        <li>{T("O‘quvchi «Xalqaro baholash» → «🏫 Sinfim» → «Sinfga qo‘shilish» orqali kodni yozadi yoki sinfni ro‘yxatdan tanlab, parolni kiritadi.")}</li>
      </ol>
    </div>}
    {j && (!sn || d.oquvchilar.length > 0) && <div className="xb-kartalar">
      <div className="xb-karta"><small>{T("O‘quvchilar")}</small><b>{j.jami}</b></div>
      <div className="xb-karta"><small>🟢 {T("Faol")} / 🟠 {T("Sust")} / 🔴 {T("Boshlamagan")}</small><b>{j.faol} / {j.sust} / {j.boshlamagan}</b></div>
      <div className="xb-karta"><small>{T("Bu haftalik nazoratni topshirgan")}</small><b>{j.haftalik}/{j.jami}</b></div>
      <div className="xb-karta"><small>{T("O‘rtacha rasmiy ball")}</small><b>{j.ortacha_ball ?? "—"}</b></div>
    </div>}
    {(!sn || (d && d.oquvchilar.length > 0)) && <nav className="xb-tablar">{[["oquvchilar", sn ? "📋 Sinf jurnali" : "👥 O‘quvchilar"], ...(sn ? [["topshiriq", "📝 Topshiriqlar"]] : []), ["xatolar", "❌ Sinf xatolari"], ["mavzular", "📚 Mavzular bo‘yicha"]].map(([k, n]) =>
      <button key={k} type="button" className={oyna === k ? "is-on" : ""} onClick={() => setOyna(k)}>{T(n)}</button>)}</nav>}
    {oyna === "topshiriq" && sn && <XbTopshiriqlar apiBase={apiBase} token={token} sinf={sn} til={til} mavzular={(kat?.toplamlar?.find((tp) => tp.kalit === sn.toplam)?.mavzular || x?.mavzular || []).map((m) => ({ kalit: m.kalit, nom: m.nom }))} />}
    {oyna === "oquvchilar" && (!d ? <p className="xb-muted">⏳</p> : d.oquvchilar.length ? <div className="xb-jadval-wrap">
      {sn && <h4>📋 {T("Sinf jurnali")} — {d.oquvchilar.length} {T("o‘quvchi")} <small className="xb-muted">({T("ism bo‘yicha")})</small></h4>}<table className="xb-jadval">
      <thead><tr><th>№</th><th>{T("O‘quvchi")}</th>{sn ? <th>{T("Qo‘shilgan")}</th> : <th>{T("Sinf")}</th>}<th>{T("Holat")}</th><th>{T("Bu hafta")}</th><th>📖 {T("Darslar")}</th><th>{T("O‘zlashtirgan")}</th><th>{T("Ochiq xato")}</th><th>{T("Oxirgi ball")}</th><th>{T("Zaif mavzu")}</th><th>🌐 {T("Tillar")}</th></tr></thead>
      <tbody>{d.oquvchilar.map((o, n) => <tr key={o.user_id} className={`xb-bosiladi ${o.holat !== "faol" ? "is-sust" : ""}`} onClick={() => setTanlangan(o.user_id)} tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") setTanlangan(o.user_id); }}>
        <td className="xb-muted">{n + 1}</td><td><b>{o.full_name}</b></td>{sn ? <td className="xb-kichik">{o.qoshildi ? new Date(o.qoshildi).toLocaleDateString() : "—"}</td> : <td>{o.class}{o.harf}</td>}
        <td>{HOLAT[o.holat][0]} {T(HOLAT[o.holat][1])}{o.kun_oldin !== null && o.kun_oldin > 0 ? ` · ${o.kun_oldin} ${T("kun")}` : ""}{!o.haftalik_topshirdi ? ` · ⏳ ${T("haftalik yo‘q")}` : ""}</td>
        <td>{o.hafta}</td><td title={T("tugatgan / ochgan")}>{o.darslar ?? 0}/{o.darslar_ochgan ?? 0}</td><td>{o.ozlashtirgan}/{o.urinish}</td><td>{o.xato ? <b className="xb-xato">{o.xato}</b> : 0}</td>
        <td>{o.ball ? `${o.ball} · ${o.daraja}` : "—"}</td><td>{o.zaif_mavzu || "—"}</td><td className="xb-kichik">{tillarMatn(o.tillar) || "—"}</td></tr>)}</tbody></table>
      <p className="xb-muted">{T("Qatorni bosing — o‘quvchining har bir xatosi (nima deb javob bergani), mavzulari va imtihonlari ochiladi.")}</p></div>
      : !sn && <p className="xb-muted">{T("Bu tanlovda o‘quvchi topilmadi.")}</p>)}
    {oyna === "xatolar" && (!x ? <p className="xb-muted">⏳</p> : x.savollar.length ? x.savollar.map((s, k) => <div key={`${s.savol_id}-${s.v ?? k}`} className="xb-tahlil is-no">
      <p><b>{s.xato}</b> {T("o‘quvchi xato qildi")} ({s.xato_foiz}% {T("urinishlardan")}) · 🌍 {T("dunyoda to‘g‘ri yechganlar")}: {s.xalqaro_foiz}%</p>
      <XbSavol savol={s} javob={s.kop_javob} holat={{ ok: false, togri: s.turi === "tanlov" ? s.togri : null }} raqam={k + 1} ovoz={ovoz} />
      {s.kop_javob && <p>{T("Ko‘p berilgan noto‘g‘ri javob")}: <b className="xb-xato">{s.kop_javob}</b>{s.kop_izoh ? <> — {s.kop_izoh}</> : null}</p>}
      <p>{T("To‘g‘ri javob")}: <b className="xb-ok">{s.turi === "tanlov" ? "ABCD"[s.togri] : String(s.javob).split("|")[0]}</b> · 🎯 {s.kunikma}</p>
      {ochiq === s.savol_id ? <XbDoska qadamlar={s.yechim} ovoz={ovoz} ustoz={ustoz} sarlavha={T("Sinfga shu yechimni ko‘rsating")} />
        : <button type="button" className="xb-btn" onClick={() => { ovoz.hush(); setOchiq(s.savol_id); }}>🧑‍🏫 {T("Yechimni doskada ko‘rish")}</button>}
    </div>) : <p className="xb-muted">{T("Hali xato yo‘q yoki o‘quvchilar mashq qilmagan.")}</p>)}
    {oyna === "mavzular" && (!x ? <p className="xb-muted">⏳</p> : x.mavzular.length ? <div className="xb-ustunlar">{x.mavzular.map((m) => <div key={m.kalit} className="xb-ustun-q xb-ustun-tug">
      <span>{m.nom}<small className="xb-muted"> · {TOPLAM_NOMI[m.toplam]} · {m.oquvchi} {T("o‘quvchi")}</small></span>
      <span className="xb-progress"><i style={{ width: `${m.foiz}%`, background: m.dunyo !== null && m.foiz < m.dunyo ? "#c77d00" : "#1f8a4c" }} /></span>
      <b>{m.foiz}% <small className="xb-muted">/ 🌍 {m.dunyo}%</small></b>
      {onDars && <button type="button" className="xb-btn xb-btn-kichik" onClick={() => onDars(m)}>🧑‍🏫 {T("Dars")}</button>}</div>)}
      <p className="xb-muted">{T("To‘q sariq — sinf dunyo o‘rtachasidan past. Shu mavzu darsini sinf bilan birga ko‘rib chiqing.")}</p></div>
      : <p className="xb-muted">{T("Ma’lumot yo‘q.")}</p>)}
  </div>;
}
