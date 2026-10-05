import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { levelDots, minutesText, presence, ratingText, usageRows, weekStack } from "./farzandVaqtRules.js";
import "./farzandFaollik.css";

const LIVE = {
  darsda: { cls: "is-live", emoji: "🟢", text: (s) => `Hozir darsda — «${s.mavzu}»${s.jami_qadam ? ` (${Math.min(s.qadam, s.jami_qadam)}/${s.jami_qadam}-qadam)` : ""}` },
  toxtagan: { cls: "is-pause", emoji: "🟠", text: (s) => `Dars to‘xtab turibdi — «${s.mavzu}», ${s.daqiqa} daqiqadan beri hech narsa bosilmadi` },
  chiqib_ketgan: { cls: "is-away", emoji: "🔴", text: (s) => `Ilovadan chiqib ketgan — ${s.daqiqa} daqiqa. «${s.mavzu}» darsi yarim qoldi` },
  tugatgan: { cls: "is-done", emoji: "✅", text: (s) => `Oxirgi dars tugagan — «${s.mavzu}» (${s.daqiqa} daqiqa oldin)` },
  yoq: { cls: "is-none", emoji: "⚪", text: () => "Bugun hali dars boshlanmagan" },
};

const stars = (n) => (n ? "⭐".repeat(n) + "☆".repeat(Math.max(0, 3 - n)) : "");

/** REV103: bugungi vaqt — dars / erkin o'yin limitga nisbatan, nima qildi, hozir platformadami, 7 kunlik ustunlar. */
function BugungiVaqt({ vaqt }) {
  const rows = usageRows(vaqt);
  if (!rows.length) return null;
  const now = presence(vaqt.hozir, vaqt.tugadi?.jami);
  const week = weekStack(vaqt.hafta);
  return <div className="ff-time-box" aria-label={__kbUi("Bugungi vaqt")}>
    <h4>⏱ {__kbUi("Bugungi vaqt")}</h4>
    <p className={`ff-live ${now.cls}`} role="status"><span aria-hidden="true">{now.emoji}</span>{__kbUi(now.text)}</p>
    <div className="ff-bars">
      {rows.map((r) => <div key={r.key} className={`ff-bar is-${r.key} ${r.full ? "is-full" : ""}`}>
        <span className="ff-bar-name"><span aria-hidden="true">{r.emoji}</span> {__kbUi(r.label)}</span>
        <span className="ff-bar-track" role="progressbar" aria-valuemin={0} aria-valuemax={r.limit} aria-valuenow={Math.min(r.daqiqa, r.limit)}><i style={{ width: `${r.pct}%` }} /></span>
        <span className="ff-bar-num">{__kbUi(minutesText(r.daqiqa))} / {__kbUi(minutesText(r.limit))}{r.full ? " ✓" : ""}</span>
      </div>)}
    </div>
    {vaqt.nima?.length > 0 && <ul className="ff-what" aria-label={__kbUi("Bugun nima qildi")}>
      {vaqt.nima.slice(0, 8).map((n, i) => <li key={`${n.turi}-${n.nom}-${i}`}>
        <span aria-hidden="true">{n.turi === "dars" ? "📚" : "🎮"}</span><b>{__kbUi(n.nom || (n.turi === "dars" ? "Dars" : "O‘yin"))}</b>
        <small>{__kbUi(minutesText(n.daqiqa))}</small></li>)}
    </ul>}
    {week.length > 0 && <div className="ff-week ff-week-time" aria-label={__kbUi("Oxirgi 7 kun: dars va o‘yin")}>
      {week.map((d) => <div key={d.sana} className="ff-day" title={`${d.sana}: ${__kbUi("dars")} ${d.dars} ${__kbUi("daq")}, ${__kbUi("o‘yin")} ${d.oyin} ${__kbUi("daq")}`}>
        <span className="ff-stack"><i className="is-oyin" style={{ height: `${d.oyinPx}px` }} /><i className="is-dars" style={{ height: `${Math.max(d.jami ? 0 : 4, d.darsPx)}px` }} /></span>
        <small>{__kbUi(d.kun).slice(0, 2)}</small><b>{d.jami ? Math.round(d.jami) : ""}</b>
      </div>)}
    </div>}
    {week.length > 0 && <p className="ff-legend"><i className="is-dars" /> {__kbUi("dars")} <i className="is-oyin" /> {__kbUi("o‘yin")} · {__kbUi("daqiqa")}</p>}
  </div>;
}

/** REV103: o'rganish ko'rsatkichlari va yosh guruhidagi o'rni. */
function Tahlil({ apiBase, token, childId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
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
  }, [apiBase, token, childId]);
  if (!data?.korsatkichlar?.length) return null;
  const rating = ratingText(data.reyting, data.bola?.guruh);
  return <div className="ff-insight" aria-label={__kbUi("O‘rganish tahlili")}>
    <h4>📊 {__kbUi("O‘rganish tahlili")}</h4>
    {rating && <p className="ff-rank">🏆 {__kbUi(rating)}</p>}
    <ul>
      {data.korsatkichlar.map((k) => <li key={k.kalit}>
        <span className="ff-k-head"><span aria-hidden="true">{k.emoji}</span><b>{__kbUi(k.nom)}</b>
          <em className={`ff-dots is-${k.daraja}`} aria-label={`${k.daraja} / 5`}>{levelDots(k.daraja)}</em></span>
        <small>{__kbUi(k.matn)}</small>
      </li>)}
    </ul>
    {data.xulosa && <p className="ff-sum">💡 {__kbUi(data.xulosa)}</p>}
    <p className="ff-muted">{__kbUi(data.izoh)}</p>
  </div>;
}

/** REV91: ota-ona uchun — farzandning bugungi darslari jonli: darsdami, chiqib ketdimi, natijasi, haftalik faollik.
 *  REV103: kunlik vaqt (dars / o'yin), nima qildi, platformadami va o'rganish tahlili. */
export default function FarzandFaollik({ apiBase, token, childId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let stop = false;
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
  }, [apiBase, token, childId]);

  if (error && !data) return null;
  if (!data || (!data.bola?.bogcha && !data.bugun?.length && !data.hafta?.length)) return null;
  const live = LIVE[data.jonli?.holat] || LIVE.yoq;
  const fans = Object.entries(data.reja?.fanlar || {});
  const maxMin = Math.max(10, ...data.hafta.map((d) => d.daqiqa));
  const vaqt = data.vaqt;
  const limits = vaqt?.dars && vaqt?.oyin ? `${minutesText(vaqt.dars.limit)} dars + ${minutesText(vaqt.oyin.limit)} erkin o‘yin` : "";
  return <section className="ff-root" aria-label={__kbUi("Farzandim bugun")}>
    <header className="ff-head">
      <h3>📡 {__kbUi("Bugun")} · {__kbUi(data.reja?.kun || "")}</h3>
      <small>{__kbUi(`Kunlik reja: har fandan ${data.reja?.limit || 2} ta yangi dars`)}{limits ? ` · ${__kbUi(`kunlik vaqt: ${limits}`)}` : ""}{data.reja?.dam_olish ? ` · ${__kbUi("dam olish kuni")}` : ""}</small>
    </header>
    {vaqt && <BugungiVaqt vaqt={vaqt} />}
    <h4 className="ff-sub">📚 {__kbUi("Bugungi darslar")}</h4>
    <p className={`ff-live ${live.cls}`} role="status"><span aria-hidden="true">{live.emoji}</span>{__kbUi(live.text(data.jonli))}</p>
    {fans.length > 0 && <div className="ff-plan">
      {fans.map(([fan, f]) => <span key={fan} className={f.tugadi >= data.reja.limit ? "is-full" : ""}>
        <b>{fan || __kbUi("Dars")}</b> {f.tugadi}/{data.reja.limit} {f.tugadi >= data.reja.limit ? "✅" : ""}</span>)}
    </div>}
    {data.bugun.length > 0 ? <ul className="ff-list">
      {data.bugun.map((r, i) => <li key={i} className={r.tugadi ? "is-done" : "is-open"}>
        <span className="ff-time">{r.boshlandi}{r.tugadi ? `–${r.tugadi}` : ""}</span>
        <span className="ff-main"><b>{r.mavzu}</b><small>{r.fan}{r.daqiqa ? ` · ${r.daqiqa} ${__kbUi("daqiqa")}` : ""}{r.chalgish ? ` · ${__kbUi(`${r.chalgish} marta ilovadan chiqdi`)}` : ""}</small></span>
        <span className="ff-res">{r.tugadi ? <>{r.jami ? `${r.togri}/${r.jami} ✓ ` : ""}<em>{stars(r.yulduz)}</em></> : <em className="ff-half">{__kbUi("tugallanmagan")}</em>}</span>
      </li>)}
    </ul> : <p className="ff-muted">{__kbUi("Bugun hali dars qilinmagan. Darslar har kuni ochiladi — farzandingiz bilan birga boshlang.")}</p>}
    {!vaqt?.hafta?.length && data.hafta.length > 0 && <div className="ff-week" aria-label={__kbUi("Oxirgi 7 kun")}>
      {data.hafta.slice().reverse().map((d) => <div key={d.sana} className="ff-day" title={`${d.sana}: ${d.tugatilgan}/${d.darslar}, ${d.daqiqa} daq`}>
        <i style={{ height: `${Math.max(6, Math.round((d.daqiqa / maxMin) * 54))}px` }} className={d.tugatilgan ? "is-on" : ""} />
        <small>{__kbUi(d.kun).slice(0, 2)}</small><b>{d.tugatilgan}</b>
      </div>)}
    </div>}
    {data.bola?.bogcha && <Tahlil apiBase={apiBase} token={token} childId={childId} />}
    <p className="ff-muted">🔔 {__kbUi("Dars boshlanganda, tugaganda, 5 daqiqa mashq qilinmasa, farzandingiz 5 daqiqa platformadan chiqib ketsa va bugungi vaqti tugaganda xabar keladi (Telegram botga ulangan bo‘lsangiz — Telegramga ham). Ilova farzandingiz qaysi ilovaga o‘tganini ko‘ra olmaydi — faqat platformadan chiqib ketganini biladi.")}</p>
  </section>;
}
