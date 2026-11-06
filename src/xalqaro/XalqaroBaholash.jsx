import React, { useCallback, useEffect, useMemo, useState } from "react";
import { lazyQayta } from "../workspace/lazyQayta.js";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import { T, tf, xbTil } from "./xbTil.js";   // REV270: uch til
import { ustozFor } from "../kid/ustozRules.js";
import XbMavzu from "./XbMavzu.jsx";
import XbMashq from "./XbMashq.jsx";
import XbImtihon, { DavlatDiagramma, XbNatija } from "./XbImtihon.jsx";
import { XbUstoz } from "./XbDoska.jsx";
import XbOqituvchi, { Xatolarim } from "./XbOqituvchi.jsx";   // REV261
import { OquvchiSinf } from "./XbSinflar.jsx";   // REV373
import XbNatijalarim from "./XbNatijalarim.jsx";   // REV381
import { useUstozOvoz, xbFetch } from "./xbOvoz.js";
import { GAP_TUR, IMTIHON_BELGI, darajaNomi, mavzuBelgi, sinfRaqami, solishtirishQatorlari } from "./xbRules.js";
import XbQollanma from "./XbQollanma.jsx";   // REV262
import { XB_TILLAR, XB_TIL_BAYROQ, XB_TIL_NOMI } from "./xbTil.js";
import "./xalqaro.css";

const DarsXonasi = lazyQayta(() => import("../lesson/DarsXonasi.jsx"));
const TABLAR = [["qollanma", "📖 Qo‘llanma"], ["kurs", "📚 Kurs"], ["imtihon", "📝 Imtihonlar"], ["xato", "❌ Xatolarim"], ["takror", "🔁 Takrorlash"], ["reyting", "🏅 Reyting"], ["dunyo", "🌍 Dunyo natijalari"]];
const ESLA = "kabutar:xb:toplam";

/**
 * REV260: «Xalqaro baholash» bo'limi — har sinfga mos TIMSS to'plami (4-sinf yoki 8-sinf; xohlasa boshqasini tanlaydi):
 *   Kurs (mavzu → Kabu darsi → mashq), haftalik/oylik/choraklik/yillik haqiqiy imtihonlar, takrorlash navbati,
 *   reyting (sinf/maktab/platforma + davlatlar), dunyo natijalari (TIMSS 2019/2023, PISA 2022/2025, PIRLS 2021), o'qituvchiga sinf natijasi.
 */
export default function XalqaroBaholash(props) {
  // REV270: interfeys tili o'zgarsa — bo'lim boshqa til bilan qaytadan ochiladi (holat, kontent va natijalar shu tilniki)
  useInterface();
  const til = xbTil();
  return <XalqaroBolim key={til} til={til} {...props} />;
}

function XalqaroBolim({ apiBase, token, user, jins = "qiz", cheklovsiz = false, rejim = "", til = "uz" }) {
  const ovoz = useUstozOvoz(apiBase, jins);
  // REV375: bosh sahifa — tartibli menyu (tab = "" ). Bo'lim faqat bosilganda katta bo'lib ochiladi.
  const [tab, setTab] = useState("");
  const [fanOchiq, setFanOchiq] = useState(false);
  const [kat, setKat] = useState(null);
  const [xato, setXato] = useState("");
  const [toplam, setToplam] = useState(() => { try { return localStorage.getItem(ESLA) || ""; } catch { return ""; } });
  const [ekran, setEkran] = useState(null);   // {tur: mavzu|dars|mashq|imtihon|natija|maktab, ...}
  const [yangila, setYangila] = useState(0);
  const sinf = sinfRaqami(user?.class);
  // REV261: kim ko'ryapti — o'qituvchi (o'z maktabi) / admin (istalgan maktab) panelni ko'radi; rejim="oquvchi" — admin «O'quvchi ko'zi bilan»
  const [kuzatuv, setKuzatuv] = useState(null);
  useEffect(() => {
    if (rejim === "oquvchi") { setKuzatuv({ rol: "oquvchi" }); return undefined; }
    let tirik = true;
    xbFetch(apiBase, "/api/xalqaro/kuzatuv", token).then((r) => { if (!tirik) return; setKuzatuv(r);
      try { if (localStorage.getItem("kabutar:xb:taklif")) { if (r.rol === "oquvchi") setTab("sinfim"); else localStorage.removeItem("kabutar:xb:taklif"); } } catch { /* */ } }).catch(() => tirik && setKuzatuv({ rol: "oquvchi" }));
    return () => { tirik = false; };
  }, [rejim]); // eslint-disable-line react-hooks/exhaustive-deps
  const panel = kuzatuv && kuzatuv.rol !== "oquvchi";

  useEffect(() => {
    let tirik = true;
    xbFetch(apiBase, "/api/xalqaro/katalog", token, { params: { sinf } }).then((d) => {
      if (!tirik) return;
      setKat(d);
      if (!toplam || !d.toplamlar.some((t) => t.kalit === toplam)) setToplam(d.toplamlar.find((t) => t.tavsiya)?.kalit || d.toplamlar[0]?.kalit || "");
    }).catch((e) => tirik && setXato(e.message));
    return () => { tirik = false; };
  }, [yangila]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { try { if (toplam) localStorage.setItem(ESLA, toplam); } catch { /* */ } }, [toplam]);
  useEffect(() => {   // REV375: salom gapi bir marta (birinchi kirishda); keyin faqat 🔊 tugmasi bilan
    if (!kat?.ustoz?.matn || ekran) return undefined;
    let aytilgan = false; try { aytilgan = Boolean(localStorage.getItem("kabutar:xb:salom")); } catch { /* */ }
    if (aytilgan) return undefined;
    const t = setTimeout(() => { ovoz.say(kat.ustoz.matn); try { localStorage.setItem("kabutar:xb:salom", "1"); } catch { /* */ } }, 600);
    return () => clearTimeout(t);
  }, [kat?.ustoz?.matn]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => ovoz.hush(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const tp = useMemo(() => kat?.toplamlar?.find((t) => t.kalit === toplam), [kat, toplam]);
  const ustoz = ustozFor(tp?.ustoz_fan || "Matematika");
  const orqaga = useCallback(() => { setEkran(null); setYangila((n) => n + 1); }, []);
  const darsYoz = (mavzu, tugadi = false) => { if (mavzu) xbFetch(apiBase, "/api/xalqaro/dars_kordi", token, { method: "POST", body: { mavzu, tugadi } }).catch(() => {}); };   // REV376
  const ochDars = (m) => { ovoz.hush(); darsYoz(m.kalit); setEkran({ tur: "dars", kod: m.dars_kodi, fan: m.fan || tp?.ustoz_fan, mavzu: m.kalit, sinf: m.sinf || tp?.sinf }); };
  const ochMashq = (m, extra = {}) => { ovoz.hush(); setEkran({ tur: "mashq", manba: { mavzu: m?.kalit || "", toplam, ...extra }, sarlavha: m?.nom ? `${T("Mashq")}: ${m.nom}` : T("Aralash mashq") }); };

  if (xato) return <div className="xb-root"><p className="xb-xato">{T(xato)}</p></div>;
  if (!kat) return <div className="xb-root"><p className="xb-muted">⏳ {T("Xalqaro baholash yuklanmoqda…")}</p></div>;

  if (ekran?.tur === "dars") return <div className="xb-root">
    <button type="button" className="xb-btn" onClick={orqaga}>← {T("Xalqaro baholashga qaytish")}</button>
    <React.Suspense fallback={<p className="xb-muted">{T("Dars yuklanmoqda…")}</p>}>
      <DarsXonasi apiBase={apiBase} token={token} topicCode={ekran.kod} fan={ekran.fan} grade={`${ekran.sinf}-sinf`} jins={jins}
        learnerGender={user?.jins || ""} cheklovsiz={cheklovsiz} onOpenTest={() => { darsYoz(ekran.mavzu, true); ochMashq({ kalit: ekran.mavzu }); }} onClose={orqaga} />
    </React.Suspense>
  </div>;
  if (ekran?.tur === "maktab") return <div className="xb-root">
    <button type="button" className="xb-btn" onClick={() => setEkran(ekran.qayt || null)}>← {T("Mavzuga qaytish")}</button>
    <React.Suspense fallback={<p className="xb-muted">{T("Dars yuklanmoqda…")}</p>}>
      <DarsXonasi apiBase={apiBase} token={token} topicCode={ekran.kod} fan={ekran.fan} grade={`${ekran.sinf}-sinf`} jins={jins} cheklovsiz={cheklovsiz} onClose={() => setEkran(ekran.qayt || null)} />
    </React.Suspense>
  </div>;
  if (ekran?.tur === "mavzu") return <div className="xb-root"><XbMavzu apiBase={apiBase} token={token} jins={jins} ustoz={ustoz} kalit={ekran.kalit}
    onYopish={orqaga} onDars={(d) => ochDars({ dars_kodi: d.dars_kodi, kalit: d.kalit })} onMashq={(d) => ochMashq({ kalit: d.kalit, nom: d.nom })}
    onMaktabDarsi={(m) => setEkran({ tur: "maktab", kod: m.topic_code, fan: m.fan, sinf: m.sinf, qayt: ekran })} /></div>;
  if (ekran?.tur === "mashq") return <div className="xb-root"><XbMashq apiBase={apiBase} token={token} jins={jins} ustoz={ustoz} manba={ekran.manba} sarlavha={ekran.sarlavha} onYopish={orqaga} /></div>;
  if (ekran?.tur === "imtihon") return <div className="xb-root"><XbImtihon apiBase={apiBase} token={token} jins={jins} ustoz={ustoz} tur={ekran.info.tur} toplam={toplam} info={ekran.info} onYopish={orqaga} /></div>;
  if (ekran?.tur === "natija") return <div className="xb-root"><XbNatija apiBase={apiBase} token={token} id={ekran.id} jins={jins} ustoz={ustoz} onYopish={orqaga} /></div>;

  const gap = GAP_TUR[kat.ustoz?.tur] || GAP_TUR.salom;
  return <div className="xb-root">
    <header className="xb-hero">
      <XbUstoz ustoz={ustoz} speaking={ovoz.speaking} />
      <div>
        <h2>🌍 {T("Xalqaro baholash")}</h2>
        <p className="xb-pufak" style={{ borderColor: gap[0] }}><span style={{ color: gap[0] }}>{gap[1]}</span> {kat.ustoz?.matn}
          <button type="button" className="xb-kolonka" aria-label={T("Ustoz gapini eshitish")} title={T("Ustoz gapini eshitish")}
            onClick={() => (ovoz.speaking ? ovoz.hush() : ovoz.say(kat.ustoz?.matn || ""))}>{ovoz.speaking ? "⏹" : "🔊"}</button></p>
        <TilBelgisi til={til} tillar={kat.tillar} />
      </div>
    </header>
    {kat.tayyor_emas && <div className="xb-panel xb-ogoh-panel"><p>🌐 {kat.tayyor_emas}</p></div>}
    {!kat.toplamlar?.length && <div className="xb-panel xb-ogoh-panel"><p>📦 {T("Xalqaro baholash materiallari hali yuklanmagan. Tez orada shu yerda TIMSS va PISA savollari va darslari paydo bo‘ladi.")}</p></div>}
    {/* REV375: joriy dastur — bitta qatorda; almashtirish faqat bosilganda ochiladi */}
    {tp && <div className="xb-joriy-fan">
      <span>{T("Joriy dastur")}:</span>
      <b>{tp.dastur === "PISA" ? `PISA · ${tp.fan_nomi}` : `TIMSS · ${tf("{n}-sinf", { n: tp.sinf })} · ${tp.fan_nomi}`}</b>
      <button type="button" className="xb-btn xb-btn-yengil" aria-expanded={fanOchiq} onClick={() => setFanOchiq((x) => !x)}>{fanOchiq ? "✕" : `🔄 ${T("Almashtirish")}`}</button>
    </div>}
    {fanOchiq && ["TIMSS", "PISA"].map((dastur) => <div key={dastur} className="xb-toplam-guruh">
      <h4>{dastur === "TIMSS" ? T("TIMSS — 4- va 8-sinf: matematika va tabiiy fanlar") : T("PISA — 15 yosh (9–10-sinf): bilimni hayotda qo‘llash")}</h4>
      <div className="xb-toplamlar" role="tablist" aria-label={dastur}>{kat.toplamlar.filter((t) => t.dastur === dastur).map((t) => <button key={t.kalit} type="button" role="tab" aria-selected={t.kalit === toplam}
        className={t.kalit === toplam ? "is-on" : ""} onClick={() => { ovoz.hush(); setToplam(t.kalit); setFanOchiq(false); }}>
        <b>{t.dastur === "PISA" ? `PISA · ${t.fan_nomi}` : `TIMSS · ${tf("{n}-sinf", { n: t.sinf })}`}</b>
        <small>{t.dastur === "PISA" ? T("15 yosh") : t.fan_nomi}{t.tavsiya ? ` · ⭐ ${T("sizga mos")}` : ""}</small></button>)}</div>
    </div>)}
    {!tab ? <div className="xb-menyu">{[
        ...(panel ? [["panel", "👩‍🏫", kuzatuv.rol === "admin" ? T("Admin nazorati") : T("Mening sinflarim va natijalar"), T("Sinf ochish, kod va havola, o‘quvchilar natijasi va xatolari")],
          ["metod", "🎓", T("O‘qitish metodlari"), T("TIMSS va PISA bo‘yicha dars berish usullari")]] : []),
        ...(kuzatuv?.rol === "oquvchi" ? [["sinfim", "🏫", T("Sinfim"), T("O‘qituvchingiz sinfiga kod yoki parol bilan qo‘shilish")]] : []),
        ["natija", "📊", T("Natijalarim"), T("Har mavzu bo‘yicha foizlar, imtihonlar va ballar")],
        ["kurs", "📚", T("Kurs: mavzular"), T("Har mavzu: dars, keyin 20 ta mashq")],
        ["imtihon", "📝", T("Imtihonlar"), T("Haftalik, oylik, choraklik va yillik sinov")],
        ["takror", "🔁", T("Takrorlash"), kat.takror ? tf("Bugun {n} ta savol kutyapti", { n: kat.takror }) : T("Xato qilingan savollar qayta so‘raladi")],
        ["xato", "❌", T("Xatolarim"), T("Qayerda adashgansiz va nega")],
        ["reyting", "🏅", T("Reyting"), T("Sinf, maktab va platformada o‘rningiz")],
        ["dunyo", "🌍", T("Dunyo natijalari"), T("Davlatlar natijasi bilan solishtiring")],
        ["qollanma", "📖", T("Qo‘llanma"), T("Bo‘lim qanday ishlaydi")],
      ].map(([k, belgi, nom, izoh]) => <button key={k} type="button" className={`xb-menyu-karta is-${k}`} onClick={() => { ovoz.hush(); setTab(k); }}>
        <span className="xb-menyu-belgi" aria-hidden="true">{belgi}</span><b>{nom}</b><small>{izoh}</small>
        {k === "takror" && kat.takror ? <i className="xb-nishon">{kat.takror}</i> : null}</button>)}</div>
      : <div className="xb-bolim-bosh"><button type="button" className="xb-btn" onClick={() => { ovoz.hush(); setTab(""); }}>← {T("Bosh sahifa")}</button></div>}
    {tab === "sinfim" && kuzatuv?.rol === "oquvchi" && <OquvchiSinf apiBase={apiBase} token={token} onToplam={(t) => { if (t && kat.toplamlar?.some((x) => x.kalit === t)) { ovoz.hush(); setToplam(t); setTab("kurs"); } }} />}
    {tab === "natija" && <XbNatijalarim apiBase={apiBase} token={token} kat={kat} toplam={toplam} til={til} onMashq={(m) => ochMashq(m)} onDars={(m) => ochDars(m)} />}
    {tab === "qollanma" && <XbQollanma rol={kuzatuv?.rol || "oquvchi"} ovoz={ovoz} sinf={sinf} kat={kat} onTab={setTab} />}
    {tab === "kurs" && tp && <Kurs tp={tp} onMavzu={(m) => setEkran({ tur: "mavzu", kalit: m.kalit })} onDars={ochDars} onMashq={ochMashq} />}
    {tab === "imtihon" && <Imtihonlar apiBase={apiBase} token={token} toplam={toplam} onBoshla={(info) => setEkran({ tur: "imtihon", info })} onNatija={(id) => setEkran({ tur: "natija", id })} />}
    {tab === "takror" && <div className="xb-panel"><p>🔁 {T("Takrorlash navbati: xato qilgan savollaringiz 1, 2, 4, 8, 16 kundan keyin boshqa variantda qayta so‘raladi. 5 marta ketma-ket to‘g‘ri yechsangiz, savol navbatdan chiqadi.")}</p>
      <p><b>{kat.takror}</b> {T("ta savol bugun takrorlanishi kerak.")}</p>
      <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => setEkran({ tur: "mashq", manba: { tur: "takror" }, sarlavha: T("Takrorlash") })}>▶ {T("Takrorlashni boshlash")}</button>
      <button type="button" className="xb-btn" onClick={() => ochMashq(null, { soni: 12 })}>🎲 {T("Aralash mashq (12 savol)")}</button>
      <button type="button" className="xb-btn" onClick={() => ochMashq(null, { soni: 10, fikrlash: "mulohaza" })}>🧠 {T("Faqat mulohaza savollari")}</button></div>}
    {tab === "reyting" && <Reyting apiBase={apiBase} token={token} toplam={toplam} />}
    {tab === "dunyo" && <Dunyo apiBase={apiBase} token={token} uz={kat.ozbekiston} />}
    {tab === "metod" && panel && <XbQollanma rol={kuzatuv?.rol} ovoz={ovoz} faqatMetod onTab={setTab} />}
    {tab === "panel" && panel && <XbOqituvchi apiBase={apiBase} token={token} jins={jins} ustoz={ustoz} kuzatuv={kuzatuv}
      onDars={(m) => ochDars({ dars_kodi: m.dars_kodi, kalit: m.kalit, fan: kat.toplamlar.find((t) => t.kalit === m.toplam)?.ustoz_fan, sinf: kat.toplamlar.find((t) => t.kalit === m.toplam)?.sinf })} />}
    {tab === "xato" && <Xatolarim apiBase={apiBase} token={token} jins={jins} ustoz={ustoz} toplam={toplam}
      onMashq={() => setEkran({ tur: "mashq", manba: { tur: "takror" }, sarlavha: T("Xatolar ustida ishlash") })} />}
    <p className="xb-muted xb-kichik">ℹ️ {T(kat.manba)}</p>
  </div>;
}

function Kurs({ tp, onMavzu, onDars, onMashq }) {
  const sohalar = [];
  for (const m of tp.mavzular) {
    let s = sohalar.find((x) => x.soha === m.soha);
    if (!s) sohalar.push(s = { soha: m.soha, nom: m.soha_nomi, mavzular: [] });
    s.mavzular.push(m);
  }
  const jami = tp.mavzular.reduce((a, m) => a + (m.holat?.jami || 0), 0);
  const oz = tp.mavzular.reduce((a, m) => a + (m.holat?.ozlashtirgan || 0), 0);
  return <div className="xb-kurs">
    <div className="xb-karta xb-kurs-bosh"><small>{T("Kurs bo‘yicha o‘zlashtirish")}</small><b>{oz}/{jami} {T("savol")}</b>
      <span className="xb-progress"><i style={{ width: `${jami ? Math.round((100 * oz) / jami) : 0}%` }} /></span>
      <small>{T("Har mavzu: avval dars (Kabu doskada tushuntiradi), keyin mashq. 80% dan keyin mavzu ★ bo‘ladi.")}</small></div>
    {sohalar.map((s) => <section key={s.soha} className="xb-soha"><h3>{s.nom}</h3>
      <ul className="xb-mavzular">{s.mavzular.map((m) => {
        const b = mavzuBelgi(m.holat);
        return <li key={m.kalit} className={`xb-mavzu-q is-${b.kalit}`}>
          <button type="button" className="xb-mavzu-nom" onClick={() => onMavzu(m)}>
            <span className="xb-belgi" title={T(b.nom)}>{b.belgi}</span>
            <span><b>{m.nom}</b><small>{m.savollar} {T("savol")} · 🌍 {T("dunyo")} {m.xalqaro_foiz ?? "—"}% · {T("siz")} {m.holat?.foiz ?? 0}%</small></span>
          </button>
          <span className="xb-mavzu-tug">
            {m.dars_kodi && <button type="button" className="xb-btn xb-btn-kichik" onClick={() => onDars(m)}>🧑‍🏫 {T("Dars")}</button>}
            <button type="button" className="xb-btn xb-btn-kichik" onClick={() => onMashq(m)}>✍️ {T("Mashq")}</button>
          </span>
        </li>;
      })}</ul></section>)}
  </div>;
}

function Imtihonlar({ apiBase, token, toplam, onBoshla, onNatija }) {
  const [d, setD] = useState(null);
  const [xato, setXato] = useState("");
  useEffect(() => { let t = true; xbFetch(apiBase, "/api/xalqaro/imtihonlar", token, { params: { toplam } }).then((r) => t && setD(r)).catch((e) => t && setXato(e.message)); return () => { t = false; }; }, [toplam]); // eslint-disable-line react-hooks/exhaustive-deps
  if (xato) return <p className="xb-xato">{T(xato)}</p>;
  if (!d) return <p className="xb-muted">⏳</p>;
  return <div className="xb-imt-grid">{d.imtihonlar.map((e) => <div key={e.tur} className={`xb-imt-karta ${e.topshirildi ? "is-tayyor" : ""}`}>
    <h4>{IMTIHON_BELGI[e.tur]} {T(e.nom)}</h4>
    <p className="xb-muted">{e.savollar} {T("savol")} · {e.daqiqa} {T("daqiqa")}{e.qismlar > 1 ? ` · ${e.qismlar} ${T("qism")}` : ""}</p>
    <p className="xb-muted">{T("Davr")}: {e.davr} · {T("tugaydi")}: {e.davr_oxiri}</p>
    {e.natija ? <p>✅ {T("Rasmiy natija")}: <b>{e.natija.ball}</b> ({toplam?.startsWith("P_") ? "PISA" : T(darajaNomi(e.natija.ball))}) · {e.natija.foiz}%</p> : <p className="xb-ogoh">⏳ {T("Bu davrda hali topshirilmagan")}</p>}
    {e.tarix?.length > 1 && <div className="xb-tarix" aria-label={T("Oldingi natijalar")}>{e.tarix.map((t) => <i key={t.id} title={`${t.davr}: ${t.ball}`} style={{ height: `${Math.max(8, ((t.ball || 300) - 300) / 4)}px` }} />)}</div>}
    <div className="xb-tug-qator">
      <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => onBoshla(e)}>{e.davom ? T("▶ Davom ettirish") : e.topshirildi ? T("Mashq sifatida qayta") : T("▶ Boshlash")}</button>
      {e.natija && <button type="button" className="xb-btn" onClick={() => onNatija(e.natija.id)}>{T("Tahlil")}</button>}
    </div>
  </div>)}</div>;
}

function Reyting({ apiBase, token, toplam }) {
  const [d, setD] = useState(null);
  useEffect(() => { let t = true; xbFetch(apiBase, "/api/xalqaro/reyting", token, { params: { toplam } }).then((r) => t && setD(r)).catch(() => t && setD({})); return () => { t = false; }; }, [toplam]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return <p className="xb-muted">⏳</p>;
  if (!d.oxirgi?.ball) return <div className="xb-panel"><p>🏅 {T("Reyting rasmiy imtihon natijasidan tuziladi. Avval haftalik nazoratni topshiring.")}</p></div>;
  const t23 = d.solishtirish?.[0];
  return <div className="xb-panel">
    <div className="xb-kartalar">
      <div className="xb-karta"><small>{T("Oxirgi rasmiy ball")}</small><b>{d.oxirgi.ball}</b><small>{T(d.oxirgi.daraja?.nom || "")}</small></div>
      {[["sinf", "Sinfda"], ["maktab", "Maktabda"], ["platforma", "Platformada"]].map(([k, n]) => d.reyting?.[k] && <div key={k} className="xb-karta">
        <small>{T(n)}</small><b>{d.reyting[k].orin ? `${d.reyting[k].orin}/${d.reyting[k].jami}` : "—"}</b><small>{d.reyting[k].ortacha ? `${T("o‘rtacha")} ${d.reyting[k].ortacha}` : ""}</small></div>)}
    </div>
    {d.sinfdoshlar?.length > 0 && <section className="xb-blok"><h4>👥 {T("Sinfdoshlar (ismlar yashirin)")}</h4>
      <ol className="xb-sinfdosh">{d.sinfdoshlar.map((r) => <li key={r.orin} className={r.men ? "is-men" : ""}>{r.orin}. {r.men ? `⭐ ${T("Siz")}` : T("Sinfdosh")} — <b>{r.ball}</b></li>)}</ol></section>}
    {t23 && <section className="xb-blok"><h4>🌍 {T("Davlatlar orasida")} ({t23.nom}): {tf("{n}-o‘rin", { n: t23.orin })}</h4><DavlatDiagramma qatorlar={solishtirishQatorlari(t23.jadval, d.oxirgi.ball, 5, xbTil())} /></section>}
    {d.tarix?.length > 1 && <section className="xb-blok"><h4>📈 {T("O‘sish tarixi")}</h4>
      <div className="xb-tarix xb-tarix-katta">{d.tarix.map((t, k) => <i key={k} title={`${t.tur} ${t.davr}: ${t.ball}`} style={{ height: `${Math.max(8, ((t.ball || 300) - 300) / 3)}px` }} />)}</div></section>}
  </div>;
}

function Dunyo({ apiBase, token, uz }) {
  const [d, setD] = useState(null);
  const [jad, setJad] = useState("TIMSS 2023 M8");
  useEffect(() => { let t = true; xbFetch(apiBase, "/api/xalqaro/natijalar", token).then((r) => t && setD(r)).catch(() => {}); return () => { t = false; }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return <p className="xb-muted">⏳</p>;
  const nomlar = { "TIMSS 2023 M4": "TIMSS 2023 · 4-sinf matematika", "TIMSS 2023 S4": "TIMSS 2023 · 4-sinf tabiiy fanlar", "TIMSS 2023 M8": "TIMSS 2023 · 8-sinf matematika",
    "TIMSS 2023 S8": "TIMSS 2023 · 8-sinf tabiiy fanlar", "TIMSS 2019 M4": "TIMSS 2019 · 4-sinf matematika", "TIMSS 2019 S4": "TIMSS 2019 · 4-sinf tabiiy fanlar",
    "TIMSS 2019 M8": "TIMSS 2019 · 8-sinf matematika", "TIMSS 2019 S8": "TIMSS 2019 · 8-sinf tabiiy fanlar", "PISA 2022 M": "PISA 2022 · matematika (15 yosh)",
    "PISA 2022 R": "PISA 2022 · o‘qish (15 yosh)", "PISA 2022 S": "PISA 2022 · tabiiy fanlar (15 yosh)", "PISA 2025 S": "PISA 2025 · tabiiy fanlar", "PIRLS 2021 R4": "PIRLS 2021 · o‘qish (4-sinf)" };
  const rows = d.jadvallar?.[jad] || [];
  const uzNomi = d.uz_nomi || "O‘zbekiston";   // REV270: davlat nomlari shu tilda
  const uzOrin = rows.findIndex((r) => r[0] === uzNomi);
  return <div className="xb-panel">
    <section className="xb-blok xb-uz"><h4>🇺🇿 {T("O‘zbekiston xalqaro tadqiqotlarda")}</h4>
      <ul><li>TIMSS 2023: {T("4-sinf matematika")} <b>{uz?.TIMSS?.M4?.["2023"]}</b>, {T("tabiiy fanlar")} <b>{uz?.TIMSS?.S4?.["2023"]}</b>; {T("8-sinf matematika")} <b>{uz?.TIMSS?.M8?.["2023"]}</b>, {T("tabiiy fanlar")} <b>{uz?.TIMSS?.S8?.["2023"]}</b></li>
        <li>PISA: {T("tabiiy fanlar")} 2022 — <b>{uz?.PISA?.S?.["2022"]}</b> → 2025 — <b>{uz?.PISA?.S?.["2025"]}</b> (+{(uz?.PISA?.S?.["2025"] || 0) - (uz?.PISA?.S?.["2022"] || 0)}); {T("matematika")} 2022 — <b>{uz?.PISA?.M?.["2022"]}</b>, {T("o‘qish")} 2022 — <b>{uz?.PISA?.R?.["2022"]}</b></li>
        <li>PIRLS 2021 ({T("o‘qish, 4-sinf")}): <b>{uz?.PIRLS?.R4?.["2021"]}</b></li></ul>
      <p className="xb-muted">{uz?.izoh || ""}</p></section>
    <label className="xb-tanla">{T("Jadval")}: <select value={jad} onChange={(e) => setJad(e.target.value)}>{Object.keys(d.jadvallar || {}).map((k) => <option key={k} value={k}>{T(nomlar[k] || k)}</option>)}</select></label>
    {uzOrin >= 0 && <p>🇺🇿 {uzNomi}: <b>{tf("{n}-o‘rin", { n: uzOrin + 1 })}</b> / {rows.length}</p>}
    <ol className="xb-dunyo">{rows.map(([n, b], k) => <li key={n} className={n === uzNomi ? "is-uz" : ""}><span>{k + 1}. {n}</span>
      <span className="xb-progress"><i style={{ width: `${Math.max(2, ((b - 250) / 400) * 100)}%` }} /></span><b>{b}</b></li>)}</ol>
    <p className="xb-muted xb-kichik">{T("Manbalar")}: {Object.values(d.manbalar || {}).join("; ")}</p>
  </div>;
}

/** REV270: qaysi tilda o'qilayotgani va natijalar shu tilda alohida ekani — o'quvchi ham, o'qituvchi ham aniq ko'radi. */
function TilBelgisi({ til, tillar }) {
  const boshqa = XB_TILLAR.filter((t) => t !== til && tillar?.[t]?.javoblar);
  return <p className="xb-til" role="note">
    <b>{XB_TIL_BAYROQ[til]} {XB_TIL_NOMI[til]}</b> · {T("bu tilda o‘qiyapsiz: savollar, darslar, natijalar va reyting shu tilda alohida hisoblanadi.")}
    {boshqa.length > 0 && <small> {T("Boshqa tillardagi natijalaringiz o‘sha tilda saqlanadi")}: {boshqa.map((t) => `${XB_TIL_BAYROQ[t]} ${XB_TIL_NOMI[t]} — ${tillar[t].javoblar} ${T("javob")}`).join(", ")}.</small>}
  </p>;
}
