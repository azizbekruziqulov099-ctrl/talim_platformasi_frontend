import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import { SINFLAR, BARCHA_SOZ } from "../maktab/index.js";
import Rasm from "../maktab/MaktabRasm.jsx";
import { CEFR } from "../maktab/darajaRules.js";
import { TIL_NOMI } from "../maktab/maktabServer.js";
import { ovozManbai } from "../kid/ovozOqi.js";
import {
  TUR_BELGI, TUR_NOMI, YOZISH_TANLOV, MUDDAT_TANLOV, MAX_SOZ, bugunJami, haftaUstunlari, ozgarganSozlar, bolaTillari, sinovTuz, natijaFoiz,
  topshiriqHolati, topshiriqXatosi,
} from "./maktabOtaRules.js";
import "./maktabOtaOna.css";

// REV174: maktab (1–11 sinf) o'quvchisining ota-onasi uchun: bugun va shu hafta nima qildi, tillar darajasi,
// «O'zim sinayman» (farzandni o'zingiz so'rab ko'rasiz) va «Mashq ber» (so'zlar, necha marta yozish, izoh — farzandga boradi).
const BASE = (apiBase) => String(apiBase || "").replace(/\/+$/, "");
async function api(apiBase, token, path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE(apiBase)}${path}`, {
    method, cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = data?.detail;
    throw new Error(typeof d === "string" ? d : d?.xabar || `Server xatosi (${res.status})`);
  }
  return data;
}
const KUN_QISQA = { Dushanba: "Du", Seshanba: "Se", Chorshanba: "Ch", Payshanba: "Pa", Juma: "Ju", Shanba: "Sh", Yakshanba: "Ya" };
const teg = (t, til) => `[${til}]${t}[/${til}]`;
const TABS = [["bugun", "📅", "Bugun va hafta"], ["sinov", "🧪", "O‘zim sinayman"], ["mashq", "📝", "Mashq ber"]];

export default function MaktabOtaOna({ apiBase, token, childId }) {
  const { locale } = useInterface();
  const iz = String(locale || "uz").startsWith("ru") ? "ru" : String(locale || "uz").startsWith("en") ? "en" : "uz";
  const [data, setData] = useState(null);
  const [xato, setXato] = useState("");
  const [tab, setTab] = useState("bugun");
  const [tayyorSozlar, setTayyorSozlar] = useState(null);   // «O'zim sinayman» → «Mashq ber» (bilmagan so'zlari)
  const ovoz = useMemo(() => ovozManbai(apiBase), [apiBase]);
  useEffect(() => () => ovoz.stop(), [ovoz]);
  const load = useCallback(() => {
    api(apiBase, token, `/api/ota/maktab?${new URLSearchParams({ bola_id: childId })}`).then((d) => { setData(d); setXato(""); })
      .catch((e) => setXato(e.message));
  }, [apiBase, token, childId]);
  useEffect(() => { setData(null); load(); }, [load]);
  if (xato) return <p className="mo-xato" role="alert">{T(xato)}</p>;
  if (!data) return <p className="mo-muted" role="status">{T("Yuklanmoqda…")}</p>;
  if (!data.maktab) return null;
  const ayt = (w, til) => ovoz.oqi(teg(w.w[til], til), { jins: "qiz", tezlik: "-10%" });
  return <section className="mo-root" aria-label={T("Maktab: farzandim")}>
    <header className="mo-head">
      <span className="mo-avatar" aria-hidden="true">🎒</span>
      <div><b>{data.bola.ism}</b><small>{data.bola.sinf}-{T("sinf")}</small></div>
    </header>
    <nav className="mo-tabs" role="tablist">
      {TABS.map(([id, e, nom]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "is-on" : ""} onClick={() => setTab(id)}>
        <span aria-hidden="true">{e}</span> {T(nom)}</button>)}
    </nav>
    {tab === "bugun" && <BugunHafta data={data} onTab={setTab} />}
    {tab === "sinov" && <OzimSinayman data={data} iz={iz} ayt={ayt} apiBase={apiBase} token={token} childId={childId}
      onMashq={(til, ids) => { setTayyorSozlar({ til, ids }); setTab("mashq"); }} onSaqlandi={load} />}
    {tab === "mashq" && <MashqBer data={data} iz={iz} ayt={ayt} apiBase={apiBase} token={token} childId={childId} tayyor={tayyorSozlar} onYangi={load} />}
  </section>;
}

function BugunHafta({ data, onTab }) {
  const j = bugunJami(data.bugun);
  const ustun = haftaUstunlari(data.hafta);
  return <div className="mo-panel">
    <div className="mo-chips">
      <span>🗂 {j.soni} {T("ta mashg‘ulot")}</span>
      <span>⏱ {j.daqiqa} {T("daq.")}</span>
      {j.yozdi > 0 && <span>✍ {j.yozdi} {T("marta yozdi")}</span>}
      {j.sozlar > 0 && <span>🔤 {j.sozlar} {T("ta so‘z")}</span>}
      {j.foiz !== null && <span className={j.foiz >= 80 ? "is-ok" : j.foiz < 50 ? "is-past" : ""}>🎯 {j.foiz}%</span>}
    </div>
    <h4>📅 {T("Bugun")}</h4>
    {data.bugun.length ? <ul className="mo-list">
      {data.bugun.map((b, k) => <li key={k}>
        <span className="mo-vaqt">{b.vaqt}</span>
        <span className="mo-tur" aria-hidden="true">{TUR_BELGI[b.turi] || "📘"}</span>
        <span className="mo-matn"><b>{T(b.fan || TUR_NOMI[b.turi] || "")}</b><small>{T(TUR_NOMI[b.turi] || "")}{b.mavzu ? ` · ${b.mavzu}` : ""}</small></span>
        <span className="mo-natija">
          {b.jami > 0 && <b className={natijaFoiz(b.togri, b.jami) >= 80 ? "is-ok" : natijaFoiz(b.togri, b.jami) < 50 ? "is-past" : ""}>{b.togri}/{b.jami}</b>}
          {b.yozdi > 0 && <small>✍ {b.yozdi}</small>}
          {b.daqiqa > 0 && <small>⏱ {b.daqiqa}′</small>}
        </span>
      </li>)}
    </ul> : <div className="mo-bosh">
      <p>{T("Bugun hali dars yoki mashq qilinmadi.")}</p>
      <div className="mo-row">
        <button type="button" className="mo-btn" onClick={() => onTab("sinov")}>🧪 {T("O‘zim sinayman")}</button>
        <button type="button" className="mo-btn is-main" onClick={() => onTab("mashq")}>📝 {T("Mashq ber")}</button>
      </div>
    </div>}
    <h4>📊 {T("Shu hafta")}</h4>
    <div className="mo-hafta" role="list">
      {ustun.map((h, k) => <div key={h.sana} role="listitem" className={`mo-kun ${k === ustun.length - 1 ? "is-bugun" : ""}`}
        aria-label={`${T(h.kun)}: ${h.faoliyat} ${T("ta mashg‘ulot")}, ${h.daqiqa} ${T("daq.")}`}>
        <span className="mo-ustun"><i style={{ height: `${h.balandlik}%` }} /></span>
        <b>{h.faoliyat || ""}</b>
        <small>{T(KUN_QISQA[h.kun] || h.kun)}</small>
      </div>)}
    </div>
    {data.tillar.length > 0 && <>
      <h4>🌍 {T("Tillar darajasi")}</h4>
      <div className="mo-tillar">{data.tillar.map((t) => {
        const c = CEFR.find((x) => x.kod === t.daraja);
        return <div key={t.til} className="mo-til">
          <span className="mo-til-belgi" aria-hidden="true">{c?.emoji || "🌰"}</span>
          <span className="mo-matn"><b>{T(t.nom)}: {t.daraja || T("Boshlang‘ich")}</b>
            {t.keyingi && <small>{T("{daraja} darajasigacha: {foiz}%").replace("{daraja}", t.keyingi).replace("{foiz}", String(t.foiz))}</small>}
            <span className="mo-chiziq"><i style={{ width: `${Math.max(3, t.foiz || 0)}%` }} /></span></span>
          <span className="mo-natija"><small>💎 {t.bal}</small>{t.otildi > 0 && <small>🏆 {t.otildi} {T("bo‘lim")}</small>}</span>
        </div>;
      })}</div>
    </>}
    {data.sinovlar.length > 0 && <>
      <h4>🧪 {T("Siz o‘tkazgan sinovlar")}</h4>
      <ul className="mo-list is-ixcham">{data.sinovlar.map((s, k) => <li key={k}>
        <span className="mo-vaqt">{s.sana}</span><span className="mo-matn"><b>{T(TIL_NOMI[s.til] || s.til)}</b></span>
        <span className="mo-natija"><b className={natijaFoiz(s.togri, s.jami) >= 80 ? "is-ok" : ""}>{s.togri}/{s.jami}</b></span>
      </li>)}</ul>
    </>}
  </div>;
}

function TilTanlov({ tillar, til, setTil }) {
  if (tillar.length < 2) return null;
  return <div className="mo-seg" role="radiogroup" aria-label={T("Til")}>
    {tillar.map((t) => <button key={t} type="button" role="radio" aria-checked={til === t} className={til === t ? "is-on" : ""} onClick={() => setTil(t)}>{T(TIL_NOMI[t] || t)}</button>)}
  </div>;
}

/** Bo'lim tanlovi — bolaning sinfi va undan pastki sinflar dasturi. */
function BolimTanlov({ sinf, iz, bolimId, setBolimId }) {
  return <select className="mo-select" value={bolimId} onChange={(e) => setBolimId(e.target.value)} aria-label={T("Bo‘lim")}>
    <option value="">— {T("Sinf dasturidan bo‘lim tanlang")} —</option>
    {SINFLAR.filter((s) => s.sinf <= Math.max(1, sinf)).reverse().map((s) => <optgroup key={s.sinf} label={`${s.sinf}-${T("sinf")}`}>
      {s.bolimlar.map((b) => <option key={b.id} value={b.id}>{b.emoji} {b.nom[iz]}</option>)}
    </optgroup>)}
  </select>;
}
const bolimSozlari = (bolimId) => SINFLAR.flatMap((s) => s.bolimlar).find((b) => b.id === bolimId)?.sozlar || [];

function OzimSinayman({ data, iz, ayt, apiBase, token, childId, onMashq, onSaqlandi }) {
  const tillar = useMemo(() => { const t = bolaTillari(data); return t.length ? t : ["en"]; }, [data]);
  const [til, setTil] = useState(tillar[0]);
  const [manba, setManba] = useState(() => (data.sozlar.some((s) => s.kim === "bugun") ? "bugun" : data.sozlar.length ? "hafta" : "bolim"));
  const [bolimId, setBolimId] = useState("");
  const [rejim, setRejim] = useState("sorab");   // sorab — ota-ona o'zi so'raydi; eshit — bola eshitib rasmni topadi
  const [sinov, setSinov] = useState(null);       // {savollar, i, ochiq, javoblar: [{id, bildi}], tanlov}
  const [saqlandi, setSaqlandi] = useState(null);
  const manoOf = (w) => w.w[iz] || w.w.uz;
  const sozlar = manba === "bolim" ? bolimSozlari(bolimId) : ozgarganSozlar(data.sozlar, BARCHA_SOZ, { til, davr: manba === "bugun" ? "bugun" : "hammasi" });
  const boshla = () => { setSaqlandi(null); setSinov({ savollar: sinovTuz(sozlar, { manoOf }), i: 0, ochiq: false, javoblar: [], tanlov: null }); };
  const sinovRef = useRef(sinov);
  sinovRef.current = sinov;
  // javob faqat bir marta qabul qilinadi; natija serverga — holat yangilovchisidan tashqarida
  const belgila = (bildi) => {
    const s = sinovRef.current;
    if (!s || s.tugadi) return;
    const q = s.savollar[s.i];
    if (s.javoblar.some((x) => x.id === q.w.id)) return;
    const javoblar = [...s.javoblar, { id: q.w.id, bildi }];
    let yangi;
    if (s.i + 1 >= s.savollar.length) {
      yangi = { ...s, javoblar, tugadi: true };
      api(apiBase, token, "/api/ota/maktab/sinov", { method: "POST", body: { bola_id: childId, til, natijalar: javoblar } })
        .then((r) => { setSaqlandi(r); onSaqlandi?.(); }).catch(() => setSaqlandi({ xato: true }));
    } else yangi = { ...s, i: s.i + 1, ochiq: false, javoblar, tanlov: null };
    sinovRef.current = yangi;
    setSinov(yangi);
  };
  useEffect(() => {   // «Eshitib topsin» — har savolda so'z avtomatik eshittiriladi
    if (sinov && !sinov.tugadi && rejim === "eshit") ayt(sinov.savollar[sinov.i].w, til);
  }, [sinov?.i, sinov?.tugadi]); // eslint-disable-line react-hooks/exhaustive-deps

  if (sinov?.tugadi) {
    const togri = sinov.javoblar.filter((x) => x.bildi).length;
    const bilmadi = sinov.javoblar.filter((x) => !x.bildi).map((x) => BARCHA_SOZ[x.id]).filter(Boolean);
    return <div className="mo-panel mo-center">
      <span className="mo-katta" aria-hidden="true">{natijaFoiz(togri, sinov.javoblar.length) >= 80 ? "🏆" : "💪"}</span>
      <b className="mo-ball">{togri} / {sinov.javoblar.length}</b>
      <small>{saqlandi?.xato ? `⚠️ ${T("Natija saqlanmadi")}` : saqlandi ? `✅ ${T("Natija saqlandi")}` : "…"}</small>
      {bilmadi.length > 0 && <>
        <p>{T("Bilmagan so‘zlari")}:</p>
        <div className="mo-sozlar">{bilmadi.map((w) => <button key={w.id} type="button" className="mo-soz" onClick={() => ayt(w, til)}>🔊 <b dir="auto">{w.w[til]}</b> <small>{manoOf(w)}</small></button>)}</div>
        <button type="button" className="mo-btn is-main" onClick={() => onMashq(til, bilmadi.map((w) => w.id))}>📝 {T("Bilmaganlarini mashq qilib berish")}</button>
      </>}
      <button type="button" className="mo-btn" onClick={() => setSinov(null)}>🔁 {T("Yana sinash")}</button>
    </div>;
  }

  if (sinov) {
    const q = sinov.savollar[sinov.i];
    return <div className="mo-panel mo-center">
      <span className="mo-qadam">{sinov.i + 1} / {sinov.savollar.length}</span>
      {rejim === "sorab" ? <>
        <p className="mo-yoriq">{T("Farzandingizdan so‘rang: «{soz}» — {til}da qanday bo‘ladi?").replace("{soz}", manoOf(q.w)).replace("{til}", T(TIL_NOMI[til]))}</p>
        <Rasm w={q.w} className="mk-pic" />
        {sinov.ochiq ? <div className="mo-javob"><b dir="auto" lang={til}>{q.w.w[til]}</b>
          <button type="button" className="mo-btn" onClick={() => ayt(q.w, til)}>🔊 {T("Talaffuzi")}</button></div>
          : <button type="button" className="mo-btn" onClick={() => { setSinov((s) => ({ ...s, ochiq: true })); ayt(q.w, til); }}>👀 {T("Javobni ko‘rsatish")}</button>}
        <div className="mo-row">
          <button type="button" className="mo-btn is-ok" onClick={() => belgila(true)}>✅ {T("Bildi")}</button>
          <button type="button" className="mo-btn is-past" onClick={() => belgila(false)}>❌ {T("Bilmadi")}</button>
        </div>
      </> : <>
        <p className="mo-yoriq">{T("Telefonni farzandingizga bering: so‘zni eshitib, mos rasmni topsin.")}</p>
        <button type="button" className="mo-btn" onClick={() => ayt(q.w, til)}>🔊 {T("Yana eshitish")}</button>
        <div className="mo-rasmlar">{q.variantlar.map((v) => <button key={v.id} type="button" disabled={Boolean(sinov.tanlov)}
          className={`mo-rasm ${sinov.tanlov && v.id === q.w.id ? "is-ok" : ""} ${sinov.tanlov === v.id && v.id !== q.w.id ? "is-past" : ""}`}
          onClick={() => { setSinov((s) => ({ ...s, tanlov: v.id })); setTimeout(() => belgila(v.id === q.w.id), 900); }}>
          <Rasm w={v} className="mk-pic" /><small>{manoOf(v)}</small></button>)}</div>
      </>}
    </div>;
  }

  return <div className="mo-panel">
    <p className="mo-muted">{T("Farzandingiz o‘rgangan so‘zlardan 8 ta savol. Siz so‘raysiz yoki u telefonda eshitib topadi — natija saqlanadi.")}</p>
    <TilTanlov tillar={tillar} til={til} setTil={setTil} />
    <div className="mo-seg" role="radiogroup" aria-label={T("So‘zlar")}>
      {[["bugun", "Bugun o‘rgangani"], ["hafta", "Shu hafta"], ["bolim", "Sinf dasturidan"]].map(([k, n]) =>
        <button key={k} type="button" role="radio" aria-checked={manba === k} className={manba === k ? "is-on" : ""} onClick={() => setManba(k)}>{T(n)}</button>)}
    </div>
    {manba === "bolim" && <BolimTanlov sinf={data.bola.sinf} iz={iz} bolimId={bolimId} setBolimId={setBolimId} />}
    <div className="mo-seg" role="radiogroup" aria-label={T("Usul")}>
      <button type="button" role="radio" aria-checked={rejim === "sorab"} className={rejim === "sorab" ? "is-on" : ""} onClick={() => setRejim("sorab")}>🗣 {T("O‘zim so‘rayman")}</button>
      <button type="button" role="radio" aria-checked={rejim === "eshit"} className={rejim === "eshit" ? "is-on" : ""} onClick={() => setRejim("eshit")}>🎧 {T("Eshitib topsin")}</button>
    </div>
    <p className="mo-muted">{sozlar.length} {T("ta so‘z")}</p>
    <button type="button" className="mo-btn is-main is-katta" disabled={sozlar.length < (rejim === "eshit" ? 3 : 1)} onClick={boshla}>▶ {T("Sinovni boshlash")}</button>
    {sozlar.length === 0 && manba !== "bolim" && <p className="mo-muted">{T("Bu davrda so‘z o‘rganilmagan — «Sinf dasturidan» bo‘lim tanlang.")}</p>}
  </div>;
}

function MashqBer({ data, iz, ayt, apiBase, token, childId, tayyor, onYangi }) {
  const tillar = useMemo(() => { const t = bolaTillari(data); return t.length ? t : ["en"]; }, [data]);
  const [til, setTil] = useState(tayyor?.til || tillar[0]);
  const [manba, setManba] = useState(tayyor ? "tayyor" : data.sozlar.length ? "hafta" : "bolim");
  const [bolimId, setBolimId] = useState("");
  const [tanlangan, setTanlangan] = useState(() => new Set(tayyor?.ids || []));
  const [yozish, setYozish] = useState(20);
  const [muddat, setMuddat] = useState(3);
  const [izoh, setIzoh] = useState("");
  const [holat, setHolat] = useState("");   // "" | "yuborilmoqda" | "ok" | xato matni
  const manoOf = (w) => w.w[iz] || w.w.uz;
  const sozlar = manba === "tayyor" ? (tayyor?.ids || []).map((id) => BARCHA_SOZ[id]).filter(Boolean)
    : manba === "bolim" ? bolimSozlari(bolimId) : ozgarganSozlar(data.sozlar, BARCHA_SOZ, { til, davr: "hammasi" });
  const almashtir = (id) => setTanlangan((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else if (n.size < MAX_SOZ) n.add(id); return n; });
  const xato = topshiriqXatosi([...tanlangan], til);
  const yubor = async () => {
    if (xato) return;
    setHolat("yuborilmoqda");
    try {
      await api(apiBase, token, "/api/ota/maktab/topshiriq", { method: "POST", body: { bola_id: childId, til, sozlar: [...tanlangan], yozish, izoh, muddat_kun: muddat } });
      setHolat("ok"); setTanlangan(new Set()); setIzoh(""); onYangi?.();
    } catch (e) { setHolat(e.message); }
  };
  const bekor = async (id) => {
    try { await api(apiBase, token, "/api/ota/maktab/topshiriq/bekor", { method: "POST", body: { bola_id: childId, id } }); onYangi?.(); } catch (e) { setHolat(e.message); }
  };
  return <div className="mo-panel">
    <p className="mo-muted">{T("So‘zlarni tanlang — farzandingizga topshiriq bo‘lib boradi: ustoz bilan o‘rganadi, daftarga yozadi, eshitib yozadi va tarjima qiladi. Bajargach sizga xabar keladi.")}</p>
    <TilTanlov tillar={tillar} til={til} setTil={(t) => { setTil(t); setTanlangan(new Set()); }} />
    <div className="mo-seg" role="radiogroup" aria-label={T("So‘zlar")}>
      {[...(tayyor ? [["tayyor", "Bilmagan so‘zlari"]] : []), ["hafta", "O‘rgangan so‘zlari"], ["bolim", "Sinf dasturidan"]].map(([k, n]) =>
        <button key={k} type="button" role="radio" aria-checked={manba === k} className={manba === k ? "is-on" : ""} onClick={() => setManba(k)}>{T(n)}</button>)}
    </div>
    {manba === "bolim" && <BolimTanlov sinf={data.bola.sinf} iz={iz} bolimId={bolimId} setBolimId={setBolimId} />}
    {sozlar.length > 0 ? <>
      <div className="mo-row is-chap">
        <button type="button" className="mo-link" onClick={() => setTanlangan(new Set(sozlar.slice(0, MAX_SOZ).map((w) => w.id)))}>☑ {T("Hammasini tanlash")}</button>
        <button type="button" className="mo-link" onClick={() => setTanlangan(new Set())}>✖ {T("Tozalash")}</button>
        <small className="mo-muted">{tanlangan.size} / {MAX_SOZ}</small>
      </div>
      <div className="mo-sozlar">{sozlar.map((w) => <label key={w.id} className={`mo-soz is-tanlov ${tanlangan.has(w.id) ? "is-on" : ""}`}>
        <input type="checkbox" checked={tanlangan.has(w.id)} onChange={() => almashtir(w.id)} />
        <b dir="auto" lang={til}>{w.w[til]}</b><small>{manoOf(w)}</small>
        <button type="button" className="mo-say" onClick={(e) => { e.preventDefault(); ayt(w, til); }} aria-label={T("Tinglash")}>🔊</button>
      </label>)}</div>
    </> : <p className="mo-muted">{manba === "bolim" ? T("Bo‘limni tanlang.") : T("Hali o‘rganilgan so‘z yo‘q — «Sinf dasturidan» bo‘lim tanlang.")}</p>}
    <div className="mo-maydon"><span>✍ {T("Har bir so‘zni daftarga yozish")}</span>
      <div className="mo-seg is-kichik">{YOZISH_TANLOV.map((n) => <button key={n} type="button" className={yozish === n ? "is-on" : ""} onClick={() => setYozish(n)}>{n ? `${n}×` : T("Yozmasin")}</button>)}</div></div>
    <div className="mo-maydon"><span>📅 {T("Muddat")}</span>
      <div className="mo-seg is-kichik">{MUDDAT_TANLOV.map((n) => <button key={n} type="button" className={muddat === n ? "is-on" : ""} onClick={() => setMuddat(n)}>{n} {T("kun")}</button>)}</div></div>
    <label className="mo-maydon"><span>💬 {T("Farzandingizga izoh (ixtiyoriy)")}</span>
      <textarea className="mo-izoh" rows={2} maxLength={300} value={izoh} onChange={(e) => setIzoh(e.target.value)} placeholder={T("Masalan: Ertaga nazorat ishi bor, yaxshilab yod ol!")} /></label>
    <button type="button" className="mo-btn is-main is-katta" disabled={Boolean(xato) || holat === "yuborilmoqda"} onClick={yubor}>📬 {T("Topshiriq berish")} ({tanlangan.size})</button>
    {holat === "ok" && <p className="mo-ok" role="status">✅ {T("Topshiriq yuborildi — farzandingiz «Til o‘yinlari»da ko‘radi.")}</p>}
    {holat && holat !== "ok" && holat !== "yuborilmoqda" && <p className="mo-xato" role="alert">{T(holat)}</p>}
    {data.topshiriqlar.length > 0 && <>
      <h4>📬 {T("Berilgan topshiriqlar")}</h4>
      <ul className="mo-list">{data.topshiriqlar.map((t) => { const h = topshiriqHolati(t, data.sana);
        return <li key={t.id}>
          <span className="mo-tur" aria-hidden="true">{h.belgi}</span>
          <span className="mo-matn"><b>{T(TIL_NOMI[t.til] || t.til)} · {t.sozlar.length} {T("ta so‘z")}{t.yozish ? ` · ✍ ${t.yozish}×` : ""}</b>
            <small>{T(h.matn)}{t.natija?.jami ? ` · ${t.natija.togri}/${t.natija.jami}` : ""}{t.natija?.yozdi ? ` · ✍ ${t.natija.yozdi}` : ""}{t.izoh ? ` · «${t.izoh}»` : ""}</small></span>
          {t.holat === "yangi" && <button type="button" className="mo-link" onClick={() => bekor(t.id)}>{T("Bekor qilish")}</button>}
        </li>; })}</ul>
    </>}
  </div>;
}
