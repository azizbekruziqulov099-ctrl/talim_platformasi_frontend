import React, { useCallback, useEffect, useRef, useState } from "react";
import { T, tf, xbTil } from "./xbTil.js";   // REV270: uch til
import XbSavol from "./XbSavol.jsx";
import XbDoska, { XbUstoz } from "./XbDoska.jsx";
import { useUstozOvoz, xbFetch } from "./xbOvoz.js";
import { DARAJA_RANG, FIKRLASH, IMTIHON_BELGI, javoblarSoni, qolganVaqt, solishtirishQatorlari, vaqtMatn } from "./xbRules.js";

const saqla = (id, j) => { try { localStorage.setItem(`xb:imt:${id}`, JSON.stringify(j)); } catch { /* ixtiyoriy */ } };
const ol = (id) => { try { return JSON.parse(localStorage.getItem(`xb:imt:${id}`) || "{}"); } catch { return {}; } };

/** Davlatlar bilan solishtirish diagrammasi (gorizontal ustunlar, 300–650 shkala). */
export function DavlatDiagramma({ qatorlar, chegaralar = [400, 475, 550, 625] }) {
  const min = 300, max = 650;
  return <div className="xb-diag" role="img" aria-label={T("Davlatlar bilan solishtirish")}>
    {qatorlar.map((q) => <div key={q.nom} className={`xb-diag-q ${q.siz ? "is-siz" : ""} ${q.uz ? "is-uz" : ""} ${q.markaz ? "is-markaz" : ""}`}>
      <span className="xb-diag-nom">{q.siz ? `⭐ ${q.nom}` : q.uz ? `🇺🇿 ${q.nom}` : q.nom}</span>
      <span className="xb-diag-bar"><i style={{ width: `${Math.max(2, Math.min(100, ((q.ball - min) / (max - min)) * 100))}%` }} /></span>
      <b>{q.ball}</b>
    </div>)}
    <div className="xb-diag-chegara">{chegaralar.filter((c) => c > min && c < max).map((c) => <span key={c} style={{ left: `${((c - min) / (max - min)) * 100}%` }}>{c}</span>)}</div>
  </div>;
}

function Ustunlar({ data }) {
  return <div className="xb-ustunlar">{data.map((d) => {
    const f = Math.round((100 * d.togri) / Math.max(1, d.jami));
    return <div key={d.nom} className="xb-ustun-q"><span>{d.nom}</span>
      <span className="xb-progress"><i style={{ width: `${f}%`, background: f >= 70 ? "#1f8a4c" : f >= 45 ? "#1b6fd8" : "#c77d00" }} /></span>
      <b>{d.togri}/{d.jami}</b></div>;
  })}</div>;
}

/** Topshirilgan imtihon natijasi va tahlili. */
export function XbNatija({ apiBase, token, id, jins, ustoz, onYopish }) {
  const ovoz = useUstozOvoz(apiBase, jins, typeof ustoz === "string" ? ustoz : "");
  const [d, setD] = useState(null);
  const [xato, setXato] = useState("");
  const [ochiq, setOchiq] = useState(null);
  const [faqatXato, setFaqatXato] = useState(true);
  useEffect(() => {
    let tirik = true;
    xbFetch(apiBase, `/api/xalqaro/imtihon/${id}`, token).then((r) => {
      if (!tirik) return;
      setD(r);
      if (r.tayyor && r.ball) {
        const t = Object.values(r.davlatlar || {})[0]?.solishtirish?.[0];
        const g = [tf("Imtihon tugadi. Siz {jami} ta savoldan {togri} tasiga to‘g‘ri javob berdingiz.", { jami: r.jami, togri: r.togri }),
          tf(r.daraja?.pisa ? "Taxminiy {dastur} balingiz {ball}, bu {daraja}." : "Taxminiy {dastur} balingiz {ball}, bu {daraja} daraja.", { dastur: r.dastur || "TIMSS", ball: r.ball, daraja: r.daraja?.nom || "" }),
          t ? tf("{nom} natijalari orasida bu {jami} ta davlat ichida {orin}-o‘ringa to‘g‘ri keladi.", { nom: t.nom, jami: t.jami, orin: t.orin }) : "",
          r.ball >= 550 ? tf("Barakalla!") : tf("Xatolaringiz ustida ishlaymiz — ular takrorlash navbatiga qo‘shildi.")];
        ovoz.say(g.join(" "));
      }
    }).catch((e) => tirik && setXato(e.message));
    return () => { tirik = false; ovoz.hush(); };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (xato) return <div className="xb-panel"><p className="xb-xato">{T(xato)}</p><button type="button" className="xb-btn" onClick={onYopish}>{T("← Orqaga")}</button></div>;
  if (!d) return <div className="xb-panel"><p className="xb-muted">⏳ {T("Natija hisoblanmoqda…")}</p></div>;
  const rang = DARAJA_RANG[d.daraja?.kalit] || "#1b6fd8";
  const sohalar = Object.values(d.sohalar || {}).map((s) => ({ nom: `${s.nom}${Object.keys(d.davlatlar || {}).length > 1 ? ` (${s.fan})` : ""}`, togri: s.togri, jami: s.jami }));
  const fik = Object.entries(d.fikrlash || {}).map(([k, [t, j]]) => ({ nom: T(FIKRLASH[k] || k), togri: t, jami: j }));
  const korinadi = (d.savollar || []).filter((s) => !faqatXato || !s.togri_mi);
  return <div className="xb-panel xb-natija">
    <div className="xb-mashq-bosh"><button type="button" className="xb-btn xb-btn-yengil" onClick={() => { ovoz.hush(); onYopish?.(); }}>← {T("Orqaga")}</button>
      <b>{IMTIHON_BELGI[d.tur]} {d.nom}</b><small>{d.davr}{d.rasmiy ? "" : ` · ${T("mashq urinishi")}`}</small></div>
    <div className="xb-natija-bosh">
      <XbUstoz ustoz={ustoz} speaking={ovoz.speaking} mood={d.ball >= 550 ? "happy" : ""} />
      <div className="xb-ball" style={{ borderColor: rang }}>
        <small>{tf("Taxminiy {dastur} bali", { dastur: d.dastur || "TIMSS" })}</small>
        <b style={{ color: rang }}>{d.ball ?? "—"}</b>
        <span>{d.daraja?.nom || ""}{d.daraja?.pisa ? "" : ` ${T("daraja")}`}{d.xato_ball ? ` · ±${d.xato_ball}` : ""}</span>
      </div>
      <div className="xb-natija-son"><b>{d.togri}/{d.jami}</b><small>{d.foiz}% {T("to‘g‘ri")}</small>
        {d.chiqishlar > 0 && <small className="xb-ogoh">⚠️ {T("Imtihon oynasidan")} {d.chiqishlar} {T("marta chiqilgan")}</small>}</div>
    </div>
    {Object.entries(d.davlatlar || {}).map(([k, v]) => <section key={k} className="xb-blok">
      <h4>🌍 {v.fan}: {T("natija")} <b>{v.ball}</b> · {v.daraja?.nom || ""}</h4>
      {v.daraja?.pisa && <p className="xb-muted">{v.daraja.tayanch ? `✅ ${T("Siz PISA tayanch darajasiga (2-daraja) yetgansiz — kundalik hayotdagi masalalarni mustaqil hal qila olasiz.")}` : `⚠️ ${T("Hali tayanch darajaga (2-daraja) yetmagansiz. Maqsad — shu daraja: u zamonaviy hayot uchun zarur minimal ko‘nikma deb hisoblanadi.")}`}</p>}
      {(v.solishtirish || []).slice(0, 1).map((t) => <div key={t.nom}>
        <p className="xb-muted">{t.nom}: {t.jami - 1} {T("davlat ichida")} <b>{tf("{n}-o‘rin", { n: t.orin })}</b>
          {t.ozbekiston ? <> · {T("O‘zbekiston o‘rtachasi")}: <b>{t.ozbekiston}</b></> : null}</p>
        <DavlatDiagramma qatorlar={solishtirishQatorlari(t.jadval || [], v.ball, 3, xbTil())} chegaralar={v.daraja?.pisa ? [420, 482, 545, 607] : undefined} />
      </div>)}
      {!(v.solishtirish || []).length && <p className="xb-muted">{T("Bu yo‘nalish bo‘yicha davlatlar jadvali yo‘q — natija PISA darajalarida ko‘rsatilgan.")}</p>}
    </section>)}
    {d.reyting && <section className="xb-blok"><h4>🏅 {T("Reyting (shu davr)")}</h4>
      <div className="xb-reyting-kart">{[["sinf", "Sinfda"], ["maktab", "Maktabda"], ["platforma", "Platformada"]].map(([k, n]) => d.reyting[k] && <div key={k}>
        <small>{T(n)}</small><b>{d.reyting[k].orin ? `${d.reyting[k].orin}/${d.reyting[k].jami}` : "—"}</b>
        <small>{d.reyting[k].orin ? `${T("o‘rtacha")}: ${d.reyting[k].ortacha}` : T("kamida 3 o‘quvchi kerak")}</small></div>)}</div></section>}
    <section className="xb-blok"><h4>📊 {T("Sohalar bo‘yicha")}</h4><Ustunlar data={sohalar} />
      <h4>🧠 {T("Fikrlash darajalari bo‘yicha")}</h4><Ustunlar data={fik} /></section>
    <section className="xb-blok"><h4>🔎 {T("Savollar tahlili")}</h4>
      <label className="xb-muted"><input type="checkbox" checked={faqatXato} onChange={(e) => setFaqatXato(e.target.checked)} /> {T("Faqat xato javoblar")}</label>
      {korinadi.map((s) => <div key={s.n} className={`xb-tahlil ${s.togri_mi ? "is-ok" : "is-no"}`}>
        <XbSavol savol={s} javob={s.berilgan} holat={{ ok: s.togri_mi, togri: s.turi === "tanlov" ? s.togri : null }} raqam={s.n + 1} ovoz={ovoz} />
        {!s.togri_mi && <p>{T("Sizning javobingiz")}: <b>{s.berilgan || "—"}</b> · {T("To‘g‘ri")}: <b>{s.turi === "tanlov" ? "ABCD"[s.togri] : String(s.javob).split("|")[0]}</b></p>}
        {ochiq === s.n ? <XbDoska qadamlar={s.yechim} ovoz={ovoz} ustoz={ustoz} sarlavha={T("Yechim")} />
          : <button type="button" className="xb-btn" onClick={() => { ovoz.hush(); setOchiq(s.n); }}>🧑‍🏫 {T("Yechimni ko‘rish")}</button>}
      </div>)}
      {!korinadi.length && <p>🌟 {T("Xato yo‘q!")}</p>}</section>
    <p className="xb-muted xb-kichik">{d.izoh || ""}</p>
  </div>;
}

/**
 * Haqiqiy imtihon rejimi: qoidalar → server vaqti bilan taymer → savollar (navigatsiya, belgilash) → topshirish.
 * Yillik imtihon 2 qismli (matematika, tanaffus, tabiiy fanlar). Vaqt tugasa avtomatik topshiriladi.
 */
export default function XbImtihon({ apiBase, token, jins = "qiz", ustoz = "sardor", tur, toplam, info, onYopish }) {
  const ovoz = useUstozOvoz(apiBase, jins, typeof ustoz === "string" ? ustoz : "");
  const [bosqich, setBosqich] = useState("qoida");   // qoida | ish | tanaffus | natija
  const [ses, setSes] = useState(null);
  const [javoblar, setJavoblar] = useState({});
  const [belgi, setBelgi] = useState({});
  const [i, setI] = useState(0);
  const [qolgan, setQolgan] = useState(60 * 60000);
  const [tasdiq, setTasdiq] = useState(false);
  const [xato, setXato] = useState("");
  const [natijaId, setNatijaId] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const chiqish = useRef(0);
  const clientBosh = useRef(Date.now());
  const yuborildi = useRef(false);

  const topshir = useCallback(async () => {
    if (!ses || yuborildi.current) return;
    yuborildi.current = true;
    setYuklanmoqda(true); setTasdiq(false); ovoz.hush();
    try {
      const r = await xbFetch(apiBase, "/api/xalqaro/imtihon/topshir", token, { method: "POST", body: { sessiya: ses.sessiya, javoblar, chiqishlar: chiqish.current, qism: ses.qism } });
      chiqish.current = 0;
      if (r.tayyor) { try { localStorage.removeItem(`xb:imt:${ses.sessiya}`); } catch { /* */ } setNatijaId(r.id); setBosqich("natija"); }
      else if (r.savollar) { clientBosh.current = Date.now(); setSes(r); setI(0); setBosqich("tanaffus"); yuborildi.current = false; }
    } catch (e) { setXato(e.message); yuborildi.current = false; }
    finally { setYuklanmoqda(false); }
  }, [ses, javoblar, apiBase, token, ovoz]);

  const boshla = async () => {
    setYuklanmoqda(true); setXato("");
    try {
      const r = await xbFetch(apiBase, "/api/xalqaro/imtihon/boshla", token, { method: "POST", body: { tur, toplam } });
      clientBosh.current = Date.now();
      setSes(r);
      setJavoblar({ ...(r.javoblar || {}), ...ol(r.sessiya) });
      setBosqich("ish");
      ovoz.say([tf(r.rasmiy ? "Rasmiy imtihon boshlandi." : "Mashq imtihoni boshlandi."), r.qism_fani && r.qismlar > 1 ? `${tf("{n}-qism", { n: r.qism })}: ${r.qism_fani}.` : "",
        tf("Shoshilmang, har bir savolni diqqat bilan o‘qing. Omad!")].join(" "));
    } catch (e) { setXato(e.message); }
    finally { setYuklanmoqda(false); }
  };

  useEffect(() => {
    if (!ses || (bosqich !== "ish" && bosqich !== "tanaffus")) return undefined;
    setQolgan(qolganVaqt(ses.tugash, ses.server_vaqt, clientBosh.current));
    const t = setInterval(() => {
      const q = qolganVaqt(ses.tugash, ses.server_vaqt, clientBosh.current);
      setQolgan(q);
      if (q <= 0 && bosqich === "ish") topshir();
    }, 500);
    return () => clearInterval(t);
  }, [ses, bosqich, topshir]);
  useEffect(() => {
    if (bosqich !== "ish") return undefined;
    const kor = () => { if (document.hidden) chiqish.current += 1; };
    const ket = (e) => { e.preventDefault(); e.returnValue = ""; };
    document.addEventListener("visibilitychange", kor);
    window.addEventListener("beforeunload", ket);
    return () => { document.removeEventListener("visibilitychange", kor); window.removeEventListener("beforeunload", ket); };
  }, [bosqich]);
  useEffect(() => { if (ses) saqla(ses.sessiya, javoblar); }, [javoblar, ses]);
  useEffect(() => () => ovoz.hush(), []); // eslint-disable-line react-hooks/exhaustive-deps

  if (bosqich === "natija" && natijaId) return <XbNatija apiBase={apiBase} token={token} id={natijaId} jins={jins} ustoz={ustoz} onYopish={onYopish} />;

  if (bosqich === "qoida") return <div className="xb-panel xb-qoida">
    <div className="xb-mashq-bosh"><button type="button" className="xb-btn xb-btn-yengil" onClick={onYopish}>← {T("Orqaga")}</button><b>{IMTIHON_BELGI[tur]} {info?.nom || T("Imtihon")}</b></div>
    <XbUstoz ustoz={ustoz} />
    <ul className="xb-qoida-list">
      <li>📝 {info?.savollar} {T("ta savol")}{info?.qismlar > 1 ? ` · ${info.qismlar} ${T("qism (matematika va tabiiy fanlar), orasida 10 daqiqa tanaffus")}` : ""}</li>
      <li>⏱️ {info?.daqiqa} {T("daqiqa — haqiqiy xalqaro imtihondagi kabi. Vaqt tugasa javoblar avtomatik topshiriladi.")}</li>
      <li>🚫 {T("Imtihon paytida ishora, yechim va ustoz yordami yo‘q. Oynadan chiqib ketish qayd etiladi.")}</li>
      <li>🔊 {T("Savolni ustoz o‘qib berishi mumkin, javobni ovoz bilan aytish ham mumkin.")}</li>
      <li>🏅 {info?.topshirildi ? T("Bu davr uchun rasmiy natijangiz bor — bu urinish mashq sifatida hisoblanadi (reytingga kirmaydi).") : T("Bu davrdagi birinchi urinish rasmiy hisoblanadi va reytingga kiradi.")}</li>
    </ul>
    {xato && <p className="xb-xato">{T(xato)}</p>}
    <button type="button" className="xb-btn xb-btn-asosiy xb-katta" disabled={yuklanmoqda} onClick={boshla}>{info?.davom ? T("▶ Imtihonni davom ettirish") : T("▶ Imtihonni boshlash")}</button>
  </div>;

  if (bosqich === "tanaffus") return <div className="xb-panel xb-qoida">
    <XbUstoz ustoz={ustoz} mood="happy" />
    <h3>☕ {T("Tanaffus")}</h3>
    <p>{T("1-qism topshirildi. Keyingi qism")}: <b>{ses?.qism_fani}</b>. {T("Biroz dam oling, suv iching.")}</p>
    <p className="xb-taymer">{vaqtMatn(Math.max(0, qolgan - (ses?.daqiqa || 0) * 60000))}</p>
    <button type="button" className="xb-btn xb-btn-asosiy xb-katta" onClick={() => { setJavoblar((j) => j); setBosqich("ish"); ovoz.say(`${tf("{n}-qism", { n: ses.qism })}: ${ses.qism_fani}. ${tf("Omad!")}`); }}>▶ {T("2-qismni boshlash")}</button>
  </div>;

  const savollar = ses?.savollar || [];
  const s = savollar[i];
  const kam = qolgan < 5 * 60000;
  return <div className="xb-imtihon">
    <header className="xb-imt-bosh">
      <b>{IMTIHON_BELGI[tur]} {ses?.nom || ""}{ses?.qismlar > 1 ? ` · ${tf("{n}-qism", { n: ses.qism })}: ${ses.qism_fani}` : ""}</b>
      <span className={`xb-taymer ${kam ? "is-kam" : ""}`} role="timer" aria-live={kam ? "polite" : "off"}>⏱ {vaqtMatn(qolgan)}</span>
      <span className="xb-muted">{javoblarSoni(Object.fromEntries(savollar.map((x) => [x.n, javoblar[x.n]])))}/{savollar.length} {T("javob")}</span>
    </header>
    <nav className="xb-nav" aria-label={T("Savollar")}>{savollar.map((x, k) => <button key={x.n} type="button"
      className={`${k === i ? "is-joriy" : ""} ${String(javoblar[x.n] ?? "").trim() ? "is-javob" : ""} ${belgi[x.n] ? "is-belgi" : ""}`}
      onClick={() => setI(k)} aria-label={tf("{n}-savol", { n: k + 1 })}>{k + 1}</button>)}</nav>
    {s && <XbSavol key={s.n} savol={s} javob={javoblar[s.n] || ""} imtihon raqam={i + 1} ovoz={ovoz}
      onJavob={(j) => setJavoblar((old) => ({ ...old, [s.n]: j }))} />}
    <div className="xb-imt-tug">
      <button type="button" className="xb-btn" disabled={i === 0} onClick={() => setI(i - 1)}>← {T("Oldingi")}</button>
      <button type="button" className={`xb-btn ${belgi[s?.n] ? "is-on" : ""}`} onClick={() => setBelgi((b) => ({ ...b, [s.n]: !b[s.n] }))}>🚩 {T("Keyin qaytaman")}</button>
      {i < savollar.length - 1
        ? <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => setI(i + 1)}>{T("Keyingi")} →</button>
        : <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => setTasdiq(true)}>{ses?.qism < ses?.qismlar ? T("1-qismni topshirish") : T("Topshirish")}</button>}
    </div>
    {xato && <p className="xb-xato">{T(xato)}</p>}
    {tasdiq && <div className="xb-modal" role="dialog" aria-modal="true"><div className="xb-modal-ich">
      <h4>{T("Imtihonni topshirasizmi?")}</h4>
      <p>{savollar.length - javoblarSoni(Object.fromEntries(savollar.map((x) => [x.n, javoblar[x.n]])))} {T("ta savolga javob berilmagan.")} {Object.values(belgi).filter(Boolean).length ? `🚩 ${Object.values(belgi).filter(Boolean).length} ${T("ta belgilangan savol bor.")}` : ""}</p>
      <div className="xb-imt-tug"><button type="button" className="xb-btn" onClick={() => setTasdiq(false)}>{T("Qaytish")}</button>
        <button type="button" className="xb-btn xb-btn-asosiy" disabled={yuklanmoqda} onClick={topshir}>{T("Ha, topshiraman")}</button></div>
    </div></div>}
  </div>;
}
