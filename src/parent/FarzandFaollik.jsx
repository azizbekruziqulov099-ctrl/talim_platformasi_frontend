import React, { useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { bahoInfo, kunXulosa, levelDots, maslahat, minutesText, presence, ratingText, usageRows, weekStack } from "./farzandVaqtRules.js";
import { BAHO_MATN, KURS, QISMLAR, bahoRangi, fanKaliti, haftaKuni, ozgarish } from "./bogchaReja.js";
import { YutuqQator } from "./OtaKundalik.jsx";
import BolalarKundaligi from "../kid/BolalarKundaligi.jsx";
import { bugungiXulosa, ertangiFanlar } from "../kid/kundalikRules.js";
import "./farzandFaollik.css";

// REV145: matnning o'zgarmas qismi tarjima qilinadi, mavzu nomi va raqamlar — alohida (aks holda tarjima topilmasdi)
const LIVE = {
  darsda: { cls: "is-live", emoji: "🟢", text: "Hozir darsda", extra: (s) => (s.jami_qadam ? `${Math.min(s.qadam, s.jami_qadam)}/${s.jami_qadam}` : "") },
  toxtagan: { cls: "is-pause", emoji: "🟠", text: "Dars to‘xtab turibdi", extra: (s) => `${s.daqiqa} ${__kbUi("daqiqa")}` },
  chiqib_ketgan: { cls: "is-away", emoji: "🔴", text: "Ilovadan chiqib ketgan", extra: (s) => `${s.daqiqa} ${__kbUi("daqiqa")}` },
  tugatgan: { cls: "is-done", emoji: "✅", text: "Oxirgi dars tugagan", extra: () => "" },
  yoq: { cls: "is-none", emoji: "⚪", text: "Bugun hali dars boshlanmagan", extra: () => "" },
};

const stars = (n) => (n ? "⭐".repeat(n) + "☆".repeat(Math.max(0, 3 - n)) : "");
const daq = (n) => __kbUi(minutesText(n));

/** Ichma-ich ochiladigan bo'lim: sarlavhada qisqa xulosa, ichida — batafsil. */
function Bolim({ id, open, onToggle, emoji, title, summary, children }) {
  return <section className={`ff-sec ${open ? "is-open" : ""}`} id={`ff-${id}`}>
    <button type="button" className="ff-sec-head" aria-expanded={open} onClick={() => onToggle(id)}>
      <span aria-hidden="true">{emoji}</span>
      <b>{__kbUi(title)}</b>
      {summary ? <small>{summary}</small> : null}
      <i aria-hidden="true">{open ? "▾" : "▸"}</i>
    </button>
    {open && <div className="ff-sec-body">{children}</div>}
  </section>;
}

/** Bitta dars: qisqa qator → bosilsa ochiladi: natija, ovoz, so'zlar, vaqt, diqqat va uyda nima qilish. */
function DarsQator({ r, open, onToggle }) {
  const b = bahoInfo(r);
  const tip = maslahat(r);
  const foiz = r.jami ? Math.round((r.togri / r.jami) * 100) : null;
  return <li className={`ff-lesson ${open ? "is-open" : ""} ${r.tugadi ? "is-done" : "is-open-lesson"}`}>
    <button type="button" className="ff-lesson-head" aria-expanded={open} onClick={onToggle}>
      <span className="ff-time">{r.boshlandi}</span>
      <span className="ff-main"><b>{r.mavzu || __kbUi("Dars")}</b><small>{r.fan}</small></span>
      {r.ai_baho ? <span className={`ff-ai ${bahoRangi(r.ai_baho.baho)}`} title={__kbUi("AI bahosi")}>{r.ai_baho.baho}</span>
        : <span className={`ff-badge ${b.cls}`}>{__kbUi(b.matn)}</span>}
      <i aria-hidden="true">{open ? "▾" : "▸"}</i>
    </button>
    {open && <div className="ff-lesson-body">
      {r.tugadi && r.jami ? <div className="ff-row">
        <span>✅ {__kbUi("Savollar")}</span>
        <span className="ff-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={foiz}><i className={b.cls} style={{ width: `${foiz}%` }} /></span>
        <b>{r.togri}/{r.jami} · {foiz}% {stars(r.yulduz)}</b>
      </div> : null}
      {r.ovoz_jami ? <div className="ff-row"><span>🎤 {__kbUi("Ovozli takror")}</span><span /><b>{r.ovoz_togri || 0}/{r.ovoz_jami}</b></div> : null}
      {r.sozlar?.length > 0 && <div className="ff-words-box">
        <span>📝 {__kbUi("O‘rgangan so‘zlari")}</span>
        <ul className="ff-words">{r.sozlar.map((w) => <li key={w.soz} className={w.aytdi === true ? "is-ok" : w.aytdi === false ? "is-try" : ""}
          title={__kbUi(w.aytdi === true ? "Mikrofonga to‘g‘ri aytdi" : w.aytdi === false ? "Aytishga urindi, hali chiqmadi" : "Aytib tekshirilmagan")}>
          {w.emoji ? <span aria-hidden="true">{w.emoji}</span> : null}{w.soz}{w.aytdi === true ? " ✓" : w.aytdi === false ? " …" : ""}</li>)}</ul>
        <small className="ff-muted">✓ {__kbUi("aytdi")} · … {__kbUi("hali chiqmadi")}</small>
      </div>}
      <div className="ff-row"><span>⏱ {__kbUi("Davomiyligi")}</span><span /><b>{r.daqiqa ? daq(r.daqiqa) : "—"} · {r.boshlandi}{r.tugadi ? `–${r.tugadi}` : ""}</b></div>
      <div className="ff-row"><span>🎯 {__kbUi("Diqqat")}</span><span />
        <b>{r.chalgish ? `${r.chalgish} ${__kbUi("marta ilovadan chiqdi")}` : __kbUi("Chalg‘imadi")}</b></div>
      {!r.tugadi && r.jami_qadam ? <div className="ff-row"><span>⏸ {__kbUi("To‘xtagan joyi")}</span><span /><b>{Math.min(r.qadam, r.jami_qadam)}/{r.jami_qadam} {__kbUi("qadam")}</b></div> : null}
      {r.ai_baho && <QismlarQator qism={r.ai_baho.qism} ball={r.ai_baho.ball} baho={r.ai_baho.baho} />}
      {tip && <p className="ff-tip">💡 {__kbUi(tip.matn)}{tip.sozlar.length ? <b> {tip.sozlar.join(", ")}</b> : null}</p>}
    </div>}
  </li>;
}

/** REV162: AI bahosining 4 qismi — aniqlik, gapirish, tezlik, puxtalik (ota-onaga tushunarli chiziqlar). */
function QismlarQator({ qism, ball, baho }) {
  return <div className="ff-qism">
    <p className="ff-qism-head"><b>🤖 {__kbUi("AI bahosi")}: {baho} — {__kbUi(BAHO_MATN[baho])}</b><small>{ball}/100</small></p>
    {QISMLAR.map(([k, emoji, nom, izoh]) => qism?.[k] == null ? null : <div key={k} className="ff-qism-row" title={__kbUi(izoh)}>
      <span>{emoji} {__kbUi(nom)}</span>
      <span className="ff-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={qism[k]}><i className={bahoRangi(qism[k] >= 85 ? 5 : qism[k] >= 70 ? 4 : qism[k] >= 50 ? 3 : 2)} style={{ width: `${qism[k]}%` }} /></span>
      <b>{qism[k]}%</b>
    </div>)}
  </div>;
}

/** REV162: bugungi umumiy AI bahosi — katta raqam, so'z bilan va 4 qism. */
function BugungiBaho({ baho, yulduz }) {
  if (!baho) return <div className="ff-grade is-empty"><span className="ff-grade-num">—</span>
    <div><b>{__kbUi("Bugungi AI bahosi")}</b><small>{__kbUi("Farzandingiz bugun birinchi darsini tugatgach, baho shu yerda chiqadi.")}</small></div></div>;
  return <div className={`ff-grade ${bahoRangi(baho.baho)}`}>
    <span className="ff-grade-num" aria-label={`${baho.baho}`}>{baho.baho}</span>
    <div className="ff-grade-body">
      <b>{__kbUi("Bugungi AI bahosi")}: {__kbUi(baho.matn || BAHO_MATN[baho.baho])}</b>
      <small>{baho.ball}/100 · {baho.darslar} {__kbUi("dars")}{yulduz ? ` · ⭐ ${yulduz}` : ""}</small>
      <div className="ff-grade-parts">{QISMLAR.map(([k, emoji, nom, izoh]) => baho.qism?.[k] == null ? null :
        <span key={k} title={__kbUi(izoh)}>{emoji} {__kbUi(nom)} <b>{baho.qism[k]}%</b></span>)}</div>
    </div>
  </div>;
}

/** REV166: eng tepada — oddiy til bilan: bugun nimani o'rgandi, nimani takrorlash kerak, nima qoldi, ertaga nima. */
function BugungiXulosa({ bugun, rj, fans, sana, onSinov }) {
  const x = bugungiXulosa(bugun);
  const doneKeys = new Set([...fans.filter(([, f]) => f.tugadi > 0).map(([fan]) => fanKaliti(fan)),
    ...bugun.filter((r) => r.tugadi).map((r) => fanKaliti(r.fan))]);
  const qoldi = rj && !rj.takror_kuni ? (rj.bugun_rejada || []).filter((k) => !doneKeys.has(k)) : [];
  const ertaga = rj ? ertangiFanlar(rj.hafta, haftaKuni(sana)) : null;
  const yaxshi = x.organdi.length > 0 && !x.takrorSoz.length && !x.takrorDars.length;
  return <section className="ff-today" aria-label={__kbUi("Bugungi xulosa")}>
    <div className="ff-today-row is-learned">
      <span className="ff-today-ic" aria-hidden="true">✅</span>
      <div><b>{__kbUi("Bugun o‘rgandi")}</b>
        {x.organdi.length ? <p className="ff-today-list">{x.organdi.map((m) => <span key={m}>«{m}»</span>)}</p>
          : <p className="ff-muted">{__kbUi(rj?.takror_kuni ? "Bugun yakshanba — yangi dars yo‘q, takrorlash kuni." : "Bugun hali dars tugatilmagan.")}</p>}
        {x.sozlar.length > 0 && <p className="ff-today-words">{x.sozlar.slice(0, 14).map((w) => <span key={w.soz} className={w.aytdi === true ? "is-ok" : w.aytdi === false ? "is-try" : ""}>
          {w.emoji ? <i aria-hidden="true">{w.emoji}</i> : null}{w.soz}</span>)}</p>}
      </div>
    </div>
    {(x.takrorSoz.length > 0 || x.takrorDars.length > 0 || yaxshi) && <div className={`ff-today-row ${yaxshi ? "is-good" : "is-repeat"}`}>
      <span className="ff-today-ic" aria-hidden="true">{yaxshi ? "👍" : "🔁"}</span>
      <div><b>{__kbUi(yaxshi ? "Takrorlash shart emas — hammasi yaxshi!" : "Takrorlash kerak")}</b>
        {x.takrorSoz.length > 0 && <p className="ff-today-words">{x.takrorSoz.map((w) => <span key={w.soz} className="is-try">{w.emoji ? <i aria-hidden="true">{w.emoji}</i> : null}{w.soz}</span>)}</p>}
        {x.takrorDars.length > 0 && <p className="ff-today-list">{x.takrorDars.map((m) => <span key={m}>«{m}» — {__kbUi("darsni yana bir bor o‘tsin")}</span>)}</p>}
        {!yaxshi && <p className="ff-muted">{__kbUi("Kechqurun 2 daqiqa: rasmni ko‘rsatib «Bu nima?» deb so‘rang.")}</p>}
      </div>
    </div>}
    {(qoldi.length > 0 || x.chala.length > 0) && <div className="ff-today-row is-left">
      <span className="ff-today-ic" aria-hidden="true">⏳</span>
      <div><b>{__kbUi("Bugun hali qilinmagan")}</b>
        <p className="ff-today-list">{qoldi.map((k) => <span key={k}>{KURS[k]?.emoji} {__kbUi(KURS[k]?.nom || k)}</span>)}
          {x.chala.map((m) => <span key={m}>⏸ «{m}»</span>)}</p>
      </div>
    </div>}
    {ertaga !== null && <div className="ff-today-row is-next">
      <span className="ff-today-ic" aria-hidden="true">📅</span>
      <div><b>{__kbUi("Ertaga")}</b>
        <p className="ff-today-list">{ertaga.length ? ertaga.map((k) => <span key={k}>{KURS[k]?.emoji} {__kbUi(KURS[k]?.nom || k)}</span>)
          : <span>🔁 {__kbUi("Takrorlash kuni")}</span>}</p>
      </div>
    </div>}
    {onSinov && x.sozlar.length > 0 && <button type="button" className="ff-today-btn" onClick={onSinov}>🧪 {__kbUi("O‘zingiz sinab ko‘ring — 2 daqiqa")}</button>}
  </section>;
}

/** REV162: shu hafta va o'tgan hafta — darslar, yulduzlar, so'zlar, o'rtacha baho; fanlar bo'yicha. */
function HaftaTaqqos({ h }) {
  if (!h?.shu) return null;
  const a = h.shu, b = h.otgan || {};
  const rows = [
    ["📚", "Tugatilgan dars", a.tugadi, b.tugadi], ["⭐", "Yulduz", a.yulduz, b.yulduz],
    ["📝", "O‘rgangan so‘z", a.sozlar, b.sozlar], ["🎤", "Aytgan so‘z", a.aytdi, b.aytdi],
    ["🤖", "O‘rtacha baho", a.baho?.ball ?? 0, b.baho?.ball ?? 0],
  ];
  return <div className="ff-weeks">
    <div className="ff-weeks-grid" role="table" aria-label={__kbUi("Shu hafta va o‘tgan hafta")}>
      <span role="columnheader" /><b role="columnheader">{__kbUi("Shu hafta")}</b><b role="columnheader">{__kbUi("O‘tgan hafta")}</b>
      {rows.map(([e, nom, x, y]) => { const o = ozgarish(x, y); return <React.Fragment key={nom}>
        <span role="rowheader">{e} {__kbUi(nom)}</span>
        <b className={o.farq > 0 ? "is-up" : o.farq < 0 ? "is-down" : ""}>{x || 0}{o.belgi ? <i aria-hidden="true"> {o.belgi}</i> : null}</b>
        <span>{y || 0}</span></React.Fragment>; })}
    </div>
    {a.fanlar?.length > 0 && <div className="ff-plan">{a.fanlar.map((f) => <span key={f.fan}>
      {KURS[fanKaliti(f.fan)]?.emoji || "📚"} <b>{f.fan || __kbUi("Dars")}</b> {f.tugadi}/{f.darslar}</span>)}</div>}
  </div>;
}

function DarslarRoyxat({ list, openKey, setOpenKey, bosh }) {
  if (!list.length) return <p className="ff-muted">{__kbUi(bosh)}</p>;
  return <ul className="ff-lessons">
    {list.map((r, i) => { const key = `${r.boshlandi}|${r.mavzu}|${i}`;
      return <DarsQator key={key} r={r} open={openKey === key} onToggle={() => setOpenKey(openKey === key ? "" : key)} />; })}
  </ul>;
}

/** REV103: bugungi vaqt — dars / erkin o'yin limitga nisbatan, nima qildi, hozir platformadami. */
function BugungiVaqt({ vaqt }) {
  const rows = usageRows(vaqt);
  if (!rows.length) return <p className="ff-muted">{__kbUi("Bugun hali platformaga kirmagan")}</p>;
  const now = presence(vaqt.hozir, vaqt.tugadi?.jami);
  return <div className="ff-time-box">
    <p className={`ff-live ${now.cls}`} role="status"><span aria-hidden="true">{now.emoji}</span>{__kbUi(now.text)}</p>
    <div className="ff-bars">
      {rows.map((r) => <div key={r.key} className={`ff-bar is-${r.key} ${r.full ? "is-full" : ""}`}>
        <span className="ff-bar-name"><span aria-hidden="true">{r.emoji}</span> {__kbUi(r.label)}</span>
        <span className="ff-bar-track" role="progressbar" aria-valuemin={0} aria-valuemax={r.limit} aria-valuenow={Math.min(r.daqiqa, r.limit)}><i style={{ width: `${r.pct}%` }} /></span>
        <span className="ff-bar-num">{daq(r.daqiqa)} / {daq(r.limit)}{r.full ? " ✓" : ""}</span>
      </div>)}
    </div>
    {vaqt.nima?.length > 0 && <ul className="ff-what" aria-label={__kbUi("Bugun nima qildi")}>
      {vaqt.nima.slice(0, 10).map((n, i) => <li key={`${n.turi}-${n.nom}-${i}`}>
        <span aria-hidden="true">{n.turi === "dars" ? "📚" : "🎮"}</span><b>{__kbUi(n.nom || (n.turi === "dars" ? "Dars" : "O‘yin"))}</b>
        <small>{daq(n.daqiqa)}</small></li>)}
    </ul>}
  </div>;
}

/** REV145: 7 kun — ustunni bosing, o'sha kun darslari ochiladi. */
function Hafta({ data, kun, setKun, openKey, setOpenKey }) {
  const darsKunlari = new Map((data.hafta || []).map((d) => [d.sana, d]));
  const vaqtKunlari = new Map(weekStack(data.vaqt?.hafta).map((d) => [d.sana, d]));
  const sanalar = [...new Set([...darsKunlari.keys(), ...vaqtKunlari.keys()])].sort().slice(-7);
  if (!sanalar.length) return <p className="ff-muted">{__kbUi("Hali ma’lumot yo‘q — bir necha kun dars qilgach bu yerda haftalik ko‘rinish chiqadi.")}</p>;
  const top = Math.max(20, ...sanalar.map((s) => (vaqtKunlari.get(s)?.jami ?? darsKunlari.get(s)?.daqiqa ?? 0)));
  const tanlangan = kun && sanalar.includes(kun) ? kun : sanalar[sanalar.length - 1];
  const bugunSana = data.reja?.sana;
  const d = darsKunlari.get(tanlangan) || {};
  const royxat = tanlangan === bugunSana ? (data.bugun || []) : (d.darslar_royxat || []);
  const xulosa = kunXulosa(royxat);
  return <>
    <div className="ff-week" role="tablist" aria-label={__kbUi("Oxirgi 7 kun")}>
      {sanalar.map((s) => {
        const v = vaqtKunlari.get(s), dd = darsKunlari.get(s);
        const dars = v ? v.dars : (dd?.daqiqa || 0), oyin = v ? v.oyin : 0;
        const kunNomi = (v?.kun || dd?.kun || "");
        return <button key={s} type="button" role="tab" aria-selected={s === tanlangan} className={`ff-day ${s === tanlangan ? "is-sel" : ""}`} onClick={() => setKun(s)}
          title={`${s}: ${__kbUi("dars")} ${dars}, ${__kbUi("o‘yin")} ${oyin} ${__kbUi("daq")}`}>
          <span className="ff-stack"><i className="is-oyin" style={{ height: `${Math.round((oyin / top) * 56)}px` }} /><i className="is-dars" style={{ height: `${Math.max(dars + oyin ? 0 : 3, Math.round((dars / top) * 56))}px` }} /></span>
          <small>{__kbUi(kunNomi).slice(0, 2)}</small><b>{dd?.tugatilgan ? `${dd.tugatilgan}✓` : ""}</b>
        </button>;
      })}
    </div>
    <p className="ff-legend"><i className="is-dars" /> {__kbUi("dars")} <i className="is-oyin" /> {__kbUi("o‘yin")}</p>
    <p className="ff-muted">👆 {__kbUi("ustunni bosing — o‘sha kun darslari ochiladi")}</p>
    <div className="ff-daybox">
      <h5>{__kbUi(d.kun || vaqtKunlari.get(tanlangan)?.kun || "")} · {tanlangan}</h5>
      <p className="ff-daystats">
        <span>📚 {xulosa.tugadi}/{xulosa.darslar} {__kbUi("dars tugatildi")}</span>
        {xulosa.foiz !== null && <span>✅ {xulosa.foiz}%</span>}
        {xulosa.sozJami > 0 && <span>📝 {xulosa.sozAytdi}/{xulosa.sozJami} {__kbUi("so‘z aytdi")}</span>}
      </p>
      <DarslarRoyxat list={royxat} openKey={openKey} setOpenKey={setOpenKey} bosh="Bu kuni dars qilinmagan." />
    </div>
  </>;
}

/** REV103: o'rganish ko'rsatkichlari va yosh guruhidagi o'rni. */
function useTahlil(apiBase, token, childId, enabled) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!enabled) return undefined;
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch(`${String(apiBase).replace(/\/+$/, "")}/api/ota/bola_tahlil?${new URLSearchParams({ token, bola_id: childId })}`,
          { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json().catch(() => null);
        if (!stop && res.ok && d) setData(d);
      } catch { /* tahlil ixtiyoriy */ }
    };
    load();
    const id = setInterval(() => { if (document.visibilityState !== "hidden") load(); }, 300000);
    return () => { stop = true; clearInterval(id); };
  }, [apiBase, token, childId, enabled]);
  return data;
}

function Tahlil({ data }) {
  if (!data?.korsatkichlar?.length) return <p className="ff-muted">{__kbUi("Hali ma’lumot kam — bir necha kun dars qilgach ko‘rsatkichlar aniqlashadi.")}</p>;
  const rating = ratingText(data.reyting, data.bola?.guruh);
  return <div className="ff-insight">
    {data.xulosa && <p className="ff-sum">💡 {__kbUi(data.xulosa)}</p>}
    {rating && <p className="ff-rank">🏆 {__kbUi(rating)}</p>}
    <ul>
      {data.korsatkichlar.map((k) => <li key={k.kalit}>
        <span className="ff-k-head"><span aria-hidden="true">{k.emoji}</span><b>{__kbUi(k.nom)}</b>
          <em className={`ff-dots is-${k.daraja}`} aria-label={`${k.daraja} / 5`}>{levelDots(k.daraja)}</em></span>
        <small>{__kbUi(k.matn)}</small>
      </li>)}
    </ul>
    <p className="ff-muted">{__kbUi(data.izoh)}</p>
  </div>;
}

/** REV91/103: ota-ona uchun — farzandning bugungi darslari jonli. REV145: aniq tuzilma — avval 4 ta asosiy raqam,
 *  har biri bosilsa tegishli bo'lim ochiladi; har bir dars ham ochiladi (natija, aytgan so'zlari, uyda nima qilish);
 *  haftada istalgan kunni bosib, o'sha kun darslarini ko'rish mumkin. */
export default function FarzandFaollik({ apiBase, token, childId, onSinov }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [ochiq, setOchiq] = useState(() => new Set(["darslar", "kundalik"]));
  const [openKey, setOpenKey] = useState("");
  const [kun, setKun] = useState("");
  const [reload, setReload] = useState(0);
  const rootRef = useRef(null);
  useEffect(() => {
    let stop = false;
    setData(null); setOpenKey(""); setKun("");
    const load = async () => {
      try {
        const res = await fetch(`${String(apiBase).replace(/\/+$/, "")}/api/ota/bola_faollik?${new URLSearchParams({ token, bola_id: childId })}`,
          { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : "Ma’lumot yuklanmadi");
        if (!stop) { setData(d); setError(""); }
      } catch (e) { if (!stop) setError(e.message); }
    };
    load();
    const id = setInterval(() => { if (document.visibilityState !== "hidden") load(); }, 20000);
    return () => { stop = true; clearInterval(id); };
  }, [apiBase, token, childId, reload]);
  const tahlil = useTahlil(apiBase, token, childId, Boolean(data?.bola?.bogcha));

  // REV167: xato bo'lsa — bo'sh oyna emas, sababi va qayta urinish
  if (error && !data) return <section className="ff-root"><p className="ff-error" role="alert">⚠️ {__kbUi(error)}</p>
    <button type="button" className="ff-today-btn" onClick={() => { setError(""); setData(null); setReload((n) => n + 1); }}>🔄 {__kbUi("Qayta yuklash")}</button></section>;
  if (!data && !error) return <p className="ff-muted" role="status">{__kbUi("Yuklanmoqda…")}</p>;
  if (!data.bola?.bogcha && !data.bugun?.length && !data.hafta?.length) return <section className="ff-root">
    <p className="ff-muted">{__kbUi("Farzandingiz hali dars qilmagan. Birinchi darsdan keyin bu yerda kundalik, baholar va tavsiyalar chiqadi.")}</p></section>;
  const toggle = (id) => setOchiq((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const ochVaBor = (id) => {
    setOchiq((s) => new Set(s).add(id));
    setTimeout(() => rootRef.current?.querySelector(`#ff-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };
  const live = LIVE[data.jonli?.holat] || LIVE.yoq;
  const liveExtra = live.extra(data.jonli || {});
  const bugun = data.bugun || [];
  const vaqt = data.vaqt;
  const x = kunXulosa(bugun, vaqt);
  const fans = Object.entries(data.reja?.fanlar || {});
  const rj = data.reja?.reja && data.reja.reja.manba ? data.reja.reja : null;   // REV162: haftalik reja
  const rejaJami = rj ? (rj.takror_kuni ? 0 : (rj.bugun_rejada || []).length) : Math.max(fans.length, 1) * (data.reja?.limit || 2);
  const kpi = [
    { id: "darslar", emoji: "📚", big: `${x.tugadi}`, unit: __kbUi("dars"), sub: `${__kbUi("reja")}: ${rejaJami}` },
    { id: "darslar", emoji: "✅", big: x.foiz === null ? "—" : `${x.foiz}%`, unit: __kbUi("to‘g‘ri"), sub: x.jami ? `${x.togri}/${x.jami} ${__kbUi("savol")}` : __kbUi("savol yo‘q") },
    { id: "darslar", emoji: "🎤", big: x.sozJami ? `${x.sozAytdi}/${x.sozJami}` : "—", unit: __kbUi("so‘z"), sub: __kbUi("mikrofonga aytdi") },
    { id: "vaqt", emoji: "⏱", big: `${x.daqiqa}`, unit: __kbUi("daqiqa"), sub: x.limit ? `${__kbUi("limit")}: ${daq(x.limit)}` : __kbUi("bugun") },
  ];
  return <section className="ff-root" ref={rootRef} aria-label={__kbUi("Farzandim bugun")}>
    <header className="ff-head">
      <h3>👧 {data.bola?.ism || __kbUi("Farzandingiz")} · {__kbUi("Bugun")}{data.reja?.kun ? `, ${__kbUi(data.reja.kun)}` : ""}</h3>
      <p className={`ff-live ${live.cls}`} role="status"><span aria-hidden="true">{live.emoji}</span>
        <span>{__kbUi(live.text)}{data.jonli?.mavzu && data.jonli?.holat !== "yoq" ? <> — «{data.jonli.mavzu}»</> : null}{liveExtra ? ` · ${liveExtra}` : ""}</span></p>
    </header>

    {data.bola?.bogcha && <BugungiXulosa bugun={bugun} rj={rj} fans={fans} sana={data.reja?.sana} onSinov={onSinov} />}

    {data.bola?.bogcha && <BugungiBaho baho={data.baho_bugun} yulduz={bugun.reduce((n, r) => n + (r.tugadi ? Number(r.yulduz) || 0 : 0), 0)} />}

    {data.kundalik?.daraja && <YutuqQator data={data.kundalik} />}

    <div className="ff-kpis">
      {kpi.map((k, i) => <button key={i} type="button" className="ff-kpi" onClick={() => ochVaBor(k.id)}>
        <span aria-hidden="true">{k.emoji}</span><b>{k.big}</b><em>{k.unit}</em><small>{k.sub}</small>
      </button>)}
    </div>

    <Bolim id="darslar" open={ochiq.has("darslar")} onToggle={toggle} emoji="📚" title="Bugungi darslar"
      summary={bugun.length ? `${x.tugadi}/${bugun.length} ${__kbUi("tugatildi")}` : __kbUi("hali yo‘q")}>
      {rj ? <div className="ff-plan">
        {rj.takror_kuni ? <span>🔁 {__kbUi("Bugun yakshanba — takrorlash kuni")}</span>
          : (rj.bugun_rejada || []).map((k) => { const done = fans.some(([fan, f]) => fanKaliti(fan) === k && f.tugadi > 0);
            return <span key={k} className={done ? "is-full" : ""}>{KURS[k]?.emoji} <b>{__kbUi(KURS[k]?.nom || k)}</b> {done ? "✅" : "⏳"}</span>; })}
      </div> : fans.length > 0 && <div className="ff-plan">
        {fans.map(([fan, f]) => <span key={fan} className={f.tugadi >= data.reja.limit ? "is-full" : ""}>
          <b>{fan || __kbUi("Dars")}</b> {f.tugadi}/{data.reja.limit} {f.tugadi >= data.reja.limit ? "✅" : ""}</span>)}
      </div>}
      <DarslarRoyxat list={bugun} openKey={openKey} setOpenKey={setOpenKey} bosh="Bugun hali dars qilinmagan. Darslar har kuni ochiladi — farzandingiz bilan birga boshlang." />
      {bugun.length > 0 && <p className="ff-muted">{__kbUi("Darsni bosing — natija, aytgan so‘zlari va uyda nima qilish kerakligi ochiladi.")}</p>}
    </Bolim>

    {data.kundalik?.haftalar && <Bolim id="kundalik" open={ochiq.has("kundalik")} onToggle={toggle} emoji="📒" title="Haftalik kundalik"
      summary={`⭐ ${data.kundalik.haftalar[0]?.yulduz || 0} · ${data.kundalik.haftalar[0]?.darslar || 0} ${__kbUi("dars")}`}>
      <BolalarKundaligi haftalar={data.kundalik.haftalar} nomlar={rj?.nomlar} rejim="ota" />
    </Bolim>}

    {data.haftalar?.shu && <Bolim id="haftalar" open={ochiq.has("haftalar")} onToggle={toggle} emoji="📈" title="Shu hafta va o‘tgan hafta"
      summary={data.haftalar.shu.baho ? `🤖 ${data.haftalar.shu.baho.baho} · ${data.haftalar.shu.tugadi} ${__kbUi("dars")}` : `${data.haftalar.shu.tugadi} ${__kbUi("dars")}`}>
      <HaftaTaqqos h={data.haftalar} />
    </Bolim>}

    <Bolim id="hafta" open={ochiq.has("hafta")} onToggle={toggle} emoji="📅" title="Oxirgi 7 kun"
      summary={`${(data.hafta || []).reduce((n, d) => n + (Number(d.tugatilgan) || 0), 0)} ${__kbUi("dars tugatildi")}`}>
      <Hafta data={data} kun={kun} setKun={setKun} openKey={openKey} setOpenKey={setOpenKey} />
    </Bolim>

    {vaqt && <Bolim id="vaqt" open={ochiq.has("vaqt")} onToggle={toggle} emoji="⏱" title="Bugungi vaqt"
      summary={x.limit ? `${daq(x.daqiqa)} / ${daq(x.limit)}` : daq(x.daqiqa)}>
      <BugungiVaqt vaqt={vaqt} />
    </Bolim>}

    {data.bola?.bogcha && <Bolim id="tahlil" open={ochiq.has("tahlil")} onToggle={toggle} emoji="📊" title="O‘rganish tahlili"
      summary={tahlil?.reyting?.jami ? `🏆 ${tahlil.reyting.orin}/${tahlil.reyting.jami}` : ""}>
      <Tahlil data={tahlil} />
    </Bolim>}

    <Bolim id="xabar" open={ochiq.has("xabar")} onToggle={toggle} emoji="🔔" title="Xabarnomalar">
      <p className="ff-muted">{__kbUi("Dars boshlanganda, tugaganda, 5 daqiqa mashq qilinmasa, farzandingiz 5 daqiqa platformadan chiqib ketsa va bugungi vaqti tugaganda xabar keladi (Telegram botga ulangan bo‘lsangiz — Telegramga ham). Ilova farzandingiz qaysi ilovaga o‘tganini ko‘ra olmaydi — faqat platformadan chiqib ketganini biladi.")}</p>
    </Bolim>
  </section>;
}
